## Worf — Security Review

**Reviewer**: Worf (Integration Security Expert)  
**Date**: Stardate 2026.04.13  
**Threat Level**: YELLOW

*"This grid calls four WebSocket registry APIs in parallel at card initialization. Those API calls return the full entity, device, area, and floor registries. I must verify that data is handled with care."*

### Input Validation

- **Temperature/humidity value parsing**: `getTempColor()` and `getHumidityColor()` guard against `null`/`NaN` with explicit checks. `Number(temp)` coercion is safe for numeric sensor states. Threshold parameters use destructuring defaults. Sound.
- **YAML config thresholds**: `temp_comfort_min`, `temp_comfort_max`, `humidity_comfort_min`, `humidity_comfort_max`, `battery_alert` are accepted from YAML card config. These should be clamped to sane ranges to prevent abuse: temperature thresholds to [-50, 200] and humidity to [0, 100]. Currently no validation is specified.
- **`show_appliance_meters` flag**: Boolean config value. No injection concern.
- **`rooms` config override**: If manually specified, `temperature`, `humidity`, and `battery` entity IDs are passed as strings from YAML. These are used only as keys to look up `hass.states[entityId]` — no service calls, no DOM injection. Safe.

### XSS & DOM Safety

- **Area names from HA registry**: Room tile names (`areaName`) come from `core.area_registry` or `device.name_by_user`. These are rendered via Lit template `${areaName}` — auto-escaped. A malicious area name like `<script>alert(1)</script>` would render as literal text. Secure.
- **Floor names from HA registry**: Same pattern — rendered via Lit, auto-escaped.
- **Sparkline SVG paths**: `sparklinePath()` generates SVG path `d` attributes from numeric arrays via string concatenation (`M${x},${y} L${x},${y}`). The values are `Number().toFixed(1)` outputs — always numeric strings. No injection possible in the path data.
- **`aria-label` attribute injection**: Template literals like `aria-label="${areaName}: ${temperature} degrees"` concatenate entity-derived values into HTML attributes. Lit escapes attribute values. However, if a room name contained a double-quote character, older Lit versions could be vulnerable. Lit v2+ handles this correctly via attribute binding (`attr=`). Verify the project uses Lit v2+. Low risk.

### Service Call Security

- **No service calls**: This is a **read-only monitoring panel**. No `hass.callService()` calls anywhere in the spec. The only HA API calls are:
  1. `hass.callWS({ type: 'config/entity_registry/list' })` — read-only
  2. `hass.callWS({ type: 'config/device_registry/list' })` — read-only
  3. `hass.callWS({ type: 'config/area_registry/list' })` — read-only
  4. `hass.callWS({ type: 'config/floor_registry/list' })` — read-only
  5. `hass.callApi('GET', 'history/period/...')` — read-only
- **No state-changing actions.** Minimal attack surface from service calls.

### Secrets & Sensitive Data

- **Registry data contains device metadata**: The `config/entity_registry/list` and `config/device_registry/list` responses include all entities and devices in the HA instance — not just SwitchBot meters. The `discoverSensorGroups()` function filters for `platform === 'switchbot'` and `device_class === 'temperature'`, but the **full registry data is fetched into browser memory first**. This means any entity's `entity_id`, `device_id`, `area_id`, `platform`, `device_class`, and `entity_category` are present in browser memory during discovery.
- **This is standard HA frontend behavior** — the official HA frontend does the same. However, it means the dashboard panel has access to the full entity/device registry regardless of which entities it actually renders. This is an inherent HA architecture characteristic, not a defect in this spec.

### Recommendations

**MUST FIX:**

1. **Clamp YAML config threshold values**: Add validation on config values:
   ```javascript
   const tempMin = Math.max(-50, Math.min(200, config.temp_comfort_min || 68));
   const tempMax = Math.max(-50, Math.min(200, config.temp_comfort_max || 76));
   const humMin = Math.max(0, Math.min(100, config.humidity_comfort_min || 30));
   const humMax = Math.max(0, Math.min(100, config.humidity_comfort_max || 60));
   const battAlert = Math.max(0, Math.min(100, config.battery_alert || 20));
   ```

**SHOULD FIX:**

2. **URL-encode entity_id in history API call**: `fetchSensorHistory()` constructs a URL with `filter_entity_id=${encodeURIComponent(entityId)}`. The `encodeURIComponent` is already present — verified. However, the rest path `history/period/${startISO}` should also ensure `startISO` is a valid ISO 8601 string and not attacker-controlled. Since it's generated from `new Date().toISOString()`, this is inherently safe.

3. **Cache and discard registry data after discovery**: After `discoverSensorGroups()` extracts the needed sensor groups, the full entity/device/area/floor registry arrays should not be retained in closure scope. Let them be garbage collected to minimize the window of exposure.

**ADVISORY:**

4. **WebSocket API authorization**: The four registry list calls (`config/entity_registry/list`, etc.) are available to any authenticated HA user, including non-admin users. The `require_admin: False` panel registration means any HA user can trigger these calls. This is **by design** — HA's frontend makes the same calls — but document this data access pattern for security-conscious users.

5. **Sparkline history data volume**: `fetchSensorHistory()` fetches 24 hours of history for each sensor entity. With 14 meters × 1 sensor each, that's 14 history API calls. Consider batching or throttling to prevent WebSocket congestion on slow HA instances.

---
