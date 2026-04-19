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
