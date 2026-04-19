# P5: Tactical, Alarm, Garage Door, and High-Impact Action Safety - Final Implementation Spec

**Author**: William T. Riker  
**Date**: 2026-04-19  
**Source Inputs**: Wesley design, Geordi corrections, Worf corrections, Data corrections  
**Status**: FINAL - implementation ready, no approval gates pending

---

## Scope

This spec reconciles the following work into one implementation pass:

- GEORDI-018: explicit tactical handling for disarmed alarm state
- GEORDI-019: larger alarm keypad targets and corrected spacing
- WESLEY-UX-009: garage door contextual state and action labels
- WESLEY-UX-011 and WESLEY-IDEA-010: tactical dedupe across rooms with room-header alarm badge
- WESLEY-UX-013: inline confirm strip for risky tactical actions
- WESLEY-IDEA-006: garage door position indicator
- WORF-SEC-003: alarm lockout countdown message and keypad disablement

This document supersedes the earlier Wesley-only draft. Where review comments disagreed with the draft, the review corrections win.

---

## Final Reconciled Decisions

### 1. Tactical frame color uses the canonical alarm color resolver

Decision:

- `lcars-tactical-panel.js` must import and use `getAlarmStateColor()` for any alarm-backed frame color decision.
- Tactical keeps the existing outer control flow: if an alarm entity exists, use alarm state color; otherwise fall back to access breach detection.
- Triggered state resolves to `var(--lcars-alert)`, not `var(--lcars-tomato)`, because the canonical resolver already defines the system-wide alarm semantic.
- If anyone keeps an inline branch instead of delegating to the resolver, `triggered` must be checked before `disarmed`. That is no longer the preferred implementation.

Result:

- GEORDI-018 is satisfied.
- Geordi's `triggered before disarmed` ordering concern is satisfied by delegation.
- Data's `getAlarmStateColor` import and `--lcars-alert` verification are satisfied.

### 2. Alarm keypad sizing is standardized in both alarm implementations

Decision:

- Increase keypad button width and height to `4rem`.
- Use keypad gap `0.5rem` on desktop and `0.75rem` on mobile.
- Increase code dots to `14px`.
- Apply the same sizing updates to both the extracted alarm panel and the legacy homepage alarm rendering so the UI does not diverge.

Result:

- Wesley's larger keypad intent is preserved.
- Geordi's grid-multiple spacing correction wins over the earlier `0.75rem everywhere` draft.
- Data's recommendation to sync homepage-card keypad sizing is adopted.

### 3. Garage door access rows become contextual action rows

Decision:

- For garage-door-like covers in the tactical panel:
  - `closed` shows `TAP TO OPEN`
  - `open` shows `TAP TO CLOSE`
  - `opening` shows `OPENING...`
  - `closing` shows `CLOSING...`
- Transitional states are non-interactive.
- Action hint typography uses `var(--lcars-font-size-data)`.
- Use one de-emphasis method only: reduced opacity. Do not combine smaller text plus opacity.

Result:

- Wesley's contextual labeling ships.
- Geordi's type and de-emphasis corrections are incorporated.

### 4. Risky tactical actions use one inline confirm strip pattern

Decision:

- Confirm strip applies to:
  - lock unlock action
  - garage door open action
  - garage door close action
- Only one confirm strip may be active at a time.
- Confirm timeout is `5000ms` minimum.
- Confirm strip uses `role="alert"`, not `alertdialog`.
- Add reduced-motion handling for both strip reveal and countdown animation.
- Tactical `disconnectedCallback()` must call `_cancelConfirm()`.
- No alarm-panel disarm confirm is added for no-code disarm; this remains tactical-only.

Result:

- Worf's crush-risk correction changes close-cover from immediate to confirmed.
- Geordi and Worf agree on `role="alert"`; that wins.
- Data's `disconnectedCallback` and `do not add no-code alarm disarm confirm` corrections are incorporated.

### 5. Garage door position indicator is added with Geordi's sizing corrections

Decision:

- Add a vertical position bar for covers that expose `current_position`.
- Minimum width is `8px`.
- Percentage label uses `var(--lcars-font-size-data)`.
- Fill animates bottom-up.
- State coloring follows the same access-row state color: sunflower when closed, alert/tomato-family breach color when open, gold when transitional.

Result:

- Wesley's position indicator ships.
- Geordi's width and typography corrections win over the earlier narrower bar.

### 6. Tactical dedupe is device-based, with proper primary-area fallback

Decision:

- Tactical panel dedupe is implemented in `lcars-homepage-card.js` by tracking rendered alarm device IDs per render pass.
- Primary/secondary determination must use `_findAlarmPrimaryArea(deviceId)`.
- `_findAlarmPrimaryArea(deviceId)` must:
  - read from `this.hass.entities`
  - iterate with `Object.entries(...)`
  - find entities bound to the same `device_id`
  - fall back to the device's own `area_id` when the entity `area_id` is null
- Do not add `isAlarmNativeToArea()`.

Result:

- Wesley's dedupe intent ships.
- Worf's device-area fallback requirement is incorporated.
- Data's implementation constraints for `_findAlarmPrimaryArea()` are incorporated.

### 7. Secondary-room badge uses navigation semantics, not button semantics

Decision:

- Secondary rooms render a room-header alarm badge that navigates to the primary alarm room.
- The badge uses link semantics, not generic button semantics.
- Activation is Enter-only. Do not wire Space activation for the badge.
- Badge label uses alarm state text resolved from the canonical alarm color/state mapping.

Result:

- Wesley's badge concept ships.
- Geordi's `role="link"` keyboard correction wins over the earlier Enter-or-Space draft.

### 8. Alarm lockout feedback becomes explicit and non-spammy

Decision:

- When the rate limiter blocks disarm attempts:
  - keypad buttons are disabled immediately
  - a one-shot lockout alert is announced once
  - a visible countdown continues silently
- Split rendering into two pieces:
  - one `role="alert"` element for the initial lockout announcement
  - one countdown element with `aria-live="off"`
