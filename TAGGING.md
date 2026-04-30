# LCARS Dashboard — Entity Tagging & Classification

LCARS auto-classifies entities using name-based heuristics, but you can override any classification using [Home Assistant Labels](https://www.home-assistant.io/docs/organizing/labels/) (HA 2024.4+). Labels can be applied to **entities**, **devices**, or **areas** — LCARS checks all three levels in that order, and the first match wins.

---

## How to Apply Labels

1. **Settings** → **Devices & Services** → find the device or entity
2. Click the device → **pencil icon** (edit)
3. Under **Labels**, type and add the label (e.g., `dedicated`, `exterior`)
4. Click **Update**

**Area-level labels** apply to all entities in that area. For example, labeling the "Server Room" area as `infrastructure` classifies all power circuits in that area under INFRASTRUCTURE without tagging each entity individually.

**Priority**: Entity label → Device label → Area label → Name heuristic fallback

---

## Camera Location Labels (Tactical Dashboard)

The Tactical dashboard's camera filter (ALL / EXTERIOR / INTERIOR) uses labels to classify cameras. Without labels, it falls back to a name-based heuristic (matching keywords like `front`, `garage`, `yard`).

| Label | Classification |
|-------|---------------|
| `exterior`, `outdoor`, `outside` | Camera shown under EXTERIOR filter |
| `interior`, `indoor`, `inside` | Camera shown under INTERIOR filter |

### Example

- Label your "Front Yard" **area** as `exterior` → all cameras in that area appear under EXTERIOR
- Label a specific camera **device** as `interior` → that camera appears under INTERIOR regardless of its area label

### Name Heuristic Fallback

When no label is present, cameras are classified by entity ID keywords:
- **Exterior**: `front`, `back`, `drive`, `garage`, `yard`, `outdoor`, `porch`, `door`
- **Interior**: Everything else

---

## Circuit Classification Labels (Engineering Dashboard)

The Engineering dashboard groups load circuits into categories. Without labels, circuits are classified by name heuristics (matching keywords like `dryer`, `server`, `light`). Add a label to override.

| Label | Category | Color | What Belongs Here |
|-------|----------|-------|-------------------|
| `dedicated` | DEDICATED | Butterscotch | Heavy/fixed loads — pool, spa, dryer, washer, water heater, HVAC, fridge, oven, EV charger, well pump, sump pump, garage door |
| `infrastructure` | INFRASTRUCTURE | Ice | Network & IT — servers, switches, UPS, NAS, rack equipment, PoE devices, routers, access points |
| `lighting` | LIGHTING | Sunflower | All lighting circuits — overhead lights, lamps, sconces, LED strips, chandeliers |
| `outlets` | OUTLETS | Bluey | General-purpose receptacles — bedroom outlets, kitchen outlets, bathroom outlets, living room outlets |
| `battery` | BATTERY | African Violet | Battery/storage systems — EcoFlow, Jackery, Bluetti, portable power stations |

Anything without a matching label or name heuristic appears under **OTHER** (gray).

### Example

Your Emporia Vue circuit named "Circuit 14" doesn't match any keyword. It's your dishwasher.

1. **Settings** → **Devices & Services** → find "Circuit 14" entity
2. Edit → add label: `dedicated`
3. Circuit 14 now appears under DEDICATED LOADS on the Engineering dashboard

### Name Heuristic Fallback

When no label is present, circuits are classified by friendly name keywords:

| Category | Keywords Matched |
|----------|-----------------|
| DEDICATED | `heat`, `hvac`, `furnace`, `hot tub`, `spa`, `pool`, `pump`, `compressor`, `minisplit`, `dryer`, `washer`, `dishwash`, `water heat`, `fridge`, `refrigerat`, `freezer`, `microwave`, `oven`, `disposal`, `range`, `stove`, `well pump`, `sump`, `garage door`, `ev charg`, `car charg` |
| INFRASTRUCTURE | `server`, `udm`, `poe`, `ap`, `network`, `router`, `modem`, `nas`, `rack`, `stack`, `unifi`, `usw`, `usg`, `switch`, `patch`, `ups` |
| LIGHTING | `light`, `lamp`, `sconce`, `chandelier`, `fixture`, `led`, `illuminat` |
| OUTLETS | `outlet`, `plug`, `receptacle`, `bedroom`, `kitchen`, `garage`, `closet`, `hallway`, `entry`, `bathroom`, `living`, `dining`, `office` |
| BATTERY | `ecoflow`, `river`, `delta`, `jackery`, `bluetti`, `battery` |

---

## Tips

- **Bulk tagging**: Label an entire **area** instead of individual entities. All circuits in "Server Room" labeled `infrastructure` saves tagging each rack device.
- **Mixed areas**: If an area has both infrastructure and outlets (e.g., an office with a server rack), label the server devices individually as `infrastructure` and the area as `outlets`.
- **Labels are case-insensitive**: `Dedicated`, `DEDICATED`, and `dedicated` all work.
- **Changes are instant**: No restart required. Labels take effect on the next dashboard refresh.
