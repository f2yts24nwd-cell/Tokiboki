// Weltkarte (Startseite): animierte Übersicht aller Orte.
import { charSVG } from './art.js';

const VW = 1400;
const VH = 900;
const R = (x, y, w, h, fill, rx = 0, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" ${extra}/>`;
const C = (cx, cy, r, fill, extra = '') => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${extra}/>`;
const E = (cx, cy, rx, ry, fill, extra = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const P = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const T = (x, y, s, fill, txt, extra = '') => `<text x="${x}" y="${y}" font-size="${s}" fill="${fill}" text-anchor="middle" font-weight="800" font-family="ui-rounded, 'Arial Rounded MT Bold', system-ui, sans-serif" ${extra}>${txt}</text>`;
const EMO = (x, y, s, e, extra = '') => `<text x="${x}" y="${y}" font-size="${s}" text-anchor="middle" ${extra}>${e}</text>`;

// Gebäude: Ursprung = unten Mitte
const BUILDINGS = {
  haus: { x: 200, y: 360, draw: () =>
    R(-95, -130, 190, 130, '#ffd6a5', 8) + R(-95, -130, 190, 130, 'url(#mstripes)', 8) +
    `<g class="smoke">${C(62, -215, 10, '#fff', 'style="--i:0"')}${C(62, -215, 10, '#fff', 'style="--i:1"')}${C(62, -215, 10, '#fff', 'style="--i:2"')}</g>` +
    R(50, -205, 24, 60, '#c1121f', 4) + P('M-118 -122 L0 -215 L118 -122 Z', '#ff6b6b') + C(0, -160, 16, '#9ee7ff', 'class="win"') +
    R(-22, -66, 44, 66, '#9b5de5', 10) + C(12, -32, 4, '#ffd166') +
    R(-78, -108, 42, 38, '#9ee7ff', 6, 'class="win"') + R(36, -108, 42, 38, '#9ee7ff', 6, 'class="win"') +
    R(-80, -72, 46, 8, '#fff', 4) + R(34, -72, 46, 8, '#fff', 4) + EMO(-100, 6, 34, '🌷') + EMO(100, 6, 34, '🌻') },
  cafe: { x: 520, y: 350, draw: () =>
    R(-100, -165, 200, 165, '#ffc8dd', 8) + R(-108, -178, 216, 20, '#ff5d8f', 8) + T(0, -132, 30, '#ff5d8f', 'CAFÉ') +
    Array.from({ length: 8 }, (_, i) => P(`M${-100 + i * 25} -112 L${-75 + i * 25} -112 L${-80 + i * 25} -88 Q${-87 + i * 25} -80 ${-95 + i * 25} -88Z`, i % 2 ? '#fff' : '#ff5d8f')).join('') +
    R(-80, -80, 70, 60, '#9ee7ff', 6, 'class="win"') + R(14, -76, 54, 76, '#8d5524', 8) +
    `<g class="steam">${P('M-30 -215 q10 -14 0 -28', 'none', 'stroke="#fff" stroke-width="6" stroke-linecap="round"')}${P('M0 -218 q10 -14 0 -28', 'none', 'stroke="#fff" stroke-width="6" stroke-linecap="round" style="animation-delay:.4s"')}</g>` +
    EMO(-14, -178, 56, '☕', 'class="cup"') + EMO(-115, 4, 32, '🪴') },
  markt: { x: 850, y: 360, draw: () =>
    R(-125, -150, 250, 150, '#d8f3dc', 8) + R(-132, -172, 264, 44, '#52b788', 10) + T(0, -139, 30, '#fff', 'MARKT') +
    R(-100, -112, 90, 112, '#9ee7ff', 6, 'class="win"') + R(-55, -112, 3, 112, '#fff') + R(20, -110, 84, 56, '#9ee7ff', 6, 'class="win"') +
    R(20, -46, 84, 46, '#e9c46a', 4) + EMO(42, -14, 26, '🍎') + EMO(82, -14, 26, '🍌') + EMO(-150, 4, 46, '🛒', 'class="cart"') },
  friseur: { x: 1180, y: 360, draw: () =>
    R(-90, -160, 180, 160, '#ffe5ec', 8) + R(-98, -176, 196, 40, '#fb6f92', 10) + T(0, -146, 24, '#fff', 'FRISEUR') +
    R(-70, -118, 80, 70, '#9ee7ff', 6, 'class="win"') + R(28, -84, 44, 84, '#7b2cbf', 8) +
    `<clipPath id="poleclip"><rect x="-120" y="-130" width="22" height="110" rx="10"/></clipPath>` + R(-122, -134, 26, 118, '#ccc', 12) +
    `<g clip-path="url(#poleclip)">${R(-120, -130, 22, 110, '#fff')}<g class="pole">${Array.from({ length: 9 }, (_, i) => P(`M-120 ${-150 + i * 26} L-98 ${-170 + i * 26} L-98 ${-158 + i * 26} L-120 ${-138 + i * 26}Z`, i % 2 ? '#1982c4' : '#e63946')).join('')}</g></g>` +
    EMO(-30, -184, 44, '✂️', 'class="snip"') },
  bad: { x: 250, y: 680, draw: () =>
    R(-100, -140, 200, 140, '#bde8f6', 8) + P('M-108 -136 Q0 -250 108 -136Z', '#2ec4b6') + T(0, -150, 30, '#fff', 'BAD') +
    C(-55, -90, 24, '#fff') + C(-55, -90, 18, '#9ee7ff', 'class="win"') + C(55, -90, 24, '#fff') + C(55, -90, 18, '#9ee7ff', 'class="win"') +
    R(-24, -64, 48, 64, '#ff99c8', 10) + `<g class="bubbles">${[-70, -20, 30, 80].map((x, i) => C(x, -230, 9 + (i % 2) * 5, '#fff', `opacity=".8" style="--i:${i}"`)).join('')}</g>` +
    EMO(0, -222, 40, '🦆', 'class="duck"') + EMO(125, 2, 36, '💩') },
  buero: { x: 660, y: 690, draw: () => {
    let w = '';
    for (let r = 0; r < 5; r++) for (let c = 0; c < 4; c++) w += R(-66 + c * 34, -250 + r * 40, 26, 28, '#bfe3f2', 4, `class="owin" style="animation-delay:${((r * 4 + c) * 0.37) % 3}s"`);
    return R(-80, -270, 160, 270, '#f4f6f4', 8) + R(-80, -270, 160, 270, 'none', 8, 'stroke="#575757" stroke-width="6"') + w +
      P('M-90 -262 L90 -296 L90 -262 Z', '#50af30') + R(-90, -272, 180, 14, '#50af30') +
      `<image href="icons/itmx-x.png" x="22" y="-352" width="56" height="60"/>` + R(-26, -50, 52, 50, '#575757', 6) + R(-22, -46, 44, 46, '#9ee7ff', 4, 'class="win"');
  } },
  park: { x: 1080, y: 680, draw: () =>
    E(0, -6, 190, 34, '#74c69d') + E(70, -14, 70, 18, '#4cc9f0') + EMO(70, -6, 30, '🦆', 'class="duck"') +
    `<g class="sway">${R(-140, -120, 20, 110, '#8d5524', 6)}${C(-130, -150, 56, '#40916c')}${C(-160, -120, 36, '#52b788')}${C(-100, -120, 36, '#52b788')}${C(-140, -170, 8, '#e63946')}${C(-110, -140, 8, '#e63946')}</g>` +
    P('M-60 -6 L-40 -120 L-20 -6 M20 -6 L0 -120 L-20 -6', 'none', 'stroke="#e76f51" stroke-width="8" stroke-linecap="round"') + R(-46, -126, 52, 10, '#bc6c25', 4) +
    `<g class="swing">${P('M-28 -120 L-28 -50 M-12 -120 L-12 -50', 'none', 'stroke="#555" stroke-width="3"')}${R(-36, -52, 32, 8, '#ffca3a', 3)}</g>` +
    `<g class="fountain">${P('M130 -30 q-20 -60 -40 -10 M130 -30 q20 -60 40 -10 M130 -30 l0 -70', 'none', 'stroke="#4cc9f0" stroke-width="6" stroke-linecap="round"')}</g>` + E(130, -24, 34, 10, '#adb5bd') +
    EMO(-180, 4, 30, '🌼') + EMO(170, 6, 30, '🌷') },
};

const DECOR_TREES = [[60, 520], [1340, 520], [420, 560], [900, 560], [1350, 800], [40, 820], [1240, 560], [480, 820]];

function mapSVG(scenes, counts) {
  let s = `<defs>
    <pattern id="mstripes" width="30" height="10" patternUnits="userSpaceOnUse">${R(0, 0, 15, 10, '#fff', 0, 'opacity=".25"')}</pattern>
    <linearGradient id="msky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fd8ff"/><stop offset="1" stop-color="#c9f1ff"/></linearGradient>
  </defs>`;
  s += R(0, 0, VW, 200, 'url(#msky)', 0, 'class="msky"') + `<g class="mstars">${Array.from({ length: 30 }, (_, i) => C((i * 157) % VW, 10 + ((i * 61) % 170), 1.5 + (i % 3), '#fff8c4')).join('')}</g>`;
  s += `<g transform="translate(110 92)"><g class="sun"><g class="rays">${Array.from({ length: 12 }, (_, i) => R(-4, -78, 8, 26, '#ffd60a', 4, `transform="rotate(${i * 30})"`)).join('')}</g>${C(0, 0, 44, '#ffe066')}${C(-14, -6, 5, '#7a4a26')}${C(14, -6, 5, '#7a4a26')}${P('M-14 10 Q0 22 14 10', 'none', 'stroke="#7a4a26" stroke-width="4" stroke-linecap="round"')}</g></g>`;
  s += `<g transform="translate(110 92)"><g class="moon">${C(0, 0, 40, '#fff8c4')}${C(-12, -8, 7, '#efe6a8')}${C(10, 12, 9, '#efe6a8')}</g></g>`;
  const cloud = (y, k, dur, delay) => `<g transform="translate(0 ${y}) scale(${k})"><g class="cloud" style="animation-duration:${dur}s;animation-delay:${delay}s">${E(0, 0, 60, 24, '#fff')}${E(40, -16, 42, 28, '#fff')}${E(80, 0, 52, 22, '#fff')}</g></g>`;
  s += cloud(60, 1, 46, -8) + cloud(130, 0.7, 60, -30) + cloud(90, 0.9, 52, -44);
  // Flugzeug mit Banner
  s += `<g transform="translate(0 150)"><g class="plane">${R(-250, -20, 200, 40, '#fff', 8)}${T(-150, 9, 24, '#ff6b6b', 'Willkommen! 🎉')}${P('M-50 0 L0 0', 'none', 'stroke="#999" stroke-width="2"')}${EMO(30, 16, 48, '✈️', 'transform="rotate(45 30 0)"')}</g></g>`;
  s += `<g transform="translate(1290 260)"><g class="balloon">${EMO(0, 0, 70, '🎈')}</g></g>`;
  // Wiese, Straßen
  s += P(`M0 170 Q350 140 700 170 T${VW} 165 L${VW} ${VH} L0 ${VH}Z`, '#95d5b2');
  s += R(0, 380, VW, 56, '#6c757d') + R(0, 712, VW, 56, '#6c757d');
  for (let x = 10; x < VW; x += 70) s += R(x, 405, 36, 6, '#fff', 3) + R(x + 30, 737, 36, 6, '#fff', 3);
  s += R(686, 436, 28, 276, '#6c757d') + R(380, 436, 28, 276, '#6c757d') + R(980, 436, 28, 276, '#6c757d');
  for (const [x, y] of DECOR_TREES) s += `<g transform="translate(${x} ${y})"><g class="sway" style="animation-delay:${(x % 7) * 0.3}s">${R(-6, -10, 12, 30, '#8d5524', 4)}${C(0, -30, 30, '#52b788')}${C(-14, -20, 18, '#40916c')}</g></g>`;
  // Autos
  s += `<g transform="translate(0 425)"><g class="car carL">${EMO(0, 0, 54, '🚗')}</g></g>`;
  s += `<g transform="translate(0 425)"><g class="car carL2">${EMO(0, 0, 48, '🚕')}</g></g>`;
  s += `<g transform="translate(0 760)"><g class="car carR"><g transform="scale(-1 1)">${EMO(0, 0, 58, '🚌')}</g></g></g>`;
  s += `<g transform="translate(0 860)"><g class="bird">${P('M0 0 q10 -10 20 0 q10 -10 20 0', 'none', 'stroke="#333" stroke-width="3"')}</g></g>`;
  // Gebäude
  let i = 0;
  for (const sc of scenes) {
    const b = BUILDINGS[sc.id];
    if (!b) continue;
    const n = counts[sc.id] || 0;
    s += `<g transform="translate(${b.x} ${b.y})" class="bwrap" data-scene="${sc.id}">
      <g class="bld" style="--d:${0.15 + i * 0.12}s"><g class="bldi" style="animation-delay:${2 + i * 0.7}s">
        ${E(0, 2, 120, 14, '#000', 'opacity=".12"')}${b.draw()}
        <g transform="translate(0 30)">${R(-80, -4, 160, 40, '#fff', 20, 'class="pill"')}${T(0, 25, 22, '#3d2c5e', sc.name)}</g>
        ${n ? `<g transform="translate(96 -150)" class="badge">${C(0, 0, 22, '#ff595e')}${T(0, 8, 20, '#fff', n)}</g>` : ''}
        ${R(-140, -360, 280, 420, 'transparent', 0, 'class="hit"')}
      </g></g></g>`;
    i++;
  }
  s += R(0, 0, VW, VH, '#1a1f5c', 0, 'class="mshade"');
  return `<svg viewBox="0 0 ${VW} ${VH}" preserveAspectRatio="xMidYMid meet">${s}</svg>`;
}

export function createMap({ scenes, go, chars, sfx, unlock, isNight }) {
  const root = document.getElementById('map');
  let busy = false;

  function walkers() {
    return chars().slice(0, 4).map((c, i) =>
      `<div class="walker" style="--d:${i * 4.5}s;--y:${44 + (i % 2) * 2}%"><div class="wbob">${charSVG(c.look, false)}</div></div>`).join('');
  }

  function confetti(n = 70, x = null, y = null) {
    const cols = ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93', '#ff6fb5', '#00bbf9', '#50af30'];
    for (let k = 0; k < n; k++) {
      const c = document.createElement('i');
      c.className = 'confetti' + (x != null ? ' pop' : '');
      c.style.background = cols[k % cols.length];
      c.style.left = (x != null ? x : Math.random() * innerWidth) + 'px';
      c.style.top = (y != null ? y : -20) + 'px';
      c.style.setProperty('--dx', (Math.random() * 2 - 1) * (x != null ? 220 : 120) + 'px');
      c.style.setProperty('--dy', (x != null ? -(Math.random() * 260 + 80) : innerHeight + 60) + 'px');
      c.style.setProperty('--r', Math.random() * 720 + 'deg');
      c.style.animationDelay = (x != null ? 0 : Math.random() * 1.2) + 's';
      c.style.animationDuration = (x != null ? 0.9 : 2.4 + Math.random() * 1.5) + 's';
      root.append(c);
      setTimeout(() => c.remove(), 4500);
    }
  }

  function sparkle(x, y) {
    for (let k = 0; k < 8; k++) {
      const s = document.createElement('span');
      s.className = 'msp';
      s.textContent = ['✨', '⭐', '💫'][k % 3];
      s.style.left = x + 'px';
      s.style.top = y + 'px';
      const a = (k / 8) * Math.PI * 2;
      s.style.setProperty('--dx', Math.cos(a) * 110 + 'px');
      s.style.setProperty('--dy', Math.sin(a) * 110 + 'px');
      root.append(s);
      setTimeout(() => s.remove(), 900);
    }
  }

  function open(first = false) {
    const counts = {};
    for (const c of chars()) counts[c.sc] = (counts[c.sc] || 0) + 1;
    root.innerHTML = `<div class="mapinner">${mapSVG(scenes, counts)}<div class="walkers">${walkers()}</div>
      <h1 class="mtitle">${[...'Tokiboki'].map((ch, k) => `<span style="--k:${k}">${ch}</span>`).join('')}</h1>
      <p class="msub">Wohin geht's? 👆</p></div>`;
    root.classList.toggle('night', isNight());
    root.classList.remove('hidden', 'zoomout');
    document.body.classList.add('map-open');
    busy = false;
    setTimeout(() => confetti(first ? 90 : 50), first ? 900 : 500);
  }

  root.addEventListener('click', (e) => {
    unlock();
    if (busy) return;
    if (e.target.closest('.mtitle')) {
      sfx.sparkle();
      confetti(40, e.clientX, e.clientY);
      root.querySelectorAll('.mtitle span').forEach((s) => { s.classList.remove('hop'); void s.offsetWidth; s.classList.add('hop'); });
      return;
    }
    const w = e.target.closest('.bwrap');
    if (!w) return;
    busy = true;
    const id = w.dataset.scene;
    const inner = w.querySelector('.bldi');
    inner.classList.add('tap');
    sfx.boing();
    sparkle(e.clientX, e.clientY);
    confetti(30, e.clientX, e.clientY);
    const r = w.getBoundingClientRect();
    setTimeout(() => {
      root.style.transformOrigin = `${(r.left + r.right) / 2}px ${(r.top + r.bottom) / 2}px`;
      root.classList.add('zoomout');
      sfx.whoosh();
    }, 420);
    setTimeout(() => go(id), 760);
    setTimeout(() => {
      root.classList.add('hidden');
      root.classList.remove('zoomout');
      document.body.classList.remove('map-open');
      root.innerHTML = '';
    }, 1150);
  });

  return { open };
}
