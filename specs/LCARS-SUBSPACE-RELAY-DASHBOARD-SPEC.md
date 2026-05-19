# LCARS Subspace Relay Dashboard — Design Specification

**Author**: Lt. Cmdr. Data (Architecture / Operations)
**Reviewed by**: Cmdr. William Riker (handoff to development)
**Coordination**: Geordi La Forge (UI), Worf (security review of client table)
**Date**: Stardate 2026.05.04
**Status**: PROPOSED — target v5.2.0-beta.1
**Priority**: MEDIUM-HIGH
**Branch**: `5.0`
**Replaces**: backlog item `5X-3.3 · "Stellar Cartography" — Network & Presence Dashboard` (retire on merge)
**Extends**: `LCARS-PANEL-EXTRACTION-ARCHITECTURE.md` (shared component pattern), `LCARS-AUDIO-SPEC.md` (audio mode `network`)

---

## 0. Design Philosophy

The Subspace Relay dashboard is modeled after the Enterprise-D's **communications and operations consoles** — the displays the Ops officer monitors to keep the bridge connected to Starfleet, the away teams, and every internal system. It is **operational telemetry**, not entertainment, not analytics: per-device CPU, memory, link state, port utilization, and end-to-end latency to known anchors.

This dashboard surfaces a body of data (313 entities from the `unifi` platform, 134 of them currently visible) that has been generating value silently in HA but has had no dedicated LCARS surface. Per the Roddenberry mandate, *the ship takes care of itself* — the dashboard reflects status, not configuration. Per Bracer Jack, **empty space is beautiful** — port grids, gauges, and sparklines float in black; no skeuomorphic switch chassis, no fake LEDs.

