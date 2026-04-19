## v4.21.0 Addendum — Tactical Panel (4X-42)

**Status**: IMPLEMENTED — v4.21.0-rc.1
**Date**: 2026-04-17
**Subsumes**: PANEL_TYPE_ALARM (alarm devices no longer render standalone when tactical is active)

---

### Overview

New `PANEL_TYPE_TACTICAL` — area-level composite panel that consolidates all security-relevant entities:

| Section | Entities | Rendering |
|---------|----------|-----------|
| Alarm Control | `alarm_control_panel` domain | Nested `<lcars-alarm-panel>` with `frame-mode="nested"` |
| Access Points | `lock` domain, `cover` (garage_door/gate/door) | Pill-button toggle rows with LOCKED/UNLOCKED state |
| Perimeter | `binary_sensor` (door/window/opening/garage_door) | Wrapping chip grid with OPEN/CLOSED state |
| Motion | `binary_sensor` (motion/occupancy) | Wrapping chip grid with DETECTED/CLEAR state |

### Detection

`isTacticalEntity()` predicate in `lcars-entity-utils.js` — matches alarm, lock, security covers, and security binary sensors. Excludes cameras (they retain `PANEL_TYPE_CAMERA`).

Added to `classifyArea()` — any area with ≥1 tactical entity gets `PANEL_TYPE_TACTICAL`.

### Subsumption

When `PANEL_TYPE_TACTICAL` is active in an area:
- `PANEL_TYPE_ALARM` added to `subsumedDeviceTypes` — alarm devices don't render standalone
- `isTacticalEntity` added to `_buildAreaPanelFilter` — security entities consumed by area panel

### Graceful Degradation

| Config | Condition | Grid |
|--------|-----------|------|
| full | Alarm + locks/sensors | 2-col: alarm + access, full-width perimeter + motion |
| alarm-only | Alarm only | Single col alarm + keypad |
| no-alarm | Locks/sensors, no alarm | Full-width access + perimeter + motion |
| sensors-only | Only binary sensors | Single col perimeter + motion |

### Frame Color

Adapts to most critical security state: tomato (triggered) → butterscotch (armed_away) → sunflower (armed_home) → gold (arming) → ice (disarmed/secure).
