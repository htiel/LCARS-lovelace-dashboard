## Worf — Security Review

**Reviewer**: Worf (Integration Security Expert)  
**Date**: Stardate 2026.04.13  
**Threat Level**: YELLOW

*"The Environmental Control station adjusts conditions the crew depends on for survival. A tampered thermostat can freeze pipes or overheat a vessel. I do not treat this lightly."*

### Input Validation

- **Setpoint clamping (§5.2)**: `adjustSetpoint()` correctly clamps the new temperature to `[min_temp, max_temp]` from entity attributes and rounds to the nearest `target_temp_step`. The dual-setpoint guard (`clamped >= target_temp_high` check) prevents low from crossing high. **Sound implementation.**
- **Entity attribute trust**: `min_temp`, `max_temp`, and `target_temp_step` values come from the HA backend entity attributes. These should be treated as semi-trusted — a compromised integration could report `min_temp: -1000`, which the clamping logic would honor. **Add a safety floor**: clamp `min_temp` to no lower than -50°F/-45°C and `max_temp` to no higher than 200°F/95°C as absolute sane bounds, regardless of entity-reported values.
- **HVAC mode validation**: `setHvacMode()` passes the `mode` parameter from a button click where the mode string comes from the entity's `hvac_modes` attribute (rendered dynamically). The value is not typed by the user. However, validate that the mode value is in the entity's `hvac_modes` list before calling `set_hvac_mode` — a race condition where the entity updates its supported modes while the user clicks could send an unsupported mode.
- **Fan mode / Preset mode validation**: Same pattern — values come from entity attributes. Consider a guard: `if (!fanModes.includes(fanMode)) return;`

### XSS & DOM Safety

- **All text rendering via Lit templates**: Device name (`friendly_name`), action labels, mode labels, fan mode names, preset mode names — all rendered via Lit tagged template literals. **No `innerHTML` or `unsafeHTML()` detected.** Secure.
- **SVG text elements (§5.1)**: Temperature values and labels in the SVG arc are set via template literal interpolation into SVG `<text>` elements. SVG `<text>` content is text-only — no HTML parsing. However, if `currentTemp` contained markup (impossible from a numeric attribute, but defense in depth), SVG would render it as literal text. Secure.
- **Dynamic CSS variable injection**: `style="color: ${stateColor}"` — the `stateColor` values come from `getClimateActionColor()` which returns hardcoded CSS variable references. No user input reaches inline style values. Secure.

### Service Call Security

- **Four service call patterns**: `climate.set_temperature`, `climate.set_hvac_mode`, `climate.set_fan_mode`, `climate.set_preset_mode`. All use `hass.callService()` with `entity_id` from card config. Service names are hardcoded. No arbitrary service injection possible.
- **Thermostat control is a sensitive action**: Setting temperature to extremes (even within entity min/max) could cause physical consequences (pipes freezing, excessive energy use). The spec correctly clamps values but provides no confirmation dialog for extreme changes. Consider: if the delta between current and new setpoint exceeds 10°F/5°C, show a brief confirmation toast or require a press-and-hold interaction.
- **No admin-only data exposed**: Climate entity state and attributes are available to all HA users with dashboard access. The `require_admin: False` panel registration means any HA user can adjust the thermostat. This is **by design** for a home dashboard but should be documented as a conscious decision.

### Secrets & Sensitive Data

- **No credentials or tokens.** Climate entities are standard HA entities with no sensitive attributes exposed through the WebSocket API. No secrets surface.

### Recommendations

**MUST FIX:**

1. **Add absolute sane bounds on min/max temperature**: Before using entity-reported `min_temp`/`max_temp`, clamp them to physically reasonable ranges:
   ```javascript
   const safeMin = Math.max(attrs.min_temp || 45, -50);
   const safeMax = Math.min(attrs.max_temp || 95, 200);
   ```
   This prevents a malicious or buggy integration from allowing extreme setpoints.

**SHOULD FIX:**

2. **Validate mode values against entity's supported list**: Before calling `set_hvac_mode`, `set_fan_mode`, or `set_preset_mode`, verify the value is in the entity's current list of supported modes. This guards against race conditions and stale UI state.

3. **Rate-limit setpoint changes**: The +/- buttons can be clicked rapidly. Add debouncing (300ms) to prevent flooding the HA WebSocket with `set_temperature` calls. This protects both the HA backend and the physical HVAC equipment from rapid cycling.

**ADVISORY:**

4. **Large setpoint delta warning**: Consider a UX guard for setpoint changes exceeding 10°F/5°C from current temperature — not a security block, but a "are you sure?" pattern that prevents accidental extreme adjustments.

5. **OWASP compliance note**: No injection vectors (A03:2021). Broken access control (A01:2021) is mitigated by HA's authentication layer — all `callService` calls go through the authenticated WebSocket. Security misconfiguration (A05:2021) — the `require_admin: False` panel setting is documented and intentional.

---
