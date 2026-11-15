// Ideen je Land und Gang – mit Kinder-Variante und Link zur Rezeptsuche.
// Gastgeber können eine Idee direkt für ihren Abend übernehmen.
import * as api from './api.js?v=0.2.2';
import { esc, toast } from './ui.js?v=0.2.2';
import { me, eveningById } from './ctx.js?v=0.2.2';
import { kueche, GANG, suchLink } from './kuechen.js?v=0.2.2';

export function renderIdeas(view, kuecheId, kind, eveningId) {
  const k = kueche(kuecheId);
  const ev = eveningId ? eveningById(eveningId) : null;
  const canTake = ev && ev.host === me()?.couple;
  const back = ev ? `#/abend/${esc(ev.id)}` : '#/';
  if (!k) {
    view.innerHTML = `<section class="page"><a class="back" href="${back}">‹ Zurück</a><p>Für diese Küche gibt es noch keine Ideen. Suche einfach bei <a href="${suchLink(kuecheId)}" target="_blank" rel="noopener">Chefkoch</a>.</p></section>`;
    return;
  }
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
      ${kinds.map((g) => `
        <section class="block" id="ideen-${g}">
          <h2>${GANG[g]}</h2>
          ${k.ideen[g].map((i) => `
            <article class="idea">
              <h3>${esc(i.name)} <span class="idea-orig">${esc(i.orig)}</span></h3>
              <p>${esc(i.text)}</p>
              <p class="idea-kids"><strong>Für Kinder:</strong> ${esc(i.kids)}</p>
              <p class="idea-actions">
                <a class="link" href="${suchLink(i.name.split(' mit ')[0])}" target="_blank" rel="noopener">Rezepte suchen ↗</a>
                ${canTake ? `<button type="button" class="btn btn-small" data-take="${esc(i.id)}" data-kind="${g}">Für unseren Abend</button>` : ''}
              </p>
            </article>`).join('')}
        </section>`).join('')}
      <section class="block">
        <h2>Kinder-Tipps für ${esc(k.name)}</h2>
        <ul class="tips">${(k.kinderTipps || []).map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
      </section>
      ${kind ? `<a class="link" href="#/ideen/${esc(kuecheId)}${ev ? `//${esc(ev.id)}` : ''}">Alle Gänge ansehen</a>` : ''}
    </section>`;

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
