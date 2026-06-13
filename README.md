# FamilyCalender 🗓️

Ein **datenschutzfreundlicher Familienkalender** als Hardware-Projekt – gedacht für ein
Touch-Display, das in der Wohnung hängt. Entwickelt mit dem Fokus auf **chaotische Familien
(z. B. Pflegefamilien)**: Aufgaben sind für alle nachvollziehbar, Zusagen von Kindern werden
verbindlich dokumentiert, und auch nicht-lesende Kinder können das Gerät bedienen.

> **Status:** Planungsphase. Dieses Repository enthält aktuell den vollständigen Projektplan.
> Der Code wird phasenweise umgesetzt (siehe [Roadmap](docs/roadmap.md)).

---

## Was macht dieses Projekt besonders?

| Anspruch | Umsetzung |
|---|---|
| 🔒 **Datenschutz "Top"** | Daten bleiben lokal auf dem Gerät zuhause (SQLite). Keine Cloud-Pflicht. Optionale, **verschlüsselte** Sicherung. |
| 🤝 **Commitment-sicher** | Zusagen ("Kind hat versprochen") werden mit Person + Zeitstempel in einem **fälschungssicheren Audit-Log** festgehalten. |
| 👶 **Ohne Lesen bedienbar** | Steuerung über Avatare, Icons, Farben, Animationen und optionale Vorlesefunktion. |
| 🪙 **Belohnungssystem** | Aufgaben geben **Coins**, die Kinder gegen Belohnungen (z. B. "1 Std. Fernsehen") eintauschen. |
| ⚙️ **Alles einstellbar** | Fast jede Funktion ist in den Settings an-/abschaltbar – passend zur jeweiligen Familie. |
| 📱 **Mehrgeräte-fähig** | Familienmitglieder öffnen die Web-App am Handy und verwalten ihre Aufgaben selbst. |
| 📆 **Kalender-Anbindung** | CalDAV (Google, iCloud, Nextcloud …) **lesen und schreiben**. |

---

## Tech-Stack (kurz)

- **[Astro](https://astro.build/)** – Web-Framework (UI + API), leicht lesbar, dateibasiertes Routing
- **[Tailwind CSS](https://tailwindcss.com/)** – Touch-first Design-System
- **[SQLite](https://www.sqlite.org/)** + **[Drizzle ORM](https://orm.drizzle.team/)** – lokale, typsichere Datenhaltung
- **Raspberry Pi** im Kiosk-Modus als Wandgerät

Ausführlich: [docs/architecture.md](docs/architecture.md)

---

## Dokumentation

Der komplette Plan liegt im Ordner [`docs/`](docs/):

1. [**Plan / Master-Übersicht**](docs/plan.md) – das große Ganze auf einen Blick
2. [Architektur](docs/architecture.md) – Technik, Schichten, warum welche Wahl
3. [Datenmodell](docs/data-model.md) – Tabellen & Beziehungen
4. [Roadmap](docs/roadmap.md) – Phasen & Reihenfolge der Umsetzung
5. [Hardware](docs/hardware.md) – Stückliste & Aufbau des Wandgeräts
6. [Datenschutz & Sicherheit](docs/privacy-and-security.md)
7. [UX & Barrierefreiheit](docs/ux-and-accessibility.md) – kindgerechte Bedienung
8. [Design-Entscheidungen (ADR)](docs/decisions.md) – was wir warum festgelegt haben

---

## Mitentwickeln (auch als Amateur)

Dieses Projekt ist bewusst so geschrieben, dass **auch ungeübte Entwickler:innen** Dinge anpassen
können: klare Ordnerstruktur, sprechende Namen, viele Kommentare, kleine Dateien. Wo etwas
"magisch" wirkt, steht ein Kommentar dabei. Siehe die Konventionen in
[docs/architecture.md](docs/architecture.md#konventionen-für-leicht-lesbaren-code).
