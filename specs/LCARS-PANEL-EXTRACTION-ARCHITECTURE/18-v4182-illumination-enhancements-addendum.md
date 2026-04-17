## v4.18.2 Addendum — Illumination & Irrigation Panel Enhancements

**Scope**: Illumination entity coverage fixes, stable sort, drag-and-drop reorder; Irrigation panel V2 full Rachio integration
**Status**: IMPLEMENTED — v4.18.2
**Date**: 2026-04-16

---

### B1. Layout Fix — Panel Column Position

The `_renderAreaContent()` method in `lcars-homepage-card.js` now renders `.area-split-panels` before `.area-split-main` in DOM order. Since the grid uses `1fr 1fr` without explicit column placement, DOM order controls left/right. Panels now render in the left column (correct), content in the right.

---

### B2. Entity Coverage — Infrastructure LED Exclusion

New predicate `isInfrastructureLED(entry)` in `lcars-entity-utils.js` filters out non-user-facing indicator LEDs that pollute the illumination panel.

**Excluded patterns**:
- **Platform**: UniFi (`unifi`)
- **Entity ID**: `led_indicator`, `status_led`, `status_panel`, `status_light`
- **Friendly name**: `/\bindicator\b|\bstatus\s*(led|light|panel)\b/i`

`isLightingEntity()` now gates on `!isInfrastructureLED(entry)` before any positive match.

---

### B3. Entity Coverage — Insteon Product Name Detection

`isLightingEntity()` entity ID regex expanded to match Insteon dimmer product names:

```
/switchlinc|lamplinc|togglelinc/
```

These Insteon dimmers register as `switch` domain via `switch_as_x` but have product names in their entity IDs.

---

### B4. Device-Level Dedup in Partition

`_partitionLightingEntities()` now performs two-pass device dedup:

1. **Group by `device_id`**: Entities sharing a device are collected together
2. **Select best representative**: Prefers `light` domain over `switch`, then picks highest-brightness entity

Prevents duplicate entries when multiple entities (e.g., `light.x` + `switch.x`) belong to the same physical device.

---

### B5. Stable Sort — No Position Jumps on Toggle

Removed on-state and brightness from the sort comparator. Previous behavior moved lights to the top when turned on, causing disorienting layout shifts.

**New sort order**: Custom user order (localStorage) → alphabetical fallback.

---

### B6. Drag-and-Drop Reorder (Edit Mode)

Full implementation using Pointer Events API, designed for Shadow DOM compatibility and touch devices.

#### Architecture

| Component | Technology | Notes |
|-----------|-----------|-------|
| Drag initiation | `pointerdown` on grip handle | `setPointerCapture()` — no document-level listeners |
| Move tracking | `pointermove` on captured element | 8px deadzone before drag activates |
| Drop | `pointerup` / `pointercancel` | Releases capture, saves order |
| Animation | FLIP (First-Last-Invert-Play) | `requestAnimationFrame` + forced reflow |
| DOM diffing | `repeat()` directive | Keyed by `entity_id` — stable DOM nodes across reorders |
| Persistence | `localStorage` | Key: `lcars-ilm-order-{areaId}` |
| Keyboard | Alt+ArrowUp / Alt+ArrowDown | WCAG 2.5.7 Dragging Movements alternative |
| Announcement | `aria-live="assertive"` | `"{name} MOVED TO POSITION {n} OF {total}"` |

#### Grip Handle Design (Geordi Spec)

3-pip vertical pattern — three 4×4px squares stacked with 3px gap. LCARS-native design (not a hamburger icon). Minimum touch target: 2.5rem (40px) per WCAG 2.5.8.

```css
.ilm-grip {
  min-width: 2.5rem;
  cursor: grab;
  touch-action: none;
}
.ilm-grip span { /* 3 pips */
  width: 4px; height: 4px;
  border-radius: 1px;
  background: var(--lcars-gray);
}
```

#### FLIP Animation

1. `_captureFlipPositions()` — reads `getBoundingClientRect().top` for all `.ilm-light-bar` elements
2. After DOM update (`updated()` lifecycle), reads new positions
3. Computes delta, applies inverse `translateY` transform
4. `requestAnimationFrame` → remove transform with `transition: transform 200ms cubic-bezier(0.2, 0, 0, 1)`
5. Gated behind `prefers-reduced-motion: no-preference`

#### Partition Caching

`_getPartition()` caches the result of `_partitionLightingEntities()` per render cycle. `willUpdate()` sets `_partitionDirty = true`. First call to `_getPartition()` computes and caches; subsequent calls in the same cycle (e.g., `renderBadge()` then `renderContent()`) return the cached result.

---

### B7. Architecture Diagram Update

```
LitElement
  └── LcarsBasePanel
        ├── LcarsCameraPanel
        ├── LcarsEnvironmentPanel
        ├── LcarsBatteryPanel
        ├── LcarsClimatePanel
        ├── LcarsAlarmPanel
        ├── LcarsMediaPanel
        ├── LcarsPoolSpaPanel
        ├── LcarsWeatherPanel
        ├── LcarsIrrigationPanel     ← v4.18.2: full Rachio V2 redesign
        ├── LcarsPowerPanel
        ├── LcarsLifeSupportPanel
        └── LcarsIlluminationPanel    ← v4.18.2: stable sort, drag reorder,
                                         infra LED exclusion, Insteon detection,
                                         device dedup, partition caching
```

