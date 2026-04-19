## 2. Web API Integrations

### 2.1 Popover API — Circuit Detail Popovers

**Baseline Status**: Newly Available (January 2025)  
**Browser Support**: Chrome 116+, Edge 116+, Firefox 125+, Safari 17+, Safari iOS 18.3+

This is the **highest-impact Web API addition** for the power panel. The problem: with 43+ circuits, tapping one currently fires `showMoreInfo()` which opens HA's generic more-info dialog — useful but generic, and it navigates away from the panel context. With the Popover API, we can show a **LCARS-styled detail overlay** that stays in context.

**What it replaces**: The existing `lcars-popup.js` creates a custom popup element and manually manages:
- z-index stacking (fragile in Shadow DOM)
- Click-outside dismissal (custom event listener)
- Focus trapping (manual)
- Escape key handling (manual)
- Backdrop overlay (manual)

The Popover API gives us **all of that for free** with a single HTML attribute.

**Implementation approach**:

Circuit tiles become `<button>` elements with `popovertarget`:

```js
_renderCircuitTile(circuit, sparklineData) {
  const watts = this._getPrimaryPower(circuit);
  const energy = this._getPrimaryEnergy(circuit);
  const color = getPowerColor(watts);
  const popoverId = `pwr-${circuit.device.id.slice(0, 8)}`;

  return html`
    <button class="power-circuit-tile"
      style="--tile-power-color:${color}"
      popovertarget="${popoverId}"
      aria-haspopup="dialog"
      aria-label="${this._shortDeviceName(circuit.device)}: ${watts != null ? Math.round(watts) + ' watts' : 'unavailable'}">
      <span class="circuit-name">${this._shortDeviceName(circuit.device)}</span>
      <div class="circuit-power-row">
        <span class="power-dot" ?data-zero=${watts === 0}></span>
        <span class="circuit-watts">${watts != null ? `${Math.round(watts)}W` : '—'}</span>
      </div>
      ${sparklineData ? renderSparkline(sparklineData, { color, width: 48, height: 16, className: 'power-mini-sparkline' }) : ''}
      ${energy != null ? html`<span class="circuit-energy">${energy.toFixed(1)} kWh</span>` : ''}
    </button>

    <div popover id="${popoverId}" class="power-detail-popover"
      role="dialog" aria-label="${this._shortDeviceName(circuit.device)} detail">
      <div class="popover-content">
        ${this._renderCircuitDetail(circuit, sparklineData)}
      </div>
    </div>
  `;
}
```

**Popover detail content**:

```js
_renderCircuitDetail(circuit, sparklineData) {
  const watts = this._getPrimaryPower(circuit);
  const energy = this._getPrimaryEnergy(circuit);
  const color = getPowerColor(watts);
  const label = getPowerLabel(watts);
  const name = this._shortDeviceName(circuit.device);

  return html`
    <div class="popover-header">
      <span class="popover-title">${name}</span>
      <span class="popover-status" style="color:${color}">${label}</span>
    </div>

    <div class="popover-hero-value" style="color:${color}">
      ${watts != null ? `${Math.round(watts)} W` : 'UNAVAILABLE'}
    </div>

    ${sparklineData ? html`
      <div class="popover-sparkline">
        ${renderSparkline(sparklineData, { color, width: 200, height: 40, className: 'power-detail-sparkline' })}
        <span class="popover-sparkline-label">24H POWER DRAW</span>
      </div>
    ` : ''}

    <div class="popover-stats">
      ${energy != null ? html`
        <div class="popover-stat-row">
          <span class="popover-stat-label">TODAY</span>
          <span class="popover-stat-value">${energy.toFixed(1)} kWh</span>
        </div>
      ` : ''}
      ${circuit.paired ? html`
        <div class="popover-stat-row">
          <span class="popover-stat-label">CIRCUIT TYPE</span>
          <span class="popover-stat-value" style="color:var(--lcars-butterscotch)">240V PAIRED</span>
        </div>
      ` : ''}
    </div>

    <button class="lcars-btn popover-history-btn"
      @click=${() => showMoreInfo(circuit.entries[0]?.entity?.entity_id)}>
      VIEW FULL HISTORY
    </button>
  `;
}
```

