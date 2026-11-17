// Seite eines Abends: Menü, Kinder, Fotos, Sprüche, Eindrücke.
import * as api from './api.js?v=0.3.5';
import { esc, dialog, toast } from './ui.js?v=0.3.5';
import { ctx, me, personName, coupleName, kidsOf, agesText, fmtDate, eveningForTime, roundOf } from './ctx.js?v=0.3.5';
import { kueche, GANG, findIdee } from './kuechen.js?v=0.3.5';
import { addPhotos, readTakenTime, qAll, onQueueChange } from './photos.js?v=0.3.5';

const linkify = (s) => esc(s).replace(/https?:\/\/[^\s<]+/g, (u) => `<a href="${u}" target="_blank" rel="noopener">${u.length > 40 ? u.slice(0, 38) + '…' : u}</a>`).replace(/\n/g, '<br>');

let data = null;
let unsub = null;

export async function renderEvening(view, id, action, reload) {
  if (unsub) { unsub(); unsub = null; }
  try {
    data = await api.getEvening(id);
  } catch (ex) {
    view.innerHTML = `<section class="page"><a class="back" href="#/">‹ Zurück</a><p class="error">${esc(ex.message)}</p></section>`;
    return;
  }
  const ev = data.evening;
  const round = roundOf(ev) || {};
  const k = kueche(round.kueche) || {};
  const my = me();
  const queued = (await qAll().catch(() => [])).filter((q) => q.evening === ev.id);

  view.innerHTML = `
    <section class="page evening" style="--land:${esc(k.farben?.[0] || '#b5532f')}">
      <a class="back" href="${round.status === 'fertig' ? `#/tagebuch/${esc(round.id)}` : '#/'}">‹ Zurück</a>
      <header class="ev-head">
        <p class="kicker">${esc(round.name || '')} · Abend ${ev.nr}</p>
        <h1 class="title title-sm">${esc(coupleName(ev.host))}</h1>
        <p class="muted">${esc(fmtDate(ev.date))} <button type="button" class="link small" data-act="date">ändern</button></p>
      </header>

      ${kidsSection(ev, my)}

      <section class="block" id="menu">
        <h2>Menü</h2>
        ${menuSection(ev, round)}
      </section>

      <section class="block" id="musik">
        <h2>Musik</h2>
        ${musicSection(ev, round, k)}
      </section>

      <section class="block" id="fotos">
        <h2>Fotos</h2>
        <div class="photo-grid">
          ${queued.map(() => '<div class="ph ph-wait"><span>wartet …</span></div>').join('')}
          ${data.photos.filter((p) => p.kind === 'teller').map((p, i) => `
            <button type="button" class="ph ${ev.cover === p.id ? 'is-cover' : ''}" data-photo="${i}" style="aspect-ratio:${p.width}/${p.height}">
              <img src="${api.photoUrl(p.small)}" alt="" loading="lazy" decoding="async">
              ${p.hearts.includes(my.id) ? '<span class="ph-heart" aria-label="Herz von dir">♥</span>' : ''}
            </button>`).join('')}
        </div>
        ${!data.photos.length && !queued.length ? '<p class="muted">Noch keine Fotos.</p>' : ''}
        <label class="btn btn-primary btn-wide file-btn">📸 Fotos hinzufügen
          <input type="file" accept="image/*" multiple hidden data-act="files">
        </label>
        ${ev.date ? `<p class="hint">Tipp: In der Fotoauswahl oben ins Suchfeld <strong>„${esc(fmtDate(ev.date, { day: 'numeric', month: 'long' }))}“</strong> tippen – dann siehst du nur die Fotos von diesem Tag.</p>` : ''}
        <p class="upload-status" role="status"></p>
      </section>

      <section class="block" id="sprueche">
        <h2>Sprüche des Abends</h2>
        ${data.quotes.map((q) => `
          <figure class="quote">
            <blockquote>${esc(q.text)}</blockquote>
            <figcaption>— ${esc(personName(q.said_by))}${q.by === my.id ? ` <button type="button" class="link small" data-del-quote="${esc(q.id)}">löschen</button>` : ''}</figcaption>
          </figure>`).join('') || '<p class="muted">Noch keine Sprüche.</p>'}
        <button type="button" class="btn btn-primary btn-wide" data-act="quote">💬 Spruch eintragen</button>
      </section>

      <section class="block" id="eindruck">
        <h2>Eindrücke</h2>
        ${data.impressions.filter((i) => i.person !== my.id).map((i) => `
          <p class="impression"><span class="hand">${esc(i.text)}</span> <span class="muted small">— ${esc(personName(i.person))}</span></p>`).join('')}
        <label class="field-label" for="imp">Dein Eindruck in einem Satz</label>
        <textarea id="imp" rows="2" maxlength="1000" placeholder="Wie war’s?">${esc(data.impressions.find((i) => i.person === my.id)?.text || '')}</textarea>
        <button type="button" class="btn" data-act="imp">Speichern</button>
      </section>
    </section>`;

  wire(view, ev, round, reload);

  unsub = onQueueChange((items, extra) => {
    const st = view.querySelector('.upload-status');
    const mine = items.filter((q) => q.evening === ev.id);
    if (st) st.textContent = mine.length ? `${mine.length} Foto${mine.length > 1 ? 's' : ''} ${extra.error ? 'warten auf Netz' : 'werden hochgeladen …'}` : '';
    if (extra.done && extra.uploaded) reload();
  });

  if (action === 'fotos') view.querySelector('#fotos')?.scrollIntoView({ behavior: 'smooth' });
  if (action === 'spruch') { history.replaceState(history.state, '', `#/abend/${ev.id}`); addQuoteDialog(ev, reload); }
}

