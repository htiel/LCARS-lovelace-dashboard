## 6. Responsive Behavior

### Desktop (≥768px) — Full 2-Column Layout

The spec above. Media right, sensors left, controls bottom.

### Mobile (<768px) — Stacked Layout

```css
@media (max-width: 767px) {
  .lcars-device-panel {
    grid-template-columns: 1fr;
    grid-template-areas:
      "header"
      "media"
      "sensors"
      "controls";
  }
  
  .device-panel-sensors {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .device-sensor-line {
    flex: 1 1 45%;
    min-width: 8rem;
  }
}
```

On mobile, the media frame goes full-width above the sensors (which flow horizontally in pairs). Controls remain full-width below. This maintains the reading order: context → visual → status → actions.

### Multiple Cameras Stacking

When an area has multiple camera devices, they stack vertically in a column layout:

```css
.device-panels-column {
  display: flex;
  flex-direction: column;
  gap: calc(var(--lcars-gap) * 4);     /* 1rem between panels — generous breathing room */
  align-items: flex-end;               /* Right-justify the stack */
}

/* Each panel in the stack */
.device-panels-column > .lcars-device-panel {
  width: 100%;
  max-width: 60rem;                    /* Cap width so panels don't stretch absurdly */
}
```

---
