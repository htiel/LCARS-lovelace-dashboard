## 9. Responsive Behavior

### Desktop (≥768px) — Full 2-Column Layout

The spec above. Schedule left, zone grid right, standby full-width below.

### Mobile (<768px) — Stacked Layout

```css
@media (max-width: 767px) {
  .lcars-irrigation-panel {
    grid-template-columns: 1fr;
    grid-template-areas:
      "header"
      "schedule"
      "zones"
      "standby";
  }

  .irrigation-schedule {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .irrigation-schedule .device-sensor-line {
    flex: 1 1 45%;
    min-width: 8rem;
  }
}
```

On mobile, schedule info moves above zones. Zone grid fills the full width. Reading priority: status → schedule → zones → standby.

---
