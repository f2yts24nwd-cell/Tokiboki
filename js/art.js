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

function hairBack(L) {
  const c = L.hc;
  switch (L.hair) {
    case 'lang': return `<path d="M10 56 Q2 132 22 148 L98 148 Q118 132 110 56 Z" fill="${c}"/>`;
    case 'pony': return `<path d="M12 56 Q8 104 24 114 L96 114 Q112 104 108 56 Z" fill="${c}"/>`;
    case 'afro': return `<circle cx="60" cy="52" r="62" fill="${c}"/>`;
    default: return '';
  }
}

function hairFront(L) {
  const c = L.hc;
  const d = shade(c, -0.18);
  switch (L.hair) {
    case 'kurz':
      return `<path d="M13 60 Q10 12 60 11 Q110 12 107 60 Q102 40 86 33 Q72 44 52 36 Q34 34 22 46 Q16 52 13 60Z" fill="${c}"/>`;
    case 'pony':
      return `<path d="M13 62 Q10 11 60 11 Q110 11 107 62 L101 46 Q60 54 19 46Z" fill="${c}"/>`;
    case 'lang':
      return `<path d="M13 64 Q8 11 62 11 Q112 13 107 64 Q99 36 72 29 Q50 46 21 53 Z" fill="${c}"/>`;
    case 'zoepfe':
      return `<circle cx="7" cy="80" r="15" fill="${c}"/><circle cx="113" cy="80" r="15" fill="${c}"/>
        <circle cx="7" cy="104" r="11" fill="${c}"/><circle cx="113" cy="104" r="11" fill="${c}"/>
        <circle cx="13" cy="66" r="5" fill="#ff595e"/><circle cx="107" cy="66" r="5" fill="#ff595e"/>
        <path d="M14 60 Q12 11 60 11 Q108 11 106 60 Q96 30 60 28 Q24 30 14 60Z" fill="${c}"/>
        <path d="M60 12 L60 29" stroke="${d}" stroke-width="3"/>`;
    case 'afro':
      return `<circle cx="22" cy="40" r="17" fill="${c}"/><circle cx="40" cy="24" r="19" fill="${c}"/>
        <circle cx="60" cy="19" r="19" fill="${c}"/><circle cx="80" cy="24" r="19" fill="${c}"/><circle cx="98" cy="40" r="17" fill="${c}"/>`;
    case 'dutt':
      return `<circle cx="60" cy="4" r="18" fill="${c}"/>
        <path d="M14 60 Q12 12 60 12 Q108 12 106 60 Q96 34 60 30 Q24 34 14 60Z" fill="${c}"/>`;
    case 'irokese':
      return `<path d="M42 24 L46 -14 L54 16 L60 -20 L66 16 L74 -14 L78 24 Q60 16 42 24Z" fill="${c}"/>`;
    case 'glatze':
      return `<ellipse cx="44" cy="28" rx="11" ry="6" fill="#fff" opacity=".35"/>`;
    default: return '';
  }
}

function hat(L) {
  switch (L.hat) {
    case 'cap':
      return `<path d="M15 46 Q15 4 60 4 Q105 4 105 46 Z" fill="#ff595e"/>
        <path d="M58 40 Q100 32 126 46 Q100 52 58 47Z" fill="#c1121f"/><circle cx="60" cy="6" r="5" fill="#c1121f"/>`;
    case 'krone':
      return `<path d="M24 34 L22 2 L38 18 L50 -6 L60 14 L70 -6 L82 18 L98 2 L96 34 Z" fill="#ffcc33" stroke="#e0a800" stroke-width="3" stroke-linejoin="round"/>
        <circle cx="42" cy="26" r="4" fill="#ff595e"/><circle cx="60" cy="24" r="5" fill="#1982c4"/><circle cx="78" cy="26" r="4" fill="#8ac926"/>`;
    case 'schleife':
      return `<path d="M84 18 L64 2 L64 34Z M84 18 L104 2 L104 34Z" fill="#ff6fb5" stroke="#e0458f" stroke-width="2" stroke-linejoin="round"/><circle cx="84" cy="18" r="7" fill="#e0458f"/>`;
    case 'zylinder':
      return `<rect x="32" y="-34" width="56" height="54" rx="5" fill="#2b2b2b"/><rect x="32" y="6" width="56" height="9" fill="#c1121f"/>
        <ellipse cx="60" cy="20" rx="46" ry="8" fill="#2b2b2b"/>`;
    case 'sonnenhut':
      return `<ellipse cx="60" cy="26" rx="66" ry="13" fill="#e9b94f"/><ellipse cx="60" cy="16" rx="36" ry="22" fill="#f6d186"/>
        <rect x="25" y="18" width="70" height="8" fill="#ff6fb5"/><circle cx="90" cy="14" r="8" fill="#ff595e"/><circle cx="90" cy="14" r="3" fill="#ffca3a"/>`;
    default: return '';
  }
}

function glasses(L) {
  if (L.glasses === 'rund') {
    return `<g fill="rgba(255,255,255,.3)" stroke="#333" stroke-width="3.5"><circle cx="43" cy="62" r="12"/><circle cx="77" cy="62" r="12"/></g>
      <path d="M55 61 Q60 56 65 61 M31 60 L16 56 M89 60 L104 56" stroke="#333" stroke-width="3" fill="none"/>`;
  }
  if (L.glasses === 'sonne') {
    return `<rect x="28" y="53" width="29" height="19" rx="8" fill="#222"/><rect x="63" y="53" width="29" height="19" rx="8" fill="#222"/>
      <path d="M57 59 L63 59 M28 58 L16 55 M92 58 L104 55" stroke="#222" stroke-width="3.5"/>
      <path d="M33 58 L40 58" stroke="#fff" stroke-width="2.5" opacity=".6" stroke-linecap="round"/>`;
  }
  return '';
}

