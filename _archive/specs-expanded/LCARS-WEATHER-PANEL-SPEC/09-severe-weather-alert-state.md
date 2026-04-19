## 8. Severe Weather Alert State

When the weather condition is `exceptional` or when lightning is detected nearby, the panel enters an elevated alert state.

### Exceptional Condition

```css
.lcars-weather-panel.severe {
  --panel-frame-color: var(--lcars-tomato);
  --weather-condition-color: var(--lcars-tomato);
  animation: weather-severe-pulse 2s ease-in-out infinite;
}

@keyframes weather-severe-pulse {
  0%, 100% { border-color: var(--lcars-tomato); }
  50%      { border-color: rgba(255, 85, 85, 0.5); }
}
```

### Lightning Proximity Alert

When lightning strikes are detected within a threshold distance (configurable, default 10 mi), the lightning telemetry in the sensor column pulses:

```css
.weather-lightning-active .sensor-indicator {
  background: var(--lcars-gold);
  animation: lightning-flash 0.8s ease-out;
}

@keyframes lightning-flash {
  0%   { opacity: 1; filter: brightness(2); }
  50%  { opacity: 0.5; }
  100% { opacity: 1; filter: brightness(1); }
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .lcars-weather-panel.severe,
  .weather-lightning-active .sensor-indicator {
    animation: none !important;
  }

  .lcars-weather-panel.severe {
    border-color: var(--lcars-tomato);
    border-width: 3px;
  }

  .weather-lightning-active .sensor-indicator {
    /* Static enlarged dot as alternative */
    width: 10px;
    height: 10px;
  }
}
```

---
