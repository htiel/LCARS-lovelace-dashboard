# LCARS Climate Panel — Portable Air Conditioner Addendum

**Author**: Geordi La Forge (LCARS UI Design Authority)  
**Date**: Stardate 2026.04.20  
**Status**: SHIPPED — implemented in v4.23.0-beta.1; carried over to v5. Auxiliary switch handling lives inside the shared climate panel (`js/src/panels/climate/lcars-climate-panel.js` §4X-56), not a dedicated panel. Current as of v5.1.0-beta.38.  
**Priority**: MEDIUM  
**Panel Type**: Climate (Portable AC variant)  
**Integration**: `midea_ac_lan` (HACS: github.com/wuwentao/midea_ac_lan)  
**Base Spec**: LCARS-CLIMATE-PANEL-SPEC.md  
**Extends**: `LcarsDevicePanelBase` (per LCARS-DEVICE-PANEL-SPEC.md §9)  
**Target Device**: Midea Portable Air Conditioner (with thermostat)

---

## 0. Design Philosophy & Architectural Decision

### Decision: Reuse Climate Panel — Not a New Panel Type

The Midea portable AC exposes a standard Home Assistant `climate` entity with `current_temperature`, `temperature` (setpoint), `hvac_mode`, `fan_mode`, and `hvac_action` attributes. It is **architecturally identical** to a central HVAC thermostat from the Climate Panel's perspective.

*"It's the same EPS conduit — it just feeds a smaller nacelle."*

**Justification**:
1. The `climate` domain contract is fully satisfied — modes, setpoint, fan, action reporting
2. The Climate Panel already renders dynamically: only supported modes appear, fan/preset strips hide when absent
3. The temperature arc, action→color mapping, mode strip, and setpoint controls all apply directly
4. Creating a separate panel type would violate DRY and fragment the environmental control interface
5. Per Roddenberry: **simplicity is the Omega state** — one panel type for all thermostat-controlled climate devices

**What this addendum covers**:
- Confirming which Climate Panel features work as-is with portable ACs
- Documenting which HVAC modes are absent (no `heat`, no `heat_cool`)
- Specifying how the auxiliary Midea entities (eco switch, turbo switch, timer, swing, beep) render within the Climate Panel's existing `auxctrl` grid area
- Adding the portable AC as a recognized device profile in §15 of the Climate Panel spec

---

## 1. Entity Mapping — Midea Portable AC

### 1.1 Primary Climate Entity

| Attribute              | Midea Value                                      | Climate Panel Usage                       | Compatible? |
|------------------------|--------------------------------------------------|-------------------------------------------|-------------|
| `state`                | `cool`, `fan_only`, `dry`, `auto`, `off`         | Mode strip buttons                        | ✅ Direct    |
| `current_temperature`  | Room temp (°F/°C from built-in sensor)           | Large temp display + arc                  | ✅ Direct    |
| `temperature`          | Target setpoint (single only)                    | Setpoint control + arc tick               | ✅ Direct    |
| `hvac_action`          | `cooling`, `idle`, `drying`, `fan`, `off`        | Dynamic frame color + action badge        | ✅ Direct    |
| `hvac_modes`           | `['cool', 'fan_only', 'dry', 'auto', 'off']`    | Mode strip (dynamic, only shows these)    | ✅ Direct    |
| `fan_mode`             | Current fan speed                                | Fan mode selector active state            | ✅ Direct    |
| `fan_modes`            | `['auto', 'low', 'medium', 'high']`             | Fan mode strip buttons                    | ✅ Direct    |
| `swing_mode`           | `off`, `vertical`, etc.                          | Aux control (see §3)                      | ✅ New       |
| `swing_modes`          | Available swing positions                        | Swing mode strip (see §3)                 | ✅ New       |
| `min_temp`             | Integration-defined minimum (typically 62°F)     | Arc range + setpoint clamping             | ✅ Direct    |
| `max_temp`             | Integration-defined maximum (typically 86°F)     | Arc range + setpoint clamping             | ✅ Direct    |
| `target_temp_step`     | `1` (whole degrees)                              | Setpoint ± button increment               | ✅ Direct    |
| `target_temp_high`     | **Not provided** (no dual setpoint)              | Hidden — `isDualSetpoint()` returns false | ✅ Graceful  |
| `target_temp_low`      | **Not provided**                                 | Hidden                                    | ✅ Graceful  |
| `preset_mode`          | **Not provided** (no presets on Midea)           | Section hidden — `hasPresetModes()` false | ✅ Graceful  |

### 1.2 Auxiliary Entities (Midea-Specific)

These entities are exposed by `midea_ac_lan` as separate switches/numbers/selects — they are **not** part of the standard `climate` entity attributes.

| Entity Pattern                      | Domain   | Purpose                        | Panel Location          |
|-------------------------------------|----------|--------------------------------|-------------------------|
| `switch.midea_*_eco_mode`           | `switch` | Energy-saving mode toggle      | Aux controls row        |
| `switch.midea_*_turbo_mode`         | `switch` | Maximum cooling boost          | Aux controls row        |
| `switch.midea_*_swing_mode`         | `switch` | Vane oscillation toggle        | Aux controls row        |
| `switch.midea_*_beep`              | `switch` | Audible feedback on/off        | Diagnostics (hidden)    |
| `number.midea_*_timer`             | `number` | Auto-off timer (hours)         | Aux controls row        |
| `select.midea_*_fan_speed`         | `select` | Granular fan speed (if exposed)| Hidden (fan_mode covers)|
| `sensor.midea_*_outdoor_temperature`| `sensor` | Outdoor temp reading           | Sensor telemetry column |
| `sensor.midea_*_indoor_humidity`   | `sensor` | Room humidity                  | Sensor telemetry column |

