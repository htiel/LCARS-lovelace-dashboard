# LCARS Dashboard

<p align="center">
  <img src="https://raw.githubusercontent.com/htiel/LCARS-lovelace-dashboard/4.0/custom_components/lcars_dashboard/logo@2x.png" alt="LCARS Dashboard Logo" width="512">
</p>

A Home Assistant custom dashboard with a full Star Trek LCARS (Library Computer Access/Retrieval System) interface.

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
![GitHub stars](https://img.shields.io/github/stars/htiel/LCARS-lovelace-dashboard?style=social)
![Version](https://img.shields.io/badge/version-4.13.0-blue)
![HA](https://img.shields.io/badge/Home%20Assistant-2025.4%2B-blue)
[![GitHub issues](https://img.shields.io/github/issues/htiel/LCARS-lovelace-dashboard)](https://github.com/htiel/LCARS-lovelace-dashboard/issues)

## Features

- **LCARS Frame Layout** — Authentic elbows, header/footer bars, endcaps, and sidebar in the classic Okudagram style
- **Floor-Grouped Area Navigation** — Areas grouped by HA floor in the sidebar with clickable floor headers (lilac); click a floor for combined view, click an area to drill down
- **Domain-Specific Entity Renderers**
  - Camera → LCARS-framed live feed with viewscreen activation animation
  - Light / Switch / Fan / Lock → Toggle pills with heartbeat pulse
  - Sensor / Binary Sensor → Data readout bars with segmented fill
  - Climate → Thermostat arc with setpoint controls, HVAC mode strips, dual setpoint for heat_cool (Nest, Ecobee)
  - Alarm → Shield viewscreen with PIN keypad, arm mode selector, zone roster, countdown timer (SimpliSafe, Honeywell, Ring)
  - Media Player → Album art viewscreen with transport controls, volume bar, source metadata (Apple TV, HomePod, Sonos)
  - Pool & Spa → Dual body viewscreens with chemistry readouts, circuit toggles, pool lighting (Pentair ScreenLogic)
  - Weather → Condition display with wind compass, 7-day forecast strip, lightning/precipitation sensors (Davis, WeatherFlow)
  - Irrigation → Zone list with START/STOP controls, active fill bar, standby toggle (Rachio)
  - Cover → Position controls
- **Warp Core Battery Panel** — Auto-detects battery devices (EcoFlow, etc.), renders CSS reactor core with charge-level color, SOC gauge, power flow I/O arrows, telemetry sensors, and integrated config/diagnostic entity controls with LCARS option strips
- **Atmoscrubber Environment Panel** — Auto-detects air quality devices (Awair, VeSync purifiers, etc.), renders animated particle cylinder with AQI-mapped colors, 24h SVG sparklines, fan/preset controls, and sensor-only mode for monitor-only devices
- **Smart Name Shortening** — Automatically strips area and device name prefixes from entity names for cleaner display
- **Device-Grouped Layout** — Entities organized by device, then sorted by domain (cameras first, sensors last)
- **6 LCARS Animations** — Cascade reveal, scan sweep, viewscreen activation, heartbeat pulse, distress pulse, segmented sensor bars
- **Dynamic Panel Visuals** — Frame breathing pulse, data pip footers, numeric code watermarks, audio waveform, caustic water shimmer, wind compass, weather glow, barberpole flow, particle system, comfort glow tiles. All animations GPU-composited and `prefers-reduced-motion` safe
- **9-Panel Auto-Detection** — Priority-ordered device classifier routes entities to the correct panel: camera → alarm → pool/spa → climate → media → environment → irrigation → weather → battery
- **Security Hardened** — Alarm PIN rate-limiting (3 attempts/60s), media artwork URL validation, temperature setpoint clamping, service call throttling
- **Self-Contained** — All fonts (Antonio) and dependencies vendored locally, no external CDN calls
- **Responsive** — Mobile-friendly layout with horizontal area scroll on narrow viewports
- **Accessible** — ARIA landmarks, keyboard navigation, `prefers-reduced-motion` support

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
| Frontend | Lit Element v2 web components |
| Build | Webpack 5 → single `lcars-dashboard.js` bundle (~316 KiB) |
| Styling | 40+ LCARS CSS custom properties in shared `lcars-styles.js` |
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