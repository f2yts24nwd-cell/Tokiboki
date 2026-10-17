import { sfx, unlock, setMuted, music, setVolumes } from './sound.js';
import { searchItems, nameOf } from './names.js';
import * as A from './art.js';
import { SCENES, H, initialObjects, GLOBAL_DEFS } from './world.js';
import { createMap } from './map.js';
import * as DJ from './dj.js';
import * as Learn from './learn.js';
import { initPlaytime, openParents } from './playtime.js';

const SAVE_KEY = 'kunterbunt-welt-v1';
const DEBUG = location.search.includes('debug');
const FLOOR = 700;
const GRAV = 2600;
const SC = Object.fromEntries(SCENES.map((s) => [s.id, s]));
const SEATS = {};
const PROPS = {};
SCENES.forEach((s) => {
  s.seats.forEach((st) => (SEATS[st.id] = { ...st, sc: s.id }));
  s.props.forEach((p) => (PROPS[p.id] = { ...p, sc: s.id }));
});
const POSE = {
  stand: { ax: 60, ay: 210, r: 0, sit: false },
  sit: { ax: 60, ay: 174, r: 0, sit: true },
  lie: { ax: 60, ay: 150, r: -90, sit: false },
};
POSE.tub = POSE.swing = POSE.slide = POSE.sit;
const HAT_EMOJI = Object.fromEntries(Object.entries(A.HAT_ITEMS).map(([k, v]) => [v, k]));
const GLASS_EMOJI = Object.fromEntries(Object.entries(A.GLASS_ITEMS).map(([k, v]) => [v, k]));

const $ = (s) => document.querySelector(s);
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

let state;
let scale = 1;
let VW = 1200;
const stage = $('#stage');
const sceneEls = {};
const els = new Map();
const drags = new Map();
const falling = new Set();
let pan = null;
let panV = 0;

// ---------------- Speichern / Laden ----------------
function defaultState() {
  const objs = {};
  let n = 1;
  for (const o of initialObjects()) {
    o.id = 'o' + n;
    o.z = n;
    n++;
    objs[o.id] = o;
  }
  const props = {};
  for (const p of Object.values(PROPS)) props[p.id] = { on: !!p.init, open: false };
  const scroll = {};
  SCENES.forEach((s) => (scroll[s.id] = 0));
  return { v: 1, scene: 'haus', scroll, night: false, muted: false, next: n, ztop: n, objs, props, seen: SCENES.map((s) => s.id) };
}

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (s && s.v === 1 && s.objs) {
      for (const p of Object.values(PROPS)) if (!s.props[p.id]) s.props[p.id] = { on: !!p.init, open: false };
      SCENES.forEach((sc) => { if (s.scroll[sc.id] == null) s.scroll[sc.id] = 0; });
      if (!SC[s.scene]) s.scene = 'haus';
      if (!s.seen) s.seen = ['haus', 'cafe', 'markt', 'friseur', 'park'];
      for (const sc of SCENES) {
        if (s.seen.includes(sc.id)) continue;
        for (const o of initialObjects().filter((x) => x.sc === sc.id)) {
          o.id = 'o' + s.next++;
          o.z = ++s.ztop;
          s.objs[o.id] = o;
        }
        s.seen.push(sc.id);
      }
      for (const id in s.objs) if (!SC[s.objs[id].sc]) delete s.objs[id];
      return s;
    }
  } catch (e) { /* kaputter Spielstand → neu starten */ }
  return defaultState();
}

let saveT = null;
function save() {
  clearTimeout(saveT);
  saveT = setTimeout(saveNow, 400);
}
function saveNow() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state, (k, v) => (k.startsWith('_') ? undefined : v)));
  } catch (e) { /* Speicher voll oder privat */ }
}

// ---------------- Aufbau ----------------
function div(cls) {
  const e = document.createElement('div');
  e.className = cls;
  return e;
}
function box(e, x, y, w, h) {
  e.style.left = x + 'px';
  e.style.top = y + 'px';
  if (w != null) e.style.width = w + 'px';
  if (h != null) e.style.height = h + 'px';
}

function buildScene(s) {
  const root = div('scene' + (s.dusk ? ' dusk' : ''));
  root.style.width = s.W + 'px';
  root.innerHTML = '<div class="layer bg"></div><div class="layer props"></div><div class="layer objs"></div><div class="layer fg"></div>' +
    '<div class="layer drag"></div><div class="layer shade"></div><div class="layer glows"></div><div class="layer fx"></div>';
  const L = (n) => root.querySelector('.' + n);
  L('bg').innerHTML = s.bg;
  const propEls = {};
  for (const p of s.props) {
    const e = div('prop k-' + p.kind);
    e.dataset.prop = p.id;
    box(e, p.x, p.y, p.w, p.h);
    e.innerHTML = p.svg;
    L('props').append(e);
    propEls[p.id] = e;
  }
  for (const f of s.fg) {
    const e = div('fgp' + (f.prop ? ' fgtap' : ''));
    if (f.prop) e.dataset.prop = f.prop;
    box(e, f.x, f.y, f.w, f.h);
    e.innerHTML = f.svg;
    L('fg').append(e);
  }
  for (const g of s.glows) {
    const e = div('glow' + (g.prop ? '' : ' lit'));
    box(e, g.x - g.r, g.y - g.r, g.r * 2, g.r * 2);
    if (g.prop) e.dataset.prop = g.prop;
    L('glows').append(e);
  }
  stage.append(root);
  sceneEls[s.id] = { root, objs: L('objs'), drag: L('drag'), fx: L('fx'), glows: L('glows'), propEls };
}

const info = (o) => A.itemInfo(o.k);
const poseOf = (o) => (o.ride ? POSE.sit : o.seat && SEATS[o.seat] ? POSE[SEATS[o.seat].pose] : POSE.stand);

function makeEl(o) {
  const e = document.createElement('div');
  e.dataset.id = o.id;
  if (o.t === 'c') {
    const sit = poseOf(o).sit;
    e.className = 'o c';
    e.innerHTML = `<div class="ci">${A.charSVG(o.look, sit)}<div class="hand"></div></div>`;
    e.style.setProperty('--blink', (Math.random() * 4).toFixed(2) + 's');
    o._sit = sit;
  } else {
    const inf = info(o);
    e.className = 'o i' + (inf.floaty ? ' floaty' : '');
    e.style.width = e.style.height = inf.size + 'px';
    e.innerHTML = `<span style="font-size:${Math.round(inf.size * 0.8)}px;line-height:${inf.size}px">${o.k}</span>`;
  }
  els.set(o.id, e);
  return e;
}

function mount(o) {
  const e = els.get(o.id) || makeEl(o);
  if (o.t === 'i' && o.hold && els.get(o.hold)) els.get(o.hold).querySelector('.hand').append(e);
  else sceneEls[o.sc].objs.append(e);
  place(o);
}

function place(o) {
  const e = els.get(o.id);
  if (!e) return;
  e.style.zIndex = o.z;
  if (o.t === 'i') {
    const s = info(o).size;
    e.style.transform = o.hold ? `translate(${-s / 2}px,${-s * 0.72}px)` : `translate(${o.x - s / 2}px,${o.y - s}px)`;
    return;
  }
  const p = poseOf(o);
  if (p.sit !== o._sit) rerenderChar(o);
  e.classList.toggle('seated', !!o.seat);
  e.style.transformOrigin = `${p.ax}px ${p.ay}px`;
  e.style.transform = `translate(${o.x - p.ax}px,${o.y - p.ay}px)` + (p.r ? ` rotate(${p.r}deg)` : '');
}

function rerenderChar(o) {
  const e = els.get(o.id);
  if (!e) return;
  const sit = poseOf(o).sit;
  const tmp = document.createElement('div');
  tmp.innerHTML = A.charSVG(o.look, sit);
  e.querySelector('svg.cs').replaceWith(tmp.firstElementChild);
  o._sit = sit;
}

function localToWorld(c, lx, ly) {
  const p = poseOf(c);
  const dx = lx - p.ax, dy = ly - p.ay;
  return p.r ? { x: c.x + dy, y: c.y - dx } : { x: c.x + dx, y: c.y + dy };
}

// ---------------- Szene & Scrollen ----------------
function layout() {
  scale = innerHeight / H;
  VW = innerWidth / scale;
  stage.style.width = VW + 'px';
  stage.style.transform = `scale(${scale})`;
  setScroll(state.scroll[state.scene]);
}

function setScroll(v) {
  const s = SC[state.scene];
  v = clamp(v, 0, Math.max(0, s.W - VW));
  state.scroll[state.scene] = v;
  sceneEls[state.scene].root.style.transform = `translateX(${-v}px)`;
}

function clientToWorld(cx, cy) {
  return { x: cx / scale + state.scroll[state.scene], y: cy / scale };
}

function switchScene(id, silent) {
  for (const s of SCENES) sceneEls[s.id].root.classList.toggle('active', s.id === id);
  state.scene = id;
  document.querySelectorAll('.nb.place').forEach((b) => b.classList.toggle('active', b.dataset.target === id));
  setScroll(state.scroll[id]);
  updateStored(id);
  applyWeather();
  if (!silent) {
    toast(SC[id].icon + ' ' + SC[id].name);
    sfx.whoosh();
  }
  save();
}

// ---------------- Zustände der Möbel ----------------
function applyProp(id) {
  const p = PROPS[id];
  const st = state.props[id];
  const e = sceneEls[p.sc].propEls[id];
  e.classList.toggle('on', !!st.on);
  e.classList.toggle('open', !!st.open);
  if (p.kind === 'board') e.dataset.page = st.page || 0;
  sceneEls[p.sc].glows.querySelectorAll(`[data-prop="${id}"]`).forEach((g) => g.classList.toggle('lit', !!st.on));
}

function updateStored(sc) {
  const conts = SC[sc].props.filter((p) => p.kind === 'container');
  for (const o of Object.values(state.objs)) {
    if (o.sc !== sc || (o.t === 'i' && o.hold)) continue;
    let st = false;
    if (!o._dragging) {
      for (const p of conts) {
        const r = p.region;
        if (!state.props[p.id].open && o.x >= r.x1 && o.x <= r.x2 && o.y >= r.y1 && o.y <= r.y2) st = true;
      }
    }
    o._stored = st;
    const e = els.get(o.id);
    if (e) e.classList.toggle('stored', st);
  }
}

// ---------------- Physik ----------------
// Regalbretter in geschlossenen Schränken zählen nur für Dinge, die schon drin liegen.
function surfacesOf(o) {
  return SC[o.sc].surfaces.filter((s) => (!s.items || o.t === 'i') && (!s.c || state.props[s.c].open || (o._cin && o._cin.includes(s.c))));
}

// Liegende Gegenstände sind selbst kleine Ablageflächen (Stapeln).
function stackTops(o) {
  if (o.t !== 'i') return [];
  const res = [];
  for (const b of Object.values(state.objs)) {
    if (b === o || b.t !== 'i' || b.sc !== o.sc || b.hold || b._dragging || b._stored || falling.has(b)) continue;
    const inf = info(b);
    if (inf.floaty || inf.pet || inf.size < 44) continue;
    const hw = inf.size * 0.34;
    res.push({ x1: b.x - hw, x2: b.x + hw, y: Math.round(b.y - inf.size * 0.76), on: b.id });
  }
  return res;
}

// Wie weit darf ein Gegenstand neben der Kante losgelassen werden und trotzdem liegen bleiben?
const xTol = (o) => (o.t === 'i' ? Math.min(22, info(o).size * 0.3) : 6);
const fitsX = (o, s, x = o.x) => x >= s.x1 - xTol(o) && x <= s.x2 + xTol(o);

/** Fläche, auf der ein losgelassenes Objekt landen wird (inkl. „magnetischem“ Einrasten knapp darunter). */
function dropTarget(o) {
  const surf = surfacesOf(o).concat(stackTops(o));
  const snap = o.t === 'i' ? 58 : 26;
  let above = null; // knapp darüber → einrasten
  let below = null; // darunter → hinfallen
  for (const s of surf) {
    if (!fitsX(o, s)) continue;
    if (s.y >= o.y - 2) { if (!below || s.y < below.y) below = s; }
    else if (o.y - s.y <= snap && (!above || s.y > above.y)) above = s;
  }
  const floor = { x1: 0, x2: SC[o.sc].W, y: FLOOR, floor: true };
  // Im Schwimmbecken gehen Gegenstände nicht unter, sie schwimmen oben
  const pool = SC[o.sc].pool;
  if (pool && o.t === 'i' && o.x >= pool.x1 && o.x <= pool.x2 && o.y > 600) return SC[o.sc].surfaces.find((s) => s.items);
  if (!below || below.y > FLOOR) below = floor;
  if (o.y > FLOOR) return floor;
  if (above && (o.y - above.y) <= (below.y - o.y) + (below.floor ? 24 : 0)) return above;
  return below;
}

function snapDrop(o) {
  const t = dropTarget(o);
  if (t.y < o.y) o.y = t.y - 1;
  if (!t.floor) o.x = clamp(o.x, t.x1 + 2, t.x2 - 2);
  place(o);
}

// Liegt etwas noch auf einer Fläche? Sonst fällt es (z. B. wenn das Teil darunter weggenommen wurde).
function supported(o) {
  if (o.y >= FLOOR - 1) return true;
  for (const s of SC[o.sc].surfaces) if (Math.abs(s.y - o.y) <= 2 && fitsX(o, s)) return true;
  for (const s of stackTops(o)) if (Math.abs(s.y - o.y) <= 3 && fitsX(o, s)) return true;
  return false;
}

function checkSupport(sc) {
  for (const o of Object.values(state.objs)) {
    if (o.sc !== sc || o.t !== 'i' || o.hold || o._dragging || falling.has(o) || info(o).floaty) continue;
    if (!supported(o)) startFall(o);
  }
}

function startFall(o, vx = 0, vy = 0) {
  o._vx = vx;
  o._vy = vy;
  o._cin = SC[o.sc].props.filter((p) => p.kind === 'container' && o.x >= p.region.x1 && o.x <= p.region.x2 && o.y >= p.region.y1 && o.y <= p.region.y2 + 4).map((p) => p.id);
  falling.add(o);
}