// ---------- Kinder ----------
function kidsSection(ev, my) {
  const guests = ctx.people.couples.filter((c) => c.id !== ev.host && kidsOf(c.id).length);
  if (!guests.length) return '';
  const row = (c) => {
    const a = data.attendance.find((x) => x.couple === c.id);
    const v = a ? a.with_kids : null;
    const ages = agesText(kidsOf(c.id, ev.past ? ev.date : null));
    if (c.id === my.couple) {
      return `
        <div class="kids-row">
          <span><strong>Ihr</strong> ${ev.past ? 'wart …' : 'kommt …'}</span>
          <span class="seg" role="group" aria-label="Mit oder ohne Kinder">
            <button type="button" data-kids="1" aria-pressed="${v === 1}">mit Kindern</button>
            <button type="button" data-kids="0" aria-pressed="${v === 0}">ohne Kinder</button>
          </span>
        </div>`;
    }
    return `<p class="kids-row"><span>${esc(c.name)}</span> <span class="muted">${v === 1 ? `mit Kindern (${esc(ages)})` : v === 0 ? 'ohne Kinder' : ev.past ? 'nicht eingetragen' : 'noch offen'}</span></p>`;
  };
  return `<section class="block kids"><h2>${ev.past ? 'Waren Kinder dabei?' : 'Kinder dabei?'}</h2>${guests.map(row).join('')}</section>`;
}

// ---------- Menü ----------
function menuForm(ev, round) {
  const c = (kind) => data.courses.find((x) => x.kind === kind) || { kind, name: '', note: '', kids_note: '' };
  const kidsComing = data.attendance.filter((a) => a.with_kids === 1).map((a) => `${coupleName(a.couple)} (${agesText(kidsOf(a.couple, ev.past ? ev.date : null))})`);
  return `
      ${kidsComing.length ? `<p class="note">👧 ${ev.past ? 'Mit Kindern da' : 'Mit Kindern'}: ${esc(kidsComing.join(', '))}</p>` : ''}
      <form class="menu-form" data-form="menu">
        ${['vor', 'haupt', 'nach'].map((kind) => {
          const x = c(kind);
          return `
          <fieldset class="course">
            <legend>${GANG[kind]}</legend>
            <input type="text" name="${kind}-name" value="${esc(x.name)}" placeholder="${ev.past ? 'Was gab es?' : 'Was gibt es?'}" maxlength="120">
            <textarea name="${kind}-note" rows="2" placeholder="Notiz oder Rezept-Link (optional)" maxlength="2000">${esc(x.note)}</textarea>
            <textarea name="${kind}-kids" rows="1" placeholder="Für die Kinder (optional)" maxlength="1000">${esc(x.kids_note)}</textarea>
            <input type="hidden" name="${kind}-idea" value="${esc(x.idea_id || '')}">
            ${round.kueche ? `<a class="link small" href="#/ideen/${esc(round.kueche)}/${kind}/${esc(ev.id)}">Ideen für die ${GANG[kind]}</a>` : ''}
          </fieldset>`;
        }).join('')}
        <button type="submit" class="btn btn-wide">Menü speichern</button>
      </form>`;
}

