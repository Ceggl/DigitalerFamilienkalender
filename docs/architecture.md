# Architektur

Dieses Dokument erklärt **wie** die App technisch aufgebaut ist und **warum** wir die jeweilige
Technik gewählt haben. Ziel: solide Best Practices, aber so einfach, dass auch ungeübte
Entwickler:innen sich zurechtfinden.

---

## 1. Überblick (Diagramm)

```
        ┌──────────────────────── Raspberry Pi (zuhause) ────────────────────────┐
        │                                                                          │
        │   Chromium (Kiosk-Vollbild)                                              │
        │        │  öffnet http://localhost:4321                                   │
        │        ▼                                                                 │
        │   ┌──────────────────────── Astro (Node-Server) ───────────────────┐    │
        │   │  • Seiten (UI, server-gerendert)                                │    │
        │   │  • API-Endpunkte  (/api/...)                                    │    │
        │   │  • SSE-Stream     (/api/events  → Live-Updates)                 │    │
        │   │             │                                                   │    │
        │   │             ▼                                                   │    │
        │   │   Service-Schicht (Geschäftslogik, gut testbar)                 │    │
        │   │             │                                                   │    │
        │   │             ▼                                                   │    │
        │   │   Drizzle ORM  ───────►  SQLite-Datei (familycalender.db)       │    │
        │   └─────────────────────────────────────────────────────────────────┘  │
        │             ▲                              ▲                              │
        └─────────────┼──────────────────────────────┼─────────────────────────────┘
                      │ Heim-WLAN                     │ optional: sicherer Tunnel
                      │                               │ (z. B. Tailscale) für unterwegs
              ┌───────┴────────┐              ┌───────┴────────┐
              │ Handy (Mama)   │              │ Handy (Kind)   │
              │ mobile Web-App │              │ mobile Web-App │
              └────────────────┘              └────────────────┘
```

## 2. Technologie-Wahl & Begründung

| Bereich | Wahl | Warum (Best Practice) | Warum (einfach) |
|---|---|---|---|
| Web-Framework | **Astro** (SSR, Node-Adapter) | Schnell, server-gerendert, sichere Defaults, API-Routen integriert | Dateibasiertes Routing, kleine `.astro`-Dateien, wenig Boilerplate |
| Styling | **Tailwind CSS** | Konsistentes Design-System, keine CSS-Wildwucherung | Klassen stehen direkt im Markup – man sieht sofort, was passiert |
| Interaktivität | Astro + **wenige** Inseln (Vanilla/Web-Standards, optional Preact) | "HTML first", JS nur wo nötig → schnell auf dem Pi | Weniger Framework-Magie zu lernen |
| Datenbank | **SQLite** (`better-sqlite3`) | Robust, transaktional, eine Datei → einfach zu sichern | Kein DB-Server zu betreiben |
| ORM | **Drizzle ORM** | Typsicher, SQL-nah, Migrations | Schema liest sich wie eine Tabelle, sehr lesbar |
| Live-Updates | **Server-Sent Events** | Einfacher & robuster als WebSockets für Push | Standard-Browser-API, kein Extra-Server |
| CalDAV | **tsdav** | Bewährte CalDAV/iCal-Bibliothek | Übernimmt das komplizierte Protokoll |
| Auth/Sessions | eigene, schlanke Session-Logik (Cookie + DB) | Volle Kontrolle, keine Cloud-Abhängigkeit | Wenig Abstraktion, leicht nachvollziehbar |
| Tests | **Vitest** + Playwright (später) | Schnelle Unit-Tests, E2E für Kernflüsse | Vertraute, gut dokumentierte Tools |

> **Bewusste Entscheidung gegen** schwergewichtige SPA-Frameworks, externe Auth-Provider und
> Cloud-Datenbanken – sie widersprechen entweder dem Datenschutzziel oder der Lesbarkeit.

## 3. Ordnerstruktur (geplant)

