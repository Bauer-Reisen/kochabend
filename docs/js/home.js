// Startseite: die laufende Runde mit ihren drei Abenden, der aktuelle Abend groß.
import { APP_NAME } from './config.js?v=0.3.2';
import { esc } from './ui.js?v=0.3.2';
import { ctx, me, coupleName, fmtDate, fmtShort, todayIso, currentEvening } from './ctx.js?v=0.3.2';
import { kueche } from './kuechen.js?v=0.3.2';
import { ornament } from './ornament.js?v=0.3.2';

const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const isIos = () => /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

export const installHint = () => (standalone() ? '' : `
    <div class="card install">
      <h3>Als App auf den Home-Bildschirm</h3>
      ${isIos()
        ? '<p>In Safari unten auf das <strong>Teilen-Symbol</strong> <span class="ios-share" aria-hidden="true"></span> tippen, dann <strong>„Zum Home-Bildschirm“</strong>.</p>'
        : '<p>Im Browser-Menü <strong>⋮</strong> auf <strong>„App installieren“</strong> oder <strong>„Zum Startbildschirm hinzufügen“</strong> tippen.</p>'}
    </div>`);

export function renderHome(view) {
  const p = me();
  const { rounds, evenings } = ctx.state;
  const round = rounds.filter((r) => r.status === 'laeuft').pop() || rounds[rounds.length - 1];
  const k = round ? kueche(round.kueche) : null;
  const evs = round ? evenings.filter((e) => e.round === round.id) : [];
  const cur = currentEvening(evenings);
  const t = todayIso();

  const installHintHtml = installHint();

  const curCard = cur ? `
    <a class="card now" href="#/abend/${esc(cur.id)}">
      <p class="kicker">${cur.date === t ? 'Heute' : cur.date < t ? 'Zuletzt' : 'Als Nächstes'}</p>
      <h2>${esc(coupleName(cur.host))}</h2>
      <p class="muted">${esc(fmtDate(cur.date))}</p>
    </a>
    <div class="quick">
      <a class="btn btn-primary" href="#/abend/${esc(cur.id)}/fotos">📸 Fotos</a>
      <a class="btn btn-primary" href="#/abend/${esc(cur.id)}/spruch">💬 Spruch</a>
    </div>` : '';

  view.innerHTML = `
    <section class="home">
      <header class="home-head">
        <p class="kicker">${esc(APP_NAME)}</p>
        <h1 class="title title-sm">Hallo ${esc(p.name)}!</h1>
      </header>
      ${ornament}
      <div id="queue"></div>
      ${curCard}
      ${round ? `
        <section class="round" style="--land:${esc(k?.farben?.[0] || '#b5532f')}">
          <p class="kicker">Aktuelle Runde</p>
          <h2 class="round-name">${esc(round.name)}</h2>
          ${k?.orig ? `<p class="round-orig">${esc(k.orig)}</p>` : ''}
          <ol class="evenings">
            ${evs.map((e) => `
              <li>
                <a href="#/abend/${esc(e.id)}" class="ev ${e.date && e.date < t ? 'past' : ''} ${cur && cur.id === e.id ? 'cur' : ''}">
                  <span class="ev-nr">${e.nr}</span>
                  <span class="ev-main">
                    <strong>${esc(coupleName(e.host))}</strong>
                    <span class="muted">${esc(fmtShort(e.date))}${e.photos ? ` · ${e.photos} Fotos` : ''}${e.quotes ? ` · ${e.quotes} Sprüche` : ''}</span>
                  </span>
                  <span class="ev-go" aria-hidden="true">›</span>
                </a>
              </li>`).join('')}
          </ol>
          <a class="link" href="#/ideen/${esc(round.kueche)}">Ideen für ${esc(round.name)} – was kocht man dort?</a>
        </section>` : '<div class="card"><p>Noch keine Runde angelegt.</p></div>'}
      ${installHintHtml}
    </section>`;
}
