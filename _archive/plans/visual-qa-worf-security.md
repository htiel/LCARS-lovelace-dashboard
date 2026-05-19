# LCARS Visual QA — Worf Security Audit

**Audit date**: Stardate 2026-04-18
**Auditor**: Worf, Son of Mogh — Chief of Security
**Scope**: XSS, injection, authentication, dependencies, data exposure, input validation
**Homes audited**: mariner, Boimler (via code review)

> *"A warrior does not abandon his post because standing is uncomfortable."*

This audit reviews the LCARS Dashboard codebase for security vulnerabilities. I have examined the JavaScript frontend, Python backend, WebSocket handlers, and npm dependencies against OWASP Top 10 standards.

---

## SECTION 1: SECURITY BUGS

### WORF-SEC-001 — innerHTML Usage in Vendor Editor.js

- **Severity**: LOW
- **Category**: XSS
- **What's vulnerable**: The `vendor/editor.js` file uses `button.innerHTML = b.name;` to set button content.
- **Attack vector**: If an attacker could control the `label` parameter passed to `registerCard(type, label)`, they could inject arbitrary HTML/JavaScript. However, `registerCard()` is only called from LCARS internal code with hardcoded string literals.
- **Impact**: Theoretical XSS if card registration were ever modified to accept user input.
- **Code location**: [custom_components/lcars_dashboard/js/vendor/editor.js](../custom_components/lcars_dashboard/js/vendor/editor.js#L24)
- **Suggested remediation**: Replace `button.innerHTML = b.name;` with `button.textContent = b.name;` for defense-in-depth. This preserves functionality while eliminating any future XSS risk.

---

### WORF-SEC-002 — Outdated npm Dependencies With Potential CVEs

- **Severity**: MEDIUM
- **Category**: DEPENDENCY
- **What's vulnerable**: Several npm dependencies are significantly outdated:
  - `lit-element@2.2.1` / `lit-html@1.1.2` — Current stable is lit 3.x
  - `webpack@5.26.0` — March 2021 version; current is 5.99+
  - `autoprefixer@10.2.5`, `postcss@8.2.8` — March 2021 versions
  - `sortablejs@1.14.0` — October 2021 version
  - `css-loader@5.1.3`, `style-loader@2.0.0` — 2021 versions
- **Attack vector**: Known vulnerabilities in older package versions can be exploited via supply chain attacks or direct exploitation if the vulnerable code paths are exercised.
- **Impact**: Depends on specific CVEs present. Webpack versions prior to 5.76.0 had prototype pollution vulnerabilities (CVE-2023-28154).
- **Code location**: [custom_components/lcars_dashboard/js/package.json](../custom_components/lcars_dashboard/js/package.json)
- **Suggested remediation**:
  1. Run `npm audit` to identify current CVEs
  2. Update webpack to at least 5.76.0 (prototype pollution fix)
  3. Consider Snyk or Socket.dev for continuous dependency monitoring
  4. Document in README that lit-element 2.x is intentionally pinned for HA compatibility

---

### WORF-SEC-003 — Alarm PIN Rate Limiter is Client-Side Only

- **Severity**: LOW
- **Category**: AUTH
- **What's vulnerable**: The alarm panel's rate limiter (`_alarmPinLimiter = createRateLimiter(3, 60000)`) is implemented entirely in JavaScript. It limits to 3 attempts per 60 seconds.
- **Attack vector**: An attacker with browser DevTools access could bypass the rate limiter by:
  1. Clearing the limiter state in memory
  2. Refreshing the page (limiter resets)
  3. Directly calling `hass.callService()` without going through the panel
- **Impact**: Unlimited alarm disarm attempts possible, enabling brute-force attacks on alarm codes. However, Home Assistant's alarm integration has its own server-side rate limiting and code validation. The client-side limiter is UX protection, not security.
- **Code location**: [custom_components/lcars_dashboard/js/src/panels/alarm/lcars-alarm-panel.js](../custom_components/lcars_dashboard/js/src/panels/alarm/lcars-alarm-panel.js#L17)
- **Suggested remediation**: This is acceptable as defense-in-depth. Document that server-side alarm code validation (HA alarm integration) is the authoritative security control. Consider adding visual feedback that indicates "rate limited — wait Xs" rather than just showing dots as error.

---

### WORF-SEC-004 — Inline Style Bindings With Color Values

- **Severity**: LOW
- **Category**: CSS-INJECTION
- **What's vulnerable**: Multiple components bind color values directly to inline styles:
  ```javascript
  style="color:${color}"
  style="background:${color}"
  ```
- **Attack vector**: If `color` variables ever contained user-controlled content (e.g., from entity `friendly_name`), CSS injection could occur. Example: `"red; background-image: url(evil.com/track)"`.
- **Impact**: CSS injection can enable data exfiltration via `url()` requests, UI spoofing, and information leakage.
- **Code location**: Multiple files including [lcars-sensor-row.js](../custom_components/lcars_dashboard/js/src/components/lcars-sensor-row/lcars-sensor-row.js#L66), [lcars-homepage-card.js](../custom_components/lcars_dashboard/js/src/lcars-homepage-card.js#L4206)
- **Suggested remediation**:
  1. Verify all color values come from controlled sources (`getStateColor()`, `getTempColor()`, CSS variables)
  2. Add a `sanitizeColor()` utility that validates color format (hex, rgb, or CSS variable reference only)
  3. Current implementation is safe because colors derive from fixed palettes in `lcars-color-utils.js`

---

### WORF-SEC-005 — Entity State Values Rendered Without Explicit Sanitization

- **Severity**: LOW
- **Category**: XSS
- **What's vulnerable**: Entity state values (`state.state`, `state.attributes.friendly_name`) are rendered in Lit templates:
  ```javascript
  html`<span class="sensor-value">${state.state}</span>`
  ```
- **Attack vector**: If an attacker could control entity state values or friendly names in Home Assistant, they might inject malicious content. In practice, HA sanitizes entity data at the source.
- **Impact**: XSS if HA's entity state validation were bypassed.
- **Code location**: Throughout panel rendering code
- **Suggested remediation**: This is a non-issue due to two factors:
  1. Lit-html's `html` tagged template literal auto-escapes interpolated values by default
  2. Home Assistant validates entity states at the integration level
  
  **This is functioning as designed — no change required.**

---

### WORF-SEC-006 — More Pages Directory Traversal Risk in process_yaml.py

- **Severity**: LOW
- **Category**: INPUT-VALIDATION
- **What's vulnerable**: The `process_yaml()` function iterates over directories in `lcars-dashboard/configs/more_pages/` using `os.listdir()` and constructs file paths without validating subdirectory names.
- **Attack vector**: If an attacker could create a symlink or directory named `../../../etc` in the `more_pages` folder, the code would follow it. However, this requires filesystem write access to the HA config directory, which implies the system is already compromised.
- **Impact**: Path traversal could expose files outside the intended directory. Mitigated by the fact that filesystem access = already compromised.
- **Code location**: [custom_components/lcars_dashboard/process_yaml.py](../custom_components/lcars_dashboard/process_yaml.py#L133-L160)
- **Suggested remediation**: Apply `_validate_path_component()` to subdirectory names from `os.listdir()` before constructing paths. Add `os.path.realpath()` validation as used in `_safe_path()`.

---

### WORF-SEC-007 — Blueprint YAML Parsing Without Schema Validation

- **Severity**: MEDIUM
- **Category**: INPUT-VALIDATION
- **What's vulnerable**: The `ws_handle_install_blueprint` handler parses user-supplied YAML via `yaml.safe_load()` and checks only for `blueprint` and `card` keys before writing to disk.
- **Attack vector**: A malicious blueprint could contain:
  1. Oversized data structures (DoS via memory exhaustion)
  2. Unexpected nested structures that cause errors in downstream processing
  3. YAML with `!include` or custom tags that might be processed by other HA components
- **Impact**: Denial of service, potential code execution if malformed YAML reaches vulnerable parsers.
- **Code location**: [custom_components/lcars_dashboard/__init__.py](../custom_components/lcars_dashboard/__init__.py#L310-L350)
- **Suggested remediation**:
  1. Add schema validation using voluptuous for blueprint structure
  2. Limit YAML size (reject blueprints > 100KB)
  3. Validate that `blueprint.name` matches safe filename characters before using in `slugify()`

---

### WORF-SEC-008 — Jinja2 Template File Path From Filesystem Listing

- **Severity**: MEDIUM
- **Category**: INJECTION
- **What's vulnerable**: The `load_yamll()` function in `process_yaml.py` passes filenames from filesystem listing to `jinja.get_template()`. While the Jinja2 environment uses `SandboxedEnvironment`, the file path itself comes from `os.listdir()`.
- **Attack vector**: An attacker with filesystem write access could create a file with a malicious name containing Jinja2 syntax. When the sandboxed environment loads the file, the filename becomes part of error messages or could potentially interact with the template loader in unexpected ways.
- **Impact**: Limited due to sandbox. Primarily a concern for error message information disclosure.
- **Code location**: [custom_components/lcars_dashboard/process_yaml.py](../custom_components/lcars_dashboard/process_yaml.py#L59-L75)
- **Suggested remediation**:
  1. Validate filenames against `_validate_path_component()` pattern before template loading
  2. The `SandboxedEnvironment` already blocks dangerous operations — this is defense-in-depth

---

## SECTION 2: SECURITY REVIEW OF CREATIVE IDEAS

### WESLEY-IDEA-009 — View Transitions API

- **Security Assessment**: **APPROVED**
- **Concerns Reviewed**:
  - **CSP Conflicts**: View Transitions API does not require `unsafe-inline` or `unsafe-eval`. It operates entirely within existing CSP constraints.
  - **No JavaScript execution**: View Transitions are purely visual — they do not enable script injection or network access.
  - **Shadow DOM**: As Wesley notes, shadow DOM elements participate as single units. This is a limitation, not a security concern.
- **Recommendation**: Proceed with View Transitions. Verify in HA's actual runtime that no CSP violations occur, but the API is designed to be CSP-safe.

---

### WESLEY-IDEA-010 — Alarm Badge in Room Headers

- **Security Assessment**: **REQUIRES MODIFICATION**
- **Concerns**:
  - **Accidental arm/disarm**: Wesley's proposed badge shows alarm state everywhere. If the badge is clickable and directly triggers arm/disarm without requiring PIN entry, users could accidentally change alarm state.
  - **Visual state exposure**: Showing alarm state in room headers exposes security posture to anyone who can see the screen. This is a privacy/opsec concern, not a technical vulnerability.
- **Recommendation**:
  1. Badge must be **read-only** — tapping navigates to the Tactical panel where PIN is required
  2. Never allow arm/disarm directly from the badge without PIN verification
  3. Consider a privacy toggle to hide alarm state badges when guests are present

---

### WESLEY-IDEA-015 — Haptic/Vibration API

- **Security Assessment**: **APPROVED WITH NOTE**
- **Concerns Reviewed**:
  - **Fingerprinting**: `navigator.vibrate()` returns a boolean indicating device support. This is minor fingerprinting surface but not exploitable in LCARS context.
  - **User gesture requirement**: The API only works in user-gesture contexts (click handlers), which is already how LCARS uses it.
  - **No permissions**: Vibration API has no permission gate, which is appropriate for its low-impact nature.
  - **HA Companion App**: As Wesley notes, the companion app has its own haptics. Test for double-vibration. This is UX, not security.
- **Recommendation**: Proceed. Wrap in `if ('vibrate' in navigator)` as planned. No security concerns.

---

## SECTION 3: COMMENDATIONS

*A warrior acknowledges strength in allies. The following security practices demonstrate honor in defending this codebase.*

### COMM-001: WebSocket Authentication Enforcement

All 26+ WebSocket command handlers are protected by `@websocket_api.require_admin` decorator. This ensures only administrator users can modify dashboard configuration. The CHANGELOG documents when this was added (v4.18.x), indicating proactive security improvement.

**Evidence**: [__init__.py](../custom_components/lcars_dashboard/__init__.py#L185) — `@websocket_api.require_admin` on every handler.

---

### COMM-002: Path Traversal Defense

The codebase implements robust path traversal protection:
- `_validate_path_component()` — Regex validation rejecting `..` and path separators
- `_safe_path()` — `os.path.realpath()` containment check ensuring paths stay within base directory
- Applied to 21 voluptuous schema fields for path-sensitive parameters

**Evidence**: [__init__.py](../custom_components/lcars_dashboard/__init__.py#L33-L48)

---

### COMM-003: Jinja2 Sandboxed Environment

The Jinja2 template engine uses `SandboxedEnvironment` from `jinja2.sandbox`, which blocks dangerous operations like file access, attribute modification, and code execution.

**Evidence**: [process_yaml.py](../custom_components/lcars_dashboard/process_yaml.py#L24) — `from jinja2.sandbox import SandboxedEnvironment`

---

### COMM-004: Lit-html Auto-Escaping

All user-facing content is rendered through Lit-html's `html` tagged template literal, which automatically escapes interpolated values. No use of `unsafeHTML()` directive was found in LCARS source code.

**Evidence**: Grep search for `unsafeHTML` returns 0 matches in `js/src/`. The only `innerHTML` usage is in vendor code for hardcoded strings.

---

### COMM-005: Entity ID Validation Before Service Calls

The `_callService()` method in `lcars-base-panel.js` validates entity IDs against `ENTITY_ID_RE` regex pattern before calling Home Assistant services. This prevents injection of malformed entity IDs.

**Evidence**: [lcars-base-panel.js](../custom_components/lcars_dashboard/js/src/lcars-base-panel.js#L66-L72)
```javascript
const ENTITY_ID_RE = /^[a-z_]+\.[a-z0-9_]+$/;
_callService(domain, service, data) {
  const entityId = data?.entity_id;
  if (entityId && !this._isValidEntityId(entityId)) {
    lcarsLog.warn('BasePanel', `_callService: invalid entity_id "${entityId}"`);
    return;
  }
```

---

### COMM-006: card-tools Pinned to Commit Hash

The `card-tools` dependency is pinned to a specific commit hash (`477f3d4eeb5c70cab047d418d19afb6b0f07bf49`) rather than a branch reference. This prevents supply chain attacks via branch mutation.

**Evidence**: [package.json](../custom_components/lcars_dashboard/js/package.json#L21)
```json
"card-tools": "github:thomasloven/lovelace-card-tools#477f3d4eeb5c70cab047d418d19afb6b0f07bf49"
```

---

### COMM-007: No External HTTP Calls

The `sensor.py` file previously made HTTP calls to `lcars-dashboard.htiel.nl` for version checking. This has been removed — the sensor now reports only the static installed version with no network requests. This eliminates SSRF and data exfiltration risks.

**Evidence**: [sensor.py](../custom_components/lcars_dashboard/sensor.py#L23-L24) — Comment: "LCARS Dashboard installed version sensor — no external calls."

---

### COMM-008: Voluptuous Schema Validation on WebSocket Commands

All WebSocket handlers use voluptuous schemas to validate incoming message structure, including type checking and allowlist validation for sensitive fields (e.g., `vol.In(ALLOWED_BOOL_KEYS)`).

**Evidence**: [__init__.py](../custom_components/lcars_dashboard/__init__.py#L448-L456) — `vol.Optional("key"): vol.In(ALLOWED_BOOL_KEYS)`

---

## SUMMARY

| Severity | Count |
|----------|-------|
| CRITICAL | 0 |
| HIGH | 0 |
| MEDIUM | 3 |
| LOW | 5 |

**Overall Assessment**: The LCARS Dashboard demonstrates strong security practices. The codebase shows evidence of deliberate security hardening (WebSocket auth, path validation, Jinja2 sandboxing). The identified issues are primarily defense-in-depth improvements rather than exploitable vulnerabilities.

**Priority Actions**:
1. Run `npm audit` and update webpack to ≥5.76.0 (WORF-SEC-002)
2. Add schema validation to blueprint installation (WORF-SEC-007)
3. Replace `innerHTML` with `textContent` in editor.js (WORF-SEC-001)

*"Today is a good day to harden our defenses."*

— Worf, Son of Mogh
