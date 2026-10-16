// DJ-Pult: zwei Plattenteller mit echter Musik, Scratchen (auch rückwärts), Crossfader und Effekt-Pads.
import { unlock, getAudio, sfx } from './sound.js';

export const TRACKS = [
  { file: 'audio/track1.mp3', title: 'Tokiland Hymne', bpm: 128, color: '#ff6fb5' },
  { file: 'audio/track2.mp3', title: 'Neonwald', bpm: 124, color: '#2ec4b6' },
  { file: 'audio/track3.mp3', title: 'Raketenstart', bpm: 132, color: '#ffca3a' },
];
const RPS = 0.5556; // 33⅓ Umdrehungen pro Minute

const buffers = {};
const loading = {};

function decode(ctx, ab) {
  return new Promise((res, rej) => {
    const p = ctx.decodeAudioData(ab, res, rej);
    if (p && p.then) p.then(res, rej);
  });
}

function loadTrack(i) {
  if (buffers[i]) return Promise.resolve(buffers[i]);
  if (loading[i]) return loading[i];
  const { ctx } = getAudio();
  loading[i] = fetch(TRACKS[i].file)
    .then((r) => r.arrayBuffer())
    .then((ab) => decode(ctx, ab))
    .then((buf) => {
      buffers[i] = {
        L: buf.getChannelData(0),
        R: buf.numberOfChannels > 1 ? buf.getChannelData(1) : buf.getChannelData(0),
        len: buf.length,
        sr: buf.sampleRate,
      };
      return buffers[i];
    })
    .catch((e) => {
      loading[i] = null;
      throw e;
    });
  return loading[i];
}

class Deck {
  constructor() {
    this.track = -1;
    this.buf = null;
    this.pos = 0;
    this.rate = 0;
    this.playing = false;
    this.scratch = null; // Geschwindigkeit, solange der Finger auf der Platte liegt
    this.level = 0;
  }
}

const decks = [new Deck(), new Deck()];
let xf = 0; // Crossfader: 0 = links, 1 = rechts
let node = null;

function process(e) {
  const L = e.outputBuffer.getChannelData(0);
  const R = e.outputBuffer.getChannelData(1);
  L.fill(0);
  R.fill(0);
  const gains = [Math.cos((xf * Math.PI) / 2), Math.sin((xf * Math.PI) / 2)];
  for (let k = 0; k < 2; k++) {
    const d = decks[k];
    const b = d.buf;
    if (!b) continue;
    const g = gains[k];
    const target = d.scratch !== null ? d.scratch : d.playing ? 1 : 0;
    const smooth = d.scratch !== null ? 0.004 : 0.00012;
    let pos = d.pos;
    let rate = d.rate;
    let peak = 0;
    const len = b.len;
    for (let i = 0; i < L.length; i++) {
      rate += (target - rate) * smooth;
      pos += rate;
      if (pos >= len) pos -= len;
      else if (pos < 0) pos += len;
      const i0 = pos | 0;
      const fr = pos - i0;
      const i1 = i0 + 1 < len ? i0 + 1 : 0;
      const l = b.L[i0] + (b.L[i1] - b.L[i0]) * fr;
      const r = b.R[i0] + (b.R[i1] - b.R[i0]) * fr;
      const a = Math.min(1, Math.abs(rate));
      L[i] += l * g * a;
      R[i] += r * g * a;
      const v = l < 0 ? -l : l;
      if (v * a > peak) peak = v * a;
    }
    d.pos = pos;
    d.rate = rate;
    d.level = peak * g;
  }
  for (let i = 0; i < L.length; i++) {
    if (L[i] > 1) L[i] = 1; else if (L[i] < -1) L[i] = -1;
    if (R[i] > 1) R[i] = 1; else if (R[i] < -1) R[i] = -1;
  }
}

function ensureNode() {
  unlock();
  const { ctx, music } = getAudio();
  if (!ctx || node) return;
  node = ctx.createScriptProcessor(2048, 1, 2);
  node.onaudioprocess = process;
  node.connect(music);
}

