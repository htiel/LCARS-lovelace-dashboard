## 8. Heating State Animations

### v4.13.0 Visual Enhancements

#### Water Body Caustic Shimmer
Multiple overlapping radial gradients drifting slowly over the pool/spa viewscreen, simulating light refracting through water. Cetacean Ops observation windows on the Enterprise-D show water with visible caustics through the viewport — the pool viewscreen is literally an observation window into a water body. (Source: TheLCARS.com — flat design; this is a background texture at 6% opacity, not a UI element. Source: Bracer Jack — animation should be simple.)

```css
.lcars-water-viewscreen {
  position: relative;
  overflow: hidden;
}

.lcars-water-viewscreen::after {
  content: "";
  position: absolute;
  inset: -50%; /* oversize for drift travel */
  width: 200%;
  height: 200%;
  background:
    radial-gradient(ellipse 40% 30% at 30% 40%, var(--lcars-ice) 0%, transparent 70%),
    radial-gradient(ellipse 35% 45% at 65% 55%, var(--lcars-ice) 0%, transparent 70%),
    radial-gradient(ellipse 50% 25% at 50% 30%, var(--lcars-ice) 0%, transparent 70%);
  opacity: 0.06;
  animation: lcars-caustic-drift 12s linear infinite;
  pointer-events: none;
  z-index: 1;
  mix-blend-mode: screen;
}

@keyframes lcars-caustic-drift {
  0%   { transform: translate(0%, 0%); }
  33%  { transform: translate(-5%, 3%); }
  66%  { transform: translate(3%, -4%); }
  100% { transform: translate(0%, 0%); }
}
```

Three radial gradients at 6% combined opacity. The oversized pseudo-element ensures no visible edge during drift. `mix-blend-mode: screen` ensures the caustics brighten rather than overlay opaquely. The 12s cycle is slow and methodical — System 47 tempo.

#### Heating Active Indicator
A 3px gradient bar below each water body viewscreen. When heating is on, warm colours flow left→right like energy through an EPS conduit. When off, the bar is a static dim gray line. (Source: TheLCARS.com — no gradient on buttons; this is a telemetry indicator, not a control.)

```css
.lcars-heat-status-bar {
  height: 3px;
  width: 100%;
  border-radius: 1.5px;
  background: var(--lcars-gray);
  opacity: 0.4;
  transition: opacity 300ms ease-out;
}

.lcars-heat-status-bar.heating {
  opacity: 1;
  background:
    linear-gradient(
      90deg,
      var(--lcars-tomato) 0%,
      var(--lcars-golden-orange) 25%,
      var(--lcars-butterscotch) 50%,
      var(--lcars-golden-orange) 75%,
      var(--lcars-tomato) 100%
    );
  background-size: 200% 100%;
  animation: lcars-heat-flow 2s linear infinite;
}

@keyframes lcars-heat-flow {
  from { background-position: 0% 0%; }
  to   { background-position: 200% 0%; }
}
```

The gradient cycles through the warm hue family (tomato → golden-orange → butterscotch → back). `background-size: 200%` creates a seamless tile that scrolls via `background-position`. Idle state is a dim gray hairline — the conduit is present but unpowered.

#### Chemistry Sensor Alert Thresholds
Chemistry readouts (pH, ORP, Salt, Saturation) as pill badges color-coded by threshold: in-range = `--lcars-ice`, borderline = `--lcars-golden-orange`, out-of-range = `--lcars-tomato` with a gentle pulse. (Source: TheLCARS.com — pill badge vocabulary. Source: WCAG 1.4.11 — 3:1 non-text contrast for threshold colors against black.)

