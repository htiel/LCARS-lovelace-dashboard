## 5. Accessibility Requirements (WCAG 2.2 AA)

### 5.1 ARIA Structure

```html
<!-- Panel root -->
<div class="lcars-power-panel lcars-device-panel"
     role="region"
     aria-label="${areaName} Power Systems">

  <!-- Panel header -->
  <div class="power-panel-header" role="heading" aria-level="3">
    <ha-icon icon="mdi:flash"></ha-icon>
    <span class="power-panel-name">${areaName}</span>
    <div class="power-panel-header-line" aria-hidden="true"></div>
    <span class="power-panel-badge">POWER SYSTEMS</span>
  </div>

  <!-- Summary section (if Vue present) -->
  <div class="power-summary" role="group" aria-label="Power Summary">
    <div class="power-summary-card"
         role="status"
         aria-label="Total usage: ${totalW} watts, ${totalKwh} kilowatt hours today"
         aria-live="polite">
      ...
    </div>
    <!-- From Grid, To Grid cards similar -->
  </div>

  <!-- Circuits section -->
  <div class="power-circuits-section">
    <div class="power-section-label" role="heading" aria-level="4">
      <span>CIRCUITS</span>
      <span class="sr-only">: ${visibleCount} of ${totalCount}</span>
    </div>
    <div class="power-circuits"
         role="list"
         aria-label="Circuit Monitors">
      <div class="power-circuit-tile"
           role="listitem"
           tabindex="0"
           aria-label="${circuitName}: ${watts} watts, ${tier} draw, ${kwhToday} kilowatt hours today"
           @click="${() => showMoreInfo(entityId)}"
           @keydown="${(e) => e.key === 'Enter' && showMoreInfo(entityId)}">
        <span class="power-circuit-indicator" aria-hidden="true">●</span>
        ...
      </div>
    </div>
  </div>

  <!-- Devices section -->
  <div class="power-devices-section">
    <div class="power-section-label" role="heading" aria-level="4">
      <span>MONITORED DEVICES</span>
    </div>
    <div class="power-devices" role="list" aria-label="Monitored Devices">
      <div class="power-device-row"
           role="listitem"
           tabindex="0"
           aria-label="${deviceName}: ${switchState}, ${watts} watts">
        <button class="power-toggle"
                role="switch"
                aria-checked="${isOn}"
                aria-label="Toggle ${deviceName}"
                @click="${toggleSwitch}">
          ${isOn ? 'ON' : 'OFF'}
        </button>
        ...
      </div>
    </div>
  </div>

  <!-- Power strips section -->
  <div class="power-strips-section">
    <div class="power-section-label" role="heading" aria-level="4">
      <span>POWER STRIPS</span>
    </div>
    <div class="power-strips" role="list" aria-label="Power Strips">
      <div class="power-strip-block" role="listitem">
        <div class="power-strip-header" role="heading" aria-level="5">
          ${stripName}
        </div>
        <div class="power-strip-outlets" role="list" aria-label="${stripName} outlets">
          <!-- Child rows with role="listitem" -->
        </div>
      </div>
    </div>
  </div>
</div>
```

### 5.2 ARIA Roles and Landmarks Summary

| Element | Role | Purpose |
|---------|------|---------|
| Panel root | `region` + `aria-label` | Landmark for assistive tech navigation |
| Panel header | `heading` (level 3) | Area name as section heading |
| Summary cards | `status` + `aria-live="polite"` | Live-updating power values announced |
| Section labels | `heading` (level 4) | Subsection structure |
| Circuit grid | `list` | Navigable list of circuit tiles |
| Circuit tile | `listitem` + `tabindex="0"` | Focusable, activatable tile |
| Device list | `list` | Navigable list of device rows |
| Toggle button | `switch` + `aria-checked` | Switch control per WAI-ARIA APG |
| Power strip | `listitem` with nested `list` | Hierarchical strip → outlets |
| Strip outlet | `listitem` + toggle `switch` | Child outlet in strip |
| Sparklines | wrapper `aria-label` | Textual description of trend |
| Decorative indicators | `aria-hidden="true"` | Shape dots hidden from SR |

### 5.3 Keyboard Navigation

**Tab order** (follows visual top-to-bottom, left-to-right per WCAG §2.4.3 Focus Order):