Per the Lower Decks easter-egg convention (gated by `dashboard_options.easter_eggs: true`, identical mechanism to Engineering's *"Rutherford's Engineering Bay"*), the alternate header reads **"Rutherford's Comms Closet"**.

---

## 1. Goals

1. Surface the existing 313 `unifi` entities in an at-a-glance LCARS form.
2. Provide WAN-health visibility (external IP, up/down, latency to three public anchors).
3. Expose per-device telemetry (CPU/RAM/temp/uptime/PoE) for gateways, switches, and APs.
4. Expose a filterable connected-clients table without conflating it with a presence dashboard.
5. Establish two new shared LCARS primitives — `<lcars-sparkline>` and `<lcars-gauge>` — that retroactively benefit Habitat, Engineering, and Cetacean Ops.
6. Carve a clean **ownership boundary** with Power Distribution for PoE wattage data.
7. Add a third sub-panel for **Equipment & Peripherals** (the new IPP printer plus future infra peripherals — see §7).

## 2. Non-Goals

- **Not a presence dashboard.** Who-is-home semantics belong with `person.*` joins, not raw `device_tracker` rows. Split into a separate Habitat Presence Panel (new backlog item `5X-3.4`).
- **Not a configuration UI.** No port-mode toggling, no firmware push, no client blocking. Read-only this release.
- **Not an analytics product.** Ring-buffer sparklines hold the last N samples held in memory; no historical querying, no LongTermStatistics joins this release.
- **Not a replacement for the UniFi web UI.** When power-user tasks are needed, the integration links out to the controller.

## 3. Dashboard Registration

| Field | Value |
|---|---|
| `key` (in `DASHBOARD_REGISTRY`) | `network` |
| `title` | `Subspace Relay` |
| `easter_egg_title` | `Rutherford's Comms Closet` |
| `subtitle` (LCARS frame) | `COMMUNICATIONS · LAN/WAN MONITORING` |
| `icon` | `mdi:lan` |
| `url_path` | `lcars-network` |
| `default_enabled` | `True` |
| `audio_mode` (per LCARS-AUDIO-SPEC) | `network` |
| `MAX_DASHBOARDS` | bump 6 → 8 (this + Medical) |

Slug rationale: the URL must match the **data domain** (`network`) so future ops searches and bookmarks Just Work; the LCARS theming lives in the title only. Same convention as `lcars-environmental` (Life Support) and `lcars-security` (Tactical).

Sidebar grouping: **top-level entry**, parallel to Power Distribution. Do **not** nest under Engineering — current sidebar group pattern is shallow and adding sub-entries for a single dashboard introduces a new mechanism for one consumer (YAGNI). If visual grouping under an "Operations" header is wanted later, do it once for {Engineering, Power, Network} as a separate ticket.

## 4. Entity Contract

### 4.1 Platform set

```
NETWORK_PLATFORMS = {
  'unifi',           // primary (today)
  // future: 'tplink_omada', 'mikrotik', 'opnsense'
}
```

### 4.2 Device kind classifier

Devices are grouped by HA device-registry `device_id`, not by `area_id`. A device's *kind* is derived from its model string (case-insensitive substring match):

| Pattern in model | `kind` | Icon | Section |
|---|---|---|---|
| `udm`, `usg`, `dream machine`, `gateway` | `gateway` | `mdi:router-network` | Network Health (top) |
| `usw`, `switch` | `switch` | `mdi:switch` | Network Health (mid) |
| `uap`, `u6`, `u7`, `unifi ap`, `access point` | `ap` | `mdi:access-point` | Network Health (mid) |
| (other) | `other` | `mdi:server-network` | Network Health (bottom) |

### 4.3 Per-device sub-sensor classification (by `entity_id` substring)

| Entity pattern | Role |
|---|---|
| `*_cpu_utilization`, `*_cpu_load` | CPU gauge |
| `*_memory_utilization`, `*_ram_*` | RAM gauge |
| `*_temperature` | temp readout |
| `*_uptime` | uptime |
| `*_state`, `binary_sensor.*_link` | up/down indicator (`#cc6666` / `#99cc99`) |
| `*_link_speed` | link speed badge |
| `*_poe_power` | per-port PoE watts → port grid cell color |
| `*_port_*` (numeric port id) | port grid cell |

### 4.4 WAN strip entities

- `sensor.*udm*_external_ip` → IP readout
- `sensor.*udm*_wan_*_download_throughput` / `*_upload_throughput` → ▼/▲ live values
- `binary_sensor.*wan*` → STATUS pill (`NOMINAL` / `DEGRADED` / `OFFLINE`)

### 4.5 WAN latency tri-graph

Filter: `entity_id LIKE '%latency%'` AND friendly_name contains one of `Google|Cloudflare|Microsoft`. Each becomes one sparkline row. Latency is sampled into a per-card ring buffer (last 60 values). No persistence.

### 4.6 Connected clients

All `device_tracker.*` from platform `unifi`. The 179 disabled-by-default trackers are excluded by checking `entity_registry.disabled_by !== null`. Per-row attributes used: `ip`, `mac`, `host_name`, `essid`, `signal`, `last_seen`, `is_wired`, `vlan` (if present in attrs).

> **Worf gate**: The clients table must **never** render plaintext MAC addresses or BSSIDs in screenshots. Client hostnames may be PII. Provide a `subspace.clients.redact_hostnames: false` config-flow option (default `false`, but Worf may flip default to `true` after review). The screenshot tool selector hook is `.lcars-network-redactable`.

> **As-shipped (5.5.7+, Captain decision 2026-05-10, #180 / #181):** the Connected Clients section is rendered as a button-tile grid (one button per client, `.client-tile` with hostname/MAC/SSID spans), not a default-collapsed semantic `<table>` with [All]/[Wired]/[Wi-Fi]/[LAN]/[IoT]/[Guest] filter chips, and there is no `.client-tile`-internal redaction. The button-grid surface ships and the spec is updated to match. Reasons: (a) the grid composes with the existing card hover/pop pattern; (b) the per-client identifiers Captain wants visible by default render in cleartext per #219, with screenshot redaction handled out-of-card via `data-network="hostname|mac|ssid"` attributes consumed by `localinfo/screenshot-obfuscator.js`; (c) the WAN latency tri-graph and the §4.6 filter-chip surface remain on the spec roadmap but as future enhancements rather than spec-drift bugs. Any future move to a semantic `<table>` must preserve the same `data-network` attribute hooks.

---

## 5. Layout

### 5.1 ASCII layout

```
┌─ WAN STATUS HERO STRIP (full width, ~80px) ────────────────────────┐
│  EXTERNAL IP  GATEWAY-PRIMARY    ▼ 942 Mbps   ▲ 38 Mbps   NOMINAL  │
└────────────────────────────────────────────────────────────────────┘
┌─ NETWORK HEALTH (left, 60%) ──────┬─ WAN LATENCY (right, 40%) ────┐
│  GATEWAY-PRIMARY  CPU 14% RAM 32% │  Google      8ms ▁▂▁▂▃▂▁     │
│                   TEMP 52°C UP 47d│  Cloudflare  6ms ▁▁▂▁▂▁▁     │
│  ─────────────────────────────────│  Microsoft  14ms ▁▂▃▄▃▂▁     │
│  SWITCH-CORE-24P  CPU 8%  UP 12d  │                               │
│   PoE: 84W / 250W                 │                               │
│   ┌─port grid: 24 cells──────┐    │                               │
│   │ ▣▣▣▢▣▢▢▢▣▣▢▢▢▢▢▣▣▢▢▢▢▢▢▢ │    │                               │
│   └──────────────────────────┘    │                               │
│  ─────────────────────────────────│                               │
│  AP-DECK-3        CPU 11% UP 8d   │                               │
│  AP-DECK-1        CPU 14% UP 30d  │                               │
└───────────────────────────────────┴───────────────────────────────┘
┌─ EQUIPMENT & PERIPHERALS (full width, collapsible) ────────────────┐
│  PRINTER · IPP-NODE-01           STATUS: IDLE     UP 6d            │
│   INK   ■■■■■■░░ BLK 78%   ■■■■░░░░ CYN 42%                       │
│         ■■■░░░░░ MAG 31%   ■■■░░░░░ YEL 33%                       │
│   (future: NAS, UPS infra peripherals)                             │
└────────────────────────────────────────────────────────────────────┘
┌─ CONNECTED CLIENTS (full width, collapsible) ──────────────────────┐
│  Filter: [All] [Wired] [Wi-Fi] [LAN] [IoT] [Guest]                 │
│  HOST           IP            VIA       SIG   LAST SEEN            │
│  CRW-001        10.0.4.31    AP-DECK-3 -52   just now              │
│  WORKSTATION-2  10.0.1.7     wired     —     2m ago                │
│  ...                                                                │
└────────────────────────────────────────────────────────────────────┘
```

### 5.2 CSS grid (sketch)

```css
.lcars-network-dashboard {
  display: grid;
  grid-template-areas:
    "wan      wan"
    "health   latency"
    "periph   periph"
    "clients  clients";
  grid-template-columns: 6fr 4fr;
  gap: var(--lcars-gap);
}
```

Frame-color rule: hero strip frame goes `var(--lcars-tomato)` when WAN STATUS is DEGRADED/OFFLINE, otherwise `var(--lcars-butterscotch)`. Per Bracer Jack rule 2 (thick → thin, never same), top/right borders 2px, bottom/left 4px.

---

## 6. Boundaries with Power Distribution

| Concern | Owner | Rationale |
|---|---|---|
| Total PoE wattage at the panel (Emporia circuit) | **Power Distribution** | Same data class as every other circuit — belongs with the load taxonomy. |
| Per-port PoE wattage (UniFi sensor per port) | **Subspace Relay** | Granular, only meaningful in switch context. |
| Per-device CPU / RAM / temp | **Subspace Relay** | Operational telemetry, not energy. |
| UDM "WAN status" binary | **Subspace Relay** | Comms domain. |
| UDM / switch firmware update available | **Subspace Relay** (small "MAINTENANCE" badge) | Same context as the device. |

No data class is duplicated across dashboards. Document this matrix in `LCARS-CONSOLIDATED-POWER-PANEL-SPEC.md` cross-link on merge.

---

## 7. Equipment & Peripherals sub-panel (handles new IPP printer)

### 7.1 Captain's order

A new IPP printer (`sensor.epson_et_3850_series` + ink-level sensors `*_black_ink|cyan_ink|magenta_ink|yellow_ink` + `*_uptime`, area `master_bedroom`, platform `ipp`) was added to HA and is currently unrouted — `_diff_mariner.py` puts the ink sensors in the generic `device` bucket. Captain has asked whether the printer belongs here or in its own micro-dashboard.

### 7.2 Recommendation

**Add as a third panel ("Equipment & Peripherals") on Subspace Relay.** Justification:

1. **Volume.** One printer + future NAS/UPS = ≤ 6 devices for the foreseeable future. A dedicated dashboard for ≤ 6 devices fails the "every byte must earn its place" directive. The Subspace Relay frame and audio mode are already paid for.
2. **Conceptual fit.** Printers, NAS, and UPSes are infrastructure peripherals — same operational class as switches and APs (low-touch, status-checked, occasionally-low-on-something). They share the operator's mental model with network gear far more than with HVAC or lighting.
3. **Reuse.** The same `<lcars-gauge>` and uptime readout components built for Network Health render the ink levels and printer uptime with zero new code.
4. **Discovery cost.** A printer status check is something the operator does quarterly, not daily — burying it inside a top-level dashboard already on the sidebar is the right level of prominence.

If the device count ever exceeds ~10 peripherals, promote to its own dashboard `lcars-infrastructure` (registry key `infra`). Tracked as `5X-3.6 · Promote Equipment Panel to Infrastructure Dashboard — DEFERRED`.

### 7.3 Entity discovery contract

```
PERIPHERAL_PLATFORMS = {
  'ipp',              // network printers (Epson, Brother, HP via IPP)
  'snmp_printer',     // future fallback for non-IPP
  // candidate: 'synology_dsm' (NAS), 'nut' (UPS) — but these have
  // power/health implications too; revisit ownership when they appear
}

PERIPHERAL_KINDS = {
  'printer': {
    icon: 'mdi:printer',
    primary_state: 'sensor.<device>_status' || 'sensor.<device>_series',
    sub_sensors: {
      'ink_level': /_(black|cyan|magenta|yellow)_ink$/,
      'uptime':    /_uptime$/,
    },
  },
}
```

### 7.4 `_diff_mariner.py` routing change

Today the four ink sensors land in the generic `device` bucket. Add an **`infra_peripheral`** tag for entities matching `PERIPHERAL_PLATFORMS`. The Subspace Relay card consumes the `infra_peripheral` bucket to populate this sub-panel. This is the same tag-as-routing convention used by `pool_spa`. Concrete change:

- Add `INFRA_PERIPHERAL_PLATFORMS = {'ipp'}` to `_diff_mariner.py` constants.
- In the entity classifier, when `platform in INFRA_PERIPHERAL_PLATFORMS`, set `tag = 'infra_peripheral'` (overrides generic `device` bucket).
- Add a unit-test fixture using a fictional printer entity (no real model strings).

### 7.5 Layout (per device)

```
PRINTER · IPP-NODE-01            STATUS: IDLE      UP 6d
INK   ■■■■■■░░ BLK 78%   ■■■■░░░░ CYN 42%
      ■■■░░░░░ MAG 31%   ■■■░░░░░ YEL 33%
```

Colors: ink bars use the actual ink color when ≥ 25%, fade to `var(--lcars-tomato)` below 25%. Triggers a single low-priority chirp (per audio mode `network`) on transition through 20%.

### 7.6 Privacy

Printer hostnames may include the household name (`epson_et_3850_series` is innocuous; user-renamed entities may not be). Apply the same `.lcars-network-redactable` selector hook used by the clients table.

---

## 8. New JS modules

| Module | Lines (est.) | Purpose | Visibility |
|---|---|---|---|
| `js/src/lcars-network-layout.js` | 250–350 | Frame, sidebar filter chips, audio mode wiring | dashboard-private |
| `js/src/lcars-network-card.js` | 600–900 | Top-level orchestrator: WAN strip, Health, Latency, Peripherals, Clients sections | dashboard-private |
| `js/src/lcars-network-port-grid.js` | 150–250 | NxM PoE/port cell grid | candidate-shared (promote on second consumer) |
| `js/src/lcars-network-utils.js` | 200–300 | `NETWORK_PLATFORMS`, `NETWORK_DEVICE_KINDS`, `PERIPHERAL_PLATFORMS`, classifiers | dashboard-private |
| `js/src/lcars-sparkline.js` | 120–180 | Inline-SVG mini-chart, LCARS-themed | **shared** (also used by Medical, Engineering, Cetacean) |
| `js/src/lcars-gauge.js` | 150–220 | CPU/RAM/temp percent gauge | **shared** (extracted from inline Habitat code, retroactively cleans up Habitat) |

Both shared components must be added to `LCARS-PANEL-EXTRACTION-ARCHITECTURE.md` as sanctioned shared primitives in the same PR.

**Bundle delta (estimated)**: +18 to +24 KiB minified, of which the `<lcars-gauge>` extraction recovers ~3–5 KiB from Habitat by deleting inline duplicates. Net projected bundle: ~920–925 KiB (baseline ~903 KiB at v5.0.2-beta.4 — re-measure on current beta before merge per the data-limits-policy memory).

---

## 9. Performance

The Connected Clients table touches the largest entity set (≤ 134 visible `device_tracker` rows). Mitigations:

- `shouldUpdate()` short-circuit using `Map<entity_id, lastStateHash>` (existing Habitat pattern).
- Default-collapsed Clients section; user expands on demand. Saves ~80% of render work on first paint.
- Sparkline updates throttled to once per 5 seconds even if state arrives faster.
- Port grid updated only when a port's `*_link_speed`, `*_state`, or `*_poe_power` changes — never on every tick.

Acceptance: first paint under 250 ms on a 4-year-old tablet; subsequent steady-state CPU under 3% on the renderer.

---

## 10. Audio (per LCARS-AUDIO-SPEC §2)

Audio mode `network`:

| Event | Tone |
|---|---|
| WAN status transition `NOMINAL` → `DEGRADED`/`OFFLINE` | tactical low-priority alert (existing) |
| Per-device link state up→down | single `acknowledge` chirp |
| Latency anchor exceeds 200 ms threshold | low-priority alert, **rate-limited to once per anchor per 5 min** |
| Ink level crosses 20% downward | single `acknowledge` chirp |
| Default | suppressed (no chirp on every per-second sensor update) |

---

## 11. Implementation Tasks (for Cmdr. Riker / dev hand-off)

### Phase 1 — Scaffolding (5.2.0-beta.1)

1. Bump `MAX_DASHBOARDS` to 8 in `const.py`.
2. Add `network` entry to `DASHBOARD_REGISTRY` with the fields in §3.
3. Add `default_enabled: bool` field to the registry entry schema (defaults to `True` if absent).
4. Update `config_flow.py` to honor `default_enabled` when generating the dashboard-picker schema (no special-cased keys).
5. Create `lovelace/ui-lovelace-network.yaml` (single view, `type: custom:lcars-network-layout`).
6. Verify `load_dashboard.py` resolves the new YAML generically (it should — zero changes expected).
7. Audio: register `network` mode in `lcars-audio.js` per §10.

### Phase 2 — Network Health panel (5.2.0-beta.1, continues)

8. Create `lcars-network-utils.js` with `NETWORK_PLATFORMS`, `NETWORK_DEVICE_KINDS`, and the §4.3 classifier.
9. Extract `<lcars-gauge>` from inline Habitat gauge code into `lcars-gauge.js`. Update Habitat card to consume it. Verify no visual regression on Habitat.
10. Implement `lcars-network-layout.js` (frame, sidebar filter chips: All / Gateways / Switches / APs / Peripherals / Clients).
11. Implement `lcars-network-card.js` Network Health section: device rows grouped by kind, gauges, port grid placeholder.
12. Implement `lcars-network-port-grid.js`. Geordi visual QA on the port grid before merge.

### Phase 3 — WAN strip + WAN Latency tri-graph (5.2.0-beta.2)

13. Implement `<lcars-sparkline>` (`lcars-sparkline.js`).
14. Implement WAN hero strip in `lcars-network-card.js`.
15. Implement WAN Latency tri-graph using `<lcars-sparkline>`.
16. Add 60-sample ring buffer per latency anchor. Throttle updates to 5 s.
17. Add `LCARS-PANEL-EXTRACTION-ARCHITECTURE.md` entries for `<lcars-sparkline>` and `<lcars-gauge>` as sanctioned shared primitives.

### Phase 4 — Equipment & Peripherals sub-panel (5.2.0-beta.2 cont.)

18. Add `INFRA_PERIPHERAL_PLATFORMS = {'ipp'}` to `_diff_mariner.py`; route matching entities to the `infra_peripheral` tag. Add a fixture-based unit test.
19. Add `PERIPHERAL_PLATFORMS` and `PERIPHERAL_KINDS` to `lcars-network-utils.js`.
20. Implement Equipment & Peripherals section in `lcars-network-card.js` (printer rendering per §7.5, ink-color ramp).

### Phase 5 — Connected Clients table (5.2.0-beta.2 cont.)

21. Implement Clients section, default-collapsed, with the §4.6 filter chips.
22. Add `subspace.clients.redact_hostnames` config-flow option (default `false`).
23. Apply `.lcars-network-redactable` selector to client hostnames, MAC, IP cells.
24. **Worf gate** before merge of beta.2: review the clients table for PII leakage and confirm screenshot redaction selector coverage.

### Phase 6 — Power boundary cleanup (5.2.0-beta.3)

25. Per §6 matrix: ensure per-port PoE sensors are NOT routed into the Power Distribution dashboard's circuit list. Add an exclusion to `_diff_mariner.py`.
26. Cross-link this spec from `LCARS-CONSOLIDATED-POWER-PANEL-SPEC.md`.
27. Update `plans/backlog-5x.md`: retire `5X-3.3`, link to this spec; add `5X-3.4 · Habitat Presence Panel` (LOW); add `5X-3.6 · Promote Equipment Panel to Infrastructure Dashboard — DEFERRED`.

### Phase 7 — Stable release (5.2.0)

28. Re-measure bundle size; confirm under 945 KiB ceiling.
29. Geordi final visual QA.
30. HACS release per `lcars-release-workflow` memory.

---

## 12. Open Questions for Cmdr. Riker

1. **Sidebar grouping**: confirm top-level entry, not nested under Engineering, before Phase 1.
2. **Easter-egg label**: is "Rutherford's Comms Closet" approved, or does Captain prefer another LD reference?
3. **Clients table default redaction**: should `redact_hostnames` default to `false` (operator-friendly) or `true` (privacy-default)? Worf input requested.
4. **Latency anchors**: are Google / Cloudflare / Microsoft the right three, or should one be replaced with the LAN gateway for asymmetric-fault diagnosis?
5. **Peripheral promotion threshold**: at what device count does Equipment & Peripherals graduate to its own `lcars-infrastructure` dashboard? Proposing 10; please confirm.
6. **Future NAS/UPS ownership**: when a `synology_dsm` or `nut` device appears, does its *health* go here and its *power* go to Power Distribution (mirroring §6)? Recommend yes; confirm.

---

## 13. Acceptance Criteria

- [ ] Dashboard renders at `/lcars-network` with all six sections (WAN strip, Health, Latency, Peripherals, Clients) when at least one matching entity exists.
- [ ] Sections with zero matching entities are omitted from the DOM (auto-hide pattern, per Habitat).
- [ ] WAN status frame color reflects `binary_sensor.*wan*` state.
- [ ] Per-device gauges, port grid, and uptime read correctly against a captured fixture of `unifi` entities.
- [ ] Latency tri-graph plots three anchors with 60-sample ring buffers.
- [ ] Printer panel renders four ink levels with color ramp; ink < 25% renders `var(--lcars-tomato)`.
- [ ] `<lcars-gauge>` extraction does not regress Habitat visually or behaviorally.
- [ ] Clients table excludes `disabled_by != null` trackers and respects `.lcars-network-redactable` selector.
- [ ] `_diff_mariner.py` routes IPP entities to the `infra_peripheral` tag (verified by test fixture).
- [ ] Bundle size delta ≤ +25 KiB; total bundle < 945 KiB.
- [ ] Worf signs off on Phase 5 (clients table) before stable.
- [ ] Geordi signs off on port grid (Phase 2) and biobed-strip-equivalent visual style.
- [ ] `plans/backlog-5x.md` updated: 5X-3.3 retired with link to this spec; 5X-3.4 added.

---

## 14. References

- `specs/LCARS-PANEL-EXTRACTION-ARCHITECTURE.md` — shared component pattern
- `specs/LCARS-AUDIO-SPEC.md` — audio mode definitions
- `specs/LCARS-CONSOLIDATED-POWER-PANEL-SPEC.md` — boundary partner
- `plans/backlog-5x.md` — backlog entry being retired (5X-3.3)
- `memories/repo/lcars-release-workflow.md` — release process
- `memories/repo/data-limits-policy.md` — bundle/file-size thresholds

---

## 15. Security Review — Lt. Worf, Chief of Security
*Filed: stardate 2026.05.04*

This dashboard renders network identifiers and topology. Most fields are GDPR-classified personal data (MAC addresses per WP29 Opinion 4/2007) or directly enable home-location disclosure (WAN IP). The primary threat surface is **screenshot leakage** — to support forums, vendor tickets, social media, and screen-share sessions.

### Threat model
| Threat | Likelihood | Impact | Mitigation status |
|---|---|---|---|
| WAN external IP leaked via screenshot → home geolocation | High | High | Default-redact required (BLOCKING) |
| MAC addresses leaked → device fingerprinting + GDPR personal data | High | Medium | Default-redact required (BLOCKING) |
| Guest device names leaked ("Gina's iPhone", "Wesley's Switch") | High | Medium | "Redact client names" toggle, default ON for screenshots (BLOCKING) |
| SSID names leaked → war-driving correlation, household identification | Medium | Medium | Default-redact in screenshot mode |
| VLAN IDs/names disclose network segmentation strategy | Low | Low | Document; redact in screenshot mode |
| Printer Bonjour name + IP fingerprints make/model + LAN topology | Medium | Low | Redact in screenshot mode |
| Hostnames reveal OS family / device role | Medium | Low | Redact with client names |
| WAN tri-graph latency anchors (Google/Cloudflare/MS) leak in-DOM URLs | Low | Low | Already public; acceptable |

### OWASP Top 10 mapping
- **A01 Broken Access Control** — Clients table data is admin-grade; if rendered to non-admin HA users it overshares. Recommend `require_admin: true` on this dashboard registration.
- **A04 Insecure Design** — Default visible state is the screenshot state. Design assumes "this WILL be shared."
- **A05 Security Misconfiguration** — Same CSP/closed-shadow-root posture as the rest of the suite.
- **A09 Logging Failures** — MAC/IP/hostname must not be logged via `console.*` substitution.

### Required hardening (BLOCKING)
- [ ] WAN external IP cell carries `data-network="wan-ip"` and is **default-redacted in screenshot mode** (`•••.•••.•••.•••`). User taps to reveal in normal view; reveal is per-session, not persisted.
- [ ] All MAC addresses carry `data-network="mac"` and render with last-three-octets masked in screenshot mode (`aa:bb:cc:••:••:••`). Full reveal in normal admin view.
- [ ] Connected Clients table includes a "Redact client names" toggle. Default ON. When ON, hostnames render as `client-{hash[0:6]}`.
- [ ] Screenshot obfuscator hook list (below) wired into `localinfo/screenshot-obfuscator.js` before stable release.
- [ ] Dashboard registered with `require_admin: true` (clients table is operationally admin-only).
- [ ] No outbound network requests from card itself (entity data via HA WebSocket only).

### Recommended hardening
- [ ] SSID names default-redacted in screenshot mode to first-3-chars + `•••`.
- [ ] VLAN names default-redacted in screenshot mode (numeric IDs may remain — low-disclosure).
- [ ] Printer Bonjour name redacted to `printer-{hash[0:4]}`; printer LAN IP redacted same as WAN policy.
- [ ] Document in spec README the threat model so users understand why redaction defaults are aggressive.
- [ ] Audit any new sparkline / topology library; prefer hand-authored SVG. No CDN assets.

### Screenshot redaction (obfuscator integration)
Obfuscator MUST hook these selectors when redaction mode is active on `/lcars-network`:
- `[data-network="wan-ip"]` — full mask
- `[data-network="mac"]` — last-three-octet mask
- `[data-network="ssid"]` — first-3 + ellipsis
- `[data-network="vlan-name"]` — full mask (numeric IDs may remain)
- `[data-network="hostname"]` → `client-{hash[0:6]}`
- `[data-network="printer-name"]` → `printer-{hash[0:4]}`
- `lcars-clients-table >>> .row` — shadow-piercing for table rows

### Data classification & retention
- **Classification**: Personal data under GDPR (MAC, hostname, IP). Confidential.
- **Retention in card**: in-memory only for current view.
- **Retention in HA recorder**: governed by `unifi` / `nmap_tracker` integrations; out of scope. Recommend users review recorder `exclude` rules for device_tracker entities.
- **Retention in screenshot artifacts**: zero — redaction default-on.

### Sign-off condition
I will sign off when: (1) all BLOCKING items checked; (2) `require_admin: true` confirmed on the dashboard registration; (3) obfuscator hook list wired and tested against a live `/lcars-network` view; (4) the §13 "clients table excludes `disabled_by != null`" criterion is verified against a fixture containing disabled trackers. *A warrior does not abandon his post because standing is uncomfortable.*

---

## Engineering Console Review — Lt. Cmdr. Geordi La Forge
*Filed: stardate 2026.05.04*

### Visual / LCARS grammar
Classic elbow + pill frame, Antonio, ALL-CAPS labels + numerics. Frame color: recommend `--lcars-bluey` (#8899ff) — distinct from Habitat (butterscotch) and Tactical (ice), reads semantically as comms. Port grid: solid flat tiles, 0.25rem gap, pill radius. Gauges extracted from Habitat keep flat fills only — no gradients.

### Accessibility (WCAG 2.2 AA, EAA, EN 301 549)
The Connected Clients table is the highest-risk surface. Required: semantic `<table>` with `<thead>`/`<th scope="col">`/`<tbody>` (no div-grid imitations); sortable header `<button>` inside `<th>` with `aria-sort`, Enter/Space activated (SC 2.1.1); filter result count in `aria-live="polite"` region (SC 4.1.3); 44×44 sort/action targets (SC 2.5.5); 2px `--lcars-ice` focus ring (SC 2.4.7/2.4.13). **WAN tri-graph (§4.5)**: three lines need line-style (solid / dashed `4 2` / dotted `1 2`) AND endpoint markers (circle/square/triangle) in addition to hue — SC 1.4.1. **Printer ink <25%**: add textual `LOW` or `▼` glyph alongside `--lcars-tomato` (color-alone is insufficient). LCARS dark-only — document `prefers-color-scheme` ignored. 200% zoom: clients table collapses to card stack below 600 CSS px (SC 1.4.10).

### Audio grammar (per LCARS-AUDIO-SPEC)
Spec declares `audio_mode: network` — this mode **does not exist** in `LCARS-AUDIO-SPEC.md` (canonical: `medical`, `engineering`). Resolve before merge: (a) change to `engineering` (recommended — same envelope), or (b) PR `network` mode into the audio spec with full sound table first. WAN-down: `alert` (sawtooth 880 Hz ×3, 260ms) appropriate; `criticalAlert` is reserved for safety-of-life and must NOT fire for network outages. Mute persists via shared `lcars-audio-muted` key.

### Required changes (blocking)
- [ ] Resolve `audio_mode: network` — either change §3 to `engineering`, or land an audio-spec PR defining `network` first.
- [ ] Connected Clients: semantic `<table>` with sortable `<th>`/`<button>`, `aria-sort`, keyboard-operable sort, and `aria-live` filter-count region.
- [ ] WAN tri-graph: add line-style + endpoint-marker differentiation in addition to color.
- [ ] Printer ink low: textual/glyph indicator alongside `--lcars-tomato`.
- [ ] Document frame color = `--lcars-bluey`; add to the Frame Color table in `lcars-dashboard-layout.js`.
- [ ] `prefers-reduced-motion: reduce` disables sparkline draw-in and any port-status pulse.
- [ ] 44×44 touch targets for sort buttons, gauge tap-throughs, WAN retry/refresh.

### Suggestions (non-blocking)
- [ ] "Jump to first DOWN device" skip-link at top of Health section.
- [ ] Row state badges fire `toggle` on transition only, not on initial render.
- [ ] `aria-label="Subspace Relay"` override on any Lower-Decks dashboard title.

### Sign-off condition
Audio-mode resolved, clients table re-architected, tri-graph differentiation added before v5.2.0-beta.2. Geordi re-reviews port grid and clients table against rendered builds before stable.

---

## XO Implementation Review — Cmdr. William Riker
*Filed: stardate 2026.05.04*

### Answers to Data's open questions
1. Sidebar stays top-level. Do not invent nested Engineering subnav for one dashboard.
2. `Rutherford's Comms Closet` is approved. It reads operational, not jokey.
3. `subspace.clients.redact_hostnames` defaults to `true`. Operator convenience does not outrank screenshot-safe defaults.
4. Revise latency anchors to `Gateway + Cloudflare + Google`. That gives LAN, edge, and public-internet separation in one glance.
5. Peripheral promotion threshold stays at 10 devices, but also trigger review sooner if 3+ distinct peripheral kinds appear.
6. Confirmed: NAS/UPS health belongs here; UPS wattage and circuit impact stay in Power Distribution.

### Sequencing & dependencies
Keep ship order at `5.2.0 -> 5.3.0 -> 5.4.0`, but split scope inside this release: ship WAN strip, Network Health, shared primitives, registry plumbing, and Equipment/Peripherals in `5.2.0`; move Connected Clients to `5.2.1` unless Worf signs hostname/IP/MAC redaction and screenshot coverage before beta freeze. Dependency chain: registry `default_enabled` plumbing -> `<lcars-gauge>` extraction -> `<lcars-sparkline>` -> WAN/Health -> `_diff_mariner.py` peripheral routing -> clients hardening. Backlog hygiene: retire `5X-3.3` on merge; keep `5X-3.4 Habitat Presence Panel`; keep `5X-3.6 Promote Equipment Panel to Infrastructure Dashboard`; add a distinct follow-on for deferred clients if split rather than overloading `5X-3.3` again. Capacity: 19 points if clients defer, 22 if included. Critical path: shared primitive extraction plus WAN/Health integration.

### Story breakdown (epic → stories)
Epic: Subspace Relay v5.2.x
1. Registry + shell plumbing — Size S, 2 pts, deps none. AC: `network` dashboard registers cleanly, `default_enabled` schema works generically, audio mode `network` active.
2. Shared primitives extraction — Size M, 3 pts, deps 1. AC: `<lcars-gauge>` extracted with no Habitat regression; `<lcars-sparkline>` renders 60-sample SVG with LCARS tokens.
3. Network Health panel — Size L, 5 pts, deps 1-2. AC: gateway/switch/AP grouping works; gauges, uptime, link state, and port grid render from `unifi` fixtures; per-port PoE appears only here.
4. WAN hero + latency tri-graph — Size M, 3 pts, deps 2. AC: gateway/Cloudflare/Google anchors chart independently; ring buffers throttle at 5s; WAN pill drives frame color.
5. Equipment & Peripherals — Size M, 3 pts, deps 1,3. AC: IPP routes to `infra_peripheral`; printer block renders uptime plus four ink bars with low-ink color ramp.
6. Clients table hardening — Size M, 3 pts, deps 1. AC: section defaults collapsed; disabled trackers excluded; hostname/IP/MAC cells redact by default and screenshot selector coverage is testable.

### Definition of Done (additions to spec's acceptance criteria)
- [ ] Add a visual QA screenshot to `examples/` for WAN/Health/Peripherals and a separate redacted clients capture if 5.2.1 ships it.
- [ ] Extend the screenshot-obfuscator selector map for `.lcars-network-redactable` and verify the default-redacted path in CI or scripted QA.
- [ ] Add `CHANGELOG.md` entry and update the README Panel Gallery with the new dashboard.
- [ ] Draft HACS release notes and a beta tester checklist covering WAN outage, high latency, printer low-ink, and clients redaction cases.
- [ ] Update `plans/backlog-5x.md` with `5X-3.3` retired and the deferred clients slice explicitly tracked if split.

### Risk register (Six Sigma FMEA)
| Risk | Severity | Occurrence | Detection | RPN | Mitigation |
|---|---:|---:|---:|---:|---|
| Client hostname/IP/MAC leaks in screenshots or DOM | 8 | 5 | 5 | 200 | Default hostname redaction `true`, screenshot selector audit, Worf review before clients ship |
| Latency-data churn corrupts sparkline cache or misorders samples | 6 | 5 | 6 | 180 | Ring buffer keyed per anchor, monotonic timestamp guard, 5s throttle |
| PoE data double-owned with Power dashboard | 7 | 4 | 5 | 140 | `_diff_mariner.py` exclusion test plus boundary cross-link in Power spec |
| Disabled-by-default trackers reappear in clients table | 5 | 6 | 5 | 150 | Entity-registry `disabled_by` filter with fixture coverage |
| IPP sensors stay in generic device bucket and peripherals panel renders empty | 4 | 6 | 4 | 96 | Add `infra_peripheral` routing test fixture and dashboard empty-state QA |

### Make it so?
GO-WITH-CONDITIONS. This is the right `5.2.x` first move for the v5 line, but I do not want the clients table holding the release hostage. Ship the operational core in `5.2.0`, retire `5X-3.3`, and only keep clients in the same tag if Worf signs the privacy surface and the redaction default flips to `true`.

---

## Innovation Review — Acting Ensign Wesley Crusher
*Filed: stardate 2026.05.04*

### What's exciting here
A real network-ops surface in LCARS chrome is overdue, and the WAN-status-frame-color move is the kind of *ambient* signal that makes a dashboard feel alive — you'll know your internet is down before you try to load a page. The auto-hide-empty-section pattern is the right scaling story: this dashboard quietly grows as the homelab grows. Latency tri-graph is a great primitive — three anchors is the minimum that distinguishes "my ISP" from "the internet."

### HA/HACS ecosystem opportunities
UniFi-adjacent integrations that could each earn a tab on this dashboard:

| HACS | Repo pattern | Adds | Caveat |
|---|---|---|---|
| UniFi Voucher | `github.com/dirkgroenen/ha-unifi-voucher` | Guest WiFi voucher generation as an HA action | Requires UniFi local admin |
| UniFi Protect | core integration + `github.com/AngellusMortis/pyunifiprotect` extras | Camera health, doorbell events, snapshot tiles | Native HA covers most; extras add detection metadata |
| UniFi Access | `github.com/kjy00302/ha-unifi-access` | Door-lock state, badge-in events | UniFi Access controller required |

Each maps cleanly to a new section: **GUEST**, **SURVEILLANCE**, **ACCESS**. Recommend reserving sidebar slots now.

WAN quality is currently latency-only; complement with:
- **Speedtest.net** (HA core integration) — periodic down/up/ping, charts in the WAN strip.
- **Cloudflare Speed Test** (`github.com/EarthlingDavey/ha-cloudflare-speedtest`) — measures via Cloudflare edge; better signal for non-Ookla-routed traffic.

### Modern web platform leverage
- **WebSocket subscription** to `device_tracker` state changes (HA's `subscribe_entities`) instead of polling — instant client-table updates, lower bridge load.
- **`<details name="topology">` exclusive-disclosure groups** for the AP/Switch/UDM expandable rows — newly Baseline; only one row open at a time, zero JS, full keyboard support.
- **Intersection Observer** for sparkline lazy rendering — devices scrolled out of view skip their rAF tick. Big win once client count exceeds ~30.
- **CSS `@container` queries** on the port grid — collapses 24-port switches to a denser 2-row layout on narrower viewports without JS measurement.
- **`navigator.connection.effectiveType`** displayed as a tiny client-side pill in the WAN strip — "YOUR LINK: 4G" hints when a phone viewer is on cellular vs. home WiFi.

### Stretch features (post-MVP)
- **ESP32 mmWave radar (LD2410/MR24HPC1)** per-room → cross-correlate physical presence with WiFi-attached client list. Table column: `WIFI ✓ / PRESENT ✓` vs. `WIFI ✓ / EMPTY` (forgotten phone) vs. `WIFI ✗ / PRESENT ✓` (visitor without guest creds — gentle nudge to issue voucher).
- **ESPHome BLE proxy** mesh visualization — show which AP-adjacent ESP32 is acting as proxy for which BLE device. Reveals BLE coverage holes.
- **Pi-hole MQTT panel** (`github.com/arevm/pihole-stats-mqtt` style) — queries/sec, blocked %, top blocked domain, all in LCARS pills.
- **Attic WireGuard tunnel state** — `binary_sensor.wireguard_*` from the `wireguard` HACS integration → small "VPN UP/DOWN" pill in WAN strip.

### "What if we…?"
- **"Follow Me" media handoff visualization** — when `media_player` cast target changes rooms, draw a brief animated pulse along the path through the WiFi connection table from old AP → new AP. Pure eye candy that makes the network feel intentional.
- **Topology weather map** — color APs by current channel utilization (green/amber/tomato) and show inter-AP roaming events as ghost trails.
- **Voucher QR auto-generated as guest enters geofence** — visitor's phone enters `zone.driveway` → HA Assist offers "Issue 24h voucher?" → QR pops on the kitchen wall tablet.

### Sign-off
**ENTHUSIASTIC** — this is the dashboard I personally check most often, and the boundary-discipline with Power Distribution / Starship Health is exactly right. Ship Phase 1-3 fast; Phase 5 (clients table) is where Worf's review will matter most (PII surface).

