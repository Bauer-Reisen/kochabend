# „In 80 Küchen um die Welt" (Kochabend-App) – Stand

App-Name seit 0.1.1: „In 80 Küchen um die Welt", auf dem Home-Bildschirm „80 Küchen". Repo und Worker heißen weiter „kochabend".

Plan: siehe PLAN.md. Nach jedem Abschnitt: veröffentlichen, Link + Testpunkte nennen, auf Okay warten.

## Eingerichtet
- Ordner `C:\Users\Steffi\Documents\Kochabend-App`, GitHub-Repo https://github.com/Bauer-Reisen/kochabend (öffentlich, hochgeladen 15.11.2026). Pages: Branch `main`, Ordner `/docs` (eingeschaltet, live geprüft 15.11.2026). Adresse: https://bauer-reisen.github.io/kochabend/
- Zahlungsart bei Cloudflare hinterlegt (15.11.2026). R2 muss einmal im Dashboard aktiviert werden (wrangler meldet sonst Code 10042), danach legt Claude den Speicher `kochabend-fotos` an.
- Worker online: https://kochabend.film-app.workers.dev (Version 3087fe0b). Erlaubt nur bauer-reisen.github.io und localhost:5800. 10 Code-Versuche pro Minute.
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
- [ ] 1 – Runden & Abende, Terminfinder (inkl. Feiertage Bayern + Vorabend), Kalender-Abo. Griechenland eintragen: Abend 1 Marco & Mareike am Sa 24.10.2026, Abend 2 Steffi & Ali Sa 21.11.2026, Abend 3 Clari & Domi.
- [ ] 2 – Füttern (Ziel: bis Sa 21.11.2026 nutzbar), Menü-Freigabe-Knopf der Gastgeber
- [ ] 2b – Altes Tagebuch übernehmen: Ordner `altes-tagebuch/` angelegt (in .gitignore). Wartet auf Seitenfotos.
- [ ] 3 – Schönes Tagebuch
- [ ] 4 – Rezepte
- [ ] 5 – Abstimmung (bis zum letzten Griechenland-Abend)
- [ ] 6 – Sicherung & Feinschliff