function menuSection(ev, round) {
  // Nach dem Abend: nichts mehr geheim, alle dürfen das Menü nachtragen oder ändern
  if (ev.past) {
    const has = data.courses.some((c) => c.name);
    return `
      ${has ? menuCard() + '<p class="center"><button type="button" class="link small" data-act="edit-menu">Menü ändern</button></p>'
        : '<p class="muted">Noch kein Menü eingetragen. Der Abend ist vorbei – jede und jeder kann es nachtragen.</p>'}
      <div data-menu-edit ${has ? 'hidden' : ''}>${menuForm(ev, round)}</div>`;
  }
  if (ev.isHost) {
    return `
      <p class="muted">Ihr seid Gastgeber. ${ev.released ? 'Das Menü ist <strong>freigegeben</strong> – alle sehen es.' : 'Die Gäste sehen das Menü erst, wenn ihr es freigebt.'}</p>
      ${menuForm(ev, round)}
      <button type="button" class="btn ${ev.released ? '' : 'btn-primary'} btn-wide" data-act="release">${ev.released ? 'Menü wieder verdecken' : '🎉 Menü freigeben'}</button>`;
  }
  if (!ev.menuOpen) {
    return `<p class="secret">🤫 Das Menü ist noch geheim.<br><span class="muted">${esc(coupleName(ev.host))} geben es am Abend frei.${ev.menuFilled ? ' (Es ist schon eingetragen.)' : ''}</span></p>`;
  }
  if (!data.courses.some((c) => c.name)) return '<p class="muted">Noch kein Menü eingetragen.</p>';
  return menuCard();
}

function menuCard() {
  return `<div class="menu-card">${['vor', 'haupt', 'nach'].map((kind) => {
    const x = data.courses.find((c) => c.kind === kind);
    if (!x || !x.name) return '';
    const idee = x.idea_id ? findIdee(x.idea_id) : null;
    return `
      <div class="menu-course">
        <p class="menu-kind">${GANG[kind]}</p>
        <p class="menu-name">${esc(x.name)}</p>
        ${idee?.orig ? `<p class="menu-orig">${esc(idee.orig)}</p>` : ''}
        ${x.note ? `<p class="menu-note">${linkify(x.note)}</p>` : ''}
        ${x.kids_note ? `<p class="menu-kids">Für die Kinder: ${linkify(x.kids_note)}</p>` : ''}
      </div>`;
  }).filter(Boolean).join('<div class="menu-sep" aria-hidden="true">✦</div>')}</div>`;
}

// ---------- Musik ----------
// Kein Spotify-Login in der App: Ein Knopf öffnet direkt die Spotify-App,
// und wer mag, legt den Link einer eigenen Playlist hier ab.
const mobile = () => /iPhone|iPad|iPod|Android/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
export const spotifySearch = (q) => (mobile()
  ? `spotify:search:${encodeURIComponent(q)}`
  : `https://open.spotify.com/search/${encodeURIComponent(q)}/playlists`);
export const musicLabel = (url) => (/spotify/.test(url) ? 'Spotify' : /youtu/.test(url) ? 'YouTube' : /apple/.test(url) ? 'Apple Music' : 'Link');

function musicSection(ev, round, k) {
  const m = data.music;
  const q = k.musik || `${round.name || ''} Musik`;
  return `
    ${m ? `
      <a class="btn btn-primary btn-wide" href="${esc(m.url)}" target="_blank" rel="noopener">▶ Unsere Playlist (${musicLabel(m.url)})</a>
      <p class="hint center">eingetragen von ${esc(personName(m.updated_by))} · <button type="button" class="link small" data-act="music">ändern</button></p>` : ''}
    <a class="btn btn-wide ${m ? '' : 'btn-primary'}" href="${esc(spotifySearch(q))}" target="_blank" rel="noopener">🎵 ${esc(q)} auf Spotify</a>
    ${m ? '' : '<p class="center"><button type="button" class="link small" data-act="music">Eigene Playlist eintragen</button></p>'}`;
}