### 1.3 Entity Classification Logic (Extended)

The Climate Panel's `classifyClimateEntities()` (base spec §10) already routes entities by domain and category. For Midea devices, the following extensions apply:

```javascript
/**
 * Extended classification for portable AC devices.
 * Adds: auxSwitches, auxNumbers categories for device-specific controls.
 * Called after base classifyClimateEntities().
 */
function classifyPortableAcEntities(entities) {
  const base = classifyClimateEntities(entities);
  
  // Additional categories for portable AC auxiliary entities
  base.auxSwitches = [];  // eco, turbo, swing toggles
  base.auxNumbers = [];   // timer
  base.auxSelects = [];   // granular fan speed (if separate from climate fan_mode)

  const AUX_SWITCH_PATTERNS = ['eco_mode', 'turbo_mode', 'swing_mode'];
  const HIDDEN_SWITCHES = ['beep'];  // config-category, not shown in panel

  for (const e of entities) {
    const domain = e.entity_id.split('.')[0];
    const entityName = e.entity_id.split('.')[1] || '';
    const cat = e.entity_category || '';

    // Skip already-classified entities
    if (domain === 'climate' || domain === 'binary_sensor') continue;
    if (base.sensors.includes(e)) continue;

    // Route auxiliary switches
    if (domain === 'switch' && cat !== 'diagnostic') {
      if (HIDDEN_SWITCHES.some(p => entityName.includes(p))) {
        base.diagnostics.push(e);
      } else if (AUX_SWITCH_PATTERNS.some(p => entityName.includes(p))) {
        base.auxSwitches.push(e);
      }
      continue;
    }

    // Route timer/number entities
    if (domain === 'number' && cat !== 'diagnostic') {
      base.auxNumbers.push(e);
      continue;
    }

    // Route select entities (granular fan speed)
    if (domain === 'select' && cat !== 'diagnostic') {
      base.auxSelects.push(e);
      continue;
    }
  }

  return base;
}
```

---

## 2. Feature Compatibility Matrix

### 2.1 Climate Panel Features — Portable AC Applicability

| Climate Panel Feature              | Portable AC Status | Notes                                                       |
|------------------------------------|--------------------|-------------------------------------------------------------|
| **Dynamic frame color (hvac_action)** | ✅ Full support  | `cooling`→ice, `idle`→sunflower, `fan`→violet, `drying`→almond, `off`→gray |
| **Temperature arc (SVG)**          | ✅ Full support    | Single setpoint always. Arc shows current temp within min/max range |
| **Setpoint controls (± buttons)**  | ✅ Full support    | Single `temperature` target. Clamped to `min_temp`/`max_temp` |
| **Mode strip**                     | ✅ Full support    | Renders only available modes: COOL, FAN, DRY, AUTO, OFF     |
| **Fan mode strip**                 | ✅ Full support    | Renders AUTO, LOW, MEDIUM, HIGH from `fan_modes`            |
| **Dual setpoint (heat_cool)**      | ⬜ N/A             | Never triggered — no `heat_cool` mode in `hvac_modes`       |
| **Heating pulse animation**        | ⬜ N/A             | Never triggered — `hvac_action` never reports `heating`     |
| **Preset mode strip**              | ⬜ N/A             | `hasPresetModes()` returns false — section hidden           |
| **Fault indicators**               | ✅ Works           | If device exposes `binary_sensor` with `problem`/`connectivity` class |
| **Humidity sensor line**           | ✅ Works           | From `sensor.midea_*_indoor_humidity` (linked entity) or `current_humidity` attr |
| **Outdoor temperature**            | ✅ Works           | `sensor.midea_*_outdoor_temperature` renders in sensor column |
| **Header action badge**            | ✅ Full support    | "COOLING", "IDLE", "FAN", "DRYING", "OFF"                  |
| **Ambient cooling animation**      | ✅ Full support    | Arc pulses when `hvac_action === 'cooling'`                 |
| **Viewscreen activation**          | ✅ Full support    | Standard clip-path entrance animation                       |
| **Frame pulse (active cooling)**   | ✅ Full support    | Ice-blue frame pulse during compressor operation            |

### 2.2 Modes Not Present (Graceful Absence)

| Missing Mode    | Impact                                                    |
|-----------------|-----------------------------------------------------------|
| `heat`          | Button not rendered in mode strip. No butterscotch heating state. |
| `heat_cool`     | Button not rendered. `isDualSetpoint()` always false.     |
| `eco` (Nest)    | Midea has eco as a separate switch, not an HVAC mode — see §3 |

The Climate Panel already handles absent modes by reading `hvac_modes` dynamically and only rendering buttons for listed modes. **Zero code changes needed** for mode absence.

---

## 3. Auxiliary Controls — Portable AC Extension

### 3.1 Design Philosophy

