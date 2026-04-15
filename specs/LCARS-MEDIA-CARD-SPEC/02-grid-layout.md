## 1. Grid Layout

### ASCII Layout — Active State (Now Playing)

```
┌──────────────────────────────────────────────────────────┐
│  LIVING ROOM HOMEPOD           ▶ PLAYING                 │  ← header
├──────────────┬───────────────────────────────────────────┤
│              │   ╔═══════════════════════════════╗       │
│  SOURCE      │   ║                               ║       │
│  AIRPLAY     │   ║                               ║       │
│              │   ║        ALBUM ARTWORK          ║       │
│  GROUPED     │   ║                               ║       │
│  3 SPEAKERS  │   ║                               ║       │
│              │   ║                               ║       │
│  MEDIA TYPE  │   ╚═══════════════════════════════╝       │
│  MUSIC       │                                           │
│              │   TRACK TITLE                             │
│  SHUFFLE     │   ARTIST — ALBUM                          │
│  ON          │                                           │
│              │   ░░░░░░░░░░░░░████░░░░░░  2:34 / 4:12   │  ← progress
│  REPEAT      │                                           │
│  ALL         │   ┌──╮ ┌──────╮ ┌──────╮ ┌──────╮ ┌──╮   │  ← transport
│              │   │⇄ │ │ ⏮ PRV│ │▶ PLAY│ │NXT ⏭│ │↻ │   │
├──────────────┴───┴──┴─┴──────┴─┴──────┴─┴──────┴─┴──┴───┤
│  VOL ████████████████████░░░░░░░░░░░░░░░░░░░  62%   🔊  │  ← volume
└──────────────────────────────────────────────────────────┘
```

### ASCII Layout — Idle State (Nothing Playing)

```
┌──────────────────────────────────────────────────────────┐
│  LIVING ROOM HOMEPOD           ■ IDLE                    │  ← header
├──────────────┬───────────────────────────────────────────┤
│              │                                           │
│  SOURCE      │              ♪                            │
│  AIRPLAY     │         STANDBY                           │
│              │                                           │
│              │                                           │
├──────────────┴───────────────────────────────────────────┤
│  VOL ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  —%    🔇  │
└──────────────────────────────────────────────────────────┘
```

### ASCII Layout — Speaker Group View (Multi-Room)

```
┌──────────────────────────────────────────────────────────┐
│  AUDIO GROUP — 3 SPEAKERS      ▶ PLAYING                 │
├──────────────┬───────────────────────────────────────────┤
│              │   ╔═══════════════════════════════╗       │
│  SOURCE      │   ║        ALBUM ARTWORK          ║       │
│  AIRPLAY     │   ╚═══════════════════════════════╝       │
│              │   TRACK TITLE                             │
│  GROUPED     │   ARTIST — ALBUM                          │
│  ● LIVING RM │                                           │
│  ● KITCHEN   │   ┌──╮ ┌──────╮ ┌──────╮ ┌──────╮ ┌──╮   │
│  ● BEDROOM   │   │⇄ │ │ ⏮ PRV│ │▶ PLAY│ │NXT ⏭│ │↻ │   │
├──────────────┴───┴──┴─┴──────┴─┴──────┴─┴──────┴─┴──┴───┤
│  VOL ████████████████████░░░░░░░░░░░░░░░░░░░  62%   🔊  │
└──────────────────────────────────────────────────────────┘
```

### CSS Grid Definition

```css
.lcars-media-panel {
  display: grid;
  grid-template-areas:
    "header   header"
    "metadata media"
    "volume   volume";
  grid-template-columns: minmax(8rem, 1fr) minmax(14rem, 2.5fr);
  grid-template-rows: auto 1fr auto;
  gap: var(--lcars-gap);

  /* Frame border — Bracer Jack Rule 2: thick→thin, NEVER same */
  border-left: 4px solid var(--panel-frame-color, var(--lcars-african-violet));
  border-top: 2px solid var(--panel-frame-color, var(--lcars-african-violet));
  border-right: 2px solid var(--panel-frame-color, var(--lcars-african-violet));
  border-bottom: 4px solid var(--panel-frame-color, var(--lcars-african-violet));
  border-radius: 0.75rem;

  padding: var(--lcars-gap);
  background: var(--lcars-bg);

  /* Media frame color: african-violet (entertainment/media) */
  --panel-frame-color: var(--lcars-african-violet);

  /* Dynamic playback state color — set by JS */
  --media-state-color: var(--lcars-african-violet);

  min-height: calc(var(--lcars-vunit) * 4);
}

/* Idle state — more compact */
.lcars-media-panel.idle {
  min-height: calc(var(--lcars-vunit) * 2);
}
```

### Why `--lcars-african-violet` for the Frame

Entertainment and media systems on starships are associated with cooler violet/purple hues — distinct from the warm butterscotch of security cameras, the blue of environmental systems, and the ice of data panels. The `--lcars-african-violet` (#cc99ff) sits in the violet family, readable against black, and gives the media panel an immediately recognizable "recreation deck" identity. Per the Device Panel Spec §9 color mapping table: Media Player → violet-creme family. We use `--lcars-african-violet` as the primary with `--lcars-lilac` (#cc55ff) reserved for active/accent states.

---