function stepFalling(dt) {
  for (const o of falling) {
    if (!state.objs[o.id] || o._dragging || o.hold) { falling.delete(o); continue; }
    const W = SC[o.sc].W;
    if (o.t === 'i' && info(o).floaty) {
      const top = SC[o.sc].ceil + info(o).size;
      o.y -= 170 * dt;
      o.x = clamp(o.x + (o._vx || 0) * dt, 30, W - 30);
      if (o.y <= top) {
        o.y = top;
        falling.delete(o);
        save();
      }
      place(o);
      continue;
    }
    o._vy = Math.min(2600, (o._vy || 0) + GRAV * dt);
    const ny = o.y + o._vy * dt;
    let nx = o.x + (o._vx || 0) * dt;
    if (nx < 20 || nx > W - 20) {
      nx = clamp(nx, 20, W - 20);
      o._vx = -(o._vx || 0) * 0.5;
    }
    let landY = null;
    let landS = null;
    if (o._vy > 0) {
      for (const s of surfacesOf(o).concat(stackTops(o))) {
        if (fitsX(o, s, nx) && s.y >= o.y - 2 && s.y <= ny && (landY === null || s.y < landY)) { landY = s.y; landS = s; }
      }
      if (ny >= FLOOR && (landY === null || landY > FLOOR)) { landY = FLOOR; landS = null; }
    }
    o.x = nx;
    if (landY !== null) {
      const speed = o._vy;
      o.y = landY;
      if (landS) o.x = clamp(o.x, landS.x1 + 2, landS.x2 - 2);
      falling.delete(o);
      o._vy = o._vx = 0;
      if (speed > 500) {
        bump(o);
        if (o.sc === state.scene) sfx.land();
      }
      updateStored(o.sc);
      if (o.t === 'c' && landY === FLOOR) intoPool(o);
      save();
    } else {
      o.y = ny;
    }
    place(o);
  }
}

// Wer im Freibad ins Becken fällt, schwimmt.
function intoPool(c) {
  const pool = SC[c.sc].pool;
  if (!pool || c.x < pool.x1 || c.x > pool.x2 || c.seat) return;
  const free = SC[c.sc].seats.filter((st) => st.swim && !occupant(st.id)).sort((a, b) => Math.abs(a.x - c.x) - Math.abs(b.x - c.x))[0];
  if (!free) return;
  sitDown(c, SEATS[free.id]);
  burst(c.sc, c.x, c.y - 60, '💦', 8);
  setMood(c, 'happy', 1500);
}

function bump(o, cls = 'land') {
  const e = els.get(o.id);
  if (!e) return;
  const inner = e.firstElementChild;
  if (o.t === 'c' && inner.classList.contains('swinging')) return;
  inner.classList.remove('land', 'wiggle', 'jump');
  void inner.offsetWidth;
  inner.classList.add(cls);
  setTimeout(() => inner.classList.remove(cls), 600);
}

// ---------------- Figuren: Laune, Sitzen, Halten ----------------
function baseMood(c) {
  return c.seat && SEATS[c.seat] && SEATS[c.seat].pose === 'lie' && state.night ? 'sleep' : '';
}

function setMood(c, mood, ms) {
  const e = els.get(c.id);
  if (!e) return;
  clearTimeout(c._mt);
  e.classList.remove('m-o', 'm-happy', 'm-eat', 'm-sleep');
  const m = mood == null ? baseMood(c) : mood;
  if (m) e.classList.add('m-' + m);
  if (ms) c._mt = setTimeout(() => setMood(c, null), ms);
}

function occupant(seatId) {
  return Object.values(state.objs).find((o) => o.t === 'c' && o.seat === seatId);
}

function swingClass(seat, on, c) {
  const pe = sceneEls[seat.sc].propEls.schaukel;
  pe.classList.remove('swing' + seat.swing);
  const ci = els.get(c.id).querySelector('.ci');
  ci.classList.remove('swinging');
  if (on) {
    void pe.offsetWidth;
    ci.style.setProperty('--sy', 174 - (seat.y - seat.top) + 'px');
    pe.classList.add('swing' + seat.swing);
    ci.classList.add('swinging');
  }
}

function leaveSeat(c) {
  const seat = SEATS[c.seat];
  if (c.order || c.wish) { c.order = null; c.wish = null; const b = sceneEls[c.sc].fx.querySelector(`.order[data-id="${c.id}"]`); if (b) b.remove(); }
  c.seat = null;
  c._slide = null;
  if (seat && seat.toilet && c._pooped) {
    c._pooped = false;
    spawnItem(c.sc, '💩', seat.x, seat.y - 30);
  }
  if (seat && seat.pose === 'swing') swingClass(seat, false, c);
  setMood(c, null);
}

function sitDown(c, seat) {
  c.seat = seat.id;
  c._sitT = performance.now();
  c._pooped = false;
  c.x = seat.x;
  c.y = seat.y;
  falling.delete(c);
  place(c);
  sfx.drop();
  if (seat.pose === 'swing') {
    swingClass(seat, true, c);
    setMood(c, 'happy', 1500);
  } else if (seat.pose === 'slide') {
    setTimeout(() => {
      if (c.seat === seat.id) {
        c._slide = { i: 0, path: seat.path };
        setMood(c, 'happy');
        sfx.whoosh();
      }
    }, 450);
  } else if (seat.pose === 'tub') {
    sfx.splash();
    burst(c.sc, c.x, c.y - 70, '🫧', 6);
  } else {
    setMood(c, null);
  }
  save();
}

function seatFor(c) {
  let best = null;
  let bd = 110;
  for (const st of SC[c.sc].seats) {
    const occ = occupant(st.id);
    if (occ && occ !== c) continue;
    const d = Math.hypot(st.x - c.x, st.y - (c.y - 36));
    if (d < bd) { bd = d; best = st; }
  }
  return best;
}

function trySeat(c) {
  const v = vehicleFor(c);
  if (v) { ride(c, v); return true; }
  let best = null;
  let bd = 110;
  for (const st of SC[c.sc].seats) {
    const occ = occupant(st.id);
    if (occ && occ !== c) continue;
    const d = Math.hypot(st.x - c.x, st.y - (c.y - 36));
    if (d < bd) { bd = d; best = st; }
  }
  if (!best) return false;
  sitDown(c, SEATS[best.id]);
  return true;
}

function stepSlides(dt) {
  for (const c of Object.values(state.objs)) {
    if (!c._slide) continue;
    const sl = c._slide;
    let move = 560 * dt;
    while (move > 0 && sl.i < sl.path.length - 1) {
      const [x2, y2] = sl.path[sl.i + 1];
      const d = Math.hypot(x2 - c.x, y2 - c.y);
      if (d <= move) {
        c.x = x2; c.y = y2; sl.i++; move -= d;
      } else {
        c.x += ((x2 - c.x) / d) * move;
        c.y += ((y2 - c.y) / d) * move;
        move = 0;
      }
    }
    if (sl.i >= sl.path.length - 1) {
      c._slide = null;
      c.seat = null;
      c.y = FLOOR - 4;
      place(c);
      startFall(c, 120, -300);
      setMood(c, 'happy', 1200);
      sfx.boing();
    } else {
      place(c);
    }
  }
}

function handWorld(c) {
  const r = els.get(c.id).querySelector('.hand').getBoundingClientRect();
  return clientToWorld(r.left, r.top);
}

function releaseHeld(c, vx = 0) {
  const it = state.objs[c.holding];
  c.holding = null;
  if (!it) return;
  const p = handWorld(c);
  it.hold = null;
  it.x = p.x;
  it.y = p.y + info(it).size * 0.28;
  it.z = ++state.ztop;
  sceneEls[it.sc].objs.append(els.get(it.id));
  place(it);
  startFall(it, vx, -200);
}

function hold(c, it) {
  if (c.holding && c.holding !== it.id) releaseHeld(c, 160);
  c.holding = it.id;
  it.hold = c.id;
  it.sc = c.sc;
  falling.delete(it);
  els.get(c.id).querySelector('.hand').append(els.get(it.id));
  place(it);
  sfx.pop();
  setMood(c, 'happy', 700);
  save();
}

function charAt(item) {
  const r0 = els.get(item.id).getBoundingClientRect();
  const cx = (r0.left + r0.right) / 2, cy = (r0.top + r0.bottom) / 2;
  let best = null;
  for (const o of Object.values(state.objs)) {
    if (o.t !== 'c' || o.sc !== item.sc || o._stored) continue;
    const r = els.get(o.id).querySelector('svg.cs').getBoundingClientRect();
    if (cx >= r.left - 8 && cx <= r.right + 8 && cy >= r.top - 8 && cy <= r.bottom + 8 && (!best || o.z > best.z)) best = o;
  }
  return best;
}

function newObj(o) {
  o.id = 'o' + state.next++;
  o.z = ++state.ztop;
  state.objs[o.id] = o;
  mount(o);
  return o;
}

function spawnItem(sc, k, x, y, vx = 0, vy = 0) {
  const o = newObj({ t: 'i', sc, k, x, y });
  startFall(o, vx, vy);
  return o;
}

function removeObj(o, fx = true) {
  if (o.t === 'c') {
    if (o.holding && state.objs[o.holding]) {
      const h = state.objs[o.holding];
      delete state.objs[h.id];
      els.delete(h.id);
    }
    if (o.seat) leaveSeat(o);
  } else if (o.hold && state.objs[o.hold]) {
    state.objs[o.hold].holding = null;
  }
  if (fx && o.sc === state.scene) {
    burst(o.sc, o.x, o.y - 50, '💨', 5);
    sfx.poof();
  }
  falling.delete(o);
  delete state.objs[o.id];
  const e = els.get(o.id);
  if (e) e.remove();
  els.delete(o.id);
  checkSupport(o.sc);
  save();
}

function transformItem(o, k) {
  o.k = k;
  const old = els.get(o.id);
  els.delete(o.id);
  const n = makeEl(o);
  if (old) old.replaceWith(n);
  if (old && old.classList.contains('stored')) n.classList.add('stored');
  place(o);
  save();
}

function eat(c, it) {
  const inf = info(it);
  const m = localToWorld(c, 60, 87);
  const e = els.get(it.id);
  delete state.objs[it.id];
  els.delete(it.id);
  e.classList.add('eaten');
  e.style.transform = `translate(${m.x - inf.size / 2}px,${m.y - inf.size / 2}px) scale(.15)`;
  setTimeout(() => e.remove(), 320);
  if (inf.drink) sfx.gulp(); else sfx.chomp();
  setMood(c, 'eat');
  setTimeout(() => {
    if (!state.objs[c.id]) return;
    setMood(c, 'happy', 1200);
    burst(c.sc, m.x, m.y - 40, pick(['❤️', '😋', '✨', '⭐']), 4, 'up');
  }, 750);
  save();
}

function wear(c, it, key, val, map) {
  const old = c.look[key];
  removeObj(it, false);
  c.look[key] = val;
  rerenderChar(c);
  const head = localToWorld(c, 60, 20);
  if (old && old !== val && map[old]) spawnItem(c.sc, map[old], head.x + 40, head.y, 220, -500);
  burst(c.sc, head.x, head.y, '✨', 6);
  sfx.sparkle();
  setMood(c, 'happy', 1200);
  save();
}

function useTool(c, it, tool) {
  const L = c.look;
  const others = (arr, cur) => arr.filter((x) => x !== cur);
  switch (tool) {
    case 'haircut': {
      const st = A.HAIR_STYLES.map((h) => h[0]);
      L.hair = st[(st.indexOf(L.hair) + 1) % st.length];
      sfx.click(); setTimeout(sfx.click, 120); setTimeout(sfx.click, 240);
      break;
    }
    case 'haircolor': L.hc = A.HAIR_COLORS[(A.HAIR_COLORS.indexOf(L.hc) + 1) % A.HAIR_COLORS.length]; sfx.splash(); break;
    case 'shirt': L.style = pick(['tshirt', 'streifen', 'pulli']); L.shirt = pick(others(A.CLOTH_COLORS, L.shirt)); sfx.whoosh(); break;
    case 'dress': L.style = 'kleid'; L.shirt = pick(others(A.CLOTH_COLORS, L.shirt)); sfx.whoosh(); break;
    case 'pants': if (L.style === 'kleid') L.style = 'tshirt'; L.pants = pick(others(A.CLOTH_COLORS, L.pants)); sfx.whoosh(); break;
    case 'shoes': L.shoes = pick(others(A.CLOTH_COLORS, L.shoes)); sfx.whoosh(); break;
    case 'soap': sfx.splash(); break;
  }
  rerenderChar(c);
  const head = localToWorld(c, 60, 60);
  burst(c.sc, head.x, head.y, tool === 'soap' ? '🫧' : '✨', 7);
  if (tool !== 'soap') sfx.sparkle();
  setMood(c, 'happy', 1200);
  // Werkzeug fällt neben die Figur
  it.x = clamp(c.x + 80, 30, SC[c.sc].W - 30);
  startFall(it, 120, -350);
  save();
}

function applyToChar(it, c) {
  const inf = info(it);
  if (it.k === '💩') {
    bubble(c, pick(['Iiih! 🤢', 'Bäh!', 'Igitt! 🤢']));
    setMood(c, 'o', 1200);
    sfx.boing();
    it.x = clamp(c.x + 90, 30, SC[c.sc].W - 30);
    startFall(it, 160, -400);
    return true;
  }
  if (inf.food || inf.drink) { serve(c, it.k); eat(c, it); return true; }
  if (inf.hat) { wear(c, it, 'hat', inf.hat, HAT_EMOJI); return true; }
  if (inf.glasses) { wear(c, it, 'glasses', inf.glasses, GLASS_EMOJI); return true; }
  if (inf.tool) { useTool(c, it, inf.tool); return true; }
  if (canFollow(it)) { befriend(c, it); return true; }
  if (inf.vehicle) return false;
  if (inf.size <= 95 && !inf.floaty) { hold(c, it); return true; }
  return false;
}

