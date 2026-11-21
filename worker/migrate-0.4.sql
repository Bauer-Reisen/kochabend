-- 0.4.0: mehrere Gerichte je Gang (Spalte pos). Einmal ausführen.
CREATE TABLE courses_new (
  evening_id TEXT NOT NULL REFERENCES evenings(id),
  kind       TEXT NOT NULL,
  pos        INTEGER NOT NULL DEFAULT 0,
  name       TEXT NOT NULL DEFAULT '',
  note       TEXT NOT NULL DEFAULT '',
  kids_note  TEXT NOT NULL DEFAULT '',
  idea_id    TEXT,
  updated_by TEXT,
  updated    INTEGER,
  PRIMARY KEY (evening_id, kind, pos)
);
INSERT INTO courses_new (evening_id, kind, pos, name, note, kids_note, idea_id, updated_by, updated)
  SELECT evening_id, kind, 0, name, note, kids_note, idea_id, updated_by, updated FROM courses;
DROP TABLE courses;
ALTER TABLE courses_new RENAME TO courses;