export function stopAll() {
  decks.forEach((d) => {
    d.playing = false;
    d.scratch = null;
    d.rate = 0;
  });
  if (node) {
    node.disconnect();
    node.onaudioprocess = null;
    node = null;
  }
  renderButtons();
}

/** Was gerade läuft (für Lichter & tanzende Figuren). */
export function beatInfo() {
  let best = null;
  const gains = [Math.cos((xf * Math.PI) / 2), Math.sin((xf * Math.PI) / 2)];
  decks.forEach((d, k) => {
    if (!d.buf || Math.abs(d.rate) < 0.3 || gains[k] < 0.25) return;
    if (!best || gains[k] > best.g) best = { g: gains[k], d };
  });
  if (!best) return null;
  const t = TRACKS[best.d.track];
  return { bpm: t.bpm, beat: (best.d.pos / best.d.buf.sr) * (t.bpm / 60), level: Math.max(decks[0].level, decks[1].level), color: t.color };
}

// ---------------- Oberfläche ----------------
let root = null;
let onFx = () => {};
let onClose = () => {};

function deckHTML(k) {
  return `<div class="deck" data-d="${k}">
    <div class="tt"><div class="vinyl"><div class="vlabel"><b>${k ? 'B' : 'A'}</b></div></div><div class="arm"></div></div>
    <div class="tracks">${TRACKS.map((t, i) => `<button class="tbtn" data-t="${i}" style="--c:${t.color}">${t.title}</button>`).join('')}</div>
    <div class="dctl"><button class="play">▶</button><div class="vu"><i></i></div><span class="status"></span></div>
  </div>`;
}

const PADS = [
  ['airhorn', '📯', 'Horn'], ['laser', '⚡', 'Laser'], ['siren', '🚨', 'Sirene'],
  ['konfetti', '🎉', 'Konfetti'], ['feuer', '🔥', 'Feuer'], ['feuerwerk', '🎆', 'Feuerwerk'],
];

export function initDJ(opts) {
  onFx = opts.onFx || onFx;
  onClose = opts.onClose || onClose;
  root = document.createElement('div');
  root.id = 'dj';
  root.className = 'hidden';
  root.innerHTML = `<div class="djpanel">
    ${deckHTML(0)}
    <div class="mixer">
      <div class="djlogo">TOKILAND <span>DJ</span></div>
      <div class="bpm">– BPM</div>
      <div class="xf"><span>A</span><div class="xtrack"><div class="xknob"></div></div><span>B</span></div>
      <div class="pads">${PADS.map(([id, ic, name]) => `<button class="pad" data-fx="${id}"><b>${ic}</b><i>${name}</i></button>`).join('')}</div>
      <button class="rstart">🎮 Rhythmus-Spiel</button>
      <p class="djhint">Platte mit dem Finger drehen = scratchen</p>
    </div>
    ${deckHTML(1)}
    <button class="djx" aria-label="Schließen">✕</button>
  </div>
  <div class="rgame hidden">
    <div class="rhud"><div><small>Punkte</small><b class="rscore">0</b></div><div class="rjudge"></div><div><small>Kombo</small><b class="rcombo">0</b></div></div>
    <div class="rlanes">${[0, 1, 2, 3].map((i) => `<div class="rlane" style="--c:${LANE_COL[i]}"><div class="rnotes"></div></div>`).join('')}<div class="rline"></div></div>
    <div class="rbtns">${[0, 1, 2, 3].map((i) => `<button class="rbtn" data-l="${i}" style="--c:${LANE_COL[i]}">${LANE_ICON[i]}</button>`).join('')}</div>
    <button class="rquit" aria-label="Spiel beenden">✕</button>
    <div class="rresult hidden"></div>
  </div>`;
  document.body.append(root);
  root.querySelector('.rstart').addEventListener('click', startGame);
  root.querySelector('.rquit').addEventListener('click', endGame);
  root.querySelectorAll('.rbtn').forEach((b) => b.addEventListener('pointerdown', (e) => { e.preventDefault(); hitLane(+b.dataset.l, b); }));

  root.querySelector('.djx').addEventListener('click', close);
  root.querySelectorAll('.deck').forEach((el) => {
    const k = +el.dataset.d;
    el.querySelectorAll('.tbtn').forEach((b) => b.addEventListener('click', () => selectTrack(k, +b.dataset.t)));
    el.querySelector('.play').addEventListener('click', () => togglePlay(k));
    bindVinyl(el.querySelector('.vinyl'), k);
  });
  root.querySelectorAll('.pad').forEach((b) => b.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    unlock();
    const fx = b.dataset.fx;
    if (sfx[fx]) sfx[fx]();
    b.classList.remove('hit');
    void b.offsetWidth;
    b.classList.add('hit');
    onFx(fx);
  }));
  bindCrossfader(root.querySelector('.xtrack'));
  requestAnimationFrame(frame);
}

