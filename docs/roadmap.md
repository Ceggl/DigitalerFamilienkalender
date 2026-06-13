# Roadmap

Phasenweise Umsetzung. Jede Phase ist **für sich nutzbar** (liefert echten Wert) und hat klare
Akzeptanzkriterien. Reihenfolge so gewählt, dass Datenschutz & Kernnutzen zuerst stehen und das
Internet-abhängige zuletzt kommt.

> Legende: ☐ offen · ◐ in Arbeit · ☑ erledigt

---

## Phase 0 – Fundament ☐
**Ziel:** Lauffähiges Grundgerüst, an dem man weiterbauen kann.
- Astro + Tailwind + TypeScript einrichten, Node-Adapter (SSR)
- SQLite + Drizzle ORM anbinden, erste Migration, Seed-Daten
- Ordnerstruktur, ESLint/Prettier, Vitest
- Touch-first Design-System (Tokens, Basis-Komponenten: Button, Card, Avatar, Icon)
- Kiosk-Layout + Mobil-Layout

**Fertig, wenn:** App startet lokal, zeigt eine leere Kalender-Startseite, Lint & Tests grün.

## Phase 1 – Kalender & Personen ☐
**Ziel:** Die Familie kann Termine sehen und pflegen.
- Personen anlegen/bearbeiten (Avatar, Farbe, Rolle)
- Monats-/Wochen-/Tagesansicht, touch-optimiert (große Flächen, Wischen)
- Lokale Termine anlegen/bearbeiten/löschen, Wiederholungen (RRULE)
- Farbcodierung pro Person

**Fertig, wenn:** Ein Termin lässt sich per Touch anlegen und erscheint korrekt in allen Ansichten.

## Phase 2 – Aufgaben, Commitment & Coins ☐  *(Herzstück)*
**Ziel:** Verbindliche, nachvollziehbare Aufgaben mit Belohnung.
- Aufgaben-Vorlagen + Instanzen (Wiederholung), Zuweisung an Personen
- Commitment-Flow: besprochen → zugesagt (👍) → erledigt → bestätigt
- Append-only Audit-Log mit **Hash-Kette** + Prüf-Funktion
- Coin-Ledger, automatische Gutschrift bei Bestätigung
- Belohnungen anlegen & einlösen (mit/ohne Freigabe)
- Settings-Schalter für all das (Coins an/aus, Zusage-Pflicht, Bestätigung nötig …)

**Fertig, wenn:** Ein Kind kann zusagen & abhaken, ein Erwachsener bestätigt, Coins werden gebucht,
und das Audit-Log lässt sich verifizieren.

## Phase 3 – Kindgerechte UX ☐
**Ziel:** Auch nicht-lesende Kinder bedienen es selbstständig.
- Avatar-Login-Bildschirm
- Icon-/Bild-/Farb-geführte Aufgabenansicht "Was ist heute meins?"
- Animationen (Coin-Glas füllt sich, Konfetti bei Erledigung)
- Optionale Vorlesefunktion (TTS), große Touch-Ziele, einfache Sprache
- Nicht-Leser-Modus (Setting pro Person) blendet Text aus, betont Symbole

**Fertig, wenn:** Eine Testperson ohne Text die eigene Tagesaufgabe finden & abhaken kann.

## Phase 4 – Mehrgeräte & mobiler Selbst-Service ☐
**Ziel:** Familienmitglieder verwalten Aufgaben am eigenen Handy.
- Mobile Web-Ansicht (responsive, PWA-fähig: installierbar, Offline-Basis)
- Sessions/Login auch am Handy (Avatar + PIN-Stufen)
- Live-Updates via SSE (Wandgerät reagiert auf Handy-Aktion und umgekehrt)
- Rechte: wer darf was abhaken/bestätigen

**Fertig, wenn:** Ein Kind hakt am Handy ab und das Wandgerät aktualisiert sich in Echtzeit.

## Phase 5 – CalDAV lesen ☐
**Ziel:** Externe Kalender erscheinen im Familienkalender.
- ExternalCalendar-Verwaltung (Verbindung, verschlüsseltes Secret)
- Periodischer Sync (Pull), Anzeige externer Termine (eigene Farbe, schreibgeschützt)
- Fehler-/Status-Anzeige, robustes Wiederholen

**Fertig, wenn:** Ein Google/iCloud/Nextcloud-Kalender wird korrekt eingelesen und angezeigt.

## Phase 6 – CalDAV schreiben (Zwei-Wege) ☐
**Ziel:** Im Familienkalender erstellte/geänderte Termine fließen zurück.
- Schreiben/Aktualisieren/Löschen externer Termine via CalDAV
- ETag-basierte Konflikterkennung + sinnvolle Auflösung
- Konfigurierbar pro Kalender (read vs. read_write)

**Fertig, wenn:** Ein am Wandgerät geänderter Termin erscheint korrekt im Quell-Kalender.

## Phase 7 – Account-System ☐
**Ziel:** Über eine Familie hinaus skalierbar.
- Echte Accounts (E-Mail/Passkey), Verknüpfung `Person.account_id`
- Mehrere Haushalte, Einladungen, rollenbasierte Rechte
- Geräte-Pairing (Wandgerät ↔ Account), Zugriff von unterwegs über sicheren Tunnel

**Fertig, wenn:** Eine eingeladene Person greift von einem fremden Gerät sicher auf ihre Aufgaben zu.

## Phase 8 – Sicherung, Härtung & Auslieferung ☐
**Ziel:** Produktionsreif & wartbar.
- Verschlüsselte Backups (E2E), Wiederherstellung getestet
- Sicherheits-Härtung (Headers, Rate-Limits, Audit-Review)
- Kiosk-Provisionierung: Skripte/Image für den Raspberry Pi (Auto-Start, Auto-Update)
- Update-Mechanismus, Monitoring/Health-Check
- Doku für Endnutzer:innen (Aufbau & Bedienung)

**Fertig, wenn:** Aus einem frischen Pi wird mit einem Skript ein einsatzfertiges Wandgerät.

---

## Querschnitts-Themen (laufen mit)
- **Tests** wachsen pro Phase mit (Services per Vitest, Kernflüsse per Playwright ab Phase 4).
- **Barrierefreiheit** wird ab Phase 1 mitgedacht, in Phase 3 vertieft.
- **Datenschutz-Review** am Ende jeder Phase, die neue Daten einführt.
