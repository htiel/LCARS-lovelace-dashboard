## 3. Layout Specifications

### 3.1 Panel Variants

The Power Panel has **three layout variants** depending on the devices present in an area:

| Variant | Trigger | Grid Layout |
|---------|---------|-------------|
| **Summary + Circuits** | Area contains Emporia Vue with ≥5 circuits | Summary header + scrollable circuit grid |
| **Devices Only** | Area contains only switch+monitor plugs/strips | Section list of device rows |
| **Combined** | Area has both Vue circuits AND device monitors | Summary header + circuit grid + device section |

### 3.2 Grid Template — Combined Layout (Primary)

```
┌──────────────────────────────────────────────────────────────────┐
│  ⚡ MAIN PANEL                               POWER SYSTEMS      │  ← header
├──────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │  TOTAL USAGE        │  │  FROM GRID      │  │  TO GRID     │ │  ← summary
│  │  4,872 W            │  │  5,100 W ▼      │  │  228 W ▲     │ │
│  │  47.3 kWh today     │  │  51.2 kWh       │  │  3.9 kWh     │ │
│  └─────────────────────┘  └─────────────────┘  └──────────────┘ │
├──────────────────────────────────────────────────────────────────┤
│  CIRCUITS ─────────────────────────────────────────────── 43/43  │  ← section label
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │ ● KITCHEN LIGHTS │  │ ● OVEN          │  │ ○ GUEST BATH   │ │  ← circuit
│  │   342 W  ╌╌╌╌╌╌  │  │   2,847 W ╌╌╌╌  │  │   0 W          │ │     tiles
│  │   1.2 kWh today  │  │   8.4 kWh today │  │   0.0 kWh      │ │
│  └──────────────────┘  └──────────────────┘  └────────────────┘ │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │ ●● DRYER L1+L2   │  │ ● LIVING ROOM   │  │ ● OFFICE       │ │
│  │   4,200 W ╌╌╌╌╌  │  │   890 W ╌╌╌╌╌╌  │  │   156 W ╌╌╌╌╌  │
│  │   12.1 kWh today │  │   3.1 kWh today │  │   0.8 kWh      │
│  └──────────────────┘  └──────────────────┘  └────────────────┘ │
│         (scrollable — max-height with mask fade)                 │
├──────────────────────────────────────────────────────────────────┤
│  MONITORED DEVICES ──────────────────────────────────────── 3/3  │  ← section label
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ [ON]  DOG HEATING PAD        156 W │ 0.8 kWh │ ╌╌╌╌╌╌╌╌╌╌ ││  ← switch+monitor
│  ├──────────────────────────────────────────────────────────────┤│
│  │ [ON]  3D PRINTER             342 W │ 2.1 kWh │ ╌╌╌╌╌╌╌╌╌╌ ││
│  └──────────────────────────────────────────────────────────────┘│
├──────────────────────────────────────────────────────────────────┤
│  POWER STRIPS ───────────────────────────────────────────── 1/1  │  ← section label
│  ┌──────────────────────────────────────────────────────────────┐│
│  │  SERVER ROOM STRIP                          TOTAL: 487 W    ││  ← strip header
│  │  ┌──────────────────────────────────────────────────────────┐││
│  │  │ [ON]  OUTLET 1 — NAS         189 W │ 4.2 kWh │ ╌╌╌╌╌╌ │││  ← child outlets
│  │  │ [ON]  OUTLET 2 — SWITCH       12 W │ 0.3 kWh │ ╌╌╌╌╌╌ │││
│  │  │ [OFF] OUTLET 3 — UNUSED        0 W │ 0.0 kWh │         │││
│  │  │ [ON]  OUTLET 4 — UPS         186 W │ 4.1 kWh │ ╌╌╌╌╌╌ │││
│  │  │ [ON]  OUTLET 5 — PI CLUSTER  100 W │ 2.2 kWh │ ╌╌╌╌╌╌ │││
│  │  │ [OFF] OUTLET 6 — EMPTY         0 W │ 0.0 kWh │         │││
│  │  └──────────────────────────────────────────────────────────┘││
│  └──────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────┘
```

