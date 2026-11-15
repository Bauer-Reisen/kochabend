// „Was ist neu?" – nach einem Update einmal, wenn man die App wieder öffnet.
// Wer die App neu hat, bekommt stattdessen den Rundgang und sieht die alten Neuigkeiten nicht.
// Neueste zuerst; nur Änderungen, die man sieht und kennen sollte (keine Reparaturen).
import { dialog } from './ui.js?v=0.1.1';

export const NEWS = [
  // Beispiel: { v: '0.2.0', title: 'Runden und Termine', items: ['…'] },
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
