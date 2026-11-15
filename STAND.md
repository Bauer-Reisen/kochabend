# Kochabend-App – Stand

Plan: siehe PLAN.md. Nach jedem Abschnitt: veröffentlichen, Link + Testpunkte nennen, auf Okay warten.

## Eingerichtet
- Ordner `C:\Users\Steffi\Documents\Kochabend-App`, Git lokal (Branch main). GitHub-Repo: **noch nicht angelegt** (macht die Nutzerin: öffentlich, Pages aus Branch `main`, Ordner `/docs`). Adresse dann: https://bauer-reisen.github.io/kochabend/ (falls Repo „kochabend" heißt).
- Worker online: https://kochabend.film-app.workers.dev (Version 3087fe0b). Erlaubt nur bauer-reisen.github.io und localhost:5800. 10 Code-Versuche pro Minute.
- D1-Datenbank `kochabend` (438de803-…), Tabellen couples + persons mit den 6 Namen.
- Secret `GROUP_CODE`: **noch nicht gesetzt** (macht die Nutzerin im Dashboard). Bis dahin antwortet der Worker „noch nicht eingerichtet". `/api/health` zeigt `code: true/false`.
- Zahlungsart bei Cloudflare + R2: Nutzerin will Karte hinterlegen; R2 erst für Abschnitt 2 nötig.

## Lokal testen
- Vorschau-Einträge in `Uebergabe-App\.claude\launch.json`: `kochabend-worker` (Port 8787, lokale D1, Test-Code in `worker/.dev.vars`, nicht im Repo) und `kochabend` (Port 5800).
- Lokale DB füllen: `npx wrangler d1 execute kochabend --local --file worker/schema.sql --config worker/wrangler.toml`
- Worker hochladen: `NODE_USE_SYSTEM_CA=1 npx wrangler deploy --config worker/wrangler.toml`
- Neue Version: `node scripts/set-version.js 0.x.0`, vor dem Hochladen `npm run check-secrets`.

## Abschnitte
- [x] **0 – Gerüst** (15.11.2026, Version 0.1.0): Code-Eingabe (Groß/Klein egal), Ausweis 400 Tage, „Wer bist du?" (3 Paare), Startseite mit Ausblick, Homescreen-Hinweis (iPhone/Android), Rundgang (6 Karten), „Was ist neu?"-Gerüst, Auto-Update über version.json, Icon Teller+Besteck, Schriften Fraunces/Lora/Caveat selbst gehostet. Lokal geprüft bei 375 px: falscher Code abgelehnt, Name gewählt, Rundgang, bleibt nach Neuladen angemeldet, kein Querscrollen. Online geprüft: fremde Herkunft 403. **Am Handy noch nicht getestet** (wartet auf Repo + Code).
- [ ] 1 – Runden & Abende, Terminfinder (inkl. Feiertage Bayern + Vorabend), Kalender-Abo. Griechenland eintragen: Abend 1 Marco & Mareike am Sa 24.10.2026, Abend 2 Steffi & Ali Sa 21.11.2026, Abend 3 Clari & Domi.
- [ ] 2 – Füttern (Ziel: bis Sa 21.11.2026 nutzbar), Menü-Freigabe-Knopf der Gastgeber
- [ ] 2b – Altes Tagebuch übernehmen: Ordner `altes-tagebuch/` angelegt (in .gitignore). Wartet auf Seitenfotos.
- [ ] 3 – Schönes Tagebuch
- [ ] 4 – Rezepte
- [ ] 5 – Abstimmung (bis zum letzten Griechenland-Abend)
- [ ] 6 – Sicherung & Feinschliff
