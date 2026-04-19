## 12. Responsive Behavior

### Desktop (≥768px) — Full 2-Column Layout

The spec above. Media right, sensors left, mode strip and aux controls full-width below.

### Mobile (<768px) — Stacked Layout

```css
@media (max-width: 767px) {
  .lcars-climate-panel {
    grid-template-columns: 1fr;
    grid-template-areas:
      "header"
      "media"
      "sensors"
      "modes"
      "auxctrl";
  }

  .climate-media {
    aspect-ratio: auto;
    max-width: 16rem;
    margin: 0 auto;
  }

  .climate-sensors {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .device-sensor-line {
    flex: 1 1 45%;
    min-width: 8rem;
  }

  .climate-mode-strip {
    justify-content: center;
  }

  .climate-aux-controls {
    flex-direction: column;
    gap: var(--lcars-gap);
  }

  .climate-aux-group {
    flex-direction: column;
    align-items: flex-start;
  }
}
```

On mobile, the temperature viewscreen moves to center-top for immediate visual status, sensors flow as wrapped pairs, and controls stack vertically. Reading priority: status → data → mode → controls.

### Compact Mode

For dashboard views with limited space, the panel can render in a compact 1-column strip:

```css
.lcars-climate-panel.compact {
  grid-template-columns: 1fr;
  grid-template-areas:
    "header"
    "media"
    "modes";

  /* Hide sensors and aux controls in compact mode */
}

.lcars-climate-panel.compact .climate-sensors,
.lcars-climate-panel.compact .climate-aux-controls {
  display: none;
}

.lcars-climate-panel.compact .climate-media {
  aspect-ratio: auto;
  max-width: 10rem;
  margin: 0 auto;
}
```

---
