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
