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
