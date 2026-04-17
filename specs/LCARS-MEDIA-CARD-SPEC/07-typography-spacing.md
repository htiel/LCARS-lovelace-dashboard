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
