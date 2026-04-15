## 3. Webpack & Bundle Considerations

### 3.1 Single Bundle Constraint

HA loads frontend resources via `add_extra_js_url()`, which injects a `<script type="module">` tag. The current webpack config compiles all entry points into a single `lcars-dashboard.js`.

**Can we use code splitting?** Technically possible — dynamic `import()` works in modules, and chunks could be served from the same `/lcars_dashboard/js/` static path. However:

- **Complexity cost**: Webpack chunk naming, cache-busting per chunk, serving multiple files
- **Benefit**: Near zero. ALL panels load on the dashboard. There's no lazy-loading scenario where a panel ISN'T needed.
- **Risk**: HA's static path caching may not correctly handle split chunks

**Recommendation**: **Stay with single bundle.** The module structure refactor is a source-level concern. Webpack compiles it all into one file regardless. Zero bundle size impact.

### 3.2 Tree Shaking

Webpack 5's tree-shaking works at the ES module `export` level. The current code uses `import`/`export` correctly in utility files. The proposed panel modules will use `export class` and be imported by the orchestrator — webpack will include exactly what's referenced.

**One consideration**: Side-effect imports for `customElements.define()`. Each panel file must call `customElements.define()` as a side effect at module scope. Webpack preserves side-effect imports by default (`sideEffects: true` in package.json or by not marking it false). The current webpack config does not set `sideEffects`, so this works correctly today and will continue to.

### 3.3 Bundle Size Projection

Current `lcars-dashboard.js` (production): ~386.5 KiB.

Extracting panels into separate modules changes the source structure but NOT the compiled output size. The same code exists — it's just in different files. Webpack module boundaries add ~50 bytes per import (the `__webpack_require__` call). With ~15 new imports, that's < 1 KiB overhead.

**Projected bundle size change: +0.3% (~0.8 KiB)**. Acceptable.

---
