## Worf — Security Review

**Reviewer**: Worf (Integration Security Expert)  
**Date**: Stardate 2026.04.13  
**Threat Level**: YELLOW

*"Pool equipment operates high-voltage pumps and gas heaters. A compromised panel that sends rogue service calls can damage physical infrastructure. I review this with the gravity it deserves."*

### Input Validation

- **Pool/Spa setpoint clamping (§5.5)**: `adjustPoolSetpoint()` correctly clamps to `[min_temp, max_temp]` from entity attributes and rounds to `target_temp_step`. Same pattern as the climate panel — **apply the same absolute sane bounds recommendation** (40°F–120°F / 4°C–49°C for aquatic bodies, not the HVAC bounds).
- **Chemistry value rendering**: `getPhColor()`, `getOrpColor()`, `getSaltColor()`, `getSaturationColor()` all guard against `null`/`NaN` input with explicit checks. `Number(ph)` coercion is safe for numeric sensor values. Well-defended.
- **IntelliBrite color mode selection**: The `set_color_mode` service call (referenced in the Team Review Flags) passes a mode string from a hardcoded swatch map. No user-typed input reaches the service call. Secure.

### XSS & DOM Safety

- **All text rendering via Lit templates**: Temperature values, chemistry readings, zone labels, pump names — all rendered via Lit tagged template literals. **No `innerHTML` or `unsafeHTML()` detected.** Secure.
- **IntelliBrite swatch colors**: The swatch grid uses inline `background` styles with hardcoded hex values from the color mode table (§2). These are compile-time constants, not user input. Secure.
- **Water particle animation**: CSS-only animation with no user-controlled parameters. `generateWaterParticles()` uses `Math.random()` for positioning — no security concern.

### Service Call Security

- **Five service call categories identified**:
  1. `climate.set_temperature` — pool/spa setpoint adjustment
  2. `climate.set_hvac_mode` — heater on/off toggle
  3. `climate.set_preset_mode` — heat mode selection (heater/solar/off)
  4. `switch.turn_on` / `switch.turn_off` — pump circuit toggles
  5. ScreenLogic-specific actions (`set_color_mode`, `start_super_chlorination`, `stop_super_chlorination`)
- **Circuit switch toggles are safety-sensitive**: Turning pump circuits on/off affects physical equipment. The `switch.turn_on/off` calls are properly scoped with `entity_id`. However, there is **no confirmation for destructive actions** like stopping the pool pump (which could damage the filter/heater if water stops flowing while the heater is on). Consider: require press-and-hold for STOP actions on pump circuits.
- **`config_entry` parameter exposure**: The ScreenLogic-specific service calls require a `config_entry` ID parameter. The Team Review Flags correctly note this is standard practice. The config entry ID is a UUID that identifies the integration instance — it is not a secret, but it should not be logged or displayed in the UI. Verify it is only passed as a service call parameter, never rendered to DOM.
- **Super chlorination**: `start_super_chlorination` triggers a chemical treatment cycle. This is an **irreversible physical action** that adds chlorine to the water. It SHOULD require a confirmation dialog or press-and-hold interaction to prevent accidental activation.

### Secrets & Sensitive Data

- **No credentials or API keys.** ScreenLogic uses local push communication through the HA integration. The config_entry ID is a UUID, not a secret. No sensitive data surfaces in entity attributes or service call parameters.

### Recommendations

**MUST FIX:**

1. **Add absolute sane bounds for aquatic setpoints**: Pool/spa temperatures have different valid ranges than HVAC:
   ```javascript
   const safeMin = Math.max(attrs.min_temp || 40, 32);   // Never below freezing
   const safeMax = Math.min(attrs.max_temp || 104, 120);  // Never above scald risk
   ```

2. **Confirmation for super chlorination**: `start_super_chlorination` is an irreversible chemical action. Require either a confirmation dialog or 2-second press-and-hold before executing.

**SHOULD FIX:**

3. **Rate-limit setpoint changes**: Same debouncing recommendation as the climate panel (300ms) for pool/spa +/- buttons.

4. **Validate `config_entry` is never rendered to DOM**: Ensure the ScreenLogic config entry UUID is only used in `hass.callService()` data payloads, never interpolated into template HTML or logged.

5. **Pump safety interlock warning**: If the user attempts to turn off the pool pump while the heater's `hvac_action` is `heating`, display a warning: "HEATER ACTIVE — stopping pump may cause equipment damage." This is not strictly a security concern but prevents physical infrastructure damage from UI actions.

**ADVISORY:**

6. **Chemistry alert escalation**: As noted in the Team Review Flags, chemistry alerts (pH/ORP out of range) warrant HA notification automation outside the dashboard. The panel should document recommended HA automation triggers for critical chemistry thresholds.

7. **OWASP compliance note**: No injection vectors. Service calls are authenticated through HA WebSocket. The `config_entry` parameter is the most unusual data flow — verified as a standard integration pattern, not a credential.

---