- Do not add redundant `aria-live="assertive"` to the alert element.
- Add `_alarmLockoutTimer` cleanup in alarm panel `disconnectedCallback()`.
- Apply the same lockout behavior to the legacy homepage alarm path while it still exists.

Result:

- Worf's keypad-disable and split-announcement requirements are satisfied.
- Geordi's ARIA cleanup is satisfied.
- Data's timer-cleanup requirement is satisfied.

---

## Conflict Resolution

### Resolved conflicts

1. Triggered alarm color: Wesley draft used `--lcars-tomato`; Data required verification against `--lcars-alert`.
Decision: use `getAlarmStateColor()` and keep `triggered -> var(--lcars-alert)`.

2. Confirmed garage door actions: Wesley draft only confirmed open; Worf required confirm on close as well.
Decision: both open and close require confirmation.

3. Confirm strip semantics: Wesley draft used `alertdialog`; Geordi and Worf both required `role="alert"`.
Decision: `role="alert"`.

4. Confirm timeout: earlier draft mentioned shorter behavior; Geordi required 5-second minimum.
Decision: fixed `5000ms` minimum.

5. Badge keyboard behavior: Wesley draft used Enter and Space; Geordi required link semantics with Enter-only.
Decision: link semantics, Enter-only activation.

6. Garage position bar dimensions: Wesley draft used `6px`; Geordi required `8px` minimum.
Decision: `8px` minimum.

7. Lockout announcement: Wesley draft used `role="alert"` plus `aria-live="assertive"`; Geordi and Worf required split alert plus silent countdown.
Decision: one-shot `role="alert"`, separate countdown with `aria-live="off"`.

### No remaining blocking conflicts

There are no unresolved reviewer conflicts after these decisions. Data item 7 was a recommendation rather than a contradiction; it is adopted.

---

## Exact Change Set By File

### 1. custom_components/lcars_dashboard/js/src/panels/tactical/lcars-tactical-panel.js

Make these changes in one pass:

- Import `getAlarmStateColor` from `../../lcars-color-utils.js`.
- Replace the tactical `frameColor` inline switch with canonical alarm color delegation.
- Add confirm state and helpers:
  - `_pendingConfirm`
  - `_requestConfirm()`
  - `_executeConfirm()`
  - `_cancelConfirm()`
- Add `disconnectedCallback()` that calls `super.disconnectedCallback()` and `_cancelConfirm()`.
- Update `_renderAccessSection()` to:
  - resolve cover action labels by current state
  - disable interaction during `opening` and `closing`
  - render confirm strip inline when the row is pending confirmation
  - require confirm for unlock, cover open, and cover close
  - add garage position bar and percentage label when `current_position` exists
  - use `var(--lcars-font-size-data)` for action hints and position text
- Add or update `_toggleCover()` so it routes both open and close through the confirm flow.

### 2. custom_components/lcars_dashboard/js/src/panels/tactical/lcars-tactical-panel-styles.js

Make these styling changes:

- Add non-interactive transitional row styling for `opening` and `closing`.
- Add confirm strip styling with:
  - `role="alert"` compatible presentation
  - 5-second drain bar
  - reduced-motion fallback for reveal and drain animations
- Add cover position bar styles:
  - minimum width `8px`
  - bottom-up fill
  - percentage label size using `var(--lcars-font-size-data)`
- Ensure action hint styling uses one de-emphasis technique only.

### 3. custom_components/lcars_dashboard/js/src/panels/alarm/lcars-alarm-panel.js

Make these behavior changes:

- Add lockout state fields:
  - `_alarmLockoutMessage`
  - `_alarmLockoutAnnounce`
  - `_alarmLockoutTimer`
- When rate limited:
  - disable keypad buttons
  - start countdown updates
  - render one-shot alert text once
  - render silent visible countdown separately
- Ensure successful timer expiry clears message, announce text, error state, and disabled state.
- Add `_alarmLockoutTimer` cleanup in `disconnectedCallback()`.
- Do not add tactical confirm behavior to alarm disarm.

### 4. custom_components/lcars_dashboard/js/src/panels/alarm/lcars-alarm-panel-styles.js

Make these styling changes:

- Resize keypad buttons to `4rem`.
- Set keypad gap to `0.5rem` desktop and `0.75rem` mobile.
- Increase code dots to `14px`.
- Add disabled keypad styling during lockout.
- Add lockout message and silent countdown styles.
- Add reduced-motion-safe styling if any countdown animation remains.

### 5. custom_components/lcars_dashboard/js/src/lcars-homepage-card.js

Make these changes because the legacy alarm path still exists:

- Sync alarm keypad sizing with the extracted alarm panel.
- Sync alarm lockout behavior with the extracted alarm panel:
  - disable keypad during lockout
  - one-shot alert plus silent countdown
- Add tactical dedupe tracking per render pass using `_renderedAlarmDeviceIds`.
- Implement `_findAlarmPrimaryArea(deviceId)` using `this.hass.entities`, `Object.entries`, and device-area fallback.
- Remove tactical panel rendering for secondary alarm rooms.
- Render secondary-room alarm badge with link semantics and Enter-only activation.

### 6. custom_components/lcars_dashboard/js/src/lcars-color-utils.js

No functional change is required.

- Leave `getAlarmStateColor()` as the canonical source of truth.
- Confirm `triggered` remains `var(--lcars-alert)`.

---

## Final Implementation Order

The order below is the definitive build sequence. Dependencies first, then the critical behavioral slice, then parity cleanup.

### Phase A - Tactical foundation

1. Update tactical frame color in `lcars-tactical-panel.js` to use `getAlarmStateColor()`.
2. Add tactical confirm state helpers and cleanup hook in `lcars-tactical-panel.js`.
3. Add tactical confirm strip and transitional-row styles in `lcars-tactical-panel-styles.js`.

### Phase B - Garage door tactical behavior

