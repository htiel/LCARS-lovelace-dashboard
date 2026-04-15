## 2. Feature Compatibility Matrix

| Atmoscrubber Feature              | VeSync Status | BlueAir Status  | Notes                                                 |
|-----------------------------------|---------------|-----------------|-------------------------------------------------------|
| **Auto-detection heuristic**      | ✅ Works       | ✅ Works         | BlueAir exposes `fan` domain + `pm25`/`pm10`/`pm1` sensors → triggers `PANEL_TYPE_ENVIRONMENT` (`aqSignals >= 1 && hasFan`) |
| **Entity partition**              | ✅ Works       | ✅ Works         | `_partitionEnvironmentEntities()` routes: `fan`→controls, `pm25`/`pm10`/`pm1`/`co2`/`voc`→airQuality, `temperature`/`humidity`→telemetry, `switch`→controls, category entities→diagnostics |
| **3-column grid layout**          | ✅ Works       | ✅ Works         | Fan entity present → `sensorOnly = false` → full 3-column mode |
| **AQI → color mapping**           | ✅ Direct AQI  | ⚠️ PM2.5 fallback | VeSync has `air_quality` score entity. BlueAir has no AQI entity — falls back to PM2.5 → `Math.min(300, pm25Val * 4)` estimation. This is the existing fallback path already in the code. |
| **Cylinder visualization**        | ✅ Works       | ✅ Works         | Color driven by `aqiEstimate`, speed by `fanPct`. Both available from BlueAir `fan` entity. |
| **Particle animation speed**      | ✅ Works       | ✅ Works         | `fanState.attributes.percentage` available from BlueAir fan entity. Speed mapping identical. |
| **Preset mode strip**             | ✅ 4 modes     | ✅ 2 modes       | BlueAir exposes `['auto', 'night']` vs VeSync's `['auto', 'sleep', 'turbo', 'pet']`. The strip renders dynamically from `fanState.attributes.preset_modes` — fewer buttons, still works. |
| **Fan on/off toggle**             | ✅ Works       | ✅ Works         | Both use `fan` domain. Same `_handleToggle()` / service calls. |
| **Switch controls**               | ✅ Works       | ✅ Works         | BlueAir's `switch.child_lock` renders as a control button. `switch.germ_shield` also renders if present. |
| **Filter life progress bar**      | ⚠️ Diagnostic   | ⚠️ See §3.1      | VeSync's filter_life has `entity_category: diagnostic`. BlueAir's has `device_class: battery` — see §3.1 for routing implications. |
| **Filter expired alert**          | ❌ Not available| ✅ Available     | BlueAir provides `binary_sensor.*_filter_expired` (`problem` class). Currently unused by the panel. |
| **Sparkline history**             | ✅ Works       | ✅ Works         | `recorder/statistics_during_period` works for any sensor entity. BlueAir sensors are `SensorStateClass.MEASUREMENT` → recorded by default. |
| **CO₂ threshold coloring**        | N/A for VeSync | ✅ Works         | BlueAir exposes CO₂. The `_getSensorIndicatorColor()` handles numeric sensors with data-accent. Spec's `getCo2Color()` thresholds would need to be wired in (see §4.2). |
| **Diagnostics section**           | ✅ Works       | ✅ Works         | Category entities (diagnostic/config) are fetched via `_getDeviceCategoryEntities()` and rendered below a divider. |
| **Sensor-only mode**              | ✅ Works       | N/A             | BlueAir has a fan entity → never enters sensor-only mode. Not relevant. |
| **Responsive mobile stacking**    | ✅ Works       | ✅ Works         | Layout is CSS grid — no entity-specific logic. |
| **Accessibility (ARIA/keyboard)** | ✅ Works       | ✅ Works         | Dynamic labels from entity state — no hardcoded VeSync strings. |

---
