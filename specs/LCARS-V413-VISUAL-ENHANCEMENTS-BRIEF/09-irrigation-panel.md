## 8. Irrigation Panel

### 8.1 — Zone Fill Bar Water Flow Animation

- **What it does**: The active zone's fill bar (currently a static progressing bar) gains an animated internal pattern — thin diagonal stripes scrolling left to right within the filled portion, simulating water flowing through the pipe. Idle zones have a solid dim bar.
- **Where it goes**: `.lcars-zone-fillbar.active .fill` — `background: repeating-linear-gradient(-45deg, var(--lcars-ice) 0 4px, rgba(153,204,255,0.5) 4px 8px); background-size: 11.3px 100%; animation: lcars-flow`
- **LCARS justification**: Fluid/gas flow indicators on TNG Engineering displays show animated stripe patterns within conduit visualizations — deuterium flowing to the warp core, coolant flowing through EPS taps. Water in a pipe should look like fluid in a conduit.
- **Animation details**: `@keyframes lcars-flow` — `background-position: 0 0` → `11.3px 0` (one full stripe width). Duration: `0.6s`. Timing: `linear infinite`. The diagonal stripes create a barberpole/candy-stripe scroll effect.

### 8.2 — Zone Completion Flash

- **What it does**: When a zone's watering cycle completes (transitions from active to idle), the zone row briefly flashes green-to-dark — a confirmation that the cycle finished successfully. The row border-left gets a green accent for 2 seconds then fades.
- **Where it goes**: `.lcars-zone-row.completing` — triggered by JS when zone state transitions from watering to idle
- **LCARS justification**: Task completion on LCARS consoles always produces a confirmation flash — the transporter cycle complete flash, the replicator materialization finish. The system says "done" with a brief visual event, not just a text change.
- **Animation details**: `@keyframes lcars-zone-complete` — `border-left: 3px solid var(--lcars-ice); background: rgba(153,204,255,0.1)` → `border-left: 3px solid transparent; background: transparent`. Duration: `2s`. Runs once.

### 8.3 — Schedule Countdown Proximity Glow

- **What it does**: As the next scheduled run approaches (within 1 hour), the "NEXT RUN" text in the schedule sidebar gains an increasingly bright glow — dim at 60 minutes out, bright at 0 minutes. At T-0, the text flashes and the panel transitions to active state.
- **Where it goes**: `.lcars-schedule-next[data-proximity]` — `text-shadow` intensity keyed to `--schedule-proximity` custom property (0.0–1.0)
- **LCARS justification**: Mission countdown displays on TNG show increasing visual urgency as the scheduled event approaches — the console communicates "upcoming" with growing intensity, not just a static timestamp.
- **Animation details**: `text-shadow: 0 0 calc(var(--schedule-proximity) * 8px) var(--lcars-ice)`. Updated by JS every minute. At T-0: `@keyframes lcars-schedule-go` — brief white flash then settle to active-zone styling. Duration: `500ms`.

### 8.4 — Rain Delay Cloud Badge

- **What it does**: When rain delay is active, a pill badge (§2.1 pattern) appears in the schedule sidebar with a `☁` glyph and the delay duration — styled in `--lcars-ice` with a soft drop shadow to look like a cloud. The badge gently bobs up and down (1px) on a slow cycle — the cloud is floating.
- **Where it goes**: `.lcars-rain-delay-badge` — new pill element in schedule column, only visible when rain delay > 0
- **LCARS justification**: Environmental alerts on TNG show condition badges — small capsule indicators that appear when a specific condition is active. The rain delay is a weather-intelligence override; it deserves its own status badge, not just a text change in an existing field.
- **Animation details**: `@keyframes lcars-cloud-bob` — `translateY(0px)→translateY(-1px)→translateY(0px)`. Duration: `3s`. Timing: `ease-in-out infinite`. Respects `prefers-reduced-motion`.

---
