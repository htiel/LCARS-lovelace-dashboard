## 11. Accessibility

### ARIA Structure

```html
<div class="lcars-sensors-grid"
     role="region"
     aria-label="Internal environmental sensors — ${onlineCount} rooms monitored">

  <div class="sensors-header" role="heading" aria-level="3">
    ...
  </div>

  <div class="sensors-body" role="list"
       aria-label="Room environmental readings grouped by floor">

    <div class="sensors-floor-group" role="group"
         aria-label="Upstairs — ${count} rooms">
      <div class="sensors-floor-label" role="heading" aria-level="4">
        DECK 2 — UPSTAIRS
      </div>
      <div class="sensors-tile-grid" role="list">
        <!-- tiles with role="listitem" -->
      </div>
    </div>
    ...
  </div>

  <div class="sensors-summary" role="status" aria-live="polite">
    ...
  </div>
</div>
```

### Keyboard Navigation

| Key         | Action                                                     |
|-------------|------------------------------------------------------------|
| `Tab`       | Move focus between tiles (standard tab order)              |
| `Enter`     | Open HA more-info dialog for the focused tile's device     |
| `Escape`    | Close any open more-info dialog                            |

### Screen Reader Announcements

- Each tile has `aria-label="${areaName}: ${temp} degrees, ${humidity} percent humidity"`
- Low battery tiles append `. Low battery: ${level} percent`
- Unavailable tiles announce `${areaName}: sensor offline`
- Summary row uses `aria-live="polite"` — updates announced when averages change

### Color + Text Dual Encoding

Per WCAG 1.4.1, color is never the sole indicator:
- Temperature color is **always paired with the numeric value**
- Humidity color is **always paired with the percentage**
- Battery alert is a **colored dot + pulse animation** (and announced via aria-label)
- Unavailable state uses **gray + "OFFLINE" text overlay**

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .sensor-tile,
  .tile-temp,
  .tile-humidity {
    transition: none !important;
  }

  .tile-battery-badge {
    animation: none !important;
    opacity: 1;
  }
}
```

### Touch Target Compliance

Per WCAG 2.5.8, all interactive elements must be ≥ 24×24px:
- Tiles: minimum `7.5rem × 3rem` (120×48px) — well above threshold
- Mobile row tiles: minimum `100% × 3rem` (48px height) — compliant

---
