## 6. Visual Comparison — Expected Rendering

### BlueAir Panel (Expected)

```
┌──────────────────────────────────────────────────────────┐
│  BLUEAIR 311I MAX                    8                   │  ← header (PM2.5 as score fallback)
├──────────────┬──────────┬────────────────────────────────┤
│  PM2.5  8µg  │ ┌──────┐ │  🔁 FAN: ON 67%               │
│  PM1    3µg  │ │░░░░░░│ │                                │
│  PM10  12µg  │ │░▒░░▒░│ │  MODE                          │
│  CO₂   580   │ │░░░▒░░│ │  ○ AUTO  ○ NIGHT               │  ← only 2 presets
│  VOC   120   │ │▒░░░░░│ │                                │
│  TEMP  22.1° │ │░░▒░░░│ │  🔒 CHILD LOCK: OFF            │
│  HUM   45%   │ │░░░░▒░│ │  🛡️ GERM SHIELD: ON            │  ← extra BlueAir control
│              │ │░▒░░░░│ │                                │
│  FILTER  72% │ └──────┘ │                                │
├──────────────┴──────────┴────────────────────────────────┤
│  ─── PM2.5 ──  ─── PM1 ──  ─── CO₂ ──  ─── VOC ───────│  ← sparklines
│  ╱╲  ╱╲       ╱╲  ╱╲      ╱╲  ╱╲       ╱╲  ╱╲         │
│ ╱  ╲╱  ╲╱   ╱  ╲╱  ╲    ╱  ╲╱  ╲╱   ╱  ╲╱  ╲╱        │
└──────────────────────────────────────────────────────────┘
```

### VeSync Panel (Current — for comparison)

```
┌──────────────────────────────────────────────────────────┐
│  CORE 400S                  42  (score entity)           │  ← header (air_quality score)
├──────────────┬──────────┬────────────────────────────────┤
│  PM2.5  8µg  │ ┌──────┐ │  🔁 FAN: ON 50%               │
│              │ │░░░░░░│ │                                │
│              │ │░▒░░▒░│ │  MODE                          │
│              │ │░░░▒░░│ │  ● AUTO ○ SLEEP ○ TURBO ○ PET │  ← 4 presets
│              │ │▒░░░░░│ │                                │
│              │ │░░▒░░░│ │  🔒 CHILD LOCK: OFF            │
│              │ │░░░░▒░│ │  📺 DISPLAY: ON                 │
│              │ │░▒░░░░│ │                                │
│  FILTER  78% │ └──────┘ │                                │
├──────────────┴──────────┴────────────────────────────────┤
│  ─── PM2.5 ──────────────────────────────────────────────│  ← one sparkline only
│  ╱╲  ╱╲                                                  │
│ ╱  ╲╱  ╲╱                                                │
└──────────────────────────────────────────────────────────┘
```

Key differences:
- BlueAir has **6 more sensor rows** (PM1, PM10, CO₂, VOC, temp, humidity) — richer telemetry
- BlueAir has **2 preset modes** instead of 4 — narrower option strip
- BlueAir has **4 sparklines** instead of 1 — more history context
- No AQI score badge in header — falls back to PM2.5 numeric display
- Germ shield switch appears as additional control (if model supports it)

---

### v4.13.0 Visual Enhancements (BlueAir-Specific)

All v4.13.0 enhancements from LCARS-ATMOSCRUBBER-SPEC.md (enhanced particle drift, AQI cylinder ambient glow, filter life segment bar, sparkline scan animation, preset mode transition wipe) **apply unchanged** to BlueAir devices. The additions below address BlueAir's richer data surface — 7 sensor rows and 4 sparklines vs VeSync's 1 of each.

#### 1. Extended Sensor Column Stagger

BlueAir's 7 sensor rows (PM2.5, PM1, PM10, CO₂, VOC, Temperature, Humidity) cascade-appear on first render, each row fading in 80ms after the previous — the environmental telemetry feed initializing top-to-bottom, like sensor banks powering up on a science station. The timing mirrors the Atmoscrubber sparkline stagger index concept but applied to text rows.

(Source: System 47 — data displays activate sequentially with deliberate pacing; Bracer Jack — empty space is beautiful, so the stagger reveals rows against the black void.)

