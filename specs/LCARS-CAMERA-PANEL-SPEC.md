# LCARS Camera Panel — Design Specification

**Author**: Geordi La Forge (LCARS UI Design Authority)
**Date**: Stardate 2026.05.03
**Status**: SHIPPED — extracted in v4.17.0 Panel Extraction Architecture (4X-4); current as of v5.1.0-beta.38.
**Panel Type**: `camera`
**Extends**: `LcarsBasePanel` (per LCARS-DEVICE-PANEL-SPEC.md §2)
**Source files**:
- [custom_components/lcars_dashboard/js/src/panels/camera/lcars-camera-panel.js](custom_components/lcars_dashboard/js/src/panels/camera/lcars-camera-panel.js)
- [custom_components/lcars_dashboard/js/src/panels/camera/lcars-camera-panel-styles.js](custom_components/lcars_dashboard/js/src/panels/camera/lcars-camera-panel-styles.js)

---

## 0. Design Philosophy

The Camera Panel is the **bridge viewscreen** for a single area. Just as the Enterprise-D's main viewer fills the forward bulkhead with a single, dominant feed of whatever the captain is looking at — be it a starfield, an away team, or a hailing officer — the per-area camera panel devotes its main rectangle to **one camera feed** at a time, framed by the LCARS bezel.

This panel is invoked when the user navigates to a specific habitat area (e.g. "Front Porch", "Garage", "Driveway") and wants to see what is happening *there*, right now. The viewscreen metaphor governs every design choice:

- The feed is the focal point. Sensor readouts (motion, occupancy, recording status) live to the side as supporting telemetry — never competing with the picture.
- State transitions (offline → connecting → live) are theatrical: a CRT-style scanline drift in the offline state, an "ESTABLISHING LINK" announcer overlay during connection, and a brief brightness bloom (`viewscreen-activate`) when the live image first paints.
- Empty space is preserved around the bezel. Per Bracer Jack's Manifesto, the frame breathes — controls are a single horizontal row beneath the feed, not a dense toolbar.

Per Bracer Jack's Core Design Rules: **LCARS is inherently flat/vector.** The camera bezel is a solid 3px butterscotch border, no drop shadows, no glow. The CRT static effect on offline cameras is the one permitted texture — and it is justified as a *diegetic* signal (the viewscreen has lost its feed) rather than a decorative flourish.

Per Roddenberry's mandate: **simplicity is the Omega state.** The panel surfaces only what the operator needs *for this camera*: is it live, is anyone there, and can I jump into the more-info dialog if I need full controls.

---

## 1. Distinction from the Tactical Camera Grid

There are **two camera surfaces** in this dashboard. They are deliberately different and must not be confused.

| Surface | Element | Purpose | Layout | When Shown |
|---|---|---|---|---|
| **Camera Panel** (this spec) | `<lcars-camera-panel>` | Per-area viewscreen — one device, one feed, full sensor + control context | Single dominant viewscreen + sidebar sensors + control row | Habitat dashboard, when the user opens an area that contains a camera device |
| **Tactical Camera Grid** | Tactical view's `CAMERA GRID (2×3)` (see [LCARS-TACTICAL-DASHBOARD-SPEC.md](specs/LCARS-TACTICAL-DASHBOARD-SPEC.md) §3.4) | Security / situational awareness — *all* camera feeds at a glance | Multi-tile grid of small thumbnails, no per-camera sensor sidebar | Tactical dashboard, always visible in ALL filter mode |

**Rule**: When in doubt, the rule is "**one camera, full context = camera panel; many cameras, glance-only = tactical grid**."

Both surfaces rely on `entity.attributes.entity_picture` (HA-proxied), but only the Camera Panel exposes the controls row, the sensor disclosure tier, and the offline "CONFIGURE IN [PLATFORM]" call-to-action.

---

## 2. Panel Frame Design

### 2.1 Frame Color

Per [`lcars-camera-panel.js`](custom_components/lcars_dashboard/js/src/panels/camera/lcars-camera-panel.js):

```js
get frameColor() { return 'var(--lcars-butterscotch)'; }
```

| State | Frame Color | CSS Variable | Hex | Rationale |
|---|---|---|---|---|
| Default / live | Butterscotch | `--lcars-butterscotch` | `#ff9966` | Habitat dashboard's primary frame color — cameras are first-class citizens of the home view |
| Offline | Gray | `--lcars-gray` | `#666688` | Standard LCARS unavailable state — `.device-panel-media[data-offline]` and `.camera-frame[data-state="offline"]` switch the bezel border to gray |