function setStatus(k, txt) {
  root.querySelector(`.deck[data-d="${k}"] .status`).textContent = txt;
}

function selectTrack(k, i) {
  ensureNode();
  const d = decks[k];
  setStatus(k, 'lädt …');
  loadTrack(i).then((b) => {
    d.track = i;
    d.buf = b;
    d.pos = 0;
    setStatus(k, '');
    root.querySelector(`.deck[data-d="${k}"] .vinyl`).style.setProperty('--c', TRACKS[i].color);
    renderButtons();
  }).catch(() => setStatus(k, 'Fehler beim Laden'));
  renderButtons(k, i);
}

function togglePlay(k) {
  ensureNode();
  const d = decks[k];
  if (!d.buf) {
    selectTrack(k, k === 0 ? 0 : 1);
    loadTrack(k === 0 ? 0 : 1).then(() => { d.playing = true; renderButtons(); });
    return;
  }
  d.playing = !d.playing;
  renderButtons();
}

function renderButtons(pendK, pendI) {
  if (!root) return;
  decks.forEach((d, k) => {
    const el = root.querySelector(`.deck[data-d="${k}"]`);
    el.querySelector('.play').textContent = d.playing ? '⏸' : '▶';
    el.classList.toggle('on', d.playing);
    el.querySelectorAll('.tbtn').forEach((b) => b.classList.toggle('sel', +b.dataset.t === (pendK === k ? pendI : d.track)));
  });
}

function angleAt(el, e) {
  const r = el.getBoundingClientRect();
  return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2));
}

function bindVinyl(el, k) {
  let last = null;
  let lastT = 0;
  let moved = 0;
  el.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    ensureNode();
    if (!decks[k].buf) {
      selectTrack(k, k === 0 ? 0 : 1);
      return;
    }
    el.setPointerCapture?.(e.pointerId);
    last = angleAt(el, e);
    lastT = performance.now();
    moved = lastT;
    decks[k].scratch = 0;
    el.classList.add('grab');
  });
  el.addEventListener('pointermove', (e) => {
    if (last === null) return;
    const a = angleAt(el, e);
    let da = a - last;
    if (da > Math.PI) da -= 2 * Math.PI;
    if (da < -Math.PI) da += 2 * Math.PI;
    const t = performance.now();
    const dt = Math.max(1, t - lastT) / 1000;
    const rps = da / (2 * Math.PI) / dt;
    decks[k].scratch = Math.max(-4, Math.min(4, rps / RPS));
    last = a;
    lastT = t;
    moved = t;
  });
  const up = () => {
    if (last === null) return;
    last = null;
    decks[k].scratch = null;
    el.classList.remove('grab');
  };
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', up);
  // Finger liegt still auf der Platte -> Platte steht
  setInterval(() => {
    if (last !== null && performance.now() - moved > 60) decks[k].scratch = 0;
  }, 40);
}

