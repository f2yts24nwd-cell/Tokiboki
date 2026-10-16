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

// ---------- gemeinsame Verläufe & Muster (einmal im Dokument) ----------
export const GLOBAL_DEFS = `<svg id="gdefs" width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
  <radialGradient id="g-sh"><stop offset="0" stop-color="#000" stop-opacity=".5"/><stop offset=".6" stop-color="#000" stop-opacity=".18"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
  <linearGradient id="g-vol" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset=".35" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>
  <linearGradient id="g-volh" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".18"/><stop offset=".3" stop-color="#fff" stop-opacity=".18"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".2"/></linearGradient>
  <linearGradient id="g-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".1"/><stop offset=".18" stop-color="#000" stop-opacity="0"/><stop offset=".85" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></linearGradient>
  <linearGradient id="g-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".3"/><stop offset=".15" stop-color="#000" stop-opacity=".06"/><stop offset=".6" stop-color="#fff" stop-opacity=".05"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></linearGradient>
  <linearGradient id="g-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#62bff5"/><stop offset="1" stop-color="#d4f1ff"/></linearGradient>
  <linearGradient id="g-beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff8d6" stop-opacity=".3"/><stop offset="1" stop-color="#fff8d6" stop-opacity="0"/></linearGradient>
  <linearGradient id="g-folds" x1="0" y1="0" y2="0" spreadMethod="repeat" gradientUnits="userSpaceOnUse" x2="22">
    <stop offset="0" stop-color="#000" stop-opacity=".2"/><stop offset=".45" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#000" stop-opacity=".2"/></linearGradient>
  <linearGradient id="g-glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".4" stop-color="#fff" stop-opacity=".08"/><stop offset=".55" stop-color="#fff" stop-opacity=".3"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <linearGradient id="g-metal" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8d939a"/><stop offset=".35" stop-color="#e9edf1"/><stop offset=".6" stop-color="#b4bac1"/><stop offset="1" stop-color="#7c828a"/></linearGradient>
  <linearGradient id="g-pot" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b9502c"/><stop offset=".4" stop-color="#f0895c"/><stop offset="1" stop-color="#9e3f1d"/></linearGradient>
  <radialGradient id="g-bulb"><stop offset="0" stop-color="#fffbe0"/><stop offset=".5" stop-color="#fff3b0" stop-opacity=".6"/><stop offset="1" stop-color="#fff3b0" stop-opacity="0"/></radialGradient>
  <pattern id="p-grain" width="140" height="40" patternUnits="userSpaceOnUse">
    <path d="M0 8 q35 -5 70 0 t70 0 M0 22 q30 4 60 0 t80 2 M0 33 q40 -4 80 0 t60 -1" stroke="#000" stroke-width="1.2" fill="none" opacity=".12"/>
    <ellipse cx="96" cy="16" rx="7" ry="3" fill="none" stroke="#000" stroke-width="1" opacity=".1"/></pattern>
  <pattern id="p-planks" width="200" height="34" patternUnits="userSpaceOnUse">
    <rect width="200" height="2" y="32" fill="#000" opacity=".22"/><rect x="0" width="2" height="34" fill="#000" opacity=".18"/><rect x="1" y="1" width="198" height="2" fill="#fff" opacity=".1"/>
    <path d="M14 12 q40 -5 80 0 t90 2 M8 24 q50 4 100 0 t80 -2" stroke="#000" stroke-width="1.2" fill="none" opacity=".1"/></pattern>
  <pattern id="p-tiles" width="56" height="56" patternUnits="userSpaceOnUse"><rect width="56" height="56" fill="none" stroke="#000" stroke-opacity=".1" stroke-width="3"/><rect x="3" y="3" width="50" height="10" fill="#fff" opacity=".18" rx="2"/></pattern>
  <pattern id="p-noise" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="4" cy="6" r="1" fill="#000" opacity=".08"/><circle cx="16" cy="14" r="1" fill="#000" opacity=".08"/><circle cx="10" cy="20" r="1" fill="#fff" opacity=".12"/><circle cx="20" cy="3" r="1" fill="#fff" opacity=".12"/></pattern>
  <pattern id="p-damask" width="70" height="80" patternUnits="userSpaceOnUse">
    <path d="M35 10 q10 14 0 28 q-10 -14 0 -28z M35 50 q8 10 0 20 q-8 -10 0 -20z" fill="#000" opacity=".05"/><path d="M0 40 q8 -8 0 -16 M70 40 q-8 -8 0 -16" stroke="#fff" stroke-width="2" fill="none" opacity=".25"/>
    <circle cx="35" cy="44" r="2.5" fill="#fff" opacity=".35"/></pattern>
</defs></svg>`;

const VOL = (x, y, w, h, rx = 0) => R(x, y, w, h, 'url(#g-vol)', rx);
const VOLH = (x, y, w, h, rx = 0) => R(x, y, w, h, 'url(#g-volh)', rx);
const SH = (cx, cy, rx, ry = 10, o = 1) => E(cx, cy, rx, ry, 'url(#g-sh)', `opacity="${o}"`);
const GRAIN = (x, y, w, h, rx = 0) => R(x, y, w, h, 'url(#p-grain)', rx);
const GLASS = (x, y, w, h, rx = 0) => R(x, y, w, h, 'url(#g-glass)', rx);

function stars(x, y, w, h, n = 10) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const sx = x + ((i * 97) % w), sy = y + ((i * 53) % h);
    s += C(sx, sy, 1.5 + (i % 3), '#fff8c4');
  }
  return `<g class="stars">${s}</g>`;
}

function cityView(w, h) {
  // Blick nach draußen: Hügel, Häuser mit Fenstern, Baum
  let s = E(w * 0.25, h * 0.95, w * 0.5, h * 0.28, '#7ccf7a') + E(w * 0.85, h, w * 0.4, h * 0.25, '#62b862');
  const hs = [[0.08, 0.55, 0.16, '#a9bccd'], [0.28, 0.42, 0.18, '#c3d1de'], [0.5, 0.6, 0.14, '#b5c6d6'], [0.68, 0.48, 0.17, '#d0dbe5']];
  for (const [fx, fy, fw, c] of hs) {
    const x = w * fx, y = h * fy, ww = w * fw;
    s += R(x, y, ww, h - y, c) + R(x, y, ww * 0.3, h - y, '#fff', 0, 'opacity=".18"');
    for (let r = 0; r < 3; r++) for (let k = 0; k < 2; k++) s += R(x + ww * (0.18 + k * 0.42), y + 8 + r * 16, ww * 0.25, 8, '#fff8c4', 1, 'class="cwin"');
  }
  s += R(w * 0.86, h * 0.62, 6, h * 0.38, '#795548') + C(w * 0.87, h * 0.58, w * 0.1, '#4caf50') + C(w * 0.83, h * 0.64, w * 0.07, '#5cbf60');
  return `<g class="city">${s}</g>`;
}

let winId = 0;
function windowSVG(x, y, w, h, curtain = '#ff8fab', round = false) {
  const cid = 'wclip' + ++winId;
  const inner = round
    ? `${C(w / 2, h / 2, w / 2 + 4, '#d9e2ea')}${C(w / 2, h / 2, w / 2, '#fff')}${C(w / 2, h / 2, w / 2 - 10, 'url(#g-sky)', 'class="sky"')}
       ${C(w * 0.35, h * 0.38, 12, '#ffe066', 'class="daysun"')}${C(w * 0.6, h * 0.4, 11, '#fff8c4', 'class="moon"')}
       ${stars(w * 0.25, h * 0.25, w * 0.5, h * 0.5, 4)}
       ${R(w / 2 - 3, 10, 6, h - 20, '#fff')}${R(10, h / 2 - 3, w - 20, 6, '#fff')}
       ${P(`M${w * 0.3} ${h * 0.18} L${w * 0.45} ${h * 0.12} L${w * 0.2} ${h * 0.55} L${w * 0.14} ${h * 0.45}Z`, '#fff', 'opacity=".35"')}`
    : `<g class="daysun">${P(`M0 ${h + 14} L${w} ${h + 14} L${w + 140} ${FLOOR - y} L${-140} ${FLOOR - y}Z`, 'url(#g-beam)')}</g>
       ${R(-12, -12, w + 24, h + 24, '#fff', 14)}${R(-12, -12, w + 24, h + 24, 'url(#g-vol)', 14)}${R(-4, -4, w + 8, h + 8, '#d9d2c6', 8)}
       <clipPath id="${cid}"><rect width="${w}" height="${h}" rx="6"/></clipPath><g clip-path="url(#${cid})">
       ${R(0, 0, w, h, 'url(#g-sky)', 6, 'class="sky"')}
       ${C(w * 0.72, h * 0.26, 16, '#ffe066', 'class="daysun"')}${C(w * 0.72, h * 0.26, 26, '#ffe066', 'class="daysun" opacity=".25"')}
       ${C(w * 0.7, h * 0.3, 14, '#fff8c4', 'class="moon"')}
       <g class="daysun">${E(w * 0.28, h * 0.22, 24, 9, '#fff')}${E(w * 0.36, h * 0.18, 16, 9, '#fff')}</g>
       ${stars(10, 10, w - 20, h * 0.45, 7)}
       ${cityView(w, h)}</g>
       ${P(`M${w * 0.06} 0 L${w * 0.3} 0 L0 ${h * 0.4} L0 ${h * 0.16}Z`, '#fff', 'opacity=".28"')}${P(`M${w * 0.6} ${h * 0.55} L${w * 0.75} ${h * 0.55} L${w * 0.55} ${h * 0.85} L${w * 0.52} ${h * 0.75}Z`, '#fff', 'opacity=".18"')}
       ${R(w / 2 - 4, 0, 8, h, '#fff')}${R(0, h / 2 - 4, w, 8, '#fff')}${R(w / 2 + 2, 0, 2, h, '#000', 0, 'opacity=".08"')}
       ${R(-20, h + 8, w + 40, 14, '#fff', 4)}${R(-20, h + 8, w + 40, 4, '#fff', 2)}${R(-20, h + 20, w + 40, 6, '#000', 0, 'opacity=".1"')}
       ${curtain ? `
       ${P(`M-16 -14 Q${w * 0.22} ${h * 0.3} ${w * 0.12} ${h * 0.62} Q${w * 0.02} ${h * 0.8} -8 ${h + 18} L-30 ${h + 18} L-30 -14Z`, curtain)}
       ${P(`M-16 -14 Q${w * 0.22} ${h * 0.3} ${w * 0.12} ${h * 0.62} Q${w * 0.02} ${h * 0.8} -8 ${h + 18} L-30 ${h + 18} L-30 -14Z`, 'url(#g-folds)')}
       ${P(`M${w + 16} -14 Q${w * 0.78} ${h * 0.3} ${w * 0.88} ${h * 0.62} Q${w * 0.98} ${h * 0.8} ${w + 8} ${h + 18} L${w + 30} ${h + 18} L${w + 30} -14Z`, curtain)}
       ${P(`M${w + 16} -14 Q${w * 0.78} ${h * 0.3} ${w * 0.88} ${h * 0.62} Q${w * 0.98} ${h * 0.8} ${w + 8} ${h + 18} L${w + 30} ${h + 18} L${w + 30} -14Z`, 'url(#g-folds)')}
       ${R(w * 0.02 - 6, h * 0.6, 26, 8, '#d4a017', 4)}${R(w * 0.86, h * 0.6, 26, 8, '#d4a017', 4)}
       ${R(-40, -24, w + 80, 9, shadeHex(curtain), 4)}${C(-40, -19.5, 8, '#d4a017')}${C(w + 40, -19.5, 8, '#d4a017')}` : ''}`;
  return G(x, y, inner);
}

function shadeHex(hex) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v) => Math.max(0, Math.round(v * 0.78));
  return '#' + ((1 << 24) + (f((n >> 16) & 255) << 16) + (f((n >> 8) & 255) << 8) + f(n & 255)).toString(16).slice(1);
}

function frame(x, y, w, h, color, art) {
  return G(x, y, R(4, 6, w, h, '#000', 6, 'opacity=".12"') + R(0, 0, w, h, color, 6) + R(0, 0, w, h, 'url(#g-volh)', 6) + R(3, 3, w - 6, 3, '#fff', 2, 'opacity=".35"') +
    R(8, 8, w - 16, h - 16, '#fffaf0', 3) + R(8, 8, w - 16, 3, '#000', 0, 'opacity=".12"') + art +
    P(`M10 10 L${w * 0.4} 10 L10 ${h * 0.5}Z`, '#fff', 'opacity=".18"'));
}

function plant(x, y, s = 1) {
  const leaf = (lx, ly, r, c) => `<g transform="translate(${lx} ${ly}) rotate(${r})">${E(0, 0, 14, 30, c)}${P('M0 -28 L0 28', 'none', 'stroke="#b7e4c7" stroke-width="2" opacity=".7"')}${P('M0 -10 L-9 -18 M0 4 L-10 -2 M0 -10 L9 -18 M0 4 L10 -2', 'none', 'stroke="#b7e4c7" stroke-width="1.2" opacity=".6"')}</g>`;
  return G(x, y, `<g transform="scale(${s})">${SH(0, 0, 34, 6)}
    ${P('M0 -30 Q-6 -60 -24 -78 M0 -30 Q2 -70 4 -98 M0 -30 Q10 -60 28 -80', 'none', 'stroke="#2d6a4f" stroke-width="3"')}
    ${leaf(-26, -80, -35, '#40916c')}${leaf(4, -98, 0, '#52b788')}${leaf(28, -82, 35, '#40916c')}${leaf(-22, -52, -70, '#2d6a4f')}${leaf(24, -54, 70, '#2d6a4f')}${leaf(0, -66, 10, '#74c69d')}
    ${P('M-24 -32 L24 -32 L18 0 L-18 0Z', 'url(#g-pot)')}${R(-27, -38, 54, 9, '#e07a50', 4)}${R(-27, -38, 54, 3, '#ffb08a', 2)}${E(0, -34, 22, 3, '#5a3a22')}</g>`);
}

function hangLamp(x, len, color = '#ffca3a') {
  return G(x, 0, R(-1.5, 0, 3, len, '#444') + R(-6, len - 4, 12, 8, '#666', 2) +
    C(0, len + 40, 60, 'url(#g-bulb)', 'opacity=".55"') +
    P(`M-36 ${len + 34} Q0 ${len - 16} 36 ${len + 34}Z`, color) + P(`M-36 ${len + 34} Q0 ${len - 16} 36 ${len + 34}Z`, 'url(#g-volh)') +
    P(`M-20 ${len + 14} Q-6 ${len + 2} 6 ${len + 2}`, 'none', 'stroke="#fff" stroke-width="3" opacity=".45" stroke-linecap="round"') +
    E(0, len + 34, 36, 4, shadeHex(color)) + E(0, len + 37, 13, 6, '#fffbe0'));
}

function chair(x, y, color) {
  // y = Sitzhöhe
  const d = shadeHex(color);
  return G(x, y, SH(45, FLOOR - y, 50, 6) +
    R(6, -90, 14, 96, d, 6) + VOLH(6, -90, 14, 96, 6) + R(4, -94, 48, 14, d, 6) + R(4, -94, 48, 5, '#fff', 3, 'opacity=".2"') +
    R(10, 10, 10, FLOOR - y - 10, d, 4) + R(70, 10, 10, FLOOR - y - 10, d, 4) + R(12, 10, 3, FLOOR - y - 12, '#fff', 1, 'opacity=".2"') +
    R(0, -4, 90, 16, color, 8) + R(0, -4, 90, 16, 'url(#g-vol)', 8) + R(0, -4, 90, 16, 'url(#p-grain)', 8) + R(14, 50, 60, 6, d, 3));
}

function table(x, y, w, color) {
  // y = Tischplatte oben
  const d = shadeHex(color);
  return G(x, y, SH(w / 2, FLOOR - y, w * 0.45, 8) +
    R(w / 2 - 9, 14, 18, FLOOR - y - 20, d, 4) + VOLH(w / 2 - 9, 14, 18, FLOOR - y - 20, 4) + E(w / 2, FLOOR - y - 4, 50, 8, d) + E(w / 2, FLOOR - y - 7, 44, 4, '#fff', 'opacity=".2"') +
    R(0, 0, w, 16, color, 8) + R(0, 0, w, 16, 'url(#g-vol)', 8) + R(4, 1, w - 8, 3, '#fff', 2, 'opacity=".55"') + R(6, 16, w - 12, 5, '#000', 2, 'opacity=".12"'));
}

function shelfUnit(x, y, w, h, color, levels) {
  let s = SH(w / 2, h, w * 0.55, 10) + R(0, 0, w, h, color, 10) + R(0, 0, w, h, 'url(#g-volh)', 10) + R(10, 10, w - 20, h - 20, shadeHex(color), 6) + R(10, 10, w - 20, 24, '#000', 6, 'opacity=".12"');
  for (const l of levels) s += R(10, l - y - 22, w - 20, 22, '#000', 0, 'opacity=".08"') + R(4, l - y, w - 8, 14, '#fff', 4) + R(4, l - y, w - 8, 3, '#fff', 2) + R(4, l - y + 10, w - 8, 8, '#d7dbe0') + R(w * 0.1, l - y + 4, 30, 8, '#ffd166', 2) + R(w * 0.6, l - y + 4, 30, 8, '#ffd166', 2);
  return G(x, y, s);
}

// Bodenmuster (szenenspezifische Varianten)
function patterns(id) {
  return `<defs>
    <pattern id="${id}-stripes" width="60" height="10" patternUnits="userSpaceOnUse">${R(0, 0, 30, 10, '#fff', 0, 'opacity=".22"')}${R(29, 0, 2, 10, '#000', 0, 'opacity=".04"')}</pattern>
    <pattern id="${id}-dots" width="50" height="50" patternUnits="userSpaceOnUse">${C(12, 12, 5, '#fff', 'opacity=".35"')}${C(37, 37, 5, '#fff', 'opacity=".35"')}${C(37, 12, 2, '#000', 'opacity=".05"')}</pattern>
    <pattern id="${id}-tiles" width="48" height="48" patternUnits="userSpaceOnUse">${R(0, 0, 48, 48, 'none', 0, 'stroke="#fff" stroke-width="3" opacity=".6"')}${R(2, 2, 44, 10, '#fff', 2, 'opacity=".15"')}${R(46, 0, 2, 48, '#000', 0, 'opacity=".05"')}</pattern>
    <pattern id="${id}-checker" width="68" height="68" patternUnits="userSpaceOnUse">${R(0, 0, 34, 34, '#000', 0, 'opacity=".12"')}${R(34, 34, 34, 34, '#000', 0, 'opacity=".12"')}${R(0, 0, 68, 2, '#fff', 0, 'opacity=".2"')}</pattern>
    <pattern id="${id}-wood" width="200" height="34" patternUnits="userSpaceOnUse">${R(0, 32, 200, 2, '#000', 0, 'opacity=".2"')}${R(100, 0, 2, 32, '#000', 0, 'opacity=".16"')}<path d="M10 10 q40 -5 80 0 t100 2 M6 22 q50 4 100 0 t90 -2" stroke="#000" stroke-width="1.2" fill="none" opacity=".1"/></pattern>
    <pattern id="${id}-planks" width="120" height="44" patternUnits="userSpaceOnUse">${R(0, 0, 2, 44, '#000', 0, 'opacity=".12"')}${R(60, 22, 2, 22, '#000', 0, 'opacity=".1"')}</pattern>
  </defs>`;
}

