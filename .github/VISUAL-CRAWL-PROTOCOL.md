# Visual Crawl Protocol — LCARS Dashboard

When the Captain says **"crawl the site and take screenshots of everything"** or **"have the team review for bugs"**, this is the procedure. It is binding on every agent.

Two phases: **(A) exhaustive crawl** produces a complete screenshot directory; **(B) multi-officer pixel inspection** reviews every image and files defects.

Skipping any nook below — every filter, every scroll segment, every view-switch — is a process defect. If the Captain has to point out a missing screenshot, the crawl failed.

---

## Phase A — exhaustive crawl

### Pre-flight

1. Confirm the active version from `custom_components/lcars_dashboard/js/package.json`.
2. Target directory: `screenshots/v<version>/` (create if missing). Do **not** overwrite the previous crawl directory.
3. Confirm the browser is logged in as an **admin** user (chrome admin controls must render). Plan one follow-up pass as a non-admin if the user requests it.
4. Hard-refresh the dashboard (`Ctrl+Shift+R`) and verify the loaded bundle version matches step 1 by reading the footer.

### Naming convention

`NN-<dashboard>-<view>-<state>-<scroll>.png` — zero-padded ordering, lowercase, hyphen-separated.

Examples:
- `02-illumination-all-top.png`
- `02-illumination-all-mid.png`
- `02-illumination-all-bottom.png`
- `02-illumination-lights-top.png`
- `02-illumination-circuits-top.png`
- `04-tactical-disarmed-top.png` / `04-tactical-armed-home-top.png`
- `08-medical-vitals-modal-open.png`

### Per-dashboard crawl loop

For **every dashboard** in the sidebar, in sidebar order, execute every step:

1. **Land on the dashboard.** Wait for the first paint to settle (no `unavailable` placeholders flickering). Screenshot at `scroll=0` → `<NN>-<name>-<default-view>-top.png`.
2. **Enumerate every filter / segmented control / tab.** Scan the rendered DOM for `<button>`, `<lcars-pill>`, `<mwc-tab>`, segmented controls, view-mode switches. For each one:
   1. Click it.
   2. Wait for the view to stabilize.
   3. Screenshot at scroll-top.
   4. Scroll down by ~90% viewport height; screenshot. Repeat until `scrollY` no longer increases (end of content).
   5. Capture intermediate scroll positions for any panel taller than two viewports — name them `-mid`, `-mid2`, etc.
3. **Open every modal / popup / more-info.** Click each device tile / sensor row / chart that opens an overlay. Screenshot the open state. Close. Move to the next.
4. **Capture every device-detail / sub-page.** If clicking a card navigates to a sub-page (e.g. Habitat → area pages, Medical → patient detail), recurse: take top/mid/bottom of that sub-page, then back-navigate.
5. **Capture every persistent state variation visible from the UI.** Examples:
   - Tactical: DISARMED, ARMED HOME, ARMED AWAY, NIGHT, TRIGGERED (if safely testable).
   - Climate panels: heating active, cooling active, off, fan-only.
   - Media: playing, paused, idle.
   - Anything with a `mdi:` icon that toggles via interaction.
6. **Capture each header/footer chrome state**: admin chrome (3 endcap buttons) on first dashboard pass; if a non-admin pass is being done, capture the 1-button variant.

### Dashboard-specific filter / view inventories (current — keep updated)

| Dashboard | Required filter / view captures |
| --- | --- |
| Habitat (home) | Default + every area page (one row per `21-habitat-<area>.png` style, already present in v5.7.0-beta.1 — keep coverage) |
| Tactical (security) | All sensors, motion-only filter, door/window filter, lock filter; each arm state |
| Engineering (power) | Each tab/section; consumption view; generation view; battery view |
| Illumination | "ALL DEVICES", "LIGHTS", "CIRCUITS" (every pill), plus any per-room scope |
| Lifesupport (environmental) | Each climate zone, each filter pill, purifier modal open |
| Subspace Relay (network) | Every filter pill ("ALL", protocol filters, device-type filters); each device-detail expansion |
| Cetacean Ops | Every tank/exhibit filter; alarm-state variations |
| Medical Bay | Each section; vitals modal open; medication card if present |
| Starship Health | Each subsystem filter; alert/warning states |

If a new filter appears that is not in the table, add a row in the same commit that ships the filter.

### Sidebar / chrome captures (per dashboard, once)

- `<NN>-nav-<name>.png` — sidebar visible, dashboard pill highlighted, captured at the top of the page.
- One capture per modal triggered by the header endcap: sidebar-reorder dialog open, edit-mode toggled on.

### Completion gate

The crawl is complete only when:

- Every dashboard has at minimum: top, mid (if applicable), bottom, AND one capture per filter/view found.
- Every modal reachable by a single click on a visible affordance has been opened and captured.
- A `screenshots/v<version>/INDEX.md` exists listing every file with a one-line description (auto-generate from filenames is acceptable).

