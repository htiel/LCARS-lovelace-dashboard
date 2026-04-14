/*! For license information please see lcars-dashboard.js.LICENSE.txt */
(()=>{"use strict";var e={851(e,t,a){a.d(t,{Bo:()=>d,Hv:()=>l,g0:()=>r,o6:()=>i,oo:()=>o,rC:()=>n,te:()=>c});const r={_prefix:e=>`%c[LCARS ${e}]`,_style:"color: #f1b864; font-weight: bold",debug:(e,...t)=>{window.__LCARS_DEBUG&&console.debug(r._prefix(e),r._style,...t)},info:(e,...t)=>console.info(r._prefix(e),r._style,...t),warn:(e,...t)=>console.warn(r._prefix(e),r._style,...t),error:(e,...t)=>console.error(r._prefix(e),r._style,...t)},i=new EventTarget;function s(){const e=document.querySelector("hc-main");if(e)return e.hass;const t=document.querySelector("home-assistant");return t?t.hass:void 0}function n(e,t={},a=null){const r=new Event(e,{bubbles:!0,cancelable:!1,composed:!0});if(r.detail=t,a)a.dispatchEvent(r);else{const e=function(){let e=document.querySelector("hc-main");return e?(e=e?.shadowRoot?.querySelector("hc-lovelace")?.shadowRoot,e?.querySelector("hui-view")||e?.querySelector("hui-panel-view")):(e=document.querySelector("home-assistant"),e=e?.shadowRoot?.querySelector("home-assistant-main")?.shadowRoot,e=e?.querySelector("app-drawer-layout partial-panel-resolver"),e=e?.shadowRoot||e,e=e?.querySelector("ha-panel-lovelace")?.shadowRoot,e=e?.querySelector("hui-root")?.shadowRoot,e=e?.querySelector("ha-app-layout")?.querySelector("#view"),e?.firstElementChild)}();e&&e.dispatchEvent(r)}}function o(e,t=!1){t?history.replaceState(null,"",e):history.pushState(null,"",e),n("location-changed",{replace:t},window)}function l(e){n("hass-more-info",{entityId:e},document.querySelector("hc-main")||document.querySelector("home-assistant"))}async function c(e){const t=e.type?.startsWith("custom:")?e.type.slice(7):`hui-${e.type}-card`;if(customElements.get(t)||(await async function(){if(customElements.get("hui-view"))return!0;await customElements.whenDefined("partial-panel-resolver");const e=document.createElement("partial-panel-resolver");if(e.hass={panels:[{url_path:"tmp",component_name:"lovelace"}]},e._updateRoutes(),await e.routerOptions.routes.tmp.load(),!customElements.get("ha-panel-lovelace"))return!1;const t=document.createElement("ha-panel-lovelace");return t.hass=s(),void 0===t.hass&&(await new Promise(e=>{window.addEventListener("connection-status",()=>e(),{once:!0})}),t.hass=s()),t.panel={config:{mode:null}},t._fetchConfig(),!0}(),await new Promise(e=>setTimeout(e,100))),"function"==typeof window.loadCardHelpers)try{const t=await window.loadCardHelpers();return await t.createCardElement(e)}catch(e){}const a=document.createElement(t);return a.setConfig&&a.setConfig(e),a}function d(e,t,a,r="Configure"){const i=document.createElement("lcars-popup");i.hass=e,i.setConfig({title:r,card:{type:`custom:${t}`,...a}});const s=new MutationObserver(()=>{const e=i.shadowRoot?.querySelector(".popup-backdrop");e&&!e.hasAttribute("data-open")&&setTimeout(()=>{i.remove(),s.disconnect()},300)});document.body.appendChild(i),s.observe(i.shadowRoot||i,{attributes:!0,subtree:!0}),setTimeout(()=>{s.disconnect()},3e5),requestAnimationFrame(()=>i.open())}},622(e,t,a){a.d(t,{B:()=>s});var r=a(845);const i=r.AH`
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
  --lcars-font-size-sub: 1.25rem;
  --lcars-font-size-data: 0.875rem;

  /* ─── Animation ─── */
  --lcars-transition: 200ms ease-out;
  --lcars-transition-slow: 400ms ease-out;
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
`},845(e,t,a){a.d(t,{WF:()=>re,AH:()=>te,qy:()=>L});const r="undefined"!=typeof window&&null!=window.customElements&&void 0!==window.customElements.polyfillWrapFlushCallback,i=(e,t,a=null)=>{for(;t!==a;){const a=t.nextSibling;e.removeChild(t),t=a}},s=`{{lit-${String(Math.random()).slice(2)}}}`,n=`\x3c!--${s}--\x3e`,o=new RegExp(`${s}|${n}`),l="$lit$";class c{constructor(e,t){this.parts=[],this.element=t;const a=[],r=[],i=document.createTreeWalker(t.content,133,null,!1);let n=0,c=-1,p=0;const{strings:m,values:{length:v}}=e;for(;p<v;){const e=i.nextNode();if(null!==e){if(c++,1===e.nodeType){if(e.hasAttributes()){const t=e.attributes,{length:a}=t;let r=0;for(let e=0;e<a;e++)d(t[e].name,l)&&r++;for(;r-- >0;){const t=m[p],a=h.exec(t)[2],r=a.toLowerCase()+l,i=e.getAttribute(r);e.removeAttribute(r);const s=i.split(o);this.parts.push({type:"attribute",index:c,name:a,strings:s}),p+=s.length-1}}"TEMPLATE"===e.tagName&&(r.push(e),i.currentNode=e.content)}else if(3===e.nodeType){const t=e.data;if(t.indexOf(s)>=0){const r=e.parentNode,i=t.split(o),s=i.length-1;for(let t=0;t<s;t++){let a,s=i[t];if(""===s)a=u();else{const e=h.exec(s);null!==e&&d(e[2],l)&&(s=s.slice(0,e.index)+e[1]+e[2].slice(0,-5)+e[3]),a=document.createTextNode(s)}r.insertBefore(a,e),this.parts.push({type:"node",index:++c})}""===i[s]?(r.insertBefore(u(),e),a.push(e)):e.data=i[s],p+=s}}else if(8===e.nodeType)if(e.data===s){const t=e.parentNode;null!==e.previousSibling&&c!==n||(c++,t.insertBefore(u(),e)),n=c,this.parts.push({type:"node",index:c}),null===e.nextSibling?e.data="":(a.push(e),c--),p++}else{let t=-1;for(;-1!==(t=e.data.indexOf(s,t+1));)this.parts.push({type:"node",index:-1}),p++}}else i.currentNode=r.pop()}for(const e of a)e.parentNode.removeChild(e)}}const d=(e,t)=>{const a=e.length-t.length;return a>=0&&e.slice(a)===t},p=e=>-1!==e.index,u=()=>document.createComment(""),h=/([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F "'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;function m(e,t){const{element:{content:a},parts:r}=e,i=document.createTreeWalker(a,133,null,!1);let s=f(r),n=r[s],o=-1,l=0;const c=[];let d=null;for(;i.nextNode();){o++;const e=i.currentNode;for(e.previousSibling===d&&(d=null),t.has(e)&&(c.push(e),null===d&&(d=e)),null!==d&&l++;void 0!==n&&n.index===o;)n.index=null!==d?-1:n.index-l,s=f(r,s),n=r[s]}c.forEach(e=>e.parentNode.removeChild(e))}const v=e=>{let t=11===e.nodeType?0:1;const a=document.createTreeWalker(e,133,null,!1);for(;a.nextNode();)t++;return t},f=(e,t=-1)=>{for(let a=t+1;a<e.length;a++){const t=e[a];if(p(t))return a}return-1},g=new WeakMap,b=e=>"function"==typeof e&&g.has(e),y={},_={};class w{constructor(e,t,a){this.__parts=[],this.template=e,this.processor=t,this.options=a}update(e){let t=0;for(const a of this.__parts)void 0!==a&&a.setValue(e[t]),t++;for(const e of this.__parts)void 0!==e&&e.commit()}_clone(){const e=r?this.template.element.content.cloneNode(!0):document.importNode(this.template.element.content,!0),t=[],a=this.template.parts,i=document.createTreeWalker(e,133,null,!1);let s,n=0,o=0,l=i.nextNode();for(;n<a.length;)if(s=a[n],p(s)){for(;o<s.index;)o++,"TEMPLATE"===l.nodeName&&(t.push(l),i.currentNode=l.content),null===(l=i.nextNode())&&(i.currentNode=t.pop(),l=i.nextNode());if("node"===s.type){const e=this.processor.handleTextExpression(this.options);e.insertAfterNode(l.previousSibling),this.__parts.push(e)}else this.__parts.push(...this.processor.handleAttributeExpressions(l,s.name,s.strings,this.options));n++}else this.__parts.push(void 0),n++;return r&&(document.adoptNode(e),customElements.upgrade(e)),e}}const x=window.trustedTypes&&trustedTypes.createPolicy("lit-html",{createHTML:e=>e}),$=` ${s} `;class k{constructor(e,t,a,r){this.strings=e,this.values=t,this.type=a,this.processor=r}getHTML(){const e=this.strings.length-1;let t="",a=!1;for(let r=0;r<e;r++){const e=this.strings[r],i=e.lastIndexOf("\x3c!--");a=(i>-1||a)&&-1===e.indexOf("--\x3e",i+1);const o=h.exec(e);t+=null===o?e+(a?$:n):e.substr(0,o.index)+o[1]+o[2]+l+o[3]+s}return t+=this.strings[e],t}getTemplateElement(){const e=document.createElement("template");let t=this.getHTML();return void 0!==x&&(t=x.createHTML(t)),e.innerHTML=t,e}}const S=e=>null===e||!("object"==typeof e||"function"==typeof e),C=e=>Array.isArray(e)||!(!e||!e[Symbol.iterator]);class E{constructor(e,t,a){this.dirty=!0,this.element=e,this.name=t,this.strings=a,this.parts=[];for(let e=0;e<a.length-1;e++)this.parts[e]=this._createPart()}_createPart(){return new z(this)}_getValue(){const e=this.strings,t=e.length-1,a=this.parts;if(1===t&&""===e[0]&&""===e[1]){const e=a[0].value;if("symbol"==typeof e)return String(e);if("string"==typeof e||!C(e))return e}let r="";for(let i=0;i<t;i++){r+=e[i];const t=a[i];if(void 0!==t){const e=t.value;if(S(e)||!C(e))r+="string"==typeof e?e:String(e);else for(const t of e)r+="string"==typeof t?t:String(t)}}return r+=e[t],r}commit(){this.dirty&&(this.dirty=!1,this.element.setAttribute(this.name,this._getValue()))}}class z{constructor(e){this.value=void 0,this.committer=e}setValue(e){e===y||S(e)&&e===this.value||(this.value=e,b(e)||(this.committer.dirty=!0))}commit(){for(;b(this.value);){const e=this.value;this.value=y,e(this)}this.value!==y&&this.committer.commit()}}class A{constructor(e){this.value=void 0,this.__pendingValue=void 0,this.options=e}appendInto(e){this.startNode=e.appendChild(u()),this.endNode=e.appendChild(u())}insertAfterNode(e){this.startNode=e,this.endNode=e.nextSibling}appendIntoPart(e){e.__insert(this.startNode=u()),e.__insert(this.endNode=u())}insertAfterPart(e){e.__insert(this.startNode=u()),this.endNode=e.endNode,e.endNode=this.startNode}setValue(e){this.__pendingValue=e}commit(){if(null===this.startNode.parentNode)return;for(;b(this.__pendingValue);){const e=this.__pendingValue;this.__pendingValue=y,e(this)}const e=this.__pendingValue;e!==y&&(S(e)?e!==this.value&&this.__commitText(e):e instanceof k?this.__commitTemplateResult(e):e instanceof Node?this.__commitNode(e):C(e)?this.__commitIterable(e):e===_?(this.value=_,this.clear()):this.__commitText(e))}__insert(e){this.endNode.parentNode.insertBefore(e,this.endNode)}__commitNode(e){this.value!==e&&(this.clear(),this.__insert(e),this.value=e)}__commitText(e){const t=this.startNode.nextSibling,a="string"==typeof(e=null==e?"":e)?e:String(e);t===this.endNode.previousSibling&&3===t.nodeType?t.data=a:this.__commitNode(document.createTextNode(a)),this.value=e}__commitTemplateResult(e){const t=this.options.templateFactory(e);if(this.value instanceof w&&this.value.template===t)this.value.update(e.values);else{const a=new w(t,e.processor,this.options),r=a._clone();a.update(e.values),this.__commitNode(r),this.value=a}}__commitIterable(e){Array.isArray(this.value)||(this.value=[],this.clear());const t=this.value;let a,r=0;for(const i of e)a=t[r],void 0===a&&(a=new A(this.options),t.push(a),0===r?a.appendIntoPart(this):a.insertAfterPart(t[r-1])),a.setValue(i),a.commit(),r++;r<t.length&&(t.length=r,this.clear(a&&a.endNode))}clear(e=this.startNode){i(this.startNode.parentNode,e.nextSibling,this.endNode)}}class q{constructor(e,t,a){if(this.value=void 0,this.__pendingValue=void 0,2!==a.length||""!==a[0]||""!==a[1])throw new Error("Boolean attributes can only contain a single expression");this.element=e,this.name=t,this.strings=a}setValue(e){this.__pendingValue=e}commit(){for(;b(this.__pendingValue);){const e=this.__pendingValue;this.__pendingValue=y,e(this)}if(this.__pendingValue===y)return;const e=!!this.__pendingValue;this.value!==e&&(e?this.element.setAttribute(this.name,""):this.element.removeAttribute(this.name),this.value=e),this.__pendingValue=y}}class P extends E{constructor(e,t,a){super(e,t,a),this.single=2===a.length&&""===a[0]&&""===a[1]}_createPart(){return new N(this)}_getValue(){return this.single?this.parts[0].value:super._getValue()}commit(){this.dirty&&(this.dirty=!1,this.element[this.name]=this._getValue())}}class N extends z{}let D=!1;(()=>{try{const e={get capture(){return D=!0,!1}};window.addEventListener("test",e,e),window.removeEventListener("test",e,e)}catch(e){}})();class M{constructor(e,t,a){this.value=void 0,this.__pendingValue=void 0,this.element=e,this.eventName=t,this.eventContext=a,this.__boundHandleEvent=e=>this.handleEvent(e)}setValue(e){this.__pendingValue=e}commit(){for(;b(this.__pendingValue);){const e=this.__pendingValue;this.__pendingValue=y,e(this)}if(this.__pendingValue===y)return;const e=this.__pendingValue,t=this.value,a=null==e||null!=t&&(e.capture!==t.capture||e.once!==t.once||e.passive!==t.passive),r=null!=e&&(null==t||a);a&&this.element.removeEventListener(this.eventName,this.__boundHandleEvent,this.__options),r&&(this.__options=T(e),this.element.addEventListener(this.eventName,this.__boundHandleEvent,this.__options)),this.value=e,this.__pendingValue=y}handleEvent(e){"function"==typeof this.value?this.value.call(this.eventContext||this.element,e):this.value.handleEvent(e)}}const T=e=>e&&(D?{capture:e.capture,passive:e.passive,once:e.once}:e.capture);function F(e){let t=O.get(e.type);void 0===t&&(t={stringsArray:new WeakMap,keyString:new Map},O.set(e.type,t));let a=t.stringsArray.get(e.strings);if(void 0!==a)return a;const r=e.strings.join(s);return a=t.keyString.get(r),void 0===a&&(a=new c(e,e.getTemplateElement()),t.keyString.set(r,a)),t.stringsArray.set(e.strings,a),a}const O=new Map,I=new WeakMap,R=new class{handleAttributeExpressions(e,t,a,r){const i=t[0];return"."===i?new P(e,t.slice(1),a).parts:"@"===i?[new M(e,t.slice(1),r.eventContext)]:"?"===i?[new q(e,t.slice(1),a)]:new E(e,t,a).parts}handleTextExpression(e){return new A(e)}};"undefined"!=typeof window&&(window.litHtmlVersions||(window.litHtmlVersions=[])).push("1.4.1");const L=(e,...t)=>new k(e,t,"html",R),B=(e,t)=>`${e}--${t}`;let W=!0;void 0===window.ShadyCSS?W=!1:void 0===window.ShadyCSS.prepareTemplateDom&&(console.warn("Incompatible ShadyCSS version detected. Please update to at least @webcomponents/webcomponentsjs@2.0.2 and @webcomponents/shadycss@1.3.1."),W=!1);const j=e=>t=>{const a=B(t.type,e);let r=O.get(a);void 0===r&&(r={stringsArray:new WeakMap,keyString:new Map},O.set(a,r));let i=r.stringsArray.get(t.strings);if(void 0!==i)return i;const n=t.strings.join(s);if(i=r.keyString.get(n),void 0===i){const a=t.getTemplateElement();W&&window.ShadyCSS.prepareTemplateDom(a,e),i=new c(t,a),r.keyString.set(n,i)}return r.stringsArray.set(t.strings,i),i},H=["html","svg"],U=new Set;window.JSCompiler_renameProperty=(e,t)=>e;const V={toAttribute(e,t){switch(t){case Boolean:return e?"":null;case Object:case Array:return null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){switch(t){case Boolean:return null!==e;case Number:return null===e?null:Number(e);case Object:case Array:return JSON.parse(e)}return e}},G=(e,t)=>t!==e&&(t==t||e==e),X={attribute:!0,type:String,converter:V,reflect:!1,hasChanged:G},J="finalized";class Y extends HTMLElement{constructor(){super(),this.initialize()}static get observedAttributes(){this.finalize();const e=[];return this._classProperties.forEach((t,a)=>{const r=this._attributeNameForProperty(a,t);void 0!==r&&(this._attributeToPropertyMap.set(r,a),e.push(r))}),e}static _ensureClassProperties(){if(!this.hasOwnProperty(JSCompiler_renameProperty("_classProperties",this))){this._classProperties=new Map;const e=Object.getPrototypeOf(this)._classProperties;void 0!==e&&e.forEach((e,t)=>this._classProperties.set(t,e))}}static createProperty(e,t=X){if(this._ensureClassProperties(),this._classProperties.set(e,t),t.noAccessor||this.prototype.hasOwnProperty(e))return;const a="symbol"==typeof e?Symbol():`__${e}`,r=this.getPropertyDescriptor(e,a,t);void 0!==r&&Object.defineProperty(this.prototype,e,r)}static getPropertyDescriptor(e,t,a){return{get(){return this[t]},set(r){const i=this[e];this[t]=r,this.requestUpdateInternal(e,i,a)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this._classProperties&&this._classProperties.get(e)||X}static finalize(){const e=Object.getPrototypeOf(this);if(e.hasOwnProperty(J)||e.finalize(),this[J]=!0,this._ensureClassProperties(),this._attributeToPropertyMap=new Map,this.hasOwnProperty(JSCompiler_renameProperty("properties",this))){const e=this.properties,t=[...Object.getOwnPropertyNames(e),..."function"==typeof Object.getOwnPropertySymbols?Object.getOwnPropertySymbols(e):[]];for(const a of t)this.createProperty(a,e[a])}}static _attributeNameForProperty(e,t){const a=t.attribute;return!1===a?void 0:"string"==typeof a?a:"string"==typeof e?e.toLowerCase():void 0}static _valueHasChanged(e,t,a=G){return a(e,t)}static _propertyValueFromAttribute(e,t){const a=t.type,r=t.converter||V,i="function"==typeof r?r:r.fromAttribute;return i?i(e,a):e}static _propertyValueToAttribute(e,t){if(void 0===t.reflect)return;const a=t.type,r=t.converter;return(r&&r.toAttribute||V.toAttribute)(e,a)}initialize(){this._updateState=0,this._updatePromise=new Promise(e=>this._enableUpdatingResolver=e),this._changedProperties=new Map,this._saveInstanceProperties(),this.requestUpdateInternal()}_saveInstanceProperties(){this.constructor._classProperties.forEach((e,t)=>{if(this.hasOwnProperty(t)){const e=this[t];delete this[t],this._instanceProperties||(this._instanceProperties=new Map),this._instanceProperties.set(t,e)}})}_applyInstanceProperties(){this._instanceProperties.forEach((e,t)=>this[t]=e),this._instanceProperties=void 0}connectedCallback(){this.enableUpdating()}enableUpdating(){void 0!==this._enableUpdatingResolver&&(this._enableUpdatingResolver(),this._enableUpdatingResolver=void 0)}disconnectedCallback(){}attributeChangedCallback(e,t,a){t!==a&&this._attributeToProperty(e,a)}_propertyToAttribute(e,t,a=X){const r=this.constructor,i=r._attributeNameForProperty(e,a);if(void 0!==i){const e=r._propertyValueToAttribute(t,a);if(void 0===e)return;this._updateState=8|this._updateState,null==e?this.removeAttribute(i):this.setAttribute(i,e),this._updateState=-9&this._updateState}}_attributeToProperty(e,t){if(8&this._updateState)return;const a=this.constructor,r=a._attributeToPropertyMap.get(e);if(void 0!==r){const e=a.getPropertyOptions(r);this._updateState=16|this._updateState,this[r]=a._propertyValueFromAttribute(t,e),this._updateState=-17&this._updateState}}requestUpdateInternal(e,t,a){let r=!0;if(void 0!==e){const i=this.constructor;a=a||i.getPropertyOptions(e),i._valueHasChanged(this[e],t,a.hasChanged)?(this._changedProperties.has(e)||this._changedProperties.set(e,t),!0!==a.reflect||16&this._updateState||(void 0===this._reflectingProperties&&(this._reflectingProperties=new Map),this._reflectingProperties.set(e,a))):r=!1}!this._hasRequestedUpdate&&r&&(this._updatePromise=this._enqueueUpdate())}requestUpdate(e,t){return this.requestUpdateInternal(e,t),this.updateComplete}async _enqueueUpdate(){this._updateState=4|this._updateState;try{await this._updatePromise}catch(e){}const e=this.performUpdate();return null!=e&&await e,!this._hasRequestedUpdate}get _hasRequestedUpdate(){return 4&this._updateState}get hasUpdated(){return 1&this._updateState}performUpdate(){if(!this._hasRequestedUpdate)return;this._instanceProperties&&this._applyInstanceProperties();let e=!1;const t=this._changedProperties;try{e=this.shouldUpdate(t),e?this.update(t):this._markUpdated()}catch(t){throw e=!1,this._markUpdated(),t}e&&(1&this._updateState||(this._updateState=1|this._updateState,this.firstUpdated(t)),this.updated(t))}_markUpdated(){this._changedProperties=new Map,this._updateState=-5&this._updateState}get updateComplete(){return this._getUpdateComplete()}_getUpdateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._updatePromise}shouldUpdate(e){return!0}update(e){void 0!==this._reflectingProperties&&this._reflectingProperties.size>0&&(this._reflectingProperties.forEach((e,t)=>this._propertyToAttribute(t,this[t],e)),this._reflectingProperties=void 0),this._markUpdated()}updated(e){}firstUpdated(e){}}Y[J]=!0;const Q=Element.prototype;Q.msMatchesSelector||Q.webkitMatchesSelector;const Z=window.ShadowRoot&&(void 0===window.ShadyCSS||window.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,K=Symbol();class ee{constructor(e,t){if(t!==K)throw new Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e}get styleSheet(){return void 0===this._styleSheet&&(Z?(this._styleSheet=new CSSStyleSheet,this._styleSheet.replaceSync(this.cssText)):this._styleSheet=null),this._styleSheet}toString(){return this.cssText}}const te=(e,...t)=>{const a=t.reduce((t,a,r)=>t+(e=>{if(e instanceof ee)return e.cssText;if("number"==typeof e)return e;throw new Error(`Value passed to 'css' function must be a 'css' function result: ${e}. Use 'unsafeCSS' to pass non-literal values, but\n            take care to ensure page security.`)})(a)+e[r+1],e[0]);return new ee(a,K)};(window.litElementVersions||(window.litElementVersions=[])).push("2.5.1");const ae={};class re extends Y{static getStyles(){return this.styles}static _getUniqueStyles(){if(this.hasOwnProperty(JSCompiler_renameProperty("_styles",this)))return;const e=this.getStyles();if(Array.isArray(e)){const t=(e,a)=>e.reduceRight((e,a)=>Array.isArray(a)?t(a,e):(e.add(a),e),a),a=t(e,new Set),r=[];a.forEach(e=>r.unshift(e)),this._styles=r}else this._styles=void 0===e?[]:[e];this._styles=this._styles.map(e=>{if(e instanceof CSSStyleSheet&&!Z){const t=Array.prototype.slice.call(e.cssRules).reduce((e,t)=>e+t.cssText,"");return new ee(String(t),K)}return e})}initialize(){super.initialize(),this.constructor._getUniqueStyles(),this.renderRoot=this.createRenderRoot(),window.ShadowRoot&&this.renderRoot instanceof window.ShadowRoot&&this.adoptStyles()}createRenderRoot(){return this.attachShadow(this.constructor.shadowRootOptions)}adoptStyles(){const e=this.constructor._styles;0!==e.length&&(void 0===window.ShadyCSS||window.ShadyCSS.nativeShadow?Z?this.renderRoot.adoptedStyleSheets=e.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet):this._needsShimAdoptedStyleSheets=!0:window.ShadyCSS.ScopingShim.prepareAdoptedCssText(e.map(e=>e.cssText),this.localName))}connectedCallback(){super.connectedCallback(),this.hasUpdated&&void 0!==window.ShadyCSS&&window.ShadyCSS.styleElement(this)}update(e){const t=this.render();super.update(e),t!==ae&&this.constructor.render(t,this.renderRoot,{scopeName:this.localName,eventContext:this}),this._needsShimAdoptedStyleSheets&&(this._needsShimAdoptedStyleSheets=!1,this.constructor._styles.forEach(e=>{const t=document.createElement("style");t.textContent=e.cssText,this.renderRoot.appendChild(t)}))}render(){return ae}}re.finalized=!0,re.render=(e,t,a)=>{if(!a||"object"!=typeof a||!a.scopeName)throw new Error("The `scopeName` option is required.");const r=a.scopeName,s=I.has(t),n=W&&11===t.nodeType&&!!t.host,o=n&&!U.has(r),l=o?document.createDocumentFragment():t;if(((e,t,a)=>{let r=I.get(t);void 0===r&&(i(t,t.firstChild),I.set(t,r=new A(Object.assign({templateFactory:F},a))),r.appendInto(t)),r.setValue(e),r.commit()})(e,l,Object.assign({templateFactory:j(r)},a)),o){const e=I.get(l);I.delete(l);((e,t,a)=>{U.add(e);const r=a?a.element:document.createElement("template"),i=t.querySelectorAll("style"),{length:s}=i;if(0===s)return void window.ShadyCSS.prepareTemplateStyles(r,e);const n=document.createElement("style");for(let e=0;e<s;e++){const t=i[e];t.parentNode.removeChild(t),n.textContent+=t.textContent}(e=>{H.forEach(t=>{const a=O.get(B(t,e));void 0!==a&&a.keyString.forEach(e=>{const{element:{content:t}}=e,a=new Set;Array.from(t.querySelectorAll("style")).forEach(e=>{a.add(e)}),m(e,a)})})})(e);const o=r.content;a?function(e,t,a=null){const{element:{content:r},parts:i}=e;if(null==a)return void r.appendChild(t);const s=document.createTreeWalker(r,133,null,!1);let n=f(i),o=0,l=-1;for(;s.nextNode();)for(l++,s.currentNode===a&&(o=v(t),a.parentNode.insertBefore(t,a));-1!==n&&i[n].index===l;){if(o>0){for(;-1!==n;)i[n].index+=o,n=f(i,n);return}n=f(i,n)}}(a,n,o.firstChild):o.insertBefore(n,o.firstChild),window.ShadyCSS.prepareTemplateStyles(r,e);const l=o.querySelector("style");if(window.ShadyCSS.nativeShadow&&null!==l)t.insertBefore(l.cloneNode(!0),t.firstChild);else if(a){o.insertBefore(n,o.firstChild);const e=new Set;e.add(n),m(a,e)}})(r,l,e.value instanceof w?e.value.template:void 0),i(t,t.firstChild),t.appendChild(l),I.set(t,e)}!s&&n&&window.ShadyCSS.styleElement(t.host)},re.shadowRootOptions={mode:"open"}},330(e){e.exports=JSON.parse('{"name":"lcars-dashboard","private":true,"version":"4.13.0","description":"LCARS Dashboard — Home Assistant Lovelace dashboard with Star Trek LCARS UI. Based on Dwains Dashboard by Dwain Scheeren.","scripts":{"build":"webpack --mode=production","watch":"webpack --watch --mode=development"},"keywords":["lcars","home-assistant","lovelace","dashboard","hacs"],"author":"htiel (based on Dwains Dashboard by Dwain Scheeren)","license":"MIT","devDependencies":{"autoprefixer":"^10.2.5","css-loader":"^5.1.3","html-webpack-plugin":"^5.3.1","postcss":"^8.2.8","postcss-cli":"^8.3.1","postcss-loader":"^5.2.0","style-loader":"^2.0.0","tailwindcss":"^2.0.3","webpack":"^5.26.0","webpack-cli":"^4.5.0","webpack-dev-server":"^5.2.3","webpack-merge":"^5.7.3"},"dependencies":{"@mdi/js":"^6.5.95","card-tools":"github:thomasloven/lovelace-card-tools#477f3d4eeb5c70cab047d418d19afb6b0f07bf49","custom-card-helpers":"^1.8.0","js-cookie":"^3.0.1","lit-element":"^2.2.1","lit-html":"^1.1.2","sortablejs":"^1.14.0"}}')}},t={};function a(r){var i=t[r];if(void 0!==i)return i.exports;var s=t[r]={exports:{}};return e[r](s,s.exports,a),s.exports}a.d=(e,t)=>{for(var r in t)a.o(t,r)&&!a.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},a.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),(()=>{var e=a(845),t=a(622),r=a(851);class i extends e.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object},_activePath:{type:String}}}constructor(){super(),this._activePath="home"}set hass(e){this._hass=e}setConfig(e){this._config=e}_handleNav(e){this._activePath=e,(0,r.oo)(`/lcars-dashboard/${e}`),this.requestUpdate()}static get styles(){return[t.B,e.AH`
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
      `}getCardSize(){return 3}}customElements.get("lcars-navigation-card")||customElements.define("lcars-navigation-card",i)})(),a(851).g0.info("Bundle","JS bundle loaded at",(new Date).toISOString()),(()=>{var e=a(845),t=a(622),r=a(851);const i="Layout";class s extends e.WF{static get properties(){return{cards:{type:Array},_hass:{type:Object},_narrow:{type:Boolean},_selectedArea:{type:String},_selectedFloor:{type:String},_editMode:{type:Boolean}}}constructor(){super(),this.cards=[],this._narrow=window.innerWidth<768,this._selectedArea=null,this._selectedFloor=null,this._editMode=!1,this._elbowPressTimer=null,this._resizeHandler=()=>{this._narrow=window.innerWidth<768}}connectedCallback(){super.connectedCallback(),window.addEventListener("resize",this._resizeHandler),r.g0.debug(i,"connectedCallback — layout mounted")}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("resize",this._resizeHandler),this._elbowPressTimer&&(clearTimeout(this._elbowPressTimer),this._elbowPressTimer=null),r.g0.debug(i,"disconnectedCallback — layout unmounted")}updated(e){super.updated(e),e.has("_editMode")&&(this._editMode?this.setAttribute("edit-mode",""):this.removeAttribute("edit-mode"))}setConfig(e){try{this._config=e,r.g0.debug(i,"setConfig",e)}catch(e){throw r.g0.error(i,"setConfig FAILED — this causes CONFIGURATION ERROR:",e),e}}set hass(e){const t=this._hass;this._hass=e,t||r.g0.debug(i,"First hass received — cards:",this.cards?.length||0),t&&t.areas!==e.areas&&this._selectedArea&&(e.areas?.[this._selectedArea]||(r.g0.debug(i,"Auto-deselecting deleted area:",this._selectedArea),this._selectedArea=null,r.o6.dispatchEvent(new CustomEvent("lcars-area-selected",{detail:{areaId:null}})))),t&&t.floors!==e.floors&&this._selectedFloor&&(e.floors?.[this._selectedFloor]||(r.g0.debug(i,"Auto-deselecting deleted floor:",this._selectedFloor),this._selectedFloor=null,r.o6.dispatchEvent(new CustomEvent("lcars-floor-selected",{detail:{floorId:null}})))),this.cards&&this.cards.forEach(t=>{t&&(t.hass=e)})}_selectArea(e){this._selectedFloor&&(this._selectedFloor=null,r.o6.dispatchEvent(new CustomEvent("lcars-floor-selected",{detail:{floorId:null}}))),this._selectedArea=this._selectedArea===e?null:e,r.g0.debug(i,"Area selected:",this._selectedArea||"(deselected)"),r.o6.dispatchEvent(new CustomEvent("lcars-area-selected",{detail:{areaId:this._selectedArea}}))}_selectFloor(e){this._selectedArea&&(this._selectedArea=null,r.o6.dispatchEvent(new CustomEvent("lcars-area-selected",{detail:{areaId:null}}))),this._selectedFloor=this._selectedFloor===e?null:e,r.g0.debug(i,"Floor selected:",this._selectedFloor||"(deselected)"),r.o6.dispatchEvent(new CustomEvent("lcars-floor-selected",{detail:{floorId:this._selectedFloor}}))}_toggleEditMode(){this._hass?.user?.is_admin&&(this._editMode=!this._editMode,r.g0.info(i,"Edit mode:",this._editMode?"ENABLED":"DISABLED"),r.o6.dispatchEvent(new CustomEvent("lcars-edit-mode",{detail:{enabled:this._editMode}})))}_handleElbowPointerDown(e){this._hass?.user?.is_admin&&(this._elbowPressTimer=setTimeout(()=>{this._toggleEditMode(),this._elbowPressTimer=null},800))}_handleElbowPointerUp(){this._elbowPressTimer&&(clearTimeout(this._elbowPressTimer),this._elbowPressTimer=null)}_editHeaderTitle(){this._editMode&&this._hass&&(0,r.Bo)(this._hass,"lcars-edit-homepage-header-card",{},"Edit Header")}_getAreas(){return this._hass&&this._hass.areas?Object.values(this._hass.areas):[]}_getAreasGroupedByFloor(){const e=this._getAreas(),t=this._hass?.floors?Object.values(this._hass.floors):[],a=new Map;for(const e of t)a.set(e.floor_id,{...e,areas:[]});const r=[];for(const t of e){const e=t.floor_id;e&&a.has(e)?a.get(e).areas.push(t):r.push(t)}const i=[...a.values()].filter(e=>e.areas.length>0).sort((e,t)=>(e.level??99)-(t.level??99)||e.name.localeCompare(t.name)).map(e=>({floor:{floor_id:e.floor_id,name:e.name,icon:e.icon,level:e.level},areas:e.areas}));return r.length>0&&i.push({floor:null,areas:r}),i}static get styles(){return[t.B,e.AH`
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
          background: var(--lcars-lilac, #cc99cc);
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
    `}}const n=Promise.race([customElements.whenDefined("hui-masonry-view"),new Promise(e=>setTimeout(e,5e3))]);r.g0.debug(i,"Waiting for hui-masonry-view (5s timeout)..."),n.then(()=>{if(customElements.get("lcars-dashboard-layout"))r.g0.warn(i,"lcars-dashboard-layout already registered — skipping");else{customElements.define("lcars-dashboard-layout",s);const e=a(330);r.g0.info(i,`v${e.version} registered`),console.info(`%c LCARS-DASHBOARD \n%c Version ${e.version}`,"color: #ff9966; font-weight: bold; background: black","color: #f5f6fa; font-weight: bold; background: #333")}}).catch(e=>{r.g0.error(i,"Failed to register lcars-dashboard-layout:",e)})})(),(()=>{var e=a(845),t=a(622),r=a(851);const i="camera",s="alarm",n="aquatics",o="climate",l="media",c="environment",d="irrigation",p="weather",u="battery",h={[i]:0,[s]:1,[n]:2,[o]:3,[l]:4,[c]:5,[d]:6,[p]:7,[u]:8},m=new Set(["camera"]),v=new Set(["climate"]),f=new Set(["media_player"]),g=new Set(["alarm_control_panel"]),b=new Set(["weather"]),y=new Set(["light","switch","fan","input_boolean","lock","automation","script"]),_=new Set(["sensor","binary_sensor"]),w=new Set(["cover"]),x=new Set(["carbon_dioxide","carbon_monoxide","volatile_organic_compounds","volatile_organic_compounds_parts","pm25","pm10","pm1","aqi"]),$=/_(air_quality|score)$/,k=/pool|spa/i,S=new Set(["heater","solar","solar_preferred"]);function C(e){const t=e?.preset_modes;return!!Array.isArray(t)&&t.some(e=>S.has(e))}const E=[e=>e.some(e=>m.has(e.domain))?i:null,e=>e.some(e=>g.has(e.domain))?s:null,e=>{for(const t of e)if("climate"===t.domain){if(k.test(t.entity.entity_id))return n;if(C(t.state?.attributes))return n}return null},e=>e.some(e=>v.has(e.domain))?o:null,e=>e.some(e=>f.has(e.domain))?l:null,e=>{let t=0,a=!1;for(const r of e){const e=r.state?.attributes?.device_class||"";x.has(e)&&t++,"fan"===r.domain&&(a=!0),!e&&"sensor"===r.domain&&$.test(r.entity.entity_id)&&t++}return t>=2||t>=1&&a?c:null},e=>function(e){let t=0;for(const a of e){if("switch"!==a.domain)continue;const e=a.state?.attributes;null==e?.zone_number?"outlet"===e?.device_class&&/zone/i.test(a.entity.entity_id)&&t++:t++}return t>=2}(e)?d:null,e=>e.some(e=>b.has(e.domain))?p:null,e=>{let t=!1,a=0;for(const r of e){const e=r.state?.attributes;if(!e)continue;const i=e.device_class||"",s=e.unit_of_measurement||"";"battery"===i&&"%"===s&&(t=!0),"power"===i&&"W"===s&&a++}return t&&a>=2?u:null}],z={light:"Lights",switch:"Switches",fan:"Fans",lock:"Locks",input_boolean:"Toggles",automation:"Automations",script:"Scripts",sensor:"Sensors",binary_sensor:"Binary Sensors",camera:"Cameras",climate:"Climate",cover:"Covers",media_player:"Media",button:"Buttons",number:"Numbers",select:"Selects",input_number:"Inputs",input_select:"Selectors",input_text:"Text Inputs",input_button:"Buttons",input_datetime:"Date/Time",scene:"Scenes",device_tracker:"Trackers",person:"People",update:"Updates",event:"Events",conversation:"Conversation",alarm_control_panel:"Alarm",weather:"Weather",remote:"Remotes",vacuum:"Vacuums"},A={camera:0,light:1,switch:2,climate:3,cover:4,media_player:5,fan:6,lock:7,alarm_control_panel:8,weather:9,sensor:10,binary_sensor:11};function q(e){switch(e){case"sunny":return"var(--lcars-sunflower)";case"clear-night":return"var(--lcars-bluey)";case"partlycloudy":case"snowy-rainy":case"hail":return"var(--lcars-ice)";case"cloudy":case"fog":return"var(--lcars-gray)";case"rainy":case"pouring":default:return"var(--lcars-sky)";case"snowy":return"var(--lcars-space-white)";case"windy":case"windy-variant":return"var(--lcars-almond)";case"lightning":case"lightning-rainy":return"var(--lcars-gold)";case"exceptional":case"unavailable":return"var(--lcars-tomato)"}}function P(e,t={},a={}){const r=a.min??35,i=a.max??95,s=null!=t.min_temp?Number(t.min_temp):r,n=null!=t.max_temp?Number(t.max_temp):i,o=Math.max(r,s),l=Math.min(i,n);return Math.min(l,Math.max(o,Number(e)||o))}function N(e,t){const a=[];function r(){const e=Date.now()-t;for(;a.length>0&&a[0]<e;)a.shift()}return{allow:()=>(r(),!(a.length>=e||(a.push(Date.now()),0))),remaining:()=>(r(),Math.max(0,e-a.length)),resetTime:()=>(r(),a.length<e?0:a[0]+t),reset(){a.length=0}}}function D(e,t=1500){let a=null;return{call(...r){a&&clearTimeout(a),a=setTimeout(()=>{a=null,e(...r)},t)},cancel(){a&&(clearTimeout(a),a=null)}}}const M=new Map,T="Homepage";function F(e){const t=e?.attributes?.entity_picture;if(!t)return"";const a=e.last_updated||e.last_changed||"",r=t.includes("?")?"&":"?";return`${t}${r}_cb=${encodeURIComponent(a)}`}class O extends e.WF{static get properties(){return{data:{type:Object},selectedArea:{type:String},selectedFloor:{type:String},_hass:{type:Object},_editMode:{type:Boolean}}}constructor(){super(),this.data=null,this.selectedArea=null,this.selectedFloor=null,this._editMode=!1,this._configLoading=!1,this._entityCache=new Map,this._cameraRefreshInterval=null,this._cameraObserver=null,this._visibleCameras=new Set,this._loadingCameras=new Set,this._onAreaSelected=e=>{r.g0.debug(T,"Area selected event:",e.detail.areaId),this.selectedArea=e.detail.areaId,this.selectedFloor=null,this._entityCache.clear()},this._onFloorSelected=e=>{r.g0.debug(T,"Floor selected event:",e.detail.floorId),this.selectedFloor=e.detail.floorId,this.selectedArea=null,this._entityCache.clear()},this._onEditMode=e=>{this._editMode=e.detail.enabled,r.g0.debug(T,"Edit mode:",this._editMode)}}connectedCallback(){super.connectedCallback(),r.o6.addEventListener("lcars-area-selected",this._onAreaSelected),r.o6.addEventListener("lcars-floor-selected",this._onFloorSelected),r.o6.addEventListener("lcars-edit-mode",this._onEditMode),this._startCameraRefresh(),document.addEventListener("visibilitychange",this._onVisibilityChange)}disconnectedCallback(){super.disconnectedCallback(),r.o6.removeEventListener("lcars-area-selected",this._onAreaSelected),r.o6.removeEventListener("lcars-floor-selected",this._onFloorSelected),r.o6.removeEventListener("lcars-edit-mode",this._onEditMode),this._stopCameraRefresh(),document.removeEventListener("visibilitychange",this._onVisibilityChange)}_onVisibilityChange=()=>{document.hidden?this._stopCameraTimer():(this._startCameraTimer(),this._refreshVisibleCameras())};_startCameraRefresh(){this._cameraObserver=new IntersectionObserver(e=>{for(const t of e){const e=t.target.dataset.entity;e&&(t.isIntersecting?this._visibleCameras.add(e):this._visibleCameras.delete(e))}},{rootMargin:"50px"}),this._startCameraTimer()}_startCameraTimer(){this._cameraRefreshInterval||(this._cameraRefreshInterval=setInterval(()=>{this._refreshVisibleCameras()},1e4))}_stopCameraTimer(){this._cameraRefreshInterval&&(clearInterval(this._cameraRefreshInterval),this._cameraRefreshInterval=null)}_stopCameraRefresh(){this._stopCameraTimer(),this._cameraObserver&&(this._cameraObserver.disconnect(),this._cameraObserver=null),this._visibleCameras.clear(),this._loadingCameras.clear()}_refreshVisibleCameras(){if(document.hidden||!this._hass)return;const e=Date.now();for(const t of this._visibleCameras){if(this._loadingCameras.has(t))continue;const a=this._hass.states[t];if(!a||"unavailable"===a.state)continue;const r=a.attributes?.entity_picture;if(!r)continue;const i=this.shadowRoot?.querySelector(`img[data-entity="${CSS.escape(t)}"]`);if(!i)continue;const s=r.includes("?")?"&":"?",n=`${r}${s}_cb=${e}`;this._loadingCameras.add(t),i.addEventListener("load",()=>this._loadingCameras.delete(t),{once:!0}),i.addEventListener("error",()=>this._loadingCameras.delete(t),{once:!0}),i.src=n}}updated(e){if(super.updated(e),this._cameraObserver){const e=this.shadowRoot?.querySelectorAll("img[data-entity]")||[],t=new Set;for(const a of e)t.add(a.dataset.entity),this._cameraObserver.observe(a);for(const e of this._visibleCameras)t.has(e)||(this._visibleCameras.delete(e),this._loadingCameras.delete(e))}}setConfig(e){try{this._config=e,r.g0.debug(T,"setConfig:",e)}catch(e){throw r.g0.error(T,"setConfig FAILED — this causes CONFIGURATION ERROR:",e),e}}set hass(e){const t=this._hass;this._hass=e,t||r.g0.debug(T,"First hass received — areas:",Object.keys(e.areas||{}).length,"entities:",Object.keys(e.entities||{}).length),!t||t.entities===e.entities&&t.devices===e.devices||(r.g0.debug(T,"Entity/device registry changed — busting cache"),this._entityCache.clear()),t&&t.areas!==e.areas&&this.selectedArea&&(e.areas?.[this.selectedArea]||(this.selectedArea=null,this._entityCache.clear())),this.data||this._configLoading||this._loadConfiguration()}async _loadConfiguration(){if(this._hass){this._configLoading=!0,r.g0.debug(T,"Loading configuration via WS...");try{const e=await this._hass.callWS({type:"lcars_dashboard/configuration/get"});this.data=e,void 0!==e.debug&&(window.__LCARS_DEBUG=e.debug,e.debug&&r.g0.info(T,"Debug logging auto-enabled from HA backend")),r.g0.debug(T,"Configuration loaded:",Object.keys(e),"version:",e.installed_version)}catch(e){r.g0.error(T,"Failed to load configuration — WS call failed:",e),this.data={}}finally{this._configLoading=!1}}}_handleEntityClick(e){r.g0.debug(T,"Entity click:",e),(0,r.Hv)(e)}_handleEditEntity(e,t){if(e.stopPropagation(),e.preventDefault(),!this._hass)return;const a=this._getEntityState(t),i=a?.attributes?.friendly_name||t;(0,r.Bo)(this._hass,"lcars-edit-entity-card",{entity:t,icon:a?.attributes?.icon||"",name:i},`Edit: ${i}`)}_handleEditDevice(e,t){if(e.stopPropagation(),e.preventDefault(),!this._hass)return;const a=this._hass.devices?.[t],i=a?.name_by_user||a?.name||t;(0,r.Bo)(this._hass,"lcars-edit-device-button-card",{device:t,name:i,icon:""},`Edit: ${i}`)}_handleToggle(e){const t=e.split(".")[0];if(r.g0.debug(T,"Toggle:",e,"domain:",t),"lock"===t){const t=this._getEntityState(e);this._hass.callService("lock","locked"===t?.state?"unlock":"lock",{entity_id:e})}else"script"===t?this._hass.callService("script","turn_on",{entity_id:e}):this._hass.callService("homeassistant","toggle",{entity_id:e})}_getAreaEntities(e){if(!this._hass)return[];if(this._entityCache.has(e))return this._entityCache.get(e);r.g0.debug(T,"Entity cache MISS — resolving area:",e);const t=Object.values(this._hass.entities||{}),a=this._hass.devices||{},i=new Set;Object.values(a).forEach(t=>{t.area_id===e&&i.add(t.id)});const s=t.filter(t=>!(t.hidden_by||t.hidden||t.disabled_by||t.entity_category||t.area_id!==e&&(t.area_id||!t.device_id||!i.has(t.device_id))));return this._entityCache.set(e,s),r.g0.debug(T,"Resolved",s.length,"entities for area:",e),s}_getFloorAreaIds(e){return this._hass?.areas?Object.values(this._hass.areas).filter(t=>t.floor_id===e).map(e=>e.area_id):[]}_getDeviceCategoryEntities(e){if(!this._hass||!e)return{config:[],diagnostic:[]};const t=Object.values(this._hass.entities||{}),a=[],r=[];for(const i of t)i.device_id===e&&(i.disabled_by||"user"===i.hidden_by||i.hidden||("config"===i.entity_category?a.push(i):"diagnostic"===i.entity_category&&r.push(i)));return{config:a,diagnostic:r}}_groupEntities(e){const t=this._hass.devices||{},a=new Map,r=[];e.forEach(e=>{const i=e.entity_id.split(".")[0],s={entity:e,domain:i,state:this._getEntityState(e.entity_id)};s.state&&(e.device_id&&t[e.device_id]?(a.has(e.device_id)||a.set(e.device_id,{device:t[e.device_id],entities:[]}),a.get(e.device_id).entities.push(s)):r.push(s))});const i=(e,t)=>{const a=A[e.domain]??50,r=A[t.domain]??50;return a!==r?a-r:(e.state?.attributes?.friendly_name||"").localeCompare(t.state?.attributes?.friendly_name||"")};return a.forEach(e=>e.entities.sort(i)),r.sort(i),{byDevice:a,noDevice:r}}_groupByDomain(e){const t=new Map;return e.forEach(e=>{t.has(e.domain)||t.set(e.domain,[]),t.get(e.domain).push(e)}),[...t.entries()].sort((e,t)=>(A[e[0]]??50)-(A[t[0]]??50))}_getEntityState(e){return this._hass&&this._hass.states[e]?this._hass.states[e]:null}_getEntityIcon(e){return e?e.attributes?.icon?e.attributes.icon:{light:"mdi:lightbulb",switch:"mdi:toggle-switch",sensor:"mdi:eye",binary_sensor:"mdi:radiobox-blank",climate:"mdi:thermostat",cover:"mdi:window-shutter",fan:"mdi:fan",lock:"mdi:lock",camera:"mdi:video",media_player:"mdi:cast",automation:"mdi:robot",script:"mdi:script-text",update:"mdi:package-up"}[e.entity_id.split(".")[0]]||"mdi:information-outline":"mdi:help-circle-outline"}_withEditPip(t,a){return this._editMode?e.qy`
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
      `}static get styles(){return[t.B,e.AH`
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
            color: var(--lcars-lilac, #cc99cc);
            text-transform: uppercase;
            padding: 0.25rem 0 0.5rem 0;
            border-left: 4px solid var(--lcars-lilac, #cc99cc);
            padding-left: 1rem;
          }
          .content-floor-header::after {
            content: '';
            display: block;
            height: 3px;
            background: var(--lcars-lilac, #cc99cc);
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
            background: #111;
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
          }
          .camera-label ha-icon { --mdc-icon-size: 14px; }
          .camera-label .cam-state {
            margin-left: auto;
            font-size: 0.65rem;
            color: var(--lcars-space-white);
            opacity: 0.7;
          }
          .camera-frame[data-off] { border-color: var(--lcars-gray); opacity: 0.5; }

          /* ═══════ DEVICE PANEL (reusable frame for camera / climate / media) ═══════ */
          .device-panels-section {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: var(--lcars-gap);
            margin-bottom: 0.75rem;
          }

          /* ─── Two-column split: entities left, camera panels right ─── */
          .area-split-layout {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            align-items: start;
          }
          .area-split-main {
            min-width: 0;
          }
          .area-split-panels {
            display: flex;
            flex-direction: column;
            gap: var(--lcars-gap);
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
            opacity: 0.5;
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
            font-size: 0.55rem;
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
            font-size: 0.55rem;
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
            font-size: 0.55rem;
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
          .camera-frame img {
            animation: viewscreen-activate 600ms ease-out both;
          }
          .camera-frame[data-off] img {
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
            background: linear-gradient(90deg, var(--lcars-ice), var(--lcars-butterscotch));
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
        `]}_renderFloorView(t){const a=this._hass.floors?.[t];if(!a)return r.g0.debug(T,"Render: floor not found:",t),e.qy`<div class="lcars-empty">Floor not found</div>`;const i=this._getFloorAreaIds(t);return 0===i.length?e.qy`
          <div class="content-area-panel">
            <h2 class="content-area-header">${a.name}</h2>
            <div class="lcars-empty">No areas on this floor</div>
          </div>
        `:(r.g0.debug(T,"Render: floor=%s areas=%d",a.name,i.length),e.qy`
        <div class="content-floor-panel">
          <h2 class="content-floor-header">${a.name}</h2>
          ${i.map(t=>{const a=this._hass.areas?.[t];if(!a)return"";const r=this._getAreaEntities(t);return 0===r.length?"":e.qy`
              <div class="content-area-panel floor-area-section">
                <h3 class="content-area-header floor-area-subheader">${a.name}</h3>
                ${this._renderAreaContent(r)}
              </div>
            `})}
        </div>
      `)}render(){if(!this._hass)return r.g0.debug(T,"Render: waiting for hass"),e.qy`<div class="lcars-empty">Initializing...</div>`;if(this.selectedFloor)return this._renderFloorView(this.selectedFloor);if(!this.selectedArea)return r.g0.debug(T,"Render: no area selected"),e.qy`<div class="lcars-empty">Select an area</div>`;const t=this._hass.areas?.[this.selectedArea];if(!t)return r.g0.debug(T,"Render: area not found:",this.selectedArea),e.qy`<div class="lcars-empty">Area not found</div>`;const a=this._getAreaEntities(this.selectedArea);return r.g0.debug(T,"Render: area=%s entities=%d",t.name,a.length),e.qy`
        <div class="content-area-panel">
          <h2 class="content-area-header">${t.name}</h2>
          ${this._renderAreaContent(a)}
        </div>
      `}_getDevicePanelType(e){return function(e){for(const t of E){const a=t(e);if(a)return a}return null}(e)}_partitionDeviceEntities(e){const t=[],a=[],r=[];for(const i of e)m.has(i.domain)?t.push(i):_.has(i.domain)?a.push(i):r.push(i);return{cameras:t,sensors:a,controls:r}}_renderDevicePanel(e,t){switch(e){case i:return this._renderCameraPanel(t);case c:return this._renderEnvironmentPanel(t);case u:return this._renderBatteryPanel(t);case o:return this._renderClimatePanel(t);case s:return this._renderAlarmPanel(t);case l:return this._renderMediaPanel(t);case n:return this._renderPoolSpaPanel(t);case p:return this._renderWeatherPanel(t);case d:return this._renderIrrigationPanel(t);default:return""}}_getSensorIndicatorColor(e){return function(e,t){const a=t?.state;if("unavailable"===a||"unknown"===a)return"var(--lcars-alert)";const r=t?.attributes?.device_class||"",i=e.split(".")[0];if("binary_sensor"===i){if("off"===a)return"var(--lcars-disabled)";switch(r){case"motion":case"moving":return"var(--lcars-butterscotch)";case"occupancy":case"presence":return"var(--lcars-gold)";case"sound":return"var(--lcars-alert)";default:return"var(--lcars-data-accent)"}}if("sensor"===i){if("battery"===r){const e=parseFloat(a);if(!isNaN(e)&&e<20)return"var(--lcars-alert)"}return"var(--lcars-data-accent)"}return"event"===i?"var(--lcars-alert)":"var(--lcars-data-accent)"}(e?.entity_id||"",e)}_renderCameraPanel(t){const{cameras:a,sensors:r,controls:i}=this._partitionDeviceEntities(t.entities),s=this._shortDeviceName(t.device);return e.qy`
        <div class="lcars-device-panel" data-panel-type="camera">
          <div class="device-panel-header">
            <span class="device-panel-name">${s}</span>
            <div class="device-panel-header-line"></div>
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
            ${a.map(({entity:t,state:a},r)=>{const i=F(a),n=0===r?s:this._friendlyName(a,t);return i?e.qy`<img src="${i}"
                            alt="${n} camera feed" loading="lazy"
                            data-entity="${t.entity_id}"
                            style="${r>0?"margin-top:var(--lcars-gap);border-top:2px solid var(--panel-frame-color)":""}"
                            @error=${e=>{e.target.style.display="none",e.target.nextElementSibling&&(e.target.nextElementSibling.style.display="")}}
                            @load=${e=>{e.target.style.display="";const t=e.target.nextElementSibling;t?.classList.contains("camera-error-fallback")&&(t.style.display="none")}}
                            @click=${()=>this._handleEntityClick(t.entity_id)} /><div class="camera-error-fallback" style="display:none;aspect-ratio:16/9;align-items:center;justify-content:center"
                            @click=${()=>this._handleEntityClick(t.entity_id)}>
                    <ha-icon icon="mdi:video-off" style="--mdc-icon-size:48px;color:var(--lcars-gray)"></ha-icon>
                  </div>`:e.qy`<div style="display:flex;aspect-ratio:16/9;align-items:center;justify-content:center"
                            @click=${()=>this._handleEntityClick(t.entity_id)}>
                    <ha-icon icon="mdi:video-off" style="--mdc-icon-size:48px;color:var(--lcars-gray)"></ha-icon>
                  </div>`})}
          </div>

          <div class="device-panel-controls" aria-label="${s} controls">
            ${i.map(({entity:t,state:a})=>{const r=this._friendlyName(a,t),i="on"===a.state,s=this._isOff(a),n=t.entity_id.split(".")[0];return e.qy`
                <button class="device-control-btn" ?data-on=${i} ?data-off=${s}
                  @click=${()=>y.has(n)?this._handleToggle(t.entity_id):this._handleEntityClick(t.entity_id)}
                  title="${r}: ${a.state}">
                  <ha-icon .icon=${this._getEntityIcon(a)}></ha-icon>
                  <span>${r}</span>
                </button>
              `})}
          </div>
        </div>
      `}_classifyPowerEntity(e){const t=(e||"").toLowerCase();return/total\s*in\s*power/.test(t)?{side:"in",type:"total"}:/total\s*out\s*power/.test(t)?{side:"out",type:"total"}:/solar.*in.*power/.test(t)?{side:"in",type:"solar"}:/ac.*in.*power/.test(t)?{side:"in",type:"ac"}:/ac.*out.*power/.test(t)?{side:"out",type:"ac"}:/dc.*out.*power/.test(t)?{side:"out",type:"dc"}:/usb.*out.*power/.test(t)?{side:"out",type:"usb"}:/type.*c.*out.*power/.test(t)?{side:"out",type:"usbc"}:/power.*i.*o.*input.*power/.test(t)?{side:"in",type:"pio"}:/power.*i.*o.*output.*power/.test(t)?{side:"out",type:"pio"}:/anderson.*out.*power/.test(t)?{side:"out",type:"dc"}:/alternator.*in.*power/.test(t)?{side:"in",type:"alt"}:/station.*power/.test(t)?{side:"out",type:"station"}:/\bin\b/.test(t)?{side:"in",type:"other"}:/\bout\b/.test(t)?{side:"out",type:"other"}:null}_partitionBatteryEntities(e,t){const a=[],r=[],i=[],s=[],n=[],o=[],l=[];for(const t of e){const e=t.state?.attributes||{},o=e.device_class||"",l=e.unit_of_measurement||"",c=t.domain,d=e.friendly_name||t.entity.entity_id;if(["switch","number","button","select"].includes(c))n.push(t);else if("battery"!==o||"%"!==l){if("power"===o&&"W"===l){const e=this._classifyPowerEntity(d);e?"in"===e.side?r.push({...t,ioType:e.type}):i.push({...t,ioType:e.type}):s.push(t);continue}s.push(t)}else a.push(t)}if(t){for(const e of t.config){const t=this._getEntityState(e.entity_id);if(!t)continue;const a=e.entity_id.split(".")[0];o.push({entity:e,domain:a,state:t})}for(const e of t.diagnostic){const t=this._getEntityState(e.entity_id);if(!t)continue;const a=e.entity_id.split(".")[0];l.push({entity:e,domain:a,state:t})}}return{soc:a,powerIn:r,powerOut:i,telemetry:s,controls:n,configControls:o,diagnostics:l}}_partitionEnvironmentEntities(e,t){const a=[],r=[],i=[],s=[],n=[];for(const t of e){const e=t.state?.attributes?.device_class||"",n=t.domain;["fan","switch","button","number","select"].includes(n)?s.push(t):x.has(e)?r.push(t):e||"sensor"!==n||!$.test(t.entity.entity_id)?i.push(t):a.push(t)}if(t)for(const e of[...t.diagnostic,...t.config]){const t=this._getEntityState(e.entity_id);t&&n.push({entity:e,domain:e.entity_id.split(".")[0],state:t})}return{score:a,airQuality:r,telemetry:i,controls:s,diagnostics:n}}_getScrubberHue(e){return null==e||e<=50?120:e<=100?120-(e-50)/50*70:e<=150?50-(e-100)/50*35:Math.max(0,15-(e-150)/100*15)}_getAQColor(e){return null==e||e<=50?"var(--lcars-ice)":e<=100?"var(--lcars-sunflower)":e<=150?"var(--lcars-butterscotch)":e<=200?"var(--lcars-peach)":"var(--lcars-tomato)"}_getScrubberSpeed(e){return null==e||0===e?20:2+18*Math.pow(1-e/100,1.5)}_envHistoryCache=new Map;async _getSparklineData(e,t){return async function(e,t,a,r,i={}){const{ttlMs:s=3e5,maxEntities:n=10,maxCacheSize:o=30}=i,l=/^[a-z_]+\.[a-z0-9_]+$/,c=Date.now(),d=r.get(t);if(d&&c-d.timestamp<s)return null;try{const i=a.slice(0,n).filter(e=>l.test(e));if(0===i.length)return null;const s=new Date,d=new Date(s.getTime()-864e5),p=await e.callWS({type:"recorder/statistics_during_period",start_time:d.toISOString(),end_time:s.toISOString(),statistic_ids:i,period:"hour",types:["mean"]});if(r.set(t,{data:p,timestamp:c}),r.size>o){const e=r.keys().next().value;r.delete(e)}return p}catch(e){return null}}(this._hass,e,t,this._envHistoryCache)}_renderSparkline(t,a,r){return function(t,{color:a,label:r="",width:i=120,height:s=24,className:n="lcars-sparkline"}={}){const o=function(e){return Array.isArray(e)?e.map(e=>e.mean).filter(e=>null!=e&&Number.isFinite(e)):[]}(t);if(o.length<2)return"";const l=function(e,t,a){const r=Math.min(...e),i=Math.max(...e)-r||1;return e.map((s,n)=>`${(n/(e.length-1)*t).toFixed(1)},${(a-(s-r)/i*a).toFixed(1)}`).join(" ")}(o,i,s),c=o[o.length-1],d=r?`${r}: ${c?.toFixed(0)||""}`:`Sparkline: ${c?.toFixed(0)||""}`;return e.qy`
    <div class="${n}-wrap" aria-label="${d}">
      ${r?e.qy`<span class="${n}-label">${r}</span>`:""}
      <svg class="${n}" viewBox="0 0 ${i} ${s}" preserveAspectRatio="none">
        <polyline points="${l}" fill="none" stroke="${a}" stroke-width="1.5"
          vector-effect="non-scaling-stroke" />
      </svg>
    </div>
  `}(t,{color:a,label:r,className:"env-sparkline"})}_renderEnvironmentPanel(t){const a=this._getDeviceCategoryEntities(t.device.id),{score:r,airQuality:i,telemetry:s,controls:n,diagnostics:o}=this._partitionEnvironmentEntities(t.entities,a),l=this._shortDeviceName(t.device)||"Environment",c=r[0],d=c?parseFloat(c.state.state):null,p=i.find(e=>"pm25"===(e.state?.attributes?.device_class||"")),u=p?parseFloat(p.state.state):null,h=null!=d&&Number.isFinite(d)?d:null!=u&&Number.isFinite(u)?Math.min(300,4*u):null,m=this._getScrubberHue(h),v=this._getAQColor(h),f=n.find(e=>"fan"===e.domain),g=f?.state,b=g?.attributes?.percentage??null,y=g?.attributes?.preset_modes||[],_=g?.attributes?.preset_mode||"",w=!f||"off"===g?.state||0===b,x=this._getScrubberSpeed(w?0:b),$=!f,k=n.filter(e=>"fan"!==e.domain),S=[...r,...i].map(e=>e.entity.entity_id);S.length>0&&this._getSparklineData(t.device.id,S).then(e=>{e&&this.requestUpdate()});const C=this._envHistoryCache.get(t.device.id)?.data||{};return e.qy`
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
            aria-valuenow="${null!=h?Math.round(h):""}"
            aria-valuemin="0" aria-valuemax="300"
            aria-label="Air quality: ${null!=h?Math.round(h):"unknown"}">
            <div class="atmoscrubber ${w?"scrubber-idle":""}"
              style="--scrubber-hue:${Math.round(m)};--scrubber-speed:${x.toFixed(1)}s">
              ${c?e.qy`
                <div class="scrubber-score">${null!=d&&Number.isFinite(d)?Math.round(d):"—"}</div>
              `:p?e.qy`
                <div class="scrubber-score">${null!=u&&Number.isFinite(u)?Math.round(u):"—"}</div>
              `:""}
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
                          aria-checked="${t===_}"
                          ?data-selected=${t===_}
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
        </div>
      `}_getCoreColor(e){return e>=80?"var(--lcars-ice)":e>=60?"var(--lcars-sky)":e>=40?"var(--lcars-bluey)":e>=20?"var(--lcars-butterscotch)":e>=10?"var(--lcars-peach)":"var(--lcars-tomato)"}_getFlowSpeed(e){const t=Math.abs(parseFloat(e)||0);return 0===t?"flow-stopped":t>1e3?"flow-fast":t>100?"flow-medium":"flow-slow"}_renderBatteryPanel(t){const a=this._getDeviceCategoryEntities(t.device.id),{soc:r,powerIn:i,powerOut:s,telemetry:n,controls:o,configControls:l,diagnostics:c}=this._partitionBatteryEntities(t.entities,a),d=this._shortDeviceName(t.device)||"Battery",p=r[0],u=p&&parseFloat(p.state.state)||0,h=p&&"unavailable"!==p.state.state&&"unknown"!==p.state.state,m=h?this._getCoreColor(u):"var(--lcars-gray)",v=i.find(e=>"total"===e.ioType),f=s.find(e=>"total"===e.ioType),g=v&&parseFloat(v.state.state)||0,b=f&&parseFloat(f.state.state)||0,_=g>5,w=!(_||b>5),x=new Set;i.filter(e=>"total"!==e.ioType).forEach(e=>x.add(e.ioType)),s.filter(e=>"total"!==e.ioType).forEach(e=>x.add(e.ioType));const $=[...x].map(e=>({type:e,label:e.toUpperCase(),inEntry:i.find(t=>t.ioType===e),outEntry:s.find(t=>t.ioType===e)})),k=n.filter(e=>{const t=e.state?.attributes?.device_class||"",a=(e.state?.attributes?.friendly_name||"").toLowerCase();return"temperature"===t||"duration"===t||/state.*health|cycles|remain.*time|status|error.*code|battery.*count/.test(a)}).slice(0,8),S=c.filter(e=>{const t=e.state?.attributes?.device_class||"",a=(e.state?.attributes?.friendly_name||"").toLowerCase();return"temperature"===t||/cycles|status|error|battery.*count|charging.*state|power.*diff/.test(a)}).slice(0,8);return e.qy`
        <div class="lcars-device-panel battery-panel" data-panel-type="battery">
          <!-- Header -->
          <div class="battery-header">
            <span class="device-panel-name">${d}</span>
            <div class="device-panel-header-line"></div>
            <span class="battery-charge-label" style="color:${m}">
              ${h?`${Math.round(u)}%`:"N/A"}
            </span>
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
            ${k.map(({entity:t,state:a})=>{const r=this._friendlyName(a,t),i=a.state,s=a.attributes?.unit_of_measurement||"",n=this._getSensorIndicatorColor(a);return e.qy`
                <div class="device-sensor-line" tabindex="0" role="listitem"
                  @click=${()=>this._handleEntityClick(t.entity_id)}
                  @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._handleEntityClick(t.entity_id))}}>
                  <div class="sensor-indicator" style="background:${n}"></div>
                  <span class="sensor-label">${r}</span>
                  <span class="sensor-state-value" style="color:${n}">${i}${s?" "+s:""}</span>
                </div>
              `})}
            ${S.length>0?e.qy`
              <div class="battery-section-divider"></div>
              <div class="battery-section-label">DIAGNOSTICS</div>
              ${S.map(({entity:t,state:a})=>{const r=this._friendlyName(a,t),i=a.state,s=a.attributes?.unit_of_measurement||"",n=this._getSensorIndicatorColor(a);return e.qy`
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
            <div class="warp-core" style="--core-color:${m};--core-charge:${h?u:0}">
              <div class="warp-core-fill ${w?"core-idle":""} ${_?"core-charging":""}">
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
                  @click=${()=>y.has(i)?this._handleToggle(t.entity_id):this._handleEntityClick(t.entity_id)}
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
                    @click=${()=>y.has(i)?this._handleToggle(t.entity_id):this._handleEntityClick(t.entity_id)}
                    title="${r}: ${a.state}">
                    <ha-icon .icon=${this._getEntityIcon(a)}></ha-icon>
                    <span>${r}</span>
                  </button>
                `})}
            `:""}
          </div>

          <!-- Power I/O Flow (bottom) -->
          <div class="battery-io-flow" aria-label="Power flow">
            ${$.map(t=>{const a=t.inEntry&&parseFloat(t.inEntry.state.state)||0,r=t.outEntry&&parseFloat(t.outEntry.state.state)||0,i=this._getFlowSpeed(a),s=this._getFlowSpeed(r);return e.qy`
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
        </div>
      `}_climateSetpointDebouncer=null;_partitionClimateEntities(e,t){const a=[],r=[],i=[],s=[],n=new Set(["problem","heat","cold","connectivity","battery","tamper","smoke","safety"]);for(const t of e){const e=t.domain;if("climate"!==e){if("binary_sensor"===e){const e=t.state?.attributes?.device_class||"";if(n.has(e)){i.push(t);continue}}_.has(e),r.push(t)}else a.push(t)}if(t)for(const e of t.diagnostic||[]){const t=this._getEntityState(e.entity_id);t&&s.push({entity:e,domain:e.entity_id.split(".")[0],state:t})}return{climate:a,sensors:r,faults:i,diagnostics:s}}_isDualSetpoint(e){return"heat_cool"===e?.attributes?.hvac_mode||null!=e?.attributes?.target_temp_low&&null!=e?.attributes?.target_temp_high}_renderClimateArc(t,a,r,i,s){const n=100,o=120,l=80,c=i-r||1,d=Math.max(0,Math.min(1,(t-r)/c)),p=Math.PI,u=p-(p-0)*d,h=n+l*Math.cos(p),m=o-l*Math.sin(p),v=n+l*Math.cos(u),f=o-l*Math.sin(u),g=d>.5?1:0,b=p-(p-0)*Math.max(0,Math.min(1,(a-r)/c)),y=n+l*Math.cos(b),_=o-l*Math.sin(b);return e.qy`
        <svg class="climate-arc" viewBox="0 0 ${200} ${130}" role="meter"
          aria-valuemin="${r}" aria-valuemax="${i}" aria-valuenow="${t}"
          aria-label="Temperature: ${t}°, target ${a}°">
          <!-- Background arc -->
          <path d="M ${h},${m} A ${l},${l} 0 1,1 ${180},${o}"
            fill="none" stroke="var(--lcars-disabled)" stroke-width="8" stroke-linecap="round" />
          <!-- Progress arc -->
          ${d>0?e.qy`
            <path d="M ${h},${m} A ${l},${l} 0 ${g},1 ${v},${f}"
              fill="none" stroke="${s}" stroke-width="8" stroke-linecap="round" />
          `:""}
          <!-- Target tick -->
          <circle cx="${y}" cy="${_}" r="5" fill="${s}" stroke="var(--lcars-card-bg, #1a1a2e)" stroke-width="2" />
          <!-- Current temp text -->
          <text x="${n}" y="${100}" text-anchor="middle" fill="${s}"
            font-family="var(--lcars-font)" font-size="42" font-weight="bold">
            ${null!=t&&Number.isFinite(t)?Math.round(t):"—"}°
          </text>
        </svg>
      `}_handleClimateSetpoint(e,t,a,r,i){const s=P(a,t);this._climateSetpointDebouncer||(this._climateSetpointDebouncer=D((e,t)=>{this._hass.callService("climate","set_temperature",{entity_id:e,...t})},1500));const n=r?{["low"===i?"target_temp_low":"target_temp_high"]:s}:{temperature:s};this._climateSetpointDebouncer.call(e,n)}_handleClimateMode(e,t){this._hass.callService("climate","set_hvac_mode",{entity_id:e,hvac_mode:t})}_handleClimateFanMode(e,t){this._hass.callService("climate","set_fan_mode",{entity_id:e,fan_mode:t})}_handleClimatePreset(e,t){this._hass.callService("climate","set_preset_mode",{entity_id:e,preset_mode:t})}_renderClimatePanel(t){const a=this._getDeviceCategoryEntities(t.device.id),{climate:r,sensors:i,faults:s,diagnostics:n}=this._partitionClimateEntities(t.entities,a),o=this._shortDeviceName(t.device)||"Thermostat";if(0===r.length)return"";const l=r[0],c=l.state,d=c?.attributes||{},p=null!=d.current_temperature?Number(d.current_temperature):null,u=d.hvac_action||"off",h=function(e){switch(e){case"heating":return"var(--lcars-butterscotch)";case"cooling":return"var(--lcars-ice)";case"idle":return"var(--lcars-sunflower)";case"drying":return"var(--lcars-almond)";case"fan":return"var(--lcars-african-violet)";default:return"var(--lcars-disabled)"}}(u),m=this._isDualSetpoint(c),v=m?null:null!=d.temperature?Number(d.temperature):null,f=m?Number(d.target_temp_low):null,g=m?Number(d.target_temp_high):null,b=null!=d.min_temp?Number(d.min_temp):45,y=null!=d.max_temp?Number(d.max_temp):95,_=d.hvac_modes||[],w=d.hvac_mode||"off",x=d.fan_modes||[],$=d.fan_mode||"",k=d.preset_modes||[],S=d.preset_mode||"",C=i.find(e=>"humidity"===(e.state?.attributes?.device_class||"")),E=d.target_temp_step||1;return e.qy`
        <div class="lcars-device-panel climate-panel" data-panel-type="climate"
          style="--panel-frame-color:${h}">
          <!-- Header -->
          <div class="climate-header">
            <span class="device-panel-name">${o}</span>
            <div class="device-panel-header-line"></div>
            <span class="climate-action-badge" style="color:${h}">
              ${u.toUpperCase()}
            </span>
          </div>

          <!-- Sensors (left) -->
          <div class="climate-sensors" role="list" aria-label="${o} readings">
            ${null!=p?e.qy`
              <div class="device-sensor-line" role="listitem" aria-label="Current temperature: ${p}°">
                <div class="sensor-indicator" style="background:${h}"></div>
                <span class="sensor-label">Current</span>
                <span class="sensor-state-value" style="color:${h}">${Math.round(p)}°</span>
              </div>
            `:""}
            ${m?e.qy`
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
                <div class="sensor-indicator" style="background:${h}"></div>
                <span class="sensor-label">Target</span>
                <span class="sensor-state-value" style="color:${h}">${v}°</span>
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
            <div class="device-sensor-line" role="listitem" aria-label="HVAC mode: ${w}">
              <div class="sensor-indicator" style="background:${h}"></div>
              <span class="sensor-label">Mode</span>
              <span class="sensor-state-value">${w}</span>
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
            ${this._renderClimateArc(p,m?(f+g)/2:v,b,y,h)}
            <!-- Setpoint controls -->
            <div class="climate-setpoint-controls">
              ${m?e.qy`
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
                  <span class="climate-sp-label" style="color:${h}">TARGET ${v}°</span>
                  <button class="climate-sp-btn" aria-label="Increase target temperature"
                    @click=${e=>{e.stopPropagation(),this._handleClimateSetpoint(l.entity.entity_id,d,v+E,!1)}}>+</button>
                </div>
              `:""}
            </div>
          </div>

          <!-- HVAC Mode Strip -->
          ${_.length>1?e.qy`
            <div class="climate-modes" role="radiogroup" aria-label="HVAC mode">
              ${_.map(t=>e.qy`
                <button class="climate-mode-btn" role="radio"
                  aria-checked="${t===w}"
                  ?data-active=${t===w}
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
        </div>
      `}_alarmPinCode="";_alarmPinLimiter=N(3,6e4);_alarmCountdown=null;_alarmCountdownTimer=null;_alarmPinError=!1;_partitionAlarmEntities(e,t){const a=[],r=[],i=[],s=[],n=new Set(["door","window","motion","vibration","moisture","cold","smoke","safety","opening","garage_door","lock","tamper","problem"]);for(const t of e)if("alarm_control_panel"!==t.domain){if("binary_sensor"===t.domain){const e=t.state?.attributes?.device_class||"";if(n.has(e)){r.push(t);continue}}i.push(t)}else a.push(t);if(t)for(const e of t.diagnostic||[]){const t=this._getEntityState(e.entity_id);t&&s.push({entity:e,domain:e.entity_id.split(".")[0],state:t})}return{alarm:a,zones:r,auxiliary:i,diagnostics:s}}_handleAlarmPinDigit(e){this._alarmPinCode.length>=6||(this._alarmPinCode+=String(e).replace(/\D/g,"").charAt(0)||"",this._alarmPinError=!1,this.requestUpdate())}_handleAlarmPinClear(){this._alarmPinCode="",this._alarmPinError=!1,this.requestUpdate()}_handleAlarmArm(e,t){const a=this._alarmPinCode||void 0,r=`alarm_arm_${t}`;this._hass.callService("alarm_control_panel",r,{entity_id:e,...a?{code:a}:{}}),this._alarmPinCode="",this.requestUpdate()}_handleAlarmDisarm(e){if(!this._alarmPinLimiter.allow())return this._alarmPinError=!0,void this.requestUpdate();const t=this._alarmPinCode||void 0;this._hass.callService("alarm_control_panel","alarm_disarm",{entity_id:e,...t?{code:t}:{}}),this._alarmPinCode="",this.requestUpdate()}_startAlarmCountdown(e){this._alarmCountdown=Math.max(0,e),this._alarmCountdownTimer&&clearInterval(this._alarmCountdownTimer),this._alarmCountdownTimer=setInterval(()=>{this._alarmCountdown=Math.max(0,(this._alarmCountdown||0)-1),this.requestUpdate(),this._alarmCountdown<=0&&(clearInterval(this._alarmCountdownTimer),this._alarmCountdownTimer=null)},1e3)}_stopAlarmCountdown(){this._alarmCountdownTimer&&(clearInterval(this._alarmCountdownTimer),this._alarmCountdownTimer=null),this._alarmCountdown=null}_getAlarmShieldSymbol(e){switch(e){case"disarmed":return"✓";case"armed_home":case"armed_night":return"◉";case"armed_away":case"armed_vacation":return"▲";case"triggered":return"✕";case"arming":case"pending":case"disarming":return"⋯";default:return"?"}}_getAlarmStateLabel(e){return(e||"unknown").toUpperCase().replace(/_/g," ")}_handleAlarmKeydown(e,t){const a=e.key;/^[0-9]$/.test(a)?(e.preventDefault(),this._handleAlarmPinDigit(a)):"Backspace"===a?(e.preventDefault(),this._alarmPinCode=this._alarmPinCode.slice(0,-1),this.requestUpdate()):"Enter"===a?(e.preventDefault(),this._handleAlarmDisarm(t)):"Escape"===a&&(e.preventDefault(),this._handleAlarmPinClear())}_renderAlarmPanel(t){const a=this._getDeviceCategoryEntities(t.device.id),{alarm:r,zones:i,auxiliary:s,diagnostics:n}=this._partitionAlarmEntities(t.entities,a),o=this._shortDeviceName(t.device)||"Alarm";if(0===r.length)return"";const l=r[0],c=l.state,d=c?.state||"unavailable",p=function(e){switch(e){case"disarmed":return"var(--lcars-ice)";case"armed_home":case"armed_night":return"var(--lcars-sunflower)";case"armed_away":case"armed_vacation":return"var(--lcars-butterscotch)";case"armed_custom_bypass":return"var(--lcars-african-violet)";case"arming":case"pending":case"disarming":return"var(--lcars-gold)";case"triggered":return"var(--lcars-alert)";default:return"var(--lcars-disabled)"}}(d),u=["arming","pending","disarming"].includes(d),h="triggered"===d,m=this._getAlarmShieldSymbol(d),v=this._getAlarmStateLabel(d),f=!1!==c?.attributes?.code_required,g=Array.from({length:6},(e,t)=>t<this._alarmPinCode.length);if(u&&null==this._alarmCountdown){const e=c?.attributes?.delay||60;this._startAlarmCountdown(e)}else u||null==this._alarmCountdown||this._stopAlarmCountdown();return e.qy`
        <div class="lcars-device-panel alarm-panel ${h?"alarm-triggered":""}" data-panel-type="alarm"
          style="--panel-frame-color:${p}">
          <!-- Header -->
          <div class="alarm-header">
            <span class="device-panel-name">${o}</span>
            <div class="device-panel-header-line"></div>
            <span class="alarm-state-badge" style="color:${p}">${v}</span>
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
                  font-family="var(--lcars-font)" font-size="48">${m}</text>
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
        </div>
      `}_isValidArtworkUrl(e){return!!e&&(e.startsWith("/api/")||e.startsWith("/local/"))}_getMediaTransportSymbol(e){switch(e){case"playing":return"▶";case"paused":return"❚❚";default:return"■"}}_partitionMediaEntities(e){const t=[],a=[],r=[],i=[];for(const s of e)"media_player"!==s.domain?"remote"!==s.domain?_.has(s.domain)?a.push(s):r.push(s):i.push(s):t.push(s);return{player:t,sensors:a,controls:r,remotes:i}}_handleMediaService(e,t,a={}){this._hass.callService("media_player",t,{entity_id:e,...a})}_handleVolumeChange(e,t){const a=t.currentTarget.getBoundingClientRect(),r=Math.max(0,Math.min(1,(t.clientX-a.left)/a.width));this._handleMediaService(e,"volume_set",{volume_level:Math.round(100*r)/100})}_renderMediaPanel(t){const{player:a,sensors:r,controls:i,remotes:s}=this._partitionMediaEntities(t.entities),n=this._shortDeviceName(t.device)||"Media";if(0===a.length)return"";const o=a[0],l=o.state,c=l?.attributes||{},d=l?.state||"unavailable",p=function(e){if(null==e)return"var(--lcars-disabled)";switch(e){case"playing":return"var(--lcars-african-violet)";case"paused":case"buffering":return"var(--lcars-sunflower)";case"on":return"var(--lcars-data-accent)";case"idle":case"standby":case"off":default:return"var(--lcars-disabled)";case"unavailable":case"unknown":return"var(--lcars-alert)"}}(d),u=this._getMediaTransportSymbol(d),h="playing"===d,m=!(h||"paused"===d),v=c.entity_picture,f=this._isValidArtworkUrl(v),g=c.media_title||"",b=c.media_artist||"",y=c.source||"",_=null!=c.volume_level?Number(c.volume_level):0,w=c.is_volume_muted||!1,x=(c.source_list,c.supported_features||0),$=!!(16&x),k=!!(32&x),S=!!(4&x),C=!!(32768&x),E=!!(262144&x),z=c.shuffle||!1,A=c.repeat||"off";return e.qy`
        <div class="lcars-device-panel media-panel ${m?"media-idle":""}" data-panel-type="media"
          style="--panel-frame-color:var(--lcars-african-violet)">
          <!-- Header -->
          <div class="media-header">
            <span class="device-panel-name">${n}</span>
            <div class="device-panel-header-line"></div>
            <span class="media-state-badge" style="color:${p}">${u} ${d.toUpperCase()}</span>
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
          <div class="media-viewscreen" @click=${()=>this._handleEntityClick(o.entity.entity_id)}>
            ${f&&!m?e.qy`
              <img class="media-art" src="${v}" alt="Album art"
                crossorigin="anonymous" referrerpolicy="no-referrer" loading="lazy"
                @error=${e=>{e.target.style.display="none"}} />
            `:e.qy`
              <div class="media-idle-display">
                <span class="media-idle-glyph">♪</span>
                <span class="media-idle-label">STANDBY</span>
              </div>
            `}
            ${m?"":e.qy`
              <div class="media-now-playing">
                ${g?e.qy`<div class="media-title">${g}</div>`:""}
                ${b?e.qy`<div class="media-artist">${b}</div>`:""}
              </div>
            `}
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
              <button class="media-transport-btn media-play-btn" title="${h?"Pause":"Play"}"
                @click=${()=>this._handleMediaService(o.entity.entity_id,h?"media_pause":"media_play")}>
                ${h?"❚❚":"▶"}
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
              <div class="media-volume" aria-label="Volume: ${Math.round(100*_)}%">
                <button class="media-mute-btn" aria-pressed="${w}" title="${w?"Unmute":"Mute"}"
                  @click=${()=>this._handleMediaService(o.entity.entity_id,"volume_mute",{is_volume_muted:!w})}>
                  ${w?"🔇":"🔊"}
                </button>
                <div class="media-volume-bar" tabindex="0" role="slider"
                  aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(100*_)}"
                  @click=${e=>this._handleVolumeChange(o.entity.entity_id,e)}
                  @keydown=${e=>{"ArrowRight"===e.key&&(e.preventDefault(),this._handleMediaService(o.entity.entity_id,"volume_set",{volume_level:Math.min(1,_+.05)})),"ArrowLeft"===e.key&&(e.preventDefault(),this._handleMediaService(o.entity.entity_id,"volume_set",{volume_level:Math.max(0,_-.05)}))}}>
                  <div class="media-volume-fill" style="width:${Math.round(100*_)}%"></div>
                </div>
                <span class="media-volume-pct">${Math.round(100*_)}%</span>
              </div>
            `:""}
          </div>
        </div>
      `}_partitionPoolEntities(e){const t=[],a=[],r=[],i=[],s=[],n=[],o=[],l=[],c=/orp|ph_|salt|tds|saturation|calcium|alkalinity|cyanuric/i;for(const d of e){const e=d.entity.entity_id,p=d.domain,u=d.state?.attributes||{};if("climate"!==p)if("light"!==p)if("sensor"===p&&c.test(e))r.push(d);else if("switch"!==p){if("sensor"===p&&"temperature"===(u.device_class||"")){o.push(d);continue}l.push(d)}else/pump/i.test(e)?i.push(d):s.push(d);else n.push(d);else/spa/i.test(e)?a.push(d):t.push(d)}return{pool:t,spa:a,chemistry:r,pumps:i,circuits:s,lights:n,environmental:o,diagnostics:l}}_handlePoolSetpoint(e,t,a){const r=P(a,t,{min:40,max:104});this._poolSetpointDebouncer||(this._poolSetpointDebouncer=D((e,t)=>{this._hass.callService("climate","set_temperature",{entity_id:e,temperature:t})},1500)),this._poolSetpointDebouncer.call(e,r)}_renderPoolBody(t,a,r){if(0===t.length)return"";const i=t[0],s=i.state,n=s?.attributes||{},o=null!=n.current_temperature?Number(n.current_temperature):null,l=null!=n.temperature?Number(n.temperature):null,c=function(e,t="pool"){switch(e){case"heating":return"var(--lcars-butterscotch)";case"idle":return"spa"===t?"var(--lcars-sunflower)":"var(--lcars-ice)";default:return"var(--lcars-disabled)"}}(n.hvac_action||"off",a),d="spa"===a?"SPA":"POOL";return e.qy`
        <div class="pool-body-frame" style="--body-color:${c}" role="region"
          aria-label="${d}: ${null!=o?o+"°":"N/A"}, target ${l||"N/A"}°">
          <div class="pool-body-label" style="color:${c}">${d}</div>
          <div class="pool-body-temp">${null!=o?`${Math.round(o)}°`:"—"}</div>
          ${null!=l?e.qy`
            <div class="pool-setpoint-row">
              <button class="climate-sp-btn" aria-label="Decrease ${d} target"
                @click=${()=>this._handlePoolSetpoint(i.entity.entity_id,n,l-(r||1))}>−</button>
              <span class="pool-target" style="color:${c}">${l}°</span>
              <button class="climate-sp-btn" aria-label="Increase ${d} target"
                @click=${()=>this._handlePoolSetpoint(i.entity.entity_id,n,l+(r||1))}>+</button>
            </div>
          `:""}
        </div>
      `}_renderPoolSpaPanel(t){const{pool:a,spa:r,chemistry:i,pumps:s,circuits:n,lights:o,environmental:l,diagnostics:c}=this._partitionPoolEntities(t.entities),d=this._shortDeviceName(t.device)||"Pool & Spa",p=i.length>0,u=a[0]?.state?.attributes?.current_temperature,h=r[0]?.state?.attributes?.current_temperature,m=l.find(e=>/air/i.test(e.entity.entity_id)),v=m?.state?.state;return e.qy`
        <div class="lcars-device-panel pool-panel ${p?"":"pool-no-chem"}" data-panel-type="aquatics"
          style="--panel-frame-color:var(--lcars-bluey)">
          <!-- Header -->
          <div class="pool-header">
            <span class="device-panel-name">${d}</span>
            <div class="device-panel-header-line"></div>
            ${null!=u?e.qy`<span class="pool-temp-badge" style="color:var(--lcars-ice)">POOL ${Math.round(u)}°</span>`:""}
            ${null!=h?e.qy`<span class="pool-temp-badge" style="color:var(--lcars-butterscotch)">SPA ${Math.round(h)}°</span>`:""}
            ${null!=v?e.qy`<span class="pool-temp-badge" style="color:var(--lcars-space-white)">AIR ${Math.round(Number(v))}°</span>`:""}
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
            ${[...s,...n].map(({entity:t,state:a})=>{const r=this._friendlyName(a,t),i="on"===a.state;return e.qy`
                <button class="device-control-btn" role="switch" aria-checked="${i}" ?data-on=${i}
                  @click=${()=>this._handleToggle(t.entity_id)}
                  title="${r}: ${a.state}">
                  <ha-icon .icon=${this._getEntityIcon(a)}></ha-icon>
                  <span>${r}</span>
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
        </div>
      `}_weatherForecastCache={};_getWeatherGlyph(e){return{sunny:"☀","clear-night":"●",partlycloudy:"◑",cloudy:"◔",fog:"≡",rainy:"▽",pouring:"▼",snowy:"✦","snowy-rainy":"◆",hail:"◆",windy:"〰","windy-variant":"〰",lightning:"⚡","lightning-rainy":"⚡",exceptional:"⚠"}[e]||"○"}_getWindCardinal(e){return null==e?"":["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"][Math.round(e/22.5)%16]}_partitionWeatherEntities(e){const t=[],a=[],r=[],i=[],s=[],n=[];for(const o of e){if("weather"===o.domain){t.push(o);continue}const e=o.entity.entity_id,l=o.state?.attributes?.device_class||"";/lightning/i.test(e)?r.push(o):"precipitation"===l||"precipitation_intensity"===l||/rain/i.test(e)?i.push(o):"wind_speed"===l||/wind/i.test(e)?s.push(o):_.has(o.domain)?a.push(o):n.push(o)}return{weather:t,sensors:a,lightning:r,precipitation:i,wind:s,diagnostics:n}}_renderWindCompass(t,a,r){if(null==t)return"";const i=this._getWindCardinal(t),s=t;return e.qy`
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
      `}async _loadWeatherForecast(e){if(this._weatherForecastCache[e])return;const t=await async function(e,t,a="daily",r={}){const{ttlMs:i=6e5}=r,s=`${t}:${a}`,n=Date.now(),o=M.get(s);if(o&&n-o.timestamp<i)return o.data;try{const r=await e.callWS({type:"weather/subscribe_forecast",entity_id:t,forecast_type:a}),i=r?.forecast||r||[],o=Array.isArray(i)?i:[];if(M.set(s,{data:o,timestamp:n}),M.size>10){const e=M.keys().next().value;M.delete(e)}return o}catch(r){try{const r=await e.callService("weather","get_forecasts",{type:a},{entity_id:t}),i=r?.[t]?.forecast||[];return M.set(s,{data:i,timestamp:n}),i}catch(e){return[]}}}(this._hass,e,"daily");t.length>0&&(this._weatherForecastCache[e]=t,this.requestUpdate())}_renderForecastStrip(t){if(!t?.length)return"";const a=t.slice(0,7),r=a.map(e=>e.temperature).filter(Number.isFinite),i=a.map(e=>e.templow).filter(Number.isFinite),s=Math.min(...i,...r),n=Math.max(...r,...i)-s||1;return e.qy`
        <div class="weather-forecast" role="list" aria-label="7-day forecast">
          ${a.map(t=>{const a=new Date(t.datetime).toLocaleDateString("en",{weekday:"short"}).toUpperCase(),r=t.temperature,i=t.templow,o=t.condition,l=this._getWeatherGlyph(o),c=q(o),d=t.precipitation_probability,p=(i-s)/n*100,u=(r-i||1)/n*100;return e.qy`
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
      `}_renderWeatherPanel(t){const{weather:a,sensors:r,lightning:i,precipitation:s,wind:n,diagnostics:o}=this._partitionWeatherEntities(t.entities),l=this._shortDeviceName(t.device)||"Weather";if(0===a.length)return"";const c=a[0],d=c.state,p=d?.attributes||{},u=d?.state||"unavailable",h=q(u),m=this._getWeatherGlyph(u),v=p.temperature,f=p.humidity,g=p.pressure,b=p.wind_speed,y=p.wind_bearing,_=p.wind_speed_unit||"mph";this._loadWeatherForecast(c.entity.entity_id);const w=this._weatherForecastCache[c.entity.entity_id];return e.qy`
        <div class="lcars-device-panel weather-panel" data-panel-type="weather"
          style="--panel-frame-color:${h}">
          <!-- Header -->
          <div class="weather-header">
            <span class="device-panel-name">${l}</span>
            <div class="device-panel-header-line"></div>
            <span class="weather-condition-badge" style="color:${h}">
              ${m} ${u.toUpperCase().replace(/[_-]/g," ")}
            </span>
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
              <text x="100" y="35" text-anchor="middle" fill="${h}"
                font-family="var(--lcars-font)" font-size="28">${m}</text>
              <text x="100" y="85" text-anchor="middle" fill="${h}"
                font-family="var(--lcars-font)" font-size="48" font-weight="bold">
                ${null!=v?`${Math.round(v)}°`:"—"}
              </text>
              <text x="100" y="108" text-anchor="middle" fill="var(--lcars-data-accent)"
                font-family="var(--lcars-font)" font-size="12">
                ${u.toUpperCase().replace(/[_-]/g," ")}
              </text>
            </svg>
            ${this._renderWindCompass(y,b,_)}
          </div>

          <!-- Forecast (bottom) -->
          ${this._renderForecastStrip(w)}
        </div>
      `}_irrigationLimiter=N(5,1e4);_partitionIrrigationEntities(e){const t=[],a=[],r=[];for(const i of e){const e=i.domain,s=i.entity.entity_id,n=i.state?.attributes||{};"switch"!==e?"binary_sensor"!==e||r.some(e=>!0)?a.push(i):r.push(i):null!=n.zone_number||/zone/i.test(s)?t.push(i):r.push(i)}return t.sort((e,t)=>(e.state?.attributes?.zone_number??999)-(t.state?.attributes?.zone_number??999)),{zones:t,sensors:a,controller:r}}_handleIrrigationZone(e,t){this._irrigationLimiter.allow()&&this._hass.callService("switch",t?"turn_on":"turn_off",{entity_id:e})}_renderIrrigationPanel(t){const{zones:a,sensors:r,controller:i}=this._partitionIrrigationEntities(t.entities),s=this._shortDeviceName(t.device)||"Irrigation",n=a.find(e=>"on"===e.state?.state),o=i.some(e=>"switch"===e.domain&&"off"===e.state?.state);return e.qy`
        <div class="lcars-device-panel irrigation-panel" data-panel-type="irrigation"
          style="--panel-frame-color:var(--lcars-ice)">
          <!-- Header -->
          <div class="irrigation-header">
            <span class="device-panel-name">${s}</span>
            <div class="device-panel-header-line"></div>
            <span class="irrigation-status-badge" style="color:${n?"var(--lcars-ice)":o?"var(--lcars-gray)":"var(--lcars-sunflower)"}">
              ${n?`WATERING ${this._friendlyName(n.state,n.entity)}`:o?"STANDBY":"IDLE"}
            </span>
          </div>

          <!-- Schedule (left) -->
          <div class="irrigation-schedule" role="list" aria-label="Schedule info">
            ${r.map(({entity:t,state:a})=>{const r=this._friendlyName(a,t),i=a.attributes?.unit_of_measurement||"",s=this._getSensorIndicatorColor(a);return e.qy`
                <div class="device-sensor-line" tabindex="0" role="listitem"
                  aria-label="${r}: ${a.state}${i?" "+i:""}"
                  @click=${()=>this._handleEntityClick(t.entity_id)}>
                  <div class="sensor-indicator" style="background:${s}"></div>
                  <span class="sensor-label">${r}</span>
                  <span class="sensor-state-value" style="color:${s}">${a.state}${i?" "+i:""}</span>
                </div>
              `})}
          </div>

          <!-- Zones (right) -->
          <div class="irrigation-zones" role="list" aria-label="Irrigation zones">
            ${a.map(({entity:t,state:a})=>{const r=this._friendlyName(a,t),i="on"===a.state,s=function(e,t=!1){if(t)return"var(--lcars-disabled)";switch(e){case"on":return"var(--lcars-ice)";case"off":return"var(--lcars-sunflower)";case"unavailable":return"var(--lcars-tomato)";default:return"var(--lcars-disabled)"}}(a.state,o);return e.qy`
                <div class="irrigation-zone-row" role="listitem" tabindex="0"
                  aria-label="${r}: ${i?"watering":"idle"}">
                  <button class="irrigation-zone-btn" ?data-on=${i}
                    style="--zone-color:${s}"
                    ?disabled=${o}
                    aria-label="${i?"Stop":"Start"} watering ${r}"
                    @click=${()=>this._handleIrrigationZone(t.entity_id,!i)}>
                    ${i?"STOP":"START"}
                  </button>
                  <span class="irrigation-zone-name">${r}</span>
                  <span class="irrigation-zone-status" style="color:${s}">
                    ${o?"STANDBY":i?"WATERING":"IDLE"}
                  </span>
                  ${i?e.qy`
                    <div class="irrigation-zone-fill" role="progressbar"
                      aria-label="Zone active" aria-valuemin="0" aria-valuemax="100" aria-valuenow="100"
                      style="background:var(--lcars-ice)"></div>
                  `:""}
                </div>
              `})}
          </div>

          <!-- Standby Toggle (bottom) -->
          ${i.filter(e=>"switch"===e.domain).map(({entity:t,state:a})=>{const r="off"===a.state;return e.qy`
              <div class="irrigation-standby">
                <button class="device-control-btn irrigation-standby-btn" role="switch"
                  aria-checked="${r}" ?data-on=${!r}
                  @click=${()=>this._handleToggle(t.entity_id)}
                  title="Standby mode: ${r?"ON":"OFF"}">
                  <ha-icon icon="mdi:water-off"></ha-icon>
                  <span>STANDBY ${r?"ON":"OFF"}</span>
                </button>
              </div>
            `})}
        </div>
      `}_renderAreaContent(t){if(0===t.length)return e.qy`<div class="lcars-empty">No entities in this area</div>`;const{byDevice:a,noDevice:r}=this._groupEntities(t),i=[],s=[];for(const e of a.values()){const t=this._getDevicePanelType(e.entities);t?i.push({...e,panelType:t}):s.push(e)}const n=e.qy`
        ${s.map(t=>e.qy`
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
        ${r.length>0?e.qy`
          <div class="device-group">
            <div class="device-header">
              <h3 class="device-name">Other Entities</h3>
              <div class="device-line"></div>
            </div>
            ${this._renderDomainGroups(r)}
          </div>
        `:""}
      `;return 0===i.length?n:(i.sort((e,t)=>(h[e.panelType]??99)-(h[t.panelType]??99)),e.qy`
        <div class="area-split-layout">
          <div class="area-split-main">${n}</div>
          <div class="area-split-panels" aria-live="polite">
            ${i.map(e=>this._renderDevicePanel(e.panelType,e))}
          </div>
        </div>
      `)}_renderDomainGroups(t){const a=this._groupByDomain(t);return e.qy`${a.map(([t,a])=>e.qy`
        <div class="domain-label" role="heading" aria-level="4">${z[t]||t}</div>
        ${this._renderDomainEntities(t,a)}
      `)}`}_renderDomainEntities(e,t){return m.has(e)?this._renderCameras(t):y.has(e)?this._renderToggles(t):v.has(e)?this._renderClimates(t):w.has(e)?this._renderCovers(t):f.has(e)?this._renderMedia(t):_.has(e)?this._renderSensors(t):this._renderGeneric(t)}_renderCameras(t){return e.qy`<div class="camera-grid">
        ${t.map(({entity:t,state:a},r)=>{const i=this._friendlyName(a,t),s=this._isOff(a),n=F(a);return e.qy`
            <div class="camera-frame" ?data-off=${s} style="--i:${r}"
              role="button"
              tabindex="0"
              aria-label="${i} camera: ${a.state}"
              @click=${()=>this._handleEntityClick(t.entity_id)}
              @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._handleEntityClick(t.entity_id))}}>
              ${n?e.qy`<img src="${n}" alt="${i}" loading="lazy"
                            data-entity="${t.entity_id}"
                            @error=${e=>{e.target.style.display="none",e.target.nextElementSibling&&(e.target.nextElementSibling.style.display="flex")}}
                            @load=${e=>{e.target.style.display="";const t=e.target.nextElementSibling;t?.classList.contains("camera-error-fallback")&&(t.style.display="none")}} /><div class="camera-error-fallback" style="display:none;aspect-ratio:16/9;align-items:center;justify-content:center;">
                    <ha-icon icon="mdi:video-off" style="--mdc-icon-size:48px;color:var(--lcars-gray)"></ha-icon>
                  </div>`:e.qy`<div style="aspect-ratio:16/9;display:flex;align-items:center;justify-content:center;">
                    <ha-icon icon="mdi:video-off" style="--mdc-icon-size:48px;color:var(--lcars-gray)"></ha-icon>
                  </div>`}
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
      </div>`}getCardSize(){return 6}}customElements.get("homepage-card")?r.g0.warn(T,"Custom element homepage-card already registered — skipping"):(customElements.define("homepage-card",O),r.g0.debug(T,"Custom element registered: homepage-card"))})(),(()=>{var e=a(845),t=a(622),r=a(851);class i extends e.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object},_pages:{type:Array}}}constructor(){super(),this._pages=[]}set hass(e){this._hass=e,0===this._pages.length&&this._loadPages()}setConfig(e){this._config=e}async _loadPages(){if(this._hass)try{const e=await this._hass.callWS({type:"lcars_dashboard/configuration/get"});e&&e.more_pages&&(this._pages=Object.entries(e.more_pages).map(([e,t])=>({id:e,...t})))}catch(e){console.warn("LCARS: Could not load more-pages",e)}}_openPage(e){(0,r.oo)(`/lcars-dashboard/more/${e}`)}static get styles(){return[t.B,e.AH`
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
      `}getCardSize(){return 4}}customElements.get("lcars-more-pages-card")||customElements.define("lcars-more-pages-card",i)})(),(()=>{var e=a(845),t=a(622),r=a(851);class i extends e.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object},_cards:{type:Array}}}constructor(){super(),this._cards=[]}set hass(e){this._hass=e,this._cards.forEach(t=>{t&&(t.hass=e)})}setConfig(e){this._config=e,this._createCards()}async _createCards(){this._config&&this._config.cards&&(this._cards=await Promise.all(this._config.cards.map(async e=>{try{const t=await(0,r.te)(e);return this._hass&&(t.hass=this._hass),t}catch(t){return console.error("LCARS: Failed to create card",e,t),null}})),this._cards=this._cards.filter(Boolean),this.requestUpdate())}static get styles(){return[t.B,e.AH`
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
      `}getCardSize(){return this._cards.length||1}}customElements.get("lcars-more-page-card")||customElements.define("lcars-more-page-card",i)})(),(()=>{var e=a(845),t=a(622),r=a(851);class i extends e.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object}}}set hass(e){this._hass=e}setConfig(e){this._config=e}async _save(e){if(this._hass)try{await this._hass.callWS({type:"lcars_dashboard/more_page/set",...e}),(0,r.rC)("lcars_dashboard_reload")}catch(e){console.error("LCARS Edit: Failed to save more-page",e)}}static get styles(){return[t.B,e.AH`
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
      `}getCardSize(){return 3}}customElements.get("lcars-edit-more-page-card")||customElements.define("lcars-edit-more-page-card",i)})(),(()=>{var e=a(845),t=a(622);class r extends e.WF{static get properties(){return{_hass:{type:Object},_notifications:{type:Array}}}constructor(){super(),this._notifications=[]}set hass(e){this._hass=e,this._loadNotifications()}setConfig(e){this._config=e}async _loadNotifications(){if(this._hass)try{const e=await this._hass.callWS({type:"lcars_dashboard/notification/get"});Array.isArray(e)&&(this._notifications=e)}catch(e){}}_dismissNotification(e){this._hass&&this._hass.callWS({type:"lcars_dashboard/notification/dismiss",notification_id:e}).then(()=>{this._notifications=this._notifications.filter(t=>t.id!==e)}).catch(()=>{})}static get styles(){return[t.B,e.AH`
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
      `}getCardSize(){return this._notifications.length||0}}customElements.get("lcars-notification-card")||customElements.define("lcars-notification-card",r)})(),(()=>{var e=a(845),t=a(622),r=a(851);class i extends e.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object},_expanded:{type:Boolean}}}constructor(){super(),this._expanded=!1}set hass(e){this._hass=e}setConfig(e){this._config=e}_toggle(){this._expanded=!this._expanded}_getWeatherEntity(){if(!this._hass)return null;const e=Object.keys(this._hass.states).filter(e=>e.startsWith("weather."));return e.length>0?this._hass.states[e[0]]:null}_getPersonEntities(){return this._hass?Object.keys(this._hass.states).filter(e=>e.startsWith("person.")).map(e=>this._hass.states[e]):[]}static get styles(){return[t.B,e.AH`
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
      `}getCardSize(){return this._expanded?4:1}}customElements.get("lcars-house-information-card")||customElements.define("lcars-house-information-card",i)})(),(()=>{var e=a(845),t=a(622),r=a(851);class i extends e.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object}}}set hass(e){this._hass=e}setConfig(e){this._config=e}static get styles(){return[t.B,e.AH`
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
      `}getCardSize(){return 4}}customElements.get("lcars-house-information-more-info-card")||customElements.define("lcars-house-information-more-info-card",i)})(),(()=>{var e=a(845),t=a(622),r=a(851);class i extends e.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object},_card:{type:Object}}}constructor(){super(),this._card=null}set hass(e){this._hass=e,this._card&&(this._card.hass=e)}setConfig(e){this._config=e,e.card&&this._createCard(e.card)}async _createCard(e){try{this._card=await(0,r.te)(e),this._hass&&(this._card.hass=this._hass),this.requestUpdate()}catch(e){console.error("LCARS Blueprint: Failed to create card",e)}}static get styles(){return[t.B,e.AH`
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
      `}getCardSize(){return this._card?2:1}}customElements.get("lcars-blueprint-card")||customElements.define("lcars-blueprint-card",i)})(),(()=>{var e=a(845),t=a(622),r=a(851);class i extends e.WF{static get properties(){return{_hass:{type:Object},_selectedDomain:{type:String}}}constructor(){super(),this._selectedDomain=null}set hass(e){this._hass=e}setConfig(e){this._config=e}_getDomainGroups(){if(!this._hass||!this._hass.states)return{};const e={};Object.keys(this._hass.states).forEach(t=>{const a=t.split(".")[0];e[a]||(e[a]=[]),e[a].push(t)});const t={};return Object.keys(e).sort().forEach(a=>{t[a]=e[a]}),t}_getDomainIcon(e){return{light:"mdi:lightbulb-group",switch:"mdi:toggle-switch-outline",sensor:"mdi:eye",binary_sensor:"mdi:radiobox-blank",climate:"mdi:thermostat",cover:"mdi:window-shutter",fan:"mdi:fan",lock:"mdi:lock",camera:"mdi:video",media_player:"mdi:cast",automation:"mdi:robot",script:"mdi:script-text",person:"mdi:account",input_boolean:"mdi:toggle-switch",input_number:"mdi:ray-vertex",input_select:"mdi:format-list-bulleted",input_text:"mdi:form-textbox",scene:"mdi:palette",group:"mdi:google-circles-communities",timer:"mdi:timer-outline",counter:"mdi:counter",weather:"mdi:weather-partly-cloudy",vacuum:"mdi:robot-vacuum",water_heater:"mdi:water-boiler"}[e]||"mdi:devices"}_toggleDomain(e){this._selectedDomain=this._selectedDomain===e?null:e}_handleEntityClick(e){(0,r.Hv)(e)}static get styles(){return[t.B,e.AH`
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
      `}getCardSize(){return 8}}customElements.get("devices-card")||customElements.define("devices-card",i)})(),(()=>{var e=a(845),t=a(622),r=a(851);class i extends e.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object},_cards:{type:Array}}}constructor(){super(),this._cards=[]}set hass(e){this._hass=e,this._cards.forEach(t=>{t&&(t.hass=e)})}setConfig(e){this._config=e,this._createCards()}async _createCards(){this._config&&this._config.cards&&(this._cards=await Promise.all(this._config.cards.map(async e=>{try{const t=await(0,r.te)(e);return this._hass&&(t.hass=this._hass),t}catch(t){return console.error("LCARS Flexbox: Failed to create card",e,t),null}})),this._cards=this._cards.filter(Boolean),this.requestUpdate())}static get styles(){return[t.B,e.AH`
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
      `}getCardSize(){return 1}}customElements.get("lcars-flexbox-card")||customElements.define("lcars-flexbox-card",i)})(),(()=>{var e=a(845),t=a(622);class r extends e.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object}}}set hass(e){this._hass=e}setConfig(e){if(!e.heading)throw new Error("Please define heading");this._config=e}static get styles(){return[t.B,e.AH`
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
      `}getCardSize(){return 1}}customElements.get("lcars-heading-card")||customElements.define("lcars-heading-card",r)})(),(()=>{var e=a(845),t=a(622);class r extends e.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object}}}set hass(e){this._hass=e}setConfig(e){this._config=e}static get styles(){return[t.B,e.AH`
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
      `}getCardSize(){return 1}}customElements.get("lcars-create-custom-card-card")||customElements.define("lcars-create-custom-card-card",r)})(),(()=>{var e=a(845),t=a(622),r=a(851);const i=e.AH`
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
`;class s extends e.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object}}}set hass(e){this._hass=e}setConfig(e){this._config=e}async _save(){if(this._hass)try{await this._hass.callWS({type:"lcars_dashboard/area_button/set",...this._getFormData()}),(0,r.rC)("lcars_dashboard_reload")}catch(e){console.error("LCARS Edit: Save failed",e)}}_getFormData(){const e=this.shadowRoot.querySelectorAll(".edit-input");return{name:e[0]?.value,icon:e[1]?.value}}static get styles(){return[t.B,i]}render(){return e.qy`
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
      `}getCardSize(){return 3}}customElements.get("lcars-edit-area-button-card")||customElements.define("lcars-edit-area-button-card",s)})(),(()=>{var e=a(845),t=a(622),r=a(851);const i=e.AH`
  :host { display: block; }
  .edit-container { display: flex; flex-direction: column; gap: var(--lcars-gap); padding: 0.5rem 0; }
  .edit-field { display: flex; flex-direction: column; gap: 0.25rem; }
  .edit-label { font-family: var(--lcars-font); font-size: 0.625rem; color: var(--lcars-gray); text-transform: uppercase; }
  .edit-input { height: 2.5rem; padding: 0 0.75rem; background: var(--lcars-ice); color: var(--lcars-black); border: none; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; outline: none; }
  .edit-input:focus { box-shadow: 0 0 0 2px var(--lcars-btn-active); }
  .edit-actions { display: flex; gap: var(--lcars-gap); padding-top: 0.5rem; }
  .action-btn { flex: 1; height: var(--lcars-btn-height); background: var(--lcars-butterscotch); color: var(--lcars-black); border: none; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; cursor: pointer; transition: filter var(--lcars-transition); user-select: none; }
  .action-btn:hover { filter: brightness(1.2); }
`;class s extends e.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object}}}set hass(e){this._hass=e}setConfig(e){this._config=e}async _save(){if(this._hass)try{await this._hass.callWS({type:"lcars_dashboard/entity_card/set",...this._getFormData()}),(0,r.rC)("lcars_dashboard_reload")}catch(e){console.error("LCARS Edit: Save failed",e)}}_getFormData(){const e=this.shadowRoot.querySelectorAll(".edit-input");return{entity:e[0]?.value,name:e[1]?.value}}static get styles(){return[t.B,i]}render(){return e.qy`
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
      `}getCardSize(){return 3}}customElements.get("lcars-edit-entity-card-card")||customElements.define("lcars-edit-entity-card-card",s)})(),(()=>{var e=a(845),t=a(622),r=a(851);const i=e.AH`
  :host { display: block; }
  .edit-container { display: flex; flex-direction: column; gap: var(--lcars-gap); padding: 0.5rem 0; }
  .edit-field { display: flex; flex-direction: column; gap: 0.25rem; }
  .edit-label { font-family: var(--lcars-font); font-size: 0.625rem; color: var(--lcars-gray); text-transform: uppercase; }
  .edit-input { height: 2.5rem; padding: 0 0.75rem; background: var(--lcars-ice); color: var(--lcars-black); border: none; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; outline: none; }
  .edit-input:focus { box-shadow: 0 0 0 2px var(--lcars-btn-active); }
  .edit-actions { display: flex; gap: var(--lcars-gap); padding-top: 0.5rem; }
  .action-btn { flex: 1; height: var(--lcars-btn-height); background: var(--lcars-butterscotch); color: var(--lcars-black); border: none; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; cursor: pointer; transition: filter var(--lcars-transition); user-select: none; }
  .action-btn:hover { filter: brightness(1.2); }
`;class s extends e.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object}}}set hass(e){this._hass=e}setConfig(e){this._config=e}async _save(){if(this._hass)try{await this._hass.callWS({type:"lcars_dashboard/entity/set",...this._getFormData()}),(0,r.rC)("lcars_dashboard_reload")}catch(e){console.error("LCARS Edit: Save failed",e)}}_getFormData(){const e=this.shadowRoot.querySelectorAll(".edit-input");return{entity:e[0]?.value,icon:e[1]?.value,name:e[2]?.value}}static get styles(){return[t.B,i]}render(){return e.qy`
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
      `}getCardSize(){return 4}}customElements.get("lcars-edit-entity-card")||customElements.define("lcars-edit-entity-card",s)})(),(()=>{var e=a(845),t=a(622),r=a(851);const i=e.AH`
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
`;class s extends e.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object}}}set hass(e){this._hass=e}setConfig(e){this._config=e}async _save(){if(this._hass)try{await this._hass.callWS({type:"lcars_dashboard/entity_popup/set",...this._getFormData()}),(0,r.rC)("lcars_dashboard_reload")}catch(e){console.error("LCARS Edit: Save failed",e)}}_getFormData(){const e=this.shadowRoot.querySelector(".edit-input")?.value,t=this.shadowRoot.querySelector(".edit-textarea")?.value;return{entity:e,yaml_config:t}}static get styles(){return[t.B,i]}render(){return e.qy`
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
      `}getCardSize(){return 5}}customElements.get("lcars-edit-entity-popup-card")||customElements.define("lcars-edit-entity-popup-card",s)})(),(()=>{var e=a(845),t=a(622),r=a(851);const i=e.AH`
  :host { display: block; }
  .edit-container { display: flex; flex-direction: column; gap: var(--lcars-gap); padding: 0.5rem 0; }
  .edit-field { display: flex; flex-direction: column; gap: 0.25rem; }
  .edit-label { font-family: var(--lcars-font); font-size: 0.625rem; color: var(--lcars-gray); text-transform: uppercase; }
  .edit-input { height: 2.5rem; padding: 0 0.75rem; background: var(--lcars-ice); color: var(--lcars-black); border: none; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; outline: none; }
  .edit-input:focus { box-shadow: 0 0 0 2px var(--lcars-btn-active); }
  .edit-actions { display: flex; gap: var(--lcars-gap); padding-top: 0.5rem; }
  .action-btn { flex: 1; height: var(--lcars-btn-height); background: var(--lcars-butterscotch); color: var(--lcars-black); border: none; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; cursor: pointer; transition: filter var(--lcars-transition); user-select: none; }
  .action-btn:hover { filter: brightness(1.2); }
`;class s extends e.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object}}}set hass(e){this._hass=e}setConfig(e){this._config=e}async _save(){if(this._hass)try{await this._hass.callWS({type:"lcars_dashboard/homepage_header/set",...this._getFormData()}),(0,r.rC)("lcars_dashboard_reload")}catch(e){console.error("LCARS Edit: Save failed",e)}}_getFormData(){const e=this.shadowRoot.querySelectorAll(".edit-input");return{title:e[0]?.value,subtitle:e[1]?.value}}static get styles(){return[t.B,i]}render(){return e.qy`
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
      `}getCardSize(){return 3}}customElements.get("lcars-edit-homepage-header-card")||customElements.define("lcars-edit-homepage-header-card",s)})(),(()=>{var e=a(845),t=a(622),r=a(851);const i=e.AH`
  :host { display: block; }
  .edit-container { display: flex; flex-direction: column; gap: var(--lcars-gap); padding: 0.5rem 0; }
  .edit-field { display: flex; flex-direction: column; gap: 0.25rem; }
  .edit-label { font-family: var(--lcars-font); font-size: 0.625rem; color: var(--lcars-gray); text-transform: uppercase; }
  .edit-input { height: 2.5rem; padding: 0 0.75rem; background: var(--lcars-ice); color: var(--lcars-black); border: none; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; outline: none; }
  .edit-input:focus { box-shadow: 0 0 0 2px var(--lcars-btn-active); }
  .edit-actions { display: flex; gap: var(--lcars-gap); padding-top: 0.5rem; }
  .action-btn { flex: 1; height: var(--lcars-btn-height); background: var(--lcars-butterscotch); color: var(--lcars-black); border: none; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; cursor: pointer; transition: filter var(--lcars-transition); user-select: none; }
  .action-btn:hover { filter: brightness(1.2); }
`;class s extends e.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object}}}set hass(e){this._hass=e}setConfig(e){this._config=e}async _save(){if(this._hass)try{await this._hass.callWS({type:"lcars_dashboard/device_card/set",...this._getFormData()}),(0,r.rC)("lcars_dashboard_reload")}catch(e){console.error("LCARS Edit: Save failed",e)}}_getFormData(){const e=this.shadowRoot.querySelectorAll(".edit-input");return{device:e[0]?.value,name:e[1]?.value}}static get styles(){return[t.B,i]}render(){return e.qy`
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
      `}getCardSize(){return 3}}customElements.get("lcars-edit-device-card-card")||customElements.define("lcars-edit-device-card-card",s)})(),(()=>{var e=a(845),t=a(622),r=a(851);const i=e.AH`
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
`;class s extends e.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object}}}set hass(e){this._hass=e}setConfig(e){this._config=e}async _save(){if(this._hass)try{await this._hass.callWS({type:"lcars_dashboard/device_popup/set",...this._getFormData()}),(0,r.rC)("lcars_dashboard_reload")}catch(e){console.error("LCARS Edit: Save failed",e)}}_getFormData(){const e=this.shadowRoot.querySelector(".edit-input")?.value,t=this.shadowRoot.querySelector(".edit-textarea")?.value;return{device:e,yaml_config:t}}static get styles(){return[t.B,i]}render(){return e.qy`
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
      `}getCardSize(){return 5}}customElements.get("lcars-edit-device-popup-card")||customElements.define("lcars-edit-device-popup-card",s)})(),(()=>{var e=a(845),t=a(622),r=a(851);const i=e.AH`
  :host { display: block; }
  .edit-container { display: flex; flex-direction: column; gap: var(--lcars-gap); padding: 0.5rem 0; }
  .edit-field { display: flex; flex-direction: column; gap: 0.25rem; }
  .edit-label { font-family: var(--lcars-font); font-size: 0.625rem; color: var(--lcars-gray); text-transform: uppercase; }
  .edit-input { height: 2.5rem; padding: 0 0.75rem; background: var(--lcars-ice); color: var(--lcars-black); border: none; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; outline: none; }
  .edit-input:focus { box-shadow: 0 0 0 2px var(--lcars-btn-active); }
  .edit-actions { display: flex; gap: var(--lcars-gap); padding-top: 0.5rem; }
  .action-btn { flex: 1; height: var(--lcars-btn-height); background: var(--lcars-butterscotch); color: var(--lcars-black); border: none; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; cursor: pointer; transition: filter var(--lcars-transition); user-select: none; }
  .action-btn:hover { filter: brightness(1.2); }
`;class s extends e.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object}}}set hass(e){this._hass=e}setConfig(e){this._config=e}async _save(){if(this._hass)try{await this._hass.callWS({type:"lcars_dashboard/device_button/set",...this._getFormData()}),(0,r.rC)("lcars_dashboard_reload")}catch(e){console.error("LCARS Edit: Save failed",e)}}_getFormData(){const e=this.shadowRoot.querySelectorAll(".edit-input");return{device:e[0]?.value,name:e[1]?.value,icon:e[2]?.value}}static get styles(){return[t.B,i]}render(){return e.qy`
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
      `}getCardSize(){return 4}}customElements.get("lcars-edit-device-button-card")||customElements.define("lcars-edit-device-button-card",s)})(),(()=>{var e=a(845),t=a(622),r=a(851);class i extends e.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object},_open:{type:Boolean},_card:{type:Object}}}constructor(){super(),this._open=!1,this._card=null}set hass(e){this._hass=e,this._card&&(this._card.hass=e)}setConfig(e){this._config=e,e.card&&this._createCard(e.card)}async _createCard(e){try{this._card=await(0,r.te)(e),this._hass&&(this._card.hass=this._hass),this.requestUpdate()}catch(e){console.error("LCARS Popup: Failed to create card",e)}}open(){this._open=!0}close(){this._open=!1}_handleBackdropClick(e){e.target===e.currentTarget&&this.close()}_handleKeydown(e){"Escape"===e.key&&this.close()}static get styles(){return[t.B,e.AH`
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
      `}getCardSize(){return 0}}customElements.get("lcars-popup")||customElements.define("lcars-popup",i)})()})();