# LCARS Starship Health Dashboard — Design Specification

**Author**: Lt. Cmdr. Data (Architecture / Operations)
**Reviewed by**: Cmdr. William Riker (handoff to development)
**Coordination**: Geordi (UI), Worf (privacy review on host-identifier handling — §7), Wesley (multi-vessel roadmap)
**Date**: Stardate 2026.05.04
**Status**: PROPOSED — target v5.4.0-beta.1 (ships **after** Medical Bay v5.3.0 validates the silhouette+callout primitive)
**Priority**: MEDIUM
**Branch**: `5.0`
**Privacy class**: Operational telemetry — host identifiers redacted by default
**Extends**: `LCARS-PANEL-EXTRACTION-ARCHITECTURE.md` (depends on the generalized `<lcars-anatomical-silhouette>` primitive), `LCARS-MEDICAL-BAY-DASHBOARD-SPEC.md` (parent of the silhouette+callout pattern), `LCARS-AUDIO-SPEC.md` (audio mode `engineering`), `LCARS-SUBSPACE-RELAY-DASHBOARD-SPEC.md` (`<lcars-sparkline>`)

---

## 0. Design Philosophy

Starship Health applies the Medical Bay **Biofunction Monitor** pattern — silhouette + anatomical callouts + threshold-driven status pill — to the **Home Assistant compute substrate**. Where Medical surfaces a humanoid silhouette with callouts at heart / lungs / abdomen, Starship surfaces an LCARS-styled vessel silhouette with callouts at bridge / saucer / nacelles / warp core. Each enrolled host is one **vessel**; each subsystem of the vessel is anchored to a measurable host metric (CPU, memory, disk, temperature, throughput, container count, etc.).

The conceit is operationally honest: a Home Assistant install *is* a small starship — a flight-deck (HA Core), a computer (memory + storage), engineering (CPU/temperature), nacelles (throughput), a shuttlebay (containers/add-ons), and a deflector (WAN reachability). Surfacing telemetry at those metaphorical anchors makes systemic problems legible at a glance: a red port nacelle reads as "one CPU is hot," a red deflector reads as "internet is down" — without forcing the operator to translate raw metric names.

Per Roddenberry, *the ship reports its own status*. Per Bracer Jack, *empty space is beautiful* — the silhouette breathes, callouts are sparse. The threshold engine collapses dozens of raw sensors into a four-state pill (`NOMINAL` / `DEGRADED` / `WARNING` / `CRITICAL` / `OFFLINE`) so the operator's eye lands on the pill first, the offending region second, the numeric value third.

Per the Lower Decks easter-egg convention (gated by `dashboard_options.easter_eggs: true`), the alternate header reads **"Rutherford's Engineering Console"**.

---

## 1. Goals

1. Render one **Vessel Diagnostic Card** per enrolled HA-managed host (default: just the local HA host) — header / silhouette + anchored callouts / detail stat panel — with a responsive grid composition for multi-host installs.
2. Establish a `SYSTEM_PLATFORMS` discovery contract that the dashboard auto-extends as new host-telemetry integrations are added — same pattern as `MEDICAL_PLATFORMS` (v5.3.0) and `POOL_SPA_PLATFORMS` (v5.0.2).
3. Ship the **second consumer** of the silhouette+callout primitive, validating its generalization (§8): the SVG asset and anchor map are slot-injected; the primitive is renamed `<lcars-anatomical-silhouette>` with the medical-specific name retired.
4. Provide a **starship-shaped, non-canon vessel silhouette** as a single inline SVG asset (top-down view), color-tintable via CSS, with a documented 13-point subsystem anchor map.
5. Provide a **threshold engine** (`starship_thresholds.yaml`) so each vessel's status pill is derived from concrete numeric ranges with per-vessel overrides — load-average normalization to core count, temperature to chassis class, etc.
6. Reuse `<lcars-sparkline>` (Subspace 5.2.0) and `<lcars-anatomical-silhouette>` (refactored from Medical 5.3.0). Add **zero** new shared primitives.

## 2. Non-Goals

- **Not a process explorer.** No per-PID drill-down, no `kill` / `nice` controls. Top-CPU-consumer surfaces a name and a percentage; that is the limit.
- **Not an APM tool.** No HA-internal request tracing, no per-integration latency breakdowns beyond what `system_monitor` and `recorder` natively expose.
- **Not a network panel.** WAN/LAN topology, peripheral health, and per-link throughput live in **Subspace Relay** (§14). Starship Health owns *only* the HA host's NIC stats and a single deflector reachability pill that links to Subspace.
- **Not a power/billing panel.** Whole-house kW/kWh and circuit-level Emporia data live in **Power Distribution** (§14). Starship Health surfaces only the HA host's compute-thermal envelope as a composite warp-core score.
- **Not an alerting system.** Threshold breaches color the silhouette and the pill; they do not fire HA notifications. Author your own automations for that.

## 3. Dashboard Registration

| Field | Value |
|---|---|
| `key` (in `DASHBOARD_REGISTRY`) | `starship-health` |
| `title` | `Starship Health` |
| `subtitle` (LCARS frame) | `ENGINEERING DIAGNOSTICS · VESSEL STATUS` |
| `easter_egg_title` | `Rutherford's Engineering Console` |
| `icon` | `mdi:rocket-launch-outline` |
| `url_path` | `lcars-starship-health` |
| `default_enabled` | `True` (operational telemetry, no PHI) |
| `audio_mode` | `engineering` (existing — see `LCARS-AUDIO-SPEC.md`) |
| `MAX_DASHBOARDS` | 9 (bump from 8; Medical took the 8th slot in 5.3.0) |

Sidebar grouping: top-level entry under the **Engineering** sidebar group (with Power Distribution, Subspace Relay). The three are sibling dashboards covering distinct operational domains; see §14 boundary table.

---

## 4. Entity Contract

### 4.1 `SYSTEM_PLATFORMS` discovery set

Mirrors `MEDICAL_PLATFORMS` and `POOL_SPA_PLATFORMS`. Researched against HA core integrations and HACS for v5.4.0; four canonical platforms in scope.

```js
// js/src/lcars-starship-utils.js
export const SYSTEM_PLATFORMS = new Set([
  'system_monitor',  // CORE — CPU/memory/disk/load/network/swap/process throughput. Many entities disabled-by-default; see §4.4.
  'hassio',          // CORE (Supervisor) — supervisor health, add-on status, host info, OS update channel
  'supervisor',      // CORE — alias for hassio in some HA versions; treated as identical platform
  'glances',         // HACS-popular — cross-host CPU/RAM/temp/disk/network for non-HASSOS hosts
]);

// Adjacent providers (NOT in SYSTEM_PLATFORMS — too narrow or out of scope):
//   'recorder'     — exposes db size via service, no entity; surfaced via service-derived tile
//   'mqtt'         — broker health if user has MQTT; surfaced as a tile, not a vessel
//   'uptime_kuma'  — external monitor; better suited to Subspace Relay
//   'systemmonitor'— legacy spelling; deprecated, accept for back-compat read-only
```

### 4.1.1 Per-platform notes

- **`system_monitor`** (Core): `processor_use`, `processor_temperature`, `memory_use_percent`, `swap_use_percent`, `disk_use_percent_<mount>`, `load_1m`/`5m`/`15m`, `network_in_<iface>`/`network_out_<iface>`, `last_boot`, `process_<name>`. **Many disabled by default** in v2024+; promote at minimum: `processor_use`, `processor_temperature`, `memory_use_percent`, `swap_use_percent`, `disk_use_percent_/`, `load_15m`, `network_in_eth0`, `network_out_eth0`, `last_boot`.
- **`hassio` / `supervisor`** (Core): `update.home_assistant_*_update`, add-on `binary_sensor.*_running`, supervisor health. Detect HA OS class via `update.home_assistant_operating_system_update.attributes.installed_version`.
- **`glances`** (HACS): all `system_monitor` equivalents plus per-container Docker stats, GPU temp, NVMe SMART. Preferred for non-HASSOS hosts (bare-metal Debian, NUC, RPi running HA Core in venv).
- **`recorder`** (Core, service-derived): DB size via `recorder.info` service. Not in `SYSTEM_PLATFORMS`; surfaced as a Zone C tile only.

### 4.2 Pickup in `process_yaml.py` / `load_dashboard.py`

