// Kleine Bausteine für die Oberfläche: Text absichern, Dialoge, Meldungen.

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Dialog mit Knöpfen. Liefert { value, fields } des gedrückten Knopfs (oder null).
export function dialog({ title, body = '', buttons = [{ label: 'OK', value: true, primary: true }] }) {
  return new Promise((resolve) => {
    const d = document.createElement('dialog');
    d.className = 'dlg';
    d.innerHTML = `
      <form novalidate>
        ${title ? `<h2>${esc(title)}</h2>` : ''}
        <div class="dlg-body">${body}</div>
        <div class="dlg-buttons">
          ${buttons.map((b, i) => `<button type="${b.primary ? 'submit' : 'button'}" class="btn ${b.primary ? 'btn-primary' : 'btn-quiet'}" value="${i}">${esc(b.label)}</button>`).join('')}
        </div>
      </form>`;
    document.body.append(d);
    const form = d.querySelector('form');
    let done = false;
    const finish = (btn) => {
      if (done) return;
      done = true;
      const fields = Object.fromEntries(new FormData(form).entries());
      if (d.open) d.close();
      d.remove();
      resolve(btn ? { value: btn.value, fields } : null);
    };
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      finish(buttons[e.submitter?.value] || buttons.find((b) => b.primary));
    });
    d.querySelectorAll('button[type="button"]').forEach((b) => b.addEventListener('click', () => finish(buttons[b.value])));
    d.addEventListener('cancel', (e) => { e.preventDefault(); finish(null); });
    d.showModal();
  });
}

// Kurze Meldung unten am Bildschirm
export function toast(text, ms = 3000) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.setAttribute('role', 'status');
  t.textContent = text;
  document.body.append(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, ms);
}
