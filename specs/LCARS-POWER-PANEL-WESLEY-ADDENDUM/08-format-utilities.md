## 7. Format Utilities

```js
_formatWatts(watts) {
  if (watts == null) return '—';
  const w = Number(watts);
  if (!Number.isFinite(w)) return '—';
  if (Math.abs(w) >= 10000) return `${(w / 1000).toFixed(1)} kW`;
  return `${Math.round(w)} W`;
}

_formatEnergy(kwh) {
  if (kwh == null) return '—';
  const v = Number(kwh);
  if (!Number.isFinite(v)) return '—';
  return `${v.toFixed(1)} kWh`;
}
```

---
