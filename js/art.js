// Figuren-Zeichnung (SVG) und Katalog aller Gegenstände.

export const SKINS = ['#ffe3cf', '#f8c9a0', '#e0a46e', '#b97a4a', '#8a5530', '#5e3a22', '#ffc4d6', '#bdf0a4', '#b8d8ff'];
export const HAIR_STYLES = [
  ['kurz', 'Kurz'], ['lang', 'Lang'], ['zoepfe', 'Zöpfe'], ['afro', 'Locken'],
  ['dutt', 'Dutt'], ['irokese', 'Irokese'], ['pony', 'Pony'], ['glatze', 'Glatze'],
];
export const HAIR_COLORS = ['#3b2416', '#111111', '#f2c94c', '#c8501e', '#ff7eb6', '#4f8cff', '#9b5de5', '#2ec4b6', '#eeeeee'];
export const CLOTH_COLORS = ['#ff595e', '#ff924c', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93', '#ff6fb5', '#00bbf9', '#ffffff', '#333333'];
export const SHIRT_STYLES = [['tshirt', 'T-Shirt'], ['streifen', 'Streifen'], ['pulli', 'Pulli'], ['kleid', 'Kleid']];
export const HATS = [['', 'Kein Hut'], ['cap', 'Kappe'], ['krone', 'Krone'], ['schleife', 'Schleife'], ['zylinder', 'Zylinder'], ['sonnenhut', 'Sonnenhut']];
export const GLASSES = [['', 'Keine'], ['rund', 'Brille'], ['sonne', 'Sonnenbrille']];

const pick = (a) => a[Math.floor(Math.random() * a.length)];

export function randomLook() {
  return {
    skin: pick(SKINS),
    hair: pick(HAIR_STYLES)[0],
    hc: pick(HAIR_COLORS),
    style: pick(SHIRT_STYLES)[0],
    shirt: pick(CLOTH_COLORS),
    pants: pick(CLOTH_COLORS),
    shoes: pick(CLOTH_COLORS),
    hat: Math.random() < 0.3 ? pick(HATS.slice(1))[0] : '',
    glasses: Math.random() < 0.2 ? pick(GLASSES.slice(1))[0] : '',
    eyes: pick(['#5a3a22', '#2f6db5', '#3c7a3a', '#7a8a99', '#8a5a2b', '#6a4c93']),
  };
}

export function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const t = amt < 0 ? 0 : 255;
  const p = Math.abs(amt);
  r = Math.round((t - r) * p + r);
  g = Math.round((t - g) * p + g);
  b = Math.round((t - b) * p + b);
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

let uid = 0;

function hairBack(L, g) {
  const c = `url(#${g}h)`;
  const d = shade(L.hc, -0.3);
  switch (L.hair) {
    case 'lang':
      return `<path d="M10 56 Q2 132 22 150 L98 150 Q118 132 110 56 Z" fill="${c}"/>
        <path d="M18 70 Q14 112 26 142 M102 70 Q106 112 94 142 M30 84 Q28 116 36 146 M90 84 Q92 116 84 146" stroke="${d}" stroke-width="2.5" fill="none" opacity=".55"/>`;
    case 'pony':
      return `<path d="M12 56 Q8 106 24 116 L96 116 Q112 106 108 56 Z" fill="${c}"/>
        <path d="M20 74 Q18 100 28 112 M100 74 Q102 100 92 112" stroke="${d}" stroke-width="2.5" fill="none" opacity=".55"/>`;
    case 'afro':
      return `<circle cx="60" cy="52" r="62" fill="${c}"/>` +
        [[14, 30], [30, 8], [60, -2], [90, 8], [106, 30], [118, 62], [2, 62], [10, 92], [110, 92]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="14" fill="${L.hc}"/>`).join('') +
        [[24, 40], [50, 14], [84, 20], [100, 56], [16, 76]].map(([x, y]) => `<path d="M${x} ${y} q6 -6 12 0" stroke="${d}" stroke-width="2.4" fill="none" opacity=".6"/>`).join('');
    default: return '';
  }
}

function hairFront(L, g) {
  const c = `url(#${g}h)`;
  const d = shade(L.hc, -0.3);
  const hi = shade(L.hc, 0.4);
  const hiStroke = (dd) => `<path d="${dd}" stroke="${hi}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>`;
  switch (L.hair) {
    case 'kurz':
      return `<path d="M13 60 Q10 12 60 11 Q110 12 107 60 Q102 40 86 33 Q72 44 52 36 Q34 34 22 46 Q16 52 13 60Z" fill="${c}"/>
        <path d="M86 33 Q74 40 60 37 M52 36 Q40 36 28 44" stroke="${d}" stroke-width="2" fill="none" opacity=".6"/>` + hiStroke('M30 26 Q50 14 74 18 M80 20 Q96 26 100 40');
    case 'pony':
      return `<path d="M13 62 Q10 11 60 11 Q110 11 107 62 L101 46 Q60 54 19 46Z" fill="${c}"/>
        <path d="M30 48 L32 38 M44 50 L45 38 M58 51 L58 38 M72 50 L71 38 M86 48 L84 38" stroke="${d}" stroke-width="2" opacity=".55"/>` + hiStroke('M28 26 Q52 14 80 18');
    case 'lang':
      return `<path d="M13 64 Q8 11 62 11 Q112 13 107 64 Q99 36 72 29 Q50 46 21 53 Z" fill="${c}"/>
        <path d="M72 29 Q64 42 44 48" stroke="${d}" stroke-width="2" fill="none" opacity=".6"/>` + hiStroke('M26 30 Q46 16 70 18 M22 42 Q40 28 60 27 M78 22 Q96 28 102 46');
    case 'zoepfe': {
      const braid = (x) => [70, 86, 102, 116].map((y, i) => `<ellipse cx="${x}" cy="${y}" rx="${13 - i * 1.5}" ry="10" fill="${c}"/><path d="M${x - 8} ${y - 2} q8 6 16 0" stroke="${d}" stroke-width="2" fill="none" opacity=".6"/>`).join('');
      return `${braid(7)}${braid(113)}
        <circle cx="7" cy="126" r="5" fill="${L.hc}"/><circle cx="113" cy="126" r="5" fill="${L.hc}"/>
        <rect x="1" y="118" width="12" height="6" rx="3" fill="#ff595e"/><rect x="107" y="118" width="12" height="6" rx="3" fill="#ff595e"/>
        <path d="M14 60 Q12 11 60 11 Q108 11 106 60 Q96 30 60 28 Q24 30 14 60Z" fill="${c}"/>
        <path d="M60 12 L60 29" stroke="${d}" stroke-width="3"/>` + hiStroke('M30 26 Q42 16 56 15 M66 15 Q80 16 92 26');
    }
    case 'afro':
      return [[22, 40, 17], [40, 24, 19], [60, 19, 19], [80, 24, 19], [98, 40, 17]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`).join('') +
        [[34, 20], [58, 12], [80, 18]].map(([x, y]) => `<path d="M${x} ${y} q6 -5 12 0" stroke="${hi}" stroke-width="2.5" fill="none" opacity=".6"/>`).join('');
    case 'dutt':
      return `<circle cx="60" cy="4" r="18" fill="${c}"/><path d="M48 0 q12 -10 24 0 M50 10 q10 6 20 0" stroke="${d}" stroke-width="2" fill="none" opacity=".6"/>
        <rect x="44" y="14" width="32" height="6" rx="3" fill="#ff6fb5"/>
        <path d="M14 60 Q12 12 60 12 Q108 12 106 60 Q96 34 60 30 Q24 34 14 60Z" fill="${c}"/>` + hiStroke('M28 30 Q44 20 58 20 M66 20 Q84 22 94 32');
    case 'irokese':
      return `<path d="M42 24 L46 -14 L54 16 L60 -20 L66 16 L74 -14 L78 24 Q60 16 42 24Z" fill="${c}"/>
        <path d="M48 16 L47 0 M60 14 L60 -6 M72 16 L73 0" stroke="${hi}" stroke-width="2" opacity=".6"/>
        <path d="M18 50 Q24 30 42 22 M102 50 Q96 30 78 22" stroke="${d}" stroke-width="5" fill="none" opacity=".25" stroke-linecap="round"/>`;
    case 'glatze':
      return `<ellipse cx="42" cy="26" rx="13" ry="7" fill="#fff" opacity=".35"/><ellipse cx="50" cy="20" rx="5" ry="3" fill="#fff" opacity=".4"/>`;
    default: return '';
  }
}

function hat(L) {
  switch (L.hat) {
    case 'cap':
      return `<path d="M15 46 Q15 4 60 4 Q105 4 105 46 Z" fill="#ff595e"/><path d="M15 46 Q15 4 60 4 Q30 10 26 46Z" fill="#fff" opacity=".18"/>
        <path d="M60 5 L60 45 M38 10 Q34 26 34 46 M82 10 Q86 26 86 46" stroke="#c1121f" stroke-width="1.6" fill="none" opacity=".7"/>
        <path d="M58 40 Q100 32 126 46 Q100 52 58 47Z" fill="#c1121f"/><path d="M62 44 Q100 38 122 46" stroke="#ff8a8f" stroke-width="2" fill="none"/>
        <circle cx="60" cy="6" r="5" fill="#c1121f"/><circle cx="45" cy="26" r="2" fill="#c1121f"/><circle cx="75" cy="26" r="2" fill="#c1121f"/>`;
    case 'krone':
      return `<path d="M24 34 L22 2 L38 18 L50 -6 L60 14 L70 -6 L82 18 L98 2 L96 34 Z" fill="#ffcc33" stroke="#d99a00" stroke-width="3" stroke-linejoin="round"/>
        <path d="M27 30 L26 10 L36 22 L50 4 L52 12 Z" fill="#fff6c2" opacity=".6"/><rect x="24" y="28" width="72" height="7" fill="#e0a800"/>
        <circle cx="42" cy="24" r="4.5" fill="#e63946"/><circle cx="60" cy="22" r="5.5" fill="#1982c4"/><circle cx="78" cy="24" r="4.5" fill="#2a9d8f"/>
        <circle cx="41" cy="23" r="1.5" fill="#fff"/><circle cx="59" cy="20" r="2" fill="#fff"/><circle cx="77" cy="23" r="1.5" fill="#fff"/>
        <circle cx="22" cy="2" r="3.5" fill="#fff6c2"/><circle cx="50" cy="-6" r="3.5" fill="#fff6c2"/><circle cx="70" cy="-6" r="3.5" fill="#fff6c2"/><circle cx="98" cy="2" r="3.5" fill="#fff6c2"/>`;
    case 'schleife':
      return `<path d="M84 18 L62 0 Q58 18 62 36Z M84 18 L106 0 Q110 18 106 36Z" fill="#ff6fb5" stroke="#d6457f" stroke-width="2" stroke-linejoin="round"/>
        <path d="M66 8 Q70 18 66 28 M102 8 Q98 18 102 28" stroke="#d6457f" stroke-width="2" fill="none" opacity=".7"/>
        <path d="M66 4 L74 12" stroke="#fff" stroke-width="2.5" opacity=".5" stroke-linecap="round"/><circle cx="84" cy="18" r="7.5" fill="#e0458f"/><circle cx="82" cy="16" r="2.5" fill="#fff" opacity=".5"/>`;
    case 'zylinder':
      return `<rect x="32" y="-34" width="56" height="54" rx="5" fill="#2b2b2b"/><rect x="36" y="-30" width="10" height="44" rx="4" fill="#fff" opacity=".12"/>
        <rect x="32" y="4" width="56" height="10" fill="#c1121f"/><rect x="32" y="4" width="56" height="3" fill="#ff6b6b" opacity=".6"/>
        <ellipse cx="60" cy="20" rx="46" ry="8" fill="#1e1e1e"/><ellipse cx="60" cy="18" rx="40" ry="4" fill="#3a3a3a"/>`;
    case 'sonnenhut':
      return `<ellipse cx="60" cy="26" rx="66" ry="13" fill="#e9b94f"/><ellipse cx="60" cy="24" rx="60" ry="9" fill="#f6d186"/>
        <path d="M6 26 Q60 34 114 26" stroke="#c99a3a" stroke-width="1.5" fill="none" stroke-dasharray="3 3"/>
        <ellipse cx="60" cy="16" rx="36" ry="22" fill="#f6d186"/><path d="M30 14 Q40 -2 60 -4" stroke="#fff3c4" stroke-width="3" fill="none" opacity=".7"/>
        <rect x="25" y="16" width="70" height="9" fill="#ff6fb5"/><path d="M25 22 h70" stroke="#d6457f" stroke-width="1.5"/>
        <circle cx="90" cy="14" r="9" fill="#ff595e"/><circle cx="84" cy="10" r="5" fill="#ff8a8f"/><circle cx="90" cy="14" r="3.5" fill="#ffca3a"/>`;
    default: return '';
  }
}

function glasses(L) {
  if (L.glasses === 'rund') {
    return `<g fill="rgba(220,240,255,.28)" stroke="#2f3b52" stroke-width="3.5"><circle cx="43" cy="62" r="13"/><circle cx="77" cy="62" r="13"/></g>
      <path d="M35 55 l5 -3 M69 55 l5 -3" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".8"/>
      <path d="M56 61 Q60 56 64 61 M30 60 L16 56 M90 60 L104 56" stroke="#2f3b52" stroke-width="3" fill="none"/>`;
  }
  if (L.glasses === 'sonne') {
    return `<rect x="27" y="52" width="31" height="21" rx="9" fill="#1d1d2b"/><rect x="62" y="52" width="31" height="21" rx="9" fill="#1d1d2b"/>
      <rect x="29" y="54" width="27" height="8" rx="4" fill="#5b5f8a" opacity=".55"/><rect x="64" y="54" width="27" height="8" rx="4" fill="#5b5f8a" opacity=".55"/>
      <path d="M58 59 L62 59 M27 58 L16 55 M93 58 L104 55" stroke="#1d1d2b" stroke-width="3.5"/>
      <path d="M33 58 L41 57 M68 58 L76 57" stroke="#fff" stroke-width="2.5" opacity=".6" stroke-linecap="round"/>`;
  }
  return '';
}

export const EYE_COLORS = ['#5a3a22', '#2f6db5', '#3c7a3a', '#7a8a99', '#8a5a2b', '#6a4c93'];

// Figur im 120×210-Koordinatensystem, Füße unten Mitte. Detaillierter Stil mit Schattierung.
export function charSVG(L, sit = false) {
  const g = 'cg' + ++uid + '-';
  const sk = L.skin;
  const skL = shade(sk, 0.35);
  const skD = shade(sk, -0.16);
  const dress = L.style === 'kleid';
  const shirtL = shade(L.shirt, 0.3);
  const shirtD = shade(L.shirt, -0.2);
  const pantsD = shade(L.pants, -0.25);
  const eyeC = L.eyes || '#5a3a22';
  const brow = L.hair === 'glatze' ? skD : shade(L.hc, -0.25);
  const defs = `<defs>
    <radialGradient id="${g}s" cx="40%" cy="35%" r="72%"><stop offset="0" stop-color="${skL}"/><stop offset=".72" stop-color="${sk}"/><stop offset="1" stop-color="${skD}"/></radialGradient>
    <linearGradient id="${g}t" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${shirtL}"/><stop offset="1" stop-color="${shirtD}"/></linearGradient>
    <linearGradient id="${g}p" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${pantsD}"/><stop offset=".5" stop-color="${L.pants}"/><stop offset="1" stop-color="${pantsD}"/></linearGradient>
    <linearGradient id="${g}h" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(L.hc, 0.2)}"/><stop offset="1" stop-color="${shade(L.hc, -0.12)}"/></linearGradient>
    <radialGradient id="${g}i" cx="50%" cy="35%" r="65%"><stop offset="0" stop-color="${shade(eyeC, 0.45)}"/><stop offset="1" stop-color="${eyeC}"/></radialGradient>
    <clipPath id="${g}b"><path d="M35 112 q0 -14 15 -14 h20 q15 0 15 14 v32 h-50z"/></clipPath>
  </defs>`;
  const legFill = dress ? `url(#${g}s)` : `url(#${g}p)`;
  const shoe = (x, y) => `<path d="M${x - 13} ${y + 1} q0 -9 9 -9 h8 q10 0 10 9 v3 h-27z" fill="${L.shoes}"/>
    <path d="M${x - 11} ${y - 2} q2 -5 7 -6" stroke="#fff" stroke-width="2" fill="none" opacity=".35" stroke-linecap="round"/>
    <rect x="${x - 14}" y="${y + 3}" width="29" height="5.5" rx="2.7" fill="#f4f4f4"/><rect x="${x - 14}" y="${y + 6.5}" width="29" height="2" rx="1" fill="#cfcfcf"/>
    <path d="M${x - 5} ${y - 6} l6 3 M${x - 3} ${y - 9} l6 3" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>`;
  const legs = sit
    ? `<rect x="39" y="146" width="20" height="30" rx="9" fill="${legFill}"/><rect x="61" y="146" width="20" height="30" rx="9" fill="${legFill}"/>
       <rect x="42" y="168" width="15" height="26" rx="7" fill="${legFill}"/><rect x="63" y="168" width="15" height="26" rx="7" fill="${legFill}"/>
       <ellipse cx="49" cy="171" rx="11" ry="8" fill="${dress ? sk : L.pants}"/><ellipse cx="71" cy="171" rx="11" ry="8" fill="${dress ? sk : L.pants}"/>
       <ellipse cx="46" cy="168" rx="5" ry="3" fill="#fff" opacity=".28"/><ellipse cx="68" cy="168" rx="5" ry="3" fill="#fff" opacity=".28"/>
       ${shoe(49, 197)}${shoe(71, 197)}`
    : `<rect x="41" y="146" width="16" height="52" rx="7" fill="${legFill}"/><rect x="63" y="146" width="16" height="52" rx="7" fill="${legFill}"/>
       ${dress ? '' : `<path d="M49 150 v46 M71 150 v46" stroke="${pantsD}" stroke-width="1.2" opacity=".6"/><path d="M41 190 h16 M63 190 h16" stroke="${pantsD}" stroke-width="2" opacity=".5"/>`}
       ${shoe(49, 199)}${shoe(71, 199)}`;
  let body;
  if (dress) {
    body = `<path d="M40 100 Q60 94 80 100 L94 168 Q60 178 26 168 Z" fill="url(#${g}t)"/>
      <path d="M48 120 L40 166 M60 122 L60 172 M72 120 L80 166" stroke="${shirtD}" stroke-width="1.6" opacity=".55" fill="none"/>
      <path d="M37 118 Q60 124 83 118" stroke="${shirtD}" stroke-width="4" fill="none"/><circle cx="60" cy="121" r="4" fill="${shirtL}"/>
      <path d="M26 168 q5 6 10 1 q5 6 10 1 q5 6 10 1 q5 6 10 1 q5 6 10 1 q5 6 10 1 q5 6 8 -1" stroke="${shade(L.shirt, 0.45)}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <path d="M50 100 q10 9 20 0" fill="${shirtD}"/><path d="M50 100 q10 7 20 0" fill="none" stroke="${shirtL}" stroke-width="2"/>`;
  } else {
    body = `<rect x="38" y="130" width="44" height="28" rx="8" fill="url(#${g}p)"/>
      <rect x="38" y="132" width="44" height="5" fill="#5a3a22"/><rect x="56" y="131" width="8" height="7" rx="1.5" fill="#d4b26a"/><rect x="58" y="133" width="4" height="3" fill="#5a3a22"/>
      <path d="M35 112 q0 -14 15 -14 h20 q15 0 15 14 v26 q-25 6 -50 0z" fill="url(#${g}t)"/>`;
    if (L.style === 'streifen') {
      const st = shade(L.shirt, 0.65);
      body += `<g clip-path="url(#${g}b)" opacity=".9">${[106, 116, 126, 136].map((y) => `<rect x="30" y="${y}" width="60" height="5" fill="${st}"/>`).join('')}</g>`;
    }
    if (L.style === 'pulli') {
      body += `<path d="M36 136 q24 6 48 0" stroke="${shirtD}" stroke-width="5" fill="none"/>` +
        [40, 46, 52, 58, 64, 70, 76].map((x) => `<path d="M${x} 134 v6" stroke="${shirtL}" stroke-width="1.2" opacity=".6"/>`).join('') +
        `<path d="M48 99 q12 12 24 0" stroke="${shirtD}" stroke-width="5" fill="none"/>`;
    } else {
      body += `<path d="M50 99 q10 10 20 0" fill="${shirtD}"/><path d="M50 99 q10 8 20 0" fill="none" stroke="${shirtL}" stroke-width="2"/>`;
    }
    body += `<path d="M44 118 q4 10 0 18 M76 116 q-3 8 0 15" stroke="${shirtD}" stroke-width="1.5" fill="none" opacity=".7"/>`;
  }
  const longSleeve = L.style === 'pulli';
  const arm = (x, flip) => {
    const lx = flip > 0 ? x - 3 : x - 11;
    return `<path d="M${x} 101 q${flip * 13} 2 ${flip * 13} 16 v9 h${-flip * 19} v-11 q0 -12 ${flip * 6} -14z" fill="url(#${g}t)"/>
      <rect x="${lx}" y="118" width="14" height="30" rx="7" fill="${longSleeve ? `url(#${g}t)` : `url(#${g}s)`}"/>
      ${longSleeve ? `<rect x="${lx - 1}" y="141" width="16" height="6" rx="3" fill="${shirtD}"/>` : `<path d="M${lx - 2} 125 h18" stroke="${shirtD}" stroke-width="3" stroke-linecap="round"/>`}
      <circle cx="${lx + 7}" cy="151" r="8.5" fill="url(#${g}s)"/><path d="M${flip > 0 ? lx + 2 : lx + 9} 148 q${flip > 0 ? -3 : 3} 4 0 7" stroke="${skD}" stroke-width="1.4" fill="none"/>`;
  };
  const arms = arm(85, 1) + arm(35, -1);
  const eye = (x) => `<ellipse cx="${x}" cy="62" rx="8.5" ry="9.5" fill="#fff"/><circle cx="${x + 1}" cy="63" r="6.2" fill="url(#${g}i)"/><circle cx="${x + 1}" cy="63" r="3" fill="#161616"/>
      <circle cx="${x + 3.4}" cy="60" r="2.1" fill="#fff"/><circle cx="${x - 1}" cy="66" r="1" fill="#fff" opacity=".8"/>
      <path d="M${x - 9.5} 59.5 q9.5 -10 19 0" stroke="#2b2b2b" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <path d="M${x + 7.5} 55.5 l3 -3 M${x + 4.5} 53.5 l2 -3.5" stroke="#2b2b2b" stroke-width="1.6" stroke-linecap="round"/>`;
  const face = `
    <ellipse class="cheek" cx="31" cy="78" rx="9" ry="5.5" fill="#ff7f9f" opacity=".35"/><ellipse class="cheek" cx="89" cy="78" rx="9" ry="5.5" fill="#ff7f9f" opacity=".35"/>
    <path d="M34 47 q9 -6 17 -1 M69 46 q8 -5 17 1" stroke="${brow}" stroke-width="3.4" fill="none" stroke-linecap="round"/>
    <g class="eyes">${eye(43)}${eye(77)}</g>
    <g class="eyesc" stroke="#2b2b2b" stroke-width="3.2" fill="none" stroke-linecap="round"><path d="M35 63 Q43 70 51 63"/><path d="M69 63 Q77 70 85 63"/><path d="M36 64 l-3 3 M84 64 l3 3" stroke-width="1.8"/></g>
    <path d="M57 70 q3 6 6 0" stroke="${skD}" stroke-width="2.2" fill="none" stroke-linecap="round"/><ellipse cx="61" cy="69" rx="2" ry="1.2" fill="#fff" opacity=".5"/>
    <g class="m-smile"><path d="M49 82 q11 11 22 0 q-11 4 -22 0z" fill="#8c2f39"/><path d="M53 86 q7 4 14 0" fill="#ff8fa0"/><path d="M48 82 q12 4 24 0" stroke="#6b1f2a" stroke-width="1.6" fill="none" stroke-linecap="round"/></g>
    <g class="m-o"><ellipse cx="60" cy="87" rx="6.5" ry="7.5" fill="#6b1f2a"/><ellipse cx="60" cy="91" rx="4" ry="2.5" fill="#ff7b8a"/></g>
    <g class="m-happy"><path d="M45 80 Q60 104 75 80 Z" fill="#6b1f2a"/><path d="M47 81 h26 v3 q-13 3 -26 0z" fill="#fff"/><path d="M52 92 Q60 98 68 92 Q60 87 52 92Z" fill="#ff7b8a"/></g>`;
  return `<svg class="cs" viewBox="0 0 120 210" width="120" height="210" overflow="visible">${defs}
    ${hairBack(L, g)}${legs}${body}${arms}
    <rect x="52" y="92" width="16" height="12" fill="${skD}"/>
    <circle cx="14" cy="64" r="10" fill="url(#${g}s)"/><path d="M11 60 q5 4 1 9" stroke="${skD}" stroke-width="2" fill="none"/>
    <circle cx="106" cy="64" r="10" fill="url(#${g}s)"/><path d="M109 60 q-5 4 -1 9" stroke="${skD}" stroke-width="2" fill="none"/>
    <circle cx="60" cy="59" r="47" fill="url(#${g}s)"/>
    ${face}${hairFront(L, g)}${hat(L)}${glasses(L)}
  </svg>`;
}

// ---------- Gegenstände ----------
const FOOD = '🍎🍌🍐🍇🍓🍉🍒🥕🌽🥔🥦🍅🍳🍞🧀🥐🍕🍔🌭🍟🍪🍩🧁🍰🍫🍦🍭🍿🍖🥪🍯🥨🍧🍨🧇🥞🍋🥝🍑🥒';
const DRINK = '🥛☕🧃🥤💧🍵';
const PETS = { '🐶': 'woof', '🐱': 'meow', '🐰': 'squeak', '🐹': 'squeak', '🐭': 'squeak', '🐦': 'tweet', '🐥': 'tweet', '🦆': 'quack', '🐸': 'croak', '🐢': 'squeak', '🐠': 'pop', '🦋': 'pop' };
export const HAT_ITEMS = { '🧢': 'cap', '👑': 'krone', '🎀': 'schleife', '🎩': 'zylinder', '👒': 'sonnenhut' };
export const GLASS_ITEMS = { '👓': 'rund', '🕶️': 'sonne' };
export const TOOLS = { '✂️': 'haircut', '🧴': 'haircolor', '👕': 'shirt', '👗': 'dress', '👖': 'pants', '👟': 'shoes', '🧼': 'soap' };
export const COOK = { '🥚': '🍳', '🌽': '🍿', '🥔': '🍟', '🥩': '🍖', '🍞': '🥪', '🧀': '🍕', '🥞': '🧇' };
export const COLD = { '💧': '🧊', '🥛': '🍦', '🍓': '🍧', '🍫': '🍨' };
export const FLOATY = new Set(['🎈', '🦋']);
const SOUNDS = { '🥁': 'drum', '🎸': 'guitar', '🎺': 'trumpet', '⏰': 'ring', '🪙': 'coin', '🔔': 'ding', '📺': 'tv' };
const SIZES = {
  '🛒': 112, '🪴': 92, '🌻': 84, '🧺': 80, '📦': 80, '🎸': 92, '🛹': 84, '🦖': 88, '🐶': 82, '🐱': 78,
  '🎁': 74, '🪣': 74, '🌷': 70, '🖼️': 76, '🤖': 78, '🚗': 80, '🚂': 84, '⚽': 62, '🏀': 64, '🧸': 78,
  '🪙': 40, '💎': 46, '✏️': 50, '🖍️': 50, '🍒': 52, '🥚': 50, '🍇': 60, '🍓': 52, '💧': 48, '🧊': 50,
  '🪥': 54, '🧼': 54, '🐭': 54, '🐹': 58, '🐥': 52, '🐦': 56, '🦋': 58, '🍋': 54, '🍑': 56, '🍪': 56, '🐠': 60,
  '🎈': 76, '💩': 58, '🎒': 70, '📏': 56, '📐': 56, '📓': 58, '📖': 60, '🧮': 70, '🌍': 66, '🏆': 66, '💻': 78, '📄': 54, '📎': 44, '🖊️': 50, '📁': 60, '📱': 52, '🎧': 60, '📊': 58, '🗂️': 62, '👓': 60, '🕶️': 60, '🪀': 54, '🎲': 54, '🦆': 64, '🔔': 56, '🍭': 62,
};

export function itemInfo(k) {
  return {
    size: SIZES[k] || 66,
    food: FOOD.includes(k),
    drink: DRINK.includes(k),
    pet: PETS[k] || null,
    hat: HAT_ITEMS[k] || null,
    glasses: GLASS_ITEMS[k] || null,
    tool: TOOLS[k] || null,
    floaty: FLOATY.has(k),
    sound: SOUNDS[k] || null,
  };
}

export const DRAWER = [
  ['🍎', 'Essen', [...'🍎🍌🍐🍇🍓🍉🍒🍋🥕🌽🥔🥦🍅🥚🥩🍞🧀🥐🥞🍕🍔🌭🍪🍩🧁🍰🍫🍦🍭🥛☕🧃'].filter((c) => c.trim())],
  ['🧸', 'Spielzeug', ['🧸', '⚽', '🏀', '🎈', '🪀', '🎲', '🧩', '🎮', '🛹', '🚗', '🚂', '🤖', '🦖', '🎸', '🥁', '🎺', '📚', '✏️', '🖍️', '🎁', '⏰', '🔔', '💎', '🪙']],
  ['👑', 'Anziehen', ['🧢', '👑', '🎀', '🎩', '👒', '👓', '🕶️', '👕', '👗', '👖', '👟', '✂️', '🧴', '🧼']],
  ['🐶', 'Tiere', ['🐶', '🐱', '🐰', '🐹', '🐭', '🐦', '🐥', '🦆', '🐢', '🐸', '🐠', '🦋']],
  ['🎒', 'Schule', ['🎒', '✏️', '🖍️', '📏', '📐', '📚', '📖', '📓', '🧮', '🌍', '🎨', '🖌️', '🔔', '🍎', '⭐', '🏆']],
  ['💼', 'Büro', ['💻', '📱', '🎧', '⌨️', '🖱️', '📁', '🗂️', '📄', '📊', '📎', '🖊️', '✏️', '☕', '🔔', '📅', '💼']],
  ['🪴', 'Deko', ['💩', '🪴', '🌻', '🌷', '🕯️', '🖼️', '💡', '🛒', '🧺', '🪣', '📦', '🧻', '🪥', '💧', '🧊', '⭐', '🍄']],
];

// Was passiert beim Antippen eines Gegenstands?
export const GIFT_TOYS = ['🧸', '🤖', '🦖', '🚗', '🪀', '🎲', '🧩', '💎', '🎈', '🚂', '🏀', '👑'];
export { PETS };
