## 4. Performance Engineering — Sparkline Batching

### 4.1 The Scale Problem

Admiral's "Main Panel" area has 43 Emporia circuits. Eric's has 58. Each circuit has a `*_power_minute_average` entity that needs a 24h sparkline. The existing `fetchSparklineData()` caps at 10 entities per call.

### 4.2 Batched Fetch Strategy

```js
_powerSparklineCache = new Map();
_sparklineLoadState = 'idle'; // 'idle' | 'loading' | 'loaded' | 'error'

async _fetchPowerSparklines(entityIds) {
  if (this._sparklineLoadState === 'loading') return null;
  this._sparklineLoadState = 'loading';

  const BATCH_SIZE = 20; // Reconciled: spec said 50, original code said 10, Data recommended 20
  const STAGGER_MS = 100;
  const allData = {};

  try {
    for (let i = 0; i < entityIds.length; i += BATCH_SIZE) {
      const batch = entityIds.slice(i, i + BATCH_SIZE);
      const cacheKey = `power-batch-${i}`;
      const data = await fetchSparklineData(
        this._hass, cacheKey, batch, this._powerSparklineCache,
        { maxEntities: BATCH_SIZE, ttlMs: 300000 }
      );
      if (data) Object.assign(allData, data);

      // Stagger between batches to avoid WS congestion
      if (i + BATCH_SIZE < entityIds.length) {
        await new Promise(resolve => setTimeout(resolve, STAGGER_MS));
      }
    }

    this._sparklineLoadState = 'loaded';
    return allData;
  } catch (err) {
    this._sparklineLoadState = 'error';
    return null;
  }
}
```

### 4.3 Viewport-Aware Loading

For areas with 40+ circuits, we don't fetch sparklines for tiles that are below the fold (collapsed section). Only fetch when:

1. Initial render: fetch sparklines for visible circuits only (first 20 in collapsed view)
2. "SHOW ALL" expand: trigger fetch for remaining circuits
3. Scroll: if we adopt scroll-driven animations, tie sparkline fetch to IntersectionObserver

```js
_visibleCircuitIds = new Set();

_setupSparklineObserver() {
  if (this._sparklineObserver) return;

  this._sparklineObserver = new IntersectionObserver((entries) => {
    let newVisible = false;
    for (const entry of entries) {
      const entityId = entry.target.dataset.sparklineEntity;
      if (!entityId) continue;
      if (entry.isIntersecting && !this._visibleCircuitIds.has(entityId)) {
        this._visibleCircuitIds.add(entityId);
        newVisible = true;
      }
    }
    if (newVisible) this._fetchVisibleSparklines();
  }, { rootMargin: '100px' });
}

async _fetchVisibleSparklines() {
  const unfetched = [...this._visibleCircuitIds].filter(
    id => !this._powerSparklineCache.has(id)
  );
  if (unfetched.length === 0) return;
  const data = await this._fetchPowerSparklines(unfetched);
  if (data) this.requestUpdate();
}
```

### 4.4 Render Optimization — Power State Hash

```js
_powerStateHash = '';

_shouldUpdatePowerPanel(newGroups) {
  let hash = '';
  for (const group of newGroups) {
    for (const entry of group.entries) {
      hash += `${entry.entity.entity_id}:${entry.state?.state}|`;
    }
  }
  if (hash === this._powerStateHash) return false;
  this._powerStateHash = hash;
  return true;
}
```

This prevents re-rendering the entire 43-tile grid when an unrelated entity updates.

---