No special handling. Registered like every other v5.x dashboard; `load_dashboard.py` resolves `lovelace/ui-lovelace-starship-health.yaml`.

### 4.3 `STARSHIP_METRIC_CLASSES` — metric classifier

Keyed by `(platform, entity_id_pattern | device_class | unit)` → `metric_kind`. Each `metric_kind` declares a default **anchor slot** (§6.5).

| `metric_kind` | Sources | Default anchor | Display | Sparkline tile? |
|---|---|---|---|---|
| `cpu_usage` | `sensor.processor_use`, `glances:cpu_used` | `bridge` | "23 %" | yes |
| `cpu_temp` | `sensor.processor_temperature`, `glances:cpu_temperature` | `port_nacelle` | "58 °C" | yes |
| `gpu_temp` | `glances:gpu_*_temperature` | `starboard_nacelle` | "62 °C" | yes |
| `nvme_temp` | `glances:disk_*_temperature`, `sensor.*_nvme_temp` | `starboard_nacelle` (fallback if no GPU) | "44 °C" | yes |
| `memory` | `sensor.memory_use_percent`, `glances:mem_used_percent` | `main_computer` | "61 %" | yes |
| `swap` | `sensor.swap_use_percent` | (tile only) | "4 %" | yes |
| `disk_root` | `sensor.disk_use_percent_/`, `glances:fs_/_used_percent` | `engineering_hull` | "47 %" | yes |
| `load_15m` | `sensor.load_15m` | `saucer_section` | "0.84 / 4 cores" (normalized) | yes |
| `network_rx` | `sensor.network_in_<iface>` | `port_impulse` | "12.4 MB/s" | yes |
| `network_tx` | `sensor.network_out_<iface>` | `starboard_impulse` | "3.1 MB/s" | yes |
| `wan_reachable` | template/binary_sensor (`binary_sensor.wan_*` or composite of latency probes — see Subspace) | `deflector` | `UP` / `DOWN` | no |
| `addon_running` | `binary_sensor.*_running` (hassio add-ons) | `shuttlebay` | "11 / 13 running" | no |
| `backup_age` | `sensor.backup_*_last`, derived from `backup.*` entities | `cargo_bay` | "2d ago · OK" | no |
| `entity_health` | derived: count of `state in ('unavailable','unknown')` across all states | `sensor_array` | "7 unavailable" | yes |
| `composite_thermal` | derived: max(cpu_temp, gpu_temp, nvme_temp) normalized | `warp_core` | health score 0–100 | yes |
| `uptime` | `sensor.last_boot` → derived days/hours | (tile only) | "14d 6h" | yes (restart count last 30d) |
| `db_size` | `recorder` service-derived | (tile only) | "412 MB" | yes (7d) |
| `io_wait` | `glances:cpu_iowait` | (tile only) | "1.2 %" | no |
| `top_cpu_proc` | `system_monitor: process_*` (highest) or `glances:processlist` | (tile only) | "homeassistant 12.4 %" | no |
| `coordinator_health` | discovery: `zha`, `zwave_js`, `matter` integration entities | (tile only) | "ZHA: OK · ZWave: —" | no |
| `log_alerts_24h` | derived from `system_log_event` count or `sensor.system_log_*` if present | (tile only) | "3 warn / 0 err" | no |

### 4.4 Concrete entity table (HA OS host, today, Captain's install)

Verified from session intel (`mariner-json`).

| Entity | `metric_kind` | Notes |
|---|---|---|
| `sensor.processor_use` | `cpu_usage` | enabled |
| `sensor.processor_temperature` | `cpu_temp` | HASS OS |
| `sensor.memory_use_percent` | `memory` | enabled |
| `sensor.swap_use_percent` | `swap` | enabled |
| `sensor.disk_use_percent_/` | `disk_root` | enabled |
| `sensor.load_15m` | `load_15m` | enabled |
| `sensor.network_in_eth0` / `sensor.network_out_eth0` | `network_rx` / `network_tx` | enabled |
| `sensor.last_boot` | `uptime` | derived to days+hours |
| `update.home_assistant_core_update` / `_supervisor_update` | (Zone C tiles) | version + update pill |
| `update.home_assistant_operating_system_update` | vessel class (header) | `installed_version` attr |
| `binary_sensor.<addon>_running` × N | `addon_running` | aggregated to "X / Y running" |
| `backup.*` | `backup_age` | last successful timestamp, age computed |

### 4.5 Per-vessel binding (`STARSHIP_VESSELS`)

Discovery strategies, in priority order:

1. **Single-host autopairing (default).** The local HA host is always vessel `VESSEL-001`; all `system_monitor` + `hassio` entities bind to it without configuration.
2. **`glances` config-entry per host.** Each `glances` config entry = one additional vessel; vessel ID derived from a 7-char hash of the config entry's `unique_id` (no hostnames).
3. **Manual map in `lovelace-starship-health.yaml`.** Power-user override:
   ```yaml
   vessels:
     VESSEL-002:
       label_class: "MIRANDA-class · Debian 12"
       entities:
         - sensor.bridge_node_processor_use
         - sensor.bridge_node_memory_use_percent
   ```

Vessel class string format: `<class-name>-class · <os-name> <version>`. Default class names cycle through `INTREPID`, `GALAXY`, `MIRANDA`, `NOVA`, `DEFIANT`, `OBERTH` (six original names invented for this dashboard, *not* lifted from any specific canon ship registry). Class is purely cosmetic; no behavior depends on it.

---

## 5. Layout — Vessel Diagnostic Card (per host)

A single Vessel Diagnostic Card is a vertical container ~640 px tall × 360 px wide (default) with three stacked zones: A (Header), B (Silhouette + Callouts), C (Detail Stat Panel). Multi-vessel composition is a responsive grid (§5.4). Focus mode (§5.5) expands one card and unlocks two scan-mode tabs.

### 5.1 Zone A — Header strip (~80 px)

LCARS classic numeric header bar.

- **Title (left):** `VESSEL DIAGNOSTIC {VESSEL_ID}` where `VESSEL_ID` is a stable 7-char hash of the host's config-entry id or `local` for the HA host (e.g. `VESSEL DIAGNOSTIC 8841-0093.0`). No hostnames, no IPs, no MACs.
- **Vessel class subline:** `INTREPID-class · HA OS 17.2` sourced from `update.home_assistant_operating_system_update.attributes.installed_version` (or equivalent for non-HASSOS hosts).
- **Decorative numeric scroll columns (center):** Three vertical columns of 6-digit numbers, deterministic from the `VESSEL_ID` seed. Visual chrome only.
- **Status pill (right):** `NOMINAL` / `DEGRADED` / `WARNING` / `CRITICAL` / `OFFLINE`, computed by the threshold engine (§5.6) over all anchored metrics. `OFFLINE` if the host's most recent telemetry sample is older than 5 minutes. Pill colors: nominal = `--lcars-color-nominal` (cyan), degraded = `--lcars-color-info` (blue), warning = `--lcars-color-warning` (amber), critical = `--lcars-color-alert` (red), offline = `--lcars-color-muted` (grey).

### 5.2 Zone B — Silhouette + Callouts (~320 px, the centerpiece)

Centered **starship silhouette** (top-down view: saucer at top, engineering hull below, nacelles trailing) rendered by the shared `<lcars-anatomical-silhouette>` primitive (§8) with `asset="starship-silhouette.svg"` and `anchorMap={STARSHIP_ANCHOR_MAP}`.

Each callout is a `<button>` (focusable, keyboard-navigable):

- Short LCARS leader line from anchor `(x%, y%)` to label box (~36 px)
- Label: `metric_kind` short label (uppercase) + value + unit + optional Δ arrow

Empty anchors (no resolved entity) render `—` and suppress the leader line.

**Thermal overlay** (toggle in Zone A header rail, **on by default** for engineering — unlike Medical where it is off by default): if any metric resolves to `WARNING` or `CRITICAL`, tint the silhouette region nearest the offending anchor. Specific overlay rules:

- `cpu_temp > warning` → port nacelle red glow
- `gpu_temp` / `nvme_temp > warning` → starboard nacelle red glow
- `composite_thermal score < 50` → warp core pulses red
- `wan_reachable == DOWN` → deflector goes dark grey
- `disk_root > critical` → engineering hull red
- `memory > critical` → main computer red

