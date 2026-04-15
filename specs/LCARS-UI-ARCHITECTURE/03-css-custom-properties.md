## 2. CSS Custom Properties

Define these in the `:host` selector of `lcars-dashboard-layout`. All child components inherit via CSS cascade through shadow DOM `::slotted` or by re-declaring in their own `:host`.

```css
:host {
  /* ═══════════════════════════════════════════
     LCARS COLOR PALETTE — Classic Theme (2369 era)
     Source: TheLCARS.com + Bracer Jack
     ═══════════════════════════════════════════ */

  /* Primary Palette */
  --lcars-butterscotch:    #ff9966;  /* Header elbows, header bar, primary action buttons */
  --lcars-sunflower:       #ffcc99;  /* Default button color, heading text */
  --lcars-african-violet:  #cc99ff;  /* Sidebar panels, footer elbows */
  --lcars-almond-creme:    #ffbbaa;  /* Sidebar panel accent */
  --lcars-almond:          #ffaa90;  /* Button variant, tile accent */
  --lcars-ice:             #99ccff;  /* Button variant, headings, frame borders */
  --lcars-gray:            #666688;  /* Default tile background, muted/disabled text */

  /* Secondary Palette */
  --lcars-lilac:           #cc55ff;  /* Button variant, tile accent */
  --lcars-gold:            #ffaa00;  /* Active/pressed button state */
  --lcars-golden-orange:   #ff9900;  /* Emphasis accent */
  --lcars-bluey:           #8899ff;  /* Secondary accent */
  --lcars-blue:            #5566ff;  /* Deep accent (rare) */
  --lcars-orange:          #ff8800;  /* Strong emphasis */
  --lcars-peach:           #ff8866;  /* Warm accent */
  --lcars-tomato:          #ff5555;  /* Error/alert states, red alert */
  --lcars-sky:             #aaaaff;  /* Cool accent */
  --lcars-violet-creme:    #ddbbff;  /* Soft accent */

  /* Semantic Colors */
  --lcars-space-white:     #f5f6fa;  /* Primary text color */
  --lcars-black:           #000000;  /* Background — ALWAYS */

  /* ═══════════════════════════════════════════
     SEMANTIC ROLE TOKENS
     ═══════════════════════════════════════════ */

  /* Frame Structure */
  --lcars-frame-header:        var(--lcars-butterscotch);
  --lcars-frame-footer:        var(--lcars-african-violet);
  --lcars-frame-sidebar:       var(--lcars-african-violet);
  --lcars-frame-sidebar-accent: var(--lcars-almond-creme);
  --lcars-frame-header-bar:    var(--lcars-butterscotch);
  --lcars-frame-footer-bar:    var(--lcars-african-violet);
  --lcars-frame-elbow-top:     var(--lcars-butterscotch);
  --lcars-frame-elbow-bottom:  var(--lcars-african-violet);

  /* Buttons */
  --lcars-button-default:      var(--lcars-sunflower);
  --lcars-button-hover:        brightness(1.2);
  --lcars-button-active:       var(--lcars-gold);
  --lcars-button-nav:          var(--lcars-african-violet);
  --lcars-button-action:       var(--lcars-butterscotch);
  --lcars-button-alt-1:        var(--lcars-ice);
  --lcars-button-alt-2:        var(--lcars-almond);
  --lcars-button-alt-3:        var(--lcars-lilac);
  --lcars-button-disabled:     var(--lcars-gray);

  /* Text */
  --lcars-text-primary:        var(--lcars-space-white);
  --lcars-text-heading:        var(--lcars-sunflower);
  --lcars-text-subheading:     var(--lcars-ice);
  --lcars-text-muted:          var(--lcars-gray);
  --lcars-text-alert:          var(--lcars-tomato);
  --lcars-text-on-button:      var(--lcars-black);

  /* Content Tiles */
  --lcars-tile-bg:             var(--lcars-gray);
  --lcars-tile-accent:         var(--lcars-almond);
  --lcars-tile-active:         var(--lcars-gold);

  /* Alerts */
  --lcars-status-ok:           var(--lcars-ice);
  --lcars-status-warn:         var(--lcars-golden-orange);
  --lcars-status-error:        var(--lcars-tomato);
  --lcars-status-offline:      var(--lcars-gray);

  /* ═══════════════════════════════════════════
     SIZING TOKENS
     ═══════════════════════════════════════════ */
  --lcars-unit:            7.5rem;
  --lcars-vunit:           3rem;
  --lcars-gap:             0.25rem;
  --lcars-sidebar-width:   12rem;
  --lcars-header-height:   4.5rem;   /* elbow height */
  --lcars-footer-height:   4.5rem;   /* elbow height */
  --lcars-bar-height:      1.5rem;
  --lcars-button-height:   3rem;
  --lcars-elbow-width:     9.5rem;
  --lcars-elbow-height:    4.5rem;
  --lcars-elbow-radius:    3.75rem;
  --lcars-endcap-size:     1.5rem;
  --lcars-endcap-radius:   0.75rem;
  --lcars-btn-radius:      1.5rem;

  /* ═══════════════════════════════════════════
     TYPOGRAPHY TOKENS
     ═══════════════════════════════════════════ */
  --lcars-font-family:     'Antonio', sans-serif;
  --lcars-font-title:      2.5rem;    /* Title size */
  --lcars-font-subtitle:   1.5rem;    /* Sub-header size */
  --lcars-font-body:        1rem;     /* Normal data size */
  --lcars-text-transform:  uppercase;

  /* ═══════════════════════════════════════════
     ANIMATION TOKENS
     ═══════════════════════════════════════════ */
  --lcars-transition-speed:     200ms;
  --lcars-transition-function:  ease-out;
  --lcars-fade-speed:           300ms;
}
```

### Google Fonts Import

```css
@import url('https://fonts.googleapis.com/css2?family=Antonio:wght@400;700&display=swap');
```

---
