## 6. Color Assignment by UI Role

### Structural Frame

| Element             | Color Variable                   | Hex       | Source Rule                          |
|---------------------|----------------------------------|-----------|--------------------------------------|
| Header elbow        | `--lcars-frame-elbow-top`        | `#ff9966` | TheLCARS.com header structure        |
| Header bar          | `--lcars-frame-header-bar`       | `#ff9966` | Matches elbow — same structural unit |
| Sidebar rail/panels | `--lcars-frame-sidebar`          | `#cc99ff` | TheLCARS.com sidebar                 |
| Footer elbow        | `--lcars-frame-elbow-bottom`     | `#cc99ff` | TheLCARS.com footer                  |
| Footer bar          | `--lcars-frame-footer-bar`       | `#cc99ff` | Matches footer elbow                 |
| Background          | `--lcars-black`                  | `#000000` | Universal — always black             |

### Interactive Elements

| Element                | Color Variable                | Hex       | Rationale                                      |
|------------------------|-------------------------------|-----------|-------------------------------------------------|
| Default button         | `--lcars-button-default`      | `#ffcc99` | Sunflower — standard neutral button              |
| Nav button (sidebar)   | `--lcars-button-nav`          | `#cc99ff` | African-violet — matches sidebar                 |
| Area button (sidebar)  | `--lcars-frame-sidebar-accent`| `#ffbbaa` | Almond-creme — distinct from nav, warm grouping  |
| Active/Selected        | `--lcars-button-active`       | `#ffaa00` | Gold — universally signals active state          |
| Action/Primary CTA     | `--lcars-button-action`       | `#ff9966` | Butterscotch — draws eye to primary action       |
| Alt button (devices)   | `--lcars-button-alt-1`        | `#99ccff` | Ice — cool contrast for device/entity actions    |
| Alt button (more pages)| `--lcars-button-alt-2`        | `#ffaa90` | Almond — warm secondary                         |
| Alt button (config)    | `--lcars-button-alt-3`        | `#cc55ff` | Lilac — distinct from operational buttons        |
| Disabled button        | `--lcars-button-disabled`     | `#666688` | Gray — clearly unavailable                       |
| Hover state            | `filter: brightness(1.2)`     | n/a       | Bracer Jack: simple brightness, nothing more     |

### Text

| Role           | Color Variable             | Hex       |
|----------------|----------------------------|-----------|
| Primary text   | `--lcars-text-primary`     | `#f5f6fa` |
| Heading text   | `--lcars-text-heading`     | `#ffcc99` |
| Sub-heading    | `--lcars-text-subheading`  | `#99ccff` |
| Text on button | `--lcars-text-on-button`   | `#000000` |
| Muted text     | `--lcars-text-muted`       | `#666688` |
| Alert text     | `--lcars-text-alert`       | `#ff5555` |

### Status Indicators

| Status      | Color Variable          | Hex       |
|-------------|-------------------------|-----------|
| OK/Normal   | `--lcars-status-ok`     | `#99ccff` |
| Warning     | `--lcars-status-warn`   | `#ff9900` |
| Error/Alert | `--lcars-status-error`  | `#ff5555` |
| Offline     | `--lcars-status-offline`| `#666688` |

### Color Family Analysis (Bracer Jack Validation)

Total hue families in active use:

1. **Orange/Warm** — butterscotch, sunflower, almond, almond-creme, gold, golden-orange, peach, orange (~1 family, ~8 tints)
2. **Violet/Purple** — african-violet, lilac, violet-creme (~1 family, ~3 tints)
3. **Blue/Cool** — ice, bluey, blue, sky (~1 family, ~4 tints)
4. **Gray** — gray (~1 family, ~1 tint)
5. **White** — space-white (~1 family, ~1 tint)

**Result**: 5 hue families. Per Bracer Jack: "You'd better know what you're doing." We do — each family has symbolic assignment: warm=structure+action, violet=navigation+frame, blue=data+secondary, gray=disabled, white=text. **Red** (tomato) is the 6th but reserved exclusively for alerts — a justified exception per the alert-only rule.

---
