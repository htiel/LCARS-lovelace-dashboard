# LCARS Camera Token Migration Spec

**Status:** Active · authored 2026-05-10 · author: Worf · reviewers: Data, Geordi
**Tracking issue:** #99
**Blocks:** 5.5.2 (Tactical), 5.5.8 (Habitat)
**Prerequisite for:** 5.5.0 ship (per Riker NO-GO; this spec must exist before 5.5.0 release notes go out)

## 1. Problem

Camera surfaces in the LCARS dashboard currently render Home Assistant camera frames using URLs of the form:

```
/api/camera_proxy/camera.front_door?token=eyJhbGciOi...&time=1715333333
```

The `access_token` query-string parameter is embedded directly into `<img src>`, `<video src>`, or `background-image: url(...)` declarations. This is leaked to:

- Browser DevTools Network panel (cleartext)
- `view-source:` on any page that renders a camera tile
- Browser history and any HTTP referrer logs
- HA Core access logs (under `homeassistant.components.http.access_log` if enabled)
- Any browser extension with `webRequest` permission

**OWASP A02 (Cryptographic Failures), A01 (Broken Access Control).** Tokens are short-lived but tokens-in-URLs is a verified anti-pattern.

## 2. Mechanism selection

Exactly one mechanism is chosen for the migration. Alternatives are documented with their rejection reason.

### Chosen: `ha-camera-stream` web component (option A)

Use the Home Assistant frontend's existing `<ha-camera-stream>` custom element. It is the canonical HA way to render a camera entity in any custom card. It internally:

- Reads `hass.connection` to authenticate via the WebSocket session (no token in URL)
- Negotiates `hls`, `webrtc`, or `mjpeg` based on the camera's `frontend_stream_type` attribute
- Handles reconnection, fallback to still-image when streaming fails
- Is maintained by the HA core team and tracks HA's auth changes

Import via `card-tools` or `customElements.get('ha-camera-stream')` after the first frontend render.

### Rejected: option B — `async_signed_path` short-lived signed URLs

`hass.callApi('POST', 'auth/sign_path', { path: '/api/camera_proxy_stream/...', expires: 30 })` returns a signed URL with TTL.

**Rejection reason:** Still puts an authentication artifact in `<img src>`. Replaces long-lived token leak with short-lived token leak. Does not address the DevTools/view-source surface. Adds a request-per-render cost and a token-rotation lifecycle the card must manage.

### Rejected: option C — cookie-auth via existing HA session

Rely on the user's existing `hassToken` cookie scoped to the HA origin.

**Rejection reason:** HA frontend does not consistently set a cookie usable from a Lovelace card context. Cross-origin embeds (HA behind reverse proxy with subdomain) break. Lovelace card iframes in mobile companion app have inconsistent cookie behavior.

### Rejected: option D — proxy through LCARS integration

Add a `/api/lcars_dashboard/camera_proxy/{entity_id}` route in `__init__.py` that re-signs HA's camera stream.

**Rejection reason:** Reinvents HA's camera authentication. Duplicates HA's stream component logic. Adds an attack surface in our integration. We are a frontend dashboard, not a media gateway.

## 3. Migration surface

Every camera-rendering location in `custom_components/lcars_dashboard/js/src/**` that today uses raw `access_token` URLs:

| File | Location | Render shape today | Notes |
|---|---|---|---|
| `lcars-tactical-card.js` | Camera tile grid | `<img src="${url}?token=${token}">` | Tactical #99 primary surface |
| `lcars-tactical-card-v1.js` | v1 camera tile | same | v1 carried forward per 5.5.2 decision |
| `lcars-homepage-card.js` | Habitat area-pane camera tiles | `<img src>` and `background-image` for offline-state | Both render paths must migrate |
| `lcars-medical-card.js` | (verify) | likely none, but audit `entity_picture` use | Medical may render person pictures |
| `panels/**` | (verify) | per-panel audit during 5.5.4 | Climate / Media unlikely; alarm unlikely |

**Audit step (required before 5.5.2 starts):** ripgrep for the following patterns and resolve every hit:

```
rg "access_token" custom_components/lcars_dashboard/js/src/
rg "camera_proxy" custom_components/lcars_dashboard/js/src/
rg "entity_picture" custom_components/lcars_dashboard/js/src/
```

Every match either (a) migrates to `<ha-camera-stream>`, (b) is documented as out-of-scope with a follow-up issue, or (c) is removed.

## 4. Behavioral requirements

- **No tokens in any rendered URL.** DevTools Network panel for a camera tile must show zero requests containing `access_token=`, `signed=`, or similar auth query params against `camera_proxy` endpoints.
- **Cache-busting preserved.** If today the card uses `?time=` for cache busting on still-image refresh, replicate via `<ha-camera-stream>`'s built-in refresh, or by detaching/re-attaching the element on entity-state-change.
- **Stale-proxy cleanup.** When the camera entity becomes unavailable or the tile is removed from DOM, the underlying stream connection must be torn down (no leaked websocket/HLS connections — verify via DevTools Network → WebSocket count).
- **Offline-state visual unchanged.** When `state === 'unavailable'`, the existing offline-state visual (greyscale, label, etc.) is preserved.
- **No regression in Tactical or Habitat camera grid layouts.** Pixel-similar to v5.4.6.

## 5. Verification (acceptance criteria for #99)

A migration of a given file is verified when **all** of the following hold:

1. **DevTools Network tab** filter for `camera_proxy` shows zero requests with `access_token=` in the query string after a hard reload of the page.
2. **`view-source:`** of the page shows no `access_token=` literal in any element attribute.
3. **HA Core logs** at `logger: info` show no `access_token` query param in `homeassistant.components.http.access_log` lines for camera-proxy paths.
4. **DOM inspection** confirms `<ha-camera-stream>` is the rendering element (not `<img>` with a `camera_proxy` src).
5. **Offline test:** disabling the camera integration shows the existing offline visual.
6. **Cleanup test:** navigating away from the dashboard view drops the DevTools WebSocket connection within ~2 seconds (no leaked streams).
7. **Screenshot regression:** one before/after screenshot per migrated surface, attached to the PR.

## 6. Out of scope

- Replacing HA's native authentication.
- Server-side proxying of camera streams.
- Recording / snapshot persistence.
- Picture-glance / picture-entity card replacement.

## 7. Rollback

If `<ha-camera-stream>` integration causes regression in any user environment:

1. Revert the migration commit on the affected file.
2. Re-issue camera tiles using the previous `<img src>` pattern.
3. Open a follow-up issue with the failing environment details (HA version, browser, camera platform: Frigate / Reolink / UniFi / generic).
4. Do not ship the next release until either the regression is reproduced and fixed, or the affected surface is documented as deferred.

## 8. References

- HA frontend source: `homeassistant-frontend/src/components/ha-camera-stream.ts`
- HA core camera component: `homeassistant/components/camera/__init__.py`
- OWASP Top 10 2021: A01, A02
- B04 (prior LCARS pattern) — cache-busting via element re-attach
