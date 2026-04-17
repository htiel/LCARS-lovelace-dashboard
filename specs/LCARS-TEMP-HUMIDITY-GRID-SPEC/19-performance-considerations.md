## 18. Performance Considerations

### Rendering Optimization

- **Tile count**: Maximum ~14 room meters in the Admiral's setup. No virtualization needed.
- **History fetches**: Parallelized with `Promise.all()`, 15-minute refresh interval.
- **SVG sparklines**: Pure SVG path strings — no canvas, no third-party charting library.
- **Lit-element**: Only re-renders tiles whose entity state actually changed (Lit diffing).
- **Entity subscriptions**: Uses `hass` property setter — standard HA reactive update pattern.

### Memory

- History data: ~96 floats × 14 entities = ~5KB. Negligible.
- SVG paths are generated on render — not stored.

---
