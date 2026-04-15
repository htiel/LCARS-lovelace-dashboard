## 1. Answers to Geordi's Open Questions (§13)

### Q1: Doughnut/Bar Chart in Summary Section?

**Yes — an inline SVG segmented arc.** Not a full doughnut (too consumer-dashboard, not LCARS), but a **half-arc power distribution meter** in the summary section header. Think of it as the curved power allocation bar from TNG's Main Engineering master display.

The arc shows the **top 5 circuits by consumption** as colored segments, with remaining circuits grouped as a "OTHER" segment. It sits alongside the total wattage number in the header.

```
                    ╭━━━━━━━╮
                ╭━━━╯ HVAC  ╰━━━╮
            ╭━━━╯   2400W       ╰━━━╮
        ╭━━━╯                        ╰━━╮
    ╭━━━╯  OTHER                  DRYER ╰━╮
   ╭╯  847W                      4800W    ╰╮
   ╰─FRIDGE──WASHER──KITCHEN─────────────────╯
      85W     487W    120W

                   8739 W
              TODAY: 47.2 kWh
```

**Implementation** — Pure inline SVG, no library:

```js
_renderPowerArc(circuits, totalWatts) {
  if (!circuits.length || totalWatts === 0) return '';

  // Sort by power, take top 5
  const sorted = [...circuits]
    .map(c => ({ name: this._shortDeviceName(c.device), watts: this._getPrimaryPower(c) || 0 }))
    .filter(c => c.watts > 0)
    .sort((a, b) => b.watts - a.watts);

  const top5 = sorted.slice(0, 5);
  const otherWatts = sorted.slice(5).reduce((sum, c) => sum + c.watts, 0);
  if (otherWatts > 0) top5.push({ name: 'OTHER', watts: otherWatts });

  // Arc geometry: 180° half-circle, left to right
  const cx = 120, cy = 100, r = 80;
  const startAngle = Math.PI; // left
  const totalAngle = Math.PI; // sweep right

  let currentAngle = startAngle;
  const segments = top5.map(seg => {
    const fraction = seg.watts / totalWatts;
    const sweep = fraction * totalAngle;
    const endAngle = currentAngle - sweep;

    const x1 = cx + r * Math.cos(currentAngle);
    const y1 = cy - r * Math.sin(currentAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy - r * Math.sin(endAngle);
    const largeArc = sweep > Math.PI ? 1 : 0;
    const color = getPowerColor(seg.watts);

    const path = `M ${x1.toFixed(1)},${y1.toFixed(1)} A ${r},${r} 0 ${largeArc},1 ${x2.toFixed(1)},${y2.toFixed(1)}`;
    currentAngle = endAngle;

    return { path, color, name: seg.name, watts: seg.watts, fraction };
  });

  return html`
    <svg class="power-distribution-arc" viewBox="0 0 240 120"
      role="img" aria-label="Power distribution: ${totalWatts}W total">
      <!-- Segments -->
      ${segments.map(seg => svg`
        <path d="${seg.path}" fill="none" stroke="${seg.color}"
          stroke-width="10" stroke-linecap="butt">
          <title>${seg.name}: ${Math.round(seg.watts)}W (${Math.round(seg.fraction * 100)}%)</title>
        </path>
      `)}
      <!-- Background arc (unallocated) -->
      <path d="M ${cx - r},${cy} A ${r},${r} 0 1,1 ${cx + r},${cy}"
        fill="none" stroke="var(--lcars-gray)" stroke-width="10"
        stroke-linecap="butt" opacity="0.15" />
      <!-- Total text -->
      <text x="${cx}" y="${cy - 15}" text-anchor="middle"
        fill="var(--lcars-text-heading)" font-family="var(--lcars-font)"
        font-size="28" font-weight="bold">
        ${this._formatWatts(totalWatts)}
      </text>
      <text x="${cx}" y="${cy + 5}" text-anchor="middle"
        fill="var(--lcars-space-white)" font-family="var(--lcars-font)"
        font-size="10" opacity="0.7">
        TOTAL
      </text>
    </svg>
  `;
}
```

