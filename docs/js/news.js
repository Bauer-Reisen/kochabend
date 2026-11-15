// „Was ist neu?" – nach einem Update einmal, wenn man die App wieder öffnet.
// Wer die App neu hat, bekommt stattdessen den Rundgang und sieht die alten Neuigkeiten nicht.
// Neueste zuerst; nur Änderungen, die man sieht und kennen sollte (keine Reparaturen).
import { dialog } from './ui.js?v=0.2.2';

export const NEWS = [
  {
    v: '0.2.0', title: 'Griechenland ist da',
    items: [
      'Auf der Startseite seht ihr die <strong>drei Griechenland-Abende</strong>. Tippt einen an für Menü, Fotos, Sprüche und Eindrücke.',
      '<strong>Fotos</strong> und <strong>Sprüche</strong> gehen mit einem Tipp. Ohne Netz warten die Fotos und werden später hochgeladen.',
      '<strong>Viele Fotos auf einmal</strong>: Die App sortiert sie nach Aufnahmetag selbst dem richtigen Abend zu.',
      'Gastgeber tragen das Menü ein und tippen am Abend auf <strong>Menü freigeben</strong>. Bis dahin bleibt es geheim.',
      '<strong>Ideen für Griechenland</strong> je Gang, jeweils mit einer Variante für Kinder.',
    ],
  },
];

const num = (v) => (v || '0').split('.').map(Number);
const newer = (a, b) => { const x = num(a); const y = num(b); for (let i = 0; i < 3; i++) if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) > (y[i] || 0); return false; };

export const unseen = (seen) => NEWS.filter((n) => !seen || newer(n.v, seen));

export async function showNews(list) {
  await dialog({
    title: 'Was ist neu?',
    body: `<div class="news">${list.map((n) => `<h3>${n.title}</h3><ul>${n.items.map((t) => `<li>${t}</li>`).join('')}</ul>`).join('')}</div>`,
    buttons: [{ label: 'Alles klar', value: true, primary: true }],
  });
}
