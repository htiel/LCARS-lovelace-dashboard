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

### 4X-33 - Gear edit: persistent panel reorder - `TODO` - Priority: MEDIUM - Size: L

**GitHub Issue**: [#33](https://github.com/htiel/LCARS-lovelace-dashboard/issues/33)

Allow users to reorder panels within a room via gear edit mode. Requires backend websocket command for persistence + frontend drag-and-drop UI.

---

## Low Priority

### 4X-5 - HACS library icon not showing - `TODO` - Priority: LOW - Size: XS

**GitHub Issue**: [#5](https://github.com/htiel/LCARS-lovelace-dashboard/issues/5)

Pre-existing bug.
