## 16. Single-Body Adaptation

Some ScreenLogic configurations have only a pool (no spa) or only a spa (no pool). The panel must adapt.

### Pool-Only Mode

```css
.lcars-pool-spa-panel.pool-only .pool-aquatics {
  justify-content: center;
}

.lcars-pool-spa-panel.pool-only .pool-body-viewscreen {
  max-width: 20rem;
}
```

The single viewscreen centers in the aquatics area and gets slightly wider. The controls column remains — it still has pump switches and environmental data.

### Detection Logic

```javascript
/**
 * Determine panel mode based on available climate entities.
 */
function getPanelMode(classifiedEntities) {
  const hasPool = classifiedEntities.pool != null;
  const hasSpa = classifiedEntities.spa != null;
  if (hasPool && hasSpa) return 'dual';
  if (hasPool) return 'pool-only';
  if (hasSpa) return 'spa-only';
  return 'no-climate'; // Shouldn't happen, but defensive
}
```

---
