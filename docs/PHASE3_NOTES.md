# Phase 3: Non-Reader UX Notes

## What's Implemented

### Services
- **settings** – Household-level configuration (coins, TTS, language, etc.)
- **TTS utility** – Browser-based speech synthesis (privacy-first, no external service)
- **Colors utility** – 7-color palette for person identification + getColorClasses helpers

### Components
- **ButtonNonReader** – Icon-only buttons, no text (or hidden), large tap targets
- **LoginScreenNonReader** – Avatar grid with TTS greeting + tap animation
- **TaskCardNonReader** – Huge icon + emoji status, color-coded, minimal text
- **CoinGlassAnimation** – Visual glass jar with fill animation, confetti on full

### Pages
- `/login-non-reader` – Non-reader login flow
- `/my-tasks-non-reader` – Kid-friendly task dashboard (no text, tap-to-speak)

### Animations (new CSS)
- `animate-confirm` – Scale pulse (success feedback)
- `animate-fade-in` – Gentle entrance
- `animate-bounce-high` – Energetic bounce
- `animate-pulse-gentle` – Soft attention pulse
- `animate-slide-up` – Modal entrance
- `animate-jiggle` – Reward unlock wiggle
- `animate-confetti` – Celebration particles

## Remaining in Phase 3

To complete non-reader UX, still needed:
1. **Audio feedback** on all actions (button tap, task complete, coin earn)
2. **Haptic feedback** (vibration on success – if device supports)
3. **Toggle between text/non-reader mode** in navbar
4. **Text size scaling** for low-vision users
5. **High contrast mode** for accessibility
6. **Gesture recognition** (swipe to go back, etc.)

## Design Principles Applied

✅ **No text is mandatory** – Icons/emojis communicate status
✅ **Consistent color per person** – Repeated across login, tasks, coins
✅ **Large touch targets** – Min 64px, often 80–112px in non-reader mode
✅ **Immediate feedback** – Animation + optional sound/haptics
✅ **Celebration moments** – Confetti, jiggle, pulse on achievements
✅ **Privacy-first audio** – Web Speech API, no cloud TTS

## Next Phase Note

Phase 4 will add:
- Mobile view (responsive, PWA)
- Multi-device live updates (SSE)
- Session management (persistent login state)