The Midea portable AC exposes operational modes (eco, turbo, swing) as **separate switch entities** rather than as HVAC modes or presets. This is a common pattern for HACS climate integrations that expose device-specific features beyond the standard `climate` platform.

These controls integrate into the Climate Panel's **`auxctrl` grid area** — the same row that houses Fan Mode and Preset Mode strips in the base spec. They render as a third group within that row, visually consistent with the existing aux buttons.

*"Same Engineering console, additional subsystem controls in the lower panel."*

### 3.2 Extended Aux Controls Layout

```
┌──────────────────────────────────────────────────────────────┐
│  FAN: ○ AUTO  ● LOW  ○ MED  ○ HIGH                          │  ← fan modes (base)
├──────────────────────────────────────────────────────────────┤
│  SWING: ○ OFF  ● VERTICAL                                   │  ← swing mode (if supported via climate attr)
├──────────────────────────────────────────────────────────────┤
│  ┌────────╮  ┌────────╮  ┌────────╮       TIMER: [  2h  ]   │  ← aux switches + timer
│  │  ECO   │  │ TURBO  │  │ SWING  │                         │
│  └────────╯  └────────╯  └────────╯                         │
└──────────────────────────────────────────────────────────────┘
```

### 3.3 Swing Mode Integration (Climate Attribute)

If the `climate` entity exposes `swing_mode` and `swing_modes` attributes, render a swing mode strip **between** the fan mode strip and the auxiliary switches. This uses the same `climate-aux-group` pattern:

```html
<!-- Swing Mode (if supported via climate entity swing_modes attribute) -->
<div class="climate-aux-group" role="group" aria-label="Swing mode"
     ?hidden="${!hasSwingModes(stateObj)}">
  <span class="climate-aux-label">SWING</span>
  <div class="climate-aux-strip" role="radiogroup" aria-label="Swing direction">
    ${swingModes.map(mode => html`
      <button class="climate-aux-btn ${mode === currentSwingMode ? 'active' : ''}"
              role="radio"
              aria-checked="${mode === currentSwingMode}"
              aria-label="Swing: ${mode}"
              @click="${() => setSwingMode(mode)}">
        ${mode.toUpperCase().replace(/_/g, ' ')}
      </button>
    `)}
  </div>
</div>
```

```javascript
/**
 * Check if climate entity supports swing modes.
 */
function hasSwingModes(stateObj) {
  const modes = stateObj?.attributes?.swing_modes;
  return Array.isArray(modes) && modes.length > 0;
}

/**
 * Set swing mode via HA service call.
 */
function setSwingMode(hass, entityId, swingMode) {
  hass.callService('climate', 'set_swing_mode', {
    entity_id: entityId,
    swing_mode: swingMode,
  });
}
```

### 3.4 Auxiliary Switch Toggles (Eco / Turbo / Swing)

The Midea-specific switch entities render as **toggle pill buttons** in a dedicated group below the climate-native controls. These are binary on/off — not radiogroup members.

```html
<!-- Portable AC Auxiliary Switches -->
<div class="climate-aux-group" role="group" aria-label="Portable AC controls"
     ?hidden="${auxSwitches.length === 0}">
  <span class="climate-aux-label">SYSTEM</span>
  <div class="climate-aux-strip">
    ${auxSwitches.map(entity => html`
      <button class="climate-aux-btn toggle ${getState(entity) === 'on' ? 'active' : ''}"
              role="switch"
              aria-checked="${getState(entity) === 'on'}"
              aria-label="${getAuxSwitchLabel(entity)}: ${getState(entity)}"
              style="--toggle-color: ${getAuxSwitchColor(entity)}"
              @click="${() => toggleSwitch(entity)}">
        <ha-icon icon="${getAuxSwitchIcon(entity)}" aria-hidden="true"></ha-icon>
        ${getAuxSwitchLabel(entity)}
      </button>
    `)}
  </div>
</div>
```

### 3.5 Auxiliary Switch Semantics

| Switch Entity Pattern   | Label    | Icon              | Active Color                 | Rationale                               |
|-------------------------|----------|-------------------|------------------------------|-----------------------------------------|
| `*_eco_mode`            | ECO      | `mdi:leaf`        | `var(--lcars-sunflower)`     | Green/eco → warm neutral, energy saving |
| `*_turbo_mode`          | TURBO    | `mdi:rocket-launch` | `var(--lcars-ice)`         | Maximum cooling → same hue as cooling   |
| `*_swing_mode`          | SWING    | `mdi:arrow-oscillating` | `var(--lcars-african-violet)` | Mechanical movement → distinct hue |

```javascript
/**
 * Resolve auxiliary switch entity to LCARS label.
 */
function getAuxSwitchLabel(entity) {
  const eid = entity.entity_id || '';
  if (eid.includes('eco_mode'))   return 'ECO';
  if (eid.includes('turbo_mode')) return 'TURBO';
  if (eid.includes('swing_mode')) return 'SWING';
  // Fallback: use friendly_name with LCARS formatting
  return (entity.name || entity.original_name || 'SWITCH').toUpperCase();
}

/**
 * Resolve auxiliary switch entity to MDI icon.
 */
function getAuxSwitchIcon(entity) {
  const eid = entity.entity_id || '';
  if (eid.includes('eco_mode'))   return 'mdi:leaf';
  if (eid.includes('turbo_mode')) return 'mdi:rocket-launch';
  if (eid.includes('swing_mode')) return 'mdi:arrow-oscillating';
  return 'mdi:toggle-switch-outline';
}

/**
 * Resolve auxiliary switch active color.
 */
function getAuxSwitchColor(entity) {
  const eid = entity.entity_id || '';
  if (eid.includes('eco_mode'))   return 'var(--lcars-sunflower)';
  if (eid.includes('turbo_mode')) return 'var(--lcars-ice)';
  if (eid.includes('swing_mode')) return 'var(--lcars-african-violet)';
  return 'var(--lcars-gold)';
}

/**
 * Toggle a switch entity.
 */
function toggleSwitch(hass, entity) {
  const entityId = entity.entity_id;
  hass.callService('switch', 'toggle', { entity_id: entityId });
}
```