function room(id, x, w, wall, pat, floor, fpat) {
  return R(x, 36, w, FLOOR - 36, wall) + (pat ? R(x, 36, w, FLOOR - 36, `url(#${id}-${pat})`) : R(x, 36, w, FLOOR - 36, 'url(#p-damask)')) +
    R(x, 36, w, FLOOR - 36, 'url(#g-wall)') +
    R(x, 40, w, 16, '#fff') + R(x, 54, w, 4, '#000', 0, 'opacity=".07"') + R(x, 40, w, 3, '#fff') +
    R(x, FLOOR, w, H - FLOOR, floor) + (fpat ? R(x, FLOOR, w, H - FLOOR, `url(#${id}-${fpat})`) : R(x, FLOOR, w, H - FLOOR, 'url(#p-noise)')) +
    R(x, FLOOR, w, H - FLOOR, 'url(#g-floor)') +
    R(x, FLOOR - 18, w, 20, '#fffaf2') + R(x, FLOOR - 18, w, 3, '#fff') + R(x, FLOOR - 2, w, 3, '#000', 0, 'opacity=".12"') + R(x, FLOOR - 18, w, 20, shadeHex(wall), 0, 'opacity=".25"');
}

const svgWrap = (W, inner) => `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" overflow="visible">${inner}</svg>`;

// ======================= HAUS =======================
function roofBand(W, c1 = '#ff6b6b', c2 = '#e05252') {
  let s = R(0, 0, W, 40, c1);
  for (let x = 0; x < W; x += 36) s += P(`M${x} 26 q18 16 36 0 v14 h-36z`, c2) + P(`M${x + 4} 8 q14 10 28 0`, 'none', 'stroke="#fff" stroke-width="2" opacity=".25"');
  return s + R(0, 34, W, 8, c2) + R(0, 40, W, 4, '#000', 0, 'opacity=".12"');
}

function socket(x, y) {
  return G(x, y, R(0, 0, 32, 32, '#fdfdfd', 6) + R(0, 0, 32, 32, 'none', 6, 'stroke="#d8d8d8" stroke-width="1.5"') + C(16, 16, 10, '#f0f0f0') + C(12, 16, 2.4, '#888') + C(20, 16, 2.4, '#888'));
}
function lightSwitch(x, y) {
  return G(x, y, R(0, 0, 32, 46, '#fdfdfd', 6) + R(0, 0, 32, 46, 'none', 6, 'stroke="#d8d8d8" stroke-width="1.5"') + R(9, 10, 14, 26, '#eee', 3) + R(9, 10, 14, 12, '#fff', 3) + R(9, 22, 14, 2, '#ccc'));
}
function rug(cx, cy, rx, ry, c1, c2, c3 = '#ffd166') {
  let s = E(cx, cy + 4, rx + 6, ry + 4, '#000', 'opacity=".12"') + E(cx, cy, rx, ry, c1) + E(cx, cy, rx - 12, ry - 6, c2) + E(cx, cy, rx - 12, ry - 6, 'url(#p-noise)') +
    E(cx, cy, rx * 0.7, ry * 0.6, 'none', `stroke="${c3}" stroke-width="3" stroke-dasharray="10 6"`) + E(cx, cy, rx * 0.4, ry * 0.32, c1, 'opacity=".6"');
  for (let a = 0; a < 40; a++) {
    const t = Math.PI * 0.08 + (a / 39) * Math.PI * 0.84;
    const x = cx - Math.cos(t) * rx, y = cy + Math.sin(t) * ry;
    s += R(x - 1, y, 2, 7, '#f6e2c0');
  }
  return s;
}
function book(x, y, w, h, c) {
  return R(x, y - h, w, h, c, 2) + R(x, y - h, w, h, 'url(#g-volh)', 2) + R(x, y - h + 6, w, 3, '#fff', 0, 'opacity=".5"') + R(x, y - 12, w, 3, '#000', 0, 'opacity=".2"');
}

function hausBG() {
  const W = 3600;
  let s = patterns('haus');
  s += room('haus', 0, 900, '#ffd6a5', 'stripes', '#c68b59', 'wood');
  s += room('haus', 900, 900, '#c7f0c2', null, '#f1f1f1', 'checker');
  s += room('haus', 1800, 900, '#bde8f6', 'tiles', '#e0f4ff', 'tiles');
  s += room('haus', 2700, 900, '#e4c9f7', 'dots', '#ff99c8', null);
  s += roofBand(W);
  for (const x of [900, 1800, 2700]) s += R(x - 14, 40, 28, FLOOR - 40, '#fff4e6') + R(x - 14, 40, 28, FLOOR - 40, 'url(#g-volh)') + R(x - 14, 40, 6, FLOOR - 40, '#000', 0, 'opacity=".06"');

  // ---------- Wohnzimmer ----------
  s += windowSVG(330, 150, 170, 170, '#ff8fab');
  s += frame(100, 165, 130, 100, '#8d5524', R(14, 14, 102, 72, 'url(#g-sky)') + P('M14 86 L48 42 L68 64 L86 46 L116 86Z', '#5b8a5b') + P('M48 42 L55 52 L41 52Z M86 46 L92 54 L80 54Z', '#fff') + E(84, 82, 26, 5, '#4aa3df') + C(100, 28, 8, '#ffe066'));
  s += frame(645, 105, 100, 120, '#e76f51', R(14, 14, 72, 92, '#ffe7ef') + C(36, 52, 11, '#e0a46e') + C(62, 52, 11, '#f8c9a0') + R(25, 62, 22, 34, '#4f8cff', 8) + R(51, 62, 22, 34, '#ff6fb5', 8) + P('M30 38 q6 -10 12 0 M56 38 q6 -10 12 0', '#7a4a26'));
  s += lightSwitch(250, 330) + socket(560, 630);
  s += rug(330, 768, 280, 34, '#e15f4f', '#ff8f7f');
  // Sofa (Seitenansicht, Sitzfläche bei y=590)
  s += SH(280, 702, 230, 12) + G(80, 500,
    R(20, 0, 360, 120, '#4d96ff', 34) + VOL(20, 0, 360, 120, 34) +
    R(36, 14, 160, 92, '#6ba8ff', 26) + R(204, 14, 160, 92, '#6ba8ff', 26) + VOL(36, 14, 160, 92, 26) + VOL(204, 14, 160, 92, 26) +
    [76, 116, 156, 244, 284, 324].map((x) => C(x, 58, 3.5, '#2d67c4') + C(x - 1, 57, 1.4, '#a8d0ff')).join('') +
    R(10, 88, 380, 64, '#3f86ef', 22) + R(22, 88, 176, 44, '#7cb5ff', 18) + R(202, 88, 176, 44, '#7cb5ff', 18) + VOL(22, 88, 176, 44, 18) + VOL(202, 88, 176, 44, 18) +
    R(28, 90, 164, 5, '#fff', 3, 'opacity=".35"') + R(208, 90, 164, 5, '#fff', 3, 'opacity=".35"') +
    R(0, 40, 54, 130, '#3a7fe0', 24) + R(346, 40, 54, 130, '#3a7fe0', 24) + VOLH(0, 40, 54, 130, 24) + VOLH(346, 40, 54, 130, 24) + R(8, 48, 12, 70, '#fff', 6, 'opacity=".2"') +
    R(40, 168, 16, 32, '#5e3613', 4) + R(344, 168, 16, 32, '#5e3613', 4) + R(42, 168, 5, 30, '#a86b3c', 2) +
    `<g transform="rotate(-12 90 60)">${R(52, 28, 70, 58, '#ffd166', 16)}${R(52, 28, 70, 58, 'none', 16, 'stroke="#e9a93a" stroke-width="3" stroke-dasharray="4 4"')}${VOL(52, 28, 70, 58, 16)}</g>` +
    `<g transform="rotate(10 320 60)">${R(284, 30, 66, 56, '#fff', 16)}${[0, 1, 2].map((i) => R(284, 38 + i * 16, 66, 7, '#ff6fb5')).join('')}${VOL(284, 30, 66, 56, 16)}</g>` +
    P('M344 40 q34 -8 58 6 l-4 124 q-26 6 -50 -6z', '#9b5de5') + P('M348 48 q26 -4 50 6 M350 80 q22 0 46 6 M352 112 q22 2 44 4', 'none', 'stroke="#7b3fc4" stroke-width="3"') +
    Array.from({ length: 8 }, (_, i) => R(352 + i * 6, 162 + (i % 2) * 2, 2, 10, '#7b3fc4')).join(''));
  // Stehlampe
  s += SH(520, 702, 40, 6) + G(520, 300, C(0, 40, 90, 'url(#g-bulb)', 'opacity=".45"') + R(-3, 40, 6, 360, 'url(#g-metal)') + E(0, 398, 34, 8, '#555') + E(0, 396, 30, 5, '#777') +
    P('M-42 44 L42 44 L28 0 L-28 0Z', '#ffca3a') + P('M-42 44 L42 44 L28 0 L-28 0Z', 'url(#g-volh)') + R(-42, 40, 84, 5, '#e9a93a', 2) + P('M-20 6 L-30 38', 'none', 'stroke="#fff" stroke-width="3" opacity=".4"'));
  // Regal
  s += G(600, 300, R(0, 0, 270, 14, '#8d5524', 6) + GRAIN(0, 0, 270, 14, 6) + R(0, 0, 270, 3, '#c68b59', 2) + P('M20 14 L40 14 L20 44Z', '#6b3f1d') + P('M250 14 L230 14 L250 44Z', '#6b3f1d') +
    book(136, 0, 16, 56, '#e63946') + book(154, 0, 14, 64, '#457b9d') + book(170, 0, 15, 50, '#2a9d8f') + E(200, -2, 12, 3, '#000', 'opacity=".1"'));
  // TV-Möbel
  s += SH(735, 704, 160, 10) + G(600, 590, R(0, 0, 270, 110, '#8d5524', 10) + GRAIN(0, 0, 270, 110, 10) + VOL(0, 0, 270, 110, 10) + R(0, 0, 270, 8, '#c68b59', 6) +
    R(14, 18, 112, 72, '#a86b3c', 8) + R(144, 18, 112, 72, '#a86b3c', 8) + GRAIN(14, 18, 112, 72, 8) + GRAIN(144, 18, 112, 72, 8) +
    R(14, 18, 112, 4, '#000', 0, 'opacity=".12"') + R(144, 18, 112, 4, '#000', 0, 'opacity=".12"') +
    R(110, 44, 6, 22, 'url(#g-metal)', 3) + R(154, 44, 6, 22, 'url(#g-metal)', 3) + R(16, 108, 14, 8, '#4a2c14') + R(240, 108, 14, 8, '#4a2c14'));

  // ---------- Küche ----------
  s += G(940, 330, R(0, 0, 520, 190, '#fdfdfd') + R(0, 0, 520, 190, 'url(#p-tiles)') + R(0, 0, 520, 190, 'url(#g-wall)'));
  s += hangLamp(1350, 60);
  s += windowSVG(1270, 120, 150, 130, '#ffca3a');
  s += G(1480, 190, C(0, 0, 30, '#fff') + C(0, 0, 30, 'none', 'stroke="#2a9d8f" stroke-width="5"') + R(-2, -20, 4, 22, '#333', 2) + R(-2, -2, 18, 4, '#333', 2) + C(0, 0, 3, '#e63946'));
  s += G(960, 190, SH(125, 136, 120, 6, 0.6) + R(0, 0, 250, 130, '#ffffff', 12) + VOL(0, 0, 250, 130, 12) + R(10, 10, 110, 110, '#fde2e4', 8) + R(130, 10, 110, 110, '#fde2e4', 8) +
    R(10, 10, 110, 110, 'url(#g-vol)', 8) + R(130, 10, 110, 110, 'url(#g-vol)', 8) + R(20, 20, 90, 90, 'none', 6, 'stroke="#f5c2c9" stroke-width="2"') + R(140, 20, 90, 90, 'none', 6, 'stroke="#f5c2c9" stroke-width="2"') +
    R(103, 50, 7, 30, 'url(#g-metal)', 3) + R(140, 50, 7, 30, 'url(#g-metal)', 3));
  s += G(1240, 300, R(0, 0, 210, 12, '#e9c46a', 6) + GRAIN(0, 0, 210, 12, 6) + R(0, 0, 210, 3, '#fff', 2, 'opacity=".4"') + P('M14 12 L28 12 L14 32Z M196 12 L182 12 L196 32Z', '#b8913a'));
  s += SH(1080, 704, 150, 8) + G(940, 520, R(0, 0, 280, 18, '#ff9f1c', 6) + R(0, 0, 280, 5, '#ffc46b', 3) + R(0, 14, 280, 4, '#c66f00') +
    R(6, 18, 268, 162, '#ffe5b4') + VOL(6, 18, 268, 162) + R(20, 36, 112, 126, '#fff3dc', 8) + R(148, 36, 112, 126, '#fff3dc', 8) + VOL(20, 36, 112, 126, 8) + VOL(148, 36, 112, 126, 8) +
    R(104, 80, 8, 36, 'url(#g-metal)', 4) + R(168, 80, 8, 36, 'url(#g-metal)', 4) + R(6, 172, 268, 8, '#000', 0, 'opacity=".12"') +
    R(36, -4, 108, 10, '#c9d1d9', 5) + E(90, 0, 50, 4, '#9aa5b1') + P('M110 -4 L110 -50 Q110 -62 122 -62 L140 -62', 'none', 'stroke="url(#g-metal)" stroke-width="8" stroke-linecap="round"') +
    P('M110 -4 L110 -50 Q110 -62 122 -62 L140 -62', 'none', 'stroke="#aab4be" stroke-width="8" stroke-linecap="round"') + R(100, -20, 20, 8, '#aab4be', 4) + C(140, -62, 3, '#4cc9f0') +
    R(230, 22, 30, 60, '#e63946', 4) + [0, 1, 2].map((i) => R(230, 30 + i * 16, 30, 4, '#fff')).join(''));
  // ---------- Bad ----------
  s += windowSVG(1960, 150, 120, 120, null, true);
  s += G(1850, 560, R(0, 0, 400, 50, '#d9f2ff', 24) + E(200, 18, 180, 14, '#8fd3ff') + E(200, 14, 160, 8, '#c4ecff'));
  s += G(2480, 290, R(4, 6, 150, 190, '#000', 75, 'opacity=".1"') + R(0, 0, 150, 190, '#ffffff', 75) + R(0, 0, 150, 190, 'url(#g-volh)', 75) + R(10, 10, 130, 170, '#d8f3ff', 65) + R(10, 10, 130, 170, 'url(#g-glass)', 65) + P('M40 40 L70 30 L40 110Z', '#fff', 'opacity=".55"'));
  s += SH(2555, 704, 70, 7) + G(2470, 560, R(0, 0, 170, 22, '#ffffff', 10) + R(0, 0, 170, 22, 'url(#g-vol)', 10) + E(85, 6, 60, 6, '#d9eef7') + P('M30 22 L140 22 L110 140 L60 140Z', '#f5f5f5') + P('M30 22 L140 22 L110 140 L60 140Z', 'url(#g-volh)') +
    R(78, -40, 14, 42, 'url(#g-metal)', 6) + R(78, -40, 40, 10, '#aab4be', 5) + C(85, -44, 6, '#e63946') + C(101, -44, 6, '#4f8cff'));
  s += G(2420, 420, R(0, 0, 50, 8, 'url(#g-metal)', 4) + R(4, 8, 40, 90, '#ff99c8', 6) + VOLH(4, 8, 40, 90, 6) + R(4, 74, 40, 6, '#fff', 0, 'opacity=".6"') + R(4, 84, 40, 3, '#fff', 0, 'opacity=".6"'));
  s += G(2300, 735, R(0, 0, 240, 50, '#7ad6c8', 20) + R(8, 8, 224, 34, 'none', 14, 'stroke="#fff" stroke-width="3" stroke-dasharray="6 6"') + R(0, 0, 240, 50, 'url(#p-noise)', 20));
  s += plant(2680, 700, 0.9);
  // ---------- Schlafzimmer ----------
  s += windowSVG(2800, 150, 170, 170, '#9b5de5');
  s += frame(3060, 160, 100, 120, '#ffca3a', R(14, 14, 72, 92, '#1d2559') + P('M50 30 L58 52 L82 52 L62 66 L70 90 L50 76 L30 90 L38 66 L18 52 L42 52Z', '#ffca3a') + C(24, 24, 2, '#fff') + C(76, 30, 2, '#fff') + C(70, 100, 2, '#fff'));
  // Lichterkette
  s += P('M2720 70 Q2900 120 3080 70 Q3260 120 3440 70', 'none', 'stroke="#6b5b7a" stroke-width="2"');
  for (let i = 0; i < 14; i++) {
    const t = i / 13, x = 2720 + t * 720, yy = 70 + Math.sin((t * 2) * Math.PI) ** 2 * 26 + 6;
    s += C(x, yy, 6, ['#ffd166', '#ff6fb5', '#4cc9f0', '#8ac926'][i % 4]) + C(x - 2, yy - 2, 2, '#fff', 'opacity=".7"');
  }
  s += lightSwitch(3010, 330) + socket(3180, 640);
  s += rug(3000, 770, 260, 32, '#c77dff', '#e0aaff', '#fff');
  s += SH(2960, 704, 240, 12) + G(2740, 480,
    R(0, 0, 54, 220, '#9b5de5', 22) + R(0, 0, 54, 220, 'url(#g-volh)', 22) + [40, 80, 120].map((y) => C(27, y, 4, '#7b3fc4') + C(26, y - 1, 1.5, '#d6b6ff')).join('') +
    R(420, 70, 40, 150, '#9b5de5', 18) + R(420, 70, 40, 150, 'url(#g-volh)', 18) +
    R(20, 150, 430, 50, '#7b3fc4', 10) + GRAIN(20, 150, 430, 50, 10) + VOL(20, 150, 430, 50, 10) +
    R(40, 108, 400, 52, '#ffffff', 18) + VOL(40, 108, 400, 52, 18) + R(40, 140, 400, 6, '#e8e0f5') +
    E(116, 98, 60, 25, '#fff') + E(116, 98, 60, 25, 'url(#g-vol)') + P('M66 98 q50 -8 100 0', 'none', 'stroke="#e6dff2" stroke-width="2"') + C(84, 92, 4, '#ff6fb5', 'opacity=".5"') + C(130, 104, 4, '#ff6fb5', 'opacity=".5"') +
    R(40, 190, 20, 30, '#5a2a9a', 4) + R(400, 190, 20, 30, '#5a2a9a', 4));
  s += SH(3260, 704, 50, 6) + G(3215, 600, R(0, 0, 90, 100, '#c77dff', 10) + GRAIN(0, 0, 90, 100, 10) + VOL(0, 0, 90, 100, 10) + R(0, 0, 90, 6, '#e0aaff', 4) +
    R(8, 16, 74, 34, '#b565f0', 6) + R(8, 56, 74, 36, '#b565f0', 6) + C(45, 33, 4, '#ffd166') + C(45, 74, 4, '#ffd166'));
  return svgWrap(W, s);
}

