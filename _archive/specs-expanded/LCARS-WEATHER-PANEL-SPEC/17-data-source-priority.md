## 16. Data Source Priority

When multiple integrations provide the same data (weather entity attributes vs. dedicated sensors), the panel prioritizes the most accurate source:

```javascript
/**
 * Priority resolution for weather data.
 * Dedicated sensor entities take precedence over weather entity attributes
 * because weather stations provide higher-resolution local data than
 * forecast-based weather integrations.
 */
function resolveWeatherValue(hass, weatherEntity, sensorEntityId, attributeName) {
  // 1. Prefer dedicated sensor entity (higher resolution, local measurement)
  if (sensorEntityId) {
    const sensor = hass.states[sensorEntityId];
    if (sensor && sensor.state !== 'unavailable' && sensor.state !== 'unknown') {
      return {
        value: sensor.state,
        unit: sensor.attributes.unit_of_measurement || '',
        source: 'sensor',
      };
    }
  }

  // 2. Fall back to weather entity attribute
  const attrs = weatherEntity?.attributes || {};
  if (attrs[attributeName] != null) {
    return {
      value: attrs[attributeName],
      unit: getAttributeUnit(attrs, attributeName),
      source: 'weather',
    };
  }

  // 3. No data available
  return { value: null, unit: '', source: null };
}

/**
 * Get unit for a weather entity attribute.
 */
function getAttributeUnit(attrs, attributeName) {
  switch (attributeName) {
    case 'temperature':
    case 'apparent_temperature':
    case 'dew_point':
      return attrs.temperature_unit || '°F';
    case 'pressure':
      return attrs.pressure_unit || 'inHg';
    case 'wind_speed':
    case 'wind_gust_speed':
      return attrs.wind_speed_unit || 'mph';
    case 'visibility':
      return attrs.visibility_unit || 'mi';
    case 'precipitation':
      return attrs.precipitation_unit || 'in';
    case 'humidity':
    case 'cloud_coverage':
      return '%';
    default:
      return '';
  }
}
```

### Priority Table

| Data Point      | Priority 1 (Sensor)                              | Priority 2 (Weather Attr)      |
|-----------------|---------------------------------------------------|--------------------------------|
| Temperature     | `sensor.*_temperature`                            | `weather.*.temperature`        |
| Feels Like      | `sensor.*_feels_like`                             | `weather.*.apparent_temperature`|
| Humidity        | `sensor.*_humidity`                               | `weather.*.humidity`           |
| Dew Point       | `sensor.*_dew_point`                              | `weather.*.dew_point`          |
| Pressure        | `sensor.*_pressure` / `sensor.*_air_pressure`     | `weather.*.pressure`           |
| Wind Speed      | `sensor.*_wind_speed`                             | `weather.*.wind_speed`         |
| Wind Direction  | `sensor.*_wind_direction`                         | `weather.*.wind_bearing`       |
| UV Index        | `sensor.*_uv_index`                               | `weather.*.uv_index`           |
| Visibility      | —                                                 | `weather.*.visibility`         |
| Lightning       | `sensor.*_lightning_*` (Tempest only)             | —                              |
| Solar Radiation | `sensor.*_irradiance` (Tempest only)              | —                              |
| Rain Today      | `sensor.*_rain_today` / `sensor.*_precipitation`  | —                              |
| Rain Intensity  | `sensor.*_rain_intensity` / `sensor.*_precipitation_intensity` | —              |
| Pressure Trend  | `sensor.*_pressure_trend` (Davis only)            | —                              |

---
