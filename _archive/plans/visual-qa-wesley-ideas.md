# LCARS Visual QA — Wesley Crusher UX & Creative Review

**Audit date**: 2026-04-18
**Auditor**: Wesley Crusher (UX / Creative / Interaction Design)
**Scope**: Usability problems, creative improvements, information architecture, empty states, user delight
**Homes inspected**: mariner's house (16 rooms), Boimler's house (23 rooms)

> **Note**: LCARS design compliance bugs are Geordi's domain. Entity classification
> bugs are Data's domain. This report focuses on **user experience**, **creative
> enhancements**, and **interaction design** — the things that make the difference
> between a functional dashboard and one that feels like you're actually on the bridge
> of the *Cerritos*.

---

## Re-Review Notes (2026-04-18)

Re-reviewed with fresh eyes against Geordi's updated report (`visual-qa-geordi-bugs.md`)
and Data's updated report (`visual-qa-data-bugs.md`).

### Changes Made

| Action | ID | Reason |
|--------|-----|--------|
| REVISE | WESLEY-UX-001 | Added cross-ref to DATA-014 |
| REVISE | WESLEY-UX-002 | Added cross-ref to GEORDI-017; noted connection to UX-004/IDEA-003 |
| REVISE | WESLEY-UX-003 | Added cross-ref to DATA-012; Wesley's sensor "NO DATA" treatment extends beyond DATA's button-only fix |
| REVISE | WESLEY-UX-005 | Added cross-refs GEORDI-015/IDEA-002; clarified ESTABLISHING LINK is already existing behavior |
| REVISE | WESLEY-UX-008 | Severity LOW → MEDIUM; added cross-ref to IDEA-005 |
| REVISE | WESLEY-UX-009 | Added cross-ref to IDEA-006 |
| REVISE | WESLEY-UX-010 | Added cross-ref to GEORDI-003 (distinct context — pool labels vs sparkline labels) |
| REVISE | WESLEY-UX-011 | Severity LOW → MEDIUM; added cross-ref to IDEA-010 |
| REVISE | WESLEY-UX-012 | Added cross-ref to GEORDI-015 |
| KEEP | WESLEY-UX-004, 006, 007 | Valid and well-described |
| REVISE | WESLEY-IDEA-001 | Reframed: Option B is the genuine UX win; A/C are aesthetic — Geordi is primary reviewer not just advisory |
| REVISE | WESLEY-IDEA-002 | Fixed inaccurate claim: CSS produces scanlines/shimmer, not true random noise |
| REVISE | WESLEY-IDEA-004 | Flagged misleading Trek flavor text in some empty state messages |
| REVISE | WESLEY-IDEA-007 | Priority COULD → WISH; noted `media_content_type` unreliability in practice |
| REVISE | WESLEY-IDEA-008 | Flagged "DORMANT" as potentially alarming language |
| REVISE | WESLEY-IDEA-009 | Clarified shadow DOM limitation — View Transitions capture the card container, not individual shadow-DOM panels |
| REVISE | WESLEY-IDEA-012 | Added DATA-009 cross-ref; wattage-tier color-coding is Wesley's additive value beyond Data's naming fix |
| REVISE | WESLEY-IDEA-014 | Reframed as genuine HVAC improvement, not DATA-004/005 workaround; priority SHOULD → COULD |
| REVISE | WESLEY-IDEA-015 | Added HA companion app haptic conflict note; noted iPad non-support |
| REVISE | WESLEY-IDEA-016 | Added sparkline data scope limitation — Life Support panels only |
| KEEP | WESLEY-IDEA-003, 005, 006, 010, 011, 013 | Valid and well-described |
| ADD | WESLEY-UX-013 | New: "Undo" action toast for high-impact toggle operations |
| ADD | WESLEY-IDEA-017 | New: Universal "LAST ACTIVE" timestamp for all unavailable device states |

### Key Cross-References

- **Unavailable media**: WESLEY-UX-002 (unavailable) + WESLEY-UX-004 (standby) → IDEA-003 (hub) + GEORDI-017 (visual)
- **Offline cameras**: WESLEY-UX-005 + IDEA-002 ↔ GEORDI-015 (static effect)
- **0W power panels**: WESLEY-UX-008 → IDEA-005 (progressive power panel)
- **Garage door state**: WESLEY-UX-009 → IDEA-006 (visual position indicator)
- **Alarm duplication**: WESLEY-UX-011 → IDEA-010 (header badge)
- **Button UNKNOWN**: WESLEY-UX-003 ↔ DATA-012 (same root cause; Wesley extends to sensor domain)
- **Sensor grouping**: WESLEY-IDEA-011 ↔ DATA-007/DATA-011 (architectural fix alignment)
- **Pool circuits**: WESLEY-IDEA-012 ↔ DATA-009 (naming root cause; Wesley adds color-coding)

---

## Severity / Priority Definitions

### UX Bug Severity

| Severity | Meaning |
|----------|---------|
| CRITICAL | User cannot accomplish a task or is actively misled |
| HIGH | Significant confusion or friction in common workflow |
| MEDIUM | Noticeable UX gap, workaround exists |
| LOW | Minor annoyance, polish item |

### Creative Idea Priority

| Priority | Meaning |
|----------|---------|
| MUST | Addresses a clear UX gap that hurts usability today |
| SHOULD | Meaningful improvement, worth planning for next release |
| COULD | Nice-to-have, would delight users if feasible |
| WISH | Future vision, needs research or architecture changes |

---

# SECTION 1: UX BUGS

---

## WESLEY-UX-001 — No Actionable Guidance When Devices Need Adoption

- **Severity**: HIGH
- **Home**: mariner
- **Room(s)**: Server Room (IPC-Model camera)
- **What's confusing**: The camera shows "Adopt Device" button alongside "UNAVAILABLE" state. The user sees two signals — one suggesting action ("adopt"), one suggesting failure ("unavailable") — but has no idea what "adopt" means in this context, where to go to do it, or why the camera is in this state. Is it broken? Is it new? Does the user need to go to UniFi Protect? The dashboard gives zero context.
- **Suggested UX improvement**: When a device has a config entry that requires adoption/setup, show a contextual message: "This device needs setup in [integration name]" with a link or deep-link to the HA integration page. Replace the ambiguous "Adopt Device" button with an LCARS-styled call-to-action: "CONFIGURE IN UNIFI PROTECT" in `--lcars-gold`. The button should open the relevant integration's device page via `navigate(/config/devices/device/[device_id])`.
- **Cross-ref**: DATA-014 (same device — Data proposes filtering long-unavailable entities into a collapsed OFFLINE section; Wesley owns the contextual guidance and deep-link UX on top of that).