4. Update `_renderAccessSection()` in `lcars-tactical-panel.js` for contextual garage state/action labels.
5. Route garage open and close through the confirm flow in `lcars-tactical-panel.js`.
6. Add garage position indicator markup in `lcars-tactical-panel.js`.
7. Add garage position indicator styles in `lcars-tactical-panel-styles.js`.

### Phase C - Alarm keypad safety

8. Update `lcars-alarm-panel-styles.js` for 4rem keypad sizing, corrected gap rules, larger dots, and disabled state.
9. Update `lcars-alarm-panel.js` for lockout state, one-shot alert, silent countdown, keypad disablement, and timer cleanup.

### Phase D - Legacy homepage parity and tactical dedupe

10. Sync keypad sizing and lockout behavior in `lcars-homepage-card.js` with the extracted alarm panel.
11. Add `_renderedAlarmDeviceIds` render-pass tracking in `lcars-homepage-card.js`.
12. Implement `_findAlarmPrimaryArea(deviceId)` in `lcars-homepage-card.js` with `this.hass.entities` plus device-area fallback.
13. Suppress duplicate tactical panel rendering for secondary rooms in `lcars-homepage-card.js`.
14. Add room-header alarm badge rendering and link-semantic keyboard handling in `lcars-homepage-card.js`.

### Phase E - Validation order

15. Verify tactical confirm behavior for unlock, cover open, and cover close.
16. Verify garage transitional rows are non-interactive.
17. Verify garage position bar width, fill direction, and typography.
18. Verify keypad desktop/mobile spacing in both alarm render paths.
19. Verify lockout announces once, disables keypad, and resumes input after expiry.
20. Verify only one tactical panel renders per alarm device across duplicated rooms and that badge navigation lands on the primary room.

---

## Definitive Implementation Checklist

- [ ] `lcars-tactical-panel.js`: import `getAlarmStateColor`
- [ ] `lcars-tactical-panel.js`: replace inline `frameColor` alarm switch with canonical resolver
- [ ] `lcars-tactical-panel.js`: add `_pendingConfirm`, `_requestConfirm`, `_executeConfirm`, `_cancelConfirm`
- [ ] `lcars-tactical-panel.js`: add `disconnectedCallback()` confirm cleanup
- [ ] `lcars-tactical-panel.js`: render contextual garage labels for `closed`, `open`, `opening`, `closing`
- [ ] `lcars-tactical-panel.js`: disable interaction for transitional garage states
- [ ] `lcars-tactical-panel.js`: require confirm for unlock
- [ ] `lcars-tactical-panel.js`: require confirm for garage open
- [ ] `lcars-tactical-panel.js`: require confirm for garage close
- [ ] `lcars-tactical-panel.js`: render inline confirm strip with `role="alert"`
- [ ] `lcars-tactical-panel.js`: keep only one active confirm strip at a time
- [ ] `lcars-tactical-panel.js`: render garage position bar and percentage label when `current_position` exists
- [ ] `lcars-tactical-panel-styles.js`: style transitional rows as non-interactive
- [ ] `lcars-tactical-panel-styles.js`: style confirm strip with reduced-motion fallback
- [ ] `lcars-tactical-panel-styles.js`: style `8px` garage position bar with bottom-up fill
- [ ] `lcars-tactical-panel-styles.js`: use single de-emphasis method for action hints
- [ ] `lcars-alarm-panel-styles.js`: set keypad buttons to `4rem`
- [ ] `lcars-alarm-panel-styles.js`: set keypad gap to `0.5rem` desktop and `0.75rem` mobile
- [ ] `lcars-alarm-panel-styles.js`: enlarge code dots to `14px`
- [ ] `lcars-alarm-panel-styles.js`: add disabled keypad styling for lockout
- [ ] `lcars-alarm-panel.js`: add lockout state fields and countdown timer handling
- [ ] `lcars-alarm-panel.js`: disable keypad buttons during lockout
- [ ] `lcars-alarm-panel.js`: split lockout rendering into one-shot alert plus silent countdown
- [ ] `lcars-alarm-panel.js`: clear `_alarmLockoutTimer` in `disconnectedCallback()`
- [ ] `lcars-homepage-card.js`: sync legacy alarm keypad sizing
- [ ] `lcars-homepage-card.js`: sync legacy alarm lockout disablement and messaging
- [ ] `lcars-homepage-card.js`: add `_renderedAlarmDeviceIds` tracking
- [ ] `lcars-homepage-card.js`: implement `_findAlarmPrimaryArea(deviceId)` using `this.hass.entities`
- [ ] `lcars-homepage-card.js`: fall back to device `area_id` when entity `area_id` is null
- [ ] `lcars-homepage-card.js`: do not add `isAlarmNativeToArea()`
- [ ] `lcars-homepage-card.js`: suppress duplicate tactical panel rendering in secondary rooms
- [ ] `lcars-homepage-card.js`: render room-header alarm badge with link semantics
- [ ] `lcars-homepage-card.js`: badge activation is Enter-only, not Space
- [ ] `lcars-color-utils.js`: leave canonical alarm mapping unchanged and verify `triggered -> var(--lcars-alert)`
- [ ] Validate tactical behaviors manually or with targeted checks after each slice

---

## Out Of Scope

- Adding `isAlarmNativeToArea()`
- Adding no-code alarm disarm confirm to the alarm panel
- Changing canonical alarm color mappings in `lcars-color-utils.js`
- Introducing modal confirmation UI

Make it so.# P5: Tactical, Alarm, Garage Door & High-Impact Action Safety — Design Spec

**Author**: Wesley Crusher  
**Date**: 2026-04-19  
**Bugs**: GEORDI-018, GEORDI-019, WESLEY-UX-009, WESLEY-UX-011, WESLEY-UX-013, WESLEY-IDEA-006, WESLEY-IDEA-010, WORF-SEC-003

---

## 1. GEORDI-018 — Disarmed Alarm Ice Semantics

