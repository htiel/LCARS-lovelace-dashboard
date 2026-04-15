## 4. Component Specifications

### 4.1 Summary Header Cards

Three cards in a horizontal row showing whole-home metrics from Emporia Vue `TotalUsage`, `MainsFromGrid`, `MainsToGrid`:

```
┌─────────────────────┐
│  TOTAL USAGE        │  ← label (data size, ice)
│  4,872 W            │  ← value (title size, dynamic power color)
│  47.3 kWh TODAY     │  ← secondary (data size, space-white)
│  ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌   │  ← sparkline (24h trend)
└─────────────────────┘
```

```css
.power-summary-card {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  border-left: 3px solid var(--card-accent, var(--lcars-butterscotch));
  border-radius: 0 0.25rem 0.25rem 0;
  background: rgba(255, 255, 255, 0.03);
  min-width: 8rem;
}

.power-summary-label {
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-ice);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.power-summary-value {
  font-size: var(--lcars-font-size-title);
  font-weight: 700;
  color: var(--summary-value-color, var(--lcars-space-white));
  text-transform: uppercase;
}

.power-summary-secondary {
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-space-white);
  opacity: 0.8;
}
```

**Summary card contents**:

| Card | Label | Value Entity | Unit | Secondary Entity | Accent Color |
|------|-------|-------------|------|-----------------|-------------|
| Total Usage | TOTAL USAGE | `sensor.*_totalusage_power_minute_average` | W | `sensor.*_totalusage_energy_today` (kWh) | Dynamic (by wattage) |
| From Grid | FROM GRID | `sensor.*_mainsfromgrid_power_minute_average` | W | `sensor.*_mainsfromgrid_energy_today` (kWh) | `--lcars-butterscotch` |
| To Grid | TO GRID | `sensor.*_mainstogrid_power_minute_average` | W | `sensor.*_mainstogrid_energy_today` (kWh) | `--lcars-ice` |

If the area has no whole-home monitor (no `TotalUsage`/`MainsFromGrid` entities), the summary section is hidden entirely.

### 4.2 Circuit Tile

Compact tile for individual Emporia Vue circuit monitors. This is the most common element — areas can have 40+ of these.

```
┌──────────────────┐
│ ● KITCHEN LIGHTS │  ← indicator dot + name (data size, space-white)
│   342 W  ╌╌╌╌╌╌  │  ← value + inline sparkline
│   1.2 kWh TODAY  │  ← energy today (data size, dimmed)
└──────────────────┘
```

```css
.power-circuit-tile {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  padding: 0.375rem 0.5rem;
  background: rgba(255, 255, 255, 0.03);
  border-left: 3px solid var(--circuit-color, var(--lcars-ice));
  border-radius: 0 0.25rem 0.25rem 0;
  cursor: pointer;
  transition: background var(--lcars-transition);
  min-height: 3rem;
}

.power-circuit-tile:hover {
  background: rgba(255, 255, 255, 0.06);
}

.power-circuit-tile:focus-visible {
  outline: 2px solid var(--lcars-ice);
  outline-offset: 2px;
}

.power-circuit-name {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-space-white);
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.power-circuit-indicator {
  flex-shrink: 0;
  font-size: 0.625rem;
  color: var(--circuit-color, var(--lcars-ice));
}

.power-circuit-value-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.power-circuit-watts {
  font-size: var(--lcars-font-size-data);
  font-weight: 700;
  color: var(--circuit-color, var(--lcars-ice));
  white-space: nowrap;
}

.power-circuit-energy {
  font-size: 0.75rem;
  color: var(--lcars-space-white);
  opacity: 0.6;
  text-transform: uppercase;
}
```

**Tile sizing**: Minimum 10rem wide. At default grid sizing, 3 columns on desktop, 2 on tablet, 1–2 on mobile. Tiles are uniform height per row via CSS grid auto-rows.

### 4.3 Switch + Monitor Row

For TP-Link smart plugs (KP115, KP125M, HS110) that have both a `switch.*` and power telemetry sensors.

```
┌────────────────────────────────────────────────────────────────┐
│ [ON]  DOG HEATING PAD          156 W │ 0.8 kWh │ ╌╌╌╌╌╌╌╌╌╌  │
└────────────────────────────────────────────────────────────────┘
```

```css
.power-device-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
  transition: background var(--lcars-transition);
  cursor: pointer;
  min-height: 2.5rem;
}

.power-device-row:hover {
  background: rgba(255, 255, 255, 0.05);
}

.power-device-row:focus-visible {
  outline: 2px solid var(--lcars-ice);
  outline-offset: 2px;
}

/* Toggle pill — reuses existing .toggle-pill pattern */
.power-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 1.5rem;
  border-radius: 0.75rem;
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  border: none;
  cursor: pointer;
  flex-shrink: 0;
  transition: background var(--lcars-transition);
}

.power-toggle[data-state="on"] {
  background: var(--lcars-gold);
  color: var(--lcars-black);
}

.power-toggle[data-state="off"] {
  background: var(--lcars-gray);
  color: var(--lcars-space-white);
}

.power-toggle:focus-visible {
  outline: 2px solid var(--lcars-ice);
  outline-offset: 2px;
}

.power-device-name {
  flex: 1;
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-space-white);
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.power-device-stats {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.power-device-watts {
  font-size: var(--lcars-font-size-data);
  font-weight: 700;
  color: var(--circuit-color, var(--lcars-ice));
  white-space: nowrap;
  min-width: 4rem;
  text-align: right;
}

.power-device-energy {
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-space-white);
  opacity: 0.7;
  white-space: nowrap;
  min-width: 4rem;
  text-align: right;
}
```

