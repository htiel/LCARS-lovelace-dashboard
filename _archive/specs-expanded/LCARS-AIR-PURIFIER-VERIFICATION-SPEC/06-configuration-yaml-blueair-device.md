## 5. Configuration YAML — BlueAir Device

No special YAML configuration is needed. The atmoscrubber panel auto-discovers devices via the `_getDevicePanelType()` heuristic. For a Blueair Blue Pure 311i Max, HA will expose entities under the device registry, and the environment panel triggers when it detects `fan` domain + AQ sensors.

### Expected Entity Layout (Blue Pure 311i Max)

```yaml
# Auto-discovered by LCARS dashboard — no manual config required
# These entities are created by ha_blueair integration

# Fan (primary control)
fan.blueair_311i_max_fan:
  state: "on"
  attributes:
    percentage: 67
    preset_mode: null          # null when manual speed, "auto" or "night" when in preset
    preset_modes: ["auto", "night"]
    speed_count: 3             # 311i Max has 3 speed levels

# Air Quality Sensors (→ airQuality partition bucket)
sensor.blueair_311i_max_pm_2_5:
  device_class: pm25
  unit_of_measurement: "µg/m³"

sensor.blueair_311i_max_pm_1:
  device_class: pm1
  unit_of_measurement: "µg/m³"

sensor.blueair_311i_max_pm_10:
  device_class: pm10
  unit_of_measurement: "µg/m³"

sensor.blueair_311i_max_co2:
  device_class: carbon_dioxide
  unit_of_measurement: "ppm"

sensor.blueair_311i_max_voc:
  device_class: volatile_organic_compounds_parts
  unit_of_measurement: "ppb"

# Telemetry Sensors (→ telemetry partition bucket)
sensor.blueair_311i_max_temperature:
  device_class: temperature
  unit_of_measurement: "°C"

sensor.blueair_311i_max_humidity:
  device_class: humidity
  unit_of_measurement: "%"

# Filter (→ telemetry or diagnostics, depending on entity_category)
sensor.blueair_311i_max_filter_life:
  device_class: battery       # ⚠️ upstream quirk — treated as percentage sensor
  unit_of_measurement: "%"

# Switches (→ controls partition bucket)
switch.blueair_311i_max_child_lock:
  device_class: switch

switch.blueair_311i_max_germ_shield:   # if supported by model
  device_class: switch

# Binary Sensors (→ sensors/diagnostics)
binary_sensor.blueair_311i_max_online:
  device_class: connectivity

binary_sensor.blueair_311i_max_filter_expired:
  device_class: problem

# Light (→ currently NOT routed to controls — see §3.3)
light.blueair_311i_max_led:
  # LED brightness control
```

### Panel Detection Path

```
_getDevicePanelType() scans device entities:
  → pm25 (device_class in AQ_DEVICE_CLASSES) → aqSignals++     (1)
  → pm1  (device_class in AQ_DEVICE_CLASSES) → aqSignals++     (2)
  → pm10 (device_class in AQ_DEVICE_CLASSES) → aqSignals++     (3)
  → co2  (device_class in AQ_DEVICE_CLASSES) → aqSignals++     (4)
  → voc  (device_class in AQ_DEVICE_CLASSES) → aqSignals++     (5)
  → fan  (domain === 'fan')                  → hasFan = true

  aqSignals (5) >= 2 → return PANEL_TYPE_ENVIRONMENT  ✅
```

Detection is unambiguous. BlueAir devices will always trigger the environment panel.

---
