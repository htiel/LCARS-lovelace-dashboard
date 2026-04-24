# LCARS Engineering Dashboard Spec (5X-2.3)

> Engineering / Power — all batteries, power sensors, energy monitoring.
> Frame color: `--lcars-butterscotch` (#ff9966). Sidebar: african-violet.
> Filters: ALL / STORAGE / CIRCUITS

---

## §1 Entity Scope

| Domain | Device Classes | Count (this instance) |
|--------|---------------|----------------------|
| `sensor` | battery | 130 |
| `sensor` | power | 287 |
| `sensor` | energy | 337 |
| `sensor` | voltage | 69 |
| `sensor` | current | 54 |
| `switch` | (smart plugs) | 5 (TPLink: UDM SE, Switch 24E, NVR, RPS, DS918+) |

**Key platforms**: TPLink (smart plugs), EcoFlow (portable battery), Emporia Vue (circuit monitoring), NUT (UPS).

---

## §2 Layout Structure

```
┌──────────────────────────────────────────────────────────┐
│ [Elbow]  SITE NAME ════════════════════════ [🔇][⚙]    │
├──────────┬───────────────────────────────────────────────┤
│          │  WARP CORE SUMMARY STRIP                     │
│ ENGINEER │  TOTAL: 2,847W | GRID: 3.1kW | BAT: 78%    │
│ -ING     │  [████ area1 ██ area2 █ area3 ████ area4]   │
│          ├───────────────────────────────────────────────┤
│ ┌──────┐ │  SERVER ROOM ─────────────────────────       │
│ │ ALL  │ │  ┌──────────────┐ ┌──────────────┐          │
│ │      │ │  │ UDM SE       │ │ Switch 24E   │          │
│ ├──────┤ │  │ 42W  ████░░  │ │ 18W  ██░░░░  │          │
│ │STORE │ │  │ [toggle]     │ │ [toggle]     │          │
│ │      │ │  └──────────────┘ └──────────────┘          │
│ ├──────┤ │                                              │
│ │CIRCT │ │  GARAGE ──────── ┌──────────────┐            │
│ │      │ │                  │ EcoFlow      │            │
│ ├──────┤ │                  │ ██████░░ 78% │            │
│ │▓▓▓▓▓▓│ │                  │ 4.2h remain  │            │
│ │filler│ │                  └──────────────┘            │
├──────────┤──────────────────────────────────────────────┤
│ [Elbow]  │  ENERGY — 7 DAY LOG                         │
│ ═════════╪══ LCARS 5.0.0 ══════════════════             │
└──────────┴───────────────────────────────────────────────┘
```

---

## §3 Device Elements

### §3.1 Power Monitor Tile
- Bordered card: `1px solid rgba(255,153,102,0.15)`, `0.5rem` border-radius
- Header: device name + `POWER` / `ENERGY` / `VOLTAGE` / `CURRENT` badge
- Value: large text (`1.5rem`), unit suffix, tabular-nums
- Color: 5-tier wattage scale (reuse from Power Panel):
  - 0-50W: `--lcars-gray`
  - 50-200W: `--lcars-ice`
  - 200-500W: `--lcars-sunflower`
  - 500-1000W: `--lcars-butterscotch`
  - 1000W+: `--lcars-tomato`
- Flat fills only — no gradients (Bracer Jack Rule 1)
- Area labels must accompany color (WCAG 1.4.1)

### §3.2 Battery Pill (Compact)
- For devices with `device_class: battery`
- Pill shape: device name + segmented fill bar + percentage
- Color by charge level:
  - >50%: `--lcars-ice`
  - 20-50%: `--lcars-butterscotch`
  - <20%: `--lcars-tomato`
- Sorted: lowest charge first
- Grid: `repeat(auto-fill, minmax(14rem, 1fr))`

### §3.3 Battery Warp Core (EcoFlow / UPS)
- Reuse `<lcars-battery-panel>` from Habitat for full battery devices
- Vertical cylinder with fill level
- I/O flow conduits: charge/discharge arrows
- Estimated runtime text
- Frame: `--lcars-ice`

### §3.4 Smart Plug Toggle
- Reuse Consolidated Power Panel sliding track
- Toggle track + name + wattage readout
- Rate-limited service calls

---

## §4 Hero Element: Warp Core Summary Strip

Full-width 2-row block below header:

**Row 1** — three data blocks:
| Block | Content | Source |
|-------|---------|--------|
| TOTAL DRAW | Sum of all power sensors (W) | `sensor.*` where `device_class: power` |
| GRID | Import/export direction + value | Main panel sensors |
| BATTERY | Highest-priority battery % + estimated runtime | EcoFlow / UPS sensors |

**Row 2** — Power Distribution Bar:
- Horizontal segmented bar, proportional width per area
- Each segment: area name label + wattage
- Color palette rotating: butterscotch → sunflower → almond → ice
- Tap segment → scroll to area section below

---

## §5 Energy Chart (Future Enhancement)

7-day horizontal bar chart using HA `recorder/statistics_during_period` WebSocket API.
- One bar per day, segmented by area
- Y-axis: kWh
- Pure CSS/SVG — no chart library dependency
- `role="img"` + `aria-label` on SVG for screen readers
- Statistics entity IDs validated with regex before WS call (Worf: approved)

---

## §6 Filter Behavior

| Filter | Shows |
|--------|-------|
| ALL | All power/battery entities |
| STORAGE | Battery-class entities + full battery panels (EcoFlow/UPS) |
| CIRCUITS | Power/energy/voltage/current sensors + smart plug toggles |

---

## §7 Reused Components

- `<lcars-battery-panel>` — warp core visualization for full battery devices
- `<lcars-power-panel>` — consolidated power monitoring (reference for power-tier colors)
- Smart plug sliding track toggle from Consolidated Power Panel
- `formatNumber()` from `lcars-format-utils.js`