### 4.4 Power Strip Block

For TP-Link HS300 power strips. A parent block with 6 child outlet rows inside.

```
┌──────────────────────────────────────────────────────────────┐
│  SERVER ROOM STRIP                          TOTAL: 487 W     │  ← strip header
│ ─────────────────────────────────────────────────────────── │
│  [ON]  OUTLET 1 — NAS              189 W │ 4.2 kWh │ ╌╌╌╌  │  ← child rows
│  [ON]  OUTLET 2 — SWITCH            12 W │ 0.3 kWh │ ╌╌╌╌  │
│  [OFF] OUTLET 3 — UNUSED             0 W │ 0.0 kWh │        │
│  [ON]  OUTLET 4 — UPS              186 W │ 4.1 kWh │ ╌╌╌╌  │
│  [ON]  OUTLET 5 — PI CLUSTER       100 W │ 2.2 kWh │ ╌╌╌╌  │
│  [OFF] OUTLET 6 — EMPTY              0 W │ 0.0 kWh │        │
└──────────────────────────────────────────────────────────────┘
```

```css
.power-strip-block {
  border: 2px solid var(--panel-frame-color, var(--lcars-butterscotch));
  border-radius: 0.5rem;
  padding: var(--lcars-gap);
  background: var(--lcars-black);
}

.power-strip-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.25rem 0.5rem;
  margin-bottom: var(--lcars-gap);
}

.power-strip-name {
  font-size: var(--lcars-font-size-sub);
  color: var(--lcars-text-heading);
  text-transform: uppercase;
}

.power-strip-total {
  font-size: var(--lcars-font-size-data);
  color: var(--circuit-color, var(--lcars-ice));
  font-weight: 700;
  text-transform: uppercase;
}

.power-strip-divider {
  height: 1px;
  background: var(--panel-frame-color, var(--lcars-butterscotch));
  opacity: 0.3;
  margin-bottom: var(--lcars-gap);
}

.power-strip-outlets {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* Child outlet rows reuse .power-device-row styling */
.power-strip-outlets .power-device-row {
  padding-left: 1rem;  /* Indent children under parent */
}
```

### 4.5 Sparkline Sizing

Reuses `renderSparkline()` from `lcars-sparkline.js`:

| Context | Width | Height | Stroke Color | Data Source |
|---------|-------|--------|-------------|------------|
| Summary card sparkline | 120px | 24px | `var(--lcars-butterscotch)` | `*_power_minute_average` 24h stats |
| Circuit tile sparkline | 80px | 16px | `var(--circuit-color)` | `*_power_minute_average` 24h stats |
| Device row sparkline | 80px | 16px | `var(--circuit-color)` | `*_current_consumption` 24h stats |

Sparklines are fetched via `fetchSparklineData()` with the shared WebSocket-based statistics fetcher already used by the temp/humidity grid. Max 20 entities per batch (reconciled — spec originally said 50, Wesley's code said 10, Data recommended 20).

### 4.6 Section Labels

Each section within the panel has a thin rule + label in the established LCARS pattern:

```css
.power-section-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0;
  margin-top: 0.25rem;
}

.power-section-label-text {
  font-size: var(--lcars-font-size-sub);
  color: var(--lcars-text-heading);
  text-transform: uppercase;
  white-space: nowrap;
  flex-shrink: 0;
}

.power-section-label-rule {
  flex: 1;
  height: 2px;
  background: var(--panel-frame-color, var(--lcars-butterscotch));
  opacity: 0.5;
}

.power-section-label-count {
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-ice);
  white-space: nowrap;
  flex-shrink: 0;
}
```

### 4.7 Panel Header

Reuses the standard device panel header pattern:

```
⚡ MAIN PANEL                                    POWER SYSTEMS
^  ^                                              ^
icon  area name (sunflower, sub size)              badge (ice, data size)
      ──────────────────────────────── (thin rule)
```

```css
.power-panel-header {
  grid-area: header;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  min-height: var(--lcars-bar-h);
}

.power-panel-header ha-icon {
  --mdc-icon-size: 20px;
  color: var(--panel-frame-color, var(--lcars-butterscotch));
  flex-shrink: 0;
}

.power-panel-name {
  font-size: var(--lcars-font-size-sub);
  color: var(--lcars-text-heading);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.power-panel-header-line {
  flex: 1;
  height: 2px;
  background: var(--panel-frame-color, var(--lcars-butterscotch));
}

.power-panel-badge {
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-data-accent);
  text-transform: uppercase;
  white-space: nowrap;
}
```

---