```css
.lcars-chemistry-sensor {
  display: inline-flex;
  align-items: center;
  border-radius: 0 var(--lcars-btn-radius, 1.5rem) var(--lcars-btn-radius, 1.5rem) 0;
  overflow: hidden;
  font-family: var(--lcars-font, 'Antonio', sans-serif);
  text-transform: uppercase;
  font-size: 0.75rem;
  line-height: 1;
}

.lcars-chemistry-sensor .pill-label {
  padding: 0.25rem 0.5rem;
  background: var(--chem-threshold-color, var(--lcars-ice));
  color: var(--lcars-bg, #000);
  font-weight: 700;
  transition: background-color 500ms ease-out;
}

.lcars-chemistry-sensor .pill-value {
  padding: 0.25rem 0.625rem;
  background: rgba(255, 255, 255, 0.08);
  color: var(--lcars-space-white);
  transition: background-color 300ms ease-out;
}

/* ── Threshold states (set via JS attribute) ── */
.lcars-chemistry-sensor[data-threshold="ok"] {
  --chem-threshold-color: var(--lcars-ice);
}
.lcars-chemistry-sensor[data-threshold="warn"] {
  --chem-threshold-color: var(--lcars-golden-orange);
}
.lcars-chemistry-sensor[data-threshold="critical"] {
  --chem-threshold-color: var(--lcars-tomato);
}

/* ── Critical pulse ── */
.lcars-chemistry-sensor[data-threshold="critical"] .pill-label {
  animation: lcars-chem-alert 1.5s ease-in-out infinite;
}

@keyframes lcars-chem-alert {
  0%, 100% { opacity: 0.8; }
  50%      { opacity: 1.0; }
}

/* ── Data update flash ── */
.lcars-chemistry-sensor.updated .pill-value {
  animation: lcars-pill-flash 300ms ease-out;
}

@keyframes lcars-pill-flash {
  from { background-color: var(--lcars-gold); }
  to   { background-color: rgba(255, 255, 255, 0.08); }
}
```

JS sets `data-threshold` based on configurable ranges per sensor (e.g., pH: ok=7.2–7.6, warn=7.0–7.2/7.6–7.8, critical=<7.0/>7.8). Color alone does not convey state; the text label persists for WCAG 1.4.1 (Use of Color).

#### IntelliBrite Colour Swatch Glow
Active lighting mode swatch gets a glow halo in its representative colour, plus a travelling indicator bar that slides between swatches on mode change. (Source: Bracer Jack — caps and buttons use color for state; active=glow.)

```css
.lcars-intellibrite-row {
  position: relative;
  display: flex;
  gap: var(--lcars-gap, 0.25rem);
  padding-bottom: 4px; /* room for indicator */
}

/* ── Travelling indicator bar ── */
.lcars-intellibrite-row::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: var(--indicator-left, 0px);
  width: var(--indicator-width, 2rem);
  height: 2px;
  background: var(--lcars-gold);
  border-radius: 1px;
  transition: left 300ms ease-out, width 300ms ease-out;
}

.lcars-intellibrite-swatch {
  width: 2rem;
  height: 1.5rem;
  border-radius: 0.25rem;
  border: 1px solid transparent;
  cursor: pointer;
  transition: box-shadow 200ms ease-out, border-color 200ms ease-out;
}

.lcars-intellibrite-swatch:hover {
  filter: brightness(1.2);
}

.lcars-intellibrite-swatch.active {
  border-color: var(--swatch-color, var(--lcars-gold));
  box-shadow: 0 0 8px 2px var(--swatch-color, var(--lcars-gold));
}
```

JS updates `--indicator-left` and `--indicator-width` based on `offsetLeft` and `offsetWidth` of the new active swatch. Target size is 32×24px — meets WCAG 2.5.8 minimum 24×24px.

#### Pump Status Running Indicator
Three dots chasing in a circle when pump is ON — conveying mechanical rotation at a glance. (Source: System 47 — animation tempo is slow and methodical.)

> **[Data C-4 / R-6] Animation budget cap**: Only the **primary pump** gets the
> spinner animation. Secondary pumps show a static lit-dot indicator when ON.
> Chemistry pulse fires only on the **worst-threshold** sensor, not all 4.
> Freeze pulse and heating border pulse are mutually exclusive.
> Worst-case concurrent: frame breathe + caustic + heat flow + 1 pump spinner + 1 chem pulse = **5** (within budget).

