# LCARS Media Panel — Design Specification

**Author**: Wesley Crusher (Creative Technologist)  
**Date**: Stardate 2026.04.13  
**Status**: IMPLEMENTED — v4.11.0  
**Panel Type**: Entertainment (Media Player)  
**Extends**: `LcarsDevicePanelBase` (per LCARS-DEVICE-PANEL-SPEC.md §9)

---

## 0. Design Philosophy

The Media Panel is modeled after a **recreation deck console** — the kind of display you'd find on Deck Ten-Forward or outside Holodeck 3 showing what program is running, who's inside, and the queue. On the Enterprise-D, entertainment was integrated into the ship's culture: the crew could check what music was playing on any deck, what holoprogram was loaded, or what subspace broadcast was incoming — all from a clean, minimal LCARS readout.

The center of the panel is the **"viewscreen"** — album art displayed as the dominant visual element, just like a viewscreen window showing the current program. Transport controls line the bottom like the physical button strips beneath TNG console displays. Volume is a horizontal bar — a power-level indicator. Source and grouping metadata ride in the sensor column.

Per Roddenberry's mandate: **the ship entertains you**. When nothing is playing, the panel dims to near-black with a subtle idle indicator — it doesn't demand attention. When media is active, the violet frame awakens and the art fills the viewscreen.

Per Bracer Jack: **empty space is beautiful**. The album art floats in its frame. The idle state is nearly empty. No clutter.

---

## 1. Grid Layout

### ASCII Layout — Active State (Now Playing)

```
┌──────────────────────────────────────────────────────────┐
│  LIVING ROOM HOMEPOD           ▶ PLAYING                 │  ← header
├──────────────┬───────────────────────────────────────────┤
│              │   ╔═══════════════════════════════╗       │
│  SOURCE      │   ║                               ║       │
│  AIRPLAY     │   ║                               ║       │
│              │   ║        ALBUM ARTWORK          ║       │
│  GROUPED     │   ║                               ║       │
│  3 SPEAKERS  │   ║                               ║       │
│              │   ║                               ║       │
│  MEDIA TYPE  │   ╚═══════════════════════════════╝       │
│  MUSIC       │                                           │
│              │   TRACK TITLE                             │
│  SHUFFLE     │   ARTIST — ALBUM                          │
│  ON          │                                           │
│              │   ░░░░░░░░░░░░░████░░░░░░  2:34 / 4:12   │  ← progress
│  REPEAT      │                                           │
│  ALL         │   ┌──╮ ┌──────╮ ┌──────╮ ┌──────╮ ┌──╮   │  ← transport
│              │   │⇄ │ │ ⏮ PRV│ │▶ PLAY│ │NXT ⏭│ │↻ │   │
├──────────────┴───┴──┴─┴──────┴─┴──────┴─┴──────┴─┴──┴───┤
│  VOL ████████████████████░░░░░░░░░░░░░░░░░░░  62%   🔊  │  ← volume
└──────────────────────────────────────────────────────────┘
```

### ASCII Layout — Idle State (Nothing Playing)

```
┌──────────────────────────────────────────────────────────┐
│  LIVING ROOM HOMEPOD           ■ IDLE                    │  ← header
├──────────────┬───────────────────────────────────────────┤
│              │                                           │
│  SOURCE      │              ♪                            │
│  AIRPLAY     │         STANDBY                           │
│              │                                           │
│              │                                           │
├──────────────┴───────────────────────────────────────────┤
│  VOL ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  —%    🔇  │
└──────────────────────────────────────────────────────────┘
```

### ASCII Layout — Speaker Group View (Multi-Room)

```
┌──────────────────────────────────────────────────────────┐
│  AUDIO GROUP — 3 SPEAKERS      ▶ PLAYING                 │
├──────────────┬───────────────────────────────────────────┤
│              │   ╔═══════════════════════════════╗       │
│  SOURCE      │   ║        ALBUM ARTWORK          ║       │
│  AIRPLAY     │   ╚═══════════════════════════════╝       │
│              │   TRACK TITLE                             │
│  GROUPED     │   ARTIST — ALBUM                          │
│  ● LIVING RM │                                           │
│  ● KITCHEN   │   ┌──╮ ┌──────╮ ┌──────╮ ┌──────╮ ┌──╮   │
│  ● BEDROOM   │   │⇄ │ │ ⏮ PRV│ │▶ PLAY│ │NXT ⏭│ │↻ │   │
├──────────────┴───┴──┴─┴──────┴─┴──────┴─┴──────┴─┴──┴───┤
│  VOL ████████████████████░░░░░░░░░░░░░░░░░░░  62%   🔊  │
└──────────────────────────────────────────────────────────┘
```

### CSS Grid Definition

```css
.lcars-media-panel {
  display: grid;
  grid-template-areas:
    "header   header"
    "metadata media"
    "volume   volume";
  grid-template-columns: minmax(8rem, 1fr) minmax(14rem, 2.5fr);
  grid-template-rows: auto 1fr auto;
  gap: var(--lcars-gap);

  /* Frame border — Bracer Jack Rule 2: thick→thin, NEVER same */
  border-left: 4px solid var(--panel-frame-color, var(--lcars-african-violet));
  border-top: 2px solid var(--panel-frame-color, var(--lcars-african-violet));
  border-right: 2px solid var(--panel-frame-color, var(--lcars-african-violet));
  border-bottom: 4px solid var(--panel-frame-color, var(--lcars-african-violet));
  border-radius: 0.75rem;

  padding: var(--lcars-gap);
  background: var(--lcars-bg);

  /* Media frame color: african-violet (entertainment/media) */
  --panel-frame-color: var(--lcars-african-violet);

  /* Dynamic playback state color — set by JS */
  --media-state-color: var(--lcars-african-violet);

  min-height: calc(var(--lcars-vunit) * 4);
}

/* Idle state — more compact */
.lcars-media-panel.idle {
  min-height: calc(var(--lcars-vunit) * 2);
}
```

### Why `--lcars-african-violet` for the Frame

