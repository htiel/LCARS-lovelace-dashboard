# LCARS Audio Grammar Specification

**Version**: 1.1  
**Date**: 2026-04-22  
**Target**: Web Audio API synthesis for LCARS Dashboard (Home Assistant Lovelace)  
**Shipped**: v4.23.0  
**References**:  
- Michael Okuda / Gene Roddenberry — original LCARS design philosophy (minimalist, futuristic)  
- Star Trek: The Next Generation Technical Manual (Sternbach & Okuda, 1991)  
- lcars.org.uk (Adge Cutler) — LCARS visual and technical reference  
- TheLCARS.com (Jim Robertus) — canonical LCARS web template  
- LCARS-UI-ARCHITECTURE.md §8 — Audio Grammar table  

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Sound Categories](#2-sound-categories)
3. [Tone Specifications](#3-tone-specifications)
4. [Mute Control](#4-mute-control)
5. [Accessibility](#5-accessibility)
6. [Implementation Architecture](#6-implementation-architecture)
7. [Integration Points](#7-integration-points)

---

## 1. Design Philosophy

LCARS audio follows the same principles as LCARS visual design:

- **Clean and minimal** — Short, precise tones. No reverb, no layering, no flourishes.
- **Functionally distinct** — Each sound has exactly one semantic meaning. Users learn the "language" of the interface through auditory feedback.
- **Non-intrusive** — Sounds are brief (50–300ms). They confirm actions without demanding attention.
- **Synthesized, not sampled** — All sounds are generated at runtime via Web Audio API `OscillatorNode`. Zero external audio files. Zero copyright concerns.
- **Consistent with the era** — TNG/DS9/VOY-era LCARS used clean sine and triangle wave tones in the 300–900Hz range. Our synthesized sounds match this aesthetic.

> **Legal note**: These are 100% original synthesized tones. They are inspired by the general aesthetic of futuristic computer interface sounds but contain no sampled, recorded, or copied audio from any Star Trek production.

---

## 2. Sound Categories

| Category | Purpose | When Played |
|----------|---------|-------------|
| **Acknowledge** | Confirms a button press was received | Any button/control tap or click |
| **Nav Acknowledge** | Confirms a navigation/view change | Sidebar area button, floor button, nav button clicks |
| **Negative Acknowledge** | Indicates an action was denied | Disabled button tap, unauthorized action |
| **Alert** | Draws attention to a warning | Error toast, HA warning notification |
| **Critical Alert** | Urgent system-level warning | HA system failure, red-alert conditions |
| **Ready** | System initialization complete | Dashboard first load after connection |
| **Toggle** | State change confirmation | Mute toggle, edit mode toggle |

### Domain-Specific Interaction Sounds

| Category | Purpose | When Played |
|----------|---------|-------------|
| **Light Toggle** | Warm "glow on" confirmation | `light.*` entity toggle |
| **Switch Toggle** | Crisp mechanical click | `switch.*`, `input_boolean.*` toggle |
| **Fan Toggle** | Breathy whoosh-like sweep | `fan.*` entity toggle |
| **Lock Toggle** | Authoritative deliberate tone | `lock.*` entity lock/unlock |
| **Cover Action** | Mechanical motion sweep | `cover.*` open/close/stop |
| **Climate Adjust** | Soft setpoint tick | Climate/number setpoint ± buttons |
| **Script Fire** | Quick double-chirp | `script.*`, `automation.*` execution |
| **Entity Info** | Subtle low info tone | Sensor/entity more-info dialog open |
| **Media Action** | Warm ascending sweep | `media_player.*` transport controls (play/pause/next/prev) |

---

## 3. Tone Specifications

All tones use the Web Audio API `OscillatorNode` → `GainNode` → `AudioContext.destination` chain.

### 3.1 Acknowledge (`acknowledge`)

The primary interaction sound. Quick, clean, satisfying.

| Parameter | Value |
|-----------|-------|
| Waveform | `sine` |
| Frequency | 880 Hz |
| Duration | 60 ms |
| Envelope | Attack: 5ms, Sustain: 35ms, Decay: 20ms |
| Volume | 0.15 |

### 3.2 Navigation Acknowledge (`navAcknowledge`)

Two-tone ascending chirp. Signals successful navigation/view transition.

| Parameter | Value |
|-----------|-------|
| Waveform | `sine` |
| Tone 1 | 440 Hz × 60ms |
| Gap | 20ms silence |
| Tone 2 | 660 Hz × 60ms |
| Total Duration | 140 ms |
| Volume | 0.12 |

### 3.3 Negative Acknowledge (`negativeAcknowledge`)

Descending tone. Communicates "that action is not available."

| Parameter | Value |
|-----------|-------|
| Waveform | `triangle` |
| Tone 1 | 660 Hz × 80ms |
| Gap | 20ms silence |
| Tone 2 | 330 Hz × 100ms |
| Total Duration | 200 ms |
| Volume | 0.12 |

### 3.4 Alert (`alert`)

Triple-pulse warning. Grabs attention without panic.

| Parameter | Value |
|-----------|-------|
| Waveform | `sawtooth` |
| Frequency | 880 Hz |
| Pulse count | 3 |
| Pulse duration | 60ms on, 40ms off |
| Total Duration | 260 ms |
| Volume | 0.10 |

### 3.5 Critical Alert (`criticalAlert`)

Urgent two-tone alternating pulse. The closest to a "red alert" tone.

| Parameter | Value |
|-----------|-------|
| Waveform | `square` |
| Tone A | 440 Hz × 150ms |
| Tone B | 880 Hz × 150ms |
| Alternations | 3 (A-B-A-B-A-B) |
| Total Duration | 900 ms |
| Volume | 0.15 |

### 3.6 Ready (`ready`)

Ascending triad. Signals the system is online and responsive.

| Parameter | Value |
|-----------|-------|
| Waveform | `sine` |
| Tone 1 | 330 Hz × 80ms |
| Gap | 30ms |
| Tone 2 | 440 Hz × 80ms |
| Gap | 30ms |
| Tone 3 | 660 Hz × 120ms |
| Total Duration | 340 ms |
| Volume | 0.10 |

### 3.7 Toggle (`toggle`)

Quick ascending sweep. Confirms a state change (mute on/off, edit mode).

| Parameter | Value |
|-----------|-------|
| Waveform | `sine` |
| Frequency sweep | 550 Hz → 770 Hz (linear ramp) |
| Duration | 80 ms |
| Volume | 0.12 |

### 3.8 Light Toggle (`lightToggle`)

Warm ascending sweep. Evokes the "glow" of a light coming on.

| Parameter | Value |
|-----------|-------|
| Waveform | `sine` |
| Frequency sweep | 600 Hz → 800 Hz |
| Duration | 100 ms |
| Volume | 0.12 |

### 3.9 Switch Toggle (`switchToggle`)

Crisp mechanical tick. Evokes a physical relay clicking.

| Parameter | Value |
|-----------|-------|
| Waveform | `triangle` |
| Frequency | 960 Hz |
| Duration | 40 ms |
| Volume | 0.14 |

### 3.10 Fan Toggle (`fanToggle`)

Breathy sweep. Evokes airflow.

| Parameter | Value |
|-----------|-------|
| Waveform | `sine` |
| Frequency sweep | 300 Hz → 500 Hz |
| Duration | 120 ms |
| Volume | 0.10 |

### 3.11 Lock Toggle (`lockToggle`)

Authoritative two-tone. Deliberate and weighty — locks are serious.

| Parameter | Value |
|-----------|-------|
| Waveform | `square` |
| Tone 1 | 440 Hz × 80ms |
| Tone 2 | 660 Hz × 60ms |
| Total Duration | 160 ms |
| Volume | 0.10 |

### 3.12 Cover Action (`coverAction`)

Descending sweep. Evokes mechanical motion (blinds/shutters moving).

| Parameter | Value |
|-----------|-------|
| Waveform | `triangle` |
| Frequency sweep | 400 Hz → 250 Hz |
| Duration | 140 ms |
| Volume | 0.10 |

### 3.13 Climate Adjust (`climateAdjust`)

Soft tick. Subtle confirmation of setpoint increment/decrement.

| Parameter | Value |
|-----------|-------|
| Waveform | `sine` |
| Frequency | 550 Hz |
| Duration | 50 ms |
| Volume | 0.08 |

### 3.14 Script Fire (`scriptFire`)

Quick ascending double-chirp. Communicates "action dispatched."

| Parameter | Value |
|-----------|-------|
| Waveform | `sine` |
| Tone 1 | 770 Hz × 40ms |
| Tone 2 | 990 Hz × 40ms |
| Total Duration | 100 ms |
| Volume | 0.12 |

### 3.15 Entity Info (`entityInfo`)

Subtle low info tone. Signals "detail view opening."

| Parameter | Value |
|-----------|-------|
| Waveform | `sine` |
| Frequency | 330 Hz |
| Duration | 60 ms |
| Volume | 0.08 |

### 3.16 Media Action (`mediaAction`)

Warm ascending sweep for media transport controls.

| Parameter | Value |
|-----------|-------|
| Waveform | `sine` |
| Frequency sweep | 440 Hz → 550 Hz |
| Duration | 80 ms |
| Volume | 0.12 |

---

## 3.A Domain → Sound Mapping

The `playForEntity(entityId)` helper automatically selects the correct sound:

| Entity Domain | Sound Name |
|---------------|------------|
| `light` | `lightToggle` |
| `switch` | `switchToggle` |
| `fan` | `fanToggle` |
| `input_boolean` | `switchToggle` |
| `lock` | `lockToggle` |
| `script` | `scriptFire` |
| `automation` | `scriptFire` |
| `cover` | `coverAction` |
| `climate` | `climateAdjust` |
| `number` | `climateAdjust` |
| `sensor` | `entityInfo` |
| `binary_sensor` | `entityInfo` |
| `humidifier` | `fanToggle` |
| `media_player` | `mediaAction` |
| `camera` | `entityInfo` |
| *(unknown)* | `acknowledge` |

---

## 4. Mute Control

### 4.1 UI Placement

A mute toggle button in the **header endcap**, adjacent to the existing configure button (gear icon).

- **Icon (unmuted)**: `mdi:volume-high`
- **Icon (muted)**: `mdi:volume-off`
- **Style**: Same as `.configure-btn` — black icon on header bar background, no chrome
- **ARIA**: `role="switch"`, `aria-checked`, `aria-label="Dashboard sounds"`

### 4.2 Persistence

Mute state stored in `localStorage` under key `lcars-audio-muted`.

- Default: **unmuted** (`false`)
- Persists across sessions, page reloads, and browser restarts
- No HA entity dependency (pure client-side)

### 4.3 Behavior

- When muted: All sounds suppressed. No `AudioContext` created.
- When unmuted: `AudioContext` created lazily on first user gesture (browser autoplay policy compliant).
- Toggling mute plays the `toggle` sound (if unmuting) as confirmation.

### 4.4 Mute State Change Event

When `mute()` / `unmute()` / `toggle()` is called, `lcars-audio.js` dispatches a `CustomEvent` on `window` so other components can react in lockstep without polling `localStorage`:

- **Event name**: `lcars-audio-mute-changed`
- **Detail**: `{ muted: boolean }` — the new state
- **Target**: `window`
- **Bubbles**: false

Consumers (e.g. Medical Bay PHI redaction, Starship Health screenshot guard) listen for this event to flip `aria-hidden` / data-attribute redaction in step with the header mute button. The event is fault-tolerant: if `window.dispatchEvent` throws (SSR/test envs), it is silently swallowed.

---

## 5. Accessibility

| Requirement | Implementation |
|-------------|----------------|
| `prefers-reduced-motion` | When active, suppress all non-critical sounds (keep only `alert` and `criticalAlert`) |
| Screen reader | Mute button has `aria-label` and `role="switch"` with `aria-checked` |
| No audio-only information | Sounds are supplemental — every sound-accompanied action also has visual feedback |
| Volume | All tones at 0.10–0.15 gain (soft, not jarring) |
| Duration | No sound exceeds 1 second |

---

## 6. Implementation Architecture

### 6.1 File: `lcars-audio.js`

A standalone utility module with no DOM dependencies. Exports:

```
lcarsAudio.play(soundName)       — Play a named sound (no-op if muted)
lcarsAudio.playForEntity(entityId) — Play domain-appropriate sound for an entity
lcarsAudio.mute()                — Mute and persist
lcarsAudio.unmute()              — Unmute and persist
lcarsAudio.toggle()              — Toggle mute state
lcarsAudio.isMuted               — Current mute state (getter)
```

### 6.2 AudioContext Lifecycle

- **Created lazily** on first `play()` call after a user gesture
- **Suspended** when tab hidden (`visibilitychange`)
- **Resumed** when tab visible again
- **Never auto-created** — compliant with Chrome/Safari autoplay policy
- **GainNode cleanup** — `osc.onended` callback disconnects GainNode to prevent AudioContext node leaks

### 6.3 Bundle Impact

- Zero external dependencies
- Estimated addition: ~2–3 KB minified (pure Web Audio API synthesis)
- No audio files to load, cache, or serve

---

## 7. Integration Points

### Layout (lcars-dashboard-layout.js)

| Location | Sound | Trigger |
|----------|-------|---------|
| Sidebar area buttons | `navAcknowledge` | `@click` on `.sidebar-area-btn` |
| Sidebar floor buttons | `navAcknowledge` | `@click` on `.sidebar-floor-btn` |
| Sidebar nav slot buttons | `navAcknowledge` | Event bus `lcars-nav-click` |
| Configure button | `toggle` | `@click` on `.configure-btn` |
| Mute button | `toggle` | `@click` on `.mute-btn` (plays only on unmute) |
| Header title edit | `acknowledge` | `@click` on `.lcars-header-title` (edit mode) |
| Elbow long-press | `toggle` | Edit mode toggle via elbow |
| Error notifications | `alert` | `lcars-notification` event with severity ≥ warning |
| Dashboard ready | `ready` | First area selection after load (`_readyPlayed` flag) |
| Disabled button | `negativeAcknowledge` | Click on `[disabled]` or `[data-locked]` element |
| Unavailable entity toggle | `negativeAcknowledge` | Toggle on entity with state `unavailable` |

### Entity Interactions (via `playForEntity`)

| Location | Sound | Trigger |
|----------|-------|---------|
| Homepage `_handleToggle()` | domain-mapped | Any entity toggle (light/switch/fan/lock/etc.) |
| Base panel `_handleToggle()` | domain-mapped | Panel-level entity toggles |
| Homepage `_handleEntityClick()` | domain-mapped | Sensor/entity more-info click |
| Tactical `_toggleLock()` | `lockToggle` | Lock/unlock (confirm-gated) |
| Tactical `_toggleCover()` | `coverAction` | Cover open/close/stop (confirm-gated) |
| Viewport cover controls | `coverAction` | Blind/shade open/close/stop buttons |
| Climate setpoint ± | `climateAdjust` | Thermostat temperature adjust |

### Panel-Specific Audio (v4.23.0)

| Panel | Sound | Trigger |
|-------|-------|---------|
| Illumination | `lightToggle` | `_setEffect`, `_clearEffect`, `_setColor` |
| Illumination | `climateAdjust` | `_setBrightness` |
| EV Charger | `switchToggle` | `_setSolarMode` |
| EV Charger | `climateAdjust` | `_adjustCurrent` |
| EV Charger | `lockToggle` | `_toggleLock` |
| Alarm | `acknowledge` | `_handleAlarmPinDigit` |
| Alarm | `lockToggle` | `_handleAlarmArm`, `_handleAlarmDisarm` |
| Alarm | `criticalAlert` | State transition to `triggered` |
| Alarm | `alert` | State transition to `arming`/`pending` |
| Irrigation | `switchToggle` | `_handleIrrigationZone`, `_handleIrrigationToggle` |
| Irrigation | `acknowledge` | `_handlePause`, `_handleResume`, `_handleStopAll` |
| Irrigation | `scriptFire` | `_handleQuickRun` |
| Media | `mediaAction` | `_handleMediaService` |
| Media | `climateAdjust` | `_handleVolumeChange` |
| Battery | `switchToggle` | Sort option change |
| Camera | `entityInfo` | Disclosure toggle |

---

## Attribution

These sounds are original works, synthesized at runtime using the Web Audio API.  
Sound design inspired by the general aesthetic of futuristic computer interfaces.  
LCARS visual design by Michael Okuda. LCARS reference: lcars.org.uk (Adge Cutler), TheLCARS.com (Jim Robertus).