function fridgeSVG() {
  const w = 220, h = 410;
  return svgWrap0(w, h,
    SH(110, h + 2, 120, 8) + R(0, 0, w, h, '#dbe9ff', 20) + R(12, 12, w - 24, h - 24, '#ffffff', 12) + R(12, 12, w - 24, h - 24, 'url(#g-vol)', 12) +
    R(12, 112, w - 24, 8, '#cfe3ff', 3) + R(12, 232, w - 24, 8, '#cfe3ff', 3) + R(12, 112, w - 24, 2, '#fff', 1) + R(12, 232, w - 24, 2, '#fff', 1) +
    R(20, 350, w - 40, 40, '#e6f0ff', 8) + R(20, 350, w - 40, 40, 'url(#g-glass)', 8) +
    E(110, 24, 40, 8, '#fffbe6') + C(110, 60, 70, 'url(#g-bulb)', 'opacity=".5"') +
    `<g class="dclosed">${R(0, 0, w, h, '#8ecae6', 20)}${R(0, 0, w, h, 'url(#g-volh)', 20)}${R(0, 128, w, 6, '#6aaecc')}${R(0, 134, w, 3, '#fff', 0, 'opacity=".35"')}
      ${R(186, 36, 14, 66, 'url(#g-metal)', 7)}${R(186, 156, 14, 100, 'url(#g-metal)', 7)}
      ${P('M14 14 L60 14 L14 120Z', '#fff', 'opacity=".18"')}${P('M14 150 L50 150 L14 260Z', '#fff', 'opacity=".14"')}
      ${C(50, 60, 12, '#ff595e')}${C(47, 57, 4, '#fff', 'opacity=".5"')}${C(80, 74, 10, '#ffca3a')}${R(110, 50, 40, 30, '#8ac926', 4, 'transform="rotate(8 130 65)"')}
      <g transform="rotate(-6 66 227)">${R(36, 190, 64, 78, '#fff', 3)}${C(66, 214, 13, '#ffb703')}${P('M46 256 L56 240 L64 252 L74 236 L88 256Z', '#52b788')}${R(36, 190, 64, 78, 'none', 3, 'stroke="#ddd"')}${C(68, 192, 5, '#e63946')}</g>
      ${R(20, 390, 180, 8, '#6aaecc', 4)}</g>
     <g class="dopen">${P(`M0 0 L-64 18 L-64 ${h - 18} L0 ${h}Z`, '#8ecae6')}${P(`M0 0 L-64 18 L-64 ${h - 18} L0 ${h}Z`, 'url(#g-vol)')}
       ${R(-50, 50, 36, 10, '#fff', 4)}${R(-50, 170, 36, 10, '#fff', 4)}${R(-50, 290, 36, 10, '#fff', 4)}${R(-46, 36, 28, 14, '#ffd166', 3)}${R(-46, 156, 28, 14, '#e63946', 3)}</g>`);
}

function wardrobeSVG() {
  const w = 240, h = 450;
  const door = (x, c) => R(x, 0, w / 2, h, c, 16) + R(x, 0, w / 2, h, 'url(#p-grain)', 16) + R(x, 0, w / 2, h, 'url(#g-volh)', 16) +
    R(x + 18, 28, w / 2 - 36, 154, '#000', 12, 'opacity=".08"') + R(x + 20, 30, w / 2 - 40, 150, shade2(c), 12) + R(x + 20, 30, w / 2 - 40, 150, 'url(#g-vol)', 12) +
    R(x + 18, 248, w / 2 - 36, 174, '#000', 12, 'opacity=".08"') + R(x + 20, 250, w / 2 - 40, 170, shade2(c), 12) + R(x + 20, 250, w / 2 - 40, 170, 'url(#g-vol)', 12);
  return svgWrap0(w, h,
    SH(120, h + 2, 130, 8) + R(0, 0, w, h, '#a06cd5', 16) + R(12, 12, w - 24, h - 24, '#f3e8ff', 10) + R(12, 12, w - 24, 30, '#000', 10, 'opacity=".08"') +
    R(12, 162, w - 24, 8, '#c8a2ff', 3) + R(12, 302, w - 24, 8, '#c8a2ff', 3) + R(20, 40, w - 40, 6, 'url(#g-metal)', 3) +
    [50, 90, 130, 170].map((x) => P(`M${x} 46 q-14 10 -18 22 h36 q-4 -12 -18 -22`, 'none', 'stroke="#999" stroke-width="2"')).join('') +
    `<g class="dclosed">${door(0, '#c77dff')}${door(w / 2, '#b565f0')}${R(w / 2 - 22, h / 2 - 20, 6, 40, 'url(#g-metal)', 3)}${R(w / 2 + 16, h / 2 - 20, 6, 40, 'url(#g-metal)', 3)}
      ${R(-4, -10, w + 8, 16, '#8f55c9', 6)}${R(-4, -10, w + 8, 4, '#fff', 3, 'opacity=".25"')}</g>
     <g class="dopen">${P(`M0 0 L-56 20 L-56 ${h - 20} L0 ${h}Z`, '#c77dff')}${P(`M0 0 L-56 20 L-56 ${h - 20} L0 ${h}Z`, 'url(#g-vol)')}
       ${P(`M${w} 0 L${w + 56} 20 L${w + 56} ${h - 20} L${w} ${h}Z`, '#b565f0')}${P(`M${w} 0 L${w + 56} 20 L${w + 56} ${h - 20} L${w} ${h}Z`, 'url(#g-vol)')}
       ${R(-36, 200, 8, 50, 'url(#g-metal)', 4)}${R(w + 28, 200, 8, 50, 'url(#g-metal)', 4)}</g>`);
}

function shade2(hex) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v) => Math.min(255, Math.round(v + (255 - v) * 0.18));
  return '#' + ((1 << 24) + (f((n >> 16) & 255) << 16) + (f((n >> 8) & 255) << 8) + f(n & 255)).toString(16).slice(1);
}

function toiletSVG(seat = '#f4f4f4') {
  return svgWrap0(130, 180, SH(65, 180, 60, 6) +
    R(20, 0, 90, 80, '#fff', 12) + R(20, 0, 90, 80, 'url(#g-volh)', 12) + R(16, -4, 98, 12, '#f7f7f7', 6) + R(16, -4, 98, 3, '#fff', 2) + R(84, 14, 18, 8, 'url(#g-metal)', 4) +
    E(65, 96, 58, 14, seat) + E(65, 96, 58, 14, 'url(#g-vol)') + E(65, 92, 50, 10, '#e3eef3') + E(65, 92, 40, 6, '#c9e6f2') +
    P('M14 100 Q20 150 44 160 L86 160 Q110 150 116 100Z', '#fff') + P('M14 100 Q20 150 44 160 L86 160 Q110 150 116 100Z', 'url(#g-volh)') +
    P('M26 108 Q32 140 50 150', 'none', 'stroke="#fff" stroke-width="4" opacity=".9"') + R(40, 158, 50, 22, '#f4f4f4', 6) + R(40, 158, 50, 22, 'url(#g-volh)', 6) +
    `<g class="swirl">${E(65, 92, 34, 6, '#4cc9f0')}${E(58, 90, 12, 2.5, '#fff', 'opacity=".7"')}</g>`);
}

function tubFront() {
  return svgWrap0(400, 112,
    R(0, 0, 400, 92, '#ffffff', 40) + R(0, 0, 400, 92, 'url(#g-vol)', 40) + R(16, 12, 368, 10, '#e9f6ff', 5) + P('M40 30 Q200 44 360 30', 'none', 'stroke="#fff" stroke-width="5" opacity=".9" stroke-linecap="round"') +
    R(40, 86, 30, 26, '#ffd166', 8) + R(330, 86, 30, 26, '#ffd166', 8) + R(40, 86, 30, 26, 'url(#g-volh)', 8) + R(330, 86, 30, 26, 'url(#g-volh)', 8) +
    [[60, 2, 16], [90, -4, 20], [126, 0, 14], [300, 0, 16], [330, -6, 20], [355, 2, 13], [110, 8, 9], [270, 6, 10]].map(([x, y, r]) => C(x, y, r, '#fff') + C(x - r * 0.35, y - r * 0.35, r * 0.3, '#e3f6ff')).join(''));
}

function svgWrap0(w, h, inner) {
  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" overflow="visible">${inner}</svg>`;
}

const hausProps = [
  { id: 'tv', kind: 'toggle', x: 620, y: 430, w: 230, h: 160, sound: 'tv',
    svg: svgWrap0(230, 160, R(95, 146, 40, 12, '#2b2d42', 3) + R(70, 154, 90, 6, '#1e1f2e', 3) + R(0, 0, 230, 150, '#1e1f2e', 12) + R(0, 0, 230, 4, '#4a4d6a', 2) + R(8, 8, 214, 134, '#0b0d14', 6) +
      R(8, 8, 214, 134, 'url(#g-glass)', 6) + C(214, 142, 2.5, '#e63946') +
      `<g class="tvon">${R(8, 8, 214, 134, '#ff595e', 6, 'class="tvcol"')}${E(115, 130, 100, 20, '#2b9348', 'opacity=".7"')}${C(70, 75, 26, '#fff', 'class="tvball"')}${P('M120 130 L160 50 L200 130Z', '#fff', 'opacity=".7"')}${R(8, 8, 214, 134, 'url(#g-glass)', 6)}</g>`) },
  { id: 'radio', kind: 'toggle', x: 620, y: 222, w: 110, h: 78, sound: 'music',
    svg: svgWrap0(110, 78, P('M20 12 L50 -16', 'none', 'stroke="url(#g-metal)" stroke-width="4" stroke-linecap="round"') + P('M20 12 L50 -16', 'none', 'stroke="#999" stroke-width="3" stroke-linecap="round"') + C(50, -16, 3, '#999') +
      R(0, 10, 110, 68, '#e76f51', 14) + R(0, 10, 110, 68, 'url(#g-vol)', 14) + R(0, 10, 110, 12, '#f4a582', 12) +
      C(34, 46, 21, '#3a3a3a') + Array.from({ length: 16 }, (_, i) => C(24 + (i % 4) * 7, 36 + Math.floor(i / 4) * 7, 2, '#777')).join('') +
      R(62, 30, 38, 18, '#fff3d6', 4) + R(66, 34, 30, 2, '#c66', 1) + R(78, 32, 2, 14, '#e63946') + C(70, 62, 6, 'url(#g-metal)') + C(90, 62, 6, 'url(#g-metal)') + C(100, 26, 3.5, '#ffca3a', 'class="led"')) },
  { id: 'stove', kind: 'toggle', x: 1220, y: 470, w: 220, h: 230, sound: 'sizzle',
    svg: svgWrap0(220, 230, R(0, 50, 220, 180, '#f1f1f1', 10) + R(0, 50, 220, 180, 'url(#g-volh)', 10) + R(0, 44, 220, 12, '#cfcfcf', 4) + R(0, 44, 220, 3, '#fff', 2) +
      E(60, 50, 36, 6, '#2b2b2b') + E(160, 50, 36, 6, '#2b2b2b') + E(60, 49, 24, 3, '#555') + E(160, 49, 24, 3, '#555') +
      `<g class="flame">${E(60, 46, 30, 6, '#ff9f1c')}${E(160, 46, 30, 6, '#ff9f1c')}${E(60, 46, 18, 4, '#ffd60a')}${E(160, 46, 18, 4, '#ffd60a')}</g>` +
      R(10, 62, 200, 28, '#e3e3e3', 6) + [40, 80, 140, 180].map((x) => C(x, 76, 9, '#444') + C(x, 76, 9, 'url(#g-vol)') + R(x - 1.5, 68, 3, 8, '#bbb', 1)).join('') + R(103, 72, 14, 8, '#222', 3) + R(105, 74, 4, 4, '#4cc9f0') +
      R(36, 100, 148, 10, 'url(#g-metal)', 5) +
      R(30, 116, 160, 92, '#2b2b2b', 12) + R(38, 124, 144, 76, '#3a3a3a', 8) + R(30, 116, 160, 92, '#ff9f1c', 12, 'class="ovenglow"') + R(38, 124, 144, 76, 'url(#g-glass)', 8) + R(50, 168, 120, 3, '#777', 1) + R(10, 216, 200, 8, '#d0d0d0', 3)) },
  { id: 'fridge', kind: 'container', x: 1520, y: 290, w: 220, h: 410, sound: 'door', svg: fridgeSVG(),
    region: { x1: 1530, x2: 1730, y1: 300, y2: 692 } },
  { id: 'shower', kind: 'toggle', x: 2150, y: 190, w: 110, h: 140, sound: 'splash',
    svg: svgWrap0(110, 140, R(80, 0, 12, 110, 'url(#g-metal)', 6) + R(40, 98, 52, 12, '#b9c0c7', 6) + R(40, 98, 52, 4, '#fff', 3, 'opacity=".6"') + P('M18 112 L72 112 L62 132 L28 132Z', 'url(#g-metal)') +
      E(45, 132, 17, 3, '#7c828a') + [30, 38, 46, 54, 62].map((x) => C(x - 1, 132, 1.5, '#555')).join('') + C(86, 60, 9, '#e9edf1') + C(86, 60, 4, '#e63946') +
      `<g class="water">${[28, 38, 48, 58].map((x) => `<path d="M${x + 2} 134 L${x - 6} 400" stroke="#4cc9f0" stroke-width="5" stroke-linecap="round" stroke-dasharray="14 18" class="drops"/>`).join('')}</g>`) },
  { id: 'toilet', kind: 'flush', x: 2300, y: 520, w: 130, h: 180, sound: 'flush', svg: toiletSVG(), bowl: { x1: 2310, x2: 2420, y: 612 } },
  { id: 'lamp', kind: 'toggle', x: 3225, y: 470, w: 70, h: 130, init: true,
    svg: svgWrap0(70, 130, R(32, 50, 6, 70, 'url(#g-metal)') + E(35, 124, 24, 6, '#666') + E(35, 122, 20, 3, '#999') + P('M6 56 L64 56 L52 4 L18 4Z', '#ffd166', 'class="shade"') +
      P('M6 56 L64 56 L52 4 L18 4Z', 'url(#g-volh)') + R(4, 52, 62, 6, '#e9a93a', 3) + P('M22 10 L14 50', 'none', 'stroke="#fff" stroke-width="3" opacity=".45"')) },
  { id: 'wardrobe', kind: 'container', x: 3330, y: 250, w: 240, h: 450, sound: 'door', svg: wardrobeSVG(),
    region: { x1: 3342, x2: 3558, y1: 262, y2: 692 } },
];

const hausFG = [
  { x: 1850, y: 588, w: 400, h: 112, svg: tubFront() },
  { x: 2930, y: 548, w: 260, h: 110, svg: svgWrap0(260, 110,
    R(0, 0, 260, 96, '#ff99c8', 26) + R(0, 0, 260, 96, 'url(#g-vol)', 26) + R(0, 0, 44, 96, '#ffc8dd', 20) + R(0, 0, 44, 96, 'url(#g-volh)', 20) +
    [[90, 40], [150, 60], [210, 34], [120, 74], [190, 78]].map(([x, y]) => P(`M${x} ${y - 8} l2.5 5.5 6 .5 -4.5 4 1.5 6 -5.5 -3 -5.5 3 1.5 -6 -4.5 -4 6 -.5z`, '#fff', 'opacity=".65"')).join('') +
    P('M60 20 q60 14 190 4 M60 86 q80 -10 190 0', 'none', 'stroke="#e86aa6" stroke-width="2" opacity=".6"') + R(0, 88, 260, 6, '#e86aa6', 3, 'opacity=".5"')) },
];

// ======================= CAFÉ =======================
function cafeBG() {
  const W = 1800;
  let s = patterns('cafe');
  s += R(0, 0, W, FLOOR, '#ffc8dd') + R(0, 0, W, FLOOR, 'url(#cafe-stripes)') + R(0, 0, W, FLOOR, 'url(#g-wall)') +
    R(0, 470, W, FLOOR - 470, '#bde0fe') + R(0, 462, W, 14, '#fff') + R(0, 462, W, 4, '#fff') + R(0, 474, W, 4, '#000', 0, 'opacity=".08"') +
    R(0, FLOOR, W, H - FLOOR, '#ffffff') + R(0, FLOOR, W, H - FLOOR, 'url(#cafe-checker)') + R(0, FLOOR, W, H - FLOOR, 'url(#g-floor)') +
    R(0, FLOOR - 16, W, 18, '#8ec5f5') + R(0, FLOOR - 16, W, 3, '#cfe6fb') + R(0, 0, W, 30, '#ff5d8f') + R(0, 26, W, 6, '#d6336c');
  for (let x = 30; x < W; x += 120) s += R(x, 492, 90, 176, '#a9d6ff', 10) + R(x, 492, 90, 176, 'url(#g-vol)', 10) + R(x + 6, 498, 78, 164, 'none', 7, 'stroke="#fff" stroke-width="2" opacity=".6"');
  // Schaufenster mit Straße
  s += G(260, 110, R(-14, -14, 548, 298, '#fff', 18) + R(-14, -14, 548, 298, 'url(#g-vol)', 18) +
    `<clipPath id="cafewin"><rect width="520" height="270" rx="10"/></clipPath><g clip-path="url(#cafewin)">` +
    R(0, 0, 520, 270, 'url(#g-sky)', 10, 'class="sky"') + stars(20, 20, 480, 110, 9) + C(440, 60, 20, '#fff8c4', 'class="moon"') +
    `<g class="daysun">${C(440, 60, 24, '#ffe066')}${C(440, 60, 36, '#ffe066', 'opacity=".25"')}${E(120, 40, 34, 12, '#fff')}${E(150, 32, 22, 12, '#fff')}</g>` +
    [[20, 140, 100, 130, '#ffadad'], [130, 100, 110, 170, '#ffd6a5'], [250, 160, 90, 110, '#caffbf'], [350, 120, 130, 150, '#bdb2ff']].map(([x, y, w, h, c]) =>
      R(x, y, w, h, c) + R(x, y, w * 0.25, h, '#fff', 0, 'opacity=".2"') + R(x - 4, y - 8, w + 8, 10, shadeHex(c), 2) +
      [0, 1].map((k) => [0, 1, 2].map((r) => R(x + 12 + k * (w / 2), y + 16 + r * 34, w / 2 - 24, 22, '#fff8c4', 2, 'class="cwin"') + R(x + 12 + k * (w / 2), y + 16 + r * 34, w / 2 - 24, 4, '#fff', 0, 'opacity=".6"')).join('')).join('')).join('') +
    R(0, 250, 520, 20, '#9aa0a6') + R(0, 250, 520, 3, '#c9ced3') + R(466, 150, 6, 100, '#444') + C(469, 146, 10, '#ffe08a') +
    `</g>` + P('M20 0 L120 0 L0 120 L0 40Z', '#fff', 'opacity=".22"') + P('M300 0 L340 0 L250 270 L210 270Z', '#fff', 'opacity=".12"') + R(255, 0, 10, 270, '#fff') +
    T(130, 64, 46, '#ff5d8f', 'CAFÉ', 'opacity=".92" stroke="#fff" stroke-width="2" paint-order="stroke"') + R(-20, 276, 560, 16, '#fff', 4) + R(-20, 290, 560, 6, '#000', 0, 'opacity=".1"'));
  for (let i = 0; i < 9; i++) {
    const x = 250 + i * 60;
    s += P(`M${x} 74 L${x + 60} 74 L${x + 50} 110 Q${x + 30} 124 ${x + 10} 110Z`, i % 2 ? '#fff' : '#ff5d8f') + P(`M${x} 74 L${x + 60} 74 L${x + 50} 110 Q${x + 30} 124 ${x + 10} 110Z`, 'url(#g-vol)');
  }
  s += R(244, 66, 552, 10, '#d6336c', 4);
  s += hangLamp(260, 30, '#ff5d8f') + hangLamp(720, 30, '#ff5d8f') + hangLamp(1300, 30, '#ffca3a');
  // Tafel
  s += G(1130, 110, R(4, 6, 340, 200, '#000', 14, 'opacity=".12"') + R(0, 0, 340, 200, '#8d5524', 14) + GRAIN(0, 0, 340, 200, 14) + R(10, 10, 320, 180, '#1b4332', 8) + R(10, 10, 320, 180, 'url(#p-noise)', 8) +
    T(170, 56, 32, '#fff', 'MENÜ') + P('M110 66 h120', 'none', 'stroke="#fff" stroke-width="2" opacity=".6"') +
    `<text x="40" y="104" font-size="26">☕ 🧁 🍰</text><text x="40" y="150" font-size="26">🥐 🍩 🍪</text>` + T(270, 104, 22, '#ffd166', '1 🪙') + T(270, 150, 22, '#ffd166', '2 🪙') +
    R(30, 176, 40, 8, '#fff', 2) + R(80, 176, 26, 8, '#fde68a', 2));
  // Bild mit Kaffeetasse
  s += frame(900, 150, 120, 140, '#ffca3a', R(14, 14, 92, 112, '#fff1e6') + P('M34 70 h44 v30 q0 16 -22 16 q-22 0 -22 -16z', '#e76f51') + P('M78 76 q14 0 12 12 q-2 10 -12 8', 'none', 'stroke="#e76f51" stroke-width="5"') +
    P('M46 60 q6 -10 0 -18 M58 60 q6 -10 0 -18', 'none', 'stroke="#c9a" stroke-width="3" stroke-linecap="round"') + E(56, 118, 34, 5, '#d4a373'));
  s += chair(50, 600, '#ff924c') + chair(370, 600, '#ff924c') + chair(510, 600, '#8ac926') + chair(830, 600, '#8ac926');
  s += table(140, 560, 220, '#f4f1ee') + table(600, 560, 220, '#f4f1ee');
  s += P('M160 562 q40 6 90 2 t80 4 M620 563 q50 -4 90 2 t70 0', 'none', 'stroke="#c9c2bb" stroke-width="1.5" opacity=".7"');
  // Theke
  s += SH(1390, 704, 360, 12) + G(1040, 500, R(10, 20, 680, 180, '#c68b59') + GRAIN(10, 20, 680, 180) + VOL(10, 20, 680, 180) +
    [0, 1, 2, 3].map((i) => R(30 + i * 165, 40, 145, 130, '#a86b3c', 10) + GRAIN(30 + i * 165, 40, 145, 130, 10) + R(30 + i * 165, 40, 145, 4, '#000', 0, 'opacity=".15"') + R(30 + i * 165, 166, 145, 4, '#fff', 0, 'opacity=".2"')).join('') +
    `<text x="200" y="128" font-size="60" opacity=".3">☕</text><text x="420" y="128" font-size="60" opacity=".3">🧁</text>` +
    R(10, 182, 680, 8, 'url(#g-metal)', 4) + R(0, 0, 700, 22, '#eae6e1', 8) + R(0, 0, 700, 5, '#fff', 4) + P('M40 8 q60 8 140 2 t200 6 t180 -2', 'none', 'stroke="#c9c2bb" stroke-width="1.5" opacity=".8"') + R(0, 20, 700, 4, '#000', 0, 'opacity=".12"'));
  // Vitrine (Rückseite)
  s += G(1250, 380, R(0, 108, 230, 14, '#d4a017', 6) + R(0, 108, 230, 4, '#fff3b0', 3) + R(4, 0, 222, 110, '#e8f8ff', 10, 'opacity=".5"') + R(4, 56, 222, 6, '#fff') + R(4, 60, 222, 3, '#000', 0, 'opacity=".08"'));
  s += plant(40, 700, 1.1) + plant(1000, 700, 1);
  return svgWrap(W, s);
}

