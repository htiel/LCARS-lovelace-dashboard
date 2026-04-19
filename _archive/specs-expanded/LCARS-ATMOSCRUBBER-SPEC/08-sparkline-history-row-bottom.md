## 7. Sparkline History Row (Bottom)

24-hour trend sparklines for key air quality metrics. Small SVG traces — think the ambient data readouts scrolling across the bottom of TNG Engineering displays.

### Layout

```css
.atmos-sparklines {
  grid-area: sparklines;
  display: flex;
  gap: calc(var(--lcars-gap) * 2);
  padding-top: var(--lcars-gap);
  border-top: 2px solid var(--panel-frame-color);
  overflow-x: auto;
  /* Horizontal scroll for narrow viewports */
  -webkit-overflow-scrolling: touch;
}

.atmos-sparkline-cell {
  flex: 1;
  min-width: 6rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.atmos-sparkline-label {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-disabled);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}
```

### SVG Sparkline

```css
.atmos-sparkline-svg {
  width: 100%;
  height: 2rem;
  display: block;
}

.atmos-sparkline-path {
  fill: none;
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  vector-effect: non-scaling-stroke;
  /* Stroke color set per-trace */
}

/* Subtle fill area under the line */
.atmos-sparkline-area {
  opacity: 0.08;
  /* Fill color matches stroke */
}
```

### Trace Configuration

| Sparkline | Stroke Color                    | Priority | Shown When               |
|-----------|---------------------------------|----------|--------------------------|
| PM2.5     | `var(--atmos-quality-color)`    | 1        | Always (primary metric)  |
| AQI       | `var(--lcars-sunflower)`        | 2        | When AQI entity exists   |
| CO₂       | `var(--lcars-data-accent)`      | 3        | When CO₂ entity exists   |
| VOC       | `var(--lcars-african-violet)`   | 4        | When VOC entity exists   |

**Maximum 4 sparklines**. If fewer sensors exist, the remaining sparklines stretch wider (flex layout handles this). PM2.5 is always first. Each sparkline shows 24h of data with 1-point-per-15-minutes resolution (96 data points).

### SVG Generation (JS)

```javascript
/**
 * Generate an SVG sparkline path from an array of numeric values.
 * Returns the 'd' attribute string for an SVG <path>.
 * @param {number[]} values - Array of data points
 * @param {number} width - SVG viewBox width
 * @param {number} height - SVG viewBox height
 */
function sparklinePath(values, width = 100, height = 24) {
  if (!values || values.length < 2) return '';
  const filtered = values.filter(v => v != null && !isNaN(v));
  if (filtered.length < 2) return '';

  const min = Math.min(...filtered);
  const max = Math.max(...filtered);
  const range = max - min || 1;
  const step = width / (filtered.length - 1);

  return filtered.map((v, i) => {
    const x = (i * step).toFixed(1);
    const y = (height - ((v - min) / range) * (height - 2) - 1).toFixed(1);
    return `${i === 0 ? 'M' : 'L'}${x},${y}`;
  }).join(' ');
}

/**
 * Generate the closed area path (for the subtle fill under the line).
 */
function sparklineAreaPath(values, width = 100, height = 24) {
  const linePath = sparklinePath(values, width, height);
  if (!linePath) return '';
  const step = width / (values.filter(v => v != null && !isNaN(v)).length - 1);
  const lastX = ((values.filter(v => v != null && !isNaN(v)).length - 1) * step).toFixed(1);
  return `${linePath} L${lastX},${height} L0,${height} Z`;
}
```

### SVG Template

```html
<svg class="atmos-sparkline-svg"
     viewBox="0 0 100 24"
     preserveAspectRatio="none"
     role="img"
     aria-label="PM2.5 trend: last 24 hours, current ${currentValue} µg/m³">
  <path class="atmos-sparkline-area"
        d="${areaPath}"
        fill="${traceColor}" />
  <path class="atmos-sparkline-path"
        d="${linePath}"
        stroke="${traceColor}" />
</svg>
```

Each sparkline has an `aria-label` describing the metric, time range, and current value — screen reader accessible (WCAG 4.1.2) without needing to see the visual.

---
