// Orte der Spielwelt: Hintergründe, Möbel, Ablageflächen, Sitzplätze und Startgegenstände.
// Alle Koordinaten sind logische Pixel; die Szene ist 834 px hoch, der Boden liegt bei y=700.

export const H = 834;
const FLOOR = 700;

// ---------- kleine SVG-Helfer ----------
const R = (x, y, w, h, fill, rx = 0, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" ${extra}/>`;
const C = (cx, cy, r, fill, extra = '') => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${extra}/>`;
const E = (cx, cy, rx, ry, fill, extra = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const P = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const G = (x, y, inner) => `<g transform="translate(${x} ${y})">${inner}</g>`;
const T = (x, y, s, fill, txt, extra = '') => `<text x="${x}" y="${y}" font-size="${s}" fill="${fill}" text-anchor="middle" font-family="ui-rounded, 'Arial Rounded MT Bold', system-ui, sans-serif" font-weight="800" ${extra}>${txt}</text>`;

function stars(x, y, w, h, n = 10) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const sx = x + ((i * 97) % w), sy = y + ((i * 53) % h);
    s += C(sx, sy, 1.5 + (i % 3), '#fff8c4');
  }
  return `<g class="stars">${s}</g>`;
}

function windowSVG(x, y, w, h, curtain = '#ff8fab', round = false) {
  const inner = round
    ? `${C(w / 2, h / 2, w / 2, '#fff')}${C(w / 2, h / 2, w / 2 - 10, '#9ee7ff', 'class="sky"')}
       ${C(w * 0.35, h * 0.38, 12, '#ffe066', 'class="daysun"')}${C(w * 0.6, h * 0.4, 11, '#fff8c4', 'class="moon"')}
       ${stars(w * 0.25, h * 0.25, w * 0.5, h * 0.5, 4)}
       ${R(w / 2 - 3, 10, 6, h - 20, '#fff')}${R(10, h / 2 - 3, w - 20, 6, '#fff')}`
    : `${R(-8, -8, w + 16, h + 16, '#fff', 14)}${R(0, 0, w, h, '#9ee7ff', 8, 'class="sky"')}
       ${E(w * 0.3, h * 0.72, w * 0.4, h * 0.18, '#a7e08a', 'class="daysun"')}
       ${C(w * 0.72, h * 0.28, 16, '#ffe066', 'class="daysun"')}${C(w * 0.7, h * 0.3, 14, '#fff8c4', 'class="moon"')}
       ${E(w * 0.3, h * 0.3, 26, 10, '#fff', 'class="daysun"')}
       ${stars(10, 10, w - 20, h * 0.6, 7)}
       ${R(w / 2 - 4, 0, 8, h, '#fff')}${R(0, h / 2 - 4, w, 8, '#fff')}
       ${P(`M-14 -14 Q${w * 0.25} ${h * 0.3} -6 ${h + 10} L-24 ${h + 10} L-24 -14Z`, curtain)}
       ${P(`M${w + 14} -14 Q${w * 0.75} ${h * 0.3} ${w + 6} ${h + 10} L${w + 24} ${h + 10} L${w + 24} -14Z`, curtain)}
       ${R(-30, -22, w + 60, 10, shadeHex(curtain), 5)}
       ${R(-14, h + 8, w + 28, 12, '#f1e3d3', 5)}`;
  return G(x, y, inner);
}

function shadeHex(hex) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v) => Math.max(0, Math.round(v * 0.78));
  return '#' + ((1 << 24) + (f((n >> 16) & 255) << 16) + (f((n >> 8) & 255) << 8) + f(n & 255)).toString(16).slice(1);
}

function frame(x, y, w, h, color, art) {
  return G(x, y, R(0, 0, w, h, color, 6) + R(8, 8, w - 16, h - 16, '#fffaf0', 3) + art);
}

function plant(x, y, s = 1) {
  return G(x, y, `<g transform="scale(${s})">${E(0, -70, 22, 40, '#52b788')}${E(-24, -50, 18, 30, '#40916c', 'transform="rotate(-30 -24 -50)"')}${E(24, -50, 18, 30, '#40916c', 'transform="rotate(30 24 -50)"')}${P('M-24 -30 L24 -30 L18 0 L-18 0Z', '#e76f51')}</g>`);
}

function hangLamp(x, len, color = '#ffca3a') {
  return G(x, 0, R(-2, 0, 4, len, '#555') + P(`M-34 ${len + 34} Q0 ${len - 14} 34 ${len + 34}Z`, color) + E(0, len + 36, 12, 6, '#fff7c2'));
}

function chair(x, y, color) {
  // y = Sitzhöhe
  return G(x, y, R(6, -90, 14, 96, shadeHex(color), 6) + R(0, -4, 90, 16, color, 8) + R(10, 10, 10, 90, shadeHex(color), 4) + R(70, 10, 10, 90, shadeHex(color), 4));
}

function table(x, y, w, color) {
  // y = Tischplatte oben
  return G(x, y, R(0, 0, w, 16, color, 8) + R(w / 2 - 9, 14, 18, FLOOR - y - 20, shadeHex(color), 4) + E(w / 2, FLOOR - y - 4, 50, 8, shadeHex(color)));
}

function shelfUnit(x, y, w, h, color, levels) {
  let s = R(0, 0, w, h, color, 10) + R(10, 10, w - 20, h - 20, shadeHex(color), 6);
  for (const l of levels) s += R(4, l - y, w - 8, 14, '#fff', 4) + R(4, l - y + 12, w - 8, 6, '#e8e8e8');
  return G(x, y, s);
}

// Bodenmuster
function patterns(id) {
  return `<defs>
    <pattern id="${id}-stripes" width="60" height="10" patternUnits="userSpaceOnUse">${R(0, 0, 30, 10, '#fff', 0, 'opacity=".22"')}</pattern>
    <pattern id="${id}-dots" width="50" height="50" patternUnits="userSpaceOnUse">${C(12, 12, 5, '#fff', 'opacity=".35"')}${C(37, 37, 5, '#fff', 'opacity=".35"')}</pattern>
    <pattern id="${id}-tiles" width="48" height="48" patternUnits="userSpaceOnUse">${R(0, 0, 48, 48, 'none', 0, 'stroke="#fff" stroke-width="3" opacity=".6"')}</pattern>
    <pattern id="${id}-checker" width="68" height="68" patternUnits="userSpaceOnUse">${R(0, 0, 34, 34, '#000', 0, 'opacity=".12"')}${R(34, 34, 34, 34, '#000', 0, 'opacity=".12"')}</pattern>
    <pattern id="${id}-wood" width="160" height="34" patternUnits="userSpaceOnUse">${R(0, 32, 160, 2, '#000', 0, 'opacity=".15"')}${R(80, 0, 2, 32, '#000', 0, 'opacity=".12"')}</pattern>
    <pattern id="${id}-planks" width="120" height="44" patternUnits="userSpaceOnUse">${R(0, 0, 2, 44, '#000', 0, 'opacity=".12"')}${R(60, 22, 2, 22, '#000', 0, 'opacity=".1"')}</pattern>
  </defs>`;
}

function room(id, x, w, wall, pat, floor, fpat) {
  return R(x, 36, w, FLOOR - 36, wall) + (pat ? R(x, 36, w, FLOOR - 36, `url(#${id}-${pat})`) : '') +
    R(x, FLOOR, w, H - FLOOR, floor) + (fpat ? R(x, FLOOR, w, H - FLOOR, `url(#${id}-${fpat})`) : '') +
    R(x, FLOOR - 14, w, 16, shadeHex(wall));
}

const svgWrap = (W, inner) => `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" overflow="visible">${inner}</svg>`;

// ======================= HAUS =======================
function hausBG() {
  const W = 3600;
  let s = patterns('haus');
  s += room('haus', 0, 900, '#ffd6a5', 'stripes', '#c68b59', 'wood');
  s += room('haus', 900, 900, '#c7f0c2', null, '#f1f1f1', 'checker');
  s += room('haus', 1800, 900, '#bde8f6', 'tiles', '#e0f4ff', 'tiles');
  s += room('haus', 2700, 900, '#e4c9f7', 'dots', '#ff99c8', null);
  s += R(0, 0, W, 40, '#ff6b6b') + R(0, 34, W, 8, '#e05252');
  for (const x of [900, 1800, 2700]) s += R(x - 14, 40, 28, FLOOR - 40, '#fff4e6') + R(x - 14, 40, 6, FLOOR - 40, '#000', 0, 'opacity=".06"');
  // Wohnzimmer
  s += windowSVG(330, 150, 170, 170, '#ff8fab');
  s += frame(110, 170, 110, 90, '#8d5524', P('M18 74 L45 38 L62 58 L76 44 L94 74Z', '#52b788') + C(80, 28, 9, '#ffca3a'));
  s += frame(650, 110, 90, 110, '#e76f51', C(45, 55, 26, '#ff8fab') + C(36, 50, 4, '#333') + C(54, 50, 4, '#333') + P('M36 64 Q45 72 54 64', 'none', 'stroke="#333" stroke-width="3"'));
  s += E(330, 770, 280, 34, '#ff9f9f') + E(330, 770, 230, 24, '#ffc2c2');
  // Sofa
  s += G(80, 500, R(20, 0, 360, 120, '#4d96ff', 34) + R(10, 88, 380, 64, '#6ba8ff', 22) + R(0, 40, 54, 130, '#3a7fe0', 24) + R(346, 40, 54, 130, '#3a7fe0', 24) +
    R(40, 168, 16, 32, '#2b5fab', 4) + R(344, 168, 16, 32, '#2b5fab', 4) + R(70, 20, 120, 70, '#5aa0ff', 26) + R(210, 20, 120, 70, '#5aa0ff', 26));
  // Stehlampe
  s += G(520, 300, R(-3, 30, 6, 370, '#555') + E(0, 398, 34, 8, '#555') + P('M-40 40 L40 40 L26 0 L-26 0Z', '#ffca3a'));
  // TV-Möbel + Regal
  s += G(600, 590, R(0, 0, 270, 110, '#8d5524', 10) + R(14, 18, 112, 72, '#a86b3c', 8) + R(144, 18, 112, 72, '#a86b3c', 8) + C(116, 54, 5, '#ffd166') + C(154, 54, 5, '#ffd166'));
  s += G(600, 300, R(0, 0, 270, 14, '#8d5524', 6) + P('M20 14 L36 14 L20 40Z', '#6b3f1d') + P('M250 14 L234 14 L250 40Z', '#6b3f1d'));
  // Küche
  s += hangLamp(1350, 60);
  s += windowSVG(1270, 120, 150, 130, '#ffca3a');
  s += G(960, 190, R(0, 0, 250, 130, '#ffffff', 12) + R(10, 10, 110, 110, '#fde2e4', 8) + R(130, 10, 110, 110, '#fde2e4', 8) + R(105, 55, 6, 30, '#999', 3) + R(139, 55, 6, 30, '#999', 3));
  s += G(1240, 300, R(0, 0, 210, 12, '#e9c46a', 6));
  s += G(940, 520, R(0, 0, 280, 16, '#ff9f1c', 6) + R(6, 16, 268, 164, '#ffe5b4') + R(20, 34, 112, 130, '#fff3dc', 8) + R(148, 34, 112, 130, '#fff3dc', 8) +
    C(120, 98, 6, '#c68b59') + C(160, 98, 6, '#c68b59') + R(40, -4, 100, 8, '#bbb', 4) + P('M110 -4 L110 -50 Q110 -60 120 -60 L140 -60', 'none', 'stroke="#999" stroke-width="8" stroke-linecap="round"'));
  // Bad
  s += windowSVG(1960, 150, 120, 120, null, true);
  s += G(1850, 560, R(0, 0, 400, 50, '#d9f2ff', 24) + E(200, 18, 180, 14, '#8fd3ff'));
  s += G(2480, 290, R(0, 0, 150, 190, '#ffffff', 75) + R(10, 10, 130, 170, '#d8f3ff', 65) + P('M40 40 L70 30 L40 110Z', '#fff', 'opacity=".6"'));
  s += G(2470, 560, R(0, 0, 170, 22, '#ffffff', 10) + P('M30 22 L140 22 L110 140 L60 140Z', '#f5f5f5') + R(78, -40, 14, 42, '#aaa', 6) + R(78, -40, 40, 10, '#aaa', 5));
  s += G(2420, 420, R(0, 0, 50, 8, '#999', 4) + R(4, 8, 40, 90, '#ff99c8', 6));
  // Schlafzimmer
  s += windowSVG(2800, 150, 170, 170, '#9b5de5');
  s += frame(3060, 160, 100, 120, '#ffca3a', P('M50 30 L58 52 L82 52 L62 66 L70 90 L50 76 L30 90 L38 66 L18 52 L42 52Z', '#ffca3a'));
  s += E(3000, 770, 260, 32, '#c77dff') + E(3000, 770, 210, 22, '#e0aaff');
  s += G(2740, 480, R(0, 0, 54, 220, '#9b5de5', 22) + R(420, 70, 40, 150, '#9b5de5', 18) + R(20, 150, 430, 50, '#7b3fc4', 10) +
    R(40, 108, 400, 52, '#ffffff', 18) + E(116, 98, 58, 24, '#fff') + E(116, 98, 58, 24, 'none', 'stroke="#eee" stroke-width="3"') + R(40, 190, 20, 30, '#5a2a9a', 4) + R(400, 190, 20, 30, '#5a2a9a', 4));
  s += G(3215, 600, R(0, 0, 90, 100, '#c77dff', 10) + R(10, 36, 70, 6, '#fff', 3) + C(45, 66, 5, '#fff'));
  return svgWrap(W, s);
}

function fridgeSVG() {
  const w = 220, h = 410;
  return svgWrap0(w, h,
    R(0, 0, w, h, '#dbe9ff', 20) + R(12, 12, w - 24, h - 24, '#ffffff', 12) + R(12, 112, w - 24, 8, '#cfe3ff', 3) + R(12, 232, w - 24, 8, '#cfe3ff', 3) +
    E(110, 24, 40, 8, '#fffbe6') +
    `<g class="dclosed">${R(0, 0, w, h, '#8ecae6', 20)}${R(0, 128, w, 6, '#6aaecc')}${R(188, 40, 12, 60, '#fff', 6)}${R(188, 160, 12, 90, '#fff', 6)}
      ${C(50, 60, 12, '#ff595e')}${C(80, 74, 10, '#ffca3a')}${R(36, 190, 60, 74, '#fff', 4, 'transform="rotate(-6 66 227)"')}${C(66, 222, 14, '#ffb703')}${P('M50 250 L82 250', 'none', 'stroke="#219ebc" stroke-width="5"')}</g>
     <g class="dopen">${P(`M0 0 L-64 18 L-64 ${h - 18} L0 ${h}Z`, '#8ecae6')}${R(-44, 60, 30, 10, '#fff', 4)}${R(-44, 180, 30, 10, '#fff', 4)}</g>`);
}

function wardrobeSVG() {
  const w = 240, h = 450;
  return svgWrap0(w, h,
    R(0, 0, w, h, '#a06cd5', 16) + R(12, 12, w - 24, h - 24, '#f3e8ff', 10) + R(12, 162, w - 24, 8, '#c8a2ff', 3) + R(12, 302, w - 24, 8, '#c8a2ff', 3) +
    R(20, 40, w - 40, 6, '#999', 3) +
    `<g class="dclosed">${R(0, 0, w / 2, h, '#c77dff', 16)}${R(w / 2, 0, w / 2, h, '#b565f0', 16)}${C(w / 2 - 16, h / 2, 7, '#ffd166')}${C(w / 2 + 16, h / 2, 7, '#ffd166')}
      ${R(20, 30, w / 2 - 40, 150, '#d9a4ff', 12)}${R(w / 2 + 20, 30, w / 2 - 40, 150, '#c681ff', 12)}${R(20, 250, w / 2 - 40, 170, '#d9a4ff', 12)}${R(w / 2 + 20, 250, w / 2 - 40, 170, '#c681ff', 12)}</g>
     <g class="dopen">${P(`M0 0 L-56 20 L-56 ${h - 20} L0 ${h}Z`, '#c77dff')}${P(`M${w} 0 L${w + 56} 20 L${w + 56} ${h - 20} L${w} ${h}Z`, '#b565f0')}</g>`);
}

function toiletSVG(seat = '#f4f4f4') {
  return svgWrap0(130, 180, R(20, 0, 90, 80, '#fff', 12) + R(84, 12, 16, 8, '#aaa', 4) + E(65, 96, 58, 14, seat) + E(65, 92, 50, 10, '#e0e0e0') +
    P('M14 100 Q20 150 44 160 L86 160 Q110 150 116 100Z', '#fff') + R(40, 158, 50, 22, '#f4f4f4', 6) +
    `<g class="swirl">${E(65, 92, 34, 6, '#4cc9f0')}</g>`);
}

function tubFront() {
  return svgWrap0(400, 112,
    R(0, 0, 400, 92, '#ffffff', 40) + R(16, 12, 368, 10, '#e9f6ff', 5) + R(40, 88, 30, 24, '#ffd166', 8) + R(330, 88, 30, 24, '#ffd166', 8) +
    C(60, 2, 16, '#fff') + C(90, -4, 20, '#fff') + C(126, 0, 14, '#fff') + C(300, 0, 16, '#fff') + C(330, -6, 20, '#fff') + C(355, 2, 13, '#fff'));
}

function svgWrap0(w, h, inner) {
  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" overflow="visible">${inner}</svg>`;
}

const hausProps = [
  { id: 'tv', kind: 'toggle', x: 620, y: 430, w: 230, h: 160, sound: 'tv',
    svg: svgWrap0(230, 160, R(0, 0, 230, 150, '#2b2d42', 14) + R(12, 12, 206, 126, '#111', 8) +
      `<g class="tvon">${R(12, 12, 206, 126, '#ff595e', 8, 'class="tvcol"')}${C(70, 75, 26, '#fff', 'class="tvball"')}${P('M120 120 L160 50 L200 120Z', '#fff', 'opacity=".7"')}</g>` +
      R(95, 150, 40, 10, '#2b2d42', 3)) },
  { id: 'radio', kind: 'toggle', x: 620, y: 222, w: 110, h: 78, sound: 'music',
    svg: svgWrap0(110, 78, R(0, 10, 110, 68, '#e76f51', 14) + C(34, 46, 20, '#333') + C(34, 46, 12, '#555') + R(64, 30, 34, 8, '#fff', 4) + R(64, 46, 34, 8, '#fff', 4) + C(90, 66, 5, '#ffca3a', 'class="led"') + P('M20 10 L50 -14', 'none', 'stroke="#555" stroke-width="4" stroke-linecap="round"')) },
  { id: 'stove', kind: 'toggle', x: 1220, y: 470, w: 220, h: 230, sound: 'sizzle',
    svg: svgWrap0(220, 230, R(0, 50, 220, 180, '#f1f1f1', 10) + R(0, 44, 220, 12, '#cfcfcf', 4) + E(60, 50, 36, 6, '#333') + E(160, 50, 36, 6, '#333') +
      `<g class="flame">${E(60, 46, 30, 6, '#ff9f1c')}${E(160, 46, 30, 6, '#ff9f1c')}${E(60, 46, 18, 4, '#ffd60a')}${E(160, 46, 18, 4, '#ffd60a')}</g>` +
      C(40, 76, 8, '#555') + C(80, 76, 8, '#555') + C(140, 76, 8, '#555') + C(180, 76, 8, '#555') + R(40, 98, 140, 8, '#999', 4) +
      R(30, 116, 160, 92, '#333', 12) + R(30, 116, 160, 92, '#ff9f1c', 12, 'class="ovenglow"')) },
  { id: 'fridge', kind: 'container', x: 1520, y: 290, w: 220, h: 410, sound: 'door', svg: fridgeSVG(),
    region: { x1: 1530, x2: 1730, y1: 300, y2: 692 } },
  { id: 'shower', kind: 'toggle', x: 2150, y: 190, w: 110, h: 140, sound: 'splash',
    svg: svgWrap0(110, 140, R(80, 0, 12, 110, '#aaa', 6) + R(40, 98, 52, 12, '#aaa', 6) + P('M20 112 L70 112 L60 130 L30 130Z', '#bbb') +
      `<g class="water">${[28, 38, 48, 58].map((x) => `<path d="M${x + 2} 132 L${x - 6} 400" stroke="#4cc9f0" stroke-width="5" stroke-linecap="round" stroke-dasharray="14 18" class="drops"/>`).join('')}</g>`) },
  { id: 'toilet', kind: 'flush', x: 2300, y: 520, w: 130, h: 180, sound: 'flush', svg: toiletSVG(), bowl: { x1: 2310, x2: 2420, y: 612 } },
  { id: 'lamp', kind: 'toggle', x: 3225, y: 470, w: 70, h: 130, init: true,
    svg: svgWrap0(70, 130, R(32, 50, 6, 70, '#666') + E(35, 124, 24, 6, '#666') + P('M6 56 L64 56 L52 4 L18 4Z', '#ffd166', 'class="shade"')) },
  { id: 'wardrobe', kind: 'container', x: 3330, y: 250, w: 240, h: 450, sound: 'door', svg: wardrobeSVG(),
    region: { x1: 3342, x2: 3558, y1: 262, y2: 692 } },
];

const hausFG = [
  { x: 1850, y: 588, w: 400, h: 112, svg: tubFront() },
  { x: 2930, y: 548, w: 260, h: 110, svg: svgWrap0(260, 110,
    R(0, 0, 260, 96, '#ff99c8', 26) + R(0, 0, 40, 96, '#ffc8dd', 20) + C(90, 40, 8, '#fff', 'opacity=".6"') + C(150, 60, 8, '#fff', 'opacity=".6"') + C(210, 34, 8, '#fff', 'opacity=".6"')) },
];

// ======================= CAFÉ =======================
function cafeBG() {
  const W = 1800;
  let s = patterns('cafe');
  s += R(0, 0, W, FLOOR, '#ffc8dd') + R(0, 0, W, FLOOR, 'url(#cafe-stripes)') + R(0, 470, W, FLOOR - 470, '#bde0fe') + R(0, 462, W, 12, '#fff') +
    R(0, FLOOR, W, H - FLOOR, '#ffffff') + R(0, FLOOR, W, H - FLOOR, 'url(#cafe-checker)') + R(0, FLOOR - 14, W, 16, '#8ec5f5');
  for (let x = 30; x < W; x += 120) s += R(x, 490, 90, 180, '#a9d6ff', 10);
  s += G(260, 110, R(-10, -10, 540, 290, '#fff', 18) + R(0, 0, 520, 270, '#9ee7ff', 10, 'class="sky"') +
    `<g class="daysun">${R(30, 140, 90, 130, '#ffadad')}${R(130, 100, 100, 170, '#ffd6a5')}${R(250, 160, 80, 110, '#caffbf')}${R(350, 120, 120, 150, '#bdb2ff')}${C(440, 60, 24, '#ffe066')}</g>` +
    C(440, 60, 20, '#fff8c4', 'class="moon"') + stars(20, 20, 480, 110, 9) + R(255, 0, 10, 270, '#fff') +
    T(130, 60, 44, '#ff5d8f', 'CAFÉ', 'opacity=".9"'));
  for (let i = 0; i < 9; i++) s += P(`M${250 + i * 60} 80 L${310 + i * 60} 80 L${300 + i * 60} 116 Q${280 + i * 60} 130 ${260 + i * 60} 116Z`, i % 2 ? '#fff' : '#ff5d8f', 'transform="translate(0 -6)"');
  s += hangLamp(260, 30, '#ff5d8f') + hangLamp(720, 30, '#ff5d8f') + hangLamp(1300, 30, '#ffca3a');
  s += G(1130, 110, R(0, 0, 340, 200, '#2d6a4f', 14) + R(10, 10, 320, 180, '#1b4332', 8) + T(170, 56, 32, '#fff', 'MENÜ') +
    `<text x="40" y="104" font-size="26">☕ 🧁 🍰</text><text x="40" y="150" font-size="26">🥐 🍩 🍪</text>` + T(270, 104, 22, '#ffd166', '1 🪙') + T(270, 150, 22, '#ffd166', '2 🪙'));
  s += chair(50, 600, '#ff924c') + chair(370, 600, '#ff924c') + chair(510, 600, '#8ac926') + chair(830, 600, '#8ac926');
  s += table(140, 560, 220, '#ffffff') + table(600, 560, 220, '#ffffff');
  s += G(1040, 500, R(0, 0, 700, 20, '#8d5524', 8) + R(10, 20, 680, 180, '#c68b59') + R(30, 40, 640, 140, '#a86b3c', 12) +
    `<text x="200" y="128" font-size="60" opacity=".35">☕</text><text x="420" y="128" font-size="60" opacity=".35">🧁</text>`);
  s += G(1250, 380, R(0, 108, 230, 14, '#ddd', 6) + R(4, 0, 222, 110, '#e8f8ff', 10, 'opacity=".5"') + R(4, 56, 222, 6, '#fff'));
  s += plant(40, 700, 1.1) + plant(1000, 700, 1);
  return svgWrap(W, s);
}

const cafeProps = [
  { id: 'kaffee', kind: 'spawn', x: 1080, y: 356, w: 140, h: 144, spawn: ['☕', '☕', '🥛', '🍵'], sound: 'pop', from: [1260, 360],
    svg: svgWrap0(140, 144, R(0, 0, 140, 144, '#333', 16) + R(10, 10, 120, 40, '#555', 10) + C(40, 30, 8, '#ff595e') + C(70, 30, 8, '#8ac926') + C(100, 30, 8, '#ffca3a') +
      R(50, 56, 40, 18, '#777', 6) + R(30, 126, 80, 10, '#777', 4) + R(64, 74, 12, 20, '#7f5539', 4, 'class="pour"')) },
  { id: 'kasse', kind: 'spawn', x: 1580, y: 410, w: 130, h: 90, spawn: ['🪙'], sound: 'coin', from: [1640, 380],
    svg: svgWrap0(130, 90, P('M10 30 L120 30 L130 90 L0 90Z', '#ff595e') + R(30, 0, 70, 34, '#333', 8) + T(65, 26, 20, '#8ac926', '2,50') + R(20, 50, 90, 10, '#fff', 4) + R(20, 66, 90, 10, '#fff', 4)) },
];

const cafeFG = [
  { x: 1250, y: 380, w: 230, h: 120, svg: svgWrap0(230, 120, R(4, 0, 222, 120, '#bfefff', 10, 'opacity=".25"') + P('M20 10 L60 10 L30 100 L10 100Z', '#fff', 'opacity=".35"') + R(0, 0, 230, 8, '#ddd', 4)) },
];

// ======================= SUPERMARKT =======================
function marktBG() {
  const W = 2300;
  let s = patterns('markt');
  s += R(0, 0, W, FLOOR, '#d8f3dc') + R(0, 0, W, 120, '#52b788') + R(0, 116, W, 10, '#40916c') +
    T(700, 86, 64, '#fff', 'SUPERMARKT') + T(1900, 86, 50, '#ffd166', 'KASSE') +
    R(0, FLOOR, W, H - FLOOR, '#e9ecef') + R(0, FLOOR, W, H - FLOOR, 'url(#markt-tiles)') + R(0, FLOOR - 14, W, 16, '#95d5b2');
  s += shelfUnit(100, 250, 400, 450, '#ff8fab', [370, 490, 610]);
  s += shelfUnit(560, 250, 400, 450, '#ffd166', [370, 490, 610]);
  s += shelfUnit(1020, 250, 400, 450, '#90e0ef', [370, 490, 610]);
  s += G(150, 160, R(0, 0, 300, 60, '#fff', 30) + T(150, 42, 32, '#ff5d8f', 'Obst & Gemüse'));
  s += G(610, 160, R(0, 0, 300, 60, '#fff', 30) + T(150, 42, 32, '#e09f3e', 'Süßes & Brot'));
  s += G(1070, 160, R(0, 0, 300, 60, '#fff', 30) + T(150, 42, 32, '#0096c7', 'Getränke'));
  s += G(1500, 560, R(0, 0, 280, 140, '#4ea8de', 16) + R(12, 12, 256, 30, '#caf0f8', 8) + T(140, 100, 30, '#fff', 'EIS ❄️'));
  s += G(1500, 220, R(0, 0, 280, 90, '#fff', 20) + T(140, 60, 36, '#ff595e', '% ANGEBOT %'));
  s += G(1880, 540, R(0, 0, 360, 160, '#adb5bd', 12) + R(0, 0, 360, 22, '#343a40', 8) + R(20, 40, 320, 100, '#ced4da', 10));
  s += plant(1830, 700, 1.1);
  return svgWrap(W, s);
}

const marktProps = [
  { id: 'kasse2', kind: 'spawn', x: 2110, y: 430, w: 120, h: 110, spawn: ['🪙', '🪙', '🪙', '💎'], sound: 'coin', from: [2000, 420],
    svg: svgWrap0(120, 110, P('M10 40 L110 40 L120 110 L0 110Z', '#4361ee') + R(20, 0, 80, 44, '#222', 8) + T(60, 30, 22, '#8ac926', '9,99') + R(20, 64, 80, 10, '#fff', 4) + R(20, 82, 80, 10, '#fff', 4)) },
];

const marktFG = [
  { x: 1500, y: 560, w: 280, h: 46, svg: svgWrap0(280, 46, R(0, 0, 280, 18, '#bde0fe', 8, 'opacity=".7"')) },
];

// ======================= FRISEUR =======================
function friseurBG() {
  const W = 1500;
  let s = patterns('fris');
  s += R(0, 0, W, FLOOR, '#ffe5ec') + R(0, 0, W, FLOOR, 'url(#fris-stripes)') + R(0, FLOOR, W, H - FLOOR, '#ffb3c6') + R(0, FLOOR, W, H - FLOOR, 'url(#fris-checker)') + R(0, FLOOR - 14, W, 16, '#fb6f92');
  s += G(560, 40, R(0, 0, 380, 70, '#fb6f92', 35) + T(190, 50, 40, '#fff', 'FRISEUR ✂️'));
  const mirror = (x) => {
    let m = R(0, 0, 200, 250, '#ffd166', 100) + R(12, 12, 176, 226, '#d8f3ff', 88) + P('M50 50 L90 36 L50 150Z', '#fff', 'opacity=".55"');
    for (let i = 0; i < 6; i++) m += C(100 + Math.cos(Math.PI + (i * Math.PI) / 5) * 112, 120 + Math.sin(Math.PI + (i * Math.PI) / 5) * 136, 9, '#fff7c2');
    return G(x, 130, m);
  };
  s += mirror(140) + mirror(520);
  const salonChair = (x) => G(x, 470, R(10, 0, 100, 110, '#e63946', 30) + R(0, 96, 120, 30, '#c1121f', 14) + R(52, 126, 16, 70, '#888') + E(60, 222, 56, 10, '#666'));
  s += salonChair(180) + salonChair(560);
  s += G(860, 540, R(0, 0, 260, 160, '#fff', 12) + R(0, 0, 260, 18, '#fb6f92', 8) + R(16, 34, 108, 110, '#ffe5ec', 8) + R(136, 34, 108, 110, '#ffe5ec', 8));
  s += G(860, 330, R(0, 0, 260, 12, '#fb6f92', 6));
  s += G(1200, 470, R(10, 0, 100, 110, '#7b2cbf', 30) + R(0, 96, 120, 30, '#5a189a', 14) + R(52, 126, 16, 70, '#888') + E(60, 222, 56, 10, '#666'));
  s += G(1420, 280, R(0, 0, 40, 160, '#fff', 20) + `<g opacity=".9">${[0, 1, 2, 3].map((i) => P(`M0 ${i * 40 + 10} L40 ${i * 40 - 10} L40 ${i * 40 + 10} L0 ${i * 40 + 30}Z`, i % 2 ? '#1982c4' : '#e63946')).join('')}</g>` + R(-6, -10, 52, 14, '#ccc', 6) + R(-6, 156, 52, 14, '#ccc', 6));
  s += plant(60, 700, 1);
  return svgWrap(W, s);
}

const friseurProps = [
  { id: 'trockner', kind: 'dryer', x: 1170, y: 300, w: 180, h: 180, seat: 'friseur:s3', sound: 'dryer',
    svg: svgWrap0(180, 180, R(150, 40, 14, 140, '#aaa', 6) + P('M156 60 L120 70', 'none', 'stroke="#aaa" stroke-width="10"') +
      P('M10 120 Q10 40 90 40 Q170 40 170 120 L150 132 Q90 110 30 132Z', '#c77dff') + E(90, 124, 62, 12, '#9d4edd') +
      `<g class="wind">${P('M40 140 Q50 150 40 162', 'none', 'stroke="#fff" stroke-width="4"')}${P('M90 144 Q100 154 90 166', 'none', 'stroke="#fff" stroke-width="4"')}${P('M140 140 Q150 150 140 162', 'none', 'stroke="#fff" stroke-width="4"')}</g>`) },
];

// ======================= PARK =======================
function parkBG() {
  const W = 2600;
  let s = R(0, 0, W, H, '#9ee7ff', 0, 'class="sky"') + stars(0, 20, W, 300, 40) +
    C(1600, 120, 54, '#ffe066', 'class="daysun"') + C(1600, 120, 44, '#fff8c4', 'class="moon"');
  const cloud = (x, y, k) => G(x, y, `<g class="daysun" transform="scale(${k})">${E(0, 0, 60, 26, '#fff')}${E(40, -16, 44, 30, '#fff')}${E(80, 0, 54, 24, '#fff')}</g>`);
  s += cloud(300, 120, 1) + cloud(900, 80, 0.8) + cloud(2100, 140, 1.1);
  s += E(400, 640, 600, 200, '#95d5b2') + E(1400, 660, 700, 220, '#74c69d') + E(2300, 640, 600, 200, '#95d5b2');
  s += R(0, 620, W, H - 620, '#52b788') + R(0, FLOOR, W, H - FLOOR, '#40916c') + P(`M0 760 Q${W / 2} 730 ${W} 770 L${W} 800 Q${W / 2} 760 0 790Z`, '#d4a373');
  for (let x = 20; x < W; x += 60) s += R(x, 610, 10, 60, '#fff', 3) + R(x - 6, 620, 70, 8, '#fff', 3);
  const flower = (x, c) => G(x, FLOOR + 30, R(-2, -30, 4, 30, '#2d6a4f') + C(-8, -32, 7, c) + C(8, -32, 7, c) + C(0, -40, 7, c) + C(0, -24, 7, c) + C(0, -32, 5, '#ffd60a'));
  [60, 520, 940, 1420, 1800, 2150, 2560].forEach((x, i) => (s += flower(x, ['#ff595e', '#ff6fb5', '#ffca3a', '#9b5de5'][i % 4])));
  // Sandkasten
  s += G(1450, 640, R(0, 30, 310, 40, '#e9c46a', 10) + E(155, 34, 150, 16, '#f4d58d'));
  // Bank
  s += G(1830, 520, R(0, 0, 280, 22, '#bc6c25', 8) + R(0, 30, 280, 22, '#bc6c25', 8) + R(0, 88, 280, 18, '#dda15e', 8) + R(20, 100, 14, 80, '#555') + R(246, 100, 14, 80, '#555'));
  // Hundehütte
  s += G(2160, 560, P('M0 50 L90 0 L180 50Z', '#e63946') + R(14, 50, 152, 90, '#f4a261') + P('M60 140 L60 100 Q90 70 120 100 L120 140Z', '#6b3f1d') + T(90, 80, 18, '#fff', 'WAU'));
  // Laternen
  const lantern = (x) => G(x, 380, R(-5, 20, 10, 300, '#333') + R(-18, 0, 36, 36, '#333', 6) + R(-12, 6, 24, 24, '#fff7c2', 4));
  s += lantern(950) + lantern(1800);
  return svgWrap(W, s);
}

const parkProps = [
  { id: 'baum', kind: 'tree', x: 80, y: 110, w: 400, h: 590, spawn: ['🍎', '🍎', '🍐', '🍎', '🐦'], sound: 'pop',
    svg: svgWrap0(400, 590, R(170, 260, 60, 330, '#8d5524', 20) + P('M200 380 L120 300', 'none', 'stroke="#8d5524" stroke-width="22" stroke-linecap="round"') +
      `<g class="canopy">${C(200, 170, 150, '#40916c')}${C(90, 220, 90, '#52b788')}${C(310, 220, 90, '#52b788')}${C(200, 80, 90, '#52b788')}
      ${C(120, 150, 14, '#e63946')}${C(260, 120, 14, '#e63946')}${C(300, 260, 14, '#e63946')}${C(170, 260, 14, '#e63946')}${C(220, 200, 14, '#e63946')}${C(80, 260, 14, '#e63946')}</g>`) },
  { id: 'schaukel', kind: 'swing', x: 560, y: 300, w: 360, h: 400,
    svg: svgWrap0(360, 400, P('M20 400 L60 20 M100 400 L60 20 M260 400 L300 20 M340 400 L300 20', 'none', 'stroke="#e76f51" stroke-width="16" stroke-linecap="round"') +
      R(50, 14, 260, 18, '#bc6c25', 8) +
      `<g class="sw sw0">${P('M68 30 L68 300 M112 30 L112 300', 'none', 'stroke="#555" stroke-width="4"')}${R(56, 296, 68, 14, '#ffca3a', 6)}</g>
       <g class="sw sw1">${P('M228 30 L228 300 M272 30 L272 300', 'none', 'stroke="#555" stroke-width="4"')}${R(216, 296, 68, 14, '#ff6fb5', 6)}</g>`) },
  { id: 'rutsche', kind: 'deco', x: 1000, y: 380, w: 400, h: 320,
    svg: svgWrap0(400, 320, R(20, 40, 10, 280, '#1982c4', 4) + R(90, 40, 10, 280, '#1982c4', 4) +
      [80, 130, 180, 230, 280].map((y) => R(26, y, 70, 8, '#1982c4', 4)).join('') + R(10, 36, 110, 14, '#1982c4', 6) +
      P('M100 44 Q210 60 260 200 Q290 290 395 300 L395 320 Q270 312 240 210 Q200 80 100 64Z', '#ff595e')) },
  { id: 'eiswagen', kind: 'spawn', x: 2380, y: 380, w: 200, h: 320, spawn: ['🍦', '🍨', '🍧', '🍭'], sound: 'ding', from: [2480, 470],
    svg: svgWrap0(200, 320, R(96, 0, 8, 120, '#888') + P('M0 40 Q100 -20 200 40Z', '#ff6fb5') + P('M30 40 Q50 20 70 40 M130 40 Q150 20 170 40', 'none', 'stroke="#fff" stroke-width="6"') +
      R(10, 180, 180, 110, '#fff', 14) + R(0, 172, 200, 16, '#00bbf9', 8) + T(100, 250, 30, '#ff6fb5', 'EIS 🍦') + C(50, 296, 22, '#333') + C(150, 296, 22, '#333') + C(50, 296, 8, '#ccc') + C(150, 296, 8, '#ccc')) },
];

const parkFG = [
  { x: 1450, y: 688, w: 310, h: 30, svg: svgWrap0(310, 30, R(0, 0, 310, 26, '#d4a373', 8)) },
];

// ======================= BADEZIMMER =======================
function badBG() {
  const W = 2100;
  let s = patterns('bad');
  s += R(0, 0, W, FLOOR, '#c9f2ee') + R(0, 0, W, FLOOR, 'url(#bad-tiles)') + R(0, 0, W, 40, '#2ec4b6') +
    R(0, 380, W, FLOOR - 380, '#a8e6df') + R(0, 380, W, FLOOR - 380, 'url(#bad-tiles)') + R(0, 372, W, 10, '#fff') +
    R(0, FLOOR, W, H - FLOOR, '#e8f7ff') + R(0, FLOOR, W, H - FLOOR, 'url(#bad-checker)') + R(0, FLOOR - 14, W, 16, '#7fd1c7');
  // Regendusche: Duschwanne, Rückwand, Armatur, Ablage
  s += G(70, 110, R(0, 0, 420, 580, '#e6fbff', 10) + R(0, 0, 420, 580, 'url(#bad-tiles)'));
  s += G(60, 680, R(0, 0, 440, 22, '#ffffff', 8) + E(220, 6, 30, 4, '#bbb'));
  s += G(90, 70, R(0, 0, 380, 10, '#bbb', 5));
  s += G(370, 430, R(0, 0, 60, 90, '#ddd', 14) + C(30, 30, 14, '#999') + C(30, 30, 6, '#ff595e') + R(24, 56, 12, 24, '#999', 5));
  s += G(100, 380, R(0, 0, 130, 12, '#fff', 6));
  s += G(250, 190, R(0, 0, 160, 34, '#fff', 17) + T(80, 25, 20, '#2ec4b6', 'REGENDUSCHE'));
  // Fenster, Handtücher
  s += windowSVG(700, 130, 140, 140, null, true);
  s += G(560, 150, R(0, 0, 70, 8, '#999', 4) + R(4, 8, 30, 110, '#ff99c8', 6) + R(36, 8, 30, 90, '#ffd166', 6));
  // Badewanne (Rückseite)
  s += G(600, 560, R(0, 0, 400, 50, '#d9f2ff', 24) + E(200, 18, 180, 14, '#8fd3ff'));
  // Waschbecken mit Spiegel
  s += G(1110, 240, R(0, 0, 200, 210, '#ffffff', 100) + R(12, 12, 176, 186, '#d8f3ff', 88) + P('M50 50 L90 36 L50 140Z', '#fff', 'opacity=".55"'));
  s += G(1090, 560, R(0, 0, 240, 22, '#ffffff', 10) + E(120, 8, 70, 8, '#d9f2ff') + R(10, 22, 220, 118, '#2ec4b6', 10) + R(26, 38, 90, 86, '#5fd3c7', 8) + R(124, 38, 90, 86, '#5fd3c7', 8) +
    C(106, 80, 5, '#fff') + C(134, 80, 5, '#fff'));
  s += E(1210, 780, 120, 22, '#ff99c8') + E(800, 780, 160, 24, '#ffd166');
  // Zwei Toiletten mit Trennwänden
  s += G(1430, 120, R(0, 0, 560, 70, '#2ec4b6', 20) + T(140, 48, 34, '#fff', 'WC 1') + T(420, 48, 34, '#fff', 'WC 2'));
  const wall = (x) => G(x, 250, R(0, 0, 20, 420, '#ff924c', 8) + R(4, 410, 12, 30, '#999', 3));
  s += wall(1420) + wall(1690) + wall(1960);
  const paper = (x) => G(x, 500, R(0, 0, 40, 8, '#999', 4) + C(20, 22, 16, '#fff') + C(20, 22, 5, '#ddd') + R(14, 36, 12, 34, '#fff', 3));
  s += paper(1630) + paper(1900);
  s += plant(2050, 700, 1);
  s += hangLamp(800, 50, '#2ec4b6') + hangLamp(1600, 40, '#2ec4b6');
  return svgWrap(W, s);
}

const badProps = [
  { id: 'regen', kind: 'toggle', x: 110, y: 70, w: 340, h: 70, sound: 'splash',
    svg: svgWrap0(340, 70, R(160, 0, 20, 30, '#aaa', 4) + R(0, 26, 340, 34, '#cfcfcf', 14) + R(10, 52, 320, 8, '#9a9a9a', 4) +
      [40, 80, 120, 160, 200, 240, 280, 300].map((x) => C(x, 56, 3, '#777')).join('') +
      `<g class="water">${Array.from({ length: 12 }, (_, i) => 22 + i * 27).map((x, i) => `<path d="M${x} 64 L${x - 4} 620" stroke="#4cc9f0" stroke-width="5" stroke-linecap="round" stroke-dasharray="${12 + (i % 3) * 4} 22" class="drops" opacity=".85"/>`).join('')}</g>`) },
  { id: 'wannenhahn', kind: 'toggle', x: 950, y: 470, w: 70, h: 90, sound: 'splash',
    svg: svgWrap0(70, 90, R(46, 0, 14, 90, '#aaa', 6) + R(6, 10, 54, 14, '#aaa', 7) + C(52, 44, 10, '#ff595e') +
      `<g class="water"><path d="M12 24 L10 120" stroke="#4cc9f0" stroke-width="8" stroke-linecap="round" stroke-dasharray="14 10" class="drops"/></g>`) },
  { id: 'wasserhahn', kind: 'toggle', x: 1180, y: 500, w: 60, h: 60, sound: 'splash',
    svg: svgWrap0(60, 60, R(24, 10, 12, 50, '#aaa', 6) + R(4, 10, 32, 12, '#aaa', 6) + C(30, 6, 8, '#4f8cff') +
      `<g class="water"><path d="M8 22 L8 62" stroke="#4cc9f0" stroke-width="6" stroke-linecap="round" stroke-dasharray="10 8" class="drops"/></g>`) },
  { id: 'klo1', kind: 'flush', x: 1490, y: 520, w: 130, h: 180, sound: 'flush', svg: toiletSVG('#ffd6e7'), bowl: { x1: 1500, x2: 1610, y: 612 } },
  { id: 'klo2', kind: 'flush', x: 1760, y: 520, w: 130, h: 180, sound: 'flush', svg: toiletSVG('#d6f0ff'), bowl: { x1: 1770, x2: 1880, y: 612 } },
];

const badFG = [
  { x: 486, y: 110, w: 16, h: 580, svg: svgWrap0(16, 580, R(0, 0, 16, 580, '#bfefff', 6, 'opacity=".45"') + R(4, 20, 4, 200, '#fff', 2, 'opacity=".7"')) },
  { x: 600, y: 588, w: 400, h: 112, svg: tubFront() },
];

// ======================= itmX BÜRO =======================
const ITMX = '#50af30';
const ITMX_D = '#3d8a24';
const GREY = '#575757';
const OFFICES = [700, 1300, 1900];
const OFFICE_NAMES = ['Beratung', 'Entwicklung', 'Projekte'];

function img(href, x, y, w, h) {
  return `<image href="${href}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet"/>`;
}

function slantTag(x, y, w, text) {
  return G(x, y, P(`M0 10 L${w} 0 L${w} 44 L0 44Z`, ITMX) + T(w / 2, 32, 22, '#fff', text));
}

function officeChair(x, color = GREY) {
  // x = Sitzmitte, Sitzfläche bei y=592
  return G(x - 50, 470, R(18, 0, 64, 100, color, 22) + R(0, 112, 100, 22, shadeHex(color), 11) + R(44, 134, 12, 70, '#888') +
    P('M10 222 L50 200 L90 222', 'none', 'stroke="#666" stroke-width="8" stroke-linecap="round"') + C(10, 224, 6, '#333') + C(90, 224, 6, '#333') + C(50, 222, 6, '#333'));
}

function desk(x) {
  // Tischplatte bei y=540, Breite 240
  return G(x, 540, R(0, 0, 240, 16, '#ffffff', 6) + R(0, 14, 240, 4, '#ddd') + R(10, 16, 12, 144, GREY, 4) + R(218, 16, 12, 144, GREY, 4) +
    R(150, 18, 70, 90, '#e9ecea', 6) + R(162, 40, 46, 6, '#bbb', 3) + R(162, 70, 46, 6, '#bbb', 3) +
    R(70, -8, 70, 8, '#333', 3) + E(160, -4, 10, 5, '#333'));
}

function bueroBG() {
  const W = 3100;
  let s = patterns('buero');
  s += R(0, 0, W, FLOOR, '#f4f6f4') + R(0, 0, W, 40, GREY) + R(0, 36, W, 6, ITMX) +
    R(0, FLOOR, W, H - FLOOR, '#a3a9a3') + R(0, FLOOR, W, H - FLOOR, 'url(#buero-tiles)') + R(0, FLOOR - 14, W, 16, '#c9cec9');
  // Grüne Schräge als Wandakzent (wie im Logo)
  for (let x = 0; x < W; x += 600) s += P(`M${x} 640 L${x + 600} 610 L${x + 600} 686 L${x} 686Z`, ITMX, 'opacity=".18"');
  // Empfang: Logo-Wand
  s += P('M50 160 L660 104 L660 440 L50 440Z', ITMX) + R(90, 196, 530, 214, '#fff', 18) + img('icons/itmx-logo.png', 110, 206, 490, 191);
  s += G(470, 400, R(0, 140, 220, 16, '#fff', 6) + R(6, 156, 208, 144, '#e3e7e3', 6) + R(16, 170, 90, 116, '#d3d8d3', 6) + R(114, 170, 90, 116, '#d3d8d3', 6));
  s += G(80, 520, R(0, 0, 350, 20, '#fff', 8) + P('M10 20 L340 20 L340 180 L10 180Z', ITMX) + P('M10 20 L340 20 L340 46 L10 60Z', ITMX_D) + img('icons/itmx-x.png', 140, 76, 70, 76));
  s += plant(30, 700, 1.1);
  // Büros mit Fenstern, Schreibtischen, Stühlen
  OFFICES.forEach((d, i) => {
    s += windowSVG(d + 150, 110, 300, 200, '#c9cec9');
    s += slantTag(d + 20, 54, 190, OFFICE_NAMES[i]);
    s += img('icons/itmx-x.png', d + 520, 50, 50, 54);
    s += officeChair(d + 90, i === 1 ? ITMX : GREY) + officeChair(d + 380, i === 1 ? GREY : ITMX);
    s += desk(d + 30) + desk(d + 320);
    s += E(d + 300, 760, 240, 26, '#8d948d');
  });
  // Meetingraum
  s += slantTag(2520, 54, 190, 'Meeting');
  [2620, 2740, 2860].forEach((x) => (s += officeChair(x, ITMX)));
  s += plant(3060, 700, 1);
  // Glaswände zwischen den Räumen
  for (const x of [690, 1290, 1890, 2490]) s += R(x, 42, 16, FLOOR - 42, '#bfe3f2', 0, 'opacity=".6"') + R(x, 42, 16, 10, GREY) + R(x + 4, 120, 3, 300, '#fff', 1, 'opacity=".8"');
  OFFICES.concat([2500]).forEach((x) => (s += hangLamp(x + 300, 50, ITMX)));
  return svgWrap(W, s);
}

function monitorSVG() {
  return svgWrap0(120, 120, R(0, 0, 120, 84, '#2b2b2b', 8) + R(6, 6, 108, 72, '#111', 4) + R(52, 84, 16, 22, '#555') + R(30, 104, 60, 14, '#555', 5) +
    `<g class="tvon">${R(6, 6, 108, 72, '#f4f6f4', 4)}${R(6, 6, 108, 12, ITMX, 4)}${R(14, 26, 60, 6, GREY, 3)}${R(14, 38, 80, 6, ITMX, 3)}${R(14, 50, 46, 6, GREY, 3)}${R(64, 50, 6, 18, '#111', 1, 'class="led"')}
      ${R(84, 46, 8, 22, ITMX)}${R(96, 36, 8, 32, ITMX_D)}</g>`);
}

const bueroProps = [
  { id: 'itmxkaffee', kind: 'spawn', x: 510, y: 400, w: 110, h: 140, spawn: ['☕', '☕', '🥛', '🍪'], sound: 'pop', from: [640, 380],
    svg: svgWrap0(110, 140, R(0, 0, 110, 140, GREY, 14) + R(8, 8, 94, 36, '#333', 8) + C(30, 26, 7, ITMX) + C(55, 26, 7, '#fff') + C(80, 26, 7, '#ffca3a') +
      R(38, 52, 34, 16, '#777', 5) + R(22, 122, 66, 9, '#777', 4) + R(50, 68, 10, 20, '#7f5539', 3)) },
  ...OFFICES.flatMap((d, i) => [
    { id: `mon${i}a`, kind: 'toggle', x: d + 120, y: 420, w: 120, h: 120, sound: 'click', svg: monitorSVG() },
    { id: `mon${i}b`, kind: 'toggle', x: d + 410, y: 420, w: 120, h: 120, sound: 'click', svg: monitorSVG() },
  ]),
  { id: 'beamer', kind: 'toggle', x: 2590, y: 160, w: 320, h: 190, sound: 'tv',
    svg: svgWrap0(320, 190, R(0, 0, 320, 180, '#2b2b2b', 10) + R(8, 8, 304, 164, '#111', 6) +
      `<g class="tvon">${R(8, 8, 304, 164, '#fff', 6)}${img('icons/itmx-logo.png', 20, 18, 130, 51)}
      ${R(180, 110, 22, 50, ITMX)}${R(210, 90, 22, 70, ITMX_D)}${R(240, 60, 22, 100, ITMX)}${R(270, 30, 22, 130, ITMX_D)}
      ${R(20, 90, 140, 8, GREY, 4)}${R(20, 110, 110, 8, '#bbb', 4)}${R(20, 130, 130, 8, '#bbb', 4)}</g>`) },
  { id: 'drucker', kind: 'spawn', x: 2955, y: 590, w: 120, h: 110, spawn: ['📄', '📄', '📄', '📊'], sound: 'click', from: [3015, 560],
    svg: svgWrap0(120, 110, R(0, 20, 120, 90, '#e3e7e3', 12) + R(10, 0, 100, 28, '#c9cec9', 8) + R(20, 50, 80, 8, '#333', 4) + C(100, 80, 6, ITMX) + R(16, 92, 88, 6, '#bbb', 3)) },
];

const bueroFG = [
  { x: 2550, y: 556, w: 380, h: 144, svg: svgWrap0(380, 144, R(0, 0, 380, 18, '#ffffff', 8) + P('M14 18 L366 18 L366 144 L14 144Z', GREY) + P('M14 18 L366 18 L366 40 L14 54Z', ITMX) + img('icons/itmx-x.png', 166, 66, 48, 52)) },
];

// ======================= Szenen =======================
export const SCENES = [
  {
    id: 'haus', name: 'Mein Haus', icon: '🏠', W: 3600, ceil: 70, bg: hausBG(), props: hausProps, fg: hausFG,
    glows: [{ x: 520, y: 330, r: 260 }, { x: 1350, y: 140, r: 300 }, { x: 2200, y: 200, r: 260 }, { x: 3260, y: 500, r: 240, prop: 'lamp' }, { x: 735, y: 510, r: 200, prop: 'tv' }],
    surfaces: [
      { x1: 110, x2: 450, y: 592 }, { x1: 80, x2: 132, y: 540 }, { x1: 428, x2: 480, y: 540 },
      { x1: 600, x2: 870, y: 590 }, { x1: 600, x2: 870, y: 300 },
      { x1: 960, x2: 1210, y: 190 }, { x1: 940, x2: 1220, y: 520 }, { x1: 1220, x2: 1440, y: 520 }, { x1: 1240, x2: 1450, y: 300 },
      { x1: 1520, x2: 1740, y: 290 }, { x1: 1532, x2: 1728, y: 402, c: 'fridge' }, { x1: 1532, x2: 1728, y: 522, c: 'fridge' }, { x1: 1532, x2: 1728, y: 688, c: 'fridge' },
      { x1: 1860, x2: 2240, y: 640 }, { x1: 2470, x2: 2640, y: 560 }, { x1: 2310, x2: 2420, y: 612 },
      { x1: 2780, x2: 3180, y: 590 }, { x1: 3215, x2: 3305, y: 600 },
      { x1: 3330, x2: 3570, y: 250 }, { x1: 3344, x2: 3556, y: 412, c: 'wardrobe' }, { x1: 3344, x2: 3556, y: 552, c: 'wardrobe' }, { x1: 3344, x2: 3556, y: 688, c: 'wardrobe' },
    ],
    seats: [
      { id: 'haus:sofa1', x: 190, y: 596, pose: 'sit' }, { id: 'haus:sofa2', x: 280, y: 596, pose: 'sit' }, { id: 'haus:sofa3', x: 370, y: 596, pose: 'sit' },
      { id: 'haus:wanne1', x: 1990, y: 640, pose: 'tub' }, { id: 'haus:wanne2', x: 2120, y: 640, pose: 'tub' },
      { id: 'haus:klo', x: 2365, y: 616, pose: 'sit', toilet: 'toilet' },
      { id: 'haus:bett', x: 2945, y: 550, pose: 'lie' },
    ],
    zones: [
      { kind: 'cook', prop: 'stove', x1: 1225, x2: 1435, y: 520 },
      { kind: 'cold', prop: 'fridge' },
      { kind: 'bath', prop: 'shower', seats: ['haus:wanne1', 'haus:wanne2'] },
    ],
  },
  {
    id: 'cafe', name: 'Café', icon: '☕', W: 1800, ceil: 70, bg: cafeBG(), props: cafeProps, fg: cafeFG,
    glows: [{ x: 260, y: 110, r: 260 }, { x: 720, y: 110, r: 260 }, { x: 1300, y: 110, r: 260 }],
    surfaces: [
      { x1: 140, x2: 360, y: 560 }, { x1: 600, x2: 820, y: 560 },
      { x1: 50, x2: 140, y: 600 }, { x1: 370, x2: 460, y: 600 }, { x1: 510, x2: 600, y: 600 }, { x1: 830, x2: 920, y: 600 },
      { x1: 1040, x2: 1740, y: 500 }, { x1: 1256, x2: 1474, y: 438 }, { x1: 1252, x2: 1478, y: 380 },
    ],
    seats: [
      { id: 'cafe:s1', x: 95, y: 602, pose: 'sit' }, { id: 'cafe:s2', x: 415, y: 602, pose: 'sit' },
      { id: 'cafe:s3', x: 555, y: 602, pose: 'sit' }, { id: 'cafe:s4', x: 875, y: 602, pose: 'sit' },
    ],
    zones: [],
  },
  {
    id: 'markt', name: 'Supermarkt', icon: '🛒', W: 2300, ceil: 140, bg: marktBG(), props: marktProps, fg: marktFG,
    glows: [{ x: 600, y: 140, r: 320 }, { x: 1300, y: 140, r: 320 }, { x: 2000, y: 140, r: 320 }],
    surfaces: [
      ...[100, 560, 1020].flatMap((x) => [250, 370, 490, 610].map((y) => ({ x1: x + 4, x2: x + 396, y }))),
      { x1: 1500, x2: 1780, y: 560 }, { x1: 1880, x2: 2240, y: 540 },
    ],
    seats: [],
    zones: [],
  },
  {
    id: 'friseur', name: 'Friseur', icon: '💇', W: 1500, ceil: 120, bg: friseurBG(), props: friseurProps, fg: [],
    glows: [{ x: 240, y: 255, r: 220 }, { x: 620, y: 255, r: 220 }],
    surfaces: [{ x1: 860, x2: 1120, y: 540 }, { x1: 860, x2: 1120, y: 330 }],
    seats: [
      { id: 'friseur:s1', x: 240, y: 572, pose: 'sit' }, { id: 'friseur:s2', x: 620, y: 572, pose: 'sit' }, { id: 'friseur:s3', x: 1260, y: 572, pose: 'sit' },
    ],
    zones: [],
  },
  {
    id: 'bad', name: 'Badezimmer', icon: '🛁', W: 2100, ceil: 70, bg: badBG(), props: badProps, fg: badFG,
    glows: [{ x: 800, y: 130, r: 280 }, { x: 1600, y: 120, r: 300 }],
    surfaces: [
      { x1: 100, x2: 230, y: 380 }, { x1: 610, x2: 990, y: 640 }, { x1: 1090, x2: 1330, y: 560 },
      { x1: 1500, x2: 1610, y: 612 }, { x1: 1770, x2: 1880, y: 612 },
      { x1: 1512, x2: 1598, y: 520 }, { x1: 1782, x2: 1868, y: 520 },
    ],
    seats: [
      { id: 'bad:wanne1', x: 730, y: 640, pose: 'tub' }, { id: 'bad:wanne2', x: 870, y: 640, pose: 'tub' },
      { id: 'bad:klo1', x: 1555, y: 616, pose: 'sit', toilet: 'klo1' }, { id: 'bad:klo2', x: 1825, y: 616, pose: 'sit', toilet: 'klo2' },
    ],
    zones: [
      { kind: 'bath', prop: 'wannenhahn', seats: ['bad:wanne1', 'bad:wanne2'] },
      { kind: 'rain', prop: 'regen', x1: 110, x2: 460 },
    ],
  },
  {
    id: 'buero', name: 'itmX Büro', icon: '🏢', iconHTML: '<img src="icons/itmx-x.png" alt="">', W: 3100, ceil: 70, bg: bueroBG(), props: bueroProps, fg: bueroFG,
    glows: [{ x: 1000, y: 120, r: 300 }, { x: 1600, y: 120, r: 300 }, { x: 2200, y: 120, r: 300 }, { x: 2800, y: 120, r: 300 }, { x: 2750, y: 260, r: 220, prop: 'beamer' }],
    surfaces: [
      { x1: 80, x2: 430, y: 520 }, { x1: 470, x2: 690, y: 540 },
      ...OFFICES.flatMap((d) => [{ x1: d + 30, x2: d + 270, y: 540 }, { x1: d + 320, x2: d + 560, y: 540 }]),
      { x1: 2556, x2: 2924, y: 556 }, { x1: 2960, x2: 3070, y: 590 },
    ],
    seats: [
      ...OFFICES.flatMap((d, i) => [
        { id: `buero:${i}a`, x: d + 90, y: 592, pose: 'sit' }, { id: `buero:${i}b`, x: d + 380, y: 592, pose: 'sit' },
      ]),
      { id: 'buero:m1', x: 2620, y: 600, pose: 'sit' }, { id: 'buero:m2', x: 2740, y: 600, pose: 'sit' }, { id: 'buero:m3', x: 2860, y: 600, pose: 'sit' },
    ],
    zones: OFFICES.flatMap((d, i) => [{ kind: 'desk', seat: `buero:${i}a`, prop: `mon${i}a` }, { kind: 'desk', seat: `buero:${i}b`, prop: `mon${i}b` }]),
  },
  {
    id: 'park', name: 'Park', icon: '🌳', W: 2600, ceil: 110, bg: parkBG(), props: parkProps, fg: parkFG,
    glows: [{ x: 950, y: 400, r: 260 }, { x: 1800, y: 400, r: 260 }],
    surfaces: [
      { x1: 1060, x2: 1110, y: 418 },
      { x1: 1830, x2: 2110, y: 610 }, { x1: 2390, x2: 2570, y: 560 }, { x1: 2160, x2: 2340, y: 560 }, { x1: 1462, x2: 1748, y: 688 },
    ],
    seats: [
      { id: 'park:schaukel0', x: 650, y: 604, pose: 'swing', swing: 0, top: 330 }, { id: 'park:schaukel1', x: 810, y: 604, pose: 'swing', swing: 1, top: 330 },
      { id: 'park:rutsche', x: 1070, y: 424, pose: 'slide', path: [[1070, 424], [1130, 436], [1190, 470], [1240, 560], [1290, 640], [1350, 676], [1420, 690]] },
      { id: 'park:bank1', x: 1905, y: 612, pose: 'sit' }, { id: 'park:bank2', x: 2035, y: 612, pose: 'sit' },
    ],
    zones: [],
  },
];

// ======================= Startbelegung =======================
const it = (sc, k, x, y) => ({ t: 'i', sc, k, x, y });
const ch = (sc, x, y, look, seat) => ({ t: 'c', sc, x, y, look, seat: seat || null });

export function initialObjects() {
  const o = [];
  // Haus – Wohnzimmer
  o.push(it('haus', '🧸', 450, 540), it('haus', '🎮', 700, 590), it('haus', '📚', 820, 300), it('haus', '🪴', 870, 700), it('haus', '⚽', 560, 700), it('haus', '🐱', 640, 700));
  // Küche
  o.push(it('haus', '🍞', 980, 520), it('haus', '🥚', 1040, 520), it('haus', '🥔', 1090, 520), it('haus', '🌽', 1150, 520), it('haus', '🍯', 1290, 300), it('haus', '🍅', 1360, 300), it('haus', '🍌', 1420, 300));
  o.push(it('haus', '🥛', 1570, 402), it('haus', '🧀', 1640, 402), it('haus', '🥩', 1700, 402), it('haus', '🥕', 1570, 522), it('haus', '🍉', 1660, 522), it('haus', '💧', 1580, 688), it('haus', '🍓', 1650, 688), it('haus', '🍫', 1700, 688));
  // Bad
  o.push(it('haus', '🦆', 1930, 640), it('haus', '🧼', 2510, 560), it('haus', '🪥', 2600, 560), it('haus', '🧻', 2460, 700));
  // Schlafzimmer
  o.push(it('haus', '🧸', 3100, 590), it('haus', '⏰', 3250, 600), it('haus', '🎁', 3150, 700));
  o.push(it('haus', '👕', 3380, 412), it('haus', '👗', 3450, 412), it('haus', '👖', 3520, 412), it('haus', '🧢', 3380, 552), it('haus', '👒', 3460, 552), it('haus', '🕶️', 3530, 552), it('haus', '👟', 3400, 688), it('haus', '🎀', 3500, 688));
  // Café
  o.push(it('cafe', '☕', 200, 560), it('cafe', '🥐', 290, 560), it('cafe', '🧃', 650, 560), it('cafe', '🍪', 760, 560));
  o.push(it('cafe', '🍰', 1300, 438), it('cafe', '🧁', 1370, 438), it('cafe', '🧁', 1430, 438), it('cafe', '🍩', 1300, 500), it('cafe', '🥐', 1380, 500), it('cafe', '🍩', 1450, 500), it('cafe', '🍪', 1530, 500));
  // Markt
  const rows = [
    ['🍎', '🍌', '🍐', '🍇', '🍓'], ['🥕', '🌽', '🥦', '🍅', '🥔'], ['🍉', '🍋', '🥝', '🍑', '🥒'],
    ['🍞', '🥐', '🥨', '🧀', '🥚'], ['🍪', '🍫', '🍭', '🍩', '🧁'], ['🍕', '🍔', '🌭', '🥞', '🍯'],
    ['🥛', '🧃', '🥤', '💧', '🍵'], ['🥤', '🧃', '🥛', '💧', '🧃'], ['🧻', '🧼', '🪥', '🧴', '🎈'],
  ];
  [100, 560, 1020].forEach((x, u) => {
    [370, 490, 610].forEach((y, r) => {
      rows[u * 3 + r].forEach((k, i) => o.push(it('markt', k, x + 50 + i * 75, y)));
    });
  });
  o.push(it('markt', '🍦', 1550, 560), it('markt', '🍨', 1630, 560), it('markt', '🧊', 1710, 560), it('markt', '🛒', 1650, 700), it('markt', '🧺', 1920, 540));
  // Friseur
  o.push(it('friseur', '✂️', 890, 540), it('friseur', '🧴', 950, 540), it('friseur', '🎀', 1010, 540), it('friseur', '👓', 1070, 540));
  o.push(it('friseur', '🎩', 890, 330), it('friseur', '👑', 960, 330), it('friseur', '🧢', 1030, 330), it('friseur', '👒', 1090, 330));
  // Park
  o.push(it('park', '🐶', 2120, 700), it('park', '⚽', 1200, 700), it('park', '🪣', 1520, 688), it('park', '🎈', 1650, 110), it('park', '🦋', 300, 110), it('park', '🐰', 1700, 700), it('park', '🦆', 2300, 700));
  // Badezimmer
  o.push(it('bad', '🧴', 130, 380), it('bad', '🧼', 190, 380), it('bad', '🦆', 700, 640), it('bad', '🦆', 900, 640), it('bad', '🪥', 1130, 560), it('bad', '🧼', 1290, 560));
  o.push(it('bad', '💩', 1555, 612), it('bad', '💩', 1825, 612), it('bad', '🧻', 1540, 520), it('bad', '🧻', 1825, 520), it('bad', '💩', 2000, 700), it('bad', '🧻', 1460, 700));
  // itmX Büro
  o.push(it('buero', '🔔', 140, 520), it('buero', '📄', 220, 520), it('buero', '🖊️', 300, 520), it('buero', '🪴', 390, 520), it('buero', '☕', 560, 540), it('buero', '☕', 670, 540));
  OFFICES.forEach((d, i) => {
    o.push(it('buero', ['📁', '🎧', '📎'][i], d + 60, 540), it('buero', ['☕', '📱', '📄'][i], d + 345, 540), it('buero', ['📎', '☕', '🖊️'][i], d + 520, 540));
  });
  o.push(it('buero', '💻', 2650, 556), it('buero', '📊', 2760, 556), it('buero', '☕', 2850, 556), it('buero', '🪴', 2470, 700));
  // Figuren
  o.push(ch('haus', 280, 596, { skin: '#f8c9a0', hair: 'zoepfe', hc: '#c8501e', style: 'kleid', shirt: '#ff6fb5', pants: '#1982c4', shoes: '#ff595e', hat: '', glasses: '' }, 'haus:sofa2'));
  o.push(ch('haus', 1060, 700, { skin: '#8a5530', hair: 'afro', hc: '#111111', style: 'tshirt', shirt: '#ffca3a', pants: '#1982c4', shoes: '#333333', hat: '', glasses: 'rund' }));
  o.push(ch('cafe', 415, 602, { skin: '#ffe3cf', hair: 'kurz', hc: '#f2c94c', style: 'streifen', shirt: '#8ac926', pants: '#6a4c93', shoes: '#ffffff', hat: 'cap', glasses: '' }, 'cafe:s2'));
  o.push(ch('friseur', 240, 572, { skin: '#b97a4a', hair: 'lang', hc: '#3b2416', style: 'tshirt', shirt: '#ff924c', pants: '#00bbf9', shoes: '#ff6fb5', hat: '', glasses: '' }, 'friseur:s1'));
  o.push(ch('park', 1905, 612, { skin: '#e0a46e', hair: 'irokese', hc: '#9b5de5', style: 'pulli', shirt: '#00bbf9', pants: '#333333', shoes: '#ffca3a', hat: '', glasses: 'sonne' }, 'park:bank1'));
  o.push(ch('bad', 300, 700, { skin: '#ffe3cf', hair: 'pony', hc: '#4f8cff', style: 'streifen', shirt: '#2ec4b6', pants: '#ffca3a', shoes: '#ff595e', hat: '', glasses: '' }));
  o.push(ch('buero', 790, 592, { skin: '#f8c9a0', hair: 'kurz', hc: '#3b2416', style: 'pulli', shirt: '#50af30', pants: '#333333', shoes: '#333333', hat: '', glasses: 'rund' }, 'buero:0a'));
  o.push(ch('buero', 1680, 592, { skin: '#b97a4a', hair: 'dutt', hc: '#111111', style: 'tshirt', shirt: '#ffffff', pants: '#1982c4', shoes: '#50af30', hat: '', glasses: '' }, 'buero:1b'));
  o.push(ch('buero', 1990, 592, { skin: '#ffe3cf', hair: 'lang', hc: '#f2c94c', style: 'streifen', shirt: '#575757', pants: '#6a4c93', shoes: '#ffffff', hat: '', glasses: 'rund' }, 'buero:2a'));
  o.push(ch('buero', 400, 700, { skin: '#e0a46e', hair: 'pony', hc: '#c8501e', style: 'kleid', shirt: '#50af30', pants: '#ffffff', shoes: '#575757', hat: '', glasses: '' }));
  o.push(ch('park', 700, 700, { skin: '#ffc4d6', hair: 'dutt', hc: '#ff7eb6', style: 'kleid', shirt: '#ffca3a', pants: '#ffffff', shoes: '#9b5de5', hat: 'schleife', glasses: '' }));
  return o;
}
