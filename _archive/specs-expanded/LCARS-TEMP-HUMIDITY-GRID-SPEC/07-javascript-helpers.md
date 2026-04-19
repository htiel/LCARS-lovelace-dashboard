## 6. JavaScript Helpers

### Temperature Color Resolution

```javascript
/**
 * Resolve temperature value to LCARS color CSS variable.
 * All thresholds in Fahrenheit — convert if metric.
 * @param {number|string|null} temp - Temperature value
 * @param {Object} [thresholds] - Custom comfort thresholds
 * @returns {string} CSS variable string
 */
function getTempColor(temp, thresholds = {}) {
  const {
    coldMax = 55,
    coolMax = 67,
    nominalMax = 76,
    warmMax = 84
  } = thresholds;

  if (temp == null || isNaN(temp)) return 'var(--lcars-gray)';
  const v = Number(temp);
  if (v < coldMax)    return 'var(--lcars-blue)';
  if (v <= coolMax)   return 'var(--lcars-bluey)';
  if (v <= nominalMax) return 'var(--lcars-ice)';
  if (v <= warmMax)   return 'var(--lcars-butterscotch)';
  return 'var(--lcars-peach)';
}

/**
 * Resolve temperature to a comfort class name for the tile.
 */
function getTempComfortClass(temp, thresholds = {}) {
  const {
    coldMax = 55,
    coolMax = 67,
    nominalMax = 76,
    warmMax = 84
  } = thresholds;

  if (temp == null || isNaN(temp)) return 'unavailable';
  const v = Number(temp);
  if (v < coldMax)     return 'comfort-cold';
  if (v <= coolMax)    return 'comfort-cool';
  if (v <= nominalMax) return 'comfort-nominal';
  if (v <= warmMax)    return 'comfort-warm';
  return 'comfort-hot';
}

/**
 * Resolve temperature to an LCARS status label (uppercase).
 */
function getTempLabel(temp, thresholds = {}) {
  const {
    coldMax = 55,
    coolMax = 67,
    nominalMax = 76,
    warmMax = 84
  } = thresholds;

  if (temp == null || isNaN(temp)) return 'UNAVAILABLE';
  const v = Number(temp);
  if (v < coldMax)     return 'COLD';
  if (v <= coolMax)    return 'COOL';
  if (v <= nominalMax) return 'NOMINAL';
  if (v <= warmMax)    return 'WARM';
  return 'HOT';
}
```

### Humidity Color Resolution

```javascript
/**
 * Resolve humidity value to LCARS color CSS variable.
 * @param {number|string|null} humidity - Humidity percentage
 * @param {Object} [thresholds] - Custom comfort thresholds
 * @returns {string} CSS variable string
 */
function getHumidityColor(humidity, thresholds = {}) {
  const {
    veryDryMax = 20,
    dryMax = 29,
    nominalMax = 60,
    humidMax = 70
  } = thresholds;

  if (humidity == null || isNaN(humidity)) return 'var(--lcars-gray)';
  const v = Number(humidity);
  if (v < veryDryMax)   return 'var(--lcars-peach)';
  if (v <= dryMax)      return 'var(--lcars-sunflower)';
  if (v <= nominalMax)  return 'var(--lcars-space-white)';
  if (v <= humidMax)    return 'var(--lcars-sunflower)';
  return 'var(--lcars-tomato)';
}
```

### Temperature Unit Conversion

```javascript
/**
 * Convert Celsius to Fahrenheit.
 */
function cToF(celsius) {
  return (celsius * 9 / 5) + 32;
}

/**
 * Convert Fahrenheit to Celsius.
 */
function fToC(fahrenheit) {
  return (fahrenheit - 32) * 5 / 9;
}

/**
 * Convert comfort thresholds between unit systems.
 * Thresholds are stored in Fahrenheit internally.
 * @param {Object} thresholds - Fahrenheit thresholds
 * @returns {Object} Celsius thresholds
 */
function convertThresholdsToCelsius(thresholds) {
  return Object.fromEntries(
    Object.entries(thresholds).map(([k, v]) => [k, Math.round(fToC(v) * 10) / 10])
  );
}
```

### Sparkline Generation

Reuses the pattern from the Atmoscrubber Spec §7, adapted for the smaller tile dimensions:

```javascript
/**
 * Generate an SVG sparkline path from an array of numeric values.
 * Identical to Atmoscrubber sparklinePath() — shared utility.
 * @param {number[]} values - Array of data points (24h, 1 per 15 min = 96 points)
 * @param {number} width - SVG viewBox width
 * @param {number} height - SVG viewBox height
 * @returns {string} SVG path 'd' attribute
 */
function sparklinePath(values, width = 100, height = 16) {
  if (!values || values.length < 2) return '';
  const filtered = values.filter(v => v != null && !isNaN(v));
  if (filtered.length < 2) return '';

  const min = Math.min(...filtered);
  const max = Math.max(...filtered);
  const range = max - min || 1;
  const step = width / (filtered.length - 1);

  return filtered.map((v, i) => {
    const x = (i * step).toFixed(1);
    const y = (height - ((v - min) / range) * (height - 2) - 1).toFixed(1);
    return `${i === 0 ? 'M' : 'L'}${x},${y}`;
  }).join(' ');
}

/**
 * Generate the closed area path for the fill under the sparkline.
 */
function sparklineAreaPath(values, width = 100, height = 16) {
  const linePath = sparklinePath(values, width, height);
  if (!linePath) return '';
  const count = values.filter(v => v != null && !isNaN(v)).length;
  const step = width / (count - 1);
  const lastX = ((count - 1) * step).toFixed(1);
  return `${linePath} L${lastX},${height} L0,${height} Z`;
}
```

### Whole-Home Averages

```javascript
/**
 * Compute the average of an array of numeric values, ignoring null/unavailable.
 * @param {Array<number|string|null>} values
 * @returns {{ avg: number|null, count: number }}
 */
function computeAverage(values) {
  const nums = values
    .map(v => (v != null && v !== 'unavailable') ? Number(v) : null)
    .filter(v => v != null && !isNaN(v));
  if (nums.length === 0) return { avg: null, count: 0 };
  return {
    avg: Math.round(nums.reduce((a, b) => a + b, 0) / nums.length * 10) / 10,
    count: nums.length
  };
}
```

---
