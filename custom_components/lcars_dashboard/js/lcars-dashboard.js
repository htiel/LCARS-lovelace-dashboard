/*! For license information please see lcars-dashboard.js.LICENSE.txt */
(()=>{"use strict";var e={505(e,t,a){function r(e,t){const a=t?.state;if("unavailable"===a||"unknown"===a)return"var(--lcars-alert)";const r=t?.attributes?.device_class||"",i=e.split(".")[0];if("binary_sensor"===i){if("off"===a)return"var(--lcars-disabled)";switch(r){case"motion":case"moving":return"var(--lcars-butterscotch)";case"occupancy":case"presence":return"var(--lcars-gold)";case"sound":return"var(--lcars-alert)";default:return"var(--lcars-data-accent)"}}if("sensor"===i){if("battery"===r){const e=parseFloat(a);if(!isNaN(e)&&e<20)return"var(--lcars-alert)"}return"var(--lcars-data-accent)"}return"event"===i?"var(--lcars-alert)":"var(--lcars-data-accent)"}function i(e){const t=Number(e);return Number.isFinite(t)?t<=800?"var(--lcars-ice)":t<=1200?"var(--lcars-sunflower)":"var(--lcars-tomato)":"var(--lcars-tomato)"}function s(e,t={}){const{coldMax:a=55,coolMax:r=67,nominalMax:i=76,warmMax:s=84}=t;if(null==e||isNaN(e))return"var(--lcars-gray)";const n=Number(e);return n<a?"var(--lcars-blue)":n<=r?"var(--lcars-bluey)":n<=i?"var(--lcars-ice)":n<=s?"var(--lcars-butterscotch)":"var(--lcars-peach)"}function n(e,t={}){const{veryDryMax:a=20,dryMax:r=29,nominalMax:i=60,humidMax:s=70}=t;if(null==e||isNaN(e))return"var(--lcars-gray)";const n=Number(e);return n<a?"var(--lcars-peach)":n<=r?"var(--lcars-sunflower)":n<=i?"var(--lcars-space-white)":n<=s?"var(--lcars-sunflower)":"var(--lcars-tomato)"}function o(e){switch(e){case"heating":return"var(--lcars-butterscotch)";case"cooling":return"var(--lcars-ice)";case"idle":return"var(--lcars-sunflower)";case"drying":return"var(--lcars-almond)";case"fan":return"var(--lcars-african-violet)";default:return"var(--lcars-disabled)"}}function l(e){switch(e){case"disarmed":return"var(--lcars-ice)";case"armed_home":case"armed_night":return"var(--lcars-sunflower)";case"armed_away":case"armed_vacation":return"var(--lcars-butterscotch)";case"armed_custom_bypass":return"var(--lcars-african-violet)";case"arming":case"pending":case"disarming":return"var(--lcars-gold)";case"triggered":return"var(--lcars-alert)";default:return"var(--lcars-disabled)"}}function c(e){if(null==e)return"var(--lcars-disabled)";switch(e){case"playing":return"var(--lcars-african-violet)";case"paused":case"buffering":return"var(--lcars-sunflower)";case"on":return"var(--lcars-data-accent)";case"idle":case"standby":case"off":default:return"var(--lcars-disabled)";case"unavailable":case"unknown":return"var(--lcars-alert)"}}function d(e,t="pool"){switch(e){case"heating":return"var(--lcars-butterscotch)";case"idle":return"spa"===t?"var(--lcars-sunflower)":"var(--lcars-ice)";default:return"var(--lcars-disabled)"}}function p(e){switch(e){case"sunny":return"var(--lcars-sunflower)";case"clear-night":return"var(--lcars-bluey)";case"partlycloudy":case"snowy-rainy":case"hail":return"var(--lcars-ice)";case"cloudy":case"fog":return"var(--lcars-gray)";case"rainy":case"pouring":default:return"var(--lcars-sky)";case"snowy":return"var(--lcars-space-white)";case"windy":case"windy-variant":return"var(--lcars-almond)";case"lightning":case"lightning-rainy":return"var(--lcars-gold)";case"exceptional":case"unavailable":return"var(--lcars-tomato)"}}function u(e,t=!1){if(t)return"var(--lcars-disabled)";switch(e){case"on":return"var(--lcars-ice)";case"off":return"var(--lcars-sunflower)";case"unavailable":return"var(--lcars-tomato)";default:return"var(--lcars-disabled)"}}function m(e){const t=Number(e);return Number.isFinite(t)?t<55?"cold":t<=67?"cool":t<=76?"nominal":t<=84?"warm":"hot":"nominal"}function h(e,t={}){const{lowMax:a=500,moderateMax:r=1500,highMax:i=3e3}=t;if(null==e||isNaN(e))return"var(--lcars-tomato)";const s=Math.abs(Number(e));return s<=0?"var(--lcars-gray)":s<=a?"var(--lcars-ice)":s<=r?"var(--lcars-sunflower)":s<=i?"var(--lcars-butterscotch)":"var(--lcars-tomato)"}function v(e,t={}){const{lowMax:a=500,moderateMax:r=1500,highMax:i=3e3}=t;if(null==e||isNaN(e))return"UNAVAILABLE";const s=Math.abs(Number(e));return s<=0?"STANDBY":s<=a?"LOW DRAW":s<=r?"MODERATE":s<=i?"HIGH DRAW":"CRITICAL"}a.d(t,{HJ:()=>m,IO:()=>v,JQ:()=>p,OX:()=>o,XI:()=>h,aK:()=>u,kR:()=>i,of:()=>l,qW:()=>d,sx:()=>s,uT:()=>c,xH:()=>r,z5:()=>n})},851(e,t,a){a.d(t,{Bo:()=>d,Hv:()=>l,g0:()=>r,o6:()=>i,oo:()=>o,rC:()=>n,te:()=>c});const r={_prefix:e=>`%c[LCARS ${e}]`,_style:"color: #f1b864; font-weight: bold",debug:(e,...t)=>{window.__LCARS_DEBUG&&console.debug(r._prefix(e),r._style,...t)},info:(e,...t)=>console.info(r._prefix(e),r._style,...t),warn:(e,...t)=>console.warn(r._prefix(e),r._style,...t),error:(e,...t)=>console.error(r._prefix(e),r._style,...t)},i=new EventTarget;function s(){const e=document.querySelector("hc-main");if(e)return e.hass;const t=document.querySelector("home-assistant");return t?t.hass:void 0}function n(e,t={},a=null){const r=new Event(e,{bubbles:!0,cancelable:!1,composed:!0});if(r.detail=t,a)a.dispatchEvent(r);else{const e=function(){let e=document.querySelector("hc-main");return e?(e=e?.shadowRoot?.querySelector("hc-lovelace")?.shadowRoot,e?.querySelector("hui-view")||e?.querySelector("hui-panel-view")):(e=document.querySelector("home-assistant"),e=e?.shadowRoot?.querySelector("home-assistant-main")?.shadowRoot,e=e?.querySelector("app-drawer-layout partial-panel-resolver"),e=e?.shadowRoot||e,e=e?.querySelector("ha-panel-lovelace")?.shadowRoot,e=e?.querySelector("hui-root")?.shadowRoot,e=e?.querySelector("ha-app-layout")?.querySelector("#view"),e?.firstElementChild)}();e&&e.dispatchEvent(r)}}function o(e,t=!1){t?history.replaceState(null,"",e):history.pushState(null,"",e),n("location-changed",{replace:t},window)}function l(e){n("hass-more-info",{entityId:e},document.querySelector("hc-main")||document.querySelector("home-assistant"))}async function c(e){const t=e.type?.startsWith("custom:")?e.type.slice(7):`hui-${e.type}-card`;if(customElements.get(t)||(await async function(){if(customElements.get("hui-view"))return!0;await customElements.whenDefined("partial-panel-resolver");const e=document.createElement("partial-panel-resolver");if(e.hass={panels:[{url_path:"tmp",component_name:"lovelace"}]},e._updateRoutes(),await e.routerOptions.routes.tmp.load(),!customElements.get("ha-panel-lovelace"))return!1;const t=document.createElement("ha-panel-lovelace");return t.hass=s(),void 0===t.hass&&(await new Promise(e=>{window.addEventListener("connection-status",()=>e(),{once:!0})}),t.hass=s()),t.panel={config:{mode:null}},t._fetchConfig(),!0}(),await new Promise(e=>setTimeout(e,100))),"function"==typeof window.loadCardHelpers)try{const t=await window.loadCardHelpers();return await t.createCardElement(e)}catch(e){}const a=document.createElement(t);return a.setConfig&&a.setConfig(e),a}function d(e,t,a,r="Configure"){const i=document.createElement("lcars-popup");i.hass=e,i.setConfig({title:r,card:{type:`custom:${t}`,...a}});const s=new MutationObserver(()=>{const e=i.shadowRoot?.querySelector(".popup-backdrop");e&&!e.hasAttribute("data-open")&&setTimeout(()=>{i.remove(),s.disconnect()},300)});document.body.appendChild(i),s.observe(i.shadowRoot||i,{attributes:!0,subtree:!0}),setTimeout(()=>{s.disconnect()},3e5),requestAnimationFrame(()=>i.open())}},261(e,t,a){a.d(t,{K:()=>i,s:()=>s});var r=a(349);function i(e,{color:t,label:a="",width:i=120,height:s=24,className:n="lcars-sparkline"}={}){const o=function(e){return Array.isArray(e)?e.map(e=>e.mean).filter(e=>null!=e&&Number.isFinite(e)):[]}(e);if(o.length<2)return"";const l=function(e,t,a){const r=Math.min(...e),i=Math.max(...e)-r||1;return e.map((s,n)=>`${(n/(e.length-1)*t).toFixed(1)},${(a-(s-r)/i*a).toFixed(1)}`).join(" ")}(o,i,s),c=o[o.length-1],d=a?`${a}: ${c?.toFixed(0)||""}`:`Sparkline: ${c?.toFixed(0)||""}`;return r.qy`
    <div class="${n}-wrap" aria-label="${d}">
      ${a?r.qy`<span class="${n}-label">${a}</span>`:""}
      <svg class="${n}" viewBox="0 0 ${i} ${s}" preserveAspectRatio="none">
        <polyline points="${l}" fill="none" stroke="${t}" stroke-width="1.5"
          vector-effect="non-scaling-stroke" />
      </svg>
    </div>
  `}async function s(e,t,a,r,i={}){const{ttlMs:s=3e5,maxEntities:n=10,maxCacheSize:o=30}=i,l=/^[a-z_]+\.[a-z0-9_]+$/,c=Date.now(),d=r.get(t);if(d&&c-d.timestamp<s)return null;try{const i=a.slice(0,n).filter(e=>l.test(e));if(0===i.length)return null;const s=new Date,d=new Date(s.getTime()-864e5),p=await e.callWS({type:"recorder/statistics_during_period",start_time:d.toISOString(),end_time:s.toISOString(),statistic_ids:i,period:"hour",types:["mean"]});if(r.set(t,{data:p,timestamp:c}),r.size>o){const e=r.keys().next().value;r.delete(e)}return p}catch(e){return null}}},622(e,t,a){a.d(t,{AM:()=>n,Bx:()=>s});var r=a(349);const i=r.AH`
  /* ─── LCARS Color Palette ─── */
  --lcars-african-violet: #cc99ff;
  --lcars-almond: #ffaa90;
  --lcars-almond-creme: #ffbbaa;
  --lcars-blue: #5566ff;
  --lcars-bluey: #8899ff;
  --lcars-butterscotch: #ff9966;
  --lcars-gold: #ffaa00;
  --lcars-golden-orange: #ff9900;
  --lcars-gray: #666688;
  --lcars-ice: #99ccff;
  --lcars-lilac: #cc55ff;
  --lcars-sunflower: #ffcc99;
  --lcars-orange: #ff8800;
  --lcars-peach: #ff8866;
  --lcars-tomato: #ff5555;
  --lcars-sky: #aaaaff;
  --lcars-space-white: #f5f6fa;
  --lcars-violet-creme: #ddbbff;
  --lcars-black: #000000;

  /* ─── Alpha Variants ─── */
  --lcars-gray-alpha: rgba(102, 102, 136, 0.15);

  /* ─── Semantic Role Tokens ─── */
  --lcars-bg: var(--lcars-black);
  --lcars-text: var(--lcars-space-white);
  --lcars-text-heading: var(--lcars-sunflower);
  --lcars-header-bar: var(--lcars-butterscotch);
  --lcars-footer-bar: var(--lcars-african-violet);
  --lcars-elbow-top: var(--lcars-butterscotch);
  --lcars-elbow-bottom: var(--lcars-african-violet);
  --lcars-sidebar-bg: var(--lcars-african-violet);
  --lcars-sidebar-accent: var(--lcars-almond-creme);
  --lcars-btn-default: var(--lcars-sunflower);
  --lcars-btn-active: var(--lcars-gold);
  --lcars-btn-nav: var(--lcars-african-violet);
  --lcars-data-accent: var(--lcars-ice);
  --lcars-alert: var(--lcars-tomato);
  --lcars-disabled: var(--lcars-gray);

  /* ─── Sizing Tokens (Jörn Weißenborn grid) ─── */
  --lcars-unit: 7.5rem;
  --lcars-vunit: 3rem;
  --lcars-gap: 0.25rem;
  --lcars-elbow-w: 10.5rem;
  --lcars-elbow-h: 4.5rem;
  --lcars-elbow-radius: 3.75rem;
  --lcars-sidebar-w: 12rem;
  --lcars-bar-h: 1.5rem;
  --lcars-endcap: 1.5rem;
  --lcars-btn-radius: 1.5rem;
  --lcars-btn-height: 3.5rem;

  /* ─── Typography ─── */
  --lcars-font: 'Antonio', 'Helvetica Neue', Arial, sans-serif;
  --lcars-font-size-title: 2rem;
  --lcars-font-size-hero: 3.5rem;
  --lcars-font-size-sub: 1.25rem;
  --lcars-font-size-data: 0.875rem;
  --lcars-font-size-label: 0.75rem;

  /* ─── Animation ─── */
  --lcars-transition: 200ms ease-out;
  --lcars-transition-slow: 400ms ease-out;

  /* ─── Animation Timing Tokens (Data R-5, v4.13.0) ─── */
  --lcars-anim-flash: 200ms;
  --lcars-anim-confirm: 400ms;
  --lcars-anim-pulse-urgent: 1s;
  --lcars-anim-pulse: 2s;
  --lcars-anim-breathe: 4s;
  --lcars-anim-ambient: 8s;
  --lcars-anim-scan: 600ms;
  --lcars-anim-stagger: 50ms;

  /* ─── Dashboard Identity Colors (5x-prep: 4X-24) ─── */
  --lcars-dash-habitat: var(--lcars-butterscotch);
  --lcars-dash-security: var(--lcars-tomato);
  --lcars-dash-power: var(--lcars-golden-orange);
  --lcars-dash-environmental: var(--lcars-ice);
  --lcars-dash-lighting: var(--lcars-almond);
  --lcars-dash-comm: var(--lcars-african-violet);
  --lcars-dash-ops: var(--lcars-bluey);
  --lcars-active-dash: var(--lcars-dash-habitat);
`,s=r.AH`
  :host {
    ${i}
    font-family: var(--lcars-font);
    color: var(--lcars-text);
    background: var(--lcars-bg);
    text-transform: uppercase;
    box-sizing: border-box;
    -webkit-font-smoothing: antialiased;
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  /* ─── LCARS Pill Button ─── */
  .lcars-btn {
    display: flex;
    align-items: center;
    height: var(--lcars-btn-height);
    padding: 0 1rem 0 0.75rem;
    background: var(--lcars-btn-default);
    color: var(--lcars-black);
    border: none;
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    text-transform: uppercase;
    text-align: left;
    cursor: pointer;
    transition: filter var(--lcars-transition);
    min-width: 6rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    user-select: none;
  }

  .lcars-btn:hover {
    filter: brightness(1.2);
  }

  .lcars-btn:focus-visible {
    outline: 2px solid var(--lcars-ice);
    outline-offset: 2px;
  }

  .lcars-btn:active,
  .lcars-btn.active {
    background: var(--lcars-btn-active);
  }

  .lcars-btn.nav {
    background: var(--lcars-btn-nav);
  }

  .lcars-btn.disabled {
    background: var(--lcars-disabled);
    cursor: default;
    pointer-events: none;
  }

  /* ─── LCARS Flat Button (both sides flat) ─── */
  .lcars-btn-flat {
    border-radius: 0;
  }

  /* ─── LCARS Endcap (both sides rounded) ─── */
  .lcars-btn-endcap {
    border-radius: var(--lcars-btn-radius);
  }

  /* ─── LCARS Section Heading ─── */
  .lcars-heading {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-sub);
    color: var(--lcars-text-heading);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 0.25rem 0;
  }

  /* ─── LCARS Thin Rule ─── */
  .lcars-rule {
    height: 2px;
    background: var(--lcars-data-accent);
    border: none;
    margin: var(--lcars-gap) 0;
  }

  /* ─── LCARS Horizontal Bar ─── */
  .lcars-bar {
    height: var(--lcars-bar-h);
    background: var(--lcars-header-bar);
    border-radius: 0 var(--lcars-endcap) var(--lcars-endcap) 0;
  }

  /* ─── Hide from visual, available to screen readers ─── */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      transition-duration: 0.01ms !important;
      animation-duration: 0.01ms !important;
    }
  }
`,n=r.AH`
  :focus-visible {
    outline: 2px solid var(--lcars-ice);
    outline-offset: 2px;
  }
`},349(e,t,a){a.d(t,{WF:()=>z,AH:()=>C,qy:()=>p.qy});var r=a(601),i=a(995);function s(e,t){const{element:{content:a},parts:r}=e,i=document.createTreeWalker(a,133,null,!1);let s=o(r),n=r[s],l=-1,c=0;const d=[];let p=null;for(;i.nextNode();){l++;const e=i.currentNode;for(e.previousSibling===p&&(p=null),t.has(e)&&(d.push(e),null===p&&(p=e)),null!==p&&c++;void 0!==n&&n.index===l;)n.index=null!==p?-1:n.index-c,s=o(r,s),n=r[s]}d.forEach(e=>e.parentNode.removeChild(e))}const n=e=>{let t=11===e.nodeType?0:1;const a=document.createTreeWalker(e,133,null,!1);for(;a.nextNode();)t++;return t},o=(e,t=-1)=>{for(let a=t+1;a<e.length;a++){const t=e[a];if((0,i.s9)(t))return a}return-1};var l=a(841),c=a(172),d=a(679),p=a(637);const u=(e,t)=>`${e}--${t}`;let m=!0;void 0===window.ShadyCSS?m=!1:void 0===window.ShadyCSS.prepareTemplateDom&&(console.warn("Incompatible ShadyCSS version detected. Please update to at least @webcomponents/webcomponentsjs@2.0.2 and @webcomponents/shadycss@1.3.1."),m=!1);const h=e=>t=>{const a=u(t.type,e);let r=c.c.get(a);void 0===r&&(r={stringsArray:new WeakMap,keyString:new Map},c.c.set(a,r));let s=r.stringsArray.get(t.strings);if(void 0!==s)return s;const n=t.strings.join(i.xL);if(s=r.keyString.get(n),void 0===s){const a=t.getTemplateElement();m&&window.ShadyCSS.prepareTemplateDom(a,e),s=new i.Bj(t,a),r.keyString.set(n,s)}return r.stringsArray.set(t.strings,s),s},v=["html","svg"],f=new Set;window.JSCompiler_renameProperty=(e,t)=>e;const g={toAttribute(e,t){switch(t){case Boolean:return e?"":null;case Object:case Array:return null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){switch(t){case Boolean:return null!==e;case Number:return null===e?null:Number(e);case Object:case Array:return JSON.parse(e)}return e}},b=(e,t)=>t!==e&&(t==t||e==e),y={attribute:!0,type:String,converter:g,reflect:!1,hasChanged:b},w="finalized";class _ extends HTMLElement{constructor(){super(),this.initialize()}static get observedAttributes(){this.finalize();const e=[];return this._classProperties.forEach((t,a)=>{const r=this._attributeNameForProperty(a,t);void 0!==r&&(this._attributeToPropertyMap.set(r,a),e.push(r))}),e}static _ensureClassProperties(){if(!this.hasOwnProperty(JSCompiler_renameProperty("_classProperties",this))){this._classProperties=new Map;const e=Object.getPrototypeOf(this)._classProperties;void 0!==e&&e.forEach((e,t)=>this._classProperties.set(t,e))}}static createProperty(e,t=y){if(this._ensureClassProperties(),this._classProperties.set(e,t),t.noAccessor||this.prototype.hasOwnProperty(e))return;const a="symbol"==typeof e?Symbol():`__${e}`,r=this.getPropertyDescriptor(e,a,t);void 0!==r&&Object.defineProperty(this.prototype,e,r)}static getPropertyDescriptor(e,t,a){return{get(){return this[t]},set(r){const i=this[e];this[t]=r,this.requestUpdateInternal(e,i,a)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this._classProperties&&this._classProperties.get(e)||y}static finalize(){const e=Object.getPrototypeOf(this);if(e.hasOwnProperty(w)||e.finalize(),this[w]=!0,this._ensureClassProperties(),this._attributeToPropertyMap=new Map,this.hasOwnProperty(JSCompiler_renameProperty("properties",this))){const e=this.properties,t=[...Object.getOwnPropertyNames(e),..."function"==typeof Object.getOwnPropertySymbols?Object.getOwnPropertySymbols(e):[]];for(const a of t)this.createProperty(a,e[a])}}static _attributeNameForProperty(e,t){const a=t.attribute;return!1===a?void 0:"string"==typeof a?a:"string"==typeof e?e.toLowerCase():void 0}static _valueHasChanged(e,t,a=b){return a(e,t)}static _propertyValueFromAttribute(e,t){const a=t.type,r=t.converter||g,i="function"==typeof r?r:r.fromAttribute;return i?i(e,a):e}static _propertyValueToAttribute(e,t){if(void 0===t.reflect)return;const a=t.type,r=t.converter;return(r&&r.toAttribute||g.toAttribute)(e,a)}initialize(){this._updateState=0,this._updatePromise=new Promise(e=>this._enableUpdatingResolver=e),this._changedProperties=new Map,this._saveInstanceProperties(),this.requestUpdateInternal()}_saveInstanceProperties(){this.constructor._classProperties.forEach((e,t)=>{if(this.hasOwnProperty(t)){const e=this[t];delete this[t],this._instanceProperties||(this._instanceProperties=new Map),this._instanceProperties.set(t,e)}})}_applyInstanceProperties(){this._instanceProperties.forEach((e,t)=>this[t]=e),this._instanceProperties=void 0}connectedCallback(){this.enableUpdating()}enableUpdating(){void 0!==this._enableUpdatingResolver&&(this._enableUpdatingResolver(),this._enableUpdatingResolver=void 0)}disconnectedCallback(){}attributeChangedCallback(e,t,a){t!==a&&this._attributeToProperty(e,a)}_propertyToAttribute(e,t,a=y){const r=this.constructor,i=r._attributeNameForProperty(e,a);if(void 0!==i){const e=r._propertyValueToAttribute(t,a);if(void 0===e)return;this._updateState=8|this._updateState,null==e?this.removeAttribute(i):this.setAttribute(i,e),this._updateState=-9&this._updateState}}_attributeToProperty(e,t){if(8&this._updateState)return;const a=this.constructor,r=a._attributeToPropertyMap.get(e);if(void 0!==r){const e=a.getPropertyOptions(r);this._updateState=16|this._updateState,this[r]=a._propertyValueFromAttribute(t,e),this._updateState=-17&this._updateState}}requestUpdateInternal(e,t,a){let r=!0;if(void 0!==e){const i=this.constructor;a=a||i.getPropertyOptions(e),i._valueHasChanged(this[e],t,a.hasChanged)?(this._changedProperties.has(e)||this._changedProperties.set(e,t),!0!==a.reflect||16&this._updateState||(void 0===this._reflectingProperties&&(this._reflectingProperties=new Map),this._reflectingProperties.set(e,a))):r=!1}!this._hasRequestedUpdate&&r&&(this._updatePromise=this._enqueueUpdate())}requestUpdate(e,t){return this.requestUpdateInternal(e,t),this.updateComplete}async _enqueueUpdate(){this._updateState=4|this._updateState;try{await this._updatePromise}catch(e){}const e=this.performUpdate();return null!=e&&await e,!this._hasRequestedUpdate}get _hasRequestedUpdate(){return 4&this._updateState}get hasUpdated(){return 1&this._updateState}performUpdate(){if(!this._hasRequestedUpdate)return;this._instanceProperties&&this._applyInstanceProperties();let e=!1;const t=this._changedProperties;try{e=this.shouldUpdate(t),e?this.update(t):this._markUpdated()}catch(t){throw e=!1,this._markUpdated(),t}e&&(1&this._updateState||(this._updateState=1|this._updateState,this.firstUpdated(t)),this.updated(t))}_markUpdated(){this._changedProperties=new Map,this._updateState=-5&this._updateState}get updateComplete(){return this._getUpdateComplete()}_getUpdateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._updatePromise}shouldUpdate(e){return!0}update(e){void 0!==this._reflectingProperties&&this._reflectingProperties.size>0&&(this._reflectingProperties.forEach((e,t)=>this._propertyToAttribute(t,this[t],e)),this._reflectingProperties=void 0),this._markUpdated()}updated(e){}firstUpdated(e){}}_[w]=!0;const x=Element.prototype;x.msMatchesSelector||x.webkitMatchesSelector;const $=window.ShadowRoot&&(void 0===window.ShadyCSS||window.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,k=Symbol();class S{constructor(e,t){if(t!==k)throw new Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e}get styleSheet(){return void 0===this._styleSheet&&($?(this._styleSheet=new CSSStyleSheet,this._styleSheet.replaceSync(this.cssText)):this._styleSheet=null),this._styleSheet}toString(){return this.cssText}}const C=(e,...t)=>{const a=t.reduce((t,a,r)=>t+(e=>{if(e instanceof S)return e.cssText;if("number"==typeof e)return e;throw new Error(`Value passed to 'css' function must be a 'css' function result: ${e}. Use 'unsafeCSS' to pass non-literal values, but\n            take care to ensure page security.`)})(a)+e[r+1],e[0]);return new S(a,k)};(window.litElementVersions||(window.litElementVersions=[])).push("2.5.1");const E={};class z extends _{static getStyles(){return this.styles}static _getUniqueStyles(){if(this.hasOwnProperty(JSCompiler_renameProperty("_styles",this)))return;const e=this.getStyles();if(Array.isArray(e)){const t=(e,a)=>e.reduceRight((e,a)=>Array.isArray(a)?t(a,e):(e.add(a),e),a),a=t(e,new Set),r=[];a.forEach(e=>r.unshift(e)),this._styles=r}else this._styles=void 0===e?[]:[e];this._styles=this._styles.map(e=>{if(e instanceof CSSStyleSheet&&!$){const t=Array.prototype.slice.call(e.cssRules).reduce((e,t)=>e+t.cssText,"");return new S(String(t),k)}return e})}initialize(){super.initialize(),this.constructor._getUniqueStyles(),this.renderRoot=this.createRenderRoot(),window.ShadowRoot&&this.renderRoot instanceof window.ShadowRoot&&this.adoptStyles()}createRenderRoot(){return this.attachShadow(this.constructor.shadowRootOptions)}adoptStyles(){const e=this.constructor._styles;0!==e.length&&(void 0===window.ShadyCSS||window.ShadyCSS.nativeShadow?$?this.renderRoot.adoptedStyleSheets=e.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet):this._needsShimAdoptedStyleSheets=!0:window.ShadyCSS.ScopingShim.prepareAdoptedCssText(e.map(e=>e.cssText),this.localName))}connectedCallback(){super.connectedCallback(),this.hasUpdated&&void 0!==window.ShadyCSS&&window.ShadyCSS.styleElement(this)}update(e){const t=this.render();super.update(e),t!==E&&this.constructor.render(t,this.renderRoot,{scopeName:this.localName,eventContext:this}),this._needsShimAdoptedStyleSheets&&(this._needsShimAdoptedStyleSheets=!1,this.constructor._styles.forEach(e=>{const t=document.createElement("style");t.textContent=e.cssText,this.renderRoot.appendChild(t)}))}render(){return E}}z.finalized=!0,z.render=(e,t,a)=>{if(!a||"object"!=typeof a||!a.scopeName)throw new Error("The `scopeName` option is required.");const i=a.scopeName,p=l.r.has(t),g=m&&11===t.nodeType&&!!t.host,b=g&&!f.has(i),y=b?document.createDocumentFragment():t;if((0,l.X)(e,y,Object.assign({templateFactory:h(i)},a)),b){const e=l.r.get(y);l.r.delete(y);((e,t,a)=>{f.add(e);const r=a?a.element:document.createElement("template"),i=t.querySelectorAll("style"),{length:l}=i;if(0===l)return void window.ShadyCSS.prepareTemplateStyles(r,e);const d=document.createElement("style");for(let e=0;e<l;e++){const t=i[e];t.parentNode.removeChild(t),d.textContent+=t.textContent}(e=>{v.forEach(t=>{const a=c.c.get(u(t,e));void 0!==a&&a.keyString.forEach(e=>{const{element:{content:t}}=e,a=new Set;Array.from(t.querySelectorAll("style")).forEach(e=>{a.add(e)}),s(e,a)})})})(e);const p=r.content;a?function(e,t,a=null){const{element:{content:r},parts:i}=e;if(null==a)return void r.appendChild(t);const s=document.createTreeWalker(r,133,null,!1);let l=o(i),c=0,d=-1;for(;s.nextNode();)for(d++,s.currentNode===a&&(c=n(t),a.parentNode.insertBefore(t,a));-1!==l&&i[l].index===d;){if(c>0){for(;-1!==l;)i[l].index+=c,l=o(i,l);return}l=o(i,l)}}(a,d,p.firstChild):p.insertBefore(d,p.firstChild),window.ShadyCSS.prepareTemplateStyles(r,e);const m=p.querySelector("style");if(window.ShadyCSS.nativeShadow&&null!==m)t.insertBefore(m.cloneNode(!0),t.firstChild);else if(a){p.insertBefore(d,p.firstChild);const e=new Set;e.add(d),s(a,e)}})(i,y,e.value instanceof d.i?e.value.template:void 0),(0,r.if)(t,t.firstChild),t.appendChild(y),l.r.set(t,e)}!p&&g&&window.ShadyCSS.styleElement(t.host)},z.shadowRootOptions={mode:"open"}},12(e,t,a){a.d(t,{q:()=>i});const r=new WeakMap,i=e=>"function"==typeof e&&r.has(e)},601(e,t,a){a.d(t,{Pf:()=>i,if:()=>s,o6:()=>r});const r="undefined"!=typeof window&&null!=window.customElements&&void 0!==window.customElements.polyfillWrapFlushCallback,i=(e,t,a=null,r=null)=>{for(;t!==a;){const a=t.nextSibling;e.insertBefore(t,r),t=a}},s=(e,t,a=null)=>{for(;t!==a;){const a=t.nextSibling;e.removeChild(t),t=a}}},624(e,t,a){a.d(t,{c:()=>r,s:()=>i});const r={},i={}},671(e,t,a){a.d(t,{GP:()=>b,Qh:()=>m,Yp:()=>h,g$:()=>v,pU:()=>p});var r=a(12),i=a(601),s=a(624),n=a(679),o=a(957),l=a(995);const c=e=>null===e||!("object"==typeof e||"function"==typeof e),d=e=>Array.isArray(e)||!(!e||!e[Symbol.iterator]);class p{constructor(e,t,a){this.dirty=!0,this.element=e,this.name=t,this.strings=a,this.parts=[];for(let e=0;e<a.length-1;e++)this.parts[e]=this._createPart()}_createPart(){return new u(this)}_getValue(){const e=this.strings,t=e.length-1,a=this.parts;if(1===t&&""===e[0]&&""===e[1]){const e=a[0].value;if("symbol"==typeof e)return String(e);if("string"==typeof e||!d(e))return e}let r="";for(let i=0;i<t;i++){r+=e[i];const t=a[i];if(void 0!==t){const e=t.value;if(c(e)||!d(e))r+="string"==typeof e?e:String(e);else for(const t of e)r+="string"==typeof t?t:String(t)}}return r+=e[t],r}commit(){this.dirty&&(this.dirty=!1,this.element.setAttribute(this.name,this._getValue()))}}class u{constructor(e){this.value=void 0,this.committer=e}setValue(e){e===s.c||c(e)&&e===this.value||(this.value=e,(0,r.q)(e)||(this.committer.dirty=!0))}commit(){for(;(0,r.q)(this.value);){const e=this.value;this.value=s.c,e(this)}this.value!==s.c&&this.committer.commit()}}class m{constructor(e){this.value=void 0,this.__pendingValue=void 0,this.options=e}appendInto(e){this.startNode=e.appendChild((0,l.h5)()),this.endNode=e.appendChild((0,l.h5)())}insertAfterNode(e){this.startNode=e,this.endNode=e.nextSibling}appendIntoPart(e){e.__insert(this.startNode=(0,l.h5)()),e.__insert(this.endNode=(0,l.h5)())}insertAfterPart(e){e.__insert(this.startNode=(0,l.h5)()),this.endNode=e.endNode,e.endNode=this.startNode}setValue(e){this.__pendingValue=e}commit(){if(null===this.startNode.parentNode)return;for(;(0,r.q)(this.__pendingValue);){const e=this.__pendingValue;this.__pendingValue=s.c,e(this)}const e=this.__pendingValue;e!==s.c&&(c(e)?e!==this.value&&this.__commitText(e):e instanceof o.Q?this.__commitTemplateResult(e):e instanceof Node?this.__commitNode(e):d(e)?this.__commitIterable(e):e===s.s?(this.value=s.s,this.clear()):this.__commitText(e))}__insert(e){this.endNode.parentNode.insertBefore(e,this.endNode)}__commitNode(e){this.value!==e&&(this.clear(),this.__insert(e),this.value=e)}__commitText(e){const t=this.startNode.nextSibling,a="string"==typeof(e=null==e?"":e)?e:String(e);t===this.endNode.previousSibling&&3===t.nodeType?t.data=a:this.__commitNode(document.createTextNode(a)),this.value=e}__commitTemplateResult(e){const t=this.options.templateFactory(e);if(this.value instanceof n.i&&this.value.template===t)this.value.update(e.values);else{const a=new n.i(t,e.processor,this.options),r=a._clone();a.update(e.values),this.__commitNode(r),this.value=a}}__commitIterable(e){Array.isArray(this.value)||(this.value=[],this.clear());const t=this.value;let a,r=0;for(const i of e)a=t[r],void 0===a&&(a=new m(this.options),t.push(a),0===r?a.appendIntoPart(this):a.insertAfterPart(t[r-1])),a.setValue(i),a.commit(),r++;r<t.length&&(t.length=r,this.clear(a&&a.endNode))}clear(e=this.startNode){(0,i.if)(this.startNode.parentNode,e.nextSibling,this.endNode)}}class h{constructor(e,t,a){if(this.value=void 0,this.__pendingValue=void 0,2!==a.length||""!==a[0]||""!==a[1])throw new Error("Boolean attributes can only contain a single expression");this.element=e,this.name=t,this.strings=a}setValue(e){this.__pendingValue=e}commit(){for(;(0,r.q)(this.__pendingValue);){const e=this.__pendingValue;this.__pendingValue=s.c,e(this)}if(this.__pendingValue===s.c)return;const e=!!this.__pendingValue;this.value!==e&&(e?this.element.setAttribute(this.name,""):this.element.removeAttribute(this.name),this.value=e),this.__pendingValue=s.c}}class v extends p{constructor(e,t,a){super(e,t,a),this.single=2===a.length&&""===a[0]&&""===a[1]}_createPart(){return new f(this)}_getValue(){return this.single?this.parts[0].value:super._getValue()}commit(){this.dirty&&(this.dirty=!1,this.element[this.name]=this._getValue())}}class f extends u{}let g=!1;(()=>{try{const e={get capture(){return g=!0,!1}};window.addEventListener("test",e,e),window.removeEventListener("test",e,e)}catch(e){}})();class b{constructor(e,t,a){this.value=void 0,this.__pendingValue=void 0,this.element=e,this.eventName=t,this.eventContext=a,this.__boundHandleEvent=e=>this.handleEvent(e)}setValue(e){this.__pendingValue=e}commit(){for(;(0,r.q)(this.__pendingValue);){const e=this.__pendingValue;this.__pendingValue=s.c,e(this)}if(this.__pendingValue===s.c)return;const e=this.__pendingValue,t=this.value,a=null==e||null!=t&&(e.capture!==t.capture||e.once!==t.once||e.passive!==t.passive),i=null!=e&&(null==t||a);a&&this.element.removeEventListener(this.eventName,this.__boundHandleEvent,this.__options),i&&(this.__options=y(e),this.element.addEventListener(this.eventName,this.__boundHandleEvent,this.__options)),this.value=e,this.__pendingValue=s.c}handleEvent(e){"function"==typeof this.value?this.value.call(this.eventContext||this.element,e):this.value.handleEvent(e)}}const y=e=>e&&(g?{capture:e.capture,passive:e.passive,once:e.once}:e.capture)},841(e,t,a){a.d(t,{X:()=>o,r:()=>n});var r=a(601),i=a(671),s=a(172);const n=new WeakMap,o=(e,t,a)=>{let o=n.get(t);void 0===o&&((0,r.if)(t,t.firstChild),n.set(t,o=new i.Qh(Object.assign({templateFactory:s.v},a))),o.appendInto(t)),o.setValue(e),o.commit()}},172(e,t,a){a.d(t,{c:()=>s,v:()=>i});var r=a(995);function i(e){let t=s.get(e.type);void 0===t&&(t={stringsArray:new WeakMap,keyString:new Map},s.set(e.type,t));let a=t.stringsArray.get(e.strings);if(void 0!==a)return a;const i=e.strings.join(r.xL);return a=t.keyString.get(i),void 0===a&&(a=new r.Bj(e,e.getTemplateElement()),t.keyString.set(i,a)),t.stringsArray.set(e.strings,a),a}const s=new Map},679(e,t,a){a.d(t,{i:()=>s});var r=a(601),i=a(995);class s{constructor(e,t,a){this.__parts=[],this.template=e,this.processor=t,this.options=a}update(e){let t=0;for(const a of this.__parts)void 0!==a&&a.setValue(e[t]),t++;for(const e of this.__parts)void 0!==e&&e.commit()}_clone(){const e=r.o6?this.template.element.content.cloneNode(!0):document.importNode(this.template.element.content,!0),t=[],a=this.template.parts,s=document.createTreeWalker(e,133,null,!1);let n,o=0,l=0,c=s.nextNode();for(;o<a.length;)if(n=a[o],(0,i.s9)(n)){for(;l<n.index;)l++,"TEMPLATE"===c.nodeName&&(t.push(c),s.currentNode=c.content),null===(c=s.nextNode())&&(s.currentNode=t.pop(),c=s.nextNode());if("node"===n.type){const e=this.processor.handleTextExpression(this.options);e.insertAfterNode(c.previousSibling),this.__parts.push(e)}else this.__parts.push(...this.processor.handleAttributeExpressions(c,n.name,n.strings,this.options));o++}else this.__parts.push(void 0),o++;return r.o6&&(document.adoptNode(e),customElements.upgrade(e)),e}}},957(e,t,a){a.d(t,{Q:()=>o,U:()=>l});var r=a(601),i=a(995);const s=window.trustedTypes&&trustedTypes.createPolicy("lit-html",{createHTML:e=>e}),n=` ${i.xL} `;class o{constructor(e,t,a,r){this.strings=e,this.values=t,this.type=a,this.processor=r}getHTML(){const e=this.strings.length-1;let t="",a=!1;for(let r=0;r<e;r++){const e=this.strings[r],s=e.lastIndexOf("\x3c!--");a=(s>-1||a)&&-1===e.indexOf("--\x3e",s+1);const o=i.zY.exec(e);t+=null===o?e+(a?n:i.XY):e.substr(0,o.index)+o[1]+o[2]+i.c1+o[3]+i.xL}return t+=this.strings[e],t}getTemplateElement(){const e=document.createElement("template");let t=this.getHTML();return void 0!==s&&(t=s.createHTML(t)),e.innerHTML=t,e}}class l extends o{getHTML(){return`<svg>${super.getHTML()}</svg>`}getTemplateElement(){const e=super.getTemplateElement(),t=e.content,a=t.firstChild;return t.removeChild(a),(0,r.Pf)(t,a.firstChild),e}}},995(e,t,a){a.d(t,{Bj:()=>o,XY:()=>i,c1:()=>n,h5:()=>d,s9:()=>c,xL:()=>r,zY:()=>p});const r=`{{lit-${String(Math.random()).slice(2)}}}`,i=`\x3c!--${r}--\x3e`,s=new RegExp(`${r}|${i}`),n="$lit$";class o{constructor(e,t){this.parts=[],this.element=t;const a=[],i=[],o=document.createTreeWalker(t.content,133,null,!1);let c=0,u=-1,m=0;const{strings:h,values:{length:v}}=e;for(;m<v;){const e=o.nextNode();if(null!==e){if(u++,1===e.nodeType){if(e.hasAttributes()){const t=e.attributes,{length:a}=t;let r=0;for(let e=0;e<a;e++)l(t[e].name,n)&&r++;for(;r-- >0;){const t=h[m],a=p.exec(t)[2],r=a.toLowerCase()+n,i=e.getAttribute(r);e.removeAttribute(r);const o=i.split(s);this.parts.push({type:"attribute",index:u,name:a,strings:o}),m+=o.length-1}}"TEMPLATE"===e.tagName&&(i.push(e),o.currentNode=e.content)}else if(3===e.nodeType){const t=e.data;if(t.indexOf(r)>=0){const r=e.parentNode,i=t.split(s),o=i.length-1;for(let t=0;t<o;t++){let a,s=i[t];if(""===s)a=d();else{const e=p.exec(s);null!==e&&l(e[2],n)&&(s=s.slice(0,e.index)+e[1]+e[2].slice(0,-n.length)+e[3]),a=document.createTextNode(s)}r.insertBefore(a,e),this.parts.push({type:"node",index:++u})}""===i[o]?(r.insertBefore(d(),e),a.push(e)):e.data=i[o],m+=o}}else if(8===e.nodeType)if(e.data===r){const t=e.parentNode;null!==e.previousSibling&&u!==c||(u++,t.insertBefore(d(),e)),c=u,this.parts.push({type:"node",index:u}),null===e.nextSibling?e.data="":(a.push(e),u--),m++}else{let t=-1;for(;-1!==(t=e.data.indexOf(r,t+1));)this.parts.push({type:"node",index:-1}),m++}}else o.currentNode=i.pop()}for(const e of a)e.parentNode.removeChild(e)}}const l=(e,t)=>{const a=e.length-t.length;return a>=0&&e.slice(a)===t},c=e=>-1!==e.index,d=()=>document.createComment(""),p=/([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F "'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/},637(e,t,a){a.d(t,{qy:()=>o,XX:()=>n.X,JW:()=>l});var r=a(671);const i=new class{handleAttributeExpressions(e,t,a,i){const s=t[0];return"."===s?new r.g$(e,t.slice(1),a).parts:"@"===s?[new r.GP(e,t.slice(1),i.eventContext)]:"?"===s?[new r.Yp(e,t.slice(1),a)]:new r.pU(e,t,a).parts}handleTextExpression(e){return new r.Qh(e)}};var s=a(957),n=(a(12),a(601),a(624),a(841));a(172),a(679),a(995),"undefined"!=typeof window&&(window.litHtmlVersions||(window.litHtmlVersions=[])).push("1.4.1");const o=(e,...t)=>new s.Q(e,t,"html",i),l=(e,...t)=>new s.U(e,t,"svg",i)},330(e){e.exports=JSON.parse('{"name":"lcars-dashboard","private":true,"version":"4.20.0-rc.1","description":"LCARS Dashboard — Home Assistant Lovelace dashboard with Star Trek LCARS UI. Based on Dwains Dashboard by Dwain Scheeren.","scripts":{"build":"webpack --mode=production","watch":"webpack --watch --mode=development"},"keywords":["lcars","home-assistant","lovelace","dashboard","hacs"],"author":"htiel (based on Dwains Dashboard by Dwain Scheeren)","license":"MIT","devDependencies":{"autoprefixer":"^10.2.5","css-loader":"^5.1.3","html-webpack-plugin":"^5.3.1","postcss":"^8.2.8","postcss-cli":"^8.3.1","postcss-loader":"^5.2.0","style-loader":"^2.0.0","tailwindcss":"^2.0.3","webpack":"^5.26.0","webpack-cli":"^4.5.0","webpack-dev-server":"^5.2.3","webpack-merge":"^5.7.3"},"dependencies":{"@mdi/js":"^6.5.95","card-tools":"github:thomasloven/lovelace-card-tools#477f3d4eeb5c70cab047d418d19afb6b0f07bf49","custom-card-helpers":"^1.8.0","js-cookie":"^3.0.1","lit-element":"^2.2.1","lit-html":"^1.1.2","sortablejs":"^1.14.0"}}')}},t={};function a(r){var i=t[r];if(void 0!==i)return i.exports;var s=t[r]={exports:{}};return e[r](s,s.exports,a),s.exports}a.d=(e,t)=>{for(var r in t)a.o(t,r)&&!a.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},a.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),(()=>{var e=a(349),t=a(622),r=a(851);class i extends e.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object},_activePath:{type:String}}}constructor(){super(),this._activePath="home"}set hass(e){this._hass=e}setConfig(e){this._config=e}_handleNav(e){this._activePath=e,(0,r.oo)(`/lcars-dashboard/${e}`),this.requestUpdate()}static get styles(){return[t.Bx,e.AH`
          :host {
            display: block;
          }

          .nav-container {
            display: flex;
            flex-direction: column;
            gap: var(--lcars-gap);
          }

          .nav-btn {
            display: flex;
            align-items: center;
            height: var(--lcars-btn-height);
            padding: 0 1rem 0 0.75rem;
            background: var(--lcars-btn-nav);
            color: var(--lcars-black);
            border: none;
            border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
            text-align: left;
            cursor: pointer;
            transition: filter var(--lcars-transition);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            user-select: none;
            min-width: 0;
            width: 100%;
          }

          .nav-btn:hover {
            filter: brightness(1.2);
          }

          .nav-btn:focus-visible {
            outline: 2px solid var(--lcars-ice);
            outline-offset: 2px;
          }

          .nav-btn:active,
          .nav-btn[data-active] {
            background: var(--lcars-btn-active);
          }

          .nav-btn ha-icon {
            --mdc-icon-size: 18px;
            margin-right: 0.5rem;
            flex-shrink: 0;
          }

          .nav-label {
            overflow: hidden;
            text-overflow: ellipsis;
          }
        `]}render(){return e.qy`
        <div class="nav-container" role="menubar" aria-label="Main navigation">
          ${[{path:"home",icon:"mdi:home",label:"Home"},{path:"devices",icon:"mdi:format-list-bulleted-type",label:"Devices"},{path:"more",icon:"mdi:dots-horizontal",label:"More"}].map(t=>e.qy`
              <button
                class="nav-btn"
                role="menuitem"
                ?data-active=${this._activePath===t.path}
                aria-current=${this._activePath===t.path?"page":"false"}
                @click=${()=>this._handleNav(t.path)}
              >
                <ha-icon .icon=${t.icon}></ha-icon>
                <span class="nav-label">${t.label}</span>
              </button>
            `)}
        </div>
      `}getCardSize(){return 3}}customElements.get("lcars-navigation-card")||customElements.define("lcars-navigation-card",i)})(),a(851).g0.info("Bundle","JS bundle loaded at",(new Date).toISOString()),(()=>{var e=a(349),t=a(622),r=a(851);const i="Layout";class s extends e.WF{static get properties(){return{cards:{type:Array},_hass:{type:Object},_narrow:{type:Boolean},_selectedArea:{type:String},_selectedFloor:{type:String},_editMode:{type:Boolean}}}constructor(){super(),this.cards=[],this._narrow=window.innerWidth<768,this._selectedArea=null,this._selectedFloor=null,this._editMode=!1,this._elbowPressTimer=null,this._resizeHandler=()=>{this._narrow=window.innerWidth<768}}connectedCallback(){super.connectedCallback(),window.addEventListener("resize",this._resizeHandler),r.g0.debug(i,"connectedCallback — layout mounted")}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("resize",this._resizeHandler),this._elbowPressTimer&&(clearTimeout(this._elbowPressTimer),this._elbowPressTimer=null),r.g0.debug(i,"disconnectedCallback — layout unmounted")}updated(e){super.updated(e),e.has("_editMode")&&(this._editMode?this.setAttribute("edit-mode",""):this.removeAttribute("edit-mode"))}setConfig(e){try{this._config=e,r.g0.debug(i,"setConfig",e)}catch(e){throw r.g0.error(i,"setConfig FAILED — this causes CONFIGURATION ERROR:",e),e}}set hass(e){const t=this._hass;this._hass=e,t||r.g0.debug(i,"First hass received — cards:",this.cards?.length||0),t&&t.areas!==e.areas&&this._selectedArea&&(e.areas?.[this._selectedArea]||(r.g0.debug(i,"Auto-deselecting deleted area:",this._selectedArea),this._selectedArea=null,r.o6.dispatchEvent(new CustomEvent("lcars-area-selected",{detail:{areaId:null}})))),t&&t.floors!==e.floors&&this._selectedFloor&&(e.floors?.[this._selectedFloor]||(r.g0.debug(i,"Auto-deselecting deleted floor:",this._selectedFloor),this._selectedFloor=null,r.o6.dispatchEvent(new CustomEvent("lcars-floor-selected",{detail:{floorId:null}})))),this.cards&&this.cards.forEach(t=>{t&&(t.hass=e)})}_selectArea(e){this._selectedFloor&&(this._selectedFloor=null,r.o6.dispatchEvent(new CustomEvent("lcars-floor-selected",{detail:{floorId:null}}))),this._selectedArea=this._selectedArea===e?null:e,r.g0.debug(i,"Area selected:",this._selectedArea||"(deselected)"),r.o6.dispatchEvent(new CustomEvent("lcars-area-selected",{detail:{areaId:this._selectedArea}}))}_selectFloor(e){this._selectedArea&&(this._selectedArea=null,r.o6.dispatchEvent(new CustomEvent("lcars-area-selected",{detail:{areaId:null}}))),this._selectedFloor=this._selectedFloor===e?null:e,r.g0.debug(i,"Floor selected:",this._selectedFloor||"(deselected)"),r.o6.dispatchEvent(new CustomEvent("lcars-floor-selected",{detail:{floorId:this._selectedFloor}}))}_toggleEditMode(){this._hass?.user?.is_admin&&(this._editMode=!this._editMode,r.g0.info(i,"Edit mode:",this._editMode?"ENABLED":"DISABLED"),r.o6.dispatchEvent(new CustomEvent("lcars-edit-mode",{detail:{enabled:this._editMode}})))}_handleElbowPointerDown(e){this._hass?.user?.is_admin&&(this._elbowPressTimer=setTimeout(()=>{this._toggleEditMode(),this._elbowPressTimer=null},800))}_handleElbowPointerUp(){this._elbowPressTimer&&(clearTimeout(this._elbowPressTimer),this._elbowPressTimer=null)}_editHeaderTitle(){this._editMode&&this._hass&&(0,r.Bo)(this._hass,"lcars-edit-homepage-header-card",{},"Edit Header")}_getAreas(){return this._hass&&this._hass.areas?Object.values(this._hass.areas):[]}_getAreasGroupedByFloor(){const e=this._getAreas(),t=this._hass?.floors?Object.values(this._hass.floors):[],a=new Map;for(const e of t)a.set(e.floor_id,{...e,areas:[]});const r=[];for(const t of e){const e=t.floor_id;e&&a.has(e)?a.get(e).areas.push(t):r.push(t)}const i=[...a.values()].filter(e=>e.areas.length>0).sort((e,t)=>(e.level??99)-(t.level??99)||e.name.localeCompare(t.name)).map(e=>({floor:{floor_id:e.floor_id,name:e.name,icon:e.icon,level:e.level},areas:e.areas}));return r.length>0&&i.push({floor:null,areas:r}),i}static get styles(){return[t.Bx,e.AH`
        :host {
          display: block;
          min-height: 100vh;
          background: var(--lcars-bg);
          padding: var(--lcars-gap);
        }

        /* ─── LCARS Frame Grid ─── */
        .lcars-frame {
          display: grid;
          grid-template-columns: var(--lcars-sidebar-w) 1fr;
          grid-template-rows: var(--lcars-elbow-h) 1fr var(--lcars-elbow-h);
          gap: var(--lcars-gap) var(--lcars-gap);
          min-height: calc(100vh - 0.5rem);
        }

        /* ─── Top-Left Elbow ─── */
        .lcars-elbow-top {
          grid-column: 1;
          grid-row: 1;
          background: var(--lcars-elbow-top);
          border-radius: var(--lcars-elbow-radius) 0 0 0;
          position: relative;
          overflow: hidden;
        }

        .lcars-elbow-top::after {
          content: '';
          position: absolute;
          bottom: 0;
          right: 0;
          width: calc(var(--lcars-sidebar-w) - var(--lcars-elbow-w));
          height: calc(var(--lcars-elbow-h) - var(--lcars-bar-h));
          background: var(--lcars-bg);
          border-radius: 1.5rem 0 0 0;
        }

        /* ─── Header Bar ─── */
        .lcars-header {
          grid-column: 2;
          grid-row: 1;
          display: flex;
          align-items: flex-start;
          gap: 0;
        }

        .lcars-header-bar {
          flex: 1;
          height: var(--lcars-bar-h);
          background: var(--lcars-header-bar);
        }

        .lcars-header-endcap {
          height: var(--lcars-bar-h);
          min-width: var(--lcars-endcap);
          background: var(--lcars-header-bar);
          border-radius: 0 var(--lcars-endcap) var(--lcars-endcap) 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 0.5rem;
        }

        .lcars-header-title {
          font-size: var(--lcars-font-size-title);
          color: var(--lcars-text-heading);
          white-space: nowrap;
          padding: 0 1rem;
          line-height: var(--lcars-bar-h);
        }

        /* ─── Configure Button (in header endcap) ─── */
        .configure-btn {
          background: none;
          border: none;
          color: var(--lcars-black);
          cursor: pointer;
          padding: 0 0.25rem;
          display: flex;
          align-items: center;
          font-family: var(--lcars-font);
          font-size: 0.65rem;
          text-transform: uppercase;
          user-select: none;
          gap: 0.25rem;
          white-space: nowrap;
          transition: filter var(--lcars-transition);
        }
        .configure-btn:hover { filter: brightness(0.8); }
        .configure-btn:focus-visible {
          outline: 2px solid var(--lcars-ice);
          outline-offset: 2px;
        }
        .configure-btn ha-icon { --mdc-icon-size: 16px; }

        /* ─── Sidebar ─── */
        .lcars-sidebar {
          grid-column: 1;
          grid-row: 2;
          display: flex;
          flex-direction: column;
          gap: var(--lcars-gap);
          padding-top: var(--lcars-gap);
          overflow: hidden;
          min-height: 0;
        }

        .lcars-sidebar-panel {
          background: var(--lcars-sidebar-bg);
          padding: 0.5rem 0.75rem;
          min-height: 2rem;
          font-size: var(--lcars-font-size-data);
          color: var(--lcars-black);
          text-transform: uppercase;
          flex-shrink: 0;
        }

        /* ─── Sidebar Area Buttons ─── */
        .lcars-sidebar-areas {
          display: flex;
          flex-direction: column;
          gap: var(--lcars-gap);
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          min-height: 0;
          mask-image: linear-gradient(to bottom, black calc(100% - 3rem), transparent 100%);
          -webkit-mask-image: linear-gradient(to bottom, black calc(100% - 3rem), transparent 100%);
        }

        .lcars-sidebar-areas::-webkit-scrollbar { width: 4px; }
        .lcars-sidebar-areas::-webkit-scrollbar-track { background: transparent; }
        .lcars-sidebar-areas::-webkit-scrollbar-thumb { background: var(--lcars-gray); border-radius: 2px; }

        .sidebar-area-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--lcars-almond-creme);
          color: var(--lcars-black);
          border: none;
          border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
          height: var(--lcars-btn-height);
          padding: 0 1rem 0 0.75rem;
          font-family: var(--lcars-font);
          font-size: var(--lcars-font-size-data);
          text-transform: uppercase;
          text-align: left;
          cursor: pointer;
          width: calc(100% - 0.25rem);
          transition: filter var(--lcars-transition), background var(--lcars-transition);
          user-select: none;
          white-space: nowrap;
          overflow: hidden;
          flex-shrink: 0;
        }
        .sidebar-area-btn:hover { filter: brightness(1.2); }
        .sidebar-area-btn:focus-visible {
          outline: 2px solid var(--lcars-ice);
          outline-offset: 2px;
        }
        .sidebar-area-btn[data-active] { background: var(--lcars-gold); }
        .sidebar-area-btn ha-icon { --mdc-icon-size: 18px; flex-shrink: 0; }
        .sidebar-area-btn .area-name { overflow: hidden; text-overflow: ellipsis; flex: 1; }

        /* ─── Floor Header Buttons ─── */
        .sidebar-floor-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--lcars-lilac, #cc55ff);
          color: var(--lcars-black);
          border: none;
          border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
          height: calc(var(--lcars-btn-height) * 0.7);
          padding: 0 1rem 0 0.75rem;
          font-family: var(--lcars-font);
          font-size: calc(var(--lcars-font-size-data) * 0.85);
          text-transform: uppercase;
          text-align: left;
          cursor: pointer;
          width: 100%;
          transition: filter var(--lcars-transition), background var(--lcars-transition);
          user-select: none;
          white-space: nowrap;
          overflow: hidden;
          flex-shrink: 0;
          margin-top: 0.25rem;
        }
        .sidebar-floor-btn:first-child { margin-top: 0; }
        .sidebar-floor-btn:hover { filter: brightness(1.2); }
        .sidebar-floor-btn:focus-visible {
          outline: 2px solid var(--lcars-ice);
          outline-offset: 2px;
        }
        .sidebar-floor-btn[data-active] { background: var(--lcars-gold); }
        .sidebar-floor-btn ha-icon { --mdc-icon-size: 16px; flex-shrink: 0; }
        .sidebar-floor-btn .floor-name { overflow: hidden; text-overflow: ellipsis; flex: 1; }

        .sidebar-unassigned-label {
          font-family: var(--lcars-font);
          font-size: calc(var(--lcars-font-size-data) * 0.7);
          color: var(--lcars-sky, #aaaaff);
          text-transform: uppercase;
          padding: 0.25rem 0.75rem 0;
          flex-shrink: 0;
        }

        /* ─── Edit Mode Indicator ─── */
        :host([edit-mode]) .lcars-elbow-top { background: var(--lcars-lilac); }
        :host([edit-mode]) .lcars-header-bar { background: var(--lcars-lilac); }
        :host([edit-mode]) .lcars-header-endcap { background: var(--lcars-lilac); }

        /* ─── Sidebar Nav Buttons (bottom) ─── */
        .lcars-sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: var(--lcars-gap);
          flex-shrink: 0;
        }

        /* ─── Main Content Area ─── */
        .lcars-content {
          grid-column: 2;
          grid-row: 2;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        /* ─── Bottom-Left Elbow ─── */
        .lcars-elbow-bottom {
          grid-column: 1;
          grid-row: 3;
          background: var(--lcars-elbow-bottom);
          border-radius: 0 0 0 var(--lcars-elbow-radius);
          position: relative;
          overflow: hidden;
        }

        .lcars-elbow-bottom::after {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: calc(var(--lcars-sidebar-w) - var(--lcars-elbow-w));
          height: calc(var(--lcars-elbow-h) - var(--lcars-bar-h));
          background: var(--lcars-bg);
          border-radius: 0 0 0 1.5rem;
        }

        /* ─── Footer Bar ─── */
        .lcars-footer {
          grid-column: 2;
          grid-row: 3;
          display: flex;
          align-items: flex-end;
          gap: 0;
        }

        .lcars-footer-bar {
          flex: 1;
          height: var(--lcars-bar-h);
          background: var(--lcars-footer-bar);
        }

        .lcars-footer-endcap {
          min-width: var(--lcars-endcap);
          height: var(--lcars-bar-h);
          background: var(--lcars-footer-bar);
          border-radius: 0 var(--lcars-endcap) var(--lcars-endcap) 0;
        }

        .lcars-footer-text {
          font-size: var(--lcars-font-size-data);
          color: var(--lcars-sky);
          padding: 0 0.5rem;
          white-space: nowrap;
          line-height: var(--lcars-bar-h);
        }

        /* ─── Mobile: Collapse sidebar to top nav ─── */
        @media (max-width: 767px) {
          .lcars-frame {
            grid-template-columns: 1fr;
            grid-template-rows: auto auto 1fr auto;
          }

          .lcars-elbow-top,
          .lcars-elbow-bottom {
            display: none;
          }

          .lcars-header {
            grid-column: 1;
            grid-row: 1;
          }

          .lcars-sidebar {
            grid-column: 1;
            grid-row: 2;
            flex-direction: row;
            overflow-x: auto;
            overflow-y: hidden;
            padding: var(--lcars-gap) 0;
          }

          .lcars-sidebar-panel { display: none; }

          .lcars-sidebar-areas {
            flex-direction: row;
            overflow-x: auto;
            overflow-y: hidden;
            mask-image: none;
            -webkit-mask-image: none;
          }

          .sidebar-area-btn {
            flex-shrink: 0;
            width: auto;
            min-width: 8rem;
          }

          .sidebar-floor-btn {
            flex-shrink: 0;
            width: auto;
            min-width: 6rem;
            margin-top: 0;
          }

          .sidebar-unassigned-label {
            display: none;
          }

          .lcars-sidebar-nav {
            flex-direction: row;
          }

          .lcars-content {
            grid-column: 1;
            grid-row: 3;
          }

          .lcars-footer {
            grid-column: 1;
            grid-row: 4;
          }
        }
      `]}render(){const t=this._getAreasGroupedByFloor();return e.qy`
      <div class="lcars-frame">
        <!-- Top-Left Elbow (long-press to toggle edit mode) -->
        <div class="lcars-elbow-top" aria-hidden="true"
          @pointerdown=${e=>this._handleElbowPointerDown(e)}
          @pointerup=${()=>this._handleElbowPointerUp()}
          @pointerleave=${()=>this._handleElbowPointerUp()}></div>

        <!-- Header Bar -->
        <div class="lcars-header" role="banner">
          <span class="lcars-header-title"
            @click=${()=>this._editHeaderTitle()}
            style="${this._editMode?"cursor:pointer":""}"
            >${this._editMode?"LCARS · CONFIGURATION MODE":"LCARS"}</span>
          <div class="lcars-header-bar" aria-hidden="true"></div>
          <div class="lcars-header-endcap">
            ${this._hass?.user?.is_admin?e.qy`
              <button class="configure-btn"
                aria-pressed=${this._editMode}
                aria-label="${this._editMode?"Exit configuration mode":"Enter configuration mode"}"
                @click=${()=>this._toggleEditMode()}>
                <ha-icon .icon=${"mdi:cog-outline"}></ha-icon>
              </button>
            `:""}
          </div>
        </div>

        <!-- Sidebar -->
        <nav class="lcars-sidebar" role="navigation" aria-label="Dashboard navigation">
          <div class="lcars-sidebar-panel">Areas</div>

          <!-- Area buttons grouped by floor (scrollable) -->
          <div class="lcars-sidebar-areas" role="group" aria-label="Floor and area selection">
            ${t.map(({floor:t,areas:a})=>e.qy`
              ${t?e.qy`
                <button class="sidebar-floor-btn"
                  ?data-active=${this._selectedFloor===t.floor_id}
                  aria-pressed=${this._selectedFloor===t.floor_id}
                  @click=${()=>this._selectFloor(t.floor_id)}>
                  <ha-icon .icon=${t.icon||"mdi:home-floor-1"}></ha-icon>
                  <span class="floor-name">${t.name}</span>
                </button>
              `:e.qy`
                <span class="sidebar-unassigned-label">Unassigned</span>
              `}
              ${a.map(t=>e.qy`
                <button class="sidebar-area-btn"
                  ?data-active=${this._selectedArea===t.area_id}
                  aria-pressed=${this._selectedArea===t.area_id}
                  @click=${()=>this._selectArea(t.area_id)}>
                  <ha-icon .icon=${t.icon||"mdi:home-outline"}></ha-icon>
                  <span class="area-name">${t.name}</span>
                </button>
              `)}
            `)}
          </div>

          <!-- Fixed nav buttons at bottom -->
          <div class="lcars-sidebar-nav">
            <slot name="sidebar"></slot>
          </div>
        </nav>

        <!-- Main Content -->
        <main class="lcars-content" aria-label="Dashboard content" aria-live="polite">
          ${this.cards&&this.cards.length>0?this.cards.map(t=>e.qy`${t}`):e.qy`<div class="lcars-heading">No data available</div>`}
        </main>

        <!-- Bottom-Left Elbow -->
        <div class="lcars-elbow-bottom" aria-hidden="true"></div>

        <!-- Footer Bar -->
        <div class="lcars-footer" role="contentinfo">
          <div class="lcars-footer-bar" aria-hidden="true"></div>
          <span class="lcars-footer-text">LCARS 47</span>
          <div class="lcars-footer-endcap" aria-hidden="true"></div>
        </div>
      </div>
    `}}const n=Promise.race([customElements.whenDefined("hui-masonry-view"),new Promise(e=>setTimeout(e,5e3))]);r.g0.debug(i,"Waiting for hui-masonry-view (5s timeout)..."),n.then(()=>{if(customElements.get("lcars-dashboard-layout"))r.g0.warn(i,"lcars-dashboard-layout already registered — skipping");else{customElements.define("lcars-dashboard-layout",s);const e=a(330);r.g0.info(i,`v${e.version} registered`),console.info(`%c LCARS-DASHBOARD \n%c Version ${e.version}`,"color: #ff9966; font-weight: bold; background: black","color: #f5f6fa; font-weight: bold; background: #333")}}).catch(e=>{r.g0.error(i,"Failed to register lcars-dashboard-layout:",e)})})(),(()=>{var e=a(349),t=a(637),r=a(622),i=a(851);const s="camera",n="alarm",o="aquatics",l="climate",c="media",d="environment",p="irrigation",u="weather",m="battery",h="power",v="life_support",f="illumination",g="tactical",b="viewport",y="hazard",w="galley",_={[f]:"left",[l]:"left",[v]:"left",[d]:"left",[h]:"left",[n]:"right",[g]:"right",[s]:"right",[m]:"right",[p]:"right",[c]:"right",[o]:"right",[u]:"right",[b]:"left",[w]:"left",[y]:"right"},x={[f]:0,[l]:2,[v]:3,[d]:4,[b]:4.5,[w]:4.7,[h]:5,[n]:0,[g]:0,[s]:1,[m]:2,[p]:3,[c]:4,[o]:5,[u]:6,[y]:7},$=new Set(["camera"]),k=new Set(["climate"]),S=new Set(["media_player"]),C=new Set(["alarm_control_panel"]),E=new Set(["weather"]),z=new Set(["light","switch","fan","input_boolean","lock","automation","script"]),A=new Set(["sensor","binary_sensor"]),q=new Set(["cover"]),P=new Set(["carbon_dioxide","carbon_monoxide","volatile_organic_compounds","volatile_organic_compounds_parts","pm25","pm10","pm1","aqi"]),T=/_(air_quality|score)$/,N=/pool|spa/i,M=new Set(["heater","solar","solar_preferred"]),D=new Set(["screenlogic","iaqualink","poolmath","waterguru","pentair"]);function I(e){const t=e?.preset_modes;return!!Array.isArray(t)&&t.some(e=>M.has(e))}const O=new Set(["weatherflow","weatherlink","met","openweathermap","accuweather","ecobee","environment_canada","nws","pirateweather"]),R=new Set(["wind_speed","wind_direction","precipitation","precipitation_intensity","pressure","irradiance"]),L=new Set(["smoke","gas","carbon_monoxide","heat","safety"]),F=new Set(["ge_home","smartthinq_sensors"]),W=new Set(["rachio","rainbird","rainmachine","opensprinkler","hydrawise","hunter"]),H=[e=>e.some(e=>$.has(e.domain))?s:null,e=>e.some(e=>C.has(e.domain))?n:null,e=>e.some(e=>"nest_protect"===e.entity?.platform)||e.filter(e=>"binary_sensor"===e.domain&&L.has(e.state?.attributes?.device_class||"")).length>=1?y:null,e=>e.some(e=>F.has(e.entity?.platform))?w:null,e=>{if(e.some(e=>D.has(e.entity?.platform)))return o;for(const t of e)if("climate"===t.domain){if(N.test(t.entity.entity_id))return o;if(I(t.state?.attributes))return o}return null},e=>e.some(e=>k.has(e.domain))?l:null,e=>e.some(e=>S.has(e.domain))?c:null,e=>{let t=0,a=!1;for(const r of e){const e=r.state?.attributes?.device_class||"";P.has(e)&&t++,"fan"===r.domain&&(a=!0),!e&&"sensor"===r.domain&&T.test(r.entity.entity_id)&&t++}return t>=2||t>=1&&a?d:null},e=>function(e){if(e.some(e=>W.has(e.entity?.platform)))return!0;let t=0,a=!1,r=0;for(const i of e){if("binary_sensor"===i.domain){const e=i.entity?.entity_id||"";/rain/i.test(e)&&(a=!0)}if("switch"!==i.domain)continue;r++;const e=i.state?.attributes;null==e?.zone_number?"outlet"===e?.device_class&&/zone/i.test(i.entity.entity_id)&&t++:t++}return t>=2||!!(r>=5&&a)}(e)?p:null,e=>{if(e.some(e=>E.has(e.domain)))return u;if(e.some(e=>O.has(e.entity?.platform)))return u;let t=0;for(const a of e){const e=a.state?.attributes?.device_class||"";R.has(e)&&t++}return t>=2?u:null},e=>{let t=!1,a=0,r=!1;for(const i of e){const e=i.state?.attributes;if(!e)continue;const s=e.device_class||"",n=e.unit_of_measurement||"";"battery"===s&&"%"===n&&(t=!0),"power"===s&&"W"===n&&a++,"voltage"===s&&"V"===n&&(r=!0);const o=i.entity?.entity_id||"";/ups[._]load|ups[._]status/i.test(o)&&(r=!0)}return t&&a>=2||t&&r?m:null},e=>{let t=!1,a=0;for(const r of e){const e=r.state?.attributes;if(!e)continue;const i=e.device_class||"",s=e.unit_of_measurement||"";if("battery"===i&&"%"===s){t=!0;break}"power"!==i||"W"!==s&&"kW"!==s||a++,"energy"!==i||"kWh"!==s&&"Wh"!==s||a++,"current"===i&&"A"===s&&a++,"voltage"===i&&"V"===s&&a++}return!t&&a>=1?h:null}],B={light:"Lights",switch:"Switches",fan:"Fans",lock:"Locks",input_boolean:"Toggles",automation:"Automations",script:"Scripts",sensor:"Sensors",binary_sensor:"Binary Sensors",camera:"Cameras",climate:"Climate",cover:"Covers",media_player:"Media",button:"Buttons",number:"Numbers",select:"Selects",input_number:"Inputs",input_select:"Selectors",input_text:"Text Inputs",input_button:"Buttons",input_datetime:"Date/Time",scene:"Scenes",device_tracker:"Trackers",person:"People",update:"Updates",event:"Events",conversation:"Conversation",alarm_control_panel:"Alarm",weather:"Weather",remote:"Remotes",vacuum:"Vacuums"},U={camera:0,light:1,switch:2,climate:3,cover:4,media_player:5,fan:6,lock:7,alarm_control_panel:8,weather:9,sensor:10,binary_sensor:11};function V(e){return k.has(e.domain)}function j(e){const t=e.state?.attributes?.device_class||"";return!!P.has(t)||"fan"===e.domain&&!t||!("sensor"!==e.domain||!T.test(e.entity?.entity_id||""))}const G=new Set(["unifi"]);function X(e){if(function(e){if("light"!==e.domain)return!1;if(G.has(e.entity?.platform))return!0;const t=e.entity?.entity_id||"";if(/led_indicator|status_led|status_panel|status_light/.test(t))return!0;const a=(e.state?.attributes?.friendly_name||"").toLowerCase();return!!/\bindicator\b|\bstatus\s*(led|light|panel)\b/.test(a)}(e))return!1;if("light"===e.domain)return!0;if("scene"===e.domain)return!0;if("switch"===e.domain||"input_boolean"===e.domain){const t=e.entity?.entity_id||"",a=(e.state?.attributes?.friendly_name||"").toLowerCase();return"outlet"!==e.state?.attributes?.device_class&&(/light|lamp|sconce|chandelier|pendant|fixture|dimmer|illuminat/i.test(a)||/light|lamp|sconce|chandelier|switchlinc|lamplinc|togglelinc/i.test(t))}return!1}const Y=new Set(["door","window","opening","garage_door","motion","occupancy","tamper","safety"]),Z=new Set(["garage_door","gate","door"]);function Q(e){if(C.has(e.domain))return!0;if("lock"===e.domain)return!0;const t=e.state?.attributes?.device_class||"";return!("binary_sensor"!==e.domain||!Y.has(t))||!("cover"!==e.domain||!Z.has(t))}function K(e){if("sensor"!==e.domain)return!1;const t=e.state?.attributes?.device_class||"";return"temperature"===t||"humidity"===t}var J=a(505);function ee(e,t={},a={}){const r=a.min??35,i=a.max??95,s=null!=t.min_temp?Number(t.min_temp):r,n=null!=t.max_temp?Number(t.max_temp):i,o=Math.max(r,s),l=Math.min(i,n);return Math.min(l,Math.max(o,Number(e)||o))}function te(e,t,a){return Math.min(a,Math.max(t,Number(e)||t))}function ae(e,t){const a=[];function r(){const e=Date.now()-t;for(;a.length>0&&a[0]<e;)a.shift()}return{allow:()=>(r(),!(a.length>=e||(a.push(Date.now()),0))),remaining:()=>(r(),Math.max(0,e-a.length)),resetTime:()=>(r(),a.length<e?0:a[0]+t),reset(){a.length=0}}}function re(e,t=1500){let a=null;return{call(...r){a&&clearTimeout(a),a=setTimeout(()=>{a=null,e(...r)},t)},cancel(){a&&(clearTimeout(a),a=null)}}}var ie=a(261);const se=new Map;async function ne(e,t,a="daily",r={}){const{ttlMs:i=6e5}=r,s=`${t}:${a}`,n=Date.now(),o=se.get(s);if(o&&n-o.timestamp<i)return o.data;try{const r=await e.callWS({type:"weather/subscribe_forecast",entity_id:t,forecast_type:a}),i=r?.forecast||r||[],o=Array.isArray(i)?i:[];if(se.set(s,{data:o,timestamp:n}),se.size>10){const e=se.keys().next().value;se.delete(e)}return o}catch(r){try{const r=await e.callService("weather","get_forecasts",{type:a},{entity_id:t}),i=r?.[t]?.forecast||[];return se.set(s,{data:i,timestamp:n}),i}catch(e){return[]}}}const oe=e.AH`
  /* ── Viewscreen power-on scanline (Device §7.10) ── */
  @keyframes lcars-scanline {
    from { transform: translateY(-100%); opacity: 0.6; }
    to   { transform: translateY(100%);  opacity: 0; }
  }

  /* ── Frame breathing pulse — ambient opacity cycle (Device §7.6) ── */
  @keyframes lcars-frame-breathe {
    0%, 100% { opacity: 0.88; }
    50%      { opacity: 1; }
  }

  /* ── Button press ripple flash (Device §7.9) ── */
  @keyframes lcars-button-flash {
    from { transform: scale(0.5); opacity: 0.8; }
    to   { transform: scale(2.5); opacity: 0; }
  }

  /* ── Data pip sweep — single bright pip animation (Device §7.7) ── */
  @keyframes lcars-pip-sweep {
    0%   { left: 0; opacity: 0; }
    10%  { opacity: 1; }
    90%  { opacity: 1; }
    100% { left: calc(100% - 6px); opacity: 0; }
  }

  /* ── Generic distress/fault pulse (parametric via CSS vars) ── */
  @keyframes lcars-distress-pulse {
    0%, 100% { border-color: var(--pulse-color-a, var(--lcars-tomato)); }
    50%      { border-color: var(--pulse-color-b, rgba(255, 85, 85, 0.3)); }
  }

  /* ── Value update flash (pill badges, sensor values) ── */
  @keyframes lcars-value-flash {
    0%   { background-color: var(--lcars-gold); }
    100% { background-color: var(--flash-return-color, var(--lcars-black)); }
  }

  /* ── Confirmation scale bounce ── */
  @keyframes lcars-confirm-scale {
    0%   { transform: scale(1); }
    50%  { transform: scale(1.05); }
    100% { transform: scale(1); }
  }

  /* ── Zone activation pulse (Irrigation §7 — zone start/stop) ── */
  @keyframes lcars-zone-pulse {
    0%, 100% { opacity: 1; }
    50%      { opacity: 0.6; }
  }

  /* ── Setpoint confirmation flash — scale + glow (Climate §13 enh.3) ── */
  @keyframes lcars-setpoint-confirm {
    0%   { transform: scale(1); text-shadow: none; }
    50%  { transform: scale(1.05); text-shadow: 0 0 8px var(--lcars-gold); }
    100% { transform: scale(1); text-shadow: none; }
  }
`,le=e.AH`
  @media (prefers-reduced-motion: reduce) {
    /* Ambient loops — disabled entirely */
    .lcars-device-panel,
    .lcars-audio-waveform .bar,
    .lcars-water-viewscreen::after,
    .lcars-pump-spinner,
    .lcars-atmos-particle,
    .lcars-rain-badge,
    .irrigation-zone-fill {
      animation: none !important;
    }

    /* Confirmations — halved duration, still play */
    .lcars-button:active::after,
    .lcars-setpoint-confirm,
    .lcars-zone-complete,
    .lcars-pip-flash,
    .lcars-value-flash {
      animation-duration: calc(var(--lcars-anim-confirm, 400ms) / 2) !important;
    }

    /* State transitions — instant */
    .device-panel-media,
    .lcars-mode-indicator,
    .lcars-heat-status-bar,
    .wind-needle {
      transition-duration: 0.01ms !important;
    }

    /* Static glow fallbacks — glows encode state, keep visible */
    .lcars-device-panel[data-state="triggered"] {
      border-color: var(--lcars-tomato);
      border-width: 6px 3px 6px 6px;
    }
  }
`,ce=e.AH`
  :host {
    display: block;
  }

  .lcars-panel-frame {
    --panel-frame-color: var(--frame-color-override, var(--lcars-butterscotch));
    display: flex;
    flex-direction: column;
    gap: var(--lcars-gap);
    width: 100%;
    max-width: var(--panel-max-width, 42rem);
    border-left: 4px solid var(--panel-frame-color);
    border-bottom: 4px solid var(--panel-frame-color);
    border-top: 2px solid var(--panel-frame-color);
    border-right: 2px solid var(--panel-frame-color);
    border-radius: 0.75rem 0.25rem 0.25rem 0.75rem;
    padding: var(--lcars-gap);
    background: var(--lcars-black);
    position: relative;
  }

  /* Corner bracket — top-left */
  .lcars-panel-frame::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -4px;
    width: 1.5rem;
    height: 1.5rem;
    border-top: 4px solid var(--panel-frame-color);
    border-left: 4px solid var(--panel-frame-color);
    border-radius: 0.75rem 0 0 0;
    pointer-events: none;
  }

  /* Corner bracket — bottom-right */
  .lcars-panel-frame::after {
    content: '';
    position: absolute;
    bottom: -4px;
    right: -2px;
    width: 1.5rem;
    height: 1.5rem;
    border-bottom: 4px solid var(--panel-frame-color);
    border-right: 2px solid var(--panel-frame-color);
    border-radius: 0 0 0.25rem 0;
    pointer-events: none;
  }

  /* Header bar */
  .panel-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.5rem;
  }

  .panel-name {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-sub);
    color: var(--panel-frame-color);
    text-transform: uppercase;
    white-space: nowrap;
  }

  .panel-header-line {
    flex: 1;
    height: 2px;
    background: var(--panel-frame-color);
    opacity: 0.5;
  }

  .panel-code {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    color: var(--panel-frame-color);
    opacity: 0.7;
    white-space: nowrap;
  }

  /* Badge slot */
  ::slotted([slot="badge"]) {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    text-transform: uppercase;
    white-space: nowrap;
  }

  /* Content area */
  .panel-content {
    flex: 1 1 auto;
    min-height: 0;
    overflow: visible;
  }
`;class de extends e.WF{static get properties(){return{panelName:{type:String,attribute:"panel-name"},panelCode:{type:String,attribute:"panel-code"},frameColor:{type:String,attribute:"frame-color"},panelType:{type:String,attribute:"panel-type"}}}constructor(){super(),this.panelName="",this.panelCode="",this.frameColor="var(--lcars-butterscotch)",this.panelType=""}static get styles(){return[oe,le,ce]}render(){return e.qy`
      <div class="lcars-panel-frame"
        role="region"
        aria-label="${this.panelName} panel"
        data-lcars-panel="${this.panelType}"
        data-panel-type="${this.panelType}"
        style="--frame-color-override:${this.frameColor}">
        <div class="panel-header">
          <span class="panel-name">${this.panelName}</span>
          <div class="panel-header-line"></div>
          <slot name="badge"></slot>
          ${this.panelCode?e.qy`
            <span class="panel-code" aria-hidden="true">${this.panelCode}</span>
          `:""}
        </div>
        <div class="panel-content">
          <slot></slot>
        </div>
      </div>
    `}}customElements.get("lcars-panel-frame")||customElements.define("lcars-panel-frame",de);const pe=e.AH`
  :host {
    display: block;
  }

  .sensor-line {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.5rem;
    cursor: pointer;
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    transition: background var(--lcars-transition);
    font-size: var(--lcars-font-size-data);
    text-transform: uppercase;
  }

  .sensor-line:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .sensor-line:focus-visible {
    outline: 2px solid var(--lcars-ice);
    outline-offset: 2px;
  }

  .sensor-indicator {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .sensor-label {
    flex: 1;
    color: var(--lcars-space-white);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.75rem;
  }

  .sensor-value {
    flex-shrink: 0;
    font-weight: 700;
    font-size: var(--lcars-font-size-data);
  }
`;class ue extends e.WF{static get properties(){return{label:{type:String},value:{type:String},color:{type:String},entityId:{type:String,attribute:"entity-id"}}}constructor(){super(),this.label="",this.value="",this.color="var(--lcars-space-white)",this.entityId=""}static get styles(){return[pe]}_handleClick(){this.entityId&&(0,i.Hv)(this.entityId)}_handleKeydown(e){"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._handleClick())}render(){return e.qy`
      <div class="sensor-line"
        tabindex="0"
        role="listitem"
        aria-label="${this.label}: ${this.value}"
        @click=${this._handleClick}
        @keydown=${this._handleKeydown}>
        <div class="sensor-indicator" style="background:${this.color}"></div>
        <span class="sensor-label">${this.label}</span>
        <span class="sensor-value" style="color:${this.color}">${this.value}</span>
      </div>
    `}}customElements.get("lcars-sensor-row")||customElements.define("lcars-sensor-row",ue);const me=e.AH`
  :host {
    display: block;
  }

  .divider-line {
    height: 1px;
    background: var(--lcars-gray);
    opacity: 0.3;
    margin: 0.375rem 0;
  }

  .divider-label {
    font-family: var(--lcars-font);
    font-size: 0.625rem;
    color: var(--lcars-sky, #aaaaff);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 0 0.5rem;
    margin-bottom: 0.125rem;
  }
`;class he extends e.WF{static get properties(){return{label:{type:String}}}constructor(){super(),this.label=""}static get styles(){return[me]}render(){return e.qy`
      <div class="divider-line"></div>
      ${this.label?e.qy`
        <div class="divider-label">${this.label}</div>
      `:""}
    `}}customElements.get("lcars-section-divider")||customElements.define("lcars-section-divider",he);const ve=e.AH`
  :host {
    display: block;
    --strip-accent: var(--lcars-sunflower);
  }

  .option-strip {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    padding: 0.25rem 0;
  }

  .option-btn {
    min-width: 4rem;
    height: var(--lcars-btn-height, 1.75rem);
    border: none;
    border-radius: 0 var(--lcars-btn-radius, 1rem) var(--lcars-btn-radius, 1rem) 0;
    background: var(--lcars-card-bg-color, var(--lcars-black, #000));
    color: var(--lcars-space-white, #f5f6fa);
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data, 0.75rem);
    text-transform: uppercase;
    cursor: pointer;
    transition: background 200ms, color 200ms;
    padding: 0 0.75rem;
    white-space: nowrap;
  }

  .option-btn:hover:not([aria-disabled="true"]) {
    background: rgba(255, 255, 255, 0.08);
  }

  .option-btn[aria-checked="true"] {
    background: var(--strip-accent);
    color: var(--lcars-black, #000);
    font-weight: 700;
  }

  .option-btn[aria-disabled="true"] {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .option-btn:focus-visible {
    outline: 2px solid var(--lcars-ice, #99ccff);
    outline-offset: 2px;
  }
`;class fe extends e.WF{static get properties(){return{options:{type:Array},value:{type:String},label:{type:String},accentColor:{type:String,attribute:"accent-color"}}}constructor(){super(),this.options=[],this.value="",this.label="",this.accentColor=""}static get styles(){return[ve]}_handleSelect(e){e!==this.value&&(this.value=e,this.dispatchEvent(new CustomEvent("lcars-option-changed",{detail:{value:e},bubbles:!0,composed:!0})))}_handleKeydown(e,t,a){if("Enter"===e.key||" "===e.key)return e.preventDefault(),void this._handleSelect(t);const r=this.options.filter(e=>!e.disabled);let i=-1;if("ArrowRight"===e.key||"ArrowDown"===e.key?(e.preventDefault(),i=(r.findIndex(e=>e.value===t)+1)%r.length):"ArrowLeft"!==e.key&&"ArrowUp"!==e.key||(e.preventDefault(),i=(r.findIndex(e=>e.value===t)-1+r.length)%r.length),i>=0){this._handleSelect(r[i].value);const e=this.shadowRoot.querySelectorAll('.option-btn:not([aria-disabled="true"])');e[i]?.focus()}}render(){const t=this.accentColor?`--strip-accent:${this.accentColor}`:"";return e.qy`
      <div class="option-strip" role="radiogroup" aria-label="${this.label}" style="${t}">
        ${(this.options||[]).map((t,a)=>{const r=t.value===this.value,i=t.disabled||!1;return e.qy`
            <button class="option-btn"
              role="radio"
              aria-checked="${r}"
              aria-disabled="${i}"
              tabindex="${r?"0":"-1"}"
              ?disabled=${i}
              @click=${()=>!i&&this._handleSelect(t.value)}
              @keydown=${e=>!i&&this._handleKeydown(e,t.value,a)}>
              ${t.label}
            </button>
          `})}
      </div>
    `}}customElements.get("lcars-option-strip")||customElements.define("lcars-option-strip",fe);const ge=e.AH`
  :host {
    display: inline-flex;
    --sp-color: var(--lcars-sunflower);
  }

  .setpoint-control {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }

  .sp-btn {
    width: 3rem;
    height: 2.5rem;
    border: none;
    border-radius: 0;
    background: var(--sp-color);
    color: var(--lcars-black, #000);
    font-family: var(--lcars-font);
    font-size: 1.2rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 200ms;
    line-height: 1;
    padding: 0;
  }
  .sp-btn.sp-dec { border-radius: 1.5rem 0 0 1.5rem; }
  .sp-btn.sp-inc { border-radius: 0 1.5rem 1.5rem 0; }

  .sp-btn:hover { opacity: 0.8; }
  .sp-btn:active { opacity: 0.6; }
  .sp-btn:disabled { opacity: 0.3; cursor: not-allowed; }
  .sp-btn:focus-visible {
    outline: 2px solid var(--lcars-ice, #99ccff);
    outline-offset: 2px;
  }

  .sp-label {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-sub, 0.9rem);
    color: var(--sp-color);
    text-transform: uppercase;
    min-width: 3rem;
    text-align: center;
    white-space: nowrap;
  }
`;class be extends e.WF{static get properties(){return{value:{type:Number},step:{type:Number},min:{type:Number},max:{type:Number},unit:{type:String},label:{type:String},color:{type:String}}}constructor(){super(),this.value=0,this.step=.5,this.min=0,this.max=100,this.unit="",this.label="",this.color=""}static get styles(){return[ge]}_adjust(e){const t=Math.min(this.max,Math.max(this.min,this.value+e));t!==this.value&&(this.value=t,this.dispatchEvent(new CustomEvent("lcars-setpoint-changed",{detail:{value:t},bubbles:!0,composed:!0})))}render(){const t=this.color?`--sp-color:${this.color}`:"",a=this.label||`${this.value}${this.unit}`;return e.qy`
      <div class="setpoint-control"
        role="spinbutton"
        aria-valuenow="${this.value}"
        aria-valuemin="${this.min}"
        aria-valuemax="${this.max}"
        aria-label="${this.label||"Setpoint"}"
        style="${t}">
        <button class="sp-btn sp-dec"
          aria-label="Decrease"
          ?disabled=${this.value<=this.min}
          @click=${()=>this._adjust(-this.step)}>−</button>
        <span class="sp-label">${a}</span>
        <button class="sp-btn sp-inc"
          aria-label="Increase"
          ?disabled=${this.value>=this.max}
          @click=${()=>this._adjust(this.step)}>+</button>
      </div>
    `}}customElements.get("lcars-setpoint")||customElements.define("lcars-setpoint",be);const ye=/^[a-z_]+\.[a-z0-9_]+$/;class we extends e.WF{static get properties(){return{group:{type:Object},hass:{type:Object},config:{type:Object},editMode:{type:Boolean,attribute:"edit-mode",reflect:!0},areaId:{type:String,attribute:"area-id"},linkedEntities:{type:Array},entities:{type:Array},devices:{type:Array},frameMode:{type:String,attribute:"frame-mode"}}}constructor(){super(),this.group=null,this.hass=null,this.config=null,this.editMode=!1,this.areaId=null,this.linkedEntities=[],this.entities=null,this.devices=null,this.frameMode="standard"}_getEntityState(e){return this.hass&&this.hass.states[e]?this.hass.states[e]:null}_isValidEntityId(e){return"string"==typeof e&&ye.test(e)}_callService(e,t,a){if(!this.hass)return void i.g0.warn("BasePanel","_callService: no hass instance");const r=a?.entity_id;if(!r||this._isValidEntityId(r))return this.hass.callService(e,t,a);i.g0.warn("BasePanel",`_callService: invalid entity_id "${r}"`)}_handleEntityClick(e){(0,i.Hv)(e)}_getSensorIndicatorColor(e){return"carbon_dioxide"===(e?.attributes?.device_class||"")?(0,J.kR)(e?.state):(0,J.xH)(e?.entity_id||"",e)}_getDeviceCategoryEntities(e){if(!this.hass||!e)return{config:[],diagnostic:[]};const t=Object.values(this.hass.entities||{}),a=[],r=[];for(const i of t)i.device_id===e&&(i.disabled_by||"user"===i.hidden_by||i.hidden||("config"===i.entity_category?a.push(i):"diagnostic"===i.entity_category&&r.push(i)));return{config:a,diagnostic:r}}_shortenName(e,t){if(!e)return e;const a=[],r=this.hass?.areas?.[this.areaId];if(r?.name&&a.push(r.name),t?.device_id){const e=this.hass?.devices?.[t.device_id],r=e?.name_by_user||e?.name;r&&a.push(r)}a.sort((e,t)=>t.length-e.length);let i=e,s=!0;for(;s;){s=!1;for(const e of a)i.toLowerCase().startsWith(e.toLowerCase())&&(i=i.slice(e.length).trim().replace(/^[-–:]\s*/,""),s=!0)}return i||e}_friendlyName(e,t){const a=e?.attributes?.friendly_name||t.entity_id.split(".").pop().replace(/_/g," ");return this._shortenName(a,t)}_shortDeviceName(e){const t=e?.name_by_user||e?.name||"";if(!t)return"Device";const a=this.hass?.areas?.[this.areaId];return a?.name&&t.toLowerCase().startsWith(a.name.toLowerCase())&&t.slice(a.name.length).trim().replace(/^[-–:]\s*/,"")||t}_isOff(e){return["off","unavailable","unknown","idle","standby","locked"].includes(e?.state)}_generatePanelCode(e){let t=5381;for(let a=0;a<e.length;a++)t=(t<<5)+t+e.charCodeAt(a)|0;const a=String(Math.abs(t)%1e6).padStart(6,"0");return`${a.slice(0,3)}-${a.slice(3)}`}_handleToggle(e){const t=e.split(".")[0];if("lock"===t){const t=this._getEntityState(e);this._callService("lock","locked"===t?.state?"unlock":"lock",{entity_id:e})}else"script"===t?this._callService("script","turn_on",{entity_id:e}):this._callService("homeassistant","toggle",{entity_id:e})}_getEntityIcon(e){return e?e.attributes?.icon?e.attributes.icon:{light:"mdi:lightbulb",switch:"mdi:toggle-switch",sensor:"mdi:eye",binary_sensor:"mdi:radiobox-blank",climate:"mdi:thermostat",cover:"mdi:window-shutter",fan:"mdi:fan",lock:"mdi:lock",camera:"mdi:video",media_player:"mdi:cast",automation:"mdi:robot",script:"mdi:script-text",update:"mdi:package-up"}[e.entity_id.split(".")[0]]||"mdi:information-outline":"mdi:help-circle-outline"}_partitionDeviceEntities(e){const t=[],a=[],r=[];for(const i of e)$.has(i.domain)?t.push(i):A.has(i.domain)?a.push(i):r.push(i);return{cameras:t,sensors:a,controls:r}}_getAllEntities(){const e=this.entities||this.group?.entities||[];if(!this.linkedEntities?.length)return e;const t=this.linkedEntities.map(e=>({...e,_linked:!0}));return[...e,...t]}get panelType(){return"unknown"}get defaultPanelTitle(){return"PANEL"}get frameColor(){return"var(--lcars-butterscotch)"}_getPanelName(){return this.group?.device?this._shortDeviceName(this.group.device)||this.defaultPanelTitle:this.devices?.length&&this._shortDeviceName(this.devices[0])||this.defaultPanelTitle}_getPanelCode(){const e=this.entities?.[0]?.entity?.entity_id||this.group?.entities?.[0]?.entity?.entity_id||this.group?.device?.id||this.areaId||"panel";return this._generatePanelCode(e)}static get styles(){return[e.AH`:host { display: block; }`]}renderBadge(){return e.qy``}renderContent(){return e.qy``}render(){return this.group||this.entities?.length?e.qy`
      <lcars-panel-frame
        panel-name="${this._getPanelName()}"
        panel-code="${this._getPanelCode()}"
        frame-color="${this.frameColor}"
        panel-type="${this.panelType}"
        frame-mode="${this.frameMode}">
        <span slot="badge">${this.renderBadge()}</span>
        ${this.renderContent()}
      </lcars-panel-frame>
    `:e.qy``}}const _e=e.AH`
  :host {
    display: block;
    --panel-frame-color: var(--lcars-ice);
  }

  /* ─── Main Grid: 4 rows ─── */

  .irr-content {
    display: grid;
    grid-template-areas:
      "alert    alert"
      "sidebar  zones"
      "quickrun quickrun"
      "controls controls";
    grid-template-columns: minmax(8rem, 1fr) minmax(16rem, 3fr);
    grid-template-rows: auto 1fr auto auto;
    gap: var(--lcars-gap);
  }

  /* ─── Rain Alert Banner ─── */

  .irr-rain-alert {
    grid-area: alert;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.35rem 0.75rem;
    background: color-mix(in srgb, var(--alert-color) 12%, transparent);
    border-left: 4px solid var(--alert-color);
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    color: var(--alert-color);
    text-transform: uppercase;
    animation: irr-banner-in 300ms ease-out;
  }

  .irr-rain-alert ha-icon {
    --mdc-icon-size: 1rem;
    color: var(--alert-color);
  }

  .irr-rain-alert-label {
    flex: 1;
  }

  .irr-rain-cancel-btn {
    border: none;
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    background: var(--lcars-tomato);
    color: var(--lcars-black);
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    text-transform: uppercase;
    padding: 0.2rem 0.6rem;
    cursor: pointer;
    min-height: 1.5rem;
  }

  .irr-rain-cancel-btn:focus-visible {
    outline: 2px solid var(--lcars-ice);
    outline-offset: 2px;
  }

  @keyframes irr-banner-in {
    from { opacity: 0; transform: translateY(-0.5rem); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ─── Sidebar: Schedules + Controller Status ─── */

  .irr-sidebar {
    grid-area: sidebar;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    overflow-y: auto;
  }

  .irr-section-label {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    color: var(--lcars-sunflower);
    text-transform: uppercase;
    padding-bottom: 0.15rem;
    border-bottom: 2px solid var(--lcars-gray);
    margin-bottom: 0.15rem;
  }

  /* ─── Schedule Strips ─── */

  .irr-schedules {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .irr-schedule-strip {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    flex-wrap: wrap;
  }

  .irr-schedule-toggle {
    min-width: 2.5rem;
    height: var(--lcars-btn-height, 2rem);
    border: none;
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    text-transform: uppercase;
    cursor: pointer;
    transition: background 200ms;
    background: var(--lcars-gray);
    color: var(--lcars-black);
  }

  .irr-schedule-toggle[data-on] {
    background: var(--lcars-ice);
  }

  .irr-schedule-toggle:focus-visible {
    outline: 2px solid var(--lcars-ice);
    outline-offset: 2px;
  }

  .irr-schedule-name {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    color: var(--lcars-space-white);
    text-transform: uppercase;
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .irr-schedule-type-badge {
    display: inline-block;
    padding: 0.1rem 0.4rem;
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    font-family: var(--lcars-font);
    font-size: 0.65rem;
    text-transform: uppercase;
    background: var(--lcars-butterscotch);
    color: var(--lcars-black);
  }

  .irr-schedule-type-badge[data-flex] {
    background: var(--lcars-african-violet);
  }

  .irr-schedule-duration {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    color: var(--lcars-gray);
    text-transform: uppercase;
  }

  /* ─── Controller Status ─── */

  .irr-controller-status {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .irr-status-row {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    text-transform: uppercase;
  }

  .irr-status-bar {
    display: inline-block;
    width: 1.5rem;
    height: 0.375rem;
    border-radius: 0.1875rem;
    flex-shrink: 0;
    transition: background 200ms;
  }

  .irr-status-bar[data-state="on"]     { background: var(--lcars-ice); }
  .irr-status-bar[data-state="off"]    { background: var(--lcars-gray); }
  .irr-status-bar[data-state="alert"]  { background: var(--lcars-tomato); animation: irr-pulse 1.5s ease-in-out infinite; }
  .irr-status-bar[data-state="active"] { background: var(--lcars-gold); }
  .irr-status-bar[data-state="delay"]  { background: var(--lcars-african-violet); }

  .irr-status-label {
    color: var(--lcars-space-white);
  }

  @keyframes irr-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  /* ─── Zone Grid ─── */

  .irr-zones {
    grid-area: zones;
    display: flex;
    flex-direction: column;
    gap: var(--lcars-gap);
    overflow-y: auto;
  }

  .irr-zone-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    position: relative;
    flex-wrap: wrap;
    min-height: 2.5rem;
  }

  .irr-zone-row:focus-visible {
    outline: 2px solid var(--lcars-ice);
    outline-offset: 2px;
  }

  /* ─── Zone Thumbnail ─── */

  .irr-zone-thumb {
    width: 2.5rem;
    height: 2rem;
    border-radius: var(--lcars-btn-radius);
    overflow: hidden;
    border: 2px solid var(--zone-border, var(--lcars-sunflower));
    flex-shrink: 0;
    position: relative;
    cursor: pointer;
    background: var(--lcars-black);
  }

  .irr-zone-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .irr-zone-thumb-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background: rgba(102, 102, 136, 0.15);
  }

  .irr-zone-thumb-fallback ha-icon {
    --mdc-icon-size: 1rem;
    color: var(--lcars-gray);
  }

  .irr-zone-num {
    position: absolute;
    bottom: 0;
    left: 0;
    padding: 0.05rem 0.25rem;
    background: rgba(0, 0, 0, 0.85);
    color: var(--lcars-sunflower);
    font-family: var(--lcars-font);
    font-size: 0.6rem;
    text-transform: uppercase;
    border-radius: 0 var(--lcars-btn-radius) 0 0;
    line-height: 1;
  }

  /* ─── Zone Button ─── */

  .irr-zone-btn {
    min-width: 4.5rem;
    height: var(--lcars-btn-height, 2rem);
    border: none;
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    background: var(--lcars-sunflower);
    color: var(--lcars-black);
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    text-transform: uppercase;
    cursor: pointer;
    transition: background 200ms;
  }

  .irr-zone-btn[data-on] { background: var(--lcars-ice); }
  .irr-zone-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .irr-zone-btn:focus-visible {
    outline: 2px solid var(--lcars-ice);
    outline-offset: 2px;
  }

  /* ─── Zone Info ─── */

  .irr-zone-info {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    min-width: 0;
  }

  .irr-zone-name {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    color: var(--lcars-space-white);
    text-transform: uppercase;
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .irr-zone-status {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    text-transform: uppercase;
    flex-shrink: 0;
  }

  .irr-zone-countdown {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    color: var(--lcars-ice);
    text-transform: uppercase;
    flex-shrink: 0;
    font-variant-numeric: tabular-nums;
  }

  /* ─── Zone Fill Bar — Barberpole Flow ─── */

  .irr-zone-fill {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 0.5rem;
    border-radius: 0.25rem;
    background: var(--lcars-ice);
    transition: width 1s linear;
  }

  .irr-zone-fill.active {
    background:
      repeating-linear-gradient(
        -45deg,
        var(--lcars-ice) 0px,
        var(--lcars-ice) 4px,
        rgba(153, 204, 255, 0.4) 4px,
        rgba(153, 204, 255, 0.4) 8px
      );
    background-size: 11.31px 100%;
    animation: irr-flow 0.6s linear infinite;
  }

  @keyframes irr-flow {
    from { background-position: 0 0; }
    to   { background-position: 11.31px 0; }
  }

  /* ─── Zone Detail Expansion ─── */

  .irr-zone-detail {
    flex-basis: 100%;
    padding: 0.25rem 0 0.25rem 3rem;
    animation: irr-expand 200ms ease-out;
  }

  .irr-zone-attrs {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .irr-zone-attr-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.15rem 0.5rem;
    background: rgba(102, 102, 136, 0.2);
    border-radius: 0 0.5rem 0.5rem 0;
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    color: var(--lcars-space-white);
    text-transform: uppercase;
  }

  .irr-zone-attr-badge ha-icon {
    --mdc-icon-size: 0.9rem;
    color: var(--badge-color, var(--lcars-sunflower));
  }

  .irr-zone-summary {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    color: var(--lcars-gray);
    text-transform: uppercase;
    padding-top: 0.15rem;
  }

  @keyframes irr-expand {
    from { opacity: 0; max-height: 0; }
    to   { opacity: 1; max-height: 4rem; }
  }

  /* ─── Quick Run Builder ─── */

  .irr-quickrun {
    grid-area: quickrun;
    border-top: 2px solid var(--lcars-gray);
    padding-top: 0.25rem;
  }

  .irr-quickrun-header {
    width: 100%;
    border: none;
    background: none;
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    color: var(--lcars-sunflower);
    text-transform: uppercase;
    cursor: pointer;
    text-align: left;
    padding: 0.25rem 0;
  }

  .irr-quickrun-header:focus-visible {
    outline: 2px solid var(--lcars-ice);
    outline-offset: 2px;
  }

  .irr-quickrun-body {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    padding: 0.25rem 0;
    animation: irr-expand 200ms ease-out;
  }

  .irr-quickrun-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .irr-quickrun-label {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    color: var(--lcars-gray);
    text-transform: uppercase;
    min-width: 5rem;
  }

  .irr-zone-selector,
  .irr-duration-selector {
    display: flex;
    gap: 0.25rem;
    flex-wrap: wrap;
  }

  .irr-zone-select-btn {
    width: 2rem;
    height: 2rem;
    border: none;
    border-radius: 0.25rem;
    background: var(--lcars-gray);
    color: var(--lcars-space-white);
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    cursor: pointer;
    transition: background 150ms;
    min-width: 2.5rem;
    min-height: 2.5rem;
  }

  .irr-zone-select-btn[data-selected] {
    background: var(--lcars-ice);
    color: var(--lcars-black);
  }

  .irr-zone-select-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .irr-zone-select-btn:focus-visible {
    outline: 2px solid var(--lcars-ice);
    outline-offset: 2px;
  }

  .irr-duration-btn {
    padding: 0.25rem 0.5rem;
    border: none;
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    background: var(--lcars-gray);
    color: var(--lcars-space-white);
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    cursor: pointer;
    transition: background 150ms;
    min-height: 2.5rem;
  }

  .irr-duration-btn[data-selected] {
    background: var(--lcars-ice);
    color: var(--lcars-black);
  }

  .irr-duration-btn:focus-visible {
    outline: 2px solid var(--lcars-ice);
    outline-offset: 2px;
  }

  .irr-engage-btn {
    min-width: 10rem;
    height: var(--lcars-btn-height, 2rem);
    border: none;
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    background: var(--lcars-butterscotch);
    color: var(--lcars-black);
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    text-transform: uppercase;
    cursor: pointer;
    transition: background 200ms;
    align-self: flex-start;
  }

  .irr-engage-btn:active { background: var(--lcars-gold); }
  .irr-engage-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .irr-engage-btn:focus-visible {
    outline: 2px solid var(--lcars-ice);
    outline-offset: 2px;
  }

  /* ─── Controls: Standby + Pause/Resume ─── */

  .irr-controls {
    grid-area: controls;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    padding: 0.25rem 0;
  }

  .irr-control-btn {
    min-width: 6rem;
    height: var(--lcars-btn-height, 2rem);
    border: none;
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    background: var(--lcars-sunflower);
    color: var(--lcars-black);
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    text-transform: uppercase;
    cursor: pointer;
    transition: background 200ms;
  }

  .irr-control-btn[data-on] { background: var(--lcars-gold); }

  .irr-control-btn:focus-visible {
    outline: 2px solid var(--lcars-ice);
    outline-offset: 2px;
  }

  .irr-pause-btn { background: var(--lcars-butterscotch); }
  .irr-stop-btn  { background: var(--lcars-tomato); }

  /* ─── Reduced Motion ─── */

  @media (max-width: 30rem) {
    .irr-content {
      grid-template-areas: "alert" "zones" "sidebar" "quickrun" "controls";
      grid-template-columns: 1fr;
      grid-template-rows: auto 1fr auto auto auto;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .irr-zone-fill.active,
    .irr-rain-alert,
    .irr-zone-detail,
    .irr-quickrun-body,
    .irr-status-bar[data-state="alert"] {
      animation: none !important;
    }
    .irr-zone-fill.active {
      background: var(--lcars-ice);
    }
  }
`,xe={"Full Sun":"mdi:weather-sunny","Mostly Sun":"mdi:weather-sunny","Half Shade":"mdi:weather-partly-cloudy","Full Shade":"mdi:weather-cloudy"},$e={"Cool Season Grass":"mdi:grass","Warm Season Grass":"mdi:grass",Trees:"mdi:tree",Shrubs:"mdi:flower",Perennials:"mdi:flower-tulip",Annuals:"mdi:flower","Ground Cover":"mdi:grass",Xeriscape:"mdi:cactus"},ke={Flat:"mdi:triangle-outline",Slight:"mdi:triangle-outline",Moderate:"mdi:triangle-outline",Steep:"mdi:triangle-outline"};customElements.get("lcars-irrigation-panel")||customElements.define("lcars-irrigation-panel",class extends we{#e=ae(5,1e4);static get properties(){return{...super.properties,_expandedZone:{type:String,attribute:!1},_quickRunOpen:{type:Boolean,attribute:!1},_quickRunZones:{type:Array,attribute:!1},_quickRunDuration:{type:Number,attribute:!1}}}constructor(){super(),this._expandedZone=null,this._quickRunOpen=!1,this._quickRunZones=[],this._quickRunDuration=10,this._countdownTimer=null}disconnectedCallback(){super.disconnectedCallback(),this._countdownTimer&&(clearInterval(this._countdownTimer),this._countdownTimer=null)}get panelType(){return"irrigation"}get defaultPanelTitle(){return"Irrigation"}get frameColor(){return"var(--lcars-ice)"}static get styles(){return[...super.styles,oe,le,_e]}_partitionIrrigationEntities(e=[]){const t=[],a=[],r=[],i=[];for(const s of e){const e=s.domain,n=s.entity?.entity_id||"",o=s.state?.attributes||{};"switch"!==e?"binary_sensor"!==e||i.push(s):null!=o["Zone number"]||null!=o.zone_number||/zone/i.test(n)?t.push(s):null!=o.Type||/schedule/i.test(n)?a.push(s):r.push(s)}return t.sort((e,t)=>(e.state?.attributes?.["Zone number"]??e.state?.attributes?.zone_number??999)-(t.state?.attributes?.["Zone number"]??t.state?.attributes?.zone_number??999)),{zones:t,schedules:a,controller:r,binarySensors:i}}_getZoneNumber(e){return e?.attributes?.["Zone number"]??e?.attributes?.zone_number??"?"}_getZoneProgress(e){if("on"!==e?.state)return 0;const t=e.attributes?.["Watering Duration seconds"];if(!t||t<=0)return 100;const a=new Date(e.last_changed).getTime(),r=(Date.now()-a)/1e3;return Math.min(100,r/t*100)}_getCountdown(e){if("on"!==e?.state)return"";const t=e.attributes?.["Watering Duration seconds"];if(!t||t<=0)return"";const a=new Date(e.last_changed).getTime(),r=(Date.now()-a)/1e3,i=Math.max(0,t-r),s=Math.floor(i/60),n=Math.floor(i%60);return`${String(s).padStart(2,"0")}:${String(n).padStart(2,"0")}`}_findControllerSwitch(e,t){return e.find(e=>"switch"===e.domain&&(e.entity?.entity_id||"").includes(t))}_findBinarySensor(e,t){return e.find(e=>(e.entity?.entity_id||"").includes(t))}_handleIrrigationZone(e,t){this.#e.allow()&&this._callService("switch",t?"turn_on":"turn_off",{entity_id:e})}_handleIrrigationToggle(e){this.#e.allow()&&this._callService("homeassistant","toggle",{entity_id:e})}_handlePause(){this.#e.allow()&&this._callService("rachio","pause_watering",{duration:60})}_handleResume(){this.#e.allow()&&this._callService("rachio","resume_watering",{})}_handleStopAll(){this.#e.allow()&&this._callService("rachio","stop_watering",{})}_toggleQuickRunZone(e){const t=this._quickRunZones.indexOf(e);this._quickRunZones=t>=0?[...this._quickRunZones.filter(t=>t!==e)]:[...this._quickRunZones,e]}_handleQuickRun(){if(!this.#e.allow())return;if(!this._quickRunZones.length||!this._quickRunDuration)return;if(!this.hass)return;const e=te(this._quickRunDuration,1,30);this.hass.callService("rachio","start_multiple_zone_schedule",{entity_id:this._quickRunZones,duration:Array(this._quickRunZones.length).fill(e)}),this._quickRunOpen=!1,this._quickRunZones=[]}renderBadge(){const{zones:t,controller:a}=this._partitionIrrigationEntities(this.group.entities),r=t.find(e=>"on"===e.state?.state),i=this._findControllerSwitch(a,"standby"),s="on"===i?.state?.state,n=r?"var(--lcars-ice)":s?"var(--lcars-gray)":"var(--lcars-sunflower)",o=r?`WATERING Z${this._getZoneNumber(r.state)}`:s?"STANDBY":"IDLE";return e.qy`<span style="color:${n}">${o}</span>`}renderContent(){const{zones:t,schedules:a,controller:r,binarySensors:i}=this._partitionIrrigationEntities(this.group.entities),s=t.find(e=>"on"===e.state?.state),n=this._findControllerSwitch(r,"standby"),o=this._findControllerSwitch(r,"rain_delay"),l="on"===n?.state?.state,c="on"===o?.state?.state,d=this._findBinarySensor(i,"connectivity"),p=this._findBinarySensor(i,"rain"),u="on"===d?.state?.state,m="on"===p?.state?.state;return s&&!this._countdownTimer?this._countdownTimer=setInterval(()=>this.requestUpdate(),1e3):!s&&this._countdownTimer&&(clearInterval(this._countdownTimer),this._countdownTimer=null),e.qy`
      <div class="irr-content">

        <!-- Rain Alert Banner (conditional) -->
        ${this._renderRainAlert(c,m,o)}

        <!-- Left column: schedules + controller status -->
        <div class="irr-sidebar">
          ${this._renderSchedules(a)}
          ${this._renderControllerStatus(u,l,c,m)}
        </div>

        <!-- Right column: zone grid -->
        <div class="irr-zones" role="list" aria-label="Irrigation zones">
          ${t.map(e=>this._renderZoneRow(e,l))}
        </div>

        <!-- Quick Run (collapsible) -->
        ${this._renderQuickRun(t,l)}

        <!-- Controls: standby + pause/resume -->
        ${this._renderControls(n,o,s)}
      </div>
    `}_renderRainAlert(t,a,r){if(!t&&!a)return"";const i=t,s=i?"mdi:weather-pouring":"mdi:weather-rainy",n=i?"RAIN DELAY ACTIVE":"RAIN DETECTED",o=i?"var(--lcars-african-violet)":"var(--lcars-ice)";return e.qy`
      <div class="irr-rain-alert" style="--alert-color:${o}"
           role="alert" aria-live="polite">
        <ha-icon icon="${s}"></ha-icon>
        <span class="irr-rain-alert-label">${n}</span>
        ${i?e.qy`
          <button class="irr-rain-cancel-btn"
            aria-label="Cancel rain delay"
            @click=${()=>this._handleIrrigationToggle(r.entity.entity_id)}>
            CANCEL
          </button>
        `:""}
      </div>
    `}_renderSchedules(t){return t.length?e.qy`
      <div class="irr-schedules" role="list" aria-label="Irrigation schedules">
        <div class="irr-section-label">SCHEDULES</div>
        ${t.map(({entity:t,state:a})=>{const r=this._friendlyName(a,t),i=!1!==a.attributes?.Enabled&&"off"!==a.state,s=a.attributes?.Type||"Fixed",n=a.attributes?.Duration||"",o=/flex/i.test(s);return e.qy`
            <div class="irr-schedule-strip" role="listitem">
              <button class="irr-schedule-toggle" ?data-on=${i}
                aria-label="${r}: ${i?"enabled":"disabled"}"
                @click=${()=>this._handleIrrigationToggle(t.entity_id)}>
                ${i?"ON":"OFF"}
              </button>
              <span class="irr-schedule-name">${r}</span>
              <span class="irr-schedule-type-badge" ?data-flex=${o}>
                ${o?"FLEX":"FIXED"}
              </span>
              <span class="irr-schedule-duration">${n}</span>
            </div>
          `})}
      </div>
    `:""}_renderControllerStatus(t,a,r,i){return e.qy`
      <div class="irr-controller-status">
        <div class="irr-section-label">CONTROLLER</div>
        <div class="irr-status-row">
          <span class="irr-status-bar" data-state="${t?"on":"alert"}"></span>
          <span class="irr-status-label">${t?"ONLINE":"OFFLINE"}</span>
        </div>
        <div class="irr-status-row">
          <span class="irr-status-bar" data-state="${a?"active":"off"}"></span>
          <span class="irr-status-label">STANDBY ${a?"ON":"OFF"}</span>
        </div>
        <div class="irr-status-row">
          <span class="irr-status-bar" data-state="${r?"delay":"off"}"></span>
          <span class="irr-status-label">RAIN DELAY ${r?"ON":"OFF"}</span>
        </div>
        <div class="irr-status-row">
          <span class="irr-status-bar" data-state="${i?"on":"off"}"></span>
          <span class="irr-status-label">${i?"RAIN":"NO RAIN"}</span>
        </div>
      </div>
    `}_renderZoneRow(t,a){const{entity:r,state:s}=t,n=r.entity_id,o=this._friendlyName(s,r),l="on"===s.state,c=(0,J.aK)(s.state,a),d=this._getZoneNumber(s),p=this._getZoneProgress(s),u=this._getCountdown(s),m=s.attributes?.entity_picture,h=this._expandedZone===n;return e.qy`
      <div class="irr-zone-row ${l?"active":""}" role="listitem">
        <!-- Zone photo thumbnail or fallback -->
        <div class="irr-zone-thumb"
             style="--zone-border:${c}"
             @click=${()=>(0,i.Hv)(n)}>
          ${m?e.qy`
            <img src="${m}" alt="${o} zone photo"
                 loading="lazy" referrerpolicy="no-referrer"
                 @error=${e=>{e.target.style.display="none",e.target.nextElementSibling.style.display="flex"}}>
            <span class="irr-zone-thumb-fallback" style="display:none">
              <ha-icon icon="${$e[s.attributes?.Type]||"mdi:grass"}"></ha-icon>
            </span>
          `:e.qy`
            <span class="irr-zone-thumb-fallback">
              <ha-icon icon="${$e[s.attributes?.Type]||"mdi:grass"}"></ha-icon>
            </span>
          `}
          <span class="irr-zone-num">${d}</span>
        </div>

        <!-- Zone action button -->
        <button class="irr-zone-btn" ?data-on=${l}
          ?disabled=${a}
          aria-label="${l?"Stop":"Start"} watering ${o}"
          @click=${()=>this._handleIrrigationZone(n,!l)}>
          ${l?"STOP":"START"}
        </button>

        <!-- Zone info -->
        <div class="irr-zone-info"
             @click=${()=>{this._expandedZone=h?null:n}}>
          <span class="irr-zone-name">${o}</span>
          <span class="irr-zone-status" style="color:${c}">
            ${a?"STANDBY":l?"WATERING":"IDLE"}
          </span>
        </div>

        <!-- Countdown timer (when active) -->
        ${u?e.qy`
          <span class="irr-zone-countdown">${u}</span>
        `:""}

        <!-- Active zone fill bar (barberpole) -->
        ${l?e.qy`
          <div class="irr-zone-fill active" role="progressbar"
            aria-label="Watering progress" aria-valuemin="0" aria-valuemax="100"
            aria-valuenow="${Math.round(p)}"
            style="width:${p}%"></div>
        `:""}

        <!-- Expanded detail row -->
        ${h?this._renderZoneDetail(s):""}
      </div>
    `}_renderZoneDetail(t){const a=t.attributes||{},r=a.Shade,i=a.Type,s=a.Slope,n=a.Summary,o=[];return r&&o.push({icon:xe[r]||"mdi:weather-sunny",label:r,color:"var(--lcars-sunflower)"}),i&&o.push({icon:$e[i]||"mdi:grass",label:i,color:"var(--lcars-ice)"}),s&&o.push({icon:ke[s]||"mdi:triangle-outline",label:s,color:"var(--lcars-butterscotch)"}),e.qy`
      <div class="irr-zone-detail">
        <div class="irr-zone-attrs">
          ${o.map(t=>e.qy`
            <span class="irr-zone-attr-badge" style="--badge-color:${t.color}">
              <ha-icon icon="${t.icon}"></ha-icon>
              ${t.label}
            </span>
          `)}
        </div>
        ${n?e.qy`<div class="irr-zone-summary">${n}</div>`:""}
      </div>
    `}_renderQuickRun(t,a){return e.qy`
      <div class="irr-quickrun">
        <button class="irr-quickrun-header"
          aria-expanded="${this._quickRunOpen}"
          @click=${()=>{this._quickRunOpen=!this._quickRunOpen}}>
          QUICK RUN ${this._quickRunOpen?"▾":"▸"}
        </button>
        ${this._quickRunOpen?e.qy`
          <div class="irr-quickrun-body">
            <!-- Zone selector -->
            <div class="irr-quickrun-row">
              <span class="irr-quickrun-label">ZONES</span>
              <div class="irr-zone-selector">
                ${t.map(({entity:t,state:r})=>{const i=this._getZoneNumber(r),s=t.entity_id,n=this._quickRunZones.includes(s);return e.qy`
                    <button class="irr-zone-select-btn" ?data-selected=${n}
                      ?disabled=${a}
                      aria-label="Zone ${i}" aria-pressed="${n}"
                      @click=${()=>this._toggleQuickRunZone(s)}>
                      ${i}
                    </button>
                  `})}
              </div>
            </div>
            <!-- Duration selector -->
            <div class="irr-quickrun-row">
              <span class="irr-quickrun-label">DURATION</span>
              <div class="irr-duration-selector">
                ${[3,5,10,15,20].map(t=>e.qy`
                  <button class="irr-duration-btn" ?data-selected=${this._quickRunDuration===t}
                    aria-label="${t} minutes" aria-pressed="${this._quickRunDuration===t}"
                    @click=${()=>{this._quickRunDuration=t}}>
                    ${t}M
                  </button>
                `)}
              </div>
            </div>
            <!-- Engage -->
            <button class="irr-engage-btn"
              ?disabled=${!this._quickRunZones.length||a}
              aria-label="Start quick run: ${this._quickRunZones.length} zones for ${this._quickRunDuration} minutes"
              @click=${()=>this._handleQuickRun()}>
              ENGAGE
            </button>
          </div>
        `:""}
      </div>
    `}_renderControls(t,a,r){return e.qy`
      <div class="irr-controls">
        ${t?e.qy`
          <button class="irr-control-btn" ?data-on=${"on"===t.state?.state}
            role="switch" aria-checked="${"on"===t.state?.state}"
            aria-label="Standby mode: ${"on"===t.state?.state?"active":"inactive"}"
            @click=${()=>this._handleIrrigationToggle(t.entity.entity_id)}>
            STANDBY
          </button>
        `:""}
        ${a?e.qy`
          <button class="irr-control-btn" ?data-on=${"on"===a.state?.state}
            aria-label="Rain delay: ${"on"===a.state?.state?"active, click to cancel":"inactive, click to activate 24 hour delay"}"
            @click=${()=>this._handleIrrigationToggle(a.entity.entity_id)}>
            RAIN DELAY
          </button>
        `:""}
        ${r?e.qy`
          <button class="irr-control-btn irr-pause-btn"
            aria-label="Pause watering for 60 minutes"
            @click=${()=>this._handlePause()}>
            PAUSE
          </button>
          <button class="irr-control-btn irr-stop-btn"
            aria-label="Stop all watering"
            @click=${()=>this._handleStopAll()}>
            STOP ALL
          </button>
        `:""}
      </div>
    `}});const Se=e.AH`
  :host {
    display: block;
    --panel-frame-color: var(--lcars-butterscotch);
    --media-aspect: 16/9;
  }

  .camera-content {
    display: grid;
    grid-template-columns: minmax(10rem, 14rem) minmax(18rem, 1fr);
    grid-template-rows: 1fr auto;
    grid-template-areas:
      "sensors media"
      "controls controls";
    gap: var(--lcars-gap);
  }

  /* Sensor readouts — left column */
  .device-panel-sensors {
    grid-area: sensors;
    display: flex;
    flex-direction: column;
    gap: var(--lcars-gap);
    overflow-y: auto;
    max-height: 20rem;
    padding: 0.25rem;
  }

  /* Media viewscreen — right column */
  .device-panel-media {
    grid-area: media;
    position: relative;
    border: 3px solid var(--panel-frame-color);
    border-radius: 0.5rem;
    overflow: hidden;
    background: var(--lcars-black);
    aspect-ratio: var(--media-aspect);
  }
  .device-panel-media img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .device-panel-media[data-offline] {
    border-color: var(--lcars-gray);
  }

  /* Control buttons — bottom row */
  .device-panel-controls {
    grid-area: controls;
    display: flex;
    flex-wrap: wrap;
    gap: var(--lcars-gap);
    padding: 0.25rem 0;
  }
  .device-control-btn {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    height: 2.25rem;
    padding: 0 0.75rem;
    background: var(--lcars-sunflower);
    color: var(--lcars-black);
    border: none;
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    text-transform: uppercase;
    cursor: pointer;
    transition: filter var(--lcars-transition), background var(--lcars-transition);
    white-space: nowrap;
  }
  .device-control-btn:hover { filter: brightness(1.15); }
  .device-control-btn:focus-visible {
    outline: 2px solid var(--lcars-ice);
    outline-offset: 2px;
  }
  .device-control-btn ha-icon { --mdc-icon-size: 16px; flex-shrink: 0; }
  .device-control-btn[data-on] { background: var(--lcars-gold); }
  .device-control-btn[data-off] { background: var(--lcars-gray); color: var(--lcars-space-white); }

  /* ═══ Camera Feed ═══ */
  .camera-frame {
    position: relative;
    border: 3px solid var(--lcars-butterscotch);
    border-radius: 0.75rem;
    overflow: hidden;
    background: var(--lcars-black);
    cursor: pointer;
    transition: border-color var(--lcars-transition);
  }
  .camera-frame:hover { border-color: var(--lcars-gold); }
  .camera-frame:focus-visible {
    outline: 2px solid var(--lcars-ice);
    outline-offset: 2px;
  }
  .camera-frame img {
    width: 100%;
    display: block;
    aspect-ratio: 16/9;
    object-fit: cover;
    background: var(--lcars-black);
    position: relative;
    z-index: 0;
  }
  .camera-label {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 0.75rem;
    background: linear-gradient(transparent, rgba(0,0,0,0.85));
    color: var(--lcars-sunflower);
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    text-transform: uppercase;
    z-index: 3;
  }
  .camera-label ha-icon { --mdc-icon-size: 14px; }
  .camera-label .cam-state {
    margin-left: auto;
    font-size: 0.65rem;
    color: var(--lcars-space-white);
    opacity: 0.7;
  }

  /* Camera state overlays */
  .camera-connecting-overlay,
  .camera-offline-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    background: var(--lcars-black);
    z-index: 2;
    transition: opacity 300ms ease-out, visibility 300ms ease-out;
  }
  .camera-connecting-text {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    color: var(--lcars-ice);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    animation: lcars-viewscreen-breathe 4s ease-in-out infinite;
  }
  @keyframes lcars-viewscreen-breathe {
    0%, 100% { opacity: 1; }
    50%      { opacity: 0.4; }
  }
  .camera-offline-overlay ha-icon {
    --mdc-icon-size: 32px;
    color: var(--lcars-tomato);
  }
  .camera-offline-text {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    color: var(--lcars-tomato);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  /* State-driven visibility */
  .camera-frame[data-state="live"] .camera-connecting-overlay,
  .camera-frame[data-state="offline"] .camera-connecting-overlay {
    opacity: 0;
    visibility: hidden;
  }
  .camera-frame[data-state="connecting"] .camera-offline-overlay,
  .camera-frame[data-state="live"] .camera-offline-overlay {
    opacity: 0;
    visibility: hidden;
  }
  .camera-frame[data-state="offline"] {
    border-color: var(--lcars-tomato);
    opacity: 1;
  }
  .camera-frame[data-state="offline"]:hover { border-color: var(--lcars-gold); }
  .camera-frame[data-state="connecting"] img { opacity: 0; }
  .camera-frame[data-state="offline"] img { opacity: 0; }
  .camera-spacer { aspect-ratio: 16/9; }
  .device-panel-media .camera-frame {
    border: none;
    border-radius: 0;
    width: 100%;
    height: 100%;
  }

  /* Viewscreen activation animation */
  @keyframes viewscreen-activate {
    0%   { clip-path: inset(50% 0 50% 0); filter: brightness(2) saturate(0); }
    40%  { clip-path: inset(10% 0 10% 0); filter: brightness(1.5) saturate(0.3); }
    100% { clip-path: inset(0 0 0 0); filter: brightness(1) saturate(1); }
  }
  .camera-frame[data-state="live"] img {
    animation: viewscreen-activate 600ms ease-out both;
  }
  .camera-frame[data-state="offline"] img {
    filter: saturate(0) brightness(0.3);
    animation: none;
  }

  .device-panel-media img {
    animation: viewscreen-activate 600ms ease-out both;
  }
  .device-panel-media[data-offline] img {
    filter: saturate(0) brightness(0.3);
    animation: none;
  }

  @media (max-width: 30rem) {
    .camera-content {
      grid-template-areas: "media" "sensors" "controls";
      grid-template-columns: 1fr;
      grid-template-rows: auto auto auto;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .camera-connecting-text { animation: none; }
    .camera-frame[data-state="live"] img { animation: none; }
    .device-panel-media img { animation: none; }
  }
`;customElements.get("lcars-camera-panel")||customElements.define("lcars-camera-panel",class extends we{get panelType(){return"camera"}get defaultPanelTitle(){return"Camera"}get frameColor(){return"var(--lcars-butterscotch)"}static get styles(){return[...super.styles,oe,le,Se]}renderContent(){const{cameras:t,sensors:a,controls:r}=this._partitionDeviceEntities(this.group.entities),i=this._shortDeviceName(this.group.device);return e.qy`
      <div class="camera-content">
        <div class="device-panel-sensors" role="list" aria-label="${i} sensors">
          ${a.map(({entity:t,state:a})=>{const r=this._friendlyName(a,t),i=a.state,s=a.attributes?.unit_of_measurement||"",n=this._getSensorIndicatorColor(a);return e.qy`
              <lcars-sensor-row
                label="${r}"
                value="${i}${s?" "+s:""}"
                color="${n}"
                entity-id="${t.entity_id}">
              </lcars-sensor-row>
            `})}
        </div>

        <div class="device-panel-media"
          ?data-offline=${t.length>0&&this._isOff(t[0].state)}>
          ${t.map(({entity:t,state:a},r)=>{const s=function(e){const t=e?.attributes?.entity_picture;if(!t)return"";const a=e.last_updated||e.last_changed||"",r=t.includes("?")?"&":"?";return`${t}${r}_cb=${encodeURIComponent(a)}`}(a),n=0===r?i:this._friendlyName(a,t),o=this._isOff(a)||!s?"offline":"connecting";return e.qy`
              <div class="camera-frame" data-state="${o}"
                style="${r>0?"margin-top:var(--lcars-gap);border-top:2px solid var(--panel-frame-color)":""}"
                aria-busy="${"connecting"===o}"
                @click=${()=>this._handleEntityClick(t.entity_id)}>
                <div class="camera-connecting-overlay" aria-hidden="true">
                  <span class="camera-connecting-text">ESTABLISHING LINK</span>
                </div>
                <div class="camera-offline-overlay" aria-hidden="true">
                  <ha-icon icon="mdi:video-off"></ha-icon>
                  <span class="camera-offline-text">VIEWSCREEN OFFLINE</span>
                </div>
                ${s?e.qy`<img src="${s}" alt="${n} camera feed"
                              data-entity="${t.entity_id}"
                              .src=${s}
                              @load=${e=>{const t=e.target.closest(".camera-frame");t&&(t.setAttribute("data-state","live"),t.removeAttribute("aria-busy"))}}
                              @error=${e=>{const t=e.target.closest(".camera-frame");t&&(t.setAttribute("data-state","offline"),t.removeAttribute("aria-busy"))}} />`:e.qy`<div class="camera-spacer"></div>`}
              </div>`})}
        </div>

        <div class="device-panel-controls" aria-label="${i} controls">
          ${r.map(({entity:t,state:a})=>{const r=this._friendlyName(a,t),i="on"===a.state,s=this._isOff(a),n=t.entity_id.split(".")[0];return e.qy`
              <button class="device-control-btn" ?data-on=${i} ?data-off=${s}
                @click=${()=>z.has(n)?this._handleToggle(t.entity_id):this._handleEntityClick(t.entity_id)}
                title="${r}: ${a.state}"
                aria-label="${r}: ${a.state}">
                <ha-icon .icon=${this._getEntityIcon(a)}></ha-icon>
                <span>${r}</span>
              </button>
            `})}
        </div>
      </div>
    `}});const Ce=e.AH`
  :host {
    display: block;
  }

  /* ═══ Device Panel Frame (shared base) ═══ */
  .lcars-device-panel {
    --panel-frame-color: var(--lcars-butterscotch);
    display: grid;
    gap: var(--lcars-gap);
    width: 100%;
    max-width: 42rem;
    border-left: 4px solid var(--panel-frame-color);
    border-bottom: 4px solid var(--panel-frame-color);
    border-top: 2px solid var(--panel-frame-color);
    border-right: 2px solid var(--panel-frame-color);
    border-radius: 0.75rem 0.25rem 0.25rem 0.75rem;
    padding: var(--lcars-gap);
    background: var(--lcars-black);
    position: relative;
  }
  .lcars-device-panel::before {
    content: '';
    position: absolute;
    top: -2px; left: -4px;
    width: 1.5rem; height: 1.5rem;
    border-top: 4px solid var(--panel-frame-color);
    border-left: 4px solid var(--panel-frame-color);
    border-radius: 0.75rem 0 0 0;
    pointer-events: none;
  }
  .lcars-device-panel::after {
    content: '';
    position: absolute;
    bottom: -4px; right: -2px;
    width: 1.5rem; height: 1.5rem;
    border-bottom: 4px solid var(--panel-frame-color);
    border-right: 2px solid var(--panel-frame-color);
    border-radius: 0 0 0.25rem 0;
    pointer-events: none;
  }

  /* ═══ Environment Panel Grid ═══ */
  .env-content {
    display: grid;
    grid-template-areas:
      "sensors core controls"
      "sparklines sparklines sparklines";
    grid-template-columns: 1fr auto 1fr;
    grid-template-rows: auto auto;
    gap: var(--lcars-gap);
    overflow: hidden;
    min-width: 0;
  }
  .env-content.sensor-only {
    grid-template-areas:
      "sensors core"
      "sparklines sparklines";
    grid-template-columns: 1fr auto;
  }

  /* Header */
  .env-header {
    grid-area: header;
    display: flex;
    align-items: center;
    gap: var(--lcars-gap);
    padding: 0.25rem 0.5rem;
  }
  .device-panel-name {
    font-size: var(--lcars-font-size-sub);
    color: var(--panel-frame-color);
    text-transform: uppercase;
    white-space: nowrap;
  }
  .device-panel-header-line {
    flex: 1;
    height: 2px;
    background: var(--panel-frame-color);
    opacity: 0.5;
  }
  .env-score-label {
    font-size: 1.25rem;
    font-weight: bold;
    white-space: nowrap;
  }
  .panel-numeric-code {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    color: var(--panel-frame-color);
    opacity: 0.7;
    white-space: nowrap;
  }

  /* Sensors (left column) */
  .env-sensors {
    grid-area: sensors;
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    padding: 0.25rem 0.5rem;
    overflow-y: auto;
    min-width: 0;
  }
  .device-sensor-line {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.5rem;
    cursor: pointer;
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    transition: background var(--lcars-transition);
    font-size: var(--lcars-font-size-data);
    text-transform: uppercase;
  }
  .device-sensor-line:hover { background: rgba(255,255,255,0.05); }
  .device-sensor-line:focus-visible {
    outline: 2px solid var(--lcars-ice);
    outline-offset: 2px;
  }
  .sensor-indicator {
    width: 0.5rem; height: 0.5rem;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .sensor-label {
    flex: 1;
    color: var(--lcars-space-white);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.75rem;
  }
  .sensor-state-value {
    flex-shrink: 1;
    font-weight: 700;
    font-size: var(--lcars-font-size-data);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Section dividers */
  .battery-section-divider {
    height: 1px;
    background: var(--lcars-gray);
    opacity: 0.3;
    margin: 0.375rem 0;
  }
  .battery-section-label {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-label, 0.75rem);
    color: var(--lcars-sky, #aaaaff);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 0 0.5rem;
    margin-bottom: 0.125rem;
  }

  /* Controls (right column) */
  .env-controls {
    grid-area: controls;
    display: flex;
    flex-direction: column;
    gap: var(--lcars-gap);
    padding: 0.25rem 0.5rem;
    border-left: 2px solid var(--panel-frame-color);
    min-width: 0;
    overflow: hidden;
  }
  .device-control-btn {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    height: 2.25rem;
    padding: 0 0.75rem;
    background: var(--lcars-sunflower);
    color: var(--lcars-black);
    border: none;
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    text-transform: uppercase;
    cursor: pointer;
    transition: filter var(--lcars-transition), background var(--lcars-transition);
    white-space: nowrap;
  }
  .device-control-btn:hover { filter: brightness(1.15); }
  .device-control-btn:focus-visible {
    outline: 2px solid var(--lcars-ice);
    outline-offset: 2px;
  }
  .device-control-btn ha-icon { --mdc-icon-size: 16px; flex-shrink: 0; }
  .device-control-btn[data-on] { background: var(--lcars-gold); }
  .device-control-btn[data-off] { background: var(--lcars-gray); color: var(--lcars-space-white); }

  /* LCARS Option Strip */
  .lcars-option-strip {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    padding: 0.125rem 0;
  }
  .lcars-option-strip-label {
    font-size: 0.65rem;
    color: var(--lcars-space-white, #f5f6fa);
    text-transform: uppercase;
    padding: 0 0.25rem;
    margin-bottom: 0.125rem;
  }
  .lcars-option-strip-btns {
    display: flex;
    flex-wrap: wrap;
    gap: 2px;
  }
  .lcars-option-btn {
    display: flex;
    align-items: center;
    height: 1.5rem;
    padding: 0 0.75rem;
    background: var(--lcars-gray);
    color: var(--lcars-space-white, #f5f6fa);
    border: none;
    border-radius: 0 0.75rem 0.75rem 0;
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-label, 0.75rem);
    text-transform: uppercase;
    cursor: pointer;
    transition: filter 0.2s, background 0.2s;
    user-select: none;
    white-space: nowrap;
  }
  .lcars-option-btn:hover { filter: brightness(1.2); }
  .lcars-option-btn:focus-visible {
    outline: 2px solid var(--lcars-ice);
    outline-offset: 2px;
  }
  .lcars-option-btn[data-selected] {
    background: var(--lcars-gold, var(--lcars-butterscotch));
    color: var(--lcars-black, #000);
  }

  /* ═══ Atmoscrubber Cylinder ═══ */
  .atmoscrubber-container {
    grid-area: core;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 0;
    min-height: 10rem;
  }
  .atmoscrubber {
    position: relative;
    width: 4rem;
    height: 100%;
    min-height: 10rem;
    border-radius: 2rem;
    border: 2px solid hsl(var(--scrubber-hue, 120), 70%, 60%);
    background: var(--lcars-black);
    overflow: hidden;
    transition: border-color 1s ease, box-shadow 1s ease;
    box-shadow: 0 0 8px hsla(var(--scrubber-hue, 120), 70%, 50%, 0.3);
  }
  .atmoscrubber::before,
  .atmoscrubber::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background-image:
      radial-gradient(circle 3px, hsla(var(--scrubber-hue, 120), 80%, 65%, 0.8) 50%, transparent 51%),
      radial-gradient(circle 2px, hsla(var(--scrubber-hue, 120), 80%, 65%, 0.8) 50%, transparent 51%),
      radial-gradient(circle 2.5px, hsla(var(--scrubber-hue, 120), 80%, 65%, 0.8) 50%, transparent 51%),
      radial-gradient(circle 2px, hsla(var(--scrubber-hue, 120), 80%, 65%, 0.8) 50%, transparent 51%);
    background-size: 100% 3rem;
    background-position: 25% 0, 65% 33%, 40% 60%, 80% 85%;
    background-repeat: repeat-y;
    animation: scrubber-flow var(--scrubber-speed, 20s) linear infinite;
  }
  .atmoscrubber::after {
    opacity: 0.4;
    background-size: 100% 2.5rem;
    background-position: 15% 10%, 55% 50%, 75% 75%;
    background-image:
      radial-gradient(circle 2px, hsla(var(--scrubber-hue, 120), 80%, 65%, 0.6) 50%, transparent 51%),
      radial-gradient(circle 1.5px, hsla(var(--scrubber-hue, 120), 80%, 65%, 0.6) 50%, transparent 51%),
      radial-gradient(circle 2px, hsla(var(--scrubber-hue, 120), 80%, 65%, 0.6) 50%, transparent 51%);
    animation-duration: calc(var(--scrubber-speed, 20s) * 1.4);
  }
  @keyframes scrubber-flow {
    from { background-position-y: 0; }
    to { background-position-y: -3rem; }
  }
  .atmoscrubber.scrubber-idle {
    opacity: 0.5;
    animation: scrubber-idle-glow 3s ease-in-out infinite;
  }
  .atmoscrubber.scrubber-idle::before,
  .atmoscrubber.scrubber-idle::after {
    opacity: 0.2;
  }
  @keyframes scrubber-idle-glow {
    0%, 100% { box-shadow: 0 0 4px hsla(var(--scrubber-hue, 120), 70%, 50%, 0.15); }
    50% { box-shadow: 0 0 12px hsla(var(--scrubber-hue, 120), 70%, 50%, 0.35); }
  }
  .scrubber-score {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    font-weight: bold;
    color: var(--lcars-space-white);
    z-index: 1;
    text-shadow: 0 0 4px rgba(0,0,0,0.8);
  }

  /* Sparklines (bottom row) */
  .env-sparklines {
    grid-area: sparklines;
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
    padding: 0.25rem 0.5rem;
    border-top: 2px solid var(--panel-frame-color);
  }
  .env-sparkline-wrap {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    min-width: 6rem;
    flex: 1 1 auto;
  }
  .env-sparkline-label {
    font-size: var(--lcars-font-size-label, 0.75rem);
    color: var(--lcars-space-white);
    text-transform: uppercase;
    white-space: nowrap;
    width: 3rem;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .env-sparkline {
    width: 100%;
    height: 1.5rem;
    display: block;
  }

  .panel-pip-strip {
    position: absolute;
    bottom: 4px; right: 4px;
    width: 2rem; height: 3px;
    background: var(--panel-frame-color);
    border-radius: 1.5px;
    opacity: 0.3;
  }

  @media (max-width: 30rem) {
    .env-content {
      grid-template-areas: "core" "sensors" "controls" "sparklines";
      grid-template-columns: 1fr;
      grid-template-rows: auto auto auto auto;
    }
    .env-content.sensor-only {
      grid-template-areas: "core" "sensors" "sparklines";
      grid-template-columns: 1fr;
      grid-template-rows: auto auto auto;
    }
    .atmoscrubber-container {
      min-height: 6rem;
    }
    .atmoscrubber {
      width: 100%;
      height: 4rem;
      min-height: 4rem;
      border-radius: 2rem;
    }
    .env-controls {
      border-left: none;
      border-top: 2px solid var(--panel-frame-color);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .atmoscrubber::before,
    .atmoscrubber::after,
    .atmoscrubber.scrubber-idle { animation: none; }
  }
`;customElements.get("lcars-environment-panel")||customElements.define("lcars-environment-panel",class extends we{_envHistoryCache=new Map;get panelType(){return"environment"}get defaultPanelTitle(){return"Environment"}get frameColor(){return"var(--lcars-blue)"}static get styles(){return[...super.styles,oe,le,Ce]}_partitionEnvironmentEntities(e,t){const a=[],r=[],i=[],s=[],n=[];for(const t of e){const e=t.state?.attributes?.device_class||"",n=t.domain;["fan","switch","button","number","select","light"].includes(n)?s.push(t):P.has(e)?r.push(t):e||"sensor"!==n||!T.test(t.entity.entity_id)?i.push(t):a.push(t)}if(t)for(const e of[...t.diagnostic,...t.config]){const t=this._getEntityState(e.entity_id);t&&n.push({entity:e,domain:e.entity_id.split(".")[0],state:t})}return{score:a,airQuality:r,telemetry:i,controls:s,diagnostics:n}}_getScrubberHue(e){return null==e||e<=50?120:e<=100?120-(e-50)/50*70:e<=150?50-(e-100)/50*35:Math.max(0,15-(e-150)/100*15)}_getAQColor(e){return null==e||e<=50?"var(--lcars-ice)":e<=100?"var(--lcars-sunflower)":e<=150?"var(--lcars-butterscotch)":e<=200?"var(--lcars-peach)":"var(--lcars-tomato)"}_getScrubberSpeed(e){return null==e||0===e?20:2+18*Math.pow(1-e/100,1.5)}async _getSparklineData(e,t){return(0,ie.s)(this.hass,e,t,this._envHistoryCache)}_renderSparkline(e,t,a){return(0,ie.K)(e,{color:t,label:a,className:"env-sparkline"})}renderBadge(){const{score:t,airQuality:a}=this._partitionEnvironmentEntities(this.group.entities,this._getDeviceCategoryEntities(this.group.device.id)),r=t[0],i=r?parseFloat(r.state.state):null,s=a.find(e=>"pm25"===(e.state?.attributes?.device_class||"")),n=s?parseFloat(s.state.state):null,o=null!=i&&Number.isFinite(i)?i:null!=n&&Number.isFinite(n)?Math.min(300,4*n):null,l=this._getAQColor(o);return r?e.qy`<span style="color:${l}">${null!=i&&Number.isFinite(i)?Math.round(i):"—"}</span>`:e.qy``}renderContent(){const t=this._getDeviceCategoryEntities(this.group.device.id),{score:a,airQuality:r,telemetry:i,controls:s,diagnostics:n}=this._partitionEnvironmentEntities(this.group.entities,t),o=this._shortDeviceName(this.group.device)||"Environment",l=a[0],c=l?parseFloat(l.state.state):null,d=r.find(e=>"pm25"===(e.state?.attributes?.device_class||"")),p=d?parseFloat(d.state.state):null,u=null!=c&&Number.isFinite(c)?c:null!=p&&Number.isFinite(p)?Math.min(300,4*p):null,m=this._getScrubberHue(u),h=this._getAQColor(u),v=s.find(e=>"fan"===e.domain),f=v?.state,g=f?.attributes?.percentage??null,b=f?.attributes?.preset_modes||[],y=f?.attributes?.preset_mode||"",w=!v||"off"===f?.state||0===g,_=this._getScrubberSpeed(w?0:g),x=!v,$=s.filter(e=>"fan"!==e.domain),k=[...a,...r].map(e=>e.entity.entity_id);k.length>0&&this._getSparklineData(this.group.device.id,k).then(e=>{e&&this.requestUpdate()});const S=this._envHistoryCache.get(this.group.device.id)?.data||{};return e.qy`
      <div class="env-content ${x?"sensor-only":""}">
        <!-- Sensors (left) -->
        <div class="env-sensors" role="list" aria-label="${o} sensors">
          ${r.map(({entity:t,state:a})=>{const r=this._friendlyName(a,t),i=a.state,s=a.attributes?.unit_of_measurement||"",n=this._getSensorIndicatorColor(a);return e.qy`
              <lcars-sensor-row
                label="${r}"
                value="${i}${s?" "+s:""}"
                color="${n}"
                entity-id="${t.entity_id}">
              </lcars-sensor-row>
            `})}
          ${i.map(({entity:t,state:a})=>{const r=this._friendlyName(a,t),i=a.state,s=a.attributes?.unit_of_measurement||"",n=this._getSensorIndicatorColor(a);return e.qy`
              <lcars-sensor-row
                label="${r}"
                value="${i}${s?" "+s:""}"
                color="${n}"
                entity-id="${t.entity_id}">
              </lcars-sensor-row>
            `})}
          ${n.length>0?e.qy`
            <lcars-section-divider label="DIAGNOSTICS"></lcars-section-divider>
            ${n.map(({entity:t,state:a})=>{const r=this._friendlyName(a,t),i=a.state,s=a.attributes?.unit_of_measurement||"",n=this._getSensorIndicatorColor(a);return e.qy`
                <lcars-sensor-row
                  label="${r}"
                  value="${i}${s?" "+s:""}"
                  color="${n}"
                  entity-id="${t.entity_id}">
                </lcars-sensor-row>
              `})}
          `:""}
        </div>

        <!-- Atmoscrubber Cylinder -->
        <div class="atmoscrubber-container" role="meter"
          aria-valuenow="${null!=u?Math.round(u):""}"
          aria-valuemin="0" aria-valuemax="300"
          aria-label="Air quality: ${null!=u?Math.round(u):"unknown"}">
          <div class="atmoscrubber ${w?"scrubber-idle":""}"
            style="--scrubber-hue:${Math.round(m)};--scrubber-speed:${_.toFixed(1)}s;--atmos-quality-color:${h}">
            ${l?e.qy`
              <div class="scrubber-score">${null!=c&&Number.isFinite(c)?Math.round(c):"—"}</div>
            `:d?e.qy`
              <div class="scrubber-score">${null!=p&&Number.isFinite(p)?Math.round(p):"—"}</div>
            `:""}
          </div>
        </div>

        <!-- Controls (right) — only for purifiers -->
        ${x?"":e.qy`
          <div class="env-controls" aria-label="${o} controls">
            ${v?e.qy`
              <button class="device-control-btn"
                ?data-on=${"on"===f?.state}
                ?data-off=${this._isOff(f)}
                @click=${()=>this._handleToggle(v.entity.entity_id)}
                title="Fan: ${f?.state}">
                <ha-icon .icon=${"mdi:fan"}></ha-icon>
                <span>${"on"===f?.state?`${g||""}%`:"Off"}</span>
              </button>
              ${b.length>0?e.qy`
                <div class="lcars-option-strip" role="radiogroup" aria-label="Preset mode">
                  <span class="lcars-option-strip-label">Mode</span>
                  <div class="lcars-option-strip-btns">
                    ${b.map(t=>e.qy`
                      <button class="lcars-option-btn"
                        role="radio"
                        aria-checked="${t===y}"
                        ?data-selected=${t===y}
                        @click=${()=>{(this.hass.states[v.entity.entity_id]?.attributes?.preset_modes||[]).includes(t)&&this.hass.callService("fan","set_preset_mode",{entity_id:v.entity.entity_id,preset_mode:t})}}>
                        ${t}
                      </button>
                    `)}
                  </div>
                </div>
              `:""}
            `:""}
            ${$.map(({entity:t,state:a})=>{const r=this._friendlyName(a,t),i="on"===a.state,s=this._isOff(a);return e.qy`
                <button class="device-control-btn" ?data-on=${i} ?data-off=${s}
                  @click=${()=>this._handleToggle(t.entity_id)}
                  title="${r}: ${a.state}">
                  <ha-icon .icon=${this._getEntityIcon(a)}></ha-icon>
                  <span>${r}</span>
                </button>
              `})}
          </div>
        `}

        <!-- Sparklines -->
        <div class="env-sparklines" aria-label="24-hour history">
          ${[...a,...r].map(({entity:e,state:t})=>{const a=this._friendlyName(t,e),r=S[e.entity_id],i=t.attributes?.device_class||"",s="pm25"===i?"var(--lcars-peach)":"carbon_dioxide"===i?"var(--lcars-sunflower)":"volatile_organic_compounds_parts"===i||"volatile_organic_compounds"===i?"var(--lcars-african-violet)":"var(--lcars-ice)";return this._renderSparkline(r,s,a)})}
        </div>
      </div>
    `}});const Ee=e.AH`
  :host {
    display: block;
  }

  /* ═══ Device Panel Frame (shared base) ═══ */
  .lcars-device-panel {
    --panel-frame-color: var(--lcars-butterscotch);
    display: grid;
    gap: var(--lcars-gap);
    width: 100%;
    max-width: 42rem;
    border-left: 4px solid var(--panel-frame-color);
    border-bottom: 4px solid var(--panel-frame-color);
    border-top: 2px solid var(--panel-frame-color);
    border-right: 2px solid var(--panel-frame-color);
    border-radius: 0.75rem 0.25rem 0.25rem 0.75rem;
    padding: var(--lcars-gap);
    background: var(--lcars-black);
    position: relative;
  }
  .lcars-device-panel::before {
    content: '';
    position: absolute;
    top: -2px; left: -4px;
    width: 1.5rem; height: 1.5rem;
    border-top: 4px solid var(--panel-frame-color);
    border-left: 4px solid var(--panel-frame-color);
    border-radius: 0.75rem 0 0 0;
    pointer-events: none;
  }
  .lcars-device-panel::after {
    content: '';
    position: absolute;
    bottom: -4px; right: -2px;
    width: 1.5rem; height: 1.5rem;
    border-bottom: 4px solid var(--panel-frame-color);
    border-right: 2px solid var(--panel-frame-color);
    border-radius: 0 0 0.25rem 0;
    pointer-events: none;
  }

  /* ═══ Battery Panel Grid ═══ */
  .battery-content {
    display: grid;
    grid-template-columns: minmax(8rem, 1fr) minmax(5rem, 6rem) minmax(8rem, 1.2fr);
    grid-template-rows: 1fr auto;
    grid-template-areas:
      "sensors  core      controls"
      "ioflow   ioflow    ioflow";
    gap: var(--lcars-gap);
  }

  /* Header */
  .battery-header {
    grid-area: header;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.5rem;
  }
  .device-panel-name {
    font-size: var(--lcars-font-size-sub);
    color: var(--panel-frame-color);
    text-transform: uppercase;
    white-space: nowrap;
  }
  .device-panel-header-line {
    flex: 1;
    height: 2px;
    background: var(--panel-frame-color);
    opacity: 0.5;
  }
  .battery-charge-label {
    font-size: var(--lcars-font-size-title);
    font-weight: 700;
    text-transform: uppercase;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .panel-numeric-code {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    color: var(--panel-frame-color);
    opacity: 0.7;
    white-space: nowrap;
  }

  /* Telemetry (left) */
  .battery-telemetry {
    grid-area: sensors;
    display: flex;
    flex-direction: column;
    gap: var(--lcars-gap);
    padding: 0.25rem;
    overflow-y: auto;
    max-height: 22rem;
  }
  .battery-total-line {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.5rem;
    cursor: pointer;
    font-size: var(--lcars-font-size-data);
    text-transform: uppercase;
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    transition: background var(--lcars-transition);
  }
  .battery-total-line:hover { background: rgba(255,255,255,0.05); }
  .battery-total-line:focus-visible {
    outline: 2px solid var(--lcars-ice, #99ccff);
    outline-offset: 2px;
  }
  .device-sensor-line {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.5rem;
    cursor: pointer;
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    transition: background var(--lcars-transition);
    font-size: var(--lcars-font-size-data);
    text-transform: uppercase;
  }
  .device-sensor-line:hover { background: rgba(255,255,255,0.05); }
  .device-sensor-line:focus-visible {
    outline: 2px solid var(--lcars-ice);
    outline-offset: 2px;
  }
  .sensor-indicator {
    width: 0.5rem; height: 0.5rem;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .sensor-label {
    flex: 1;
    color: var(--lcars-space-white);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.75rem;
  }
  .sensor-state-value {
    flex-shrink: 0;
    font-weight: 700;
    font-size: var(--lcars-font-size-data);
  }
  .battery-section-divider {
    height: 1px;
    background: var(--lcars-gray);
    opacity: 0.3;
    margin: 0.375rem 0;
  }
  .battery-section-label {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-label, 0.75rem);
    color: var(--lcars-sky, #aaaaff);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 0 0.5rem;
    margin-bottom: 0.125rem;
  }

  /* ═══ Warp Core ═══ */
  .warp-core-container {
    grid-area: core;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 0;
    min-height: 10rem;
  }
  .warp-core {
    position: relative;
    width: 4rem;
    height: 100%;
    min-height: 10rem;
    border-radius: 2rem;
    border: 2px solid var(--core-color);
    background: var(--lcars-black);
    overflow: hidden;
    box-shadow: 0 0 calc(var(--core-charge, 0) * 0.2px) var(--core-color);
    transition: border-color 1s ease, box-shadow 1s ease;
  }
  .warp-core-fill {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: calc(var(--core-charge, 0) * 1%);
    background: var(--core-color);
    opacity: 0.8;
    transition: height 1s ease, background 1s ease;
  }
  .warp-core-fill.core-idle {
    animation: core-idle-pulse 3s ease-in-out infinite;
  }
  .warp-core-fill.core-charging {
    animation: core-charge-flow 2s linear infinite;
    background-image: repeating-linear-gradient(
      0deg,
      transparent 0px, transparent 0.75rem,
      rgba(255,255,255,0.15) 0.75rem, rgba(255,255,255,0.15) 1rem
    );
    background-size: 100% 2rem;
  }
  .warp-core-stream {
    position: absolute;
    left: 50%; top: 0; bottom: 0;
    width: 2px;
    transform: translateX(-50%);
    background: rgba(255,255,255,0.35);
  }
  .warp-core-tick {
    position: absolute;
    left: 10%; right: 10%;
    height: 1px;
    background: var(--core-color);
    opacity: 0.3;
    pointer-events: none;
  }
  @keyframes core-idle-pulse {
    0%, 100% { opacity: 0.8; }
    50% { opacity: 0.55; }
  }
  @keyframes core-charge-flow {
    0% { background-position-y: 0; }
    100% { background-position-y: -2rem; }
  }

  /* Controls (right) */
  .battery-controls {
    grid-area: controls;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.25rem;
    overflow-y: auto;
    max-height: 22rem;
  }
  .device-control-btn {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    height: 2.25rem;
    padding: 0 0.75rem;
    background: var(--lcars-sunflower);
    color: var(--lcars-black);
    border: none;
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    text-transform: uppercase;
    cursor: pointer;
    transition: filter var(--lcars-transition), background var(--lcars-transition);
    white-space: nowrap;
  }
  .device-control-btn:hover { filter: brightness(1.15); }
  .device-control-btn:focus-visible {
    outline: 2px solid var(--lcars-ice);
    outline-offset: 2px;
  }
  .device-control-btn ha-icon { --mdc-icon-size: 16px; flex-shrink: 0; }
  .device-control-btn[data-on] { background: var(--lcars-gold); }
  .device-control-btn[data-off] { background: var(--lcars-gray); color: var(--lcars-space-white); }

  /* Number slider controls */
  .battery-slider-control {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    padding: 0.25rem 0.5rem;
  }
  .battery-slider-label {
    font-size: 0.65rem;
    color: var(--lcars-space-white);
    text-transform: uppercase;
  }
  .battery-slider-track {
    position: relative;
    height: 1.25rem;
    background: var(--lcars-gray);
    border-radius: 0.625rem;
    cursor: pointer;
    overflow: visible;
  }
  .battery-slider-fill {
    height: 100%;
    background: var(--lcars-ice);
    border-radius: 0.625rem 0 0 0.625rem;
    transition: width 0.3s ease;
  }
  .battery-slider-thumb {
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 1.25rem; height: 1.25rem;
    border-radius: 50%;
    background: var(--lcars-sunflower);
    border: 2px solid var(--lcars-black);
    pointer-events: none;
  }
  .battery-slider-value {
    font-size: 0.7rem;
    color: var(--lcars-data-accent, var(--lcars-ice));
    text-align: right;
    font-weight: 700;
  }

  /* LCARS Option Strip */
  .lcars-option-strip {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    padding: 0.125rem 0;
  }
  .lcars-option-strip-label {
    font-size: 0.65rem;
    color: var(--lcars-space-white, #f5f6fa);
    text-transform: uppercase;
    padding: 0 0.25rem;
    margin-bottom: 0.125rem;
  }
  .lcars-option-strip-btns {
    display: flex;
    flex-wrap: wrap;
    gap: 2px;
  }
  .lcars-option-btn {
    display: flex;
    align-items: center;
    height: 1.5rem;
    padding: 0 0.75rem;
    background: var(--lcars-gray);
    color: var(--lcars-space-white, #f5f6fa);
    border: none;
    border-radius: 0 0.75rem 0.75rem 0;
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-label, 0.75rem);
    text-transform: uppercase;
    cursor: pointer;
    transition: filter 0.2s, background 0.2s;
    user-select: none;
    white-space: nowrap;
  }
  .lcars-option-btn:hover { filter: brightness(1.2); }
  .lcars-option-btn:focus-visible {
    outline: 2px solid var(--lcars-ice);
    outline-offset: 2px;
  }
  .lcars-option-btn[data-selected] {
    background: var(--lcars-gold, var(--lcars-butterscotch));
    color: var(--lcars-black, #000);
  }

  /* ═══ Power I/O Flow ═══ */
  .battery-io-flow {
    grid-area: ioflow;
    display: flex;
    flex-direction: column;
    gap: var(--lcars-gap);
    padding: 0.25rem 0.5rem;
    border-top: 2px solid var(--panel-frame-color);
  }
  .io-pair-row {
    display: flex;
    align-items: center;
    gap: 0;
    min-height: 1.75rem;
  }
  .io-port {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 3.5rem;
    flex-shrink: 0;
  }
  .io-port.io-out { order: 5; }
  .io-label {
    font-size: 0.6rem;
    color: var(--lcars-space-white);
    text-transform: uppercase;
    white-space: nowrap;
  }
  .io-watts {
    font-size: var(--lcars-font-size-data);
    font-weight: 700;
  }
  .io-conduit {
    flex: 1;
    height: 3px;
    position: relative;
    overflow: hidden;
  }
  .io-conduit-in { order: 2; background: var(--lcars-ice); opacity: 0.4; }
  .io-conduit-out { order: 4; background: var(--lcars-butterscotch); opacity: 0.4; }
  .io-core-gap { order: 3; width: 1rem; flex-shrink: 0; }
  .io-conduit::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
  }
  .io-conduit-in:not(.flow-stopped)::before {
    background: repeating-linear-gradient(
      90deg, transparent 0px, transparent 6px,
      var(--lcars-ice) 6px, var(--lcars-ice) 10px
    );
    background-size: 16px 100%;
    animation: flow-in var(--flow-duration, 0.8s) linear infinite;
  }
  .io-conduit-out:not(.flow-stopped)::before {
    background: repeating-linear-gradient(
      270deg, transparent 0px, transparent 6px,
      var(--lcars-butterscotch) 6px, var(--lcars-butterscotch) 10px
    );
    background-size: 16px 100%;
    animation: flow-out var(--flow-duration, 0.8s) linear infinite;
  }
  .flow-fast { --flow-duration: 0.4s; opacity: 1; }
  .flow-medium { --flow-duration: 0.8s; opacity: 0.8; }
  .flow-slow { --flow-duration: 1.5s; opacity: 0.6; }
  .flow-stopped { opacity: 0.15; }
  .flow-stopped::before { display: none; }
  @keyframes flow-in {
    from { background-position-x: 0; }
    to { background-position-x: -16px; }
  }
  @keyframes flow-out {
    from { background-position-x: 0; }
    to { background-position-x: 16px; }
  }

  .panel-pip-strip {
    position: absolute;
    bottom: 4px; right: 4px;
    width: 2rem; height: 3px;
    background: var(--panel-frame-color);
    border-radius: 1.5px;
    opacity: 0.3;
  }

  @media (max-width: 30rem) {
    .battery-content {
      grid-template-areas: "core" "sensors" "controls" "ioflow";
      grid-template-columns: 1fr;
      grid-template-rows: auto auto auto auto;
    }
    .warp-core-container {
      min-height: 6rem;
      flex-direction: row;
    }
    .warp-core {
      width: 100%;
      height: 4rem;
      min-height: 4rem;
      border-radius: 2rem;
    }
    .warp-core-fill {
      left: 0; bottom: 0; top: 0;
      right: auto;
      width: calc(var(--core-charge, 0) * 1%);
      height: 100%;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .warp-core-fill.core-idle,
    .warp-core-fill.core-charging { animation: none; }
    .io-conduit-in::before,
    .io-conduit-out::before { animation: none; }
  }
`;customElements.get("lcars-battery-panel")||customElements.define("lcars-battery-panel",class extends we{get panelType(){return"battery"}get defaultPanelTitle(){return"Battery"}get frameColor(){return"var(--lcars-ice)"}static get styles(){return[...super.styles,oe,le,Ee]}_classifyPowerEntity(e){const t=(e||"").toLowerCase();return/total\s*in\s*power/.test(t)?{side:"in",type:"total"}:/total\s*out\s*power/.test(t)?{side:"out",type:"total"}:/solar.*in.*power/.test(t)?{side:"in",type:"solar"}:/ac.*in.*power/.test(t)?{side:"in",type:"ac"}:/ac.*out.*power/.test(t)?{side:"out",type:"ac"}:/dc.*out.*power/.test(t)?{side:"out",type:"dc"}:/usb.*out.*power/.test(t)?{side:"out",type:"usb"}:/type.*c.*out.*power/.test(t)?{side:"out",type:"usbc"}:/power.*i.*o.*input.*power/.test(t)?{side:"in",type:"pio"}:/power.*i.*o.*output.*power/.test(t)?{side:"out",type:"pio"}:/anderson.*out.*power/.test(t)?{side:"out",type:"dc"}:/alternator.*in.*power/.test(t)?{side:"in",type:"alt"}:/station.*power/.test(t)?{side:"out",type:"station"}:/\bin\b/.test(t)?{side:"in",type:"other"}:/\bout\b/.test(t)?{side:"out",type:"other"}:null}_isNutDevice(e){let t=!1,a=!1,r=!1;for(const i of e){const e=i.state?.attributes||{},s=e.device_class||"",n=e.unit_of_measurement||"";"battery"===s&&"%"===n&&(t=!0),"power"===s&&"W"===n&&(a=!0);const o=i.entity?.entity_id||"";/ups[._]load|ups[._]status/i.test(o)&&(r=!0),"voltage"===s&&"V"===n&&(r=!0)}return t&&!a&&r}_parseNutStatus(e){const t=(e||"").toUpperCase();return{online:t.includes("OL"),onBattery:t.includes("OB"),charging:t.includes("CHRG"),lowBattery:t.includes("LB"),shutdown:t.includes("FSD"),off:"OFF"===t}}_formatNutRuntime(e){const t=parseInt(e,10);if(isNaN(t)||t<0)return"N/A";const a=Math.floor(t/3600),r=Math.floor(t%3600/60);return a>0?`${a}h ${r}m`:`${r}m`}_partitionBatteryEntities(e,t){const a=[],r=[],i=[],s=[],n=[],o=[],l=[],c=this._isNutDevice(e);let d=null,p=null,u=null,m=null,h=null;for(const t of e){const e=t.state?.attributes||{},o=e.device_class||"",l=e.unit_of_measurement||"",v=t.domain,f=e.friendly_name||t.entity.entity_id,g=t.entity?.entity_id||"";if(["switch","number","button","select"].includes(v))n.push(t);else if("battery"!==o||"%"!==l)if(c){if(/ups[._]load$/i.test(g)||/\bload\b/i.test(f)&&"%"===l){d=t;continue}if(/ups[._]status_data$/i.test(g)||/status\s*data/i.test(f)){u=t;continue}if(/ups[._]status$/i.test(g)&&!/status_data/i.test(g)){p=t;continue}if(/nominal.*real.*power|realpower.*nominal/i.test(f)){m=parseFloat(t.state?.state)||null,s.push(t);continue}if("duration"===o||/battery.*runtime/i.test(g)){h=t,s.push(t);continue}if("voltage"===o&&"V"===l){s.push(t);continue}s.push(t)}else{if("power"===o&&"W"===l){const e=this._classifyPowerEntity(f);e?"in"===e.side?r.push({...t,ioType:e.type}):i.push({...t,ioType:e.type}):s.push(t);continue}s.push(t)}else a.push(t)}if(c){const e=u?.state?.state||"",t=this._parseNutStatus(e),a=d&&parseFloat(d.state?.state)||0,r=m?Math.round(a*m/100):null;if(d){const e=null!=r?`${r}W (${a}%)`:`${a}%`;i.push({...d,ioType:"total",_nutSynthetic:!0,_nutDisplayValue:e,_nutWatts:r||a})}this._nutStatus=t,this._nutStatusEntry=p,this._nutRuntimeEntry=h,this._nutLoadEntry=d,this._nutComputedWatts=r}else this._nutStatus=null;if(t){for(const e of t.config){const t=this._getEntityState(e.entity_id);t&&o.push({entity:e,domain:e.entity_id.split(".")[0],state:t})}for(const e of t.diagnostic){const t=this._getEntityState(e.entity_id);t&&l.push({entity:e,domain:e.entity_id.split(".")[0],state:t})}}return{soc:a,powerIn:r,powerOut:i,telemetry:s,controls:n,configControls:o,diagnostics:l}}_getCoreColor(e){return e>=80?"var(--lcars-ice)":e>=60?"var(--lcars-sky)":e>=40?"var(--lcars-bluey)":e>=20?"var(--lcars-butterscotch)":e>=10?"var(--lcars-peach)":"var(--lcars-tomato)"}_getFlowSpeed(e){const t=Math.abs(parseFloat(e)||0);return 0===t?"flow-stopped":t>1e3?"flow-fast":t>100?"flow-medium":"flow-slow"}renderBadge(){const{soc:t}=this._partitionBatteryEntities(this.group.entities,this._getDeviceCategoryEntities(this.group.device.id)),a=t[0],r=a&&parseFloat(a.state.state)||0,i=a&&"unavailable"!==a.state.state&&"unknown"!==a.state.state,s=i?this._getCoreColor(r):"var(--lcars-gray)";return e.qy`<span style="color:${s}">${i?`${Math.round(r)}%`:"N/A"}</span>`}renderContent(){const t=this._getDeviceCategoryEntities(this.group.device.id),{soc:a,powerIn:r,powerOut:i,telemetry:s,controls:n,configControls:o,diagnostics:l}=this._partitionBatteryEntities(this.group.entities,t),c=this._shortDeviceName(this.group.device)||"Battery",d=a[0],p=d&&parseFloat(d.state.state)||0,u=d&&"unavailable"!==d.state.state&&"unknown"!==d.state.state,m=u?this._getCoreColor(p):"var(--lcars-gray)",h=r.find(e=>"total"===e.ioType),v=i.find(e=>"total"===e.ioType),f=h&&parseFloat(h.state.state)||0,g=v&&!v._nutSynthetic&&parseFloat(v.state.state)||0;let b,y,w;this._nutStatus?(b=this._nutStatus.charging,y=this._nutStatus.onBattery,w=!b&&!y):(b=f>5,y=g>5,w=!b&&!y);const _=new Set;r.filter(e=>"total"!==e.ioType).forEach(e=>_.add(e.ioType)),i.filter(e=>"total"!==e.ioType).forEach(e=>_.add(e.ioType));const x=[..._].map(e=>({type:e,label:e.toUpperCase(),inEntry:r.find(t=>t.ioType===e),outEntry:i.find(t=>t.ioType===e)})),$=s.filter(e=>{const t=e.state?.attributes?.device_class||"",a=(e.state?.attributes?.friendly_name||"").toLowerCase();return"temperature"===t||"duration"===t||"voltage"===t||/state.*health|cycles|remain.*time|status|error.*code|battery.*count|runtime|load/.test(a)}).slice(0,8),k=l.filter(e=>{const t=e.state?.attributes?.device_class||"",a=(e.state?.attributes?.friendly_name||"").toLowerCase();return"temperature"===t||/cycles|status|error|battery.*count|charging.*state|power.*diff/.test(a)}).slice(0,8);return e.qy`
      <div class="battery-content">
        <!-- Telemetry (left) -->
        <div class="battery-telemetry" role="list" aria-label="${c} telemetry">
          ${this._nutStatus&&this._nutStatusEntry?e.qy`
            <div class="battery-total-line" tabindex="0" role="button"
              @click=${()=>this._handleEntityClick(this._nutStatusEntry.entity.entity_id)}
              @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._handleEntityClick(this._nutStatusEntry.entity.entity_id))}}>
              <ha-icon icon="mdi:${this._nutStatus.onBattery?"battery-alert":"power-plug"}" style="--mdc-icon-size:14px;color:${this._nutStatus.onBattery?"var(--lcars-butterscotch)":"var(--lcars-ice)"}"></ha-icon>
              <span class="sensor-label">Status</span>
              <span class="sensor-state-value" style="color:${this._nutStatus.onBattery?"var(--lcars-butterscotch)":"var(--lcars-ice)"}">${this._nutStatusEntry.state.state}</span>
            </div>
          `:""}
          ${this._nutStatus&&this._nutLoadEntry?e.qy`
            <div class="battery-total-line" tabindex="0" role="button"
              @click=${()=>this._handleEntityClick(this._nutLoadEntry.entity.entity_id)}
              @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._handleEntityClick(this._nutLoadEntry.entity.entity_id))}}>
              <ha-icon icon="mdi:gauge" style="--mdc-icon-size:14px;color:var(--lcars-butterscotch)"></ha-icon>
              <span class="sensor-label">Load</span>
              <span class="sensor-state-value" style="color:var(--lcars-butterscotch)">${v?._nutDisplayValue||this._nutLoadEntry.state.state+"%"}</span>
            </div>
          `:""}
          ${this._nutStatus&&this._nutRuntimeEntry?e.qy`
            <div class="battery-total-line" tabindex="0" role="button"
              @click=${()=>this._handleEntityClick(this._nutRuntimeEntry.entity.entity_id)}
              @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._handleEntityClick(this._nutRuntimeEntry.entity.entity_id))}}>
              <ha-icon icon="mdi:timer-outline" style="--mdc-icon-size:14px;color:var(--lcars-sky)"></ha-icon>
              <span class="sensor-label">Runtime</span>
              <span class="sensor-state-value" style="color:var(--lcars-sky)">${this._formatNutRuntime(this._nutRuntimeEntry.state.state)}</span>
            </div>
          `:""}
          ${!this._nutStatus&&h?e.qy`
            <div class="battery-total-line" tabindex="0" role="button"
              @click=${()=>this._handleEntityClick(h.entity.entity_id)}
              @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._handleEntityClick(h.entity.entity_id))}}>
              <ha-icon icon="mdi:transmission-tower-import" style="--mdc-icon-size:14px;color:var(--lcars-ice)"></ha-icon>
              <span class="sensor-label">Total In</span>
              <span class="sensor-state-value" style="color:var(--lcars-ice)">${h.state.state} W</span>
            </div>
          `:""}
          ${!this._nutStatus&&v?e.qy`
            <div class="battery-total-line" tabindex="0" role="button"
              @click=${()=>this._handleEntityClick(v.entity.entity_id)}
              @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._handleEntityClick(v.entity.entity_id))}}>
              <ha-icon icon="mdi:transmission-tower-export" style="--mdc-icon-size:14px;color:var(--lcars-butterscotch)"></ha-icon>
              <span class="sensor-label">Total Out</span>
              <span class="sensor-state-value" style="color:var(--lcars-butterscotch)">${v.state.state} W</span>
            </div>
          `:""}
          ${$.map(({entity:t,state:a})=>{const r=this._friendlyName(a,t),i=a.state,s=a.attributes?.unit_of_measurement||"",n=this._getSensorIndicatorColor(a);return e.qy`
              <lcars-sensor-row
                label="${r}"
                value="${i}${s?" "+s:""}"
                color="${n}"
                entity-id="${t.entity_id}">
              </lcars-sensor-row>
            `})}
          ${k.length>0?e.qy`
            <lcars-section-divider label="DIAGNOSTICS"></lcars-section-divider>
            ${k.map(({entity:t,state:a})=>{const r=this._friendlyName(a,t),i=a.state,s=a.attributes?.unit_of_measurement||"",n=this._getSensorIndicatorColor(a);return e.qy`
                <lcars-sensor-row
                  label="${r}"
                  value="${i}${s?" "+s:""}"
                  color="${n}"
                  entity-id="${t.entity_id}">
                </lcars-sensor-row>
              `})}
          `:""}
        </div>

        <!-- Warp Core (center) -->
        <div class="warp-core-container" role="meter"
          aria-valuenow="${p}" aria-valuemin="0" aria-valuemax="100"
          aria-label="Battery charge level: ${Math.round(p)} percent">
          <div class="warp-core" style="--core-color:${m};--core-charge:${u?p:0}">
            <div class="warp-core-fill ${w?"core-idle":""} ${b?"core-charging":""}">
              <div class="warp-core-stream"></div>
            </div>
            <div class="warp-core-tick" style="bottom:25%"></div>
            <div class="warp-core-tick" style="bottom:50%"></div>
            <div class="warp-core-tick" style="bottom:75%"></div>
          </div>
        </div>

        <!-- Controls (right) -->
        <div class="battery-controls" aria-label="${c} controls">
          ${n.map(({entity:t,state:a})=>{const r=this._friendlyName(a,t),i=t.entity_id.split(".")[0];if("number"===i){const i=a.attributes?.min||0,s=a.attributes?.max||100,n=parseFloat(a.state)||0,o=a.attributes?.unit_of_measurement||"",l=s>i?(n-i)/(s-i)*100:0;return e.qy`
                <div class="battery-slider-control">
                  <span class="battery-slider-label" id="slider-${t.entity_id}">${r}</span>
                  <div class="battery-slider-track"
                    tabindex="0" role="slider"
                    aria-labelledby="slider-${t.entity_id}"
                    aria-valuemin="${i}" aria-valuemax="${s}" aria-valuenow="${n}"
                    @click=${e=>{const a=e.currentTarget.getBoundingClientRect(),r=Math.max(0,Math.min(1,(e.clientX-a.left)/a.width)),n=Math.round(i+r*(s-i));this.hass.callService("number","set_value",{entity_id:t.entity_id,value:n})}}
                    @keydown=${e=>{let a=n;if("ArrowRight"===e.key||"ArrowUp"===e.key)a=Math.min(s,n+1);else if("ArrowLeft"===e.key||"ArrowDown"===e.key)a=Math.max(i,n-1);else if("Home"===e.key)a=i;else{if("End"!==e.key)return;a=s}e.preventDefault(),this.hass.callService("number","set_value",{entity_id:t.entity_id,value:a})}}>
                    <div class="battery-slider-fill" style="width:${l}%"></div>
                    <div class="battery-slider-thumb" style="left:${l}%"></div>
                  </div>
                  <span class="battery-slider-value">${n}${o?" "+o:""}</span>
                </div>
              `}const s="on"===a.state,n=this._isOff(a);return e.qy`
              <button class="device-control-btn" ?data-on=${s} ?data-off=${n}
                @click=${()=>z.has(i)?this._handleToggle(t.entity_id):this._handleEntityClick(t.entity_id)}
                title="${r}: ${a.state}">
                <ha-icon .icon=${this._getEntityIcon(a)}></ha-icon>
                <span>${r}</span>
              </button>
            `})}
          ${o.length>0?e.qy`
            <lcars-section-divider label="CONFIG"></lcars-section-divider>
            ${o.map(({entity:t,state:a})=>{const r=this._friendlyName(a,t),i=t.entity_id.split(".")[0];if("number"===i){const i=a.attributes?.min||0,s=a.attributes?.max||100,n=a.attributes?.step||1,o=parseFloat(a.state)||0,l=a.attributes?.unit_of_measurement||"",c=s>i?(o-i)/(s-i)*100:0;return e.qy`
                  <div class="battery-slider-control">
                    <span class="battery-slider-label" id="slider-${t.entity_id}">${r}</span>
                    <div class="battery-slider-track"
                      tabindex="0" role="slider"
                      aria-labelledby="slider-${t.entity_id}"
                      aria-valuemin="${i}" aria-valuemax="${s}" aria-valuenow="${o}"
                      @click=${e=>{const a=e.currentTarget.getBoundingClientRect(),r=Math.max(0,Math.min(1,(e.clientX-a.left)/a.width));let o=i+r*(s-i);o=Math.round(o/n)*n,o=Math.max(i,Math.min(s,o)),this.hass.callService("number","set_value",{entity_id:t.entity_id,value:o})}}
                      @keydown=${e=>{let a=o;if("ArrowRight"===e.key||"ArrowUp"===e.key)a=Math.min(s,o+n);else if("ArrowLeft"===e.key||"ArrowDown"===e.key)a=Math.max(i,o-n);else if("Home"===e.key)a=i;else{if("End"!==e.key)return;a=s}e.preventDefault(),this.hass.callService("number","set_value",{entity_id:t.entity_id,value:a})}}>
                      <div class="battery-slider-fill" style="width:${c}%"></div>
                      <div class="battery-slider-thumb" style="left:${c}%"></div>
                    </div>
                    <span class="battery-slider-value">${o}${l?" "+l:""}</span>
                  </div>
                `}if("select"===i){const i=a.attributes?.options||[],s=a.state;return e.qy`
                  <div class="lcars-option-strip" role="radiogroup" aria-label="${r}">
                    <span class="lcars-option-strip-label">${r}</span>
                    <div class="lcars-option-strip-btns">
                      ${i.map(a=>e.qy`
                        <button class="lcars-option-btn"
                          role="radio"
                          aria-checked="${a===s}"
                          ?data-selected=${a===s}
                          @click=${()=>this.hass.callService("select","select_option",{entity_id:t.entity_id,option:a})}>
                          ${a}
                        </button>
                      `)}
                    </div>
                  </div>
                `}const s="on"===a.state,n=this._isOff(a);return e.qy`
                <button class="device-control-btn" ?data-on=${s} ?data-off=${n}
                  @click=${()=>z.has(i)?this._handleToggle(t.entity_id):this._handleEntityClick(t.entity_id)}
                  title="${r}: ${a.state}">
                  <ha-icon .icon=${this._getEntityIcon(a)}></ha-icon>
                  <span>${r}</span>
                </button>
              `})}
          `:""}
        </div>

        <!-- Power I/O Flow (bottom) -->
        <div class="battery-io-flow" aria-label="Power flow">
          ${this._nutStatus?e.qy`
            <div class="io-pair-row">
              <div class="io-port io-in" aria-label="Grid input: ${this._nutStatus.online?"online":"offline"}">
                <span class="io-label">GRID</span>
                <span class="io-watts" style="color:${this._nutStatus.online?"var(--lcars-ice)":"var(--lcars-tomato)"}">${this._nutStatus.online?"ONLINE":"OFFLINE"}</span>
              </div>
              <div class="io-conduit io-conduit-in ${this._nutStatus.online?"flow-medium":"flow-stopped"}"></div>
              <div class="io-core-gap"></div>
              <div class="io-conduit io-conduit-out ${this._nutLoadEntry&&parseFloat(this._nutLoadEntry.state?.state)>0?"flow-medium":"flow-stopped"}"></div>
              <div class="io-port io-out" aria-label="Load output: ${this._nutComputedWatts?this._nutComputedWatts+" watts":(this._nutLoadEntry?.state?.state||"0")+" percent"}">
                <span class="io-label">LOAD</span>
                <span class="io-watts" style="color:var(--lcars-butterscotch)">${v?._nutDisplayValue||"—"}</span>
              </div>
            </div>
          `:e.qy`
          ${x.map(t=>{const a=t.inEntry&&parseFloat(t.inEntry.state.state)||0,r=t.outEntry&&parseFloat(t.outEntry.state.state)||0,i=this._getFlowSpeed(a),s=this._getFlowSpeed(r);return e.qy`
              <div class="io-pair-row">
                <div class="io-port io-in" aria-label="${t.label} input: ${a} watts">
                  <span class="io-label">${t.label} IN</span>
                  <span class="io-watts" style="color:var(--lcars-ice)">${a>0?`${Math.round(a)}W`:"—"}</span>
                </div>
                <div class="io-conduit io-conduit-in ${i}"></div>
                <div class="io-core-gap"></div>
                <div class="io-conduit io-conduit-out ${s}"></div>
                <div class="io-port io-out" aria-label="${t.label} output: ${r} watts">
                  <span class="io-label">${t.label} OUT</span>
                  <span class="io-watts" style="color:var(--lcars-butterscotch)">${r>0?`${Math.round(r)}W`:"—"}</span>
                </div>
              </div>
            `})}
          `}
        </div>
      </div>
    `}});const ze=e.AH`
  :host {
    display: block;
  }

  .lcars-device-panel {
    --panel-frame-color: var(--lcars-butterscotch);
    display: grid;
    gap: var(--lcars-gap);
    width: 100%;
    max-width: 42rem;
    border-left: 4px solid var(--panel-frame-color);
    border-bottom: 4px solid var(--panel-frame-color);
    border-top: 2px solid var(--panel-frame-color);
    border-right: 2px solid var(--panel-frame-color);
    border-radius: 0.75rem 0.25rem 0.25rem 0.75rem;
    padding: var(--lcars-gap);
    background: var(--lcars-black);
    position: relative;
  }
  .lcars-device-panel::before {
    content: '';
    position: absolute;
    top: -2px; left: -4px;
    width: 1.5rem; height: 1.5rem;
    border-top: 4px solid var(--panel-frame-color);
    border-left: 4px solid var(--panel-frame-color);
    border-radius: 0.75rem 0 0 0;
    pointer-events: none;
  }
  .lcars-device-panel::after {
    content: '';
    position: absolute;
    bottom: -4px; right: -2px;
    width: 1.5rem; height: 1.5rem;
    border-bottom: 4px solid var(--panel-frame-color);
    border-right: 2px solid var(--panel-frame-color);
    border-radius: 0 0 0.25rem 0;
    pointer-events: none;
  }

  .climate-content {
    display: grid;
    grid-template-areas:
      "sensors  media"
      "modes    modes"
      "auxctrl  auxctrl";
    grid-template-columns: minmax(10rem, 1fr) minmax(14rem, 2fr);
    grid-template-rows: 1fr auto auto;
    gap: var(--lcars-gap);
    transition: border-color 600ms;
  }

  .climate-header { grid-area: header; display: flex; align-items: center; gap: 0.5rem; }
  .device-panel-name {
    font-size: var(--lcars-font-size-sub);
    color: var(--panel-frame-color);
    text-transform: uppercase;
    white-space: nowrap;
  }
  .device-panel-header-line {
    flex: 1; height: 2px;
    background: var(--panel-frame-color);
    opacity: 0.5;
  }
  .climate-action-badge {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
  .panel-numeric-code {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    color: var(--panel-frame-color);
    opacity: 0.7;
    white-space: nowrap;
  }

  /* Sensors (left) */
  .climate-sensors { grid-area: sensors; overflow-y: auto; }
  .device-sensor-line {
    display: flex; align-items: center; gap: 0.5rem;
    padding: 0.25rem 0.5rem; cursor: pointer;
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    transition: background var(--lcars-transition);
    font-size: var(--lcars-font-size-data); text-transform: uppercase;
  }
  .device-sensor-line:hover { background: rgba(255,255,255,0.05); }
  .device-sensor-line:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }

  /* Compliance #5: mini-bars not dots — 2px × 1rem vertical bars */
  .sensor-indicator-bar { width: 2px; height: 1rem; border-radius: 1px; flex-shrink: 0; }
  /* Legacy dot class kept for backward compatibility */
  .sensor-indicator { width: 0.5rem; height: 0.5rem; border-radius: 50%; flex-shrink: 0; }

  .sensor-label {
    flex: 1; color: var(--lcars-space-white);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    font-size: var(--lcars-font-size-data); /* Compliance #3: use LCARS 3-tier font, not 0.75rem */
  }
  .sensor-state-value { flex-shrink: 0; font-weight: 700; font-size: var(--lcars-font-size-data); }
  .battery-section-divider { height: 1px; background: var(--lcars-gray); opacity: 0.3; margin: 0.375rem 0; }
  .battery-section-label {
    font-family: var(--lcars-font); font-size: var(--lcars-font-size-label, 0.75rem);
    color: var(--lcars-sky, #aaaaff); text-transform: uppercase;
    letter-spacing: 0.08em; padding: 0 0.5rem; margin-bottom: 0.125rem;
  }

  /* Viewscreen — Compliance #1: explicit black bg, not inherited */
  .climate-viewscreen {
    grid-area: media;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    position: relative; cursor: pointer;
    background: var(--lcars-black, #000); /* Compliance #1: no lavender bleed */
    border: 2px solid var(--panel-frame-color);
    border-radius: 4px; padding: 0.5rem;
    transition: border-color 600ms;
  }
  /* Compliance #6: mini-elbow brackets with thick→thin asymmetry */
  .climate-viewscreen::before {
    content: '';
    position: absolute;
    top: 4px; left: 4px;
    width: 1.5rem; height: 1.5rem;
    border-top: 3px solid var(--panel-frame-color); /* thick */
    border-left: 3px solid var(--panel-frame-color); /* thick */
    border-right: none; border-bottom: none;
    border-radius: 0.5rem 0 0 0; /* mini-elbow corner */
  }
  .climate-viewscreen::after {
    content: '';
    position: absolute;
    bottom: 4px; right: 4px;
    width: 1.5rem; height: 1.5rem;
    border-bottom: 1px solid var(--panel-frame-color); /* thin */
    border-right: 1px solid var(--panel-frame-color); /* thin */
    border-left: none; border-top: none;
    border-radius: 0 0 0.25rem 0;
  }
  .climate-arc { width: 100%; max-width: 200px; }

  /* Arc halo drift animation (active HVAC only) */
  .arc-halo-active {
    stroke-dasharray: 6 4;
    animation: arc-halo-drift var(--lcars-anim-ambient) linear infinite;
  }
  @keyframes arc-halo-drift {
    from { stroke-dashoffset: 0; }
    to { stroke-dashoffset: 40; }
  }

  /* HVAC action feedback bar — 3px flat pulse bar below viewscreen */
  .climate-action-bar {
    width: 100%; height: 3px;
    margin-top: 0.25rem;
    border-radius: 1.5px;
    background: var(--action-color);
    animation: action-bar-pulse 2s ease-in-out infinite;
  }
  @keyframes action-bar-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  /* Setpoint controls — Compliance #3: LCARS endcap pills, not circles */
  .climate-setpoint-controls { display: flex; flex-direction: column; gap: 0.25rem; margin-top: 0.5rem; }
  .climate-setpoint-row { display: flex; align-items: center; gap: 0.5rem; justify-content: center; }
  .climate-sp-btn {
    width: 3rem; height: 2.5rem;
    border: none;
    background: var(--lcars-disabled);
    color: var(--lcars-space-white);
    font-size: 1.25rem; font-family: var(--lcars-font);
    cursor: pointer; transition: background 200ms;
  }
  .climate-sp-btn:hover { background: var(--panel-frame-color); }
  .climate-sp-btn:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
  /* Decrement: rounded-left, flat-right */
  .climate-sp-btn.sp-decrement {
    border-radius: var(--lcars-btn-radius) 0 0 var(--lcars-btn-radius);
  }
  /* Increment: flat-left, rounded-right */
  .climate-sp-btn.sp-increment {
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
  }
  .climate-sp-label {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    min-width: 6rem; text-align: center;
  }

  /* Mode strips — Compliance #2: connected strip, first rounded-left, last rounded-right */
  .climate-modes {
    grid-area: modes;
    display: flex; gap: 1px; flex-wrap: wrap;
  }
  .climate-mode-btn {
    flex: 1; min-width: 4rem;
    height: var(--lcars-btn-height);
    border: none;
    border-radius: 0; /* default: flat both sides (middle buttons) */
    background: var(--lcars-disabled);
    color: var(--lcars-black);
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    text-transform: uppercase; cursor: pointer;
    transition: background 200ms;
  }
  .climate-mode-btn.mode-first {
    border-radius: var(--lcars-btn-radius) 0 0 var(--lcars-btn-radius);
  }
  .climate-mode-btn.mode-last {
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
  }
  /* Single button (both first and last) */
  .climate-mode-btn.mode-first.mode-last {
    border-radius: var(--lcars-btn-radius);
  }
  .climate-mode-btn[data-active] { background: var(--panel-frame-color); }
  .climate-mode-btn:hover:not([data-active]) { background: var(--lcars-gray); }
  .climate-mode-btn:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
  .climate-aux-controls {
    grid-area: auxctrl;
    display: flex; flex-direction: column; gap: var(--lcars-gap);
  }
  .climate-aux-strip { display: flex; gap: 1px; flex-wrap: wrap; }

  .panel-pip-strip {
    position: absolute;
    bottom: 4px; right: 4px;
    width: 2rem; height: 3px;
    background: var(--panel-frame-color);
    border-radius: 1.5px; opacity: 0.3;
  }

  /* Animation budget: all gated behind reduced-motion preference */
  @media (max-width: 30rem) {
    .climate-content {
      grid-template-areas: "media" "sensors" "modes" "auxctrl";
      grid-template-columns: 1fr;
      grid-template-rows: auto auto auto auto;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .arc-halo-active,
    .climate-action-bar {
      animation: none;
    }
  }
`;customElements.get("lcars-climate-panel")||customElements.define("lcars-climate-panel",class extends we{_climateSetpointDebouncer=null;get panelType(){return"climate"}get defaultPanelTitle(){return"Thermostat"}get frameColor(){const e=this.group?.entities?.find(e=>"climate"===e.domain)?.state;return(0,J.OX)(e?.attributes?.hvac_action||"off")}static get styles(){return[...super.styles,oe,le,ze]}_partitionClimateEntities(e,t){const a=[],r=[],i=[],s=[],n=new Set(["problem","heat","cold","connectivity","battery","tamper","smoke","safety"]);for(const t of e){const e=t.domain;if("climate"!==e){if("binary_sensor"===e){const e=t.state?.attributes?.device_class||"";if(n.has(e)){i.push(t);continue}}A.has(e),r.push(t)}else a.push(t)}if(t)for(const e of t.diagnostic||[]){const t=this._getEntityState(e.entity_id);t&&s.push({entity:e,domain:e.entity_id.split(".")[0],state:t})}return{climate:a,sensors:r,faults:i,diagnostics:s}}_isDualSetpoint(e){return"heat_cool"===e?.attributes?.hvac_mode||null!=e?.attributes?.target_temp_low&&null!=e?.attributes?.target_temp_high}_renderClimateArc(t,a,r,i,s,n,o,l,c){const d=100,p=120,u=i-r||1,m=Math.max(0,Math.min(1,(t-r)/u)),h=Math.round(40*m),v=Math.PI/40,f=Math.max(0,Math.min(1,(a-r)/u)),g=Math.PI-Math.PI*f,b=d+80*Math.cos(g),y=p-80*Math.sin(g);let w=0,_=0;n&&null!=o&&null!=l&&(w=Math.round((o-r)/u*40),_=Math.round((l-r)/u*40));const x="off"!==c&&"idle"!==c,$=[];for(let e=0;e<40;e++){const t=Math.PI-(e+.5)*v,a=d+74*Math.cos(t),r=p-74*Math.sin(t),i=d+86*Math.cos(t),o=p-86*Math.sin(t);let l="var(--lcars-disabled)",c="0.2";e<h&&(n?e<w?(l="var(--lcars-ice)",c="0.8"):e<=_?(l="var(--lcars-sunflower)",c="1"):(l="var(--lcars-butterscotch)",c="0.8"):(l=s,c="1")),$.push({x1:a,y1:r,x2:i,y2:o,color:l,opacity:c})}return e.qy`
      <svg class="climate-arc" viewBox="0 0 200 140" role="meter"
        aria-valuemin="${r}" aria-valuemax="${i}" aria-valuenow="${t}"
        aria-label="Temperature: ${t}°, target ${a}°">

        <!-- Background segments (dim ticks) -->
        ${$.map(t=>e.qy`
          <line x1="${t.x1}" y1="${t.y1}" x2="${t.x2}" y2="${t.y2}"
            stroke="${t.color}" stroke-width="3" stroke-linecap="round" opacity="${t.opacity}" />
        `)}

        <!-- Outer halo ring at 40% opacity -->
        <path d="M ${16},${p} A ${84},${84} 0 1,1 ${184},${p}"
          fill="none" stroke="${s}" stroke-width="1.5" opacity="0.4"
          class="${x?"arc-halo-active":""}" />

        <!-- Target marker: 6px dot with stroke ring -->
        ${null!=a?e.qy`
          <circle cx="${b}" cy="${y}" r="4" fill="${s}"
            stroke="var(--lcars-black)" stroke-width="2" />
        `:""}

        <!-- Temperature readout (Compliance #7: mapped to --lcars-font-size-title) -->
        <text x="${d}" y="${104}" text-anchor="middle" fill="${s}"
          font-family="var(--lcars-font)" font-size="38" font-weight="bold">
          ${null!=t&&Number.isFinite(t)?Math.round(t):"—"}°
        </text>

        <!-- HVAC action label -->
        <text x="${d}" y="${126}" text-anchor="middle" fill="${s}"
          font-family="var(--lcars-font)" font-size="10" opacity="0.7">
          ${c.toUpperCase().replace(/_/g," ")}
        </text>
      </svg>
    `}_handleClimateSetpoint(e,t,a,r,i){const s=ee(a,t);this._climateSetpointDebouncer||(this._climateSetpointDebouncer=re((e,t)=>{this.hass.callService("climate","set_temperature",{entity_id:e,...t})},1500));const n=r?{["low"===i?"target_temp_low":"target_temp_high"]:s}:{temperature:s};this._climateSetpointDebouncer.call(e,n)}renderBadge(){const t=this.group?.entities?.find(e=>"climate"===e.domain)?.state,a=t?.attributes?.hvac_action||"off",r=(0,J.OX)(a);return e.qy`<span style="color:${r}">${a.toUpperCase()}</span>`}renderContent(){const t=this._getDeviceCategoryEntities(this.group.device.id),{climate:a,sensors:r,faults:i,diagnostics:s}=this._partitionClimateEntities(this.group.entities,t),n=this._shortDeviceName(this.group.device)||"Thermostat";if(0===a.length)return e.qy``;const o=a[0],l=o.state,c=l?.attributes||{},d=null!=c.current_temperature?Number(c.current_temperature):null,p=c.hvac_action||"off",u=(0,J.OX)(p),m=this._isDualSetpoint(l),h=m?(Number(c.target_temp_low)+Number(c.target_temp_high))/2:null!=c.temperature?Number(c.temperature):null,v=m?Number(c.target_temp_low):null,f=m?Number(c.target_temp_high):null,g=null!=c.min_temp?Number(c.min_temp):45,b=null!=c.max_temp?Number(c.max_temp):95,y=c.hvac_modes||[],w=c.hvac_mode||"off",_=c.fan_modes||[],x=c.fan_mode||"",$=c.preset_modes||[],k=c.preset_mode||"",S=r.find(e=>"humidity"===(e.state?.attributes?.device_class||"")),C=c.target_temp_step||1,E="off"!==p&&"idle"!==p,z=this._getSiblingZoneTemps();return e.qy`
      <div class="climate-content" data-hvac-action="${p}">

        <!-- Sensor readouts (left column) — Compliance #5: mini-bars not dots -->
        <div class="climate-sensors" role="list" aria-label="${n} readings">
          ${null!=d?e.qy`
            <div class="device-sensor-line" role="listitem" aria-label="Current temperature: ${d}°">
              <div class="sensor-indicator-bar" style="background:${u}"></div>
              <span class="sensor-label">Current</span>
              <span class="sensor-state-value" style="color:${u}">${Math.round(d)}°</span>
            </div>
          `:""}
          ${m?e.qy`
            <div class="device-sensor-line" role="listitem" aria-label="Heat target: ${v}°">
              <div class="sensor-indicator-bar" style="background:var(--lcars-butterscotch)"></div>
              <span class="sensor-label">Heat To</span>
              <span class="sensor-state-value" style="color:var(--lcars-butterscotch)">${v}°</span>
            </div>
            <div class="device-sensor-line" role="listitem" aria-label="Cool target: ${f}°">
              <div class="sensor-indicator-bar" style="background:var(--lcars-ice)"></div>
              <span class="sensor-label">Cool To</span>
              <span class="sensor-state-value" style="color:var(--lcars-ice)">${f}°</span>
            </div>
          `:null!=h?e.qy`
            <div class="device-sensor-line" role="listitem" aria-label="Target temperature: ${h}°">
              <div class="sensor-indicator-bar" style="background:${u}"></div>
              <span class="sensor-label">Target</span>
              <span class="sensor-state-value" style="color:${u}">${h}°</span>
            </div>
          `:""}
          ${S?e.qy`
            <div class="device-sensor-line" role="listitem"
              aria-label="Humidity: ${S.state.state}%"
              @click=${()=>this._handleEntityClick(S.entity.entity_id)}>
              <div class="sensor-indicator-bar" style="background:var(--lcars-ice)"></div>
              <span class="sensor-label">Humidity</span>
              <span class="sensor-state-value" style="color:var(--lcars-ice)">${S.state.state}%</span>
            </div>
          `:""}
          <div class="battery-section-divider"></div>
          <div class="device-sensor-line" role="listitem" aria-label="HVAC mode: ${w}">
            <div class="sensor-indicator-bar" style="background:${u}"></div>
            <span class="sensor-label">Mode</span>
            <span class="sensor-state-value">${w}</span>
          </div>
          ${x?e.qy`
            <div class="device-sensor-line" role="listitem" aria-label="Fan mode: ${x}">
              <div class="sensor-indicator-bar" style="background:var(--lcars-data-accent)"></div>
              <span class="sensor-label">Fan</span>
              <span class="sensor-state-value">${x}</span>
            </div>
          `:""}
          ${i.length>0?e.qy`
            <div class="battery-section-divider"></div>
            <div class="battery-section-label">FAULTS</div>
            ${i.map(({entity:t,state:a})=>{const r=this._friendlyName(a,t),i="on"===a.state?"var(--lcars-tomato)":"var(--lcars-gray)";return e.qy`
                <div class="device-sensor-line" tabindex="0" role="listitem"
                  aria-label="${r}: ${a.state}"
                  @click=${()=>this._handleEntityClick(t.entity_id)}
                  @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._handleEntityClick(t.entity_id))}}>
                  <div class="sensor-indicator-bar" style="background:${i}"></div>
                  <span class="sensor-label">${r}</span>
                  <span class="sensor-state-value" style="color:${i}">${a.state}</span>
                </div>
              `})}
          `:""}
          ${z.length>0?e.qy`
            <div class="battery-section-divider"></div>
            <div class="battery-section-label">OTHER ZONES</div>
            ${z.map(t=>e.qy`
              <div class="device-sensor-line" role="listitem" aria-label="${t.name}: ${t.temp}°">
                <div class="sensor-indicator-bar" style="background:${t.color}"></div>
                <span class="sensor-label">${t.name}</span>
                <span class="sensor-state-value" style="color:${t.color}">${t.temp}°</span>
              </div>
            `)}
          `:""}
        </div>

        <!-- Viewscreen: Compliance #1 (black bg), #6 (mini-elbow brackets) -->
        <div class="climate-viewscreen" tabindex="0"
          @click=${()=>this._handleEntityClick(o.entity.entity_id)}
          @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._handleEntityClick(o.entity.entity_id))}}>
          ${this._renderClimateArc(d,h,g,b,u,m,v,f,p)}

          <!-- Setpoint controls: Compliance #3 (LCARS endcap pills, not circles) -->
          <div class="climate-setpoint-controls">
            ${m?e.qy`
              <div class="climate-setpoint-row">
                <button class="climate-sp-btn sp-decrement" aria-label="Decrease heat target"
                  @click=${e=>{e.stopPropagation(),this._handleClimateSetpoint(o.entity.entity_id,c,v-C,!0,"low")}}>−</button>
                <span class="climate-sp-label" style="color:var(--lcars-butterscotch)">HEAT ${v}°</span>
                <button class="climate-sp-btn sp-increment" aria-label="Increase heat target"
                  @click=${e=>{e.stopPropagation(),this._handleClimateSetpoint(o.entity.entity_id,c,v+C,!0,"low")}}>+</button>
              </div>
              <div class="climate-setpoint-row">
                <button class="climate-sp-btn sp-decrement" aria-label="Decrease cool target"
                  @click=${e=>{e.stopPropagation(),this._handleClimateSetpoint(o.entity.entity_id,c,f-C,!0,"high")}}>−</button>
                <span class="climate-sp-label" style="color:var(--lcars-ice)">COOL ${f}°</span>
                <button class="climate-sp-btn sp-increment" aria-label="Increase cool target"
                  @click=${e=>{e.stopPropagation(),this._handleClimateSetpoint(o.entity.entity_id,c,f+C,!0,"high")}}>+</button>
              </div>
            `:null!=h?e.qy`
              <div class="climate-setpoint-row">
                <button class="climate-sp-btn sp-decrement" aria-label="Decrease target temperature"
                  @click=${e=>{e.stopPropagation(),this._handleClimateSetpoint(o.entity.entity_id,c,h-C,!1)}}>−</button>
                <span class="climate-sp-label" style="color:${u}">TARGET ${h}°</span>
                <button class="climate-sp-btn sp-increment" aria-label="Increase target temperature"
                  @click=${e=>{e.stopPropagation(),this._handleClimateSetpoint(o.entity.entity_id,c,h+C,!1)}}>+</button>
              </div>
            `:""}
          </div>

          <!-- HVAC action feedback bar -->
          ${E?e.qy`
            <div class="climate-action-bar" style="--action-color: ${u}"></div>
          `:""}
        </div>

        <!-- Mode strips: Compliance #2 (connected strip, flat sides) -->
        ${y.length>1?e.qy`
          <div class="climate-modes" role="radiogroup" aria-label="HVAC mode">
            ${y.map((t,a)=>e.qy`
              <button class="climate-mode-btn ${0===a?"mode-first":""} ${a===y.length-1?"mode-last":""}" role="radio"
                aria-checked="${t===w}" ?data-active=${t===w}
                @click=${()=>{const e=this.hass.states[o.entity.entity_id]?.attributes?.hvac_modes;e?.includes(t)&&this.hass.callService("climate","set_hvac_mode",{entity_id:o.entity.entity_id,hvac_mode:t})}}>
                ${t.toUpperCase().replace(/_/g," ")}
              </button>
            `)}
          </div>
        `:""}

        <div class="climate-aux-controls">
          ${_.length>1?e.qy`
            <div class="climate-aux-strip" role="radiogroup" aria-label="Fan mode">
              ${_.map((t,a)=>e.qy`
                <button class="climate-mode-btn ${0===a?"mode-first":""} ${a===_.length-1?"mode-last":""}" role="radio"
                  aria-checked="${t===x}" ?data-active=${t===x}
                  @click=${()=>{const e=this.hass.states[o.entity.entity_id]?.attributes?.fan_modes;e?.includes(t)&&this.hass.callService("climate","set_fan_mode",{entity_id:o.entity.entity_id,fan_mode:t})}}>
                  ${t.toUpperCase().replace(/_/g," ")}
                </button>
              `)}
            </div>
          `:""}
          ${$.length>0?e.qy`
            <div class="climate-aux-strip" role="radiogroup" aria-label="Preset mode">
              ${$.map((t,a)=>e.qy`
                <button class="climate-mode-btn ${0===a?"mode-first":""} ${a===$.length-1?"mode-last":""}" role="radio"
                  aria-checked="${t===k}" ?data-active=${t===k}
                  @click=${()=>{const e=this.hass.states[o.entity.entity_id]?.attributes?.preset_modes;e?.includes(t)&&this.hass.callService("climate","set_preset_mode",{entity_id:o.entity.entity_id,preset_mode:t})}}>
                  ${t.toUpperCase().replace(/_/g," ")}
                </button>
              `)}
            </div>
          `:""}
        </div>
      </div>
    `}_getSiblingZoneTemps(){if(!this.hass||!this.areaId)return[];const e=function(e,t){if(!e?.areas)return[];const a=e.areas[t];return a?.floor_id?Object.values(e.areas).filter(e=>e.floor_id===a.floor_id&&e.area_id!==t).map(e=>e.area_id):[]}(this.hass,this.areaId),t=[];for(const a of e){const e=this.hass.areas?.[a];if(!e)continue;const r=Object.values(this.hass.entities||{}),i=this.hass.devices||{},s=new Set;Object.values(i).forEach(e=>{e.area_id===a&&s.add(e.id)});for(const i of r)if(i.entity_id?.startsWith("climate.")&&!i.hidden_by&&!i.disabled_by){if(!(i.area_id===a||!i.area_id&&i.device_id&&s.has(i.device_id)))continue;const r=this.hass.states?.[i.entity_id],n=r?.attributes?.current_temperature;if(null!=n){const a=r.attributes?.hvac_action||"off";t.push({name:e.name,temp:Math.round(Number(n)),color:(0,J.OX)(a)});break}}}return t}});const Ae=e.AH`
  :host { display: block; }

  .lcars-device-panel {
    --panel-frame-color: var(--lcars-butterscotch);
    display: grid;
    gap: var(--lcars-gap);
    width: 100%; max-width: 42rem;
    border-left: 4px solid var(--panel-frame-color);
    border-bottom: 4px solid var(--panel-frame-color);
    border-top: 2px solid var(--panel-frame-color);
    border-right: 2px solid var(--panel-frame-color);
    border-radius: 0.75rem 0.25rem 0.25rem 0.75rem;
    padding: var(--lcars-gap);
    background: var(--lcars-black);
    position: relative;
  }
  .lcars-device-panel::before {
    content: ''; position: absolute;
    top: -2px; left: -4px; width: 1.5rem; height: 1.5rem;
    border-top: 4px solid var(--panel-frame-color);
    border-left: 4px solid var(--panel-frame-color);
    border-radius: 0.75rem 0 0 0; pointer-events: none;
  }
  .lcars-device-panel::after {
    content: ''; position: absolute;
    bottom: -4px; right: -2px; width: 1.5rem; height: 1.5rem;
    border-bottom: 4px solid var(--panel-frame-color);
    border-right: 2px solid var(--panel-frame-color);
    border-radius: 0 0 0.25rem 0; pointer-events: none;
  }

  .alarm-content {
    display: grid;
    grid-template-areas: "sensors media" "keypad keypad";
    grid-template-columns: minmax(10rem, 1fr) minmax(14rem, 2fr);
    grid-template-rows: 1fr auto;
    gap: var(--lcars-gap);
    transition: border-color 600ms;
  }
  .alarm-triggered {
    border-width: 6px;
    animation: alarm-pulse 1s ease-in-out infinite;
  }
  @keyframes alarm-pulse {
    0%, 100% { border-color: var(--lcars-tomato); }
    50% { border-color: transparent; }
  }

  .alarm-header { grid-area: header; display: flex; align-items: center; gap: 0.5rem; }
  .device-panel-name { font-size: var(--lcars-font-size-sub); color: var(--panel-frame-color); text-transform: uppercase; white-space: nowrap; }
  .device-panel-header-line { flex: 1; height: 2px; background: var(--panel-frame-color); opacity: 0.5; }
  .alarm-state-badge { font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; letter-spacing: 0.1em; }
  .panel-numeric-code { font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); color: var(--panel-frame-color); opacity: 0.7; white-space: nowrap; }

  .alarm-sensors { grid-area: sensors; overflow-y: auto; }
  .device-sensor-line { display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0.5rem; cursor: pointer; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; transition: background var(--lcars-transition); font-size: var(--lcars-font-size-data); text-transform: uppercase; }
  .device-sensor-line:hover { background: rgba(255,255,255,0.05); }
  .device-sensor-line:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
  .sensor-indicator { width: 0.5rem; height: 0.5rem; border-radius: 50%; flex-shrink: 0; }
  .sensor-label { flex: 1; color: var(--lcars-space-white); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.75rem; }
  .sensor-state-value { flex-shrink: 0; font-weight: 700; font-size: var(--lcars-font-size-data); }
  .battery-section-divider { height: 1px; background: var(--lcars-gray); opacity: 0.3; margin: 0.375rem 0; }

  .alarm-viewscreen { grid-area: media; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem; }
  .alarm-shield { width: 100%; max-width: 140px; }
  .alarm-countdown { display: flex; flex-direction: column; align-items: center; }
  .alarm-countdown-num { font-family: var(--lcars-font); font-size: 3rem; font-weight: bold; }
  .alarm-countdown-label { font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); color: var(--lcars-data-accent); }
  .alarm-arm-strip { display: flex; gap: var(--lcars-gap); width: 100%; }
  .alarm-arm-btn {
    flex: 1; height: var(--lcars-btn-height);
    border: none; border-radius: var(--lcars-btn-radius);
    background: var(--lcars-disabled); color: var(--lcars-black);
    font-family: var(--lcars-font); font-size: var(--lcars-font-size-data);
    text-transform: uppercase; cursor: pointer; transition: background 200ms;
  }
  .alarm-arm-btn[data-active] { background: var(--panel-frame-color); }
  .alarm-arm-btn:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }

  .alarm-keypad { grid-area: keypad; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 0.5rem; }
  .alarm-keypad:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
  .alarm-code-display { display: flex; gap: 0.5rem; }
  .alarm-code-dot { width: 12px; height: 12px; border-radius: 50%; transition: background 200ms; }
  .alarm-pin-error { animation: alarm-shake 400ms ease-out; }
  @keyframes alarm-shake { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-6px); } 40% { transform: translateX(6px); } 60% { transform: translateX(-4px); } 80% { transform: translateX(4px); } }
  .alarm-digit-grid { display: grid; grid-template-columns: repeat(3, 3.5rem); gap: var(--lcars-gap); }
  .alarm-digit-btn {
    height: 3.5rem; border: none; border-radius: var(--lcars-btn-radius);
    background: var(--lcars-sunflower); color: var(--lcars-black);
    font-family: var(--lcars-font); font-size: 1.25rem;
    cursor: pointer; transition: background 200ms;
  }
  .alarm-digit-btn:hover { filter: brightness(1.1); }
  .alarm-digit-btn:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
  .alarm-action-btn { background: var(--lcars-disabled); }

  .panel-pip-strip { position: absolute; bottom: 4px; right: 4px; width: 2rem; height: 3px; background: var(--panel-frame-color); border-radius: 1.5px; opacity: 0.3; }

  @media (max-width: 30rem) {
    .alarm-content {
      grid-template-areas: "media" "sensors" "keypad";
      grid-template-columns: 1fr;
      grid-template-rows: auto auto auto;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .alarm-triggered { animation: none; }
    .alarm-pin-error { animation: none; }
  }
`;customElements.get("lcars-alarm-panel")||customElements.define("lcars-alarm-panel",class extends we{_alarmPinCode="";_alarmPinLimiter=ae(3,6e4);_alarmCountdown=null;_alarmCountdownTimer=null;_alarmPinError=!1;get panelType(){return"alarm"}get defaultPanelTitle(){return"Alarm"}get frameColor(){const e=this.group?.entities?.find(e=>"alarm_control_panel"===e.domain)?.state;return(0,J.of)(e?.state||"unavailable")}static get styles(){return[...super.styles,oe,le,Ae]}disconnectedCallback(){super.disconnectedCallback(),this._stopAlarmCountdown()}updated(e){super.updated(e);const t=this.group?.entities?.find(e=>"alarm_control_panel"===e.domain)?.state,a=["arming","pending","disarming"].includes(t?.state);a&&null==this._alarmCountdown?this._startAlarmCountdown(t?.attributes?.delay||60):a||null==this._alarmCountdown||this._stopAlarmCountdown()}_partitionAlarmEntities(e,t){const a=[],r=[],i=[],s=[],n=new Set(["door","window","motion","vibration","moisture","cold","smoke","safety","opening","garage_door","lock","tamper","problem"]);for(const t of e)if("alarm_control_panel"!==t.domain){if("binary_sensor"===t.domain){const e=t.state?.attributes?.device_class||"";if(n.has(e)){r.push(t);continue}}i.push(t)}else a.push(t);if(t)for(const e of t.diagnostic||[]){const t=this._getEntityState(e.entity_id);t&&s.push({entity:e,domain:e.entity_id.split(".")[0],state:t})}return{alarm:a,zones:r,auxiliary:i,diagnostics:s}}_handleAlarmPinDigit(e){this._alarmPinCode.length>=6||(this._alarmPinCode+=String(e).replace(/\D/g,"").charAt(0)||"",this._alarmPinError=!1,this.requestUpdate())}_handleAlarmPinClear(){this._alarmPinCode="",this._alarmPinError=!1,this.requestUpdate()}_handleAlarmArm(e,t){const a=this._alarmPinCode||void 0;this.hass.callService("alarm_control_panel",`alarm_arm_${t}`,{entity_id:e,...a?{code:a}:{}}),this._alarmPinCode="",this.requestUpdate()}_handleAlarmDisarm(e){if(!this._alarmPinLimiter.allow())return this._alarmPinError=!0,void this.requestUpdate();const t=this._alarmPinCode||void 0;this.hass.callService("alarm_control_panel","alarm_disarm",{entity_id:e,...t?{code:t}:{}}),this._alarmPinCode="",this.requestUpdate()}_startAlarmCountdown(e){this._alarmCountdown=Math.max(0,e),this._alarmCountdownTimer&&clearInterval(this._alarmCountdownTimer),this._alarmCountdownTimer=setInterval(()=>{this._alarmCountdown=Math.max(0,(this._alarmCountdown||0)-1),this.requestUpdate(),this._alarmCountdown<=0&&(clearInterval(this._alarmCountdownTimer),this._alarmCountdownTimer=null)},1e3)}_stopAlarmCountdown(){this._alarmCountdownTimer&&(clearInterval(this._alarmCountdownTimer),this._alarmCountdownTimer=null),this._alarmCountdown=null}_getAlarmShieldSymbol(e){switch(e){case"disarmed":return"✓";case"armed_home":case"armed_night":return"◉";case"armed_away":case"armed_vacation":return"▲";case"triggered":return"✕";case"arming":case"pending":case"disarming":return"⋯";default:return"?"}}_handleAlarmKeydown(e,t){const a=e.key;/^[0-9]$/.test(a)?(e.preventDefault(),this._handleAlarmPinDigit(a)):"Backspace"===a?(e.preventDefault(),this._alarmPinCode=this._alarmPinCode.slice(0,-1),this.requestUpdate()):"Enter"===a?(e.preventDefault(),this._handleAlarmDisarm(t)):"Escape"===a&&(e.preventDefault(),this._handleAlarmPinClear())}renderBadge(){const t=this.group?.entities?.find(e=>"alarm_control_panel"===e.domain)?.state,a=t?.state||"unavailable",r=(0,J.of)(a),i=(a||"unknown").toUpperCase().replace(/_/g," ");return e.qy`<span style="color:${r}">${i}</span>`}renderContent(){const t=this._getDeviceCategoryEntities(this.group.device.id),{alarm:a,zones:r,auxiliary:i}=this._partitionAlarmEntities(this.group.entities,t),s=this._shortDeviceName(this.group.device)||"Alarm";if(0===a.length)return e.qy``;const n=a[0],o=n.state,l=o?.state||"unavailable",c=(0,J.of)(l),d=["arming","pending","disarming"].includes(l),p="triggered"===l,u=this._getAlarmShieldSymbol(l),m=(l||"unknown").toUpperCase().replace(/_/g," "),h=!1!==o?.attributes?.code_required,v=Array.from({length:6},(e,t)=>t<this._alarmPinCode.length);return e.qy`
      <div class="alarm-content ${p?"alarm-triggered":""}" data-state="${l}">

        <div class="alarm-sensors" role="list" aria-label="${s} zones">
          ${r.map(({entity:t,state:a})=>{const r=this._friendlyName(a,t),i="on"===a.state,s=i?"var(--lcars-butterscotch)":"var(--lcars-gray)";return e.qy`
              <div class="device-sensor-line" tabindex="0" role="listitem"
                aria-label="${r}: ${i?"open":"closed"}"
                @click=${()=>this._handleEntityClick(t.entity_id)}
                @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._handleEntityClick(t.entity_id))}}>
                <div class="sensor-indicator" style="background:${s}"></div>
                <span class="sensor-label">${r}</span>
                <span class="sensor-state-value" style="color:${s}">${i?"OPEN":"CLOSED"}</span>
              </div>
            `})}
          ${i.length>0?e.qy`
            <div class="battery-section-divider"></div>
            ${i.map(({entity:t,state:a})=>{const r=this._friendlyName(a,t),i=this._getSensorIndicatorColor(a);return e.qy`
                <div class="device-sensor-line" tabindex="0" role="listitem"
                  @click=${()=>this._handleEntityClick(t.entity_id)}
                  @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._handleEntityClick(t.entity_id))}}>
                  <div class="sensor-indicator" style="background:${i}"></div>
                  <span class="sensor-label">${r}</span>
                  <span class="sensor-state-value" style="color:${i}">${a.state}</span>
                </div>
              `})}
          `:""}
        </div>

        <div class="alarm-viewscreen">
          ${d&&null!=this._alarmCountdown?e.qy`
            <div class="alarm-countdown" aria-live="polite">
              <span class="alarm-countdown-num" style="color:${c}">${this._alarmCountdown}</span>
              <span class="alarm-countdown-label">${m}</span>
            </div>
          `:e.qy`
            <svg class="alarm-shield" viewBox="0 0 160 180" role="img" aria-label="${s}: ${m}">
              <path d="M80,10 L145,45 L145,110 Q145,160 80,175 Q15,160 15,110 L15,45 Z" fill="none" stroke="${c}" stroke-width="4" />
              <text x="80" y="105" text-anchor="middle" fill="${c}" font-family="var(--lcars-font)" font-size="48">${u}</text>
              <text x="80" y="145" text-anchor="middle" fill="${c}" font-family="var(--lcars-font)" font-size="14">${m}</text>
            </svg>
          `}
          <div class="alarm-arm-strip" role="radiogroup" aria-label="Arm mode">
            ${["home","away","night"].map(t=>e.qy`
              <button class="alarm-arm-btn" role="radio" aria-checked="${l===`armed_${t}`}"
                ?data-active=${l===`armed_${t}`}
                @click=${()=>this._handleAlarmArm(n.entity.entity_id,t)}>
                ${t.toUpperCase()}
              </button>
            `)}
          </div>
        </div>

        ${h?e.qy`
          <div class="alarm-keypad" tabindex="0" aria-label="PIN keypad"
            @keydown=${e=>this._handleAlarmKeydown(e,n.entity.entity_id)}>
            <div class="alarm-code-display ${this._alarmPinError?"alarm-pin-error":""}" role="status" aria-live="polite">
              ${v.map(t=>e.qy`
                <div class="alarm-code-dot" style="background:${t?this._alarmPinError?"var(--lcars-tomato)":c:"var(--lcars-disabled)"}"></div>
              `)}
            </div>
            <div class="alarm-digit-grid">
              ${[1,2,3,4,5,6,7,8,9].map(t=>e.qy`
                <button class="alarm-digit-btn" aria-label="Digit ${t}" @click=${()=>this._handleAlarmPinDigit(t)}>${t}</button>
              `)}
              <button class="alarm-digit-btn alarm-action-btn" aria-label="Clear code" @click=${()=>this._handleAlarmPinClear()}>⌫</button>
              <button class="alarm-digit-btn" aria-label="Digit 0" @click=${()=>this._handleAlarmPinDigit(0)}>0</button>
              <button class="alarm-digit-btn alarm-action-btn" aria-label="Disarm" @click=${()=>this._handleAlarmDisarm(n.entity.entity_id)}>⏎</button>
            </div>
          </div>
        `:""}
      </div>
    `}});const qe=e.AH`
  :host { display: block; }

  .lcars-device-panel {
    --panel-frame-color: var(--lcars-african-violet);
    display: grid;
    gap: var(--lcars-gap);
    width: 100%; max-width: 42rem;
    border-left: 4px solid var(--panel-frame-color);
    border-bottom: 4px solid var(--panel-frame-color);
    border-top: 2px solid var(--panel-frame-color);
    border-right: 2px solid var(--panel-frame-color);
    border-radius: 0.75rem 0.25rem 0.25rem 0.75rem;
    padding: var(--lcars-gap);
    background: var(--lcars-black);
    position: relative;
  }
  .lcars-device-panel::before {
    content: ''; position: absolute;
    top: -2px; left: -4px; width: 1.5rem; height: 1.5rem;
    border-top: 4px solid var(--panel-frame-color);
    border-left: 4px solid var(--panel-frame-color);
    border-radius: 0.75rem 0 0 0; pointer-events: none;
  }
  .lcars-device-panel::after {
    content: ''; position: absolute;
    bottom: -4px; right: -2px; width: 1.5rem; height: 1.5rem;
    border-bottom: 4px solid var(--panel-frame-color);
    border-right: 2px solid var(--panel-frame-color);
    border-radius: 0 0 0.25rem 0; pointer-events: none;
  }

  .media-content {
    display: grid;
    grid-template-areas:
      "metadata media"
      "waveform waveform"
      "volume   volume";
    grid-template-columns: minmax(8rem, 1fr) minmax(14rem, 2.5fr);
    grid-template-rows: 1fr auto auto;
    gap: var(--lcars-gap);
    transition: border-color 600ms;
  }
  .media-idle { opacity: 0.7; }

  .media-header { grid-area: header; display: flex; align-items: center; gap: 0.5rem; }
  .device-panel-name { font-size: var(--lcars-font-size-sub); color: var(--panel-frame-color); text-transform: uppercase; white-space: nowrap; }
  .device-panel-header-line { flex: 1; height: 2px; background: var(--panel-frame-color); opacity: 0.5; }
  .media-state-badge { font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; }
  .panel-numeric-code { font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); color: var(--panel-frame-color); opacity: 0.7; white-space: nowrap; }

  .media-metadata { grid-area: metadata; overflow-y: auto; }
  .device-sensor-line { display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0.5rem; cursor: pointer; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; transition: background var(--lcars-transition); font-size: var(--lcars-font-size-data); text-transform: uppercase; }
  .device-sensor-line:hover { background: rgba(255,255,255,0.05); }
  .device-sensor-line:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
  .sensor-indicator { width: 0.5rem; height: 0.5rem; border-radius: 50%; flex-shrink: 0; }
  .sensor-label { flex: 1; color: var(--lcars-space-white); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.75rem; }
  .sensor-state-value { flex-shrink: 0; font-weight: 700; font-size: var(--lcars-font-size-data); }

  /* Viewscreen */
  .media-viewscreen {
    grid-area: media; display: flex; flex-direction: column;
    border: 2px solid var(--panel-frame-color); border-radius: 4px;
    overflow: hidden; cursor: pointer; position: relative;
  }
  .media-viewscreen::before, .media-viewscreen::after {
    content: ''; position: absolute; width: 1.5rem; height: 1.5rem;
    border: 2px solid var(--panel-frame-color); z-index: 1;
  }
  .media-viewscreen::before { top: 4px; left: 4px; border-right: none; border-bottom: none; }
  .media-viewscreen::after { bottom: 4px; right: 4px; border-left: none; border-top: none; }
  .media-art { width: 100%; aspect-ratio: 1/1; max-height: 18rem; object-fit: cover; }
  .media-idle-display { display: flex; flex-direction: column; align-items: center; justify-content: center; aspect-ratio: 1/1; max-height: 12rem; color: var(--lcars-gray); }
  .media-idle-glyph { font-size: 3rem; }
  .media-idle-label { font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); }
  .media-now-playing { padding: 0.5rem; background: rgba(0,0,0,0.5); }
  .media-title { font-family: var(--lcars-font); font-size: var(--lcars-font-size-sub); color: var(--lcars-sunflower); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .media-artist { font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); color: var(--lcars-african-violet); }
  .media-viewscreen-glow { box-shadow: 0 0 12px 4px var(--lcars-african-violet); animation: lcars-media-glow 3s ease-in-out infinite; }
  @keyframes lcars-media-glow {
    0%, 100% { box-shadow: 0 0 6px 2px var(--lcars-african-violet); }
    50%      { box-shadow: 0 0 14px 6px var(--lcars-african-violet); }
  }

  /* Audio waveform */
  .lcars-audio-waveform {
    grid-area: waveform;
    display: flex; align-items: flex-end; justify-content: center;
    gap: 2px; height: 32px; overflow: hidden;
  }
  .lcars-audio-waveform .bar {
    width: 2px; border-radius: 1px 1px 0 0;
    background: var(--lcars-ice); height: 60%;
    transform-origin: bottom; transform: scaleY(var(--bar-min-ratio, 0.17));
    will-change: transform;
    animation: lcars-waveform var(--bar-dur, 400ms) ease-in-out alternate infinite;
    animation-delay: var(--bar-delay, 0ms);
  }
  .lcars-audio-waveform .bar.peak { background: var(--lcars-tomato); }
  .lcars-audio-waveform[data-paused] .bar { animation-play-state: paused; transform: scaleY(0.03); opacity: 0.3; }
  @keyframes lcars-waveform { 0% { transform: scaleY(var(--bar-min-ratio, 0.17)); } 100% { transform: scaleY(1); } }

  /* Controls */
  .media-controls { grid-area: volume; display: flex; flex-direction: column; gap: 0.5rem; padding: 0.5rem; }
  .media-transport { display: flex; justify-content: center; gap: var(--lcars-gap); }
  .media-transport-btn {
    width: 2.5rem; height: 2.5rem; border: none; border-radius: 50%;
    background: var(--lcars-disabled); color: var(--lcars-space-white);
    font-size: 1rem; cursor: pointer; transition: background 200ms;
  }
  .media-transport-btn:hover { background: var(--lcars-gray); }
  .media-transport-btn:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
  .media-play-btn { width: 3.5rem; background: var(--lcars-african-violet); color: var(--lcars-black); }
  .media-transport-btn[aria-pressed="true"] { background: var(--lcars-african-violet); color: var(--lcars-black); }
  .media-volume { display: flex; align-items: center; gap: 0.5rem; }
  .media-mute-btn { border: none; background: transparent; font-size: 1.25rem; cursor: pointer; }
  .media-volume-bar { flex: 1; height: 0.75rem; background: var(--lcars-disabled); border-radius: var(--lcars-btn-radius); cursor: pointer; position: relative; overflow: hidden; }
  .media-volume-bar:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
  .media-volume-fill { height: 100%; background: var(--lcars-african-violet); border-radius: inherit; transition: width 200ms; }
  .media-volume-pct { font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); color: var(--lcars-data-accent); min-width: 3rem; text-align: right; }

  .panel-pip-strip { position: absolute; bottom: 4px; right: 4px; width: 2rem; height: 3px; background: var(--panel-frame-color); border-radius: 1.5px; opacity: 0.3; }

  /* ─── 4X-43: Secondary Speaker Outputs ─── */
  .media-secondary-outputs {
    border-top: 2px solid var(--lcars-gray);
    padding-top: 0.5rem;
    margin-top: 0.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .media-secondary-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.5rem;
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    text-transform: uppercase;
    cursor: pointer;
    transition: background var(--lcars-transition);
    min-height: 2rem;
  }
  .media-secondary-row:hover { background: rgba(255,255,255,0.05); }
  .media-secondary-row:focus-visible {
    outline: 2px solid var(--lcars-ice);
    outline-offset: 2px;
  }
  .media-secondary-indicator {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .media-secondary-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--lcars-space-white);
    font-size: 0.75rem;
  }
  .media-secondary-state {
    flex-shrink: 0;
    font-weight: 700;
  }
  .media-secondary-playpause {
    width: 1.75rem;
    height: 1.75rem;
    border: none;
    border-radius: 50%;
    background: var(--lcars-disabled);
    color: var(--lcars-space-white);
    font-size: 0.75rem;
    cursor: pointer;
    flex-shrink: 0;
    transition: background 200ms;
  }
  .media-secondary-playpause:hover { background: var(--lcars-african-violet); color: var(--lcars-black); }
  .media-secondary-playpause:focus-visible {
    outline: 2px solid var(--lcars-ice);
    outline-offset: 2px;
  }
  .media-secondary-volume {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    flex: 0 1 8rem;
  }

  @media (max-width: 30rem) {
    .media-content {
      grid-template-areas: "media" "metadata" "waveform" "volume";
      grid-template-columns: 1fr;
      grid-template-rows: auto auto auto auto;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .lcars-audio-waveform .bar { animation: none !important; transform: scaleY(0.17); }
    .media-viewscreen-glow { animation: none; }
  }
`;customElements.get("lcars-media-panel")||customElements.define("lcars-media-panel",class extends we{get panelType(){return"media"}get defaultPanelTitle(){return"Media"}get frameColor(){return"var(--lcars-african-violet)"}static get styles(){return[...super.styles,oe,le,qe]}_isValidArtworkUrl(e){return!!e&&(e.startsWith("/api/")||e.startsWith("/local/"))}_getMediaTransportSymbol(e){switch(e){case"playing":return"▶";case"paused":return"❚❚";default:return"■"}}_partitionMediaEntities(e){const t=[],a=[],r=[],i=[];for(const s of e)"media_player"!==s.domain?"remote"!==s.domain?A.has(s.domain)?a.push(s):r.push(s):i.push(s):t.push(s);return{player:t,sensors:a,controls:r,remotes:i}}_handleMediaService(e,t,a={}){this.hass.callService("media_player",t,{entity_id:e,...a})}_handleVolumeChange(e,t){const a=t.currentTarget.getBoundingClientRect(),r=Math.max(0,Math.min(1,(t.clientX-a.left)/a.width));this._handleMediaService(e,"volume_set",{volume_level:Math.round(100*r)/100})}renderBadge(){const t=this.group?.entities?.find(e=>"media_player"===e.domain);if(!t)return e.qy``;const a=t.state?.state||"unavailable",r=(0,J.uT)(a),i=this._getMediaTransportSymbol(a);return e.qy`<span style="color:${r}">${i} ${a.toUpperCase()}</span>`}renderContent(){const{player:t,sensors:a}=this._partitionMediaEntities(this.group.entities),r=this._shortDeviceName(this.group.device)||"Media";if(0===t.length)return e.qy``;const i=this._selectPrimary(t),s=t.filter(e=>e!==i),n=i.state,o=n?.attributes||{},l=n?.state||"unavailable",c=((0,J.uT)(l),this._getMediaTransportSymbol(l),"playing"===l),d=!(c||"paused"===l),p=o.entity_picture,u=this._isValidArtworkUrl(p),m=o.media_title||"",h=o.media_artist||"",v=o.source||"",f=null!=o.volume_level?Number(o.volume_level):0,g=o.is_volume_muted||!1,b=o.supported_features||0,y=!!(16&b),w=!!(32&b),_=!!(4&b),x=!!(32768&b),$=!!(262144&b),k=o.shuffle||!1,S=o.repeat||"off";return e.qy`
      <div class="media-content ${d?"media-idle":""}">

        <div class="media-metadata" role="list" aria-label="${r} info">
          ${v?e.qy`<div class="device-sensor-line" role="listitem"><div class="sensor-indicator" style="background:var(--lcars-african-violet)"></div><span class="sensor-label">Source</span><span class="sensor-state-value">${v}</span></div>`:""}
          ${x?e.qy`<div class="device-sensor-line" role="listitem"><div class="sensor-indicator" style="background:${k?"var(--lcars-african-violet)":"var(--lcars-gray)"}"></div><span class="sensor-label">Shuffle</span><span class="sensor-state-value">${k?"ON":"OFF"}</span></div>`:""}
          ${$?e.qy`<div class="device-sensor-line" role="listitem"><div class="sensor-indicator" style="background:${"off"!==S?"var(--lcars-african-violet)":"var(--lcars-gray)"}"></div><span class="sensor-label">Repeat</span><span class="sensor-state-value">${S.toUpperCase()}</span></div>`:""}
          ${a.map(({entity:t,state:a})=>{const r=this._friendlyName(a,t),i=this._getSensorIndicatorColor(a);return e.qy`
              <div class="device-sensor-line" tabindex="0" role="listitem"
                @click=${()=>this._handleEntityClick(t.entity_id)}
                @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._handleEntityClick(t.entity_id))}}>
                <div class="sensor-indicator" style="background:${i}"></div>
                <span class="sensor-label">${r}</span>
                <span class="sensor-state-value" style="color:${i}">${a.state}</span>
              </div>
            `})}
        </div>

        <div class="media-viewscreen ${c?"media-viewscreen-glow":""}" @click=${()=>this._handleEntityClick(i.entity.entity_id)}>
          ${u&&!d?e.qy`
            <img class="media-art" src="${p}" alt="Album art"
              crossorigin="anonymous" referrerpolicy="no-referrer" loading="lazy"
              @error=${e=>{e.target.style.display="none"}} />
          `:e.qy`
            <div class="media-idle-display">
              <span class="media-idle-glyph">&#9834;</span>
              <span class="media-idle-label">STANDBY</span>
            </div>
          `}
          ${d?"":e.qy`
            <div class="media-now-playing">
              ${m?e.qy`<div class="media-title">${m}</div>`:""}
              ${h?e.qy`<div class="media-artist">${h}</div>`:""}
            </div>
          `}
        </div>

        <div class="lcars-audio-waveform" ?data-paused=${!c} aria-hidden="true">
          ${Array.from({length:12},(t,a)=>{const r=Math.floor(a/3),i=[380,420,350,460][r];return e.qy`<div class="bar ${2===a||8===a?"peak":""}"
              style="--bar-dur:${i+a%3*30}ms;--bar-delay:${50*a}ms;--bar-min-ratio:${.1+.05*r}"></div>`})}
        </div>

        <div class="media-controls">
          <div class="media-transport" role="toolbar" aria-label="Transport controls">
            ${x?e.qy`<button class="media-transport-btn" aria-pressed="${k}" title="Shuffle" @click=${()=>this._handleMediaService(i.entity.entity_id,"shuffle_set",{shuffle:!k})}>⇄</button>`:""}
            ${y?e.qy`<button class="media-transport-btn" title="Previous" @click=${()=>this._handleMediaService(i.entity.entity_id,"media_previous_track")}>⏮</button>`:""}
            <button class="media-transport-btn media-play-btn" title="${c?"Pause":"Play"}"
              @click=${()=>this._handleMediaService(i.entity.entity_id,c?"media_pause":"media_play")}>
              ${c?"❚❚":"▶"}
            </button>
            ${w?e.qy`<button class="media-transport-btn" title="Next" @click=${()=>this._handleMediaService(i.entity.entity_id,"media_next_track")}>⏭</button>`:""}
            ${$?e.qy`<button class="media-transport-btn" aria-pressed="${"off"!==S}" title="Repeat: ${S}" @click=${()=>this._handleMediaService(i.entity.entity_id,"repeat_set",{repeat:"off"===S?"all":"all"===S?"one":"off"})}>🔁</button>`:""}
          </div>
          ${_?e.qy`
            <div class="media-volume" aria-label="Volume: ${Math.round(100*f)}%">
              <button class="media-mute-btn" aria-pressed="${g}" title="${g?"Unmute":"Mute"}"
                @click=${()=>this._handleMediaService(i.entity.entity_id,"volume_mute",{is_volume_muted:!g})}>
                ${g?"🔇":"🔊"}
              </button>
              <div class="media-volume-bar" tabindex="0" role="slider"
                aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(100*f)}"
                @click=${e=>this._handleVolumeChange(i.entity.entity_id,e)}
                @keydown=${e=>{"ArrowRight"===e.key&&(e.preventDefault(),this._handleMediaService(i.entity.entity_id,"volume_set",{volume_level:Math.min(1,f+.05)})),"ArrowLeft"===e.key&&(e.preventDefault(),this._handleMediaService(i.entity.entity_id,"volume_set",{volume_level:Math.max(0,f-.05)})),"Home"===e.key&&(e.preventDefault(),this._handleMediaService(i.entity.entity_id,"volume_set",{volume_level:0})),"End"===e.key&&(e.preventDefault(),this._handleMediaService(i.entity.entity_id,"volume_set",{volume_level:1})),"PageUp"===e.key&&(e.preventDefault(),this._handleMediaService(i.entity.entity_id,"volume_set",{volume_level:Math.min(1,f+.1)})),"PageDown"===e.key&&(e.preventDefault(),this._handleMediaService(i.entity.entity_id,"volume_set",{volume_level:Math.max(0,f-.1)}))}}>
                <div class="media-volume-fill" style="width:${Math.round(100*f)}%"></div>
              </div>
              <span class="media-volume-pct">${Math.round(100*f)}%</span>
            </div>
          `:""}
        </div>
      </div>

      ${s.length>0?this._renderSecondaryOutputs(s):""}
    `}_selectPrimary(e){const t=e.find(e=>"playing"===e.state?.state);if(t)return t;return e.find(e=>"paused"===e.state?.state)||e.reduce((e,t)=>{const a=e.state?.attributes?.supported_features||0;return(t.state?.attributes?.supported_features||0)>a?t:e},e[0])}_renderSecondaryOutputs(t){return e.qy`
      <div class="media-secondary-outputs" role="list" aria-label="Additional speakers">
        ${t.map(t=>{const a=t.entity?.entity_id||"",r=t.state?.attributes?.friendly_name||a,i=t.state?.state||"unavailable",s=null!=t.state?.attributes?.volume_level?Number(t.state.attributes.volume_level):0,n=(t.state,"playing"===i),o="paused"===i,l=!!(4&(t.state?.attributes?.supported_features||0)),c=(0,J.uT)(i),d=this._getMediaTransportSymbol(i);return e.qy`
            <div class="media-secondary-row" role="listitem"
                 tabindex="0"
                 aria-label="${r}: ${i}"
                 @click=${()=>this._handleEntityClick(a)}
                 @keydown=${e=>("Enter"===e.key||" "===e.key)&&(e.preventDefault(),this._handleEntityClick(a))}>
              <span class="media-secondary-indicator" style="background:${c}"></span>
              <span class="media-secondary-name">${r}</span>
              <span class="media-secondary-state" style="color:${c}">${d}</span>
              ${n||o?e.qy`
                <button class="media-secondary-playpause"
                        aria-label="${n?"Pause":"Play"} ${r}"
                        @click=${e=>{e.stopPropagation(),this._handleMediaService(a,n?"media_pause":"media_play")}}>
                  ${n?"❚❚":"▶"}
                </button>
              `:""}
              ${l?e.qy`
                <div class="media-secondary-volume">
                  <div class="media-volume-bar" tabindex="0" role="slider"
                    aria-label="${r} volume"
                    aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(100*s)}"
                    @click=${e=>{e.stopPropagation(),this._handleVolumeChange(a,e)}}>
                    <div class="media-volume-fill" style="width:${Math.round(100*s)}%"></div>
                  </div>
                  <span class="media-volume-pct">${Math.round(100*s)}%</span>
                </div>
              `:""}
            </div>
          `})}
      </div>
    `}});const Pe=e.AH`
  :host { display: block; }

  .lcars-device-panel {
    display: grid;
    gap: var(--lcars-gap);
    width: 100%; max-width: 42rem;
    border-left: 4px solid var(--panel-frame-color);
    border-bottom: 4px solid var(--panel-frame-color);
    border-top: 2px solid var(--panel-frame-color);
    border-right: 2px solid var(--panel-frame-color);
    border-radius: 0.75rem 0.25rem 0.25rem 0.75rem;
    padding: var(--lcars-gap);
    background: var(--lcars-black);
    position: relative;
  }
  .lcars-device-panel::before {
    content: ''; position: absolute;
    top: -2px; left: -4px; width: 1.5rem; height: 1.5rem;
    border-top: 4px solid var(--panel-frame-color);
    border-left: 4px solid var(--panel-frame-color);
    border-radius: 0.75rem 0 0 0; pointer-events: none;
  }
  .lcars-device-panel::after {
    content: ''; position: absolute;
    bottom: -4px; right: -2px; width: 1.5rem; height: 1.5rem;
    border-bottom: 4px solid var(--panel-frame-color);
    border-right: 2px solid var(--panel-frame-color);
    border-radius: 0 0 0.25rem 0; pointer-events: none;
  }

  /* Freeze protection banner */
  .freeze-banner {
    background: var(--lcars-tomato);
    color: var(--lcars-black);
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    padding: 0.25rem 0.75rem;
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    text-align: center;
    animation: freeze-pulse 3s ease-in-out infinite;
  }
  .freeze-icon { margin-right: 0.25rem; }
  .freeze-nominal {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    color: var(--lcars-gray);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    opacity: 0.5;
    padding: 0 0.5rem;
  }
  @keyframes freeze-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }
  .freeze-active {
    border-color: var(--lcars-ice) !important;
  }

  .pool-content {
    display: grid;
    grid-template-areas:
      "chemistry aquatics  controls"
      "lighting  lighting  lighting";
    grid-template-columns: minmax(8rem, 1fr) minmax(20rem, 3fr) minmax(8rem, 1.2fr);
    grid-template-rows: 1fr auto;
    gap: var(--lcars-gap);
  }
  .pool-content.pool-no-chem {
    grid-template-areas:
      "aquatics controls"
      "lighting lighting";
    grid-template-columns: minmax(20rem, 3fr) minmax(8rem, 1.2fr);
  }

  .pool-header { grid-area: header; display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
  .device-panel-name { font-size: var(--lcars-font-size-sub); color: var(--panel-frame-color); text-transform: uppercase; white-space: nowrap; }
  .device-panel-header-line { flex: 1; height: 2px; background: var(--panel-frame-color); opacity: 0.5; }
  .panel-numeric-code { font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); color: var(--panel-frame-color); opacity: 0.7; white-space: nowrap; }
  .pool-temp-badge { font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); margin-left: 0.5rem; }

  /* Chemistry — segmented bars */
  .pool-chemistry { grid-area: chemistry; overflow-y: auto; }
  .chem-reading {
    display: flex; flex-direction: column; gap: 0.125rem;
    padding: 0.25rem 0.5rem; cursor: pointer;
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    transition: background var(--lcars-transition);
  }
  .chem-reading:hover { background: rgba(255,255,255,0.05); }
  .chem-reading:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
  .chem-label {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    color: var(--lcars-space-white);
    text-transform: uppercase;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .source-pill {
    display: inline-block;
    font-size: 0.5rem;
    padding: 0 0.2rem;
    border: 1px solid var(--lcars-gray);
    border-radius: 2px;
    vertical-align: middle;
    color: var(--lcars-gray);
    line-height: 1.2;
  }

  /* Legacy sensor lines (environmental, diagnostics) */
  .device-sensor-line { display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0.5rem; cursor: pointer; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; transition: background var(--lcars-transition); font-size: var(--lcars-font-size-data); text-transform: uppercase; }
  .device-sensor-line:hover { background: rgba(255,255,255,0.05); }
  .device-sensor-line:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
  /* Compliance #5 equivalent: mini-bars not dots */
  .sensor-indicator-bar { width: 2px; height: 1rem; border-radius: 1px; flex-shrink: 0; }
  .sensor-indicator { width: 0.5rem; height: 0.5rem; border-radius: 50%; flex-shrink: 0; }
  .sensor-label {
    flex: 1; color: var(--lcars-space-white);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    font-size: var(--lcars-font-size-data); /* Compliance #3: use LCARS 3-tier font */
  }
  .sensor-state-value { flex-shrink: 0; font-weight: 700; font-size: var(--lcars-font-size-data); }

  /* Aquatics center */
  .pool-aquatics { grid-area: aquatics; display: flex; gap: var(--lcars-gap); justify-content: center; }
  .pool-body-frame {
    flex: 1;
    /* Compliance #6: asymmetric borders — thick left/top, thin right/bottom */
    border-left: 3px solid var(--body-color);
    border-top: 3px solid var(--body-color);
    border-right: 1px solid var(--body-color);
    border-bottom: 1px solid var(--body-color);
    border-radius: 0.5rem 0.25rem 0.25rem 0.25rem;
    padding: 0.5rem; text-align: center; display: flex; flex-direction: column;
    align-items: center; gap: 0.25rem; position: relative;
    background: var(--lcars-black, #000);
  }
  /* Thermal tint backgrounds */
  .pool-body-frame.thermal-cool { background: rgba(153, 204, 255, 0.04); }
  .pool-body-frame.thermal-warm { background: rgba(255, 180, 100, 0.04); }
  /* Compliance #2: Asymmetric mini-elbow brackets */
  .pool-body-frame::before {
    content: ''; position: absolute;
    top: 4px; left: 4px; width: 1.5rem; height: 1.5rem;
    border-top: 3px solid var(--body-color);
    border-left: 3px solid var(--body-color);
    border-right: none; border-bottom: none;
    border-radius: 0.5rem 0 0 0;
    pointer-events: none;
  }
  .pool-body-frame::after {
    content: ''; position: absolute;
    bottom: 4px; right: 4px; width: 1.5rem; height: 1.5rem;
    border-bottom: 1px solid var(--body-color);
    border-right: 1px solid var(--body-color);
    border-left: none; border-top: none;
    border-radius: 0 0 0.25rem 0;
    pointer-events: none;
  }
  .pool-body-label { font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; letter-spacing: 0.1em; }
  /* Compliance #4: map to LCARS title tier */
  .pool-body-temp { font-family: var(--lcars-font); font-size: var(--lcars-font-size-title); font-weight: bold; }
  .pool-setpoint-row { display: flex; align-items: center; gap: 0.5rem; }
  .pool-target { font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); }

  /* Compliance #1: Endcap pill setpoint buttons, not circles */
  .pool-sp-btn {
    width: 3rem; height: 2.5rem;
    border: none;
    background: var(--lcars-disabled);
    color: var(--lcars-space-white);
    font-size: 1.25rem; font-family: var(--lcars-font);
    cursor: pointer; transition: background 200ms;
    border-radius: 0;
  }
  .pool-sp-btn:hover { background: var(--panel-frame-color); }
  .pool-sp-btn:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
  .pool-sp-btn.sp-decrement {
    border-radius: var(--lcars-btn-radius) 0 0 var(--lcars-btn-radius);
  }
  .pool-sp-btn.sp-increment {
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
  }

  /* Heating indicator bar — flat pulse, no gradient (Bracer Jack Rule 1) */
  .pool-heating-bar {
    width: 100%; height: 3px;
    margin-top: 0.25rem;
    border-radius: 1.5px;
    background: var(--body-color);
    animation: pool-heat-pulse 2s ease-in-out infinite;
  }
  @keyframes pool-heat-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  /* Circuit groups */
  .circuit-group { margin-bottom: 0.5rem; }
  .circuit-group-label {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    color: var(--lcars-sky, #aaaaff);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 0 0.5rem;
    margin-bottom: 0.25rem;
  }
  .circuit-count { color: var(--lcars-gray); }

  /* Controls */
  .pool-controls { grid-area: controls; display: flex; flex-direction: column; gap: var(--lcars-gap); }
  .device-control-btn {
    display: flex; align-items: center; gap: 0.375rem; height: 2.25rem;
    padding: 0 0.75rem; background: var(--lcars-sunflower); color: var(--lcars-black);
    border: none; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    font-family: var(--lcars-font); font-size: var(--lcars-font-size-data);
    text-transform: uppercase; cursor: pointer;
    transition: filter var(--lcars-transition), background var(--lcars-transition);
    white-space: nowrap; position: relative; overflow: hidden;
  }
  .device-control-btn:hover { filter: brightness(1.15); }
  .device-control-btn:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
  .device-control-btn ha-icon { --mdc-icon-size: 16px; flex-shrink: 0; }
  .device-control-btn[data-on] { background: var(--lcars-gold); }
  .device-control-btn[data-off] { background: var(--lcars-gray); color: var(--lcars-space-white); }
  .device-control-btn::after {
    content: ''; position: absolute; top: 50%; left: 50%;
    width: 1rem; height: 1rem; margin: -0.5rem 0 0 -0.5rem;
    border-radius: 50%; background: var(--lcars-space-white);
    opacity: 0; pointer-events: none;
  }
  .device-control-btn:active::after { animation: lcars-button-flash var(--lcars-anim-flash, 300ms) ease-out forwards; }
  @keyframes lcars-button-flash {
    0% { transform: scale(0); opacity: 0.6; }
    100% { transform: scale(6); opacity: 0; }
  }

  /* Pump spinner */
  .lcars-pump-spinner { display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px; position: relative; }
  .lcars-pump-spinner .dot { position: absolute; width: 4px; height: 4px; border-radius: 50%; background: var(--lcars-ice); opacity: 0.3; }
  .lcars-pump-spinner .dot:nth-child(1) { top: 0; left: 5px; }
  .lcars-pump-spinner .dot:nth-child(2) { bottom: 1px; left: 0; }
  .lcars-pump-spinner .dot:nth-child(3) { bottom: 1px; right: 0; }
  .lcars-pump-spinner.on { animation: lcars-pump-spin 1.2s linear infinite; }
  .lcars-pump-spinner.on .dot { opacity: 1; }
  .lcars-pump-spinner.on .dot:nth-child(2) { opacity: 0.6; }
  .lcars-pump-spinner.on .dot:nth-child(3) { opacity: 0.3; }
  @keyframes lcars-pump-spin { to { transform: rotate(360deg); } }

  /* Lighting */
  .pool-lighting { grid-area: lighting; display: flex; gap: var(--lcars-gap); flex-wrap: wrap; }

  .panel-pip-strip { position: absolute; bottom: 4px; right: 4px; width: 2rem; height: 3px; background: var(--panel-frame-color); border-radius: 1.5px; opacity: 0.3; }

  @media (max-width: 30rem) {
    .pool-content {
      grid-template-areas: "aquatics" "chemistry" "controls" "lighting";
      grid-template-columns: 1fr;
      grid-template-rows: auto auto auto auto;
    }
    .pool-content.pool-no-chem {
      grid-template-areas: "aquatics" "controls" "lighting";
      grid-template-columns: 1fr;
      grid-template-rows: auto auto auto;
    }
    .pool-aquatics {
      flex-direction: column;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .lcars-pump-spinner.on { animation: none; }
    .pool-heating-bar { animation: none; }
    .freeze-banner { animation: none; }
  }
`;class Te extends e.WF{static get properties(){return{value:{type:Number},min:{type:Number},max:{type:Number},segments:{type:Number},thresholds:{type:Array},label:{type:String}}}constructor(){super(),this.value=0,this.min=0,this.max=100,this.segments=7,this.thresholds=[],this.label=""}static get styles(){return[r.AM,e.AH`
        :host { display: inline-flex; align-items: center; gap: 0.5rem; }

        .bar-container {
          display: flex;
          align-items: center;
          gap: 1px;
          min-height: 24px;
        }

        .segment {
          width: 4px;
          height: 12px;
          background: var(--lcars-gray, #666688);
          opacity: 0.3;
          transition: opacity 200ms, background 200ms;
        }

        .segment.filled {
          opacity: 1;
        }

        .segment:last-child {
          border-radius: 0 var(--lcars-endcap, 2px) var(--lcars-endcap, 2px) 0;
        }

        .bar-value {
          font-family: var(--lcars-font);
          font-size: var(--lcars-font-size-data);
          color: var(--lcars-space-white);
          white-space: nowrap;
          min-width: 2.5rem;
          text-align: right;
        }
      `]}_getColorForValue(e){if(!this.thresholds?.length)return"var(--lcars-ice)";let t=this.thresholds[0]?.color||"var(--lcars-ice)";for(const a of this.thresholds){if(!(e>=a.value))break;t=a.color}return t}render(){const t=this.max-this.min,a=t>0?Math.max(0,Math.min(1,(this.value-this.min)/t)):0,r=Math.round(a*this.segments),i=this._getColorForValue(this.value),s=[];for(let t=0;t<this.segments;t++){const a=t<r;s.push(e.qy`<div class="segment ${a?"filled":""}"
          style="${a?`background: ${i}`:""}"></div>`)}return e.qy`
      <div class="bar-container"
        role="meter"
        aria-valuenow="${this.value}"
        aria-valuemin="${this.min}"
        aria-valuemax="${this.max}"
        aria-label="${this.label}">
        ${s}
      </div>
      <span class="bar-value">${this._formatValue()}</span>
    `}_formatValue(){return null==this.value?"—":Number.isInteger(this.value)?String(this.value):this.value.toFixed(1)}}customElements.define("lcars-segmented-bar",Te);customElements.get("lcars-pool-spa-panel")||customElements.define("lcars-pool-spa-panel",class extends we{get panelType(){return"pool-spa"}get defaultPanelTitle(){return"Pool & Spa"}get frameColor(){return"var(--lcars-bluey)"}static get styles(){return[...super.styles,oe,le,Pe]}_poolSetpointDebouncer=null;_partitionPoolEntities(e){const t=[],a=[],r=[],i=[],s=[],n=[],o=[],l=[],c=[],d=[];let p=null;const u=/orp|ph_|salt|tds|saturation|calcium|alkalinity|cyanuric|chlorine|hardness/i,m=/waterfall|spillway|bubbler|fountain/i,h=/blower|spa.*jet|jet.*spa/i;for(const v of e){const e=v.entity.entity_id,f=v.domain,g=(v.state?.attributes||{}).device_class||"";"climate"!==f?"binary_sensor"===f&&/freeze/i.test(e)?p=v:"light"!==f?"sensor"===f&&u.test(e)?r.push(v):"switch"!==f?"sensor"!==f||"temperature"!==g?d.push(v):c.push(v):/pump/i.test(e)?i.push(v):m.test(e)?s.push(v):h.test(e)?n.push(v):o.push(v):l.push(v):/spa/i.test(e)?a.push(v):t.push(v)}return{pool:t,spa:a,chemistry:r,pumps:i,waterFeatures:s,spaCircuits:n,utilityCircuits:o,lights:l,environmental:c,diagnostics:d,freezeSensor:p}}_handlePoolSetpoint(e,t,a){const r=ee(a,t,{min:40,max:104});this._poolSetpointDebouncer||(this._poolSetpointDebouncer=re((e,t)=>{this.hass.callService("climate","set_temperature",{entity_id:e,temperature:t})},1500)),this._poolSetpointDebouncer.call(e,r)}_renderPoolBody(t,a,r){if(0===t.length)return"";const i=t[0],s=i.state,n=s?.attributes||{},o=null!=n.current_temperature?Number(n.current_temperature):null,l=null!=n.temperature?Number(n.temperature):null,c=n.hvac_action||"off",d=(0,J.qW)(c,a),p="spa"===a?"SPA":"POOL",u="heating"===c,m="spa"===a?"thermal-warm":"thermal-cool";return e.qy`
      <div class="pool-body-frame ${m}" style="--body-color:${d}" role="region"
        aria-label="${p}: ${null!=o?o+"°":"N/A"}, target ${l||"N/A"}°">
        <div class="pool-body-label" style="color:${d}">${p}</div>
        <div class="pool-body-temp" style="color:${d}">${null!=o?`${Math.round(o)}°`:"—"}</div>
        ${null!=l?e.qy`
          <div class="pool-setpoint-row">
            <button class="pool-sp-btn sp-decrement" aria-label="Decrease ${p} target"
              @click=${()=>this._handlePoolSetpoint(i.entity.entity_id,n,l-(r||1))}>−</button>
            <span class="pool-target" style="color:${d}">${l}°</span>
            <button class="pool-sp-btn sp-increment" aria-label="Increase ${p} target"
              @click=${()=>this._handlePoolSetpoint(i.entity.entity_id,n,l+(r||1))}>+</button>
          </div>
        `:""}
        ${u?e.qy`
          <div class="pool-heating-bar" style="--body-color:${d}"></div>
        `:""}
      </div>
    `}_getChemThresholds(e){return/ph/i.test(e)?[{value:0,color:"var(--lcars-tomato)"},{value:7,color:"var(--lcars-sunflower)"},{value:7.2,color:"var(--lcars-ice)"},{value:7.6,color:"var(--lcars-sunflower)"},{value:7.8,color:"var(--lcars-tomato)"}]:/chlorine/i.test(e)?[{value:0,color:"var(--lcars-tomato)"},{value:.5,color:"var(--lcars-sunflower)"},{value:1,color:"var(--lcars-ice)"},{value:3,color:"var(--lcars-sunflower)"},{value:5,color:"var(--lcars-tomato)"}]:/orp/i.test(e)?[{value:0,color:"var(--lcars-tomato)"},{value:550,color:"var(--lcars-sunflower)"},{value:650,color:"var(--lcars-ice)"},{value:750,color:"var(--lcars-sunflower)"},{value:800,color:"var(--lcars-tomato)"}]:/alkalinity/i.test(e)?[{value:0,color:"var(--lcars-tomato)"},{value:60,color:"var(--lcars-sunflower)"},{value:80,color:"var(--lcars-ice)"},{value:120,color:"var(--lcars-sunflower)"},{value:150,color:"var(--lcars-tomato)"}]:/hardness|calcium/i.test(e)?[{value:0,color:"var(--lcars-tomato)"},{value:150,color:"var(--lcars-sunflower)"},{value:200,color:"var(--lcars-ice)"},{value:400,color:"var(--lcars-sunflower)"},{value:500,color:"var(--lcars-tomato)"}]:/salt/i.test(e)?[{value:0,color:"var(--lcars-tomato)"},{value:2500,color:"var(--lcars-sunflower)"},{value:2700,color:"var(--lcars-ice)"},{value:3400,color:"var(--lcars-sunflower)"},{value:3600,color:"var(--lcars-tomato)"}]:[{value:0,color:"var(--lcars-ice)"}]}_getChemRange(e){return/ph/i.test(e)?{min:6.5,max:8.5}:/chlorine/i.test(e)?{min:0,max:6}:/orp/i.test(e)?{min:400,max:900}:/alkalinity/i.test(e)?{min:0,max:200}:/hardness|calcium/i.test(e)?{min:0,max:600}:/salt/i.test(e)?{min:2e3,max:4e3}:{min:0,max:100}}_renderCircuitGroup(t,a){if(!t.length)return"";const r=t.filter(e=>"on"===e.state?.state).length;return e.qy`
      <div class="circuit-group">
        <div class="circuit-group-label">${a} <span class="circuit-count">(${r}/${t.length})</span></div>
        ${t.map(({entity:t,state:a})=>{const r=this._friendlyName(a,t),i="on"===a?.state;return e.qy`
            <button class="device-control-btn" role="switch" aria-checked="${i}" ?data-on=${i}
              @click=${()=>this._handleToggle(t.entity_id)}
              title="${r}: ${a.state}">
              <ha-icon .icon=${this._getEntityIcon(a)}></ha-icon>
              <span>${r}</span>
            </button>
          `})}
      </div>
    `}renderBadge(){const t=this._getAllEntities(),{pool:a,spa:r,freezeSensor:i}=this._partitionPoolEntities(t),s=a[0]?.state?.attributes?.current_temperature,n=r[0]?.state?.attributes?.current_temperature,o="on"===i?.state?.state;return e.qy`
      ${null!=s?e.qy`<span style="color:var(--lcars-ice)">POOL ${Math.round(s)}°</span>`:""}
      ${null!=n?e.qy`<span style="color:var(--lcars-butterscotch)"> SPA ${Math.round(n)}°</span>`:""}
      ${o?e.qy`<span style="color:var(--lcars-tomato)"> ❄ FREEZE</span>`:""}
    `}renderContent(){const t=this._getAllEntities(),{pool:a,spa:r,chemistry:i,pumps:s,waterFeatures:n,spaCircuits:o,utilityCircuits:l,lights:c,environmental:d,freezeSensor:p}=this._partitionPoolEntities(t),u=i.length>0,m="on"===p?.state?.state;return e.qy`
      ${m?e.qy`
        <div class="freeze-banner" role="alert">
          <span class="freeze-icon">❄</span> FREEZE PROTECT ACTIVE
        </div>
      `:p?e.qy`
        <div class="freeze-nominal">FREEZE: NOMINAL</div>
      `:""}

      <div class="pool-content ${u?"":"pool-no-chem"} ${m?"freeze-active":""}">

        ${u?e.qy`
          <div class="pool-chemistry" role="list" aria-label="Water chemistry">
            ${i.map(({entity:t,state:a,_linked:r})=>{const i=this._friendlyName(a,t),s=parseFloat(a.state),n=a.attributes?.unit_of_measurement||"",o=this._getChemThresholds(t.entity_id),l=this._getChemRange(t.entity_id),c=r;return e.qy`
                <div class="chem-reading" tabindex="0" role="listitem"
                  aria-label="${i}: ${a.state}${n?" "+n:""}"
                  @click=${()=>this._handleEntityClick(t.entity_id)}
                  @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._handleEntityClick(t.entity_id))}}>
                  <span class="chem-label">${i}${c?e.qy` <span class="source-pill">W</span>`:""}</span>
                  <lcars-segmented-bar
                    .value=${isNaN(s)?0:s}
                    .min=${l.min}
                    .max=${l.max}
                    .segments=${6}
                    .thresholds=${o}
                    .label="${i}: ${a.state}${n?" "+n:""}">
                  </lcars-segmented-bar>
                </div>
              `})}
          </div>
        `:""}

        <div class="pool-aquatics">
          ${this._renderPoolBody(a,"pool",1)}
          ${this._renderPoolBody(r,"spa",1)}
        </div>

        <div class="pool-controls" aria-label="Circuit controls">
          ${s.length>0?e.qy`
            <div class="circuit-group">
              <div class="circuit-group-label">PUMPS <span class="circuit-count">(${s.filter(e=>"on"===e.state?.state).length}/${s.length})</span></div>
              ${s.map(({entity:t,state:a},r)=>{const i=this._friendlyName(a,t),s="on"===a.state;return e.qy`
                  <button class="device-control-btn" role="switch" aria-checked="${s}" ?data-on=${s}
                    @click=${()=>this._handleToggle(t.entity_id)}
                    title="${i}: ${a.state}">
                    <div class="lcars-pump-spinner ${s?"on":""}" aria-hidden="true">
                      <div class="dot"></div><div class="dot"></div><div class="dot"></div>
                    </div>
                    <span>${i}</span>
                  </button>
                `})}
            </div>
          `:""}
          ${this._renderCircuitGroup(n,"WATER FEATURES")}
          ${this._renderCircuitGroup(o,"SPA")}
          ${this._renderCircuitGroup(l,"UTILITY")}

          ${d.map(({entity:t,state:a})=>{const r=this._friendlyName(a,t),i=a.attributes?.unit_of_measurement||"";return e.qy`
              <div class="device-sensor-line" tabindex="0" role="listitem"
                @click=${()=>this._handleEntityClick(t.entity_id)}>
                <div class="sensor-indicator-bar" style="background:var(--lcars-data-accent)"></div>
                <span class="sensor-label">${r}</span>
                <span class="sensor-state-value">${a.state}${i?" "+i:""}</span>
              </div>
            `})}
        </div>

        ${c.length>0?e.qy`
          <div class="pool-lighting" aria-label="Pool lighting">
            ${c.map(({entity:t,state:a})=>{const r=this._friendlyName(a,t),i="on"===a.state;return e.qy`
                <button class="device-control-btn" role="switch" aria-checked="${i}" ?data-on=${i}
                  @click=${()=>this._handleToggle(t.entity_id)}
                  title="${r}: ${a.state}">
                  <ha-icon .icon=${this._getEntityIcon(a)}></ha-icon>
                  <span>${r}</span>
                </button>
              `})}
          </div>
        `:""}
      </div>
    `}});const Ne=e.AH`
  :host { display: block; }

  .lcars-device-panel {
    display: grid;
    gap: var(--lcars-gap);
    width: 100%; max-width: 42rem;
    border-left: 4px solid var(--panel-frame-color);
    border-bottom: 4px solid var(--panel-frame-color);
    border-top: 2px solid var(--panel-frame-color);
    border-right: 2px solid var(--panel-frame-color);
    border-radius: 0.75rem 0.25rem 0.25rem 0.75rem;
    padding: var(--lcars-gap);
    background: var(--lcars-black);
    position: relative;
    transition: border-color 600ms;
  }
  .lcars-device-panel::before {
    content: ''; position: absolute;
    top: -2px; left: -4px; width: 1.5rem; height: 1.5rem;
    border-top: 4px solid var(--panel-frame-color);
    border-left: 4px solid var(--panel-frame-color);
    border-radius: 0.75rem 0 0 0; pointer-events: none;
  }
  .lcars-device-panel::after {
    content: ''; position: absolute;
    bottom: -4px; right: -2px; width: 1.5rem; height: 1.5rem;
    border-bottom: 4px solid var(--panel-frame-color);
    border-right: 2px solid var(--panel-frame-color);
    border-radius: 0 0 0.25rem 0; pointer-events: none;
  }

  .weather-content {
    display: grid;
    grid-template-areas:
      "sensors  media"
      "forecast forecast";
    grid-template-columns: minmax(10rem, 1fr) minmax(14rem, 2fr);
    grid-template-rows: 1fr auto;
    gap: var(--lcars-gap);
  }

  .weather-header { grid-area: header; display: flex; align-items: center; gap: 0.5rem; }
  .device-panel-name { font-size: var(--lcars-font-size-sub); color: var(--panel-frame-color); text-transform: uppercase; white-space: nowrap; }
  .device-panel-header-line { flex: 1; height: 2px; background: var(--panel-frame-color); opacity: 0.5; }
  .panel-numeric-code { font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); color: var(--panel-frame-color); opacity: 0.7; white-space: nowrap; }
  .weather-condition-badge { font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; }

  .weather-sensors { grid-area: sensors; overflow-y: auto; }
  .device-sensor-line { display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0.5rem; cursor: pointer; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; transition: background var(--lcars-transition); font-size: var(--lcars-font-size-data); text-transform: uppercase; }
  .device-sensor-line:hover { background: rgba(255,255,255,0.05); }
  .device-sensor-line:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
  .sensor-indicator { width: 0.5rem; height: 0.5rem; border-radius: 50%; flex-shrink: 0; }
  .sensor-label { flex: 1; color: var(--lcars-space-white); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.75rem; }
  .sensor-state-value { flex-shrink: 0; font-weight: 700; font-size: var(--lcars-font-size-data); }

  /* Viewscreen */
  .weather-viewscreen {
    grid-area: media; display: flex; flex-direction: column; align-items: center;
    border: 2px solid var(--panel-frame-color); border-radius: 4px;
    padding: 0.5rem; transition: border-color 600ms; position: relative;
  }
  .weather-viewscreen::before, .weather-viewscreen::after {
    content: ''; position: absolute; width: 1.5rem; height: 1.5rem;
    border: 2px solid var(--panel-frame-color);
  }
  .weather-viewscreen::before { top: 4px; left: 4px; border-right: none; border-bottom: none; }
  .weather-viewscreen::after { bottom: 4px; right: 4px; border-left: none; border-top: none; }
  .weather-display { width: 100%; max-width: 200px; }

  /* Wind compass */
  .weather-wind-compass { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; }
  .wind-svg { width: 5rem; height: 5rem; }
  .wind-reading { font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); color: var(--lcars-data-accent); }

  /* Forecast strip */
  .weather-forecast { grid-area: forecast; display: flex; gap: var(--lcars-gap); overflow-x: auto; padding: 0.25rem 0; }
  .forecast-tile {
    flex: 1; min-width: 5rem; display: flex; flex-direction: column;
    align-items: center; gap: 0.125rem; padding: 0.25rem;
    font-family: var(--lcars-font); font-size: var(--lcars-font-size-data);
  }
  .forecast-tile:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
  .forecast-day { color: var(--lcars-data-accent); }
  .forecast-glyph { font-size: 1.25rem; }
  .forecast-hi { color: var(--lcars-butterscotch); }
  .forecast-lo { color: var(--lcars-ice); }
  .forecast-range-bar { width: 100%; height: 4px; background: var(--lcars-disabled); border-radius: 2px; position: relative; }
  .forecast-range-fill { position: absolute; height: 100%; background: var(--lcars-butterscotch); border-radius: 2px; }
  .forecast-precip { color: var(--lcars-gray); font-size: 0.75rem; }

  @media (max-width: 30rem) {
    .weather-content {
      grid-template-areas: "media" "sensors" "forecast";
      grid-template-columns: 1fr;
      grid-template-rows: auto auto auto;
    }
    .weather-forecast {
      flex-wrap: wrap;
    }
  }

  .panel-pip-strip { position: absolute; bottom: 4px; right: 4px; width: 2rem; height: 3px; background: var(--panel-frame-color); border-radius: 1.5px; opacity: 0.3; }
`;customElements.get("lcars-weather-panel")||customElements.define("lcars-weather-panel",class extends we{get panelType(){return"weather"}get defaultPanelTitle(){return"Weather"}get frameColor(){const e=this.group?.entities?.find(e=>"weather"===e.domain)?.state;return(0,J.JQ)(e?.state||"unavailable")}static get styles(){return[...super.styles,oe,le,Ne]}_weatherForecastCache={};_getWeatherGlyph(e){return{sunny:"☀","clear-night":"●",partlycloudy:"◑",cloudy:"◔",fog:"≡",rainy:"▽",pouring:"▼",snowy:"✦","snowy-rainy":"◆",hail:"◆",windy:"〰","windy-variant":"〰",lightning:"⚡","lightning-rainy":"⚡",exceptional:"⚠"}[e]||"○"}_getWindCardinal(e){return null==e?"":["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"][Math.round(e/22.5)%16]}_partitionWeatherEntities(e){const t=[],a=[],r=[],i=[],s=[],n=[];for(const o of e){if("weather"===o.domain){t.push(o);continue}const e=o.entity.entity_id,l=o.state?.attributes?.device_class||"";/lightning/i.test(e)?r.push(o):"precipitation"===l||"precipitation_intensity"===l||/rain/i.test(e)?i.push(o):"wind_speed"===l||/wind/i.test(e)?s.push(o):A.has(o.domain)?a.push(o):n.push(o)}return{weather:t,sensors:a,lightning:r,precipitation:i,wind:s,diagnostics:n}}_renderWindCompass(t,a,r){if(null==t)return"";const i=this._getWindCardinal(t);return e.qy`
      <div class="weather-wind-compass" role="img"
        aria-label="Wind: ${a||"?"} ${r||"mph"} from ${i}">
        <svg viewBox="0 0 80 80" class="wind-svg">
          <circle cx="40" cy="40" r="28" fill="none" stroke="var(--lcars-disabled)" stroke-width="1" />
          <text x="40" y="12" text-anchor="middle" fill="var(--lcars-data-accent)" font-size="7" font-family="var(--lcars-font)">N</text>
          <text x="40" y="76" text-anchor="middle" fill="var(--lcars-data-accent)" font-size="7" font-family="var(--lcars-font)">S</text>
          <text x="8" y="43" text-anchor="middle" fill="var(--lcars-data-accent)" font-size="7" font-family="var(--lcars-font)">W</text>
          <text x="72" y="43" text-anchor="middle" fill="var(--lcars-data-accent)" font-size="7" font-family="var(--lcars-font)">E</text>
          <g transform="rotate(${t}, 40, 40)">
            <line x1="40" y1="55" x2="40" y2="18" stroke="var(--lcars-ice)" stroke-width="2" />
            <polygon points="40,15 36,24 44,24" fill="var(--lcars-ice)" />
          </g>
        </svg>
        <div class="wind-reading">${a||"—"} ${r||""} ${i}</div>
      </div>
    `}async _loadWeatherForecast(e){if(this._weatherForecastCache[e])return;const t=await ne(this.hass,e,"daily");t.length>0&&(this._weatherForecastCache[e]=t,this.requestUpdate())}_renderForecastStrip(t){if(!t?.length)return"";const a=t.slice(0,7),r=a.map(e=>e.temperature).filter(Number.isFinite),i=a.map(e=>e.templow).filter(Number.isFinite),s=Math.min(...i,...r),n=Math.max(...r,...i)-s||1;return e.qy`
      <div class="weather-forecast" role="list" aria-label="7-day forecast">
        ${a.map(t=>{const a=new Date(t.datetime).toLocaleDateString("en",{weekday:"short"}).toUpperCase(),r=t.temperature,i=t.templow,o=t.condition,l=this._getWeatherGlyph(o),c=(0,J.JQ)(o),d=t.precipitation_probability,p=(i-s)/n*100,u=(r-i||1)/n*100;return e.qy`
            <div class="forecast-tile" role="listitem" tabindex="0"
              aria-label="${a}: ${o}, high ${r}°, low ${i}°${null!=d?`, ${d}% precipitation`:""}">
              <span class="forecast-day">${a}</span>
              <span class="forecast-glyph" style="color:${c}">${l}</span>
              <span class="forecast-hi">${null!=r?Math.round(r):"—"}°</span>
              <div class="forecast-range-bar">
                <div class="forecast-range-fill" style="left:${p.toFixed(1)}%;width:${u.toFixed(1)}%"></div>
              </div>
              <span class="forecast-lo">${null!=i?Math.round(i):"—"}°</span>
              ${null!=d?e.qy`<span class="forecast-precip" style="color:${d>50?"var(--lcars-sky)":"var(--lcars-gray)"}">${d}%</span>`:""}
            </div>
          `})}
      </div>
    `}renderBadge(){const t=this.group?.entities?.find(e=>"weather"===e.domain)?.state,a=t?.state||"unavailable",r=(0,J.JQ)(a),i=this._getWeatherGlyph(a);return e.qy`<span style="color:${r}">${i} ${a.toUpperCase().replace(/[_-]/g," ")}</span>`}renderContent(){const{weather:t,sensors:a,lightning:r,precipitation:i}=this._partitionWeatherEntities(this.group.entities),s=this._shortDeviceName(this.group.device)||"Weather";if(0===t.length)return e.qy``;const n=t[0],o=n.state,l=o?.attributes||{},c=o?.state||"unavailable",d=(0,J.JQ)(c),p=this._getWeatherGlyph(c),u=l.temperature,m=l.humidity,h=l.pressure,v=l.wind_speed,f=l.wind_bearing,g=l.wind_speed_unit||"mph";this._loadWeatherForecast(n.entity.entity_id);const b=this._weatherForecastCache[n.entity.entity_id];return e.qy`
      <div class="weather-content">

        <div class="weather-sensors" role="list" aria-label="${s} readings">
          ${null!=m?e.qy`
            <div class="device-sensor-line" role="listitem" aria-label="Humidity: ${m}%">
              <div class="sensor-indicator" style="background:var(--lcars-ice)"></div>
              <span class="sensor-label">Humidity</span>
              <span class="sensor-state-value" style="color:var(--lcars-ice)">${m}%</span>
            </div>
          `:""}
          ${null!=h?e.qy`
            <div class="device-sensor-line" role="listitem" aria-label="Pressure: ${h}">
              <div class="sensor-indicator" style="background:var(--lcars-data-accent)"></div>
              <span class="sensor-label">Pressure</span>
              <span class="sensor-state-value">${h}</span>
            </div>
          `:""}
          ${r.map(({entity:t,state:a})=>{const r=this._friendlyName(a,t),i=a.attributes?.unit_of_measurement||"";return e.qy`
              <div class="device-sensor-line" tabindex="0" role="listitem"
                aria-label="${r}: ${a.state}${i?" "+i:""}"
                @click=${()=>this._handleEntityClick(t.entity_id)}>
                <div class="sensor-indicator" style="background:var(--lcars-gold)"></div>
                <span class="sensor-label">${r}</span>
                <span class="sensor-state-value" style="color:var(--lcars-gold)">${a.state}${i?" "+i:""}</span>
              </div>
            `})}
          ${i.map(({entity:t,state:a})=>{const r=this._friendlyName(a,t),i=a.attributes?.unit_of_measurement||"";return e.qy`
              <div class="device-sensor-line" tabindex="0" role="listitem"
                aria-label="${r}: ${a.state}${i?" "+i:""}"
                @click=${()=>this._handleEntityClick(t.entity_id)}>
                <div class="sensor-indicator" style="background:var(--lcars-sky)"></div>
                <span class="sensor-label">${r}</span>
                <span class="sensor-state-value" style="color:var(--lcars-sky)">${a.state}${i?" "+i:""}</span>
              </div>
            `})}
          ${a.map(({entity:t,state:a})=>{const r=this._friendlyName(a,t),i=a.attributes?.unit_of_measurement||"",s=this._getSensorIndicatorColor(a);return e.qy`
              <div class="device-sensor-line" tabindex="0" role="listitem"
                aria-label="${r}: ${a.state}${i?" "+i:""}"
                @click=${()=>this._handleEntityClick(t.entity_id)}
                @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._handleEntityClick(t.entity_id))}}>
                <div class="sensor-indicator" style="background:${s}"></div>
                <span class="sensor-label">${r}</span>
                <span class="sensor-state-value" style="color:${s}">${a.state}${i?" "+i:""}</span>
              </div>
            `})}
        </div>

        <div class="weather-viewscreen" role="img"
          aria-label="${c}: ${null!=u?u+"°":"N/A"}">
          <svg class="weather-display" viewBox="0 0 200 160">
            <text x="100" y="35" text-anchor="middle" fill="${d}"
              font-family="var(--lcars-font)" font-size="28">${p}</text>
            <text x="100" y="85" text-anchor="middle" fill="${d}"
              font-family="var(--lcars-font)" font-size="48" font-weight="bold">
              ${null!=u?`${Math.round(u)}°`:"—"}
            </text>
            <text x="100" y="108" text-anchor="middle" fill="var(--lcars-data-accent)"
              font-family="var(--lcars-font)" font-size="12">
              ${c.toUpperCase().replace(/[_-]/g," ")}
            </text>
          </svg>
          ${this._renderWindCompass(f,v,g)}
        </div>

        ${this._renderForecastStrip(b)}
      </div>
    `}});const Me=e.AH`
  :host { display: block; }

  /* ═══ Legacy single-device power panel ═══ */
  .power-content {
    display: grid;
    grid-template-areas:
      "arc"
      "summary"
      "circuits"
      "devices"
      "strips";
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto auto auto;
    gap: var(--lcars-gap);
  }
  .power-content[data-alert="critical"] {
    animation: lcars-distress-pulse var(--lcars-anim-pulse-urgent, 1s) ease-in-out infinite;
  }

  /* ═══ Consolidated power panel ═══ */
  .consolidated-power-content {
    display: flex; flex-direction: column; gap: var(--lcars-gap, 12px);
  }
  .consolidated-power-content[data-alert="critical"] {
    animation: power-critical-pulse 2s ease-in-out infinite;
  }

  /* Header */
  .power-panel-header, .consolidated-power-header {
    display: flex; align-items: center; gap: 0.5rem;
    padding: 0.25rem 0.75rem; min-height: var(--lcars-bar-h);
  }
  .consolidated-power-header {
    font-family: var(--lcars-font, 'Antonio', sans-serif);
    font-size: 1.1rem; text-transform: uppercase;
    color: var(--lcars-butterscotch, #ffcc99); letter-spacing: 0.05em;
  }
  .power-panel-header ha-icon, .consolidated-power-header ha-icon {
    --mdc-icon-size: 20px; color: var(--lcars-butterscotch, #ffcc99); flex-shrink: 0;
  }
  .power-panel-name {
    font-size: var(--lcars-font-size-sub); color: var(--lcars-text-heading);
    text-transform: uppercase; letter-spacing: 0.05em;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .power-panel-header-line { flex: 1; height: 2px; background: var(--panel-frame-color, var(--lcars-butterscotch)); }
  .consolidated-power-header .power-panel-header-line { opacity: 0.3; }
  .power-panel-badge {
    font-size: var(--lcars-font-size-data); color: var(--lcars-data-accent, var(--lcars-ice));
    text-transform: uppercase; white-space: nowrap;
  }
  .consolidated-power-header .power-panel-badge { font-size: 0.7rem; opacity: 0.7; }
  .panel-numeric-code { font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); color: var(--panel-frame-color); opacity: 0.7; white-space: nowrap; }

  /* SVG Arc */
  .power-arc-area { grid-area: arc; display: flex; justify-content: center; }
  .power-distribution-arc { width: 100%; max-width: 15rem; height: auto; }

  /* Summary */
  .power-summary {
    grid-area: summary; display: grid;
    grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr)); gap: var(--lcars-gap);
  }
  .power-summary-card {
    display: flex; flex-direction: column; gap: 0.25rem;
    padding: 0.5rem 0.75rem;
    border-left: 3px solid var(--card-accent, var(--lcars-butterscotch));
    border-radius: 0 0.25rem 0.25rem 0; background: rgba(255, 255, 255, 0.03);
    min-width: 8rem;
  }
  .power-summary-label { font-size: var(--lcars-font-size-data); color: var(--lcars-ice); text-transform: uppercase; letter-spacing: 0.05em; }
  .power-summary-value { font-size: var(--lcars-font-size-title); font-weight: 700; text-transform: uppercase; }
  .power-summary-secondary { font-size: var(--lcars-font-size-data); color: var(--lcars-space-white); opacity: 0.8; }

  /* Section labels */
  .power-section-label { display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0; margin-top: 0.25rem; }
  .power-section-label-text { font-size: var(--lcars-font-size-sub); color: var(--lcars-text-heading); text-transform: uppercase; white-space: nowrap; flex-shrink: 0; text-wrap: balance; }
  .power-section-label-rule { flex: 1; height: 2px; background: var(--panel-frame-color, var(--lcars-butterscotch)); opacity: 0.5; }
  .power-section-label-count { font-size: var(--lcars-font-size-data); color: var(--lcars-ice); white-space: nowrap; flex-shrink: 0; }

  /* Section accent bars (consolidated) */
  .lcars-consolidated-power-panel .power-circuits-section { border-left: 3px solid var(--lcars-butterscotch, #ffcc99); padding-left: var(--lcars-gap, 12px); }
  .lcars-consolidated-power-panel .power-devices-section { border-left: 3px solid var(--lcars-ice, #99ccff); padding-left: var(--lcars-gap, 12px); }
  .lcars-consolidated-power-panel .power-strips-section { border-left: 3px solid var(--lcars-african-violet, #cc99ff); padding-left: var(--lcars-gap, 12px); }

  /* Circuit tile grid */
  .power-circuits {
    grid-area: circuits; display: grid;
    grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
    gap: var(--lcars-gap); max-height: 24rem; overflow-y: auto;
    mask-image: linear-gradient(to bottom, black calc(100% - 2rem), transparent 100%);
    -webkit-mask-image: linear-gradient(to bottom, black calc(100% - 2rem), transparent 100%);
  }
  .lcars-consolidated-power-panel .power-circuits {
    grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr)); gap: 0.5rem;
  }
  .power-circuit-tile {
    display: flex; flex-direction: column; gap: 0.125rem;
    padding: 0.375rem 0.5rem; background: rgba(255, 255, 255, 0.03);
    border-left: 3px solid var(--circuit-color, var(--lcars-ice));
    border-radius: 0 0.25rem 0.25rem 0; cursor: pointer;
    transition: background var(--lcars-transition); min-height: 3rem;
  }
  .power-circuit-tile:hover { background: rgba(255, 255, 255, 0.06); }
  .power-circuit-tile:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
  .lcars-consolidated-power-panel .power-circuit-tile:focus-visible { outline: 2px solid var(--lcars-sunflower, #ffcc99); outline-offset: -2px; }
  .power-circuit-name { display: flex; align-items: center; gap: 0.375rem; font-size: var(--lcars-font-size-data); color: var(--lcars-space-white); text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .power-circuit-indicator { flex-shrink: 0; font-size: 0.625rem; color: var(--circuit-color, var(--lcars-ice)); }
  .power-circuit-value-row { display: flex; align-items: center; gap: 0.5rem; }
  .power-circuit-watts { font-size: var(--lcars-font-size-data); font-weight: 700; color: var(--circuit-color, var(--lcars-ice)); white-space: nowrap; }
  .power-circuit-energy { font-size: 0.75rem; color: var(--lcars-space-white); opacity: 0.6; text-transform: uppercase; }

  /* Device rows */
  .power-devices { grid-area: devices; display: flex; flex-direction: column; gap: var(--lcars-gap); }
  .power-device-row {
    display: flex; align-items: center; gap: 0.5rem;
    padding: 0.25rem 0.5rem;
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    transition: background var(--lcars-transition); cursor: pointer; min-height: 2.5rem;
  }
  .power-device-row:hover { background: rgba(255, 255, 255, 0.05); }
  .power-device-row:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
  .power-device-name { flex: 1; font-size: var(--lcars-font-size-data); color: var(--lcars-space-white); text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .power-device-stats { display: flex; align-items: center; gap: 0.75rem; flex-shrink: 0; }
  .power-device-watts { font-size: var(--lcars-font-size-data); font-weight: 700; color: var(--circuit-color, var(--lcars-ice)); white-space: nowrap; min-width: 4rem; text-align: right; }
  .power-device-energy { font-size: var(--lcars-font-size-data); color: var(--lcars-space-white); opacity: 0.7; white-space: nowrap; min-width: 4rem; text-align: right; }

  /* Track toggle */
  .lcars-track-toggle {
    position: relative; display: inline-flex; align-items: center;
    width: 3.25rem; height: 1.5rem; border-radius: 0.75rem;
    border: none; cursor: pointer; background: var(--lcars-gray);
    padding: 0 0.25rem; flex-shrink: 0;
    transition: background var(--lcars-transition); overflow: hidden;
  }
  .lcars-track-toggle[data-on] { background: var(--lcars-gold); }
  .lcars-track-toggle .track-label {
    position: absolute; font-family: var(--lcars-font); font-size: var(--lcars-font-size-label, 0.75rem);
    font-weight: 700; text-transform: uppercase; line-height: 1; pointer-events: none;
    transition: left var(--lcars-transition), right var(--lcars-transition), color var(--lcars-transition);
  }
  .lcars-track-toggle:not([data-on]) .track-label { right: 0.35rem; left: auto; color: var(--lcars-space-white); }
  .lcars-track-toggle[data-on] .track-label { left: 0.35rem; right: auto; color: var(--lcars-black); }
  .lcars-track-toggle .track-thumb {
    position: absolute; width: 1.1rem; height: 1.1rem; border-radius: 50%;
    background: var(--lcars-space-white); top: 0.2rem;
    transition: left var(--lcars-transition); box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
  }
  .lcars-track-toggle:not([data-on]) .track-thumb { left: 0.2rem; }
  .lcars-track-toggle[data-on] .track-thumb { left: calc(100% - 1.3rem); }
  .lcars-track-toggle:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }

  /* Power strip blocks */
  .power-strips { grid-area: strips; display: flex; flex-direction: column; gap: calc(var(--lcars-gap) * 2); }
  .power-strip-block { border: 1px solid var(--lcars-butterscotch); border-left-width: 3px; border-radius: 0.5rem; padding: var(--lcars-gap); }
  .power-strip-header { display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0.5rem; margin-bottom: var(--lcars-gap); }
  .power-strip-name { font-size: var(--lcars-font-size-sub); color: var(--lcars-text-heading); text-transform: uppercase; text-wrap: balance; flex: 1; }
  .power-strip-total { font-size: var(--lcars-font-size-data); color: var(--lcars-butterscotch); font-weight: 700; white-space: nowrap; }
  .power-strip-divider { height: 1px; background: var(--panel-frame-color, var(--lcars-butterscotch)); opacity: 0.3; margin-bottom: var(--lcars-gap); }
  .power-strip-children { display: grid; grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr)); gap: var(--lcars-gap); }
  .power-strip-child-tile { display: flex; flex-direction: column; gap: 0.25rem; padding: 0.375rem 0.5rem; border-left: 3px solid var(--tile-power-color, var(--lcars-gray)); min-height: 3.5rem; }
  .strip-child-controls { display: flex; align-items: center; justify-content: space-between; gap: 0.25rem; }
  .circuit-name { font-size: var(--lcars-font-size-data); color: var(--lcars-space-white); text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .circuit-watts { font-size: var(--lcars-font-size-data); font-weight: 700; white-space: nowrap; }
  .power-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: currentColor; margin-right: 2px; }
  .power-dot[data-zero] { opacity: 0.3; }

  /* Clickable value */
  .power-clickable-value { cursor: pointer; display: inline; }
  .power-clickable-value:hover, .power-clickable-value:focus-visible { text-decoration: underline; text-decoration-style: dashed; text-underline-offset: 2px; }
  .power-clickable-value:focus-visible { outline: 2px solid var(--lcars-sunflower, #ffcc99); outline-offset: 1px; border-radius: 2px; }

  /* Popover */
  .power-detail-popover {
    margin: auto; padding: 0; border: none; background: transparent;
    overflow: visible; max-width: min(26rem, 90vw); min-width: 18rem;
    opacity: 0; transform: translateY(0.5rem) scale(0.98);
    transition: opacity var(--lcars-transition-slow, 300ms) ease-out,
      transform var(--lcars-transition-slow, 300ms) ease-out,
      overlay var(--lcars-transition-slow, 300ms) allow-discrete,
      display var(--lcars-transition-slow, 300ms) allow-discrete;
  }
  .power-detail-popover:popover-open { opacity: 1; transform: translateY(0) scale(1); }
  .power-detail-popover::backdrop { background: rgba(0, 0, 0, 0.5); }
  .popover-content {
    background: var(--lcars-black); border: 2px solid var(--lcars-butterscotch);
    border-left-width: 4px; border-radius: 0.75rem; padding: 0.75rem;
    font-family: var(--lcars-font); color: var(--lcars-text); text-transform: uppercase;
  }
  .popover-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 0.5rem; border-bottom: 1px solid var(--lcars-gray); margin-bottom: 0.5rem; }
  .popover-title { font-size: var(--lcars-font-size-sub); color: var(--lcars-text-heading); }
  .popover-status { font-size: var(--lcars-font-size-data); font-weight: 700; }
  .popover-hero-value { font-size: 2.5rem; font-weight: 700; text-align: center; padding: 0.5rem 0; }
  .popover-stats { display: flex; flex-direction: column; gap: 0.25rem; padding: 0.5rem 0; }
  .popover-stat-row { display: flex; justify-content: space-between; font-size: var(--lcars-font-size-data); }
  .popover-stat-label { color: var(--lcars-space-white); opacity: 0.7; }
  .popover-stat-value { color: var(--lcars-ice); font-weight: 700; }
  .popover-history-btn {
    width: 100%; margin-top: 0.5rem; display: flex; justify-content: center;
    background: var(--lcars-butterscotch); color: var(--lcars-black); border: none;
    border-radius: var(--lcars-btn-radius); padding: 0.375rem 0.75rem;
    font-family: var(--lcars-font); font-size: var(--lcars-font-size-data);
    text-transform: uppercase; cursor: pointer;
  }

  /* Truncation pill */
  .power-show-all-pill {
    display: block; margin: 0.5rem auto 0; padding: 0.25rem 1rem;
    border: 1px solid var(--lcars-gray, #666688);
    border-radius: 0 1.5rem 1.5rem 0;
    background: rgba(153, 153, 153, 0.15); color: var(--lcars-gray, #666688);
    font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 0.75rem;
    text-transform: uppercase; letter-spacing: 0.05em; cursor: pointer;
    transition: background 200ms ease, color 200ms ease;
  }
  .power-show-all-pill:hover, .power-show-all-pill:focus-visible { background: var(--lcars-gray, #666688); color: var(--lcars-black, #000000); }
  .power-show-all-pill:focus-visible { outline: 2px solid var(--lcars-sunflower, #ffcc99); outline-offset: 2px; }

  .panel-pip-strip { position: absolute; bottom: 4px; right: 4px; width: 2rem; height: 3px; background: var(--panel-frame-color, var(--lcars-butterscotch)); border-radius: 1.5px; opacity: 0.3; }

  /* Scroll-driven tile animations */
  @supports (animation-timeline: view()) {
    .power-circuit-tile {
      animation: circuit-energize linear both;
      animation-timeline: view(); animation-range: entry 0% entry 40%;
    }
    @keyframes circuit-energize {
      from { opacity: 0; border-left-color: var(--lcars-disabled); transform: translateX(-0.25rem); }
      to { opacity: 1; border-left-color: var(--circuit-color, var(--lcars-ice)); transform: translateX(0); }
    }
  }
  @supports not (animation-timeline: view()) {
    .power-circuit-tile { opacity: 1; }
  }

  /* Responsive */
  @media (max-width: 64rem) {
    .power-circuits { grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr)); }
    .lcars-consolidated-power-panel .power-circuits { grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr)); }
    .power-summary { grid-template-columns: repeat(auto-fit, minmax(7rem, 1fr)); }
  }
  @media (max-width: 48rem) {
    .power-circuits { grid-template-columns: 1fr 1fr; max-height: 16rem; }
    .lcars-consolidated-power-panel .power-circuits { grid-template-columns: 1fr 1fr; }
    .power-summary { grid-template-columns: 1fr; }
    .power-device-row { flex-direction: column; align-items: stretch; }
  }
  @media (max-width: 30rem) {
    .power-circuits { grid-template-columns: 1fr; }
    .lcars-consolidated-power-panel .power-circuits { grid-template-columns: 1fr; }
  }

  @media (prefers-reduced-motion: reduce) {
    .power-panel[data-alert="critical"] { animation: none; border-color: var(--lcars-tomato); }
    .lcars-consolidated-power-panel[data-alert="critical"] { animation: none; border-color: var(--lcars-tomato); }
    .power-circuit-tile { animation: none !important; opacity: 1; }
    .power-circuit-tile, .power-device-row { transition-duration: 0.01ms !important; }
  }
`;customElements.get("lcars-power-panel")||customElements.define("lcars-power-panel",class extends we{static get properties(){return{...super.properties,collection:{type:Object},powerGroups:{type:Array}}}get panelType(){return"power"}get defaultPanelTitle(){return"Power Systems"}get frameColor(){const e=this.config?.power_thresholds||{};if(this.collection||this.powerGroups){const t=this.collection||this._buildPowerCollection(this.powerGroups);return(0,J.XI)(t.totalWatts,e)}if(this.group){const t=this._getPrimaryPower(this.group);return(0,J.XI)(t,e)}return"var(--lcars-orange)"}static get styles(){return[...super.styles,oe,le,Me]}_powerToggleLimiter=ae(10,1e4);_expandedPowerSections=new Set;_formatWatts(e){if(null==e)return"—";const t=Number(e);return Number.isFinite(t)?Math.abs(t)>=1e4?`${(t/1e3).toFixed(1)} kW`:`${Math.round(t)} W`:"—"}_formatEnergy(e){if(null==e)return"—";const t=Number(e);return Number.isFinite(t)?`${t.toFixed(1)} kWh`:"—"}_getPowerIndicator(e){if(null==e||isNaN(e))return"✕";const t=Math.abs(Number(e));return t<=0?"○":t<=500?"●":t<=1500?"●━":t<=3e3?"●━━":"●━━━"}_partitionPowerEntities(e){const t=[],a=[],r=[],i=[],s=[],n=[];for(const o of e){if(o.disabled_by||o.hidden_by)continue;const e=o.entity?.entity_id?.split(".")[0]||o.domain,l=o.state?.attributes?.device_class||"",c=o.state?.attributes?.unit_of_measurement||"";"switch"===e?t.push(o):"power"!==l||"W"!==c&&"kW"!==c?"energy"!==l||"kWh"!==c&&"Wh"!==c?"voltage"===l&&"V"===c?i.push(o):"current"===l&&"A"===c?s.push(o):n.push(o):r.push(o):a.push(o)}return{switches:t,powerSensors:a,energySensors:r,voltageSensors:i,currentSensors:s,diagnostics:n}}_classifyPowerDevice(e,t){if(!e.some(e=>{const t=e.state?.attributes?.device_class||"";return"sensor"===e.domain&&("power"===t||"energy"===t||"voltage"===t||"current"===t)}))return null;const a=(t?.manufacturer||"").toLowerCase(),r=(t?.model||"").toLowerCase();return a.includes("emporia")||r.includes("vue")?"vue":e.filter(e=>"switch"===e.domain).length>=4||r.includes("hs300")||r.includes("power strip")?"strip":e.some(e=>"switch"===e.domain)?"plug":"vue"}_getPrimaryPower(e){for(const t of e.entities){const e=t.state?.attributes?.device_class||"",a=t.state?.attributes?.unit_of_measurement||"";if("power"===e&&("W"===a||"kW"===a)){const e=parseFloat(t.state?.state);if(!isNaN(e))return"kW"===a?1e3*e:e}}return null}_getPrimaryEnergy(e){for(const t of e.entities){const e=t.state?.attributes?.device_class||"",a=t.state?.attributes?.unit_of_measurement||"";if("energy"===e&&("kWh"===a||"Wh"===a)){const e=parseFloat(t.state?.state);if(!isNaN(e))return"Wh"===a?e/1e3:e}}return null}_detect240VPairs(e){const t=/^(.+?)[\s_]*(l[12]|line[\s_]*[12])$/i,a=new Map,r=[];for(const i of e){const e=(this._shortDeviceName(i.device)||"").match(t);if(e){const t=e[1].trim();a.has(t)||a.set(t,[]),a.get(t).push(i)}else r.push(i)}const i=[...r];for(const[e,t]of a)if(2===t.length){const a=t.reduce((e,t)=>e+(this._getPrimaryPower(t)||0),0),r=t.reduce((e,t)=>e+(this._getPrimaryEnergy(t)||0),0);i.push({device:{...t[0].device,name:e},entities:t.flatMap(e=>e.entities),is240V:!0,combinedWatts:a,combinedEnergy:r})}else i.push(...t);return i}_sortCircuits(e){return[...e].sort((e,t)=>{const a=null!=e.combinedWatts?e.combinedWatts:this._getPrimaryPower(e)||0,r=null!=t.combinedWatts?t.combinedWatts:this._getPrimaryPower(t)||0;if(r!==a)return r-a;const i=(e.device?.name||"").toLowerCase(),s=(t.device?.name||"").toLowerCase();return i.localeCompare(s)})}_groupPowerStrips(e){const t=new Map,a=[];for(const a of e)"strip"===a.subType&&t.set(a.device.id,{parent:a,children:[]});for(const r of e)if("strip"!==r.subType){if(r.device?.via_device_id){const e=t.get(r.device.via_device_id);if(e){e.children.push(r);continue}}a.push(r)}return{strips:t,standalone:a}}_renderPowerArc(e,a){if(!e.length||!a||a<=0)return"";const r=this.config?.power_thresholds||{},i=e.map(e=>({name:this._shortDeviceName(e.device)||"Unknown",watts:null!=e.combinedWatts?e.combinedWatts:this._getPrimaryPower(e)||0})).filter(e=>e.watts>0).sort((e,t)=>t.watts-e.watts);if(0===i.length)return"";const s=i.slice(0,5),n=i.slice(5).reduce((e,t)=>e+t.watts,0);n>0&&s.push({name:"OTHER",watts:n});const o=120,l=100,c=80,d=Math.PI,p=Math.PI;let u=d;const m=s.map(e=>{const t=e.watts/a,i=Math.max(t*p-.02,.01),s=u-i,n=(0,J.XI)(e.watts,r),d=o+c*Math.cos(u),m=l-c*Math.sin(u),h=o+c*Math.cos(s),v=l-c*Math.sin(s),f=i>Math.PI?1:0,g=`M ${d.toFixed(1)},${m.toFixed(1)} A 80,80 0 ${f},1 ${h.toFixed(1)},${v.toFixed(1)}`;return u=s-.02,{path:g,color:n,name:e.name,watts:e.watts,fraction:t}});return t.qy`
      <div class="power-arc-area">
        <svg class="power-distribution-arc" viewBox="0 0 240 120"
          role="img" aria-label="Power distribution: ${this._formatWatts(a)} total">
          <path d="M ${40},${l} A ${c},${c} 0 1,1 ${200},${l}"
            fill="none" stroke="var(--lcars-gray)" stroke-width="10"
            stroke-linecap="butt" opacity="0.15" />
          ${m.map(e=>t.JW`
            <path d="${e.path}" fill="none" stroke="${e.color}"
              stroke-width="10" stroke-linecap="butt">
              <title>${e.name}: ${Math.round(e.watts)}W (${Math.round(100*e.fraction)}%)</title>
            </path>
          `)}
          <text x="${o}" y="${85}" text-anchor="middle"
            fill="var(--lcars-text-heading)" font-family="var(--lcars-font)"
            font-size="28" font-weight="bold">
            ${this._formatWatts(a)}
          </text>
          <text x="${o}" y="${105}" text-anchor="middle"
            fill="var(--lcars-space-white)" font-family="var(--lcars-font)"
            font-size="10" opacity="0.7">TOTAL</text>
        </svg>
      </div>
    `}_showCircuitPopover(e){const a=this.shadowRoot?.querySelector("#power-detail-popover");if(!a)return;const r=null!=e.combinedWatts?e.combinedWatts:this._getPrimaryPower(e),s=null!=e.combinedEnergy?e.combinedEnergy:this._getPrimaryEnergy(e),n=this.config?.power_thresholds||{},o=(0,J.XI)(r,n),l=(0,J.IO)(r,n),c=this._shortDeviceName(e.device)||"Unknown",d=e.entities?.[0]?.entity?.entity_id,p=a.querySelector(".popover-content");p&&(0,t.XX)(t.qy`
        <div class="popover-header">
          <span class="popover-title">${c}</span>
          <span class="popover-status" style="color:${o}">${l}</span>
        </div>
        <div class="popover-hero-value" style="color:${o}">
          ${null!=r?this._formatWatts(r):"UNAVAILABLE"}
        </div>
        <div class="popover-stats">
          ${null!=s?t.qy`
            <div class="popover-stat-row">
              <span class="popover-stat-label">TODAY</span>
              <span class="popover-stat-value">${this._formatEnergy(s)}</span>
            </div>
          `:""}
          ${e.is240V?t.qy`
            <div class="popover-stat-row">
              <span class="popover-stat-label">CIRCUIT TYPE</span>
              <span class="popover-stat-value" style="color:var(--lcars-butterscotch)">240V PAIRED</span>
            </div>
          `:""}
        </div>
        ${d?t.qy`
          <button class="popover-history-btn"
            @click=${()=>{(0,i.Hv)(d);try{a.hidePopover()}catch(e){}}}>
            VIEW FULL HISTORY
          </button>
        `:""}
      `,p);try{a.showPopover()}catch(e){d&&(0,i.Hv)(d)}}_renderTrackToggle(e,a,r){return t.qy`
      <button class="lcars-track-toggle" ?data-on=${e}
        role="switch" aria-checked="${e}" aria-label="${a}"
        @click=${e=>{e.stopPropagation(),r()}}
        @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),r())}}>
        <span class="track-label">${e?"ON":"OFF"}</span>
        <span class="track-thumb" aria-hidden="true"></span>
      </button>
    `}_renderClickableValue(e,a,r){return e?t.qy`
      <span class="power-clickable-value" role="button" tabindex="0" aria-label="${a}"
        @click=${t=>{t.stopPropagation(),this._handleEntityClick(e)}}
        @keydown=${t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._handleEntityClick(e))}}>
        ${r}
      </span>
    `:r}_renderCircuitTile(e){const a=null!=e.combinedWatts?e.combinedWatts:this._getPrimaryPower(e),r=null!=e.combinedEnergy?e.combinedEnergy:this._getPrimaryEnergy(e),s=this.config?.power_thresholds||{},n=(0,J.XI)(a,s),o=(0,J.IO)(a,s),l=this._getPowerIndicator(a),c=this._shortDeviceName(e.device)||"Unknown",d="function"==typeof HTMLElement.prototype.showPopover,{powerSensors:p,energySensors:u}=this._partitionPowerEntities(e.entities||[]),m=p[0]?.entity?.entity_id,h=u[0]?.entity?.entity_id;return t.qy`
      <div class="power-circuit-tile" style="--circuit-color:${n}" role="listitem" tabindex="0"
        aria-label="${c}: ${null!=a?Math.round(a)+" watts, "+o.toLowerCase():"unavailable"}${null!=r?", "+r.toFixed(1)+" kilowatt hours today":""}"
        @click=${()=>d?this._showCircuitPopover(e):(0,i.Hv)(e.entities?.[0]?.entity?.entity_id)}
        @keydown=${t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),d?this._showCircuitPopover(e):(0,i.Hv)(e.entities?.[0]?.entity?.entity_id))}}>
        <div class="power-circuit-name">
          <span class="power-circuit-indicator" aria-hidden="true">${e.is240V?"●●":l}</span>
          <span>${c}</span>
        </div>
        <div class="power-circuit-value-row">
          ${this._renderClickableValue(m,`View ${c} power: ${null!=a?Math.round(a)+" watts":"unavailable"}`,t.qy`<span class="power-circuit-watts">${this._formatWatts(a)}</span>`)}
        </div>
        ${null!=r?this._renderClickableValue(h,`View ${c} energy: ${r.toFixed(1)} kWh today`,t.qy`<span class="power-circuit-energy">${this._formatEnergy(r)} TODAY</span>`):""}
      </div>
    `}_renderPowerDeviceRow(e){const{switches:a,powerSensors:r,energySensors:i}=this._partitionPowerEntities(e.entities),s=a[0],n=r[0]?parseFloat(r[0].state?.state)||0:null,o=i[0]&&parseFloat(i[0].state?.state)||null,l=this.config?.power_thresholds||{},c=(0,J.XI)(n,l),d=this._shortDeviceName(e.device)||"Unknown",p="on"===s?.state?.state,u=r[0]?.entity?.entity_id,m=i[0]?.entity?.entity_id;return t.qy`
      <div class="power-device-row" role="listitem" tabindex="0" style="--circuit-color:${c}"
        aria-label="${d}: ${s?(p?"on":"off")+", ":""}${null!=n?Math.round(n)+" watts":"unknown"}">
        ${s?this._renderTrackToggle(p,`Toggle ${d}`,()=>{this._powerToggleLimiter.allow()&&this._handleToggle(s.entity.entity_id)}):""}
        <span class="power-device-name">${d}</span>
        <div class="power-device-stats">
          ${this._renderClickableValue(u,`View ${d} power: ${null!=n?Math.round(n)+" watts":"unknown"}`,t.qy`<span class="power-device-watts" style="color:${c}">${this._formatWatts(n)}</span>`)}
          ${null!=o?this._renderClickableValue(m,`View ${d} energy: ${o.toFixed(1)} kWh`,t.qy`<span class="power-device-energy">${this._formatEnergy(o)}</span>`):""}
        </div>
      </div>
    `}_renderPowerStrip(e,a){const r=this._shortDeviceName(e.device)||"Power Strip",{powerSensors:i,switches:s}=this._partitionPowerEntities(e.entities),n=i.reduce((e,t)=>e+(parseFloat(t.state?.state)||0),0),o=this.config?.power_thresholds||{},l=(0,J.XI)(n,o),c=s[0];return t.qy`
      <div class="power-strip-block" role="listitem">
        <div class="power-strip-header" role="heading" aria-level="5">
          <span class="power-strip-name">${r}</span>
          ${c?this._renderTrackToggle("on"===c.state?.state,`Master toggle ${r}`,()=>{this._powerToggleLimiter.allow()&&this._handleToggle(c.entity.entity_id)}):""}
          <span class="power-strip-total" style="color:${l}">TOTAL: ${this._formatWatts(n)}</span>
        </div>
        <div class="power-strip-divider" aria-hidden="true"></div>
        <div class="power-strip-children" role="list" aria-label="${r} outlets">
          ${a.map(e=>this._renderStripChild(e,s))}
        </div>
      </div>
    `}_renderStripChild(e,a){const r=this._shortDeviceName(e.device)||"Outlet",{switches:i,powerSensors:s,energySensors:n}=this._partitionPowerEntities(e.entities),o=s[0]&&parseFloat(s[0].state?.state)||0,l=n[0]&&parseFloat(n[0].state?.state)||null,c=this.config?.power_thresholds||{},d=(0,J.XI)(o,c),p=s[0]?.entity?.entity_id,u=n[0]?.entity?.entity_id;let m=i[0];if(!m&&a?.length>0){const t=(e.device?.name||"").toLowerCase().replace(/[\s\-_]+/g,"");m=a.find(e=>{const a=(e.entity?.entity_id||"").toLowerCase().replace(/[\s\-_]+/g,""),r=(e.state?.attributes?.friendly_name||"").toLowerCase().replace(/[\s\-_]+/g,"");return a.includes(t)||r.includes(t)})}const h="on"===m?.state?.state;return t.qy`
      <div class="power-strip-child-tile" style="--tile-power-color:${d}"
        role="listitem" aria-label="${r}: ${h?"on":"off"}, ${Math.round(o)} watts">
        <span class="circuit-name">${r}</span>
        <div class="strip-child-controls">
          ${m?this._renderTrackToggle(h,`Toggle ${r}`,()=>{this._powerToggleLimiter.allow()&&this._handleToggle(m.entity.entity_id)}):""}
          ${this._renderClickableValue(p,`View ${r} power: ${Math.round(o)} watts`,t.qy`
            <span class="circuit-watts" style="color:${d}">
              <span class="power-dot" ?data-zero=${0===o} aria-hidden="true"></span>
              ${this._formatWatts(o)}
            </span>
          `)}
          ${null!=l?this._renderClickableValue(u,`View ${r} energy: ${l.toFixed(1)} kWh`,t.qy`<span class="power-device-energy">${this._formatEnergy(l)}</span>`):""}
        </div>
      </div>
    `}_renderPowerSummaryCard(e,a,r,i,s){const n=this.config?.power_thresholds||{},o="TOTAL USAGE"===e?(0,J.XI)(a,n):i;return t.qy`
      <div class="power-summary-card" role="status" style="--card-accent:${i}"
        aria-label="${e}: ${null!=a?Math.round(a)+" watts":"unavailable"}${null!=r?", "+r.toFixed(1)+" kilowatt hours today":""}"
        aria-live="polite">
        <span class="power-summary-label">
          <ha-icon icon="${s}" style="--mdc-icon-size:14px; vertical-align:middle; color:${i}"></ha-icon>
          ${e}
        </span>
        <span class="power-summary-value" style="color:${o}">${this._formatWatts(a)}</span>
        ${null!=r?t.qy`<span class="power-summary-secondary">${this._formatEnergy(r)} TODAY</span>`:""}
      </div>
    `}_buildPowerCollection(e){const t=[],a=[],r=[];for(const i of e){const e=this._classifyPowerDevice(i.entities||[],i.device);"vue"===e?t.push(i):"strip"===e?r.push(i):a.push(i)}const i=new Set(r.map(e=>e.device?.id).filter(Boolean)),s=[],n=[];for(const e of r)e.device?.via_device_id&&i.has(e.device.via_device_id)?n.push(e):s.push({...e,subType:"strip"});const{strips:o,standalone:l}=this._groupPowerStrips([...s,...n,...a]),c=[];for(const[,e]of o)c.push({parent:e.parent,children:e.children||[]});const d=l,p=this._sortCircuits(this._detect240VPairs(t)),u=new Set;for(const{children:e}of c)for(const t of e)t.device?.id&&u.add(t.device.id);const m=/^(balance|total|main[s]?|net|whole[\s_-]?home)$/i,h=new Set;for(const e of p){const t=this._shortDeviceName(e.device)||"";m.test(t.trim())&&e.device?.id&&h.add(e.device.id)}const v=new Set;for(const t of e){const a=(t.device?.model||"").toLowerCase(),r=(t.device?.manufacturer||"").toLowerCase();(t.entities?.some(e=>"battery"===e.state?.attributes?.device_class||"sensor"===e.domain&&"battery"===(e.state?.attributes?.device_class||""))||a.includes("ups")||r.includes("ups")||r.includes("cyberpower")||r.includes("apc")||r.includes("tripp"))&&t.device?.id&&(e.some(e=>e!==t&&e.device?.via_device_id===t.device.id)&&v.add(t.device.id))}let f=0,g=0;for(const t of e){const e=t.device?.id;if(e&&h.has(e))continue;if(e&&v.has(e))continue;if(e&&u.has(e))continue;const a=this._getPrimaryPower(t),r=this._getPrimaryEnergy(t);null!=a&&(f+=a),null!=r&&(g+=r)}return{circuits:p,plugs:d,strips:c,totalWatts:f,totalEnergy:g||null,deviceCount:e.length}}_renderConsolidatedPowerArc(e){const t=[];for(const a of e.circuits)t.push({device:a.device,entities:a.entities,combinedWatts:null!=a.combinedWatts?a.combinedWatts:this._getPrimaryPower(a),combinedEnergy:a.combinedEnergy});for(const a of e.plugs)t.push({device:a.device,entities:a.entities,combinedWatts:this._getPrimaryPower(a)});for(const{parent:a}of e.strips)t.push({device:a.device,entities:a.entities,combinedWatts:this._getPrimaryPower(a)});return this._renderPowerArc(t,e.totalWatts)}renderBadge(){if(this.collection||this.powerGroups){const e=this.collection||this._buildPowerCollection(this.powerGroups),a=this.config?.power_thresholds||{},r=(0,J.XI)(e.totalWatts,a);return t.qy`<span style="color:${r}">${this._formatWatts(e.totalWatts)}</span>`}if(this.group){const e=this._getPrimaryPower(this.group),a=this.config?.power_thresholds||{},r=(0,J.XI)(e,a);return t.qy`<span style="color:${r}">${this._formatWatts(e)}</span>`}return t.qy``}render(){if(this.collection||this.powerGroups){const e=this.collection||this._buildPowerCollection(this.powerGroups);return t.qy`
        <lcars-panel-frame
          panel-name="POWER SYSTEMS"
          panel-code="${this._generatePanelCode("power-consolidated")}"
          frame-color="${this.frameColor}"
          panel-type="power">
          <span slot="badge">${this.renderBadge()}</span>
          ${this._renderConsolidatedPowerContent(e)}
        </lcars-panel-frame>
      `}return this.group?super.render():t.qy``}renderContent(){return this._renderLegacyPowerContent(this.group)}_renderConsolidatedPowerContent(e){const{circuits:a,plugs:r,strips:i,totalWatts:s,totalEnergy:n}=e,o=this.config?.power_thresholds||{},l=(0,J.XI)(s,o),c=null!=s&&Math.abs(s)>(o.highMax||3e3),d=a.length+r.length+i.length,p=this._expandedPowerSections.has("circuits"),u=p?a:a.slice(0,12),m=a.length>12,h=this._expandedPowerSections.has("plugs"),v=h?r:r.slice(0,12),f=r.length>12;return t.qy`
      <div class="consolidated-power-content" data-alert="${c?"critical":""}">

        <div class="power-summary" role="group" aria-label="Power Summary">
          ${this._renderPowerSummaryCard("TOTAL USAGE",s,n,l,"mdi:sigma")}
        </div>

        ${d>=3?this._renderConsolidatedPowerArc(e):""}

        ${a.length>0?t.qy`
          <div class="power-circuits-section">
            <div class="power-section-label" role="heading" aria-level="4">
              <span class="power-section-label-text">CIRCUITS</span>
              <div class="power-section-label-rule" aria-hidden="true"></div>
              <span class="power-section-label-count">${a.length}</span>
            </div>
            <div class="power-circuits" role="list">
              ${u.map(e=>this._renderCircuitTile(e))}
            </div>
            ${m&&!p?t.qy`
              <button class="power-show-all-pill" aria-label="Show all ${a.length} circuits"
                @click=${()=>{this._expandedPowerSections.add("circuits"),this.requestUpdate()}}>
                SHOW ALL (${a.length})
              </button>
            `:""}
          </div>
        `:""}

        ${r.length>0?t.qy`
          <div class="power-devices-section">
            <div class="power-section-label" role="heading" aria-level="4">
              <span class="power-section-label-text">MONITORED DEVICES</span>
              <div class="power-section-label-rule" aria-hidden="true"></div>
              <span class="power-section-label-count">${r.length}</span>
            </div>
            <div class="power-devices" role="list">
              ${v.map(e=>this._renderPowerDeviceRow(e))}
            </div>
            ${f&&!h?t.qy`
              <button class="power-show-all-pill" aria-label="Show all ${r.length} devices"
                @click=${()=>{this._expandedPowerSections.add("plugs"),this.requestUpdate()}}>
                SHOW ALL (${r.length})
              </button>
            `:""}
          </div>
        `:""}

        ${i.length>0?t.qy`
          <div class="power-strips-section">
            <div class="power-section-label" role="heading" aria-level="4">
              <span class="power-section-label-text">POWER STRIPS</span>
              <div class="power-section-label-rule" aria-hidden="true"></div>
              <span class="power-section-label-count">${i.length}</span>
            </div>
            <div class="power-strips" role="list">
              ${i.map(({parent:e,children:t})=>this._renderPowerStrip(e,t))}
            </div>
          </div>
        `:""}

        <div popover id="power-detail-popover" class="power-detail-popover"
          role="dialog" aria-label="Circuit detail">
          <div class="popover-content"></div>
        </div>
      </div>
    `}_renderLegacyPowerContent(e){const a=e.entities||[],r=(this._shortDeviceName(e.device),this.config?.power_thresholds||{}),i=this._classifyPowerDevice(a,e.device),{powerSensors:s,energySensors:n,switches:o}=this._partitionPowerEntities(a),l=this._getPrimaryPower(e),c=this._getPrimaryEnergy(e),d=(0,J.XI)(l,r),p=null!=l&&Math.abs(l)>(r.highMax||3e3),u="vue"===i?[e]:[],m=this._sortCircuits(this._detect240VPairs(u)),h=l||0,v=m.length>0,f="plug"===i,g="strip"===i;return t.qy`
      <div class="power-content" data-alert="${p?"critical":""}">

        ${v&&m.length>1?this._renderPowerArc(m,h):""}

        <div class="power-summary" role="group" aria-label="Power Summary">
          ${this._renderPowerSummaryCard("TOTAL USAGE",h,c,d,"mdi:sigma")}
        </div>

        ${v?t.qy`
          <div class="power-circuits-section">
            <div class="power-section-label" role="heading" aria-level="4">
              <span class="power-section-label-text">CIRCUITS</span>
              <div class="power-section-label-rule" aria-hidden="true"></div>
              <span class="power-section-label-count">${m.length}/${m.length}</span>
            </div>
            <div class="power-circuits" role="list">
              ${m.map(e=>this._renderCircuitTile(e))}
            </div>
          </div>
        `:""}

        ${f?t.qy`
          <div class="power-devices-section">
            <div class="power-section-label" role="heading" aria-level="4">
              <span class="power-section-label-text">MONITORED DEVICES</span>
              <div class="power-section-label-rule" aria-hidden="true"></div>
              <span class="power-section-label-count">1/1</span>
            </div>
            <div class="power-devices" role="list">
              ${this._renderPowerDeviceRow(e)}
            </div>
          </div>
        `:""}

        ${g?t.qy`
          <div class="power-strips-section">
            <div class="power-section-label" role="heading" aria-level="4">
              <span class="power-section-label-text">POWER STRIPS</span>
              <div class="power-section-label-rule" aria-hidden="true"></div>
            </div>
            <div class="power-strips" role="list">
              ${this._renderPowerStrip(e,[])}
            </div>
          </div>
        `:""}

        <div popover id="power-detail-popover" class="power-detail-popover"
          role="dialog" aria-label="Circuit detail">
          <div class="popover-content"></div>
        </div>
      </div>
    `}});const De=e.AH`
  /* ─── Base Content ─── */

  .ls-content {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
    overflow: visible;
  }

  .ls-empty {
    font-family: var(--lcars-font, 'Antonio', sans-serif);
    font-size: var(--lcars-font-size-data, 0.875rem);
    color: var(--lcars-gray, #666688);
    text-transform: uppercase;
    text-align: center;
    padding: 2rem 1rem;
  }

  /* ─── Full Layout: Dual Substations ─── */

  .ls-substations {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
    overflow: visible;
  }

  @media (max-width: 56rem) {
    .ls-substations {
      grid-template-columns: 1fr;
    }
  }

  .ls-substation {
    min-width: 0;
    min-height: 0;
    overflow: visible;
  }

  /* Nested panels should fill their substation */
  .ls-substation lcars-climate-panel,
  .ls-substation lcars-environment-panel {
    width: 100%;
  }

  /* ─── Sensor Hero Layout ─── */

  .ls-sensor-hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1.5rem 0;
  }

  .ls-hero-temp {
    font-family: var(--lcars-font, 'Antonio', sans-serif);
    font-size: var(--lcars-font-size-hero, 3.5rem);
    line-height: 1;
    text-transform: uppercase;
  }

  .ls-hero-unit {
    font-size: 0.5em;
    opacity: 0.7;
    margin-left: 0.125rem;
  }

  .ls-hero-humidity {
    font-family: var(--lcars-font, 'Antonio', sans-serif);
    font-size: var(--lcars-font-size-data, 0.875rem);
    color: var(--lcars-ice, #99ccff);
    margin-top: 0.5rem;
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    text-transform: uppercase;
  }

  .ls-hero-label {
    font-size: 0.75em;
    opacity: 0.6;
    letter-spacing: 0.05em;
  }

  /* ─── Ambient Sensor Row ─── */

  .ls-ambient-row {
    border-top: 2px solid var(--lcars-gray, #666688);
    padding-top: 0.5rem;
    margin-top: 0.25rem;
  }

  .ls-ambient-label {
    font-family: var(--lcars-font, 'Antonio', sans-serif);
    font-size: var(--lcars-font-size-label, 0.75rem);
    color: var(--lcars-gray, #666688);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 0.375rem;
  }

  .ls-ambient-readings {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1.5rem;
  }

  .ls-ambient-reading {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-family: var(--lcars-font, 'Antonio', sans-serif);
    font-size: var(--lcars-font-size-data, 0.875rem);
    text-transform: uppercase;
  }

  .ls-ambient-indicator {
    display: inline-block;
    width: 2px;
    height: 1rem;
    border-radius: 1px;
    flex-shrink: 0;
  }

  .ls-ambient-name {
    color: var(--lcars-gray, #666688);
    font-size: 0.85em;
  }

  .ls-ambient-value {
    font-variant-numeric: tabular-nums;
  }

  /* ─── Sparkline Tray ─── */

  .ls-sparkline-tray {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1rem;
    border-top: 2px solid var(--lcars-gray, #666688);
    padding-top: 0.5rem;
    margin-top: 0.25rem;
  }

  .ls-sparkline-slot {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.125rem;
    flex: 1 1 auto;
    min-width: 7rem;
  }

  .ls-sparkline-label {
    font-family: var(--lcars-font, 'Antonio', sans-serif);
    font-size: var(--lcars-font-size-label, 0.75rem);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    opacity: 0.8;
  }

  .ls-sparkline-slot svg {
    width: 100%;
    max-width: 120px;
    height: 24px;
  }
`;class Ie extends e.WF{static get properties(){return{label:{type:String},value:{type:String},total:{type:String},color:{type:String},icon:{type:String}}}constructor(){super(),this.label="",this.value="",this.total="",this.color="",this.icon=""}static get styles(){return[r.AM,e.AH`
        :host {
          display: inline-flex;
          align-items: baseline;
          gap: 0.25rem;
          font-family: var(--lcars-font, 'Antonio', sans-serif);
          font-size: var(--lcars-font-size-data, 1rem);
          text-transform: uppercase;
          color: var(--badge-color, var(--panel-frame-color, var(--lcars-butterscotch, #ff9966)));
          white-space: nowrap;
        }

        .badge-value {
          font-variant-numeric: tabular-nums;
        }

        .badge-separator {
          opacity: 0.6;
        }

        .badge-label {
          font-size: 0.85em;
          opacity: 0.8;
          letter-spacing: 0.04em;
        }

        ha-icon {
          --mdc-icon-size: 1em;
          margin-right: 0.125rem;
        }
      `]}render(){const t=this.color?`--badge-color:${this.color}`:"",a=this.total?`${this.value} of ${this.total} ${this.label}`:`${this.value} ${this.label}`;return e.qy`
      <span role="status"
            aria-label="${a}"
            style="${t}">
        ${this.icon?e.qy`<ha-icon icon="${this.icon}"></ha-icon>`:""}
        <span class="badge-value">${this.value}</span>
        ${this.total?e.qy`<span class="badge-separator">/</span><span class="badge-value">${this.total}</span>`:""}
        ${this.label?e.qy`<span class="badge-label">${this.label}</span>`:""}
      </span>
    `}}customElements.define("lcars-summary-badge",Ie),customElements.define("lcars-lifesupport-panel",class extends we{static get properties(){return{...super.properties,_sparklineData:{type:Object}}}constructor(){super(),this._sparklineData=new Map,this._sparklineTimer=null,this._sparklineCache=new Map,this._prevAreaId=null}get panelType(){return"life_support"}get defaultPanelTitle(){return"LIFE SUPPORT"}get frameColor(){return"var(--lcars-blue)"}static get styles(){return[...super.styles,oe,le,r.AM,De]}_partitionEntities(){const e=this._getAllEntities(),t=this.hass?.devices||{},a=[],r=[],i=[],s=[];for(const t of e)V(t)?a.push(t):j(t)?r.push(t):K(t)?i.push(t):s.push(t);const n=this._buildDeviceGroup(a,t),o=this._buildDeviceGroup(r,t),l=a.length>0,c=r.length>0;let d;return i.length,d=l&&c?"full":!l&&c?"atmos-only":l&&!c?"climate-only":"sensors-only",{climateGroup:n,envGroup:o,ambientEntries:i,otherEntries:s,config:d}}_buildDeviceGroup(e,t){if(!e.length)return null;let a=null;for(const r of e){const e=r.entity?.device_id;if(e&&t[e]){a=t[e];break}}return{device:a,entities:e}}connectedCallback(){super.connectedCallback(),this._sparklineTimer=setInterval(()=>this._fetchSparklines(),18e5)}disconnectedCallback(){super.disconnectedCallback(),this._sparklineTimer&&(clearInterval(this._sparklineTimer),this._sparklineTimer=null)}updated(e){super.updated(e),this.areaId!==this._prevAreaId&&(this._prevAreaId=this.areaId,this._sparklineData.clear(),this._sparklineCache.clear()),e.has("hass")&&this.hass&&0===this._sparklineData.size&&this._fetchSparklines()}async _fetchSparklines(){if(!this.hass||!this.isConnected)return;const e=this._getAllEntities().filter(e=>{if("sensor"!==e.domain)return!1;const t=e.state?.attributes?.device_class||"";return["temperature","humidity","pm25","carbon_dioxide","volatile_organic_compounds","aqi"].includes(t)}).map(e=>e.entity?.entity_id).filter(Boolean);if(0===e.length)return;const t=this.areaId||"ls",a=await(0,ie.s)(this.hass,t,e,this._sparklineCache);if(a)for(const t of e)a[t]&&this._sparklineData.set(t,a[t]);this.isConnected&&this.requestUpdate()}renderBadge(){const{ambientEntries:t,config:a}=this._partitionEntities(),r=t.find(e=>"temperature"===e.state?.attributes?.device_class);if(!r)return e.qy``;const i=parseFloat(r.state?.state);if(isNaN(i))return e.qy``;const s=r.state?.attributes?.unit_of_measurement||"°F",n=(0,J.sx)(i);return e.qy`<lcars-summary-badge value="${i}${s}" color="${n}"></lcars-summary-badge>`}renderContent(){const{climateGroup:t,envGroup:a,ambientEntries:r,config:i}=this._partitionEntities();switch(i){case"full":return this._renderFullLayout(t,a,r);case"atmos-only":return this._renderAtmosOnly(a);case"climate-only":return this._renderClimateOnly(t,r);case"sensors-only":return this._renderSensorHero(r);default:return e.qy`<div class="ls-empty">NO LIFE SUPPORT DATA</div>`}}_renderFullLayout(t,a,r){return e.qy`
      <div class="ls-content ls-full">
        <div class="ls-substations">
          <div class="ls-substation ls-climate-sub">
            <lcars-climate-panel
              .group=${t}
              .hass=${this.hass}
              .editMode=${this.editMode}
              .config=${this.config}
              frame-mode="nested">
            </lcars-climate-panel>
          </div>
          <div class="ls-substation ls-env-sub">
            <lcars-environment-panel
              .group=${a}
              .hass=${this.hass}
              .editMode=${this.editMode}
              .config=${this.config}
              frame-mode="nested">
            </lcars-environment-panel>
          </div>
        </div>
        ${this._renderAmbientRow(r)}
        ${this._renderSparklineTray()}
      </div>
    `}_renderAtmosOnly(t){return e.qy`
      <div class="ls-content ls-atmos-only">
        <lcars-environment-panel
          .group=${t}
          .hass=${this.hass}
          .editMode=${this.editMode}
          .config=${this.config}
          frame-mode="nested">
        </lcars-environment-panel>
      </div>
    `}_renderClimateOnly(t,a){return e.qy`
      <div class="ls-content ls-climate-only">
        <lcars-climate-panel
          .group=${t}
          .hass=${this.hass}
          .editMode=${this.editMode}
          .config=${this.config}
          frame-mode="nested">
        </lcars-climate-panel>
        ${this._renderAmbientRow(a)}
        ${this._renderSparklineTray()}
      </div>
    `}_renderSensorHero(t){const a=t.find(e=>"temperature"===e.state?.attributes?.device_class),r=t.find(e=>"humidity"===e.state?.attributes?.device_class),i=a?parseFloat(a.state?.state):null,s=r?parseFloat(r.state?.state):null,n=a?.state?.attributes?.unit_of_measurement||"°F",o=null!=i?(0,J.sx)(i):"var(--lcars-butterscotch)";return e.qy`
      <div class="ls-content ls-sensor-hero" role="status" aria-live="polite">
        ${null!=i?e.qy`
          <div class="ls-hero-temp"
               style="color:${o}"
               aria-label="Temperature: ${i} ${n}">
            ${i}<span class="ls-hero-unit">${n}</span>
          </div>
        `:""}
        ${null!=s?e.qy`
          <div class="ls-hero-humidity"
               aria-label="Humidity: ${s} percent">
            ${s}<span class="ls-hero-unit">%</span>
            <span class="ls-hero-label">HUMIDITY</span>
          </div>
        `:""}
        ${this._renderAmbientRow(t.filter(e=>{const t=e.state?.attributes?.device_class||"";return"temperature"!==t&&"humidity"!==t}))}
        ${this._renderSparklineTray()}
      </div>
    `}_renderAmbientRow(t){return t?.length?e.qy`
      <div class="ls-ambient-row" role="region" aria-label="Ambient Sensors">
        <div class="ls-ambient-label">AMBIENT SENSORS</div>
        <div class="ls-ambient-readings">
          ${t.map(t=>{const a=this._shortEntityName(t),r=t.state?.state,i=t.state?.attributes?.unit_of_measurement||"",s=t.state?.attributes?.device_class||"",n="temperature"===s?(0,J.sx)(parseFloat(r)):"humidity"===s?"var(--lcars-ice)":"var(--lcars-butterscotch)";return e.qy`
              <div class="ls-ambient-reading"
                   aria-label="${a}: ${r} ${i}">
                <span class="ls-ambient-indicator" style="background:${n}"></span>
                <span class="ls-ambient-name">${a}</span>
                <span class="ls-ambient-value" style="color:${n}">${r}${i}</span>
              </div>
            `})}
        </div>
      </div>
    `:e.qy``}_renderSparklineTray(){if(0===this._sparklineData.size)return e.qy``;const t=[],a={temperature:"var(--lcars-butterscotch)",humidity:"var(--lcars-ice)",aqi:"var(--lcars-sunflower)",pm25:"var(--lcars-peach)",carbon_dioxide:"var(--lcars-sunflower)",volatile_organic_compounds:"var(--lcars-african-violet)"},r=this._getAllEntities();for(const[i,s]of this._sparklineData){const n=r.find(e=>e.entity?.entity_id===i);if(!n)continue;const o=n.state?.attributes?.device_class||"",l=a[o]||"var(--lcars-butterscotch)",c=(o||i.split(".")[1]).toUpperCase().replace(/_/g," ");t.push(e.qy`
        <div class="ls-sparkline-slot" aria-hidden="true">
          <span class="ls-sparkline-label" style="color:${l}">${c}</span>
          ${(0,ie.K)(s,{color:l,width:120,height:24})}
        </div>
      `)}return 0===t.length?e.qy``:e.qy`
      <div class="ls-sparkline-tray" role="region" aria-label="24-hour trends">
        ${t}
      </div>
    `}_shortEntityName(e){const t=e.state?.attributes?.friendly_name||e.entity?.entity_id||"";return this._shortenName(t,e.entity).toUpperCase()}});const Oe=e.AH`
  /* ─── Content Container ─── */

  .ilm-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
  }

  .ilm-empty {
    font-family: var(--lcars-font, 'Antonio', sans-serif);
    font-size: var(--lcars-font-size-data, 0.875rem);
    color: var(--lcars-gray, #666688);
    text-transform: uppercase;
    text-align: center;
    padding: 2rem 1rem;
  }

  /* ─── Light Brightness Bars ─── */

  .ilm-lights {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(20rem, 100%), 1fr));
    gap: 0.375rem;
  }

  .ilm-light-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .ilm-light-bar {
    display: flex;
    align-items: center;
    height: 2.5rem;
    padding: 0 0.75rem;
    border-radius: 0 var(--lcars-btn-radius, 1.5rem) var(--lcars-btn-radius, 1.5rem) 0;
    cursor: pointer;
    transition: opacity 200ms ease;
    font-family: var(--lcars-font, 'Antonio', sans-serif);
    font-size: var(--lcars-font-size-data, 0.875rem);
    text-transform: uppercase;
    position: relative;
    overflow: hidden;
    /* Flat fill bar — no gradients per Bracer Jack Rule 1 */
    background: var(--lcars-gray-alpha, rgba(102, 102, 136, 0.15));
    min-height: 2.5rem;
  }

  .ilm-light-bar::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: var(--brightness, 0%);
    background: var(--bar-color, var(--lcars-sunflower, #ffcc99));
    opacity: 0.25;
    transition: width 300ms ease;
    pointer-events: none;
  }

  .ilm-light-bar.on::before {
    opacity: 0.35;
  }

  .ilm-light-bar:hover {
    opacity: 0.85;
  }

  .ilm-light-bar:active {
    opacity: 0.7;
  }

  /* ─── Indicator Dot ─── */

  .ilm-indicator {
    display: inline-block;
    width: 2px;
    height: 1rem;
    border-radius: 1px;
    background: var(--lcars-gray, #666688);
    margin-right: 0.5rem;
    flex-shrink: 0;
    transition: background 200ms ease;
    z-index: 1;
  }

  .ilm-indicator.active {
    background: var(--lcars-sunflower, #ffcc99);
  }

  /* ─── Light Name & Value ─── */

  .ilm-light-name {
    flex: 1;
    color: var(--lcars-text, #f5f6fa);
    z-index: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ilm-light-bar.off .ilm-light-name {
    color: var(--lcars-gray, #666688);
  }

  .ilm-light-value {
    color: var(--lcars-sunflower, #ffcc99);
    font-variant-numeric: tabular-nums;
    z-index: 1;
    cursor: pointer;
    padding: 0.25rem 0.375rem;
    border-radius: var(--lcars-btn-radius, 1.5rem);
    min-width: 3rem;
    text-align: right;
  }

  .ilm-light-bar.off .ilm-light-value {
    color: var(--lcars-gray, #666688);
  }

  .ilm-light-value:hover {
    background: rgba(245, 246, 250, 0.08);
  }

  /* ─── Brightness Slider ─── */

  .ilm-expanded-controls {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    padding-bottom: 0.25rem;
  }

  .ilm-slider-row {
    padding: 0.25rem 0.75rem 0.375rem 0.75rem;
  }

  .ilm-slider-row input[type="range"] {
    width: 100%;
    height: 4px;
    -webkit-appearance: none;
    appearance: none;
    background: var(--lcars-gray, #666688);
    border-radius: 2px;
    outline: none;
    cursor: pointer;
  }

  .ilm-slider-row input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 1.5rem;
    height: 1.5rem;
    background: var(--lcars-sunflower, #ffcc99);
    border-radius: 0 var(--lcars-btn-radius, 1.5rem) var(--lcars-btn-radius, 1.5rem) 0;
    border: none;
    cursor: pointer;
  }

  .ilm-slider-row input[type="range"]::-moz-range-thumb {
    width: 1.5rem;
    height: 1.5rem;
    background: var(--lcars-sunflower, #ffcc99);
    border-radius: 0 var(--lcars-btn-radius, 1.5rem) var(--lcars-btn-radius, 1.5rem) 0;
    border: none;
    cursor: pointer;
  }

  /* ─── Section Dividers ─── */

  .ilm-section-divider {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.375rem;
  }

  .ilm-section-label {
    font-family: var(--lcars-font, 'Antonio', sans-serif);
    font-size: var(--lcars-font-size-label, 0.75rem);
    color: var(--lcars-gray, #666688);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    white-space: nowrap;
  }

  .ilm-section-line {
    flex: 1;
    height: 0.375rem;
    background: var(--lcars-gray, #666688);
    border-radius: 0 var(--lcars-btn-radius, 1.5rem) var(--lcars-btn-radius, 1.5rem) 0;
    opacity: 0.3;
  }

  /* ─── Scene Buttons ─── */

  .ilm-scenes {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
    overflow-x: auto;
    scrollbar-width: thin;
  }

  .ilm-scene-btn {
    font-family: var(--lcars-font, 'Antonio', sans-serif);
    font-size: var(--lcars-font-size-data, 0.875rem);
    text-transform: uppercase;
    color: var(--lcars-black, #000);
    background: var(--lcars-sunflower, #ffcc99);
    border: none;
    padding: 0.375rem 1rem;
    border-radius: 0 var(--lcars-btn-radius, 1.5rem) var(--lcars-btn-radius, 1.5rem) 0;
    cursor: pointer;
    white-space: nowrap;
    transition: opacity 150ms ease;
    min-height: 2rem;
  }

  .ilm-scene-btn:first-child {
    border-radius: var(--lcars-btn-radius, 1.5rem) 0 0 var(--lcars-btn-radius, 1.5rem);
  }

  .ilm-scene-btn:hover {
    opacity: 0.8;
  }

  .ilm-scene-btn:active {
    opacity: 0.6;
  }

  /* ─── Circuit Rows ─── */

  .ilm-circuits {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(20rem, 100%), 1fr));
    gap: 0.375rem;
  }

  .ilm-circuit-row {
    display: flex;
    align-items: center;
    height: 2rem;
    padding: 0 0.75rem;
    cursor: pointer;
    font-family: var(--lcars-font, 'Antonio', sans-serif);
    font-size: var(--lcars-font-size-data, 0.875rem);
    text-transform: uppercase;
    transition: opacity 200ms ease;
  }

  .ilm-circuit-row:hover {
    opacity: 0.8;
  }

  .ilm-circuit-name {
    flex: 1;
    color: var(--lcars-text, #f5f6fa);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ilm-circuit-row.off .ilm-circuit-name {
    color: var(--lcars-gray, #666688);
  }

  .ilm-circuit-state {
    color: var(--lcars-sunflower, #ffcc99);
    font-variant-numeric: tabular-nums;
    min-width: 2.5rem;
    text-align: right;
  }

  .ilm-circuit-row.off .ilm-circuit-state {
    color: var(--lcars-gray, #666688);
  }

  /* ─── Effect Strip — 2-column grid of LCARS pill buttons ─── */

  .ilm-effects-strip {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.375rem;
    padding: 0.25rem 0.75rem 0.375rem 0.75rem;
  }

  .ilm-effect-btn {
    font-family: var(--lcars-font, 'Antonio', sans-serif);
    font-size: var(--lcars-font-size-data, 0.875rem);
    text-transform: uppercase;
    color: var(--lcars-text, #f5f6fa);
    background: rgba(102, 102, 136, 0.3);
    border: none;
    padding: 0.5rem 1rem;
    border-radius: var(--lcars-btn-radius, 1.5rem);
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-height: 2.5rem;
    transition: opacity 150ms ease;
    text-align: center;
  }

  .ilm-effect-btn.active {
    background: var(--lcars-gold, #ffaa00);
    color: var(--lcars-black, #000);
  }

  .ilm-effect-btn:hover {
    filter: brightness(1.2);
  }

  .ilm-effect-btn:focus-visible {
    outline: 2px solid var(--lcars-sunflower, #ffcc99);
    outline-offset: 2px;
  }

  /* ─── Color Presets — single row of LCARS pills ─── */

  .ilm-color-presets {
    display: flex;
    gap: 0.375rem;
    padding: 0.25rem 0.75rem 0.375rem 0.75rem;
    flex-wrap: wrap;
  }

  .ilm-color-preset {
    font-family: var(--lcars-font, 'Antonio', sans-serif);
    font-size: var(--lcars-font-size-data, 0.875rem);
    text-transform: uppercase;
    color: var(--lcars-black, #000);
    background: var(--preset-color);
    border: none;
    padding: 0.5rem 1rem;
    border-radius: var(--lcars-btn-radius, 1.5rem);
    cursor: pointer;
    white-space: nowrap;
    min-height: 2.5rem;
    flex: 1;
    min-width: 4rem;
    transition: opacity 150ms ease;
    opacity: 0.6;
    text-align: center;
  }

  .ilm-color-preset.active {
    opacity: 1;
    outline: 2px solid var(--lcars-text, #f5f6fa);
    outline-offset: 1px;
  }

  .ilm-color-preset:hover {
    filter: brightness(1.2);
  }

  .ilm-color-preset:focus-visible {
    outline: 2px solid var(--lcars-sunflower, #ffcc99);
    outline-offset: 2px;
  }

  /* ─── Effect name truncation in bar value ─── */

  .ilm-light-value {
    max-width: 8rem;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* ─── Reduced Motion ─── */

  @media (prefers-reduced-motion: reduce) {
    .ilm-light-bar,
    .ilm-light-bar::before,
    .ilm-indicator,
    .ilm-circuit-row,
    .ilm-scene-btn,
    .ilm-effect-btn,
    .ilm-color-preset {
      transition-duration: 0.01ms !important;
    }
  }

  /* ─── Edit Mode: Drag-and-Drop Reorder ─── */

  /* Reorder status bar */
  .ilm-reorder-status {
    font-family: var(--lcars-font, 'Antonio', sans-serif);
    font-size: var(--lcars-font-size-label, 0.75rem);
    color: var(--lcars-gold, #ffaa00);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 0.25rem 0;
    min-height: 1.25rem;
  }

  /* Grip handle — 3-pip vertical pattern (LCARS-native, Geordi spec) */
  .ilm-grip {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    min-width: 2.5rem;
    height: 100%;
    flex-shrink: 0;
    cursor: grab;
    touch-action: none;
    -webkit-touch-callout: none;
    padding: 0 0.5rem;
    margin-right: 0.25rem;
    z-index: 1;
  }

  .ilm-grip span {
    display: block;
    width: 4px;
    height: 4px;
    border-radius: 1px;
    background: var(--lcars-gray, #666688);
    transition: background 150ms ease;
  }

  .ilm-grip:hover span {
    background: var(--lcars-sunflower, #ffcc99);
  }

  .ilm-grip:active {
    cursor: grabbing;
  }

  .ilm-grip:active span {
    background: var(--lcars-gold, #ffaa00);
  }

  /* Dragging state on the active bar */
  .ilm-light-bar.dragging {
    opacity: 0.5;
    z-index: 10;
  }

  /* Edit mode: indicator becomes full-height gold rail */
  :host([edit-mode]) .ilm-light-bar .ilm-indicator {
    height: 100%;
    background: var(--lcars-gold, #ffaa00);
  }
`;class Re extends we{static get properties(){return{...super.properties,_expandedLight:{type:String},_dragEntityId:{type:String}}}constructor(){super(),this._expandedLight=null,this._dragEntityId=null,this._dragState=null,this._flipPositions=null,this._brightnessDebouncer=re((e,t)=>{const a=te(t,1,100),r=Math.round(a/100*255);this._callService("light","turn_on",{entity_id:e,brightness:r})},300),this._sceneRateLimiter=ae(3,5e3),this._lastDragWasDrag=!1,this._boundPointerMove=this._handlePointerMove.bind(this),this._boundPointerUp=this._handlePointerUp.bind(this)}get panelType(){return"illumination"}get defaultPanelTitle(){return"ILLUMINATION CONTROL"}get frameColor(){return"var(--lcars-sunflower)"}static get styles(){return[...super.styles,oe,le,r.AM,Oe]}disconnectedCallback(){super.disconnectedCallback(),this._cancelDrag(),this._brightnessDebouncer.cancel(),this._dragState=null,this._flipPositions=null}willUpdate(e){super.willUpdate(e),(e.has("areaId")||e.has("group")||e.has("entities"))&&(this._expandedLight=null,this._cancelDrag())}_getPartition(){return this._partitionLightingEntities()}_partitionLightingEntities(){const e=this._getAllEntities(),t=[],a=[],r=[],i=new Set;for(const r of e)"light"===r.domain&&X(r)?(t.push(r),r.entity?.device_id&&i.add(r.entity.device_id)):"scene"===r.domain&&a.push(r);for(const t of e)"light"!==t.domain&&"scene"!==t.domain&&(t.entity?.device_id&&i.has(t.entity.device_id)||(X(t)||"switch"===t.domain&&"outlet"!==t.state?.attributes?.device_class)&&r.push(t));return this._applyCustomOrder(t),{dimmableLights:t,scenes:a,circuits:r}}_getOrderKey(){return`lcars-ilm-order-${this.areaId||"default"}`}_loadOrder(e){try{const t=JSON.parse(localStorage.getItem(this._getOrderKey()));if(!Array.isArray(t))return null;const a=new Set(e),r=t.filter(e=>a.has(e)),i=e.filter(e=>!t.includes(e));return i.sort(),[...r,...i]}catch{return null}}_saveOrder(e){try{localStorage.setItem(this._getOrderKey(),JSON.stringify(e))}catch(e){i.g0.warn("IlluminationPanel","Failed to save light order:",e)}}_applyCustomOrder(e){const t=e.map(e=>e.entity?.entity_id),a=this._loadOrder(t);if(a){const t=new Map(a.map((e,t)=>[e,t]));e.sort((e,a)=>{const r=t.get(e.entity?.entity_id)??999,i=t.get(a.entity?.entity_id)??999;return r!==i?r-i:(e.state?.attributes?.friendly_name||"").localeCompare(a.state?.attributes?.friendly_name||"")})}else e.sort((e,t)=>(e.state?.attributes?.friendly_name||"").localeCompare(t.state?.attributes?.friendly_name||""))}renderBadge(){const{dimmableLights:t,circuits:a}=this._getPartition(),r=[...t,...a],i=r.length,s=r.filter(e=>{const t=e.entity?.entity_id;return"on"===(this.hass?.states?.[t]||e.state)?.state}).length;return 0===i?e.qy``:e.qy`
      <lcars-summary-badge
        value="${s}"
        total="${i}"
        label="ON"
        color="var(--lcars-sunflower)">
      </lcars-summary-badge>
    `}renderContent(){const{dimmableLights:t,scenes:a,circuits:r}=this._getPartition();return 0===t.length&&0===r.length?e.qy`<div class="ilm-empty">NO LIGHTING ENTITIES</div>`:e.qy`
      <div class="ilm-content">
        ${this.editMode?e.qy`
          <div class="ilm-reorder-status" role="status" aria-live="polite">
            ${this._dragEntityId?"":"DRAG TO REORDER • ALT+ARROWS TO MOVE"}
          </div>
        `:""}
        ${t.length>0?e.qy`
          <div class="ilm-lights" role="list" aria-label="Dimmable lights">
            ${t.map(e=>this._renderLightBar(e))}
          </div>
        `:""}

        ${a.length>0?e.qy`
          <div class="ilm-section-divider">
            <span class="ilm-section-label">SCENES</span>
            <span class="ilm-section-line"></span>
          </div>
          <div class="ilm-scenes" role="list" aria-label="Scene presets">
            ${a.map(e=>this._renderSceneButton(e))}
          </div>
        `:""}

        ${r.length>0?e.qy`
          <div class="ilm-section-divider">
            <span class="ilm-section-label">CIRCUITS</span>
            <span class="ilm-section-line"></span>
          </div>
          <div class="ilm-circuits" role="list" aria-label="Lighting circuits">
            ${r.map(e=>this._renderCircuitRow(e))}
          </div>
        `:""}
      </div>
    `}updated(e){if(super.updated(e),!this._flipPositions)return;const t=this.shadowRoot.querySelectorAll(".ilm-light-bar"),a=this._flipPositions;this._flipPositions=null,requestAnimationFrame(()=>{for(const e of t){const t=e.dataset.entityId,r=a.get(t);if(null==r)continue;const i=r-e.getBoundingClientRect().top;Math.abs(i)<1||(e.style.transform=`translateY(${i}px)`,e.style.transition="none",e.offsetHeight,e.style.transition="transform 200ms cubic-bezier(0.2, 0, 0.2, 1)",e.style.transform="")}})}_renderLightBar(t){const a=t.entity?.entity_id,r=this.hass?.states?.[a]||t.state,s="on"===r?.state,n=s?Math.round((r?.attributes?.brightness||0)/255*100):0,o=this._shortEntityName(t),l=this._expandedLight===a,c=this._dragEntityId===a,d=r?.attributes?.color_temp_kelvin,p=this._getBarColor(d,s,r),u=r?.attributes?.effect_list,m=r?.attributes?.effect,h=Array.isArray(u)&&u.length>0,v=r?.attributes?.supported_color_modes||[],f=v.some(e=>"hs"===e||"rgb"===e||"xy"===e),g=v.some(e=>"brightness"===e||"color_temp"===e||"hs"===e||"rgb"===e||"xy"===e),b=r?.attributes?.hs_color?.[0],y=g||h||f,w=s?m&&"none"!==m?m.toUpperCase():g?`${n}%`:"ON":"OFF";return e.qy`
      <div class="ilm-light-item">
        <div class="ilm-light-bar ${s?"on":"off"} ${c?"dragging":""}"
           role="listitem"
           tabindex="0"
           data-entity-id="${a}"
           style="--brightness:${s&&!g?100:n}%; --bar-color:${p}"
           @click=${e=>{this._lastDragWasDrag||this._dragState?.didDrag||this._toggleLight(a)}}
           @contextmenu=${e=>{e.preventDefault(),(0,i.Hv)(a)}}
           @keydown=${e=>this._handleLightKeydown(e,a,n)}>
        ${this.editMode?e.qy`
          <span class="ilm-grip"
                aria-label="Drag to reorder ${o}"
                @pointerdown=${e=>this._onPointerDown(e,a)}>
            <span></span><span></span><span></span>
          </span>
        `:e.qy`
          <span class="ilm-indicator ${s?"active":""}"
                aria-hidden="true"></span>
        `}
        <span class="ilm-light-name">${o}</span>
        ${y?e.qy`
          <span class="ilm-light-value"
                tabindex="0"
                role="button"
                aria-expanded="${l}"
                aria-label="${o} ${w} — click to ${l?"collapse":"expand"} controls"
                @click=${e=>{e.stopPropagation(),this._expandedLight=l?null:a}}>
            ${w}
          </span>
        `:e.qy`
          <span class="ilm-light-value">${w}</span>
        `}
      </div>
      ${l&&y?e.qy`
        <div class="ilm-expanded-controls">
          ${g?e.qy`
            <div class="ilm-slider-row">
              <input type="range" min="1" max="100" .value=${String(n)}
                     aria-label="${o} brightness slider"
                     @input=${e=>{e.stopPropagation(),this._brightnessDebouncer.call(a,parseInt(e.target.value))}}
                     @click=${e=>e.stopPropagation()}
                     @change=${e=>{e.stopPropagation(),this._setBrightness(a,parseInt(e.target.value))}}>
            </div>
          `:""}
          ${f?e.qy`
            <div class="ilm-color-presets" role="listbox" aria-label="${o} color presets">
              ${Re.COLOR_PRESETS.map(t=>e.qy`
                <button class="ilm-color-preset ${this._isActivePreset(b,t.hs[0])?"active":""}"
                        style="--preset-color:${t.color}"
                        role="option"
                        aria-selected="${this._isActivePreset(b,t.hs[0])}"
                        aria-label="Set ${t.name.toLowerCase()} color"
                        @click=${e=>{e.stopPropagation(),this._setColor(a,t.hs)}}>
                  ${t.name}
                </button>
              `)}
            </div>
          `:""}
          ${h?e.qy`
            <div class="ilm-effects-strip" role="listbox" aria-label="${o} effects">
              <button class="ilm-effect-btn ${m&&"none"!==m?"":"active"}"
                      role="option"
                      aria-selected="${!m||"none"===m}"
                      @click=${e=>{e.stopPropagation(),this._clearEffect(a)}}>
                SOLID
              </button>
              ${u.map(t=>e.qy`
                <button class="ilm-effect-btn ${m===t?"active":""}"
                        role="option"
                        aria-selected="${m===t}"
                        @click=${e=>{e.stopPropagation(),this._setEffect(a,t)}}>
                  ${t.toUpperCase()}
                </button>
              `)}
            </div>
          `:""}
        </div>
      `:""}
      </div>
    `}_onPointerDown(e,t){if(!this.editMode)return;e.preventDefault(),e.stopPropagation();const a=e.target.closest(".ilm-light-bar");if(!a)return;a.setPointerCapture(e.pointerId),a.addEventListener("pointermove",this._boundPointerMove),a.addEventListener("pointerup",this._boundPointerUp),a.addEventListener("pointercancel",this._boundPointerUp);const{dimmableLights:r}=this._getPartition(),i=r.map(e=>e.entity?.entity_id),s=i.indexOf(t);this._dragState={entityId:t,pointerId:e.pointerId,startY:e.clientY,barEl:a,currentIndex:s,hoverIndex:s,orderedIds:[...i],didDrag:!1},this._dragEntityId=t}_handlePointerMove(e){if(!this._dragState)return;const t=e.clientY-this._dragState.startY;if(!this._dragState.didDrag&&Math.abs(t)<8)return;this._dragState.didDrag=!0;const a=this.shadowRoot.querySelectorAll(".ilm-light-bar");if(!a.length)return;const r=a[0].getBoundingClientRect().height+4,i=Math.round(t/r),s=te(this._dragState.currentIndex+i,0,this._dragState.orderedIds.length-1);if(s!==this._dragState.hoverIndex){this._dragState.hoverIndex=s,this._captureFlipPositions();const e=[...this._dragState.orderedIds],t=e.indexOf(this._dragState.entityId);e.splice(t,1),e.splice(s,0,this._dragState.entityId),this._saveOrder(e),this.requestUpdate()}}_handlePointerUp(e){if(!this._dragState)return;const t=this._dragState.barEl;if(t){try{t.releasePointerCapture(this._dragState.pointerId)}catch{}t.removeEventListener("pointermove",this._boundPointerMove),t.removeEventListener("pointerup",this._boundPointerUp),t.removeEventListener("pointercancel",this._boundPointerUp)}const a=this._dragState.didDrag;this._lastDragWasDrag=a,this._dragState=null,this._dragEntityId=null,a&&(requestAnimationFrame(()=>{this._lastDragWasDrag=!1}),this.requestUpdate())}_cancelDrag(){if(this._dragState?.barEl){const e=this._dragState.barEl;try{e.releasePointerCapture(this._dragState.pointerId)}catch{}e.removeEventListener("pointermove",this._boundPointerMove),e.removeEventListener("pointerup",this._boundPointerUp),e.removeEventListener("pointercancel",this._boundPointerUp)}this._dragState=null,this._dragEntityId=null}_captureFlipPositions(){this._flipPositions=new Map;const e=this.shadowRoot.querySelectorAll(".ilm-light-bar");for(const t of e){const e=t.dataset.entityId;e&&this._flipPositions.set(e,t.getBoundingClientRect().top)}}_handleLightKeydown(e,t,a){if(this.editMode&&e.altKey&&("ArrowUp"===e.key||"ArrowDown"===e.key))return e.preventDefault(),void this._keyboardReorder(t,"ArrowUp"===e.key?-1:1);"Enter"===e.key||" "===e.key?(e.preventDefault(),this._toggleLight(t)):"ArrowUp"===e.key||"ArrowRight"===e.key?(e.preventDefault(),a>0&&this._setBrightness(t,Math.min(100,a+5))):"ArrowDown"!==e.key&&"ArrowLeft"!==e.key||(e.preventDefault(),a>0&&this._setBrightness(t,Math.max(1,a-5)))}_keyboardReorder(e,t){const{dimmableLights:a}=this._getPartition(),r=a.map(e=>e.entity?.entity_id),i=r.indexOf(e);if(i<0)return;const s=te(i+t,0,r.length-1);if(s===i)return;this._captureFlipPositions(),r.splice(i,1),r.splice(s,0,e),this._saveOrder(r),this.requestUpdate();const n=this.shadowRoot.querySelector(".ilm-reorder-status");if(n){const t=a.find(t=>t.entity?.entity_id===e),i=t?this._shortEntityName(t):e;n.textContent=`${i} MOVED TO POSITION ${s+1} OF ${r.length}`}this.updateComplete.then(()=>{const t=this.shadowRoot.querySelector(`[data-entity-id="${CSS.escape(e)}"]`);t&&t.focus()})}_renderSceneButton(t){const a=t.entity?.entity_id,r=this._shortEntityName(t);return e.qy`
      <div role="listitem">
        <button class="ilm-scene-btn"
                aria-label="Activate ${r} scene"
                @click=${()=>this._activateScene(a)}>
          ${r}
        </button>
      </div>
    `}_renderCircuitRow(t){const a=t.entity?.entity_id,r="on"===(this.hass?.states?.[a]||t.state)?.state,s=this._shortEntityName(t);return e.qy`
      <div class="ilm-circuit-row ${r?"on":"off"}"
           role="listitem"
           tabindex="0"
           aria-label="${s} — ${r?"on":"off"}"
           @click=${()=>this._toggleLight(a)}
           @contextmenu=${e=>{e.preventDefault(),(0,i.Hv)(a)}}
           @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._toggleLight(a))}}>
        <span class="ilm-indicator ${r?"active":""}"
              aria-hidden="true"></span>
        <span class="ilm-circuit-name">${s}</span>
        <span class="ilm-circuit-state">${r?"ON":"OFF"}</span>
      </div>
    `}_getBarColor(e,t,a){if(!t)return"var(--lcars-gray, #666688)";const r=a?.attributes?.color_mode;if("hs"===r||"rgb"===r||"xy"===r){const e=a?.attributes?.hs_color;if(e)return this._hueToLcarsColor(e[0],e[1])}if(!e)return"var(--lcars-sunflower)";const i=Math.max(0,Math.min(1,(e-2e3)/4500));return i<.5?"var(--lcars-butterscotch)":i<.8?"var(--lcars-sunflower)":"var(--lcars-ice)"}_hueToLcarsColor(e,t){return null!=t&&t<15?"var(--lcars-sunflower)":e<30?"var(--lcars-tomato)":e<60?"var(--lcars-butterscotch)":e<90?"var(--lcars-sunflower)":e<160?"#66bb6a":e<220?"var(--lcars-ice)":e<270?"var(--lcars-bluey)":e<330?"var(--lcars-lilac)":"var(--lcars-tomato)"}static get COLOR_PRESETS(){return[{name:"WARM",hs:[30,80],color:"var(--lcars-butterscotch, #ff9966)"},{name:"COOL",hs:[210,20],color:"var(--lcars-ice, #99ccff)"},{name:"RED",hs:[0,100],color:"var(--lcars-tomato, #ff5555)"},{name:"GREEN",hs:[120,100],color:"#66bb6a"},{name:"BLUE",hs:[240,100],color:"var(--lcars-bluey, #3366cc)"},{name:"PURPLE",hs:[280,80],color:"var(--lcars-lilac, #cc55ff)"}]}_isActivePreset(e,t){if(null==e)return!1;const a=Math.abs(e-t);return a<20||a>340}_setEffect(e,t){this.hass&&e&&this._callService("light","turn_on",{entity_id:e,effect:t})}_clearEffect(e){this.hass&&e&&this._callService("light","turn_on",{entity_id:e,effect:"none"})}_setColor(e,t){this.hass&&e&&this._callService("light","turn_on",{entity_id:e,hs_color:t})}_toggleLight(e){if(!this.hass||!e)return;const t=e.split(".")[0];this._callService(t,"toggle",{entity_id:e})}_setBrightness(e,t){if(!this.hass||!e)return;const a=te(t,1,100),r=Math.round(a/100*255);this._callService("light","turn_on",{entity_id:e,brightness:r})}_activateScene(e){this.hass&&e&&this._sceneRateLimiter.allow()&&this._callService("scene","turn_on",{entity_id:e})}_shortEntityName(e){const t=e.state?.attributes?.friendly_name||e.entity?.entity_id||"";return this._shortenName(t,e.entity).toUpperCase()}}customElements.define("lcars-illumination-panel",Re);const Le=e.AH`

  /* ─── Tactical Content Grid ─── */

  .tactical-content {
    display: grid;
    grid-template-areas:
      "alarm   access"
      "perim   perim"
      "motion  motion"
      "keypad  keypad";
    grid-template-columns: minmax(14rem, 2fr) minmax(10rem, 1fr);
    grid-template-rows: auto auto auto auto;
    gap: var(--lcars-gap);
  }

  .tactical-content.no-alarm {
    grid-template-areas:
      "access access"
      "perim  perim"
      "motion motion";
  }

  .tactical-content.alarm-only {
    grid-template-areas:
      "alarm alarm"
      "keypad keypad";
    grid-template-columns: 1fr;
  }

  .tactical-content.sensors-only {
    grid-template-areas:
      "perim"
      "motion";
    grid-template-columns: 1fr;
  }

  @media (max-width: 30rem) {
    .tactical-content {
      grid-template-areas: "alarm" "access" "perim" "motion" "keypad";
      grid-template-columns: 1fr;
    }
  }

  /* ─── Section Labels ─── */

  .tactical-section-label {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-label, 0.75rem);
    color: var(--lcars-gray);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding-bottom: 0.15rem;
    border-bottom: 2px solid var(--lcars-gray);
    margin-bottom: 0.25rem;
  }

  /* ─── Alarm Substation ─── */

  .tactical-alarm {
    grid-area: alarm;
  }

  /* ─── Access Points (locks, covers) ─── */

  .tactical-access {
    grid-area: access;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .tactical-access-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.75rem;
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    text-transform: uppercase;
    cursor: pointer;
    transition: background var(--lcars-transition), filter var(--lcars-transition);
    min-height: var(--lcars-btn-height, 2rem);
  }

  .tactical-access-row:hover { filter: brightness(1.15); }
  .tactical-access-row:focus-visible {
    outline: 2px solid var(--lcars-ice);
    outline-offset: 2px;
  }

  .tactical-access-row[data-secure] {
    background: var(--lcars-sunflower);
    color: var(--lcars-black);
  }
  .tactical-access-row[data-breach] {
    background: var(--lcars-tomato);
    color: var(--lcars-black);
  }

  .tactical-access-indicator {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .tactical-access-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tactical-access-state {
    flex-shrink: 0;
    font-weight: 700;
  }

  /* ─── Perimeter (door/window sensors) ─── */

  .tactical-perimeter {
    grid-area: perim;
    display: flex;
    flex-wrap: wrap;
    gap: var(--lcars-gap);
  }

  .tactical-perim-chip {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.25rem 0.75rem;
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    text-transform: uppercase;
    min-width: 8rem;
    cursor: pointer;
    transition: background var(--lcars-transition);
  }

  .tactical-perim-chip:hover { background: rgba(255,255,255,0.05); }
  .tactical-perim-chip:focus-visible {
    outline: 2px solid var(--lcars-ice);
    outline-offset: 2px;
  }

  .tactical-perim-chip[data-open] {
    background: var(--lcars-butterscotch);
    color: var(--lcars-black);
  }
  .tactical-perim-chip[data-closed] {
    background: var(--lcars-gray);
    color: var(--lcars-space-white);
  }

  /* ─── Motion Sensors ─── */

  .tactical-motion {
    grid-area: motion;
    display: flex;
    flex-wrap: wrap;
    gap: var(--lcars-gap);
  }

  .tactical-motion-chip {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.25rem 0.75rem;
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    text-transform: uppercase;
    min-width: 8rem;
    cursor: pointer;
    transition: background var(--lcars-transition);
  }

  .tactical-motion-chip:hover { background: rgba(255,255,255,0.05); }
  .tactical-motion-chip:focus-visible {
    outline: 2px solid var(--lcars-ice);
    outline-offset: 2px;
  }

  .tactical-motion-chip[data-detected] {
    background: var(--lcars-butterscotch);
    color: var(--lcars-black);
  }
  .tactical-motion-chip[data-clear] {
    background: var(--lcars-gray);
    color: var(--lcars-space-white);
  }

  .chip-indicator {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .chip-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .chip-state {
    flex-shrink: 0;
    font-weight: 700;
    font-size: var(--lcars-font-size-data);
  }

  /* ─── Keypad (from alarm substation) ─── */

  .tactical-keypad {
    grid-area: keypad;
  }

  /* ─── Empty State ─── */

  .tactical-empty {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    color: var(--lcars-gray);
    text-transform: uppercase;
    text-align: center;
    padding: 2rem 1rem;
  }

  @media (prefers-reduced-motion: reduce) {
    .tactical-access-row,
    .tactical-perim-chip,
    .tactical-motion-chip {
      transition-duration: 0.01ms !important;
    }
  }
`;customElements.define("lcars-tactical-panel",class extends we{static get properties(){return{...super.properties}}get panelType(){return"tactical"}get defaultPanelTitle(){return"TACTICAL"}get frameColor(){const e=this._getAlarmEntry();if(e){const t=e.state?.state||"";if("triggered"===t)return"var(--lcars-tomato)";if("armed_away"===t||"armed_vacation"===t)return"var(--lcars-butterscotch)";if("armed_home"===t||"armed_night"===t)return"var(--lcars-sunflower)";if("arming"===t||"pending"===t)return"var(--lcars-gold)"}return this._getAccessEntries().some(e=>"lock"===e.domain?"locked"!==e.state?.state:"open"===e.state?.state)?"var(--lcars-butterscotch)":"var(--lcars-ice)"}static get styles(){return[...super.styles,oe,le,r.AM,Le]}_partitionEntities(){const e=this._getAllEntities(),t=[],a=[],r=[],i=[];for(const s of e)if(C.has(s.domain))t.push(s);else if("lock"===s.domain)a.push(s);else if("cover"===s.domain){const e=s.state?.attributes?.device_class||"";["garage_door","gate","door"].includes(e)&&a.push(s)}else if("binary_sensor"===s.domain){const e=s.state?.attributes?.device_class||"";["door","window","opening","garage_door"].includes(e)?r.push(s):["motion","occupancy"].includes(e)?i.push(s):["tamper","safety"].includes(e)&&r.push(s)}const s=t.length>0,n=a.length>0,o=r.length>0,l=i.length>0,c=n||o||l;let d;return d=s&&c?"full":s&&!c?"alarm-only":s||!n&&!o?"sensors-only":"no-alarm",{alarmEntries:t,accessEntries:a,perimeterEntries:r,motionEntries:i,config:d}}_getAlarmEntry(){return this._getAllEntities().find(e=>C.has(e.domain))||null}_getAccessEntries(){const{accessEntries:e}=this._partitionEntities();return e}renderBadge(){const t=this._getAlarmEntry(),{accessEntries:a,perimeterEntries:r}=this._partitionEntities(),i=r.filter(e=>"on"===e.state?.state).length,s=a.filter(e=>"lock"===e.domain?"locked"!==e.state?.state:"open"===e.state?.state).length;if("triggered"===t?.state?.state)return e.qy`<lcars-summary-badge value="⚠ ALERT" color="var(--lcars-tomato)"></lcars-summary-badge>`;if(t){const a=(t.state?.state||"").toUpperCase().replace(/_/g," ");return e.qy`<lcars-summary-badge value="${a}" color="${this.frameColor}"></lcars-summary-badge>`}return s>0||i>0?e.qy`<lcars-summary-badge value="${s+i} OPEN" color="var(--lcars-butterscotch)"></lcars-summary-badge>`:e.qy`<lcars-summary-badge value="SECURE" color="var(--lcars-ice)"></lcars-summary-badge>`}renderContent(){const{alarmEntries:t,accessEntries:a,perimeterEntries:r,motionEntries:i,config:s}=this._partitionEntities();return e.qy`
      <div class="tactical-content ${s}">
        ${t.length>0?this._renderAlarmSection(t):""}
        ${a.length>0?this._renderAccessSection(a):""}
        ${r.length>0?this._renderPerimeterSection(r):""}
        ${i.length>0?this._renderMotionSection(i):""}
      </div>
    `}_renderAlarmSection(t){const a=this.hass?.devices||{},r=this._buildGroup(t,a);return e.qy`
      <div class="tactical-alarm">
        <lcars-alarm-panel
          .group=${r}
          .hass=${this.hass}
          .editMode=${this.editMode}
          .config=${this.config}
          frame-mode="nested">
        </lcars-alarm-panel>
      </div>
    `}_renderAccessSection(t){return e.qy`
      <div class="tactical-access" role="list" aria-label="Access points">
        <div class="tactical-section-label">ACCESS POINTS</div>
        ${t.map(t=>{const a=t.entity?.entity_id||"",r=t.state?.attributes?.friendly_name||a,s="lock"===t.domain,n=s?"locked"===t.state?.state:"closed"===t.state?.state,o=s?n?"LOCKED":"UNLOCKED":(t.state?.state||"").toUpperCase(),l=n?"var(--lcars-sunflower)":"var(--lcars-tomato)";return e.qy`
            <div class="tactical-access-row"
                 role="listitem"
                 tabindex="0"
                 aria-label="${r}: ${o}"
                 ?data-secure=${n}
                 ?data-breach=${!n}
                 @click=${()=>s?this._toggleLock(a,n):(0,i.Hv)(a)}
                 @keydown=${e=>("Enter"===e.key||" "===e.key)&&(e.preventDefault(),s?this._toggleLock(a,n):(0,i.Hv)(a))}>
              <span class="tactical-access-indicator" style="background:${l}"></span>
              <span class="tactical-access-name">${r}</span>
              <span class="tactical-access-state">${o}</span>
            </div>
          `})}
      </div>
    `}_renderPerimeterSection(t){return e.qy`
      <div class="tactical-perimeter" role="list" aria-label="Perimeter sensors" aria-live="polite">
        <div class="tactical-section-label" style="width:100%">PERIMETER</div>
        ${t.map(t=>{const a=t.entity?.entity_id||"",r=t.state?.attributes?.friendly_name||a,s="on"===t.state?.state,n=s?"OPEN":"CLOSED",o=s?"var(--lcars-butterscotch)":"var(--lcars-gray)";return e.qy`
            <div class="tactical-perim-chip"
                 role="listitem"
                 tabindex="0"
                 aria-label="${r}: ${n}"
                 ?data-open=${s}
                 ?data-closed=${!s}
                 @click=${()=>(0,i.Hv)(a)}
                 @keydown=${e=>("Enter"===e.key||" "===e.key)&&(e.preventDefault(),(0,i.Hv)(a))}>
              <span class="chip-indicator" style="background:${o}"></span>
              <span class="chip-name">${r}</span>
              <span class="chip-state">${n}</span>
            </div>
          `})}
      </div>
    `}_renderMotionSection(t){return e.qy`
      <div class="tactical-motion" role="list" aria-label="Motion sensors" aria-live="polite">
        <div class="tactical-section-label" style="width:100%">MOTION</div>
        ${t.map(t=>{const a=t.entity?.entity_id||"",r=t.state?.attributes?.friendly_name||a,s="on"===t.state?.state,n=s?"DETECTED":"CLEAR",o=s?"var(--lcars-butterscotch)":"var(--lcars-gray)";return e.qy`
            <div class="tactical-motion-chip"
                 role="listitem"
                 tabindex="0"
                 aria-label="${r}: ${n}"
                 ?data-detected=${s}
                 ?data-clear=${!s}
                 @click=${()=>(0,i.Hv)(a)}
                 @keydown=${e=>("Enter"===e.key||" "===e.key)&&(e.preventDefault(),(0,i.Hv)(a))}>
              <span class="chip-indicator" style="background:${o}"></span>
              <span class="chip-name">${r}</span>
              <span class="chip-state">${n}</span>
            </div>
          `})}
      </div>
    `}_toggleLock(e,t){const a=t?"unlock":"lock";this._callService("lock",a,{entity_id:e})}_buildGroup(e,t){let a=null;for(const r of e){const e=r.entity?.device_id;if(e&&t[e]){a=t[e];break}}return{device:a,entities:e}}});const Fe=e.AH`

  .viewport-content {
    display: flex;
    flex-direction: column;
    gap: var(--lcars-gap);
  }

  .viewport-cover-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 0.75rem;
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    text-transform: uppercase;
    transition: background var(--lcars-transition);
    cursor: pointer;
    min-height: var(--lcars-btn-height, 2rem);
  }

  .viewport-cover-row:hover { background: rgba(255,255,255,0.05); }
  .viewport-cover-row:focus-visible {
    outline: 2px solid var(--lcars-ice);
    outline-offset: 2px;
  }

  .viewport-indicator {
    width: 2px;
    height: 1rem;
    border-radius: 1px;
    flex-shrink: 0;
  }

  .viewport-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .viewport-position {
    font-weight: 700;
    flex-shrink: 0;
    min-width: 3rem;
    text-align: right;
  }

  .viewport-controls {
    display: flex;
    gap: 0.25rem;
    flex-shrink: 0;
  }

  .viewport-btn {
    width: 2rem;
    height: 2rem;
    border: none;
    border-radius: var(--lcars-btn-radius);
    background: var(--lcars-sunflower);
    color: var(--lcars-black);
    font-family: var(--lcars-font);
    font-size: 0.875rem;
    cursor: pointer;
    transition: background 200ms;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .viewport-btn:hover { filter: brightness(1.15); }
  .viewport-btn:focus-visible {
    outline: 2px solid var(--lcars-ice);
    outline-offset: 2px;
  }
  .viewport-btn[data-active] { background: var(--lcars-gold); }

  .viewport-empty {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    color: var(--lcars-gray);
    text-transform: uppercase;
    text-align: center;
    padding: 2rem 1rem;
  }

  @media (prefers-reduced-motion: reduce) {
    .viewport-cover-row,
    .viewport-btn {
      transition-duration: 0.01ms !important;
    }
  }
`,We=new Set(["garage_door","gate","door"]);customElements.define("lcars-viewport-panel",class extends we{get panelType(){return"viewport"}get defaultPanelTitle(){return"VIEWPORT CONTROLS"}get frameColor(){return"var(--lcars-sunflower)"}static get styles(){return[...super.styles,r.AM,Fe]}_getCoverEntries(){return this._getAllEntities().filter(e=>{if("cover"!==e.domain)return!1;const t=e.state?.attributes?.device_class||"";return!We.has(t)})}renderBadge(){const t=this._getCoverEntries(),a=t.filter(e=>"open"===e.state?.state).length,r=t.length;if(0===r)return e.qy``;const i=a>0?"var(--lcars-sunflower)":"var(--lcars-gray)";return e.qy`<lcars-summary-badge value="${a}/${r} OPEN" color="${i}"></lcars-summary-badge>`}renderContent(){const t=this._getCoverEntries();return 0===t.length?e.qy`<div class="viewport-empty">NO VIEWPORT CONTROLS</div>`:e.qy`
      <div class="viewport-content" role="list" aria-label="Viewport controls">
        ${t.map(e=>this._renderCoverRow(e))}
      </div>
    `}_renderCoverRow(t){const a=t.entity?.entity_id||"",r=t.state?.attributes?.friendly_name||a,s=t.state?.state||"unknown",n=t.state?.attributes?.current_position,o="open"===s,l="closed"===s,c=o?"var(--lcars-sunflower)":"var(--lcars-gray)",d=null!=n?`${n}%`:s.toUpperCase(),p=1&(t.state?.attributes?.supported_features||0),u=2&(t.state?.attributes?.supported_features||0),m=8&(t.state?.attributes?.supported_features||0);return e.qy`
      <div class="viewport-cover-row"
           role="listitem"
           tabindex="0"
           aria-label="${r}: ${d}"
           @click=${()=>(0,i.Hv)(a)}
           @keydown=${e=>("Enter"===e.key||" "===e.key)&&(e.preventDefault(),(0,i.Hv)(a))}>
        <span class="viewport-indicator" style="background:${c}"></span>
        <span class="viewport-name">${r}</span>
        <span class="viewport-position">${d}</span>
        <span class="viewport-controls" @click=${e=>e.stopPropagation()}>
          ${p?e.qy`
            <button class="viewport-btn"
                    ?data-active=${o}
                    aria-label="Open ${r}"
                    @click=${()=>this._callService("cover","open_cover",{entity_id:a})}>
              ▲
            </button>
          `:""}
          ${m?e.qy`
            <button class="viewport-btn"
                    aria-label="Stop ${r}"
                    @click=${()=>this._callService("cover","stop_cover",{entity_id:a})}>
              ■
            </button>
          `:""}
          ${u?e.qy`
            <button class="viewport-btn"
                    ?data-active=${l}
                    aria-label="Close ${r}"
                    @click=${()=>this._callService("cover","close_cover",{entity_id:a})}>
              ▼
            </button>
          `:""}
        </span>
      </div>
    `}});const He=e.AH`

  .hazard-content {
    display: flex;
    flex-direction: column;
    gap: var(--lcars-gap);
  }

  .hazard-section-label {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-label, 0.75rem);
    color: var(--lcars-gray);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding-bottom: 0.15rem;
    border-bottom: 2px solid var(--lcars-gray);
    margin-bottom: 0.25rem;
  }

  /* ─── Detector Status Grid ─── */
  .hazard-detectors {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
    gap: var(--lcars-gap);
  }

  .hazard-detector-card {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.5rem 0.75rem;
    border-left: 3px solid var(--detector-color, var(--lcars-sunflower));
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    cursor: pointer;
    transition: background var(--lcars-transition);
  }
  .hazard-detector-card:hover { background: rgba(255,255,255,0.05); }
  .hazard-detector-card:focus-visible {
    outline: 2px solid var(--lcars-ice);
    outline-offset: 2px;
  }

  .hazard-detector-card[data-alert] {
    border-left-color: var(--lcars-tomato);
    background: rgba(255, 85, 85, 0.08);
  }

  .hazard-detector-name {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    color: var(--lcars-space-white);
    text-transform: uppercase;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .hazard-status-row {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-family: var(--lcars-font);
    font-size: 0.75rem;
    text-transform: uppercase;
  }

  .hazard-status-indicator {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .hazard-status-label {
    color: var(--lcars-gray);
    flex: 1;
  }

  .hazard-status-value {
    font-weight: 700;
    flex-shrink: 0;
  }

  /* ─── Battery Overview ─── */
  .hazard-batteries {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1rem;
  }

  .hazard-battery-chip {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    text-transform: uppercase;
  }

  .hazard-battery-bar {
    width: 2rem;
    height: 0.5rem;
    background: var(--lcars-gray);
    border-radius: 2px;
    overflow: hidden;
  }

  .hazard-battery-fill {
    height: 100%;
    border-radius: inherit;
    transition: width 1s ease;
  }

  .hazard-empty {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    color: var(--lcars-gray);
    text-transform: uppercase;
    text-align: center;
    padding: 2rem 1rem;
  }

  @media (max-width: 30rem) {
    .hazard-detectors {
      grid-template-columns: 1fr;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .hazard-detector-card {
      transition-duration: 0.01ms !important;
    }
  }
`,Be=new Set(["smoke","gas","carbon_monoxide","heat","safety"]);new Set(["battery"]),customElements.define("lcars-hazard-panel",class extends we{get panelType(){return"hazard"}get defaultPanelTitle(){return"HAZARD DETECTION"}get frameColor(){return this._getAllEntities().some(e=>{const t=e.state?.attributes?.device_class||"";return Be.has(t)&&"on"===e.state?.state})?"var(--lcars-tomato)":"var(--lcars-sunflower)"}static get styles(){return[...super.styles,r.AM,He]}_partitionEntities(){const e=this._getAllEntities(),t=this.hass?.devices||{},a=new Map,r=[];for(const i of e){const e=i.entity?.device_id;e?(a.has(e)||a.set(e,{device:t[e]||null,entries:[]}),a.get(e).entries.push(i)):r.push(i)}return{deviceMap:a,ungrouped:r}}renderBadge(){const t=this._getAllEntities().filter(e=>{const t=e.state?.attributes?.device_class||"";return Be.has(t)&&"on"===e.state?.state}).length;return t>0?e.qy`<lcars-summary-badge value="⚠ ${t} ALERT" color="var(--lcars-tomato)"></lcars-summary-badge>`:e.qy`<lcars-summary-badge value="ALL CLEAR" color="var(--lcars-sunflower)"></lcars-summary-badge>`}renderContent(){const{deviceMap:t,ungrouped:a}=this._partitionEntities();return 0===t.size&&0===a.length?e.qy`<div class="hazard-empty">NO HAZARD DETECTORS</div>`:e.qy`
      <div class="hazard-content">
        <div class="hazard-section-label">DETECTORS</div>
        <div class="hazard-detectors">
          ${Array.from(t.values()).map(e=>this._renderDetectorCard(e))}
        </div>
        ${this._renderBatteryOverview(t)}
      </div>
    `}_renderDetectorCard(t){const a=t.device?.name_by_user||t.device?.name||"Detector",r=t.entries.filter(e=>{const t=e.state?.attributes?.device_class||"";return Be.has(t)}),s=t.entries.find(e=>"occupancy"===e.state?.attributes?.device_class),n=r.some(e=>"on"===e.state?.state),o=t.entries[0]?.entity?.entity_id||"";return e.qy`
      <div class="hazard-detector-card"
           tabindex="0"
           role="group"
           aria-label="${a}"
           ?data-alert=${n}
           style="--detector-color: ${n?"var(--lcars-tomato)":"var(--lcars-sunflower)"}"
           @click=${()=>(0,i.Hv)(o)}
           @keydown=${e=>("Enter"===e.key||" "===e.key)&&(e.preventDefault(),(0,i.Hv)(o))}>
        <div class="hazard-detector-name">${a}</div>
        ${r.map(t=>{const a=t.state?.attributes?.device_class||"",r="on"===t.state?.state,i=a.replace(/_/g," ").toUpperCase(),s=r?"DETECTED":"CLEAR",n=r?"var(--lcars-tomato)":"var(--lcars-sunflower)";return e.qy`
            <div class="hazard-status-row">
              <span class="hazard-status-indicator" style="background:${n}"></span>
              <span class="hazard-status-label">${i}</span>
              <span class="hazard-status-value" style="color:${n}">${s}</span>
            </div>
          `})}
        ${s?e.qy`
          <div class="hazard-status-row">
            <span class="hazard-status-indicator" style="background:${"on"===s.state?.state?"var(--lcars-ice)":"var(--lcars-gray)"}"></span>
            <span class="hazard-status-label">OCCUPANCY</span>
            <span class="hazard-status-value">${"on"===s.state?.state?"DETECTED":"CLEAR"}</span>
          </div>
        `:""}
      </div>
    `}_renderBatteryOverview(t){const a=[];for(const e of t.values())for(const t of e.entries)"battery"===(t.state?.attributes?.device_class||"")&&"sensor"===t.domain&&a.push({name:e.device?.name_by_user||e.device?.name||"Detector",level:parseFloat(t.state?.state)||0,entity:t});return 0===a.length?e.qy``:e.qy`
      <div>
        <div class="hazard-section-label">BATTERY STATUS</div>
        <div class="hazard-batteries">
          ${a.map(t=>{const a=t.level>50?"var(--lcars-sunflower)":t.level>20?"var(--lcars-butterscotch)":"var(--lcars-tomato)";return e.qy`
              <div class="hazard-battery-chip" tabindex="0"
                   @click=${()=>(0,i.Hv)(t.entity.entity?.entity_id)}
                   @keydown=${e=>("Enter"===e.key||" "===e.key)&&(e.preventDefault(),(0,i.Hv)(t.entity.entity?.entity_id))}>
                <span style="color:var(--lcars-gray)">${t.name}:</span>
                <div class="hazard-battery-bar">
                  <div class="hazard-battery-fill" style="width:${t.level}%;background:${a}"></div>
                </div>
                <span style="color:${a}">${Math.round(t.level)}%</span>
              </div>
            `})}
        </div>
      </div>
    `}});const Ue=e.AH`

  .galley-content {
    display: flex;
    flex-direction: column;
    gap: var(--lcars-gap);
  }

  .galley-section-label {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-label, 0.75rem);
    color: var(--lcars-gray);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding-bottom: 0.15rem;
    border-bottom: 2px solid var(--lcars-gray);
    margin-bottom: 0.25rem;
  }

  /* ─── Appliance Cards ─── */
  .galley-appliances {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
    gap: var(--lcars-gap);
  }

  .galley-appliance-card {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.5rem 0.75rem;
    border-left: 3px solid var(--appliance-color, var(--lcars-butterscotch));
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    cursor: pointer;
    transition: background var(--lcars-transition);
  }
  .galley-appliance-card:hover { background: rgba(255,255,255,0.05); }
  .galley-appliance-card:focus-visible {
    outline: 2px solid var(--lcars-ice);
    outline-offset: 2px;
  }

  .galley-appliance-card[data-active] {
    border-left-color: var(--lcars-gold);
    background: rgba(255, 170, 0, 0.06);
  }

  .galley-appliance-name {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    color: var(--lcars-space-white);
    text-transform: uppercase;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .galley-status-row {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-family: var(--lcars-font);
    font-size: 0.75rem;
    text-transform: uppercase;
  }

  .galley-status-indicator {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .galley-status-label {
    color: var(--lcars-gray);
    flex: 1;
  }

  .galley-status-value {
    font-weight: 700;
    flex-shrink: 0;
  }

  .galley-timer {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-sub);
    color: var(--lcars-gold);
    font-weight: 700;
  }

  .galley-empty {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    color: var(--lcars-gray);
    text-transform: uppercase;
    text-align: center;
    padding: 2rem 1rem;
  }

  @media (max-width: 30rem) {
    .galley-appliances {
      grid-template-columns: 1fr;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .galley-appliance-card {
      transition-duration: 0.01ms !important;
    }
  }
`;new Set(["ge_home","smartthinq_sensors"]),new Set(["temperature","duration","enum"]),customElements.define("lcars-galley-panel",class extends we{get panelType(){return"galley"}get defaultPanelTitle(){return"GALLEY SYSTEMS"}get frameColor(){return"var(--lcars-butterscotch)"}static get styles(){return[...super.styles,r.AM,Ue]}_partitionEntities(){const e=this._getAllEntities(),t=this.hass?.devices||{},a=new Map;for(const r of e){const e=r.entity?.device_id;e&&(a.has(e)||a.set(e,{device:t[e]||null,entries:[]}),a.get(e).entries.push(r))}return{deviceMap:a}}renderBadge(){const t=this._getAllEntities().filter(e=>{const t=(e.state?.state||"").toLowerCase();return"running"===t||"cooking"===t||"preheat"===t||"on"===t||"drying"===t||"washing"===t}).length;return t>0?e.qy`<lcars-summary-badge value="${t} ACTIVE" color="var(--lcars-gold)"></lcars-summary-badge>`:e.qy`<lcars-summary-badge value="STANDBY" color="var(--lcars-gray)"></lcars-summary-badge>`}renderContent(){const{deviceMap:t}=this._partitionEntities();return 0===t.size?e.qy`<div class="galley-empty">NO GALLEY SYSTEMS</div>`:e.qy`
      <div class="galley-content">
        <div class="galley-section-label">APPLIANCES</div>
        <div class="galley-appliances">
          ${Array.from(t.values()).map(e=>this._renderApplianceCard(e))}
        </div>
      </div>
    `}_renderApplianceCard(t){const a=t.device?.name_by_user||t.device?.name||"Appliance",r=t.entries[0]?.entity?.entity_id||"",s=t.entries.filter(e=>"temperature"===e.state?.attributes?.device_class&&"diagnostic"!==e.entity_category),n=t.entries.filter(e=>"duration"===e.state?.attributes?.device_class),o=t.entries.filter(e=>{const t=e.entity?.entity_id||"";return/cook_mode|current_state|status/i.test(t)&&"diagnostic"!==e.entity_category}),l=t.entries.some(e=>{const t=(e.state?.state||"").toLowerCase();return"running"===t||"cooking"===t||"preheat"===t||"on"===t||"drying"===t||"washing"===t});return e.qy`
      <div class="galley-appliance-card"
           tabindex="0"
           role="group"
           aria-label="${a}"
           ?data-active=${l}
           @click=${()=>(0,i.Hv)(r)}
           @keydown=${e=>("Enter"===e.key||" "===e.key)&&(e.preventDefault(),(0,i.Hv)(r))}>
        <div class="galley-appliance-name">${a}</div>

        ${o.slice(0,2).map(t=>{const r=t.state?.attributes?.friendly_name?.replace(a,"").trim()||"Status",i=t.state?.state||"unknown",s=l?"var(--lcars-gold)":"var(--lcars-gray)";return e.qy`
            <div class="galley-status-row">
              <span class="galley-status-indicator" style="background:${s}"></span>
              <span class="galley-status-label">${r}</span>
              <span class="galley-status-value" style="color:${s}">${i}</span>
            </div>
          `})}

        ${s.slice(0,2).map(t=>{const r=t.state?.attributes?.friendly_name?.replace(a,"").trim()||"Temperature",i=t.state?.state||"--",s=t.state?.attributes?.unit_of_measurement||"";return e.qy`
            <div class="galley-status-row">
              <span class="galley-status-indicator" style="background:var(--lcars-butterscotch)"></span>
              <span class="galley-status-label">${r}</span>
              <span class="galley-status-value" style="color:var(--lcars-butterscotch)">${i}${s}</span>
            </div>
          `})}

        ${n.slice(0,1).map(t=>{const a=t.state?.state||"--";return e.qy`
            <div class="galley-timer" aria-label="Timer: ${a}">⏱ ${a}</div>
          `})}
      </div>
    `}});const Ve="Homepage",je=new Map([[s,(t,a,r,i)=>e.qy`<lcars-camera-panel .group=${t} .hass=${a} .editMode=${r} .config=${i}></lcars-camera-panel>`],[d,(t,a,r,i)=>e.qy`<lcars-environment-panel .group=${t} .hass=${a} .editMode=${r} .config=${i}></lcars-environment-panel>`],[m,(t,a,r,i)=>e.qy`<lcars-battery-panel .group=${t} .hass=${a} .editMode=${r} .config=${i}></lcars-battery-panel>`],[l,(t,a,r,i)=>e.qy`<lcars-climate-panel .group=${t} .hass=${a} .editMode=${r} .config=${i}></lcars-climate-panel>`],[n,(t,a,r,i)=>e.qy`<lcars-alarm-panel .group=${t} .hass=${a} .editMode=${r} .config=${i}></lcars-alarm-panel>`],[c,(t,a,r,i)=>e.qy`<lcars-media-panel .group=${t} .hass=${a} .editMode=${r} .config=${i}></lcars-media-panel>`],[o,(t,a,r,i)=>e.qy`<lcars-pool-spa-panel .group=${t} .hass=${a} .editMode=${r} .config=${i}></lcars-pool-spa-panel>`],[u,(t,a,r,i)=>e.qy`<lcars-weather-panel .group=${t} .hass=${a} .editMode=${r} .config=${i}></lcars-weather-panel>`],[v,(t,a,r,i)=>e.qy`<lcars-lifesupport-panel .group=${t} .hass=${a} .editMode=${r} .config=${i} area-id="${t.areaId||""}"></lcars-lifesupport-panel>`],[f,(t,a,r,i)=>e.qy`<lcars-illumination-panel .group=${t} .entities=${t.entities} .hass=${a} .editMode=${r} .config=${i} area-id="${t.areaId||""}"></lcars-illumination-panel>`],[g,(t,a,r,i)=>e.qy`<lcars-tactical-panel .group=${t} .entities=${t.entities} .hass=${a} .editMode=${r} .config=${i} area-id="${t.areaId||""}"></lcars-tactical-panel>`],[b,(t,a,r,i)=>e.qy`<lcars-viewport-panel .group=${t} .entities=${t.entities} .hass=${a} .editMode=${r} .config=${i} area-id="${t.areaId||""}"></lcars-viewport-panel>`],[y,(t,a,r,i)=>e.qy`<lcars-hazard-panel .group=${t} .entities=${t.entities} .hass=${a} .editMode=${r} .config=${i} area-id="${t.areaId||""}"></lcars-hazard-panel>`],[w,(t,a,r,i)=>e.qy`<lcars-galley-panel .group=${t} .entities=${t.entities} .hass=${a} .editMode=${r} .config=${i} area-id="${t.areaId||""}"></lcars-galley-panel>`]]);function Ge(e){const t=e?.attributes?.entity_picture;if(!t)return"";const a=e.last_updated||e.last_changed||"",r=t.includes("?")?"&":"?";return`${t}${r}_cb=${encodeURIComponent(a)}`}class Xe extends e.WF{static get properties(){return{data:{type:Object},selectedArea:{type:String},selectedFloor:{type:String},_hass:{type:Object},_editMode:{type:Boolean}}}constructor(){super(),this.data=null,this.selectedArea=null,this.selectedFloor=null,this._editMode=!1,this._configLoading=!1,this._entityCache=new Map,this._cameraRefreshInterval=null,this._cameraObserver=null,this._visibleCameras=new Set,this._loadingCameras=new Set,this._onAreaSelected=e=>{i.g0.debug(Ve,"Area selected event:",e.detail.areaId),this.selectedArea=e.detail.areaId,this.selectedFloor=null,this._entityCache.clear()},this._onFloorSelected=e=>{i.g0.debug(Ve,"Floor selected event:",e.detail.floorId),this.selectedFloor=e.detail.floorId,this.selectedArea=null,this._entityCache.clear()},this._onEditMode=e=>{this._editMode=e.detail.enabled,i.g0.debug(Ve,"Edit mode:",this._editMode)}}connectedCallback(){super.connectedCallback(),i.o6.addEventListener("lcars-area-selected",this._onAreaSelected),i.o6.addEventListener("lcars-floor-selected",this._onFloorSelected),i.o6.addEventListener("lcars-edit-mode",this._onEditMode),this._startCameraRefresh(),document.addEventListener("visibilitychange",this._onVisibilityChange)}disconnectedCallback(){super.disconnectedCallback(),i.o6.removeEventListener("lcars-area-selected",this._onAreaSelected),i.o6.removeEventListener("lcars-floor-selected",this._onFloorSelected),i.o6.removeEventListener("lcars-edit-mode",this._onEditMode),this._stopCameraRefresh(),document.removeEventListener("visibilitychange",this._onVisibilityChange)}_onVisibilityChange=()=>{document.hidden?this._stopCameraTimer():(this._startCameraTimer(),this._refreshVisibleCameras())};_startCameraRefresh(){this._cameraObserver=new IntersectionObserver(e=>{for(const t of e){const e=t.target.dataset.entity;e&&(t.isIntersecting?this._visibleCameras.add(e):this._visibleCameras.delete(e))}},{rootMargin:"50px"}),this._startCameraTimer()}_startCameraTimer(){this._cameraRefreshInterval||(this._cameraRefreshInterval=setInterval(()=>{this._refreshVisibleCameras()},1e4))}_stopCameraTimer(){this._cameraRefreshInterval&&(clearInterval(this._cameraRefreshInterval),this._cameraRefreshInterval=null)}_stopCameraRefresh(){this._stopCameraTimer(),this._cameraObserver&&(this._cameraObserver.disconnect(),this._cameraObserver=null),this._visibleCameras.clear(),this._loadingCameras.clear()}_refreshVisibleCameras(){if(document.hidden||!this._hass)return;const e=Date.now();for(const t of this._visibleCameras){if(this._loadingCameras.has(t))continue;const a=this._hass.states[t];if(!a||"unavailable"===a.state)continue;const r=a.attributes?.entity_picture;if(!r)continue;const i=this.shadowRoot?.querySelector(`img[data-entity="${CSS.escape(t)}"]`);if(!i)continue;const s=r.includes("?")?"&":"?",n=`${r}${s}_cb=${e}`;this._loadingCameras.add(t),i.addEventListener("load",()=>this._loadingCameras.delete(t),{once:!0}),i.addEventListener("error",()=>this._loadingCameras.delete(t),{once:!0}),i.src=n}}updated(e){if(super.updated(e),this._cameraObserver){const e=this.shadowRoot?.querySelectorAll("img[data-entity]")||[],t=new Set;for(const a of e)t.add(a.dataset.entity),this._cameraObserver.observe(a);for(const e of this._visibleCameras)t.has(e)||(this._visibleCameras.delete(e),this._loadingCameras.delete(e))}}setConfig(e){try{this._config=e,i.g0.debug(Ve,"setConfig:",e)}catch(e){throw i.g0.error(Ve,"setConfig FAILED — this causes CONFIGURATION ERROR:",e),e}}set hass(e){const t=this._hass;this._hass=e,t||i.g0.debug(Ve,"First hass received — areas:",Object.keys(e.areas||{}).length,"entities:",Object.keys(e.entities||{}).length),!t||t.entities===e.entities&&t.devices===e.devices||(i.g0.debug(Ve,"Entity/device registry changed — busting cache"),this._entityCache.clear()),t&&t.areas!==e.areas&&this.selectedArea&&(e.areas?.[this.selectedArea]||(this.selectedArea=null,this._entityCache.clear())),this.data||this._configLoading||this._loadConfiguration()}async _loadConfiguration(){if(this._hass){this._configLoading=!0,i.g0.debug(Ve,"Loading configuration via WS...");try{const e=await this._hass.callWS({type:"lcars_dashboard/configuration/get"});this.data=e,void 0!==e.debug&&(window.__LCARS_DEBUG=e.debug,e.debug&&i.g0.info(Ve,"Debug logging auto-enabled from HA backend")),i.g0.debug(Ve,"Configuration loaded:",Object.keys(e),"version:",e.installed_version)}catch(e){i.g0.error(Ve,"Failed to load configuration — WS call failed:",e),this.data={}}finally{this._configLoading=!1}}}_handleEntityClick(e){i.g0.debug(Ve,"Entity click:",e),(0,i.Hv)(e)}_handleEditEntity(e,t){if(e.stopPropagation(),e.preventDefault(),!this._hass)return;const a=this._getEntityState(t),r=a?.attributes?.friendly_name||t;(0,i.Bo)(this._hass,"lcars-edit-entity-card",{entity:t,icon:a?.attributes?.icon||"",name:r},`Edit: ${r}`)}_handleEditDevice(e,t){if(e.stopPropagation(),e.preventDefault(),!this._hass)return;const a=this._hass.devices?.[t],r=a?.name_by_user||a?.name||t;(0,i.Bo)(this._hass,"lcars-edit-device-button-card",{device:t,name:r,icon:""},`Edit: ${r}`)}_handleToggle(e){const t=e.split(".")[0];if(i.g0.debug(Ve,"Toggle:",e,"domain:",t),"lock"===t){const t=this._getEntityState(e);this._hass.callService("lock","locked"===t?.state?"unlock":"lock",{entity_id:e})}else"script"===t?this._hass.callService("script","turn_on",{entity_id:e}):this._hass.callService("homeassistant","toggle",{entity_id:e})}_getAreaEntities(e){return function(e,t,a=null){if(!e)return[];if(a&&a.has(t))return a.get(t);const r=Object.values(e.entities||{}),i=e.devices||{},s=new Set;for(const e of Object.values(i))e.area_id===t&&s.add(e.id);const n=r.filter(e=>!(e.hidden_by||e.hidden||e.disabled_by||e.entity_category||e.area_id!==t&&(e.area_id||!e.device_id||!s.has(e.device_id))));return a&&a.set(t,n),n}(this._hass,e,this._entityCache)}_getFloorAreaIds(e){return function(e,t){return e?.areas?Object.values(e.areas).filter(e=>e.floor_id===t).map(e=>e.area_id):[]}(this._hass,e)}_getDeviceCategoryEntities(e){if(!this._hass||!e)return{config:[],diagnostic:[]};const t=Object.values(this._hass.entities||{}),a=[],r=[];for(const i of t)i.device_id===e&&(i.disabled_by||"user"===i.hidden_by||i.hidden||("config"===i.entity_category?a.push(i):"diagnostic"===i.entity_category&&r.push(i)));return{config:a,diagnostic:r}}_groupEntities(e){return function(e,t){const a=e.devices||{},r=new Map,i=[];for(const s of t){const t=s.entity_id.split(".")[0],n=e.states?.[s.entity_id],o={entity:s,domain:t,state:n};n&&(s.device_id&&a[s.device_id]?(r.has(s.device_id)||r.set(s.device_id,{device:a[s.device_id],entities:[]}),r.get(s.device_id).entities.push(o)):i.push(o))}const s=(e,t)=>{const a=U[e.domain]??50,r=U[t.domain]??50;return a!==r?a-r:(e.state?.attributes?.friendly_name||"").localeCompare(t.state?.attributes?.friendly_name||"")};return r.forEach(e=>e.entities.sort(s)),i.sort(s),{byDevice:r,noDevice:i}}(this._hass,e)}_groupByDomain(e){const t=new Map;return e.forEach(e=>{t.has(e.domain)||t.set(e.domain,[]),t.get(e.domain).push(e)}),[...t.entries()].sort((e,t)=>(U[e[0]]??50)-(U[t[0]]??50))}_getEntityState(e){return this._hass&&this._hass.states[e]?this._hass.states[e]:null}_getEntityIcon(e){return e?e.attributes?.icon?e.attributes.icon:{light:"mdi:lightbulb",switch:"mdi:toggle-switch",sensor:"mdi:eye",binary_sensor:"mdi:radiobox-blank",climate:"mdi:thermostat",cover:"mdi:window-shutter",fan:"mdi:fan",lock:"mdi:lock",camera:"mdi:video",media_player:"mdi:cast",automation:"mdi:robot",script:"mdi:script-text",update:"mdi:package-up"}[e.entity_id.split(".")[0]]||"mdi:information-outline":"mdi:help-circle-outline"}_withEditPip(t,a){return this._editMode?e.qy`
        <div class="edit-pip-wrap">
          ${a}
          <div class="edit-pip" tabindex="0" role="button" aria-label="Edit entity"
            @click=${e=>this._handleEditEntity(e,t)}
            @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._handleEditEntity(e,t))}}></div>
        </div>
      `:a}_shortenName(e,t){if(!e)return e;const a=[],r=this._hass?.areas?.[this.selectedArea];if(r?.name&&a.push(r.name),t?.device_id){const e=this._hass?.devices?.[t.device_id],r=e?.name_by_user||e?.name;r&&a.push(r)}a.sort((e,t)=>t.length-e.length);let i=e,s=!0;for(;s;){s=!1;for(const e of a)i.toLowerCase().startsWith(e.toLowerCase())&&(i=i.slice(e.length).trim().replace(/^[-–:]\s*/,""),s=!0)}return i||e}_friendlyName(e,t){const a=e?.attributes?.friendly_name||t.entity_id.split(".").pop().replace(/_/g," ");return this._shortenName(a,t)}_shortDeviceName(e){const t=e?.name_by_user||e?.name||"";if(!t)return"Device";const a=this._hass?.areas?.[this.selectedArea];return a?.name&&t.toLowerCase().startsWith(a.name.toLowerCase())&&t.slice(a.name.length).trim().replace(/^[-–:]\s*/,"")||t}_isOff(e){return["off","unavailable","unknown","idle","standby","locked"].includes(e?.state)}_renderSensorBar(t){const a=parseFloat(t.state);if(isNaN(a))return"";const r=t.attributes?.device_class||"";let i=0,s=100;if("temperature"===r)i=10,s=40;else if("humidity"===r)i=0,s=100;else if("battery"===r)i=0,s=100;else if("illuminance"===r)i=0,s=1e3;else if("power"===r)i=0,s=3e3;else{if(null==t.attributes?.min)return"";i=t.attributes.min,s=t.attributes.max}if(i===s)return"";const n=Math.max(0,Math.min(100,(a-i)/(s-i)*100)),o=Math.round(n/100*10);return e.qy`
        <div class="sensor-bar" title="${Math.round(n)}%">
          ${Array.from({length:10},(t,a)=>e.qy`
            <div class="sensor-seg ${a<o?"filled":""}"
                 style="--seg-i:${a}"></div>
          `)}
        </div>
      `}static get styles(){return[r.Bx,oe,le,e.AH`
          :host { display: block; }

          /* ─── Content Area Header (Geordi: gold = active area) ─── */
          .content-area-panel {
            animation: lcars-cascade-in 300ms ease-out both;
            padding-left: 1rem;
          }
          .content-area-header {
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-title);
            font-weight: normal;
            margin: 0;
            color: var(--lcars-gold);
            text-transform: uppercase;
            padding: 0.25rem 0 0.5rem 0;
            border-left: 3px solid var(--lcars-gold);
            padding-left: 1rem;
          }
          .content-area-header::after {
            content: '';
            display: block;
            height: 2px;
            background: var(--lcars-data-accent);
            margin-top: 0.5rem;
          }

          /* ─── Floor View ─── */
          .content-floor-panel {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            padding-left: 1rem;
          }
          .content-floor-header {
            font-family: var(--lcars-font);
            font-size: calc(var(--lcars-font-size-title) * 1.15);
            font-weight: normal;
            margin: 0;
            color: var(--lcars-lilac, #cc55ff);
            text-transform: uppercase;
            padding: 0.25rem 0 0.5rem 0;
            border-left: 4px solid var(--lcars-lilac, #cc55ff);
            padding-left: 1rem;
          }
          .content-floor-header::after {
            content: '';
            display: block;
            height: 3px;
            background: var(--lcars-lilac, #cc55ff);
            margin-top: 0.5rem;
            opacity: 0.5;
          }
          .floor-area-section {
            padding-left: 0;
          }
          .floor-area-subheader {
            font-size: calc(var(--lcars-font-size-title) * 0.85);
            border-left-width: 2px;
          }

          /* ─── Divider ─── */
          .lcars-divider {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 0;
          }
          .lcars-divider-label {
            font-size: var(--lcars-font-size-sub);
            color: var(--lcars-text-heading);
            white-space: nowrap;
          }
          .lcars-divider-line {
            flex: 1;
            height: 2px;
            background: var(--lcars-data-accent);
          }

          /* ─── Device Group ─── */
          .device-group {
            margin-bottom: 0.75rem;
            position: relative;
            padding-left: 1rem;
            border-left: 3px solid var(--lcars-gold);
            border-image: linear-gradient(to bottom, var(--lcars-gold) 70%, transparent) 1;
          }
          .device-group::before {
            content: '';
            position: absolute;
            top: 0; left: -3px;
            width: 1rem;
            height: 1.5rem;
            border-top: 3px solid var(--lcars-gold);
            border-left: none;
            border-top-left-radius: 0;
          }
          .device-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.25rem 0;
            margin-bottom: 0.25rem;
          }
          .device-name {
            font-size: var(--lcars-font-size-data);
            font-weight: normal;
            margin: 0;
            color: var(--lcars-gold);
            text-transform: uppercase;
            white-space: nowrap;
          }
          .device-line {
            flex: 1;
            height: 1px;
            background: var(--lcars-gold);
            opacity: 0.4;
          }

          /* ─── Domain Sub-header ─── */
          .domain-label {
            font-size: 0.7rem;
            color: var(--lcars-african-violet);
            text-transform: uppercase;
            padding: 0.375rem 0 0.125rem 0.25rem;
            letter-spacing: 0.05em;
          }

          /* ─── Entity Grid (default) ─── */
          .entity-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
            gap: var(--lcars-gap);
            padding: 0.25rem 0;
          }

          /* ─── Generic Entity Button (fallback) ─── */
          .entity-btn {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            height: 2.5rem;
            padding: 0 0.75rem;
            background: var(--lcars-ice);
            color: var(--lcars-black);
            border: none;
            border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
            cursor: pointer;
            transition: filter var(--lcars-transition);
            white-space: nowrap;
            overflow: hidden;
            user-select: none;
          }
          .entity-btn:hover { filter: brightness(1.2); }
          .entity-btn:focus-visible {
            outline: 2px solid var(--lcars-ice);
            outline-offset: 2px;
          }
          .entity-btn:active { background: var(--lcars-btn-active); }
          .entity-btn ha-icon { --mdc-icon-size: 16px; flex-shrink: 0; }
          .entity-btn .entity-name { overflow: hidden; text-overflow: ellipsis; flex: 1; }
          .entity-btn .entity-state { font-size: 0.75rem; opacity: 0.7; flex-shrink: 0; }
          .entity-btn[data-off] { background: var(--lcars-gray); color: var(--lcars-space-white); }

          /* ═══════ TOGGLE PILL (light / switch / fan / lock) ═══════ */
          .toggle-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
            gap: var(--lcars-gap);
            padding: 0.25rem 0;
          }
          .toggle-pill {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            height: var(--lcars-btn-height);
            padding: 0 0.25rem 0 0.75rem;
            background: var(--lcars-gold);
            color: var(--lcars-black);
            border: none;
            border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
            cursor: pointer;
            transition: background var(--lcars-transition), filter var(--lcars-transition);
            overflow: hidden;
            user-select: none;
          }
          .toggle-pill:hover { filter: brightness(1.15); }
          .toggle-pill:focus-visible {
            outline: 2px solid var(--lcars-ice);
            outline-offset: 2px;
          }
          .toggle-pill ha-icon { --mdc-icon-size: 20px; flex-shrink: 0; }
          .toggle-pill .toggle-name { overflow: hidden; text-overflow: ellipsis; flex: 1; }
          .toggle-pill .toggle-state {
            font-size: 0.7rem;
            padding: 0.25rem 0.5rem;
            border-radius: var(--lcars-btn-radius);
            background: rgba(0,0,0,0.15);
            white-space: nowrap;
          }
          .toggle-pill .toggle-switch {
            width: 2.5rem;
            height: 1.5rem;
            border-radius: 0.75rem;
            background: var(--lcars-black);
            position: relative;
            flex-shrink: 0;
            transition: background var(--lcars-transition);
            border: 2px solid transparent;
          }
          .toggle-pill .toggle-switch::after {
            content: '';
            position: absolute;
            top: 2px; left: 2px;
            width: calc(1.5rem - 8px);
            height: calc(1.5rem - 8px);
            border-radius: 50%;
            background: var(--lcars-gray);
            transition: transform var(--lcars-transition), background var(--lcars-transition);
          }
          .toggle-pill[data-on] { background: var(--lcars-gold); }
          .toggle-pill[data-on] .toggle-switch { background: var(--lcars-black); }
          .toggle-pill[data-on] .toggle-switch::after {
            transform: translateX(1rem);
            background: var(--lcars-gold);
          }
          .toggle-pill[data-off] {
            background: var(--lcars-gray);
            color: var(--lcars-space-white);
          }
          .toggle-pill[data-off] .toggle-switch::after { background: var(--lcars-gray); }
          /* Light brightness bar */
          .toggle-pill .brightness-bar {
            width: 3rem;
            height: 0.375rem;
            background: rgba(0,0,0,0.3);
            border-radius: 0.2rem;
            overflow: hidden;
            flex-shrink: 0;
          }
          .toggle-pill .brightness-fill {
            height: 100%;
            background: var(--lcars-sunflower);
            border-radius: 0.2rem;
            transition: width var(--lcars-transition);
          }

          /* ═══════ SENSOR DATA READOUT ═══════ */
          .sensor-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
            gap: var(--lcars-gap);
            padding: 0.25rem 0;
          }
          .sensor-readout {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            height: 2.25rem;
            padding: 0 0.75rem;
            background: var(--lcars-ice);
            color: var(--lcars-black);
            border: none;
            border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
            cursor: pointer;
            overflow: hidden;
            transition: filter var(--lcars-transition);
          }
          .sensor-readout:hover { filter: brightness(1.1); }
          .sensor-readout:focus-visible {
            outline: 2px solid var(--lcars-ice);
            outline-offset: 2px;
          }
          .sensor-readout ha-icon { --mdc-icon-size: 14px; flex-shrink: 0; }
          .sensor-readout .sensor-name { overflow: hidden; text-overflow: ellipsis; flex: 1; font-size: 0.75rem; }
          .sensor-readout .sensor-value {
            font-size: var(--lcars-font-size-data);
            font-weight: 700;
            color: var(--lcars-black);
            flex-shrink: 0;
          }
          .sensor-readout .sensor-unit {
            font-size: 0.65rem;
            opacity: 0.6;
            flex-shrink: 0;
          }
          .sensor-readout[data-warn] { background: var(--lcars-tomato); color: var(--lcars-space-white); }
          .sensor-readout[data-warn] .sensor-value { color: var(--lcars-space-white); }
          .sensor-readout[data-off] { background: var(--lcars-gray); color: var(--lcars-space-white); }
          .sensor-readout[data-off] .sensor-value { color: var(--lcars-space-white); }

          /* ═══════ CAMERA FEED ═══════ */
          .camera-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
            gap: var(--lcars-gap);
            padding: 0.25rem 0;
          }
          .camera-frame {
            position: relative;
            border: 3px solid var(--lcars-butterscotch);
            border-radius: 0.75rem;
            overflow: hidden;
            background: var(--lcars-black);
            cursor: pointer;
            transition: border-color var(--lcars-transition);
          }
          .camera-frame:hover { border-color: var(--lcars-gold); }
          .camera-frame:focus-visible {
            outline: 2px solid var(--lcars-ice);
            outline-offset: 2px;
          }
          .camera-frame img {
            width: 100%;
            display: block;
            aspect-ratio: 16/9;
            object-fit: cover;
            background: var(--lcars-black);
            position: relative;
            z-index: 0;
          }
          .camera-label {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.375rem 0.75rem;
            background: linear-gradient(transparent, rgba(0,0,0,0.85));
            color: var(--lcars-sunflower);
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
            z-index: 3;
          }
          .camera-label ha-icon { --mdc-icon-size: 14px; }
          .camera-label .cam-state {
            margin-left: auto;
            font-size: 0.65rem;
            color: var(--lcars-space-white);
            opacity: 0.7;
          }

          /* ── Camera state overlays ── */
          .camera-connecting-overlay,
          .camera-offline-overlay {
            position: absolute;
            inset: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            background: var(--lcars-black);
            z-index: 2;
            transition: opacity 300ms ease-out, visibility 300ms ease-out;
          }
          .camera-connecting-text {
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            color: var(--lcars-ice);
            text-transform: uppercase;
            letter-spacing: 0.1em;
            animation: lcars-viewscreen-breathe 4s ease-in-out infinite;
          }
          @keyframes lcars-viewscreen-breathe {
            0%, 100% { opacity: 1; }
            50%      { opacity: 0.4; }
          }
          .camera-offline-overlay ha-icon {
            --mdc-icon-size: 32px;
            color: var(--lcars-tomato);
          }
          .camera-offline-text {
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            color: var(--lcars-tomato);
            text-transform: uppercase;
            letter-spacing: 0.1em;
          }

          /* State-driven visibility (D-4: opacity/visibility, not display:none) */
          .camera-frame[data-state="live"] .camera-connecting-overlay,
          .camera-frame[data-state="offline"] .camera-connecting-overlay {
            opacity: 0;
            visibility: hidden;
          }
          .camera-frame[data-state="connecting"] .camera-offline-overlay,
          .camera-frame[data-state="live"] .camera-offline-overlay {
            opacity: 0;
            visibility: hidden;
          }
          .camera-frame[data-state="offline"] {
            border-color: var(--lcars-tomato);
            opacity: 1;
          }
          .camera-frame[data-state="offline"]:hover { border-color: var(--lcars-gold); }
          /* Hide img during connecting so overlay text is visible */
          .camera-frame[data-state="connecting"] img { opacity: 0; }
          /* Hide img during offline so overlay is visible */
          .camera-frame[data-state="offline"] img { opacity: 0; }
          /* Spacer to maintain 16:9 when no img rendered */
          .camera-spacer { aspect-ratio: 16/9; }
          /* Camera frame inside device panel media fills container */
          .device-panel-media .camera-frame {
            border: none;
            border-radius: 0;
            width: 100%;
            height: 100%;
          }

          /* ═══════ DEVICE PANEL (reusable frame for camera / climate / media) ═══════ */
          .device-panels-section {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: var(--lcars-gap);
            margin-bottom: 0.75rem;
          }

          /* ─── Two-column split: entities+left-panels left, right-panels right ─── */
          .area-split-layout {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            align-items: start;
          }
          /* ─── Full-width illumination panel above columns ─── */
          .area-illumination-full {
            margin-bottom: 1rem;
          }
          .area-illumination-full lcars-illumination-panel {
            --panel-max-width: none;
          }
          .area-split-main {
            min-width: 0;
          }
          .area-split-panels {
            display: flex;
            flex-direction: column;
            gap: var(--lcars-gap);
            min-width: 0;
          }
          .area-split-panels .lcars-device-panel {
            max-width: none;
          }
          @media (max-width: 960px) {
            .area-split-layout {
              grid-template-columns: 1fr;
            }
          }
          .lcars-device-panel {
            --panel-frame-color: var(--lcars-butterscotch);
            --media-aspect: 16/9;
            display: grid;
            grid-template-columns: minmax(10rem, 14rem) minmax(18rem, 1fr);
            grid-template-rows: auto 1fr auto;
            grid-template-areas:
              "header  header"
              "sensors media"
              "controls controls";
            gap: var(--lcars-gap);
            width: 100%;
            max-width: 42rem;
            border-left: 4px solid var(--panel-frame-color);
            border-bottom: 4px solid var(--panel-frame-color);
            border-top: 2px solid var(--panel-frame-color);
            border-right: 2px solid var(--panel-frame-color);
            border-radius: 0.75rem 0.25rem 0.25rem 0.75rem;
            padding: var(--lcars-gap);
            background: var(--lcars-black);
            position: relative;
          }
          /* Corner bracket — top-left */
          .lcars-device-panel::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -4px;
            width: 1.5rem;
            height: 1.5rem;
            border-top: 4px solid var(--panel-frame-color);
            border-left: 4px solid var(--panel-frame-color);
            border-radius: 0.75rem 0 0 0;
            pointer-events: none;
          }
          /* Corner bracket — bottom-right */
          .lcars-device-panel::after {
            content: '';
            position: absolute;
            bottom: -4px;
            right: -2px;
            width: 1.5rem;
            height: 1.5rem;
            border-bottom: 4px solid var(--panel-frame-color);
            border-right: 2px solid var(--panel-frame-color);
            border-radius: 0 0 0.25rem 0;
            pointer-events: none;
          }

          /* Panel header */
          .device-panel-header {
            grid-area: header;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.25rem 0.5rem;
          }
          .device-panel-name {
            font-size: var(--lcars-font-size-sub);
            color: var(--panel-frame-color);
            text-transform: uppercase;
            white-space: nowrap;
          }
          .device-panel-header-line {
            flex: 1;
            height: 2px;
            background: var(--panel-frame-color);
            opacity: 0.5;
          }

          /* Sensor telemetry readouts — left column */
          .device-panel-sensors {
            grid-area: sensors;
            display: flex;
            flex-direction: column;
            gap: var(--lcars-gap);
            overflow-y: auto;
            max-height: 20rem;
            padding: 0.25rem;
          }
          .device-sensor-line {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.25rem 0.5rem;
            cursor: pointer;
            border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
            transition: background var(--lcars-transition);
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
          }
          .device-sensor-line:hover {
            background: rgba(255, 255, 255, 0.05);
          }
          .device-sensor-line:focus-visible {
            outline: 2px solid var(--lcars-ice);
            outline-offset: 2px;
          }
          .sensor-indicator {
            width: 0.5rem;
            height: 0.5rem;
            border-radius: 50%;
            flex-shrink: 0;
          }
          .sensor-label {
            flex: 1;
            color: var(--lcars-space-white);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: 0.75rem;
          }
          .sensor-state-value {
            flex-shrink: 0;
            font-weight: 700;
            font-size: var(--lcars-font-size-data);
          }

          /* Media viewscreen — right column */
          .device-panel-media {
            grid-area: media;
            position: relative;
            border: 3px solid var(--panel-frame-color);
            border-radius: 0.5rem;
            overflow: hidden;
            background: var(--lcars-black);
            aspect-ratio: var(--media-aspect);
          }
          .device-panel-media img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
          }
          .device-panel-media[data-offline] {
            border-color: var(--lcars-gray);
          }

          /* Control buttons — bottom row */
          .device-panel-controls {
            grid-area: controls;
            display: flex;
            flex-wrap: wrap;
            gap: var(--lcars-gap);
            padding: 0.25rem 0;
          }
          .device-control-btn {
            display: flex;
            align-items: center;
            gap: 0.375rem;
            height: 2.25rem;
            padding: 0 0.75rem;
            background: var(--lcars-sunflower);
            color: var(--lcars-black);
            border: none;
            border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
            cursor: pointer;
            transition: filter var(--lcars-transition), background var(--lcars-transition);
            white-space: nowrap;
          }
          .device-control-btn:hover { filter: brightness(1.15); }
          .device-control-btn:focus-visible {
            outline: 2px solid var(--lcars-ice);
            outline-offset: 2px;
          }
          .device-control-btn ha-icon { --mdc-icon-size: 16px; flex-shrink: 0; }
          .device-control-btn[data-on] { background: var(--lcars-gold); }
          .device-control-btn[data-off] { background: var(--lcars-gray); color: var(--lcars-space-white); }

          /* ═══════ BATTERY WARP CORE PANEL ═══════ */
          .battery-panel {
            --panel-frame-color: var(--lcars-ice);
            grid-template-columns: minmax(8rem, 1fr) minmax(5rem, 6rem) minmax(8rem, 1.2fr);
            grid-template-rows: auto 1fr auto;
            grid-template-areas:
              "header   header    header"
              "sensors  core      controls"
              "ioflow   ioflow    ioflow";
          }
          .battery-header {
            grid-area: header;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.25rem 0.5rem;
          }
          .battery-charge-label {
            font-size: var(--lcars-font-size-title);
            font-weight: 700;
            text-transform: uppercase;
            white-space: nowrap;
            flex-shrink: 0;
          }
          .battery-telemetry {
            grid-area: sensors;
            display: flex;
            flex-direction: column;
            gap: var(--lcars-gap);
            padding: 0.25rem;
            overflow-y: auto;
            max-height: 22rem;
          }
          .battery-total-line {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.25rem 0.5rem;
            cursor: pointer;
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
            border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
            transition: background var(--lcars-transition);
          }
          .battery-total-line:hover { background: rgba(255,255,255,0.05); }
          .battery-controls {
            grid-area: controls;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            padding: 0.25rem;
            overflow-y: auto;
            max-height: 22rem;
          }

          /* Warp Core */
          .warp-core-container {
            grid-area: core;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0.5rem 0;
            min-height: 10rem;
          }
          .warp-core {
            position: relative;
            width: 4rem;
            height: 100%;
            min-height: 10rem;
            border-radius: 2rem;
            border: 2px solid var(--core-color);
            background: var(--lcars-black);
            overflow: hidden;
            box-shadow: 0 0 calc(var(--core-charge, 0) * 0.2px) var(--core-color);
            transition: border-color 1s ease, box-shadow 1s ease;
          }
          .warp-core-fill {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: calc(var(--core-charge, 0) * 1%);
            background: var(--core-color);
            opacity: 0.8;
            transition: height 1s ease, background 1s ease;
          }
          .warp-core-fill.core-idle {
            animation: core-idle-pulse 3s ease-in-out infinite;
          }
          .warp-core-fill.core-charging {
            animation: core-charge-flow 2s linear infinite;
          }
          .warp-core-stream {
            position: absolute;
            left: 50%;
            top: 0;
            bottom: 0;
            width: 2px;
            transform: translateX(-50%);
            background: rgba(255,255,255,0.35);
          }
          .warp-core-tick {
            position: absolute;
            left: 10%;
            right: 10%;
            height: 1px;
            background: var(--core-color);
            opacity: 0.3;
            pointer-events: none;
          }
          @keyframes core-idle-pulse {
            0%, 100% { opacity: 0.8; }
            50% { opacity: 0.55; }
          }
          @keyframes core-charge-flow {
            0% { background-position-y: 0; }
            100% { background-position-y: -2rem; }
          }
          .warp-core-fill.core-charging {
            background-image: repeating-linear-gradient(
              0deg,
              transparent 0px,
              transparent 0.75rem,
              rgba(255,255,255,0.15) 0.75rem,
              rgba(255,255,255,0.15) 1rem
            );
            background-size: 100% 2rem;
          }

          /* Number slider controls */
          .battery-slider-control {
            display: flex;
            flex-direction: column;
            gap: 0.125rem;
            padding: 0.25rem 0.5rem;
          }
          .battery-slider-label {
            font-size: 0.65rem;
            color: var(--lcars-space-white);
            text-transform: uppercase;
          }
          .battery-slider-track {
            position: relative;
            height: 1.25rem;
            background: var(--lcars-gray);
            border-radius: 0.625rem;
            cursor: pointer;
            overflow: visible;
          }
          .battery-slider-fill {
            height: 100%;
            background: var(--lcars-ice);
            border-radius: 0.625rem 0 0 0.625rem;
            transition: width 0.3s ease;
          }
          .battery-slider-thumb {
            position: absolute;
            top: 50%;
            transform: translate(-50%, -50%);
            width: 1.25rem;
            height: 1.25rem;
            border-radius: 50%;
            background: var(--lcars-sunflower);
            border: 2px solid var(--lcars-black);
            pointer-events: none;
          }
          .battery-slider-value {
            font-size: 0.7rem;
            color: var(--lcars-data-accent, var(--lcars-ice));
            text-align: right;
            font-weight: 700;
          }

          /* Section dividers and labels */
          .battery-section-divider {
            height: 1px;
            background: var(--lcars-gray);
            opacity: 0.3;
            margin: 0.375rem 0;
          }
          .battery-section-label {
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-label, 0.75rem);
            color: var(--lcars-sky, #aaaaff);
            text-transform: uppercase;
            letter-spacing: 0.08em;
            padding: 0 0.5rem;
            margin-bottom: 0.125rem;
          }

          /* LCARS Option Strip (for select entities) */
          .lcars-option-strip {
            display: flex;
            flex-direction: column;
            gap: 0.125rem;
            padding: 0.125rem 0;
          }
          .lcars-option-strip-label {
            font-size: 0.65rem;
            color: var(--lcars-space-white, #f5f6fa);
            text-transform: uppercase;
            padding: 0 0.25rem;
            margin-bottom: 0.125rem;
          }
          .lcars-option-strip-btns {
            display: flex;
            flex-wrap: wrap;
            gap: 2px;
          }
          .lcars-option-btn {
            display: flex;
            align-items: center;
            height: 1.5rem;
            padding: 0 0.75rem;
            background: var(--lcars-gray);
            color: var(--lcars-space-white, #f5f6fa);
            border: none;
            border-radius: 0 0.75rem 0.75rem 0;
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-label, 0.75rem);
            text-transform: uppercase;
            cursor: pointer;
            transition: filter 0.2s, background 0.2s;
            user-select: none;
            white-space: nowrap;
          }
          .lcars-option-btn:hover {
            filter: brightness(1.2);
          }
          .lcars-option-btn:focus-visible {
            outline: 2px solid var(--lcars-ice);
            outline-offset: 2px;
          }
          .lcars-option-btn[data-selected] {
            background: var(--lcars-gold, var(--lcars-butterscotch));
            color: var(--lcars-black, #000);
          }

          /* ═══ Environment Panel ═══ */
          .env-panel {
            grid-template-areas:
              "header header header"
              "sensors core controls"
              "sparklines sparklines sparklines";
            grid-template-columns: 1fr auto 1fr;
            grid-template-rows: auto 1fr auto;
          }
          .env-panel.sensor-only {
            grid-template-areas:
              "header header"
              "sensors core"
              "sparklines sparklines";
            grid-template-columns: 1fr auto;
          }
          .env-header {
            grid-area: header;
            display: flex;
            align-items: center;
            gap: var(--lcars-gap);
            padding: 0.25rem 0.5rem;
          }
          .env-score-label {
            font-size: 1.25rem;
            font-weight: bold;
            white-space: nowrap;
          }
          .env-sensors {
            grid-area: sensors;
            display: flex;
            flex-direction: column;
            gap: 0.125rem;
            padding: 0.25rem 0.5rem;
            overflow-y: auto;
          }
          .env-controls {
            grid-area: controls;
            display: flex;
            flex-direction: column;
            gap: var(--lcars-gap);
            padding: 0.25rem 0.5rem;
            border-left: 2px solid var(--panel-frame-color);
          }
          .env-sparklines {
            grid-area: sparklines;
            display: flex;
            flex-wrap: wrap;
            gap: 0.375rem;
            padding: 0.25rem 0.5rem;
            border-top: 2px solid var(--panel-frame-color);
          }
          .env-sparkline-wrap {
            display: flex;
            align-items: center;
            gap: 0.25rem;
            min-width: 6rem;
            flex: 1 1 auto;
          }
          .env-sparkline-label {
            font-size: var(--lcars-font-size-label, 0.75rem);
            color: var(--lcars-space-white);
            text-transform: uppercase;
            white-space: nowrap;
            width: 3rem;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .env-sparkline {
            width: 100%;
            height: 1.5rem;
            display: block;
          }

          /* Atmoscrubber cylinder */
          .atmoscrubber-container {
            grid-area: core;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0.5rem 0;
            min-height: 10rem;
          }
          .atmoscrubber {
            position: relative;
            width: 4rem;
            height: 100%;
            min-height: 10rem;
            border-radius: 2rem;
            border: 2px solid hsl(var(--scrubber-hue, 120), 70%, 60%);
            background: var(--lcars-black);
            overflow: hidden;
            transition: border-color 1s ease, box-shadow 1s ease;
            box-shadow: 0 0 8px hsla(var(--scrubber-hue, 120), 70%, 50%, 0.3);
          }
          .atmoscrubber::before,
          .atmoscrubber::after {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: inherit;
            background-image:
              radial-gradient(circle 3px, hsla(var(--scrubber-hue, 120), 80%, 65%, 0.8) 50%, transparent 51%),
              radial-gradient(circle 2px, hsla(var(--scrubber-hue, 120), 80%, 65%, 0.8) 50%, transparent 51%),
              radial-gradient(circle 2.5px, hsla(var(--scrubber-hue, 120), 80%, 65%, 0.8) 50%, transparent 51%),
              radial-gradient(circle 2px, hsla(var(--scrubber-hue, 120), 80%, 65%, 0.8) 50%, transparent 51%);
            background-size: 100% 3rem;
            background-position:
              25% 0, 65% 33%, 40% 60%, 80% 85%;
            background-repeat: repeat-y;
            animation: scrubber-flow var(--scrubber-speed, 20s) linear infinite;
          }
          .atmoscrubber::after {
            opacity: 0.4;
            background-size: 100% 2.5rem;
            background-position:
              15% 10%, 55% 50%, 75% 75%;
            background-image:
              radial-gradient(circle 2px, hsla(var(--scrubber-hue, 120), 80%, 65%, 0.6) 50%, transparent 51%),
              radial-gradient(circle 1.5px, hsla(var(--scrubber-hue, 120), 80%, 65%, 0.6) 50%, transparent 51%),
              radial-gradient(circle 2px, hsla(var(--scrubber-hue, 120), 80%, 65%, 0.6) 50%, transparent 51%);
            animation-duration: calc(var(--scrubber-speed, 20s) * 1.4);
          }
          @keyframes scrubber-flow {
            from { background-position-y: 0; }
            to { background-position-y: -3rem; }
          }
          .atmoscrubber.scrubber-idle {
            opacity: 0.5;
            animation: scrubber-idle-glow 3s ease-in-out infinite;
          }
          .atmoscrubber.scrubber-idle::before,
          .atmoscrubber.scrubber-idle::after {
            opacity: 0.2;
          }
          @keyframes scrubber-idle-glow {
            0%, 100% { box-shadow: 0 0 4px hsla(var(--scrubber-hue, 120), 70%, 50%, 0.15); }
            50% { box-shadow: 0 0 12px hsla(var(--scrubber-hue, 120), 70%, 50%, 0.35); }
          }
          .scrubber-score {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.1rem;
            font-weight: bold;
            color: var(--lcars-space-white);
            z-index: 1;
            text-shadow: 0 0 4px rgba(0,0,0,0.8);
          }
          @media (prefers-reduced-motion: reduce) {
            .atmoscrubber::before,
            .atmoscrubber::after,
            .atmoscrubber.scrubber-idle {
              animation: none;
            }
          }

          /* Power I/O Flow */
          .battery-io-flow {
            grid-area: ioflow;
            display: flex;
            flex-direction: column;
            gap: var(--lcars-gap);
            padding: 0.25rem 0.5rem;
            border-top: 2px solid var(--panel-frame-color);
          }
          .io-pair-row {
            display: flex;
            align-items: center;
            gap: 0;
            min-height: 1.75rem;
          }
          .io-port {
            display: flex;
            flex-direction: column;
            align-items: center;
            min-width: 3.5rem;
            flex-shrink: 0;
          }
          .io-port.io-out { order: 5; }
          .io-label {
            font-size: 0.6rem;
            color: var(--lcars-space-white);
            text-transform: uppercase;
            white-space: nowrap;
          }
          .io-watts {
            font-size: var(--lcars-font-size-data);
            font-weight: 700;
          }
          .io-conduit {
            flex: 1;
            height: 3px;
            position: relative;
            overflow: hidden;
          }
          .io-conduit-in {
            order: 2;
            background: var(--lcars-ice);
            opacity: 0.4;
          }
          .io-conduit-out {
            order: 4;
            background: var(--lcars-butterscotch);
            opacity: 0.4;
          }
          .io-core-gap {
            order: 3;
            width: 1rem;
            flex-shrink: 0;
          }
          /* Flow particles */
          .io-conduit::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
          }
          .io-conduit-in:not(.flow-stopped)::before {
            background: repeating-linear-gradient(
              90deg,
              transparent 0px, transparent 6px,
              var(--lcars-ice) 6px, var(--lcars-ice) 10px
            );
            background-size: 16px 100%;
            animation: flow-in var(--flow-duration, 0.8s) linear infinite;
          }
          .io-conduit-out:not(.flow-stopped)::before {
            background: repeating-linear-gradient(
              270deg,
              transparent 0px, transparent 6px,
              var(--lcars-butterscotch) 6px, var(--lcars-butterscotch) 10px
            );
            background-size: 16px 100%;
            animation: flow-out var(--flow-duration, 0.8s) linear infinite;
          }
          .flow-fast { --flow-duration: 0.4s; opacity: 1; }
          .flow-medium { --flow-duration: 0.8s; opacity: 0.8; }
          .flow-slow { --flow-duration: 1.5s; opacity: 0.6; }
          .flow-stopped { opacity: 0.15; }
          .flow-stopped::before { display: none; }
          @keyframes flow-in {
            from { background-position-x: 0; }
            to { background-position-x: -16px; }
          }
          @keyframes flow-out {
            from { background-position-x: 0; }
            to { background-position-x: 16px; }
          }

          /* ═══════ CLIMATE PANEL ═══════ */
          .climate-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
            gap: var(--lcars-gap);
            padding: 0.25rem 0;
          }
          .climate-panel {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.5rem 0.75rem;
            background: var(--lcars-bluey);
            color: var(--lcars-black);
            border: none;
            border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
            font-family: var(--lcars-font);
            text-transform: uppercase;
            cursor: pointer;
            transition: filter var(--lcars-transition);
          }
          .climate-panel:hover { filter: brightness(1.1); }
          .climate-panel:focus-visible {
            outline: 2px solid var(--lcars-ice);
            outline-offset: 2px;
          }
          .climate-panel ha-icon { --mdc-icon-size: 24px; flex-shrink: 0; }
          .climate-panel .climate-info { flex: 1; display: flex; flex-direction: column; gap: 0.125rem; }
          .climate-panel .climate-name { font-size: var(--lcars-font-size-data); }
          .climate-panel .climate-temps { font-size: 0.75rem; display: flex; gap: 0.5rem; }
          .climate-panel .climate-current { font-weight: 700; font-size: 1.25rem; }
          .climate-panel .climate-target { opacity: 0.6; }
          .climate-panel .climate-mode {
            font-size: 0.65rem;
            padding: 0.125rem 0.5rem;
            background: rgba(0,0,0,0.15);
            border-radius: var(--lcars-btn-radius);
            flex-shrink: 0;
          }
          .climate-panel[data-heat] { background: var(--lcars-peach); }
          .climate-panel[data-cool] { background: var(--lcars-ice); }
          .climate-panel[data-off] { background: var(--lcars-gray); color: var(--lcars-space-white); }

          /* ═══════ COVER CONTROLS ═══════ */
          .cover-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
            gap: var(--lcars-gap);
            padding: 0.25rem 0;
          }
          .cover-panel {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            height: var(--lcars-btn-height);
            padding: 0 0.75rem;
            background: var(--lcars-almond-creme);
            color: var(--lcars-black);
            border: none;
            border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
            cursor: pointer;
            transition: filter var(--lcars-transition);
          }
          .cover-panel:hover { filter: brightness(1.1); }
          .cover-panel:focus-visible {
            outline: 2px solid var(--lcars-ice);
            outline-offset: 2px;
          }
          .cover-panel ha-icon { --mdc-icon-size: 18px; flex-shrink: 0; }
          .cover-panel .cover-name { overflow: hidden; text-overflow: ellipsis; flex: 1; }
          .cover-panel .cover-position { font-size: 0.75rem; opacity: 0.7; flex-shrink: 0; }
          .cover-panel[data-off] { background: var(--lcars-gray); color: var(--lcars-space-white); }

          /* ═══════ MEDIA PLAYER ═══════ */
          .media-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
            gap: var(--lcars-gap);
            padding: 0.25rem 0;
          }
          .media-strip {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            height: 3rem;
            padding: 0 0.75rem;
            background: var(--lcars-violet-creme);
            color: var(--lcars-black);
            border: none;
            border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
            cursor: pointer;
            transition: filter var(--lcars-transition);
            overflow: hidden;
          }
          .media-strip:hover { filter: brightness(1.1); }
          .media-strip:focus-visible {
            outline: 2px solid var(--lcars-ice);
            outline-offset: 2px;
          }
          .media-strip ha-icon { --mdc-icon-size: 20px; flex-shrink: 0; }
          .media-strip .media-info { flex: 1; overflow: hidden; }
          .media-strip .media-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          .media-strip .media-title { font-size: 0.7rem; opacity: 0.7; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          .media-strip .media-state { font-size: 0.65rem; opacity: 0.5; flex-shrink: 0; }
          .media-strip[data-off] { background: var(--lcars-gray); color: var(--lcars-space-white); }

          /* ─── No data ─── */
          .lcars-empty {
            color: var(--lcars-sky, #aaaaff);
            font-size: var(--lcars-font-size-sub);
            padding: 2rem 0;
            text-align: center;
          }

          /* ═══════ EDIT MODE — Edit Pips ═══════ */
          .edit-pip-wrap {
            position: relative;
          }
          .edit-pip {
            position: absolute;
            top: 4px;
            right: 8px;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: var(--lcars-lilac);
            cursor: pointer;
            z-index: 5;
            border: 1px solid rgba(0,0,0,0.3);
            animation: edit-pip-pulse 2s ease-in-out infinite;
          }
          .edit-pip:hover {
            transform: scale(1.5);
            background: var(--lcars-gold);
          }
          .edit-pip:focus-visible, .device-edit-pip:focus-visible {
            outline: 2px solid var(--lcars-ice);
            outline-offset: 2px;
            transform: scale(1.5);
          }
          @keyframes edit-pip-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          .device-edit-pip {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: var(--lcars-lilac);
            cursor: pointer;
            flex-shrink: 0;
            border: 1px solid rgba(0,0,0,0.3);
            animation: edit-pip-pulse 2s ease-in-out infinite;
          }
          .device-edit-pip:hover {
            transform: scale(1.5);
            background: var(--lcars-gold);
          }
          @media (prefers-reduced-motion: reduce) {
            .edit-pip, .device-edit-pip { animation: none; }
          }

          /* ═══════ ANIMATIONS (Wesley Crusher specials) ═══════ */

          /* ── 1. Staggered Cascade Reveal ── */
          @keyframes lcars-cascade-in {
            0% {
              opacity: 0;
              transform: translateX(-1.5rem);
              clip-path: inset(0 100% 0 0);
            }
            100% {
              opacity: 1;
              transform: translateX(0);
              clip-path: inset(0 0 0 0);
            }
          }
          .content-area-panel .toggle-pill,
          .content-area-panel .sensor-readout,
          .content-area-panel .climate-panel,
          .content-area-panel .cover-panel,
          .content-area-panel .media-strip,
          .content-area-panel .camera-frame,
          .content-area-panel .entity-btn,
          .content-area-panel .lcars-device-panel {
            animation: lcars-cascade-in 300ms ease-out both;
            animation-delay: calc(var(--i, 0) * 40ms);
          }

          /* ── 2. Sensor Scan Sweep ── */
          @keyframes lcars-scan-sweep {
            0%   { transform: translateX(-100%); }
            100% { transform: translateX(300%); }
          }
          .sensor-readout {
            position: relative;
          }
          .sensor-readout::after {
            content: '';
            position: absolute;
            top: 0; left: 0;
            width: 30%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
            animation: lcars-scan-sweep 3s ease-in-out infinite;
            pointer-events: none;
          }
          .sensor-readout:nth-child(2n)::after { animation-delay: 0.8s; }
          .sensor-readout:nth-child(3n)::after { animation-delay: 1.6s; }
          .sensor-readout:nth-child(5n)::after { animation-delay: 2.4s; }
          .sensor-readout[data-off]::after { animation: none; }

          /* ── 3. Camera Viewscreen Activation ── */
          @keyframes viewscreen-activate {
            0%   { clip-path: inset(50% 0 50% 0); filter: brightness(2) saturate(0); }
            40%  { clip-path: inset(10% 0 10% 0); filter: brightness(1.5) saturate(0.3); }
            100% { clip-path: inset(0 0 0 0); filter: brightness(1) saturate(1); }
          }
          .camera-frame[data-state="live"] img {
            animation: viewscreen-activate 600ms ease-out both;
          }
          .camera-frame[data-state="offline"] img {
            filter: saturate(0) brightness(0.3);
            animation: none;
          }
          @keyframes frame-pulse {
            0%, 100% { border-color: var(--lcars-butterscotch); }
            50%      { border-color: var(--lcars-gold); }
          }
          .camera-frame:active { animation: frame-pulse 400ms ease-out; }

          /* ── 4. Heartbeat Pulse for Active Entities ── */
          @keyframes lcars-heartbeat {
            0%, 100% { filter: brightness(1); }
            50%      { filter: brightness(1.1); }
          }
          .toggle-pill[data-on] { animation: lcars-heartbeat 3s ease-in-out infinite; }
          .climate-panel[data-heat],
          .climate-panel[data-cool] { animation: lcars-heartbeat 3s ease-in-out infinite; }
          .media-strip:not([data-off]) { animation: lcars-heartbeat 2s ease-in-out infinite; }

          /* Unavailable distress pulse */
          @keyframes lcars-distress {
            0%, 100% { opacity: 1; }
            50%      { opacity: 0.5; }
          }
          .sensor-readout[data-off],
          .toggle-pill[data-off] { animation: lcars-distress 4s ease-in-out infinite; }

          /* ── Device Panel Viewscreen Activation ── */
          .device-panel-media img {
            animation: viewscreen-activate 600ms ease-out both;
          }
          .device-panel-media[data-offline] img {
            filter: saturate(0) brightness(0.3);
            animation: none;
          }
          /* Unavailable panel pulsing border */
          @keyframes panel-distress {
            0%, 100% { border-color: var(--panel-frame-color); }
            50%      { border-color: var(--lcars-tomato); }
          }
          .lcars-device-panel:has(.device-panel-media[data-offline]) {
            animation: panel-distress 3s ease-in-out infinite;
          }

          /* ── 5. Segmented Sensor Bar ── */
          .sensor-bar {
            display: flex;
            gap: 2px;
            align-items: center;
            height: 0.625rem;
            flex-shrink: 0;
            margin-left: 0.25rem;
          }
          .sensor-seg {
            width: 3px;
            background: rgba(0,0,0,0.2);
            border-radius: 1px;
            transition: background var(--lcars-transition), height var(--lcars-transition);
            height: 40%;
          }
          .sensor-seg.filled {
            background: var(--lcars-black);
            height: calc(40% + var(--seg-i, 0) * 6%);
          }
          .sensor-readout[data-warn] .sensor-seg.filled { background: var(--lcars-space-white); }

          @media (prefers-reduced-motion: reduce) {
            .content-area-panel { animation: none; }
            .content-area-panel .toggle-pill,
            .content-area-panel .sensor-readout,
            .content-area-panel .climate-panel,
            .content-area-panel .cover-panel,
            .content-area-panel .media-strip,
            .content-area-panel .camera-frame,
            .content-area-panel .entity-btn,
            .content-area-panel .lcars-device-panel { animation: none; }
            .sensor-readout::after { animation: none; }
            .camera-frame img,
            .device-panel-media img { animation: none; }
            .camera-connecting-text { animation: none; }
            .toggle-pill[data-on],
            .climate-panel[data-heat],
            .climate-panel[data-cool],
            .media-strip:not([data-off]),
            .sensor-readout[data-off],
            .toggle-pill[data-off],
            .lcars-device-panel:has(.device-panel-media[data-offline]) { animation: none; }
            .alarm-triggered .alarm-shield,
            .alarm-triggered .alarm-viewscreen { animation: none; }
          }

          /* ═══════ CLIMATE PANEL ═══════ */
          .climate-panel {
            display: grid;
            grid-template-areas:
              "header   header"
              "sensors  media"
              "modes    modes"
              "auxctrl  auxctrl";
            grid-template-columns: minmax(10rem, 1fr) minmax(14rem, 2fr);
            grid-template-rows: auto 1fr auto auto;
            gap: var(--lcars-gap);
            border-left: 4px solid var(--panel-frame-color);
            border-bottom: 4px solid var(--panel-frame-color);
            border-top: 2px solid var(--panel-frame-color);
            border-right: 2px solid var(--panel-frame-color);
            transition: border-color 600ms;
          }
          .climate-header { grid-area: header; display: flex; align-items: center; gap: 0.5rem; }
          .climate-action-badge {
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
            letter-spacing: 0.1em;
          }
          .climate-sensors { grid-area: sensors; overflow-y: auto; }
          .climate-viewscreen {
            grid-area: media;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            position: relative;
            cursor: pointer;
            border: 2px solid var(--panel-frame-color);
            border-radius: 4px;
            padding: 0.5rem;
            transition: border-color 600ms;
          }
          .climate-viewscreen::before,
          .climate-viewscreen::after {
            content: '';
            position: absolute;
            width: 1.5rem;
            height: 1.5rem;
            border: 2px solid var(--panel-frame-color);
          }
          .climate-viewscreen::before { top: 4px; left: 4px; border-right: none; border-bottom: none; }
          .climate-viewscreen::after { bottom: 4px; right: 4px; border-left: none; border-top: none; }
          .climate-arc { width: 100%; max-width: 200px; }
          .climate-setpoint-controls { display: flex; flex-direction: column; gap: 0.25rem; margin-top: 0.5rem; }
          .climate-setpoint-row { display: flex; align-items: center; gap: 0.5rem; justify-content: center; }
          .climate-sp-btn {
            width: 2.5rem;
            height: 2.5rem;
            border: none;
            border-radius: 50%;
            background: var(--lcars-disabled);
            color: var(--lcars-space-white);
            font-size: 1.25rem;
            font-family: var(--lcars-font);
            cursor: pointer;
            transition: background 200ms;
          }
          .climate-sp-btn:hover { background: var(--panel-frame-color); }
          .climate-sp-btn:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
          .climate-sp-label {
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            min-width: 6rem;
            text-align: center;
          }
          .climate-modes {
            grid-area: modes;
            display: flex;
            gap: var(--lcars-gap);
            flex-wrap: wrap;
          }
          .climate-mode-btn {
            flex: 1;
            min-width: 4rem;
            height: var(--lcars-btn-height);
            border: none;
            border-radius: var(--lcars-btn-radius);
            background: var(--lcars-disabled);
            color: var(--lcars-black);
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
            cursor: pointer;
            transition: background 200ms;
          }
          .climate-mode-btn[data-active] { background: var(--panel-frame-color); }
          .climate-mode-btn:hover:not([data-active]) { background: var(--lcars-gray); }
          .climate-mode-btn:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
          .climate-aux-controls {
            grid-area: auxctrl;
            display: flex;
            flex-direction: column;
            gap: var(--lcars-gap);
          }
          .climate-aux-strip { display: flex; gap: var(--lcars-gap); flex-wrap: wrap; }

          /* ═══════ ALARM PANEL ═══════ */
          .alarm-panel {
            display: grid;
            grid-template-areas:
              "header  header"
              "sensors media"
              "keypad  keypad";
            grid-template-columns: minmax(10rem, 1fr) minmax(14rem, 2fr);
            grid-template-rows: auto 1fr auto;
            gap: var(--lcars-gap);
            border-left: 4px solid var(--panel-frame-color);
            border-bottom: 4px solid var(--panel-frame-color);
            border-top: 2px solid var(--panel-frame-color);
            border-right: 2px solid var(--panel-frame-color);
            transition: border-color 600ms;
          }
          .alarm-triggered {
            border-width: 6px;
            animation: alarm-pulse 1s ease-in-out infinite;
          }
          @keyframes alarm-pulse {
            0%, 100% { border-color: var(--lcars-tomato); }
            50% { border-color: transparent; }
          }
          .alarm-header { grid-area: header; display: flex; align-items: center; gap: 0.5rem; }
          .alarm-state-badge {
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
            letter-spacing: 0.1em;
          }
          .alarm-sensors { grid-area: sensors; overflow-y: auto; }
          .alarm-viewscreen {
            grid-area: media;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
          }
          .alarm-shield { width: 100%; max-width: 140px; }
          .alarm-countdown {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .alarm-countdown-num {
            font-family: var(--lcars-font);
            font-size: 3rem;
            font-weight: bold;
          }
          .alarm-countdown-label {
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            color: var(--lcars-data-accent);
          }
          .alarm-arm-strip {
            display: flex;
            gap: var(--lcars-gap);
            width: 100%;
          }
          .alarm-arm-btn {
            flex: 1;
            height: var(--lcars-btn-height);
            border: none;
            border-radius: var(--lcars-btn-radius);
            background: var(--lcars-disabled);
            color: var(--lcars-black);
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
            cursor: pointer;
            transition: background 200ms;
          }
          .alarm-arm-btn[data-active] { background: var(--panel-frame-color); }
          .alarm-arm-btn:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
          .alarm-keypad {
            grid-area: keypad;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem;
          }
          .alarm-keypad:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
          .alarm-code-display {
            display: flex;
            gap: 0.5rem;
          }
          .alarm-code-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            transition: background 200ms;
          }
          .alarm-pin-error { animation: alarm-shake 400ms ease-out; }
          @keyframes alarm-shake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-6px); }
            40% { transform: translateX(6px); }
            60% { transform: translateX(-4px); }
            80% { transform: translateX(4px); }
          }
          .alarm-digit-grid {
            display: grid;
            grid-template-columns: repeat(3, 3.5rem);
            gap: var(--lcars-gap);
          }
          .alarm-digit-btn {
            height: 3.5rem;
            border: none;
            border-radius: var(--lcars-btn-radius);
            background: var(--lcars-sunflower);
            color: var(--lcars-black);
            font-family: var(--lcars-font);
            font-size: 1.25rem;
            cursor: pointer;
            transition: background 200ms;
          }
          .alarm-digit-btn:hover { filter: brightness(1.1); }
          .alarm-digit-btn:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
          .alarm-action-btn { background: var(--lcars-disabled); }

          /* ═══════ MEDIA PANEL ═══════ */
          .media-panel {
            display: grid;
            grid-template-areas:
              "header   header"
              "metadata media"
              "volume   volume";
            grid-template-columns: minmax(8rem, 1fr) minmax(14rem, 2.5fr);
            grid-template-rows: auto 1fr auto;
            gap: var(--lcars-gap);
            border-left: 4px solid var(--panel-frame-color);
            border-bottom: 4px solid var(--panel-frame-color);
            border-top: 2px solid var(--panel-frame-color);
            border-right: 2px solid var(--panel-frame-color);
            transition: border-color 600ms;
          }
          .media-idle { opacity: 0.7; }
          .media-header { grid-area: header; display: flex; align-items: center; gap: 0.5rem; }
          .media-state-badge {
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
          }
          .media-metadata { grid-area: metadata; overflow-y: auto; }
          .media-viewscreen {
            grid-area: media;
            display: flex;
            flex-direction: column;
            border: 2px solid var(--panel-frame-color);
            border-radius: 4px;
            overflow: hidden;
            cursor: pointer;
            position: relative;
          }
          .media-viewscreen::before,
          .media-viewscreen::after {
            content: '';
            position: absolute;
            width: 1.5rem;
            height: 1.5rem;
            border: 2px solid var(--panel-frame-color);
            z-index: 1;
          }
          .media-viewscreen::before { top: 4px; left: 4px; border-right: none; border-bottom: none; }
          .media-viewscreen::after { bottom: 4px; right: 4px; border-left: none; border-top: none; }
          .media-art {
            width: 100%;
            aspect-ratio: 1/1;
            max-height: 18rem;
            object-fit: cover;
          }
          .media-idle-display {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            aspect-ratio: 1/1;
            max-height: 12rem;
            color: var(--lcars-gray);
          }
          .media-idle-glyph { font-size: 3rem; }
          .media-idle-label { font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); }
          .media-now-playing {
            padding: 0.5rem;
            background: rgba(0,0,0,0.5);
          }
          .media-title {
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-sub);
            color: var(--lcars-sunflower);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .media-artist {
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            color: var(--lcars-african-violet);
          }
          .media-controls {
            grid-area: volume;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            padding: 0.5rem;
          }
          .media-transport {
            display: flex;
            justify-content: center;
            gap: var(--lcars-gap);
          }
          .media-transport-btn {
            width: 2.5rem;
            height: 2.5rem;
            border: none;
            border-radius: 50%;
            background: var(--lcars-disabled);
            color: var(--lcars-space-white);
            font-size: 1rem;
            cursor: pointer;
            transition: background 200ms;
          }
          .media-transport-btn:hover { background: var(--lcars-gray); }
          .media-transport-btn:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
          .media-play-btn {
            width: 3.5rem;
            background: var(--lcars-african-violet);
            color: var(--lcars-black);
          }
          .media-transport-btn[aria-pressed="true"] { background: var(--lcars-african-violet); color: var(--lcars-black); }
          .media-volume {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          .media-mute-btn {
            border: none;
            background: transparent;
            font-size: 1.25rem;
            cursor: pointer;
          }
          .media-volume-bar {
            flex: 1;
            height: 0.75rem;
            background: var(--lcars-disabled);
            border-radius: var(--lcars-btn-radius);
            cursor: pointer;
            position: relative;
            overflow: hidden;
          }
          .media-volume-bar:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
          .media-volume-fill {
            height: 100%;
            background: var(--lcars-african-violet);
            border-radius: inherit;
            transition: width 200ms;
          }
          .media-volume-pct {
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            color: var(--lcars-data-accent);
            min-width: 3rem;
            text-align: right;
          }

          /* ═══════ POOL & SPA PANEL ═══════ */
          .pool-panel {
            display: grid;
            grid-template-areas:
              "header    header    header"
              "chemistry aquatics  controls"
              "lighting  lighting  lighting";
            grid-template-columns: minmax(8rem, 1fr) minmax(20rem, 3fr) minmax(8rem, 1.2fr);
            grid-template-rows: auto 1fr auto;
            gap: var(--lcars-gap);
            grid-column: 1 / -1;
            border-left: 4px solid var(--panel-frame-color);
            border-bottom: 4px solid var(--panel-frame-color);
            border-top: 2px solid var(--panel-frame-color);
            border-right: 2px solid var(--panel-frame-color);
          }
          .pool-no-chem {
            grid-template-areas:
              "header   header"
              "aquatics controls"
              "lighting lighting";
            grid-template-columns: minmax(20rem, 3fr) minmax(8rem, 1.2fr);
          }
          .pool-header { grid-area: header; display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
          .pool-temp-badge {
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            margin-left: 0.5rem;
          }
          .pool-chemistry { grid-area: chemistry; overflow-y: auto; }
          .pool-aquatics {
            grid-area: aquatics;
            display: flex;
            gap: var(--lcars-gap);
            justify-content: center;
          }
          .pool-body-frame {
            flex: 1;
            border: 2px solid var(--body-color);
            border-radius: 4px;
            padding: 0.5rem;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.25rem;
            position: relative;
          }
          .pool-body-frame::before,
          .pool-body-frame::after {
            content: '';
            position: absolute;
            width: 1.5rem;
            height: 1.5rem;
            border: 2px solid var(--body-color);
          }
          .pool-body-frame::before { top: 4px; left: 4px; border-right: none; border-bottom: none; }
          .pool-body-frame::after { bottom: 4px; right: 4px; border-left: none; border-top: none; }
          .pool-body-label {
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
            letter-spacing: 0.1em;
          }
          .pool-body-temp {
            font-family: var(--lcars-font);
            font-size: 2.5rem;
            font-weight: bold;
            color: var(--body-color);
          }
          .pool-setpoint-row { display: flex; align-items: center; gap: 0.5rem; }
          .pool-target {
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
          }
          .pool-controls { grid-area: controls; display: flex; flex-direction: column; gap: var(--lcars-gap); }
          .pool-lighting {
            grid-area: lighting;
            display: flex;
            gap: var(--lcars-gap);
            flex-wrap: wrap;
          }

          /* ═══════ WEATHER PANEL ═══════ */
          .weather-panel {
            display: grid;
            grid-template-areas:
              "header   header"
              "sensors  media"
              "forecast forecast";
            grid-template-columns: minmax(10rem, 1fr) minmax(14rem, 2fr);
            grid-template-rows: auto 1fr auto;
            gap: var(--lcars-gap);
            border-left: 4px solid var(--panel-frame-color);
            border-bottom: 4px solid var(--panel-frame-color);
            border-top: 2px solid var(--panel-frame-color);
            border-right: 2px solid var(--panel-frame-color);
            transition: border-color 600ms;
          }
          .weather-header { grid-area: header; display: flex; align-items: center; gap: 0.5rem; }
          .weather-condition-badge {
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
          }
          .weather-sensors { grid-area: sensors; overflow-y: auto; }
          .weather-viewscreen {
            grid-area: media;
            display: flex;
            flex-direction: column;
            align-items: center;
            border: 2px solid var(--panel-frame-color);
            border-radius: 4px;
            padding: 0.5rem;
            transition: border-color 600ms;
          }
          .weather-viewscreen::before,
          .weather-viewscreen::after {
            content: '';
            position: absolute;
            width: 1.5rem;
            height: 1.5rem;
            border: 2px solid var(--panel-frame-color);
          }
          .weather-viewscreen::before { top: 4px; left: 4px; border-right: none; border-bottom: none; }
          .weather-viewscreen::after { bottom: 4px; right: 4px; border-left: none; border-top: none; }
          .weather-display { width: 100%; max-width: 200px; }
          .weather-wind-compass {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.25rem;
          }
          .wind-svg { width: 5rem; height: 5rem; }
          .wind-reading {
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            color: var(--lcars-data-accent);
          }
          .weather-forecast {
            grid-area: forecast;
            display: flex;
            gap: var(--lcars-gap);
            overflow-x: auto;
            padding: 0.25rem 0;
          }
          .forecast-tile {
            flex: 1;
            min-width: 5rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.125rem;
            padding: 0.25rem;
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
          }
          .forecast-tile:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
          .forecast-day { color: var(--lcars-data-accent); }
          .forecast-glyph { font-size: 1.25rem; }
          .forecast-hi { color: var(--lcars-butterscotch); }
          .forecast-lo { color: var(--lcars-ice); }
          .forecast-range-bar {
            width: 100%;
            height: 4px;
            background: var(--lcars-disabled);
            border-radius: 2px;
            position: relative;
          }
          .forecast-range-fill {
            position: absolute;
            height: 100%;
            background: var(--lcars-butterscotch);
            border-radius: 2px;
          }
          .forecast-precip { color: var(--lcars-gray); font-size: 0.75rem; }

          /* ═══════ IRRIGATION PANEL ═══════ */
          .irrigation-panel {
            display: grid;
            grid-template-areas:
              "header   header"
              "schedule zones"
              "standby  standby";
            grid-template-columns: minmax(8rem, 1fr) minmax(16rem, 3fr);
            grid-template-rows: auto 1fr auto;
            gap: var(--lcars-gap);
            border-left: 4px solid var(--panel-frame-color);
            border-bottom: 4px solid var(--panel-frame-color);
            border-top: 2px solid var(--panel-frame-color);
            border-right: 2px solid var(--panel-frame-color);
          }
          .irrigation-header { grid-area: header; display: flex; align-items: center; gap: 0.5rem; }
          .irrigation-status-badge {
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
          }
          .irrigation-schedule { grid-area: schedule; overflow-y: auto; }
          .irrigation-zones {
            grid-area: zones;
            display: flex;
            flex-direction: column;
            gap: var(--lcars-gap);
            overflow-y: auto;
          }
          .irrigation-zone-row {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            position: relative;
          }
          .irrigation-zone-row:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
          .irrigation-zone-btn {
            min-width: 4.5rem;
            height: var(--lcars-btn-height);
            border: none;
            border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
            background: var(--lcars-sunflower);
            color: var(--lcars-black);
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
            cursor: pointer;
            transition: background 200ms;
          }
          .irrigation-zone-btn[data-on] { background: var(--lcars-ice); }
          .irrigation-zone-btn:disabled { opacity: 0.4; cursor: not-allowed; }
          .irrigation-zone-btn:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
          .irrigation-zone-name {
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            color: var(--lcars-space-white);
            flex: 1;
          }
          .irrigation-zone-status {
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
          }
          .irrigation-zone-fill {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 0.5rem;
            border-radius: 0.25rem;
            transition: width 1s linear;
          }
          .irrigation-standby {
            grid-area: standby;
            display: flex;
            justify-content: center;
            padding: 0.25rem;
          }
          .irrigation-standby-btn { min-width: 10rem; }

          /* ═══════ POWER PANEL (4X-3) ═══════ */
          .power-panel {
            --panel-frame-color: var(--lcars-butterscotch);
            display: grid;
            grid-template-areas:
              "header"
              "arc"
              "summary"
              "circuits"
              "devices"
              "strips";
            grid-template-columns: 1fr;
            grid-template-rows: auto auto auto auto auto auto;
            gap: var(--lcars-gap);
          }
          .power-panel[data-alert="critical"] {
            --panel-frame-color: var(--lcars-tomato);
            animation: lcars-distress-pulse var(--lcars-anim-pulse-urgent, 1s) ease-in-out infinite;
            --pulse-color-a: var(--lcars-tomato);
            --pulse-color-b: rgba(255, 85, 85, 0.3);
          }
          /* Header */
          .power-panel-header {
            grid-area: header;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.25rem 0.75rem;
            min-height: var(--lcars-bar-h);
          }
          .power-panel-header ha-icon {
            --mdc-icon-size: 20px;
            color: var(--panel-frame-color);
            flex-shrink: 0;
          }
          .power-panel-name {
            font-size: var(--lcars-font-size-sub);
            color: var(--lcars-text-heading);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .power-panel-header-line {
            flex: 1;
            height: 2px;
            background: var(--panel-frame-color);
          }
          .power-panel-badge {
            font-size: var(--lcars-font-size-data);
            color: var(--lcars-data-accent, var(--lcars-ice));
            text-transform: uppercase;
            white-space: nowrap;
          }
          /* SVG Arc */
          .power-arc-area { grid-area: arc; display: flex; justify-content: center; }
          .power-distribution-arc {
            width: 100%;
            max-width: 15rem;
            height: auto;
          }
          /* Summary */
          .power-summary {
            grid-area: summary;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr));
            gap: var(--lcars-gap);
          }
          .power-summary-card {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
            padding: 0.5rem 0.75rem;
            border-left: 3px solid var(--card-accent, var(--lcars-butterscotch));
            border-radius: 0 0.25rem 0.25rem 0;
            background: rgba(255, 255, 255, 0.03);
            min-width: 8rem;
          }
          .power-summary-label {
            font-size: var(--lcars-font-size-data);
            color: var(--lcars-ice);
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .power-summary-value {
            font-size: var(--lcars-font-size-title);
            font-weight: 700;
            text-transform: uppercase;
          }
          .power-summary-secondary {
            font-size: var(--lcars-font-size-data);
            color: var(--lcars-space-white);
            opacity: 0.8;
          }
          /* Section labels */
          .power-section-label {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.25rem 0;
            margin-top: 0.25rem;
          }
          .power-section-label-text {
            font-size: var(--lcars-font-size-sub);
            color: var(--lcars-text-heading);
            text-transform: uppercase;
            white-space: nowrap;
            flex-shrink: 0;
            text-wrap: balance;
          }
          .power-section-label-rule {
            flex: 1;
            height: 2px;
            background: var(--panel-frame-color);
            opacity: 0.5;
          }
          .power-section-label-count {
            font-size: var(--lcars-font-size-data);
            color: var(--lcars-ice);
            white-space: nowrap;
            flex-shrink: 0;
          }
          /* Circuit tile grid */
          .power-circuits {
            grid-area: circuits;
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
            gap: var(--lcars-gap);
            max-height: 24rem;
            overflow-y: auto;
            mask-image: linear-gradient(to bottom, black calc(100% - 2rem), transparent 100%);
            -webkit-mask-image: linear-gradient(to bottom, black calc(100% - 2rem), transparent 100%);
          }
          .power-circuit-tile {
            display: flex;
            flex-direction: column;
            gap: 0.125rem;
            padding: 0.375rem 0.5rem;
            background: rgba(255, 255, 255, 0.03);
            border-left: 3px solid var(--circuit-color, var(--lcars-ice));
            border-radius: 0 0.25rem 0.25rem 0;
            cursor: pointer;
            transition: background var(--lcars-transition);
            min-height: 3rem;
          }
          .power-circuit-tile:hover { background: rgba(255, 255, 255, 0.06); }
          .power-circuit-tile:focus-visible {
            outline: 2px solid var(--lcars-ice);
            outline-offset: 2px;
          }
          .power-circuit-name {
            display: flex;
            align-items: center;
            gap: 0.375rem;
            font-size: var(--lcars-font-size-data);
            color: var(--lcars-space-white);
            text-transform: uppercase;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .power-circuit-indicator {
            flex-shrink: 0;
            font-size: 0.625rem;
            color: var(--circuit-color, var(--lcars-ice));
          }
          .power-circuit-value-row {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          .power-circuit-watts {
            font-size: var(--lcars-font-size-data);
            font-weight: 700;
            color: var(--circuit-color, var(--lcars-ice));
            white-space: nowrap;
          }
          .power-circuit-energy {
            font-size: 0.75rem;
            color: var(--lcars-space-white);
            opacity: 0.6;
            text-transform: uppercase;
          }
          /* Device rows (switch + monitor) */
          .power-devices {
            grid-area: devices;
            display: flex;
            flex-direction: column;
            gap: var(--lcars-gap);
          }
          .power-device-row {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.25rem 0.5rem;
            border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
            transition: background var(--lcars-transition);
            cursor: pointer;
            min-height: 2.5rem;
          }
          .power-device-row:hover { background: rgba(255, 255, 255, 0.05); }
          .power-device-row:focus-visible {
            outline: 2px solid var(--lcars-ice);
            outline-offset: 2px;
          }
          /* ── LCARS sliding track toggle ── */
          .lcars-track-toggle {
            position: relative;
            display: inline-flex;
            align-items: center;
            width: 3.25rem;
            height: 1.5rem;
            border-radius: 0.75rem;
            border: none;
            cursor: pointer;
            background: var(--lcars-gray);
            padding: 0 0.25rem;
            flex-shrink: 0;
            transition: background var(--lcars-transition);
            overflow: hidden;
          }
          .lcars-track-toggle[data-on] {
            background: var(--lcars-gold);
          }
          .lcars-track-toggle .track-label {
            position: absolute;
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-label, 0.75rem);
            font-weight: 700;
            text-transform: uppercase;
            line-height: 1;
            pointer-events: none;
            transition: left var(--lcars-transition), right var(--lcars-transition), color var(--lcars-transition);
          }
          .lcars-track-toggle:not([data-on]) .track-label {
            right: 0.35rem;
            left: auto;
            color: var(--lcars-space-white);
          }
          .lcars-track-toggle[data-on] .track-label {
            left: 0.35rem;
            right: auto;
            color: var(--lcars-black);
          }
          .lcars-track-toggle .track-thumb {
            position: absolute;
            width: 1.1rem;
            height: 1.1rem;
            border-radius: 50%;
            background: var(--lcars-space-white);
            top: 0.2rem;
            transition: left var(--lcars-transition);
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
          }
          .lcars-track-toggle:not([data-on]) .track-thumb {
            left: 0.2rem;
          }
          .lcars-track-toggle[data-on] .track-thumb {
            left: calc(100% - 1.3rem);
          }
          .lcars-track-toggle:focus-visible {
            outline: 2px solid var(--lcars-ice);
            outline-offset: 2px;
          }
          .power-device-name {
            flex: 1;
            font-size: var(--lcars-font-size-data);
            color: var(--lcars-space-white);
            text-transform: uppercase;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .power-device-stats {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            flex-shrink: 0;
          }
          .power-device-watts {
            font-size: var(--lcars-font-size-data);
            font-weight: 700;
            color: var(--circuit-color, var(--lcars-ice));
            white-space: nowrap;
            min-width: 4rem;
            text-align: right;
          }
          .power-device-energy {
            font-size: var(--lcars-font-size-data);
            color: var(--lcars-space-white);
            opacity: 0.7;
            white-space: nowrap;
            min-width: 4rem;
            text-align: right;
          }
          /* Power strip blocks */
          .power-strips {
            grid-area: strips;
            display: flex;
            flex-direction: column;
            gap: calc(var(--lcars-gap) * 2);
          }
          .power-strip-block {
            border: 1px solid var(--lcars-butterscotch);
            border-left-width: 3px;
            border-radius: 0.5rem;
            padding: var(--lcars-gap);
          }
          .power-strip-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.25rem 0.5rem;
            margin-bottom: var(--lcars-gap);
          }
          .power-strip-name {
            font-size: var(--lcars-font-size-sub);
            color: var(--lcars-text-heading);
            text-transform: uppercase;
            text-wrap: balance;
            flex: 1;
          }
          .power-strip-master-toggle {
            /* Legacy — replaced by lcars-track-toggle */
            display: none;
          }
          .power-strip-master-toggle[data-on] {
            display: none;
          }
          .power-strip-total {
            font-size: var(--lcars-font-size-data);
            color: var(--lcars-butterscotch);
            font-weight: 700;
            white-space: nowrap;
          }
          .power-strip-divider {
            height: 1px;
            background: var(--panel-frame-color);
            opacity: 0.3;
            margin-bottom: var(--lcars-gap);
          }
          .power-strip-children {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
            gap: var(--lcars-gap);
          }
          .power-strip-child-tile {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
            padding: 0.375rem 0.5rem;
            border-left: 3px solid var(--tile-power-color, var(--lcars-gray));
            min-height: 3.5rem;
          }
          .strip-child-controls {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0.25rem;
          }
          .strip-child-toggle {
            /* Legacy — replaced by lcars-track-toggle */
            display: none;
          }
          .strip-child-toggle[data-on] {
            display: none;
          }
          /* Popover (singleton) */
          .power-detail-popover {
            margin: auto;
            padding: 0;
            border: none;
            background: transparent;
            overflow: visible;
            max-width: min(26rem, 90vw);
            min-width: 18rem;
            opacity: 0;
            transform: translateY(0.5rem) scale(0.98);
            transition:
              opacity var(--lcars-transition-slow, 300ms) ease-out,
              transform var(--lcars-transition-slow, 300ms) ease-out,
              overlay var(--lcars-transition-slow, 300ms) allow-discrete,
              display var(--lcars-transition-slow, 300ms) allow-discrete;
          }
          .power-detail-popover:popover-open {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          .power-detail-popover::backdrop {
            background: rgba(0, 0, 0, 0.5);
          }
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
          .popover-sparkline { padding: 0.5rem 0; }
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
          .popover-stat-label { color: var(--lcars-space-white); opacity: 0.7; }
          .popover-stat-value { color: var(--lcars-ice); font-weight: 700; }
          .popover-history-btn {
            width: 100%;
            margin-top: 0.5rem;
            display: flex;
            justify-content: center;
            background: var(--lcars-butterscotch);
            color: var(--lcars-black);
            border: none;
            border-radius: var(--lcars-btn-radius);
            padding: 0.375rem 0.75rem;
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
            cursor: pointer;
          }
          /* Scroll-driven tile animations */
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
                border-left-color: var(--circuit-color, var(--lcars-ice));
                transform: translateX(0);
              }
            }
          }
          @supports not (animation-timeline: view()) {
            .power-circuit-tile { opacity: 1; }
          }
          /* Responsive */
          @media (max-width: 1023px) {
            .power-circuits {
              grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));
            }
            .power-summary {
              grid-template-columns: repeat(auto-fit, minmax(7rem, 1fr));
            }
          }
          @media (max-width: 767px) {
            .power-circuits {
              grid-template-columns: 1fr 1fr;
              max-height: 16rem;
            }
            .power-summary {
              grid-template-columns: 1fr;
            }
            .power-device-row {
              flex-direction: column;
              align-items: stretch;
            }
          }
          @media (max-width: 479px) {
            .power-circuits {
              grid-template-columns: 1fr;
            }
          }

          /* ═══════════════════════════════════════════════════════════
             v4.13.0 — VISUAL ENHANCEMENTS (All Panels)
             Phase 1: Device Panel Base (cascades to all)
             ═══════════════════════════════════════════════════════════ */

          /* ── 1.1 Frame Breathing Pulse ── */
          .lcars-device-panel {
            animation: lcars-frame-breathe var(--lcars-anim-breathe) ease-in-out infinite;
          }

          /* ── 1.2 Data Pip Footer Strip ── */
          .lcars-device-panel .panel-pip-strip {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: var(--panel-frame-color);
            pointer-events: none;
            border-radius: 0 0 0.25rem 0.75rem;
          }

          /* ── 1.3 Header Numeric Code Watermark ── */
          .panel-numeric-code {
            position: absolute;
            right: var(--lcars-gap);
            top: 50%;
            transform: translateY(-50%);
            font-family: var(--lcars-font);
            font-size: 0.625rem;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            color: var(--lcars-gray);
            opacity: 0.4;
            pointer-events: none;
            user-select: none;
          }

          /* ── 1.4 Button Press Ripple Flash ── */
          .device-control-btn {
            position: relative;
            overflow: hidden;
          }
          .device-control-btn::after {
            content: '';
            position: absolute;
            top: 50%; left: 50%;
            width: 1rem; height: 1rem;
            margin: -0.5rem 0 0 -0.5rem;
            border-radius: 50%;
            background: var(--lcars-space-white);
            opacity: 0;
            pointer-events: none;
          }
          .device-control-btn:active::after {
            animation: lcars-button-flash var(--lcars-anim-flash) ease-out forwards;
          }

          /* ── 1.5 Viewscreen Power-On Scanline ── */
          .device-panel-media .scanline-overlay {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            pointer-events: none;
            overflow: hidden;
            z-index: 2;
          }
          .device-panel-media .scanline-overlay::before {
            content: '';
            position: absolute;
            top: -2px; left: 0; right: 0;
            height: 2px;
            background: linear-gradient(90deg, transparent, var(--lcars-space-white) 50%, transparent);
            opacity: 0;
            transform: translateY(-100%);
          }
          .device-panel-media.scanning .scanline-overlay::before {
            animation: lcars-scanline var(--lcars-anim-scan) ease-out forwards;
          }

          /* ═══════ Phase 3: CLIMATE v4.13.0 ═══════ */

          /* ── 3.1 Arc Gauge Segmented Stroke ── */
          .climate-arc-fill {
            stroke-dasharray: 6 2;
            stroke-linecap: butt;
            transition: stroke-dashoffset 800ms ease-in-out;
          }
          .climate-arc-flash {
            animation: lcars-setpoint-confirm var(--lcars-anim-confirm) ease-out forwards;
          }

          /* ── 3.2 HVAC Action Frame Pulse ── */
          .lcars-device-panel[data-hvac-action="heating"] {
            animation: lcars-hvac-pulse var(--lcars-anim-pulse) ease-in-out infinite;
            --pulse-color: var(--lcars-butterscotch);
          }
          .lcars-device-panel[data-hvac-action="cooling"] {
            animation: lcars-hvac-pulse var(--lcars-anim-pulse) ease-in-out infinite;
            --pulse-color: var(--lcars-ice);
          }
          @keyframes lcars-hvac-pulse {
            0%, 100% { border-color: var(--pulse-color); }
            50%      { border-color: var(--pulse-color); border-color: color-mix(in srgb, var(--pulse-color) 70%, black); }
          }

          /* ── 3.3 Setpoint Button Glow ── */
          .lcars-target-temp.confirm {
            animation: lcars-setpoint-confirm var(--lcars-anim-confirm) ease-out forwards;
          }

          /* ── 3.4 Mode Strip Active Indicator ── */
          .lcars-mode-strip {
            position: relative;
          }
          .lcars-mode-strip .mode-indicator {
            position: absolute;
            bottom: 0;
            height: 2px;
            background: var(--lcars-gold);
            transition: transform 300ms ease-out, width 300ms ease-out;
            transform: translateX(var(--indicator-x, 0));
            width: var(--indicator-w, 3rem);
          }

          /* ── 3.5 Ambient Temperature Data Pips ── */
          .climate-temp-pips {
            display: flex;
            gap: 2px;
            padding: 0.25rem 0;
          }
          .climate-temp-pips .pip {
            width: 4px;
            height: 4px;
            border-radius: 1px;
            opacity: 0;
            transition: opacity 500ms ease-out;
          }
          .climate-temp-pips .pip.visible {
            opacity: 1;
          }

          /* ═══════ Phase 4: MEDIA v4.13.0 ═══════ */

          /* ── 4.1 Audio Waveform (12 bars, scaleY — Data C-1/C-2) ── */
          .lcars-audio-waveform {
            display: flex;
            align-items: flex-end;
            justify-content: center;
            gap: 2px;
            height: 32px;
            overflow: hidden;
          }
          .lcars-audio-waveform .bar {
            width: 2px;
            border-radius: 1px 1px 0 0;
            background: var(--lcars-ice);
            height: 60%;
            transform-origin: bottom;
            transform: scaleY(var(--bar-min-ratio, 0.17));
            will-change: transform;
            animation: lcars-waveform var(--bar-dur, 400ms) ease-in-out alternate infinite;
            animation-delay: var(--bar-delay, 0ms);
          }
          .lcars-audio-waveform .bar.peak {
            background: var(--lcars-tomato);
          }
          .lcars-audio-waveform[data-paused] .bar {
            animation-play-state: paused;
            transform: scaleY(0.03);
            opacity: 0.3;
          }
          @keyframes lcars-waveform {
            0%   { transform: scaleY(var(--bar-min-ratio, 0.17)); }
            100% { transform: scaleY(1); }
          }

          /* ── 4.2 Album Art Viewscreen Glow ── */
          .media-viewscreen-glow {
            box-shadow: 0 0 12px 4px var(--lcars-african-violet);
            animation: lcars-media-glow 3s ease-in-out infinite;
          }
          @keyframes lcars-media-glow {
            0%, 100% { box-shadow: 0 0 6px 2px var(--lcars-african-violet); }
            50%      { box-shadow: 0 0 14px 6px var(--lcars-african-violet); }
          }

          /* ── 4.3 Transport Active State ── */
          .media-transport-btn.active {
            box-shadow: 0 0 6px 1px var(--lcars-african-violet);
          }
          .media-transport-btn.active::before {
            content: '';
            position: absolute;
            bottom: 2px; left: 50%;
            width: 4px; height: 4px;
            margin-left: -2px;
            border-radius: 50%;
            background: var(--lcars-african-violet);
          }

          /* ── 4.4 Progress Bar Luminous Head ── */
          .media-progress-fill::after {
            content: '';
            position: absolute;
            right: -2px; top: -1px;
            width: 4px; height: calc(100% + 2px);
            border-radius: 2px;
            background: var(--lcars-gold);
            box-shadow: 0 0 6px 2px var(--lcars-gold);
            animation: lcars-progress-glow var(--lcars-anim-pulse) ease-in-out infinite;
          }
          @keyframes lcars-progress-glow {
            0%, 100% { box-shadow: 0 0 4px 1px var(--lcars-gold); }
            50%      { box-shadow: 0 0 8px 3px var(--lcars-gold); }
          }

          /* ── 4.5 Idle Standby Pulse ── */
          .media-idle-glyph {
            font-size: 2rem;
            color: var(--lcars-african-violet);
            opacity: 0.4;
            animation: lcars-standby-pulse var(--lcars-anim-breathe) ease-in-out infinite;
          }
          @keyframes lcars-standby-pulse {
            0%, 100% { opacity: 0.3; }
            50%      { opacity: 0.6; }
          }

          /* ═══════ Phase 5: ALARM v4.13.0 ═══════ */

          /* ── 5.1 Red Alert Frame Strobe ── */
          .lcars-device-panel[data-state="triggered"] {
            animation: lcars-red-alert var(--lcars-anim-pulse-urgent) linear infinite;
            box-shadow: 0 0 20px var(--lcars-tomato);
          }
          @keyframes lcars-red-alert {
            0%, 100% { border-color: var(--lcars-tomato); box-shadow: 0 0 20px var(--lcars-tomato); }
            50%      { border-color: var(--lcars-tomato); border-color: color-mix(in srgb, var(--lcars-tomato) 40%, black); box-shadow: 0 0 8px var(--lcars-tomato); box-shadow: color-mix(in srgb, var(--lcars-tomato) 40%, black); }
          }

          /* ── 5.2 Shield Icon Reactive Glow ── */
          .alarm-shield-icon {
            transition: filter 500ms ease-out;
          }
          .alarm-shield-icon[data-glow="ice"] {
            filter: drop-shadow(0 0 8px var(--lcars-ice));
          }
          .alarm-shield-icon[data-glow="butterscotch"] {
            filter: drop-shadow(0 0 8px var(--lcars-butterscotch));
          }
          .alarm-shield-icon[data-glow="butterscotch-pulse"] {
            filter: drop-shadow(0 0 8px var(--lcars-butterscotch));
            animation: lcars-shield-armed 3s ease-in-out infinite;
          }
          .alarm-shield-icon[data-glow="tomato"] {
            filter: drop-shadow(0 0 12px var(--lcars-tomato));
            /* Worf M1: MUST NOT shorten below 0.34s (WCAG 2.3.1) */
            animation: lcars-shield-critical 0.5s linear infinite;
          }
          @keyframes lcars-shield-armed {
            0%, 100% { filter: drop-shadow(0 0 6px var(--lcars-butterscotch)); }
            50%      { filter: drop-shadow(0 0 12px var(--lcars-butterscotch)); }
          }
          @keyframes lcars-shield-critical {
            0%, 100% { filter: drop-shadow(0 0 12px var(--lcars-tomato)); }
            50%      { filter: drop-shadow(0 0 20px var(--lcars-tomato)); }
          }

          /* ── 5.3 Keypad Tactile Flash ── */
          .alarm-key {
            position: relative;
          }
          .alarm-key:active::before {
            content: attr(data-digit);
            position: absolute;
            top: -1rem;
            left: 50%;
            transform: translateX(-50%);
            font-size: 1.5rem;
            color: var(--lcars-space-white);
            opacity: 0;
            animation: lcars-key-preview 200ms ease-out forwards;
            pointer-events: none;
          }
          @keyframes lcars-key-preview {
            0%   { opacity: 0.8; transform: translateX(-50%) translateY(0); }
            100% { opacity: 0;   transform: translateX(-50%) translateY(-0.75rem); }
          }

          /* ── 5.4 Countdown Urgency Escalation ── */
          .alarm-countdown[data-urgency="calm"]     { color: var(--lcars-sunflower); }
          .alarm-countdown[data-urgency="elevated"] { color: var(--lcars-golden-orange); animation: lcars-urgency-blink var(--lcars-anim-pulse) ease-in-out infinite; }
          .alarm-countdown[data-urgency="high"]     { color: var(--lcars-tomato); animation: lcars-urgency-blink var(--lcars-anim-pulse-urgent) ease-in-out infinite; }
          .alarm-countdown[data-urgency="critical"] { color: var(--lcars-tomato); animation: lcars-urgency-critical 0.5s ease-in-out infinite; }
          @keyframes lcars-urgency-blink {
            0%, 100% { opacity: 1; }
            50%      { opacity: 0.5; }
          }
          @keyframes lcars-urgency-critical {
            0%, 100% { transform: scale(1); opacity: 1; }
            50%      { transform: scale(1.05); opacity: 0.7; }
          }

          /* ── 5.5 Zone Status Micro-Pips ── */
          .alarm-zone-pip {
            width: 6px; height: 6px;
            border-radius: 50%;
            flex-shrink: 0;
            transition: background 300ms ease-out;
          }
          .alarm-zone-pip.ok      { background: var(--lcars-ice); }
          .alarm-zone-pip.bypass  { background: var(--lcars-butterscotch); }
          .alarm-zone-pip.fault   { background: var(--lcars-tomato); }
          .alarm-zone-pip.flash {
            animation: lcars-pip-flash 300ms ease-out;
          }
          @keyframes lcars-pip-flash {
            0%   { transform: scale(1.5); background: var(--lcars-space-white); }
            100% { transform: scale(1); }
          }

          /* ═══════ Phase 6: WEATHER v4.13.0 ═══════ */

          /* ── 6.1 Weather Condition Feedback ── */
          .weather-viewscreen {
            position: relative;
            border-color: var(--weather-glow-color, var(--panel-frame-color));
            transition: border-color 1s ease-out;
          }

          /* ── 6.2 Wind Compass Needle ── */
          .wind-compass {
            position: relative;
            width: 3rem; height: 3rem;
          }
          .wind-needle {
            position: absolute;
            top: 50%; left: 50%;
            width: 2px; height: 40%;
            margin-left: -1px; margin-top: -40%;
            background: var(--lcars-ice);
            transform-origin: bottom center;
            transform: rotate(var(--wind-deg, 0deg));
            transition: transform 800ms ease-out;
            border-radius: 1px;
          }
          .wind-compass.gusty .wind-needle {
            animation: lcars-gust-oscillate 0.8s ease-in-out infinite alternate;
          }
          @keyframes lcars-gust-oscillate {
            0%   { transform: rotate(calc(var(--wind-deg, 0deg) - 5deg)); }
            100% { transform: rotate(calc(var(--wind-deg, 0deg) + 5deg)); }
          }

          /* ── 6.3 Forecast Range Bars ── */
          .forecast-range-bar {
            width: 3px;
            transform-origin: bottom;
            transform: scaleY(0);
            animation: lcars-bar-grow 400ms ease-out forwards;
            animation-delay: calc(var(--day-index, 0) * 60ms);
            border-radius: 1px;
          }
          @keyframes lcars-bar-grow {
            to { transform: scaleY(1); }
          }

          /* ── 6.4 Sun Arc ── */
          .sun-arc-track {
            stroke: var(--lcars-gray);
            stroke-width: 2;
            fill: none;
            opacity: 0.3;
          }
          .sun-arc-progress {
            stroke: var(--lcars-sunflower);
            stroke-width: 2;
            fill: none;
            transition: stroke-dashoffset 60s linear;
          }
          .sun-dot {
            fill: var(--lcars-gold);
            filter: drop-shadow(0 0 4px var(--lcars-gold));
            transition: cx 60s linear, cy 60s linear;
          }

          /* ── 6.5 Precip Pips ── */
          .precip-pips {
            display: grid;
            grid-template-columns: repeat(5, 4px);
            grid-template-rows: repeat(2, 4px);
            gap: 1px;
          }
          .precip-pips .pip {
            width: 4px; height: 4px;
            border-radius: 1px;
            background: var(--lcars-gray);
            opacity: 0.3;
          }
          .precip-pips .pip.filled {
            background: var(--lcars-ice);
            opacity: 1;
          }

          /* ═══════ Phase 7: POOL/SPA v4.13.0 ═══════ */

          /* ── 7.2 Heating Active Indicator ── */
          .pool-heat-bar {
            height: 3px;
            background: var(--lcars-gray);
            border-radius: 1px;
            overflow: hidden;
            position: relative;
          }
          .pool-heat-bar.heating {
            background: linear-gradient(90deg, var(--lcars-tomato), var(--lcars-golden-orange), var(--lcars-butterscotch));
            background-size: 200% 100%;
            animation: lcars-heat-flow var(--lcars-anim-pulse) linear infinite;
          }
          @keyframes lcars-heat-flow {
            0%   { background-position: 0% 0; }
            100% { background-position: 200% 0; }
          }

          /* ── 7.3 Chemistry Sensor Badges ── */
          .chem-badge {
            display: inline-flex;
            gap: 0.25rem;
            padding: 0.125rem 0.5rem;
            border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
            font-size: 0.7rem;
            text-transform: uppercase;
          }
          .chem-badge[data-threshold="ok"]   { background: var(--lcars-ice); color: var(--lcars-black); }
          .chem-badge[data-threshold="warn"] { background: var(--lcars-golden-orange); color: var(--lcars-black); }
          .chem-badge[data-threshold="critical"] {
            background: var(--lcars-tomato);
            color: var(--lcars-black);
            animation: lcars-chem-alert 1.5s ease-in-out infinite;
          }
          @keyframes lcars-chem-alert {
            0%, 100% { opacity: 1; }
            50%      { opacity: 0.6; }
          }

          /* ── 7.4 IntelliBrite Swatch Glow ── */
          .pool-swatch.active {
            box-shadow: 0 0 8px 2px var(--swatch-color, var(--lcars-ice));
            transition: box-shadow 200ms ease-out;
          }

          /* ── 7.5 Pump Spinner (primary only — Data R-6) ── */
          .lcars-pump-spinner {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 14px; height: 14px;
            position: relative;
          }
          .lcars-pump-spinner .dot {
            position: absolute;
            width: 4px; height: 4px;
            border-radius: 50%;
            background: var(--lcars-ice);
            opacity: 0.3;
          }
          .lcars-pump-spinner .dot:nth-child(1) { top: 0;    left: 5px;  }
          .lcars-pump-spinner .dot:nth-child(2) { bottom: 1px; left: 0;   }
          .lcars-pump-spinner .dot:nth-child(3) { bottom: 1px; right: 0;  }
          .lcars-pump-spinner.on {
            animation: lcars-pump-spin 1.2s linear infinite;
          }
          .lcars-pump-spinner.on .dot { opacity: 1; }
          .lcars-pump-spinner.on .dot:nth-child(2) { opacity: 0.6; }
          .lcars-pump-spinner.on .dot:nth-child(3) { opacity: 0.3; }
          @keyframes lcars-pump-spin {
            to { transform: rotate(360deg); }
          }

          /* ═══════ Phase 8: IRRIGATION v4.13.0 ═══════ */

          /* ── 8.1 Barberpole Flow ── */
          .zone-fill.active {
            background-image: repeating-linear-gradient(
              -45deg,
              var(--lcars-ice) 0 4px,
              rgba(153,204,255,0.3) 4px 8px
            );
            background-size: 11.31px 11.31px;
            animation: lcars-flow 0.6s linear infinite;
          }
          @keyframes lcars-flow {
            0%   { background-position: 0 0; }
            100% { background-position: 11.31px 0; }
          }

          /* ── 8.2 Zone Completion Flash ── */
          .zone-bar.completing {
            animation: lcars-zone-complete 2s ease-out forwards;
          }
          @keyframes lcars-zone-complete {
            0%   { border-left-color: var(--lcars-ice); background: rgba(153,204,255,0.15); }
            100% { border-left-color: var(--panel-frame-color); background: transparent; }
          }

          /* ── 8.3 Schedule Countdown Proximity Glow ── */
          .schedule-countdown {
            text-shadow: 0 0 calc(var(--schedule-proximity, 0) * 8px) var(--lcars-ice);
            transition: text-shadow 10s ease-out;
          }

          /* ── 8.4 Rain Delay Badge ── */
          .lcars-rain-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            padding: 0.125rem 0.5rem 0.125rem 0.375rem;
            border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
            background: var(--lcars-ice);
            color: var(--lcars-black);
            font-size: 0.7rem;
            text-transform: uppercase;
            animation: lcars-cloud-bob 3s ease-in-out infinite;
          }
          @keyframes lcars-cloud-bob {
            0%, 100% { transform: translateY(0); }
            50%      { transform: translateY(-1px); }
          }

          /* ═══════ Phase 9: ATMOSCRUBBER v4.13.0 ═══════ */

          /* ── 9.1 Particles (6 max, single merged keyframe — Data C-5/R-4) ── */
          .lcars-atmos-particle {
            position: absolute;
            border-radius: 50%;
            background: var(--atmos-quality-color, var(--lcars-ice));
            will-change: transform, opacity;
            width: var(--particle-size, 3px);
            height: var(--particle-size, 3px);
            animation: lcars-particle-float var(--particle-speed, 4s) linear infinite;
            animation-delay: var(--particle-delay, 0s);
          }
          @keyframes lcars-particle-float {
            from { transform: translateY(100%) translateX(calc(var(--particle-drift, 4px) * -1)); opacity: 0; }
            10%  { opacity: var(--particle-opacity, 0.5); }
            90%  { opacity: var(--particle-opacity, 0.5); }
            to   { transform: translateY(-100%) translateX(var(--particle-drift, 4px)); opacity: 0; }
          }

          /* ── 9.2 AQI Cylinder Glow ── */
          .atmos-cylinder {
            box-shadow: inset 0 0 12px 4px var(--atmos-quality-color, var(--lcars-ice));
            transition: box-shadow 1s ease-out;
          }
          .atmos-cylinder.warn {
            animation: lcars-aqi-warn var(--lcars-anim-pulse) ease-in-out infinite;
          }
          @keyframes lcars-aqi-warn {
            0%, 100% { box-shadow: inset 0 0 12px 4px var(--atmos-quality-color); }
            50%      { box-shadow: inset 0 0 20px 8px var(--atmos-quality-color); }
          }

          /* ── 9.3 Filter Life Segments ── */
          .filter-segments {
            display: flex;
            gap: 2px;
          }
          .filter-seg {
            flex: 1;
            height: 6px;
            border-radius: 1px;
            background: var(--lcars-gray);
            opacity: 0.3;
          }
          .filter-seg.lit { background: var(--lcars-ice); opacity: 1; }
          .filter-seg.warn { background: var(--lcars-golden-orange); opacity: 1; }
          .filter-seg.critical {
            background: var(--lcars-tomato);
            opacity: 1;
            animation: lcars-filter-critical var(--lcars-anim-pulse-urgent) ease-in-out infinite;
          }
          @keyframes lcars-filter-critical {
            0%, 100% { opacity: 1; }
            50%      { opacity: 0.4; }
          }

          /* ── 9.4 Sparkline Scan ── */
          .atmos-sparkline-path {
            stroke-dasharray: var(--sparkline-length, 200);
            stroke-dashoffset: var(--sparkline-length, 200);
            animation: lcars-sparkline-draw 1.5s ease-out forwards;
            animation-delay: calc(var(--sparkline-index, 0) * 200ms);
          }
          @keyframes lcars-sparkline-draw {
            to { stroke-dashoffset: 0; }
          }

          /* ── 9.5 Preset Mode Wipe ── */
          .atmos-preset-btn {
            position: relative;
            overflow: hidden;
          }
          .atmos-preset-btn::before {
            content: '';
            position: absolute;
            top: 0; left: 0; bottom: 0;
            width: 0;
            background: var(--lcars-african-violet);
            opacity: 0.3;
            transition: width 250ms ease-out;
          }
          .atmos-preset-btn.active::before {
            width: 100%;
          }

          /* ═══════ Phase 10: AIR PURIFIER v4.13.0 ═══════ */

          /* ── 10.1 Sensor Row Stagger ── */
          .purifier-sensor-row {
            animation: lcars-cascade-in 250ms ease-out both;
            animation-delay: calc(var(--sensor-index, 0) * 80ms);
          }

          /* ═══════ Phase 11: TEMP/HUMIDITY GRID v4.13.0 ═══════ */

          /* ── 11.1 Tile Comfort Glow (Worf R1: COMFORT_COLORS whitelist) ── */
          .env-tile.warm {
            box-shadow: 0 0 8px 2px rgba(255, 153, 102, 0.2);
            animation: lcars-warm-glow 3s ease-in-out infinite;
          }
          .env-tile.cool {
            box-shadow: 0 0 8px 2px rgba(136, 153, 255, 0.2);
            animation: lcars-cool-glow 3s ease-in-out infinite;
          }
          .env-tile.hot {
            box-shadow: 0 0 8px 2px rgba(255, 136, 102, 0.25);
            animation: lcars-warm-glow 3s ease-in-out infinite;
          }
          .env-tile.cold {
            box-shadow: 0 0 8px 2px rgba(85, 102, 255, 0.25);
            animation: lcars-cool-glow 3s ease-in-out infinite;
          }
          @keyframes lcars-warm-glow {
            0%, 100% { box-shadow: 0 0 6px 1px rgba(255,153,102,0.15); }
            50%      { box-shadow: 0 0 10px 3px rgba(255,153,102,0.25); }
          }
          @keyframes lcars-cool-glow {
            0%, 100% { box-shadow: 0 0 6px 1px rgba(136,153,255,0.15); }
            50%      { box-shadow: 0 0 10px 3px rgba(136,153,255,0.25); }
          }

          /* ── 11.2 Floor Label Scan-In ── */
          .env-floor-label {
            position: relative;
            overflow: hidden;
          }
          .env-floor-label::after {
            content: '';
            position: absolute;
            top: 0; left: 0; bottom: 0; right: 0;
            background: var(--lcars-black);
            transform-origin: right;
            transform: scaleX(1);
            animation: lcars-floor-scan 200ms ease-out forwards;
            animation-delay: calc(var(--floor-index, 0) * 200ms);
          }
          @keyframes lcars-floor-scan {
            to { transform: scaleX(0); }
          }

          /* ── 11.3 Sparkline Draw-On ── */
          .env-sparkline-path {
            stroke-dasharray: var(--sparkline-length, 200);
            stroke-dashoffset: var(--sparkline-length, 200);
            animation: lcars-sparkline-draw 1.2s ease-out forwards;
            animation-delay: calc(var(--tile-index, 0) * var(--lcars-anim-stagger));
          }

          /* ── 11.4 Summary Row Pulse ── */
          .sensors-summary-row {
            animation: lcars-summary-pulse var(--lcars-anim-breathe) ease-in-out infinite;
          }
          @keyframes lcars-summary-pulse {
            0%, 100% { border-color: var(--lcars-ice); box-shadow: none; }
            50%      { border-color: var(--lcars-ice); box-shadow: 0 0 4px 1px rgba(153,204,255,0.2); }
          }

          /* ── 11.5 Hot/Cold Alert Pulse ── */
          .env-tile.hot-alert {
            animation: lcars-hot-alert-pulse 1.5s ease-in-out infinite, lcars-warm-glow 3s ease-in-out infinite;
          }
          .env-tile.cold-alert {
            animation: lcars-cold-alert-pulse 2s ease-in-out infinite, lcars-cool-glow 3s ease-in-out infinite;
          }
          @keyframes lcars-hot-alert-pulse {
            0%, 100% { border-color: var(--lcars-peach); }
            50%      { border-color: var(--lcars-tomato); }
          }
          @keyframes lcars-cold-alert-pulse {
            0%, 100% { border-color: var(--lcars-bluey); }
            50%      { border-color: var(--lcars-blue); }
          }

          /* ── 11.6 Value Change Ripple ── */
          .env-tile.value-changed {
            animation: lcars-value-ripple 300ms ease-out;
          }
          @keyframes lcars-value-ripple {
            0%   { box-shadow: inset 4px 0 0 0 transparent; }
            50%  { box-shadow: inset 4px 0 0 0 var(--tile-new-comfort-color, var(--lcars-ice)); }
            100% { box-shadow: inset 4px 0 0 0 transparent; }
          }

          /* ═══════ Phase 2: BATTERY v4.13.0 ═══════ */

          /* ── 2.1 Sensor Pill Badges ── */
          .battery-pill-badge {
            display: inline-flex;
            overflow: hidden;
            border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
            font-size: 0.75rem;
            text-transform: uppercase;
          }
          .battery-pill-badge .pill-label {
            padding: 0.125rem 0.375rem;
            background: var(--panel-frame-color);
            color: var(--lcars-black);
          }
          .battery-pill-badge .pill-value {
            padding: 0.125rem 0.5rem;
            background: rgba(255,255,255,0.08);
            color: var(--lcars-space-white);
            font-weight: 700;
          }
          .battery-pill-badge .pill-value.updated {
            animation: lcars-value-flash 300ms ease-out;
          }

          /* ── 2.3 Charge State Glow ── */
          .battery-charge-glow {
            transition: box-shadow 500ms ease-out;
          }
          .battery-charge-glow[data-level="high"]    { box-shadow: 0 0 8px 2px rgba(153,204,255,0.3); }
          .battery-charge-glow[data-level="medium"]  { box-shadow: 0 0 6px 2px rgba(255,153,0,0.25); }
          .battery-charge-glow[data-level="low"]     { box-shadow: 0 0 8px 2px rgba(255,85,85,0.3); }

          /* ═══════ v4.16.0 CONSOLIDATED POWER PANEL (4X-6) ═══════ */

          /* G-1: Transition separator */
          .device-group + .lcars-consolidated-power-panel {
            margin-top: calc(var(--lcars-gap, 12px) * 2);
            border-top: 2px solid var(--lcars-gray-blue, #7799bb);
            padding-top: var(--lcars-gap, 12px);
          }

          /* Panel frame — G-2: asymmetric border-radius + corner brackets */
          .lcars-consolidated-power-panel {
            display: flex;
            flex-direction: column;
            gap: var(--lcars-gap, 12px);
            padding: var(--lcars-gap, 12px);
            border-left: 4px solid var(--lcars-butterscotch, #ffcc99);
            border-top: 2px solid var(--lcars-butterscotch, #ffcc99);
            border-right: 2px solid var(--lcars-butterscotch, #ffcc99);
            border-bottom: 4px solid var(--lcars-butterscotch, #ffcc99);
            border-radius: 0.75rem 0.25rem 0.25rem 0.75rem;
            background: rgba(0, 0, 0, 0.35);
            position: relative;
            transition: border-color 400ms ease;
          }
          .lcars-consolidated-power-panel::before {
            content: '';
            position: absolute;
            top: -2px; left: -4px;
            width: 1.5rem; height: 1.5rem;
            border-top: 3px solid var(--lcars-butterscotch, #ffcc99);
            border-left: 3px solid var(--lcars-butterscotch, #ffcc99);
            border-radius: 0.75rem 0 0 0;
            pointer-events: none;
          }
          .lcars-consolidated-power-panel::after {
            content: '';
            position: absolute;
            bottom: -4px; right: -2px;
            width: 1.5rem; height: 1.5rem;
            border-bottom: 3px solid var(--lcars-butterscotch, #ffcc99);
            border-right: 3px solid var(--lcars-butterscotch, #ffcc99);
            border-radius: 0 0 0.25rem 0;
            pointer-events: none;
          }
          .lcars-consolidated-power-panel[data-alert="critical"] {
            border-color: var(--lcars-tomato, #ff5555);
            animation: power-critical-pulse 2s ease-in-out infinite;
          }

          /* Header */
          .consolidated-power-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-family: var(--lcars-font, 'Antonio', sans-serif);
            font-size: 1.1rem;
            text-transform: uppercase;
            color: var(--lcars-butterscotch, #ffcc99);
            letter-spacing: 0.05em;
          }
          .consolidated-power-header ha-icon {
            --mdc-icon-size: 20px;
            color: var(--lcars-butterscotch, #ffcc99);
          }
          .consolidated-power-header .power-panel-header-line {
            flex: 1;
            height: 2px;
            background: var(--lcars-butterscotch, #ffcc99);
            opacity: 0.3;
          }
          .consolidated-power-header .power-panel-badge {
            font-size: 0.7rem;
            opacity: 0.7;
            white-space: nowrap;
          }

          /* G-6: Section accent bars */
          .lcars-consolidated-power-panel .power-circuits-section {
            border-left: 3px solid var(--lcars-butterscotch, #ffcc99);
            padding-left: var(--lcars-gap, 12px);
          }
          .lcars-consolidated-power-panel .power-devices-section {
            border-left: 3px solid var(--lcars-ice, #99ccff);
            padding-left: var(--lcars-gap, 12px);
          }
          .lcars-consolidated-power-panel .power-strips-section {
            border-left: 3px solid var(--lcars-african-violet, #cc99ff);
            padding-left: var(--lcars-gap, 12px);
          }

          /* G-3: Tile minimum height */
          .lcars-consolidated-power-panel .power-circuit-tile {
            min-height: 3rem;
          }

          /* G-5: Focus-visible on circuit tiles */
          .lcars-consolidated-power-panel .power-circuit-tile:focus-visible {
            outline: 2px solid var(--lcars-sunflower, #ffcc99);
            outline-offset: -2px;
          }

          /* Wider circuit grid for left column */
          .lcars-consolidated-power-panel .power-circuits {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));
            gap: 0.5rem;
            max-height: 24rem;
            overflow-y: auto;
          }

          /* Clickable value styling */
          .power-clickable-value {
            cursor: pointer;
            display: inline;
          }
          .power-clickable-value:hover,
          .power-clickable-value:focus-visible {
            text-decoration: underline;
            text-decoration-style: dashed;
            text-underline-offset: 2px;
          }
          .power-clickable-value:focus-visible {
            outline: 2px solid var(--lcars-sunflower, #ffcc99);
            outline-offset: 1px;
            border-radius: 2px;
          }

          /* Truncation pill — G-7 */
          .power-show-all-pill {
            display: block;
            margin: 0.5rem auto 0;
            padding: 0.25rem 1rem;
            border: 1px solid var(--lcars-gray, #666688);
            border-radius: 0 1.5rem 1.5rem 0;
            background: rgba(153, 153, 153, 0.15);
            color: var(--lcars-gray, #666688);
            font-family: var(--lcars-font, 'Antonio', sans-serif);
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            cursor: pointer;
            transition: background 200ms ease, color 200ms ease;
          }
          .power-show-all-pill:hover,
          .power-show-all-pill:focus-visible {
            background: var(--lcars-gray, #666688);
            color: var(--lcars-black, #000000);
          }
          .power-show-all-pill:focus-visible {
            outline: 2px solid var(--lcars-sunflower, #ffcc99);
            outline-offset: 2px;
          }

          /* Responsive breakpoints */
          @media (max-width: 1023px) {
            .lcars-consolidated-power-panel .power-circuits {
              grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));
            }
          }
          @media (max-width: 767px) {
            .lcars-consolidated-power-panel .power-circuits {
              grid-template-columns: 1fr 1fr;
            }
          }
          @media (max-width: 479px) {
            .lcars-consolidated-power-panel .power-circuits {
              grid-template-columns: 1fr;
            }
          }

          /* ═══════ v4.13.0 REDUCED MOTION OVERRIDES ═══════ */
          @media (prefers-reduced-motion: reduce) {
            .lcars-device-panel { animation: none; }
            .lcars-device-panel[data-hvac-action="heating"],
            .lcars-device-panel[data-hvac-action="cooling"] {
              animation: none;
              border-color: var(--pulse-color);
            }
            .lcars-audio-waveform .bar { animation: none !important; transform: scaleY(0.17); }
            .lcars-device-panel[data-state="triggered"] {
              animation: none;
              border-color: var(--lcars-tomato);
              border-width: 6px 3px 6px 6px;
              box-shadow: none;
            }
            .alarm-shield-icon[data-glow="butterscotch-pulse"],
            .alarm-shield-icon[data-glow="tomato"] { animation: none; }
            .alarm-countdown[data-urgency="elevated"],
            .alarm-countdown[data-urgency="high"],
            .alarm-countdown[data-urgency="critical"] { animation: none; }
            .weather-viewscreen.storm::before { animation: none; opacity: 0.18; }
            .wind-compass.gusty .wind-needle { animation: none; }
            .pool-viewscreen::after { animation: none; opacity: 0.04; }
            .pool-heat-bar.heating { animation: none; }
            .lcars-pump-spinner.on { animation: none; }
            .chem-badge[data-threshold="critical"] { animation: none; }
            .zone-fill.active { animation: none; }
            .lcars-rain-badge { animation: none; }
            .lcars-atmos-particle { animation: none; opacity: 0.4; }
            .atmos-cylinder.warn { animation: none; }
            .filter-seg.critical { animation: none; }
            .env-tile.warm, .env-tile.cool, .env-tile.hot, .env-tile.cold { animation: none; }
            .env-tile.hot-alert, .env-tile.cold-alert { animation: none; }
            .sensors-summary-row { animation: none; }
            .media-viewscreen-glow { animation: none; }
            .media-idle-glyph { animation: none; opacity: 0.4; }
            .media-progress-fill::after { animation: none; }
            /* Power panel reduced motion */
            .power-panel[data-alert="critical"] { animation: none; border-color: var(--lcars-tomato); }
            .lcars-consolidated-power-panel[data-alert="critical"] { animation: none; border-color: var(--lcars-tomato); }
            .power-circuit-tile { animation: none !important; opacity: 1; }
            .power-circuit-tile, .power-device-row, .power-toggle { transition-duration: 0.01ms !important; }
            /* Confirmations: halved, still play */
            .device-control-btn:active::after { animation-duration: 100ms !important; }
            .alarm-key:active::before { animation-duration: 100ms !important; }
            .zone-bar.completing { animation-duration: 1s !important; }
          }
        `]}_renderFloorView(t){const a=this._hass.floors?.[t];if(!a)return i.g0.debug(Ve,"Render: floor not found:",t),e.qy`<div class="lcars-empty">Floor not found</div>`;const r=this._getFloorAreaIds(t);return 0===r.length?e.qy`
          <div class="content-area-panel">
            <h2 class="content-area-header">${a.name}</h2>
            <div class="lcars-empty">No areas on this floor</div>
          </div>
        `:(i.g0.debug(Ve,"Render: floor=%s areas=%d",a.name,r.length),e.qy`
        <div class="content-floor-panel">
          <h2 class="content-floor-header">${a.name}</h2>
          ${r.map(t=>{const a=this._hass.areas?.[t];if(!a)return"";const r=this._getAreaEntities(t);return 0===r.length?"":e.qy`
              <div class="content-area-panel floor-area-section">
                <h3 class="content-area-header floor-area-subheader">${a.name}</h3>
                ${this._renderAreaContent(r,t)}
              </div>
            `})}
        </div>
      `)}render(){if(!this._hass)return i.g0.debug(Ve,"Render: waiting for hass"),e.qy`<div class="lcars-empty">Initializing...</div>`;if(this.selectedFloor)return this._renderFloorView(this.selectedFloor);if(!this.selectedArea)return i.g0.debug(Ve,"Render: no area selected"),e.qy`<div class="lcars-empty">Select an area</div>`;const t=this._hass.areas?.[this.selectedArea];if(!t)return i.g0.debug(Ve,"Render: area not found:",this.selectedArea),e.qy`<div class="lcars-empty">Area not found</div>`;const a=this._getAreaEntities(this.selectedArea);return i.g0.debug(Ve,"Render: area=%s entities=%d",t.name,a.length),e.qy`
        <div class="content-area-panel">
          <h2 class="content-area-header">${t.name}</h2>
          ${this._renderAreaContent(a,this.selectedArea)}
        </div>
      `}_getDevicePanelType(e){return function(e){for(const t of H){const a=t(e);if(a)return a}return null}(e)}_partitionDeviceEntities(e){const t=[],a=[],r=[];for(const i of e)$.has(i.domain)?t.push(i):A.has(i.domain)?a.push(i):r.push(i);return{cameras:t,sensors:a,controls:r}}_generatePanelCode(e){let t=5381;for(let a=0;a<e.length;a++)t=(t<<5)+t+e.charCodeAt(a)|0;const a=String(Math.abs(t)%1e6).padStart(6,"0");return`${a.slice(0,3)}-${a.slice(3)}`}_renderDevicePanel(e,t){if(e===p)return this._renderIrrigationPanel(t);const a=je.get(e);return a?a(t,this._hass,this._editMode,this._config):""}_getSensorIndicatorColor(e){return"carbon_dioxide"===(e?.attributes?.device_class||"")?(0,J.kR)(e?.state):(0,J.xH)(e?.entity_id||"",e)}_renderCameraPanel(t){const{cameras:a,sensors:r,controls:i}=this._partitionDeviceEntities(t.entities),s=this._shortDeviceName(t.device);return e.qy`
        <div class="lcars-device-panel" data-panel-type="camera">
          <div class="device-panel-header">
            <span class="device-panel-name">${s}</span>
            <div class="device-panel-header-line"></div>
            <span class="panel-numeric-code" aria-hidden="true">${this._generatePanelCode(a[0]?.entity?.entity_id||s)}</span>
          </div>

          <div class="device-panel-sensors" role="list" aria-label="${s} sensors">
            ${r.map(({entity:t,state:a})=>{const r=this._friendlyName(a,t),i=a.state,s=a.attributes?.unit_of_measurement||"",n=this._getSensorIndicatorColor(a);return e.qy`
                <div class="device-sensor-line" tabindex="0" role="listitem"
                  aria-label="${r}: ${i}${s?" "+s:""}"
                  @click=${()=>this._handleEntityClick(t.entity_id)}
                  @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._handleEntityClick(t.entity_id))}}>
                  <div class="sensor-indicator" style="background:${n}"></div>
                  <span class="sensor-label">${r}</span>
                  <span class="sensor-state-value" style="color:${n}">${i}${s?" "+s:""}</span>
                </div>
              `})}
          </div>

          <div class="device-panel-media"
            ?data-offline=${a.length>0&&this._isOff(a[0].state)}>
            ${a.map(({entity:t,state:a},r)=>{const i=Ge(a),n=0===r?s:this._friendlyName(a,t),o=this._isOff(a)||!i?"offline":"connecting";return e.qy`
                <div class="camera-frame" data-state="${o}"
                  style="${r>0?"margin-top:var(--lcars-gap);border-top:2px solid var(--panel-frame-color)":""}"
                  aria-busy="${"connecting"===o}"
                  @click=${()=>this._handleEntityClick(t.entity_id)}>
                  <div class="camera-connecting-overlay" aria-hidden="true">
                    <span class="camera-connecting-text">ESTABLISHING LINK</span>
                  </div>
                  <div class="camera-offline-overlay" aria-hidden="true">
                    <ha-icon icon="mdi:video-off"></ha-icon>
                    <span class="camera-offline-text">VIEWSCREEN OFFLINE</span>
                  </div>
                  ${i?e.qy`<img src="${i}" alt="${n} camera feed"
                                data-entity="${t.entity_id}"
                                .src=${i}
                                @load=${e=>{const t=e.target.closest(".camera-frame");t&&(t.setAttribute("data-state","live"),t.removeAttribute("aria-busy"))}}
                                @error=${e=>{const t=e.target.closest(".camera-frame");t&&(t.setAttribute("data-state","offline"),t.removeAttribute("aria-busy"))}} />`:e.qy`<div class="camera-spacer"></div>`}
                </div>`})}
          </div>

          <div class="device-panel-controls" aria-label="${s} controls">
            ${i.map(({entity:t,state:a})=>{const r=this._friendlyName(a,t),i="on"===a.state,s=this._isOff(a),n=t.entity_id.split(".")[0];return e.qy`
                <button class="device-control-btn" ?data-on=${i} ?data-off=${s}
                  @click=${()=>z.has(n)?this._handleToggle(t.entity_id):this._handleEntityClick(t.entity_id)}
                  title="${r}: ${a.state}">
                  <ha-icon .icon=${this._getEntityIcon(a)}></ha-icon>
                  <span>${r}</span>
                </button>
              `})}
          </div>
          <div class="panel-pip-strip" aria-hidden="true"></div>
        </div>
      `}_classifyPowerEntity(e){const t=(e||"").toLowerCase();return/total\s*in\s*power/.test(t)?{side:"in",type:"total"}:/total\s*out\s*power/.test(t)?{side:"out",type:"total"}:/solar.*in.*power/.test(t)?{side:"in",type:"solar"}:/ac.*in.*power/.test(t)?{side:"in",type:"ac"}:/ac.*out.*power/.test(t)?{side:"out",type:"ac"}:/dc.*out.*power/.test(t)?{side:"out",type:"dc"}:/usb.*out.*power/.test(t)?{side:"out",type:"usb"}:/type.*c.*out.*power/.test(t)?{side:"out",type:"usbc"}:/power.*i.*o.*input.*power/.test(t)?{side:"in",type:"pio"}:/power.*i.*o.*output.*power/.test(t)?{side:"out",type:"pio"}:/anderson.*out.*power/.test(t)?{side:"out",type:"dc"}:/alternator.*in.*power/.test(t)?{side:"in",type:"alt"}:/station.*power/.test(t)?{side:"out",type:"station"}:/\bin\b/.test(t)?{side:"in",type:"other"}:/\bout\b/.test(t)?{side:"out",type:"other"}:null}_partitionBatteryEntities(e,t){const a=[],r=[],i=[],s=[],n=[],o=[],l=[];for(const t of e){const e=t.state?.attributes||{},o=e.device_class||"",l=e.unit_of_measurement||"",c=t.domain,d=e.friendly_name||t.entity.entity_id;if(["switch","number","button","select"].includes(c))n.push(t);else if("battery"!==o||"%"!==l){if("power"===o&&"W"===l){const e=this._classifyPowerEntity(d);e?"in"===e.side?r.push({...t,ioType:e.type}):i.push({...t,ioType:e.type}):s.push(t);continue}s.push(t)}else a.push(t)}if(t){for(const e of t.config){const t=this._getEntityState(e.entity_id);if(!t)continue;const a=e.entity_id.split(".")[0];o.push({entity:e,domain:a,state:t})}for(const e of t.diagnostic){const t=this._getEntityState(e.entity_id);if(!t)continue;const a=e.entity_id.split(".")[0];l.push({entity:e,domain:a,state:t})}}return{soc:a,powerIn:r,powerOut:i,telemetry:s,controls:n,configControls:o,diagnostics:l}}_partitionEnvironmentEntities(e,t){const a=[],r=[],i=[],s=[],n=[];for(const t of e){const e=t.state?.attributes?.device_class||"",n=t.domain;["fan","switch","button","number","select","light"].includes(n)?s.push(t):P.has(e)?r.push(t):e||"sensor"!==n||!T.test(t.entity.entity_id)?i.push(t):a.push(t)}if(t)for(const e of[...t.diagnostic,...t.config]){const t=this._getEntityState(e.entity_id);t&&n.push({entity:e,domain:e.entity_id.split(".")[0],state:t})}return{score:a,airQuality:r,telemetry:i,controls:s,diagnostics:n}}_getScrubberHue(e){return null==e||e<=50?120:e<=100?120-(e-50)/50*70:e<=150?50-(e-100)/50*35:Math.max(0,15-(e-150)/100*15)}_getAQColor(e){return null==e||e<=50?"var(--lcars-ice)":e<=100?"var(--lcars-sunflower)":e<=150?"var(--lcars-butterscotch)":e<=200?"var(--lcars-peach)":"var(--lcars-tomato)"}_getScrubberSpeed(e){return null==e||0===e?20:2+18*Math.pow(1-e/100,1.5)}_envHistoryCache=new Map;async _getSparklineData(e,t){return(0,ie.s)(this._hass,e,t,this._envHistoryCache)}_renderSparkline(e,t,a){return(0,ie.K)(e,{color:t,label:a,className:"env-sparkline"})}_renderEnvironmentPanel(t){const a=this._getDeviceCategoryEntities(t.device.id),{score:r,airQuality:i,telemetry:s,controls:n,diagnostics:o}=this._partitionEnvironmentEntities(t.entities,a),l=this._shortDeviceName(t.device)||"Environment",c=r[0],d=c?parseFloat(c.state.state):null,p=i.find(e=>"pm25"===(e.state?.attributes?.device_class||"")),u=p?parseFloat(p.state.state):null,m=null!=d&&Number.isFinite(d)?d:null!=u&&Number.isFinite(u)?Math.min(300,4*u):null,h=this._getScrubberHue(m),v=this._getAQColor(m),f=n.find(e=>"fan"===e.domain),g=f?.state,b=g?.attributes?.percentage??null,y=g?.attributes?.preset_modes||[],w=g?.attributes?.preset_mode||"",_=!f||"off"===g?.state||0===b,x=this._getScrubberSpeed(_?0:b),$=!f,k=n.filter(e=>"fan"!==e.domain),S=[...r,...i].map(e=>e.entity.entity_id);S.length>0&&this._getSparklineData(t.device.id,S).then(e=>{e&&this.requestUpdate()});const C=this._envHistoryCache.get(t.device.id)?.data||{};return e.qy`
        <div class="lcars-device-panel env-panel ${$?"sensor-only":""}" data-panel-type="environment">
          <!-- Header -->
          <div class="env-header">
            <span class="device-panel-name">${l}</span>
            <div class="device-panel-header-line"></div>
            ${c?e.qy`
              <span class="env-score-label" style="color:${v}">
                ${null!=d&&Number.isFinite(d)?Math.round(d):"—"}
              </span>
            `:""}
            <span class="panel-numeric-code" aria-hidden="true">${this._generatePanelCode(t.device.id)}</span>
          </div>

          <!-- Sensors (left) -->
          <div class="env-sensors" role="list" aria-label="${l} sensors">
            ${i.map(({entity:t,state:a})=>{const r=this._friendlyName(a,t),i=a.state,s=a.attributes?.unit_of_measurement||"",n=this._getSensorIndicatorColor(a);return e.qy`
                <div class="device-sensor-line" tabindex="0" role="listitem"
                  aria-label="${r}: ${i}${s?" "+s:""}"
                  @click=${()=>this._handleEntityClick(t.entity_id)}
                  @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._handleEntityClick(t.entity_id))}}>
                  <div class="sensor-indicator" style="background:${n}"></div>
                  <span class="sensor-label">${r}</span>
                  <span class="sensor-state-value" style="color:${n}">${i}${s?" "+s:""}</span>
                </div>
              `})}
            ${s.map(({entity:t,state:a})=>{const r=this._friendlyName(a,t),i=a.state,s=a.attributes?.unit_of_measurement||"",n=this._getSensorIndicatorColor(a);return e.qy`
                <div class="device-sensor-line" tabindex="0" role="listitem"
                  aria-label="${r}: ${i}${s?" "+s:""}"
                  @click=${()=>this._handleEntityClick(t.entity_id)}
                  @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._handleEntityClick(t.entity_id))}}>
                  <div class="sensor-indicator" style="background:${n}"></div>
                  <span class="sensor-label">${r}</span>
                  <span class="sensor-state-value" style="color:${n}">${i}${s?" "+s:""}</span>
                </div>
              `})}
            ${o.length>0?e.qy`
              <div class="battery-section-divider"></div>
              <div class="battery-section-label">DIAGNOSTICS</div>
              ${o.map(({entity:t,state:a})=>{const r=this._friendlyName(a,t),i=a.state,s=a.attributes?.unit_of_measurement||"",n=this._getSensorIndicatorColor(a);return e.qy`
                  <div class="device-sensor-line" tabindex="0" role="listitem"
                    @click=${()=>this._handleEntityClick(t.entity_id)}
                    @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._handleEntityClick(t.entity_id))}}>
                    <div class="sensor-indicator" style="background:${n}"></div>
                    <span class="sensor-label">${r}</span>
                    <span class="sensor-state-value" style="color:${n}">${i}${s?" "+s:""}</span>
                  </div>
                `})}
            `:""}
          </div>

          <!-- Atmoscrubber Cylinder (center) -->
          <div class="atmoscrubber-container" role="meter"
            aria-valuenow="${null!=m?Math.round(m):""}"
            aria-valuemin="0" aria-valuemax="300"
            aria-label="Air quality: ${null!=m?Math.round(m):"unknown"}">
            <div class="atmoscrubber ${_?"scrubber-idle":""}"
              style="--scrubber-hue:${Math.round(h)};--scrubber-speed:${x.toFixed(1)}s;--atmos-quality-color:${v}">
              ${c?e.qy`
                <div class="scrubber-score">${null!=d&&Number.isFinite(d)?Math.round(d):"—"}</div>
              `:p?e.qy`
                <div class="scrubber-score">${null!=u&&Number.isFinite(u)?Math.round(u):"—"}</div>
              `:""}
              ${_?"":e.qy`${Array.from({length:6},(t,a)=>e.qy`
                <div class="lcars-atmos-particle" aria-hidden="true"
                  style="--particle-speed:${3+.8*a}s;--particle-delay:${.6*a}s;--particle-drift:${3+a%3*2}px;--particle-size:${2+a%3}px;--particle-opacity:${.3+a%2*.2};left:${10+14*a}%"></div>
              `)}`}
            </div>
          </div>

          <!-- Controls (right) — only for purifiers -->
          ${$?"":e.qy`
            <div class="env-controls" aria-label="${l} controls">
              ${f?e.qy`
                <button class="device-control-btn"
                  ?data-on=${"on"===g?.state}
                  ?data-off=${this._isOff(g)}
                  @click=${()=>this._handleToggle(f.entity.entity_id)}
                  title="Fan: ${g?.state}">
                  <ha-icon .icon=${"mdi:fan"}></ha-icon>
                  <span>${"on"===g?.state?`${b||""}%`:"Off"}</span>
                </button>
                ${y.length>0?e.qy`
                  <div class="lcars-option-strip" role="radiogroup" aria-label="Preset mode">
                    <span class="lcars-option-strip-label">Mode</span>
                    <div class="lcars-option-strip-btns">
                      ${y.map(t=>e.qy`
                        <button class="lcars-option-btn"
                          role="radio"
                          aria-checked="${t===w}"
                          ?data-selected=${t===w}
                          @click=${()=>{(this._hass.states[f.entity.entity_id]?.attributes?.preset_modes||[]).includes(t)&&this._hass.callService("fan","set_preset_mode",{entity_id:f.entity.entity_id,preset_mode:t})}}>
                          ${t}
                        </button>
                      `)}
                    </div>
                  </div>
                `:""}
              `:""}
              ${k.map(({entity:t,state:a})=>{const r=this._friendlyName(a,t),i="on"===a.state,s=this._isOff(a);return e.qy`
                  <button class="device-control-btn" ?data-on=${i} ?data-off=${s}
                    @click=${()=>this._handleToggle(t.entity_id)}
                    title="${r}: ${a.state}">
                    <ha-icon .icon=${this._getEntityIcon(a)}></ha-icon>
                    <span>${r}</span>
                  </button>
                `})}
            </div>
          `}

          <!-- Sparklines (bottom) -->
          <div class="env-sparklines" aria-label="24-hour history">
            ${[...r,...i].map(({entity:e,state:t})=>{const a=this._friendlyName(t,e),r=C[e.entity_id],i=t.attributes?.device_class||"",s="pm25"===i?"var(--lcars-peach)":"carbon_dioxide"===i?"var(--lcars-sunflower)":"volatile_organic_compounds_parts"===i||"volatile_organic_compounds"===i?"var(--lcars-african-violet)":"var(--lcars-ice)";return this._renderSparkline(r,s,a)})}
          </div>
          <div class="panel-pip-strip" aria-hidden="true"></div>
        </div>
      `}_getCoreColor(e){return e>=80?"var(--lcars-ice)":e>=60?"var(--lcars-sky)":e>=40?"var(--lcars-bluey)":e>=20?"var(--lcars-butterscotch)":e>=10?"var(--lcars-peach)":"var(--lcars-tomato)"}_getFlowSpeed(e){const t=Math.abs(parseFloat(e)||0);return 0===t?"flow-stopped":t>1e3?"flow-fast":t>100?"flow-medium":"flow-slow"}_renderBatteryPanel(t){const a=this._getDeviceCategoryEntities(t.device.id),{soc:r,powerIn:i,powerOut:s,telemetry:n,controls:o,configControls:l,diagnostics:c}=this._partitionBatteryEntities(t.entities,a),d=this._shortDeviceName(t.device)||"Battery",p=r[0],u=p&&parseFloat(p.state.state)||0,m=p&&"unavailable"!==p.state.state&&"unknown"!==p.state.state,h=m?this._getCoreColor(u):"var(--lcars-gray)",v=i.find(e=>"total"===e.ioType),f=s.find(e=>"total"===e.ioType),g=v&&parseFloat(v.state.state)||0,b=f&&parseFloat(f.state.state)||0,y=g>5,w=!(y||b>5),_=new Set;i.filter(e=>"total"!==e.ioType).forEach(e=>_.add(e.ioType)),s.filter(e=>"total"!==e.ioType).forEach(e=>_.add(e.ioType));const x=[..._].map(e=>({type:e,label:e.toUpperCase(),inEntry:i.find(t=>t.ioType===e),outEntry:s.find(t=>t.ioType===e)})),$=n.filter(e=>{const t=e.state?.attributes?.device_class||"",a=(e.state?.attributes?.friendly_name||"").toLowerCase();return"temperature"===t||"duration"===t||/state.*health|cycles|remain.*time|status|error.*code|battery.*count/.test(a)}).slice(0,8),k=c.filter(e=>{const t=e.state?.attributes?.device_class||"",a=(e.state?.attributes?.friendly_name||"").toLowerCase();return"temperature"===t||/cycles|status|error|battery.*count|charging.*state|power.*diff/.test(a)}).slice(0,8);return e.qy`
        <div class="lcars-device-panel battery-panel" data-panel-type="battery">
          <!-- Header -->
          <div class="battery-header">
            <span class="device-panel-name">${d}</span>
            <div class="device-panel-header-line"></div>
            <span class="battery-charge-label" style="color:${h}">
              ${m?`${Math.round(u)}%`:"N/A"}
            </span>
            <span class="panel-numeric-code" aria-hidden="true">${this._generatePanelCode(p?.entity?.entity_id||t.device.id)}</span>
          </div>

          <!-- Telemetry (left) -->
          <div class="battery-telemetry" role="list" aria-label="${d} telemetry">
            ${v?e.qy`
              <div class="battery-total-line" tabindex="0" role="button"
                @click=${()=>this._handleEntityClick(v.entity.entity_id)}
                @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._handleEntityClick(v.entity.entity_id))}}>
                <ha-icon icon="mdi:transmission-tower-import" style="--mdc-icon-size:14px;color:var(--lcars-ice)"></ha-icon>
                <span class="sensor-label">Total In</span>
                <span class="sensor-state-value" style="color:var(--lcars-ice)">${v.state.state} W</span>
              </div>
            `:""}
            ${f?e.qy`
              <div class="battery-total-line" tabindex="0" role="button"
                @click=${()=>this._handleEntityClick(f.entity.entity_id)}
                @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._handleEntityClick(f.entity.entity_id))}}>
                <ha-icon icon="mdi:transmission-tower-export" style="--mdc-icon-size:14px;color:var(--lcars-butterscotch)"></ha-icon>
                <span class="sensor-label">Total Out</span>
                <span class="sensor-state-value" style="color:var(--lcars-butterscotch)">${f.state.state} W</span>
              </div>
            `:""}
            ${$.map(({entity:t,state:a})=>{const r=this._friendlyName(a,t),i=a.state,s=a.attributes?.unit_of_measurement||"",n=this._getSensorIndicatorColor(a);return e.qy`
                <div class="device-sensor-line" tabindex="0" role="listitem"
                  @click=${()=>this._handleEntityClick(t.entity_id)}
                  @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._handleEntityClick(t.entity_id))}}>
                  <div class="sensor-indicator" style="background:${n}"></div>
                  <span class="sensor-label">${r}</span>
                  <span class="sensor-state-value" style="color:${n}">${i}${s?" "+s:""}</span>
                </div>
              `})}
            ${k.length>0?e.qy`
              <div class="battery-section-divider"></div>
              <div class="battery-section-label">DIAGNOSTICS</div>
              ${k.map(({entity:t,state:a})=>{const r=this._friendlyName(a,t),i=a.state,s=a.attributes?.unit_of_measurement||"",n=this._getSensorIndicatorColor(a);return e.qy`
                  <div class="device-sensor-line" tabindex="0" role="listitem"
                    @click=${()=>this._handleEntityClick(t.entity_id)}
                    @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._handleEntityClick(t.entity_id))}}>
                    <div class="sensor-indicator" style="background:${n}"></div>
                    <span class="sensor-label">${r}</span>
                    <span class="sensor-state-value" style="color:${n}">${i}${s?" "+s:""}</span>
                  </div>
                `})}
            `:""}
          </div>

          <!-- Warp Core (center) -->
          <div class="warp-core-container" role="meter"
            aria-valuenow="${u}" aria-valuemin="0" aria-valuemax="100"
            aria-label="Battery charge level: ${Math.round(u)} percent">
            <div class="warp-core" style="--core-color:${h};--core-charge:${m?u:0}">
              <div class="warp-core-fill ${w?"core-idle":""} ${y?"core-charging":""}">
                <div class="warp-core-stream"></div>
              </div>
              <div class="warp-core-tick" style="bottom:25%"></div>
              <div class="warp-core-tick" style="bottom:50%"></div>
              <div class="warp-core-tick" style="bottom:75%"></div>
            </div>
          </div>

          <!-- Controls (right) -->
          <div class="battery-controls" aria-label="${d} controls">
            ${o.map(({entity:t,state:a})=>{const r=this._friendlyName(a,t),i=t.entity_id.split(".")[0];if("number"===i){const i=a.attributes?.min||0,s=a.attributes?.max||100,n=parseFloat(a.state)||0,o=a.attributes?.unit_of_measurement||"",l=s>i?(n-i)/(s-i)*100:0;return e.qy`
                  <div class="battery-slider-control">
                    <span class="battery-slider-label" id="slider-${t.entity_id}">${r}</span>
                    <div class="battery-slider-track"
                      tabindex="0" role="slider"
                      aria-labelledby="slider-${t.entity_id}"
                      aria-valuemin="${i}" aria-valuemax="${s}" aria-valuenow="${n}"
                      @click=${e=>{const a=e.currentTarget.getBoundingClientRect(),r=Math.max(0,Math.min(1,(e.clientX-a.left)/a.width)),n=Math.round(i+r*(s-i));this._hass.callService("number","set_value",{entity_id:t.entity_id,value:n})}}
                      @keydown=${e=>{let a=n;if("ArrowRight"===e.key||"ArrowUp"===e.key)a=Math.min(s,n+1);else if("ArrowLeft"===e.key||"ArrowDown"===e.key)a=Math.max(i,n-1);else if("Home"===e.key)a=i;else{if("End"!==e.key)return;a=s}e.preventDefault(),this._hass.callService("number","set_value",{entity_id:t.entity_id,value:a})}}>
                      <div class="battery-slider-fill" style="width:${l}%"></div>
                      <div class="battery-slider-thumb" style="left:${l}%"></div>
                    </div>
                    <span class="battery-slider-value">${n}${o?" "+o:""}</span>
                  </div>
                `}const s="on"===a.state,n=this._isOff(a);return e.qy`
                <button class="device-control-btn" ?data-on=${s} ?data-off=${n}
                  @click=${()=>z.has(i)?this._handleToggle(t.entity_id):this._handleEntityClick(t.entity_id)}
                  title="${r}: ${a.state}">
                  <ha-icon .icon=${this._getEntityIcon(a)}></ha-icon>
                  <span>${r}</span>
                </button>
              `})}
            ${l.length>0?e.qy`
              <div class="battery-section-divider"></div>
              <div class="battery-section-label">CONFIG</div>
              ${l.map(({entity:t,state:a})=>{const r=this._friendlyName(a,t),i=t.entity_id.split(".")[0];if("number"===i){const i=a.attributes?.min||0,s=a.attributes?.max||100,n=a.attributes?.step||1,o=parseFloat(a.state)||0,l=a.attributes?.unit_of_measurement||"",c=s>i?(o-i)/(s-i)*100:0;return e.qy`
                    <div class="battery-slider-control">
                      <span class="battery-slider-label" id="slider-${t.entity_id}">${r}</span>
                      <div class="battery-slider-track"
                        tabindex="0" role="slider"
                        aria-labelledby="slider-${t.entity_id}"
                        aria-valuemin="${i}" aria-valuemax="${s}" aria-valuenow="${o}"
                        @click=${e=>{const a=e.currentTarget.getBoundingClientRect(),r=Math.max(0,Math.min(1,(e.clientX-a.left)/a.width));let o=i+r*(s-i);o=Math.round(o/n)*n,o=Math.max(i,Math.min(s,o)),this._hass.callService("number","set_value",{entity_id:t.entity_id,value:o})}}
                        @keydown=${e=>{let a=o;if("ArrowRight"===e.key||"ArrowUp"===e.key)a=Math.min(s,o+n);else if("ArrowLeft"===e.key||"ArrowDown"===e.key)a=Math.max(i,o-n);else if("Home"===e.key)a=i;else{if("End"!==e.key)return;a=s}e.preventDefault(),this._hass.callService("number","set_value",{entity_id:t.entity_id,value:a})}}>
                        <div class="battery-slider-fill" style="width:${c}%"></div>
                        <div class="battery-slider-thumb" style="left:${c}%"></div>
                      </div>
                      <span class="battery-slider-value">${o}${l?" "+l:""}</span>
                    </div>
                  `}if("select"===i){const i=a.attributes?.options||[],s=a.state;return e.qy`
                    <div class="lcars-option-strip" role="radiogroup" aria-label="${r}">
                      <span class="lcars-option-strip-label">${r}</span>
                      <div class="lcars-option-strip-btns">
                        ${i.map(a=>e.qy`
                          <button class="lcars-option-btn"
                            role="radio"
                            aria-checked="${a===s}"
                            ?data-selected=${a===s}
                            @click=${()=>this._hass.callService("select","select_option",{entity_id:t.entity_id,option:a})}>
                            ${a}
                          </button>
                        `)}
                      </div>
                    </div>
                  `}const s="on"===a.state,n=this._isOff(a);return e.qy`
                  <button class="device-control-btn" ?data-on=${s} ?data-off=${n}
                    @click=${()=>z.has(i)?this._handleToggle(t.entity_id):this._handleEntityClick(t.entity_id)}
                    title="${r}: ${a.state}">
                    <ha-icon .icon=${this._getEntityIcon(a)}></ha-icon>
                    <span>${r}</span>
                  </button>
                `})}
            `:""}
          </div>

          <!-- Power I/O Flow (bottom) -->
          <div class="battery-io-flow" aria-label="Power flow">
            ${x.map(t=>{const a=t.inEntry&&parseFloat(t.inEntry.state.state)||0,r=t.outEntry&&parseFloat(t.outEntry.state.state)||0,i=this._getFlowSpeed(a),s=this._getFlowSpeed(r);return e.qy`
                <div class="io-pair-row">
                  <div class="io-port io-in" aria-label="${t.label} input: ${a} watts">
                    <span class="io-label">${t.label} IN</span>
                    <span class="io-watts" style="color:var(--lcars-ice)">${a>0?`${Math.round(a)}W`:"—"}</span>
                  </div>
                  <div class="io-conduit io-conduit-in ${i}"></div>
                  <div class="io-core-gap"></div>
                  <div class="io-conduit io-conduit-out ${s}"></div>
                  <div class="io-port io-out" aria-label="${t.label} output: ${r} watts">
                    <span class="io-label">${t.label} OUT</span>
                    <span class="io-watts" style="color:var(--lcars-butterscotch)">${r>0?`${Math.round(r)}W`:"—"}</span>
                  </div>
                </div>
              `})}
          </div>
          <div class="panel-pip-strip" aria-hidden="true"></div>
        </div>
      `}_climateSetpointDebouncer=null;_partitionClimateEntities(e,t){const a=[],r=[],i=[],s=[],n=new Set(["problem","heat","cold","connectivity","battery","tamper","smoke","safety"]);for(const t of e){const e=t.domain;if("climate"!==e){if("binary_sensor"===e){const e=t.state?.attributes?.device_class||"";if(n.has(e)){i.push(t);continue}}A.has(e),r.push(t)}else a.push(t)}if(t)for(const e of t.diagnostic||[]){const t=this._getEntityState(e.entity_id);t&&s.push({entity:e,domain:e.entity_id.split(".")[0],state:t})}return{climate:a,sensors:r,faults:i,diagnostics:s}}_isDualSetpoint(e){return"heat_cool"===e?.attributes?.hvac_mode||null!=e?.attributes?.target_temp_low&&null!=e?.attributes?.target_temp_high}_renderClimateArc(t,a,r,i,s){const n=100,o=120,l=80,c=i-r||1,d=Math.max(0,Math.min(1,(t-r)/c)),p=Math.PI,u=p-(p-0)*d,m=n+l*Math.cos(p),h=o-l*Math.sin(p),v=n+l*Math.cos(u),f=o-l*Math.sin(u),g=d>.5?1:0,b=p-(p-0)*Math.max(0,Math.min(1,(a-r)/c)),y=n+l*Math.cos(b),w=o-l*Math.sin(b);return e.qy`
        <svg class="climate-arc" viewBox="0 0 ${200} ${130}" role="meter"
          aria-valuemin="${r}" aria-valuemax="${i}" aria-valuenow="${t}"
          aria-label="Temperature: ${t}°, target ${a}°">
          <!-- Background arc -->
          <path d="M ${m},${h} A ${l},${l} 0 1,1 ${180},${o}"
            fill="none" stroke="var(--lcars-disabled)" stroke-width="8" stroke-linecap="round" />
          <!-- Progress arc -->
          ${d>0?e.qy`
            <path d="M ${m},${h} A ${l},${l} 0 ${g},1 ${v},${f}"
              fill="none" stroke="${s}" stroke-width="8" stroke-linecap="round" />
          `:""}
          <!-- Target tick -->
          <circle cx="${y}" cy="${w}" r="5" fill="${s}" stroke="var(--lcars-card-bg, var(--lcars-black, #000))" stroke-width="2" />
          <!-- Current temp text -->
          <text x="${n}" y="${100}" text-anchor="middle" fill="${s}"
            font-family="var(--lcars-font)" font-size="42" font-weight="bold">
            ${null!=t&&Number.isFinite(t)?Math.round(t):"—"}°
          </text>
        </svg>
      `}_handleClimateSetpoint(e,t,a,r,i){const s=ee(a,t);this._climateSetpointDebouncer||(this._climateSetpointDebouncer=re((e,t)=>{this._hass.callService("climate","set_temperature",{entity_id:e,...t})},1500));const n=r?{["low"===i?"target_temp_low":"target_temp_high"]:s}:{temperature:s};this._climateSetpointDebouncer.call(e,n)}_handleClimateMode(e,t){this._hass.callService("climate","set_hvac_mode",{entity_id:e,hvac_mode:t})}_handleClimateFanMode(e,t){this._hass.callService("climate","set_fan_mode",{entity_id:e,fan_mode:t})}_handleClimatePreset(e,t){this._hass.callService("climate","set_preset_mode",{entity_id:e,preset_mode:t})}_renderClimatePanel(t){const a=this._getDeviceCategoryEntities(t.device.id),{climate:r,sensors:i,faults:s,diagnostics:n}=this._partitionClimateEntities(t.entities,a),o=this._shortDeviceName(t.device)||"Thermostat";if(0===r.length)return"";const l=r[0],c=l.state,d=c?.attributes||{},p=null!=d.current_temperature?Number(d.current_temperature):null,u=d.hvac_action||"off",m=(0,J.OX)(u),h=this._isDualSetpoint(c),v=h?null:null!=d.temperature?Number(d.temperature):null,f=h?Number(d.target_temp_low):null,g=h?Number(d.target_temp_high):null,b=null!=d.min_temp?Number(d.min_temp):45,y=null!=d.max_temp?Number(d.max_temp):95,w=d.hvac_modes||[],_=d.hvac_mode||"off",x=d.fan_modes||[],$=d.fan_mode||"",k=d.preset_modes||[],S=d.preset_mode||"",C=i.find(e=>"humidity"===(e.state?.attributes?.device_class||"")),E=d.target_temp_step||1;return e.qy`
        <div class="lcars-device-panel climate-panel" data-panel-type="climate"
          data-hvac-action="${u}"
          style="--panel-frame-color:${m}">
          <!-- Header -->
          <div class="climate-header">
            <span class="device-panel-name">${o}</span>
            <div class="device-panel-header-line"></div>
            <span class="climate-action-badge" style="color:${m}">
              ${u.toUpperCase()}
            </span>
            <span class="panel-numeric-code" aria-hidden="true">${this._generatePanelCode(l.entity.entity_id)}</span>
          </div>

          <!-- Sensors (left) -->
          <div class="climate-sensors" role="list" aria-label="${o} readings">
            ${null!=p?e.qy`
              <div class="device-sensor-line" role="listitem" aria-label="Current temperature: ${p}°">
                <div class="sensor-indicator" style="background:${m}"></div>
                <span class="sensor-label">Current</span>
                <span class="sensor-state-value" style="color:${m}">${Math.round(p)}°</span>
              </div>
            `:""}
            ${h?e.qy`
              <div class="device-sensor-line" role="listitem" aria-label="Heat target: ${f}°">
                <div class="sensor-indicator" style="background:var(--lcars-butterscotch)"></div>
                <span class="sensor-label">Heat To</span>
                <span class="sensor-state-value" style="color:var(--lcars-butterscotch)">${f}°</span>
              </div>
              <div class="device-sensor-line" role="listitem" aria-label="Cool target: ${g}°">
                <div class="sensor-indicator" style="background:var(--lcars-ice)"></div>
                <span class="sensor-label">Cool To</span>
                <span class="sensor-state-value" style="color:var(--lcars-ice)">${g}°</span>
              </div>
            `:null!=v?e.qy`
              <div class="device-sensor-line" role="listitem" aria-label="Target temperature: ${v}°">
                <div class="sensor-indicator" style="background:${m}"></div>
                <span class="sensor-label">Target</span>
                <span class="sensor-state-value" style="color:${m}">${v}°</span>
              </div>
            `:""}
            ${C?e.qy`
              <div class="device-sensor-line" role="listitem"
                aria-label="Humidity: ${C.state.state}%"
                @click=${()=>this._handleEntityClick(C.entity.entity_id)}>
                <div class="sensor-indicator" style="background:var(--lcars-ice)"></div>
                <span class="sensor-label">Humidity</span>
                <span class="sensor-state-value" style="color:var(--lcars-ice)">${C.state.state}%</span>
              </div>
            `:""}
            <div class="battery-section-divider"></div>
            <div class="device-sensor-line" role="listitem" aria-label="HVAC mode: ${_}">
              <div class="sensor-indicator" style="background:${m}"></div>
              <span class="sensor-label">Mode</span>
              <span class="sensor-state-value">${_}</span>
            </div>
            ${$?e.qy`
              <div class="device-sensor-line" role="listitem" aria-label="Fan mode: ${$}">
                <div class="sensor-indicator" style="background:var(--lcars-data-accent)"></div>
                <span class="sensor-label">Fan</span>
                <span class="sensor-state-value">${$}</span>
              </div>
            `:""}
            ${s.length>0?e.qy`
              <div class="battery-section-divider"></div>
              <div class="battery-section-label">FAULTS</div>
              ${s.map(({entity:t,state:a})=>{const r=this._friendlyName(a,t),i="on"===a.state?"var(--lcars-tomato)":"var(--lcars-gray)";return e.qy`
                  <div class="device-sensor-line" tabindex="0" role="listitem"
                    aria-label="${r}: ${a.state}"
                    @click=${()=>this._handleEntityClick(t.entity_id)}
                    @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._handleEntityClick(t.entity_id))}}>
                    <div class="sensor-indicator" style="background:${i}"></div>
                    <span class="sensor-label">${r}</span>
                    <span class="sensor-state-value" style="color:${i}">${a.state}</span>
                  </div>
                `})}
            `:""}
          </div>

          <!-- Viewscreen (right) -->
          <div class="climate-viewscreen" tabindex="0"
            @click=${()=>this._handleEntityClick(l.entity.entity_id)}
            @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._handleEntityClick(l.entity.entity_id))}}>
            ${this._renderClimateArc(p,h?(f+g)/2:v,b,y,m)}
            <!-- Setpoint controls -->
            <div class="climate-setpoint-controls">
              ${h?e.qy`
                <div class="climate-setpoint-row">
                  <button class="climate-sp-btn" aria-label="Decrease heat target"
                    @click=${e=>{e.stopPropagation(),this._handleClimateSetpoint(l.entity.entity_id,d,f-E,!0,"low")}}>−</button>
                  <span class="climate-sp-label" style="color:var(--lcars-butterscotch)">HEAT ${f}°</span>
                  <button class="climate-sp-btn" aria-label="Increase heat target"
                    @click=${e=>{e.stopPropagation(),this._handleClimateSetpoint(l.entity.entity_id,d,f+E,!0,"low")}}>+</button>
                </div>
                <div class="climate-setpoint-row">
                  <button class="climate-sp-btn" aria-label="Decrease cool target"
                    @click=${e=>{e.stopPropagation(),this._handleClimateSetpoint(l.entity.entity_id,d,g-E,!0,"high")}}>−</button>
                  <span class="climate-sp-label" style="color:var(--lcars-ice)">COOL ${g}°</span>
                  <button class="climate-sp-btn" aria-label="Increase cool target"
                    @click=${e=>{e.stopPropagation(),this._handleClimateSetpoint(l.entity.entity_id,d,g+E,!0,"high")}}>+</button>
                </div>
              `:null!=v?e.qy`
                <div class="climate-setpoint-row">
                  <button class="climate-sp-btn" aria-label="Decrease target temperature"
                    @click=${e=>{e.stopPropagation(),this._handleClimateSetpoint(l.entity.entity_id,d,v-E,!1)}}>−</button>
                  <span class="climate-sp-label" style="color:${m}">TARGET ${v}°</span>
                  <button class="climate-sp-btn" aria-label="Increase target temperature"
                    @click=${e=>{e.stopPropagation(),this._handleClimateSetpoint(l.entity.entity_id,d,v+E,!1)}}>+</button>
                </div>
              `:""}
            </div>
          </div>

          <!-- HVAC Mode Strip -->
          ${w.length>1?e.qy`
            <div class="climate-modes" role="radiogroup" aria-label="HVAC mode">
              ${w.map(t=>e.qy`
                <button class="climate-mode-btn" role="radio"
                  aria-checked="${t===_}"
                  ?data-active=${t===_}
                  @click=${()=>this._handleClimateMode(l.entity.entity_id,t)}>
                  ${t.toUpperCase().replace("_"," ")}
                </button>
              `)}
            </div>
          `:""}

          <!-- Fan Mode + Preset Strips -->
          <div class="climate-aux-controls">
            ${x.length>1?e.qy`
              <div class="climate-aux-strip" role="radiogroup" aria-label="Fan mode">
                ${x.map(t=>e.qy`
                  <button class="climate-mode-btn" role="radio"
                    aria-checked="${t===$}"
                    ?data-active=${t===$}
                    @click=${()=>this._handleClimateFanMode(l.entity.entity_id,t)}>
                    ${t.toUpperCase().replace("_"," ")}
                  </button>
                `)}
              </div>
            `:""}
            ${k.length>0?e.qy`
              <div class="climate-aux-strip" role="radiogroup" aria-label="Preset mode">
                ${k.map(t=>e.qy`
                  <button class="climate-mode-btn" role="radio"
                    aria-checked="${t===S}"
                    ?data-active=${t===S}
                    @click=${()=>this._handleClimatePreset(l.entity.entity_id,t)}>
                    ${t.toUpperCase().replace("_"," ")}
                  </button>
                `)}
              </div>
            `:""}
          </div>
          <div class="panel-pip-strip" aria-hidden="true"></div>
        </div>
      `}_alarmPinCode="";_alarmPinLimiter=ae(3,6e4);_alarmCountdown=null;_alarmCountdownTimer=null;_alarmPinError=!1;_partitionAlarmEntities(e,t){const a=[],r=[],i=[],s=[],n=new Set(["door","window","motion","vibration","moisture","cold","smoke","safety","opening","garage_door","lock","tamper","problem"]);for(const t of e)if("alarm_control_panel"!==t.domain){if("binary_sensor"===t.domain){const e=t.state?.attributes?.device_class||"";if(n.has(e)){r.push(t);continue}}i.push(t)}else a.push(t);if(t)for(const e of t.diagnostic||[]){const t=this._getEntityState(e.entity_id);t&&s.push({entity:e,domain:e.entity_id.split(".")[0],state:t})}return{alarm:a,zones:r,auxiliary:i,diagnostics:s}}_handleAlarmPinDigit(e){this._alarmPinCode.length>=6||(this._alarmPinCode+=String(e).replace(/\D/g,"").charAt(0)||"",this._alarmPinError=!1,this.requestUpdate())}_handleAlarmPinClear(){this._alarmPinCode="",this._alarmPinError=!1,this.requestUpdate()}_handleAlarmArm(e,t){const a=this._alarmPinCode||void 0,r=`alarm_arm_${t}`;this._hass.callService("alarm_control_panel",r,{entity_id:e,...a?{code:a}:{}}),this._alarmPinCode="",this.requestUpdate()}_handleAlarmDisarm(e){if(!this._alarmPinLimiter.allow())return this._alarmPinError=!0,void this.requestUpdate();const t=this._alarmPinCode||void 0;this._hass.callService("alarm_control_panel","alarm_disarm",{entity_id:e,...t?{code:t}:{}}),this._alarmPinCode="",this.requestUpdate()}_startAlarmCountdown(e){this._alarmCountdown=Math.max(0,e),this._alarmCountdownTimer&&clearInterval(this._alarmCountdownTimer),this._alarmCountdownTimer=setInterval(()=>{this._alarmCountdown=Math.max(0,(this._alarmCountdown||0)-1),this.requestUpdate(),this._alarmCountdown<=0&&(clearInterval(this._alarmCountdownTimer),this._alarmCountdownTimer=null)},1e3)}_stopAlarmCountdown(){this._alarmCountdownTimer&&(clearInterval(this._alarmCountdownTimer),this._alarmCountdownTimer=null),this._alarmCountdown=null}_getAlarmShieldSymbol(e){switch(e){case"disarmed":return"✓";case"armed_home":case"armed_night":return"◉";case"armed_away":case"armed_vacation":return"▲";case"triggered":return"✕";case"arming":case"pending":case"disarming":return"⋯";default:return"?"}}_getAlarmStateLabel(e){return(e||"unknown").toUpperCase().replace(/_/g," ")}_handleAlarmKeydown(e,t){const a=e.key;/^[0-9]$/.test(a)?(e.preventDefault(),this._handleAlarmPinDigit(a)):"Backspace"===a?(e.preventDefault(),this._alarmPinCode=this._alarmPinCode.slice(0,-1),this.requestUpdate()):"Enter"===a?(e.preventDefault(),this._handleAlarmDisarm(t)):"Escape"===a&&(e.preventDefault(),this._handleAlarmPinClear())}_renderAlarmPanel(t){const a=this._getDeviceCategoryEntities(t.device.id),{alarm:r,zones:i,auxiliary:s,diagnostics:n}=this._partitionAlarmEntities(t.entities,a),o=this._shortDeviceName(t.device)||"Alarm";if(0===r.length)return"";const l=r[0],c=l.state,d=c?.state||"unavailable",p=(0,J.of)(d),u=["arming","pending","disarming"].includes(d),m="triggered"===d,h=this._getAlarmShieldSymbol(d),v=this._getAlarmStateLabel(d),f=!1!==c?.attributes?.code_required,g=Array.from({length:6},(e,t)=>t<this._alarmPinCode.length);if(u&&null==this._alarmCountdown){const e=c?.attributes?.delay||60;this._startAlarmCountdown(e)}else u||null==this._alarmCountdown||this._stopAlarmCountdown();return e.qy`
        <div class="lcars-device-panel alarm-panel ${m?"alarm-triggered":""}" data-panel-type="alarm"
          data-state="${d}"
          style="--panel-frame-color:${p}">
          <!-- Header -->
          <div class="alarm-header">
            <span class="device-panel-name">${o}</span>
            <div class="device-panel-header-line"></div>
            <span class="alarm-state-badge" style="color:${p}">${v}</span>
            <span class="panel-numeric-code" aria-hidden="true">${this._generatePanelCode(l.entity.entity_id)}</span>
          </div>

          <!-- Zones (left) -->
          <div class="alarm-sensors" role="list" aria-label="${o} zones">
            ${i.map(({entity:t,state:a})=>{const r=this._friendlyName(a,t),i="on"===a.state,s=i?"var(--lcars-butterscotch)":"var(--lcars-gray)";return e.qy`
                <div class="device-sensor-line" tabindex="0" role="listitem"
                  aria-label="${r}: ${i?"open":"closed"}"
                  @click=${()=>this._handleEntityClick(t.entity_id)}
                  @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._handleEntityClick(t.entity_id))}}>
                  <div class="sensor-indicator" style="background:${s}"></div>
                  <span class="sensor-label">${r}</span>
                  <span class="sensor-state-value" style="color:${s}">${i?"OPEN":"CLOSED"}</span>
                </div>
              `})}
            ${s.length>0?e.qy`
              <div class="battery-section-divider"></div>
              ${s.map(({entity:t,state:a})=>{const r=this._friendlyName(a,t),i=this._getSensorIndicatorColor(a);return e.qy`
                  <div class="device-sensor-line" tabindex="0" role="listitem"
                    @click=${()=>this._handleEntityClick(t.entity_id)}
                    @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._handleEntityClick(t.entity_id))}}>
                    <div class="sensor-indicator" style="background:${i}"></div>
                    <span class="sensor-label">${r}</span>
                    <span class="sensor-state-value" style="color:${i}">${a.state}</span>
                  </div>
                `})}
            `:""}
          </div>

          <!-- Viewscreen (right) -->
          <div class="alarm-viewscreen">
            ${u&&null!=this._alarmCountdown?e.qy`
              <div class="alarm-countdown" aria-live="polite">
                <span class="alarm-countdown-num" style="color:${p}">${this._alarmCountdown}</span>
                <span class="alarm-countdown-label">${v}</span>
              </div>
            `:e.qy`
              <svg class="alarm-shield" viewBox="0 0 160 180" role="img"
                aria-label="${o}: ${v}">
                <path d="M80,10 L145,45 L145,110 Q145,160 80,175 Q15,160 15,110 L15,45 Z"
                  fill="none" stroke="${p}" stroke-width="4" />
                <text x="80" y="105" text-anchor="middle" fill="${p}"
                  font-family="var(--lcars-font)" font-size="48">${h}</text>
                <text x="80" y="145" text-anchor="middle" fill="${p}"
                  font-family="var(--lcars-font)" font-size="14">${v}</text>
              </svg>
            `}
            <!-- Arm mode strip -->
            <div class="alarm-arm-strip" role="radiogroup" aria-label="Arm mode">
              ${["home","away","night"].map(t=>{const a=d===`armed_${t}`;return e.qy`
                  <button class="alarm-arm-btn" role="radio"
                    aria-checked="${a}"
                    ?data-active=${a}
                    @click=${()=>this._handleAlarmArm(l.entity.entity_id,t)}>
                    ${t.toUpperCase()}
                  </button>
                `})}
            </div>
          </div>

          <!-- PIN Keypad -->
          ${f?e.qy`
            <div class="alarm-keypad" tabindex="0" aria-label="PIN keypad"
              @keydown=${e=>this._handleAlarmKeydown(e,l.entity.entity_id)}>
              <div class="alarm-code-display ${this._alarmPinError?"alarm-pin-error":""}" role="status" aria-live="polite">
                ${g.map(t=>e.qy`
                  <div class="alarm-code-dot ${t?"filled":""}"
                    style="background:${t?this._alarmPinError?"var(--lcars-tomato)":p:"var(--lcars-disabled)"}"></div>
                `)}
              </div>
              <div class="alarm-digit-grid">
                ${[1,2,3,4,5,6,7,8,9].map(t=>e.qy`
                  <button class="alarm-digit-btn" aria-label="Digit ${t}"
                    @click=${()=>this._handleAlarmPinDigit(t)}>${t}</button>
                `)}
                <button class="alarm-digit-btn alarm-action-btn" aria-label="Clear code"
                  @click=${()=>this._handleAlarmPinClear()}>⌫</button>
                <button class="alarm-digit-btn" aria-label="Digit 0"
                  @click=${()=>this._handleAlarmPinDigit(0)}>0</button>
                <button class="alarm-digit-btn alarm-action-btn" aria-label="Disarm"
                  @click=${()=>this._handleAlarmDisarm(l.entity.entity_id)}>⏎</button>
              </div>
            </div>
          `:""}
          <div class="panel-pip-strip" aria-hidden="true"></div>
        </div>
      `}_isValidArtworkUrl(e){return!!e&&(e.startsWith("/api/")||e.startsWith("/local/"))}_getMediaTransportSymbol(e){switch(e){case"playing":return"▶";case"paused":return"❚❚";default:return"■"}}_partitionMediaEntities(e){const t=[],a=[],r=[],i=[];for(const s of e)"media_player"!==s.domain?"remote"!==s.domain?A.has(s.domain)?a.push(s):r.push(s):i.push(s):t.push(s);return{player:t,sensors:a,controls:r,remotes:i}}_handleMediaService(e,t,a={}){this._hass.callService("media_player",t,{entity_id:e,...a})}_handleVolumeChange(e,t){const a=t.currentTarget.getBoundingClientRect(),r=Math.max(0,Math.min(1,(t.clientX-a.left)/a.width));this._handleMediaService(e,"volume_set",{volume_level:Math.round(100*r)/100})}_renderMediaPanel(t){const{player:a,sensors:r,controls:i,remotes:s}=this._partitionMediaEntities(t.entities),n=this._shortDeviceName(t.device)||"Media";if(0===a.length)return"";const o=a[0],l=o.state,c=l?.attributes||{},d=l?.state||"unavailable",p=(0,J.uT)(d),u=this._getMediaTransportSymbol(d),m="playing"===d,h=!(m||"paused"===d),v=c.entity_picture,f=this._isValidArtworkUrl(v),g=c.media_title||"",b=c.media_artist||"",y=c.source||"",w=null!=c.volume_level?Number(c.volume_level):0,_=c.is_volume_muted||!1,x=(c.source_list,c.supported_features||0),$=!!(16&x),k=!!(32&x),S=!!(4&x),C=!!(32768&x),E=!!(262144&x),z=c.shuffle||!1,A=c.repeat||"off";return e.qy`
        <div class="lcars-device-panel media-panel ${h?"media-idle":""}" data-panel-type="media"
          style="--panel-frame-color:var(--lcars-african-violet)">
          <!-- Header -->
          <div class="media-header">
            <span class="device-panel-name">${n}</span>
            <div class="device-panel-header-line"></div>
            <span class="media-state-badge" style="color:${p}">${u} ${d.toUpperCase()}</span>
            <span class="panel-numeric-code" aria-hidden="true">${this._generatePanelCode(o.entity.entity_id)}</span>
          </div>

          <!-- Metadata (left) -->
          <div class="media-metadata" role="list" aria-label="${n} info">
            ${y?e.qy`
              <div class="device-sensor-line" role="listitem">
                <div class="sensor-indicator" style="background:var(--lcars-african-violet)"></div>
                <span class="sensor-label">Source</span>
                <span class="sensor-state-value">${y}</span>
              </div>
            `:""}
            ${C?e.qy`
              <div class="device-sensor-line" role="listitem">
                <div class="sensor-indicator" style="background:${z?"var(--lcars-african-violet)":"var(--lcars-gray)"}"></div>
                <span class="sensor-label">Shuffle</span>
                <span class="sensor-state-value">${z?"ON":"OFF"}</span>
              </div>
            `:""}
            ${E?e.qy`
              <div class="device-sensor-line" role="listitem">
                <div class="sensor-indicator" style="background:${"off"!==A?"var(--lcars-african-violet)":"var(--lcars-gray)"}"></div>
                <span class="sensor-label">Repeat</span>
                <span class="sensor-state-value">${A.toUpperCase()}</span>
              </div>
            `:""}
            ${r.map(({entity:t,state:a})=>{const r=this._friendlyName(a,t),i=this._getSensorIndicatorColor(a);return e.qy`
                <div class="device-sensor-line" tabindex="0" role="listitem"
                  @click=${()=>this._handleEntityClick(t.entity_id)}
                  @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._handleEntityClick(t.entity_id))}}>
                  <div class="sensor-indicator" style="background:${i}"></div>
                  <span class="sensor-label">${r}</span>
                  <span class="sensor-state-value" style="color:${i}">${a.state}</span>
                </div>
              `})}
          </div>

          <!-- Viewscreen (right) -->
          <div class="media-viewscreen ${m?"media-viewscreen-glow":""}" @click=${()=>this._handleEntityClick(o.entity.entity_id)}>
            ${f&&!h?e.qy`
              <img class="media-art" src="${v}" alt="Album art"
                crossorigin="anonymous" referrerpolicy="no-referrer" loading="lazy"
                @error=${e=>{e.target.style.display="none"}} />
            `:e.qy`
              <div class="media-idle-display">
                <span class="media-idle-glyph">&#9834;</span>
                <span class="media-idle-label">STANDBY</span>
              </div>
            `}
            ${h?"":e.qy`
              <div class="media-now-playing">
                ${g?e.qy`<div class="media-title">${g}</div>`:""}
                ${b?e.qy`<div class="media-artist">${b}</div>`:""}
              </div>
            `}
          </div>

          <!-- Audio Waveform (12 bars, 4 groups — Data C-1/C-2) -->
          <div class="lcars-audio-waveform" ?data-paused=${!m} aria-hidden="true">
            ${Array.from({length:12},(t,a)=>{const r=Math.floor(a/3),i=[380,420,350,460][r],s=50*a,n=2===a||8===a;return e.qy`<div class="bar ${n?"peak":""}"
                style="--bar-dur:${i+a%3*30}ms;--bar-delay:${s}ms;--bar-min-ratio:${.1+.05*r}"></div>`})}
          </div>

          <!-- Transport + Volume (bottom) -->
          <div class="media-controls">
            <div class="media-transport" aria-label="Transport controls">
              ${C?e.qy`
                <button class="media-transport-btn" aria-pressed="${z}" title="Shuffle"
                  @click=${()=>this._handleMediaService(o.entity.entity_id,"shuffle_set",{shuffle:!z})}>⇄</button>
              `:""}
              ${$?e.qy`
                <button class="media-transport-btn" title="Previous"
                  @click=${()=>this._handleMediaService(o.entity.entity_id,"media_previous_track")}>⏮</button>
              `:""}
              <button class="media-transport-btn media-play-btn" title="${m?"Pause":"Play"}"
                @click=${()=>this._handleMediaService(o.entity.entity_id,m?"media_pause":"media_play")}>
                ${m?"❚❚":"▶"}
              </button>
              ${k?e.qy`
                <button class="media-transport-btn" title="Next"
                  @click=${()=>this._handleMediaService(o.entity.entity_id,"media_next_track")}>⏭</button>
              `:""}
              ${E?e.qy`
                <button class="media-transport-btn" aria-pressed="${"off"!==A}" title="Repeat: ${A}"
                  @click=${()=>this._handleMediaService(o.entity.entity_id,"repeat_set",{repeat:"off"===A?"all":"all"===A?"one":"off"})}>🔁</button>
              `:""}
            </div>
            ${S?e.qy`
              <div class="media-volume" aria-label="Volume: ${Math.round(100*w)}%">
                <button class="media-mute-btn" aria-pressed="${_}" title="${_?"Unmute":"Mute"}"
                  @click=${()=>this._handleMediaService(o.entity.entity_id,"volume_mute",{is_volume_muted:!_})}>
                  ${_?"🔇":"🔊"}
                </button>
                <div class="media-volume-bar" tabindex="0" role="slider"
                  aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(100*w)}"
                  @click=${e=>this._handleVolumeChange(o.entity.entity_id,e)}
                  @keydown=${e=>{"ArrowRight"===e.key&&(e.preventDefault(),this._handleMediaService(o.entity.entity_id,"volume_set",{volume_level:Math.min(1,w+.05)})),"ArrowLeft"===e.key&&(e.preventDefault(),this._handleMediaService(o.entity.entity_id,"volume_set",{volume_level:Math.max(0,w-.05)}))}}>
                  <div class="media-volume-fill" style="width:${Math.round(100*w)}%"></div>
                </div>
                <span class="media-volume-pct">${Math.round(100*w)}%</span>
              </div>
            `:""}
          </div>
        </div>
      `}_partitionPoolEntities(e){const t=[],a=[],r=[],i=[],s=[],n=[],o=[],l=[],c=/orp|ph_|salt|tds|saturation|calcium|alkalinity|cyanuric/i;for(const d of e){const e=d.entity.entity_id,p=d.domain,u=d.state?.attributes||{};if("climate"!==p)if("light"!==p)if("sensor"===p&&c.test(e))r.push(d);else if("switch"!==p){if("sensor"===p&&"temperature"===(u.device_class||"")){o.push(d);continue}l.push(d)}else/pump/i.test(e)?i.push(d):s.push(d);else n.push(d);else/spa/i.test(e)?a.push(d):t.push(d)}return{pool:t,spa:a,chemistry:r,pumps:i,circuits:s,lights:n,environmental:o,diagnostics:l}}_handlePoolSetpoint(e,t,a){const r=ee(a,t,{min:40,max:104});this._poolSetpointDebouncer||(this._poolSetpointDebouncer=re((e,t)=>{this._hass.callService("climate","set_temperature",{entity_id:e,temperature:t})},1500)),this._poolSetpointDebouncer.call(e,r)}_renderPoolBody(t,a,r){if(0===t.length)return"";const i=t[0],s=i.state,n=s?.attributes||{},o=null!=n.current_temperature?Number(n.current_temperature):null,l=null!=n.temperature?Number(n.temperature):null,c=n.hvac_action||"off",d=(0,J.qW)(c,a),p="spa"===a?"SPA":"POOL";return e.qy`
        <div class="pool-body-frame" style="--body-color:${d}" role="region"
          aria-label="${p}: ${null!=o?o+"°":"N/A"}, target ${l||"N/A"}°">
          <div class="pool-body-label" style="color:${d}">${p}</div>
          <div class="pool-body-temp">${null!=o?`${Math.round(o)}°`:"—"}</div>
          ${null!=l?e.qy`
            <div class="pool-setpoint-row">
              <button class="climate-sp-btn" aria-label="Decrease ${p} target"
                @click=${()=>this._handlePoolSetpoint(i.entity.entity_id,n,l-(r||1))}>−</button>
              <span class="pool-target" style="color:${d}">${l}°</span>
              <button class="climate-sp-btn" aria-label="Increase ${p} target"
                @click=${()=>this._handlePoolSetpoint(i.entity.entity_id,n,l+(r||1))}>+</button>
            </div>
          `:""}
          <div class="panel-pip-strip" aria-hidden="true"></div>
        </div>
      `}_renderPoolSpaPanel(t){const{pool:a,spa:r,chemistry:i,pumps:s,circuits:n,lights:o,environmental:l,diagnostics:c}=this._partitionPoolEntities(t.entities),d=this._shortDeviceName(t.device)||"Pool & Spa",p=i.length>0,u=a[0]?.state?.attributes?.current_temperature,m=r[0]?.state?.attributes?.current_temperature,h=l.find(e=>/air/i.test(e.entity.entity_id)),v=h?.state?.state;return e.qy`
        <div class="lcars-device-panel pool-panel ${p?"":"pool-no-chem"}" data-panel-type="aquatics"
          style="--panel-frame-color:var(--lcars-bluey)">
          <!-- Header -->
          <div class="pool-header">
            <span class="device-panel-name">${d}</span>
            <div class="device-panel-header-line"></div>
            ${null!=u?e.qy`<span class="pool-temp-badge" style="color:var(--lcars-ice)">POOL ${Math.round(u)}°</span>`:""}
            ${null!=m?e.qy`<span class="pool-temp-badge" style="color:var(--lcars-butterscotch)">SPA ${Math.round(m)}°</span>`:""}
            ${null!=v?e.qy`<span class="pool-temp-badge" style="color:var(--lcars-space-white)">AIR ${Math.round(Number(v))}°</span>`:""}
            <span class="panel-numeric-code" aria-hidden="true">${this._generatePanelCode(a[0]?.entity?.entity_id||r[0]?.entity?.entity_id||t.device.id)}</span>
          </div>

          <!-- Chemistry (left, conditional) -->
          ${p?e.qy`
            <div class="pool-chemistry" role="list" aria-label="Water chemistry">
              ${i.map(({entity:t,state:a})=>{const r=this._friendlyName(a,t),i=a.state,s=a.attributes?.unit_of_measurement||"",n=this._getSensorIndicatorColor(a);return e.qy`
                  <div class="device-sensor-line" tabindex="0" role="listitem"
                    aria-label="${r}: ${i}${s?" "+s:""}"
                    @click=${()=>this._handleEntityClick(t.entity_id)}
                    @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._handleEntityClick(t.entity_id))}}>
                    <div class="sensor-indicator" style="background:${n}"></div>
                    <span class="sensor-label">${r}</span>
                    <span class="sensor-state-value" style="color:${n}">${i}${s?" "+s:""}</span>
                  </div>
                `})}
            </div>
          `:""}

          <!-- Aquatics (center) -->
          <div class="pool-aquatics">
            ${this._renderPoolBody(a,"pool",1)}
            ${this._renderPoolBody(r,"spa",1)}
          </div>

          <!-- Controls (right) -->
          <div class="pool-controls" aria-label="Circuit controls">
            ${[...s,...n].map(({entity:t,state:a},r)=>{const i=this._friendlyName(a,t),n="on"===a.state,o=0===r&&s.length>0&&t.entity_id===s[0].entity.entity_id;return e.qy`
                <button class="device-control-btn" role="switch" aria-checked="${n}" ?data-on=${n}
                  @click=${()=>this._handleToggle(t.entity_id)}
                  title="${i}: ${a.state}">
                  ${o?e.qy`
                    <div class="lcars-pump-spinner ${n?"on":""}" aria-hidden="true">
                      <div class="dot"></div><div class="dot"></div><div class="dot"></div>
                    </div>
                  `:e.qy`<ha-icon .icon=${this._getEntityIcon(a)}></ha-icon>`}
                  <span>${i}</span>
                </button>
              `})}
            ${l.map(({entity:t,state:a})=>{const r=this._friendlyName(a,t),i=a.attributes?.unit_of_measurement||"";return e.qy`
                <div class="device-sensor-line" tabindex="0" role="listitem"
                  @click=${()=>this._handleEntityClick(t.entity_id)}>
                  <div class="sensor-indicator" style="background:var(--lcars-data-accent)"></div>
                  <span class="sensor-label">${r}</span>
                  <span class="sensor-state-value">${a.state}${i?" "+i:""}</span>
                </div>
              `})}
          </div>

          <!-- Lighting (bottom, full width) -->
          ${o.length>0?e.qy`
            <div class="pool-lighting" aria-label="Pool lighting">
              ${o.map(({entity:t,state:a})=>{const r=this._friendlyName(a,t),i="on"===a.state;return e.qy`
                  <button class="device-control-btn" role="switch" aria-checked="${i}" ?data-on=${i}
                    @click=${()=>this._handleToggle(t.entity_id)}
                    title="${r}: ${a.state}">
                    <ha-icon .icon=${this._getEntityIcon(a)}></ha-icon>
                    <span>${r}</span>
                  </button>
                `})}
            </div>
          `:""}
          <div class="panel-pip-strip" aria-hidden="true"></div>
        </div>
      `}_weatherForecastCache={};_getWeatherGlyph(e){return{sunny:"☀","clear-night":"●",partlycloudy:"◑",cloudy:"◔",fog:"≡",rainy:"▽",pouring:"▼",snowy:"✦","snowy-rainy":"◆",hail:"◆",windy:"〰","windy-variant":"〰",lightning:"⚡","lightning-rainy":"⚡",exceptional:"⚠"}[e]||"○"}_getWindCardinal(e){return null==e?"":["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"][Math.round(e/22.5)%16]}_partitionWeatherEntities(e){const t=[],a=[],r=[],i=[],s=[],n=[];for(const o of e){if("weather"===o.domain){t.push(o);continue}const e=o.entity.entity_id,l=o.state?.attributes?.device_class||"";/lightning/i.test(e)?r.push(o):"precipitation"===l||"precipitation_intensity"===l||/rain/i.test(e)?i.push(o):"wind_speed"===l||/wind/i.test(e)?s.push(o):A.has(o.domain)?a.push(o):n.push(o)}return{weather:t,sensors:a,lightning:r,precipitation:i,wind:s,diagnostics:n}}_renderWindCompass(t,a,r){if(null==t)return"";const i=this._getWindCardinal(t),s=t;return e.qy`
        <div class="weather-wind-compass" role="img"
          aria-label="Wind: ${a||"?"} ${r||"mph"} from ${i}">
          <svg viewBox="0 0 80 80" class="wind-svg">
            <circle cx="40" cy="40" r="28" fill="none" stroke="var(--lcars-disabled)" stroke-width="1" />
            <text x="40" y="12" text-anchor="middle" fill="var(--lcars-data-accent)" font-size="7" font-family="var(--lcars-font)">N</text>
            <text x="40" y="76" text-anchor="middle" fill="var(--lcars-data-accent)" font-size="7" font-family="var(--lcars-font)">S</text>
            <text x="8" y="43" text-anchor="middle" fill="var(--lcars-data-accent)" font-size="7" font-family="var(--lcars-font)">W</text>
            <text x="72" y="43" text-anchor="middle" fill="var(--lcars-data-accent)" font-size="7" font-family="var(--lcars-font)">E</text>
            <g transform="rotate(${s}, 40, 40)">
              <line x1="40" y1="55" x2="40" y2="18" stroke="var(--lcars-ice)" stroke-width="2" />
              <polygon points="40,15 36,24 44,24" fill="var(--lcars-ice)" />
            </g>
          </svg>
          <div class="wind-reading">${a||"—"} ${r||""} ${i}</div>
        </div>
      `}async _loadWeatherForecast(e){if(this._weatherForecastCache[e])return;const t=await ne(this._hass,e,"daily");t.length>0&&(this._weatherForecastCache[e]=t,this.requestUpdate())}_renderForecastStrip(t){if(!t?.length)return"";const a=t.slice(0,7),r=a.map(e=>e.temperature).filter(Number.isFinite),i=a.map(e=>e.templow).filter(Number.isFinite),s=Math.min(...i,...r),n=Math.max(...r,...i)-s||1;return e.qy`
        <div class="weather-forecast" role="list" aria-label="7-day forecast">
          ${a.map(t=>{const a=new Date(t.datetime).toLocaleDateString("en",{weekday:"short"}).toUpperCase(),r=t.temperature,i=t.templow,o=t.condition,l=this._getWeatherGlyph(o),c=(0,J.JQ)(o),d=t.precipitation_probability,p=(i-s)/n*100,u=(r-i||1)/n*100;return e.qy`
              <div class="forecast-tile" role="listitem" tabindex="0"
                aria-label="${a}: ${o}, high ${r}°, low ${i}°${null!=d?`, ${d}% precipitation`:""}">
                <span class="forecast-day">${a}</span>
                <span class="forecast-glyph" style="color:${c}">${l}</span>
                <span class="forecast-hi">${null!=r?Math.round(r):"—"}°</span>
                <div class="forecast-range-bar">
                  <div class="forecast-range-fill" style="left:${p.toFixed(1)}%;width:${u.toFixed(1)}%"></div>
                </div>
                <span class="forecast-lo">${null!=i?Math.round(i):"—"}°</span>
                ${null!=d?e.qy`<span class="forecast-precip" style="color:${d>50?"var(--lcars-sky)":"var(--lcars-gray)"}">${d}%</span>`:""}
              </div>
            `})}
        </div>
      `}_renderWeatherPanel(t){const{weather:a,sensors:r,lightning:i,precipitation:s,wind:n,diagnostics:o}=this._partitionWeatherEntities(t.entities),l=this._shortDeviceName(t.device)||"Weather";if(0===a.length)return"";const c=a[0],d=c.state,p=d?.attributes||{},u=d?.state||"unavailable",m=(0,J.JQ)(u),h=this._getWeatherGlyph(u),v=p.temperature,f=p.humidity,g=p.pressure,b=p.wind_speed,y=p.wind_bearing,w=p.wind_speed_unit||"mph";this._loadWeatherForecast(c.entity.entity_id);const _=this._weatherForecastCache[c.entity.entity_id];return e.qy`
        <div class="lcars-device-panel weather-panel" data-panel-type="weather"
          style="--panel-frame-color:${m}">
          <!-- Header -->
          <div class="weather-header">
            <span class="device-panel-name">${l}</span>
            <div class="device-panel-header-line"></div>
            <span class="weather-condition-badge" style="color:${m}">
              ${h} ${u.toUpperCase().replace(/[_-]/g," ")}
            </span>
            <span class="panel-numeric-code" aria-hidden="true">${this._generatePanelCode(c.entity.entity_id)}</span>
          </div>

          <!-- Sensors (left) -->
          <div class="weather-sensors" role="list" aria-label="${l} readings">
            ${null!=f?e.qy`
              <div class="device-sensor-line" role="listitem" aria-label="Humidity: ${f}%">
                <div class="sensor-indicator" style="background:var(--lcars-ice)"></div>
                <span class="sensor-label">Humidity</span>
                <span class="sensor-state-value" style="color:var(--lcars-ice)">${f}%</span>
              </div>
            `:""}
            ${null!=g?e.qy`
              <div class="device-sensor-line" role="listitem" aria-label="Pressure: ${g}">
                <div class="sensor-indicator" style="background:var(--lcars-data-accent)"></div>
                <span class="sensor-label">Pressure</span>
                <span class="sensor-state-value">${g}</span>
              </div>
            `:""}
            ${i.map(({entity:t,state:a})=>{const r=this._friendlyName(a,t),i=a.attributes?.unit_of_measurement||"";return e.qy`
                <div class="device-sensor-line" tabindex="0" role="listitem"
                  aria-label="${r}: ${a.state}${i?" "+i:""}"
                  @click=${()=>this._handleEntityClick(t.entity_id)}>
                  <div class="sensor-indicator" style="background:var(--lcars-gold)"></div>
                  <span class="sensor-label">${r}</span>
                  <span class="sensor-state-value" style="color:var(--lcars-gold)">${a.state}${i?" "+i:""}</span>
                </div>
              `})}
            ${s.map(({entity:t,state:a})=>{const r=this._friendlyName(a,t),i=a.attributes?.unit_of_measurement||"";return e.qy`
                <div class="device-sensor-line" tabindex="0" role="listitem"
                  aria-label="${r}: ${a.state}${i?" "+i:""}"
                  @click=${()=>this._handleEntityClick(t.entity_id)}>
                  <div class="sensor-indicator" style="background:var(--lcars-sky)"></div>
                  <span class="sensor-label">${r}</span>
                  <span class="sensor-state-value" style="color:var(--lcars-sky)">${a.state}${i?" "+i:""}</span>
                </div>
              `})}
            ${r.map(({entity:t,state:a})=>{const r=this._friendlyName(a,t),i=a.attributes?.unit_of_measurement||"",s=this._getSensorIndicatorColor(a);return e.qy`
                <div class="device-sensor-line" tabindex="0" role="listitem"
                  aria-label="${r}: ${a.state}${i?" "+i:""}"
                  @click=${()=>this._handleEntityClick(t.entity_id)}
                  @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._handleEntityClick(t.entity_id))}}>
                  <div class="sensor-indicator" style="background:${s}"></div>
                  <span class="sensor-label">${r}</span>
                  <span class="sensor-state-value" style="color:${s}">${a.state}${i?" "+i:""}</span>
                </div>
              `})}
          </div>

          <!-- Viewscreen (right) -->
          <div class="weather-viewscreen" role="img"
            aria-label="${u}: ${null!=v?v+"°":"N/A"}">
            <svg class="weather-display" viewBox="0 0 200 160">
              <text x="100" y="35" text-anchor="middle" fill="${m}"
                font-family="var(--lcars-font)" font-size="28">${h}</text>
              <text x="100" y="85" text-anchor="middle" fill="${m}"
                font-family="var(--lcars-font)" font-size="48" font-weight="bold">
                ${null!=v?`${Math.round(v)}°`:"—"}
              </text>
              <text x="100" y="108" text-anchor="middle" fill="var(--lcars-data-accent)"
                font-family="var(--lcars-font)" font-size="12">
                ${u.toUpperCase().replace(/[_-]/g," ")}
              </text>
            </svg>
            ${this._renderWindCompass(y,b,w)}
          </div>

          <!-- Forecast (bottom) -->
          ${this._renderForecastStrip(_)}
          <div class="panel-pip-strip" aria-hidden="true"></div>
        </div>
      `}_irrigationLimiter=ae(5,1e4);_partitionIrrigationEntities(e){const t=[],a=[],r=[];for(const i of e){const e=i.domain,s=i.entity.entity_id,n=i.state?.attributes||{};"switch"!==e?"binary_sensor"!==e||r.some(e=>!0)?a.push(i):r.push(i):null!=n.zone_number||/zone/i.test(s)?t.push(i):r.push(i)}return t.sort((e,t)=>(e.state?.attributes?.zone_number??999)-(t.state?.attributes?.zone_number??999)),{zones:t,sensors:a,controller:r}}_handleIrrigationZone(e,t){this._irrigationLimiter.allow()&&this._hass.callService("switch",t?"turn_on":"turn_off",{entity_id:e})}_renderIrrigationPanel(t){return e.qy`
        <lcars-irrigation-panel
          .group=${t}
          .hass=${this._hass}
          .editMode=${this._editMode}
          area-id="${this.selectedArea||""}">
        </lcars-irrigation-panel>
      `}_powerToggleLimiter=ae(10,1e4);_formatWatts(e){if(null==e)return"—";const t=Number(e);return Number.isFinite(t)?Math.abs(t)>=1e4?`${(t/1e3).toFixed(1)} kW`:`${Math.round(t)} W`:"—"}_formatEnergy(e){if(null==e)return"—";const t=Number(e);return Number.isFinite(t)?`${t.toFixed(1)} kWh`:"—"}_getPowerIndicator(e){if(null==e||isNaN(e))return"✕";const t=Math.abs(Number(e));return t<=0?"○":t<=500?"●":t<=1500?"●━":t<=3e3?"●━━":"●━━━"}_partitionPowerEntities(e){const t=[],a=[],r=[],i=[],s=[],n=[];for(const o of e){if(o.disabled_by||o.hidden_by)continue;const e=o.entity?.entity_id?.split(".")[0]||o.domain,l=o.state?.attributes?.device_class||"",c=o.state?.attributes?.unit_of_measurement||"";"switch"===e?t.push(o):"power"!==l||"W"!==c&&"kW"!==c?"energy"!==l||"kWh"!==c&&"Wh"!==c?"voltage"===l&&"V"===c?i.push(o):"current"===l&&"A"===c?s.push(o):n.push(o):r.push(o):a.push(o)}return{switches:t,powerSensors:a,energySensors:r,voltageSensors:i,currentSensors:s,diagnostics:n}}_classifyPowerDevice(e,t){if(!e.some(e=>{const t=e.state?.attributes?.device_class||"";return"sensor"===e.domain&&("power"===t||"energy"===t||"voltage"===t||"current"===t)}))return null;const a=e.some(e=>"switch"===e.domain),r=(t?.manufacturer||"").toLowerCase(),i=(t?.model||"").toLowerCase();return r.includes("emporia")||i.includes("vue")?"vue":e.filter(e=>"switch"===e.domain).length>=4||i.includes("hs300")||i.includes("power strip")?"strip":a?"plug":"vue"}_getPrimaryPower(e){for(const t of e.entities){const e=t.state?.attributes?.device_class||"",a=t.state?.attributes?.unit_of_measurement||"";if("power"===e&&("W"===a||"kW"===a)){const e=parseFloat(t.state?.state);if(!isNaN(e))return"kW"===a?1e3*e:e}}return null}_getPrimaryEnergy(e){for(const t of e.entities){const e=t.state?.attributes?.device_class||"",a=t.state?.attributes?.unit_of_measurement||"";if("energy"===e&&("kWh"===a||"Wh"===a)){const e=parseFloat(t.state?.state);if(!isNaN(e))return"Wh"===a?e/1e3:e}}return null}_detect240VPairs(e){const t=/^(.+?)[\s_]*(l[12]|line[\s_]*[12])$/i,a=new Map,r=[];for(const i of e){const e=(this._shortDeviceName(i.device)||"").match(t);if(e){const t=e[1].trim();a.has(t)||a.set(t,[]),a.get(t).push(i)}else r.push(i)}const i=[...r];for(const[e,t]of a)if(2===t.length){const a=t.reduce((e,t)=>e+(this._getPrimaryPower(t)||0),0),r=t.reduce((e,t)=>e+(this._getPrimaryEnergy(t)||0),0);i.push({device:{...t[0].device,name:e},entities:t.flatMap(e=>e.entities),is240V:!0,combinedWatts:a,combinedEnergy:r})}else i.push(...t);return i}_sortCircuits(e){return[...e].sort((e,t)=>{const a=null!=e.combinedWatts?e.combinedWatts:this._getPrimaryPower(e)||0,r=null!=t.combinedWatts?t.combinedWatts:this._getPrimaryPower(t)||0;if(r!==a)return r-a;const i=(e.device?.name||"").toLowerCase(),s=(t.device?.name||"").toLowerCase();return i.localeCompare(s)})}_groupPowerStrips(e){const t=new Map,a=[];for(const a of e)"strip"===a.subType&&t.set(a.device.id,{parent:a,children:[]});for(const r of e)if("strip"!==r.subType){if(r.device?.via_device_id){const e=t.get(r.device.via_device_id);if(e){e.children.push(r);continue}}a.push(r)}return{strips:t,standalone:a}}_renderPowerArc(a,r){if(!a.length||!r||r<=0)return"";const i=this._config?.power_thresholds||{},s=a.map(e=>({name:this._shortDeviceName(e.device)||"Unknown",watts:null!=e.combinedWatts?e.combinedWatts:this._getPrimaryPower(e)||0})).filter(e=>e.watts>0).sort((e,t)=>t.watts-e.watts);if(0===s.length)return"";const n=s.slice(0,5),o=s.slice(5).reduce((e,t)=>e+t.watts,0);o>0&&n.push({name:"OTHER",watts:o});const l=120,c=100,d=80,p=Math.PI,u=Math.PI;let m=p;const h=n.map(e=>{const t=e.watts/r,a=Math.max(t*u-.02,.01),s=m-a,n=(0,J.XI)(e.watts,i),o=l+d*Math.cos(m),p=c-d*Math.sin(m),h=l+d*Math.cos(s),v=c-d*Math.sin(s),f=a>Math.PI?1:0,g=`M ${o.toFixed(1)},${p.toFixed(1)} A 80,80 0 ${f},1 ${h.toFixed(1)},${v.toFixed(1)}`;return m=s-.02,{path:g,color:n,name:e.name,watts:e.watts,fraction:t}});return e.qy`
        <div class="power-arc-area">
          <svg class="power-distribution-arc" viewBox="0 0 240 120"
            role="img" aria-label="Power distribution: ${this._formatWatts(r)} total">
            <!-- Background arc -->
            <path d="M ${40},${c} A ${d},${d} 0 1,1 ${200},${c}"
              fill="none" stroke="var(--lcars-gray)" stroke-width="10"
              stroke-linecap="butt" opacity="0.15" />
            <!-- Segments -->
            ${h.map(e=>t.JW`
              <path d="${e.path}" fill="none" stroke="${e.color}"
                stroke-width="10" stroke-linecap="butt">
                <title>${e.name}: ${Math.round(e.watts)}W (${Math.round(100*e.fraction)}%)</title>
              </path>
            `)}
            <!-- Total text -->
            <text x="${l}" y="${85}" text-anchor="middle"
              fill="var(--lcars-text-heading)" font-family="var(--lcars-font)"
              font-size="28" font-weight="bold">
              ${this._formatWatts(r)}
            </text>
            <text x="${l}" y="${105}" text-anchor="middle"
              fill="var(--lcars-space-white)" font-family="var(--lcars-font)"
              font-size="10" opacity="0.7">
              TOTAL
            </text>
          </svg>
        </div>
      `}_showCircuitPopover(a){const r=this.shadowRoot?.querySelector("#power-detail-popover");if(!r)return;const s=null!=a.combinedWatts?a.combinedWatts:this._getPrimaryPower(a),n=null!=a.combinedEnergy?a.combinedEnergy:this._getPrimaryEnergy(a),o=this._config?.power_thresholds||{},l=(0,J.XI)(s,o),c=(0,J.IO)(s,o),d=this._shortDeviceName(a.device)||"Unknown",p=a.entities?.[0]?.entity?.entity_id,u=r.querySelector(".popover-content");u&&(0,t.XX)(e.qy`
          <div>
            <div class="popover-header">
              <span class="popover-title">${d}</span>
              <span class="popover-status" style="color:${l}">${c}</span>
            </div>
            <div class="popover-hero-value" style="color:${l}">
              ${null!=s?this._formatWatts(s):"UNAVAILABLE"}
            </div>
            <div class="popover-stats">
              ${null!=n?e.qy`
                <div class="popover-stat-row">
                  <span class="popover-stat-label">TODAY</span>
                  <span class="popover-stat-value">${this._formatEnergy(n)}</span>
                </div>
              `:""}
              ${a.is240V?e.qy`
                <div class="popover-stat-row">
                  <span class="popover-stat-label">CIRCUIT TYPE</span>
                  <span class="popover-stat-value" style="color:var(--lcars-butterscotch)">240V PAIRED</span>
                </div>
              `:""}
            </div>
            ${p?e.qy`
              <button class="popover-history-btn" @click=${()=>{(0,i.Hv)(p);try{r.hidePopover()}catch(e){}}}>VIEW FULL HISTORY</button>
            `:""}
          </div>
        `,u);try{r.showPopover()}catch(e){p&&(0,i.Hv)(p)}}_renderCircuitTile(t){const a=null!=t.combinedWatts?t.combinedWatts:this._getPrimaryPower(t),r=null!=t.combinedEnergy?t.combinedEnergy:this._getPrimaryEnergy(t),s=this._config?.power_thresholds||{},n=(0,J.XI)(a,s),o=(0,J.IO)(a,s),l=this._getPowerIndicator(a),c=this._shortDeviceName(t.device)||"Unknown",d="function"==typeof HTMLElement.prototype.showPopover,{powerSensors:p,energySensors:u}=this._partitionPowerEntities(t.entities||[]),m=p[0]?.entity?.entity_id,h=u[0]?.entity?.entity_id;return e.qy`
        <div class="power-circuit-tile"
          style="--circuit-color:${n}"
          role="listitem"
          tabindex="0"
          aria-label="${c}: ${null!=a?Math.round(a)+" watts, "+o.toLowerCase():"unavailable"}${null!=r?", "+r.toFixed(1)+" kilowatt hours today":""}"
          @click=${()=>d?this._showCircuitPopover(t):(0,i.Hv)(t.entities?.[0]?.entity?.entity_id)}
          @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),d?this._showCircuitPopover(t):(0,i.Hv)(t.entities?.[0]?.entity?.entity_id))}}>
          <div class="power-circuit-name">
            <span class="power-circuit-indicator" aria-hidden="true">${t.is240V?"●●":l}</span>
            <span>${c}</span>
          </div>
          <div class="power-circuit-value-row">
            ${this._renderClickableValue(m,`View ${c} power: ${null!=a?Math.round(a)+" watts":"unavailable"}`,e.qy`<span class="power-circuit-watts">${this._formatWatts(a)}</span>`)}
          </div>
          ${null!=r?this._renderClickableValue(h,`View ${c} energy: ${r.toFixed(1)} kWh today`,e.qy`<span class="power-circuit-energy">${this._formatEnergy(r)} TODAY</span>`):""}
        </div>
      `}_renderPowerDeviceRow(t){const{switches:a,powerSensors:r,energySensors:i}=this._partitionPowerEntities(t.entities),s=a[0],n=r[0]?parseFloat(r[0].state?.state)||0:null,o=i[0]&&parseFloat(i[0].state?.state)||null,l=this._config?.power_thresholds||{},c=(0,J.XI)(n,l),d=this._shortDeviceName(t.device)||"Unknown",p="on"===s?.state?.state,u=r[0]?.entity?.entity_id,m=i[0]?.entity?.entity_id;return e.qy`
        <div class="power-device-row"
          role="listitem" tabindex="0"
          style="--circuit-color:${c}"
          aria-label="${d}: ${s?(p?"on":"off")+", ":""}${null!=n?Math.round(n)+" watts":"unknown"}">
          ${s?this._renderTrackToggle(p,`Toggle ${d}`,()=>{this._powerToggleLimiter.allow()&&this._handleToggle(s.entity.entity_id)}):""}
          <span class="power-device-name">${d}</span>
          <div class="power-device-stats">
            ${this._renderClickableValue(u,`View ${d} power: ${null!=n?Math.round(n)+" watts":"unknown"}`,e.qy`<span class="power-device-watts" style="color:${c}">${this._formatWatts(n)}</span>`)}
            ${null!=o?this._renderClickableValue(m,`View ${d} energy: ${o.toFixed(1)} kWh`,e.qy`<span class="power-device-energy">${this._formatEnergy(o)}</span>`):""}
          </div>
        </div>
      `}_renderPowerStrip(t,a){const r=this._shortDeviceName(t.device)||"Power Strip",{powerSensors:i,switches:s}=this._partitionPowerEntities(t.entities),n=i.reduce((e,t)=>e+(parseFloat(t.state?.state)||0),0),o=this._config?.power_thresholds||{},l=(0,J.XI)(n,o),c=s[0];return e.qy`
        <div class="power-strip-block" role="listitem">
          <div class="power-strip-header" role="heading" aria-level="5">
            <span class="power-strip-name">${r}</span>
            ${c?this._renderTrackToggle("on"===c.state?.state,`Master toggle ${r}`,()=>{this._powerToggleLimiter.allow()&&this._handleToggle(c.entity.entity_id)}):""}
            <span class="power-strip-total" style="color:${l}">TOTAL: ${this._formatWatts(n)}</span>
          </div>
          <div class="power-strip-divider" aria-hidden="true"></div>
          <div class="power-strip-children" role="list" aria-label="${r} outlets">
            ${a.map(e=>this._renderStripChild(e,s))}
          </div>
        </div>
      `}_renderStripChild(t,a){const r=this._shortDeviceName(t.device)||"Outlet",{switches:i,powerSensors:s,energySensors:n}=this._partitionPowerEntities(t.entities),o=s[0]&&parseFloat(s[0].state?.state)||0,l=n[0]&&parseFloat(n[0].state?.state)||null,c=this._config?.power_thresholds||{},d=(0,J.XI)(o,c),p=s[0]?.entity?.entity_id,u=n[0]?.entity?.entity_id;let m=i[0];if(!m&&a?.length>0){const e=(t.device?.name||"").toLowerCase().replace(/[\s\-_]+/g,"");m=a.find(t=>{const a=(t.entity?.entity_id||"").toLowerCase().replace(/[\s\-_]+/g,""),r=(t.state?.attributes?.friendly_name||"").toLowerCase().replace(/[\s\-_]+/g,"");return a.includes(e)||r.includes(e)})}const h="on"===m?.state?.state;return e.qy`
        <div class="power-strip-child-tile" style="--tile-power-color:${d}"
          role="listitem" aria-label="${r}: ${h?"on":"off"}, ${Math.round(o)} watts">
          <span class="circuit-name">${r}</span>
          <div class="strip-child-controls">
            ${m?this._renderTrackToggle(h,`Toggle ${r}`,()=>{this._powerToggleLimiter.allow()&&this._handleToggle(m.entity.entity_id)}):""}
            ${this._renderClickableValue(p,`View ${r} power: ${Math.round(o)} watts`,e.qy`
              <span class="circuit-watts" style="color:${d}">
                <span class="power-dot" ?data-zero=${0===o} aria-hidden="true"></span>
                ${this._formatWatts(o)}
              </span>
            `)}
            ${null!=l?this._renderClickableValue(u,`View ${r} energy: ${l.toFixed(1)} kWh`,e.qy`<span class="power-device-energy">${this._formatEnergy(l)}</span>`):""}
          </div>
        </div>
      `}_renderPowerSummaryCard(t,a,r,i,s){const n=this._config?.power_thresholds||{},o="TOTAL USAGE"===t?(0,J.XI)(a,n):i;return e.qy`
        <div class="power-summary-card" role="status"
          style="--card-accent:${i}"
          aria-label="${t}: ${null!=a?Math.round(a)+" watts":"unavailable"}${null!=r?", "+r.toFixed(1)+" kilowatt hours today":""}"
          aria-live="polite">
          <span class="power-summary-label">
            <ha-icon icon="${s}" style="--mdc-icon-size:14px; vertical-align:middle; color:${i}"></ha-icon>
            ${t}
          </span>
          <span class="power-summary-value" style="color:${o}">
            ${this._formatWatts(a)}
          </span>
          ${null!=r?e.qy`
            <span class="power-summary-secondary">${this._formatEnergy(r)} TODAY</span>
          `:""}
        </div>
      `}_buildPowerCollection(e){const t=[],a=[],r=[];for(const i of e){const e=this._classifyPowerDevice(i.entities||[],i.device);"vue"===e?t.push(i):"strip"===e?r.push(i):a.push(i)}const i=new Set(r.map(e=>e.device?.id).filter(Boolean)),s=[],n=[];for(const e of r)e.device?.via_device_id&&i.has(e.device.via_device_id)?n.push(e):s.push({...e,subType:"strip"});const{strips:o,standalone:l}=this._groupPowerStrips([...s,...n,...a]),c=[];for(const[,e]of o)c.push({parent:e.parent,children:e.children||[]});const d=l,p=this._sortCircuits(this._detect240VPairs(t)),u=new Set;for(const{children:e}of c)for(const t of e)t.device?.id&&u.add(t.device.id);const m=/^(balance|total|main[s]?|net|whole[\s_-]?home)$/i,h=new Set;for(const e of p){const t=this._shortDeviceName(e.device)||"";m.test(t.trim())&&e.device?.id&&h.add(e.device.id)}const v=new Set;for(const t of e){const a=(t.device?.model||"").toLowerCase(),r=(t.device?.manufacturer||"").toLowerCase();(t.entities?.some(e=>"battery"===e.state?.attributes?.device_class||"sensor"===e.domain&&"battery"===(e.state?.attributes?.device_class||""))||a.includes("ups")||r.includes("ups")||r.includes("cyberpower")||r.includes("apc")||r.includes("tripp"))&&t.device?.id&&(e.some(e=>e!==t&&e.device?.via_device_id===t.device.id)&&v.add(t.device.id))}let f=0,g=0;for(const t of e){const e=t.device?.id;if(e&&h.has(e))continue;if(e&&v.has(e))continue;if(e&&u.has(e))continue;const a=this._getPrimaryPower(t),r=this._getPrimaryEnergy(t);null!=a&&(f+=a),null!=r&&(g+=r)}return{circuits:p,plugs:d,strips:c,totalWatts:f,totalEnergy:g||null,deviceCount:e.length}}_renderTrackToggle(t,a,r){return e.qy`
        <button class="lcars-track-toggle" ?data-on=${t}
          role="switch" aria-checked="${t}" aria-label="${a}"
          @click=${e=>{e.stopPropagation(),r()}}
          @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),r())}}>
          <span class="track-label">${t?"ON":"OFF"}</span>
          <span class="track-thumb" aria-hidden="true"></span>
        </button>
      `}_renderClickableValue(t,a,r){return t?e.qy`
        <span class="power-clickable-value"
          role="button" tabindex="0"
          aria-label="${a}"
          @click=${e=>{e.stopPropagation(),this._handleEntityClick(t)}}
          @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._handleEntityClick(t))}}>
          ${r}
        </span>
      `:r}_renderConsolidatedPowerArc(e){const t=[];for(const a of e.circuits)t.push({device:a.device,entities:a.entities,combinedWatts:null!=a.combinedWatts?a.combinedWatts:this._getPrimaryPower(a),combinedEnergy:a.combinedEnergy});for(const a of e.plugs)t.push({device:a.device,entities:a.entities,combinedWatts:this._getPrimaryPower(a)});for(const{parent:a}of e.strips)t.push({device:a.device,entities:a.entities,combinedWatts:this._getPrimaryPower(a)});return this._renderPowerArc(t,e.totalWatts)}_renderConsolidatedPowerPanel(t){const{circuits:a,plugs:r,strips:i,totalWatts:s,totalEnergy:n,deviceCount:o}=t,l=this._config?.power_thresholds||{},c=(0,J.XI)(s,l),d=null!=s&&Math.abs(s)>(l.highMax||3e3),p=a.length+r.length+i.length,u=[];a.length>0&&u.push(`${a.length} CIRCUIT${1!==a.length?"S":""}`),r.length>0&&u.push(`${r.length} DEVICE${1!==r.length?"S":""}`),i.length>0&&u.push(`${i.length} STRIP${1!==i.length?"S":""}`);const m=u.join(" · ")||"POWER SYSTEMS";this._expandedPowerSections=this._expandedPowerSections||new Set;const h=this._expandedPowerSections.has("circuits"),v=h?a:a.slice(0,12),f=a.length>12,g=this._expandedPowerSections.has("plugs"),b=g?r:r.slice(0,12),y=r.length>12;return e.qy`
        <div class="lcars-consolidated-power-panel" data-panel-type="power"
          data-alert="${d?"critical":""}"
          role="region" aria-label="Power Systems — ${m}">

          <!-- Header -->
          <div class="consolidated-power-header" role="heading" aria-level="3">
            <ha-icon icon="mdi:flash"></ha-icon>
            <span class="power-panel-name">POWER SYSTEMS</span>
            <div class="power-panel-header-line" aria-hidden="true"></div>
            <span class="power-panel-badge">${m}</span>
          </div>

          <!-- Summary -->
          <div class="power-summary" role="group" aria-label="Power Summary">
            ${this._renderPowerSummaryCard("TOTAL USAGE",s,n,c,"mdi:sigma")}
          </div>

          <!-- SVG Arc (when 3+ sources) -->
          ${p>=3?this._renderConsolidatedPowerArc(t):""}

          <!-- Circuits section -->
          ${a.length>0?e.qy`
            <div class="power-circuits-section">
              <div class="power-section-label" role="heading" aria-level="4">
                <span class="power-section-label-text">CIRCUITS</span>
                <div class="power-section-label-rule" aria-hidden="true"></div>
                <span class="power-section-label-count">${a.length}</span>
              </div>
              <div class="power-circuits" role="list" aria-label="Circuit monitors${f&&!h?", showing first 12, expandable":""}">
                ${v.map(e=>this._renderCircuitTile(e))}
              </div>
              ${f&&!h?e.qy`
                <button class="power-show-all-pill"
                  aria-label="Show all ${a.length} circuits"
                  @click=${()=>{this._expandedPowerSections.add("circuits"),this.requestUpdate()}}>
                  SHOW ALL (${a.length})
                </button>
              `:""}
            </div>
          `:""}

          <!-- Monitored Devices section -->
          ${r.length>0?e.qy`
            <div class="power-devices-section">
              <div class="power-section-label" role="heading" aria-level="4">
                <span class="power-section-label-text">MONITORED DEVICES</span>
                <div class="power-section-label-rule" aria-hidden="true"></div>
                <span class="power-section-label-count">${r.length}</span>
              </div>
              <div class="power-devices" role="list" aria-label="Monitored devices${y&&!g?", showing first 12, expandable":""}">
                ${b.map(e=>this._renderPowerDeviceRow(e))}
              </div>
              ${y&&!g?e.qy`
                <button class="power-show-all-pill"
                  aria-label="Show all ${r.length} devices"
                  @click=${()=>{this._expandedPowerSections.add("plugs"),this.requestUpdate()}}>
                  SHOW ALL (${r.length})
                </button>
              `:""}
            </div>
          `:""}

          <!-- Power Strips section -->
          ${i.length>0?e.qy`
            <div class="power-strips-section">
              <div class="power-section-label" role="heading" aria-level="4">
                <span class="power-section-label-text">POWER STRIPS</span>
                <div class="power-section-label-rule" aria-hidden="true"></div>
                <span class="power-section-label-count">${i.length}</span>
              </div>
              <div class="power-strips" role="list" aria-label="Power strips">
                ${i.map(({parent:e,children:t})=>this._renderPowerStrip(e,t))}
              </div>
            </div>
          `:""}

          <!-- Singleton popover element -->
          <div popover id="power-detail-popover" class="power-detail-popover"
            role="dialog" aria-label="Circuit detail">
            <div class="popover-content"></div>
          </div>

          <div class="panel-pip-strip" aria-hidden="true"></div>
        </div>
      `}_renderPowerPanel(t){const a=t.entities||[],r=this._shortDeviceName(t.device)||"Power",i=this._config?.power_thresholds||{},s=this._classifyPowerDevice(a,t.device),{powerSensors:n,energySensors:o,switches:l}=this._partitionPowerEntities(a),c=this._getPrimaryPower(t),d=this._getPrimaryEnergy(t),p=(0,J.XI)(c,i),u=null!=c&&Math.abs(c)>(i.highMax||3e3),m="vue"===s?[t]:[],h=this._sortCircuits(this._detect240VPairs(m)),v=c||0,f=h.length>0,g=(l.length,"plug"===s),b="strip"===s;return e.qy`
        <div class="lcars-device-panel power-panel" data-panel-type="power"
          data-alert="${u?"critical":""}"
          role="region" aria-label="${r} Power Systems">

          <!-- Header -->
          <div class="power-panel-header" role="heading" aria-level="3">
            <ha-icon icon="mdi:flash"></ha-icon>
            <span class="power-panel-name">${r}</span>
            <div class="power-panel-header-line" aria-hidden="true"></div>
            <span class="power-panel-badge">POWER SYSTEMS</span>
            <span class="panel-numeric-code" aria-hidden="true">${this._generatePanelCode(a[0]?.entity?.entity_id||t.device?.id||"power")}</span>
          </div>

          <!-- SVG Arc (for multi-circuit devices) -->
          ${f&&h.length>1?this._renderPowerArc(h,v):""}

          <!-- Summary -->
          <div class="power-summary" role="group" aria-label="Power Summary">
            ${this._renderPowerSummaryCard("TOTAL USAGE",v,d,p,"mdi:sigma")}
          </div>

          <!-- Circuits section (Vue-type) -->
          ${f?e.qy`
            <div class="power-circuits-section">
              <div class="power-section-label" role="heading" aria-level="4">
                <span class="power-section-label-text">CIRCUITS</span>
                <div class="power-section-label-rule" aria-hidden="true"></div>
                <span class="power-section-label-count">${h.length}/${h.length}</span>
              </div>
              <div class="power-circuits" role="list" aria-label="Circuit Monitors">
                ${h.map(e=>this._renderCircuitTile(e))}
              </div>
            </div>
          `:""}

          <!-- Device row (plug-type with switch) -->
          ${g?e.qy`
            <div class="power-devices-section">
              <div class="power-section-label" role="heading" aria-level="4">
                <span class="power-section-label-text">MONITORED DEVICES</span>
                <div class="power-section-label-rule" aria-hidden="true"></div>
                <span class="power-section-label-count">1/1</span>
              </div>
              <div class="power-devices" role="list" aria-label="Monitored Devices">
                ${this._renderPowerDeviceRow(t)}
              </div>
            </div>
          `:""}

          <!-- Strip rendering -->
          ${b?e.qy`
            <div class="power-strips-section">
              <div class="power-section-label" role="heading" aria-level="4">
                <span class="power-section-label-text">POWER STRIPS</span>
                <div class="power-section-label-rule" aria-hidden="true"></div>
              </div>
              <div class="power-strips" role="list" aria-label="Power Strips">
                ${this._renderPowerStrip(t,[])}
              </div>
            </div>
          `:""}

          <!-- Singleton popover element (Data C-5) -->
          <div popover id="power-detail-popover" class="power-detail-popover"
            role="dialog" aria-label="Circuit detail">
            <div class="popover-content"></div>
          </div>

          <div class="panel-pip-strip" aria-hidden="true"></div>
        </div>
      `}_renderAreaContent(t,a){if(0===t.length)return e.qy`<div class="lcars-empty" role="status">No entities in this area</div>`;const{byDevice:r,noDevice:i}=this._groupEntities(t),s=t.map(e=>{const t=e.entity_id.split(".")[0],a=this._hass?.states?.[e.entity_id];return{entity:e,domain:t,state:a}}).filter(e=>e.state),o=function(e,t,a){const r=new Set,i=a.some(V),s=a.some(j),n=a.some(K);(i||s&&n)&&r.add(v),a.filter(X).length>=1&&r.add(f),a.some(Q)&&r.add(g);const o=new Set(["blind","shade","curtain","awning","shutter"]);return a.some(e=>{if("cover"!==e.domain)return!1;const t=e.state?.attributes?.device_class||"";return o.has(t)||""===t&&!Z.has(t)})&&r.add(b),a.filter(e=>S.has(e.domain)).length>=1&&r.add(c),r}(this._hass,0,s),p=[];for(const e of o){const t=je.get(e);t&&p.push({panelType:e,template:t({entities:s,areaId:a},this._hass,this._editMode,this._config)})}const u=this._buildAreaPanelFilter(o);if(u)for(const[e,t]of r)t.entities=t.entities.filter(e=>!u(e)),0===t.entities.length&&r.delete(e);const m=u?i.filter(e=>!u(e)):i,y=new Set;o.has(v)&&(y.add(l),y.add(d)),o.has(g)&&y.add(n),o.has(c)&&y.add(c);const w=[],$=[],k=[];for(const e of r.values()){const t=this._getDevicePanelType(e.entities);t&&y.has(t)||(t===h?k.push({...e,panelType:t}):t?w.push({...e,panelType:t}):$.push(e))}const C=e.qy`
        ${$.map(t=>e.qy`
          <div class="device-group">
            <div class="device-header">
              <h3 class="device-name">${this._shortDeviceName(t.device)}</h3>
              <div class="device-line"></div>
              ${this._editMode?e.qy`
                <div class="device-edit-pip" tabindex="0" role="button" aria-label="Edit device"
                  @click=${e=>this._handleEditDevice(e,t.device.id)}
                  @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._handleEditDevice(e,t.device.id))}}></div>
              `:""}
            </div>
            ${this._renderDomainGroups(t.entities)}
          </div>
        `)}
        ${m.length>0?e.qy`
          <div class="device-group">
            <div class="device-header">
              <h3 class="device-name">Other Entities</h3>
              <div class="device-line"></div>
            </div>
            ${this._renderDomainGroups(m)}
          </div>
        `:""}
      `,E=k.length>0?e.qy`<lcars-power-panel .powerGroups=${k} .hass=${this._hass} .editMode=${this._editMode} .config=${this._config}></lcars-power-panel>`:"",z=[...w.map(e=>({panelType:e.panelType,template:this._renderDevicePanel(e.panelType,e)})),...p];if(0===z.length&&0===k.length)return e.qy`${C}${E}`;const A=[],q=[];for(const e of z)"right"===_[e.panelType]?q.push(e):A.push(e);A.sort((e,t)=>(x[e.panelType]??99)-(x[t.panelType]??99)),q.sort((e,t)=>(x[e.panelType]??99)-(x[t.panelType]??99));const P=A.find(e=>e.panelType===f),T=A.filter(e=>e.panelType!==f),N=e.qy`
        <div class="area-split-main" role="region" aria-label="Device controls">
          ${C}
          ${T.map(e=>e.template)}
          ${E}
        </div>
      `;return 0===q.length?e.qy`
        ${P?e.qy`<div class="area-illumination-full">${P.template}</div>`:""}
        ${N}
      `:e.qy`
        ${P?e.qy`<div class="area-illumination-full">${P.template}</div>`:""}
        <div class="area-split-layout">
          ${N}
          <div class="area-split-panels" role="region" aria-label="System panels">
            ${q.map(e=>e.template)}
          </div>
        </div>
      `}_buildAreaPanelFilter(e){if(0===e.size)return null;const t=[];return e.has(f)&&t.push(X),e.has(v)&&t.push(e=>V(e)||j(e)||K(e)),e.has(g)&&t.push(Q),e.has(c)&&t.push(e=>S.has(e.domain)),0===t.length?null:e=>t.some(t=>t(e))}_renderDomainGroups(t){const a=this._groupByDomain(t);return e.qy`${a.map(([t,a])=>e.qy`
        <div class="domain-label" role="heading" aria-level="4">${B[t]||t}</div>
        ${this._renderDomainEntities(t,a)}
      `)}`}_renderDomainEntities(e,t){return $.has(e)?this._renderCameras(t):z.has(e)?this._renderToggles(t):k.has(e)?this._renderClimates(t):q.has(e)?this._renderCovers(t):S.has(e)?this._renderMedia(t):A.has(e)?this._renderSensors(t):this._renderGeneric(t)}_renderCameras(t){return e.qy`<div class="camera-grid">
        ${t.map(({entity:t,state:a},r)=>{const i=this._friendlyName(a,t),s=this._isOff(a),n=Ge(a),o=s||!n?"offline":"connecting";return e.qy`
            <div class="camera-frame" data-state="${o}" style="--i:${r}"
              role="button"
              tabindex="0"
              aria-label="${i} camera: ${s?"viewscreen offline":a.state}"
              aria-busy="${"connecting"===o}"
              @click=${()=>this._handleEntityClick(t.entity_id)}
              @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._handleEntityClick(t.entity_id))}}>
              <div class="camera-connecting-overlay" aria-hidden="true">
                <span class="camera-connecting-text">ESTABLISHING LINK</span>
              </div>
              <div class="camera-offline-overlay" aria-hidden="true">
                <ha-icon icon="mdi:video-off"></ha-icon>
                <span class="camera-offline-text">VIEWSCREEN OFFLINE</span>
              </div>
              ${n?e.qy`<img src="${n}" alt="${i}"
                            data-entity="${t.entity_id}"
                            .src=${n}
                            @load=${e=>{const t=e.target.closest(".camera-frame");t&&(t.setAttribute("data-state","live"),t.removeAttribute("aria-busy"))}}
                            @error=${e=>{const t=e.target.closest(".camera-frame");t&&(t.setAttribute("data-state","offline"),t.removeAttribute("aria-busy"))}} />`:e.qy`<div class="camera-spacer"></div>`}
              <div class="camera-label">
                <ha-icon icon="mdi:video"></ha-icon>
                <span>${i}</span>
                <span class="cam-state">${a.state}</span>
              </div>
            </div>
          `})}
      </div>`}_renderToggles(t){return e.qy`<div class="toggle-grid">
        ${t.map(({entity:t,state:a},r)=>{const i=this._friendlyName(a,t),s="on"===a.state||"unlocked"===a.state||"playing"===a.state,n=this._isOff(a),o=t.entity_id.split(".")[0],l=a.attributes?.brightness,c=l?Math.round(l/255*100):0;return this._withEditPip(t.entity_id,e.qy`
            <button class="toggle-pill" ?data-on=${s} ?data-off=${n} style="--i:${r}"
              role="switch"
              aria-checked=${s}
              aria-label="${i}: ${a.state}${l?` (${c}%)`:""}"
              @click=${e=>{e.stopPropagation(),this._handleToggle(t.entity_id)}}
              @dblclick=${()=>this._handleEntityClick(t.entity_id)}
              title="${i}: ${a.state}${l?` (${c}%)`:""}">
              <ha-icon .icon=${this._getEntityIcon(a)}></ha-icon>
              <span class="toggle-name">${i}</span>
              ${"light"===o&&l&&s?e.qy`
                <div class="brightness-bar">
                  <div class="brightness-fill" style="width:${c}%"></div>
                </div>
              `:""}
              <span class="toggle-state">${a.state}</span>
              <div class="toggle-switch"></div>
            </button>
          `)})}
      </div>`}_renderSensors(t){return e.qy`<div class="sensor-grid">
        ${t.map(({entity:t,state:a},r)=>{const i=this._friendlyName(a,t),s=this._isOff(a),n=a.attributes?.unit_of_measurement||"",o=a.state,l=parseFloat(o),c=(t.entity_id.includes("battery")||"battery"===a.attributes?.device_class)&&!isNaN(l)&&l<20;return this._withEditPip(t.entity_id,e.qy`
            <button class="sensor-readout" ?data-off=${s} ?data-warn=${c} style="--i:${r}"
              @click=${()=>this._handleEntityClick(t.entity_id)}
              title="${i}: ${o} ${n}">
              <ha-icon .icon=${this._getEntityIcon(a)}></ha-icon>
              <span class="sensor-name">${i}</span>
              ${this._renderSensorBar(a)}
              <span class="sensor-value">${o}</span>
              ${n?e.qy`<span class="sensor-unit">${n}</span>`:""}
            </button>
          `)})}
      </div>`}_renderClimates(t){return e.qy`<div class="climate-grid">
        ${t.map(({entity:t,state:a},r)=>{const i=this._friendlyName(a,t),s=a.state,n=a.attributes?.current_temperature,o=a.attributes?.temperature,l=a.attributes?.temperature_unit||"°",c="heat"===s||"heat_cool"===s,d="cool"===s,p="off"===s;return this._withEditPip(t.entity_id,e.qy`
            <button class="climate-panel" ?data-heat=${c} ?data-cool=${d} ?data-off=${p} style="--i:${r}"
              @click=${()=>this._handleEntityClick(t.entity_id)}
              title="${i}: ${s}">
              <ha-icon .icon=${this._getEntityIcon(a)}></ha-icon>
              <div class="climate-info">
                <span class="climate-name">${i}</span>
                <div class="climate-temps">
                  ${null!=n?e.qy`<span class="climate-current">${n}${l}</span>`:""}
                  ${null!=o?e.qy`<span class="climate-target">→ ${o}${l}</span>`:""}
                </div>
              </div>
              <span class="climate-mode">${s}</span>
            </button>
          `)})}
      </div>`}_renderCovers(t){return e.qy`<div class="cover-grid">
        ${t.map(({entity:t,state:a},r)=>{const i=this._friendlyName(a,t),s="closed"===a.state,n=a.attributes?.current_position;return this._withEditPip(t.entity_id,e.qy`
            <button class="cover-panel" ?data-off=${s} style="--i:${r}"
              @click=${()=>this._handleEntityClick(t.entity_id)}
              title="${i}: ${a.state}">
              <ha-icon .icon=${this._getEntityIcon(a)}></ha-icon>
              <span class="cover-name">${i}</span>
              ${null!=n?e.qy`<span class="cover-position">${n}%</span>`:""}
            </button>
          `)})}
      </div>`}_renderMedia(t){return e.qy`<div class="media-grid">
        ${t.map(({entity:t,state:a},r)=>{const i=this._friendlyName(a,t),s=this._isOff(a),n=[a.attributes?.media_title||"",a.attributes?.media_artist||""].filter(Boolean).join(" — ");return this._withEditPip(t.entity_id,e.qy`
            <button class="media-strip" ?data-off=${s} style="--i:${r}"
              @click=${()=>this._handleEntityClick(t.entity_id)}
              title="${i}: ${a.state}">
              <ha-icon .icon=${this._getEntityIcon(a)}></ha-icon>
              <div class="media-info">
                <div class="media-name">${i}</div>
                ${n?e.qy`<div class="media-title">${n}</div>`:""}
              </div>
              <span class="media-state">${a.state}</span>
            </button>
          `)})}
      </div>`}_renderGeneric(t){return e.qy`<div class="entity-grid">
        ${t.map(({entity:t,state:a},r)=>{const i=this._friendlyName(a,t),s=this._isOff(a);return this._withEditPip(t.entity_id,e.qy`
            <button class="entity-btn" ?data-off=${s} style="--i:${r}"
              @click=${()=>this._handleEntityClick(t.entity_id)}
              title="${i}: ${a.state}">
              <ha-icon .icon=${this._getEntityIcon(a)}></ha-icon>
              <span class="entity-name">${i}</span>
              <span class="entity-state">${a.state}</span>
            </button>
          `)})}
      </div>`}getCardSize(){return 6}}customElements.get("homepage-card")?i.g0.warn(Ve,"Custom element homepage-card already registered — skipping"):(customElements.define("homepage-card",Xe),i.g0.debug(Ve,"Custom element registered: homepage-card"))})(),(()=>{var e=a(349),t=a(622),r=a(851);class i extends e.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object},_pages:{type:Array}}}constructor(){super(),this._pages=[]}set hass(e){this._hass=e,0===this._pages.length&&this._loadPages()}setConfig(e){this._config=e}async _loadPages(){if(this._hass)try{const e=await this._hass.callWS({type:"lcars_dashboard/configuration/get"});e&&e.more_pages&&(this._pages=Object.entries(e.more_pages).map(([e,t])=>({id:e,...t})))}catch(e){console.warn("LCARS: Could not load more-pages",e)}}_openPage(e){(0,r.oo)(`/lcars-dashboard/more/${e}`)}static get styles(){return[t.Bx,e.AH`
          :host { display: block; }

          .divider {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 0;
          }

          .divider-label {
            font-size: var(--lcars-font-size-sub);
            color: var(--lcars-text-heading);
            white-space: nowrap;
          }

          .divider-line { flex: 1; height: 2px; background: var(--lcars-data-accent); }

          .pages-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
            gap: var(--lcars-gap);
            padding: 0.5rem 0;
          }

          .page-btn {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            height: var(--lcars-btn-height);
            padding: 0 1rem 0 0.75rem;
            background: var(--lcars-almond);
            color: var(--lcars-black);
            border: none;
            border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
            cursor: pointer;
            transition: filter var(--lcars-transition);
            user-select: none;
            width: 100%;
          }

          .page-btn:hover { filter: brightness(1.2); }
          .page-btn:active { background: var(--lcars-btn-active); }

          .page-btn ha-icon { --mdc-icon-size: 20px; flex-shrink: 0; }
          .page-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

          .lcars-empty {
            color: var(--lcars-gray);
            font-size: var(--lcars-font-size-sub);
            padding: 2rem 0;
            text-align: center;
          }
        `]}render(){return e.qy`
        <div class="divider">
          <span class="divider-label">More Pages</span>
          <div class="divider-line"></div>
        </div>

        ${this._pages.length>0?e.qy`
              <div class="pages-grid">
                ${this._pages.map(t=>e.qy`
                    <button
                      class="page-btn"
                      @click=${()=>this._openPage(t.id)}
                    >
                      <ha-icon .icon=${t.icon||"mdi:file-document-outline"}></ha-icon>
                      <span class="page-name">${t.name||t.id}</span>
                    </button>
                  `)}
              </div>
            `:e.qy`<div class="lcars-empty">No additional pages configured</div>`}
      `}getCardSize(){return 4}}customElements.get("lcars-more-pages-card")||customElements.define("lcars-more-pages-card",i)})(),(()=>{var e=a(349),t=a(622),r=a(851);class i extends e.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object},_cards:{type:Array}}}constructor(){super(),this._cards=[]}set hass(e){this._hass=e,this._cards.forEach(t=>{t&&(t.hass=e)})}setConfig(e){this._config=e,this._createCards()}async _createCards(){this._config&&this._config.cards&&(this._cards=await Promise.all(this._config.cards.map(async e=>{try{const t=await(0,r.te)(e);return this._hass&&(t.hass=this._hass),t}catch(t){return console.error("LCARS: Failed to create card",e,t),null}})),this._cards=this._cards.filter(Boolean),this.requestUpdate())}static get styles(){return[t.Bx,e.AH`
          :host { display: block; }

          .divider {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 0;
          }

          .divider-label {
            font-size: var(--lcars-font-size-sub);
            color: var(--lcars-text-heading);
            white-space: nowrap;
          }

          .divider-line { flex: 1; height: 2px; background: var(--lcars-data-accent); }

          .cards-container {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            padding: 0.5rem 0;
          }

          .lcars-empty {
            color: var(--lcars-gray);
            font-size: var(--lcars-font-size-sub);
            padding: 2rem 0;
            text-align: center;
          }
        `]}render(){const t=this._config&&this._config.name||"More Page";return e.qy`
        <div class="divider">
          <span class="divider-label">${t}</span>
          <div class="divider-line"></div>
        </div>

        <div class="cards-container">
          ${this._cards.length>0?this._cards.map(t=>e.qy`${t}`):e.qy`<div class="lcars-empty">No cards configured</div>`}
        </div>
      `}getCardSize(){return this._cards.length||1}}customElements.get("lcars-more-page-card")||customElements.define("lcars-more-page-card",i)})(),(()=>{var e=a(349),t=a(622),r=a(851);class i extends e.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object}}}set hass(e){this._hass=e}setConfig(e){this._config=e}async _save(e){if(this._hass)try{await this._hass.callWS({type:"lcars_dashboard/more_page/set",...e}),(0,r.rC)("lcars_dashboard_reload")}catch(e){console.error("LCARS Edit: Failed to save more-page",e)}}static get styles(){return[t.Bx,e.AH`
          :host { display: block; }

          .edit-container {
            display: flex;
            flex-direction: column;
            gap: var(--lcars-gap);
            padding: 0.5rem 0;
          }

          .edit-field {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
          }

          .edit-label {
            font-family: var(--lcars-font);
            font-size: 0.625rem;
            color: var(--lcars-gray);
            text-transform: uppercase;
          }

          .edit-input {
            height: 2.5rem;
            padding: 0 0.75rem;
            background: var(--lcars-ice);
            color: var(--lcars-black);
            border: none;
            border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
            outline: none;
          }

          .edit-input:focus {
            box-shadow: 0 0 0 2px var(--lcars-btn-active);
          }

          .edit-actions {
            display: flex;
            gap: var(--lcars-gap);
            padding-top: 0.5rem;
          }

          .action-btn {
            flex: 1;
            height: var(--lcars-btn-height);
            background: var(--lcars-butterscotch);
            color: var(--lcars-black);
            border: none;
            border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
            cursor: pointer;
            transition: filter var(--lcars-transition);
            user-select: none;
          }

          .action-btn:hover { filter: brightness(1.2); }
          .action-btn.danger {
            background: var(--lcars-red-alert);
            color: var(--lcars-space-white);
          }
        `]}render(){return e.qy`
        <div class="edit-container">
          <div class="edit-field">
            <span class="edit-label">Page Name</span>
            <input class="edit-input" type="text" .value=${this._config?.name||""} />
          </div>
          <div class="edit-field">
            <span class="edit-label">Icon</span>
            <input class="edit-input" type="text" .value=${this._config?.icon||""} placeholder="mdi:file" />
          </div>
          <div class="edit-actions">
            <button class="action-btn">Save</button>
            <button class="action-btn danger">Delete</button>
          </div>
        </div>
      `}getCardSize(){return 3}}customElements.get("lcars-edit-more-page-card")||customElements.define("lcars-edit-more-page-card",i)})(),(()=>{var e=a(349),t=a(622);class r extends e.WF{static get properties(){return{_hass:{type:Object},_notifications:{type:Array}}}constructor(){super(),this._notifications=[]}set hass(e){this._hass=e,this._loadNotifications()}setConfig(e){this._config=e}async _loadNotifications(){if(this._hass)try{const e=await this._hass.callWS({type:"lcars_dashboard/notification/get"});Array.isArray(e)&&(this._notifications=e)}catch(e){}}_dismissNotification(e){this._hass&&this._hass.callWS({type:"lcars_dashboard/notification/dismiss",notification_id:e}).then(()=>{this._notifications=this._notifications.filter(t=>t.id!==e)}).catch(()=>{})}static get styles(){return[t.Bx,e.AH`
          :host { display: block; }

          .notification-list {
            display: flex;
            flex-direction: column;
            gap: var(--lcars-gap);
          }

          .notification {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            background: var(--lcars-orange);
            color: var(--lcars-black);
            border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
          }

          .notification.alert {
            background: var(--lcars-red-alert);
            color: var(--lcars-space-white);
          }

          .notification.info {
            background: var(--lcars-sky);
          }

          .notification-message { flex: 1; }

          .notification-dismiss {
            background: none;
            border: none;
            color: inherit;
            cursor: pointer;
            padding: 0.25rem;
            font-family: var(--lcars-font);
            font-size: 0.75rem;
            text-transform: uppercase;
            opacity: 0.7;
            transition: opacity var(--lcars-transition);
          }

          .notification-dismiss:hover { opacity: 1; }

          .lcars-empty {
            color: var(--lcars-gray);
            font-size: var(--lcars-font-size-data);
            padding: 1rem 0;
            text-align: center;
          }
        `]}render(){return 0===this._notifications.length?e.qy``:e.qy`
        <div class="notification-list" role="log" aria-label="Notifications">
          ${this._notifications.map(t=>e.qy`
              <div
                class="notification ${t.type||"info"}"
                role="status"
              >
                <ha-icon .icon=${"alert"===t.type?"mdi:alert":"mdi:information-outline"}></ha-icon>
                <span class="notification-message">${t.message||t.title||"Notification"}</span>
                <button
                  class="notification-dismiss"
                  @click=${()=>this._dismissNotification(t.id)}
                  aria-label="Dismiss"
                >
                  &#x2715;
                </button>
              </div>
            `)}
        </div>
      `}getCardSize(){return this._notifications.length||0}}customElements.get("lcars-notification-card")||customElements.define("lcars-notification-card",r)})(),(()=>{var e=a(349),t=a(622),r=a(851);class i extends e.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object},_expanded:{type:Boolean}}}constructor(){super(),this._expanded=!1}set hass(e){this._hass=e}setConfig(e){this._config=e}_toggle(){this._expanded=!this._expanded}_getWeatherEntity(){if(!this._hass)return null;const e=Object.keys(this._hass.states).filter(e=>e.startsWith("weather."));return e.length>0?this._hass.states[e[0]]:null}_getPersonEntities(){return this._hass?Object.keys(this._hass.states).filter(e=>e.startsWith("person.")).map(e=>this._hass.states[e]):[]}static get styles(){return[t.Bx,e.AH`
          :host { display: block; }

          .info-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            height: var(--lcars-btn-height);
            padding: 0 1rem 0 0.75rem;
            background: var(--lcars-peach);
            color: var(--lcars-black);
            border: none;
            border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
            cursor: pointer;
            transition: filter var(--lcars-transition);
            width: 100%;
            user-select: none;
          }

          .info-header:hover { filter: brightness(1.2); }
          .info-header ha-icon { --mdc-icon-size: 20px; flex-shrink: 0; }
          .info-label { flex: 1; }

          .info-body {
            overflow: hidden;
            max-height: 0;
            opacity: 0;
            transition: max-height var(--lcars-transition-slow), opacity var(--lcars-transition);
          }

          .info-body[data-open] {
            max-height: 1500px;
            opacity: 1;
            padding: 0.5rem 0;
          }

          .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
            gap: var(--lcars-gap);
          }

          .info-tile {
            background: var(--lcars-ice);
            color: var(--lcars-black);
            padding: 0.5rem 0.75rem;
            border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
            cursor: pointer;
            transition: filter var(--lcars-transition);
            user-select: none;
            border: none;
            text-align: left;
            width: 100%;
          }

          .info-tile:hover { filter: brightness(1.2); }

          .info-tile-label {
            font-size: 0.625rem;
            opacity: 0.7;
            margin-bottom: 0.125rem;
          }

          .info-tile-value {
            font-size: var(--lcars-font-size-data);
          }

          @media (prefers-reduced-motion: reduce) {
            .info-body { transition: none; }
          }
        `]}render(){if(!this._hass)return e.qy``;const t=this._getWeatherEntity(),a=this._getPersonEntities();return e.qy`
        <button class="info-header" @click=${this._toggle} aria-expanded=${this._expanded}>
          <ha-icon icon="mdi:home-analytics"></ha-icon>
          <span class="info-label">House Information</span>
          ${t?e.qy`<span>${t.state} ${t.attributes.temperature||""}°</span>`:""}
        </button>

        <div class="info-body" ?data-open=${this._expanded}>
          <div class="info-grid">
            ${t?e.qy`
                  <button
                    class="info-tile"
                    @click=${()=>(0,r.Hv)(t.entity_id)}
                  >
                    <div class="info-tile-label">Weather</div>
                    <div class="info-tile-value">
                      ${t.state} ${t.attributes.temperature||""}°
                    </div>
                  </button>
                  <button
                    class="info-tile"
                    @click=${()=>(0,r.Hv)(t.entity_id)}
                  >
                    <div class="info-tile-label">Humidity</div>
                    <div class="info-tile-value">
                      ${t.attributes.humidity||"--"}%
                    </div>
                  </button>
                `:""}

            ${a.map(t=>e.qy`
                <button
                  class="info-tile"
                  @click=${()=>(0,r.Hv)(t.entity_id)}
                >
                  <div class="info-tile-label">
                    ${t.attributes?.friendly_name||t.entity_id.split(".").pop()}
                  </div>
                  <div class="info-tile-value">${t.state}</div>
                </button>
              `)}
          </div>
        </div>
      `}getCardSize(){return this._expanded?4:1}}customElements.get("lcars-house-information-card")||customElements.define("lcars-house-information-card",i)})(),(()=>{var e=a(349),t=a(622),r=a(851);class i extends e.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object}}}set hass(e){this._hass=e}setConfig(e){this._config=e}static get styles(){return[t.Bx,e.AH`
          :host { display: block; }

          .detail-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
            gap: var(--lcars-gap);
            padding: 0.5rem 0;
          }

          .detail-tile {
            background: var(--lcars-ice);
            color: var(--lcars-black);
            padding: 0.75rem;
            border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
            font-family: var(--lcars-font);
            text-transform: uppercase;
            cursor: pointer;
            border: none;
            text-align: left;
            width: 100%;
            transition: filter var(--lcars-transition);
          }

          .detail-tile:hover { filter: brightness(1.2); }

          .detail-label {
            font-size: 0.625rem;
            opacity: 0.7;
            margin-bottom: 0.25rem;
          }

          .detail-value {
            font-size: var(--lcars-font-size-data);
          }
        `]}render(){if(!this._hass)return e.qy``;const t=Object.keys(this._hass.states).filter(e=>e.startsWith("sensor.")).slice(0,20).map(e=>this._hass.states[e]);return e.qy`
        <div class="detail-grid">
          ${t.map(t=>e.qy`
              <button
                class="detail-tile"
                @click=${()=>(0,r.Hv)(t.entity_id)}
              >
                <div class="detail-label">
                  ${t.attributes?.friendly_name||t.entity_id.split(".").pop().replace(/_/g," ")}
                </div>
                <div class="detail-value">
                  ${t.state}${t.attributes?.unit_of_measurement?` ${t.attributes.unit_of_measurement}`:""}
                </div>
              </button>
            `)}
        </div>
      `}getCardSize(){return 4}}customElements.get("lcars-house-information-more-info-card")||customElements.define("lcars-house-information-more-info-card",i)})(),(()=>{var e=a(349),t=a(622),r=a(851);class i extends e.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object},_card:{type:Object}}}constructor(){super(),this._card=null}set hass(e){this._hass=e,this._card&&(this._card.hass=e)}setConfig(e){this._config=e,e.card&&this._createCard(e.card)}async _createCard(e){try{this._card=await(0,r.te)(e),this._hass&&(this._card.hass=this._hass),this.requestUpdate()}catch(e){console.error("LCARS Blueprint: Failed to create card",e)}}static get styles(){return[t.Bx,e.AH`
          :host { display: block; }

          .blueprint-wrapper {
            border-left: 3px solid var(--lcars-butterscotch);
            padding: 0.5rem 0 0.5rem 0.75rem;
          }

          .blueprint-label {
            font-family: var(--lcars-font);
            font-size: 0.625rem;
            color: var(--lcars-gray);
            text-transform: uppercase;
            margin-bottom: 0.25rem;
          }
        `]}render(){return e.qy`
        <div class="blueprint-wrapper">
          ${this._config?.name?e.qy`<div class="blueprint-label">${this._config.name}</div>`:""}
          ${this._card?e.qy`${this._card}`:""}
        </div>
      `}getCardSize(){return this._card?2:1}}customElements.get("lcars-blueprint-card")||customElements.define("lcars-blueprint-card",i)})(),(()=>{var e=a(349),t=a(622),r=a(851);class i extends e.WF{static get properties(){return{_hass:{type:Object},_selectedDomain:{type:String}}}constructor(){super(),this._selectedDomain=null}set hass(e){this._hass=e}setConfig(e){this._config=e}_getDomainGroups(){if(!this._hass||!this._hass.states)return{};const e={};Object.keys(this._hass.states).forEach(t=>{const a=t.split(".")[0];e[a]||(e[a]=[]),e[a].push(t)});const t={};return Object.keys(e).sort().forEach(a=>{t[a]=e[a]}),t}_getDomainIcon(e){return{light:"mdi:lightbulb-group",switch:"mdi:toggle-switch-outline",sensor:"mdi:eye",binary_sensor:"mdi:radiobox-blank",climate:"mdi:thermostat",cover:"mdi:window-shutter",fan:"mdi:fan",lock:"mdi:lock",camera:"mdi:video",media_player:"mdi:cast",automation:"mdi:robot",script:"mdi:script-text",person:"mdi:account",input_boolean:"mdi:toggle-switch",input_number:"mdi:ray-vertex",input_select:"mdi:format-list-bulleted",input_text:"mdi:form-textbox",scene:"mdi:palette",group:"mdi:google-circles-communities",timer:"mdi:timer-outline",counter:"mdi:counter",weather:"mdi:weather-partly-cloudy",vacuum:"mdi:robot-vacuum",water_heater:"mdi:water-boiler"}[e]||"mdi:devices"}_toggleDomain(e){this._selectedDomain=this._selectedDomain===e?null:e}_handleEntityClick(e){(0,r.Hv)(e)}static get styles(){return[t.Bx,e.AH`
          :host { display: block; }

          .domain-list {
            display: flex;
            flex-direction: column;
            gap: var(--lcars-gap);
          }

          .domain-btn {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            height: var(--lcars-btn-height);
            padding: 0 1rem 0 0.75rem;
            background: var(--lcars-bluey);
            color: var(--lcars-black);
            border: none;
            border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
            cursor: pointer;
            transition: filter var(--lcars-transition), background var(--lcars-transition);
            width: 100%;
            user-select: none;
          }

          .domain-btn:hover { filter: brightness(1.2); }
          .domain-btn[data-active] { background: var(--lcars-btn-active); }

          .domain-btn ha-icon {
            --mdc-icon-size: 20px;
            flex-shrink: 0;
          }

          .domain-name { flex: 1; overflow: hidden; text-overflow: ellipsis; }
          .domain-count { font-size: 0.75rem; opacity: 0.7; }

          .domain-entities {
            overflow: hidden;
            max-height: 0;
            opacity: 0;
            transition: max-height var(--lcars-transition-slow), opacity var(--lcars-transition);
          }

          .domain-entities[data-open] {
            max-height: 5000px;
            opacity: 1;
            padding: 0.5rem 0 0.5rem 1rem;
          }

          .entity-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
            gap: var(--lcars-gap);
          }

          .entity-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            height: 2.5rem;
            padding: 0 0.75rem;
            background: var(--lcars-ice);
            color: var(--lcars-black);
            border: none;
            border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
            cursor: pointer;
            transition: filter var(--lcars-transition);
            user-select: none;
          }

          .entity-item:hover { filter: brightness(1.2); }
          .entity-item:active { background: var(--lcars-btn-active); }
          .entity-item[data-off] { background: var(--lcars-gray); color: var(--lcars-space-white); }

          .entity-item ha-icon { --mdc-icon-size: 16px; flex-shrink: 0; }
          .entity-item-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          .entity-item-state { font-size: 0.75rem; opacity: 0.7; flex-shrink: 0; }

          .divider {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 0;
          }

          .divider-label {
            font-size: var(--lcars-font-size-sub);
            color: var(--lcars-text-heading);
            white-space: nowrap;
          }

          .divider-line { flex: 1; height: 2px; background: var(--lcars-data-accent); }

          @media (prefers-reduced-motion: reduce) {
            .domain-entities { transition: none; }
          }
        `]}render(){if(!this._hass)return e.qy``;const t=this._getDomainGroups(),a=Object.keys(t);return e.qy`
        <div class="divider">
          <span class="divider-label">Devices</span>
          <div class="divider-line"></div>
        </div>

        <div class="domain-list">
          ${a.map(a=>e.qy`
            <button
              class="domain-btn"
              ?data-active=${this._selectedDomain===a}
              @click=${()=>this._toggleDomain(a)}
              aria-expanded=${this._selectedDomain===a}
            >
              <ha-icon .icon=${this._getDomainIcon(a)}></ha-icon>
              <span class="domain-name">${a.replace(/_/g," ")}</span>
              <span class="domain-count">${t[a].length}</span>
            </button>

            <div class="domain-entities" ?data-open=${this._selectedDomain===a}>
              ${this._selectedDomain===a?e.qy`
                    <div class="entity-list">
                      ${t[a].map(t=>{const r=this._hass.states[t];if(!r)return"";const i="off"===r.state||"unavailable"===r.state||"unknown"===r.state,s=r.attributes?.friendly_name||t.split(".").pop().replace(/_/g," ");return e.qy`
                          <button
                            class="entity-item"
                            ?data-off=${i}
                            @click=${()=>this._handleEntityClick(t)}
                            title="${s}: ${r.state}"
                          >
                            <ha-icon .icon=${r.attributes?.icon||this._getDomainIcon(a)}></ha-icon>
                            <span class="entity-item-name">${s}</span>
                            <span class="entity-item-state">${r.state}</span>
                          </button>
                        `})}
                    </div>
                  `:""}
            </div>
          `)}
        </div>
      `}getCardSize(){return 8}}customElements.get("devices-card")||customElements.define("devices-card",i)})(),(()=>{var e=a(349),t=a(622),r=a(851);class i extends e.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object},_cards:{type:Array}}}constructor(){super(),this._cards=[]}set hass(e){this._hass=e,this._cards.forEach(t=>{t&&(t.hass=e)})}setConfig(e){this._config=e,this._createCards()}async _createCards(){this._config&&this._config.cards&&(this._cards=await Promise.all(this._config.cards.map(async e=>{try{const t=await(0,r.te)(e);return this._hass&&(t.hass=this._hass),t}catch(t){return console.error("LCARS Flexbox: Failed to create card",e,t),null}})),this._cards=this._cards.filter(Boolean),this.requestUpdate())}static get styles(){return[t.Bx,e.AH`
          :host { display: block; }

          .flexbox {
            display: flex;
            flex-wrap: wrap;
            gap: var(--lcars-gap);
          }

          .flexbox > * {
            flex: 1 1 auto;
            min-width: 0;
          }
        `]}render(){return e.qy`
        <div class="flexbox">
          ${this._cards.map(t=>e.qy`${t}`)}
        </div>
      `}getCardSize(){return 1}}customElements.get("lcars-flexbox-card")||customElements.define("lcars-flexbox-card",i)})(),(()=>{var e=a(349),t=a(622);class r extends e.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object}}}set hass(e){this._hass=e}setConfig(e){if(!e.heading)throw new Error("Please define heading");this._config=e}static get styles(){return[t.Bx,e.AH`
          :host { display: block; }

          .heading-row {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .heading-text {
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-sub);
            color: var(--lcars-text-heading);
            text-transform: uppercase;
            white-space: nowrap;
          }

          .heading-bar {
            flex: 1;
            height: 2px;
            background: var(--lcars-data-accent);
          }

          .heading-endcap {
            width: 1rem;
            height: 2px;
            background: var(--lcars-data-accent);
            border-radius: 0 1px 1px 0;
          }

          .heading-subtitle {
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            color: var(--lcars-gray);
            text-transform: uppercase;
            padding-top: 0.25rem;
          }
        `]}render(){return e.qy`
        <div class="heading-row">
          <span class="heading-text">${this._config.heading}</span>
          <div class="heading-bar"></div>
          <div class="heading-endcap"></div>
        </div>
        ${this._config.subtitle?e.qy`<div class="heading-subtitle">${this._config.subtitle}</div>`:""}
      `}getCardSize(){return 1}}customElements.get("lcars-heading-card")||customElements.define("lcars-heading-card",r)})(),(()=>{var e=a(349),t=a(622);class r extends e.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object}}}set hass(e){this._hass=e}setConfig(e){this._config=e}static get styles(){return[t.Bx,e.AH`
          :host { display: block; }

          .create-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            width: 100%;
            height: var(--lcars-btn-height);
            background: var(--lcars-mars);
            color: var(--lcars-black);
            border: none;
            border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
            cursor: pointer;
            transition: filter var(--lcars-transition);
            user-select: none;
          }

          .create-btn:hover { filter: brightness(1.2); }

          .create-btn ha-icon {
            --mdc-icon-size: 20px;
          }
        `]}render(){return e.qy`
        <button class="create-btn">
          <ha-icon icon="mdi:plus"></ha-icon>
          Add Custom Card
        </button>
      `}getCardSize(){return 1}}customElements.get("lcars-create-custom-card-card")||customElements.define("lcars-create-custom-card-card",r)})(),(()=>{var e=a(349),t=a(622),r=a(851);const i=e.AH`
  :host { display: block; }
  .edit-container { display: flex; flex-direction: column; gap: var(--lcars-gap); padding: 0.5rem 0; }
  .edit-field { display: flex; flex-direction: column; gap: 0.25rem; }
  .edit-label { font-family: var(--lcars-font); font-size: 0.625rem; color: var(--lcars-gray); text-transform: uppercase; }
  .edit-input { height: 2.5rem; padding: 0 0.75rem; background: var(--lcars-ice); color: var(--lcars-black); border: none; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; outline: none; }
  .edit-input:focus { box-shadow: 0 0 0 2px var(--lcars-btn-active); }
  .edit-actions { display: flex; gap: var(--lcars-gap); padding-top: 0.5rem; }
  .action-btn { flex: 1; height: var(--lcars-btn-height); background: var(--lcars-butterscotch); color: var(--lcars-black); border: none; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; cursor: pointer; transition: filter var(--lcars-transition); user-select: none; }
  .action-btn:hover { filter: brightness(1.2); }
  .action-btn.danger { background: var(--lcars-red-alert); color: var(--lcars-space-white); }
`;class s extends e.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object}}}set hass(e){this._hass=e}setConfig(e){this._config=e}async _save(){if(this._hass)try{await this._hass.callWS({type:"lcars_dashboard/area_button/set",...this._getFormData()}),(0,r.rC)("lcars_dashboard_reload")}catch(e){console.error("LCARS Edit: Save failed",e)}}_getFormData(){const e=this.shadowRoot.querySelectorAll(".edit-input");return{name:e[0]?.value,icon:e[1]?.value}}static get styles(){return[t.Bx,i]}render(){return e.qy`
        <div class="edit-container">
          <div class="edit-field">
            <span class="edit-label">Button Label</span>
            <input class="edit-input" type="text" .value=${this._config?.name||""} />
          </div>
          <div class="edit-field">
            <span class="edit-label">Icon</span>
            <input class="edit-input" type="text" .value=${this._config?.icon||""} placeholder="mdi:home" />
          </div>
          <div class="edit-actions">
            <button class="action-btn" @click=${this._save}>Save</button>
          </div>
        </div>
      `}getCardSize(){return 3}}customElements.get("lcars-edit-area-button-card")||customElements.define("lcars-edit-area-button-card",s)})(),(()=>{var e=a(349),t=a(622),r=a(851);const i=e.AH`
  :host { display: block; }
  .edit-container { display: flex; flex-direction: column; gap: var(--lcars-gap); padding: 0.5rem 0; }
  .edit-field { display: flex; flex-direction: column; gap: 0.25rem; }
  .edit-label { font-family: var(--lcars-font); font-size: 0.625rem; color: var(--lcars-gray); text-transform: uppercase; }
  .edit-input { height: 2.5rem; padding: 0 0.75rem; background: var(--lcars-ice); color: var(--lcars-black); border: none; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; outline: none; }
  .edit-input:focus { box-shadow: 0 0 0 2px var(--lcars-btn-active); }
  .edit-actions { display: flex; gap: var(--lcars-gap); padding-top: 0.5rem; }
  .action-btn { flex: 1; height: var(--lcars-btn-height); background: var(--lcars-butterscotch); color: var(--lcars-black); border: none; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; cursor: pointer; transition: filter var(--lcars-transition); user-select: none; }
  .action-btn:hover { filter: brightness(1.2); }
`;class s extends e.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object}}}set hass(e){this._hass=e}setConfig(e){this._config=e}async _save(){if(this._hass)try{await this._hass.callWS({type:"lcars_dashboard/entity_card/set",...this._getFormData()}),(0,r.rC)("lcars_dashboard_reload")}catch(e){console.error("LCARS Edit: Save failed",e)}}_getFormData(){const e=this.shadowRoot.querySelectorAll(".edit-input");return{entity:e[0]?.value,name:e[1]?.value}}static get styles(){return[t.Bx,i]}render(){return e.qy`
        <div class="edit-container">
          <div class="edit-field">
            <span class="edit-label">Entity ID</span>
            <input class="edit-input" type="text" .value=${this._config?.entity||""} />
          </div>
          <div class="edit-field">
            <span class="edit-label">Display Name</span>
            <input class="edit-input" type="text" .value=${this._config?.name||""} />
          </div>
          <div class="edit-actions">
            <button class="action-btn" @click=${this._save}>Save</button>
          </div>
        </div>
      `}getCardSize(){return 3}}customElements.get("lcars-edit-entity-card-card")||customElements.define("lcars-edit-entity-card-card",s)})(),(()=>{var e=a(349),t=a(622),r=a(851);const i=e.AH`
  :host { display: block; }
  .edit-container { display: flex; flex-direction: column; gap: var(--lcars-gap); padding: 0.5rem 0; }
  .edit-field { display: flex; flex-direction: column; gap: 0.25rem; }
  .edit-label { font-family: var(--lcars-font); font-size: 0.625rem; color: var(--lcars-gray); text-transform: uppercase; }
  .edit-input { height: 2.5rem; padding: 0 0.75rem; background: var(--lcars-ice); color: var(--lcars-black); border: none; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; outline: none; }
  .edit-input:focus { box-shadow: 0 0 0 2px var(--lcars-btn-active); }
  .edit-actions { display: flex; gap: var(--lcars-gap); padding-top: 0.5rem; }
  .action-btn { flex: 1; height: var(--lcars-btn-height); background: var(--lcars-butterscotch); color: var(--lcars-black); border: none; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; cursor: pointer; transition: filter var(--lcars-transition); user-select: none; }
  .action-btn:hover { filter: brightness(1.2); }
`;class s extends e.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object}}}set hass(e){this._hass=e}setConfig(e){this._config=e}async _save(){if(this._hass)try{await this._hass.callWS({type:"lcars_dashboard/entity/set",...this._getFormData()}),(0,r.rC)("lcars_dashboard_reload")}catch(e){console.error("LCARS Edit: Save failed",e)}}_getFormData(){const e=this.shadowRoot.querySelectorAll(".edit-input");return{entity:e[0]?.value,icon:e[1]?.value,name:e[2]?.value}}static get styles(){return[t.Bx,i]}render(){return e.qy`
        <div class="edit-container">
          <div class="edit-field">
            <span class="edit-label">Entity ID</span>
            <input class="edit-input" type="text" .value=${this._config?.entity||""} />
          </div>
          <div class="edit-field">
            <span class="edit-label">Icon Override</span>
            <input class="edit-input" type="text" .value=${this._config?.icon||""} placeholder="mdi:help" />
          </div>
          <div class="edit-field">
            <span class="edit-label">Display Name</span>
            <input class="edit-input" type="text" .value=${this._config?.name||""} />
          </div>
          <div class="edit-actions">
            <button class="action-btn" @click=${this._save}>Save</button>
          </div>
        </div>
      `}getCardSize(){return 4}}customElements.get("lcars-edit-entity-card")||customElements.define("lcars-edit-entity-card",s)})(),(()=>{var e=a(349),t=a(622),r=a(851);const i=e.AH`
  :host { display: block; }
  .edit-container { display: flex; flex-direction: column; gap: var(--lcars-gap); padding: 0.5rem 0; }
  .edit-field { display: flex; flex-direction: column; gap: 0.25rem; }
  .edit-label { font-family: var(--lcars-font); font-size: 0.625rem; color: var(--lcars-gray); text-transform: uppercase; }
  .edit-input { height: 2.5rem; padding: 0 0.75rem; background: var(--lcars-ice); color: var(--lcars-black); border: none; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; outline: none; }
  .edit-input:focus { box-shadow: 0 0 0 2px var(--lcars-btn-active); }
  .edit-textarea { min-height: 6rem; padding: 0.5rem 0.75rem; background: var(--lcars-ice); color: var(--lcars-black); border: none; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); outline: none; resize: vertical; }
  .edit-textarea:focus { box-shadow: 0 0 0 2px var(--lcars-btn-active); }
  .edit-actions { display: flex; gap: var(--lcars-gap); padding-top: 0.5rem; }
  .action-btn { flex: 1; height: var(--lcars-btn-height); background: var(--lcars-butterscotch); color: var(--lcars-black); border: none; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; cursor: pointer; transition: filter var(--lcars-transition); user-select: none; }
  .action-btn:hover { filter: brightness(1.2); }
`;class s extends e.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object}}}set hass(e){this._hass=e}setConfig(e){this._config=e}async _save(){if(this._hass)try{await this._hass.callWS({type:"lcars_dashboard/entity_popup/set",...this._getFormData()}),(0,r.rC)("lcars_dashboard_reload")}catch(e){console.error("LCARS Edit: Save failed",e)}}_getFormData(){const e=this.shadowRoot.querySelector(".edit-input")?.value,t=this.shadowRoot.querySelector(".edit-textarea")?.value;return{entity:e,yaml_config:t}}static get styles(){return[t.Bx,i]}render(){return e.qy`
        <div class="edit-container">
          <div class="edit-field">
            <span class="edit-label">Entity ID</span>
            <input class="edit-input" type="text" .value=${this._config?.entity||""} />
          </div>
          <div class="edit-field">
            <span class="edit-label">Popup YAML</span>
            <textarea class="edit-textarea" .value=${this._config?.yaml_config||""}></textarea>
          </div>
          <div class="edit-actions">
            <button class="action-btn" @click=${this._save}>Save</button>
          </div>
        </div>
      `}getCardSize(){return 5}}customElements.get("lcars-edit-entity-popup-card")||customElements.define("lcars-edit-entity-popup-card",s)})(),(()=>{var e=a(349),t=a(622),r=a(851);const i=e.AH`
  :host { display: block; }
  .edit-container { display: flex; flex-direction: column; gap: var(--lcars-gap); padding: 0.5rem 0; }
  .edit-field { display: flex; flex-direction: column; gap: 0.25rem; }
  .edit-label { font-family: var(--lcars-font); font-size: 0.625rem; color: var(--lcars-gray); text-transform: uppercase; }
  .edit-input { height: 2.5rem; padding: 0 0.75rem; background: var(--lcars-ice); color: var(--lcars-black); border: none; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; outline: none; }
  .edit-input:focus { box-shadow: 0 0 0 2px var(--lcars-btn-active); }
  .edit-actions { display: flex; gap: var(--lcars-gap); padding-top: 0.5rem; }
  .action-btn { flex: 1; height: var(--lcars-btn-height); background: var(--lcars-butterscotch); color: var(--lcars-black); border: none; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; cursor: pointer; transition: filter var(--lcars-transition); user-select: none; }
  .action-btn:hover { filter: brightness(1.2); }
`;class s extends e.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object}}}set hass(e){this._hass=e}setConfig(e){this._config=e}async _save(){if(this._hass)try{await this._hass.callWS({type:"lcars_dashboard/homepage_header/set",...this._getFormData()}),(0,r.rC)("lcars_dashboard_reload")}catch(e){console.error("LCARS Edit: Save failed",e)}}_getFormData(){const e=this.shadowRoot.querySelectorAll(".edit-input");return{title:e[0]?.value,subtitle:e[1]?.value}}static get styles(){return[t.Bx,i]}render(){return e.qy`
        <div class="edit-container">
          <div class="edit-field">
            <span class="edit-label">Header Title</span>
            <input class="edit-input" type="text" .value=${this._config?.title||"LCARS"} />
          </div>
          <div class="edit-field">
            <span class="edit-label">Subtitle</span>
            <input class="edit-input" type="text" .value=${this._config?.subtitle||""} />
          </div>
          <div class="edit-actions">
            <button class="action-btn" @click=${this._save}>Save</button>
          </div>
        </div>
      `}getCardSize(){return 3}}customElements.get("lcars-edit-homepage-header-card")||customElements.define("lcars-edit-homepage-header-card",s)})(),(()=>{var e=a(349),t=a(622),r=a(851);const i=e.AH`
  :host { display: block; }
  .edit-container { display: flex; flex-direction: column; gap: var(--lcars-gap); padding: 0.5rem 0; }
  .edit-field { display: flex; flex-direction: column; gap: 0.25rem; }
  .edit-label { font-family: var(--lcars-font); font-size: 0.625rem; color: var(--lcars-gray); text-transform: uppercase; }
  .edit-input { height: 2.5rem; padding: 0 0.75rem; background: var(--lcars-ice); color: var(--lcars-black); border: none; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; outline: none; }
  .edit-input:focus { box-shadow: 0 0 0 2px var(--lcars-btn-active); }
  .edit-actions { display: flex; gap: var(--lcars-gap); padding-top: 0.5rem; }
  .action-btn { flex: 1; height: var(--lcars-btn-height); background: var(--lcars-butterscotch); color: var(--lcars-black); border: none; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; cursor: pointer; transition: filter var(--lcars-transition); user-select: none; }
  .action-btn:hover { filter: brightness(1.2); }
`;class s extends e.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object}}}set hass(e){this._hass=e}setConfig(e){this._config=e}async _save(){if(this._hass)try{await this._hass.callWS({type:"lcars_dashboard/device_card/set",...this._getFormData()}),(0,r.rC)("lcars_dashboard_reload")}catch(e){console.error("LCARS Edit: Save failed",e)}}_getFormData(){const e=this.shadowRoot.querySelectorAll(".edit-input");return{device:e[0]?.value,name:e[1]?.value}}static get styles(){return[t.Bx,i]}render(){return e.qy`
        <div class="edit-container">
          <div class="edit-field">
            <span class="edit-label">Device ID</span>
            <input class="edit-input" type="text" .value=${this._config?.device||""} />
          </div>
          <div class="edit-field">
            <span class="edit-label">Card Name</span>
            <input class="edit-input" type="text" .value=${this._config?.name||""} />
          </div>
          <div class="edit-actions">
            <button class="action-btn" @click=${this._save}>Save</button>
          </div>
        </div>
      `}getCardSize(){return 3}}customElements.get("lcars-edit-device-card-card")||customElements.define("lcars-edit-device-card-card",s)})(),(()=>{var e=a(349),t=a(622),r=a(851);const i=e.AH`
  :host { display: block; }
  .edit-container { display: flex; flex-direction: column; gap: var(--lcars-gap); padding: 0.5rem 0; }
  .edit-field { display: flex; flex-direction: column; gap: 0.25rem; }
  .edit-label { font-family: var(--lcars-font); font-size: 0.625rem; color: var(--lcars-gray); text-transform: uppercase; }
  .edit-input { height: 2.5rem; padding: 0 0.75rem; background: var(--lcars-ice); color: var(--lcars-black); border: none; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; outline: none; }
  .edit-input:focus { box-shadow: 0 0 0 2px var(--lcars-btn-active); }
  .edit-textarea { min-height: 6rem; padding: 0.5rem 0.75rem; background: var(--lcars-ice); color: var(--lcars-black); border: none; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); outline: none; resize: vertical; }
  .edit-textarea:focus { box-shadow: 0 0 0 2px var(--lcars-btn-active); }
  .edit-actions { display: flex; gap: var(--lcars-gap); padding-top: 0.5rem; }
  .action-btn { flex: 1; height: var(--lcars-btn-height); background: var(--lcars-butterscotch); color: var(--lcars-black); border: none; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; cursor: pointer; transition: filter var(--lcars-transition); user-select: none; }
  .action-btn:hover { filter: brightness(1.2); }
`;class s extends e.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object}}}set hass(e){this._hass=e}setConfig(e){this._config=e}async _save(){if(this._hass)try{await this._hass.callWS({type:"lcars_dashboard/device_popup/set",...this._getFormData()}),(0,r.rC)("lcars_dashboard_reload")}catch(e){console.error("LCARS Edit: Save failed",e)}}_getFormData(){const e=this.shadowRoot.querySelector(".edit-input")?.value,t=this.shadowRoot.querySelector(".edit-textarea")?.value;return{device:e,yaml_config:t}}static get styles(){return[t.Bx,i]}render(){return e.qy`
        <div class="edit-container">
          <div class="edit-field">
            <span class="edit-label">Device ID</span>
            <input class="edit-input" type="text" .value=${this._config?.device||""} />
          </div>
          <div class="edit-field">
            <span class="edit-label">Popup YAML</span>
            <textarea class="edit-textarea" .value=${this._config?.yaml_config||""}></textarea>
          </div>
          <div class="edit-actions">
            <button class="action-btn" @click=${this._save}>Save</button>
          </div>
        </div>
      `}getCardSize(){return 5}}customElements.get("lcars-edit-device-popup-card")||customElements.define("lcars-edit-device-popup-card",s)})(),(()=>{var e=a(349),t=a(622),r=a(851);const i=e.AH`
  :host { display: block; }
  .edit-container { display: flex; flex-direction: column; gap: var(--lcars-gap); padding: 0.5rem 0; }
  .edit-field { display: flex; flex-direction: column; gap: 0.25rem; }
  .edit-label { font-family: var(--lcars-font); font-size: 0.625rem; color: var(--lcars-gray); text-transform: uppercase; }
  .edit-input { height: 2.5rem; padding: 0 0.75rem; background: var(--lcars-ice); color: var(--lcars-black); border: none; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; outline: none; }
  .edit-input:focus { box-shadow: 0 0 0 2px var(--lcars-btn-active); }
  .edit-actions { display: flex; gap: var(--lcars-gap); padding-top: 0.5rem; }
  .action-btn { flex: 1; height: var(--lcars-btn-height); background: var(--lcars-butterscotch); color: var(--lcars-black); border: none; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; cursor: pointer; transition: filter var(--lcars-transition); user-select: none; }
  .action-btn:hover { filter: brightness(1.2); }
`;class s extends e.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object}}}set hass(e){this._hass=e}setConfig(e){this._config=e}async _save(){if(this._hass)try{await this._hass.callWS({type:"lcars_dashboard/device_button/set",...this._getFormData()}),(0,r.rC)("lcars_dashboard_reload")}catch(e){console.error("LCARS Edit: Save failed",e)}}_getFormData(){const e=this.shadowRoot.querySelectorAll(".edit-input");return{device:e[0]?.value,name:e[1]?.value,icon:e[2]?.value}}static get styles(){return[t.Bx,i]}render(){return e.qy`
        <div class="edit-container">
          <div class="edit-field">
            <span class="edit-label">Device ID</span>
            <input class="edit-input" type="text" .value=${this._config?.device||""} />
          </div>
          <div class="edit-field">
            <span class="edit-label">Button Label</span>
            <input class="edit-input" type="text" .value=${this._config?.name||""} />
          </div>
          <div class="edit-field">
            <span class="edit-label">Icon</span>
            <input class="edit-input" type="text" .value=${this._config?.icon||""} placeholder="mdi:devices" />
          </div>
          <div class="edit-actions">
            <button class="action-btn" @click=${this._save}>Save</button>
          </div>
        </div>
      `}getCardSize(){return 4}}customElements.get("lcars-edit-device-button-card")||customElements.define("lcars-edit-device-button-card",s)})(),(()=>{var e=a(349),t=a(622),r=a(851);class i extends e.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object},_open:{type:Boolean},_card:{type:Object}}}constructor(){super(),this._open=!1,this._card=null}set hass(e){this._hass=e,this._card&&(this._card.hass=e)}setConfig(e){this._config=e,e.card&&this._createCard(e.card)}async _createCard(e){try{this._card=await(0,r.te)(e),this._hass&&(this._card.hass=this._hass),this.requestUpdate()}catch(e){console.error("LCARS Popup: Failed to create card",e)}}open(){this._open=!0}close(){this._open=!1}_handleBackdropClick(e){e.target===e.currentTarget&&this.close()}_handleKeydown(e){"Escape"===e.key&&this.close()}static get styles(){return[t.Bx,e.AH`
          :host { display: block; }

          .popup-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.7);
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            pointer-events: none;
            transition: opacity var(--lcars-transition);
          }

          .popup-backdrop[data-open] {
            opacity: 1;
            pointer-events: auto;
          }

          .popup-frame {
            background: var(--lcars-bg);
            border: 3px solid var(--lcars-butterscotch);
            border-radius: 0 2rem 0 2rem;
            max-width: 90vw;
            max-height: 85vh;
            min-width: 20rem;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            transform: scale(0.95);
            transition: transform var(--lcars-transition);
          }

          .popup-backdrop[data-open] .popup-frame {
            transform: scale(1);
          }

          .popup-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            background: var(--lcars-butterscotch);
            color: var(--lcars-black);
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
          }

          .popup-title { flex: 1; }

          .popup-close {
            background: none;
            border: none;
            color: var(--lcars-black);
            cursor: pointer;
            font-family: var(--lcars-font);
            font-size: 1rem;
            padding: 0.25rem 0.5rem;
          }

          .popup-close:hover {
            color: var(--lcars-red-alert);
          }

          .popup-body {
            padding: 1rem;
            overflow-y: auto;
            flex: 1;
          }

          @media (prefers-reduced-motion: reduce) {
            .popup-backdrop, .popup-frame { transition: none; }
          }
        `]}render(){return e.qy`
        <div
          class="popup-backdrop"
          ?data-open=${this._open}
          @click=${this._handleBackdropClick}
          @keydown=${this._handleKeydown}
          role="dialog"
          aria-modal="true"
          aria-label="${this._config?.title||"Popup"}"
        >
          <div class="popup-frame">
            <div class="popup-header">
              <span class="popup-title">${this._config?.title||"LCARS"}</span>
              <button class="popup-close" @click=${this.close} aria-label="Close">&#x2715;</button>
            </div>
            <div class="popup-body">
              ${this._card?e.qy`${this._card}`:""}
            </div>
          </div>
        </div>
      `}getCardSize(){return 0}}customElements.get("lcars-popup")||customElements.define("lcars-popup",i)})(),(()=>{var e=a(349),t=a(622),r=a(851),i=a(505),s=a(261);const n="lcars-sensors-grid",o=/^[a-z_]+\.[a-z0-9_]+$/,l=new Set(["fan","climate"]),c=new Set(["aqi","pm25","pm10","volatile_organic_compounds"]),d=/fridge|freezer|refrigerator|wine\s*cooler|kegerator|deep\s*freeze/i;class p extends e.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object},_sensorGroups:{type:Array},_sparklineData:{type:Object}}}constructor(){super(),this._sensorGroups=[],this._trackedEntityIds=new Set,this._sparklineCache=new Map,this._sparklineData=null,this._needsDiscovery=!0,this._lastRegistryRef=null}setConfig(e){const t=(e,t)=>null!=e?Math.max(-50,Math.min(200,Number(e))):t,a=(e,t)=>null!=e?Math.max(0,Math.min(100,Number(e))):t;this._config={...e,temp_comfort_min:t(e.temp_comfort_min,68),temp_comfort_max:t(e.temp_comfort_max,76),humidity_comfort_min:a(e.humidity_comfort_min,30),humidity_comfort_max:a(e.humidity_comfort_max,60),battery_alert:a(e.battery_alert,20),show_sparklines:!1!==e.show_sparklines,show_averages:!1!==e.show_averages,show_appliance_meters:!0===e.show_appliance_meters,group_by_floor:!1!==e.group_by_floor},this._needsDiscovery=!0}set hass(e){const t=this._hass;this._hass=e;const a=`${Object.keys(e.entities||{}).length}:${Object.keys(e.devices||{}).length}`;if(!t||this._needsDiscovery||a!==this._lastRegistryRef)return this._lastRegistryRef=a,this._discoverSensors(),this._needsDiscovery=!1,void this.requestUpdate();if(this._trackedEntityIds.size>0){let a=!1;for(const r of this._trackedEntityIds)if(t.states[r]!==e.states[r]){a=!0;break}if(!a)return}this.requestUpdate()}_discoverSensors(){if(!this._hass)return;const e=Object.values(this._hass.entities||{}),t=this._hass.devices||{},a=this._hass.areas||{},i=this._hass.floors||{},s=new Map;for(const t of e)t.device_id&&!t.disabled_by&&(s.has(t.device_id)||s.set(t.device_id,[]),s.get(t.device_id).push(t));const p=e.filter(e=>"temperature"===e.original_device_class&&!e.disabled_by&&o.test(e.entity_id)),u=[],m=new Set;for(const e of p){const r=e.device_id,n=t[r];if(!n)continue;const p=s.get(r)||[],h=p.some(e=>{const t=e.entity_id?.split(".")[0];return l.has(t)}),v=p.some(e=>c.has(e.original_device_class));if(h||v)continue;const f=n.name_by_user||n.name||"";if(!this._config.show_appliance_meters&&d.test(f))continue;const g=p.find(e=>"humidity"===e.original_device_class&&o.test(e.entity_id));if(!g)continue;const b=p.find(e=>"battery"===e.original_device_class&&o.test(e.entity_id)),y=n.area_id,w=y?a[y]:null,_=w?.floor_id,x=_?i[_]:null;u.push({deviceId:r,deviceName:f,areaId:y,areaName:w?w.name:f.replace(/^Meter\s*-\s*/i,""),floorId:_,floorName:x?x.name:"UNASSIGNED",floorLevel:x?x.level:-999,temperatureEntityId:e.entity_id,humidityEntityId:g.entity_id,batteryEntityId:b?b.entity_id:null}),m.add(e.entity_id),m.add(g.entity_id),b&&m.add(b.entity_id)}u.sort((e,t)=>t.floorLevel!==e.floorLevel?t.floorLevel-e.floorLevel:e.areaName.localeCompare(t.areaName)),this._sensorGroups=u,this._trackedEntityIds=m,r.g0.debug(n,`Discovered ${u.length} sensor groups, tracking ${m.size} entities`)}async _fetchSparklines(){if(!this._config?.show_sparklines||!this._hass||0===this._sensorGroups.length)return;const e=this._sensorGroups.map(e=>e.temperatureEntityId),t=await(0,s.s)(this._hass,"sensors-grid",e,this._sparklineCache,{maxEntities:Math.max(e.length,10)});t&&(this._sparklineData=t,this.requestUpdate())}firstUpdated(){this._fetchSparklines()}updated(e){e.has("_sensorGroups")&&this._sensorGroups.length>0&&this._fetchSparklines()}_getState(e){return e?this._hass?.states[e]:null}_getNumericState(e){const t=this._getState(e);if(!t||"unavailable"===t.state||"unknown"===t.state)return null;const a=parseFloat(t.state);return isNaN(a)?null:a}_isUnavailable(e){const t=this._getState(e);return!t||["unavailable","unknown"].includes(t.state)}_getStardate(){const e=new Date,t=e.getFullYear(),a=new Date(t,0,0),r=Math.floor((e-a)/864e5);return`${t}${String(r).padStart(3,"0")}.${String(e.getHours()).padStart(2,"0")}`}_handleTileTap(e,t){e.stopPropagation(),(0,r.Hv)(t)}_computeAverages(){const e=[],t=[];let a=0,r=0;for(const i of this._sensorGroups){const s=this._getNumericState(i.temperatureEntityId),n=this._getNumericState(i.humidityEntityId);if(null!=s&&(e.push(s),a++),null!=n&&t.push(n),i.batteryEntityId){const e=this._getNumericState(i.batteryEntityId);null!=e&&e<=(this._config.battery_alert||20)&&r++}}const i=e=>e.length>0?Math.round(e.reduce((e,t)=>e+t,0)/e.length*10)/10:null;return{avgTemp:i(e),avgHumidity:i(t),onlineCount:a,totalCount:this._sensorGroups.length,lowBatteryCount:r}}_groupByFloor(){const e=new Map;for(const t of this._sensorGroups){const a=t.floorName;e.has(a)||e.set(a,[]),e.get(a).push(t)}return e}_getSparklinePoints(e){return this._sparklineData&&this._sparklineData[e]?this._sparklineData[e]:null}render(){if(!this._hass||!this._config)return e.qy``;if(0===this._sensorGroups.length)return e.qy`
        <ha-card>
          <div class="lcars-sensors-grid empty" role="region"
               aria-label="Internal environmental sensors — no sensors found">
            <div class="sensors-header" role="heading" aria-level="3">
              <span class="sensors-header-title">INTERNAL SENSORS</span>
              <span class="sensors-header-line" aria-hidden="true"></span>
              <span class="sensors-header-stardate">${this._getStardate()}</span>
            </div>
            <div class="sensors-empty">NO ENVIRONMENTAL SENSORS DETECTED</div>
          </div>
        </ha-card>
      `;const t=this._groupByFloor(),a=this._config.show_averages?this._computeAverages():null;return e.qy`
      <ha-card>
        <div class="lcars-sensors-grid"
             role="region"
             aria-label="Internal environmental sensors — ${a?.onlineCount||0} rooms monitored">

          ${this._renderHeader()}
          ${this._renderBody(t)}
          ${a?this._renderSummary(a):""}
        </div>
      </ha-card>
    `}_renderHeader(){return e.qy`
      <div class="sensors-header" role="heading" aria-level="3">
        <span class="sensors-header-title">INTERNAL SENSORS</span>
        <span class="sensors-header-line" aria-hidden="true"></span>
        <span class="sensors-header-stardate">${this._getStardate()}</span>
      </div>
    `}_renderBody(t){return e.qy`
      <div class="sensors-body" role="list"
           aria-label="Room environmental readings grouped by floor">
        ${[...t.entries()].map(([t,a])=>e.qy`
          <div class="sensors-floor-group" role="group"
               aria-label="${t} — ${a.length} rooms">
            <div class="sensors-floor-label" role="heading" aria-level="4">
              ${t.toUpperCase()}
            </div>
            <div class="sensors-tile-grid" role="list">
              ${a.map((e,t)=>this._renderTile(e,t))}
            </div>
          </div>
        `)}
      </div>
    `}_renderTile(t,a){const r=this._getNumericState(t.temperatureEntityId),n=this._getNumericState(t.humidityEntityId),o=t.batteryEntityId?this._getNumericState(t.batteryEntityId):null,l=this._isUnavailable(t.temperatureEntityId),c=l?"unavailable":(0,i.HJ)(r),d=l?"var(--lcars-gray)":(0,i.sx)(r),p=l?"var(--lcars-gray)":(0,i.z5)(n),u=null!=o&&o<=(this._config.battery_alert||20),m=this._config.show_sparklines?this._getSparklinePoints(t.temperatureEntityId):null;let h=l?`${t.areaName}: sensor offline`:`${t.areaName}: ${null!=r?Math.round(r):"?"} degrees, ${null!=n?Math.round(n):"?"} percent humidity`;return u&&(h+=`. Low battery: ${Math.round(o)} percent`),e.qy`
      <div class="sensor-tile ${c}"
           tabindex="0"
           role="listitem"
           aria-label="${h}"
           style="--tile-index: ${a}"
           @click=${e=>this._handleTileTap(e,t.temperatureEntityId)}
           @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._handleTileTap(e,t.temperatureEntityId))}}>

        <div class="tile-name">${t.areaName}</div>

        <div class="tile-readings">
          <span class="tile-temp" style="color: ${d}">
            ${null!=r?`${Math.round(r)}°`:"—"}
          </span>
          <span class="tile-humidity" style="color: ${p}">
            ${null!=n?`${Math.round(n)}%`:"—"}
          </span>
        </div>

        ${u?e.qy`
          <div class="tile-battery-badge"
               aria-label="Low battery: ${Math.round(o)} percent"
               title="BATTERY: ${Math.round(o)}%">●</div>
        `:""}

        ${m&&m.length>=2?e.qy`
          ${(0,s.K)(m,{color:d,width:100,height:16,className:"tile-sparkline"})}
        `:""}

        ${l?e.qy`
          <div class="tile-unavailable" aria-label="Sensor unavailable">
            <span>OFFLINE</span>
          </div>
        `:""}
      </div>
    `}_renderSummary(t){const a=null!=t.avgTemp?(0,i.sx)(t.avgTemp):"var(--lcars-gray)",r=null!=t.avgHumidity?(0,i.z5)(t.avgHumidity):"var(--lcars-gray)";return e.qy`
      <div class="sensors-summary" role="status" aria-live="polite">
        <span class="summary-label">SHIP AVG</span>
        <span class="summary-temp" style="color: ${a}">
          ${null!=t.avgTemp?`${t.avgTemp}°`:"—"}
        </span>
        <span class="summary-humidity" style="color: ${r}">
          ${null!=t.avgHumidity?`${t.avgHumidity}%RH`:"—"}
        </span>
        <span class="summary-divider" aria-hidden="true">■</span>
        <span class="summary-online">
          ${t.onlineCount} ${1===t.onlineCount?"SENSOR":"SENSORS"} ONLINE
        </span>
        ${t.lowBatteryCount>0?e.qy`
          <span class="summary-low" style="color: var(--lcars-tomato)">
            ● ${t.lowBatteryCount} LOW
          </span>
        `:""}
      </div>
    `}static get styles(){return[t.Bx,e.AH`
        :host { display: block; --grid-frame-color: var(--lcars-ice); }
        ha-card { background: transparent; border: none; box-shadow: none; }

        .lcars-sensors-grid {
          display: flex; flex-direction: column;
          border: 2px solid var(--grid-frame-color);
          border-radius: 0 0.75rem 0.75rem 0;
          overflow: hidden; background: var(--lcars-bg);
        }
        .lcars-sensors-grid.empty { min-height: 6rem; }
        .sensors-empty {
          display: flex; align-items: center; justify-content: center;
          padding: 2rem; font-size: var(--lcars-font-size-data);
          color: var(--lcars-gray); letter-spacing: 0.1em;
        }

        .sensors-header {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.25rem 0.75rem; min-height: var(--lcars-bar-height);
          border-bottom: 2px solid var(--grid-frame-color);
        }
        .sensors-header-title { font-size: var(--lcars-font-size-sub); color: var(--lcars-sunflower); white-space: nowrap; letter-spacing: 0.05em; }
        .sensors-header-line { flex: 1; height: 2px; background: var(--grid-frame-color); min-width: 1rem; }
        .sensors-header-stardate { font-size: var(--lcars-font-size-data); color: var(--lcars-ice); white-space: nowrap; }

        .sensors-body { display: flex; flex-direction: column; gap: var(--lcars-gap); padding: var(--lcars-gap); }
        .sensors-floor-group { display: flex; flex-direction: column; gap: var(--lcars-gap); }
        .sensors-floor-label {
          font-size: var(--lcars-font-size-data); color: var(--lcars-ice);
          letter-spacing: 0.1em; padding: 0.125rem 0.5rem;
          display: flex; align-items: center; gap: 0.5rem;
        }
        .sensors-floor-label::before {
          content: ''; display: inline-block; width: 0.5rem; height: 0.5rem;
          background: var(--lcars-ice); flex-shrink: 0;
        }

        .sensors-tile-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(9.5rem, 1fr));
          gap: var(--lcars-gap);
        }

        .sensor-tile {
          position: relative; display: flex; flex-direction: column; gap: 0.125rem;
          padding: 0.375rem 0.5rem; min-height: calc(var(--lcars-vunit) * 1.5); min-width: 7.5rem;
          background: var(--lcars-bg); border: 2px solid var(--lcars-gray);
          border-radius: 0 0.75rem 0.75rem 0; overflow: hidden;
          transition: border-color var(--lcars-transition-speed) var(--lcars-transition-function);
          cursor: default;
          animation: tile-appear 0.3s ease both;
          animation-delay: calc(min(var(--tile-index, 0), 20) * 50ms);
        }
        @keyframes tile-appear { from { opacity: 0; transform: translateY(0.25rem); } }
        .sensor-tile.comfort-nominal { border-color: var(--lcars-ice); }
        .sensor-tile.comfort-warm { border-color: var(--lcars-butterscotch); }
        .sensor-tile.comfort-hot { border-color: var(--lcars-peach); }
        .sensor-tile.comfort-cool { border-color: var(--lcars-bluey); }
        .sensor-tile.comfort-cold { border-color: var(--lcars-blue); }
        .sensor-tile.unavailable { border-color: var(--lcars-gray); opacity: 0.5; }
        .sensor-tile:focus-visible { outline: 2px solid var(--lcars-sunflower); outline-offset: 2px; }

        .tile-name {
          font-size: var(--lcars-font-size-data); color: var(--lcars-sunflower);
          letter-spacing: 0.05em; white-space: nowrap; overflow: hidden;
          text-overflow: ellipsis; line-height: 1.2;
        }
        .tile-readings { display: flex; align-items: baseline; gap: 0.5rem; }
        .tile-temp {
          font-size: var(--lcars-font-size-sub); font-weight: 700; line-height: 1;
          transition: color var(--lcars-transition-speed) var(--lcars-transition-function);
        }
        .tile-humidity {
          font-size: var(--lcars-font-size-data); line-height: 1; opacity: 0.85;
          transition: color var(--lcars-transition-speed) var(--lcars-transition-function);
        }

        .tile-battery-badge {
          position: absolute; top: 0.25rem; right: 0.5rem;
          color: var(--lcars-tomato); font-size: 0.5rem; line-height: 1;
          animation: battery-pulse 2s ease-in-out infinite;
        }
        @keyframes battery-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

        .tile-sparkline-wrap { width: 100%; margin-top: auto; }
        .tile-sparkline { width: 100%; height: 1rem; display: block; }

        .tile-unavailable {
          position: absolute; inset: 0; display: flex; align-items: center;
          justify-content: center; background: rgba(0,0,0,0.7); z-index: 1;
        }
        .tile-unavailable span { font-size: var(--lcars-font-size-data); color: var(--lcars-gray); letter-spacing: 0.1em; }

        .sensors-summary {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.375rem 0.75rem; border-top: 2px solid var(--grid-frame-color); flex-wrap: wrap;
        }
        .summary-label { font-size: var(--lcars-font-size-data); color: var(--lcars-sunflower); letter-spacing: 0.05em; font-weight: 700; }
        .summary-temp, .summary-humidity { font-size: var(--lcars-font-size-sub); font-weight: 700; }
        .summary-divider { color: var(--lcars-gray); font-size: 0.5rem; }
        .summary-online { font-size: var(--lcars-font-size-data); color: var(--lcars-ice); }
        .summary-low { font-size: var(--lcars-font-size-data); margin-left: auto; }

        @media (max-width: 767px) {
          .tile-sparkline-wrap, .tile-sparkline { display: none; }
          .sensor-tile { flex-direction: row; align-items: center; gap: 0.5rem; min-height: var(--lcars-vunit); padding: 0.25rem 0.5rem; }
          .tile-name { flex: 1; min-width: 0; }
          .tile-readings { flex-shrink: 0; }
          .sensors-summary { gap: 0.25rem 0.75rem; }
        }
        @media (prefers-reduced-motion: reduce) {
          .sensor-tile, .tile-temp, .tile-humidity { transition: none !important; }
          .sensor-tile { animation: none !important; }
          .tile-battery-badge { animation: none !important; opacity: 1; }
        }
      `]}getCardSize(){return Math.max(2,Math.ceil(this._sensorGroups.length/4)+1)}}customElements.get("lcars-internal-sensors-grid")||(customElements.define("lcars-internal-sensors-grid",p),r.g0.debug(n,"Custom element registered: lcars-internal-sensors-grid")),window.customCards=window.customCards||[],window.customCards.push({type:"lcars-internal-sensors-grid",name:"LCARS Internal Sensors Grid",description:"Ship-wide environmental monitoring grid",preview:!0})})()})();