### 3.3 CSS Grid Definition

```css
.lcars-power-panel {
  --panel-frame-color: var(--lcars-butterscotch);

  display: grid;
  grid-template-areas:
    "header"
    "summary"
    "circuits"
    "devices"
    "strips";
  grid-template-columns: 1fr;
  grid-template-rows: auto auto auto auto auto;
  gap: var(--lcars-gap);

  border-left: 4px solid var(--panel-frame-color);
  border-top: 2px solid var(--panel-frame-color);
  border-right: 2px solid var(--panel-frame-color);
  border-bottom: 4px solid var(--panel-frame-color);
  border-radius: 0.75rem;
  padding: var(--lcars-gap);
  background: var(--lcars-black);
  min-height: calc(var(--lcars-vunit) * 4);
}

/* ─── Summary Cards Row ─── */
.power-summary {
  grid-area: summary;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr));
  gap: var(--lcars-gap);
}

/* ─── Circuit Tile Grid ─── */
.power-circuits {
  grid-area: circuits;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
  gap: var(--lcars-gap);
  max-height: 24rem;
  overflow-y: auto;
  mask-image: linear-gradient(to bottom, black calc(100% - 2rem), transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, black calc(100% - 2rem), transparent 100%);
}

/* ─── Device Rows ─── */
.power-devices {
  grid-area: devices;
  display: flex;
  flex-direction: column;
  gap: var(--lcars-gap);
}

/* ─── Power Strip Blocks ─── */
.power-strips {
  grid-area: strips;
  display: flex;
  flex-direction: column;
  gap: calc(var(--lcars-gap) * 2);
}
```

### 3.4 Handling Variable Device Counts

| Scenario | Behavior |
|----------|----------|
| **1–3 circuits** | Grid collapses to single row. Panel is compact. Empty space is beautiful. |
| **4–12 circuits** | Grid fills 2–4 rows. No scrolling needed. |
| **13–30 circuits** | Grid fills available height. Scroll activates with bottom fade mask. |
| **30+ circuits** (Main Panel) | Same as above. The 24rem `max-height` on `.power-circuits` triggers scroll. Section label shows count: "CIRCUITS ── 43/43" |
| **0 circuits, devices only** | `summary` and `circuits` grid areas are empty/hidden. Panel shows only device rows. |
| **Mixed** | All sections shown. Each section collapses to `display: none` if empty. |

### 3.5 240V Circuit Pairing

240V appliances (dryer, oven, EV charger, water heater) appear as L1/L2 pairs on Emporia Vue. The panel MUST combine these:

- **Detection**: Two circuits with matching names differing only by `L1`/`L2`, `Line 1`/`Line 2`, or adjacent circuit numbers
- **Display**: Single tile showing combined wattage (`L1 + L2`), labeled with the shared name
- **Indicator**: Double dot `●●` to indicate paired circuit
- **Tap action**: Shows both entity IDs in the `more-info` dialog

### 3.6 Responsive Breakpoints

```css
/* ─── Desktop (≥1024px) — Full grid ─── */
/* Default layout above applies */

/* ─── Tablet (768–1023px) — Narrower tiles ─── */
@media (max-width: 1023px) {
  .power-circuits {
    grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));
  }
  .power-summary {
    grid-template-columns: repeat(auto-fit, minmax(7rem, 1fr));
  }
}

/* ─── Mobile (<768px) — Single column stack ─── */
@media (max-width: 767px) {
  .lcars-power-panel {
    grid-template-areas:
      "header"
      "summary"
      "circuits"
      "devices"
      "strips";
    /* Same areas, layout stays single-column */
  }

  .power-circuits {
    grid-template-columns: 1fr 1fr;
    max-height: 16rem;
  }

  .power-summary {
    grid-template-columns: 1fr;
    gap: var(--lcars-gap);
  }

  /* Switch+monitor rows stack vertically */
  .power-device-row {
    flex-direction: column;
    align-items: stretch;
  }
}

/* ─── Narrow mobile (<480px) — Single column everything ─── */
@media (max-width: 479px) {
  .power-circuits {
    grid-template-columns: 1fr;
  }
}
```

---