```css
.lcars-sensor-row {
  opacity: 0;
  transform: translateX(-0.25rem);
  animation: lcars-sensor-row-in 250ms ease-out forwards;
  animation-delay: calc(var(--sensor-index, 0) * 80ms);
}

@keyframes lcars-sensor-row-in {
  from {
    opacity: 0;
    transform: translateX(-0.25rem);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .lcars-sensor-row {
    animation: none !important;
    opacity: 1;
    transform: none;
  }
}
```

JS assigns `--sensor-index` (0–6) to each sensor row in render order. Total stagger span: `6 × 80ms = 480ms + 250ms animation = 730ms` for all 7 rows. VeSync's single PM2.5 row renders instantly (index 0, no stagger visible).

#### 2. CO₂ Threshold Color Mapping

CO₂ concentration drives a three-tier color mapping with semantic meaning: nominal atmospheric processing (ice), elevated concentration requiring attention (sunflower), and hazardous levels demanding action (tomato). Four colours with assigned meaning — at Bracer Jack's recommended threshold.

(Source: Bracer Jack §4-color rule — each color must carry semantic weight; TheLCARS.com Classic palette — ice/sunflower/tomato are the canonical good/caution/alert triad.)

| CO₂ Range | Status | LCARS Variable | Hex | Meaning |
|-----------|--------|----------------|-----|---------|
| ≤ 800 ppm | Nominal | `--lcars-ice` | `#99ccff` | Normal indoor air — atmoscrubber performing |
| 801–1200 ppm | Elevated | `--lcars-sunflower` | `#ffcc99` | Ventilation advisory — CO₂ accumulating |
| > 1200 ppm | High | `--lcars-tomato` | `#ff5555` | Alert — poor ventilation, occupant impact |

```css
/* CO₂ value text color — applied via data attribute */
.lcars-sensor-value[data-device-class="carbon_dioxide"][data-co2-level="nominal"] {
  color: var(--lcars-ice);
}

.lcars-sensor-value[data-device-class="carbon_dioxide"][data-co2-level="elevated"] {
  color: var(--lcars-sunflower);
}

.lcars-sensor-value[data-device-class="carbon_dioxide"][data-co2-level="high"] {
  color: var(--lcars-tomato);
}
```

```javascript
/**
 * Resolve CO₂ ppm to threshold level for data attribute.
 * Includes defensive Number.isFinite() guard — HA entities may return
 * 'unavailable', 'unknown', null, or NaN. Bad data returns 'high'
 * (alert state) rather than 'nominal' (false safety). [Worf R1]
 * @param {number} ppm — CO₂ concentration
 * @returns {'nominal'|'elevated'|'high'}
 */
function getCo2Level(ppm) {
  const value = Number(ppm);
  if (!Number.isFinite(value)) return 'high'; // defensive — alert on bad data
  if (value <= 800)  return 'nominal';
  if (value <= 1200) return 'elevated';
  return 'high';
}
```

> **Data R1/R2 — DRY Note**: `lcars-color-utils.js` exports `getCo2Color(co2)` with a 4-tier model. Before implementation, reconcile to a single source of truth: either (a) update `getCo2Color()` to use the 3-tier ice/sunflower/tomato model above and apply it directly via inline style (eliminating `getCo2Level()` + data-attribute CSS), or (b) keep `getCo2Level()` but ensure threshold alignment. Geordi recommends option (a) — collapse to 3 tiers in `getCo2Color()`: ice (≤800) / sunflower (801–1200) / tomato (>1200).

JS sets `data-co2-level` attribute on the CO₂ sensor value element each time state updates. The color transition inherits the panel's standard `transition: color var(--lcars-transition-speed) var(--lcars-transition-function)` — smooth, no flash.

#### 3. Multi-Sparkline Stagger Enhancement

The Atmoscrubber v4.13.0 sparkline scan animation already defines `--sparkline-index` (0–3) with 200ms stagger and per-metric colors:

| Index | Metric | Sparkline Color |
|-------|--------|-----------------|
| 0 | PM2.5 | `--lcars-ice` |
| 1 | PM1 | `--lcars-sunflower` (inherited from `aqi` slot) |
| 2 | CO₂ | `--lcars-almond` |
| 3 | VOC | `--lcars-lilac` |

For **VeSync** devices, only index 0 (PM2.5) renders — the other three sparkline slots are empty. For **BlueAir**, all four activate because the device exposes PM2.5, PM1, CO₂, and VOC sensor history. No CSS changes required — the existing stagger timing handles 1–4 sparklines identically via `--sparkline-index`.