// ---------- Ereignisse ----------
function wire(view, ev, round, reload) {
  const my = me();
  const on = (sel, fn) => view.querySelectorAll(sel).forEach((el) => el.addEventListener('click', fn));

  on('[data-act=date]', async () => {
    const r = await dialog({
      title: 'Datum des Abends',
      body: `<input type="date" name="date" value="${esc(ev.date || '')}">`,
      buttons: [{ label: 'Abbrechen', value: 'no' }, { label: 'Speichern', value: 'ok', primary: true }],
    });
    if (r?.value !== 'ok') return;
    await guard(() => api.setDate(ev.id, r.fields.date));
    reload(true);
  });

  on('[data-kids]', async (e) => {
    await guard(() => api.setKids(ev.id, e.currentTarget.dataset.kids === '1'));
    reload();
  });

  const form = view.querySelector('[data-form=menu]');
  if (form) form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(form).entries());
    const courses = ['vor', 'haupt', 'nach'].map((kind) => ({ kind, name: f[`${kind}-name`], note: f[`${kind}-note`], kids_note: f[`${kind}-kids`], idea_id: f[`${kind}-idea`] || null }));
    if (await guard(() => api.saveCourses(ev.id, courses))) { toast('Menü gespeichert'); if (ev.past) reload(); }
  });

  on('[data-act=edit-menu]', (e) => {
    view.querySelector('[data-menu-edit]').hidden = false;
    e.currentTarget.closest('p').remove();
  });

  on('[data-act=release]', async () => {
    if (!ev.released) {
      const r = await dialog({
        title: 'Menü freigeben?',
        body: '<p>Dann sehen alle Gäste sofort, was es gibt. Ihr könnt es danach wieder verdecken.</p>',
        buttons: [{ label: 'Noch nicht', value: 'no' }, { label: 'Freigeben', value: 'yes', primary: true }],
      });
      if (r?.value !== 'yes') return;
      // Vorher speichern, falls noch etwas getippt wurde
      if (form) {
        const f = Object.fromEntries(new FormData(form).entries());
        await guard(() => api.saveCourses(ev.id, ['vor', 'haupt', 'nach'].map((kind) => ({ kind, name: f[`${kind}-name`], note: f[`${kind}-note`], kids_note: f[`${kind}-kids`], idea_id: f[`${kind}-idea`] || null }))));
      }
    }
    await guard(() => api.setReleased(ev.id, !ev.released));
    if (!ev.released) toast('Menü freigegeben – guten Appetit!');
    reload();
  });

  // Fotos
  view.querySelector('[data-act=files]')?.addEventListener('change', async (e) => {
    const files = [...e.target.files];
    e.target.value = '';
    if (!files.length) return;
    const st = view.querySelector('.upload-status');
    if (ev.date) {
      const times = await Promise.all(files.map(readTakenTime));
      const other = times.filter((t) => t && eveningForTime(t, [ev]) === null).length;
      if (other) {
        const r = await dialog({
          title: 'Anderer Tag?',
          body: `<p>${other} von ${files.length} Fotos sind nicht vom ${esc(fmtDate(ev.date, { day: 'numeric', month: 'long' }))}. Trotzdem zu diesem Abend hochladen?</p>`,
          buttons: [{ label: 'Abbrechen', value: 'no' }, { label: 'Trotzdem hochladen', value: 'yes', primary: true }],
        });
        if (r?.value !== 'yes') return;
      }
    }
    try {
      const res = await addPhotos(ev.id, files, 'teller', (i, n) => { st.textContent = `Bereite Foto ${i} von ${n} vor …`; });
      if (res.error) toast(res.error.status === 0 ? 'Gerade kein Netz – die Fotos werden später hochgeladen.' : res.error.message, 4500);
      else toast(`${res.uploaded} Foto${res.uploaded === 1 ? '' : 's'} hochgeladen`);
    } catch (ex) {
      toast(ex.message, 4500);
    }
    reload();
  });

  on('[data-photo]', (e) => lightbox(ev, Number(e.currentTarget.dataset.photo), reload));

  // Musik
  on('[data-act=music]', async () => {
    const r = await dialog({
      title: 'Eure Playlist',
      body: `<p>In Spotify bei der Playlist auf <strong>···</strong> → <strong>Teilen</strong> → <strong>Link kopieren</strong> tippen und hier einfügen.</p>
        <input type="text" name="url" value="${esc(data.music?.url || '')}" placeholder="https://open.spotify.com/…" autocapitalize="none" spellcheck="false">`,
      buttons: [
        ...(data.music ? [{ label: 'Entfernen', value: 'del' }] : []),
        { label: 'Abbrechen', value: 'no' },
        { label: 'Speichern', value: 'ok', primary: true },
      ],
    });
    if (!r || r.value === 'no') return;
    const url = r.value === 'del' ? '' : (r.fields.url || '');
    if (await guard(() => api.setMusic(ev.id, url))) { toast(url ? 'Playlist gespeichert' : 'Playlist entfernt'); reload(); }
  });

  // Sprüche
  on('[data-act=quote]', () => addQuoteDialog(ev, reload));
  on('[data-del-quote]', async (e) => {
    const r = await dialog({ title: 'Spruch löschen?', buttons: [{ label: 'Abbrechen', value: 'no' }, { label: 'Löschen', value: 'yes', primary: true }] });
    if (r?.value !== 'yes') return;
    await guard(() => api.deleteQuote(e.currentTarget.dataset.delQuote));
    reload();
  });

  // Eindruck
  on('[data-act=imp]', async () => {
    const text = view.querySelector('#imp').value;
    if (await guard(() => api.saveImpression(ev.id, text))) toast('Gespeichert');
  });

  void my; void round;
}

