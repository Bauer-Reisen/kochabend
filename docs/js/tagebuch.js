// Das schöne Tagebuch: Titelseite mit allen Ländern, je Land ein Kapitel mit seinen Abenden.
// Nur zum Anschauen – gesammelt wird auf den Abend-Seiten.
import * as api from './api.js?v=0.3.0';
import { esc } from './ui.js?v=0.3.0';
import { ctx, personName, coupleName, fmtDate, todayIso } from './ctx.js?v=0.3.0';
import { kueche, GANG, findIdee } from './kuechen.js?v=0.3.0';
import { ornament } from './ornament.js?v=0.3.0';
import { musicLabel } from './evening.js?v=0.3.0';

const year = (iso) => (iso ? iso.slice(0, 4) : '');
// leichte, aber feste Schräglage je Foto (sieht bei jedem Öffnen gleich aus)
const tilt = (id) => { let h = 0; for (const c of String(id)) h = (h * 31 + c.charCodeAt(0)) | 0; return ((Math.abs(h) % 7) - 3) * 0.8; };

// ---------- Titelseite ----------
export function renderBook(view) {
  const { rounds, evenings } = ctx.state;
  const t = todayIso();
  view.innerHTML = `
    <section class="page book">
      <a class="back" href="#/">‹ Übersicht</a>
      <header class="book-cover">
        <p class="kicker">Unser Kochabend-Tagebuch</p>
        <h1 class="title title-name"><span class="tn-small">In</span> 80 Küchen <span class="tn-line">um die Welt</span></h1>
        ${ornament}
        <p class="muted">${esc(ctx.people.couples.map((c) => c.name).join(' · '))}</p>
        <p class="book-count">Küche ${rounds.length} von 80</p>
      </header>
      <ol class="chapters">
        ${rounds.slice().reverse().map((r) => {
          const k = kueche(r.kueche) || {};
          const evs = evenings.filter((e) => e.round === r.id);
          const dates = evs.map((e) => e.date).filter(Boolean).sort();
          const done = evs.filter((e) => e.date && e.date < t).length;
          return `
          <li>
            <a class="chapter" href="#/tagebuch/${esc(r.id)}" style="--land:${esc(k.farben?.[0] || '#b5532f')}">
              <span class="chapter-nr">${rounds.indexOf(r) + 1}</span>
              <span class="chapter-main">
                <strong>${esc(r.name)}</strong>
                ${k.orig ? `<span class="chapter-orig">${esc(k.orig)}</span>` : ''}
                <span class="muted small">${dates.length ? esc(year(dates[0])) : ''}${done < evs.length ? ` · ${done} von ${evs.length} Abenden` : ''}</span>
              </span>
              <span class="ev-go" aria-hidden="true">›</span>
            </a>
          </li>`;
        }).join('')}
      </ol>
    </section>`;
}

// ---------- Kapitel eines Landes ----------
export async function renderChapter(view, roundId) {
  const r = ctx.state.rounds.find((x) => x.id === roundId);
  if (!r) { view.innerHTML = '<section class="page"><a class="back" href="#/tagebuch">‹ Tagebuch</a><p>Dieses Kapitel gibt es nicht.</p></section>'; return; }
  const k = kueche(r.kueche) || {};
  const evs = ctx.state.evenings.filter((e) => e.round === r.id).sort((a, b) => a.nr - b.nr);
  view.innerHTML = '<p class="loading">Blättere …</p>';
  const all = await Promise.all(evs.map((e) => api.getEvening(e.id).catch(() => null)));

  view.innerHTML = `
    <section class="page chapter-page" style="--land:${esc(k.farben?.[0] || '#b5532f')}; --land2:${esc(k.farben?.[2] || '#e6c9b8')}">
      <a class="back" href="#/tagebuch">‹ Tagebuch</a>
      <header class="chapter-head">
        <p class="kicker">Kapitel ${ctx.state.rounds.indexOf(r) + 1}</p>
        <h1 class="title">${esc(r.name)}</h1>
        ${k.orig ? `<p class="round-orig">${esc(k.orig)}</p>` : ''}
        <div class="land-band" aria-hidden="true"></div>
      </header>
      ${all.map((d, i) => (d ? eveningPage(d, i) : `<p class="muted">Abend ${evs[i].nr} konnte nicht geladen werden.</p>`)).join('<div class="page-turn" aria-hidden="true">✦ ✦ ✦</div>')}
    </section>`;

  // Fotos groß ansehen
  view.querySelectorAll('[data-big]').forEach((b) => b.addEventListener('click', () => {
    const d = all[Number(b.dataset.ev)];
    const list = d.photos.filter((p) => p.kind === 'teller');
    viewer(list, Number(b.dataset.big));
  }));
}