// ---------------- Antippen ----------------
function bubble(c, text) {
  const head = localToWorld(c, 60, 0);
  const b = div('bubble');
  b.textContent = text;
  box(b, head.x, head.y - 10);
  sceneEls[c.sc].fx.append(b);
  setTimeout(() => b.remove(), 1500);
}

function tapObj(o) {
  if (o.t === 'c') {
    bump(o, 'jump');
    sfx.talk();
    setMood(o, 'happy', 900);
    bubble(o, Math.random() < 0.3 ? `Ich bin ${ensureName(o)}!` : pick(['Hallo!', 'Hihi!', '😊', '❤️', '🎵', '🌈', '⭐', 'Juhu!', '😋', 'Hey!']));
    return;
  }
  const inf = info(o);
  if (o.k === '🎁' || o.k === '🎈' || (o.k === '🥚' && (o._taps || 0) >= 2)) remember();
  if (o.k === '🎁') {
    transformItem(o, pick(A.GIFT_TOYS));
    burst(o.sc, o.x, o.y - 40, '🎉', 6);
    sfx.sparkle();
    return;
  }
  if (o.k === '🥚') {
    o._taps = (o._taps || 0) + 1;
    bump(o, 'wiggle');
    sfx.click();
    if (o._taps >= 3) {
      transformItem(o, '🐥');
      sfx.hatch();
      burst(o.sc, o.x, o.y - 30, '✨', 5);
    }
    return;
  }
  if (o.k === '🎈') {
    burst(o.sc, o.x, o.y - 40, '💥', 4);
    sfx.pop();
    removeObj(o, false);
    return;
  }
  if (inf.vehicle) {
    driveVehicle(o);
    return;
  }
  bump(o, 'wiggle');
  if (inf.pet) {
    sfx[inf.pet]();
    burst(o.sc, o.x, o.y - inf.size, '❤️', 3, 'up');
  } else if (inf.sound) {
    sfx[inf.sound]();
    if (o.k === '🥁' || o.k === '🎸' || o.k === '🎺') burst(o.sc, o.x, o.y - inf.size, '🎵', 3, 'up');
  } else {
    sfx.pop();
  }
}

function propBump(e, cls = 'bump') {
  e.classList.remove(cls);
  void e.offsetWidth;
  e.classList.add(cls);
  setTimeout(() => e.classList.remove(cls), 600);
}

function tapProp(id) {
  const p = PROPS[id];
  const st = state.props[id];
  const e = sceneEls[p.sc].propEls[id];
  if (!['dj', 'bell', 'confetti', 'swing', 'deco', 'quiz', 'animals', 'dive'].includes(p.kind)) remember();
  switch (p.kind) {
    case 'toggle':
      st.on = !st.on;
      applyProp(id);
      if (p.sound === 'music') music(st.on);
      else if (st.on && p.sound) sfx[p.sound]();
      else sfx.click();
      break;
    case 'container':
      st.open = !st.open;
      applyProp(id);
      sfx.door();
      if (st.open) {
        // Dinge, die drinnen lagen, bleiben auf ihren Regalbrettern liegen
        updateStored(p.sc);
      } else {
        updateStored(p.sc);
      }
      break;
    case 'flush': {
      sfx.flush();
      propBump(e, 'flushing');
      const bowl = p.bowl;
      for (const o of Object.values(state.objs)) {
        if (o.t === 'i' && o.sc === p.sc && !o.hold && !falling.has(o) && Math.abs(o.y - bowl.y) < 1 && o.x >= bowl.x1 && o.x <= bowl.x2) {
          const el = els.get(o.id);
          el.classList.add('flushed');
          delete state.objs[o.id];
          els.delete(o.id);
          setTimeout(() => el.remove(), 900);
        }
      }
      save();
      break;
    }
    case 'spawn': {
      propBump(e);
      if (p.sound) sfx[p.sound]();
      const [fx, fy] = p.from;
      spawnItem(p.sc, pick(p.spawn), fx + rand(-20, 20), fy, rand(-160, 160), -450);
      break;
    }
    case 'tree': {
      propBump(e, 'wig');
      sfx.whoosh();
      const k = pick(p.spawn);
      spawnItem(p.sc, k, p.x + rand(80, 320), p.y + rand(120, 220), rand(-60, 60), 0);
      break;
    }
    case 'swing':
      for (const i of [0, 1]) {
        if (!occupant('park:schaukel' + i)) {
          e.classList.remove('swing' + i);
          void e.offsetWidth;
          e.classList.add('swing' + i);
          setTimeout(() => { if (!occupant('park:schaukel' + i)) e.classList.remove('swing' + i); }, 2200);
        }
      }
      sfx.whoosh();
      break;
    case 'board':
      st.page = ((st.page || 0) + 1) % (e.querySelectorAll('.pg').length || 1);
      applyProp(id);
      sfx.click(); setTimeout(sfx.click, 90); setTimeout(sfx.click, 180);
      burst(p.sc, p.x + p.w / 2, p.y + p.h / 2, '✨', 5);
      break;
    case 'bell': {
      sfx.ring();
      propBump(e, 'ringing');
      for (const c of Object.values(state.objs)) {
        if (c.t !== 'c' || c.sc !== p.sc || c._stored) continue;
        bump(c, 'jump');
        setMood(c, 'happy', 1500);
      }
      const kid = Object.values(state.objs).find((c) => c.t === 'c' && c.sc === p.sc && !c._stored);
      if (kid) bubble(kid, pick(['Pause! 🎉', 'Juhu, Pause!', 'Ding dong! 🔔']));
      break;
    }
    case 'dive': {
      propBump(e, 'wobble');
      const top = SC[p.sc].surfaces.find((s) => s.y === 324);
      const divers = Object.values(state.objs).filter((c) => c.t === 'c' && c.sc === p.sc && !c.seat && !c._dragging && Math.abs(c.y - top.y) < 4 && c.x >= top.x1 - 10 && c.x <= top.x2 + 10);
      if (!divers.length) { sfx.boing(); toast('Stell zuerst eine Figur aufs Sprungbrett!'); break; }
      divers.forEach((c, i) => setTimeout(() => {
        sfx.boing();
        bubble(c, pick(['Arschbombe! 💦', 'Jaaa! 🏊', 'Juhuuu! 🤸']));
        setMood(c, 'happy');
        startFall(c, rand(-520, -380), -900);
        setTimeout(() => sfx.splash(), 900);
      }, i * 400));
      break;
    }
    case 'animals': {
      propBump(e);
      sfx.bell2();
      const pets = Object.values(state.objs).filter((o) => o.t === 'i' && o.sc === p.sc && info(o).pet && !o._stored);
      pets.forEach((o, i) => setTimeout(() => {
        bump(o, 'jump');
        const snd = info(o).pet;
        if (i < 6 && sfx[snd]) sfx[snd]();
        burst(o.sc, o.x, o.y - info(o).size, pick(['❤️', '🎵', '😋']), 1, 'up');
      }, 200 + i * 180));
      const kid = Object.values(state.objs).find((c) => c.t === 'c' && c.sc === p.sc && !c._stored);
      if (kid) bubble(kid, pick(['Fütterungszeit! 🥕', 'Die Tiere haben Hunger! 🍌']));
      break;
    }
    case 'quiz':
      propBump(e);
      openQuiz();
      break;
    case 'dj':
      DJ.open();
      sfx.pop();
      break;
    case 'confetti':
      propBump(e);
      sfx.pop();
      festConfetti(p.sc, p.x + 30, p.y + 10, 40);
      break;
    case 'dryer': {
      e.classList.add('on');
      setTimeout(() => e.classList.remove('on'), 1300);
      sfx.dryer();
      const c = occupant(p.seat);
      if (c) {
        setTimeout(() => {
          c.look.hair = pick(A.HAIR_STYLES.filter((h) => h[0] !== c.look.hair))[0];
          c.look.hc = pick(A.HAIR_COLORS);
          rerenderChar(c);
          const head = localToWorld(c, 60, 40);
          burst(c.sc, head.x, head.y, '✨', 8);
          sfx.sparkle();
          setMood(c, 'happy', 1500);
          save();
        }, 700);
      }
      break;
    }
  }
  save();
}

// ---------------- Festival ----------------
const FEST_COLORS = ['#ff595e', '#ff924c', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93', '#ff6fb5', '#00bbf9'];

function festConfetti(sc, x, y, n = 30) {
  if (sc !== state.scene) return;
  const layer = sceneEls[sc].fx;
  for (let i = 0; i < n; i++) {
    const c = document.createElement('i');
    c.className = 'fconf';
    c.style.background = FEST_COLORS[i % FEST_COLORS.length];
    box(c, x, y);
    c.style.setProperty('--dx', rand(-260, 260) + 'px');
    c.style.setProperty('--dy', rand(-420, -120) + 'px');
    c.style.setProperty('--r', rand(-720, 720) + 'deg');
    c.style.animationDuration = rand(1.4, 2.4) + 's';
    layer.append(c);
    setTimeout(() => c.remove(), 2600);
  }
}

function firework(sc, x, y) {
  if (sc !== state.scene) return;
  const layer = sceneEls[sc].fx;
  const col = pick(FEST_COLORS);
  const fw = div('fw');
  box(fw, x, y);
  for (let i = 0; i < 18; i++) {
    const d = document.createElement('i');
    const a = (i / 18) * Math.PI * 2;
    d.style.background = d.style.color = i % 3 ? col : '#fff8c4';
    d.style.setProperty('--dx', Math.cos(a) * rand(90, 140) + 'px');
    d.style.setProperty('--dy', Math.sin(a) * rand(90, 140) + 'px');
    fw.append(d);
  }
  layer.append(fw);
  setTimeout(() => fw.remove(), 1600);
}

function festFx(fx) {
  const sc = 'festival';
  const root = sceneEls[sc] && sceneEls[sc].root;
  if (!root) return;
  const here = state.scene === sc;
  const view = state.scroll[sc];
  const chars = Object.values(state.objs).filter((o) => o.t === 'c' && o.sc === sc && !o._stored);
  if (fx === 'konfetti') {
    festConfetti(sc, 2035, 600, 40);
    festConfetti(sc, 1300, 440, 40);
    festConfetti(sc, view + VW / 2, 300, 30);
  } else if (fx === 'feuer') {
    for (const id of ['pyroL', 'pyroR']) {
      const e = sceneEls[sc].propEls[id];
      e.classList.add('fire');
      setTimeout(() => e.classList.remove('fire'), 1600);
    }
    if (here) sfx.boom();
  } else if (fx === 'feuerwerk') {
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        firework(sc, view + rand(120, VW - 120), rand(80, 320));
        if (here) sfx.boom();
      }, i * 350);
    }
  } else if (fx === 'laser') {
    root.classList.add('laserfx');
    setTimeout(() => root.classList.remove('laserfx'), 2200);
  }
  if (fx === 'airhorn' || fx === 'siren' || fx === 'feuerwerk') {
    chars.forEach((c, i) => setTimeout(() => { bump(c, 'jump'); setMood(c, 'happy', 1500); }, i * 60));
    if (here && chars.length) bubble(pick(chars), pick(['Juhuuu! 🎉', 'Party! 🥳', 'Lauter! 🔊', 'Wooo! 🙌']));
  }
}

let lastBeat = -1;
function festivalFrame() {
  const fe = sceneEls.festival;
  if (!fe) return;
  const bi = DJ.beatInfo();
  fe.root.classList.toggle('party', !!bi);
  if (!bi) { lastBeat = -1; return; }
  fe.root.style.setProperty('--bpm', bi.bpm);
  const b = Math.floor(bi.beat);
  if (b !== lastBeat) {
    lastBeat = b;
    fe.root.classList.remove('beat');
    void fe.root.offsetWidth;
    fe.root.classList.add('beat');
    if (state.scene === 'festival' && b % 16 === 0) firework('festival', state.scroll.festival + rand(150, VW - 150), rand(90, 260));
  }
}

// ---------------- Effekte ----------------
function burst(sc, x, y, emoji, n = 5, mode = 'out') {
  if (sc !== state.scene) return;
  const layer = sceneEls[sc].fx;
  for (let i = 0; i < n; i++) {
    const s = document.createElement('span');
    s.className = 'fxp ' + mode;
    s.textContent = emoji;
    box(s, x + rand(-20, 20), y + rand(-10, 10));
    s.style.setProperty('--dx', (mode === 'up' ? rand(-30, 30) : rand(-110, 110)) + 'px');
    s.style.setProperty('--dy', (mode === 'up' ? rand(-160, -110) : rand(-130, 30)) + 'px');
    s.style.animationDelay = (mode === 'up' ? i * 0.15 : 0) + 's';
    layer.append(s);
    setTimeout(() => s.remove(), 1600);
  }
}