### 3.6 Auxiliary Switch CSS

```css
/* Toggle-style aux button — differs from radiogroup: uses role="switch" */
.climate-aux-btn.toggle {
  /* Same base styles as .climate-aux-btn from Climate Panel §7 */
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  height: 2.25rem;                              /* 36px — exceeds 24px minimum */
  padding: 0 0.75rem;
  min-width: 4.5rem;                            /* WCAG 2.5.8 — slightly wider for icon+text */

  background: var(--lcars-disabled);
  color: var(--lcars-space-white);
  border: none;
  border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;

  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  text-transform: uppercase;
  cursor: pointer;
  transition: filter var(--lcars-transition), background var(--lcars-transition);
  user-select: none;
}

.climate-aux-btn.toggle:hover {
  filter: brightness(1.2);
}

.climate-aux-btn.toggle:focus-visible {
  outline: 2px solid var(--lcars-ice);
  outline-offset: 2px;
}

/* Active state — uses per-switch dynamic color */
.climate-aux-btn.toggle.active,
.climate-aux-btn.toggle[aria-checked="true"] {
  background: var(--toggle-color, var(--lcars-gold));
  color: var(--lcars-black);
}

.climate-aux-btn.toggle ha-icon {
  --mdc-icon-size: 14px;
  flex-shrink: 0;
}
```

### 3.7 Timer Control (Number Entity)

The `number.midea_*_timer` entity provides auto-off timer functionality (typically 0–24 hours). This renders as a compact inline stepper in the aux controls row.

```html
<!-- Timer Control (if timer entity exists) -->
<div class="climate-aux-group" role="group" aria-label="Auto-off timer"
     ?hidden="${!timerEntity}">
  <span class="climate-aux-label">TIMER</span>
  <div class="climate-timer-control">
    <button class="climate-setpoint-btn decrement"
            aria-label="Decrease timer"
            @click="${() => adjustTimer(-timerStep)}"
            ?disabled="${timerValue <= timerMin}">
      <span aria-hidden="true">–</span>
    </button>
    <span class="climate-timer-value"
          role="status"
          aria-label="Timer set to ${timerValue} hours">
      ${timerValue > 0 ? `${timerValue}H` : 'OFF'}
    </span>
    <button class="climate-setpoint-btn increment"
            aria-label="Increase timer"
            @click="${() => adjustTimer(+timerStep)}"
            ?disabled="${timerValue >= timerMax}">
      <span aria-hidden="true">+</span>
    </button>
  </div>
</div>
```

```javascript
/**
 * Adjust the auto-off timer via number.set_value service.
 * Clamps between min and max defined by the number entity.
 */
function adjustTimer(hass, entityId, delta) {
  const stateObj = hass.states[entityId];
  if (!stateObj) return;

  const attrs = stateObj.attributes;
  const min = attrs.min ?? 0;
  const max = attrs.max ?? 24;
  const step = attrs.step ?? 1;
  const current = parseFloat(stateObj.state) || 0;

  const newVal = Math.max(min, Math.min(max, current + delta));

  hass.callService('number', 'set_value', {
    entity_id: entityId,
    value: newVal,
  });
}
```

### 3.8 Timer CSS

```css
.climate-timer-control {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.climate-timer-value {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-gold);
  text-transform: uppercase;
  font-weight: 700;
  min-width: 3rem;
  text-align: center;
  transition: color var(--lcars-transition);
}

/* Timer at 0 = OFF → dimmed */
.climate-timer-value[data-off] {
  color: var(--lcars-disabled);
  font-weight: 400;
}
```

---

## 4. Sensor Telemetry Column — Extended Rows

### 4.1 Additional Sensor Lines for Portable AC

The left-column sensor telemetry (Climate Panel §4) gains additional rows when Midea-specific sensors are present:

| Row | Sensor              | Source Entity                           | Unit  | Color                            | Condition            |
|-----|---------------------|-----------------------------------------|-------|----------------------------------|----------------------|
| 1   | Current Temp        | `current_temperature` attr              | °F/°C | Dynamic `--climate-action-color` | Always               |
| 2   | Target Temp         | `temperature` attr                      | °F/°C | `var(--lcars-gold)`              | When not OFF         |
| 3   | Humidity            | `sensor.midea_*_indoor_humidity` or attr| %     | `var(--lcars-data-accent)`       | If entity exists     |
| 4   | Outdoor Temp        | `sensor.midea_*_outdoor_temperature`    | °F/°C | `var(--lcars-ice)`               | If entity exists     |
| —   | *(divider)*         |                                         |       |                                  |                      |
| 5   | HVAC Mode           | `state` (climate entity)                | —     | Dynamic per-mode color           | Always               |
| 6   | Fan Mode            | `fan_mode` attr                         | —     | `var(--lcars-data-accent)`       | Always               |
| 7   | Eco Mode            | `switch.midea_*_eco_mode` state         | —     | `var(--lcars-sunflower)`/gray    | If entity exists     |
| 8   | Turbo Mode          | `switch.midea_*_turbo_mode` state       | —     | `var(--lcars-ice)`/gray          | If entity exists     |
| —   | *(divider)*         |                                         |       |                                  |                      |
| 9   | Timer               | `number.midea_*_timer` state            | hrs   | `var(--lcars-gold)`/gray         | If entity exists     |
| 10  | Faults              | Linked `binary_sensor` entities         | —     | Tomato/gray                      | If entities exist    |

### 4.2 Outdoor Temperature Color

The outdoor temperature sensor (if available) uses `--lcars-ice` coloring to visually distinguish it from the **indoor** current temperature (which uses the dynamic action color). This provides instant visual differentiation — indoor temp tracks the system state (warm/cool/neutral), outdoor temp is always the "outside world" in cool blue.

```javascript
/**
 * Determine if an entity is the outdoor temperature sensor.
 * Used for special color treatment in the sensor column.
 */
function isOutdoorTempSensor(entity) {
  const eid = entity.entity_id || '';
  const name = (entity.original_name || entity.name || '').toLowerCase();
  return eid.includes('outdoor_temperature') || name.includes('outdoor');
}
```

---

## 5. HVAC Action → Color Mapping (Portable AC Subset)

The Climate Panel's full color map (base spec §2) applies, but portable ACs only trigger a subset:

| `hvac_action` | Triggered by Portable AC? | LCARS Color              | Visual Meaning                         |
|---------------|---------------------------|--------------------------|----------------------------------------|
| `heating`     | ❌ Never                  | —                        | —                                      |
| `cooling`     | ✅ Compressor running     | `--lcars-ice`            | Active cooling — ice-blue frame        |
| `idle`        | ✅ At setpoint/standby    | `--lcars-sunflower`      | Reached target, compressor off         |
| `drying`      | ✅ Dehumidification mode  | `--lcars-almond`         | Moisture removal active                |
| `fan`         | ✅ Fan-only circulation   | `--lcars-african-violet` | Air circulation without temp control   |
| `off`         | ✅ Unit powered down      | `--lcars-gray`           | System off                             |

### Practical Implication

The Climate Panel's `heating` animation (butterscotch pulse) will **never fire** for this device. The dominant visual states will be:
- **Ice-blue frame** (cooling active) — the most common operating state
- **Sunflower frame** (idle at target) — when the room is cool enough
- **Violet frame** (fan only) — circulation without cooling
- **Almond frame** (drying) — dehumidification mode

This means the portable AC panel will predominantly present in the **cool color family** — ice and sunflower — which is appropriate and visually communicates "this is a cooling device."

---

## 6. Mode Strip — Portable AC Configuration

### Available Modes (Typical Midea Portable AC)

```
┌──────╮ ┌──────╮ ┌──────╮ ┌──────╮ ┌──────╮
│ COOL │ │ FAN  │ │ DRY  │ │ AUTO │ │ OFF  │
└──────╯ └──────╯ └──────╯ └──────╯ └──────╯
```

### Mode Button Colors

| Mode       | Active Color            | Icon                           | Notes                                |
|------------|-------------------------|--------------------------------|--------------------------------------|
| `cool`     | `--lcars-ice`           | `mdi:snowflake`                | Primary use case                     |
| `fan_only` | `--lcars-african-violet`| `mdi:fan`                      | Circulation only                     |
| `dry`      | `--lcars-almond`        | `mdi:water-percent`            | Dehumidification                     |
| `auto`     | `--lcars-gold`          | `mdi:thermostat-auto`          | Device decides cool/fan/dry          |
| `off`      | `--lcars-gray`          | `mdi:power`                    | Shutdown                             |

**Note**: `heat` and `heat_cool` buttons simply won't appear — the existing Climate Panel only renders buttons for modes listed in `stateObj.attributes.hvac_modes`. No code change needed.

---

## 7. Eco/Turbo Mutual Exclusivity

### Business Rule

On most Midea portable ACs, **eco mode and turbo mode are mutually exclusive** — enabling one disables the other. The integration handles this at the device level, but the panel should provide visual feedback:

```javascript
/**
 * Handle aux switch toggle with mutual exclusivity awareness.
 * When turbo is activated, eco deactivates (and vice versa) at the device level.
 * The panel reflects this via state subscription — no manual toggle needed.
 * 
 * However, provide immediate optimistic UI feedback:
 */
function handleAuxToggle(hass, entity, allAuxSwitches) {
  const eid = entity.entity_id;
  
  // Toggle the requested switch
  hass.callService('switch', 'toggle', { entity_id: eid });
  
  // The integration will handle mutual exclusivity.
  // HA state updates via WebSocket will reflect the change in both entities.
  // No manual secondary toggle needed — let the subscription update the UI.
}
```

### Visual Feedback

When eco is ON:
- ECO button: active, `--lcars-sunflower` background
- TURBO button: inactive, `--lcars-disabled` background