### Problem
`getAlarmStateColor('disarmed')` already returns `var(--lcars-ice)` in `lcars-color-utils.js:236`. But in `lcars-tactical-panel.js` `frameColor` getter, the `disarmed` state falls through to the default ice return only because no explicit case handles it — it relies on `_getAlarmEntry()` returning the entry and none of the `if` branches matching. This works, but **the frame color getter doesn't explicitly call `getAlarmStateColor()`** — it has its own inline switch that omits `disarmed`.

### Approach
Refactor `LcarsTacticalPanel.frameColor` to use the canonical `getAlarmStateColor()` function when an alarm entry exists, eliminating the duplicate inline switch.

### Code Changes

**`lcars-tactical-panel.js` — `get frameColor()`** (lines 48-60):

```js
// BEFORE — inline switch, disarmed falls to default
get frameColor() {
  const alarmEntry = this._getAlarmEntry();
  if (alarmEntry) {
    const state = alarmEntry.state?.state || '';
    if (state === 'triggered') return 'var(--lcars-tomato)';
    if (state === 'armed_away' || state === 'armed_vacation') return 'var(--lcars-butterscotch)';
    if (state === 'armed_home' || state === 'armed_night') return 'var(--lcars-sunflower)';
    if (state === 'arming' || state === 'pending') return 'var(--lcars-gold)';
  }
  const accessEntries = this._getAccessEntries();
  const hasBreach = accessEntries.some(e => {
    if (e.domain === 'lock') return e.state?.state !== 'locked';
    return e.state?.state === 'open';
  });
  return hasBreach ? 'var(--lcars-butterscotch)' : 'var(--lcars-ice)';
}

// AFTER — delegate to canonical color function
get frameColor() {
  const alarmEntry = this._getAlarmEntry();
  if (alarmEntry) {
    return getAlarmStateColor(alarmEntry.state?.state || 'unavailable');
  }
  const accessEntries = this._getAccessEntries();
  const hasBreach = accessEntries.some(e => {
    if (e.domain === 'lock') return e.state?.state !== 'locked';
    return e.state?.state === 'open';
  });
  return hasBreach ? 'var(--lcars-butterscotch)' : 'var(--lcars-ice)';
}
```

**Import**: `getAlarmStateColor` is already imported in tactical panel (via alarm panel composition), but verify it's imported in the tactical panel file. If not, add:
```js
import { getAlarmStateColor } from '../../lcars-color-utils.js';
```

### Edge Cases
- `disarmed` → ice ✓ (explicit from `getAlarmStateColor`)
- `armed_custom_bypass` → african-violet (was missing from inline switch — now fixed)
- `unavailable` / `unknown` → disabled (was falling through to breach check — now correct)

---

## 2. GEORDI-019 — Increase Alarm Keypad Spacing

### Problem
`.alarm-digit-grid` uses `grid-template-columns: repeat(3, 3.5rem)` with button height `3.5rem`. On mobile, 3.5rem ≈ 56px which meets the 48px minimum tap target, but the buttons are cramped with only `var(--lcars-gap)` (typically 0.5rem / 8px) between them.

### Approach
1. Increase button size to `4rem` (64px) — comfortable touch target
2. Increase grid gap to `0.75rem` (12px) — breathing room between digits
3. On mobile (`max-width: 30rem`), keep same sizes but ensure grid stays centered
4. Match action buttons (⌫ and ⏎) to the same increased dimensions

### Code Changes

**`lcars-alarm-panel-styles.js`** — keypad grid and button rules:

```css
/* BEFORE */
.alarm-digit-grid { display: grid; grid-template-columns: repeat(3, 3.5rem); gap: var(--lcars-gap); }
.alarm-digit-btn { height: 3.5rem; /* ... */ }

/* AFTER */
.alarm-digit-grid { display: grid; grid-template-columns: repeat(3, 4rem); gap: 0.75rem; }
.alarm-digit-btn { height: 4rem; /* ... */ font-size: 1.375rem; }
```

**Also update the code dot size** for visual proportion:
```css
/* BEFORE */
.alarm-code-dot { width: 12px; height: 12px; /* ... */ }

/* AFTER */
.alarm-code-dot { width: 14px; height: 14px; /* ... */ }
```

### Visual Design
- Button: 4rem × 4rem (64px), sunflower fill, black text, 1.375rem font
- Gap: 0.75rem between buttons (12px)
- Code dots: 14px diameter, proportional to larger keypad
- Total keypad width: 3 × 4rem + 2 × 0.75rem = 13.5rem (216px) — fits comfortably in single column on mobile
- The overall footprint grows by ~18px per axis — acceptable for improved touch usability

### Edge Cases
- No responsive breakpoint change needed — the larger keypad still fits within the `min-width` of the grid column at `max-width: 30rem`
- The pin-error shake animation distance unchanged (6px/4px) — still proportional

---

## 3. WESLEY-UX-009 — Garage Door Contextual Action Labels

### Problem
Garage doors in `_renderAccessSection()` show raw HA states (`OPEN`, `CLOSED`, `OPENING`, `CLOSING`) and the click handler just fires `showMoreInfo(eid)`. Users need to know what tapping will *do*, and transitional states should block action.

### Approach
Add a cover-aware state/action resolver inside `_renderAccessSection()`. For covers:
- `closed` → show "TAP TO OPEN" in sunflower (secure = closed)
- `open` → show "TAP TO CLOSE" in tomato (breach = open)
- `opening` / `closing` → show "OPENING…" / "CLOSING…" with disabled styling, no click action
- Click calls `cover.open_cover` / `cover.close_cover` directly instead of `showMoreInfo`

### Code Changes

**`lcars-tactical-panel.js` — `_renderAccessSection()`**:

```js
_renderAccessSection(accessEntries) {
  return html`
    <div class="tactical-access" role="list" aria-label="Access points">
      <div class="tactical-section-label">ACCESS POINTS</div>
      ${accessEntries.map(entry => {
        const eid = entry.entity?.entity_id || '';
        const name = entry.state?.attributes?.friendly_name || eid;
        const isLock = entry.domain === 'lock';
        const isCover = entry.domain === 'cover';
        const rawState = entry.state?.state || '';

        let isSecure, stateText, indicatorColor, isTransitional = false;

        if (isLock) {
          isSecure = rawState === 'locked';
          stateText = isSecure ? 'LOCKED' : 'UNLOCKED';
          indicatorColor = isSecure ? 'var(--lcars-sunflower)' : 'var(--lcars-tomato)';
        } else if (isCover) {
          isTransitional = rawState === 'opening' || rawState === 'closing';
          isSecure = rawState === 'closed';
          if (isTransitional) {
            stateText = rawState === 'opening' ? 'OPENING\u2026' : 'CLOSING\u2026';
            indicatorColor = 'var(--lcars-gold)';
          } else if (rawState === 'open') {
            stateText = 'TAP TO CLOSE';
            indicatorColor = 'var(--lcars-tomato)';
          } else {
            stateText = 'TAP TO OPEN';
            indicatorColor = 'var(--lcars-sunflower)';
          }
        } else {
          isSecure = rawState === 'closed' || rawState === 'locked';
          stateText = rawState.toUpperCase();
          indicatorColor = isSecure ? 'var(--lcars-sunflower)' : 'var(--lcars-tomato)';
        }

        const handleClick = () => {
          if (isLock) this._toggleLock(eid, rawState === 'locked');
          else if (isCover && !isTransitional) this._toggleCover(eid, rawState);
          else if (!isTransitional) showMoreInfo(eid);
        };

        return html`
          <div class="tactical-access-row"
               role="listitem"
               tabindex="0"
               aria-label="${name}: ${stateText}"
               ?data-secure=${isSecure}
               ?data-breach=${!isSecure && !isTransitional}
               ?data-transitional=${isTransitional}
               @click=${handleClick}
               @keydown=${(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), handleClick())}>
            <span class="tactical-access-indicator" style="background:${indicatorColor}"></span>
            <span class="tactical-access-name">${name}</span>
            <span class="tactical-access-state">${stateText}</span>
          </div>
        `;
      })}
    </div>
  `;
}
```

**New method `_toggleCover()`**:
```js
_toggleCover(entityId, currentState) {
  const service = currentState === 'open' ? 'close_cover' : 'open_cover';
  this._callService('cover', service, { entity_id: entityId });
}
```

**`lcars-tactical-panel-styles.js`** — transitional state styling:
```css
.tactical-access-row[data-transitional] {
  background: var(--lcars-gold);
  color: var(--lcars-black);
  opacity: 0.7;
  cursor: default;
  pointer-events: none;
}
```

### Edge Cases
- `opening`/`closing` — pointer-events disabled, no accidental double-tap
- Unknown state (e.g., `unavailable`) — falls to else branch, shows raw state, click → showMoreInfo
- Covers without `device_class` (rare) — still handled as generic

---

## 4. WESLEY-UX-011 + WESLEY-IDEA-010 — Deduplicate Tactical Panel Across Rooms / Room-Header Alarm Badge

> These two bugs are the same solution. UX-011 asks for dedup, IDEA-010 specifies the badge UI.

### Problem
When the same alarm device (e.g., SimpliSafe) is assigned to HA areas "Great Room" and "Bedroom", both rooms get a full Tactical panel. Only one room should render the full panel; others get a compact badge.

### Approach

**Phase 1: Detect primary vs. secondary alarm rooms**

The homepage card's `_renderAreaContent()` already calls `classifyArea()` which checks `isTacticalEntity` on ALL entities in the area. We need to identify which room is the "primary" for each alarm device and suppress the full Tactical panel in secondary rooms.

Strategy:
1. In `_renderAreaContent()`, before building area panels, check if any alarm entity in this area has already been rendered in a "primary" room.
2. Track rendered alarm device IDs in a `Set` on the card instance: `_renderedAlarmDeviceIds = new Set()`.
3. For each area with tactical entities:
   - Extract the alarm_control_panel entity's device_id
   - If device_id already in `_renderedAlarmDeviceIds` → this is a **secondary room** → suppress Tactical panel type from `areaPanelTypes`, inject badge into header instead
   - If not → this is the **primary room** → add device_id to set, render full Tactical

**Phase 2: Room-header alarm badge**

For secondary rooms, inject a badge after the `<h2>` / `<h3>` header:

```html
<div class="room-header-badges">
  <button class="room-alarm-badge" 
    style="--badge-color: ${alarmColor}"
    @click=${() => this._navigateToAlarmRoom(primaryAreaId)}>
    <span class="badge-shield">◆</span>
    <span class="badge-label">${alarmStateLabel}</span>
  </button>
</div>
```

### Code Changes

**`lcars-homepage-card.js`** — instance property:
```js
_renderedAlarmDeviceIds = new Set();
```

**Reset in render cycle** (in `render()` or `_renderFloorView()`):
```js
// At start of each full render cycle
this._renderedAlarmDeviceIds = new Set();
```

**In `_renderAreaContent()`** — after `classifyArea()`, before building areaPanels:
```js
// Dedup: check if alarm device already rendered in another area
let secondaryAlarmBadge = '';
if (areaPanelTypes.has(PANEL_TYPE_TACTICAL)) {
  const alarmEntries = hydratedEntries.filter(e => ALARM_DOMAINS.has(e.domain));
  const alarmDeviceId = alarmEntries[0]?.entity?.device_id;
  if (alarmDeviceId && this._renderedAlarmDeviceIds.has(alarmDeviceId)) {
    // Secondary room — remove tactical, build badge instead
    areaPanelTypes.delete(PANEL_TYPE_TACTICAL);
    const alarmState = alarmEntries[0]?.state?.state || 'unavailable';
    const alarmColor = getAlarmStateColor(alarmState);
    const label = (alarmState || 'unknown').toUpperCase().replace(/_/g, ' ');
    // Find primary room name for this alarm device
    const primaryAreaId = this._findAlarmPrimaryArea(alarmDeviceId);
    secondaryAlarmBadge = html`
      <div class="room-header-badges">
        <button class="room-alarm-badge"
          style="--badge-color:${alarmColor}"
          aria-label="Alarm: ${label}. Tap to view."
          @click=${() => { this.selectedArea = primaryAreaId; this.selectedFloor = null; }}
          @keydown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.selectedArea = primaryAreaId; this.selectedFloor = null; } }}>
          <span class="badge-shield">◆</span>
          <span class="badge-label">${label}</span>
        </button>
      </div>
    `;
  } else if (alarmDeviceId) {
    this._renderedAlarmDeviceIds.add(alarmDeviceId);
  }
}
```