Hover on a live frame raises the bezel to `--lcars-gold` (`#ffaa00`) to telegraph the click affordance.

### 2.2 Border Style

Standard LCARS device panel frame inherited from `LcarsBasePanel` — left thick / top thin / right thin / bottom thick (Bracer Jack Rule 2: thick→thin or thin→thick, never same on consecutive turns).

The inner viewscreen `.device-panel-media` is a **3px solid bezel** with `border-radius: 0.5rem`; the per-camera `.camera-frame` uses 3px and `border-radius: 0.75rem`. When nested inside `.device-panel-media`, the inner `.camera-frame` strips its own border to avoid double-stroking.

### 2.3 Typography

| Element | Token | Casing | Color |
|---|---|---|---|
| Sensor labels / values | `--lcars-font-size-data` | UPPERCASE (handled by `<lcars-sensor-row>`) | Per `_getSensorIndicatorColor` |
| Disclosure button (`N MORE` / `N DIAGNOSTIC`) | `--lcars-font-size-label` (0.75rem) | UPPERCASE | `--lcars-gray` (hover: `--lcars-ice`) |
| `ESTABLISHING LINK` overlay | `--lcars-font-size-data` | UPPERCASE, `letter-spacing: 0.1em` | `--lcars-ice` |
| `VIEWSCREEN OFFLINE` overlay | `--lcars-font-size-data` | UPPERCASE, `letter-spacing: 0.1em` | `--lcars-gray` |
| Last signal timestamp | `--lcars-font-size-data` | UPPERCASE | `--lcars-gray` |
| Control button label | `--lcars-font-size-data` | UPPERCASE | `--lcars-black` on `--lcars-sunflower` (default), `--lcars-black` on `--lcars-gold` (`[data-on]`), `--lcars-space-white` on `--lcars-gray` (`[data-off]`) |

Font family: `var(--lcars-font)` — Antonio everywhere.

---

## 3. Grid Layout

Per `cameraPanelStyles`:

```css
.camera-content {
  display: grid;
  grid-template-columns: minmax(10rem, 14rem) minmax(18rem, 1fr);
  grid-template-rows: 1fr auto;
  grid-template-areas:
    "sensors media"
    "controls controls";
  gap: var(--lcars-gap);
}
```

```
┌──────────────┬──────────────────────────────┐
│  SENSORS     │  VIEWSCREEN (16:9 bezel)     │
│  (hero rows) │                              │
│  ─────────── │                              │
│  ▸ N MORE    │                              │
├──────────────┴──────────────────────────────┤
│  [CONTROL]  [CONTROL]  [CONTROL] …          │
└─────────────────────────────────────────────┘
```

- **Sensors column** is 10–14rem wide, scrolls vertically up to `max-height: 20rem` if hero + disclosure content overflows.
- **Media column** owns the 16:9 viewscreen (`--media-aspect: 16/9`). When the device has multiple camera entities, additional `.camera-frame` instances stack vertically below the first, separated by a 2px butterscotch divider (`border-top: 2px solid var(--panel-frame-color)`).
- **Controls row** spans both columns and wraps with `flex-wrap: wrap; gap: var(--lcars-gap)`.

---

## 4. Camera Image URL with Cache Busting

Cameras in Home Assistant expose a snapshot image via `state.attributes.entity_picture` — a relative URL HA proxies to the camera. Browsers cache aggressively; without intervention the viewscreen would freeze on the first frame.

Per [`lcars-camera-panel.js`](custom_components/lcars_dashboard/js/src/panels/camera/lcars-camera-panel.js):

