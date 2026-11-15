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
  ('marco-mareike', 'Mareike & Marco', 1),
  ('steffi-ali',    'Steffi & Ali',    2),
  ('clari-domi',    'Clari & Domi',    3);

INSERT OR IGNORE INTO persons (id, name, couple_id, sort) VALUES
  ('mareike', 'Mareike', 'marco-mareike', 1),
  ('marco',   'Marco',   'marco-mareike', 2),
  ('steffi',  'Steffi',  'steffi-ali',    3),
  ('ali',     'Ali',     'steffi-ali',    4),
  ('clari',   'Clari',   'clari-domi',    5),
  ('domi',    'Domi',    'clari-domi',    6);

-- ---------- Ab Version 0.2: Kinder, Runden, Abende, Füttern ----------

-- Kinder je Paar (Geburtsjahr, damit das Alter mitwächst)
CREATE TABLE IF NOT EXISTS kids (
  id         TEXT PRIMARY KEY,
  couple_id  TEXT NOT NULL REFERENCES couples(id),
  birth_year INTEGER NOT NULL
);
INSERT OR IGNORE INTO kids (id, couple_id, birth_year) VALUES
  ('mm-1', 'marco-mareike', 2022), ('mm-2', 'marco-mareike', 2024),
  ('sa-1', 'steffi-ali', 2017),    ('sa-2', 'steffi-ali', 2020);

-- Runde = ein Land (Kapitel). kueche = Kennung aus docs/js/kuechen.js
CREATE TABLE IF NOT EXISTS rounds (
  id      TEXT PRIMARY KEY,
  kueche  TEXT NOT NULL,
  name    TEXT NOT NULL,
  status  TEXT NOT NULL DEFAULT 'laeuft',  -- laeuft | fertig
  created INTEGER NOT NULL
);

-- Abend: Nr. 1–3 einer Runde, ein Gastgeberpaar
CREATE TABLE IF NOT EXISTS evenings (
  id          TEXT PRIMARY KEY,
  round_id    TEXT NOT NULL REFERENCES rounds(id),
  nr          INTEGER NOT NULL,
  date        TEXT,                -- JJJJ-MM-TT, darf leer sein
  host        TEXT NOT NULL REFERENCES couples(id),
  released    INTEGER NOT NULL DEFAULT 0,  -- Menü freigegeben?
  cover_photo TEXT,
  version     INTEGER NOT NULL DEFAULT 1
);

-- Gänge: vor | haupt | nach
CREATE TABLE IF NOT EXISTS courses (
  evening_id TEXT NOT NULL REFERENCES evenings(id),
  kind       TEXT NOT NULL,
  name       TEXT NOT NULL DEFAULT '',
  note       TEXT NOT NULL DEFAULT '',
  kids_note  TEXT NOT NULL DEFAULT '',
  idea_id    TEXT,
  updated_by TEXT,
  updated    INTEGER,
  PRIMARY KEY (evening_id, kind)
);

-- Wer kommt mit Kindern? (je Abend und Gast-Paar; NULL = noch nicht gesagt)
CREATE TABLE IF NOT EXISTS attendance (
  evening_id TEXT NOT NULL REFERENCES evenings(id),
  couple_id  TEXT NOT NULL REFERENCES couples(id),
  with_kids  INTEGER,
  updated_by TEXT,
  PRIMARY KEY (evening_id, couple_id)
);

CREATE TABLE IF NOT EXISTS photos (
  id         TEXT PRIMARY KEY,     -- auf dem Handy erzeugt (doppelt senden = nur ein Foto)
  evening_id TEXT NOT NULL REFERENCES evenings(id),
  by_person  TEXT NOT NULL,
  taken      INTEGER,              -- Aufnahmezeit (ms), sonst Hochladezeit
  width      INTEGER NOT NULL,
  height     INTEGER NOT NULL,
  kind       TEXT NOT NULL DEFAULT 'teller',  -- teller | kochbuch
  hidden     INTEGER NOT NULL DEFAULT 0,
  created    INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS hearts (
  photo_id  TEXT NOT NULL,
  person_id TEXT NOT NULL,
  PRIMARY KEY (photo_id, person_id)
);

CREATE TABLE IF NOT EXISTS quotes (
  id         TEXT PRIMARY KEY,
  evening_id TEXT NOT NULL REFERENCES evenings(id),
  text       TEXT NOT NULL,
  said_by    TEXT NOT NULL,        -- Personen-Kennung oder freier Name
  by_person  TEXT NOT NULL,
  created    INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS impressions (
  evening_id TEXT NOT NULL REFERENCES evenings(id),
  person_id  TEXT NOT NULL,
  text       TEXT NOT NULL,
  updated    INTEGER NOT NULL,
  PRIMARY KEY (evening_id, person_id)
);

-- Aktuelle Runde: Griechenland
INSERT OR IGNORE INTO rounds (id, kueche, name, status, created) VALUES
  ('r-griechenland', 'griechenland', 'Griechenland', 'laeuft', 1792800000000);
INSERT OR IGNORE INTO evenings (id, round_id, nr, date, host, released) VALUES
  ('e-gr-1', 'r-griechenland', 1, '2026-10-24', 'marco-mareike', 1),
  ('e-gr-2', 'r-griechenland', 2, '2026-11-21', 'steffi-ali', 0),
  ('e-gr-3', 'r-griechenland', 3, '2027-01-23', 'clari-domi', 0);

-- 16.11.2026: Frauen zuerst nennen (Wunsch der Gruppe)
UPDATE couples SET name = 'Mareike & Marco' WHERE id = 'marco-mareike';
UPDATE persons SET sort = 1 WHERE id = 'mareike';
UPDATE persons SET sort = 2 WHERE id = 'marco';
