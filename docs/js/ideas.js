// Ideen je Land und Gang – mit Kinder-Variante und Link zur Rezeptsuche.
// Gastgeber können eine Idee direkt für ihren Abend übernehmen.
// Was in dieser Küche schon gekocht wurde (offene Menüs), wird ausgeblendet und unten klein genannt.
import * as api from './api.js?v=0.3.0';
import { esc, toast } from './ui.js?v=0.3.0';
import { me, eveningById, coupleName } from './ctx.js?v=0.3.0';
import { kueche, GANG, suchLink } from './kuechen.js?v=0.3.0';

const ERST = 6; // so viele Ideen je Gang sofort, der Rest hinter „Noch mehr Ideen"

const norm = (s) => String(s || '').toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, ' ').trim();

// Passt ein eingetragenes Gericht zu einer Idee? (übernommene Idee oder gleicher Name)
function istGekocht(idee, c) {
  if (c.idea_id && c.idea_id === idee.id) return true;
  const n = ` ${norm(c.name)} `;
  return [idee.name.split(' mit ')[0], idee.orig, ...(idee.auch || [])]
    .map(norm).filter((w) => w.length >= 4)
    .some((w) => n.includes(` ${w} `) || n.includes(` ${w}`));
}

export async function renderIdeas(view, kuecheId, kind, eveningId) {
  const k = kueche(kuecheId);
  const ev = eveningId ? eveningById(eveningId) : null;
  const canTake = ev && ev.host === me()?.couple;
  const back = ev ? `#/abend/${esc(ev.id)}` : '#/';
  if (!k) {
    view.innerHTML = `<section class="page"><a class="back" href="${back}">‹ Zurück</a><p>Für diese Küche gibt es noch keine Ideen. Suche einfach bei <a href="${suchLink(kuecheId)}" target="_blank" rel="noopener">Chefkoch</a>.</p></section>`;
    return;
  }

  // Schon gekochte Gerichte (ohne den eigenen Abend, für den man gerade sucht)
  let cooked = [];
  try { cooked = (await api.getCooked(kuecheId)).cooked.filter((c) => c.evening !== eveningId); } catch { /* offline: alles zeigen */ }
  const weg = []; // { idee, c }
  const offen = {};
  for (const g of ['vor', 'haupt', 'nach']) {
    offen[g] = (k.ideen[g] || []).filter((i) => {
      const c = cooked.find((x) => istGekocht(i, x));
      if (c) weg.push({ idee: i, c });
      return !c;
    });
  }

  const ideaHtml = (i, g, hidden) => `
    <article class="idea"${hidden ? ' hidden data-more' : ''}>
      <h3>${esc(i.name)} <span class="idea-orig">${esc(i.orig)}</span></h3>
      <p>${esc(i.text)}</p>
      <p class="idea-kids"><strong>Für Kinder:</strong> ${esc(i.kids)}</p>
      <p class="idea-actions">
        <a class="link" href="${suchLink(i.name.split(' mit ')[0])}" target="_blank" rel="noopener">Rezepte suchen ↗</a>
        ${canTake ? `<button type="button" class="btn btn-small" data-take="${esc(i.id)}" data-kind="${g}">Für unseren Abend</button>` : ''}
      </p>
    </article>`;

  const kinds = kind && k.ideen[kind] ? [kind] : ['vor', 'haupt', 'nach'];
  view.innerHTML = `
    <section class="page ideas" style="--land:${esc(k.farben?.[0] || '#b5532f')}">
      <a class="back" href="${back}">‹ Zurück</a>
      <header class="ev-head">
        <p class="kicker">Ideen</p>
        <h1 class="title title-sm">${esc(k.name)}</h1>
        ${k.orig ? `<p class="round-orig">${esc(k.orig)}</p>` : ''}
      </header>
      ${kind ? '' : `<nav class="chips">${['vor', 'haupt', 'nach'].map((g) => `<a href="#ideen-${g}">${GANG[g]}</a>`).join('')}</nav>`}
      ${kinds.map((g) => {
        const list = offen[g];
        const more = list.length - ERST;
        return `
        <section class="block" id="ideen-${g}">
          <h2>${GANG[g]} <span class="muted small">(${list.length} Ideen)</span></h2>
          ${list.map((i, n) => ideaHtml(i, g, n >= ERST)).join('')}
          ${more > 0 ? `<button type="button" class="btn btn-wide" data-more-btn>Noch ${more} Ideen zeigen</button>` : ''}
        </section>`;
      }).join('')}
      <section class="block">
        <h2>Kinder-Tipps für ${esc(k.name)}</h2>
        <ul class="tips">${(k.kinderTipps || []).map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
      </section>
      ${weg.length ? `
      <section class="block cooked-note">
        <p class="muted small"><strong>Schon gekocht</strong>, darum hier ausgeblendet:<br>
        ${weg.map(({ idee, c }) => `${esc(idee.name.split(' mit ')[0])} (Abend ${esc(c.nr)}, ${esc(coupleName(c.host))})`).join(' · ')}</p>
      </section>` : ''}
      ${kind ? `<a class="link" href="#/ideen/${esc(kuecheId)}${ev ? `//${esc(ev.id)}` : ''}">Alle Gänge ansehen</a>` : ''}
    </section>`;

  view.querySelectorAll('[data-more-btn]').forEach((b) => b.addEventListener('click', () => {
    b.closest('.block').querySelectorAll('[data-more]').forEach((a) => { a.hidden = false; });
    b.remove();
  }));

  view.querySelectorAll('[data-take]').forEach((b) => b.addEventListener('click', async () => {
    const g = b.dataset.kind;
    const idee = k.ideen[g].find((i) => i.id === b.dataset.take);
    try {
      const cur = await api.getEvening(ev.id);
      const courses = ['vor', 'haupt', 'nach'].map((kd) => {
        const c = cur.courses.find((x) => x.kind === kd) || { kind: kd, name: '', note: '', kids_note: '', idea_id: null };
        return kd === g ? { ...c, kind: kd, name: idee.name, idea_id: idee.id, kids_note: c.kids_note || idee.kids } : c;
      });
      await api.saveCourses(ev.id, courses);
      toast(`„${idee.name}“ als ${GANG[g]} eingetragen`);
      location.hash = `#/abend/${ev.id}`;
    } catch (ex) {
      toast(ex.message, 4000);
    }
  }));
}