**Popover CSS — LCARS-styled top-layer overlay**:

```css
/* ─── Circuit Detail Popover ─── */
.power-detail-popover {
  /* Browser default reset */
  margin: auto;
  padding: 0;
  border: none;
  background: transparent;
  overflow: visible;
  max-width: min(26rem, 90vw);
  min-width: 18rem;

  /* Entry/exit animation with @starting-style */
  opacity: 0;
  transform: translateY(0.5rem) scale(0.98);
  transition:
    opacity var(--lcars-transition-slow) ease-out,
    transform var(--lcars-transition-slow) ease-out,
    overlay var(--lcars-transition-slow) allow-discrete,
    display var(--lcars-transition-slow) allow-discrete;
}

.power-detail-popover:popover-open {
  opacity: 1;
  transform: translateY(0) scale(1);
}

@starting-style {
  .power-detail-popover:popover-open {
    opacity: 0;
    transform: translateY(0.5rem) scale(0.98);
  }
}

/* Popover backdrop (subtle, not opaque) */
.power-detail-popover::backdrop {
  background: rgba(0, 0, 0, 0.5);
  transition: background-color var(--lcars-transition-slow);
}

@starting-style {
  .power-detail-popover::backdrop {
    background: rgba(0, 0, 0, 0);
  }
}

/* Content frame — LCARS card styling */
.popover-content {
  background: var(--lcars-black);
  border: 2px solid var(--lcars-butterscotch);
  border-left-width: 4px;
  border-radius: 0.75rem;
  padding: 0.75rem;
  font-family: var(--lcars-font);
  color: var(--lcars-text);
  text-transform: uppercase;
}

.popover-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--lcars-gray);
  margin-bottom: 0.5rem;
}

.popover-title {
  font-size: var(--lcars-font-size-sub);
  color: var(--lcars-text-heading);
}

.popover-status {
  font-size: var(--lcars-font-size-data);
  font-weight: 700;
}

.popover-hero-value {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  padding: 0.5rem 0;
}

.popover-sparkline {
  padding: 0.5rem 0;
}

.popover-sparkline-label {
  display: block;
  font-size: 0.6rem;
  color: var(--lcars-gray);
  text-align: center;
  margin-top: 0.25rem;
}

.popover-stats {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.5rem 0;
}

.popover-stat-row {
  display: flex;
  justify-content: space-between;
  font-size: var(--lcars-font-size-data);
}

.popover-stat-label {
  color: var(--lcars-space-white);
  opacity: 0.7;
}

.popover-stat-value {
  color: var(--lcars-ice);
  font-weight: 700;
}

.popover-history-btn {
  width: 100%;
  margin-top: 0.5rem;
  justify-content: center;
}

@media (prefers-reduced-motion: reduce) {
  .power-detail-popover {
    transition: none;
  }
  .power-detail-popover::backdrop {
    transition: none;
  }
}
```

**Progressive enhancement**: Since Popover is Newly Available (not Widely Available), provide fallback:

```js
_renderCircuitTile(circuit, sparklineData) {
  const supportsPopover = HTMLElement.prototype.hasOwnProperty('popover');

  if (!supportsPopover) {
    // Fallback: direct more-info on tap
    return html`
      <button class="power-circuit-tile" style="--tile-power-color:${color}"
        @click=${() => showMoreInfo(circuit.entries[0]?.entity?.entity_id)}>
        <!-- ... same tile content, no popovertarget ... -->
      </button>
    `;
  }

  // ... popover version ...
}
```

**Worf security review**: 
- `popover` attribute is a declarative HTML feature — no script injection
- `popovertarget` IDs derived from `device.id` (UUID from HA, already sanitized)
- Popover content rendered by our templates, not user input
- No `innerHTML` — all via lit-html tagged templates
- `::backdrop` is a CSS pseudo-element, not a DOM node — no clickjacking vector