// Figur im 120×210-Koordinatensystem, Füße unten Mitte.
export function charSVG(L, sit = false) {
  const sk = L.skin;
  const skd = shade(sk, -0.14);
  const dress = L.style === 'kleid';
  const legC = dress ? sk : L.pants;
  const shC = L.shoes;
  const legs = sit
    ? `<rect x="38" y="146" width="21" height="34" rx="10" fill="${legC}"/><rect x="61" y="146" width="21" height="34" rx="10" fill="${legC}"/>
       <rect x="41" y="168" width="15" height="28" rx="7" fill="${legC}"/><rect x="64" y="168" width="15" height="28" rx="7" fill="${legC}"/>
       <ellipse cx="48" cy="200" rx="13" ry="8" fill="${shC}"/><ellipse cx="72" cy="200" rx="13" ry="8" fill="${shC}"/>`
    : `<rect x="41" y="146" width="16" height="54" rx="8" fill="${legC}"/><rect x="63" y="146" width="16" height="54" rx="8" fill="${legC}"/>
       <ellipse cx="48" cy="201" rx="14" ry="8" fill="${shC}"/><ellipse cx="72" cy="201" rx="14" ry="8" fill="${shC}"/>`;
  let body;
  if (dress) {
    body = `<path d="M40 100 Q60 94 80 100 L94 168 Q60 178 26 168 Z" fill="${L.shirt}"/>
      <path d="M30 156 Q60 166 90 156" stroke="${shade(L.shirt, 0.35)}" stroke-width="5" fill="none"/>`;
  } else {
    body = `<rect x="38" y="132" width="44" height="26" rx="9" fill="${L.pants}"/>
      <rect x="35" y="98" width="50" height="46" rx="17" fill="${L.shirt}"/>`;
    if (L.style === 'streifen') {
      const st = shade(L.shirt, 0.6);
      body += `<rect x="37" y="110" width="46" height="6" fill="${st}"/><rect x="36" y="123" width="48" height="6" fill="${st}"/><rect x="37" y="136" width="46" height="5" fill="${st}"/>`;
    }
  }
  const lowerArm = L.style === 'pulli' ? L.shirt : sk;
  const arms = `<rect x="22" y="102" width="19" height="28" rx="9" fill="${L.shirt}"/><rect x="25" y="118" width="14" height="30" rx="7" fill="${lowerArm}"/><circle cx="32" cy="151" r="9" fill="${sk}"/>
    <rect x="79" y="102" width="19" height="28" rx="9" fill="${L.shirt}"/><rect x="81" y="118" width="14" height="30" rx="7" fill="${lowerArm}"/><circle cx="88" cy="151" r="9" fill="${sk}"/>`;
  const face = `
    <ellipse class="cheek" cx="32" cy="77" rx="8" ry="5" fill="#ff7f9f" opacity=".45"/><ellipse class="cheek" cx="88" cy="77" rx="8" ry="5" fill="#ff7f9f" opacity=".45"/>
    <g class="eyes"><circle cx="43" cy="62" r="6.5" fill="#2b2b2b"/><circle cx="77" cy="62" r="6.5" fill="#2b2b2b"/>
      <circle cx="45" cy="60" r="2.2" fill="#fff"/><circle cx="79" cy="60" r="2.2" fill="#fff"/></g>
    <g class="eyesc" stroke="#2b2b2b" stroke-width="3.5" fill="none" stroke-linecap="round"><path d="M36 63 Q43 69 50 63"/><path d="M70 63 Q77 69 84 63"/></g>
    <ellipse cx="60" cy="72" rx="4.5" ry="3.5" fill="${skd}"/>
    <path class="m-smile" d="M50 83 Q60 93 70 83" stroke="#4a2328" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <ellipse class="m-o" cx="60" cy="87" rx="6" ry="7" fill="#6b1f2a"/>
    <g class="m-happy"><path d="M46 80 Q60 102 74 80 Z" fill="#6b1f2a"/><path d="M53 90 Q60 96 67 90 Q60 86 53 90Z" fill="#ff7b8a"/></g>`;
  return `<svg class="cs" viewBox="0 0 120 210" width="120" height="210" overflow="visible">
    ${hairBack(L)}${legs}${body}${arms}
    <circle cx="14" cy="66" r="10" fill="${sk}"/><circle cx="106" cy="66" r="10" fill="${sk}"/>
    <circle cx="60" cy="60" r="47" fill="${sk}"/>
    ${face}${hairFront(L)}${hat(L)}${glasses(L)}
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
  '🎈': 76, '👓': 60, '🕶️': 60, '🪀': 54, '🎲': 54, '🦆': 64, '🔔': 56, '🍭': 62,
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
  ['🪴', 'Deko', ['🪴', '🌻', '🌷', '🕯️', '🖼️', '💡', '🛒', '🧺', '🪣', '📦', '🧻', '🪥', '💧', '🧊', '⭐', '🍄']],
];

// Was passiert beim Antippen eines Gegenstands?
export const GIFT_TOYS = ['🧸', '🤖', '🦖', '🚗', '🪀', '🎲', '🧩', '💎', '🎈', '🚂', '🏀', '👑'];
export { PETS };