```js
function cameraImageUrl(state) {
  const base = state?.attributes?.entity_picture;
  if (!base) return '';
  const ts = state.last_updated || state.last_changed || '';
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}_cb=${encodeURIComponent(ts)}`;
}
```

**Behavior**:
1. If no `entity_picture` attribute, return empty string → renders `.camera-spacer` (16:9 placeholder) instead of `<img>`.
2. Append `?_cb=<encoded last_updated timestamp>` (or `&_cb=…` if the URL already has a query string).
3. The cache-buster value only changes when the camera state actually updates — so the browser caches each *snapshot*, but the `<img>` re-fetches on every state push from HA.

**Security note** (see §10): `encodeURIComponent` on the timestamp prevents URL-injection if `last_updated` ever contained reserved characters. The `base` URL itself is HA-controlled.

---

## 5. Hero Sensor Filter (`CAMERA_HERO_CLASSES`)

Per [`lcars-camera-panel.js`](custom_components/lcars_dashboard/js/src/panels/camera/lcars-camera-panel.js):

```js
const CAMERA_HERO_CLASSES = new Set([
  'motion', 'occupancy', 'sound', 'connectivity', 'battery', 'recording',
]);
function isCameraHero(entry) {
  if (entry.domain === 'binary_sensor') return true;
  const dc = entry.state?.attributes?.device_class || '';
  return CAMERA_HERO_CLASSES.has(dc);
}
```

**Hero promotion rules**:
1. **All `binary_sensor` entities on a camera device are hero** — for a camera, every binary detection (motion, person, vehicle, package, etc.) is operationally relevant. This is asserted in the inline comment: "All binary_sensors on a camera device are detection-relevant hero data (diagnostics already filtered by tierEntities before this runs)."
2. **Numeric sensors** are promoted only if their `device_class` is one of the six in `CAMERA_HERO_CLASSES`: motion, occupancy, sound, connectivity, battery, recording.
3. Anything else (e.g. UniFi Protect's WiFi RSSI, last-formatted timestamps, IR brightness) falls into operational/diagnostic tiers, hidden behind the disclosure button.

This ruleset is intentional: a camera is a *detector*, not a thermometer. The hero rows must not be polluted with telemetry that doesn't help answer "is something happening?"

---

## 6. Entity Tier Partitioning (P3 DATA-007, P6 CRAWL-002)

Sensors are split into three tiers via `tierEntities(sensors, isCameraHero)` (from `lcars-entity-utils.js`):

| Tier | Source | Render Location |
|---|---|---|
| **Hero** | `isCameraHero(entry) === true` AND not diagnostic | Always visible at top of sensors column |
| **Operational** | Non-diagnostic, not hero | Inside disclosure (`#cam-disclosure-${deviceId}`) |
| **Diagnostic** | `entity.entity_category === 'diagnostic'` | Inside disclosure, below a `DIAGNOSTICS` divider |

**Disclosure button label logic**:
```js
${hiddenCount} ${diagnostic.length > 0 && operational.length === 0 ? 'DIAGNOSTIC' : 'MORE'}
```
- If only diagnostics are hidden → `"3 DIAGNOSTIC"`.
- Otherwise → `"3 MORE"`.

**Indicator color**:
- Hero rows use `_getSensorIndicatorColor(state)` — domain/state-aware.
- Operational and diagnostic rows are forced to `var(--lcars-gray)` to visually deprioritize them.

This tiering implements **P3 DATA-007 / GEORDI-013 / WESLEY-IDEA-011** (cited inline in the source).

---

## 7. Control Buttons

The controls row contains two distinct button categories.

### 7.1 Configure CTA (P3 DATA-014 / WESLEY-UX-001)

When the primary camera entity is `off/unavailable/unknown` AND **every** sibling entity on the device is also unavailable/unknown:

```js
const showConfigCta = primaryOff && allSiblingsDown;
```

A single gold CTA button appears first in the controls row:

```
[ ⚙  CONFIGURE FRONT PORCH IN UNIFI PROTECT ]
```

Click navigates to `/config/devices/device/${deviceId}` via `history.pushState` + a `location-changed` event (the standard HA SPA navigation pattern). Platform name is humanized via the `PLATFORM_NAMES` map (`unifiprotect → "UniFi Protect"`, `blink → "Blink"`, `nest → "Nest"`); unknown platforms get title-cased automatically.

If the platform is unknown, the label degrades gracefully to `"FRONT PORCH REQUIRES SETUP"`.

### 7.2 Device Control Buttons

For every entity in the `controls` partition (anything not a camera and not a sensor — typically switches like "Recording", "Smart Detect", "Doorbell Chime", `select.detection_sensitivity`, etc.):

```html
<button class="device-control-btn" ?data-on=${isOn} ?data-off=${isOff} …>
  <ha-icon .icon=${this._getEntityIcon(state)}></ha-icon>
  <span>${name}</span>
</button>
```