When turbo is ON:
- TURBO button: active, `--lcars-ice` background  
- ECO button: inactive, `--lcars-disabled` background

Both OFF:
- Both buttons: inactive, `--lcars-disabled` background

This requires no special logic — standard `aria-checked` state binding handles it through HA state subscription.

---

## 8. Complete Panel Layout — Portable AC Instance

### ASCII Layout (Full Panel)

```
┌──────────────────────────────────────────────────────────────┐
│  BEDROOM AC                      COOLING   72°F              │  ← header (ice frame)
├──────────────────┬───────────────────────────────────────────┤
│                  │        ╔══════════════════════╗           │
│  CURRENT  72°F   │        ║                      ║           │
│  TARGET   68°F   │        ║     ┌───────────┐    ║           │
│  HUMIDITY  58%   │        ║     │           │    ║           │
│  OUTDOOR   84°F  │        ║     │    72°    │    ║           │
│                  │        ║     │  CURRENT  │    ║           │
│  MODE     COOL   │        ║     │           │    ║           │
│  FAN      HIGH   │        ║     └───────────┘    ║           │
│  ECO      ON     │        ║                      ║           │
│  TURBO    OFF    │        ║   ┌──╮  TARGET  ┌──╮ ║           │
│                  │        ║   │ –│   68°F   │ +│ ║           │
│  TIMER    2H     │        ║   └──╯          └──╯ ║           │
│                  │        ╚══════════════════════╝           │
│  FAULTS          │                                           │
│  ● NONE          │                                           │
├──────────────────┴───────────────────────────────────────────┤
│  ┌──────╮ ┌──────╮ ┌──────╮ ┌──────╮ ┌──────╮              │  ← mode strip
│  │ COOL │ │ FAN  │ │ DRY  │ │ AUTO │ │ OFF  │              │
│  └──────╯ └──────╯ └──────╯ └──────╯ └──────╯              │
├──────────────────────────────────────────────────────────────┤
│  FAN: ○ AUTO  ● LOW  ○ MED  ○ HIGH                          │  ← fan modes
├──────────────────────────────────────────────────────────────┤
│  SWING: ○ OFF  ● VERTICAL                                   │  ← swing modes
├──────────────────────────────────────────────────────────────┤
│  SYSTEM: [🍃 ECO] [🚀 TURBO] [↔ SWING]    TIMER: [– 2H +]  │  ← aux switches + timer
└──────────────────────────────────────────────────────────────┘
```

### Grid Template (Extended)

The Climate Panel's base grid gains one additional row when aux switches are present:

```css
/* Extended grid for portable AC with aux switches */
.lcars-climate-panel.has-aux-switches {
  grid-template-areas:
    "header   header"
    "sensors  media"
    "modes    modes"
    "auxctrl  auxctrl"
    "auxswitch auxswitch";
  grid-template-rows: auto 1fr auto auto auto;
}
```

**Alternative (preferred)**: Keep the 4-row grid and render aux switches **within** the existing `auxctrl` row, after the fan/preset groups. This avoids grid template changes:

```css
/* No grid change needed — aux switches render inside .climate-aux-controls */
.climate-aux-controls {
  grid-area: auxctrl;
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--lcars-gap) * 4);
  padding-top: var(--lcars-gap);
  border-top: 2px solid var(--panel-frame-color);
}
```

The aux switch group and timer become additional `.climate-aux-group` children in the same flex container. **Recommended approach** — maintains the Climate Panel's existing grid and simply adds more content to the aux row.

---

## 9. Accessibility (a11y) — Portable AC Additions

### 9.1 Keyboard Navigation (Extended Tab Order)

Appended to Climate Panel §14.1 tab order:

| Element                  | Focusable        | Keydown Handlers                              |
|--------------------------|------------------|-----------------------------------------------|
| Swing mode buttons       | `<button>`       | `radiogroup` pattern: Arrow Left/Right        |
| ECO toggle               | `<button>`       | `Enter`/`Space` → toggle switch               |
| TURBO toggle             | `<button>`       | `Enter`/`Space` → toggle switch               |
| SWING toggle             | `<button>`       | `Enter`/`Space` → toggle switch               |
| Timer – button           | `<button>`       | Native keyboard                               |
| Timer + button           | `<button>`       | Native keyboard                               |

### 9.2 ARIA Patterns for Toggle Switches

Auxiliary switches use `role="switch"` (not `role="radio"`) because they are independent binary toggles:

```html
<button role="switch"
        aria-checked="true"
        aria-label="Eco mode: on">
  ...
</button>
```

Per ARIA Authoring Practices: `role="switch"` is semantically correct for two-state toggles that the user activates/deactivates independently.

### 9.3 Screen Reader Announcements

```javascript
// Additional announcements for portable AC controls:
// announceClimateChange(el, 'Bedroom AC', 'eco mode enabled');
// announceClimateChange(el, 'Bedroom AC', 'turbo mode disabled');
// announceClimateChange(el, 'Bedroom AC', 'timer set to 2 hours');
// announceClimateChange(el, 'Bedroom AC', 'swing mode set to vertical');
```

### 9.4 Target Size Verification

