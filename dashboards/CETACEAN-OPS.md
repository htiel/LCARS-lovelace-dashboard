# Cetacean Ops Dashboard

> Pool & spa operations — named after Enterprise-D's aquatic monitoring station on Deck 13.

[← Back to README](../README.md) · [Spec: LCARS-CETACEAN-OPS-SPEC.md](../specs/LCARS-CETACEAN-OPS-SPEC.md)

<p align="center">
  <a href="../examples/screenshots/cetacean-ops.png"><img src="../examples/screenshots/cetacean-ops.png" alt="Cetacean Ops dashboard screenshot" width="640"></a>
</p>

## Sidebar Metadata

| Field | Value |
|-------|-------|
| Default sidebar title | **Cetacean Ops** |
| Frame color | sky |
| Sidebar filters | ALL / WATER / CHEMISTRY / FEATURES / POWER |
| Enabled by default | No (enable via integration options) |

## What It Shows

- **Water body viewscreens**: pool=ice, spa=butterscotch, with caustic shimmer animation
- **Chemistry Langford gauges**: pH, ORP, salt, free chlorine
- **Pump telemetry**: speed, flow rate, pressure, runtime
- **Water feature toggles**: spillover, lights, jets, waterfalls
- **Per-equipment power circuit breakdowns** from Emporia Vue (pump, heater, salt cell, sanitizer)

## Entity Discovery

- Platform-based O(1) set membership against pool platforms (`screenlogic`, `waterguru`)
- Emporia Vue keyword matching for pool circuits (pump, heater, salt cell, etc.)

## Integrations

- **Pool controllers**: Pentair ScreenLogic, Jandy iAqualink
- **Chemistry monitors**: WaterGuru GrandeBridge S2
- **Pool circuit power**: Emporia Vue

## Related Specs

- [LCARS-POOL-SPA-PANEL-SPEC.md](../specs/LCARS-POOL-SPA-PANEL-SPEC.md)
