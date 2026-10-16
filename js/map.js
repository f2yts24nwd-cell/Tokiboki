// Weltkarte (Startseite): animierte Übersicht aller Orte.
import { charSVG } from './art.js';

const VW = 1800;
const VH = 900;
const R = (x, y, w, h, fill, rx = 0, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" ${extra}/>`;
const C = (cx, cy, r, fill, extra = '') => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${extra}/>`;
const E = (cx, cy, rx, ry, fill, extra = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const P = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const T = (x, y, s, fill, txt, extra = '') => `<text x="${x}" y="${y}" font-size="${s}" fill="${fill}" text-anchor="middle" font-weight="800" font-family="ui-rounded, 'Arial Rounded MT Bold', system-ui, sans-serif" ${extra}>${txt}</text>`;
const EMO = (x, y, s, e, extra = '') => `<text x="${x}" y="${y}" font-size="${s}" text-anchor="middle" ${extra}>${e}</text>`;

// Gebäude: Ursprung = unten Mitte
const VOL = (x, y, w, h, rx = 0) => R(x, y, w, h, 'url(#g-vol)', rx);
const VOLH = (x, y, w, h, rx = 0) => R(x, y, w, h, 'url(#g-volh)', rx);
// Fenster mit Rahmen, Glanz und Fensterbank (Glas leuchtet nachts über .win)
const MW = (x, y, w, h, cross = true) => R(x - 3, y - 3, w + 6, h + 6, '#fff', 5) + R(x, y, w, h, '#9ee7ff', 3, 'class="win"') + R(x, y, w, h, 'url(#g-glass)', 3) +
  (cross ? R(x + w / 2 - 1.5, y, 3, h, '#fff') + R(x, y + h / 2 - 1.5, w, 3, '#fff') : '') + R(x - 5, y + h + 2, w + 10, 5, '#fff', 2) + R(x - 5, y + h + 6, w + 10, 2, '#000', 0, 'opacity=".12"');
const ROOF = (d, c) => P(d, c) + P(d, 'url(#g-volh)');
const DOOR = (x, y, w, h, c) => R(x, y, w, h, c, 8) + VOL(x, y, w, h, 8) + R(x + 5, y + 6, w - 10, h * 0.4, '#fff', 4, 'opacity=".18"') + C(x + w - 8, y + h * 0.55, 3.5, '#ffd166') + R(x - 4, y + h - 2, w + 8, 4, '#bbb', 2);

const BUILDINGS = {
  haus: { x: 160, y: 360, draw: () =>
    `<g class="smoke">${C(62, -215, 10, '#fff', 'style="--i:0"')}${C(62, -215, 10, '#fff', 'style="--i:1"')}${C(62, -215, 10, '#fff', 'style="--i:2"')}</g>` +
    R(48, -208, 28, 66, '#c1121f', 3) + VOLH(48, -208, 28, 66, 3) + R(44, -212, 36, 8, '#8f0d17', 2) +
    R(-95, -130, 190, 130, '#ffd6a5', 6) + R(-95, -130, 190, 130, 'url(#mstripes)', 6) + VOLH(-95, -130, 190, 130, 6) + R(-95, -20, 190, 20, '#e8b98a', 0) +
    ROOF('M-120 -120 L0 -218 L120 -120 Z', '#ff6b6b') + [0, 1, 2, 3].map((r) => P(`M${-104 + r * 26} ${-132 - r * 20} L${104 - r * 26} ${-132 - r * 20}`, 'none', 'stroke="#d64545" stroke-width="2.5"')).join('') +
    P('M-120 -120 L0 -218 L120 -120', 'none', 'stroke="#ff9a9a" stroke-width="4" stroke-linejoin="round"') +
    C(0, -160, 18, '#fff') + C(0, -160, 14, '#9ee7ff', 'class="win"') + C(0, -160, 14, 'url(#g-glass)') +
    MW(-80, -110, 44, 40) + MW(36, -110, 44, 40) + R(-82, -64, 48, 10, '#ff8fab', 3) + R(34, -64, 48, 10, '#ff8fab', 3) +
    DOOR(-22, -68, 44, 68, '#9b5de5') + R(-30, -4, 60, 6, '#c9c2bb', 2) + EMO(-100, 6, 34, '🌷') + EMO(100, 6, 34, '🌻') },
  cafe: { x: 450, y: 350, draw: () =>
    R(-100, -165, 200, 165, '#ffc8dd', 6) + VOLH(-100, -165, 200, 165, 6) + R(-100, -40, 200, 40, '#f4a9c4') + R(-100, -40, 200, 3, '#fff', 0, 'opacity=".5"') +
    R(-108, -180, 216, 22, '#ff5d8f', 6) + VOL(-108, -180, 216, 22, 6) + T(0, -128, 30, '#ff5d8f', 'CAFÉ', 'stroke="#fff" stroke-width="3" paint-order="stroke"') +
    Array.from({ length: 8 }, (_, i) => { const d = `M${-100 + i * 25} -112 L${-75 + i * 25} -112 L${-80 + i * 25} -88 Q${-87 + i * 25} -80 ${-95 + i * 25} -88Z`; return P(d, i % 2 ? '#fff' : '#ff5d8f') + P(d, 'url(#g-vol)'); }).join('') +
    MW(-82, -80, 74, 58) + EMO(-46, -32, 22, '🧁') + DOOR(14, -78, 56, 78, '#8d5524') + R(26, -64, 32, 24, '#9ee7ff', 3, 'class="win"') +
    `<g class="steam">${P('M-30 -215 q10 -14 0 -28', 'none', 'stroke="#fff" stroke-width="6" stroke-linecap="round"')}${P('M0 -218 q10 -14 0 -28', 'none', 'stroke="#fff" stroke-width="6" stroke-linecap="round" style="animation-delay:.4s"')}</g>` +
    EMO(-14, -180, 56, '☕', 'class="cup"') + EMO(-118, 4, 32, '🪴') + R(80, -30, 30, 30, '#fff', 4) + R(80, -30, 30, 30, 'url(#g-vol)', 4) + EMO(95, -8, 18, '🍰') },
  markt: { x: 760, y: 360, draw: () =>
    R(-125, -150, 250, 150, '#d8f3dc', 6) + VOLH(-125, -150, 250, 150, 6) + R(-132, -174, 264, 46, '#52b788', 10) + VOL(-132, -174, 264, 46, 10) + T(0, -139, 30, '#fff', 'MARKT') +
    Array.from({ length: 10 }, (_, i) => P(`M${-125 + i * 25} -128 l25 0 l-4 16 q-8 6 -17 0z`, i % 2 ? '#fff' : '#2d9a6a')).join('') +
    R(-104, -104, 94, 104, '#9ee7ff', 4, 'class="win"') + R(-104, -104, 94, 104, 'url(#g-glass)', 4) + R(-58, -104, 3, 104, '#fff') + R(-108, -108, 102, 6, '#40916c', 2) +
    MW(20, -108, 84, 52, false) + R(20, -46, 84, 46, '#c9894a', 4) + VOL(20, -46, 84, 46, 4) + EMO(40, -16, 24, '🍎') + EMO(62, -16, 24, '🍊') + EMO(86, -16, 24, '🍌') + EMO(-150, 4, 46, '🛒', 'class="cart"') },
  friseur: { x: 1060, y: 360, draw: () =>
    R(-90, -160, 180, 160, '#ffe5ec', 6) + VOLH(-90, -160, 180, 160, 6) + R(-98, -178, 196, 42, '#fb6f92', 10) + VOL(-98, -178, 196, 42, 10) + T(0, -147, 24, '#fff', 'FRISEUR') +
    MW(-72, -118, 82, 70) + EMO(-31, -66, 30, '💇') + DOOR(28, -86, 46, 86, '#7b2cbf') +
    `<clipPath id="poleclip"><rect x="-120" y="-130" width="22" height="110" rx="10"/></clipPath>` + R(-122, -136, 26, 122, 'url(#g-metal)', 12) +
    `<g clip-path="url(#poleclip)">${R(-120, -130, 22, 110, '#fff')}<g class="pole">${Array.from({ length: 9 }, (_, i) => P(`M-120 ${-150 + i * 26} L-98 ${-170 + i * 26} L-98 ${-158 + i * 26} L-120 ${-138 + i * 26}Z`, i % 2 ? '#1982c4' : '#e63946')).join('')}</g>${R(-120, -130, 22, 110, 'url(#g-volh)')}</g>` +
    EMO(-30, -186, 44, '✂️', 'class="snip"') },
  festival: { x: 1340, y: 360, draw: () =>
    `<g class="mbeams">${[-50, -25, 0, 25, 50].map((a, i) => `<g class="mbeam" style="--a:${a}deg;animation-delay:${-i * 0.7}s">${P('M-4 -150 L4 -150 L60 -330 L-60 -330Z', ['#ff6fb5', '#2ec4b6', '#ffca3a', '#8ac926', '#00bbf9'][i], 'opacity=".35"')}</g>`).join('')}</g>` +
    `<g transform="translate(-60 -175)"><g class="mwheel">${C(0, 0, 70, 'none', 'stroke="#efe7ff" stroke-width="5"')}${Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2; return P(`M0 0 L${Math.cos(a) * 70} ${Math.sin(a) * 70}`, 'none', 'stroke="#d9cdf2" stroke-width="2"') + C(Math.cos(a) * 70, Math.sin(a) * 70, 9, ['#ff595e', '#ffca3a', '#8ac926', '#00bbf9'][i % 4]); }).join('')}</g>${C(0, 0, 8, '#7b2cbf')}</g>` +
    P('M-90 -10 L-60 -175 L-30 -10', 'none', 'stroke="#d9cdf2" stroke-width="6"') +
    P('M-120 -10 L-120 -120 Q-90 -170 -50 -150 Q0 -230 50 -150 Q90 -170 120 -120 L120 -10Z', '#2b1356') + P('M-120 -10 L-120 -120 Q-90 -170 -50 -150 Q0 -230 50 -150 Q90 -170 120 -120 L120 -10Z', 'url(#g-vol)') +
    Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 2; return E(Math.cos(a) * 44, -110 + Math.sin(a) * 44, 16, 8, ['#ff595e', '#ffca3a', '#8ac926', '#00bbf9', '#ff6fb5'][i % 5], `transform="rotate(${(a * 180) / Math.PI} ${Math.cos(a) * 44} ${-110 + Math.sin(a) * 44})"`); }).join('') +
    C(0, -110, 38, '#e9b949') + C(0, -110, 33, '#ffe1b8') + C(-12, -116, 5, '#4b1d7a') + C(12, -116, 5, '#4b1d7a') + P('M-12 -100 q12 12 24 0', 'none', 'stroke="#8c2f39" stroke-width="3" stroke-linecap="round"') +
    R(-130, -12, 260, 16, '#1a1030', 4) + Array.from({ length: 10 }, (_, i) => R(-124 + i * 25.5, -8, 16, 6, ['#ff595e', '#ffca3a', '#8ac926', '#00bbf9', '#ff6fb5'][i % 5], 3, 'class="mled"')).join('') +
    R(-150, -130, 22, 126, '#1c1c24', 4) + R(128, -130, 22, 126, '#1c1c24', 4) + T(0, -28, 18, '#ffe08a', 'TOKILAND') + EMO(-150, 6, 28, '🎪') + EMO(160, 6, 28, '🎶', 'class="duck"') },
  bad: { x: 175, y: 680, draw: () =>
    R(-100, -140, 200, 140, '#bde8f6', 6) + R(-100, -140, 200, 140, 'url(#p-tiles)', 6) + VOLH(-100, -140, 200, 140, 6) +
    ROOF('M-110 -136 Q0 -252 110 -136Z', '#2ec4b6') + P('M-80 -150 Q-30 -220 30 -230', 'none', 'stroke="#7fe0d6" stroke-width="6" stroke-linecap="round" opacity=".7"') + T(0, -152, 30, '#fff', 'BAD') +
    C(-55, -90, 25, '#fff') + C(-55, -90, 18, '#9ee7ff', 'class="win"') + C(-55, -90, 18, 'url(#g-glass)') + C(55, -90, 25, '#fff') + C(55, -90, 18, '#9ee7ff', 'class="win"') + C(55, -90, 18, 'url(#g-glass)') +
    DOOR(-24, -66, 48, 66, '#ff99c8') + `<g class="bubbles">${[-70, -20, 30, 80].map((x, i) => C(x, -230, 9 + (i % 2) * 5, '#fff', `opacity=".8" style="--i:${i}"`)).join('')}</g>` +
    EMO(0, -224, 40, '🦆', 'class="duck"') + EMO(126, 2, 36, '💩') },
  schule: { x: 470, y: 690, draw: () => '<g transform="scale(.86)">' +
    R(-34, -300, 68, 110, '#ef4444', 6) + R(-34, -300, 68, 110, 'url(#mbrick)', 6) + VOLH(-34, -300, 68, 110, 6) + ROOF('M-46 -296 L0 -350 L46 -296Z', '#991b1b') +
    R(-2, -372, 4, 26, '#555') + `<g class="flag">${P('M1 -372 L40 -364 L1 -354Z', '#22c55e')}</g>` + R(-20, -280, 40, 52, '#7f1d1d', 20) +
    `<g class="mbell">${P('M-16 -232 Q-16 -266 0 -270 Q16 -266 16 -232Z', '#fbbf24')}${P('M-16 -232 Q-16 -266 0 -270 Q16 -266 16 -232Z', 'url(#g-volh)')}${C(0, -228, 5, '#92400e')}</g>` +
    R(-120, -170, 240, 170, '#ef4444', 6) + R(-120, -170, 240, 170, 'url(#mbrick)', 6) + VOLH(-120, -170, 240, 170, 6) + ROOF('M-134 -166 L0 -216 L134 -166Z', '#991b1b') + P('M-134 -166 L0 -216 L134 -166', 'none', 'stroke="#c53030" stroke-width="4"') +
    R(-108, -152, 216, 32, '#fff', 8) + VOL(-108, -152, 216, 32, 8) + T(0, -128, 22, '#dc2626', 'HEYLINSCHULE') +
    MW(-98, -106, 50, 42) + MW(48, -106, 50, 42) + DOOR(-28, -80, 56, 80, '#92400e') + R(-20, -102, 40, 18, '#fff', 4) + T(0, -88, 16, '#dc2626', '4A') + R(-40, -4, 80, 6, '#c9c2bb', 2) +
    EMO(-140, 4, 34, '🎒', 'class="cart"') + EMO(138, 4, 30, '⚽', 'class="duck"') + '</g>' },
  buero: { x: 775, y: 690, draw: () => {
    let w = '';
    for (let r = 0; r < 5; r++) for (let c = 0; c < 4; c++) w += R(-66 + c * 34, -250 + r * 40, 26, 28, '#bfe3f2', 3, `class="owin" style="animation-delay:${((r * 4 + c) * 0.37) % 3}s"`) + R(-66 + c * 34, -250 + r * 40, 26, 28, 'url(#g-glass)', 3);
    return R(-80, -270, 160, 270, '#f4f6f4', 6) + VOLH(-80, -270, 160, 270, 6) + R(-80, -270, 160, 270, 'none', 6, 'stroke="#575757" stroke-width="6"') + w +
      [0, 1, 2, 3, 4].map((r) => R(-74, -218 + r * 40, 148, 3, '#575757', 0, 'opacity=".25"')).join('') +
      P('M-90 -262 L90 -296 L90 -262 Z', '#50af30') + R(-90, -272, 180, 14, '#50af30') + R(-90, -272, 180, 14, 'url(#g-vol)') +
      `<image href="icons/itmx-x.png" x="22" y="-352" width="56" height="60"/>` + R(-30, -54, 60, 54, '#575757', 6) + R(-25, -49, 50, 49, '#9ee7ff', 3, 'class="win"') + R(-25, -49, 50, 49, 'url(#g-glass)', 3) + R(-1, -49, 2, 49, '#575757') +
      R(-44, -4, 88, 6, '#c9cec9', 2) + EMO(-100, 2, 30, '🪴') + EMO(100, 2, 30, '🪴');
  } },
  zoo: { x: 1630, y: 360, draw: () =>
    R(-130, -40, 260, 40, '#c7e3a3', 6) + `<g class="sway">${E(-90, -70, 40, 14, '#5a9a3c')}${R(-93, -70, 6, 40, '#7a5230')}</g>` +
    R(-120, -150, 34, 150, '#a0612b', 6) + R(86, -150, 34, 150, '#a0612b', 6) + VOLH(-120, -150, 34, 150, 6) + VOLH(86, -150, 34, 150, 6) +
    P('M-130 -140 Q0 -230 130 -140 L130 -112 Q0 -196 -130 -112Z', '#8ac926') + P('M-130 -140 Q0 -230 130 -140 L130 -112 Q0 -196 -130 -112Z', 'url(#g-vol)') +
    T(0, -150, 38, '#fff', 'ZOO', 'stroke="#2d6a4f" stroke-width="5" paint-order="stroke"') +
    [0, 1, 2, 3, 4, 5].map((k) => R(-80 + k * 30, -40, 10, 40, '#c9894a', 3)).join('') + R(-84, -30, 168, 7, '#a0612b', 3) +
    EMO(-40, -48, 46, '🦒', 'class="duck"') + EMO(36, -6, 44, '🐘', 'class="cart"') + EMO(-100, 6, 30, '🦁') + EMO(110, 4, 28, '🐧', 'class="duck"') },
  freibad: { x: 1560, y: 690, draw: () =>
    R(-140, -50, 280, 50, '#f3e3c3', 8) + R(-120, -42, 200, 36, '#2aa7e0', 10) + R(-120, -42, 200, 36, 'url(#g-glass)', 10) +
    `<g class="waveg">${P('M-116 -30 q15 -8 30 0 q15 8 30 0 q15 -8 30 0 q15 8 30 0 q15 -8 30 0 q15 8 30 0', 'none', 'stroke="#d8f6ff" stroke-width="3"')}</g>` +
    R(96, -200, 10, 200, '#c9d6df', 3) + R(126, -200, 10, 200, '#c9d6df', 3) + [-170, -130, -90, -50].map((y) => R(96, y, 40, 5, '#9fb3c2', 2)).join('') + R(40, -206, 100, 12, '#00bbf9', 6) +
    P('M-150 -150 L-100 -150 Q-60 -150 -60 -110 Q-60 -60 -20 -40', 'none', 'stroke="#ffca3a" stroke-width="16" stroke-linecap="round"') + R(-160, -150, 12, 150, '#ff924c', 4) +
    EMO(-40, -16, 34, '🏊', 'class="duck"') + EMO(40, -18, 28, '🛟') + EMO(-150, 6, 30, '🌴') },
  park: { x: 1150, y: 680, draw: () =>
    E(0, -6, 192, 36, '#5fbf7f') + E(0, -10, 180, 28, '#74c69d') + E(70, -14, 72, 19, '#2b9fd6') + E(70, -16, 64, 14, '#4cc9f0') + E(56, -20, 22, 4, '#fff', 'opacity=".5"') + EMO(70, -6, 30, '🦆', 'class="duck"') +
    `<g class="sway">${R(-140, -120, 20, 110, '#8d5524', 6)}${VOLH(-140, -120, 20, 110, 6)}${C(-130, -152, 58, '#2d8a55')}${C(-130, -150, 56, '#40916c')}${C(-160, -120, 36, '#4aa36f')}${C(-100, -120, 36, '#4aa36f')}${C(-146, -170, 22, '#74c69d', 'opacity=".5"')}${C(-140, -170, 8, '#e63946')}${C(-110, -140, 8, '#e63946')}${C(-160, -130, 8, '#e63946')}</g>` +
    P('M-60 -6 L-40 -120 L-20 -6 M20 -6 L0 -120 L-20 -6', 'none', 'stroke="#e76f51" stroke-width="8" stroke-linecap="round"') + R(-46, -126, 52, 10, '#bc6c25', 4) +
    `<g class="swing">${P('M-28 -120 L-28 -50 M-12 -120 L-12 -50', 'none', 'stroke="#555" stroke-width="3"')}${R(-36, -52, 32, 8, '#ffca3a', 3)}</g>` +
    `<g class="fountain">${P('M130 -30 q-20 -60 -40 -10 M130 -30 q20 -60 40 -10 M130 -30 l0 -70', 'none', 'stroke="#4cc9f0" stroke-width="6" stroke-linecap="round"')}</g>` + E(130, -24, 36, 11, '#9aa5b1') + E(130, -27, 30, 7, '#4cc9f0') +
    R(30, -30, 6, 26, '#333') + R(26, -40, 14, 12, '#333', 3) + R(29, -38, 8, 8, '#fff7c2', 2) + EMO(-182, 4, 30, '🌼') + EMO(172, 6, 30, '🌷') },
};

const DECOR_TREES = [[40, 470], [1760, 470], [1750, 820], [40, 820], [480, 820], [960, 820], [1380, 560], [1350, 820]];

function mapSVG(scenes, counts) {
  let s = `<defs>
    <pattern id="mstripes" width="30" height="10" patternUnits="userSpaceOnUse">${R(0, 0, 15, 10, '#fff', 0, 'opacity=".25"')}</pattern>
    <pattern id="mbrick" width="24" height="14" patternUnits="userSpaceOnUse">${R(0, 0, 24, 1.5, '#fff', 0, 'opacity=".35"')}${R(0, 7, 24, 1.5, '#fff', 0, 'opacity=".35"')}${R(0, 0, 1.5, 7, '#fff', 0, 'opacity=".35"')}${R(12, 7, 1.5, 7, '#fff', 0, 'opacity=".35"')}</pattern>
    <linearGradient id="msky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fd8ff"/><stop offset="1" stop-color="#c9f1ff"/></linearGradient>
  </defs>`;
  s += R(0, 0, VW, 200, 'url(#msky)', 0, 'class="msky"') + `<g class="mstars">${Array.from({ length: 30 }, (_, i) => C((i * 157) % VW, 10 + ((i * 61) % 170), 1.5 + (i % 3), '#fff8c4')).join('')}</g>`;
  s += `<g transform="translate(110 92)"><g class="sun"><g class="rays">${Array.from({ length: 12 }, (_, i) => R(-4, -78, 8, 26, '#ffd60a', 4, `transform="rotate(${i * 30})"`)).join('')}</g>${C(0, 0, 44, '#ffe066')}${C(-14, -6, 5, '#7a4a26')}${C(14, -6, 5, '#7a4a26')}${P('M-14 10 Q0 22 14 10', 'none', 'stroke="#7a4a26" stroke-width="4" stroke-linecap="round"')}</g></g>`;
  s += `<g transform="translate(110 92)"><g class="moon">${C(0, 0, 40, '#fff8c4')}${C(-12, -8, 7, '#efe6a8')}${C(10, 12, 9, '#efe6a8')}</g></g>`;
  const cloud = (y, k, dur, delay) => `<g transform="translate(0 ${y}) scale(${k})"><g class="cloud" style="animation-duration:${dur}s;animation-delay:${delay}s">${E(0, 0, 60, 24, '#fff')}${E(40, -16, 42, 28, '#fff')}${E(80, 0, 52, 22, '#fff')}</g></g>`;
  s += cloud(60, 1, 46, -8) + cloud(130, 0.7, 60, -30) + cloud(90, 0.9, 52, -44);
  // Flugzeug mit Banner
  s += `<g transform="translate(0 150)"><g class="plane">${R(-250, -20, 200, 40, '#fff', 8)}${T(-150, 9, 24, '#ff6b6b', 'Willkommen! 🎉')}${P('M-50 0 L0 0', 'none', 'stroke="#999" stroke-width="2"')}${EMO(30, 16, 48, '✈️', 'transform="rotate(45 30 0)"')}</g></g>`;
  s += `<g transform="translate(1220 130)"><g class="balloon">${EMO(0, 0, 64, '🎈')}</g></g>`;
  // Wiese, Straßen
  s += P(`M0 170 Q350 140 700 170 T${VW} 165 L${VW} ${VH} L0 ${VH}Z`, '#95d5b2') + P(`M0 170 Q350 140 700 170 T${VW} 165 L${VW} ${VH} L0 ${VH}Z`, 'url(#p-noise)');
  s += P(`M0 175 Q350 145 700 175 T${VW} 170`, 'none', 'stroke="#b7e4c7" stroke-width="6"');
  for (let k = 0; k < 60; k++) { const x = (k * 137) % VW, y = 200 + ((k * 89) % 680); s += P(`M${x} ${y} l3 -9 l3 9`, 'none', 'stroke="#6fbf8e" stroke-width="2" opacity=".7"'); }
  const road = (x, y, w, h) => R(x, y - 6, w, h + 12, '#d6d3d1') + R(x, y - 6, w, 3, '#fff', 0, 'opacity=".5"') + R(x, y + h + 3, w, 3, '#a8a29e') + R(x, y, w, h, '#5f666d') + R(x, y, w, h, 'url(#p-noise)') + R(x, y, w, 6, '#000', 0, 'opacity=".12"');
  s += road(0, 380, VW, 56) + road(0, 712, VW, 56);
  for (let x = 10; x < VW; x += 70) s += R(x, 405, 36, 6, '#fff', 3) + R(x + 30, 737, 36, 6, '#fff', 3);
  s += R(316, 436, 28, 276, '#5f666d') + R(614, 436, 28, 276, '#5f666d') + R(925, 436, 28, 276, '#5f666d') + R(1385, 436, 28, 276, '#5f666d');
  for (const x of [300, 600, 910, 1370]) for (let k = 0; k < 4; k++) s += R(x + 18, 440 + k * 10, 24, 5, '#fff', 1, 'opacity=".85"');
  for (const x of [80, 1000, 1480, 1760]) s += `<g transform="translate(${x} 470)">${R(-3, -60, 6, 60, '#333')}${R(-10, -74, 20, 16, '#333', 4)}${R(-6, -70, 12, 9, '#fff7c2', 2, 'class="win"')}${E(0, 0, 14, 4, '#000', 'opacity=".15"')}</g>`;
  for (const [x, y] of DECOR_TREES) s += `<g transform="translate(${x} ${y})">${E(0, 20, 26, 6, '#000', 'opacity=".15"')}<g class="sway" style="animation-delay:${(x % 7) * 0.3}s">${R(-6, -10, 12, 30, '#8d5524', 4)}${VOLH(-6, -10, 12, 30, 4)}${C(0, -32, 31, '#2d8a55')}${C(0, -30, 30, '#4aa36f')}${C(-14, -20, 18, '#40916c')}${C(-8, -42, 12, '#74c69d', 'opacity=".6"')}</g></g>`;
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
        ${E(0, 2, 130, 16, 'url(#g-sh)')}${b.draw()}
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
