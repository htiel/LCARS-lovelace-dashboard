## 10. Animation

### v4.13.0 Visual Enhancements

#### Zone Fill Bar Water Flow
Active zone fill bar gets diagonal barberpole stripes scrolling left→right, simulating water flowing through the pipe. Fluid flow indicators on TNG Engineering show animated stripe patterns within conduit visualizations — deuterium flowing to the warp core. (Source: Bracer Jack — animation should be simple and snappy; the repeating gradient is a single GPU-composited element.)

```css
.lcars-zone-fillbar .fill {
  height: 100%;
  border-radius: 0 1.5rem 1.5rem 0;
  background: var(--lcars-ice);
  transition: width 1s linear;
}

.lcars-zone-fillbar.active .fill {
  background:
    repeating-linear-gradient(
      -45deg,
      var(--lcars-ice) 0px,
      var(--lcars-ice) 4px,
      rgba(153, 204, 255, 0.5) 4px,
      rgba(153, 204, 255, 0.5) 8px
    );
  background-size: 11.31px 100%; /* 8px × √2 for seamless diagonal tile */
  animation: lcars-flow 0.6s linear infinite;
}

@keyframes lcars-flow {
  from { background-position: 0 0; }
  to   { background-position: 11.31px 0; }
}
```

`11.31px` = one full diagonal stripe period (8px × √2 ≈ 11.31). Scrolling by exactly one period ensures a seamless loop. The pill-shaped rounded end follows canonical LCARS button/bar termination.

#### Zone Completion Flash
When a zone finishes its cycle, the row briefly flashes green-to-dark — visual confirmation that the task completed. Transporter cycle completion, replicator materialization: LCARS always produces a confirmation flash. (Source: Bracer Jack Manifesto §5 — don't add decorative elements that interfere with function; this is a 2s single-fire confirmation, not a loop.)

```css
.lcars-zone-row.completing {
  animation: lcars-zone-complete 2s ease-out forwards;
}

@keyframes lcars-zone-complete {
  0% {
    border-left: 3px solid var(--lcars-ice);
    background: rgba(153, 204, 255, 0.12);
  }
  30% {
    border-left: 3px solid var(--lcars-ice);
    background: rgba(153, 204, 255, 0.06);
  }
  100% {
    border-left: 3px solid transparent;
    background: transparent;
  }
}
```

JS adds `.completing` when zone state transitions from `watering` → `idle`, and removes the class after the animation ends via `animationend` event. Single fire, no loop.

#### Schedule Countdown Proximity Glow
"NEXT RUN" text shadow intensifies as the scheduled run approaches (within 1 hour). Mission countdown displays on TNG show increasing visual urgency as the event nears. (Source: TheLCARS.com — glow halos are permitted for emphasis; Bracer Jack — color carries meaning.)

```css
.lcars-schedule-next {
  color: var(--lcars-sunflower);
  text-transform: uppercase;
  font-family: var(--lcars-font, 'Antonio', sans-serif);
  /* --schedule-proximity: 0.0 (>1hr away) to 1.0 (imminent), set by JS */
  text-shadow:
    0 0 calc(var(--schedule-proximity, 0) * 8px)
    var(--lcars-ice);
  transition: text-shadow 10s ease-out; /* smooth between minutely JS updates */
}

/* ── T-0 ignition flash ── */
.lcars-schedule-next.go {
  animation: lcars-schedule-go 500ms ease-out;
}

@keyframes lcars-schedule-go {
  0%   { text-shadow: 0 0 16px var(--lcars-space-white); color: var(--lcars-space-white); }
  100% { text-shadow: 0 0 4px var(--lcars-ice); color: var(--lcars-sunflower); }
}
```

JS calculates `--schedule-proximity` as `Math.max(0, 1 - (minutesUntilRun / 60))` and updates every 60 seconds.

#### Rain Delay Cloud Badge
Pill badge with ☁ glyph, gently bobbing ±1px on a 3s cycle. The rain delay is a weather-intelligence override; it deserves its own status badge. (Source: TheLCARS.com — pill/capsule shape with one flat side; Bracer Jack — empty space is beautiful, so the badge only appears when rain delay > 0.)

```css
.lcars-rain-delay-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.75rem 0.25rem 0.5rem;
  border-radius: 0 var(--lcars-btn-radius, 1.5rem) var(--lcars-btn-radius, 1.5rem) 0;
  background: var(--lcars-ice);
  color: var(--lcars-bg, #000);
  font-family: var(--lcars-font, 'Antonio', sans-serif);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  line-height: 1;
  animation: lcars-cloud-bob 3s ease-in-out infinite;
  filter: drop-shadow(0 1px 3px rgba(153, 204, 255, 0.3));
}

.lcars-rain-delay-badge .cloud-glyph {
  font-size: 0.875rem;
}

@keyframes lcars-cloud-bob {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-1px); }
}
```

The badge uses the standard LCARS pill shape — flat left, rounded right. Only rendered when `rain_delay > 0`.

#### Irrigation Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  /* Ambient: disable barberpole flow, cloud bob */
  .lcars-zone-fillbar.active .fill {
    animation: none;
    /* Static striped texture still visible — just doesn't scroll */
  }
  .lcars-rain-delay-badge {
    animation: none;
  }

  /* State transitions: instant */
  .lcars-schedule-next {
    transition-duration: 0ms;
  }

  /* Confirmations: halved, still plays */
  .lcars-zone-row.completing {
    animation-duration: 1s;
  }
  .lcars-schedule-next.go {
    animation-duration: 250ms;
  }
}
```

### Fill Bar (Active Watering)

The fill bar animates smoothly as the zone countdown progresses:

```css
.irrigation-zone-fill {
  transition: width 1s linear;
}
```

Updated every second via a `setInterval` timer when a zone is active. The 1s linear transition prevents jumpy visual updates.

### Zone Row State Transition

When a zone starts or stops watering, the row transitions its status color:

```css
.irrigation-zone-status {
  transition: color var(--lcars-transition-slow);
}
```

### Panel Cascade Entry

```css
.lcars-irrigation-panel {
  animation: lcars-cascade-in 300ms ease-out both;
}
```

### Attribute Expand/Collapse

```css
.irrigation-zone-attrs {
  transition: max-height 300ms ease-out, padding 300ms ease-out;
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .lcars-irrigation-panel,
  .irrigation-zone-fill,
  .irrigation-zone-status,
  .irrigation-zone-attrs {
    animation: none !important;
    transition: none !important;
  }
}
```

---
