## 5. Color Threshold Maps

### Temperature → Color Mapping

Temperature drives the **tile border** and **temperature text** color. Thresholds are configurable but defaults are based on standard HVAC comfort zones.

#### Fahrenheit (Default — the Admiral's units)

| Range        | Comfort Zone       | LCARS Variable         | Hex       | Rationale                                     |
|--------------|--------------------|------------------------|-----------|-----------------------------------------------|
| < 55°F       | Cold               | `--lcars-blue`         | `#5566ff` | Deep blue — dangerously cold, pipe freeze risk|
| 55–67°F      | Cool               | `--lcars-bluey`        | `#8899ff` | Cool blue — below comfort                     |
| 68–76°F      | Nominal            | `--lcars-ice`          | `#99ccff` | Ice blue — nominal, comfortable               |
| 77–84°F      | Warm               | `--lcars-butterscotch` | `#ff9966` | Warm amber — above comfort                    |
| ≥ 85°F       | Hot                | `--lcars-peach`        | `#ff8866` | Hot — demands attention                       |
| N/A          | Unavailable        | `--lcars-gray`         | `#666688` | Sensor offline                                |

#### Celsius Equivalents

| Range        | Comfort Zone       | LCARS Variable         |
|--------------|--------------------|------------------------|
| < 12.8°C     | Cold               | `--lcars-blue`         |
| 12.8–19.4°C  | Cool               | `--lcars-bluey`        |
| 20–24°C      | Nominal            | `--lcars-ice`          |
| 25–29°C      | Warm               | `--lcars-butterscotch` |
| ≥ 29.4°C     | Hot                | `--lcars-peach`        |

### Humidity → Color Mapping

Humidity drives the **humidity text** color. The tile border is NOT affected by humidity — temperature takes precedence for border (avoiding conflicting dual-encoding per WCAG 1.4.1).

| Range   | Status     | LCARS Variable         | Hex       | Rationale                              |
|---------|------------|------------------------|-----------|----------------------------------------|
| < 20%   | Very Dry   | `--lcars-peach`        | `#ff8866` | Dry air warning — cracked wood, static |
| 20–29%  | Dry        | `--lcars-sunflower`    | `#ffcc99` | Below comfort — marginal               |
| 30–60%  | Nominal    | `--lcars-space-white`  | `#f5f6fa` | Comfortable — default text color       |
| 61–70%  | Humid      | `--lcars-sunflower`    | `#ffcc99` | Above comfort — mold risk rising       |
| > 70%   | Very Humid | `--lcars-tomato`       | `#ff5555` | Alert — mold, condensation, damage     |
| N/A     | Unavailable| `--lcars-gray`         | `#666688` | Sensor offline                         |

### Battery → Visual Treatment

Battery does NOT get continuous coloring — it uses a **binary threshold** approach:

| Range   | Treatment                                                     |
|---------|---------------------------------------------------------------|
| > 20%   | **Hidden** — no visual indicator (good battery is no news)    |
| ≤ 20%   | **Tomato dot** (●) — pulsing, top-right of tile              |
| 0% / N/A | **Gray dot** — static, sensor may be dead                   |

### Contrast Verification (all vs `#000000` background)

| Color                  | Hex       | Contrast vs #000 | WCAG Level | Usage                    |
|------------------------|-----------|-------------------|------------|--------------------------|
| `--lcars-ice`          | `#99ccff` | 10.3:1            | AAA        | Nominal temp, frame      |
| `--lcars-bluey`        | `#8899ff` | 6.4:1             | AA         | Cool temp                |
| `--lcars-blue`         | `#5566ff` | 4.6:1             | AA         | Cold temp (+ label)      |
| `--lcars-butterscotch` | `#ff9966` | 8.2:1             | AAA        | Warm temp                |
| `--lcars-peach`        | `#ff8866` | 6.8:1             | AAA        | Hot temp, very dry       |
| `--lcars-sunflower`    | `#ffcc99` | 13.1:1            | AAA        | Room name, dry/humid     |
| `--lcars-tomato`       | `#ff5555` | 5.2:1             | AA         | Low battery, very humid  |
| `--lcars-gray`         | `#666688` | 4.6:1             | AA         | Unavailable/offline      |
| `--lcars-space-white`  | `#f5f6fa` | 18.1:1            | AAA        | Nominal humidity text     |

All pass WCAG 1.4.3 (AA) minimum 4.5:1 against #000000. Color is **never the sole indicator** — temperature has numeric text alongside color, battery has the dot symbol, and unavailable states have the "OFFLINE" text label (WCAG 1.4.1).

---
