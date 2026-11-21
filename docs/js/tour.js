// Rundgang beim allerersten Öffnen: ein paar Karten, jederzeit überspringbar.
// Lässt sich unten auf der Startseite („Rundgang ansehen") wieder aufrufen.
import { dialog, esc } from './ui.js?v=0.4.0';

const STEPS = [
  {
    icon: '🍽️', title: 'Euer Kochabend-Tagebuch',
    text: 'Hier sammelt ihr sechs alles rund um eure Länderabende: pro Land ein Kapitel mit den drei Abenden. Daraus entsteht von selbst ein <strong>schön gestaltetes Tagebuch</strong> zum Durchblättern.',
  },
  {
    icon: '📸', title: 'Einfach füttern',
    text: 'Am Abend tippst du nur auf <strong>Fotos</strong> oder <strong>Spruch</strong>. Um die Gestaltung musst du dich nicht kümmern. Auch ohne Netz geht nichts verloren: Die App lädt später hoch.',
  },
  {
    icon: '🤫', title: 'Das Menü bleibt geheim',
    text: 'Die Gastgeber tragen ihre drei Gänge vorher ein. Die Gäste sehen sie erst, wenn die Gastgeber am Abend auf <strong>Menü freigeben</strong> tippen.',
  },
  {
    icon: '📅', title: 'Wer ist wann dran?',
    text: 'Die App kennt die Reihenfolge: Jede Runde rücken alle eins vor. Im <strong>Terminfinder</strong> tippt jede Person an, wann sie kann, und mit dem <strong>Kalender-Abo</strong> stehen alle Kochabende in eurem Handy-Kalender.',
  },
  {
    icon: '🗳️', title: 'Das nächste Land',
    text: 'Am letzten Abend einer Runde gibt jede Person zwei Stimmen ab, verdeckt auf dem eigenen Handy. Erst wenn alle sechs abgestimmt haben, wird das Gewinnerland aufgedeckt.',
  },
  {
    icon: '🏠', title: 'Auf den Home-Bildschirm',
    text: 'Am iPhone: in Safari unten auf das <strong>Teilen-Symbol</strong> (Viereck mit Pfeil) und dann <strong>Zum Home-Bildschirm</strong>. Dann öffnet sich die App wie jede andere.',
  },
];

export async function runTour(name = '') {
  const steps = STEPS;
  let i = 0;
  while (i < steps.length) {
    const s = steps[i];
    const last = i === steps.length - 1;
    const offen = dialog({
      title: i === 0 && name ? `Willkommen, ${name}!` : s.title,
      body: `
        <div class="tour">
          <div class="tour-icon" aria-hidden="true">${s.icon}</div>
          ${i === 0 && name ? `<h3>${esc(s.title)}</h3>` : ''}
          <p>${s.text}</p>
          <p class="tour-dots" aria-label="Schritt ${i + 1} von ${steps.length}">${steps.map((_, j) => `<button type="button" class="${j === i ? 'on' : ''}" data-schritt="${j}" aria-label="Zu Schritt ${j + 1}"><span></span></button>`).join('')}</p>
          ${i > 0 ? '<button type="button" class="tour-skip" data-schritt="ende">Rundgang überspringen</button>' : ''}
        </div>`,
      buttons: [
        i === 0 ? { label: 'Überspringen', value: 'skip' } : { label: '← Zurück', value: 'back' },
        { label: last ? 'Los geht’s' : 'Weiter', value: 'next', primary: true },
      ],
    });
    // Punkte oben antippen = zu diesem Schritt springen
    let sprung = null;
    [...document.querySelectorAll('dialog')].pop()?.querySelectorAll('[data-schritt]')
      .forEach((b) => b.addEventListener('click', () => { sprung = b.dataset.schritt; }));
    const res = await offen;
    if (sprung === 'ende') return;
    if (sprung !== null) { i = Number(sprung); continue; }
    if (!res) return;
    if (res.value === 'next') i++;
    else if (res.value === 'back') i = Math.max(0, i - 1);
    else return;
  }
}
