# LCARS Dashboard — 5.x Shipped Items (Archive)

> Completed items moved from `plans/backlog-5x.md`.
> Archived: 2026-04-29

---

## Epic 0 · v5.0.1 Stabilization (QA Review — beta.7)

> Compiled from full QA review by Geordi (A11y/LCARS), Wesley (UX/Innovation), Data (HA Standards), Worf (Security), and Riker (Priority Triage).
> Deduplicated and sorted by implementation priority. Legacy alias IDs preserved for traceability.
> Shipped in v5.0.1-beta.8 and v5.0.2-beta.1.

### Batch 1 · Security Blockers

#### 5X-B09 · Restrict Static Asset Exposure — `DONE` · Priority: CRITICAL · Size: S · WSJF: 7.50
`load_plugins.py` registers the entire `js/` directory as a public static path, exposing `package.json`, `webpack.config.js`, `src/`, and `vendor/` to all authenticated users. Only the compiled bundle and `.LICENSE.txt` should be served.
**Aliases**: WORF-SEC-001
**OWASP**: A05:2021 — Security Misconfiguration

#### 5X-B10 · Enforce `!include` Path Boundaries — `DONE` · Priority: CRITICAL · Size: S · WSJF: 6.50
`_include_yaml` in `process_yaml.py` resolves paths with `os.path.abspath` but does not validate the result stays within the HA config directory. `_safe_path` exists in `__init__.py` but is not applied here.
**Aliases**: WORF-SEC-003
**OWASP**: A03:2021 — Injection (Path Traversal)

#### 5X-B01 · Replace Sidebar Auto-Reorder Hack — `DONE` · Priority: CRITICAL · Size: M · WSJF: 5.00
Remove `_apply_sidebar_order`'s private API (`async_user_store`) dependency. It crosses user-isolation boundaries (writes to ALL users), accepts unvalidated order items, and fails silently for non-admin users. The JS-side `ensureLcarsSidebarTop()` is the correct approach — remove the Python backend hack entirely.
**Aliases**: 5X-B01, WORF-SEC-002, WORF-SEC-004, WORF-SEC-008

#### 5X-B11 · Cap Blueprint YAML Depth and Complexity — `DONE` · Priority: HIGH · Size: M · WSJF: 3.33
`ws_handle_install_blueprint` has a 256KB size limit but no nesting depth or key count limit. `yaml.safe_load` prevents code execution but not resource exhaustion via deeply nested structures.
**Aliases**: WORF-SEC-006

### Batch 2 · Functional Beta Blockers

#### 5X-B03 · System Automation Must Render LCARS, Not Raw HA Cards — `DONE` · Priority: CRITICAL · Size: M · WSJF: 4.67
System Automation area renders default HA cards instead of LCARS-styled surfaces. Classification gap — automations/scripts not routed through LCARS rendering pipeline.
**Aliases**: GEO-504, WC5-001, 5X-B03

#### 5X-B04 · Fix Camera Proxy 500s During Area Navigation — `DONE` · Priority: CRITICAL · Size: M · WSJF: 4.67
HTTP 500 errors from camera proxy endpoints when navigating between areas. Likely race condition on camera stream teardown/setup.
**Aliases**: 5X-B04

#### 5X-B15 · Filter Camera-Derived CO/Alarm Noise from Life Support — `DONE` · Priority: CRITICAL · Size: M · WSJF: 4.00
Camera diagnostic CO/alarm sensors should not appear on Life Support. These are camera subsystem sensors, not real safety devices.
**Aliases**: WC5-003

#### 5X-B08 · Handle Unadopted UniFi Cameras — `DONE` · Priority: HIGH · Size: M · WSJF: 3.67
Unadopted cameras show ambiguous "ADOPT DEVICE" CTA. Either filter unadopted cameras or render an explicit recovery state.
**Aliases**: GEO-506, 5X-B08

### Batch 3 · Accessibility and Semantics

#### 5X-B05 · Fix Summary Bar Contrast Across Dashboards — `DONE` · Priority: CRITICAL · Size: M · WSJF: 4.67
Engineering and Life Support summary bars have WCAG contrast failures — colored text on colored backgrounds compounded by 0.6 opacity on labels. Shared summary-bar CSS treatment inconsistent across dashboards.
**Aliases**: GEO-501, GEO-502, GEO-507, GEO-517

#### 5X-B13 · Add Accessible Labels for Truncated Sidebar Buttons — `DONE` · Priority: CRITICAL · Size: S · WSJF: 5.00
Sidebar area buttons with truncated names have no `title` attribute or `aria-label`, making them undiscoverable to keyboard and assistive-tech users.
**Aliases**: GEO-503