---

## WESLEY-UX-002 — UNAVAILABLE Media Players Waste Space With No Value

- **Severity**: HIGH
- **Home**: Boimler
- **Room(s)**: Multiple rooms with offline media players
- **What's confusing**: Dead media players render full-size panels showing "UNAVAILABLE 551-520" — the LCARS code suffix makes it look like an error code the user should investigate. Multiple unavailable media panels stacked in a room create walls of unhelpful identical panels. The user scrolls past 3-4 unavailable panels to find one that actually works.
- **Suggested UX improvement**: Unavailable media players should collapse to a single-line compact row within a "COMM SYSTEMS OFFLINE" summary strip — showing device name and "OFFLINE" in gray. Only render full media panels for devices that are in `idle`, `standby`, `playing`, or `paused` states. The LCARS code ("551-520") should be suppressed or grayed when the device is unavailable — it looks like a diagnostic code the user needs to act on.
- **Cross-ref**: GEORDI-017 (visual impact of offline/standby media panels). Solve together with WESLEY-UX-004 — both unavailable (UX-002) and standby (UX-004) cases benefit from the IDEA-003 consolidated media hub approach.

---

## WESLEY-UX-003 — "UNKNOWN" State Shown as Red Error for Button/Restart Entities

- **Severity**: HIGH
- **Home**: Both
- **Room(s)**: Multiple rooms with Kasa/TP-Link devices, cameras
- **What's confusing**: `button` and `input_button` entities default to "UNKNOWN" state before first press. This is normal HA behavior — it's not an error. But the dashboard renders "UNKNOWN" in `--lcars-tomato` (red), making it look like something is broken. Users see a sea of red "UNKNOWN" indicators and think their devices are malfunctioning.
- **Suggested UX improvement**: For `button` and `input_button` domains, treat "UNKNOWN" as the expected idle state. Display "READY" or "STANDBY" in `--lcars-gray` instead of "UNKNOWN" in red. For `sensor` domain entities, "UNKNOWN" should show "NO DATA" in gray with an info tooltip. Reserve red "UNKNOWN" only for entities where the state genuinely represents a failure (e.g., a `binary_sensor` that should always report on/off).
- **Cross-ref**: DATA-012 (same root cause for `button` domain specifically). Wesley's scope extends further: DATA-012 addresses only `button` domain; the `sensor` domain "UNKNOWN" → "NO DATA" treatment and the domain-awareness principle are additional improvements not covered by DATA-012's targeted fix.

---

## WESLEY-UX-004 — Standby Media Panels Are Visually Identical and Repetitive

- **Severity**: MEDIUM
- **Home**: mariner
- **Room(s)**: Master Bedroom (3 media panels: Left, Right, AppleTV all in Standby)
- **What's confusing**: Three full-height media panels each showing an identical music note glyph + "STANDBY" label. The user can't quickly distinguish between them without reading the panel title. It's visually monotonous and wastes significant vertical space for zero informational value.
- **Suggested UX improvement**: When multiple media players in the same room are all idle/standby, collapse them into a single "COMM ARRAY" panel showing a compact row per player: `[icon] [name] — STANDBY`. Only expand to full media panel when a player transitions to `playing` or `paused`. The expanded panel gets hero treatment (album art, waveform, transport controls) while siblings stay compact. This mirrors how a real Starfleet bridge would handle multiple comm channels — the active one gets the main viewscreen.

---

## WESLEY-UX-005 — "Viewscreen Offline" Doesn't Communicate Recovery Path

- **Severity**: MEDIUM
- **Home**: Both
- **Room(s)**: Multiple rooms with offline cameras
- **What's confusing**: "VIEWSCREEN OFFLINE" is a great thematic label, but it's a dead end. The user sees it and thinks: *Is the camera dead? Is the network down? Will it come back? Should I do something?* There's no indication of when it was last online, whether it's expected to be offline, or what to try.
- **Suggested UX improvement**: Add contextual information below the "VIEWSCREEN OFFLINE" message:
  - "LAST SIGNAL: 2h 14m AGO" (using `last_changed` from the entity state) in `--lcars-gray`
  - If the camera has been offline > 24h, escalate visual treatment: frame shifts to `--lcars-gray`, add subtle scan-line animation (like a dead CRT)
  - If < 5 minutes offline: the camera is likely rebooting — suppress the static/scan-line effect and let the existing "ESTABLISHING LINK" connecting animation handle the reconnect transition naturally. No change needed here.
