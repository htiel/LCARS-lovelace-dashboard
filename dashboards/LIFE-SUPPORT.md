# Life Support Dashboard

> Environmental monitoring with 3-column layout (main content + air quality sidebar).

[← Back to README](../README.md) · [Spec: LCARS-LIFESUPPORT-DASHBOARD-SPEC.md](../specs/LCARS-LIFESUPPORT-DASHBOARD-SPEC.md)

<p align="center">
  <a href="../examples/screenshots/life-support.png"><img src="../examples/screenshots/life-support.png" alt="Life Support dashboard screenshot" width="640"></a>
</p>

## Sidebar Metadata

| Field | Value |
|-------|-------|
| Default sidebar title | **Life Support** |
| Frame color | bluey |
| Sidebar filters | ALL / CLIMATE / AIR |
| Enabled by default | No (enable via integration options) |

## What It Shows

- **Overview cards**: 4 ring gauge summary cards (Purifiers, Thermostats, AQ, Environment) with distinct border colors, glowing rings, and action buttons (VIEW DETAILS / VIEW ZONES)
- **Air Purifiers table**: Location, Model, Status, Speed, Filter life bar (with shimmer animation), PM2.5 — color-coded
- **Per-room atmosphere**: 7-column comparison table (Score, PM2.5, CO₂, VOC, Temp, RH) — area-grouped, averaged, purifier sensors excluded
- **CO₂ sparklines**: Per-room 24h trend lines below the atmosphere table
- **AQ sidebar**: Hero AQI ring gauge (96px, glowing), metric rows (PM2.5, PM10, CO₂, TVOC), 24h history sparklines
- **Environment sidebar**: 24h temperature + humidity sparklines
- **Combined climate panel**: Thermostat zones + temp/humidity grid in one section

## Animations

Scanning section headers, thermostat breathing glow (warm/cool), AQ hero pulse, filter bar shimmer, ring gauge glow.

## Integrations

- **Thermostats**: Nest, Ecobee, Honeywell, Z-Wave thermostats, Midea portable AC (midea_ac_lan)
- **Air purifiers**: VeSync, BlueAir (Blue Pure 311i Max), HomeKit (Smartmi P1, etc.)
- **Ambient sensors**: Awair, SwitchBot meters (WoTHP/WoTHPc)

## Related Specs

- [LCARS-CLIMATE-PANEL-SPEC.md](../specs/LCARS-CLIMATE-PANEL-SPEC.md)
- [LCARS-ATMOSCRUBBER-SPEC.md](../specs/LCARS-ATMOSCRUBBER-SPEC.md)
- [LCARS-AIR-PURIFIER-VERIFICATION-SPEC.md](../specs/LCARS-AIR-PURIFIER-VERIFICATION-SPEC.md)
- [LCARS-TEMP-HUMIDITY-GRID-SPEC.md](../specs/LCARS-TEMP-HUMIDITY-GRID-SPEC.md)
- [LCARS-PORTABLE-AC-ADDENDUM.md](../specs/LCARS-PORTABLE-AC-ADDENDUM.md)
- [LCARS-WEATHER-PANEL-SPEC.md](../specs/LCARS-WEATHER-PANEL-SPEC.md)
