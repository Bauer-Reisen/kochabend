// Cloudflare Worker „kochabend": die einzige Tür zu den geteilten Daten und Fotos.
// - Zugang nur mit dem gemeinsamen Code (Secret GROUP_CODE, im Cloudflare-Dashboard eingetragen).
// - Wer den Code richtig eingibt, bekommt einen Ausweis (Token), den das Handy aufhebt.
// - Ändert man den Code im Dashboard, werden alle alten Ausweise und Foto-Adressen ungültig.
// - Das Menü eines Abends gibt der Worker an Gäste erst heraus, wenn die Gastgeber es freigeben
//   (oder der Abend vorbei ist). Verstecken nur in der App würde nicht reichen.
// Hier im Code steht nichts Geheimes.

const TOKEN_DAYS = 400;        // Ausweis gilt gut ein Jahr
const MAX_PHOTOS_PER_DAY = 400; // Bremse gegen versehentliches Massen-Hochladen (alle zusammen)
const MAX_BIG = 3_000_000;     // Bytes je großes Foto (die App schickt ca. 300 KB)
const MAX_SMALL = 400_000;
const KINDS = ['vor', 'haupt', 'nach'];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Fotos: Adresse mit eigener Unterschrift je Foto (kein Ausweis in der Adresse)
    if (url.pathname.startsWith('/f/') && request.method === 'GET') return servePhoto(url, env);

    const origin = request.headers.get('Origin') || '';
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
    const cors = allowed.includes(origin)
      ? {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-Person',
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
        const token = await makeToken(env, { iat: Date.now(), dev: String(body.device || '').slice(0, 40) });
        return reply(200, { token });
      }

      // ---------- Ab hier nur mit gültigem Ausweis ----------
      const auth = await checkToken(env, request.headers.get('Authorization'));
      if (!auth) return reply(401, { error: 'Bitte neu anmelden.' });

      const db = env.DB;
      const all = async (sql, ...args) => (await db.prepare(sql).bind(...args).all()).results;
      const one = (sql, ...args) => db.prepare(sql).bind(...args).first();
      const run = (sql, ...args) => db.prepare(sql).bind(...args).run();

      const path = url.pathname;
      const method = request.method;

      if (path === '/api/people' && method === 'GET') {
        return reply(200, {
          couples: await all('SELECT id, name, sort FROM couples ORDER BY sort'),
          persons: await all('SELECT id, name, couple_id AS couple, sort FROM persons ORDER BY sort'),
          kids: await all('SELECT couple_id AS couple, birth_year FROM kids ORDER BY birth_year'),
        });
      }

      // Wer bin ich? (Name aus der Auswahl; reicht unter sechs Freunden)
      const me = await one('SELECT id, name, couple_id AS couple FROM persons WHERE id = ?', request.headers.get('X-Person') || '');
      if (!me) return reply(400, { error: 'Bitte zuerst deinen Namen wählen.' });

      // ---------- Überblick: alle Runden und Abende ----------
      if (path === '/api/state' && method === 'GET') {
        const rounds = await all('SELECT id, kueche, name, status, created FROM rounds ORDER BY created');
        const evenings = await all(`
          SELECT e.id, e.round_id AS round, e.nr, e.date, e.host, e.released, e.cover_photo AS cover,
            (SELECT COUNT(*) FROM photos p WHERE p.evening_id = e.id AND p.hidden = 0 AND p.kind = 'teller') AS photos,
            (SELECT COUNT(*) FROM quotes q WHERE q.evening_id = e.id) AS quotes
          FROM evenings e ORDER BY e.round_id, e.nr`);
        const attendance = await all('SELECT evening_id AS evening, couple_id AS couple, with_kids FROM attendance');
        return reply(200, { rounds, evenings, attendance, today: today() });
      }

      // ---------- Schon gekochte Gerichte einer Küche (für die Ideen) ----------
      // Nur offene Menüs (freigegeben oder vergangen) und die eigenen – sonst würde ein geheimes Menü verraten.
      if (path === '/api/cooked' && method === 'GET') {
        const k = url.searchParams.get('kueche') || '';
        const rows = await all(`
          SELECT c.kind, c.name, c.idea_id, e.id AS evening, e.nr, e.host, e.date, e.released
          FROM courses c JOIN evenings e ON e.id = c.evening_id JOIN rounds r ON r.id = e.round_id
          WHERE r.kueche = ? AND c.name <> ''`, k);
        const t = today();
        return reply(200, {
          cooked: rows
            .filter((x) => x.released === 1 || (x.date && x.date < t) || x.host === me.couple)
            .map(({ released, ...x }) => x),
        });
      }

      // ---------- Ein Abend ----------
      let m = /^\/api\/evening\/([\w-]+)(?:\/(\w+))?$/.exec(path);
      if (m) {
        const ev = await one('SELECT id, round_id AS round, nr, date, host, released, cover_photo AS cover, version FROM evenings WHERE id = ?', m[1]);
        if (!ev) return reply(404, { error: 'Diesen Abend gibt es nicht.' });
        const isHost = me.couple === ev.host;
        const action = m[2] || '';

        if (!action && method === 'GET') {
          const menuOpen = isHost || ev.released === 1 || (ev.date && ev.date < today());
          const courses = menuOpen
            ? await all('SELECT kind, name, note, kids_note, idea_id, updated_by FROM courses WHERE evening_id = ?', ev.id)
            : [];
          const filled = (await one("SELECT COUNT(*) AS n FROM courses WHERE evening_id = ? AND name <> ''", ev.id)).n;
          const photos = await all(`
            SELECT id, by_person AS by, taken, width, height, kind, created,
              (SELECT group_concat(person_id) FROM hearts h WHERE h.photo_id = photos.id) AS hearts
            FROM photos WHERE evening_id = ? AND hidden = 0 ORDER BY COALESCE(taken, created)`, ev.id);
          const exp = urlExpiry();
          for (const p of photos) {
            p.hearts = p.hearts ? p.hearts.split(',') : [];
            p.big = await signedPath(env, `${p.id}.jpg`, exp);
            p.small = await signedPath(env, `${p.id}_s.jpg`, exp);
          }
          return reply(200, {
            evening: { ...ev, menuOpen, isHost, menuFilled: filled },
            courses,
            attendance: await all('SELECT couple_id AS couple, with_kids, updated_by FROM attendance WHERE evening_id = ?', ev.id),
            photos,
            quotes: await all('SELECT id, text, said_by, by_person AS by, created FROM quotes WHERE evening_id = ? ORDER BY created', ev.id),
            impressions: await all('SELECT person_id AS person, text, updated FROM impressions WHERE evening_id = ? ORDER BY updated', ev.id),
          });
        }

        // Menü speichern (nur Gastgeber)
        if (action === 'courses' && method === 'PUT') {
          if (!isHost) return reply(403, { error: 'Das Menü tragen die Gastgeber ein.' });
          const body = await request.json();
          const now = Date.now();
          const stmts = [];
          for (const c of body.courses || []) {
            if (!KINDS.includes(c.kind)) continue;
            stmts.push(db.prepare(`
              INSERT INTO courses (evening_id, kind, name, note, kids_note, idea_id, updated_by, updated)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT (evening_id, kind) DO UPDATE SET name = excluded.name, note = excluded.note,
                kids_note = excluded.kids_note, idea_id = excluded.idea_id, updated_by = excluded.updated_by, updated = excluded.updated`)
              .bind(ev.id, c.kind, clip(c.name, 120), clip(c.note, 2000), clip(c.kids_note, 1000), c.idea_id ? clip(c.idea_id, 60) : null, me.id, now));
          }
          if (stmts.length) await db.batch(stmts);
          return reply(200, { ok: true });
        }

        // Menü freigeben / wieder verdecken (nur Gastgeber)
        if (action === 'release' && method === 'POST') {
          if (!isHost) return reply(403, { error: 'Das Menü geben die Gastgeber frei.' });
          const body = await request.json().catch(() => ({}));
          await run('UPDATE evenings SET released = ? WHERE id = ?', body.released === false ? 0 : 1, ev.id);
          return reply(200, { ok: true });
        }

        // Datum ändern (alle dürfen)
        if (action === 'date' && method === 'PUT') {
          const body = await request.json();
          const date = /^\d{4}-\d{2}-\d{2}$/.test(body.date || '') ? body.date : null;
          await run('UPDATE evenings SET date = ?, version = version + 1 WHERE id = ?', date, ev.id);
          return reply(200, { ok: true });
        }

        // Mit oder ohne Kinder (für das eigene Paar)
        if (action === 'kids' && method === 'PUT') {
          const body = await request.json();
          const v = body.with_kids === true ? 1 : body.with_kids === false ? 0 : null;
          await run(`INSERT INTO attendance (evening_id, couple_id, with_kids, updated_by) VALUES (?, ?, ?, ?)
            ON CONFLICT (evening_id, couple_id) DO UPDATE SET with_kids = excluded.with_kids, updated_by = excluded.updated_by`,
            ev.id, me.couple, v, me.id);
          return reply(200, { ok: true });
        }

        // Titelbild wählen (Gastgeber)
        if (action === 'cover' && method === 'PUT') {
          if (!isHost) return reply(403, { error: 'Das Titelbild wählen die Gastgeber.' });
          const body = await request.json();
          await run('UPDATE evenings SET cover_photo = ? WHERE id = ?', body.photo || null, ev.id);
          return reply(200, { ok: true });
        }

        // Spruch
        if (action === 'quotes' && method === 'POST') {
          const body = await request.json();
          const text = clip(body.text, 600).trim();
          if (!text) return reply(400, { error: 'Bitte einen Spruch eintippen.' });
          const id = /^[\w-]{8,40}$/.test(body.id || '') ? body.id : crypto.randomUUID();
          await run('INSERT OR IGNORE INTO quotes (id, evening_id, text, said_by, by_person, created) VALUES (?, ?, ?, ?, ?, ?)',
            id, ev.id, text, clip(body.said_by, 40) || '?', me.id, Number(body.created) || Date.now());
          return reply(200, { ok: true, id });
        }

        // Eindruck (je Person einer, wird überschrieben)
        if (action === 'impression' && method === 'PUT') {
          const body = await request.json();
          const text = clip(body.text, 1000).trim();
          if (!text) await run('DELETE FROM impressions WHERE evening_id = ? AND person_id = ?', ev.id, me.id);
          else await run(`INSERT INTO impressions (evening_id, person_id, text, updated) VALUES (?, ?, ?, ?)
            ON CONFLICT (evening_id, person_id) DO UPDATE SET text = excluded.text, updated = excluded.updated`, ev.id, me.id, text, Date.now());
          return reply(200, { ok: true });
        }

        // Foto hochladen: großes + kleines Bild, beide schon am Handy verkleinert
        if (action === 'photos' && method === 'POST') {
          const form = await request.formData();
          const id = String(form.get('id') || '');
          if (!/^[\w-]{8,40}$/.test(id)) return reply(400, { error: 'Ungültige Foto-Kennung' });
          if (await one('SELECT id FROM photos WHERE id = ?', id)) return reply(200, { ok: true, id, already: true });
          const recent = (await one('SELECT COUNT(*) AS n FROM photos WHERE created > ?', Date.now() - 86400000)).n;
          if (recent >= MAX_PHOTOS_PER_DAY) return reply(429, { error: 'Für heute sind genug Fotos hochgeladen. Morgen geht es weiter.' });
          const big = form.get('big');
          const small = form.get('small');
          if (!(big instanceof File) || !(small instanceof File)) return reply(400, { error: 'Foto fehlt' });
          if (big.size > MAX_BIG || small.size > MAX_SMALL) return reply(413, { error: 'Foto zu groß' });
          const bigBuf = await big.arrayBuffer();
          const smallBuf = await small.arrayBuffer();
          if (!isJpeg(bigBuf) || !isJpeg(smallBuf)) return reply(415, { error: 'Nur JPEG-Fotos' });
          const meta = { httpMetadata: { contentType: 'image/jpeg', cacheControl: 'private, max-age=31536000, immutable' } };
          await env.FOTOS.put(`${id}.jpg`, bigBuf, meta);
          await env.FOTOS.put(`${id}_s.jpg`, smallBuf, meta);
          const kind = form.get('kind') === 'kochbuch' ? 'kochbuch' : 'teller';
          await run('INSERT OR IGNORE INTO photos (id, evening_id, by_person, taken, width, height, kind, created) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            id, ev.id, me.id, Number(form.get('taken')) || null, Number(form.get('width')) || 0, Number(form.get('height')) || 0, kind, Date.now());
          return reply(200, { ok: true, id });
        }
      }

      // ---------- Einzelnes Foto ----------
      m = /^\/api\/photo\/([\w-]+)(?:\/(heart))?$/.exec(path);
      if (m) {
        const p = await one('SELECT p.id, p.by_person, e.host FROM photos p JOIN evenings e ON e.id = p.evening_id WHERE p.id = ?', m[1]);
        if (!p) return reply(404, { error: 'Foto nicht gefunden' });
        if (m[2] === 'heart' && method === 'POST') {
          const has = await one('SELECT 1 AS x FROM hearts WHERE photo_id = ? AND person_id = ?', p.id, me.id);
          if (has) await run('DELETE FROM hearts WHERE photo_id = ? AND person_id = ?', p.id, me.id);
          else await run('INSERT INTO hearts (photo_id, person_id) VALUES (?, ?)', p.id, me.id);
          return reply(200, { ok: true, heart: !has });
        }
        if (!m[2] && method === 'DELETE') {
          if (p.by_person !== me.id && p.host !== me.couple) return reply(403, { error: 'Löschen dürfen nur, wer es hochgeladen hat, und die Gastgeber.' });
          await env.FOTOS.delete([`${p.id}.jpg`, `${p.id}_s.jpg`]);
          await db.batch([
            db.prepare('DELETE FROM hearts WHERE photo_id = ?').bind(p.id),
            db.prepare('DELETE FROM photos WHERE id = ?').bind(p.id),
            db.prepare('UPDATE evenings SET cover_photo = NULL WHERE cover_photo = ?').bind(p.id),
          ]);
          return reply(200, { ok: true });
        }
      }

      // ---------- Spruch löschen ----------
      m = /^\/api\/quote\/([\w-]+)$/.exec(path);
      if (m && method === 'DELETE') {
        const q = await one('SELECT id, by_person FROM quotes WHERE id = ?', m[1]);
        if (!q) return reply(200, { ok: true });
        if (q.by_person !== me.id) return reply(403, { error: 'Löschen darf nur, wer den Spruch eingetragen hat.' });
        await run('DELETE FROM quotes WHERE id = ?', q.id);
        return reply(200, { ok: true });
      }

      return reply(404, { error: 'Unbekannte Adresse' });
    } catch (err) {
      return reply(500, { error: 'Fehler im Worker', detail: String((err && err.message) || err) });
    }
  },
};

