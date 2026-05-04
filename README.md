# LCARS Dashboard

<p align="center">
  <img src="https://raw.githubusercontent.com/htiel/LCARS-lovelace-dashboard/4.0/custom_components/lcars_dashboard/logo@2x.png" alt="LCARS Dashboard Logo" width="512">
</p>

A Home Assistant custom dashboard with a full Star Trek LCARS (Library Computer Access/Retrieval System) interface. Six dedicated dashboards — Habitat, Tactical, Engineering, Life Support, Illumination, and Cetacean Ops — each with their own layout, entity classifier, and sidebar filter controls.

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
![GitHub stars](https://img.shields.io/github/stars/htiel/LCARS-lovelace-dashboard?style=social)
![Version](https://img.shields.io/badge/version-5.1.0--beta.38-blue)
![HA](https://img.shields.io/badge/Home%20Assistant-2025.4%2B-blue)
[![GitHub issues](https://img.shields.io/github/issues/htiel/LCARS-lovelace-dashboard)](https://github.com/htiel/LCARS-lovelace-dashboard/issues)

---

## Multi-Dashboard Architecture (5.0)

Version 5.0 replaces the single monolithic dashboard with a **multi-dashboard system**. Each dashboard is a self-contained Lovelace panel with its own YAML template, entity classifier, layout component, and sidebar filter controls. Users subscribe to the dashboards they want via the integration options flow — no YAML editing required.

### Available Dashboards

| Dashboard | Sidebar Title | Frame Color | Sidebar Filters | What It Shows |
|-----------|--------------|-------------|-----------------|---------------|
| **Habitat** | Habitat | butterscotch | Area navigation | Room-by-room device control — the main dashboard. Floor-grouped sidebar, auto-detected panels per area |
| **Tactical** | Tactical | ice | ALL / ACCESS / ZONES | Security overview — alarm control, camera grid, door/window sensors, motion detectors, smoke/CO |
| **Engineering** | Power Distribution | butterscotch | ALL / STORAGE / CIRCUITS | Power topology — grid/UPS/battery source cards → distribution bus → load circuit grid |
| **Life Support** | Life Support | bluey | ALL / CLIMATE / AIR | Environmental monitoring — thermostats, air purifiers, per-room AQ tables, CO₂ sparklines, ring gauges |
| **Illumination** | Illumination | sunflower | ALL / LIGHTS / CIRCUITS | Lighting control — brightness bars, color presets, effects, scenes, and lighting circuit toggles |
| **Cetacean Ops** | Cetacean Ops | sky | ALL / WATER / CHEMISTRY / FEATURES / POWER | Pool & spa operations — water bodies, chemistry gauges, pump telemetry, equipment circuits |

Only **Habitat** is enabled by default. Enable additional dashboards through the integration options flow.

### Dashboard Subscription (Config Flow)

Dashboard selection is managed entirely through the Home Assistant UI — no YAML editing needed.

#### First Install
1. **Settings** → **Devices & Services** → **Add Integration** → **LCARS Dashboard**
2. The integration installs with Habitat enabled by default

#### Enabling / Disabling Dashboards
1. **Settings** → **Devices & Services** → **LCARS Dashboard** → **Configure**
2. **Step 1 — Dashboard Selection**: Check/uncheck dashboards to enable or disable them. At least one must remain enabled.
3. **Step 2 — Dashboard Configuration**: Set a custom sidebar title and icon for each enabled dashboard. Defaults are shown in the table above.
4. Click **Submit** — dashboards appear in (or are removed from) the HA sidebar immediately. No restart required.

#### Customizing Sidebar Titles & Icons

Each dashboard can have a custom name and MDI icon in the HA sidebar. For example, you could rename "Tactical" to "Security" or change "Life Support" to "Environment." Icon format is `mdi:icon-name` (e.g., `mdi:shield-home`, `mdi:leaf`).

### Dashboard Sidebar Reorder

LCARS dashboards can be reordered within the HA sidebar so they appear grouped together in your preferred order.

1. Open any LCARS dashboard
2. Click the **gear icon** (⚙) in the header endcap to enter edit mode
3. Select **Sidebar Order** to open the reorder editor
4. Drag dashboards up/down or use the move buttons to set your preferred order
5. Click **Apply** — the order is saved per-user and persists across sessions

The order is stored in the integration config entry and applied client-side. Non-LCARS sidebar items are unaffected.

### HA Labels for Entity Classification

LCARS auto-classifies entities using name-based heuristics, but you can override any classification using [Home Assistant Labels](https://www.home-assistant.io/docs/organizing/labels/) (2024.4+). Labels can be applied to entities, devices, or areas — LCARS checks all three levels.

Currently supported:
- **Camera location** (Tactical) — `exterior`/`interior` labels for camera filter
- **Circuit classification** (Engineering) — `dedicated`/`infrastructure`/`lighting`/`outlets`/`battery` labels for load circuit grouping

**For full tagging instructions, examples, and keyword fallback tables, see [TAGGING.md](TAGGING.md).**

---

## Features

### Layout & Navigation
- **LCARS Frame** — Authentic elbows, header/footer bars, endcaps, and sidebar in the classic Okudagram style
- **Floor-Grouped Sidebar** — Areas grouped by HA floor with clickable floor headers (lilac); click a floor for combined view, click an area to drill down
- **Smart Name Shortening** — Automatically strips area and device name prefixes from entity names for cleaner display
- **Device-Grouped Layout** — Entities organized by device, then sorted by domain (cameras first, sensors last)
- **Responsive (Geordi-canon, beta.37+)** — On phone widths (≤ 767 px) the LCARS swept silhouette is preserved (PADD canon — never flipped to a horizontal bar). The frame narrows to one elbow unit (~88 px), and on Habitat the area buttons collapse to **icon-only** (the area's `mdi:` icon, with `aria-label` + `title=` for screen readers and long-press)
- **Panel Reorder** — Edit mode gear pip on each panel for persistent reorder within an area (saved via WebSocket to YAML)
- **Deep Linking** — URL hash navigation (`#area:<area_id>`) for bookmarking and cross-dashboard links

### Auto-Detected Panels (Habitat)

The Habitat dashboard auto-discovers devices and routes them to the correct panel using a priority-ordered classifier: camera → alarm → pool/spa → climate → media → environment → irrigation → weather → ev charger → power → battery. Area-level composite panels (life support, illumination) aggregate entities across devices. Diagnostic and config entities (`entity_category`) are filtered from classification signals to prevent false positives. Platform-aware exclusions prevent galley appliances, pool equipment, and wallbox cable locks from being absorbed by Life Support or Tactical.

#### Camera Panel
Live camera feeds with LCARS-framed viewscreen and activation animation. Three-state display: ESTABLISHING LINK (connecting), live feed, VIEWSCREEN OFFLINE (error/timeout). Stale image prevention via forced src binding on room switch.
- **Integrations**: Any HA camera entity (UniFi Protect, Amcrest, ONVIF, Reolink, etc.)

#### Climate Panel
Thermostat control with SVG temperature arc, dynamic HVAC action colors (heating=butterscotch, cooling=ice), debounced setpoint controls with safety clamping, HVAC mode/fan mode/preset mode/swing mode strips, dual setpoint support for heat_cool mode. Portable AC support: auxiliary switch toggles (eco/turbo/swing) with per-switch colors, timer stepper.
- **Integrations**: Nest, Ecobee, Honeywell, Z-Wave thermostats, Midea portable AC (midea_ac_lan)

#### Alarm Panel
Shield viewscreen with state-reactive glow, digit-only PIN keypad with 3-attempt/60s rate limiting, arm mode selector strip, zone sensor roster with micro-pip status and inline sibling telemetry (battery/illuminance), arming countdown with urgency escalation.
- **Integrations**: SimpliSafe, Honeywell Home, Ring, Alarmo

#### Media Panel
Album art viewscreen with transport controls (play/pause/prev/next/shuffle/repeat) gated by `supported_features` bitmask, click-to-set volume bar with keyboard arrow support, source/shuffle/repeat metadata, 12-bar audio waveform visualizer. Transport controls and volume hidden when player is idle/standby/off.
- **Integrations**: Apple TV, HomePod, Sonos, Chromecast, Plex

#### Pool & Spa Panel
Dual body viewscreens (pool=ice, spa=butterscotch) with setpoint controls, circuit toggles, chemistry sensor readouts (pH, ORP, salt), pool lighting controls, caustic water shimmer animation.
- **Integrations**: Pentair ScreenLogic, Jandy iAqualink

#### Weather Panel
SVG condition display with ambient glow, wind compass with gust oscillation, 7-day forecast strip with range bars and precipitation probability pips, sun arc with tracking dot.
- **Integrations**: Davis Instruments, WeatherFlow Tempest, NWS, OpenWeatherMap

#### Irrigation Panel
Full-featured irrigation control with zone photo thumbnails (from Rachio cloud, with vegetation icon fallback), expandable zone detail badges (shade, vegetation type, slope), barberpole flow animation with real-time progress tracking, countdown timer, schedule management strips (Flex/Fixed type badges), controller status telemetry (connectivity, standby, rain delay, rain sensor), conditional rain alert banner, Quick Run builder (multi-zone selector + duration + ENGAGE), and pause/resume/stop-all controls.
- **Entity coverage**: Zone switches (with photos, attributes), schedule switches, standby/rain-delay controller, connectivity/rain binary sensors
- **Rachio services**: `start_watering`, `start_multiple_zone_schedule`, `pause_watering`, `resume_watering`, `stop_watering`
- **Integrations**: Rachio, RainMachine, OpenSprinkler

#### Environment / Atmoscrubber Panel
Animated particle cylinder with AQI-mapped colors, 24h SVG sparklines, fan/preset controls, CO₂ 3-tier threshold coloring (ice/sunflower/tomato), filter life segment bar (10 segments with critical pulse animation). AQI and PM2.5 scale labels below score numbers for metric disambiguation. Sensor-only mode for monitor-only devices (compact readout grid without cylinder). Sparkline labels use canonical device_class names (PM₂.₅, CO₂, VOC).
- **Integrations**: Awair, VeSync purifiers, BlueAir (Blue Pure 311i Max), SwitchBot meters (WoTHP/WoTHPc)

#### Power Systems Panel
Consolidated per-area power monitoring with three sections: CIRCUITS (tile grid), MONITORED DEVICES (toggle + stats rows), POWER STRIPS (parent→child blocks with per-outlet sliding track toggles). SVG half-arc distribution chart for 3+ sources, singleton popover for circuit detail, 240V pair detection, SHOW ALL truncation for 12+ items.
- **Smart dedup**: Excludes aggregate circuits (Balance/Total/Mains) and UPS parent wattage when children are present
- **Integrations**: Emporia Vue, TP-Link Kasa (KP115, KP125M, HS110, HS300), Shelly Pro 3EM

#### Warp Core Battery Panel
CSS reactor core with charge-level color, SOC gauge, power flow I/O arrows, telemetry sensors, integrated config/diagnostic entity controls with LCARS option strips. NUT UPS devices auto-detected with Grid→UPS→Load flow, load/runtime telemetry, and NUT status code parsing (OL/OB/CHRG/LB/FSD).
- **Integrations**: EcoFlow (River, Delta), Victron, Tesla Powerwall, NUT (CyberPower, APC, Tripp Lite, Eaton)

#### EV Charger Panel
Bidirectional EV charger monitoring with SVG energy flow visualization (animated chevron cascade for charging/V2G, directional flip, idle dashes), 15-row sensor telemetry column (status, session, energy balance, vehicle, charger), solar mode radio strip, max charging current ±adjuster, and cable lock toggle. Dynamic frame color by charger state (charging=butterscotch, V2G=ice, error=tomato, idle=lilac). SoC progress bar with 4-tier color coding. Offline empty state with gray "OFFLINE" badge when charger is unavailable.
- **Integrations**: Wallbox (Vilya V2G, Pulsar Plus)

#### Life Support Panel (per-area)
Area-level composite panel aggregating climate, environment (air quality), and ambient sensor entities into a unified view. Four graceful degradation configurations: full (thermostat + purifier + sensors), atmos-only, climate-only, and sensor-hero (standalone temp/humidity). Composes existing climate and environment panels as nested substations. Adaptive sparkline tray (160×32px) shows 24-hour trends for temperature, humidity, AQI, PM2.5, CO₂, VOC. Camera-derived binary sensors (motion/tamper) auto-filtered. HomeKit air purifiers (fan + AQ sensor on same device) auto-detected.
- **Integrations**: Any combination of climate entities, air quality devices, and ambient sensors in an area, plus HomeKit Controller purifiers (Smartmi P1, etc.)

---

## Dedicated Dashboards (5.0+)

These are full-screen dashboards accessible from the HA sidebar, each with their own layout and entity classification. Enable them via the [Dashboard Subscription](#dashboard-subscription-config-flow) config flow.

### Tactical Dashboard
Single pane of glass for security. Camera grid (2×3 viewscreen tiles with LCARS corner brackets), alarm control with shield viewscreen, door/window sensor pills (SEALED/BREACH), motion indicator dots, smoke/gas/safety sensors. Summary bar shows shield status, perimeter integrity, and active camera count. Camera badges highlight with red alert for pending/triggered alarm states.
- **Entity scope**: `alarm_control_panel`, `lock`, `camera`, `binary_sensor` (door, window, motion, occupancy, smoke, safety, glass break)
- **Integrations**: SimpliSafe, UniFi Protect, Insteon, Nest Protect

### Engineering Dashboard
Power distribution topology: Sources → Distribution Bus → Load Circuits.
- **Source row**: GRID card (voltage/frequency/energy/power bar), UPS card, battery cards with animated mini warp core bars (SOC fill, idle pulse, charging stripes)
- **Distribution bus**: Butterscotch bar with solid EPS conduit connectors (6px source → 4px trunk) and breathing pulse
- **Voltage overview**: Three-tier display — HIGH VOLTAGE (>130V, tomato), HOME VOLTAGE (110–130V, auto-averaged, ice), LOW VOLTAGE (<110V, sunflower for doorbells/PoE)
- **Circuit grid**: Top 15 active circuits sorted by wattage, grouped by category (DEDICATED / OUTLETS / LIGHTING / INFRASTRUCTURE / BATTERY / OTHER), 4-tier color-coded bars, relative scaling
- **Circuit tagging**: HA Labels override name heuristics — see [TAGGING.md](TAGGING.md) for setup
- **System status sidebar**: Total load, grid power, battery count, average SOC, total stored kWh, circuit count, health status
- **Double-count prevention**: Aggregate sensors (totalusage, balance, mainload) excluded; 240V L1/L2 pairs deduplicated
- **Deep linking**: Battery DETAIL ► navigates to Habitat with `#area:<area_id>` hash
- **Accessibility**: `prefers-reduced-motion` fallback, keyboard focus on all interactive elements (WCAG 2.1.1)
- **Integrations**: Emporia Vue, TP-Link Kasa, NUT UPS, EcoFlow batteries, Shelly Pro 3EM

### Life Support Dashboard
Environmental monitoring with 3-column layout (main content + AQ sidebar).
- **Overview cards**: 4 ring gauge summary cards (Purifiers, Thermostats, AQ, Environment) with distinct border colors, glowing rings, and action buttons (VIEW DETAILS / VIEW ZONES)
- **Air Purifiers table**: Location, Model, Status, Speed, Filter life bar (with shimmer animation), PM2.5 — color-coded
- **Per-room atmosphere**: 7-column comparison table (Score, PM2.5, CO₂, VOC, Temp, RH) — area-grouped, averaged, purifier sensors excluded
- **CO₂ sparklines**: Per-room 24h trend lines below the atmosphere table
- **AQ sidebar**: Hero AQI ring gauge (96px, glowing), metric rows (PM2.5, PM10, CO₂, TVOC), 24h history sparklines
- **Environment sidebar**: 24h temperature + humidity sparklines
- **Combined climate panel**: Thermostat zones + temp/humidity grid in one section
- **Animations**: Scanning section headers, thermostat breathing glow (warm/cool), AQ hero pulse, filter bar shimmer, ring gauge glow
- **Integrations**: Awair, VeSync, BlueAir, HomeKit purifiers, Nest thermostats, SwitchBot meters

### Illumination Dashboard
Area-level lighting control spanning full width. Multi-column responsive grid (2-3 lights per row). Full-width brightness bars with color temperature awareness (warm amber to cool white). **Effect strip**: 2-column LCARS pill grid for Nanoleaf/Govee/smart light effects — active effect shown in bar value. **Color presets**: 6 LCARS palette pills (Warm, Cool, Red, Green, Blue, Purple) for HS/RGB color lights. Toggle-only lights show ON/OFF without slider. Scene activation strip and lighting circuit toggles. Drag-and-drop reorder in edit mode with FLIP animation.
- **Entity detection**: Insteon dimmers/relays (SwitchLinc/LampLinc/ToggleLinc — platform-level detection), infrastructure LED exclusion (UniFi, ESPHome status), device-level dedup
- **Integrations**: Any `light` domain entities, Nanoleaf, Govee, lighting switches (auto-detected by name heuristic), HA scenes

### Cetacean Ops Dashboard
Pool & spa operations named after Enterprise-D's aquatic monitoring station on Deck 13. Water body viewscreens (pool=ice, spa=butterscotch), chemistry Langford gauges, pump telemetry, water feature toggles, and per-equipment power circuit breakdowns from Emporia Vue.
- **Entity discovery**: Platform-based O(1) set membership against pool platforms (`screenlogic`, `waterguru`), plus Emporia Vue keyword matching for pool circuits
- **Integrations**: Pentair ScreenLogic, WaterGuru GrandeBridge S2, Emporia Vue (pool circuits)

---

### Domain-Specific Renderers (Habitat)

Entities not routed to a panel render with domain-specific controls:

| Domain | Renderer |
|--------|----------|
| `camera` | LCARS-framed live feed with viewscreen activation |
| `light` | Toggle pill with brightness slider, color temp |
| `switch` / `input_boolean` | Toggle pill with heartbeat pulse |
| `fan` | Toggle pill with speed percentage |
| `lock` | Lock/unlock toggle with confirmation |
| `cover` | Open/close/stop with position control |
| `sensor` / `binary_sensor` | Data readout bars with segmented fill |
| `climate` | Routed to Climate Panel |
| `alarm_control_panel` | Routed to Alarm Panel |
| `media_player` | Routed to Media Panel |

### Internal Sensors Grid

Standalone `lcars-internal-sensors-grid` card for temperature/humidity monitoring. Auto-discovers SwitchBot meters and similar sensor-only devices, groups by floor, responsive tile grid with comfort-class colors, SVG sparklines, battery badges, and ship-wide averages.

### Visual Design
- **6 LCARS Animations** — Cascade reveal, scan sweep, viewscreen activation, heartbeat pulse, distress pulse, segmented sensor bars
- **Dynamic Panel Visuals** — Frame breathing pulse, data pip footers, numeric code watermarks, audio waveform, caustic water shimmer, wind compass, weather glow, barberpole flow, particle system, comfort glow tiles
- **Dashboard Animations** — Scanning section headers, thermostat breathing glow, distribution bus pulse, conduit flow, circuit/filter bar shimmer, AQ hero pulse, ring gauge glow, table row highlights
- **GPU-Composited** — All animations use `transform`/`opacity` for 60fps rendering
- **`prefers-reduced-motion`** — Comprehensive overrides: ambient loops disabled, confirmations halved, static fallbacks

### Audio System
- **15 synthesized sounds** via Web Audio API (OscillatorNode → GainNode) — no external audio files
- **All 14 panel types wired** — contextual feedback for toggles, adjustments, alerts, navigation, and state transitions
- **Mute toggle** in header endcap, persisted to localStorage
- **Accessibility** — Respects `prefers-reduced-motion`, soft volumes (0.10–0.15 gain)

### Security & Accessibility
- **Alarm PIN** — Rate-limited (3 attempts/60s), never logged or in DOM attributes, digit-only sanitization
- **Media artwork** — URL validation restricts to `/api/` or `/local/` paths
- **Setpoint clamping** — Temperature controls validated against entity min/max with absolute bounds
- **Service call throttling** — Token-bucket rate limiter on all device control calls
- **YAML concurrency** — All read-modify-write WebSocket handlers protected by per-file `asyncio.Lock`
- **Static asset isolation** — Only compiled bundle served via HTTP (`js/dist/`); source files, `package.json`, and webpack config not exposed
- **!include path boundary** — YAML `!include` directives validated against HA config directory via `os.path.realpath()` — blocks traversal and symlink escape
- **Blueprint depth cap** — Blueprint YAML limited to 256 KB and 20 levels of nesting to prevent resource exhaustion
- **Sidebar order validation** — Dashboard order validated against allowlist; no private HA API usage
- **Skip-nav link** — Hidden link jumps to `<main>` on first Tab press
- **ARIA landmarks** — Full keyboard navigation, `role` structure, `aria-live` announcements
- **WCAG 2.2 AA** — Color-blind safe indicators, `focus-visible` outlines (ice), 24×24px minimum targets, summary bar contrast ≥4.5:1
- **Self-contained** — All fonts (Antonio) and dependencies vendored locally, no external CDN calls

## Panel Gallery

> **[View the interactive panel gallery →](https://htmlpreview.github.io/?https://github.com/htiel/LCARS-lovelace-dashboard/blob/4.0/examples/lcars-panel-gallery.html)**
> Open `examples/lcars-panel-gallery.html` in a browser to see static mockups of all panel types with sample data.

<table>
<tr>
<td width="50%" align="center">

<a href="examples/screenshots/habitat.png"><img src="examples/screenshots/habitat.png" alt="Habitat dashboard screenshot" width="420"></a>

**Habitat** — Room-by-room device control with floor-grouped sidebar, auto-detected panels, and area deep linking.

</td>
<td width="50%" align="center">

<a href="examples/screenshots/tactical.png"><img src="examples/screenshots/tactical.png" alt="Tactical dashboard screenshot" width="420"></a>

**Tactical** — Security dashboard with camera grid, alarm control, door/window sensors, motion dots, and hazard alerts.

</td>
</tr>
<tr>
<td align="center">

<a href="examples/screenshots/power.png"><img src="examples/screenshots/power.png" alt="Power Distribution dashboard screenshot" width="420"></a>

**Engineering** — Power distribution topology: grid/UPS/battery sources → animated distribution bus → load circuit grid.

</td>
<td align="center">

<a href="examples/screenshots/life-support.png"><img src="examples/screenshots/life-support.png" alt="Life Support dashboard screenshot" width="420"></a>

**Life Support** — Environmental monitoring with ring gauge overview cards, per-room AQ table, CO₂ sparklines, and climate zones.

</td>
</tr>
<tr>
<td align="center">

<a href="examples/screenshots/illumination.png"><img src="examples/screenshots/illumination.png" alt="Illumination dashboard screenshot" width="420"></a>

**Illumination** — Full-width lighting control with brightness bars, color presets, effect strips, scenes, and circuit toggles.

</td>
<td align="center">

<a href="examples/screenshots/cetacean-ops.png"><img src="examples/screenshots/cetacean-ops.png" alt="Cetacean Ops dashboard screenshot" width="420"></a>

**Cetacean Ops** — Pool & spa operations with water body viewscreens, chemistry gauges, pump telemetry, and equipment circuits.

</td>
</tr>
</table>

> Screenshots use Star Trek: Lower Decks character/place names to obfuscate real device, area, and person names from the live deployments.

### Habitat Auto-Detected Panels

<table>
<tr>
<td width="50%">

**Climate** — SVG temperature arc with segmented fill, dual setpoints, HVAC/fan/preset mode strips, sibling zone summary.

</td>
<td width="50%">

**Environment / Atmoscrubber** — AQI cylinder with particle animation, PM2.5/CO₂/VOC sensor rows, 24h sparkline tray, fan controls.

</td>
</tr>
<tr>
<td>

**Battery / Warp Core** — Charge-level reactor core with SOC gauge, power flow telemetry, NUT UPS status parsing.

</td>
<td>

**Alarm** — Shield viewscreen, zone sensor roster, rate-limited PIN keypad, arm mode strip with countdown.

</td>
</tr>
<tr>
<td>

**Media** — Album art viewscreen, 12-bar audio waveform, transport toolbar, volume slider with keyboard support.

</td>
<td>

**Power Systems** — Circuit tile grid with 5-tier color coding, smart plug toggles, power strip parent/child blocks, SVG arc chart.

</td>
</tr>
<tr>
<td>

**Camera** — LCARS-framed viewscreen with three-state display (connecting, live, offline), sensor rows, privacy controls.

</td>
<td>

**Weather** — Condition display with ambient glow, forecast strip with range bars, sun arc indicator, wind compass.

</td>
</tr>
<tr>
<td>

**Irrigation** — Zone rows with photo thumbnails, barberpole progress, countdown timers, schedule strips, Quick Run builder.

</td>
<td>

**Pool & Spa** — Dual body viewscreens, chemistry segmented bars (pH, chlorine, salt), circuit groups, freeze protection.

</td>
</tr>
<tr>
<td>

**Life Support (per-area)** — Composite panel composing climate + environment substations, ambient sensor row, adaptive sparkline tray.

</td>
<td>

**EV Charger** — SVG energy flow visualization with animated chevrons, 15-row sensor telemetry, solar mode strip, max current adjuster, cable lock toggle.

</td>
</tr>
</table>

## Screenshots



## Installation (HACS)

### Stable (4.x)

1. Open HACS in Home Assistant
2. Go to **Integrations** → **Custom repositories**
3. Add `https://github.com/htiel/LCARS-lovelace-dashboard` as an **Integration**
4. Install **LCARS Dashboard**
5. Restart Home Assistant
6. Go to **Settings** → **Devices & Services** → **Add Integration** → **LCARS Dashboard**
7. Habitat dashboard appears in the sidebar — open it to verify

### Beta (5.x — Multi-Dashboard)

The 5.x beta includes the multi-dashboard architecture, dedicated dashboards (Tactical, Engineering, Life Support, Illumination, Cetacean Ops), config flow picker, and sidebar reorder.

1. Install LCARS Dashboard via HACS using the stable steps above (if not already installed)
2. In HACS, find **LCARS Dashboard** in your installed integrations
3. Click the **⋮** (three-dot menu) → **Redownload**
4. Toggle **Show beta versions** ON
5. Select the latest `5.x.x-beta.x` version from the dropdown
6. Click **Download**
7. Restart Home Assistant

To return to stable, repeat steps 2–6 but toggle **Show beta versions** OFF and select the latest `4.x.x` version.

### Enabling Additional Dashboards

After installation, enable more dashboards via the options flow:

1. **Settings** → **Devices & Services** → **LCARS Dashboard** → **Configure**
2. Check the dashboards you want (Tactical, Engineering, Life Support, Illumination, Cetacean Ops)
3. Optionally customize each dashboard's sidebar title and icon
4. Click **Submit** — new dashboards appear in the sidebar immediately

### Upgrading from 4.x

If you're upgrading from LCARS Dashboard 4.x:

- The single "LCARS Dashboard" panel is automatically migrated to the new **Habitat** dashboard
- Your existing sidebar title and icon are preserved and mapped to the Habitat entry
- The URL path changes from `lcars-dashboard` to `lcars-habitat` — update any bookmarks
- All 5.0 features (multi-dashboard, config flow picker, sidebar reorder) become available
- No manual YAML migration is needed — the integration handles it on first load

## Architecture

| Layer | Technology |
|-------|-----------|
| HA Integration | Python custom component (`lcars_dashboard`) — config flow, WebSocket API, YAML processing |
| Dashboards | 6 independent Lovelace YAML panels, each with dedicated layout component and entity classifier |
| Frontend | Lit Element v2 web components — 12 extracted panel elements + 6 layout components + shared base class |
| Build | Webpack 5 → single `lcars-dashboard.js` bundle (~951 KiB), output to `js/dist/` |
| Styling | 3-tier CSS composition: base variables → component shadow DOM → panel-specific modules |
| Components | 7 shared components: `<lcars-panel-frame>`, `<lcars-sensor-row>`, `<lcars-section-divider>`, `<lcars-option-strip>`, `<lcars-setpoint>`, `<lcars-segmented-bar>`, `<lcars-summary-badge>` |
| Communication | WebSocket API (35+ commands) + window custom events |
| Config | Two-step options flow: dashboard selection → per-dashboard title/icon customization |

### Dashboard Registration Flow

```
config_flow.py                    const.py                        load_dashboard.py
┌──────────────┐                 ┌──────────────────┐            ┌─────────────────────┐
│ Options Flow │──── saves ────→ │ DASHBOARD_REGISTRY│──── maps → │ _register_single_   │
│ Step 1: Pick │                 │ 6 dashboard defs  │            │  dashboard()         │
│ Step 2: Name │                 └──────────────────┘            │                     │
└──────────────┘                                                  │ → LovelaceYAML panel│
        ↓                                                         │ → Sidebar entry     │
  entry.options                                                   └─────────────────────┘
  {dashboards: [...],                                                      ↓
   habitat_title: "...",                                          ui-lovelace-{key}.yaml
   security_icon: "..."}                                          + layout component
```

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for the full version history.

## Issues & Feature Requests

Found a bug or have an idea? File it on GitHub:

- [**Report a Bug**](https://github.com/htiel/LCARS-lovelace-dashboard/issues/new?template=bug_report.yml) — something broken or unexpected
- [**Request a Feature**](https://github.com/htiel/LCARS-lovelace-dashboard/issues/new?template=feature_request.yml) — suggest a new capability or enhancement
- [**Browse Open Issues**](https://github.com/htiel/LCARS-lovelace-dashboard/issues) — see what's already reported

When reporting a bug, please include your LCARS Dashboard version, HA version, and steps to reproduce.

## Attribution

This project is a fork of [Dwains Dashboard](https://github.com/dwainscheeren/dwains-lovelace-dashboard) by **Dwain Scheeren** ([@dwainscheeren](https://github.com/dwainscheeren)).

The original Dwains Dashboard provided the Home Assistant integration architecture, auto-generating dashboard engine, websocket API, and Lovelace panel registration. The LCARS visual redesign, new Lit web components, and self-contained dependency bundling are by [@htiel](https://github.com/htiel).

### LCARS Design Attribution

LCARS (Library Computer Access/Retrieval System) is the fictional computer interface from Star Trek, designed by scenic art supervisor **Michael Okuda**. The visual language — elbows, pill buttons, flat colors, uppercase typography — is commonly known as the "Okudagram" style.

> STAR TREK and related marks are trademarks of CBS Studios Inc. This project is a fan work and is not affiliated with or endorsed by CBS Studios Inc. or Paramount Global.

The LCARS visual design in this project draws from the following community references:

| Resource | Author | Contribution |
|----------|--------|-------------|
| [TheLCARS.com](https://www.thelcars.com/) | Jim Robertus | Canonical LCARS web template — color palette, typography rules, layout structure |
| [LCARS CSS Framework](https://github.com/joernweissenborn/lcars) | Jörn Weißenborn | Grid system mathematics — base unit (7.5rem), vertical unit (3rem), 0.25rem gap, elbow proportions |
| [Bracer Jack's LCARS Guidelines](http://www.lcars-terminal.de/tutorial/guideline.htm) | Bracer Jack | Design theory & manifesto — thick↔thin rule, color count limits, the "swept is LCARS" philosophy |
| [System 47](https://www.mewho.com/system47/) | Mewho | Animation timing reference — scrolling data, panel refresh rhythms, audio grammar |
| [Ex Astris Scientia](https://www.ex-astris-scientia.org/inconsistencies/lcars.htm) | Bernd Schneider | Screen-accurate LCARS analysis across all Trek series — canonical color evolution, layout patterns |
| [lcars R Package](https://leonawicz.github.io/lcars/) | Matthew Leonawicz | Era-specific color palettes (2357/TNG, 2369/DS9, 2375/Voyager, 2379/Nemesis) |

LCARS Inspired Website Template by [www.TheLCARS.com](https://www.thelcars.com/), with modifications.

### Third-party components included

| Component | Author | License | Source |
|-----------|--------|---------|--------|
| card-tools | Thomas Loven | MIT | [lovelace-card-tools](https://github.com/thomasloven/lovelace-card-tools) |
| custom-card-helpers | Bram Kragten | Apache-2.0 | [custom-card-helpers](https://github.com/custom-cards/custom-card-helpers) |
| Antonio font | Vernon Adams | OFL-1.1 | [Google Fonts](https://fonts.google.com/specimen/Antonio) |
| lit-element / lit-html | Google | BSD-3-Clause | [Lit](https://lit.dev) |
| sortablejs | RubaXa | MIT | [SortableJS](https://github.com/SortableJS/Sortable) |
| js-cookie | js-cookie | MIT | [js-cookie](https://github.com/js-cookie/js-cookie) |
| @mdi/js | Pictogrammers | Apache-2.0 | [MDI](https://materialdesignicons.com) |

## License

MIT - see [LICENSE.md](LICENSE.md)