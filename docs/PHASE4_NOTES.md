# Phase 4: Mehrgeräte & Live-Updates

## What's Implemented

### Session Management
- **Session Service** – Create session for logged-in person
- **Permission Checks** – Role-based access (adult/caregiver/child)
- **HTTP-only Cookies** – Secure, HttpOnly, 24-hour duration

### Real-Time Updates (SSE)
- **Event Broker** – Pub/Sub for task/coin/reward events
- **API Stream** – GET `/api/realtime/events` (Server-Sent Events)
- **Client Library** – `RealtimeClient` with auto-reconnect & exponential backoff
- **Broadcast Functions** – taskDone, coinsEarned, rewardRedeemed, etc.

### Authentication APIs
- `POST /api/auth/login` – Avatar + optional PIN verification
- `POST /api/auth/logout` – Clear session cookie
- `GET /api/auth/me` – Check current session

### PWA (Progressive Web App)
- **manifest.json** – App metadata, icons, shortcuts, share target
- **Service Worker** – Network-first caching, offline fallback
- **Icons** – 192px & 512px (plus maskable for modern browsers)
- **Display** – Standalone (fullscreen like native app)

### Mobile Layout
- **Responsive Design** – Single column, safe-area padding
- **Bottom Navigation** – 4-tab nav (Tasks, Calendar, Rewards, Profile)
- **Mobile-First CSS** – Touch-friendly spacing & tap targets
- **SSE Integration** – Auto-connects on page load, reconnects on disconnect

### Mobile Pages (m/ prefix)
- `/m/` – Compact home with today's events
- `/m/my-tasks` – Task list with inline icons
- `/m/rewards` – Reward grid (2 columns)

## Architecture Notes

### Real-Time Flow
```
User A (kiosk): marks task done
  ↓
POST /api/commitments → broadcastTaskDone()
  ↓
Publish to event broker
  ↓
All subscribers receive event
  ↓
User B (phone): SSE receives update → refresh UI
```

### Session + Permissions
```
Login POST /api/auth/login (personId + pin?)
  ↓
Session created (HTTP-only cookie)
  ↓
All API calls auto-send cookie
  ↓
Getters check session role (child vs adult)
  ↓
API enforces permissions (409 if denied)
```

## Still To Do (Later Phases)

1. **Background Sync** – Queued actions for offline → sync when online
2. **Notification API** – Badge + push notifications (if person enabled)
3. **Biometric Auth** – Fingerprint/Face on phones (Phase 7?)
4. **Selective Sync** – Only fetch household's events (not global)
5. **Encryption for Transit** – HTTPS enforcement
6. **Token Refresh** – Longer-lived sessions with refresh tokens

## Testing Notes

Phase 4 tests are still minimal (permission checks mostly).
Full integration tests (login → real-time → commit) in Phase 6+.
