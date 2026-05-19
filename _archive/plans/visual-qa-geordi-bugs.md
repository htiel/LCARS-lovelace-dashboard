# LCARS Visual QA — Geordi La Forge Bug Report

**Audit date**: 2026-04-18
**Auditor**: Geordi La Forge (LCARS UI / Accessibility)
**Scope**: Visual design compliance, LCARS rule violations, accessibility, layout/styling bugs
**Homes inspected**: mariner's house (16 rooms), Boimler's house (23 rooms)

> **Note**: Entity classification bugs (wrong panel type rendered for a device) are
> catalogued here only when they cause a **visual design violation**. The root-cause
> entity-routing fixes are Data's responsibility.

---

## Re-Review Notes (2026-04-18)

Re-reviewed by Geordi with fresh perspective. Cross-referenced against Data's report
(`visual-qa-data-bugs.md`) and Wesley's report (`visual-qa-wesley-ideas.md`).

### Changes Made

| Action | Bug ID | Reason |
|--------|--------|--------|
| KEEP | GEORDI-001, 003, 006, 007, 008, 009, 014, 015, 016, 017, 018, 019, 021, 022, 024, 027, 028, 029, 030, 031 | Valid and well-described |
| REVISE | GEORDI-002 | Added cross-ref to DATA-002 (root cause) |
| REVISE | GEORDI-004, 005 | Added cross-ref to DATA-001 (root cause) |
| REVISE | GEORDI-010 | Reframed as visual impact only; entity classification is DATA-004 |
| REVISE | GEORDI-012 | Marked as duplicate visual manifestation of GEORDI-002 |
| REVISE | GEORDI-025, 026 | Noted as HA config issues, not code bugs |
| REMOVE | GEORDI-011 | Entity routing bug, not visual design — DATA-013 owns this |
| REMOVE | GEORDI-020 | Duplicate of GEORDI-001 |
| REMOVE | GEORDI-023 | Speculative — no actual inconsistency observed |
| ADD | GEORDI-032 | New: Sensor label standardization needed |

### Key Cross-References

- **Raw decimals**: GEORDI-001 (visual) ↔ DATA-008 (formatting root cause)
- **Illumination leakage**: GEORDI-004/005 (visual) ↔ DATA-001 (catch-all switch bug)
- **Empty atmoscrubber**: GEORDI-002 (visual) ↔ DATA-002 (hazard detector bug)
- **Camera diagnostics**: GEORDI-013 (visual) ↔ DATA-007 (filter root cause)
- **Media panels**: GEORDI-017 (visual) ↔ WESLEY-UX-004/IDEA-003 (UX solution)
- **Offline cameras**: GEORDI-015 (visual) ↔ WESLEY-UX-005/IDEA-002 (static effect)

---

## Severity Definitions

| Severity | Meaning |
|----------|---------|
| CRITICAL | Violates a core LCARS design tenet (Bracer Jack manifesto) or WCAG AA, broken UX |
| HIGH | Significant visual defect visible to every user, off-spec rendering |
| MEDIUM | Cosmetic inconsistency, minor spec deviation, or accessibility gap |
| LOW | Nit, polish item, or edge-case visual imperfection |

---

## GEORDI-001 — Raw Unformatted Decimal Values Displayed in Sensor Readouts

- **Severity**: CRITICAL
- **Home**: Both
- **Room(s)**: Boimler — Family Room, Garage, Outside, 3rd Floor
- **Panel type**: Environment (fan sensors), Ambient Sensors, Camera diagnostics
- **What's wrong**: Sensor values are rendered with full floating-point precision —
  e.g. `2.1594203...`, `0.6011987...`, `-2.74°F`, `-0.759999999999998°F`,
  `56.1379529460026°F`, `67.3054447465789°F`, `2.536232`, `2.826087`, `6.498017`,
  `Storage 2613487.599616 MB`, `Disk W 0.56208057 MB/S`. These raw decimals break
  the LCARS typographic grid, overflow their containers, and look completely
  un-Starfleet.
- **What it should look like**: Per the gallery and LCARS typography rules, sensor
  values should be rounded to a sensible precision: integers for whole-unit readings,
  1 decimal place for temperatures/percentages, and abbreviated units for large
  numbers (e.g. `2.6 GB`, `0.6 MB/S`). The `_friendlyName` / value rendering
  pipeline needs a centralized number formatter that respects `unit_of_measurement`
  and constrains decimal places.
- **LCARS rule**: Bracer Jack §6 — "Font size: exactly THREE sizes." Long decimal
  strings force either text shrink or overflow, violating the fixed-size data tier.
  TheLCARS.com — clean, minimal data presentation.
- **Source files**: `lcars-base-panel.js` (no centralized value formatter),
  `lcars-sensor-row` component, `lcars-environment-panel.js`, `lcars-power-panel.js`

---

## GEORDI-002 — Atmoscrubber Cylinder Rendered for Non-Air-Quality Devices

