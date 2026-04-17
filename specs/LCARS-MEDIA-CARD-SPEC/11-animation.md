## 10. Animation

### v4.13.0 Visual Enhancements

#### Audio Waveform Visualiser
**12 bars** (not 32 — [Data C-2] at 2px bar width + gap, 12 vs 32 is indistinguishable at dashboard viewing distance; reduces concurrent animations from 32 to 12). Use **4 shared animation timing groups** (3 bars per group × 4 `--bar-dur`/`--bar-delay` variants) instead of per-bar randomization. Total concurrent: 4 variant keyframes + glow + progress + breathe = **7** (at budget boundary). Thin vertical bars below album art oscillating at varied heights when playing — cyan with red accent at peaks. Inspired by `pool panel.png` Communications waveform. Paused when idle/paused.

```css
.lcars-audio-waveform {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: var(--lcars-gap, 0.25rem);
  height: 32px;
  overflow: hidden;
}

.lcars-audio-waveform .bar {
  width: 2px;
  border-radius: 1px 1px 0 0;
  background: var(--lcars-ice);
  /* Use scaleY instead of height to avoid layout thrashing on 12 bars [Data C-1] */
  height: var(--bar-max, 60%);
  transform-origin: bottom;
  transform: scaleY(var(--bar-min-ratio, 0.17));
  will-change: transform;
  animation: lcars-waveform var(--bar-dur, 400ms) ease-in-out alternate infinite;
  animation-delay: var(--bar-delay, 0ms);
}

.lcars-audio-waveform .bar.peak {
  background: linear-gradient(to top, var(--lcars-ice) 70%, var(--lcars-tomato) 100%);
}

.lcars-media-card:not([data-state="playing"]) .lcars-audio-waveform .bar {
  animation-play-state: paused;
  transform: scaleY(0.03);
  opacity: 0.3;
}

@keyframes lcars-waveform {
  0%   { transform: scaleY(var(--bar-min-ratio, 0.17)); }
  100% { transform: scaleY(1); }
}
```

#### Album Art Viewscreen Border Glow
Playing state = pulsing african-violet glow (2px→6px spread, 3s cycle). Idle = no glow.

```css
.lcars-media-viewscreen.playing {
  animation: lcars-viewscreen-glow 3s ease-in-out infinite;
}

@keyframes lcars-viewscreen-glow {
  0%, 100% { box-shadow: 0 0 12px 2px var(--lcars-african-violet); }
  50%      { box-shadow: 0 0 12px 6px var(--lcars-african-violet); }
}
```

#### Transport Button Active States
Play button glow ring when active, pulse when paused. Shuffle/repeat indicator dot (4px gold).

```css
.lcars-transport-btn.play.active {
  box-shadow: 0 0 6px var(--lcars-gold);
}

.lcars-transport-btn.play.paused {
  animation: lcars-pause-pulse 2s ease-in-out infinite;
}

@keyframes lcars-pause-pulse {
  0%, 100% { box-shadow: 0 0 0px transparent; }
  50%      { box-shadow: 0 0 6px var(--lcars-gold); }
}

.lcars-transport-btn[data-enabled="true"]::before {
  content: '';
  position: absolute;
  top: 4px;
  right: 4px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--lcars-gold);
}
```

#### Progress Bar Luminous Head
4px bright gold pip at playback position with glow pulse.

```css
.lcars-progress-bar .played::after {
  content: '';
  position: absolute;
  right: 0;
  top: 0;
  width: 4px;
  height: 100%;
  background: var(--lcars-gold);
  border-radius: 1px;
  animation: lcars-playhead-glow 2s ease-in-out infinite;
}

@keyframes lcars-playhead-glow {
  0%, 100% { box-shadow: 0 0 4px var(--lcars-gold); }
  50%      { box-shadow: 0 0 8px var(--lcars-gold); }
}
```

#### Idle State Standby Pulse
Breathing opacity on idle ♪ glyph (0.2→0.5, 4s cycle).

```css
.lcars-media-idle .standby-glyph {
  animation: lcars-standby-breathe 4s ease-in-out infinite;
}

@keyframes lcars-standby-breathe {
  0%, 100% { opacity: 0.2; }
  50%      { opacity: 0.5; }
}
```

#### Media Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  .lcars-audio-waveform .bar { animation: none; height: var(--bar-min, 10%); }
  .lcars-media-viewscreen.playing { animation: none; box-shadow: 0 0 12px 2px var(--lcars-african-violet); }
  .lcars-transport-btn.play.paused { animation: none; box-shadow: 0 0 4px var(--lcars-gold); }
  .lcars-progress-bar .played::after { animation: none; box-shadow: 0 0 4px var(--lcars-gold); }
  .lcars-media-idle .standby-glyph { animation: none; opacity: 0.35; }
}
```

### Viewscreen Activation (Reuse from Device Panel §7)

```css
@keyframes viewscreen-activate {
  0%   { clip-path: inset(50% 0 50% 0); filter: brightness(2) saturate(0); }
  40%  { clip-path: inset(10% 0 10% 0); filter: brightness(1.5) saturate(0.3); }
  100% { clip-path: inset(0 0 0 0); filter: brightness(1) saturate(1); }
}
```

Applied when album art first appears (transition from idle to playing). Duration: 600ms.

### Art Crossfade (Track Change)

When the track changes and new album art loads:

```css
@keyframes media-art-crossfade {
  0%   { opacity: 0.3; filter: brightness(1.3); }
  100% { opacity: 1; filter: brightness(1); }
}
```

Duration: 400ms. Provides a brief flash-bright effect simulating a "viewscreen frequency change" — a subtle nod to the way TNG viewscreens would briefly flicker white when switching feeds.

### Transport Button Press

```css
@keyframes media-btn-press {
  0%   { transform: scale(0.95); filter: brightness(1.4); }
  100% { transform: scale(1); filter: brightness(1); }
}

.media-transport-btn:active {
  animation: media-btn-press 150ms ease-out;
}
```

### Panel State Transition (Idle ↔ Active)

```css
.lcars-media-panel {
  transition:
    border-color 600ms ease-in-out,
    min-height 600ms ease-in-out;
}
```

The frame color slowly transitions between gray (idle) and violet (active), creating a subtle "power-up" effect.

### Buffering Pulse

```css
@keyframes media-buffer-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.4; }
}
```

Applied to the progress bar fill and state badge when the player is in `buffering` state.

### Unavailable Distress Pulse

Reuse from the Atmoscrubber Spec §3:

```css
.lcars-media-panel.fault {
  animation: media-fault-pulse 1s ease-in-out infinite;
}

@keyframes media-fault-pulse {
  0%, 100% { border-color: var(--lcars-alert); }
  50%      { border-color: rgba(255, 85, 85, 0.4); }
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .lcars-media-panel,
  .media-viewscreen img,
  .media-viewscreen img.transitioning,
  .media-transport-btn:active,
  .media-progress-fill.buffering,
  .lcars-media-panel.fault {
    animation: none !important;
  }

  .lcars-media-panel {
    transition: none !important;
  }

  /* Static alternatives */
  .lcars-media-panel.fault {
    border-color: var(--lcars-alert);
    border-width: 3px;
  }

  .media-progress-fill.buffering {
    opacity: 0.6;
  }
}
```

All animations respect `prefers-reduced-motion` per WCAG 2.3.3 and existing patterns in `lcars-styles.js`.

---
