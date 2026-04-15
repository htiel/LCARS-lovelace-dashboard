## 8. Sparkline Placement Strategy

### 8.1 Problem

The current per-device panels show a sparkline for each circuit. With 8 separate panels × 1 sparkline each, that's already expensive. In a consolidated panel with 40+ circuits, that's 40+ sparkline history fetches and SVG renders — a performance concern.

### 8.2 Recommendation: Sparklines in Popover Only

**Remove sparklines from circuit tiles in the consolidated grid.** Instead:

1. **Circuit tiles**: Show only the numeric watts + energy. Compact, scannable, space-efficient.
2. **Popover detail** (on click): Shows the sparkline for that specific circuit. This is lazy — only fetched when the user taps a circuit.
3. **Power Arc** (in summary): Provides the at-a-glance distribution visualization for the whole panel.

**Rationale**:
- The Admiral's primary complaint is wasted vertical space. Sparklines inside tiles add ~20px height per tile and require a wider `minmax` — directly contradicting the consolidation goal.
- The popover already exists and already shows sparklines (per Wesley Addendum §2.1).
- Performance: Fetching 40+ `history/period` API calls on render is expensive. Lazy fetch on popover open is much cheaper.
- The power arc serves the "at-a-glance trend" role that per-tile sparklines were filling.

### 8.3 Optional: Summary Sparkline

If the Admiral wants one "area-wide" trend line, a single sparkline for the highest-wattage device could appear in the summary section:

```js
// Optional: Show a single sparkline for the area's primary power sensor
${primaryPowerEntityId ? html`
  <div class="power-summary-sparkline">
    ${renderSparkline(this._sparklineCache?.get(primaryPowerEntityId), {
      color: panelColor, width: '100%', height: 32, className: 'power-area-sparkline'
    })}
    <span class="power-sparkline-label">24H TOTAL DRAW</span>
  </div>
` : ''}
```

This is **one** API call, **one** SVG — acceptable cost.

---
