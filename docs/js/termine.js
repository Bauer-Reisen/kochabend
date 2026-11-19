// Reiter „Termine": wer wann Gastgeber ist. Terminfinder und Kalender-Abo kommen hier dazu.
import { esc } from './ui.js?v=0.3.6';
import { ctx, coupleName, fmtDate, todayIso } from './ctx.js?v=0.3.6';

export function renderDates(view) {
  const { rounds, evenings } = ctx.state;
  const t = todayIso();
  const roundName = (id) => rounds.find((r) => r.id === id)?.name || '';
  const sorted = evenings.slice().sort((a, b) => (a.date || '9999').localeCompare(b.date || '9999'));
  const running = (e) => rounds.find((r) => r.id === e.round)?.status !== 'fertig';
  const next = sorted.filter((e) => (e.date ? e.date >= t : running(e)));
  const past = sorted.filter((e) => e.date && e.date < t).reverse().slice(0, 6); // ältere stehen im Tagebuch
  const row = (e) => `
    <li>
      <a href="#/abend/${esc(e.id)}" class="ev ${e.date && e.date < t ? 'past' : ''}">
        <span class="date-box">${e.date ? `<strong>${Number(e.date.slice(8, 10))}.</strong><span>${esc(fmtDate(e.date, { month: 'short' }))}</span>` : '<strong>?</strong>'}</span>
        <span class="ev-main">
          <strong>${esc(coupleName(e.host))}</strong>
          <span class="muted">${esc(roundName(e.round))} · Abend ${e.nr}${e.date ? ` · ${esc(fmtDate(e.date, { weekday: 'long', year: 'numeric' }))}` : ' · Termin offen'}</span>
        </span>
        <span class="ev-go" aria-hidden="true">›</span>
      </a>
    </li>`;
  view.innerHTML = `
    <section class="page">
      <header class="ev-head">
        <p class="kicker">Wer kocht wann?</p>
        <h1 class="title title-sm">Termine</h1>
      </header>
      <section class="block">
        <h2>Als Nächstes</h2>
        ${next.length ? `<ol class="evenings">${next.map(row).join('')}</ol>` : '<p class="muted">Gerade ist nichts geplant.</p>'}
      </section>
      <div class="card soon">
        <h3>Kommt bald</h3>
        <p><strong>Terminfinder:</strong> Jedes Paar tippt an, welche Wochenenden und Feiertage passen – rechtzeitig zum letzten Griechenland-Abend.</p>
        <p><strong>Kalender-Abo:</strong> Alle Kochabende automatisch in eurem Handy-Kalender.</p>
      </div>
      ${past.length ? `
      <section class="block">
        <h2>Zuletzt</h2>
        <ol class="evenings">${past.map(row).join('')}</ol>
        <a class="link" href="#/tagebuch">Alle früheren Abende im Tagebuch</a>
      </section>` : ''}
    </section>`;
}