const cafeProps = [
  { id: 'kaffee', kind: 'spawn', x: 1080, y: 356, w: 140, h: 144, spawn: ['☕', '☕', '🥛', '🍵'], sound: 'pop', from: [1260, 360],
    svg: svgWrap0(140, 144, R(0, 0, 140, 144, '#2f2f33', 16) + R(0, 0, 140, 144, 'url(#g-volh)', 16) + R(10, 10, 120, 40, '#4a4a50', 10) + R(14, 14, 112, 6, '#fff', 3, 'opacity=".15"') +
      C(40, 30, 8, '#ff595e') + C(70, 30, 8, '#8ac926') + C(100, 30, 8, '#ffca3a') + C(38, 28, 2.5, '#fff', 'opacity=".6"') + C(68, 28, 2.5, '#fff', 'opacity=".6"') + C(98, 28, 2.5, '#fff', 'opacity=".6"') +
      R(46, 56, 48, 20, 'url(#g-metal)', 6) + R(60, 76, 6, 10, '#999') + R(74, 76, 6, 10, '#999') + R(64, 86, 12, 18, '#7f5539', 4, 'class="pour"') +
      R(26, 122, 88, 12, 'url(#g-metal)', 4) + Array.from({ length: 8 }, (_, i) => R(32 + i * 10, 125, 5, 6, '#555', 1)).join('') + R(126, 50, 8, 60, '#555', 4)) },
  { id: 'kasse', kind: 'spawn', x: 1580, y: 410, w: 130, h: 90, spawn: ['🪙'], sound: 'coin', from: [1640, 380],
    svg: svgWrap0(130, 90, P('M10 30 L120 30 L130 90 L0 90Z', '#ff595e') + P('M10 30 L120 30 L130 90 L0 90Z', 'url(#g-vol)') + R(30, 0, 70, 34, '#2b2b2b', 8) + R(36, 6, 58, 20, '#1b3b1b', 3) + T(65, 22, 18, '#8ac926', '2,50') +
      [0, 1, 2, 3].map((i) => [0, 1].map((r) => R(22 + i * 22, 44 + r * 16, 18, 11, '#fff', 3) + R(22 + i * 22, 52 + r * 16, 18, 3, '#ddd', 1)).join('')).join('') + R(0, 84, 130, 6, '#c1121f', 3)) },
];

const cafeFG = [
  { x: 1250, y: 380, w: 230, h: 120, svg: svgWrap0(230, 120, R(4, 0, 222, 120, '#bfefff', 10, 'opacity=".22"') + R(4, 0, 222, 120, 'url(#g-glass)', 10) + P('M20 10 L60 10 L30 100 L10 100Z', '#fff', 'opacity=".35"') +
    R(0, 0, 230, 8, '#d4a017', 4) + R(0, 0, 230, 3, '#fff3b0', 2) + R(0, 0, 6, 120, '#d4a017', 3) + R(224, 0, 6, 120, '#d4a017', 3)) },
];

// ======================= SUPERMARKT =======================
function marktBG() {
  const W = 2300;
  let s = patterns('markt');
  s += R(0, 0, W, FLOOR, '#d8f3dc') + R(0, 0, W, FLOOR, 'url(#p-damask)') + R(0, 0, W, FLOOR, 'url(#g-wall)') +
    R(0, 480, W, FLOOR - 480, '#e9f5ec') + R(0, 480, W, FLOOR - 480, 'url(#p-tiles)') + R(0, 476, W, 6, '#95d5b2') +
    R(0, 0, W, 120, '#52b788') + R(0, 0, W, 120, 'url(#g-vol)') + R(0, 116, W, 10, '#40916c') + R(0, 126, W, 6, '#000', 0, 'opacity=".1"') +
    T(704, 90, 64, '#000', 'SUPERMARKT', 'opacity=".15"') + T(700, 86, 64, '#fff', 'SUPERMARKT') + T(1904, 90, 50, '#000', 'KASSE', 'opacity=".15"') + T(1900, 86, 50, '#ffd166', 'KASSE') +
    R(0, FLOOR, W, H - FLOOR, '#e9ecef') + R(0, FLOOR, W, H - FLOOR, 'url(#markt-tiles)') + R(0, FLOOR, W, H - FLOOR, 'url(#g-floor)') + R(0, FLOOR - 16, W, 18, '#95d5b2') + R(0, FLOOR - 16, W, 3, '#c7ead4');
  // Deckenleuchten
  for (const x of [300, 760, 1220, 1680, 2060]) s += R(x - 90, 132, 180, 10, '#f8f9fa', 4) + R(x - 90, 140, 180, 4, '#ced4da') + E(x, 150, 120, 26, '#fffbe0', 'opacity=".35"');
  s += shelfUnit(100, 250, 400, 450, '#ff8fab', [370, 490, 610]);
  s += shelfUnit(560, 250, 400, 450, '#ffd166', [370, 490, 610]);
  s += shelfUnit(1020, 250, 400, 450, '#90e0ef', [370, 490, 610]);
  const sign = (x, c, txt) => G(x, 160, P('M150 -24 L150 0', 'none', 'stroke="#999" stroke-width="2"') + R(4, 6, 300, 60, '#000', 30, 'opacity=".1"') + R(0, 0, 300, 60, '#fff', 30) + R(0, 0, 300, 60, 'url(#g-vol)', 30) + T(150, 42, 32, c, txt));
  s += sign(150, '#ff5d8f', 'Obst & Gemüse') + sign(610, '#e09f3e', 'Süßes & Brot') + sign(1070, '#0096c7', 'Getränke');
  // Tiefkühltruhe
  s += SH(1640, 704, 160, 9) + G(1500, 560, R(0, 0, 280, 140, '#4ea8de', 16) + R(0, 0, 280, 140, 'url(#g-vol)', 16) + R(12, 12, 256, 30, '#caf0f8', 8) + R(12, 12, 256, 30, 'url(#g-glass)', 8) +
    T(140, 100, 30, '#fff', 'EIS ❄️') + R(10, 124, 260, 8, '#3a86b8', 4) + [30, 80, 200, 250].map((x) => C(x, 30, 3, '#fff', 'opacity=".8"')).join(''));
  // Angebotsplakat
  s += G(1500, 220, R(4, 6, 280, 90, '#000', 20, 'opacity=".1"') + R(0, 0, 280, 90, '#fff', 20) + R(0, 0, 280, 90, 'url(#g-vol)', 20) + R(8, 8, 264, 74, 'none', 14, 'stroke="#ff595e" stroke-width="3" stroke-dasharray="8 6"') + T(140, 60, 36, '#ff595e', '% ANGEBOT %'));
  // Einkaufskörbe-Stapel
  s += G(1790, 600, [0, 1, 2].map((i) => P(`M0 ${-i * 16} h80 l-8 40 h-64z`, '#e63946') + P(`M8 ${-i * 16 + 8} h64`, 'none', 'stroke="#fff" stroke-width="2" opacity=".5"')).join('') + R(0, 34, 80, 6, '#b5162b', 3));
  // Kasse mit Förderband
  s += SH(2060, 704, 190, 10) + G(1880, 540, R(0, 0, 360, 160, '#adb5bd', 12) + R(0, 0, 360, 160, 'url(#g-vol)', 12) + R(0, 0, 360, 22, '#343a40', 8) +
    Array.from({ length: 18 }, (_, i) => R(6 + i * 20, 4, 3, 14, '#4a5057')).join('') + R(0, 0, 360, 4, '#6c757d', 3) +
    R(20, 40, 320, 100, '#ced4da', 10) + R(20, 40, 320, 100, 'url(#g-vol)', 10) + R(36, 56, 140, 70, '#bfc6cc', 8) + R(190, 56, 134, 70, '#bfc6cc', 8) + R(176, 80, 8, 30, 'url(#g-metal)', 4) +
    R(150, -10, 50, 12, '#1d3557', 4) + R(154, -8, 42, 6, '#e63946', 2, 'opacity=".8"'));
  return svgWrap(W, s);
}

const marktProps = [
  { id: 'kasse2', kind: 'spawn', x: 2110, y: 430, w: 120, h: 110, spawn: ['🪙', '🪙', '🪙', '💎'], sound: 'coin', from: [2000, 420],
    svg: svgWrap0(120, 110, P('M10 40 L110 40 L120 110 L0 110Z', '#4361ee') + P('M10 40 L110 40 L120 110 L0 110Z', 'url(#g-vol)') + R(20, 0, 80, 44, '#1e1e1e', 8) + R(26, 6, 68, 26, '#0f2a0f', 3) + T(60, 26, 20, '#8ac926', '9,99') +
      [0, 1, 2].map((i) => [0, 1].map((r) => R(22 + i * 26, 58 + r * 18, 22, 12, '#fff', 3) + R(22 + i * 26, 67 + r * 18, 22, 3, '#ccd', 1)).join('')).join('') + R(0, 104, 120, 6, '#2b3fa8', 3)) },
];

const marktFG = [
  { x: 1500, y: 560, w: 280, h: 46, svg: svgWrap0(280, 46, R(0, 0, 280, 18, '#bde0fe', 8, 'opacity=".7"')) },
];

// ======================= FRISEUR =======================
function finish(W, wallC) {
  // Licht/Schatten an Wand und Boden + Fußleiste
  return R(0, 0, W, FLOOR, 'url(#g-wall)') + R(0, FLOOR, W, H - FLOOR, 'url(#g-floor)') + R(0, FLOOR - 2, W, 3, '#000', 0, 'opacity=".12"') + (wallC ? R(0, 40, W, 3, '#fff', 0, 'opacity=".5"') : '');
}

function friseurBG() {
  const W = 1500;
  let s = patterns('fris');
  s += R(0, 0, W, FLOOR, '#ffe5ec') + R(0, 0, W, FLOOR, 'url(#fris-stripes)') + R(0, 0, W, FLOOR, 'url(#p-damask)') +
    R(0, 480, W, FLOOR - 480, '#ffd1dc') + R(0, 474, W, 10, '#fff') + R(0, 482, W, 4, '#000', 0, 'opacity=".06"') +
    R(0, FLOOR, W, H - FLOOR, '#ffb3c6') + R(0, FLOOR, W, H - FLOOR, 'url(#fris-checker)') + R(0, FLOOR - 16, W, 18, '#fb6f92') + R(0, FLOOR - 16, W, 3, '#ffc2d1') + finish(W);
  s += R(0, 0, W, 30, '#fb6f92') + R(0, 26, W, 6, '#c9184a');
  s += G(560, 40, R(4, 8, 380, 70, '#000', 35, 'opacity=".12"') + R(0, 0, 380, 70, '#fb6f92', 35) + R(0, 0, 380, 70, 'url(#g-vol)', 35) + T(190, 50, 40, '#fff', 'FRISEUR ✂️'));
  const mirror = (x) => {
    let m = R(6, 8, 200, 250, '#000', 100, 'opacity=".1"') + R(0, 0, 200, 250, '#ffd166', 100) + R(0, 0, 200, 250, 'url(#g-volh)', 100) + R(12, 12, 176, 226, '#d8f3ff', 88) + R(12, 12, 176, 226, 'url(#g-glass)', 88) +
      P('M50 50 L90 36 L50 150Z', '#fff', 'opacity=".5"') + P('M120 160 L140 150 L120 210Z', '#fff', 'opacity=".3"');
    for (let i = 0; i < 6; i++) {
      const bx = 100 + Math.cos(Math.PI + (i * Math.PI) / 5) * 112, by = 120 + Math.sin(Math.PI + (i * Math.PI) / 5) * 136;
      m += C(bx, by, 22, 'url(#g-bulb)', 'opacity=".6"') + C(bx, by, 9, '#fff7c2') + C(bx - 3, by - 3, 3, '#fff');
    }
    return G(x, 130, m);
  };
  s += mirror(140) + mirror(520);
  // Frisuren-Poster
  const poster = (x, y, hc) => frame(x, y, 110, 140, '#fff', R(12, 12, 86, 116, '#ffe5ec') + C(55, 64, 24, '#f8c9a0') + P('M29 62 Q30 30 55 30 Q80 30 81 62 Q74 44 55 42 Q36 44 29 62Z', hc) + R(38, 86, 34, 30, '#fb6f92', 10) + C(47, 64, 2.5, '#333') + C(63, 64, 2.5, '#333') + P('M48 74 q7 5 14 0', 'none', 'stroke="#c9184a" stroke-width="2"'));
  s += poster(370, 150, '#9b5de5') + poster(760, 150, '#2ec4b6');
  const salonChair = (x) => SH(x + 60, 704, 70, 8) + G(x, 470, R(10, 0, 100, 110, '#e63946', 30) + R(10, 0, 100, 110, 'url(#g-vol)', 30) + R(26, 14, 68, 80, 'none', 20, 'stroke="#b5162b" stroke-width="2"') +
    [40, 60, 80].map((xx) => C(xx, 50, 3, '#b5162b')).join('') + R(0, 96, 120, 30, '#c1121f', 14) + R(0, 96, 120, 30, 'url(#g-vol)', 14) + R(-6, 70, 16, 8, 'url(#g-metal)', 4) + R(110, 70, 16, 8, 'url(#g-metal)', 4) +
    R(52, 126, 16, 70, 'url(#g-metal)') + E(60, 222, 56, 10, '#555') + E(60, 219, 50, 6, '#888') + R(40, 196, 40, 8, '#666', 3));
  s += salonChair(180) + salonChair(560);
  s += SH(990, 704, 140, 8) + G(860, 540, R(0, 0, 260, 160, '#fff', 12) + VOL(0, 0, 260, 160, 12) + R(0, 0, 260, 18, '#fb6f92', 8) + R(0, 0, 260, 5, '#ffc2d1', 4) +
    R(16, 34, 108, 110, '#ffe5ec', 8) + R(136, 34, 108, 110, '#ffe5ec', 8) + VOL(16, 34, 108, 110, 8) + VOL(136, 34, 108, 110, 8) + R(108, 80, 7, 28, 'url(#g-metal)', 3) + R(145, 80, 7, 28, 'url(#g-metal)', 3));
  s += G(860, 330, R(0, 0, 260, 12, '#fb6f92', 6) + R(0, 0, 260, 3, '#ffc2d1', 2) + P('M14 12 L30 12 L14 34Z M246 12 L230 12 L246 34Z', '#c9184a'));
  s += SH(1260, 704, 70, 8) + G(1200, 470, R(10, 0, 100, 110, '#7b2cbf', 30) + R(10, 0, 100, 110, 'url(#g-vol)', 30) + R(0, 96, 120, 30, '#5a189a', 14) + R(0, 96, 120, 30, 'url(#g-vol)', 14) +
    R(52, 126, 16, 70, 'url(#g-metal)') + E(60, 222, 56, 10, '#555') + E(60, 219, 50, 6, '#888'));
  s += G(1420, 280, R(-6, -10, 52, 14, 'url(#g-metal)', 6) + R(0, 0, 40, 160, '#fff', 20) + `<g opacity=".9">${[0, 1, 2, 3].map((i) => P(`M0 ${i * 40 + 10} L40 ${i * 40 - 10} L40 ${i * 40 + 10} L0 ${i * 40 + 30}Z`, i % 2 ? '#1982c4' : '#e63946')).join('')}</g>` +
    R(0, 0, 40, 160, 'url(#g-volh)', 20) + R(-6, 156, 52, 14, 'url(#g-metal)', 6));
  s += plant(60, 700, 1);
  return svgWrap(W, s);
}

const friseurProps = [
  { id: 'trockner', kind: 'dryer', x: 1170, y: 300, w: 180, h: 180, seat: 'friseur:s3', sound: 'dryer',
    svg: svgWrap0(180, 180, R(150, 40, 14, 140, 'url(#g-metal)', 6) + P('M156 60 L120 70', 'none', 'stroke="#aab4be" stroke-width="10" stroke-linecap="round"') +
      P('M10 120 Q10 40 90 40 Q170 40 170 120 L150 132 Q90 110 30 132Z', '#c77dff') + P('M10 120 Q10 40 90 40 Q170 40 170 120 L150 132 Q90 110 30 132Z', 'url(#g-vol)') +
      P('M36 70 Q60 48 96 46', 'none', 'stroke="#fff" stroke-width="5" opacity=".45" stroke-linecap="round"') + E(90, 124, 62, 12, '#9d4edd') + E(90, 122, 50, 6, '#7b2cbf') +
      [50, 70, 90, 110, 130].map((x) => C(x, 96, 3, '#9d4edd')).join('') +
      `<g class="wind">${P('M40 140 Q50 150 40 162', 'none', 'stroke="#fff" stroke-width="4"')}${P('M90 144 Q100 154 90 166', 'none', 'stroke="#fff" stroke-width="4"')}${P('M140 140 Q150 150 140 162', 'none', 'stroke="#fff" stroke-width="4"')}</g>`) },
];

