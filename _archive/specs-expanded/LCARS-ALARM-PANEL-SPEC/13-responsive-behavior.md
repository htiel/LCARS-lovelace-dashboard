## 12. Responsive Behavior

### Desktop (≥768px) — Full 2-Column Layout

The spec layouts above. Shield viewscreen right, sensors left, keypad full-width below.

### Mobile (<768px) — Stacked Layout

```css
@media (max-width: 767px) {
  .lcars-alarm-panel {
    grid-template-columns: 1fr;
    grid-template-areas:
      "header"
      "media"
      "sensors"
      "keypad";
  }

  .alarm-viewscreen {
    aspect-ratio: auto;
    max-width: 14rem;
    margin: 0 auto;
  }

  .alarm-sensors {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .alarm-zone-line {
    flex: 1 1 45%;
    min-width: 8rem;
  }

  .alarm-keypad {
    flex-direction: column;
    align-items: center;
    gap: var(--lcars-gap);
  }

  .alarm-keypad-side {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--lcars-gap);
    width: 100%;
  }

  .alarm-mode-strip {
    justify-content: center;
  }
}
```

On mobile, the shield viewscreen moves to center-top for immediate visual threat assessment. Zone sensors flow as wrapped pairs. The keypad stacks below with action buttons going horizontal. Visual priority: threat level → zone status → keypad entry.

### Compact Mode

For dashboard views with limited space — shows shield and mode strip only, no zones or keypad:

```css
.lcars-alarm-panel.compact {
  grid-template-columns: 1fr;
  grid-template-areas:
    "header"
    "media";
}

.lcars-alarm-panel.compact .alarm-sensors,
.lcars-alarm-panel.compact .alarm-keypad {
  display: none;
}

.lcars-alarm-panel.compact .alarm-viewscreen {
  aspect-ratio: auto;
  max-width: 10rem;
  margin: 0 auto;
}
```

---
