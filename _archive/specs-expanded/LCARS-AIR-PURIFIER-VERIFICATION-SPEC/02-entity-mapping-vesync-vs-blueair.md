## 1. Entity Mapping — VeSync vs BlueAir

### 1.1 Sensor Entities

| Panel Slot        | Device Class                          | VeSync (Core400S)                              | BlueAir (Blue Pure 311i Max)                     | Compatible? |
|-------------------|---------------------------------------|-------------------------------------------------|--------------------------------------------------|-------------|
| AQI score         | `aqi` / entity_id `*_air_quality`     | `sensor.*_air_quality` (text: excellent/good/moderate/bad) | **Not provided**                                 | ⚠️ Fallback  |
| PM2.5             | `pm25`                                | `sensor.*_pm2_5` (µg/m³)                        | `sensor.*_pm_2_5` (`SensorDeviceClass.PM25`, µg/m³) | ✅ Direct    |
| PM1               | `pm1`                                 | Not provided                                    | `sensor.*_pm_1` (`SensorDeviceClass.PM1`, µg/m³)    | ✅ New data  |
| PM10              | `pm10`                                | Not provided                                    | `sensor.*_pm_10` (`SensorDeviceClass.PM10`, µg/m³)  | ✅ New data  |
| CO₂               | `carbon_dioxide`                      | Not provided                                    | `sensor.*_co2` (`SensorDeviceClass.CO2`, ppm)        | ✅ New data  |
| VOC               | `volatile_organic_compounds_parts`    | Not provided                                    | `sensor.*_voc` (ppb)                                 | ✅ New data  |
| Temperature       | `temperature`                         | Not provided                                    | `sensor.*_temperature` (°C)                          | ✅ New data  |
| Humidity          | `humidity`                            | Not provided                                    | `sensor.*_humidity` (%)                              | ✅ New data  |
| Filter life       | `battery` (⚠️ see §3.1)              | `sensor.*_filter_life` (%, diagnostic)           | `sensor.*_filter_life` (`SensorDeviceClass.BATTERY`, %) | ⚠️ See §3.1 |

### 1.2 Control Entities

| Panel Slot        | Domain / Type              | VeSync (Core400S)                                 | BlueAir (Blue Pure 311i Max)                       | Compatible? |
|-------------------|----------------------------|----------------------------------------------------|-----------------------------------------------------|-------------|
| Fan on/off        | `fan`                      | `fan.core400s_*` (on/off, percentage)              | `fan.*_fan` (on/off, percentage)                     | ✅ Direct    |
| Fan speed %       | `fan` attribute            | `percentage` (0–100, mapped to low/med/high)       | `percentage` (0–100, mapped to `speed_count` steps)  | ✅ Direct    |
| Preset modes      | `fan` attribute            | `preset_modes`: `['auto', 'sleep', 'turbo', 'pet']` | `preset_modes`: `['auto', 'night']`                 | ✅ Dynamic   |
| Display toggle    | `switch`                   | `switch.*_display` (on/off)                         | **Not provided** (light entity instead — see §1.3)  | ⚠️ Different |
| Child lock        | `switch`                   | `switch.*_child_lock` (on/off)                      | `switch.*_child_lock` (on/off)                       | ✅ Direct    |
| Night light       | `switch` attribute         | `night_light` attribute on fan entity               | **Not provided** (BlueAir uses `light` entity)       | ⚠️ Different |

### 1.3 Additional BlueAir Entities (Not in VeSync)

| Entity                          | Domain          | Device Class              | Notes                                |
|---------------------------------|-----------------|---------------------------|--------------------------------------|
| `light.*_led` (if supported)    | `light`         | —                         | LED brightness control (display equivalent) |
| `switch.*_germ_shield`          | `switch`        | `switch`                  | UV-C germ shield toggle (311i Max may not have this) |
| `binary_sensor.*_online`        | `binary_sensor` | `connectivity`            | Device connectivity status           |
| `binary_sensor.*_filter_expired`| `binary_sensor` | `problem`                 | Boolean filter expiration alert      |

---