| Element               | Size                | Pixels (at 16px base)  | Passes?   |
|-----------------------|---------------------|------------------------|-----------|
| Aux toggle button     | 2.25rem × 4.5rem   | 36px × 72px            | ✅ AA     |
| Timer ± button        | 2.5rem × 2.5rem    | 40px × 40px            | ✅ AAA    |
| Swing mode button     | 2.25rem × 3.5rem   | 36px × 56px            | ✅ AA     |

All exceed WCAG 2.5.8 minimum of 24×24 CSS pixels.

---

## 10. Portable AC → Climate Panel Detection

### 10.1 Auto-Detection Heuristic

The portable AC does **not** require a separate panel type. It is detected as a standard climate device and assigned `PANEL_TYPE_CLIMATE`. The existing heuristic works:

```javascript
// From panel type detection logic:
// If device has a climate entity → PANEL_TYPE_CLIMATE
// The panel renders dynamically based on available attributes.
```

### 10.2 Portable AC Feature Detection

To determine if auxiliary switch rendering is needed, check for companion switch entities on the same device:

```javascript
/**
 * Detect if a climate device has portable AC-style auxiliary controls.
 * Returns true if device has eco_mode, turbo_mode, or similar switch entities.
 */
function hasPortableAcAuxControls(deviceEntities) {
  const AUX_PATTERNS = ['eco_mode', 'turbo_mode', 'swing_mode'];
  return deviceEntities.some(e => {
    const domain = e.entity_id.split('.')[0];
    if (domain !== 'switch') return false;
    const cat = e.entity_category || '';
    if (cat === 'diagnostic' || cat === 'config') return false;
    return AUX_PATTERNS.some(p => e.entity_id.includes(p));
  });
}
```

### 10.3 Conditional Rendering Flow

```javascript
render() {
  // ... existing Climate Panel render ...

  const deviceEntities = this._getDeviceEntities();
  const classified = classifyPortableAcEntities(deviceEntities);
  
  // Base Climate Panel sections (always)
  const showFanMode = hasFanModes(stateObj);
  const showPresetMode = hasPresetModes(stateObj);
  const showSwingMode = hasSwingModes(stateObj);
  
  // Portable AC extensions (conditional)
  const showAuxSwitches = classified.auxSwitches.length > 0;
  const showTimer = classified.auxNumbers.length > 0;

  return html`
    <!-- header, sensors, media, mode strip — standard Climate Panel -->
    ...
    
    <!-- Aux controls row -->
    <div class="climate-aux-controls">
      ${showFanMode ? this._renderFanModeStrip() : ''}
      ${showSwingMode ? this._renderSwingModeStrip() : ''}
      ${showPresetMode ? this._renderPresetStrip() : ''}
      ${showAuxSwitches ? this._renderAuxSwitches(classified.auxSwitches) : ''}
      ${showTimer ? this._renderTimerControl(classified.auxNumbers[0]) : ''}
    </div>
  `;
}
```

---

## 11. Edge Cases & Graceful Degradation

### 11.1 Entity Unavailable

| Scenario                                 | Panel Behavior                                           |
|------------------------------------------|----------------------------------------------------------|
| Climate entity unavailable               | Full panel grays out, action badge shows "OFFLINE"       |
| Eco/turbo switch unavailable             | Toggle button hidden (entity not in `auxSwitches` list)  |
| Timer entity unavailable                 | Timer group hidden                                       |
| Outdoor temp sensor unavailable          | Sensor line hidden — no "N/A" placeholder                |
| Humidity sensor unavailable              | Humidity row hidden                                      |
| All aux switches unavailable             | Aux switch group hidden — panel looks like base Climate  |

### 11.2 Device Without All Midea Entities

Not all Midea devices expose all entities. Some portable ACs may lack:
- Outdoor temperature sensor (single-hose units without external probe)
- Timer entity (simpler models)
- Swing mode (fixed-direction units)

The panel handles this identically to how the base Climate Panel handles missing presets or fan modes — **conditional rendering based on entity existence**. An LCARS panel with fewer controls simply has more empty space, which per Bracer Jack is beautiful.

### 11.3 Integration Not Responding

If `midea_ac_lan` stops responding (LAN connectivity lost), the climate entity goes `unavailable`:
- Frame color → `--lcars-gray`
- Action badge → "OFFLINE" in gray
- All controls disabled (`pointer-events: none; opacity: 0.5`)
- Sensor values show last known value with `(STALE)` suffix
- Fault section shows connectivity binary_sensor if one exists

---

## 12. Beep Switch — Hidden by Design

The `switch.midea_*_beep` entity controls whether the physical unit beeps on button press. This is a **configuration preference**, not an operational control. It is classified as `diagnostic` category and rendered in the panel's collapsed diagnostics section (accessed via the gear/details button) — not in the main aux controls row.

*"You don't put the intercom volume knob on the main bridge console. It goes in the conference room settings panel."*

---

## 13. CSS Custom Properties — New (Addendum)

| Property           | Default                      | Set By | Purpose                                      |
|--------------------|------------------------------|--------|----------------------------------------------|
| `--toggle-color`   | `var(--lcars-gold)`          | JS     | Per-switch active background for aux toggles |

All other properties from the base Climate Panel spec (§16) remain unchanged.

---

## 14. LCARS Design Rules Compliance (Addendum Verification)

