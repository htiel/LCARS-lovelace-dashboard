## 17. Sparkline History Integration

### Data Flow

1. On first load and every 15 minutes, fetch 24h history for each temperature entity
2. Store as `Map<entityId, number[]>` in `_historyData`
3. Pass to tile template for SVG rendering
4. Sparkline color matches the **current** temperature color (not historical)

### Update Cadence

```javascript
/**
 * Schedule periodic history refresh.
 * 15-minute interval matches the sparkline resolution.
 */
connectedCallback() {
  super.connectedCallback();
  this._refreshHistory();
  this._historyInterval = setInterval(() => this._refreshHistory(), 15 * 60 * 1000);
}

disconnectedCallback() {
  super.disconnectedCallback();
  if (this._historyInterval) {
    clearInterval(this._historyInterval);
    this._historyInterval = null;
  }
}

async _refreshHistory() {
  if (!this.hass || !this._sensorGroups) return;
  const newHistory = new Map();
  // Fetch in parallel — max 14 concurrent (one per room meter)
  const fetches = this._sensorGroups.map(async (group) => {
    const data = await fetchSensorHistory(this.hass, group.temperatureEntityId);
    newHistory.set(group.temperatureEntityId, data);
  });
  await Promise.all(fetches);
  this._historyData = newHistory;
}
```

### Sparkline Dimensions

- **SVG viewBox**: `0 0 100 16`
- **Rendered height**: `1rem` (16px) within the tile
- **Data points**: ~96 (1 per 15 minutes over 24 hours)
- **Stroke**: 1.5px, non-scaling, rounded caps
- **Fill area**: 6% opacity under the line

---
