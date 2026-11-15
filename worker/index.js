// Cloudflare Worker „kochabend": die einzige Tür zu den geteilten Daten.
// - Zugang nur mit dem gemeinsamen Code (Secret GROUP_CODE, im Cloudflare-Dashboard eingetragen).
// - Wer den Code richtig eingibt, bekommt einen Ausweis (Token), den das Handy aufhebt.
// - Ändert man den Code im Dashboard, werden alle alten Ausweise ungültig.
// Hier im Code steht nichts Geheimes.

const TOKEN_DAYS = 400; // Ausweis gilt gut ein Jahr, danach einmal neu den Code eingeben

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
    const cors = allowed.includes(origin)
      ? {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Authorization, Content-Type',
          Vary: 'Origin',
        }
      : {};
    const reply = (status, body) =>
      new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...cors },
      });

    if (url.pathname === '/api/health') return reply(200, { ok: true, code: Boolean(env.GROUP_CODE) });
    if (!cors['Access-Control-Allow-Origin']) return reply(403, { error: 'Herkunft nicht erlaubt' });
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...cors, 'Access-Control-Max-Age': '86400' } });
    if (!env.GROUP_CODE) return reply(503, { error: 'Der gemeinsame Code ist noch nicht eingerichtet.' });

    try {
      // ---------- Anmelden ----------
      if (url.pathname === '/api/login' && request.method === 'POST') {
        const ip = request.headers.get('CF-Connecting-IP') || 'lokal';
        if (env.LOGIN_LIMITER) {
          const { success } = await env.LOGIN_LIMITER.limit({ key: ip });
          if (!success) return reply(429, { error: 'Zu viele Versuche. Bitte eine Minute warten.' });
        }
        const body = await request.json().catch(() => ({}));
        const code = normCode(body.code);
        if (!code || !(await sameText(code, normCode(env.GROUP_CODE)))) return reply(401, { error: 'Der Code stimmt nicht.' });
        const dev = String(body.device || '').slice(0, 40);
        const token = await makeToken(env, { iat: Date.now(), dev });
        return reply(200, { token });
      }

      // ---------- Ab hier nur mit gültigem Ausweis ----------
      const auth = await checkToken(env, request.headers.get('Authorization'));
      if (!auth) return reply(401, { error: 'Bitte neu anmelden.' });

      if (url.pathname === '/api/people' && request.method === 'GET') {
        const couples = (await env.DB.prepare('SELECT id, name, sort FROM couples ORDER BY sort').all()).results;
        const persons = (await env.DB.prepare('SELECT id, name, couple_id AS couple, sort FROM persons ORDER BY sort').all()).results;
        return reply(200, { couples, persons });
      }

      return reply(404, { error: 'Unbekannte Adresse' });
    } catch (err) {
      return reply(500, { error: 'Fehler im Worker', detail: String((err && err.message) || err) });
    }
  },
};

// Groß/Kleinschreibung und Leerzeichen sind beim Code egal
const normCode = (s) => String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');

// ---------- Ausweis (Token) ----------
// Aufbau: <Inhalt>.<Unterschrift>. Unterschrieben mit dem gemeinsamen Code.
const enc = new TextEncoder();
const b64url = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromB64url = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));

async function hmacKey(env) {
  return crypto.subtle.importKey('raw', enc.encode('kochabend-v1|' + normCode(env.GROUP_CODE)), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

async function makeToken(env, data) {
  const payload = b64url(enc.encode(JSON.stringify(data)));
  const sig = await crypto.subtle.sign('HMAC', await hmacKey(env), enc.encode(payload));
  return `${payload}.${b64url(sig)}`;
}

async function checkToken(env, header) {
  const m = /^Bearer ([\w-]+)\.([\w-]+)$/.exec(header || '');
  if (!m) return null;
  try {
    const ok = await crypto.subtle.verify('HMAC', await hmacKey(env), fromB64url(m[2]), enc.encode(m[1]));
    if (!ok) return null;
    const data = JSON.parse(new TextDecoder().decode(fromB64url(m[1])));
    if (!data.iat || Date.now() - data.iat > TOKEN_DAYS * 86400000) return null;
    return data;
  } catch {
    return null;
  }
}

// Vergleich, der nicht verrät, wie viele Zeichen schon stimmen
async function sameText(a, b) {
  const [x, y] = await Promise.all([a, b].map((s) => crypto.subtle.digest('SHA-256', enc.encode(s))));
  const u = new Uint8Array(x);
  const v = new Uint8Array(y);
  let diff = 0;
  for (let i = 0; i < u.length; i++) diff |= u[i] ^ v[i];
  return diff === 0;
}
