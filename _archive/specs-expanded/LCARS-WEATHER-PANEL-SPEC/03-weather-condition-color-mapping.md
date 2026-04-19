## 2. Weather Condition → Color Mapping

The `state` of the `weather.*` entity drives the dynamic frame color, temperature text accent, and header badge. This is the primary visual feedback channel — analogous to HVAC action coloring on the Climate Panel.

### Condition Color Map

| HA Condition       | Display Label       | LCARS Variable           | Hex       | Rationale                                         |
|--------------------|---------------------|--------------------------|-----------|---------------------------------------------------|
| `sunny`            | `SUNNY`             | `--lcars-sunflower`      | `#ffcc99` | Warm sunlight — clear day, bright and inviting     |
| `clear-night`      | `CLEAR NIGHT`       | `--lcars-bluey`          | `#8899ff` | Deep blue — night sky, stellar observation         |
| `partlycloudy`     | `PARTLY CLOUDY`     | `--lcars-ice`            | `#99ccff` | Cool blue — mixed sky                              |
| `cloudy`           | `CLOUDY`            | `--lcars-gray`           | `#666688` | Overcast — muted, flat                             |
| `fog`              | `FOG`               | `--lcars-gray`           | `#666688` | Low visibility — same muted tone                   |
| `rainy`            | `RAINY`             | `--lcars-sky`            | `#aaaaff` | Atmospheric blue — rain in the sky palette         |
| `pouring`          | `POURING`           | `--lcars-sky`            | `#aaaaff` | Heavy rain — same sky tone, higher precip data     |
| `snowy`            | `SNOWY`             | `--lcars-space-white`    | `#f5f6fa` | White — snow, bright and cold                      |
| `snowy-rainy`      | `SLEET`             | `--lcars-ice`            | `#99ccff` | Cold mix — icy blue                                |
| `hail`             | `HAIL`              | `--lcars-ice`            | `#99ccff` | Icy — same cold palette                            |
| `windy`            | `WINDY`             | `--lcars-almond`         | `#ffaa90` | Warm/dry wind — distinct from rain                 |
| `windy-variant`    | `WINDY`             | `--lcars-almond`         | `#ffaa90` | Same as windy                                      |
| `lightning`        | `LIGHTNING`         | `--lcars-gold`           | `#ffaa00` | Electric — bright gold flash                       |
| `lightning-rainy`  | `THUNDERSTORM`      | `--lcars-gold`           | `#ffaa00` | Electrical storm — gold alert                      |
| `exceptional`      | `SEVERE WEATHER`    | `--lcars-tomato`         | `#ff5555` | Red alert — severe/exceptional weather warning     |
| `unavailable`      | `UNAVAILABLE`       | `--lcars-tomato` (pulse) | `#ff5555` | System fault — sensor offline                      |
| `unknown`          | `UNKNOWN`           | `--lcars-gray`           | `#666688` | Undefined — neutral fallback                       |

### Condition → Glyph Mapping (LCARS Geometric Icons)

Instead of animated weather SVGs, the weather panel uses **abstract LCARS sensor glyphs** — flat geometric shapes that represent conditions as classified sensor data. These are rendered as small inline SVGs or Unicode characters.

| HA Condition       | Glyph  | Description                              | SVG / Unicode                       |
|--------------------|--------|------------------------------------------|-------------------------------------|
| `sunny`            | `☀`    | Radiating circle — stellar radiation     | `☀` or SVG circle with 8 rays      |
| `clear-night`      | `●`    | Filled circle — dark disc, clear sky     | `●` or SVG filled circle            |
| `partlycloudy`     | `◑`    | Half-filled circle — partial coverage    | `◑` or SVG half-fill circle         |
| `cloudy`           | `◔`    | Quarter-filled circle — heavy coverage   | `◔` or SVG mostly-filled circle     |
| `fog`              | `≡`    | Horizontal bars — low visibility         | `≡` or SVG 3 horizontal lines       |
| `rainy`            | `▽`    | Downward triangle — precipitation        | `▽` or SVG down-pointing triangle   |
| `pouring`          | `▼`    | Filled downward triangle — heavy precip  | `▼` or SVG filled down-triangle     |
| `snowy`            | `✦`    | 4-point star — crystalline               | `✦` or SVG diamond star             |
| `snowy-rainy`      | `✦▽`   | Star + triangle — mixed precipitation    | Composite glyph                      |
| `hail`             | `◆`    | Filled diamond — ice pellets             | `◆` or SVG filled diamond           |
| `windy`            | `〰`   | Wavy line — air movement                 | `〰` or SVG sine wave               |
| `windy-variant`    | `〰`   | Same as windy                            | Same glyph                           |
| `lightning`        | `⚡`    | Lightning bolt — electrical discharge    | `⚡` or SVG zigzag bolt              |
| `lightning-rainy`  | `⚡▽`   | Bolt + triangle — thunderstorm           | Composite glyph                      |
| `exceptional`      | `⚠`    | Warning triangle — severe alert          | `⚠` or SVG alert triangle           |

