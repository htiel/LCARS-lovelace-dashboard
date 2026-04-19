## Appendix C: Stardate Generator

LCARS displays commonly show stardates. The header uses a simple TNG-era stardate approximation:

```javascript
/**
 * Generate a TNG-era stardate from the current date.
 * Approximation: year 2323 → stardate 0, each year = 1000 units.
 * This matches the commonly accepted fan calculation.
 */
function getStardate() {
  const now = new Date();
  const year = now.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year + 1, 0, 1);
  const dayFraction = (now - startOfYear) / (endOfYear - startOfYear);
  const stardate = ((year - 2323) * 1000 + dayFraction * 1000).toFixed(2);
  return stardate;
}
```

---
