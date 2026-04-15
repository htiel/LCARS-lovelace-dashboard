## 8. Accessibility (a11y) Requirements

### 8.1 Keyboard Navigation (WCAG 2.1.1)

| Element           | Focusable | Keydown Handlers                         |
|-------------------|-----------|------------------------------------------|
| Media frame       | `tabindex="0"` | `Enter`/`Space` → open more-info dialog |
| Sensor lines      | `tabindex="0"` | `Enter`/`Space` → open more-info dialog |
| Control buttons   | `<button>` | Native keyboard support                  |

Tab order: Header → Media frame → Sensor lines (top to bottom) → Control buttons (left to right). This follows DOM order which matches visual order (WCAG 1.3.2 Meaningful Sequence).

### 8.2 ARIA Labeling (WCAG 4.1.2)

```html
<!-- Panel container -->
<div class="lcars-device-panel"
     role="region"
     aria-label="Front Door Camera device panel">

  <!-- Media frame -->
  <div class="device-panel-media"
       role="button"
       tabindex="0"
       aria-label="Front Door Camera feed: streaming">

  <!-- Sensor readout -->
  <div class="device-sensor-line"
       role="button"
       tabindex="0"
       aria-label="Motion: detected">
    <div class="sensor-indicator" aria-hidden="true"></div>
    <span class="sensor-label">Motion</span>
    <span class="sensor-state-value">Detected</span>
  </div>

  <!-- Control button -->
  <button class="device-control-btn"
          role="switch"
          aria-checked="true"
          aria-label="IR LED: on">
    <ha-icon icon="mdi:led-on" aria-hidden="true"></ha-icon>
    IR LED
  </button>
</div>
```

### 8.3 Color Is Not Sole Indicator (WCAG 1.4.1)

Every sensor state conveys information through **both** color and text:
- Motion detected → `DETECTED` in butterscotch + butterscotch dot
- Motion clear → `CLEAR` in gray + gray dot
- Doorbell ringing → `RINGING` in tomato + tomato dot

The text alone is sufficient to understand the state. The color is redundant reinforcement.

### 8.4 Focus Visibility (WCAG 2.4.7, 2.4.11, 2.4.13)

All interactive elements use:
```css
:focus-visible {
  outline: 2px solid var(--lcars-ice);     /* Ice blue, 10.3:1 vs black bg */
  outline-offset: 2px;
}
```

- 2px outline meets WCAG 2.4.13 (Focus Appearance — 2 CSS px perimeter)
- `outline-offset: 2px` ensures the focus ring doesn't overlap the element boundary
- `--lcars-ice` (#99ccff) vs `--lcars-black` (#000000) = **10.3:1 contrast** — exceeds 3:1 requirement

### 8.5 Target Size (WCAG 2.5.8)

| Element            | Size              | Pixels (at 16px base) | Passes? |
|--------------------|-------------------|-----------------------|---------|
| Control button     | 3rem × 6rem min   | 48px × 96px           | ✅ AAA  |
| Sensor line        | 1.75rem × full    | 28px × variable       | ✅ AA   |
| Media frame        | Full panel width   | ≫ 24px                | ✅ AAA  |

### 8.6 Screen Reader Announcements (WCAG 4.1.3)

When sensor states change, use `aria-live="polite"` on a visually-hidden region:

```html
<div class="sr-only" aria-live="polite" aria-atomic="false" id="device-panel-status">
  <!-- JS injects: "Front Door: Motion detected" -->
</div>
```

This announces state changes without interrupting the user. Use the existing `.sr-only` class from `lcars-styles.js`.

### 8.7 Image Alt Text

Camera feed images MUST have descriptive `alt` attributes:
```html
<img src="${entityPicture}" alt="${deviceName} camera feed" loading="lazy" />
```

When the camera is offline:
```html
<div role="img" aria-label="${deviceName} camera: unavailable">
  <ha-icon icon="mdi:video-off" aria-hidden="true"></ha-icon>
</div>
```

---
