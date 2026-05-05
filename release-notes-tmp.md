## Vessel-diagnostic callouts no longer chop into each other

### What was wrong
With 5.4.4 wiring four additional metric kinds into Starship Health, the populated-anchor count tipped past the silhouette renderer's collision threshold — labels collapsed into single edge columns producing readouts like "CPLOTAMP" (CPU TMP + LOAD), "BAGSCKUP" (BACKUP + ADDONS), and a left-edge pile-up of MEM / TX / CORE.

### Root cause
The `lcars-anatomical-silhouette` element interpreted each anchor's `label` field as an edge-column selector with no awareness of how many anchors were on the same edge. Every `top`-labelled anchor snapped to canvas-center-x, every `left` to vbX+inset. The auxiliary `fontScale = vbH/480` compounded it on landscape viewBox (480×200) at 0.42×, making labels both small and overprinting.

### Fix
- **Edge-stagger rail callout layout** (Data architectural review): silhouette buckets active callouts by edge, sorts each bucket along its run-axis (anchor.x for top/bottom, anchor.y for left/right), and distributes slot positions evenly in the [10%, 90%] band. n=1 keeps natural coordinates so Medical at n≤3/edge renders unchanged. Sorted-key iteration for cross-engine determinism.
- **New `bottom` edge** as 4th cardinal. Five Starship anchors relabeled (`main_computer`, `sensor_array`, `warp_core`, `starboard_nacelle`, `starboard_impulse`) so top carries 6, bottom 5, sides 1 each.
- **Typography (Geordi):** `fontScale = clamp(min(vbW/480, vbH/240), 0.75, 1.25)`. Label bumped 9 → 12, value 14 → 16, stacked label-above-value in MSD canon.
- **Accessibility:** each callout wrapped in `<g role="img" aria-label="LABEL, VALUE, status">`. Decorative leader `<line>` and silhouette `<g>` carry `aria-hidden="true"`. Outer `<svg>` is `role="group"`. Resolves WCAG 1.3.1 / 4.1.2 failures from the colliding `<text>` elements.

### Compatibility
- Medical Scan tabs (Cetacean Ops, biofunction silhouette) reduce to current visual baseline at n≤3/edge — no expected regression. Closed shadow root posture (Worf §16) untouched.

### Build
- `npm run build` → 1.05 MiB, no errors. 3-file version sync: const.py + manifest.json + js/package.json → 5.4.5.
