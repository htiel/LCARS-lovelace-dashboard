## Wesley Crusher — Final Review Pass

**Author**: Wesley Crusher (Creative Technologist)  
**Date**: Stardate 2026.04.13  
**Status**: REVISED — Ready for Implementation

### Changes Made
- **§8.3**: Replaced `box-shadow` in `alarm-viewscreen-pulse` keyframes with `border-width: 3px → 5px` pulse. Removes glow effect — LCARS is flat. Per Geordi's NEEDS REVISION #6 and Data's P1 #3 (box-shadow not GPU-compositable).
- **§7.5 `AlarmCodeHandler`**: Hardcoded `maxLength` clamped to `[4, 10]` via `Math.min(Math.max(maxLength, 4), 10)`. Per Worf's MUST FIX #2.
- **§7.5 `AlarmCodeHandler`**: Added `isLockedOut`, `lockoutRemaining`, `recordFailedAttempt()`, `resetAttempts()` for rate-limiting. 3 failed attempts → 30s lockout. Per Worf's MUST FIX #1.
- **§7.5 `AlarmCodeHandler`**: Added JS string immutability documentation comment per Worf's Advisory #8.
- **§7.7 `handleKeypadKeydown()`**: Added `actionContext` parameter. Enter key now requires an explicit action context string (e.g., `'disarm'`, `'arm_home'`) — refuses to submit without it. Per Worf's MUST FIX #4.
- **§10 YAML config**: Annotated `exit_delay` and `entry_delay` with `(clamped to 1–300)`. Implementation must apply `Math.max(1, Math.min(300, value))`.

### Accepted Recommendations
- **Worf MUST FIX #1** (rate-limit PIN): Implemented in `AlarmCodeHandler` — 3 attempts per 60s, 30s lockout.
- **Worf MUST FIX #2** (hardcode maxLength): Implemented with `Math.min(Math.max(maxLength, 4), 10)`.
- **Worf MUST FIX #3** (clamp countdown delays): Config annotation added; implementation must enforce `[1, 300]` range.
- **Worf MUST FIX #4** (explicit Enter action): Implemented — `handleKeypadKeydown()` now requires `actionContext` parameter.
- **Worf SHOULD FIX #5** (clear on visibility change): Accepted — implementation will add `visibilitychange` listener.
- **Worf SHOULD FIX #6** (clear on alarm state change): Accepted — `willUpdate()` will detect entity state changes and auto-clear.
- **Worf SHOULD FIX #7** (autocomplete off): Accepted — simple attribute addition during implementation.
- **Worf Advisory #8** (JS immutability): Documented in constructor comment.
- **Worf Advisory #9** (code_arm_required): Accepted — implementation will check `code_arm_required` before arm service calls.
- **Geordi NEEDS REVISION #6** (box-shadow → border-width pulse): Implemented in §8.3.
- **Geordi APPROVED WITH EXCEPTION #2** (triggered double-thick border): Documented as Red Alert exception to Bracer Jack Rule 2.
- **Data P0** (disconnectedCallback for AlarmCountdown): Accepted — critical lifecycle cleanup. Will clear `_intervalId` in `disconnectedCallback()`.
- **Data P1** (reduce countdown to 1000ms): Accepted. Progress bar at 1s resolution on a 60s countdown is 1.7% granularity — sufficient.
- **Data P2** (extract AlarmCountdown to shared utility): Accepted — shared `LcarsCountdown` class for alarm + irrigation.
- **Data P2** (wrong-code detection): Accepted. 3-second timeout after `disarmAlarm()` — if state hasn't changed, trigger error shake and `recordFailedAttempt()`.

### Deferred Items
- **Visibility change listener**: Implementation-phase detail.
- **Auto-clear on state change**: Implementation-phase, tied to `willUpdate()` lifecycle.
- **`code_arm_required` enforcement**: Implementation-phase — will check entity attributes.

### Disagreements
- None. Worf's RED threat-level findings are all valid and addressed. This is the security heart of the ship — no shortcuts.

---
