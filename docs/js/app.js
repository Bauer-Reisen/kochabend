// Einstieg der App: Code eingeben → Name wählen → Seiten (Startseite, Abend, Ideen, Einsortieren).
import { VERSION } from './config.js?v=0.3.2';
import { store, login, loggedIn, logout, getPeople, getState, ApiError } from './api.js?v=0.3.2';
import { esc, dialog, toast } from './ui.js?v=0.3.2';
import { runTour } from './tour.js?v=0.3.2';
import { unseen, showNews, NEWS } from './news.js?v=0.3.2';
import { ctx, me } from './ctx.js?v=0.3.2';
import { ornament } from './ornament.js?v=0.3.2';
import { renderHome } from './home.js?v=0.3.2';
import { renderEvening } from './evening.js?v=0.3.2';
import { renderIdeas } from './ideas.js?v=0.3.2';
import { renderSort } from './sort.js?v=0.3.2';
import { renderMore } from './mehr.js?v=0.3.2';
import { renderDates } from './termine.js?v=0.3.2';
import { renderTabs, hideTabs } from './tabs.js?v=0.3.2';
import { renderBook, renderChapter } from './tagebuch.js?v=0.3.2';
import { qAll, onQueueChange, flush } from './photos.js?v=0.3.2';

const view = document.getElementById('view');

// ---------- 1. Code eingeben ----------
function showLogin(message = '') {
  hideTabs();
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
  hideTabs();
  const { couples, persons } = ctx.people;
  view.innerHTML = `
    <section class="gate">
      <p class="kicker">Fast geschafft</p>
      <h1 class="title title-sm">Wer bist du?</h1>
      ${ornament}
      <div class="who">
        ${couples.map((c) => `
          <div class="who-couple">
            <p class="who-couple-name">${esc(c.name)}</p>
            <div class="who-pair">
              ${persons.filter((p) => p.couple === c.id).map((p) => `
                <button type="button" class="who-btn" data-id="${esc(p.id)}">${esc(p.name)}</button>`).join('')}
            </div>
          </div>`).join('')}
      </div>
      <p class="hint center">Tippe auf <strong>deinen eigenen Namen</strong>. Das merkt sich dieses Handy. Ändern kannst du es jederzeit unten auf der Startseite („Ich bin nicht …“).</p>
    </section>`;
  view.querySelectorAll('.who-btn').forEach((b) => b.addEventListener('click', async () => {
    store.set('person', b.dataset.id);
    await route(true);
    await tourIfNew();
  }));
}

// Rundgang, solange er nicht bis zum Ende angesehen oder bewusst übersprungen wurde.
// Wird die App mittendrin geschlossen, kommt er beim nächsten Öffnen wieder.
async function tourIfNew() {
  if (store.get('tourSeen')) return false;
  await runTour(me()?.name);
  store.set('tourSeen', '1');
  store.set('newsSeen', NEWS[0]?.v || VERSION);
  return true;
}

// ---------- Seiten ----------
let busy = false;
async function route(fresh = false) {
  if (!me()) return showWho();
  if (busy) return;
  busy = true;
  try {
    if (fresh || !ctx.state) ctx.state = await getState();
    const [, page, a, b, c] = (location.hash || '#/').split('/');
    if (page === 'abend' && a) await renderEvening(view, a, b, (refreshState) => reloadEvening(a, refreshState));
    else if (page === 'ideen' && a) await renderIdeas(view, a, b || '', c || '');
    else if (page === 'einsortieren') renderSort(view);
    else if (page === 'tagebuch' && a) await renderChapter(view, a);
    else if (page === 'tagebuch') renderBook(view);
    else if (page === 'termine') renderDates(view);
    else if (page === 'mehr') { renderMore(view); wireHome(); }
    else { renderHome(view); wireHome(); }
    renderTabs(page || '');
    queueBanner();
  } catch (ex) {
    handleError(ex);
  } finally {
    busy = false;
  }
}

async function reloadEvening(id, refreshState = false) {
  if (refreshState) ctx.state = await getState().catch(() => ctx.state);
  const [, page, a] = (location.hash || '#/').split('/');
  if (page === 'abend' && a === id) {
    const y = scrollY;
    await renderEvening(view, id, '', (r) => reloadEvening(id, r));
    scrollTo(0, y);
  }
}

function wireHome() {
  view.querySelector('[data-act=tour]')?.addEventListener('click', () => runTour());
  view.querySelector('[data-act=who]')?.addEventListener('click', () => showWho());
  view.querySelector('[data-act=logout]')?.addEventListener('click', async () => {
    const r = await dialog({
      title: 'Abmelden?',
      body: '<p>Danach musst du auf diesem Handy den gemeinsamen Code neu eingeben.</p>',
      buttons: [{ label: 'Abbrechen', value: 'no' }, { label: 'Abmelden', value: 'yes', primary: true }],
    });
    if (r?.value === 'yes') { logout(); ctx.people = null; ctx.state = null; showLogin(); }
  });
}

// Hinweis „3 Fotos warten" oben auf der Startseite
async function queueBanner(items) {
  const box = document.getElementById('queue');
  if (!box) return;
  items = items || (await qAll().catch(() => []));
  box.innerHTML = items.length
    ? `<div class="card wait"><p><strong>${items.length} Foto${items.length > 1 ? 's' : ''} warten aufs Hochladen.</strong> Das passiert von selbst, sobald Netz da ist und die App offen ist.</p><button type="button" class="btn btn-small" id="retry-up">Jetzt versuchen</button></div>`
    : '';
  box.querySelector('#retry-up')?.addEventListener('click', () => flush());
}
onQueueChange((items) => queueBanner(items));

function handleError(ex) {
  if (ex instanceof ApiError && ex.status === 401) return showLogin('Bitte gib den Code noch einmal ein.');
  view.innerHTML = `
    <section class="gate">
      <h1 class="title title-sm">Gerade keine Verbindung</h1>
      ${ornament}
      <p class="lead">${esc(ex.message)}</p>
      <button type="button" class="btn btn-primary" id="retry">Nochmal versuchen</button>
    </section>`;
  view.querySelector('#retry').addEventListener('click', start);
}

// ---------- Ablauf ----------
async function start() {
  if (!loggedIn()) return showLogin();
  try {
    ctx.people = await getPeople();
  } catch (ex) {
    return handleError(ex);
  }
  if (!me()) return showWho();
  await route(true);
  flush();
  if (await tourIfNew()) return;
  const list = unseen(store.get('newsSeen'));
  if (list.length) {
    await showNews(list);
    store.set('newsSeen', NEWS[0].v);
  }
}

addEventListener('hashchange', () => { scrollTo(0, 0); route(); });

// ---------- Update-Prüfung (wie in der Film-App) ----------
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
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  checkForUpdate();
  const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || '');
  if (ctx.people && me() && !document.querySelector('dialog[open]') && !typing) {
    const y = scrollY;
    route(true).then(() => scrollTo(0, y));
  }
});

start().catch((ex) => { console.error(ex); toast('Da ist etwas schiefgelaufen.'); });