let tickN = 0;
function tick() {
  tickN++;
  const objs = Object.values(state.objs);
  for (const s of SCENES) {
    for (const z of s.zones) {
      const on = z.prop ? state.props[z.prop].on : false;
      if (z.kind === 'cook' && on) {
        for (const o of objs) {
          if (o.t === 'i' && o.sc === s.id && !o.hold && !o._dragging && !falling.has(o) && A.COOK[o.k] && o.x >= z.x1 && o.x <= z.x2 && Math.abs(o.y - z.y) < 1) {
            o._cook = (o._cook || 0) + 0.5;
            if (o._cook % 1 === 0) burst(s.id, o.x, o.y - 40, '💨', 1, 'up');
            if (o._cook >= 3) {
              o._cook = 0;
              transformItem(o, A.COOK[o.k]);
              if (s.id === state.scene) { sfx.sizzle(); sfx.sparkle(); }
              burst(s.id, o.x, o.y - 40, '✨', 5);
            }
          }
        }
      }
      if (z.kind === 'cold' && !state.props[z.prop].open) {
        for (const o of objs) {
          if (o.t === 'i' && o._stored && o.sc === s.id && A.COLD[o.k]) {
            o._cold = (o._cold || 0) + 0.5;
            if (o._cold >= 8) { o._cold = 0; transformItem(o, A.COLD[o.k]); }
          }
        }
      }
      if (z.kind === 'learn' && s.id === state.scene) {
        for (const id of z.seats) {
          const c = occupant(id);
          if (c && Math.random() < 0.12) burst(s.id, c.x + 50, c.y - 190, pick(['✏️', '📖', '💡', '✋', '⭐', '🤔', '✅']), 1, 'up');
        }
      }
      if (z.kind === 'desk') {
        const c = occupant(z.seat);
        if (c && !on) { state.props[z.prop].on = true; applyProp(z.prop); }
        if (c && s.id === state.scene) {
          if (Math.random() < 0.35) burst(s.id, c.x + 90, c.y - 200, pick(['💬', '📊', '✅', '💡', '⌨️', '📧']), 1, 'up');
          if (Math.random() < 0.5) sfx.click();
        }
      }
      if (z.kind === 'rain' && on && s.id === state.scene) {
        for (const o of objs) {
          if (o.t === 'c' && o.sc === s.id && !o.seat && !o._dragging && !o._stored && o.x >= z.x1 && o.x <= z.x2) {
            if (Math.random() < 0.6) burst(s.id, o.x + rand(-50, 50), o.y - 190, pick(['💧', '💦', '🫧']), 1, 'up');
            if (tickN % 6 === 0) setMood(o, 'happy', 1500);
          }
        }
      }
      if (z.kind === 'bath') {
        for (const id of z.seats) {
          const c = occupant(id);
          if (c && s.id === state.scene && Math.random() < (on ? 0.7 : 0.25)) burst(s.id, c.x + rand(-60, 60), c.y - 70, '🫧', 1, 'up');
        }
      }
    }
  }
  const now = performance.now();
  for (const c of objs) {
    if (c.t !== 'c' || !c.seat || c._pooped || !SEATS[c.seat] || !SEATS[c.seat].toilet) continue;
    if (c._sitT == null) c._sitT = now;
    if (now - c._sitT > 3000) {
      c._pooped = true;
      if (c.sc === state.scene) {
        sfx.plop();
        bubble(c, pick(['Plumps! 💩', 'Puh! 💩', 'Fertig! 💩']));
        setMood(c, 'happy', 1500);
      }
    }
  }
  const sc = state.scene;
  checkSupport(sc);
  dayCycle(false);
  weatherTick();
  gameTick();
  if (state.props.radio.on && sc === 'haus' && tickN % 2 === 0) burst('haus', 680, 220, pick(['🎵', '🎶']), 1, 'up');
  for (const o of objs) {
    if (o.sc !== sc) continue;
    if (o.t === 'c' && state.night && o.seat === 'haus:bett' && tickN % 4 === 0) burst(sc, o.x - 90, o.y - 60, '💤', 1, 'up');
    if (o.t === 'i' && !o.hold && !o._dragging && !o._stored && !falling.has(o) && info(o).pet && !info(o).floaty && !o._walk && Math.random() < 0.05) {
      startFall(o, rand(-170, 170), -560);
    }
  }
}

// ---------------- Eingabe ----------------
function isDragged(o) {
  for (const d of drags.values()) if (d.o === o) return true;
  return false;
}

stage.addEventListener('pointerdown', (e) => {
  unlock();
  const oe = e.target.closest('.o');
  if (oe) {
    const o = state.objs[oe.dataset.id];
    if (o && !isDragged(o)) {
      e.preventDefault();
      drags.set(e.pointerId, { o, sx: e.clientX, sy: e.clientY, lx: e.clientX, ly: e.clientY, active: false, auto: 0 });
      return;
    }
  }
  if (!pan) {
    const pe = e.target.closest('.prop, .fgtap');
    const t = performance.now();
    pan = { id: e.pointerId, sx: e.clientX, start: state.scroll[state.scene], prop: pe ? pe.dataset.prop : null, moved: false, lx: e.clientX, lt: t, v: 0 };
    panV = 0;
  }
});

window.addEventListener('pointermove', (e) => {
  const d = drags.get(e.pointerId);
  if (d) {
    d.lx = e.clientX;
    d.ly = e.clientY;
    if (!d.active) {
      if (Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < 10) return;
      beginDrag(d);
    }
    moveDrag(d);
    return;
  }
  if (pan && pan.id === e.pointerId) {
    const dx = e.clientX - pan.sx;
    if (!pan.moved && Math.abs(dx) > 10) pan.moved = true;
    if (pan.moved) {
      setScroll(pan.start - dx / scale);
      const t = performance.now();
      const dt = t - pan.lt;
      if (dt > 0) pan.v = 0.7 * (((pan.lx - e.clientX) / scale / dt) * 1000) + 0.3 * pan.v;
      pan.lx = e.clientX;
      pan.lt = t;
    }
  }
}, { passive: false });

function pointerEnd(e, cancelled) {
  unlock();
  const d = drags.get(e.pointerId);
  if (d) {
    drags.delete(e.pointerId);
    if (d.active) endDrag(d, d.lx, d.ly);
    else if (!cancelled) tapObj(d.o);
    return;
  }
  if (pan && pan.id === e.pointerId) {
    if (!pan.moved && pan.prop && !cancelled) tapProp(pan.prop);
    else if (pan.moved) panV = performance.now() - pan.lt < 90 ? pan.v : 0;
    pan = null;
    save();
  }
}
window.addEventListener('pointerup', (e) => pointerEnd(e, false));
window.addEventListener('pointercancel', (e) => pointerEnd(e, true));

function beginDrag(d) {
  const o = d.o;
  if (!d.fromDrawer) remember();
  d.active = true;
  o._dragging = true;
  o._stored = false;
  if (o.t === 'i' && o.hold) {
    const c = state.objs[o.hold];
    const r = els.get(o.id).getBoundingClientRect();
    const p = clientToWorld((r.left + r.right) / 2, r.bottom);
    if (c) c.holding = null;
    o.hold = null;
    o.x = p.x;
    o.y = p.y;
  }
  if (o.t === 'c' && o.seat) leaveSeat(o);
  if (o.t === 'c' && o.ride) o.ride = null;
  if (o.t === 'i') { o._drive = null; o._fly = null; }
  falling.delete(o);
  o._vx = o._vy = 0;
  if (o.t === 'i') checkSupport(o.sc);
  const w = clientToWorld(d.sx, d.sy);
  if (o.t === 'c') { d.ox = 0; d.oy = 120; } else { d.ox = o.x - w.x; d.oy = o.y - w.y; }
  o.z = ++state.ztop;
  const e = els.get(o.id);
  e.classList.remove('stored');
  sceneEls[o.sc].drag.append(e);
  e.classList.add('dragging');
  if (o.t === 'c') setMood(o, 'o');
  sfx.pick();
  nav.classList.add('dropmode');
  place(o);
}

function moveDrag(d) {
  const o = d.o;
  const w = clientToWorld(d.lx, d.ly);
  o.x = clamp(w.x + d.ox, 10, SC[o.sc].W - 10);
  o.y = clamp(w.y + d.oy, 40, H + 60);
  place(o);
  const edge = 80;
  d.auto = d.lx < edge ? -(edge - d.lx) * 10 : d.lx > innerWidth - edge ? (d.lx - (innerWidth - edge)) * 10 : 0;
  const t = navTargetAt(d.lx, d.ly);
  document.querySelectorAll('.nb[data-target]').forEach((b) => b.classList.toggle('hover', b.dataset.target === t));
  showDropHint(t ? null : o);
}

// Vorschau beim Ziehen: Wo landet das Ding?
const dropLine = div('dropline');
const dropRing = div('dropring');
let hintChar = null;
function showDropHint(o) {
  let line = null, ring = null, ch = null;
  if (o) {
    if (o.t === 'c') {
      const st = seatFor(o);
      if (st) ring = { x: st.x, y: st.y };
      else line = dropTarget(o);
    } else {
      ch = charAt(o);
      if (!ch || !(info(o).food || info(o).drink || info(o).hat || info(o).glasses || info(o).tool || o.k === '💩' || (info(o).size <= 95 && !info(o).floaty))) ch = null;
      if (!ch && !info(o).floaty) line = dropTarget(o);
    }
  }
  if (hintChar !== ch) {
    if (hintChar && els.get(hintChar.id)) els.get(hintChar.id).classList.remove('target');
    if (ch) els.get(ch.id).classList.add('target');
    hintChar = ch;
  }
  if (line) {
    const half = o.t === 'i' ? info(o).size * 0.5 : 50;
    const x1 = line.floor ? o.x - half : Math.max(line.x1, o.x - half - 20);
    const x2 = line.floor ? o.x + half : Math.min(line.x2, o.x + half + 20);
    box(dropLine, x1, line.y - 3, Math.max(24, x2 - x1));
    sceneEls[o.sc].drag.append(dropLine);
    dropLine.classList.toggle('stack', !!line.on);
  } else dropLine.remove();
  if (ring) {
    box(dropRing, ring.x - 45, ring.y - 24);
    sceneEls[o.sc].drag.append(dropRing);
  } else dropRing.remove();
}

function endDrag(d, cx, cy) {
  const o = d.o;
  const e = els.get(o.id);
  o._dragging = false;
  e.classList.remove('dragging');
  showDropHint(null);
  if (![...drags.values()].some((x) => x.active)) nav.classList.remove('dropmode');
  document.querySelectorAll('.nb.hover').forEach((b) => b.classList.remove('hover'));
  if (d.fromDrawer) closeDrawer();
  const target = navTargetAt(cx, cy);
  sceneEls[o.sc].objs.append(e);
  if (target === 'trash') { removeObj(o); return; }
  if (target && SC[target]) {
    if (target !== o.sc) moveToScene(o, target);
    else { o.x = state.scroll[o.sc] + VW / 2 + rand(-100, 100); o.y = 200; startFall(o); }
    return;
  }
  if (d.fromDrawer && Math.hypot(cx - d.sx, cy - d.sy) < 10) {
    o.x = state.scroll[o.sc] + VW / 2 + rand(-120, 120);
    o.y = 160;
    place(o);
    startFall(o);
    sfx.pop();
    return;
  }
  if (o.t === 'c') {
    setMood(o, null);
    if (trySeat(o)) return;
  } else {
    const c = charAt(o);
    if (c && applyToChar(o, c)) return;
    const pet = (info(o).food || info(o).drink) && petAt(o);
    if (pet) { feedPet(pet, o); return; }
  }
  sfx.drop();
  autoOpen(o);
  snapDrop(o);
  startFall(o);
  save();
}

// Wird etwas in einen geschlossenen Schrank gezogen, geht die Tür von selbst auf.
function autoOpen(o) {
  for (const p of SC[o.sc].props) {
    if (p.kind !== 'container' || state.props[p.id].open) continue;
    const r = p.region;
    if (o.x >= r.x1 && o.x <= r.x2 && o.y >= r.y1 && o.y <= r.y2 + 10) {
      state.props[p.id].open = true;
      applyProp(p.id);
      updateStored(o.sc);
      sfx.door();
    }
  }
}

function moveToScene(o, target) {
  o.sc = target;
  if (o.t === 'c' && o.holding && state.objs[o.holding]) state.objs[o.holding].sc = target;
  o.x = state.scroll[target] + VW / 2 + rand(-80, 80);
  o.y = o.t === 'c' ? 320 : 220;
  sceneEls[target].objs.append(els.get(o.id));
  switchScene(target);
  place(o);
  startFall(o);
}

// ---------------- Leiste unten ----------------
const nav = $('#nav');
const places = $('#places');
for (const s of SCENES) {
  const b = document.createElement('button');
  b.className = 'nb place';
  b.dataset.target = s.id;
  b.innerHTML = `<b>${s.iconHTML || s.icon}</b><i>${s.short || s.name}</i>`;
  b.addEventListener('click', () => { unlock(); if (state.scene !== s.id) switchScene(s.id); });
  places.append(b);
}

function navTargetAt(x, y) {
  for (const b of document.querySelectorAll('.nb[data-target]')) {
    const r = b.getBoundingClientRect();
    if (x >= r.left - 6 && x <= r.right + 6 && y >= r.top - 10 && y <= r.bottom + 10) return b.dataset.target;
  }
  return null;
}

let toastT = null;
function toast(text) {
  const t = $('#toast');
  t.textContent = text;
  t.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove('show'), 1400);
}

// Kiste (Gegenstände)
const drawer = $('#drawer');
let drawerTab = 0;
function drawerCats() {
  const cats = A.DRAWER.slice();
  const won = Learn.unlockedItems();
  if (won.length) cats.push(['⭐', 'Belohnungen', won]);
  cats.push(['⏱️', 'Zuletzt', (state.recent || []).slice()]);
  cats.push(['🔍', 'Suchen', null]);
  return cats;
}
function allDrawerItems() {
  return [...new Set(A.DRAWER.flatMap((c) => c[2]).concat(Learn.unlockedItems()))];
}
function addRecent(k) {
  state.recent = [k, ...(state.recent || []).filter((x) => x !== k)].slice(0, 24);
}
function renderDrawer() {
  const cats = drawerCats();
  if (drawerTab >= cats.length) drawerTab = 0;
  const tabs = drawer.querySelector('.tabs');
  tabs.innerHTML = '';
  cats.forEach(([icon, name], i) => {
    const b = document.createElement('button');
    b.className = 'tab' + (i === drawerTab ? ' sel' : '') + (i >= cats.length - 2 ? ' mini' : '');
    b.innerHTML = `<b>${icon}</b><i>${name}</i>`;
    b.addEventListener('click', () => { drawerTab = i; sfx.click(); renderDrawer(); });
    tabs.append(b);
  });
  const cat = cats[drawerTab];
  const searching = !cat[2];
  drawer.querySelector('.dsearch').classList.toggle('hidden', !searching);
  renderDrawerGrid();
  if (searching) setTimeout(() => $('#dSearch').focus(), 50);
}
function renderDrawerGrid() {
  const cat = drawerCats()[drawerTab];
  let list = cat[2];
  let empty = '';
  if (!list) {
    const q = $('#dSearch').value;
    list = searchItems(q, allDrawerItems());
    empty = q.trim() ? 'Nichts gefunden 🤔' : 'Tippe oben ein, was du suchst';
  } else if (!list.length) empty = 'Hier erscheinen die Sachen, die du zuletzt benutzt hast';
  const grid = drawer.querySelector('.grid');
  grid.innerHTML = list.length ? list.map((k) => `<div class="di" data-k="${k}" title="${nameOf(k)}">${k}</div>`).join('') : `<p class="dempty">${empty}</p>`;
}
$('#dSearch').addEventListener('input', renderDrawerGrid);
function openDrawer() {
  closeModals();
  renderDrawer();
  drawer.classList.remove('hidden', 'ghost');
  sfx.pop();
}
function closeDrawer() {
  drawer.classList.add('hidden');
  drawer.classList.remove('ghost');
}
drawer.querySelector('.grid').addEventListener('pointerdown', (e) => {
  const di = e.target.closest('.di');
  if (!di) return;
  unlock();
  e.preventDefault();
  const k = di.dataset.k;
  remember();
  addRecent(k);
  const size = A.itemInfo(k).size;
  const w = clientToWorld(e.clientX, e.clientY);
  const o = newObj({ t: 'i', sc: state.scene, k, x: w.x, y: w.y + size / 2 });
  const d = { o, sx: e.clientX, sy: e.clientY, lx: e.clientX, ly: e.clientY, active: false, auto: 0, fromDrawer: true };
  drags.set(e.pointerId, d);
  beginDrag(d);
  d.ox = 0;
  d.oy = size / 2;
  drawer.classList.add('ghost');
});
$('#bKiste').addEventListener('click', () => {
  unlock();
  if (drawer.classList.contains('hidden')) openDrawer(); else closeDrawer();
});
$('#drawerClose').addEventListener('click', closeDrawer);

