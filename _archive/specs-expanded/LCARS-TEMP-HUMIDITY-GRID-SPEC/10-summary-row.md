## 9. Summary Row

### Structure

```html
<div class="sensors-summary" role="status" aria-live="polite">
  <span class="summary-label">SHIP AVG</span>
  <span class="summary-temp" style="color: ${avgTempColor}">
    ${avgTemp}°${unit}
  </span>
  <span class="summary-humidity" style="color: ${avgHumidityColor}">
    ${avgHumidity}%RH
  </span>
  <span class="summary-divider" aria-hidden="true">■</span>
  <span class="summary-online">
    ${onlineCount} SENSORS ONLINE
  </span>
  <span class="summary-low" style="color: ${lowBatteryCount > 0 ? 'var(--lcars-tomato)' : 'var(--lcars-ice)'}">
    ● ${lowBatteryCount} LOW
  </span>
</div>
```

### CSS

```css
.sensors-summary {
  grid-area: summary;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.375rem 0.75rem;
  border-top: 2px solid var(--grid-frame-color);
  flex-wrap: wrap;
}

.summary-label {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-sunflower);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 700;
}

.summary-temp,
.summary-humidity {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-sub);       /* 1.25rem — standardized */
  text-transform: uppercase;
  font-weight: 700;
}

.summary-divider {
  color: var(--lcars-gray);
  font-size: 0.5rem;
}

.summary-online {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-ice);
  text-transform: uppercase;
}

.summary-low {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  text-transform: uppercase;
  margin-left: auto;                          /* Push to far right */
}

/* Mobile: wrap to 2 rows */
@media (max-width: 767px) {
  .sensors-summary {
    gap: 0.25rem 0.75rem;
  }
}
```

---