// ======================= PARK =======================
function parkBG() {
  const W = 2600;
  let s = `<defs><linearGradient id="park-hill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b7e4c7"/><stop offset="1" stop-color="#74c69d"/></linearGradient>
    <linearGradient id="park-grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fbf7f"/><stop offset="1" stop-color="#2d8a55"/></linearGradient>
    <linearGradient id="park-path" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e3b98a"/><stop offset="1" stop-color="#c99766"/></linearGradient></defs>`;
  s += R(0, 0, W, H, 'url(#g-sky)', 0, 'class="sky"') + stars(0, 20, W, 300, 40) +
    C(1600, 120, 80, '#ffe066', 'class="daysun" opacity=".25"') + C(1600, 120, 54, '#ffe066', 'class="daysun"') + C(1600, 120, 44, '#fff8c4', 'class="moon"');
  const cloud = (x, y, k) => G(x, y, `<g class="daysun" transform="scale(${k})">${E(10, 10, 80, 18, '#dceefa')}${E(0, 0, 60, 26, '#fff')}${E(40, -16, 44, 30, '#fff')}${E(80, 0, 54, 24, '#fff')}${E(30, -24, 20, 10, '#fff', 'opacity=".8"')}</g>`);
  s += cloud(300, 120, 1) + cloud(900, 80, 0.8) + cloud(2100, 140, 1.1) + cloud(1300, 220, 0.6);
  // Hügel mit Bäumen in der Ferne
  s += E(400, 650, 650, 220, '#a8dcc0') + E(1400, 670, 760, 240, 'url(#park-hill)') + E(2300, 650, 650, 220, '#a8dcc0');
  for (const [x, y, r] of [[260, 470, 26], [330, 480, 20], [1160, 460, 30], [1240, 470, 22], [1980, 470, 28], [2060, 478, 20], [2440, 470, 24]]) s += R(x - 3, y, 6, 30, '#6b8f71') + C(x, y, r, '#7fbf93') + C(x - r * 0.3, y - r * 0.3, r * 0.5, '#9bd3ad');
  s += R(0, 620, W, H - 620, 'url(#park-grass)') + R(0, FLOOR, W, H - FLOOR, '#3a9a5f') + R(0, FLOOR, W, H - FLOOR, 'url(#p-noise)') + R(0, FLOOR, W, 10, '#000', 0, 'opacity=".1"');
  for (let x = 5; x < W; x += 23) s += P(`M${x} ${FLOOR + 14 + (x % 3) * 12} l3 -10 l3 10`, 'none', 'stroke="#2d7a4a" stroke-width="2" opacity=".6"');
  s += P(`M0 760 Q${W / 2} 730 ${W} 770 L${W} 802 Q${W / 2} 764 0 794Z`, 'url(#park-path)') + P(`M0 760 Q${W / 2} 730 ${W} 770`, 'none', 'stroke="#f2d3ae" stroke-width="3"');
  for (let x = 40; x < W; x += 90) s += E(x, 777 - Math.sin((x / W) * Math.PI) * 14, 8, 4, '#b98858', 'opacity=".6"');
  // Zaun
  for (let x = 20; x < W; x += 60) s += R(x, 606, 12, 66, '#fff', 3) + R(x, 606, 12, 66, 'url(#g-volh)', 3) + P(`M${x} 610 l6 -8 l6 8`, '#fff');
  s += R(0, 622, W, 9, '#fff', 3) + R(0, 650, W, 9, '#fff', 3) + R(0, 629, W, 2, '#000', 0, 'opacity=".1"') + R(0, 657, W, 2, '#000', 0, 'opacity=".1"');
  // Büsche
  for (const x of [40, 760, 1860, 2340]) s += G(x, 690, E(0, 0, 60, 34, '#2d8a55') + C(-26, -14, 26, '#3aa36a') + C(14, -22, 30, '#40b073') + C(40, -6, 22, '#3aa36a') + C(8, -30, 10, '#ff6fb5') + C(-20, -20, 8, '#fff') + C(34, -14, 8, '#ff6fb5'));
  const flower = (x, c) => G(x, FLOOR + 30, R(-2, -30, 4, 30, '#2d6a4f') + E(-8, -16, 8, 4, '#2d6a4f', 'transform="rotate(-30 -8 -16)"') + C(-8, -32, 7, c) + C(8, -32, 7, c) + C(0, -40, 7, c) + C(0, -24, 7, c) + C(0, -32, 5, '#ffd60a') + C(-1, -33, 2, '#fff', 'opacity=".6"'));
  [60, 520, 940, 1420, 1800, 2150, 2560, 300, 1700, 2250].forEach((x, i) => (s += flower(x, ['#ff595e', '#ff6fb5', '#ffca3a', '#9b5de5'][i % 4])));
  // Sandkasten
  s += G(1450, 640, R(0, 30, 310, 40, '#c9894a', 10) + R(0, 30, 310, 40, 'url(#p-grain)', 10) + R(0, 30, 310, 6, '#e3ad6e', 4) + E(155, 34, 150, 16, '#f4d58d') + E(155, 34, 150, 16, 'url(#p-noise)') + E(110, 30, 30, 6, '#ffe8b0'));
  // Bank
  s += SH(1970, 704, 150, 9) + G(1830, 520, [0, 30].map((y) => R(0, y, 280, 22, '#bc6c25', 8) + GRAIN(0, y, 280, 22, 8) + R(0, y, 280, 4, '#e09f5c', 3)).join('') +
    R(0, 88, 280, 18, '#dda15e', 8) + GRAIN(0, 88, 280, 18, 8) + R(0, 88, 280, 4, '#f2c48a', 3) + R(20, 52, 14, 128, '#444', 4) + R(246, 52, 14, 128, '#444', 4) + R(22, 52, 4, 126, '#777'));
  // Hundehütte
  s += SH(2250, 704, 100, 8) + G(2160, 560, R(14, 50, 152, 90, '#f4a261') + R(14, 50, 152, 90, 'url(#p-grain)') + R(14, 50, 152, 90, 'url(#g-volh)') +
    P('M-6 56 L90 -4 L186 56Z', '#e63946') + [0, 1, 2].map((r) => P(`M${10 + r * 26} ${46 - r * 15} L${170 - r * 26} ${46 - r * 15}`, 'none', 'stroke="#b5162b" stroke-width="2"')).join('') + P('M-6 56 L90 -4 L186 56', 'none', 'stroke="#ff8a8f" stroke-width="3"') +
    P('M60 140 L60 100 Q90 70 120 100 L120 140Z', '#4a2a10') + R(70, 66, 40, 18, '#fff', 4) + T(90, 80, 14, '#e63946', 'WAU') + E(150, 134, 16, 6, '#1982c4') + E(150, 131, 12, 3, '#c68b59'));
  // Laternen
  const lantern = (x) => G(x, 380, C(0, 18, 40, 'url(#g-bulb)', 'opacity=".5"') + R(-5, 20, 10, 300, '#2b2b2b') + R(-3, 20, 3, 300, '#555') + R(-10, 300, 20, 20, '#2b2b2b', 3) +
    P('M-20 0 L20 0 L14 36 L-14 36Z', '#2b2b2b') + R(-12, 6, 24, 24, '#fff7c2', 4) + R(-12, 6, 8, 24, '#fff', 3, 'opacity=".6"') + P('M-24 0 L0 -14 L24 0Z', '#2b2b2b'));
  s += lantern(950) + lantern(1800);
  return svgWrap(W, s);
}

const parkProps = [
  { id: 'baum', kind: 'tree', x: 80, y: 110, w: 400, h: 590, spawn: ['🍎', '🍎', '🍐', '🍎', '🐦'], sound: 'pop',
    svg: svgWrap0(400, 590, E(200, 588, 150, 12, 'url(#g-sh)') +
      R(170, 260, 60, 330, '#8d5524', 20) + R(170, 260, 60, 330, 'url(#g-volh)', 20) + P('M184 300 q6 40 0 80 q-6 40 4 90 M210 330 q-6 50 4 100 M196 470 q8 40 2 100', 'none', 'stroke="#5e3613" stroke-width="3" opacity=".6"') +
      P('M200 380 L120 300', 'none', 'stroke="#8d5524" stroke-width="22" stroke-linecap="round"') + P('M200 340 L276 280', 'none', 'stroke="#8d5524" stroke-width="16" stroke-linecap="round"') + E(200, 470, 10, 14, '#4a2a10') +
      `<g class="canopy">${C(200, 175, 155, '#2d8a55')}${C(200, 170, 150, '#40916c')}${C(90, 220, 90, '#4aa36f')}${C(310, 220, 90, '#4aa36f')}${C(200, 80, 90, '#52b788')}
      ${C(150, 110, 50, '#74c69d', 'opacity=".55"')}${C(80, 200, 36, '#74c69d', 'opacity=".45"')}${C(270, 160, 40, '#74c69d', 'opacity=".45"')}
      ${[[120, 150], [260, 120], [300, 260], [170, 260], [220, 200], [80, 260], [140, 210], [320, 190]].map(([x, y]) => C(x, y, 14, '#e63946') + C(x - 4, y - 4, 4, '#fff', 'opacity=".55"') + P(`M${x} ${y - 14} l3 -6`, 'none', 'stroke="#5e3613" stroke-width="2"')).join('')}</g>`) },
  { id: 'schaukel', kind: 'swing', x: 560, y: 300, w: 360, h: 400,
    svg: svgWrap0(360, 400, E(180, 400, 170, 10, 'url(#g-sh)') + P('M20 400 L60 20 M100 400 L60 20 M260 400 L300 20 M340 400 L300 20', 'none', 'stroke="#e76f51" stroke-width="16" stroke-linecap="round"') +
      P('M20 400 L60 20 M260 400 L300 20', 'none', 'stroke="#f4a582" stroke-width="5" stroke-linecap="round"') +
      R(50, 14, 260, 18, '#bc6c25', 8) + R(50, 14, 260, 18, 'url(#p-grain)', 8) + R(50, 14, 260, 5, '#e09f5c', 3) +
      `<g class="sw sw0">${P('M68 30 L68 300 M112 30 L112 300', 'none', 'stroke="#777" stroke-width="4" stroke-dasharray="6 3"')}${R(56, 296, 68, 14, '#ffca3a', 6)}${R(56, 296, 68, 5, '#ffe08a', 3)}</g>
       <g class="sw sw1">${P('M228 30 L228 300 M272 30 L272 300', 'none', 'stroke="#777" stroke-width="4" stroke-dasharray="6 3"')}${R(216, 296, 68, 14, '#ff6fb5', 6)}${R(216, 296, 68, 5, '#ffa8d2', 3)}</g>`) },
  { id: 'rutsche', kind: 'deco', x: 1000, y: 380, w: 400, h: 320,
    svg: svgWrap0(400, 320, E(200, 320, 190, 9, 'url(#g-sh)') + R(20, 40, 10, 280, '#1982c4', 4) + R(90, 40, 10, 280, '#1982c4', 4) + R(22, 40, 3, 280, '#6fb6ec') + R(92, 40, 3, 280, '#6fb6ec') +
      [80, 130, 180, 230, 280].map((y) => R(26, y, 70, 8, '#1982c4', 4) + R(26, y, 70, 3, '#6fb6ec', 2)).join('') + R(10, 36, 110, 14, '#1982c4', 6) +
      P('M100 44 Q210 60 260 200 Q290 290 395 300 L395 320 Q270 312 240 210 Q200 80 100 64Z', '#ff595e') + P('M104 50 Q206 66 252 200 Q282 288 392 302', 'none', 'stroke="#ffb3b5" stroke-width="5"') +
      P('M100 64 Q200 80 240 210 Q270 312 395 320', 'none', 'stroke="#c1121f" stroke-width="4"')) },
  { id: 'eiswagen', kind: 'spawn', x: 2380, y: 380, w: 200, h: 320, spawn: ['🍦', '🍨', '🍧', '🍭'], sound: 'ding', from: [2480, 470],
    svg: svgWrap0(200, 320, E(100, 320, 100, 8, 'url(#g-sh)') + R(96, 0, 8, 180, 'url(#g-metal)') + P('M0 40 Q100 -20 200 40Z', '#ff6fb5') + P('M0 40 Q100 -20 200 40Z', 'url(#g-vol)') +
      P('M30 40 Q50 20 70 40 M130 40 Q150 20 170 40', 'none', 'stroke="#fff" stroke-width="6"') + Array.from({ length: 8 }, (_, i) => P(`M${i * 25} 40 q12.5 12 25 0`, '#ff6fb5')).join('') +
      R(10, 180, 180, 110, '#fff', 14) + R(10, 180, 180, 110, 'url(#g-vol)', 14) + R(0, 172, 200, 16, '#00bbf9', 8) + R(0, 172, 200, 5, '#7fdcff', 3) +
      T(100, 250, 30, '#ff6fb5', 'EIS 🍦') + R(20, 262, 160, 6, '#00bbf9', 3) +
      C(50, 296, 22, '#2b2b2b') + C(150, 296, 22, '#2b2b2b') + C(50, 296, 9, 'url(#g-metal)') + C(150, 296, 9, 'url(#g-metal)')) },
];

const parkFG = [
  { x: 1450, y: 688, w: 310, h: 30, svg: svgWrap0(310, 30, R(0, 0, 310, 26, '#c9894a', 8) + R(0, 0, 310, 26, 'url(#p-grain)', 8) + R(0, 0, 310, 5, '#e3ad6e', 3)) },
];

// ======================= BADEZIMMER =======================
function badBG() {
  const W = 2100;
  let s = patterns('bad');
  s += R(0, 0, W, FLOOR, '#c9f2ee') + R(0, 0, W, FLOOR, 'url(#p-tiles)') + R(0, 0, W, 40, '#2ec4b6') + R(0, 34, W, 6, '#1f9d92') +
    R(0, 380, W, FLOOR - 380, '#a8e6df') + R(0, 380, W, FLOOR - 380, 'url(#p-tiles)') + R(0, 372, W, 10, '#fff') + R(0, 380, W, 3, '#000', 0, 'opacity=".06"') +
    R(0, FLOOR, W, H - FLOOR, '#e8f7ff') + R(0, FLOOR, W, H - FLOOR, 'url(#bad-checker)') + R(0, FLOOR - 16, W, 18, '#7fd1c7') + R(0, FLOOR - 16, W, 3, '#c2ece6') + finish(W);
  // Regendusche
  s += G(70, 110, R(0, 0, 420, 580, '#e6fbff', 10) + R(0, 0, 420, 580, 'url(#p-tiles)') + R(0, 0, 420, 580, 'url(#g-volh)'));
  s += G(60, 680, R(0, 0, 440, 22, '#ffffff', 8) + R(0, 0, 440, 22, 'url(#g-vol)', 8) + E(220, 6, 30, 4, '#9aa5b1') + E(220, 6, 18, 2, '#555'));
  s += G(90, 64, R(0, 0, 380, 12, 'url(#g-metal)', 6));
  s += G(370, 430, R(0, 0, 60, 90, '#e3e7eb', 14) + R(0, 0, 60, 90, 'url(#g-volh)', 14) + C(30, 30, 15, 'url(#g-metal)') + C(30, 30, 6, '#ff595e') + R(24, 56, 12, 24, 'url(#g-metal)', 5));
  s += G(100, 380, R(0, 0, 130, 12, '#fff', 6) + R(0, 0, 130, 3, '#fff', 2) + R(0, 10, 130, 4, '#000', 0, 'opacity=".1"'));
  s += G(250, 190, R(3, 4, 160, 34, '#000', 17, 'opacity=".08"') + R(0, 0, 160, 34, '#fff', 17) + T(80, 25, 20, '#2ec4b6', 'REGENDUSCHE'));
  // Fenster, Handtücher
  s += windowSVG(700, 130, 140, 140, null, true);
  const towel = (x, h, c) => R(x, 8, 30, h, c, 6) + VOLH(x, 8, 30, h, 6) + R(x, h - 10, 30, 4, '#fff', 0, 'opacity=".7"') + R(x, h - 2, 30, 3, '#fff', 0, 'opacity=".7"');
  s += G(560, 150, R(0, 0, 70, 8, 'url(#g-metal)', 4) + towel(4, 110, '#ff99c8') + towel(36, 90, '#ffd166'));
  // Badewanne (Rückseite)
  s += G(600, 560, R(0, 0, 400, 50, '#d9f2ff', 24) + E(200, 18, 180, 14, '#8fd3ff') + E(200, 14, 160, 8, '#c4ecff'));
  // Waschbecken mit Spiegel
  s += G(1110, 240, R(5, 6, 200, 210, '#000', 100, 'opacity=".1"') + R(0, 0, 200, 210, '#ffffff', 100) + R(0, 0, 200, 210, 'url(#g-volh)', 100) + R(12, 12, 176, 186, '#d8f3ff', 88) + R(12, 12, 176, 186, 'url(#g-glass)', 88) + P('M50 50 L90 36 L50 140Z', '#fff', 'opacity=".5"'));
  s += SH(1210, 704, 130, 8) + G(1090, 560, R(0, 0, 240, 22, '#ffffff', 10) + R(0, 0, 240, 22, 'url(#g-vol)', 10) + E(120, 8, 70, 8, '#d9f2ff') + E(120, 8, 8, 3, '#888') +
    R(10, 22, 220, 118, '#2ec4b6', 10) + VOL(10, 22, 220, 118, 10) + R(26, 38, 90, 86, '#5fd3c7', 8) + R(124, 38, 90, 86, '#5fd3c7', 8) + VOL(26, 38, 90, 86, 8) + VOL(124, 38, 90, 86, 8) +
    R(100, 66, 7, 28, 'url(#g-metal)', 3) + R(133, 66, 7, 28, 'url(#g-metal)', 3));
  // Badvorleger
  s += E(1210, 780, 120, 22, '#ff99c8') + E(1210, 780, 104, 16, 'none', 'stroke="#fff" stroke-width="3" stroke-dasharray="6 5"') + E(800, 780, 160, 24, '#ffd166') + E(800, 780, 144, 18, 'none', 'stroke="#fff" stroke-width="3" stroke-dasharray="6 5"');
  // Zwei Toiletten mit Trennwänden
  s += G(1430, 120, R(4, 6, 560, 70, '#000', 20, 'opacity=".1"') + R(0, 0, 560, 70, '#2ec4b6', 20) + R(0, 0, 560, 70, 'url(#g-vol)', 20) + T(140, 48, 34, '#fff', 'WC 1') + T(420, 48, 34, '#fff', 'WC 2') + T(280, 46, 30, '#fff', '🚻'));
  const wall = (x) => G(x, 250, R(0, 0, 22, 420, '#ff924c', 8) + R(0, 0, 22, 420, 'url(#g-volh)', 8) + R(2, 0, 4, 420, '#ffc08a', 2) + R(5, 410, 12, 30, 'url(#g-metal)', 3));
  s += wall(1420) + wall(1690) + wall(1960);
  const paper = (x) => G(x, 500, R(0, 0, 40, 8, 'url(#g-metal)', 4) + C(20, 22, 16, '#fff') + C(20, 22, 16, 'url(#g-volh)') + C(20, 22, 5, '#ddd') + R(14, 36, 12, 34, '#fff', 3) + R(14, 36, 12, 34, 'url(#g-volh)', 3) + R(14, 52, 12, 1, '#ccc'));
  s += paper(1630) + paper(1900);
  s += plant(2050, 700, 1);
  s += hangLamp(800, 50, '#2ec4b6') + hangLamp(1600, 40, '#2ec4b6');
  return svgWrap(W, s);
}