// Tag/Nacht
function applyNight() {
  stage.classList.toggle('night', state.night);
  $('#bNight b').textContent = state.night ? '☀️' : '🌙';
  $('#bNight i').textContent = state.night ? 'Tag' : 'Nacht';
  for (const o of Object.values(state.objs)) if (o.t === 'c') setMood(o, null);
}
$('#bNight').addEventListener('click', () => {
  unlock();
  if (state.cycle !== 'off') { state.cycle = 'off'; toast('Tag & Nacht: jetzt von Hand'); }
  state.night = !state.night;
  applyNight();
  sfx.sparkle();
  save();
});

// Mülleimer antippen erklärt sich
$('#bTrash').addEventListener('click', () => toast('Zum Wegwerfen hierher ziehen 🗑️'));

// ---------------- Figuren & Editor ----------------
const figList = $('#figList');
const editor = $('#editor');
let editing = null;

function closeModals() {
  document.querySelectorAll('.modal').forEach((m) => m.classList.add('hidden'));
}
document.querySelectorAll('.modal').forEach((m) =>
  m.addEventListener('click', (e) => { if (e.target === m) { closeModals(); sfx.click(); } }));
document.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => { closeModals(); sfx.click(); }));

function miniSVG(look, viewBox, size) {
  return A.charSVG(look, false).replace('viewBox="0 0 120 210" width="120" height="210"', `viewBox="${viewBox}" width="${size}" height="${size}"`);
}

function openFigList() {
  closeDrawer();
  closeModals();
  const g = figList.querySelector('.figs');
  const chars = Object.values(state.objs).filter((o) => o.t === 'c');
  g.innerHTML = chars.map((c) => `<button class="fig" data-id="${c.id}">${miniSVG(c.look, '-10 -40 140 260', 96)}<i>${SC[c.sc].iconHTML || SC[c.sc].icon}</i><em>${escapeHTML(ensureName(c))}</em></button>`).join('') +
    '<button class="fig new" data-new="1"><b>＋</b><i>Neue Figur</i></button>';
  figList.classList.remove('hidden');
  sfx.pop();
}
figList.querySelector('.figs').addEventListener('click', (e) => {
  const b = e.target.closest('.fig');
  if (!b) return;
  if (b.dataset.new) {
    remember();
    const c = newObj({ t: 'c', sc: state.scene, x: state.scroll[state.scene] + VW / 2, y: 300, look: A.randomLook(), seat: null });
    startFall(c);
    burst(c.sc, c.x, c.y - 100, '✨', 8);
    sfx.sparkle();
    openEditor(c);
    return;
  }
  const c = state.objs[b.dataset.id];
  if (!c) return;
  if (c.sc !== state.scene) switchScene(c.sc, true);
  setScroll(c.x - VW / 2);
  openEditor(c);
});
$('#bFig').addEventListener('click', () => { unlock(); openFigList(); });

const ED_ROWS = [
  { key: 'skin', label: 'Haut', colors: A.SKINS },
  { key: 'hair', label: 'Frisur', opts: A.HAIR_STYLES, vb: '-12 -40 144 150' },
  { key: 'hc', label: 'Haarfarbe', colors: A.HAIR_COLORS.concat(A.HAIR_COLORS_EXTRA) },
  { key: 'eyes', label: 'Augen', colors: A.EYE_COLORS },
  { key: 'style', label: 'Kleidung', opts: A.SHIRT_STYLES, vb: '0 80 120 130' },
  { key: 'shirt', label: 'Oberteil', colors: A.CLOTH_COLORS },
  { key: 'pants', label: 'Hose', colors: A.CLOTH_COLORS },
  { key: 'shoes', label: 'Schuhe', colors: A.CLOTH_COLORS },
  { key: 'hat', label: 'Hut', opts: A.HATS.concat(A.HATS_EXTRA), vb: '-12 -46 144 150' },
  { key: 'glasses', label: 'Brille', opts: A.GLASSES.concat(A.GLASSES_EXTRA), vb: '10 30 100 70' },
  { key: 'extra', label: 'Extras', opts: A.EXTRAS, vb: '-40 -40 200 270' },
];

function renderEditor() {
  const c = editing;
  editor.querySelector('.ed-prev').innerHTML = miniSVG(c.look, '-14 -40 148 256', 260);
  const box = editor.querySelector('.ed-opts');
  box.innerHTML = ED_ROWS.map((r) => {
    const cur = c.look[r.key] || '';
    const lock = (v) => {
      const rw = Learn.rewardFor(r.key, v);
      return rw && !Learn.isUnlocked(rw.id) ? ` locked" data-lock="${rw.id}` : '';
    };
    const swBg = (col) => (col === 'rainbow' ? 'linear-gradient(135deg,#ff595e,#ffca3a,#8ac926,#1982c4,#6a4c93)' : col);
    const items = r.colors
      ? r.colors.map((col) => `<button class="sw${col === cur ? ' sel' : ''}${lock(col)}" data-k="${r.key}" data-v="${col}" style="background:${swBg(col)}"></button>`).join('')
      : r.opts.map(([v, name]) => `<button class="opt${v === cur ? ' sel' : ''}${lock(v)}" data-k="${r.key}" data-v="${v}" title="${name}">${miniSVG({ ...c.look, [r.key]: v }, r.vb, 58)}</button>`).join('');
    return `<div class="row"><span class="lbl">${r.label}</span><div class="items">${items}</div></div>`;
  }).join('');
}

editor.querySelector('.ed-opts').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-k]');
  if (!b || !editing) return;
  if (b.dataset.lock) {
    sfx.boing();
    toast('🔒 Mit Vokabeln freischalten!');
    closeModals();
    Learn.open('shop');
    return;
  }
  remember();
  editing.look[b.dataset.k] = b.dataset.v;
  rerenderChar(editing);
  renderEditor();
  sfx.pop();
  save();
});
$('#edRandom').addEventListener('click', () => {
  if (!editing) return;
  remember();
  editing.look = A.randomLook();
  rerenderChar(editing);
  renderEditor();
  sfx.sparkle();
  save();
});

const escapeHTML = (t) => String(t).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
$('#edName').addEventListener('input', (e) => {
  if (!editing) return;
  editing.name = e.target.value.trim().slice(0, 14);
  save();
});
$('#edName').addEventListener('keydown', (e) => { if (e.key === 'Enter') e.target.blur(); });

function openEditor(c) {
  closeModals();
  editing = c;
  $('#edName').value = ensureName(c);
  renderEditor();
  editor.classList.remove('hidden');
}

// ---------------- Einstellungen ----------------
const settings = $('#settings');
function renderSettings() {
  $('#sSound').textContent = state.muted ? '🔇 Ton ist aus' : '🔊 Ton ist an';
  $('#vMusic').value = state.vol.music;
  $('#vSfx').value = state.vol.sfx;
  $('#vVoice').value = state.vol.voice;
  document.querySelectorAll('#sCycle button').forEach((b) => b.classList.toggle('sel', b.dataset.v === state.cycle));
  $('#sLite').textContent = state.lite ? '🐢 Spar-Modus: an' : '🐇 Spar-Modus: aus';
}
function applyVolumes() {
  setVolumes({ music: state.vol.music / 100, sfx: state.vol.sfx / 100 });
}
$('#bSet').addEventListener('click', () => {
  unlock();
  closeDrawer();
  closeModals();
  renderSettings();
  $('#resetAsk').classList.add('hidden');
  settings.classList.remove('hidden');
});
$('#sSound').addEventListener('click', () => {
  state.muted = !state.muted;
  setMuted(state.muted);
  if (!state.muted) unlock();
  if (state.props.radio.on && !state.muted) music(true);
  renderSettings();
  sfx.pop();
  save();
});
for (const [id, key] of [['#vMusic', 'music'], ['#vSfx', 'sfx'], ['#vVoice', 'voice']]) {
  $(id).addEventListener('input', (e) => {
    state.vol[key] = +e.target.value;
    applyVolumes();
    save();
  });
  $(id).addEventListener('change', () => (key === 'sfx' ? sfx.pop() : null));
}
$('#sCycle').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  state.cycle = b.dataset.v;
  state.cycleT = Date.now();
  dayCycle(true);
  renderSettings();
  sfx.click();
  save();
});
$('#sLite').addEventListener('click', () => {
  state.lite = !state.lite;
  document.body.classList.toggle('lite', !!state.lite);
  renderSettings();
  sfx.click();
  save();
});
$('#sTut').addEventListener('click', openTutorial);
$('#sTime').addEventListener('click', () => { closeModals(); openParents(true); });
$('#sClean').addEventListener('click', () => { closeModals(); cleanScene(state.scene); toast('🧹 Aufgeräumt!'); });
$('#sExport').addEventListener('click', exportSave);
$('#sImport').addEventListener('click', () => $('#sImportFile').click());
$('#sImportFile').addEventListener('change', (e) => { if (e.target.files[0]) importSave(e.target.files[0]); e.target.value = ''; });
$('#tutNext').addEventListener('click', () => {
  sfx.pop();
  if (tutI < TUT.length - 1) { tutI++; renderTut(); } else endTutorial();
});
$('#tutSkip').addEventListener('click', () => { sfx.click(); endTutorial(); });
$('#bUndo').addEventListener('click', undo);

// Tag & Nacht automatisch: alle 5 Minuten (3½ Tag, 1½ Nacht) oder nach der echten Uhr
function dayCycle(force) {
  let night = state.night;
  if (state.cycle === 'clock') {
    const h = new Date().getHours();
    night = h >= 20 || h < 7;
  } else if (state.cycle === 'game') {
    const t = ((Date.now() - (state.cycleT || 0)) / 1000) % 300;
    night = t >= 210;
  } else return;
  if (night !== state.night || force) {
    if (night !== state.night) {
      state.night = night;
      applyNight();
      if (!force) toast(night ? '🌙 Gute Nacht!' : '☀️ Guten Morgen!');
      save();
    }
  }
}
$('#sReset').addEventListener('click', () => $('#resetAsk').classList.remove('hidden'));
$('#sResetNo').addEventListener('click', () => $('#resetAsk').classList.add('hidden'));
$('#sResetYes').addEventListener('click', () => {
  localStorage.removeItem(SAVE_KEY);
  music(false);
  location.reload();
});
$('#rotateOk').addEventListener('click', () => document.body.classList.add('rotate-ok'));

function mountAll() {
  const all = Object.values(state.objs);
  for (const c of all) {
    if (c.t !== 'c') continue;
    if (c.holding && (!state.objs[c.holding] || state.objs[c.holding].hold !== c.id)) c.holding = null;
    if (c.seat && (!SEATS[c.seat] || SEATS[c.seat].sc !== c.sc)) c.seat = null;
    if (c.seat && SEATS[c.seat].pose === 'slide') { c.seat = null; c.y = 600; }
    if (c.ride && (!state.objs[c.ride] || !info(state.objs[c.ride]).vehicle)) c.ride = null;
    mount(c);
  }
  for (const o of all) {
    if (o.t !== 'i') continue;
    if (o.hold && (!state.objs[o.hold] || state.objs[o.hold].holding !== o.id)) {
      if (state.objs[o.hold]) { o.x = state.objs[o.hold].x; o.y = 300; }
      o.hold = null;
    }
    mount(o);
  }
  state.props.radio.on = false;
  Object.keys(PROPS).forEach(applyProp);
  // Alte Spielstände: Gegenstände, deren Fläche sich verschoben hat, wieder obenauf legen
  for (const o of all) {
    if (o.t !== 'i' || o.hold || info(o).floaty || supported(o)) continue;
    const up = SC[o.sc].surfaces.filter((s) => fitsX(o, s) && s.y < o.y && o.y - s.y <= 60).sort((a, b) => b.y - a.y)[0];
    if (up) { o.y = up.y; place(o); }
  }
  for (const o of all) {
    if (o.t === 'c' && o.seat && SEATS[o.seat].pose === 'swing') swingClass(SEATS[o.seat], true, o);
    if (!o.hold && !o.seat && !o.ride) startFall(o);
  }
  SCENES.forEach((s) => updateStored(s.id));
}

