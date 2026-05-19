# Habitat Dashboard

> Room-by-room device control — the main LCARS dashboard. Floor-grouped sidebar, auto-detected panels per area, and area deep linking.

[← Back to README](../README.md) · [Spec: LCARS-HABITAT-DASHBOARD-SPEC.md](../specs/LCARS-HABITAT-DASHBOARD-SPEC.md)

<p align="center">
  <a href="../examples/screenshots/habitat.png"><img src="../examples/screenshots/habitat.png" alt="Habitat dashboard screenshot" width="640"></a>
</p>

## Sidebar Metadata

| Field | Value |
|-------|-------|
| Default sidebar title | **Habitat** |
| Frame color | butterscotch |
| Sidebar filters | Area navigation (floor-grouped) |
| Enabled by default | ✅ Yes (the only dashboard enabled at install time) |

## What It Shows

Floor-grouped sidebar of areas; selecting a floor shows a combined view, selecting an area drills down to that room. Inside each area, entities are auto-classified into device-grouped panels (cameras first, sensors last). Entity names are intelligently shortened (area and device prefixes stripped) for cleaner display.

## Auto-Detected Panels

The Habitat dashboard auto-discovers devices and routes them to the correct panel using a priority-ordered classifier:

```
camera → alarm → pool/spa → climate → media → environment → irrigation
       → weather → ev charger → power → battery
```

Area-level composite panels (Life Support, Illumination) aggregate entities across devices. Diagnostic and config entities (`entity_category`) are filtered from classification signals to prevent false positives. Platform-aware exclusions prevent galley appliances, pool equipment, and wallbox cable locks from being absorbed by Life Support or Tactical.

### Camera Panel
Live camera feeds with LCARS-framed viewscreen and activation animation. Three-state display: ESTABLISHING LINK (connecting), live feed, VIEWSCREEN OFFLINE (error/timeout). Stale image prevention via forced src binding on room switch.
- **Integrations**: Any HA camera entity (UniFi Protect, Amcrest, ONVIF, Reolink, etc.)

### Climate Panel
Thermostat control with SVG temperature arc, dynamic HVAC action colors (heating=butterscotch, cooling=ice), debounced setpoint controls with safety clamping, HVAC mode/fan mode/preset mode/swing mode strips, dual setpoint support for heat_cool mode. Portable AC support: auxiliary switch toggles (eco/turbo/swing) with per-switch colors, timer stepper.
- **Integrations**: Nest, Ecobee, Honeywell, Z-Wave thermostats, Midea portable AC (midea_ac_lan)

### Alarm Panel
Shield viewscreen with state-reactive glow, digit-only PIN keypad with 3-attempt/60s rate limiting, arm mode selector strip, zone sensor roster with micro-pip status and inline sibling telemetry (battery/illuminance), arming countdown with urgency escalation.
- **Integrations**: SimpliSafe, Honeywell Home, Ring, Alarmo

### Media Panel
Album art viewscreen with transport controls (play/pause/prev/next/shuffle/repeat) gated by `supported_features` bitmask, click-to-set volume bar with keyboard arrow support, source/shuffle/repeat metadata, 12-bar audio waveform visualizer. Transport controls and volume hidden when player is idle/standby/off.
- **Integrations**: Apple TV, HomePod, Sonos, Chromecast, Plex

### Pool & Spa Panel
Dual body viewscreens (pool=ice, spa=butterscotch) with setpoint controls, circuit toggles, chemistry sensor readouts (pH, ORP, salt), pool lighting controls, caustic water shimmer animation.
- **Integrations**: Pentair ScreenLogic, Jandy iAqualink

### Weather Panel
SVG condition display with ambient glow, wind compass with gust oscillation, 7-day forecast strip with range bars and precipitation probability pips, sun arc with tracking dot.
- **Integrations**: Davis Instruments, WeatherFlow Tempest, NWS, OpenWeatherMap

### Irrigation Panel
Full-featured irrigation control with zone photo thumbnails (from Rachio cloud, with vegetation icon fallback), expandable zone detail badges (shade, vegetation type, slope), barberpole flow animation with real-time progress tracking, countdown timer, schedule management strips (Flex/Fixed type badges), controller status telemetry (connectivity, standby, rain delay, rain sensor), conditional rain alert banner, Quick Run builder (multi-zone selector + duration + ENGAGE), and pause/resume/stop-all controls.
- **Entity coverage**: Zone switches (with photos, attributes), schedule switches, standby/rain-delay controller, connectivity/rain binary sensors
- **Rachio services**: `start_watering`, `start_multiple_zone_schedule`, `pause_watering`, `resume_watering`, `stop_watering`
- **Integrations**: Rachio, RainMachine, OpenSprinkler

