## 2. Card Configuration

### Card Type Registration

```yaml
type: custom:lcars-internal-sensors-grid
```

### YAML Configuration Schema

```yaml
type: custom:lcars-internal-sensors-grid
# Optional: override auto-discovery with explicit entities
rooms:
  - name: "BRIDGE"            # Display name override (auto-discovered from area name)
    temperature: sensor.meter_e06d_temperature
    humidity: sensor.meter_e06d_humidity
    battery: sensor.meter_e06d_battery
    floor: upstairs           # Floor grouping override

# Temperature unit preference (auto-detected from HA config)
unit_system: imperial         # imperial (°F) | metric (°C)

# Comfort thresholds (Fahrenheit; auto-converted if metric)
temp_comfort_min: 68
temp_comfort_max: 76
humidity_comfort_min: 30
humidity_comfort_max: 60

# Battery alert threshold
battery_alert: 20

# Optional features
show_sparklines: true         # 24h trend sparklines per tile
show_averages: true           # Summary row with whole-home averages
show_appliance_meters: false  # Include fridge/freezer meters in grid
group_by_floor: true          # Group tiles by floor_registry
```

### Auto-Discovery Mode (Default)

When no `rooms` config is provided, the card auto-discovers all SwitchBot Meter devices and groups them by area → floor. This is the recommended mode.

---
