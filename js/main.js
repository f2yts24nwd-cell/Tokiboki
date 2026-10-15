import { sfx, unlock, setMuted, music } from './sound.js';
import * as A from './art.js';
import { SCENES, H, initialObjects } from './world.js';
import { createMap } from './map.js';

const SAVE_KEY = 'kunterbunt-welt-v1';
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
  const root = div('scene');
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
    const e = div('fgp');
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
const poseOf = (o) => (o.seat && SEATS[o.seat] ? POSE[SEATS[o.seat].pose] : POSE.stand);

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
  return SC[o.sc].surfaces.filter((s) => !s.c || state.props[s.c].open || (o._cin && o._cin.includes(s.c)));
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
    if (o._vy > 0) {
      for (const s of surfacesOf(o)) {
        if (nx >= s.x1 && nx <= s.x2 && s.y >= o.y - 0.5 && s.y <= ny && (landY === null || s.y < landY)) landY = s.y;
      }
      if (ny >= FLOOR && (landY === null || landY > FLOOR)) landY = FLOOR;
    }
    o.x = nx;
    if (landY !== null) {
      const speed = o._vy;
      o.y = landY;
      falling.delete(o);
      o._vy = o._vx = 0;
      if (speed > 500) {
        bump(o);
        if (o.sc === state.scene) sfx.land();
      }
      updateStored(o.sc);
      save();
    } else {
      o.y = ny;
    }
    place(o);
  }
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

function trySeat(c) {
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
    case 'haircolor': L.hc = pick(others(A.HAIR_COLORS, L.hc)); sfx.splash(); break;
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
  if (inf.food || inf.drink) { eat(c, it); return true; }
  if (inf.hat) { wear(c, it, 'hat', inf.hat, HAT_EMOJI); return true; }
  if (inf.glasses) { wear(c, it, 'glasses', inf.glasses, GLASS_EMOJI); return true; }
  if (inf.tool) { useTool(c, it, inf.tool); return true; }
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
    bubble(o, pick(['Hallo!', 'Hihi!', '😊', '❤️', '🎵', '🌈', '⭐', 'Juhu!', '😋', 'Hey!']));
    return;
  }
  const inf = info(o);
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
      const on = state.props[z.prop].on;
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
  if (state.props.radio.on && sc === 'haus' && tickN % 2 === 0) burst('haus', 680, 220, pick(['🎵', '🎶']), 1, 'up');
  for (const o of objs) {
    if (o.sc !== sc) continue;
    if (o.t === 'c' && state.night && o.seat === 'haus:bett' && tickN % 4 === 0) burst(sc, o.x - 90, o.y - 60, '💤', 1, 'up');
    if (o.t === 'i' && !o.hold && !o._dragging && !o._stored && !falling.has(o) && info(o).pet && !info(o).floaty && Math.random() < 0.05) {
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
    const pe = e.target.closest('.prop');
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
  falling.delete(o);
  o._vx = o._vy = 0;
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
}

function endDrag(d, cx, cy) {
  const o = d.o;
  const e = els.get(o.id);
  o._dragging = false;
  e.classList.remove('dragging');
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
  }
  sfx.drop();
  startFall(o);
  save();
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
  b.innerHTML = `<b>${s.iconHTML || s.icon}</b><i>${s.name}</i>`;
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
function renderDrawer() {
  const tabs = drawer.querySelector('.tabs');
  tabs.innerHTML = '';
  A.DRAWER.forEach(([icon, name], i) => {
    const b = document.createElement('button');
    b.className = 'tab' + (i === drawerTab ? ' sel' : '');
    b.innerHTML = `<b>${icon}</b><i>${name}</i>`;
    b.addEventListener('click', () => { drawerTab = i; sfx.click(); renderDrawer(); });
    tabs.append(b);
  });
  const grid = drawer.querySelector('.grid');
  grid.innerHTML = A.DRAWER[drawerTab][2].map((k) => `<div class="di" data-k="${k}">${k}</div>`).join('');
}
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
  g.innerHTML = chars.map((c) => `<button class="fig" data-id="${c.id}">${miniSVG(c.look, '-10 -40 140 260', 96)}<i>${SC[c.sc].iconHTML || SC[c.sc].icon}</i></button>`).join('') +
    '<button class="fig new" data-new="1"><b>＋</b><i>Neue Figur</i></button>';
  figList.classList.remove('hidden');
  sfx.pop();
}
figList.querySelector('.figs').addEventListener('click', (e) => {
  const b = e.target.closest('.fig');
  if (!b) return;
  if (b.dataset.new) {
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
  { key: 'hc', label: 'Haarfarbe', colors: A.HAIR_COLORS },
  { key: 'style', label: 'Kleidung', opts: A.SHIRT_STYLES, vb: '0 80 120 130' },
  { key: 'shirt', label: 'Oberteil', colors: A.CLOTH_COLORS },
  { key: 'pants', label: 'Hose', colors: A.CLOTH_COLORS },
  { key: 'shoes', label: 'Schuhe', colors: A.CLOTH_COLORS },
  { key: 'hat', label: 'Hut', opts: A.HATS, vb: '-12 -46 144 150' },
  { key: 'glasses', label: 'Brille', opts: A.GLASSES, vb: '10 30 100 70' },
];

function renderEditor() {
  const c = editing;
  editor.querySelector('.ed-prev').innerHTML = miniSVG(c.look, '-14 -40 148 256', 260);
  const box = editor.querySelector('.ed-opts');
  box.innerHTML = ED_ROWS.map((r) => {
    const cur = c.look[r.key];
    const items = r.colors
      ? r.colors.map((col) => `<button class="sw${col === cur ? ' sel' : ''}" data-k="${r.key}" data-v="${col}" style="background:${col}"></button>`).join('')
      : r.opts.map(([v, name]) => `<button class="opt${v === cur ? ' sel' : ''}" data-k="${r.key}" data-v="${v}" title="${name}">${miniSVG({ ...c.look, [r.key]: v }, r.vb, 58)}</button>`).join('');
    return `<div class="row"><span class="lbl">${r.label}</span><div class="items">${items}</div></div>`;
  }).join('');
}

editor.querySelector('.ed-opts').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-k]');
  if (!b || !editing) return;
  editing.look[b.dataset.k] = b.dataset.v;
  rerenderChar(editing);
  renderEditor();
  sfx.pop();
  save();
});
$('#edRandom').addEventListener('click', () => {
  if (!editing) return;
  editing.look = A.randomLook();
  rerenderChar(editing);
  renderEditor();
  sfx.sparkle();
  save();
});