**New helper method**:
```js
_findAlarmPrimaryArea(deviceId) {
  // Return the first area ID that owns this alarm device
  const entities = Object.values(this._hass.entities || {});
  for (const e of entities) {
    if (e.device_id === deviceId && e.entity_id.startsWith('alarm_control_panel.')) {
      return e.area_id || null;
    }
  }
  return null;
}
```

**Return `secondaryAlarmBadge`** from `_renderAreaContent()` — this needs to be placed adjacent to the area header. Since the header is rendered *outside* `_renderAreaContent()`, we have two options:

**Option A (recommended)**: Return a tuple `{ badge, content }` from `_renderAreaContent` and render badge after the `<h2>`/`<h3>`.

**Option B (simpler)**: Render the badge as the first child *inside* `_renderAreaContent()`'s return value.

I recommend **Option B** for minimal refactoring:
```js
// At the end of _renderAreaContent(), before the return:
return html`
  ${secondaryAlarmBadge}
  ${ilmPanel ? html`<div class="area-illumination-full">...</div>` : ''}
  ...
`;
```

### Badge Visual Design (CSS)

```css
.room-header-badges {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.room-alarm-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.75rem;
  border: 2px solid var(--badge-color, var(--lcars-ice));
  border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
  background: transparent;
  color: var(--badge-color, var(--lcars-ice));
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  text-transform: uppercase;
  cursor: pointer;
  transition: background var(--lcars-transition), color var(--lcars-transition);
}

.room-alarm-badge:hover {
  background: var(--badge-color, var(--lcars-ice));
  color: var(--lcars-black);
}

.room-alarm-badge:focus-visible {
  outline: 2px solid var(--lcars-ice);
  outline-offset: 2px;
}

.badge-shield {
  font-size: 0.875rem;
}

.badge-label {
  font-weight: 700;
  letter-spacing: 0.08em;
}
```

**Badge appearance by state**:
| State | Color | Label | Shield |
|-------|-------|-------|--------|
| disarmed | ice | DISARMED | ◆ |
| armed_home | sunflower | ARMED HOME | ◆ |
| armed_away | butterscotch | ARMED AWAY | ◆ |
| triggered | tomato/alert | ⚠ TRIGGERED | ◆ |

### Edge Cases
- **Floor view**: `_renderedAlarmDeviceIds` reset at start of `_renderFloorView()` — first area in floor order wins as primary
- **Single-area alarm**: No secondary rooms → no badge, full panel as before
- **No alarm entity in area** (only locks/sensors): No dedup needed — each room gets its own access/perimeter section
- **User navigates directly to secondary area** (not via floor view): The badge tap navigates to the primary area — `this.selectedArea = primaryAreaId`
- **Alarm device without device_id**: Skip dedup, render full panel (conservative)

### Geordi Review Flag
The badge visual (◆ diamond + outlined pill) introduces a new component type. Geordi should confirm it fits LCARS language.

---

## 5. WESLEY-UX-013 — Confirm/Undo Flows for Risky Actions

### Problem
`_toggleLock()` and cover actions execute immediately. For high-risk actions (unlock, garage door open, alarm disarm), users need a chance to cancel.

### Approach: Inline Confirm Strip (No Modal)

Modals are problematic in lit-element 2.5.1 (no native dialog, no top-layer). Instead, use an **inline confirm strip** — the row itself transforms into a confirmation prompt with a timeout auto-cancel.

**Pattern**:
1. User taps "UNLOCKED" (to lock) → immediate action (safe direction)
2. User taps "LOCKED" (to unlock) → row transforms to confirm strip
3. Confirm strip: `[UNLOCK? ████████ CANCEL]` — fill bar counts down 5s
4. Tap confirm → execute. Tap cancel or timeout → revert row.

This is the same pattern as `alarm-countdown` already in the alarm panel — users already understand the "countdown + action" paradigm.

### Implementation

**State tracking** — add to `LcarsTacticalPanel`:
```js
_pendingConfirm = null; // { entityId, action, service, domain, timer, startTime }
```

**Confirm flow methods**:
```js
_requestConfirm(entityId, action, domain, service, data = {}) {
  // Cancel any existing pending confirm
  this._cancelConfirm();
  
  const CONFIRM_TIMEOUT = 5000;
  const timer = setTimeout(() => {
    this._pendingConfirm = null;
    this.requestUpdate();
  }, CONFIRM_TIMEOUT);

  this._pendingConfirm = {
    entityId,
    action,    // 'UNLOCK' / 'OPEN GARAGE' / etc.
    domain,
    service,
    data,
    timer,
    startTime: Date.now(),
    timeout: CONFIRM_TIMEOUT,
  };
  this.requestUpdate();
}

_executeConfirm() {
  if (!this._pendingConfirm) return;
  const { domain, service, data, entityId } = this._pendingConfirm;
  this._callService(domain, service, { entity_id: entityId, ...data });
  this._cancelConfirm();
}

_cancelConfirm() {
  if (this._pendingConfirm?.timer) {
    clearTimeout(this._pendingConfirm.timer);
  }
  this._pendingConfirm = null;
  this.requestUpdate();
}
```

**Modified `_toggleLock()`**:
```js
_toggleLock(entityId, isCurrentlyLocked) {
  if (isCurrentlyLocked) {
    // UNLOCK = risky → require confirmation
    this._requestConfirm(entityId, 'UNLOCK', 'lock', 'unlock');
  } else {
    // LOCK = safe → immediate
    this._callService('lock', 'lock', { entity_id: entityId });
  }
}
```

