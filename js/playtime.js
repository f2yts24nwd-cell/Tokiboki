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

// ---------- Eltern-Bereich (mit Rechenaufgabe gesichert) ----------
let gate = null;
export function openParents(fromSettings = false) {
  const a = 200 + Math.floor(Math.random() * 600);
  const b = 100 + Math.floor(Math.random() * 300);
  gate = { sum: a + b, fromSettings };
  show(`<div class="ptbig">👪</div><h2>Nur für Eltern</h2><p>Bitte rechnen: <b>${a} + ${b}</b> = ?</p>
    <input type="number" inputmode="numeric" class="ptin" autocomplete="off">
    <div><button class="btn" data-pt="${fromSettings ? 'close' : 'back'}">Abbrechen</button><button class="btn primary" data-pt="gate">OK</button></div>`);
  setTimeout(() => el.querySelector('.ptin') && el.querySelector('.ptin').focus(), 100);
}
function parentPanel() {
  const c = st.cfg;
  const used = Math.floor(minutes());
  show(`<h2>⏱️ Spielzeit</h2>
    <p>Heute gespielt: <b>${used} Min.</b>${st.bonus ? ` (heute +${st.bonus} Min. extra)` : ''}</p>
    <button class="btn" data-pt="toggle">${c.on ? '✅ Begrenzung ist an' : '⛔ Begrenzung ist aus'}</button>
    <div class="ptrow"><span>Warnung nach</span><button class="btn" data-pt="w-">−</button><b>${c.warn} Min.</b><button class="btn" data-pt="w+">＋</button></div>
    <div class="ptrow"><span>Ende nach</span><button class="btn" data-pt="e-">−</button><b>${c.end} Min.</b><button class="btn" data-pt="e+">＋</button></div>
    <div><button class="btn" data-pt="plus15">➕ Heute 15 Min. mehr</button><button class="btn" data-pt="reset">🔄 Heutige Zeit auf 0</button></div>
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
  else if (a === 'back') lock();
  else if (a === 'close') hide();
  else if (a === 'gate') {
    const v = +el.querySelector('.ptin').value;
    if (v === gate.sum) parentPanel();
    else { api.sfx.boing(); el.querySelector('.ptin').value = ''; el.querySelector('.ptin').classList.add('bad'); }
  } else {
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
  el.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.classList.contains('ptin')) el.querySelector('[data-pt="gate"]').click(); });
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
