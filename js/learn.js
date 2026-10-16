// Vokabel-Trainer im Stil von Lern-Apps: kurze Lektionen, Sterne, Serie, Belohnungen für die Figuren.
import { UNITS } from './vocab.js';
import { charSVG } from './art.js';

export const REWARDS = [
  { id: 'kopfhoerer', key: 'hat', value: 'kopfhoerer', name: 'Kopfhörer', icon: '🎧', price: 2 },
  { id: 'herz', key: 'glasses', value: 'herz', name: 'Herzbrille', icon: '😍', price: 2 },
  { id: 'ninja', key: 'hat', value: 'ninja', name: 'Ninja-Stirnband', icon: '🥷', price: 3 },
  { id: 'pirat', key: 'hat', value: 'pirat', name: 'Piratenhut', icon: '🏴‍☠️', price: 3 },
  { id: 'stern', key: 'glasses', value: 'stern', name: 'Sternbrille', icon: '🤩', price: 3 },
  { id: 'gold', key: 'hc', value: '#ffd700', name: 'Goldene Haare', icon: '✨', price: 4 },
  { id: 'einhorn', key: 'hat', value: 'einhorn', name: 'Einhorn-Horn', icon: '🦄', price: 4 },
  { id: 'umhang', key: 'extra', value: 'umhang', name: 'Superhelden-Umhang', icon: '🦸', price: 5 },
  { id: 'regenbogen', key: 'hc', value: 'rainbow', name: 'Regenbogen-Haare', icon: '🌈', price: 5 },
  { id: 'helm', key: 'hat', value: 'helm', name: 'Astronautenhelm', icon: '👩‍🚀', price: 6 },
  { id: 'fluegel', key: 'extra', value: 'fluegel', name: 'Engelsflügel', icon: '🪽', price: 6 },
  { id: 'jetpack', key: 'extra', value: 'jetpack', name: 'Jetpack', icon: '🚀', price: 8 },
  { id: 'glitzer', key: 'extra', value: 'glitzer', name: 'Glitzer-Aura', icon: '💫', price: 8 },
];

/** Welche Editor-Option gehört zu welcher Belohnung? */
export function rewardFor(key, value) {
  return REWARDS.find((r) => r.key === key && r.value === value) || null;
}

const PRAISE = ['Super!', 'Klasse!', 'Genau!', 'Stark!', 'Richtig!', 'Wow!', 'Perfekt!', 'Spitze!'];
const CHEER = ['Du schaffst das! 💪', 'Weiter so! ⭐', 'Englisch-Profi! 🇬🇧', 'Fast geschafft! 🚀', 'Bleib dran! 🔥'];