function openEditor(c) {
  closeModals();
  editing = c;
  renderEditor();
  editor.classList.remove('hidden');
}

// ---------------- Einstellungen ----------------
const settings = $('#settings');
function renderSettings() {
  $('#sSound').textContent = state.muted ? '🔇 Ton ist aus' : '🔊 Ton ist an';
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
$('#sReset').addEventListener('click', () => $('#resetAsk').classList.remove('hidden'));
$('#sResetNo').addEventListener('click', () => $('#resetAsk').classList.add('hidden'));
$('#sResetYes').addEventListener('click', () => {
  localStorage.removeItem(SAVE_KEY);
  music(false);
  location.reload();
});
$('#rotateOk').addEventListener('click', () => document.body.classList.add('rotate-ok'));

// ---------------- Start ----------------
function init() {
  state = load();
  setMuted(state.muted);
  SCENES.forEach(buildScene);
  const all = Object.values(state.objs);
  for (const c of all) {
    if (c.t !== 'c') continue;
    if (c.holding && (!state.objs[c.holding] || state.objs[c.holding].hold !== c.id)) c.holding = null;
    if (c.seat && (!SEATS[c.seat] || SEATS[c.seat].sc !== c.sc)) c.seat = null;
    if (c.seat && SEATS[c.seat].pose === 'slide') { c.seat = null; c.y = 600; }
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
  for (const o of all) {
    if (o.t === 'c' && o.seat && SEATS[o.seat].pose === 'swing') swingClass(SEATS[o.seat], true, o);
    if (!o.hold && !o.seat) startFall(o);
  }
  SCENES.forEach((s) => updateStored(s.id));
  layout();
  switchScene(state.scene, true);
  applyNight();
  addEventListener('resize', layout);
  addEventListener('orientationchange', () => setTimeout(layout, 200));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { saveNow(); music(false); state.props.radio.on = false; applyProp('radio'); }
  });
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  document.addEventListener('dblclick', (e) => e.preventDefault());
  document.addEventListener('contextmenu', (e) => e.preventDefault());
  setInterval(tick, 500);
  let last = performance.now();
  const loop = (t) => {
    const dt = Math.min(0.05, (t - last) / 1000);
    last = t;
    stepFalling(dt);
    stepSlides(dt);
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
    go: (id) => { closeDrawer(); closeModals(); switchScene(id, state.scene === id); },
    chars: () => Object.values(state.objs).filter((o) => o.t === 'c'),
    isNight: () => state.night,
    sfx,
    unlock,
  });
  $('#bMap').addEventListener('click', () => { unlock(); closeDrawer(); closeModals(); sfx.whoosh(); map.open(); });
  map.open(true);
  if (!localStorage.getItem('kunterbunt-hint')) {
    setTimeout(() => { if (!document.body.classList.contains('map-open')) toast('Zieh alles herum! 👆'); }, 600);
    try { localStorage.setItem('kunterbunt-hint', '1'); } catch (e) { /* egal */ }
  }
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(() => {});
}

init();