// ---------------- Wetter (draußen) ----------------
const WX = ['sun', 'rain', 'snow', 'rainbow'];
const WX_ICON = { sun: '☀️', rain: '🌧️', snow: '❄️', rainbow: '🌈' };
const WX_NAME = { sun: 'Sonne', rain: 'Regen', snow: 'Schnee', rainbow: 'Regenbogen' };
function initWeather() {
  let rain = '';
  let snow = '';
  for (let i = 0; i < 46; i++) rain += `<path d='M${(i * 73) % 300} ${(i * 131) % 300} l-5 20' stroke='rgba(225,238,255,.8)' stroke-width='2' stroke-linecap='round'/>`;
  for (let i = 0; i < 30; i++) snow += `<circle cx='${(i * 97) % 300}' cy='${(i * 59) % 300}' r='${2.5 + (i % 3) * 1.6}' fill='white' opacity='.92'/>`;
  const uri = (t) => `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'>${t}</svg>`)}")`;
  const arcs = ['#ff595e', '#ff924c', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93'].map((c, i) => `<path d="M${60 + i * 22} 520 A${440 - i * 22} ${440 - i * 22} 0 0 1 ${940 - i * 22} 520" fill="none" stroke="${c}" stroke-width="24" opacity=".55"/>`).join('');
  const w = div('');
  w.id = 'weather';
  w.innerHTML = '<div class="wxl rain"></div><div class="wxl rain r2"></div><div class="wxl snow"></div><div class="wxl snow s2"></div>' +
    `<svg class="rainbow" viewBox="0 0 1000 520" preserveAspectRatio="xMidYMax meet">${arcs}</svg>`;
  w.querySelectorAll('.rain').forEach((e) => (e.style.backgroundImage = uri(rain)));
  w.querySelectorAll('.snow').forEach((e) => (e.style.backgroundImage = uri(snow)));
  document.body.append(w);
}
function applyWeather() {
  const w = state.weather || 'sun';
  const out = !!SC[state.scene].outdoor;
  document.body.dataset.wx = w;
  document.body.classList.toggle('wx-out', out);
  for (const sc of SCENES) sceneEls[sc.id].root.classList.toggle('wx-snow', !!sc.outdoor && w === 'snow');
  $('#bWeather').classList.toggle('hidden', !out);
  $('#bWeather b').textContent = WX_ICON[w];
}
$('#bWeather').addEventListener('click', () => {
  unlock();
  remember();
  state.weather = WX[(WX.indexOf(state.weather || 'sun') + 1) % WX.length];
  applyWeather();
  toast(WX_ICON[state.weather] + ' ' + WX_NAME[state.weather]);
  if (state.weather === 'rain') sfx.rain(); else sfx.sparkle();
  save();
});
function weatherTick() {
  const w = state.weather || 'sun';
  const sc = SC[state.scene];
  if (!sc.outdoor || w === 'sun' || Math.random() > 0.06) return;
  const kids = Object.values(state.objs).filter((o) => o.t === 'c' && o.sc === sc.id && !o.seat && !o.ride && !o._dragging);
  if (!kids.length) return;
  const c = pick(kids);
  const umbrella = c.holding && state.objs[c.holding] && state.objs[c.holding].k === '☂️';
  const say = {
    rain: umbrella ? ['Gut, dass ich einen Schirm hab! ☂️', 'Plitsch platsch! 💦'] : ['Huch, ich werd nass! 💦', 'Hat wer einen Schirm? ☂️', 'Brr! 🌧️'],
    snow: ['Schnee! ⛄', 'Juhu, Schneeballschlacht! ❄️', 'Brr, ist das kalt! 🧣'],
    rainbow: ['Ein Regenbogen! 🌈', 'Wie schön! 🌈'],
  }[w];
  bubble(c, pick(say));
  setMood(c, w === 'rain' && !umbrella ? 'o' : 'happy', 1200);
}

// ---------------- Haustiere folgen ihrer Figur ----------------
const canFollow = (o) => o.t === 'i' && info(o).pet && !info(o).floaty && !['🐠', '🐬', '🐳'].includes(o.k);
function befriend(c, it) {
  it.follow = c.id;
  it.x = clamp(c.x - 90, 30, SC[c.sc].W - 30);
  place(it);
  startFall(it, 0, -420);
  bubble(c, pick(['Komm mit! 🐾', 'Mein Freund! ❤️', 'Wir gehen spazieren! 🐾']));
  burst(c.sc, it.x, it.y - 60, '❤️', 5, 'up');
  const snd = info(it).pet;
  if (sfx[snd]) sfx[snd]();
  setMood(c, 'happy', 1500);
  save();
}
function stepPets(dt) {
  const byOwner = {};
  for (const o of Object.values(state.objs)) {
    if (!o.follow) continue;
    const c = state.objs[o.follow];
    if (!c || c.t !== 'c') { o.follow = null; continue; }
    const k = (byOwner[c.id] = (byOwner[c.id] || 0) + 1) - 1;
    if (o._dragging || o.hold || falling.has(o) || o._stored) continue;
    const e = els.get(o.id);
    if (!e) continue;
    if (c.sc !== o.sc) {
      o.sc = c.sc;
      sceneEls[o.sc].objs.append(e);
      o.x = clamp(c.x - 100, 30, SC[o.sc].W - 30);
      o.y = 300;
      place(o);
      startFall(o);
      continue;
    }
    const side = c.x >= o.x ? -1 : 1;
    const tx = clamp(c.x + side * (80 + k * 60), 30, SC[o.sc].W - 30);
    const dx = tx - o.x;
    if (Math.abs(dx) > 16) {
      o.x += Math.sign(dx) * Math.min(Math.abs(dx) * 3, 340) * dt;
      o._walk = true;
      e.classList.add('walk');
      e.classList.toggle('flip', dx > 0);
      place(o);
      if (!supported(o)) startFall(o);
    } else if (o._walk) {
      o._walk = false;
      e.classList.remove('walk');
      save();
    }
  }
}
function petAt(it) {
  let best = null;
  let bd = 70;
  for (const o of Object.values(state.objs)) {
    if (o === it || o.t !== 'i' || o.sc !== it.sc || !info(o).pet || o.hold) continue;
    const d = Math.hypot(o.x - it.x, o.y - info(o).size / 2 - (it.y - info(it).size / 2));
    if (d < bd) { bd = d; best = o; }
  }
  return best;
}
function feedPet(pet, food) {
  const e = els.get(food.id);
  delete state.objs[food.id];
  els.delete(food.id);
  e.classList.add('eaten');
  e.style.transform = `translate(${pet.x - 20}px,${pet.y - info(pet).size * 0.6}px) scale(.15)`;
  setTimeout(() => e.remove(), 320);
  sfx.chomp();
  setTimeout(() => {
    if (!state.objs[pet.id]) return;
    bump(pet, 'jump');
    const snd = info(pet).pet;
    if (sfx[snd]) sfx[snd]();
    burst(pet.sc, pet.x, pet.y - info(pet).size, '❤️', 4, 'up');
  }, 400);
  save();
}

// ---------------- Fahrzeuge ----------------
const riderOf = (v) => Object.values(state.objs).find((o) => o.t === 'c' && o.ride === v.id);
function vehicleFor(c) {
  for (const v of Object.values(state.objs)) {
    if (v.t !== 'i' || v.sc !== c.sc || !info(v).vehicle || v.hold || v._dragging) continue;
    const r = riderOf(v);
    if (r && r !== c) continue;
    const sz = info(v).size;
    if (Math.abs(c.x - v.x) < sz * 0.55 && c.y > v.y - sz - 130 && c.y < v.y + 50) return v;
  }
  return null;
}
function seatOffset(v) {
  const sz = info(v).size;
  const bike = ['🚲', '🛴', '🛵'].includes(v.k);
  return { dx: (v._dir || -1) * sz * (bike ? 0.02 : 0.1), dy: bike ? sz * 0.5 : sz * 0.36 };
}
function posRider(c, v) {
  const off = seatOffset(v);
  c.x = v.x + off.dx;
  c.y = v.y - off.dy;
  if (v._fly) c.y = v.y - off.dy;
  place(c);
}
function ride(c, v) {
  c.ride = v.id;
  c.seat = null;
  falling.delete(c);
  c.z = ++state.ztop;
  v.z = ++state.ztop;
  place(v);
  posRider(c, v);
  setMood(c, 'happy', 1500);
  sfx.honk();
  bubble(c, pick(['Tschüss! 👋', 'Los geht\'s! 🚀', 'Brumm brumm! 🚗', 'Anschnallen! 😎']));
  save();
}
function driveVehicle(v) {
  const W = SC[v.sc].W;
  const sz = info(v).size;
  if (v.k === '🚀') {
    v._fly = { t: 0, x0: v.x, y0: v.y };
    falling.delete(v);
    sfx.rocket();
    return;
  }
  if (v.k === '🛸') {
    v._fly = { t: 0, x0: v.x, y0: v.y, ufo: true, tx: clamp(v.x + rand(-500, 500), sz, W - sz) };
    falling.delete(v);
    sfx.laser();
    return;
  }
  let dir = v._dir || -1;
  if ((dir < 0 && v.x < sz + 40) || (dir > 0 && v.x > W - sz - 40)) dir = -dir;
  v._dir = dir;
  v._drive = { left: clamp(rand(500, 800), 0, W) };
  const e = els.get(v.id);
  e.classList.toggle('flip', dir > 0);
  e.classList.add('driving');
  sfx.engine();
  setTimeout(sfx.honk, 300);
}
function stepVehicles(dt) {
  for (const v of Object.values(state.objs)) {
    if (v.t !== 'i' || !info(v).vehicle) continue;
    if (v._dragging || v.hold) { v._drive = null; }
    if (v._drive) {
      const W = SC[v.sc].W;
      const sz = info(v).size;
      const step = 420 * dt;
      v.x += v._dir * step;
      v._drive.left -= step;
      if (v.x < sz / 2 || v.x > W - sz / 2 || v._drive.left <= 0) {
        v.x = clamp(v.x, sz / 2, W - sz / 2);
        v._drive = null;
        const e = els.get(v.id);
        if (e) e.classList.remove('driving');
        save();
      }
      place(v);
      if (!supported(v) && !falling.has(v)) startFall(v, v._dir * 200, 0);
      if (v.sc === state.scene && Math.random() < 0.08) burst(v.sc, v.x - v._dir * sz * 0.5, v.y - 20, '💨', 1, 'up');
    }
    if (v._fly) {
      const f = v._fly;
      f.t += dt;
      if (f.ufo) {
        const k = Math.min(1, f.t / 2.4);
        v.x = f.x0 + (f.tx - f.x0) * (0.5 - Math.cos(k * Math.PI) / 2);
        v.y = f.y0 - Math.sin(k * Math.PI) * 260 + Math.sin(f.t * 9) * 8;
        if (k >= 1) { v.y = f.y0; v._fly = null; startFall(v); save(); }
      } else {
        // Rakete: hoch hinaus, kurz weg, dann sanft zurück
        if (f.t < 1.4) v.y = f.y0 - Math.pow(f.t, 2.2) * 520;
        else if (f.t < 2.2) v.y = -400;
        else if (f.t < 3.6) v.y = f.y0 - (1 - (f.t - 2.2) / 1.4) * 700;
        else { v.y = f.y0; v._fly = null; startFall(v); bump(v); sfx.land(); save(); }
        if (f.t < 1.4 && v.sc === state.scene && Math.random() < 0.5) burst(v.sc, v.x, v.y + 10, pick(['🔥', '💨', '✨']), 1, 'out');
      }
      place(v);
    }
  }
  for (const c of Object.values(state.objs)) {
    if (c.t !== 'c' || !c.ride) continue;
    const v = state.objs[c.ride];
    if (!v || c._dragging) { c.ride = null; if (!c._dragging) startFall(c); continue; }
    if (v.sc !== c.sc) {
      c.sc = v.sc;
      sceneEls[c.sc].objs.append(els.get(c.id));
    }
    if (c.z >= v.z) { v.z = ++state.ztop; place(v); }
    posRider(c, v);
  }
}

// ---------------- Fotos & Album ----------------
const FRAMES = ['weiss', 'holz', 'gold', 'regenbogen', 'polaroid'];
const STICKERS = ['⭐', '❤️', '🌈', '🦄', '😎', '🎉', '✨', '🌸', '👑', '🐶', '😂', '🔥'];
function takePhoto() {
  unlock();
  const sc = state.scene;
  const ids = new Set();
  const objs = [];
  for (const o of Object.values(state.objs)) {
    if (o.sc !== sc || o._stored) continue;
    if (o.t === 'i' && o.hold && state.objs[o.hold]) continue;
    const copy = JSON.parse(JSON.stringify(o, (k, v) => (k.startsWith('_') ? undefined : v)));
    if (o.t === 'c' && o.holding && state.objs[o.holding]) copy.heldK = state.objs[o.holding].k;
    objs.push(copy);
    ids.add(o.id);
  }
  const props = {};
  for (const p of SC[sc].props) props[p.id] = { ...state.props[p.id] };
  const ph = { id: 'p' + Date.now(), ts: Date.now(), sc, scroll: state.scroll[sc], VW, night: !!state.night, wx: SC[sc].outdoor ? state.weather || 'sun' : 'sun', objs, props, frame: 'weiss', stickers: [] };
  state.photos = [ph, ...(state.photos || [])].slice(0, 12);
  save();
  const f = $('#flash');
  f.classList.remove('go');
  void f.offsetWidth;
  f.classList.add('go');
  sfx.shutter();
  for (const o of Object.values(state.objs)) if (o.t === 'c' && o.sc === sc && !o._stored && Math.random() < 0.7) setTimeout(() => { setMood(o, 'happy', 1400); bump(o, 'jump'); }, 120);
  const ab = $('#bAlbum');
  ab.classList.remove('hidden', 'got');
  void ab.offsetWidth;
  ab.classList.add('got');
  toast('📸 Foto im Album!');
}