- **Severity**: CRITICAL
- **Home**: Boimler
- **Room(s)**: Tendi, Shaxs, Freeman ("Freeman"), Office, Rutherford, Master Bath, Master Bed
- **Panel type**: Life Support → Environment substation
- **What's wrong**: Ceiling fans, Nest Protects, smart outlets, and non-AQ devices
  are being rendered through the environment panel pipeline, producing an empty green
  atmoscrubber cylinder outline with no score value. The cylinder has a dashed/solid
  border in the device's default color, sits empty, and occupies significant visual
  space — it looks broken and ugly. Accompanying diagnostics dumps (Buzzer Test,
  Battery Health, Smoke Test, Speaker Test, PIR Test, Humidity Test, CO Test, WiFi
  Test, Replace By date, etc.) fill the sensor column with irrelevant data.
- **What it should look like**: Per the gallery, the atmoscrubber cylinder should
  ONLY appear for devices with AQ sensor data (PM2.5, VOC, CO₂, AQI score). If a
  device has no AQ data, the cylinder should be hidden entirely. Non-AQ devices
  should not be routed to the environment panel at all — but even if they are, the
  cylinder rendering should degrade gracefully: either show nothing or show a
  "NO DATA" label in the cylinder area.
- **LCARS rule**: Bracer Jack manifesto §3 — "Empty space is beautiful." A large
  empty green cylinder with no data is not beautiful, it's a broken instrument.
  Bracer Jack manifesto §5 — "Don't add decorative elements that interfere with
  function."
- **Cross-ref**: **DATA-002** — Root cause is hazard detector triggering on TP-Link
  Kasa diagnostic CO sensors. Data owns the entity classification fix.
- **Source files**: `panels/environment/lcars-environment-panel.js` (always renders
  `.atmoscrubber-container`), `panels/lifesupport/lcars-lifesupport-panel.js`
  (entity partitioning routes non-AQ devices to envGroup), `lcars-entity-utils.js`
  (classification logic)

---

## GEORDI-003 — Label Truncation Cutting Off Critical Information (Pool WaterGuru)

- **Severity**: HIGH
- **Home**: Boimler
- **Room(s)**: Pool
- **Panel type**: Environment / Galley sensor rows
- **What's wrong**: WaterGuru chemical readings are truncated with ellipsis:
  "Water ...", "Calcium Har...", "Cyanuric Ac...", "Free Chlori...",
  "Total Alkali...", "Total Hardn...". The user cannot read what any of these
  sensor labels mean without clicking into each one.
- **What it should look like**: Labels should either: (a) use abbreviated forms
  that fit (e.g. `CA HARDNESS`, `CYA`, `FREE CL`, `TOTAL ALK`, `TOTAL HARD`),
  or (b) the sensor label column should have a wider min-width for panels with
  long chemical names, or (c) use `text-wrap: balance` and allow 2-line labels.
  The gallery shows labels like "PM2.5", "CO₂", "VOC" — short by design. When
  real-world labels are longer, the layout must accommodate them.
- **LCARS rule**: WCAG 3.3.2 (Labels or Instructions) — truncated labels fail to
  identify the input/reading. Bracer Jack §6 — only three font sizes, but the
  current truncation is worse than a slightly smaller font; it removes meaning
  entirely.
- **Source files**: `.sensor-label` CSS in `lcars-environment-panel-styles.js`
  (`white-space: nowrap; overflow: hidden; text-overflow: ellipsis`)

---

## GEORDI-004 — Irrigation Zones Leaking Into Illumination "Circuits" Section

- **Severity**: HIGH
- **Home**: mariner
- **Room(s)**: Back Yard
- **Panel type**: Illumination Control
- **What's wrong**: Rachio irrigation zone switches (Front Side Yard, Front Lawn,
  Backyard by Main Gate, Standby, Rain Delay, etc.) appear as "circuits" in the
  Illumination Control panel. This is a visual design issue because the
  Illumination panel's sunflower-framed layout, designed for light circuits, now
  contains 16+ irrigation toggles that clutter the panel and confuse the user.
  The panel header shows "0/16 ON" which is misleading — it counts irrigation
  zones as "lights."
- **What it should look like**: The Illumination panel should only contain entities
  classified as lighting. Irrigation switches belong exclusively in the Irrigation
  panel (ice-framed, per gallery). The badge count should reflect only actual
  lights.
- **LCARS rule**: TheLCARS.com layout structure — panels have specific functional
  domains. Bracer Jack color theory — the sunflower (warm/lighting) frame color
  conveys a specific semantic meaning. Putting irrigation data inside a lighting
  frame violates color semantics.
- **Cross-ref**: **DATA-001** — Root cause is catch-all switch absorption in
  `_partitionLightingEntities()`. Data owns the entity classification fix.
- **Source files**: `lcars-illumination-panel.js` (`_partitionLightingEntities`),
  `lcars-entity-utils.js` (`isLightingEntity` classifier)

---

## GEORDI-005 — Non-Lighting Entities Leaking Into Illumination "Circuits" (Garage)

- **Severity**: HIGH
- **Home**: mariner
- **Room(s)**: Garage
- **Panel type**: Illumination Control
- **What's wrong**: "Battery Auto-Heating Enabled", "DC Mode", and "Workspace"
  entities appear as circuits in the Garage Illumination panel. These are battery
  management switches, not lighting circuits.
- **What it should look like**: Same as GEORDI-004 — only lighting entities in the
  Illumination panel.
