-- Aufbau der Datenbank „kochabend" (Cloudflare D1).
-- Kann gefahrlos mehrmals ausgeführt werden: legt nur an, was fehlt.
-- Einspielen online: npx wrangler d1 execute kochabend --remote --file worker/schema.sql --config worker/wrangler.toml

CREATE TABLE IF NOT EXISTS couples (
  id   TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sort INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS persons (
  id        TEXT PRIMARY KEY,
  name      TEXT NOT NULL,
  couple_id TEXT NOT NULL REFERENCES couples(id),
  sort      INTEGER NOT NULL
);

INSERT OR IGNORE INTO couples (id, name, sort) VALUES
  ('marco-mareike', 'Marco & Mareike', 1),
  ('steffi-ali',    'Steffi & Ali',    2),
  ('clari-domi',    'Clari & Domi',    3);

INSERT OR IGNORE INTO persons (id, name, couple_id, sort) VALUES
  ('marco',   'Marco',   'marco-mareike', 1),
  ('mareike', 'Mareike', 'marco-mareike', 2),
  ('steffi',  'Steffi',  'steffi-ali',    3),
  ('ali',     'Ali',     'steffi-ali',    4),
  ('clari',   'Clari',   'clari-domi',    5),
  ('domi',    'Domi',    'clari-domi',    6);
