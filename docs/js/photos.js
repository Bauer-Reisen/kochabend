// Fotos am Handy vorbereiten und hochladen.
// - Aufnahmezeit wird vorher gelesen (für die Reihenfolge und den Datums-Hinweis).
// - Das Foto wird neu gezeichnet: dabei fallen alle versteckten Zusatzangaben weg, auch der Standort.
// - Groß (1600 px) für die Ansicht, klein (480 px) für die Übersicht.
// - Warteschlange im Handy: ohne Netz bleibt alles liegen und wird später hochgeladen.
import { uploadPhoto, newId } from './api.js?v=0.3.5';

const BIG = 1600;
const SMALL = 480;

// ---------- Aufnahmezeit aus den JPEG-Zusatzdaten (EXIF) ----------
export async function readTakenTime(file) {
  try {
    const buf = new DataView(await file.slice(0, 256 * 1024).arrayBuffer());
    if (buf.getUint16(0) !== 0xffd8) return null;
    let off = 2;
    while (off + 4 < buf.byteLength) {
      const marker = buf.getUint16(off);
      const len = buf.getUint16(off + 2);
      if (marker === 0xffe1 && buf.getUint32(off + 4) === 0x45786966) return parseExif(buf, off + 10);
      if ((marker & 0xff00) !== 0xff00) break;
      off += 2 + len;
    }
  } catch { /* egal */ }
  return null;
}

function parseExif(v, tiff) {
  const le = v.getUint16(tiff) === 0x4949;
  const u16 = (o) => v.getUint16(o, le);
  const u32 = (o) => v.getUint32(o, le);
  const readTags = (ifd) => {
    const out = {};
    const n = u16(ifd);
    for (let i = 0; i < n; i++) {
      const e = ifd + 2 + i * 12;
      out[u16(e)] = { type: u16(e + 2), count: u32(e + 4), value: e + 8 };
    }
    return out;
  };
  const str = (t) => {
    const at = t.count > 4 ? tiff + u32(t.value) : t.value;
    let s = '';
    for (let i = 0; i < t.count - 1; i++) s += String.fromCharCode(v.getUint8(at + i));
    return s;
  };
  const ifd0 = readTags(tiff + u32(tiff + 4));
  let text = null;
  if (ifd0[0x8769]) {
    const sub = readTags(tiff + u32(ifd0[0x8769].value));
    if (sub[0x9003]) text = str(sub[0x9003]);
  }
  if (!text && ifd0[0x0132]) text = str(ifd0[0x0132]);
  const m = /^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/.exec(text || '');
  return m ? new Date(+m[1], m[2] - 1, +m[3], +m[4], +m[5], +m[6]).getTime() : null;
}

// ---------- Verkleinern ----------
function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ img, url });
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Dieses Bild kann ich nicht lesen.')); };
    img.src = url; // der Browser dreht das Bild dabei richtig herum
  });
}

function draw(img, max, quality) {
  const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.round(img.naturalWidth * scale);
  const h = Math.round(img.naturalHeight * scale);
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, w, h);
  return new Promise((resolve, reject) => c.toBlob((b) => (b ? resolve({ blob: b, w, h }) : reject(new Error('Verkleinern ging nicht'))), 'image/jpeg', quality));
}

export async function prepare(file) {
  const taken = (await readTakenTime(file)) || null;
  const { img, url } = await loadImage(file);
  try {
    const big = await draw(img, BIG, 0.82);
    const small = await draw(img, SMALL, 0.72);
    return { id: newId(), taken, width: big.w, height: big.h, big: big.blob, small: small.blob, fallbackTime: file.lastModified || Date.now() };
  } finally {
    URL.revokeObjectURL(url);
  }
}

// ---------- Warteschlange (IndexedDB = Speicher im Browser) ----------
let dbp = null;
function idb() {
  if (!dbp) dbp = new Promise((resolve, reject) => {
    const r = indexedDB.open('kochabend', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('queue', { keyPath: 'id' });
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
  return dbp;
}
async function tx(mode, fn) {
  const db = await idb();
  return new Promise((resolve, reject) => {
    const t = db.transaction('queue', mode);
    const res = fn(t.objectStore('queue'));
    t.oncomplete = () => resolve(res && 'result' in res ? res.result : undefined);
    t.onerror = () => reject(t.error);
  });
}
const qAdd = (item) => tx('readwrite', (s) => s.put(item));
const qDel = (id) => tx('readwrite', (s) => s.delete(id));
export const qAll = () => tx('readonly', (s) => s.getAll());

const listeners = new Set();
export const onQueueChange = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
const notify = async (extra = {}) => { const items = await qAll().catch(() => []); listeners.forEach((fn) => fn(items, extra)); };

// Fotos vorbereiten, in die Warteschlange legen und gleich versuchen hochzuladen
export async function addPhotos(eveningId, files, kind = 'teller', onProgress = () => {}) {
  let i = 0;
  for (const f of files) {
    onProgress(++i, files.length);
    const p = await prepare(f);
    await qAdd({ ...p, evening: eveningId, kind, added: Date.now() });
  }
  await notify();
  return flush();
}

let flushing = null;
export function flush() {
  if (!flushing) flushing = (async () => {
    let uploaded = 0;
    let error = null;
    try {
      const items = (await qAll()).sort((a, b) => a.added - b.added);
      for (const it of items) {
        const form = new FormData();
        form.append('id', it.id);
        form.append('taken', String(it.taken || it.fallbackTime || ''));
        form.append('width', String(it.width));
        form.append('height', String(it.height));
        form.append('kind', it.kind || 'teller');
        form.append('big', it.big, 'big.jpg');
        form.append('small', it.small, 'small.jpg');
        try {
          await uploadPhoto(it.evening, form);
          await qDel(it.id);
          uploaded++;
          await notify({ uploaded });
        } catch (ex) {
          error = ex;
          // Unbrauchbare Fotos nicht ewig liegen lassen
          if ([400, 404, 413, 415].includes(ex.status)) await qDel(it.id);
          else break; // offline o. Ä.: später nochmal
        }
      }
    } finally {
      flushing = null;
      await notify({ done: true, uploaded, error });
    }
    return { uploaded, error };
  })();
  return flushing;
}

// Bei Netz, beim Zurückkehren in die App und regelmäßig weiterversuchen
addEventListener('online', () => flush());
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') flush(); });
setInterval(async () => { if ((await qAll().catch(() => [])).length) flush(); }, 30000);
