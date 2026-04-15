## Wesley Crusher — Final Review Pass

**Author**: Wesley Crusher (Creative Technologist)  
**Date**: Stardate 2026.04.13  
**Status**: REVISED — Ready for Implementation

### Changes Made
- **§3.2**: Added `crossorigin="anonymous"` and `referrerpolicy="no-referrer"` note to album art img CSS comment
- **§3.2.1 (NEW)**: Added `isValidArtworkUrl()` guard function and secure `<img>` template with `crossorigin`/`referrerpolicy` attributes per Worf's MUST FIX #1
- **§3.4**: Added `clampSeekPosition()` function for progress bar seek validation per Worf's MUST FIX #2

### Accepted Recommendations
- **Worf MUST FIX #1** (entity_picture URL validation): Accepted. Added `isValidArtworkUrl()` allowlist guard — only `/api/` and `/local/` prefixes permitted. Defense-in-depth with `crossorigin="anonymous"` and `referrerpolicy="no-referrer"` on img element.
- **Worf MUST FIX #2** (seek position clamping): Accepted. Added `clampSeekPosition()` function; implementation must call this before `media_player.media_seek`.
- **Worf SHOULD FIX #3-4** (crossorigin, referrerpolicy): Accepted — folded into §3.2.1.
- **Geordi Rec #5** (no audio-reactive frame pulsing): Accepted. It was just a closing brainstorm. Frame borders are structural, not decorative.
- **Geordi Rec #4** (progress bar hover): Accepted as a note — will use transparent hit area if needed during implementation.
- **Data P1** (shared utilities): Accepted. `hasFeature()`, `getMediaStateColor()`, `formatMediaTime()` will be extracted to shared `lcars-state-utils.js` during implementation.
- **Data P2** (throttle volume drag): Accepted. Will implement 100ms timestamp guard in `handleVolumeInteraction()`.
- **Data P3** (progress interpolation timer): Accepted. 1-second `setInterval` when `playing`, cleaned up in `disconnectedCallback()`.
- **Data P4** (classifyMediaEntities input type): Clarification deferred to implementation — function will accept entity registry entries with `original_device_class`.
- **Worf Advisory #6** (source_list length): Accepted. Will cap rendered source list at 50 items.

### Deferred Items
- **Data P5** (Sonos sound mode selector): Deferred per YAGNI. The Admiral doesn't have Sonos — will add if needed.
- **Worf Advisory #5** (Web Audio API CSP): Deferred to proof-of-concept phase — not part of initial implementation.
- **Geordi Rec #6** (aspect ratio transition): Implementation detail — CSS `transition: aspect-ratio 300ms` will be tested during build.

### Disagreements
- None. All reviewer feedback is either accepted or reasonably deferred.

---
