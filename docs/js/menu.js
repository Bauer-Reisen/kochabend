// Menü: mehrere Gerichte je Gang, zusätzliche Gänge (Aperitif, Zwischengang, Absacker).
// Gemeinsam genutzt von Abend-Seite, Tagebuch und Ideen.
import { esc } from './ui.js?v=0.4.0';
import { GANG, GAENGE, findIdee } from './kuechen.js?v=0.4.0';

export const linkify = (s) => esc(s).replace(/https?:\/\/[^\s<]+/g, (u) => `<a href="${u}" target="_blank" rel="noopener">${u.length > 40 ? u.slice(0, 38) + '…' : u}</a>`).replace(/\n/g, '<br>');

// Zeilen aus der Datenbank → [{ kind, dishes: [{name, note, idea_id}], kids }] in Gang-Reihenfolge
export function groupMenu(courses = []) {
  return GAENGE.map((kind) => {
    const rows = courses.filter((c) => c.kind === kind).sort((a, b) => (a.pos || 0) - (b.pos || 0));
    return {
      kind,
      dishes: rows.filter((r) => r.name).map(({ name, note, idea_id }) => ({ name, note: note || '', idea_id: idea_id || null })),
      kids: rows.find((r) => r.kids_note)?.kids_note || '',
    };
  });
}

// Umgekehrt: Gänge → Zeilen fürs Speichern (pos ergibt die Reihenfolge, Kinder-Notiz am ersten Gericht)
export function flatMenu(gaenge) {
  const out = [];
  for (const g of gaenge) {
    const dishes = g.dishes.filter((d) => d.name.trim());
    if (!dishes.length && g.kids.trim()) dishes.push({ name: '', note: '', idea_id: null });
    dishes.forEach((d, i) => out.push({ kind: g.kind, name: d.name, note: d.note, idea_id: d.idea_id || null, kids_note: i === 0 ? g.kids : '' }));
  }
  return out;
}

export const hasMenu = (courses = []) => courses.some((c) => c.name);

// Menükarte zum Ansehen (Abend-Seite und Tagebuch)
export function menuCardHtml(courses, { notes = true, title = '' } = {}) {
  const parts = groupMenu(courses).filter((g) => g.dishes.length).map((g) => `
    <div class="menu-course">
      <p class="menu-kind">${GANG[g.kind]}</p>
      ${g.dishes.map((d) => {
        const idee = d.idea_id ? findIdee(d.idea_id) : null;
        return `
        <div class="menu-dish">
          <p class="menu-name">${esc(d.name)}</p>
          ${idee?.orig ? `<p class="menu-orig">${esc(idee.orig)}</p>` : ''}
          ${notes && d.note ? `<p class="menu-note">${linkify(d.note)}</p>` : ''}
        </div>`;
      }).join('')}
      ${g.kids ? `<p class="menu-kids">Für die Kinder: ${notes ? linkify(g.kids) : esc(g.kids)}</p>` : ''}
    </div>`);
  return `<div class="menu-card${title ? ' diary-menu' : ''}">${title ? `<p class="menu-title">${esc(title)}</p>` : ''}${parts.join('<div class="menu-sep" aria-hidden="true">✦</div>')}</div>`;
}
