## 15. Nest & Ecobee Device-Specific Behavior

### Nest Learning Thermostat

| Nest Feature           | Panel Behavior                                          |
|------------------------|---------------------------------------------------------|
| Eco mode               | Displayed as an HVAC mode button (Nest exposes `eco` in `hvac_modes`) |
| Eco setpoints          | When in eco mode, Nest provides `eco_temperature_high` / `eco_temperature_low` via custom attributes — display as dual setpoint if present |
| Fan modes: `on`, `auto`| Rendered in fan mode strip — only 2 buttons              |
| Home/Away              | Nest uses structure-level home/away via `preset_mode` — shown in preset strip if available |
| Leaf icon              | When Nest reports efficient operation, display a leaf indicator (🍃) next to the action badge — downgrade to text `ECO` for accessibility |

### Ecobee

| Ecobee Feature         | Panel Behavior                                          |
|------------------------|---------------------------------------------------------|
| Preset modes           | Rich preset support: `home`, `away`, `sleep` — full preset strip |
| Humidity sensor         | `current_humidity` attribute is reliable — shown in sensor column |
| Follow Me              | Ecobee's occupancy-based comfort setting — reflected in preset mode |
| Fan modes              | Multiple fan modes — rendered in fan strip               |
| Aux heat               | Ecobee may expose `aux_heat` — if present, show as additional mode or sensor line indicating auxiliary/emergency heat usage |

### Generic HVAC

For devices that support only a subset of features, the panel gracefully hides unsupported sections:

```javascript
/**
 * Determine which panel sections to render based on available data.
 */
function getClimatePanelSections(stateObj) {
  const attrs = stateObj?.attributes || {};
  return {
    showSetpoint: stateObj?.state !== 'off' && stateObj?.state !== 'unavailable',
    showDualSetpoint: isDualSetpoint(stateObj),
    showFanMode: hasFanModes(stateObj),
    showPresetMode: hasPresetModes(stateObj),
    showHumidity: attrs.current_humidity != null,
    showFaults: true,  // always check for fault entities
  };
}
```

---