const rand = (a) => a[Math.floor(Math.random() * a.length)];
const shuffle = (a) => {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};
const norm = (s) => s.toLowerCase().trim().replace(/\s+/g, ' ').replace(/[’']/g, "'");
const enMain = (w) => w[0].split('/')[0];
const enAll = (w) => w[0].split('/').map(norm);
const today = () => new Date().toISOString().slice(0, 10);

let api; // { getState, save, sfx, unlock, mascot, onTry }
let root;
let L; // state.learn

export function initLearn(opts) {
  api = opts;
  root = document.createElement('div');
  root.id = 'learn';
  root.className = 'hidden';
  document.body.append(root);
  root.addEventListener('click', onClick);
  ensureState();
}

function ensureState() {
  const st = api.getState();
  if (!st.learn) st.learn = { stars: 0, xp: 0, streak: 0, lastDay: '', unlocked: [], words: {}, lessons: {} };
  L = st.learn;
}

export function stars() {
  ensureState();
  return L.stars;
}

export function isUnlocked(id) {
  ensureState();
  return L.unlocked.includes(id);
}

function wkey(u, w) {
  return u.id + ':' + w[0];
}

function known(u) {
  return u.words.filter((w) => (L.words[wkey(u, w)] || {}).c >= 2).length;
}

// ---------------- Hub (Lernpfad & Belohnungen) ----------------
let tab = 'path';

export function open(which = 'path') {
  ensureState();
  tab = which;
  api.unlock();
  renderHub();
  root.classList.remove('hidden');
  document.body.classList.add('learn-open');
}

function close() {
  root.classList.add('hidden');
  document.body.classList.remove('learn-open');
  stopSpeech();
  api.onClose && api.onClose();
}

function streakAlive() {
  if (!L.lastDay) return 0;
  const d = (new Date(today()) - new Date(L.lastDay)) / 86400000;
  return d <= 1 ? L.streak : 0;
}

function header() {
  return `<div class="lhead">
    <button class="lbtn-x" data-act="close" aria-label="Schließen">✕</button>
    <div class="lstat"><span class="fire">🔥</span><b>${streakAlive()}</b><i>Tage</i></div>
    <div class="lstat"><span>⭐</span><b>${L.stars}</b><i>Sterne</i></div>
    <div class="lstat"><span>⚡</span><b>${L.xp}</b><i>XP</i></div>
  </div>
  <div class="ltabs"><button class="ltab${tab === 'path' ? ' sel' : ''}" data-act="tab" data-tab="path">📚 Lernen</button><button class="ltab${tab === 'shop' ? ' sel' : ''}" data-act="tab" data-tab="shop">🎁 Belohnungen</button></div>`;
}

function renderHub() {
  let body = '';
  if (tab === 'path') {
    body = `<div class="lpath">${UNITS.map((u, i) => {
      const k = known(u);
      const done = L.lessons[u.id] || 0;
      const pct = Math.round((k / u.words.length) * 100);
      const crowns = Math.min(5, done);
      return `<div class="lunit" style="--c:${u.color};--off:${[0, 60, 0, -60][i % 4]}px">
        <button class="lnode" data-act="start" data-unit="${u.id}"><span>${u.icon}</span>${crowns ? `<em>👑${crowns}</em>` : ''}</button>
        <div class="linfo"><b>${u.title}</b>${u.hint ? `<small>${u.hint}</small>` : ''}<div class="lbar"><i style="width:${pct}%"></i></div><small>${k} von ${u.words.length} Wörtern sicher · ${done} Lektion${done === 1 ? '' : 'en'}</small></div>
        <button class="lgo" data-act="start" data-unit="${u.id}">Los! ▶</button>
      </div>`;
    }).join('')}</div>`;
  } else {
    const look = api.previewLook();
    body = `<p class="lshopinfo">Löse Lektionen und sammle ⭐ – damit schaltest du coole Sachen für deine Figuren frei!</p>
    <div class="lshop">${REWARDS.map((r) => {
      const have = L.unlocked.includes(r.id);
      const can = L.stars >= r.price;
      return `<div class="lreward${have ? ' have' : ''}">
        <div class="lprev">${charSVG({ ...look, [r.key]: r.value }, false).replace('viewBox="0 0 120 210" width="120" height="210"', 'viewBox="-20 -60 160 280" width="110" height="150"')}</div>
        <b>${r.icon} ${r.name}</b>
        ${have ? `<button class="lbuy try" data-act="try" data-id="${r.id}">Anziehen</button>`
        : `<button class="lbuy${can ? '' : ' no'}" data-act="buy" data-id="${r.id}">${can ? 'Freischalten' : '🔒'} · ${r.price} ⭐</button>`}
      </div>`;
    }).join('')}</div>`;
  }
  root.innerHTML = `<div class="lwrap">${header()}${body}</div>`;
}

// ---------------- Lektion ----------------
let lesson = null;

function pickWords(u, n) {
  const scored = u.words.map((w) => {
    const r = L.words[wkey(u, w)] || { c: 0, w: 0 };
    return { w, s: r.c - r.w * 1.5 + Math.random() * 1.5 };
  });
  scored.sort((a, b) => a.s - b.s);
  return scored.slice(0, n).map((x) => x.w);
}

function buildLesson(u) {
  const words = pickWords(u, 6);
  const single = words.filter((w) => !enMain(w).includes(' ') && enMain(w).length <= 11);
  const canSpeak = 'speechSynthesis' in window;
  const ex = [];
  ex.push({ t: 'de2en', w: words[0] });
  ex.push(single[0] ? { t: 'tiles', w: single[0] } : { t: 'en2de', w: words[1] });
  ex.push({ t: 'en2de', w: words[1] });
  ex.push(canSpeak ? { t: 'listen', w: words[2] } : { t: 'de2en', w: words[2] });
  ex.push({ t: 'pairs', ws: shuffle(words).slice(0, 4) });
  ex.push(single[1] ? { t: 'type', w: single[1] } : { t: 'de2en', w: words[3] });
  ex.push({ t: 'de2en', w: words[4] });
  ex.push(single[2] ? { t: 'tiles', w: single[2] } : { t: 'en2de', w: words[5] });
  return { u, ex, i: 0, mistakes: 0, correct: 0, requeued: 0, answered: false };
}

function startLesson(uid) {
  const u = UNITS.find((x) => x.id === uid);
  lesson = buildLesson(u);
  api.sfx.whooshUp ? api.sfx.whooshUp() : api.sfx.whoosh();
  renderEx();
}

function distractors(u, w, n, field) {
  const pool = u.words.filter((x) => x !== w).map((x) => (field === 'en' ? enMain(x) : x[1]));
  return shuffle([...new Set(pool)]).slice(0, n);
}

function speak(text) {
  try {
    const s = window.speechSynthesis;
    s.cancel();
    const ut = new SpeechSynthesisUtterance(text);
    ut.lang = 'en-GB';
    const v = s.getVoices().find((x) => /en-GB/i.test(x.lang)) || s.getVoices().find((x) => /^en/i.test(x.lang));
    if (v) ut.voice = v;
    ut.rate = 0.85;
    ut.volume = api.voiceVol ? api.voiceVol() : 1;
    s.speak(ut);
  } catch (e) { /* keine Sprachausgabe */ }
}
function stopSpeech() {
  try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) { /* egal */ }
}

function mascotBubble(text) {
  return `<div class="lmascot">${api.mascotSVG()}<div class="lbubble">${text}</div></div>`;
}

function renderEx() {
  const L2 = lesson;
  const e = L2.ex[L2.i];
  L2.answered = false;
  L2.sel = null;
  const total = L2.ex.length;
  const prog = Math.round((L2.i / total) * 100);
  let q = '';
  let body = '';
  const u = L2.u;
  if (e.t === 'de2en' || e.t === 'en2de' || e.t === 'listen') {
    const w = e.w;
    const toEn = e.t !== 'en2de';
    const right = toEn ? enMain(w) : w[1];
    const opts = shuffle([right, ...distractors(u, w, 3, toEn ? 'en' : 'de')]);
    e.right = right;
    if (e.t === 'listen') {
      q = 'Hör genau hin! Was hörst du?';
      body = `<button class="lspeak big" data-act="say" data-say="${enMain(w)}">🔊</button>`;
      setTimeout(() => speak(enMain(w)), 350);
    } else if (toEn) {
      q = 'Wie heißt das auf Englisch?';
      body = `<div class="lcard"><span class="lemo">${w[2]}</span><b>${w[1]}</b></div>`;
    } else {
      q = 'Was bedeutet das?';
      body = `<div class="lcard"><span class="lemo">${w[2]}</span><b>${enMain(w)}</b><button class="lspeak" data-act="say" data-say="${enMain(w)}">🔊</button></div>`;
    }
    body += `<div class="lopts">${opts.map((o) => `<button class="lopt" data-act="pick" data-v="${encodeURIComponent(o)}">${o}</button>`).join('')}</div>`;
  } else if (e.t === 'tiles') {
    const word = enMain(e.w);
    e.right = word;
    const extra = shuffle('abcdeilmnorstu'.split('').filter((c) => !word.includes(c))).slice(0, 2);
    e.tiles = shuffle([...word.split(''), ...extra]).map((ch, i) => ({ ch, i, used: false }));
    e.built = [];
    q = 'Bau das englische Wort!';
    body = `<div class="lcard"><span class="lemo">${e.w[2]}</span><b>${e.w[1]}</b></div><div class="lbuilt"></div><div class="ltiles"></div>`;
  } else if (e.t === 'type') {
    e.right = enMain(e.w);
    q = 'Schreib es auf Englisch!';
    body = `<div class="lcard"><span class="lemo">${e.w[2]}</span><b>${e.w[1]}</b></div>
      <input class="linput" type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="Englisches Wort …">`;
  } else if (e.t === 'pairs') {
    q = 'Finde die Paare!';
    e.left = shuffle(e.ws.map((w) => ({ k: w[0], txt: enMain(w) })));
    e.right2 = shuffle(e.ws.map((w) => ({ k: w[0], txt: w[1] })));
    e.done = [];
    body = `<div class="lpairs"><div class="lcol">${e.left.map((x) => `<button class="lopt lp" data-act="pair" data-side="L" data-k="${encodeURIComponent(x.k)}">${x.txt}</button>`).join('')}</div>
      <div class="lcol">${e.right2.map((x) => `<button class="lopt lp" data-act="pair" data-side="R" data-k="${encodeURIComponent(x.k)}">${x.txt}</button>`).join('')}</div></div>`;
  }
  root.innerHTML = `<div class="lwrap lesson">
    <div class="ltop"><button class="lbtn-x" data-act="quit" aria-label="Lektion beenden">✕</button><div class="lprog"><i style="width:${prog}%"></i></div><span class="lunitname" style="color:${u.color}">${u.icon}</span></div>
    <h2 class="lq">${q}</h2>
    <div class="lbody">${body}</div>
    ${L2.i === 0 ? mascotBubble(rand(['Los geht\'s! 🚀', 'Auf die Plätze, fertig, Englisch! 🇬🇧', 'Ich glaub an dich! 💪'])) : (L2.i === 4 ? mascotBubble(rand(CHEER)) : '')}
    <div class="lfoot"><div class="lfeedback"></div><button class="lcheck" data-act="check" ${e.t === 'pairs' ? 'style="visibility:hidden"' : 'disabled'}>PRÜFEN</button></div>
  </div>`;
  if (e.t === 'tiles') renderTiles();
  if (e.t === 'type') {
    const inp = root.querySelector('.linput');
    inp.addEventListener('input', () => { root.querySelector('.lcheck').disabled = !inp.value.trim(); });
    inp.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' && inp.value.trim()) check(); });
    setTimeout(() => inp.focus(), 200);
  }
}

function renderTiles() {
  const e = lesson.ex[lesson.i];
  root.querySelector('.lbuilt').innerHTML = e.built.map((t, k) => `<button class="ltile" data-act="unbuild" data-k="${k}">${t.ch}</button>`).join('') || '<span class="lph">Tippe die Buchstaben an</span>';
  root.querySelector('.ltiles').innerHTML = e.tiles.map((t) => `<button class="ltile${t.used ? ' used' : ''}" data-act="build" data-i="${t.i}">${t.ch}</button>`).join('');
  root.querySelector('.lcheck').disabled = !e.built.length;
}

function answerText() {
  const e = lesson.ex[lesson.i];
  if (e.t === 'tiles') return e.built.map((t) => t.ch).join('');
  if (e.t === 'type') return root.querySelector('.linput').value;
  return lesson.sel;
}

function isRight(e, ans) {
  if (ans == null) return false;
  if (e.t === 'en2de') return ans === e.right;
  if (e.t === 'tiles' || e.t === 'type') return enAll(e.w).includes(norm(ans));
  return enAll(e.w).includes(norm(ans)) || ans === e.right;
}

function record(w, ok) {
  const k = wkey(lesson.u, w);
  const r = L.words[k] || { c: 0, w: 0 };
  if (ok) r.c++; else r.w++;
  L.words[k] = r;
}

function check() {
  const e = lesson.ex[lesson.i];
  if (lesson.answered) return next();
  const ans = answerText();
  const ok = isRight(e, ans);
  lesson.answered = true;
  record(e.w, ok);
  const fb = root.querySelector('.lfeedback');
  const foot = root.querySelector('.lfoot');
  const btn = root.querySelector('.lcheck');
  root.querySelectorAll('.lopt, .ltile, .linput').forEach((b) => (b.disabled = true));
  if (ok) {
    lesson.correct++;
    foot.classList.add('ok');
    fb.innerHTML = `<b>✓ ${rand(PRAISE)}</b>`;
    api.sfx.ding();
    speak(enMain(e.w));
    root.querySelectorAll('.lopt.sel').forEach((b) => b.classList.add('right'));
  } else {
    lesson.mistakes++;
    foot.classList.add('bad');
    fb.innerHTML = `<b>✗ Nicht ganz!</b><span>Richtig: <strong>${e.t === 'en2de' ? e.w[1] : enMain(e.w)}</strong>${e.t !== 'en2de' ? ` = ${e.w[1]}` : ''}</span>`;
    api.sfx.boing();
    root.querySelectorAll('.lopt').forEach((b) => {
      const v = decodeURIComponent(b.dataset.v || '');
      if (v && (v === e.right || enAll(e.w).includes(norm(v)))) b.classList.add('right');
      else if (b.classList.contains('sel')) b.classList.add('wrong');
    });
    // falsche Wörter kommen am Ende noch einmal (wie bei Lern-Apps)
    if (lesson.requeued < 3) {
      lesson.ex.push({ t: e.t === 'en2de' ? 'en2de' : 'de2en', w: e.w });
      lesson.requeued++;
    }
  }
  btn.textContent = 'WEITER';
  btn.disabled = false;
  api.save();
}

function next() {
  lesson.i++;
  if (lesson.i >= lesson.ex.length) return finish();
  renderEx();
}

function finish() {
  const u = lesson.u;
  const earned = lesson.mistakes === 0 ? 3 : lesson.mistakes <= 2 ? 2 : 1;
  const xp = lesson.correct * 5 + (lesson.mistakes === 0 ? 10 : 0);
  L.stars += earned;
  L.xp += xp;
  L.lessons[u.id] = (L.lessons[u.id] || 0) + 1;
  const t = today();
  if (L.lastDay !== t) {
    const d = L.lastDay ? (new Date(t) - new Date(L.lastDay)) / 86400000 : 99;
    L.streak = d === 1 ? L.streak + 1 : 1;
    L.lastDay = t;
  }
  api.save();
  api.sfx.trumpet();
  setTimeout(() => api.sfx.sparkle(), 500);
  const acc = Math.round((lesson.correct / (lesson.correct + lesson.mistakes)) * 100);
  const affordable = REWARDS.filter((r) => !L.unlocked.includes(r.id) && L.stars >= r.price);
  root.innerHTML = `<div class="lwrap lresult">
    <div class="lconfetti">${Array.from({ length: 40 }, (_, i) => `<i style="--x:${Math.random() * 100}%;--d:${Math.random() * 1.2}s;--c:${['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#ff6fb5', '#9b5de5'][i % 6]}"></i>`).join('')}</div>
    <h1>Lektion geschafft! 🎉</h1>
    <div class="lstars">${[1, 2, 3].map((n) => `<span class="${n <= earned ? 'on' : ''}" style="animation-delay:${n * 0.25}s">⭐</span>`).join('')}</div>
    <div class="lsum"><div><b>+${earned}</b><i>Sterne</i></div><div><b>+${xp}</b><i>XP</i></div><div><b>${acc}%</b><i>richtig</i></div><div><b>🔥 ${streakAlive()}</b><i>Tage-Serie</i></div></div>
    ${mascotBubble(earned === 3 ? 'Perfekt! Keinen einzigen Fehler! 🏆' : earned === 2 ? 'Richtig gut gemacht! 💪' : 'Übung macht den Meister! 🌱')}
    ${affordable.length ? `<p class="lnew">Du kannst jetzt <b>${affordable[0].icon} ${affordable[0].name}</b> freischalten!</p>` : ''}
    <div class="lres-btns"><button class="lbig alt" data-act="again" data-unit="${u.id}">Noch eine Lektion</button><button class="lbig" data-act="tab" data-tab="shop">🎁 Belohnungen</button></div>
  </div>`;
  lesson = null;
}

function buy(id) {
  const r = REWARDS.find((x) => x.id === id);
  if (!r || L.unlocked.includes(id)) return;
  if (L.stars < r.price) {
    api.sfx.boing();
    flashMsg(`Dir fehlen noch ${r.price - L.stars} ⭐ – mach eine Lektion!`);
    return;
  }
  L.stars -= r.price;
  L.unlocked.push(id);
  api.save();
  api.sfx.sparkle();
  setTimeout(() => api.sfx.trumpet(), 300);
  const look = api.previewLook();
  root.innerHTML = `<div class="lwrap lresult">
    <div class="lconfetti">${Array.from({ length: 40 }, (_, i) => `<i style="--x:${Math.random() * 100}%;--d:${Math.random() * 1.2}s;--c:${['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#ff6fb5', '#9b5de5'][i % 6]}"></i>`).join('')}</div>
    <h1>Freigeschaltet! ${r.icon}</h1>
    <div class="lunlock">${charSVG({ ...look, [r.key]: r.value }, false).replace('viewBox="0 0 120 210" width="120" height="210"', 'viewBox="-30 -70 180 300" width="220" height="300"')}</div>
    <p class="lnew"><b>${r.name}</b> gibt es jetzt im Figuren-Editor.</p>
    <div class="lres-btns"><button class="lbig alt" data-act="tab" data-tab="shop">Zurück zum Shop</button><button class="lbig" data-act="try" data-id="${r.id}">Gleich anziehen ✨</button></div>
  </div>`;
}

function flashMsg(t) {
  const m = document.createElement('div');
  m.className = 'lflash';
  m.textContent = t;
  root.append(m);
  setTimeout(() => m.remove(), 2200);
}

function onClick(ev) {
  const b = ev.target.closest('[data-act]');
  if (!b || b.disabled) return;
  api.unlock();
  const act = b.dataset.act;
  if (act === 'close') return close();
  if (act === 'tab') { tab = b.dataset.tab; api.sfx.click(); return renderHub(); }
  if (act === 'start' || act === 'again') return startLesson(b.dataset.unit);
  if (act === 'quit') { lesson = null; stopSpeech(); api.sfx.click(); return renderHub(); }
  if (act === 'say') return speak(b.dataset.say);
  if (act === 'buy') return buy(b.dataset.id);
  if (act === 'try') { const r = REWARDS.find((x) => x.id === b.dataset.id); close(); return api.onTry(r); }
  if (!lesson) return;
  const e = lesson.ex[lesson.i];
  if (act === 'check') return check();
  if (lesson.answered) return;
  if (act === 'pick') {
    lesson.sel = decodeURIComponent(b.dataset.v);
    root.querySelectorAll('.lopt').forEach((x) => x.classList.toggle('sel', x === b));
    root.querySelector('.lcheck').disabled = false;
    api.sfx.click();
    if (e.t === 'de2en' || e.t === 'listen') speak(lesson.sel);
  } else if (act === 'build') {
    const t = e.tiles.find((x) => x.i === +b.dataset.i);
    if (t.used) return;
    t.used = true;
    e.built.push(t);
    api.sfx.click();
    renderTiles();
  } else if (act === 'unbuild') {
    const t = e.built.splice(+b.dataset.k, 1)[0];
    t.used = false;
    renderTiles();
  } else if (act === 'pair') {
    if (b.classList.contains('done')) return;
    const side = b.dataset.side;
    const prev = root.querySelector(`.lp.sel[data-side="${side === 'L' ? 'R' : 'L'}"]`);
    root.querySelectorAll(`.lp.sel[data-side="${side}"]`).forEach((x) => x.classList.remove('sel'));
    b.classList.add('sel');
    if (side === 'L') speak(b.textContent);
    if (!prev) { api.sfx.click(); return; }
    if (prev.dataset.k === b.dataset.k) {
      [prev, b].forEach((x) => { x.classList.remove('sel'); x.classList.add('done'); });
      e.done.push(b.dataset.k);
      const w = e.ws.find((x) => x[0] === decodeURIComponent(b.dataset.k));
      record(w, true);
      api.sfx.pop();
      if (e.done.length === e.ws.length) {
        lesson.correct++;
        lesson.answered = true;
        const foot = root.querySelector('.lfoot');
        foot.classList.add('ok');
        root.querySelector('.lfeedback').innerHTML = `<b>✓ ${rand(PRAISE)} Alle Paare gefunden!</b>`;
        const btn = root.querySelector('.lcheck');
        btn.style.visibility = 'visible';
        btn.disabled = false;
        btn.textContent = 'WEITER';
        api.sfx.ding();
        api.save();
      }
    } else {
      [prev, b].forEach((x) => { x.classList.add('wrong'); setTimeout(() => x.classList.remove('wrong', 'sel'), 450); });
      lesson.mistakes++;
      api.sfx.boing();
    }
  }
}