1. Panel region (skippable via landmark nav)
2. Summary cards (not individually focusable — static status)
3. First circuit tile → Tab through all tiles (left-to-right, row-by-row)
4. First device row → Tab through device rows
5. First device toggle button (nested focus within row)
6. First strip block → first outlet toggle → through all outlets
7. Next panel

**Key bindings**:

| Key | Action |
|-----|--------|
| `Tab` | Move to next focusable element |
| `Shift+Tab` | Move to previous focusable element |
| `Enter` | Activate tile (show more-info) or toggle switch |
| `Space` | Toggle switch (per APG switch pattern) |
| `Escape` | Close more-info dialog (handled by HA) |

**Focus management**:
- Circuit tiles receive `tabindex="0"` — they participate in tab order
- Toggle buttons are native `<button>` elements — inherently focusable
- When circuit count exceeds scroll container, focus automatically scrolls the tile into view (browser default)
- No focus trapping within the panel — standard sequential navigation

### 5.4 Screen Reader Announcements

| Event | Announcement | Mechanism |
|-------|-------------|-----------|
| Enter panel region | "Main Panel Power Systems, region" | `role="region"` + `aria-label` |
| Reach summary card | "Total usage: 4,872 watts, 47.3 kilowatt hours today" | `aria-label` |
| Summary value change | Value politely announced | `aria-live="polite"` on status |
| Navigate to circuit | "Kitchen Lights: 342 watts, low draw, 1.2 kilowatt hours today" | `aria-label` with tier |
| Activate circuit | HA more-info dialog opens | Standard HA behavior |
| Toggle switch | "Toggle Dog Heating Pad, switch, checked/not checked" | `role="switch"` + `aria-checked` |
| Switch state change | "On" / "Off" confirmed | `aria-checked` update |
| Unavailable entity | "Garage Charger: unavailable" | `aria-label` + tomato color |

### 5.5 `prefers-reduced-motion` Overrides

Animations in the Power Panel:

| Animation | Default | Reduced Motion |
|-----------|---------|---------------|
| Critical draw pulse (frame border) | `lcars-distress-pulse` 1s infinite | Static `--lcars-tomato` border, no animation |
| Critical draw indicator dot pulse | Scale pulse 2s infinite | Static filled dot `●●●` |
| Value update flash (pill badge) | `lcars-value-flash` 300ms | Instant color change, no animation |
| Sparkline line draw | None (static SVG) | N/A |
| Tile hover background | 200ms transition | Instant (0.01ms) |
| Toggle switch state change | 200ms background transition | Instant (0.01ms) |

```css
@media (prefers-reduced-motion: reduce) {
  .lcars-power-panel { animation: none; }
  .lcars-power-panel[data-alert="critical"] {
    animation: none;
    border-color: var(--lcars-tomato);
  }
  .power-circuit-indicator.critical { animation: none; }
  .power-circuit-tile, .power-device-row, .power-toggle {
    transition-duration: 0.01ms !important;
  }
  .battery-pill-badge .pill-value.updated { animation: none; }
}
```

### 5.6 Focus-Visible Styling

All interactive elements use the established LCARS focus-visible pattern:

```css
.power-circuit-tile:focus-visible,
.power-device-row:focus-visible,
.power-toggle:focus-visible,
.power-strip-block:focus-visible {
  outline: 2px solid var(--lcars-ice);
  outline-offset: 2px;
}
```

- **2px solid** meets WCAG 2.2 §2.4.13 Focus Appearance (AAA) minimum perimeter thickness
- **`--lcars-ice` (`#99ccff`)** on `#000000` background = 10.5:1 contrast ratio (exceeds 3:1 requirement)
- **`outline-offset: 2px`** ensures the focus ring doesn't overlap the element content (§2.4.11 Focus Not Obscured)

### 5.7 Target Sizes (WCAG 2.2 §2.5.8)

| Element | Minimum Size | Actual Size | Compliant |
|---------|-------------|-------------|-----------|
| Circuit tile | 24×24 CSS px | ~160×48 px | ✓ PASS |
| Toggle button | 24×24 CSS px | 40×24 px | ✓ PASS |
| Device row | 24×24 CSS px | ~full-width × 40px | ✓ PASS |
| Strip outlet row | 24×24 CSS px | ~full-width × 40px | ✓ PASS |

All interactive targets exceed the 24×24 CSS pixel minimum.

---