**Modified `_toggleCover()`** (from WESLEY-UX-009):
```js
_toggleCover(entityId, currentState) {
  if (currentState === 'closed') {
    // OPEN garage = risky → require confirmation
    this._requestConfirm(entityId, 'OPEN', 'cover', 'open_cover');
  } else {
    // CLOSE = safe → immediate
    this._callService('cover', 'close_cover', { entity_id: entityId });
  }
}
```

**Render in `_renderAccessSection()`** — when `_pendingConfirm.entityId === eid`, replace the normal row:
```js
// Inside the map, before the normal row render:
if (this._pendingConfirm?.entityId === eid) {
  return html`
    <div class="tactical-confirm-strip" role="alertdialog"
         aria-label="Confirm ${this._pendingConfirm.action}?">
      <button class="confirm-action-btn"
        @click=${() => this._executeConfirm()}
        @keydown=${(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), this._executeConfirm())}>
        ${this._pendingConfirm.action}?
      </button>
      <div class="confirm-countdown-bar">
        <div class="confirm-countdown-fill"></div>
      </div>
      <button class="confirm-cancel-btn"
        @click=${() => this._cancelConfirm()}
        @keydown=${(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), this._cancelConfirm())}>
        CANCEL
      </button>
    </div>
  `;
}
// ... normal row render follows
```

### CSS for Confirm Strip

```css
.tactical-confirm-strip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
  background: var(--lcars-tomato);
  color: var(--lcars-black);
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  text-transform: uppercase;
  min-height: var(--lcars-btn-height, 2rem);
  animation: confirm-slide-in 200ms ease-out;
}

@keyframes confirm-slide-in {
  from { opacity: 0; transform: scaleX(0.9); transform-origin: left; }
  to   { opacity: 1; transform: scaleX(1); }
}

.confirm-action-btn {
  border: none;
  background: var(--lcars-black);
  color: var(--lcars-tomato);
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  text-transform: uppercase;
  font-weight: 700;
  padding: 0.25rem 0.75rem;
  border-radius: var(--lcars-btn-radius);
  cursor: pointer;
}

.confirm-action-btn:focus-visible {
  outline: 2px solid var(--lcars-ice);
  outline-offset: 2px;
}

.confirm-countdown-bar {
  flex: 1;
  height: 4px;
  background: rgba(0,0,0,0.3);
  border-radius: 2px;
  overflow: hidden;
}

.confirm-countdown-fill {
  height: 100%;
  background: var(--lcars-black);
  border-radius: 2px;
  animation: confirm-drain 5s linear forwards;
}

@keyframes confirm-drain {
  from { width: 100%; }
  to   { width: 0%; }
}

.confirm-cancel-btn {
  border: none;
  background: transparent;
  color: var(--lcars-black);
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  text-transform: uppercase;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  opacity: 0.8;
}

.confirm-cancel-btn:hover { opacity: 1; }
.confirm-cancel-btn:focus-visible {
  outline: 2px solid var(--lcars-ice);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .tactical-confirm-strip { animation: none; }
  .confirm-countdown-fill { animation: none; width: 50%; }
}
```

### Alarm Disarm Confirmation
Alarm disarm already has a PIN code as its confirmation mechanism — no additional confirm needed. However, if `code_required === false` (rare but possible), the disarm button should use the same confirm strip pattern. Add to `_handleAlarmDisarm()`:
```js
// In alarm panel, if no code required:
if (!codeRequired) {
  this._requestConfirm(entityId, 'DISARM', 'alarm_control_panel', 'alarm_disarm');
}
```

### Edge Cases
- **Only one pending confirm at a time** — tapping another row cancels the first
- **Component disconnect** — `disconnectedCallback()` should call `_cancelConfirm()` to clear the timer
- **Rapid double-tap** — first tap shows confirm, second tap on the confirm button executes (two-tap minimum)
- **Reduced motion** — countdown bar static at 50%, strip has no animation, relies on timeout text

### Worf Review Flag
The 5-second timeout and confirm pattern should be reviewed by Worf. Consider: should the timeout be configurable? Should unlock require PIN re-entry instead of a timer?

---

## 6. WESLEY-IDEA-006 — Visual Garage Door Position Indicator

### Problem
Garage doors with `current_position` attribute (0–100) only show text state. Users with tilt/position-aware openers (MyQ, Ratgdo, etc.) want a visual indicator.

### Approach
Add a **vertical fill bar** next to the cover name in the access row. The bar height represents position (0% = closed, 100% = open). Color tracks state: sunflower when closed, tomato when open, gold when transitioning.

### Design

```
┌────────────────────────────────────────┐
│ ● ▐██▌ Garage Door     TAP TO CLOSE   │  ← open (fill = 100%, tomato)
│ ● ▐█ ▌ Garage Door     OPENING…       │  ← transitioning (fill = 45%, gold)
│ ● ▐  ▌ Garage Door     TAP TO OPEN    │  ← closed (fill = 0%, sunflower)
└────────────────────────────────────────┘
```

### Code Changes

In `_renderAccessSection()`, after determining cover state, check for position:

```js
const hasPosition = isCover && entry.state?.attributes?.current_position != null;
const position = hasPosition ? Number(entry.state.attributes.current_position) : null;
```

Insert position bar in the access row template (between indicator and name):
```js
${hasPosition ? html`
  <span class="cover-position-bar" aria-label="Position: ${position}%"
    title="${position}% open">
    <span class="cover-position-fill"
      style="height:${position}%; background:${indicatorColor}"></span>
  </span>
` : ''}
```

### CSS

```css
.cover-position-bar {
  width: 6px;
  height: 1.25rem;
  background: rgba(255,255,255,0.1);
  border-radius: 2px;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.cover-position-fill {
  width: 100%;
  border-radius: 2px;
  transition: height 600ms ease-out;
}
```

