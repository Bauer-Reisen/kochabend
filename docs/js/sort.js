// Viele Fotos auf einmal: die App liest das Aufnahmedatum und ordnet jedes Foto dem passenden Abend zu.
import { esc, toast } from './ui.js?v=0.4.0';
import { ctx, coupleName, fmtDate, eveningForTime, roundOf } from './ctx.js?v=0.4.0';
import { readTakenTime, addPhotos } from './photos.js?v=0.4.0';

export function renderSort(view) {
  view.innerHTML = `
    <section class="page">
      <a class="back" href="#/mehr">‹ Zurück</a>
      <header class="ev-head">
        <p class="kicker">Viele Fotos auf einmal</p>
        <h1 class="title title-sm">Fotos einsortieren</h1>
      </header>
      <div class="card">
        <p>Wähle alle Fotos aus, die du von euren Kochabenden hast. Die App schaut bei jedem Foto, an welchem Tag es gemacht wurde, und ordnet es dem passenden Abend zu. Vor dem Hochladen siehst du eine Übersicht.</p>
        <p class="hint">Fotos nach Mitternacht zählen noch zum Abend davor (bis 6 Uhr früh).</p>
        <label class="btn btn-primary btn-wide file-btn">Fotos auswählen
          <input type="file" accept="image/*" multiple hidden>
        </label>
      </div>
      <div id="result"></div>
    </section>`;

  view.querySelector('input[type=file]').addEventListener('change', async (e) => {
    const files = [...e.target.files];
    e.target.value = '';
    if (!files.length) return;
    const out = view.querySelector('#result');
    out.innerHTML = '<p class="muted">Lese die Aufnahmedaten …</p>';
    const evenings = ctx.state.evenings.filter((x) => x.date);
    const groups = new Map();
    const none = [];
    for (const f of files) {
      const t = await readTakenTime(f);
      const ev = eveningForTime(t, evenings);
      if (ev) { if (!groups.has(ev.id)) groups.set(ev.id, []); groups.get(ev.id).push(f); } else none.push(f);
    }
    const allEvenings = ctx.state.evenings;
    out.innerHTML = `
      <div class="card">
        <h2>So würde ich einsortieren</h2>
        ${[...groups].map(([id, fs]) => {
          const ev = allEvenings.find((x) => x.id === id);
          return `<p class="sort-row"><strong>${fs.length} Foto${fs.length === 1 ? '' : 's'}</strong> → ${esc(fmtDate(ev.date, { day: 'numeric', month: 'long', year: 'numeric' }))} · ${esc(roundOf(ev)?.name || '')}, Abend ${ev.nr} bei ${esc(coupleName(ev.host))}</p>`;
        }).join('') || '<p>Kein Foto passt zu einem Abend mit Datum.</p>'}
        ${none.length ? `
          <p class="sort-row"><strong>${none.length} Foto${none.length === 1 ? '' : 's'}</strong> passen zu keinem Abend (anderer Tag oder kein Datum).</p>
          <label class="field-label" for="none-to">Was soll mit diesen passieren?</label>
          <select id="none-to">
            <option value="">nicht hochladen</option>
            ${allEvenings.map((ev) => `<option value="${esc(ev.id)}">zu ${esc(roundOf(ev)?.name || '')}, Abend ${ev.nr} (${esc(coupleName(ev.host))})</option>`).join('')}
          </select>` : ''}
        ${groups.size || none.length ? '<button type="button" class="btn btn-primary btn-wide" id="go">Hochladen</button>' : ''}
        <p class="upload-status" role="status"></p>
      </div>`;
    out.querySelector('#go')?.addEventListener('click', async (ev2) => {
      ev2.currentTarget.disabled = true;
      const target = out.querySelector('#none-to')?.value;
      if (target && none.length) groups.set(target, [...(groups.get(target) || []), ...none]);
      const st = out.querySelector('.upload-status');
      let total = 0;
      let failed = null;
      for (const [id, fs] of groups) {
        const res = await addPhotos(id, fs, 'teller', (i, n) => { st.textContent = `Bereite Foto ${i} von ${n} vor …`; }).catch((ex) => ({ uploaded: 0, error: ex }));
        total += res.uploaded;
        if (res.error) failed = res.error;
      }
      if (failed) toast(failed.status === 0 ? 'Gerade kein Netz – der Rest wird später hochgeladen.' : failed.message, 5000);
      else toast(`${total} Foto${total === 1 ? '' : 's'} hochgeladen`);
      location.hash = '#/';
    });
  });
}