#### 5X-B02 · Humanize Update-Domain State Text — `DONE` · Priority: CRITICAL · Size: S · WSJF: 5.50
`update` domain entities show raw "OFF" instead of meaningful LCARS copy like "UP TO DATE" or "UPDATE AVAILABLE". Also affects "Firmware: OFF" display.
**Aliases**: GEO-510, WC5-004, 5X-B02

#### 5X-B14 · Hide Media Transport in Paused/Standby — `DONE` · Priority: CRITICAL · Size: S · WSJF: 4.50
Media transport controls visible when player is paused, idle, or standby. Carry-forward from 4X-63.
**Aliases**: GEO-505, 4X-63

#### 5X-B07 · Guard Battery 0% with Availability Context — `DONE` · Priority: CRITICAL · Size: S · WSJF: 4.00
Bare "0%" displayed without distinguishing unavailable/unknown/no-telemetry from genuinely depleted battery.
**Aliases**: GEO-511, WC5-008, 5X-B07

### Batch 5 · Panel Semantics and Visual Polish

#### 5X-B18 · Fix EV Charger Empty-State Regression — `DONE` · Priority: CRITICAL · Size: S · WSJF: 4.00
EV charger panel renders empty with N/A values. Show actionable empty-state copy or suppress panel when no valid data exists.
**Aliases**: WC5-010

#### 5X-B06 · Normalize Shortened Labels and Remove Redundant Suffixes — `DONE` · Priority: HIGH · Size: M · WSJF: 3.00
`_shortenName()` leaves model-number tails, repeated area names, and tactical sensor redundancy in truncated names.
**Aliases**: GEO-509, WC5-006, 5X-B06, 4X-62

#### 5X-B19 · Improve Tactical Status Affordances — `DONE` · Priority: HIGH · Size: S · WSJF: 3.50
Missing tactical camera summary badge. Red-alert threshold animation doesn't match actual alarm state.
**Aliases**: WC5-011, GEO-513

#### 5X-B20 · Improve Environmental Telemetry Readability — `DONE` · Priority: HIGH · Size: S · WSJF: 3.00
AQI meter scale ambiguous. Life Support sparklines too small to read at a glance.
**Aliases**: GEO-512, WC5-013

---

## Epic 1 · Branch & Release Setup

### 5X-1 · Create 5.0 Branch + HACS Beta Track — `DONE` · Priority: CRITICAL · Size: S

Set up the `5.0` branch with GitHub pre-release tags so users can opt in via HACS.

**Implementation notes**:
- Create `5.0` branch from current `4.0` HEAD
- Tag last stable 4.x commit as a GitHub Release (not pre-release) — anchors stable users
- Publish 5.0 work as GitHub Releases with pre-release tags (`v5.0.0-beta.1`, etc.)
- `4.0` stays default branch and stable HACS track. No changes to `hacs.json` on either branch.
- When 5.0 is stable: publish `v5.0.0`, merge into `4.0`, tag as new stable
- Document migration path in README on `5.0` branch

---

## Epic 2 · Multi-Dashboard Architecture

### 5X-2.0 · Dashboard Registration Framework — `DONE` · Priority: CRITICAL · Size: L

Rework `load_dashboard.py` to support registering multiple independent Lovelace dashboards, each with its own YAML template, entity filter, and layout.

**Pattern**: Each dashboard = `url_path` + `title` + `ui-lovelace-{name}.yaml` + entity filter config.

### 5X-2.1 · "Habitat" Dashboard (Rename + Cleanup) — `DONE` · Priority: HIGH · Size: M

Rename existing dashboard from "LCARS Dashboard" to "Habitat." Remove the list/devices view — area view only.

**Breaking changes**:
- `url_path`: `lcars-dashboard` → `habitat` (bookmarks break)
- List view removed

### 5X-2.2 · "Security" Dashboard — `DONE` · Priority: HIGH · Size: L

Single pane of glass for all locks, cameras, alarm panels, and security sensors across all areas.

### 5X-2.3 · "Power" Dashboard — `DONE` · Priority: HIGH · Size: L

All battery panels, electrical sensors, power consumption in one view.

### 5X-2.4 · "Environmental" Dashboard — `DONE` · Priority: MEDIUM · Size: L

All air quality, thermostats, climate, humidity in one view.

### 5X-2.5 · "Lighting" Dashboard — `DONE` · Priority: MEDIUM · Size: L

All lighting and switches in one view.

### 5X-2.6 · Dashboard Config Flow (Subscribe/Unsubscribe) — `DONE` · Priority: HIGH · Size: M

Integration options flow that lets users select which dashboards to enable.

---

## Epic 4 · Life Support Dashboard Enhancements

#### 5X-LS-10 · Pluralization Fix — `DONE` · Priority: LOW · Size: S
"1 ZONES" → "1 ZONE". Singular/plural for all summary counts.