```css
.lcars-pump-spinner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  position: relative;
  margin-left: 0.375rem;
  vertical-align: middle;
}

.lcars-pump-spinner .dot {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--lcars-ice);
}

/* ── Position dots at 120° intervals on a 5px radius ── */
.lcars-pump-spinner .dot:nth-child(1) { top: 0;    left: 5px;  }
.lcars-pump-spinner .dot:nth-child(2) { bottom: 1px; left: 0;   }
.lcars-pump-spinner .dot:nth-child(3) { bottom: 1px; right: 0;  }

/* ── Static OFF state: dim ── */
.lcars-pump-toggle .lcars-pump-spinner .dot {
  opacity: 0.25;
}

/* ── Running ON state: animate ── */
.lcars-pump-toggle.on .lcars-pump-spinner {
  animation: lcars-pump-spin 1.2s linear infinite;
}

.lcars-pump-toggle.on .lcars-pump-spinner .dot:nth-child(1) { opacity: 1.0; }
.lcars-pump-toggle.on .lcars-pump-spinner .dot:nth-child(2) { opacity: 0.6; }
.lcars-pump-toggle.on .lcars-pump-spinner .dot:nth-child(3) { opacity: 0.3; }

@keyframes lcars-pump-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
```

Three-dot trailing-opacity pattern creates visual impression of a rotor with bright leading edge and dim tail. 1.2s cycle below seizure threshold (WCAG 2.3.1).

#### Pool/Spa Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  /* Ambient: disable caustic shimmer, pump spin, heat flow */
  .lcars-water-viewscreen::after {
    animation: none;
    opacity: 0.04; /* static subtle tint */
  }
  .lcars-heat-status-bar.heating {
    animation: none;
    /* Static warm bar — no flow, still colored */
  }
  .lcars-pump-toggle.on .lcars-pump-spinner {
    animation: none;
  }
  .lcars-chemistry-sensor[data-threshold="critical"] .pill-label {
    animation: none;
    opacity: 1;
  }

  /* State transitions: instant */
  .lcars-intellibrite-row::after {
    transition-duration: 0ms;
  }
  .lcars-intellibrite-swatch.active {
    transition-duration: 0ms;
  }
  .lcars-heat-status-bar {
    transition-duration: 0ms;
  }

  /* Confirmations: halved */
  .lcars-chemistry-sensor.updated .pill-value {
    animation-duration: 150ms;
  }
}
```

The water body viewscreens communicate heating state through subtle ambient animations on the frame border, matching the Climate Panel Spec §8 pattern.

### Heating Active — Border Pulse

When `hvac_action` is `heating`, the viewscreen border gently pulses brighter — like warmth radiating from the heater.

```css
.pool-body-frame.heating {
  animation: pool-heating-pulse 2.5s ease-in-out infinite;
}

@keyframes pool-heating-pulse {
  0%, 100% { border-color: var(--lcars-butterscotch); }
  50%      { border-color: rgba(255, 153, 102, 0.6); }
}
```

### Idle — Static

When `hvac_action` is `idle`, the frame is static at full opacity. Stillness communicates "at temperature."

### Off — Dimmed

```css
.pool-body-frame.off {
  opacity: 0.6;
  border-color: var(--lcars-disabled);
}

.pool-body-frame.off .pool-water-particle {
  animation: none !important;
  opacity: 0.1;
}
```

### Freeze Protection Active

When the freeze mode binary sensor is `on`, the pool viewscreen border shifts to a bright ice-blue pulse — the ship is protecting its aquatic systems.

```css
.pool-body-frame.freeze {
  animation: pool-freeze-pulse 1.5s ease-in-out infinite;
}

@keyframes pool-freeze-pulse {
  0%, 100% { border-color: var(--lcars-ice); }
  50%      { border-color: rgba(153, 204, 255, 0.4); }
}

@media (prefers-reduced-motion: reduce) {
  .pool-body-frame.freeze {
    animation: none !important;
    border-color: var(--lcars-ice);
    border-width: 4px;  /* Static thicker border as reduced-motion alternative */
  }
}
```

### Reduced Motion — All Animations

```css
@media (prefers-reduced-motion: reduce) {
  .pool-body-frame.heating {
    animation: none !important;
    border-color: var(--lcars-butterscotch);
  }

  .pool-water-particle {
    animation: none !important;
    opacity: 0.2;
  }

  .pool-swatch[data-animated] .pool-swatch-fill {
    animation: none !important;
  }
}
```

All animations respect `prefers-reduced-motion` per WCAG 2.3.3.

---
