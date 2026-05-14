# LCARS Fabrication Subpanel Spec

**Status:** shipped in v5.10.0-beta.8
**Issue:** #225
**Surface:** Engineering dashboard → `FAB` sidebar tab
**Source:** `custom_components/lcars_dashboard/js/src/lcars-engineering-card.js`

---

## 0. Design Philosophy

A 3D printer is a *fabrication appliance*: it runs a job, reports progress / temperatures / errors, and has consumables (filament trays). That idiom is closer to a Galley oven than a power source, so the Fabrication surface mirrors the Galley card pattern (status pill + temp tiles + cycle progress + error border) rather than inventing a new metaphor.

Decision (Data, 2026-05-12): **do NOT spend a top-level dashboard slot on one device.** The Bambu Lab integration is owned by the Engineering dashboard as a fourth sidebar tab (`FAB`) alongside `ALL / LIVE / DAILY`.

---

## 1. Sidebar Tabs

`lcars-engineering-layout.js` exposes four mutually-exclusive filter tabs:

| Tab | Filter constant | Renders |
|-----|-----------------|---------|
| `ALL` | `FILTER_ALL` | Sources + Distribution + Live circuits |
| `LIVE` | `FILTER_LIVE` | Live circuits only |
| `DAILY` | `FILTER_DAILY` | Daily energy bars |
| `FAB` | `FILTER_FABRICATION` | Fabrication printers (this spec) |

Tab switching is dispatched via `lcarsEventBus` `lcars-eng-filter` `CustomEvent`. The right-rail system-status panel renders on every tab.

---

## 2. Discovery — `_discoverFabrication(states, entities)`

```js
const FABRICATION_PLATFORMS = new Set(['bambu_lab']);
```

Pipeline:

1. Iterate `this._hass.entities`; keep entries where `platform === 'bambu_lab'`.
2. Extract a *printer slug* from each entity_id via `/^[a-z_]+\.([a-z0-9]+_[a-z0-9]+)_/i`.
   The Bambu Lab integration prefixes every entity with the printer model + serial (`h2c_31b8ap612800082_*`); both the printer and its sub-devices (AMS, ExternalSpool, HotendRack) share the same slug.
3. Group entries by printer slug. Resolve display name by preferring the *primary* device whose `name` does NOT contain `_AMS_`, `_ExternalSpool`, or `_HotendRack`; fall back to slug uppercase.
4. Return `{ printers: [{ slug, name, states: { eid → state } }, ...] }`.

---

## 3. Per-Printer Card Anatomy

Rendered by `_renderFabPrinter(p)`. Border color:

- **Tomato** if `*_print_error` ≠ `no_error`/`none` OR `*_hms_errors` count > 0.
- **Gold** while `*_print_status ∈ {running, printing}`.
- **Gray** otherwise.

### 3.1 Header row

- Printer display name (truncate-ellipsis).
- Status pill (`RUNNING` / `IDLE` / `PAUSE` / `FAILED`) painted with the border color.
- Current stage (`*_current_stage`) when not idle.
- `! ERROR` pill (tomato) when error condition above is true; tooltip carries the error string or HMS count.

### 3.2 Progress row (only when printing OR progress > 0)

- 100%-wide track with `*_print_progress` fill + centered `NN%` overlay.
- Meta row:
  - `L 247/1245` from `*_current_layer` / `*_total_layer_count`
  - `ETA 47m` from `*_remaining_time` (skipped when `'0'`)
  - Task name (truncated) from `*_task_name`

### 3.3 Body grid

Left column — temperature tiles. Each tile is button-role, opens more-info on click:

| Label | Current sensor suffix | Target sensor suffix |
|-------|-----------------------|----------------------|
| `BED` | `_bed_temperature` | `_target_bed_temperature` |
| `L NOZ` | `_left_nozzle_temperature` | `_target_left_nozzle_temperature` |
| `R NOZ` | `_right_nozzle_temperature` | `_target_right_nozzle_temperature` |
| `CHAMBER` | `_chamber_temperature` | _(none)_ |

Tile color: tomato when actively heating (`abs(current - target) > 2°`), butterscotch when a target is set, gray otherwise.

Right column — chamber camera. Source: `image.*_cover_image` (or `_chamber_image` / `_camera`) via `state.attributes.entity_picture`. Lazy-loaded; 8rem wide; collapses below body grid breakpoint.

### 3.4 AMS row

Renders when any `*_ams_tray_{N}` entity exists.

- `AMS · 42%RH` label using the first `*_ams_humidity` sensor.
- One pill per tray showing a color swatch (from `state.attributes.color` / `tray_color`) and `T{N} · {type}` text. Empty trays show `EMPTY`.
- Pills are clickable → more-info on the tray entity.

### 3.5 Footer row

- `*_print_type` and `*_print_speed_profile` as meta pills.
- `CHAMBER LIGHT` and `BED LIGHT` toggle buttons mapped to `light.*_chamber_light` / `light.*_heatbed_light`. `aria-pressed` reflects state; click calls `light.turn_on` / `light.turn_off`.

---

## 4. Hidden / Diagnostic Entities

The card explicitly *does not* surface (they remain available via HA's normal entity registry):

- `*_mqtt_*`, `*_ip_address`, `*_firmware`, `*_wi_fi_signal`, `*_sd_card_status`, `*_developer_lan_mode` — connectivity / diagnostics
- `*_aux_fan_speed`, `*_chamber_fan_speed`, `*_part_cooling_fan_speed` — fan telemetry (deferred to follow-on)
- `*_hotendrack_*` — sub-device diagnostics

These exist on the Bambu Lab integration but add noise without operator value on the dashboard surface. Tomato error borders + `! ERROR` pills already surface failure conditions sourced from `*_print_error` / `*_hms_errors`.

---

## 5. Multi-Printer Layout

`_renderFabrication()` lays printers out in a `repeat(auto-fit, minmax(20rem, 1fr))` grid. Order: discovery order (Object iteration of `hass.entities`). At a single-printer install (current state on Eric's and the Captain's HA) this collapses to a single full-width card.

---

## 6. Performance

- One discovery pass per render; O(N) over `hass.entities` filtered to `platform === 'bambu_lab'`.
- No subscriptions beyond the engineering card's existing `_hass` setter.
- Chamber camera is a raw `<img>` against `entity_picture`; HA serves the snapshot at its own polling cadence. No JS push.

---

## 7. Open Follow-Ons

- **Habitat office-area printer-status pill.** Captain's primary ask was "add the 3d printer to engineering"; a per-area surface on the Habitat dashboard is a separate v5.11+ effort.
- **Multi-printer support.** Eric and the Captain run a single H2C each. Discovery handles multiple slugs but visual layout has not been stress-tested at N>1.
- **Filament-runout alerts.** Bambu exposes `*_filament_runout`; integration into the alarm/tactical dashboards is deferred.
- **Fan telemetry surface.** Could earn a collapsible sub-row if operator demand surfaces.

---

## Source Map

| Concern | File | Symbol |
|---------|------|--------|
| Sidebar tab | `lcars-engineering-layout.js` | `FILTER_FABRICATION` button |
| Discovery | `lcars-engineering-card.js` | `_discoverFabrication`, `_fabPrinterSlug` |
| Render | `lcars-engineering-card.js` | `_renderFabrication`, `_renderFabPrinter`, `_fabTempTile` |
| Styles | `lcars-engineering-card.js` | `.eng-fab-*` rules in `static get styles()` |
