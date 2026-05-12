# LCARS Camera Token Migration Spec

**Status:** Active · authored 2026-05-10 · revised 2026-05-12 (Captain hybrid decision) · author: Worf · reviewers: Data, Geordi
**Tracking issue:** #99
**Shipping in:** v5.9.0-beta.1 (with #146 / #223 / #224)
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

## 2. Mechanism selection — HYBRID (revised 2026-05-12)

**Captain decision (Q2 of v5.9.0 planning):** ship a **hybrid** rather than pure `<ha-camera-stream>`. Pure-`<ha-camera-stream>` was found inadequate by Worf + Data + Wesley:

- `<ha-camera-stream>` uses HLS (or WebRTC where supported), introducing 2–6 s latency that hurts grid-tile UX where the user wants an instantly recognisable frame.
- A pure fetch-blob path also cannot carry MJPEG (long-lived multipart) and would break streaming entirely on the focused viewscreen.

The hybrid:

### Focused / main viewscreen → `<ha-camera-stream>`

- One element at a time. Latency acceptable for the dwell view.
- Auth handled internally by the element against `this.hass`.
- Verified via feature-detect (`customElements.get('ha-camera-stream')`) at render time; fallback to Option A path if undefined.

### Grid tiles → fetch + cookie + blob URL

- `fetch('/api/camera_proxy/' + eid, { credentials: 'include' })` → `Blob` → `URL.createObjectURL(...)` → `<img src=blob:...>`
- Refresh cadence: every 3 s for active (motion-detected) tiles, every 30 s for idle tiles
- `URL.revokeObjectURL(prev)` on every refresh AND on `disconnectedCallback` (non-revocation is a memory-leak vector — Worf's hard requirement)
- Same-origin cookie (`hassToken`) attaches naturally — confirmed by Worf: HA Lovelace custom panels are NOT iframes, they are shadow-DOM web components at the same origin, so `SameSite=Lax` is a non-issue.

### Rejected alternatives (kept for historical reference)

**Option B — `async_signed_path` short-lived signed URLs**
Still embeds an auth artifact in `<img src>`. Replaces long-lived leak with short-lived leak. Does not address the DevTools/view-source surface.

**Option C — pure cookie-auth (no blob URL)**
Browser's image-loader does not forward credentials cookies on `<img>` requests cross-context. Works only on same-origin top-level documents. Fails on iframe-embedded Lovelace.

**Option D — proxy through LCARS integration**
Reinvents HA's camera authentication. Duplicates HA's stream component logic. Adds attack surface in our integration. We are a frontend dashboard, not a media gateway.

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

### 5.1 LCARS visual addenda (Geordi, #217)

Per Geordi LCARS sign-off, the migration to `<ha-camera-stream>` must also satisfy three LCARS-visual constraints before 5.5.2 lifts it into Tactical:

1. **Frame containment.** The `<ha-camera-stream>` element must render inside the existing LCARS frame container (swept corner, elbow, pillar-rounded rectangle). The element MUST NOT use `position: fixed`, escape the shadow DOM via portal, or otherwise break out of the LCARS frame. Verify via DevTools layout inspector: `<ha-camera-stream>` is a descendant of the LCARS camera-tile container at all viewport sizes.
2. **`object-fit: cover` preservation.** `<ha-camera-stream>` internally renders a `<video>` element that defaults to `object-fit: contain`, which letterboxes inside the LCARS pillar-rounded rectangle. Tactical and Habitat camera tiles use `object-fit: cover` to fill the LCARS frame edge-to-edge. The migration MUST apply `::part(video) { object-fit: cover; }` (or the equivalent CSS variable Home Assistant exposes) to preserve the existing crop. If for any reason `cover` is unavailable on a given HA core version, the spec change MUST explicitly accept that regression and call it out in the release notes.
3. **Offline overlay over streaming element.** The existing LCARS offline overlay (greyscale screen + label) MUST sit over the streaming element as a sibling absolute-positioned `<div>` toggled by `state === 'unavailable'`. The migration MUST NOT rely on `<ha-camera-stream>`'s internal placeholder (which is not LCARS-styled and would visibly differ between camera platforms).

These three addenda are blocking for 5.5.2 kickoff; they do not block 5.5.0 or 5.5.1 because the migration itself does not land until 5.5.2.

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
