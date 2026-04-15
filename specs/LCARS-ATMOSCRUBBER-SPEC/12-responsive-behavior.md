## 11. Responsive Behavior

### Desktop (≥768px) — Full 3-Column (or 2-Column Sensor-Only)

The spec above.

### Mobile (<768px) — Stacked Layout

```css
@media (max-width: 767px) {
  .lcars-atmoscrubber-panel {
    grid-template-columns: 1fr;
    grid-template-areas:
      "header"
      "core"
      "sensors"
      "controls"
      "sparklines";
  }

  .lcars-atmoscrubber-panel.sensor-only {
    grid-template-areas:
      "header"
      "core"
      "sensors"
      "sparklines";
  }

  .atmos-cylinder {
    width: 3rem;
    max-height: 8rem;
    margin: 0 auto;
  }

  .atmos-sensors {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .device-sensor-line {
    flex: 1 1 45%;
    min-width: 8rem;
  }

  .atmos-sparklines {
    flex-direction: column;
    gap: var(--lcars-gap);
  }

  .atmos-sparkline-cell {
    min-width: 100%;
  }
}
```

On mobile, the cylinder moves to the top (below header) for immediate visual status, then sensors flow as wrapped pairs, controls stack, and sparklines go full-width vertical. This maintains the reading priority: status → data → actions → history.

---
