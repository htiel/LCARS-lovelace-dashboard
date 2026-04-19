## Worf — Security Review

**Reviewer**: Worf (Integration Security Expert)  
**Date**: Stardate 2026.04.13  
**Threat Level**: YELLOW

*"Irrigation zones control water valves and pump equipment. Unguarded actions can waste water resources or damage landscaping. The service calls here are simple but consequential."*

### Input Validation

- **Zone entity_id scoping**: `startZone()` and `stopZone()` pass `entity_id` directly from the zone entity object resolved from the device registry. The entity_id is not user-typed. However, verify that the entity_id is validated as belonging to the current device before calling the service — a stale UI state could reference a deleted entity.
- **Standby toggle**: `toggleStandby()` uses a boolean `standby` parameter to choose between `turn_on` and `turn_off`. The boolean comes from the current UI state. No injection concern.
- **Zone attribute rendering**: `soilType`, `nozzleType`, `shadeLevel`, `slopeType` — these come from Rachio entity attributes. They are text strings rendered via Lit templates. Auto-escaped.
- **Countdown timer values**: `formatCountdown()` and `getZoneFillPct()` operate on numeric values (seconds, percentages) with explicit `Math.max(0, ...)` clamping. Defensive.

### XSS & DOM Safety

- **All rendering via Lit templates**: Zone names (`friendly_name`), status labels, attribute values, schedule information — all rendered via Lit tagged template literals. **No `innerHTML` or `unsafeHTML()` detected.** Secure.
- **Zone name from entity attributes**: `friendly_name` is an untrusted string from the HA entity registry, but Lit auto-escapes it. A zone name like `<img src=x onerror=alert(1)>` would render as literal text. Secure.
- **`aria-label` construction**: Labels like `aria-label="${zoneName}: ${stateLabel}"` concatenate entity-derived values. Lit handles attribute escaping. Secure.

### Service Call Security

- **Two service call patterns**:
  1. `switch.turn_on` / `switch.turn_off` — zone start/stop
  2. `switch.turn_on` / `switch.turn_off` — standby toggle
- **All properly scoped** with `entity_id` from device entity objects, not user input. Service domains and service names are hardcoded strings.
- **No duration parameter in start zone**: The `startZone()` function calls `switch.turn_on` with only `entity_id`. Rachio zones use default duration from the schedule. The spec does NOT allow arbitrary duration injection — **confirmed: no duration parameter is accepted from the UI**. This is the correct approach. If a future enhancement adds manual duration input, it MUST be clamped to sane limits (1-120 minutes).
- **Standby mode is reversible**: Toggling standby pauses all schedules. This is not destructive — schedules resume when standby is deactivated. Acceptable without confirmation.
- **No admin-only data**: Zone switch states and Rachio sensor data are available to all HA users. No privilege escalation concern.

### Secrets & Sensitive Data

- **No credentials.** Rachio uses cloud API authentication handled by the HA integration's config flow. No API keys surface in entity attributes or service call parameters.
- **Schedule data**: Next run times and daily usage statistics are operational data, not sensitive. No PII exposure.

### Recommendations

**SHOULD FIX:**

1. **Validate entity_id belongs to current device before service call**: Before calling `switch.turn_on`, verify the entity_id is in the classified `zones` list:
   ```javascript
   function startZone(hass, entityId, validZoneIds) {
     if (!validZoneIds.includes(entityId)) return;
     hass.callService('switch', 'turn_on', { entity_id: entityId });
   }
   ```
   This prevents stale references from calling services on unrelated entities after a device reconfiguration.

2. **Rate-limit zone start/stop**: Add a 2-second cooldown after starting or stopping a zone to prevent rapid toggle cycling (which could damage irrigation solenoid valves).

3. **Guard against starting a zone while in standby**: If the controller is in standby mode, the START buttons should be disabled. The spec's `getZoneStateInfo()` handles the visual state (returns `STANDBY` label) but the `startZone()` function does not check standby state before calling the service. Add: `if (isStandby) return;`

**ADVISORY:**

4. **Rachio cloud dependency**: Unlike ScreenLogic (Local Push), Rachio uses Cloud Polling. This means service calls go through Rachio's cloud API. A Rachio cloud outage would make zone controls unresponsive. This is an architectural limitation of the integration, not a dashboard defect, but document it for user expectations.

5. **Future duration input**: If a manual duration feature is added (e.g., "run zone for X minutes"), the duration MUST be clamped to `[1, 120]` minutes and validated as an integer. Never accept arbitrary numeric input for physical equipment timers.

6. **OWASP compliance note**: No injection vectors (A03:2021). Service calls authenticated through HA WebSocket (A01:2021 — mitigated). No external resources loaded (A06:2021 — not applicable). Minimal attack surface overall.

---
