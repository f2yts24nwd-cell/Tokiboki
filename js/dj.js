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
  const { ctx, master } = getAudio();
  if (!ctx || node) return;
  node = ctx.createScriptProcessor(2048, 1, 2);
  node.onaudioprocess = process;
  node.connect(master);
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
      <p class="djhint">Platte mit dem Finger drehen = scratchen</p>
    </div>
    ${deckHTML(1)}
    <button class="djx" aria-label="Schließen">✕</button>
  </div>`;
  document.body.append(root);

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

const angles = [0, 0];
function frame() {
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
  root.classList.add('hidden');
  document.body.classList.remove('dj-open');
  onClose();
}

export function isPlaying() {
  return decks.some((d) => d.playing || d.scratch !== null);
}
