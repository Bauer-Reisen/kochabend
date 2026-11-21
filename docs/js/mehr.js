// Reiter „Mehr": App weitergeben, Fotos einsortieren, App-Hinweis, Rundgang, Name wechseln, Abmelden.
import { VERSION } from './config.js?v=0.4.1';
import { esc, toast } from './ui.js?v=0.4.1';
import { me } from './ctx.js?v=0.4.1';
import { installHint } from './home.js?v=0.4.1';

const APP_URL = 'https://bauer-reisen.github.io/kochabend/';
// Bewusst ohne den Code: den gebt ihr getrennt weiter (mündlich oder in einer eigenen Nachricht).
const SHARE_TEXT = 'Unser Kochabend-Tagebuch „In 80 Küchen um die Welt". Den Code zum Anmelden bekommst du von uns.';

export function renderMore(view) {
  const p = me();
  view.innerHTML = `
    <section class="page">
      <header class="ev-head">
        <p class="kicker">Mehr</p>
        <h1 class="title title-sm">Alles Weitere</h1>
      </header>
      <div class="card share-card">
        <h3>App weitergeben</h3>
        <p>Zum Scannen mit der Handy-Kamera – oder den Link schicken.</p>
        <img class="qr" src="icons/qr.svg?v=${VERSION}" alt="QR-Code zur App" width="200" height="200">
        <p class="center small"><a href="${APP_URL}">${APP_URL.replace('https://', '')}</a></p>
        <button type="button" class="btn btn-primary btn-wide" data-act="share">Link teilen</button>
        <button type="button" class="btn btn-wide" data-act="copy">Link kopieren</button>
        <p class="hint">Den gemeinsamen Code schickt die App nicht mit. Den sagt ihr am besten persönlich.</p>
      </div>
      <div class="card sort-card">
        <h3>Viele Fotos auf einmal</h3>
        <p>Wähle einfach alle Fotos aus – die App ordnet sie nach Aufnahmetag dem richtigen Abend zu.</p>
        <a class="btn btn-wide" href="#/einsortieren">Fotos einsortieren</a>
      </div>
      ${installHint()}
      <footer class="foot">
        <button type="button" class="link" data-act="tour">Rundgang ansehen</button>
        <button type="button" class="link" data-act="who">Ich bin nicht ${esc(p.name)}</button>
        <button type="button" class="link" data-act="logout">Abmelden</button>
        <p class="muted small">Version ${VERSION}</p>
      </footer>
    </section>`;

  const shareBtn = view.querySelector('[data-act=share]');
  if (!navigator.share) shareBtn.remove(); // z. B. am PC: dann nur „kopieren"
  shareBtn.addEventListener('click', async () => {
    try { await navigator.share({ title: 'In 80 Küchen um die Welt', text: SHARE_TEXT, url: APP_URL }); } catch { /* abgebrochen */ }
  });
  view.querySelector('[data-act=copy]').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(APP_URL); toast('Link kopiert'); } catch { toast(APP_URL, 5000); }
  });
}
