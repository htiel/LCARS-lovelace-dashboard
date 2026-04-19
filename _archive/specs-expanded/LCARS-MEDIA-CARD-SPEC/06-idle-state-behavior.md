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
