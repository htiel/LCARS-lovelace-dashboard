## 14. Summary of Recommendations

| Decision | Recommendation | Rationale |
|---|---|---|
| **Composition pattern** | Custom elements (component composition) | Panels have own state, template, CSS. Lit docs + HA precedent + Mushroom precedent |
| **Code sharing** | Base class (`LcarsBasePanel`) | Shared frame, pips, panel code. Mixin not needed — single inheritance sufficient |
| **Shared UI components** | 5 custom elements in `components/` | via `<lcars-panel-frame>`, panel code, entity helpers. Mixin not needed — single inheritance sufficient |
| **Shared UI components** | 5 custom elements in `components/` (YAGNI-phased)ic | Eliminates ~680 lines duplication, shadow DOM isolation prevents conflicts |
| **Bundle strategy** | Single bundle, no code splitting | All panels needed on every dashboard. Webpack handles it. +0.3% overhead |
| **Element registration** | `customElements.define()` per panel, NO `window.customCards` | Panels are sub-components, not standalone Lovelace cards |
| **Migration order** | Ascending complexity: Irrigation → Weather → Environment → ... → Battery | Lowest risk first, validates pattern early |
| **File structure** | `panels/` + `components/` subdirectories | Matches Mushroom `cards/` + `utils/` pattern. Clear ownership per spec sheet |
| **Python multi-dashboard** | Loop over `LovelaceYAML` + `_register_panel()` per dashboard URL | Trivially extensible from current single-dashboard code |
| **Lit version** | Stay on LitElement v2 | All proposed patterns work. Upgrade is orthogonal to this refactor |