> **Phase 3 Reconciliation — Data C-5 (Singleton Popover)**
>
> Data's review identified that 43 per-tile `<div popover>` elements creates ~430 extra DOM nodes.
> **Resolution**: Use **1 shared popover** element at the panel level. On tile click, populate the
> shared popover imperatively with the clicked circuit's data, then call `popoverEl.showPopover()`.
> The `popovertarget` declarative approach is replaced with imperative `showPopover()`.
> Implementation: A single `<div popover id="power-detail">` renders once in the panel template.
> `_showCircuitPopover(circuit, sparklineData)` populates it and calls `.showPopover()`.
> Fallback: `showMoreInfo()` on browsers without Popover API support (unchanged).

### 2.2 Scroll-Driven Animations — Circuit Grid Power-Up

**Baseline Status**: Newly Available  
**Browser Support**: Chrome 115+, Edge 115+, Firefox 110+, Safari 18.4+

When the power panel's circuit grid scrolls into the viewport, tiles "energize" with a staggered entrance — like watching an EPS power grid come online. This replaces the JavaScript-based stagger from Geordi's spec §8.3 with a **pure CSS** scroll-driven approach.

**Why this is better than JS IntersectionObserver**:
- No JavaScript event listeners
- GPU-composited animations (transform + opacity only)
- Automatically triggers on scroll direction (works for up-scroll too)
- Respects `prefers-reduced-motion` via CSS media query

```css
/* Scroll-driven power-up for circuit tiles */
@supports (animation-timeline: view()) {
  .power-circuit-tile {
    animation: circuit-energize linear both;
    animation-timeline: view();
    animation-range: entry 0% entry 40%;
  }

  @keyframes circuit-energize {
    from {
      opacity: 0;
      border-left-color: var(--lcars-disabled);
      transform: translateX(-0.25rem);
    }
    to {
      opacity: 1;
      border-left-color: var(--tile-power-color);
      transform: translateX(0);
    }
  }
}

/* Fallback for non-supporting browsers: instant render */
@supports not (animation-timeline: view()) {
  .power-circuit-tile {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .power-circuit-tile {
    animation: none !important;
    opacity: 1;
  }
}
```

**Performance note**: Scroll-driven animations are compositor-driven. They don't fire on the main thread. Chrome DevTools shows ~96% CPU reduction compared to equivalent JS scroll handlers (per the Tokopedia case study from Chrome DevRel).

**Important**: This replaces the `animation-delay: calc(var(--tile-index) * 50ms)` stagger from Geordi's §8.3 tile load animation. The scroll-driven approach is viewport-aware (tiles animate as they scroll into view, not all at page load), which is more appropriate for a 40+ tile grid that extends below the fold.

**Compatibility matrix**:

| Browser | Scroll-Driven | Fallback |
|---------|--------------|----------|
| Chrome 115+ | Full animation | — |
| Edge 115+ | Full animation | — |
| Firefox 110+ | Full animation | — |
| Safari 18.4+ | Full animation | — |
| Safari 17–18.3 | — | Instant render (opacity: 1) |
| Older | — | Instant render |

### 2.3 `text-wrap: balance` — Section Headers & Circuit Names

**Baseline Status**: Widely Available  
**Browser Support**: All baseline browsers (Chrome 114+, Edge 114+, Firefox 121+, Safari 17.5+)

Applied to elements where text might wrap to two lines:

```css
.power-section-label,
.power-strip-name,
.circuit-name,
.mains-label,
.popover-title {
  text-wrap: balance;
}
```

This prevents orphan words on short circuit names like "Living Room" wrapping as:
```
LIVING              LIVING
ROOM       →        ROOM
```
Both lines become approximately equal width.

**Zero risk** — Widely Available, no fallback needed, no performance impact. Pure progressive enhancement.

### 2.4 View Transition API — Deferred to v4.16.0

**Status**: Widely Available (same-document)

As discussed in Q2 above — deferred until panel extraction (4X-4) is complete. When the power panel is its own `<lcars-power-panel>` custom element, we can use `document.startViewTransition()` to animate between:
- Tile grid view ↔ Flow diagram view
- Collapsed circuits ↔ Expanded circuits
- Smart plug row ↔ Smart plug detail

Each view-transition-name would be assigned to the panel's container, enabling the browser to morph between states with LCARS-styled cross-fades.

---
