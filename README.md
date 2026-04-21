# LCARS Dashboard

<p align="center">
  <img src="https://raw.githubusercontent.com/htiel/LCARS-lovelace-dashboard/4.0/custom_components/lcars_dashboard/logo@2x.png" alt="LCARS Dashboard Logo" width="512">
</p>

A Home Assistant custom dashboard with a full Star Trek LCARS (Library Computer Access/Retrieval System) interface.

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
![GitHub stars](https://img.shields.io/github/stars/htiel/LCARS-lovelace-dashboard?style=social)
![Version](https://img.shields.io/badge/version-4.23.0--beta.1-blue)
![HA](https://img.shields.io/badge/Home%20Assistant-2025.4%2B-blue)
[![GitHub issues](https://img.shields.io/github/issues/htiel/LCARS-lovelace-dashboard)](https://github.com/htiel/LCARS-lovelace-dashboard/issues)

## Features

### Layout & Navigation
- **LCARS Frame** — Authentic elbows, header/footer bars, endcaps, and sidebar in the classic Okudagram style
- **Floor-Grouped Sidebar** — Areas grouped by HA floor with clickable floor headers (lilac); click a floor for combined view, click an area to drill down
- **Smart Name Shortening** — Automatically strips area and device name prefixes from entity names for cleaner display
- **Device-Grouped Layout** — Entities organized by device, then sorted by domain (cameras first, sensors last)
- **Responsive** — Mobile-friendly with horizontal area scroll on narrow viewports
- **Panel Reorder** — Edit mode gear pip on each panel for persistent reorder within an area (saved via WebSocket to YAML)

### Auto-Detected Panels

The dashboard auto-discovers devices and routes them to the correct panel using a priority-ordered classifier: camera → alarm → pool/spa → climate → media → environment → irrigation → weather → ev charger → power → battery. Area-level composite panels (life support, illumination) aggregate entities across devices. Diagnostic and config entities (`entity_category`) are filtered from classification signals to prevent false positives (e.g., TP-Link CO Status sensors no longer trigger hazard detection). Platform-aware exclusions prevent galley appliances, pool equipment, and wallbox cable locks from being absorbed by Life Support or Tactical.

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
Album art viewscreen with transport controls (play/pause/prev/next/shuffle/repeat) gated by `supported_features` bitmask, click-to-set volume bar with keyboard arrow support, source/shuffle/repeat metadata, 12-bar audio waveform visualizer.
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
Animated particle cylinder with AQI-mapped colors, 24h SVG sparklines, fan/preset controls, CO₂ 3-tier threshold coloring (ice/sunflower/tomato), filter life segment bar (10 segments with critical pulse animation). Sensor-only mode for monitor-only devices (compact readout grid without cylinder). Sparkline labels use canonical device_class names (PM₂.₅, CO₂, VOC).
- **Integrations**: Awair, VeSync purifiers, BlueAir (Blue Pure 311i Max), SwitchBot meters (WoTHP/WoTHPc)

#### Power Systems Panel
Consolidated per-area power monitoring with three sections: CIRCUITS (tile grid), MONITORED DEVICES (toggle + stats rows), POWER STRIPS (parent→child blocks with per-outlet sliding track toggles). SVG half-arc distribution chart for 3+ sources, singleton popover for circuit detail, 240V pair detection, SHOW ALL truncation for 12+ items.
- **Smart dedup**: Excludes aggregate circuits (Balance/Total/Mains) and UPS parent wattage when children are present
- **Integrations**: Emporia Vue, TP-Link Kasa (KP115, KP125M, HS110, HS300), Shelly Pro 3EM

#### Warp Core Battery Panel
CSS reactor core with charge-level color, SOC gauge, power flow I/O arrows, telemetry sensors, integrated config/diagnostic entity controls with LCARS option strips. NUT UPS devices auto-detected with Grid→UPS→Load flow, load/runtime telemetry, and NUT status code parsing (OL/OB/CHRG/LB/FSD).
- **Integrations**: EcoFlow (River, Delta), Victron, Tesla Powerwall, NUT (CyberPower, APC, Tripp Lite, Eaton)

#### EV Charger Panel
Bidirectional EV charger monitoring with SVG energy flow visualization (animated chevron cascade for charging/V2G, directional flip, idle dashes), 15-row sensor telemetry column (status, session, energy balance, vehicle, charger), solar mode radio strip, max charging current ±adjuster, and cable lock toggle. Dynamic frame color by charger state (charging=butterscotch, V2G=ice, error=tomato, idle=lilac). SoC progress bar with 4-tier color coding.
- **Integrations**: Wallbox (Vilya V2G, Pulsar Plus)

#### Life Support Panel
Area-level composite panel aggregating climate, environment (air quality), and ambient sensor entities into a unified view. Four graceful degradation configurations: full (thermostat + purifier + sensors), atmos-only, climate-only, and sensor-hero (standalone temp/humidity). Composes existing climate and environment panels as nested substations. Adaptive sparkline tray shows 24-hour trends for temperature, humidity, AQI, PM2.5, CO₂, VOC. HomeKit air purifiers (fan + AQ sensor on same device) auto-detected.
- **Integrations**: Any combination of climate entities, air quality devices, and ambient sensors in an area, plus HomeKit Controller purifiers (Smartmi P1, etc.)

#### Illumination Control Panel
Area-level lighting panel spanning full width as the primary room control. Multi-column responsive grid (2-3 lights per row). Full-width brightness bars with color temperature awareness (warm amber to cool white). **Effect strip**: 2-column LCARS pill grid for Nanoleaf/Govee/smart light effects — active effect shown in bar value. **Color presets**: 6 LCARS palette pills (Warm, Cool, Red, Green, Blue, Purple) for HS/RGB color lights. Toggle-only lights show ON/OFF without slider. Scene activation strip and lighting circuit toggles (explicit `isLightingEntity()` match required — irrigation, battery, HVAC, and appliance switches excluded). Inline brightness slider with keyboard navigation. Drag-and-drop reorder in edit mode with FLIP animation. Custom order persisted per area via localStorage.
- **Entity detection**: Insteon dimmers/relays (SwitchLinc/LampLinc/ToggleLinc — platform-level detection), infrastructure LED exclusion (UniFi, ESPHome status), device-level dedup
- **Integrations**: Any `light` domain entities, Nanoleaf, Govee, lighting switches (auto-detected by name heuristic), HA scenes

### Domain-Specific Renderers

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
- **GPU-Composited** — All animations use `transform`/`opacity` for 60fps rendering
- **`prefers-reduced-motion`** — Comprehensive overrides: ambient loops disabled, confirmations halved, static fallbacks

### Security & Accessibility
- **Alarm PIN** — Rate-limited (3 attempts/60s), never logged or in DOM attributes, digit-only sanitization
- **Media artwork** — URL validation restricts to `/api/` or `/local/` paths
- **Setpoint clamping** — Temperature controls validated against entity min/max with absolute bounds
- **Service call throttling** — Token-bucket rate limiter on all device control calls
- **ARIA landmarks** — Full keyboard navigation, `role` structure, `aria-live` announcements
- **WCAG 2.2 AA** — Color-blind safe indicators, focus-visible outlines, 24×24px minimum targets
- **Self-contained** — All fonts (Antonio) and dependencies vendored locally, no external CDN calls

## Panel Gallery

> **[View the interactive panel gallery →](https://htmlpreview.github.io/?https://github.com/htiel/LCARS-lovelace-dashboard/blob/4.0/examples/lcars-panel-gallery.html)**
> Open `examples/lcars-panel-gallery.html` in a browser to see static mockups of all 17 panel types with sample data.

<table>
<tr>
<td width="50%">

**Illumination Control** — Full-width lighting panel with brightness bars, effect strip, color presets, scenes, and circuit toggles.

</td>
<td width="50%">

**Climate** — SVG temperature arc with segmented fill, dual setpoints, HVAC/fan/preset mode strips, sibling zone summary.

</td>
</tr>
<tr>
<td>

**Environment / Atmoscrubber** — AQI cylinder with particle animation, PM2.5/CO₂/VOC sensor rows, 24h sparkline tray, fan controls.

</td>
<td>

**Battery / Warp Core** — Charge-level reactor core with SOC gauge, power flow telemetry, NUT UPS status parsing.

</td>
</tr>
<tr>
<td>

**Alarm** — Shield viewscreen, zone sensor roster, rate-limited PIN keypad, arm mode strip with countdown.

</td>
<td>

**Media** — Album art viewscreen, 12-bar audio waveform, transport toolbar, volume slider with keyboard support.

</td>
</tr>
<tr>
<td>

**Power Systems** — Circuit tile grid with 5-tier color coding, smart plug toggles, power strip parent/child blocks, SVG arc chart.

</td>
<td>

**Camera** — LCARS-framed viewscreen with three-state display (connecting, live, offline), sensor rows, privacy controls.

</td>
</tr>
<tr>
<td>

**Weather** — Condition display with ambient glow, forecast strip with range bars, sun arc indicator, wind compass.

</td>
<td>

**Irrigation** — Zone rows with photo thumbnails, barberpole progress, countdown timers, schedule strips, Quick Run builder.

</td>
</tr>
<tr>
<td>

**Pool & Spa** — Dual body viewscreens, chemistry segmented bars (pH, chlorine, salt), circuit groups, freeze protection.

</td>
<td>

**Life Support** — Composite panel composing climate + environment substations, ambient sensor row, adaptive sparkline tray.

</td>
</tr>
<tr>
<td>

**Tactical** — Composite security panel: alarm control (nested substation), lock toggles, perimeter sensor chips, motion indicators. Subsumes alarm panel.

</td>
<td>

**Viewport Controls** — Blinds/shades/covers with open/close/stop controls and position percentage display.

</td>
</tr>
<tr>
<td>

**Hazard Detection** — Smoke/CO/heat detector status grid (Nest Protect), per-device cards with battery overview.

</td>
<td>

**Galley Systems** — Smart appliance cards (GE Home, LG SmartThinQ) with cook status, temperature, and timer display.

</td>
</tr>
<tr>
<td>

**EV Charger** — SVG energy flow visualization with animated chevrons, 15-row sensor telemetry, solar mode strip, max current adjuster, cable lock toggle.

</td>
<td>

</td>
</tr>
</table>

## Screenshots

### Area View — Environment Panels
<p align="center">
  <img src="https://raw.githubusercontent.com/htiel/LCARS-lovelace-dashboard/4.0/screenshots/Bedroom.png" alt="Master Bedroom with Awair and Air Purifier environment panels" width="100%">
</p>

### Area View — Battery Panel
<p align="center">
  <img src="https://raw.githubusercontent.com/htiel/LCARS-lovelace-dashboard/4.0/screenshots/Office.png" alt="Office with EcoFlow River 3+ warp core battery panel" width="100%">
</p>

### Floor Navigation
<p align="center">
  <img src="https://raw.githubusercontent.com/htiel/LCARS-lovelace-dashboard/4.0/screenshots/Entrance.png" alt="Entrance area view with floor-grouped sidebar navigation" width="100%">
</p>

## Installation (HACS)

1. Open HACS in Home Assistant
2. Go to **Integrations** → **Custom repositories**
3. Add `https://github.com/htiel/LCARS-lovelace-dashboard` as an **Integration**
4. Install **LCARS Dashboard**
5. Restart Home Assistant
6. Go to **Settings** → **Devices & Services** → **Add Integration** → **LCARS Dashboard**

## Architecture

| Layer | Technology |
|-------|-----------|
| HA Integration | Python custom component (`lcars_dashboard`) |
| Frontend | Lit Element v2 web components — 12 extracted panel elements + shared base class |
| Build | Webpack 5 → single `lcars-dashboard.js` bundle (~651 KiB) |
| Styling | 3-tier CSS composition: base variables → component shadow DOM → panel-specific modules |
| Components | 7 shared components: `<lcars-panel-frame>`, `<lcars-sensor-row>`, `<lcars-section-divider>`, `<lcars-option-strip>`, `<lcars-setpoint>`, `<lcars-segmented-bar>`, `<lcars-summary-badge>` |
| Communication | WebSocket API + window custom events |

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