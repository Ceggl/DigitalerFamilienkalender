# Datenmodell

Beschreibt die Tabellen und ihre Beziehungen. Bewusst schlank gehalten und mit Blick auf
**Erweiterbarkeit** (z. B. das spätere Account-System) entworfen. Umgesetzt mit Drizzle ORM
auf SQLite.

---

## 1. Übersicht (Beziehungen)

```
Household 1───* Person
Household 1───* CalendarEvent
Household 1───* ExternalCalendar
Household 1───* Task ─────────* TaskInstance
Person   *───* TaskInstance   (Zuweisung: assignment)
TaskInstance 1───* Commitment        (Zusage/Erledigung/Bestätigung)
Person   1───* CoinLedgerEntry
Household 1───* Reward
Person   1───* RewardRedemption *───1 Reward
Household 1───* Setting
*        ───* AuditEvent             (übergreifendes, fälschungssicheres Protokoll)
(später)  Account 1───* Person, Account *───* Household
```

## 2. Tabellen im Detail

### Household (Haushalt / Familie)
Vorbereitung für mehrere Haushalte (Account-System, Phase 7).

| Feld | Typ | Hinweis |
|---|---|---|
| id | uuid | PK |
| name | text | z. B. "Familie Müller" |
| timezone | text | für korrekte Termin-/Tageslogik |
| created_at | timestamp | |

### Person (Familienmitglied)
| Feld | Typ | Hinweis |
|---|---|---|
| id | uuid | PK |
| household_id | uuid | FK |
| display_name | text | |
| avatar_kind | text | `photo` \| `emoji` \| `illustration` |
| avatar_value | text | Dateipfad/Emoji/ID |
| color | text | Farbcode (durchgängige Farbcodierung) |
| role | text | `adult` \| `caregiver` \| `child` |
| pin_hash | text? | nur Erwachsene/Betreuer (PIN-Stufe) |
| birthdate | date? | für Alters-/Geburtstagslogik (optional, Datensparsamkeit) |
| is_non_reader | boolean | aktiviert konsequent lesefreien Modus |
| tts_enabled | boolean | Vorlesefunktion |
| account_id | uuid? | später: Verknüpfung zum globalen Account |
| created_at | timestamp | |

### CalendarEvent (lokaler Termin)
| Feld | Typ | Hinweis |
|---|---|---|
| id | uuid | PK |
| household_id | uuid | FK |
| title | text | |
| icon | text? | Symbol für Nicht-Leser |
| starts_at / ends_at | timestamp | |
| all_day | boolean | |
| rrule | text? | Wiederholung (iCal RRULE) |
| location | text? | |
| color | text? | |
| created_by | uuid | Person |
| external_id | text? | gesetzt, wenn aus CalDAV synchronisiert |
| external_calendar_id | uuid? | FK → ExternalCalendar |
| etag | text? | für CalDAV-Sync (Änderungserkennung) |

### ExternalCalendar (CalDAV-Verbindung)
| Feld | Typ | Hinweis |
|---|---|---|
| id | uuid | PK |
| household_id | uuid | FK |
| label | text | Anzeigename |
| provider | text | `google` \| `icloud` \| `nextcloud` \| `generic` |
| caldav_url | text | |
| username | text | |
| secret_ref | text | **Referenz** auf verschlüsseltes Secret (nicht im Klartext!) |
| color | text | |
| sync_direction | text | `read` \| `read_write` |
| last_synced_at | timestamp? | |

### Task (Aufgaben-Vorlage / Regel)
Die *Definition* einer Aufgabe (inkl. Wiederholung). Die konkreten Tage sind `TaskInstance`.

| Feld | Typ | Hinweis |
|---|---|---|
| id | uuid | PK |
| household_id | uuid | FK |
| title | text | |
| icon | text | Pflicht (Nicht-Leser) |
| description | text? | |
| rrule | text? | Wiederholungsregel |
| coins | integer | 0 = keine Belohnung |
| requires_commitment | boolean | muss vorher zugesagt werden? |
| requires_verification | boolean | muss ein Erwachsener bestätigen? |
| default_assignees | json | Personen-IDs |
| active | boolean | |
| created_by | uuid | |

