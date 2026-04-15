## 4. Media Card

### 4.1 — Audio Waveform Visualizer

- **What it does**: Below the album art viewscreen, a decorative animated waveform bar runs when media is playing — a series of thin vertical bars that oscillate at randomized heights, styled in cyan with a red accent at peaks. Directly inspired by the `pool panel.png` Communications waveform display.
- **Where it goes**: New element `.lcars-audio-waveform` inserted between artwork and track title. Contains ~32 `<span>` bars, each 2px wide with `var(--lcars-gap)` spacing.
- **LCARS justification**: The `pool panel.png` Communications display has *exactly this* — a cyan+red audio waveform with a center bright glow. When media plays aboard the Enterprise, the console shows a waveform or audio-spectrum readout. It's the most visually striking element in the Communications reference.
- **Animation details**: `@keyframes lcars-waveform-barN` (one per bar group, offset) — each bar's `height` oscillates between a random min (10%) and max (60-100%). Duration: varies per bar (300ms–600ms, randomized via CSS custom properties). Timing: `ease-in-out alternate infinite`. Paused when media state is `idle`/`paused`. Center bars run taller (50-100%), edge bars shorter (10-50%) — creates the center-bright-spot from the reference. Apply `prefers-reduced-motion` guard.

### 4.2 — Album Art Viewscreen Border Glow

- **What it does**: When media is actively playing, the viewscreen border gains a soft outward glow in the panel's frame color (`--lcars-african-violet` for media). The glow pulses gently — the viewscreen is "energized" and displaying content.
- **Where it goes**: `.lcars-media-viewscreen` when `.playing` — `box-shadow: 0 0 12px 2px var(--lcars-african-violet)`
- **LCARS justification**: Active viewscreens on the Enterprise have a visible luminance halo at their edges — the display emits light into the surrounding LCARS frame. An inactive viewscreen has no glow. This distinguishes "now playing" from "standby" at a distance.
- **Animation details**: `@keyframes lcars-viewscreen-glow` — `box-shadow` spread oscillates between `2px` and `6px`. Duration: `3s`. Timing: `ease-in-out`. Only when playing. Idle = no glow, no animation.

### 4.3 — Transport Button Active States

- **What it does**: The play/pause button gains a persistent glow ring when active (playing = bright, paused = dim pulse). Skip buttons flash on press. Shuffle/repeat pills show a small "lit" indicator dot when enabled — a 4px colored circle in the top-right corner.
- **Where it goes**: `.lcars-transport-btn.active` for play state, `.lcars-transport-btn:active` for skip flash, `.lcars-transport-btn[data-enabled]::before` for indicator dot
- **LCARS justification**: TNG console buttons show persistent illumination when their function is engaged — not just a color change but a visible "this is ON" glow state. The dot indicator matches Okuda's "active function" micro-pip used on tactical consoles.
- **Animation details**: Play button: constant `box-shadow: 0 0 6px var(--lcars-gold)`. Paused: `@keyframes lcars-pause-pulse` pulsing the shadow 0→6px, duration `2s`. Skip buttons: existing `lcars-button-flash` from §1.4. Indicator dot: static, `background: var(--lcars-gold); width: 4px; height: 4px; border-radius: 50%`.

### 4.4 — Progress Bar Luminous Head

- **What it does**: The playback progress bar's leading edge (the point between played and unplayed) gains a bright vertical pip — a 4px-wide, 100%-height bright accent that marks the "now" position. It subtly glows, acting as a playhead indicator visible from across the room.
- **Where it goes**: `.lcars-progress-bar .played::after` — `width: 4px; background: var(--lcars-gold); box-shadow: 0 0 6px var(--lcars-gold)`
- **LCARS justification**: LCARS progress indicators (seen in transporter and replicator sequences) always have a visible "head" marker — a bright point showing current position in a process. A flat two-tone bar without a head marker lacks the precision that LCARS demands.
- **Animation details**: Soft glow pulse: `@keyframes lcars-playhead-glow` — `box-shadow` 4px → 8px → 4px. Duration: `2s`. Always on while playing. Position moves via CSS `width %` of the played portion.

### 4.5 — Idle State Standby Pulse

- **What it does**: When media is idle, the viewscreen area shows a single small `♪` glyph (already specified) with a slow breathing opacity pulse — the console is in low-power standby, not dead.
- **Where it goes**: `.lcars-media-idle .standby-glyph`
- **LCARS justification**: Unmanned consoles on TNG still show subtle activity — a slowly pulsing Starfleet chevron or a dim standby indicator. A completely black panel looks broken. The breathing pulse says "I'm here, ready when you are."
- **Animation details**: `@keyframes lcars-standby-breathe` — `opacity: 0.2` → `0.5` → `0.2`. Duration: `4s`. Timing: `ease-in-out infinite`. Apply `prefers-reduced-motion` guard.

---