| Rule                                              | Source           | Compliant? | Notes                                                           |
|---------------------------------------------------|------------------|------------|-----------------------------------------------------------------|
| No gradients, shadows, or 3D effects              | Bracer Jack #1   | ✅          | Toggle buttons are flat solid color                             |
| Pill buttons with flat left, rounded right         | Bracer Jack #4   | ✅          | Aux toggles use same `border-radius` as mode buttons           |
| Exactly 3 font sizes (title, sub, data)            | Bracer Jack #6   | ✅          | Timer value and toggle labels use data tier only                |
| ≤5 hue families in use                            | Bracer Jack      | ✅          | Eco=sunflower (existing), Turbo=ice (existing), Swing=violet (existing) — no new hues |
| All text uppercase                                 | TheLCARS.com     | ✅          | ECO, TURBO, SWING, TIMER, OFF — all uppercase                  |
| CSS custom properties, no hardcoded hex            | Project rule     | ✅          | All via `var(--lcars-*)` tokens                                 |
| Color not sole means of information                | WCAG 1.4.1       | ✅          | Text labels + `aria-checked` + color                            |
| 24px+ touch targets                                | WCAG 2.5.8       | ✅          | All buttons ≥ 36px                                              |
| Focus visible                                      | WCAG 2.4.7       | ✅          | Same `outline: 2px solid var(--lcars-ice)` as base panel        |
| Toggle semantics                                   | ARIA APG         | ✅          | `role="switch"` with `aria-checked` for binary toggles          |
| Animations respect reduced motion                  | WCAG 2.3.3       | ✅          | No new animations added — inherits base panel reduced motion    |

---

## 15. Device Profile — Climate Panel §15 Integration

Add to the Climate Panel spec §15 table:

### Midea Portable Air Conditioner

| Midea Feature            | Panel Behavior                                          |
|--------------------------|---------------------------------------------------------|
| Modes: cool, fan, dry, auto, off | Mode strip shows 5 buttons (no heat/heat_cool)  |
| Fan modes: auto, low, med, high | Full fan mode strip rendered                     |
| Swing modes              | Swing strip rendered below fan mode (if supported)      |
| Eco mode (switch)        | Toggle button in aux row, sunflower when active         |
| Turbo mode (switch)      | Toggle button in aux row, ice when active               |
| Swing (switch)           | Toggle button in aux row, violet when active            |
| Timer (number)           | Stepper control in aux row, hours display               |
| Outdoor temp (sensor)    | Sensor line in left column, ice-blue color              |
| Indoor humidity (sensor) | Sensor line in left column, data-accent color           |
| Beep (switch)            | Hidden in diagnostics — config entity                   |
| No dual setpoint         | `isDualSetpoint()` always false — single target only    |
| No presets               | `hasPresetModes()` false — preset strip hidden          |
| No heating               | Heating action/animation never triggered                |

---

## 16. Implementation Priority

### Phase 1: Zero Changes (Works Today)

The existing Climate Panel handles Midea portable ACs **immediately** for core functionality:
- Temperature display (arc + value)
- Setpoint control
- Mode strip (only available modes)
- Fan mode strip
- Dynamic frame color
- Action badge
- Humidity (if `current_humidity` attribute present)

### Phase 2: Swing Mode Strip (Low Effort)

Add `swing_modes` conditional rendering to the aux controls row:
- Check `stateObj.attributes.swing_modes`
- Render radiogroup strip identical to fan mode strip
- Service call: `climate.set_swing_mode`
- Estimated effort: ~30 lines of template + existing CSS

### Phase 3: Auxiliary Switch Toggles (Medium Effort)

Add portable AC auxiliary switch rendering:
- Classify companion switch entities
- Render toggle buttons with `role="switch"`
- Map entity names to LCARS labels/icons/colors
- Service call: `switch.toggle`
- Estimated effort: ~80 lines of template + ~40 lines CSS + classification logic

### Phase 4: Timer Control (Low Effort)

Add timer number entity stepper:
- Detect `number.*_timer` entity
- Render ± stepper with hour display
- Service call: `number.set_value`
- Estimated effort: ~40 lines of template + ~20 lines CSS

---

## 17. Team Review Flags

- **Geordi Review Required**: Auxiliary toggle button visual design (pill shape, icon placement, active colors). Swing mode strip placement relative to fan mode strip. Timer stepper alignment within aux row. Verify no new hue families introduced.
- **Worf Review Required**: `switch.toggle` service calls for eco/turbo/swing. `number.set_value` for timer with min/max bounds validation. Mutual exclusivity reliance on integration behavior (no client-side enforcement).
- **Wesley Note**: Consider whether the swing mode strip should be rendered from the `climate` entity's `swing_modes` attribute (preferred, standard HA pattern) OR from the separate `switch.midea_*_swing_mode` toggle. If the integration exposes both, prefer the `climate` attribute to avoid duplicate controls. Deduplicate in classification logic.

---

## 18. Summary

The Midea portable AC is a **standard climate device** that the existing Climate Panel handles at 90% coverage with zero modifications. The remaining 10% — auxiliary switch toggles (eco/turbo/swing), timer control, and outdoor temperature display — integrate cleanly into the panel's existing `auxctrl` grid area using established LCARS button patterns.

No new panel type is warranted. No new color families are needed. No structural grid changes are required. The portable AC addendum extends the Climate Panel's capability without altering its core architecture.

*"Same warp core, same EPS grid — just a different destination for the plasma."*
