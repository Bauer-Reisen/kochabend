// Reiterleiste unten: Jetzt · Tagebuch · Termine · Ideen · Mehr
import { esc } from './ui.js?v=0.3.5';
import { ctx } from './ctx.js?v=0.3.5';

const ICON = {
  jetzt: '<path d="M4 11h16M6 11c0 4 2.7 7 6 7s6-3 6-7"/><path d="M9 7c0-1 1-1.5 1-2.5M13 7c0-1 1-1.5 1-2.5"/>',
  tagebuch: '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/>',
  termine: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
  ideen: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
  mehr: '<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',
};

// Welcher Reiter gehört zu welcher Seite?
const TAB_OF = { '': 'jetzt', abend: 'jetzt', tagebuch: 'tagebuch', termine: 'termine', ideen: 'ideen', mehr: 'mehr', einsortieren: 'mehr' };

export function renderTabs(page) {
  const nav = document.getElementById('tabs');
  if (!nav) return;
  const rounds = ctx.state?.rounds || [];
  const round = rounds.filter((r) => r.status === 'laeuft').pop() || rounds[rounds.length - 1];
  const active = TAB_OF[page] || 'jetzt';
  const tabs = [
    ['jetzt', 'Jetzt', '#/'],
    ['tagebuch', 'Tagebuch', '#/tagebuch'],
    ['termine', 'Termine', '#/termine'],
    ['ideen', 'Ideen', round ? `#/ideen/${round.kueche}` : '#/'],
    ['mehr', 'Mehr', '#/mehr'],
  ];
  nav.innerHTML = tabs.map(([id, label, href]) => `
    <a href="${esc(href)}" ${id === active ? 'aria-current="page"' : ''}>
      <svg viewBox="0 0 24 24" aria-hidden="true">${ICON[id]}</svg>
      <span>${label}</span>
    </a>`).join('');
  nav.hidden = false;
  document.body.classList.add('has-tabs');
}

export function hideTabs() {
  const nav = document.getElementById('tabs');
  if (nav) nav.hidden = true;
  document.body.classList.remove('has-tabs');
}
