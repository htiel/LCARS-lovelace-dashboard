## 10. HA Entity Mapping

### Target Devices (from Eric's HA Instance)

| Device                        | Integration             | Entity                                       | Key Features                                              |
|-------------------------------|-------------------------|----------------------------------------------|-----------------------------------------------------------|
| Met.no (default)              | `met`                   | `weather.home`                               | Current conditions + daily/hourly forecast                |
| Met.no (hourly)               | `met`                   | `weather.home_hourly`                        | Hourly forecast variant                                   |
| WeatherFlow Tempest           | `weatherflow`           | (sensors only — see below)                   | Hyperlocal sensor data: lightning, solar, wind, rain      |
| WeatherFlow Forecast          | `weatherflow_forecast`  | `weather.forecast_grandbridge_tempest`       | Forecast from Tempest station + cloud processing          |
| Davis Vantage Pro2+           | `weatherlink`           | (sensors only — see below)                   | Pro weather station: temp, humidity, pressure, wind, rain |

### Primary Entity: `weather.*`

The core weather entity provides current conditions and forecast data.

| Attribute                  | Used For                                       | Fallback           |
|----------------------------|------------------------------------------------|--------------------|
| `state`                   | Current condition → color, glyph, label         | `'unknown'`        |
| `temperature`             | Large temperature display                       | `'--'`             |
| `apparent_temperature`    | "Feels like" sensor readout                     | Hidden if null     |
| `humidity`                | Humidity sensor readout                         | Hidden if null     |
| `pressure`                | Pressure sensor readout                         | Hidden if null     |
| `wind_speed`              | Wind speed display + compass                    | Hidden if null     |
| `wind_bearing`            | Wind compass arrow rotation                     | Arrow hidden       |
| `wind_gust_speed`         | Wind gust readout (sensor column)               | Hidden if null     |
| `dew_point`               | Dew point readout                               | Hidden if null     |
| `cloud_coverage`          | Cloud coverage percentage                       | Hidden if null     |
| `visibility`              | Visibility distance readout                     | Hidden if null     |
| `uv_index`                | UV index + risk level label                     | Hidden if null     |
| `precipitation_unit`      | Unit display for rain data                      | System default     |
| `temperature_unit`        | °F or °C display                                | System default     |

### WeatherFlow Tempest Sensor Entities

The Tempest provides hyperlocal sensor data beyond what the weather entity covers. These are linked by device_id `f9c59d64d4e3cde06a5ceeda848fe925`.

| Entity ID                                         | Sensor              | Device Class         | Unit  | Panel Row    |
|---------------------------------------------------|---------------------|----------------------|-------|--------------|
| `sensor.grandbridge_tempest_temperature`           | Temperature         | `temperature`        | °F    | (via weather)|
| `sensor.grandbridge_tempest_humidity`              | Humidity            | `humidity`           | %     | Row 2        |
| `sensor.grandbridge_tempest_feels_like`            | Feels Like          | `temperature`        | °F    | Row 1        |
| `sensor.grandbridge_tempest_dew_point`             | Dew Point           | `temperature`        | °F    | Row 3        |
| `sensor.grandbridge_tempest_air_pressure`          | Pressure            | `pressure`           | inHg  | Row 4        |
| `sensor.grandbridge_tempest_uv_index`              | UV Index            | —                    | index | Row 6        |
| `sensor.grandbridge_tempest_irradiance`            | Solar Radiation     | `irradiance`         | W/m²  | Row 7        |
| `sensor.grandbridge_tempest_illuminance`           | Illuminance         | `illuminance`        | lx    | (optional)   |
| `sensor.grandbridge_tempest_wind_speed`            | Wind Speed          | `wind_speed`         | mph   | Compass      |
| `sensor.grandbridge_tempest_wind_gust`             | Wind Gust           | `wind_speed`         | mph   | (optional)   |
| `sensor.grandbridge_tempest_wind_lull`             | Wind Lull           | `wind_speed`         | mph   | (optional)   |
| `sensor.grandbridge_tempest_wind_direction`        | Wind Direction      | `wind_direction`     | °     | Compass      |
| `sensor.grandbridge_tempest_wind_speed_average`    | Wind Speed Avg      | `wind_speed`         | mph   | (optional)   |
| `sensor.grandbridge_tempest_wind_direction_average` | Wind Dir Avg       | `wind_direction`     | °     | (optional)   |
| `sensor.grandbridge_tempest_lightning_count`        | Lightning Strikes  | —                    | count | Row 9        |
| `sensor.grandbridge_tempest_lightning_average_distance` | Lightning Dist | `distance`           | mi    | Row 10       |
| `sensor.grandbridge_tempest_precipitation`         | Rain Total          | `precipitation`      | in    | Row 11       |
| `sensor.grandbridge_tempest_precipitation_intensity`| Rain Rate          | `precipitation_intensity` | in/h | Row 12  |
| `sensor.grandbridge_tempest_precipitation_type`    | Rain Type           | `enum`               | —     | (label)      |
| `sensor.grandbridge_tempest_air_density`           | Air Density         | —                    | kg/m³ | (optional)   |
| `sensor.grandbridge_tempest_battery_voltage`       | Battery             | `voltage`            | V     | Diagnostic   |