const badProps = [
  { id: 'regen', kind: 'toggle', x: 110, y: 70, w: 340, h: 70, sound: 'splash',
    svg: svgWrap0(340, 70, R(160, 0, 20, 30, 'url(#g-metal)', 4) + R(0, 26, 340, 34, '#d7dce1', 14) + R(0, 26, 340, 34, 'url(#g-vol)', 14) + R(10, 52, 320, 8, '#9aa5b1', 4) + R(6, 28, 328, 4, '#fff', 2, 'opacity=".8"') +
      Array.from({ length: 15 }, (_, i) => C(24 + i * 21, 56, 2.2, '#555')).join('') +
      `<g class="water">${Array.from({ length: 12 }, (_, i) => 22 + i * 27).map((x, i) => `<path d="M${x} 64 L${x - 4} 620" stroke="#4cc9f0" stroke-width="5" stroke-linecap="round" stroke-dasharray="${12 + (i % 3) * 4} 22" class="drops" opacity=".85"/>`).join('')}</g>`) },
  { id: 'wannenhahn', kind: 'toggle', x: 950, y: 470, w: 70, h: 90, sound: 'splash',
    svg: svgWrap0(70, 90, R(46, 0, 14, 90, 'url(#g-metal)', 6) + R(6, 10, 54, 14, '#b9c0c7', 7) + R(6, 10, 54, 5, '#fff', 3, 'opacity=".6"') + C(52, 44, 10, 'url(#g-metal)') + C(52, 44, 5, '#ff595e') +
      `<g class="water"><path d="M12 24 L10 120" stroke="#4cc9f0" stroke-width="8" stroke-linecap="round" stroke-dasharray="14 10" class="drops"/></g>`) },
  { id: 'wasserhahn', kind: 'toggle', x: 1180, y: 500, w: 60, h: 60, sound: 'splash',
    svg: svgWrap0(60, 60, R(24, 10, 12, 50, 'url(#g-metal)', 6) + R(4, 10, 32, 12, '#b9c0c7', 6) + R(4, 10, 32, 4, '#fff', 2, 'opacity=".6"') + C(30, 6, 8, 'url(#g-metal)') + C(30, 6, 4, '#4f8cff') +
      `<g class="water"><path d="M8 22 L8 62" stroke="#4cc9f0" stroke-width="6" stroke-linecap="round" stroke-dasharray="10 8" class="drops"/></g>`) },
  { id: 'klo1', kind: 'flush', x: 1490, y: 520, w: 130, h: 180, sound: 'flush', svg: toiletSVG('#ffd6e7'), bowl: { x1: 1500, x2: 1610, y: 612 } },
  { id: 'klo2', kind: 'flush', x: 1760, y: 520, w: 130, h: 180, sound: 'flush', svg: toiletSVG('#d6f0ff'), bowl: { x1: 1770, x2: 1880, y: 612 } },
];

const badFG = [
  { x: 486, y: 110, w: 16, h: 580, svg: svgWrap0(16, 580, R(0, 0, 16, 580, '#bfefff', 6, 'opacity=".45"') + R(0, 0, 16, 580, 'url(#g-glass)', 6) + R(4, 20, 4, 200, '#fff', 2, 'opacity=".7"') + R(0, 0, 16, 8, 'url(#g-metal)', 3) + R(0, 572, 16, 8, 'url(#g-metal)', 3)) },
  { x: 600, y: 588, w: 400, h: 112, svg: tubFront() },
];

// ======================= HEYLINSCHULE =======================
const SDESKS = [1100, 1400, 1700, 2000];
const BOARD_PAGES = [
  T(230, 110, 64, '#fff', 'Hallo 4A!') + T(230, 180, 34, '#ffe066', 'Willkommen in der') + T(230, 225, 34, '#ffe066', 'Heylinschule 🏫'),
  T(230, 100, 56, '#fff', '3 + 4 = 7') + T(230, 170, 56, '#fff', '5 · 6 = 30') + T(230, 236, 46, '#a7f3d0', '12 − 5 = ?'),
  T(230, 100, 54, '#fff', 'A B C D E') + T(230, 170, 46, '#fde68a', 'Hund · Katze') + T(230, 232, 40, '#fbcfe8', 'Schreibschrift ✍️'),
  `<text x="70" y="140" font-size="90">🌞</text><text x="250" y="170" font-size="110">🏠</text>` + P('M30 250 L430 250', 'none', 'stroke="#a7f3d0" stroke-width="6"') + T(330, 70, 30, '#fff', 'Kunst 🎨'),
  T(230, 100, 46, '#fff', 'Hausaufgaben:') + T(230, 160, 34, '#fde68a', 'Mathe S. 42') + T(230, 214, 34, '#fbcfe8', 'Lesen: 10 Minuten 📖'),
];

function schuleBG() {
  const W = 2400;
  let s = patterns('schule');
  // Flur
  s += R(0, 0, 700, FLOOR, '#fde68a') + R(0, 0, 700, FLOOR, 'url(#schule-stripes)') + R(0, 470, 700, FLOOR - 470, '#f59e0b') + R(0, 462, 700, 10, '#fff');
  // Klassenzimmer
  s += R(700, 0, W - 700, FLOOR, '#e0f2fe') + R(700, 0, W - 700, FLOOR, 'url(#schule-dots)') + R(700, 470, W - 700, FLOOR - 470, '#bae6fd') + R(700, 462, W - 700, 10, '#fff');
  s += roofBand(W, '#dc2626', '#991b1b');
  s += R(0, 0, 700, FLOOR, 'url(#p-damask)') + R(0, 470, W, FLOOR - 470, 'url(#g-vol)') + R(0, 470, 700, FLOOR - 470, 'url(#p-tiles)');
  s += R(0, FLOOR, 700, H - FLOOR, '#d6d3d1') + R(0, FLOOR, 700, H - FLOOR, 'url(#schule-tiles)') + R(700, FLOOR, W - 700, H - FLOOR, '#c68b59') + R(700, FLOOR, W - 700, H - FLOOR, 'url(#schule-wood)') + R(0, FLOOR - 16, W, 18, '#92400e') + R(0, FLOOR - 16, W, 3, '#c2410c') + finish(W);
  // Schild Heylinschule
  s += G(60, 70, R(5, 7, 560, 110, '#000', 22, 'opacity=".12"') + R(0, 0, 560, 110, '#dc2626', 22) + R(0, 0, 560, 110, 'url(#g-vol)', 22) + R(10, 10, 540, 90, '#fff', 16) + R(10, 10, 540, 90, 'url(#g-vol)', 16) + T(282, 79, 56, '#000', 'Heylinschule', 'opacity=".1"') + T(280, 76, 56, '#dc2626', 'Heylinschule') + C(26, 55, 6, 'url(#g-metal)') + C(534, 55, 6, 'url(#g-metal)'));
  s += G(60, 196, `<text x="0" y="40" font-size="40">🏫</text>` + T(300, 36, 26, '#92400e', 'Lernen · Spielen · Lachen'));
  // Garderobe mit Haken
  s += G(50, 290, R(0, 0, 400, 16, '#92400e', 6) + GRAIN(0, 0, 400, 16, 6) + R(0, 0, 400, 4, '#c2410c', 3) + [40, 120, 200, 280, 360].map((x) => P(`M${x} 14 q0 18 10 18`, 'none', 'stroke="url(#g-metal)" stroke-width="5" stroke-linecap="round"') + P(`M${x} 14 q0 18 10 18`, 'none', 'stroke="#9aa5b1" stroke-width="5" stroke-linecap="round"')).join('') +
    P('M106 30 q-26 10 -22 90 h52 q4 -80 -22 -90z', '#1982c4') + P('M106 30 q-26 10 -22 90 h52 q4 -80 -22 -90z', 'url(#g-volh)') + R(96, 60, 20, 30, '#ffca3a', 3) +
    P('M346 30 q-24 10 -20 70 h48 q4 -60 -20 -70z', '#e63946') + P('M346 30 q-24 10 -20 70 h48 q4 -60 -20 -70z', 'url(#g-volh)') + R(330, 70, 40, 6, '#fff', 2, 'opacity=".6"'));
  // Pinnwand mit Bildern
  s += G(470, 260, R(5, 7, 200, 170, '#000', 10, 'opacity=".12"') + R(0, 0, 200, 170, '#b45309', 10) + GRAIN(0, 0, 200, 170, 10) + R(10, 10, 180, 150, '#e9b872', 6) + R(10, 10, 180, 150, 'url(#p-noise)', 6) +
    C(54, 24, 4, '#e63946') + C(140, 28, 4, '#1982c4') + C(95, 94, 4, '#22c55e') +
    R(24, 22, 60, 50, '#fff', 3, 'transform="rotate(-6 54 47)"') + `<text x="36" y="62" font-size="32">🌈</text>` +
    R(110, 26, 60, 50, '#fff', 3, 'transform="rotate(5 140 51)"') + `<text x="122" y="66" font-size="32">🐱</text>` +
    R(60, 92, 70, 54, '#fff', 3, 'transform="rotate(3 95 119)"') + `<text x="76" y="136" font-size="32">🚀</text>`);
  // Tür zur 4A
  s += G(560, 470, R(0, -10, 130, 240, '#92400e', 10) + R(10, 0, 110, 230, '#d97706', 6) + GRAIN(10, 0, 110, 230, 6) + VOL(10, 0, 110, 230, 6) + R(24, 96, 82, 110, 'none', 6, 'stroke="#b45309" stroke-width="3"') +
    R(88, 116, 22, 8, 'url(#g-metal)', 4) + C(92, 120, 6, 'url(#g-metal)') + R(20, 20, 90, 60, '#bae6fd', 6) + R(20, 20, 90, 60, 'url(#g-glass)', 6) + R(25, -60, 80, 40, '#fff', 10) + R(25, -60, 80, 40, 'url(#g-vol)', 10) + T(65, -30, 28, '#dc2626', '4A'));
  // Glaswand-Pfosten
  s += R(692, 42, 16, FLOOR - 42, '#991b1b');
  // ABC-Leiste
  const abc = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  [...abc].forEach((ch, i) => {
    const cols = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];
    s += G(740 + i * 62, 52, R(2, 3, 54, 54, '#000', 10, 'opacity=".12"') + R(0, 0, 54, 54, cols[i % cols.length], 10) + R(0, 0, 54, 54, 'url(#g-vol)', 10) + T(27, 40, 34, '#fff', ch) + T(40, 50, 13, '#fff', ch.toLowerCase(), 'opacity=".8"'));
  });
  // Klassenschild + Uhr
  s += G(760, 130, R(4, 6, 230, 80, '#000', 16, 'opacity=".12"') + R(0, 0, 230, 80, '#22c55e', 16) + R(0, 0, 230, 80, 'url(#g-vol)', 16) + T(115, 54, 40, '#fff', 'Klasse 4A'));
  s += G(2240, 210, C(3, 5, 58, '#000', 'opacity=".12"') + C(0, 0, 58, '#fff') + C(0, 0, 58, 'url(#g-vol)') + C(0, 0, 58, 'none', 'stroke="#dc2626" stroke-width="8"') +
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => R(-3, -50, 6, 10, '#333', 2, `transform="rotate(${i * 30})"`)).join('') +
    '');
  s += `<g class="clockh" style="transform-origin:2240px 210px">${R(2236, 180, 8, 32, '#333', 4)}</g><g class="clockm" style="transform-origin:2240px 210px">${R(2237, 164, 6, 48, '#555', 3)}</g>` + C(2240, 210, 6, '#dc2626');
  // Fenster
  s += windowSVG(2120, 330, 220, 120, '#22c55e');
  // Weltkarte-Poster, Regal
  s += G(1880, 150, R(4, 6, 200, 140, '#000', 8, 'opacity=".12"') + R(0, 0, 200, 140, '#fff', 8) + R(8, 8, 184, 124, '#7dd3fc', 4) + P('M8 40 h184 M8 76 h184 M60 8 v124 M130 8 v124', 'none', 'stroke="#fff" stroke-width="1" opacity=".6"') +
    E(60, 60, 34, 26, '#22c55e') + E(130, 80, 40, 30, '#16a34a') + E(150, 40, 20, 14, '#84cc16') + E(40, 100, 14, 10, '#a3e635') + T(100, 128, 16, '#1e3a8a', 'WELT') + C(8, 8, 4, '#e63946') + C(192, 8, 4, '#e63946'));
  // Bücherregal
  s += SH(2330, 704, 90, 7) + G(2245, 530, R(0, 0, 180, 170, '#b45309', 8) + GRAIN(0, 0, 180, 170, 8) + VOL(0, 0, 180, 170, 8) + R(8, 8, 164, 154, '#92400e', 4) + R(8, 80, 164, 8, '#b45309') +
    [['#e63946', 60], ['#1982c4', 64], ['#ffca3a', 52], ['#22c55e', 60], ['#a855f7', 56], ['#f97316', 62], ['#0ea5e9', 50]].map(([c, h], i) => book(14 + i * 22, 80, 20, h, c)).join('') +
    [['#ec4899', 58], ['#84cc16', 62], ['#3b82f6', 54], ['#eab308', 60]].map(([c, h], i) => book(14 + i * 22, 162, 20, h, c)).join('') + `<text x="112" y="154" font-size="44">🧩</text>`);
  // Lehrerpult (hinten) und Tafelleiste
  s += G(1060, 404, R(0, 0, 500, 12, '#6b7280', 4) + R(0, 0, 500, 3, '#9ca3af', 2) + R(60, -6, 30, 8, '#fff', 3) + R(100, -6, 22, 8, '#fde68a', 3) + R(380, -12, 60, 14, '#3b82f6', 4) + R(380, -12, 60, 6, '#e5e7eb', 3));
  s += plant(30, 700, 1);
  s += hangLamp(350, 40, '#dc2626');
  return svgWrap(W, s);
}

const deskFront = (w) => svgWrap0(w, 144, E(w / 2, 144, w * 0.48, 7, 'url(#g-sh)') + R(16, 86, 10, 58, 'url(#g-metal)', 3) + R(w - 26, 86, 10, 58, 'url(#g-metal)', 3) + R(10, 138, 22, 6, '#444', 3) + R(w - 32, 138, 22, 6, '#444', 3) +
  R(0, 0, w, 16, '#fbbf24', 6) + R(0, 0, w, 16, 'url(#p-grain)', 6) + R(0, 0, w, 4, '#fde68a', 3) + R(8, 16, w - 16, 70, '#3b82f6', 6) + VOL(8, 16, w - 16, 70, 6) +
  R(w / 2 - 50, 30, 100, 40, '#60a5fa', 6) + VOL(w / 2 - 50, 30, 100, 40, 6) + R(w / 2 - 14, 46, 28, 6, 'url(#g-metal)', 3) + R(20, 26, 50, 30, '#fff', 3, 'opacity=".9" transform="rotate(-4 45 41)"') + P('M26 34 h36 M26 42 h30 M26 50 h34', 'none', 'stroke="#93c5fd" stroke-width="2" transform="rotate(-4 45 41)"'));

const schuleProps = [
  { id: 'tafel', kind: 'board', x: 1060, y: 130, w: 500, h: 280, sound: 'click',
    svg: svgWrap0(500, 280, R(6, 8, 500, 280, '#000', 12, 'opacity=".14"') + R(0, 0, 500, 280, '#92400e', 12) + GRAIN(0, 0, 500, 280, 12) + VOL(0, 0, 500, 280, 12) + R(14, 14, 472, 252, '#14532d', 6) + R(14, 14, 472, 252, 'url(#p-noise)', 6) +
      P('M40 240 q80 -20 160 6 M300 40 q60 10 150 -4', 'none', 'stroke="#fff" stroke-width="10" opacity=".05" stroke-linecap="round"') +
      BOARD_PAGES.map((pg, i) => `<g class="pg pg${i}" transform="translate(20 0)">${pg}</g>`).join('') +
      R(380, 266, 60, 10, '#fff', 3) + R(100, 266, 40, 10, '#fde68a', 3)) },
  { id: 'schulglocke', kind: 'bell', x: 250, y: 330, w: 110, h: 110,
    svg: svgWrap0(110, 110, R(45, 0, 20, 20, 'url(#g-metal)', 4) + `<g class="bellb">${P('M20 90 Q20 30 55 22 Q90 30 90 90Z', '#fbbf24')}${P('M20 90 Q20 30 55 22 Q90 30 90 90Z', 'url(#g-volh)')}${P('M34 80 Q34 44 52 34', 'none', 'stroke="#fff" stroke-width="5" opacity=".55" stroke-linecap="round"')}</g>` + R(10, 86, 90, 14, '#f59e0b', 7) + R(10, 86, 90, 14, 'url(#g-vol)', 7) + C(55, 104, 9, '#92400e')) },
];

const schuleFG = [
  { x: 760, y: 560, w: 260, h: 144, svg: svgWrap0(260, 144, E(130, 144, 125, 7, 'url(#g-sh)') + R(10, 18, 240, 126, '#b45309', 6) + GRAIN(10, 18, 240, 126, 6) + VOL(10, 18, 240, 126, 6) + R(0, 0, 260, 18, '#92400e', 8) + R(0, 0, 260, 4, '#c2410c', 3) + R(30, 40, 200, 70, '#d97706', 6) + VOL(30, 40, 200, 70, 6) + T(130, 88, 26, '#fff', 'Lehrerin')) },
  ...SDESKS.map((x) => ({ x, y: 560, w: 240, h: 144, svg: deskFront(240) })),
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
  return SH(x, 704, 56, 7) + G(x - 50, 470, R(18, 0, 64, 100, color, 22) + R(18, 0, 64, 100, 'url(#g-vol)', 22) + R(30, 14, 40, 60, 'none', 14, 'stroke="#000" stroke-opacity=".12" stroke-width="2"') + R(46, 100, 8, 14, '#555') +
    R(0, 112, 100, 22, shadeHex(color), 11) + R(0, 112, 100, 22, 'url(#g-vol)', 11) + R(-4, 104, 14, 8, '#444', 3) + R(90, 104, 14, 8, '#444', 3) + R(44, 134, 12, 70, 'url(#g-metal)') +
    P('M10 222 L50 200 L90 222', 'none', 'stroke="#555" stroke-width="8" stroke-linecap="round"') + C(10, 224, 6, '#222') + C(90, 224, 6, '#222') + C(50, 222, 6, '#222'));
}

function desk(x) {
  // Tischplatte bei y=540, Breite 240
  return SH(x + 120, 704, 120, 8) + G(x, 540, R(10, 16, 12, 144, GREY, 4) + R(218, 16, 12, 144, GREY, 4) + R(12, 16, 3, 144, '#888') + R(220, 16, 3, 144, '#888') +
    R(150, 18, 70, 90, '#e9ecea', 6) + VOL(150, 18, 70, 90, 6) + R(162, 36, 46, 6, 'url(#g-metal)', 3) + R(162, 70, 46, 6, 'url(#g-metal)', 3) + R(150, 54, 70, 2, '#ccc') +
    R(0, 0, 240, 16, '#ffffff', 6) + R(0, 0, 240, 16, 'url(#g-vol)', 6) + R(0, 14, 240, 4, '#ccd') +
    R(66, -9, 76, 9, '#2b2b2b', 3) + Array.from({ length: 10 }, (_, i) => R(70 + i * 7, -7, 5, 3, '#555', 1)).join('') + E(160, -4, 9, 5, '#2b2b2b') + E(158, -6, 3, 2, '#666') +
    R(10, -24, 30, 24, '#fff', 3, 'transform="rotate(-6 25 -12)"') + R(12, -20, 26, 3, '#ffd166', 1, 'transform="rotate(-6 25 -12)"'));
}

