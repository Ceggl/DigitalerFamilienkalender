# Design-Entscheidungen (ADR)

Kurze "Architecture Decision Records": **was** wurde entschieden, **warum**, und welche
**Alternativen** es gab. So bleibt nachvollziehbar, weshalb das System so aussieht – auch für
spätere Mitwirkende.

---

## ADR-001 – Hardware: Raspberry Pi + Touchscreen
**Entscheidung:** Wandgerät auf Basis Raspberry Pi mit kapazitivem Touchscreen.
**Warum:** Günstig, sparsam, voll kontrollierbar, ideal für lokale Datenhaltung; große
Community/Doku → auch für Amateur:innen nachbaubar.
**Alternativen:** Mini-PC (mehr Leistung, teurer/stromhungriger); altes Tablet (kein Aufwand,
aber weniger Kontrolle über Kiosk & Datenhaltung).

## ADR-002 – Datenhaltung: Local-first, self-hosted (+ optionale verschlüsselte Sync)
**Entscheidung:** Daten primär lokal in SQLite auf dem Gerät; optionale, **verschlüsselte**
Synchronisation/Backup zu einem von der Familie gewählten Ziel.
**Warum:** Bester Datenschutz bei sensiblen Kinder-/Familiendaten; funktioniert ohne Internet;
Familie behält die Kontrolle. Optionale Sync gibt Komfort, ohne den Datenschutz aufzugeben.
**Alternativen:** Reine Cloud (einfachster Zugriff, schwächster Datenschutz – verworfen als
Standard); rein lokal ohne jede Sync (verworfen, da Backup/Mehrgerät erschwert).
**Konsequenz:** Architektur muss "offline-fähig zuerst" sein; Sync ist additiv (Phase 8).

## ADR-003 – Bedienung: Touch-first
**Entscheidung:** Die gesamte UI wird primär für Touch entworfen (große Ziele, Gesten),
nicht für Maus/Tastatur.
**Warum:** Das Gerät hängt an der Wand und wird von Kindern mit dem Finger bedient.
**Konsequenz:** Komponenten-Bibliothek & Design-Tokens sind auf große Touch-Flächen ausgelegt.

## ADR-004 – Identität: Avatar-Tap + PIN-Stufen, mit Audit-Log
**Entscheidung:** Kinder melden sich per **Avatar-Tap** (lesefrei) an; Erwachsene/Betreuer
zusätzlich per **PIN**. Verbindliche Handlungen (Zusagen, Bestätigungen) landen im **Audit-Log**.
**Warum:** Vereint kindgerechte Bedienung mit der geforderten Commitment-Sicherheit und einer
gestuften Rechtevergabe.
**Alternativen:** Reiner Zahlen-PIN für alle (für Nicht-Leser schwierig – verworfen als Standard);
NFC-Token (sehr kindgerecht, aber Extra-Hardware – als spätere Option offen gehalten).

## ADR-005 – Kalender: CalDAV lesen **und** schreiben (schrittweise)
**Entscheidung:** Externe Kalender (Google/iCloud/Nextcloud) per CalDAV anbinden – Ziel:
Zwei-Wege (lesen + schreiben), umgesetzt in zwei Phasen (erst lesen, dann schreiben).
**Warum:** Familien nutzen vorhandene Kalender; voller Mehrwert entsteht erst, wenn Termine auch
zurückfließen. Schrittweise Umsetzung senkt Risiko & Komplexität.
**Alternativen:** Nur-Lesen-ICS-Abo (schnell, aber keine Bearbeitung – als Zwischenschritt
enthalten); ganz weglassen (verworfen, da ausdrücklich gewünscht).

## ADR-006 – Stack: Astro + Tailwind + SQLite + Drizzle
**Entscheidung:** Astro (SSR) als Web-Framework, Tailwind fürs Styling, SQLite mit Drizzle ORM.
**Warum:** Vom Auftraggeber für Astro+Tailwind vorgegeben; ergänzt um SQLite/Drizzle, weil das
local-first, typsicher und besonders **leicht lesbar/anpassbar** ist (Best Practice + Amateur-
freundlich, beides Projektziele).
**Alternativen:** SPA-Framework + Cloud-DB (mehr Magie, schlechter für Datenschutz/Lesbarkeit –
verworfen).

## ADR-007 – Nachvollziehbarkeit: Append-only Audit-Log mit Hash-Kette
**Entscheidung:** Verbindliche Ereignisse sind unveränderlich und über eine Hash-Kette
manipulationssensitiv.
**Warum:** Beantwortet belastbar "Wurde besprochen und zugesagt?" – das zentrale Bedürfnis der
Zielgruppe (Pflegefamilien).
**Grenze (ehrlich):** Schützt vor unbemerkter nachträglicher Änderung auf dem Gerät, ist aber kein
externer Beweis-Notar. Externe Zeitstempel/Signaturen sind als spätere Option offen.

## ADR-008 – Account-System jetzt vorsehen, später aktivieren
**Entscheidung:** Datenmodell enthält bereits `household_id` und `Person.account_id`, das echte
Account-System kommt aber erst in Phase 7.
**Warum:** "Plane es vor" war ausdrücklicher Wunsch. So bleibt das System zunächst ohne
Internet-Zwang nutzbar, ist aber ohne Umbau skalierbar.

---

> **Neue Entscheidung treffen?** Hänge einen neuen ADR-Block unten an (Nummer hochzählen),
> ändere ältere ADRs nicht rückwirkend – ergänze stattdessen einen Hinweis "abgelöst durch ADR-xxx".
