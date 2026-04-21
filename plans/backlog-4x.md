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

*None*

---

## Open Features

### 4X-33 · Gear Edit: Persistent Panel Reorder — `TODO` · Priority: MEDIUM · Size: M

**GitHub**: [#33](https://github.com/htiel/LCARS-lovelace-dashboard/issues/33)

Extended reorder capability beyond 4X-8's panel order override — user-defined device button ordering within each area.