**State styling**:
- Default: sunflower background (`--lcars-sunflower`, `#ffcc99`), black text.
- `[data-on]` (`state === 'on'`): gold background (`--lcars-gold`, `#ffaa00`).
- `[data-off]` (`_isOff(state)` — off/unavailable/unknown/idle/standby/locked): gray background, white text.

**Click behavior**:
- If domain is in `TOGGLE_DOMAINS` → `_handleToggle(entityId)` — calls the appropriate service (`lock.lock/unlock`, `script.turn_on`, or `homeassistant.toggle`) with `lcarsAudio.playForEntity` feedback. Unavailable entities trigger `negativeAcknowledge`.
- Otherwise → `_handleEntityClick(entityId)` → `showMoreInfo(entityId)` (more-info dialog).

The panel intentionally **does not implement** explicit "snapshot" or "start recording" actions as bespoke buttons — those surface naturally via whichever switch/button entities the camera integration exposes. This keeps the panel agnostic across UniFi Protect, Blink, Nest, generic ONVIF, etc.

---

## 8. Interactions

| Interaction | Source | Action | Audio |
|---|---|---|---|
| Click camera frame | `@click` on `.camera-frame` | `_handleEntityClick(entity.entity_id)` → `showMoreInfo` (HA dialog) | (none — `_handleEntityClick` does not play audio in base) |
| Click disclosure button | `@click` on `.camera-disclosure-btn` | Toggles `_disclosureOpen` (Lit reactive property) | `lcarsAudio.play('entityInfo')` |
| Press Enter/Space on disclosure | `@keydown` on `.camera-disclosure-btn` | Same as click | `lcarsAudio.play('entityInfo')` |
| Click control button (toggle domain) | `@click` on `.device-control-btn` | `_handleToggle(entityId)` → service call | `lcarsAudio.playForEntity(entityId)` (or `negativeAcknowledge` if unavailable) |
| Click control button (non-toggle) | `@click` on `.device-control-btn` | `_handleEntityClick(entityId)` → more-info | (none) |
| Click Configure CTA | `@click` on `.camera-config-cta` | SPA navigation to `/config/devices/device/${deviceId}` | (none) |
| `<img> @load`  | Per camera frame | Sets `data-state="live"`, removes `aria-busy` | — |
| `<img> @error` | Per camera frame | Sets `data-state="offline"`, removes `aria-busy` | — |

**Disclosure animation**: `max-height: 0` → `50rem` via `transition: max-height var(--lcars-transition) ease`. Triangle rotates 90° via `transform`. Both gated by `prefers-reduced-motion`.

**Viewscreen activation animation** (`@keyframes viewscreen-activate`): A 600ms clip-path reveal from horizontal slit → full frame, combined with a brightness/saturation bloom. Plays once on `data-state="live"`. Disabled under `prefers-reduced-motion`.

---

## 9. Accessibility

| Surface | Practice |
|---|---|
| Sensor list container | `role="list"` with `aria-label="${deviceName} sensors"` |
| Disclosure button | `aria-expanded`, `aria-controls="cam-disclosure-${deviceId}"`; keyboard-activatable with Enter and Space (explicit `@keydown` handler with `e.preventDefault()`) |
| Disclosure region | Stable `id="cam-disclosure-${deviceId}"` matching `aria-controls` |
| Camera frame | `aria-busy="${camState === 'connecting'}"` — toggled to `false` on `@load`/`@error` so screen readers stop announcing "loading" once the feed resolves |
| Camera `<img>` | `alt="${name} camera feed"` — never empty, includes the area-stripped device name |
| Overlays | `aria-hidden="true"` on connecting and offline overlays — they are decorative and the underlying state is already exposed via `aria-busy` and the alt text |
| Controls row | `aria-label="${deviceName} controls"` |
| Control button | `aria-label="${name}: ${state.state}"` plus matching `title` for tooltip |
| Configure CTA | `aria-label="Configure ${deviceName} in ${humanizePlatform(platform)}"` — full sentence for screen readers |
| Focus rings | `:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }` on `.device-control-btn`, `.camera-frame`, and `.camera-disclosure-btn` — meets WCAG 2.4.13 (≥2px, 3:1 contrast: ice on black = 10.4:1) |