- **LCARS rule**: Same as GEORDI-004.
- **Cross-ref**: **DATA-001** — Same root cause as GEORDI-004. Also **DATA-020** for
  EcoFlow platform missing from PLATFORM_PANEL_MAP.
- **Source files**: Same as GEORDI-004.

---

## GEORDI-006 — UNAVAILABLE Atmoscrubber Visual Is Unclear (Dashed Orange Outline)

- **Severity**: HIGH
- **Home**: mariner
- **Room(s)**: Duncan's Room
- **Panel type**: Life Support → Environment substation
- **What's wrong**: When all AQ sensors (VOC, CO₂, PM2.5) report UNAVAILABLE,
  the atmoscrubber cylinder renders as a dashed orange outline that is mostly
  empty. The UNAVAILABLE state is shown in red text in the sensor column, but
  the cylinder itself gives no clear visual indication that the device is offline.
  It just looks like a half-rendered graphic.
- **What it should look like**: The UNAVAILABLE state for the atmoscrubber should
  follow the established LCARS pattern for offline systems: the cylinder border
  should be `--lcars-gray` (disabled color), the score area should show "—" or
  "OFFLINE", and the cylinder should use a subtle distress pulse animation
  (matching the `panel-distress` keyframes already in the codebase). Red
  UNAVAILABLE text in the sensor rows is correct, but the cylinder must match.
- **LCARS rule**: Bracer Jack — flat colors, no ambiguous visual states. LCARS
  color theory — gray = disabled/offline. The orange outline on an unavailable
  device contradicts the color semantics.
- **Source files**: `panels/environment/lcars-environment-panel.js`
  (`_getAQColor` returns `'var(--lcars-ice)'` for null AQI, not gray),
  `lcars-environment-panel-styles.js` (`.atmoscrubber` border styling)

---

## GEORDI-007 — Identical Circuit Names in Power Panel (Pool Equipment)

- **Severity**: HIGH
- **Home**: Boimler
- **Room(s)**: Pool
- **Panel type**: Power Systems
- **What's wrong**: All 8 sub-circuits show the identical name "POOL EQUIPMENT"
  with no differentiation. The user cannot tell which circuit is which. This
  creates a wall of identical tiles that is both unusable and visually monotonous.
- **What it should look like**: Per the gallery's Power Panel example, each circuit
  tile should have a unique descriptive name (Kitchen, Server Room, Washer, Dryer,
  etc.). When the underlying entity names are identical, the panel should fall back
  to appending a numeric suffix ("POOL EQUIPMENT 1", "POOL EQUIPMENT 2") or
  display the entity_id suffix.
- **LCARS rule**: WCAG 2.4.6 (Headings and Labels) — labels must be descriptive.
  WCAG 1.3.1 (Info and Relationships) — identical labels for different controls
  fails programmatic determinability. Bracer Jack §4 — "Buttons within a frame
  must be uniform" does NOT mean identical labels; it means uniform *appearance*.
- **Source files**: `panels/power/lcars-power-panel.js` (`_friendlyName` or name
  resolution), `lcars-base-panel.js` (`_shortenName`)

---

## GEORDI-008 — Duplicate/Redundant Circuit Entries in Power Panel (Laundry)

- **Severity**: MEDIUM
- **Home**: Boimler
- **Room(s)**: Laundry
- **Panel type**: Power Systems
- **What's wrong**: Duplicate entries showing "-- Dryer 0W" — the same circuit
  appears more than once, with a leading "--" prefix that looks like a rendering
  artifact.
- **What it should look like**: Each circuit should appear exactly once. Leading
  dashes should be stripped from display names. Zero-watt circuits should use
  `--lcars-gray` color and "STANDBY" label per the power panel spec.
- **LCARS rule**: TheLCARS.com — clean, minimal data. Bracer Jack manifesto §3 —
  "Empty space is beautiful." Duplicate entries waste space.
- **Source files**: `panels/power/lcars-power-panel.js` (deduplication logic),
  `lcars-base-panel.js` (`_shortenName` not stripping `--` prefix)

---

## GEORDI-009 — Generic/Unfriendly Circuit Names in Power Panel (Garage)

- **Severity**: MEDIUM
- **Home**: Boimler
- **Room(s)**: Garage
- **Panel type**: Power Systems
- **What's wrong**: Circuit names show raw internal identifiers:
  `VUEG3_MAINLOAD1`, `VUEG3_MAINLOAD2`, `BALANCE`. These are not
  human-readable LCARS labels.
- **What it should look like**: Circuit names should be humanized. If no
  friendly_name is available, the panel should at least strip common prefixes
  and format to title case: "MAIN LOAD 1", "MAIN LOAD 2", "BALANCE".
- **LCARS rule**: LCARS typography — all text is uppercase and human-readable.
  Raw identifier strings violate the clean typographic aesthetic.
- **Source files**: `panels/power/lcars-power-panel.js`, `lcars-base-panel.js`
  (`_friendlyName`)

---

## GEORDI-010 — Fridge Rendered as Climate Panel with Arc at Extreme Cold

