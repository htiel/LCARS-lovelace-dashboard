## Worf — Security Review

**Reviewer**: Worf (Integration Security Expert)  
**Date**: Stardate 2026.04.13  
**Threat Level**: YELLOW

*"The recreation deck may seem harmless, but a media panel renders external artwork, displays untrusted metadata strings, and accepts volume input. Every data channel is an attack surface."*

### Input Validation

- **Volume level clamping**: `handleVolumeInteraction()` (§3.7) correctly clamps the calculated volume to `0.0–1.0` via `Math.max(0, Math.min(...))`. `handleVolumeKeyboard()` also properly clamps with explicit `Math.min(1, ...)` and `Math.max(0, ...)` bounds. Secure.
- **Progress bar seek position**: The progress bar is clickable (`cursor: pointer`) suggesting seek functionality. The `getMediaProgress()` function calculates position from entity attributes — but if a click handler sends `media_player.media_seek`, the position value MUST be clamped to `[0, media_duration]` before calling `hass.callService()`. **Not currently specified in the spec — add clamping.**
- **`supported_features` bitmask**: `hasFeature()` uses bitwise AND on a numeric bitmask from entity attributes. The bitmask value comes from HA backend and is an integer — no injection vector here.
- **Source selection**: `source_list` values from entity attributes are rendered as button text. The `select_source` service call passes the source name from `source_list` — this is user-selectable but values originate from the HA backend, not typed by the user. Acceptable.

### XSS & DOM Safety

- **Album art URL (`entity_picture`)**: This is the primary XSS concern. The `entity_picture` attribute contains a URL path that is loaded into an `<img>` tag's `src` attribute. HA proxies media artwork through `/api/media_player_proxy/` — the URL should always be a relative path starting with `/api/`. **MUST validate**: before rendering, confirm the URL starts with `/api/` or `/local/` — reject any URL containing `javascript:`, `data:`, or external `http://`/`https://` origins. A compromised HA integration could inject a malicious URL.
- **Track title / artist / album**: `media_title`, `media_artist`, `media_album_name` attributes are rendered via Lit template literals (auto-escaped). **No `innerHTML` usage.** Secure.
- **Source list rendering** (§3.8): Source names are rendered as `textContent` in Lit templates via `${sourceName}`. The spec correctly notes "all values must be text-only, rendered as textContent not innerHTML." Verified.
- **Group member names**: `getGroupMemberName()` (§4) falls back to `friendly_name` or entity_id string manipulation. Both are rendered via Lit template escaping. No injection risk.
- **`app_name` attribute**: Rendered in metadata column as text. Auto-escaped by Lit. Secure.

### Service Call Security

- **Transport controls properly scoped**: All service calls in `MEDIA_ACTIONS` (§8) use a hardcoded allowlist of `media_player.*` services with `entity_id` from card config. No arbitrary service injection.
- **`callMediaService()` wrapper**: The `data` spread (`...data`) in `callMediaService()` could theoretically allow extra parameters if the `data` object is attacker-controlled. In practice, it's constructed from validated UI interactions (volume, shuffle boolean, etc.). Low risk but be disciplined about not passing unvalidated objects through this function.
- **No destructive actions**: Media transport (play, pause, next) and volume changes are all reversible. `turn_off` is the most impactful — it powers off the device but doesn't cause data loss. Acceptable without confirmation dialogs.

### Secrets & Sensitive Data

- **No credentials or tokens in this panel.** Media authentication is handled by the HA integration backend. The panel only receives proxied URLs and entity state data. No secrets surface.

### Recommendations

**MUST FIX:**

1. **Validate `entity_picture` URL before rendering**: Add a guard before setting the `<img src>`:
   ```javascript
   function isValidArtworkUrl(url) {
     if (!url || typeof url !== 'string') return false;
     // Only allow HA-proxied paths
     return url.startsWith('/api/') || url.startsWith('/local/');
   }
   ```
   Reject URLs with `javascript:`, `data:text/html`, or external origins. A malicious integration could set `entity_picture` to a crafted URL.

2. **Clamp seek position on progress bar click**: If implementing seek-on-click, validate: `const clampedPosition = Math.max(0, Math.min(duration, seekPosition));` before calling `media_player.media_seek`.

**SHOULD FIX:**

3. **Set `crossorigin="anonymous"` on album art `<img>` tags**: This prevents the image from sending credentials to external origins if the URL validation is somehow bypassed. Defense in depth.

4. **Set `referrerpolicy="no-referrer"` on artwork images**: Prevents leaking the dashboard URL to external image servers.

**ADVISORY:**

5. **Wesley's Web Audio API idea (Team Review Flags)**: If the Web Audio API is used for beat visualization, it would require `connect()` to an audio context — this has CSP implications (`media-src` directive) and could be a fingerprinting vector. Defer to proof-of-concept review.

6. **`sound_mode_list` / `source_list` length**: No maximum length is enforced on these lists. A malicious integration with 1000 source entries could cause rendering performance issues. Consider truncating to a reasonable max (e.g., 50 items) and showing "more..." overflow.

---
