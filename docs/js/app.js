// Einstieg der App: Code eingeben → Name wählen → Startseite.
import { VERSION, APP_NAME } from './config.js?v=0.1.1';
import { store, login, loggedIn, logout, getPeople, ApiError } from './api.js?v=0.1.1';
import { esc, dialog, toast } from './ui.js?v=0.1.1';
import { runTour } from './tour.js?v=0.1.1';
import { unseen, showNews, NEWS } from './news.js?v=0.1.1';

const view = document.getElementById('view');
let people = null; // { couples, persons } vom Worker

const me = () => people?.persons.find((p) => p.id === store.get('person')) || null;
const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const isIos = () => /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

// Kleines Schmuckelement: Teller mit Besteck
const ornament = `
  <svg class="ornament" viewBox="0 0 120 40" aria-hidden="true">
    <path d="M4 20h30M86 20h30" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
    <circle cx="60" cy="20" r="14" fill="none" stroke="currentColor" stroke-width="1.4"/>
    <circle cx="60" cy="20" r="9" fill="none" stroke="currentColor" stroke-width="0.8" opacity=".6"/>
    <path d="M40 8v8a3 3 0 0 0 3 3v13M43 8v7M46 8v8a3 3 0 0 1-3 3" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M78 8c-3 3-3 10 0 12v12" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
  </svg>`;

// ---------- 1. Code eingeben ----------
function showLogin(message = '') {
  view.innerHTML = `
    <section class="gate">
      <p class="kicker">Unser Kochabend-Tagebuch</p>
      <h1 class="title title-name"><span class="tn-small">In</span> 80 Küchen <span class="tn-line">um die Welt</span></h1>
      ${ornament}
      <p class="lead">Drei Paare, ein Land, drei Abende.</p>
      <form class="card form" id="login" novalidate>
        <label for="code">Unser gemeinsamer Code</label>
        <input id="code" name="code" type="password" autocomplete="current-password" autocapitalize="none" spellcheck="false" required>
        <p class="error" role="alert">${esc(message)}</p>
        <button class="btn btn-primary btn-wide" type="submit">Weiter</button>
        <p class="hint">Den Code kennen nur wir sechs. Du gibst ihn auf diesem Handy nur einmal ein.</p>
      </form>
    </section>`;
  const form = view.querySelector('#login');
  const input = form.querySelector('#code');
  input.focus();
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button');
    const err = form.querySelector('.error');
    if (!input.value.trim()) { err.textContent = 'Bitte den Code eingeben.'; return; }
    btn.disabled = true; btn.textContent = 'Prüfe …'; err.textContent = '';
    try {
      await login(input.value);
      await start();
    } catch (ex) {
      err.textContent = ex.message;
      btn.disabled = false; btn.textContent = 'Weiter';
      input.select();
    }
  });
}

// ---------- 2. Wer bist du? ----------
function showWho() {
  view.innerHTML = `
    <section class="gate">
      <p class="kicker">Fast geschafft</p>
      <h1 class="title title-sm">Wer bist du?</h1>
      ${ornament}
      <div class="who">
        ${people.couples.map((c) => `
          <div class="who-couple">
            ${people.persons.filter((p) => p.couple === c.id).map((p) => `
              <button type="button" class="who-btn" data-id="${esc(p.id)}">${esc(p.name)}</button>`).join('<span class="amp" aria-hidden="true">&amp;</span>')}
          </div>`).join('')}
      </div>
      <p class="hint center">Das merkt sich dieses Handy. Ändern kannst du es unten auf der Startseite.</p>
    </section>`;
  view.querySelectorAll('.who-btn').forEach((b) => b.addEventListener('click', async () => {
    const first = !store.get('person') && !store.get('tourSeen');
    store.set('person', b.dataset.id);
    showHome();
    if (first) {
      await runTour(me()?.name);
      store.set('tourSeen', '1');
      store.set('newsSeen', NEWS[0]?.v || VERSION);
    }
  }));
}

