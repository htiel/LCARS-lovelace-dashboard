# LCARS Dashboard - 4.x Backlog

> Stable branch (`4.0`). Non-breaking feature additions, bug fixes, and optimizations.
> Version: 4.23.0-beta.1 (current)
>
> Completed items through 4.22.0 archived to `_archive/plans/`.
> v4.23.0 items shipped in beta.1 — pending final QA before promotion to stable.
> v5.x deferred items tracked in [#70](https://github.com/htiel/LCARS-lovelace-dashboard/issues/70) and `plans/backlog-5x.md`.

---

## Shipped in v4.23.0-beta.1

| ID | Title | Batch | Status |
|----|-------|-------|--------|
| 4X-47 | Battery telemetry raw decimals | A | DONE |
| 4X-48 | Life Support header badge raw temperature | A | DONE |
| 4X-49 | Environment sparkline labels show device_class names | A | DONE |
| 4X-50 | Inconsistent offline indicator colors | B | DONE |
| 4X-52 | Life Support badge empty when temperature sensor offline | B | DONE |
| 4X-51 | Insteon plug switches render as standalone panels | C | DONE |
| 4X-7 | Motion Sensor Sub-Entity Grouping in Alarm Panel | C | DONE |
| 4X-53 | Media panel renders full controls in STANDBY | D | DONE |
| 4X-54 | BlueAir filter life bypasses segment bar | E | DONE |
| 4X-57 | HomeKit Air Purifier Detection (Smartmi P1) | J | DONE |
| 4X-55 | EV Charger Panel (Wallbox Vilya V2G) | H | DONE |
| 4X-58 | Wallbox Cable Lock Tactical Exclusion | H | DONE |
| 4X-56 | Climate Panel Portable AC Support (Midea) | I | DONE |
| 4X-8 | Panel Placement Override per Area | F | DONE |
| 4X-5 | HACS library icon not showing | G | DONE |

---

## Open Bugs

### 4X-59 · Midea AC climate entity missing from HA — `TODO` · Priority: HIGH · Size: S

**GitHub**: [#77](https://github.com/htiel/LCARS-lovelace-dashboard/issues/77)
**Area**: Quinn's Room
**Source**: Visual QA crawl (v4.23.0-beta.1)

The Midea AC LAN integration is installed (`update.midea_ac_lan_update` exists) but **no `climate.*midea*` entity** is registered in the entity registry. The portable AC climate panel built in 4X-56 (Batch I — swing mode strip, eco/turbo/swing toggles, timer stepper) is code-complete but has no entity to render against.

**Action**: Verify the Midea portable AC is configured/discovered in HA. Once a `climate.midea_*` entity exists and is assigned to Quinn's Room area, the panel should auto-render.

**Note**: This is a HA integration config issue, not a dashboard code bug. The code path is ready.

---

### 4X-60 · HomeKit purifier (Smartmi P1) renders as standalone device card — `TODO` · Priority: HIGH · Size: M

**GitHub**: [#78](https://github.com/htiel/LCARS-lovelace-dashboard/issues/78)
**Area**: Quinn's Room
**Source**: Visual QA crawl (v4.23.0-beta.1)

`fan.quinn_s_air_purifier` (homekit_controller, Smartmi P1) renders as a generic HA device card showing just "Sensors: Filter lifetime 0%" instead of being absorbed into an LCARS Life Support purifier sub-panel.

**Entities**:
- `fan.quinn_s_air_purifier` — main fan entity → **not absorbed** → standalone card
- `sensor.quinn_s_air_purifier_filter_lifetime` — **in standalone card**, not in Life Support
- `sensor.quinn_s_air_purifier_pm2_5_density` — in Life Support sensor array ✓
- `sensor.quinn_s_air_purifier_air_quality` — in Life Support sensor array ✓
- `select.quinn_s_air_purifier_air_purifier_mode` — not visible anywhere

4X-57 (HomeKit Air Purifier Detection) was supposed to detect the `fan` + AQ sensor pattern and absorb into Life Support. The AQ sensor data IS in the sensor array, but the `fan` entity and its filter/mode controls are not.

**Expected**: Smartmi P1 should render as a Life Support purifier sub-panel with fan control, mode select, filter bar, and AQ sensor data — similar to the BlueAir purifier panels.

---

### 4X-61 · Insteon motion sensor Light/Battery siblings not absorbed — `TODO` · Priority: MEDIUM · Size: M

**GitHub**: [#79](https://github.com/htiel/LCARS-lovelace-dashboard/issues/79)
**Areas**: Back Yard, Garage
**Source**: Visual QA crawl (v4.23.0-beta.1)

Insteon motion sensor devices have 3 `binary_sensor` entities each: `motion`, `light` (ambient light detection), `battery` (low battery indicator). The `motion` entity is correctly absorbed into the Tactical panel. But:

1. **Light** (`binary_sensor.motion_sensor_ii_41_65_fe_light`) → falls through to standalone HA device card
2. **Battery** (`binary_sensor.motion_sensor_ii_41_65_fe_battery`) → not visible anywhere — no pip in Tactical

**Affected devices**:
- Back Yard: Motion Sensor II 41.65.FE (3 entities: motion ✓, light ✗, battery ✗)
- Garage: Motion Sensor II 41.64.48 (3 entities: motion ✓, light ✗, battery ✗)

4X-7 (alarm zone sibling absorption) should have absorbed these siblings. Either the sibling detection doesn't match `binary_sensor` entities with `light`/`battery` device_class, or the Insteon device structure differs from what the absorption logic expects.

**Expected**: Light and battery binary_sensors should render as small pips/indicators within the Tactical panel entry for each motion sensor. The standalone device card should not appear.

---

### 4X-62 · Tactical motion sensor name redundancy — `TODO` · Priority: LOW · Size: S

**GitHub**: [#80](https://github.com/htiel/LCARS-lovelace-dashboard/issues/80)
**Area**: Back Yard
**Source**: Visual QA crawl (v4.23.0-beta.1)

Tactical panel shows: `BACKYARD MOTION SENSOR MOTION SENSOR II 41.65.FE MOTION CLEAR`

The label concatenates device name + entity friendly name, creating an extremely long redundant string. Should display a cleaner label like "BACKYARD MOTION" or just the device name.

---

### 4X-63 · Master Bedroom media transport visible in apparent standby — `TODO` · Priority: MEDIUM · Size: S

**GitHub**: [#81](https://github.com/htiel/LCARS-lovelace-dashboard/issues/81)
**Area**: Master Bedroom
**Source**: Visual QA crawl (v4.23.0-beta.1)

The media panel badge shows "■ OFF" and center label says "STANDBY", but transport controls (shuffle, prev, pause, next, repeat), waveform visualization, and last-played info ("She Didn't Like the Show... Then Asked for a Refund" / More Jimmy Carr) are all visible. The Office media panel correctly hides transport in the same state.

4X-53 (standby compaction) hides transport/waveform for `standby`, `off`, and `idle` states. The Master Bedroom Sonos may actually be in `paused` state (not covered by compaction) while the badge incorrectly reports "OFF".

**Investigate**: Check actual `media_player.master_bedroom_*` state vs. what the badge computes. Either expand compaction to include `paused`, or fix badge text to accurately reflect the real state.

---

## Open Features

### 4X-33 · Gear Edit: Persistent Panel Reorder — `TODO` · Priority: MEDIUM · Size: M

**GitHub**: [#33](https://github.com/htiel/LCARS-lovelace-dashboard/issues/33)

Extended reorder capability beyond 4X-8's panel order override — user-defined device button ordering within each area.
