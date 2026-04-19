## 17. Device-Specific Behavior

### WeatherFlow Tempest

| Feature              | Panel Behavior                                                          |
|----------------------|-------------------------------------------------------------------------|
| Lightning detection  | Lightning section visible — strike count + average distance             |
| Solar radiation      | Irradiance row visible — W/m² readout                                   |
| Haptic rain sensor   | Precipitation type (rain/hail) shown as label in rain section          |
| Wind data            | Richer wind: speed + gust + lull + direction + averages                |
| Battery voltage      | Diagnostic — not shown in main panel, available in more-info           |
| Precipitation event  | `event.grandbridge_tempest_precipitation_start` — could trigger alert  |

### Davis Vantage Pro2+ (via WeatherLink)

| Feature              | Panel Behavior                                                          |
|----------------------|-------------------------------------------------------------------------|
| Inside/outside       | Inside temp/humidity available but not shown by default (outdoor panel) |
| Pressure trend       | `sensor.*_pressure_trend` drives the ↑↓─ indicator arrow              |
| Rain storm tracking  | `sensor.*_rain_storm` and `sensor.*_last_rain_storm` available         |
| Fan-aspirated shield | Higher accuracy temp — source priority over met.no forecast temp       |
| Transmitter battery  | Diagnostic `binary_sensor` — monitored for fault indication            |
| Connectivity         | `binary_sensor.*_connectivity` — offline detection                     |

### Generic `weather.*` Entity

For installations without dedicated weather stations, the panel gracefully adapts:

```javascript
/**
 * Determine panel complexity based on available data.
 */
function getWeatherPanelMode(classifiedEntities) {
  const hasSensors = classifiedEntities.sensors.length > 0
                     || classifiedEntities.lightning.length > 0
                     || classifiedEntities.precipitation.length > 0;

  if (hasSensors) return 'full';      // Weather station: all sections
  return 'basic';                      // Generic: weather entity only
}
```

In `basic` mode:
- Lightning section hidden (no sensor)
- Solar radiation hidden (no sensor)
- Rain section hidden unless forecast shows precipitation
- Pressure trend arrow hidden (no trend sensor)
- All visible data comes from `weather.*` entity attributes
- Forecast strip always visible (from `weather.get_forecasts`)

---
