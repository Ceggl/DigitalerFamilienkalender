# Datenschutz & Sicherheit

Datenschutz ist hier kein Zusatz, sondern **Designprinzip**. Begründung: Es werden Daten über
Kinder verarbeitet, teils in sensiblen Konstellationen (Pflegefamilien, ggf. Behörden-Kontext).

---

## 1. Leitprinzipien

1. **Local-first / Datenminimierung am Ursprung:** Daten entstehen und bleiben auf dem Gerät
   zuhause. Es gibt **keine Cloud-Pflicht**.
2. **Privacy by Default:** Im Auslieferungszustand verlässt **nichts** das Gerät. Jede Form von
   Synchronisation, Fernzugriff oder Backup muss aktiv und bewusst eingeschaltet werden.
3. **Datensparsamkeit (DSGVO Art. 5):** Nur erheben, was für eine Funktion nötig ist. Optionale
   Felder (z. B. Geburtsdatum) bleiben leer, wenn die Familie sie nicht nutzt.
4. **Transparenz statt Überwachung:** Wir protokollieren *verbindliche Aktionen* (Zusagen, Coin-
   Buchungen) für Nachvollziehbarkeit – aber **kein** Verhaltens-Tracking, **keine** Analytics,
   **keine** Werbe-/Drittanbieter-Skripte.
5. **Zweckbindung:** Audit-Daten dienen der Nachvollziehbarkeit innerhalb der Familie, nicht der
   Bewertung/Kontrolle darüber hinaus.

## 2. Datenkategorien & Schutz

| Kategorie | Beispiele | Schutzmaßnahme |
|---|---|---|
| Stammdaten | Namen, Avatare, Rollen | lokal, nur im Haushalt sichtbar |
| Termine | lokale & externe Kalender | lokal; externe Secrets verschlüsselt |
| Verbindlichkeitsdaten | Zusagen, Bestätigungen | append-only + Hash-Kette |
| Belohnung | Coins, Einlösungen | nachvollziehbares Ledger |
| Zugangsdaten | PINs, CalDAV-Passwörter | **gehasht** bzw. **verschlüsselt**, nie Klartext |

## 3. Authentifizierung & Berechtigungen

- **Avatar-Tap** für Kinder (lesefrei), **PIN-Stufen** für Erwachsene/Betreuer.
- PINs werden **gehasht** gespeichert (z. B. mit einem modernen Verfahren wie Argon2/bcrypt),
  mit Rate-Limiting gegen Durchprobieren.
- **Rollen** (`adult`/`caregiver`/`child`) steuern Rechte: z. B. nur Erwachsene bestätigen
  Aufgaben, geben Belohnungen frei oder ändern Einstellungen.
- **Sessions** über sichere, `HttpOnly`-Cookies; serverseitig in der DB hinterlegt.

## 4. Verschlüsselung

- **At rest:** Optionale Laufwerks-/Datenpartitionsverschlüsselung auf dem Pi (Diebstahlschutz).
- **In transit:** HTTPS im Heimnetz; Fernzugriff ausschließlich über verschlüsselten Tunnel
  (Tailscale/WireGuard) – **keine offenen Ports**.
- **Backups/Sync (optional, Phase 8):** **Ende-zu-Ende-verschlüsselt** – der Schlüssel bleibt bei
  der Familie. Der Backup-Zielort (eigener Speicher/Cloud) kann die Inhalte nicht lesen.
- **Secrets** (CalDAV-Passwörter) liegen verschlüsselt; die DB speichert nur Referenzen.

## 5. Fälschungssicheres Audit-Log (Commitment-Sicherheit)

- Verbindliche Ereignisse (Zusage/Bestätigung) sind **append-only**: sie werden nie geändert,
  nur ergänzt.
- Jeder Eintrag enthält den **Hash des Vorgängers** (Hash-Kette). Eine nachträgliche Änderung
  zerstört die Kette und ist damit erkennbar.
- Eine **Verifikationsfunktion** prüft die Kette und meldet Manipulationen.
- Zeitstempel basieren auf zuverlässiger Zeit (NTP/optional RTC), damit "wann" belastbar ist.

> Wichtig zur Ehrlichkeit: Eine Hash-Kette auf demselben Gerät schützt vor *unbemerkter*
> nachträglicher Änderung, ist aber kein notariell beweissicheres Siegel. Wer absolute
> Beweiskraft braucht, müsste später optional externe Zeitstempel/Signaturen ergänzen – das ist
> bewusst als spätere Option vorgesehen, nicht als Grundannahme.

## 6. Kinder-spezifische Sorgfalt
- Möglichst **keine Klarnamen/Fotos** erzwingen – Spitznamen & Illustrationen sind gleichwertig.
- Inhalte über Kinder sind nur im Haushalt sichtbar; kein externes Teilen ohne ausdrückliche Aktion.
- Beim späteren Account-System: elterliche Einwilligung & strenge Voreinstellungen.

## 7. Sicherheits-Praktiken im Code
- **Eingabevalidierung** an allen API-Grenzen (`zod`).
- **Least Privilege**: Services prüfen Rollenrechte, UI verlässt sich nie allein darauf.
- **Abhängigkeiten** minimal & gepflegt; regelmäßige Updates.
- **Secrets** nur in `.env`/verschlüsseltem Store – `.env` ist bereits per Tooling-Regel
  vom Lesen ausgeschlossen.
- **Security-Review** als fester Schritt am Ende jeder datenverändernden Phase.

## 8. DSGVO-Bezug (Kurz)
- **Betroffenenrechte** sind durch local-first leicht erfüllbar: Auskunft/Löschung = direkter
  DB-Zugriff der Familie; Export-Funktion (iCal/JSON) ist eingeplant.
- **Verantwortliche:r** ist die Familie selbst (kein externer Auftragsverarbeiter, solange keine
  Cloud aktiviert ist) – das vereinfacht die rechtliche Lage erheblich.
