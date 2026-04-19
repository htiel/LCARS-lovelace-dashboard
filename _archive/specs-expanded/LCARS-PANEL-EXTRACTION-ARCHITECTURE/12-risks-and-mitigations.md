## 11. Risks and Mitigations

### Risk 1: Shadow DOM Style Isolation Breaks Visual Appearance

**Issue**: Moving a panel renderer into its own custom element creates a new shadow DOM boundary. CSS selectors that currently traverse from the homepage card's shadow root into panel markup will no longer work.

**Mitigation**: 
- All panel CSS is already scoped to class-prefixed selectors (`.lcars-panel-*`, `.camera-*`, `.climate-*`)
- The monolith's single shadow root means these selectors only match within that root anyway
- Migration: Copy the relevant CSS block into the panel's `static styles`. Verify visually.
- CSS custom properties (which cross shadow boundaries) are used for theming and will continue to work.

**Risk Level**: Low. Systematic extraction, panel by panel, with visual verification.

### Risk 2: Service Call Context Loss

**Issue**: Panel renderers currently call `this._hass.callService()` and `this._setpointLimiter()` etc. on the homepage card instance. After extraction, `this` is the panel element.

**Mitigation**:
- `hass` is passed as a property — service calls work identically: `this.hass.callService()`
- Rate limiters and debouncers are created per instance in the constructor — no shared state concern
- `showMoreInfo()` and `fireEvent()` are already imported from `lcars-helpers.js` — they work from any element

**Risk Level**: None. The refactor is purely structural.

### Risk 3: Entity Cache Invalidation

**Issue**: The homepage card maintains `_entityCache` (a `Map`) for caching entity lookups. Panels won't have access to this cache.

**Mitigation**: 
- The cache is cleared on area/floor change — it's a view-level concern, not a panel concern
- Each panel receives pre-filtered `entities` array — no caching needed within panels
- If per-panel caching is needed (e.g., sparkline data), each panel manages its own cache

### Risk 6: Alarm Panel — Arm Mode Injection (Worf RA-1)

**Issue**: The alarm panel accepts arm mode strings from user interaction. If unsanitized, these could be passed to HA service calls.

**Mitigation**: Whitelist arm modes. Only `arm_home`, `arm_away`, `arm_night`, `arm_custom_bypass`, `disarm` are allowed. Any other value is rejected. PIN entry events use `composed: false` to prevent leaking outside the panel's shadow DOM.

### Risk 7: panel.html Static Path Exposure (Worf RA-2)

**Issue**: `panel.html` files contain sample data and could be served by misconfigured web servers.

**Mitigation**: Verify `panel.html` files are excluded from the webpack build output. They are development-only artifacts. Add `panels/**/panel.html` to webpack `exclude` config. The HA frontend only serves files explicitly registered via `add_extra_js_url`.

### Risk 8: innerHTML Usage in Power Panel (Worf RA-3)

**Issue**: The power panel currently uses `innerHTML` for some SVG rendering. Post-extraction, this must be replaced with Lit `html` templates to prevent XSS vectors.

**Mitigation**: During Power panel extraction (Phase 3.8), all `innerHTML` usage is replaced with `svg` tagged template literals from `lit-html`. No raw string HTML injection.

### Scope Boundary: Orchestrator Domain Renderers (Data N10)

The orchestrator's `_renderDomainGroups()` renders toggles, sensors, buttons, etc. that live OUTSIDE device panels. These domain-level renderers do **NOT** adopt `<lcars-sensor-row>` or other shared components. They remain as inline HTML in the orchestrator. Only device panel code uses the shared components.

**Risk Level**: Low. Cache belongs at orchestrator level.

### Risk 4: Bundle Size Regression

**Issue**: Module boundaries add webpack overhead.

**Mitigation**: Measured projection: +0.8 KiB (~0.3%). Well within budget. CSS deduplication saves ~600 lines — net size likely decreases.

**Risk Level**: None. Will measure before/after on first extraction PR.

### Risk 5: LitElement v2 vs. Lit 3 Compatibility

**Issue**: Project uses `lit-element` (v2) not `lit` (v3). Some patterns from Lit 3 docs may not apply.

**Mitigation**: 
- `LitElement`, `html`, `css` from `lit-element` work identically to Lit 3 for these patterns
- `static get styles()` array composition works in both versions
- `customElements.define()` is a web standard, not Lit-specific
- Base class extension via `extends` works in both versions
- **No Lit upgrade required** for this refactor

**Risk Level**: None. All proposed patterns are LitElement v2 compatible.

---
