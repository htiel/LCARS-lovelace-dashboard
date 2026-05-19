# Subspace Relay Dashboard

> Network operations: WAN throughput, UniFi controller health, equipment status, client roster.

[← Back to README](../README.md) · [Spec: LCARS-SUBSPACE-RELAY-DASHBOARD-SPEC.md](../specs/LCARS-SUBSPACE-RELAY-DASHBOARD-SPEC.md)

<p align="center">
  <a href="../examples/screenshots/subspace-relay.png"><img src="../examples/screenshots/subspace-relay.png" alt="Subspace Relay dashboard screenshot" width="640"></a>
</p>

## Sidebar Metadata

| Field | Value |
|-------|-------|
| Default sidebar title | **Subspace Relay** |
| Frame color | butterscotch + ice |
| Sidebar filters | ALL / NETWORK / EQUIPMENT / WAN / CLIENTS |
| Enabled by default | No (enable via integration options) |

## What It Shows

- **WAN throughput**: ISP download/upload, latency, packet loss
- **UniFi controller telemetry**: health score, gateway uptime, AP count, switch count
- **Equipment status**: per-AP / per-switch / per-gateway online state with last-seen pip
- **Client roster**: connected wireless + wired clients, by AP / VLAN, with signal strength bars

## Entity Discovery

UniFi Network integration entities (gateway, APs, switches, clients) plus speedtest.net / Ookla domains for WAN telemetry.

## Integrations

- **Network controller**: UniFi Network (Unifi OS, UDM Pro / UDM-SE, Cloud Key)
- **WAN test**: speedtest.net, Ookla Speedtest, Cloudflare Speed
- **Ancillary**: Pi-hole, AdGuard Home (DNS sink stats)

## Related Specs

- [LCARS-SUBSPACE-RELAY-DASHBOARD-SPEC.md](../specs/LCARS-SUBSPACE-RELAY-DASHBOARD-SPEC.md)
