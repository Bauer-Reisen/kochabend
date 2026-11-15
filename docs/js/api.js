// Verbindung zum Worker. Der Ausweis (Token) liegt nur auf diesem Handy.
import { API } from './config.js?v=0.2.3';

const KEY = 'kochabend.';
export const store = {
  get: (k) => { try { return localStorage.getItem(KEY + k); } catch { return null; } },
  set: (k, v) => { try { v == null ? localStorage.removeItem(KEY + k) : localStorage.setItem(KEY + k, v); } catch { /* privat-Modus */ } },
};

// Zufällige Kennung (für Geräte, Fotos, Sprüche)
export const newId = () => (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36));

export function deviceId() {
  let id = store.get('device');
  if (!id) { id = newId().slice(0, 18); store.set('device', id); }
  return id;
}

export class ApiError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

export async function call(path, { method = 'GET', body, form, auth = true } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = store.get('token');
  if (auth && token) headers.Authorization = `Bearer ${token}`;
  const person = store.get('person');
  if (person) headers['X-Person'] = person;
  let res;
  try {
    res = await fetch(API + path, { method, headers, body: form || (body === undefined ? undefined : JSON.stringify(body)) });
  } catch {
    throw new ApiError(0, 'Keine Verbindung. Bist du online?');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && auth) store.set('token', null); // Ausweis abgelaufen oder Code geändert
    throw new ApiError(res.status, data.error || `Fehler ${res.status}`);
  }
  return data;
}

// Foto-Adresse (vom Worker unterschrieben) → volle Adresse
export const photoUrl = (path) => API + path;

export async function login(code) {
  const { token } = await call('/api/login', { method: 'POST', body: { code, device: deviceId() }, auth: false });
  store.set('token', token);
}

export const loggedIn = () => Boolean(store.get('token'));
export const logout = () => { store.set('token', null); store.set('person', null); };

export const getPeople = () => call('/api/people');
export const getState = () => call('/api/state');
export const getEvening = (id) => call(`/api/evening/${id}`);
export const getCooked = (kueche) => call(`/api/cooked?kueche=${encodeURIComponent(kueche)}`);
export const saveCourses = (id, courses) => call(`/api/evening/${id}/courses`, { method: 'PUT', body: { courses } });
export const setReleased = (id, released) => call(`/api/evening/${id}/release`, { method: 'POST', body: { released } });
export const setDate = (id, date) => call(`/api/evening/${id}/date`, { method: 'PUT', body: { date } });
export const setKids = (id, withKids) => call(`/api/evening/${id}/kids`, { method: 'PUT', body: { with_kids: withKids } });
export const setCover = (id, photo) => call(`/api/evening/${id}/cover`, { method: 'PUT', body: { photo } });
export const addQuote = (id, q) => call(`/api/evening/${id}/quotes`, { method: 'POST', body: q });
export const deleteQuote = (qid) => call(`/api/quote/${qid}`, { method: 'DELETE' });
export const saveImpression = (id, text) => call(`/api/evening/${id}/impression`, { method: 'PUT', body: { text } });
export const toggleHeart = (pid) => call(`/api/photo/${pid}/heart`, { method: 'POST' });
export const deletePhoto = (pid) => call(`/api/photo/${pid}`, { method: 'DELETE' });
export const uploadPhoto = (eveningId, form) => call(`/api/evening/${eveningId}/photos`, { method: 'POST', form });
