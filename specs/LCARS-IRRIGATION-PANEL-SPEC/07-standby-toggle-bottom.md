## 6. Standby Toggle (Bottom)

The standby button puts the Rachio controller into standby mode — all schedules paused, no watering. This is a full-width control at the bottom of the panel.

### Structure

```html
<div class="irrigation-standby-strip">
  <button class="irrigation-standby-btn ${isStandby ? 'active' : ''}"
          role="switch"
          aria-checked="${isStandby}"
          aria-label="Standby mode: ${isStandby ? 'on' : 'off'}"
          @click="${() => toggleStandby()}">
    STANDBY
  </button>
</div>
```

### CSS

```css
.irrigation-standby-strip {
  grid-area: standby;
  display: flex;
  align-items: center;
  padding: 0.25rem 0;
  border-top: 1px solid var(--lcars-disabled);
}

.irrigation-standby-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 6rem;
  height: var(--lcars-bar-h);   /* 3rem = 48px */
  padding: 0 1rem;

  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  font-weight: 700;
  text-transform: uppercase;

  background: var(--lcars-gray);
  color: var(--lcars-space-white);
  border: none;
  border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
  cursor: pointer;
  transition: background var(--lcars-transition), color var(--lcars-transition);
}

.irrigation-standby-btn.active {
  background: var(--lcars-gold);
  color: var(--lcars-black);
}

.irrigation-standby-btn:hover {
  filter: brightness(1.15);
}
```

---