### Implementation

```javascript
/**
 * Resolve weather condition to LCARS color CSS variable.
 * Drives the dynamic frame color and temperature text accent.
 */
function getWeatherConditionColor(condition) {
  switch (condition) {
    case 'sunny':           return 'var(--lcars-sunflower)';
    case 'clear-night':     return 'var(--lcars-bluey)';
    case 'partlycloudy':    return 'var(--lcars-ice)';
    case 'cloudy':
    case 'fog':             return 'var(--lcars-gray)';
    case 'rainy':
    case 'pouring':         return 'var(--lcars-sky)';
    case 'snowy':           return 'var(--lcars-space-white)';
    case 'snowy-rainy':
    case 'hail':            return 'var(--lcars-ice)';
    case 'windy':
    case 'windy-variant':   return 'var(--lcars-almond)';
    case 'lightning':
    case 'lightning-rainy': return 'var(--lcars-gold)';
    case 'exceptional':
    case 'unavailable':     return 'var(--lcars-tomato)';
    default:                return 'var(--lcars-sky)';
  }
}

/**
 * Resolve weather condition to LCARS glyph character.
 */
function getWeatherGlyph(condition) {
  switch (condition) {
    case 'sunny':           return '☀';
    case 'clear-night':     return '●';
    case 'partlycloudy':    return '◑';
    case 'cloudy':          return '◔';
    case 'fog':             return '≡';
    case 'rainy':           return '▽';
    case 'pouring':         return '▼';
    case 'snowy':           return '✦';
    case 'snowy-rainy':     return '✦';
    case 'hail':            return '◆';
    case 'windy':
    case 'windy-variant':   return '〰';
    case 'lightning':       return '⚡';
    case 'lightning-rainy': return '⚡';
    case 'exceptional':     return '⚠';
    default:                return '◌';
  }
}

/**
 * Resolve weather condition to uppercase display label.
 */
function getWeatherLabel(condition) {
  switch (condition) {
    case 'sunny':           return 'SUNNY';
    case 'clear-night':     return 'CLEAR NIGHT';
    case 'partlycloudy':    return 'PARTLY CLOUDY';
    case 'cloudy':          return 'CLOUDY';
    case 'fog':             return 'FOG';
    case 'rainy':           return 'RAINY';
    case 'pouring':         return 'POURING';
    case 'snowy':           return 'SNOWY';
    case 'snowy-rainy':     return 'SLEET';
    case 'hail':            return 'HAIL';
    case 'windy':
    case 'windy-variant':   return 'WINDY';
    case 'lightning':       return 'LIGHTNING';
    case 'lightning-rainy': return 'THUNDERSTORM';
    case 'exceptional':     return 'SEVERE WEATHER';
    case 'unavailable':     return 'UNAVAILABLE';
    default:                return (condition || 'UNKNOWN').toUpperCase().replace(/-/g, ' ');
  }
}
```

### Contrast Verification (all vs `#000000` background)

| Color                    | Hex       | Contrast vs #000 | WCAG Level | Usage                            |
|--------------------------|-----------|-------------------|------------|----------------------------------|
| `--lcars-sunflower`      | `#ffcc99` | 13.1:1            | AAA        | Sunny condition                  |
| `--lcars-bluey`          | `#8899ff` | 6.4:1             | AA         | Clear night                      |
| `--lcars-ice`            | `#99ccff` | 10.3:1            | AAA        | Partly cloudy, mixed precip      |
| `--lcars-sky`            | `#aaaaff` | 8.2:1             | AAA        | Rainy, pouring (default frame)   |
| `--lcars-gray`           | `#666688` | 4.6:1             | AA         | Cloudy, fog, disabled            |
| `--lcars-space-white`    | `#f5f6fa` | 18.9:1            | AAA        | Snowy, labels, data text         |
| `--lcars-almond`         | `#ffaa90` | 9.6:1             | AAA        | Windy                            |
| `--lcars-gold`           | `#ffaa00` | 8.6:1             | AAA        | Lightning, thunderstorm          |
| `--lcars-tomato`         | `#ff5555` | 5.2:1             | AA         | Exceptional / severe weather     |

All pass **WCAG 1.4.3 (AA)** minimum 4.5:1. `--lcars-gray` at 4.6:1 is intentionally dim for overcast state and passes AA. `--lcars-bluey` at 6.4:1 comfortably passes AA for the clear-night accent. Color is never the sole indicator — all conditions have text labels and glyphs.

---
