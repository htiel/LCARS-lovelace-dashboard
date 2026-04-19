# LCARS Dashboard - 4.x Backlog

> Stable branch (`4.0`). Non-breaking feature additions, bug fixes, and optimizations.
> Version: 4.22.0-rc.9 (current)
>
> Completed items through 4.22.0-rc.9 archived to `_archive/plans/`.
> v5.x deferred items tracked in [#70](https://github.com/htiel/LCARS-lovelace-dashboard/issues/70) and `plans/backlog-5x.md`.

---

## Open Bugs

### 4X-46 - Life Support horizontal clipping - `TODO` - Priority: HIGH - Size: M

**GitHub Issue**: [#44](https://github.com/htiel/LCARS-lovelace-dashboard/issues/44)

Horizontal clipping on nested environment panel's atmoscrubber cylinder. Vertical clipping fixed (flex-basis auto + :host display:block). Horizontal overflow persists. Parked pending further CSS investigation.

---

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

## Open Features

### 4X-45 - Thermostat rendering does not match LCARS climate panel spec - `TODO` - Priority: HIGH - Size: L - WSJF: 2.40

**GitHub Issue**: [#43](https://github.com/htiel/LCARS-lovelace-dashboard/issues/43)

Climate panel renders with generic HA climate dial instead of designed LCARS layout. Missing dual setpoint controls, humidity display, mode selector, fan speed. 3 Nest thermostats (platform: `nest`).

---

### 4X-36 - Weather station not rendering as LCARS weather panel - `TODO` - Priority: HIGH - Size: L - WSJF: 2.20

**GitHub Issue**: [#36](https://github.com/htiel/LCARS-lovelace-dashboard/issues/36)

Weather station entities (Tempest) render as generic sensor pills. Entities not assigned to any area, `weatherflow` platform not detected as weather panel candidates.

---

### 4X-37 - Pool/spa sensors not rendering as LCARS Cetacean Ops panel - `TODO` - Priority: HIGH - Size: L - WSJF: 2.20

**GitHub Issue**: [#37](https://github.com/htiel/LCARS-lovelace-dashboard/issues/37)

Pool/spa entities render as generic sensor pills and Power Systems panel. `screenlogic` platform not detected for Cetacean Ops routing.

---

### 4X-44 - Implement platform-to-panel routing for all tagged integrations - `TODO` - Priority: HIGH - Size: XL - WSJF: 1.63

**GitHub Issue**: [#42](https://github.com/htiel/LCARS-lovelace-dashboard/issues/42)

Entity-to-panel routing needs full implementation across 17 panel targets, 20+ integrations, 5,958 entities. Includes 3 new panels (hazard_detection, galley_systems, viewport_controls).

---

### 4X-29 - Add responsive breakpoints to remaining panels - `TODO` - Priority: MEDIUM - Size: M - WSJF: 3.00

**GitHub Issue**: [#29](https://github.com/htiel/LCARS-lovelace-dashboard/issues/29)

8 panels need single-column fallback below ~480px: alarm, battery, camera, climate, environment, irrigation, media, pool-spa, weather.

---

### 4X-42 - Consolidate alarm + security panels and rename - `TODO` - Priority: MEDIUM - Size: M - WSJF: 2.67

Alarm + security panels should be unified under 'Tactical' or 'Security Operations'. Locks, alarm systems, door/window sensors, motion sensors belong together.

---

### 4X-43 - Media panel: consolidate Apple TV + HomePods per room - `TODO` - Priority: MEDIUM - Size: M - WSJF: 2.33

Apple TV and HomePods in same room should render as single consolidated media panel with HomePods as secondary speaker section.

---

### 4X-35 - Alarm panel does not match spec render - `TODO` - Priority: MEDIUM - Size: L - WSJF: 1.80

**GitHub Issue**: [#35](https://github.com/htiel/LCARS-lovelace-dashboard/issues/35)

Alarm panel renders as generic HA alarm card instead of LCARS spec design. Missing header bar, door/sensor status list, styled keypad, mode buttons.

---

### 4X-33 - Gear edit: persistent panel reorder - `TODO` - Priority: MEDIUM - Size: L - WSJF: 1.60

**GitHub Issue**: [#33](https://github.com/htiel/LCARS-lovelace-dashboard/issues/33)

Allow users to reorder panels within a room via gear edit mode. Requires backend websocket command for persistence + frontend drag-and-drop UI.

---

### 4X-39 - New panel: Nest Protect / smoke-CO-heat detector safety panel - `TODO` - Priority: MEDIUM - Size: L - WSJF: 1.60

**GitHub Issue**: [#39](https://github.com/htiel/LCARS-lovelace-dashboard/issues/39)

167 Nest Protect entities across 7 devices. Needs 'Hazard Detection' panel with per-room detector status, battery overview, self-test summary.

---

### 4X-30 - Reduce gradient usage in legacy homepage card - `TODO` - Priority: LOW - Size: M - WSJF: 1.67

**GitHub Issue**: [#30](https://github.com/htiel/LCARS-lovelace-dashboard/issues/30)

20+ gradient uses violating Bracer Jack Rule 1. Audit and remove decorative gradients, document functional ones.

---

### 4X-41 - New panel: Blinds/shades/covers control panel - `TODO` - Priority: LOW - Size: M - WSJF: 1.67

**GitHub Issue**: [#41](https://github.com/htiel/LCARS-lovelace-dashboard/issues/41)

Cover/blind entities have no dedicated panel. Theme as 'Viewport Controls' or 'Observation Ports'.

---

### 4X-40 - New panel: GE Home SmartHQ appliance panel - `TODO` - Priority: LOW - Size: L - WSJF: 1.40

**GitHub Issue**: [#40](https://github.com/htiel/LCARS-lovelace-dashboard/issues/40)

34 GE Home entities (oven, Advantium, beverage/ice). Needs 'Galley Systems' panel.

---

## Low Priority

### 4X-5 - HACS library icon not showing - `TODO` - Priority: LOW - Size: XS

**GitHub Issue**: [#5](https://github.com/htiel/LCARS-lovelace-dashboard/issues/5)

Pre-existing bug.
