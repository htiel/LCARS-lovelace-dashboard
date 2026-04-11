/*! For license information please see lcars-dashboard.js.LICENSE.txt */
(()=>{"use strict";var e={851(e,t,a){function s(e,t={},a=null){const s=new Event(e,{bubbles:!0,cancelable:!1,composed:!0});if(s.detail=t,a)a.dispatchEvent(s);else{const e=function(){let e=document.querySelector("hc-main");return e?(e=e?.shadowRoot?.querySelector("hc-lovelace")?.shadowRoot,e?.querySelector("hui-view")||e?.querySelector("hui-panel-view")):(e=document.querySelector("home-assistant"),e=e?.shadowRoot?.querySelector("home-assistant-main")?.shadowRoot,e=e?.querySelector("app-drawer-layout partial-panel-resolver"),e=e?.shadowRoot||e,e=e?.querySelector("ha-panel-lovelace")?.shadowRoot,e=e?.querySelector("hui-root")?.shadowRoot,e=e?.querySelector("ha-app-layout")?.querySelector("#view"),e?.firstElementChild)}();e&&e.dispatchEvent(s)}}function r(e,t=!1){t?history.replaceState(null,"",e):history.pushState(null,"",e),s("location-changed",{replace:t},window)}function i(e){s("hass-more-info",{entityId:e},document.querySelector("hc-main")||document.querySelector("home-assistant"))}a.d(t,{Hv:()=>i,oo:()=>r,rC:()=>s})},622(e,t,a){a.d(t,{B:()=>i});var s=a(845);const r=s.AH`
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
  --lcars-elbow-w: 9.5rem;
  --lcars-elbow-h: 4.5rem;
  --lcars-elbow-radius: 3.75rem;
  --lcars-sidebar-w: 12rem;
  --lcars-bar-h: 1.5rem;
  --lcars-endcap: 1.5rem;
  --lcars-btn-radius: 1.5rem;
  --lcars-btn-height: 3rem;

  /* ─── Typography ─── */
  --lcars-font: 'Antonio', 'Helvetica Neue', Arial, sans-serif;
  --lcars-font-size-title: 2rem;
  --lcars-font-size-sub: 1.25rem;
  --lcars-font-size-data: 0.875rem;

  /* ─── Animation ─── */
  --lcars-transition: 200ms ease-out;
  --lcars-transition-slow: 400ms ease-out;
`,i=s.AH`
  :host {
    ${r}
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
`},845(e,t,a){a.d(t,{WF:()=>se,AH:()=>te,qy:()=>L});const s="undefined"!=typeof window&&null!=window.customElements&&void 0!==window.customElements.polyfillWrapFlushCallback,r=(e,t,a=null)=>{for(;t!==a;){const a=t.nextSibling;e.removeChild(t),t=a}},i=`{{lit-${String(Math.random()).slice(2)}}}`,n=`\x3c!--${i}--\x3e`,o=new RegExp(`${i}|${n}`),c="$lit$";class l{constructor(e,t){this.parts=[],this.element=t;const a=[],s=[],r=document.createTreeWalker(t.content,133,null,!1);let n=0,l=-1,h=0;const{strings:m,values:{length:f}}=e;for(;h<f;){const e=r.nextNode();if(null!==e){if(l++,1===e.nodeType){if(e.hasAttributes()){const t=e.attributes,{length:a}=t;let s=0;for(let e=0;e<a;e++)d(t[e].name,c)&&s++;for(;s-- >0;){const t=m[h],a=u.exec(t)[2],s=a.toLowerCase()+c,r=e.getAttribute(s);e.removeAttribute(s);const i=r.split(o);this.parts.push({type:"attribute",index:l,name:a,strings:i}),h+=i.length-1}}"TEMPLATE"===e.tagName&&(s.push(e),r.currentNode=e.content)}else if(3===e.nodeType){const t=e.data;if(t.indexOf(i)>=0){const s=e.parentNode,r=t.split(o),i=r.length-1;for(let t=0;t<i;t++){let a,i=r[t];if(""===i)a=p();else{const e=u.exec(i);null!==e&&d(e[2],c)&&(i=i.slice(0,e.index)+e[1]+e[2].slice(0,-5)+e[3]),a=document.createTextNode(i)}s.insertBefore(a,e),this.parts.push({type:"node",index:++l})}""===r[i]?(s.insertBefore(p(),e),a.push(e)):e.data=r[i],h+=i}}else if(8===e.nodeType)if(e.data===i){const t=e.parentNode;null!==e.previousSibling&&l!==n||(l++,t.insertBefore(p(),e)),n=l,this.parts.push({type:"node",index:l}),null===e.nextSibling?e.data="":(a.push(e),l--),h++}else{let t=-1;for(;-1!==(t=e.data.indexOf(i,t+1));)this.parts.push({type:"node",index:-1}),h++}}else r.currentNode=s.pop()}for(const e of a)e.parentNode.removeChild(e)}}const d=(e,t)=>{const a=e.length-t.length;return a>=0&&e.slice(a)===t},h=e=>-1!==e.index,p=()=>document.createComment(""),u=/([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F "'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;function m(e,t){const{element:{content:a},parts:s}=e,r=document.createTreeWalker(a,133,null,!1);let i=v(s),n=s[i],o=-1,c=0;const l=[];let d=null;for(;r.nextNode();){o++;const e=r.currentNode;for(e.previousSibling===d&&(d=null),t.has(e)&&(l.push(e),null===d&&(d=e)),null!==d&&c++;void 0!==n&&n.index===o;)n.index=null!==d?-1:n.index-c,i=v(s,i),n=s[i]}l.forEach(e=>e.parentNode.removeChild(e))}const f=e=>{let t=11===e.nodeType?0:1;const a=document.createTreeWalker(e,133,null,!1);for(;a.nextNode();)t++;return t},v=(e,t=-1)=>{for(let a=t+1;a<e.length;a++){const t=e[a];if(h(t))return a}return-1},g=new WeakMap,b=e=>"function"==typeof e&&g.has(e),y={},_={};class w{constructor(e,t,a){this.__parts=[],this.template=e,this.processor=t,this.options=a}update(e){let t=0;for(const a of this.__parts)void 0!==a&&a.setValue(e[t]),t++;for(const e of this.__parts)void 0!==e&&e.commit()}_clone(){const e=s?this.template.element.content.cloneNode(!0):document.importNode(this.template.element.content,!0),t=[],a=this.template.parts,r=document.createTreeWalker(e,133,null,!1);let i,n=0,o=0,c=r.nextNode();for(;n<a.length;)if(i=a[n],h(i)){for(;o<i.index;)o++,"TEMPLATE"===c.nodeName&&(t.push(c),r.currentNode=c.content),null===(c=r.nextNode())&&(r.currentNode=t.pop(),c=r.nextNode());if("node"===i.type){const e=this.processor.handleTextExpression(this.options);e.insertAfterNode(c.previousSibling),this.__parts.push(e)}else this.__parts.push(...this.processor.handleAttributeExpressions(c,i.name,i.strings,this.options));n++}else this.__parts.push(void 0),n++;return s&&(document.adoptNode(e),customElements.upgrade(e)),e}}const x=window.trustedTypes&&trustedTypes.createPolicy("lit-html",{createHTML:e=>e}),S=` ${i} `;class k{constructor(e,t,a,s){this.strings=e,this.values=t,this.type=a,this.processor=s}getHTML(){const e=this.strings.length-1;let t="",a=!1;for(let s=0;s<e;s++){const e=this.strings[s],r=e.lastIndexOf("\x3c!--");a=(r>-1||a)&&-1===e.indexOf("--\x3e",r+1);const o=u.exec(e);t+=null===o?e+(a?S:n):e.substr(0,o.index)+o[1]+o[2]+c+o[3]+i}return t+=this.strings[e],t}getTemplateElement(){const e=document.createElement("template");let t=this.getHTML();return void 0!==x&&(t=x.createHTML(t)),e.innerHTML=t,e}}const C=e=>null===e||!("object"==typeof e||"function"==typeof e),E=e=>Array.isArray(e)||!(!e||!e[Symbol.iterator]);class z{constructor(e,t,a){this.dirty=!0,this.element=e,this.name=t,this.strings=a,this.parts=[];for(let e=0;e<a.length-1;e++)this.parts[e]=this._createPart()}_createPart(){return new A(this)}_getValue(){const e=this.strings,t=e.length-1,a=this.parts;if(1===t&&""===e[0]&&""===e[1]){const e=a[0].value;if("symbol"==typeof e)return String(e);if("string"==typeof e||!E(e))return e}let s="";for(let r=0;r<t;r++){s+=e[r];const t=a[r];if(void 0!==t){const e=t.value;if(C(e)||!E(e))s+="string"==typeof e?e:String(e);else for(const t of e)s+="string"==typeof t?t:String(t)}}return s+=e[t],s}commit(){this.dirty&&(this.dirty=!1,this.element.setAttribute(this.name,this._getValue()))}}class A{constructor(e){this.value=void 0,this.committer=e}setValue(e){e===y||C(e)&&e===this.value||(this.value=e,b(e)||(this.committer.dirty=!0))}commit(){for(;b(this.value);){const e=this.value;this.value=y,e(this)}this.value!==y&&this.committer.commit()}}class P{constructor(e){this.value=void 0,this.__pendingValue=void 0,this.options=e}appendInto(e){this.startNode=e.appendChild(p()),this.endNode=e.appendChild(p())}insertAfterNode(e){this.startNode=e,this.endNode=e.nextSibling}appendIntoPart(e){e.__insert(this.startNode=p()),e.__insert(this.endNode=p())}insertAfterPart(e){e.__insert(this.startNode=p()),this.endNode=e.endNode,e.endNode=this.startNode}setValue(e){this.__pendingValue=e}commit(){if(null===this.startNode.parentNode)return;for(;b(this.__pendingValue);){const e=this.__pendingValue;this.__pendingValue=y,e(this)}const e=this.__pendingValue;e!==y&&(C(e)?e!==this.value&&this.__commitText(e):e instanceof k?this.__commitTemplateResult(e):e instanceof Node?this.__commitNode(e):E(e)?this.__commitIterable(e):e===_?(this.value=_,this.clear()):this.__commitText(e))}__insert(e){this.endNode.parentNode.insertBefore(e,this.endNode)}__commitNode(e){this.value!==e&&(this.clear(),this.__insert(e),this.value=e)}__commitText(e){const t=this.startNode.nextSibling,a="string"==typeof(e=null==e?"":e)?e:String(e);t===this.endNode.previousSibling&&3===t.nodeType?t.data=a:this.__commitNode(document.createTextNode(a)),this.value=e}__commitTemplateResult(e){const t=this.options.templateFactory(e);if(this.value instanceof w&&this.value.template===t)this.value.update(e.values);else{const a=new w(t,e.processor,this.options),s=a._clone();a.update(e.values),this.__commitNode(s),this.value=a}}__commitIterable(e){Array.isArray(this.value)||(this.value=[],this.clear());const t=this.value;let a,s=0;for(const r of e)a=t[s],void 0===a&&(a=new P(this.options),t.push(a),0===s?a.appendIntoPart(this):a.insertAfterPart(t[s-1])),a.setValue(r),a.commit(),s++;s<t.length&&(t.length=s,this.clear(a&&a.endNode))}clear(e=this.startNode){r(this.startNode.parentNode,e.nextSibling,this.endNode)}}class ${constructor(e,t,a){if(this.value=void 0,this.__pendingValue=void 0,2!==a.length||""!==a[0]||""!==a[1])throw new Error("Boolean attributes can only contain a single expression");this.element=e,this.name=t,this.strings=a}setValue(e){this.__pendingValue=e}commit(){for(;b(this.__pendingValue);){const e=this.__pendingValue;this.__pendingValue=y,e(this)}if(this.__pendingValue===y)return;const e=!!this.__pendingValue;this.value!==e&&(e?this.element.setAttribute(this.name,""):this.element.removeAttribute(this.name),this.value=e),this.__pendingValue=y}}class D extends z{constructor(e,t,a){super(e,t,a),this.single=2===a.length&&""===a[0]&&""===a[1]}_createPart(){return new q(this)}_getValue(){return this.single?this.parts[0].value:super._getValue()}commit(){this.dirty&&(this.dirty=!1,this.element[this.name]=this._getValue())}}class q extends A{}let N=!1;(()=>{try{const e={get capture(){return N=!0,!1}};window.addEventListener("test",e,e),window.removeEventListener("test",e,e)}catch(e){}})();class O{constructor(e,t,a){this.value=void 0,this.__pendingValue=void 0,this.element=e,this.eventName=t,this.eventContext=a,this.__boundHandleEvent=e=>this.handleEvent(e)}setValue(e){this.__pendingValue=e}commit(){for(;b(this.__pendingValue);){const e=this.__pendingValue;this.__pendingValue=y,e(this)}if(this.__pendingValue===y)return;const e=this.__pendingValue,t=this.value,a=null==e||null!=t&&(e.capture!==t.capture||e.once!==t.once||e.passive!==t.passive),s=null!=e&&(null==t||a);a&&this.element.removeEventListener(this.eventName,this.__boundHandleEvent,this.__options),s&&(this.__options=T(e),this.element.addEventListener(this.eventName,this.__boundHandleEvent,this.__options)),this.value=e,this.__pendingValue=y}handleEvent(e){"function"==typeof this.value?this.value.call(this.eventContext||this.element,e):this.value.handleEvent(e)}}const T=e=>e&&(N?{capture:e.capture,passive:e.passive,once:e.once}:e.capture);function j(e){let t=R.get(e.type);void 0===t&&(t={stringsArray:new WeakMap,keyString:new Map},R.set(e.type,t));let a=t.stringsArray.get(e.strings);if(void 0!==a)return a;const s=e.strings.join(i);return a=t.keyString.get(s),void 0===a&&(a=new l(e,e.getTemplateElement()),t.keyString.set(s,a)),t.stringsArray.set(e.strings,a),a}const R=new Map,H=new WeakMap,F=new class{handleAttributeExpressions(e,t,a,s){const r=t[0];return"."===r?new D(e,t.slice(1),a).parts:"@"===r?[new O(e,t.slice(1),s.eventContext)]:"?"===r?[new $(e,t.slice(1),a)]:new z(e,t,a).parts}handleTextExpression(e){return new P(e)}};"undefined"!=typeof window&&(window.litHtmlVersions||(window.litHtmlVersions=[])).push("1.4.1");const L=(e,...t)=>new k(e,t,"html",F),B=(e,t)=>`${e}--${t}`;let W=!0;void 0===window.ShadyCSS?W=!1:void 0===window.ShadyCSS.prepareTemplateDom&&(console.warn("Incompatible ShadyCSS version detected. Please update to at least @webcomponents/webcomponentsjs@2.0.2 and @webcomponents/shadycss@1.3.1."),W=!1);const V=e=>t=>{const a=B(t.type,e);let s=R.get(a);void 0===s&&(s={stringsArray:new WeakMap,keyString:new Map},R.set(a,s));let r=s.stringsArray.get(t.strings);if(void 0!==r)return r;const n=t.strings.join(i);if(r=s.keyString.get(n),void 0===r){const a=t.getTemplateElement();W&&window.ShadyCSS.prepareTemplateDom(a,e),r=new l(t,a),s.keyString.set(n,r)}return s.stringsArray.set(t.strings,r),r},U=["html","svg"],M=new Set;window.JSCompiler_renameProperty=(e,t)=>e;const I={toAttribute(e,t){switch(t){case Boolean:return e?"":null;case Object:case Array:return null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){switch(t){case Boolean:return null!==e;case Number:return null===e?null:Number(e);case Object:case Array:return JSON.parse(e)}return e}},J=(e,t)=>t!==e&&(t==t||e==e),G={attribute:!0,type:String,converter:I,reflect:!1,hasChanged:J},K="finalized";class Y extends HTMLElement{constructor(){super(),this.initialize()}static get observedAttributes(){this.finalize();const e=[];return this._classProperties.forEach((t,a)=>{const s=this._attributeNameForProperty(a,t);void 0!==s&&(this._attributeToPropertyMap.set(s,a),e.push(s))}),e}static _ensureClassProperties(){if(!this.hasOwnProperty(JSCompiler_renameProperty("_classProperties",this))){this._classProperties=new Map;const e=Object.getPrototypeOf(this)._classProperties;void 0!==e&&e.forEach((e,t)=>this._classProperties.set(t,e))}}static createProperty(e,t=G){if(this._ensureClassProperties(),this._classProperties.set(e,t),t.noAccessor||this.prototype.hasOwnProperty(e))return;const a="symbol"==typeof e?Symbol():`__${e}`,s=this.getPropertyDescriptor(e,a,t);void 0!==s&&Object.defineProperty(this.prototype,e,s)}static getPropertyDescriptor(e,t,a){return{get(){return this[t]},set(s){const r=this[e];this[t]=s,this.requestUpdateInternal(e,r,a)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this._classProperties&&this._classProperties.get(e)||G}static finalize(){const e=Object.getPrototypeOf(this);if(e.hasOwnProperty(K)||e.finalize(),this[K]=!0,this._ensureClassProperties(),this._attributeToPropertyMap=new Map,this.hasOwnProperty(JSCompiler_renameProperty("properties",this))){const e=this.properties,t=[...Object.getOwnPropertyNames(e),..."function"==typeof Object.getOwnPropertySymbols?Object.getOwnPropertySymbols(e):[]];for(const a of t)this.createProperty(a,e[a])}}static _attributeNameForProperty(e,t){const a=t.attribute;return!1===a?void 0:"string"==typeof a?a:"string"==typeof e?e.toLowerCase():void 0}static _valueHasChanged(e,t,a=J){return a(e,t)}static _propertyValueFromAttribute(e,t){const a=t.type,s=t.converter||I,r="function"==typeof s?s:s.fromAttribute;return r?r(e,a):e}static _propertyValueToAttribute(e,t){if(void 0===t.reflect)return;const a=t.type,s=t.converter;return(s&&s.toAttribute||I.toAttribute)(e,a)}initialize(){this._updateState=0,this._updatePromise=new Promise(e=>this._enableUpdatingResolver=e),this._changedProperties=new Map,this._saveInstanceProperties(),this.requestUpdateInternal()}_saveInstanceProperties(){this.constructor._classProperties.forEach((e,t)=>{if(this.hasOwnProperty(t)){const e=this[t];delete this[t],this._instanceProperties||(this._instanceProperties=new Map),this._instanceProperties.set(t,e)}})}_applyInstanceProperties(){this._instanceProperties.forEach((e,t)=>this[t]=e),this._instanceProperties=void 0}connectedCallback(){this.enableUpdating()}enableUpdating(){void 0!==this._enableUpdatingResolver&&(this._enableUpdatingResolver(),this._enableUpdatingResolver=void 0)}disconnectedCallback(){}attributeChangedCallback(e,t,a){t!==a&&this._attributeToProperty(e,a)}_propertyToAttribute(e,t,a=G){const s=this.constructor,r=s._attributeNameForProperty(e,a);if(void 0!==r){const e=s._propertyValueToAttribute(t,a);if(void 0===e)return;this._updateState=8|this._updateState,null==e?this.removeAttribute(r):this.setAttribute(r,e),this._updateState=-9&this._updateState}}_attributeToProperty(e,t){if(8&this._updateState)return;const a=this.constructor,s=a._attributeToPropertyMap.get(e);if(void 0!==s){const e=a.getPropertyOptions(s);this._updateState=16|this._updateState,this[s]=a._propertyValueFromAttribute(t,e),this._updateState=-17&this._updateState}}requestUpdateInternal(e,t,a){let s=!0;if(void 0!==e){const r=this.constructor;a=a||r.getPropertyOptions(e),r._valueHasChanged(this[e],t,a.hasChanged)?(this._changedProperties.has(e)||this._changedProperties.set(e,t),!0!==a.reflect||16&this._updateState||(void 0===this._reflectingProperties&&(this._reflectingProperties=new Map),this._reflectingProperties.set(e,a))):s=!1}!this._hasRequestedUpdate&&s&&(this._updatePromise=this._enqueueUpdate())}requestUpdate(e,t){return this.requestUpdateInternal(e,t),this.updateComplete}async _enqueueUpdate(){this._updateState=4|this._updateState;try{await this._updatePromise}catch(e){}const e=this.performUpdate();return null!=e&&await e,!this._hasRequestedUpdate}get _hasRequestedUpdate(){return 4&this._updateState}get hasUpdated(){return 1&this._updateState}performUpdate(){if(!this._hasRequestedUpdate)return;this._instanceProperties&&this._applyInstanceProperties();let e=!1;const t=this._changedProperties;try{e=this.shouldUpdate(t),e?this.update(t):this._markUpdated()}catch(t){throw e=!1,this._markUpdated(),t}e&&(1&this._updateState||(this._updateState=1|this._updateState,this.firstUpdated(t)),this.updated(t))}_markUpdated(){this._changedProperties=new Map,this._updateState=-5&this._updateState}get updateComplete(){return this._getUpdateComplete()}_getUpdateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._updatePromise}shouldUpdate(e){return!0}update(e){void 0!==this._reflectingProperties&&this._reflectingProperties.size>0&&(this._reflectingProperties.forEach((e,t)=>this._propertyToAttribute(t,this[t],e)),this._reflectingProperties=void 0),this._markUpdated()}updated(e){}firstUpdated(e){}}Y[K]=!0;const Q=Element.prototype;Q.msMatchesSelector||Q.webkitMatchesSelector;const X=window.ShadowRoot&&(void 0===window.ShadyCSS||window.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Z=Symbol();class ee{constructor(e,t){if(t!==Z)throw new Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e}get styleSheet(){return void 0===this._styleSheet&&(X?(this._styleSheet=new CSSStyleSheet,this._styleSheet.replaceSync(this.cssText)):this._styleSheet=null),this._styleSheet}toString(){return this.cssText}}const te=(e,...t)=>{const a=t.reduce((t,a,s)=>t+(e=>{if(e instanceof ee)return e.cssText;if("number"==typeof e)return e;throw new Error(`Value passed to 'css' function must be a 'css' function result: ${e}. Use 'unsafeCSS' to pass non-literal values, but\n            take care to ensure page security.`)})(a)+e[s+1],e[0]);return new ee(a,Z)};(window.litElementVersions||(window.litElementVersions=[])).push("2.5.1");const ae={};class se extends Y{static getStyles(){return this.styles}static _getUniqueStyles(){if(this.hasOwnProperty(JSCompiler_renameProperty("_styles",this)))return;const e=this.getStyles();if(Array.isArray(e)){const t=(e,a)=>e.reduceRight((e,a)=>Array.isArray(a)?t(a,e):(e.add(a),e),a),a=t(e,new Set),s=[];a.forEach(e=>s.unshift(e)),this._styles=s}else this._styles=void 0===e?[]:[e];this._styles=this._styles.map(e=>{if(e instanceof CSSStyleSheet&&!X){const t=Array.prototype.slice.call(e.cssRules).reduce((e,t)=>e+t.cssText,"");return new ee(String(t),Z)}return e})}initialize(){super.initialize(),this.constructor._getUniqueStyles(),this.renderRoot=this.createRenderRoot(),window.ShadowRoot&&this.renderRoot instanceof window.ShadowRoot&&this.adoptStyles()}createRenderRoot(){return this.attachShadow(this.constructor.shadowRootOptions)}adoptStyles(){const e=this.constructor._styles;0!==e.length&&(void 0===window.ShadyCSS||window.ShadyCSS.nativeShadow?X?this.renderRoot.adoptedStyleSheets=e.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet):this._needsShimAdoptedStyleSheets=!0:window.ShadyCSS.ScopingShim.prepareAdoptedCssText(e.map(e=>e.cssText),this.localName))}connectedCallback(){super.connectedCallback(),this.hasUpdated&&void 0!==window.ShadyCSS&&window.ShadyCSS.styleElement(this)}update(e){const t=this.render();super.update(e),t!==ae&&this.constructor.render(t,this.renderRoot,{scopeName:this.localName,eventContext:this}),this._needsShimAdoptedStyleSheets&&(this._needsShimAdoptedStyleSheets=!1,this.constructor._styles.forEach(e=>{const t=document.createElement("style");t.textContent=e.cssText,this.renderRoot.appendChild(t)}))}render(){return ae}}se.finalized=!0,se.render=(e,t,a)=>{if(!a||"object"!=typeof a||!a.scopeName)throw new Error("The `scopeName` option is required.");const s=a.scopeName,i=H.has(t),n=W&&11===t.nodeType&&!!t.host,o=n&&!M.has(s),c=o?document.createDocumentFragment():t;if(((e,t,a)=>{let s=H.get(t);void 0===s&&(r(t,t.firstChild),H.set(t,s=new P(Object.assign({templateFactory:j},a))),s.appendInto(t)),s.setValue(e),s.commit()})(e,c,Object.assign({templateFactory:V(s)},a)),o){const e=H.get(c);H.delete(c);((e,t,a)=>{M.add(e);const s=a?a.element:document.createElement("template"),r=t.querySelectorAll("style"),{length:i}=r;if(0===i)return void window.ShadyCSS.prepareTemplateStyles(s,e);const n=document.createElement("style");for(let e=0;e<i;e++){const t=r[e];t.parentNode.removeChild(t),n.textContent+=t.textContent}(e=>{U.forEach(t=>{const a=R.get(B(t,e));void 0!==a&&a.keyString.forEach(e=>{const{element:{content:t}}=e,a=new Set;Array.from(t.querySelectorAll("style")).forEach(e=>{a.add(e)}),m(e,a)})})})(e);const o=s.content;a?function(e,t,a=null){const{element:{content:s},parts:r}=e;if(null==a)return void s.appendChild(t);const i=document.createTreeWalker(s,133,null,!1);let n=v(r),o=0,c=-1;for(;i.nextNode();)for(c++,i.currentNode===a&&(o=f(t),a.parentNode.insertBefore(t,a));-1!==n&&r[n].index===c;){if(o>0){for(;-1!==n;)r[n].index+=o,n=v(r,n);return}n=v(r,n)}}(a,n,o.firstChild):o.insertBefore(n,o.firstChild),window.ShadyCSS.prepareTemplateStyles(s,e);const c=o.querySelector("style");if(window.ShadyCSS.nativeShadow&&null!==c)t.insertBefore(c.cloneNode(!0),t.firstChild);else if(a){o.insertBefore(n,o.firstChild);const e=new Set;e.add(n),m(a,e)}})(s,c,e.value instanceof w?e.value.template:void 0),r(t,t.firstChild),t.appendChild(c),H.set(t,e)}!i&&n&&window.ShadyCSS.styleElement(t.host)},se.shadowRootOptions={mode:"open"}},330(e){e.exports=JSON.parse('{"name":"lcars-dashboard","private":true,"version":"4.0.0","description":"LCARS Dashboard — Home Assistant Lovelace dashboard with Star Trek LCARS UI. Based on Dwains Dashboard by Dwain Scheeren.","scripts":{"build":"webpack --mode=production","watch":"webpack --watch --mode=development"},"keywords":["lcars","home-assistant","lovelace","dashboard","hacs"],"author":"htiel (based on Dwains Dashboard by Dwain Scheeren)","license":"MIT","devDependencies":{"autoprefixer":"^10.2.5","css-loader":"^5.1.3","html-webpack-plugin":"^5.3.1","postcss":"^8.2.8","postcss-cli":"^8.3.1","postcss-loader":"^5.2.0","style-loader":"^2.0.0","tailwindcss":"^2.0.3","webpack":"^5.26.0","webpack-cli":"^4.5.0","webpack-dev-server":"^5.2.3","webpack-merge":"^5.7.3"},"dependencies":{"@mdi/js":"^6.5.95","card-tools":"github:thomasloven/lovelace-card-tools","custom-card-helpers":"^1.8.0","js-cookie":"^3.0.1","lit-element":"^2.2.1","lit-html":"^1.1.2","sortablejs":"^1.14.0"}}')}},t={};function a(s){var r=t[s];if(void 0!==r)return r.exports;var i=t[s]={exports:{}};return e[s](i,i.exports,a),i.exports}a.d=(e,t)=>{for(var s in t)a.o(t,s)&&!a.o(e,s)&&Object.defineProperty(e,s,{enumerable:!0,get:t[s]})},a.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),(()=>{var e=a(845),t=a(622),s=a(851);const r=[customElements.whenDefined("hui-masonry-view"),customElements.whenDefined("hc-lovelace")];Promise.race(r).then(async()=>{await new Promise(e=>setTimeout(e,2e3));class a extends e.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object},_activePath:{type:String}}}constructor(){super(),this._activePath="home"}set hass(e){this._hass=e}setConfig(e){this._config=e}_handleNav(e){this._activePath=e,(0,s.oo)(`/lcars-dashboard/${e}`),this.requestUpdate()}static get styles(){return[t.B,e.AH`
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
      `}getCardSize(){return 3}}customElements.get("lcars-navigation-card")||customElements.define("lcars-navigation-card",a)})})(),(()=>{var e=a(845),t=a(622);class s extends e.WF{static get properties(){return{cards:{type:Array},_hass:{type:Object},_narrow:{type:Boolean}}}constructor(){super(),this.cards=[],this._narrow=window.innerWidth<768,this._resizeHandler=()=>{this._narrow=window.innerWidth<768}}connectedCallback(){super.connectedCallback(),window.addEventListener("resize",this._resizeHandler)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("resize",this._resizeHandler)}setConfig(e){this._config=e}set hass(e){this._hass=e,this.cards&&this.cards.forEach(t=>{t&&(t.hass=e)})}static get styles(){return[t.B,e.AH`
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
          gap: var(--lcars-gap);
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
          width: calc(var(--lcars-elbow-w) - var(--lcars-sidebar-w) + var(--lcars-sidebar-w) - 2rem);
          width: 2rem;
          height: calc(var(--lcars-elbow-h) - var(--lcars-bar-h));
          background: var(--lcars-bg);
          border-radius: 0 0 0 1.875rem;
        }

        /* ─── Header Bar ─── */
        .lcars-header {
          grid-column: 2;
          grid-row: 1;
          display: flex;
          align-items: flex-end;
          gap: var(--lcars-gap);
          padding-bottom: 0;
        }

        .lcars-header-bar {
          flex: 1;
          height: var(--lcars-bar-h);
          background: var(--lcars-header-bar);
        }

        .lcars-header-endcap {
          width: var(--lcars-endcap);
          height: var(--lcars-bar-h);
          background: var(--lcars-header-bar);
          border-radius: 0 var(--lcars-endcap) var(--lcars-endcap) 0;
        }

        .lcars-header-title {
          font-size: var(--lcars-font-size-title);
          color: var(--lcars-text-heading);
          white-space: nowrap;
          padding: 0 1rem;
          align-self: center;
        }

        /* ─── Sidebar ─── */
        .lcars-sidebar {
          grid-column: 1;
          grid-row: 2;
          display: flex;
          flex-direction: column;
          gap: var(--lcars-gap);
          padding-top: var(--lcars-gap);
          overflow-y: auto;
          overflow-x: hidden;
        }

        .lcars-sidebar-panel {
          background: var(--lcars-sidebar-bg);
          padding: 0.5rem 0.75rem;
          min-height: 2rem;
          font-size: var(--lcars-font-size-data);
          color: var(--lcars-black);
          text-transform: uppercase;
        }

        .lcars-sidebar-panel.accent {
          background: var(--lcars-sidebar-accent);
        }

        .lcars-sidebar-buttons {
          display: flex;
          flex-direction: column;
          gap: var(--lcars-gap);
          padding: 0;
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
          width: 2rem;
          height: calc(var(--lcars-elbow-h) - var(--lcars-bar-h));
          background: var(--lcars-bg);
          border-radius: 1.875rem 0 0 0;
        }

        /* ─── Footer Bar ─── */
        .lcars-footer {
          grid-column: 2;
          grid-row: 3;
          display: flex;
          align-items: flex-start;
          gap: var(--lcars-gap);
        }

        .lcars-footer-bar {
          flex: 1;
          height: var(--lcars-bar-h);
          background: var(--lcars-footer-bar);
        }

        .lcars-footer-endcap {
          width: var(--lcars-endcap);
          height: var(--lcars-bar-h);
          background: var(--lcars-footer-bar);
          border-radius: 0 var(--lcars-endcap) var(--lcars-endcap) 0;
        }

        .lcars-footer-text {
          font-size: var(--lcars-font-size-data);
          color: var(--lcars-gray);
          padding: 0 0.5rem;
          white-space: nowrap;
          align-self: center;
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

          .lcars-sidebar-panel {
            display: none;
          }

          .lcars-sidebar-buttons {
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
      `]}render(){return e.qy`
      <div class="lcars-frame" role="main">
        <!-- Top-Left Elbow -->
        <div class="lcars-elbow-top" aria-hidden="true"></div>

        <!-- Header Bar -->
        <div class="lcars-header" role="banner">
          <span class="lcars-header-title">LCARS</span>
          <div class="lcars-header-bar"></div>
          <div class="lcars-header-endcap"></div>
        </div>

        <!-- Sidebar -->
        <nav class="lcars-sidebar" role="navigation" aria-label="Dashboard navigation">
          <div class="lcars-sidebar-panel">System</div>
          <div class="lcars-sidebar-panel accent">Status</div>
          <div class="lcars-sidebar-buttons">
            <slot name="sidebar"></slot>
          </div>
        </nav>

        <!-- Main Content -->
        <div class="lcars-content" role="region" aria-label="Dashboard content">
          ${this.cards&&this.cards.length>0?this.cards.map(t=>e.qy`${t}`):e.qy`<div class="lcars-heading">No data available</div>`}
        </div>

        <!-- Bottom-Left Elbow -->
        <div class="lcars-elbow-bottom" aria-hidden="true"></div>

        <!-- Footer Bar -->
        <div class="lcars-footer" role="contentinfo">
          <div class="lcars-footer-bar"></div>
          <span class="lcars-footer-text">LCARS 47</span>
          <div class="lcars-footer-endcap"></div>
        </div>
      </div>
    `}}customElements.whenDefined("hui-masonry-view").then(()=>{if(!customElements.get("lcars-dashboard-layout")){customElements.define("lcars-dashboard-layout",s);const e=a(330);console.info(`%c LCARS-DASHBOARD \n%c Version ${e.version}`,"color: #ff9966; font-weight: bold; background: black","color: #f5f6fa; font-weight: bold; background: #333")}})})(),(()=>{var e=a(845),t=a(622),s=a(851);const r=[customElements.whenDefined("hui-masonry-view"),customElements.whenDefined("hc-lovelace")];Promise.race(r).then(async()=>{await new Promise(e=>setTimeout(e,2e3)),await window.loadCardHelpers();class a extends e.WF{static get properties(){return{data:{type:Object},favorites:{type:Object},selectedArea:{type:String},_hass:{type:Object},_cards:{type:Object}}}constructor(){super(),this.data=null,this.favorites={},this.selectedArea=null,this._cards={}}set hass(e){this._hass=e,this._cards&&Object.values(this._cards).forEach(t=>{t&&void 0!==t.hass&&(t.hass=e)}),this.data||this._loadConfiguration()}async _loadConfiguration(){if(this._hass)try{const e=await this._hass.callWS({type:"lcars_dashboard/configuration/get"});this.data=e}catch(e){console.error("LCARS: Failed to load configuration",e)}}_selectArea(e){this.selectedArea===e?this.selectedArea=null:this.selectedArea=e}_handleEntityClick(e){(0,s.Hv)(e)}_getAreaEntities(e){return this._hass&&this.data?Object.values(this._hass.entities||{}).filter(t=>t.area_id===e&&!t.hidden_by&&!t.disabled_by):[]}_getEntityState(e){return this._hass&&this._hass.states[e]?this._hass.states[e]:null}_getEntityIcon(e){return e?e.attributes&&e.attributes.icon?e.attributes.icon:{light:"mdi:lightbulb",switch:"mdi:toggle-switch",sensor:"mdi:eye",binary_sensor:"mdi:radiobox-blank",climate:"mdi:thermostat",cover:"mdi:window-shutter",fan:"mdi:fan",lock:"mdi:lock",camera:"mdi:video",media_player:"mdi:cast",automation:"mdi:robot",script:"mdi:script-text"}[e.entity_id.split(".")[0]]||"mdi:information-outline":"mdi:help-circle-outline"}static get styles(){return[t.B,e.AH`
          :host {
            display: block;
          }

          /* ─── Areas Grid ─── */
          .areas-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
            gap: var(--lcars-gap);
          }

          /* ─── Area Panel (LCARS bracket-style) ─── */
          .area-panel {
            background: transparent;
            border: none;
            cursor: pointer;
            padding: 0;
            text-align: left;
            width: 100%;
          }

          .area-btn {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            height: var(--lcars-btn-height);
            padding: 0 1rem 0 0.75rem;
            background: var(--lcars-butterscotch);
            color: var(--lcars-black);
            border: none;
            border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
            cursor: pointer;
            transition: filter var(--lcars-transition), background var(--lcars-transition);
            width: 100%;
            white-space: nowrap;
            overflow: hidden;
            user-select: none;
          }

          .area-btn:hover {
            filter: brightness(1.2);
          }

          .area-btn[data-active] {
            background: var(--lcars-btn-active);
          }

          .area-btn ha-icon {
            --mdc-icon-size: 20px;
            flex-shrink: 0;
          }

          .area-name {
            overflow: hidden;
            text-overflow: ellipsis;
            flex: 1;
          }

          .area-count {
            font-size: 0.75rem;
            opacity: 0.7;
            flex-shrink: 0;
          }

          /* ─── Expanded Area Content ─── */
          .area-expanded {
            grid-column: 1 / -1;
            overflow: hidden;
            max-height: 0;
            opacity: 0;
            transition: max-height var(--lcars-transition-slow),
                        opacity var(--lcars-transition);
          }

          .area-expanded[data-open] {
            max-height: 2000px;
            opacity: 1;
            padding: 0.5rem 0;
          }

          /* ─── Entity List within Area ─── */
          .entity-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
            gap: var(--lcars-gap);
            padding: 0.5rem 0;
          }

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

          .entity-btn:hover {
            filter: brightness(1.2);
          }

          .entity-btn:active {
            background: var(--lcars-btn-active);
          }

          .entity-btn ha-icon {
            --mdc-icon-size: 16px;
            flex-shrink: 0;
          }

          .entity-btn .entity-name {
            overflow: hidden;
            text-overflow: ellipsis;
            flex: 1;
          }

          .entity-btn .entity-state {
            font-size: 0.75rem;
            color: var(--lcars-black);
            opacity: 0.7;
            flex-shrink: 0;
          }

          .entity-btn[data-off] {
            background: var(--lcars-gray);
            color: var(--lcars-space-white);
          }

          .entity-btn[data-off] .entity-state {
            color: var(--lcars-space-white);
          }

          /* ─── Section Divider ─── */
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

          /* ─── No data state ─── */
          .lcars-empty {
            color: var(--lcars-gray);
            font-size: var(--lcars-font-size-sub);
            padding: 2rem 0;
            text-align: center;
          }

          @media (prefers-reduced-motion: reduce) {
            .area-expanded {
              transition: none;
            }
          }
        `]}render(){if(!this._hass)return e.qy`<div class="lcars-empty">Initializing...</div>`;const t=this._hass.areas?Object.values(this._hass.areas):[];return 0===t.length?e.qy`<div class="lcars-empty">No areas configured</div>`:e.qy`
        <div class="lcars-divider">
          <span class="lcars-divider-label">Areas</span>
          <div class="lcars-divider-line"></div>
        </div>

        <div class="areas-grid">
          ${t.map(e=>this._renderArea(e))}
        </div>
      `}_renderArea(t){const a=this.selectedArea===t.area_id,s=this._getAreaEntities(t.area_id);return e.qy`
        <div class="area-panel">
          <button
            class="area-btn"
            ?data-active=${a}
            aria-expanded=${a}
            aria-controls="area-${t.area_id}"
            @click=${()=>this._selectArea(t.area_id)}
          >
            <ha-icon .icon=${t.icon||"mdi:home-outline"}></ha-icon>
            <span class="area-name">${t.name}</span>
            <span class="area-count">${s.length}</span>
          </button>
        </div>

        <div
          class="area-expanded"
          id="area-${t.area_id}"
          ?data-open=${a}
          role="region"
          aria-label="${t.name} entities"
        >
          ${a?this._renderAreaEntities(s):""}
        </div>
      `}_renderAreaEntities(t){return 0===t.length?e.qy`<div class="lcars-empty">No entities in this area</div>`:e.qy`
        <div class="entity-grid">
          ${t.map(t=>{const a=this._getEntityState(t.entity_id);if(!a)return"";const s="off"===a.state||"unavailable"===a.state||"unknown"===a.state,r=a.attributes?.friendly_name||t.entity_id.split(".").pop().replace(/_/g," "),i="unavailable"===a.state?"N/A":a.state;return e.qy`
              <button
                class="entity-btn"
                ?data-off=${s}
                @click=${()=>this._handleEntityClick(t.entity_id)}
                title="${r}: ${i}"
              >
                <ha-icon .icon=${this._getEntityIcon(a)}></ha-icon>
                <span class="entity-name">${r}</span>
                <span class="entity-state">${i}</span>
              </button>
            `})}
        </div>
      `}getCardSize(){return 6}}customElements.get("homepage-card")||customElements.define("homepage-card",a)})})(),(()=>{var e=a(845),t=a(622),s=a(851);const r=[customElements.whenDefined("hui-masonry-view"),customElements.whenDefined("hc-lovelace")];Promise.race(r).then(async()=>{await new Promise(e=>setTimeout(e,2e3));class a extends e.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object},_pages:{type:Array}}}constructor(){super(),this._pages=[]}set hass(e){this._hass=e,0===this._pages.length&&this._loadPages()}setConfig(e){this._config=e}async _loadPages(){if(this._hass)try{const e=await this._hass.callWS({type:"lcars_dashboard/configuration/get"});e&&e.more_pages&&(this._pages=Object.entries(e.more_pages).map(([e,t])=>({id:e,...t})))}catch(e){console.warn("LCARS: Could not load more-pages",e)}}_openPage(e){(0,s.oo)(`/lcars-dashboard/more/${e}`)}static get styles(){return[t.B,e.AH`
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
      `}getCardSize(){return 4}}customElements.get("lcars-more-pages-card")||customElements.define("lcars-more-pages-card",a)})})(),(()=>{var e=a(845),t=a(622);const s=[customElements.whenDefined("hui-masonry-view"),customElements.whenDefined("hc-lovelace")];Promise.race(s).then(async()=>{await new Promise(e=>setTimeout(e,2e3));const a=await window.loadCardHelpers();class s extends e.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object},_cards:{type:Array}}}constructor(){super(),this._cards=[]}set hass(e){this._hass=e,this._cards.forEach(t=>{t&&(t.hass=e)})}setConfig(e){this._config=e,this._createCards()}async _createCards(){this._config&&this._config.cards&&(this._cards=await Promise.all(this._config.cards.map(async e=>{try{const t=await a.createCardElement(e);return this._hass&&(t.hass=this._hass),t}catch(t){return console.error("LCARS: Failed to create card",e,t),null}})),this._cards=this._cards.filter(Boolean),this.requestUpdate())}static get styles(){return[t.B,e.AH`
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
      `}getCardSize(){return this._cards.length||1}}customElements.get("lcars-more-page-card")||customElements.define("lcars-more-page-card",s)})})(),(()=>{var e=a(845),t=a(622),s=a(851);const r=[customElements.whenDefined("hui-masonry-view"),customElements.whenDefined("hc-lovelace")];Promise.race(r).then(async()=>{await new Promise(e=>setTimeout(e,2e3));class a extends e.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object}}}set hass(e){this._hass=e}setConfig(e){this._config=e}async _save(e){if(this._hass)try{await this._hass.callWS({type:"lcars_dashboard/more_page/set",...e}),(0,s.rC)("lcars_dashboard_reload")}catch(e){console.error("LCARS Edit: Failed to save more-page",e)}}static get styles(){return[t.B,e.AH`
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
      `}getCardSize(){return 3}}customElements.get("lcars-edit-more-page-card")||customElements.define("lcars-edit-more-page-card",a)})})(),(()=>{var e=a(845),t=a(622);const s=[customElements.whenDefined("hui-masonry-view"),customElements.whenDefined("hc-lovelace")];Promise.race(s).then(async()=>{await new Promise(e=>setTimeout(e,2e3));class a extends e.WF{static get properties(){return{_hass:{type:Object},_notifications:{type:Array}}}constructor(){super(),this._notifications=[]}set hass(e){this._hass=e,this._loadNotifications()}setConfig(e){this._config=e}async _loadNotifications(){if(this._hass)try{const e=await this._hass.callWS({type:"lcars_dashboard/notification/get"});Array.isArray(e)&&(this._notifications=e)}catch(e){}}_dismissNotification(e){this._hass&&this._hass.callWS({type:"lcars_dashboard/notification/dismiss",notification_id:e}).then(()=>{this._notifications=this._notifications.filter(t=>t.id!==e)}).catch(()=>{})}static get styles(){return[t.B,e.AH`
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
      `}getCardSize(){return this._notifications.length||0}}customElements.get("lcars-notification-card")||customElements.define("lcars-notification-card",a)})})(),(()=>{var e=a(845),t=a(622),s=a(851);const r=[customElements.whenDefined("hui-masonry-view"),customElements.whenDefined("hc-lovelace")];Promise.race(r).then(async()=>{await new Promise(e=>setTimeout(e,2e3));class a extends e.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object},_expanded:{type:Boolean}}}constructor(){super(),this._expanded=!1}set hass(e){this._hass=e}setConfig(e){this._config=e}_toggle(){this._expanded=!this._expanded}_getWeatherEntity(){if(!this._hass)return null;const e=Object.keys(this._hass.states).filter(e=>e.startsWith("weather."));return e.length>0?this._hass.states[e[0]]:null}_getPersonEntities(){return this._hass?Object.keys(this._hass.states).filter(e=>e.startsWith("person.")).map(e=>this._hass.states[e]):[]}static get styles(){return[t.B,e.AH`
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
                    @click=${()=>(0,s.Hv)(t.entity_id)}
                  >
                    <div class="info-tile-label">Weather</div>
                    <div class="info-tile-value">
                      ${t.state} ${t.attributes.temperature||""}°
                    </div>
                  </button>
                  <button
                    class="info-tile"
                    @click=${()=>(0,s.Hv)(t.entity_id)}
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
                  @click=${()=>(0,s.Hv)(t.entity_id)}
                >
                  <div class="info-tile-label">
                    ${t.attributes?.friendly_name||t.entity_id.split(".").pop()}
                  </div>
                  <div class="info-tile-value">${t.state}</div>
                </button>
              `)}
          </div>
        </div>
      `}getCardSize(){return this._expanded?4:1}}customElements.get("lcars-house-information-card")||customElements.define("lcars-house-information-card",a)})})(),(()=>{var e=a(845),t=a(622),s=a(851);const r=[customElements.whenDefined("hui-masonry-view"),customElements.whenDefined("hc-lovelace")];Promise.race(r).then(async()=>{await new Promise(e=>setTimeout(e,2e3));class a extends e.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object}}}set hass(e){this._hass=e}setConfig(e){this._config=e}static get styles(){return[t.B,e.AH`
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
                @click=${()=>(0,s.Hv)(t.entity_id)}
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
      `}getCardSize(){return 4}}customElements.get("lcars-house-information-more-info-card")||customElements.define("lcars-house-information-more-info-card",a)})})(),(()=>{var e=a(845),t=a(622);const s=[customElements.whenDefined("hui-masonry-view"),customElements.whenDefined("hc-lovelace")];Promise.race(s).then(async()=>{await new Promise(e=>setTimeout(e,2e3));const a=await window.loadCardHelpers();class s extends e.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object},_card:{type:Object}}}constructor(){super(),this._card=null}set hass(e){this._hass=e,this._card&&(this._card.hass=e)}setConfig(e){this._config=e,e.card&&this._createCard(e.card)}async _createCard(e){try{this._card=await a.createCardElement(e),this._hass&&(this._card.hass=this._hass),this.requestUpdate()}catch(e){console.error("LCARS Blueprint: Failed to create card",e)}}static get styles(){return[t.B,e.AH`
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
      `}getCardSize(){return this._card?2:1}}customElements.get("lcars-blueprint-card")||customElements.define("lcars-blueprint-card",s)})})(),(()=>{var e=a(845),t=a(622),s=a(851);const r=[customElements.whenDefined("hui-masonry-view"),customElements.whenDefined("hc-lovelace")];Promise.race(r).then(async()=>{await new Promise(e=>setTimeout(e,2e3));class a extends e.WF{static get properties(){return{_hass:{type:Object},_selectedDomain:{type:String}}}constructor(){super(),this._selectedDomain=null}set hass(e){this._hass=e}setConfig(e){this._config=e}_getDomainGroups(){if(!this._hass||!this._hass.states)return{};const e={};Object.keys(this._hass.states).forEach(t=>{const a=t.split(".")[0];e[a]||(e[a]=[]),e[a].push(t)});const t={};return Object.keys(e).sort().forEach(a=>{t[a]=e[a]}),t}_getDomainIcon(e){return{light:"mdi:lightbulb-group",switch:"mdi:toggle-switch-outline",sensor:"mdi:eye",binary_sensor:"mdi:radiobox-blank",climate:"mdi:thermostat",cover:"mdi:window-shutter",fan:"mdi:fan",lock:"mdi:lock",camera:"mdi:video",media_player:"mdi:cast",automation:"mdi:robot",script:"mdi:script-text",person:"mdi:account",input_boolean:"mdi:toggle-switch",input_number:"mdi:ray-vertex",input_select:"mdi:format-list-bulleted",input_text:"mdi:form-textbox",scene:"mdi:palette",group:"mdi:google-circles-communities",timer:"mdi:timer-outline",counter:"mdi:counter",weather:"mdi:weather-partly-cloudy",vacuum:"mdi:robot-vacuum",water_heater:"mdi:water-boiler"}[e]||"mdi:devices"}_toggleDomain(e){this._selectedDomain=this._selectedDomain===e?null:e}_handleEntityClick(e){(0,s.Hv)(e)}static get styles(){return[t.B,e.AH`
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
                      ${t[a].map(t=>{const s=this._hass.states[t];if(!s)return"";const r="off"===s.state||"unavailable"===s.state||"unknown"===s.state,i=s.attributes?.friendly_name||t.split(".").pop().replace(/_/g," ");return e.qy`
                          <button
                            class="entity-item"
                            ?data-off=${r}
                            @click=${()=>this._handleEntityClick(t)}
                            title="${i}: ${s.state}"
                          >
                            <ha-icon .icon=${s.attributes?.icon||this._getDomainIcon(a)}></ha-icon>
                            <span class="entity-item-name">${i}</span>
                            <span class="entity-item-state">${s.state}</span>
                          </button>
                        `})}
                    </div>
                  `:""}
            </div>
          `)}
        </div>
      `}getCardSize(){return 8}}customElements.get("devices-card")||customElements.define("devices-card",a)})})(),(()=>{var e=a(845),t=a(622);const s=[customElements.whenDefined("hui-masonry-view"),customElements.whenDefined("hc-lovelace")];Promise.race(s).then(async()=>{await new Promise(e=>setTimeout(e,2e3));const a=await window.loadCardHelpers();class s extends e.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object},_cards:{type:Array}}}constructor(){super(),this._cards=[]}set hass(e){this._hass=e,this._cards.forEach(t=>{t&&(t.hass=e)})}setConfig(e){this._config=e,this._createCards()}async _createCards(){this._config&&this._config.cards&&(this._cards=await Promise.all(this._config.cards.map(async e=>{try{const t=await a.createCardElement(e);return this._hass&&(t.hass=this._hass),t}catch(t){return console.error("LCARS Flexbox: Failed to create card",e,t),null}})),this._cards=this._cards.filter(Boolean),this.requestUpdate())}static get styles(){return[t.B,e.AH`
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
      `}getCardSize(){return 1}}customElements.get("lcars-flexbox-card")||customElements.define("lcars-flexbox-card",s)})})(),(()=>{var e=a(845),t=a(622);const s=[customElements.whenDefined("hui-masonry-view"),customElements.whenDefined("hc-lovelace")];Promise.race(s).then(async()=>{await new Promise(e=>setTimeout(e,2e3));class a extends e.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object}}}set hass(e){this._hass=e}setConfig(e){if(!e.heading)throw new Error("Please define heading");this._config=e}static get styles(){return[t.B,e.AH`
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
      `}getCardSize(){return 1}}customElements.get("lcars-heading-card")||customElements.define("lcars-heading-card",a)})})(),(()=>{var e=a(845),t=a(622);const s=[customElements.whenDefined("hui-masonry-view"),customElements.whenDefined("hc-lovelace")];Promise.race(s).then(async()=>{await new Promise(e=>setTimeout(e,2e3));class a extends e.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object}}}set hass(e){this._hass=e}setConfig(e){this._config=e}static get styles(){return[t.B,e.AH`
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
      `}getCardSize(){return 1}}customElements.get("lcars-create-custom-card-card")||customElements.define("lcars-create-custom-card-card",a)})})(),(()=>{var e=a(845),t=a(622),s=a(851);const r=e.AH`
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
`,i=[customElements.whenDefined("hui-masonry-view"),customElements.whenDefined("hc-lovelace")];Promise.race(i).then(async()=>{await new Promise(e=>setTimeout(e,2e3));class a extends e.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object}}}set hass(e){this._hass=e}setConfig(e){this._config=e}async _save(){if(this._hass)try{await this._hass.callWS({type:"lcars_dashboard/area_button/set",...this._getFormData()}),(0,s.rC)("lcars_dashboard_reload")}catch(e){console.error("LCARS Edit: Save failed",e)}}_getFormData(){const e=this.shadowRoot.querySelectorAll(".edit-input");return{name:e[0]?.value,icon:e[1]?.value}}static get styles(){return[t.B,r]}render(){return e.qy`
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
      `}getCardSize(){return 3}}customElements.get("lcars-edit-area-button-card")||customElements.define("lcars-edit-area-button-card",a)})})(),(()=>{var e=a(845),t=a(622),s=a(851);const r=e.AH`
  :host { display: block; }
  .edit-container { display: flex; flex-direction: column; gap: var(--lcars-gap); padding: 0.5rem 0; }
  .edit-field { display: flex; flex-direction: column; gap: 0.25rem; }
  .edit-label { font-family: var(--lcars-font); font-size: 0.625rem; color: var(--lcars-gray); text-transform: uppercase; }
  .edit-input { height: 2.5rem; padding: 0 0.75rem; background: var(--lcars-ice); color: var(--lcars-black); border: none; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; outline: none; }
  .edit-input:focus { box-shadow: 0 0 0 2px var(--lcars-btn-active); }
  .edit-actions { display: flex; gap: var(--lcars-gap); padding-top: 0.5rem; }
  .action-btn { flex: 1; height: var(--lcars-btn-height); background: var(--lcars-butterscotch); color: var(--lcars-black); border: none; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; cursor: pointer; transition: filter var(--lcars-transition); user-select: none; }
  .action-btn:hover { filter: brightness(1.2); }
`,i=[customElements.whenDefined("hui-masonry-view"),customElements.whenDefined("hc-lovelace")];Promise.race(i).then(async()=>{await new Promise(e=>setTimeout(e,2e3));class a extends e.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object}}}set hass(e){this._hass=e}setConfig(e){this._config=e}async _save(){if(this._hass)try{await this._hass.callWS({type:"lcars_dashboard/entity_card/set",...this._getFormData()}),(0,s.rC)("lcars_dashboard_reload")}catch(e){console.error("LCARS Edit: Save failed",e)}}_getFormData(){const e=this.shadowRoot.querySelectorAll(".edit-input");return{entity:e[0]?.value,name:e[1]?.value}}static get styles(){return[t.B,r]}render(){return e.qy`
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
      `}getCardSize(){return 3}}customElements.get("lcars-edit-entity-card-card")||customElements.define("lcars-edit-entity-card-card",a)})})(),(()=>{var e=a(845),t=a(622),s=a(851);const r=e.AH`
  :host { display: block; }
  .edit-container { display: flex; flex-direction: column; gap: var(--lcars-gap); padding: 0.5rem 0; }
  .edit-field { display: flex; flex-direction: column; gap: 0.25rem; }
  .edit-label { font-family: var(--lcars-font); font-size: 0.625rem; color: var(--lcars-gray); text-transform: uppercase; }
  .edit-input { height: 2.5rem; padding: 0 0.75rem; background: var(--lcars-ice); color: var(--lcars-black); border: none; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; outline: none; }
  .edit-input:focus { box-shadow: 0 0 0 2px var(--lcars-btn-active); }
  .edit-actions { display: flex; gap: var(--lcars-gap); padding-top: 0.5rem; }
  .action-btn { flex: 1; height: var(--lcars-btn-height); background: var(--lcars-butterscotch); color: var(--lcars-black); border: none; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; cursor: pointer; transition: filter var(--lcars-transition); user-select: none; }
  .action-btn:hover { filter: brightness(1.2); }
`,i=[customElements.whenDefined("hui-masonry-view"),customElements.whenDefined("hc-lovelace")];Promise.race(i).then(async()=>{await new Promise(e=>setTimeout(e,2e3));class a extends e.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object}}}set hass(e){this._hass=e}setConfig(e){this._config=e}async _save(){if(this._hass)try{await this._hass.callWS({type:"lcars_dashboard/entity/set",...this._getFormData()}),(0,s.rC)("lcars_dashboard_reload")}catch(e){console.error("LCARS Edit: Save failed",e)}}_getFormData(){const e=this.shadowRoot.querySelectorAll(".edit-input");return{entity:e[0]?.value,icon:e[1]?.value,name:e[2]?.value}}static get styles(){return[t.B,r]}render(){return e.qy`
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
      `}getCardSize(){return 4}}customElements.get("lcars-edit-entity-card")||customElements.define("lcars-edit-entity-card",a)})})(),(()=>{var e=a(845),t=a(622),s=a(851);const r=e.AH`
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
`,i=[customElements.whenDefined("hui-masonry-view"),customElements.whenDefined("hc-lovelace")];Promise.race(i).then(async()=>{await new Promise(e=>setTimeout(e,2e3));class a extends e.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object}}}set hass(e){this._hass=e}setConfig(e){this._config=e}async _save(){if(this._hass)try{await this._hass.callWS({type:"lcars_dashboard/entity_popup/set",...this._getFormData()}),(0,s.rC)("lcars_dashboard_reload")}catch(e){console.error("LCARS Edit: Save failed",e)}}_getFormData(){const e=this.shadowRoot.querySelector(".edit-input")?.value,t=this.shadowRoot.querySelector(".edit-textarea")?.value;return{entity:e,yaml_config:t}}static get styles(){return[t.B,r]}render(){return e.qy`
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
      `}getCardSize(){return 5}}customElements.get("lcars-edit-entity-popup-card")||customElements.define("lcars-edit-entity-popup-card",a)})})(),(()=>{var e=a(845),t=a(622),s=a(851);const r=e.AH`
  :host { display: block; }
  .edit-container { display: flex; flex-direction: column; gap: var(--lcars-gap); padding: 0.5rem 0; }
  .edit-field { display: flex; flex-direction: column; gap: 0.25rem; }
  .edit-label { font-family: var(--lcars-font); font-size: 0.625rem; color: var(--lcars-gray); text-transform: uppercase; }
  .edit-input { height: 2.5rem; padding: 0 0.75rem; background: var(--lcars-ice); color: var(--lcars-black); border: none; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; outline: none; }
  .edit-input:focus { box-shadow: 0 0 0 2px var(--lcars-btn-active); }
  .edit-actions { display: flex; gap: var(--lcars-gap); padding-top: 0.5rem; }
  .action-btn { flex: 1; height: var(--lcars-btn-height); background: var(--lcars-butterscotch); color: var(--lcars-black); border: none; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; cursor: pointer; transition: filter var(--lcars-transition); user-select: none; }
  .action-btn:hover { filter: brightness(1.2); }
`,i=[customElements.whenDefined("hui-masonry-view"),customElements.whenDefined("hc-lovelace")];Promise.race(i).then(async()=>{await new Promise(e=>setTimeout(e,2e3));class a extends e.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object}}}set hass(e){this._hass=e}setConfig(e){this._config=e}async _save(){if(this._hass)try{await this._hass.callWS({type:"lcars_dashboard/homepage_header/set",...this._getFormData()}),(0,s.rC)("lcars_dashboard_reload")}catch(e){console.error("LCARS Edit: Save failed",e)}}_getFormData(){const e=this.shadowRoot.querySelectorAll(".edit-input");return{title:e[0]?.value,subtitle:e[1]?.value}}static get styles(){return[t.B,r]}render(){return e.qy`
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
      `}getCardSize(){return 3}}customElements.get("lcars-edit-homepage-header-card")||customElements.define("lcars-edit-homepage-header-card",a)})})(),(()=>{var e=a(845),t=a(622),s=a(851);const r=e.AH`
  :host { display: block; }
  .edit-container { display: flex; flex-direction: column; gap: var(--lcars-gap); padding: 0.5rem 0; }
  .edit-field { display: flex; flex-direction: column; gap: 0.25rem; }
  .edit-label { font-family: var(--lcars-font); font-size: 0.625rem; color: var(--lcars-gray); text-transform: uppercase; }
  .edit-input { height: 2.5rem; padding: 0 0.75rem; background: var(--lcars-ice); color: var(--lcars-black); border: none; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; outline: none; }
  .edit-input:focus { box-shadow: 0 0 0 2px var(--lcars-btn-active); }
  .edit-actions { display: flex; gap: var(--lcars-gap); padding-top: 0.5rem; }
  .action-btn { flex: 1; height: var(--lcars-btn-height); background: var(--lcars-butterscotch); color: var(--lcars-black); border: none; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; cursor: pointer; transition: filter var(--lcars-transition); user-select: none; }
  .action-btn:hover { filter: brightness(1.2); }
`,i=[customElements.whenDefined("hui-masonry-view"),customElements.whenDefined("hc-lovelace")];Promise.race(i).then(async()=>{await new Promise(e=>setTimeout(e,2e3));class a extends e.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object}}}set hass(e){this._hass=e}setConfig(e){this._config=e}async _save(){if(this._hass)try{await this._hass.callWS({type:"lcars_dashboard/device_card/set",...this._getFormData()}),(0,s.rC)("lcars_dashboard_reload")}catch(e){console.error("LCARS Edit: Save failed",e)}}_getFormData(){const e=this.shadowRoot.querySelectorAll(".edit-input");return{device:e[0]?.value,name:e[1]?.value}}static get styles(){return[t.B,r]}render(){return e.qy`
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
      `}getCardSize(){return 3}}customElements.get("lcars-edit-device-card-card")||customElements.define("lcars-edit-device-card-card",a)})})(),(()=>{var e=a(845),t=a(622),s=a(851);const r=e.AH`
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
`,i=[customElements.whenDefined("hui-masonry-view"),customElements.whenDefined("hc-lovelace")];Promise.race(i).then(async()=>{await new Promise(e=>setTimeout(e,2e3));class a extends e.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object}}}set hass(e){this._hass=e}setConfig(e){this._config=e}async _save(){if(this._hass)try{await this._hass.callWS({type:"lcars_dashboard/device_popup/set",...this._getFormData()}),(0,s.rC)("lcars_dashboard_reload")}catch(e){console.error("LCARS Edit: Save failed",e)}}_getFormData(){const e=this.shadowRoot.querySelector(".edit-input")?.value,t=this.shadowRoot.querySelector(".edit-textarea")?.value;return{device:e,yaml_config:t}}static get styles(){return[t.B,r]}render(){return e.qy`
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
      `}getCardSize(){return 5}}customElements.get("lcars-edit-device-popup-card")||customElements.define("lcars-edit-device-popup-card",a)})})(),(()=>{var e=a(845),t=a(622),s=a(851);const r=e.AH`
  :host { display: block; }
  .edit-container { display: flex; flex-direction: column; gap: var(--lcars-gap); padding: 0.5rem 0; }
  .edit-field { display: flex; flex-direction: column; gap: 0.25rem; }
  .edit-label { font-family: var(--lcars-font); font-size: 0.625rem; color: var(--lcars-gray); text-transform: uppercase; }
  .edit-input { height: 2.5rem; padding: 0 0.75rem; background: var(--lcars-ice); color: var(--lcars-black); border: none; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; outline: none; }
  .edit-input:focus { box-shadow: 0 0 0 2px var(--lcars-btn-active); }
  .edit-actions { display: flex; gap: var(--lcars-gap); padding-top: 0.5rem; }
  .action-btn { flex: 1; height: var(--lcars-btn-height); background: var(--lcars-butterscotch); color: var(--lcars-black); border: none; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; cursor: pointer; transition: filter var(--lcars-transition); user-select: none; }
  .action-btn:hover { filter: brightness(1.2); }
`,i=[customElements.whenDefined("hui-masonry-view"),customElements.whenDefined("hc-lovelace")];Promise.race(i).then(async()=>{await new Promise(e=>setTimeout(e,2e3));class a extends e.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object}}}set hass(e){this._hass=e}setConfig(e){this._config=e}async _save(){if(this._hass)try{await this._hass.callWS({type:"lcars_dashboard/device_button/set",...this._getFormData()}),(0,s.rC)("lcars_dashboard_reload")}catch(e){console.error("LCARS Edit: Save failed",e)}}_getFormData(){const e=this.shadowRoot.querySelectorAll(".edit-input");return{device:e[0]?.value,name:e[1]?.value,icon:e[2]?.value}}static get styles(){return[t.B,r]}render(){return e.qy`
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
      `}getCardSize(){return 4}}customElements.get("lcars-edit-device-button-card")||customElements.define("lcars-edit-device-button-card",a)})})(),(()=>{var e=a(845),t=a(622);const s=[customElements.whenDefined("hui-masonry-view"),customElements.whenDefined("hc-lovelace")];Promise.race(s).then(async()=>{await new Promise(e=>setTimeout(e,2e3));const a=await window.loadCardHelpers();class s extends e.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object},_open:{type:Boolean},_card:{type:Object}}}constructor(){super(),this._open=!1,this._card=null}set hass(e){this._hass=e,this._card&&(this._card.hass=e)}setConfig(e){this._config=e,e.card&&this._createCard(e.card)}async _createCard(e){try{this._card=await a.createCardElement(e),this._hass&&(this._card.hass=this._hass),this.requestUpdate()}catch(e){console.error("LCARS Popup: Failed to create card",e)}}open(){this._open=!0}close(){this._open=!1}_handleBackdropClick(e){e.target===e.currentTarget&&this.close()}_handleKeydown(e){"Escape"===e.key&&this.close()}static get styles(){return[t.B,e.AH`
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
      `}getCardSize(){return 0}}customElements.get("lcars-popup")||customElements.define("lcars-popup",s)})})()})();
//# sourceMappingURL=lcars-dashboard.js.map