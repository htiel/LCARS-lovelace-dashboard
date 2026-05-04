# LCARS Life Support Dashboard Spec (5X-2.4)

> Life Support / Environmental — climate, temperature, humidity, air quality.
> Frame color: `--lcars-bluey` (#8899ff). Sidebar: african-violet.
> Filters: ALL / CLIMATE / AIR
> **Updated**: 2026-05-03 — current as of v5.1.0-beta.38. 3-column layout + per-room AQ + history sparklines shipped in v5.1.0-beta.16; per-room PRESENCE column added in v5.1.0-beta.34; sidebar 7-column table fix in v5.1.0-beta.35; quad-agent QA polish (`.ls-temp-grid` class, PRESENCE keyboard a11y, `lcarsLog.debug`) in v5.1.0-beta.36.

---

## §1 Entity Scope

| Domain | Device Classes | Count (this instance) |
|--------|---------------|----------------------|
| `climate` | — | 9 thermostats |
| `sensor` | temperature | 101 |
| `sensor` | humidity | 36 |
| `sensor` | pm25 | 11 |
| `sensor` | pm10 | 6 |
| `sensor` | carbon_dioxide | 3 |
| `sensor` | volatile_organic_compounds | 2 |
| `sensor` | aqi | 4 |
| `fan` | — | 23 (includes air purifiers) |

**Entity classifiers**: `isEnvironmentEntity()`, `isClimateEntity()`, `isAmbientSensor()`, `isAirPurifierEntity()`, `isAQSensorEntity()` from `lcars-entity-utils.js`.

---

## §2 Layout Structure

```
┌──────────────────────────────────────────────────────────┐
│ [Elbow]  SITE NAME ════════════════════════ [🔇][⚙]    │
├──────────┬───────────────────────────────────────────────┤
│          │  SHIP-WIDE ENVIRONMENT SUMMARY               │
│ LIFE     │  INDOOR: 72°F | OUTDOOR: 58°F | AQI: 42    │
│ SUPPORT  │  HVAC: 3 HEATING · 1 COOLING · 5 IDLE       │
│          │  [██ MAIN 72° ████ UPSTAIRS 74° █ BSMT 68°] │
│          ├───────────────────────────────────────────────┤
│ ┌──────┐ │  LIVING ROOM ────────────────────────        │
│ │ ALL  │ │  ┌──────────────┐ ┌────────┐ ┌────────┐     │
│ │      │ │  │ THERMOSTAT   │ │ 72°F   │ │ 45% RH │     │
│ ├──────┤ │  │ 72° → 74°    │ │ TEMP   │ │ HUMID  │     │
│ │CLIMA │ │  │ HEATING      │ └────────┘ └────────┘     │
│ │      │ │  │ [mode pills] │                            │
│ ├──────┤ │  └──────────────┘                            │
│ │ AIR  │ │                                              │
│ │      │ │  OFFICE ─────────── ┌────────┐ ┌────────┐   │
│ ├──────┤ │  ┌──────────────┐   │ PM2.5  │ │ CO₂    │   │
│ │▓▓▓▓▓▓│ │  │ AIR PURIFIER │   │ 12 μg  │ │ 420ppm │   │
│ │filler│ │  │ FAN: AUTO    │   │ ████   │ │ ████   │   │
├──────────┤  └──────────────┘   └────────┘ └────────┘   │
│ [Elbow]  ═══ LCARS 5.0.0 ══════════════════             │
└──────────┴───────────────────────────────────────────────┘
```

---

## §3 Device Elements

### §3.1 Climate Card (Compact)
- Bordered card with `--lcars-bluey` left accent rail (4px)
- Header: thermostat name + HVAC action badge (HEATING/COOLING/IDLE)
- Current temp: large (`1.75rem`), `--lcars-space-white`
- Target temp: medium (`1rem`), `→ {target}°`, `--lcars-ice`
- HVAC action badge colors:
  - Heating: `--lcars-butterscotch`
  - Cooling: `--lcars-ice`
  - Idle: `--lcars-gray`
  - Off: `--lcars-gray`
- Tap → `showMoreInfo()` for full climate controls (setpoint, mode, fan)
- Keyboard: `Enter`/`Space` to open (WCAG 2.1.1)
- `aria-expanded` on trigger (APG Disclosure pattern)

### §3.2 Temperature/Humidity Sensor Tile
- Compact card: device name + value + unit
- Temperature color by comfort zone:
  - 68-74°F: `--lcars-ice` (comfortable)
  - <68°F: `--lcars-bluey` (cold)
  - 74-80°F: `--lcars-butterscotch` (warm)
  - >80°F: `--lcars-tomato` (hot)
- Humidity: `--lcars-ice` default, `--lcars-butterscotch` if >60%, `--lcars-tomato` if >80%
- Text value always shown alongside color (WCAG 1.4.1)

### §3.3 AQ Sensor Row
- Compact horizontal row: sensor name | value | unit | color indicator
- AQ tier coloring:
  - Good (0-50): `--lcars-ice`
  - Moderate (50-100): `--lcars-sunflower`
  - Unhealthy Sensitive (100-150): `--lcars-butterscotch`
  - Unhealthy (150+): `--lcars-tomato`
- Grouped by type: PM2.5, PM10, CO₂, VOC, AQI

### §3.4 Fan/Purifier Toggle Pill
- LCARS pill button: fan name + ON/OFF state
- ON: `--lcars-bluey`, OFF: `--lcars-gray`
- Tap → toggle fan
- Context menu → `showMoreInfo()` for speed control

### §3.5 Atmoscrubber Panel (Reused)
- Reuse `<lcars-environment-panel>` from Habitat for air purifier devices
- Cylinder visualization, AQ score, filter life bar, fan control strip

---

## §4 Hero Element: Ship-Wide Environment Summary

Full-width 2-row block below header. Text uses `color: var(--lcars-black, #000)` for WCAG contrast on colored backgrounds (5X-B05). Labels use `opacity: 0.75` for visual hierarchy while maintaining ≥4.5:1 contrast ratio on bluey (`#8899ff`).

**Row 1** — four data blocks:
| Block | Content | Source |
|-------|---------|--------|
| INDOOR AVG | Average of all indoor temperature sensors | `sensor.*` where `device_class: temperature`, area assigned |
| OUTDOOR | Outdoor temp from weather entity | `weather.home` |
| WORST AQI | Highest AQI value + area name | `sensor.*` where `device_class: aqi` |
| HVAC | Count by action: `{n} HEATING · {n} COOLING · {n} IDLE` | `climate.*` attributes |

**Row 2** — Deck Cross-Section Bar:
- Horizontal segmented bar, one segment per floor
- Each segment: floor name + average temp
- Color = comfort zone (same as §3.2 temperature colors)
- Text labels on each segment (WCAG 1.4.1)

---

## §5 Filter Behavior

| Filter | Shows |
|--------|-------|
| ALL | All environmental entities |
| CLIMATE | `climate` domain + temperature + humidity sensors |
| AIR | AQ sensors (PM2.5/PM10/CO₂/VOC/AQI) + fan/humidifier entities |

---

## §6 Reused Components

- `<lcars-climate-panel>` — full thermostat control (reference for compact variant)
- `<lcars-environment-panel>` — atmoscrubber visualization for air purifiers
- `<lcars-lifesupport-panel>` — composed panel (reference for entity partitioning)
- Internal Sensors Grid tiles — temp/humidity compact display
- Sparkline renderer — 24h trend lines for sensors (160×32px max dimensions, 5X-B20)
- `formatNumber()` from `lcars-format-utils.js`

### Entity Filtering (5X-B15)

Camera-derived binary sensors (motion, tamper, CO from Blink/UniFi Protect camera devices) are filtered from Life Support's `_partitionEntities()`. A first pass collects device IDs for all `camera` domain entities, then binary sensors belonging to those devices are skipped. This prevents camera diagnostic sensors from appearing as safety/environmental entities.

---

## §7 Mobile Responsiveness

- 4-column sensor grid → 2-column on `max-width: 767px`
- Touch targets ≥ 24×24 CSS px (WCAG 2.5.8)
- Climate cards remain full-width on mobile
