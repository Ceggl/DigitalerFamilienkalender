# Phase 5: CalDAV Read – External Calendar Integration

## What's Implemented

### Secrets Management
- **Encryption/Decryption** – AES-256-CBC for passwords (random IV per secret)
- **storeSecret()** – Encrypt & return reference
- **retrieveSecret()** – Decrypt reference back to plaintext

### External Calendar Service
- **CRUD** – Create, read, update, delete external calendars
- **Password Storage** – Never in plaintext; encrypted with random IV
- **Sync Status** – Track `lastSyncedAt` per calendar

### CalDAV Sync Service
- **Fetch Events** – Connect via tsdav, download events from remote calendar
- **Date Range** – Configurable range (default: -6mo to +6mo)
- **Event Import** – Parse VEVENT, create local CalendarEvent entries
- **Dedup** – Check `externalId` to avoid duplicate imports
- **ETag Tracking** – Detect changes in Phase 6

### API Endpoints
- `GET /api/external-calendars` – List calendars (no secrets exposed!)
- `POST /api/external-calendars` – Add new calendar
- `DELETE /api/external-calendars/[id]` – Remove calendar
- `POST /api/external-calendars/sync` – Trigger sync (single or all)

### UI Components
- **ExternalCalendarForm** – Add calendar dialog
  - Providers: Google, iCloud, Nextcloud, Generic
  - Security warning about app-passwords
  - Progressive enhancement (form fallback)

### Settings Page
- `/settings/calendars` – Manage external calendars
- List all connected calendars
- Manual sync trigger
- Delete with confirmation

### Sync Status
- Shows provider, last sync timestamp
- Error handling (returns error message)
- Event count on success

## Security Notes

**Password Handling:**
- Encrypted immediately on create
- Random IV per password (prevents pattern matching)
- Never returned to client in API responses
- Only decrypted server-side during sync

**Environment Variable:**
`SECRETS_KEY` – Should be strong, random, stored securely
Default (for dev): generated from provided string
In production: use proper secret management (Vault, etc.)

## How It Works

```
1. User enters CalDAV credentials
2. Form POSTs to /api/external-calendars
3. Password encrypted → stored as secretRef
4. User clicks "Sync" or automatic sync runs
5. syncExternalCalendar() called:
   - Retrieve & decrypt password
   - Connect via tsdav
   - Fetch events from remote
   - Parse VEVENT entries
   - Create local CalendarEvent if new
   - Update lastSyncedAt
6. Synced events appear in calendar (with external_id + source indicator)
```

## Limitations (Planned for Phase 6)

- **Read-only** – Events are one-way (external → local)
- **ETag-based updates** – Not yet implemented; re-imports all events
- **Manual sync** – No auto-schedule yet (Phase 8)
- **Single calendar** – Only first calendar per provider downloaded

## Testing

- Encryption/decryption roundtrip
- Credential handling (never exposed)
- API response filtering (no secrets in JSON)

Full integration tests (actual CalDAV server) would be in CI/CD.
