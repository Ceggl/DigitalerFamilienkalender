# Phase 6: CalDAV Write – Two-Way Sync

## What's Implemented

### Write Service (caldav-write.ts)
- **pushEventToRemote()** – Create or update event on remote calendar
  - Converts local CalendarEvent to VEVENT/ICS format
  - If externalId exists: update; otherwise: create
  - Returns externalId for newly created events
- **deleteEventFromRemote()** – Remove event from remote calendar
- **detectConflicts()** – Find events changed on both sides (ETag-based)
- **resolveConflict()** – Apply resolution strategy (local_wins or remote_wins)

### Conflict Detection
- Compare local ETag with remote ETag
- If different: both sides changed
- Returns list of conflicts needing manual resolution
- Strategies:
  - `local_wins` – Push local version to remote
  - `remote_wins` – Keep remote (re-fetch)

### API Endpoints
- `POST /api/external-calendars/push` – Push event to remote
  - action: 'create', 'update', 'delete'
- `GET /api/external-calendars/conflicts?externalCalendarId=...` – Detect conflicts
- `POST /api/external-calendars/conflicts` – Resolve conflict with strategy

### Enhanced UI
- **CalendarEventForm** – Add sync toggle
  - Checkbox: "Sync to external calendar"
  - On submit: save locally + push to remote if checked
  - User can choose per event

### Sync Toggle Flow
```
User creates event + checks "Sync to remote"
  ↓ POST /api/events (create locally)
  ↓ Then POST /api/external-calendars/push (sync to remote)
  ↓ Returns externalId (stored in CalendarEvent)
  ↓ Future edits: update mode (ETag-aware)
```

## How It Works

### Create Flow
1. User creates event, checks "Sync to remote"
2. Local event created (no externalId yet)
3. pushEventToRemote() called
4. No externalId → client.createCalendarObject()
5. Remote creates event, returns URL
6. Local event updated with externalId + etag

### Update Flow
1. User edits existing event with externalId
2. Sync checked
3. pushEventToRemote() called
4. externalId exists → client.updateCalendarObject()
5. Uses current ETag
6. If ETag mismatch: remote changed too → conflict!

### Conflict Detection
```
syncAll() runs periodically
  ↓
For each remote event:
  - Find local version via externalId
  - Compare ETags
  - If different: conflict
  ↓
User resolves: local_wins or remote_wins
```

## Limitations (Current)

- **ETag validation** – Basic; no full 3-way merge
- **Conflict UI** – Returns list; doesn't show merge options
- **Automatic push** – Only on user action, not background sync
- **Bidirectional edits** – Not handled (assumed rare)

## Security Notes

- Password decrypted only during sync
- VEVENT contains only public calendar info
- No sensitive data in remote calendar
- ETags are opaque identifiers (safe)

## Testing

- VEVENT format generation
- ETag comparison logic
- Conflict detection accuracy

## Future (Phase 8+)

- Background sync scheduler
- Merge conflict UI (3-way diff)
- Selective sync (which calendars push)
- Sync history & rollback