- **Cross-ref**: GEORDI-015 (visual treatment of offline camera state — the red frame and missing scan-line are Geordi's fix). IDEA-002 (static effect implementation). Wesley owns the "last signal" contextual timestamp layer.

---

## WESLEY-UX-006 — Power Panel "Show All Circuits" Hides Information Without Context

- **Severity**: MEDIUM
- **Home**: Both
- **Room(s)**: Rooms with many power circuits
- **What's confusing**: The "Show All Circuits" button exists but gives no preview of what's hidden. How many circuits are hidden? Are any of them actively drawing significant power? The user has to click to find out, then click again to collapse. There's no progressive disclosure — it's binary show/hide.
- **Suggested UX improvement**: Change "Show All Circuits" to "SHOW 12 MORE CIRCUITS (340W TOTAL)" — include the count and aggregate wattage of hidden circuits. If any hidden circuit is drawing > 500W (high load), show a `--lcars-butterscotch` indicator dot next to the button to signal "something interesting is hidden." This gives the user enough info to decide whether expanding is worth it.

---

## WESLEY-UX-007 — Irrigation Controller "OFFLINE" Has No User Explanation

- **Severity**: MEDIUM
- **Home**: Boimler
- **Room(s)**: Irrigation panel (Flume Sensor showing Controller OFFLINE)
- **What's confusing**: "Controller OFFLINE" is displayed but the user doesn't know: Is this seasonal? Is the Rachio disconnected from WiFi? Is the Flume sensor separate from the Rachio? The irrigation panel shows "IDLE" alongside "OFFLINE" which is contradictory — is it idle or offline?
- **Suggested UX improvement**: Distinguish between sensor states clearly:
  - Flume water sensor: "MONITORING" (active) / "IDLE" (no flow detected) in `--lcars-ice`
  - Rachio controller: "ONLINE" / "STANDBY" (connected but not running) / "OFFLINE" (disconnected) in appropriate colors
  - When controller is OFFLINE, show last-seen timestamp and suppress the START/FIXED/KEEP action buttons (they can't work anyway). Gray out the zone list.

---

## WESLEY-UX-008 — 0W Power Panels Render Full-Size With No Value

- **Severity**: MEDIUM *(raised from LOW — affects any room where all circuits are off, common overnight; multiple rooms impacted)*
- **Home**: mariner
- **Room(s)**: Office (Power 0W)
- **What's confusing**: A room showing "Power 0W" renders a full donut chart and panel frame for... nothing. Zero watts. No circuits drawing power. The panel exists but communicates "everything is off" using the same visual weight as an active power panel.
- **Suggested UX improvement**: When total power draw is 0W, collapse the power panel to a compact single-line summary: "POWER SYSTEMS — STANDBY — 0W" in `--lcars-gray`. The donut chart adds nothing when it's empty. Reserve the full power panel rendering for when actual power is being drawn (> 0W). This follows the Trek principle: dark/quiet panels mean everything is nominal.
- **Cross-ref**: IDEA-005 (the solution — progressive power panel with threshold-based rendering modes).

---

## WESLEY-UX-009 — Garage Door "UNKNOWN" Toggle With No Position Feedback

- **Severity**: MEDIUM
- **Home**: Boimler
- **Room(s)**: Garage (Single Door, Double Door, Toggle Door)
- **What's confusing**: Garage doors show "0%" position and a "Toggle Door" button in "UNKNOWN" state. The user sees three different labels (Single Door, Double Door, Toggle Door) with cryptic states. Is 0% open or closed? What does "Toggle" do — open or close? There's no visual representation of the door's physical state.
- **Suggested UX improvement**: Replace the percentage display with clear state labels: "CLOSED" (0%), "OPEN" (100%), "PARTIAL 35%" for intermediate positions. Replace "Toggle Door" with a contextual action: "OPEN DOOR" when closed, "CLOSE DOOR" when open. Add a simple visual — even a horizontal bar that fills from left to right showing the door position — to make the physical state immediately obvious.
- **Cross-ref**: IDEA-006 (the creative solution — garage door visual position indicator with animated bar).

---

## WESLEY-UX-010 — Sparkline Labels Truncated to Unreadable Abbreviations

- **Severity**: MEDIUM
- **Home**: Both
- **Room(s)**: Multiple Life Support panels with sparkline trays
- **What's confusing**: Sparkline labels show "PM1", "PM2...", "PM1...", "AIR...", "AIR..." — truncated labels that are impossible to distinguish. The user sees 5 sparklines but can't tell which is PM2.5 vs PM10 vs PM1 because they all truncate to the same prefix. The sparklines themselves look nearly identical (small, same shape), compounding the problem.
- **Suggested UX improvement**: Use standardized short labels that fit: "PM₂.₅", "PM₁₀", "CO₂", "VOC", "AQI" — these are the canonical abbreviations and they're short enough to avoid truncation. Color-code each sparkline consistently with the sensor dot colors from the main panel (peach for PM, sunflower for CO₂, violet for VOC). Add a subtle color band under each sparkline matching its trace color so they're visually distinct even without reading labels.
- **Cross-ref**: GEORDI-003 (label truncation for WaterGuru pool chemical names — related but distinct: GEORDI-003 is about sensor label columns in environment panels; this bug is specifically about the sparkline tray header labels).

---

## WESLEY-UX-011 — Tactical/Alarm Panel Duplicated Across Every Room

- **Severity**: MEDIUM *(raised from LOW — full Tactical panels in 4–5 rooms occupies significant space for zero informational gain over a compact badge)*
- **Home**: Boimler
- **Room(s)**: Family Room, Front Foyer, and other rooms with Tactical panels
- **What's confusing**: The alarm system is a whole-house entity, but it renders a full Tactical panel (shield visualization, keypad, perimeter sensors, motion list) in multiple rooms. The user sees the same DISARMED state, the same keypad, the same shield graphic repeated room after room. This is redundant — the alarm state doesn't change per room.
- **Suggested UX improvement**: Show the full Tactical panel (shield + keypad + sensors) only in the primary security area (e.g., Front Foyer or wherever the physical keypad is). In other rooms, show a compact "SHIELDS" status badge in the room header: "DISARMED" in ice blue, "ARMED HOME" in butterscotch, "ARMED AWAY" in gold. Tapping the compact badge navigates to the full Tactical panel. This eliminates duplication while keeping the security state visible everywhere.
- **Cross-ref**: IDEA-010 (the solution — alarm state as compact room-level header badge).

---

## WESLEY-UX-012 — Weather UNAVAILABLE Shows Empty Panel With Red Frame

- **Severity**: MEDIUM
- **Home**: Boimler
- **Room(s)**: Outside (Grandbridge Tempest), Utility (WeatherFlow Hub)
- **What's confusing**: When the weather station goes offline, the panel shows a red frame and effectively empty content. The user sees "UNAVAILABLE" but gets no context: is the station dead? Is the WiFi down? Is this temporary? The red frame creates urgency for something that's probably just a temporary cloud service hiccup.
- **Suggested UX improvement**: Weather UNAVAILABLE should show:
  - Frame color: `--lcars-gray` (not red — weather outage isn't an emergency)
  - Main viewscreen area: "STATION OFFLINE" with a subtle static/noise animation
  - If last-known data is available, show it in gray text: "LAST READING: 72°F PARTLY CLOUDY — 2H AGO"
  - Recovery hint: "STATION MAY RECONNECT AUTOMATICALLY" in small gray text
  This follows the Trek aesthetic — a non-critical system offline shows as dimmed, not alarmed.
- **Cross-ref**: GEORDI-015 (the red frame color is Geordi's visual fix — gray frame when offline is a LCARS color-semantics violation). Wesley owns the last-known-data display and recovery messaging layer.

---

## WESLEY-UX-013 — No Confirmation or Undo for High-Impact Toggle Actions

- **Severity**: MEDIUM
- **Home**: Both
- **Room(s)**: Any room with lights, switches, locks, or climate controls
- **What's confusing**: Tapping a toggle in the dashboard immediately fires the HA service call — no confirmation, no undo. On a panel with many controls close together, accidental taps happen. Accidentally turning off a server room power strip, unlocking a door, or changing a climate setpoint are real-world consequences with no recovery path in the UI. The user has to manually reverse the action, often by hunting for the toggle they just scrolled past.
- **Suggested UX improvement**: Three-tier approach based on action risk:
  - **Low-risk toggles** (lights, non-security switches): Brief 4-second "UNDO" toast at bottom of viewport — "OFFICE LIGHT OFF — UNDO [button]". Tap undo calls the inverse service with the stored previous state. Toast auto-dismisses.
  - **Medium-risk actions** (climate setpoint changes, covers): Action confirmation inline — "THERMOSTAT SET TO 72°F — [UNDO]". No timer pressure.
  - **High-risk actions** (alarm arm/disarm, garage open/close): Explicit confirmation modal before execution: "CONFIRM: OPEN GARAGE DOOR? [CONFIRM] [CANCEL]". Do NOT auto-execute.
  - The undo state is ephemeral: a single `Map` in component memory holding `{entityId, previousState, serviceCall, timestamp}`. Cleared on room navigation or after the toast window expires.
- **Exclusions / Worf note**: Lock arm/disarm undo must NOT be a one-tap operation without re-authentication — Worf review required. A quick-undo on a lock unlock creates an accidental security bypass vector.

---

---

# SECTION 2: CREATIVE IDEAS

---

## WESLEY-IDEA-001 — Ambient Room Personality for Sparse Rooms

- **Priority**: SHOULD *(for Option B only — see note below)*
- **What it improves**: Empty/sparse rooms (Quinn's Room, Kitchen, Dining Room, Attic) that feel abandoned
- **Creative description**: Rooms with only 1-2 entities feel like uninhabited decks on a starship — functional but lifeless. Three options, ranked by UX value vs. aesthetic risk:
  - **Option B — Room vitals strip** *(primary UX win)*: A compact horizontal strip showing ambient room info pulled from the area: time since last motion detected, current temperature (if any sensor exists in the room or adjacent rooms), number of active devices. Makes the room feel "monitored" even with few controls. This is functional information from existing data — not decoration.
  - **Option A — Starfield background** *(aesthetic — Geordi decides)*: A very low-opacity (0.03–0.05) animated starfield or slowly drifting particle effect behind the content area. Pure CSS using multiple `radial-gradient` with `animation` — no JavaScript, no canvas. Bracer Jack says "empty space is beautiful" — this may be fighting the aesthetic rather than serving it. Flagged for Geordi as primary decision-maker.
  - **Option C — LCARS decorative border scan** *(aesthetic — Geordi decides)*: A subtle animated scan line traveling along the panel frame borders, like ambient console animations in TNG. Uses `linear-gradient` animated along a pseudo-element overlay. Also a Geordi call — scan lines on empty frames could look broken rather than intentional.
- **Technical feasibility**: All three options are pure CSS, no new dependencies. Option B requires reading entities from HA (already available). Options A and C should respect `prefers-reduced-motion`. Performance: negligible with CSS-only approach, but test on older tablets.
- **Flag**: Option B — no design gating needed (it’s data, not decoration). Options A and C — Geordi is the primary decision-maker here, not just a reviewer. Do not implement A or C without Geordi sign-off.

---

## WESLEY-IDEA-002 — "VIEWSCREEN STATIC" Effect for Offline Cameras

- **Priority**: SHOULD
- **What it improves**: Offline camera panels that currently show a dark void with small text
- **Creative description**: What if offline cameras showed CRT static — the way a dead viewscreen would look on an actual starship? This is a strong Trek visual metaphor.
  - A CSS TV static approximation using `background-image` with deterministic layered `linear-gradient` strips at different angles, combined with a `@keyframes` animation shifting `background-position` at different rates per layer. Important caveat: CSS animations are deterministic — true random noise requires JavaScript (`Math.random()` to regenerate gradients). The CSS approach produces a convincing *approximation* of static (repeating shimmer pattern) rather than actual frame-by-frame randomness, but it reads as static visually and is entirely GPU-driven. Overlay scanlines (repeating 2px stripes at low opacity) for the CRT feel.
  - Layer the "VIEWSCREEN OFFLINE" text on top with a subtle text flicker (opacity oscillation between 0.7 and 1.0 at 3-4s intervals).
  - When the camera reconnects, transition from static → live feed with a brief "ESTABLISHING LINK" phase (already implemented! Just needs the static-to-live transition to be more dramatic).
  - Performance: Pure CSS, `will-change: background-position` on the static element. Animation pauses when not in viewport using `IntersectionObserver` or `content-visibility: auto`.
- **Technical feasibility**: CSS-only static effects are well-documented and lightweight. The existing `data-state` attribute system (`offline` → `connecting` → `live`) already supports the state machine. Just needs CSS enhancements to the `[data-state="offline"]` selector. Widely available CSS features only — no experimental APIs needed.
- **Flag**: Geordi review for visual consistency with LCARS aesthetic — static/noise is "real world" not "LCARS" but it's an established Trek visual.

---

## WESLEY-IDEA-003 — Consolidated Media Hub for Multi-Speaker Rooms

- **Priority**: MUST
- **What it improves**: Rooms with 3+ media players all showing identical standby panels (Master Bedroom)
- **Creative description**: Instead of N separate media panels, render a single "COMM ARRAY" panel that acts as a media hub for the room:
  - **Idle state**: Compact rows showing each speaker name + state icon (play/pause/stop) + volume level. One row per speaker. Total height: ~3 rows instead of 3 full panels.
  - **Active state**: When any speaker starts playing, it "promotes" to the hero position — full album art viewscreen, waveform, transport controls. Other speakers stay as compact rows below.
  - **Group playback indicator**: If speakers are grouped (HA media_player groups), show a "LINKED" indicator connecting them visually — a thin line or shared color accent.
  - **Quick-transfer**: Tapping a compact idle speaker while another is playing could offer a "TRANSFER PLAYBACK" action — calls `media_player.join` under the hood.
- **Technical feasibility**: The media panel already has `_selectPrimary()` that picks the active player. Extending this to render secondaries as compact rows is straightforward. The `_partitionMediaEntities()` method already separates players. The main work is a new compact row render path and CSS for the collapsed state. No new HA APIs needed.
- **Flag**: Geordi review for compact row design that maintains LCARS typography standards.

---

## WESLEY-IDEA-004 — Contextual Empty States With LCARS Personality

- **Priority**: SHOULD
- **What it improves**: All empty/unavailable/error states across all panel types
- **Creative description**: Every panel type should have a unique, thematic empty state that maintains the Trek immersion instead of showing raw HA state strings:
  - **Camera offline**: "VIEWSCREEN OFFLINE — NO SIGNAL" + static effect (IDEA-002)
  - **Media standby**: "SUBSPACE CHANNEL CLEAR" + subtle pulse on comm frequency icon
  - **Climate unavailable**: "ENVIRONMENTAL CONTROLS OFFLINE" + thermostat icon dimmed
  - **Weather unavailable**: "LONG RANGE SENSORS OFFLINE — LAST SCAN: [time]"
  - **Power 0W**: "POWER GRID NOMINAL — ALL CIRCUITS STANDBY"
  - **Irrigation idle**: "HYDROPONICS BAY — CYCLE COMPLETE"
  - **Alarm disarmed**: "SHIELD ARRAY — STANDING DOWN" (in ice blue, not red!)
  - **Life Support sensors unavailable**: "ATMOSCRUBBER OFFLINE — MAINTENANCE REQUIRED"
  - **Generic empty panel**: "NO DATA ON FILE — STARDATE [current]"
  Each message uses Trek terminology appropriate to the panel's function. The messages are stored as constants in a shared module for easy customization and localization.
  - **Caution on flavor text accuracy**: Some messages need care — "HYDROPONICS BAY — CYCLE COMPLETE" for irrigation idle is wrong mid-season (a zone being idle doesn't mean a cycle is complete). "COMM CHANNEL CLEAR" for standby media is better Trek flavor than misleading status. Audit each message against the real-world state it represents before shipping. Trek personality ≠ wrong information.
- **Technical feasibility**: Pure string/template changes. Each panel's `renderContent()` method already has empty/error branches — just needs richer templates. The LCARS code suffix ("551-520") could be replaced with these messages. No new APIs or dependencies.
- **Cross-ref**: DATA-007 (camera panel needs relevance filter + contextual empty states — the camera empty state is both a content filter fix and an empty state design improvement).
- **Flag**: Geordi review for typography — these messages must fit within the three-size type system.

---

## WESLEY-IDEA-005 — Progressive Power Panel With Smart Collapse

- **Priority**: SHOULD
- **What it improves**: Power panels showing 0W full-size, and "Show All Circuits" pagination
- **Creative description**: The power panel should be energy-aware and progressively reveal detail based on activity:
  - **Standby mode** (0W total): Single-line "POWER SYSTEMS — STANDBY" in gray. No donut. No circuit list. Takes up one row.
  - **Low activity** (< 100W): Compact mode — small donut + top 3 active circuits only. No "Show All" button needed.
  - **Normal activity**: Current layout with donut + visible circuits.
  - **High activity** (> threshold): Donut gets a subtle pulse animation. Highest-draw circuit gets a `--lcars-butterscotch` highlight. This draws the eye to unusual consumption.
  - **"Show All Circuits" enhancement**: Replace with "EXPAND GRID — 12 MORE (340W)" showing count + aggregate. Animate the expansion with a smooth height transition.
- **Technical feasibility**: The panel already calculates total wattage for the donut. Adding threshold-based rendering modes is a simple conditional in `renderContent()`. CSS transitions handle the expand/collapse animation. The `--lcars-anim-breathe` token (4s) works for the high-activity pulse.
- **Flag**: Geordi review for collapse/expand animation compliance with LCARS transition standards.

---

## WESLEY-IDEA-006 — Garage Door Visual Position Indicator

- **Priority**: COULD
- **What it improves**: Garage door cover entities showing cryptic "0%" with no visual feedback
- **Creative description**: Replace the text-only garage door display with a minimal visual indicator:
  - A horizontal bar representing the door, split into "OPEN" zone (left, green/ice) and "CLOSED" zone (right, gray). A marker shows current position.
  - **Closed (0%)**: Bar fully gray, marker at right edge. Label: "SEALED".
  - **Open (100%)**: Bar fully ice-colored, marker at left edge. Label: "OPEN".
  - **Partial**: Bar filled proportionally, marker at position. Label: "35% OPEN".
  - **Moving**: Marker animates between positions with a `--lcars-transition-slow` ease. Add "OPENING..." or "CLOSING..." label during transition.
  - **Unknown**: Bar shows dashed outline in gray. Label: "STATUS UNKNOWN — CHECK SENSOR".
  - The action button changes contextually: "OPEN" when closed, "CLOSE" when open, "STOP" when moving.
- **Technical feasibility**: HA `cover` entities provide `current_position` (0-100) and `state` (open/closed/opening/closing). The visual is a simple `div` with `width: var(--position)%` inside a container. CSS transition handles the animation. The button label logic is a simple state switch. No new APIs needed.
- **Flag**: Geordi review for bar visual — should match LCARS light-bar aesthetic from the Illumination panel.

---

## WESLEY-IDEA-007 — Audio Waveform Personality Per Source Type

- **Priority**: WISH *(downgraded from COULD — see reliability note below)*
- **What it improves**: Media panel waveform bars that look identical regardless of content
- **Creative description**: The existing 12-bar audio waveform is a nice touch, but what if it reflected the *type* of media playing?
  - **Music** (media_content_type = music): Current bouncing bars — energetic, rhythmic.
  - **TV/Video** (media_content_type = tvshow/movie): Slower, flatter waveform — more like dialogue levels. Bars move gently.
  - **Podcast/Audiobook**: Single-bar voice level indicator — rises and falls like speech patterns.
  - **Radio/Streaming**: Add a subtle "tuning" sweep — a highlight that travels across the bars left-to-right periodically, like scanning frequencies.
  - The waveform color could also shift: music = `--lcars-african-violet`, TV = `--lcars-butterscotch`, podcast = `--lcars-ice`.
- **Technical feasibility**: `media_content_type` is available in `attrs`. The waveform is already CSS-animated bars with `--bar-dur` and `--bar-delay` custom properties. Changing these values based on content type is trivial — just different timing presets. Color changes are a single style binding. No performance impact beyond what already exists.
- **Flag**: Geordi review for color assignments — must not conflict with existing LCARS color semantics.
- **Reliability note**: `media_content_type` is not consistently populated across HA media_player integrations. Sonos, Google Cast, Apple TV, and many streaming services return `null`, `"music"`, or omit the field entirely regardless of what's actually playing. In practice this feature would fire correctly only for integrations that properly report content type (Plex, Jellyfin, some Spotify setups). The fallback (default "music" waveform) is acceptable but means the enhancement is invisible for many users. Defer until `media_content_type` coverage improves, or gate on a `supportedFeatures` check.

---

## WESLEY-IDEA-008 — "Last Activity" Timestamp for Idle Rooms

- **Priority**: COULD
- **What it improves**: Sparse rooms that feel abandoned (Quinn's Room, Attic)
- **Creative description**: For rooms with minimal activity, show a subtle "LAST ACTIVITY: 3H 24M AGO" timestamp in the room header area. This answers the question "is this room being used?" without requiring dedicated occupancy sensors.
  - Derived from the most recent `last_changed` timestamp across all entities in the room.
  - Displayed in `--lcars-gray` at `--lcars-font-size-label` size.
  - If activity was < 5 minutes ago: "OCCUPIED" in `--lcars-ice`
  - If 5 min – 1 hour: "LAST ACTIVITY: 23M AGO"
  - If 1 – 24 hours: "LAST ACTIVITY: 3H AGO"
  - If > 24 hours: "DORMANT — 2D 7H" in dim gray *(caution: "DORMANT" may read as alarming or clinical for rooms that are simply unused — spare rooms, seasonal areas, guest rooms. Consider "QUIET — 2D 7H" or "INACTIVE — 2D" as less loaded alternatives)*
  - This gives every room a sense of "life" even without explicit presence sensors.
- **Technical feasibility**: `last_changed` is available on every HA entity state object. Computing the most recent across a room's entities is a simple reduce. Time formatting is basic date math. Updates naturally when any entity in the room changes state. No new HA API calls needed.
- **Flag**: None — this is pure frontend logic using existing data.

---

## WESLEY-IDEA-009 — Smooth Panel Transitions When Navigating Rooms

- **Priority**: WISH
- **What it improves**: The jarring instant-swap when navigating between rooms
- **Creative description**: When the user navigates from one room to another, the panels currently just appear/disappear instantly. What if we used the **View Transitions API** to create smooth LCARS-style transitions?
  - **Room-to-room**: Current room panels fade out with a slight downward shift while new room panels fade in from slight upward shift. The room title cross-fades. Total duration: 300ms.
  - **Panel expand/collapse**: When a panel expands (e.g., "Show All Circuits"), use `view-transition-name` on the panel container to animate the height change smoothly.
  - **View Transition types**: Use typed transitions — `slide-left` for forward navigation, `slide-right` for back — giving directional context to the user.
  - **Fallback**: Wrap in `if (document.startViewTransition)` — graceful degradation to instant swap on unsupported browsers. HA typically runs on Chrome/Chromium (companion app), so support is excellent.
- **Technical feasibility**: The View Transitions API is now in Chrome 111+, Edge 111+, Safari 18+, Firefox 144+. Since HA runs primarily on Chromium (companion app) and modern browsers, this is broadly viable. However, this runs inside a Lovelace card's shadow DOM — need to verify that `document.startViewTransition()` works correctly with shadow DOM boundaries.
  **Shadow DOM limitation**: LCARS panels live inside a Web Component shadow root. Same-document View Transitions snapshot visible elements at the light DOM level. Elements inside shadow roots do not participate as individual `view-transition-name` targets from the document's perspective — the entire card renders as a single snapshot unit (old card out, new card in), not individual animated panels. This is still a useful page-level transition but is less granular than individual panel animations. Cross-document transitions don't apply here since room navigation doesn't change the page URL. **This needs a working prototype before committing** — validate shadow DOM snapshotting behavior in HA's actual Lovelace environment.
  This is a **v5.x candidate** given the architectural implications.
- **Flag**: Geordi review for animation timing — must comply with LCARS transition tokens. Worf review — View Transitions API doesn't introduce any security concerns (it's purely visual, no network/API access), but verify no CSP conflicts with HA's Content Security Policy.

---

## WESLEY-IDEA-010 — Alarm State as Room-Level Header Badge

- **Priority**: SHOULD
- **What it improves**: Redundant full Tactical panels duplicated across rooms
- **Creative description**: Instead of rendering a full shield visualization + keypad + sensor list in every room, show the alarm state as a compact badge in the room header:
  - **Badge format**: Small shield icon + "DISARMED" / "ARMED HOME" / "ARMED AWAY" / "TRIGGERED"
  - **Color mapping**: DISARMED = `--lcars-ice`, ARMED HOME = `--lcars-butterscotch`, ARMED AWAY = `--lcars-gold`, TRIGGERED = `--lcars-tomato` with pulse
  - **Interaction**: Tapping the badge navigates to the primary Tactical panel room (or opens a modal/flyout with the keypad)
  - **Full panel**: Only rendered in the designated security room (Front Foyer, Entry, etc.)
  - This eliminates 4-5 duplicate full panels while keeping security state visible everywhere. Matches how the Enterprise bridge shows shield status on every console, but the tactical station has the full controls.
- **Technical feasibility**: The alarm state is a single `alarm_control_panel` entity — already available globally. Rendering a badge is minimal DOM. The navigation/flyout interaction needs the room-navigation system that already exists. The main decision is whether this is a header-level feature (in `lcars-homepage-card.js`) or a compact panel variant.
- **Flag**: Geordi review for badge placement in room header — must fit LCARS layout grid. Worf review — the compact badge still shows security state, ensure it's not clickable for arm/disarm without the keypad (no accidental state changes).

---

## WESLEY-IDEA-011 — Smart Sensor Grouping to Reduce Information Overload

- **Priority**: MUST
- **What it improves**: Camera panels dumping 20+ diagnostic sensors, Nest Protect showing test results
- **Creative description**: Panels showing device sensors should use tiered disclosure:
  - **Tier 1 — Hero metrics** (always visible): The 2-3 most important readings for this device type. Camera: motion status, recording state. Nest Protect: smoke/CO status. Fan: speed, power.
  - **Tier 2 — Operational** (visible on tap/expand): Secondary readings relevant to daily use. Camera: storage remaining, network signal. Nest Protect: battery level, last test date.
  - **Tier 3 — Diagnostic** (hidden by default, available in detail view): Everything else. Camera: disk write speed, overlay settings, firmware. Nest Protect: buzzer test result, PIR test, WiFi test, speaker test.
  - Each tier is a collapsible section with an LCARS divider line (already in the gallery: `section-divider` pattern). The panel starts with Tier 1 visible, and the user can expand to see more.
  - The `entity_category` attribute from HA maps naturally: no category = Tier 1, `config` = Tier 2, `diagnostic` = Tier 3.
- **Technical feasibility**: `entity_category` is already available on HA entity registry entries. The base panel's `_partitionDeviceEntities()` already receives entity objects with this data. Filtering by category is a simple `.filter()`. The collapsible section UI pattern exists in the Illumination panel (Scenes/Circuits sections with dividers). Main work: define per-panel-type Tier 1 metrics, implement the collapse/expand interaction.
- **Flag**: Geordi review for collapsible section styling and the divider treatment.

---

## WESLEY-IDEA-012 — Pool Equipment Circuit Disambiguation

- **Priority**: SHOULD
- **What it improves**: Boimler's Pool panel showing 8 circuits all named "POOL EQUIPMENT"
- **Creative description**: When multiple circuits share the same friendly name, the power panel should automatically disambiguate:
  - **Step 1**: Append entity_id suffix as a numeric identifier: "POOL EQUIPMENT 1", "POOL EQUIPMENT 2", etc.
  - **Step 2**: If the entity has a `device_class` or known pattern in the entity_id (e.g., `pool_pump`, `pool_heater`, `pool_cleaner`, `spa_blower`), use that as the label instead: "PUMP", "HEATER", "CLEANER", "SPA BLOWER".
  - **Step 3**: For Pentair ScreenLogic specifically, parse the circuit number from the entity_id and show "CIRCUIT 1", "CIRCUIT 2", etc. as the fallback — better than 8 identical names.
  - Color-code circuits by wattage tier: 0W = gray, <100W = ice, 100-500W = sunflower, >500W = butterscotch. This provides instant visual differentiation even if names are similar.
- **Technical feasibility**: Entity IDs are always unique — extracting suffixes is simple string parsing. ScreenLogic entities follow predictable naming patterns. The color-coding based on wattage is just a style binding on existing values. No new APIs or data sources needed.
- **Flag**: None — this is a naming/display logic improvement.
- **Cross-ref**: DATA-009 (same root cause — Data owns the Emporia Vue prefix stripping and "POOL EQUIPMENT" deduplication fix. Wesley's value-add is the wattage-tier color-coding, which is additive to Data's naming fix and provides instant visual differentiation even between circuits with identical or still-similar names).

---

## WESLEY-IDEA-013 — LCARS Boot Sequence Animation on Dashboard Load

- **Priority**: WISH
- **What it improves**: Dashboard initial load experience — currently shows a loading spinner or blank
- **Creative description**: When the LCARS dashboard first loads (cold start or page refresh), show a brief LCARS boot sequence animation:
  - **Phase 1** (0-500ms): Black screen with small LCARS logo/wordmark fading in at center
  - **Phase 2** (500-1200ms): Frame elements (elbows, header bars, sidebar) draw in from their anchor points — like the console powering up
  - **Phase 3** (1200-1800ms): Content panels fade in with a staggered delay (`--lcars-anim-stagger: 50ms` per panel)
  - **Phase 4**: Normal interactive state
  - Total: ~2 seconds. Only plays on cold load, not on room-to-room navigation.
  - Respects `prefers-reduced-motion` — skip to Phase 4 immediately.
  - Stores a session flag so the boot sequence only plays once per browser session.
- **Technical feasibility**: CSS `@keyframes` with `animation-delay` for staggering. The elbow/bar draw-in can use `clip-path` animation or `transform: scaleX()`. Content stagger uses the existing `--lcars-anim-stagger` token. `sessionStorage` flag prevents replay. Performance: all compositor-friendly properties (`opacity`, `transform`), no layout thrashing.
  **Shadow DOM timing note**: The boot sequence runs inside a Lovelace card Web Component. The card must be fully upgraded and attached to the DOM before the animation starts — if fired too early, the shell elements don't exist yet. The safest hook is `firstUpdated()` in the card's LitElement lifecycle, with `sessionStorage` gating. Coordinate with HA's own loading overlay to avoid the boot sequence playing underneath HA's spinner.
- **Flag**: Geordi review for animation timing compliance. Performance testing on low-end tablets (Fire HD, older iPads) — the boot sequence must not delay time-to-interactive.

---

## WESLEY-IDEA-014 — Climate Arc Range Adaptation for Legitimate HVAC Edge Cases

- **Priority**: COULD *(downgraded from SHOULD — reframed; see below)*
- **What it improves**: Climate arcs that show incorrect visual ranges for HVAC units with non-standard min/max temperatures (e.g., commercial coolers, wine fridges managed as HVAC, radiant floor heating with 45°F setpoints)
- **Reframe note**: This was previously described as a workaround for DATA-004/DATA-005 (GE fridges and pool climate showing in Life Support). That framing was wrong — once Data fixes the entity routing, those devices won't render climate arcs at all. This idea stands independently as an improvement for **legitimate climate entities** whose `min_temp`/`max_temp` attributes fall outside the current hardcoded 55°F–84°F comfort arc range.
- **Creative description**: The climate arc should respect the entity's declared temperature range via `min_temp`/`max_temp` attributes rather than hardcoded HVAC comfort defaults:
  - **HVAC range** (default, 55°F–84°F): Current behavior, unchanged for standard thermostats
  - **Auto-range detection**: If `min_temp < 50°F` or `max_temp > 90°F`, use `min_temp`/`max_temp` directly as arc bounds. The arc automatically accommodates wine coolers (45°F–65°F), radiant floor systems (60°F–95°F), etc.
  - **Color gradient**: `getTempColor()` should accept a `[min, max]` range parameter and normalize to that range rather than hardcoded comfort points. Cold setpoints get cool blues, warm setpoints get warm oranges — relative to the entity's own range.
  - **Pool range**: 50°F–104°F with "too cold/comfortable/too hot" swim-comfort markers (separate from this ticket, but same mechanism).
- **Technical feasibility**: The climate entity's `min_temp`/`max_temp` attributes define the valid range and are already available. The arc `_getArcPath()` already accepts min/max parameters. The main work is passing entity-declared range to `getTempColor()` and `_getArcPath()` instead of constants. Moderate, focused refactor isolated to `lcars-climate-panel.js`.
- **Flag**: Geordi review for color gradient changes — `getTempColor()` range normalization must be validated against the gallery's temperature display examples.

---

## WESLEY-IDEA-015 — Haptic Feedback on Mobile for Toggle Actions

- **Priority**: COULD
- **What it improves**: Toggle interactions (lights, switches, locks) feeling "flat" on mobile
- **Creative description**: When users toggle a light, lock, or switch on mobile, add haptic feedback via the **Vibration API** for tactile confirmation:
  - **Toggle ON**: Short single pulse (50ms)
  - **Toggle OFF**: Two quick pulses (30ms, 30ms gap, 30ms)
  - **Alarm arm/disarm**: Longer confirming pulse (100ms)
  - **Error/failed action**: Three rapid pulses (SOS-like pattern)
  - This makes the dashboard feel more like a physical control panel — you *feel* the button press.
- **Technical feasibility**: `navigator.vibrate()` is Baseline "widely available" — supported in Chrome, Edge, Firefox, Samsung Internet. **Not supported in Safari/iOS** — needs `if ('vibrate' in navigator)` guard. The HA companion app on Android supports it. iOS users get no vibration (Apple policy).
  **Companion app compatibility note**: The HA companion app for Android wraps a Chromium WebView which supports `navigator.vibrate()`. However, the companion app also has its own haptic feedback system for HA actions. Calling both simultaneously may double-vibrate or conflict. Test in the companion app specifically — if the companion app already fires haptics on HA service calls, this is redundant for companion users and only adds value in browser/kiosk scenarios. **iPad / iOS**: Apple blocks `navigator.vibrate()` entirely — no effect on iPhone or iPad, which are among the most common LCARS dashboard devices. Design the feature as a progressive enhancement, not a dependency.
  Performance: zero impact — single API call on click handler. Privacy: Vibration API has no permissions gate but is limited to user-gesture contexts (already the case for button clicks).
- **Flag**: Worf review — Vibration API is fingerprinting-neutral in click context, but verify it doesn't conflict with HA companion app's own haptic settings.

---

## WESLEY-IDEA-016 — Sensor Trend Micro-Indicators (Up/Down/Stable)

- **Priority**: COULD
- **What it improves**: Sensor readings that show current value but no direction of change
- **Creative description**: Next to each sensor value, show a tiny trend indicator based on recent history:
  - **Rising**: Small upward arrow `↑` in the sensor's color
  - **Falling**: Small downward arrow `↓`
  - **Stable**: Small horizontal dash `—` in gray
  - **Rapid change**: Arrow pulses if the rate of change exceeds a threshold (e.g., temperature rising > 2°F/hour)
  - Derived from the sparkline data that's already being fetched for the Life Support panel — just needs to be surfaced at the individual sensor level.
  - Example: "72°F ↑" tells you the room is warming. "72°F —" tells you it's stable. Huge informational upgrade for a tiny visual addition.
- **Technical feasibility**: The `_sparklineData` map already contains historical values per entity. Computing trend direction is: compare last value to value 30 min ago. If delta > threshold → rising, delta < -threshold → falling, else → stable. The arrow is a single Unicode character or tiny SVG appended to the value. No new API calls — piggybacks on existing sparkline data fetching.
  **Scope limitation**: `_sparklineData` is only fetched in Life Support panels (atmoscrubber/environment context). Sensor rows in Camera, Device, Galley, Power, and Battery panels have no historical data available. Extending trend indicators to those panel types would require a separate lightweight history fetch per entity — adding API cost and per-entity latency. Recommend Phase 1 limited to Life Support panels where sparkline data is already present; Phase 2 (other panels) is a separate decision.
- **Flag**: Geordi review for where the arrow sits relative to the value — must not break the LCARS type grid.

---

## WESLEY-IDEA-017 — Universal "LAST ACTIVE" Timestamp for All Unavailable States

- **Priority**: SHOULD
- **What it improves**: Every panel showing UNAVAILABLE/OFFLINE with no temporal context — currently the "last signal" pattern is only proposed for cameras (UX-005) and weather (UX-012), leaving dozens of other device types without this information
- **Creative description**: Generalize the "LAST SIGNAL" pattern into a universal base panel behavior: whenever any panel renders a full-UNAVAILABLE state, derive the most recent `last_changed` timestamp from the panel's entities and surface it as context below the primary offline indicator.
  - Display format: "LAST ACTIVE: 2H 14M AGO" in `--lcars-gray` at `--lcars-font-size-label` size
  - Recency tiers:
    - < 5 min: Suppress — device is likely transient/rebooting; showing stale data would be misleading
    - 5 min – 1 hour: "LAST ACTIVE: 23M AGO" — worth showing; may need attention
    - 1 – 24 hours: "LAST ACTIVE: 3H AGO"
    - > 24 hours: "LAST ACTIVE: 2D 7H AGO" — almost certainly a real problem worth investigating
  - Apply to: camera panels (supersedes/implements UX-005), weather panels (supersedes/implements UX-012), climate panels (unavailable HVAC), battery panels (offline battery devices), device panels (offline hubs/switches)
  - Do NOT apply to: individual sensor rows within a panel (too noisy) — panel-level only. Do NOT apply when the panel has a mix of available and unavailable entities — only when the entire panel's primary devices are unavailable.
- **Technical feasibility**: `last_changed` is available on every HA entity state object in `this.hass.states`. A `_getLastActive(entities)` helper in `lcars-base-panel.js` computes `Math.max(...entities.map(e => new Date(hass.states[e.entity_id]?.last_changed)))`. Relative time formatting (date math) is straightforward and already proposed in IDEA-008 for room headers — share the utility. The base panel's offline/unavailable render branch is the natural hook point. No new HA API calls needed.
- **Flag**: Geordi review for placement within the UNAVAILABLE state rendering — timestamp must sit below the primary offline label without displacing it or crowding the panel frame.