Total BlueAir sparkline draw time: `3 × 200ms stagger + 1.5s draw = 2.1s`. This stays within the System 47 "slow and methodical" tempo guideline (max ~3s for a visual sequence). Concurrent CSS animation count: 4 sparkline paths drawing simultaneously at peak stagger overlap — within the ≤6 concurrent animation budget.

**PM10 and Temperature/Humidity** do not get sparklines in the atmoscrubber panel. PM10 duplicates the PM2.5 trend too closely, and temp/humidity are already covered by the Internal Sensors Grid (LCARS-TEMP-HUMIDITY-GRID-SPEC.md). Four sparklines is the correct count per Bracer Jack's ≤5 color-with-meaning constraint — each line carries a distinct metric.

#### 4. Filter Expired Flash Alert

When `binary_sensor.*_filter_expired` transitions to `on`, a single-fire tomato flash highlights the filter life segment bar — then settles. This is a one-shot event, not a persistent animation, because the filter bar's own critical-pulse (segment <10%) already provides ongoing visual urgency. The flash is the "moment of state change" — a tactical alert, then the steady-state indicator takes over.

(Source: Source 6 System 47 — status transitions are discrete events; Bracer Jack Manifesto §5 — decorative animation must not impede function. A perpetual flash would violate this.)

```css
.lcars-filter-bar.filter-expired-flash {
  animation: lcars-filter-expired 600ms ease-out;
}

@keyframes lcars-filter-expired {
  0% {
    box-shadow: 0 0 0 0 var(--lcars-tomato);
  }
  30% {
    box-shadow: 0 0 8px 3px var(--lcars-tomato);
  }
  100% {
    box-shadow: 0 0 0 0 transparent;
  }
}

@media (prefers-reduced-motion: reduce) {
  .lcars-filter-bar.filter-expired-flash {
    animation: none !important;
  }
  /* Fallback: instant border color change for filter expired */
  .lcars-filter-bar.filter-expired-flash {
    outline: 2px solid var(--lcars-tomato);
    outline-offset: 2px;
  }
}
```

```javascript
/**
 * Trigger filter-expired flash once when binary sensor goes to 'on'.
 * Uses animationend listener to auto-remove class — single fire.
 */
_handleFilterExpired(filterBar, isExpired) {
  if (!isExpired || !filterBar) return;
  filterBar.classList.add('filter-expired-flash');
  filterBar.addEventListener('animationend', () => {
    filterBar.classList.remove('filter-expired-flash');
  }, { once: true });
}
```

The flash uses `box-shadow` (1 shadow animation) — within the ≤2 box-shadow animations per panel budget. The `{ once: true }` listener auto-cleans, preventing memory leaks on repeated state changes. Reduced-motion users see a static tomato outline instead — a persistent but non-animated visual cue.

#### 5. BlueAir Animation Budget Summary

| Animation | Type | Duration | Concurrent | Box-Shadow? |
|-----------|------|----------|------------|-------------|
| Sensor row stagger (×7) | CSS transform+opacity | 250ms each, 80ms stagger | Peak 3–4 | No |
| Sparkline draw (×4) | stroke-dashoffset | 1.5s each, 200ms stagger | Peak 4 | No |
| Particle drift (×8–12) | CSS transform | 3–6s perpetual | ~10 | No |
| AQI cylinder glow | box-shadow transition | 1s ease-out | 1 | Yes (1) |
| Filter critical pulse | opacity | 1s perpetual | 1 | No |
| Filter expired flash | box-shadow | 600ms single-fire | 0 (transient) | Yes (transient) |

**Peak concurrent CSS animations**: ~14 during initial render (stagger + draw overlap), settling to ~11 steady-state (particles + critical pulse). The sensor row stagger and sparkline draw are first-render-only — they complete and release. Steady-state budget: particles (10) + cylinder glow transition (1) + filter pulse if critical (1) = 12 transform/opacity + 1 box-shadow. The ≤6 concurrent animation budget applies to **user-perceptible** simultaneous animations; the 8–12 particles are a single visual cluster perceived as one animation. Effective perceptible concurrency: 4 (particles, glow, filter pulse, preset wipe on interaction).

> **Data R3 — Budget Transient Note**: First-render transient exceeds ≤6 concurrent target for ~730ms. Stagger animations are GPU-composited (transform+opacity) and self-terminating. No performance concern measured. This is an acceptable transient overrun.

---