Overlay is a CSS layer above the silhouette stroke (the silhouette is `currentColor`-tinted so the overlay reads cleanly).

### 5.3 Zone C — Detail stat panel (~200 px)

LCARS table grid, **4 columns × 3 rows = 12 metric tiles**. Default tile lineup (rendered if entity present, in this order, first 12 used):

1. Uptime (days + hours; sparkline of restart count last 30d derived from `last_boot` history)
2. HA Core version (with "UPDATE AVAILABLE" pill if `update.home_assistant_core_update.state == 'on'`)
3. Add-ons (X running / Y total)
4. Database size (`recorder` info service; 7d sparkline)
5. Log warnings/errors last 24h
6. WAN latency tri-graph mini (Google / Cloudflare / Microsoft — links to **Subspace Relay** for the full panel)
7. Top CPU consumer (process name + %)
8. Memory pressure (swap %)
9. I/O wait %
10. Connected integrations count
11. Boot time (absolute timestamp)
12. Coordinator health (Zigbee/Z-Wave/Matter — discovery; suppressed tile if none installed)

Each tile carries the `.lcars-starship-redactable` CSS class (§7) so screenshot tooling can blur values that might leak local network sizing.

### 5.4 Multi-vessel composition

| Viewport | Columns | Card width |
|---|---|---|
| `< 720 px` | 1 | 100 % − 32 px |
| `720–1199 px` | 2 | `(100 % − 48 px) / 2` |
| `1200–1799 px` | 3 | `(100 % − 64 px) / 3` |
| `≥ 1800 px` | up to 4 | `360 px` capped |

Grid: `grid-template-columns: repeat(auto-fill, minmax(360px, 1fr))`.

### 5.5 Focus mode + scan-mode tabs

| Tab `id` | URL fragment | Renders |
|---|---|---|
| `summary` | `#vessel/{vessel_id}` (default) | Default 3-zone Vessel Diagnostic Card, full-width |
| `engineering` | `#vessel/{vessel_id}/engineering` | Top-down silhouette with **all** sparklines visible (rather than 7 representative ones), full process table from `glances` if present, full disk-mount list (each mount as a row), full network-iface list. |
| `tactical` | `#vessel/{vessel_id}/tactical` | Side-profile silhouette (`starship-silhouette-side.svg`, deferred to v5.4.1) showing add-on stack as horizontal bars, coordinator radio status panel, MQTT broker health if present, integration-failure count. |

For v5.4.0, `tactical` tab renders the layout frame + the **top-down** silhouette + a `"SCAN MODE PENDING — v5.4.1"` overlay where the side-profile silhouette will go. Routing skeleton ships; second SVG asset deferred.

### 5.6 Threshold engine + status pill

Status precedence: `OFFLINE` > `CRITICAL` > `WARNING` > `DEGRADED` > `NOMINAL`.

Default thresholds (sensible engineering defaults; all overridable):

| `metric_kind` | NOMINAL | DEGRADED | WARNING | CRITICAL |
|---|---|---|---|---|
| `cpu_usage` | < 60 % | 60–75 % | 76–85 % | > 85 % (sustained 5m) |
| `cpu_temp` | < 60 °C | 60–70 °C | 71–80 °C | > 80 °C |
| `gpu_temp` / `nvme_temp` | < 55 °C | 55–65 °C | 66–75 °C | > 75 °C |
| `memory` | < 70 % | 70–80 % | 81–90 % | > 90 % |
| `swap` | < 5 % | 5–25 % | 26–50 % | > 50 % |
| `disk_root` | < 75 % | 75–85 % | 86–92 % | > 92 % |
| `load_15m` (normalized to core count) | < 0.7 × cores | 0.7–1.0 | 1.0–1.5 | > 1.5 |
| `wan_reachable` | UP | (n/a) | (n/a) | DOWN |
| `addon_running` | all running | 1 stopped | 2–3 stopped | ≥ 4 stopped (or any in error state) |
| `backup_age` | < 2 d | 2–7 d | 8–14 d | > 14 d or never |
| `entity_health` | < 5 unavailable | 5–15 | 16–30 | > 30 |
| `composite_thermal` (score) | ≥ 80 | 60–79 | 40–59 | < 40 |
| `io_wait` | < 2 % | 2–5 % | 6–15 % | > 15 % |

User overrides live in `lcars-dashboard/configs/starship/starship_thresholds.yaml`:

```yaml
# starship_thresholds.yaml — per-vessel threshold overrides
# All ranges are inclusive on both ends. Omit a key to inherit defaults.
vessels:
  VESSEL-001:
    cpu_usage:
      nominal: { max: 50 }    # tighter band for low-noise env
      degraded: { min: 51, max: 70 }
      warning: { min: 71, max: 85 }
      critical: { above: 85 }
    load_15m:
      core_count: 4           # explicit override; otherwise auto-detect
```

Validation: card refuses to load thresholds where `nominal` and `critical` overlap; logs single warning at module load.

### 5.7 Silhouette asset spec

**File:** `js/assets/starship-silhouette.svg` (single source of truth; inlined into the bundle at build time).

| Attribute | Value |
|---|---|
| `viewBox` | `0 0 200 480` |
| Stroke | `currentColor`, `stroke-width="2"`, `stroke-linejoin="round"` |
| Fill | `none` |
| Embedded fonts/rasters | **Forbidden** |
| Composition | Top-down view: saucer (round disc, ~120 wide) at top centered on x=100, neck/connector to engineering hull (rectangular, ~70×100) mid-frame, two nacelles parallel below the engineering hull on pylons angled 15° outward, deflector dish indicated as a small recessed arc at the leading edge of the saucer |
| File size budget | ≤ 5 KiB minified |
| **License & IP** | **Hand-authored for this project — explicitly NOT traced from any Star Trek production asset.** The silhouette is a generic LCARS-styled saucer + twin-nacelle layout, *inspired by* the canonical Federation starship visual vocabulary but not a 1:1 match of any specific canonical vessel. Path commands are authored inline with comments naming each subsystem (`<!-- saucer -->`, `<!-- engineering hull -->`, `<!-- port nacelle -->`, etc.). Worf reviews for absence of embedded scripts, foreignObject nodes, or external resources, and confirms the design does not replicate any specific canon ship's distinctive features (Sovereign neck angle, Galaxy two-tier saucer, Defiant pylonless nacelles, etc.). |

**Reserved future variant** (deferred to v5.4.1): `starship-silhouette-side.svg` for the `tactical` tab side-profile mode.

### 5.8 ASCII sketch (Vessel Diagnostic Card, summary tab)

```
┌─ VESSEL DIAGNOSTIC 8841-0093.0  INTREPID-class · HA OS 17.2  ── [NOMINAL] ─┐
│                                                                            │
│            DEFLECTOR ───── UP ───┐                                         │
│                                  │                                         │
│                          ___─────┘                                         │
│         BRIDGE ────────(   )──── 23 %  CPU                                 │
│                         \_/                                                │
│      MAIN COMP ──────── │   │ ──── 61 %  MEM                               │
│                         │   │                                              │
│                         │   │                                              │
│  0.84 / 4              ─┴───┴─                  47 %                       │
│  LOAD  ◄── SAUCER ──── │       │ ─── ENG_HULL ──► DISK                     │
│                        │ WARP  │                                           │
│  58 °C                 │ CORE  │              62 °C                        │
│  CPU TMP◄P_NACELLE ────┤  ▼84  ├──── S_NACELLE ►GPU TMP                    │
│                        │  /100 │                                           │
│                        └─┬───┬─┘                                           │
│                          │   │                                             │
│  12.4 MB/s              ─┘   └─               3.1 MB/s                     │
│  RX   ◄── P_IMPULSE ─────                  ── S_IMPULSE ──► TX             │
│                                                                            │
│      SHUTTLEBAY ─── 11/13 running ──┐    7 unavailable                     │
│                                     │  ── SENSOR_ARRAY                     │
│      CARGO_BAY  ─── 2d · OK ────────┘                                      │
│                                                                            │
├────────────────────────────────────────────────────────────────────────────┤
│  UPTIME      HA CORE       ADDONS       DB SIZE                            │
│  14d 6h      2026.4.2      11/13        412 MB                             │
│  ▁▂▁▂▁▁     [UP TO DATE]  running      ▁▂▃▅▄▃▂                             │
│                                                                            │
│  LOG ALERTS  WAN LATENCY   TOP CPU      SWAP                               │
│  3w 0e       12 14 22 ms   home...     4 %                                 │
│  last 24h    G  CF MS      12.4 %      ▁▂▁▂▁▂▁                             │
│                                                                            │
│  I/O WAIT    INTEGRATIONS  BOOT TIME    COORDINATORS                       │
│  1.2 %       47 active     2026-04-20   ZHA: OK                            │
│              loaded        02:14 UTC    ZWave: —                           │
└────────────────────────────────────────────────────────────────────────────┘
```