function bindCrossfader(track) {
  const knob = track.querySelector('.xknob');
  const set = (e) => {
    const r = track.getBoundingClientRect();
    xf = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    knob.style.left = xf * 100 + '%';
  };
  knob.style.left = '0%';
  let on = false;
  track.addEventListener('pointerdown', (e) => { on = true; track.setPointerCapture?.(e.pointerId); set(e); });
  track.addEventListener('pointermove', (e) => on && set(e));
  track.addEventListener('pointerup', () => (on = false));
  track.addEventListener('pointercancel', () => (on = false));
}

// ---------------- Rhythmus-Spiel ----------------
const LANE_COL = ['#ff6fb5', '#ffca3a', '#2ec4b6', '#9b5de5'];
const LANE_ICON = ['🥁', '🎹', '🎺', '🎸'];
const LANE_FX = ['airhorn', 'laser', 'konfetti', 'feuer'];
const PX_PER_BEAT = 120;
let game = null;

function startGame() {
  unlock();
  ensureNode();
  // läuft keine Musik, starten wir den hörbaren Plattenteller
  if (!beatInfo()) {
    const k = xf > 0.5 ? 1 : 0;
    const d = decks[k];
    const go = () => { d.playing = true; renderButtons(); };
    if (d.buf) go(); else { selectTrack(k, k); loadTrack(k).then(go); }
  }
  const g = root.querySelector('.rgame');
  g.classList.remove('hidden');
  g.querySelector('.rresult').classList.add('hidden');
  g.querySelectorAll('.rnotes').forEach((n) => (n.innerHTML = ''));
  document.body.classList.add('rgame-open');
  game = { notes: null, score: 0, combo: 0, best: 0, hits: 0, total: 0 };
  setJudge('Mach dich bereit! 🎧');
}

function makeNotes(b0) {
  const notes = [];
  let lane = 0;
  for (let i = 0; i < 32; i++) {
    lane = (lane + 1 + Math.floor(Math.random() * 3)) % 4;
    notes.push({ beat: b0 + i, lane, el: null, done: false });
    if (i > 8 && i % 4 === 3 && Math.random() < 0.5) notes.push({ beat: b0 + i + 0.5, lane: (lane + 2) % 4, el: null, done: false });
  }
  return notes;
}

function setJudge(t, cls = '') {
  const j = root.querySelector('.rjudge');
  j.textContent = t;
  j.className = 'rjudge ' + cls;
  void j.offsetWidth;
  j.classList.add('pop');
}

function hitLane(l, btn) {
  if (!game || !game.notes) return;
  btn.classList.remove('hit');
  void btn.offsetWidth;
  btn.classList.add('hit');
  const bi = beatInfo();
  if (!bi) return;
  let best = null;
  for (const n of game.notes) {
    if (n.done || n.lane !== l) continue;
    const d = Math.abs(n.beat - bi.beat);
    if (d < 0.45 && (!best || d < Math.abs(best.beat - bi.beat))) best = n;
  }
  if (!best) { game.combo = 0; setJudge('Daneben 🙈', 'miss'); updHud(); return; }
  const d = Math.abs(best.beat - bi.beat);
  best.done = true;
  best.el && best.el.classList.add('gone');
  game.hits++;
  game.combo++;
  game.best = Math.max(game.best, game.combo);
  const pts = d < 0.15 ? 100 : 50;
  game.score += pts + Math.min(game.combo, 20) * 5;
  setJudge(d < 0.15 ? 'PERFEKT! ✨' : 'Gut! 👍', d < 0.15 ? 'perf' : 'good');
  if (game.combo % 8 === 0) { onFx(LANE_FX[l]); if (sfx[LANE_FX[l]]) sfx[LANE_FX[l]](); }
  updHud();
}

function updHud() {
  root.querySelector('.rscore').textContent = game.score;
  root.querySelector('.rcombo').textContent = game.combo;
}