- **Severity**: MEDIUM *(visual impact only — entity classification is DATA-004)*
- **Home**: Boimler
- **Room(s)**: Kitchen (5°F Kitchen Refrigerator), Garage (34°F Garage Refrigerator)
- **Panel type**: Life Support → Climate substation
- **Visual impact**: Refrigerators rendered through the climate panel show a
  temperature arc designed for HVAC comfort ranges (55°F–84°F). A 5°F reading pins
  the arc to the extreme cold end, making it look broken. The HVAC-style arc,
  setpoint controls, and mode strip (OFF/HEAT/COOL/AUTO) are inappropriate for an
  appliance. The arc's `getTempColor` shows `--lcars-blue` for <55°F — correct for
  "dangerously cold room" but wrong for "working fridge."
- **Visual mitigation** (if entity routing can't be fixed): The climate panel could
  detect appliance-range temperatures (<40°F) and render a linear gauge instead of
  the comfort arc.
- **LCARS rule**: Bracer Jack §5 — "Don't add decorative elements that interfere
  with function."
- **Cross-ref**: **DATA-004** — Root cause is GE Home refrigerators classified as
  climate instead of galley. Data owns the entity classification fix.
- **Source files**: `panels/climate/lcars-climate-panel.js`

---

## ~~GEORDI-011 — Wrong Room Name Displayed in Panel (Master Bath → Kitchen Table Light)~~

**REMOVED**: This is an entity routing/data bug, not a visual design violation.
The root cause is HA entity area assignment or device-area inheritance.
See **DATA-013** for cross-room entity leakage analysis.

---

## GEORDI-012 — Smart Outlet Rendered as Life Support with Empty Atmoscrubber

- **Severity**: HIGH *(duplicate visual manifestation of GEORDI-002)*
- **Home**: Boimler
- **Room(s)**: Master Bed ("Master Bed Side Outlet" showing CO Status)
- **Panel type**: Life Support → Environment substation
- **What's wrong**: A KP200 smart outlet is rendered through the Life Support
  pipeline, showing "CO Status: OFF" and an empty green atmoscrubber cylinder.
  The diagnostics section shows "KP200-MASTERBEDOUTLET2" and "Restart: UNKNOWN"
  in red. A power outlet has no business in Life Support.
- **What it should look like**: Outlet devices should appear in the Power panel or
  as simple toggle circuits. The empty atmoscrubber and CO Status readout from a
  power outlet is visually confusing and wastes precious panel space.
- **LCARS rule**: Same as GEORDI-002.
- **Cross-ref**: This is another instance of **GEORDI-002** / **DATA-002** — TP-Link
  Kasa diagnostic CO sensor triggering hazard classification.
- **Source files**: Same as GEORDI-002.

---

## GEORDI-013 — Massive Diagnostics Dump Overflowing Camera Panel

- **Severity**: HIGH
- **Home**: Boimler
- **Room(s)**: Outside (Garage Side Entrance Camera)
- **Panel type**: Camera / Environment
- **What's wrong**: The camera panel displays a massive diagnostics dump:
  PM1/PM2.5/PM10 with raw decimals, Storage in MB (2613487.599616), Disk Write
  speed, recording modes, overlay settings. This is clearly a camera with an
  environmental sensor that has leaked all its diagnostic attributes into the
  visible sensor list. The panel becomes a wall of irrelevant data.
- **What it should look like**: Camera panels should show: live feed, motion
  status, signal strength — per the gallery camera panel example. Environmental
  sensors attached to the same device should be routed to a separate environment
  panel. Diagnostic/config entities should be hidden by default (the base panel
  already filters `entity_category === 'diagnostic'` in
  `_getDeviceCategoryEntities`, but these appear to be bypassing that filter).
- **LCARS rule**: Bracer Jack manifesto §3 — "Empty space is beautiful." A wall
  of 20+ diagnostic attributes is the opposite of the LCARS aesthetic.
  Roddenberry's original vision — minimal panel activity conveys advanced tech.
- **Source files**: `panels/camera/lcars-camera-panel.js`, entity partitioning

---

## GEORDI-014 — UNAVAILABLE States Using Red (Tomato) for Non-Alert Conditions

- **Severity**: MEDIUM
- **Home**: Both
- **Room(s)**: Multiple — Server Room (IPC-Model), Game Room (Ender 3 Cam Motion),
  Boimler's Family Room (Diagnostics UNKNOWN), multiple rooms (Restart UNKNOWN)
- **Panel type**: Various
- **What's wrong**: "UNAVAILABLE" and "UNKNOWN" sensor states are rendered in
  `--lcars-tomato` (#ff5555) — the Red Alert color. For diagnostic attributes
  like "Restart: UNKNOWN" or "Adopt Device: UNAVAILABLE", this creates false
  urgency. The user's eye is drawn to multiple red indicators that don't
  represent actual problems — just unconfigured or irrelevant features.
- **What it should look like**: Per the alarm panel spec and LCARS color theory:
  - **UNAVAILABLE** on *operational* sensors (temperature, motion) → `--lcars-tomato`
    (correct — the sensor is supposed to work)
  - **UNAVAILABLE/UNKNOWN** on *diagnostic/config* attributes → `--lcars-gray`
    (disabled — it's informational, not an emergency)
  - The `getStateColor` function in `lcars-color-utils.js` currently treats ALL
    unavailable/unknown as `var(--lcars-alert)` regardless of entity category.
- **LCARS rule**: Bracer Jack color theory §4 — "4 colors: Each color MUST have
  assigned meaning." Red = emergency. Using red for non-emergency states dilutes
  its meaning and creates alert fatigue.
- **Source files**: `lcars-color-utils.js` (`getStateColor` — line 1: `if
  (s === 'unavailable' || s === 'unknown') return 'var(--lcars-alert)'`)

---

## GEORDI-015 — Viewscreen Offline State Lacks Visual Distinction

- **Severity**: MEDIUM
- **Home**: Both
- **Room(s)**: mariner — Server Room (Bread Cam), Back Yard (G6 Instant);
  Boimler — Master Bath, Ender-3 room
- **Panel type**: Camera / Viewport
- **What's wrong**: "Viewscreen Offline" cameras show a generic text message
  but no visual treatment that immediately conveys the camera is non-functional.
  The panel frame doesn't change color, and the viewscreen area is just dark with
  small text.
- **What it should look like**: Per the existing codebase animations
  (`panel-distress` keyframes), offline viewscreens should have: (a) the camera
  frame border pulsing between frame color and gray, (b) the viewscreen area
  showing a scanline or static effect, and (c) a prominently-sized "OFFLINE"
  label in `--lcars-gray`. The gallery camera panel shows "ESTABLISHING LINK"
  with an animated pulse — the offline state should be equally distinctive but
  convey failure rather than pending.
- **LCARS rule**: System 47 reference — LCARS displays have distinct visual
  states for online, connecting, and offline. A blank dark rectangle doesn't
  communicate state.
- **Source files**: `panels/camera/lcars-camera-panel.js`,
  `lcars-homepage-card.js` (`.camera-frame[data-state="offline"]`)

---

## GEORDI-016 — Sparse Rooms Show Mostly Empty Content Area

- **Severity**: LOW
- **Home**: mariner
- **Room(s)**: Kitchen, Dining Room, Quinn's Room
- **Panel type**: Illumination Control (sole panel)
- **What's wrong**: Rooms with only one or two entities show a single small
  Illumination panel with vast empty black space below. While "empty space is
  beautiful" per Bracer Jack, a room page with 90% emptiness feels abandoned
  rather than elegant.
- **What it should look like**: For rooms with minimal entities, consider:
  (a) a centered layout that fills more of the viewport, or (b) room-level
  ambient decoration (subtle starfield, grid pattern at very low opacity) to
  make the empty space intentional rather than accidental.
- **LCARS rule**: Bracer Jack manifesto §3 — "An LCARS frame with blank space
  but functional borders is ideal." The key phrase is "functional borders" —
  the current empty space has no framing elements to make it intentional.
- **Source files**: `lcars-homepage-card.js` (room content layout)

---

## GEORDI-017 — Three Identical Media Panels in One Room (Master Bedroom)

- **Severity**: LOW
- **Home**: mariner
- **Room(s)**: Master Bedroom
- **Panel type**: Media
- **What's wrong**: Three separate media panels (Left, Right, Master Bedroom
  AppleTV) all in Standby state with identical music note icons create visual
  repetition. Three identical-looking panels stacked vertically is visually
  monotonous and wastes vertical scroll space.
- **What it should look like**: When multiple media players are in the same
  room and all in standby/idle, consider: (a) collapsing them into a single
  compact strip showing all three names, or (b) a consolidated media panel
  that shows a row per player (like the gallery's illumination panel shows
  a row per light). Standby panels should be visually compact.
- **LCARS rule**: Bracer Jack manifesto §3 — "Simplicity is the Omega state."
  Three identical idle panels is the opposite of simplicity.
- **Source files**: `panels/media/lcars-media-panel.js` (no consolidation mode)

---

## GEORDI-018 — Alarm Panel "DISARMED" Using Warm Red/Salmon Background

- **Severity**: MEDIUM
- **Home**: Boimler
- **Room(s)**: Family Room (Tactical: DISARMED with red/tomato background)
- **Panel type**: Alarm / Tactical
- **What's wrong**: The DISARMED state is showing with a red/tomato-tinted
  background. Per the alarm panel spec (§2 Color Mapping), DISARMED should use
  `--lcars-ice` (#99ccff) — cool blue — representing "all stations secure, ship
  at peace." Red/tomato is reserved for TRIGGERED state only.
- **What it should look like**: DISARMED = ice blue frame and badge.
  The current red treatment makes a safe state look dangerous.
- **LCARS rule**: Alarm Panel Spec §2 — explicit color mapping table.
  Bracer Jack color theory — colors must have consistent semantic meaning.
- **Source files**: `panels/alarm/lcars-alarm-panel.js` (`getAlarmStateColor`
  should return `var(--lcars-ice)` for disarmed — verify the actual state value
  being passed)

---

## GEORDI-019 — WCAG Target Size Violation on Alarm Keypad Buttons

- **Severity**: MEDIUM
- **Home**: Boimler
- **Room(s)**: Family Room, Front Foyer (any room with alarm keypad)
- **Panel type**: Alarm
- **What's wrong**: The alarm keypad grid uses `3.5rem` height buttons in a
  `repeat(3, 3.5rem)` grid — approximately 56px × 56px which meets WCAG 2.5.8
  (24×24 minimum). However, the gap between buttons is only `var(--lcars-gap)`
  (0.25rem = 4px). For a security-critical input, the touch targets should have
  MORE generous spacing to prevent mis-taps, especially under stress (alarm
  arming/disarming countdown).
- **What it should look like**: Increase keypad gap to at least 0.5rem (8px).
  The gallery keypad uses `gap: 0.375rem` which is better but still tight.
  For a security panel, 0.5rem minimum.
- **LCARS rule**: WCAG 2.5.8 Target Size (Minimum) (AA) — while the buttons
  themselves meet 24×24, the spacing between them should ensure no accidental
  activation of adjacent targets. Microsoft Inclusive Design — solve for
  permanent disability (one arm), extend to situational (holding a child
  while disarming alarm).
- **Source files**: `panels/alarm/lcars-alarm-panel-styles.js` or
  `lcars-homepage-card.js` (`.alarm-digit-grid` gap)

---

## ~~GEORDI-020 — Ambient Sensor Values with Excessive Decimal Precision~~

**REMOVED**: Duplicate of **GEORDI-001**. Same root cause (missing centralized
number formatter), same fix.

---

## GEORDI-021 — WeatherFlow/Weather Panel Shows UNAVAILABLE Without Graceful Degradation

- **Severity**: MEDIUM
- **Home**: Boimler
- **Room(s)**: Outside (Grandbridge Tempest UNAVAILABLE), Utility (WeatherFlow Hub UNAVAILABLE with red frame)
- **Panel type**: Weather
- **What's wrong**: When the weather station is UNAVAILABLE, the weather panel
  shows a red frame and empty content. There's no "STATION OFFLINE" message,
  no last-known data, no visual indication of what the panel is supposed to show.
- **What it should look like**: The weather panel should degrade gracefully:
  show the panel frame in `--lcars-gray`, display "STATION OFFLINE" in the
  condition viewscreen area, and optionally show cached last-known readings
  in gray. The gallery weather panel shows a full layout — the offline state
  should maintain the layout skeleton with gray/disabled styling.
- **LCARS rule**: LCARS always shows the frame structure even when data is
  unavailable. Bracer Jack — "An LCARS frame with blank space but functional
  borders is ideal."
- **Source files**: `panels/weather/lcars-weather-panel.js` (missing UNAVAILABLE
  handling in `renderContent`)

---

## GEORDI-022 — Irrigation Panel Shows "OFFLINE" Controller Without Visual Treatment

- **Severity**: MEDIUM
- **Home**: Boimler
- **Room(s)**: Outside (Flume Sensor IDLE, Controller OFFLINE), Garage (Rachio 3 OFFLINE)
- **Panel type**: Irrigation
- **What's wrong**: The irrigation controller shows OFFLINE status but the panel
  frame and zone list remain in their normal active styling. An offline controller
  should visually communicate that no zones can be activated.
- **What it should look like**: When controller is OFFLINE: frame color should
  shift to `--lcars-gray`, zone controls should show as disabled (gray background),
  and the badge should show "OFFLINE" instead of "IDLE".
- **LCARS rule**: LCARS color semantics — gray = disabled/offline.
- **Source files**: `panels/irrigation/lcars-irrigation-panel.js`

---

## ~~GEORDI-023 — Inconsistent Panel Frame Border Thickness Across Panel Types~~

**REMOVED**: Speculative. The codebase correctly implements asymmetric borders
(`border-left: 4px`, `border-bottom: 4px`, `border-top: 2px`, `border-right: 2px`)
per LCARS thick→thin rule. While the environment panel does have its own frame
CSS, no actual rendering inconsistency was observed. If inconsistency is found
later, re-file with specific evidence.

---

## GEORDI-024 — Diagnostic Sensor Rows Missing Entity Category Suppression

- **Severity**: MEDIUM
- **Home**: Boimler
- **Room(s)**: Shaxs (Nest Protect dump), Tendi, Rutherford, Master Bath, Master Bed
- **Panel type**: Life Support → Environment substation
- **What's wrong**: Diagnostic-category entities (Buzzer Test, Battery Health,
  Smoke Test, Speaker Test, PIR Test, Humidity Test, CO Test, WiFi Test, LED
  Test, Replace By date, etc.) are displayed as regular sensor rows in the main
  sensor column. The base panel has `_getDeviceCategoryEntities` that properly
  separates diagnostic entities, and the environment panel renders them under a
  "DIAGNOSTICS" divider — but there are TOO MANY. A Nest Protect has 15+
  diagnostic attributes that flood the panel.
- **What it should look like**: Diagnostic sections should be collapsed by
  default with a "SHOW DIAGNOSTICS" expand button, showing only the top 3-5
  most relevant items. Full diagnostics available on tap/expand.
- **LCARS rule**: Bracer Jack manifesto §3 — "Empty space is beautiful."
  Roddenberry — minimal panel activity. 15 diagnostic rows is the opposite
  of minimal.
- **Source files**: `panels/environment/lcars-environment-panel.js`
  (diagnostics rendering — no collapse/limit)

---

## GEORDI-025 — Upstairs Bathroom Label Styling: "Link Color 100%"

- **Severity**: LOW *(HA configuration issue)*
- **Home**: mariner
- **Room(s)**: Upstairs Bathroom
- **Panel type**: Illumination Control
- **What's wrong**: The light circuit label "Link Color 100%" is a raw entity
  attribute name, not a user-friendly label. "Link Color" doesn't mean anything
  to a non-technical user.
- **What it should look like**: Light entity names should use `friendly_name`
  from HA. If the friendly_name IS "Link Color", it should be cleaned up in HA
  entity configuration, but the dashboard shouldn't expose raw attribute names.
- **LCARS rule**: LCARS typography — all labels should be meaningful and human-
  readable.
- **Note**: This is primarily a Home Assistant entity naming issue, not a
  dashboard code bug. The user should rename this entity in HA.
- **Source files**: `lcars-base-panel.js` (`_friendlyName`)

---

## GEORDI-026 — Room Name Mismatch: "Freeman" Room Shows "Freeman" Entities

- **Severity**: LOW *(HA configuration issue)*
- **Home**: Boimler
- **Room(s)**: Freeman
- **Panel type**: Illumination, Life Support
- **What's wrong**: The room is named "Freeman" but entities inside show
  "Freeman Light", "SB Motion - Freeman", "Freeman's Ceiling Fan". This is a
  HA configuration issue (room was renamed but entities weren't updated), but
  it creates visual confusion on the dashboard.
- **What it should look like**: Entity display names should match the room
  context. The `_shortenName` function should strip the room prefix — but if
  the entity says "Freeman" and the room is "Freeman", the prefix stripping
  won't match, so the full "Freeman Light" is shown instead of just "Light".
- **LCARS rule**: WCAG 2.4.6 (Headings and Labels) — consistent naming.
- **Note**: This is a Home Assistant entity naming issue, not a dashboard code
  bug. The user should update entity friendly_names after renaming areas.
  Cross-ref: **DATA-015** documents the same issue.
- **Source files**: `lcars-base-panel.js` (`_shortenName` — prefix must match
  area name to strip)

---

## GEORDI-027 — Volume at 100% on Media Panel Without Visual Warning

- **Severity**: LOW
- **Home**: Boimler
- **Room(s)**: Back Porch (Media IDLE, volume 100%)
- **Panel type**: Media
- **What's wrong**: The volume slider shows 100% without any visual distinction
  from lower volumes. Per the gallery, the volume fill bar should use a warning
  color at extreme volumes (e.g. >90% → `--lcars-butterscotch` or
  `--lcars-tomato`) to prevent accidental blast-volume playback.
- **What it should look like**: Volume fill bar changes color at thresholds:
  0-70% = `--lcars-african-violet` (normal), 71-90% = `--lcars-sunflower`
  (caution), 91-100% = `--lcars-butterscotch` (warning).
- **LCARS rule**: LCARS data presentation — colors convey meaning. A flat
  100% volume reading with no visual distinction is a missed opportunity for
  semantic color encoding.
- **Source files**: `panels/media/lcars-media-panel.js` (volume rendering)

---

## GEORDI-028 — Pool Panel: Pentair Equipment Names Need Humanization

- **Severity**: LOW
- **Home**: Boimler
- **Room(s)**: Outside (Pool/Spa panel)
- **Panel type**: Pool/Spa
- **What's wrong**: "Pentair: 1F-3C-25 OFF" is shown as a device name in the
  Life Support panel. The hex address is meaningless to users.
- **What it should look like**: Device names containing hex addresses or serial
  numbers should use the device model name or a generic "POOL CONTROLLER"
  label. The `_shortDeviceName` function should strip MAC/hex patterns.
- **LCARS rule**: LCARS typography — clean, human-readable labels.
- **Source files**: `lcars-base-panel.js` (`_shortDeviceName`)

---

## GEORDI-029 — Focus Visibility Not Verified on Dynamic Panel Content

- **Severity**: MEDIUM
- **Home**: Both
- **Room(s)**: All
- **Panel type**: All
- **What's wrong**: While the codebase correctly implements `:focus-visible`
  outlines with `2px solid var(--lcars-ice)` and `outline-offset: 2px` (meeting
  WCAG 2.4.13 AAA), this has not been verified on dynamically rendered content
  like: expandable diagnostic sections, quick-run irrigation builders, alarm
  countdown transitions, and sensor row click targets. Some sensor rows use
  `tabindex="0"` for keyboard access but others (environment panel sensor rows
  rendered via `<lcars-sensor-row>`) may not propagate focus styles correctly
  through the Shadow DOM boundary.
- **What it should look like**: Every interactive element must show a visible
  focus indicator when navigated via keyboard. This needs systematic keyboard
  testing across all panel types.
- **LCARS rule**: WCAG 2.4.7 Focus Visible (AA), WCAG 2.4.13 Focus Appearance
  (AAA), WebAIM keyboard testing guide.
- **Source files**: All panel JS files, `components/lcars-sensor-row/`

---

## GEORDI-030 — Sensor Row Indicator Dots May Be Below WCAG Non-Text Contrast

- **Severity**: MEDIUM
- **Home**: Both
- **Room(s)**: All
- **Panel type**: All panels with sensor rows
- **What's wrong**: The `.sensor-indicator` dots are 0.5rem × 0.5rem (8px)
  colored circles on a black background. While most LCARS palette colors meet
  3:1 contrast against black, the `--lcars-gray` (#666688) indicator used for
  OFF/disabled states has a contrast ratio of approximately 3.7:1 against black
  — which barely passes. The dot size of 8px means it's a small graphical
  object where contrast perception is harder.
- **What it should look like**: Verify all indicator dot colors meet WCAG 1.4.11
  Non-text Contrast (3:1 minimum) against black. Consider increasing the dot
  size to 10px for disabled states or using a ring/outline treatment instead of
  a filled circle for better visibility.
- **LCARS rule**: WCAG 1.4.11 Non-text Contrast (AA).
- **Source files**: Palette definitions in `lcars-styles.js`, `.sensor-indicator`
  in panel styles

---

## GEORDI-031 — `prefers-reduced-motion` Compliance Not Verified for All Animations

- **Severity**: LOW
- **Home**: Both
- **Room(s)**: All
- **Panel type**: All
- **What's wrong**: The codebase has a `@media (prefers-reduced-motion: reduce)`
  rule in `lcarsBaseStyles` that sets `transition-duration` and
  `animation-duration` to `0.01ms`. However, some animations are defined in
  component-specific stylesheets or inline styles that may not inherit this
  override. Specifically: atmoscrubber rotation (`--scrubber-speed`), irrigation
  barberpole flow, alarm countdown pulse, and camera viewscreen activation may
  bypass the global reduced-motion rule.
- **What it should look like**: Every animation in every panel must respect
  `prefers-reduced-motion`. The shared `sharedReducedMotion` import is used by
  most panels, but component-level CSS animations need verification.
- **LCARS rule**: WCAG 2.3.3 Animation from Interactions (AAA), The A11Y
  Project checklist — animation section.
- **Source files**: `lcars-shared-animations.js`, all panel style files

---

## GEORDI-032 — Sensor Labels Need Canonical Short-Form Standardization (NEW)

- **Severity**: MEDIUM
- **Home**: Both
- **Room(s)**: All rooms with environment/ambient sensors
- **Panel type**: Environment, Life Support, Ambient Sensors
- **What's wrong**: Sensor labels vary in format and length across panels. The
  gallery shows canonical short labels: `PM2.5`, `CO₂`, `VOC`, `Temp`, `Humidity`.
  But the dashboard displays full entity names like "Particulate Matter 2.5",
  "Carbon Dioxide", "Volatile Organic Compounds", "Temperature", which then
  truncate inconsistently: "Particulate M...", "Carbon Dio...", etc.
  (see GEORDI-003 for Pool WaterGuru truncation).
- **What it should look like**: The dashboard should normalize sensor labels to
  canonical scientific/LCARS abbreviations:
  - `PM2.5`, `PM10`, `PM1` (not "Particulate Matter 2.5 Microns")
  - `CO₂` (not "Carbon Dioxide") — use subscript ₂ character
  - `VOC` (not "Volatile Organic Compounds")
  - `AQI` (not "Air Quality Index")
  - `TEMP` or `°F` (not "Temperature")
  - `RH` or `%` (not "Humidity" — or just the % symbol)
  - For pool: `CA HARD`, `CYA`, `FREE CL`, `TOTAL ALK` (not full chemical names)
  This requires a label normalization map keyed by `device_class` and
  `unit_of_measurement`.
- **LCARS rule**: Gallery reference — all sensor labels in the gallery panels
  use short canonical forms. Bracer Jack §6 — "three font sizes only" — long
  labels force text shrinkage. LCARS aesthetic — data should be dense, readable,
  and instantly scannable.
- **Source files**: Need new `lcars-label-utils.js` or extend `lcars-base-panel.js`
  with `_canonicalLabel(state)` method

---

## Summary

| Severity | Count | Key Themes |
|----------|-------|------------|
| CRITICAL | 2 | Raw decimals in readouts, empty atmoscrubber on non-AQ devices |
| HIGH | 5 | Entity leaking, label truncation, camera diagnostics overflow |
| MEDIUM | 9 | Graceful degradation, color semantics, accessibility, sensor labels |
| LOW | 6 | Sparse rooms, naming, volume warning, reduced-motion |
| REMOVED | 3 | GEORDI-011 (routing bug), GEORDI-020 (duplicate), GEORDI-023 (speculative) |
| **Active Total** | **22** | |

### Top 5 Highest-Impact Fixes (ROI)

1. **GEORDI-001** — Centralized number formatter (fixes raw decimals everywhere)
2. **GEORDI-002** — Atmoscrubber visibility guard (fixes empty cylinders in 8+ rooms)
   *— blocked by DATA-002 entity classification fix*
3. **GEORDI-014** — Entity-category-aware color resolver (fixes false red alerts)
4. **GEORDI-003/032** — Label truncation + canonical labels (fixes Pool, WaterGuru, all sensors)
5. **GEORDI-004/005** — Entity classifier refinement (fixes irrigation/battery leak)
   *— blocked by DATA-001 entity classification fix*

### Cross-Team Dependencies

| Geordi Bug | Blocked By | Owner |
|------------|------------|-------|
| GEORDI-002, 012 | DATA-002 (hazard detector) | Data |
| GEORDI-004, 005 | DATA-001 (switch catch-all) | Data |
| GEORDI-010 | DATA-004 (galley classifier) | Data |
| GEORDI-013 | DATA-007 (camera filter) | Data |