**Target size (WCAG 2.5.8 AA)**: Control buttons are `height: 2.25rem` ≈ 36px; horizontal padding contributes additional width — meets the 24×24 CSS-px minimum with margin to spare. The disclosure button is `min-height: 24px` exactly at the floor — see §13.

**Keyboard navigation** (per WebAIM keyboard testing table): Tab walks sensors → disclosure → camera frame(s) → controls in source order, which matches visual flow. Enter/Space activates buttons and the camera frame (the camera frame is a `<div>` with `@click` only — see §13).

**Reduced motion**: All ambient animations (CRT static drift, connecting text breathe, viewscreen activate, offline text breathe) are disabled under `@media (prefers-reduced-motion: reduce)`.

---

## 10. Security Considerations (Worf perspective)

| Threat | Mitigation |
|---|---|
| **Stale snapshot fooling the operator** ("camera looks fine — but the burglar walked past 10 minutes ago") | Cache-busting query string `?_cb=<last_updated>` ensures a fresh fetch every time HA pushes a state update; browser-side cache only ever serves the snapshot bound to the current state |
| **Script injection via `entity_picture`** | The base URL originates from Home Assistant, not user input. The Lit template uses `src="${imgUrl}"` (attribute interpolation), which Lit auto-escapes. The cache-buster value is wrapped in `encodeURIComponent` before concatenation |
| **Open-redirect / external camera URL** | HA proxies camera streams through its own origin; `entity_picture` is a relative path under the HA host. Even if a malicious integration set an absolute URL, the `<img>` element loads it as an image only — no script execution context |
| **`window.dispatchEvent('location-changed')` from Configure CTA** | Standard HA SPA navigation pattern; `deviceId` is sourced from `this.group.device.id` (HA-controlled) and is interpolated into a path under the `/config/devices/device/` namespace — no user input involved |
| **Audio-spam DoS via rapid disclosure toggling** | `lcarsAudio.play('entityInfo')` is a Web Audio synthesized tone; volume is bounded by the audio module (0.10–0.15 gain per `LCARS-AUDIO-SPEC.md`) and respects the user's mute toggle |
| **Information leakage in `alt` text** | Alt text is the area-stripped device name only — no entity IDs, no internal identifiers leaked to copy-paste or screen-scraping AT |
| **Unavailable entity toggle attempts** | `_handleToggle` short-circuits when `state === 'unavailable'` and plays `negativeAcknowledge` — no service call is dispatched, preventing accidental commands during outages |

The Configure CTA's navigation target is well-formed (`/config/devices/device/${deviceId}`), but `deviceId` is interpolated without explicit URL encoding. In practice HA device IDs are always lowercase hex, so this is safe today — see §13.

---

## 11. Mobile / Responsive

Per `cameraPanelStyles`:

```css
@media (max-width: 30rem) {
  .camera-content {
    grid-template-areas: "media" "sensors" "controls";
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
  }
}
```

Below **30rem (480px)** — narrower than the requested 767px breakpoint; see §13 — the layout collapses to a single column with the **viewscreen on top**, sensors in the middle, controls at the bottom. This preserves the "feed first" hierarchy on phones and avoids cramming a 14rem sidebar next to a sub-300px viewscreen.

The 16:9 aspect ratio is preserved on every breakpoint via `aspect-ratio: 16/9` on `.device-panel-media` and `.camera-spacer`. Control buttons wrap naturally via `flex-wrap: wrap`.

---

## 12. Performance

| Concern | Implementation |
|---|---|
| **Image refresh strategy** | Snapshot-only — no MJPEG, no WebRTC. The `<img>` re-fetches whenever the cache-buster query string changes (i.e., when HA pushes a `last_updated`). For cameras with frequent motion this is effectively several frames per minute; for idle cameras the image holds |
| **Multiple cameras per device** | Stacked vertically inside `.device-panel-media`. No virtualization — typical devices expose 1–2 camera entities, occasionally 3 (e.g. UniFi Protect floodlight cams with package + main lens) |
| **Animation budget** | Three concurrent ambient animations possible per panel: CRT static drift (offline only, 8s linear infinite), connecting text breathe (4s, only during connect), offline text breathe (4s, offline only). Steady-state for a *live* camera = 0 ambient animations. Well under the 6-animation budget |
| **GPU compositing** | `viewscreen-activate` uses `clip-path` and `filter` (paint-triggered, not pure transform). Acceptable per precedent — runs once for 600ms on state transition only |
| **Disclosure expand/collapse** | `max-height` transition (paint-triggered) — kept because the content height is unknown ahead of time. Capped at 50rem |
| **Tier partitioning cost** | `tierEntities` runs once per render over the device's sensor entries (typically <20). No memoization needed |
| **Cache-busting** | URL string concatenation; no DOM mutation beyond the `src` attribute change. Browsers reuse the underlying `HTMLImageElement` |

