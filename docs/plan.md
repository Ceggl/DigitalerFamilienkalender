# Projektplan – FamilyCalender (Master-Übersicht)

Dieses Dokument ist die **Landkarte** des Projekts. Es fasst Ziel, Entscheidungen, Architektur
und Reihenfolge zusammen und verlinkt in die Detaildokumente.

---

## 1. Ziel in einem Satz

Ein an der Wand hängendes Touch-Gerät, das einer (auch chaotischen) Familie hilft, Termine und
Aufgaben **gemeinsam und nachvollziehbar** zu organisieren – datenschutzfreundlich, kindgerecht
und mit verbindlichen, dokumentierten Zusagen.

## 2. Die Zielgruppe ernst nehmen

Pflege- und Patchwork-Familien haben besondere Anforderungen, die das Design prägen:

- **Mehrere Bezugspersonen** (Eltern, Pflegeeltern, Großeltern, Betreuer:innen) – wechselnd anwesend.
- **Nachvollziehbarkeit / Transparenz** ist oft rechtlich und emotional wichtig: *Was wurde wann
  mit wem besprochen?* Deshalb das **Commitment-Audit-Log**.
- **Kinder unterschiedlichen Alters & Lesefähigkeit** – Bedienung muss ohne Lesen funktionieren.
- **Datenschutz** ist sensibel (Daten über Kinder, ggf. Behörden-Kontext) → **local-first**.
- **Wechselnde Konstellationen** → fast alles muss in den Settings anpassbar sein.

## 3. Festgelegte Kern-Entscheidungen

Vom Auftraggeber bestätigt (Details & Begründung: [decisions.md](decisions.md)):

| Thema | Entscheidung |
|---|---|
| Hardware | **Raspberry Pi + Touchscreen** als Wandgerät |
| Datenhaltung | **Local-first, self-hosted** + optionale **verschlüsselte** Sync/Backup |
| Bedien-Optimierung | **Touch-first** (große Flächen, Gesten, kein Maus-Denken) |
| Identität | **Avatar-Tap** (Kinder) + **PIN-Stufen** (Erwachsene), **Audit-Log** für Zusagen |
| Kalender | **CalDAV lesen + schreiben** (schrittweise: erst lesen, dann schreiben) |
| Stack | **Astro + Tailwind**, SQLite + Drizzle ORM |
| Sprache im Code | Englisch (Bezeichner), **Doku & UI: Deutsch** |

## 4. Architektur in 5 Sätzen

1. Eine **Astro-App** (Server-gerendert) läuft als lokaler Server auf dem Raspberry Pi.
2. Das Wandgerät zeigt diese App im **Kiosk-Browser** im Vollbild.
3. Daten liegen in einer **SQLite-Datei** auf dem Gerät; Zugriff über das typsichere **Drizzle ORM**.
4. Handys im Heim-WLAN (später auch von unterwegs per Tunnel) öffnen **dieselbe Web-App** mobil.
5. **Live-Updates** zwischen allen Geräten via Server-Sent Events (SSE).

Details: [architecture.md](architecture.md)

## 5. Die drei "Herzstücke"

### 5.1 Commitment-Sicherheit (das Alleinstellungsmerkmal)
Eine Aufgabe durchläuft nachvollziehbare Schritte, die jeweils **wer/wann** protokollieren:

```
erstellt → besprochen → zugesagt (Kind tippt 👍) → erledigt (Kind) → bestätigt (Erwachsener) → Coins
```

Jeder Schritt erzeugt einen Eintrag im **append-only Audit-Log mit Hash-Kette** (jeder Eintrag
referenziert den Hash des vorherigen). Dadurch ist im Nachhinein erkennbar, ob etwas
nachträglich verändert wurde. Das beantwortet die Frage *"Wurde das wirklich besprochen und hat
das Kind zugesagt?"* belastbar. Siehe [data-model.md](data-model.md#commitment--audit).

### 5.2 Kindgerechte, lesefreie Bedienung
Avatar-Login, Icons statt Text, Farbcodierung pro Person, Animationen (z. B. ein **Coin-Glas**,
das sich füllt), optionale **Vorlesefunktion**. Siehe [ux-and-accessibility.md](ux-and-accessibility.md).

### 5.3 Coins & Belohnungen
Aufgaben können Coins vergeben (an-/abschaltbar). Coins fließen in ein **Konto pro Kind**
(nachvollziehbares Ledger). Belohnungen ("1 Std. Fernsehen") kosten Coins und werden – je nach
Einstellung – von einem Erwachsenen freigegeben.

## 6. Datenschutz-Leitplanken

- Standardmäßig **keine Cloud**. Daten verlassen das Gerät nur, wenn die Familie es aktiv aktiviert.
- Optionale Sicherung ist **Ende-zu-Ende-verschlüsselt** (Schlüssel bleibt bei der Familie).
- **Datensparsamkeit**: nur erfassen, was nötig ist.
- **Audit-Log** für sensible Aktionen, aber **kein Tracking/Analytics**.
- Zugriff von außen nur über sicheren Tunnel (z. B. Tailscale), **keine offenen Ports**.

Vollständig: [privacy-and-security.md](privacy-and-security.md)

## 7. Umsetzungsreihenfolge (Phasen)

| Phase | Inhalt | Ergebnis |
|---|---|---|
| 0 | Fundament (Projekt-Setup, Design-System) | App startet, leerer Kalender |
| 1 | Kalender + Personen + lokale Termine | Familie sieht & pflegt Termine am Wandgerät |
| 2 | Aufgaben + Commitment-Audit + Coins + Belohnungen | Das "Herzstück" funktioniert |
| 3 | Kindgerechte UX (Icons, Audio, Nicht-Leser-Modus) | Kinder bedienen es selbstständig |
| 4 | Mehrgeräte + mobiler Selbst-Service + Live-Updates | Handys haken Aufgaben ab |
| 5 | CalDAV **lesen** | Externe Kalender erscheinen |
| 6 | CalDAV **schreiben** (Zwei-Wege) | Termine fließen zurück |
| 7 | Account-System (echte Logins, mehrere Haushalte, Einladungen) | Skalierbar über eine Familie hinaus |
| 8 | Verschlüsselte Sicherung, Härtung, Kiosk-Provisionierung | Produktionsreif |

Details & Akzeptanzkriterien je Phase: [roadmap.md](roadmap.md)

## 8. Was als Nächstes passiert

Sobald du diesen Plan freigibst, beginne ich mit **Phase 0** (Projekt-Setup): Astro + Tailwind +
Drizzle/SQLite aufsetzen, Ordnerstruktur, ein erstes Touch-Design-System und eine lauffähige
Startseite. Danach arbeite ich mich Phase für Phase durch und frage bei inhaltlichen Weichen nach.
