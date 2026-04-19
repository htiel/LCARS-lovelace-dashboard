## Worf — Security Review

**Reviewer**: Worf (Integration Security Expert)  
**Date**: Stardate 2026.04.13  
**Threat Level**: RED

*"This is the security heart of the ship. I judge it by a warrior's standard: can an adversary breach it? The PIN keypad is a weapons console. I have reviewed every line."*

### Input Validation

- **PIN max-length enforcement (§7.5)**: `AlarmCodeHandler` enforces `_maxLength = 8` and rejects non-digit input via `/^[0-9]$/` regex. This is correct. However, the `maxLength` parameter is configurable via constructor — the component MUST hardcode this to a safe maximum (8 digits), never accept it from YAML config or user input. An attacker-controlled `maxLength` of `999999` would allow memory exhaustion via string concatenation.
- **Service call parameter scoping**: `armAlarm()` and `disarmAlarm()` (§7.6) correctly scope `entity_id` and pass `code` only when entered. The `serviceMap` uses a hardcoded allowlist of valid arm modes — **no arbitrary service injection possible**. This is properly defended.
- **`code_format` attribute**: The spec references `code_format` (number vs text) from the entity but the keypad only accepts digits 0-9. If a future alarm integration uses `code_format: text`, the current keypad cannot handle it. This is acceptable for now (SimpliSafe is numeric), but document the limitation.
- **YAML config validation**: `exit_delay` and `entry_delay` are accepted from YAML config. These MUST be clamped to sane ranges (e.g., 1-300 seconds) to prevent a malicious YAML injection from setting absurd delays. Currently no clamping is specified.

### XSS & DOM Safety

- **Lit-html template rendering**: All zone names (`friendly_name`), state labels, and sensor values are inserted via Lit tagged template literals (`html\`...\``), which auto-escape by default. **No `innerHTML` or `unsafeHTML()` usage detected.** This is correct.
- **Zone sensor names from HA WebSocket**: Zone `friendly_name` values arrive as untrusted data from the HA entity registry. They are rendered via `${zoneName}` in Lit templates — auto-escaped. Secure.
- **SVG text injection**: The shield symbol and label (§5.1) are rendered via `<text>` elements inside SVG with values from `getAlarmShieldSymbol()` and `getAlarmShieldLabel()` — both return hardcoded strings from switch statements. **No user-controlled input reaches SVG text nodes.** Secure.
- **`data-pressed` attribute on keypad buttons** (§8.8): The `key-flash` animation uses `[data-pressed]` CSS selector. Ensure the `data-pressed` attribute is set programmatically with a boolean flag, never with the key value itself. A digit value in a DOM attribute is not sensitive, but it establishes a bad pattern.

### Service Call Security

- **Arm/Disarm calls properly scoped**: Service calls use `hass.callService('alarm_control_panel', ...)` with entity_id from the card config, not user input. The service name is selected from a hardcoded `serviceMap` — no arbitrary service name injection.
- **No destructive unguarded actions**: Arming requires explicit mode selection button press. Disarming requires code entry + explicit DISARM button press. The `Enter` key on the keypad triggers `submitCallback()` which should require the DISARM button context — **verify that pressing Enter alone without clicking DISARM does not auto-submit the disarm action**. The `handleKeypadKeydown()` function (§7.7) calls `submitCallback()` on Enter — the implementation MUST validate that the intended action (arm vs disarm) is explicit, not assumed.
- **No admin-only data exposed**: The alarm panel reads `alarm_control_panel` state which is available to all HA users. Zone `binary_sensor` states are similarly non-privileged. No `hass.auth` escalation concern.

### Secrets & Sensitive Data

- **PIN code memory lifecycle**: `AlarmCodeHandler._code` is a JavaScript string. `consumeCode()` reads and clears it. `destroy()` zeroes it. **However, JavaScript strings are immutable** — the old string value persists in the V8 heap until garbage collected. There is no way to securely zero a JS string in memory. This is an **accepted limitation of the browser runtime**, not a code defect. Document this explicitly.
- **PIN never in DOM**: The spec correctly mandates (§7.5 requirement #1) that code is stored in a local variable, never in DOM attributes or dataset. The `alarm-code-dots` display uses filled/empty dot objects, never digit characters. **Verified: no digit value reaches the DOM.**
- **PIN never logged**: Requirement #2 mandates no console logging. Implementation MUST NOT include `console.log(this._code)` or `console.debug` calls even behind feature flags. Code review during implementation must enforce this with grep.
- **PIN not in component state/properties**: The code is in a standalone `AlarmCodeHandler` class, not in LitElement reactive properties. This means it won't appear in browser DevTools component inspector panels. Good.
- **Error feedback timing**: The wrong-code shake animation (§8.9) runs for 400ms regardless of the actual HA backend response time. The animation is purely client-side cosmetic feedback. The actual success/failure is determined by whether the entity state changes after the service call. **No timing oracle risk from the animation itself.** However, rapid repeated submissions could be used to brute-force the code. See Recommendations.

### Recommendations

**MUST FIX:**

1. **Rate-limit PIN submission**: Add a cooldown after failed disarm attempts. After 3 failed attempts within 60 seconds, disable the DISARM button for 30 seconds with a visible lockout countdown. This prevents brute-force attacks on 4-digit PINs (10,000 combinations). Without rate limiting, an automated attacker (browser console script) could exhaust the keyspace in seconds via `hass.callService()` directly. *Note: HA backend may have its own rate limiting, but defense in depth demands client-side protection too.*

2. **Hardcode maxLength, reject from config**: The `AlarmCodeHandler` constructor's `maxLength` parameter MUST be hardcoded to 8 (or derived from entity `code_format` length constraints), never accepted from YAML config. Add: `this._maxLength = Math.min(Math.max(maxLength, 4), 10);`

3. **Clamp countdown delay config values**: `exit_delay` and `entry_delay` from YAML config must be clamped: `const exitDelay = Math.max(1, Math.min(300, config.exit_delay || 60));`

4. **Explicit action context on Enter key**: The `handleKeypadKeydown()` Enter handler must require the user to have explicitly selected an action (arm mode or disarm). Do not auto-disarm on Enter if the current state is `armed_*` — require the DISARM button to be focused or the intent to be set.

**SHOULD FIX:**

5. **Clear code on visibility change**: Add a `document.visibilitychange` listener that calls `codeHandler.clear()` when the tab becomes hidden. Prevents a partially-entered code from persisting if the user walks away.

6. **Clear code on alarm state change**: If the entity state changes (e.g., someone disarms from another panel/app), automatically clear any entered code digits to prevent stale code persistence.

7. **Disable autocomplete on keypad container**: Add `autocomplete="off"` to the keypad container element (even though it's not a form input) to prevent browser password managers from interfering.

**ADVISORY:**

8. **Document JS string immutability limitation**: Add a comment in `AlarmCodeHandler` noting that JavaScript cannot securely zero string memory. This is an inherent platform limitation, not a defect, but must be documented for future security auditors.

9. **Consider `code_arm_required` enforcement**: If `code_arm_required` is true on the entity, the ARM mode buttons should require code entry before calling the arm service. The current spec shows code is optional for arming — verify this matches the entity's requirements.

10. **CSP compliance verified**: No `eval()`, no inline event handlers (`onclick`), no external resource loading. All event binding via Lit `@click` decorators which compile to `addEventListener`. Compliant with strict CSP.

---
