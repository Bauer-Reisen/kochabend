# „In 80 Küchen um die Welt" (Kochabend-App) – Stand

App-Name seit 0.1.1: „In 80 Küchen um die Welt", auf dem Home-Bildschirm „80 Küchen". Repo und Worker heißen weiter „kochabend".

Plan: siehe PLAN.md. Nach jedem Abschnitt: veröffentlichen, Link + Testpunkte nennen, auf Okay warten.

## Eingerichtet
- Ordner `C:\Users\Steffi\Documents\Kochabend-App`, GitHub-Repo https://github.com/Bauer-Reisen/kochabend (öffentlich, hochgeladen 15.11.2026). Pages: Branch `main`, Ordner `/docs` (eingeschaltet, live geprüft 15.11.2026). Adresse: https://bauer-reisen.github.io/kochabend/
- Zahlungsart bei Cloudflare hinterlegt, R2 aktiviert (15.11.2026). Speicher `kochabend-fotos` (Ort Osteuropa/eeur) angelegt und als `FOTOS` an den Worker gebunden (Version 6aebc4d3).
- Worker online: https://kochabend.film-app.workers.dev (Version 3df3e635). Erlaubt nur bauer-reisen.github.io und localhost:5800. 10 Code-Versuche pro Minute.
- D1-Datenbank `kochabend` (438de803-…), Tabellen couples + persons mit den 6 Namen.
- Secret `GROUP_CODE`: gesetzt vom Nutzer (15.11.2026), online geprüft (falscher Code → 401 von github.io aus). `/api/health` zeigt `code: true/false`.
- Zahlungsart bei Cloudflare + R2: Nutzerin will Karte hinterlegen; R2 erst für Abschnitt 2 nötig.

## Lokal testen
- Vorschau-Einträge in `Uebergabe-App\.claude\launch.json`: `kochabend-worker` (Port 8787, lokale D1, Test-Code in `worker/.dev.vars`, nicht im Repo) und `kochabend` (Port 5800).
- Lokale DB füllen: `npx wrangler d1 execute kochabend --local --file worker/schema.sql --config worker/wrangler.toml`
- Worker hochladen: `NODE_USE_SYSTEM_CA=1 npx wrangler deploy --config worker/wrangler.toml`
- Neue Version: `node scripts/set-version.js 0.x.0`, vor dem Hochladen `npm run check-secrets`.