### Davis Vantage Pro2+ Sensor Entities

The Davis station via WeatherLink provides complementary data. Device ID `891e813005b570466ecfdd97ac186b3b`.

| Entity ID                                          | Sensor              | Device Class          | Unit  | Panel Row    |
|----------------------------------------------------|---------------------|-----------------------|-------|--------------|
| `sensor.jp_grandbridge_live_outside_temperature`   | Outside Temp        | `temperature`         | °F    | (via weather)|
| `sensor.jp_grandbridge_live_inside_temperature`    | Inside Temp         | `temperature`         | °F    | (optional)   |
| `sensor.jp_grandbridge_live_outside_humidity`       | Outside Humidity   | `humidity`            | %     | Row 2        |
| `sensor.jp_grandbridge_live_inside_humidity`        | Inside Humidity    | `humidity`            | %     | (optional)   |
| `sensor.jp_grandbridge_live_pressure`              | Pressure            | `pressure`            | —     | Row 4        |
| `sensor.jp_grandbridge_live_pressure_trend`        | Pressure Trend      | —                     | —     | Row 5        |
| `sensor.jp_grandbridge_live_wind`                  | Wind Speed          | `wind_speed`          | —     | Compass      |
| `sensor.jp_grandbridge_live_wind_gust`             | Wind Gust           | `wind_speed`          | —     | (optional)   |
| `sensor.jp_grandbridge_live_wind_direction`        | Wind Direction      | —                     | —     | Compass      |
| `sensor.jp_grandbridge_live_rain_today`            | Rain Today          | `precipitation`       | —     | Row 11       |
| `sensor.jp_grandbridge_live_rain_intensity`        | Rain Rate           | `precipitation_intensity` | — | Row 12       |
| `sensor.jp_grandbridge_live_rain_storm`            | Storm Total         | `precipitation`       | —     | (optional)   |

### Sun Entity

| Entity         | Used For                      | State / Attributes                 |
|----------------|-------------------------------|------------------------------------|
| `sun.sun`      | Sunrise/sunset day arc         | `state`: `above_horizon` / `below_horizon`, `next_rising`, `next_setting`, `elevation`, `azimuth` |

### Entity Classification Logic

```javascript
/**
 * Classify entities for the weather panel.
 * Returns { weather, sensors, lightning, precipitation, wind, diagnostics }.
 */
function classifyWeatherEntities(entities) {
  const result = {
    weather: null,         // primary weather entity
    sensors: [],           // general sensor entities
    lightning: [],         // lightning-specific sensors
    precipitation: [],     // rain/precipitation sensors
    wind: [],              // wind speed/direction sensors
    diagnostics: [],       // entity_category: diagnostic
  };

  const LIGHTNING_KEYS = ['lightning_count', 'lightning_average_distance',
                          'lightning_strike_count', 'lightning_strike_average_distance'];
  const PRECIP_CLASSES = ['precipitation', 'precipitation_intensity'];
  const WIND_CLASSES = ['wind_speed', 'wind_direction'];

  for (const e of entities) {
    const domain = e.entity_id.split('.')[0];
    const dc = e.original_device_class || e.device_class || '';
    const cat = e.entity_category || '';
    const tkey = e.translation_key || '';

    if (domain === 'weather') {
      result.weather = result.weather || e;
      continue;
    }

    if (cat === 'diagnostic' || cat === 'config') {
      result.diagnostics.push(e);
      continue;
    }

    if (domain === 'sensor') {
      if (LIGHTNING_KEYS.some(k => tkey.includes(k) || e.entity_id.includes(k))) {
        result.lightning.push(e);
      } else if (PRECIP_CLASSES.includes(dc) || e.entity_id.includes('rain')) {
        result.precipitation.push(e);
      } else if (WIND_CLASSES.includes(dc) || e.entity_id.includes('wind')) {
        result.wind.push(e);
      } else {
        result.sensors.push(e);
      }
      continue;
    }
  }

  return result;
}

/**
 * Determine which panel sections to render based on available data.
 */
function getWeatherPanelSections(weatherState, classifiedEntities) {
  const attrs = weatherState?.attributes || {};
  return {
    showFeelsLike: attrs.apparent_temperature != null
                   || classifiedEntities.sensors.some(e => e.entity_id.includes('feels_like')),
    showHumidity: attrs.humidity != null,
    showDewPoint: attrs.dew_point != null
                  || classifiedEntities.sensors.some(e => e.entity_id.includes('dew_point')),
    showPressure: attrs.pressure != null
                  || classifiedEntities.sensors.some(e =>
                      (e.original_device_class || '').includes('pressure')),
    showUV: attrs.uv_index != null
            || classifiedEntities.sensors.some(e => e.entity_id.includes('uv')),
    showVisibility: attrs.visibility != null,
    showSolarRadiation: classifiedEntities.sensors.some(e =>
                          e.entity_id.includes('irradiance') || e.entity_id.includes('solar')),
    showLightning: classifiedEntities.lightning.length > 0,
    showPrecipitation: classifiedEntities.precipitation.length > 0,
    showWind: attrs.wind_speed != null || classifiedEntities.wind.length > 0,
    showDayArc: true,  // always show if sun.sun exists
    showForecast: true, // always attempt forecast
  };
}
```

---
