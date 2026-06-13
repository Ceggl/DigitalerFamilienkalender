# UX & Barrierefreiheit – Bedienung ohne Lesen

Das Gerät muss von **allen** bedienbar sein: Kleinkinder, nicht-lesende Kinder, Erwachsene,
ältere Bezugspersonen. Leitsatz: **Zeigen statt schreiben.**

---

## 1. Designprinzipien

1. **Touch-first:** Große Flächen (Mindestziel ~64 px), klare Abstände, Wisch-Gesten,
   kein Hover/Maus-Denken. Alles direkt mit dem Finger erreichbar.
2. **Symbol vor Text:** Jede Aufgabe/Person/Belohnung hat ein **Icon/Bild + Farbe**. Text ist
   Ergänzung, nicht Voraussetzung.
3. **Personen-Farbcodierung:** Jede Person hat eine feste Farbe, die überall konsequent wiederkehrt
   (Termine, Aufgaben, Coins) → Wiedererkennung ohne Lesen.
4. **Sofortiges, freudiges Feedback:** Animationen & Sound bei Erfolg (Konfetti, Coin-Glas füllt
   sich) – Motivation statt Pflichtgefühl.
5. **Wenig auf einmal:** Pro Bildschirm eine klare Hauptaktion. Keine überladenen Listen.
6. **Vergebend:** Aktionen sind rückgängig machbar; nichts "Schlimmes" passiert durch Antippen.

## 2. Kern-Flüsse für Kinder (lesefrei)

### Anmelden
Raster aus **großen Avataren/Fotos**. Kind tippt sein Bild → drin. (Erwachsene danach zusätzlich
PIN.)

### "Was ist heute meins?"
Nach dem Tippen sieht das Kind **seine** heutigen Aufgaben als große Bildkacheln, in seiner Farbe.
Erledigt-Haken ist ein großer, eindeutiger Button mit Symbol.

### Zusagen (Commitment)
Beim Besprechen erscheint die Aufgabe groß; das Kind tippt einen klaren **👍-Button** ("Ich mach
das!"). Eine kurze Animation bestätigt die Zusage. (Im Hintergrund: Audit-Eintrag.)

### Belohnung holen
Ein **Coin-Glas** zeigt visuell den Stand. Belohnungen sind Bildkarten mit Preis als Münz-Symbolen
(z. B. 🪙🪙🪙). Reicht es, leuchtet die Karte; sonst ist sichtbar, wie viele Münzen noch fehlen.

## 3. Vorlesefunktion (TTS)
- Pro Person aktivierbar. Ein **Lautsprecher-Symbol** liest Aufgabe/Belohnung vor.
- Optional automatisches Vorlesen im Nicht-Leser-Modus.
- Nutzt die im Browser eingebaute Sprachausgabe (kein externer Dienst → Datenschutz).

## 4. Nicht-Leser-Modus (Setting pro Person)
Wenn aktiv:
- Textlabels treten zurück, **Symbole/Bilder dominieren**.
- Zahlen werden zusätzlich visuell dargestellt (Münzen als Bilder statt "12").
- Mehr Audio-Hinweise.

## 5. Barrierefreiheit (allgemein)
- Ausreichende **Kontraste** (WCAG AA), nicht nur Farbe als Bedeutungsträger (Farbe **+** Symbol).
- **Skalierbare** Schrift & UI (für Sehschwäche / ältere Personen).
- Bedienbar mit **Touch und** Tastatur (für Wartung/Barrierefreiheit).
- Reduzierte-Bewegung-Einstellung respektieren (weniger Animation, wenn gewünscht).
- Sinnvolle ARIA-Beschriftungen für Screenreader.

## 6. Zwei Oberflächen-Modi
| Modus | Wo | Charakter |
|---|---|---|
| **Kiosk** | Wandgerät | Übersicht für alle: Wochenkalender, "wer macht heute was", Familienblick |
| **Mobil** | Handys | Persönlich: "meine Aufgaben", schnelles Abhaken, eigener Coin-Stand |

## 7. Visuelle Sprache / Design-System
- Wenige, klare **Design-Tokens** (Farben, Abstände, Radien, Schriftgrößen) in Tailwind.
- Einheitliche **Icon-Bibliothek**; pro Aufgabe ein passendes, wiedererkennbares Symbol.
- Freundliche, runde Formen; "wohnliche", nicht technische Anmutung (es hängt im Wohnraum).
- Tag/Nacht-Anpassung (heller Tagmodus, gedämpfter Abendmodus passend zu Ruhezeiten).

## 8. Testen mit echten Nutzer:innen
Ab Phase 3: kurze Beobachtungstests mit Kindern verschiedenen Alters. Erfolgskriterium ist
**nicht** Schönheit, sondern: *Findet & erledigt ein nicht-lesendes Kind seine Aufgabe allein?*
