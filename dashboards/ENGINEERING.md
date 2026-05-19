# Engineering Dashboard

> Power distribution topology: Sources → Distribution Bus → Load Circuits.

[← Back to README](../README.md) · [Spec: LCARS-ENGINEERING-DASHBOARD-SPEC.md](../specs/LCARS-ENGINEERING-DASHBOARD-SPEC.md)

<p align="center">
  <a href="../examples/screenshots/power.png"><img src="../examples/screenshots/power.png" alt="Engineering / Power Distribution dashboard screenshot" width="640"></a>
</p>

## Sidebar Metadata

| Field | Value |
|-------|-------|
| Default sidebar title | **Power Distribution** |
| Frame color | butterscotch |
| Sidebar filters | ALL / STORAGE / CIRCUITS |
| Enabled by default | No (enable via integration options) |

## What It Shows

- **Source row**: GRID card (voltage/frequency/energy/power bar), UPS card, battery cards with animated mini warp core bars (SOC fill, idle pulse, charging stripes)
- **Distribution bus**: Butterscotch bar with solid EPS conduit connectors (6px source → 4px trunk) and breathing pulse
- **Voltage overview**: Three-tier display — HIGH VOLTAGE (>130V, tomato), HOME VOLTAGE (110–130V, auto-averaged, ice), LOW VOLTAGE (<110V, sunflower for doorbells/PoE)
- **Circuit grid**: Top 15 active circuits sorted by wattage, grouped by category (DEDICATED / OUTLETS / LIGHTING / INFRASTRUCTURE / BATTERY / OTHER), 4-tier color-coded bars, relative scaling
- **System status sidebar**: Total load, grid power, battery count, average SOC, total stored kWh, circuit count, health status

## Integrations

- **Energy monitors**: Emporia Vue, Shelly Pro 3EM
- **Smart plugs**: TP-Link Kasa (KP115, KP125M, HS110, HS300)
- **UPS**: NUT (CyberPower, APC, Tripp Lite, Eaton)
- **Batteries**: EcoFlow (River, Delta), Victron, Tesla Powerwall

## Tagging

Circuit category is auto-classified by name heuristic but can be explicitly overridden with Home Assistant Labels (`dedicated`, `infrastructure`, `lighting`, `outlets`, `battery`). See [TAGGING.md](../TAGGING.md) for the keyword fallback table and label setup.

## Double-Count Prevention

- Aggregate sensors (totalusage, balance, mainload) excluded from the circuit grid
- 240V L1/L2 pairs auto-deduplicated
- UPS parent wattage suppressed when children are present

## Deep Linking

Battery DETAIL ► navigates to Habitat with `#area:<area_id>` hash for cross-dashboard context.

## Accessibility

- `prefers-reduced-motion` fallback on all animations
- Keyboard focus on all interactive elements (WCAG 2.1.1)

## Related Specs

- [LCARS-POWER-PANEL-SPEC.md](../specs/LCARS-POWER-PANEL-SPEC.md)
- [LCARS-CONSOLIDATED-POWER-PANEL-SPEC.md](../specs/LCARS-CONSOLIDATED-POWER-PANEL-SPEC.md)
- [LCARS-POWER-PANEL-WESLEY-ADDENDUM.md](../specs/LCARS-POWER-PANEL-WESLEY-ADDENDUM.md)
- [LCARS-BATTERY-PANEL-SPEC.md](../specs/LCARS-BATTERY-PANEL-SPEC.md)
- [LCARS-EV-CHARGER-PANEL-SPEC.md](../specs/LCARS-EV-CHARGER-PANEL-SPEC.md)
