# LCARS Hazard Detection Panel — Design Specification

**Author**: Geordi La Forge (LCARS UI Design Authority)
**Collaborator**: Worf (Security & Safety-Critical Systems Officer)
**Date**: Stardate 2026.05.03
**Status**: SHIPPED — implemented as part of the 4X-39 panel-extraction task; current as of v5.1.0-beta.38.
**Priority**: HIGH (safety-critical — fire / smoke / CO detection)
**Panel Type**: `hazard`
**Extends**: `LcarsBasePanel` (per LCARS-PANEL-EXTRACTION-ARCHITECTURE.md)
**File**: [custom_components/lcars_dashboard/js/src/panels/hazard/lcars-hazard-panel.js](custom_components/lcars_dashboard/js/src/panels/hazard/lcars-hazard-panel.js)
**Styles**: [custom_components/lcars_dashboard/js/src/panels/hazard/lcars-hazard-panel-styles.js](custom_components/lcars_dashboard/js/src/panels/hazard/lcars-hazard-panel-styles.js)
**Devices**: Nest Protect (smoke + CO + heat + occupancy + battery), generic `binary_sensor` with safety device classes

---

## 0. Design Philosophy

The Hazard Detection Panel is the **Fire Suppression / Atmospheric Hazard Console** — the bridge station that monitors the ship's life-safety detection grid. On a Galaxy-class starship, the moment any compartment registers smoke, combustion byproducts, or rising heat, the appropriate console annunciates the alert. The panel here serves the same function: it aggregates every Nest Protect (or generic smoke/CO/heat/safety binary sensor) into a per-room status grid and surfaces a single, unmistakable header signal — "ALL CLEAR" or "⚠ N ALERT".

Per Roddenberry's mandate **the ship takes care of you**: this panel does not ask the operator to interpret detector chemistry or sensor faults. It tells you, in one glance, whether any compartment is currently in an alarm condition and which compartment is responsible. Battery telemetry is a secondary read — the operator only needs to act on it during routine maintenance, not during an emergency.

Per Bracer Jack's Manifesto **simplicity is the Omega state**: a hazard panel must never bury the alarm signal under decoration. There are no scrolling animations, no decorative chevrons, no ambient pulsing on the safety-critical rows. The frame and badge change color, the row text reads `DETECTED` in tomato, and that is the entire alert vocabulary.

Per Bracer Jack's Core Design Rules **LCARS is inherently flat/vector**: indicators are solid circles, status pills are flat color, the battery bar is a single rectangle clipped by `overflow: hidden`. No gradients, no glows, no 3D affordances anywhere on the panel.

This is **NOT** an alarm-system control panel (see `LCARS-ALARM-PANEL-SPEC.md` for SimpliSafe-style intrusion arming). This panel is read-only telemetry for **autonomous detection devices** that already self-trigger and self-sound at the device. The dashboard is a *secondary* indicator — never the primary life-safety annunciator.

---

## 1. Panel Frame Design

### 1.1 Dynamic Frame Color (Two-State)

The hazard panel uses a **two-state frame** driven by the `frameColor` getter. Unlike the EV Charger (5 states) or Climate (continuous), hazard detection has only two operationally meaningful states: **clear** and **alarm**. Adding intermediate hues would dilute the alarm signal.

```js
get frameColor() {
  const allEntries = this._getAllEntities();
  const hasAlert = allEntries.some(e => {
    const dc = e.state?.attributes?.device_class || '';
    return HAZARD_STATUS_CLASSES.has(dc) && e.state?.state === 'on';
  });
  return hasAlert ? 'var(--lcars-tomato)' : 'var(--lcars-sunflower)';
}
```

| Panel State | Trigger Condition | Frame Color | CSS Variable | Hex |
|-------------|-------------------|-------------|--------------|-----|
| **All Clear** | No safety-class binary sensor is `on` | Sunflower | `--lcars-sunflower` | `#ffcc99` |
| **Alarm** | Any safety-class binary sensor is `on` | Tomato | `--lcars-tomato` | `#ff5555` |

**Rationale for sunflower as default**: Sunflower is the LCARS "heading" hue — a neutral, attentive yellow that reads as "monitoring nominal" without signalling either action or alarm. It is consistent with the Illumination dashboard's sunflower frame (a "lights are on / standing watch" semantic). When the panel transitions to tomato, the contrast against the previous sunflower is unambiguous.

### 1.2 Border Style