function bueroBG() {
  const W = 3100;
  let s = patterns('buero');
  s += R(0, 0, W, FLOOR, '#f4f6f4') + R(0, 0, W, FLOOR, 'url(#p-noise)') + R(0, 0, W, 40, GREY) + R(0, 36, W, 6, ITMX) + R(0, 42, W, 4, '#000', 0, 'opacity=".1"') +
    R(0, FLOOR, W, H - FLOOR, '#a3a9a3') + R(0, FLOOR, W, H - FLOOR, 'url(#buero-tiles)') + R(0, FLOOR, W, H - FLOOR, 'url(#p-noise)') + R(0, FLOOR - 16, W, 18, '#c9cec9') + R(0, FLOOR - 16, W, 3, '#e3e7e3') + finish(W);
  // Deckenleuchten-Panels
  for (let x = 150; x < W; x += 600) s += R(x, 46, 300, 8, '#fff', 3) + R(x, 54, 300, 3, '#d0d4d0');
  // Grüne Schräge als Wandakzent (wie im Logo)
  for (let x = 0; x < W; x += 600) s += P(`M${x} 640 L${x + 600} 610 L${x + 600} 686 L${x} 686Z`, ITMX, 'opacity=".18"');
  // Empfang: Logo-Wand
  s += P('M56 168 L666 112 L666 448 L56 448Z', '#000', 'opacity=".12"') + P('M50 160 L660 104 L660 440 L50 440Z', ITMX) + P('M50 160 L660 104 L660 440 L50 440Z', 'url(#g-volh)') + P('M50 160 L660 104 L660 118 L50 174Z', '#fff', 'opacity=".25"') +
    R(90, 196, 530, 214, '#fff', 18) + R(90, 196, 530, 214, 'url(#g-vol)', 18) + img('icons/itmx-logo.png', 110, 206, 490, 191) + [70, 640].map((x) => C(x, 300, 18, 'url(#g-bulb)', 'opacity=".7"') + C(x, 300, 5, 'url(#g-metal)')).join('');
  s += SH(580, 704, 110, 8) + G(470, 400, R(6, 156, 208, 144, '#e3e7e3', 6) + VOL(6, 156, 208, 144, 6) + R(16, 170, 90, 116, '#d3d8d3', 6) + R(114, 170, 90, 116, '#d3d8d3', 6) + VOL(16, 170, 90, 116, 6) + VOL(114, 170, 90, 116, 6) +
    R(96, 216, 6, 26, 'url(#g-metal)', 3) + R(118, 216, 6, 26, 'url(#g-metal)', 3) + R(0, 140, 220, 16, '#fff', 6) + R(0, 140, 220, 4, '#fff', 3) + R(0, 152, 220, 4, '#000', 0, 'opacity=".1"') +
    [150, 180].map((x) => P(`M${x} 140 v-14 h18 v14z`, '#fff') + P(`M${x + 18} 128 q8 0 6 8 q-2 4 -6 4`, 'none', 'stroke="#ddd" stroke-width="3"')).join(''));
  s += SH(255, 704, 190, 10) + G(80, 520, P('M10 20 L340 20 L340 180 L10 180Z', ITMX) + P('M10 20 L340 20 L340 180 L10 180Z', 'url(#g-volh)') + P('M10 20 L340 20 L340 46 L10 60Z', ITMX_D) + img('icons/itmx-x.png', 140, 76, 70, 76) +
    R(0, 0, 350, 20, '#fff', 8) + R(0, 0, 350, 5, '#fff', 4) + R(0, 16, 350, 4, '#000', 0, 'opacity=".12"') + R(20, 170, 310, 10, '#333', 3));
  s += plant(30, 700, 1.1);
  // Büros mit Fenstern, Schreibtischen, Stühlen
  OFFICES.forEach((d, i) => {
    s += windowSVG(d + 150, 110, 300, 200, '#c9cec9');
    s += slantTag(d + 20, 54, 190, OFFICE_NAMES[i]);
    s += img('icons/itmx-x.png', d + 520, 50, 50, 54);
    s += officeChair(d + 90, i === 1 ? ITMX : GREY) + officeChair(d + 380, i === 1 ? GREY : ITMX);
    s += desk(d + 30) + desk(d + 320);
    s += E(d + 300, 760, 240, 26, '#8d948d') + E(d + 300, 760, 226, 20, 'url(#p-noise)') + E(d + 300, 760, 200, 16, 'none', 'stroke="#b6bcb6" stroke-width="2"');
    s += plant(d + 560, 700, 0.8);
  });
  // Meetingraum
  s += slantTag(2520, 54, 190, 'Meeting');
  [2620, 2740, 2860].forEach((x) => (s += officeChair(x, ITMX)));
  s += plant(3060, 700, 1);
  // Glaswände zwischen den Räumen
  for (const x of [690, 1290, 1890, 2490]) s += R(x, 42, 16, FLOOR - 42, '#bfe3f2', 0, 'opacity=".6"') + R(x, 42, 16, FLOOR - 42, 'url(#g-glass)') + R(x, 42, 16, 10, GREY) + R(x, FLOOR - 12, 16, 12, GREY) + R(x + 4, 120, 3, 300, '#fff', 1, 'opacity=".8"');
  OFFICES.concat([2500]).forEach((x) => (s += hangLamp(x + 300, 50, ITMX)));
  return svgWrap(W, s);
}

function monitorSVG() {
  return svgWrap0(120, 120, R(52, 84, 16, 22, 'url(#g-metal)') + R(30, 104, 60, 14, '#555', 5) + R(30, 104, 60, 4, '#888', 2) + R(0, 0, 120, 84, '#2b2b2b', 8) + R(0, 0, 120, 3, '#555', 2) + R(6, 6, 108, 72, '#0e1116', 4) + R(6, 6, 108, 72, 'url(#g-glass)', 4) + C(60, 81, 1.5, '#50af30') +
    `<g class="tvon">${R(6, 6, 108, 72, '#f4f6f4', 4)}${R(6, 6, 108, 12, ITMX, 4)}${R(14, 26, 60, 6, GREY, 3)}${R(14, 38, 80, 6, ITMX, 3)}${R(14, 50, 46, 6, GREY, 3)}${R(64, 50, 6, 18, '#111', 1, 'class="led"')}
      ${R(84, 46, 8, 22, ITMX)}${R(96, 36, 8, 32, ITMX_D)}${R(6, 6, 108, 72, 'url(#g-glass)', 4)}</g>`);
}

const bueroProps = [
  { id: 'itmxkaffee', kind: 'spawn', x: 510, y: 400, w: 110, h: 140, spawn: ['☕', '☕', '🥛', '🍪'], sound: 'pop', from: [640, 380],
    svg: svgWrap0(110, 140, R(0, 0, 110, 140, GREY, 14) + R(0, 0, 110, 140, 'url(#g-volh)', 14) + R(8, 8, 94, 36, '#333', 8) + R(10, 10, 90, 5, '#fff', 3, 'opacity=".15"') + C(30, 26, 7, ITMX) + C(55, 26, 7, '#fff') + C(80, 26, 7, '#ffca3a') +
      R(38, 52, 34, 16, '#777', 5) + R(22, 122, 66, 9, '#777', 4) + R(50, 68, 10, 20, '#7f5539', 3)) },
  ...OFFICES.flatMap((d, i) => [
    { id: `mon${i}a`, kind: 'toggle', x: d + 120, y: 420, w: 120, h: 120, sound: 'click', svg: monitorSVG() },
    { id: `mon${i}b`, kind: 'toggle', x: d + 410, y: 420, w: 120, h: 120, sound: 'click', svg: monitorSVG() },
  ]),
  { id: 'beamer', kind: 'toggle', x: 2590, y: 160, w: 320, h: 190, sound: 'tv',
    svg: svgWrap0(320, 190, R(6, 8, 320, 180, '#000', 10, 'opacity=".12"') + R(0, 0, 320, 180, '#2b2b2b', 10) + R(8, 8, 304, 164, '#0e1116', 6) + R(8, 8, 304, 164, 'url(#g-glass)', 6) +
      `<g class="tvon">${R(8, 8, 304, 164, '#fff', 6)}${img('icons/itmx-logo.png', 20, 18, 130, 51)}
      ${R(180, 110, 22, 50, ITMX)}${R(210, 90, 22, 70, ITMX_D)}${R(240, 60, 22, 100, ITMX)}${R(270, 30, 22, 130, ITMX_D)}
      ${R(20, 90, 140, 8, GREY, 4)}${R(20, 110, 110, 8, '#bbb', 4)}${R(20, 130, 130, 8, '#bbb', 4)}</g>`) },
  { id: 'drucker', kind: 'spawn', x: 2955, y: 590, w: 120, h: 110, spawn: ['📄', '📄', '📄', '📊'], sound: 'click', from: [3015, 560],
    svg: svgWrap0(120, 110, E(60, 110, 60, 6, 'url(#g-sh)') + R(0, 20, 120, 90, '#e3e7e3', 12) + R(0, 20, 120, 90, 'url(#g-vol)', 12) + R(10, 0, 100, 28, '#c9cec9', 8) + R(10, 0, 100, 28, 'url(#g-vol)', 8) + R(24, -6, 72, 10, '#fff', 2) +
      R(20, 50, 80, 8, '#333', 4) + R(14, 30, 30, 12, '#2b2b2b', 3) + R(18, 33, 22, 6, '#50af30', 2, 'opacity=".7"') + C(100, 80, 6, ITMX) + C(84, 80, 4, '#bbb') + R(16, 92, 88, 6, '#bbb', 3)) },
];

const bueroFG = [
  { x: 2550, y: 556, w: 380, h: 144, svg: svgWrap0(380, 144, E(190, 144, 180, 8, 'url(#g-sh)') + R(0, 0, 380, 18, '#ffffff', 8) + R(0, 0, 380, 18, 'url(#g-vol)', 8) + P('M14 18 L366 18 L366 144 L14 144Z', GREY) + P('M14 18 L366 18 L366 40 L14 54Z', ITMX) + img('icons/itmx-x.png', 166, 66, 48, 52)) },
];

// ======================= FESTIVAL (Tokiland) =======================
const RAINBOW = ['#ff595e', '#ff924c', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93', '#ff6fb5', '#00bbf9'];

function festivalBG() {
  const W = 3000;
  let s = `<defs>
    <linearGradient id="fest-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14062e"/><stop offset=".45" stop-color="#4b1d7a"/><stop offset=".75" stop-color="#b8459a"/><stop offset="1" stop-color="#ff9a6b"/></linearGradient>
    <linearGradient id="fest-ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f6b4a"/><stop offset="1" stop-color="#173d2b"/></linearGradient>
    <linearGradient id="fest-beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <linearGradient id="fest-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3b0"/><stop offset=".5" stop-color="#e9b949"/><stop offset="1" stop-color="#a8741a"/></linearGradient>
    <radialGradient id="fest-face" cx="45%" cy="40%" r="65%"><stop offset="0" stop-color="#fff1d6"/><stop offset="1" stop-color="#f2b880"/></radialGradient>
  </defs>`;
  s += R(0, 0, W, H, 'url(#fest-sky)') + stars(0, 10, W, 360, 70) + C(260, 110, 46, '#fff6d5') + C(276, 98, 40, '#4b1d7a', 'opacity=".25"');
  // Hügel & Bäume am Horizont
  s += P(`M0 600 Q300 520 620 590 T1300 570 T2000 590 T2700 560 T${W} 590 L${W} 700 L0 700Z`, '#2a1350') + P(`M0 640 Q400 590 800 630 T1600 620 T2400 640 T${W} 620 L${W} 700 L0 700Z`, '#3b1a63');
  for (let x = 30; x < W; x += 140) s += P(`M${x} 640 l18 -70 l18 70z`, '#241046');
  // Riesenrad-Stützen (das Rad selbst dreht sich als eigenes Element)
  s += P('M2620 690 L2700 330 L2780 690', 'none', 'stroke="#d9d2e9" stroke-width="14" stroke-linejoin="round"') + R(2600, 680, 200, 14, '#bdb3d6', 6);
  // Boden
  s += R(0, FLOOR - 30, W, H - FLOOR + 30, 'url(#fest-ground)') + R(0, FLOOR, W, H - FLOOR, '#24543b') + R(0, FLOOR, W, H - FLOOR, 'url(#p-noise)') + R(0, FLOOR, W, 10, '#000', 0, 'opacity=".2"');
  for (let x = 6; x < W; x += 19) s += P(`M${x} ${FLOOR + 18 + (x % 4) * 10} l3 -9 l3 9`, 'none', 'stroke="#3f8a5f" stroke-width="2" opacity=".6"');
  // Wimpelketten
  for (const [x1, x2] of [[40, 620], [1980, 2560], [2560, 2990]]) {
    s += P(`M${x1} 150 Q${(x1 + x2) / 2} 220 ${x2} 150`, 'none', 'stroke="#ddd" stroke-width="2"');
    for (let k = 1; k < 12; k++) {
      const t = k / 12, x = x1 + (x2 - x1) * t, y = 150 + Math.sin(t * Math.PI) * 52;
      s += P(`M${x - 11} ${y} L${x + 11} ${y} L${x} ${y + 24}Z`, RAINBOW[k % RAINBOW.length]);
    }
  }
  // ---------- Eingangstor ----------
  const tower = (x) => G(x, 230, R(0, 0, 70, 470, '#7b2cbf', 8) + R(0, 0, 70, 470, 'url(#g-volh)', 8) + [60, 160, 260, 360].map((y) => R(18, y, 34, 50, '#ffe08a', 17, 'class="cwin"')).join('') +
    P('M-14 4 L35 -80 L84 4Z', '#ff6fb5') + P('M-14 4 L35 -80 L84 4Z', 'url(#g-volh)') + R(33, -122, 4, 44, '#ddd') + P('M37 -122 L74 -110 L37 -98Z', '#ffca3a'));
  s += tower(60) + tower(400);
  s += P('M130 300 Q265 150 400 300 L400 340 Q265 200 130 340Z', 'url(#fest-gold)');
  for (let k = 0; k <= 14; k++) { const t = k / 14, x = 130 + 270 * t, y = 300 - Math.sin(t * Math.PI) * 140; s += C(x, y + 6, 5, RAINBOW[k % RAINBOW.length]) + C(x, y + 6, 12, RAINBOW[k % RAINBOW.length], 'opacity=".3"'); }
  s += G(110, 330, R(0, 0, 310, 70, '#14062e', 18) + R(4, 4, 302, 62, 'none', 15, 'stroke="url(#fest-gold)" stroke-width="4"') + [...'TOKILAND'].map((ch, i) => T(32 + i * 35, 50, 40, RAINBOW[i % RAINBOW.length], ch, 'stroke="#fff" stroke-width="1.5" paint-order="stroke"')).join(''));
  // ---------- Hauptbühne ----------
  // Lautsprecher-Türme
  const speaker = (x) => G(x, 250, R(0, 0, 80, 450, '#1c1c24', 6) + R(0, 0, 80, 450, 'url(#g-volh)', 6) +
    [0, 1, 2, 3, 4].map((i) => C(40, 50 + i * 86, 28, '#2e2e3a') + C(40, 50 + i * 86, 20, '#111') + C(40, 50 + i * 86, 8, '#444') + C(36, 46 + i * 86, 4, '#777')).join(''));
  s += speaker(620) + speaker(1900);
  // Märchen-Fassade
  s += P('M720 520 L720 250 Q760 140 820 180 Q900 40 1050 120 Q1150 10 1300 40 Q1450 10 1550 120 Q1700 40 1780 180 Q1840 140 1880 250 L1880 520Z', '#2b1356');
  s += P('M720 520 L720 250 Q760 140 820 180 Q900 40 1050 120 Q1150 10 1300 40 Q1450 10 1550 120 Q1700 40 1780 180 Q1840 140 1880 250 L1880 520Z', 'url(#g-vol)');
  // Seitentürme
  const ftower = (x, c) => G(x, 120, R(0, 60, 140, 340, c, 10) + R(0, 60, 140, 340, 'url(#g-volh)', 10) + P('M-16 70 L70 -60 L156 70Z', '#ff6fb5') + P('M-16 70 L70 -60 L156 70Z', 'url(#g-volh)') +
    C(70, -64, 10, '#ffca3a') + R(20, 170, 100, 170, '#000', 8) + R(24, 174, 92, 162, '#ff6fb5', 6, 'class="ledscr"') + R(24, 174, 92, 162, 'url(#g-glass)', 6) +
    [96, 130].map((y) => C(70, y, 14, '#ffe08a', 'class="cwin"')).join('') + P('M10 400 q20 -40 40 0 q20 -40 40 0 q20 -40 40 0', '#8ac926'));
  s += ftower(760, '#6a3fb5') + ftower(1700, '#6a3fb5');
  // Blütenkranz + großes Märchengesicht
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2;
    s += `<ellipse cx="${1300 + Math.cos(a) * 205}" cy="${270 + Math.sin(a) * 205}" rx="52" ry="26" fill="${RAINBOW[k % RAINBOW.length]}" transform="rotate(${(a * 180) / Math.PI} ${1300 + Math.cos(a) * 205} ${270 + Math.sin(a) * 205})"/>`;
  }
  s += C(1300, 270, 186, 'url(#fest-gold)') + C(1300, 270, 170, 'url(#fest-face)') +
    `<g class="festeyes">${E(1238, 236, 30, 36, '#fff')}${E(1362, 236, 30, 36, '#fff')}${C(1244, 244, 17, '#4b1d7a')}${C(1368, 244, 17, '#4b1d7a')}${C(1250, 236, 6, '#fff')}${C(1374, 236, 6, '#fff')}</g>` +
    P('M1200 196 q38 -22 70 -4 M1330 192 q32 -18 70 4', 'none', 'stroke="#7a3b1f" stroke-width="7" stroke-linecap="round"') +
    E(1218, 300, 26, 14, '#ff8fab', 'opacity=".6"') + E(1382, 300, 26, 14, '#ff8fab', 'opacity=".6"') + P('M1240 318 Q1300 380 1360 318 Q1300 340 1240 318Z', '#8c2f39') + P('M1262 338 q38 18 76 0', '#ff8fa0');
  // Traverse mit Scheinwerfern (Strahlen bewegen sich per CSS)
  s += R(690, 66, 1220, 18, '#8a8f99') + Array.from({ length: 60 }, (_, i) => P(`M${692 + i * 20} 66 l10 18 l10 -18`, 'none', 'stroke="#5d626b" stroke-width="2"')).join('') + R(690, 66, 1220, 3, '#c9ced6');
  s += `<g class="beams">${[760, 900, 1040, 1180, 1420, 1560, 1700, 1840].map((x, i) => `<g class="beam b${i % 4}" style="transform-origin:${x}px 90px">${P(`M${x - 8} 92 L${x + 8} 92 L${x + 120} 700 L${x - 120} 700Z`, 'url(#fest-beam)', `opacity=".22" style="fill:url(#fest-beam)"`)}</g>`).join('')}</g>`;
  s += [760, 900, 1040, 1180, 1420, 1560, 1700, 1840].map((x, i) => R(x - 14, 82, 28, 22, '#2b2b33', 5) + E(x, 104, 11, 5, RAINBOW[i])).join('');
  // Laser (nur bei Musik sichtbar)
  s += `<g class="lasers">${[-60, -40, -20, 0, 20, 40, 60].map((a) => `<g class="laser" style="transform-origin:1300px 440px;--a:${a}deg"><path d="M1300 440 L1300 -200" stroke="${a % 40 ? '#39ff14' : '#ff2bd6'}" stroke-width="4" opacity=".85"/></g>`).join('')}</g>`;
  // Bühnenboden
  s += R(700, 520, 1200, 180, '#1a1030') + R(700, 520, 1200, 10, '#3a2a60') + R(700, 524, 1200, 2, '#fff', 0, 'opacity=".2"') +
    `<g class="stagelights">${Array.from({ length: 24 }, (_, i) => R(716 + i * 49.5, 560, 34, 12, RAINBOW[i % RAINBOW.length], 6)).join('')}</g>` + R(700, 600, 1200, 100, 'url(#g-vol)') + T(1300, 660, 42, '#ffe08a', '✦ TOKILAND MAINSTAGE ✦', 'opacity=".9"');
  // ---------- Waldbühne ----------
  s += G(2080, 0, P('M0 560 L0 330 Q200 170 400 330 L400 560Z', '#1f5a3b') + P('M0 560 L0 330 Q200 170 400 330 L400 560Z', 'url(#g-vol)') +
    P('M-30 340 Q200 120 430 340 Q380 300 330 330 Q280 290 230 320 Q200 280 170 320 Q120 290 70 330 Q20 300 -30 340Z', '#c0392b') + Array.from({ length: 9 }, (_, i) => C(40 + i * 40, 270 + Math.abs(4 - i) * 12, 7, '#fff', 'opacity=".85"')).join('') +
    T(200, 300, 30, '#fff', 'WALDBÜHNE') + R(20, 560, 360, 140, '#3d2a1a') + R(20, 560, 360, 140, 'url(#p-grain)') + R(20, 560, 360, 8, '#6b4a2a') +
    `<g class="stagelights">${Array.from({ length: 8 }, (_, i) => R(36 + i * 43, 590, 28, 10, RAINBOW[(i + 3) % 8], 5)).join('')}</g>` +
    [60, 340].map((x) => `<g transform="translate(${x} 360)">${R(-4, 0, 8, 200, '#5b3a1f')}${C(0, -10, 34, '#2d8a55')}${C(-14, 4, 22, '#40b073')}${C(10, -24, 6, '#ffca3a')}</g>`).join(''));
  // Foodtruck-Schild & Flaggenmasten
  for (const x of [560, 2010, 2500]) s += R(x - 3, 220, 6, 480, '#ccc') + P(`M${x + 3} 222 L${x + 70} 244 L${x + 3} 266Z`, RAINBOW[x % 7]);
  return svgWrap(W, s);
}