function eveningPage(d, idx) {
  const ev = d.evening;
  const t = todayIso();
  const photos = d.photos.filter((p) => p.kind === 'teller');
  // Titelbild: von den Gastgebern gewählt, sonst das mit den meisten Herzen, sonst das erste
  const cover = photos.find((p) => p.id === ev.cover)
    || photos.slice().sort((a, b) => b.hearts.length - a.hearts.length)[0];
  const rest = photos.filter((p) => p !== cover);
  const upcoming = !ev.date || ev.date >= t;
  const hasCourses = d.courses.some((c) => c.name);

  return `
    <article class="diary-ev">
      <header class="diary-ev-head">
        <p class="diary-nr">Abend ${ev.nr}</p>
        <h2>bei ${esc(coupleName(ev.host))}</h2>
        <p class="muted">${esc(fmtDate(ev.date, { day: 'numeric', month: 'long', year: 'numeric' }))}</p>
      </header>

      ${cover ? `
        <button type="button" class="polaroid polaroid-big" data-ev="${idx}" data-big="${photos.indexOf(cover)}" style="--tilt:${tilt(cover.id)}deg">
          <img src="${api.photoUrl(cover.big)}" alt="" loading="lazy" decoding="async">
        </button>` : ''}

      ${hasCourses ? `
        <div class="menu-card diary-menu">
          <p class="menu-title">Menü</p>
          ${['vor', 'haupt', 'nach'].map((kind) => {
            const x = d.courses.find((c) => c.kind === kind);
            if (!x || !x.name) return '';
            const idee = x.idea_id ? findIdee(x.idea_id) : null;
            return `<div class="menu-course"><p class="menu-kind">${GANG[kind]}</p><p class="menu-name">${esc(x.name)}</p>${idee?.orig ? `<p class="menu-orig">${esc(idee.orig)}</p>` : ''}</div>`;
          }).filter(Boolean).join('<div class="menu-sep" aria-hidden="true">✦</div>')}
        </div>`
        : upcoming ? `<p class="secret">${ev.menuFilled && !ev.menuOpen ? '🤫 Das Menü ist noch geheim.' : 'Dieser Abend kommt noch.'}</p>` : ''}

      ${d.quotes.length ? `
        <div class="diary-quotes">
          ${d.quotes.map((q) => `
            <figure class="note-card" style="--tilt:${tilt(q.id) / 2}deg">
              <blockquote>${esc(q.text)}</blockquote>
              <figcaption>— ${esc(personName(q.said_by))}</figcaption>
            </figure>`).join('')}
        </div>` : ''}

      ${rest.length ? `
        <div class="polaroids">
          ${rest.map((p) => `
            <button type="button" class="polaroid" data-ev="${idx}" data-big="${photos.indexOf(p)}" style="--tilt:${tilt(p.id)}deg">
              <img src="${api.photoUrl(p.small)}" alt="" loading="lazy" decoding="async">
            </button>`).join('')}
        </div>` : ''}

      ${d.impressions.length ? `
        <div class="diary-imp">
          ${d.impressions.map((i) => `<p><span class="hand">${esc(i.text)}</span> <span class="muted small">— ${esc(personName(i.person))}</span></p>`).join('')}
        </div>` : ''}

      ${d.music ? `<p class="center"><a class="link" href="${esc(d.music.url)}" target="_blank" rel="noopener">🎵 Die Musik des Abends (${musicLabel(d.music.url)})</a></p>` : ''}

      ${!photos.length && !d.quotes.length && !d.impressions.length && !upcoming
        ? `<p class="muted center">Noch leer – <a class="link" href="#/abend/${esc(ev.id)}">Fotos und Sprüche nachtragen</a></p>`
        : `<p class="center"><a class="link small" href="#/abend/${esc(ev.id)}">Zum Abend (Fotos, Sprüche ergänzen)</a></p>`}
    </article>`;
}

// Einfache Großansicht zum Durchwischen
function viewer(list, start) {
  let i = start;
  const d = document.createElement('dialog');
  d.className = 'lightbox';
  document.body.append(d);
  const show = () => {
    const p = list[i];
    d.innerHTML = `
      <div class="lb-top">
        <span class="muted small">${i + 1} / ${list.length} · von ${esc(personName(p.by))}</span>
        <button type="button" class="lb-close" aria-label="Schließen">✕</button>
      </div>
      <img src="${api.photoUrl(p.big)}" alt="">
      <div class="lb-bar">
        <button type="button" data-lb="prev" ${i === 0 ? 'disabled' : ''} aria-label="Voriges Foto">‹</button>
        <button type="button" data-lb="next" ${i === list.length - 1 ? 'disabled' : ''} aria-label="Nächstes Foto">›</button>
      </div>`;
    d.querySelector('.lb-close').onclick = close;
    d.querySelector('[data-lb=prev]').onclick = () => { if (i > 0) { i--; show(); } };
    d.querySelector('[data-lb=next]').onclick = () => { if (i < list.length - 1) { i++; show(); } };
  };
  const close = () => { d.close(); d.remove(); };
  d.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
  let x0 = null;
  d.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  d.addEventListener('touchend', (e) => {
    if (x0 == null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (dx < -50 && i < list.length - 1) { i++; show(); }
    if (dx > 50 && i > 0) { i--; show(); }
    x0 = null;
  });
  show();
  d.showModal();
}
