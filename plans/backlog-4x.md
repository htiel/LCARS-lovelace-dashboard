# LCARS Dashboard - 4.x Backlog

> Stable branch (`4.0`). Non-breaking feature additions, bug fixes, and optimizations.
> Version: 4.22.0 (current)
>
> Completed items through 4.22.0 archived to `_archive/plans/`.
> v5.x deferred items tracked in [#70](https://github.com/htiel/LCARS-lovelace-dashboard/issues/70) and `plans/backlog-5x.md`.

---

## Open Bugs

### 4X-47 - Battery telemetry raw decimals - `TODO` - Priority: MEDIUM - Size: S

**GitHub Issue**: [#47](https://github.com/htiel/LCARS-lovelace-dashboard/issues/47)

Battery telemetry values (UPS Air, River 3+, BIGBOY-DPU) display raw decimal numbers without `formatNumber()` rounding.

---

### 4X-48 - Life Support header badge raw temperature - `TODO` - Priority: MEDIUM - Size: S

**GitHub Issue**: [#48](https://github.com/htiel/LCARS-lovelace-dashboard/issues/48)

Life Support panel header badge shows raw temperature value — missing `formatNumber()` call.

---

### 4X-49 - Environment sparkline labels show device_class names - `TODO` - Priority: MEDIUM - Size: S

**GitHub Issue**: [#49](https://github.com/htiel/LCARS-lovelace-dashboard/issues/49)

Environment panel sparkline labels not using `canonicalLabel()` — shows full device_class names instead of short labels.

---

### 4X-50 - Inconsistent offline indicator colors - `TODO` - Priority: MEDIUM - Size: S

**GitHub Issue**: [#50](https://github.com/htiel/LCARS-lovelace-dashboard/issues/50)

Sensors on the same offline device show inconsistent offline indicator colors.

---

### 4X-51 - Insteon plug switches render as standalone panels instead of Illumination Circuits - `TODO` - Priority: MEDIUM - Size: S

**GitHub Issue**: [#71](https://github.com/htiel/LCARS-lovelace-dashboard/issues/71)

Two Insteon switch entities controlling plugs render as standalone device panels instead of being included in the Illumination Control panel's CIRCUITS section. `isLightingSwitch()` heuristic not matching Insteon plug switches — device names lack lighting keywords and `insteon` platform may not be in detection list.

---

### 4X-7 · Motion Sensor Sub-Entity Grouping in Alarm Panel — `TODO` · Priority: MEDIUM · Size: M

**GitHub**: [#72](https://github.com/htiel/LCARS-lovelace-dashboard/issues/72)
**Spec**: None — bug fix

When a motion sensor device (e.g., backyard motion sensor) is classified into the alarm/tactical panel, only the `binary_sensor` motion entity is claimed as a zone sensor. The device's **companion entities** — battery (`sensor`, device_class: `battery`) and illuminance/light (`sensor`, device_class: `illuminance`) — remain in the general device pool and render as orphaned independent buttons.

**Root cause**: `_partitionAlarmEntities()` operates at the entity level, not the device level. Sub-entities that don't match alarm zone device_classes (`motion`, `door`, `window`, etc.) are left behind. The remaining entities (battery + illuminance only) don't match any panel classifier, so they appear as unclassified buttons.

**Proposed fix**: When any entity from a device is claimed by the alarm panel as a zone sensor, absorb **all** remaining entities of that same device into the alarm panel context — display them as auxiliary telemetry on the zone sensor row (e.g., battery %, lux reading) or suppress them from the main button grid entirely.

**Implementation notes**:
- Modify `_partitionAlarmEntities()` to track which device IDs contribute zone sensors
- After zone partition, sweep remaining entities and claim same-device siblings
- Render battery/illuminance as secondary data pips on the zone sensor row
- Consider generalizing this pattern for other multi-entity devices (door sensors with battery, etc.)

**Acceptance criteria**:
- Motion sensor battery and illuminance entities no longer appear as independent buttons
- Battery % and lux values visible as auxiliary data on the zone sensor row in the alarm panel
- No regression for devices that legitimately belong in multiple panels
- Works for any multi-sensor device (Zigbee/Z-Wave motion sensors, door sensors with battery, etc.)

---

### 4X-52 - Life Support badge empty when temperature sensor offline - `TODO` - Priority: LOW - Size: XS

**GitHub Issue**: [#74](https://github.com/htiel/LCARS-lovelace-dashboard/issues/74)

When ambient sensors are unavailable, Life Support header badge renders nothing. `renderBadge()` returns empty HTML on NaN. Should show "—" in gray.

---

### 4X-53 - Media panel renders full controls in STANDBY - `TODO` - Priority: MEDIUM - Size: M

**GitHub Issue**: [#75](https://github.com/htiel/LCARS-lovelace-dashboard/issues/75)

Per LCARS-MEDIA-CARD-SPEC §1, idle state should hide transport controls, shuffle/repeat, and waveform. Currently renders full layout at 0.7 opacity.

---

### 4X-54 - BlueAir filter life bypasses segment bar (device_class:battery) - `TODO` - Priority: MEDIUM - Size: S

**GitHub Issue**: [#76](https://github.com/htiel/LCARS-lovelace-dashboard/issues/76)

BlueAir filter_life sensor has `device_class: battery` (upstream quirk). Bypasses filter segment bar renderer, shows as plain text "0%" with no critical visual alert.

---

## Open Features

### 4X-8 · Panel Placement Override per Area (Edit Gear Reorder) — `TODO` · Priority: MEDIUM · Size: M

**GitHub**: [#73](https://github.com/htiel/LCARS-lovelace-dashboard/issues/73)
**Spec**: None — feature request

Panel ordering within an area is currently hardcoded via `PANEL_TYPE_ORDER` (camera → alarm → aquatics → climate → media → environment → irrigation → weather → battery → power). Users cannot override this. Feature request: add a gear/edit pip to each panel header (visible in edit mode) that allows reordering panels within an area, with the custom order persisting across page loads.

**Pattern reference**: Extends the existing `device-edit-pip` / `edit-pip` pattern used on device buttons and entity rows in the illumination panel. Same `openEditPopup()` → WS save → `lcars_dashboard_reload` flow.

**Implementation notes**:
- New edit card: `lcars-edit-panel-card.js` — panel label (read-only), move up/down buttons, optional hide toggle
- New WS handlers: `lcars_dashboard/panel_order/set` and `lcars_dashboard/panel_order/get`
- Storage: `panel_overrides` dict in LCARS config store, keyed by `area_id`
- In `_renderAreaContent()`: after `panelDevices.sort()` by `PANEL_TYPE_ORDER`, re-sort by saved order if present
- Gear pip on panel header frame — reuse `.device-edit-pip` CSS

**Acceptance criteria**:
- In edit mode, each panel shows a gear pip in its header
- Clicking the pip opens an editor with move up / move down controls
- Custom panel order persists across page reloads via WS API
- Areas without custom order fall back to `PANEL_TYPE_ORDER` defaults
- Removing a panel type from an area gracefully removes it from saved order

---

## Low Priority

### 4X-5 - HACS library icon not showing - `TODO` - Priority: LOW - Size: XS

**GitHub Issue**: [#5](https://github.com/htiel/LCARS-lovelace-dashboard/issues/5)

Pre-existing bug.

---

## Web Platform APIs to Watch

| API | Baseline | Use | Priority |
|-----|----------|-----|----------|
| Popover API | Widely Available | Replace `lcars-popup.js` — zero-JS top layer, light-dismiss, focus trapping | HIGH |
| View Transition API | Widely Available | Area/floor switching crossfades, turbolift deck transitions | HIGH |
| Scroll-Driven Animations | Newly Available | Panels "power up" on scroll into viewport | MEDIUM |
| `text-wrap: balance` | Widely Available | Panel headers — prevent orphan words | LOW |
| CSS Anchor Positioning | Limited (Chrome 125+) | Future tooltips/popovers. Monitor. | EXPLORE |
| `field-sizing: content` | Newly Available | Config/search inputs auto-size | LOW |