---

## 13. Known Limitations / Future Work

1. **Camera frame is a `<div>` with click handler, not a button** — Despite being interactive, the camera bezel is a `<div class="camera-frame">` with `@click` and `:focus-visible` styles. It is **not** keyboard-activatable today (no `tabindex`, no `@keydown`, no `role="button"`). WCAG 2.1.1 (Keyboard) requires every operable element to be keyboard-reachable. **Action**: add `tabindex="0"`, `role="button"`, `aria-label`, and Enter/Space `@keydown` handlers in a follow-up.
2. **Disclosure button minimum height is exactly at WCAG 2.5.8 floor** — `min-height: 24px` is the absolute minimum target size. Consider raising to 28–32px for safer touch targets.
3. **Mobile breakpoint is 30rem (480px), not 767px** — Tablets in portrait rendering between 480–767px get the desktop two-column layout, which can crowd the sensor sidebar against a compressed viewscreen. Consider raising the breakpoint to `48rem` or introducing a midpoint layout.
4. **No camera label inside the bezel** — The styles define `.camera-label` (with icon, name, state badge) but the render template does not emit it. Either remove the dead CSS or surface a label overlay for multi-camera devices where the device name alone is ambiguous.
5. **Configure CTA `deviceId` is not URL-encoded** — Safe today (HA IDs are hex), but defensive coding would call `encodeURIComponent(deviceId)` before concatenation.
6. **`platform` is read from `primaryCam.entity.platform`** — Falls back to a generic "REQUIRES SETUP" label if the integration platform isn't recognized. The `PLATFORM_NAMES` map is hardcoded to three platforms (UniFi Protect, Blink, Nest); other integrations (Frigate, ONVIF, Reolink, generic IP camera) get auto-title-cased platform slugs which read awkwardly in the LCARS uppercase font.
7. **Snapshot-only feed** — No live MJPEG/WebRTC. Acceptable for the viewscreen metaphor (the bridge viewer often shows a static composite), but power users may want a "GO LIVE" affordance that opens the more-info dialog's stream — currently they must click the frame to discover this.
8. **Multiple camera frames stack vertically without sub-frame chrome** — When a device has 2+ cameras, the secondary frames inherit no header label. The user sees two viewscreens with no in-frame indication of which is which beyond the snapshot content.
9. **CRT static drift always animates on offline cameras** — Even without `prefers-reduced-motion`, a long-offline camera will animate indefinitely. Consider pausing after N seconds or when the panel is off-screen via IntersectionObserver.

---

## Appendix A: Source Citations

- `cameraImageUrl(state)` — [`panels/camera/lcars-camera-panel.js`](custom_components/lcars_dashboard/js/src/panels/camera/lcars-camera-panel.js)
- `CAMERA_HERO_CLASSES`, `isCameraHero(entry)` — same file
- `PLATFORM_NAMES`, `humanizePlatform(slug)` — same file
- `formatTimeSince(isoStr)` — same file (last-signal label)
- `tierEntities`, `isDiagnosticEntity` — `lcars-entity-utils.js`
- `_partitionDeviceEntities`, `_handleToggle`, `_handleEntityClick`, `_isOff`, `_getEntityIcon`, `_getSensorIndicatorColor`, `_friendlyName`, `_shortDeviceName` — [`lcars-base-panel.js`](custom_components/lcars_dashboard/js/src/lcars-base-panel.js)
- `showMoreInfo` — `lcars-helpers.js`
- `lcarsAudio.play`, `lcarsAudio.playForEntity` — `lcars-audio.js` (see [`specs/LCARS-AUDIO-SPEC.md`](specs/LCARS-AUDIO-SPEC.md))
- All styles — [`panels/camera/lcars-camera-panel-styles.js`](custom_components/lcars_dashboard/js/src/panels/camera/lcars-camera-panel-styles.js)
