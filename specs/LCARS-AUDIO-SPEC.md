# LCARS Audio Grammar Specification

**Version**: 1.0  
**Date**: 2026-04-22  
**Target**: Web Audio API synthesis for LCARS Dashboard (Home Assistant Lovelace)  
**Author**: Geordi La Forge (LCARS Design Authority)  
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

---

## 4. Mute Control

### 4.1 UI Placement

A mute toggle button in the **header endcap**, adjacent to the existing configure button (gear icon).

- **Icon (unmuted)**: `mdi:volume-high`
- **Icon (muted)**: `mdi:volume-off`
- **Style**: Same as `.configure-btn` — black icon on header bar background, no chrome
- **ARIA**: `role="switch"`, `aria-checked`, `aria-label="Toggle dashboard sounds"`

### 4.2 Persistence

Mute state stored in `localStorage` under key `lcars-audio-muted`.

- Default: **unmuted** (`false`)
- Persists across sessions, page reloads, and browser restarts
- No HA entity dependency (pure client-side)

### 4.3 Behavior

- When muted: All sounds suppressed. No `AudioContext` created.
- When unmuted: `AudioContext` created lazily on first user gesture (browser autoplay policy compliant).
- Toggling mute plays the `toggle` sound (if unmuting) as confirmation.

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
lcarsAudio.play(soundName)    — Play a named sound (no-op if muted)
lcarsAudio.mute()             — Mute and persist
lcarsAudio.unmute()           — Unmute and persist
lcarsAudio.toggle()           — Toggle mute state
lcarsAudio.isMuted            — Current mute state (getter)
```

### 6.2 AudioContext Lifecycle

- **Created lazily** on first `play()` call after a user gesture
- **Suspended** when tab hidden (`visibilitychange`)
- **Resumed** when tab visible again
- **Never auto-created** — compliant with Chrome/Safari autoplay policy

### 6.3 Bundle Impact

- Zero external dependencies
- Estimated addition: ~2–3 KB minified (pure Web Audio API synthesis)
- No audio files to load, cache, or serve

---

## 7. Integration Points

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
| Dashboard ready | `ready` | `firstUpdated()` lifecycle (one-time) |
| Disabled button | `negativeAcknowledge` | Click on `[disabled]` or `[data-locked]` element |

---

## Attribution

These sounds are original works, synthesized at runtime using the Web Audio API.  
Sound design inspired by the general aesthetic of futuristic computer interfaces.  
LCARS visual design by Michael Okuda. LCARS reference: lcars.org.uk (Adge Cutler), TheLCARS.com (Jim Robertus).