async function addQuoteDialog(ev, reload) {
  const r = await dialog({
    title: 'Spruch des Abends',
    body: `
      <textarea name="text" rows="3" maxlength="600" placeholder="Was wurde gesagt?" required></textarea>
      <p class="field-label">Wer hat’s gesagt?</p>
      <div class="who-pick">
        ${ctx.people.persons.map((p) => `<label><input type="radio" name="who" value="${esc(p.id)}"><span>${esc(p.name)}</span></label>`).join('')}
        <label><input type="radio" name="who" value="_other"><span>Jemand anderes</span></label>
      </div>
      <input type="text" name="other" placeholder="Name (bei „Jemand anderes“)" maxlength="40">`,
    buttons: [{ label: 'Abbrechen', value: 'no' }, { label: 'Speichern', value: 'ok', primary: true }],
    validate: (f) => (!f.text?.trim() ? 'Bitte den Spruch eintippen.' : !f.who ? 'Bitte antippen, wer es gesagt hat.' : f.who === '_other' && !f.other?.trim() ? 'Bitte den Namen eintragen.' : ''),
  });
  if (r?.value !== 'ok' || !r.fields.text?.trim()) return;
  const said = r.fields.who === '_other' ? (r.fields.other || 'Jemand') : (r.fields.who || '?');
  if (await guard(() => api.addQuote(ev.id, { id: api.newId(), text: r.fields.text, said_by: said, created: Date.now() }))) {
    toast('Spruch gespeichert');
    reload();
  }
}

// ---------- Großansicht ----------
function lightbox(ev, start, reload) {
  const list = data.photos.filter((p) => p.kind === 'teller');
  const my = me();
  let i = start;
  const d = document.createElement('dialog');
  d.className = 'lightbox';
  document.body.append(d);
  const show = () => {
    const p = list[i];
    const mineHeart = p.hearts.includes(my.id);
    const canDelete = p.by === my.id || ev.isHost;
    d.innerHTML = `
      <div class="lb-top">
        <span class="muted small">${i + 1} / ${list.length} · von ${esc(personName(p.by))}</span>
        <button type="button" class="lb-close" aria-label="Schließen">✕</button>
      </div>
      <img src="${api.photoUrl(p.big)}" alt="">
      <div class="lb-bar">
        <button type="button" data-lb="prev" ${i === 0 ? 'disabled' : ''} aria-label="Voriges Foto">‹</button>
        <button type="button" data-lb="heart" aria-pressed="${mineHeart}">${mineHeart ? '♥ Lieblingsfoto' : '♡ Lieblingsfoto'}</button>
        ${ev.isHost ? `<button type="button" data-lb="cover">${ev.cover === p.id ? '★ Titelbild' : '☆ Als Titelbild'}</button>` : ''}
        ${canDelete ? '<button type="button" data-lb="del">Löschen</button>' : ''}
        <button type="button" data-lb="next" ${i === list.length - 1 ? 'disabled' : ''} aria-label="Nächstes Foto">›</button>
      </div>`;
    d.querySelector('.lb-close').onclick = () => close();
    d.querySelectorAll('[data-lb]').forEach((b) => b.addEventListener('click', async () => {
      const a = b.dataset.lb;
      if (a === 'prev' && i > 0) { i--; show(); }
      if (a === 'next' && i < list.length - 1) { i++; show(); }
      if (a === 'heart') {
        const res = await guard(() => api.toggleHeart(p.id));
        if (res) { p.hearts = res.heart ? [...p.hearts, my.id] : p.hearts.filter((x) => x !== my.id); show(); changed = true; }
      }
      if (a === 'cover') {
        if (await guard(() => api.setCover(ev.id, ev.cover === p.id ? null : p.id))) { ev.cover = ev.cover === p.id ? null : p.id; show(); changed = true; }
      }
      if (a === 'del') {
        if (!confirm('Dieses Foto löschen?')) return;
        if (await guard(() => api.deletePhoto(p.id))) { changed = true; close(); }
      }
    }));
  };
  let changed = false;
  const close = () => { d.close(); d.remove(); if (changed) reload(true); };
  d.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
  // Wischen nach links/rechts
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

async function guard(fn) {
  try { return await fn(); } catch (ex) { toast(ex.message, 4000); return null; }
}
