# Starship Health Dashboard

> Ship-wide health overview combining engineering and tactical summaries on a single screen.

[← Back to README](../README.md) · [Spec: LCARS-STARSHIP-HEALTH-DASHBOARD-SPEC.md](../specs/LCARS-STARSHIP-HEALTH-DASHBOARD-SPEC.md)

<p align="center">
  <a href="../examples/screenshots/starship-health.png"><img src="../examples/screenshots/starship-health.png" alt="Starship Health dashboard screenshot" width="640"></a>
</p>

## Sidebar Metadata

| Field | Value |
|-------|-------|
| Default sidebar title | **Starship Health** |
| Frame color | gold + butterscotch |
| Sidebar filters | SUMMARY / ENGINEERING / TACTICAL |
| Enabled by default | No (enable via integration options) |

## What It Shows

Top-level cross-system health view: power, network, security, and environmental status surfaced as a single board with deep-link buttons into the individual dashboards.

- **SUMMARY**: composite system status (all green / yellow / red roll-up)
- **ENGINEERING**: power flow, battery SoC, UPS state, top loads
- **TACTICAL**: alarm state, perimeter integrity, camera health

## Integrations

Consumes data already published to the other LCARS dashboards — no integration-specific entities required.

## Related Specs

- [LCARS-STARSHIP-HEALTH-DASHBOARD-SPEC.md](../specs/LCARS-STARSHIP-HEALTH-DASHBOARD-SPEC.md)
