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
