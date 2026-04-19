## 6. Sort Order Recommendation

For the circuit tile grid, I recommend **power draw descending** as the default sort:

```js
_sortCircuits(circuits) {
  return [...circuits].sort((a, b) => {
    const wA = this._getPrimaryPower(a) || 0;
    const wB = this._getPrimaryPower(b) || 0;
    // Descending by power, then alphabetical for ties
    if (wB !== wA) return wB - wA;
    const nA = (a.device.name || '').toLowerCase();
    const nB = (b.device.name || '').toLowerCase();
    return nA.localeCompare(nB);
  });
}
```

**Why descending power**: The most interesting circuits are the active ones drawing the most power. "HVAC 2400W" at position 1 tells the operator more than "Bathroom Exhaust 0W". Idle circuits naturally cluster at the bottom, where the collapsed-section gradient mask hides them anyway.

This is also how the TNG Engineering display works — the highest-draw systems (warp engines, shields, life support) are always at the top of the EPS allocation chart.

---
