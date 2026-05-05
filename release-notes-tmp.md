# v5.4.3 — Silhouette callouts visible + Starship landscape

## Fixed
**Silhouette anchor labels were still invisible after the v5.4.2 fix.** The 5.4.2 release switched the callout template to the `svg` tag — that *was* required, but it wasn't sufficient. The `<line>` self-close was emitted as `stroke-opacity="0.9/>"` because there was no space between the dynamic numeric value and the trailing `/>`, so lit-html stamped the slash *inside* the unquoted attribute value. The browser parser then treated the `<line>` as never-closed and absorbed every following sibling — including all the `<text>` callout labels for HR / BP / SpO₂ / WEIGHT / SLEEP / STEPS — into its phantom subtree. Result: labels existed in the DOM but reported `getBBox().width === 0` and never painted.

Fix: added a single space before `/>` on the `<line>` element. Verified via closed-shadow-root DOM forensics — labels now have proper bounding boxes and render at the expected coordinates.

Affects both `<lcars-anatomical-silhouette>` consumers (Medical Bay anterior + Starship Health summary/engineering).

## Changed
**Starship Health silhouette is now landscape (480 × 200).** Per Captain's call after seeing the portrait orientation in the wild, the ship now points forward to the LEFT with the saucer on the bow and twin nacelles trailing aft on the RIGHT — far better-suited to wide dashboard cards than the previous 200 × 480 portrait. Anchor map rewritten for the new orientation:
- deflector → bow (left)
- bridge → dorsal saucer
- port nacelle → upper trailing capsule
- starboard nacelle → lower trailing capsule
- shuttlebay → aft (right edge)

Geometry remains hand-authored, generic LCARS-style top-down — not traced from any production asset.

## Notes
- Removed the silhouette primitive's hard 320px min-height and pushed it down to per-consumer CSS (Medical retains 320px min for the portrait body; Starship gets `aspect-ratio: 480/240` so it shapes to the parent card).