### B8. New Dependency

| Package | Import | Bundle Impact | Added In |
|---------|--------|--------------|----------|
| `lit-html` | `repeat` from `lit-html/directives/repeat.js` | ~1 KiB minified | v4.18.2 |

First use of the `repeat()` directive in the project. Required for keyed DOM diffing to support FLIP animation across reorders. Without `repeat()`, Lit's default `map()` reuses DOM nodes by index, breaking position tracking.

---

## Irrigation Panel V2 — Full Rachio Integration

### C1. Redesign Overview

Complete rewrite of `<lcars-irrigation-panel>` from bare-bones zone list to full "Arboretum Environmental Control" console. Design consulted with Wesley (creative) and Geordi (LCARS compliance).

### C2. Entity Partition Redesign

New 4-bucket partition replacing the original 3-bucket:

| Bucket | Detection | Contents |
|--------|-----------|----------|
| `zones` | `switch` with `Zone number` attr or `/zone/i` in entity_id | 8 zone switches |
| `schedules` | `switch` with `Type` attr or `/schedule/i` in entity_id | Automatic + Summer schedules |
| `controller` | Remaining `switch` entities | Standby + Rain Delay |
| `binarySensors` | `binary_sensor` domain | Connectivity + Rain |

### C3. Zone Photos

Rachio zones expose `entity_picture` (URL to user-uploaded zone photo via Rachio cloud). Photos rendered as 2.5×2rem inline thumbnails with:
- `loading="lazy"` — 8 photos don't load eagerly
- `referrerpolicy="no-referrer"` — no origin header leakage (Worf)
- `@error` fallback — shows vegetation type icon (mdi:grass/tree/flower) when photo unavailable
- Zone number badge in bottom-left corner (Geordi-approved overlay)
- No desaturation filter (Geordi rejected `filter: saturate()` as non-LCARS)

### C4. Zone Detail Expansion

Clicking zone name toggles inline expansion showing Rachio zone attributes:
- **Shade**: Full Sun / Mostly Sun / Half Shade / Full Shade — icon-mapped
- **Vegetation Type**: Cool Season Grass / Shrubs / Perennials / etc. — icon-mapped
- **Slope**: Flat / Slight / Moderate / Steep
- **Summary**: Last activity text from Rachio

All badges use LCARS pill shape (flat left, rounded right per Geordi ruling).

### C5. Barberpole Flow + Countdown

- Active zone fill bar uses `repeating-linear-gradient(-45deg, ...)` with `background-position` animation at 0.6s
- Fill width driven by real progress: `(Date.now() - last_changed) / Watering_Duration_seconds * 100`
- Countdown timer updates every 1s via `setInterval` (cleared in `disconnectedCallback`)
- `prefers-reduced-motion: reduce` → solid fill, no animation

### C6. Schedule Strips

Schedule switches rendered as toggle strips with:
- ON/OFF button (LCARS pill, ice when on, gray when off)
- Schedule name
- Type badge: FLEX (african-violet) or FIXED (butterscotch)
- Duration text

### C7. Controller Status Telemetry

Four horizontal mini-bar indicators (not dots — Geordi ruling):
| Status | On Color | Off Color |
|--------|----------|-----------|
| Connectivity | ice | tomato (pulsing) |
| Standby | gold | gray |
| Rain Delay | african-violet | gray |
| Rain Sensor | ice | gray |

### C8. Rain Alert Banner

Conditional full-width banner (grid-area: alert) when rain delay or rain detected:
- `border-left: 4px` (Geordi: minimum 4px for thick border)
- African-violet for rain delay, ice for rain detected
- CANCEL button for rain delay
- `role="alert"` + `aria-live="polite"`

### C9. Quick Run Builder

Collapsible section calling `rachio.start_multiple_zone_schedule`:
- Zone selector: multi-select pill buttons (one per zone number)
- Duration picker: preset buttons (3/5/10/15/20 min)
- ENGAGE button: butterscotch, LCARS endcap shape
- All minimum 2.5rem touch targets (WCAG 2.5.8)

### C10. Pause/Resume/Stop Controls

- PAUSE: calls `rachio.pause_watering` with 60min duration
- STOP ALL: calls `rachio.stop_watering`
- Standby toggle: `switch.turn_on/off` on standby entity
- Rain delay toggle: `switch.turn_on/off` on rain_delay entity
- All rate-limited via existing `createRateLimiter(5, 10000)`

### C11. Grid Layout (Geordi-approved 4-row consolidation)

```css
grid-template-areas:
  "alert    alert"
  "sidebar  zones"
  "quickrun quickrun"
  "controls controls";
grid-template-columns: minmax(8rem, 1fr) minmax(16rem, 3fr);
```

Reduced from Wesley's proposed 6-row to 4-row per Geordi's layout review. Photos inline per zone row (not separate strip). Alert conditional (collapses when inactive).