## Abschnitte
- [x] **0 – Gerüst** (15.11.2026, Version 0.1.0): Code-Eingabe (Groß/Klein egal), Ausweis 400 Tage, „Wer bist du?" (3 Paare), Startseite mit Ausblick, Homescreen-Hinweis (iPhone/Android), Rundgang (6 Karten), „Was ist neu?"-Gerüst, Auto-Update über version.json, Icon Teller+Besteck, Schriften Fraunces/Lora/Caveat selbst gehostet. Lokal geprüft bei 375 px: falscher Code abgelehnt, Name gewählt, Rundgang, bleibt nach Neuladen angemeldet, kein Querscrollen. Online geprüft: fremde Herkunft 403. **Am Handy noch nicht getestet** (wartet auf Repo + Code).
- [~] **1 – Runden & Abende** (teilweise, Version 0.2.0, 15.11.2026): Griechenland mit 3 Abenden in der DB (24.10.2026 Mareike & Marco, 21.11.2026 Steffi & Ali, 23.01.2027 Clari & Domi), Kinder je Paar (Geburtsjahre geschätzt: Mareike & Marco 2022/2024, Steffi & Ali 2017/2020), „mit/ohne Kinder" je Gast-Paar, Datum ändern. **Offen:** Runde anlegen mit Vorrücken, Terminfinder pro Paar (Fr/Sa/So + Feiertage Bayern + Vorabend), Kalender-Abo – bis 23.01.2027.
- [x] **2 – Füttern** (Version 0.2.0): Abend-Seite mit Menü (nur Gastgeber bearbeiten, Worker gibt es Gästen erst nach „Menü freigeben" oder nach dem Abend), Fotos (1600/480 px JPEG, EXIF-Aufnahmezeit, Warteschlange in IndexedDB, Datums-Nachfrage, Suchfeld-Tipp), Großansicht mit Wischen, Herz, Titelbild (Gastgeber), Löschen (eigene/Gastgeber), Sprüche mit „Wer hat's gesagt?" (Pflicht), Eindrücke. „Fotos einsortieren": viele Fotos nach Aufnahmetag (6 Uhr bis 6 Uhr) auf Abende verteilen. Ideen Griechenland je Gang mit Kinder-Variante, „Für unseren Abend" übernimmt die Idee. Foto-Adressen mit eigener Unterschrift je Foto (30-Tage-Schritte). Lokal geprüft (375 px): Gast bekommt kein Menü, Nicht-Gastgeber darf nicht ändern (403), gefälschte Foto-Adresse 403. **Am iPhone noch nicht geprüft:** Aufnahmedatum beim Auswählen, HEIC → JPEG, Warteschlange offline.
- [x] **0.2.3** (15.11.2026): Ideen blenden schon Gekochtes derselben Küche aus (nur offene Menüs: freigegeben, vergangen oder eigene; der eigene Abend zählt nicht), unten Hinweis „Schon gekocht". Griechenland jetzt 16/18/14 Ideen, je Gang erst 6, Rest per Knopf. Neu: `/api/cooked`, Feld `auch` (andere Schreibweisen) an Ideen. Andere Länder folgen mit Abschnitt 4.
- [x] 2b – Altes Tagebuch übernommen (16.11.2026): 8 frühere Runden (Mexiko 2023 … USA 2026) + Griechenland Abend 1 online in der DB (Status fertig). Daten nur privat in `altes-tagebuch/` (Fotos, abschrift.md, import.cjs → import.sql, mehrfach ausführbar). Fehlende Daten/Menüs können alle in der App nachtragen. Küchen mit Farben/Namen in kuechen.js (ohne Ideen).
- [x] 2c – 30 alte Abend-Fotos (2. Schub per fotos2.cjs) (WhatsApp, 16.11.2026) direkt hochgeladen: `altes-tagebuch/fotos.cjs` (sharp, ohne Metadaten, 1600/480 px) → R2 per `wrangler r2 object put` + `fotos.sql` (IDs `alt-<abend>-<n>`, by_person ali, Titelbild nur wenn leer). Mexiko 1 (Birria-Foto) ist geraten. Kurdisch 2 (Metzens, Kebab/Okra-Foto) ebenfalls geraten. Selfie der zwei Frauen = Spanien 2 (laut Ali).
- [x] **3 – Schönes Tagebuch** (Version 0.3.0, 16.11.2026): `#/tagebuch` Titelseite (Küche x von 80, Kapitel je Land), `#/tagebuch/<runde>` Kapitel mit Abend-Seiten (Titelfoto als Polaroid: Gastgeber-Wahl, sonst meiste Herzen; Menükarte; Sprüche als Zettel; Polaroid-Fotos; Eindrücke; Musik-Link). Wartet auf Test der Nutzerin.
- [x] **Musik** (0.3.0): Karte auf jeder Abend-Seite. Knopf öffnet Spotify-Suche (Handy: `spotify:search:`, PC: open.spotify.com), Feld `musik` in kuechen.js. Eigene Playlist als Link (Tabelle `music`, nur Spotify/YouTube/Apple Music). Kein Spotify-Login (bewusst). Ländername nur „Elláda“ ohne Erklärung (Wunsch der Nutzerin).
- [x] **0.3.1** (16.11.2026): Vergangene Abende: alle dürfen das Menü nachtragen/ändern (Worker `canEditMenu = isHost || past`), Kinder-Frage in Vergangenheit („Wart ihr …“), Tagebuch zeigt Kinder (Alter am Abend) und „Für die Kinder“ im Menü.
- [x] **0.3.2** (16.11.2026): Reiterleiste unten (tabs.js): Jetzt · Tagebuch · Termine (termine.js: wer wann kocht, Platz für Terminfinder/Kalender-Abo) · Ideen · Mehr (mehr.js: Einsortieren, Home-Bildschirm, Rundgang, Name, Abmelden). Startseite = nur laufende Runde.
- [x] **0.3.4** (17.11.2026): Fester Rahmen gegen hüpfende Leiste (iPhone, Meldung der Nutzerin): html/body overflow hidden, body Flex-Spalte, nur #scroller (bzw. .hauptseite > .seite) scrollt, Leiste nicht mehr position:fixed, sondern im Aufbau darunter (Film: Tabs bleiben fixed, Scroller endet darüber). Alle scrollTo/scrollY auf den Scroller umgestellt. Gemessen 375×812: Fenster scrollt nicht, Leiste bleibt bei 0 px Versatz, Inhalt endet an der Leiste.
- [ ] 4 – Rezepte
- [ ] 5 – Abstimmung (bis zum letzten Griechenland-Abend)
- [ ] 6 – Sicherung & Feinschliff
