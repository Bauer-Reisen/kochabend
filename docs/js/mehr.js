// Reiter „Mehr": Fotos einsortieren, App-Hinweis, Rundgang, Name wechseln, Abmelden.
import { VERSION } from './config.js?v=0.3.5';
import { esc } from './ui.js?v=0.3.5';
import { me } from './ctx.js?v=0.3.5';
import { installHint } from './home.js?v=0.3.5';

export function renderMore(view) {
  const p = me();
  view.innerHTML = `
    <section class="page">
      <header class="ev-head">
        <p class="kicker">Mehr</p>
        <h1 class="title title-sm">Alles Weitere</h1>
      </header>
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
}