```
FamilyCalender/
├── docs/                    # dieser Plan
├── src/
│   ├── pages/               # Astro-Seiten = URLs
│   │   ├── index.astro      # Start (Kalender-Wandansicht)
│   │   ├── login.astro      # Avatar-Auswahl
│   │   └── api/             # Server-Endpunkte (REST-ähnlich)
│   ├── components/          # wiederverwendbare UI-Bausteine
│   │   ├── ui/              # generische Bausteine (Button, Card, Icon …)
│   │   ├── calendar/        # Kalender-spezifisch
│   │   └── tasks/           # Aufgaben/Coins-spezifisch
│   ├── layouts/             # Seitengerüste (Kiosk-Layout, Mobil-Layout)
│   ├── lib/
│   │   ├── db/              # Drizzle-Schema, Migrations, Verbindung
│   │   ├── services/        # Geschäftslogik (tasks, coins, commitments, caldav …)
│   │   ├── auth/            # Sessions, PIN, Avatar-Login
│   │   └── realtime/        # SSE-Verteiler
│   ├── styles/              # Tailwind-Basis, Design-Tokens
│   └── content/             # statische Texte, Icon-Listen
├── scripts/                 # Pi-Provisionierung, Backup, Seed-Daten
├── tests/
└── astro.config.mjs
```

> Leitidee: **Eine Datei = eine Aufgabe.** Lieber viele kleine, klar benannte Dateien als wenige große.

## 4. Schichten-Modell (wer darf was?)

```
Seite/Component  →  API-Endpunkt  →  Service  →  DB (Drizzle)
   (UI)              (Transport)     (Logik)     (Daten)
```

- **UI** kennt keine SQL-Abfragen – sie ruft API-Endpunkte auf.
- **API-Endpunkte** sind dünn: Eingaben prüfen (mit `zod`), Service aufrufen, Antwort zurückgeben.
- **Services** enthalten die eigentlichen Regeln (z. B. "Coins erst bei Bestätigung gutschreiben").
- **DB-Schicht** kennt nur Tabellen, keine Geschäftsregeln.

Vorteil: Logik ist an einem Ort, testbar, und Anfänger:innen finden Regeln immer im `services/`-Ordner.

## 5. Echtzeit / Mehrgeräte

- Jede Änderung (Aufgabe abgehakt, Termin angelegt) wird über einen **SSE-Kanal** an alle offenen
  Geräte gepusht → das Wandgerät aktualisiert sich, wenn ein Kind am Handy abhakt.
- Konfliktstrategie zunächst einfach: **"letzte Schreiboperation gewinnt"** + Server als Quelle der
  Wahrheit. Für CalDAV-Sync später feinere Strategie (siehe roadmap Phase 6).

## 6. Konventionen für leicht lesbaren Code

Damit auch Amateur-Entwickler:innen anpassen können, gelten diese Regeln:

1. **Sprechende Namen** statt Abkürzungen (`awardCoins`, nicht `awCn`).
2. **Kommentare erklären das *Warum***, nicht das *Was* (das *Was* sagt der Code selbst).
3. **Kleine Funktionen** mit einer Verantwortung.
4. **Eingaben validieren** an der Systemgrenze (API) mit `zod` – nie blind der UI vertrauen.
5. **Keine versteckte Magie**: Wenn etwas trickreich ist, steht ein erklärender Kommentar daneben.
6. **Konfiguration statt Code**: Verhalten (Coins an/aus etc.) lebt in den Settings, nicht in `if`-Verzweigungen im UI.
7. **TypeScript überall** – Tippfehler werden zur Bauzeit gefunden, nicht erst am Wandgerät.
8. **Formatierung automatisch** via Prettier + ESLint (kein Streit über Stil).

## 7. Konfigurierbarkeit (Settings-Architektur)

Fast jede Funktion ist abschaltbar. Technisch: eine `settings`-Tabelle (Schlüssel/Wert pro Haushalt)
plus sinnvolle Standardwerte im Code. Die UI liest Settings zentral, sodass ein Feature-Schalter
an genau einer Stelle wirkt. Beispiele: Coins-System an/aus, Zusage-Pflicht pro Aufgabe,
Bestätigung durch Erwachsene nötig, Nicht-Leser-Modus, Vorlesefunktion, Ruhezeiten,
Wochenstart Mo/So, Sprache.
