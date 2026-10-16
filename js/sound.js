// Alle Geräusche werden live mit WebAudio erzeugt – keine Audiodateien nötig.
let ctx = null;
let master = null;
let muted = false;
let noiseBuf = null;
let sfxBus = null;
let musicBus = null;
const vol = { sfx: 0.8, music: 0.8 };

export function setMuted(m) {
  muted = m;
  if (master) master.gain.value = m ? 0 : 0.7;
  if (m) music(false);
}

/** Lautstärken 0…1 für Geräusche und Musik (DJ-Pult, Radio). */
export function setVolumes(v) {
  Object.assign(vol, v);
  if (sfxBus) sfxBus.gain.value = vol.sfx * 1.25;
  if (musicBus) musicBus.gain.value = vol.music * 1.25;
}

export function getAudio() {
  return { ctx, master, music: musicBus };
}

export function unlock() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.7;
    master.connect(ctx.destination);
    sfxBus = ctx.createGain();
    musicBus = ctx.createGain();
    sfxBus.connect(master);
    musicBus.connect(master);
    setVolumes({});
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  if (ctx.state !== 'running') ctx.resume().catch(() => {});
}

function tone({ type = 'sine', f = 440, f2 = null, t = 0.15, v = 0.3, delay = 0, attack = 0.005, lp = null, bus = null }) {
  if (!ctx || muted) return;
  const now = ctx.currentTime + delay;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f, now);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, now + t);
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(v, now + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, now + t);
  o.connect(g);
  if (lp) {
    const fl = ctx.createBiquadFilter();
    fl.type = 'lowpass';
    fl.frequency.value = lp;
    g.connect(fl);
    fl.connect(bus || sfxBus);
  } else {
    g.connect(bus || sfxBus);
  }
  o.start(now);
  o.stop(now + t + 0.05);
}

function noise({ t = 0.2, v = 0.3, delay = 0, f = 1000, f2 = null, q = 1, type = 'bandpass' }) {
  if (!ctx || muted) return;
  const now = ctx.currentTime + delay;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  const fl = ctx.createBiquadFilter();
  fl.type = type;
  fl.Q.value = q;
  fl.frequency.setValueAtTime(f, now);
  if (f2) fl.frequency.exponentialRampToValueAtTime(f2, now + t);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(v, now + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, now + t);
  src.connect(fl);
  fl.connect(g);
  g.connect(sfxBus);
  src.start(now);
  src.stop(now + t + 0.05);
}

const rnd = (a, b) => a + Math.random() * (b - a);

