## 2. Layout Structure — The "Viewscreen Frame"

The Device Panel uses a **2-column asymmetric grid** within a bordered frame. The primary media (camera feed) is right-justified and dominant. Sensor telemetry sits left-aligned as text readouts. Controls run along the bottom.

```
┌──────────────────────────────────────────────────────┐
│ ┌──────────┐                                         │
│ │ DEVICE   │            ╔════════════════════════╗   │
│ │ NAME     │            ║                        ║   │
│ └──────────┘            ║    PRIMARY MEDIA       ║   │
│                         ║    (Camera Feed /      ║   │
│  SENSOR TELEMETRY       ║     Thermostat /       ║   │
│  ● MOTION    DETECTED   ║     Album Art)         ║   │
│  ● PERSON    CLEAR      ║                        ║   │
│  ● DOORBELL  IDLE       ║                        ║   │
│  ● SIGNAL    -42 dBm    ╚════════════════════════╝   │
│  ● BATTERY   78%                                     │
│                                                      │
│  ┌─────────╮ ┌─────────╮ ┌─────────╮ ┌─────────╮    │
│  │ IR LED  │ │ STATUS  │ │ PRIVACY │ │ DETAILS │    │
│  └─────────╯ └─────────╯ └─────────╯ └─────────╯    │
└──────────────────────────────────────────────────────┘
```

### CSS Grid Definition

```css
.lcars-device-panel {
  display: grid;
  grid-template-columns: minmax(10rem, 1fr) minmax(16rem, 2fr);
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header   header"
    "sensors  media"
    "controls controls";
  gap: var(--lcars-gap);
  
  /* Frame border — Bracer Jack Rule: thick→thin or thin→thick, NEVER same */
  border-left: 4px solid var(--panel-frame-color, var(--lcars-butterscotch));
  border-top: 2px solid var(--panel-frame-color, var(--lcars-butterscotch));
  border-right: 2px solid var(--panel-frame-color, var(--lcars-butterscotch));
  border-bottom: 4px solid var(--panel-frame-color, var(--lcars-butterscotch));
  
  /* Inner elbow radius — subtle, not aggressive */
  border-radius: 0.75rem;
  
  padding: var(--lcars-gap);
  background: var(--lcars-black);
  
  /* Per Jörn Weißenborn grid: minimum panel dimensions */
  min-height: calc(var(--lcars-vunit) * 4);
}
```

### Why This Layout

- **Right-justified media**: On TNG/DS9/VOY, the viewscreen and primary data displays always occupy the **dominant right-hand area**. The operator's eye tracks left-to-right: status first, then the visual. This matches Western reading order and the on-screen LCARS tradition. (Source: Ex Astris Scientia, screen captures of Operations consoles)
- **Left-side telemetry**: Sensor data as text readouts mirrors the alphanumeric columns flanking viewscreens in TNG Engineering and Ops. (Source: TheLCARS.com template, sidebar data pattern)
- **Bottom controls**: Physical LCARS consoles place action buttons below the display area. The "cap as button" principle (Bracer Jack Rule 4) applies here.

---