function renderPhoto(ph, w) {
  const k = w / ph.VW;
  const frame = div('pshot');
  frame.style.width = w + 'px';
  frame.style.height = Math.round(H * k) + 'px';
  const inner = div('pinner' + (ph.night ? ' night' : ''));
  inner.style.width = ph.VW + 'px';
  inner.style.height = H + 'px';
  inner.style.transform = `scale(${k})`;
  const root = sceneEls[ph.sc].root.cloneNode(true);
  root.classList.add('active');
  root.classList.remove('party', 'beat', 'laserfx');
  root.classList.toggle('wx-snow', ph.wx === 'snow');
  root.style.transform = `translateX(${-ph.scroll}px)`;
  for (const l of root.querySelectorAll('.layer.objs, .layer.drag, .layer.fx')) l.innerHTML = '';
  for (const [id, st] of Object.entries(ph.props)) {
    const pe = root.querySelector(`.prop[data-prop="${id}"]`);
    if (pe) {
      pe.classList.toggle('on', !!st.on);
      pe.classList.toggle('open', !!st.open);
      pe.classList.remove('swing0', 'swing1');
      if (st.page != null) pe.dataset.page = st.page;
    }
    root.querySelectorAll(`.glow[data-prop="${id}"]`).forEach((g) => g.classList.toggle('lit', !!st.on));
  }
  const layer = root.querySelector('.layer.objs');
  for (const o of ph.objs) {
    const e = document.createElement('div');
    e.style.zIndex = o.z;
    if (o.t === 'c') {
      const pose = o.ride ? POSE.sit : o.seat && SEATS[o.seat] ? POSE[SEATS[o.seat].pose] : POSE.stand;
      e.className = 'o c';
      e.innerHTML = `<div class="ci">${A.charSVG(o.look, pose.sit)}<div class="hand">${o.heldK ? `<div class="o i" style="width:${A.itemInfo(o.heldK).size}px;height:${A.itemInfo(o.heldK).size}px;transform:translate(${-A.itemInfo(o.heldK).size / 2}px,${-A.itemInfo(o.heldK).size * 0.72}px)"><span style="font-size:${Math.round(A.itemInfo(o.heldK).size * 0.8)}px;line-height:${A.itemInfo(o.heldK).size}px">${o.heldK}</span></div>` : ''}</div></div>`;
      e.style.transformOrigin = `${pose.ax}px ${pose.ay}px`;
      e.style.transform = `translate(${o.x - pose.ax}px,${o.y - pose.ay}px)` + (pose.r ? ` rotate(${pose.r}deg)` : '');
      if (ph.night && o.seat && SEATS[o.seat] && SEATS[o.seat].pose === 'lie') e.classList.add('m-sleep');
      else e.classList.add('m-happy');
    } else {
      const inf = A.itemInfo(o.k);
      e.className = 'o i';
      e.style.width = e.style.height = inf.size + 'px';
      e.style.transform = `translate(${o.x - inf.size / 2}px,${o.y - inf.size}px)`;
      e.innerHTML = `<span style="font-size:${Math.round(inf.size * 0.8)}px;line-height:${inf.size}px">${o.k}</span>`;
    }
    layer.append(e);
  }
  inner.append(root);
  if (SC[ph.sc].outdoor && ph.wx !== 'sun') inner.insertAdjacentHTML('beforeend', `<div class="pwx pwx-${ph.wx}"></div>`);
  frame.append(inner);
  return frame;
}

function photoCard(ph, w) {
  const card = div('pcard frame-' + (ph.frame || 'weiss'));
  card.dataset.id = ph.id;
  card.append(renderPhoto(ph, w));
  const st = div('pst');
  for (const s of ph.stickers || []) {
    const e = document.createElement('span');
    e.textContent = s.e;
    e.style.left = s.x + '%';
    e.style.top = s.y + '%';
    e.style.fontSize = Math.round(w * 0.09) + 'px';
    st.append(e);
  }
  card.append(st);
  const d = new Date(ph.ts);
  card.insertAdjacentHTML('beforeend', `<i class="pdate">${SC[ph.sc].icon} ${d.getDate()}.${d.getMonth() + 1}.</i>`);
  return card;
}

function openAlbum() {
  unlock();
  closeDrawer();
  closeModals();
  const g = $('#album .photos');
  g.innerHTML = '';
  const list = state.photos || [];
  if (!list.length) g.innerHTML = '<p class="dempty">Noch keine Fotos. Tippe oben auf 📸!</p>';
  for (const ph of list) g.append(photoCard(ph, 250));
  $('#album').classList.remove('hidden');
  sfx.pop();
}
$('#album .photos').addEventListener('click', (e) => {
  const c = e.target.closest('.pcard');
  if (c) openPhoto(c.dataset.id);
});

