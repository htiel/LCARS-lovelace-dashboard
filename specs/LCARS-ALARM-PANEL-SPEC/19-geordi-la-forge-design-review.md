## Geordi La Forge — Design Review

**Reviewer**: Geordi La Forge (LCARS UI Design Authority)  
**Date**: Stardate 2026.04.13  
**Status**: APPROVED WITH NOTES

### LCARS Compliance
- §1 Grid Layout: The 3-row grid (header, sensors+media, keypad) is correct. The keypad as a full-width bottom section mirrors TNG console button strips below the main display.
- §1 CSS: Thick→thin border (4px left/bottom, 2px top/right) — correct per Bracer Jack Rule 2.
- **§1 TRIGGERED STATE**: The `.triggered` class increases `border-left-width` to 6px and `border-bottom-width` to 6px. This creates a **thick→thick** situation on the left-to-bottom turn, which technically violates Bracer Jack Rule 2 ("NEVER the same thickness on the next turn"). However, I'm approving this as a **Red Alert design exception**. The thicker border communicates "the frame itself is screaming" — a visual amplification of the emergency state that's analogous to the bridge lighting shifting to all-red. **Document this exception clearly in the implementation.**
- §5 Shield SVG: Clean vector art — no gradients, no shadows. The shield outline uses `stroke` and `fill: none` — properly flat LCARS. The Unicode status symbols (✓, ▲, ✕, ◉) are geometric and match LCARS typographic icon conventions.
- §6 Arm mode strip: Correct pill buttons with `radiogroup` pattern. Three buttons for SimpliSafe (HOME, AWAY, DISARM) — clean and minimal.
- §7 Keypad: Individual keys at 3.5rem × 3.5rem (56px) — generous and comfortable. Pill shape correct. Action keys (backspace, enter) in `--lcars-disabled` to differentiate from digit keys — good visual hierarchy.
- §8 Red Alert animation: The 1s pulse on frame, shield, and viewscreen border is dramatic but appropriate for an alarm trigger. The `box-shadow` on the viewscreen pulse (§8.3) technically introduces a glow effect — this is the one element I'd flag. LCARS is flat; box-shadows are not part of the design language.

### Color & Typography
- The alarm state escalation (ice → sunflower → butterscotch → gold → tomato) maps perfectly to threat level. This is Worf's console operating exactly as designed.
- `--lcars-african-violet` for `armed_custom_bypass` is a smart choice — it visually flags "non-standard configuration" without implying danger.
- Contrast table (§2) is complete. All pass WCAG AA. `--lcars-tomato` at 5.2:1 is paired with "TRIGGERED" text label — color is never sole indicator.
- Typography: Three sizes — sub-header (device name, countdown `2rem` in SVG), data (everything else), plus keypad digits at `--lcars-font-size-sub`. Clean.
- The countdown timer uses `font-variant-numeric: tabular-nums` and `letter-spacing: 0.15em` — this prevents layout jitter as digits change. Excellent detail.

### Layout & Visual Balance
- The shield icon floating in the viewscreen with generous padding is visually strong. "Empty space is beautiful" — the shield breathes in black.
- The keypad visibility logic (§7.8) that hides the keypad during `arming` and shows CANCEL instead is good UX — reduces visual noise during countdown.
- The countdown timer replacing the shield during transitional states is a clean state swap within the same viewscreen frame.

### Accessibility
- WCAG 2.5.8: Keypad keys at 56px — excellent. Action buttons at 56px height × 112px min-width. All well above threshold.
- Keypad keyboard navigation (§7.7): Physical keyboard digit capture via `keydown` listener is essential for accessibility. The `Escape` key clearing the code is a good pattern.
- The countdown timer uses `role="timer"` with `aria-live="assertive"` — correct for time-critical countdowns. `assertive` (not `polite`) is the right choice during arming/pending states.
- PIN code masking: The `AlarmCodeHandler` (§7.5) never exposes digits in DOM — good. The masked dot display with `aria-label="Code entered: N digits"` gives screen reader users status without exposing the code.
- `prefers-reduced-motion` covers all pulse animations — confirmed in §8.

### Recommendations
1. **APPROVED**: Shield SVG design — flat, geometric, properly LCARS.
2. **APPROVED WITH EXCEPTION**: Triggered state double-thick border (§1). Document as Red Alert exception to Bracer Jack Rule 2.
3. **APPROVED**: Dynamic frame color shifting across all alarm states.
4. **APPROVED**: Keypad layout and pill-button sizing.
5. **APPROVED**: Countdown display replacing shield in viewscreen.
6. **NEEDS REVISION** (§8.3): Remove the `box-shadow` from `.alarm-viewscreen-pulse`. LCARS does not use shadows or glows. Replace with a border-width pulse or opacity pulse to achieve the same urgency without violating Bracer Jack Rule 1. Suggested alternative:
   ```css
   @keyframes alarm-viewscreen-pulse {
     0%, 100% { border-color: var(--lcars-alert); border-width: 3px; }
     50%      { border-color: rgba(255, 85, 85, 0.4); border-width: 5px; }
   }
   ```
7. **NOTE**: The Red Alert animation intensity is appropriate for the triggered state. The 1s pulse cycle is fast enough to convey urgency without being epileptogenic (well above the WCAG 2.3.1 three-flashes-per-second threshold).
8. **APPROVED**: PIN code security design — Worf's review is the primary authority here, but the visual masking and DOM isolation are sound.

---
