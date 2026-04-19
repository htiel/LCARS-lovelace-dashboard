## 1. Lit Composition Patterns — Research Findings

**Source**: [lit.dev/docs/composition/overview](https://lit.dev/docs/composition/overview/), [mixins](https://lit.dev/docs/composition/mixins/), [controllers](https://lit.dev/docs/composition/controllers/), [component-composition](https://lit.dev/docs/composition/component-composition/)

### 1.1 Three Approaches Evaluated

| Pattern | Relationship | Use Case | Applicable Here? |
|---|---|---|---|
| **Component Composition** | Parent embeds child elements | Reusable UI with own template + styles + state | **Yes — primary pattern** |
| **Class Mixins** | "is-a" — extends prototype | Share lifecycle overrides, add API to host | **Yes — for shared frame behavior** |
| **Reactive Controllers** | "has-a" — owned by host | Stateful behavior without own template | **No — panels have templates** |

### 1.2 Why Component Composition Is Primary

Lit documentation states the criteria for when to create a component:

> *"A piece of UI may be a good candidate for a component if: It has its own state. It has its own template. It's used in more than one place. It focuses on doing one thing well. It has a well-defined API."*

Each LCARS panel satisfies **all five criteria**:
- **Own state**: Entity partitioning, expanded/collapsed sections, rate-limited service calls
- **Own template**: 87–404 lines of `html` template per panel
- **Used in more than one place**: v5.0 multi-dashboard reuse (Climate Panel on both Habitat and Environmental dashboards)
- **Focused**: One panel type per component
- **Well-defined API**: `hass`, `entities`, `area`, `editMode` properties in; events out

### 1.3 Why NOT Reactive Controllers

Lit's guidance:

> *"Choose a controller unless the feature requires: Adding public API to the component. Very granular access to the component lifecycle."*

Controllers are for *behavior without templates* — fetch logic, event handling, timers. Panels are primarily *template + CSS* with associated state. A controller cannot own a shadow DOM or isolated styles. Attempting to return `html` from a controller and render it in the host negates the isolation benefits and creates the same coupling we're trying to eliminate.

### 1.4 Where Mixins Fit

> **Note**: The mixin pattern below was explored during design. The final implementation uses a `<lcars-panel-frame>` **component** instead — see §5 for the resolved architecture. Frame CSS lives in the component's shadow DOM, not as a shared `panelFrameStyles` export.

The shared LCARS frame (border, pip bar, elbow, color-by-status) is behavior that augments the panel's class — it adds public API (`frameColor`, `panelTitle`, `showPips`) and overrides rendering lifecycle. This is a textbook mixin case:

```js
const LcarsPanelFrameMixin = (superClass) => class extends superClass {
  // Adds frame rendering, pip bar, panel code, elbow...
  renderFrame(content) { /* shared frame wrapper */ }
  static get styles() { return [super.styles, panelFrameStyles]; }
};
```

### 1.5 CSS Composition in Lit

Lit's `static styles` supports **array composition** — the foundation of the CSS strategy:

```js
static get styles() {
  return [
    lcarsBaseStyles,     // colors, tokens, typography (from lcars-styles.js)
    panelFrameStyles,    // shared frame/border/pip CSS (new)
    css`/* panel-specific overrides */`
  ];
}
```

This is exactly how Mushroom structures it: `[super.styles, cardStyle, css`...`]`. Inherited styles from base class merge with panel-specific additions. No duplication.

---
