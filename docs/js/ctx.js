// Gemeinsamer Zustand und kleine Helfer für alle Seiten.
import { store } from './api.js?v=0.3.1';

export const ctx = { people: null, state: null };

export const me = () => ctx.people?.persons.find((p) => p.id === store.get('person')) || null;
export const person = (id) => ctx.people?.persons.find((p) => p.id === id) || null;
export const personName = (id) => person(id)?.name || id;
export const couple = (id) => ctx.people?.couples.find((c) => c.id === id) || null;
export const coupleName = (id) => couple(id)?.name || id;

// Kinder eines Paares mit heutigem Alter (ungefähr, aus dem Geburtsjahr)
export function kidsOf(coupleId, atIso) {
  const year = atIso ? Number(atIso.slice(0, 4)) : new Date().getFullYear(); // Alter am Abend (für das Tagebuch)
  return (ctx.people?.kids || []).filter((k) => k.couple === coupleId).map((k) => year - k.birth_year).sort((a, b) => a - b);
}
export const agesText = (ages) => ages.length ? ages.join(' und ') + (ages.length === 1 ? ' Jahre' : '') : '';

// ---------- Datum ----------
export const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const parse = (iso) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); };
export const fmtDate = (iso, opts = { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }) =>
  iso ? parse(iso).toLocaleDateString('de-DE', opts) : 'Termin offen';
export const fmtShort = (iso) => (iso ? parse(iso).toLocaleDateString('de-DE', { day: 'numeric', month: 'long' }) : 'Termin offen');

// Zu welchem Abend gehört ein Foto? Ein Abend dauert vom Tag 6 Uhr bis zum nächsten Morgen 6 Uhr.
export function eveningForTime(ms, evenings) {
  if (!ms) return null;
  const shifted = new Date(ms - 6 * 3600 * 1000);
  const iso = `${shifted.getFullYear()}-${String(shifted.getMonth() + 1).padStart(2, '0')}-${String(shifted.getDate()).padStart(2, '0')}`;
  return evenings.find((e) => e.date === iso) || null;
}

// Der „aktuelle" Abend: heute → der letzte der vergangenen 14 Tage → der nächste geplante
export function currentEvening(evenings) {
  const t = todayIso();
  const dated = evenings.filter((e) => e.date).sort((a, b) => a.date.localeCompare(b.date));
  const todays = dated.find((e) => e.date === t);
  if (todays) return todays;
  const twoWeeks = new Date(Date.now() - 14 * 86400000);
  const limit = `${twoWeeks.getFullYear()}-${String(twoWeeks.getMonth() + 1).padStart(2, '0')}-${String(twoWeeks.getDate()).padStart(2, '0')}`;
  const recent = dated.filter((e) => e.date < t && e.date >= limit).pop();
  if (recent) return recent;
  return dated.find((e) => e.date > t) || null;
}

export const roundOf = (ev) => ctx.state?.rounds.find((r) => r.id === ev.round) || null;
export const eveningById = (id) => ctx.state?.evenings.find((e) => e.id === id) || null;