**CSS**:
```css
.power-distribution-arc {
  width: 100%;
  max-width: 15rem;
  height: auto;
  margin: 0 auto;
}
```

**Design review for Geordi**: The arc uses the same power-level color palette from §2.1. Each segment gets the color corresponding to its own wattage tier. The `stroke-linecap: butt` keeps segments flush (no rounded cap overlap). A 1px gap between segments can be achieved with `stroke-dashoffset` if Geordi wants visual separation.

### Q2: Power Flow Animation / EPS Conduit View?

**Deferred to v4.16.0+.** Concur with Geordi's assessment — a full EPS conduit topology view (à la `power-flow-card-plus`) is scope creep for v4.15.0. Here's what I'd propose for the future:

**v4.15.0**: The mains summary section already has animated flow conduits (reusing battery panel's `io-conduit` CSS). That's sufficient animated flow for launch.

**v4.16.0 candidate** (post-extraction): A dedicated "EPS Grid" view within the power panel that shows Sankey-style flow from mains → circuits using pure CSS/SVG. When panels are extracted to individual custom elements, each power panel could toggle between "tile grid" and "flow diagram" views using the **View Transition API** for a smooth crossfade. The conduit paths would be rendered as SVG `<path>` elements with animated `stroke-dashoffset` — same flat LCARS aesthetic, no 3D.

### Q3: Configurable Thresholds?

**Yes, expose via `_config` but with sensible defaults.** The tier boundaries (0/500/1500/3000) work for US 120V residential. For EU 230V or commercial, higher thresholds make sense. Add optional config in the card YAML:

```yaml
# Example: EU residential with higher base loads
type: custom:lcars-homepage-card
power_thresholds:
  low_max: 800      # Default: 500
  moderate_max: 2500 # Default: 1500
  high_max: 5000    # Default: 3000
```

Implementation — `getPowerColor()` accepts optional threshold overrides (same pattern as `getTempColor()` in lcars-color-utils.js):

```js
export function getPowerColor(watts, thresholds = {}) {
  const {
    lowMax = 500,
    moderateMax = 1500,
    highMax = 3000,
  } = thresholds;

  if (watts == null || isNaN(watts)) return 'var(--lcars-disabled)';
  const w = Math.abs(Number(watts));
  if (w === 0)          return 'var(--lcars-gray)';
  if (w <= lowMax)      return 'var(--lcars-ice)';
  if (w <= moderateMax) return 'var(--lcars-sunflower)';
  if (w <= highMax)     return 'var(--lcars-butterscotch)';
  return 'var(--lcars-tomato)';
}
```

The Geordi spec's 5-tier map (§2.1) has 5 tiers; I'm proposing 4 config boundaries with the 5th (critical/tomato) being anything above `highMax`. Geordi's gray/off tier at 0W is not configurable — it's always zero.

**Worf note**: Thresholds come from the YAML config object (validated by `setConfig()`), not from entity attributes. No injection vector.

### Q4: ESPHome-Flashed Vue Detection?

**Not in v4.15.0 scope.** The panel should work identically with cloud-API Vue and ESPHome-reflashed Vue — both expose the same `sensor.*_power_minute_average` entity pattern. The entity IDs might differ, but `device_class: power` is the same.

**Future enhancement (v4.16.0+)**: If we want a "local" badge, we could check the device's `config_entries` for an entry matching the `esphome` integration. A small `LOCAL` badge in the circuit tile would be a nice touch.

```js
// Future: detect ESPHome vs cloud
const isLocal = device.config_entries?.some(entry => {
  const configEntry = hass.config.config_entries?.[entry];
  return configEntry?.domain === 'esphome';
});
```

---
