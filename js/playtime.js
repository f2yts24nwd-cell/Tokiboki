// Spielzeit-Begrenzung: nach X Minuten Warnung (Bildschirm wackelt), nach Y Minuten
// 10 Sekunden Countdown, danach Sperrbildschirm bis zum nächsten Tag (oder Eltern-Freigabe).
// Gezählt wird nur, solange die App sichtbar ist. Der Zähler gilt pro Tag.
const KEY = 'tokiboki-zeit';
const DEFAULTS = { on: true, warn: 10, end: 15 };

let st;
let api;
let el;
let countdown = null;
let lastSave = 0;

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

function load() {
  let s = null;
  try { s = JSON.parse(localStorage.getItem(KEY)); } catch (e) { /* neu */ }
  s = Object.assign({ day: today(), ms: 0, warned: false, ended: false, locked: false, bonus: 0 }, s || {});
  s.cfg = Object.assign({}, DEFAULTS, s.cfg || {});
  return s;
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { /* egal */ }
}
function newDay() {
  if (st.day === today()) return;
  Object.assign(st, { day: today(), ms: 0, warned: false, ended: false, locked: false, bonus: 0 });
  save();
}
const minutes = () => st.ms / 60000;

function shake() {
  document.body.classList.remove('shake');
  void document.body.offsetWidth;
  document.body.classList.add('shake');
  setTimeout(() => document.body.classList.remove('shake'), 1600);
  try { navigator.vibrate && navigator.vibrate([300, 120, 300, 120, 300]); } catch (e) { /* iPad kann das nicht */ }
}

function show(html) {
  el.innerHTML = `<div class="ptcard">${html}</div>`;
  el.classList.remove('hidden');
}
function hide() {
  el.classList.add('hidden');
  el.innerHTML = '';
}

function warn() {
  st.warned = true;
  save();
  shake();
  api.sfx.siren();
  const left = Math.max(1, Math.round(st.cfg.end + st.bonus - minutes()));
  show(`<div class="ptbig">⏰</div><h2>Du spielst schon ${st.cfg.warn + (st.bonus || 0)} Minuten!</h2>
    <p>In <b>${left} Minuten</b> ist für heute Schluss.<br>Such dir schon mal ein schönes Ende für deine Geschichte aus. 🙂</p>
    <button class="btn primary" data-pt="ok">Okay! 👍</button>`);
}

function startEnd() {
  st.ended = true;
  save();
  shake();
  api.sfx.siren();
  let n = 10;
  const render = () => show(`<div class="ptbig ptcount">${n}</div><h2>Die Spielzeit ist um!</h2>
    <p>Bitte beende jetzt das Spiel. In <b>${n} Sekunden</b> schließt es sich von selbst.</p>
    <button class="btn primary" data-pt="bye">Tschüss sagen 👋</button>`);
  render();
  countdown = setInterval(() => {
    n--;
    if (n <= 0) { clearInterval(countdown); countdown = null; lock(); return; }
    render();
    api.sfx.click();
    if (n <= 3) shake();
  }, 1000);
}

function lock() {
  if (countdown) { clearInterval(countdown); countdown = null; }
  st.locked = true;
  save();
  api.stopAll();
  document.body.classList.add('pt-locked');
  show(`<div class="ptbig">🌙</div><h2>Spielzeit für heute vorbei</h2>
    <p>Danke fürs Spielen! Morgen geht's weiter. 👋<br>Du kannst die App jetzt schließen.</p>
    <button class="ptparent" data-pt="parent">👪 Eltern</button>`);
  try { window.close(); } catch (e) { /* Web-Apps dürfen sich meist nicht selbst schließen */ }
}