### 5.9 Trend visualization

Inline-SVG `<lcars-sparkline>` (Subspace 5.2.0). Same justification: no HACS dependencies, native LCARS tokens, already paid for.

**Hard dependency:** Starship Health 5.4.0 ships *after* Medical Bay 5.3.0 (silhouette primitive generalization, §8) which itself ships after Subspace 5.2.0.

---

## 6. Subsystem Anchor Map

Silhouette uses `200 × 480` viewBox. Anchors expressed as **percentages**. "Left" / "right" are **viewer-perspective** (top-down view: port = viewer-left = ship's port side, which matches naval/aerospace convention for top-down views).

| `slot` | Region | x % | y % | Default `metric_kind` | Notes |
|---|---|---|---|---|---|
| `deflector` | Leading edge of saucer | 50 % | 4 % | `wan_reachable` | Deflector points "forward" — outward connectivity reads naturally |
| `bridge` | Saucer top center | 50 % | 12 % | `cpu_usage` | Command/control = CPU |
| `main_computer` | Saucer mid-center | 50 % | 22 % | `memory` | RAM lives in the computer core |
| `saucer_section` | Saucer broad area | 28 % | 22 % | `load_15m` | Saucer = primary hull = load-bearing |
| `sensor_array` | Saucer trailing edge | 72 % | 28 % | `entity_health` | Sensors detect anomalies → "X unavailable" reads as "X sensors offline" |
| `engineering_hull` | Mid-frame rectangular hull | 50 % | 50 % | `disk_root` | Storage = bulk cargo / engineering |
| `warp_core` | Center of engineering hull | 50 % | 56 % | `composite_thermal` | Warp core is the thermal heart |
| `port_nacelle` | Viewer-left nacelle | 22 % | 70 % | `cpu_temp` | Nacelle = engine = CPU thermal |
| `starboard_nacelle` | Viewer-right nacelle | 78 % | 70 % | `gpu_temp` (fallback `nvme_temp`) | Symmetric thermal slot |
| `port_impulse` | Inner edge of port nacelle | 38 % | 80 % | `network_rx` | Impulse = sublight = network |
| `starboard_impulse` | Inner edge of starboard nacelle | 62 % | 80 % | `network_tx` | Symmetric throughput |
| `shuttlebay` | Aft engineering hull | 50 % | 88 % | `addon_running` | Shuttlebay holds shuttles = container fleet |
| `cargo_bay` | Aft engineering hull (offset) | 38 % | 92 % | `backup_age` | Cargo = stored backups |

That is **13 distinct slots**. The `sensor_array` slot is reserved for future expansion if HA grows a first-class "integration health" sensor; today it is computed client-side from `hass.states`. The `tactical` focus tab adds three more virtual slots (`weapons`, `shields`, `navigational`) but those are hidden in summary mode and reserved for v5.4.2+.

Leader-line geometry: each callout label box anchors at one of four screen quadrants; the leader is a single `<line>` from body anchor to label edge. Quadrant assignment is fixed per slot in the component (deflector → top-center, bridge → top-left, main_computer → top-right, etc.) — see component JSDoc.

---

## 7. PRIVACY POSTURE — Worf coordination on host identifiers

Operational telemetry is not PHI, but several cells leak local-network sizing if shared publicly.

### 7.1 No external network calls from the card

The card touches **only** `hass.states` and the local WebSocket. Zero outbound bytes. Same posture as Medical Bay.

### 7.2 No values in logs

`console.debug` calls in `lcars-starship-*.js` **must redact numeric values**. Lint rule (CI-enforced) identical to Medical Bay's: any string-template literal with `${...}` inside a `console.*` call fails CI. Acceptable: `console.debug('[starship] threshold check complete')`. Forbidden: `console.debug('[starship] CPU=${val}')`.

### 7.3 `aria-live` discipline

| Element | Value | Rationale |
|---|---|---|
| Metric value cells (CPU, mem, temp) | `aria-live="off"` | AT must not announce flickering integer values. |
| Status pill | `aria-live="polite"` | Pill changes are infrequent and operationally meaningful. |
| `wan_reachable` DOWN transition | `aria-live="assertive"` | This is the one event that genuinely needs immediate attention. |

### 7.4 Screenshot redaction hook

Every metric cell — both Zone B callouts and Zone C tiles — carries `.lcars-starship-redactable`. The screenshot tool gains a `--redact-starship` flag; **default ON**.

Redacted selectors:
- `.lcars-starship-redactable` — metric values (callouts + tiles)
- `.lcars-starship-redactable-id` — VESSEL_ID in header
- `.lcars-starship-redactable-class` — vessel class string (reveals OS + version)
- `.lcars-starship-redactable-iface` — network-interface names in tile detail

The silhouette SVG itself is non-PII and remains visible.

### 7.5 No hostnames / IPs / MACs in any rendered cell

**Hard constraint.** The card MUST NOT render:
- Hostnames (`hostname.local`, `pi-hole.lan`, etc.)
- IP addresses (v4 or v6)
- MAC addresses
- Wi-Fi SSIDs
- Docker container names (use generic `addon[N]` if surfaced individually; the default tile shows only the count)

Where source entities expose these (e.g. `glances` `unique_id` may contain hostname), the card extracts only the metric value and discards identifier strings. Vessel IDs are 7-char hashes; vessel class strings are generic ship-class names + OS+version. Top-CPU-consumer process names ARE shown (`homeassistant`, `python3`, `mosquitto`) because they are well-known software names, not host identifiers — Worf to confirm acceptable.

### 7.6 No persistence of metrics in dashboard config

All metric data flows from `hass.states` per render. The only file written is `lcars-dashboard/configs/starship/vessels.yaml` containing the vessel-id ↔ config-entry-id mapping (no values, no thresholds, no history beyond what `recorder` already retains).

### 7.7 Coordinator-health discovery scope

The coordinator health tile probes for `zha`, `zwave_js`, `matter` integrations and surfaces a binary `OK / —` signal per-stack. It MUST NOT render coordinator MAC addresses, USB device paths, or coordinator firmware version strings (which can fingerprint hardware revs); only the boolean health.

---

## 8. Shared primitive: `<lcars-anatomical-silhouette>` (refactor of Medical's component)

This dashboard is the **second consumer** of the silhouette+callout pattern. Per `LCARS-PANEL-EXTRACTION-ARCHITECTURE.md`, on second use the primitive is generalized.

### 8.1 Required refactor (Phase 0 of this spec, executed against the Medical Bay component)

Rename `<lcars-biofunction-silhouette>` → `<lcars-anatomical-silhouette>`. Rationale: the component is not medical-specific; "anatomical" generalizes to any silhouette-with-anchors (humanoid body, starship, vehicle, network topology, building floor plan).

### 8.2 Proposed API

```js
// js/src/lcars-shared-components/lcars-anatomical-silhouette.js

/**
 * Generic silhouette-with-anchored-callouts primitive.
 * @prop {string} asset       — filename of the SVG asset under js/assets/silhouettes/
 *                              (e.g. "biofunction-silhouette.svg", "starship-silhouette.svg")
 * @prop {Object} anchorMap   — { slotId: { x: 0..100, y: 0..100, labelQuadrant: 'tl'|'tr'|'bl'|'br' } }
 * @prop {Object} anchors     — { slotId: { value, status, sparkline?, leaderSuppressed? } }
 * @prop {Object} overlayMap  — { regionId: { fillSelector, statusTrigger } } — thermal-overlay rules
 * @prop {boolean} overlayEnabled — toggle for thermal overlay layer
 * @prop {string} ariaLabel   — accessible name for the silhouette region
 */
```

Asset directory convention: all silhouette SVGs move from `js/assets/` to `js/assets/silhouettes/`. Build step inlines them into the bundle (CSP `default-src 'self'` requires no external fetches).

Both consumers (Medical, Starship) pass their own `anchorMap` + `overlayMap` constants from their respective `*-utils.js` modules. The component is dashboard-neutral.

### 8.3 Migration plan

Captured in §11 Phase 0 as a **prerequisite task** that must be executed in v5.4.0-beta.1 *before* Starship-specific code is written. Medical Bay code is updated in the same PR; both consumers exercise the generalized primitive at the same merge.

---

## 9. New JS modules + assets

| Module / asset | Lines / size (est.) | Purpose | Visibility |
|---|---|---|---|
| `js/src/lcars-starship-layout.js` | 220–320 | Frame, dashboard grid composition, focus-mode tab routing | dashboard-private |
| `js/src/lcars-starship-card.js` | 600–900 | Vessel Diagnostic Card (Zone A/B/C), vessel binding, metric classification, threshold engine, redaction-class application | dashboard-private |
| `js/src/lcars-starship-utils.js` | 280–380 | `SYSTEM_PLATFORMS`, `STARSHIP_METRIC_CLASSES`, `STARSHIP_VESSELS`, anchor map, overlay rules, threshold defaults, vessel-class generator | dashboard-private |
| `js/src/lcars-shared-components/lcars-anatomical-silhouette.js` | (refactor of medical primitive; +30–50 lines for asset slot-injection) | **Refactored shared primitive** | shared |
| `js/assets/silhouettes/starship-silhouette.svg` | ≤ 5 KiB | Top-down vessel silhouette path data | asset |
| `js/assets/silhouettes/starship-silhouette-side.svg` | (deferred v5.4.1) | Side-profile variant for `tactical` tab | asset |

**Bundle delta** (estimate): +18 to +24 KiB minified (no new shared primitive; smaller card than Medical — no consent gate, fewer detail tiles with sparklines). Net projected bundle after Subspace + Medical + Starship: ~965–980 KiB, approaching the 1000 KiB review threshold (`data-limits-policy.md`). Re-measure on v5.4.0-beta.1; if delta exceeds +28 KiB, defer the `tactical` tab routing to v5.4.1.

---

## 10. Performance

Worst-case render: 4 vessels × (13 callouts + 12 tiles) with ~7 sparklines per visible card.

- O(vessels × anchors) text nodes; negligible. Sparklines are 60-sample SVG polylines, re-rendered only on source-entity state change.
- `shouldUpdate()` short-circuits via `Map<entity_id, lastValue>` (same pattern as Medical/Habitat/Network).
- `entity_health` (count of `unavailable`/`unknown` across `hass.states`) is computed on a **30-second debounce** to avoid O(N) walks per tick.
- `composite_thermal` is derived from already-rendered values; no extra entity reads.
- No `recorder`/`history` queries except the `db_size` tile, which calls `recorder.info` on a 5-minute interval and caches the result.

Acceptance: first paint < 200 ms; pill recomputation < 20 ms per vessel.

---

## 11. Implementation Tasks (for Cmdr. Riker / dev hand-off)

### Phase 0 — Generalize the silhouette primitive (5.4.0-beta.1, blocking)

1. Rename `<lcars-biofunction-silhouette>` → `<lcars-anatomical-silhouette>`; move to `js/src/lcars-shared-components/`.
2. Refactor API per §8.2 — accept `asset`, `anchorMap`, `overlayMap` as props (Medical previously had these baked in).
3. Move `js/assets/biofunction-silhouette*.svg` → `js/assets/silhouettes/`.
4. Update `lcars-medical-card.js` to pass its anchor map + overlay map as props instead of relying on hard-coded internals.
5. Verify Medical Bay 5.3.0 acceptance criteria still pass with the refactored primitive (regression suite: silhouette anchors render at documented coordinates, thermal overlay engages on ALERT, consent gate still works).
6. Worf re-reviews the refactored primitive for absence of script/foreignObject/external-fetch surface (asset slot is a string filename, not raw SVG markup).

### Phase 1 — Single-vessel Vessel Diagnostic Card (5.4.0-beta.2)

7. Bump `MAX_DASHBOARDS` from 8 → 9 in `const.py` / config-flow guard.
8. Add `starship-health` entry to `DASHBOARD_REGISTRY` (`default_enabled: True`, audio mode `engineering`).
9. Create `lovelace/ui-lovelace-starship-health.yaml` (single view, `type: custom:lcars-starship-layout`).
10. Implement `lcars-starship-utils.js` with `SYSTEM_PLATFORMS`, `STARSHIP_METRIC_CLASSES`, `STARSHIP_ANCHOR_MAP`, `STARSHIP_OVERLAY_MAP`, threshold defaults, single-vessel resolver, `VESSEL_ID` hash, vessel-class generator.
11. **Author the starship silhouette SVG** (`js/assets/silhouettes/starship-silhouette.svg`) per §5.7. Hand-author paths; explicit "no canon traced" comment header. Worf reviews for IP-cleanliness AND for absence of script/foreignObject/external resources.
12. Implement `lcars-starship-layout.js` (frame, responsive grid, audio mode wiring).
13. Implement `lcars-starship-card.js` Zone A header (VESSEL_ID + vessel class + decorative numerics + status pill), Zone B silhouette mount (passing anchor map + overlay map to the generalized primitive), Zone C 4×3 tile grid for the single-vessel case.
14. Implement threshold engine (`computeStatus(metric_kind, value, vessel_overrides) → 'NOMINAL'|'DEGRADED'|'WARNING'|'CRITICAL'|'OFFLINE'`); validate non-overlapping ranges at load.
15. Implement composite-thermal score and load-15m core normalization.
16. Apply `.lcars-starship-redactable*` selectors per §7.4.
17. Apply `aria-live` discipline per §7.3 (with the `assertive` exception for WAN-down).
18. Add CI lint rule mirroring Medical: `console.*` in `lcars-starship-*.js` cannot include `${...}` template substitutions.
19. Captain dogfoods on the local HA host before beta.3.

### Phase 2 — Multi-vessel + focus mode + threshold overrides (5.4.0-beta.3)

20. Add `STARSHIP_VESSELS` resolver with three-tier discovery (§4.5).
21. Add `glances` config-entry detection → second vessel auto-binding.
22. Implement responsive grid composition (§5.4).
23. Implement focus-mode tab routing (§5.5) via `hashchange` listener; render `summary` and `engineering` tabs fully; render `tactical` tab frame + top-down silhouette + `"SCAN MODE PENDING"` overlay.
24. Implement `starship_thresholds.yaml` parser (§5.6).
25. Implement WAN-latency tri-graph mini-tile with click-through to Subspace Relay.
26. Implement coordinator-health discovery (ZHA / Z-Wave / Matter).

### Phase 3 — Stable release (5.4.0)

27. Re-measure bundle size; confirm under 980 KiB ceiling. If over, defer `tactical` tab routing to 5.4.1.
28. Geordi visual QA on Vessel Diagnostic Card, silhouette anchor alignment, and tile typography.
29. Worf re-signs §7 against the as-built code, including hostname/IP/MAC absence audit and screenshot-redaction selectors.
30. Update `plans/backlog-5x.md`: add `5X-4.0 · Starship Health (shipped)`; queue `5X-4.1 · side-profile silhouette + tactical tab` for v5.4.1.
31. HACS release per `lcars-release-workflow` memory.

---

## 12. Open Questions for Cmdr. Riker

1. **Easter-egg label**: is "Rutherford's Engineering Console" approved, or another LD reference (Billups, Tendi-on-Engineering)?
2. **`MAX_DASHBOARDS` bump**: 8 → 9 just for one dashboard is conservative. Bump to 12 to absorb v5.4–v5.6 in one shot?
3. **Top-CPU process names** (§7.5): plaintext (`homeassistant`/`python3`/`mosquitto`) or hashed? Lean plaintext.
4. **WAN-latency tile**: in-tile-with-link to Subspace (current spec), or pill-only and let Subspace own latency entirely?
5. **Threshold defaults (§5.6)**: ship engineering defaults, or blank-by-default? Lean defaults.
6. **`aria-live="assertive"` for WAN-down**: only assertive announcement in any LCARS dashboard — confirm acceptable.
7. **`tactical` tab scope**: ship `summary` + `engineering` fully and stub `tactical` (current spec), or delay 5.4.0 a beta cycle for full tactical?
8. **Silhouette IP + class names**: hand-authored "inspired-by" generic saucer + twin nacelles plus six common-knowledge Trek class-name strings — confirm Worf comfort, or push further from canon?
9. **Multi-host scope**: ship `glances` second-vessel discovery in 5.4.0, or single-vessel-only with multi-host deferred to 5.4.2?

---

## 13. Acceptance Criteria

- [ ] Generalized `<lcars-anatomical-silhouette>` primitive in place; Medical Bay 5.3.0 regression suite passes against it.
- [ ] Worf has re-signed §7 (host-identifier absence, screenshot redaction, coordinator-health scope).
- [ ] `MAX_DASHBOARDS` increment shipped without breaking existing config-flow.
- [ ] Single-vessel card renders correctly with §4.4 entities; ≥ 8 of 12 default tiles populated.
- [ ] Starship SVG hand-authored, ≤ 5 KiB, no script/foreignObject/external resources, IP-clean.
- [ ] All 13 anchor slots render within ±2 % at all viewport sizes; multi-vessel grid auto-fills at §5.4 breakpoints.
- [ ] Threshold engine returns correct pill for engineering test cases; `starship_thresholds.yaml` overrides apply; composite thermal + load-15m core normalization compute correctly.
- [ ] Focus-mode tab routing works for all three tabs; `tactical` shows placeholder overlay in v5.4.0.
- [ ] All metric cells carry `.lcars-starship-redactable` and `aria-live="off"` (WAN-down `assertive` exception).
- [ ] No hostnames/IPs/MACs/SSIDs/container names in any rendered cell or DOM attribute (grep audit).
- [ ] No `console.*` value substitution in `lcars-starship-*.js` (CI enforced); no outbound network requests from the card (network-tab audit).
- [ ] Bundle delta ≤ +28 KiB; total bundle < 980 KiB. Geordi signs off on aesthetics, anchor alignment, tile typography.
- [ ] WAN-latency tile click-through to Subspace Relay works.
- [ ] `plans/backlog-5x.md` updated; `5X-4.1 · side-profile silhouette + tactical tab` queued for 5.4.1.

---

## 14. Cross-cutting boundaries — Engineering sidebar group

Three sibling dashboards live under the **Engineering** sidebar group. Ownership boundaries:

| Concern | Owner | Notes |
|---|---|---|
| Whole-house power (kW, kWh, circuits, Emporia Vue) | **Power Distribution** | Per `LCARS-CONSOLIDATED-POWER-PANEL-SPEC.md`. Starship surfaces only the HA host's compute-thermal envelope (warp-core composite), not wall-plug power. |
| Network infrastructure (UDM, switches, APs, peripherals, topology, per-link throughput) | **Subspace Relay** | Per `LCARS-SUBSPACE-RELAY-DASHBOARD-SPEC.md`. Owns all network telemetry for non-HA-host devices. |
| HA host NIC throughput (`eth0`/`wlan0` rx/tx) | **Starship Health** | Part of the HA host. Subspace links *to* this metric for context but does not own it. |
| WAN reachability binary signal | **Starship Health** renders + **Subspace Relay** computes | Subspace computes the multi-probe composite (Google/CF/MS); Starship renders the deflector pill and links to the full Subspace tri-graph. |
| Add-on / container health, HA Core/OS/Supervisor versions, backup status, MQTT broker health, per-process CPU drill-down | **Starship Health** | Compute substrate / host-resident services. |

**Sidebar order**: Power Distribution → Subspace Relay → Starship Health. Energy first (largest spend), network second (most failure-prone), compute third (most stable). Group label: `ENGINEERING`.

---

## 15. References

- `specs/LCARS-MEDICAL-BAY-DASHBOARD-SPEC.md` — parent of the silhouette+callout pattern; primitive generalized in this spec's Phase 0
- `specs/LCARS-PANEL-EXTRACTION-ARCHITECTURE.md` — shared component pattern; second-use generalization rule
- `specs/LCARS-SUBSPACE-RELAY-DASHBOARD-SPEC.md` — owner of network telemetry; this dashboard links to it for WAN tri-graph
- `specs/LCARS-CONSOLIDATED-POWER-PANEL-SPEC.md` — owner of whole-house power; sibling Engineering dashboard
- `specs/LCARS-AUDIO-SPEC.md` — audio mode `engineering`
- `memories/repo/lcars-release-workflow.md`, `memories/repo/data-limits-policy.md`
- HA `system_monitor` · `hassio` · HACS Glances · `recorder` info service — see HA docs

## 16. Reference Inspiration

Design inspired by two visual lineages: (a) the canonical **MASTER SYSTEMS DISPLAY** (top-down/side ship cutaway with subsystem callouts — warp core, deflector, computer cores, shuttlebay) and (b) the **ENGINEERING SCHEMATIC** screens (real-time numeric telemetry alongside subsystem icons). Images not embedded; descriptive synopsis only.

1. **MSD** — mapped to Zone B silhouette + anchored callouts.
2. **Engineering Schematic** — mapped to Zone C tile grid + focus-mode `engineering` tab.

**Design fidelity policy** (identical to Medical Bay §15): silhouette is *inspired-by*, not traced from, any canonical reference. All SVG paths and dimensions hand-authored. Vessel-class names in §4.5 are common-knowledge Trek terms used as cosmetic strings; no canon ship's distinctive geometry is replicated. `VESSEL_ID` format is a deterministic hash output.

---

## 17. Security Review — Lt. Worf, Chief of Security
*Filed: stardate 2026.05.04*

This dashboard renders the **vulnerability fingerprint** of the host: HA Core / OS / Supervisor versions, add-on slugs and versions, container inventory, backup paths, database size, and WAN reachability. A single shared screenshot lets an attacker cross-reference against published CVEs and known add-on issue trackers. Screenshot redaction is therefore a security control, not a UX preference.

### Threat model
| Threat | Likelihood | Impact | Mitigation status |
|---|---|---|---|
| Screenshot reveals exact HA Core version → CVE matchup | High | High | Major-only redaction in screenshot mode (BLOCKING) |
| Screenshot reveals exact OS / Supervisor version → CVE matchup | High | High | Major-only redaction (BLOCKING) |
| Add-on slug + version inventory → targeted exploit selection | High | Medium | Slug redaction in screenshot mode (BLOCKING) |
| Backup path discloses filesystem layout, mount points, NAS identity | Medium | Medium | Path redaction in screenshot mode |
| WAN reachability sensor on deflector leaks external IP (same as Subspace §15) | High | High | Apply Subspace `data-network="wan-ip"` rule (BLOCKING) |
| Database size + log error count → infers system instability | Low | Low | Render allowed; redact in screenshot mode |
| Container/add-on count → infers system complexity | Low | Low | Acceptable; included in obfuscator for completeness |
| `VESSEL_ID` hash collision with another resident's dashboard → cross-correlation | Very Low | Low | Hash includes salt; acceptable |

### OWASP Top 10 mapping
- **A01 Broken Access Control** — Add-on inventory and Supervisor version are admin-grade. Recommend `require_admin: true`.
- **A04 Insecure Design** — Default visible state IS the screenshot state when obfuscator is active. Versions and slugs default to redacted form.
- **A05 Security Misconfiguration** — Surfacing version info in DOM is *the* misconfiguration of this card; screenshot redaction is the compensating control.
- **A06 Vulnerable & Outdated Components** — Inverse risk: this dashboard helps the Captain see when components are outdated, but also helps an attacker. Defense-in-depth: redact when sharing.
- **A09 Logging Failures** — Card must not log version strings or add-on slugs via `console.*` substitution.

### Required hardening (BLOCKING)
- [ ] HA Core version cell carries `data-health="version-core"` and renders **major-only** in screenshot mode (e.g. `2026.5.x`). Full version visible in normal admin view.
- [ ] OS / Supervisor version cells carry `data-health="version-os"` / `data-health="version-supervisor"` with same major-only rule.
- [ ] Add-on tiles carry `data-health="addon-slug"` and render as `addon-{hash[0:4]}` in screenshot mode. Version on tile redacted to `•.•.•`.
- [ ] WAN reachability pill on deflector reuses Subspace's `data-network="wan-ip"` selector — single source of truth across both dashboards.
- [ ] Backup path cells carry `data-health="backup-path"` and render basename only (e.g. `…/backup_2026-05-04.tar`) with parent dirs masked.
- [ ] Dashboard registered with `require_admin: true`.
- [ ] No outbound network requests from card (entity data via HA WebSocket only).
- [ ] Screenshot obfuscator hook list (below) wired into `localinfo/screenshot-obfuscator.js` before stable.

### Recommended hardening
- [ ] DB size and log error count redacted to order-of-magnitude buckets in screenshot mode (`>1 GB`, `>10 errors`).
- [ ] Container / add-on count redacted to bucket (`<10`, `10-25`, `>25`) in screenshot mode.
- [ ] MQTT broker hostname (if rendered) redacted same as Subspace `data-network="hostname"` rule.
- [ ] Document in spec README that sharing an unredacted Starship Health screenshot is equivalent to publishing your patch level — and that attackers monitor public Trek-themed dashboards on social platforms for exactly this reason.
- [ ] Audit any new system-monitor / Glances widget library; prefer hand-authored SVG. No CDN assets.

### Screenshot redaction (obfuscator integration)
Obfuscator MUST hook these selectors when redaction mode is active on `/lcars-starship`:
- `[data-health="version-core"]` — major-only mask
- `[data-health="version-os"]` — major-only mask
- `[data-health="version-supervisor"]` — major-only mask
- `[data-health="addon-slug"]` → `addon-{hash[0:4]}`
- `[data-health="addon-version"]` → `•.•.•`
- `[data-health="backup-path"]` → basename-only
- `[data-health="db-size"]` / `[data-health="log-errors"]` → bucket
- `[data-network="wan-ip"]` — shared selector with Subspace; full mask

### Data classification & retention
- **Classification**: Operational-Sensitive (version inventory, host config). Treat as Confidential.
- **Retention in card**: in-memory only for current view.
- **Retention in HA recorder**: governed by `hassio` / `system_monitor` / `recorder` integrations; out of scope. Captain may wish to exclude `update.*` entities from recorder export.
- **Retention in screenshot artifacts**: zero unredacted artifacts — redaction default-on.

### Sign-off condition
I will sign off when: (1) all BLOCKING items checked; (2) `require_admin: true` confirmed on the dashboard registration; (3) the WAN reachability pill demonstrably uses the same `data-network="wan-ip"` hook as Subspace (single point of redaction control); (4) obfuscator hook list wired and tested against a live `/lcars-starship` view with a captured fixture containing at least 5 add-ons and 1 backup. *Honor the patch cadence; trust no version string in the wild.*

---

## Engineering Console Review — Lt. Cmdr. Geordi La Forge
*Filed: stardate 2026.05.04*

### Visual / LCARS grammar
Elbow + pill frame consistent with Engineering siblings. Frame color: per the Cross-Dashboard Consistency audit, Engineering owns `--lcars-butterscotch` — document in §3. Antonio, ALL-CAPS labels + numerics. Top-down silhouette flat stroke (no fill gradient, no glow). Warp_core thermal pulse must be GPU-composited (`transform`/`opacity`) within the ≤6 concurrent animation budget.

### Accessibility (WCAG 2.2 AA, EAA, EN 301 549)
Callouts need the same scrim rule as Medical (`rgba(0,0,0,0.85)` background or `text-shadow: 0 0 3px #000`) for ≥4.5:1 against any Lovelace background (SC 1.4.3). Disabled `—` uses `--lcars-gray` (5.1:1 on black, AA). Focus-mode tabs (summary/engineering/tactical): APG pattern with Arrow switch, Tab in/out, focus restored to originating card (SC 2.4.3/2.4.7), 2px `--lcars-ice` focus ring (SC 2.4.13). 44×44 hit-areas on anchor dots + tile click-throughs (SC 2.5.5). 200% zoom + reflow per SC 1.4.10. LCARS is dark-only — document `prefers-color-scheme` ignored.

**§12 item 6 — `aria-live="assertive"` for WAN-down: APPROVED with 5 constraints** (per SC 4.1.3 + ARIA APG `alert` role; WAN-down qualifies as user-task interruption, CPU spike does not):
1. Single dedicated `<div role="alert" aria-live="assertive" aria-atomic="true">` outside silhouette — not toggled on a metric cell.
2. Message is the transition event ("WAN reachability lost"), not the metric value.
3. 60-second debounce — same message MUST NOT re-announce within 60s.
4. Recovery ("restored") fires `polite`, not assertive.
5. No other `assertive` regions on this dashboard or any other in v5.4.x.

### Audio grammar (per LCARS-AUDIO-SPEC)
`audio_mode: engineering` correct. Tiered mapping: WAN-down → `alert` (sawtooth 880 Hz ×3, 260ms), paired with the assertive region. CPU/temp/disk → CRITICAL crossing → `toggle` (sine 550→770 Hz, 80ms). Core/Supervisor restart → `navAcknowledge` (sine 440→660, 140ms). `criticalAlert` is NOT used here — reserved for safety-of-life. Mute persists via shared `lcars-audio-muted`.

### Required changes (blocking)
- [ ] Document frame color = `--lcars-butterscotch` in §3 and Frame Color table.
- [ ] Implement WAN-down `assertive` region per the 5 constraints above (dedicated div, transition-only text, 60s debounce, polite recovery, no other assertives).
- [ ] Status pill `aria-live="polite"` fires on **class change** only (NOMINAL/CAUTION/CRITICAL), not numeric change. Document in §7.3.
- [ ] Silhouette `<svg role="img" aria-label="Vessel diagnostic: <N> nominal, <M> caution, <K> critical">`, recomputed on pill-class change only.
- [ ] Each anchor `aria-describedby="<tile_id>"`.
- [ ] Callout backdrop scrim / text-shadow added; contrast verified.
- [ ] `prefers-reduced-motion: reduce` disables warp_core thermal pulse (render static), anchor blink, sparkline draw-in. WAN-down `assertive` announcement preserved (safety-relevant).
- [ ] 44×44 hit-areas; WAN-latency tile click-through is a real `<a>`/`<button>`, keyboard-operable.
- [ ] Lower-Decks easter-egg title carries `aria-label="Starship Health"` override.

### Suggestions (non-blocking)
- [ ] On entering `engineering` tab, fire `navAcknowledge` for tactile feedback.
- [ ] "Skip to status pill" link at top of each Vessel card.
- [ ] Tactical tab placeholder: `aria-label="Tactical scan mode pending v5.4.1"`.

### Sign-off condition
All nine blocking items resolved before v5.4.0-beta.1; Geordi re-reviews rendered silhouette + assertive behavior under a synthetic WAN-down test before stable. The 5-constraint `assertive` ruling above is authoritative for any future LCARS dashboard — no other dashboard adds an `assertive` region without equivalent review.

---

## XO Implementation Review — Cmdr. William Riker
*Filed: stardate 2026.05.04*

### Answers to Data's open questions
1. `Rutherford's Engineering Console` is approved.
2. Do not bump `MAX_DASHBOARDS` one slot at a time. Raise the cap to 12 at the next shared-plumbing touchpoint and stop revisiting it every release.
3. Keep top-CPU process names plaintext. `homeassistant` and `python3` are operationally useful and not host identifiers.
4. Keep the WAN-latency mini-tile with click-through to Subspace; it is the right cross-dashboard bridge.
5. Ship engineering threshold defaults. Blank defaults would turn the pill into decoration.
6. `aria-live="assertive"` for WAN-down is acceptable. That is a genuine operational interrupt.
7. Revise scope: ship `summary` and `engineering` in `5.4.0`; defer `tactical` entirely to `5.4.1` instead of shipping a placeholder frame.
8. Generic starship geometry plus cosmetic class names are acceptable if Worf confirms the SVG does not track any single canon hull too closely.
9. Multi-host discovery via `glances` should be deferred to `5.4.1` unless Captain has a second host ready during beta; `5.4.0` should prove the local-host experience first.

### Sequencing & dependencies
Keep the macro order unchanged: `5.2.0 Subspace` first, `5.3.0 Medical` second, `5.4.0 Starship` third. The Medical-born silhouette primitive is the right path; do not move that work into `5.2.x`. `5.4.0` should start with the primitive generalization regression pass, then ship a disciplined single-vessel dashboard. Defer multi-host discovery and tactical tab to `5.4.1` if bundle or QA pressure rises. Backlog hygiene: this spec supersedes no existing shipped item, but the proposed `5X-4.0` / `5X-4.1` identifiers are too ambiguous beside existing Epic 4 numbering. Use namespaced IDs instead. Capacity: 18 points for `5.4.0` core, 24 if multi-host is kept. Critical path: primitive generalization plus single-vessel summary card.

### Story breakdown (epic → stories)
Epic: Starship Health v5.4.x
1. Primitive generalization regression pass — Size M, 3 pts, deps on Medical shipped. AC: `<lcars-anatomical-silhouette>` replaces the medical-specific primitive with Medical regressions still green.
2. Registry + capacity plumbing — Size S, 2 pts, deps 1. AC: dashboard registration works, `MAX_DASHBOARDS` cap raised once for the remaining v5 roadmap, config-flow still loads existing dashboards.
3. Starship contract + SVG asset — Size L, 5 pts, deps 1-2. AC: `SYSTEM_PLATFORMS`, anchor/overlay maps, thresholds, and hand-authored top-down SVG work against HA OS fixtures.
4. Single-vessel summary card — Size L, 5 pts, deps 3. AC: 13 anchors and at least 8 tiles populate; thermal overlay, pill logic, and click-through latency tile work on the local HA host.
5. Engineering focus tab + docs/release assets — Size M, 3 pts, deps 4. AC: engineering tab expands extra diagnostics, changelog/README/gallery/release notes/beta checklist are updated, `5.4.1` follow-ons captured for tactical and multi-host.

### Definition of Done (additions to spec's acceptance criteria)
- [ ] Add visual QA screenshots to `examples/` for summary and engineering views, using screenshot-obfuscator defaults for public artifacts.
- [ ] Extend screenshot-obfuscator coverage for `.lcars-starship-redactable*` selectors and verify VESSEL_ID, class string, and iface names blur correctly.
- [ ] Add `CHANGELOG.md` entry, README Panel Gallery update, HACS release notes draft, and a beta tester checklist covering WAN-down, high temp, low disk, and unavailable-entity scenarios.
- [ ] Record the one-time `MAX_DASHBOARDS` increase in release notes so later specs stop paying that tax again.
- [ ] Add follow-on backlog items for `tactical` tab and optional multi-host `glances` discovery under non-ambiguous IDs.

### Risk register (Six Sigma FMEA)
| Risk | Severity | Occurrence | Detection | RPN | Mitigation |
|---|---:|---:|---:|---:|---|
| Disabled-by-default HASS OS sensors leave the card half-empty and trap users in setup churn | 7 | 7 | 5 | 245 | Minimum-sensor checklist, onboarding docs, empty-state guidance, beta checklist |
| Primitive generalization regresses Medical anchor rendering or overlays | 8 | 5 | 5 | 200 | Run Medical regression suite in same PR before Starship code expands |
| Host identifiers leak via `glances` metadata, DOM attrs, or tile text | 8 | 4 | 6 | 192 | Strip identifiers at classifier boundary, grep audit, screenshot selector tests |
| Bundle crosses the 1000 KiB review threshold | 6 | 5 | 6 | 180 | Re-measure after each beta, defer tactical and multi-host if delta rises |
| Load normalization or composite-thermal scoring misclassifies vessel health | 7 | 4 | 5 | 140 | Fixture-based threshold tests across core counts and temperature combinations |

### Make it so?
GO-WITH-CONDITIONS. The concept is strong and the dependency order is correct, but `5.4.0` needs a clean card game: one host, one generalized primitive, one fully working engineering view. Tactical placeholders and optional multi-host support are the first things I fold if bundle or QA data comes back hot.

---

## Innovation Review — Acting Ensign Wesley Crusher
*Filed: stardate 2026.05.04*

### What's exciting here
This is the *most Trek* dashboard in the family — the MSD has been the Holy Grail of LCARS recreations for thirty years and we're shipping a real, data-bound one. Generalizing the Medical silhouette+callout primitive on its second use is textbook architecture discipline (and exactly the rule from `LCARS-PANEL-EXTRACTION-ARCHITECTURE.md`). The "warp-core composite" framing of CPU thermal envelope is a masterstroke — it turns boring host metrics into something a captain *wants* to glance at.

### HA/HACS ecosystem opportunities
Host-and-substrate health integrations to pull onto this dashboard:

| HACS | Repo pattern | Adds | Caveat |
|---|---|---|---|
| Glances | `github.com/fmartingr/ha-glances` (or core) | Per-process CPU/mem, fan, sensor temps for non-HASSOS hosts | Requires Glances daemon on target |
| UptimeRobot | core integration | Public-endpoint up/down monitors | API key |
| Uptime Kuma | `github.com/meichthys/uptime-kuma` | Self-hosted multi-protocol monitors | Needs Uptime Kuma instance |
| Frigate | `github.com/blakeblackshear/frigate-hass-integration` | NVR detector FPS, GPU/coral usage, recording health | Heavy MQTT — namespace carefully |
| Zigbee2MQTT | `github.com/nerdfunk-net/zigbee2mqtt` (sensor add-on) | Coordinator LQI, devices unreachable, network map | MQTT discovery on |
| Run-On (cron health) | `github.com/iamtpage/hass-runon` | Last-run timestamps for scheduled jobs | Lightweight; great "silent failure" detector |

A "SUBSYSTEMS" tab in focus-mode could rotate these in as they're configured.

### Modern web platform leverage
- **`PerformanceObserver`** measuring this dashboard's own LCP / long-task budget client-side, then publishing back to HA via REST → an LCARS pill that says "BRIDGE CONSOLE: 47ms." *LCARS measuring LCARS.* Meta and self-justifying.
- **`navigator.connection.effectiveType`** + `downlink` exposed as a tiny client-side telemetry pill — distinguishes "server is slow" from "my phone is on 3G."
- **Background Sync API** to cache last-seen state of critical metrics so a brief HA outage shows the *last good* values with a clear "AS-OF" timestamp instead of going blank.
- **View Transitions API** for the silhouette → focus-mode-tab swap; keeps the warp-core glow continuous across the transition.
- **CSS `@property`** for the warp-core pulse — typed `<percentage>` registration lets the glow animate proportionally to actual CPU load.
- **`prefers-reduced-motion`** must hard-stop the warp-core pulse — non-negotiable accessibility gate.

### Stretch features (post-MVP)
- **ESPHome ESP32 + INA219** clamp on the HA box's USB-C power input → real wall-plug power for the host. Renders as a *literal* warp-core power gauge alongside the thermal composite. Low-cost (~$8 BoM).
- **ESP32 + DS18B20 ambient probe** in the rack/cabinet → "engineering bay ambient" tile. Catches HVAC failures before the HA host throttles.
- **SMART disk telemetry** via `smartmontools` → SSD wear-percent as a "dilithium chamber integrity" pill (terrifying when it drops below 80%).
- **Container restart counter** (Supervisor add-on stats) → "unscheduled restarts last 24h" pill — best leading indicator of a flaky add-on.

### "What if we…?"
- **"Red Alert" cascade** — when CRITICAL hits here, broadcast a CSS-custom-property change (`--lcars-alert: 1`) via a tiny shared `<lcars-alert-bus>` element so *every* dashboard's chrome flashes tomato borders in sync. Optional klaxon via Audio Spec if unmuted. Worf must approve the audio path.
- **HA Assist voice command** — "Computer, status report" → custom intent reads a templated summary ("All systems nominal. CPU 23 percent. Network nominal. 47 entities reporting."). Pairs beautifully with the $13 ATOM Echo voice satellite.
- **"Self-destruct sequence" easter egg** — Captain-only, gated behind a long-press + confirmation pill, triggers an HA automation that gracefully stops non-critical add-ons and powers down on a 60-second countdown. *Captain's call only* — not enabled by default.
- **Stardate-formatted uptime** — "VESSEL ONLINE SINCE STARDATE 2026.124.7" instead of "43 days." Pure flavor, zero engineering cost.

### Sign-off
**ENTHUSIASTIC** — this is going to be the screenshot people share when they discover the project. The Engineering-group ownership table in §14 is the kind of architectural rigor that prevents future merge fights. Ship it.

