# LCARS Dashboard — 4.x Backlog

> Stable branch (`4.0`). Non-breaking feature additions, bug fixes, and optimizations.
> Version: 4.17.1 (current)

---

## Status Key

| Tag | Meaning |
|-----|---------|
| `TODO` | Not started |
| `IN PROGRESS` | Active work |
| `BLOCKED` | Waiting on dependency |
| `DONE` | Shipped — listed for context until next release |

---

## Backlog

### 4X-7 · NUT (Network UPS Tools) Battery Panel Support — `TODO` · Priority: HIGH · Size: M

**GitHub Issue**: [#7](https://github.com/htiel/LCARS-lovelace-dashboard/issues/7)
**Spec**: None yet

Add NUT-monitored UPS devices (CyberPower, APC, Tripp Lite, Eaton, etc.) to the warp core battery panel. The existing battery detector checks for `device_class: battery` + `%` unit — NUT's "Battery charge" sensor matches this, but the panel's entity partition logic expects EcoFlow-style I/O power entities. NUT uses a different entity shape.

#### Rutherford's Reference Device

**Device**: CyberPower CP1500PFCRM2U (2U rackmount, 1500VA / 1000W PFC Sinewave)
**NUT identifier**: `CPS_CP1500PFCRM2U_XXXXXXXXXX` (serial redacted)
**HA device name**: "Ups" → entity prefix: `sensor.ups_*`
**Area**: `homelab` (server rack UPS)

#### Actual NUT Entities (from Rutherford's HA)

**Enabled entities** (user-facing — these drive the panel):

| Entity ID | Original Name | NUT Key | Device Class | Unit | Panel Mapping |
|-----------|--------------|---------|-------------|------|---------------|
| `sensor.ups_battery_charge` | Battery charge | `battery.charge` | `battery` | `%` | **SOC gauge** (warp core fill level) |
| `sensor.ups_load` | Load | `ups.load` | — | `%` | **Load indicator** — compute watts: `load% × nominal_real_power` |
| `sensor.ups_input_voltage` | Input voltage | `input.voltage` | `voltage` | `V` | **Telemetry** — grid input voltage |
| `sensor.ups_output_voltage` | Output voltage | `output.voltage` | `voltage` | `V` | **Telemetry** — output voltage |
| `sensor.ups_battery_runtime` | Battery runtime | `battery.runtime` | `duration` | `s` | **Telemetry** — estimated runtime (format to "Xh Ym") |
| `sensor.ups_status_data` | Status data | `ups.status` | — | — | **Status code** — raw NUT codes (OL, OB, LB, etc.) |
| `sensor.ups_status` | Status | `ups.status.display` | — | — | **Status badge** — human-readable ("Online", "On Battery") |
| `sensor.ups_low_battery_setpoint` | Low battery setpoint | `battery.charge.low` | — | `%` | Diagnostic — low battery threshold |

**Disabled-by-integration entities** (available if user enables):

| Entity ID | Original Name | NUT Key | Unit | Notes |
|-----------|--------------|---------|------|-------|
| `sensor.ups_battery_voltage` | Battery voltage | `battery.voltage` | `V` | Useful telemetry if enabled |
| `sensor.ups_nominal_real_power` | Nominal real power | `ups.realpower.nominal` | `W` | **Key**: 1000W — needed to compute actual watts from load% |
| `sensor.ups_nominal_battery_voltage` | Nominal battery voltage | `battery.voltage.nominal` | `V` | Reference voltage |
| `sensor.ups_nominal_input_voltage` | Nominal input voltage | `input.voltage.nominal` | `V` | Reference voltage |
| `sensor.ups_beeper_status` | Beeper status | `ups.beeper.status` | enum | `enabled`/`disabled`/`muted` |
| `sensor.ups_self_test_result` | Self-test result | `ups.test.result` | — | Test status |
| `sensor.ups_battery_manuf_date` | Battery manuf. date | `battery.mfr.date` | — | Battery age tracking |
| `sensor.ups_battery_chemistry` | Battery chemistry | `battery.type` | — | e.g., "PbAc" |
| `sensor.ups_warning_battery_setpoint` | Warning battery setpoint | `battery.charge.warning` | `%` | Warning threshold |
| `sensor.ups_low_battery_runtime` | Low battery runtime | `battery.runtime.low` | `s` | Low runtime threshold |
| `sensor.ups_load_restart_delay` | Load restart delay | `ups.delay.start` | `s` | Timer config |
| `sensor.ups_ups_shutdown_delay` | UPS shutdown delay | `ups.delay.shutdown` | `s` | Timer config |
| `sensor.ups_load_start_timer` | Load start timer | `ups.timer.start` | `s` | Timer config |
| `sensor.ups_load_shutdown_timer` | Load shutdown timer | `ups.timer.shutdown` | `s` | Timer config |

#### Key Differences: NUT vs EcoFlow

| Aspect | EcoFlow | NUT (CyberPower) |
|--------|---------|-------------------|
| Power in/out | Separate `*_in_power` / `*_out_power` entities (W) | No direct power entities — compute from `load%` × `nominal_real_power` |
| SOC | `*_battery_level_soc` | `*_battery_charge` (device_class: battery) |
| Charge state | `*_battery_charging_state` (charging/discharging/idle) | `*_status_data` — NUT codes: `OL`=online, `OB`=on battery, `CHRG`=charging, `LB`=low battery |
| Temperature | `*_battery_temperature` | **Not available** on CP1500PFCRM2U |
| Solar input | `*_solar_in_power` | N/A — UPS devices are grid-only |
| Multiple I/O ports | AC1-6 out, DC out, solar 1-2 in, PIO | Single AC input → single AC output |

#### NUT Status Code Mapping

| NUT Code | Meaning | Warp Core State | Color |
|----------|---------|----------------|-------|
| `OL` | Online (grid power) | Idle/fully powered | LCARS gray or green |
| `OL CHRG` | Online + Charging | Charging animation | LCARS light blue |
| `OB` | On Battery | Discharging animation | LCARS orange |
| `OB LB` | On Battery + Low Battery | Critical alert | LCARS dark orange / pulsing |
| `FSD` | Forced Shutdown | Emergency state | LCARS red |
| `OFF` | UPS is off | Inactive | LCARS dark gray |

**Implementation notes**:
- **Detection**: NUT devices already trigger battery detector (has `battery` dc + `%`). The issue is `_partitionBatteryEntities()` — it uses EcoFlow-specific `ioType` heuristics for power I/O that won't match NUT entity patterns.
- **Platform check**: Add `platform === "nut"` detection path in partition logic. NUT entities share a common `config_entry_id` and `device_id` per UPS device.
- **Power computation**: Since NUT doesn't expose real power entities, compute watts: `sensor.ups_load (%) × sensor.ups_nominal_real_power (W) / 100`. Show computed value as "Output: XXX W" in telemetry. If `nominal_real_power` is disabled, show load% only.
- **Partition updates**: Extend `_partitionBatteryEntities()` to recognize NUT patterns:
  - `battery.charge` unique_id suffix → SOC
  - `ups.load` → telemetry (show as `XX%` load, or computed watts if nominal power known)
  - `battery.runtime` → telemetry (format seconds → "Xh Ym")
  - `input.voltage` / `output.voltage` → telemetry
  - `ups.status.display` → badge text (replaces charge state label)
  - `ups.status` → charge/discharge animation state (parse OL/OB/CHRG/LB codes)
- **No I/O power partitioning**: NUT UPS is single-input/single-output — skip the multi-port power I/O visualization used for EcoFlow. Show a simplified "Grid → UPS → Load" power flow instead.
- **Runtime display**: Format `battery_runtime` seconds → "Xh Ym" for panel display
- **NUT buttons**: `test.battery.start.quick`, `beeper.enable/disable` — render as LCARS option strip controls if available (not present in Rutherford's entity registry, but other NUT devices may expose them)

**Acceptance criteria**:
- Rutherford's CyberPower CP1500PFCRM2U renders correctly with warp core visualization
- SOC gauge shows battery charge percentage from `sensor.ups_battery_charge`
- Status badge shows human-readable status from `sensor.ups_status`
- Power flow shows Grid→UPS→Load direction based on NUT status codes
- Load displayed as percentage (and computed watts if nominal power entity enabled)
- Battery runtime displayed as "Xh Ym" from `sensor.ups_battery_runtime`
- Input/output voltage displayed as telemetry sensors
- No regression for existing EcoFlow/Victron/Tesla battery devices
- Works with other NUT-compatible UPS brands (APC, Tripp Lite, Eaton) using same entity pattern

---

### 4X-8 · Climate Panel Visual Refresh — `TODO` · Priority: MEDIUM · Size: L

**GitHub Issue**: [#8](https://github.com/htiel/LCARS-lovelace-dashboard/issues/8)
**Spec**: Existing `specs/LCARS-CLIMATE-PANEL-SPEC/`

The climate panel is functionally complete (SVG arc, setpoint controls, HVAC/fan/preset mode strips, fault indicators) but looks plain compared to newer panels like power and environment. Refresh the visual treatment to match the LCARS polish level of the v4.16+ panels and fix several LCARS design compliance issues.

**Current state** (see screenshot): Basic SVG thin-stroke arc, flat rounded-pill mode buttons, tiny circular sensor indicators, viewscreen with right-angle corner brackets on a lavender-bleed background. The panel renders correctly but feels like a generic thermostat UI, not an LCARS console.

#### LCARS Compliance Fixes (Geordi)

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 1 | Viewscreen background bleeds lavender from HA theme — not LCARS `#000` | Critical | Add explicit `background: var(--lcars-black, #000)` to `.climate-viewscreen` |
| 2 | Mode buttons are symmetric rounded pills — LCARS buttons have one flat side, one rounded | Major | First button: `border-radius: 1.5rem 0 0 1.5rem`, middle: `0`, last: `0 1.5rem 1.5rem 0` — connected strip |
| 3 | Setpoint `−`/`+` buttons are `border-radius: 50%` circles — circles are not LCARS vocabulary | Major | Replace with LCARS endcap pill buttons (`3rem × 2.5rem`, one-sided radius) |
| 4 | SVG arc is thin 8px single-stroke — reads as generic gauge, not LCARS | Moderate | Segmented arc with `stroke-dasharray: 6 3` for discrete lit segments |
| 5 | Sensor dots (0.5rem circles) — LCARS uses short horizontal bars as status indicators | Minor | Replace with `2px × 1rem` vertical mini-bars |
| 6 | Viewscreen corner brackets are 2px right-angles — should use mini-elbows and thick→thin pattern | Moderate | Thicker brackets with mini-elbow corners, asymmetric border width (3px top/left, 1px bottom/right) |
| 7 | Font size on SVG temp readout (`42`) not mapped to LCARS 3-tier font scale | Minor | Map to `var(--lcars-font-size-title)` |

#### Visual Enhancements

**Temperature arc** (Wesley Approach A+B — segmented + dual-setpoint range):
- Replace thin stroke arc with `stroke-dasharray: 6 3` **segmented arc** — discrete lit segments like Main Engineering ring gauges
- Three SVG layers: (1) dim background ticks, (2) action-colored fill segments, (3) thin outer halo ring at 40% opacity
- Halo ring drifts when HVAC is active (`stroke-dashoffset` animation, 8s linear infinite), static when idle
- In `heat_cool` mode: render comfort band between `target_temp_low` / `target_temp_high` — ice below, sunflower in band, butterscotch above
- Animated `stroke-dashoffset` transition (800ms) on setpoint changes via `@property --arc-progress` (Baseline Widely Available)
- Current temp marker: 6px dot with 2px stroke ring, CSS transition on position

**Viewscreen treatment** — "Environmental Control Substation":
- Explicit `background: #000` — zero exceptions
- HVAC-action ambient radial glow: `radial-gradient` pseudo-element behind content at 12% opacity — butterscotch (heating), ice (cooling), transparent (idle/off). Transition 1s
- Scanline on mount: apply existing `lcars-scanline` keyframe via `firstUpdated()` — one-shot "power on" effect
- Asymmetric border: thick left/top, thin right/bottom per Bracer Jack Rule 2

**HVAC action dynamic feedback**:
- Frame border pulse: butterscotch breathe when heating, ice breathe when cooling — 2 new keyframes with `color-mix()` fallback via `@supports`
- Sensor indicator dots pulse in sync with frame when system is actively heating/cooling (reuse existing `lcars-zone-pulse` keyframe)
- Setpoint confirm flash: WAAPI `element.animate()` — scale(1.05) + gold text-shadow for 400ms, fire-and-forget (no class toggle cleanup)

**Mode strip** — connected LCARS button bar:
- First/last buttons bookend with rounded end, middle buttons flat — creates connected strip
- Traveling gold indicator bar under active mode — CSS `transform: translateX(var(--indicator-x))` driven by `updated()` lifecycle, 300ms ease-out transition
- Button press: existing `lcars-button-flash` keyframe ripple on `:active`

**Sensor readouts**:
- Replace circular dots with LCARS vertical bar indicators (mini-caps)
- Use `<lcars-sensor-row>` shared component for consistent formatting
- Use `<lcars-section-divider>` between reading groups instead of manual `.battery-section-divider`
- LCARS horizontal rule bars (0.375rem height, rounded end-cap) between viewscreen/modes/aux sections

**Multi-zone awareness** (3 Nest thermostats — Boimler, Mariner, Tendi floors):
- Compact 3-zone summary strip below sensor column — floor label + current temp, each colored by HVAC action
- Reads sibling `climate.*` entities from `hass.states` (read-only, no new API surface)
- Provides instant ship-wide thermal awareness at a glance

**24-hour temperature micro-heatmap** (stretch goal):
- 24 tiny squares showing hourly temp averages via HA `recorder/statistics_during_period` WS API
- Colored by `getTempColor()` — instant trend visualization
- Fetch once on `connectedCallback`, refresh every 30 minutes

#### WCAG 2.2 Accessibility

Preserve and enhance existing accessibility:
- Existing `role="meter"` on arc, `role="radiogroup"` on strips, `focus-visible` outlines — all correct
- Add `aria-label="${mode.replace('_', ' ')}"` on mode buttons (currently renders raw `heat_cool`)
- Setpoint wrapper: add `role="slider"` + `aria-valuemin`/`aria-valuemax`/`aria-valuenow` per APG slider pattern
- Maintain ≥24px target size on redesigned setpoint buttons (WCAG 2.5.8 AA)
- All new animations gated behind `@media (prefers-reduced-motion: no-preference)` via existing `sharedReducedMotion` module
- Ambient glow uses `inset` box-shadow so focus `outline` with `offset` remains unobstructed
- Segmented arc colors exceed 3:1 contrast vs black background (WCAG 1.4.11 non-text contrast)

#### Animation Budget

| Animation | Type | Duration | Trigger |
|-----------|------|----------|---------|
| Segmented arc fill | CSS transition (`stroke-dashoffset`) | 800ms | Temp change |
| Halo ring drift | CSS keyframe | 8s linear infinite | HVAC active |
| Frame border pulse | CSS keyframe × 2 (heat/cool) | `--lcars-anim-pulse` | HVAC active |
| Sensor dot pulse | Reuse `lcars-zone-pulse` | `--lcars-anim-pulse` | HVAC active |
| Setpoint confirm | WAAPI one-shot | 400ms | User input |
| Mode indicator slide | CSS transition | 300ms | Mode change |
| Viewscreen scanline | Reuse `lcars-scanline` | One-shot on mount | `firstUpdated()` |
| Button press flash | Reuse `lcars-button-flash` | 250ms | `:active` |

New keyframes: **2** (heat-pulse, cool-pulse). Reused: **3** (zone-pulse, scanline, button-flash). WAAPI: **1**. Total concurrent max: **3** (frame + dot + halo when active). Within budget.

**Estimated bundle addition**: ~1.5 KiB minified (core changes), ~3 KiB with zone summary + history pips.

**Acceptance criteria**:
- All 7 LCARS compliance violations fixed
- Viewscreen renders on pure black — no theme bleed-through
- Segmented arc with discrete lit segments replaces thin stroke arc
- Mode buttons form connected LCARS strip with proper endcap shapes
- HVAC action state immediately visible from across the room (frame pulse + ambient glow + arc color)
- All existing functionality preserved (setpoints, modes, faults)
- All animations respect `prefers-reduced-motion`
- WCAG 2.2 AA compliance maintained or improved
- No regression on 3 Nest thermostats (1st/2nd/3rd floor)

---

### 4X-9 · Pool & Spa Panel Visual Refresh — `TODO` · Priority: MEDIUM · Size: L

**GitHub Issue**: [#9](https://github.com/htiel/LCARS-lovelace-dashboard/issues/9)
**Spec**: Existing `specs/LCARS-POOL-SPA-PANEL-SPEC/`

The pool panel is functionally complete (dual body frames, chemistry readouts, pump/circuit controls, IntelliBrite lighting) but the body viewscreens are plain text displays and several spec'd visual features were never implemented. Additionally, Rutherford's WaterGuru SENSE chemistry data (pH, chlorine, alkalinity, hardness) is a separate HA device not currently surfaced in the panel.

**Current state** (see screenshot): Pool/spa bodies are bordered rectangles with large temp + circular −/+ setpoint controls. Circuit buttons are flat-sided pills (correct shape). Chemistry sensors are inline dot+text rows. No water caustic effects, no pump telemetry, no WaterGuru integration. The panel feels utilitarian — functional but not "Cetacean Ops."

**Rutherford's non-LCARS pool card** (inspiration): Rich dashboard showing Pentair controls, WaterGuru radial gauges for pH (7.7) and Free Chlorine (4.8 ppm) with green/yellow/red ranges, 24hr + 7-day temperature overlay charts (pool temp, WaterGuru temp, Tempest feels-like), freeze mode status, weather section, and WaterGuru diagnostics (cassette days remaining, battery %).

#### LCARS Compliance Fixes (Geordi)

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 1 | Setpoint `−`/`+` buttons are `border-radius: 50%` circles | Major | LCARS endcap pill buttons: decrement = rounded-left/flat-right, increment = flat-left/rounded-right |
| 2 | Viewscreen corner brackets are uniform 2px right-angles | Moderate | Asymmetric brackets (3px top/left, 1px bottom/right) with mini-elbow radius per Bracer Jack Rule 2 |
| 3 | `.sensor-label` at `0.75rem` — 4th font size outside LCARS 3-tier system | Minor | Use `var(--lcars-font-size-data)` |
| 4 | `.pool-body-temp` at `2.5rem` — unmapped font size | Minor | Map to `var(--lcars-font-size-title)` |
| 5 | Water caustic shimmer + particles specced (§5.3/§8) but never implemented | Moderate | Implement per spec — caustic radial gradients + CSS particle drift |
| 6 | Inner viewscreen frame uses uniform border vs outer panel's thick→thin | Moderate | Echo asymmetry: thick left/top, thin right/bottom |
| 7 | IntelliBrite lights are basic on/off toggles — spec §7 designed 22-color swatch strip | Major | Implement IntelliBrite color-mode selector with `screenlogic.set_color_mode` |

#### Visual Enhancements

**Water body viewscreens** — "Cetacean Ops observation windows" (Wesley):
- 3-layer CSS effect per viewscreen: (1) caustic shimmer — overlapping radial gradients at 6% opacity, 12s drift cycle, (2) surface ripple line — thin horizontal gradient band with sine-wave motion (`lcars-surface-ripple` 8s for pool, 5s for spa), (3) thermal gradient background — pool=ice at 4%, spa=butterscotch at 4%, intensifying to 8% when heating
- Pool: `--lcars-ice` frame, cool blue tint, slower ripple (calm water)
- Spa: `--lcars-butterscotch` frame, warm amber tint, faster ripple; when spa jets on, second ripple band at higher opacity (turbulence)
- Heating indicator bar below each viewscreen: 3px bar, static gray when off, flowing warm-gradient animation when heating (2s cycle)
- Setpoint buttons: LCARS endcap pills bracketing the target value (decrement rounded-left, increment flat-left)

**Chemistry visualization** — LCARS segmented bar indicators (Wesley):
- Replace dot+text rows with horizontal segmented bars per reading — 5–7 small rectangles (4px wide × 12px tall), filled segments colored by threshold, unfilled at 30% opacity
- Group into two sections: **BALANCE** (pH, alkalinity, hardness) and **SANITIZER** (chlorine/ORP)
- Threshold color coding: ice = optimal, sunflower = acceptable, tomato = alert
- Non-color redundancy: shape indicators (●/▲/✕) alongside segments for WCAG
- Chemistry threshold function in `lcars-color-utils.js`:

| Metric | Optimal | Acceptable | Alert |
|--------|---------|------------|-------|
| pH | 7.2–7.6 | 7.0–7.8 | < 7.0 / > 7.8 |
| Free Chlorine | 1.0–3.0 ppm | 0.5–5.0 ppm | < 0.5 / > 5.0 |
| Total Alkalinity | 80–120 ppm | 60–150 ppm | < 60 / > 150 |
| Calcium Hardness | 200–400 ppm | 150–500 ppm | < 150 / > 500 |
| ORP | 650–750 mV | 550–800 mV | < 550 / > 800 |
| Salt | 2700–3400 ppm | 2500–3600 ppm | < 2500 / > 3600 |

**Pump telemetry** — EPS conduit power display (Wesley):
- Each pump gets mini telemetry readout when running: three segmented bars for RPM, Watts, GPM
- RPM: `--lcars-ice`, Watts: `--lcars-sunflower` (→butterscotch > 2000W, →tomato > 3000W), GPM: `--lcars-bluey`
- Enhanced 6-segment ring spinner replacing 3-dot, speed proportional to RPM
- Extend pump spinner to all pump entities (not just primary)

**Freeze protection** — LCARS condition alert banner (Wesley):
- When `binary_sensor.*_freeze_mode` is `on`: FREEZE PROTECT badge in header (inverted colors), panel border pulses ice-blue, frost-edge gradient at top of each viewscreen
- When off: dim `FREEZE: NOMINAL` status line in controls column (confirms sensor connected)

**Circuit control grouping** (Wesley):
- Classify circuits by function: **WATER FEATURES** (waterfall, spillway, bubblers), **SPA** (air blower, spa jets), **UTILITY** (cleaner, pump)
- Section headings with active-count badge: `WATER FEATURES (1/3)`
- Pattern-match regex: `FEATURE_KEYS = /waterfall|spillway|bubbler|fountain/i`, `SPA_KEYS = /blower|spa|jet/i`

**Temperature trend** — delta arrow indicator (Wesley):
- Below each body temp: direction arrow (▲/▼/—) + delta + timeframe, e.g., `▲ +2° / 1HR`
- Color: rising = butterscotch, falling = ice, stable = disabled
- Data: HA `recorder/statistics_during_period` WS API, single call per body
- Stretch: 12-pip sparkline bar beneath temp (3px × 12 segments, 48px wide)

#### WaterGuru Cross-Device Integration

WaterGuru SENSE is a separate HA device (different `device_id`, platform: `waterguru`). Current panel only processes Pentair device group entities.

**Approach**: Add `linked_chemistry_device` config property for explicit cross-device entity injection.

**Rutherford's WaterGuru entities** (scrubbed):

| Entity Pattern | Reading | Unit | Panel Section |
|---------------|---------|------|---------------|
| `*_free_chlorine` | Free Chlorine | ppm | Chemistry — SANITIZER |
| `*_ph` | pH | — | Chemistry — BALANCE |
| `*_total_alkalinity` | Total Alkalinity | ppm | Chemistry — BALANCE |
| `*_calcium_hardness` | Calcium Hardness | ppm | Chemistry — BALANCE |
| `*_water_temperature` | Water Temperature | °F | Environmental (secondary to Pentair) |
| `*_chlorine_alert` | Chlorine Alert | — | Alert badge overlay on chlorine bar |
| `*_ph_alert` | pH Alert | — | Alert badge overlay on pH bar |
| `*_alkalinity_alert` | Alkalinity Alert | — | Alert badge overlay on alkalinity bar |
| `*_hardness_alert` | Hardness Alert | — | Alert badge overlay on hardness bar |
| `*_cassette_remaining` | Cassette Remaining | % | WaterGuru diagnostics footer |
| `*_cassette_days_remaining` | Days Remaining | days | WaterGuru diagnostics footer |
| `*_battery` | Battery | % | WaterGuru diagnostics footer |

**Implementation**:
- Extend `CHEM_KEYS` regex to include `chlorine|hardness` patterns
- Merge WaterGuru sensors into `chemistry[]` partition alongside any IntelliChem data
- Render WaterGuru diagnostics (cassette/battery) in a small footer section below chemistry
- Source badges: tiny `[P]` or `[W]` pill on each reading when both devices report
- When both report water temp: prefer Pentair (faster local push), show WaterGuru as verification

#### WCAG 2.2 Accessibility

| # | Issue | Fix |
|---|-------|-----|
| A1 | Environmental sensor lines lack `aria-label` | Add `aria-label="${name}: ${value}${unit}"` |
| A2 | No `aria-live` for state changes (pump on/off, chemistry alerts) | Add `<div aria-live="polite">` with `announcePoolChange()` |
| A3 | Light toggle buttons missing explicit `aria-label` | Add `aria-label="${name}: ${state}"` |
| A4 | Viewscreen `aria-label` doesn't include HVAC action | Append `, heat mode ${hvacAction}` |
| A5 | Sensor label font (0.75rem/12px) below comfortable reading size | Fix to `--lcars-font-size-data` |
| A6 | Chemistry threshold colors need non-color redundancy | Add shape indicators (●/▲/✕) per threshold state |

#### Animation Budget

| Animation | Type | Duration | Trigger |
|-----------|------|----------|---------|
| Caustic shimmer | CSS keyframe | 12s linear infinite | Always (per body) |
| Surface ripple | CSS keyframe | 8s (pool) / 5s (spa) | Always |
| Water particles (6 per body) | CSS keyframe | 6–10s each | Always |
| Heating indicator flow | CSS keyframe | 2s | `hvac_action === 'heating'` |
| Pump ring spinner | CSS keyframe | Proportional to RPM | Pump running |
| Freeze pulse | CSS keyframe | 3s | Freeze mode active |
| Button press flash | Reuse `lcars-button-flash` | 250ms | `:active` |

All gated behind `@media (prefers-reduced-motion: no-preference)`. Max concurrent when fully active: ~4 (caustic + ripple + particles + heating indicator). Within budget.

**Estimated bundle addition**: ~3 KiB (visual effects + chemistry bars), ~5 KiB with WaterGuru integration + pump telemetry.

**Acceptance criteria**:
- All 7 LCARS compliance violations fixed
- Water body viewscreens have caustic shimmer, surface ripple, and thermal gradient — feel like "observation windows"
- Pool = cool blue, Spa = warm amber — visually distinct at a glance
- Chemistry readings display as LCARS segmented bars with threshold coloring
- WaterGuru pH, chlorine, alkalinity, hardness integrated via cross-device config
- WaterGuru diagnostics (cassette remaining, battery) visible in footer
- Freeze protection prominently surfaced (alert banner when active, nominal confirmation when inactive)
- Pump telemetry (RPM/W/GPM) displayed when pumps are running
- Circuit controls grouped by function (Water Features / Spa / Utility)
- IntelliBrite swatch strip for pool/spa light color mode selection
- All existing functionality preserved
- All animations respect `prefers-reduced-motion`
- WCAG 2.2 AA compliance maintained or improved

---

### 4X-10 · Life Support / Environmental Systems Panel — `TODO` · Priority: MEDIUM · Size: XL

**GitHub Issue**: [#10](https://github.com/htiel/LCARS-lovelace-dashboard/issues/10)
**Spec**: None yet — see design notes below

A new room-level composite panel (`<lcars-lifesupport-panel>`) that aggregates **all environmental entities for a single area/room** into one unified view: thermostat (climate control), air purifier (atmospheric processing), and standalone temperature/humidity sensors (ambient monitoring). Think "Environmental Control Substation" — one console, everything that keeps you breathing and comfortable.

> *"Think of this as everything that keeps me breathing, and comfortable in my room."*

**Key constraint**: The atmoscrubber cylinder visualization is preserved exactly as-is. This panel does NOT replace the existing `<lcars-climate-panel>` or `<lcars-environment-panel>` — it's an additional panel type that users can configure for specific areas.

#### Why a New Panel

Current architecture renders panels per-device. SwitchBot temp/humidity sensors have no parent device panel — they're orphaned entities. This panel solves three problems:
1. Surfaces standalone temp/humidity sensors (SwitchBot meters) that currently have no dedicated panel
2. Provides room-level environmental awareness across multiple device types
3. Eliminates the need to mentally correlate separate climate + environment panels for the same room

#### Entity Landscape

**Rutherford's deployment** (rooms with environmental devices):
- Master Bedroom: Nest thermostat (2nd floor zone) + SwitchBot temp/humidity + BlueAir purifier
- Family Room: Nest thermostat (1st floor zone) + SwitchBot meter
- Children's rooms: SwitchBot meter only (no purifier, no dedicated thermostat)
- 14 SwitchBot temp/humidity meters across the house

**Developer's deployment**:
- Master Bedroom: Awair Element (CO₂/VOC/PM2.5/temp/humidity) + VeSync purifier
- Duncan's Room: Awair Element only (sensor-only)
- No thermostats in developer deployment

#### Architecture: Area-Level Entity Aggregation

Unlike existing per-device panels, this panel aggregates entities from **multiple devices** in the same HA area:

```
LifeSupportGroup {
  areaId, areaName

  // Substation A: Climate (0 or 1 thermostat)
  climateDevice → climate.*, thermostat sensors

  // Substation B: Atmoscrubber (0 or 1 air purifier)
  environmentDevice → fan, AQ sensors, controls

  // Ambient: Standalone sensors not tied to climate or environment devices
  ambientSensors → SwitchBot meters, additional temp/humidity entities
}
```

Discovery logic walks all entities in the configured area, classifies devices by existing `getDevicePanelType()` heuristic, and collects orphaned `temperature`/`humidity` device_class entities into the ambient bucket.

**Configuration**: Opt-in per area via dashboard config:
```yaml
life_support_areas:
  - area_id: master_bed
  - area_id: family_room
```

When configured, the homepage card renders ONE `<lcars-lifesupport-panel>` for that area instead of separate climate + environment panels.

#### Layout: Dual-Substation Horizontal Split (Geordi)

The panel uses a horizontal split when both climate and atmoscrubber substations are present — two dedicated zones side by side, like adjacent stations on an Engineering console. When only one substation is present, it expands to fill the full width.

**Master grid**:
```css
.life-support-content {
  display: grid;
  grid-template-areas:
    "climate   atmos"
    "ambient   ambient"
    "sparklines sparklines";
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr auto auto;
}
```

**Panel width**: 42rem for single-substation mode (same as existing panels), 56rem for dual-substation (each substation ~27rem). Below 56rem viewport: substations stack vertically via media query.

**Substation composition**: Each substation reuses the existing panel's render function via frameless child element composition:
```html
<lcars-lifesupport-panel>
  <lcars-climate-panel frameless .group=${climateGroup}></lcars-climate-panel>
  <lcars-environment-panel frameless .group=${envGroup}></lcars-environment-panel>
  <div class="ls-ambient-row">...</div>
  <div class="ls-sparkline-tray">...</div>
</lcars-lifesupport-panel>
```

This means zero duplication — child panels get their own shadow DOM/styles/lifecycle, and any future improvements to the individual panels automatically flow into the composite view.

#### Graceful Degradation — Four Configurations

| Config | Example Room | Layout |
|--------|-------------|--------|
| **Full**: thermostat + purifier + sensors | Rutherford's master bedroom | 2-column substations + ambient row + sparklines |
| **Atmos only**: purifier + sensors, no thermostat | Developer's master bedroom | Single-column atmoscrubber (identical to existing environment panel) |
| **Climate only**: thermostat + sensors, no purifier | Family room with Nest + SwitchBot | Single-column climate + ambient row + sparklines |
| **Sensors only**: standalone temp/humidity only | Children's room with SwitchBot | "Sensor hero" layout — large centered temp + humidity + battery + sparklines |

**Sensor hero layout** (sensors-only rooms): Temperature displayed at title tier (3.5rem) as the visual anchor, colored by comfort zone via existing `getTempColor()`. Humidity and battery below in data tier. No arc, no cylinder — just the essential readings, LCARS-styled.

#### Atmoscrubber Cylinder Preservation

The cylinder is preserved **exactly as-is**:
- Same 4rem wide pill shape, min-height 10rem, `border-radius: 2rem`
- Same 6-particle animation with `lcars-particle-float` keyframe
- Same AQI→HSL hue coloring on border + particles
- Same idle glow animation when fan is off
- Same grid position: `grid-area: core` in the atmoscrubber substation

In dual-substation mode, the atmoscrubber substation is structurally identical to the standalone `<lcars-environment-panel>`. The cylinder CSS, JS logic, and render functions are reused directly via composition.

#### Ambient Sensor Row

A full-width row below both substations showing room-level readings from standalone sensors (SwitchBot meters):
```
AMBIENT SENSORS
● SWITCHBOT  TEMP 71.8°F  HUM 47%  ▪▪▪▪▪▪▪▪░░ 82%
```
Uses `<lcars-sensor-row>` shared component. Battery level shown as LCARS segmented mini-bar. When multiple sensors report the same metric (Awair temp + SwitchBot temp + thermostat current_temperature), elect a primary source and show corroboration dots:
```
TEMP   72.1°   ●●○    ← 3 sources, 2 agree within ±1°
```

#### Adaptive Sparkline Tray

Single bottom row rendering 2–6 sparklines depending on available data:

| Slot | Metric | Color | Condition |
|------|--------|-------|-----------|
| 1 | Temperature | `--climate-action-color` | Always |
| 2 | Humidity | `--lcars-ice` | Always |
| 3 | AQI | `--atmos-quality-color` | If purifier or Awair present |
| 4 | PM2.5 | `--lcars-peach` | If available |
| 5 | CO₂ | `--lcars-sunflower` | If Awair/SCD40 present |
| 6 | VOC | `--lcars-african-violet` | If Awair/SGP present |

Reuses `fetchSparklineData()` from `lcars-sparkline.js`. 24-hour window, same caching.

#### Wesley's Creative Enhancements (Stretch Goals)

**Life Support Efficiency (LSE) score** — weighted comfort composite:
$$\text{LSE} = 0.40 \times C_{\text{temp}} + 0.30 \times C_{\text{humidity}} + 0.30 \times C_{\text{air}}$$
Each component scored 0–100 via trapezoidal membership function. Displayed as header badge (`LSE 94%`) in dynamic color. Drives cylinder particle speed (below 60% = scrubbers working harder, above 90% = gentle drift). Degrades gracefully when components unavailable.

**Room ambient tint** — CSS `background-image: radial-gradient()` overlay at ≤ 0.06 opacity. Butterscotch when heating, ice when cooling, faint green when all-nominal, faint red when AQI > 150. Uses `@property --ambient-tint` for smooth CSS transitions. Subtle enough to be felt not seen.

**Dual-Core Column** (alternative to side-by-side) — the cylinder gains a temperature gradient band along its right edge, functioning as a thermometer. Fill height = current temp in range, fill color tracks HVAC action. Cylinder body + particles still track AQI. One visualization, two systems. Requires Geordi sign-off on proportions.

**Atmospheric circulation indicator** — CSS-only rotating sweep of light around the cylinder perimeter (conic-gradient pseudo-element, 8s rotation). Speed increases with fan percentage. Invisible when fan is off.

**Mini sensor mesh** — tiny row of 3–5 tiles showing other rooms' temp/humidity at a glance. "Nearby sections" context — the bridge officer glances at adjacent decks.

#### WCAG 2.2 Accessibility

- All substation content inherits accessibility from child panels (climate: `role="meter"` on arc, `role="radiogroup"` on strips; environment: `role="meter"` on AQI, `aria-live` on state changes)
- Ambient sensor row: `aria-label="${sensorName}: ${value}${unit}"` on each reading
- Sensor hero (sensors-only mode): `role="status"` with `aria-live="polite"` for temperature updates
- LSE badge: `aria-label="Life Support Efficiency: ${score} percent"`
- All animations gated behind `@media (prefers-reduced-motion: no-preference)`
- Panel header: `role="heading" aria-level="3"` with area name

#### Dependencies

- 4X-8 (Climate Panel Visual Refresh) — climate substation benefits from the refreshed arc and mode strip
- Panel Extraction Architecture (`specs/LCARS-PANEL-EXTRACTION-ARCHITECTURE/`) — the `frameless` child panel composition pattern needs `LcarsBasePanel` to support suppressing its own frame
- `getDevicePanelType()` must be exposed for area-level entity classification
- HA area registry must be accessible from the frontend (already available via `hass.areas`)

#### Acceptance Criteria

- Rutherford's master bedroom renders correctly: Nest thermostat + SwitchBot meter + BlueAir purifier in one panel
- Developer's master bedroom renders correctly: Awair Element + VeSync purifier (no thermostat)
- Children's room renders correctly: SwitchBot meter only (sensor hero layout)
- Family room renders correctly: Nest thermostat + SwitchBot meter (no purifier)
- Atmoscrubber cylinder preserved with full particle animation and AQI coloring
- Climate arc and setpoint controls fully functional in composite view
- Ambient sensors displayed with source corroboration dots when multiple sources exist
- Sparkline tray adapts to available metrics (2–6 sparklines)
- No regression on existing standalone climate and environment panels
- Panel gracefully degrades across all four configurations
- All animations respect `prefers-reduced-motion`
- WCAG 2.2 AA compliance

---

## Wesley's Enhancement Ideas (Unscheduled)

Carried forward from 4.x archive. Creative enhancement ideas — not committed to a version.

### Environment Panel
- CSS `@property --aqi-hue` with `syntax: '<angle>'` — GPU-accelerated color interpolation for cylinder gradient
- AQI "alert condition" escalation: 0–50 "All clear" (green) → 150+ "Red alert" (frame pulses red)
- Optional Web Audio API ambient hum tied to fan speed. *Worf: AudioContext requires user gesture.*

### Floor Navigation
- View Transition API (`document.startViewTransition()`) — turbolift-style vertical slide between floors. Wrap in `prefers-reduced-motion`.

### Web API Adoption

| API | Baseline | Use | Priority |
|-----|----------|-----|----------|
| Popover API | Widely Available | Replace `lcars-popup.js` — zero-JS top layer, light-dismiss, focus trapping | HIGH |
| View Transition API | Widely Available | Area/floor switching crossfades, turbolift deck transitions | HIGH |
| Scroll-Driven Animations | Newly Available | Panels "power up" on scroll into viewport | MEDIUM |
| `text-wrap: balance` | Widely Available | Panel headers — prevent orphan words | LOW |
| CSS Anchor Positioning | Limited (Chrome 125+) | Future tooltips/popovers. Monitor. | EXPLORE |
| `field-sizing: content` | Newly Available | Config/search inputs auto-size | LOW |