### Environment / Atmoscrubber Panel
Animated particle cylinder with AQI-mapped colors, 24h SVG sparklines, fan/preset controls, CO₂ 3-tier threshold coloring (ice/sunflower/tomato), filter life segment bar (10 segments with critical pulse animation). AQI and PM2.5 scale labels below score numbers for metric disambiguation. Sensor-only mode for monitor-only devices (compact readout grid without cylinder). Sparkline labels use canonical device_class names (PM₂.₅, CO₂, VOC).
- **Integrations**: Awair, VeSync purifiers, BlueAir (Blue Pure 311i Max), SwitchBot meters (WoTHP/WoTHPc)

### Power Systems Panel
Consolidated per-area power monitoring with three sections: CIRCUITS (tile grid), MONITORED DEVICES (toggle + stats rows), POWER STRIPS (parent→child blocks with per-outlet sliding track toggles). SVG half-arc distribution chart for 3+ sources, singleton popover for circuit detail, 240V pair detection, SHOW ALL truncation for 12+ items.
- **Smart dedup**: Excludes aggregate circuits (Balance/Total/Mains) and UPS parent wattage when children are present
- **Integrations**: Emporia Vue, TP-Link Kasa (KP115, KP125M, HS110, HS300), Shelly Pro 3EM

### Warp Core Battery Panel
CSS reactor core with charge-level color, SOC gauge, power flow I/O arrows, telemetry sensors, integrated config/diagnostic entity controls with LCARS option strips. NUT UPS devices auto-detected with Grid→UPS→Load flow, load/runtime telemetry, and NUT status code parsing (OL/OB/CHRG/LB/FSD).
- **Integrations**: EcoFlow (River, Delta), Victron, Tesla Powerwall, NUT (CyberPower, APC, Tripp Lite, Eaton)

### EV Charger Panel
Bidirectional EV charger monitoring with SVG energy flow visualization (animated chevron cascade for charging/V2G, directional flip, idle dashes), 15-row sensor telemetry column (status, session, energy balance, vehicle, charger), solar mode radio strip, max charging current ±adjuster, and cable lock toggle. Dynamic frame color by charger state (charging=butterscotch, V2G=ice, error=tomato, idle=lilac). SoC progress bar with 4-tier color coding. Offline empty state with gray "OFFLINE" badge when charger is unavailable.
- **Integrations**: Wallbox (Vilya V2G, Pulsar Plus)

### Life Support Panel (per-area)
Area-level composite panel aggregating climate, environment (air quality), and ambient sensor entities into a unified view. Four graceful degradation configurations: full (thermostat + purifier + sensors), atmos-only, climate-only, and sensor-hero (standalone temp/humidity). Composes existing climate and environment panels as nested substations. Adaptive sparkline tray (160×32px) shows 24-hour trends for temperature, humidity, AQI, PM2.5, CO₂, VOC. Camera-derived binary sensors (motion/tamper) auto-filtered. HomeKit air purifiers (fan + AQ sensor on same device) auto-detected.
- **Integrations**: Any combination of climate entities, air quality devices, and ambient sensors in an area, plus HomeKit Controller purifiers (Smartmi P1, etc.)

## Domain-Specific Renderers

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

## Edit Mode

- **Panel reorder** — gear pip on each panel for persistent reorder within an area (saved via WebSocket to YAML)
- **Deep linking** — URL hash navigation (`#area:<area_id>`) for bookmarking and cross-dashboard links
- **Responsive (Geordi-canon, beta.37+)** — On phone widths (≤ 767 px) the LCARS swept silhouette is preserved (PADD canon — never flipped to a horizontal bar). The frame narrows to one elbow unit (~88 px), and area buttons collapse to **icon-only** (the area's `mdi:` icon, with `aria-label` + `title=` for screen readers and long-press)

## Tagging

Camera location and circuit classification can be overridden via Home Assistant Labels. See [TAGGING.md](../TAGGING.md).
