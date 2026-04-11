# Task: Fix duplicate keys in the LCARS theme file

The file `themes/lcars/lcars.yaml` (or wherever your LCARS theme YAML lives) has **20 duplicate keys** that produce warnings on every Home Assistant restart. When a YAML key appears twice, the second definition silently overwrites the first, which can cause unexpected styling behavior.

Here are the exact duplicates from the HA server logs — each pair shows the original line and the duplicate line:

| Key | First occurrence | Duplicate |
|---|---|---|
| `header-font-size` | line 202 | line 2334 |
| `lcars-sunflower` | line 24 | line 2368 |
| `primary-text-color` | line 206 | line 2374 |
| `secondary-text-color` | line 207 | line 2375 |
| `text-primary-color` | line 208 | line 2376 |
| `disabled-text-color` | line 209 | line 2377 |
| `mdc-text-field-ink-color` | line 274 | line 2379 |
| `mdc-text-field-label-ink-color` | line 272 | line 2380 |
| `mdc-text-field-fill-color` | line 273 | line 2381 |
| `mdc-theme-text-primary-on-background` | line 269 | line 2382 |
| `mdc-theme-text-secondary-on-background` | line 270 | line 2383 |
| `ha-outlined-field-container-color` | line 301 | line 2393 |
| `ha-card-header-color` | line 205 | line 2395 |
| `ha-heading-card-title-color` | line 246 | line 2397 |
| `paper-dialog-background-color` | line 291 | line 2399 |
| `paper-listbox-background-color` | line 240 | line 2400 |
| `data-table-background-color` | line 255 | line 2402 |
| `table-row-background-color` | line 253 | line 2403 |
| `table-row-alternative-background-color` | line 254 | line 2404 |
| `code-editor-background-color` | line 289 | line 2406 |

## What to do

1. For each duplicate pair, compare the values at both line numbers. If they're identical, simply delete the duplicate (the one around lines 2334–2406 — it looks like a block was appended that overlaps with earlier definitions).
2. If the values differ, keep whichever is the intended/correct value and delete the other. The second occurrence is what HA actually uses since it overwrites the first.
3. The duplicates all cluster around lines 2334–2406, suggesting a block of overrides was appended to the file that partially duplicates definitions from earlier in the file (lines 24–301). It may be cleanest to review that entire trailing block and merge any unique entries back into the main section, then delete the trailing block.
4. After cleanup, validate there are no remaining duplicates by searching for any key that appears more than once in the file.

## Why this matters

These produce 20 WARNING lines in the HA log on every restart (`[annotatedyaml.constructors] YAML file contains duplicate key`). More importantly, the silent overwrite behavior means the styling intent may not match what's actually applied — whoever added the second block may not have realized it was overwriting earlier values.