const festivalProps = [
  { id: 'riesenrad', kind: 'deco', x: 2480, y: 110, w: 440, h: 440,
    svg: svgWrap0(440, 440, `<g class="wheel">${C(220, 220, 210, 'none', 'stroke="#efe7ff" stroke-width="10"')}${C(220, 220, 150, 'none', 'stroke="#d9cdf2" stroke-width="5"')}` +
      Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; const x = 220 + Math.cos(a) * 210, y = 220 + Math.sin(a) * 210; return P(`M220 220 L${x} ${y}`, 'none', 'stroke="#d9cdf2" stroke-width="4"') + C(x, y, 18, RAINBOW[i % 8]) + C(x, y, 9, '#fff8c4') + C(220 + Math.cos(a) * 150, 220 + Math.sin(a) * 150, 5, '#fff8c4'); }).join('') +
      `</g>${C(220, 220, 24, '#efe7ff')}${C(220, 220, 10, '#7b2cbf')}`) },
  { id: 'djpult', kind: 'dj', x: 1170, y: 418, w: 260, h: 50,
    svg: svgWrap0(260, 50, R(0, 20, 260, 30, '#2b2b33', 6) + R(0, 20, 260, 6, '#555', 3) + C(52, 18, 34, '#111') + C(208, 18, 34, '#111') +
      `<g class="spin">${C(52, 18, 30, '#1b1b1b')}${C(52, 18, 22, 'none', 'stroke="#333" stroke-width="2"')}${C(52, 18, 10, '#ff6fb5')}</g><g class="spin">${C(208, 18, 30, '#1b1b1b')}${C(208, 18, 22, 'none', 'stroke="#333" stroke-width="2"')}${C(208, 18, 10, '#2ec4b6')}</g>` +
      R(100, 0, 60, 30, '#3a3a46', 4) + [110, 125, 140].map((x) => R(x, 6, 6, 18, '#7cffb2', 2, 'class="led"')).join('') + T(130, 46, 12, '#fff', 'TIPP MICH!', 'class="djtip"')) },
  { id: 'djpult2', kind: 'dj', x: 2190, y: 506, w: 180, h: 54,
    svg: svgWrap0(180, 54, R(0, 24, 180, 30, '#2b2b33', 6) + C(42, 22, 26, '#111') + C(138, 22, 26, '#111') + `<g class="spin">${C(42, 22, 22, '#1b1b1b')}${C(42, 22, 8, '#ffca3a')}</g><g class="spin">${C(138, 22, 22, '#1b1b1b')}${C(138, 22, 8, '#8ac926')}</g>` +
      R(70, 4, 40, 28, '#3a3a46', 4) + R(78, 10, 5, 14, '#7cffb2', 2, 'class="led"') + R(90, 10, 5, 14, '#7cffb2', 2, 'class="led"')) },
  { id: 'pyroL', kind: 'deco', x: 700, y: 430, w: 60, h: 90, svg: svgWrap0(60, 90, R(10, 60, 40, 30, '#333', 4) + `<g class="flames">${P('M30 60 Q4 30 22 -20 Q30 10 34 -40 Q60 10 30 60Z', '#ff9f1c')}${P('M30 60 Q16 34 28 0 Q34 20 38 -6 Q50 30 30 60Z', '#ffd60a')}</g>`) },
  { id: 'pyroR', kind: 'deco', x: 1840, y: 430, w: 60, h: 90, svg: svgWrap0(60, 90, R(10, 60, 40, 30, '#333', 4) + `<g class="flames">${P('M30 60 Q4 30 22 -20 Q30 10 34 -40 Q60 10 30 60Z', '#ff9f1c')}${P('M30 60 Q16 34 28 0 Q34 20 38 -6 Q50 30 30 60Z', '#ffd60a')}</g>`) },
  { id: 'foodtruck', kind: 'spawn', x: 2620, y: 470, w: 300, h: 230, spawn: ['🍟', '🍕', '🌭', '🥤', '🍦', '🧃'], sound: 'pop', from: [2700, 470],
    svg: svgWrap0(300, 230, E(150, 230, 150, 8, 'url(#g-sh)') + R(0, 30, 300, 170, '#ffca3a', 16) + R(0, 30, 300, 170, 'url(#g-vol)', 16) + R(30, 70, 170, 70, '#2b1356', 6) + R(30, 70, 170, 70, 'url(#g-glass)', 6) +
      Array.from({ length: 10 }, (_, i) => P(`M${i * 30} 30 h30 l-4 20 q-11 8 -22 0z`, i % 2 ? '#fff' : '#ff595e')).join('') + R(20, 136, 190, 10, '#e9a93a', 3) +
      T(115, 24, 26, '#ff595e', 'SNACKS', 'stroke="#fff" stroke-width="3" paint-order="stroke"') + R(220, 70, 60, 120, '#e9a93a', 8) + C(250, 130, 4, '#555') +
      `<text x="50" y="118" font-size="30">🍟🌭🥤</text>` + C(60, 205, 24, '#2b2b2b') + C(240, 205, 24, '#2b2b2b') + C(60, 205, 9, 'url(#g-metal)') + C(240, 205, 9, 'url(#g-metal)')) },
  { id: 'konfettikanone', kind: 'confetti', x: 2000, y: 600, w: 70, h: 100,
    svg: svgWrap0(70, 100, R(20, 60, 30, 40, '#444', 4) + `<g transform="rotate(-25 35 60)">${R(22, 0, 26, 66, '#ff6fb5', 8)}${R(22, 0, 26, 66, 'url(#g-volh)', 8)}${R(18, 0, 34, 10, '#ffca3a', 4)}</g>`) },
];

const festivalFG = [
  { x: 1170, y: 440, w: 260, h: 80, prop: 'djpult', svg: svgWrap0(260, 80, R(0, 0, 260, 80, '#1c1c24', 6) + R(0, 0, 260, 80, 'url(#g-vol)', 6) + R(0, 0, 260, 5, '#ff6fb5', 2) +
    T(130, 42, 26, '#ff6fb5', 'DJ') + T(130, 62, 13, '#fff', '👆 TIPP MICH', 'class="djtip"') + R(20, 68, 220, 6, '#2ec4b6', 3, 'class="led"')) },
  { x: 2190, y: 530, w: 180, h: 30, prop: 'djpult2', svg: svgWrap0(180, 30, R(0, 0, 180, 30, '#1c1c24', 5) + R(0, 0, 180, 4, '#ffca3a', 2)) },
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
      { x1: 1860, x2: 2240, y: 604 }, { x1: 2470, x2: 2640, y: 560 }, { x1: 2310, x2: 2420, y: 612 },
      { x1: 2780, x2: 2930, y: 590 }, { x1: 2930, x2: 3180, y: 552 }, { x1: 3215, x2: 3305, y: 600 },
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
      { x1: 100, x2: 230, y: 380 }, { x1: 610, x2: 990, y: 604 }, { x1: 1090, x2: 1330, y: 560 },
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
    id: 'schule', name: 'Heylinschule', short: 'Schule', icon: '🏫', W: 2400, ceil: 120, bg: schuleBG(), props: schuleProps, fg: schuleFG,
    glows: [{ x: 350, y: 120, r: 280 }, { x: 1100, y: 130, r: 300 }, { x: 1700, y: 130, r: 300 }],
    surfaces: [
      { x1: 50, x2: 450, y: 306 },
      { x1: 760, x2: 1020, y: 560 }, ...SDESKS.map((x) => ({ x1: x, x2: x + 240, y: 560 })),
    ],
    seats: [
      { id: 'schule:lehrer', x: 890, y: 600, pose: 'sit' },
      ...SDESKS.flatMap((x, i) => [{ id: `schule:${i}a`, x: x + 60, y: 600, pose: 'sit' }, { id: `schule:${i}b`, x: x + 180, y: 600, pose: 'sit' }]),
    ],
    zones: [{ kind: 'learn', seats: SDESKS.flatMap((x, i) => [`schule:${i}a`, `schule:${i}b`]) }],
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
    id: 'festival', name: 'Festival', icon: '🎡', W: 3000, ceil: 90, dusk: true, outdoor: true, bg: festivalBG(), props: festivalProps, fg: festivalFG,
    glows: [{ x: 265, y: 230, r: 260 }, { x: 1300, y: 270, r: 380 }, { x: 830, y: 330, r: 200 }, { x: 1770, y: 330, r: 200 }, { x: 2280, y: 420, r: 220 }, { x: 2700, y: 330, r: 300 }, { x: 2760, y: 560, r: 200 }],
    surfaces: [
      { x1: 700, x2: 1170, y: 520 }, { x1: 1430, x2: 1900, y: 520 }, { x1: 1170, x2: 1430, y: 520 },
      { x1: 620, x2: 700, y: 250 }, { x1: 1900, x2: 1980, y: 250 }, { x1: 2100, x2: 2460, y: 560 }, { x1: 2640, x2: 2830, y: 606 },
    ],
    seats: [],
    zones: [],
  },
  {
    id: 'park', name: 'Park', icon: '🌳', W: 2600, ceil: 110, outdoor: true, bg: parkBG(), props: parkProps, fg: parkFG,
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
  o.push(it('haus', '🦆', 1930, 604), it('haus', '🧼', 2510, 560), it('haus', '🪥', 2600, 560), it('haus', '🧻', 2460, 700));
  // Schlafzimmer
  o.push(it('haus', '🧸', 3100, 552), it('haus', '⏰', 3250, 600), it('haus', '🎁', 3150, 700));
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
  o.push(it('bad', '🧴', 130, 380), it('bad', '🧼', 190, 380), it('bad', '🦆', 700, 604), it('bad', '🦆', 900, 604), it('bad', '🪥', 1130, 560), it('bad', '🧼', 1290, 560));
  o.push(it('bad', '💩', 1555, 612), it('bad', '💩', 1825, 612), it('bad', '🧻', 1540, 520), it('bad', '🧻', 1825, 520), it('bad', '💩', 2000, 700), it('bad', '🧻', 1460, 700));
  // Heylinschule
  o.push(it('schule', '🎒', 90, 700), it('schule', '🎒', 170, 700), it('schule', '🎒', 250, 306), it('schule', '🧢', 330, 306), it('schule', '⚽', 420, 700));
  o.push(it('schule', '🍎', 800, 560), it('schule', '📚', 960, 560), it('schule', '🌍', 1000, 700), it('schule', '🧮', 2340, 700));
  SDESKS.forEach((x, i) => {
    o.push(it('schule', ['✏️', '📓', '🖍️', '📏'][i], x + 30, 560), it('schule', ['📖', '✏️', '📐', '📓'][i], x + 120, 560), it('schule', ['🖍️', '🍌', '✏️', '🍪'][i], x + 210, 560));
  });
  // itmX Büro
  o.push(it('buero', '🔔', 140, 520), it('buero', '📄', 220, 520), it('buero', '🖊️', 300, 520), it('buero', '🪴', 390, 520), it('buero', '☕', 560, 540), it('buero', '☕', 670, 540));
  OFFICES.forEach((d, i) => {
    o.push(it('buero', ['📁', '🎧', '📎'][i], d + 60, 540), it('buero', ['☕', '📱', '📄'][i], d + 345, 540), it('buero', ['📎', '☕', '🖊️'][i], d + 520, 540));
  });
  o.push(it('buero', '💻', 2650, 556), it('buero', '📊', 2760, 556), it('buero', '☕', 2850, 556), it('buero', '🪴', 2470, 700));
  // Festival
  o.push(it('festival', '🥤', 960, 700), it('festival', '🎈', 1500, 140), it('festival', '🎈', 1060, 160), it('festival', '🕶️', 1650, 700), it('festival', '🍟', 2400, 560), it('festival', '🧢', 300, 700), it('festival', '🎧', 760, 520), it('festival', '🪩', 1840, 520));
  // Figuren
  o.push(ch('haus', 280, 596, { skin: '#f8c9a0', hair: 'zoepfe', hc: '#c8501e', style: 'kleid', shirt: '#ff6fb5', pants: '#1982c4', shoes: '#ff595e', hat: '', glasses: '' }, 'haus:sofa2'));
  o.push(ch('haus', 1060, 700, { skin: '#8a5530', hair: 'afro', hc: '#111111', style: 'tshirt', shirt: '#ffca3a', pants: '#1982c4', shoes: '#333333', hat: '', glasses: 'rund' }));
  o.push(ch('cafe', 415, 602, { skin: '#ffe3cf', hair: 'kurz', hc: '#f2c94c', style: 'streifen', shirt: '#8ac926', pants: '#6a4c93', shoes: '#ffffff', hat: 'cap', glasses: '' }, 'cafe:s2'));
  o.push(ch('friseur', 240, 572, { skin: '#b97a4a', hair: 'lang', hc: '#3b2416', style: 'tshirt', shirt: '#ff924c', pants: '#00bbf9', shoes: '#ff6fb5', hat: '', glasses: '' }, 'friseur:s1'));
  o.push(ch('park', 1905, 612, { skin: '#e0a46e', hair: 'irokese', hc: '#9b5de5', style: 'pulli', shirt: '#00bbf9', pants: '#333333', shoes: '#ffca3a', hat: '', glasses: 'sonne' }, 'park:bank1'));
  o.push(ch('bad', 300, 700, { skin: '#ffe3cf', hair: 'pony', hc: '#4f8cff', style: 'streifen', shirt: '#2ec4b6', pants: '#ffca3a', shoes: '#ff595e', hat: '', glasses: '' }));
  o.push(ch('schule', 890, 600, { skin: '#f8c9a0', hair: 'dutt', hc: '#9b5de5', style: 'kleid', shirt: '#22c55e', pants: '#ffffff', shoes: '#333333', hat: '', glasses: 'rund' }, 'schule:lehrer'));
  o.push(ch('schule', 1160, 600, { skin: '#ffe3cf', hair: 'zoepfe', hc: '#f2c94c', style: 'tshirt', shirt: '#ff6fb5', pants: '#1982c4', shoes: '#ffffff', hat: '', glasses: '' }, 'schule:0a'));
  o.push(ch('schule', 1580, 600, { skin: '#8a5530', hair: 'kurz', hc: '#111111', style: 'streifen', shirt: '#ff924c', pants: '#333333', shoes: '#ff595e', hat: 'cap', glasses: '' }, 'schule:1b'));
  o.push(ch('schule', 1760, 600, { skin: '#e0a46e', hair: 'afro', hc: '#c8501e', style: 'pulli', shirt: '#8ac926', pants: '#6a4c93', shoes: '#ffca3a', hat: '', glasses: '' }, 'schule:2a'));
  o.push(ch('schule', 2180, 600, { skin: '#ffe3cf', hair: 'pony', hc: '#3b2416', style: 'kleid', shirt: '#00bbf9', pants: '#ffffff', shoes: '#ff6fb5', hat: 'schleife', glasses: '' }, 'schule:3b'));
  o.push(ch('buero', 790, 592, { skin: '#f8c9a0', hair: 'kurz', hc: '#3b2416', style: 'pulli', shirt: '#50af30', pants: '#333333', shoes: '#333333', hat: '', glasses: 'rund' }, 'buero:0a'));
  o.push(ch('buero', 1680, 592, { skin: '#b97a4a', hair: 'dutt', hc: '#111111', style: 'tshirt', shirt: '#ffffff', pants: '#1982c4', shoes: '#50af30', hat: '', glasses: '' }, 'buero:1b'));
  o.push(ch('buero', 1990, 592, { skin: '#ffe3cf', hair: 'lang', hc: '#f2c94c', style: 'streifen', shirt: '#575757', pants: '#6a4c93', shoes: '#ffffff', hat: '', glasses: 'rund' }, 'buero:2a'));
  o.push(ch('buero', 400, 700, { skin: '#e0a46e', hair: 'pony', hc: '#c8501e', style: 'kleid', shirt: '#50af30', pants: '#ffffff', shoes: '#575757', hat: '', glasses: '' }));
  o.push(ch('festival', 1300, 520, { skin: '#e0a46e', hair: 'irokese', hc: '#ff7eb6', style: 'streifen', shirt: '#333333', pants: '#333333', shoes: '#ff595e', hat: '', glasses: 'sonne', eyes: '#5a3a22' }));
  o.push(ch('festival', 900, 700, { skin: '#ffe3cf', hair: 'zoepfe', hc: '#f2c94c', style: 'kleid', shirt: '#ff6fb5', pants: '#ffffff', shoes: '#ffffff', hat: 'krone', glasses: '', eyes: '#2f6db5' }));
  o.push(ch('festival', 1080, 700, { skin: '#8a5530', hair: 'afro', hc: '#9b5de5', style: 'tshirt', shirt: '#00bbf9', pants: '#1982c4', shoes: '#ffca3a', hat: '', glasses: '', eyes: '#5a3a22' }));
  o.push(ch('festival', 1560, 700, { skin: '#f8c9a0', hair: 'kurz', hc: '#c8501e', style: 'pulli', shirt: '#8ac926', pants: '#333333', shoes: '#ffffff', hat: 'cap', glasses: '', eyes: '#3c7a3a' }));
  o.push(ch('festival', 1740, 700, { skin: '#b97a4a', hair: 'lang', hc: '#111111', style: 'kleid', shirt: '#ffca3a', pants: '#ffffff', shoes: '#ff6fb5', hat: 'schleife', glasses: '', eyes: '#8a5a2b' }));
  o.push(ch('park', 700, 700, { skin: '#ffc4d6', hair: 'dutt', hc: '#ff7eb6', style: 'kleid', shirt: '#ffca3a', pants: '#ffffff', shoes: '#9b5de5', hat: 'schleife', glasses: '' }));
  return o;
}
