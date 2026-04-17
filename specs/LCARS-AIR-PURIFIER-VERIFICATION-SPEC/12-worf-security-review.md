## Worf — Security Review

**Reviewer**: Worf (Integration Security Expert)  
**Date**: Stardate 2026.04.13  
**Threat Level**: GREEN

*"This is a compatibility verification document, not a new panel. The attack surface is the existing atmoscrubber panel, which I have reviewed separately. My focus here is on the new integration's data paths."*

### Input Validation

- **BlueAir sensor values**: PM1, PM2.5, PM10, CO₂, VOC, temperature, humidity — all numeric sensor values from `ha_blueair` integration. These pass through HA's entity state system and are rendered via Lit templates with `Number()` coercion where needed. The existing `_getSensorIndicatorColor()` guards against `NaN`. Adequate.
- **Preset mode values**: BlueAir exposes `['auto', 'night']`. These are passed to `fan.set_preset_mode` — a standard HA service call. Values originate from the entity's `preset_modes` attribute, not user input. Secure.
- **PM2.5 → AQI fallback**: The `pm25Val * 4` linear approximation is a calculation on a numeric sensor value. No injection vector.

### XSS & DOM Safety

- **No new DOM rendering patterns**: This verification spec adds no new rendering code. All BlueAir entities render through existing atmoscrubber panel templates. The entity-driven architecture means `friendly_name` values are auto-escaped by Lit. No new XSS surface.
- **`light` domain routing proposal (§3.3)**: If `light` entities are added to the environment controls routing, they will be rendered as toggle buttons using the existing `_handleToggle()` pattern, which uses `homeassistant.toggle` service call. No new rendering code needed. No new XSS concern.

### Service Call Security

- **Same service calls as VeSync**: `fan.toggle`, `fan.set_preset_mode`, `switch.toggle`. All standard HA service calls through authenticated WebSocket. No new service call patterns introduced.
- **No `ha_blueair`-specific service calls**: Unlike ScreenLogic (which has custom actions), BlueAir uses only standard HA domains. No integration-specific service parameters.

### Secrets & Sensitive Data

- **No credentials surface.** BlueAir authentication is handled by the `ha_blueair` integration's config flow (cloud API key stored in HA config entries). No API keys, tokens, or credentials appear in entity attributes or service call parameters visible to the dashboard.

### Recommendations

**ADVISORY:**

1. **`ha_blueair` is a HACS integration**: As noted in the spec header (101+ stars, active maintenance), this is a community integration installed via HACS, not a core HA integration. HACS integrations have a larger supply chain attack surface — they are not reviewed by the HA core team. The `ha_blueair` dependency should be noted in the project's security posture documentation. If the integration is compromised, it could inject malicious data into entity attributes. The existing Lit auto-escaping provides defense against XSS from this vector.

2. **`device_class: battery` misclassification (§3.1)**: The filter life sensor's misclassification as `battery` does not create a security issue, but it could cause false positives in the battery panel detection heuristic. This is a data integrity concern, not a security concern. No action required from Security.

---