// ---------- 3. Startseite ----------
function showHome() {
  const p = me();
  if (!p) return showWho();
  const couple = people.couples.find((c) => c.id === p.couple);
  const installHint = standalone() ? '' : `
    <div class="card install">
      <h3>Als App auf den Home-Bildschirm</h3>
      ${isIos()
        ? '<p>In Safari unten auf das <strong>Teilen-Symbol</strong> <span class="ios-share" aria-hidden="true"></span> tippen, dann <strong>„Zum Home-Bildschirm“</strong>.</p>'
        : '<p>Im Browser-Menü <strong>⋮</strong> auf <strong>„App installieren“</strong> oder <strong>„Zum Startbildschirm hinzufügen“</strong> tippen.</p>'}
    </div>`;
  view.innerHTML = `
    <section class="home">
      <header class="home-head">
        <p class="kicker">${esc(APP_NAME)}</p>
        <h1 class="title title-sm">Hallo ${esc(p.name)}!</h1>
        <p class="muted">${esc(couple?.name || '')}</p>
      </header>
      ${ornament}
      <div class="card soon">
        <h2>Hier entsteht euer Tagebuch</h2>
        <p>Als Nächstes kommen dazu:</p>
        <ol class="soon-list">
          <li><strong>Runden &amp; Termine</strong> – wer ist wann dran, Terminfinder, Kalender-Abo</li>
          <li><strong>Füttern</strong> – Fotos, Sprüche, Menü</li>
          <li><strong>Das schöne Tagebuch</strong> zum Durchblättern</li>
          <li><strong>Rezepte</strong> und Ideen je Land</li>
          <li><strong>Abstimmung</strong> fürs nächste Land</li>
        </ol>
      </div>
      ${installHint}
      <footer class="foot">
        <button type="button" class="link" data-act="tour">Rundgang ansehen</button>
        <button type="button" class="link" data-act="who">Ich bin nicht ${esc(p.name)}</button>
        <button type="button" class="link" data-act="logout">Abmelden</button>
        <p class="muted small">Version ${VERSION}</p>
      </footer>
    </section>`;
  view.querySelector('[data-act=tour]').addEventListener('click', () => runTour());
  view.querySelector('[data-act=who]').addEventListener('click', () => showWho());
  view.querySelector('[data-act=logout]').addEventListener('click', async () => {
    const r = await dialog({
      title: 'Abmelden?',
      body: '<p>Danach musst du auf diesem Handy den gemeinsamen Code neu eingeben.</p>',
      buttons: [{ label: 'Abbrechen', value: 'no' }, { label: 'Abmelden', value: 'yes', primary: true }],
    });
    if (r?.value === 'yes') { logout(); people = null; showLogin(); }
  });
}

// ---------- Ablauf ----------
async function start() {
  if (!loggedIn()) return showLogin();
  try {
    people = await getPeople();
  } catch (ex) {
    if (ex instanceof ApiError && ex.status === 401) return showLogin('Bitte gib den Code noch einmal ein.');
    view.innerHTML = `
      <section class="gate">
        <h1 class="title title-sm">Gerade keine Verbindung</h1>
        ${ornament}
        <p class="lead">${esc(ex.message)}</p>
        <button type="button" class="btn btn-primary" id="retry">Nochmal versuchen</button>
      </section>`;
    view.querySelector('#retry').addEventListener('click', start);
    return;
  }
  if (!me()) return showWho();
  showHome();
  // Nach einem Update einmal zeigen, was neu ist
  const list = unseen(store.get('newsSeen'));
  if (list.length && store.get('tourSeen')) {
    await showNews(list);
    store.set('newsSeen', NEWS[0].v);
  }
}

// ---------- Update-Prüfung (wie in der Film-App) ----------
// Handys heben die Seite eine Weile auf. Beim Öffnen und beim Zurückkehren
// in die App fragen wir kurz nach, ob es eine neue Version gibt, und laden sie.
async function checkForUpdate() {
  if (location.hostname === 'localhost') return;
  try {
    const res = await fetch(`version.json?t=${Date.now()}`, { cache: 'no-store' });
    const { version } = await res.json();
    if (!version || version === VERSION) return;
    const key = 'kochabend.reloadedFor';
    if (sessionStorage.getItem(key) === version) return; // nie endlos neu laden
    sessionStorage.setItem(key, version);
    location.replace(`${location.pathname}?v=${version}${location.hash}`);
  } catch { /* offline – egal */ }
}
checkForUpdate();
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') checkForUpdate(); });

start().catch((ex) => { console.error(ex); toast('Da ist etwas schiefgelaufen.'); });