// ---------- Eltern-Bereich (mit 4-stelliger PIN gesichert) ----------
// Die PIN wird nur als Prüfsumme gespeichert, nicht im Klartext.
const pinHash = (pin) => {
  let h = 5381;
  for (const ch of 'tokiboki:' + pin) h = ((h * 33) ^ ch.charCodeAt(0)) >>> 0;
  return h.toString(36);
};
let gate = null;
export function openParents(fromSettings = false) {
  gate = { fromSettings, mode: st.cfg.pin ? 'check' : 'new', entry: '', first: '', tries: 0 };
  renderPad();
}
function renderPad(msg = '') {
  const title = { check: 'Eltern-PIN eingeben', new: 'Neue Eltern-PIN festlegen', repeat: 'PIN noch einmal eingeben', change: 'Neue PIN eingeben', change2: 'Neue PIN wiederholen' }[gate.mode];
  const sub = gate.mode === 'new' ? 'Wähle 4 Ziffern, die dein Kind nicht kennt.' : gate.mode === 'check' ? 'Nur für Eltern 👪' : '';
  show(`<div class="ptbig">🔐</div><h2>${title}</h2>${sub ? `<p class="ptsub">${sub}</p>` : ''}
    <div class="ptdots${msg ? ' bad' : ''}">${[0, 1, 2, 3].map((i) => `<i class="${i < gate.entry.length ? 'on' : ''}"></i>`).join('')}</div>
    <p class="ptmsg">${msg}</p>
    <div class="ptpad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<button data-pt="d" data-n="${n}">${n}</button>`).join('')}<button data-pt="cancel" class="ptsmall">Abbrechen</button><button data-pt="d" data-n="0">0</button><button data-pt="del" class="ptsmall">⌫</button></div>
    ${gate.mode === 'check' ? '<p class="ptforgot">PIN vergessen? Am nächsten Tag ist das Spiel wieder frei. Dann unter ⚙️ den Spielstand sichern, in den iPad-Einstellungen die Websitedaten der App löschen und den Spielstand wieder laden.</p>' : ''}`);
}
function pinDigit(n) {
  if (gate.entry.length >= 4) return;
  gate.entry += n;
  api.sfx.click();
  if (gate.entry.length < 4) { renderPad(); return; }
  const pin = gate.entry;
  gate.entry = '';
  if (gate.mode === 'check') {
    if (pinHash(pin) === st.cfg.pin) { gate.tries = 0; parentPanel(); return; }
    gate.tries++;
    api.sfx.boing();
    if (gate.tries >= 5) { gate.tries = 0; gate.wait = Date.now() + 30000; }
    renderPad(gate.wait > Date.now() ? 'Zu oft falsch – bitte 30 Sekunden warten' : 'Falsche PIN');
  } else if (gate.mode === 'new' || gate.mode === 'change') {
    gate.first = pin;
    gate.mode = gate.mode === 'new' ? 'repeat' : 'change2';
    renderPad();
  } else {
    if (pin === gate.first) {
      st.cfg.pin = pinHash(pin);
      save();
      api.sfx.sparkle();
      parentPanel('✅ PIN gespeichert');
    } else {
      gate.mode = gate.mode === 'repeat' ? 'new' : 'change';
      api.sfx.boing();
      renderPad('Die beiden PINs waren verschieden – nochmal');
    }
  }
}
function parentPanel(note = '') {
  const c = st.cfg;
  const used = Math.floor(minutes());
  show(`<h2>⏱️ Spielzeit</h2>${note ? `<p class="ptok">${note}</p>` : ''}
    <p>Heute gespielt: <b>${used} Min.</b>${st.bonus ? ` (heute +${st.bonus} Min. extra)` : ''}</p>
    <button class="btn" data-pt="toggle">${c.on ? '✅ Begrenzung ist an' : '⛔ Begrenzung ist aus'}</button>
    <div class="ptrow"><span>Warnung nach</span><button class="btn" data-pt="w-">−</button><b>${c.warn} Min.</b><button class="btn" data-pt="w+">＋</button></div>
    <div class="ptrow"><span>Ende nach</span><button class="btn" data-pt="e-">−</button><b>${c.end} Min.</b><button class="btn" data-pt="e+">＋</button></div>
    <div><button class="btn" data-pt="plus15">➕ Heute 15 Min. mehr</button><button class="btn" data-pt="reset">🔄 Heutige Zeit auf 0</button></div>
    <button class="btn" data-pt="newpin">🔐 PIN ändern</button>
    <button class="btn primary" data-pt="done">Fertig</button>`);
}

function onClick(e) {
  const b = e.target.closest('[data-pt]');
  if (!b) return;
  api.unlock();
  const a = b.dataset.pt;
  const c = st.cfg;
  if (a === 'ok') { hide(); api.sfx.pop(); }
  else if (a === 'bye') lock();
  else if (a === 'parent') openParents(false);
  else if (a === 'cancel') { if (st.locked) lock(); else hide(); }
  else if (a === 'del') { gate.entry = gate.entry.slice(0, -1); renderPad(); }
  else if (a === 'd') { if (!(gate.wait > Date.now())) pinDigit(b.dataset.n); }
  else if (a === 'newpin') { gate = { mode: 'change', entry: '', first: '', tries: 0 }; renderPad(); }
  else {
    if (a === 'toggle') c.on = !c.on;
    if (a === 'w-') c.warn = Math.max(1, c.warn - 5);
    if (a === 'w+') c.warn = Math.min(c.end - 1, c.warn + 5);
    if (a === 'e-') { c.end = Math.max(5, c.end - 5); c.warn = Math.min(c.warn, c.end - 1); }
    if (a === 'e+') c.end = Math.min(240, c.end + 5);
    if (a === 'plus15') { st.bonus += 15; unlockGame(); }
    if (a === 'reset') { st.ms = 0; st.bonus = 0; unlockGame(); }
    if (a === 'done') {
      save();
      if (st.locked && c.on) lock(); else { unlockGame(); hide(); }
      return;
    }
    save();
    parentPanel();
  }
}

function unlockGame() {
  st.locked = false;
  st.ended = minutes() >= st.cfg.end + st.bonus;
  st.warned = minutes() >= st.cfg.warn + st.bonus;
  document.body.classList.remove('pt-locked');
  save();
}

function tick(dt) {
  newDay();
  if (!st.cfg.on) { if (st.locked) { unlockGame(); hide(); } return; }
  if (st.locked) { if (el.classList.contains('hidden')) lock(); return; }
  if (document.visibilityState !== 'visible' || countdown) return;
  st.ms += dt;
  const m = minutes();
  if (!st.ended && m >= st.cfg.end + st.bonus) startEnd();
  else if (!st.warned && m >= st.cfg.warn + st.bonus) warn();
  if (Date.now() - lastSave > 5000) { lastSave = Date.now(); save(); }
}

export function initPlaytime(opts) {
  api = opts;
  st = load();
  newDay();
  el = document.createElement('div');
  el.id = 'playtime';
  el.className = 'hidden';
  document.body.append(el);
  el.addEventListener('click', onClick);
  document.addEventListener('keydown', (e) => {
    if (!gate || el.classList.contains('hidden') || !el.querySelector('.ptpad')) return;
    if (/^[0-9]$/.test(e.key) && !(gate.wait > Date.now())) pinDigit(e.key);
    else if (e.key === 'Backspace') { gate.entry = gate.entry.slice(0, -1); renderPad(); }
  });
  // Wurde während des Countdowns neu geladen? Dann gleich sperren.
  if (st.cfg.on && (st.locked || (st.ended && minutes() >= st.cfg.end + st.bonus))) lock();
  let last = performance.now();
  setInterval(() => {
    const t = performance.now();
    tick(Math.min(5000, t - last));
    last = t;
  }, 1000);
  document.addEventListener('visibilitychange', () => { last = performance.now(); save(); });
}