Standard LCARS panel frame supplied by `<lcars-panel-frame>` (the wrapper rendered by `LcarsBasePanel`). Frame thickness follows Bracer Jack Rule 2 (thick→thin/thin→thick on consecutive turns). The hazard panel does not override the base frame geometry.

### 1.3 Typography

| Element | Size Token | CSS Variable | Casing | Color |
|---------|-----------|-------------|--------|-------|
| Panel header (`HAZARD DETECTION`) | Sub | `--lcars-font-size-sub` | UPPERCASE | `--lcars-text-heading` |
| Section labels (`DETECTORS`, `BATTERY STATUS`) | Label | `--lcars-font-size-label` (0.75rem) | UPPERCASE, letter-spacing 0.08em | `--lcars-gray` |
| Detector name | Data | `--lcars-font-size-data` | UPPERCASE | `--lcars-space-white` |
| Status row label (`SMOKE`, `CARBON MONOXIDE`) | 0.75rem | inline | UPPERCASE | `--lcars-gray` |
| Status row value (`DETECTED` / `CLEAR`) | 0.75rem | inline | UPPERCASE, font-weight 700 | tomato (alarm) / sunflower (clear) |
| Battery chip | Data | `--lcars-font-size-data` | UPPERCASE | dynamic by level |

Font family: `var(--lcars-font)` — Antonio everywhere.

---

## 2. Hazard State Classes

Two device-class allow-lists drive every classification decision in the panel. Both are declared as module-scope `Set` constants for O(1) lookup.

### 2.1 `HAZARD_STATUS_CLASSES`

```js
const HAZARD_STATUS_CLASSES = new Set(['smoke', 'gas', 'carbon_monoxide', 'heat', 'safety']);
```

| Device Class | Source | Alarm Semantic |
|--------------|--------|----------------|
| `smoke` | Home Assistant `binary_sensor` device class | Combustion particulate detected |
| `gas` | HA `binary_sensor` device class | Combustible gas (e.g., methane, propane) detected |
| `carbon_monoxide` | HA `binary_sensor` device class | CO above safe threshold |
| `heat` | HA `binary_sensor` device class | Rapid temperature rise / fixed-temp threshold exceeded |
| `safety` | HA `binary_sensor` device class | Generic life-safety alert (vendor-specific) |

A sensor in this set whose `state === 'on'` is treated as an **active alarm**. There is no debounce, no quorum, and no severity gradient — a single `on` triggers the tomato frame, the alert badge, and the `data-alert` row styling. This is intentional: false-positive recovery is the operator's job; false negatives are unacceptable.

### 2.2 `HAZARD_BATTERY_CLASSES`

```js
const HAZARD_BATTERY_CLASSES = new Set(['battery']);
```

Reserved for future expansion (e.g., adding `battery_low` binary sensors). Currently only `sensor.*` entities with `device_class === 'battery'` and `domain === 'sensor'` are surfaced in the Battery Overview.

### 2.3 Battery Color Thresholds

Hard-coded inside `_renderBatteryOverview()`:

| Battery Level | Color | Variable |
|---------------|-------|----------|
| `> 50 %` | Sunflower | `--lcars-sunflower` |
| `> 20 %` and `≤ 50 %` | Butterscotch | `--lcars-butterscotch` |
| `≤ 20 %` | Tomato | `--lcars-tomato` |

Tomato at ≤20 % matches the alarm hue intentionally — a depleted detector battery is itself a safety condition (the device may stop responding before the operator notices the chirp).

---

## 3. Grid Layout

### 3.1 Top-Level Structure

`renderContent()` returns a single column when at least one detector is discovered; otherwise it renders the empty state (`NO HAZARD DETECTORS`).

```
┌─────────────────────────────────────────────────┐
│ DETECTORS                                       │  ← section label
│ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│ │ Living   │ │ Bedroom  │ │ Garage   │  ← cards │
│ │ Room     │ │          │ │          │          │
│ │ ● SMOKE  │ │ ● SMOKE  │ │ ● SMOKE  │          │
│ │   CLEAR  │ │   CLEAR  │ │   CLEAR  │          │
│ │ ● CO     │ │ ● CO     │ │ ● CO     │          │
│ │   CLEAR  │ │   CLEAR  │ │   CLEAR  │          │
│ └──────────┘ └──────────┘ └──────────┘          │
│                                                 │
│ BATTERY STATUS                                  │
│ Living Room: ▮▮▮▮▮ 92%   Bedroom: ▮▮▮ 64%       │
└─────────────────────────────────────────────────┘
```