Then proceed to Phase B.

---

## Phase B — multi-officer pixel inspection

Hand the directory to the review team. Each officer reviews **every** image — not a sample — for the failures in their column.

### Output: `plans/v<version>-visual-audit.md`

Single audit doc, one `## Chrome parity` section first (chrome failures block release), then content sections by officer.

### Per-officer review duties

#### Geordi La Forge — chrome, color, alignment, LCARS compliance (lead)
- Run the chrome-parity grep tests from `.github/agents/geordi.agent.md` first. Any miss = stop and remediate before continuing the pixel pass.
- For every image, verify:
  - **Sidebar filler** is `var(--lcars-gray)` grey, top-left rounded, full-width below the lowest pill. Not the dashboard accent.
  - **Header endcap** has volume + sort + cog icons for admin captures (3 controls). Mute-only = `LCARS-PARITY-admin-chrome`.
  - **Elbow colors** match the dashboard's declared accent pair; corner radii are correct (top-elbow `var(--lcars-btn-radius) 0 0 var(--lcars-btn-radius)`).
  - **Typography**: Antonio, three sizes only, UPPERCASE for UI labels, mixed case only for prose.
  - **Alignment**: pill text baselines align across a row; numeric columns are right-aligned or decimal-aligned; equal vertical rhythm.
  - **Clipping**: every text label and circular gauge fits its container — no truncated digits, no half-shown rings, no overflowing pills. Specifically check circular status indicators (SHIELDS, ALARM, etc.) for pixel-level clipping at both ends of the ring.
  - **Color bleed**: filter pills do not paint surrounding elements; active-pill colors stay inside the pill.
  - **Focus visibility** for any captured focused state.

#### Data — telemetry presence and integrity
- For every image: every tile that should display a sensor reading **must** show a value, units, and a freshness indicator if applicable.
- Flag `unavailable`, `unknown`, `—`, blank cells, or stale timestamps anywhere a live entity should be.
- Compare expected device count vs. visible device count per filter (e.g. if Lights filter shows 17 entities but the dashboard's `area_registry` has 22, file a defect).
- Verify panel headers report a non-zero count when the filter has matches.

#### Worf — exposed surfaces and admin boundary
- For every image: no raw entity IDs, no internal IPs, no secrets, no tokens visible in the rendered UI.
- Confirm admin-only controls (gear, reorder, edit-mode-on indicator) only appear in admin captures — if a non-admin pass exists, those captures must show ONLY the mute icon.
- Flag any error message that leaks stack frames or file paths.

#### Wesley — affordance and interaction surface
- For every image: every interactive element looks interactive (cursor affordance, hover state if captured, focus ring).
- Flag dead zones — visual elements that look clickable but do nothing — and hidden interactions — affordances that need to be there but aren't visible.
- Flag any motion that violates `prefers-reduced-motion` if motion frames are captured.

#### Riker — triage, severity, routing
- After officers post findings: sort defects by severity (S0 chrome parity / S1 clipped data / S2 cosmetic), dedupe, assign to the responsible component owner, and produce the prioritized list at the top of the audit doc.
- Ensure every defect has: screenshot reference, file/line of the cause (if known), owner, severity, target release.

#### Q — non-LCARS pages only (skip for dashboard crawls)
- Reviews `past.html` / `dontpanic.html` if those were captured. Otherwise no-op.

#### Feynman — no role in visual crawls. Skip.

### Sign-off

The crawl + inspection is complete only when `plans/v<version>-visual-audit.md` exists with all officers' sections filled and Riker's prioritized list at the top. The Captain authorizes shipping; no agent self-authorizes.

---

## Failure modes this protocol exists to prevent

These are real misses from prior cycles. The protocol must catch each:

1. **Chrome drift across dashboards** — Medical and Starship layouts used accent colors for `.lcars-sidebar-filler` and lacked admin chrome (Bugs 1, 2, 6, 7 / v5.7.0-beta.2). Caught by Geordi's grep gate + image pass.
2. **Filter-pill color bleed** — ALL pill on Subspace Relay painted adjacent area (Bug 5). Caught by Wesley's hover/active-state pass with every filter clicked.
3. **Clipped status circles** — SHIELDS DISARMED ring clipped on tactical card (Bug 3). Caught by Geordi's clipping check on every dashboard's primary status indicator.
4. **Missing telemetry rows** — NETWORK HEALTH panel rendered chrome but no data rows (Bug 4). Caught by Data's telemetry-presence pass.
5. **Audit reviewed content, not chrome** — beta.1 audit listed orphan grids but never diffed layouts. Phase B's chrome-first ordering prevents this.

Any new failure mode the Captain has to point out **must** be added to this list, and the responsible check must be added to the appropriate officer's section, in the same commit that fixes the bug.
