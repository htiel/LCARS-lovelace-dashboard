# LCARS Dashboard — 4.x Backlog

> Stable branch (`4.0`). Non-breaking feature additions, bug fixes, and optimizations.
> Version: 4.18.8 (current stable)

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

### 4X-8 · Climate Panel Visual Refresh — `DONE` · Priority: MEDIUM · Size: L

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

#### 5x Prep Embedded in This Item

| Prep Item | What | Enables |
|-----------|------|---------|
| **4X-12** Floor/area hierarchy utilities | Extract `_getFloorAreaIds()` into shared `lcars-hierarchy-utils.js` — multi-zone awareness needs sibling areas on same floor | 5.x Floor → Area → Entity hierarchical layouts in every domain dashboard |

---

### 4X-9 · Pool & Spa Panel Visual Refresh — `DONE` · Priority: MEDIUM · Size: L

**GitHub Issue**: [#9](https://github.com/htiel/LCARS-lovelace-dashboard/issues/9)
**Spec**: Existing `specs/LCARS-POOL-SPA-PANEL-SPEC/`

The pool panel is functionally complete (dual body frames, chemistry readouts, pump/circuit controls, IntelliBrite lighting) but the body viewscreens are plain text displays and several spec'd visual features were never implemented. Additionally, Rutherford's WaterGuru SENSE chemistry data (pH, chlorine, alkalinity, hardness) is a separate HA device not currently surfaced in the panel.

**Current state** (see screenshot): Pool/spa bodies are bordered rectangles with large temp + circular −/+ setpoint controls. Circuit buttons are flat-sided pills (correct shape). Chemistry sensors are inline dot+text rows. No water caustic effects, no pump telemetry, no WaterGuru integration. The panel feels utilitarian — functional but not "Cetacean Ops."

**Rutherford's non-LCARS pool card** (inspiration): Rich dashboard showing Pentair controls, WaterGuru radial gauges for pH (7.7) and Free Chlorine (4.8 ppm) with green/yellow/red ranges, 24hr + 7-day temperature overlay charts (pool temp, WaterGuru temp, Tempest feels-like), freeze mode status, weather section, and WaterGuru diagnostics (cassette days remaining, battery %). look in inspiration folder for png

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

#### 5x Prep Embedded in This Item

| Prep Item | What | Enables |
|-----------|------|---------|
| **4X-14** Cross-device entity injection (`linkedEntities`) | Formalize WaterGuru integration pattern into general `linkedEntities` property on `LcarsBasePanel` | 5.x panels receiving entities from multiple devices/areas |
| **4X-16** `<lcars-segmented-bar>` component | Shared threshold-colored bar for chemistry readings (pH, chlorine, alkalinity, RPM, watts) | Reusable across every 5.x dashboard (power load bars, CO₂ bars, signal bars) |

---

### 4X-10 · Life Support / Environmental Systems Panel — `DONE` · Priority: MEDIUM · Size: XL

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

#### 5x Prep Embedded in This Item

| Prep Item | What | Enables |
|-----------|------|---------|
| **4X-13** Entity query utility (`lcars-entity-query.js`) | Extract `_getAreaEntities/_groupEntities` into shared module with `queryEntities(hass, { areaIds?, domains?, deviceClasses? })` | Every 5.x dashboard — cross-area queries become a parameter change, not an architecture change |
| **4X-15** Panel data model: `entities` collection | Add `entities` (array) and `devices` (plural) properties to `LcarsBasePanel` alongside `group` | 5.x panels receive cross-area entity collections without needing a device |
| **4X-17** `classifyArea()` function | Area-level panel detection returning `Set<PANEL_TYPE_*>` — determines composite panels (life_support, illumination) per area | 5.x dashboard-level classification — same pattern at broader scope |
| **4X-18** Domain/device_class filter predicates | `createDomainFilter()`, `createDeviceClassFilter()`, `isLightingEntity()` composable predicates in `lcars-entity-utils.js` | 5.x dashboard entity filters become declarative one-liners |
| **4X-19** `LcarsBasePanel` frame-mode property | `frame-mode` attribute: `standard` (default), `nested` (header only, no borders), `header-only` (compact) — per Geordi's review | 5.x dashboard layouts embed panels without double-framing |
| **4X-21** Panel dispatch registry | Replace `_renderDevicePanel()` switch with `Map<panelType, factory>` — factory function pattern per Geordi | 5.x dashboards register panel types without touching orchestrator code |

---

### 4X-11 · Illumination Control Panel — `DONE` · Priority: MEDIUM · Size: L

**GitHub Issue**: [#11](https://github.com/htiel/LCARS-lovelace-dashboard/issues/11)
**Spec**: None yet

A new `<lcars-illumination-panel>` that aggregates all lighting entities (lights, dimmers, switches controlling lights) for an area into a dedicated LCARS control panel. Currently, lights and switches render as generic domain controls (toggle pills with brightness bars) scattered across device groups. This panel gives lighting its own dedicated console — "Computer, lights."

> In-universe: The Illumination Control subsystem manages all interior lighting for a section of the ship, accessible from any LCARS console. Crew can adjust individual fixtures, set scene presets, or dim an entire deck section from one interface.

#### Problem

- Lights and switches are the most common entities but have no dedicated panel
- They render as small toggle pills mixed in with other device controls
- No unified view of a room's lighting state
- No brightness overview at a glance — you can't tell which lights are dim vs full
- Dimmers show a tiny 3rem brightness bar that's hard to read or interact with
- No scene support (HA `scene` domain) in the current rendering
- Light groups (`light.group`) treated identically to individual lights

#### Supported Entity Types

| Domain | Device Class / Type | Panel Feature |
|--------|-------------------|---------------|
| `light` | Any (dimmable) | Toggle + brightness slider + optional color temp |
| `light` | Color (RGB/HS/XY) | Toggle + brightness + color wheel or preset swatches |
| `light` | Group | Aggregate toggle + brightness for group members |
| `switch` | (lighting circuits) | Toggle on/off — no dimming |
| `input_boolean` | (lighting automations) | Toggle on/off |
| `scene` | (room scenes) | One-tap scene activation buttons |

#### Entity Detection

Lights are straightforward (`domain === 'light'`), but switches that control lighting circuits need heuristic identification. Proposed detection:

```javascript
function isLightingSwitch(entry) {
  const eid = entry.entity?.entity_id || '';
  const name = (entry.state?.attributes?.friendly_name || '').toLowerCase();
  // Explicit light device_class
  if (entry.state?.attributes?.device_class === 'outlet') return false;
  // Name-based heuristics
  return /light|lamp|sconce|chandelier|pendant|fixture|dimmer|illuminat/i.test(name) ||
         /light|lamp|sconce|chandelier/i.test(eid);
}
```

Scenes associated with an area are included if `scene.*` entities exist in the area, or if their entity_id/name contains the area name.

#### Layout Design

**Primary grid**: Lights displayed as horizontal bars (not tiny pills). Each bar spans the full panel width, showing name + state + brightness level as a fill bar.

```
╔═══════════════════════════════════════════════════╗
║ ILLUMINATION CONTROL — MASTER BEDROOM   3/5  ON  ║
╠═══════════════════════════════════════════════════╣
║                                                   ║
║  ● CEILING     ━━━━━━━━━━━━━━━━━━━━━░░░░░  80%  ║
║  ● BEDSIDE L   ━━━━━━━━━░░░░░░░░░░░░░░░░  35%  ║
║  ● BEDSIDE R   ━━━━━━━━━░░░░░░░░░░░░░░░░  35%  ║
║  ○ CLOSET      ━━━░░░░░░░░░░░░░░░░░░░░░░  OFF  ║
║  ○ BATHROOM    ━━━░░░░░░░░░░░░░░░░░░░░░░  OFF  ║
║                                                   ║
║  ─────── SCENES ──────────────────────────────── ║
║  [ BRIGHT ]  [ RELAX ]  [ MOVIE ]  [ SLEEP ]    ║
║                                                   ║
║  ─────── CIRCUITS ────────────────────────────── ║
║  ● PORCH LIGHT                              ON   ║
║  ○ ENTRY LIGHT                              OFF  ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
```

**Sections** (rendered in order):
1. **Dimmable lights** — full-width brightness bars with toggle + slider
2. **Scenes** — horizontal strip of scene activation buttons (LCARS endcap pills)
3. **Switch circuits** — simple on/off rows for non-dimmable lighting switches

**Badge**: `3/5 ON` — active count / total count

**Frame color**: `var(--lcars-sunflower)` — warm light, distinguishes from other panels

#### Brightness Bar Design

Each light gets a full-width horizontal bar:
- Left: status indicator dot (gold=on, gray=off)
- Center: entity name (shortened via `_friendlyName()`)
- Right: brightness percentage or OFF
- Background: fill bar proportional to brightness (0–100%), colored by color temperature if available (warm amber → cool white)
- Click the bar → toggle light on/off
- Click the percentage → open brightness slider popover (or inline expand)
- Long-press / right-click → HA more-info dialog

```css
.illumination-bar {
  display: flex;
  align-items: center;
  height: 2.5rem;
  padding: 0 0.75rem;
  border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
  background: linear-gradient(
    to right,
    var(--bar-color, var(--lcars-sunflower)) var(--brightness, 0%),
    rgba(255,255,255,0.05) var(--brightness, 0%)
  );
  cursor: pointer;
  transition: --brightness 300ms ease;
}
```

#### Color Temperature Visualization

For lights with `color_temp` or `color_temp_kelvin`:
- Bar fill color shifts from warm amber (`--lcars-butterscotch`) at 2000K to cool white (`--lcars-ice`) at 6500K
- Uses `color-mix()` or a linear gradient mapped to the color temp range
- No color picker wheel for v1 — just temperature-aware bar coloring

#### Scene Strip

Scenes render as a horizontal row of LCARS endcap buttons:
- Active scene (if detectable): gold highlight
- Tap activates the scene via `scene.turn_on`
- Scene names stripped of area prefix via existing `_friendlyName()`
- Overflow: horizontal scroll with fade mask (same pattern as power panel truncation)

#### Graceful Degradation

| Room Contents | Layout |
|--------------|--------|
| 3+ dimmable lights + scenes | Full panel: brightness bars + scene strip |
| 1–2 dimmable lights, no scenes | Compact panel: brightness bars only |
| Switches only, no dimmable lights | Switch list with simple toggles |
| Single light | Minimal: one bar, no dividers |

#### Dependencies

- Panel Extraction Architecture — extends `LcarsBasePanel`
- `lcars-entity-utils.js` — needs new `PANEL_TYPE_ILLUMINATION` constant and detector
- `lcars-homepage-card.js` — needs dispatch case in `_renderDevicePanel()`
- Detection challenge: lights are per-device, but this panel is per-area (similar to 4X-10 Life Support). May need area-level aggregation or a simpler "largest light group in area" heuristic

#### Open Questions

1. **Area-level vs device-level**: Should this aggregate ALL lights in an area (like Life Support), or render per light-group device? Area-level is more useful but requires the same aggregation pattern as 4X-10.
2. **Color light support**: Full RGB color picker is complex. Defer to v2? Just show current color as the bar tint for v1?
3. **Adaptive Lighting / Circadian integration**: Some users run Adaptive Lighting. Should the panel show the current adaptive state?
4. **Light groups vs individual**: When a `light.group` exists alongside its member lights, show both or deduplicate?

#### Acceptance Criteria

- All `light` domain entities in an area rendered with brightness bars
- Dimmable lights show interactive brightness level (click to toggle, slider to adjust)
- Non-dimmable switches shown as simple on/off rows
- Scenes (if present) rendered as activation button strip
- Badge shows active/total light count
- Color temperature reflected in bar fill color when available
- Frame color: sunflower (warm light aesthetic)
- Keyboard accessible (tab to bars, Enter to toggle, arrow keys for brightness)
- All animations respect `prefers-reduced-motion`
- WCAG 2.2 AA compliance
- No regression on existing generic light/switch rendering for non-panel areas

#### 5x Prep Embedded in This Item

| Prep Item | What | Enables |
|-----------|------|---------|
| **4X-18** Domain/device_class filter predicates | `isLightingSwitch()` heuristic + composable filter predicates (shared with 4X-10) | 5.x Lighting dashboard entity filter is a one-liner |
| **4X-20** `<lcars-summary-badge>` component | Reusable status badge: `3/5 ON`, `1847 W` — `role="status"` + `aria-live="polite"` | 5.x dashboard summary bars composed from badge components |

---

## 5x Prep Items (Standalone)

> These items are independent prep work that doesn't naturally embed into a feature item above.
> Label: `5x-prep`

### 4X-12 · Floor/Area Hierarchy Utilities — `DONE` · Priority: MEDIUM · Size: S

**GitHub Issue**: [#12](https://github.com/htiel/LCARS-lovelace-dashboard/issues/12)
**Label**: `5x-prep`

Extract `_getFloorAreaIds()` from `lcars-homepage-card.js` into shared `lcars-hierarchy-utils.js`. New functions: `getFloors(hass)`, `getFloorAreas(hass, floorId)`, `getAreasByFloor(hass)` (returns `Map<floorId, area[]>`).

**Fits into**: 4X-8 (multi-zone awareness reads sibling areas on same floor) but small enough to do standalone.

**Enables**: 5.x Floor → Area → Entity hierarchical layouts in every domain dashboard (5X-2.2 through 5X-2.5).

**Geordi note**: Pure data utility — no render imports. Include floor sort order.

**Acceptance criteria**:
- `lcars-hierarchy-utils.js` exports `getFloors`, `getFloorAreas`, `getAreasByFloor`
- Existing `_getFloorAreaIds()` in homepage card becomes thin wrapper
- No behavioral change to existing area rendering

---

### 4X-13 · Entity Query Utility — `DONE` · Priority: HIGH · Size: M

**GitHub Issue**: [#13](https://github.com/htiel/LCARS-lovelace-dashboard/issues/13)
**Label**: `5x-prep`

Extract entity resolution from `_getAreaEntities()` / `_groupEntities()` in `lcars-homepage-card.js` into shared `lcars-entity-query.js`. New function: `queryEntities(hass, { areaIds?, floorIds?, domains?, deviceClasses?, excludeCategories? })`.

**Fits into**: 4X-10 (Life Support needs multi-device area query) — implement during 4X-10.

**Enables**: Every 5.x dashboard. Security = `queryEntities(hass, { domains: ['lock','camera','alarm_control_panel'] })`. Cross-area becomes a parameter, not an architecture change (5X-2.0 through 5X-2.5).

**Geordi note**: Cache must be externally injected (no module-level singleton). Multiple dashboard instances in 5.x would collide.

**Acceptance criteria**:
- `lcars-entity-query.js` exports `queryEntities(hass, opts, cache?)`
- Existing `_getAreaEntities(areaId)` becomes `queryEntities(hass, { areaIds: [areaId] }, this._entityCache)`
- Domain and device_class filtering works correctly
- No behavioral change to existing entity resolution

---

### 4X-14 · Cross-Device Entity Injection (`linkedEntities`) — `DONE` · Priority: MEDIUM · Size: S

**GitHub Issue**: [#14](https://github.com/htiel/LCARS-lovelace-dashboard/issues/14)
**Label**: `5x-prep`

Add `linkedEntities` property to `LcarsBasePanel` — an array of external entities merged into the panel's working set. Merge happens in computed getter, not `updated()`.

**Fits into**: 4X-9 (WaterGuru cross-device pattern) — implement during 4X-9.

**Enables**: 5.x panels aggregating entities from many devices/areas.

**Geordi note**: Linked entities must carry `_linked: true` provenance flag for optional source indicators. Same visual treatment as native entities — no `aria-hidden`.

**Acceptance criteria**:
- `LcarsBasePanel.linkedEntities` property merges with panel's own entities
- Provenance flag `_linked: true` on injected entries
- Pool panel uses it for WaterGuru entities
- No effect on panels that don't set `linkedEntities`

---

### 4X-15 · Panel Data Model: `entities` Collection — `DONE` · Priority: HIGH · Size: M

**GitHub Issue**: [#15](https://github.com/htiel/LCARS-lovelace-dashboard/issues/15)
**Label**: `5x-prep`

Add `entities` (Array) and `devices` (plural) properties to `LcarsBasePanel` alongside existing `group`. When `entities` is set, panel uses that. When `group` is set, works as today. Fallback: if `entities` absent, derive from `group.entities`.

**Fits into**: 4X-10 (Life Support spans multiple devices) — implement during 4X-10.

**Enables**: 5.x panels receive cross-area entity collections (5X-2.2 Security, 5X-2.3 Power, etc.).

**Geordi note**: `group` must remain functional throughout 5.x for backward compatibility. Don't force all 10 existing panels to migrate simultaneously.

**Acceptance criteria**:
- `LcarsBasePanel` has `entities` and `devices` properties
- `_getPanelName()` / `_getPanelCode()` have fallbacks when `group.device` absent
- Existing panels (using `group`) see zero behavioral change
- Life Support panel uses `entities` / `devices` properties

---

### 4X-16 · `<lcars-segmented-bar>` Shared Component — `DONE` · Priority: MEDIUM · Size: S

**GitHub Issue**: [#16](https://github.com/htiel/LCARS-lovelace-dashboard/issues/16)
**Label**: `5x-prep`

Horizontal segmented bar component for threshold-colored level indicators. Props: `value`, `min`, `max`, `segments`, `thresholds` (array of `{ value, color }`), `label`.

**Fits into**: 4X-9 (chemistry bars, pump telemetry) — implement during 4X-9.

**Enables**: Reusable across every 5.x dashboard — power load bars, CO₂ levels, signal strength.

**Geordi rules** (mandatory):
- **NO gradients** — Bracer Jack Rule 1. Solid-color adjacent blocks only
- `role="meter"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-label`
- Text value readout alongside bar (WCAG 1.4.1 Use of Color)
- End cap: `border-radius: var(--lcars-endcap)` on rightmost segment only
- Empty segments: `var(--lcars-gray)` at reduced opacity
- Min touch target height: 24px (WCAG 2.5.8)

**Acceptance criteria**:
- `<lcars-segmented-bar>` renders threshold-colored segments
- Chemistry readings in pool panel use the component
- Pump telemetry bars use the component
- ARIA meter role with proper attributes
- No gradients, flat color segments only

---

### 4X-17 · `classifyArea()` Function — `DONE` · Priority: HIGH · Size: M

**GitHub Issue**: [#17](https://github.com/htiel/LCARS-lovelace-dashboard/issues/17)
**Label**: `5x-prep`

Add `classifyArea(hass, areaId, entityEntries)` to `lcars-entity-utils.js`. Returns `Set<PANEL_TYPE_*>` of area-level composite panel types (e.g., `PANEL_TYPE_LIFE_SUPPORT`, `PANEL_TYPE_ILLUMINATION`). Homepage card checks area-level panels first, claims entities, then classifies remaining per-device.

**Fits into**: 4X-10 and 4X-11 — implement during 4X-10.

**Enables**: 5.x dashboard-level classification at broader scope.

**Risk**: Medium — changes render dispatch path. Entities claimed by area-level panels must not double-render in device panels. Mitigation: area-level panels return consumed entity IDs.

**Acceptance criteria**:
- `classifyArea()` returns `Set<string>` of panel types
- New constants: `PANEL_TYPE_LIFE_SUPPORT`, `PANEL_TYPE_ILLUMINATION`
- `_renderAreaContent()` checks area-level panels before device-level
- No double-rendering of entities
- No regression on existing per-device panel rendering

---

### 4X-18 · Domain/Device_Class Filter Predicates — `DONE` · Priority: MEDIUM · Size: S

**GitHub Issue**: [#18](https://github.com/htiel/LCARS-lovelace-dashboard/issues/18)
**Label**: `5x-prep`

Add composable filter factory functions to `lcars-entity-utils.js`:
- `createDomainFilter(domains)` — returns predicate `(entry) => domains.has(entry.domain)`
- `createDeviceClassFilter(classes)` — returns predicate
- `createCompositeFilter(...predicates)` — OR composition
- Named predicates: `isLightingEntity()`, `isSecurityEntity()`, `isClimateEntity()`

**Fits into**: 4X-10 (partition entities into climate/environment/ambient) and 4X-11 (`isLightingSwitch()` heuristic).

**Enables**: 5.x dashboard definitions become declarative: `SECURITY_FILTER = createCompositeFilter(createDomainFilter(['lock','camera']), ...)` (5X-2.2 through 5X-2.5).

**Acceptance criteria**:
- Filter factory functions exported from `lcars-entity-utils.js`
- Named predicates for lighting, security, climate entity detection
- Used by 4X-10 and 4X-11 panels

---

### 4X-19 · `LcarsBasePanel` Frame-Mode Property — `DONE` · Priority: HIGH · Size: S

**GitHub Issue**: [#19](https://github.com/htiel/LCARS-lovelace-dashboard/issues/19)
**Label**: `5x-prep`

Add `frame-mode` attribute to `LcarsBasePanel` with three values:
- **`standard`** (default): Full `<lcars-panel-frame>` with borders (current behavior)
- **`nested`**: No outer border, keeps header bar (name + line + code) — preserves panel identity within parent frame
- **`header-only`**: Header bar only, no borders, no corner brackets — tightly packed layouts

**Fits into**: 4X-10 (climate/environment panels embedded as substations in Life Support) — implement during 4X-10.

**Enables**: 5.x dashboard layouts embedding existing panels without double-framing (5X-2.2 through 5X-2.5).

**Geordi note**: Rename from Wesley's `frameless` to `frame-mode`. The frame IS LCARS visual grammar — preserving semantic structure and header maintains identity. `role="region"` + `aria-label` persist regardless of frame mode.

**Acceptance criteria**:
- `frame-mode="standard"` behaves identically to current behavior
- `frame-mode="nested"` suppresses borders, keeps header
- `frame-mode="header-only"` minimal chrome
- ARIA roles persist in all modes
- Life Support panel uses `nested` for child climate/environment panels

---

### 4X-20 · `<lcars-summary-badge>` Shared Component — `DONE` · Priority: MEDIUM · Size: S

**GitHub Issue**: [#20](https://github.com/htiel/LCARS-lovelace-dashboard/issues/20)
**Label**: `5x-prep`

Reusable badge component. Props: `label`, `value`, `total`, `color`, `icon`. Renders as `3/5 ON` or `1847 W`. Composable in horizontal strip for multi-stat summaries.

**Fits into**: 4X-11 (badge: `3/5 ON`), 4X-10 (LSE score badge), 4X-8 (multi-zone summary strip).

**Enables**: 5.x dashboard summary bars: `"3 DOORS OPEN | 2 CAMERAS ACTIVE | ALL LOCKS SECURED"` (5X-2.2 Security).

**Geordi rules** (mandatory):
- Font: `var(--lcars-font)`, size `var(--lcars-font-size-data)`
- Color: inherit from `--panel-frame-color`, overridable via attribute
- Text: ALL UPPERCASE
- `role="status"` + `aria-live="polite"` (WCAG 4.1.3 Status Messages)
- No borders, no background, no shadows — text-only

**Acceptance criteria**:
- `<lcars-summary-badge>` component with value/total/label rendering
- Used by Illumination panel badge, Life Support badge
- ARIA status role with live region
- ALL CAPS text styling

---

### 4X-21 · Panel Dispatch Registry — `DONE` · Priority: MEDIUM · Size: S

**GitHub Issue**: [#21](https://github.com/htiel/LCARS-lovelace-dashboard/issues/21)
**Label**: `5x-prep`

Replace `_renderDevicePanel()` switch statement in `lcars-homepage-card.js` with `Map<panelType, factoryFn>`. Each entry returns a lit-html template for the panel. New panels add a map entry, not a switch case.

**Fits into**: 4X-10 and 4X-11 (both add new panel types) — implement during 4X-10.

**Enables**: 5.x dashboards register panel types without editing orchestrator code.

**Geordi note**: Use factory function pattern, not `unsafeStatic` for dynamic tag names. Avoids `lit-html/static.js` dependency and tag injection risk.

**Acceptance criteria**:
- `PANEL_TAG_REGISTRY` Map replaces switch statement
- All 10 existing panels dispatched from the map
- New panels (life_support, illumination) added as map entries
- No behavioral change to existing panel rendering

---

### 4X-22 · `load_dashboard.py` Parametric Registration — `DONE` · Priority: HIGH · Size: S

**GitHub Issue**: [#22](https://github.com/htiel/LCARS-lovelace-dashboard/issues/22)
**Label**: `5x-prep`

Refactor `load_dashboard.py` from hardcoded values to `_register_single_dashboard(hass, url, yaml_path, title, icon)`. Existing `load_dashboard()` calls it once with current defaults.

**Enables**: 5X-2.0 Dashboard Registration Framework — a loop calling `_register_single_dashboard()` N times. The 5.x work becomes config + YAML files, not plumbing.

**Acceptance criteria**:
- `_register_single_dashboard()` extracted as reusable function
- `load_dashboard()` calls it once with current defaults
- Dashboard YAML path validated before registration (existing behavior preserved)
- No behavioral change to current single-dashboard setup

---

### 4X-23 · Config Flow Options Schema Prep — `DONE` · Priority: LOW · Size: S

**GitHub Issue**: [#23](https://github.com/htiel/LCARS-lovelace-dashboard/issues/23)
**Label**: `5x-prep`

Add `dashboards` key to `config_entry.options` in `config_flow.py` with default `["habitat"]`. Not exposed in UI yet — forward-compatible schema only.

**Enables**: 5X-2.6 Dashboard Config Flow — adding checkboxes in 5.x is a UI change, not a data model change.

**Acceptance criteria**:
- Schema accepts `dashboards` key with default `["habitat"]`
- Existing installations see no change (backward-compatible migration)
- Not exposed in options UI during 4.x

---

### 4X-24 · Dashboard Identity CSS Custom Properties — `DONE` · Priority: LOW · Size: S

**GitHub Issue**: [#24](https://github.com/htiel/LCARS-lovelace-dashboard/issues/24)
**Label**: `5x-prep`

Add dashboard-level color identity tokens to `lcars-styles.js`:

| Variable | Maps To | Dashboard |
|----------|---------|-----------|
| `--lcars-dash-habitat` | `--lcars-butterscotch` | Habitat (home/area) |
| `--lcars-dash-security` | `--lcars-tomato` | Security |
| `--lcars-dash-power` | `--lcars-sunflower` | Power |
| `--lcars-dash-environmental` | `--lcars-ice` | Environmental |
| `--lcars-dash-lighting` | `--lcars-gold` | Lighting |
| `--lcars-dash-comm` | `--lcars-african-violet` | Communications |
| `--lcars-dash-ops` | `--lcars-bluey` | Operations |

**Geordi note**: 2–3 hue families per dashboard. Within Bracer Jack's safe zone. Each dashboard sets `--lcars-active-dash` to its identity color.

**Enables**: 5.x dashboard chrome inherits color identity (5X-2.1 through 5X-3.2).

**Acceptance criteria**:
- 7 dashboard identity CSS custom properties defined
- `--lcars-active-dash` alias property
- No visual change to existing dashboard (defaults to habitat)

---

### 4X-25 · Shared Focus Style Mixin — `DONE` · Priority: LOW · Size: S

**GitHub Issue**: [#25](https://github.com/htiel/LCARS-lovelace-dashboard/issues/25)
**Label**: `5x-prep`

Extract shared `lcarsSeraphFocus` CSS fragment for consistent `focus-visible` indicators across all components:

```css
:focus-visible {
  outline: 2px solid var(--lcars-ice);
  outline-offset: 2px;
}
```

Apply in every Tier 2 and Tier 3 stylesheet. Currently each component implements its own focus rule.

**Geordi note**: Named "seraph" — the focus halo that guides attention. Required for WCAG 2.4.7 + 2.4.13.

**Enables**: Consistent accessibility across all 5.x dashboard components.

**Acceptance criteria**:
- `lcarsSeraphFocus` exported from shared styles
- Applied to all new components (segmented-bar, summary-badge)
- Existing components migrated to use it (can be incremental)

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
# LCARS Dashboard - 4.x Backlog

> Stable branch (`4.0`). Non-breaking feature additions, bug fixes, and optimizations.
> Version: 4.19.0 (current stable)
>
> Completed items through 4.18.8 archived to `_archive/plans/backlog-4x.md`.
>
> **Prioritized using WSJF** (Weighted Shortest Job First).
> WSJF = Cost of Delay / Job Size.
> Cost of Delay = Business Value + Time Criticality + Risk Reduction (each 1�5).
> Size: XS=1, S=2, M=3, L=5, XL=8.

---

## Status Key

| Tag | Meaning |
|-----|---------|
| `TODO` | Not started |
| `IN PROGRESS` | Active work |
| `BLOCKED` | Waiting on dependency |
| `DONE` | Shipped - archived after release |

---

## WSJF Scoring

| ID | Title | BV | TC | RR | CoD | Size | WSJF | Priority |
|----|-------|----|----|----|-----|------|------|----------|
| 4X-27 | Clean up hass.data[DOMAIN] | 2 | 1 | 3 | 6 | 1 | 6.00 | HIGH |
| 4X-34 | Replace legacy 'D' icon | 3 | 1 | 2 | 6 | 1 | 6.00 | HIGH |
| 4X-32 | Switches missing from Illumination | 4 | 3 | 3 | 10 | 2 | 5.00 | HIGH |
| 4X-31 | Env + air purifier clipping | 4 | 3 | 3 | 10 | 3 | 3.33 | HIGH |
| 4X-28 | Migrate open() to helpers | 2 | 1 | 3 | 6 | 2 | 3.00 | MEDIUM |
| 4X-29 | Responsive breakpoints | 4 | 2 | 3 | 9 | 3 | 3.00 | MEDIUM |
| 4X-42 | Consolidate alarm+security | 3 | 2 | 3 | 8 | 3 | 2.67 | MEDIUM |
| 4X-38 | Life Support panel cluttered | 5 | 4 | 4 | 13 | 5 | 2.60 | HIGH |
| 4X-45 | Thermostat not matching spec | 5 | 4 | 3 | 12 | 5 | 2.40 | MEDIUM |
| 4X-43 | Media: Apple TV + HomePods | 3 | 2 | 2 | 7 | 3 | 2.33 | MEDIUM |
| 4X-36 | Weather not using panel | 5 | 3 | 3 | 11 | 5 | 2.20 | MEDIUM |
| 4X-37 | Pool/spa not using panel | 5 | 3 | 3 | 11 | 5 | 2.20 | MEDIUM |
| 4X-35 | Alarm panel mismatch | 4 | 2 | 3 | 9 | 5 | 1.80 | MEDIUM |
| 4X-30 | Reduce gradients homepage | 2 | 1 | 2 | 5 | 3 | 1.67 | MEDIUM |
| 4X-41 | Blinds/covers panel | 2 | 1 | 2 | 5 | 3 | 1.67 | MEDIUM |
| 4X-44 | Platform-to-panel routing | 5 | 3 | 5 | 13 | 8 | 1.63 | MEDIUM |
| 4X-33 | Gear edit: panel reorder | 4 | 2 | 2 | 8 | 5 | 1.60 | MEDIUM |
| 4X-39 | Nest Protect panel | 3 | 2 | 3 | 8 | 5 | 1.60 | MEDIUM |
| 4X-40 | GE Home appliance panel | 3 | 2 | 2 | 7 | 5 | 1.40 | LOW |

---

## Backlog (WSJF Order)

### 4X-27 - Clean up hass.data[DOMAIN] in async_unload_entry - `DONE v4.18.9` - Priority: HIGH - Size: XS - WSJF: 6.00

**GitHub Issue**: [#27](https://github.com/htiel/LCARS-lovelace-dashboard/issues/27)

HA convention is `hass.data.pop(DOMAIN, None)` in `async_unload_entry`. Current code leaves stale data (4 empty OrderedDicts). Found by Data during v4.18.8 review.

**Acceptance criteria**:
- `async_unload_entry` calls `hass.data.pop(DOMAIN, None)` after platform unload

---

### 4X-34 - Replace legacy 'D' dashboard icon from Dwains Dashboard - `DONE v4.18.9` - Priority: HIGH - Size: XS - WSJF: 6.00

**GitHub Issue**: [#34](https://github.com/htiel/LCARS-lovelace-dashboard/issues/34)

The sidebar/panel icon is still the letter 'D' carried over from the Dwains Dashboard codebase. Replace with an LCARS-appropriate icon or suitable MDI icon.

**Acceptance criteria**:
- Dashboard icon no longer shows the legacy 'D'
- New icon reflects LCARS branding

---

### 4X-32 - Switches for plugs/lights missing from Illumination panel Circuits - `DONE v4.18.9` - Priority: HIGH - Size: S - WSJF: 5.00

**GitHub Issue**: [#32](https://github.com/htiel/LCARS-lovelace-dashboard/issues/32)

Switch-domain entities that control plugs or lights (e.g. smart plugs powering lamps) are not included in the Illumination panel's Circuits section. These should be surfaced alongside other lighting controls.

**Acceptance criteria**:
- Switch entities controlling plugs or lights in a room appear in the Illumination panel under Circuits
- Existing light-domain entity behavior is unchanged

---

### 4X-31 - Environmental + air purifier panels clip in consolidated room view - `DONE v4.18.9 � REOPENED as 4X-46` - Priority: HIGH - Size: M - WSJF: 3.33

**GitHub Issue**: [#31](https://github.com/htiel/LCARS-lovelace-dashboard/issues/31) ? reopened as [#44](https://github.com/htiel/LCARS-lovelace-dashboard/issues/44)

v4.18.9 fix (overflow: visible) was insufficient. Clipping persists in the Life Support panel's nested environment substation. Root cause likely in a parent container constraint.

---

### 4X-46 - Life Support panel still clipping nested environment substation - `TODO` - Priority: HIGH - Size: M - WSJF: 3.33

**GitHub Issue**: [#44](https://github.com/htiel/LCARS-lovelace-dashboard/issues/44)

Reopened from 4X-31. The `overflow: visible` fix in v4.18.9 did not fully resolve clipping. The Awair atmoscrubber sparkline tray at the bottom of the Life Support panel is cut off. Root cause may be in the homepage card's room container, the panel frame's outer div, or a parent flex/grid height constraint.

---

### 4X-28 - Migrate remaining open() patterns to helpers - `DONE v4.19.0` - Priority: MEDIUM - Size: M (re-scoped) - WSJF: 3.00

**GitHub Issue**: [#28](https://github.com/htiel/LCARS-lovelace-dashboard/issues/28)

`more_pages` config loading in `websocket_get_configuration` still uses `async_add_executor_job(open, ...)` instead of the new `_read_yaml_file` helper. Inconsistent with refactored helpers. Found by Data during v4.18.8 review.

**Acceptance criteria**:
- All file I/O in `__init__.py` uses `_read_yaml_file` / `_write_yaml_file` helpers
- No direct `open()` calls remain outside the helper functions

---

### 4X-29 - Add responsive breakpoints to remaining panels - `TODO` - Priority: MEDIUM - Size: M - WSJF: 3.00

**GitHub Issue**: [#29](https://github.com/htiel/LCARS-lovelace-dashboard/issues/29)

Only power, life support, illumination, and homepage have responsive breakpoints. 8 panels need single-column fallback below ~480px: alarm, battery, camera, climate, environment, irrigation, media, pool-spa, weather. Found by Geordi during v4.18.7 review.

**Acceptance criteria**:
- All panel grid layouts collapse to single-column below 480px
- No horizontal overflow on mobile viewports
- Existing desktop layouts unchanged

---

### 4X-42 - Consolidate alarm + security panels and rename - `TODO` - Priority: MEDIUM - Size: M - WSJF: 2.67

Alarm panel (SimpliSafe, etc.) and security panel (locks like Schlage, door/window sensors, motion) should be consolidated or clearly linked under a unified security/tactical panel. Consider renaming to 'Tactical' or 'Security Operations'. Locks (Schlage), alarm systems (SimpliSafe), door/window sensors, and motion sensors all belong together.

**Acceptance criteria**:
- Alarm and security entities render in a unified or clearly linked panel structure
- Locks, alarm controls, door/window sensors, and motion sensors all accessible
- Panel naming is consistent and LCARS-themed

---


### 4X-45 - Thermostat rendering does not match LCARS climate panel spec - `TODO` - Priority: HIGH - Size: L - WSJF: 2.40

**GitHub Issue**: [#43](https://github.com/htiel/LCARS-lovelace-dashboard/issues/43)

The thermostat/climate panel renders with a generic HA climate dial instead of the designed LCARS climate panel layout. Missing dual setpoint controls, humidity display, mode selector, and fan speed in LCARS styling. 3 Nest thermostats (platform: `nest`) in the test house. See `localinfo/bugs/Thermostat actual.png` vs `Thermostat render.png`.

**Acceptance criteria**:
- Climate panel renders with LCARS frame and header bar
- Dual heat/cool setpoint controls displayed
- Humidity, mode selector, and fan speed controls in LCARS styling
- Matches LCARS climate panel spec render

---

### 4X-43 - Media panel: consolidate Apple TV + HomePods per room - `TODO` - Priority: MEDIUM - Size: M - WSJF: 2.33

When a room has both an Apple TV and one or two HomePods, they should render as a single consolidated media panel. Apple TV can use HomePods in the same room as speakers, so the primary view should be the Apple TV media controls with HomePods shown as a secondary speaker/output section. HomePods still work independently so they can't be hidden � they need a less prominent but accessible sub-section within the Apple TV media panel.

**Acceptance criteria**:
- Apple TV and HomePods in the same room render as a single media panel
- Apple TV is the primary control surface (playback, artwork, transport)
- HomePods appear as a secondary speaker/output section
- HomePods remain independently controllable (volume, play/pause)
- Rooms with only HomePods (no Apple TV) render a standalone speaker panel

---

### 4X-36 - Weather station not rendering as LCARS weather panel - `TODO` - Priority: HIGH - Size: L - WSJF: 2.20

**GitHub Issue**: [#36](https://github.com/htiel/LCARS-lovelace-dashboard/issues/36)

Weather station entities (e.g. Tempest) render as a flat grid of generic sensor pills with raw unformatted values and truncated labels instead of the LCARS weather panel. See `localinfo/bugs/Weather not using panel.png`.

**Entity registry note** (from test house):
- `weather.home` � Met integration, `area_id: null`
- WeatherFlow Tempest station (platform: `weatherflow`, device ST-00127631), 23 sensor entities, all `area_id: null`
- Key issue: entities not assigned to any area, and `weatherflow` platform sensors not being detected as weather panel candidates

**Acceptance criteria**:
- Weather station entities detected and rendered using LCARS weather panel
- Values formatted with appropriate precision
- Full readable sensor labels
- Weather-specific layout per LCARS Weather Panel spec

---

### 4X-37 - Pool/spa sensors not rendering as LCARS Cetacean Ops panel - `TODO` - Priority: HIGH - Size: L - WSJF: 2.20

**GitHub Issue**: [#37](https://github.com/htiel/LCARS-lovelace-dashboard/issues/37)

Pool and spa entities render as generic sensor pills and a Power Systems panel with unlabeled 'POOL EQUIPMENT' circuit tiles instead of the LCARS Cetacean Ops panel. See `localinfo/bugs/Pool not using panel.png` vs `Pool render.png`.

**Entity registry note** (from test house):
- Platform: `screenlogic` (Pentair), 19 entities, all `area_id: null`
- Key issue: `screenlogic` platform not being detected for Cetacean Ops panel routing; entities dumped into generic sensor pills and Power Systems instead

**Acceptance criteria**:
- Pool/spa entities detected and rendered using LCARS Cetacean Ops panel
- Pool and spa temperature displays with setpoint controls
- Chemistry section with labeled values (pH, chlorine, alkalinity, salt)
- Named circuit toggle buttons (pump, waterfall, jets, lights)

---

### 4X-35 - Alarm panel does not match spec render - `TODO` - Priority: MEDIUM - Size: L - WSJF: 1.80

**GitHub Issue**: [#35](https://github.com/htiel/LCARS-lovelace-dashboard/issues/35)

The alarm panel renders as a generic HA alarm card instead of the designed LCARS alarm panel. Missing LCARS header bar, door/sensor status list, styled keypad layout, and mode buttons. See `localinfo/bugs/Alarm Panel actual.png` vs `Alarm Panel Render.png`.

**Entity registry note** (from test house):
- `alarm_control_panel.alarm_control_panel` � SimpliSafe
- `alarm_control_panel.blink_blinkifi` � Blink
- 94 additional SimpliSafe entities (door/window sensors, motion, locks) + 21 Blink entities, all tagged `alarm`
- Panel IS rendering but as a generic HA alarm card instead of the LCARS spec design.

**Acceptance criteria**:
- Alarm panel renders with LCARS frame, header bar, and stardate
- Door/sensor status list displayed alongside the alarm controls
- Number keypad and mode buttons match spec styling

---

### 4X-30 - Reduce gradient usage in legacy homepage card - `TODO` - Priority: LOW - Size: M - WSJF: 1.67

**GitHub Issue**: [#30](https://github.com/htiel/LCARS-lovelace-dashboard/issues/30)

20+ gradient uses in `lcars-homepage-card.js` (camera overlays, scroll fades, edit indicators). Some are functional (mask-image for scroll fade) but several are decorative, violating Bracer Jack Rule 1. Found by Geordi during v4.18.7 review.

**Acceptance criteria**:
- Audit all `linear-gradient` / `radial-gradient` uses in homepage card
- Remove purely decorative gradients
- Document functional gradients (scroll fades, mask-image) as intentional exceptions

---

### 4X-41 - New panel: Blinds/shades/covers control panel - `TODO` - Priority: LOW - Size: M - WSJF: 1.67

**GitHub Issue**: [#41](https://github.com/htiel/LCARS-lovelace-dashboard/issues/41)

Cover/blind entities (e.g. Bond integration) have no dedicated LCARS panel. Currently fall into security by domain, but blinds/shades are distinct from security covers. Could be themed as 'Viewport Controls' or 'Observation Ports'.

**Acceptance criteria**:
- Cover entities for blinds/shades detected and routed to dedicated panel
- Open/close/position controls displayed per cover
- Panel follows LCARS design language

---

### 4X-44 - Implement platform-to-panel routing for all tagged integrations - `TODO` - Priority: HIGH - Size: XL - WSJF: 1.63

**GitHub Issue**: [#42](https://github.com/htiel/LCARS-lovelace-dashboard/issues/42)

Entity-to-panel routing needs full implementation based on the combined entity registry analysis (5,958 entities, 2 test houses). Reference data in `localinfo/combined.entities.csv`. Covers 17 panel targets across 20+ integrations. Includes 3 new panels (hazard_detection, galley_systems, viewport_controls) and diagnostic entity filtering.

**Acceptance criteria**:
- All listed platforms route to the correct panel
- New panels created for hazard_detection, galley_systems, viewport_controls
- Entities not matching any rule fall through to generic device panel
- entity_category: diagnostic/config entities excluded from room panels

---

### 4X-33 - Gear edit mode: persistent panel order/placement override per room - `TODO` - Priority: MEDIUM - Size: L - WSJF: 1.60

**GitHub Issue**: [#33](https://github.com/htiel/LCARS-lovelace-dashboard/issues/33)

Allow users to reorder and reposition panels within a room via gear (edit) mode. Overrides persist across reloads and HA reboots. A reset option restores the default auto-generated order.

**Acceptance criteria**:
- Gear edit mode exposes panel reorder controls (drag-and-drop or up/down arrows)
- Panel order overrides are saved persistently per room
- Room renders respect the saved override on reload
- A reset/clear option restores default panel ordering
- Override survives dashboard restarts and HA reboots

---

### 4X-39 - New panel: Nest Protect / smoke-CO-heat detector safety panel - `TODO` - Priority: MEDIUM - Size: L - WSJF: 1.60

**GitHub Issue**: [#39](https://github.com/htiel/LCARS-lovelace-dashboard/issues/39)

Nest Protect devices (~23 entities each) have no dedicated panel. 167 entities across 7 devices in the test house covering smoke/CO/heat status, self-tests, occupancy, battery, and config. Needs a purpose-built safety panel (e.g. 'Fire Suppression' or 'Hazard Detection') with per-room detector status, battery overview, and self-test summary.

**Acceptance criteria**:
- `nest_protect` platform entities detected and routed to dedicated panel
- Safety status (smoke, CO, heat) prominently displayed per device/room
- Battery health and self-test status visible at a glance
- Panel follows LCARS design language

---

### 4X-40 - New panel: GE Home SmartHQ appliance panel - `TODO` - Priority: LOW - Size: L - WSJF: 1.40

**GitHub Issue**: [#40](https://github.com/htiel/LCARS-lovelace-dashboard/issues/40)

GE Home (SmartHQ) appliances (oven, Advantium microwave, beverage/ice system) have no dedicated panel. 34 entities in the test house covering cook modes, timers, temperatures, and appliance diagnostics. Needs a purpose-built appliance panel (e.g. 'Replicator Bay' or 'Galley Systems').

**Acceptance criteria**:
- `ge_home` platform entities detected and routed to dedicated panel
- Active cooking status and timers prominently displayed
- Temperature and mode information visible
- Panel follows LCARS design language