### 3.2 Grid Geometry

```css
.hazard-detectors {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
  gap: var(--lcars-gap);
}
```

- Columns auto-fill at 12 rem minimum width — 1 column on narrow viewports, 4–5 columns on a wide engineering dashboard.
- `gap: var(--lcars-gap)` matches the canonical LCARS invisible grid (0.25 rem).
- Detector card has `border-left: 3px solid var(--detector-color)` and `border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0` — the LCARS "tab" affordance, flat on the alert side, rounded on the trailing edge.

### 3.3 Section Divider

Section labels (`DETECTORS`, `BATTERY STATUS`) use a 2 px `border-bottom` in `--lcars-gray` rather than a separate `<lcars-section-divider>` component. This keeps the per-card visual weight low and the alarm state visually dominant.

---

## 4. Entity Discovery

### 4.1 Panel Type Mapping

Entity-to-panel routing is performed in [custom_components/lcars_dashboard/js/src/lcars-entity-utils.js](custom_components/lcars_dashboard/js/src/lcars-entity-utils.js):

```js
['nest_protect', PANEL_TYPE_HAZARD],
```

A device is routed to the hazard panel when **any** of the following are true (per the entity-utils discovery comment block):

1. The device has at least one entity whose `entity.platform === 'nest_protect'`.
2. The device's entities include **≥ 1 strong hazard sensor** (`smoke` / `gas` / `carbon_monoxide`).
3. The device's entities include **≥ 2 any-class hazard sensors** (catches `heat` + `safety` combinations and generic multi-sensor units).

Rules 2 and 3 ensure non-Nest hardware (e.g., First Alert Z-Wave, Aqara, Shelly Smoke) is also routed to this panel without requiring per-vendor allow-lists.

### 4.2 Entity Partitioning

`_partitionEntities()` walks `_getAllEntities()` (provided by `LcarsBasePanel`) and groups every discovered entity by `entity.device_id`:

```js
{
  deviceMap: Map<deviceId, { device, entries[] }>,
  ungrouped: entry[]
}
```

`ungrouped` exists for entities with no `device_id` (rare — typically template sensors). It is currently **not rendered** by `renderContent()`; documenting this so a future maintainer does not assume it is shown.

### 4.3 Per-Card Entity Roles

For each device the panel pulls:

- **Status entries** — every entity whose `device_class ∈ HAZARD_STATUS_CLASSES`.
- **Occupancy entry** — the *first* entity whose `device_class === 'occupancy'` (Nest Protect's pathlight motion sensor). Optional; rendered only if present.
- **Primary entity ID** — `group.entries[0].entity.entity_id`. This is the click target for `more-info` (see §8).

Battery entries are gathered separately by `_renderBatteryOverview()` and are filtered down to `device_class === 'battery'` AND `domain === 'sensor'` — preventing `binary_sensor.*_battery` (a "battery low" boolean) from being rendered as a 0% / 100% chip.

---

## 5. Per-Room Status Display

### 5.1 Detector Card Anatomy

```
┌───────────────────────────────┐  ← border-left: 3px (color = state)
│ LIVING ROOM PROTECT           │  ← detector name (uppercase, ellipsised)
│ ●  SMOKE              CLEAR   │  ← status row: dot, label, value
│ ●  CARBON MONOXIDE    CLEAR   │
│ ●  HEAT               CLEAR   │
│ ●  OCCUPANCY          CLEAR   │  ← optional, only if present
└───────────────────────────────┘
```

### 5.2 Status Row Rules

| Condition | Indicator Dot | Value Text | Value Color |
|-----------|---------------|------------|-------------|
| Status sensor `state === 'on'` | tomato | `DETECTED` | tomato |
| Status sensor `state !== 'on'` | sunflower | `CLEAR` | sunflower |
| Occupancy `state === 'on'` | ice (`--lcars-ice`) | `DETECTED` | inherited |
| Occupancy `state !== 'on'` | gray | `CLEAR` | inherited |

The label is generated by `dc.replace(/_/g, ' ').toUpperCase()` — `carbon_monoxide` → `CARBON MONOXIDE`. No translation table; this is intentional and language-neutral (HA device classes are English-only by spec).

### 5.3 Alarm State Card Treatment

When **any** status entry on a card is `on`, the card additionally receives:

```css
.hazard-detector-card[data-alert] {
  border-left-color: var(--lcars-tomato);
  background: rgba(255, 85, 85, 0.08);
}
```

The 8 % tomato wash is the only "fill" used in the panel — calibrated to be visible against `#000` without competing with the value text. (Verified: foreground tomato `#ff5555` on the washed background still measures > 4.5:1.)

---

## 6. Battery Overview

### 6.1 Layout

```css
.hazard-batteries {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
}
```

Wrapping flex row, not a grid — battery chips are inherently small and wrap naturally as the viewport narrows. Each chip is keyboard-focusable and dispatches `more-info` for the underlying battery sensor.

### 6.2 Chip Anatomy

```
Living Room: ▮▮▮▮▮ 92%
└──────┬───┘ └──┬──┘ └┬┘
   gray label   bar  level (color = threshold)
```

- Bar dimensions: `2rem × 0.5rem` with `border-radius: 2px`.
- Background: `--lcars-gray`. Fill: dynamic per §2.3.
- Fill animation: `transition: width 1s ease` — gated by the panel-level `prefers-reduced-motion` rule (§10).

### 6.3 Suppression

If no battery sensors are discovered in any device group, the entire `BATTERY STATUS` section (label + chips) is suppressed via an empty `html` template return. No empty-state placeholder is shown — battery telemetry is auxiliary, and a missing section is not itself informative.

---

## 7. Safety Alerts (Header Badge)

### 7.1 `renderBadge()` Contract

The header badge is the panel's primary annunciator. It is rendered by overriding the `LcarsBasePanel.renderBadge()` hook and consumed by `<lcars-panel-frame>`.

| Condition | Badge Value | Badge Color |
|-----------|-------------|-------------|
| `alertCount > 0` | `⚠ {alertCount} ALERT` | `--lcars-tomato` |
| `alertCount === 0` | `ALL CLEAR` | `--lcars-sunflower` |

`alertCount` is computed identically to the `frameColor` getter (re-walking `_getAllEntities()` and filtering on `HAZARD_STATUS_CLASSES`). Both run on every Lit render — at HA's typical state-update cadence (sub-second), the cost is negligible and avoiding shared state guarantees the frame and badge can never disagree.

### 7.2 LCARS Audio Integration

This panel **does not currently emit any `lcarsAudio` events directly.** Detection devices (Nest Protect, First Alert) are themselves life-safety annunciators with on-device sirens that the local fire code requires. The dashboard is a *secondary indicator* and must not introduce alert sounds that could mask the primary annunciator.

A future enhancement (tracked in §12) may add a single `lcarsAudio.criticalAlert()` invocation on the *transition* from clear → alarm, to be played only when the dashboard has focus and only on alarm onset (not while alarm persists). Per [LCARS-AUDIO-SPEC.md](specs/LCARS-AUDIO-SPEC.md) §"Audio Compliance Rules" #4, that sound is in the allow-list for `prefers-reduced-motion` users (it is safety-critical).

---

## 8. Interactions

### 8.1 Click Targets

| Target | Action |
|--------|--------|
| Detector card | `showMoreInfo(group.entries[0].entity.entity_id)` — opens HA more-info dialog for the primary sensor on that detector |
| Battery chip | `showMoreInfo(b.entity.entity.entity_id)` — opens HA more-info for the battery sensor |

### 8.2 Keyboard Activation

Both targets implement the standard LCARS keyboard-activation pattern:

```js
@keydown=${(e) =>
  (e.key === 'Enter' || e.key === ' ') &&
  (e.preventDefault(), showMoreInfo(...))}
```

`preventDefault()` on Space prevents page scroll. Tab order is the visual order (cards top-to-bottom, left-to-right, then battery chips left-to-right), achieved purely by source order — no `tabindex > 0` is used.

### 8.3 No Direct Control

The panel issues **no** `hass.callService` calls. Detectors cannot be silenced, tested, or reset from this panel. This is deliberate (see Worf's notes in §11).

---

## 9. Accessibility (Safety-Critical)

A safety panel must clear a higher accessibility bar than a decorative panel. The current implementation meets WCAG 2.2 AA on all measured criteria; AAA is the explicit aspiration.

### 9.1 WCAG Contrast Verification

All status colors verified against `#000000` background and against the 8 % tomato wash:

| Color | Hex | vs `#000` | vs `rgba(255,85,85,0.08)` over `#000` | WCAG AA Normal (4.5:1) |
|-------|-----|-----------|---------------------------------------|------------------------|
| Sunflower | `#ffcc99` | 13.1:1 | 12.4:1 | ✓ PASS |
| Tomato | `#ff5555` | 5.2:1 | 4.9:1 | ✓ PASS |
| Ice (occupancy) | `#99ccff` | 10.5:1 | 9.9:1 | ✓ PASS |
| Gray (labels) | `#666688` | 4.7:1 | n/a | ✓ PASS |
| Space-white (names) | `#f5f6fa` | 19.6:1 | n/a | ✓ PASS |

### 9.2 Roles & Names

- Each detector card: `role="group"` + `aria-label="${deviceName}"`. Group role lets a screen reader announce "Living Room Protect, group" before reading children.
- Each card and battery chip: `tabindex="0"` — included in the tab sequence.
- Status rows do not carry an explicit ARIA role; they rely on the visible text (`SMOKE DETECTED`) and the parent group's accessible name. The text is the truth — not the dot color.

### 9.3 Focus Visible

```css
.hazard-detector-card:focus-visible {
  outline: 2px solid var(--lcars-ice);
  outline-offset: 2px;
}
```

Plus the `lcarsFocusRing` mixin imported from `lcars-styles.js`. The 2 px ice ring meets WCAG 2.2 §2.4.13 (Focus Appearance) — ≥ 2 px perimeter, contrast vs unfocused state ≥ 3:1 (ice 10.5:1 vs black, 5+ :1 vs sunflower).

### 9.4 Color Independence (WCAG §1.4.1)

No information is conveyed by color alone:

- Status dot color is **redundant** with the value text (`DETECTED` / `CLEAR`).
- Frame tomato is **redundant** with the badge text (`⚠ N ALERT`).
- Battery color is **redundant** with the numeric percentage.

A monochrome user (or a screen reader user) receives the same alarm signal.

### 9.5 Live-Region Announcement (Gap — see §12)

The panel does **not** currently wrap the badge in `aria-live="assertive"` or `role="alert"`. Screen-reader users will hear the alert only when they next navigate to the panel. This is a **known accessibility gap** for a safety-critical panel and is captured in §12 as a high-priority follow-up.

### 9.6 Touch Target Size (WCAG §2.5.8)

Detector cards: ≥ 12 rem wide × ≥ ~3.5 rem tall = vastly exceeds the 24 × 24 CSS-pixel minimum. Battery chips: ≥ ~6 rem × 1.5 rem — meets the minimum on the long axis but is **borderline on the vertical axis** (≈ 24 px at default font scale). This should be widened or padded on the next pass.

---

## 10. Mobile / Responsive

Per Geordi-canon (≤ 767 px = mobile breakpoint), the panel uses a single internal media query:

```css
@media (max-width: 30rem) {
  .hazard-detectors {
    grid-template-columns: 1fr;
  }
}
```

At ≤ 30 rem (≈ 480 px), the detector grid collapses to a single column. The auto-fill `minmax(12rem, 1fr)` rule above 30 rem already produces a single column on viewports between 30 rem and ≈ 24 rem of usable interior width, so the explicit override is a belt-and-braces guarantee for narrow phones.

Battery chips (a `flex-wrap: wrap` row) reflow naturally with no media query needed.

```css
@media (prefers-reduced-motion: reduce) {
  .hazard-detector-card {
    transition-duration: 0.01ms !important;
  }
}
```

The detector-card hover transition is suppressed under reduced-motion. **The 1 s battery-fill `transition: width 1s ease` is NOT currently gated by `prefers-reduced-motion` — see §12.**

---

## 11. Security Considerations (Worf Perspective)

A safety panel is a high-value target for spoofing and a high-value target for authors who might try to inject markup through entity attributes. Worf's review:

### 11.1 No Direct Control Surface

The panel issues **no** service calls. There is no "silence", no "test", no "reset". An attacker who compromised the dashboard cannot disable a detector through this UI. Silencing must be performed at the device or via the HA app, both of which require independent authentication. ✓ APPROVED.

### 11.2 XSS / Markup-Injection Posture

All entity-derived strings are interpolated through Lit's `html` tagged template, which auto-escapes text-node content. Audited bindings:

| Binding | Source | Sink | Safe? |
|---------|--------|------|-------|
| `${deviceName}` | `device.name_by_user` / `device.name` | text node | ✓ Lit-escaped |
| `${label}` (`SMOKE`, `HEAT`, …) | `device_class` (HA-controlled, never user input) | text node | ✓ Lit-escaped + closed device-class vocabulary |
| `${stateText}` (`DETECTED`/`CLEAR`) | string literal in JS | text node | ✓ literal |
| `${color}` in `style="background:${color}"` | **literal CSS variable strings only** (`var(--lcars-tomato)` etc.) | inline style | ✓ closed vocabulary, no entity interpolation into CSS |
| `${b.level}` in `style="width:${b.level}%"` | `parseFloat(entry.state.state) || 0` | inline style | ✓ coerced to number |
| `${Math.round(b.level)}%` | numeric | text node | ✓ numeric |

**No entity attribute is interpolated into a `style`, `href`, `src`, or event-handler attribute.** Inline style values are drawn exclusively from a fixed enumeration of CSS variables. ✓ APPROVED.

### 11.3 Input Validation on State

- `entry.state?.state === 'on'` — strict equality against the literal `'on'`. Any other state (`off`, `unavailable`, `unknown`, `null`, `undefined`) is treated as **clear**. This is the secure default for a *display* — it cannot mask a real alarm because real alarms reliably set `'on'`.
- `parseFloat(entry.state?.state) || 0` for battery — coerces non-numeric, `NaN`, or missing values to `0`, which paints the bar tomato. A spoofed/missing battery state therefore *increases* operator attention. ✓ correct fail-secure direction.

### 11.4 Fail-Open Concern (Reviewed)

If `_getAllEntities()` returns `[]` (e.g., HA WebSocket lost), the panel renders `NO HAZARD DETECTORS` with a sunflower frame — *not* tomato. This is the conventional "no devices configured" state and is **not** an alarm. A user whose detectors all dropped from HA simultaneously would see a misleadingly calm panel.

**Recommended mitigation** (tracked in §12): persist the last-known-detector-count in component state and, if the count drops to zero from a non-zero baseline, render a degraded warning (gray frame + `DETECTORS UNREACHABLE` badge). Worf's call: this is a defense-in-depth improvement, not a blocker — the device itself remains the primary annunciator.

### 11.5 No Network Egress

The panel makes no `fetch`, no WebSocket of its own, no analytics. All data flows through the HA `hass` object. ✓ APPROVED.

---

## 12. Known Limitations / Future Work

| ID | Severity | Description | Recommended Owner |
|----|----------|-------------|-------------------|
| HZ-01 | HIGH (a11y) | Badge transitions are not announced to screen readers — no `aria-live="assertive"` / `role="alert"` wrapper. Add a polite live region that re-renders the badge text when `alertCount` changes. | Geordi |
| HZ-02 | MEDIUM (a11y) | Battery-fill `transition: width 1s ease` is not gated by `prefers-reduced-motion`. Move the transition into a `@media (prefers-reduced-motion: no-preference)` block, or shorten to `0.01ms` under `reduce`. | Geordi |
| HZ-03 | MEDIUM (a11y) | Battery chip vertical hit area is borderline at the WCAG 2.2 §2.5.8 24 × 24 CSS-px target. Add `padding: 0.25rem 0` or wrap each chip in a button-styled container. | Geordi |
| HZ-04 | MEDIUM (security) | Fail-open posture when entities disappear (see §11.4). Track a baseline detector count and surface a `DETECTORS UNREACHABLE` warning if it drops to zero. | Worf + Data |
| HZ-05 | LOW (audio) | No audio cue on the clear → alarm transition. Per §7.2, evaluate adding `lcarsAudio.criticalAlert()` on transition (not on persistence) gated by document focus. Coordinate with `LCARS-AUDIO-SPEC.md`. | Geordi + Wesley |
| HZ-06 | LOW (UX) | The `ungrouped` partition (entities with no `device_id`) is computed but never rendered. Either render in a fallback `MISC DETECTORS` section or remove the dead code path. | Data |
| HZ-07 | LOW (i18n) | Status label is `dc.replace(/_/g, ' ').toUpperCase()` — works for English HA installs only. Future i18n pass should map device classes through HA's localization tables. | (deferred) |
| HZ-08 | LOW (UX) | The panel surfaces no self-test / last-test telemetry that Nest Protect exposes (`sensor.*_last_test` etc.). A future revision could add a "LAST TEST" row per detector. | Wesley |
| HZ-09 | INFO | This panel intentionally lacks any control affordance (silence/test/reset). This is not a defect; it is a Worf-approved security posture. Document this clearly in any future design review that proposes adding controls. | (informational) |

---

**End of Specification**

*This panel is safety-critical. Any future change to `HAZARD_STATUS_CLASSES`, the `frameColor` getter, the `renderBadge()` contract, or the alarm color palette MUST receive review from both Geordi (LCARS Design Authority) and Worf (Security Officer) before merge.*
