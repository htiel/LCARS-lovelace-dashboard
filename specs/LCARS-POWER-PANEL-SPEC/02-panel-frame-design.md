## 1. Panel Frame Design

### 1.1 Frame Color Assignment

| Panel Type   | Frame Color               | CSS Variable               | Reasoning |
|-------------|---------------------------|----------------------------|-----------|
| Camera      | `--lcars-butterscotch`    | Default                    | General purpose |
| Climate     | Dynamic (HVAC action)     | `--lcars-butterscotch/ice` | State-driven |
| Battery     | `--lcars-ice`             | Cool accent                | Storage/passive |
| Alarm       | Dynamic (alarm state)     | State-driven               | Alert escalation |
| Media       | `--lcars-african-violet`  | Entertainment              | Distinctive |
| **Power**   | **`--lcars-butterscotch`**| **`--lcars-butterscotch`** | **EPS conduit orange** |

**Rationale**: Power distribution on TNG/DS9 Engineering consoles consistently used warm orange/amber tones for EPS conduit displays and power flow routing. Butterscotch (`#ff9966`) is our closest match. It also creates visual kinship with the Climate panel when heating, reinforcing the "energy flowing" metaphor. (Source: Ex Astris Scientia engineering console screen captures; TheLCARS.com header bar color)

When the panel detects **critical draw** (any circuit ≥3000W), the frame color shifts to `--lcars-tomato` via `--panel-frame-color`. This mirrors the Battery panel's low-charge alert and Alarm panel's triggered state — an established LCARS convention that "the frame tells you the status."

### 1.2 Border Style

Standard LCARS device panel frame per LCARS-DEVICE-PANEL-SPEC §2:

```css
.lcars-power-panel {
  --panel-frame-color: var(--lcars-butterscotch);

  display: grid;
  border-left: 4px solid var(--panel-frame-color);
  border-top: 2px solid var(--panel-frame-color);
  border-right: 2px solid var(--panel-frame-color);
  border-bottom: 4px solid var(--panel-frame-color);
  border-radius: 0.75rem;
  padding: var(--lcars-gap);
  background: var(--lcars-black);
  min-height: calc(var(--lcars-vunit) * 4);
}
```

**Bracer Jack Rule 2**: thick→thin (left 4px → top 2px) or thin→thick (right 2px → bottom 4px). NEVER same thickness on consecutive turns. ✓

### 1.3 Typography

All text follows the established three-tier LCARS font system:

| Element | Size Token | CSS Variable | Casing | Color |
|---------|-----------|-------------|--------|-------|
| Panel header (area name) | Title | `--lcars-font-size-title` (2rem) | UPPERCASE | `--lcars-text-heading` (sunflower) |
| Section labels ("CIRCUITS", "DEVICES", "POWER STRIPS") | Sub | `--lcars-font-size-sub` (1.25rem) | UPPERCASE | `--lcars-text-heading` (sunflower) |
| Entity names, values, units | Data | `--lcars-font-size-data` (0.875rem) | UPPERCASE | `--lcars-space-white` (values), `--lcars-ice` (units) |
| Summary large numbers (total W) | Title | `--lcars-font-size-title` (2rem) | UPPERCASE | Dynamic power-level color |
| Sparkline labels | Data | `--lcars-font-size-data` | UPPERCASE | `--lcars-ice` |

Font family: `var(--lcars-font)` — Antonio everywhere. No exceptions.

---