### Edge Cases
- **No `current_position` attribute** — bar not rendered, text-only as before
- **Position = 0** — fill height 0%, bar outline still visible (background track)
- **Position = 100** — full fill, clearly open
- **Intermediate positions** (tilt garage doors) — proportional fill
- **Transition animation** — CSS `transition: height 600ms` provides smooth movement during opening/closing

---

## 7. WORF-SEC-003 — Rate Limit Lockout Message

### Problem
`_alarmPinLimiter.allow()` returns false after 3 attempts in 60 seconds. The code sets `_alarmPinError = true`, which turns dots red and shakes them, but displays **no message** explaining why input is blocked or when to retry.

### Approach
1. Add a `_alarmLockoutMessage` string property
2. When rate limited, compute time remaining and show: `"LOCKED OUT · RETRY IN 45s"`
3. Update the message every second while locked out (reuse the countdown pattern)
4. Render the message below the pin dots

### Code Changes

**`lcars-alarm-panel.js`** — new properties:
```js
_alarmLockoutMessage = '';
_alarmLockoutTimer = null;
```

**Modified `_handleAlarmDisarm()`**:
```js
_handleAlarmDisarm(entityId) {
  if (!this._alarmPinLimiter.allow()) {
    this._alarmPinError = true;
    this._startLockoutCountdown();
    this.requestUpdate();
    return;
  }
  // ... existing disarm logic
}

_startLockoutCountdown() {
  if (this._alarmLockoutTimer) clearInterval(this._alarmLockoutTimer);
  
  const update = () => {
    const resetTime = this._alarmPinLimiter.resetTime();
    if (resetTime === 0) {
      this._alarmLockoutMessage = '';
      this._alarmPinError = false;
      if (this._alarmLockoutTimer) clearInterval(this._alarmLockoutTimer);
      this._alarmLockoutTimer = null;
      this.requestUpdate();
      return;
    }
    const remaining = Math.ceil((resetTime - Date.now()) / 1000);
    this._alarmLockoutMessage = `LOCKED OUT \u00B7 RETRY IN ${remaining}s`;
    this.requestUpdate();
  };

  update();
  this._alarmLockoutTimer = setInterval(update, 1000);
}
```

**Cleanup in `disconnectedCallback()`**:
```js
disconnectedCallback() {
  super.disconnectedCallback();
  this._stopAlarmCountdown();
  if (this._alarmLockoutTimer) clearInterval(this._alarmLockoutTimer);
}
```

**Render — below the pin dots, inside `.alarm-keypad`**:
```js
<div class="alarm-code-display ${this._alarmPinError ? 'alarm-pin-error' : ''}" role="status" aria-live="polite">
  ${pinDots.map(filled => html`
    <div class="alarm-code-dot" style="background:${filled ? (this._alarmPinError ? 'var(--lcars-tomato)' : stateColor) : 'var(--lcars-disabled)'}"></div>
  `)}
</div>
${this._alarmLockoutMessage ? html`
  <div class="alarm-lockout-msg" role="alert" aria-live="assertive">${this._alarmLockoutMessage}</div>
` : ''}
```

### CSS

```css
.alarm-lockout-msg {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-tomato);
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0.25rem 0;
  animation: alarm-lockout-pulse 2s ease-in-out infinite;
}

@keyframes alarm-lockout-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@media (prefers-reduced-motion: reduce) {
  .alarm-lockout-msg { animation: none; }
}
```

**Also apply same changes to lcars-homepage-card.js** alarm code (the legacy `_renderAlarmPanel()` method), since it has the same `_alarmPinLimiter` and `_alarmPinError` pattern.

### Edge Cases
- **Timer cleanup** — both `disconnectedCallback` and successful rate limit reset clear the interval
- **Rate limiter reset** — `resetTime()` returns 0 when window has elapsed → clears message + error state
- **Multiple rapid clicks** — lockout message updates with decreasing countdown each second
- **Screen reader** — `role="alert"` + `aria-live="assertive"` announces lockout immediately

### Worf Review Flag
The message text "LOCKED OUT · RETRY IN Xs" should be reviewed for appropriateness. Consider whether to mention the attempt limit (e.g., "3 ATTEMPTS EXCEEDED").

---

## Implementation Order

| Priority | Bug ID | Effort | Dependencies |
|----------|--------|--------|--------------|
| 1 | GEORDI-018 | XS | None — single getter refactor |
| 2 | GEORDI-019 | XS | None — CSS only |
| 3 | WORF-SEC-003 | S | None — alarm panel + homepage card |
| 4 | WESLEY-UX-009 | S | None — tactical panel |
| 5 | WESLEY-IDEA-006 | S | Depends on UX-009 (cover rendering) |
| 6 | WESLEY-UX-013 | M | Depends on UX-009 (cover toggle) |
| 7 | UX-011 + IDEA-010 | M | None — homepage card + styles |

Items 1–3 are independent and can be done in parallel. Items 4–6 chain together (cover rendering → position bar → confirm flow). Item 7 is independent but medium effort.

---

## Files Modified

| File | Bugs |
|------|------|
| `lcars-tactical-panel.js` | GEORDI-018, WESLEY-UX-009, WESLEY-UX-013, WESLEY-IDEA-006 |
| `lcars-tactical-panel-styles.js` | WESLEY-UX-009, WESLEY-UX-013, WESLEY-IDEA-006 |
| `lcars-alarm-panel.js` | WORF-SEC-003 |
| `lcars-alarm-panel-styles.js` | GEORDI-019, WORF-SEC-003 |
| `lcars-homepage-card.js` | WESLEY-UX-011, WESLEY-IDEA-010, WORF-SEC-003 (legacy alarm) |

---

## Team Review Flags

- **Geordi**: Badge visual (◆ diamond pill) for secondary alarm rooms — new component type needs LCARS language approval
- **Geordi**: Confirm strip color/animation — tomato background with black accent buttons
- **Worf**: Confirm timeout duration (5s) — is this sufficient or should it be configurable?
- **Worf**: Lockout message wording — "LOCKED OUT · RETRY IN Xs" vs more/less detail
- **Worf**: Should lock unlock require PIN instead of just confirm? (future enhancement)
