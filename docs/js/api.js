// Verbindung zum Worker. Der Ausweis (Token) liegt nur auf diesem Handy.
import { API } from './config.js?v=0.1.1';

const KEY = 'kochabend.';
export const store = {
  get: (k) => { try { return localStorage.getItem(KEY + k); } catch { return null; } },
  set: (k, v) => { try { v == null ? localStorage.removeItem(KEY + k) : localStorage.setItem(KEY + k, v); } catch { /* privat-Modus */ } },
};

// Zufällige Gerätekennung, nur zum Nachvollziehen (kein Schutz)
export function deviceId() {
  let id = store.get('device');
  if (!id) {
    id = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
    store.set('device', id);
  }
  return id;
}

export class ApiError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

async function call(path, { method = 'GET', body, auth = true } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = store.get('token');
  if (auth && token) headers.Authorization = `Bearer ${token}`;
  let res;
  try {
    res = await fetch(API + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
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

export async function login(code) {
  const { token } = await call('/api/login', { method: 'POST', body: { code, device: deviceId() }, auth: false });
  store.set('token', token);
}

export const loggedIn = () => Boolean(store.get('token'));
export const logout = () => { store.set('token', null); store.set('person', null); };

export const getPeople = () => call('/api/people');
