# Hardware – Das Wandgerät

Aufbau eines an der Wand montierten Touch-Geräts auf Basis Raspberry Pi. Bewusst aus
verfügbaren, gut dokumentierten Komponenten – nachbaubar ohne Spezialwissen.

---

## 1. Empfohlene Stückliste (BOM)

| Komponente | Empfehlung | Warum |
|---|---|---|
| Rechner | **Raspberry Pi 5 (4 GB)** | Genug Leistung für Browser-Kiosk + lokalen Server; sparsam |
| (Alternative) | Raspberry Pi 4 (4 GB) | Etwas günstiger, reicht ebenfalls |
| Speicher | **microSD 64 GB (A2)** oder besser NVMe via HAT | Daten + OS; NVMe = deutlich flotter & langlebiger |
| Display | **Kapazitiver Touchscreen 10–15"** (HDMI + USB-Touch) | Größer = familientauglicher; kapazitiv = "Handy-Gefühl" |
| Stromversorgung | Offizielles **USB-C-Netzteil** (Pi 5: 27 W) | Stabiler Betrieb, keine Unterspannung |
| Montage | VESA-Wandhalterung oder Bilderrahmen-Einbau | Sauberes Wandbild, Kabel versteckt |
| Optional | Gehäuse mit aktiver Kühlung | Leiser Dauerbetrieb |
| Optional | RTC-Modul | Korrekte Zeit auch ohne Netz (wichtig für Audit-Zeitstempel) |
| Optional (NFC) | PN532 NFC-Reader (USB/I²C) | Falls später NFC-Login/-Token gewünscht |

> **Touchscreen-Hinweis:** Auf "echtes" **kapazitives** Multi-Touch achten (nicht resistiv) –
> nur so fühlt es sich für Kinder wie ein Tablet an.

## 2. Software-Aufbau (Kiosk)

1. **Raspberry Pi OS (64-bit, Lite oder Desktop)** installieren.
2. **Node.js 22** + die FamilyCalender-App installieren; App startet als **systemd-Service**
   (`familycalender.service`) automatisch beim Booten.
3. **Chromium im Kiosk-Modus** auto-starten, Vollbild auf `http://localhost:4321`,
   Mauszeiger ausblenden, Bildschirmschoner/DPMS aus (oder Ruhezeiten-gesteuert).
4. **Auto-Updates** kontrolliert (Phase 8): App-Update via Skript, OS-Sicherheitsupdates automatisch.

Die Provisionierung wird in **Phase 8** als Skript (`scripts/provision-pi.sh`) bzw. fertiges
Image bereitgestellt, sodass aus einem frischen Pi mit einem Befehl ein Wandgerät wird.

## 3. Energie & Display-Verhalten
- **Ruhezeiten** (Setting): Display nachts dimmen/ausschalten, morgens wieder an.
- **Bewegungssensor (optional)**: Display "weckt" bei Annäherung – stromsparend & einladend.
- Sanftes Dimmen statt hartem Aus, damit das Gerät wohnlich wirkt.

## 4. Netzwerk
- Standard: nur **Heim-WLAN/LAN**, **keine offenen Ports** nach außen.
- Zugriff von unterwegs (ab Phase 4/7): **Tailscale** o. ä. – verschlüsseltes privates Netz,
  kein Portforwarding, kein öffentlicher Server nötig.
- Lokales HTTPS im Heimnetz (z. B. via mkcert/Caddy), damit Browser-Funktionen (PWA, TTS)
  zuverlässig laufen.

## 5. Datensicherheit der Hardware
- SQLite-Datei liegt verschlüsselt-gesichert (Backup, Phase 8); das laufende Gerät selbst sollte
  in der Wohnung physisch geschützt stehen.
- Optional Laufwerksverschlüsselung des Datenpartition für den Diebstahlfall.
- Audit-Zeitstempel brauchen verlässliche Zeit → NTP, optional RTC-Modul.

## 6. Grobe Kostenschätzung
Je nach Displaygröße und Optionen typischerweise **ca. 150–300 €** Materialkosten. Der Pi selbst
ist der kleinste Posten – das Display dominiert den Preis.