export const sfx = {
  pick: () => tone({ f: 520, f2: 880, t: 0.1, v: 0.2 }),
  drop: () => tone({ f: 260, f2: 110, t: 0.12, v: 0.2 }),
  land: () => tone({ f: 170, f2: 70, t: 0.08, v: 0.1 }),
  pop: () => tone({ f: 800, f2: 1400, t: 0.07, v: 0.2 }),
  click: () => tone({ type: 'square', f: 1400, t: 0.03, v: 0.05, lp: 3000 }),
  boing: () => {
    tone({ f: 260, f2: 700, t: 0.16, v: 0.22 });
    tone({ type: 'triangle', f: 700, f2: 330, t: 0.2, v: 0.12, delay: 0.14 });
  },
  talk: () => {
    const base = rnd(320, 520);
    const n = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++) {
      const f = base * rnd(0.85, 1.35);
      tone({ type: 'triangle', f, f2: f * rnd(0.8, 1.2), t: 0.1, v: 0.18, delay: i * 0.12 });
    }
  },
  chomp: () => {
    for (let i = 0; i < 3; i++) noise({ t: 0.08, v: 0.45, delay: i * 0.17, f: rnd(500, 900), q: 2 });
  },
  gulp: () => {
    tone({ f: 320, f2: 150, t: 0.12, v: 0.25 });
    tone({ f: 300, f2: 140, t: 0.12, v: 0.25, delay: 0.2 });
  },
  sparkle: () => [1047, 1319, 1568, 2093].forEach((f, i) => tone({ type: 'triangle', f, t: 0.25, v: 0.1, delay: i * 0.06 })),
  ding: () => {
    tone({ f: 1568, t: 0.7, v: 0.18 });
    tone({ f: 2093, t: 0.7, v: 0.1, delay: 0.09 });
  },
  coin: () => {
    tone({ type: 'square', f: 988, t: 0.08, v: 0.08, lp: 4000 });
    tone({ type: 'square', f: 1319, t: 0.3, v: 0.08, lp: 4000, delay: 0.08 });
  },
  flush: () => noise({ t: 1.5, v: 0.35, f: 300, f2: 2400, q: 0.6 }),
  whoosh: () => noise({ t: 0.4, v: 0.2, f: 300, f2: 2200, q: 1 }),
  poof: () => noise({ t: 0.3, v: 0.3, f: 2500, f2: 300, q: 0.8 }),
  plop: () => {
    tone({ f: 420, f2: 110, t: 0.18, v: 0.3 });
    noise({ t: 0.25, v: 0.15, f: 900, q: 1, delay: 0.12 });
  },
  splash: () => noise({ t: 0.5, v: 0.25, f: 1800, f2: 600, q: 0.5 }),
  door: () => {
    tone({ type: 'triangle', f: 180, f2: 120, t: 0.12, v: 0.2 });
    noise({ t: 0.08, v: 0.1, f: 800, q: 1, delay: 0.02 });
  },
  sizzle: () => noise({ t: 0.8, v: 0.12, f: 5000, q: 0.5, type: 'highpass' }),
  woof: () => {
    tone({ type: 'sawtooth', f: 280, f2: 170, t: 0.12, v: 0.22, lp: 900 });
    tone({ type: 'sawtooth', f: 260, f2: 160, t: 0.12, v: 0.2, lp: 900, delay: 0.2 });
  },
  meow: () => {
    tone({ type: 'triangle', f: 600, f2: 950, t: 0.15, v: 0.18 });
    tone({ type: 'triangle', f: 950, f2: 500, t: 0.3, v: 0.18, delay: 0.14 });
  },
  tweet: () => {
    for (let i = 0; i < 3; i++) tone({ f: 2200, f2: 3200, t: 0.06, v: 0.12, delay: i * 0.09 });
  },
  squeak: () => tone({ f: 1200, f2: 1800, t: 0.12, v: 0.15 }),
  quack: () => tone({ type: 'sawtooth', f: 500, f2: 380, t: 0.18, v: 0.15, lp: 1400 }),
  croak: () => tone({ type: 'sawtooth', f: 140, f2: 110, t: 0.25, v: 0.2, lp: 700 }),
  drum: () => {
    tone({ f: 150, f2: 50, t: 0.25, v: 0.5 });
    noise({ t: 0.1, v: 0.2, f: 3000, q: 0.5, delay: 0.25 });
    tone({ f: 150, f2: 50, t: 0.25, v: 0.4, delay: 0.4 });
  },
  guitar: () => [196, 247, 294, 392].forEach((f, i) => tone({ type: 'sawtooth', f, t: 0.9, v: 0.06, lp: 1600, delay: i * 0.04 })),
  trumpet: () => [523, 659, 784].forEach((f, i) => tone({ type: 'sawtooth', f, t: 0.22, v: 0.09, lp: 2400, delay: i * 0.18 })),
  ring: () => {
    for (let i = 0; i < 8; i++) tone({ type: 'square', f: 1800, t: 0.05, v: 0.06, lp: 5000, delay: i * 0.07 });
  },
  hatch: () => {
    noise({ t: 0.1, v: 0.3, f: 2000, q: 2 });
    tone({ f: 2000, f2: 2800, t: 0.1, v: 0.12, delay: 0.15 });
  },
  dryer: () => noise({ t: 1.2, v: 0.15, f: 600, f2: 900, q: 0.4 }),
  airhorn: () => {
    for (let k = 0; k < 3; k++) {
      [466, 587, 698].forEach((f) => tone({ type: 'sawtooth', f, f2: f * 0.97, t: 0.22, v: 0.09, lp: 2600, delay: k * 0.26 }));
    }
  },
  laser: () => {
    for (let k = 0; k < 3; k++) tone({ type: 'square', f: 2400, f2: 180, t: 0.25, v: 0.07, lp: 4000, delay: k * 0.12 });
  },
  siren: () => {
    for (let k = 0; k < 4; k++) {
      tone({ type: 'sawtooth', f: 600, f2: 1100, t: 0.3, v: 0.06, lp: 2500, delay: k * 0.6 });
      tone({ type: 'sawtooth', f: 1100, f2: 600, t: 0.3, v: 0.06, lp: 2500, delay: k * 0.6 + 0.3 });
    }
  },
  boom: () => {
    noise({ t: 0.9, v: 0.35, f: 400, f2: 80, q: 0.7 });
    tone({ f: 90, f2: 40, t: 0.6, v: 0.35 });
  },
  whooshUp: () => noise({ t: 0.7, v: 0.2, f: 400, f2: 5000, q: 1.2 }),
  tv: () => [784, 988, 1175].forEach((f, i) => tone({ type: 'square', f, t: 0.1, v: 0.05, lp: 3000, delay: i * 0.08 })),
};

// Einfache Radiomusik (Pentatonik-Melodie in Schleife)
let musicTimer = null;
const MEL = [523, 587, 659, 784, 659, 587, 523, 440, 523, 659, 784, 880, 784, 659, 587, 523];
const BASS = [131, 131, 165, 165, 175, 175, 196, 196];
export function music(on) {
  if (musicTimer) {
    clearInterval(musicTimer);
    musicTimer = null;
  }
  if (!on) return;
  let step = 0;
  musicTimer = setInterval(() => {
    if (!ctx || muted) return;
    tone({ type: 'triangle', f: MEL[step % MEL.length], t: 0.22, v: 0.08, bus: musicBus });
    if (step % 2 === 0) tone({ type: 'sine', f: BASS[(step / 2) % BASS.length], t: 0.4, v: 0.12, bus: musicBus });
    step++;
  }, 260);
}
export function musicOn() {
  return !!musicTimer;
}