// ---------- Hilfen ----------
const clip = (s, n) => String(s ?? '').slice(0, n);
const normCode = (s) => String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');
const isJpeg = (buf) => { const b = new Uint8Array(buf, 0, 3); return b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff; };

// Heutiges Datum in Deutschland als JJJJ-MM-TT
const today = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin' }).format(new Date());

// ---------- Ausweis (Token) ----------
const enc = new TextEncoder();
const b64url = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromB64url = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));

async function hmacKey(env, purpose = 'kochabend-v1') {
  return crypto.subtle.importKey('raw', enc.encode(purpose + '|' + normCode(env.GROUP_CODE)), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
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

async function sameText(a, b) {
  const [x, y] = await Promise.all([a, b].map((s) => crypto.subtle.digest('SHA-256', enc.encode(s))));
  const u = new Uint8Array(x);
  const v = new Uint8Array(y);
  let diff = 0;
  for (let i = 0; i < u.length; i++) diff |= u[i] ^ v[i];
  return diff === 0;
}

// ---------- Foto-Adressen ----------
// Jede Adresse gilt nur für ein Foto und läuft ab. Das Ablaufdatum springt in 30-Tage-Schritten,
// damit dieselbe Adresse eine Weile gleich bleibt (dann kann das Handy das Foto zwischenspeichern).
const STEP = 30 * 86400;
const urlExpiry = () => (Math.floor(Date.now() / 1000 / STEP) + 2) * STEP;

async function signedPath(env, file, exp) {
  const sig = await crypto.subtle.sign('HMAC', await hmacKey(env, 'foto-v1'), enc.encode(`${file}|${exp}`));
  return `/f/${file}?e=${exp}&s=${b64url(sig).slice(0, 32)}`;
}

async function servePhoto(url, env) {
  const file = url.pathname.slice(3);
  const exp = Number(url.searchParams.get('e'));
  const sig = url.searchParams.get('s') || '';
  if (!env.GROUP_CODE || !/^[\w-]+(_s)?\.jpg$/.test(file) || !exp || exp * 1000 < Date.now()) return new Response('Abgelaufen', { status: 403 });
  const want = (await signedPath(env, file, exp)).split('&s=')[1];
  if (!(await sameText(sig, want))) return new Response('Nicht erlaubt', { status: 403 });
  const obj = await env.FOTOS.get(file);
  if (!obj) return new Response('Nicht gefunden', { status: 404 });
  return new Response(obj.body, {
    headers: {
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'private, max-age=2592000, immutable',
      'Access-Control-Allow-Origin': '*', // nötig, damit die App Fotos für „ohne Netz" aufheben kann; Schutz = Unterschrift
    },
  });
}