let viewing = null;
function openPhoto(id) {
  viewing = (state.photos || []).find((p) => p.id === id);
  if (!viewing) return;
  closeModals();
  renderPhotoView();
  $('#photoView').classList.remove('hidden');
  sfx.pop();
}
function renderPhotoView() {
  const box = $('#photoView .pv-img');
  box.innerHTML = '';
  const w = Math.min(innerWidth - 120, 760);
  box.append(photoCard(viewing, w));
  $('#photoView .pv-stickers').innerHTML =
    `<div class="pvrow">${FRAMES.map((f) => `<button class="pvframe frame-${f}${viewing.frame === f ? ' sel' : ''}" data-frame="${f}"></button>`).join('')}</div>` +
    `<div class="pvrow">${STICKERS.map((s) => `<button class="pvst" data-st="${s}">${s}</button>`).join('')}</div>`;
}
$('#photoView .pv-stickers').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b || !viewing) return;
  if (b.dataset.frame) viewing.frame = b.dataset.frame;
  if (b.dataset.st) {
    viewing.stickers = (viewing.stickers || []).concat({ e: b.dataset.st, x: rand(4, 86), y: rand(4, 80) }).slice(-12);
    sfx.pop();
  } else sfx.click();
  save();
  renderPhotoView();
});
$('#photoView .pv-img').addEventListener('click', (e) => {
  // Sticker antippen = wieder abziehen
  const sp = e.target.closest('.pst span');
  if (!sp || !viewing) return;
  const i = [...sp.parentNode.children].indexOf(sp);
  viewing.stickers.splice(i, 1);
  sfx.whoosh();
  save();
  renderPhotoView();
});
$('#pvBack').addEventListener('click', openAlbum);
$('#pvDel').addEventListener('click', () => {
  if (!viewing) return;
  state.photos = state.photos.filter((p) => p !== viewing);
  viewing = null;
  sfx.poof();
  save();
  openAlbum();
});
$('#pvSave').addEventListener('click', async () => {
  if (!viewing) return;
  toast('⏳ Einen Moment …');
  try {
    const blob = await photoPNG(viewing);
    const name = `tokiboki-foto-${viewing.id.slice(1)}.png`;
    const file = new File([blob], name, { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: 'Tokiboki-Foto' });
    } else {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = name;
      document.body.append(a);
      a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    }
    toast('💾 Gespeichert!');
  } catch (err) {
    if (err && err.name === 'AbortError') return;
    if (DEBUG) console.warn('photoPNG', err && (err.message || err.type || err));
    toast('😕 Geht hier nicht – mach einfach ein Bildschirmfoto!');
  }
});
let cssText = null;
async function photoPNG(ph) {
  if (!cssText) cssText = await (await fetch('style.css')).text();
  const W0 = Math.round(ph.VW);
  const [pa, pb] = { holz: [16, 16], gold: [16, 16], regenbogen: [14, 14], polaroid: [12, 48] }[ph.frame] || [10, 10];
  const cw = W0 + pa * 2;
  const chh = H + pa + pb;
  const card = photoCard(ph, W0);
  card.classList.add('export');
  card.querySelectorAll('image').forEach((im) => im.remove());
  const html = new XMLSerializer().serializeToString(card);
  const defs = new XMLSerializer().serializeToString($('#gdefs'));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${cw}" height="${chh}"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml">${defs}<style><![CDATA[${cssText.replace(/]]>/g, '')}]]></style>${html}</div></foreignObject></svg>`;
  const img = new Image();
  await new Promise((res, rej) => {
    img.onload = res;
    img.onerror = rej;
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });
  const cv = document.createElement('canvas');
  cv.width = cw;
  cv.height = chh;
  cv.getContext('2d').drawImage(img, 0, 0);
  return await new Promise((res, rej) => cv.toBlob((b) => (b ? res(b) : rej(new Error('leer'))), 'image/png'));
}
$('#bPhoto').addEventListener('click', takePhoto);
$('#bAlbum').addEventListener('click', openAlbum);

// ---------------- Mini-Spiele: Café-Bestellungen & Friseur-Wünsche ----------------
const CAFE_MENU = ['☕', '🥐', '🍰', '🧁', '🍩', '🍪', '🧃', '🥛'];
const COLOR_NAMES = { '#3b2416': 'braune', '#111111': 'schwarze', '#f2c94c': 'blonde', '#c8501e': 'rote', '#ff7eb6': 'rosa', '#4f8cff': 'blaue', '#9b5de5': 'lila', '#2ec4b6': 'türkise', '#eeeeee': 'weiße' };
function games() {
  if (!state.games) state.games = { cafe: 0, friseur: 0, quiz: 0 };
  return state.games;
}
function seatOf(c) {
  return c.seat && SEATS[c.seat];
}
function orderBubble(c) {
  const fx = sceneEls[c.sc].fx;
  let b = fx.querySelector(`.order[data-id="${c.id}"]`);
  const want = c.order || c.wish;
  if (!want || c._stored) { if (b) b.remove(); return; }
  if (!b) {
    b = div('order');
    b.dataset.id = c.id;
    fx.append(b);
  }
  if (c.order) b.innerHTML = `<small>Bestellung</small>${c.order.map((k) => `<span>${k}</span>`).join('')}`;
  else {
    const w = c.wish;
    const prev = w.key === 'hc' ? `<i class="sw" style="background:${w.value === 'rainbow' ? 'linear-gradient(135deg,#ff595e,#ffca3a,#8ac926,#1982c4)' : w.value}"></i>` :
      miniSVG({ ...c.look, hair: w.value, hat: '' }, '-12 -40 144 150', 54);
    b.innerHTML = `<small>${w.key === 'hc' ? 'Ich möchte ' + (COLOR_NAMES[w.value] || 'diese') + ' Haare!' : 'Ich möchte diese Frisur!'}</small>${prev}`;
  }
  const head = localToWorld(c, 60, -10);
  box(b, head.x, head.y);
}
function clearWant(c) {
  c.order = null;
  c.wish = null;
  orderBubble(c);
}
function gameTick() {
  for (const c of Object.values(state.objs)) {
    if (c.t !== 'c') continue;
    const st = seatOf(c);
    if ((c.order && (!st || !st.order)) || (c.wish && (!st || !st.wish))) { clearWant(c); continue; }
    if (st && c.sc === state.scene && !c.order && !c.wish) {
      if (st.order && Math.random() < 0.12) {
        c.order = Array.from({ length: Math.random() < 0.5 ? 1 : 2 }, () => pick(CAFE_MENU));
        bubble(c, pick(['Ich hätte gern …', 'Hallo! Bestellung bitte!', 'Hunger! 😋']));
        sfx.ding();
      } else if (st.wish && Math.random() < 0.12) {
        c.wish = Math.random() < 0.5
          ? { key: 'hc', value: pick(A.HAIR_COLORS.filter((x) => x !== c.look.hc)) }
          : { key: 'hair', value: pick(A.HAIR_STYLES.filter((h) => h[0] !== c.look.hair))[0] };
        sfx.ding();
      }
    }
    if (c.wish && c.look[c.wish.key] === c.wish.value) {
      clearWant(c);
      games().friseur++;
      celebrate(c, '💇 Wunsch erfüllt!', games().friseur);
    }
    if (c.order || c.wish) orderBubble(c);
  }
}
function celebrate(c, text, n) {
  bubble(c, pick(['Danke! 😍', 'Super, danke!', 'Perfekt! ⭐', 'Lecker! 😋']));
  setMood(c, 'happy', 2000);
  bump(c, 'jump');
  burst(c.sc, c.x, c.y - 200, pick(['⭐', '🪙', '💖']), 8);
  festConfetti(c.sc, c.x, c.y - 160, 26);
  sfx.coin();
  setTimeout(sfx.sparkle, 200);
  toast(`${text} (${n})`);
  save();
}
// wird beim Essen aufgerufen: Gehört das zur Bestellung?
function serve(c, k) {
  if (!c.order) return;
  const i = c.order.indexOf(k);
  if (i < 0) { setTimeout(() => bubble(c, 'Das hab ich gar nicht bestellt 😄'), 900); return; }
  c.order.splice(i, 1);
  if (!c.order.length) {
    c.order = null;
    orderBubble(c);
    games().cafe++;
    setTimeout(() => celebrate(c, '☕ Bestellung erledigt!', games().cafe), 800);
  } else orderBubble(c);
}

// ---------------- Mini-Spiel: Schul-Quiz der 4A ----------------
let quiz = null;
function openQuiz() {
  unlock();
  closeDrawer();
  closeModals();
  const qs = [];
  for (const w of Learn.randomWords(3)) {
    const others = Learn.randomWords(6).map((x) => x.de).filter((d) => d !== w.de);
    qs.push({ q: `Was heißt <b>„${w.en}“</b>?`, emo: '🇬🇧', say: w.en, right: w.de, opts: [w.de, ...others.slice(0, 2)].sort(() => Math.random() - 0.5) });
  }
  for (let k = 0; k < 2; k++) {
    const a = 2 + Math.floor(Math.random() * 8), b = 2 + Math.floor(Math.random() * 8);
    const r = a * b;
    const opts = new Set([r]);
    while (opts.size < 3) opts.add(r + pick([-a, a, -b, b, 1, -1, 10]));
    qs.push({ q: `Wie viel ist <b>${a} · ${b}</b>?`, emo: '🧮', right: String(r), opts: [...opts].map(String).sort(() => Math.random() - 0.5) });
  }
  quiz = { qs: qs.sort(() => Math.random() - 0.5), i: 0, ok: 0 };
  renderQuiz();
  $('#quiz').classList.remove('hidden');
  sfx.ring();
}
function renderQuiz() {
  const c = $('#quiz .quizc');
  if (quiz.i >= quiz.qs.length) {
    const ok = quiz.ok;
    const stars = ok === 5 ? 2 : ok >= 3 ? 1 : 0;
    if (stars) Learn.addStars(stars);
    const nb = ok === 5 ? Learn.checkBadges(['quiz']) : [];
    games().quiz = Math.max(games().quiz, ok);
    save();
    $('#bLearn .nbadge').textContent = '⭐' + Learn.stars();
    c.innerHTML = `<h2>${ok === 5 ? 'Klassenbeste! 🏆' : ok >= 3 ? 'Gut gemacht! 👏' : 'Übung macht den Meister! 🌱'}</h2>
      <p class="qbig">${ok} von 5 richtig</p>${stars ? `<p class="qstar">+${stars} ⭐</p>` : ''}
      ${nb.map((b) => `<p class="qstar">${b.icon} Neues Abzeichen: ${b.name}</p>`).join('')}
      <button class="btn" data-q="again">Nochmal</button><button class="btn primary" data-q="close">Fertig</button>`;
    sfx.trumpet();
    if (ok >= 3) for (const k of Object.values(state.objs)) if (k.t === 'c' && k.sc === 'schule') { bump(k, 'jump'); setMood(k, 'happy', 2000); }
    festConfetti('schule', state.scroll.schule + VW / 2, 200, ok * 10);
    return;
  }
  const q = quiz.qs[quiz.i];
  c.innerHTML = `<div class="qtop"><span>Frage ${quiz.i + 1}/5</span><span>${'✅'.repeat(quiz.ok)}</span></div>
    <div class="qemo">${q.emo}</div><h2>${q.q}</h2>${q.say ? `<button class="lspeak" data-q="say">🔊</button>` : ''}
    <div class="qopts">${q.opts.map((o) => `<button class="lopt" data-a="${encodeURIComponent(o)}">${o}</button>`).join('')}</div>`;
  if (q.say) Learn.sayEnglish(q.say);
}
$('#quiz').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b || !quiz) return;
  if (b.dataset.q === 'close') { $('#quiz').classList.add('hidden'); quiz = null; return; }
  if (b.dataset.q === 'again') { openQuiz(); return; }
  if (b.dataset.q === 'say') { Learn.sayEnglish(quiz.qs[quiz.i].say); return; }
  if (b.dataset.a == null || quiz.lock) return;
  const q = quiz.qs[quiz.i];
  const ok = decodeURIComponent(b.dataset.a) === q.right;
  quiz.lock = true;
  b.classList.add(ok ? 'right' : 'wrong');
  if (!ok) $('#quiz .quizc').querySelectorAll('.lopt').forEach((x) => { if (decodeURIComponent(x.dataset.a) === q.right) x.classList.add('right'); });
  if (ok) { quiz.ok++; sfx.ding(); } else sfx.boing();
  const kids = Object.values(state.objs).filter((k) => k.t === 'c' && k.sc === 'schule' && k.seat && k.seat !== 'schule:lehrer');
  if (kids.length) { const k = pick(kids); bubble(k, ok ? pick(['Richtig! 🙌', 'Juhu! ✅', 'Gewusst! 💡']) : pick(['Oh nein! 🙈', 'Hmm … 🤔'])); bump(k, ok ? 'jump' : 'wiggle'); }
  setTimeout(() => { quiz.lock = false; quiz.i++; renderQuiz(); }, ok ? 700 : 1400);
});

// ---------------- Rückgängig ----------------
const undoStack = [];
function snapshot() {
  return JSON.stringify({ objs: state.objs, props: state.props, next: state.next, ztop: state.ztop }, (k, v) => (k.startsWith('_') ? undefined : v));
}
function remember() {
  const snap = snapshot();
  if (undoStack[undoStack.length - 1] === snap) return;
  undoStack.push(snap);
  if (undoStack.length > 40) undoStack.shift();
  $('#bUndo').classList.remove('off');
}
function rebuildWorld(snap) {
  for (const e of els.values()) e.remove();
  els.clear();
  falling.clear();
  drags.clear();
  for (const s of SCENES) {
    const sw = sceneEls[s.id].propEls.schaukel;
    if (sw) sw.classList.remove('swing0', 'swing1');
  }
  music(false);
  Object.assign(state, snap);
  mountAll();
  applyNight();
  save();
}
function undo() {
  unlock();
  if (!undoStack.length) { toast('Nichts zum Zurückholen'); sfx.boing(); return; }
  rebuildWorld(JSON.parse(undoStack.pop()));
  if (!undoStack.length) $('#bUndo').classList.add('off');
  sfx.whoosh();
  toast('↩️ Zurück!');
}

// ---------------- Namen ----------------
const NAMES_KIDS = ['Mia', 'Ben', 'Emma', 'Leon', 'Lina', 'Noah', 'Ella', 'Paul', 'Mila', 'Finn', 'Lea', 'Elias', 'Ida', 'Jonas', 'Lia', 'Luis', 'Nele', 'Tom', 'Zoe', 'Max', 'Ava', 'Ole', 'Maja', 'Jan', 'Sophie', 'Emil'];
function ensureName(c) {
  if (!c.name) {
    const used = new Set(Object.values(state.objs).map((o) => o.name));
    c.name = pick(NAMES_KIDS.filter((n) => !used.has(n))) || pick(NAMES_KIDS);
  }
  return c.name;
}

// ---------------- Spielstand sichern / laden ----------------
async function exportSave() {
  saveNow();
  const data = localStorage.getItem(SAVE_KEY) || JSON.stringify(state);
  const d = new Date();
  const name = `tokiboki-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}.json`;
  const blob = new Blob([data], { type: 'application/json' });
  try {
    const file = new File([blob], name, { type: 'application/json' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: 'Tokiboki Spielstand' });
      toast('💾 Gesichert!');
      return;
    }
  } catch (e) {
    if (e && e.name === 'AbortError') return;
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.append(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  toast('💾 Gesichert!');
}
function importSave(file) {
  const r = new FileReader();
  r.onload = () => {
    try {
      const s = JSON.parse(r.result);
      if (!s || s.v !== 1 || !s.objs) throw new Error('kein Spielstand');
      localStorage.setItem(SAVE_KEY, JSON.stringify(s));
      toast('📂 Geladen!');
      setTimeout(() => location.reload(), 500);
    } catch (e) {
      toast('😕 Das ist kein Tokiboki-Spielstand');
      sfx.boing();
    }
  };
  r.readAsText(file);
}

// ---------------- Ort aufräumen ----------------
function cleanScene(sc) {
  remember();
  for (const o of Object.values(state.objs)) {
    if (o.sc !== sc || o.t !== 'i') continue;
    if (o.hold && state.objs[o.hold]) continue;
    removeObj(o, false);
  }
  for (const o of initialObjects().filter((x) => x.sc === sc && x.t === 'i')) newObj(o);
  for (const p of SC[sc].props) if (p.kind === 'container') { state.props[p.id].open = false; applyProp(p.id); }
  updateStored(sc);
  burst(sc, state.scroll[sc] + VW / 2, 300, '✨', 12);
  sfx.sparkle();
  save();
}

// ---------------- Anleitung ----------------
const TUT = [
  ['👋', 'Willkommen in Tokiboki!', 'Hier kannst du alles anfassen, ausprobieren und Geschichten spielen.'],
  ['<span class="tut-hand">👆</span><span class="tut-obj">🧸</span>', 'Ziehen & Ablegen', 'Halte eine Figur oder einen Gegenstand mit dem Finger fest und zieh ihn herum. Eine <b>Leuchtlinie</b> zeigt dir, wo er landet.'],
  ['🍎➡️🙂', 'Figuren verwöhnen', 'Zieh Essen, Hüte, Brillen oder Spielsachen direkt auf eine Figur. Figuren kannst du auf Stühle, Betten und Schaukeln setzen.'],
  ['💡🍳🚿', 'Alles antippen', 'Tippe Möbel an: Lampen, Herd, Dusche, Radio, Kühlschrank … Auf dem Herd wird Essen gekocht!'],
  ['🗺️🏠🎡', 'Orte wechseln', 'Unten in der Leiste wechselst du den Ort. Zieh etwas auf einen Ort, dann nimmst du es mit. Im 🗑️ wird es weggeworfen.'],
  ['🧺🔍', 'Die Kiste', 'In der Kiste findest du hunderte Sachen – mit der Suche ganz schnell.'],
  ['↩️📸', 'Zurück & Fotos', 'Oben links holst du Weggeworfenes zurück. Mit 📸 machst du Fotos für dein Album.'],
  ['☕💇🎧', 'Mini-Spiele', 'Im Café bestellen Gäste etwas, beim Friseur gibt es Wünsche, am DJ-Pult wartet ein Rhythmus-Spiel und in der Schule ein Quiz.'],
  ['🎓⭐', 'Lernen & Freischalten', 'Löse Vokabel-Lektionen, sammle Sterne und schalte coole Sachen frei!'],
];
let tutI = 0;
function openTutorial() {
  closeModals();
  closeDrawer();
  tutI = 0;
  renderTut();
  $('#tut').classList.remove('hidden');
}
function renderTut() {
  const [art, h, p] = TUT[tutI];
  const t = $('#tut');
  t.querySelector('.tut-art').innerHTML = art;
  t.querySelector('.tut-h').textContent = h;
  t.querySelector('.tut-p').innerHTML = p;
  t.querySelector('.tut-dots').innerHTML = TUT.map((_, i) => `<i class="${i === tutI ? 'on' : ''}"></i>`).join('');
  $('#tutNext').textContent = tutI === TUT.length - 1 ? 'Los geht\'s! 🚀' : 'Weiter ▶';
  $('#tutSkip').classList.toggle('hidden', tutI === TUT.length - 1);
}
function endTutorial() {
  $('#tut').classList.add('hidden');
  state.tutDone = true;
  save();
}

// ---------------- Start ----------------
function init() {
  state = load();
  state.vol = Object.assign({ music: 80, sfx: 80, voice: 100 }, state.vol);
  if (!state.cycle) state.cycle = 'off';
  document.body.classList.toggle('lite', !!state.lite);
  applyVolumes();
  $('#bUndo').classList.add('off');
  setMuted(state.muted);
  document.body.insertAdjacentHTML('afterbegin', GLOBAL_DEFS);
  SCENES.forEach(buildScene);
  initWeather();
  mountAll();
  layout();
  switchScene(state.scene, true);
  applyNight();
  addEventListener('resize', layout);
  addEventListener('orientationchange', () => setTimeout(layout, 200));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { saveNow(); music(false); state.props.radio.on = false; applyProp('radio'); DJ.stopAll(); }
  });
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  document.addEventListener('dblclick', (e) => e.preventDefault());
  document.addEventListener('contextmenu', (e) => e.preventDefault());
  setInterval(tick, 500);
  let last = performance.now();
  const loop = (t) => {
    const dt = clamp((t - last) / 1000, 0, 0.05);
    last = t;
    stepFalling(dt);
    stepSlides(dt);
    stepPets(dt);
    stepVehicles(dt);
    festivalFrame();
    for (const d of drags.values()) {
      if (d.active && d.auto && d.o.sc === state.scene) {
        setScroll(state.scroll[state.scene] + d.auto * dt);
        moveDrag(d);
      }
    }
    if (!pan && Math.abs(panV) > 5) {
      setScroll(state.scroll[state.scene] + panV * dt);
      panV *= Math.pow(0.03, dt);
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  const map = createMap({
    scenes: SCENES,
    go: (id) => {
      closeDrawer();
      closeModals();
      switchScene(id, state.scene === id);
      if (!state.tutDone) setTimeout(openTutorial, 700);
    },
    chars: () => Object.values(state.objs).filter((o) => o.t === 'c'),
    isNight: () => state.night,
    sfx,
    unlock,
  });
  $('#bMap').addEventListener('click', () => { unlock(); closeDrawer(); closeModals(); sfx.whoosh(); map.open(); });
  map.open(true);
  DJ.initDJ({ onFx: festFx });
  const anyChar = () => Object.values(state.objs).find((o) => o.t === 'c' && o.sc === state.scene) || Object.values(state.objs).find((o) => o.t === 'c');
  const updateLearnBadge = () => { $('#bLearn .nbadge').textContent = '⭐' + Learn.stars(); };
  Learn.initLearn({
    getState: () => state,
    save,
    sfx,
    unlock,
    previewLook: () => (anyChar() ? anyChar().look : A.randomLook()),
    mascotSVG: () => {
      const c = anyChar();
      return A.charSVG(c ? c.look : A.randomLook(), false).replace('viewBox="0 0 120 210" width="120" height="210"', 'viewBox="-10 -30 140 170" width="90" height="110"');
    },
    onTry: (r) => {
      if (r.key === 'item') {
        remember();
        const o = spawnItem(state.scene, r.value, state.scroll[state.scene] + VW / 2, 200, 0, -200);
        burst(o.sc, o.x, 240, '✨', 12);
        sfx.sparkle();
        updateLearnBadge();
        return;
      }
      const c = anyChar();
      if (!c) return;
      if (c.sc !== state.scene) switchScene(c.sc, true);
      setScroll(c.x - VW / 2);
      c.look[r.key] = r.value;
      rerenderChar(c);
      burst(c.sc, c.x, c.y - 120, '✨', 10);
      sfx.sparkle();
      save();
      openEditor(c);
      updateLearnBadge();
    },
    onClose: updateLearnBadge,
    voiceVol: () => state.vol.voice / 100,
  });
  updateLearnBadge();
  $('#bLearn').addEventListener('click', () => { unlock(); closeDrawer(); closeModals(); Learn.open('path'); });
  initPlaytime({
    sfx,
    unlock,
    stopAll: () => {
      music(false);
      state.props.radio.on = false;
      applyProp('radio');
      DJ.stopAll();
      DJ.close();
      try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) { /* egal */ }
      closeDrawer();
      closeModals();
      saveNow();
    },
  });
  if (DEBUG) window.__dbg = { state, SC, startFall, newObj, falling, sceneEls, removeObj, setScroll, switchScene, place, snapDrop, dropTarget, checkSupport, supported, endDrag, beginDrag, moveDrag, els, get VW() { return VW; } };
  else if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(() => {});
}

init();
