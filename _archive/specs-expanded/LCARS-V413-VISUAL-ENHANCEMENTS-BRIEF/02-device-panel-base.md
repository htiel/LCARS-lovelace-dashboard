## 1. Device Panel (Base)

The base panel that all others extend. Enhancements here cascade to every panel type unless overridden.

### 1.1 — Frame Breathing Pulse

- **What it does**: The panel's border color subtly cycles between 90% and 100% opacity on a slow sinusoidal loop, giving the impression the panel is "alive" — a powered-on console drawing energy from the EPS grid.
- **Where it goes**: `.lcars-device-panel` border (all four sides)
- **LCARS justification**: On TNG, active LCARS consoles have a barely-perceptible luminance variation — they're backlit displays with plasma-phosphor substrates, not dead-flat paint. A static border reads as "powered off."
- **Animation details**: `@keyframes lcars-frame-breathe` — `opacity: 0.88` → `1.0` → `0.88`. Duration: `4s`. Timing: `ease-in-out`. Trigger: always on (ambient). Respects `prefers-reduced-motion: reduce` → disabled.

### 1.2 — Data Pip Footer Strip

- **What it does**: A 4px-tall decorative strip of tiny squares runs along the bottom edge of every panel — alternating between the panel's frame color and transparent gaps. Pure decoration that evokes the segmented data readout strips visible at the bottom of the `pool panel.png` Communications display.
- **Where it goes**: `.lcars-device-panel::after` pseudo-element, `position: absolute; bottom: 0; left: 0; right: 0; height: 4px`
- **LCARS justification**: Every TNG/DS9 LCARS console has these micro-segmented decorative strips along edges — they imply high-density data bus activity. Okuda used them to fill dead space and add visual rhythm. (Source: `pool panel.png` bottom edge)
- **Animation details**: None (static). The strip is cosmetic. Optional: a single bright pip could sweep left→right every 8s to imply data flow, using `@keyframes pip-sweep` translating a brighter segment.

### 1.3 — Header Numeric Code Watermark

- **What it does**: A faint decorative numeric code (e.g., "047-31842") appears right-aligned in the panel header bar area, rendered in `--lcars-gray` at 40% opacity. Each panel instance generates a deterministic code from the entity ID hash so it's consistent but unique.
- **Where it goes**: `.lcars-panel-header::after` pseudo-element, `position: absolute; right: var(--lcars-gap); font-size: 0.625rem; opacity: 0.4`
- **LCARS justification**: Numeric codes are *everywhere* on LCARS — `general.png` shows "053-11974" and "031-01972" flanking the wireframe globe. They suggest internal system identifiers, ODN routing numbers, or subsystem codes. Every Starfleet console has them.
- **Animation details**: None (static). The code is decorative metadata.

### 1.4 — Button Press Ripple Flash

- **What it does**: When any LCARS pill button is tapped/clicked, a bright flash radiates outward from the press point, then fades. The button momentarily brightens to `--lcars-gold` at the contact point and returns to its base color over 200ms.
- **Where it goes**: `.lcars-button:active::after` pseudo-element with radial gradient, scaling from 0 to 1
- **LCARS justification**: On the show, when actors press LCARS buttons, the touched region flares brighter — the backlit panel responding to capacitive touch. Okuda animated these as bright flash frames in post-production. A button that just changes color without a flash feels dead.
- **Animation details**: `@keyframes lcars-button-flash` — `scale(0), opacity: 0.8` → `scale(2.5), opacity: 0`. Duration: `250ms`. Timing: `ease-out`. Trigger: `:active` state.

### 1.5 — Viewscreen Power-On Scanline

- **What it does**: When a panel first renders (or when the viewscreen content changes), a single bright horizontal line sweeps from top to bottom of the media viewscreen area, like a CRT warming up. A classic "display initializing" effect.
- **Where it goes**: `.lcars-media-viewscreen::before` pseudo-element
- **LCARS justification**: The Enterprise viewscreen consistently shows a horizontal scan sweep when activating or switching feeds. It's one of the most recognizable LCARS visual signatures — the display "coming online."
- **Animation details**: `@keyframes lcars-scanline` — `translateY(-100%)` → `translateY(100%)` with a thin (2px) horizontal white gradient at 60% opacity. Duration: `600ms`. Timing: `ease-in`. Trigger: on component `firstUpdated()` or when media source changes (add/remove a `.scanning` class). Runs once, not looping.

---