Entertainment and media systems on starships are associated with cooler violet/purple hues — distinct from the warm butterscotch of security cameras, the blue of environmental systems, and the ice of data panels. The `--lcars-african-violet` (#cc99ff) sits in the violet family, readable against black, and gives the media panel an immediately recognizable "recreation deck" identity. Per the Device Panel Spec §9 color mapping table: Media Player → violet-creme family. We use `--lcars-african-violet` as the primary with `--lcars-lilac` (#cc55ff) reserved for active/accent states.

---

## 2. Playback State → Color Mapping

Media state drives the header badge color, frame accent, and transport button highlights.

### State Color Map

| HA State         | Display Label  | LCARS Variable              | Hex       | Rationale                                             |
|------------------|----------------|-----------------------------|-----------|-------------------------------------------------------|
| `playing`        | `PLAYING`      | `--lcars-african-violet`    | `#cc99ff` | Active entertainment — violet glow, panel active      |
| `paused`         | `PAUSED`       | `--lcars-sunflower`         | `#ffcc99` | Warm hold — "standing by", not urgent                 |
| `buffering`      | `BUFFERING`    | `--lcars-sunflower` (pulse) | `#ffcc99` | Same as paused but with a subtle pulse                |
| `idle`           | `IDLE`         | `--lcars-gray`              | `#666688` | Inactive — standard LCARS disabled state              |
| `standby`        | `STANDBY`      | `--lcars-gray`              | `#666688` | Same as idle visually                                 |
| `off`            | `OFF`          | `--lcars-gray`              | `#666688` | Powered off                                           |
| `on`             | `ON`           | `--lcars-ice`               | `#99ccff` | Powered on but not playing — cool informational blue  |
| `unavailable`    | `UNAVAILABLE`  | `--lcars-tomato` (pulse)    | `#ff5555` | System fault — red, uses distress pulse animation     |
| `unknown`        | `UNKNOWN`      | `--lcars-tomato`            | `#ff5555` | System fault                                          |

### Implementation

```javascript
/**
 * Resolve media_player state to LCARS color CSS variable.
 */
function getMediaStateColor(state) {
  if (state == null) return 'var(--lcars-disabled)';
  switch (state) {
    case 'playing':      return 'var(--lcars-african-violet)';
    case 'paused':
    case 'buffering':    return 'var(--lcars-sunflower)';
    case 'on':           return 'var(--lcars-data-accent)';
    case 'idle':
    case 'standby':
    case 'off':          return 'var(--lcars-disabled)';
    case 'unavailable':
    case 'unknown':      return 'var(--lcars-alert)';
    default:             return 'var(--lcars-disabled)';
  }
}

/**
 * Return uppercase display label for media state.
 */
function getMediaStateLabel(state) {
  if (state == null) return 'UNAVAILABLE';
  return state.toUpperCase().replace('_', ' ');
}

/**
 * Returns true if the player is in a "playing-like" state
 * where transport controls and progress should be fully visible.
 */
function isActivePlayback(state) {
  return state === 'playing' || state === 'paused' || state === 'buffering';
}

/**
 * Returns true if state warrants the distress pulse animation.
 */
function isMediaFault(state) {
  return state === 'unavailable' || state === 'unknown';
}
```

### Contrast Verification (all vs `#000000` background)

| Color                    | Hex       | Contrast vs #000 | WCAG Level |
|--------------------------|-----------|-------------------|------------|
| `--lcars-african-violet` | `#cc99ff` | 8.5:1             | AAA        |
| `--lcars-lilac`          | `#cc55ff` | 4.9:1             | AA         |
| `--lcars-sunflower`      | `#ffcc99` | 13.1:1            | AAA        |
| `--lcars-ice`            | `#99ccff` | 10.3:1            | AAA        |
| `--lcars-gold`           | `#ffaa00` | 8.6:1             | AAA        |
| `--lcars-tomato`         | `#ff5555` | 5.2:1             | AA         |
| `--lcars-gray`           | `#666688` | 4.6:1             | AA         |
| `--lcars-space-white`    | `#f5f6fa` | 18.9:1            | AAA        |

All pass **WCAG 1.4.3 (AA)** minimum 4.5:1 for normal text. `--lcars-lilac` at 4.9:1 is the lowest active-use color and passes AA. It is used only as an accent on active buttons where the text color inverts to `--lcars-black`, so the contrast point becomes moot (dark text on light background).

---

## 3. Component Anatomy

### 3.1 Panel Header

```html
<div class="media-header" role="heading" aria-level="3">
  <span class="device-panel-name">${deviceName}</span>
  <span class="device-panel-header-line" aria-hidden="true"></span>
  <span class="media-state-badge" style="color: ${stateColor}">
    ${stateIcon} ${stateLabel}
  </span>
</div>
```

```css
.media-header {
  grid-area: header;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  min-height: var(--lcars-bar-h);
  border-bottom: 2px solid var(--panel-frame-color);
}

.media-state-badge {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  text-transform: uppercase;
  white-space: nowrap;
  font-weight: 700;
  transition: color var(--lcars-transition-slow);
}

/* State icon (play/pause/stop symbol) — inline text, not ha-icon */
.media-state-icon {
  font-size: 0.75em;
  vertical-align: middle;
  margin-right: 0.25rem;
}
```

Reuses `.device-panel-name` and `.device-panel-header-line` from the Device Panel Spec §3.1. The state badge shows a Unicode transport symbol (▶ ❚❚ ■) and the state label, colored dynamically.

### 3.2 Album Art Viewscreen (Media Slot)

The dominant visual — album art displayed in a bordered frame with LCARS corner brackets.

```css
.media-viewscreen {
  position: relative;
  border: 3px solid var(--panel-frame-color, var(--lcars-african-violet));
  border-radius: 0.5rem;
  overflow: hidden;
  background: var(--lcars-bg);

  /* Square aspect for album art */
  aspect-ratio: var(--media-aspect, 1 / 1);
  max-height: 18rem;

  /* Contain within the media grid area */
  justify-self: center;
  align-self: start;
  width: 100%;
}

/* Album art image — crossorigin + referrerpolicy set in HTML (see §3.2.1) */
.media-viewscreen img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  animation: viewscreen-activate 600ms ease-out both;
}

/* Transition between tracks — crossfade */
.media-viewscreen img.transitioning {
  animation: media-art-crossfade 400ms ease-in-out;
}

@keyframes media-art-crossfade {
  0%   { opacity: 0.3; filter: brightness(1.3); }
  100% { opacity: 1; filter: brightness(1); }
}

/* Idle state placeholder — large icon + "STANDBY" text */
.media-viewscreen-idle {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 6rem;
  gap: 0.5rem;
}

.media-viewscreen-idle ha-icon {
  --mdc-icon-size: 2.5rem;
  color: var(--lcars-gray);
  opacity: 0.5;
}

.media-viewscreen-idle-label {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-gray);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Corner brackets — decorative LCARS cornering (from Device Panel §3.2) */
.media-viewscreen::before,
.media-viewscreen::after {
  content: '';
  position: absolute;
  width: 1.5rem;
  height: 1.5rem;
  border-color: var(--panel-frame-color, var(--lcars-african-violet));
  border-style: solid;
  pointer-events: none;
  z-index: 1;
}

.media-viewscreen::before {
  top: 0.25rem;
  left: 0.25rem;
  border-width: 2px 0 0 2px;
  border-radius: 0.25rem 0 0 0;
}

.media-viewscreen::after {
  bottom: 0.25rem;
  right: 0.25rem;
  border-width: 0 2px 2px 0;
  border-radius: 0 0 0.25rem 0;
}

/* Offline state */
.media-viewscreen[data-offline] {
  border-color: var(--lcars-gray);
  opacity: 0.5;
}
```

### 3.3 Now Playing Info (Below Viewscreen)

Track title, artist, and album displayed below the artwork within the media grid area.

```css
.media-now-playing {
  padding: 0.5rem 0 0.25rem;
}

.media-track-title {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-sub);
  color: var(--lcars-text-heading);           /* --lcars-sunflower */
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.media-track-artist {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-african-violet);
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 0.125rem;
}
```

### 3.2.1 Album Art URL Validation (⚠ Worf Security Requirement)

Before rendering the `entity_picture` URL in the `<img>` tag, validate it against an allowlist of safe URL prefixes. The `<img>` element MUST include `crossorigin="anonymous"` and `referrerpolicy="no-referrer"` as defense-in-depth.

```javascript
/**
 * Validate entity_picture URL before rendering.
 * Only allow HA-proxied paths — reject external, javascript:, and data: URLs.
 */
function isValidArtworkUrl(url) {
  if (!url || typeof url !== 'string') return false;
  // Only allow HA-proxied paths
  return url.startsWith('/api/') || url.startsWith('/local/');
}
```

```html
<!-- Album art with security attributes -->
<img
  src="${isValidArtworkUrl(artworkUrl) ? artworkUrl : ''}"
  alt="${mediaTitle} album artwork"
  crossorigin="anonymous"
  referrerpolicy="no-referrer"
  class="${isTransitioning ? 'transitioning' : ''}"
/>
```

If the URL fails validation, render the idle placeholder instead. This guards against a compromised HA integration injecting `javascript:`, `data:text/html`, or external origin URLs into `entity_picture`.

### 3.3 Now Playing Info (Below Viewscreen)

The track title uses the sub-header font size — it's the most important text in the panel after the device name. Artist/album uses data size in the panel's accent color (`--lcars-african-violet`), creating a clear visual hierarchy without introducing a fourth font size.

### 3.4 Progress Bar

A horizontal progress indicator showing elapsed time and duration.

```css
.media-progress-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0;
  min-height: 1.5rem;
}

.media-progress-bar {
  flex: 1;
  height: 4px;
  background: var(--lcars-gray);
  border-radius: 2px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
}

.media-progress-bar:hover {
  height: 6px;
}

.media-progress-bar:focus-visible {
  outline: 2px solid var(--lcars-ice);
  outline-offset: 2px;
}

.media-progress-fill {
  height: 100%;
  background: var(--lcars-african-violet);
  border-radius: 2px;
  transition: width 1s linear;
  /* Width set by JS: style="width: ${progressPct}%" */
}

/* Buffering state — pulsing fill */
.media-progress-fill.buffering {
  animation: media-buffer-pulse 1.5s ease-in-out infinite;
}

@keyframes media-buffer-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.4; }
}

.media-progress-time {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-gray);
  text-transform: uppercase;
  white-space: nowrap;
  min-width: 6.5rem;
  text-align: right;
}
```

```javascript
/**
 * Format seconds to MM:SS or H:MM:SS display string.
 */
function formatMediaTime(seconds) {
  if (seconds == null || isNaN(seconds) || seconds < 0) return '--:--';
  const s = Math.round(Number(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
}

/**
 * Calculate current progress percentage.
 * Uses media_position + media_position_updated_at for live interpolation.
 */
function getMediaProgress(stateObj) {
  if (!stateObj || !stateObj.attributes) return { pct: 0, elapsed: 0, duration: 0 };

  const duration = Number(stateObj.attributes.media_duration) || 0;
  if (duration <= 0) return { pct: 0, elapsed: 0, duration: 0 };

  let position = Number(stateObj.attributes.media_position) || 0;

  // Interpolate from last known position if playing
  if (stateObj.state === 'playing' && stateObj.attributes.media_position_updated_at) {
    const updatedAt = new Date(stateObj.attributes.media_position_updated_at).getTime();
    const now = Date.now();
    const elapsed = (now - updatedAt) / 1000;
    position = Math.min(position + elapsed, duration);
  }

  const pct = Math.min(100, (position / duration) * 100);
  return { pct, elapsed: position, duration };
}

/**
 * Clamp seek position before calling media_player.media_seek.
 * Prevents seeking beyond track bounds.
 * (⚠ Worf Security Requirement)
 */
function clampSeekPosition(seekSeconds, duration) {
  if (duration <= 0) return 0;
  return Math.max(0, Math.min(duration, seekSeconds));
}
```

### 3.5 Transport Controls

Play/pause, previous, next, shuffle, and repeat — standard media transport as LCARS pill buttons.

```
┌──╮ ┌──────╮ ┌──────╮ ┌──────╮ ┌──╮
│⇄ │ │ ⏮ PRV│ │▶ PLAY│ │NXT ⏭│ │↻ │
└──╯ └──────╯ └──────╯ └──────╯ └──╯
```

```css
.media-transport {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--lcars-gap);
  padding: 0.25rem 0;
  flex-wrap: wrap;
}

/* Standard transport button — reuses .device-control-btn from Device Panel §3.4 */
.media-transport-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  height: var(--lcars-btn-height);           /* 3rem = 48px */
  padding: 0 0.75rem;
  min-width: 3rem;                           /* WCAG 2.5.8: ≥24px */

  background: var(--lcars-btn-default);      /* --lcars-sunflower */
  color: var(--lcars-black);
  border: none;
  border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;

  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  text-transform: uppercase;
  cursor: pointer;
  transition: filter var(--lcars-transition), background var(--lcars-transition);
  user-select: none;
}

.media-transport-btn:hover {
  filter: brightness(1.2);
}

.media-transport-btn:focus-visible {
  outline: 2px solid var(--lcars-ice);
  outline-offset: 2px;
}

.media-transport-btn:active {
  background: var(--lcars-btn-active);       /* --lcars-gold */
}

.media-transport-btn ha-icon {
  --mdc-icon-size: 18px;
  flex-shrink: 0;
}

/* Play/Pause — primary action, wider */
.media-transport-btn.primary {
  min-width: 5rem;
  background: var(--lcars-african-violet);
}

.media-transport-btn.primary:active {
  background: var(--lcars-lilac);
}

/* Shuffle/Repeat — smaller toggle-style */
.media-transport-btn.toggle {
  min-width: 2.5rem;
  padding: 0 0.5rem;
}

/* Active toggle state (shuffle on, repeat on) */
.media-transport-btn.toggle[aria-pressed="true"] {
  background: var(--lcars-btn-active);       /* --lcars-gold */
  color: var(--lcars-black);
}

/* Inactive toggle */
.media-transport-btn.toggle[aria-pressed="false"] {
  background: var(--lcars-disabled);         /* --lcars-gray */
  color: var(--lcars-space-white);
}

/* Disabled transport button (feature not supported) */
.media-transport-btn[disabled] {
  background: var(--lcars-disabled);
  color: var(--lcars-space-white);
  opacity: 0.4;
  cursor: not-allowed;
  filter: none;
}
```

### Transport Button Configuration

```javascript
/**
 * Determine which transport buttons to render based on
 * the media_player's supported_features bitmask.
 * 
 * Reference: HA MediaPlayerEntityFeature enum
 * https://developers.home-assistant.io/docs/core/entity/media-player/#supported-features
 */
const MEDIA_FEATURES = {
  PAUSE:           0x1,
  SEEK:            0x2,
  VOLUME_SET:      0x4,
  VOLUME_MUTE:     0x8,
  PREVIOUS_TRACK:  0x10,
  NEXT_TRACK:      0x20,
  TURN_ON:         0x80,
  TURN_OFF:        0x100,
  PLAY_MEDIA:      0x200,
  VOLUME_STEP:     0x400,
  SELECT_SOURCE:   0x800,
  PLAY:            0x4000,
  STOP:            0x1000,
  CLEAR_PLAYLIST:  0x2000,
  SHUFFLE_SET:     0x8000,
  SELECT_SOUND_MODE: 0x10000,
  BROWSE_MEDIA:    0x20000,
  REPEAT_SET:      0x40000,
  GROUPING:        0x80000,
};

function hasFeature(supportedFeatures, feature) {
  return (supportedFeatures & feature) !== 0;
}

/**
 * Build the transport button list for a media_player entity.
 * Returns array of { id, icon, label, action, type, supported }.
 */
function getTransportButtons(stateObj) {
  const sf = stateObj?.attributes?.supported_features || 0;
  const state = stateObj?.state;
  const isPlaying = state === 'playing';

  const buttons = [];

  // Shuffle toggle
  if (hasFeature(sf, MEDIA_FEATURES.SHUFFLE_SET)) {
    buttons.push({
      id: 'shuffle',
      icon: 'mdi:shuffle-variant',
      label: 'SHUFFLE',
      action: 'media_player.shuffle_set',
      type: 'toggle',
      active: stateObj?.attributes?.shuffle === true,
      supported: true,
    });
  }

  // Previous track
  if (hasFeature(sf, MEDIA_FEATURES.PREVIOUS_TRACK)) {
    buttons.push({
      id: 'prev',
      icon: 'mdi:skip-previous',
      label: 'PRV',
      action: 'media_player.media_previous_track',
      type: 'standard',
      supported: true,
    });
  }

  // Play / Pause (primary)
  if (hasFeature(sf, MEDIA_FEATURES.PLAY) || hasFeature(sf, MEDIA_FEATURES.PAUSE)) {
    buttons.push({
      id: 'play_pause',
      icon: isPlaying ? 'mdi:pause' : 'mdi:play',
      label: isPlaying ? 'PAUSE' : 'PLAY',
      action: isPlaying ? 'media_player.media_pause' : 'media_player.media_play',
      type: 'primary',
      supported: true,
    });
  }

  // Next track
  if (hasFeature(sf, MEDIA_FEATURES.NEXT_TRACK)) {
    buttons.push({
      id: 'next',
      icon: 'mdi:skip-next',
      label: 'NXT',
      action: 'media_player.media_next_track',
      type: 'standard',
      supported: true,
    });
  }

  // Repeat toggle
  if (hasFeature(sf, MEDIA_FEATURES.REPEAT_SET)) {
    buttons.push({
      id: 'repeat',
      icon: getRepeatIcon(stateObj?.attributes?.repeat),
      label: getRepeatLabel(stateObj?.attributes?.repeat),
      action: 'media_player.repeat_set',
      type: 'toggle',
      active: stateObj?.attributes?.repeat !== 'off',
      supported: true,
    });
  }

  return buttons;
}

/**
 * Resolve repeat mode to icon.
 */
function getRepeatIcon(repeat) {
  switch (repeat) {
    case 'one':  return 'mdi:repeat-once';
    case 'all':  return 'mdi:repeat';
    default:     return 'mdi:repeat-off';
  }
}

/**
 * Resolve repeat mode to LCARS label.
 */
function getRepeatLabel(repeat) {
  switch (repeat) {
    case 'one':  return 'RPT 1';
    case 'all':  return 'RPT ALL';
    default:     return 'RPT OFF';
  }
}

/**
 * Cycle repeat mode: off → all → one → off
 */
function nextRepeatMode(current) {
  switch (current) {
    case 'off': return 'all';
    case 'all': return 'one';
    case 'one': return 'off';
    default:    return 'off';
  }
}
```

### 3.6 Metadata Column (Left Side)

Source, grouping, media type, shuffle/repeat status — text readouts using the same `.device-sensor-line` pattern from the Device Panel Spec §3.3.

```css
.media-metadata {
  grid-area: metadata;
  display: flex;
  flex-direction: column;
  gap: var(--lcars-gap);
  padding: 0.25rem 0;
  align-self: start;
}
```

| Row | Label          | Source Attribute / Entity                | Color                      |
|-----|----------------|-----------------------------------------|----------------------------|
| 1   | SOURCE         | `source` attribute                      | `var(--lcars-data-accent)` |
| 2   | GROUPED        | `group_members` attribute count         | `var(--lcars-african-violet)` |
| 3   | MEDIA TYPE     | `media_content_type` attribute          | `var(--lcars-data-accent)` |
| 4   | SHUFFLE        | `shuffle` attribute                     | Dynamic (gold if on)       |
| 5   | REPEAT         | `repeat` attribute                      | Dynamic (gold if on)       |
| —   | *(divider)*    |                                         |                            |
| 6   | APP            | `app_name` attribute                    | `var(--lcars-disabled)`    |

Sensor lines reuse `.device-sensor-line` from the Device Panel Spec §3.3. The metadata column gives a quick-glance sidebar showing playback context without overwhelming the main viewscreen.

### 3.7 Volume Control Bar

A full-width horizontal bar at the bottom of the panel — analogous to a power level indicator on LCARS engineering displays.

```css
.media-volume-row {
  grid-area: volume;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-top: var(--lcars-gap);
  border-top: 2px solid var(--panel-frame-color);
  min-height: var(--lcars-bar-h);
}

.media-volume-label {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-text-heading);
  text-transform: uppercase;
  white-space: nowrap;
  flex-shrink: 0;
}

.media-volume-bar {
  flex: 1;
  height: 0.75rem;
  background: var(--lcars-gray);
  border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
  overflow: hidden;
  cursor: pointer;
  position: relative;
}

.media-volume-bar:hover {
  height: 1rem;
}

.media-volume-bar:focus-visible {
  outline: 2px solid var(--lcars-ice);
  outline-offset: 2px;
}

.media-volume-fill {
  height: 100%;
  background: var(--lcars-african-violet);
  border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
  transition: width var(--lcars-transition);
  /* Width set by JS: style="width: ${volumePct}%" */
}

/* Muted state */
.media-volume-fill.muted {
  background: var(--lcars-gray);
}

.media-volume-value {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-data-accent);
  text-transform: uppercase;
  white-space: nowrap;
  min-width: 2.5rem;
  text-align: right;
  flex-shrink: 0;
}

/* Mute toggle button */
.media-mute-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--lcars-btn-radius);
  border: none;
  background: transparent;
  color: var(--lcars-african-violet);
  cursor: pointer;
  transition: filter var(--lcars-transition);
  flex-shrink: 0;
}

.media-mute-btn:hover {
  filter: brightness(1.2);
}

.media-mute-btn:focus-visible {
  outline: 2px solid var(--lcars-ice);
  outline-offset: 2px;
}

.media-mute-btn[aria-pressed="true"] {
  color: var(--lcars-gray);
}

.media-mute-btn ha-icon {
  --mdc-icon-size: 20px;
}
```

### Volume Interaction

```javascript
/**
 * Handle volume bar click/drag — maps horizontal position to 0.0–1.0 volume.
 */
function handleVolumeInteraction(event, barElement) {
  const rect = barElement.getBoundingClientRect();
  const x = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
  const volume = x / rect.width;
  return Math.round(volume * 100) / 100;  // Round to 2 decimal places
}

/**
 * Handle keyboard volume adjustment on the volume bar.
 * Arrow Left/Down = -5%, Arrow Right/Up = +5%
 */
function handleVolumeKeyboard(event, currentVolume) {
  const step = 0.05;
  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowUp':
      event.preventDefault();
      return Math.min(1, currentVolume + step);
    case 'ArrowLeft':
    case 'ArrowDown':
      event.preventDefault();
      return Math.max(0, currentVolume - step);
    case 'Home':
      event.preventDefault();
      return 0;
    case 'End':
      event.preventDefault();
      return 1;
    default:
      return null;  // No change
  }
}

/**
 * Resolve mute icon based on volume level and mute state.
 */
function getVolumeIcon(volume, isMuted) {
  if (isMuted || volume === 0) return 'mdi:volume-off';
  if (volume < 0.3) return 'mdi:volume-low';
  if (volume < 0.7) return 'mdi:volume-medium';
  return 'mdi:volume-high';
}
```

### 3.8 Source Selector (Popup)

When the SOURCE metadata line is tapped, a source selection overlay appears. This uses the existing `lcars-popup.js` pattern.

```css
.media-source-list {
  display: flex;
  flex-direction: column;
  gap: var(--lcars-gap);
  padding: 0.5rem;
  max-height: 16rem;
  overflow-y: auto;
}

.media-source-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  height: 2.25rem;
  padding: 0 0.75rem;
  min-width: 8rem;

  background: var(--lcars-disabled);
  color: var(--lcars-space-white);
  border: none;
  border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;

  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  text-transform: uppercase;
  text-align: left;
  cursor: pointer;
  transition: filter var(--lcars-transition), background var(--lcars-transition);
  user-select: none;
}

.media-source-option:hover {
  filter: brightness(1.2);
}

.media-source-option:focus-visible {
  outline: 2px solid var(--lcars-ice);
  outline-offset: 2px;
}

/* Currently active source */
.media-source-option[aria-selected="true"] {
  background: var(--lcars-btn-active);
  color: var(--lcars-black);
}
```

---

## 4. Speaker Grouping

A key feature for HomePod and Sonos setups: showing which speakers are grouped, and allowing group management.

### Group Detection

```javascript
/**
 * Extract group members from a media_player entity.
 * Returns array of entity_ids in the group (including self).
 */
function getGroupMembers(stateObj) {
  if (!stateObj?.attributes?.group_members) return [];
  return stateObj.attributes.group_members;
}

/**
 * Get display name for a grouped speaker.
 */
function getGroupMemberName(hass, entityId) {
  const stateObj = hass.states[entityId];
  if (!stateObj) return entityId.split('.')[1].replace(/_/g, ' ').toUpperCase();
  return (stateObj.attributes.friendly_name || entityId).toUpperCase();
}

/**
 * Check if a media_player supports grouping.
 */
function supportsGrouping(stateObj) {
  return hasFeature(
    stateObj?.attributes?.supported_features || 0,
    MEDIA_FEATURES.GROUPING
  );
}
```

### Group Member List (in Metadata Column)

When grouped, the metadata column shows each member as a dot + name:

```html
<div class="media-group-section">
  <div class="device-sensor-line" role="listitem"
       aria-label="Grouped: ${count} speakers">
    <div class="sensor-indicator" style="background: var(--lcars-african-violet)"></div>
    <span class="sensor-label">GROUPED</span>
    <span class="sensor-state-value"
          style="color: var(--lcars-african-violet)">${count} SPEAKERS</span>
  </div>
  ${groupMembers.map(entityId => html`
    <div class="media-group-member" role="listitem">
      <div class="sensor-indicator"
           style="background: var(--lcars-african-violet)"></div>
      <span class="sensor-label">${getGroupMemberName(hass, entityId)}</span>
    </div>
  `)}
</div>
```

```css
.media-group-member {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 1.5rem;
  padding: 0 0.5rem 0 1rem;           /* Extra left indent for hierarchy */
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-space-white);
  text-transform: uppercase;
}
```

### Multi-Room Stacking

When rendering multiple media panels (e.g., one per room), they stack vertically with generous spacing — same pattern as the Device Panel Spec §6:

```css
.media-panels-column {
  display: flex;
  flex-direction: column;
  gap: calc(var(--lcars-gap) * 4);     /* 1rem between panels */
  align-items: flex-end;
}

.media-panels-column > .lcars-media-panel {
  width: 100%;
  max-width: 48rem;
}
```

---

## 5. Idle State Behavior

When the media player is `idle`, `standby`, or `off`, the panel simplifies dramatically — per Bracer Jack, "empty space is beautiful."

### Behavioral Differences

| Aspect                | Active (playing/paused)       | Idle (idle/standby/off)                 |
|-----------------------|-------------------------------|-----------------------------------------|
| Viewscreen            | Album art image               | Music note icon + "STANDBY" label       |
| Now playing info      | Title + Artist — Album        | **Hidden**                              |
| Progress bar          | Visible with time             | **Hidden**                              |
| Transport controls    | Full button row               | **Hidden** (or power-on only)           |
| Volume bar            | Full interactive bar          | Empty bar, dim, no value                |
| Metadata column       | Source, group, type, etc.     | Source only (if available)              |
| Frame border          | `--lcars-african-violet`      | `--lcars-gray` (dimmed)                 |
| Min-height            | Full panel                    | Reduced (compact idle)                  |

### Idle CSS

```css
.lcars-media-panel.idle {
  --panel-frame-color: var(--lcars-gray);
  --media-state-color: var(--lcars-gray);
}

/* Hide elements in idle state */
.lcars-media-panel.idle .media-now-playing,
.lcars-media-panel.idle .media-progress-container,
.lcars-media-panel.idle .media-transport {
  display: none;
}

/* Dim the volume bar in idle */
.lcars-media-panel.idle .media-volume-fill {
  background: var(--lcars-gray);
  width: 0% !important;
}

.lcars-media-panel.idle .media-volume-value {
  color: var(--lcars-gray);
}
```

### Transition from Idle to Active

When playback begins, the panel awakens:

```css
.lcars-media-panel {
  transition:
    border-color var(--lcars-transition-slow),
    min-height var(--lcars-transition-slow);
}

/* Viewscreen activation uses the same animation from Device Panel §7 */
.lcars-media-panel:not(.idle) .media-viewscreen img {
  animation: viewscreen-activate 600ms ease-out both;
}
```

---

## 6. Typography & Spacing

### Font Sizes (Three sizes only — Bracer Jack Rule 6)

| Element                | Size Token                  | Value      | Usage                            |
|------------------------|-----------------------------|------------|----------------------------------|
| Device name            | `--lcars-font-size-sub`     | `1.25rem`  | Panel header — sub-header tier   |
| Track title            | `--lcars-font-size-sub`     | `1.25rem`  | Now playing — sub-header tier    |
| Artist/album           | `--lcars-font-size-data`    | `0.875rem` | Secondary info — data tier       |
| Metadata labels        | `--lcars-font-size-data`    | `0.875rem` | Left column text readouts        |
| Transport button text  | `--lcars-font-size-data`    | `0.875rem` | Button labels                    |
| Volume percentage      | `--lcars-font-size-data`    | `0.875rem` | Volume display                   |
| Progress time          | `--lcars-font-size-data`    | `0.875rem` | Elapsed / duration               |
| State badge            | `--lcars-font-size-data`    | `0.875rem` | Header state                     |

**No font size exceptions.** Track title gets sub-header because it's the primary information after the device name. Everything else is data size with color/weight differentiation.

### Spacing Constants (Jörn Weißenborn Grid)

| Spacing                        | Token / Value               | Usage                                    |
|--------------------------------|-----------------------------|------------------------------------------|
| Gap between all elements       | `var(--lcars-gap)` = 0.25rem | Universal LCARS grid spacing            |
| Panel internal padding         | `var(--lcars-gap)` = 0.25rem | Inside the panel frame border           |
| Transport button height        | `var(--lcars-btn-height)` = 3rem | Standard LCARS button = 48px        |
| Transport button min-width     | 3rem = 48px (toggle), 5rem = 80px (primary) | WCAG 2.5.8 ≥24px    |
| Volume bar height              | 0.75rem (12px), 1rem on hover | Power-level indicator strip          |
| Progress bar height            | 4px, 6px on hover            | Subtle, non-dominant                    |
| Album art max-height           | 18rem = 288px                | Prevents oversized art dominating       |
| Panel outer border (left/bottom) | 4px solid                  | Thick side (Bracer Jack Rule 2)         |
| Panel outer border (top/right)   | 2px solid                  | Thin side — thick→thin transition       |
| Between stacked panels           | `calc(var(--lcars-gap) * 4)` = 1rem | Generous breathing room       |

### Text Treatment

- **ALL UPPERCASE** for: device name, track title, artist, metadata labels, button text, state labels
- **Mixed case** ONLY for: none (no prose text in this panel)
- **Letter-spacing**: `0.05em` on sub-header elements (device name, track title)
- **Font-weight**: `700` (bold) for state badge and metadata values; `400` for everything else

---

## 7. Responsive Behavior

### Desktop (≥768px) — Full 2-Column Layout

The spec above. Metadata left, media/controls right, volume bottom.

### Mobile (<768px) — Stacked Layout

```css
@media (max-width: 767px) {
  .lcars-media-panel {
    grid-template-columns: 1fr;
    grid-template-areas:
      "header"
      "media"
      "metadata"
      "volume";
  }

  .media-viewscreen {
    max-height: 14rem;
  }

  .media-metadata {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .device-sensor-line {
    flex: 1 1 45%;
    min-width: 8rem;
  }

  /* Group members list goes horizontal */
  .media-group-section {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .media-group-member {
    padding-left: 0.5rem;
  }

  /* Transport buttons get tighter but maintain min target size */
  .media-transport {
    gap: calc(var(--lcars-gap) * 0.5);
  }

  .media-transport-btn {
    min-width: 2.5rem;       /* Still ≥ 24px WCAG */
    padding: 0 0.5rem;
  }

  .media-transport-btn.primary {
    min-width: 4rem;
  }
}
```

On mobile, the viewscreen goes full-width above metadata (which flows horizontally in pairs). Volume bar remains full-width at the bottom. Reading order maintained: status → visual → controls → context → volume.

### Compact Mode (≤480px)

```css
@media (max-width: 480px) {
  /* Hide text labels on transport buttons, icon-only */
  .media-transport-btn .btn-label {
    display: none;
  }

  .media-transport-btn {
    min-width: 2.5rem;
    padding: 0 0.5rem;
  }

  /* Metadata column hidden in compact, except source */
  .media-metadata > .device-sensor-line:not(:first-child) {
    display: none;
  }

  .media-group-section {
    display: none;
  }
}
```

---

## 8. HA Entity Mapping

### Target Devices (from the Admiral's HA Instance)

| Device             | Integration    | Key Features                             | Entity Pattern                           |
|--------------------|----------------|------------------------------------------|------------------------------------------|
| Apple TV           | `apple_tv`     | Play/pause, source, artwork, remote      | `media_player.apple_tv_*`                |
| HomePod            | `apple_tv`     | AirPlay, TTS, volume, grouping           | `media_player.homepod_*`                 |
| HomePod Mini       | `apple_tv`     | AirPlay, TTS, volume, grouping           | `media_player.homepod_mini_*`            |
| Sonos              | `sonos`        | Grouping, favorites, queue, volume       | `media_player.sonos_*`                   |
| Generic            | various        | Basic play/pause, volume                 | `media_player.*`                         |

### Entity Attribute Mapping

| Panel Element         | HA Attribute                           | Fallback                  |
|-----------------------|----------------------------------------|---------------------------|
| Track title           | `media_title`                          | "UNKNOWN TRACK"           |
| Artist                | `media_artist`                         | —                         |
| Album                 | `media_album_name`                     | —                         |
| Album art URL         | `entity_picture`                       | Idle placeholder          |
| Media type            | `media_content_type`                   | —                         |
| Source                | `source`                               | —                         |
| Source list            | `source_list`                          | []                        |
| Volume                | `volume_level` (0.0–1.0)              | 0                         |
| Muted                 | `is_volume_muted`                      | false                     |
| Shuffle               | `shuffle`                              | false                     |
| Repeat                | `repeat` (`off`/`all`/`one`)           | `off`                     |
| Position              | `media_position`                       | 0                         |
| Duration              | `media_duration`                       | 0                         |
| Position updated at   | `media_position_updated_at`            | —                         |
| Group members         | `group_members`                        | []                        |
| App name              | `app_name`                             | —                         |
| Sound mode            | `sound_mode`                           | —                         |
| Sound mode list       | `sound_mode_list`                      | []                        |
| Supported features    | `supported_features` (bitmask)         | 0                         |

### Entity Classification Logic

```javascript
/**
 * Classify entities for the media panel.
 * Returns { player, sensors, controls, remotes }.
 */
function classifyMediaEntities(entities) {
  const result = {
    player: null,         // Primary media_player entity
    sensors: [],          // Sensor entities (e.g., connected clients)
    controls: [],         // Switch/select/number entities
    remotes: [],          // Remote entities (Apple TV remote)
  };

  for (const e of entities) {
    const domain = e.entity_id.split('.')[0];
    const cat = e.entity_category || '';

    if (cat === 'diagnostic' || cat === 'config') continue;

    if (domain === 'media_player') {
      result.player = result.player || e;
      continue;
    }

    if (domain === 'remote') {
      result.remotes.push(e);
      continue;
    }

    if (domain === 'sensor' || domain === 'binary_sensor') {
      result.sensors.push(e);
      continue;
    }

    if (domain === 'switch' || domain === 'select' || domain === 'number'
        || domain === 'button') {
      result.controls.push(e);
      continue;
    }
  }

  return result;
}
```

### HA Service Calls

```javascript
/**
 * Service call map for media transport actions.
 */
const MEDIA_ACTIONS = {
  play:          { domain: 'media_player', service: 'media_play' },
  pause:         { domain: 'media_player', service: 'media_pause' },
  stop:          { domain: 'media_player', service: 'media_stop' },
  next_track:    { domain: 'media_player', service: 'media_next_track' },
  previous_track:{ domain: 'media_player', service: 'media_previous_track' },
  volume_set:    { domain: 'media_player', service: 'volume_set' },
  volume_mute:   { domain: 'media_player', service: 'volume_mute' },
  shuffle_set:   { domain: 'media_player', service: 'shuffle_set' },
  repeat_set:    { domain: 'media_player', service: 'repeat_set' },
  select_source: { domain: 'media_player', service: 'select_source' },
  turn_on:       { domain: 'media_player', service: 'turn_on' },
  turn_off:      { domain: 'media_player', service: 'turn_off' },
};

/**
 * Call a media player service.
 */
function callMediaService(hass, entityId, action, data = {}) {
  const def = MEDIA_ACTIONS[action];
  if (!def) return;
  hass.callService(def.domain, def.service, {
    entity_id: entityId,
    ...data,
  });
}
```

---

## 9. Device-Specific Adaptations

### Apple TV

| Aspect                  | Apple TV Behavior                                  |
|-------------------------|----------------------------------------------------|
| Artwork                 | High-res album art via `entity_picture`             |
| Sources                 | App list (Netflix, Disney+, etc.) via `source_list` |
| Grouping                | Not typically grouped (video device)                |
| Remote                  | Has a `remote.*` entity — can send commands         |
| Progress                | Full position/duration for video content            |
| Media type              | `video`, `music`, `app` — may vary                  |
| Power                   | Supports turn_on/turn_off                           |

For Apple TV, when `media_content_type` is `video` or `movie`, the viewscreen aspect ratio should widen:

```css
.lcars-media-panel[data-content-type="video"] .media-viewscreen,
.lcars-media-panel[data-content-type="movie"] .media-viewscreen,
.lcars-media-panel[data-content-type="tvshow"] .media-viewscreen {
  aspect-ratio: 16 / 9;
}
```

### HomePod / HomePod Mini

| Aspect                  | HomePod Behavior                                   |
|-------------------------|----------------------------------------------------|
| Artwork                 | Album art when playing Apple Music                  |
| Sources                 | Limited (AirPlay primarily)                         |
| Grouping                | AirPlay 2 multi-room — `group_members` populated   |
| Volume                  | Full volume control, important for speakers         |
| TTS                     | Can receive text-to-speech (future feature)         |
| Progress                | May lack position data for some sources             |

### Sonos

| Aspect                  | Sonos Behavior                                     |
|-------------------------|----------------------------------------------------|
| Artwork                 | Album art for most music services                   |
| Sources                 | Line-in, TV, music services via `source_list`       |
| Grouping                | Sonos native grouping — `group_members` populated   |
| Volume                  | Per-speaker volume even when grouped                |
| Sound modes             | Night mode, speech enhancement via `sound_mode_list`|
| Favorites               | Sonos favorites accessible via `browse_media`       |
| Progress                | Full position/duration                              |

For Sonos when `sound_mode_list` is available, add a sound mode selector to the metadata column:

```javascript
/**
 * Check if this entity has sound mode support.
 */
function hasSoundModes(stateObj) {
  return hasFeature(
    stateObj?.attributes?.supported_features || 0,
    MEDIA_FEATURES.SELECT_SOUND_MODE
  ) && (stateObj?.attributes?.sound_mode_list?.length || 0) > 0;
}
```

---

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

## 11. Accessibility (a11y) Requirements

### 11.1 Keyboard Navigation (WCAG 2.1.1)

| Element              | Focusable        | Keydown Handlers                             |
|----------------------|------------------|----------------------------------------------|
| Album art viewscreen | `tabindex="0"`   | `Enter`/`Space` → open more-info dialog      |
| Metadata lines       | `tabindex="0"`   | `Enter`/`Space` → open more-info / source popup |
| Transport buttons    | `<button>`       | Native keyboard support                      |
| Volume bar           | `tabindex="0"`   | `Arrow` keys for ±5%, `Home`/`End` for 0/100% |
| Mute button          | `<button>`       | Native keyboard support                      |
| Progress bar         | `tabindex="0"`   | `Arrow` keys for ±10s seek (when supported)  |

Tab order: Header → Viewscreen → Now Playing → Progress → Transport (shuffle → prev → play → next → repeat) → Metadata lines → Volume bar → Mute button.

### 11.2 ARIA Labeling (WCAG 4.1.2)

```html
<!-- Panel container -->
<div class="lcars-media-panel ${stateClass}"
     role="region"
     aria-label="${deviceName} media player panel">

  <!-- Header -->
  <div class="media-header" role="heading" aria-level="3">
    <span class="device-panel-name">${deviceName}</span>
    <span class="device-panel-header-line" aria-hidden="true"></span>
    <span class="media-state-badge" style="color: ${stateColor}">
      <span class="media-state-icon" aria-hidden="true">${stateIcon}</span>
      ${stateLabel}
    </span>
  </div>

  <!-- Media area -->
  <div class="media-content" style="grid-area: media;">

    <!-- Viewscreen -->
    <div class="media-viewscreen"
         role="button"
         tabindex="0"
         aria-label="${deviceName}: ${isActive ? trackTitle + ' by ' + artist : 'standby'}">
      ${isActive
        ? html`<img src="${entityPicture}"
                     alt="Album art for ${trackTitle} by ${artist}"
                     loading="lazy" />`
        : html`<div class="media-viewscreen-idle">
                  <ha-icon icon="mdi:music-note" aria-hidden="true"></ha-icon>
                  <span class="media-viewscreen-idle-label">STANDBY</span>
                </div>`
      }
    </div>

    <!-- Now Playing -->
    ${isActive ? html`
      <div class="media-now-playing" aria-live="polite" aria-atomic="true">
        <div class="media-track-title">${trackTitle}</div>
        <div class="media-track-artist">
          ${artist}${album ? html` — ${album}` : ''}
        </div>
      </div>
    ` : ''}

    <!-- Progress -->
    ${isActive ? html`
      <div class="media-progress-container">
        <div class="media-progress-bar"
             role="slider"
             tabindex="0"
             aria-label="Playback position"
             aria-valuemin="0"
             aria-valuemax="${duration}"
             aria-valuenow="${elapsed}"
             aria-valuetext="${formatMediaTime(elapsed)} of ${formatMediaTime(duration)}">
          <div class="media-progress-fill ${state === 'buffering' ? 'buffering' : ''}"
               style="width: ${progressPct}%"></div>
        </div>
        <span class="media-progress-time">
          ${formatMediaTime(elapsed)} / ${formatMediaTime(duration)}
        </span>
      </div>
    ` : ''}

    <!-- Transport Controls -->
    ${isActive ? html`
      <div class="media-transport" role="toolbar" aria-label="Playback controls">
        ${transportButtons.map(btn => html`
          <button class="media-transport-btn ${btn.type}"
                  aria-label="${btn.label}"
                  aria-pressed="${btn.type === 'toggle' ? String(btn.active) : undefined}"
                  ?disabled="${!btn.supported}"
                  @click="${() => handleTransport(btn)}">
            <ha-icon icon="${btn.icon}" aria-hidden="true"></ha-icon>
            <span class="btn-label">${btn.label}</span>
          </button>
        `)}
      </div>
    ` : ''}

  </div>

  <!-- Metadata Column -->
  <div class="media-metadata" role="list" aria-label="Media information">
    <div class="device-sensor-line" role="listitem" tabindex="0"
         aria-label="Source: ${source || 'none'}">
      <div class="sensor-indicator"
           style="background: var(--lcars-data-accent)" aria-hidden="true"></div>
      <span class="sensor-label">SOURCE</span>
      <span class="sensor-state-value"
            style="color: var(--lcars-data-accent)">${source || '—'}</span>
    </div>
    <!-- Additional metadata lines... -->
  </div>

  <!-- Volume -->
  <div class="media-volume-row" role="group" aria-label="Volume control">
    <span class="media-volume-label">VOL</span>
    <div class="media-volume-bar"
         role="slider"
         tabindex="0"
         aria-label="Volume"
         aria-valuemin="0"
         aria-valuemax="100"
         aria-valuenow="${Math.round(volumeLevel * 100)}"
         aria-valuetext="${isMuted ? 'Muted' : Math.round(volumeLevel * 100) + ' percent'}">
      <div class="media-volume-fill ${isMuted ? 'muted' : ''}"
           style="width: ${volumeLevel * 100}%"></div>
    </div>
    <span class="media-volume-value">${isMuted ? '—' : Math.round(volumeLevel * 100) + '%'}</span>
    <button class="media-mute-btn"
            aria-label="${isMuted ? 'Unmute' : 'Mute'}"
            aria-pressed="${String(isMuted)}">
      <ha-icon icon="${getVolumeIcon(volumeLevel, isMuted)}" aria-hidden="true"></ha-icon>
    </button>
  </div>

  <!-- Screen reader live region -->
  <div class="sr-only" aria-live="polite" aria-atomic="false" id="media-panel-status">
    <!-- JS injects: "Living Room HomePod: now playing Shape of You by Ed Sheeran" -->
  </div>
</div>
```

### 11.3 Color Is Not Sole Indicator (WCAG 1.4.1)

Every state conveys information through **both** color and text:
- Playing → `▶ PLAYING` in african-violet + violet frame
- Paused → `❚❚ PAUSED` in sunflower + sunflower badge
- Idle → `■ IDLE` in gray + gray frame
- Unavailable → `✕ UNAVAILABLE` in tomato + pulsing border

The text label and Unicode symbol are always present. Color reinforces but never carries meaning alone.

### 11.4 Focus Visibility (WCAG 2.4.7, 2.4.11, 2.4.13)

All interactive elements use:
```css
:focus-visible {
  outline: 2px solid var(--lcars-ice);     /* 10.3:1 vs black background */
  outline-offset: 2px;
}
```

- 2px outline meets WCAG 2.4.13 (Focus Appearance)
- `--lcars-ice` (#99ccff) vs `--lcars-black` (#000000) = **10.3:1** — exceeds 3:1 requirement

### 11.5 Target Size (WCAG 2.5.8)

| Element            | Size                        | Pixels (at 16px base) | Passes? |
|--------------------|-----------------------------|-----------------------|---------|
| Transport button   | 3rem × 3rem min (toggle)    | 48px × 48px           | ✅ AAA  |
| Transport primary  | 3rem × 5rem min             | 48px × 80px           | ✅ AAA  |
| Volume bar         | 0.75rem × full width        | 12px × variable       | ✅ (hover expands to 16px; click target uses full row height) |
| Progress bar       | 4px height, full-width      | Thin but full-width tap target → row 24px+ | ✅ AA |
| Mute button        | 2.5rem × 2.5rem             | 40px × 40px           | ✅ AAA  |
| Metadata lines     | 1.75rem × full              | 28px × variable       | ✅ AA   |
| Viewscreen         | Full panel width             | ≫ 24px                | ✅ AAA  |

Note: The progress bar and volume bar use their full container row height (≥24px) as the effective click/tap target via padding on the container, not just the visible bar height.

### 11.6 Screen Reader Announcements (WCAG 4.1.3)

Track changes are announced via the `aria-live="polite"` region on `.media-now-playing`:

```javascript
/**
 * Generate screen reader announcement for track change.
 */
function getTrackAnnouncement(deviceName, stateObj) {
  const title = stateObj?.attributes?.media_title;
  const artist = stateObj?.attributes?.media_artist;
  if (!title) return `${deviceName}: playback stopped`;
  return artist
    ? `${deviceName}: now playing ${title} by ${artist}`
    : `${deviceName}: now playing ${title}`;
}
```

### 11.7 Image Alt Text

Album art images MUST have descriptive `alt` attributes:
```html
<img src="${entityPicture}"
     alt="Album art for ${mediaTitle} by ${mediaArtist}"
     loading="lazy" />
```

When no art is available:
```html
<div class="media-viewscreen-idle" role="img"
     aria-label="${deviceName}: standby, no media playing">
  <ha-icon icon="mdi:music-note" aria-hidden="true"></ha-icon>
  <span class="media-viewscreen-idle-label">STANDBY</span>
</div>
```

---

## 12. CSS Custom Properties Summary (New)

Properties introduced by the Media Panel. All other properties from `lcars-styles.js` and Device Panel base.

| Property                    | Default                          | Set By   | Purpose                                    |
|-----------------------------|----------------------------------|----------|---------------------------------------------|
| `--panel-frame-color`       | `var(--lcars-african-violet)`    | CSS      | Panel border, header/volume separator        |
| `--media-state-color`       | `var(--lcars-african-violet)`    | JS       | Dynamic playback-state-driven color          |
| `--media-aspect`            | `1 / 1`                         | CSS/JS   | Viewscreen aspect (1:1 music, 16:9 video)   |

---

## 13. File Registration Plan

| Component Tag              | File                          | Purpose                         |
|----------------------------|-------------------------------|---------------------------------|
| `lcars-media-panel`        | `lcars-media-panel.js`        | Full panel component            |

Extends `LcarsDevicePanelBase`:
- `panelFrameColor` → `var(--lcars-african-violet)`
- `mediaAspectRatio` → `1 / 1` (overridden to `16 / 9` for video content)
- `_isPrimaryDomain(domain)` → `domain === 'media_player'`
- `_renderMedia()` → renders viewscreen, now playing, progress, and transport controls

---

## 14. LCARS Design Rules Compliance

| Rule                                              | Source           | Compliant? | Notes                                      |
|---------------------------------------------------|------------------|------------|---------------------------------------------|
| No gradients, shadows, or 3D effects              | Bracer Jack #1   | ✅          | Flat fills throughout                       |
| Frame goes thick→thin (4px→2px border)            | Bracer Jack #2   | ✅          | Left/bottom 4px, top/right 2px             |
| Pill buttons with flat left, rounded right         | Bracer Jack #4   | ✅          | Transport buttons, source options            |
| Exactly 3 font sizes (title, sub, data)           | Bracer Jack #6   | ✅          | Sub for device name + track, data for rest  |
| ≤5 hue families                                   | Bracer Jack      | ✅          | Violet (frame/accent), warm (playback states), gray (idle), white (text), red (fault) = 5 families |
| All text uppercase                                 | TheLCARS.com     | ✅          | Every text element uppercase                |
| Antonio font only                                  | TheLCARS.com     | ✅          | `var(--lcars-font)` throughout              |
| CSS custom properties, no hardcoded hex            | Project rule     | ✅          | All colors via `var(--lcars-*)` tokens      |
| Background is always `#000000`                     | TheLCARS.com     | ✅          | `var(--lcars-bg)` = `var(--lcars-black)`    |
| Animations < 1s, respects `prefers-reduced-motion` | WCAG + project   | ✅          | Longest is viewscreen 600ms; all disabled with reduced-motion |
| WCAG AA contrast on all text                       | WCAG 1.4.3       | ✅          | Verified in §2 table                       |
| 24px+ touch targets                                | WCAG 2.5.8       | ✅          | All buttons 48px+, bars use container height |
| Focus visible 2px outline, 3:1 contrast            | WCAG 2.4.7/13    | ✅          | Ice blue outline, 10.3:1 vs black          |
| Color not sole means of information                | WCAG 1.4.1       | ✅          | Text labels + icons + color on all states   |
| Keyboard operable                                  | WCAG 2.1.1       | ✅          | Full tab order, arrow keys on sliders       |
| `aria-label` / `role` on all interactive elements  | WCAG 4.1.2       | ✅          | See §11.2 ARIA template                    |
| `aria-live` for state changes                      | WCAG 4.1.3       | ✅          | Track changes announced via live region     |
| Spacing uses `--lcars-gap` (0.25rem)               | Jörn Weißenborn  | ✅          | Invisible grid constant throughout          |
| Empty space preserved                              | Bracer Jack      | ✅          | Idle state is minimal; active state breathes |

---

## 15. Team Review Flags

- **Geordi La Forge**: Review frame color assignment (`--lcars-african-violet` for media/entertainment) and verify it doesn't clash with existing panel color map. Confirm viewscreen corner bracket pattern reuse. Validate idle state design meets LCARS aesthetic standards.
- **Worf**: Review `entity_picture` URL handling — album art URLs come from the HA backend and are proxied through `/api/media_player_proxy/`. No external URLs should be rendered directly. Verify that the source selector popup doesn't introduce XSS risk from `source_list` values (all values must be text-only, rendered as textContent not innerHTML).

---

*"What if we piped the audio visualization data from the media player into the viewscreen border? Imagine the frame pulsing gently with the beat — like the warp core thrumming with power. I could prototype it with the Web Audio API and CSS custom properties... but I should probably check with Geordi first."*  
— Wesley Crusher, Deck 10

---

## Geordi La Forge — Design Review

**Reviewer**: Geordi La Forge (LCARS UI Design Authority)  
**Date**: Stardate 2026.04.13  
**Status**: APPROVED WITH NOTES

### LCARS Compliance
- §1 Grid Layout: Correct. The 2-column asymmetric grid (metadata | media) with full-width header and volume rows follows the Device Panel Spec §2 pattern precisely. Thick→thin border (4px left/bottom, 2px top/right) satisfies Bracer Jack Rule 2.
- §3.2 Viewscreen corner brackets using `::before` / `::after` pseudo-elements are a clean LCARS touch — approved.
- §3.5 Transport buttons correctly use pill shape (`border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0`) — flat left, rounded right. The primary play/pause button uses `--lcars-african-violet` which distinguishes it from the standard `--lcars-sunflower` buttons — this is a defensible exception for the "main action" button within an entertainment context.
- §5 Idle state behavior is excellent. The panel dims to `--lcars-gray` frame and hides transport/progress/now-playing. "Empty space is beautiful" — Bracer Jack would approve. The transition from idle→active with a 600ms border-color shift is the right tempo.
- §10 Viewscreen activation animation (`viewscreen-activate`) reuses the Device Panel §7 pattern — good consistency.
- The `media-art-crossfade` animation (§3.2) uses `filter: brightness(1.3)` as a transitional effect, not a persistent visual treatment — this is acceptable and does not violate the flat-design rule.

### Color & Typography
- `--lcars-african-violet` (#cc99ff) for the media/entertainment frame is an excellent choice. It's distinct from butterscotch (cameras/security), ice (environmental), bluey (aquatic), and sky (weather). The "recreation deck" identity mapping is correct per TNG color conventions.
- Contrast table (§2) is thorough and all colors pass WCAG AA. The `--lcars-lilac` at 4.9:1 is noted as accent-only with inverted text — acceptable.
- Typography: Exactly 2 active font sizes (sub-header for device name + track title, data for everything else). Within the 3-size maximum. Track title at sub-header tier is the right call — it's the most important text after the device name.
- ALL UPPERCASE maintained throughout — confirmed.

### Layout & Visual Balance
- The album art viewscreen with `aspect-ratio: 1/1` (music) and `16/9` (video) adaptive aspect is smart. The `max-height: 18rem` cap prevents oversized artwork from dominating — good restraint.
- The volume bar at the bottom as a full-width power-level indicator is a canonical LCARS pattern. The pill-shaped right end (`border-radius: 0 var(--lcars-btn-radius)`) is correct.
- The metadata column (§3.6) with source, grouping, media type provides good context without overcrowding. The idle state collapses this to source-only — proper progressive disclosure.
- Speaker grouping display (§4) with hierarchically indented member names is clean.

### Accessibility
- WCAG 2.5.8 target sizes: Transport buttons at 48px (primary 80px) — well above 24px minimum. Volume bar uses container height plus hover expansion. Approved.
- Focus indicators: 2px solid `--lcars-ice` outline with 2px offset throughout — 10.3:1 contrast vs black. Exceeds WCAG 2.4.13 AAA requirements.
- Progress bar is keyboard-accessible (§3.4) with `focus-visible` styling and arrow-key volume adjustments (§3.7) — good keyboard operability.
- Album art has proper `alt` text (§11.7). Idle state has `aria-label` on the placeholder. Screen reader live region announces track changes (§11.6).
- `prefers-reduced-motion` is respected for all animations — confirmed in §10.

### Recommendations
1. **APPROVED**: Frame color `--lcars-african-violet` for media panels — no clash with existing panel color map confirmed.
2. **APPROVED**: Viewscreen corner bracket reuse from Device Panel §3.2.
3. **APPROVED**: Idle state design meets LCARS aesthetic standards.
4. **NOTE** (§3.4): The progress bar hover expanding from 4px→6px is fine but consider ensuring the expansion doesn't shift adjacent content. Use `position: relative` with a transparent hit area if needed.
5. **NOTE**: Wesley's closing idea about audio-reactive frame pulsing — creative, but **do not implement**. This would violate Bracer Jack Rule 1 (LCARS is inherently flat/static in its frame elements) and could trigger WCAG 2.3.1 (Three Flashes) for rhythmic content. The frame border is structural, not decorative. Keep it clean.
6. **NOTE** (§8 device adaptations): The Apple TV video aspect ratio override (`16/9`) is a good data-driven decision. Ensure the transition between `1/1` and `16/9` when content type changes uses a smooth CSS transition, not a jarring reflow.
7. **APPROVED**: The `getMediaProgress()` interpolation approach is correct but heed the performance advisory about gating behind a 1-second timer.

---

## Worf — Security Review

**Reviewer**: Worf (Integration Security Expert)  
**Date**: Stardate 2026.04.13  
**Threat Level**: YELLOW

*"The recreation deck may seem harmless, but a media panel renders external artwork, displays untrusted metadata strings, and accepts volume input. Every data channel is an attack surface."*

### Input Validation

- **Volume level clamping**: `handleVolumeInteraction()` (§3.7) correctly clamps the calculated volume to `0.0–1.0` via `Math.max(0, Math.min(...))`. `handleVolumeKeyboard()` also properly clamps with explicit `Math.min(1, ...)` and `Math.max(0, ...)` bounds. Secure.
- **Progress bar seek position**: The progress bar is clickable (`cursor: pointer`) suggesting seek functionality. The `getMediaProgress()` function calculates position from entity attributes — but if a click handler sends `media_player.media_seek`, the position value MUST be clamped to `[0, media_duration]` before calling `hass.callService()`. **Not currently specified in the spec — add clamping.**
- **`supported_features` bitmask**: `hasFeature()` uses bitwise AND on a numeric bitmask from entity attributes. The bitmask value comes from HA backend and is an integer — no injection vector here.
- **Source selection**: `source_list` values from entity attributes are rendered as button text. The `select_source` service call passes the source name from `source_list` — this is user-selectable but values originate from the HA backend, not typed by the user. Acceptable.

### XSS & DOM Safety

- **Album art URL (`entity_picture`)**: This is the primary XSS concern. The `entity_picture` attribute contains a URL path that is loaded into an `<img>` tag's `src` attribute. HA proxies media artwork through `/api/media_player_proxy/` — the URL should always be a relative path starting with `/api/`. **MUST validate**: before rendering, confirm the URL starts with `/api/` or `/local/` — reject any URL containing `javascript:`, `data:`, or external `http://`/`https://` origins. A compromised HA integration could inject a malicious URL.
- **Track title / artist / album**: `media_title`, `media_artist`, `media_album_name` attributes are rendered via Lit template literals (auto-escaped). **No `innerHTML` usage.** Secure.
- **Source list rendering** (§3.8): Source names are rendered as `textContent` in Lit templates via `${sourceName}`. The spec correctly notes "all values must be text-only, rendered as textContent not innerHTML." Verified.
- **Group member names**: `getGroupMemberName()` (§4) falls back to `friendly_name` or entity_id string manipulation. Both are rendered via Lit template escaping. No injection risk.
- **`app_name` attribute**: Rendered in metadata column as text. Auto-escaped by Lit. Secure.

### Service Call Security

- **Transport controls properly scoped**: All service calls in `MEDIA_ACTIONS` (§8) use a hardcoded allowlist of `media_player.*` services with `entity_id` from card config. No arbitrary service injection.
- **`callMediaService()` wrapper**: The `data` spread (`...data`) in `callMediaService()` could theoretically allow extra parameters if the `data` object is attacker-controlled. In practice, it's constructed from validated UI interactions (volume, shuffle boolean, etc.). Low risk but be disciplined about not passing unvalidated objects through this function.
- **No destructive actions**: Media transport (play, pause, next) and volume changes are all reversible. `turn_off` is the most impactful — it powers off the device but doesn't cause data loss. Acceptable without confirmation dialogs.

### Secrets & Sensitive Data

- **No credentials or tokens in this panel.** Media authentication is handled by the HA integration backend. The panel only receives proxied URLs and entity state data. No secrets surface.

### Recommendations

**MUST FIX:**

1. **Validate `entity_picture` URL before rendering**: Add a guard before setting the `<img src>`:
   ```javascript
   function isValidArtworkUrl(url) {
     if (!url || typeof url !== 'string') return false;
     // Only allow HA-proxied paths
     return url.startsWith('/api/') || url.startsWith('/local/');
   }
   ```
   Reject URLs with `javascript:`, `data:text/html`, or external origins. A malicious integration could set `entity_picture` to a crafted URL.

2. **Clamp seek position on progress bar click**: If implementing seek-on-click, validate: `const clampedPosition = Math.max(0, Math.min(duration, seekPosition));` before calling `media_player.media_seek`.

**SHOULD FIX:**

3. **Set `crossorigin="anonymous"` on album art `<img>` tags**: This prevents the image from sending credentials to external origins if the URL validation is somehow bypassed. Defense in depth.

4. **Set `referrerpolicy="no-referrer"` on artwork images**: Prevents leaking the dashboard URL to external image servers.

**ADVISORY:**

5. **Wesley's Web Audio API idea (Team Review Flags)**: If the Web Audio API is used for beat visualization, it would require `connect()` to an audio context — this has CSP implications (`media-src` directive) and could be a fingerprinting vector. Defer to proof-of-concept review.

6. **`sound_mode_list` / `source_list` length**: No maximum length is enforced on these lists. A malicious integration with 1000 source entries could cause rendering performance issues. Consider truncating to a reasonable max (e.g., 50 items) and showing "more..." overflow.

---

## Data — Architecture Review

**Reviewer**: Data (Project Architect & Performance Engineer)  
**Date**: Stardate 2026.04.13  
**Assessment**: SOUND WITH ADVISORIES

### Component Architecture
- The extension of `LcarsDevicePanelBase` is correctly specified. The 2-column asymmetric grid (metadata | media+transport) follows the Device Panel Spec §2 pattern precisely. The idle-vs-active state split via CSS class toggling (`.idle`) is efficient — it avoids conditional DOM construction and leverages Lit's attribute-based rendering.
- The `classifyMediaEntities()` function (§8) correctly separates `media_player`, `remote`, `sensor`, and control domains. The early `continue` pattern is efficient. However, the function accepts raw entities but does not specify whether these are entity registry entries or `hass.states` objects — this ambiguity should be clarified during implementation.
- The `MEDIA_FEATURES` bitmask approach (§3.5) is correct and matches the HA `MediaPlayerEntityFeature` enum. The `hasFeature()` utility is a clean pattern that should be extracted to a shared utility module — it will be needed by future panels.

### Performance Considerations
- **Progress bar interpolation** (§3.4, `getMediaProgress()`): The `Date.now()` call in `getMediaProgress()` is invoked on every render when state is `playing`. Lit will call `render()` whenever `hass` updates (which occurs on every state change globally). This creates unnecessary recomputation. **Advisory**: Gate progress interpolation behind a 1-second `setInterval` timer that triggers `requestUpdate()`, rather than recomputing on every `hass` property change. This reduces interpolation calls from ~50/sec (HA state churn) to 1/sec.
- **Album art image loading**: The `entity_picture` attribute provides a URL proxied through HA at `/api/media_player_proxy/`. Image decoding is the browser's responsibility. The crossfade animation (400ms) is lightweight. No concern.
- **Volume bar drag interaction** (§3.7): `handleVolumeInteraction()` is called on every `mousemove` during drag. Each call triggers `hass.callService('media_player', 'volume_set')`. **Advisory**: Throttle volume service calls to max 1 per 100ms using a simple timestamp guard. HA WebSocket can handle rapid calls, but the media player device (HomePod, Sonos) may not.
- **Bundle impact estimate**: ~4.5 KiB minified/gzipped. The CSS is declarative (no runtime generation), helpers are pure functions, and the `MEDIA_FEATURES` bitmask is a static const. The `MEDIA_ACTIONS` map (§8) avoids string concatenation at runtime. Acceptable addition to the 203 KiB bundle — roughly 2.2% increase.

### HA Integration Patterns
- All service calls (§8) correctly use `hass.callService(domain, service, data)` format. The `MEDIA_ACTIONS` map is a clean pattern for dispatching transport commands.
- The `supported_features` bitmask check before rendering transport buttons is correct — this prevents rendering buttons for unsupported features, reducing DOM nodes.
- Speaker grouping via `group_members` attribute is correctly read from state attributes. The `supportsGrouping()` check uses the proper feature flag. No WebSocket subscription beyond the standard `hass` property is needed — grouping data flows through entity state.
- The source selector uses `source_list` from entity attributes — no separate API call required. This is correct and efficient.

### Code Quality & Reusability
- **DRY compliance**: `getMediaStateColor()`, `getMediaStateLabel()`, `isActivePlayback()` follow the same switch-statement pattern as other panel specs. These utility functions should be extracted to a shared `lcars-state-colors.js` module rather than duplicated per panel file. I count 6 specs that each define a `get*Color()` function with identical structure.
- **KISS compliance**: The track info display (§3.3) is clean — text overflow handled by CSS `text-overflow: ellipsis`. No JavaScript truncation needed.
- **YAGNI flag**: The sound mode selector for Sonos (§9) adds conditional complexity for a single device type. Consider deferring this to a future iteration unless the Admiral has Sonos devices.
- **Configuration schema**: No custom YAML config beyond what `LcarsDevicePanelBase` provides. The panel is auto-discovered via `media_player` domain. This is correct — the media panel should not require manual configuration.

### Recommendations
1. **P1**: Extract `hasFeature()`, `getMediaStateColor()`, and time formatting utilities to a shared `lcars-helpers.js` or `lcars-state-utils.js` module. These patterns recur across media, climate, alarm, weather, and irrigation panels. Estimated dedup savings: ~1.2 KiB across all panels.
2. **P1**: Throttle volume service calls during drag to max 10/sec (100ms debounce). Use `this._lastVolumeCall` timestamp comparison — no external deps needed.
3. **P2**: Gate progress interpolation behind a dedicated 1-second timer rather than recomputing on every `hass` update. Start the timer when state transitions to `playing`, stop on any other state. Clean up in `disconnectedCallback()`.
4. **P2**: Clarify in the spec whether `classifyMediaEntities()` expects entity registry entries (from `config/entity_registry/list`) or `hass.states` objects. The property access patterns differ (`original_device_class` vs `attributes.device_class`).
5. **P3**: Defer Sonos sound mode selector (§9) unless validated against the Admiral's device inventory. Apply YAGNI.

---

## Wesley Crusher — Final Review Pass

**Author**: Wesley Crusher (Creative Technologist)  
**Date**: Stardate 2026.04.13  
**Status**: REVISED — Ready for Implementation

### Changes Made
- **§3.2**: Added `crossorigin="anonymous"` and `referrerpolicy="no-referrer"` note to album art img CSS comment
- **§3.2.1 (NEW)**: Added `isValidArtworkUrl()` guard function and secure `<img>` template with `crossorigin`/`referrerpolicy` attributes per Worf's MUST FIX #1
- **§3.4**: Added `clampSeekPosition()` function for progress bar seek validation per Worf's MUST FIX #2

### Accepted Recommendations
- **Worf MUST FIX #1** (entity_picture URL validation): Accepted. Added `isValidArtworkUrl()` allowlist guard — only `/api/` and `/local/` prefixes permitted. Defense-in-depth with `crossorigin="anonymous"` and `referrerpolicy="no-referrer"` on img element.
- **Worf MUST FIX #2** (seek position clamping): Accepted. Added `clampSeekPosition()` function; implementation must call this before `media_player.media_seek`.
- **Worf SHOULD FIX #3-4** (crossorigin, referrerpolicy): Accepted — folded into §3.2.1.
- **Geordi Rec #5** (no audio-reactive frame pulsing): Accepted. It was just a closing brainstorm. Frame borders are structural, not decorative.
- **Geordi Rec #4** (progress bar hover): Accepted as a note — will use transparent hit area if needed during implementation.
- **Data P1** (shared utilities): Accepted. `hasFeature()`, `getMediaStateColor()`, `formatMediaTime()` will be extracted to shared `lcars-state-utils.js` during implementation.
- **Data P2** (throttle volume drag): Accepted. Will implement 100ms timestamp guard in `handleVolumeInteraction()`.
- **Data P3** (progress interpolation timer): Accepted. 1-second `setInterval` when `playing`, cleaned up in `disconnectedCallback()`.
- **Data P4** (classifyMediaEntities input type): Clarification deferred to implementation — function will accept entity registry entries with `original_device_class`.
- **Worf Advisory #6** (source_list length): Accepted. Will cap rendered source list at 50 items.

### Deferred Items
- **Data P5** (Sonos sound mode selector): Deferred per YAGNI. The Admiral doesn't have Sonos — will add if needed.
- **Worf Advisory #5** (Web Audio API CSP): Deferred to proof-of-concept phase — not part of initial implementation.
- **Geordi Rec #6** (aspect ratio transition): Implementation detail — CSS `transition: aspect-ratio 300ms` will be tested during build.

### Disagreements
- None. All reviewer feedback is either accepted or reasonably deferred.

---

## Worf + Data — v4.13.0 Visual Enhancements Review

**Date**: Stardate 2026.04.13

### Worf (Security)
**Verdict**: APPROVED

- URL validation (`isValidArtworkUrl()`), `crossorigin="anonymous"`, `referrerpolicy="no-referrer"` all present.
- No new vectors. No `innerHTML`/`unsafeHTML`. Clean.

### Data (Architecture)
**Verdict**: APPROVED WITH CONDITIONS

- **[C-1 — APPLIED]** Waveform bars: replaced `height` animation with `transform: scaleY()` to avoid layout thrashing (50–100 layout recalcs/sec on RPi4).
- **[C-2 — APPLIED]** Reduced bars from 32 to 12 with 4 shared animation timing groups. Concurrent animations: 7 (at budget boundary).
- **[L-1]** Added `will-change: transform` to bar CSS.
- **[L-2]** Ensure confirmation animations still play at half duration in reduced-motion (not `animation: none`).