### TaskInstance (konkretes Vorkommen an einem Tag)
| Feld | Typ | Hinweis |
|---|---|---|
| id | uuid | PK |
| task_id | uuid | FK |
| date | date | Fälligkeit |
| status | text | `open` \| `committed` \| `done` \| `verified` \| `missed` |
| assignee_id | uuid? | konkrete Person |
| completed_at | timestamp? | |
| verified_by | uuid? | Person, die bestätigt hat |

### Commitment (Zusage / Erledigung / Bestätigung)  {#commitment--audit}
Das **Herzstück der Nachvollziehbarkeit**. Append-only (wird nie geändert, nur ergänzt).

| Feld | Typ | Hinweis |
|---|---|---|
| id | uuid | PK |
| task_instance_id | uuid | FK |
| person_id | uuid | wer handelt (z. B. das zusagende Kind) |
| type | text | `discussed` \| `agreed` \| `done` \| `verified` \| `declined` |
| witnessed_by | uuid? | anwesende:r Erwachsene:r (Co-Signatur) |
| note | text? | optionale Notiz ("nur halb geschafft") |
| created_at | timestamp | Zeitstempel der Handlung |
| prev_hash | text | Hash des vorherigen AuditEvent (Kette) |
| hash | text | Hash über (Inhalt + prev_hash) → fälschungssicher |

> **Fälschungssicherheit:** Jeder Eintrag enthält den Hash des vorherigen Eintrags. Wird ein
> alter Eintrag nachträglich verändert, "zerbricht" die Kette und das fällt bei der Prüfung auf.
> So lässt sich glaubwürdig belegen, dass eine Zusage tatsächlich (und unverändert) stattfand.

### CoinLedgerEntry (Coin-Konto, nachvollziehbar)
Nie direkt einen "Kontostand" speichern, sondern **Bewegungen** – so ist jeder Coin erklärbar.

| Feld | Typ | Hinweis |
|---|---|---|
| id | uuid | PK |
| person_id | uuid | FK |
| delta | integer | +verdient / −ausgegeben |
| reason | text | `task_completed` \| `reward_redeemed` \| `manual_adjustment` |
| task_instance_id | uuid? | Herkunft |
| reward_redemption_id | uuid? | Herkunft |
| created_by | uuid | wer hat gebucht |
| created_at | timestamp | |

### Reward (Belohnung)
| Feld | Typ | Hinweis |
|---|---|---|
| id | uuid | PK |
| household_id | uuid | FK |
| title | text | z. B. "1 Stunde Fernsehen" |
| icon | text | |
| cost_coins | integer | |
| requires_approval | boolean | Erwachsene:r muss freigeben |
| daily_limit | integer? | optionale Begrenzung |
| active | boolean | |

### RewardRedemption (Einlösung)
| Feld | Typ | Hinweis |
|---|---|---|
| id | uuid | PK |
| reward_id | uuid | FK |
| person_id | uuid | FK |
| coins_spent | integer | |
| status | text | `requested` \| `approved` \| `denied` \| `fulfilled` |
| approved_by | uuid? | |
| created_at | timestamp | |

### Setting (Konfiguration pro Haushalt)
| Feld | Typ | Hinweis |
|---|---|---|
| household_id | uuid | FK (Teil des PK) |
| key | text | z. B. `coins.enabled` |
| value | json | flexibel |

### AuditEvent (übergreifendes Protokoll)
Allgemeines, append-only Log für sicherheitsrelevante Aktionen (Login, PIN-Änderung,
Einstellungsänderung, Coin-Korrektur). Gleiche Hash-Ketten-Technik wie Commitment.

### Account (später, Phase 7)
Globaler Login, der eine Person über Geräte/Haushalte hinweg identifiziert. Bewusst **jetzt schon
vorgesehen** (Felder `Person.account_id`), aber erst in Phase 7 aktiviert, damit das lokale System
zuerst ohne Internet-Zwang funktioniert.

## 3. Designprinzipien des Datenmodells

1. **Ereignisse statt Zustände** bei sensiblen Dingen (Coins, Zusagen) → volle Nachvollziehbarkeit.
2. **Append-only + Hash-Kette** für alles, was "verbindlich" sein muss.
3. **`household_id` überall** → spätere Mandantenfähigkeit (mehrere Familien) ist trivial.
4. **Secrets nie im Klartext** in der DB → nur Referenzen auf verschlüsselten Speicher.
5. **Datensparsamkeit**: optionale Felder bleiben leer, wenn die Familie sie nicht braucht.
