# Kochabend-App – Plan (freigegeben 15.11.2026)

## Worum es geht
Drei Paare kochen reihum Länderabende. Pro Runde ein Land (Abstimmung), drei Abende, jedes Paar einmal Gastgeber. Die App führt ein schön gestaltetes Tagebuch, hält Rezepte fest, hilft bei Abstimmung und Terminen.

**Personen:** Marco & Mareike, Steffi & Ali, Clari & Domi (Domi mit einem m). Meist kochen die Männer, die Frauen helfen.
**Aktuelle Runde:** Griechenland. Abend 1 Marco & Mareike (schon gewesen), Abend 2 Steffi & Ali am Sa 21.11.2026, Abend 3 Clari & Domi (Termin offen).
**Vorrücken:** Wer diesmal Erster war, ist nächstes Mal Letzter, alle anderen rücken eins vor (nächste Runde: Steffi & Ali, Clari & Domi, Marco & Mareike).
**Abstimmung + Termine:** am letzten Abend einer Runde, alle sitzen zusammen.

## Technik
- App: statische Seite im Ordner `docs/` → GitHub Pages (öffentliches Repo, Konto bauer-reisen). Kein Build-Schritt, einfache JS-Module.
- Daten: Cloudflare Worker `kochabend` + D1-Datenbank `kochabend`. Fotos: R2 (Zahlungsart wird hinterlegt).
- Zugang: gemeinsamer Code = Secret `GROUP_CODE` im Cloudflare-Dashboard; Ausweis (Token) auf dem Handy; danach Namensauswahl. Code ändern → alle melden sich neu an.
- Geheimes hält der Worker zurück: Stimmen bis alle abgestimmt haben, Menü bis die Gastgeber es freigeben.
- Fotos am Handy verkleinert (1600 px / 480 px, JPEG), ohne Standort; Aufnahmezeit wird vorher gelesen. Fotos über Einmal-Adressen je Foto, der Ausweis steht nie in einer Adresse.
- Eine gemeinsame Küchenliste `docs/js/kuechen.js` (~70 inkl. Regionen, eigene Kennung, Farben, Motiv, Vorschläge je Gang). Regionen: Ornament statt falscher Flagge.
- Keine Noten. Herz am Foto nur zur Titelbild-Wahl, nie als Zahl.
- Hilfe-Muster wie Film-App: Rundgang, „Was ist neu?", Einmal-Erklärungen; automatisches Update über `version.json`.

## Bauplan
0. **Gerüst:** Code + Namensauswahl, Homescreen, Rundgang, Auto-Update.
1. **Runden & Abende:** Runde anlegen, 3 Abende, Gastgeber nach Vorrücken vorgeschlagen, Datum. **Terminfinder** (Fr abends / Sa tagsüber/abends / So tagsüber/abends, für die nächsten 3 Monate ab dem letzten Abend der Runde; zusätzlich **Feiertage unter der Woche** (Bayern, inkl. bewegliche wie Ostern/Fronleichnam) und der Abend davor; jede Person tippt an, was geht; Termine, an denen alle können, oben). Direkter Zugriff auf iPhone-Kalender geht nicht (Apple sperrt das, iCloud nur mit Passwort) – bewusst weggelassen. **Kalender-Abo** (eigener Link, nur Datum + Gastgeber, erneuerbar).
2. **Füttern:** Fotos (Warteschlange ohne Netz), Sprüche („Wer hat's gesagt?"), Eindruck, Menü. Menü verdeckt, bis die Gastgeber auf **„Menü freigeben"** tippen.
3. **Schönes Tagebuch:** Titelseite, Kapitel je Land, Abende mit Menükarte, Foto-Bausteine, Spruch-Karten, Herzen/Titelbild, Großansicht.
4. **Rezepte:** per Link, Kochbuch-Foto (max. 2, nur hinter „Rezept ansehen") oder Text; nur Gastgeber ändern. Vorschläge je Land und Gang.
5. **Abstimmung:** verdeckt, „x von 6", Los bei Gleichstand auf dem Server, Aufdeckung vom letzten zum ersten Platz. Muss bis zum letzten Griechenland-Abend fertig sein.
6. **Sicherung & Feinschliff:** Herunterladen je Land, Rundgang fertig.

**Später:** Diashow, Jahresrückblick, Druck-PDF, Weltkarte, Rezept-Link-Import, Abstimmungs-Frist.
