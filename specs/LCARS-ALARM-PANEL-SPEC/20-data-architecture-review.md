## Data — Architecture Review

**Reviewer**: Data (Project Architect & Performance Engineer)  
**Date**: Stardate 2026.04.13  
**Assessment**: SOUND WITH ADVISORIES

### Component Architecture
- The `LcarsDevicePanelBase` extension is correctly specified. The 3-row grid (`header | sensors+media | keypad`) is appropriate — the keypad replaces the bottom controls row used by other panels. This is a justified departure from the standard pattern given the unique security input requirements.
- The `AlarmCodeHandler` class (§7.5) is well-designed. The `consumeCode()` pattern — returning the code exactly once and clearing it — is a correct implementation of the "read-and-destroy" pattern. The handler stores the code as a local variable (`this._code`), never in DOM attributes. The `destroy()` method zeros the code. Worf's security mandates are addressed.
- The `AlarmCountdown` class (§5.2) uses `setInterval(250ms)` for quarter-second precision. **Critical advisory**: This timer MUST be cleaned up in `disconnectedCallback()`. If the user navigates away from the dashboard view while a countdown is active, the interval will continue firing on a detached component, causing a memory leak and potential errors accessing stale DOM references. The spec does not explicitly address lifecycle cleanup of the countdown timer.
- The zone sensor rendering (§4.1) with `getZoneColor(sensorState, alarmState)` cross-referencing both the sensor and alarm states is architecturally sound — a zone that is "open" while the alarm is "disarmed" should display differently than "open" while "armed." This dual-state coloring is correct.
- The keypad visibility logic (§7.8, `isKeypadVisible()`) correctly hides the keypad during transitional states and when not required. This reduces unnecessary DOM complexity in states where the keypad cannot be used.

### Performance Considerations
- **Countdown timer**: `setInterval(250ms)` fires 4 times per second. Each tick calls `_onTick()` which triggers a re-render of the countdown display. Since only the countdown time text and progress bar width change, Lit's diffing will be efficient — ~2 DOM mutations per tick. Acceptable. However, the 250ms interval means the countdown display updates 4x per second while the visual granularity (1-second display) only truly changes once per second. Consider reducing to `setInterval(1000)` to reduce tick frequency by 75% with no visual difference. The sub-second precision is only useful for the progress bar — and 1-second resolution on a ~60s countdown is 1.7% granularity, which is sufficient.
- **Zone sensor list**: Alarm systems typically have 5-15 zones. The `getZoneColor()` and `getZoneValue()` computations run once per zone per render. At O(1) per zone, this is negligible even at 15 zones.
- **Red Alert animation system** (§8): The triggered state applies `animation: alarm-red-alert-frame 1s ease-in-out infinite` to the panel, shield SVG, and viewscreen. Three simultaneous CSS animations is acceptable — these are GPU-composited properties (`border-color`, `opacity`, `stroke`). However, the `box-shadow` animation in §8.3 (`alarm-viewscreen-pulse`) is NOT GPU-compositable and will trigger repaints. **Advisory**: Remove `box-shadow` from the animation or replace with `filter: drop-shadow()` which is compositable on most browsers.
- **Bundle impact estimate**: ~6.5 KiB minified/gzipped. The keypad grid, countdown timer class, zone sensor rendering, and Red Alert animation system add more code than simpler panels. The `AlarmCodeHandler` class adds ~0.6 KiB. Roughly 3.2% of the 203 KiB bundle.

### HA Integration Patterns
- `armAlarm()` (§7.6) correctly maps arm modes to specific service calls (`alarm_arm_home`, `alarm_arm_away`, etc.) rather than using a generic call. This matches the HA `alarm_control_panel` service API precisely.
- `disarmAlarm()` correctly calls `alarm_control_panel.alarm_disarm` with the consumed code. The code is passed as a string in the `code` field, which is the correct HA API contract.
- The `code_arm_required` attribute is read but the spec doesn't explicitly verify `code_format` (numeric vs text). SimpliSafe uses numeric-only codes, but the keypad only renders digits 0-9, which is correct. If a future alarm system requires alphanumeric codes, the keypad would need extension — but that is YAGNI for now.
- Zone sensors are discovered via `binary_sensor` entities on the same device. This is correct — alarm systems register their zones as binary sensors with the alarm device.

### Code Quality & Reusability
- **DRY**: `getAlarmStateColor()` follows the same switch-statement pattern. Extract to shared module.
- **AlarmCodeHandler security**: The class correctly implements Worf's requirements. One observation: JavaScript strings are immutable and garbage-collected non-deterministically. Setting `this._code = ''` does not guarantee the previous string is immediately freed from memory. In a browser context, this is an acceptable trade-off — true memory zeroing would require `Uint8Array` and manual clearing, which is over-engineering for a Lovelace card where the code is immediately transmitted to HA's backend. The security boundary is the HA backend, not the frontend.
- **Countdown class reusability**: The `AlarmCountdown` class is also needed by the irrigation panel (zone watering countdown). Consider extracting to a shared `LcarsCountdown` utility with a configurable tick interval.
- **Error feedback**: The shake animation (§8.9) for wrong codes is a good UX pattern, but the spec should document how to detect a "wrong code" result. HA's `alarm_disarm` service doesn't return success/failure — the result is inferred from the entity state not transitioning to `disarmed` within a timeout. The spec should specify this timeout-based detection.

### Recommendations
1. **P0 (Critical)**: Add explicit `disconnectedCallback()` lifecycle cleanup for `AlarmCountdown._intervalId`. If navigation occurs during an active countdown, `clearInterval()` must be called. Failure to do so creates a memory leak and potential `requestUpdate()` calls on a disconnected component.
2. **P1**: Reduce countdown `setInterval` from 250ms to 1000ms. Visual difference is imperceptible; CPU cost reduces 75%.
3. **P1**: Replace `box-shadow` animation in `alarm-viewscreen-pulse` (§8.3) with `filter: drop-shadow()` or remove entirely. `box-shadow` animations trigger repaints on every frame.
4. **P2**: Extract `AlarmCountdown` class to a shared `lcars-countdown.js` utility — reusable by irrigation panel zone watering timer.
5. **P2**: Document the wrong-code detection strategy. Recommend: after `disarmAlarm()`, start a 3-second timer. If entity state hasn't changed to `disarmed` after 3s, trigger the error shake and re-enable keypad input.
6. **P3**: Extract `getAlarmStateColor()` and `getAlarmStateLabel()` to the shared state color module.

---