function gameFrame() {
  if (!game) return;
  const bi = beatInfo();
  if (!bi) return;
  if (!game.notes) {
    game.notes = makeNotes(Math.ceil(bi.beat) + 4);
    game.total = game.notes.length;
    const lanes = root.querySelectorAll('.rnotes');
    for (const n of game.notes) {
      n.el = document.createElement('i');
      n.el.className = 'rnote';
      lanes[n.lane].append(n.el);
    }
    setJudge('Los geht\'s! 🎶');
  }
  const h = root.querySelector('.rlanes').clientHeight;
  const hitY = h - 40;
  for (const n of game.notes) {
    if (!n.el) continue;
    const y = hitY - (n.beat - bi.beat) * PX_PER_BEAT;
    n.el.style.transform = `translateY(${y}px)`;
    if (!n.done && bi.beat - n.beat > 0.45) {
      n.done = true;
      n.el.classList.add('missed');
      game.combo = 0;
      setJudge('Verpasst 😅', 'miss');
      updHud();
    }
  }
  const last = game.notes[game.notes.length - 1].beat;
  if (bi.beat > last + 2) finishGame();
}

function finishGame() {
  const g = game;
  game = null;
  const pct = g.hits / g.total;
  const stars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : pct >= 0.3 ? 1 : 0;
  let best = 0;
  try { best = +localStorage.getItem('tokiboki-dj-best') || 0; } catch (e) { /* egal */ }
  const record = g.score > best;
  if (record) try { localStorage.setItem('tokiboki-dj-best', g.score); } catch (e) { /* egal */ }
  const r = root.querySelector('.rresult');
  r.innerHTML = `<h2>${stars === 3 ? 'DJ-Legende! 🏆' : stars === 2 ? 'Super Show! 🎉' : stars === 1 ? 'Nicht schlecht! 🎧' : 'Nochmal? 💪'}</h2>
    <div class="rstars">${[1, 2, 3].map((k) => `<span class="${k <= stars ? 'on' : ''}">⭐</span>`).join('')}</div>
    <p><b>${g.score}</b> Punkte · ${g.hits}/${g.total} getroffen · beste Kombo ${g.best}</p>
    ${record ? '<p class="rrec">🎉 Neuer Rekord!</p>' : `<p>Rekord: ${Math.max(best, g.score)}</p>`}
    <div><button class="rb again">Nochmal</button><button class="rb quit">Fertig</button></div>`;
  r.classList.remove('hidden');
  r.querySelector('.again').addEventListener('click', startGame);
  r.querySelector('.quit').addEventListener('click', endGame);
  sfx.trumpet();
  if (stars >= 2) onFx('feuerwerk');
}

function endGame() {
  game = null;
  root.querySelector('.rgame').classList.add('hidden');
  document.body.classList.remove('rgame-open');
}

const angles = [0, 0];
function frame() {
  gameFrame();
  if (root && !root.classList.contains('hidden')) {
    decks.forEach((d, k) => {
      const el = root.querySelector(`.deck[data-d="${k}"]`);
      if (d.buf) angles[k] = ((d.pos / d.buf.sr) * RPS * 360) % 360;
      el.querySelector('.vinyl').style.transform = `rotate(${angles[k]}deg)`;
      el.querySelector('.vu i').style.transform = `scaleY(${Math.min(1, d.level * 1.6).toFixed(3)})`;
    });
    const bi = beatInfo();
    root.querySelector('.bpm').textContent = bi ? `${bi.bpm} BPM` : '– BPM';
  }
  requestAnimationFrame(frame);
}

export function open() {
  ensureNode();
  root.classList.remove('hidden');
  document.body.classList.add('dj-open');
  if (!decks[0].buf && decks[0].track === -1) selectTrack(0, 0);
  if (!decks[1].buf && decks[1].track === -1) selectTrack(1, 1);
}

export function close() {
  endGame();
  root.classList.add('hidden');
  document.body.classList.remove('dj-open');
  onClose();
}

export function isPlaying() {
  return decks.some((d) => d.playing || d.scratch !== null);
}
