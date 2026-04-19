## 8. Panel Header

### Structure

```html
<div class="sensors-header" role="heading" aria-level="3">
  <span class="sensors-header-title">INTERNAL SENSORS</span>
  <span class="sensors-header-line" aria-hidden="true"></span>
  <span class="sensors-header-stardate">${stardate}</span>
</div>
```

### CSS

```css
.sensors-header {
  grid-area: header;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  min-height: var(--lcars-bar-height);
  border-bottom: 2px solid var(--grid-frame-color);
}

.sensors-header-title {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-sub);       /* 1.25rem — standardized */
  color: var(--lcars-sunflower);
  text-transform: uppercase;
  white-space: nowrap;
  letter-spacing: 0.05em;
}

/* Flexible line separator — fills remaining space */
.sensors-header-line {
  flex: 1;
  height: 2px;
  background: var(--grid-frame-color);
  min-width: 1rem;
}

.sensors-header-stardate {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);       /* 0.875rem — standardized */
  color: var(--lcars-ice);
  text-transform: uppercase;
  white-space: nowrap;
}
```

---
