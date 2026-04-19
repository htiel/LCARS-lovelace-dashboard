## 9. Visual Comparison — Before vs. After

### Before (Server Room — 8 panels)

```
┌─ area-split-panels (right column) ──────────────────────┐
│                                                          │
│  ┌── SERVER STACK LOWER STRIP ── POWER SYSTEMS ──────┐  │
│  │  [full panel frame + strip content]               │  │  ~300px
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  ┌── LS-P2-UPPERSTRIP ── POWER SYSTEMS ──────────────┐  │
│  │  [full panel frame + strip content]               │  │  ~300px
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  ┌── DISHWASHER ── POWER SYSTEMS ────────────────────┐  │
│  │  [full panel frame + sparkline + stats]           │  │  ~250px
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  ┌── LIGHTING ── POWER SYSTEMS ──────────────────────┐  │
│  │  [full panel frame + sparkline + stats]           │  │  ~250px
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  ┌── GARAGE LIGHT BATHROOM ── POWER SYSTEMS ─────────┐  │  ... continues
│  ┌── UPSTAIRS BEDROOM BATHROOM ── POWER SYSTEMS ─────┐  │  ... 4 more
│  ┌── HALLWAY LIGHT ── POWER SYSTEMS ─────────────────┐  │
│  ┌── GARAGE OPENERS ── POWER SYSTEMS ────────────────┐  │
│                                                          │
│  Total vertical: ~2000px+ (4+ screens of scroll)        │
└──────────────────────────────────────────────────────────┘
```

### After (Server Room — 1 consolidated panel)

```
┌─ area-split-main (left column, bottom) ─────────────────────────────────┐
│                                                                          │
│  ┌── ⚡ POWER SYSTEMS ───── 6 CIRCUITS · 2 STRIPS ──────────────────┐   │
│  │                                                                    │  │
│  │  TOTAL USAGE: 806 W  ·  12.4 kWh TODAY                           │  │  ~40px
│  │                                                                    │  │
│  │  ┌─ CIRCUITS ──────────────────────────────────── 6/6 ─┐         │  │
│  │  │ ● DISHWASH │ ● LIGHTING │ ○ GARAGE LT │ ● UPSTAIRS │         │  │  ~100px
│  │  │   0 W      │   0 W      │   0 W       │   0 W      │         │  │  (2 rows)
│  │  │   0.7 kWh  │   0.7 kWh  │   0.7 kWh   │   0.7 kWh  │         │  │
│  │  │ ○ HALLWAY  │ ● GARAGE O │              │             │         │  │
│  │  │   0 W      │   0 W      │              │             │         │  │
│  │  └─────────────────────────────────────────────────────┘         │  │
│  │                                                                    │  │
│  │  ┌─ POWER STRIPS ─────────────────────────────── 2/2 ─┐         │  │
│  │  │  SERVER STACK LOWER STRIP  [ON]  TOTAL: 487 W      │         │  │  ~120px
│  │  │  ┊ [ON] OUTLET 1 — NAS        189W  4.2kWh         │         │  │
│  │  │  ┊ [ON] OUTLET 2 — SWITCH      12W  0.3kWh         │         │  │
│  │  │  ┊ ...                                              │         │  │
│  │  │                                                      │         │  │
│  │  │  LS-P2-UPPERSTRIP             [ON]  TOTAL: 119 W   │         │  │  ~60px
│  │  │  ┊ [ON] DEVICE A               85W  1.8kWh         │         │  │
│  │  │  ┊ [ON] DEVICE B               34W  0.7kWh         │         │  │
│  │  └──────────────────────────────────────────────────────┘         │  │
│  │                                                                    │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  Total vertical: ~400px (1 panel, < 1 screen)                           │
└──────────────────────────────────────────────────────────────────────────┘
```

**Space savings**: ~80% vertical reduction for the Server Room. For the Office, the Dog Heating Pad goes from its own full panel to a single row inside the consolidated panel.

---
