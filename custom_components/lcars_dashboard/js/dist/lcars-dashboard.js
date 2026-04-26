/*! For license information please see lcars-dashboard.js.LICENSE.txt */
(()=>{"use strict";var e={9761(e,t,a){var r=a(7349),i=a(1109);const s=r.AH`
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
`;class n extends r.WF{static get properties(){return{panelName:{type:String,attribute:"panel-name"},panelCode:{type:String,attribute:"panel-code"},frameColor:{type:String,attribute:"frame-color"},panelType:{type:String,attribute:"panel-type"}}}constructor(){super(),this.panelName="",this.panelCode="",this.frameColor="var(--lcars-butterscotch)",this.panelType=""}static get styles(){return[i.PF,i.yW,s]}render(){return r.qy`
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
          ${this.panelCode?r.qy`
            <span class="panel-code" aria-hidden="true">${this.panelCode}</span>
          `:""}
        </div>
        <div class="panel-content">
          <slot></slot>
        </div>
      </div>
    `}}customElements.get("lcars-panel-frame")||customElements.define("lcars-panel-frame",n)},5477(e,t,a){var r=a(7349);const i=r.AH`
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
`;class s extends r.WF{static get properties(){return{label:{type:String}}}constructor(){super(),this.label=""}static get styles(){return[i]}render(){return r.qy`
      <div class="divider-line"></div>
      ${this.label?r.qy`
        <div class="divider-label">${this.label}</div>
      `:""}
    `}}customElements.get("lcars-section-divider")||customElements.define("lcars-section-divider",s)},3790(e,t,a){var r=a(7349),i=a(8851);const s=r.AH`
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
    width: 0.625rem;
    height: 0.625rem;
    border-radius: 50%;
    flex-shrink: 0;
    /* GEORDI-030: Boost indicator visibility — add subtle ring for low-contrast dots */
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.15);
  }

  .sensor-label {
    flex: 1;
    color: var(--lcars-space-white);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.75rem;
    min-width: 3rem;
  }

  .sensor-value {
    flex-shrink: 0;
    font-weight: 700;
    font-size: var(--lcars-font-size-data);
  }
`;class n extends r.WF{static get properties(){return{label:{type:String},value:{type:String},color:{type:String},entityId:{type:String,attribute:"entity-id"}}}constructor(){super(),this.label="",this.value="",this.color="var(--lcars-space-white)",this.entityId=""}static get styles(){return[s]}_handleClick(){this.entityId&&(0,i.Hv)(this.entityId)}_handleKeydown(e){"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._handleClick())}render(){return r.qy`
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
    `}}customElements.get("lcars-sensor-row")||customElements.define("lcars-sensor-row",n)},58(e,t,a){var r=a(7349),i=a(2622);class s extends r.WF{static get properties(){return{label:{type:String},value:{type:String},total:{type:String},color:{type:String},icon:{type:String}}}constructor(){super(),this.label="",this.value="",this.total="",this.color="",this.icon=""}static get styles(){return[i.AM,r.AH`
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
      `]}render(){const e=this.color?`--badge-color:${this.color}`:"",t=this.total?`${this.value} of ${this.total} ${this.label}`:`${this.value} ${this.label}`;return r.qy`
      <span role="status"
            aria-label="${t}"
            style="${e}">
        ${this.icon?r.qy`<ha-icon icon="${this.icon}"></ha-icon>`:""}
        <span class="badge-value">${this.value}</span>
        ${this.total?r.qy`<span class="badge-separator">/</span><span class="badge-value">${this.total}</span>`:""}
        ${this.label?r.qy`<span class="badge-label">${this.label}</span>`:""}
      </span>
    `}}customElements.define("lcars-summary-badge",s)},6940(e,t,a){a.d(t,{e:()=>d});const r="lcars-audio-muted";let i=null;function s(e,t,a,r,i,s){const n=e.createOscillator(),o=e.createGain();n.type=t,n.frequency.setValueAtTime(a,r);const l=Math.min(.02,.3*i);return o.gain.setValueAtTime(0,r),o.gain.linearRampToValueAtTime(s,r+.005),o.gain.setValueAtTime(s,r+i-l),o.gain.linearRampToValueAtTime(0,r+i),n.connect(o),o.connect(e.destination),n.start(r),n.stop(r+i),n.onended=()=>{o.disconnect()},r+i}function n(e,t,a,r,i,s,n){const o=e.createOscillator(),l=e.createGain();o.type=t,o.frequency.setValueAtTime(a,i),o.frequency.linearRampToValueAtTime(r,i+s);const c=Math.min(.02,.3*s);return l.gain.setValueAtTime(0,i),l.gain.linearRampToValueAtTime(n,i+.005),l.gain.setValueAtTime(n,i+s-c),l.gain.linearRampToValueAtTime(0,i+s),o.connect(l),l.connect(e.destination),o.start(i),o.stop(i+s),o.onended=()=>{l.disconnect()},i+s}const o={acknowledge(e){s(e,"sine",880,e.currentTime,.06,.15)},navAcknowledge(e){const t=e.currentTime;s(e,"sine",440,t,.06,.12),s(e,"sine",660,t+.08,.06,.12)},negativeAcknowledge(e){const t=e.currentTime;s(e,"triangle",660,t,.08,.12),s(e,"triangle",330,t+.1,.1,.12)},alert(e){const t=e.currentTime;for(let a=0;a<3;a++)s(e,"sawtooth",880,t+.1*a,.06,.1)},criticalAlert(e){const t=e.currentTime;for(let a=0;a<6;a++)s(e,"square",a%2==0?440:880,t+.15*a,.15,.15)},ready(e){const t=e.currentTime;s(e,"sine",330,t,.08,.1),s(e,"sine",440,t+.11,.08,.1),s(e,"sine",660,t+.22,.12,.1)},toggle(e){n(e,"sine",550,770,e.currentTime,.08,.12)},lightToggle(e){n(e,"sine",600,800,e.currentTime,.1,.12)},switchToggle(e){s(e,"triangle",960,e.currentTime,.04,.14)},fanToggle(e){n(e,"sine",300,500,e.currentTime,.12,.1)},lockToggle(e){const t=e.currentTime;s(e,"square",440,t,.08,.1),s(e,"square",660,t+.1,.06,.1)},coverAction(e){n(e,"triangle",400,250,e.currentTime,.14,.1)},climateAdjust(e){s(e,"sine",550,e.currentTime,.05,.08)},scriptFire(e){const t=e.currentTime;s(e,"sine",770,t,.04,.12),s(e,"sine",990,t+.06,.04,.12)},entityInfo(e){s(e,"sine",330,e.currentTime,.06,.08)},mediaAction(e){n(e,"sine",440,550,e.currentTime,.08,.1)}},l=new Set(["alert","criticalAlert"]),c={light:"lightToggle",switch:"switchToggle",fan:"fanToggle",input_boolean:"switchToggle",lock:"lockToggle",script:"scriptFire",automation:"scriptFire",cover:"coverAction",climate:"climateAdjust",number:"climateAdjust",sensor:"entityInfo",binary_sensor:"entityInfo",humidifier:"fanToggle",media_player:"mediaAction",camera:"entityInfo"},d={get isMuted(){try{return"true"===localStorage.getItem(r)}catch{return!1}},mute(){try{localStorage.setItem(r,"true")}catch{}},unmute(){try{localStorage.setItem(r,"false")}catch{}},toggle(){return this.isMuted?(this.unmute(),this.play("toggle")):this.mute(),!this.isMuted},play(e){if(this.isMuted)return;if(window.matchMedia("(prefers-reduced-motion: reduce)").matches&&!l.has(e))return;const t=o[e];if(t)try{t((i||(i=new(window.AudioContext||window.webkitAudioContext)),"suspended"===i.state&&i.resume(),i))}catch{}},playForEntity(e){const t=e?e.split(".")[0]:"",a=c[t];this.play(a||"acknowledge")}}},7850(e,t,a){a.d(t,{j:()=>d});var r=a(7349),i=a(8851),s=a(3505),n=a(9411),o=a(4867),l=a(6940);a(9761),a(3790),a(5477);const c=/^[a-z_]+\.[a-z0-9_]+$/;class d extends r.WF{static get properties(){return{group:{type:Object},hass:{type:Object},config:{type:Object},editMode:{type:Boolean,attribute:"edit-mode",reflect:!0},areaId:{type:String,attribute:"area-id"},linkedEntities:{type:Array},entities:{type:Array},devices:{type:Array},frameMode:{type:String,attribute:"frame-mode"}}}constructor(){super(),this.group=null,this.hass=null,this.config=null,this.editMode=!1,this.areaId=null,this.linkedEntities=[],this.entities=null,this.devices=null,this.frameMode="standard"}_getEntityState(e){return this.hass&&this.hass.states[e]?this.hass.states[e]:null}_isValidEntityId(e){return"string"==typeof e&&c.test(e)}_callService(e,t,a){if(!this.hass)return void i.g0.warn("BasePanel","_callService: no hass instance");const r=a?.entity_id;if(!r||this._isValidEntityId(r))return this.hass.callService(e,t,a);i.g0.warn("BasePanel",`_callService: invalid entity_id "${r}"`)}_handleEntityClick(e){(0,i.Hv)(e)}_getSensorIndicatorColor(e,t=""){return"carbon_dioxide"===(e?.attributes?.device_class||"")?(0,s.kR)(e?.state):(0,s.xH)(e?.entity_id||"",e,t)}_formatSensorValue(e,t){const a=t?.entity_category||"";return(0,n.kp)(e,a)}_canonicalLabel(e,t){const a=e?.attributes?.device_class||"",r=this._friendlyName(e,t),i=t?.entity_id||e?.entity_id||"";return(0,n.Z2)(a,r,i)}_getDeviceCategoryEntities(e){if(!this.hass||!e)return{config:[],diagnostic:[]};const t=Object.values(this.hass.entities||{}),a=[],r=[];for(const i of t)i.device_id===e&&(i.disabled_by||"user"===i.hidden_by||i.hidden||("config"===i.entity_category?a.push(i):"diagnostic"===i.entity_category&&r.push(i)));return{config:a,diagnostic:r}}_shortenName(e,t){if(!e)return e;const a=[],r=this.hass?.areas?.[this.areaId];if(r?.name&&(a.push(r.name),a.push(r.name.replace(/[''\u2019]s$/i,""))),t?.device_id){const e=this.hass?.devices?.[t.device_id],r=e?.name_by_user||e?.name;r&&(a.push(r),a.push(r.replace(/[''\u2019]s$/i,"")))}const i=[...new Set(a)];i.sort((e,t)=>t.length-e.length);let s=e,n=!0;for(;n;){n=!1;for(const e of i)s.toLowerCase().startsWith(e.toLowerCase())&&(s=s.slice(e.length).trim().replace(/^[-–:]\s*/,""),n=!0)}return s=s.replace(/\s+(?:[A-Z]{1,3}\d{1,4}[A-Z]?|[A-Z]\d+[A-Z]\d*|\d{3,}[A-Z]?)$/i,"").trim(),s||e}_friendlyName(e,t){const a=e?.attributes?.friendly_name||t.entity_id.split(".").pop().replace(/_/g," ");return this._shortenName(a,t)}_shortDeviceName(e){const t=e?.name_by_user||e?.name||"";if(!t)return"Device";const a=this.hass?.areas?.[this.areaId];return a?.name&&t.toLowerCase().startsWith(a.name.toLowerCase())&&t.slice(a.name.length).trim().replace(/^[-–:]\s*/,"")||t}_isOff(e){return["off","unavailable","unknown","idle","standby","locked"].includes(e?.state)}_generatePanelCode(e){let t=5381;for(let a=0;a<e.length;a++)t=(t<<5)+t+e.charCodeAt(a)|0;const a=String(Math.abs(t)%1e6).padStart(6,"0");return`${a.slice(0,3)}-${a.slice(3)}`}_handleToggle(e){const t=e.split(".")[0],a=this._getEntityState(e);"unavailable"!==a?.state?(l.e.playForEntity(e),"lock"===t?this._callService("lock","locked"===a?.state?"unlock":"lock",{entity_id:e}):"script"===t?this._callService("script","turn_on",{entity_id:e}):this._callService("homeassistant","toggle",{entity_id:e})):l.e.play("negativeAcknowledge")}_getEntityIcon(e){return e?e.attributes?.icon?e.attributes.icon:{light:"mdi:lightbulb",switch:"mdi:toggle-switch",sensor:"mdi:eye",binary_sensor:"mdi:radiobox-blank",climate:"mdi:thermostat",cover:"mdi:window-shutter",fan:"mdi:fan",lock:"mdi:lock",camera:"mdi:video",media_player:"mdi:cast",automation:"mdi:robot",script:"mdi:script-text",update:"mdi:package-up"}[e.entity_id.split(".")[0]]||"mdi:information-outline":"mdi:help-circle-outline"}_partitionDeviceEntities(e){const t=[],a=[],r=[];for(const i of e)o.aE.has(i.domain)?t.push(i):o.Xt.has(i.domain)?a.push(i):r.push(i);return{cameras:t,sensors:a,controls:r}}_getAllEntities(){const e=this.entities||this.group?.entities||[];if(!this.linkedEntities?.length)return e;const t=this.linkedEntities.map(e=>({...e,_linked:!0}));return[...e,...t]}get panelType(){return"unknown"}get defaultPanelTitle(){return"PANEL"}get frameColor(){return"var(--lcars-butterscotch)"}_getPanelName(){return this.group?.device?this._shortDeviceName(this.group.device)||this.defaultPanelTitle:this.devices?.length&&this._shortDeviceName(this.devices[0])||this.defaultPanelTitle}_getPanelCode(){const e=this.entities?.[0]?.entity?.entity_id||this.group?.entities?.[0]?.entity?.entity_id||this.group?.device?.id||this.areaId||"panel";return this._generatePanelCode(e)}static get styles(){return[r.AH`:host { display: block; }`]}renderBadge(){return r.qy``}renderContent(){return r.qy``}render(){return this.group||this.entities?.length?r.qy`
      <lcars-panel-frame
        panel-name="${this._getPanelName()}"
        panel-code="${this._getPanelCode()}"
        frame-color="${this.frameColor}"
        panel-type="${this.panelType}"
        frame-mode="${this.frameMode}">
        <span slot="badge">${this.renderBadge()}</span>
        ${this.renderContent()}
      </lcars-panel-frame>
    `:r.qy``}}},6280(e,t,a){var r=a(7349),i=a(2622),s=a(8851);class n extends r.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object},_card:{type:Object}}}constructor(){super(),this._card=null}set hass(e){this._hass=e,this._card&&(this._card.hass=e)}setConfig(e){this._config=e,e.card&&this._createCard(e.card)}async _createCard(e){try{this._card=await(0,s.te)(e),this._hass&&(this._card.hass=this._hass),this.requestUpdate()}catch(e){console.error("LCARS Blueprint: Failed to create card",e)}}static get styles(){return[i.Bx,r.AH`
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
        `]}render(){return r.qy`
        <div class="blueprint-wrapper">
          ${this._config?.name?r.qy`<div class="blueprint-label">${this._config.name}</div>`:""}
          ${this._card?r.qy`${this._card}`:""}
        </div>
      `}getCardSize(){return this._card?2:1}}customElements.get("lcars-blueprint-card")||customElements.define("lcars-blueprint-card",n)},1255(e,t,a){var r=a(7349),i=a(8851),s=a(2622),n=a(4867),o=a(9411),l=a(3505),c=a(717),d=a(6940);const p="all",u="features",m={ph:{label:"pH",unit:"",min:6.5,max:8.5,optMin:7.2,optMax:7.6},chlorine:{label:"FREE CHLORINE",unit:"ppm",min:0,max:6,optMin:1,optMax:3},alkalinity:{label:"ALKALINITY",unit:"ppm",min:0,max:200,optMin:80,optMax:120},calcium:{label:"CALCIUM",unit:"ppm",min:0,max:600,optMin:200,optMax:400},hardness:{label:"HARDNESS",unit:"ppm",min:0,max:600,optMin:200,optMax:400},cya:{label:"CYA",unit:"ppm",min:0,max:100,optMin:30,optMax:50}},h=/ph_|ph$|chlorine|alkalinity|calcium|hardness|cyanuric/i,f=/waterfall|spillway|bubbler|fountain|blower/i,v=/pump.*(watts|rpm|gpm)/i,g=/pump$/i;function b(e){return/ph/i.test(e)?"ph":/chlorine/i.test(e)?"chlorine":/alkalinity/i.test(e)?"alkalinity":/calcium/i.test(e)?"calcium":/total_hardness/i.test(e)?"hardness":/cyanuric/i.test(e)?"cya":null}function y(e,t){if(null==e||isNaN(e))return"unknown";const a=Number(e);if(a>=t.optMin&&a<=t.optMax)return"optimal";const r=t.optMin-.4*(t.optMin-t.min),i=t.optMax+.4*(t.max-t.optMax);return a>=r&&a<=i?"acceptable":"alert"}class _ extends r.WF{static get properties(){return{hass:{type:Object},_config:{type:Object},filter:{type:String}}}constructor(){super(),this.hass=null,this._config={},this.filter=p,this._spDebouncer=null,this._onFilter=e=>{this.filter=e.detail.filter}}setConfig(e){this._config=e}connectedCallback(){super.connectedCallback(),i.o6.addEventListener("lcars-cet-filter",this._onFilter)}disconnectedCallback(){super.disconnectedCallback(),i.o6.removeEventListener("lcars-cet-filter",this._onFilter)}_discoverEntities(){if(!this.hass)return[];const e=Object.values(this.hass.entities||{}),t=this.hass.states||{},a=[];for(const r of e)if(!r.hidden_by&&!r.disabled_by){if(n.vX.has(r.platform)){const e=t[r.entity_id];e&&a.push({entity:r,domain:r.entity_id.split(".")[0],state:e});continue}if("emporia_vue"===r.platform&&/pool/i.test(r.entity_id)){const e=t[r.entity_id];e&&a.push({entity:r,domain:r.entity_id.split(".")[0],state:e,_source:"emporia"})}}return a}_partition(e){const t=[],a=[],r=[],i=[],s=[],n=[],o=[],l=[],c=[],d=[],p=[];let u=null,m=null;for(const b of e){const e=b.entity.entity_id,y=b.domain;"emporia"!==b._source?"climate"!==y?"binary_sensor"===y&&/freeze/i.test(e)?u=b:"binary_sensor"===y&&g.test(e)?l.push(b):"binary_sensor"!==y&&("light"!==y?"sensor"!==y||!h.test(e)||/alert/i.test(e)?"sensor"===y&&v.test(e)?o.push(b):"sensor"===y&&/air.*temp/i.test(e)?m=b:"sensor"===y&&/cassette|battery|last_measurement|signal_strength|status|skimmer_flow/i.test(e)?d.push(b):"switch"!==y?"sensor"!==y||"temperature"!==b.state?.attributes?.device_class||c.push(b):f.test(e)?i.push(b):s.push(b):r.push(b):n.push(b)):/spa/i.test(e)?a.push(b):t.push(b):p.push(b)}return{pool:t,spa:a,chemistry:r,waterFeatures:i,circuits:s,lights:n,pumpTelemetry:o,pumpBinary:l,environmental:c,sensorHealth:d,power:p,freezeSensor:u,airTemp:m}}_renderSummary(e){const t=e.pool[0]?.state?.attributes?.current_temperature,a=e.spa[0]?.state?.attributes?.current_temperature,i=e.pool[0]?.state?.attributes?.hvac_action||"off",s=e.spa[0]?.state?.attributes?.hvac_action||"off",n=e.chemistry.map(e=>{const t=b(e.entity.entity_id);return t&&m[t]?y(Number(e.state?.state),m[t]):null}).filter(Boolean),o=n.filter(e=>"alert"===e).length,l=n.filter(e=>"acceptable"===e).length,c=o>0?`${o} ALERT`:l>0?`${l} CAUTION`:"OPTIMAL",d=o>0?"var(--lcars-tomato)":l>0?"var(--lcars-sunflower)":"var(--lcars-ice)",p=e.pumpBinary.filter(e=>"on"===e.state?.state).length,u=e.circuits.filter(e=>"on"===e.state?.state).length,h=e.pumpBinary.length+e.circuits.length,f=p+u,v="on"===e.freezeSensor?.state?.state,g=v?"var(--lcars-ice, #99ccff)":"var(--lcars-sky, #aaaaff)";return r.qy`
      <div class="cet-summary" style="--summary-color:${g}">
        <div class="cet-summary__block">
          <span class="cet-summary__label">POOL</span>
          <span class="cet-summary__value">${null!=t?`${Math.round(t)}°F`:"—"}</span>
          ${"heating"===i?r.qy`<span class="cet-summary__badge" style="color:var(--lcars-butterscotch)">● HEATING</span>`:""}
        </div>
        <div class="cet-summary__block">
          <span class="cet-summary__label">SPA</span>
          <span class="cet-summary__value">${null!=a?`${Math.round(a)}°F`:"—"}</span>
          ${"heating"===s?r.qy`<span class="cet-summary__badge" style="color:var(--lcars-butterscotch)">● HEATING</span>`:""}
        </div>
        <div class="cet-summary__block">
          <span class="cet-summary__label">CHEMISTRY</span>
          <span class="cet-summary__value" style="color:${d}">${c}</span>
        </div>
        <div class="cet-summary__block">
          <span class="cet-summary__label">SYSTEMS</span>
          <span class="cet-summary__value">${f}/${h} ACTIVE</span>
        </div>
        ${v?r.qy`
          <div class="cet-summary__block">
            <span class="cet-summary__label" style="color:var(--lcars-ice)">❄ FREEZE</span>
            <span class="cet-summary__value" style="color:var(--lcars-ice)">ACTIVE</span>
          </div>
        `:""}
      </div>

      <!-- Chemistry status segments (Row 2) -->
      ${n.length>0?r.qy`
        <div class="cet-chem-segments">
          ${e.chemistry.map(e=>{const t=b(e.entity.entity_id);if(!t||!m[t])return"";const a=y(Number(e.state?.state),m[t]),i="alert"===a?"var(--lcars-tomato)":"acceptable"===a?"var(--lcars-sunflower)":"var(--lcars-ice)";return r.qy`<span class="cet-chem-seg" style="background:${i}">${m[t].label.split(" ")[0]}</span>`})}
        </div>
      `:""}
    `}_handleSetpoint(e,t,a){const r=(0,c.A_)(a,t,{min:40,max:104});this._spDebouncer||(this._spDebouncer=(0,c.eU)((e,t)=>{this.hass.callService("climate","set_temperature",{entity_id:e,temperature:t})},1500)),this._spDebouncer.call(e,r)}_renderWaterBody(e,t){if(!e.length)return"";const a=e[0],i=a.state,s=i?.attributes||{},n=null!=s.current_temperature?Number(s.current_temperature):null,o=null!=s.temperature?Number(s.temperature):null,c=s.hvac_action||"off",d=(0,l.qW)(c,t),p="spa"===t?"SPA":"POOL",u="heating"===c;return r.qy`
      <div class="cet-body-frame" style="--body-color:${d}" role="region"
        aria-label="${p}: ${null!=n?n+"°":"N/A"}">
        <div class="cet-body-label" style="color:${d}">${p}</div>
        <div class="cet-body-temp" style="color:${d}">${null!=n?`${Math.round(n)}°`:"—"}</div>
        ${null!=o?r.qy`
          <div class="cet-sp-row">
            <button class="cet-sp-btn" aria-label="Decrease ${p} target"
              @click=${()=>this._handleSetpoint(a.entity.entity_id,s,o-1)}>−</button>
            <span class="cet-sp-target" style="color:${d}">${o}°</span>
            <button class="cet-sp-btn" aria-label="Increase ${p} target"
              @click=${()=>this._handleSetpoint(a.entity.entity_id,s,o+1)}>+</button>
          </div>
        `:""}
        ${u?r.qy`<div class="cet-heating-bar" style="--body-color:${d}"></div>`:""}
        <div class="cet-body-mode">${s.preset_mode||c}</div>
      </div>
    `}_renderWaterBodies(e){if(!e.pool.length&&!e.spa.length)return"";const t=e.airTemp?.state?.state;return r.qy`
      <div class="cet-section">
        <div class="cet-section-header">
          <span class="cet-section-label">WATER BODIES</span>
          <span class="cet-section-line"></span>
          ${t?r.qy`<span class="cet-air-temp">AIR ${Math.round(Number(t))}°F</span>`:""}
        </div>
        <div class="cet-bodies-row">
          ${this._renderWaterBody(e.pool,"pool")}
          ${this._renderWaterBody(e.spa,"spa")}
        </div>
      </div>
    `}_renderChemistry(e){return e.chemistry.length?r.qy`
      <div class="cet-section">
        <div class="cet-section-header">
          <span class="cet-section-label">CHEMISTRY — SCIENCE STATION</span>
          <span class="cet-section-line"></span>
        </div>
        <div class="cet-chem-gauges">
          ${e.chemistry.map(e=>{const t=b(e.entity.entity_id);if(!t||!m[t])return"";const a=m[t],r=Number(e.state?.state),i=y(r,a);return this._renderGauge(a,r,i,e.entity.entity_id)})}
        </div>
        ${this._renderSensorHealth(e.sensorHealth)}
      </div>
    `:""}_renderGauge(e,t,a,s){const n=e.max-e.min,o=(e.optMin-e.min)/n*100,l=(e.optMax-e.optMin)/n*100,c=100-o-l,d=isNaN(t)?0:Math.max(0,Math.min(100,(t-e.min)/n*100)),p="optimal"===a?"OPTIMAL":"acceptable"===a?"CAUTION":"alert"===a?"ALERT":"—",u="optimal"===a?"var(--lcars-ice)":"acceptable"===a?"var(--lcars-sunflower)":"var(--lcars-tomato)";return r.qy`
      <div class="langford-gauge" role="meter" aria-valuenow="${t}" aria-valuemin="${e.min}" aria-valuemax="${e.max}"
           aria-label="${e.label}: ${isNaN(t)?"unavailable":t}${e.unit}" @click=${()=>(0,i.Hv)(s)}>
        <div class="gauge-header">
          <span class="gauge-label">${e.label}</span>
          <span class="gauge-readout" style="color:${u}">${isNaN(t)?"—":t}${e.unit} ${p}</span>
        </div>
        <div class="gauge-track">
          <div class="gauge-zone gauge-warn-low" style="width:${o}%"></div>
          <div class="gauge-zone gauge-optimal" style="width:${l}%"></div>
          <div class="gauge-zone gauge-warn-high" style="width:${c}%"></div>
          ${isNaN(t)?"":r.qy`<div class="gauge-needle" style="--needle-pos:${d}%"></div>`}
        </div>
        <div class="gauge-scale">
          <span>${e.min}</span>
          <span>${e.optMin}</span>
          <span>${e.optMax}</span>
          <span>${e.max}</span>
        </div>
      </div>
    `}_renderSensorHealth(e){if(!e.length)return"";const t=e.find(e=>/battery/i.test(e.entity.entity_id)),a=e.find(e=>/cassette_remaining/i.test(e.entity.entity_id)),i=e.find(e=>/cassette_days/i.test(e.entity.entity_id)),s=e.find(e=>/last_measurement/i.test(e.entity.entity_id));return r.qy`
      <div class="cet-sensor-health">
        <span class="cet-section-sublabel">SENSOR</span>
        ${a?r.qy`<div class="cet-health-row"><span>CASSETTE</span><span>${a.state?.state}%${i?` · ${i.state?.state}d`:""}</span></div>`:""}
        ${t?r.qy`<div class="cet-health-row"><span>BATTERY</span><span>${t.state?.state}%</span></div>`:""}
        ${s?r.qy`<div class="cet-health-row"><span>LAST READ</span><span>${s.state?.state}</span></div>`:""}
      </div>
    `}_renderFeatures(e){return e.waterFeatures.length||e.lights.length?r.qy`
      <div class="cet-section">
        <div class="cet-section-header">
          <span class="cet-section-label">WATER FEATURES</span>
          <span class="cet-section-line"></span>
        </div>
        <div class="cet-feature-grid">
          ${e.waterFeatures.map(e=>this._renderToggle(e))}
          ${e.lights.map(e=>this._renderToggle(e,!0))}
        </div>
      </div>
    `:""}_renderToggle(e,t=!1){const a=(e.state?.attributes?.friendly_name||e.entity.entity_id).replace(/pentair.*?_/i,"").replace(/_/g," ").toUpperCase(),i="on"===e.state?.state;return r.qy`
      <button class="cet-toggle ${i?"on":""}" role="switch" aria-checked="${i}"
        @click=${()=>{this.hass.callService(t?"light":"switch","toggle",{entity_id:e.entity.entity_id}),d.e.play("switchToggle")}}>
        <span class="cet-toggle-name">${a}</span>
        <span class="cet-toggle-state">${i?"ON":"OFF"}</span>
      </button>
    `}_renderPumps(e){if(!e.pumpBinary.length&&!e.pumpTelemetry.length)return"";const t=new Map;for(const a of e.pumpBinary){const e=a.entity.entity_id.replace("binary_sensor.","").replace(/_pump$/,"");t.has(e)||t.set(e,{binary:null,watts:null,rpm:null,gpm:null}),t.get(e).binary=a}for(const a of e.pumpTelemetry){const e=a.entity.entity_id,r=e.replace("sensor.","").replace(/_pump_(watts|rpm|gpm)_now$/,"");t.has(r)||t.set(r,{binary:null,watts:null,rpm:null,gpm:null});const i=t.get(r);/watts/i.test(e)?i.watts=a:/rpm/i.test(e)?i.rpm=a:/gpm/i.test(e)&&(i.gpm=a)}return r.qy`
      <div class="cet-section">
        <div class="cet-section-header">
          <span class="cet-section-label">PUMP TELEMETRY</span>
          <span class="cet-section-line"></span>
        </div>
        ${[...t.entries()].map(([e,t])=>{const a=e.replace(/pentair.*?_/i,"").replace(/_/g," ").toUpperCase(),i="on"===t.binary?.state?.state,s=t.watts?.state?.state,n=t.rpm?.state?.state,l=t.gpm?.state?.state;return r.qy`
            <div class="cet-pump-row ${i?"active":""}">
              <span class="cet-pump-dot ${i?"on":""}"></span>
              <span class="cet-pump-name">${a}</span>
              <span class="cet-pump-stat">${n?`${(0,o.ZV)(Number(n),0)} RPM`:"—"}</span>
              <span class="cet-pump-stat">${s?`${(0,o.ZV)(Number(s),0)}W`:"—"}</span>
              <span class="cet-pump-stat">${l?`${(0,o.ZV)(Number(l),0)} GPM`:"—"}</span>
            </div>
          `})}
      </div>
    `}_renderCircuits(e){return e.circuits.length?r.qy`
      <div class="cet-section">
        <div class="cet-section-header">
          <span class="cet-section-label">CIRCUITS</span>
          <span class="cet-section-line"></span>
          <span class="cet-circuit-count">${e.circuits.filter(e=>"on"===e.state?.state).length}/${e.circuits.length}</span>
        </div>
        <div class="cet-circuit-grid">
          ${e.circuits.map(e=>this._renderToggle(e))}
        </div>
      </div>
    `:""}_renderPower(e){if(!e.power.length)return"";const t=[...e.power].sort((e,t)=>Number(t.state?.state||0)-Number(e.state?.state||0)),a=t.reduce((e,t)=>e+(Number(t.state?.state)||0),0);return r.qy`
      <div class="cet-section">
        <div class="cet-section-header">
          <span class="cet-section-label">POOL EQUIPMENT POWER</span>
          <span class="cet-section-line"></span>
          <span class="cet-power-total">${(0,o.ZV)(a,0)}W</span>
        </div>
        <div class="cet-power-grid">
          ${t.filter(e=>Number(e.state?.state)>1).map(e=>{const t=(e.state?.attributes?.friendly_name||e.entity.entity_id).toUpperCase(),a=Number(e.state?.state)||0;return r.qy`
              <div class="cet-power-tile" @click=${()=>(0,i.Hv)(e.entity.entity_id)}>
                <span class="cet-power-name">${t}</span>
                <span class="cet-power-watts">${(0,o.ZV)(a,0)}W</span>
              </div>
            `})}
        </div>
      </div>
    `}_renderFreezeBanner(e){return e.freezeSensor&&"on"===e.freezeSensor.state?.state?r.qy`
      <div class="cet-freeze-banner" role="alert">
        <span>❄</span> FREEZE PROTECT ACTIVE
      </div>
    `:""}render(){if(!this.hass)return r.qy`<div class="cet-loading">INITIALIZING CETACEAN OPS...</div>`;const e=this._discoverEntities();if(!e.length)return r.qy`<div class="cet-empty">NO AQUATIC SYSTEMS DETECTED</div>`;const t=this._partition(e),a=this.filter;return r.qy`
      <div class="cet-dashboard">
        ${this._renderSummary(t)}
        ${this._renderFreezeBanner(t)}
        ${a===p||"water"===a?this._renderWaterBodies(t):""}
        ${a===p||"chemistry"===a?this._renderChemistry(t):""}
        ${a===p||a===u?this._renderFeatures(t):""}
        ${a===p||a===u?this._renderPumps(t):""}
        ${a===p||a===u?this._renderCircuits(t):""}
        ${"power"===a?this._renderPower(t):""}
      </div>
    `}static get styles(){return[s.Bx,r.AH`
        :host { display: block; }
        .cet-dashboard { display: flex; flex-direction: column; gap: 1rem; }
        .cet-loading, .cet-empty { font-family: var(--lcars-font, 'Antonio', sans-serif); color: var(--lcars-gray, #666688); text-transform: uppercase; padding: 2rem; text-align: center; font-size: 1.25rem; letter-spacing: 0.1em; }

        /* ─── Summary Bar ─── */
        .cet-summary {
          display: flex; gap: 0.25rem; padding: 0.5rem 1rem;
          background: var(--summary-color, var(--lcars-sky, #aaaaff));
          border-radius: 0.5rem; color: var(--lcars-black, #000);
          font-family: var(--lcars-font, 'Antonio', sans-serif); text-transform: uppercase;
        }
        .cet-summary__block { flex: 1; display: flex; flex-direction: column; gap: 0.125rem; }
        .cet-summary__label { font-size: 0.625rem; letter-spacing: 0.1em; opacity: 0.7; }
        .cet-summary__value { font-size: 1rem; font-variant-numeric: tabular-nums; }
        .cet-summary__badge { font-size: 0.625rem; }

        /* Chemistry status segments (Row 2) */
        .cet-chem-segments {
          display: flex; gap: 0.125rem; margin-top: 0.25rem;
        }
        .cet-chem-seg {
          flex: 1; text-align: center; padding: 0.125rem 0.25rem;
          border-radius: 0.25rem; font-family: var(--lcars-font, 'Antonio', sans-serif);
          font-size: 0.625rem; text-transform: uppercase; color: var(--lcars-black, #000);
          letter-spacing: 0.05em;
        }

        /* ─── Section Headers ─── */
        .cet-section { margin-bottom: 0.25rem; }
        .cet-section-header {
          display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;
        }
        .cet-section-label {
          font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 1.25rem;
          color: var(--lcars-sky, #aaaaff); text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap;
        }
        .cet-section-line { flex: 1; height: 2px; background: var(--lcars-sky, #aaaaff); opacity: 0.4; }
        .cet-section-sublabel {
          font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 0.875rem;
          color: var(--lcars-gray, #666688); text-transform: uppercase; margin-top: 0.75rem; margin-bottom: 0.25rem;
        }
        .cet-air-temp {
          font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 1rem;
          color: var(--lcars-space-white, #f5f6fa); text-transform: uppercase; white-space: nowrap;
        }
        .cet-circuit-count, .cet-power-total {
          font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 1rem;
          color: var(--lcars-ice, #99ccff); white-space: nowrap;
        }

        /* ─── Water Bodies ─── */
        .cet-bodies-row { display: flex; gap: 0.75rem; flex-wrap: wrap; }
        .cet-body-frame {
          flex: 1; min-width: 12rem; border: 3px solid var(--body-color);
          border-radius: 0.75rem; padding: 1rem; background: var(--lcars-bg, #000);
          display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
          position: relative; overflow: hidden;
        }
        .cet-body-label { font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 1.25rem; text-transform: uppercase; letter-spacing: 0.1em; }
        .cet-body-temp { font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 2.5rem; }
        .cet-sp-row { display: flex; align-items: center; gap: 1rem; }
        .cet-sp-btn {
          width: 2.5rem; height: 2.5rem; border: none; border-radius: 0.375rem;
          background: var(--lcars-gray, #666688); color: var(--lcars-space-white, #f5f6fa);
          font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 1.5rem;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
        }
        .cet-sp-btn:hover { background: var(--lcars-gold, #ffaa00); color: var(--lcars-black, #000); }
        .cet-sp-btn:focus-visible { outline: 2px solid var(--lcars-ice, #99ccff); outline-offset: 2px; }
        .cet-sp-target { font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 1.5rem; }
        .cet-heating-bar {
          position: absolute; bottom: 0; left: 0; right: 0; height: 4px;
          background: var(--body-color); animation: cet-heat-pulse 2s ease-in-out infinite;
        }
        @keyframes cet-heat-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @media (prefers-reduced-motion: reduce) { .cet-heating-bar { animation: none; } }
        .cet-body-mode {
          font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 0.75rem;
          color: var(--lcars-gray, #666688); text-transform: uppercase; letter-spacing: 0.08em;
        }

        /* ─── Langford Gauges ─── */
        .cet-chem-gauges { display: flex; flex-direction: column; gap: 0.75rem; }
        .langford-gauge { cursor: pointer; }
        .langford-gauge:hover .gauge-track { filter: brightness(1.15); }
        .gauge-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.25rem; }
        .gauge-label {
          font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 1rem;
          color: var(--lcars-space-white, #f5f6fa); text-transform: uppercase; letter-spacing: 0.05em;
        }
        .gauge-readout {
          font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 0.875rem;
          text-transform: uppercase; font-variant-numeric: tabular-nums;
        }
        .gauge-track {
          position: relative; height: 1.25rem; display: flex;
          border-radius: 0 var(--lcars-btn-radius, 1.5rem) var(--lcars-btn-radius, 1.5rem) 0;
          overflow: visible;
        }
        .gauge-zone { height: 100%; }
        .gauge-zone:first-child { border-radius: 0.375rem 0 0 0.375rem; }
        .gauge-zone:last-child { border-radius: 0 var(--lcars-btn-radius, 1.5rem) var(--lcars-btn-radius, 1.5rem) 0; }
        .gauge-warn-low, .gauge-warn-high { background: var(--lcars-sunflower, #ffcc99); }
        .gauge-optimal { background: var(--lcars-ice, #99ccff); }
        .gauge-needle {
          position: absolute; top: -3px; bottom: -3px; width: 3px;
          background: var(--lcars-black, #000); outline: 1px solid var(--lcars-space-white, #f5f6fa);
          left: var(--needle-pos, 0%); pointer-events: none;
          transition: left 300ms ease-out;
        }
        @media (prefers-reduced-motion: reduce) { .gauge-needle { transition: none; } }
        .gauge-scale {
          display: flex; justify-content: space-between; margin-top: 0.125rem;
          font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 0.625rem;
          color: var(--lcars-gray, #666688); text-transform: uppercase;
        }

        /* Sensor health */
        .cet-sensor-health { margin-top: 0.75rem; }
        .cet-health-row {
          display: flex; justify-content: space-between; padding: 0.125rem 0;
          font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 0.875rem;
          color: var(--lcars-space-white, #f5f6fa); text-transform: uppercase;
        }

        /* ─── Toggle Buttons ─── */
        .cet-feature-grid, .cet-circuit-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(min(14rem, 100%), 1fr));
          gap: 0.375rem;
        }
        .cet-toggle {
          display: flex; align-items: center; justify-content: space-between;
          height: 3rem; padding: 0 1rem;
          border: none; border-radius: 0 var(--lcars-btn-radius, 1.5rem) var(--lcars-btn-radius, 1.5rem) 0;
          background: var(--lcars-gray, #666688); color: var(--lcars-space-white, #f5f6fa);
          font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 1rem;
          text-transform: uppercase; cursor: pointer; transition: background 200ms ease;
        }
        .cet-toggle.on { background: var(--lcars-ice, #99ccff); color: var(--lcars-black, #000); }
        .cet-toggle:hover { filter: brightness(1.2); }
        .cet-toggle:focus-visible { outline: 2px solid var(--lcars-space-white, #f5f6fa); outline-offset: 2px; }
        .cet-toggle-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .cet-toggle-state { font-size: 0.75rem; opacity: 0.8; flex-shrink: 0; margin-left: 0.5rem; }

        /* ─── Pump Telemetry ─── */
        .cet-pump-row {
          display: flex; align-items: center; gap: 0.75rem; padding: 0.375rem 0;
          font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 0.875rem;
          color: var(--lcars-gray, #666688); text-transform: uppercase;
          border-bottom: 1px solid rgba(170,170,255,0.1);
        }
        .cet-pump-row.active { color: var(--lcars-space-white, #f5f6fa); }
        .cet-pump-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: var(--lcars-gray, #666688); flex-shrink: 0;
        }
        .cet-pump-dot.on { background: var(--lcars-ice, #99ccff); }
        .cet-pump-name { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .cet-pump-stat { min-width: 5rem; text-align: right; font-variant-numeric: tabular-nums; }

        /* ─── Power Grid ─── */
        .cet-power-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(min(12rem, 100%), 1fr));
          gap: 0.375rem;
        }
        .cet-power-tile {
          display: flex; flex-direction: column; gap: 0.25rem;
          padding: 0.5rem 0.75rem; border-radius: 0.375rem;
          background: rgba(170,170,255,0.08); cursor: pointer;
          font-family: var(--lcars-font, 'Antonio', sans-serif); text-transform: uppercase;
        }
        .cet-power-tile:hover { background: rgba(170,170,255,0.15); }
        .cet-power-name { font-size: 0.75rem; color: var(--lcars-gray, #666688); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .cet-power-watts { font-size: 1.25rem; color: var(--lcars-ice, #99ccff); font-variant-numeric: tabular-nums; }

        /* ─── Freeze Banner ─── */
        .cet-freeze-banner {
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          padding: 0.5rem; border-radius: 0.25rem;
          background: var(--lcars-ice, #99ccff); color: var(--lcars-black, #000);
          font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 1rem;
          text-transform: uppercase; letter-spacing: 0.1em;
          animation: cet-freeze-pulse 2s ease-in-out infinite;
        }
        @keyframes cet-freeze-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        @media (prefers-reduced-motion: reduce) { .cet-freeze-banner { animation: none; } }
      `]}}Promise.race([customElements.whenDefined("hui-masonry-view"),new Promise(e=>setTimeout(e,5e3))]).then(()=>{customElements.get("cetacean-card")||customElements.define("cetacean-card",_)})},4795(e,t,a){var r=a(7349),i=a(2622),s=a(8851),n=a(6940),o=a(5824);const l="all",c="water",d="chemistry",p="features",u="power";class m extends r.WF{static get properties(){return{cards:{type:Array},_hass:{type:Object},_config:{type:Object},_filter:{type:String},_siteName:{type:String},_audioMuted:{type:Boolean},_editMode:{type:Boolean}}}constructor(){super(),this.cards=[],this._hass=null,this._config={},this._filter=l,this._siteName="LCARS",this._audioMuted=n.e.isMuted,this._editMode=!1}setConfig(e){this._config=e}set hass(e){this._hass=e,e?.config?.location_name&&(this._siteName=e.config.location_name.toUpperCase()),this.cards&&this.cards.forEach(t=>{t&&(t.hass=e)}),(0,o.X)(e)}_setFilter(e){this._filter=e,n.e.play("navAcknowledge"),s.o6.dispatchEvent(new CustomEvent("lcars-cet-filter",{detail:{filter:e}}))}_toggleMute(){n.e.toggle(),this._audioMuted=n.e.isMuted}_openSidebarReorder(){if(!this._hass?.user?.is_admin)return;let e=this.shadowRoot.querySelector("lcars-sidebar-reorder");e||(e=document.createElement("lcars-sidebar-reorder"),this.shadowRoot.appendChild(e)),e.hass=this._hass,e.open()}_toggleEditMode(){this._editMode=!this._editMode,s.o6.dispatchEvent(new CustomEvent("lcars-cet-edit",{detail:{enabled:this._editMode}}))}render(){const e=a(8330).version;return r.qy`
      <div class="lcars-frame">
        <div class="lcars-elbow-top" aria-hidden="true"></div>
        <div class="lcars-header" role="banner">
          <span class="lcars-header-title">${this._siteName}</span>
          <div class="lcars-header-bar" aria-hidden="true"></div>
          <div class="lcars-header-endcap">
            <button class="mute-btn" role="switch" aria-checked=${!this._audioMuted} @click=${()=>this._toggleMute()}>
              <ha-icon .icon=${this._audioMuted?"mdi:volume-off":"mdi:volume-high"}></ha-icon>
            </button>
            ${this._hass?.user?.is_admin?r.qy`
              <button class="mute-btn" aria-label="Reorder sidebar dashboards" @click=${()=>this._openSidebarReorder()}>
                <ha-icon .icon=${"mdi:sort-variant"}></ha-icon>
              </button>
              <button class="mute-btn" aria-pressed=${this._editMode} @click=${()=>this._toggleEditMode()}>
                <ha-icon .icon=${"mdi:cog-outline"}></ha-icon>
              </button>
            `:""}
          </div>
        </div>
        <nav class="lcars-sidebar" role="tablist" aria-label="Filter cetacean systems">
          <div class="lcars-sidebar-panel">Cetacean Ops</div>
          <div class="lcars-sidebar-filters">
            <button class="sidebar-filter-btn ${this._filter===l?"active":""}" role="tab" aria-selected="${this._filter===l?"true":"false"}" @click=${()=>this._setFilter(l)}><span class="filter-label">ALL</span></button>
            <button class="sidebar-filter-btn ${this._filter===c?"active":""}" role="tab" aria-selected="${this._filter===c?"true":"false"}" @click=${()=>this._setFilter(c)}><span class="filter-label">WATER BODIES</span></button>
            <button class="sidebar-filter-btn ${this._filter===d?"active":""}" role="tab" aria-selected="${this._filter===d?"true":"false"}" @click=${()=>this._setFilter(d)}><span class="filter-label">CHEMISTRY</span></button>
            <button class="sidebar-filter-btn ${this._filter===p?"active":""}" role="tab" aria-selected="${this._filter===p?"true":"false"}" @click=${()=>this._setFilter(p)}><span class="filter-label">FEATURES</span></button>
            <button class="sidebar-filter-btn ${this._filter===u?"active":""}" role="tab" aria-selected="${this._filter===u?"true":"false"}" @click=${()=>this._setFilter(u)}><span class="filter-label">POWER</span></button>
          </div>
          <div class="lcars-sidebar-filler" aria-hidden="true"></div>
        </nav>
        <main class="lcars-content" aria-label="Cetacean Ops dashboard">
          ${this.cards?.length>0?this.cards.map(e=>r.qy`${e}`):r.qy`<div class="lcars-heading">No data available</div>`}
        </main>
        <div class="lcars-elbow-bottom" aria-hidden="true"></div>
        <div class="lcars-footer" role="contentinfo">
          <div class="lcars-footer-bar" aria-hidden="true"></div>
          <span class="lcars-footer-text">LCARS ${e}</span>
          <div class="lcars-footer-endcap" aria-hidden="true"></div>
        </div>
      </div>
    `}static get styles(){return[i.Bx,r.AH`
        :host { display: block; height: calc(100vh - var(--header-height, 0px)); overflow: hidden; box-sizing: border-box; background: var(--lcars-bg, #000); padding: var(--lcars-gap, 0.25rem); }
        .lcars-frame { display: grid; grid-template-columns: var(--lcars-sidebar-w, 12rem) 1fr; grid-template-rows: var(--lcars-elbow-h, 4.5rem) 1fr var(--lcars-elbow-h, 4.5rem); gap: var(--lcars-gap, 0.25rem); height: 100%; }
        .lcars-elbow-top { grid-column: 1; grid-row: 1; background: var(--lcars-sky, #aaaaff); border-radius: var(--lcars-elbow-radius, 3.75rem) 0 0 0; position: relative; overflow: hidden; }
        .lcars-elbow-top::after { content: ''; position: absolute; bottom: 0; right: 0; width: calc(var(--lcars-sidebar-w, 12rem) - var(--lcars-elbow-w, 9.5rem)); height: calc(var(--lcars-elbow-h, 4.5rem) - var(--lcars-bar-h, 1.5rem)); background: var(--lcars-bg, #000); border-radius: 1.5rem 0 0 0; }
        .lcars-header { grid-column: 2; grid-row: 1; display: flex; align-items: flex-start; gap: var(--lcars-gap, 0.25rem); }
        .lcars-header-title { font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: var(--lcars-font-size-title, 2rem); color: var(--lcars-sky, #aaaaff); text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap; line-height: var(--lcars-bar-h, 1.5rem); padding: 0 1rem; }
        .lcars-header-bar { flex: 1; height: var(--lcars-bar-h, 1.5rem); background: var(--lcars-sky, #aaaaff); }
        .lcars-header-endcap { height: var(--lcars-bar-h, 1.5rem); background: var(--lcars-sky, #aaaaff); border-radius: 0; display: flex; align-items: center; padding: 0 0.5rem; }
        .mute-btn { background: none; border: none; cursor: pointer; color: var(--lcars-black, #000); padding: 0 0.25rem; display: flex; align-items: center; }
        .mute-btn:focus-visible { outline: 2px solid var(--lcars-ice, #99ccff); outline-offset: 2px; }
        .mute-btn ha-icon { --mdc-icon-size: 18px; }
        .lcars-sidebar { grid-column: 1; grid-row: 2; display: flex; flex-direction: column; gap: var(--lcars-gap, 0.25rem); overflow: hidden; }
        .lcars-sidebar-panel { background: var(--lcars-african-violet, #cc99ff); color: var(--lcars-black, #000); font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: var(--lcars-font-size-data, 0.875rem); text-transform: uppercase; padding: 0.25rem 0.5rem; text-align: right; border-radius: 0 0 0 var(--lcars-btn-radius, 1.5rem); flex-shrink: 0; }
        .lcars-sidebar-filters { display: flex; flex-direction: column; gap: var(--lcars-gap, 0.25rem); flex: 1; }
        .sidebar-filter-btn { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem; border: none; border-radius: var(--lcars-btn-radius, 1.5rem) 0 0 var(--lcars-btn-radius, 1.5rem); background: var(--lcars-african-violet, #cc99ff); color: var(--lcars-black, #000); font-family: var(--lcars-font, 'Antonio', sans-serif); text-transform: uppercase; cursor: pointer; transition: background 200ms ease; padding: 0.5rem; }
        .sidebar-filter-btn:hover { filter: brightness(1.2); }
        .sidebar-filter-btn:focus-visible { outline: 2px solid var(--lcars-ice, #99ccff); outline-offset: 2px; }
        .sidebar-filter-btn.active { background: var(--lcars-gold, #ffaa00); }
        .filter-label { font-size: 1.25rem; letter-spacing: 0.08em; text-align: center; }
        .lcars-sidebar-filler { flex: 1 0 0px; min-height: 0; background: var(--lcars-gray, #666688); border-radius: var(--lcars-btn-radius, 1.5rem) 0 0 0; }
        .lcars-content { grid-column: 2; grid-row: 2; overflow-y: auto; overflow-x: hidden; padding: 0.5rem; scrollbar-width: thin; scrollbar-color: var(--lcars-gray, #666688) transparent; }
        .lcars-elbow-bottom { grid-column: 1; grid-row: 3; background: var(--lcars-african-violet, #cc99ff); border-radius: 0 0 0 var(--lcars-elbow-radius, 3.75rem); position: relative; overflow: hidden; }
        .lcars-elbow-bottom::after { content: ''; position: absolute; top: 0; right: 0; width: calc(var(--lcars-sidebar-w, 12rem) - var(--lcars-elbow-w, 9.5rem)); height: calc(var(--lcars-elbow-h, 4.5rem) - var(--lcars-bar-h, 1.5rem)); background: var(--lcars-bg, #000); border-radius: 0 0 0 1.5rem; }
        .lcars-footer { grid-column: 2; grid-row: 3; display: flex; align-items: flex-end; gap: var(--lcars-gap, 0.25rem); }
        .lcars-footer-bar { flex: 1; height: var(--lcars-bar-h, 1.5rem); background: var(--lcars-african-violet, #cc99ff); }
        .lcars-footer-text { font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: var(--lcars-font-size-data, 0.875rem); color: var(--lcars-sky, #aaaaff); text-transform: uppercase; white-space: nowrap; line-height: var(--lcars-bar-h, 1.5rem); padding: 0 0.5rem; }
        .lcars-footer-endcap { width: var(--lcars-endcap-size, 1.5rem); height: var(--lcars-bar-h, 1.5rem); background: var(--lcars-african-violet, #cc99ff); border-radius: 0; flex-shrink: 0; }
      `]}}Promise.race([customElements.whenDefined("hui-masonry-view"),new Promise(e=>setTimeout(e,5e3))]).then(()=>{customElements.get("lcars-cetacean-layout")||customElements.define("lcars-cetacean-layout",m)})},3505(e,t,a){function r(e,t,a=""){const r=t?.state;if("unavailable"===r||"unknown"===r)return"var(--lcars-disabled)";const i=t?.attributes?.device_class||"",s=e.split(".")[0];if("binary_sensor"===s){if("off"===r)return"var(--lcars-disabled)";switch(i){case"motion":case"moving":return"var(--lcars-butterscotch)";case"occupancy":case"presence":return"var(--lcars-gold)";case"sound":return"var(--lcars-alert)";default:return"var(--lcars-data-accent)"}}if("sensor"===s){if("battery"===i){const e=parseFloat(r);if(!isNaN(e)&&e<20)return"var(--lcars-alert)"}return"var(--lcars-data-accent)"}return"event"===s?"var(--lcars-alert)":"var(--lcars-data-accent)"}function i(e){const t=Number(e);return Number.isFinite(t)?t<=800?"var(--lcars-ice)":t<=1200?"var(--lcars-sunflower)":"var(--lcars-tomato)":"var(--lcars-tomato)"}function s(e,t={}){const{coldMax:a=55,coolMax:r=67,nominalMax:i=76,warmMax:s=84}=t;if(null==e||isNaN(e))return"var(--lcars-gray)";const n=Number(e);return n<a?"var(--lcars-blue)":n<=r?"var(--lcars-bluey)":n<=i?"var(--lcars-ice)":n<=s?"var(--lcars-butterscotch)":"var(--lcars-peach)"}function n(e,t={}){const{veryDryMax:a=20,dryMax:r=29,nominalMax:i=60,humidMax:s=70}=t;if(null==e||isNaN(e))return"var(--lcars-gray)";const n=Number(e);return n<a?"var(--lcars-peach)":n<=r?"var(--lcars-sunflower)":n<=i?"var(--lcars-space-white)":n<=s?"var(--lcars-sunflower)":"var(--lcars-tomato)"}function o(e){switch(e){case"heating":return"var(--lcars-butterscotch)";case"cooling":return"var(--lcars-ice)";case"idle":return"var(--lcars-sunflower)";case"drying":return"var(--lcars-almond)";case"fan":return"var(--lcars-african-violet)";default:return"var(--lcars-disabled)"}}function l(e){switch(e){case"heat":return"var(--lcars-butterscotch)";case"cool":return"var(--lcars-ice)";case"heat_cool":case"auto":return"var(--lcars-gold)";case"dry":return"var(--lcars-almond)";case"fan_only":return"var(--lcars-african-violet)";default:return"var(--lcars-gray)"}}function c(e){switch(e){case"disarmed":return"var(--lcars-ice)";case"armed_home":case"armed_night":return"var(--lcars-sunflower)";case"armed_away":case"armed_vacation":return"var(--lcars-butterscotch)";case"armed_custom_bypass":return"var(--lcars-african-violet)";case"arming":case"pending":case"disarming":return"var(--lcars-gold)";case"triggered":return"var(--lcars-alert)";default:return"var(--lcars-disabled)"}}function d(e){if(null==e)return"var(--lcars-disabled)";switch(e){case"playing":return"var(--lcars-african-violet)";case"paused":case"buffering":return"var(--lcars-sunflower)";case"on":return"var(--lcars-data-accent)";default:return"var(--lcars-disabled)"}}function p(e,t="pool"){switch(e){case"heating":return"var(--lcars-butterscotch)";case"idle":return"spa"===t?"var(--lcars-sunflower)":"var(--lcars-ice)";default:return"var(--lcars-disabled)"}}function u(e){switch(e){case"sunny":return"var(--lcars-sunflower)";case"clear-night":return"var(--lcars-bluey)";case"partlycloudy":case"snowy-rainy":case"hail":return"var(--lcars-ice)";case"cloudy":case"fog":return"var(--lcars-gray)";case"rainy":case"pouring":default:return"var(--lcars-sky)";case"snowy":return"var(--lcars-space-white)";case"windy":case"windy-variant":return"var(--lcars-almond)";case"lightning":case"lightning-rainy":return"var(--lcars-gold)";case"exceptional":case"unavailable":return"var(--lcars-tomato)"}}function m(e,t=!1){if(t)return"var(--lcars-disabled)";switch(e){case"on":return"var(--lcars-ice)";case"off":return"var(--lcars-sunflower)";case"unavailable":return"var(--lcars-tomato)";default:return"var(--lcars-disabled)"}}function h(e){const t=Number(e);return Number.isFinite(t)?t<55?"cold":t<=67?"cool":t<=76?"nominal":t<=84?"warm":"hot":"nominal"}function f(e,t={}){const{lowMax:a=500,moderateMax:r=1500,highMax:i=3e3}=t;if(null==e||isNaN(e))return"var(--lcars-tomato)";const s=Math.abs(Number(e));return s<=0?"var(--lcars-gray)":s<=a?"var(--lcars-ice)":s<=r?"var(--lcars-sunflower)":s<=i?"var(--lcars-butterscotch)":"var(--lcars-tomato)"}function v(e,t={}){const{lowMax:a=500,moderateMax:r=1500,highMax:i=3e3}=t;if(null==e||isNaN(e))return"UNAVAILABLE";const s=Math.abs(Number(e));return s<=0?"STANDBY":s<=a?"LOW DRAW":s<=r?"MODERATE":s<=i?"HIGH DRAW":"CRITICAL"}function g(e,t=null){if(null==e||"unavailable"===e||"unknown"===e)return"var(--lcars-gray)";const a=String(e).toLowerCase();return a.includes("error")||a.includes("locked by error")?"var(--lcars-tomato)":a.includes("discharg")||a.includes("v2g")?"var(--lcars-ice)":a.includes("charg")&&!a.includes("waiting")?"var(--lcars-butterscotch)":a.includes("schedul")||a.includes("paused")?"var(--lcars-sunflower)":a.includes("disconnect")||a.includes("waiting for car")?"var(--lcars-gray)":null!=t&&!isNaN(t)&&Math.abs(Number(t))>.1?Number(t)<0?"var(--lcars-ice)":"var(--lcars-butterscotch)":"var(--lcars-lilac)"}function b(e){if(null==e||"unavailable"===e||"unknown"===e)return"UNAVAILABLE";const t=String(e).toLowerCase();return t.includes("error")?"FAULT":t.includes("discharg")||t.includes("v2g")?"V2G ACTIVE":t.includes("charg")&&!t.includes("waiting")?"CHARGING":t.includes("schedul")?"SCHEDULED":t.includes("paused")?"PAUSED":t.includes("disconnect")||t.includes("waiting for car")?"DISCONNECTED":t.includes("ready")||t.includes("waiting")?"STANDBY":"IDLE"}function y(e){if(null==e||"unavailable"===e)return"✕";const t=String(e).toLowerCase();return t.includes("error")?"✕":t.includes("discharg")||t.includes("v2g")?"▲":t.includes("charg")&&!t.includes("waiting")?"▼":t.includes("schedul")||t.includes("paused")?"◷":t.includes("disconnect")||t.includes("waiting for car")?"○":"━"}function _(e){if(null==e||isNaN(e))return"var(--lcars-gray)";const t=Number(e);return t<=15?"var(--lcars-tomato)":t<=40?"var(--lcars-butterscotch)":t<=80?"var(--lcars-sunflower)":"var(--lcars-ice)"}a.d(t,{HJ:()=>h,IO:()=>v,JQ:()=>u,MO:()=>_,N:()=>g,OX:()=>o,WG:()=>b,XI:()=>f,aK:()=>m,kR:()=>i,lG:()=>l,of:()=>c,qW:()=>p,sx:()=>s,t$:()=>y,uT:()=>d,xH:()=>r,z5:()=>n})},4532(e,t,a){var r=a(7349),i=a(2622);class s extends r.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object}}}set hass(e){this._hass=e}setConfig(e){this._config=e}static get styles(){return[i.Bx,r.AH`
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
        `]}render(){return r.qy`
        <button class="create-btn">
          <ha-icon icon="mdi:plus"></ha-icon>
          Add Custom Card
        </button>
      `}getCardSize(){return 1}}customElements.get("lcars-create-custom-card-card")||customElements.define("lcars-create-custom-card-card",s)},513(e,t,a){var r=a(7349),i=a(2622),s=a(8851),n=a(6940),o=a(5824);const l="Layout";class c extends r.WF{static get properties(){return{cards:{type:Array},_hass:{type:Object},_narrow:{type:Boolean},_selectedArea:{type:String},_selectedFloor:{type:String},_editMode:{type:Boolean},_audioMuted:{type:Boolean}}}constructor(){super(),this.cards=[],this._narrow=window.innerWidth<768,this._selectedArea=null,this._selectedFloor=null,this._editMode=!1,this._audioMuted=n.e.isMuted,this._elbowPressTimer=null,this._siteName=window.location.hostname.toUpperCase().replace(/\.LOCAL$/,""),this._readyPlayed=!1,this._resizeHandler=()=>{this._narrow=window.innerWidth<768}}connectedCallback(){super.connectedCallback(),window.addEventListener("resize",this._resizeHandler),s.g0.debug(l,"connectedCallback — layout mounted")}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("resize",this._resizeHandler),this._elbowPressTimer&&(clearTimeout(this._elbowPressTimer),this._elbowPressTimer=null),s.g0.debug(l,"disconnectedCallback — layout unmounted")}updated(e){super.updated(e),e.has("_editMode")&&(this._editMode?this.setAttribute("edit-mode",""):this.removeAttribute("edit-mode"))}setConfig(e){try{this._config=e,s.g0.debug(l,"setConfig",e)}catch(e){throw s.g0.error(l,"setConfig FAILED — this causes CONFIGURATION ERROR:",e),e}}set hass(e){const t=this._hass;this._hass=e,t||(s.g0.debug(l,"First hass received — cards:",this.cards?.length||0),(0,o.X)(e)),e?.config?.location_name&&(this._siteName=e.config.location_name.toUpperCase()),t&&t.areas!==e.areas&&this._selectedArea&&(e.areas?.[this._selectedArea]||(s.g0.debug(l,"Auto-deselecting deleted area:",this._selectedArea),this._selectedArea=null,s.o6.dispatchEvent(new CustomEvent("lcars-area-selected",{detail:{areaId:null}})))),t&&t.floors!==e.floors&&this._selectedFloor&&(e.floors?.[this._selectedFloor]||(s.g0.debug(l,"Auto-deselecting deleted floor:",this._selectedFloor),this._selectedFloor=null,s.o6.dispatchEvent(new CustomEvent("lcars-floor-selected",{detail:{floorId:null}})))),this.cards&&this.cards.forEach(t=>{t&&(t.hass=e)})}_toggleMute(){n.e.toggle(),this._audioMuted=n.e.isMuted}_selectArea(e){this._readyPlayed?n.e.play("navAcknowledge"):(this._readyPlayed=!0,n.e.play("ready")),this._selectedFloor&&(this._selectedFloor=null,s.o6.dispatchEvent(new CustomEvent("lcars-floor-selected",{detail:{floorId:null}}))),this._selectedArea=this._selectedArea===e?null:e,s.g0.debug(l,"Area selected:",this._selectedArea||"(deselected)"),s.o6.dispatchEvent(new CustomEvent("lcars-area-selected",{detail:{areaId:this._selectedArea}}))}_selectFloor(e){n.e.play("navAcknowledge"),this._selectedArea&&(this._selectedArea=null,s.o6.dispatchEvent(new CustomEvent("lcars-area-selected",{detail:{areaId:null}}))),this._selectedFloor=this._selectedFloor===e?null:e,s.g0.debug(l,"Floor selected:",this._selectedFloor||"(deselected)"),s.o6.dispatchEvent(new CustomEvent("lcars-floor-selected",{detail:{floorId:this._selectedFloor}}))}_toggleEditMode(){this._hass?.user?.is_admin&&(n.e.play("toggle"),this._editMode=!this._editMode,s.g0.info(l,"Edit mode:",this._editMode?"ENABLED":"DISABLED"),s.o6.dispatchEvent(new CustomEvent("lcars-edit-mode",{detail:{enabled:this._editMode}})))}_openSidebarReorder(){if(!this._hass?.user?.is_admin)return;let e=this.shadowRoot.querySelector("lcars-sidebar-reorder");e||(e=document.createElement("lcars-sidebar-reorder"),this.shadowRoot.appendChild(e)),e.hass=this._hass,e.open()}_handleElbowPointerDown(e){this._hass?.user?.is_admin&&(e.preventDefault(),this._elbowPressTimer=setTimeout(()=>{this._toggleEditMode(),this._elbowPressTimer=null},800))}_handleElbowPointerUp(){this._elbowPressTimer&&(clearTimeout(this._elbowPressTimer),this._elbowPressTimer=null)}_editHeaderTitle(){this._editMode&&this._hass&&(n.e.play("acknowledge"),(0,s.Bo)(this._hass,"lcars-edit-homepage-header-card",{},"Edit Header"))}_getAreas(){return this._hass&&this._hass.areas?Object.values(this._hass.areas):[]}_getAreasGroupedByFloor(){const e=this._getAreas(),t=this._hass?.floors?Object.values(this._hass.floors):[],a=new Map;for(const e of t)a.set(e.floor_id,{...e,areas:[]});const r=[];for(const t of e){const e=t.floor_id;e&&a.has(e)?a.get(e).areas.push(t):r.push(t)}const i=[...a.values()].filter(e=>e.areas.length>0).sort((e,t)=>(e.level??99)-(t.level??99)||e.name.localeCompare(t.name)).map(e=>({floor:{floor_id:e.floor_id,name:e.name,icon:e.icon,level:e.level},areas:e.areas}));return r.length>0&&i.push({floor:null,areas:r}),i}static get styles(){return[i.Bx,r.AH`
        :host {
          display: block;
          height: calc(100vh - var(--header-height, 0px));
          overflow: hidden;
          box-sizing: border-box;
          background: var(--lcars-bg);
          padding: var(--lcars-gap);
        }

        /* ─── Skip Navigation Link (GEO-006) ─── */
        .skip-nav {
          position: absolute;
          left: -9999px;
          top: auto;
          width: 1px;
          height: 1px;
          overflow: hidden;
          z-index: 1000;
          background: var(--lcars-gold);
          color: var(--lcars-black);
          padding: 0.5rem 1rem;
          font-family: var(--lcars-font);
          font-size: var(--lcars-font-size-data);
          text-decoration: none;
          border-radius: 0 0 var(--lcars-btn-radius) var(--lcars-btn-radius);
        }
        .skip-nav:focus {
          position: fixed;
          left: 50%;
          top: 0;
          transform: translateX(-50%);
          width: auto;
          height: auto;
          z-index: 1000;
        }

        /* ─── LCARS Frame Grid ─── */
        .lcars-frame {
          display: grid;
          grid-template-columns: var(--lcars-sidebar-w) 1fr;
          grid-template-rows: var(--lcars-elbow-h) 1fr var(--lcars-elbow-h);
          gap: var(--lcars-gap) var(--lcars-gap);
          height: 100%;
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
          gap: var(--lcars-gap);
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
          border-radius: 0;
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
          letter-spacing: 0.05em;
        }

        /* ─── Header Action Buttons (shared) ─── */
        .configure-btn,
        .mute-btn {
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
        .configure-btn:hover,
        .mute-btn:hover { filter: brightness(0.8); }
        .configure-btn:focus-visible,
        .mute-btn:focus-visible {
          outline: 2px solid var(--lcars-ice);
          outline-offset: 2px;
        }
        .configure-btn ha-icon,
        .mute-btn ha-icon { --mdc-icon-size: 18px; }

        /* ─── Sidebar ─── */
        .lcars-sidebar {
          grid-column: 1;
          grid-row: 2;
          display: flex;
          flex-direction: column;
          gap: var(--lcars-gap);
          overflow: hidden;
          min-height: 0;
        }

        .lcars-sidebar-panel {
          background: var(--lcars-sidebar-bg);
          padding: 0.25rem 0.5rem;
          font-size: var(--lcars-font-size-data);
          color: var(--lcars-black);
          text-transform: uppercase;
          text-align: right;
          flex-shrink: 0;
          border-radius: 0 0 0 var(--lcars-btn-radius);
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
        }

        .lcars-sidebar-areas::-webkit-scrollbar { width: 4px; }
        .lcars-sidebar-areas::-webkit-scrollbar-track { background: transparent; }
        .lcars-sidebar-areas::-webkit-scrollbar-thumb { background: var(--lcars-gray); border-radius: 2px; }

        /* Structural filler — fills dead space below nav buttons with LCARS gray panel.
           Grows to fill remaining sidebar height when buttons are few;
           collapses to 0px when buttons overflow (scroll case). */
        .lcars-sidebar-areas::after {
          content: '';
          display: block;
          flex: 1 0 0px;
          min-height: 0;
          background: var(--lcars-gray);
          border-radius: var(--lcars-btn-radius) 0 0 0;
          width: calc(100% - 0.25rem);
        }

        .sidebar-area-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--lcars-african-violet);
          color: var(--lcars-black);
          border: none;
          border-radius: var(--lcars-btn-radius) 0 0 var(--lcars-btn-radius);
          height: var(--lcars-btn-height);
          padding: 0 0.75rem 0 1rem;
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
          border-radius: var(--lcars-btn-radius) 0 0 var(--lcars-btn-radius);
          height: calc(var(--lcars-btn-height) * 0.7);
          padding: 0 0.75rem 0 1rem;
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
          padding: 0.5rem;
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
          border-radius: 0;
          flex-shrink: 0;
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

          .lcars-sidebar-areas::after {
            display: none;
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

          .lcars-sidebar-areas::after {
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
      `]}render(){const e=this._getAreasGroupedByFloor();return r.qy`
      <a class="skip-nav" href="#lcars-main-content" @click=${e=>{e.preventDefault(),this.shadowRoot.getElementById("lcars-main-content")?.focus()}}>Skip to content</a>
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
            >${this._editMode?`${this._siteName} · CONFIGURATION MODE`:this._siteName}</span>
          <div class="lcars-header-bar" aria-hidden="true"></div>
          <div class="lcars-header-endcap">
            <button class="mute-btn"
              role="switch"
              aria-checked=${!this._audioMuted}
              aria-label="Dashboard sounds"
              @click=${()=>this._toggleMute()}>
              <ha-icon .icon=${this._audioMuted?"mdi:volume-off":"mdi:volume-high"}></ha-icon>
            </button>
            ${this._hass?.user?.is_admin?r.qy`
              <button class="configure-btn"
                aria-label="Reorder sidebar dashboards"
                @click=${()=>this._openSidebarReorder()}>
                <ha-icon .icon=${"mdi:sort-variant"}></ha-icon>
              </button>
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
            ${e.map(({floor:e,areas:t})=>r.qy`
              ${e?r.qy`
                <button class="sidebar-floor-btn"
                  ?data-active=${this._selectedFloor===e.floor_id}
                  aria-pressed=${this._selectedFloor===e.floor_id}
                  @click=${()=>this._selectFloor(e.floor_id)}>
                  <ha-icon .icon=${e.icon||"mdi:home-floor-1"}></ha-icon>
                  <span class="floor-name">${e.name}</span>
                </button>
              `:r.qy`
                <span class="sidebar-unassigned-label">Unassigned</span>
              `}
              ${t.map(e=>r.qy`
                <button class="sidebar-area-btn"
                  title="${e.name}"
                  ?data-active=${this._selectedArea===e.area_id}
                  aria-pressed=${this._selectedArea===e.area_id}
                  aria-label="${e.name}"
                  @click=${()=>this._selectArea(e.area_id)}>
                  <ha-icon .icon=${e.icon||"mdi:home-outline"}></ha-icon>
                  <span class="area-name">${e.name}</span>
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
        <main class="lcars-content" id="lcars-main-content" aria-label="Dashboard content">
          ${this.cards&&this.cards.length>0?this.cards.map(e=>r.qy`${e}`):r.qy`<div class="lcars-heading">No data available</div>`}
        </main>

        <!-- Bottom-Left Elbow -->
        <div class="lcars-elbow-bottom" aria-hidden="true"></div>

        <!-- Footer Bar -->
        <div class="lcars-footer" role="contentinfo">
          <div class="lcars-footer-bar" aria-hidden="true"></div>
          <span class="lcars-footer-text">LCARS ${a(8330).version}</span>
          <div class="lcars-footer-endcap" aria-hidden="true"></div>
        </div>
      </div>
    `}}const d=Promise.race([customElements.whenDefined("hui-masonry-view"),new Promise(e=>setTimeout(e,5e3))]);s.g0.debug(l,"Waiting for hui-masonry-view (5s timeout)..."),d.then(()=>{if(customElements.get("lcars-dashboard-layout"))s.g0.warn(l,"lcars-dashboard-layout already registered — skipping");else{customElements.define("lcars-dashboard-layout",c);const e=a(8330);s.g0.info(l,`v${e.version} registered`),console.info(`%c LCARS-DASHBOARD \n%c Version ${e.version}`,"color: #ff9966; font-weight: bold; background: black","color: #f5f6fa; font-weight: bold; background: #333")}}).catch(e=>{s.g0.error(l,"Failed to register lcars-dashboard-layout:",e)})},1406(e,t,a){a(8851).g0.info("Bundle","JS bundle loaded at",(new Date).toISOString())},4113(e,t,a){var r=a(7349),i=a(2622),s=a(8851);class n extends r.WF{static get properties(){return{_hass:{type:Object},_selectedDomain:{type:String}}}constructor(){super(),this._selectedDomain=null}set hass(e){this._hass=e}setConfig(e){this._config=e}_getDomainGroups(){if(!this._hass||!this._hass.states)return{};const e={};Object.keys(this._hass.states).forEach(t=>{const a=t.split(".")[0];e[a]||(e[a]=[]),e[a].push(t)});const t={};return Object.keys(e).sort().forEach(a=>{t[a]=e[a]}),t}_getDomainIcon(e){return{light:"mdi:lightbulb-group",switch:"mdi:toggle-switch-outline",sensor:"mdi:eye",binary_sensor:"mdi:radiobox-blank",climate:"mdi:thermostat",cover:"mdi:window-shutter",fan:"mdi:fan",lock:"mdi:lock",camera:"mdi:video",media_player:"mdi:cast",automation:"mdi:robot",script:"mdi:script-text",person:"mdi:account",input_boolean:"mdi:toggle-switch",input_number:"mdi:ray-vertex",input_select:"mdi:format-list-bulleted",input_text:"mdi:form-textbox",scene:"mdi:palette",group:"mdi:google-circles-communities",timer:"mdi:timer-outline",counter:"mdi:counter",weather:"mdi:weather-partly-cloudy",vacuum:"mdi:robot-vacuum",water_heater:"mdi:water-boiler"}[e]||"mdi:devices"}_toggleDomain(e){this._selectedDomain=this._selectedDomain===e?null:e}_handleEntityClick(e){(0,s.Hv)(e)}static get styles(){return[i.Bx,r.AH`
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
        `]}render(){if(!this._hass)return r.qy``;const e=this._getDomainGroups(),t=Object.keys(e);return r.qy`
        <div class="divider">
          <span class="divider-label">Devices</span>
          <div class="divider-line"></div>
        </div>

        <div class="domain-list">
          ${t.map(t=>r.qy`
            <button
              class="domain-btn"
              ?data-active=${this._selectedDomain===t}
              @click=${()=>this._toggleDomain(t)}
              aria-expanded=${this._selectedDomain===t}
            >
              <ha-icon .icon=${this._getDomainIcon(t)}></ha-icon>
              <span class="domain-name">${t.replace(/_/g," ")}</span>
              <span class="domain-count">${e[t].length}</span>
            </button>

            <div class="domain-entities" ?data-open=${this._selectedDomain===t}>
              ${this._selectedDomain===t?r.qy`
                    <div class="entity-list">
                      ${e[t].map(e=>{const a=this._hass.states[e];if(!a)return"";const i="off"===a.state||"unavailable"===a.state||"unknown"===a.state,s=a.attributes?.friendly_name||e.split(".").pop().replace(/_/g," ");return r.qy`
                          <button
                            class="entity-item"
                            ?data-off=${i}
                            @click=${()=>this._handleEntityClick(e)}
                            title="${s}: ${a.state}"
                          >
                            <ha-icon .icon=${a.attributes?.icon||this._getDomainIcon(t)}></ha-icon>
                            <span class="entity-item-name">${s}</span>
                            <span class="entity-item-state">${a.state}</span>
                          </button>
                        `})}
                    </div>
                  `:""}
            </div>
          `)}
        </div>
      `}getCardSize(){return 8}}customElements.get("devices-card")||customElements.define("devices-card",n)},772(e,t,a){var r=a(7349),i=a(2622),s=a(8851);const n=r.AH`
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
`;class o extends r.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object}}}set hass(e){this._hass=e}setConfig(e){this._config=e}async _save(){if(this._hass)try{await this._hass.callWS({type:"lcars_dashboard/area_button/set",...this._getFormData()}),(0,s.rC)("lcars_dashboard_reload")}catch(e){console.error("LCARS Edit: Save failed",e)}}_getFormData(){const e=this.shadowRoot.querySelectorAll(".edit-input");return{name:e[0]?.value,icon:e[1]?.value}}static get styles(){return[i.Bx,n]}render(){return r.qy`
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
      `}getCardSize(){return 3}}customElements.get("lcars-edit-area-button-card")||customElements.define("lcars-edit-area-button-card",o)},7411(e,t,a){var r=a(7349),i=a(2622),s=a(8851);const n=r.AH`
  :host { display: block; }
  .edit-container { display: flex; flex-direction: column; gap: var(--lcars-gap); padding: 0.5rem 0; }
  .edit-field { display: flex; flex-direction: column; gap: 0.25rem; }
  .edit-label { font-family: var(--lcars-font); font-size: 0.625rem; color: var(--lcars-gray); text-transform: uppercase; }
  .edit-input { height: 2.5rem; padding: 0 0.75rem; background: var(--lcars-ice); color: var(--lcars-black); border: none; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; outline: none; }
  .edit-input:focus { box-shadow: 0 0 0 2px var(--lcars-btn-active); }
  .edit-actions { display: flex; gap: var(--lcars-gap); padding-top: 0.5rem; }
  .action-btn { flex: 1; height: var(--lcars-btn-height); background: var(--lcars-butterscotch); color: var(--lcars-black); border: none; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; cursor: pointer; transition: filter var(--lcars-transition); user-select: none; }
  .action-btn:hover { filter: brightness(1.2); }
`;class o extends r.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object}}}set hass(e){this._hass=e}setConfig(e){this._config=e}async _save(){if(this._hass)try{await this._hass.callWS({type:"lcars_dashboard/device_button/set",...this._getFormData()}),(0,s.rC)("lcars_dashboard_reload")}catch(e){console.error("LCARS Edit: Save failed",e)}}_getFormData(){const e=this.shadowRoot.querySelectorAll(".edit-input");return{device:e[0]?.value,name:e[1]?.value,icon:e[2]?.value}}static get styles(){return[i.Bx,n]}render(){return r.qy`
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
      `}getCardSize(){return 4}}customElements.get("lcars-edit-device-button-card")||customElements.define("lcars-edit-device-button-card",o)},1053(e,t,a){var r=a(7349),i=a(2622),s=a(8851);const n=r.AH`
  :host { display: block; }
  .edit-container { display: flex; flex-direction: column; gap: var(--lcars-gap); padding: 0.5rem 0; }
  .edit-field { display: flex; flex-direction: column; gap: 0.25rem; }
  .edit-label { font-family: var(--lcars-font); font-size: 0.625rem; color: var(--lcars-gray); text-transform: uppercase; }
  .edit-input { height: 2.5rem; padding: 0 0.75rem; background: var(--lcars-ice); color: var(--lcars-black); border: none; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; outline: none; }
  .edit-input:focus { box-shadow: 0 0 0 2px var(--lcars-btn-active); }
  .edit-actions { display: flex; gap: var(--lcars-gap); padding-top: 0.5rem; }
  .action-btn { flex: 1; height: var(--lcars-btn-height); background: var(--lcars-butterscotch); color: var(--lcars-black); border: none; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; cursor: pointer; transition: filter var(--lcars-transition); user-select: none; }
  .action-btn:hover { filter: brightness(1.2); }
`;class o extends r.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object}}}set hass(e){this._hass=e}setConfig(e){this._config=e}async _save(){if(this._hass)try{await this._hass.callWS({type:"lcars_dashboard/device_card/set",...this._getFormData()}),(0,s.rC)("lcars_dashboard_reload")}catch(e){console.error("LCARS Edit: Save failed",e)}}_getFormData(){const e=this.shadowRoot.querySelectorAll(".edit-input");return{device:e[0]?.value,name:e[1]?.value}}static get styles(){return[i.Bx,n]}render(){return r.qy`
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
      `}getCardSize(){return 3}}customElements.get("lcars-edit-device-card-card")||customElements.define("lcars-edit-device-card-card",o)},5603(e,t,a){var r=a(7349),i=a(2622),s=a(8851);const n=r.AH`
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
`;class o extends r.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object}}}set hass(e){this._hass=e}setConfig(e){this._config=e}async _save(){if(this._hass)try{await this._hass.callWS({type:"lcars_dashboard/device_popup/set",...this._getFormData()}),(0,s.rC)("lcars_dashboard_reload")}catch(e){console.error("LCARS Edit: Save failed",e)}}_getFormData(){const e=this.shadowRoot.querySelector(".edit-input")?.value,t=this.shadowRoot.querySelector(".edit-textarea")?.value;return{device:e,yaml_config:t}}static get styles(){return[i.Bx,n]}render(){return r.qy`
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
      `}getCardSize(){return 5}}customElements.get("lcars-edit-device-popup-card")||customElements.define("lcars-edit-device-popup-card",o)},1568(e,t,a){var r=a(7349),i=a(2622),s=a(8851);const n=r.AH`
  :host { display: block; }
  .edit-container { display: flex; flex-direction: column; gap: var(--lcars-gap); padding: 0.5rem 0; }
  .edit-field { display: flex; flex-direction: column; gap: 0.25rem; }
  .edit-label { font-family: var(--lcars-font); font-size: 0.625rem; color: var(--lcars-gray); text-transform: uppercase; }
  .edit-input { height: 2.5rem; padding: 0 0.75rem; background: var(--lcars-ice); color: var(--lcars-black); border: none; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; outline: none; }
  .edit-input:focus { box-shadow: 0 0 0 2px var(--lcars-btn-active); }
  .edit-actions { display: flex; gap: var(--lcars-gap); padding-top: 0.5rem; }
  .action-btn { flex: 1; height: var(--lcars-btn-height); background: var(--lcars-butterscotch); color: var(--lcars-black); border: none; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; cursor: pointer; transition: filter var(--lcars-transition); user-select: none; }
  .action-btn:hover { filter: brightness(1.2); }
`;class o extends r.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object}}}set hass(e){this._hass=e}setConfig(e){this._config=e}async _save(){if(this._hass)try{await this._hass.callWS({type:"lcars_dashboard/entity_card/set",...this._getFormData()}),(0,s.rC)("lcars_dashboard_reload")}catch(e){console.error("LCARS Edit: Save failed",e)}}_getFormData(){const e=this.shadowRoot.querySelectorAll(".edit-input");return{entity:e[0]?.value,name:e[1]?.value}}static get styles(){return[i.Bx,n]}render(){return r.qy`
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
      `}getCardSize(){return 3}}customElements.get("lcars-edit-entity-card-card")||customElements.define("lcars-edit-entity-card-card",o)},145(e,t,a){var r=a(7349),i=a(2622),s=a(8851);const n=r.AH`
  :host { display: block; }
  .edit-container { display: flex; flex-direction: column; gap: var(--lcars-gap); padding: 0.5rem 0; }
  .edit-field { display: flex; flex-direction: column; gap: 0.25rem; }
  .edit-label { font-family: var(--lcars-font); font-size: 0.625rem; color: var(--lcars-gray); text-transform: uppercase; }
  .edit-input { height: 2.5rem; padding: 0 0.75rem; background: var(--lcars-ice); color: var(--lcars-black); border: none; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; outline: none; }
  .edit-input:focus { box-shadow: 0 0 0 2px var(--lcars-btn-active); }
  .edit-actions { display: flex; gap: var(--lcars-gap); padding-top: 0.5rem; }
  .action-btn { flex: 1; height: var(--lcars-btn-height); background: var(--lcars-butterscotch); color: var(--lcars-black); border: none; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; cursor: pointer; transition: filter var(--lcars-transition); user-select: none; }
  .action-btn:hover { filter: brightness(1.2); }
`;class o extends r.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object}}}set hass(e){this._hass=e}setConfig(e){this._config=e}async _save(){if(this._hass)try{await this._hass.callWS({type:"lcars_dashboard/entity/set",...this._getFormData()}),(0,s.rC)("lcars_dashboard_reload")}catch(e){console.error("LCARS Edit: Save failed",e)}}_getFormData(){const e=this.shadowRoot.querySelectorAll(".edit-input");return{entity:e[0]?.value,icon:e[1]?.value,name:e[2]?.value}}static get styles(){return[i.Bx,n]}render(){return r.qy`
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
      `}getCardSize(){return 4}}customElements.get("lcars-edit-entity-card")||customElements.define("lcars-edit-entity-card",o)},1540(e,t,a){var r=a(7349),i=a(2622),s=a(8851);const n=r.AH`
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
`;class o extends r.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object}}}set hass(e){this._hass=e}setConfig(e){this._config=e}async _save(){if(this._hass)try{await this._hass.callWS({type:"lcars_dashboard/entity_popup/set",...this._getFormData()}),(0,s.rC)("lcars_dashboard_reload")}catch(e){console.error("LCARS Edit: Save failed",e)}}_getFormData(){const e=this.shadowRoot.querySelector(".edit-input")?.value,t=this.shadowRoot.querySelector(".edit-textarea")?.value;return{entity:e,yaml_config:t}}static get styles(){return[i.Bx,n]}render(){return r.qy`
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
      `}getCardSize(){return 5}}customElements.get("lcars-edit-entity-popup-card")||customElements.define("lcars-edit-entity-popup-card",o)},6586(e,t,a){var r=a(7349),i=a(2622),s=a(8851);const n=r.AH`
  :host { display: block; }
  .edit-container { display: flex; flex-direction: column; gap: var(--lcars-gap); padding: 0.5rem 0; }
  .edit-field { display: flex; flex-direction: column; gap: 0.25rem; }
  .edit-label { font-family: var(--lcars-font); font-size: 0.625rem; color: var(--lcars-gray); text-transform: uppercase; }
  .edit-input { height: 2.5rem; padding: 0 0.75rem; background: var(--lcars-ice); color: var(--lcars-black); border: none; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; outline: none; }
  .edit-input:focus { box-shadow: 0 0 0 2px var(--lcars-btn-active); }
  .edit-actions { display: flex; gap: var(--lcars-gap); padding-top: 0.5rem; }
  .action-btn { flex: 1; height: var(--lcars-btn-height); background: var(--lcars-butterscotch); color: var(--lcars-black); border: none; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; cursor: pointer; transition: filter var(--lcars-transition); user-select: none; }
  .action-btn:hover { filter: brightness(1.2); }
`;class o extends r.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object}}}set hass(e){this._hass=e}setConfig(e){this._config=e}async _save(){if(this._hass)try{await this._hass.callWS({type:"lcars_dashboard/homepage_header/set",...this._getFormData()}),(0,s.rC)("lcars_dashboard_reload")}catch(e){console.error("LCARS Edit: Save failed",e)}}_getFormData(){const e=this.shadowRoot.querySelectorAll(".edit-input");return{title:e[0]?.value,subtitle:e[1]?.value}}static get styles(){return[i.Bx,n]}render(){return r.qy`
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
      `}getCardSize(){return 3}}customElements.get("lcars-edit-homepage-header-card")||customElements.define("lcars-edit-homepage-header-card",o)},3033(e,t,a){var r=a(7349),i=a(2622),s=a(8851);class n extends r.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object}}}set hass(e){this._hass=e}setConfig(e){this._config=e}async _save(e){if(this._hass)try{await this._hass.callWS({type:"lcars_dashboard/more_page/set",...e}),(0,s.rC)("lcars_dashboard_reload")}catch(e){console.error("LCARS Edit: Failed to save more-page",e)}}static get styles(){return[i.Bx,r.AH`
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
        `]}render(){return r.qy`
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
      `}getCardSize(){return 3}}customElements.get("lcars-edit-more-page-card")||customElements.define("lcars-edit-more-page-card",n)},5414(e,t,a){var r=a(7349),i=a(2622),s=a(8851),n=a(4867);const o=r.AH`
  :host { display: block; }
  .edit-container { display: flex; flex-direction: column; gap: var(--lcars-gap); padding: 0.5rem 0; }
  .edit-label { font-family: var(--lcars-font); font-size: 0.625rem; color: var(--lcars-gray); text-transform: uppercase; }

  /* Visual layout preview */
  .layout-preview {
    display: flex; flex-direction: column; gap: 2px;
    background: rgba(255,255,255,0.03);
    border: 1px solid var(--lcars-gray);
    border-radius: 0.25rem;
    padding: 0.375rem;
    min-height: 6rem;
  }
  .layout-fullwidth { display: flex; flex-direction: column; gap: 2px; }
  .layout-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 0.375rem; }
  .layout-col { display: flex; flex-direction: column; gap: 2px; }
  .layout-col-label {
    font-family: var(--lcars-font); font-size: 0.5rem;
    color: var(--lcars-gray); text-transform: uppercase;
    text-align: center; padding-bottom: 0.125rem;
    border-bottom: 1px solid var(--lcars-gray); opacity: 0.5;
    margin-bottom: 0.125rem;
  }

  /* Panel items in layout */
  .panel-item {
    display: flex; align-items: center; gap: 0.375rem;
    padding: 0.375rem 0.5rem; min-height: 2rem;
    background: var(--lcars-disabled); color: var(--lcars-space-white);
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    font-family: var(--lcars-font); font-size: var(--lcars-font-size-data);
    text-transform: uppercase; cursor: pointer;
    transition: background var(--lcars-transition);
    user-select: none;
  }
  .panel-item:hover { background: var(--lcars-gray); }
  .panel-item.selected { background: var(--lcars-butterscotch); color: var(--lcars-black); }
  .panel-item.locked { opacity: 0.6; cursor: default; }
  .panel-item.locked.selected { background: var(--lcars-gold); color: var(--lcars-black); opacity: 1; }
  .panel-item-label { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.75rem; }
  .panel-item-type { font-size: 0.5rem; opacity: 0.5; }
  .panel-item-index { font-size: 0.5rem; opacity: 0.5; min-width: 1rem; }
  .panel-item-lock { font-size: 0.5rem; opacity: 0.5; }

  /* Action buttons */
  .edit-actions { display: flex; gap: var(--lcars-gap); padding-top: 0.25rem; flex-wrap: wrap; }
  .action-btn {
    flex: 1; min-width: 3.5rem; height: 2.5rem;
    background: var(--lcars-butterscotch); color: var(--lcars-black); border: none;
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    font-family: var(--lcars-font); font-size: var(--lcars-font-size-data);
    text-transform: uppercase; cursor: pointer;
    transition: filter var(--lcars-transition); user-select: none;
  }
  .action-btn:hover { filter: brightness(1.2); }
  .action-btn:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
  .action-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .action-btn.reset { background: var(--lcars-gray); color: var(--lcars-space-white); }
  .action-btn.column { background: var(--lcars-ice); color: var(--lcars-black); }
`;class l extends r.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object},_order:{type:Array},_columnOverrides:{type:Object},_selected:{type:String}}}set hass(e){this._hass=e}setConfig(e){this._config=e;const t=e?.panels||[];this._order=t.map(e=>e.panelId),this._columnOverrides={...e?.column_overrides||{}},this._selected=e?.panel_id||t[0]?.panelId||""}_getPanelInfo(e){return(this._config?.panels||[]).find(t=>t.panelId===e)}_isIllumination(e){const t=this._getPanelInfo(e);return t?.panelType===n.sv}_getColumn(e){if(this._isIllumination(e))return"full";const t=this._getPanelInfo(e);return this._columnOverrides[e]||this._columnOverrides[t?.panelType]||n.uC[t?.panelType]||"left"}_getLabel(e){const t=this._getPanelInfo(e);return t?t.label||t.panelType.replace(/_/g," "):e}_select(e){this._selected=e}_moveUp(){const e=this._getColumn(this._selected),t=this._order.filter(t=>this._getColumn(t)===e),a=t.indexOf(this._selected);if(a<=0)return;const r=this._order.indexOf(this._selected),i=this._order.indexOf(t[a-1]),s=[...this._order];[s[i],s[r]]=[s[r],s[i]],this._order=s}_moveDown(){const e=this._getColumn(this._selected),t=this._order.filter(t=>this._getColumn(t)===e),a=t.indexOf(this._selected);if(a<0||a>=t.length-1)return;const r=this._order.indexOf(this._selected),i=this._order.indexOf(t[a+1]),s=[...this._order];[s[r],s[i]]=[s[i],s[r]],this._order=s}_moveLeft(){this._isIllumination(this._selected)||"left"!==this._getColumn(this._selected)&&(this._columnOverrides={...this._columnOverrides,[this._selected]:"left"})}_moveRight(){this._isIllumination(this._selected)||"right"!==this._getColumn(this._selected)&&(this._columnOverrides={...this._columnOverrides,[this._selected]:"right"})}async _save(){if(this._hass&&this._config?.area_id)try{await this._hass.callWS({type:"lcars_dashboard/panel_order/set",area_id:this._config.area_id,panel_order:JSON.stringify(this._order)});const e={};for(const[t,a]of Object.entries(this._columnOverrides)){const r=this._getPanelInfo(t);a!==(n.uC[r?.panelType]||"left")&&(e[t]=a)}await this._hass.callWS({type:"lcars_dashboard/panel_column/set",area_id:this._config.area_id,panel_columns:JSON.stringify(e)}),(0,s.rC)("lcars_dashboard_reload")}catch(e){console.error("LCARS Edit: Panel layout save failed",e)}}async _reset(){if(this._hass&&this._config?.area_id)try{await this._hass.callWS({type:"lcars_dashboard/panel_order/set",area_id:this._config.area_id,panel_order:JSON.stringify([])}),await this._hass.callWS({type:"lcars_dashboard/panel_column/set",area_id:this._config.area_id,panel_columns:JSON.stringify({})});const e=this._config?.panels||[];this._order=e.map(e=>e.panelId),this._columnOverrides={},(0,s.rC)("lcars_dashboard_reload")}catch(e){console.error("LCARS Edit: Panel layout reset failed",e)}}static get styles(){return[i.Bx,o]}_renderPanelItem(e,t){const a=e===this._selected,i=this._isIllumination(e),s=this._getPanelInfo(e),n=s?.panelType?.replace(/_/g," ")||"",o=this._getLabel(e),l=s?.deviceId&&o.toLowerCase()!==n.toLowerCase();return r.qy`
      <div class="panel-item ${a?"selected":""} ${i?"locked":""}"
        role="option" aria-selected="${a}"
        @click=${()=>this._select(e)}>
        <span class="panel-item-index">${t+1}</span>
        <span class="panel-item-label">${o}</span>
        ${l?r.qy`<span class="panel-item-type">${n}</span>`:""}
        ${i?r.qy`<span class="panel-item-lock">&#128274;</span>`:""}
      </div>
    `}render(){const e=this._selected,t=this._getColumn(e),a=this._isIllumination(e),i=this._order.filter(e=>"full"===this._getColumn(e)),s=this._order.filter(e=>"left"===this._getColumn(e)),n=this._order.filter(e=>"right"===this._getColumn(e)),o="full"===t?i:"left"===t?s:n,l=o.indexOf(e),c=l>0&&!a,d=l>=0&&l<o.length-1&&!a,p="right"===t&&!a,u="left"===t&&!a;return r.qy`
      <div class="edit-container">
        <span class="edit-label">PANEL LAYOUT — ${this._config?.area_id?.replace(/_/g," ")||""}</span>

        <div class="layout-preview" role="listbox" aria-label="Panel layout">
          ${i.length>0?r.qy`
            <div class="layout-fullwidth">
              ${i.map((e,t)=>this._renderPanelItem(e,t))}
            </div>
          `:""}
          <div class="layout-columns">
            <div class="layout-col">
              <div class="layout-col-label">LEFT</div>
              ${s.length>0?s.map((e,t)=>this._renderPanelItem(e,t)):r.qy`<div class="panel-item" style="opacity:0.2;cursor:default">— EMPTY —</div>`}
            </div>
            <div class="layout-col">
              <div class="layout-col-label">RIGHT</div>
              ${n.length>0?n.map((e,t)=>this._renderPanelItem(e,t)):r.qy`<div class="panel-item" style="opacity:0.2;cursor:default">— EMPTY —</div>`}
            </div>
          </div>
        </div>

        <div class="edit-actions">
          <button class="action-btn" ?disabled=${!c} @click=${this._moveUp}>&#9650; Up</button>
          <button class="action-btn" ?disabled=${!d} @click=${this._moveDown}>&#9660; Down</button>
          <button class="action-btn column" ?disabled=${!p} @click=${this._moveLeft}>&#9664; Left</button>
          <button class="action-btn column" ?disabled=${!u} @click=${this._moveRight}>&#9654; Right</button>
        </div>
        <div class="edit-actions">
          <button class="action-btn" @click=${this._save}>Save</button>
          <button class="action-btn reset" @click=${this._reset}>Reset</button>
        </div>
      </div>
    `}getCardSize(){return 5}}customElements.get("lcars-edit-panel-order-card")||customElements.define("lcars-edit-panel-order-card",l)},5316(e,t,a){var r=a(7349),i=a(8851),s=a(2622),n=a(7597),o=a(6930),l=a(4867),c=a(9411);a(6564);const d="storage",p="circuits",u=new Set(["battery","power","energy","voltage","current"]);class m extends r.WF{static get properties(){return{hass:{type:Object},_config:{type:Object},filter:{type:String}}}constructor(){super(),this.hass=null,this._config={},this.filter="all",this._entityCache=new Map,this._onFilter=e=>{this.filter=e.detail.filter}}connectedCallback(){super.connectedCallback(),i.o6.addEventListener("lcars-eng-filter",this._onFilter)}disconnectedCallback(){super.disconnectedCallback(),i.o6.removeEventListener("lcars-eng-filter",this._onFilter)}setConfig(e){this._config=e||{}}set hass(e){const t=this._hass;this._hass=e,e&&t!==e&&(this._entityCache.clear(),this.requestUpdate("hass",t))}get hass(){return this._hass}getCardSize(){return 12}_getAreasWithPower(){if(!this._hass)return[];const e=(0,n.Qn)(this._hass),t=(0,n.E3)(this._hass),a=[];for(const r of e){const e=t.get(r.floor_id)||[],i=[];for(const t of e){const e=this._resolveArea(t);e&&i.push(e)}i.length>0&&a.push({floor:r,areas:i})}const r=t.get(null)||[],i=[];for(const e of r){const t=this._resolveArea(e);t&&i.push(t)}return i.length>0&&a.push({floor:null,areas:i}),a}_resolveArea(e){const t=(0,o.d6)(this._hass,e.area_id,this._entityCache),a=[],r=new Map;for(const e of t){const i=e.entity_id.split(".")[0],s=this._hass.states?.[e.entity_id];if(!s)continue;const n={entity:e,domain:i,state:s};if((0,l.JM)(n))continue;const o=s.attributes?.device_class||"";if(!u.has(o))continue;const c=e.device_id;if("battery"===o&&c)r.has(c)?(r.get(c).battery=n,r.get(c).entities.push(n)):r.set(c,{battery:n,entities:[n],device:this._hass?.devices?.[c]});else if(c&&r.has(c))r.get(c).entities.push(n);else if("battery"!==o||c){let e=!1;if(c)for(const a of t)if(a.device_id===c){const t=this._hass.states?.[a.entity_id];if("battery"===t?.attributes?.device_class){r.has(c)||r.set(c,{battery:null,entities:[],device:this._hass?.devices?.[c]}),r.get(c).entities.push(n),e=!0;break}}e||a.push(n)}else a.push(n)}const i=[],s=[];for(const[t,a]of r)a.battery&&(a.entities.some(e=>{const t=(this._hass?.states?.[e.entity?.entity_id]||e.state)?.attributes?.device_class;return"power"===t||"energy"===t||"voltage"===t||"current"===t})?i.push({device:a.device,entities:a.entities,areaId:e.area_id}):s.push(a.battery));return 0===i.length&&0===a.length&&0===s.length?null:{area:e,deviceGroups:i,circuits:[...a,...s],all:[...i.flatMap(e=>e.entities),...a,...s]}}_getFiltered(e){return this.filter===d?e.deviceGroups.length>0?e.deviceGroups:null:this.filter===p?e.circuits.length>0?e.circuits:null:e.all.length>0?e.all:null}_getGlobalSummary(e){let t=0,a=0,r=0,i=100;for(const{areas:s}of e)for(const e of s){for(const a of e.circuits){const e=this._hass?.states?.[a.entity?.entity_id]||a.state;if("power"===e?.attributes?.device_class){const a=parseFloat(e?.state);isNaN(a)||(t+=a)}}for(const t of e.deviceGroups)if(t.entities)for(const e of t.entities){const t=this._hass?.states?.[e.entity?.entity_id]||e.state;if("battery"===t?.attributes?.device_class){const e=parseFloat(t?.state);isNaN(e)||(a++,r+=e,i=Math.min(i,e))}}}return{totalPowerW:t,batteryCount:a,avgBattery:a>0?Math.round(r/a):null,lowestBat:a>0?Math.round(i):null}}_getPowerTierColor(e){return e>1e3?"var(--lcars-tomato, #ff5555)":e>500?"var(--lcars-butterscotch, #ff9966)":e>200?"var(--lcars-sunflower, #ffcc99)":e>50?"var(--lcars-ice, #99ccff)":"var(--lcars-gray, #666688)"}_getBatteryColor(e){return e<20?"var(--lcars-tomato, #ff5555)":e<50?"var(--lcars-butterscotch, #ff9966)":"var(--lcars-ice, #99ccff)"}render(){if(!this._hass)return r.qy``;const e=this._getAreasWithPower(),t=this._getGlobalSummary(e);return r.qy`
      <div class="eng-dashboard">
        <!-- Warp Core Summary -->
        <div class="eng-summary">
          <span class="eng-summary__block">
            <span class="eng-summary__label">TOTAL DRAW</span>
            <span class="eng-summary__value">${(0,c.ZV)(Math.round(t.totalPowerW))} W</span>
          </span>
          ${t.batteryCount>0?r.qy`
            <span class="eng-summary__block">
              <span class="eng-summary__label">BATTERIES</span>
              <span class="eng-summary__value">${t.batteryCount} UNITS · AVG ${t.avgBattery}%</span>
            </span>
            <span class="eng-summary__block">
              <span class="eng-summary__label">LOWEST</span>
              <span class="eng-summary__value">${t.lowestBat}%</span>
            </span>
          `:""}
        </div>

        ${e.map(({floor:e,areas:t})=>{const a=t.filter(e=>null!==this._getFiltered(e));return 0===a.length?r.qy``:r.qy`
            ${e?r.qy`<div class="eng-floor-header"><span class="eng-floor-name">${e.name||"FLOOR"}</span><span class="eng-floor-line"></span></div>`:""}
            ${a.map(e=>r.qy`
              <div class="eng-area-section">
                <div class="eng-area-header">
                  <span class="eng-area-name">${e.area.name}</span>
                  <span class="eng-area-line"></span>
                </div>
                ${this.filter!==p&&e.deviceGroups.length>0?r.qy`
                  <div class="eng-battery-panels">
                    ${e.deviceGroups.map(e=>r.qy`
                      <lcars-battery-panel
                        .group=${{device:e.device,entities:e.entities,areaId:e.areaId}}
                        .hass=${this._hass}
                        area-id="${e.areaId}">
                      </lcars-battery-panel>
                    `)}
                  </div>
                `:""}
                ${this.filter!==d&&e.circuits.length>0?r.qy`
                  <div class="eng-devices">
                    ${e.circuits.map(e=>this._renderDevice(e))}
                  </div>
                `:""}
              </div>
            `)}
          `})}
        ${0===e.length?r.qy`<div class="eng-empty"><span>NO POWER DEVICES DETECTED</span></div>`:""}
      </div>
    `}_renderDevice(e){const t=e.entity?.entity_id,a=this._hass?.states?.[t]||e.state,s=(a?.attributes?.friendly_name||t||"").toUpperCase(),n=a?.attributes?.device_class||"",o=a?.attributes?.unit_of_measurement||"",l=a?.state,d=parseFloat(l),p=isNaN(d)?(l||"").toUpperCase():`${(0,c.ZV)(d)} ${o}`,u="battery"===n,m=u?isNaN(d)?0:d:null;if(u){const e=this._getBatteryColor(m);return r.qy`
        <div class="eng-device battery" @click=${()=>(0,i.Hv)(t)}
             style="--bat-color:${e}">
          <div class="eng-device__header">
            <span class="eng-device__name">${s}</span>
            <span class="eng-device__value-inline" style="color:${e}">${Math.round(m)}%</span>
          </div>
          <div class="eng-bat-bar">
            <div class="eng-bat-fill" style="width:${m}%; background:${e}"></div>
          </div>
        </div>
      `}const h="power"===n?d:0,f="power"===n?this._getPowerTierColor(h):"var(--lcars-butterscotch, #ff9966)";return r.qy`
      <div class="eng-device sensor" @click=${()=>(0,i.Hv)(t)}>
        <div class="eng-device__header">
          <span class="eng-device__name">${s}</span>
          <span class="eng-device__badge">${n.toUpperCase()}</span>
        </div>
        <div class="eng-device__value" style="color:${f}">${p}</div>
      </div>
    `}static get styles(){return[s.Bx,r.AH`
        :host { display: block; }
        .eng-dashboard { padding: 0.25rem; }

        /* ─── Summary Strip ─── */
        .eng-summary {
          display: flex; gap: 0.25rem; margin-bottom: 0.75rem;
          background: var(--lcars-butterscotch, #ff9966); border-radius: 0.5rem;
          padding: 0.5rem 1rem; color: var(--lcars-black, #000);
          font-family: var(--lcars-font, 'Antonio', sans-serif); text-transform: uppercase;
        }
        .eng-summary__block { flex: 1; display: flex; flex-direction: column; gap: 0.125rem; }
        .eng-summary__label { font-size: 0.625rem; letter-spacing: 0.1em; color: var(--lcars-black, #000); opacity: 0.7; }
        .eng-summary__value { font-size: 1.25rem; font-variant-numeric: tabular-nums; color: var(--lcars-black, #000); }

        .eng-floor-header { display: flex; align-items: center; gap: 0.5rem; margin: 1rem 0 0.5rem 0; }
        .eng-floor-name { font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 1.25rem; color: var(--lcars-butterscotch, #ff9966); text-transform: uppercase; letter-spacing: 0.08em; white-space: nowrap; }
        .eng-floor-line { flex: 1; height: 0.375rem; background: var(--lcars-butterscotch, #ff9966); border-radius: 0 1.5rem 1.5rem 0; opacity: 0.4; }
        .eng-area-section { margin-bottom: 0.75rem; }
        .eng-area-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem; }
        .eng-area-name { font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 1.25rem; color: var(--lcars-butterscotch, #ff9966); text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap; }
        .eng-area-line { flex: 1; height: 2px; background: var(--lcars-butterscotch, #ff9966); opacity: 0.3; }
        .eng-devices { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(16rem, 100%), 1fr)); gap: 0.375rem; }
        .eng-battery-panels { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(22rem, 100%), 1fr)); gap: 0.5rem; margin-bottom: 0.5rem; }
        .eng-device { border: 1px solid rgba(255, 153, 102, 0.15); border-radius: 0.5rem; padding: 0.5rem 0.75rem; cursor: pointer; transition: filter 200ms ease; }
        .eng-device:hover { filter: brightness(1.15); }
        .eng-device.battery { border-left: 4px solid var(--lcars-butterscotch, #ff9966); }
        .eng-device__header { display: flex; align-items: center; gap: 0.5rem; }
        .eng-device__name { flex: 1; font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 0.875rem; color: var(--lcars-butterscotch, #ff9966); text-transform: uppercase; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .eng-device__badge { font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 0.625rem; color: var(--lcars-gray, #666688); text-transform: uppercase; letter-spacing: 0.1em; }
        .eng-device__value { font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 1.5rem; color: var(--lcars-space-white, #f5f6fa); font-variant-numeric: tabular-nums; margin-top: 0.25rem; }
        .eng-device__value-inline { font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 1.25rem; font-variant-numeric: tabular-nums; flex-shrink: 0; }
        .eng-bat-bar { height: 0.375rem; background: rgba(102, 102, 136, 0.2); border-radius: 0.25rem; margin-top: 0.25rem; overflow: hidden; }
        .eng-bat-fill { height: 100%; background: var(--lcars-butterscotch, #ff9966); border-radius: 0.25rem; transition: width 300ms ease; }
        .eng-empty { display: flex; align-items: center; justify-content: center; min-height: 10rem; color: var(--lcars-gray, #666688); font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 1.25rem; text-transform: uppercase; }
      `]}}customElements.get("engineering-card")||customElements.define("engineering-card",m)},1884(e,t,a){var r=a(7349),i=a(2622),s=a(8851),n=a(6940),o=a(5824);const l="all",c="storage",d="circuits";class p extends r.WF{static get properties(){return{cards:{type:Array},_hass:{type:Object},_config:{type:Object},_filter:{type:String},_siteName:{type:String},_audioMuted:{type:Boolean},_editMode:{type:Boolean}}}constructor(){super(),this.cards=[],this._hass=null,this._config={},this._filter=l,this._siteName="LCARS",this._audioMuted=n.e.isMuted,this._editMode=!1}setConfig(e){this._config=e}set hass(e){this._hass=e,e?.config?.location_name&&(this._siteName=e.config.location_name.toUpperCase()),this.cards&&this.cards.forEach(t=>{t&&(t.hass=e)}),(0,o.X)(e)}_setFilter(e){this._filter=e,n.e.play("navAcknowledge"),s.o6.dispatchEvent(new CustomEvent("lcars-eng-filter",{detail:{filter:e}}))}_toggleMute(){n.e.toggle(),this._audioMuted=n.e.isMuted}_openSidebarReorder(){if(!this._hass?.user?.is_admin)return;let e=this.shadowRoot.querySelector("lcars-sidebar-reorder");e||(e=document.createElement("lcars-sidebar-reorder"),this.shadowRoot.appendChild(e)),e.hass=this._hass,e.open()}_toggleEditMode(){this._editMode=!this._editMode,s.o6.dispatchEvent(new CustomEvent("lcars-eng-edit",{detail:{enabled:this._editMode}}))}render(){const e=a(8330).version;return r.qy`
      <div class="lcars-frame">
        <div class="lcars-elbow-top" aria-hidden="true"></div>
        <div class="lcars-header" role="banner">
          <span class="lcars-header-title">${this._siteName}</span>
          <div class="lcars-header-bar" aria-hidden="true"></div>
          <div class="lcars-header-endcap">
            <button class="mute-btn" role="switch" aria-checked=${!this._audioMuted} @click=${()=>this._toggleMute()}>
              <ha-icon .icon=${this._audioMuted?"mdi:volume-off":"mdi:volume-high"}></ha-icon>
            </button>
            ${this._hass?.user?.is_admin?r.qy`
              <button class="mute-btn" aria-label="Reorder sidebar dashboards" @click=${()=>this._openSidebarReorder()}>
                <ha-icon .icon=${"mdi:sort-variant"}></ha-icon>
              </button>
              <button class="mute-btn" aria-pressed=${this._editMode} @click=${()=>this._toggleEditMode()}>
                <ha-icon .icon=${"mdi:cog-outline"}></ha-icon>
              </button>
            `:""}
          </div>
        </div>
        <nav class="lcars-sidebar" role="tablist" aria-label="Filter engineering devices">
          <div class="lcars-sidebar-panel">Engineering</div>
          <div class="lcars-sidebar-filters">
            <button class="sidebar-filter-btn ${this._filter===l?"active":""}" role="tab" aria-selected="${this._filter===l?"true":"false"}" @click=${()=>this._setFilter(l)}><span class="filter-label">ALL</span></button>
            <button class="sidebar-filter-btn ${this._filter===c?"active":""}" role="tab" aria-selected="${this._filter===c?"true":"false"}" @click=${()=>this._setFilter(c)}><span class="filter-label">STORAGE</span></button>
            <button class="sidebar-filter-btn ${this._filter===d?"active":""}" role="tab" aria-selected="${this._filter===d?"true":"false"}" @click=${()=>this._setFilter(d)}><span class="filter-label">CIRCUITS</span></button>
          </div>
          <div class="lcars-sidebar-filler" aria-hidden="true"></div>
        </nav>
        <main class="lcars-content" aria-label="Engineering dashboard">
          ${this.cards?.length>0?this.cards.map(e=>r.qy`${e}`):r.qy`<div class="lcars-heading">No data available</div>`}
        </main>
        <div class="lcars-elbow-bottom" aria-hidden="true"></div>
        <div class="lcars-footer" role="contentinfo">
          <div class="lcars-footer-bar" aria-hidden="true"></div>
          <span class="lcars-footer-text">LCARS ${e}</span>
          <div class="lcars-footer-endcap" aria-hidden="true"></div>
        </div>
      </div>
    `}static get styles(){return[i.Bx,r.AH`
        :host { display: block; height: calc(100vh - var(--header-height, 0px)); overflow: hidden; box-sizing: border-box; background: var(--lcars-bg, #000); padding: var(--lcars-gap, 0.25rem); }
        .lcars-frame { display: grid; grid-template-columns: var(--lcars-sidebar-w, 12rem) 1fr; grid-template-rows: var(--lcars-elbow-h, 4.5rem) 1fr var(--lcars-elbow-h, 4.5rem); gap: var(--lcars-gap, 0.25rem); height: 100%; }
        .lcars-elbow-top { grid-column: 1; grid-row: 1; background: var(--lcars-butterscotch, #ff9966); border-radius: var(--lcars-elbow-radius, 3.75rem) 0 0 0; position: relative; overflow: hidden; }
        .lcars-elbow-top::after { content: ''; position: absolute; bottom: 0; right: 0; width: calc(var(--lcars-sidebar-w, 12rem) - var(--lcars-elbow-w, 9.5rem)); height: calc(var(--lcars-elbow-h, 4.5rem) - var(--lcars-bar-h, 1.5rem)); background: var(--lcars-bg, #000); border-radius: 1.5rem 0 0 0; }
        .lcars-header { grid-column: 2; grid-row: 1; display: flex; align-items: flex-start; gap: var(--lcars-gap, 0.25rem); }
        .lcars-header-title { font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: var(--lcars-font-size-title, 2rem); color: var(--lcars-butterscotch, #ff9966); text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap; line-height: var(--lcars-bar-h, 1.5rem); padding: 0 1rem; }
        .lcars-header-bar { flex: 1; height: var(--lcars-bar-h, 1.5rem); background: var(--lcars-butterscotch, #ff9966); }
        .lcars-header-endcap { height: var(--lcars-bar-h, 1.5rem); background: var(--lcars-butterscotch, #ff9966); border-radius: 0; display: flex; align-items: center; padding: 0 0.5rem; }
        .mute-btn { background: none; border: none; cursor: pointer; color: var(--lcars-black, #000); padding: 0 0.25rem; display: flex; align-items: center; }
        .mute-btn:focus-visible { outline: 2px solid var(--lcars-ice, #99ccff); outline-offset: 2px; }
        .mute-btn ha-icon { --mdc-icon-size: 18px; }
        .lcars-sidebar { grid-column: 1; grid-row: 2; display: flex; flex-direction: column; gap: var(--lcars-gap, 0.25rem); overflow: hidden; }
        .lcars-sidebar-panel { background: var(--lcars-african-violet, #cc99ff); color: var(--lcars-black, #000); font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: var(--lcars-font-size-data, 0.875rem); text-transform: uppercase; padding: 0.25rem 0.5rem; text-align: right; border-radius: 0 0 0 var(--lcars-btn-radius, 1.5rem); flex-shrink: 0; }
        .lcars-sidebar-filters { display: flex; flex-direction: column; gap: var(--lcars-gap, 0.25rem); flex: 1; }
        .sidebar-filter-btn { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem; border: none; border-radius: var(--lcars-btn-radius, 1.5rem) 0 0 var(--lcars-btn-radius, 1.5rem); background: var(--lcars-african-violet, #cc99ff); color: var(--lcars-black, #000); font-family: var(--lcars-font, 'Antonio', sans-serif); text-transform: uppercase; cursor: pointer; transition: background 200ms ease; padding: 0.5rem; }
        .sidebar-filter-btn:hover { filter: brightness(1.2); }
        .sidebar-filter-btn:focus-visible { outline: 2px solid var(--lcars-ice, #99ccff); outline-offset: 2px; }
        .sidebar-filter-btn.active { background: var(--lcars-gold, #ffaa00); }
        .filter-label { font-size: 1.25rem; letter-spacing: 0.08em; text-align: center; }
        .lcars-sidebar-filler { flex: 1 0 0px; min-height: 0; background: var(--lcars-gray, #666688); border-radius: var(--lcars-btn-radius, 1.5rem) 0 0 0; }
        .lcars-content { grid-column: 2; grid-row: 2; overflow-y: auto; overflow-x: hidden; padding: 0.5rem; scrollbar-width: thin; scrollbar-color: var(--lcars-gray, #666688) transparent; }
        .lcars-elbow-bottom { grid-column: 1; grid-row: 3; background: var(--lcars-african-violet, #cc99ff); border-radius: 0 0 0 var(--lcars-elbow-radius, 3.75rem); position: relative; overflow: hidden; }
        .lcars-elbow-bottom::after { content: ''; position: absolute; top: 0; right: 0; width: calc(var(--lcars-sidebar-w, 12rem) - var(--lcars-elbow-w, 9.5rem)); height: calc(var(--lcars-elbow-h, 4.5rem) - var(--lcars-bar-h, 1.5rem)); background: var(--lcars-bg, #000); border-radius: 0 0 0 1.5rem; }
        .lcars-footer { grid-column: 2; grid-row: 3; display: flex; align-items: flex-end; gap: var(--lcars-gap, 0.25rem); }
        .lcars-footer-bar { flex: 1; height: var(--lcars-bar-h, 1.5rem); background: var(--lcars-african-violet, #cc99ff); }
        .lcars-footer-text { font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: var(--lcars-font-size-data, 0.875rem); color: var(--lcars-sky, #aaaaff); text-transform: uppercase; white-space: nowrap; line-height: var(--lcars-bar-h, 1.5rem); padding: 0 0.5rem; }
        .lcars-footer-endcap { width: var(--lcars-endcap-size, 1.5rem); height: var(--lcars-bar-h, 1.5rem); background: var(--lcars-african-violet, #cc99ff); border-radius: 0; flex-shrink: 0; }
      `]}}Promise.race([customElements.whenDefined("hui-masonry-view"),new Promise(e=>setTimeout(e,5e3))]).then(()=>{customElements.get("lcars-engineering-layout")||customElements.define("lcars-engineering-layout",p)})},6930(e,t,a){a.d(t,{bc:()=>s,d6:()=>i});var r=a(4867);function i(e,t,a=null){if(!e)return[];if(a&&a.has(t))return a.get(t);const r=Object.values(e.entities||{}),i=e.devices||{},s=new Set;for(const e of Object.values(i))e.area_id===t&&s.add(e.id);const n=r.filter(e=>!(e.hidden_by||e.hidden||e.disabled_by||e.entity_category||e.area_id!==t&&(e.area_id||!e.device_id||!s.has(e.device_id))));return a&&a.set(t,n),n}function s(e,t){const a=e.devices||{},i=new Map,s=[];for(const r of t){const t=r.entity_id.split(".")[0],n=e.states?.[r.entity_id],o={entity:r,domain:t,state:n};n&&(r.device_id&&a[r.device_id]?(i.has(r.device_id)||i.set(r.device_id,{device:a[r.device_id],entities:[]}),i.get(r.device_id).entities.push(o)):s.push(o))}const n=(e,t)=>{const a=r.sg[e.domain]??50,i=r.sg[t.domain]??50;return a!==i?a-i:(e.state?.attributes?.friendly_name||"").localeCompare(t.state?.attributes?.friendly_name||"")};return i.forEach(e=>e.entities.sort(n)),s.sort(n),{byDevice:i,noDevice:s}}},4867(e,t,a){a.d(t,{Ax:()=>se,JM:()=>H,Jn:()=>v,K5:()=>z,KK:()=>r,Lx:()=>o,MJ:()=>p,QQ:()=>h,R2:()=>_,Rv:()=>q,S:()=>u,Sp:()=>s,TL:()=>$,TZ:()=>d,Tl:()=>b,US:()=>le,Vk:()=>Z,X8:()=>c,XY:()=>ie,Xt:()=>E,Z:()=>f,Zz:()=>C,a2:()=>l,aE:()=>w,eX:()=>K,gC:()=>n,ge:()=>x,hk:()=>J,iU:()=>ne,lo:()=>A,sg:()=>Y,sv:()=>m,uC:()=>y,uf:()=>oe,uk:()=>i,v3:()=>G,vX:()=>M,xU:()=>X,xW:()=>g,yS:()=>k});const r="camera",i="alarm",s="aquatics",n="climate",o="media",l="environment",c="irrigation",d="weather",p="battery",u="power",m="illumination",h="tactical",f="viewport",v="hazard",g="galley",b="ev_charger",y={[m]:"left",[n]:"left",[l]:"left",[u]:"left",[i]:"right",[h]:"right",[r]:"right",[p]:"right",[c]:"right",[o]:"right",[s]:"right",[d]:"right",[f]:"left",[g]:"left",[b]:"left",[v]:"right"},_={[m]:0,[n]:2,[l]:4,[f]:4.5,[g]:4.7,[b]:4.8,[u]:5,[i]:0,[h]:0,[r]:1,[p]:2,[c]:3,[o]:4,[s]:5,[d]:6,[v]:7},w=new Set(["camera"]),x=new Set(["climate"]),$=new Set(["media_player"]),k=new Set(["alarm_control_panel"]),S=new Set(["weather"]),C=new Set(["light","switch","fan","input_boolean","lock","automation","script"]),E=new Set(["sensor","binary_sensor"]),z=new Set(["cover"]),A=new Set(["carbon_dioxide","carbon_monoxide","volatile_organic_compounds","volatile_organic_compounds_parts","pm25","pm10","pm1","aqi"]),q=/_(air_quality|score)$/,P=/pool|spa/i,T=new Set(["heater","solar","solar_preferred"]),M=new Set(["screenlogic","iaqualink","poolmath","waterguru","pentair"]);function N(e){const t=e?.preset_modes;return!!Array.isArray(t)&&t.some(e=>T.has(e))}const I=new Set(["weatherflow","weatherlink","met","openweathermap","accuweather","ecobee","environment_canada","nws","pirateweather"]),D=new Set(["wind_speed","wind_direction","precipitation","precipitation_intensity","pressure","irradiance"]),O=(new Set(["smoke","gas","carbon_monoxide","heat","safety"]),new Set(["smoke","carbon_monoxide","gas","heat"])),L=new Set(["tplink","kasa"]),R=new Set(["aqara"]),F=new Set(["ge_home","smartthinq_sensors"]),W=new Set(["ha_blueair","vesync","smartthinq_sensors","xiaomi_miio","xiaomi_home","philips_airpurifier","coway","winix"]),U=/irrigation|watering|sprinkler|\bzone\b|ecoflow|backup|reserve|boost|\bdc(?:\s|_|-|\()?(?:mode|12v)\b|\bac(?:\s|_|-|\()?(?:mode|enabled)\b|humidifier|purifier|battery|inverter|charger|filter|pump|heater/i,B=new Map([["unifiprotect",r],["blink",r],["screenlogic",s],["iaqualink",s],["waterguru",s],["pentair",s],["poolmath",s],["weatherflow",d],["weatherlink",d],["rachio",c],["rainbird",c],["rainmachine",c],["opensprinkler",c],["flume",c],["nest_protect",v],["ge_home",g],["smartthinq_sensors",g],["ha_blueair",l],["vesync",l],["philips_airpurifier",l],["coway",l],["winix",l],["emporia_vue",u],["ecoflow_cloud",p]]);function H(e){const t=e.entity?.entity_category;return"diagnostic"===t||"config"===t}const j=new Set(["rachio","rainbird","rainmachine","opensprinkler","hydrawise","hunter"]),V=[e=>e.some(e=>w.has(e.domain))?r:null,e=>e.some(e=>k.has(e.domain))?i:null,e=>{if(e.some(e=>"nest_protect"===e.entity?.platform))return v;let t=0,a=0;for(const r of e){if("binary_sensor"!==r.domain||H(r))continue;if(L.has(r.entity?.platform||""))continue;const e=r.state?.attributes?.device_class||"";O.has(e)?t++:"safety"===e&&a++}return t>=1||t+a>=2?v:null},e=>e.some(e=>R.has(e.entity?.platform))&&e.some(e=>"binary_sensor"===e.domain&&["occupancy","motion"].includes(e.state?.attributes?.device_class||""))?h:null,e=>e.some(e=>F.has(e.entity?.platform))?g:null,e=>{if(e.some(e=>M.has(e.entity?.platform)))return s;for(const t of e)if("climate"===t.domain){if(P.test(t.entity.entity_id))return s;if(N(t.state?.attributes))return s}return null},e=>e.some(e=>x.has(e.domain))?n:null,e=>e.some(e=>$.has(e.domain))?o:null,e=>{let t=0,a=!1;for(const r of e){const e=r.state?.attributes?.device_class||"";A.has(e)&&t++,"fan"===r.domain&&(a=!0),!e&&"sensor"===r.domain&&q.test(r.entity.entity_id)&&t++}return t>=2||t>=1&&a?l:null},e=>function(e){if(e.some(e=>j.has(e.entity?.platform)))return!0;let t=0,a=!1,r=0;for(const i of e){if("binary_sensor"===i.domain){const e=i.entity?.entity_id||"";/rain/i.test(e)&&(a=!0)}if("switch"!==i.domain)continue;r++;const e=i.state?.attributes;null==e?.zone_number?"outlet"===e?.device_class&&/zone/i.test(i.entity.entity_id)&&t++:t++}return t>=2||!!(r>=5&&a)}(e)?c:null,e=>{if(e.some(e=>S.has(e.domain)))return d;if(e.some(e=>I.has(e.entity?.platform)))return d;let t=0;for(const a of e){const e=a.state?.attributes?.device_class||"";D.has(e)&&t++}return t>=2?d:null},e=>{let t=!1,a=0,r=!1;for(const i of e){const e=i.state?.attributes;if(!e)continue;const s=e.device_class||"",n=e.unit_of_measurement||"";"battery"===s&&"%"===n&&(t=!0),"power"===s&&"W"===n&&a++,"voltage"===s&&"V"===n&&(r=!0);const o=i.entity?.entity_id||"";/ups[._]load|ups[._]status/i.test(o)&&(r=!0)}return t&&a>=2||t&&r?p:null},e=>{if(e.some(e=>"wallbox"===e.entity?.platform))return b;const t=[/charging_power/i,/state_of_charge/i,/added_energy/i,/charging_speed/i];let a=0;for(const r of e){const e=r.entity?.entity_id||"";for(const r of t)if(r.test(e)){a++;break}if(a>=2)return b}return null},e=>{let t=!1,a=0;for(const r of e){const e=r.state?.attributes;if(!e)continue;const i=e.device_class||"",s=e.unit_of_measurement||"";if("battery"===i&&"%"===s){t=!0;break}"power"!==i||"W"!==s&&"kW"!==s||a++,"energy"!==i||"kWh"!==s&&"Wh"!==s||a++,"current"===i&&"A"===s&&a++,"voltage"===i&&"V"===s&&a++}return!t&&a>=1?u:null},e=>{for(const t of e){const e=t.entity?.platform;if(e&&B.has(e))return B.get(e)}return null}];function G(e){for(const t of V){const a=t(e);if(a)return a}return null}const X={light:"Lights",switch:"Switches",fan:"Fans",lock:"Locks",input_boolean:"Toggles",automation:"Automations",script:"Scripts",sensor:"Sensors",binary_sensor:"Binary Sensors",camera:"Cameras",climate:"Climate",cover:"Covers",media_player:"Media",button:"Buttons",number:"Numbers",select:"Selects",input_number:"Inputs",input_select:"Selectors",input_text:"Text Inputs",input_button:"Buttons",input_datetime:"Date/Time",scene:"Scenes",device_tracker:"Trackers",person:"People",update:"Updates",event:"Events",conversation:"Conversation",alarm_control_panel:"Alarm",weather:"Weather",remote:"Remotes",vacuum:"Vacuums"},Y={camera:0,light:1,switch:2,climate:3,cover:4,media_player:5,fan:6,lock:7,alarm_control_panel:8,weather:9,sensor:10,binary_sensor:11};function Z(e){const t=e.state?.attributes?.device_class||"";return!!A.has(t)||!("fan"!==e.domain||!W.has(e.entity?.platform||""))||!("sensor"!==e.domain||!q.test(e.entity?.entity_id||""))}const Q=new Set(["unifi"]);function K(e){if(function(e){if("light"!==e.domain)return!1;if(Q.has(e.entity?.platform))return!0;const t=e.entity?.entity_id||"";if(/led_indicator|status_led|status_panel|status_light/.test(t))return!0;const a=(e.state?.attributes?.friendly_name||"").toLowerCase();return!!/\bindicator\b|\bstatus\s*(led|light|panel)\b/.test(a)}(e))return!1;if("light"===e.domain)return!0;if("scene"===e.domain)return!0;if("switch"===e.domain||"input_boolean"===e.domain){const t=e.entity?.entity_id||"",a=(e.state?.attributes?.friendly_name||"").toLowerCase();return"outlet"!==e.state?.attributes?.device_class&&!U.test(a)&&!U.test(t)&&("insteon"===e.entity?.platform||/light|lamp|sconce|chandelier|pendant|fixture|dimmer|illuminat/i.test(a)||/light|lamp|sconce|chandelier|switchlinc|lamplinc|togglelinc/i.test(t))}return!1}function J(e){const t=e?.attributes?.supported_color_modes||[];return 0===t.length||1===t.length&&"onoff"===t[0]?"onoff":t.some(e=>"hs"===e||"rgb"===e||"xy"===e)||(e?.attributes?.effect_list?.length||0)>0?"full":"dimmer"}const ee=new Set(["door","window","opening","garage_door","motion","occupancy","tamper","safety"]),te=new Set(["garage_door","gate","door"]),ae=new Set(["blind","shade","curtain","awning","shutter"]),re=new Set(["wallbox"]);function ie(e){if(k.has(e.domain))return!0;if("lock"===e.domain)return!re.has(e.entity?.platform||"");const t=e.state?.attributes?.device_class||"";return!("binary_sensor"!==e.domain||!ee.has(t))||!("cover"!==e.domain||!te.has(t))}function se(e){if("cover"!==e.domain)return!1;const t=e.state?.attributes?.device_class||"";return ae.has(t)||""===t&&!te.has(t)}const ne=new Set(["device_tracker","event","conversation","input_datetime","input_text"]);function oe(e,t){const a=[],r=[],i=[];for(const s of e)H(s)?i.push(s):t(s)?a.push(s):r.push(s);return{hero:a,operational:r,diagnostic:i}}function le(e,t,a){const r=new Set;a.filter(e=>!H(e)).filter(K).length>=1&&r.add(m);const i=new Set;for(const e of a)w.has(e.domain)&&e.entity?.device_id&&i.add(e.entity.device_id);return a.some(e=>{if(e.entity?.device_id&&i.has(e.entity.device_id)){const t=e.state?.attributes?.device_class||"";if(["motion","occupancy"].includes(t))return!1}return ie(e)})&&r.add(h),a.some(e=>{if("cover"!==e.domain)return!1;const t=e.state?.attributes?.device_class||"";return ae.has(t)||""===t&&!te.has(t)})&&r.add(f),a.filter(e=>{if(!$.has(e.domain))return!1;const t=e.entity?.device_id;return!t||!i.has(t)}).length>=1&&r.add(o),r}},8233(e,t,a){var r=a(7349),i=a(2622),s=a(8851);class n extends r.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object},_cards:{type:Array}}}constructor(){super(),this._cards=[]}set hass(e){this._hass=e,this._cards.forEach(t=>{t&&(t.hass=e)})}setConfig(e){this._config=e,this._createCards()}async _createCards(){this._config&&this._config.cards&&(this._cards=await Promise.all(this._config.cards.map(async e=>{try{const t=await(0,s.te)(e);return this._hass&&(t.hass=this._hass),t}catch(t){return console.error("LCARS Flexbox: Failed to create card",e,t),null}})),this._cards=this._cards.filter(Boolean),this.requestUpdate())}static get styles(){return[i.Bx,r.AH`
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
        `]}render(){return r.qy`
        <div class="flexbox">
          ${this._cards.map(e=>r.qy`${e}`)}
        </div>
      `}getCardSize(){return 1}}customElements.get("lcars-flexbox-card")||customElements.define("lcars-flexbox-card",n)},9411(e,t,a){a.d(t,{Z2:()=>o,ZV:()=>i,aQ:()=>c,kp:()=>u});const r={temperature:1,humidity:0,power:0,energy:1,pm25:0,pm10:0,pm1:0,aqi:0,carbon_dioxide:0,carbon_monoxide:0,volatile_organic_compounds:0,battery:0,pressure:1,illuminance:0,moisture:0,signal_strength:0,voltage:1,current:2,frequency:1,speed:1,distance:1,weight:1,duration:0};function i(e,t=""){if(null==e||""===e)return"—";if("unavailable"===e||"unknown"===e)return"—";const a=Number(e);if(!Number.isFinite(a))return e;const i=r[t];return void 0!==i?0===i?String(Math.round(a)):a.toFixed(i):Number.isInteger(a)?String(a):a.toFixed(1)}const s={pm25:"PM₂.₅",pm10:"PM₁₀",pm1:"PM₁",carbon_dioxide:"CO₂",carbon_monoxide:"CO",volatile_organic_compounds:"VOC",nitrogen_dioxide:"NO₂",ozone:"O₃",sulphur_dioxide:"SO₂",aqi:"AQI",temperature:"TEMP",humidity:"RH",pressure:"PRESS",illuminance:"LUX",battery:"BATT",signal_strength:"RSSI",moisture:"MOIST",gas:"GAS",water:"WATER",data_rate:"RATE",data_size:"SIZE"},n=[["orp","ORP"],["ph","pH"],["salt_tds","SALT"],["saturation","SAT"],["total_alkalinity","ALK"],["calcium_hardness","CA HARD"],["cyanuric_acid","CYA"],["free_chlorine","FREE CL"],["total_chlorine","TOTAL CL"],["water_temp","WATER"]];function o(e="",t="",a=""){if(s[e])return s[e];if(a){const e=a.split(".").pop()||"";for(const[t,a]of n)if(e.endsWith(t))return a}return t}const l=["B","KB","MB","GB","TB"];function c(e){if(!e||"string"!=typeof e)return null;if(!/^\d{4}-\d{2}-\d{2}[T ]/.test(e))return null;const t=new Date(e);if(isNaN(t.getTime()))return null;const a=Date.now()-t.getTime(),r=Math.abs(a);return r<6e4?"JUST NOW":r<36e5?`${Math.floor(r/6e4)}M AGO`:r<864e5?`${Math.floor(r/36e5)}H AGO`:r<6048e5?`${Math.floor(r/864e5)}D AGO`:t.toLocaleDateString("en",{month:"short",day:"numeric"}).toUpperCase()}const d=new Set(["button","input_button","scene","script"]),p={off:"UP TO DATE",on:"UPDATE AVAILABLE",installing:"INSTALLING"};function u(e,t=""){const a=e?.state;if(null==a||""===a)return{text:"—",isIdle:!0};const r=(e?.entity_id||"").split(".")[0],s=e?.attributes?.device_class||"",n=e?.attributes?.unit_of_measurement||"";if("unknown"===a)return d.has(r)?{text:"READY",isIdle:!0}:"sensor"===r||"binary_sensor"===r?{text:"NO DATA",isIdle:!0}:"diagnostic"===t||"config"===t?{text:"—",isIdle:!0}:{text:"UNKNOWN",isIdle:!0};if("unavailable"===a)return"diagnostic"===t||"config"===t?{text:"—",isIdle:!0}:"sensor"===r||"binary_sensor"===r?{text:"OFFLINE",isIdle:!0}:{text:"UNAVAILABLE",isIdle:!0};if("update"===r)return{text:p[a]||a.toUpperCase(),isIdle:"off"===a};if("battery"===s&&"%"===n&&0===Number(a)){const t=e?.last_changed,a=e?.last_updated;if(a&&t&&a!==t)return{text:"0%",isIdle:!1};if((t?Date.now()-new Date(t).getTime():1/0)>6048e5)return{text:"NO DATA",isIdle:!0}}if(d.has(r))return{text:a.toUpperCase(),isIdle:"idle"===a||"off"===a};const o=i(a,s);if(o===a&&isNaN(Number(a)))return{text:a.toUpperCase(),isIdle:!1};if("W"===n||"w"===n){const e=Number(a);if(Number.isFinite(e)&&Math.abs(e)>=1e4)return{text:`${(e/1e3).toFixed(1)} kW`,isIdle:!1}}if("B"===n||"bytes"===n){const e=Number(a);if(Number.isFinite(e)){const t=function(e){if(!Number.isFinite(e)||0===e)return{value:"0",unit:"B"};let t=0,a=Math.abs(e);for(;a>=1024&&t<l.length-1;)a/=1024,t++;const r=a>=100?0:a>=10?1:2;return{value:`${e<0?"-":""}${a.toFixed(r)}`,unit:l[t]}}(e);return{text:`${t.value} ${t.unit}`,isIdle:!1}}}return{text:n?`${o} ${n}`:o,isIdle:!1}}},755(e,t,a){var r=a(7349),i=a(2622);class s extends r.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object}}}set hass(e){this._hass=e}setConfig(e){if(!e.heading)throw new Error("Please define heading");this._config=e}static get styles(){return[i.Bx,r.AH`
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
        `]}render(){return r.qy`
        <div class="heading-row">
          <span class="heading-text">${this._config.heading}</span>
          <div class="heading-bar"></div>
          <div class="heading-endcap"></div>
        </div>
        ${this._config.subtitle?r.qy`<div class="heading-subtitle">${this._config.subtitle}</div>`:""}
      `}getCardSize(){return 1}}customElements.get("lcars-heading-card")||customElements.define("lcars-heading-card",s)},8851(e,t,a){a.d(t,{Bo:()=>d,Hv:()=>l,g0:()=>r,o6:()=>i,oo:()=>o,rC:()=>n,te:()=>c});const r={_prefix:e=>`%c[LCARS ${e}]`,_style:"color: #f1b864; font-weight: bold",debug:(e,...t)=>{window.__LCARS_DEBUG&&console.debug(r._prefix(e),r._style,...t)},info:(e,...t)=>console.info(r._prefix(e),r._style,...t),warn:(e,...t)=>console.warn(r._prefix(e),r._style,...t),error:(e,...t)=>console.error(r._prefix(e),r._style,...t)},i=new EventTarget;function s(){const e=document.querySelector("hc-main");if(e)return e.hass;const t=document.querySelector("home-assistant");return t?t.hass:void 0}function n(e,t={},a=null){const r=new Event(e,{bubbles:!0,cancelable:!1,composed:!0});if(r.detail=t,a)a.dispatchEvent(r);else{const e=function(){let e=document.querySelector("hc-main");return e?(e=e?.shadowRoot?.querySelector("hc-lovelace")?.shadowRoot,e?.querySelector("hui-view")||e?.querySelector("hui-panel-view")):(e=document.querySelector("home-assistant"),e=e?.shadowRoot?.querySelector("home-assistant-main")?.shadowRoot,e=e?.querySelector("app-drawer-layout partial-panel-resolver"),e=e?.shadowRoot||e,e=e?.querySelector("ha-panel-lovelace")?.shadowRoot,e=e?.querySelector("hui-root")?.shadowRoot,e=e?.querySelector("ha-app-layout")?.querySelector("#view"),e?.firstElementChild)}();e&&e.dispatchEvent(r)}}function o(e,t=!1){t?history.replaceState(null,"",e):history.pushState(null,"",e),n("location-changed",{replace:t},window)}function l(e){n("hass-more-info",{entityId:e},document.querySelector("hc-main")||document.querySelector("home-assistant"))}async function c(e){const t=e.type?.startsWith("custom:")?e.type.slice(7):`hui-${e.type}-card`;if(customElements.get(t)||(await async function(){if(customElements.get("hui-view"))return!0;await customElements.whenDefined("partial-panel-resolver");const e=document.createElement("partial-panel-resolver");if(e.hass={panels:[{url_path:"tmp",component_name:"lovelace"}]},e._updateRoutes(),await e.routerOptions.routes.tmp.load(),!customElements.get("ha-panel-lovelace"))return!1;const t=document.createElement("ha-panel-lovelace");return t.hass=s(),void 0===t.hass&&(await new Promise(e=>{window.addEventListener("connection-status",()=>e(),{once:!0})}),t.hass=s()),t.panel={config:{mode:null}},t._fetchConfig(),!0}(),await new Promise(e=>setTimeout(e,100))),"function"==typeof window.loadCardHelpers)try{const t=await window.loadCardHelpers();return await t.createCardElement(e)}catch(e){}const a=document.createElement(t);return a.setConfig&&a.setConfig(e),a}function d(e,t,a,r="Configure"){const i=document.createElement("lcars-popup");i.hass=e,i.setConfig({title:r,card:{type:`custom:${t}`,...a}});const s=new MutationObserver(()=>{const e=i.shadowRoot?.querySelector(".popup-backdrop");e&&!e.hasAttribute("data-open")&&setTimeout(()=>{i.remove(),s.disconnect()},300)});document.body.appendChild(i),s.observe(i.shadowRoot||i,{attributes:!0,subtree:!0}),setTimeout(()=>{s.disconnect()},3e5),requestAnimationFrame(()=>i.open())}},7597(e,t,a){function r(e){return e?.floors?Object.values(e.floors).sort((e,t)=>{const a=e.sort_order??999,r=t.sort_order??999;if(a!==r)return a-r;const i=e.floor_id||"",s=t.floor_id||"";return i.localeCompare(s)}):[]}function i(e,t){return e?.areas?Object.values(e.areas).filter(e=>e.floor_id===t).map(e=>e.area_id):[]}function s(e){const t=new Map;if(!e?.areas)return t;const a=Object.values(e.areas);for(const e of a){const a=e.floor_id||null;t.has(a)||t.set(a,[]),t.get(a).push(e)}for(const[,e]of t)e.sort((e,t)=>{const a=e.sort_order??999,r=t.sort_order??999;return a!==r?a-r:(e.name||"").localeCompare(t.name||"")});return t}function n(e,t){if(!e?.areas)return[];const a=e.areas[t];return a?.floor_id?Object.values(e.areas).filter(e=>e.floor_id===a.floor_id&&e.area_id!==t).map(e=>e.area_id):[]}a.d(t,{E3:()=>s,Qn:()=>r,bS:()=>n,jE:()=>i})},8240(e,t,a){var r=a(7349),i=a(7637),s=a(2622),n=a(8851),o=a(4867),l=a(3505),c=a(9411),d=a(717),p=a(261);const u=new Map;async function m(e,t,a="daily",r={}){const{ttlMs:i=6e5}=r,s=`${t}:${a}`,n=Date.now(),o=u.get(s);if(o&&n-o.timestamp<i)return o.data;try{const r=await e.callWS({type:"weather/subscribe_forecast",entity_id:t,forecast_type:a}),i=r?.forecast||r||[],o=Array.isArray(i)?i:[];if(u.set(s,{data:o,timestamp:n}),u.size>10){const e=u.keys().next().value;u.delete(e)}return o}catch(r){try{const r=await e.callService("weather","get_forecasts",{type:a},{entity_id:t}),i=r?.[t]?.forecast||[];return u.set(s,{data:i,timestamp:n}),i}catch(e){return[]}}}var h=a(1109),f=a(7597),v=a(6930),g=a(6940);a(9761),a(3790),a(5477);const b=r.AH`
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
`;class y extends r.WF{static get properties(){return{options:{type:Array},value:{type:String},label:{type:String},accentColor:{type:String,attribute:"accent-color"}}}constructor(){super(),this.options=[],this.value="",this.label="",this.accentColor=""}static get styles(){return[b]}_handleSelect(e){e!==this.value&&(this.value=e,this.dispatchEvent(new CustomEvent("lcars-option-changed",{detail:{value:e},bubbles:!0,composed:!0})))}_handleKeydown(e,t,a){if("Enter"===e.key||" "===e.key)return e.preventDefault(),void this._handleSelect(t);const r=this.options.filter(e=>!e.disabled);let i=-1;if("ArrowRight"===e.key||"ArrowDown"===e.key?(e.preventDefault(),i=(r.findIndex(e=>e.value===t)+1)%r.length):"ArrowLeft"!==e.key&&"ArrowUp"!==e.key||(e.preventDefault(),i=(r.findIndex(e=>e.value===t)-1+r.length)%r.length),i>=0){this._handleSelect(r[i].value);const e=this.shadowRoot.querySelectorAll('.option-btn:not([aria-disabled="true"])');e[i]?.focus()}}render(){const e=this.accentColor?`--strip-accent:${this.accentColor}`:"";return r.qy`
      <div class="option-strip" role="radiogroup" aria-label="${this.label}" style="${e}">
        ${(this.options||[]).map((e,t)=>{const a=e.value===this.value,i=e.disabled||!1;return r.qy`
            <button class="option-btn"
              role="radio"
              aria-checked="${a}"
              aria-disabled="${i}"
              tabindex="${a?"0":"-1"}"
              ?disabled=${i}
              @click=${()=>!i&&this._handleSelect(e.value)}
              @keydown=${a=>!i&&this._handleKeydown(a,e.value,t)}>
              ${e.label}
            </button>
          `})}
      </div>
    `}}customElements.get("lcars-option-strip")||customElements.define("lcars-option-strip",y);const _=r.AH`
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
`;class w extends r.WF{static get properties(){return{value:{type:Number},step:{type:Number},min:{type:Number},max:{type:Number},unit:{type:String},label:{type:String},color:{type:String}}}constructor(){super(),this.value=0,this.step=.5,this.min=0,this.max=100,this.unit="",this.label="",this.color=""}static get styles(){return[_]}_adjust(e){const t=Math.min(this.max,Math.max(this.min,this.value+e));t!==this.value&&(this.value=t,this.dispatchEvent(new CustomEvent("lcars-setpoint-changed",{detail:{value:t},bubbles:!0,composed:!0})))}render(){const e=this.color?`--sp-color:${this.color}`:"",t=this.label||`${this.value}${this.unit}`;return r.qy`
      <div class="setpoint-control"
        role="spinbutton"
        aria-valuenow="${this.value}"
        aria-valuemin="${this.min}"
        aria-valuemax="${this.max}"
        aria-label="${this.label||"Setpoint"}"
        style="${e}">
        <button class="sp-btn sp-dec"
          aria-label="Decrease"
          ?disabled=${this.value<=this.min}
          @click=${()=>this._adjust(-this.step)}>−</button>
        <span class="sp-label">${t}</span>
        <button class="sp-btn sp-inc"
          aria-label="Increase"
          ?disabled=${this.value>=this.max}
          @click=${()=>this._adjust(this.step)}>+</button>
      </div>
    `}}customElements.get("lcars-setpoint")||customElements.define("lcars-setpoint",w);var x=a(7850);const $=r.AH`
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

  /* ─── Offline State (GEORDI-022, WESLEY-UX-007) ─── */
  .irr-offline {
    opacity: 0.6;
    filter: grayscale(0.7);
  }
  .irr-offline-banner {
    grid-column: 1 / -1;
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    color: var(--lcars-gray);
    text-transform: uppercase;
    text-align: center;
    padding: 0.25rem;
    border-bottom: 2px solid var(--lcars-gray);
    margin-bottom: 0.25rem;
  }
`,k={"Full Sun":"mdi:weather-sunny","Mostly Sun":"mdi:weather-sunny","Half Shade":"mdi:weather-partly-cloudy","Full Shade":"mdi:weather-cloudy"},S={"Cool Season Grass":"mdi:grass","Warm Season Grass":"mdi:grass",Trees:"mdi:tree",Shrubs:"mdi:flower",Perennials:"mdi:flower-tulip",Annuals:"mdi:flower","Ground Cover":"mdi:grass",Xeriscape:"mdi:cactus"},C={Flat:"mdi:triangle-outline",Slight:"mdi:triangle-outline",Moderate:"mdi:triangle-outline",Steep:"mdi:triangle-outline"};class E extends x.j{#e=(0,d.x)(5,1e4);static get properties(){return{...super.properties,_expandedZone:{type:String,attribute:!1},_quickRunOpen:{type:Boolean,attribute:!1},_quickRunZones:{type:Array,attribute:!1},_quickRunDuration:{type:Number,attribute:!1}}}constructor(){super(),this._expandedZone=null,this._quickRunOpen=!1,this._quickRunZones=[],this._quickRunDuration=10,this._countdownTimer=null}disconnectedCallback(){super.disconnectedCallback(),this._countdownTimer&&(clearInterval(this._countdownTimer),this._countdownTimer=null)}get panelType(){return"irrigation"}get defaultPanelTitle(){return"Irrigation"}get frameColor(){return"var(--lcars-ice)"}static get styles(){return[...super.styles,h.PF,h.yW,$]}_partitionIrrigationEntities(e=[]){const t=[],a=[],r=[],i=[];for(const s of e){const e=s.domain,n=s.entity?.entity_id||"",o=s.state?.attributes||{};"switch"!==e?"binary_sensor"!==e||i.push(s):null!=o["Zone number"]||null!=o.zone_number||/zone/i.test(n)?t.push(s):null!=o.Type||/schedule/i.test(n)?a.push(s):r.push(s)}return t.sort((e,t)=>(e.state?.attributes?.["Zone number"]??e.state?.attributes?.zone_number??999)-(t.state?.attributes?.["Zone number"]??t.state?.attributes?.zone_number??999)),{zones:t,schedules:a,controller:r,binarySensors:i}}_getZoneNumber(e){return e?.attributes?.["Zone number"]??e?.attributes?.zone_number??"?"}_getZoneProgress(e){if("on"!==e?.state)return 0;const t=e.attributes?.["Watering Duration seconds"];if(!t||t<=0)return 100;const a=new Date(e.last_changed).getTime(),r=(Date.now()-a)/1e3;return Math.min(100,r/t*100)}_getCountdown(e){if("on"!==e?.state)return"";const t=e.attributes?.["Watering Duration seconds"];if(!t||t<=0)return"";const a=new Date(e.last_changed).getTime(),r=(Date.now()-a)/1e3,i=Math.max(0,t-r),s=Math.floor(i/60),n=Math.floor(i%60);return`${String(s).padStart(2,"0")}:${String(n).padStart(2,"0")}`}_findControllerSwitch(e,t){return e.find(e=>"switch"===e.domain&&(e.entity?.entity_id||"").includes(t))}_findBinarySensor(e,t){return e.find(e=>(e.entity?.entity_id||"").includes(t))}_handleIrrigationZone(e,t){this.#e.allow()&&(g.e.play("switchToggle"),this._callService("switch",t?"turn_on":"turn_off",{entity_id:e}))}_handleIrrigationToggle(e){this.#e.allow()&&(g.e.play("switchToggle"),this._callService("homeassistant","toggle",{entity_id:e}))}_handlePause(){this.#e.allow()&&(g.e.play("acknowledge"),this._callService("rachio","pause_watering",{duration:60}))}_handleResume(){this.#e.allow()&&(g.e.play("acknowledge"),this._callService("rachio","resume_watering",{}))}_handleStopAll(){this.#e.allow()&&(g.e.play("acknowledge"),this._callService("rachio","stop_watering",{}))}_toggleQuickRunZone(e){const t=this._quickRunZones.indexOf(e);this._quickRunZones=t>=0?[...this._quickRunZones.filter(t=>t!==e)]:[...this._quickRunZones,e]}_handleQuickRun(){if(!this.#e.allow())return;if(!this._quickRunZones.length||!this._quickRunDuration)return;if(!this.hass)return;g.e.play("scriptFire");const e=(0,d.L3)(this._quickRunDuration,1,30);this.hass.callService("rachio","start_multiple_zone_schedule",{entity_id:this._quickRunZones,duration:Array(this._quickRunZones.length).fill(e)}),this._quickRunOpen=!1,this._quickRunZones=[]}renderBadge(){const{zones:e,controller:t}=this._partitionIrrigationEntities(this.group.entities),a=e.find(e=>"on"===e.state?.state),i=this._findControllerSwitch(t,"standby"),s="on"===i?.state?.state;if(e.length>0&&e.every(e=>"unavailable"===e.state?.state))return r.qy`<span style="color:var(--lcars-gray)">OFFLINE</span>`;const n=a?"var(--lcars-ice)":s?"var(--lcars-gray)":"var(--lcars-sunflower)",o=a?`WATERING Z${this._getZoneNumber(a.state)}`:s?"STANDBY":"IDLE";return r.qy`<span style="color:${n}">${o}</span>`}renderContent(){const{zones:e,schedules:t,controller:a,binarySensors:i}=this._partitionIrrigationEntities(this.group.entities),s=e.find(e=>"on"===e.state?.state),n=this._findControllerSwitch(a,"standby"),o=this._findControllerSwitch(a,"rain_delay"),l="on"===n?.state?.state,d="on"===o?.state?.state,p=this._findBinarySensor(i,"connectivity"),u=this._findBinarySensor(i,"rain"),m="on"===p?.state?.state,h="on"===u?.state?.state,f=e.length>0&&e.every(e=>"unavailable"===e.state?.state)||p&&!m,v=p?.state?.last_changed,g=f&&v?(0,c.aQ)(v):null;return s&&!this._countdownTimer?this._countdownTimer=setInterval(()=>this.requestUpdate(),1e3):!s&&this._countdownTimer&&(clearInterval(this._countdownTimer),this._countdownTimer=null),r.qy`
      <div class="irr-content ${f?"irr-offline":""}">

        ${f?r.qy`
          <div class="irr-offline-banner" role="status" aria-live="polite">
            CONTROLLER OFFLINE${g?r.qy` · LAST SEEN ${g}`:""}
          </div>
        `:""}

        <!-- Rain Alert Banner (conditional) -->
        ${f?"":this._renderRainAlert(d,h,o)}

        <!-- Left column: schedules + controller status -->
        <div class="irr-sidebar">
          ${this._renderSchedules(t)}
          ${this._renderControllerStatus(m,l,d,h)}
        </div>

        <!-- Right column: zone grid -->
        <div class="irr-zones" role="list" aria-label="Irrigation zones">
          ${e.map(e=>this._renderZoneRow(e,l||f))}
        </div>

        <!-- Quick Run (collapsible) -->
        ${this._renderQuickRun(e,l||f)}

        <!-- Controls: standby + pause/resume -->
        ${f?"":this._renderControls(n,o,s)}
      </div>
    `}_renderRainAlert(e,t,a){if(!e&&!t)return"";const i=e,s=i?"mdi:weather-pouring":"mdi:weather-rainy",n=i?"RAIN DELAY ACTIVE":"RAIN DETECTED",o=i?"var(--lcars-african-violet)":"var(--lcars-ice)";return r.qy`
      <div class="irr-rain-alert" style="--alert-color:${o}"
           role="alert" aria-live="polite">
        <ha-icon icon="${s}"></ha-icon>
        <span class="irr-rain-alert-label">${n}</span>
        ${i?r.qy`
          <button class="irr-rain-cancel-btn"
            aria-label="Cancel rain delay"
            @click=${()=>this._handleIrrigationToggle(a.entity.entity_id)}>
            CANCEL
          </button>
        `:""}
      </div>
    `}_renderSchedules(e){return e.length?r.qy`
      <div class="irr-schedules" role="list" aria-label="Irrigation schedules">
        <div class="irr-section-label">SCHEDULES</div>
        ${e.map(({entity:e,state:t})=>{const a=this._friendlyName(t,e),i=!1!==t.attributes?.Enabled&&"off"!==t.state,s=t.attributes?.Type||"Fixed",n=t.attributes?.Duration||"",o=/flex/i.test(s);return r.qy`
            <div class="irr-schedule-strip" role="listitem">
              <button class="irr-schedule-toggle" ?data-on=${i}
                aria-label="${a}: ${i?"enabled":"disabled"}"
                @click=${()=>this._handleIrrigationToggle(e.entity_id)}>
                ${i?"ON":"OFF"}
              </button>
              <span class="irr-schedule-name">${a}</span>
              <span class="irr-schedule-type-badge" ?data-flex=${o}>
                ${o?"FLEX":"FIXED"}
              </span>
              <span class="irr-schedule-duration">${n}</span>
            </div>
          `})}
      </div>
    `:""}_renderControllerStatus(e,t,a,i){return r.qy`
      <div class="irr-controller-status">
        <div class="irr-section-label">CONTROLLER</div>
        <div class="irr-status-row">
          <span class="irr-status-bar" data-state="${e?"on":"alert"}"></span>
          <span class="irr-status-label">${e?"ONLINE":"OFFLINE"}</span>
        </div>
        <div class="irr-status-row">
          <span class="irr-status-bar" data-state="${t?"active":"off"}"></span>
          <span class="irr-status-label">STANDBY ${t?"ON":"OFF"}</span>
        </div>
        <div class="irr-status-row">
          <span class="irr-status-bar" data-state="${a?"delay":"off"}"></span>
          <span class="irr-status-label">RAIN DELAY ${a?"ON":"OFF"}</span>
        </div>
        <div class="irr-status-row">
          <span class="irr-status-bar" data-state="${i?"on":"off"}"></span>
          <span class="irr-status-label">${i?"RAIN":"NO RAIN"}</span>
        </div>
      </div>
    `}_renderZoneRow(e,t){const{entity:a,state:i}=e,s=a.entity_id,o=this._friendlyName(i,a),c="on"===i.state,d=(0,l.aK)(i.state,t),p=this._getZoneNumber(i),u=this._getZoneProgress(i),m=this._getCountdown(i),h=i.attributes?.entity_picture,f=this._expandedZone===s;return r.qy`
      <div class="irr-zone-row ${c?"active":""}" role="listitem">
        <!-- Zone photo thumbnail or fallback -->
        <div class="irr-zone-thumb"
             style="--zone-border:${d}"
             @click=${()=>(0,n.Hv)(s)}>
          ${h?r.qy`
            <img src="${h}" alt="${o} zone photo"
                 loading="lazy" referrerpolicy="no-referrer"
                 @error=${e=>{e.target.style.display="none",e.target.nextElementSibling.style.display="flex"}}>
            <span class="irr-zone-thumb-fallback" style="display:none">
              <ha-icon icon="${S[i.attributes?.Type]||"mdi:grass"}"></ha-icon>
            </span>
          `:r.qy`
            <span class="irr-zone-thumb-fallback">
              <ha-icon icon="${S[i.attributes?.Type]||"mdi:grass"}"></ha-icon>
            </span>
          `}
          <span class="irr-zone-num">${p}</span>
        </div>

        <!-- Zone action button -->
        <button class="irr-zone-btn" ?data-on=${c}
          ?disabled=${t}
          aria-label="${c?"Stop":"Start"} watering ${o}"
          @click=${()=>this._handleIrrigationZone(s,!c)}>
          ${c?"STOP":"START"}
        </button>

        <!-- Zone info -->
        <div class="irr-zone-info"
             @click=${()=>{this._expandedZone=f?null:s}}>
          <span class="irr-zone-name">${o}</span>
          <span class="irr-zone-status" style="color:${d}">
            ${"unavailable"===i.state?"OFFLINE":t?"STANDBY":c?"WATERING":"IDLE"}
          </span>
        </div>

        <!-- Countdown timer (when active) -->
        ${m?r.qy`
          <span class="irr-zone-countdown">${m}</span>
        `:""}

        <!-- Active zone fill bar (barberpole) -->
        ${c?r.qy`
          <div class="irr-zone-fill active" role="progressbar"
            aria-label="Watering progress" aria-valuemin="0" aria-valuemax="100"
            aria-valuenow="${Math.round(u)}"
            style="width:${u}%"></div>
        `:""}

        <!-- Expanded detail row -->
        ${f?this._renderZoneDetail(i):""}
      </div>
    `}_renderZoneDetail(e){const t=e.attributes||{},a=t.Shade,i=t.Type,s=t.Slope,n=t.Summary,o=[];return a&&o.push({icon:k[a]||"mdi:weather-sunny",label:a,color:"var(--lcars-sunflower)"}),i&&o.push({icon:S[i]||"mdi:grass",label:i,color:"var(--lcars-ice)"}),s&&o.push({icon:C[s]||"mdi:triangle-outline",label:s,color:"var(--lcars-butterscotch)"}),r.qy`
      <div class="irr-zone-detail">
        <div class="irr-zone-attrs">
          ${o.map(e=>r.qy`
            <span class="irr-zone-attr-badge" style="--badge-color:${e.color}">
              <ha-icon icon="${e.icon}"></ha-icon>
              ${e.label}
            </span>
          `)}
        </div>
        ${n?r.qy`<div class="irr-zone-summary">${n}</div>`:""}
      </div>
    `}_renderQuickRun(e,t){return r.qy`
      <div class="irr-quickrun">
        <button class="irr-quickrun-header"
          aria-expanded="${this._quickRunOpen}"
          @click=${()=>{this._quickRunOpen=!this._quickRunOpen}}>
          QUICK RUN ${this._quickRunOpen?"▾":"▸"}
        </button>
        ${this._quickRunOpen?r.qy`
          <div class="irr-quickrun-body">
            <!-- Zone selector -->
            <div class="irr-quickrun-row">
              <span class="irr-quickrun-label">ZONES</span>
              <div class="irr-zone-selector">
                ${e.map(({entity:e,state:a})=>{const i=this._getZoneNumber(a),s=e.entity_id,n=this._quickRunZones.includes(s);return r.qy`
                    <button class="irr-zone-select-btn" ?data-selected=${n}
                      ?disabled=${t}
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
                ${[3,5,10,15,20].map(e=>r.qy`
                  <button class="irr-duration-btn" ?data-selected=${this._quickRunDuration===e}
                    aria-label="${e} minutes" aria-pressed="${this._quickRunDuration===e}"
                    @click=${()=>{this._quickRunDuration=e}}>
                    ${e}M
                  </button>
                `)}
              </div>
            </div>
            <!-- Engage -->
            <button class="irr-engage-btn"
              ?disabled=${!this._quickRunZones.length||t}
              aria-label="Start quick run: ${this._quickRunZones.length} zones for ${this._quickRunDuration} minutes"
              @click=${()=>this._handleQuickRun()}>
              ENGAGE
            </button>
          </div>
        `:""}
      </div>
    `}_renderControls(e,t,a){return r.qy`
      <div class="irr-controls">
        ${e?r.qy`
          <button class="irr-control-btn" ?data-on=${"on"===e.state?.state}
            role="switch" aria-checked="${"on"===e.state?.state}"
            aria-label="Standby mode: ${"on"===e.state?.state?"active":"inactive"}"
            @click=${()=>this._handleIrrigationToggle(e.entity.entity_id)}>
            STANDBY
          </button>
        `:""}
        ${t?r.qy`
          <button class="irr-control-btn" ?data-on=${"on"===t.state?.state}
            aria-label="Rain delay: ${"on"===t.state?.state?"active, click to cancel":"inactive, click to activate 24 hour delay"}"
            @click=${()=>this._handleIrrigationToggle(t.entity.entity_id)}>
            RAIN DELAY
          </button>
        `:""}
        ${a?r.qy`
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
    `}}customElements.get("lcars-irrigation-panel")||customElements.define("lcars-irrigation-panel",E);const z=r.AH`
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
    opacity: 0;
    visibility: hidden;
    transition: opacity 300ms ease-out, visibility 300ms ease-out;
  }
  /* WES-012: Delay showing connecting overlay to avoid flash when cameras load quickly */
  .camera-frame[data-state="connecting"] .camera-connecting-overlay {
    opacity: 1;
    visibility: visible;
    transition: opacity 300ms ease-out 500ms, visibility 300ms ease-out 500ms;
  }
  .camera-frame[data-state="connecting"] .camera-offline-overlay,
  .camera-frame[data-state="offline"] .camera-connecting-overlay {
    opacity: 0;
    visibility: hidden;
  }
  .camera-frame[data-state="offline"] .camera-offline-overlay {
    opacity: 1;
    visibility: visible;
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
    color: var(--lcars-gray);
  }
  .camera-offline-text {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    color: var(--lcars-gray);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    animation: cam-text-breathe 4s ease-in-out infinite;
  }
  /* P3 GEORDI-015: last signal timestamp */
  .camera-last-signal {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data, 0.875rem);
    color: var(--lcars-gray);
    text-transform: uppercase;
    margin-top: 0.25rem;
  }
  @keyframes cam-text-breathe {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }

  /* State-driven visibility for live state */
  .camera-frame[data-state="live"] .camera-connecting-overlay,
  .camera-frame[data-state="live"] .camera-offline-overlay {
    opacity: 0;
    visibility: hidden;
    transition: opacity 300ms ease-out, visibility 300ms ease-out;
  }
  .camera-frame[data-state="offline"] {
    border-color: var(--lcars-gray);
    opacity: 1;
  }
  /* P3 WESLEY-IDEA-002: CRT static effect for offline cameras */
  .camera-frame[data-state="offline"] .camera-offline-overlay {
    background:
      repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px),
      repeating-linear-gradient(90deg, rgba(120,120,120,0.02) 0px, rgba(80,80,80,0.04) 1px, transparent 2px, transparent 3px),
      linear-gradient(180deg, rgba(40,40,40,1) 0%, rgba(25,25,25,1) 100%);
    will-change: background-position;
    animation: cam-static-drift 8s linear infinite;
  }
  @keyframes cam-static-drift {
    from { background-position: 0 0, 0 0, 0 0; }
    to   { background-position: 0 0, 0 -100px, 0 0; }
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
    .camera-frame[data-state="offline"] .camera-offline-overlay { animation: none; }
    .camera-offline-text { animation: none; }
  }

  /* P3 WESLEY-IDEA-011: Disclosure button for hidden sensor tiers */
  .camera-disclosure-btn {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    width: 100%;
    min-height: 24px;
    padding: 0.25rem 0.5rem;
    background: none;
    border: none;
    border-top: 1px solid var(--lcars-gray);
    color: var(--lcars-gray);
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-label, 0.75rem);
    text-transform: uppercase;
    cursor: pointer;
    letter-spacing: 0.05em;
  }
  .camera-disclosure-btn:hover { color: var(--lcars-ice); }
  .camera-disclosure-btn:focus-visible {
    outline: 2px solid var(--lcars-ice);
    outline-offset: 2px;
  }
  .disclosure-triangle {
    display: inline-block;
    transition: transform var(--lcars-transition, 200ms);
  }
  .disclosure-triangle[data-open] {
    transform: rotate(90deg);
  }
  .camera-disclosure-content {
    max-height: 0;
    overflow: hidden;
    transition: max-height var(--lcars-transition, 200ms) ease;
  }
  .camera-disclosure-content[data-open] {
    max-height: 50rem;
  }
  .camera-diag-divider {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-label, 0.75rem);
    color: var(--lcars-gray);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 0.25rem 0;
    border-bottom: 1px solid var(--lcars-gray);
    margin: 0.25rem 0;
  }

  /* P3 DATA-014 / WESLEY-UX-001: Configure CTA for long-unavailable cameras */
  .camera-config-cta {
    background: var(--lcars-gold);
    color: var(--lcars-black);
  }
  .camera-config-cta:hover { filter: brightness(1.15); }
`,A=new Set(["motion","occupancy","sound","connectivity","battery","recording"]);function q(e){if("binary_sensor"===e.domain)return!0;const t=e.state?.attributes?.device_class||"";return A.has(t)}const P={unifiprotect:"UniFi Protect",blink:"Blink",nest:"Nest"};function T(e){return P[e]||e.replace(/_/g," ").replace(/\b\w/g,e=>e.toUpperCase())}class M extends x.j{get panelType(){return"camera"}get defaultPanelTitle(){return"Camera"}get frameColor(){return"var(--lcars-butterscotch)"}static get styles(){return[...super.styles,h.PF,h.yW,z]}static get properties(){return{...super.properties,_disclosureOpen:{type:Boolean}}}constructor(){super(),this._disclosureOpen=!1}renderContent(){const{cameras:e,sensors:t,controls:a}=this._partitionDeviceEntities(this.group.entities),i=this._shortDeviceName(this.group.device),{hero:s,operational:n,diagnostic:l}=(0,o.uf)(t,q),d=n.length+l.length,p=e[0],u=p&&this._isOff(p.state),m=p?function(e){if(!e)return"";const t=Date.now()-new Date(e).getTime();if(t<0||isNaN(t))return"";const a=Math.floor(t/6e4);if(a<5)return"";const r=Math.floor(a/60),i=Math.floor(r/24);return i>0?`${i}D ${r%24}H AGO`:r>0?`${r}H ${a%60}M AGO`:`${a}M AGO`}(p.state?.last_changed):"",h=this.group.entities.every(e=>"unavailable"===e.state?.state||"unknown"===e.state?.state),f=u&&h,v=p?.entity?.platform||"",b=this.group.device?.id||"";return r.qy`
      <div class="camera-content">
        <div class="device-panel-sensors" role="list" aria-label="${i} sensors">
          ${s.map(({entity:e,state:t})=>{const a=this._friendlyName(t,e),{text:i}=(0,c.kp)(t,e?.entity_category||""),s=this._getSensorIndicatorColor(t);return r.qy`
              <lcars-sensor-row
                label="${a}"
                value="${i}"
                color="${s}"
                entity-id="${e.entity_id}">
              </lcars-sensor-row>
            `})}
          ${d>0?r.qy`
            <button class="camera-disclosure-btn"
              aria-expanded="${this._disclosureOpen}"
              aria-controls="cam-disclosure-${b}"
              @click=${()=>{g.e.play("entityInfo"),this._disclosureOpen=!this._disclosureOpen}}
              @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),g.e.play("entityInfo"),this._disclosureOpen=!this._disclosureOpen)}}>
              <span class="disclosure-triangle" ?data-open=${this._disclosureOpen}>▸</span>
              <span>${d} ${l.length>0&&0===n.length?"DIAGNOSTIC":"MORE"}</span>
            </button>
            <div id="cam-disclosure-${b}"
              class="camera-disclosure-content"
              ?data-open=${this._disclosureOpen}>
              ${n.map(({entity:e,state:t})=>{const a=this._friendlyName(t,e),{text:i}=(0,c.kp)(t,e?.entity_category||"");return r.qy`
                  <lcars-sensor-row
                    label="${a}"
                    value="${i}"
                    color="var(--lcars-gray)"
                    entity-id="${e.entity_id}">
                  </lcars-sensor-row>
                `})}
              ${l.length>0&&n.length>0?r.qy`
                <div class="camera-diag-divider">DIAGNOSTICS</div>
              `:""}
              ${l.map(({entity:e,state:t})=>{const a=this._friendlyName(t,e),{text:i}=(0,c.kp)(t,e?.entity_category||"");return r.qy`
                  <lcars-sensor-row
                    label="${a}"
                    value="${i}"
                    color="var(--lcars-gray)"
                    entity-id="${e.entity_id}">
                  </lcars-sensor-row>
                `})}
            </div>
          `:""}
        </div>

        <div class="device-panel-media"
          ?data-offline=${u}>
          ${e.map(({entity:e,state:t},a)=>{const s=function(e){const t=e?.attributes?.entity_picture;if(!t)return"";const a=e.last_updated||e.last_changed||"",r=t.includes("?")?"&":"?";return`${t}${r}_cb=${encodeURIComponent(a)}`}(t),n=0===a?i:this._friendlyName(t,e),o=this._isOff(t)||!s?"offline":"connecting";return r.qy`
              <div class="camera-frame" data-state="${o}"
                style="${a>0?"margin-top:var(--lcars-gap);border-top:2px solid var(--panel-frame-color)":""}"
                aria-busy="${"connecting"===o}"
                @click=${()=>this._handleEntityClick(e.entity_id)}>
                <div class="camera-connecting-overlay" aria-hidden="true">
                  <span class="camera-connecting-text">ESTABLISHING LINK</span>
                </div>
                <div class="camera-offline-overlay" aria-hidden="true">
                  <ha-icon icon="mdi:video-off"></ha-icon>
                  <span class="camera-offline-text">VIEWSCREEN OFFLINE</span>
                  ${m?r.qy`<span class="camera-last-signal">LAST SIGNAL: ${m}</span>`:""}
                </div>
                ${s?r.qy`<img src="${s}" alt="${n} camera feed"
                              data-entity="${e.entity_id}"
                              .src=${s}
                              @load=${e=>{const t=e.target.closest(".camera-frame");t&&(t.setAttribute("data-state","live"),t.removeAttribute("aria-busy"))}}
                              @error=${e=>{const t=e.target.closest(".camera-frame");t&&(t.setAttribute("data-state","offline"),t.removeAttribute("aria-busy"))}} />`:r.qy`<div class="camera-spacer"></div>`}
              </div>`})}
        </div>

        <div class="device-panel-controls" aria-label="${i} controls">
          ${f?r.qy`
            <button class="device-control-btn camera-config-cta"
              @click=${()=>{history.pushState(null,"",`/config/devices/device/${b}`),window.dispatchEvent(new Event("location-changed"))}}
              aria-label="Configure ${i} in ${T(v)}">
              <ha-icon icon="mdi:cog"></ha-icon>
              <span>${v?`CONFIGURE ${i.toUpperCase()} IN ${T(v).toUpperCase()}`:`${i.toUpperCase()} REQUIRES SETUP`}</span>
            </button>
          `:""}
          ${a.map(({entity:e,state:t})=>{const a=this._friendlyName(t,e),i="on"===t.state,s=this._isOff(t),n=e.entity_id.split(".")[0];return r.qy`
              <button class="device-control-btn" ?data-on=${i} ?data-off=${s}
                @click=${()=>o.Zz.has(n)?this._handleToggle(e.entity_id):this._handleEntityClick(e.entity_id)}
                title="${a}: ${t.state}"
                aria-label="${a}: ${t.state}">
                <ha-icon .icon=${this._getEntityIcon(t)}></ha-icon>
                <span>${a}</span>
              </button>
            `})}
        </div>
      </div>
    `}}customElements.get("lcars-camera-panel")||customElements.define("lcars-camera-panel",M);const N=r.AH`
  :host {
    display: block;
  }

  /* ═══ Device Panel Content ═══ */
  .lcars-device-panel {
    --panel-frame-color: var(--lcars-butterscotch);
    display: grid;
    gap: var(--lcars-gap);
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
  .scrubber-scale-label {
    position: absolute;
    bottom: 0.25rem;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.5rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--lcars-space-white);
    opacity: 0.7;
    z-index: 1;
    text-shadow: 0 0 4px rgba(0,0,0,0.8);
  }

  /* 4X-54: Filter Life Segment Bar */
  .filter-life-row { display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0.5rem; }
  .filter-life-label { flex: 1; font-size: 0.75rem; color: var(--lcars-space-white); text-transform: uppercase; }
  .filter-life-pct { font-size: var(--lcars-font-size-data); font-weight: 700; color: var(--lcars-ice); }
  .filter-segments { display: flex; gap: 2px; padding: 0 0.5rem 0.375rem; }
  .filter-seg { flex: 1; height: 6px; border-radius: 1px; background: var(--lcars-gray); opacity: 0.3; }
  .filter-seg.lit { background: var(--lcars-ice); opacity: 1; }
  .filter-seg.warn { background: var(--lcars-golden-orange); opacity: 1; }
  .filter-seg.critical { background: var(--lcars-tomato); opacity: 1; animation: lcars-filter-critical 1.5s ease-in-out infinite; }
  @keyframes lcars-filter-critical { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

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

  /* P3 GEORDI-006: Offline atmoscrubber — gray outline, no particles */
  .atmoscrubber-offline .atmoscrubber,
  .atmoscrubber-offline .scrubber-offline-state {
    border-color: var(--lcars-gray);
    box-shadow: none;
    opacity: 1;
    animation: scrubber-offline-pulse 4s ease-in-out infinite;
  }
  .atmoscrubber-offline .atmoscrubber::before,
  .atmoscrubber-offline .atmoscrubber::after,
  .scrubber-offline-state::before,
  .scrubber-offline-state::after {
    display: none;
  }
  .scrubber-offline-state .scrubber-score {
    color: var(--lcars-gray);
    font-size: var(--lcars-font-size-data, 0.875rem);
    text-shadow: none;
  }
  @keyframes scrubber-offline-pulse {
    0%, 100% { border-color: var(--lcars-gray); }
    50% { border-color: rgba(102, 102, 136, 0.3); }
  }

  @media (prefers-reduced-motion: reduce) {
    .atmoscrubber::before,
    .atmoscrubber::after,
    .atmoscrubber.scrubber-idle { animation: none; }
    .scrubber-offline-state { animation: none; }
    .filter-seg.critical { animation: none; }
  }
`;class I extends x.j{_envHistoryCache=new Map;get panelType(){return"environment"}get defaultPanelTitle(){return"Environment"}get frameColor(){return"var(--lcars-blue)"}static get styles(){return[...super.styles,h.PF,h.yW,N]}_partitionEnvironmentEntities(e,t){const a=[],r=[],i=[],s=[],n=[],l=[];for(const t of e){const e=t.state?.attributes?.device_class||"",l=t.domain;["fan","switch","button","number","select","light"].includes(l)?n.push(t):"sensor"!==l||!/filter|wick/i.test(t.entity?.entity_id||"")||"battery"!==e&&""!==e&&e?o.lo.has(e)?r.push(t):e||"sensor"!==l||!o.Rv.test(t.entity?.entity_id||"")?i.push(t):a.push(t):s.push(t)}if(t)for(const e of[...t.diagnostic,...t.config]){const t=this._getEntityState(e.entity_id);t&&l.push({entity:e,domain:e.entity_id.split(".")[0],state:t})}return{score:a,airQuality:r,telemetry:i,filterLife:s,controls:n,diagnostics:l}}_getScrubberHue(e){return null==e||e<=50?120:e<=100?120-(e-50)/50*70:e<=150?50-(e-100)/50*35:Math.max(0,15-(e-150)/100*15)}_getAQColor(e){return null==e||e<=50?"var(--lcars-ice)":e<=100?"var(--lcars-sunflower)":e<=150?"var(--lcars-butterscotch)":e<=200?"var(--lcars-peach)":"var(--lcars-tomato)"}_getScrubberSpeed(e){return null==e||0===e?20:2+18*Math.pow(1-e/100,1.5)}async _getSparklineData(e,t){return(0,p.s)(this.hass,e,t,this._envHistoryCache)}_renderSparkline(e,t,a){return(0,p.K)(e,{color:t,label:a,className:"env-sparkline"})}renderBadge(){const{score:e,airQuality:t}=this._partitionEnvironmentEntities(this.group.entities,this._getDeviceCategoryEntities(this.group.device.id)),a=e[0],i=a?parseFloat(a.state.state):null,s=t.find(e=>"pm25"===(e.state?.attributes?.device_class||"")),n=s?parseFloat(s.state.state):null,o=null!=i&&Number.isFinite(i)?i:null!=n&&Number.isFinite(n)?Math.min(300,4*n):null,l=this._getAQColor(o);return a?r.qy`<span style="color:${l}">${null!=i&&Number.isFinite(i)?Math.round(i):"—"}</span>`:r.qy``}renderContent(){const e=this._getDeviceCategoryEntities(this.group.device.id),{score:t,airQuality:a,telemetry:i,filterLife:s,controls:n,diagnostics:o}=this._partitionEnvironmentEntities(this.group.entities,e),l=this._shortDeviceName(this.group.device)||"Environment",d=t.length>0||a.length>0,p=d&&[...t,...a].every(e=>"unavailable"===e.state?.state||"unknown"===e.state?.state),u=t[0],m=u?parseFloat(u.state.state):null,h=a.find(e=>"pm25"===(e.state?.attributes?.device_class||"")),f=h?parseFloat(h.state.state):null,v=null!=m&&Number.isFinite(m)?m:null!=f&&Number.isFinite(f)?Math.min(300,4*f):null,b=this._getScrubberHue(v),y=this._getAQColor(v),_=n.find(e=>"fan"===e.domain),w=_?.state,x=w?.attributes?.percentage??null,$=w?.attributes?.preset_modes||[],k=w?.attributes?.preset_mode||"",S=!_||"off"===w?.state||0===x,C=this._getScrubberSpeed(S?0:x),E=!_,z=n.filter(e=>"fan"!==e.domain),A=[...t,...a].map(e=>e.entity.entity_id);A.length>0&&this._getSparklineData(this.group.device.id,A).then(e=>{e&&this.requestUpdate()});const q=this._envHistoryCache.get(this.group.device.id)?.data||{};return r.qy`
      <div class="env-content ${E?"sensor-only":""}">
        <!-- Sensors (left) -->
        <div class="env-sensors" role="list" aria-label="${l} sensors">
          ${a.map(({entity:e,state:t})=>{const a=this._friendlyName(t,e),{text:i}=this._formatSensorValue(t,e),s=this._getSensorIndicatorColor(t,e?.entity_category);return r.qy`
              <lcars-sensor-row
                label="${a}"
                value="${i}"
                color="${s}"
                entity-id="${e.entity_id}">
              </lcars-sensor-row>
            `})}
          ${i.map(({entity:e,state:t})=>{const a=this._friendlyName(t,e),{text:i}=this._formatSensorValue(t,e),s=this._getSensorIndicatorColor(t,e?.entity_category);return r.qy`
              <lcars-sensor-row
                label="${a}"
                value="${i}"
                color="${s}"
                entity-id="${e.entity_id}">
              </lcars-sensor-row>
            `})}
          ${s.map(({entity:e,state:t})=>{const a=this._friendlyName(t,e),i=Math.min(100,Math.max(0,parseFloat(t.state)||0)),s=Math.round(i/10),n=i<25?"var(--lcars-tomato)":i<75?"var(--lcars-golden-orange)":"var(--lcars-ice)";return r.qy`
              <div class="filter-life-row">
                <span class="filter-life-label">${a}</span>
                <span class="filter-life-pct" style="color:${n}">${Math.round(i)}%</span>
              </div>
              <div class="filter-segments" aria-label="Filter life: ${Math.round(i)}%">
                ${Array.from({length:10},(e,t)=>{const a=t<s?i<25?"lit critical":i<75?"lit warn":"lit":"";return r.qy`<div class="filter-seg ${a}"></div>`})}
              </div>
            `})}
          ${o.length>0?r.qy`
            <lcars-section-divider label="DIAGNOSTICS"></lcars-section-divider>
            ${o.map(({entity:e,state:t})=>{const a=this._friendlyName(t,e),{text:i}=this._formatSensorValue(t,e),s=this._getSensorIndicatorColor(t,e?.entity_category);return r.qy`
                <lcars-sensor-row
                  label="${a}"
                  value="${i}"
                  color="${s}"
                  entity-id="${e.entity_id}">
                </lcars-sensor-row>
              `})}
          `:""}
        </div>

        <!-- Atmoscrubber Cylinder -->
        ${d&&!p?r.qy`
          <div class="atmoscrubber-container" role="meter"
            aria-valuenow="${null!=v?Math.round(v):""}"
            aria-valuemin="0" aria-valuemax="300"
            aria-label="Air quality: ${null!=v?Math.round(v):"unknown"}">
            <div class="atmoscrubber ${S?"scrubber-idle":""}"
              style="--scrubber-hue:${Math.round(b)};--scrubber-speed:${C.toFixed(1)}s;--atmos-quality-color:${y}">
              ${u?r.qy`
                <div class="scrubber-score">${null!=m&&Number.isFinite(m)?Math.round(m):"—"}</div>
                <div class="scrubber-scale-label">AQI</div>
              `:h?r.qy`
                <div class="scrubber-score">${null!=f&&Number.isFinite(f)?Math.round(f):"—"}</div>
                <div class="scrubber-scale-label">PM2.5</div>
              `:""}
            </div>
          </div>
        `:d&&p?r.qy`
          <div class="atmoscrubber-container atmoscrubber-offline"
            role="img" aria-label="Air quality sensor offline">
            <div class="atmoscrubber scrubber-idle scrubber-offline-state">
              <div class="scrubber-score">OFFLINE</div>
            </div>
          </div>
        `:""}

        <!-- Controls (right) — only for purifiers -->
        ${E?"":r.qy`
          <div class="env-controls" aria-label="${l} controls">
            ${_?r.qy`
              <button class="device-control-btn"
                ?data-on=${"on"===w?.state}
                ?data-off=${this._isOff(w)}
                @click=${()=>this._handleToggle(_.entity.entity_id)}
                title="Fan: ${w?.state}">
                <ha-icon .icon=${"mdi:fan"}></ha-icon>
                <span>${"on"===w?.state?`${x||""}%`:"Off"}</span>
              </button>
              ${$.length>0?r.qy`
                <div class="lcars-option-strip" role="radiogroup" aria-label="Preset mode">
                  <span class="lcars-option-strip-label">Mode</span>
                  <div class="lcars-option-strip-btns">
                    ${$.map(e=>r.qy`
                      <button class="lcars-option-btn"
                        role="radio"
                        aria-checked="${e===k}"
                        ?data-selected=${e===k}
                        @click=${()=>{(this.hass.states[_.entity.entity_id]?.attributes?.preset_modes||[]).includes(e)&&(g.e.play("fanToggle"),this.hass.callService("fan","set_preset_mode",{entity_id:_.entity.entity_id,preset_mode:e}))}}>
                        ${e}
                      </button>
                    `)}
                  </div>
                </div>
              `:""}
            `:""}
            ${z.map(({entity:e,state:t})=>{const a=this._friendlyName(t,e),i="on"===t.state,s=this._isOff(t);return r.qy`
                <button class="device-control-btn" ?data-on=${i} ?data-off=${s}
                  @click=${()=>this._handleToggle(e.entity_id)}
                  title="${a}: ${t.state}">
                  <ha-icon .icon=${this._getEntityIcon(t)}></ha-icon>
                  <span>${a}</span>
                </button>
              `})}
          </div>
        `}

        <!-- Sparklines -->
        <div class="env-sparklines" aria-label="24-hour history">
          ${[...t,...a].map(({entity:e,state:t})=>{const a=t.attributes?.device_class||"",r=(0,c.Z2)(a,this._friendlyName(t,e),e.entity_id),i=q[e.entity_id],s="pm25"===a?"var(--lcars-peach)":"carbon_dioxide"===a?"var(--lcars-sunflower)":"volatile_organic_compounds_parts"===a||"volatile_organic_compounds"===a?"var(--lcars-african-violet)":"var(--lcars-ice)";return this._renderSparkline(i,s,r)})}
        </div>
      </div>
    `}}customElements.get("lcars-environment-panel")||customElements.define("lcars-environment-panel",I),a(6564);const D=r.AH`
  :host {
    display: block;
  }

  .lcars-device-panel {
    --panel-frame-color: var(--lcars-butterscotch);
    display: grid;
    gap: var(--lcars-gap);
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
    background: var(--panel-frame-color);
    color: var(--lcars-space-white);
    font-size: 1.25rem; font-family: var(--lcars-font);
    cursor: pointer; transition: background 200ms, filter 200ms;
  }
  .climate-sp-btn:hover { filter: brightness(1.2); }
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
  /* HVAC mode strip: per-mode active color via inline --mode-btn-color */
  .climate-modes .climate-mode-btn[data-active] { background: var(--mode-btn-color, var(--panel-frame-color)); }
  /* Aux strips (fan, preset, swing): uniform gold active */
  .climate-aux-strip .climate-mode-btn[data-active] { background: var(--lcars-gold); }
  .climate-mode-btn:hover:not([data-active]) { background: var(--lcars-gray); }
  .climate-mode-btn:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
  .climate-aux-controls {
    grid-area: auxctrl;
    display: flex; flex-direction: column; gap: var(--lcars-gap);
  }
  .climate-aux-strip { display: flex; gap: 1px; flex-wrap: wrap; align-items: center; }
  .climate-aux-strip-label {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    color: var(--lcars-sunflower);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    width: 100%;
    margin-bottom: 0.125rem;
  }

  /* 4X-56: Toggle-style aux button for portable AC switches */
  .climate-toggle-btn { display: flex; align-items: center; gap: 0.375rem; }
  .climate-toggle-btn ha-icon { --mdc-icon-size: 14px; flex-shrink: 0; }
  .climate-toggle-btn[data-active] { background: var(--toggle-active-bg, var(--lcars-gold)); color: var(--lcars-black); }

  /* 4X-56: Inline label for aux number controls */
  .climate-aux-inline-label { font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); color: var(--lcars-text-heading, var(--lcars-sunflower)); text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap; margin-right: 0.5rem; }
  .climate-timer-value { font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); color: var(--lcars-gold, var(--lcars-sunflower)); text-transform: uppercase; font-weight: 700; min-width: 3rem; text-align: center; }

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
`;class O extends x.j{_climateSetpointDebouncer=null;disconnectedCallback(){super.disconnectedCallback(),this._climateSetpointDebouncer&&(this._climateSetpointDebouncer.cancel(),this._climateSetpointDebouncer=null)}get panelType(){return"climate"}get defaultPanelTitle(){return"Thermostat"}get frameColor(){const e=this.group?.entities?.find(e=>"climate"===e.domain)?.state;return(0,l.OX)(e?.attributes?.hvac_action||"off")}static get styles(){return[...super.styles,h.PF,h.yW,D]}_partitionClimateEntities(e,t){const a=[],r=[],i=[],s=[],n=[],l=[],c=new Set(["problem","heat","cold","connectivity","battery","tamper","smoke","safety"]),d=["eco_mode","turbo_mode","swing_mode"],p=["beep"];for(const t of e){const e=t.domain;if("climate"!==e){if("binary_sensor"===e){const e=t.state?.attributes?.device_class||"";if(c.has(e)){i.push(t);continue}}if("switch"===e){const e=t.entity?.entity_id||"";if(p.some(t=>e.includes(t))){s.push(t);continue}if(d.some(t=>e.includes(t))){n.push(t);continue}}"number"!==e?(o.Xt.has(e),r.push(t)):l.push(t)}else a.push(t)}if(t)for(const e of t.diagnostic||[]){const t=this._getEntityState(e.entity_id);t&&s.push({entity:e,domain:e.entity_id.split(".")[0],state:t})}return{climate:a,sensors:r,faults:i,diagnostics:s,auxSwitches:n,auxNumbers:l}}_isDualSetpoint(e){return"heat_cool"===e?.attributes?.hvac_mode||null!=e?.attributes?.target_temp_low&&null!=e?.attributes?.target_temp_high}_renderClimateArc(e,t,a,i,s,n,o,l,c){const d=100,p=120,u=i-a||1,m=Math.max(0,Math.min(1,(e-a)/u)),h=Math.round(40*m),f=Math.PI/40,v=Math.max(0,Math.min(1,(t-a)/u)),g=Math.PI-Math.PI*v,b=d+80*Math.cos(g),y=p-80*Math.sin(g);let _=0,w=0;n&&null!=o&&null!=l&&(_=Math.round((o-a)/u*40),w=Math.round((l-a)/u*40));const x="off"!==c&&"idle"!==c,$=[];for(let e=0;e<40;e++){const t=Math.PI-(e+.5)*f,a=d+74*Math.cos(t),r=p-74*Math.sin(t),i=d+86*Math.cos(t),o=p-86*Math.sin(t);let l="var(--lcars-disabled)",c="0.2";e<h&&(n?e<_?(l="var(--lcars-ice)",c="0.8"):e<=w?(l="var(--lcars-sunflower)",c="1"):(l="var(--lcars-butterscotch)",c="0.8"):(l=s,c="1")),$.push({x1:a,y1:r,x2:i,y2:o,color:l,opacity:c})}return r.qy`
      <svg class="climate-arc" viewBox="0 0 200 140" role="meter"
        aria-valuemin="${a}" aria-valuemax="${i}" aria-valuenow="${e}"
        aria-label="Temperature: ${e}°, target ${t}°">

        <!-- Background segments (dim ticks) -->
        ${$.map(e=>r.qy`
          <line x1="${e.x1}" y1="${e.y1}" x2="${e.x2}" y2="${e.y2}"
            stroke="${e.color}" stroke-width="3" stroke-linecap="round" opacity="${e.opacity}" />
        `)}

        <!-- Outer halo ring at 40% opacity -->
        <path d="M ${16},${p} A ${84},${84} 0 1,1 ${184},${p}"
          fill="none" stroke="${s}" stroke-width="1.5" opacity="0.4"
          class="${x?"arc-halo-active":""}" />

        <!-- Target marker: 6px dot with stroke ring -->
        ${null!=t?r.qy`
          <circle cx="${b}" cy="${y}" r="4" fill="${s}"
            stroke="var(--lcars-black)" stroke-width="2" />
        `:""}

        <!-- Temperature readout (Compliance #7: mapped to --lcars-font-size-title) -->
        <text x="${d}" y="${104}" text-anchor="middle" fill="${s}"
          font-family="var(--lcars-font)" font-size="38" font-weight="bold">
          ${null!=e&&Number.isFinite(e)?Math.round(e):"—"}°
        </text>

        <!-- HVAC action label -->
        <text x="${d}" y="${126}" text-anchor="middle" fill="${s}"
          font-family="var(--lcars-font)" font-size="10" opacity="0.7">
          ${c.toUpperCase().replace(/_/g," ")}
        </text>
      </svg>
    `}_handleClimateSetpoint(e,t,a,r,i){g.e.play("climateAdjust");const s=(0,d.A_)(a,t);this._climateSetpointDebouncer||(this._climateSetpointDebouncer=(0,d.eU)((e,t)=>{this.hass.callService("climate","set_temperature",{entity_id:e,...t})},1500));const n=r?{["low"===i?"target_temp_low":"target_temp_high"]:s}:{temperature:s};this._climateSetpointDebouncer.call(e,n)}renderBadge(){const e=this.group?.entities?.find(e=>"climate"===e.domain)?.state,t=e?.attributes?.hvac_action||"off",a=(0,l.OX)(t);return r.qy`<span style="color:${a}">${t.toUpperCase()}</span>`}renderContent(){const e=this._getDeviceCategoryEntities(this.group.device.id),{climate:t,sensors:a,faults:i,diagnostics:s,auxSwitches:n,auxNumbers:o}=this._partitionClimateEntities(this.group.entities,e),c=this._shortDeviceName(this.group.device)||"Thermostat";if(0===t.length)return r.qy``;const d=t[0],p=d.state,u=p?.attributes||{},m=null!=u.current_temperature?Number(u.current_temperature):null,h=u.hvac_action||"off",f=(0,l.OX)(h),v=this._isDualSetpoint(p),b=v?(Number(u.target_temp_low)+Number(u.target_temp_high))/2:null!=u.temperature?Number(u.temperature):null,y=v?Number(u.target_temp_low):null,_=v?Number(u.target_temp_high):null,w=null!=u.min_temp?Number(u.min_temp):45,x=null!=u.max_temp?Number(u.max_temp):95,$=u.hvac_modes||[],k=u.hvac_mode||"off",S=u.fan_modes||[],C=u.fan_mode||"",E=u.preset_modes||[],z=u.preset_mode||"",A=a.find(e=>"humidity"===(e.state?.attributes?.device_class||"")),q=u.target_temp_step||1,P="off"!==h&&"idle"!==h,T=u.swing_modes||[],M=u.swing_mode||"",N=this._getSiblingZoneTemps();return r.qy`
      <div class="climate-content" data-hvac-action="${h}">

        <!-- Sensor readouts (left column) — Compliance #5: mini-bars not dots -->
        <div class="climate-sensors" role="list" aria-label="${c} readings">
          ${null!=m?r.qy`
            <div class="device-sensor-line" role="listitem" aria-label="Current temperature: ${m}°">
              <div class="sensor-indicator-bar" style="background:${f}"></div>
              <span class="sensor-label">Current</span>
              <span class="sensor-state-value" style="color:${f}">${Math.round(m)}°</span>
            </div>
          `:""}
          ${v?r.qy`
            <div class="device-sensor-line" role="listitem" aria-label="Heat target: ${y}°">
              <div class="sensor-indicator-bar" style="background:var(--lcars-butterscotch)"></div>
              <span class="sensor-label">Heat To</span>
              <span class="sensor-state-value" style="color:var(--lcars-butterscotch)">${y}°</span>
            </div>
            <div class="device-sensor-line" role="listitem" aria-label="Cool target: ${_}°">
              <div class="sensor-indicator-bar" style="background:var(--lcars-ice)"></div>
              <span class="sensor-label">Cool To</span>
              <span class="sensor-state-value" style="color:var(--lcars-ice)">${_}°</span>
            </div>
          `:null!=b?r.qy`
            <div class="device-sensor-line" role="listitem" aria-label="Target temperature: ${b}°">
              <div class="sensor-indicator-bar" style="background:${f}"></div>
              <span class="sensor-label">Target</span>
              <span class="sensor-state-value" style="color:${f}">${b}°</span>
            </div>
          `:""}
          ${A?r.qy`
            <div class="device-sensor-line" role="listitem"
              aria-label="Humidity: ${A.state.state}%"
              @click=${()=>this._handleEntityClick(A.entity.entity_id)}>
              <div class="sensor-indicator-bar" style="background:var(--lcars-ice)"></div>
              <span class="sensor-label">Humidity</span>
              <span class="sensor-state-value" style="color:var(--lcars-ice)">${A.state.state}%</span>
            </div>
          `:""}
          <div class="battery-section-divider"></div>
          <div class="device-sensor-line" role="listitem" aria-label="HVAC mode: ${k}">
            <div class="sensor-indicator-bar" style="background:${f}"></div>
            <span class="sensor-label">Mode</span>
            <span class="sensor-state-value">${k}</span>
          </div>
          ${C?r.qy`
            <div class="device-sensor-line" role="listitem" aria-label="Fan mode: ${C}">
              <div class="sensor-indicator-bar" style="background:var(--lcars-data-accent)"></div>
              <span class="sensor-label">Fan</span>
              <span class="sensor-state-value">${C}</span>
            </div>
          `:""}
          ${i.length>0?r.qy`
            <div class="battery-section-divider"></div>
            <div class="battery-section-label">FAULTS</div>
            ${i.map(({entity:e,state:t})=>{const a=this._friendlyName(t,e),i="on"===t.state?"var(--lcars-tomato)":"var(--lcars-gray)";return r.qy`
                <div class="device-sensor-line" tabindex="0" role="listitem"
                  aria-label="${a}: ${t.state}"
                  @click=${()=>this._handleEntityClick(e.entity_id)}
                  @keydown=${t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._handleEntityClick(e.entity_id))}}>
                  <div class="sensor-indicator-bar" style="background:${i}"></div>
                  <span class="sensor-label">${a}</span>
                  <span class="sensor-state-value" style="color:${i}">${t.state}</span>
                </div>
              `})}
          `:""}
          ${N.length>0?r.qy`
            <div class="battery-section-divider"></div>
            <div class="battery-section-label">OTHER ZONES</div>
            ${N.map(e=>r.qy`
              <div class="device-sensor-line" role="listitem" aria-label="${e.name}: ${e.temp}°">
                <div class="sensor-indicator-bar" style="background:${e.color}"></div>
                <span class="sensor-label">${e.name}</span>
                <span class="sensor-state-value" style="color:${e.color}">${e.temp}°</span>
              </div>
            `)}
          `:""}
        </div>

        <!-- Viewscreen: Compliance #1 (black bg), #6 (mini-elbow brackets) -->
        <div class="climate-viewscreen" tabindex="0"
          @click=${()=>this._handleEntityClick(d.entity.entity_id)}
          @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._handleEntityClick(d.entity.entity_id))}}>
          ${this._renderClimateArc(m,b,w,x,f,v,y,_,h)}

          <!-- Setpoint controls: Compliance #3 (LCARS endcap pills, not circles) -->
          <div class="climate-setpoint-controls">
            ${v?r.qy`
              <div class="climate-setpoint-row">
                <button class="climate-sp-btn sp-decrement" aria-label="Decrease heat target"
                  @click=${e=>{e.stopPropagation(),this._handleClimateSetpoint(d.entity.entity_id,u,y-q,!0,"low")}}>−</button>
                <span class="climate-sp-label" style="color:var(--lcars-butterscotch)">HEAT ${y}°</span>
                <button class="climate-sp-btn sp-increment" aria-label="Increase heat target"
                  @click=${e=>{e.stopPropagation(),this._handleClimateSetpoint(d.entity.entity_id,u,y+q,!0,"low")}}>+</button>
              </div>
              <div class="climate-setpoint-row">
                <button class="climate-sp-btn sp-decrement" aria-label="Decrease cool target"
                  @click=${e=>{e.stopPropagation(),this._handleClimateSetpoint(d.entity.entity_id,u,_-q,!0,"high")}}>−</button>
                <span class="climate-sp-label" style="color:var(--lcars-ice)">COOL ${_}°</span>
                <button class="climate-sp-btn sp-increment" aria-label="Increase cool target"
                  @click=${e=>{e.stopPropagation(),this._handleClimateSetpoint(d.entity.entity_id,u,_+q,!0,"high")}}>+</button>
              </div>
            `:null!=b?r.qy`
              <div class="climate-setpoint-row">
                <button class="climate-sp-btn sp-decrement" aria-label="Decrease target temperature"
                  @click=${e=>{e.stopPropagation(),this._handleClimateSetpoint(d.entity.entity_id,u,b-q,!1)}}>−</button>
                <span class="climate-sp-label" style="color:${f}">TARGET ${b}°</span>
                <button class="climate-sp-btn sp-increment" aria-label="Increase target temperature"
                  @click=${e=>{e.stopPropagation(),this._handleClimateSetpoint(d.entity.entity_id,u,b+q,!1)}}>+</button>
              </div>
            `:""}
          </div>

          <!-- HVAC action feedback bar -->
          ${P?r.qy`
            <div class="climate-action-bar" style="--action-color: ${f}"></div>
          `:""}
        </div>

        <!-- Mode strips: Compliance #2 (connected strip, flat sides) -->
        ${$.length>1?r.qy`
          <div class="climate-modes" role="radiogroup" aria-label="HVAC mode">
            ${$.map((e,t)=>r.qy`
              <button class="climate-mode-btn ${0===t?"mode-first":""} ${t===$.length-1?"mode-last":""}" role="radio"
                aria-checked="${e===k}" ?data-active=${e===k}
                style="--mode-btn-color: ${(0,l.lG)(e)}"
                @click=${()=>{const t=this.hass.states[d.entity.entity_id]?.attributes?.hvac_modes;t?.includes(e)&&(g.e.play("climateAdjust"),this.hass.callService("climate","set_hvac_mode",{entity_id:d.entity.entity_id,hvac_mode:e}))}}>
                ${e.toUpperCase().replace(/_/g," ")}
              </button>
            `)}
          </div>
        `:""}

        <div class="climate-aux-controls">
          ${S.length>1?r.qy`
            <span class="climate-aux-strip-label">FAN</span>
            <div class="climate-aux-strip" role="radiogroup" aria-label="Fan mode">
              ${S.map((e,t)=>r.qy`
                <button class="climate-mode-btn ${0===t?"mode-first":""} ${t===S.length-1?"mode-last":""}" role="radio"
                  aria-checked="${e===C}" ?data-active=${e===C}
                  @click=${()=>{const t=this.hass.states[d.entity.entity_id]?.attributes?.fan_modes;t?.includes(e)&&(g.e.play("climateAdjust"),this.hass.callService("climate","set_fan_mode",{entity_id:d.entity.entity_id,fan_mode:e}))}}>
                  ${e.toUpperCase().replace(/_/g," ")}
                </button>
              `)}
            </div>
          `:""}
          ${E.length>0?r.qy`
            <span class="climate-aux-strip-label">PRESET</span>
            <div class="climate-aux-strip" role="radiogroup" aria-label="Preset mode">
              ${E.map((e,t)=>r.qy`
                <button class="climate-mode-btn ${0===t?"mode-first":""} ${t===E.length-1?"mode-last":""}" role="radio"
                  aria-checked="${e===z}" ?data-active=${e===z}
                  @click=${()=>{const t=this.hass.states[d.entity.entity_id]?.attributes?.preset_modes;t?.includes(e)&&(g.e.play("climateAdjust"),this.hass.callService("climate","set_preset_mode",{entity_id:d.entity.entity_id,preset_mode:e}))}}>
                  ${e.toUpperCase().replace(/_/g," ")}
                </button>
              `)}
            </div>
          `:""}
          ${T.length>1?r.qy`
            <span class="climate-aux-strip-label">SWING</span>
            <div class="climate-aux-strip" role="radiogroup" aria-label="Swing mode">
              ${T.map((e,t)=>r.qy`
                <button class="climate-mode-btn ${0===t?"mode-first":""} ${t===T.length-1?"mode-last":""}" role="radio"
                  aria-checked="${e===M}" ?data-active=${e===M}
                  @click=${()=>{if(!this.hass)return;const t=this.hass.states[d.entity.entity_id]?.attributes?.swing_modes;t?.includes(e)&&(g.e.play("climateAdjust"),this.hass.callService("climate","set_swing_mode",{entity_id:d.entity.entity_id,swing_mode:e}))}}>
                  ${e.toUpperCase().replace(/_/g," ")}
                </button>
              `)}
            </div>
          `:""}
          ${n.length>0?r.qy`
            <div class="climate-aux-strip" role="group" aria-label="System controls">
              ${n.map(e=>{const t=e.entity?.entity_id||"",a="on"===e.state?.state,i=t.includes("eco_mode")?"ECO":t.includes("turbo_mode")?"TURBO":t.includes("swing_mode")?"SWING":(e.state?.attributes?.friendly_name||"SWITCH").toUpperCase(),s=t.includes("eco_mode")?"mdi:leaf":t.includes("turbo_mode")?"mdi:rocket-launch":t.includes("swing_mode")?"mdi:arrow-oscillating":"mdi:toggle-switch-outline",n=t.includes("eco_mode")?"var(--lcars-sunflower)":t.includes("turbo_mode")?"var(--lcars-ice)":"var(--lcars-african-violet)";return r.qy`
                  <button class="climate-mode-btn climate-toggle-btn" role="switch"
                    aria-checked="${String(a)}" ?data-active=${a}
                    style="${a?`--toggle-active-bg: ${n}`:""}"
                    @click=${()=>{this.hass&&(g.e.play("switchToggle"),this.hass.callService("switch","toggle",{entity_id:t}))}}>
                    <ha-icon icon="${s}" aria-hidden="true"></ha-icon>
                    ${i}
                  </button>
                `})}
            </div>
          `:""}
          ${o.length>0?o.map(e=>{const t=e.entity?.entity_id||"",a=e.state?.state,i=null==a||isNaN(a)?null:Number(a),s=e.state?.attributes||{},n=s.min??0,o=s.max??24,l=s.step??1,c=/timer/i.test(t),d=c?"TIMER":(s.friendly_name||"SETTING").toUpperCase();return r.qy`
              <div class="climate-aux-strip" role="group" aria-label="${d}">
                <span class="climate-aux-inline-label">${d}</span>
                <button class="climate-sp-btn sp-decrement" aria-label="Decrease ${d}"
                  ?disabled=${null==i||i<=n}
                  @click=${()=>{this.hass&&null!=i&&this.hass.callService("number","set_value",{entity_id:t,value:Math.max(n,i-l)})}}>−</button>
                <span class="climate-timer-value">${null!=i?c?i>0?`${i}H`:"OFF":`${i}`:"—"}</span>
                <button class="climate-sp-btn sp-increment" aria-label="Increase ${d}"
                  ?disabled=${null==i||i>=o}
                  @click=${()=>{this.hass&&null!=i&&this.hass.callService("number","set_value",{entity_id:t,value:Math.min(o,i+l)})}}>+</button>
              </div>
            `}):""}
        </div>
      </div>
    `}_getSiblingZoneTemps(){if(!this.hass||!this.areaId)return[];const e=(0,f.bS)(this.hass,this.areaId),t=[];for(const a of e){const e=this.hass.areas?.[a];if(!e)continue;const r=Object.values(this.hass.entities||{}),i=this.hass.devices||{},s=new Set;Object.values(i).forEach(e=>{e.area_id===a&&s.add(e.id)});for(const i of r)if(i.entity_id?.startsWith("climate.")&&!i.hidden_by&&!i.disabled_by){if(!(i.area_id===a||!i.area_id&&i.device_id&&s.has(i.device_id)))continue;const r=this.hass.states?.[i.entity_id],n=r?.attributes?.current_temperature;if(null!=n){const a=r.attributes?.hvac_action||"off";t.push({name:e.name,temp:Math.round(Number(n)),color:(0,l.OX)(a)});break}}}return t}}customElements.get("lcars-climate-panel")||customElements.define("lcars-climate-panel",O);const L=r.AH`
  :host { display: block; }

  .lcars-device-panel {
    --panel-frame-color: var(--lcars-butterscotch);
    display: grid;
    gap: var(--lcars-gap);
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
  /* 4X-7: zone sibling telemetry (battery, illuminance) inline pips */
  .zone-siblings { flex-shrink: 0; display: flex; gap: 0.375rem; margin: 0 0.25rem; }
  .zone-sibling-pip { font-size: 0.625rem; color: var(--lcars-sky, #aaaaff); white-space: nowrap; }
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
  .alarm-code-dot { width: 14px; height: 14px; border-radius: 50%; transition: background 200ms; }
  .alarm-pin-error { animation: alarm-shake 400ms ease-out; }
  @keyframes alarm-shake { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-6px); } 40% { transform: translateX(6px); } 60% { transform: translateX(-4px); } 80% { transform: translateX(4px); } }
  .alarm-digit-grid { display: grid; grid-template-columns: repeat(3, minmax(3.5rem, 4.5rem)); gap: 0.5rem; justify-content: center; }
  .alarm-digit-btn {
    height: 4rem; min-width: 3.5rem; border: none; border-radius: var(--lcars-btn-radius);
    background: var(--lcars-sunflower); color: var(--lcars-black);
    font-family: var(--lcars-font); font-size: 1.375rem;
    cursor: pointer; transition: background 200ms;
    -webkit-tap-highlight-color: transparent; /* intentional: custom :active feedback provided */
  }
  .alarm-digit-btn:hover { filter: brightness(1.1); }
  .alarm-digit-btn:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
  .alarm-digit-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    pointer-events: none;
  }
  .alarm-action-btn { background: var(--lcars-disabled); }

  /* ─── Lockout Message ─── */
  .alarm-lockout-msg {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    color: var(--lcars-tomato);
    text-transform: uppercase;
    text-align: center;
    letter-spacing: 0.08em;
    padding: 0.25rem 0;
    animation: lockout-pulse 2s ease-in-out infinite;
  }
  .alarm-lockout-countdown {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    color: var(--lcars-tomato);
    text-transform: uppercase;
    text-align: center;
    letter-spacing: 0.08em;
    opacity: 0.7;
  }
  @keyframes lockout-pulse {
    0%, 100% { opacity: 1; }
    50%      { opacity: 0.5; }
  }

  .panel-pip-strip { position: absolute; bottom: 4px; right: 4px; width: 2rem; height: 3px; background: var(--panel-frame-color); border-radius: 1.5px; opacity: 0.3; }

  @media (max-width: 30rem) {
    .alarm-content {
      grid-template-areas: "media" "sensors" "keypad";
      grid-template-columns: 1fr;
      grid-template-rows: auto auto auto;
    }
    .alarm-digit-grid {
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
      width: 100%;
      max-width: 18rem;
    }
    .alarm-digit-btn {
      height: 3.5rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .alarm-triggered { animation: none; }
    .alarm-pin-error { animation: none; }
    .alarm-lockout-msg { animation: none; }
  }
`;class R extends x.j{_alarmPinCode="";_alarmPinLimiter=(0,d.x)(3,6e4);_alarmCountdown=null;_alarmCountdownTimer=null;_alarmPinError=!1;_alarmLockoutSeconds=0;_alarmLockoutTimer=null;_alarmLockoutAnnounced=!1;get panelType(){return"alarm"}get defaultPanelTitle(){return"Alarm"}get frameColor(){const e=this.group?.entities?.find(e=>"alarm_control_panel"===e.domain)?.state;return(0,l.of)(e?.state||"unavailable")}static get styles(){return[...super.styles,h.PF,h.yW,L]}disconnectedCallback(){super.disconnectedCallback(),this._stopAlarmCountdown(),this._alarmLockoutTimer&&(clearInterval(this._alarmLockoutTimer),this._alarmLockoutTimer=null)}updated(e){super.updated(e);const t=this.group?.entities?.find(e=>"alarm_control_panel"===e.domain)?.state,a=["arming","pending","disarming"].includes(t?.state);if(a&&null==this._alarmCountdown?this._startAlarmCountdown(t?.attributes?.delay||60):a||null==this._alarmCountdown||this._stopAlarmCountdown(),e.has("group")){const a=e.get("group"),r=a?.entities?.find(e=>"alarm_control_panel"===e.domain)?.state?.state,i=t?.state;r&&i&&r!==i&&("triggered"===i?g.e.play("criticalAlert"):"arming"!==i&&"pending"!==i||g.e.play("alert"))}}_partitionAlarmEntities(e,t){const a=[],r=[],i=[],s=[],n=new Set(["door","window","motion","vibration","moisture","cold","smoke","safety","opening","garage_door","lock","tamper","problem"]);for(const t of e)if("alarm_control_panel"!==t.domain){if("binary_sensor"===t.domain){const e=t.state?.attributes?.device_class||"";if(n.has(e)){r.push(t);continue}}i.push(t)}else a.push(t);const o=new Set;for(const e of r)e.entity?.device_id&&o.add(e.entity.device_id);const l=new Map,c=[];for(const e of i){const t=e.entity?.device_id;t&&o.has(t)?(l.has(t)||l.set(t,[]),l.get(t).push(e)):c.push(e)}if(t)for(const e of t.diagnostic||[]){const t=this._getEntityState(e.entity_id);t&&s.push({entity:e,domain:e.entity_id.split(".")[0],state:t})}return{alarm:a,zones:r,auxiliary:c,diagnostics:s,zoneSiblings:l}}_handleAlarmPinDigit(e){this._alarmPinCode.length>=6||(g.e.play("acknowledge"),this._alarmPinCode+=String(e).replace(/\D/g,"").charAt(0)||"",this._alarmPinError=!1,this.requestUpdate())}_handleAlarmPinClear(){this._alarmPinCode="",this._alarmPinError=!1,this.requestUpdate()}_handleAlarmArm(e,t){g.e.play("lockToggle");const a=this._alarmPinCode||void 0;this.hass.callService("alarm_control_panel",`alarm_arm_${t}`,{entity_id:e,...a?{code:a}:{}}),this._alarmPinCode="",this.requestUpdate()}_handleAlarmDisarm(e){if(!this._alarmPinLimiter.allow())return g.e.play("negativeAcknowledge"),this._alarmPinError=!0,this._startLockoutCountdown(),void this.requestUpdate();g.e.play("lockToggle");const t=this._alarmPinCode||void 0;this.hass.callService("alarm_control_panel","alarm_disarm",{entity_id:e,...t?{code:t}:{}}),this._alarmPinCode="",this.requestUpdate()}_startLockoutCountdown(){this._alarmLockoutTimer&&clearInterval(this._alarmLockoutTimer),this._alarmLockoutAnnounced=!1;const e=this._alarmPinLimiter.resetTime(),t=()=>{const t=Math.max(0,Math.ceil((e-Date.now())/1e3));this._alarmLockoutSeconds=t,this._alarmLockoutAnnounced=!0,this.requestUpdate(),t<=0&&(clearInterval(this._alarmLockoutTimer),this._alarmLockoutTimer=null,this._alarmPinError=!1,this._alarmLockoutSeconds=0,this._alarmLockoutAnnounced=!1,this.requestUpdate())};t(),this._alarmLockoutTimer=setInterval(t,1e3)}_startAlarmCountdown(e){this._alarmCountdown=Math.max(0,e),this._alarmCountdownTimer&&clearInterval(this._alarmCountdownTimer),this._alarmCountdownTimer=setInterval(()=>{this._alarmCountdown=Math.max(0,(this._alarmCountdown||0)-1),this.requestUpdate(),this._alarmCountdown<=0&&(clearInterval(this._alarmCountdownTimer),this._alarmCountdownTimer=null)},1e3)}_stopAlarmCountdown(){this._alarmCountdownTimer&&(clearInterval(this._alarmCountdownTimer),this._alarmCountdownTimer=null),this._alarmCountdown=null}_getAlarmShieldSymbol(e){switch(e){case"disarmed":return"✓";case"armed_home":case"armed_night":return"◉";case"armed_away":case"armed_vacation":return"▲";case"triggered":return"✕";case"arming":case"pending":case"disarming":return"⋯";default:return"?"}}_handleAlarmKeydown(e,t){const a=e.key;/^[0-9]$/.test(a)?(e.preventDefault(),this._handleAlarmPinDigit(a)):"Backspace"===a?(e.preventDefault(),this._alarmPinCode=this._alarmPinCode.slice(0,-1),this.requestUpdate()):"Enter"===a?(e.preventDefault(),this._handleAlarmDisarm(t)):"Escape"===a&&(e.preventDefault(),this._handleAlarmPinClear())}renderBadge(){const e=this.group?.entities?.find(e=>"alarm_control_panel"===e.domain)?.state,t=e?.state||"unavailable",a=(0,l.of)(t),i=(t||"unknown").toUpperCase().replace(/_/g," ");return r.qy`<span style="color:${a}">${i}</span>`}renderContent(){const e=this._getDeviceCategoryEntities(this.group.device.id),{alarm:t,zones:a,auxiliary:i,zoneSiblings:s}=this._partitionAlarmEntities(this.group.entities,e),n=this._shortDeviceName(this.group.device)||"Alarm";if(0===t.length)return r.qy``;const o=t[0],c=o.state,d=c?.state||"unavailable",p=(0,l.of)(d),u=["arming","pending","disarming"].includes(d),m="triggered"===d,h=this._getAlarmShieldSymbol(d),f=(d||"unknown").toUpperCase().replace(/_/g," "),v=!1!==c?.attributes?.code_required,g=Array.from({length:6},(e,t)=>t<this._alarmPinCode.length);return r.qy`
      <div class="alarm-content ${m?"alarm-triggered":""}" data-state="${d}">

        <div class="alarm-sensors" role="list" aria-label="${n} zones">
          ${a.map(({entity:e,state:t})=>{const a=this._friendlyName(t,e),i="on"===t.state,n=i?"var(--lcars-butterscotch)":"var(--lcars-gray)",o=e.device_id&&s.get(e.device_id)||[];return r.qy`
              <div class="device-sensor-line" tabindex="0" role="listitem"
                aria-label="${a}: ${i?"open":"closed"}"
                @click=${()=>this._handleEntityClick(e.entity_id)}
                @keydown=${t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._handleEntityClick(e.entity_id))}}>
                <div class="sensor-indicator" style="background:${n}"></div>
                <span class="sensor-label">${a}</span>
                ${o.length>0?r.qy`<span class="zone-siblings">${o.map(e=>{const t=e.state?.attributes?.device_class||"",a=e.state?.attributes?.unit_of_measurement||"",{text:i}=this._formatSensorValue(e.state,e.entity),s="battery"===t?"BAT":"illuminance"===t?"LUX":"",n=`${"battery"===t?"Battery":"illuminance"===t?"Illuminance":t}: ${i}${a?" "+a:""}`;return r.qy`<span class="zone-sibling-pip" role="img" aria-label="${n}" title="${e.state?.attributes?.friendly_name||""}">${s} ${i}${a?" "+a:""}</span>`})}</span>`:""}
                <span class="sensor-state-value" style="color:${n}">${i?"OPEN":"CLOSED"}</span>
              </div>
            `})}
          ${i.length>0?r.qy`
            <div class="battery-section-divider"></div>
            ${i.map(({entity:e,state:t})=>{const a=this._friendlyName(t,e),i=this._getSensorIndicatorColor(t);return r.qy`
                <div class="device-sensor-line" tabindex="0" role="listitem"
                  @click=${()=>this._handleEntityClick(e.entity_id)}
                  @keydown=${t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._handleEntityClick(e.entity_id))}}>
                  <div class="sensor-indicator" style="background:${i}"></div>
                  <span class="sensor-label">${a}</span>
                  <span class="sensor-state-value" style="color:${i}">${t.state}</span>
                </div>
              `})}
          `:""}
        </div>

        <div class="alarm-viewscreen">
          ${u&&null!=this._alarmCountdown?r.qy`
            <div class="alarm-countdown" aria-live="polite">
              <span class="alarm-countdown-num" style="color:${p}">${this._alarmCountdown}</span>
              <span class="alarm-countdown-label">${f}</span>
            </div>
          `:r.qy`
            <svg class="alarm-shield" viewBox="0 0 160 180" role="img" aria-label="${n}: ${f}">
              <path d="M80,10 L145,45 L145,110 Q145,160 80,175 Q15,160 15,110 L15,45 Z" fill="none" stroke="${p}" stroke-width="4" />
              <text x="80" y="105" text-anchor="middle" fill="${p}" font-family="var(--lcars-font)" font-size="48">${h}</text>
              <text x="80" y="145" text-anchor="middle" fill="${p}" font-family="var(--lcars-font)" font-size="14">${f}</text>
            </svg>
          `}
          <div class="alarm-arm-strip" role="radiogroup" aria-label="Arm mode">
            ${["home","away","night"].map(e=>r.qy`
              <button class="alarm-arm-btn" role="radio" aria-checked="${d===`armed_${e}`}"
                ?data-active=${d===`armed_${e}`}
                @click=${()=>this._handleAlarmArm(o.entity.entity_id,e)}>
                ${e.toUpperCase()}
              </button>
            `)}
          </div>
        </div>

        ${v?r.qy`
          <div class="alarm-keypad" tabindex="0" aria-label="PIN keypad"
            @keydown=${e=>this._handleAlarmKeydown(e,o.entity.entity_id)}>
            <div class="alarm-code-display ${this._alarmPinError?"alarm-pin-error":""}" role="status" aria-live="polite">
              ${g.map(e=>r.qy`
                <div class="alarm-code-dot" style="background:${e?this._alarmPinError?"var(--lcars-tomato)":p:"var(--lcars-disabled)"}"></div>
              `)}
            </div>
            ${this._alarmLockoutSeconds>0?r.qy`
              ${this._alarmLockoutAnnounced?r.qy`<div class="alarm-lockout-msg" role="alert">LOCKED OUT</div>`:""}
              <div class="alarm-lockout-countdown" aria-live="off">${this._alarmLockoutSeconds}s</div>
            `:""}
            <div class="alarm-digit-grid">
              ${[1,2,3,4,5,6,7,8,9].map(e=>r.qy`
                <button class="alarm-digit-btn" aria-label="Digit ${e}" ?disabled=${this._alarmLockoutSeconds>0} @click=${()=>this._handleAlarmPinDigit(e)}>${e}</button>
              `)}
              <button class="alarm-digit-btn alarm-action-btn" aria-label="Clear code" ?disabled=${this._alarmLockoutSeconds>0} @click=${()=>this._handleAlarmPinClear()}>⌫</button>
              <button class="alarm-digit-btn" aria-label="Digit 0" ?disabled=${this._alarmLockoutSeconds>0} @click=${()=>this._handleAlarmPinDigit(0)}>0</button>
              <button class="alarm-digit-btn alarm-action-btn" aria-label="Disarm" ?disabled=${this._alarmLockoutSeconds>0} @click=${()=>this._handleAlarmDisarm(o.entity.entity_id)}>⏎</button>
            </div>
          </div>
        `:""}
      </div>
    `}}customElements.get("lcars-alarm-panel")||customElements.define("lcars-alarm-panel",R);const F=r.AH`
  :host { display: block; }

  .lcars-device-panel {
    --panel-frame-color: var(--lcars-african-violet);
    display: grid;
    gap: var(--lcars-gap);
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
  /* 4X-53: Compact idle — hide transport, waveform, compact metadata, dim volume */
  .media-idle .media-transport { display: none; }
  .media-idle .lcars-audio-waveform { display: none; }
  .media-idle .media-volume-fill { background: var(--lcars-gray); width: 0% !important; }
  .media-idle .media-volume-pct { color: var(--lcars-gray); }
  .media-idle .media-metadata-extra { display: none; }

  .media-header { grid-area: header; display: flex; align-items: center; gap: 0.5rem; }
  .device-panel-name { font-size: var(--lcars-font-size-sub); color: var(--panel-frame-color); text-transform: uppercase; white-space: nowrap; }
  .device-panel-header-line { flex: 1; height: 2px; background: var(--panel-frame-color); opacity: 0.5; }
  .media-state-badge { font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; }
  .panel-numeric-code { font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); color: var(--panel-frame-color); opacity: 0.7; white-space: nowrap; }

  .media-metadata { grid-area: metadata; overflow-y: auto; }
  .device-sensor-line { display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0.5rem; cursor: pointer; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; transition: background var(--lcars-transition); font-size: var(--lcars-font-size-data); text-transform: uppercase; }
  .device-sensor-line:hover { background: rgba(255,255,255,0.05); }
  .device-sensor-line:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
  .sensor-indicator { width: 0.625rem; height: 0.625rem; border-radius: 50%; flex-shrink: 0; box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.15); }
  .sensor-label { flex: 1; color: var(--lcars-space-white); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.75rem; min-width: 3rem; }
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

  /* GEORDI-027: Volume at 100% warning */
  .media-volume-warn .media-volume-fill { background: var(--lcars-tomato); }
  .media-volume-warn .media-volume-pct { color: var(--lcars-tomato); }

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
`;class W extends x.j{get panelType(){return"media"}get defaultPanelTitle(){return"Media"}get frameColor(){return"var(--lcars-african-violet)"}static get styles(){return[...super.styles,h.PF,h.yW,F]}_isValidArtworkUrl(e){return!!e&&(e.startsWith("/api/")||e.startsWith("/local/"))}_getMediaTransportSymbol(e){switch(e){case"playing":return"▶";case"paused":return"❚❚";default:return"■"}}_partitionMediaEntities(e){const t=new Set;for(const a of e)"media_player"===a.domain&&a.entity?.device_id&&t.add(a.entity.device_id);const a=[],r=[],i=[],s=[];for(const n of e){if("media_player"===n.domain){a.push(n);continue}const e=n.entity?.device_id;e&&t.has(e)&&("remote"!==n.domain?"binary_sensor"!==n.domain&&"camera"!==n.domain&&(o.Xt.has(n.domain)?r.push(n):i.push(n)):s.push(n))}return{player:a,sensors:r,controls:i,remotes:s}}_handleMediaService(e,t,a={}){g.e.play("mediaAction"),this.hass.callService("media_player",t,{entity_id:e,...a})}_handleVolumeChange(e,t){const a=t.currentTarget.getBoundingClientRect(),r=Math.max(0,Math.min(1,(t.clientX-a.left)/a.width));g.e.play("climateAdjust"),this._handleMediaService(e,"volume_set",{volume_level:Math.round(100*r)/100})}renderBadge(){const e=this.group?.entities?.find(e=>"media_player"===e.domain);if(!e)return r.qy``;const t=e.state?.state||"unavailable";if("unavailable"===t)return r.qy`<span style="color:var(--lcars-gray)">■ OFFLINE</span>`;const a=(0,l.uT)(t),i=this._getMediaTransportSymbol(t);return r.qy`<span style="color:${a}">${i} ${t.toUpperCase()}</span>`}renderContent(){const{player:e,sensors:t}=this._partitionMediaEntities(this.group.entities),a=this._shortDeviceName(this.group.device)||"Media";if(0===e.length)return r.qy``;const i=e.filter(e=>"playing"===e.state?.state||"paused"===e.state?.state),s=e.filter(e=>"unavailable"!==e.state?.state),n=i.length>0?s:e;if(0===n.length)return r.qy`
        <div class="media-content media-idle">
          <div class="media-viewscreen">
            <div class="media-idle-display">
              <span class="media-idle-glyph" style="color:var(--lcars-gray)">&#9834;</span>
              <span class="media-idle-label" style="color:var(--lcars-gray)">UNAVAILABLE</span>
            </div>
          </div>
        </div>
      `;const o=this._selectPrimary(n),c=n.filter(e=>e!==o),d=o.state,p=d?.attributes||{},u=d?.state||"unavailable",m=((0,l.uT)(u),this._getMediaTransportSymbol(u),"playing"===u),h="paused"===u,f=!m&&!h,v=p.entity_picture,g=this._isValidArtworkUrl(v),b=p.media_title||"",y=p.media_artist||"",_=p.source||"",w=null!=p.volume_level?Number(p.volume_level):0,x=p.is_volume_muted||!1,$=p.supported_features||0,k=!!(16&$),S=!!(32&$),C=!!(4&$),E=!!(32768&$),z=!!(262144&$),A=p.shuffle||!1,q=p.repeat||"off";return r.qy`
      <div class="media-content ${f?"media-idle":""}">

        <div class="media-metadata" role="list" aria-label="${a} info">
          ${_?r.qy`<div class="device-sensor-line" role="listitem"><div class="sensor-indicator" style="background:var(--lcars-african-violet)"></div><span class="sensor-label">Source</span><span class="sensor-state-value">${_}</span></div>`:""}
          <div class="media-metadata-extra" role="presentation">
          ${E?r.qy`<div class="device-sensor-line" role="listitem"><div class="sensor-indicator" style="background:${A?"var(--lcars-african-violet)":"var(--lcars-gray)"}"></div><span class="sensor-label">Shuffle</span><span class="sensor-state-value">${A?"ON":"OFF"}</span></div>`:""}
          ${z?r.qy`<div class="device-sensor-line" role="listitem"><div class="sensor-indicator" style="background:${"off"!==q?"var(--lcars-african-violet)":"var(--lcars-gray)"}"></div><span class="sensor-label">Repeat</span><span class="sensor-state-value">${q.toUpperCase()}</span></div>`:""}
          ${t.map(({entity:e,state:t})=>{const a=this._friendlyName(t,e),i=this._getSensorIndicatorColor(t);return r.qy`
              <div class="device-sensor-line" tabindex="0" role="listitem"
                @click=${()=>this._handleEntityClick(e.entity_id)}
                @keydown=${t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._handleEntityClick(e.entity_id))}}>
                <div class="sensor-indicator" style="background:${i}"></div>
                <span class="sensor-label">${a}</span>
                <span class="sensor-state-value" style="color:${i}">${t.state}</span>
              </div>
            `})}
          </div>
        </div>

        <div class="media-viewscreen ${m?"media-viewscreen-glow":""}" @click=${()=>this._handleEntityClick(o.entity.entity_id)}>
          ${g&&!f?r.qy`
            <img class="media-art" src="${v}" alt="Album art"
              crossorigin="anonymous" referrerpolicy="no-referrer" loading="lazy"
              @error=${e=>{e.target.style.display="none"}} />
          `:r.qy`
            <div class="media-idle-display">
              <span class="media-idle-glyph">&#9834;</span>
              <span class="media-idle-label">STANDBY</span>
            </div>
          `}
          ${f?"":r.qy`
            <div class="media-now-playing">
              ${b?r.qy`<div class="media-title">${b}</div>`:""}
              ${y?r.qy`<div class="media-artist">${y}</div>`:""}
            </div>
          `}
        </div>

        <div class="lcars-audio-waveform" ?data-paused=${!m} aria-hidden="true">
          ${Array.from({length:12},(e,t)=>{const a=Math.floor(t/3),i=[380,420,350,460][a];return r.qy`<div class="bar ${2===t||8===t?"peak":""}"
              style="--bar-dur:${i+t%3*30}ms;--bar-delay:${50*t}ms;--bar-min-ratio:${.1+.05*a}"></div>`})}
        </div>

        <div class="media-controls">
          ${m||h?r.qy`
          <div class="media-transport" role="toolbar" aria-label="Transport controls">
            ${E?r.qy`<button class="media-transport-btn" aria-pressed="${A}" title="Shuffle" @click=${()=>this._handleMediaService(o.entity.entity_id,"shuffle_set",{shuffle:!A})}>⇄</button>`:""}
            ${k?r.qy`<button class="media-transport-btn" title="Previous" @click=${()=>this._handleMediaService(o.entity.entity_id,"media_previous_track")}>⏮</button>`:""}
            <button class="media-transport-btn media-play-btn" title="${m?"Pause":"Play"}"
              @click=${()=>this._handleMediaService(o.entity.entity_id,m?"media_pause":"media_play")}>
              ${m?"❚❚":"▶"}
            </button>
            ${S?r.qy`<button class="media-transport-btn" title="Next" @click=${()=>this._handleMediaService(o.entity.entity_id,"media_next_track")}>⏭</button>`:""}
            ${z?r.qy`<button class="media-transport-btn" aria-pressed="${"off"!==q}" title="Repeat: ${q}" @click=${()=>this._handleMediaService(o.entity.entity_id,"repeat_set",{repeat:"off"===q?"all":"all"===q?"one":"off"})}>🔁</button>`:""}
          </div>
          ${C?r.qy`
            <div class="media-volume ${w>=1?"media-volume-warn":""}" aria-label="Volume: ${Math.round(100*w)}%">
              <button class="media-mute-btn" aria-pressed="${x}" title="${x?"Unmute":"Mute"}"
                @click=${()=>this._handleMediaService(o.entity.entity_id,"volume_mute",{is_volume_muted:!x})}>
                ${x?"🔇":"🔊"}
              </button>
              <div class="media-volume-bar" tabindex="0" role="slider"
                aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(100*w)}"
                @click=${e=>this._handleVolumeChange(o.entity.entity_id,e)}
                @keydown=${e=>{"ArrowRight"===e.key&&(e.preventDefault(),this._handleMediaService(o.entity.entity_id,"volume_set",{volume_level:Math.min(1,w+.05)})),"ArrowLeft"===e.key&&(e.preventDefault(),this._handleMediaService(o.entity.entity_id,"volume_set",{volume_level:Math.max(0,w-.05)})),"Home"===e.key&&(e.preventDefault(),this._handleMediaService(o.entity.entity_id,"volume_set",{volume_level:0})),"End"===e.key&&(e.preventDefault(),this._handleMediaService(o.entity.entity_id,"volume_set",{volume_level:1})),"PageUp"===e.key&&(e.preventDefault(),this._handleMediaService(o.entity.entity_id,"volume_set",{volume_level:Math.min(1,w+.1)})),"PageDown"===e.key&&(e.preventDefault(),this._handleMediaService(o.entity.entity_id,"volume_set",{volume_level:Math.max(0,w-.1)}))}}>
                <div class="media-volume-fill" style="width:${Math.round(100*w)}%"></div>
              </div>
              <span class="media-volume-pct">${Math.round(100*w)}%</span>
            </div>
          `:""}
          `:""}
        </div>
      </div>

      ${c.length>0?this._renderSecondaryOutputs(c):""}
    `}_selectPrimary(e){const t=e.find(e=>"playing"===e.state?.state);if(t)return t;return e.find(e=>"paused"===e.state?.state)||e.reduce((e,t)=>{const a=e.state?.attributes?.supported_features||0;return(t.state?.attributes?.supported_features||0)>a?t:e},e[0])}_renderSecondaryOutputs(e){return r.qy`
      <div class="media-secondary-outputs" role="list" aria-label="Additional speakers">
        ${e.map(e=>{const t=e.entity?.entity_id||"",a=e.state?.attributes?.friendly_name||t,i=e.state?.state||"unavailable",s=null!=e.state?.attributes?.volume_level?Number(e.state.attributes.volume_level):0,n=(e.state,"playing"===i),o="paused"===i,c=!!(4&(e.state?.attributes?.supported_features||0)),d=(0,l.uT)(i),p=this._getMediaTransportSymbol(i);return r.qy`
            <div class="media-secondary-row" role="listitem"
                 tabindex="0"
                 aria-label="${a}: ${i}"
                 @click=${()=>this._handleEntityClick(t)}
                 @keydown=${e=>("Enter"===e.key||" "===e.key)&&(e.preventDefault(),this._handleEntityClick(t))}>
              <span class="media-secondary-indicator" style="background:${d}"></span>
              <span class="media-secondary-name">${a}</span>
              <span class="media-secondary-state" style="color:${d}">${p}</span>
              ${n||o?r.qy`
                <button class="media-secondary-playpause"
                        aria-label="${n?"Pause":"Play"} ${a}"
                        @click=${e=>{e.stopPropagation(),this._handleMediaService(t,n?"media_pause":"media_play")}}>
                  ${n?"❚❚":"▶"}
                </button>
              `:""}
              ${c?r.qy`
                <div class="media-secondary-volume">
                  <div class="media-volume-bar" tabindex="0" role="slider"
                    aria-label="${a} volume"
                    aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(100*s)}"
                    @click=${e=>{e.stopPropagation(),this._handleVolumeChange(t,e)}}>
                    <div class="media-volume-fill" style="width:${Math.round(100*s)}%"></div>
                  </div>
                  <span class="media-volume-pct">${Math.round(100*s)}%</span>
                </div>
              `:""}
            </div>
          `})}
      </div>
    `}}customElements.get("lcars-media-panel")||customElements.define("lcars-media-panel",W);const U=r.AH`
  :host { display: block; }

  .lcars-device-panel {
    display: grid;
    gap: var(--lcars-gap);
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
`;class B extends r.WF{static get properties(){return{value:{type:Number},min:{type:Number},max:{type:Number},segments:{type:Number},thresholds:{type:Array},label:{type:String}}}constructor(){super(),this.value=0,this.min=0,this.max=100,this.segments=7,this.thresholds=[],this.label=""}static get styles(){return[s.AM,r.AH`
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
      `]}_getColorForValue(e){if(!this.thresholds?.length)return"var(--lcars-ice)";let t=this.thresholds[0]?.color||"var(--lcars-ice)";for(const a of this.thresholds){if(!(e>=a.value))break;t=a.color}return t}render(){const e=this.max-this.min,t=e>0?Math.max(0,Math.min(1,(this.value-this.min)/e)):0,a=Math.round(t*this.segments),i=this._getColorForValue(this.value),s=[];for(let e=0;e<this.segments;e++){const t=e<a;s.push(r.qy`<div class="segment ${t?"filled":""}"
          style="${t?`background: ${i}`:""}"></div>`)}return r.qy`
      <div class="bar-container"
        role="meter"
        aria-valuenow="${this.value}"
        aria-valuemin="${this.min}"
        aria-valuemax="${this.max}"
        aria-label="${this.label}">
        ${s}
      </div>
      <span class="bar-value">${this._formatValue()}</span>
    `}_formatValue(){return null==this.value?"—":Number.isInteger(this.value)?String(this.value):this.value.toFixed(1)}}customElements.define("lcars-segmented-bar",B);class H extends x.j{get panelType(){return"pool-spa"}get defaultPanelTitle(){return"Pool & Spa"}get frameColor(){return"var(--lcars-bluey)"}static get styles(){return[...super.styles,h.PF,h.yW,U]}_poolSetpointDebouncer=null;_partitionPoolEntities(e){const t=[],a=[],r=[],i=[],s=[],n=[],o=[],l=[],c=[],d=[];let p=null;const u=/orp|ph_|salt|tds|saturation|calcium|alkalinity|cyanuric|chlorine|hardness/i,m=/waterfall|spillway|bubbler|fountain/i,h=/blower|spa.*jet|jet.*spa/i;for(const f of e){const e=f.entity.entity_id,v=f.domain,g=(f.state?.attributes||{}).device_class||"";"climate"!==v?"binary_sensor"===v&&/freeze/i.test(e)?p=f:"light"!==v?"sensor"===v&&u.test(e)?r.push(f):"switch"!==v?"sensor"!==v||"temperature"!==g?d.push(f):c.push(f):/pump/i.test(e)?i.push(f):m.test(e)?s.push(f):h.test(e)?n.push(f):o.push(f):l.push(f):/spa/i.test(e)?a.push(f):t.push(f)}return{pool:t,spa:a,chemistry:r,pumps:i,waterFeatures:s,spaCircuits:n,utilityCircuits:o,lights:l,environmental:c,diagnostics:d,freezeSensor:p}}_handlePoolSetpoint(e,t,a){const r=(0,d.A_)(a,t,{min:40,max:104});this._poolSetpointDebouncer||(this._poolSetpointDebouncer=(0,d.eU)((e,t)=>{this.hass.callService("climate","set_temperature",{entity_id:e,temperature:t})},1500)),this._poolSetpointDebouncer.call(e,r)}_renderPoolBody(e,t,a){if(0===e.length)return"";const i=e[0],s=i.state,n=s?.attributes||{},o=null!=n.current_temperature?Number(n.current_temperature):null,c=null!=n.temperature?Number(n.temperature):null,d=n.hvac_action||"off",p=(0,l.qW)(d,t),u="spa"===t?"SPA":"POOL",m="heating"===d,h="spa"===t?"thermal-warm":"thermal-cool";return r.qy`
      <div class="pool-body-frame ${h}" style="--body-color:${p}" role="region"
        aria-label="${u}: ${null!=o?o+"°":"N/A"}, target ${c||"N/A"}°">
        <div class="pool-body-label" style="color:${p}">${u}</div>
        <div class="pool-body-temp" style="color:${p}">${null!=o?`${Math.round(o)}°`:"—"}</div>
        ${null!=c?r.qy`
          <div class="pool-setpoint-row">
            <button class="pool-sp-btn sp-decrement" aria-label="Decrease ${u} target"
              @click=${()=>this._handlePoolSetpoint(i.entity.entity_id,n,c-(a||1))}>−</button>
            <span class="pool-target" style="color:${p}">${c}°</span>
            <button class="pool-sp-btn sp-increment" aria-label="Increase ${u} target"
              @click=${()=>this._handlePoolSetpoint(i.entity.entity_id,n,c+(a||1))}>+</button>
          </div>
        `:""}
        ${m?r.qy`
          <div class="pool-heating-bar" style="--body-color:${p}"></div>
        `:""}
      </div>
    `}_getChemThresholds(e){return/ph/i.test(e)?[{value:0,color:"var(--lcars-tomato)"},{value:7,color:"var(--lcars-sunflower)"},{value:7.2,color:"var(--lcars-ice)"},{value:7.6,color:"var(--lcars-sunflower)"},{value:7.8,color:"var(--lcars-tomato)"}]:/chlorine/i.test(e)?[{value:0,color:"var(--lcars-tomato)"},{value:.5,color:"var(--lcars-sunflower)"},{value:1,color:"var(--lcars-ice)"},{value:3,color:"var(--lcars-sunflower)"},{value:5,color:"var(--lcars-tomato)"}]:/orp/i.test(e)?[{value:0,color:"var(--lcars-tomato)"},{value:550,color:"var(--lcars-sunflower)"},{value:650,color:"var(--lcars-ice)"},{value:750,color:"var(--lcars-sunflower)"},{value:800,color:"var(--lcars-tomato)"}]:/alkalinity/i.test(e)?[{value:0,color:"var(--lcars-tomato)"},{value:60,color:"var(--lcars-sunflower)"},{value:80,color:"var(--lcars-ice)"},{value:120,color:"var(--lcars-sunflower)"},{value:150,color:"var(--lcars-tomato)"}]:/hardness|calcium/i.test(e)?[{value:0,color:"var(--lcars-tomato)"},{value:150,color:"var(--lcars-sunflower)"},{value:200,color:"var(--lcars-ice)"},{value:400,color:"var(--lcars-sunflower)"},{value:500,color:"var(--lcars-tomato)"}]:/salt/i.test(e)?[{value:0,color:"var(--lcars-tomato)"},{value:2500,color:"var(--lcars-sunflower)"},{value:2700,color:"var(--lcars-ice)"},{value:3400,color:"var(--lcars-sunflower)"},{value:3600,color:"var(--lcars-tomato)"}]:[{value:0,color:"var(--lcars-ice)"}]}_getChemRange(e){return/ph/i.test(e)?{min:6.5,max:8.5}:/chlorine/i.test(e)?{min:0,max:6}:/orp/i.test(e)?{min:400,max:900}:/alkalinity/i.test(e)?{min:0,max:200}:/hardness|calcium/i.test(e)?{min:0,max:600}:/salt/i.test(e)?{min:2e3,max:4e3}:{min:0,max:100}}_renderCircuitGroup(e,t){if(!e.length)return"";const a=e.filter(e=>"on"===e.state?.state).length;return r.qy`
      <div class="circuit-group">
        <div class="circuit-group-label">${t} <span class="circuit-count">(${a}/${e.length})</span></div>
        ${e.map(({entity:e,state:t})=>{const a=this._friendlyName(t,e),i="on"===t?.state;return r.qy`
            <button class="device-control-btn" role="switch" aria-checked="${i}" ?data-on=${i}
              @click=${()=>this._handleToggle(e.entity_id)}
              title="${a}: ${t.state}">
              <ha-icon .icon=${this._getEntityIcon(t)}></ha-icon>
              <span>${a}</span>
            </button>
          `})}
      </div>
    `}renderBadge(){const e=this._getAllEntities(),{pool:t,spa:a,freezeSensor:i}=this._partitionPoolEntities(e),s=t[0]?.state?.attributes?.current_temperature,n=a[0]?.state?.attributes?.current_temperature,o="on"===i?.state?.state;return r.qy`
      ${null!=s?r.qy`<span style="color:var(--lcars-ice)">POOL ${Math.round(s)}°</span>`:""}
      ${null!=n?r.qy`<span style="color:var(--lcars-butterscotch)"> SPA ${Math.round(n)}°</span>`:""}
      ${o?r.qy`<span style="color:var(--lcars-tomato)"> ❄ FREEZE</span>`:""}
    `}renderContent(){const e=this._getAllEntities(),{pool:t,spa:a,chemistry:i,pumps:s,waterFeatures:n,spaCircuits:o,utilityCircuits:l,lights:c,environmental:d,freezeSensor:p}=this._partitionPoolEntities(e),u=i.length>0,m="on"===p?.state?.state;return r.qy`
      ${m?r.qy`
        <div class="freeze-banner" role="alert">
          <span class="freeze-icon">❄</span> FREEZE PROTECT ACTIVE
        </div>
      `:p?r.qy`
        <div class="freeze-nominal">FREEZE: NOMINAL</div>
      `:""}

      <div class="pool-content ${u?"":"pool-no-chem"} ${m?"freeze-active":""}">

        ${u?r.qy`
          <div class="pool-chemistry" role="list" aria-label="Water chemistry">
            ${i.map(({entity:e,state:t,_linked:a})=>{const i=this._friendlyName(t,e),s=parseFloat(t.state),n=t.attributes?.unit_of_measurement||"",o=this._getChemThresholds(e.entity_id),l=this._getChemRange(e.entity_id),c=a;return r.qy`
                <div class="chem-reading" tabindex="0" role="listitem"
                  aria-label="${i}: ${t.state}${n?" "+n:""}"
                  @click=${()=>this._handleEntityClick(e.entity_id)}
                  @keydown=${t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._handleEntityClick(e.entity_id))}}>
                  <span class="chem-label">${i}${c?r.qy` <span class="source-pill">W</span>`:""}</span>
                  <lcars-segmented-bar
                    .value=${isNaN(s)?0:s}
                    .min=${l.min}
                    .max=${l.max}
                    .segments=${6}
                    .thresholds=${o}
                    .label="${i}: ${t.state}${n?" "+n:""}">
                  </lcars-segmented-bar>
                </div>
              `})}
          </div>
        `:""}

        <div class="pool-aquatics">
          ${this._renderPoolBody(t,"pool",1)}
          ${this._renderPoolBody(a,"spa",1)}
        </div>

        <div class="pool-controls" aria-label="Circuit controls">
          ${s.length>0?r.qy`
            <div class="circuit-group">
              <div class="circuit-group-label">PUMPS <span class="circuit-count">(${s.filter(e=>"on"===e.state?.state).length}/${s.length})</span></div>
              ${s.map(({entity:e,state:t},a)=>{const i=this._friendlyName(t,e),s="on"===t.state;return r.qy`
                  <button class="device-control-btn" role="switch" aria-checked="${s}" ?data-on=${s}
                    @click=${()=>this._handleToggle(e.entity_id)}
                    title="${i}: ${t.state}">
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

          ${d.map(({entity:e,state:t})=>{const a=this._friendlyName(t,e),i=t.attributes?.unit_of_measurement||"";return r.qy`
              <div class="device-sensor-line" tabindex="0" role="listitem"
                @click=${()=>this._handleEntityClick(e.entity_id)}>
                <div class="sensor-indicator-bar" style="background:var(--lcars-data-accent)"></div>
                <span class="sensor-label">${a}</span>
                <span class="sensor-state-value">${t.state}${i?" "+i:""}</span>
              </div>
            `})}
        </div>

        ${c.length>0?r.qy`
          <div class="pool-lighting" aria-label="Pool lighting">
            ${c.map(({entity:e,state:t})=>{const a=this._friendlyName(t,e),i="on"===t.state;return r.qy`
                <button class="device-control-btn" role="switch" aria-checked="${i}" ?data-on=${i}
                  @click=${()=>this._handleToggle(e.entity_id)}
                  title="${a}: ${t.state}">
                  <ha-icon .icon=${this._getEntityIcon(t)}></ha-icon>
                  <span>${a}</span>
                </button>
              `})}
          </div>
        `:""}
      </div>
    `}}customElements.get("lcars-pool-spa-panel")||customElements.define("lcars-pool-spa-panel",H);const j=r.AH`
  :host { display: block; }

  .lcars-device-panel {
    display: grid;
    gap: var(--lcars-gap);
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
  .sensor-indicator { width: 0.625rem; height: 0.625rem; border-radius: 50%; flex-shrink: 0; box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.15); }
  .sensor-label { flex: 1; color: var(--lcars-space-white); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.75rem; min-width: 3rem; }
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

  /* ─── Offline State (GEORDI-021, WESLEY-UX-012) ─── */
  .weather-offline {
    opacity: 0.6;
    filter: grayscale(0.7);
  }
  .weather-offline-banner {
    grid-column: 1 / -1;
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    color: var(--lcars-gray);
    text-transform: uppercase;
    text-align: center;
    padding: 0.25rem;
    border-bottom: 2px solid var(--lcars-gray);
    margin-bottom: 0.25rem;
  }
`;class V extends x.j{get panelType(){return"weather"}get defaultPanelTitle(){return"Weather"}get frameColor(){const e=this.group?.entities?.find(e=>"weather"===e.domain)?.state,t=e?.state||"unavailable";return"unavailable"===t||"unknown"===t?"var(--lcars-gray)":(0,l.JQ)(t)}static get styles(){return[...super.styles,h.PF,h.yW,j]}_weatherForecastCache={};_getWeatherGlyph(e){return{sunny:"☀","clear-night":"●",partlycloudy:"◑",cloudy:"◔",fog:"≡",rainy:"▽",pouring:"▼",snowy:"✦","snowy-rainy":"◆",hail:"◆",windy:"〰","windy-variant":"〰",lightning:"⚡","lightning-rainy":"⚡",exceptional:"⚠"}[e]||"○"}_getWindCardinal(e){return null==e?"":["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"][Math.round(e/22.5)%16]}_partitionWeatherEntities(e){const t=[],a=[],r=[],i=[],s=[],n=[];for(const l of e){if("weather"===l.domain){t.push(l);continue}const e=l.entity.entity_id,c=l.state?.attributes?.device_class||"";/lightning/i.test(e)?r.push(l):"precipitation"===c||"precipitation_intensity"===c||/rain/i.test(e)?i.push(l):"wind_speed"===c||/wind/i.test(e)?s.push(l):o.Xt.has(l.domain)?a.push(l):n.push(l)}return{weather:t,sensors:a,lightning:r,precipitation:i,wind:s,diagnostics:n}}_renderWindCompass(e,t,a){if(null==e)return"";const i=this._getWindCardinal(e);return r.qy`
      <div class="weather-wind-compass" role="img"
        aria-label="Wind: ${t||"?"} ${a||"mph"} from ${i}">
        <svg viewBox="0 0 80 80" class="wind-svg">
          <circle cx="40" cy="40" r="28" fill="none" stroke="var(--lcars-disabled)" stroke-width="1" />
          <text x="40" y="12" text-anchor="middle" fill="var(--lcars-data-accent)" font-size="7" font-family="var(--lcars-font)">N</text>
          <text x="40" y="76" text-anchor="middle" fill="var(--lcars-data-accent)" font-size="7" font-family="var(--lcars-font)">S</text>
          <text x="8" y="43" text-anchor="middle" fill="var(--lcars-data-accent)" font-size="7" font-family="var(--lcars-font)">W</text>
          <text x="72" y="43" text-anchor="middle" fill="var(--lcars-data-accent)" font-size="7" font-family="var(--lcars-font)">E</text>
          <g transform="rotate(${e}, 40, 40)">
            <line x1="40" y1="55" x2="40" y2="18" stroke="var(--lcars-ice)" stroke-width="2" />
            <polygon points="40,15 36,24 44,24" fill="var(--lcars-ice)" />
          </g>
        </svg>
        <div class="wind-reading">${t||"—"} ${a||""} ${i}</div>
      </div>
    `}async _loadWeatherForecast(e){if(this._weatherForecastCache[e])return;const t=await m(this.hass,e,"daily");t.length>0&&(this._weatherForecastCache[e]=t,this.requestUpdate())}_renderForecastStrip(e){if(!e?.length)return"";const t=e.slice(0,7),a=t.map(e=>e.temperature).filter(Number.isFinite),i=t.map(e=>e.templow).filter(Number.isFinite),s=Math.min(...i,...a),n=Math.max(...a,...i)-s||1;return r.qy`
      <div class="weather-forecast" role="list" aria-label="7-day forecast">
        ${t.map(e=>{const t=new Date(e.datetime).toLocaleDateString("en",{weekday:"short"}).toUpperCase(),a=e.temperature,i=e.templow,o=e.condition,c=this._getWeatherGlyph(o),d=(0,l.JQ)(o),p=e.precipitation_probability,u=(i-s)/n*100,m=(a-i||1)/n*100;return r.qy`
            <div class="forecast-tile" role="listitem" tabindex="0"
              aria-label="${t}: ${o}, high ${a}°, low ${i}°${null!=p?`, ${p}% precipitation`:""}">
              <span class="forecast-day">${t}</span>
              <span class="forecast-glyph" style="color:${d}">${c}</span>
              <span class="forecast-hi">${null!=a?Math.round(a):"—"}°</span>
              <div class="forecast-range-bar">
                <div class="forecast-range-fill" style="left:${u.toFixed(1)}%;width:${m.toFixed(1)}%"></div>
              </div>
              <span class="forecast-lo">${null!=i?Math.round(i):"—"}°</span>
              ${null!=p?r.qy`<span class="forecast-precip" style="color:${p>50?"var(--lcars-sky)":"var(--lcars-gray)"}">${p}%</span>`:""}
            </div>
          `})}
      </div>
    `}renderBadge(){const e=this.group?.entities?.find(e=>"weather"===e.domain)?.state,t=e?.state||"unavailable",a="unavailable"===t||"unknown"===t,i=a?"var(--lcars-gray)":(0,l.JQ)(t),s=a?"○":this._getWeatherGlyph(t),n=a?"OFFLINE":t.toUpperCase().replace(/[_-]/g," ");return r.qy`<span style="color:${i}">${s} ${n}</span>`}renderContent(){const{weather:e,sensors:t,lightning:a,precipitation:i}=this._partitionWeatherEntities(this.group.entities),s=this._shortDeviceName(this.group.device)||"Weather";if(0===e.length)return r.qy``;const n=e[0],o=n.state,d=o?.attributes||{},p=o?.state||"unavailable",u="unavailable"===p||"unknown"===p,m=u?"var(--lcars-gray)":(0,l.JQ)(p),h=u?"○":this._getWeatherGlyph(p),f=d.temperature,v=d.humidity,g=d.pressure,b=d.wind_speed,y=d.wind_bearing,_=d.wind_speed_unit||"mph",w=o?.last_changed||o?.last_updated,x=u&&w?(0,c.aQ)(w):null;u||this._loadWeatherForecast(n.entity.entity_id);const $=this._weatherForecastCache[n.entity.entity_id];return r.qy`
      <div class="weather-content ${u?"weather-offline":""}">

        ${u?r.qy`
          <div class="weather-offline-banner" role="status" aria-live="polite">
            OFFLINE${x?r.qy` · LAST DATA ${x}`:""}
          </div>
        `:""}

        <div class="weather-sensors" role="list" aria-label="${s} readings">
          ${null!=v?r.qy`
            <div class="device-sensor-line" role="listitem" aria-label="Humidity: ${v}%">
              <div class="sensor-indicator" style="background:var(--lcars-ice)"></div>
              <span class="sensor-label">Humidity</span>
              <span class="sensor-state-value" style="color:var(--lcars-ice)">${v}%</span>
            </div>
          `:""}
          ${null!=g?r.qy`
            <div class="device-sensor-line" role="listitem" aria-label="Pressure: ${g}">
              <div class="sensor-indicator" style="background:var(--lcars-data-accent)"></div>
              <span class="sensor-label">Pressure</span>
              <span class="sensor-state-value">${g}</span>
            </div>
          `:""}
          ${a.map(({entity:e,state:t})=>{const a=this._friendlyName(t,e),i=t.attributes?.unit_of_measurement||"";return r.qy`
              <div class="device-sensor-line" tabindex="0" role="listitem"
                aria-label="${a}: ${t.state}${i?" "+i:""}"
                @click=${()=>this._handleEntityClick(e.entity_id)}>
                <div class="sensor-indicator" style="background:var(--lcars-gold)"></div>
                <span class="sensor-label">${a}</span>
                <span class="sensor-state-value" style="color:var(--lcars-gold)">${t.state}${i?" "+i:""}</span>
              </div>
            `})}
          ${i.map(({entity:e,state:t})=>{const a=this._friendlyName(t,e),i=t.attributes?.unit_of_measurement||"";return r.qy`
              <div class="device-sensor-line" tabindex="0" role="listitem"
                aria-label="${a}: ${t.state}${i?" "+i:""}"
                @click=${()=>this._handleEntityClick(e.entity_id)}>
                <div class="sensor-indicator" style="background:var(--lcars-sky)"></div>
                <span class="sensor-label">${a}</span>
                <span class="sensor-state-value" style="color:var(--lcars-sky)">${t.state}${i?" "+i:""}</span>
              </div>
            `})}
          ${t.map(({entity:e,state:t})=>{const a=this._friendlyName(t,e),i=t.attributes?.unit_of_measurement||"",s=this._getSensorIndicatorColor(t);return r.qy`
              <div class="device-sensor-line" tabindex="0" role="listitem"
                aria-label="${a}: ${t.state}${i?" "+i:""}"
                @click=${()=>this._handleEntityClick(e.entity_id)}
                @keydown=${t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._handleEntityClick(e.entity_id))}}>
                <div class="sensor-indicator" style="background:${s}"></div>
                <span class="sensor-label">${a}</span>
                <span class="sensor-state-value" style="color:${s}">${t.state}${i?" "+i:""}</span>
              </div>
            `})}
        </div>

        <div class="weather-viewscreen" role="img"
          aria-label="${p}: ${null!=f?f+"°":"N/A"}">
          <svg class="weather-display" viewBox="0 0 200 160">
            <text x="100" y="35" text-anchor="middle" fill="${m}"
              font-family="var(--lcars-font)" font-size="28">${h}</text>
            <text x="100" y="85" text-anchor="middle" fill="${m}"
              font-family="var(--lcars-font)" font-size="48" font-weight="bold">
              ${null!=f?`${Math.round(f)}°`:"—"}
            </text>
            <text x="100" y="108" text-anchor="middle" fill="var(--lcars-data-accent)"
              font-family="var(--lcars-font)" font-size="12">
              ${p.toUpperCase().replace(/[_-]/g," ")}
            </text>
          </svg>
          ${this._renderWindCompass(y,b,_)}
        </div>

        ${this._renderForecastStrip($)}
      </div>
    `}}customElements.get("lcars-weather-panel")||customElements.define("lcars-weather-panel",V);const G=r.AH`
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
    display: inline-flex; align-items: center; gap: 0.5rem;
    margin: 0.5rem auto 0; padding: 0.25rem 1rem; min-height: 1.5rem;
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

  /* P4: Pill alert dot */
  .pill-alert-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--lcars-butterscotch, #ffcc99); flex-shrink: 0;
  }

  /* P4: Standby summary (0W collapse) */
  .power-standby-summary {
    display: flex; align-items: center; gap: 0.75rem;
    padding: 0.75rem 1rem;
  }
  .standby-indicator { color: var(--lcars-gray, #666688); font-size: 1.25rem; }
  .standby-label {
    color: var(--lcars-sunflower, #ffcc99);
    font-family: var(--lcars-font, 'Antonio', sans-serif);
    font-size: var(--lcars-font-size-label, 0.75rem);
    text-transform: uppercase; letter-spacing: 0.05em;
  }
  .standby-detail {
    color: var(--lcars-gray, #666688);
    font-family: var(--lcars-font, 'Antonio', sans-serif);
    font-size: var(--lcars-font-size-label, 0.75rem);
    margin-left: auto;
  }

  /* P4: Low-activity compact mode */
  .power-low-activity-content { display: flex; flex-direction: column; gap: var(--lcars-gap, 12px); }
  .power-circuits-compact { grid-template-columns: 1fr !important; gap: var(--lcars-gap, 0.25rem); }

  /* P4: Wattage tier classes (WESLEY-IDEA-012) */
  .power-circuit-tile.tier-standby .power-circuit-indicator { opacity: 0.5; }
  .power-circuit-tile.tier-low {}
  .power-circuit-tile.tier-moderate {}
  .power-circuit-tile.tier-high {}
  .power-circuit-tile.tier-critical {}

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
    .power-circuit-tile { animation: none !important; opacity: 1; transition: none !important; }
    .power-circuit-tile, .power-device-row { transition-duration: 0.01ms !important; }
  }
`;class X extends x.j{static get properties(){return{...super.properties,collection:{type:Object},powerGroups:{type:Array}}}get panelType(){return"power"}get defaultPanelTitle(){return"Power Systems"}get frameColor(){const e=this.config?.power_thresholds||{};if(this.collection||this.powerGroups){const t=this.collection||this._buildPowerCollection(this.powerGroups);return(0,l.XI)(t.totalWatts,e)}if(this.group){const t=this._getPrimaryPower(this.group);return(0,l.XI)(t,e)}return"var(--lcars-orange)"}static get styles(){return[...super.styles,h.PF,h.yW,G]}_powerToggleLimiter=(0,d.x)(10,1e4);_expandedPowerSections=new Set;_cachedCollection=null;_lastPowerGroups=null;static _MANUFACTURER_PREFIXES=[{pattern:/^vue\s*g?\d*[_\s]*/i},{pattern:/^emporia[_\s]*(vue)?[_\s]*/i},{pattern:/^pentair[_:\s]*/i},{pattern:/^screenlogic[_:\s]*/i}];static _HEX_SERIAL_PATTERNS=[/\b[0-9a-f]{2}(-[0-9a-f]{2}){2,}\b/gi,/\b[0-9a-f]{6,}\b/gi,/\b(sn|serial)[:\s]*[a-z0-9-]+\b/gi,/\b(mac|addr)[:\s]+[a-z0-9.-][a-z0-9:.-]*\b/gi];static _POOL_KEYWORDS=/pool[_\s]?(pump|heater|cleaner|blower|light|spa|waterfall|spillover|circuit[_\s]?\d+)/i;_humanizePowerName(e,t,a){let r=e||"";if(!t?.name_by_user){for(const{pattern:e}of X._MANUFACTURER_PREFIXES)r=r.replace(e,"");for(const e of X._HEX_SERIAL_PATTERNS)r=r.replace(e,"")}if(!(r=r.replace(/^[\s\-–_:]+/,"").replace(/[\s\-–_:]+$/,"").replace(/\s{2,}/g," "),r=r.replace(/_/g," "),r=r.replace(/([a-z])([A-Z])/g,"$1 $2"),r=r.replace(/([A-Za-z])(\d)/g,"$1 $2"),r.trim()||(a&&(r=a.split(".").pop().split("_").slice(-2).join(" ")),r.trim()))){const e=(t?.manufacturer||"").toLowerCase();r=e.includes("pentair")||e.includes("screenlogic")?"POOL CONTROLLER":"CIRCUIT"}return/^\d+$/.test(r.trim())&&(r="CIRCUIT "+r.trim()),r.trim().toUpperCase()}_getCircuitDisplayName(e){return e._displayName||this._humanizePowerName(this._shortDeviceName(e.device),e.device,e.entities?.[0]?.entity?.entity_id)}_formatWatts(e){if(null==e)return"—";const t=Number(e);return Number.isFinite(t)?Math.abs(t)>=1e4?`${(t/1e3).toFixed(1)} kW`:`${Math.round(t)} W`:"—"}_formatEnergy(e){if(null==e)return"—";const t=Number(e);return Number.isFinite(t)?`${t.toFixed(1)} kWh`:"—"}_getPowerIndicator(e){if(null==e||isNaN(e))return"✕";const t=Math.abs(Number(e));return t<=0?"○":t<=500?"●":t<=1500?"●━":t<=3e3?"●━━":"●━━━"}_partitionPowerEntities(e){const t=[],a=[],r=[],i=[],s=[],n=[];for(const o of e){if(o.disabled_by||o.hidden_by)continue;const e=o.entity?.entity_id?.split(".")[0]||o.domain,l=o.state?.attributes?.device_class||"",c=o.state?.attributes?.unit_of_measurement||"";"switch"===e?t.push(o):"power"!==l||"W"!==c&&"kW"!==c?"energy"!==l||"kWh"!==c&&"Wh"!==c?"voltage"===l&&"V"===c?i.push(o):"current"===l&&"A"===c?s.push(o):n.push(o):r.push(o):a.push(o)}return{switches:t,powerSensors:a,energySensors:r,voltageSensors:i,currentSensors:s,diagnostics:n}}_classifyPowerDevice(e,t){if(!e.some(e=>{const t=e.state?.attributes?.device_class||"";return"sensor"===e.domain&&("power"===t||"energy"===t||"voltage"===t||"current"===t)}))return null;const a=(t?.manufacturer||"").toLowerCase(),r=(t?.model||"").toLowerCase();return a.includes("emporia")||r.includes("vue")?"vue":e.filter(e=>"switch"===e.domain).length>=4||r.includes("hs300")||r.includes("power strip")?"strip":e.some(e=>"switch"===e.domain)?"plug":"vue"}_getPrimaryPower(e){for(const t of e.entities){const e=t.state?.attributes?.device_class||"",a=t.state?.attributes?.unit_of_measurement||"";if("power"===e&&("W"===a||"kW"===a)){const e=parseFloat(t.state?.state);if(!isNaN(e))return"kW"===a?1e3*e:e}}return null}_getPrimaryEnergy(e){for(const t of e.entities){const e=t.state?.attributes?.device_class||"",a=t.state?.attributes?.unit_of_measurement||"";if("energy"===e&&("kWh"===a||"Wh"===a)){const e=parseFloat(t.state?.state);if(!isNaN(e))return"Wh"===a?e/1e3:e}}return null}_detect240VPairs(e){const t=/^(.+?)[\s_]*(l[12]|line[\s_]*[12])$/i,a=new Map,r=[];for(const i of e){const e=(this._shortDeviceName(i.device)||"").match(t);if(e){const t=e[1].trim().replace(/^[\s\-–_:]+/,"").replace(/[\s\-–_:]+$/,"");a.has(t)||a.set(t,[]),a.get(t).push(i)}else r.push(i)}const i=[...r];for(const[e,t]of a)if(2===t.length){const a=t.reduce((e,t)=>e+(this._getPrimaryPower(t)||0),0),r=t.reduce((e,t)=>e+(this._getPrimaryEnergy(t)||0),0);i.push({device:{...t[0].device,name:e||"CIRCUIT"},entities:t.flatMap(e=>e.entities),is240V:!0,combinedWatts:a,combinedEnergy:r})}else i.push(...t);const s=new Set,n=[];for(const e of i)if(e.is240V){for(const t of e.entities)t.entity?.entity_id&&s.add(t.entity.entity_id);n.push(e)}for(const e of i)e.is240V||(e.entities||[]).some(e=>e.entity?.entity_id&&s.has(e.entity.entity_id))||n.push(e);return n}_sortCircuits(e){return[...e].sort((e,t)=>{const a=null!=e.combinedWatts?e.combinedWatts:this._getPrimaryPower(e)||0,r=null!=t.combinedWatts?t.combinedWatts:this._getPrimaryPower(t)||0;if(r!==a)return r-a;const i=(e.device?.name||"").toLowerCase(),s=(t.device?.name||"").toLowerCase();return i.localeCompare(s)})}_deduplicateCircuitNames(e){const t=e.map(e=>this._humanizePowerName(this._shortDeviceName(e.device),e.device,e.entities?.[0]?.entity?.entity_id)),a=new Map;for(const e of t)a.set(e,(a.get(e)||0)+1);const r=new Map;return e.forEach((e,i)=>{const s=t[i];if(a.get(s)>1){const t=(e.entities?.[0]?.entity?.entity_id||"").match(X._POOL_KEYWORDS);if(t)e._displayName=t[1].replace(/_/g," ").toUpperCase();else{const t=(r.get(s)||0)+1;r.set(s,t),e._displayName=s+" "+t}}else e._displayName=s}),e}_groupPowerStrips(e){const t=new Map,a=[];for(const a of e)"strip"===a.subType&&t.set(a.device.id,{parent:a,children:[]});for(const r of e)if("strip"!==r.subType){if(r.device?.via_device_id){const e=t.get(r.device.via_device_id);if(e){e.children.push(r);continue}}a.push(r)}return{strips:t,standalone:a}}_renderPowerArc(e,t){if(!e.length||!t||t<=0)return"";const a=this.config?.power_thresholds||{},r=e.map(e=>({name:this._getCircuitDisplayName(e)||"CIRCUIT",watts:null!=e.combinedWatts?e.combinedWatts:this._getPrimaryPower(e)||0})).filter(e=>e.watts>0).sort((e,t)=>t.watts-e.watts);if(0===r.length)return"";const s=r.slice(0,5),n=r.slice(5).reduce((e,t)=>e+t.watts,0);n>0&&s.push({name:"OTHER",watts:n});const o=120,c=100,d=80,p=Math.PI,u=Math.PI;let m=p;const h=s.map(e=>{const r=e.watts/t,i=Math.max(r*u-.02,.01),s=m-i,n=(0,l.XI)(e.watts,a),p=o+d*Math.cos(m),h=c-d*Math.sin(m),f=o+d*Math.cos(s),v=c-d*Math.sin(s),g=i>Math.PI?1:0,b=`M ${p.toFixed(1)},${h.toFixed(1)} A 80,80 0 ${g},1 ${f.toFixed(1)},${v.toFixed(1)}`;return m=s-.02,{path:b,color:n,name:e.name,watts:e.watts,fraction:r}});return i.qy`
      <div class="power-arc-area">
        <svg class="power-distribution-arc" viewBox="0 0 240 120"
          role="img" aria-label="Power distribution: ${this._formatWatts(t)} total">
          <path d="M ${40},${c} A ${d},${d} 0 1,1 ${200},${c}"
            fill="none" stroke="var(--lcars-gray)" stroke-width="10"
            stroke-linecap="butt" opacity="0.15" />
          ${h.map(e=>i.JW`
            <path d="${e.path}" fill="none" stroke="${e.color}"
              stroke-width="10" stroke-linecap="butt">
              <title>${e.name}: ${Math.round(e.watts)}W (${Math.round(100*e.fraction)}%)</title>
            </path>
          `)}
          <text x="${o}" y="${85}" text-anchor="middle"
            fill="var(--lcars-text-heading)" font-family="var(--lcars-font)"
            font-size="28" font-weight="bold">
            ${this._formatWatts(t)}
          </text>
          <text x="${o}" y="${105}" text-anchor="middle"
            fill="var(--lcars-space-white)" font-family="var(--lcars-font)"
            font-size="10" opacity="0.7">TOTAL</text>
        </svg>
      </div>
    `}_showCircuitPopover(e){const t=this.shadowRoot?.querySelector("#power-detail-popover");if(!t)return;const a=null!=e.combinedWatts?e.combinedWatts:this._getPrimaryPower(e),r=null!=e.combinedEnergy?e.combinedEnergy:this._getPrimaryEnergy(e),s=this.config?.power_thresholds||{},o=(0,l.XI)(a,s),c=(0,l.IO)(a,s),d=this._getCircuitDisplayName(e)||"CIRCUIT",p=e.entities?.[0]?.entity?.entity_id,u=t.querySelector(".popover-content");u&&(0,i.XX)(i.qy`
        <div class="popover-header">
          <span class="popover-title">${d}</span>
          <span class="popover-status" style="color:${o}">${c}</span>
        </div>
        <div class="popover-hero-value" style="color:${o}">
          ${null!=a?this._formatWatts(a):"UNAVAILABLE"}
        </div>
        <div class="popover-stats">
          ${null!=r?i.qy`
            <div class="popover-stat-row">
              <span class="popover-stat-label">TODAY</span>
              <span class="popover-stat-value">${this._formatEnergy(r)}</span>
            </div>
          `:""}
          ${e.is240V?i.qy`
            <div class="popover-stat-row">
              <span class="popover-stat-label">CIRCUIT TYPE</span>
              <span class="popover-stat-value" style="color:var(--lcars-butterscotch)">240V PAIRED</span>
            </div>
          `:""}
        </div>
        ${p?i.qy`
          <button class="popover-history-btn"
            @click=${()=>{(0,n.Hv)(p);try{t.hidePopover()}catch(e){}}}>
            VIEW FULL HISTORY
          </button>
        `:""}
      `,u);try{t.showPopover()}catch(e){p&&(0,n.Hv)(p)}}_renderTrackToggle(e,t,a){return i.qy`
      <button class="lcars-track-toggle" ?data-on=${e}
        role="switch" aria-checked="${e}" aria-label="${t}"
        @click=${e=>{e.stopPropagation(),a()}}
        @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),a())}}>
        <span class="track-label">${e?"ON":"OFF"}</span>
        <span class="track-thumb" aria-hidden="true"></span>
      </button>
    `}_renderClickableValue(e,t,a){return e?i.qy`
      <span class="power-clickable-value" role="button" tabindex="0" aria-label="${t}"
        @click=${t=>{t.stopPropagation(),this._handleEntityClick(e)}}
        @keydown=${t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._handleEntityClick(e))}}>
        ${a}
      </span>
    `:a}_renderCircuitTile(e){const t=null!=e.combinedWatts?e.combinedWatts:this._getPrimaryPower(e),a=null!=e.combinedEnergy?e.combinedEnergy:this._getPrimaryEnergy(e),r=this.config?.power_thresholds||{},s=(0,l.XI)(t,r),o=(0,l.IO)(t,r),c=this._getPowerIndicator(t),d=this._getCircuitDisplayName(e)||"CIRCUIT",p="function"==typeof HTMLElement.prototype.showPopover,{powerSensors:u,energySensors:m}=this._partitionPowerEntities(e.entities||[]),h=u[0]?.entity?.entity_id,f=m[0]?.entity?.entity_id,v=null!=t&&t>0?t>(r.highMax||3e3)?"tier-critical":t>(r.moderateMax||1500)?"tier-high":t>(r.lowMax||500)?"tier-moderate":"tier-low":"tier-standby";return i.qy`
      <div class="power-circuit-tile ${v}" style="--circuit-color:${s}" role="listitem" tabindex="0"
        aria-label="${d}: ${null!=t?Math.round(t)+" watts, "+o.toLowerCase():"unavailable"}${null!=a?", "+a.toFixed(1)+" kilowatt hours today":""}"
        @click=${()=>p?this._showCircuitPopover(e):(0,n.Hv)(e.entities?.[0]?.entity?.entity_id)}
        @keydown=${t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),p?this._showCircuitPopover(e):(0,n.Hv)(e.entities?.[0]?.entity?.entity_id))}}>
        <div class="power-circuit-name">
          <span class="power-circuit-indicator" aria-hidden="true">${e.is240V?"●●":c}</span>
          <span>${d}</span>
        </div>
        <div class="power-circuit-value-row">
          ${this._renderClickableValue(h,`View ${d} power: ${null!=t?Math.round(t)+" watts":"unavailable"}`,i.qy`<span class="power-circuit-watts">${this._formatWatts(t)}</span>`)}
        </div>
        ${null!=a?this._renderClickableValue(f,`View ${d} energy: ${a.toFixed(1)} kWh today`,i.qy`<span class="power-circuit-energy">${this._formatEnergy(a)} TODAY</span>`):""}
      </div>
    `}_renderPowerDeviceRow(e){const{switches:t,powerSensors:a,energySensors:r}=this._partitionPowerEntities(e.entities),s=t[0],n=a[0]?parseFloat(a[0].state?.state)||0:null,o=r[0]&&parseFloat(r[0].state?.state)||null,c=this.config?.power_thresholds||{},d=(0,l.XI)(n,c),p=this._getCircuitDisplayName(e)||"DEVICE",u="on"===s?.state?.state,m=a[0]?.entity?.entity_id,h=r[0]?.entity?.entity_id;return i.qy`
      <div class="power-device-row" role="listitem" tabindex="0" style="--circuit-color:${d}"
        aria-label="${p}: ${s?(u?"on":"off")+", ":""}${null!=n?Math.round(n)+" watts":"unknown"}">
        ${s?this._renderTrackToggle(u,`Toggle ${p}`,()=>{this._powerToggleLimiter.allow()&&this._handleToggle(s.entity.entity_id)}):""}
        <span class="power-device-name">${p}</span>
        <div class="power-device-stats">
          ${this._renderClickableValue(m,`View ${p} power: ${null!=n?Math.round(n)+" watts":"unknown"}`,i.qy`<span class="power-device-watts" style="color:${d}">${this._formatWatts(n)}</span>`)}
          ${null!=o?this._renderClickableValue(h,`View ${p} energy: ${o.toFixed(1)} kWh`,i.qy`<span class="power-device-energy">${this._formatEnergy(o)}</span>`):""}
        </div>
      </div>
    `}_renderPowerStrip(e,t){const a=this._getCircuitDisplayName(e)||"POWER STRIP",{powerSensors:r,switches:s}=this._partitionPowerEntities(e.entities),n=r.reduce((e,t)=>e+(parseFloat(t.state?.state)||0),0),o=this.config?.power_thresholds||{},c=(0,l.XI)(n,o),d=s[0];return i.qy`
      <div class="power-strip-block" role="listitem">
        <div class="power-strip-header" role="heading" aria-level="5">
          <span class="power-strip-name">${a}</span>
          ${d?this._renderTrackToggle("on"===d.state?.state,`Master toggle ${a}`,()=>{this._powerToggleLimiter.allow()&&this._handleToggle(d.entity.entity_id)}):""}
          <span class="power-strip-total" style="color:${c}">TOTAL: ${this._formatWatts(n)}</span>
        </div>
        <div class="power-strip-divider" aria-hidden="true"></div>
        <div class="power-strip-children" role="list" aria-label="${a} outlets">
          ${t.map(e=>this._renderStripChild(e,s))}
        </div>
      </div>
    `}_renderStripChild(e,t){const a=this._getCircuitDisplayName(e)||"OUTLET",{switches:r,powerSensors:s,energySensors:n}=this._partitionPowerEntities(e.entities),o=s[0]&&parseFloat(s[0].state?.state)||0,c=n[0]&&parseFloat(n[0].state?.state)||null,d=this.config?.power_thresholds||{},p=(0,l.XI)(o,d),u=s[0]?.entity?.entity_id,m=n[0]?.entity?.entity_id;let h=r[0];if(!h&&t?.length>0){const a=(e.device?.name||"").toLowerCase().replace(/[\s\-_]+/g,"");h=t.find(e=>{const t=(e.entity?.entity_id||"").toLowerCase().replace(/[\s\-_]+/g,""),r=(e.state?.attributes?.friendly_name||"").toLowerCase().replace(/[\s\-_]+/g,"");return t.includes(a)||r.includes(a)})}const f="on"===h?.state?.state;return i.qy`
      <div class="power-strip-child-tile" style="--tile-power-color:${p}"
        role="listitem" aria-label="${a}: ${f?"on":"off"}, ${Math.round(o)} watts">
        <span class="circuit-name">${a}</span>
        <div class="strip-child-controls">
          ${h?this._renderTrackToggle(f,`Toggle ${a}`,()=>{this._powerToggleLimiter.allow()&&this._handleToggle(h.entity.entity_id)}):""}
          ${this._renderClickableValue(u,`View ${a} power: ${Math.round(o)} watts`,i.qy`
            <span class="circuit-watts" style="color:${p}">
              <span class="power-dot" ?data-zero=${0===o} aria-hidden="true"></span>
              ${this._formatWatts(o)}
            </span>
          `)}
          ${null!=c?this._renderClickableValue(m,`View ${a} energy: ${c.toFixed(1)} kWh`,i.qy`<span class="power-device-energy">${this._formatEnergy(c)}</span>`):""}
        </div>
      </div>
    `}_renderPowerSummaryCard(e,t,a,r,s){const n=this.config?.power_thresholds||{},o="TOTAL USAGE"===e?(0,l.XI)(t,n):r;return i.qy`
      <div class="power-summary-card" role="status" style="--card-accent:${r}"
        aria-label="${e}: ${null!=t?Math.round(t)+" watts":"unavailable"}${null!=a?", "+a.toFixed(1)+" kilowatt hours today":""}"
        aria-live="polite">
        <span class="power-summary-label">
          <ha-icon icon="${s}" style="--mdc-icon-size:14px; vertical-align:middle; color:${r}"></ha-icon>
          ${e}
        </span>
        <span class="power-summary-value" style="color:${o}">${this._formatWatts(t)}</span>
        ${null!=a?i.qy`<span class="power-summary-secondary">${this._formatEnergy(a)} TODAY</span>`:""}
      </div>
    `}_buildPowerCollection(e){if(this._cachedCollection&&this._lastPowerGroups===e)return this._cachedCollection;this._lastPowerGroups=e;const t=[],a=[],r=[];for(const i of e){const e=this._classifyPowerDevice(i.entities||[],i.device);"vue"===e?t.push(i):"strip"===e?r.push(i):a.push(i)}const i=new Set(r.map(e=>e.device?.id).filter(Boolean)),s=[],n=[];for(const e of r)e.device?.via_device_id&&i.has(e.device.via_device_id)?n.push(e):s.push({...e,subType:"strip"});const{strips:o,standalone:l}=this._groupPowerStrips([...s,...n,...a]),c=[];for(const[,e]of o)c.push({parent:e.parent,children:e.children||[]});const d=l,p=this._sortCircuits(this._detect240VPairs(t)),u=new Set;for(const{children:e}of c)for(const t of e)t.device?.id&&u.add(t.device.id);const m=/^(balance|total|main[s]?|net|whole[\s_-]?home)$/i,h=new Set;for(const e of p){const t=this._getCircuitDisplayName(e);m.test(t.trim())&&e.device?.id&&h.add(e.device.id)}const f=new Set;for(const t of e){const a=(t.device?.model||"").toLowerCase(),r=(t.device?.manufacturer||"").toLowerCase();(t.entities?.some(e=>"battery"===e.state?.attributes?.device_class||"sensor"===e.domain&&"battery"===(e.state?.attributes?.device_class||""))||a.includes("ups")||r.includes("ups")||r.includes("cyberpower")||r.includes("apc")||r.includes("tripp"))&&t.device?.id&&(e.some(e=>e!==t&&e.device?.via_device_id===t.device.id)&&f.add(t.device.id))}let v=0,g=0;for(const t of e){const e=t.device?.id;if(e&&h.has(e))continue;if(e&&f.has(e))continue;if(e&&u.has(e))continue;const a=this._getPrimaryPower(t),r=this._getPrimaryEnergy(t);null!=a&&(v+=a),null!=r&&(g+=r)}return this._deduplicateCircuitNames(p),this._cachedCollection={circuits:p,plugs:d,strips:c,totalWatts:v,totalEnergy:g||null,deviceCount:e.length},this._cachedCollection}_renderConsolidatedPowerArc(e){const t=[];for(const a of e.circuits)t.push({device:a.device,entities:a.entities,combinedWatts:null!=a.combinedWatts?a.combinedWatts:this._getPrimaryPower(a),combinedEnergy:a.combinedEnergy});for(const a of e.plugs)t.push({device:a.device,entities:a.entities,combinedWatts:this._getPrimaryPower(a)});for(const{parent:a}of e.strips)t.push({device:a.device,entities:a.entities,combinedWatts:this._getPrimaryPower(a)});return this._renderPowerArc(t,e.totalWatts)}renderBadge(){if(this.collection||this.powerGroups){const e=this.collection||this._buildPowerCollection(this.powerGroups),t=this.config?.power_thresholds||{},a=(0,l.XI)(e.totalWatts,t);return i.qy`<span style="color:${a}">${this._formatWatts(e.totalWatts)}</span>`}if(this.group){const e=this._getPrimaryPower(this.group),t=this.config?.power_thresholds||{},a=(0,l.XI)(e,t);return i.qy`<span style="color:${a}">${this._formatWatts(e)}</span>`}return i.qy``}render(){if(this.collection||this.powerGroups){const e=this.collection||this._buildPowerCollection(this.powerGroups);return i.qy`
        <lcars-panel-frame
          panel-name="POWER SYSTEMS"
          panel-code="${this._generatePanelCode("power-consolidated")}"
          frame-color="${this.frameColor}"
          panel-type="power">
          <span slot="badge">${this.renderBadge()}</span>
          ${this._renderConsolidatedPowerContent(e)}
        </lcars-panel-frame>
      `}return this.group?super.render():i.qy``}renderContent(){return this._renderLegacyPowerContent(this.group)}_renderConsolidatedPowerContent(e){const{totalWatts:t}=e;if(null!=t&&0===t)return this._renderStandbyPowerContent(e);const a=this.config?.power_thresholds?.lowActivity??100;return null!=t&&t>0&&t<=a?this._renderLowActivityPowerContent(e):this._renderFullPowerContent(e)}_renderStandbyPowerContent(e){const t=e.circuits.length+e.plugs.length+e.strips.length;return i.qy`
      <div class="power-standby-summary" role="status" aria-label="Power systems standby, all circuits idle, ${t} monitored">
        <span class="standby-indicator" aria-hidden="true">○</span>
        <span class="standby-label">ALL CIRCUITS STANDBY</span>
        <span class="standby-detail">${t} MONITORED</span>
      </div>
    `}_renderLowActivityPowerContent(e){const{circuits:t,plugs:a,totalWatts:r,totalEnergy:s}=e,n=this.config?.power_thresholds||{},o=(0,l.XI)(r,n),c=t.filter(e=>(null!=e.combinedWatts?e.combinedWatts:this._getPrimaryPower(e)||0)>0).slice(0,3),d=a.filter(e=>(this._getPrimaryPower(e)||0)>0).slice(0,3-c.length);return i.qy`
      <div class="power-low-activity-content">
        <div class="power-summary" role="group" aria-label="Power Summary">
          ${this._renderPowerSummaryCard("TOTAL USAGE",r,s,o,"mdi:sigma")}
        </div>
        ${c.length>0||d.length>0?i.qy`
          <div class="power-section-label" role="heading" aria-level="4">
            <span class="power-section-label-text">ACTIVE CIRCUITS</span>
          </div>
          <div class="power-circuits power-circuits-compact" role="list">
            ${c.map(e=>this._renderCircuitTile(e))}
            ${d.map(e=>this._renderPowerDeviceRow(e))}
          </div>
        `:""}
      </div>
    `}_renderFullPowerContent(e){const{circuits:t,plugs:a,strips:r,totalWatts:s,totalEnergy:n}=e,o=this.config?.power_thresholds||{},c=(0,l.XI)(s,o),d=null!=s&&Math.abs(s)>(o.highMax||3e3),p=t.length+a.length+r.length,u=12,m=this._expandedPowerSections.has("circuits"),h=m?t:t.slice(0,u),f=t.length>u,v=this._expandedPowerSections.has("plugs"),g=v?a:a.slice(0,u),b=a.length>u,y=f?t.slice(u):[],_=y.reduce((e,t)=>e+(null!=t.combinedWatts?t.combinedWatts:this._getPrimaryPower(t)||0),0),w=y.some(e=>(null!=e.combinedWatts?e.combinedWatts:this._getPrimaryPower(e)||0)>(o.lowMax||500)),x=b?a.slice(u):[],$=x.reduce((e,t)=>e+(this._getPrimaryPower(t)||0),0);return i.qy`
      <div class="consolidated-power-content" data-alert="${d?"critical":""}">

        <div class="power-summary" role="group" aria-label="Power Summary">
          ${this._renderPowerSummaryCard("TOTAL USAGE",s,n,c,"mdi:sigma")}
        </div>

        ${p>=3?this._renderConsolidatedPowerArc(e):""}

        ${t.length>0?i.qy`
          <div class="power-circuits-section">
            <div class="power-section-label" role="heading" aria-level="4">
              <span class="power-section-label-text">CIRCUITS</span>
              <div class="power-section-label-rule" aria-hidden="true"></div>
              <span class="power-section-label-count">${t.length}</span>
            </div>
            <div class="power-circuits" role="list">
              ${h.map(e=>this._renderCircuitTile(e))}
            </div>
            ${f&&!m?i.qy`
              <button class="power-show-all-pill" aria-label="Show ${y.length} more circuits drawing ${Math.round(_)} watts total"
                @click=${()=>{this._expandedPowerSections.add("circuits"),this.requestUpdate()}}>
                <span class="pill-text">EXPAND GRID — ${y.length} MORE (${this._formatWatts(_)})</span>
                ${w?i.qy`<span class="pill-alert-dot" aria-hidden="true"></span>`:""}
              </button>
            `:""}
          </div>
        `:""}

        ${a.length>0?i.qy`
          <div class="power-devices-section">
            <div class="power-section-label" role="heading" aria-level="4">
              <span class="power-section-label-text">MONITORED DEVICES</span>
              <div class="power-section-label-rule" aria-hidden="true"></div>
              <span class="power-section-label-count">${a.length}</span>
            </div>
            <div class="power-devices" role="list">
              ${g.map(e=>this._renderPowerDeviceRow(e))}
            </div>
            ${b&&!v?i.qy`
              <button class="power-show-all-pill" aria-label="Show ${x.length} more devices drawing ${Math.round($)} watts total"
                @click=${()=>{this._expandedPowerSections.add("plugs"),this.requestUpdate()}}>
                <span class="pill-text">EXPAND GRID — ${x.length} MORE (${this._formatWatts($)})</span>
              </button>
            `:""}
          </div>
        `:""}

        ${r.length>0?i.qy`
          <div class="power-strips-section">
            <div class="power-section-label" role="heading" aria-level="4">
              <span class="power-section-label-text">POWER STRIPS</span>
              <div class="power-section-label-rule" aria-hidden="true"></div>
              <span class="power-section-label-count">${r.length}</span>
            </div>
            <div class="power-strips" role="list">
              ${r.map(({parent:e,children:t})=>this._renderPowerStrip(e,t))}
            </div>
          </div>
        `:""}

        <div popover id="power-detail-popover" class="power-detail-popover"
          role="dialog" aria-label="Circuit detail">
          <div class="popover-content"></div>
        </div>
      </div>
    `}_renderLegacyPowerContent(e){const t=e.entities||[],a=(this._getCircuitDisplayName(e),this.config?.power_thresholds||{}),r=this._classifyPowerDevice(t,e.device),{powerSensors:s,energySensors:n,switches:o}=this._partitionPowerEntities(t),c=this._getPrimaryPower(e),d=this._getPrimaryEnergy(e);if(null!=c&&0===c)return i.qy`
        <div class="power-standby-summary" role="status" aria-label="Power standby, 0 watts">
          <span class="standby-indicator" aria-hidden="true">○</span>
          <span class="standby-label">STANDBY</span>
          <span class="standby-detail">0 W</span>
        </div>
      `;const p=(0,l.XI)(c,a),u=null!=c&&Math.abs(c)>(a.highMax||3e3),m="vue"===r?[e]:[],h=this._sortCircuits(this._detect240VPairs(m)),f=c||0,v=h.length>0,g="plug"===r,b="strip"===r;return i.qy`
      <div class="power-content" data-alert="${u?"critical":""}">

        ${v&&h.length>1?this._renderPowerArc(h,f):""}

        <div class="power-summary" role="group" aria-label="Power Summary">
          ${this._renderPowerSummaryCard("TOTAL USAGE",f,d,p,"mdi:sigma")}
        </div>

        ${v?i.qy`
          <div class="power-circuits-section">
            <div class="power-section-label" role="heading" aria-level="4">
              <span class="power-section-label-text">CIRCUITS</span>
              <div class="power-section-label-rule" aria-hidden="true"></div>
              <span class="power-section-label-count">${h.length}/${h.length}</span>
            </div>
            <div class="power-circuits" role="list">
              ${h.map(e=>this._renderCircuitTile(e))}
            </div>
          </div>
        `:""}

        ${g?i.qy`
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

        ${b?i.qy`
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
    `}}customElements.get("lcars-power-panel")||customElements.define("lcars-power-panel",X),a(3801);const Y=r.AH`

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

  .tactical-access-hint {
    font-size: var(--lcars-font-size-data);
    opacity: 0.6;
    letter-spacing: 0.06em;
    white-space: nowrap;
    flex-shrink: 0;
  }

  /* ─── Transitional State (opening/closing) ─── */

  .tactical-access-row[data-transitional] {
    pointer-events: none;
    opacity: 0.7;
    cursor: default;
  }

  /* ─── Inline Confirmation Strip ─── */

  .tactical-confirm-strip {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: var(--lcars-tomato);
    color: var(--lcars-black);
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    text-transform: uppercase;
    font-weight: 700;
    cursor: pointer;
    min-height: var(--lcars-btn-height, 2rem);
    position: relative;
    overflow: hidden;
    animation: confirm-flash 300ms ease-out;
  }
  .tactical-confirm-strip:focus-visible {
    outline: 2px solid var(--lcars-ice);
    outline-offset: 2px;
  }
  .confirm-countdown-bar {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 3px;
    background: var(--lcars-black);
    animation: confirm-drain 5s linear forwards;
    opacity: 0.6;
  }
  @keyframes confirm-drain {
    from { transform: scaleX(1); transform-origin: left; }
    to   { transform: scaleX(0); transform-origin: left; }
  }
  @keyframes confirm-flash {
    0%   { opacity: 0; }
    100% { opacity: 1; }
  }

  /* ─── Cover Position Indicator ─── */

  .tactical-cover-position {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    flex-shrink: 0;
  }
  .cover-pos-track {
    width: 0.5rem;
    height: 1.25rem;
    background: rgba(255,255,255,0.15);
    border-radius: 2px;
    overflow: hidden;
    display: flex;
    flex-direction: column-reverse;
  }
  .cover-pos-fill {
    width: 100%;
    background: currentColor;
    border-radius: 2px;
    transition: height 500ms ease;
  }
  .cover-pos-value {
    font-size: var(--lcars-font-size-data);
    opacity: 0.8;
    min-width: 2.5em;
    text-align: right;
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

  .tactical-motion-chip.composite {
    min-width: 14rem;
  }

  .tactical-motion-chip:hover { filter: brightness(1.15); }
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

  /* ─── Composite Sub-indicators ─── */

  .chip-meta {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    margin-left: auto;
    flex-shrink: 0;
  }

  .chip-ambient {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .chip-ambient.bright {
    background: var(--lcars-sunflower);
  }
  [data-detected] .chip-ambient.dark {
    background: transparent;
    border: 1.5px solid var(--lcars-gray);
  }
  [data-clear] .chip-ambient.dark {
    background: transparent;
    border: 1.5px solid var(--lcars-ice);
  }

  .chip-battery {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .chip-battery-bar {
    display: flex;
    gap: 1px;
    align-items: flex-end;
  }

  .chip-battery-seg {
    width: 0.25rem;
    height: 0.5rem;
    border-radius: 1px;
  }
  [data-detected] .chip-battery-seg {
    background: rgba(0, 0, 0, 0.3);
  }
  [data-clear] .chip-battery-seg {
    background: rgba(255, 255, 255, 0.15);
  }
  .chip-battery-seg.filled {
    background: var(--battery-color, var(--lcars-sunflower));
  }

  .chip-battery-pct {
    font-size: 0.6875rem;
    font-weight: 700;
    min-width: 2rem;
    text-align: right;
  }

  @media (max-width: 480px) {
    .tactical-motion-chip.composite {
      min-width: 10rem;
      flex-wrap: wrap;
    }
    .chip-meta {
      width: 100%;
      margin-left: 0.875rem;
      margin-top: 0.125rem;
    }
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
    .tactical-motion-chip,
    .chip-battery-seg {
      transition-duration: 0.01ms !important;
    }
    .tactical-confirm-strip { animation: none; }
    .confirm-countdown-bar { animation-duration: 0.01ms; }
    .cover-pos-fill { transition-duration: 0.01ms; }
  }
`;a(58);class Z extends x.j{static get properties(){return{...super.properties}}get panelType(){return"tactical"}get defaultPanelTitle(){return"TACTICAL"}get frameColor(){const e=this._getAlarmEntry();return e?(0,l.of)(e.state?.state||"unavailable"):this._getAccessEntries().some(e=>"lock"===e.domain?"locked"!==e.state?.state:"open"===e.state?.state)?"var(--lcars-butterscotch)":"var(--lcars-ice)"}static get styles(){return[...super.styles,h.PF,h.yW,s.AM,Y]}_partitionEntities(){const e=this._getAllEntities(),t=[],a=[],r=[],i=[],s=new Set;for(const t of e)o.aE.has(t.domain)&&t.entity?.device_id&&s.add(t.entity.device_id);for(const n of e)if(o.yS.has(n.domain))t.push(n);else if("lock"===n.domain)a.push(n);else if("cover"===n.domain){const e=n.state?.attributes?.device_class||"";["garage_door","gate","door"].includes(e)&&a.push(n)}else if("binary_sensor"===n.domain){const e=n.state?.attributes?.device_class||"";if(["door","window","opening","garage_door"].includes(e))r.push(n);else if(["motion","occupancy"].includes(e)){if(n.entity?.device_id&&s.has(n.entity.device_id))continue;i.push(n)}else["tamper","safety"].includes(e)&&r.push(n)}const n=t.length>0,l=a.length>0,c=r.length>0,d=i.length>0,p=l||c||d;let u;return u=n&&p?"full":n&&!p?"alarm-only":n||!l&&!c?"sensors-only":"no-alarm",{alarmEntries:t,accessEntries:a,perimeterEntries:r,motionEntries:i,config:u}}_getAlarmEntry(){return this._getAllEntities().find(e=>o.yS.has(e.domain))||null}_getAccessEntries(){const{accessEntries:e}=this._partitionEntities();return e}renderBadge(){const e=this._getAlarmEntry(),{accessEntries:t,perimeterEntries:a}=this._partitionEntities(),i=a.filter(e=>"on"===e.state?.state).length,s=t.filter(e=>"lock"===e.domain?"locked"!==e.state?.state:"open"===e.state?.state).length;if("triggered"===e?.state?.state)return r.qy`<lcars-summary-badge value="⚠ ALERT" color="var(--lcars-tomato)"></lcars-summary-badge>`;if(e){const t=(e.state?.state||"").toUpperCase().replace(/_/g," ");return r.qy`<lcars-summary-badge value="${t}" color="${this.frameColor}"></lcars-summary-badge>`}return s>0||i>0?r.qy`<lcars-summary-badge value="${s+i} OPEN" color="var(--lcars-butterscotch)"></lcars-summary-badge>`:r.qy`<lcars-summary-badge value="SECURE" color="var(--lcars-ice)"></lcars-summary-badge>`}renderContent(){const{alarmEntries:e,accessEntries:t,perimeterEntries:a,motionEntries:i,config:s}=this._partitionEntities();return r.qy`
      <div class="tactical-content ${s}">
        ${e.length>0?this._renderAlarmSection(e):""}
        ${t.length>0?this._renderAccessSection(t):""}
        ${a.length>0?this._renderPerimeterSection(a):""}
        ${i.length>0?this._renderMotionSection(i):""}
      </div>
    `}_renderAlarmSection(e){const t=this.hass?.devices||{},a=this._buildGroup(e,t);return r.qy`
      <div class="tactical-alarm">
        <lcars-alarm-panel
          .group=${a}
          .hass=${this.hass}
          .editMode=${this.editMode}
          .config=${this.config}
          frame-mode="nested">
        </lcars-alarm-panel>
      </div>
    `}_renderAccessSection(e){return r.qy`
      <div class="tactical-access" role="list" aria-label="Access points">
        <div class="tactical-section-label">ACCESS POINTS</div>
        ${e.map(e=>{const t=e.entity?.entity_id||"",a=e.state?.attributes?.friendly_name||t,i="lock"===e.domain,s="cover"===e.domain;let o,l,c,d="",p=!1;if(i)o="locked"===e.state?.state,l=o?"LOCKED":"UNLOCKED",c=o?"var(--lcars-sunflower)":"var(--lcars-tomato)";else if(s){const t=this._getCoverStateInfo(e.state);l=t.text,d=t.hint,o="closed"===e.state?.state,c=t.color,p=t.transitional}else o="closed"===e.state?.state||"locked"===e.state?.state,l=(e.state?.state||"").toUpperCase(),c=o?"var(--lcars-sunflower)":"var(--lcars-tomato)";const u=s?e.state?.attributes?.current_position??null:null,m=this._pendingConfirm?.entityId===t,h=()=>{p&&s?this._callService("cover","stop_cover",{entity_id:t}):i?this._toggleLock(t,!o):s?this._toggleCover(t,e.state?.state):(0,n.Hv)(t)};return m?r.qy`
              <div class="tactical-access-row tactical-confirm-strip"
                   role="alert"
                   tabindex="0"
                   aria-label="${this._pendingConfirm.label}"
                   @click=${()=>this._executeConfirm()}
                   @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._executeConfirm()),"Escape"===e.key&&(e.preventDefault(),this._cancelConfirm())}}>
                <span class="confirm-label">${this._pendingConfirm.label}</span>
                <div class="confirm-countdown-bar"></div>
              </div>
            `:r.qy`
            <div class="tactical-access-row"
                 role="listitem"
                 tabindex="0"
                 aria-label="${a}: ${l}"
                 ?data-secure=${o}
                 ?data-breach=${!o}
                 ?data-transitional=${p}
                 @click=${h}
                 @keydown=${e=>("Enter"===e.key||" "===e.key)&&(e.preventDefault(),h())}>
              <span class="tactical-access-indicator" style="background:${c}"></span>
              <span class="tactical-access-name">${a}</span>
              ${null!==u?r.qy`
                <span class="tactical-cover-position" aria-label="Position: ${u}%">
                  <span class="cover-pos-track">
                    <span class="cover-pos-fill" style="height:${u}%"></span>
                  </span>
                  <span class="cover-pos-value">${u}%</span>
                </span>
              `:""}
              <span class="tactical-access-state">${l}</span>
              ${d?r.qy`<span class="tactical-access-hint">${d}</span>`:""}
            </div>
          `})}
      </div>
    `}_renderPerimeterSection(e){return r.qy`
      <div class="tactical-perimeter" role="list" aria-label="Perimeter sensors" aria-live="polite">
        <div class="tactical-section-label" style="width:100%">PERIMETER</div>
        ${e.map(e=>{const t=e.entity?.entity_id||"",a=e.state?.attributes?.friendly_name||t,i="on"===e.state?.state,s=i?"OPEN":"CLOSED",o=i?"var(--lcars-butterscotch)":"var(--lcars-gray)";return r.qy`
            <div class="tactical-perim-chip"
                 role="listitem"
                 tabindex="0"
                 aria-label="${a}: ${s}"
                 ?data-open=${i}
                 ?data-closed=${!i}
                 @click=${()=>(0,n.Hv)(t)}
                 @keydown=${e=>("Enter"===e.key||" "===e.key)&&(e.preventDefault(),(0,n.Hv)(t))}>
              <span class="chip-indicator" style="background:${o}"></span>
              <span class="chip-name">${a}</span>
              <span class="chip-state">${s}</span>
            </div>
          `})}
      </div>
    `}_groupMotionDevices(e){const t=this.hass?.entities||{},a=this.hass?.states||{},r=new Map;for(const t of e){const e=t.entity?.device_id,a=e||t.entity?.entity_id||"";r.has(a)||r.set(a,{motion:null,battery:null,ambient:null,deviceId:e}),r.get(a).motion=t}const i=new Set;for(const[,e]of r)e.deviceId&&i.add(e.deviceId);if(i.size>0)for(const[e,s]of Object.entries(t)){const t=s.device_id;if(!t||!i.has(t))continue;const n=a[e];if(!n)continue;const o=n.attributes?.device_class||"",l=[...r.values()].find(e=>e.deviceId===t);l&&("battery"!==o||l.battery?"light"!==o&&"illuminance"!==o||l.ambient||(l.ambient={entity:s,state:n}):l.battery={entity:s,state:n})}return r}_renderMotionSection(e){const t=this._groupMotionDevices(e);return r.qy`
      <div class="tactical-motion" role="list" aria-label="Motion sensors" aria-live="polite">
        <div class="tactical-section-label" style="width:100%">MOTION</div>
        ${[...t.values()].map(({motion:e,battery:t,ambient:a,deviceId:i})=>{if(!e)return"";const s=e.entity?.entity_id||"",o=t||a;let l;if(o&&i){const t=this.hass?.devices?.[i],a=t?.name_by_user||t?.name||"",r=this.hass?.areas?.[this.areaId];l=r?.name&&a.toLowerCase().startsWith(r.name.toLowerCase())?a.slice(r.name.length).trim().replace(/^[-–:]\s*/,"")||a:a||e.state?.attributes?.friendly_name||s}else l=e.state?.attributes?.friendly_name||s;const c="on"===e.state?.state,d=c?"DETECTED":"CLEAR",p=c?"var(--lcars-butterscotch)":"var(--lcars-ice)",u=t?Number(t.state?.state)||0:null,m=null!==u?this._batteryColor(u):null,h=a?"illuminance"===a.state?.attributes?.device_class?Number(a.state?.state)>10:"on"===a.state?.state:null,f=`${l}: ${d}`+(null!==u?`, battery ${u}%`:"")+(null!==h?", "+(h?"bright":"dark"):"");return r.qy`
            <div class="tactical-motion-chip ${o?"composite":""}"
                 role="listitem"
                 tabindex="0"
                 aria-label="${f}"
                 ?data-detected=${c}
                 ?data-clear=${!c}
                 @click=${()=>(0,n.Hv)(s)}
                 @keydown=${e=>("Enter"===e.key||" "===e.key)&&(e.preventDefault(),(0,n.Hv)(s))}>
              <span class="chip-indicator" style="background:${p}"></span>
              <span class="chip-name">${l}</span>
              <span class="chip-state">${d}</span>
              ${o?r.qy`
                <span class="chip-meta">
                  ${null!==h?r.qy`
                    <span class="chip-ambient ${h?"bright":"dark"}"
                          aria-hidden="true"
                          title="${h?"Bright":"Dark"}"></span>
                  `:""}
                  ${null!==u?r.qy`
                    <span class="chip-battery" aria-hidden="true"
                          title="Battery: ${u}%">
                      <span class="chip-battery-bar"
                            style="--battery-color: ${m}">
                        ${[1,2,3,4,5].map(e=>r.qy`
                          <span class="chip-battery-seg ${this._batterySegFilled(u,e)?"filled":""}"></span>
                        `)}
                      </span>
                      <span class="chip-battery-pct">${u}%</span>
                    </span>
                  `:""}
                </span>
              `:""}
            </div>
          `})}
      </div>
    `}_batterySegFilled(e,t){return e>=[0,11,26,51,76][t-1]}_batteryColor(e){return e<=10?"var(--lcars-tomato)":e<=25?"var(--lcars-peach)":e<=50?"var(--lcars-butterscotch)":"var(--lcars-sunflower)"}_toggleLock(e,t){g.e.play("lockToggle"),t?this._callService("lock","lock",{entity_id:e}):this._requestConfirm(e,e=>{this._callService("lock","unlock",{entity_id:e})},"CONFIRM UNLOCK?")}_toggleCover(e,t){g.e.play("coverAction"),"closed"===t?this._requestConfirm(e,e=>{this._callService("cover","open_cover",{entity_id:e})},"CONFIRM OPEN?"):"open"===t?this._requestConfirm(e,e=>{this._callService("cover","close_cover",{entity_id:e})},"CONFIRM CLOSE?"):"opening"!==t&&"closing"!==t||this._callService("cover","stop_cover",{entity_id:e})}_getCoverStateInfo(e){switch(e?.state||""){case"open":return{text:"OPEN",hint:"TAP TO CLOSE",color:"var(--lcars-tomato)",transitional:!1};case"closed":return{text:"CLOSED",hint:"TAP TO OPEN",color:"var(--lcars-sunflower)",transitional:!1};case"opening":return{text:"OPENING…",hint:"",color:"var(--lcars-butterscotch)",transitional:!0};case"closing":return{text:"CLOSING…",hint:"",color:"var(--lcars-butterscotch)",transitional:!0};case"stopped":return{text:"STOPPED",hint:"TAP TO OPEN",color:"var(--lcars-peach)",transitional:!1};default:return{text:"UNKNOWN",hint:"",color:"var(--lcars-disabled)",transitional:!1}}}_pendingConfirm=null;_requestConfirm(e,t,a){this._cancelConfirm(),this._pendingConfirm={entityId:e,action:t,label:a},this._pendingConfirm.timer=setTimeout(()=>{this._cancelConfirm()},5e3),this.requestUpdate()}_executeConfirm(){if(!this._pendingConfirm)return;const{entityId:e,action:t}=this._pendingConfirm;clearTimeout(this._pendingConfirm.timer),this._pendingConfirm=null,t(e),this.requestUpdate()}_cancelConfirm(){this._pendingConfirm&&(clearTimeout(this._pendingConfirm.timer),this._pendingConfirm=null,this.requestUpdate())}disconnectedCallback(){super.disconnectedCallback(),this._cancelConfirm()}_buildGroup(e,t){let a=null;for(const r of e){const e=r.entity?.device_id;if(e&&t[e]){a=t[e];break}}return{device:a,entities:e}}}customElements.define("lcars-tactical-panel",Z);const Q=r.AH`

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
`,K=new Set(["garage_door","gate","door"]);class J extends x.j{get panelType(){return"viewport"}get defaultPanelTitle(){return"VIEWPORT CONTROLS"}get frameColor(){return"var(--lcars-sunflower)"}static get styles(){return[...super.styles,s.AM,Q]}_getCoverEntries(){return this._getAllEntities().filter(e=>{if("cover"!==e.domain)return!1;const t=e.state?.attributes?.device_class||"";return!K.has(t)})}renderBadge(){const e=this._getCoverEntries(),t=e.filter(e=>"open"===e.state?.state).length,a=e.length;if(0===a)return r.qy``;const i=t>0?"var(--lcars-sunflower)":"var(--lcars-gray)";return r.qy`<lcars-summary-badge value="${t}/${a} OPEN" color="${i}"></lcars-summary-badge>`}renderContent(){const e=this._getCoverEntries();return 0===e.length?r.qy`<div class="viewport-empty">NO VIEWPORT CONTROLS</div>`:r.qy`
      <div class="viewport-content" role="list" aria-label="Viewport controls">
        ${e.map(e=>this._renderCoverRow(e))}
      </div>
    `}_renderCoverRow(e){const t=e.entity?.entity_id||"",a=e.state?.attributes?.friendly_name||t,i=e.state?.state||"unknown",s=e.state?.attributes?.current_position,o="open"===i,l="closed"===i,c=o?"var(--lcars-sunflower)":"var(--lcars-gray)",d=null!=s?`${s}%`:i.toUpperCase(),p=1&(e.state?.attributes?.supported_features||0),u=2&(e.state?.attributes?.supported_features||0),m=8&(e.state?.attributes?.supported_features||0);return r.qy`
      <div class="viewport-cover-row"
           role="listitem"
           tabindex="0"
           aria-label="${a}: ${d}"
           @click=${()=>(0,n.Hv)(t)}
           @keydown=${e=>("Enter"===e.key||" "===e.key)&&(e.preventDefault(),(0,n.Hv)(t))}>
        <span class="viewport-indicator" style="background:${c}"></span>
        <span class="viewport-name">${a}</span>
        <span class="viewport-position">${d}</span>
        <span class="viewport-controls" @click=${e=>e.stopPropagation()}>
          ${p?r.qy`
            <button class="viewport-btn"
                    ?data-active=${o}
                    aria-label="Open ${a}"
                    @click=${()=>{g.e.play("coverAction"),this._callService("cover","open_cover",{entity_id:t})}}>
              ▲
            </button>
          `:""}
          ${m?r.qy`
            <button class="viewport-btn"
                    aria-label="Stop ${a}"
                    @click=${()=>{g.e.play("coverAction"),this._callService("cover","stop_cover",{entity_id:t})}}>
              ■
            </button>
          `:""}
          ${u?r.qy`
            <button class="viewport-btn"
                    ?data-active=${l}
                    aria-label="Close ${a}"
                    @click=${()=>{g.e.play("coverAction"),this._callService("cover","close_cover",{entity_id:t})}}>
              ▼
            </button>
          `:""}
        </span>
      </div>
    `}}customElements.define("lcars-viewport-panel",J);const ee=r.AH`

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
`,te=new Set(["smoke","gas","carbon_monoxide","heat","safety"]);new Set(["battery"]);class ae extends x.j{get panelType(){return"hazard"}get defaultPanelTitle(){return"HAZARD DETECTION"}get frameColor(){return this._getAllEntities().some(e=>{const t=e.state?.attributes?.device_class||"";return te.has(t)&&"on"===e.state?.state})?"var(--lcars-tomato)":"var(--lcars-sunflower)"}static get styles(){return[...super.styles,s.AM,ee]}_partitionEntities(){const e=this._getAllEntities(),t=this.hass?.devices||{},a=new Map,r=[];for(const i of e){const e=i.entity?.device_id;e?(a.has(e)||a.set(e,{device:t[e]||null,entries:[]}),a.get(e).entries.push(i)):r.push(i)}return{deviceMap:a,ungrouped:r}}renderBadge(){const e=this._getAllEntities().filter(e=>{const t=e.state?.attributes?.device_class||"";return te.has(t)&&"on"===e.state?.state}).length;return e>0?r.qy`<lcars-summary-badge value="⚠ ${e} ALERT" color="var(--lcars-tomato)"></lcars-summary-badge>`:r.qy`<lcars-summary-badge value="ALL CLEAR" color="var(--lcars-sunflower)"></lcars-summary-badge>`}renderContent(){const{deviceMap:e,ungrouped:t}=this._partitionEntities();return 0===e.size&&0===t.length?r.qy`<div class="hazard-empty">NO HAZARD DETECTORS</div>`:r.qy`
      <div class="hazard-content">
        <div class="hazard-section-label">DETECTORS</div>
        <div class="hazard-detectors">
          ${Array.from(e.values()).map(e=>this._renderDetectorCard(e))}
        </div>
        ${this._renderBatteryOverview(e)}
      </div>
    `}_renderDetectorCard(e){const t=e.device?.name_by_user||e.device?.name||"Detector",a=e.entries.filter(e=>{const t=e.state?.attributes?.device_class||"";return te.has(t)}),i=e.entries.find(e=>"occupancy"===e.state?.attributes?.device_class),s=a.some(e=>"on"===e.state?.state),o=e.entries[0]?.entity?.entity_id||"";return r.qy`
      <div class="hazard-detector-card"
           tabindex="0"
           role="group"
           aria-label="${t}"
           ?data-alert=${s}
           style="--detector-color: ${s?"var(--lcars-tomato)":"var(--lcars-sunflower)"}"
           @click=${()=>(0,n.Hv)(o)}
           @keydown=${e=>("Enter"===e.key||" "===e.key)&&(e.preventDefault(),(0,n.Hv)(o))}>
        <div class="hazard-detector-name">${t}</div>
        ${a.map(e=>{const t=e.state?.attributes?.device_class||"",a="on"===e.state?.state,i=t.replace(/_/g," ").toUpperCase(),s=a?"DETECTED":"CLEAR",n=a?"var(--lcars-tomato)":"var(--lcars-sunflower)";return r.qy`
            <div class="hazard-status-row">
              <span class="hazard-status-indicator" style="background:${n}"></span>
              <span class="hazard-status-label">${i}</span>
              <span class="hazard-status-value" style="color:${n}">${s}</span>
            </div>
          `})}
        ${i?r.qy`
          <div class="hazard-status-row">
            <span class="hazard-status-indicator" style="background:${"on"===i.state?.state?"var(--lcars-ice)":"var(--lcars-gray)"}"></span>
            <span class="hazard-status-label">OCCUPANCY</span>
            <span class="hazard-status-value">${"on"===i.state?.state?"DETECTED":"CLEAR"}</span>
          </div>
        `:""}
      </div>
    `}_renderBatteryOverview(e){const t=[];for(const a of e.values())for(const e of a.entries)"battery"===(e.state?.attributes?.device_class||"")&&"sensor"===e.domain&&t.push({name:a.device?.name_by_user||a.device?.name||"Detector",level:parseFloat(e.state?.state)||0,entity:e});return 0===t.length?r.qy``:r.qy`
      <div>
        <div class="hazard-section-label">BATTERY STATUS</div>
        <div class="hazard-batteries">
          ${t.map(e=>{const t=e.level>50?"var(--lcars-sunflower)":e.level>20?"var(--lcars-butterscotch)":"var(--lcars-tomato)";return r.qy`
              <div class="hazard-battery-chip" tabindex="0"
                   @click=${()=>(0,n.Hv)(e.entity.entity?.entity_id)}
                   @keydown=${t=>("Enter"===t.key||" "===t.key)&&(t.preventDefault(),(0,n.Hv)(e.entity.entity?.entity_id))}>
                <span style="color:var(--lcars-gray)">${e.name}:</span>
                <div class="hazard-battery-bar">
                  <div class="hazard-battery-fill" style="width:${e.level}%;background:${t}"></div>
                </div>
                <span style="color:${t}">${Math.round(e.level)}%</span>
              </div>
            `})}
        </div>
      </div>
    `}}customElements.define("lcars-hazard-panel",ae);const re=r.AH`

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
`;new Set(["ge_home","smartthinq_sensors"]),new Set(["temperature","duration","enum"]);class ie extends x.j{get panelType(){return"galley"}get defaultPanelTitle(){return"GALLEY SYSTEMS"}get frameColor(){return"var(--lcars-butterscotch)"}static get styles(){return[...super.styles,s.AM,re]}_partitionEntities(){const e=this._getAllEntities(),t=this.hass?.devices||{},a=new Map;for(const r of e){const e=r.entity?.device_id;e&&(a.has(e)||a.set(e,{device:t[e]||null,entries:[]}),a.get(e).entries.push(r))}return{deviceMap:a}}renderBadge(){const e=this._getAllEntities().filter(e=>{const t=(e.state?.state||"").toLowerCase();return"running"===t||"cooking"===t||"preheat"===t||"on"===t||"drying"===t||"washing"===t}).length;return e>0?r.qy`<lcars-summary-badge value="${e} ACTIVE" color="var(--lcars-gold)"></lcars-summary-badge>`:r.qy`<lcars-summary-badge value="STANDBY" color="var(--lcars-gray)"></lcars-summary-badge>`}renderContent(){const{deviceMap:e}=this._partitionEntities();return 0===e.size?r.qy`<div class="galley-empty">NO GALLEY SYSTEMS</div>`:r.qy`
      <div class="galley-content">
        <div class="galley-section-label">APPLIANCES</div>
        <div class="galley-appliances">
          ${Array.from(e.values()).map(e=>this._renderApplianceCard(e))}
        </div>
      </div>
    `}_renderApplianceCard(e){const t=e.device?.name_by_user||e.device?.name||"Appliance",a=e.entries[0]?.entity?.entity_id||"",i=e.entries.filter(e=>"temperature"===e.state?.attributes?.device_class&&"diagnostic"!==e.entity_category),s=e.entries.filter(e=>"duration"===e.state?.attributes?.device_class),o=e.entries.filter(e=>{const t=e.entity?.entity_id||"";return/cook_mode|current_state|status/i.test(t)&&"diagnostic"!==e.entity_category}),l=e.entries.some(e=>{const t=(e.state?.state||"").toLowerCase();return"running"===t||"cooking"===t||"preheat"===t||"on"===t||"drying"===t||"washing"===t});return r.qy`
      <div class="galley-appliance-card"
           tabindex="0"
           role="group"
           aria-label="${t}"
           ?data-active=${l}
           @click=${()=>(0,n.Hv)(a)}
           @keydown=${e=>("Enter"===e.key||" "===e.key)&&(e.preventDefault(),(0,n.Hv)(a))}>
        <div class="galley-appliance-name">${t}</div>

        ${o.slice(0,2).map(e=>{const a=e.state?.attributes?.friendly_name?.replace(t,"").trim()||"Status",i=e.state?.state||"unknown",s=l?"var(--lcars-gold)":"var(--lcars-gray)";return r.qy`
            <div class="galley-status-row">
              <span class="galley-status-indicator" style="background:${s}"></span>
              <span class="galley-status-label">${a}</span>
              <span class="galley-status-value" style="color:${s}">${i}</span>
            </div>
          `})}

        ${i.slice(0,2).map(e=>{const a=e.state?.attributes?.friendly_name?.replace(t,"").trim()||"Temperature",i=e.state?.state||"--",s=e.state?.attributes?.unit_of_measurement||"";return r.qy`
            <div class="galley-status-row">
              <span class="galley-status-indicator" style="background:var(--lcars-butterscotch)"></span>
              <span class="galley-status-label">${a}</span>
              <span class="galley-status-value" style="color:var(--lcars-butterscotch)">${i}${s}</span>
            </div>
          `})}

        ${s.slice(0,1).map(e=>{const t=e.state?.state||"--";return r.qy`
            <div class="galley-timer" aria-label="Timer: ${t}">⏱ ${t}</div>
          `})}
      </div>
    `}}customElements.define("lcars-galley-panel",ie);const se=r.AH`
  :host { display: block; }

  /* ═══ Panel Content Grid ═══ */
  .lcars-device-panel {
    --panel-frame-color: var(--ev-charger-state-color, var(--lcars-lilac));
    display: grid;
    grid-template-areas:
      "header  header"
      "sensors media"
      "solar   solar"
      "auxctrl auxctrl";
    grid-template-columns: minmax(10rem, 1fr) minmax(14rem, 2fr);
    grid-template-rows: auto 1fr auto auto;
    gap: var(--lcars-gap);
    min-height: calc(var(--lcars-vunit, 4rem) * 5);
    transition: border-color 600ms;
  }

  /* Header */
  .ev-header { grid-area: header; display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0.75rem; border-bottom: 2px solid var(--panel-frame-color); }
  .ev-header ha-icon { --mdc-icon-size: 20px; flex-shrink: 0; }
  .device-panel-name { font-size: var(--lcars-font-size-sub); color: var(--panel-frame-color); text-transform: uppercase; white-space: nowrap; }
  .device-panel-header-line { flex: 1; height: 2px; background: var(--panel-frame-color); opacity: 0.5; }
  .ev-status-badge { font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; white-space: nowrap; font-weight: 700; transition: color 600ms; }
  .ev-header-power { font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; white-space: nowrap; transition: color 600ms; }
  .panel-numeric-code { font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); color: var(--panel-frame-color); opacity: 0.7; white-space: nowrap; }

  /* Sensors column */
  .ev-sensors { grid-area: sensors; display: flex; flex-direction: column; gap: 0.125rem; padding: 0.25rem 0; align-self: start; overflow-y: auto; max-height: 28rem; }
  .ev-section-label { font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); color: var(--lcars-sky, #aaaaff); text-transform: uppercase; padding: 0.25rem 0.5rem 0; letter-spacing: 0.05em; }
  .ev-section-divider { height: 1px; background: var(--lcars-disabled); margin: 0.25rem 0; opacity: 0.5; }
  .device-sensor-line { display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0.5rem; cursor: pointer; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; transition: background var(--lcars-transition); font-size: var(--lcars-font-size-data); text-transform: uppercase; }
  .device-sensor-line:hover { background: rgba(255,255,255,0.05); }
  .device-sensor-line:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
  .sensor-indicator { width: 0.5rem; height: 0.5rem; border-radius: 50%; flex-shrink: 0; }
  .sensor-label { flex: 1; color: var(--lcars-space-white); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.75rem; }
  .sensor-state-value { flex-shrink: 0; font-weight: 700; font-size: var(--lcars-font-size-data); }

  /* Media / Flow Visualization */
  .ev-media {
    grid-area: media; position: relative;
    border: 3px solid var(--panel-frame-color); border-radius: 0.5rem;
    overflow: hidden; background: var(--lcars-bg, #000);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 0.5rem; padding: 1rem; min-height: 14rem;
  }
  .ev-media::before, .ev-media::after {
    content: ''; position: absolute; width: 1.5rem; height: 1.5rem;
    border-color: var(--panel-frame-color); border-style: solid; pointer-events: none; z-index: 1;
  }
  .ev-media::before { top: 0.25rem; left: 0.25rem; border-width: 3px 0 0 3px; border-radius: 0.25rem 0 0 0; }
  .ev-media::after { bottom: 0.25rem; right: 0.25rem; border-width: 0 1px 1px 0; border-radius: 0 0 0.25rem 0; }
  .ev-flow-display { width: 100%; max-width: 14rem; height: auto; display: block; }

  /* Chevron cascade animation */
  @keyframes ev-chevron-cascade {
    0%   { opacity: 0.2; }
    33%  { opacity: 1; }
    66%  { opacity: 0.2; }
    100% { opacity: 0.2; }
  }
  .ev-flow-chevron {
    animation: ev-chevron-cascade 1.5s ease-in-out infinite;
    animation-delay: calc(var(--chevron-delay, 0) * 0.3s);
  }
  .ev-flow-idle .ev-flow-chevron { animation: none; }
  @media (prefers-reduced-motion: reduce) {
    .ev-flow-chevron { animation: none; }
  }

  /* Solar mode strip */
  .ev-solar-strip {
    grid-area: solar; display: flex; flex-wrap: wrap; align-items: center;
    gap: var(--lcars-gap); padding-top: var(--lcars-gap); border-top: 2px solid var(--panel-frame-color);
  }
  .ev-strip-label { font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); color: var(--lcars-text-heading, var(--lcars-sunflower)); text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap; margin-right: 0.5rem; }
  .ev-solar-btn {
    display: flex; align-items: center; gap: 0.375rem;
    height: var(--lcars-btn-height, 3rem); padding: 0 0.75rem 0 0.5rem; min-width: 5rem;
    background: var(--lcars-disabled); color: var(--lcars-space-white); border: none;
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    font-family: var(--lcars-font); font-size: var(--lcars-font-size-data);
    text-transform: uppercase; cursor: pointer; transition: filter var(--lcars-transition), background var(--lcars-transition);
    white-space: nowrap; user-select: none;
  }
  .ev-solar-btn:hover { filter: brightness(1.2); }
  .ev-solar-btn:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
  .ev-solar-btn[aria-checked="true"] { background: var(--lcars-gold, var(--lcars-sunflower)); color: var(--lcars-black); }
  .ev-solar-btn ha-icon { --mdc-icon-size: 16px; flex-shrink: 0; }

  /* Aux controls */
  .ev-aux-controls {
    grid-area: auxctrl; display: flex; flex-wrap: wrap; align-items: center;
    gap: calc(var(--lcars-gap) * 4); padding-top: var(--lcars-gap); border-top: 2px solid var(--panel-frame-color);
  }
  .ev-aux-label { font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); color: var(--lcars-text-heading, var(--lcars-sunflower)); text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap; }
  .ev-current-control { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
  .ev-current-adjuster { display: flex; align-items: center; gap: 0.5rem; }
  .ev-adj-btn {
    display: flex; align-items: center; justify-content: center;
    width: 2.5rem; height: 2.5rem; min-width: 2.5rem;
    background: var(--lcars-sunflower); color: var(--lcars-black); border: none;
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    font-family: var(--lcars-font); font-size: var(--lcars-font-size-sub); font-weight: 700;
    cursor: pointer; transition: filter var(--lcars-transition); user-select: none;
  }
  .ev-adj-btn.decrement { border-radius: var(--lcars-btn-radius) 0 0 var(--lcars-btn-radius); }
  .ev-adj-btn:hover { filter: brightness(1.2); }
  .ev-adj-btn:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
  .ev-current-value { font-family: var(--lcars-font); font-size: var(--lcars-font-size-sub); color: var(--lcars-space-white); text-transform: uppercase; font-weight: 700; min-width: 3rem; text-align: center; }
  .ev-lock-control { display: flex; align-items: center; gap: 0.5rem; }
  .ev-lock-toggle {
    height: var(--lcars-btn-height, 3rem); padding: 0 0.75rem; min-width: 3rem;
    background: var(--lcars-disabled); color: var(--lcars-space-white); border: none;
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    font-family: var(--lcars-font); font-size: var(--lcars-font-size-data);
    text-transform: uppercase; font-weight: 700; cursor: pointer;
    transition: background var(--lcars-transition);
  }
  .ev-lock-toggle[aria-checked="true"] { background: var(--lcars-ice); color: var(--lcars-black); }
  .ev-lock-toggle:hover { filter: brightness(1.2); }
  .ev-lock-toggle:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }

  /* Responsive: stack on narrow */
  @media (max-width: 480px) {
    .lcars-device-panel {
      grid-template-areas: "header" "media" "sensors" "solar" "auxctrl";
      grid-template-columns: 1fr;
    }
  }
`;function ne(e){const t=e.entity?.entity_id||"",a=(e.state,e.domain||"");if("lock"===a)return"lock";if("select"===a&&/solar/i.test(t))return"solar_mode";if("number"===a&&/max.*current/i.test(t))return"max_current_number";if("sensor"===a){if(/status_description/i.test(t))return"status";if(/current_mode/i.test(t))return"mode";if(/charging_power/i.test(t))return"charging_power";if(/charging_speed/i.test(t))return"charging_speed";if(/added_energy/i.test(t)&&!/green|grid/i.test(t))return"added_energy";if(/added_range/i.test(t))return"added_range";if(/(?:^|_)cost$/i.test(t))return"cost";if(/added_green_energy/i.test(t))return"green_energy";if(/added_grid_energy/i.test(t))return"grid_energy";if(/discharged_energy/i.test(t))return"discharged_energy";if(/state_of_charge/i.test(t))return"soc";if(/depot_price/i.test(t))return"depot_price";if(/max_available_power/i.test(t))return"max_available";if(/max_charging_current/i.test(t))return"max_current";if(/energy_price/i.test(t))return"energy_price"}return null}const oe=[{role:"status",label:"STATUS",color:null},{role:"mode",label:"MODE",color:"var(--lcars-data-accent, var(--lcars-sunflower))"}],le=[{role:"charging_power",label:"POWER",unit:"kW",color:null},{role:"charging_speed",label:"SPEED",unit:"km/h"},{role:"added_energy",label:"ADDED",unit:"kWh"},{role:"added_range",label:"RANGE",unit:"km"},{role:"cost",label:"COST",unit:"$"}],ce=[{role:"green_energy",label:"GREEN ENERGY",unit:"kWh",color:"var(--lcars-bluey, var(--lcars-ice))"},{role:"grid_energy",label:"GRID ENERGY",unit:"kWh",color:"var(--lcars-butterscotch)"},{role:"discharged_energy",label:"DISCHARGED",unit:"kWh",color:"var(--lcars-ice)"}],de=[{role:"soc",label:"SOC",unit:"%",color:null},{role:"depot_price",label:"DEPOT PRICE",unit:"$/kWh"}],pe=[{role:"max_available",label:"MAX AVAILABLE",unit:"kW"},{role:"max_current",label:"MAX CURRENT",unit:"A"},{role:"energy_price",label:"ENERGY PRICE",unit:"$/kWh"}];class ue extends x.j{get panelType(){return"ev_charger"}get defaultPanelTitle(){return"EV CHARGER"}get frameColor(){const e=this._entityMap(),t=e.get("status")?.state?.state,a=e.get("charging_power")?.state?.state,r=null!=a?parseFloat(a):null;return(0,l.N)(t,r)}static get styles(){return[...super.styles,s.AM,se]}_entityMap(){if(this.__entityMapCache)return this.__entityMapCache;const e=new Map;for(const t of this._getAllEntities()){const a=ne(t);a&&!e.has(a)&&e.set(a,t)}return this.__entityMapCache=e,e}updated(e){super.updated(e),this.__entityMapCache=null}renderBadge(){const e=this._entityMap(),t=e.get("status")?.state?.state,a=(0,l.WG)(t),i=this.frameColor;return r.qy`<lcars-summary-badge value="${a}" color="${i}"></lcars-summary-badge>`}renderContent(){const e=this._entityMap(),t=e.get("status")?.state?.state;if(!t||"unavailable"===t||"unknown"===t)return r.qy`
        <div class="lcars-device-panel ev-empty-state">
          <div class="ev-header">
            <ha-icon icon="mdi:ev-station" style="color: var(--lcars-gray)"></ha-icon>
            <span class="device-panel-name">${this._getPanelName?this._getPanelName():this.defaultPanelTitle}</span>
            <span class="device-panel-header-line" aria-hidden="true"></span>
            <span class="ev-status-badge" style="color: var(--lcars-gray)">OFFLINE</span>
          </div>
        </div>
      `;const a=e.get("charging_power")?.state?.state,i=null!=a?parseFloat(a):0,s=this.frameColor,n=(0,l.WG)(t),o=(0,l.t$)(t),c=e.get("soc")?.state?.state,d=null!=c&&"unavailable"!==c&&"unknown"!==c?parseFloat(c):null,p=(0,l.MO)(d),u=t&&(String(t).toLowerCase().includes("discharg")||String(t).toLowerCase().includes("v2g")),m=!(t&&String(t).toLowerCase().includes("charg")&&!String(t).toLowerCase().includes("waiting")||u);return r.qy`
      <div class="lcars-device-panel" style="--ev-charger-state-color: ${s}">
        ${this._renderHeader(s,o,n,i)}
        ${this._renderSensors(e,s,p)}
        ${this._renderFlowDisplay(i,s,n,d,p,u,m)}
        ${this._renderSolarStrip(e)}
        ${this._renderAuxControls(e)}
      </div>
    `}_renderHeader(e,t,a,i){const s=this._getPanelName?this._getPanelName():this.defaultPanelTitle;return r.qy`
      <div class="ev-header">
        <ha-icon icon="mdi:ev-station" style="color: ${e}"></ha-icon>
        <span class="device-panel-name">${s}</span>
        <span class="device-panel-header-line" aria-hidden="true"></span>
        <span class="ev-status-badge" style="color: ${e}">
          <span aria-hidden="true">${t}</span>
          ${a}
        </span>
        <span class="ev-header-power" style="color: ${e}">
          ${i>.1?`${(0,c.ZV)(i,1)} KW`:""}
        </span>
      </div>
    `}_renderSensors(e,t,a){return r.qy`
      <div class="ev-sensors">
        ${this._renderSensorGroup(e,oe,t,null)}
        <div class="ev-section-divider"></div>
        <div class="ev-section-label">SESSION</div>
        ${this._renderSensorGroup(e,le,t,null)}
        <div class="ev-section-divider"></div>
        <div class="ev-section-label">ENERGY BALANCE</div>
        ${this._renderSensorGroup(e,ce,null,null)}
        <div class="ev-section-divider"></div>
        <div class="ev-section-label">VEHICLE</div>
        ${this._renderSensorGroup(e,de,null,a)}
        <div class="ev-section-divider"></div>
        <div class="ev-section-label">CHARGER</div>
        ${this._renderSensorGroup(e,pe,null,null)}
      </div>
    `}_renderSensorGroup(e,t,a,i){return t.map(t=>{const s=e.get(t.role);if(!s)return r.qy``;const n=s.state?.state;if(null==n||"unavailable"===n||"unknown"===n)return this._renderSensorLine(s,t.label,"—","var(--lcars-disabled)",t.unit);const o=isNaN(n)?n:(0,c.ZV)(parseFloat(n),1);let l=t.color||"var(--lcars-space-white)";return"status"!==t.role&&"charging_power"!==t.role||(l=a||l),"soc"===t.role&&i&&(l=i),this._renderSensorLine(s,t.label,o,l,t.unit)})}_renderSensorLine(e,t,a,i,s){const o=e.entity?.entity_id||"";return r.qy`
      <div class="device-sensor-line"
           tabindex="0"
           role="button"
           aria-label="${t}: ${a}${s?" "+s:""}"
           @click=${()=>(0,n.Hv)(o)}
           @keydown=${e=>("Enter"===e.key||" "===e.key)&&(e.preventDefault(),(0,n.Hv)(o))}>
        <span class="sensor-indicator" style="background: ${i}"></span>
        <span class="sensor-label">${t}</span>
        <span class="sensor-state-value" style="color: ${i}">
          ${a}${s&&"—"!==a?r.qy` <small>${s}</small>`:""}
        </span>
      </div>
    `}_renderFlowDisplay(e,t,a,i,s,n,o){const l=`Energy flow: ${a}, ${e>.1?(0,c.ZV)(e,1)+" kilowatts":"idle"}${null!=i?", vehicle at "+i+" percent":""}`;return r.qy`
      <div class="ev-media">
        <svg class="ev-flow-display"
             viewBox="0 0 200 200"
             role="img"
             aria-label="${l}">
          <!-- Flow direction chevrons -->
          ${o?r.qy`
            <g class="ev-flow-idle">
              <line x1="65" y1="60" x2="85" y2="60" stroke="var(--lcars-lilac)" stroke-width="3" stroke-linecap="round" />
              <line x1="90" y1="60" x2="110" y2="60" stroke="var(--lcars-lilac)" stroke-width="3" stroke-linecap="round" />
              <line x1="115" y1="60" x2="135" y2="60" stroke="var(--lcars-lilac)" stroke-width="3" stroke-linecap="round" />
            </g>
          `:r.qy`
            <g class="ev-flow-chevrons"
               transform="${n?"rotate(180, 100, 60)":""}">
              <polyline class="ev-flow-chevron" points="70,40 100,55 130,40"
                fill="none" stroke="${t}" stroke-width="3"
                stroke-linecap="round" stroke-linejoin="round" style="--chevron-delay: 0" />
              <polyline class="ev-flow-chevron" points="70,52 100,67 130,52"
                fill="none" stroke="${t}" stroke-width="3"
                stroke-linecap="round" stroke-linejoin="round" style="--chevron-delay: 1" />
              <polyline class="ev-flow-chevron" points="70,64 100,79 130,64"
                fill="none" stroke="${t}" stroke-width="3"
                stroke-linecap="round" stroke-linejoin="round" style="--chevron-delay: 2" />
            </g>
          `}

          <!-- Power readout -->
          <text x="100" y="110" text-anchor="middle" dominant-baseline="middle"
                fill="${t}" font-family="var(--lcars-font)" font-size="32">
            ${e>.1?`${(0,c.ZV)(e,1)} KW`:""}
          </text>

          <!-- Status label -->
          <text x="100" y="128" text-anchor="middle" dominant-baseline="middle"
                fill="var(--lcars-space-white)" font-family="var(--lcars-font)" font-size="11">
            ${a}
          </text>

          <!-- SoC percentage -->
          <text x="100" y="155" text-anchor="middle" dominant-baseline="middle"
                fill="${s}" font-family="var(--lcars-font)" font-size="26">
            ${null!=i?`${i}%`:"--"}
          </text>

          <!-- SoC bar background -->
          <rect x="45" y="168" width="110" height="8" rx="4"
                fill="var(--lcars-gray)" opacity="0.3" />
          <!-- SoC bar fill -->
          <rect x="45" y="168"
                width="${null!=i?Math.max(0,Math.min(110,i/100*110)):0}"
                height="8" rx="4" fill="${s}" />
        </svg>
      </div>
    `}_renderSolarStrip(e){const t=e.get("solar_mode");if(!t)return r.qy``;const a=t.entity?.entity_id||"",i=t.state?.state||"",s=t.state?.attributes?.options||[];return 0===s.length?r.qy``:r.qy`
      <div class="ev-solar-strip" role="radiogroup" aria-label="Solar charging mode">
        <span class="ev-strip-label">SOLAR MODE</span>
        ${s.map(e=>r.qy`
          <button class="ev-solar-btn"
                  role="radio"
                  aria-checked="${String(e===i)}"
                  aria-label="Solar mode: ${e}"
                  @click=${()=>this._setSolarMode(a,e)}>
            <ha-icon icon="${function(e){const t=String(e).toLowerCase();return t.includes("full")&&t.includes("solar")?"mdi:solar-power-variant":t.includes("eco")?"mdi:leaf":t.includes("full")?"mdi:flash":t.includes("off")?"mdi:power-off":"mdi:solar-power"}(e)}" aria-hidden="true"></ha-icon>
            ${String(e).toUpperCase()}
          </button>
        `)}
      </div>
    `}_setSolarMode(e,t){this.hass&&e&&(g.e.play("switchToggle"),this._callService("select","select_option",{entity_id:e,option:t}))}_renderAuxControls(e){const t=e.get("max_current_number"),a=e.get("lock");return t||a?r.qy`
      <div class="ev-aux-controls">
        ${t?this._renderCurrentControl(t):""}
        ${a?this._renderLockControl(a):""}
      </div>
    `:r.qy``}_renderCurrentControl(e){const t=e.entity?.entity_id||"",a=e.state?.state,i=null==a||isNaN(a)?null:Number(a),s=e.state?.attributes?.min??6,n=e.state?.attributes?.max??32,o=e.state?.attributes?.step??1;return r.qy`
      <div class="ev-current-control" role="group" aria-label="Maximum charging current">
        <span class="ev-aux-label">MAX CURRENT</span>
        <div class="ev-current-adjuster">
          <button class="ev-adj-btn decrement"
                  aria-label="Decrease maximum charging current"
                  ?disabled=${null==i||i<=s}
                  @click=${()=>this._adjustCurrent(t,i,-o,s,n)}>
            <span aria-hidden="true">–</span>
          </button>
          <span class="ev-current-value">${null!=i?`${i}A`:"—"}</span>
          <button class="ev-adj-btn increment"
                  aria-label="Increase maximum charging current"
                  ?disabled=${null==i||i>=n}
                  @click=${()=>this._adjustCurrent(t,i,o,s,n)}>
            <span aria-hidden="true">+</span>
          </button>
        </div>
      </div>
    `}_adjustCurrent(e,t,a,r,i){if(!this.hass||!e||null==t)return;g.e.play("climateAdjust");const s=Math.max(r,Math.min(i,t+a));this._callService("number","set_value",{entity_id:e,value:s})}_renderLockControl(e){const t=e.entity?.entity_id||"",a="locked"===e.state?.state;return r.qy`
      <div class="ev-lock-control" role="group" aria-label="Cable lock control">
        <ha-icon icon="mdi:lock" style="color: var(--lcars-data-accent, var(--lcars-sunflower))" aria-hidden="true"></ha-icon>
        <span class="ev-aux-label">CABLE LOCK</span>
        <button class="ev-lock-toggle"
                role="switch"
                aria-checked="${String(a)}"
                aria-label="Cable lock: ${a?"locked":"unlocked"}"
                @click=${()=>this._toggleLock(t,a)}>
          ${a?"LOCKED":"UNLOCKED"}
        </button>
      </div>
    `}_toggleLock(e,t){this.hass&&e&&(g.e.play("lockToggle"),this._callService("lock",t?"unlock":"lock",{entity_id:e}))}}customElements.get("lcars-ev-charger-panel")||customElements.define("lcars-ev-charger-panel",ue);const me="Homepage",he=new Map([[o.KK,(e,t,a,i)=>r.qy`<lcars-camera-panel .group=${e} .hass=${t} .editMode=${a} .config=${i}></lcars-camera-panel>`],[o.a2,(e,t,a,i)=>r.qy`<lcars-environment-panel .group=${e} .hass=${t} .editMode=${a} .config=${i}></lcars-environment-panel>`],[o.MJ,(e,t,a,i)=>r.qy`<lcars-battery-panel .group=${e} .hass=${t} .editMode=${a} .config=${i}></lcars-battery-panel>`],[o.gC,(e,t,a,i)=>r.qy`<lcars-climate-panel .group=${e} .hass=${t} .editMode=${a} .config=${i}></lcars-climate-panel>`],[o.uk,(e,t,a,i)=>r.qy`<lcars-alarm-panel .group=${e} .hass=${t} .editMode=${a} .config=${i}></lcars-alarm-panel>`],[o.Lx,(e,t,a,i)=>r.qy`<lcars-media-panel .group=${e} .hass=${t} .editMode=${a} .config=${i}></lcars-media-panel>`],[o.Sp,(e,t,a,i)=>r.qy`<lcars-pool-spa-panel .group=${e} .hass=${t} .editMode=${a} .config=${i}></lcars-pool-spa-panel>`],[o.TZ,(e,t,a,i)=>r.qy`<lcars-weather-panel .group=${e} .hass=${t} .editMode=${a} .config=${i}></lcars-weather-panel>`],[o.sv,(e,t,a,i)=>r.qy`<lcars-illumination-panel .group=${e} .entities=${e.entities} .hass=${t} .editMode=${a} .config=${i} area-id="${e.areaId||""}"></lcars-illumination-panel>`],[o.QQ,(e,t,a,i)=>r.qy`<lcars-tactical-panel .group=${e} .entities=${e.entities} .hass=${t} .editMode=${a} .config=${i} area-id="${e.areaId||""}"></lcars-tactical-panel>`],[o.Z,(e,t,a,i)=>r.qy`<lcars-viewport-panel .group=${e} .entities=${e.entities} .hass=${t} .editMode=${a} .config=${i} area-id="${e.areaId||""}"></lcars-viewport-panel>`],[o.Jn,(e,t,a,i)=>r.qy`<lcars-hazard-panel .group=${e} .entities=${e.entities} .hass=${t} .editMode=${a} .config=${i} area-id="${e.areaId||""}"></lcars-hazard-panel>`],[o.xW,(e,t,a,i)=>r.qy`<lcars-galley-panel .group=${e} .entities=${e.entities} .hass=${t} .editMode=${a} .config=${i} area-id="${e.areaId||""}"></lcars-galley-panel>`],[o.Tl,(e,t,a,i)=>r.qy`<lcars-ev-charger-panel .group=${e} .entities=${e.entities} .hass=${t} .editMode=${a} .config=${i} area-id="${e.areaId||""}"></lcars-ev-charger-panel>`]]);function fe(e){const t=e?.attributes?.entity_picture;if(!t)return"";const a=e.last_updated||e.last_changed||"",r=t.includes("?")?"&":"?";return`${t}${r}_cb=${encodeURIComponent(a)}`}class ve extends r.WF{static get properties(){return{data:{type:Object},selectedArea:{type:String},selectedFloor:{type:String},_hass:{type:Object},_editMode:{type:Boolean}}}constructor(){super(),this.data=null,this.selectedArea=null,this.selectedFloor=null,this._editMode=!1,this._configLoading=!1,this._entityCache=new Map,this._cameraRefreshInterval=null,this._cameraObserver=null,this._visibleCameras=new Set,this._loadingCameras=new Set,this._onAreaSelected=e=>{n.g0.debug(me,"Area selected event:",e.detail.areaId),this._visibleCameras.clear(),this._loadingCameras.clear(),this.selectedArea=e.detail.areaId,this.selectedFloor=null,this._entityCache.clear()},this._onFloorSelected=e=>{n.g0.debug(me,"Floor selected event:",e.detail.floorId),this._visibleCameras.clear(),this._loadingCameras.clear(),this.selectedFloor=e.detail.floorId,this.selectedArea=null,this._entityCache.clear()},this._onEditMode=e=>{this._editMode=e.detail.enabled,n.g0.debug(me,"Edit mode:",this._editMode)}}connectedCallback(){super.connectedCallback(),n.o6.addEventListener("lcars-area-selected",this._onAreaSelected),n.o6.addEventListener("lcars-floor-selected",this._onFloorSelected),n.o6.addEventListener("lcars-edit-mode",this._onEditMode),this._startCameraRefresh(),document.addEventListener("visibilitychange",this._onVisibilityChange)}disconnectedCallback(){super.disconnectedCallback(),n.o6.removeEventListener("lcars-area-selected",this._onAreaSelected),n.o6.removeEventListener("lcars-floor-selected",this._onFloorSelected),n.o6.removeEventListener("lcars-edit-mode",this._onEditMode),this._stopCameraRefresh(),document.removeEventListener("visibilitychange",this._onVisibilityChange)}_onVisibilityChange=()=>{document.hidden?this._stopCameraTimer():(this._startCameraTimer(),this._refreshVisibleCameras())};_startCameraRefresh(){this._cameraObserver=new IntersectionObserver(e=>{for(const t of e){const e=t.target.dataset.entity;e&&(t.isIntersecting?this._visibleCameras.add(e):this._visibleCameras.delete(e))}},{rootMargin:"50px"}),this._startCameraTimer()}_startCameraTimer(){this._cameraRefreshInterval||(this._cameraRefreshInterval=setInterval(()=>{this._refreshVisibleCameras()},1e4))}_stopCameraTimer(){this._cameraRefreshInterval&&(clearInterval(this._cameraRefreshInterval),this._cameraRefreshInterval=null)}_stopCameraRefresh(){this._stopCameraTimer(),this._cameraObserver&&(this._cameraObserver.disconnect(),this._cameraObserver=null),this._visibleCameras.clear(),this._loadingCameras.clear()}_refreshVisibleCameras(){if(document.hidden||!this._hass)return;const e=Date.now();for(const t of this._visibleCameras){if(this._loadingCameras.has(t))continue;const a=this._hass.states[t];if(!a||"unavailable"===a.state||"unknown"===a.state)continue;const r=a.attributes?.entity_picture;if(!r)continue;const i=this.shadowRoot?.querySelector(`img[data-entity="${CSS.escape(t)}"]`);if(!i)continue;const s=r.includes("?")?"&":"?",n=`${r}${s}_cb=${e}`;this._loadingCameras.add(t),i.addEventListener("load",()=>this._loadingCameras.delete(t),{once:!0}),i.addEventListener("error",()=>this._loadingCameras.delete(t),{once:!0}),i.src=n}}updated(e){if(super.updated(e),this._cameraObserver){const e=this.shadowRoot?.querySelectorAll("img[data-entity]")||[],t=new Set;for(const a of e)t.add(a.dataset.entity),this._cameraObserver.observe(a);for(const e of this._visibleCameras)t.has(e)||(this._visibleCameras.delete(e),this._loadingCameras.delete(e))}}setConfig(e){try{this._config=e,n.g0.debug(me,"setConfig:",e)}catch(e){throw n.g0.error(me,"setConfig FAILED — this causes CONFIGURATION ERROR:",e),e}}set hass(e){const t=this._hass;this._hass=e,t||n.g0.debug(me,"First hass received — areas:",Object.keys(e.areas||{}).length,"entities:",Object.keys(e.entities||{}).length),!t||t.entities===e.entities&&t.devices===e.devices||(n.g0.debug(me,"Entity/device registry changed — busting cache"),this._entityCache.clear()),t&&t.areas!==e.areas&&this.selectedArea&&(e.areas?.[this.selectedArea]||(this.selectedArea=null,this._entityCache.clear())),this.data||this._configLoading||this._loadConfiguration()}async _loadConfiguration(){if(this._hass){this._configLoading=!0,n.g0.debug(me,"Loading configuration via WS...");try{const e=await this._hass.callWS({type:"lcars_dashboard/configuration/get"});this.data=e,void 0!==e.debug&&(window.__LCARS_DEBUG=e.debug,e.debug&&n.g0.info(me,"Debug logging auto-enabled from HA backend")),n.g0.debug(me,"Configuration loaded:",Object.keys(e),"version:",e.installed_version)}catch(e){n.g0.error(me,"Failed to load configuration — WS call failed:",e),this.data={}}finally{this._configLoading=!1}}}_handleEntityClick(e){n.g0.debug(me,"Entity click:",e),g.e.playForEntity(e),(0,n.Hv)(e)}_handleEditEntity(e,t){if(e.stopPropagation(),e.preventDefault(),!this._hass)return;const a=this._getEntityState(t),r=a?.attributes?.friendly_name||t;(0,n.Bo)(this._hass,"lcars-edit-entity-card",{entity:t,icon:a?.attributes?.icon||"",name:r},`Edit: ${r}`)}_handleEditDevice(e,t){if(e.stopPropagation(),e.preventDefault(),!this._hass)return;const a=this._hass.devices?.[t],r=a?.name_by_user||a?.name||t;(0,n.Bo)(this._hass,"lcars-edit-device-button-card",{device:t,name:r,icon:""},`Edit: ${r}`)}_handlePanelReorder(e,t,a,r){if(e.stopPropagation(),e.preventDefault(),!this._hass||!t)return;const i=this.data?.panel_column_overrides?.[t]||{};(0,n.Bo)(this._hass,"lcars-edit-panel-order-card",{area_id:t,panel_id:a,panels:r.map(e=>({panelId:e.panelId,panelType:e.panelType,label:e.label,deviceId:e.deviceId})),column_overrides:i},`Panel Layout: ${(t||"").replace(/_/g," ").toUpperCase()}`)}_handleToggle(e){const t=e.split(".")[0];if(n.g0.debug(me,"Toggle:",e,"domain:",t),g.e.playForEntity(e),"lock"===t){const t=this._getEntityState(e);this._hass.callService("lock","locked"===t?.state?"unlock":"lock",{entity_id:e})}else"script"===t?this._hass.callService("script","turn_on",{entity_id:e}):this._hass.callService("homeassistant","toggle",{entity_id:e})}_getAreaEntities(e){return(0,v.d6)(this._hass,e,this._entityCache)}_getFloorAreaIds(e){return(0,f.jE)(this._hass,e)}_getDeviceCategoryEntities(e){if(!this._hass||!e)return{config:[],diagnostic:[]};const t=Object.values(this._hass.entities||{}),a=[],r=[];for(const i of t)i.device_id===e&&(i.disabled_by||"user"===i.hidden_by||i.hidden||("config"===i.entity_category?a.push(i):"diagnostic"===i.entity_category&&r.push(i)));return{config:a,diagnostic:r}}_groupEntities(e){return(0,v.bc)(this._hass,e)}_groupByDomain(e){const t=new Map;return e.forEach(e=>{t.has(e.domain)||t.set(e.domain,[]),t.get(e.domain).push(e)}),[...t.entries()].sort((e,t)=>(o.sg[e[0]]??50)-(o.sg[t[0]]??50))}_getEntityState(e){return this._hass&&this._hass.states[e]?this._hass.states[e]:null}_getEntityIcon(e){return e?e.attributes?.icon?e.attributes.icon:{light:"mdi:lightbulb",switch:"mdi:toggle-switch",sensor:"mdi:eye",binary_sensor:"mdi:radiobox-blank",climate:"mdi:thermostat",cover:"mdi:window-shutter",fan:"mdi:fan",lock:"mdi:lock",camera:"mdi:video",media_player:"mdi:cast",automation:"mdi:robot",script:"mdi:script-text",update:"mdi:package-up"}[e.entity_id.split(".")[0]]||"mdi:information-outline":"mdi:help-circle-outline"}_withEditPip(e,t){return this._editMode?r.qy`
        <div class="edit-pip-wrap">
          ${t}
          <div class="edit-pip" tabindex="0" role="button" aria-label="Edit entity"
            @click=${t=>this._handleEditEntity(t,e)}
            @keydown=${t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._handleEditEntity(t,e))}}></div>
        </div>
      `:t}_shortenName(e,t){if(!e)return e;const a=[],r=this._hass?.areas?.[this.selectedArea];if(r?.name&&a.push(r.name),t?.device_id){const e=this._hass?.devices?.[t.device_id],r=e?.name_by_user||e?.name;r&&a.push(r)}a.sort((e,t)=>t.length-e.length);let i=e,s=!0;for(;s;){s=!1;for(const e of a)i.toLowerCase().startsWith(e.toLowerCase())&&(i=i.slice(e.length).trim().replace(/^[-–:]\s*/,""),s=!0)}return i||e}_friendlyName(e,t){const a=e?.attributes?.friendly_name||t.entity_id.split(".").pop().replace(/_/g," ");return this._shortenName(a,t)}_shortDeviceName(e){const t=e?.name_by_user||e?.name||"";if(!t)return"Device";const a=this._hass?.areas?.[this.selectedArea];return a?.name&&t.toLowerCase().startsWith(a.name.toLowerCase())&&t.slice(a.name.length).trim().replace(/^[-–:]\s*/,"")||t}_isOff(e){return["off","unavailable","unknown","idle","standby","locked"].includes(e?.state)}_formatCamTimeSince(e){if(!e)return"";const t=Date.now()-new Date(e).getTime();if(t<0||isNaN(t))return"";const a=Math.floor(t/6e4);if(a<5)return"";const r=Math.floor(a/60),i=Math.floor(r/24);return i>0?`LAST SIGNAL: ${i}D ${r%24}H AGO`:r>0?`LAST SIGNAL: ${r}H ${a%60}M AGO`:`LAST SIGNAL: ${a}M AGO`}_renderSensorBar(e){const t=parseFloat(e.state);if(isNaN(t))return"";const a=e.attributes?.device_class||"";let i=0,s=100;if("temperature"===a)i=10,s=40;else if("humidity"===a)i=0,s=100;else if("battery"===a)i=0,s=100;else if("illuminance"===a)i=0,s=1e3;else if("power"===a)i=0,s=3e3;else{if(null==e.attributes?.min)return"";i=e.attributes.min,s=e.attributes.max}if(i===s)return"";const n=Math.max(0,Math.min(100,(t-i)/(s-i)*100)),o=Math.round(n/100*10);return r.qy`
        <div class="sensor-bar" title="${Math.round(n)}%">
          ${Array.from({length:10},(e,t)=>r.qy`
            <div class="sensor-seg ${t<o?"filled":""}"
                 style="--seg-i:${t}"></div>
          `)}
        </div>
      `}static get styles(){return[s.Bx,h.PF,h.yW,r.AH`
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
            display: flex;
            align-items: baseline;
            gap: 0.75rem;
          }
          .content-area-header::after {
            content: '';
            display: block;
            height: 2px;
            background: var(--lcars-data-accent);
            margin-top: 0.5rem;
          }
          .room-alarm-badge {
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            letter-spacing: 0.08em;
            cursor: pointer;
            margin-left: auto;
            white-space: nowrap;
            transition: opacity 200ms;
            text-decoration: none;
          }
          .room-alarm-badge:hover { opacity: 0.8; }
          .room-alarm-badge:focus-visible {
            outline: 2px solid var(--lcars-ice);
            outline-offset: 2px;
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
            opacity: 0;
            visibility: hidden;
            transition: opacity 300ms ease-out, visibility 300ms ease-out;
          }
          /* WES-012: Delay showing connecting overlay to avoid flash */
          .camera-frame[data-state="connecting"] .camera-connecting-overlay {
            opacity: 1;
            visibility: visible;
            transition: opacity 300ms ease-out 500ms, visibility 300ms ease-out 500ms;
          }
          .camera-frame[data-state="connecting"] .camera-offline-overlay,
          .camera-frame[data-state="offline"] .camera-connecting-overlay {
            opacity: 0;
            visibility: hidden;
          }
          .camera-frame[data-state="offline"] .camera-offline-overlay {
            opacity: 1;
            visibility: visible;
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
            color: var(--lcars-gray);
          }
          .camera-offline-text {
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            color: var(--lcars-gray);
            text-transform: uppercase;
            letter-spacing: 0.1em;
            animation: cam-text-breathe 4s ease-in-out infinite;
          }
          .camera-last-signal {
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data, 0.875rem);
            color: var(--lcars-gray);
            text-transform: uppercase;
            margin-top: 0.25rem;
          }
          @keyframes cam-text-breathe {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
          }

          /* State-driven visibility for live state */
          .camera-frame[data-state="live"] .camera-connecting-overlay,
          .camera-frame[data-state="live"] .camera-offline-overlay {
            opacity: 0;
            visibility: hidden;
            transition: opacity 300ms ease-out, visibility 300ms ease-out;
          }
          .camera-frame[data-state="offline"] {
            border-color: var(--lcars-gray);
            opacity: 1;
          }
          /* P3 WESLEY-IDEA-002: CRT static effect for offline cameras */
          .camera-frame[data-state="offline"] .camera-offline-overlay {
            background:
              repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px),
              repeating-linear-gradient(90deg, rgba(120,120,120,0.02) 0px, rgba(80,80,80,0.04) 1px, transparent 2px, transparent 3px),
              linear-gradient(180deg, rgba(40,40,40,1) 0%, rgba(25,25,25,1) 100%);
            will-change: background-position;
            animation: cam-static-drift 8s linear infinite;
          }
          @keyframes cam-static-drift {
            from { background-position: 0 0, 0 0, 0 0; }
            to   { background-position: 0 0, 0 -100px, 0 0; }
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
          /* 4X-7: zone sibling telemetry pips */
          .zone-siblings { flex-shrink: 0; display: flex; gap: 0.375rem; margin: 0 0.25rem; }
          .zone-sibling-pip { font-size: 0.625rem; color: var(--lcars-sky, #aaaaff); white-space: nowrap; }

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

          /* 4X-8: Panel reorder affordance */
          .panel-order-wrapper { position: relative; }
          .panel-order-pip {
            position: absolute; top: 0.25rem; right: 0.25rem;
            width: 24px; height: 24px; border-radius: 50%;
            background: var(--lcars-lilac); color: var(--lcars-black);
            cursor: pointer; z-index: 5;
            display: flex; align-items: center; justify-content: center;
            border: 1px solid rgba(0,0,0,0.3);
            animation: edit-pip-pulse 2s ease-in-out infinite;
            transition: transform var(--lcars-transition);
          }
          .panel-order-pip:hover { transform: scale(1.2); background: var(--lcars-gold); }
          .panel-order-pip:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }

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
            grid-template-columns: repeat(3, minmax(3.5rem, 4.5rem));
            gap: 0.5rem;
            justify-content: center;
          }
          .alarm-digit-btn {
            height: 4rem;
            min-width: 3.5rem;
            border: none;
            border-radius: var(--lcars-btn-radius);
            background: var(--lcars-sunflower);
            color: var(--lcars-black);
            font-family: var(--lcars-font);
            font-size: 1.375rem;
            cursor: pointer;
            transition: background 200ms;
            -webkit-tap-highlight-color: transparent;
          }
          .alarm-digit-btn:hover { filter: brightness(1.1); }
          .alarm-digit-btn:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
          .alarm-digit-btn:disabled {
            opacity: 0.4;
            cursor: not-allowed;
            pointer-events: none;
          }
          .alarm-action-btn { background: var(--lcars-disabled); }
          .alarm-lockout-msg {
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            color: var(--lcars-tomato);
            text-transform: uppercase;
            text-align: center;
            letter-spacing: 0.08em;
            padding: 0.25rem 0;
            animation: lockout-pulse 2s ease-in-out infinite;
          }
          .alarm-lockout-countdown {
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            color: var(--lcars-tomato);
            text-transform: uppercase;
            text-align: center;
            letter-spacing: 0.08em;
            opacity: 0.7;
          }
          @keyframes lockout-pulse {
            0%, 100% { opacity: 1; }
            50%      { opacity: 0.5; }
          }

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
            /* P3: Camera offline animations */
            .camera-offline-text { animation: none; }
            .camera-frame[data-state="offline"] .camera-offline-overlay { animation: none; }
          }
        `]}_renderFloorView(e){const t=this._hass.floors?.[e];if(!t)return n.g0.debug(me,"Render: floor not found:",e),r.qy`<div class="lcars-empty">Floor not found</div>`;const a=this._getFloorAreaIds(e);return 0===a.length?r.qy`
          <div class="content-area-panel">
            <h2 class="content-area-header">${t.name}</h2>
            <div class="lcars-empty">No areas on this floor</div>
          </div>
        `:(n.g0.debug(me,"Render: floor=%s areas=%d",t.name,a.length),r.qy`
        <div class="content-floor-panel">
          <h2 class="content-floor-header">${t.name}</h2>
          ${a.map(e=>{const t=this._hass.areas?.[e];if(!t)return"";const a=this._getAreaEntities(e);if(0===a.length)return"";const i=this._getAlarmBadgeForArea(e,a);return r.qy`
              <div class="content-area-panel floor-area-section">
                <h3 class="content-area-header floor-area-subheader">
                  ${t.name}
                  ${i?r.qy`
                    <a class="room-alarm-badge"
                       style="color:${(0,l.of)(i.state?.state||"unavailable")}"
                       tabindex="0"
                       role="link"
                       aria-label="Alarm: ${(i.state?.state||"").replace(/_/g," ")}. Tap to view."
                       @click=${()=>this._navigateToAlarmArea(i)}
                       @keydown=${e=>"Enter"===e.key&&(e.preventDefault(),this._navigateToAlarmArea(i))}>
                      ◆ ${(i.state?.state||"").toUpperCase().replace(/_/g," ")}
                    </a>
                  `:""}
                </h3>
                ${this._renderAreaContent(a,e)}
              </div>
            `})}
        </div>
      `)}render(){if(!this._hass)return n.g0.debug(me,"Render: waiting for hass"),r.qy`<div class="lcars-empty">Initializing...</div>`;if(this._renderedAlarmDeviceIds.clear(),this.selectedFloor)return this._renderFloorView(this.selectedFloor);if(!this.selectedArea)return n.g0.debug(me,"Render: no area selected"),r.qy`<div class="lcars-empty">Select an area</div>`;const e=this._hass.areas?.[this.selectedArea];if(!e)return n.g0.debug(me,"Render: area not found:",this.selectedArea),r.qy`<div class="lcars-empty">Area not found</div>`;const t=this._getAreaEntities(this.selectedArea);return n.g0.debug(me,"Render: area=%s entities=%d",e.name,t.length),r.qy`
        <div class="content-area-panel">
          <h2 class="content-area-header">${e.name}</h2>
          ${this._renderAreaContent(t,this.selectedArea)}
        </div>
      `}_getDevicePanelType(e){return(0,o.v3)(e)}_partitionDeviceEntities(e){const t=[],a=[],r=[];for(const i of e)o.aE.has(i.domain)?t.push(i):o.Xt.has(i.domain)?a.push(i):r.push(i);return{cameras:t,sensors:a,controls:r}}_generatePanelCode(e){let t=5381;for(let a=0;a<e.length;a++)t=(t<<5)+t+e.charCodeAt(a)|0;const a=String(Math.abs(t)%1e6).padStart(6,"0");return`${a.slice(0,3)}-${a.slice(3)}`}_renderDevicePanel(e,t){if(e===o.X8)return this._renderIrrigationPanel(t);const a=he.get(e);return a?a(t,this._hass,this._editMode,this._config):""}_getSensorIndicatorColor(e,t=""){return"carbon_dioxide"===(e?.attributes?.device_class||"")?(0,l.kR)(e?.state):(0,l.xH)(e?.entity_id||"",e,t)}_fmtSensor(e,t){return(0,c.kp)(e,t?.entity_category||"")}_renderCameraPanel(e){const{cameras:t,sensors:a,controls:i}=this._partitionDeviceEntities(e.entities),s=this._shortDeviceName(e.device);return r.qy`
        <div class="lcars-device-panel" data-panel-type="camera">
          <div class="device-panel-header">
            <span class="device-panel-name">${s}</span>
            <div class="device-panel-header-line"></div>
            <span class="panel-numeric-code" aria-hidden="true">${this._generatePanelCode(t[0]?.entity?.entity_id||s)}</span>
          </div>

          <div class="device-panel-sensors" role="list" aria-label="${s} sensors">
            ${a.map(({entity:e,state:t})=>{const a=this._friendlyName(t,e),{text:i}=this._fmtSensor(t,e),s=this._getSensorIndicatorColor(t,e?.entity_category);return r.qy`
                <div class="device-sensor-line" tabindex="0" role="listitem"
                  aria-label="${a}: ${i}"
                  @click=${()=>this._handleEntityClick(e.entity_id)}
                  @keydown=${t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._handleEntityClick(e.entity_id))}}>
                  <div class="sensor-indicator" style="background:${s}"></div>
                  <span class="sensor-label">${a}</span>
                  <span class="sensor-state-value" style="color:${s}">${i}</span>
                </div>
              `})}
          </div>

          <div class="device-panel-media"
            ?data-offline=${t.length>0&&this._isOff(t[0].state)}>
            ${t.map(({entity:e,state:t},a)=>{const i=fe(t),n=0===a?s:this._friendlyName(t,e),o=this._isOff(t)||!i?"offline":"connecting";return r.qy`
                <div class="camera-frame" data-state="${o}"
                  style="${a>0?"margin-top:var(--lcars-gap);border-top:2px solid var(--panel-frame-color)":""}"
                  aria-busy="${"connecting"===o}"
                  @click=${()=>this._handleEntityClick(e.entity_id)}>
                  <div class="camera-connecting-overlay" aria-hidden="true">
                    <span class="camera-connecting-text">ESTABLISHING LINK</span>
                  </div>
                  <div class="camera-offline-overlay" aria-hidden="true">
                    <ha-icon icon="mdi:video-off"></ha-icon>
                    <span class="camera-offline-text">VIEWSCREEN OFFLINE</span>
                  </div>
                  ${i?r.qy`<img src="${i}" alt="${n} camera feed"
                                data-entity="${e.entity_id}"
                                .src=${i}
                                @load=${e=>{const t=e.target.closest(".camera-frame");t&&(t.setAttribute("data-state","live"),t.removeAttribute("aria-busy"))}}
                                @error=${e=>{const t=e.target.closest(".camera-frame");t&&(t.setAttribute("data-state","offline"),t.removeAttribute("aria-busy"))}} />`:r.qy`<div class="camera-spacer"></div>`}
                </div>`})}
          </div>

          <div class="device-panel-controls" aria-label="${s} controls">
            ${i.map(({entity:e,state:t})=>{const a=this._friendlyName(t,e),i="on"===t.state,s=this._isOff(t),n=e.entity_id.split(".")[0];return r.qy`
                <button class="device-control-btn" ?data-on=${i} ?data-off=${s}
                  @click=${()=>o.Zz.has(n)?this._handleToggle(e.entity_id):this._handleEntityClick(e.entity_id)}
                  title="${a}: ${t.state}">
                  <ha-icon .icon=${this._getEntityIcon(t)}></ha-icon>
                  <span>${a}</span>
                </button>
              `})}
          </div>
          <div class="panel-pip-strip" aria-hidden="true"></div>
        </div>
      `}_classifyPowerEntity(e){const t=(e||"").toLowerCase();return/total\s*in\s*power/.test(t)?{side:"in",type:"total"}:/total\s*out\s*power/.test(t)?{side:"out",type:"total"}:/solar.*in.*power/.test(t)?{side:"in",type:"solar"}:/ac.*in.*power/.test(t)?{side:"in",type:"ac"}:/ac.*out.*power/.test(t)?{side:"out",type:"ac"}:/dc.*out.*power/.test(t)?{side:"out",type:"dc"}:/usb.*out.*power/.test(t)?{side:"out",type:"usb"}:/type.*c.*out.*power/.test(t)?{side:"out",type:"usbc"}:/power.*i.*o.*input.*power/.test(t)?{side:"in",type:"pio"}:/power.*i.*o.*output.*power/.test(t)?{side:"out",type:"pio"}:/anderson.*out.*power/.test(t)?{side:"out",type:"dc"}:/alternator.*in.*power/.test(t)?{side:"in",type:"alt"}:/station.*power/.test(t)?{side:"out",type:"station"}:/\bin\b/.test(t)?{side:"in",type:"other"}:/\bout\b/.test(t)?{side:"out",type:"other"}:null}_partitionBatteryEntities(e,t){const a=[],r=[],i=[],s=[],n=[],o=[],l=[];for(const t of e){const e=t.state?.attributes||{},o=e.device_class||"",l=e.unit_of_measurement||"",c=t.domain,d=e.friendly_name||t.entity.entity_id;if(["switch","number","button","select"].includes(c))n.push(t);else if("battery"!==o||"%"!==l){if("power"===o&&"W"===l){const e=this._classifyPowerEntity(d);e?"in"===e.side?r.push({...t,ioType:e.type}):i.push({...t,ioType:e.type}):s.push(t);continue}s.push(t)}else a.push(t)}if(t){for(const e of t.config){const t=this._getEntityState(e.entity_id);if(!t)continue;const a=e.entity_id.split(".")[0];o.push({entity:e,domain:a,state:t})}for(const e of t.diagnostic){const t=this._getEntityState(e.entity_id);if(!t)continue;const a=e.entity_id.split(".")[0];l.push({entity:e,domain:a,state:t})}}return{soc:a,powerIn:r,powerOut:i,telemetry:s,controls:n,configControls:o,diagnostics:l}}_partitionEnvironmentEntities(e,t){const a=[],r=[],i=[],s=[],n=[],l=[];for(const t of e){const e=t.state?.attributes?.device_class||"",l=t.domain;["fan","switch","button","number","select","light"].includes(l)?n.push(t):"sensor"!==l||!/filter|wick/i.test(t.entity?.entity_id||"")||"battery"!==e&&""!==e&&e?o.lo.has(e)?r.push(t):e||"sensor"!==l||!o.Rv.test(t.entity.entity_id)?i.push(t):a.push(t):s.push(t)}if(t)for(const e of[...t.diagnostic,...t.config]){const t=this._getEntityState(e.entity_id);t&&l.push({entity:e,domain:e.entity_id.split(".")[0],state:t})}return{score:a,airQuality:r,telemetry:i,filterLife:s,controls:n,diagnostics:l}}_getScrubberHue(e){return null==e||e<=50?120:e<=100?120-(e-50)/50*70:e<=150?50-(e-100)/50*35:Math.max(0,15-(e-150)/100*15)}_getAQColor(e){return null==e||e<=50?"var(--lcars-ice)":e<=100?"var(--lcars-sunflower)":e<=150?"var(--lcars-butterscotch)":e<=200?"var(--lcars-peach)":"var(--lcars-tomato)"}_getScrubberSpeed(e){return null==e||0===e?20:2+18*Math.pow(1-e/100,1.5)}_envHistoryCache=new Map;async _getSparklineData(e,t){return(0,p.s)(this._hass,e,t,this._envHistoryCache)}_renderSparkline(e,t,a){return(0,p.K)(e,{color:t,label:a,className:"env-sparkline"})}_renderEnvironmentPanel(e){const t=this._getDeviceCategoryEntities(e.device.id),{score:a,airQuality:i,telemetry:s,filterLife:n,controls:o,diagnostics:l}=this._partitionEnvironmentEntities(e.entities,t),d=this._shortDeviceName(e.device)||"Environment",p=a[0],u=p?parseFloat(p.state.state):null,m=i.find(e=>"pm25"===(e.state?.attributes?.device_class||"")),h=m?parseFloat(m.state.state):null,f=null!=u&&Number.isFinite(u)?u:null!=h&&Number.isFinite(h)?Math.min(300,4*h):null,v=this._getScrubberHue(f),g=this._getAQColor(f),b=o.find(e=>"fan"===e.domain),y=b?.state,_=y?.attributes?.percentage??null,w=y?.attributes?.preset_modes||[],x=y?.attributes?.preset_mode||"",$=!b||"off"===y?.state||0===_,k=this._getScrubberSpeed($?0:_),S=!b,C=o.filter(e=>"fan"!==e.domain),E=[...a,...i].map(e=>e.entity.entity_id);E.length>0&&this._getSparklineData(e.device.id,E).then(e=>{e&&this.requestUpdate()});const z=this._envHistoryCache.get(e.device.id)?.data||{};return r.qy`
        <div class="lcars-device-panel env-panel ${S?"sensor-only":""}" data-panel-type="environment">
          <!-- Header -->
          <div class="env-header">
            <span class="device-panel-name">${d}</span>
            <div class="device-panel-header-line"></div>
            ${p?r.qy`
              <span class="env-score-label" style="color:${g}">
                ${null!=u&&Number.isFinite(u)?Math.round(u):"—"}
              </span>
            `:""}
            <span class="panel-numeric-code" aria-hidden="true">${this._generatePanelCode(e.device.id)}</span>
          </div>

          <!-- Sensors (left) -->
          <div class="env-sensors" role="list" aria-label="${d} sensors">
            ${i.map(({entity:e,state:t})=>{const a=this._friendlyName(t,e),{text:i}=this._fmtSensor(t,e),s=this._getSensorIndicatorColor(t,e?.entity_category);return r.qy`
                <div class="device-sensor-line" tabindex="0" role="listitem"
                  aria-label="${a}: ${i}"
                  @click=${()=>this._handleEntityClick(e.entity_id)}
                  @keydown=${t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._handleEntityClick(e.entity_id))}}>
                  <div class="sensor-indicator" style="background:${s}"></div>
                  <span class="sensor-label">${a}</span>
                  <span class="sensor-state-value" style="color:${s}">${i}</span>
                </div>
              `})}
            ${s.map(({entity:e,state:t})=>{const a=this._friendlyName(t,e),{text:i}=this._fmtSensor(t,e),s=this._getSensorIndicatorColor(t,e?.entity_category);return r.qy`
                <div class="device-sensor-line" tabindex="0" role="listitem"
                  aria-label="${a}: ${i}"
                  @click=${()=>this._handleEntityClick(e.entity_id)}
                  @keydown=${t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._handleEntityClick(e.entity_id))}}>
                  <div class="sensor-indicator" style="background:${s}"></div>
                  <span class="sensor-label">${a}</span>
                  <span class="sensor-state-value" style="color:${s}">${i}</span>
                </div>
              `})}
            ${n.map(({entity:e,state:t})=>{const a=this._friendlyName(t,e),i=Math.min(100,Math.max(0,parseFloat(t.state)||0)),s=Math.round(i/10);return r.qy`
                <div class="filter-life-row">
                  <span class="filter-life-label">${a}</span>
                  <span class="filter-life-pct">${Math.round(i)}%</span>
                </div>
                <div class="filter-segments" aria-label="Filter life: ${Math.round(i)}%">
                  ${Array.from({length:10},(e,t)=>{const a=t<s?i<25?"lit critical":i<75?"lit warn":"lit":"";return r.qy`<div class="filter-seg ${a}"></div>`})}
                </div>
              `})}
            ${l.length>0?r.qy`
              <div class="battery-section-divider"></div>
              <div class="battery-section-label">DIAGNOSTICS</div>
              ${l.map(({entity:e,state:t})=>{const a=this._friendlyName(t,e),{text:i}=this._fmtSensor(t,e),s=this._getSensorIndicatorColor(t,"diagnostic");return r.qy`
                  <div class="device-sensor-line" tabindex="0" role="listitem"
                    @click=${()=>this._handleEntityClick(e.entity_id)}
                    @keydown=${t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._handleEntityClick(e.entity_id))}}>
                    <div class="sensor-indicator" style="background:${s}"></div>
                    <span class="sensor-label">${a}</span>
                    <span class="sensor-state-value" style="color:${s}">${i}</span>
                  </div>
                `})}
            `:""}
          </div>

          <!-- Atmoscrubber Cylinder (center) -->
          <div class="atmoscrubber-container" role="meter"
            aria-valuenow="${null!=f?Math.round(f):""}"
            aria-valuemin="0" aria-valuemax="300"
            aria-label="Air quality: ${null!=f?Math.round(f):"unknown"}">
            <div class="atmoscrubber ${$?"scrubber-idle":""}"
              style="--scrubber-hue:${Math.round(v)};--scrubber-speed:${k.toFixed(1)}s;--atmos-quality-color:${g}">
              ${p?r.qy`
                <div class="scrubber-score">${null!=u&&Number.isFinite(u)?Math.round(u):"—"}</div>
              `:m?r.qy`
                <div class="scrubber-score">${null!=h&&Number.isFinite(h)?Math.round(h):"—"}</div>
              `:""}
              ${$?"":r.qy`${Array.from({length:6},(e,t)=>r.qy`
                <div class="lcars-atmos-particle" aria-hidden="true"
                  style="--particle-speed:${3+.8*t}s;--particle-delay:${.6*t}s;--particle-drift:${3+t%3*2}px;--particle-size:${2+t%3}px;--particle-opacity:${.3+t%2*.2};left:${10+14*t}%"></div>
              `)}`}
            </div>
          </div>

          <!-- Controls (right) — only for purifiers -->
          ${S?"":r.qy`
            <div class="env-controls" aria-label="${d} controls">
              ${b?r.qy`
                <button class="device-control-btn"
                  ?data-on=${"on"===y?.state}
                  ?data-off=${this._isOff(y)}
                  @click=${()=>this._handleToggle(b.entity.entity_id)}
                  title="Fan: ${y?.state}">
                  <ha-icon .icon=${"mdi:fan"}></ha-icon>
                  <span>${"on"===y?.state?`${_||""}%`:"Off"}</span>
                </button>
                ${w.length>0?r.qy`
                  <div class="lcars-option-strip" role="radiogroup" aria-label="Preset mode">
                    <span class="lcars-option-strip-label">Mode</span>
                    <div class="lcars-option-strip-btns">
                      ${w.map(e=>r.qy`
                        <button class="lcars-option-btn"
                          role="radio"
                          aria-checked="${e===x}"
                          ?data-selected=${e===x}
                          @click=${()=>{(this._hass.states[b.entity.entity_id]?.attributes?.preset_modes||[]).includes(e)&&this._hass.callService("fan","set_preset_mode",{entity_id:b.entity.entity_id,preset_mode:e})}}>
                          ${e}
                        </button>
                      `)}
                    </div>
                  </div>
                `:""}
              `:""}
              ${C.map(({entity:e,state:t})=>{const a=this._friendlyName(t,e),i="on"===t.state,s=this._isOff(t);return r.qy`
                  <button class="device-control-btn" ?data-on=${i} ?data-off=${s}
                    @click=${()=>this._handleToggle(e.entity_id)}
                    title="${a}: ${t.state}">
                    <ha-icon .icon=${this._getEntityIcon(t)}></ha-icon>
                    <span>${a}</span>
                  </button>
                `})}
            </div>
          `}

          <!-- Sparklines (bottom) -->
          <div class="env-sparklines" aria-label="24-hour history">
            ${[...a,...i].map(({entity:e,state:t})=>{const a=t.attributes?.device_class||"",r=(0,c.Z2)(a,this._friendlyName(t,e),e.entity_id),i=z[e.entity_id],s="pm25"===a?"var(--lcars-peach)":"carbon_dioxide"===a?"var(--lcars-sunflower)":"volatile_organic_compounds_parts"===a||"volatile_organic_compounds"===a?"var(--lcars-african-violet)":"var(--lcars-ice)";return this._renderSparkline(i,s,r)})}
          </div>
          <div class="panel-pip-strip" aria-hidden="true"></div>
        </div>
      `}_getCoreColor(e){return e>=80?"var(--lcars-ice)":e>=60?"var(--lcars-sky)":e>=40?"var(--lcars-bluey)":e>=20?"var(--lcars-butterscotch)":e>=10?"var(--lcars-peach)":"var(--lcars-tomato)"}_getFlowSpeed(e){const t=Math.abs(parseFloat(e)||0);return 0===t?"flow-stopped":t>1e3?"flow-fast":t>100?"flow-medium":"flow-slow"}_renderBatteryPanel(e){const t=this._getDeviceCategoryEntities(e.device.id),{soc:a,powerIn:i,powerOut:s,telemetry:n,controls:l,configControls:d,diagnostics:p}=this._partitionBatteryEntities(e.entities,t),u=this._shortDeviceName(e.device)||"Battery",m=a[0],h=m&&parseFloat(m.state.state)||0,f=m&&"unavailable"!==m.state.state&&"unknown"!==m.state.state,v=f?this._getCoreColor(h):"var(--lcars-gray)",g=i.find(e=>"total"===e.ioType),b=s.find(e=>"total"===e.ioType),y=g&&parseFloat(g.state.state)||0,_=b&&parseFloat(b.state.state)||0,w=y>5,x=!(w||_>5),$=new Set;i.filter(e=>"total"!==e.ioType).forEach(e=>$.add(e.ioType)),s.filter(e=>"total"!==e.ioType).forEach(e=>$.add(e.ioType));const k=[...$].map(e=>({type:e,label:e.toUpperCase(),inEntry:i.find(t=>t.ioType===e),outEntry:s.find(t=>t.ioType===e)})),S=n.filter(e=>{const t=e.state?.attributes?.device_class||"",a=(e.state?.attributes?.friendly_name||"").toLowerCase();return"temperature"===t||"duration"===t||/state.*health|cycles|remain.*time|status|error.*code|battery.*count/.test(a)}).slice(0,8),C=p.filter(e=>{const t=e.state?.attributes?.device_class||"",a=(e.state?.attributes?.friendly_name||"").toLowerCase();return"temperature"===t||/cycles|status|error|battery.*count|charging.*state|power.*diff/.test(a)}).slice(0,8);return r.qy`
        <div class="lcars-device-panel battery-panel" data-panel-type="battery">
          <!-- Header -->
          <div class="battery-header">
            <span class="device-panel-name">${u}</span>
            <div class="device-panel-header-line"></div>
            <span class="battery-charge-label" style="color:${v}">
              ${f?`${Math.round(h)}%`:"N/A"}
            </span>
            <span class="panel-numeric-code" aria-hidden="true">${this._generatePanelCode(m?.entity?.entity_id||e.device.id)}</span>
          </div>

          <!-- Telemetry (left) -->
          <div class="battery-telemetry" role="list" aria-label="${u} telemetry">
            ${g?r.qy`
              <div class="battery-total-line" tabindex="0" role="button"
                @click=${()=>this._handleEntityClick(g.entity.entity_id)}
                @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._handleEntityClick(g.entity.entity_id))}}>
                <ha-icon icon="mdi:transmission-tower-import" style="--mdc-icon-size:14px;color:var(--lcars-ice)"></ha-icon>
                <span class="sensor-label">Total In</span>
                <span class="sensor-state-value" style="color:var(--lcars-ice)">${g.state.state} W</span>
              </div>
            `:""}
            ${b?r.qy`
              <div class="battery-total-line" tabindex="0" role="button"
                @click=${()=>this._handleEntityClick(b.entity.entity_id)}
                @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._handleEntityClick(b.entity.entity_id))}}>
                <ha-icon icon="mdi:transmission-tower-export" style="--mdc-icon-size:14px;color:var(--lcars-butterscotch)"></ha-icon>
                <span class="sensor-label">Total Out</span>
                <span class="sensor-state-value" style="color:var(--lcars-butterscotch)">${b.state.state} W</span>
              </div>
            `:""}
            ${S.map(({entity:e,state:t})=>{const a=this._friendlyName(t,e),{text:i}=this._fmtSensor(t,e),s=this._getSensorIndicatorColor(t,e?.entity_category);return r.qy`
                <div class="device-sensor-line" tabindex="0" role="listitem"
                  @click=${()=>this._handleEntityClick(e.entity_id)}
                  @keydown=${t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._handleEntityClick(e.entity_id))}}>
                  <div class="sensor-indicator" style="background:${s}"></div>
                  <span class="sensor-label">${a}</span>
                  <span class="sensor-state-value" style="color:${s}">${i}</span>
                </div>
              `})}
            ${C.length>0?r.qy`
              <div class="battery-section-divider"></div>
              <div class="battery-section-label">DIAGNOSTICS</div>
              ${C.map(({entity:e,state:t})=>{const a=this._friendlyName(t,e),{text:i}=this._fmtSensor(t,e),s=this._getSensorIndicatorColor(t,"diagnostic");return r.qy`
                  <div class="device-sensor-line" tabindex="0" role="listitem"
                    @click=${()=>this._handleEntityClick(e.entity_id)}
                    @keydown=${t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._handleEntityClick(e.entity_id))}}>
                    <div class="sensor-indicator" style="background:${s}"></div>
                    <span class="sensor-label">${a}</span>
                    <span class="sensor-state-value" style="color:${s}">${i}</span>
                  </div>
                `})}
            `:""}
          </div>

          <!-- Warp Core (center) -->
          <div class="warp-core-container" role="meter"
            aria-valuenow="${h}" aria-valuemin="0" aria-valuemax="100"
            aria-label="Battery charge level: ${Math.round(h)} percent">
            <div class="warp-core" style="--core-color:${v};--core-charge:${f?h:0}">
              <div class="warp-core-fill ${x?"core-idle":""} ${w?"core-charging":""}">
                <div class="warp-core-stream"></div>
              </div>
              <div class="warp-core-tick" style="bottom:25%"></div>
              <div class="warp-core-tick" style="bottom:50%"></div>
              <div class="warp-core-tick" style="bottom:75%"></div>
            </div>
          </div>

          <!-- Controls (right) -->
          <div class="battery-controls" aria-label="${u} controls">
            ${l.map(({entity:e,state:t})=>{const a=this._friendlyName(t,e),i=e.entity_id.split(".")[0];if("number"===i){const i=t.attributes?.min||0,s=t.attributes?.max||100,n=parseFloat(t.state)||0,o=t.attributes?.unit_of_measurement||"",l=s>i?(n-i)/(s-i)*100:0;return r.qy`
                  <div class="battery-slider-control">
                    <span class="battery-slider-label" id="slider-${e.entity_id}">${a}</span>
                    <div class="battery-slider-track"
                      tabindex="0" role="slider"
                      aria-labelledby="slider-${e.entity_id}"
                      aria-valuemin="${i}" aria-valuemax="${s}" aria-valuenow="${n}"
                      @click=${t=>{const a=t.currentTarget.getBoundingClientRect(),r=Math.max(0,Math.min(1,(t.clientX-a.left)/a.width)),n=Math.round(i+r*(s-i));this._hass.callService("number","set_value",{entity_id:e.entity_id,value:n})}}
                      @keydown=${t=>{let a=n;if("ArrowRight"===t.key||"ArrowUp"===t.key)a=Math.min(s,n+1);else if("ArrowLeft"===t.key||"ArrowDown"===t.key)a=Math.max(i,n-1);else if("Home"===t.key)a=i;else{if("End"!==t.key)return;a=s}t.preventDefault(),this._hass.callService("number","set_value",{entity_id:e.entity_id,value:a})}}>
                      <div class="battery-slider-fill" style="width:${l}%"></div>
                      <div class="battery-slider-thumb" style="left:${l}%"></div>
                    </div>
                    <span class="battery-slider-value">${(0,c.ZV)(String(n),t.attributes?.device_class||"")}${o?" "+o:""}</span>
                  </div>
                `}const s="on"===t.state,n=this._isOff(t);return r.qy`
                <button class="device-control-btn" ?data-on=${s} ?data-off=${n}
                  @click=${()=>o.Zz.has(i)?this._handleToggle(e.entity_id):this._handleEntityClick(e.entity_id)}
                  title="${a}: ${t.state}">
                  <ha-icon .icon=${this._getEntityIcon(t)}></ha-icon>
                  <span>${a}</span>
                </button>
              `})}
            ${d.length>0?r.qy`
              <div class="battery-section-divider"></div>
              <div class="battery-section-label">CONFIG</div>
              ${d.map(({entity:e,state:t})=>{const a=this._friendlyName(t,e),i=e.entity_id.split(".")[0];if("number"===i){const i=t.attributes?.min||0,s=t.attributes?.max||100,n=t.attributes?.step||1,o=parseFloat(t.state)||0,l=t.attributes?.unit_of_measurement||"",d=s>i?(o-i)/(s-i)*100:0;return r.qy`
                    <div class="battery-slider-control">
                      <span class="battery-slider-label" id="slider-${e.entity_id}">${a}</span>
                      <div class="battery-slider-track"
                        tabindex="0" role="slider"
                        aria-labelledby="slider-${e.entity_id}"
                        aria-valuemin="${i}" aria-valuemax="${s}" aria-valuenow="${o}"
                        @click=${t=>{const a=t.currentTarget.getBoundingClientRect(),r=Math.max(0,Math.min(1,(t.clientX-a.left)/a.width));let o=i+r*(s-i);o=Math.round(o/n)*n,o=Math.max(i,Math.min(s,o)),this._hass.callService("number","set_value",{entity_id:e.entity_id,value:o})}}
                        @keydown=${t=>{let a=o;if("ArrowRight"===t.key||"ArrowUp"===t.key)a=Math.min(s,o+n);else if("ArrowLeft"===t.key||"ArrowDown"===t.key)a=Math.max(i,o-n);else if("Home"===t.key)a=i;else{if("End"!==t.key)return;a=s}t.preventDefault(),this._hass.callService("number","set_value",{entity_id:e.entity_id,value:a})}}>
                        <div class="battery-slider-fill" style="width:${d}%"></div>
                        <div class="battery-slider-thumb" style="left:${d}%"></div>
                      </div>
                      <span class="battery-slider-value">${(0,c.ZV)(String(o),t.attributes?.device_class||"")}${l?" "+l:""}</span>
                    </div>
                  `}if("select"===i){const i=t.attributes?.options||[],s=t.state;return r.qy`
                    <div class="lcars-option-strip" role="radiogroup" aria-label="${a}">
                      <span class="lcars-option-strip-label">${a}</span>
                      <div class="lcars-option-strip-btns">
                        ${i.map(t=>r.qy`
                          <button class="lcars-option-btn"
                            role="radio"
                            aria-checked="${t===s}"
                            ?data-selected=${t===s}
                            @click=${()=>this._hass.callService("select","select_option",{entity_id:e.entity_id,option:t})}>
                            ${t}
                          </button>
                        `)}
                      </div>
                    </div>
                  `}const s="on"===t.state,n=this._isOff(t);return r.qy`
                  <button class="device-control-btn" ?data-on=${s} ?data-off=${n}
                    @click=${()=>o.Zz.has(i)?this._handleToggle(e.entity_id):this._handleEntityClick(e.entity_id)}
                    title="${a}: ${t.state}">
                    <ha-icon .icon=${this._getEntityIcon(t)}></ha-icon>
                    <span>${a}</span>
                  </button>
                `})}
            `:""}
          </div>

          <!-- Power I/O Flow (bottom) -->
          <div class="battery-io-flow" aria-label="Power flow">
            ${k.map(e=>{const t=e.inEntry&&parseFloat(e.inEntry.state.state)||0,a=e.outEntry&&parseFloat(e.outEntry.state.state)||0,i=this._getFlowSpeed(t),s=this._getFlowSpeed(a);return r.qy`
                <div class="io-pair-row">
                  <div class="io-port io-in" aria-label="${e.label} input: ${t} watts">
                    <span class="io-label">${e.label} IN</span>
                    <span class="io-watts" style="color:var(--lcars-ice)">${t>0?`${Math.round(t)}W`:"—"}</span>
                  </div>
                  <div class="io-conduit io-conduit-in ${i}"></div>
                  <div class="io-core-gap"></div>
                  <div class="io-conduit io-conduit-out ${s}"></div>
                  <div class="io-port io-out" aria-label="${e.label} output: ${a} watts">
                    <span class="io-label">${e.label} OUT</span>
                    <span class="io-watts" style="color:var(--lcars-butterscotch)">${a>0?`${Math.round(a)}W`:"—"}</span>
                  </div>
                </div>
              `})}
          </div>
          <div class="panel-pip-strip" aria-hidden="true"></div>
        </div>
      `}_climateSetpointDebouncer=null;_partitionClimateEntities(e,t){const a=[],r=[],i=[],s=[],n=new Set(["problem","heat","cold","connectivity","battery","tamper","smoke","safety"]);for(const t of e){const e=t.domain;if("climate"!==e){if("binary_sensor"===e){const e=t.state?.attributes?.device_class||"";if(n.has(e)){i.push(t);continue}}o.Xt.has(e),r.push(t)}else a.push(t)}if(t)for(const e of t.diagnostic||[]){const t=this._getEntityState(e.entity_id);t&&s.push({entity:e,domain:e.entity_id.split(".")[0],state:t})}return{climate:a,sensors:r,faults:i,diagnostics:s}}_isDualSetpoint(e){return"heat_cool"===e?.attributes?.hvac_mode||null!=e?.attributes?.target_temp_low&&null!=e?.attributes?.target_temp_high}_renderClimateArc(e,t,a,i,s){const n=100,o=120,l=80,c=i-a||1,d=Math.max(0,Math.min(1,(e-a)/c)),p=Math.PI,u=p-(p-0)*d,m=n+l*Math.cos(p),h=o-l*Math.sin(p),f=n+l*Math.cos(u),v=o-l*Math.sin(u),g=d>.5?1:0,b=p-(p-0)*Math.max(0,Math.min(1,(t-a)/c)),y=n+l*Math.cos(b),_=o-l*Math.sin(b);return r.qy`
        <svg class="climate-arc" viewBox="0 0 ${200} ${130}" role="meter"
          aria-valuemin="${a}" aria-valuemax="${i}" aria-valuenow="${e}"
          aria-label="Temperature: ${e}°, target ${t}°">
          <!-- Background arc -->
          <path d="M ${m},${h} A ${l},${l} 0 1,1 ${180},${o}"
            fill="none" stroke="var(--lcars-disabled)" stroke-width="8" stroke-linecap="round" />
          <!-- Progress arc -->
          ${d>0?r.qy`
            <path d="M ${m},${h} A ${l},${l} 0 ${g},1 ${f},${v}"
              fill="none" stroke="${s}" stroke-width="8" stroke-linecap="round" />
          `:""}
          <!-- Target tick -->
          <circle cx="${y}" cy="${_}" r="5" fill="${s}" stroke="var(--lcars-card-bg, var(--lcars-black, #000))" stroke-width="2" />
          <!-- Current temp text -->
          <text x="${n}" y="${100}" text-anchor="middle" fill="${s}"
            font-family="var(--lcars-font)" font-size="42" font-weight="bold">
            ${null!=e&&Number.isFinite(e)?Math.round(e):"—"}°
          </text>
        </svg>
      `}_handleClimateSetpoint(e,t,a,r,i){const s=(0,d.A_)(a,t);this._climateSetpointDebouncer||(this._climateSetpointDebouncer=(0,d.eU)((e,t)=>{this._hass.callService("climate","set_temperature",{entity_id:e,...t})},1500));const n=r?{["low"===i?"target_temp_low":"target_temp_high"]:s}:{temperature:s};this._climateSetpointDebouncer.call(e,n)}_handleClimateMode(e,t){this._hass.callService("climate","set_hvac_mode",{entity_id:e,hvac_mode:t})}_handleClimateFanMode(e,t){this._hass.callService("climate","set_fan_mode",{entity_id:e,fan_mode:t})}_handleClimatePreset(e,t){this._hass.callService("climate","set_preset_mode",{entity_id:e,preset_mode:t})}_renderClimatePanel(e){const t=this._getDeviceCategoryEntities(e.device.id),{climate:a,sensors:i,faults:s,diagnostics:n}=this._partitionClimateEntities(e.entities,t),o=this._shortDeviceName(e.device)||"Thermostat";if(0===a.length)return"";const c=a[0],d=c.state,p=d?.attributes||{},u=null!=p.current_temperature?Number(p.current_temperature):null,m=p.hvac_action||"off",h=(0,l.OX)(m),f=this._isDualSetpoint(d),v=f?null:null!=p.temperature?Number(p.temperature):null,g=f?Number(p.target_temp_low):null,b=f?Number(p.target_temp_high):null,y=null!=p.min_temp?Number(p.min_temp):45,_=null!=p.max_temp?Number(p.max_temp):95,w=p.hvac_modes||[],x=p.hvac_mode||"off",$=p.fan_modes||[],k=p.fan_mode||"",S=p.preset_modes||[],C=p.preset_mode||"",E=i.find(e=>"humidity"===(e.state?.attributes?.device_class||"")),z=p.target_temp_step||1;return r.qy`
        <div class="lcars-device-panel climate-panel" data-panel-type="climate"
          data-hvac-action="${m}"
          style="--panel-frame-color:${h}">
          <!-- Header -->
          <div class="climate-header">
            <span class="device-panel-name">${o}</span>
            <div class="device-panel-header-line"></div>
            <span class="climate-action-badge" style="color:${h}">
              ${m.toUpperCase()}
            </span>
            <span class="panel-numeric-code" aria-hidden="true">${this._generatePanelCode(c.entity.entity_id)}</span>
          </div>

          <!-- Sensors (left) -->
          <div class="climate-sensors" role="list" aria-label="${o} readings">
            ${null!=u?r.qy`
              <div class="device-sensor-line" role="listitem" aria-label="Current temperature: ${u}°">
                <div class="sensor-indicator" style="background:${h}"></div>
                <span class="sensor-label">Current</span>
                <span class="sensor-state-value" style="color:${h}">${Math.round(u)}°</span>
              </div>
            `:""}
            ${f?r.qy`
              <div class="device-sensor-line" role="listitem" aria-label="Heat target: ${g}°">
                <div class="sensor-indicator" style="background:var(--lcars-butterscotch)"></div>
                <span class="sensor-label">Heat To</span>
                <span class="sensor-state-value" style="color:var(--lcars-butterscotch)">${g}°</span>
              </div>
              <div class="device-sensor-line" role="listitem" aria-label="Cool target: ${b}°">
                <div class="sensor-indicator" style="background:var(--lcars-ice)"></div>
                <span class="sensor-label">Cool To</span>
                <span class="sensor-state-value" style="color:var(--lcars-ice)">${b}°</span>
              </div>
            `:null!=v?r.qy`
              <div class="device-sensor-line" role="listitem" aria-label="Target temperature: ${v}°">
                <div class="sensor-indicator" style="background:${h}"></div>
                <span class="sensor-label">Target</span>
                <span class="sensor-state-value" style="color:${h}">${v}°</span>
              </div>
            `:""}
            ${E?r.qy`
              <div class="device-sensor-line" role="listitem"
                aria-label="Humidity: ${E.state.state}%"
                @click=${()=>this._handleEntityClick(E.entity.entity_id)}>
                <div class="sensor-indicator" style="background:var(--lcars-ice)"></div>
                <span class="sensor-label">Humidity</span>
                <span class="sensor-state-value" style="color:var(--lcars-ice)">${E.state.state}%</span>
              </div>
            `:""}
            <div class="battery-section-divider"></div>
            <div class="device-sensor-line" role="listitem" aria-label="HVAC mode: ${x}">
              <div class="sensor-indicator" style="background:${h}"></div>
              <span class="sensor-label">Mode</span>
              <span class="sensor-state-value">${x}</span>
            </div>
            ${k?r.qy`
              <div class="device-sensor-line" role="listitem" aria-label="Fan mode: ${k}">
                <div class="sensor-indicator" style="background:var(--lcars-data-accent)"></div>
                <span class="sensor-label">Fan</span>
                <span class="sensor-state-value">${k}</span>
              </div>
            `:""}
            ${s.length>0?r.qy`
              <div class="battery-section-divider"></div>
              <div class="battery-section-label">FAULTS</div>
              ${s.map(({entity:e,state:t})=>{const a=this._friendlyName(t,e),i="on"===t.state?"var(--lcars-tomato)":"var(--lcars-gray)";return r.qy`
                  <div class="device-sensor-line" tabindex="0" role="listitem"
                    aria-label="${a}: ${t.state}"
                    @click=${()=>this._handleEntityClick(e.entity_id)}
                    @keydown=${t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._handleEntityClick(e.entity_id))}}>
                    <div class="sensor-indicator" style="background:${i}"></div>
                    <span class="sensor-label">${a}</span>
                    <span class="sensor-state-value" style="color:${i}">${t.state}</span>
                  </div>
                `})}
            `:""}
          </div>

          <!-- Viewscreen (right) -->
          <div class="climate-viewscreen" tabindex="0"
            @click=${()=>this._handleEntityClick(c.entity.entity_id)}
            @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._handleEntityClick(c.entity.entity_id))}}>
            ${this._renderClimateArc(u,f?(g+b)/2:v,y,_,h)}
            <!-- Setpoint controls -->
            <div class="climate-setpoint-controls">
              ${f?r.qy`
                <div class="climate-setpoint-row">
                  <button class="climate-sp-btn" aria-label="Decrease heat target"
                    @click=${e=>{e.stopPropagation(),this._handleClimateSetpoint(c.entity.entity_id,p,g-z,!0,"low")}}>−</button>
                  <span class="climate-sp-label" style="color:var(--lcars-butterscotch)">HEAT ${g}°</span>
                  <button class="climate-sp-btn" aria-label="Increase heat target"
                    @click=${e=>{e.stopPropagation(),this._handleClimateSetpoint(c.entity.entity_id,p,g+z,!0,"low")}}>+</button>
                </div>
                <div class="climate-setpoint-row">
                  <button class="climate-sp-btn" aria-label="Decrease cool target"
                    @click=${e=>{e.stopPropagation(),this._handleClimateSetpoint(c.entity.entity_id,p,b-z,!0,"high")}}>−</button>
                  <span class="climate-sp-label" style="color:var(--lcars-ice)">COOL ${b}°</span>
                  <button class="climate-sp-btn" aria-label="Increase cool target"
                    @click=${e=>{e.stopPropagation(),this._handleClimateSetpoint(c.entity.entity_id,p,b+z,!0,"high")}}>+</button>
                </div>
              `:null!=v?r.qy`
                <div class="climate-setpoint-row">
                  <button class="climate-sp-btn" aria-label="Decrease target temperature"
                    @click=${e=>{e.stopPropagation(),this._handleClimateSetpoint(c.entity.entity_id,p,v-z,!1)}}>−</button>
                  <span class="climate-sp-label" style="color:${h}">TARGET ${v}°</span>
                  <button class="climate-sp-btn" aria-label="Increase target temperature"
                    @click=${e=>{e.stopPropagation(),this._handleClimateSetpoint(c.entity.entity_id,p,v+z,!1)}}>+</button>
                </div>
              `:""}
            </div>
          </div>

          <!-- HVAC Mode Strip -->
          ${w.length>1?r.qy`
            <div class="climate-modes" role="radiogroup" aria-label="HVAC mode">
              ${w.map(e=>r.qy`
                <button class="climate-mode-btn" role="radio"
                  aria-checked="${e===x}"
                  ?data-active=${e===x}
                  @click=${()=>this._handleClimateMode(c.entity.entity_id,e)}>
                  ${e.toUpperCase().replace("_"," ")}
                </button>
              `)}
            </div>
          `:""}

          <!-- Fan Mode + Preset Strips -->
          <div class="climate-aux-controls">
            ${$.length>1?r.qy`
              <div class="climate-aux-strip" role="radiogroup" aria-label="Fan mode">
                ${$.map(e=>r.qy`
                  <button class="climate-mode-btn" role="radio"
                    aria-checked="${e===k}"
                    ?data-active=${e===k}
                    @click=${()=>this._handleClimateFanMode(c.entity.entity_id,e)}>
                    ${e.toUpperCase().replace("_"," ")}
                  </button>
                `)}
              </div>
            `:""}
            ${S.length>0?r.qy`
              <div class="climate-aux-strip" role="radiogroup" aria-label="Preset mode">
                ${S.map(e=>r.qy`
                  <button class="climate-mode-btn" role="radio"
                    aria-checked="${e===C}"
                    ?data-active=${e===C}
                    @click=${()=>this._handleClimatePreset(c.entity.entity_id,e)}>
                    ${e.toUpperCase().replace("_"," ")}
                  </button>
                `)}
              </div>
            `:""}
          </div>
          <div class="panel-pip-strip" aria-hidden="true"></div>
        </div>
      `}_alarmPinCode="";_alarmPinLimiter=(0,d.x)(3,6e4);_alarmCountdown=null;_alarmCountdownTimer=null;_alarmPinError=!1;_alarmLockoutSeconds=0;_alarmLockoutTimer=null;_alarmLockoutAnnounced=!1;_partitionAlarmEntities(e,t){const a=[],r=[],i=[],s=[],n=new Set(["door","window","motion","vibration","moisture","cold","smoke","safety","opening","garage_door","lock","tamper","problem"]);for(const t of e)if("alarm_control_panel"!==t.domain){if("binary_sensor"===t.domain){const e=t.state?.attributes?.device_class||"";if(n.has(e)){r.push(t);continue}}i.push(t)}else a.push(t);const o=new Set;for(const e of r)e.entity?.device_id&&o.add(e.entity.device_id);const l=new Map,c=[];for(const e of i){const t=e.entity?.device_id;t&&o.has(t)?(l.has(t)||l.set(t,[]),l.get(t).push(e)):c.push(e)}if(t)for(const e of t.diagnostic||[]){const t=this._getEntityState(e.entity_id);t&&s.push({entity:e,domain:e.entity_id.split(".")[0],state:t})}return{alarm:a,zones:r,auxiliary:c,diagnostics:s,zoneSiblings:l}}_handleAlarmPinDigit(e){this._alarmPinCode.length>=6||(this._alarmPinCode+=String(e).replace(/\D/g,"").charAt(0)||"",this._alarmPinError=!1,this.requestUpdate())}_handleAlarmPinClear(){this._alarmPinCode="",this._alarmPinError=!1,this.requestUpdate()}_handleAlarmArm(e,t){const a=this._alarmPinCode||void 0,r=`alarm_arm_${t}`;this._hass.callService("alarm_control_panel",r,{entity_id:e,...a?{code:a}:{}}),this._alarmPinCode="",this.requestUpdate()}_handleAlarmDisarm(e){if(!this._alarmPinLimiter.allow())return this._alarmPinError=!0,this._startAlarmLockout(),void this.requestUpdate();const t=this._alarmPinCode||void 0;this._hass.callService("alarm_control_panel","alarm_disarm",{entity_id:e,...t?{code:t}:{}}),this._alarmPinCode="",this.requestUpdate()}_startAlarmLockout(){this._alarmLockoutTimer&&clearInterval(this._alarmLockoutTimer),this._alarmLockoutAnnounced=!1;const e=this._alarmPinLimiter.resetTime(),t=()=>{const t=Math.max(0,Math.ceil((e-Date.now())/1e3));this._alarmLockoutSeconds=t,this._alarmLockoutAnnounced=!0,this.requestUpdate(),t<=0&&(clearInterval(this._alarmLockoutTimer),this._alarmLockoutTimer=null,this._alarmPinError=!1,this._alarmLockoutSeconds=0,this._alarmLockoutAnnounced=!1,this.requestUpdate())};t(),this._alarmLockoutTimer=setInterval(t,1e3)}_startAlarmCountdown(e){this._alarmCountdown=Math.max(0,e),this._alarmCountdownTimer&&clearInterval(this._alarmCountdownTimer),this._alarmCountdownTimer=setInterval(()=>{this._alarmCountdown=Math.max(0,(this._alarmCountdown||0)-1),this.requestUpdate(),this._alarmCountdown<=0&&(clearInterval(this._alarmCountdownTimer),this._alarmCountdownTimer=null)},1e3)}_stopAlarmCountdown(){this._alarmCountdownTimer&&(clearInterval(this._alarmCountdownTimer),this._alarmCountdownTimer=null),this._alarmCountdown=null}_getAlarmShieldSymbol(e){switch(e){case"disarmed":return"✓";case"armed_home":case"armed_night":return"◉";case"armed_away":case"armed_vacation":return"▲";case"triggered":return"✕";case"arming":case"pending":case"disarming":return"⋯";default:return"?"}}_getAlarmStateLabel(e){return(e||"unknown").toUpperCase().replace(/_/g," ")}_handleAlarmKeydown(e,t){const a=e.key;/^[0-9]$/.test(a)?(e.preventDefault(),this._handleAlarmPinDigit(a)):"Backspace"===a?(e.preventDefault(),this._alarmPinCode=this._alarmPinCode.slice(0,-1),this.requestUpdate()):"Enter"===a?(e.preventDefault(),this._handleAlarmDisarm(t)):"Escape"===a&&(e.preventDefault(),this._handleAlarmPinClear())}_renderAlarmPanel(e){const t=this._getDeviceCategoryEntities(e.device.id),{alarm:a,zones:i,auxiliary:s,diagnostics:n,zoneSiblings:o}=this._partitionAlarmEntities(e.entities,t),d=this._shortDeviceName(e.device)||"Alarm";if(0===a.length)return"";const p=a[0],u=p.state,m=u?.state||"unavailable",h=(0,l.of)(m),f=["arming","pending","disarming"].includes(m),v="triggered"===m,g=this._getAlarmShieldSymbol(m),b=this._getAlarmStateLabel(m),y=!1!==u?.attributes?.code_required,_=Array.from({length:6},(e,t)=>t<this._alarmPinCode.length);if(f&&null==this._alarmCountdown){const e=u?.attributes?.delay||60;this._startAlarmCountdown(e)}else f||null==this._alarmCountdown||this._stopAlarmCountdown();return r.qy`
        <div class="lcars-device-panel alarm-panel ${v?"alarm-triggered":""}" data-panel-type="alarm"
          data-state="${m}"
          style="--panel-frame-color:${h}">
          <!-- Header -->
          <div class="alarm-header">
            <span class="device-panel-name">${d}</span>
            <div class="device-panel-header-line"></div>
            <span class="alarm-state-badge" style="color:${h}">${b}</span>
            <span class="panel-numeric-code" aria-hidden="true">${this._generatePanelCode(p.entity.entity_id)}</span>
          </div>

          <!-- Zones (left) -->
          <div class="alarm-sensors" role="list" aria-label="${d} zones">
            ${i.map(({entity:e,state:t})=>{const a=this._friendlyName(t,e),i="on"===t.state,s=i?"var(--lcars-butterscotch)":"var(--lcars-gray)",n=e.device_id&&o.get(e.device_id)||[];return r.qy`
                <div class="device-sensor-line" tabindex="0" role="listitem"
                  aria-label="${a}: ${i?"open":"closed"}"
                  @click=${()=>this._handleEntityClick(e.entity_id)}
                  @keydown=${t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._handleEntityClick(e.entity_id))}}>
                  <div class="sensor-indicator" style="background:${s}"></div>
                  <span class="sensor-label">${a}</span>
                  ${n.length>0?r.qy`<span class="zone-siblings">${n.map(e=>{const t=e.state?.attributes?.device_class||"",a=e.state?.attributes?.unit_of_measurement||"",{text:i}=(0,c.kp)(e.state,e.entity?.entity_category),s="battery"===t?"BAT":"illuminance"===t?"LUX":"",n=`${"battery"===t?"Battery":"illuminance"===t?"Illuminance":t}: ${i}${a?" "+a:""}`;return r.qy`<span class="zone-sibling-pip" role="img" aria-label="${n}" title="${e.state?.attributes?.friendly_name||""}">${s} ${i}${a?" "+a:""}</span>`})}</span>`:""}}
                  <span class="sensor-state-value" style="color:${s}">${i?"OPEN":"CLOSED"}</span>
                </div>
              `})}
            ${s.length>0?r.qy`
              <div class="battery-section-divider"></div>
              ${s.map(({entity:e,state:t})=>{const a=this._friendlyName(t,e),i=this._getSensorIndicatorColor(t);return r.qy`
                  <div class="device-sensor-line" tabindex="0" role="listitem"
                    @click=${()=>this._handleEntityClick(e.entity_id)}
                    @keydown=${t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._handleEntityClick(e.entity_id))}}>
                    <div class="sensor-indicator" style="background:${i}"></div>
                    <span class="sensor-label">${a}</span>
                    <span class="sensor-state-value" style="color:${i}">${t.state}</span>
                  </div>
                `})}
            `:""}
          </div>

          <!-- Viewscreen (right) -->
          <div class="alarm-viewscreen">
            ${f&&null!=this._alarmCountdown?r.qy`
              <div class="alarm-countdown" aria-live="polite">
                <span class="alarm-countdown-num" style="color:${h}">${this._alarmCountdown}</span>
                <span class="alarm-countdown-label">${b}</span>
              </div>
            `:r.qy`
              <svg class="alarm-shield" viewBox="0 0 160 180" role="img"
                aria-label="${d}: ${b}">
                <path d="M80,10 L145,45 L145,110 Q145,160 80,175 Q15,160 15,110 L15,45 Z"
                  fill="none" stroke="${h}" stroke-width="4" />
                <text x="80" y="105" text-anchor="middle" fill="${h}"
                  font-family="var(--lcars-font)" font-size="48">${g}</text>
                <text x="80" y="145" text-anchor="middle" fill="${h}"
                  font-family="var(--lcars-font)" font-size="14">${b}</text>
              </svg>
            `}
            <!-- Arm mode strip -->
            <div class="alarm-arm-strip" role="radiogroup" aria-label="Arm mode">
              ${["home","away","night"].map(e=>{const t=m===`armed_${e}`;return r.qy`
                  <button class="alarm-arm-btn" role="radio"
                    aria-checked="${t}"
                    ?data-active=${t}
                    @click=${()=>this._handleAlarmArm(p.entity.entity_id,e)}>
                    ${e.toUpperCase()}
                  </button>
                `})}
            </div>
          </div>

          <!-- PIN Keypad -->
          ${y?r.qy`
            <div class="alarm-keypad" tabindex="0" aria-label="PIN keypad"
              @keydown=${e=>this._handleAlarmKeydown(e,p.entity.entity_id)}>
              <div class="alarm-code-display ${this._alarmPinError?"alarm-pin-error":""}" role="status" aria-live="polite">
                ${_.map(e=>r.qy`
                  <div class="alarm-code-dot ${e?"filled":""}"
                    style="background:${e?this._alarmPinError?"var(--lcars-tomato)":h:"var(--lcars-disabled)"}"></div>
                `)}
              </div>
              ${this._alarmLockoutSeconds>0?r.qy`
                ${this._alarmLockoutAnnounced?r.qy`<div class="alarm-lockout-msg" role="alert">LOCKED OUT</div>`:""}
                <div class="alarm-lockout-countdown" aria-live="off">${this._alarmLockoutSeconds}s</div>
              `:""}
              <div class="alarm-digit-grid">
                ${[1,2,3,4,5,6,7,8,9].map(e=>r.qy`
                  <button class="alarm-digit-btn" aria-label="Digit ${e}"
                    ?disabled=${this._alarmLockoutSeconds>0}
                    @click=${()=>this._handleAlarmPinDigit(e)}>${e}</button>
                `)}
                <button class="alarm-digit-btn alarm-action-btn" aria-label="Clear code"
                  ?disabled=${this._alarmLockoutSeconds>0}
                  @click=${()=>this._handleAlarmPinClear()}>⌫</button>
                <button class="alarm-digit-btn" aria-label="Digit 0"
                  ?disabled=${this._alarmLockoutSeconds>0}
                  @click=${()=>this._handleAlarmPinDigit(0)}>0</button>
                <button class="alarm-digit-btn alarm-action-btn" aria-label="Disarm"
                  ?disabled=${this._alarmLockoutSeconds>0}
                  @click=${()=>this._handleAlarmDisarm(p.entity.entity_id)}>⏎</button>
              </div>
            </div>
          `:""}
          <div class="panel-pip-strip" aria-hidden="true"></div>
        </div>
      `}_isValidArtworkUrl(e){return!!e&&(e.startsWith("/api/")||e.startsWith("/local/"))}_getMediaTransportSymbol(e){switch(e){case"playing":return"▶";case"paused":return"❚❚";default:return"■"}}_partitionMediaEntities(e){const t=[],a=[],r=[],i=[];for(const s of e)"media_player"!==s.domain?"remote"!==s.domain?o.Xt.has(s.domain)?a.push(s):r.push(s):i.push(s):t.push(s);return{player:t,sensors:a,controls:r,remotes:i}}_handleMediaService(e,t,a={}){this._hass.callService("media_player",t,{entity_id:e,...a})}_handleVolumeChange(e,t){const a=t.currentTarget.getBoundingClientRect(),r=Math.max(0,Math.min(1,(t.clientX-a.left)/a.width));this._handleMediaService(e,"volume_set",{volume_level:Math.round(100*r)/100})}_renderMediaPanel(e){const{player:t,sensors:a,controls:i,remotes:s}=this._partitionMediaEntities(e.entities),n=this._shortDeviceName(e.device)||"Media";if(0===t.length)return"";const o=t[0],c=o.state,d=c?.attributes||{},p=c?.state||"unavailable",u=(0,l.uT)(p),m=this._getMediaTransportSymbol(p),h="playing"===p,f=!(h||"paused"===p),v=d.entity_picture,g=this._isValidArtworkUrl(v),b=d.media_title||"",y=d.media_artist||"",_=d.source||"",w=null!=d.volume_level?Number(d.volume_level):0,x=d.is_volume_muted||!1,$=(d.source_list,d.supported_features||0),k=!!(16&$),S=!!(32&$),C=!!(4&$),E=!!(32768&$),z=!!(262144&$),A=d.shuffle||!1,q=d.repeat||"off";return r.qy`
        <div class="lcars-device-panel media-panel ${f?"media-idle":""}" data-panel-type="media"
          style="--panel-frame-color:var(--lcars-african-violet)">
          <!-- Header -->
          <div class="media-header">
            <span class="device-panel-name">${n}</span>
            <div class="device-panel-header-line"></div>
            <span class="media-state-badge" style="color:${u}">${m} ${p.toUpperCase()}</span>
            <span class="panel-numeric-code" aria-hidden="true">${this._generatePanelCode(o.entity.entity_id)}</span>
          </div>

          <!-- Metadata (left) -->
          <div class="media-metadata" role="list" aria-label="${n} info">
            ${_?r.qy`
              <div class="device-sensor-line" role="listitem">
                <div class="sensor-indicator" style="background:var(--lcars-african-violet)"></div>
                <span class="sensor-label">Source</span>
                <span class="sensor-state-value">${_}</span>
              </div>
            `:""}
            ${E?r.qy`
              <div class="device-sensor-line" role="listitem">
                <div class="sensor-indicator" style="background:${A?"var(--lcars-african-violet)":"var(--lcars-gray)"}"></div>
                <span class="sensor-label">Shuffle</span>
                <span class="sensor-state-value">${A?"ON":"OFF"}</span>
              </div>
            `:""}
            ${z?r.qy`
              <div class="device-sensor-line" role="listitem">
                <div class="sensor-indicator" style="background:${"off"!==q?"var(--lcars-african-violet)":"var(--lcars-gray)"}"></div>
                <span class="sensor-label">Repeat</span>
                <span class="sensor-state-value">${q.toUpperCase()}</span>
              </div>
            `:""}
            ${a.map(({entity:e,state:t})=>{const a=this._friendlyName(t,e),i=this._getSensorIndicatorColor(t);return r.qy`
                <div class="device-sensor-line" tabindex="0" role="listitem"
                  @click=${()=>this._handleEntityClick(e.entity_id)}
                  @keydown=${t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._handleEntityClick(e.entity_id))}}>
                  <div class="sensor-indicator" style="background:${i}"></div>
                  <span class="sensor-label">${a}</span>
                  <span class="sensor-state-value" style="color:${i}">${t.state}</span>
                </div>
              `})}
          </div>

          <!-- Viewscreen (right) -->
          <div class="media-viewscreen ${h?"media-viewscreen-glow":""}" @click=${()=>this._handleEntityClick(o.entity.entity_id)}>
            ${g&&!f?r.qy`
              <img class="media-art" src="${v}" alt="Album art"
                crossorigin="anonymous" referrerpolicy="no-referrer" loading="lazy"
                @error=${e=>{e.target.style.display="none"}} />
            `:r.qy`
              <div class="media-idle-display">
                <span class="media-idle-glyph">&#9834;</span>
                <span class="media-idle-label">STANDBY</span>
              </div>
            `}
            ${f?"":r.qy`
              <div class="media-now-playing">
                ${b?r.qy`<div class="media-title">${b}</div>`:""}
                ${y?r.qy`<div class="media-artist">${y}</div>`:""}
              </div>
            `}
          </div>

          <!-- Audio Waveform (12 bars, 4 groups — Data C-1/C-2) -->
          <div class="lcars-audio-waveform" ?data-paused=${!h} aria-hidden="true">
            ${Array.from({length:12},(e,t)=>{const a=Math.floor(t/3),i=[380,420,350,460][a],s=50*t,n=2===t||8===t;return r.qy`<div class="bar ${n?"peak":""}"
                style="--bar-dur:${i+t%3*30}ms;--bar-delay:${s}ms;--bar-min-ratio:${.1+.05*a}"></div>`})}
          </div>

          <!-- Transport + Volume (bottom) -->
          <div class="media-controls">
            <div class="media-transport" aria-label="Transport controls">
              ${E?r.qy`
                <button class="media-transport-btn" aria-pressed="${A}" title="Shuffle"
                  @click=${()=>this._handleMediaService(o.entity.entity_id,"shuffle_set",{shuffle:!A})}>⇄</button>
              `:""}
              ${k?r.qy`
                <button class="media-transport-btn" title="Previous"
                  @click=${()=>this._handleMediaService(o.entity.entity_id,"media_previous_track")}>⏮</button>
              `:""}
              <button class="media-transport-btn media-play-btn" title="${h?"Pause":"Play"}"
                @click=${()=>this._handleMediaService(o.entity.entity_id,h?"media_pause":"media_play")}>
                ${h?"❚❚":"▶"}
              </button>
              ${S?r.qy`
                <button class="media-transport-btn" title="Next"
                  @click=${()=>this._handleMediaService(o.entity.entity_id,"media_next_track")}>⏭</button>
              `:""}
              ${z?r.qy`
                <button class="media-transport-btn" aria-pressed="${"off"!==q}" title="Repeat: ${q}"
                  @click=${()=>this._handleMediaService(o.entity.entity_id,"repeat_set",{repeat:"off"===q?"all":"all"===q?"one":"off"})}>🔁</button>
              `:""}
            </div>
            ${C?r.qy`
              <div class="media-volume" aria-label="Volume: ${Math.round(100*w)}%">
                <button class="media-mute-btn" aria-pressed="${x}" title="${x?"Unmute":"Mute"}"
                  @click=${()=>this._handleMediaService(o.entity.entity_id,"volume_mute",{is_volume_muted:!x})}>
                  ${x?"🔇":"🔊"}
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
      `}_partitionPoolEntities(e){const t=[],a=[],r=[],i=[],s=[],n=[],o=[],l=[],c=/orp|ph_|salt|tds|saturation|calcium|alkalinity|cyanuric/i;for(const d of e){const e=d.entity.entity_id,p=d.domain,u=d.state?.attributes||{};if("climate"!==p)if("light"!==p)if("sensor"===p&&c.test(e))r.push(d);else if("switch"!==p){if("sensor"===p&&"temperature"===(u.device_class||"")){o.push(d);continue}l.push(d)}else/pump/i.test(e)?i.push(d):s.push(d);else n.push(d);else/spa/i.test(e)?a.push(d):t.push(d)}return{pool:t,spa:a,chemistry:r,pumps:i,circuits:s,lights:n,environmental:o,diagnostics:l}}_handlePoolSetpoint(e,t,a){const r=(0,d.A_)(a,t,{min:40,max:104});this._poolSetpointDebouncer||(this._poolSetpointDebouncer=(0,d.eU)((e,t)=>{this._hass.callService("climate","set_temperature",{entity_id:e,temperature:t})},1500)),this._poolSetpointDebouncer.call(e,r)}_renderPoolBody(e,t,a){if(0===e.length)return"";const i=e[0],s=i.state,n=s?.attributes||{},o=null!=n.current_temperature?Number(n.current_temperature):null,c=null!=n.temperature?Number(n.temperature):null,d=n.hvac_action||"off",p=(0,l.qW)(d,t),u="spa"===t?"SPA":"POOL";return r.qy`
        <div class="pool-body-frame" style="--body-color:${p}" role="region"
          aria-label="${u}: ${null!=o?o+"°":"N/A"}, target ${c||"N/A"}°">
          <div class="pool-body-label" style="color:${p}">${u}</div>
          <div class="pool-body-temp">${null!=o?`${Math.round(o)}°`:"—"}</div>
          ${null!=c?r.qy`
            <div class="pool-setpoint-row">
              <button class="climate-sp-btn" aria-label="Decrease ${u} target"
                @click=${()=>this._handlePoolSetpoint(i.entity.entity_id,n,c-(a||1))}>−</button>
              <span class="pool-target" style="color:${p}">${c}°</span>
              <button class="climate-sp-btn" aria-label="Increase ${u} target"
                @click=${()=>this._handlePoolSetpoint(i.entity.entity_id,n,c+(a||1))}>+</button>
            </div>
          `:""}
          <div class="panel-pip-strip" aria-hidden="true"></div>
        </div>
      `}_renderPoolSpaPanel(e){const{pool:t,spa:a,chemistry:i,pumps:s,circuits:n,lights:o,environmental:l,diagnostics:c}=this._partitionPoolEntities(e.entities),d=this._shortDeviceName(e.device)||"Pool & Spa",p=i.length>0,u=t[0]?.state?.attributes?.current_temperature,m=a[0]?.state?.attributes?.current_temperature,h=l.find(e=>/air/i.test(e.entity.entity_id)),f=h?.state?.state;return r.qy`
        <div class="lcars-device-panel pool-panel ${p?"":"pool-no-chem"}" data-panel-type="aquatics"
          style="--panel-frame-color:var(--lcars-bluey)">
          <!-- Header -->
          <div class="pool-header">
            <span class="device-panel-name">${d}</span>
            <div class="device-panel-header-line"></div>
            ${null!=u?r.qy`<span class="pool-temp-badge" style="color:var(--lcars-ice)">POOL ${Math.round(u)}°</span>`:""}
            ${null!=m?r.qy`<span class="pool-temp-badge" style="color:var(--lcars-butterscotch)">SPA ${Math.round(m)}°</span>`:""}
            ${null!=f?r.qy`<span class="pool-temp-badge" style="color:var(--lcars-space-white)">AIR ${Math.round(Number(f))}°</span>`:""}
            <span class="panel-numeric-code" aria-hidden="true">${this._generatePanelCode(t[0]?.entity?.entity_id||a[0]?.entity?.entity_id||e.device.id)}</span>
          </div>

          <!-- Chemistry (left, conditional) -->
          ${p?r.qy`
            <div class="pool-chemistry" role="list" aria-label="Water chemistry">
              ${i.map(({entity:e,state:t})=>{const a=this._friendlyName(t,e),{text:i}=this._fmtSensor(t,e),s=this._getSensorIndicatorColor(t,e?.entity_category);return r.qy`
                  <div class="device-sensor-line" tabindex="0" role="listitem"
                    aria-label="${a}: ${i}"
                    @click=${()=>this._handleEntityClick(e.entity_id)}
                    @keydown=${t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._handleEntityClick(e.entity_id))}}>
                    <div class="sensor-indicator" style="background:${s}"></div>
                    <span class="sensor-label">${a}</span>
                    <span class="sensor-state-value" style="color:${s}">${i}</span>
                  </div>
                `})}
            </div>
          `:""}

          <!-- Aquatics (center) -->
          <div class="pool-aquatics">
            ${this._renderPoolBody(t,"pool",1)}
            ${this._renderPoolBody(a,"spa",1)}
          </div>

          <!-- Controls (right) -->
          <div class="pool-controls" aria-label="Circuit controls">
            ${[...s,...n].map(({entity:e,state:t},a)=>{const i=this._friendlyName(t,e),n="on"===t.state,o=0===a&&s.length>0&&e.entity_id===s[0].entity.entity_id;return r.qy`
                <button class="device-control-btn" role="switch" aria-checked="${n}" ?data-on=${n}
                  @click=${()=>this._handleToggle(e.entity_id)}
                  title="${i}: ${t.state}">
                  ${o?r.qy`
                    <div class="lcars-pump-spinner ${n?"on":""}" aria-hidden="true">
                      <div class="dot"></div><div class="dot"></div><div class="dot"></div>
                    </div>
                  `:r.qy`<ha-icon .icon=${this._getEntityIcon(t)}></ha-icon>`}
                  <span>${i}</span>
                </button>
              `})}
            ${l.map(({entity:e,state:t})=>{const a=this._friendlyName(t,e),i=t.attributes?.unit_of_measurement||"";return r.qy`
                <div class="device-sensor-line" tabindex="0" role="listitem"
                  @click=${()=>this._handleEntityClick(e.entity_id)}>
                  <div class="sensor-indicator" style="background:var(--lcars-data-accent)"></div>
                  <span class="sensor-label">${a}</span>
                  <span class="sensor-state-value">${t.state}${i?" "+i:""}</span>
                </div>
              `})}
          </div>

          <!-- Lighting (bottom, full width) -->
          ${o.length>0?r.qy`
            <div class="pool-lighting" aria-label="Pool lighting">
              ${o.map(({entity:e,state:t})=>{const a=this._friendlyName(t,e),i="on"===t.state;return r.qy`
                  <button class="device-control-btn" role="switch" aria-checked="${i}" ?data-on=${i}
                    @click=${()=>this._handleToggle(e.entity_id)}
                    title="${a}: ${t.state}">
                    <ha-icon .icon=${this._getEntityIcon(t)}></ha-icon>
                    <span>${a}</span>
                  </button>
                `})}
            </div>
          `:""}
          <div class="panel-pip-strip" aria-hidden="true"></div>
        </div>
      `}_weatherForecastCache={};_getWeatherGlyph(e){return{sunny:"☀","clear-night":"●",partlycloudy:"◑",cloudy:"◔",fog:"≡",rainy:"▽",pouring:"▼",snowy:"✦","snowy-rainy":"◆",hail:"◆",windy:"〰","windy-variant":"〰",lightning:"⚡","lightning-rainy":"⚡",exceptional:"⚠"}[e]||"○"}_getWindCardinal(e){return null==e?"":["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"][Math.round(e/22.5)%16]}_partitionWeatherEntities(e){const t=[],a=[],r=[],i=[],s=[],n=[];for(const l of e){if("weather"===l.domain){t.push(l);continue}const e=l.entity.entity_id,c=l.state?.attributes?.device_class||"";/lightning/i.test(e)?r.push(l):"precipitation"===c||"precipitation_intensity"===c||/rain/i.test(e)?i.push(l):"wind_speed"===c||/wind/i.test(e)?s.push(l):o.Xt.has(l.domain)?a.push(l):n.push(l)}return{weather:t,sensors:a,lightning:r,precipitation:i,wind:s,diagnostics:n}}_renderWindCompass(e,t,a){if(null==e)return"";const i=this._getWindCardinal(e),s=e;return r.qy`
        <div class="weather-wind-compass" role="img"
          aria-label="Wind: ${t||"?"} ${a||"mph"} from ${i}">
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
          <div class="wind-reading">${t||"—"} ${a||""} ${i}</div>
        </div>
      `}async _loadWeatherForecast(e){if(this._weatherForecastCache[e])return;const t=await m(this._hass,e,"daily");t.length>0&&(this._weatherForecastCache[e]=t,this.requestUpdate())}_renderForecastStrip(e){if(!e?.length)return"";const t=e.slice(0,7),a=t.map(e=>e.temperature).filter(Number.isFinite),i=t.map(e=>e.templow).filter(Number.isFinite),s=Math.min(...i,...a),n=Math.max(...a,...i)-s||1;return r.qy`
        <div class="weather-forecast" role="list" aria-label="7-day forecast">
          ${t.map(e=>{const t=new Date(e.datetime).toLocaleDateString("en",{weekday:"short"}).toUpperCase(),a=e.temperature,i=e.templow,o=e.condition,c=this._getWeatherGlyph(o),d=(0,l.JQ)(o),p=e.precipitation_probability,u=(i-s)/n*100,m=(a-i||1)/n*100;return r.qy`
              <div class="forecast-tile" role="listitem" tabindex="0"
                aria-label="${t}: ${o}, high ${a}°, low ${i}°${null!=p?`, ${p}% precipitation`:""}">
                <span class="forecast-day">${t}</span>
                <span class="forecast-glyph" style="color:${d}">${c}</span>
                <span class="forecast-hi">${null!=a?Math.round(a):"—"}°</span>
                <div class="forecast-range-bar">
                  <div class="forecast-range-fill" style="left:${u.toFixed(1)}%;width:${m.toFixed(1)}%"></div>
                </div>
                <span class="forecast-lo">${null!=i?Math.round(i):"—"}°</span>
                ${null!=p?r.qy`<span class="forecast-precip" style="color:${p>50?"var(--lcars-sky)":"var(--lcars-gray)"}">${p}%</span>`:""}
              </div>
            `})}
        </div>
      `}_renderWeatherPanel(e){const{weather:t,sensors:a,lightning:i,precipitation:s,wind:n,diagnostics:o}=this._partitionWeatherEntities(e.entities),c=this._shortDeviceName(e.device)||"Weather";if(0===t.length)return"";const d=t[0],p=d.state,u=p?.attributes||{},m=p?.state||"unavailable",h=(0,l.JQ)(m),f=this._getWeatherGlyph(m),v=u.temperature,g=u.humidity,b=u.pressure,y=u.wind_speed,_=u.wind_bearing,w=u.wind_speed_unit||"mph";this._loadWeatherForecast(d.entity.entity_id);const x=this._weatherForecastCache[d.entity.entity_id];return r.qy`
        <div class="lcars-device-panel weather-panel" data-panel-type="weather"
          style="--panel-frame-color:${h}">
          <!-- Header -->
          <div class="weather-header">
            <span class="device-panel-name">${c}</span>
            <div class="device-panel-header-line"></div>
            <span class="weather-condition-badge" style="color:${h}">
              ${f} ${m.toUpperCase().replace(/[_-]/g," ")}
            </span>
            <span class="panel-numeric-code" aria-hidden="true">${this._generatePanelCode(d.entity.entity_id)}</span>
          </div>

          <!-- Sensors (left) -->
          <div class="weather-sensors" role="list" aria-label="${c} readings">
            ${null!=g?r.qy`
              <div class="device-sensor-line" role="listitem" aria-label="Humidity: ${g}%">
                <div class="sensor-indicator" style="background:var(--lcars-ice)"></div>
                <span class="sensor-label">Humidity</span>
                <span class="sensor-state-value" style="color:var(--lcars-ice)">${g}%</span>
              </div>
            `:""}
            ${null!=b?r.qy`
              <div class="device-sensor-line" role="listitem" aria-label="Pressure: ${b}">
                <div class="sensor-indicator" style="background:var(--lcars-data-accent)"></div>
                <span class="sensor-label">Pressure</span>
                <span class="sensor-state-value">${b}</span>
              </div>
            `:""}
            ${i.map(({entity:e,state:t})=>{const a=this._friendlyName(t,e),i=t.attributes?.unit_of_measurement||"";return r.qy`
                <div class="device-sensor-line" tabindex="0" role="listitem"
                  aria-label="${a}: ${t.state}${i?" "+i:""}"
                  @click=${()=>this._handleEntityClick(e.entity_id)}>
                  <div class="sensor-indicator" style="background:var(--lcars-gold)"></div>
                  <span class="sensor-label">${a}</span>
                  <span class="sensor-state-value" style="color:var(--lcars-gold)">${t.state}${i?" "+i:""}</span>
                </div>
              `})}
            ${s.map(({entity:e,state:t})=>{const a=this._friendlyName(t,e),i=t.attributes?.unit_of_measurement||"";return r.qy`
                <div class="device-sensor-line" tabindex="0" role="listitem"
                  aria-label="${a}: ${t.state}${i?" "+i:""}"
                  @click=${()=>this._handleEntityClick(e.entity_id)}>
                  <div class="sensor-indicator" style="background:var(--lcars-sky)"></div>
                  <span class="sensor-label">${a}</span>
                  <span class="sensor-state-value" style="color:var(--lcars-sky)">${t.state}${i?" "+i:""}</span>
                </div>
              `})}
            ${a.map(({entity:e,state:t})=>{const a=this._friendlyName(t,e),i=t.attributes?.unit_of_measurement||"",s=this._getSensorIndicatorColor(t);return r.qy`
                <div class="device-sensor-line" tabindex="0" role="listitem"
                  aria-label="${a}: ${t.state}${i?" "+i:""}"
                  @click=${()=>this._handleEntityClick(e.entity_id)}
                  @keydown=${t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._handleEntityClick(e.entity_id))}}>
                  <div class="sensor-indicator" style="background:${s}"></div>
                  <span class="sensor-label">${a}</span>
                  <span class="sensor-state-value" style="color:${s}">${t.state}${i?" "+i:""}</span>
                </div>
              `})}
          </div>

          <!-- Viewscreen (right) -->
          <div class="weather-viewscreen" role="img"
            aria-label="${m}: ${null!=v?v+"°":"N/A"}">
            <svg class="weather-display" viewBox="0 0 200 160">
              <text x="100" y="35" text-anchor="middle" fill="${h}"
                font-family="var(--lcars-font)" font-size="28">${f}</text>
              <text x="100" y="85" text-anchor="middle" fill="${h}"
                font-family="var(--lcars-font)" font-size="48" font-weight="bold">
                ${null!=v?`${Math.round(v)}°`:"—"}
              </text>
              <text x="100" y="108" text-anchor="middle" fill="var(--lcars-data-accent)"
                font-family="var(--lcars-font)" font-size="12">
                ${m.toUpperCase().replace(/[_-]/g," ")}
              </text>
            </svg>
            ${this._renderWindCompass(_,y,w)}
          </div>

          <!-- Forecast (bottom) -->
          ${this._renderForecastStrip(x)}
          <div class="panel-pip-strip" aria-hidden="true"></div>
        </div>
      `}_irrigationLimiter=(0,d.x)(5,1e4);_partitionIrrigationEntities(e){const t=[],a=[],r=[];for(const i of e){const e=i.domain,s=i.entity.entity_id,n=i.state?.attributes||{};"switch"!==e?"binary_sensor"!==e||r.some(e=>!0)?a.push(i):r.push(i):null!=n.zone_number||/zone/i.test(s)?t.push(i):r.push(i)}return t.sort((e,t)=>(e.state?.attributes?.zone_number??999)-(t.state?.attributes?.zone_number??999)),{zones:t,sensors:a,controller:r}}_handleIrrigationZone(e,t){this._irrigationLimiter.allow()&&this._hass.callService("switch",t?"turn_on":"turn_off",{entity_id:e})}_renderIrrigationPanel(e){return r.qy`
        <lcars-irrigation-panel
          .group=${e}
          .hass=${this._hass}
          .editMode=${this._editMode}
          area-id="${this.selectedArea||""}">
        </lcars-irrigation-panel>
      `}_powerToggleLimiter=(0,d.x)(10,1e4);_formatWatts(e){if(null==e)return"—";const t=Number(e);return Number.isFinite(t)?Math.abs(t)>=1e4?`${(t/1e3).toFixed(1)} kW`:`${Math.round(t)} W`:"—"}_formatEnergy(e){if(null==e)return"—";const t=Number(e);return Number.isFinite(t)?`${t.toFixed(1)} kWh`:"—"}_getPowerIndicator(e){if(null==e||isNaN(e))return"✕";const t=Math.abs(Number(e));return t<=0?"○":t<=500?"●":t<=1500?"●━":t<=3e3?"●━━":"●━━━"}_partitionPowerEntities(e){const t=[],a=[],r=[],i=[],s=[],n=[];for(const o of e){if(o.disabled_by||o.hidden_by)continue;const e=o.entity?.entity_id?.split(".")[0]||o.domain,l=o.state?.attributes?.device_class||"",c=o.state?.attributes?.unit_of_measurement||"";"switch"===e?t.push(o):"power"!==l||"W"!==c&&"kW"!==c?"energy"!==l||"kWh"!==c&&"Wh"!==c?"voltage"===l&&"V"===c?i.push(o):"current"===l&&"A"===c?s.push(o):n.push(o):r.push(o):a.push(o)}return{switches:t,powerSensors:a,energySensors:r,voltageSensors:i,currentSensors:s,diagnostics:n}}_classifyPowerDevice(e,t){if(!e.some(e=>{const t=e.state?.attributes?.device_class||"";return"sensor"===e.domain&&("power"===t||"energy"===t||"voltage"===t||"current"===t)}))return null;const a=e.some(e=>"switch"===e.domain),r=(t?.manufacturer||"").toLowerCase(),i=(t?.model||"").toLowerCase();return r.includes("emporia")||i.includes("vue")?"vue":e.filter(e=>"switch"===e.domain).length>=4||i.includes("hs300")||i.includes("power strip")?"strip":a?"plug":"vue"}_getPrimaryPower(e){for(const t of e.entities){const e=t.state?.attributes?.device_class||"",a=t.state?.attributes?.unit_of_measurement||"";if("power"===e&&("W"===a||"kW"===a)){const e=parseFloat(t.state?.state);if(!isNaN(e))return"kW"===a?1e3*e:e}}return null}_getPrimaryEnergy(e){for(const t of e.entities){const e=t.state?.attributes?.device_class||"",a=t.state?.attributes?.unit_of_measurement||"";if("energy"===e&&("kWh"===a||"Wh"===a)){const e=parseFloat(t.state?.state);if(!isNaN(e))return"Wh"===a?e/1e3:e}}return null}_detect240VPairs(e){const t=/^(.+?)[\s_]*(l[12]|line[\s_]*[12])$/i,a=new Map,r=[];for(const i of e){const e=(this._shortDeviceName(i.device)||"").match(t);if(e){const t=e[1].trim();a.has(t)||a.set(t,[]),a.get(t).push(i)}else r.push(i)}const i=[...r];for(const[e,t]of a)if(2===t.length){const a=t.reduce((e,t)=>e+(this._getPrimaryPower(t)||0),0),r=t.reduce((e,t)=>e+(this._getPrimaryEnergy(t)||0),0);i.push({device:{...t[0].device,name:e},entities:t.flatMap(e=>e.entities),is240V:!0,combinedWatts:a,combinedEnergy:r})}else i.push(...t);return i}_sortCircuits(e){return[...e].sort((e,t)=>{const a=null!=e.combinedWatts?e.combinedWatts:this._getPrimaryPower(e)||0,r=null!=t.combinedWatts?t.combinedWatts:this._getPrimaryPower(t)||0;if(r!==a)return r-a;const i=(e.device?.name||"").toLowerCase(),s=(t.device?.name||"").toLowerCase();return i.localeCompare(s)})}_groupPowerStrips(e){const t=new Map,a=[];for(const a of e)"strip"===a.subType&&t.set(a.device.id,{parent:a,children:[]});for(const r of e)if("strip"!==r.subType){if(r.device?.via_device_id){const e=t.get(r.device.via_device_id);if(e){e.children.push(r);continue}}a.push(r)}return{strips:t,standalone:a}}_renderPowerArc(e,t){if(!e.length||!t||t<=0)return"";const a=this._config?.power_thresholds||{},s=e.map(e=>({name:this._shortDeviceName(e.device)||"Unknown",watts:null!=e.combinedWatts?e.combinedWatts:this._getPrimaryPower(e)||0})).filter(e=>e.watts>0).sort((e,t)=>t.watts-e.watts);if(0===s.length)return"";const n=s.slice(0,5),o=s.slice(5).reduce((e,t)=>e+t.watts,0);o>0&&n.push({name:"OTHER",watts:o});const c=120,d=100,p=80,u=Math.PI,m=Math.PI;let h=u;const f=n.map(e=>{const r=e.watts/t,i=Math.max(r*m-.02,.01),s=h-i,n=(0,l.XI)(e.watts,a),o=c+p*Math.cos(h),u=d-p*Math.sin(h),f=c+p*Math.cos(s),v=d-p*Math.sin(s),g=i>Math.PI?1:0,b=`M ${o.toFixed(1)},${u.toFixed(1)} A 80,80 0 ${g},1 ${f.toFixed(1)},${v.toFixed(1)}`;return h=s-.02,{path:b,color:n,name:e.name,watts:e.watts,fraction:r}});return r.qy`
        <div class="power-arc-area">
          <svg class="power-distribution-arc" viewBox="0 0 240 120"
            role="img" aria-label="Power distribution: ${this._formatWatts(t)} total">
            <!-- Background arc -->
            <path d="M ${40},${d} A ${p},${p} 0 1,1 ${200},${d}"
              fill="none" stroke="var(--lcars-gray)" stroke-width="10"
              stroke-linecap="butt" opacity="0.15" />
            <!-- Segments -->
            ${f.map(e=>i.JW`
              <path d="${e.path}" fill="none" stroke="${e.color}"
                stroke-width="10" stroke-linecap="butt">
                <title>${e.name}: ${Math.round(e.watts)}W (${Math.round(100*e.fraction)}%)</title>
              </path>
            `)}
            <!-- Total text -->
            <text x="${c}" y="${85}" text-anchor="middle"
              fill="var(--lcars-text-heading)" font-family="var(--lcars-font)"
              font-size="28" font-weight="bold">
              ${this._formatWatts(t)}
            </text>
            <text x="${c}" y="${105}" text-anchor="middle"
              fill="var(--lcars-space-white)" font-family="var(--lcars-font)"
              font-size="10" opacity="0.7">
              TOTAL
            </text>
          </svg>
        </div>
      `}_showCircuitPopover(e){const t=this.shadowRoot?.querySelector("#power-detail-popover");if(!t)return;const a=null!=e.combinedWatts?e.combinedWatts:this._getPrimaryPower(e),s=null!=e.combinedEnergy?e.combinedEnergy:this._getPrimaryEnergy(e),o=this._config?.power_thresholds||{},c=(0,l.XI)(a,o),d=(0,l.IO)(a,o),p=this._shortDeviceName(e.device)||"Unknown",u=e.entities?.[0]?.entity?.entity_id,m=t.querySelector(".popover-content");m&&(0,i.XX)(r.qy`
          <div>
            <div class="popover-header">
              <span class="popover-title">${p}</span>
              <span class="popover-status" style="color:${c}">${d}</span>
            </div>
            <div class="popover-hero-value" style="color:${c}">
              ${null!=a?this._formatWatts(a):"UNAVAILABLE"}
            </div>
            <div class="popover-stats">
              ${null!=s?r.qy`
                <div class="popover-stat-row">
                  <span class="popover-stat-label">TODAY</span>
                  <span class="popover-stat-value">${this._formatEnergy(s)}</span>
                </div>
              `:""}
              ${e.is240V?r.qy`
                <div class="popover-stat-row">
                  <span class="popover-stat-label">CIRCUIT TYPE</span>
                  <span class="popover-stat-value" style="color:var(--lcars-butterscotch)">240V PAIRED</span>
                </div>
              `:""}
            </div>
            ${u?r.qy`
              <button class="popover-history-btn" @click=${()=>{(0,n.Hv)(u);try{t.hidePopover()}catch(e){}}}>VIEW FULL HISTORY</button>
            `:""}
          </div>
        `,m);try{t.showPopover()}catch(e){u&&(0,n.Hv)(u)}}_renderCircuitTile(e){const t=null!=e.combinedWatts?e.combinedWatts:this._getPrimaryPower(e),a=null!=e.combinedEnergy?e.combinedEnergy:this._getPrimaryEnergy(e),i=this._config?.power_thresholds||{},s=(0,l.XI)(t,i),o=(0,l.IO)(t,i),c=this._getPowerIndicator(t),d=this._shortDeviceName(e.device)||"Unknown",p="function"==typeof HTMLElement.prototype.showPopover,{powerSensors:u,energySensors:m}=this._partitionPowerEntities(e.entities||[]),h=u[0]?.entity?.entity_id,f=m[0]?.entity?.entity_id;return r.qy`
        <div class="power-circuit-tile"
          style="--circuit-color:${s}"
          role="listitem"
          tabindex="0"
          aria-label="${d}: ${null!=t?Math.round(t)+" watts, "+o.toLowerCase():"unavailable"}${null!=a?", "+a.toFixed(1)+" kilowatt hours today":""}"
          @click=${()=>p?this._showCircuitPopover(e):(0,n.Hv)(e.entities?.[0]?.entity?.entity_id)}
          @keydown=${t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),p?this._showCircuitPopover(e):(0,n.Hv)(e.entities?.[0]?.entity?.entity_id))}}>
          <div class="power-circuit-name">
            <span class="power-circuit-indicator" aria-hidden="true">${e.is240V?"●●":c}</span>
            <span>${d}</span>
          </div>
          <div class="power-circuit-value-row">
            ${this._renderClickableValue(h,`View ${d} power: ${null!=t?Math.round(t)+" watts":"unavailable"}`,r.qy`<span class="power-circuit-watts">${this._formatWatts(t)}</span>`)}
          </div>
          ${null!=a?this._renderClickableValue(f,`View ${d} energy: ${a.toFixed(1)} kWh today`,r.qy`<span class="power-circuit-energy">${this._formatEnergy(a)} TODAY</span>`):""}
        </div>
      `}_renderPowerDeviceRow(e){const{switches:t,powerSensors:a,energySensors:i}=this._partitionPowerEntities(e.entities),s=t[0],n=a[0]?parseFloat(a[0].state?.state)||0:null,o=i[0]&&parseFloat(i[0].state?.state)||null,c=this._config?.power_thresholds||{},d=(0,l.XI)(n,c),p=this._shortDeviceName(e.device)||"Unknown",u="on"===s?.state?.state,m=a[0]?.entity?.entity_id,h=i[0]?.entity?.entity_id;return r.qy`
        <div class="power-device-row"
          role="listitem" tabindex="0"
          style="--circuit-color:${d}"
          aria-label="${p}: ${s?(u?"on":"off")+", ":""}${null!=n?Math.round(n)+" watts":"unknown"}">
          ${s?this._renderTrackToggle(u,`Toggle ${p}`,()=>{this._powerToggleLimiter.allow()&&this._handleToggle(s.entity.entity_id)}):""}
          <span class="power-device-name">${p}</span>
          <div class="power-device-stats">
            ${this._renderClickableValue(m,`View ${p} power: ${null!=n?Math.round(n)+" watts":"unknown"}`,r.qy`<span class="power-device-watts" style="color:${d}">${this._formatWatts(n)}</span>`)}
            ${null!=o?this._renderClickableValue(h,`View ${p} energy: ${o.toFixed(1)} kWh`,r.qy`<span class="power-device-energy">${this._formatEnergy(o)}</span>`):""}
          </div>
        </div>
      `}_renderPowerStrip(e,t){const a=this._shortDeviceName(e.device)||"Power Strip",{powerSensors:i,switches:s}=this._partitionPowerEntities(e.entities),n=i.reduce((e,t)=>e+(parseFloat(t.state?.state)||0),0),o=this._config?.power_thresholds||{},c=(0,l.XI)(n,o),d=s[0];return r.qy`
        <div class="power-strip-block" role="listitem">
          <div class="power-strip-header" role="heading" aria-level="5">
            <span class="power-strip-name">${a}</span>
            ${d?this._renderTrackToggle("on"===d.state?.state,`Master toggle ${a}`,()=>{this._powerToggleLimiter.allow()&&this._handleToggle(d.entity.entity_id)}):""}
            <span class="power-strip-total" style="color:${c}">TOTAL: ${this._formatWatts(n)}</span>
          </div>
          <div class="power-strip-divider" aria-hidden="true"></div>
          <div class="power-strip-children" role="list" aria-label="${a} outlets">
            ${t.map(e=>this._renderStripChild(e,s))}
          </div>
        </div>
      `}_renderStripChild(e,t){const a=this._shortDeviceName(e.device)||"Outlet",{switches:i,powerSensors:s,energySensors:n}=this._partitionPowerEntities(e.entities),o=s[0]&&parseFloat(s[0].state?.state)||0,c=n[0]&&parseFloat(n[0].state?.state)||null,d=this._config?.power_thresholds||{},p=(0,l.XI)(o,d),u=s[0]?.entity?.entity_id,m=n[0]?.entity?.entity_id;let h=i[0];if(!h&&t?.length>0){const a=(e.device?.name||"").toLowerCase().replace(/[\s\-_]+/g,"");h=t.find(e=>{const t=(e.entity?.entity_id||"").toLowerCase().replace(/[\s\-_]+/g,""),r=(e.state?.attributes?.friendly_name||"").toLowerCase().replace(/[\s\-_]+/g,"");return t.includes(a)||r.includes(a)})}const f="on"===h?.state?.state;return r.qy`
        <div class="power-strip-child-tile" style="--tile-power-color:${p}"
          role="listitem" aria-label="${a}: ${f?"on":"off"}, ${Math.round(o)} watts">
          <span class="circuit-name">${a}</span>
          <div class="strip-child-controls">
            ${h?this._renderTrackToggle(f,`Toggle ${a}`,()=>{this._powerToggleLimiter.allow()&&this._handleToggle(h.entity.entity_id)}):""}
            ${this._renderClickableValue(u,`View ${a} power: ${Math.round(o)} watts`,r.qy`
              <span class="circuit-watts" style="color:${p}">
                <span class="power-dot" ?data-zero=${0===o} aria-hidden="true"></span>
                ${this._formatWatts(o)}
              </span>
            `)}
            ${null!=c?this._renderClickableValue(m,`View ${a} energy: ${c.toFixed(1)} kWh`,r.qy`<span class="power-device-energy">${this._formatEnergy(c)}</span>`):""}
          </div>
        </div>
      `}_renderPowerSummaryCard(e,t,a,i,s){const n=this._config?.power_thresholds||{},o="TOTAL USAGE"===e?(0,l.XI)(t,n):i;return r.qy`
        <div class="power-summary-card" role="status"
          style="--card-accent:${i}"
          aria-label="${e}: ${null!=t?Math.round(t)+" watts":"unavailable"}${null!=a?", "+a.toFixed(1)+" kilowatt hours today":""}"
          aria-live="polite">
          <span class="power-summary-label">
            <ha-icon icon="${s}" style="--mdc-icon-size:14px; vertical-align:middle; color:${i}"></ha-icon>
            ${e}
          </span>
          <span class="power-summary-value" style="color:${o}">
            ${this._formatWatts(t)}
          </span>
          ${null!=a?r.qy`
            <span class="power-summary-secondary">${this._formatEnergy(a)} TODAY</span>
          `:""}
        </div>
      `}_buildPowerCollection(e){const t=[],a=[],r=[];for(const i of e){const e=this._classifyPowerDevice(i.entities||[],i.device);"vue"===e?t.push(i):"strip"===e?r.push(i):a.push(i)}const i=new Set(r.map(e=>e.device?.id).filter(Boolean)),s=[],n=[];for(const e of r)e.device?.via_device_id&&i.has(e.device.via_device_id)?n.push(e):s.push({...e,subType:"strip"});const{strips:o,standalone:l}=this._groupPowerStrips([...s,...n,...a]),c=[];for(const[,e]of o)c.push({parent:e.parent,children:e.children||[]});const d=l,p=this._sortCircuits(this._detect240VPairs(t)),u=new Set;for(const{children:e}of c)for(const t of e)t.device?.id&&u.add(t.device.id);const m=/^(balance|total|main[s]?|net|whole[\s_-]?home)$/i,h=new Set;for(const e of p){const t=this._shortDeviceName(e.device)||"";m.test(t.trim())&&e.device?.id&&h.add(e.device.id)}const f=new Set;for(const t of e){const a=(t.device?.model||"").toLowerCase(),r=(t.device?.manufacturer||"").toLowerCase();(t.entities?.some(e=>"battery"===e.state?.attributes?.device_class||"sensor"===e.domain&&"battery"===(e.state?.attributes?.device_class||""))||a.includes("ups")||r.includes("ups")||r.includes("cyberpower")||r.includes("apc")||r.includes("tripp"))&&t.device?.id&&(e.some(e=>e!==t&&e.device?.via_device_id===t.device.id)&&f.add(t.device.id))}let v=0,g=0;for(const t of e){const e=t.device?.id;if(e&&h.has(e))continue;if(e&&f.has(e))continue;if(e&&u.has(e))continue;const a=this._getPrimaryPower(t),r=this._getPrimaryEnergy(t);null!=a&&(v+=a),null!=r&&(g+=r)}return{circuits:p,plugs:d,strips:c,totalWatts:v,totalEnergy:g||null,deviceCount:e.length}}_renderTrackToggle(e,t,a){return r.qy`
        <button class="lcars-track-toggle" ?data-on=${e}
          role="switch" aria-checked="${e}" aria-label="${t}"
          @click=${e=>{e.stopPropagation(),a()}}
          @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),a())}}>
          <span class="track-label">${e?"ON":"OFF"}</span>
          <span class="track-thumb" aria-hidden="true"></span>
        </button>
      `}_renderClickableValue(e,t,a){return e?r.qy`
        <span class="power-clickable-value"
          role="button" tabindex="0"
          aria-label="${t}"
          @click=${t=>{t.stopPropagation(),this._handleEntityClick(e)}}
          @keydown=${t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._handleEntityClick(e))}}>
          ${a}
        </span>
      `:a}_renderConsolidatedPowerArc(e){const t=[];for(const a of e.circuits)t.push({device:a.device,entities:a.entities,combinedWatts:null!=a.combinedWatts?a.combinedWatts:this._getPrimaryPower(a),combinedEnergy:a.combinedEnergy});for(const a of e.plugs)t.push({device:a.device,entities:a.entities,combinedWatts:this._getPrimaryPower(a)});for(const{parent:a}of e.strips)t.push({device:a.device,entities:a.entities,combinedWatts:this._getPrimaryPower(a)});return this._renderPowerArc(t,e.totalWatts)}_renderConsolidatedPowerPanel(e){const{circuits:t,plugs:a,strips:i,totalWatts:s,totalEnergy:n,deviceCount:o}=e,c=this._config?.power_thresholds||{},d=(0,l.XI)(s,c),p=null!=s&&Math.abs(s)>(c.highMax||3e3),u=t.length+a.length+i.length,m=[];t.length>0&&m.push(`${t.length} CIRCUIT${1!==t.length?"S":""}`),a.length>0&&m.push(`${a.length} DEVICE${1!==a.length?"S":""}`),i.length>0&&m.push(`${i.length} STRIP${1!==i.length?"S":""}`);const h=m.join(" · ")||"POWER SYSTEMS";this._expandedPowerSections=this._expandedPowerSections||new Set;const f=this._expandedPowerSections.has("circuits"),v=f?t:t.slice(0,12),g=t.length>12,b=this._expandedPowerSections.has("plugs"),y=b?a:a.slice(0,12),_=a.length>12;return r.qy`
        <div class="lcars-consolidated-power-panel" data-panel-type="power"
          data-alert="${p?"critical":""}"
          role="region" aria-label="Power Systems — ${h}">

          <!-- Header -->
          <div class="consolidated-power-header" role="heading" aria-level="3">
            <ha-icon icon="mdi:flash"></ha-icon>
            <span class="power-panel-name">POWER SYSTEMS</span>
            <div class="power-panel-header-line" aria-hidden="true"></div>
            <span class="power-panel-badge">${h}</span>
          </div>

          <!-- Summary -->
          <div class="power-summary" role="group" aria-label="Power Summary">
            ${this._renderPowerSummaryCard("TOTAL USAGE",s,n,d,"mdi:sigma")}
          </div>

          <!-- SVG Arc (when 3+ sources) -->
          ${u>=3?this._renderConsolidatedPowerArc(e):""}

          <!-- Circuits section -->
          ${t.length>0?r.qy`
            <div class="power-circuits-section">
              <div class="power-section-label" role="heading" aria-level="4">
                <span class="power-section-label-text">CIRCUITS</span>
                <div class="power-section-label-rule" aria-hidden="true"></div>
                <span class="power-section-label-count">${t.length}</span>
              </div>
              <div class="power-circuits" role="list" aria-label="Circuit monitors${g&&!f?", showing first 12, expandable":""}">
                ${v.map(e=>this._renderCircuitTile(e))}
              </div>
              ${g&&!f?r.qy`
                <button class="power-show-all-pill"
                  aria-label="Show all ${t.length} circuits"
                  @click=${()=>{this._expandedPowerSections.add("circuits"),this.requestUpdate()}}>
                  SHOW ALL (${t.length})
                </button>
              `:""}
            </div>
          `:""}

          <!-- Monitored Devices section -->
          ${a.length>0?r.qy`
            <div class="power-devices-section">
              <div class="power-section-label" role="heading" aria-level="4">
                <span class="power-section-label-text">MONITORED DEVICES</span>
                <div class="power-section-label-rule" aria-hidden="true"></div>
                <span class="power-section-label-count">${a.length}</span>
              </div>
              <div class="power-devices" role="list" aria-label="Monitored devices${_&&!b?", showing first 12, expandable":""}">
                ${y.map(e=>this._renderPowerDeviceRow(e))}
              </div>
              ${_&&!b?r.qy`
                <button class="power-show-all-pill"
                  aria-label="Show all ${a.length} devices"
                  @click=${()=>{this._expandedPowerSections.add("plugs"),this.requestUpdate()}}>
                  SHOW ALL (${a.length})
                </button>
              `:""}
            </div>
          `:""}

          <!-- Power Strips section -->
          ${i.length>0?r.qy`
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
      `}_renderPowerPanel(e){const t=e.entities||[],a=this._shortDeviceName(e.device)||"Power",i=this._config?.power_thresholds||{},s=this._classifyPowerDevice(t,e.device),{powerSensors:n,energySensors:o,switches:c}=this._partitionPowerEntities(t),d=this._getPrimaryPower(e),p=this._getPrimaryEnergy(e),u=(0,l.XI)(d,i),m=null!=d&&Math.abs(d)>(i.highMax||3e3),h="vue"===s?[e]:[],f=this._sortCircuits(this._detect240VPairs(h)),v=d||0,g=f.length>0,b=(c.length,"plug"===s),y="strip"===s;return r.qy`
        <div class="lcars-device-panel power-panel" data-panel-type="power"
          data-alert="${m?"critical":""}"
          role="region" aria-label="${a} Power Systems">

          <!-- Header -->
          <div class="power-panel-header" role="heading" aria-level="3">
            <ha-icon icon="mdi:flash"></ha-icon>
            <span class="power-panel-name">${a}</span>
            <div class="power-panel-header-line" aria-hidden="true"></div>
            <span class="power-panel-badge">POWER SYSTEMS</span>
            <span class="panel-numeric-code" aria-hidden="true">${this._generatePanelCode(t[0]?.entity?.entity_id||e.device?.id||"power")}</span>
          </div>

          <!-- SVG Arc (for multi-circuit devices) -->
          ${g&&f.length>1?this._renderPowerArc(f,v):""}

          <!-- Summary -->
          <div class="power-summary" role="group" aria-label="Power Summary">
            ${this._renderPowerSummaryCard("TOTAL USAGE",v,p,u,"mdi:sigma")}
          </div>

          <!-- Circuits section (Vue-type) -->
          ${g?r.qy`
            <div class="power-circuits-section">
              <div class="power-section-label" role="heading" aria-level="4">
                <span class="power-section-label-text">CIRCUITS</span>
                <div class="power-section-label-rule" aria-hidden="true"></div>
                <span class="power-section-label-count">${f.length}/${f.length}</span>
              </div>
              <div class="power-circuits" role="list" aria-label="Circuit Monitors">
                ${f.map(e=>this._renderCircuitTile(e))}
              </div>
            </div>
          `:""}

          <!-- Device row (plug-type with switch) -->
          ${b?r.qy`
            <div class="power-devices-section">
              <div class="power-section-label" role="heading" aria-level="4">
                <span class="power-section-label-text">MONITORED DEVICES</span>
                <div class="power-section-label-rule" aria-hidden="true"></div>
                <span class="power-section-label-count">1/1</span>
              </div>
              <div class="power-devices" role="list" aria-label="Monitored Devices">
                ${this._renderPowerDeviceRow(e)}
              </div>
            </div>
          `:""}

          <!-- Strip rendering -->
          ${y?r.qy`
            <div class="power-strips-section">
              <div class="power-section-label" role="heading" aria-level="4">
                <span class="power-section-label-text">POWER STRIPS</span>
                <div class="power-section-label-rule" aria-hidden="true"></div>
              </div>
              <div class="power-strips" role="list" aria-label="Power Strips">
                ${this._renderPowerStrip(e,[])}
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
      `}_renderedAlarmDeviceIds=new Set;_getAlarmBadgeForArea(e,t){for(const e of t){const t=e.entity_id.split(".")[0];if(!o.yS.has(t))continue;const a=this._hass?.states?.[e.entity_id];if(!a)continue;const r=e.device_id;if(r&&this._renderedAlarmDeviceIds.has(r))return{entity:e,domain:t,state:a}}return null}_findAlarmPrimaryArea(e){const t=this._hass?.entities||{};for(const[a,r]of Object.entries(t))if(r.device_id===e&&a.startsWith("alarm_control_panel.")){if(r.area_id)return r.area_id;const t=this._hass.devices?.[e];return t?.area_id||null}return null}_navigateToAlarmArea(e){const t=e?.entity?.device_id;if(!t)return;const a=this._findAlarmPrimaryArea(t);a&&(this.selectedArea=a,this.selectedFloor=null,this.requestUpdate())}_renderAreaContent(e,t){if(0===e.length)return r.qy`<div class="lcars-empty" role="status">No entities in this area</div>`;const{byDevice:a,noDevice:i}=this._groupEntities(e),s=e.map(e=>{const t=e.entity_id.split(".")[0],a=this._hass?.states?.[e.entity_id];return{entity:e,domain:t,state:a}}).filter(e=>e.state).filter(e=>!(0,o.JM)(e)),n=(0,o.US)(this._hass,t,s),l=[];for(const e of n){const a=he.get(e);if(a){if(e===o.QQ)for(const e of s)o.yS.has(e.domain)&&e.entity?.device_id&&this._renderedAlarmDeviceIds.add(e.entity.device_id);l.push({panelType:e,template:a({entities:s,areaId:t},this._hass,this._editMode,this._config)})}}const c=this._buildAreaPanelFilter(n,s);if(c)for(const[e,t]of a)t.entities=t.entities.filter(e=>!c(e)),0===t.entities.length&&a.delete(e);const d=c?i.filter(e=>!c(e)):i,p=new Set;n.has(o.QQ)&&(p.add(o.uk),p.add(o.QQ)),n.has(o.Lx)&&p.add(o.Lx);const u=[],m=[],h=[];for(const e of a.values()){const t=this._getDevicePanelType(e.entities);t&&p.has(t)||(t===o.S?h.push({...e,panelType:t}):t?u.push({...e,panelType:t}):m.push(e))}const f=e=>e.filter(e=>!o.iU.has(e.domain)&&!(0,o.JM)(e)),v=r.qy`
        ${m.map(e=>{const t=f(e.entities);return 0===t.length?"":r.qy`
          <div class="device-group">
            <div class="device-header">
              <h3 class="device-name">${this._shortDeviceName(e.device)}</h3>
              <div class="device-line"></div>
              ${this._editMode?r.qy`
                <div class="device-edit-pip" tabindex="0" role="button" aria-label="Edit device"
                  @click=${t=>this._handleEditDevice(t,e.device.id)}
                  @keydown=${t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._handleEditDevice(t,e.device.id))}}></div>
              `:""}
            </div>
            ${this._renderDomainGroups(t)}
          </div>
        `})}
        ${(()=>{const e=f(d);return e.length>0?r.qy`
            <div class="device-group">
              <lcars-section-divider label="AUXILIARY SYSTEMS" style="--divider-color: var(--lcars-gray)"></lcars-section-divider>
              ${this._renderDomainGroups(e)}
            </div>
          `:""})()}
      `,g=h.length>0?r.qy`<lcars-power-panel .powerGroups=${h} .hass=${this._hass} .editMode=${this._editMode} .config=${this._config}></lcars-power-panel>`:"",b=[...u.map(e=>{const t=e.device?.name_by_user||e.device?.name||"";return{panelType:e.panelType,panelId:`${e.panelType}:${e.device?.id||""}`,label:t||e.panelType.replace(/_/g," "),deviceId:e.device?.id||null,template:this._renderDevicePanel(e.panelType,e)}}),...l.map(e=>({...e,panelId:e.panelType,label:e.panelType.replace(/_/g," "),deviceId:null}))],y=this._editMode?b.map(e=>({...e,template:r.qy`
              <div class="panel-order-wrapper">
                ${e.template}
                <div class="panel-order-pip" tabindex="0" role="button"
                  aria-label="Reorder ${e.label} panel"
                  @click=${a=>this._handlePanelReorder(a,t,e.panelId,b)}
                  @keydown=${a=>{"Enter"!==a.key&&" "!==a.key||(a.preventDefault(),this._handlePanelReorder(a,t,e.panelId,b))}}>
                  <ha-icon icon="mdi:swap-vertical" style="--mdc-icon-size: 14px;"></ha-icon>
                </div>
              </div>
            `})):b;if(0===y.length&&0===h.length)return r.qy`${v}${g}`;const _=this.data?.panel_column_overrides?.[t]||{},w=[],x=[];for(const e of y)"right"===(_[e.panelId]||_[e.panelType]||o.uC[e.panelType]||"left")?x.push(e):w.push(e);w.sort((e,t)=>(o.R2[e.panelType]??99)-(o.R2[t.panelType]??99)),x.sort((e,t)=>(o.R2[e.panelType]??99)-(o.R2[t.panelType]??99));const $=this.data?.panel_overrides?.[t];if(Array.isArray($)&&$.length>0){const e=e=>{let t=$.indexOf(e.panelId);return t<0&&(t=$.indexOf(e.panelType)),t>=0?t:999};w.sort((t,a)=>e(t)-e(a)),x.sort((t,a)=>e(t)-e(a))}const k=w.find(e=>e.panelType===o.sv),S=w.filter(e=>e.panelType!==o.sv),C=r.qy`
        <div class="area-split-main" role="region" aria-label="Device controls">
          ${v}
          ${S.map(e=>e.template)}
          ${g}
        </div>
      `;return 0===x.length?r.qy`
        ${k?r.qy`<div class="area-illumination-full">${k.template}</div>`:""}
        ${C}
      `:r.qy`
        ${k?r.qy`<div class="area-illumination-full">${k.template}</div>`:""}
        <div class="area-split-layout">
          ${C}
          <div class="area-split-panels" role="region" aria-label="System panels">
            ${x.map(e=>e.template)}
          </div>
        </div>
      `}_buildAreaPanelFilter(e,t){if(0===e.size)return null;const a=[];if(e.has(o.sv)){a.push(o.eX);const e=new Set;for(const a of t){const t=a.state?.attributes?.device_class||"",r=a.entity?.entity_id||"";(o.lo.has(t)||"sensor"===a.domain&&o.Rv.test(r))&&a.entity?.device_id&&e.add(a.entity.device_id)}a.push(t=>"fan"===t.domain&&!e.has(t.entity?.device_id))}if(e.has(o.QQ)){const e=new Set;for(const a of t)o.aE.has(a.domain)&&a.entity?.device_id&&e.add(a.entity.device_id);a.push(t=>{if(t.entity?.device_id&&e.has(t.entity.device_id)){const e=t.state?.attributes?.device_class||"";if(["motion","occupancy"].includes(e))return!1}return(0,o.XY)(t)});const r=new Set;for(const a of t)a.entity?.device_id&&!e.has(a.entity.device_id)&&(0,o.XY)(a)&&r.add(a.entity.device_id);const i=new Set(["battery","illuminance","light"]);a.push(e=>{if(!e.entity?.device_id||!r.has(e.entity.device_id))return!1;const t=e.state?.attributes?.device_class||"";return i.has(t)})}return e.has(o.Lx)&&a.push(e=>o.TL.has(e.domain)||"remote"===e.domain),e.has(o.Z)&&a.push(o.Ax),0===a.length?null:e=>a.some(t=>t(e))}_renderDomainGroups(e){const t=this._groupByDomain(e);return r.qy`${t.map(([e,t])=>r.qy`
        <div class="domain-label" role="heading" aria-level="4">${o.xU[e]||e}</div>
        ${this._renderDomainEntities(e,t)}
      `)}`}_renderDomainEntities(e,t){return o.aE.has(e)?this._renderCameras(t):o.Zz.has(e)?this._renderToggles(t):o.ge.has(e)?this._renderClimates(t):o.K5.has(e)?this._renderCovers(t):o.TL.has(e)?this._renderMedia(t):o.Xt.has(e)?this._renderSensors(t):this._renderGeneric(t)}_renderCameras(e){return r.qy`<div class="camera-grid">
        ${e.map(({entity:e,state:t},a)=>{const i=this._friendlyName(t,e),s=this._isOff(t),n=fe(t),o=s||!n?"offline":"connecting",l=s?this._formatCamTimeSince(t?.last_changed):"";return r.qy`
            <div class="camera-frame" data-state="${o}" style="--i:${a}"
              role="button"
              tabindex="0"
              aria-label="${i} camera: ${s?"viewscreen offline":t.state}"
              aria-busy="${"connecting"===o}"
              @click=${()=>this._handleEntityClick(e.entity_id)}
              @keydown=${t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._handleEntityClick(e.entity_id))}}>
              <div class="camera-connecting-overlay" aria-hidden="true">
                <span class="camera-connecting-text">ESTABLISHING LINK</span>
              </div>
              <div class="camera-offline-overlay" aria-hidden="true">
                <ha-icon icon="mdi:video-off"></ha-icon>
                <span class="camera-offline-text">VIEWSCREEN OFFLINE</span>
                ${l?r.qy`<span class="camera-last-signal">${l}</span>`:""}
              </div>
              ${n?r.qy`<img src="${n}" alt="${i}"
                            data-entity="${e.entity_id}"
                            .src=${n}
                            @load=${e=>{const t=e.target.closest(".camera-frame");t&&(t.setAttribute("data-state","live"),t.removeAttribute("aria-busy"))}}
                            @error=${e=>{const t=e.target.closest(".camera-frame");t&&(t.setAttribute("data-state","offline"),t.removeAttribute("aria-busy"))}} />`:r.qy`<div class="camera-spacer"></div>`}
              <div class="camera-label">
                <ha-icon icon="mdi:video"></ha-icon>
                <span>${i}</span>
                <span class="cam-state">${t.state}</span>
              </div>
            </div>
          `})}
      </div>`}_renderToggles(e){return r.qy`<div class="toggle-grid">
        ${e.map(({entity:e,state:t},a)=>{const i=this._friendlyName(t,e),s="on"===t.state||"unlocked"===t.state||"playing"===t.state,n=this._isOff(t),o=e.entity_id.split(".")[0],l=t.attributes?.brightness,c=l?Math.round(l/255*100):0;return this._withEditPip(e.entity_id,r.qy`
            <button class="toggle-pill" ?data-on=${s} ?data-off=${n} style="--i:${a}"
              role="switch"
              aria-checked=${s}
              aria-label="${i}: ${t.state}${l?` (${c}%)`:""}"
              @click=${t=>{t.stopPropagation(),this._handleToggle(e.entity_id)}}
              @dblclick=${()=>this._handleEntityClick(e.entity_id)}
              title="${i}: ${t.state}${l?` (${c}%)`:""}">
              <ha-icon .icon=${this._getEntityIcon(t)}></ha-icon>
              <span class="toggle-name">${i}</span>
              ${"light"===o&&l&&s?r.qy`
                <div class="brightness-bar">
                  <div class="brightness-fill" style="width:${c}%"></div>
                </div>
              `:""}
              <span class="toggle-state">${t.state}</span>
              <div class="toggle-switch"></div>
            </button>
          `)})}
      </div>`}_renderSensors(e){return r.qy`<div class="sensor-grid">
        ${e.map(({entity:e,state:t},a)=>{const i=this._friendlyName(t,e),s=this._isOff(t),n=t.attributes?.unit_of_measurement||"",{text:o}=(0,c.kp)(t,e?.entity_category||""),l=parseFloat(t.state),d=(e.entity_id.includes("battery")||"battery"===t.attributes?.device_class)&&!isNaN(l)&&l<20;return this._withEditPip(e.entity_id,r.qy`
            <button class="sensor-readout" ?data-off=${s} ?data-warn=${d} style="--i:${a}"
              @click=${()=>this._handleEntityClick(e.entity_id)}
              title="${i}: ${o} ${n}">
              <ha-icon .icon=${this._getEntityIcon(t)}></ha-icon>
              <span class="sensor-name">${i}</span>
              ${this._renderSensorBar(t)}
              <span class="sensor-value">${o}</span>
              ${n?r.qy`<span class="sensor-unit">${n}</span>`:""}
            </button>
          `)})}
      </div>`}_renderClimates(e){return r.qy`<div class="climate-grid">
        ${e.map(({entity:e,state:t},a)=>{const i=this._friendlyName(t,e),s=t.state,n=t.attributes?.current_temperature,o=t.attributes?.temperature,l=t.attributes?.temperature_unit||"°",c="heat"===s||"heat_cool"===s,d="cool"===s,p="off"===s;return this._withEditPip(e.entity_id,r.qy`
            <button class="climate-panel" ?data-heat=${c} ?data-cool=${d} ?data-off=${p} style="--i:${a}"
              @click=${()=>this._handleEntityClick(e.entity_id)}
              title="${i}: ${s}">
              <ha-icon .icon=${this._getEntityIcon(t)}></ha-icon>
              <div class="climate-info">
                <span class="climate-name">${i}</span>
                <div class="climate-temps">
                  ${null!=n?r.qy`<span class="climate-current">${n}${l}</span>`:""}
                  ${null!=o?r.qy`<span class="climate-target">→ ${o}${l}</span>`:""}
                </div>
              </div>
              <span class="climate-mode">${s}</span>
            </button>
          `)})}
      </div>`}_renderCovers(e){return r.qy`<div class="cover-grid">
        ${e.map(({entity:e,state:t},a)=>{const i=this._friendlyName(t,e),s="closed"===t.state,n=t.attributes?.current_position;return this._withEditPip(e.entity_id,r.qy`
            <button class="cover-panel" ?data-off=${s} style="--i:${a}"
              @click=${()=>this._handleEntityClick(e.entity_id)}
              title="${i}: ${t.state}">
              <ha-icon .icon=${this._getEntityIcon(t)}></ha-icon>
              <span class="cover-name">${i}</span>
              ${null!=n?r.qy`<span class="cover-position">${n}%</span>`:""}
            </button>
          `)})}
      </div>`}_renderMedia(e){return r.qy`<div class="media-grid">
        ${e.map(({entity:e,state:t},a)=>{const i=this._friendlyName(t,e),s=this._isOff(t),n=[t.attributes?.media_title||"",t.attributes?.media_artist||""].filter(Boolean).join(" — ");return this._withEditPip(e.entity_id,r.qy`
            <button class="media-strip" ?data-off=${s} style="--i:${a}"
              @click=${()=>this._handleEntityClick(e.entity_id)}
              title="${i}: ${t.state}">
              <ha-icon .icon=${this._getEntityIcon(t)}></ha-icon>
              <div class="media-info">
                <div class="media-name">${i}</div>
                ${n?r.qy`<div class="media-title">${n}</div>`:""}
              </div>
              <span class="media-state">${t.state}</span>
            </button>
          `)})}
      </div>`}_renderGeneric(e){return r.qy`<div class="entity-grid">
        ${e.map(({entity:e,state:t},a)=>{const i=this._friendlyName(t,e),s=this._isOff(t);return this._withEditPip(e.entity_id,r.qy`
            <button class="entity-btn" ?data-off=${s} style="--i:${a}"
              @click=${()=>this._handleEntityClick(e.entity_id)}
              title="${i}: ${t.state}">
              <ha-icon .icon=${this._getEntityIcon(t)}></ha-icon>
              <span class="entity-name">${i}</span>
              <span class="entity-state">${t.state}</span>
            </button>
          `)})}
      </div>`}getCardSize(){return 6}}customElements.get("homepage-card")?n.g0.warn(me,"Custom element homepage-card already registered — skipping"):(customElements.define("homepage-card",ve),n.g0.debug(me,"Custom element registered: homepage-card"))},6888(e,t,a){var r=a(7349),i=a(2622),s=a(8851);class n extends r.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object},_expanded:{type:Boolean}}}constructor(){super(),this._expanded=!1}set hass(e){this._hass=e}setConfig(e){this._config=e}_toggle(){this._expanded=!this._expanded}_getWeatherEntity(){if(!this._hass)return null;const e=Object.keys(this._hass.states).filter(e=>e.startsWith("weather."));return e.length>0?this._hass.states[e[0]]:null}_getPersonEntities(){return this._hass?Object.keys(this._hass.states).filter(e=>e.startsWith("person.")).map(e=>this._hass.states[e]):[]}static get styles(){return[i.Bx,r.AH`
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
        `]}render(){if(!this._hass)return r.qy``;const e=this._getWeatherEntity(),t=this._getPersonEntities();return r.qy`
        <button class="info-header" @click=${this._toggle} aria-expanded=${this._expanded}>
          <ha-icon icon="mdi:home-analytics"></ha-icon>
          <span class="info-label">House Information</span>
          ${e?r.qy`<span>${e.state} ${e.attributes.temperature||""}°</span>`:""}
        </button>

        <div class="info-body" ?data-open=${this._expanded}>
          <div class="info-grid">
            ${e?r.qy`
                  <button
                    class="info-tile"
                    @click=${()=>(0,s.Hv)(e.entity_id)}
                  >
                    <div class="info-tile-label">Weather</div>
                    <div class="info-tile-value">
                      ${e.state} ${e.attributes.temperature||""}°
                    </div>
                  </button>
                  <button
                    class="info-tile"
                    @click=${()=>(0,s.Hv)(e.entity_id)}
                  >
                    <div class="info-tile-label">Humidity</div>
                    <div class="info-tile-value">
                      ${e.attributes.humidity||"--"}%
                    </div>
                  </button>
                `:""}

            ${t.map(e=>r.qy`
                <button
                  class="info-tile"
                  @click=${()=>(0,s.Hv)(e.entity_id)}
                >
                  <div class="info-tile-label">
                    ${e.attributes?.friendly_name||e.entity_id.split(".").pop()}
                  </div>
                  <div class="info-tile-value">${e.state}</div>
                </button>
              `)}
          </div>
        </div>
      `}getCardSize(){return this._expanded?4:1}}customElements.get("lcars-house-information-card")||customElements.define("lcars-house-information-card",n)},4459(e,t,a){var r=a(7349),i=a(2622),s=a(8851);class n extends r.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object}}}set hass(e){this._hass=e}setConfig(e){this._config=e}static get styles(){return[i.Bx,r.AH`
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
        `]}render(){if(!this._hass)return r.qy``;const e=Object.keys(this._hass.states).filter(e=>e.startsWith("sensor.")).slice(0,20).map(e=>this._hass.states[e]);return r.qy`
        <div class="detail-grid">
          ${e.map(e=>r.qy`
              <button
                class="detail-tile"
                @click=${()=>(0,s.Hv)(e.entity_id)}
              >
                <div class="detail-label">
                  ${e.attributes?.friendly_name||e.entity_id.split(".").pop().replace(/_/g," ")}
                </div>
                <div class="detail-value">
                  ${e.state}${e.attributes?.unit_of_measurement?` ${e.attributes.unit_of_measurement}`:""}
                </div>
              </button>
            `)}
        </div>
      `}getCardSize(){return 4}}customElements.get("lcars-house-information-more-info-card")||customElements.define("lcars-house-information-more-info-card",n)},4338(e,t,a){var r=a(7349),i=a(8851),s=a(2622),n=a(7597),o=a(6930),l=a(4867),c=a(6940);a(3801),a(58);class d extends r.WF{static get properties(){return{hass:{type:Object},_config:{type:Object},filter:{type:String},editMode:{type:Boolean}}}constructor(){super(),this.hass=null,this._config={},this.filter="all",this.editMode=!1,this._entityCache=new Map,this._onFilter=e=>{this.filter=e.detail.filter},this._onEdit=e=>{this.editMode=e.detail.enabled}}connectedCallback(){super.connectedCallback(),i.o6.addEventListener("lcars-ilm-filter",this._onFilter),i.o6.addEventListener("lcars-ilm-edit",this._onEdit)}disconnectedCallback(){super.disconnectedCallback(),i.o6.removeEventListener("lcars-ilm-filter",this._onFilter),i.o6.removeEventListener("lcars-ilm-edit",this._onEdit)}setConfig(e){this._config=e||{}}set hass(e){const t=this._hass;this._hass=e,e&&t!==e&&(this._entityCache.clear(),this.requestUpdate("hass",t))}get hass(){return this._hass}getCardSize(){return 12}_getAreasWithLighting(){if(!this._hass)return[];const e=(0,n.Qn)(this._hass),t=(0,n.E3)(this._hass),a=[];for(const r of e){const e=t.get(r.floor_id)||[],i=[];for(const t of e){const e=this._resolveAreaEntities(t);e&&i.push(e)}i.length>0&&a.push({floor:r,areas:i})}const r=t.get(null)||[],i=[];for(const e of r){const t=this._resolveAreaEntities(e);t&&i.push(t)}return i.length>0&&a.push({floor:null,areas:i}),a}_resolveAreaEntities(e){const t=(0,o.d6)(this._hass,e.area_id,this._entityCache),a=[];for(const e of t){const t=e.entity_id.split(".")[0],r=this._hass.states?.[e.entity_id];if(!r)continue;const i={entity:e,domain:t,state:r};(0,l.JM)(i)||a.push(i)}const r=a.filter(e=>(0,l.eX)(e)||"scene"===e.domain);if(0===r.length)return null;const i=r.filter(e=>"light"===e.domain),s=r.filter(e=>"light"!==e.domain&&"scene"!==e.domain),n=r.filter(e=>"scene"===e.domain);return{area:e,lightEntities:r,lights:i,circuits:s,scenes:n}}_getFilteredEntities(e){if("lights"===this.filter){const t=[...e.lights,...e.scenes];return t.length>0?t:null}return"circuits"===this.filter?e.circuits.length>0?e.circuits:null:e.lightEntities}_getGlobalCounts(e){let t=0,a=0,r=0,i=0;for(const{areas:s}of e)for(const{lights:e,circuits:n}of s){for(const r of e)a++,"on"===r.state?.state&&t++;for(const e of n)i++,"on"===e.state?.state&&r++}return{lightsActive:t,lightsTotal:a,circuitsActive:r,circuitsTotal:i,totalActive:t+r,totalAll:a+i}}_getGlobalCountsForLayout(){const e=this._getAreasWithLighting();return this._getGlobalCounts(e)}_getAreaLightState(e){const t=e.filter(e=>"scene"!==e.domain);if(0===t.length)return"empty";const a=t.filter(e=>"on"===e.state?.state).length;return 0===a?"off":a===t.length?"on":"mixed"}_toggleAreaLights(e){const t=e.filter(e=>"scene"!==e.domain);if(0===t.length)return;const a=t.every(e=>"on"===e.state?.state),r=a?"turn_off":"turn_on";for(const e of t)this._hass.callService("homeassistant",r,{entity_id:e.entity.entity_id});c.e.play(a?"switchToggle":"lightToggle")}render(){if(!this._hass)return r.qy``;const e=this._getAreasWithLighting();return r.qy`
      <div class="ilm-dashboard">
        ${e.map(({floor:e,areas:t})=>{const a=t.filter(e=>null!==this._getFilteredEntities(e));return 0===a.length?r.qy``:r.qy`
            ${e?r.qy`
              <div class="ilm-floor-header">
                <span class="ilm-floor-name">${e.name||"FLOOR"}</span>
                <span class="ilm-floor-line"></span>
              </div>
            `:""}
            ${a.map(e=>{const t=this._getFilteredEntities(e);return r.qy`
                <div class="ilm-area-section" data-area-id="${e.area.area_id}">
                  <div class="ilm-area-header">
                    <span class="ilm-area-name">${e.area.name}</span>
                    <span class="ilm-area-line"></span>
                    ${this._renderScenePills(e.scenes)}
                    ${this._renderMasterToggle(t,e.area)}
                  </div>
                  <lcars-illumination-panel
                    .hass=${this._hass}
                    .entities=${t}
                    .filter=${this.filter}
                    .editMode=${this.editMode}
                    area-id="${e.area.area_id}">
                  </lcars-illumination-panel>
                </div>
              `})}
          `})}

        ${0===e.length?r.qy`
          <div class="ilm-empty">
            <span>NO LIGHTING DEVICES DETECTED</span>
          </div>
        `:""}
      </div>
    `}_renderMasterToggle(e,t){const a=this._getAreaLightState(e);if("empty"===a)return r.qy``;const i="on"===a||"mixed"===a;return r.qy`
      <button
        class="ilm-master-btn ${i?"active":""}"
        aria-pressed="${i?"true":"false"}"
        aria-label="Toggle all lights in ${t.name}"
        @click=${()=>this._toggleAreaLights(e)}>
        ${i?"ALL ON":"ALL OFF"}
      </button>
    `}_renderScenePills(e){return e&&0!==e.length?r.qy`
      <div class="ilm-scene-strip">
        ${e.map(e=>{const t=e.entity?.entity_id,a=(e.state?.attributes?.friendly_name||t||"").toUpperCase(),i=this.hass?.areas;let s=a;if(i)for(const e of Object.values(i))if(s.startsWith(e.name.toUpperCase())){s=s.slice(e.name.length).trim().replace(/^[-–:]\s*/,"");break}return r.qy`
            <button class="ilm-scene-pill"
                    aria-label="Activate ${s||a} scene"
                    @click=${()=>{this._hass&&(c.e.play("scriptFire"),this._hass.callService("scene","turn_on",{entity_id:t}))}}>
              ${s||a}
            </button>
          `})}
      </div>
    `:r.qy``}static get styles(){return[s.Bx,r.AH`
        :host { display: block; }
        .ilm-dashboard { padding: 0.25rem; }

        /* ─── Floor Header ─── */
        .ilm-floor-header {
          display: flex; align-items: center; gap: 0.5rem;
          margin: 1rem 0 0.5rem 0;
        }
        .ilm-floor-name {
          font-family: var(--lcars-font, 'Antonio', sans-serif);
          font-size: 1.25rem; color: var(--lcars-ice, #99ccff);
          text-transform: uppercase; letter-spacing: 0.08em; white-space: nowrap;
        }
        .ilm-floor-line {
          flex: 1; height: 0.375rem;
          background: var(--lcars-ice, #99ccff);
          border-radius: 0 1.5rem 1.5rem 0; opacity: 0.4;
        }

        /* ─── Area Section ─── */
        .ilm-area-section { margin-bottom: 0.75rem; }
        .ilm-area-header {
          display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;
        }
        .ilm-area-name {
          font-family: var(--lcars-font, 'Antonio', sans-serif);
          font-size: 1.25rem; color: var(--lcars-sunflower, #ffcc99);
          text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap;
        }
        .ilm-area-line {
          flex: 1; height: 2px;
          background: var(--lcars-sunflower, #ffcc99); opacity: 0.3;
        }

        /* ─── Master Toggle ─── */
        .ilm-master-btn {
          display: flex; align-items: center; justify-content: center;
          padding: 0.25rem 0.75rem; min-height: 2rem; border: none;
          border-radius: 0 var(--lcars-btn-radius, 1.5rem) var(--lcars-btn-radius, 1.5rem) 0;
          background: var(--lcars-gray, #666688);
          color: var(--lcars-space-white, #f5f6fa);
          font-family: var(--lcars-font, 'Antonio', sans-serif);
          font-size: 0.875rem; text-transform: uppercase;
          cursor: pointer; white-space: nowrap;
          transition: background 200ms ease, color 200ms ease;
          flex-shrink: 0;
        }
        .ilm-master-btn:hover { filter: brightness(1.2); }
        .ilm-master-btn:focus-visible {
          outline: 2px solid var(--lcars-ice, #99ccff); outline-offset: 2px;
        }
        .ilm-master-btn.active {
          background: var(--lcars-butterscotch, #ff9966);
          color: var(--lcars-black, #000);
        }

        /* ─── Scene Pill Strip ─── */
        .ilm-scene-strip {
          display: flex;
          gap: 0.25rem;
          flex-shrink: 1;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .ilm-scene-strip::-webkit-scrollbar { display: none; }

        .ilm-scene-pill {
          font-family: var(--lcars-font, 'Antonio', sans-serif);
          font-size: 0.875rem; text-transform: uppercase;
          color: var(--lcars-black, #000);
          background: var(--lcars-sunflower, #ffcc99);
          border: none;
          padding: 0.25rem 0.75rem;
          min-height: 2rem;
          border-radius: 0;
          cursor: pointer; white-space: nowrap;
          transition: filter 150ms ease;
          flex-shrink: 0;
        }
        .ilm-scene-pill:first-child {
          border-radius: var(--lcars-btn-radius, 1.5rem) 0 0 var(--lcars-btn-radius, 1.5rem);
        }
        .ilm-scene-pill:last-child {
          border-radius: 0;
        }
        .ilm-scene-pill:hover { filter: brightness(1.2); }
        .ilm-scene-pill:active { filter: brightness(0.8); }
        .ilm-scene-pill:focus-visible {
          outline: 2px solid var(--lcars-ice, #99ccff); outline-offset: 2px;
        }

        lcars-illumination-panel { --lcars-panel-margin: 0; }

        .ilm-empty {
          display: flex; align-items: center; justify-content: center;
          min-height: 10rem; color: var(--lcars-gray, #666688);
          font-family: var(--lcars-font, 'Antonio', sans-serif);
          font-size: 1.25rem; text-transform: uppercase;
        }
      `]}}customElements.get("illumination-card")||customElements.define("illumination-card",d)},1998(e,t,a){var r=a(7349),i=a(2622),s=a(8851),n=a(6940),o=a(5824);const l="all",c="lights",d="circuits";class p extends r.WF{static get properties(){return{cards:{type:Array},_hass:{type:Object},_config:{type:Object},_filter:{type:String},_siteName:{type:String},_audioMuted:{type:Boolean},_editMode:{type:Boolean}}}constructor(){super(),this.cards=[],this._hass=null,this._config={},this._filter=l,this._siteName="LCARS",this._audioMuted=n.e.isMuted,this._editMode=!1}setConfig(e){this._config=e}set hass(e){this._hass=e,(0,o.X)(e),e?.config?.location_name&&(this._siteName=e.config.location_name.toUpperCase()),this.cards&&this.cards.forEach(t=>{t&&(t.hass=e,t.filter=this._filter)})}_setFilter(e){this._filter=e,n.e.play("navAcknowledge"),s.o6.dispatchEvent(new CustomEvent("lcars-ilm-filter",{detail:{filter:e}}))}_toggleMute(){n.e.toggle(),this._audioMuted=n.e.isMuted}_openSidebarReorder(){if(!this._hass?.user?.is_admin)return;let e=this.shadowRoot.querySelector("lcars-sidebar-reorder");e||(e=document.createElement("lcars-sidebar-reorder"),this.shadowRoot.appendChild(e)),e.hass=this._hass,e.open()}_toggleEditMode(){this._editMode=!this._editMode,s.o6.dispatchEvent(new CustomEvent("lcars-ilm-edit",{detail:{enabled:this._editMode}}))}render(){const e=a(8330).version;return r.qy`
      <div class="lcars-frame">
        <!-- Top-Left Elbow -->
        <div class="lcars-elbow-top" aria-hidden="true"></div>

        <!-- Header Bar -->
        <div class="lcars-header" role="banner">
          <span class="lcars-header-title">${this._siteName}</span>
          <div class="lcars-header-bar" aria-hidden="true"></div>
          <div class="lcars-header-endcap">
            <button class="mute-btn"
              role="switch"
              aria-checked=${!this._audioMuted}
              aria-label="Dashboard sounds"
              @click=${()=>this._toggleMute()}>
              <ha-icon .icon=${this._audioMuted?"mdi:volume-off":"mdi:volume-high"}></ha-icon>
            </button>
            ${this._hass?.user?.is_admin?r.qy`
              <button class="mute-btn"
                aria-label="Reorder sidebar dashboards"
                @click=${()=>this._openSidebarReorder()}>
                <ha-icon .icon=${"mdi:sort-variant"}></ha-icon>
              </button>
              <button class="mute-btn"
                aria-pressed=${this._editMode}
                aria-label="${this._editMode?"Exit configuration mode":"Enter configuration mode"}"
                @click=${()=>this._toggleEditMode()}>
                <ha-icon .icon=${"mdi:cog-outline"}></ha-icon>
              </button>
            `:""}
          </div>
        </div>

        <!-- Sidebar: 3 Filter Buttons -->
        <nav class="lcars-sidebar" role="tablist" aria-label="Filter illumination devices">
          <div class="lcars-sidebar-panel">Illumination</div>

          <div class="lcars-sidebar-filters">
            <button class="sidebar-filter-btn ${this._filter===l?"active":""}"
                    role="tab"
                    aria-selected="${this._filter===l?"true":"false"}"
                    @click=${()=>this._setFilter(l)}>
              <span class="filter-label">ALL DEVICES</span>
            </button>
            <button class="sidebar-filter-btn ${this._filter===c?"active":""}"
                    role="tab"
                    aria-selected="${this._filter===c?"true":"false"}"
                    @click=${()=>this._setFilter(c)}>
              <span class="filter-label">LIGHTS</span>
            </button>
            <button class="sidebar-filter-btn ${this._filter===d?"active":""}"
                    role="tab"
                    aria-selected="${this._filter===d?"true":"false"}"
                    @click=${()=>this._setFilter(d)}>
              <span class="filter-label">CIRCUITS</span>
            </button>
          </div>
          <div class="lcars-sidebar-filler" aria-hidden="true"></div>
        </nav>

        <!-- Main Content -->
        <main class="lcars-content" id="lcars-main-content" aria-label="Illumination dashboard">
          ${this.cards&&this.cards.length>0?this.cards.map(e=>r.qy`${e}`):r.qy`<div class="lcars-heading">No data available</div>`}
        </main>

        <!-- Bottom-Left Elbow -->
        <div class="lcars-elbow-bottom" aria-hidden="true"></div>

        <!-- Footer Bar -->
        <div class="lcars-footer" role="contentinfo">
          <div class="lcars-footer-bar" aria-hidden="true"></div>
          <span class="lcars-footer-text">LCARS ${e}</span>
          <div class="lcars-footer-endcap" aria-hidden="true"></div>
        </div>
      </div>
    `}static get styles(){return[i.Bx,r.AH`
        :host {
          display: block;
          height: calc(100vh - var(--header-height, 0px));
          overflow: hidden;
          box-sizing: border-box;
          background: var(--lcars-bg, #000);
          padding: var(--lcars-gap, 0.25rem);
        }

        .lcars-frame {
          display: grid;
          grid-template-columns: var(--lcars-sidebar-w, 12rem) 1fr;
          grid-template-rows: var(--lcars-elbow-h, 4.5rem) 1fr var(--lcars-elbow-h, 4.5rem);
          gap: var(--lcars-gap, 0.25rem);
          height: 100%;
        }

        /* ─── Top-Left Elbow ─── */
        .lcars-elbow-top {
          grid-column: 1; grid-row: 1;
          background: var(--lcars-sunflower, #ffcc99);
          border-radius: var(--lcars-elbow-radius, 3.75rem) 0 0 0;
          position: relative; overflow: hidden;
        }
        .lcars-elbow-top::after {
          content: ''; position: absolute; bottom: 0; right: 0;
          width: calc(var(--lcars-sidebar-w, 12rem) - var(--lcars-elbow-w, 9.5rem));
          height: calc(var(--lcars-elbow-h, 4.5rem) - var(--lcars-bar-h, 1.5rem));
          background: var(--lcars-bg, #000);
          border-radius: 1.5rem 0 0 0;
        }

        /* ─── Header Bar ─── */
        .lcars-header {
          grid-column: 2; grid-row: 1;
          display: flex; align-items: flex-start; gap: var(--lcars-gap, 0.25rem);
        }
        .lcars-header-title {
          font-family: var(--lcars-font, 'Antonio', sans-serif);
          font-size: var(--lcars-font-size-title, 2rem);
          color: var(--lcars-sunflower, #ffcc99);
          text-transform: uppercase; letter-spacing: 0.05em;
          white-space: nowrap;
          line-height: var(--lcars-bar-h, 1.5rem);
          padding: 0 1rem;
        }
        .lcars-header-bar {
          flex: 1; height: var(--lcars-bar-h, 1.5rem);
          background: var(--lcars-sunflower, #ffcc99);
        }
        .lcars-header-endcap {
          height: var(--lcars-bar-h, 1.5rem);
          background: var(--lcars-sunflower, #ffcc99);
          border-radius: 0;
          display: flex; align-items: center; padding: 0 0.5rem;
        }
        .mute-btn {
          background: none; border: none; cursor: pointer;
          color: var(--lcars-black, #000); padding: 0 0.25rem;
          display: flex; align-items: center;
        }
        .mute-btn:focus-visible {
          outline: 2px solid var(--lcars-ice, #99ccff); outline-offset: 2px;
        }
        .mute-btn ha-icon { --mdc-icon-size: 18px; }

        /* ─── Sidebar ─── */
        .lcars-sidebar {
          grid-column: 1; grid-row: 2;
          display: flex; flex-direction: column;
          gap: var(--lcars-gap, 0.25rem);
          overflow: hidden;
        }
        .lcars-sidebar-panel {
          background: var(--lcars-african-violet, #cc99ff);
          color: var(--lcars-black, #000);
          font-family: var(--lcars-font, 'Antonio', sans-serif);
          font-size: var(--lcars-font-size-data, 0.875rem);
          text-transform: uppercase;
          padding: 0.25rem 0.5rem;
          text-align: right;
          border-radius: 0 0 0 var(--lcars-btn-radius, 1.5rem);
          flex-shrink: 0;
        }

        /* ─── 3 Filter Buttons ─── */
        .lcars-sidebar-filters {
          display: flex; flex-direction: column;
          gap: var(--lcars-gap, 0.25rem);
          flex: 1;
        }
        .sidebar-filter-btn {
          flex: 1;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 0.5rem; border: none;
          border-radius: var(--lcars-btn-radius, 1.5rem) 0 0 var(--lcars-btn-radius, 1.5rem);
          background: var(--lcars-african-violet, #cc99ff);
          color: var(--lcars-black, #000);
          font-family: var(--lcars-font, 'Antonio', sans-serif);
          text-transform: uppercase; cursor: pointer;
          transition: background 200ms ease;
          padding: 0.5rem;
        }
        .sidebar-filter-btn:hover { filter: brightness(1.2); }
        .sidebar-filter-btn:focus-visible {
          outline: 2px solid var(--lcars-ice, #99ccff); outline-offset: 2px;
        }
        .sidebar-filter-btn.active { background: var(--lcars-gold, #ffaa00); }

        .filter-label {
          font-size: 1.25rem; letter-spacing: 0.08em; text-align: center;
        }

        /* ─── Sidebar Filler ─── */
        .lcars-sidebar-filler {
          flex: 1 0 0px;
          min-height: 0;
          background: var(--lcars-gray, #666688);
          border-radius: var(--lcars-btn-radius, 1.5rem) 0 0 0;
        }

        /* ─── Content ─── */
        .lcars-content {
          grid-column: 2; grid-row: 2;
          overflow-y: auto; overflow-x: hidden;
          padding: 0.5rem;
          scrollbar-width: thin;
          scrollbar-color: var(--lcars-gray, #666688) transparent;
        }

        /* ─── Bottom-Left Elbow ─── */
        .lcars-elbow-bottom {
          grid-column: 1; grid-row: 3;
          background: var(--lcars-african-violet, #cc99ff);
          border-radius: 0 0 0 var(--lcars-elbow-radius, 3.75rem);
          position: relative; overflow: hidden;
        }
        .lcars-elbow-bottom::after {
          content: ''; position: absolute; top: 0; right: 0;
          width: calc(var(--lcars-sidebar-w, 12rem) - var(--lcars-elbow-w, 9.5rem));
          height: calc(var(--lcars-elbow-h, 4.5rem) - var(--lcars-bar-h, 1.5rem));
          background: var(--lcars-bg, #000);
          border-radius: 0 0 0 1.5rem;
        }

        /* ─── Footer Bar ─── */
        .lcars-footer {
          grid-column: 2; grid-row: 3;
          display: flex; align-items: flex-end; gap: var(--lcars-gap, 0.25rem);
        }
        .lcars-footer-bar {
          flex: 1; height: var(--lcars-bar-h, 1.5rem);
          background: var(--lcars-african-violet, #cc99ff);
        }
        .lcars-footer-text {
          font-family: var(--lcars-font, 'Antonio', sans-serif);
          font-size: var(--lcars-font-size-data, 0.875rem); color: var(--lcars-sky, #aaaaff);
          text-transform: uppercase; white-space: nowrap;
          line-height: var(--lcars-bar-h, 1.5rem); padding: 0 0.5rem;
        }
        .lcars-footer-endcap {
          width: var(--lcars-endcap-size, 1.5rem); height: var(--lcars-bar-h, 1.5rem);
          background: var(--lcars-african-violet, #cc99ff);
          border-radius: 0;
          flex-shrink: 0;
        }

        /* ─── Mobile ─── */
        @media (max-width: 767px) {
          .lcars-frame {
            grid-template-columns: 1fr;
            grid-template-rows: auto auto 1fr auto;
          }
          .lcars-elbow-top, .lcars-elbow-bottom { display: none; }
          .lcars-header { grid-column: 1; grid-row: 1; }
          .lcars-sidebar {
            grid-column: 1; grid-row: 2;
            flex-direction: row;
          }
          .lcars-sidebar-panel { display: none; }
          .lcars-sidebar-filters { flex-direction: row; }
          .sidebar-filter-btn {
            border-radius: 0; min-height: 3.5rem;
          }
          .sidebar-filter-btn:first-child { border-radius: 1rem 0 0 1rem; }
          .sidebar-filter-btn:last-child { border-radius: 0 1rem 1rem 0; }
          .filter-count { font-size: 1.5rem; }
          .filter-label { font-size: 0.75rem; }
          .lcars-content { grid-column: 1; grid-row: 3; }
          .lcars-footer { grid-column: 1; grid-row: 4; }
        }
      `]}}Promise.race([customElements.whenDefined("hui-masonry-view"),new Promise(e=>setTimeout(e,5e3))]).then(()=>{customElements.get("lcars-illumination-layout")||(customElements.define("lcars-illumination-layout",p),s.g0.info("IlluminationLayout","Illumination layout registered"))})},1160(e,t,a){var r=a(7349),i=a(2622),s=a(8851),n=a(3505),o=a(261);const l="lcars-sensors-grid",c=/^[a-z_]+\.[a-z0-9_]+$/,d=new Set(["fan","climate"]),p=new Set(["aqi","pm25","pm10","volatile_organic_compounds"]),u=/fridge|freezer|refrigerator|wine\s*cooler|kegerator|deep\s*freeze/i;class m extends r.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object},_sensorGroups:{type:Array},_sparklineData:{type:Object}}}constructor(){super(),this._sensorGroups=[],this._trackedEntityIds=new Set,this._sparklineCache=new Map,this._sparklineData=null,this._needsDiscovery=!0,this._lastRegistryRef=null}setConfig(e){const t=(e,t)=>null!=e?Math.max(-50,Math.min(200,Number(e))):t,a=(e,t)=>null!=e?Math.max(0,Math.min(100,Number(e))):t;this._config={...e,temp_comfort_min:t(e.temp_comfort_min,68),temp_comfort_max:t(e.temp_comfort_max,76),humidity_comfort_min:a(e.humidity_comfort_min,30),humidity_comfort_max:a(e.humidity_comfort_max,60),battery_alert:a(e.battery_alert,20),show_sparklines:!1!==e.show_sparklines,show_averages:!1!==e.show_averages,show_appliance_meters:!0===e.show_appliance_meters,group_by_floor:!1!==e.group_by_floor},this._needsDiscovery=!0}set hass(e){const t=this._hass;this._hass=e;const a=`${Object.keys(e.entities||{}).length}:${Object.keys(e.devices||{}).length}`;if(!t||this._needsDiscovery||a!==this._lastRegistryRef)return this._lastRegistryRef=a,this._discoverSensors(),this._needsDiscovery=!1,void this.requestUpdate();if(this._trackedEntityIds.size>0){let a=!1;for(const r of this._trackedEntityIds)if(t.states[r]!==e.states[r]){a=!0;break}if(!a)return}this.requestUpdate()}_discoverSensors(){if(!this._hass)return;const e=Object.values(this._hass.entities||{}),t=this._hass.devices||{},a=this._hass.areas||{},r=this._hass.floors||{},i=new Map;for(const t of e)t.device_id&&!t.disabled_by&&(i.has(t.device_id)||i.set(t.device_id,[]),i.get(t.device_id).push(t));const n=e.filter(e=>"temperature"===e.original_device_class&&!e.disabled_by&&c.test(e.entity_id)),o=[],m=new Set;for(const e of n){const s=e.device_id,n=t[s];if(!n)continue;const l=i.get(s)||[],h=l.some(e=>{const t=e.entity_id?.split(".")[0];return d.has(t)}),f=l.some(e=>p.has(e.original_device_class));if(h||f)continue;const v=n.name_by_user||n.name||"";if(!this._config.show_appliance_meters&&u.test(v))continue;const g=l.find(e=>"humidity"===e.original_device_class&&c.test(e.entity_id));if(!g)continue;const b=l.find(e=>"battery"===e.original_device_class&&c.test(e.entity_id)),y=n.area_id,_=y?a[y]:null,w=_?.floor_id,x=w?r[w]:null;o.push({deviceId:s,deviceName:v,areaId:y,areaName:_?_.name:v.replace(/^Meter\s*-\s*/i,""),floorId:w,floorName:x?x.name:"UNASSIGNED",floorLevel:x?x.level:-999,temperatureEntityId:e.entity_id,humidityEntityId:g.entity_id,batteryEntityId:b?b.entity_id:null}),m.add(e.entity_id),m.add(g.entity_id),b&&m.add(b.entity_id)}o.sort((e,t)=>t.floorLevel!==e.floorLevel?t.floorLevel-e.floorLevel:e.areaName.localeCompare(t.areaName)),this._sensorGroups=o,this._trackedEntityIds=m,s.g0.debug(l,`Discovered ${o.length} sensor groups, tracking ${m.size} entities`)}async _fetchSparklines(){if(!this._config?.show_sparklines||!this._hass||0===this._sensorGroups.length)return;const e=this._sensorGroups.map(e=>e.temperatureEntityId),t=await(0,o.s)(this._hass,"sensors-grid",e,this._sparklineCache,{maxEntities:Math.max(e.length,10)});t&&(this._sparklineData=t,this.requestUpdate())}firstUpdated(){this._fetchSparklines()}updated(e){e.has("_sensorGroups")&&this._sensorGroups.length>0&&this._fetchSparklines()}_getState(e){return e?this._hass?.states[e]:null}_getNumericState(e){const t=this._getState(e);if(!t||"unavailable"===t.state||"unknown"===t.state)return null;const a=parseFloat(t.state);return isNaN(a)?null:a}_isUnavailable(e){const t=this._getState(e);return!t||["unavailable","unknown"].includes(t.state)}_getStardate(){const e=new Date,t=e.getFullYear(),a=new Date(t,0,0),r=Math.floor((e-a)/864e5);return`${t}${String(r).padStart(3,"0")}.${String(e.getHours()).padStart(2,"0")}`}_handleTileTap(e,t){e.stopPropagation(),(0,s.Hv)(t)}_computeAverages(){const e=[],t=[];let a=0,r=0;for(const i of this._sensorGroups){const s=this._getNumericState(i.temperatureEntityId),n=this._getNumericState(i.humidityEntityId);if(null!=s&&(e.push(s),a++),null!=n&&t.push(n),i.batteryEntityId){const e=this._getNumericState(i.batteryEntityId);null!=e&&e<=(this._config.battery_alert||20)&&r++}}const i=e=>e.length>0?Math.round(e.reduce((e,t)=>e+t,0)/e.length*10)/10:null;return{avgTemp:i(e),avgHumidity:i(t),onlineCount:a,totalCount:this._sensorGroups.length,lowBatteryCount:r}}_groupByFloor(){const e=new Map;for(const t of this._sensorGroups){const a=t.floorName;e.has(a)||e.set(a,[]),e.get(a).push(t)}return e}_getSparklinePoints(e){return this._sparklineData&&this._sparklineData[e]?this._sparklineData[e]:null}render(){if(!this._hass||!this._config)return r.qy``;if(0===this._sensorGroups.length)return r.qy`
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
      `;const e=this._groupByFloor(),t=this._config.show_averages?this._computeAverages():null;return r.qy`
      <ha-card>
        <div class="lcars-sensors-grid"
             role="region"
             aria-label="Internal environmental sensors — ${t?.onlineCount||0} rooms monitored">

          ${this._renderHeader()}
          ${this._renderBody(e)}
          ${t?this._renderSummary(t):""}
        </div>
      </ha-card>
    `}_renderHeader(){return r.qy`
      <div class="sensors-header" role="heading" aria-level="3">
        <span class="sensors-header-title">INTERNAL SENSORS</span>
        <span class="sensors-header-line" aria-hidden="true"></span>
        <span class="sensors-header-stardate">${this._getStardate()}</span>
      </div>
    `}_renderBody(e){return r.qy`
      <div class="sensors-body" role="list"
           aria-label="Room environmental readings grouped by floor">
        ${[...e.entries()].map(([e,t])=>r.qy`
          <div class="sensors-floor-group" role="group"
               aria-label="${e} — ${t.length} rooms">
            <div class="sensors-floor-label" role="heading" aria-level="4">
              ${e.toUpperCase()}
            </div>
            <div class="sensors-tile-grid" role="list">
              ${t.map((e,t)=>this._renderTile(e,t))}
            </div>
          </div>
        `)}
      </div>
    `}_renderTile(e,t){const a=this._getNumericState(e.temperatureEntityId),i=this._getNumericState(e.humidityEntityId),s=e.batteryEntityId?this._getNumericState(e.batteryEntityId):null,l=this._isUnavailable(e.temperatureEntityId),c=l?"unavailable":(0,n.HJ)(a),d=l?"var(--lcars-gray)":(0,n.sx)(a),p=l?"var(--lcars-gray)":(0,n.z5)(i),u=null!=s&&s<=(this._config.battery_alert||20),m=this._config.show_sparklines?this._getSparklinePoints(e.temperatureEntityId):null;let h=l?`${e.areaName}: sensor offline`:`${e.areaName}: ${null!=a?Math.round(a):"?"} degrees, ${null!=i?Math.round(i):"?"} percent humidity`;return u&&(h+=`. Low battery: ${Math.round(s)} percent`),r.qy`
      <div class="sensor-tile ${c}"
           tabindex="0"
           role="listitem"
           aria-label="${h}"
           style="--tile-index: ${t}"
           @click=${t=>this._handleTileTap(t,e.temperatureEntityId)}
           @keydown=${t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._handleTileTap(t,e.temperatureEntityId))}}>

        <div class="tile-name">${e.areaName}</div>

        <div class="tile-readings">
          <span class="tile-temp" style="color: ${d}">
            ${null!=a?`${Math.round(a)}°`:"—"}
          </span>
          <span class="tile-humidity" style="color: ${p}">
            ${null!=i?`${Math.round(i)}%`:"—"}
          </span>
        </div>

        ${u?r.qy`
          <div class="tile-battery-badge"
               aria-label="Low battery: ${Math.round(s)} percent"
               title="BATTERY: ${Math.round(s)}%">●</div>
        `:""}

        ${m&&m.length>=2?r.qy`
          ${(0,o.K)(m,{color:d,width:100,height:16,className:"tile-sparkline"})}
        `:""}

        ${l?r.qy`
          <div class="tile-unavailable" aria-label="Sensor unavailable">
            <span>OFFLINE</span>
          </div>
        `:""}
      </div>
    `}_renderSummary(e){const t=null!=e.avgTemp?(0,n.sx)(e.avgTemp):"var(--lcars-gray)",a=null!=e.avgHumidity?(0,n.z5)(e.avgHumidity):"var(--lcars-gray)";return r.qy`
      <div class="sensors-summary" role="status" aria-live="polite">
        <span class="summary-label">SHIP AVG</span>
        <span class="summary-temp" style="color: ${t}">
          ${null!=e.avgTemp?`${e.avgTemp}°`:"—"}
        </span>
        <span class="summary-humidity" style="color: ${a}">
          ${null!=e.avgHumidity?`${e.avgHumidity}%RH`:"—"}
        </span>
        <span class="summary-divider" aria-hidden="true">■</span>
        <span class="summary-online">
          ${e.onlineCount} ${1===e.onlineCount?"SENSOR":"SENSORS"} ONLINE
        </span>
        ${e.lowBatteryCount>0?r.qy`
          <span class="summary-low" style="color: var(--lcars-tomato)">
            ● ${e.lowBatteryCount} LOW
          </span>
        `:""}
      </div>
    `}static get styles(){return[i.Bx,r.AH`
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
      `]}getCardSize(){return Math.max(2,Math.ceil(this._sensorGroups.length/4)+1)}}customElements.get("lcars-internal-sensors-grid")||(customElements.define("lcars-internal-sensors-grid",m),s.g0.debug(l,"Custom element registered: lcars-internal-sensors-grid")),window.customCards=window.customCards||[],window.customCards.push({type:"lcars-internal-sensors-grid",name:"LCARS Internal Sensors Grid",description:"Ship-wide environmental monitoring grid",preview:!0})},958(e,t,a){var r=a(7349),i=a(8851),s=a(2622),n=a(7597),o=a(6930),l=a(4867),c=a(9411),d=a(6940);const p=new Set(["climate"]),u=new Set(["temperature","humidity"]),m=new Set(["fan","humidifier","air_quality"]),h=new Set(["pm25","pm10","carbon_dioxide","volatile_organic_compounds","aqi"]);class f extends r.WF{static get properties(){return{hass:{type:Object},_config:{type:Object},filter:{type:String}}}constructor(){super(),this.hass=null,this._config={},this.filter="all",this._entityCache=new Map,this._onFilter=e=>{this.filter=e.detail.filter}}connectedCallback(){super.connectedCallback(),i.o6.addEventListener("lcars-ls-filter",this._onFilter)}disconnectedCallback(){super.disconnectedCallback(),i.o6.removeEventListener("lcars-ls-filter",this._onFilter)}setConfig(e){this._config=e||{}}set hass(e){const t=this._hass;this._hass=e,e&&t!==e&&(this._entityCache.clear(),this.requestUpdate("hass",t))}get hass(){return this._hass}getCardSize(){return 12}_getAreasWithEnv(){if(!this._hass)return[];const e=(0,n.Qn)(this._hass),t=(0,n.E3)(this._hass),a=[];for(const r of e){const e=t.get(r.floor_id)||[],i=[];for(const t of e){const e=this._resolveArea(t);e&&i.push(e)}i.length>0&&a.push({floor:r,areas:i})}const r=t.get(null)||[],i=[];for(const e of r){const t=this._resolveArea(e);t&&i.push(t)}return i.length>0&&a.push({floor:null,areas:i}),a}_resolveArea(e){const t=(0,o.d6)(this._hass,e.area_id,this._entityCache),a=[],r=[];for(const e of t){const t=e.entity_id.split(".")[0],i=this._hass.states?.[e.entity_id];if(!i)continue;const s={entity:e,domain:t,state:i};if((0,l.JM)(s))continue;const n=i.attributes?.device_class||"";p.has(t)||u.has(n)?a.push(s):(m.has(t)||h.has(n)||(0,l.Vk)(s))&&r.push(s)}const i=[...a,...r];return 0===i.length?null:{area:e,all:i,climateEntities:a,airEntities:r}}_getFiltered(e){return"climate"===this.filter?e.climateEntities.length>0?e.climateEntities:null:"air"===this.filter?e.airEntities.length>0?e.airEntities:null:e.all}_getGlobalSummary(e){let t=0,a=0,r=0,i=0,s=0,n=0,o="";for(const{areas:l}of e)for(const e of l){for(const n of e.climateEntities){const e=this._hass?.states?.[n.entity?.entity_id]||n.state;if("climate"===n.domain){const t=e?.attributes?.hvac_action||e?.state;"heating"===t?r++:"cooling"===t?i++:s++}if("temperature"===e?.attributes?.device_class){const r=parseFloat(e?.state);isNaN(r)||(t+=r,a++)}}for(const t of e.airEntities){const a=this._hass?.states?.[t.entity?.entity_id]||t.state;if("aqi"===a?.attributes?.device_class){const t=parseFloat(a?.state);!isNaN(t)&&t>n&&(n=t,o=e.area.name)}}}const l=a>0?Math.round(t/a):null,c=Object.keys(this._hass?.states||{}).find(e=>e.startsWith("weather."));return{avgTemp:l,outdoor:c?this._hass.states[c]?.attributes?.temperature:null,worstAqi:n,worstAqiArea:o,hvacHeating:r,hvacCooling:i,hvacIdle:s}}_getComfortColor(e){return null==e?"var(--lcars-gray)":e<68?"var(--lcars-bluey, #8899ff)":e<=74?"var(--lcars-ice, #99ccff)":e<=80?"var(--lcars-butterscotch, #ff9966)":"var(--lcars-tomato, #ff5555)"}_getAqiColor(e){return e<=50?"var(--lcars-ice, #99ccff)":e<=100?"var(--lcars-sunflower, #ffcc99)":e<=150?"var(--lcars-butterscotch, #ff9966)":"var(--lcars-tomato, #ff5555)"}render(){if(!this._hass)return r.qy``;const e=this._getAreasWithEnv(),t=this._getGlobalSummary(e);return r.qy`
      <div class="ls-dashboard">
        <!-- Summary Strip -->
        <div class="ls-summary">
          ${null!=t.avgTemp?r.qy`
            <span class="ls-summary__block">
              <span class="ls-summary__label">INDOOR AVG</span>
              <span class="ls-summary__value">${t.avgTemp}°</span>
            </span>
          `:""}
          ${null!=t.outdoor?r.qy`
            <span class="ls-summary__block">
              <span class="ls-summary__label">OUTDOOR</span>
              <span class="ls-summary__value">${Math.round(t.outdoor)}°</span>
            </span>
          `:""}
          ${t.worstAqi>0?r.qy`
            <span class="ls-summary__block">
              <span class="ls-summary__label">WORST AQI</span>
              <span class="ls-summary__value">${t.worstAqi} (${t.worstAqiArea.toUpperCase()})</span>
            </span>
          `:""}
          <span class="ls-summary__block">
            <span class="ls-summary__label">HVAC</span>
            <span class="ls-summary__value">${t.hvacHeating} HEAT · ${t.hvacCooling} COOL · ${t.hvacIdle} IDLE</span>
          </span>
        </div>

        ${e.map(({floor:e,areas:t})=>{const a=t.filter(e=>null!==this._getFiltered(e));return 0===a.length?r.qy``:r.qy`
            ${e?r.qy`<div class="ls-floor-header"><span class="ls-floor-name">${e.name||"FLOOR"}</span><span class="ls-floor-line"></span></div>`:""}
            ${a.map(e=>{const t=this._getFiltered(e);return r.qy`
                <div class="ls-area-section">
                  <div class="ls-area-header">
                    <span class="ls-area-name">${e.area.name}</span>
                    <span class="ls-area-line"></span>
                  </div>
                  <div class="ls-devices">
                    ${t.map(e=>this._renderDevice(e))}
                  </div>
                </div>
              `})}
          `})}
        ${0===e.length?r.qy`<div class="ls-empty"><span>NO ENVIRONMENTAL DEVICES DETECTED</span></div>`:""}
      </div>
    `}_renderDevice(e){const t=e.entity?.entity_id,a=this._hass?.states?.[t]||e.state,s=(a?.attributes?.friendly_name||t||"").toUpperCase(),n=a?.attributes?.device_class||"",o=e.domain,l=a?.attributes?.unit_of_measurement||"",p=a?.state;if("climate"===o){const e=a?.attributes?.current_temperature,n=a?.attributes?.temperature,o=a?.attributes?.hvac_action||p;return r.qy`
        <div class="ls-device climate" @click=${()=>(0,i.Hv)(t)}>
          <div class="ls-device__header">
            <span class="ls-device__name">${s}</span>
            <span class="ls-device__badge ${o}">${(o||"").toUpperCase()}</span>
          </div>
          <div class="ls-device__temps">
            ${null!=e?r.qy`<span class="ls-temp current">${(0,c.ZV)(e)}°</span>`:""}
            ${null!=n?r.qy`<span class="ls-temp target">→ ${(0,c.ZV)(n)}°</span>`:""}
          </div>
        </div>
      `}const u=parseFloat(p),m=isNaN(u)?(p||"").toUpperCase():`${(0,c.ZV)(u)} ${l}`,h="fan"===o||"humidifier"===o,f="on"===a?.state;return h?r.qy`
        <button class="ls-pill ${f?"on":"off"}"
                aria-pressed="${f?"true":"false"}"
                @click=${()=>{d.e.playForEntity(t),this._hass.callService(o,"toggle",{entity_id:t})}}
                @contextmenu=${e=>{e.preventDefault(),(0,i.Hv)(t)}}>
          <span class="ls-pill__name">${s}</span>
          <span class="ls-pill__state">${f?"ON":"OFF"}</span>
        </button>
      `:r.qy`
      <div class="ls-device sensor" @click=${()=>(0,i.Hv)(t)}>
        <div class="ls-device__header">
          <span class="ls-device__name">${s}</span>
          <span class="ls-device__badge">${n.toUpperCase()}</span>
        </div>
        <div class="ls-device__value" style="color:${this._getSensorColor(n,u)}">${m}</div>
      </div>
    `}_getSensorColor(e,t){return isNaN(t)?"var(--lcars-space-white)":"temperature"===e?this._getComfortColor(t):"aqi"===e||"pm25"===e||"pm10"===e?this._getAqiColor(t):"carbon_dioxide"===e?t<800?"var(--lcars-ice)":t<1200?"var(--lcars-sunflower)":"var(--lcars-tomato)":"humidity"===e?t<30||t>70?"var(--lcars-butterscotch)":"var(--lcars-ice)":"var(--lcars-space-white)"}static get styles(){return[s.Bx,r.AH`
        :host { display: block; }
        .ls-dashboard { padding: 0.25rem; }

        /* ─── Summary Strip ─── */
        .ls-summary {
          display: flex; gap: 0.25rem; margin-bottom: 0.75rem;
          background: var(--lcars-bluey, #8899ff); border-radius: 0.5rem;
          padding: 0.5rem 1rem; color: var(--lcars-black, #000);
          font-family: var(--lcars-font, 'Antonio', sans-serif); text-transform: uppercase;
        }
        .ls-summary__block { flex: 1; display: flex; flex-direction: column; gap: 0.125rem; }
        .ls-summary__label { font-size: 0.625rem; letter-spacing: 0.1em; color: var(--lcars-black, #000); opacity: 0.75; }
        .ls-summary__value { font-size: 1rem; font-variant-numeric: tabular-nums; color: var(--lcars-black, #000); }

        .ls-floor-header { display: flex; align-items: center; gap: 0.5rem; margin: 1rem 0 0.5rem 0; }
        .ls-floor-name { font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 1.25rem; color: var(--lcars-bluey, #8899ff); text-transform: uppercase; letter-spacing: 0.08em; white-space: nowrap; }
        .ls-floor-line { flex: 1; height: 0.375rem; background: var(--lcars-bluey, #8899ff); border-radius: 0 1.5rem 1.5rem 0; opacity: 0.4; }
        .ls-area-section { margin-bottom: 0.75rem; }
        .ls-area-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem; }
        .ls-area-name { font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 1.25rem; color: var(--lcars-bluey, #8899ff); text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap; }
        .ls-area-line { flex: 1; height: 2px; background: var(--lcars-bluey, #8899ff); opacity: 0.3; }
        .ls-devices { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(16rem, 100%), 1fr)); gap: 0.375rem; }
        .ls-device { border: 1px solid rgba(136, 153, 255, 0.15); border-radius: 0.5rem; padding: 0.5rem 0.75rem; cursor: pointer; transition: filter 200ms ease; }
        .ls-device:hover { filter: brightness(1.15); }
        .ls-device.climate { border-left: 4px solid var(--lcars-bluey, #8899ff); }
        .ls-device__header { display: flex; align-items: center; gap: 0.5rem; }
        .ls-device__name { flex: 1; font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 0.875rem; color: var(--lcars-bluey, #8899ff); text-transform: uppercase; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .ls-device__badge { font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 0.625rem; color: var(--lcars-gray, #666688); text-transform: uppercase; letter-spacing: 0.1em; }
        .ls-device__badge.heating { color: var(--lcars-butterscotch, #ff9966); }
        .ls-device__badge.cooling { color: var(--lcars-ice, #99ccff); }
        .ls-device__badge.idle { color: var(--lcars-gray, #666688); }
        .ls-device__value { font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 1.25rem; color: var(--lcars-space-white, #f5f6fa); font-variant-numeric: tabular-nums; margin-top: 0.125rem; }
        .ls-device__temps { display: flex; gap: 0.75rem; align-items: baseline; margin-top: 0.125rem; }
        .ls-temp { font-family: var(--lcars-font, 'Antonio', sans-serif); font-variant-numeric: tabular-nums; }
        .ls-temp.current { font-size: 1.75rem; color: var(--lcars-space-white, #f5f6fa); }
        .ls-temp.target { font-size: 1rem; color: var(--lcars-ice, #99ccff); }
        .ls-pill { display: flex; align-items: center; height: 3rem; padding: 0 1rem 0 0.75rem; border-radius: 0 var(--lcars-btn-radius, 1.5rem) var(--lcars-btn-radius, 1.5rem) 0; background: var(--lcars-bluey, #8899ff); color: var(--lcars-black, #000); font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 1rem; text-transform: uppercase; cursor: pointer; border: 1px solid rgba(136, 153, 255, 0.2); transition: filter 200ms ease; width: 100%; text-align: left; }
        .ls-pill:hover { filter: brightness(1.2); }
        .ls-pill:focus-visible { outline: 2px solid var(--lcars-ice, #99ccff); outline-offset: 2px; }
        .ls-pill.off { background: var(--lcars-gray, #666688); color: var(--lcars-space-white, #f5f6fa); border-color: rgba(102, 102, 136, 0.3); }
        .ls-pill__name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .ls-pill__state { font-variant-numeric: tabular-nums; min-width: 2.5rem; text-align: right; flex-shrink: 0; }
        .ls-empty { display: flex; align-items: center; justify-content: center; min-height: 10rem; color: var(--lcars-gray, #666688); font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 1.25rem; text-transform: uppercase; }
      `]}}customElements.get("lifesupport-card")||customElements.define("lifesupport-card",f)},114(e,t,a){var r=a(7349),i=a(2622),s=a(8851),n=a(6940),o=a(5824);const l="all",c="climate",d="air";class p extends r.WF{static get properties(){return{cards:{type:Array},_hass:{type:Object},_config:{type:Object},_filter:{type:String},_siteName:{type:String},_audioMuted:{type:Boolean},_editMode:{type:Boolean}}}constructor(){super(),this.cards=[],this._hass=null,this._config={},this._filter=l,this._siteName="LCARS",this._audioMuted=n.e.isMuted,this._editMode=!1}setConfig(e){this._config=e}set hass(e){this._hass=e,e?.config?.location_name&&(this._siteName=e.config.location_name.toUpperCase()),this.cards&&this.cards.forEach(t=>{t&&(t.hass=e)}),(0,o.X)(e)}_setFilter(e){this._filter=e,n.e.play("navAcknowledge"),s.o6.dispatchEvent(new CustomEvent("lcars-ls-filter",{detail:{filter:e}}))}_toggleMute(){n.e.toggle(),this._audioMuted=n.e.isMuted}_openSidebarReorder(){if(!this._hass?.user?.is_admin)return;let e=this.shadowRoot.querySelector("lcars-sidebar-reorder");e||(e=document.createElement("lcars-sidebar-reorder"),this.shadowRoot.appendChild(e)),e.hass=this._hass,e.open()}_toggleEditMode(){this._editMode=!this._editMode,s.o6.dispatchEvent(new CustomEvent("lcars-ls-edit",{detail:{enabled:this._editMode}}))}render(){const e=a(8330).version;return r.qy`
      <div class="lcars-frame">
        <div class="lcars-elbow-top" aria-hidden="true"></div>
        <div class="lcars-header" role="banner">
          <span class="lcars-header-title">${this._siteName}</span>
          <div class="lcars-header-bar" aria-hidden="true"></div>
          <div class="lcars-header-endcap">
            <button class="mute-btn" role="switch" aria-checked=${!this._audioMuted} @click=${()=>this._toggleMute()}>
              <ha-icon .icon=${this._audioMuted?"mdi:volume-off":"mdi:volume-high"}></ha-icon>
            </button>
            ${this._hass?.user?.is_admin?r.qy`
              <button class="mute-btn" aria-label="Reorder sidebar dashboards" @click=${()=>this._openSidebarReorder()}>
                <ha-icon .icon=${"mdi:sort-variant"}></ha-icon>
              </button>
              <button class="mute-btn" aria-pressed=${this._editMode} @click=${()=>this._toggleEditMode()}>
                <ha-icon .icon=${"mdi:cog-outline"}></ha-icon>
              </button>
            `:""}
          </div>
        </div>
        <nav class="lcars-sidebar" role="tablist" aria-label="Filter life support devices">
          <div class="lcars-sidebar-panel">Life Support</div>
          <div class="lcars-sidebar-filters">
            <button class="sidebar-filter-btn ${this._filter===l?"active":""}" role="tab" aria-selected="${this._filter===l?"true":"false"}" @click=${()=>this._setFilter(l)}><span class="filter-label">ALL</span></button>
            <button class="sidebar-filter-btn ${this._filter===c?"active":""}" role="tab" aria-selected="${this._filter===c?"true":"false"}" @click=${()=>this._setFilter(c)}><span class="filter-label">CLIMATE</span></button>
            <button class="sidebar-filter-btn ${this._filter===d?"active":""}" role="tab" aria-selected="${this._filter===d?"true":"false"}" @click=${()=>this._setFilter(d)}><span class="filter-label">AIR</span></button>
          </div>
          <div class="lcars-sidebar-filler" aria-hidden="true"></div>
        </nav>
        <main class="lcars-content" aria-label="Life support dashboard">
          ${this.cards?.length>0?this.cards.map(e=>r.qy`${e}`):r.qy`<div class="lcars-heading">No data available</div>`}
        </main>
        <div class="lcars-elbow-bottom" aria-hidden="true"></div>
        <div class="lcars-footer" role="contentinfo">
          <div class="lcars-footer-bar" aria-hidden="true"></div>
          <span class="lcars-footer-text">LCARS ${e}</span>
          <div class="lcars-footer-endcap" aria-hidden="true"></div>
        </div>
      </div>
    `}static get styles(){return[i.Bx,r.AH`
        :host { display: block; height: calc(100vh - var(--header-height, 0px)); overflow: hidden; box-sizing: border-box; background: var(--lcars-bg, #000); padding: var(--lcars-gap, 0.25rem); }
        .lcars-frame { display: grid; grid-template-columns: var(--lcars-sidebar-w, 12rem) 1fr; grid-template-rows: var(--lcars-elbow-h, 4.5rem) 1fr var(--lcars-elbow-h, 4.5rem); gap: var(--lcars-gap, 0.25rem); height: 100%; }
        .lcars-elbow-top { grid-column: 1; grid-row: 1; background: var(--lcars-bluey, #8899ff); border-radius: var(--lcars-elbow-radius, 3.75rem) 0 0 0; position: relative; overflow: hidden; }
        .lcars-elbow-top::after { content: ''; position: absolute; bottom: 0; right: 0; width: calc(var(--lcars-sidebar-w, 12rem) - var(--lcars-elbow-w, 9.5rem)); height: calc(var(--lcars-elbow-h, 4.5rem) - var(--lcars-bar-h, 1.5rem)); background: var(--lcars-bg, #000); border-radius: 1.5rem 0 0 0; }
        .lcars-header { grid-column: 2; grid-row: 1; display: flex; align-items: flex-start; gap: var(--lcars-gap, 0.25rem); }
        .lcars-header-title { font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: var(--lcars-font-size-title, 2rem); color: var(--lcars-bluey, #8899ff); text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap; line-height: var(--lcars-bar-h, 1.5rem); padding: 0 1rem; }
        .lcars-header-bar { flex: 1; height: var(--lcars-bar-h, 1.5rem); background: var(--lcars-bluey, #8899ff); }
        .lcars-header-endcap { height: var(--lcars-bar-h, 1.5rem); background: var(--lcars-bluey, #8899ff); border-radius: 0; display: flex; align-items: center; padding: 0 0.5rem; }
        .mute-btn { background: none; border: none; cursor: pointer; color: var(--lcars-black, #000); padding: 0 0.25rem; display: flex; align-items: center; }
        .mute-btn:focus-visible { outline: 2px solid var(--lcars-ice, #99ccff); outline-offset: 2px; }
        .mute-btn ha-icon { --mdc-icon-size: 18px; }
        .lcars-sidebar { grid-column: 1; grid-row: 2; display: flex; flex-direction: column; gap: var(--lcars-gap, 0.25rem); overflow: hidden; }
        .lcars-sidebar-panel { background: var(--lcars-african-violet, #cc99ff); color: var(--lcars-black, #000); font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: var(--lcars-font-size-data, 0.875rem); text-transform: uppercase; padding: 0.25rem 0.5rem; text-align: right; border-radius: 0 0 0 var(--lcars-btn-radius, 1.5rem); flex-shrink: 0; }
        .lcars-sidebar-filters { display: flex; flex-direction: column; gap: var(--lcars-gap, 0.25rem); flex: 1; }
        .sidebar-filter-btn { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem; border: none; border-radius: var(--lcars-btn-radius, 1.5rem) 0 0 var(--lcars-btn-radius, 1.5rem); background: var(--lcars-african-violet, #cc99ff); color: var(--lcars-black, #000); font-family: var(--lcars-font, 'Antonio', sans-serif); text-transform: uppercase; cursor: pointer; transition: background 200ms ease; padding: 0.5rem; }
        .sidebar-filter-btn:hover { filter: brightness(1.2); }
        .sidebar-filter-btn:focus-visible { outline: 2px solid var(--lcars-ice, #99ccff); outline-offset: 2px; }
        .sidebar-filter-btn.active { background: var(--lcars-gold, #ffaa00); }
        .filter-label { font-size: 1.25rem; letter-spacing: 0.08em; text-align: center; }
        .lcars-sidebar-filler { flex: 1 0 0px; min-height: 0; background: var(--lcars-gray, #666688); border-radius: var(--lcars-btn-radius, 1.5rem) 0 0 0; }
        .lcars-content { grid-column: 2; grid-row: 2; overflow-y: auto; overflow-x: hidden; padding: 0.5rem; scrollbar-width: thin; scrollbar-color: var(--lcars-gray, #666688) transparent; }
        .lcars-elbow-bottom { grid-column: 1; grid-row: 3; background: var(--lcars-african-violet, #cc99ff); border-radius: 0 0 0 var(--lcars-elbow-radius, 3.75rem); position: relative; overflow: hidden; }
        .lcars-elbow-bottom::after { content: ''; position: absolute; top: 0; right: 0; width: calc(var(--lcars-sidebar-w, 12rem) - var(--lcars-elbow-w, 9.5rem)); height: calc(var(--lcars-elbow-h, 4.5rem) - var(--lcars-bar-h, 1.5rem)); background: var(--lcars-bg, #000); border-radius: 0 0 0 1.5rem; }
        .lcars-footer { grid-column: 2; grid-row: 3; display: flex; align-items: flex-end; gap: var(--lcars-gap, 0.25rem); }
        .lcars-footer-bar { flex: 1; height: var(--lcars-bar-h, 1.5rem); background: var(--lcars-african-violet, #cc99ff); }
        .lcars-footer-text { font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: var(--lcars-font-size-data, 0.875rem); color: var(--lcars-sky, #aaaaff); text-transform: uppercase; white-space: nowrap; line-height: var(--lcars-bar-h, 1.5rem); padding: 0 0.5rem; }
        .lcars-footer-endcap { width: var(--lcars-endcap-size, 1.5rem); height: var(--lcars-bar-h, 1.5rem); background: var(--lcars-african-violet, #cc99ff); border-radius: 0; flex-shrink: 0; }
      `]}}Promise.race([customElements.whenDefined("hui-masonry-view"),new Promise(e=>setTimeout(e,5e3))]).then(()=>{customElements.get("lcars-lifesupport-layout")||customElements.define("lcars-lifesupport-layout",p)})},8532(e,t,a){var r=a(7349),i=a(2622),s=a(8851);class n extends r.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object},_cards:{type:Array}}}constructor(){super(),this._cards=[]}set hass(e){this._hass=e,this._cards.forEach(t=>{t&&(t.hass=e)})}setConfig(e){this._config=e,this._createCards()}async _createCards(){this._config&&this._config.cards&&(this._cards=await Promise.all(this._config.cards.map(async e=>{try{const t=await(0,s.te)(e);return this._hass&&(t.hass=this._hass),t}catch(t){return console.error("LCARS: Failed to create card",e,t),null}})),this._cards=this._cards.filter(Boolean),this.requestUpdate())}static get styles(){return[i.Bx,r.AH`
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
        `]}render(){const e=this._config&&this._config.name||"More Page";return r.qy`
        <div class="divider">
          <span class="divider-label">${e}</span>
          <div class="divider-line"></div>
        </div>

        <div class="cards-container">
          ${this._cards.length>0?this._cards.map(e=>r.qy`${e}`):r.qy`<div class="lcars-empty">No cards configured</div>`}
        </div>
      `}getCardSize(){return this._cards.length||1}}customElements.get("lcars-more-page-card")||customElements.define("lcars-more-page-card",n)},5799(e,t,a){var r=a(7349),i=a(2622),s=a(8851);class n extends r.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object},_pages:{type:Array}}}constructor(){super(),this._pages=[]}set hass(e){this._hass=e,0===this._pages.length&&this._loadPages()}setConfig(e){this._config=e}async _loadPages(){if(this._hass)try{const e=await this._hass.callWS({type:"lcars_dashboard/configuration/get"});e&&e.more_pages&&(this._pages=Object.entries(e.more_pages).map(([e,t])=>({id:e,...t})))}catch(e){console.warn("LCARS: Could not load more-pages",e)}}_openPage(e){(0,s.oo)(`/lcars-dashboard/more/${e}`)}static get styles(){return[i.Bx,r.AH`
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
        `]}render(){return r.qy`
        <div class="divider">
          <span class="divider-label">More Pages</span>
          <div class="divider-line"></div>
        </div>

        ${this._pages.length>0?r.qy`
              <div class="pages-grid">
                ${this._pages.map(e=>r.qy`
                    <button
                      class="page-btn"
                      @click=${()=>this._openPage(e.id)}
                    >
                      <ha-icon .icon=${e.icon||"mdi:file-document-outline"}></ha-icon>
                      <span class="page-name">${e.name||e.id}</span>
                    </button>
                  `)}
              </div>
            `:r.qy`<div class="lcars-empty">No additional pages configured</div>`}
      `}getCardSize(){return 4}}customElements.get("lcars-more-pages-card")||customElements.define("lcars-more-pages-card",n)},7753(e,t,a){var r=a(7349),i=a(2622),s=a(8851);class n extends r.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object},_activePath:{type:String}}}constructor(){super(),this._activePath="home"}set hass(e){this._hass=e}setConfig(e){this._config=e}_handleNav(e){this._activePath=e,(0,s.oo)(`/lcars-dashboard/${e}`),this.requestUpdate()}static get styles(){return[i.Bx,r.AH`
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
            padding: 0 0.75rem 0 1rem;
            background: var(--lcars-btn-nav);
            color: var(--lcars-black);
            border: none;
            border-radius: var(--lcars-btn-radius) 0 0 var(--lcars-btn-radius);
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
        `]}render(){return r.qy`
        <div class="nav-container" role="menubar" aria-label="Main navigation">
          ${[{path:"home",icon:"mdi:home",label:"Home"}].map(e=>r.qy`
              <button
                class="nav-btn"
                role="menuitem"
                ?data-active=${this._activePath===e.path}
                aria-current=${this._activePath===e.path?"page":"false"}
                @click=${()=>this._handleNav(e.path)}
              >
                <ha-icon .icon=${e.icon}></ha-icon>
                <span class="nav-label">${e.label}</span>
              </button>
            `)}
        </div>
      `}getCardSize(){return 3}}customElements.get("lcars-navigation-card")||customElements.define("lcars-navigation-card",n)},2982(e,t,a){var r=a(7349),i=a(2622);class s extends r.WF{static get properties(){return{_hass:{type:Object},_notifications:{type:Array}}}constructor(){super(),this._notifications=[]}set hass(e){this._hass=e,this._loadNotifications()}setConfig(e){this._config=e}async _loadNotifications(){if(this._hass)try{const e=await this._hass.callWS({type:"lcars_dashboard_notification/get"});Array.isArray(e)&&(this._notifications=e)}catch(e){}}_dismissNotification(e){this._hass&&this._hass.callWS({type:"lcars_dashboard/notification/dismiss",notification_id:e}).then(()=>{this._notifications=this._notifications.filter(t=>t.id!==e)}).catch(()=>{})}static get styles(){return[i.Bx,r.AH`
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
        `]}render(){return 0===this._notifications.length?r.qy``:r.qy`
        <div class="notification-list" role="log" aria-label="Notifications">
          ${this._notifications.map(e=>r.qy`
              <div
                class="notification ${e.type||"info"}"
                role="status"
              >
                <ha-icon .icon=${"alert"===e.type?"mdi:alert":"mdi:information-outline"}></ha-icon>
                <span class="notification-message">${e.message||e.title||"Notification"}</span>
                <button
                  class="notification-dismiss"
                  @click=${()=>this._dismissNotification(e.id)}
                  aria-label="Dismiss"
                >
                  &#x2715;
                </button>
              </div>
            `)}
        </div>
      `}getCardSize(){return this._notifications.length||0}}customElements.get("lcars-notification-card")||customElements.define("lcars-notification-card",s)},8888(e,t,a){var r=a(7349),i=a(2622),s=a(8851);class n extends r.WF{static get properties(){return{_hass:{type:Object},_config:{type:Object},_open:{type:Boolean},_card:{type:Object}}}constructor(){super(),this._open=!1,this._card=null}set hass(e){this._hass=e,this._card&&(this._card.hass=e)}setConfig(e){this._config=e,e.card&&this._createCard(e.card)}async _createCard(e){try{this._card=await(0,s.te)(e),this._hass&&(this._card.hass=this._hass),this.requestUpdate()}catch(e){console.error("LCARS Popup: Failed to create card",e)}}open(){this._open=!0}close(){this._open=!1}_handleBackdropClick(e){e.target===e.currentTarget&&this.close()}_handleKeydown(e){"Escape"===e.key&&this.close()}static get styles(){return[i.Bx,r.AH`
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
        `]}render(){return r.qy`
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
              ${this._card?r.qy`${this._card}`:""}
            </div>
          </div>
        </div>
      `}getCardSize(){return 0}}customElements.get("lcars-popup")||customElements.define("lcars-popup",n)},717(e,t,a){function r(e,t={},a={}){const r=a.min??35,i=a.max??95,s=null!=t.min_temp?Number(t.min_temp):r,n=null!=t.max_temp?Number(t.max_temp):i,o=Math.max(r,s),l=Math.min(i,n);return Math.min(l,Math.max(o,Number(e)||o))}function i(e,t,a){return Math.min(a,Math.max(t,Number(e)||t))}function s(e,t){const a=[];function r(){const e=Date.now()-t;for(;a.length>0&&a[0]<e;)a.shift()}return{allow:()=>(r(),!(a.length>=e||(a.push(Date.now()),0))),remaining:()=>(r(),Math.max(0,e-a.length)),resetTime:()=>(r(),a.length<e?0:a[0]+t),reset(){a.length=0}}}function n(e,t=1500){let a=null;return{call(...r){a&&clearTimeout(a),a=setTimeout(()=>{a=null,e(...r)},t)},cancel(){a&&(clearTimeout(a),a=null)}}}a.d(t,{A_:()=>r,L3:()=>i,eU:()=>n,x:()=>s})},1109(e,t,a){a.d(t,{PF:()=>i,yW:()=>s});var r=a(7349);const i=r.AH`
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
`,s=r.AH`
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
`},5824(e,t,a){a.d(t,{X:()=>o});var r=a(7349),i=a(2622);const s={habitat:"lcars-habitat",security:"lcars-security",power:"lcars-power",environmental:"lcars-environmental",lighting:"lcars-lighting"};let n=!1;async function o(e){if(!n&&e){n=!0;try{const t=((await e.callWS({type:"lcars_dashboard/sidebar_order/get"})).order||[]).map(e=>s[e]).filter(Boolean);if(0===t.length)return;const a=new Set(t);let r={};try{const t=await e.callWS({type:"frontend/get_user_data",key:"sidebar"});t&&t.value&&(r=t.value)}catch(e){return}let i=Array.isArray(r.panelOrder)?[...r.panelOrder]:[];if(0===i.length)return;let n=!0;for(let e=0;e<t.length;e++)if(i[e]!==t[e]){n=!1;break}if(n)return;i=i.filter(e=>!a.has(e)),i.splice(0,0,...t);const o=new Set(i);for(const t of Object.keys(e.panels||{}))o.has(t)||i.push(t);await e.callWS({type:"frontend/set_user_data",key:"sidebar",value:{panelOrder:i,hiddenPanels:r.hiddenPanels||[]}})}catch(e){console.warn("LCARS: auto-fix sidebar order failed",e)}}}const l=r.AH`
  :host { display: block; }

  .reorder-backdrop {
    display: none;
    position: fixed; inset: 0;
    background: rgba(0, 0, 0, 0.7);
    z-index: 10000;
    align-items: center; justify-content: center;
  }
  .reorder-backdrop[data-open] {
    display: flex;
  }

  .reorder-frame {
    background: var(--lcars-card-bg, #111);
    border: 2px solid var(--lcars-butterscotch, #f1df6f);
    border-radius: 0.5rem;
    min-width: 320px; max-width: 400px;
    width: 90vw;
    box-shadow: 0 0 40px rgba(0,0,0,0.5);
  }

  .reorder-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--lcars-gray, #999);
  }
  .reorder-title {
    font-family: var(--lcars-font, 'Antonio', sans-serif);
    font-size: 1.25rem;
    color: var(--lcars-butterscotch, #f1df6f);
    text-transform: uppercase;
  }
  .reorder-close {
    background: none; border: none;
    color: var(--lcars-gray, #999);
    font-size: 1.5rem; cursor: pointer;
    padding: 0 0.25rem;
    line-height: 1;
  }
  .reorder-close:hover { color: var(--lcars-space-white, #fff); }

  .reorder-body {
    padding: 0.75rem;
    display: flex; flex-direction: column; gap: 4px;
  }

  .reorder-item {
    display: flex; align-items: center; gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: var(--lcars-disabled, #444);
    color: var(--lcars-space-white, #fff);
    border-radius: 0 1rem 1rem 0;
    font-family: var(--lcars-font, 'Antonio', sans-serif);
    font-size: 1rem;
    text-transform: uppercase;
    cursor: grab;
    user-select: none;
    transition: background 0.15s, transform 0.15s, opacity 0.15s;
  }
  .reorder-item:hover { background: var(--lcars-gray, #666); }
  .reorder-item.dragging {
    opacity: 0.4;
    background: var(--lcars-butterscotch, #f1df6f);
    color: var(--lcars-black, #000);
  }
  .reorder-item.drag-over {
    border-top: 3px solid var(--lcars-butterscotch, #f1df6f);
    padding-top: calc(0.5rem - 3px);
  }

  .grip-handle {
    display: flex; flex-direction: column; gap: 2px;
    cursor: grab; padding: 0.25rem 0;
    flex-shrink: 0;
  }
  .grip-handle span {
    display: block; width: 14px; height: 2px;
    background: var(--lcars-gray, #999);
    border-radius: 1px;
  }
  .reorder-item:hover .grip-handle span {
    background: var(--lcars-space-white, #fff);
  }

  .item-icon { flex-shrink: 0; --mdc-icon-size: 20px; }
  .item-label { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  .reorder-footer {
    display: flex; gap: 0.5rem; padding: 0.75rem 1rem;
    border-top: 1px solid var(--lcars-gray, #999);
    justify-content: flex-end;
  }
  .reorder-btn {
    padding: 0.5rem 1.25rem;
    border: none; border-radius: 0 1rem 1rem 0;
    font-family: var(--lcars-font, 'Antonio', sans-serif);
    font-size: 0.875rem; text-transform: uppercase;
    cursor: pointer; transition: filter 0.15s;
  }
  .reorder-btn:hover { filter: brightness(1.2); }
  .reorder-btn.save {
    background: var(--lcars-butterscotch, #f1df6f);
    color: var(--lcars-black, #000);
  }
  .reorder-btn.cancel {
    background: var(--lcars-gray, #999);
    color: var(--lcars-black, #000);
  }
`;class c extends r.WF{static get properties(){return{_hass:{type:Object},_open:{type:Boolean},_order:{type:Array},_dashboards:{type:Object},_dragIdx:{type:Number},_overIdx:{type:Number}}}static get styles(){return[i.Bx,l]}constructor(){super(),this._open=!1,this._order=[],this._dashboards={},this._dragIdx=-1,this._overIdx=-1}set hass(e){this._hass=e}async open(){await this._load(),this._open=!0}close(){this._open=!1,this._dragIdx=-1,this._overIdx=-1}async _load(){if(this._hass)try{const e=await this._hass.callWS({type:"lcars_dashboard/sidebar_order/get"});this._order=e.order||[],this._dashboards=e.dashboards||{}}catch(e){console.error("LCARS Reorder: Failed to load sidebar order",e)}}async _save(){if(this._hass)try{await this._hass.callWS({type:"lcars_dashboard/sidebar_order/set",order:JSON.stringify(this._order)});const e=this._order.map(e=>s[e]).filter(Boolean),t=new Set(e);let a={};try{const e=await this._hass.callWS({type:"frontend/get_user_data",key:"sidebar"});e&&e.value&&(a=e.value)}catch(e){}let r=Array.isArray(a.panelOrder)?[...a.panelOrder]:[];0===r.length&&(r=Object.keys(this._hass.panels||{}).sort()),r=r.filter(e=>!t.has(e)),r.splice(0,0,...e);const i=new Set(r);for(const e of Object.keys(this._hass.panels||{}))i.has(e)||r.push(e);await this._hass.callWS({type:"frontend/set_user_data",key:"sidebar",value:{panelOrder:r,hiddenPanels:a.hiddenPanels||[]}}),this.close(),window.location.reload()}catch(e){console.error("LCARS Reorder: Failed to save sidebar order",e)}}_onDragStart(e,t){this._dragIdx=t,e.dataTransfer.effectAllowed="move",e.dataTransfer.setData("text/plain",String(t))}_onDragOver(e,t){e.preventDefault(),e.dataTransfer.dropEffect="move",t!==this._overIdx&&(this._overIdx=t)}_onDragLeave(e,t){this._overIdx===t&&(this._overIdx=-1)}_onDrop(e,t){e.preventDefault();const a=this._dragIdx;if(a<0||a===t)return this._dragIdx=-1,void(this._overIdx=-1);const r=[...this._order],[i]=r.splice(a,1);r.splice(t,0,i),this._order=r,this._dragIdx=-1,this._overIdx=-1}_onDragEnd(){this._dragIdx=-1,this._overIdx=-1}_handleBackdropClick(e){e.target===e.currentTarget&&this.close()}_handleKeydown(e){"Escape"===e.key&&this.close()}render(){const e=this._order.map((e,t)=>{const a=this._dashboards[e]||{},i=["reorder-item"];return t===this._dragIdx&&i.push("dragging"),t===this._overIdx&&t!==this._dragIdx&&i.push("drag-over"),r.qy`
        <div class="${i.join(" ")}"
          draggable="true"
          @dragstart=${e=>this._onDragStart(e,t)}
          @dragover=${e=>this._onDragOver(e,t)}
          @dragleave=${e=>this._onDragLeave(e,t)}
          @drop=${e=>this._onDrop(e,t)}
          @dragend=${()=>this._onDragEnd()}>
          <div class="grip-handle" aria-hidden="true">
            <span></span><span></span><span></span>
          </div>
          <ha-icon class="item-icon" .icon=${a.icon||"mdi:monitor-dashboard"}></ha-icon>
          <span class="item-label">${a.title||e}</span>
        </div>
      `});return r.qy`
      <div class="reorder-backdrop"
        ?data-open=${this._open}
        @click=${this._handleBackdropClick}
        @keydown=${this._handleKeydown}
        role="dialog"
        aria-modal="true"
        aria-label="Reorder dashboards">
        <div class="reorder-frame">
          <div class="reorder-header">
            <span class="reorder-title">Sidebar Order</span>
            <button class="reorder-close" @click=${()=>this.close()} aria-label="Close">&times;</button>
          </div>
          <div class="reorder-body">
            ${e}
          </div>
          <div class="reorder-footer">
            <button class="reorder-btn cancel" @click=${()=>this.close()}>Cancel</button>
            <button class="reorder-btn save" @click=${()=>this._save()}>Save</button>
          </div>
        </div>
      </div>
    `}}customElements.define("lcars-sidebar-reorder",c)},261(e,t,a){a.d(t,{K:()=>i,s:()=>s});var r=a(7349);function i(e,{color:t,label:a="",width:i=120,height:s=24,className:n="lcars-sparkline"}={}){const o=function(e){return Array.isArray(e)?e.map(e=>e.mean).filter(e=>null!=e&&Number.isFinite(e)):[]}(e);if(o.length<2)return"";const l=function(e,t,a){const r=Math.min(...e),i=Math.max(...e)-r||1;return e.map((s,n)=>`${(n/(e.length-1)*t).toFixed(1)},${(a-(s-r)/i*a).toFixed(1)}`).join(" ")}(o,i,s),c=o[o.length-1],d=a?`${a}: ${c?.toFixed(0)||""}`:`Sparkline: ${c?.toFixed(0)||""}`;return r.qy`
    <div class="${n}-wrap" aria-label="${d}">
      ${a?r.qy`<span class="${n}-label">${a}</span>`:""}
      <svg class="${n}" viewBox="0 0 ${i} ${s}" preserveAspectRatio="none">
        <polyline points="${l}" fill="none" stroke="${t}" stroke-width="1.5"
          vector-effect="non-scaling-stroke" />
      </svg>
    </div>
  `}async function s(e,t,a,r,i={}){const{ttlMs:s=3e5,maxEntities:n=10,maxCacheSize:o=30}=i,l=/^[a-z_]+\.[a-z0-9_]+$/,c=Date.now(),d=r.get(t);if(d&&c-d.timestamp<s)return null;try{const i=a.slice(0,n).filter(e=>l.test(e));if(0===i.length)return null;const s=new Date,d=new Date(s.getTime()-864e5),p=await e.callWS({type:"recorder/statistics_during_period",start_time:d.toISOString(),end_time:s.toISOString(),statistic_ids:i,period:"hour",types:["mean"]});if(r.set(t,{data:p,timestamp:c}),r.size>o){const e=r.keys().next().value;r.delete(e)}return p}catch(e){return null}}},2622(e,t,a){a.d(t,{AM:()=>n,Bx:()=>s});var r=a(7349);const i=r.AH`
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
  --lcars-elbow-w: 8rem;
  --lcars-elbow-h: 4.5rem;
  --lcars-elbow-radius: 3.75rem;
  --lcars-sidebar-w: 10rem;
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
`},7908(e,t,a){var r=a(7349),i=a(8851),s=a(2622),n=a(7597),o=a(6930),l=a(4867),c=a(6940);const d=new Set(["lock","alarm_control_panel"]),p=new Set(["door","window","garage_door"]),u=new Set(["smoke","gas","safety","tamper","vibration","carbon_monoxide"]),m=new Set(["motion","occupancy"]),h={triggered:5,pending:4,armed_away:3,armed_night:2,armed_home:2,armed_vacation:2,arming:1,disarmed:0},f=[{re:/front|entry|porch|foyer/i,zone:"FRONT",angle:0},{re:/garage|driveway|carport/i,zone:"GARAGE",angle:45},{re:/side|lateral/i,zone:"SIDE",angle:90},{re:/back|rear|patio|deck/i,zone:"BACK",angle:180},{re:/yard|garden|pool/i,zone:"YARD",angle:225},{re:/basement|cellar|crawl/i,zone:"LOWER",angle:270}];function v(e){for(const t of f)if(t.re.test(e))return t;return null}function g(e,t,a,r){const i=(r-90)*Math.PI/180;return{x:e+a*Math.cos(i),y:t+a*Math.sin(i)}}function b(e,t,a,r,i){const s=g(e,t,a,r),n=g(e,t,a,i),o=i-r>180?1:0;return`M ${s.x} ${s.y} A ${a} ${a} 0 ${o} 1 ${n.x} ${n.y}`}const y=0,_=1,w=2,x=3,$={[y]:"var(--lcars-butterscotch, #ff9966)",[_]:"var(--lcars-sunflower, #ffcc99)",[w]:"var(--lcars-butterscotch, #ff9966)",[x]:"var(--lcars-tomato, #ff5555)"},k={[y]:1,[_]:1.15,[w]:1.15,[x]:1.25},S={[_]:1e4,[w]:15e3,[x]:3e4},C={[_]:"0 0 12px rgba(255,204,153,0.5)",[w]:"0 0 12px rgba(255,153,102,0.5)",[x]:"0 0 16px rgba(255,85,85,0.6)"};class E extends r.WF{static get properties(){return{hass:{type:Object},_config:{type:Object},_mode:{type:String},_cameraStates:{type:Object},_focusedCamera:{type:String},_patrolActive:{type:Boolean},_patrolIndex:{type:Number}}}constructor(){super(),this._hass=null,this._config={},this._mode="cruise",this._cameraStates=new Map,this._focusedCamera=null,this._patrolActive=!1,this._patrolIndex=0,this._patrolTimer=null,this._entityCache=new Map,this._ringBuffer=[],this._soundCooldowns=new Map,this._cascadeFirstTime=0,this._cascadeSoundCount=0,this._lockAllPending=!1}setConfig(e){this._config=e||{}}set hass(e){const t=this._hass;this._hass=e,e&&t!==e&&(this._entityCache.clear(),this._updateDetectionStates(),this._updateMode(),this.requestUpdate("hass",t))}get hass(){return this._hass}getCardSize(){return 16}connectedCallback(){super.connectedCallback()}disconnectedCallback(){super.disconnectedCallback(),this._patrolTimer&&(clearInterval(this._patrolTimer),this._patrolTimer=null);for(const[,e]of this._cameraStates)e.timer&&clearTimeout(e.timer);this._cameraStates.clear(),this._ringBuffer.length=0}_getAreasWithTactical(){if(!this._hass)return[];const e=(0,n.Qn)(this._hass),t=(0,n.E3)(this._hass),a=[];for(const r of e){const e=t.get(r.floor_id)||[],i=[];for(const t of e){const e=this._resolveArea(t);e&&i.push(e)}i.length>0&&a.push({floor:r,areas:i})}const r=t.get(null)||[],i=[];for(const e of r){const t=this._resolveArea(e);t&&i.push(t)}return i.length>0&&a.push({floor:null,areas:i}),a}_resolveArea(e){const t=(0,o.d6)(this._hass,e.area_id,this._entityCache),a=[],r=[],i=[];for(const e of t){const t=e.entity_id.split(".")[0],s=this._hass.states?.[e.entity_id];if(!s)continue;const n={entity:e,domain:t,state:s};(0,l.JM)(n)||("camera"!==t?"lock"!==t?(0,l.XY)(n)&&a.push(n):(i.push(n),a.push(n)):/_low$|_medium$|_insecure$/.test(e.entity_id)||r.push(n))}const s=a.filter(e=>"binary_sensor"===e.domain&&p.has(e.state?.attributes?.device_class||"")),n=a.filter(e=>"binary_sensor"===e.domain&&u.has(e.state?.attributes?.device_class||"")),c=a.filter(e=>"binary_sensor"===e.domain&&m.has(e.state?.attributes?.device_class||"")),h=a.filter(e=>d.has(e.domain));return 0===a.length&&0===r.length?null:{area:e,entities:a,access:h,perimeter:s,safety:n,motion:c,cameras:r,locks:i}}_getGlobalSummary(e){let t="disarmed",a=0,r=0,i=0,s=0,n=0;const o=[],l=[],c=[];for(const{areas:c}of e)for(const e of c){for(const a of e.access)if("alarm_control_panel"===a.domain){const e=(this._hass?.states?.[a.entity?.entity_id]||a.state)?.state||"disarmed";(h[e]||0)>(h[t]||0)&&(t=e)}for(const t of e.perimeter)a++,"on"!==(this._hass?.states?.[t.entity?.entity_id]||t.state)?.state&&r++;for(const t of e.safety)"on"===(this._hass?.states?.[t.entity?.entity_id]||t.state)?.state&&i++;if(o.push(...e.cameras),e.locks)for(const t of e.locks)s++,"locked"===(this._hass?.states?.[t.entity?.entity_id]||t.state)?.state&&n++,l.push(t)}if(this._hass?.states)for(const[e,t]of Object.entries(this._hass.states))e.startsWith("person.")&&c.push({entity_id:e,state:t});return{alarmState:t,perimeterTotal:a,perimeterSecure:r,safetyAlerts:i,locksTotal:s,locksLocked:n,allCameras:o,allLocks:l,allPersons:c}}_getSummaryColor(e){switch(e){case"armed_away":return"var(--lcars-sunflower, #ffcc99)";case"armed_home":case"armed_night":case"armed_vacation":return"var(--lcars-butterscotch, #ff9966)";case"triggered":case"pending":return"var(--lcars-tomato, #ff5555)";default:return"var(--lcars-ice, #99ccff)"}}_updateMode(){if(!this._hass)return;let e="disarmed";const t=this._hass.states||{};for(const[a,r]of Object.entries(t))if(a.startsWith("alarm_control_panel.")){const t=r.state||"disarmed";(h[t]||0)>(h[e]||0)&&(e=t)}this._mode="triggered"===e||"pending"===e?"redalert":"disarmed"!==e?"tactical":"cruise"}_updateDetectionStates(){if(!this._hass)return;const e=this._hass.states||{},t=this._hass.entities||{},a=new Set;for(const t of Object.keys(e))t.startsWith("camera.")&&!/_low$|_medium$|_insecure$/.test(t)&&a.add(t);for(const r of a){const a=t[r];if(!a?.device_id)continue;let i=!1,s=!1,n=!1;for(const[r,o]of Object.entries(e)){if(!r.startsWith("binary_sensor.")||"on"!==o.state)continue;const e=t[r];e&&e.device_id===a.device_id&&(/_person_detected$/.test(r)?i=!0:/_vehicle_detected$/.test(r)?s=!0:/_motion$|_motion_detected$/.test(r)?n=!0:"motion"!==o.attributes?.device_class&&"occupancy"!==o.attributes?.device_class||(n=!0))}i?this._escalateCamera(r,3):s?this._escalateCamera(r,2):n&&this._escalateCamera(r,1)}}_escalateCamera(e,t){const a=this._cameraStates.get(e);if(a&&a.level>=t)return;a?.timer&&clearTimeout(a.timer);const r=setTimeout(()=>{this._cameraStates.delete(e),this.requestUpdate()},S[t]||1e4);this._cameraStates.set(e,{level:t,timer:r,lastUpdate:Date.now()}),this._ringBuffer.push({camEid:e,level:t,time:Date.now()}),this._ringBuffer.length>50&&this._ringBuffer.shift(),this._dispatchDetectionSound(e,t),(t>=3||t>=1&&"cruise"!==this._mode)&&(this._focusedCamera=e),this.requestUpdate()}_dispatchDetectionSound(e,t){if(t<2)return;const a=Date.now();a-(this._soundCooldowns.get(e)||0)<1e4||(a-this._cascadeFirstTime>6e4&&(this._cascadeFirstTime=a,this._cascadeSoundCount=0),this._cascadeSoundCount>=2||(this._cascadeSoundCount++,this._soundCooldowns.set(e,a),3===t?c.e.play("alert"):2===t&&c.e.play("doorEvent")))}_getCameraDetection(e){return this._cameraStates.get(e)||null}_renderPerimeter(e,t){const a=150,s=150,n=120,o=[];let l=0;for(const{areas:t}of e)for(const e of t){const t=v(e.area.name),a=t?t.angle:l+=45,r=t?t.zone:e.area.name.substring(0,4).toUpperCase();(e.perimeter.length+e.motion.length>0||e.cameras.length>0)&&o.push({name:r,angle:a,area:e.area,perimeter:e.perimeter,motion:e.motion,cameras:e.cameras,hasBreaches:e.perimeter.some(e=>"on"===(this._hass?.states?.[e.entity?.entity_id]||e.state)?.state),hasMotion:e.motion.some(e=>"on"===(this._hass?.states?.[e.entity?.entity_id]||e.state)?.state)})}const c="disarmed"!==t.alarmState,d=this._getSummaryColor(t.alarmState),p=t.allPersons.filter(e=>"home"===e.state?.state).length;return r.qy`
      <div class="tac-perimeter">
        <svg viewBox="0 0 300 300" class="tac-perimeter-svg" role="img"
             aria-label="Perimeter schematic: ${t.perimeterSecure}/${t.perimeterTotal} secure">
          <!-- Shield arcs (F-28, only when armed) -->
          ${c?r.JW`
            <path d="${b(a,s,n,10,80)}" class="tac-shield-arc" style="stroke:${d}" />
            <path d="${b(a,s,n,100,170)}" class="tac-shield-arc" style="stroke:${d}" />
            <path d="${b(a,s,n,190,260)}" class="tac-shield-arc" style="stroke:${d}" />
            <path d="${b(a,s,n,280,350)}" class="tac-shield-arc" style="stroke:${d}" />
          `:""}

          <!-- Sensor ring arcs -->
          ${o.map((e,t)=>{const n=e.angle-20,o=e.angle+20,l=e.hasBreaches?"var(--lcars-tomato)":e.hasMotion?"var(--lcars-sunflower)":"var(--lcars-ice)",c=g(a,s,100,e.angle);return r.JW`
              <path d="${b(a,s,100,n,o)}"
                    class="tac-sensor-arc ${e.hasMotion?"motion-flash":""}"
                    style="stroke:${l}" />
              <circle cx="${c.x}" cy="${c.y}" r="6" fill="${l}"
                      class="tac-sensor-node ${e.hasBreaches?"breach":""}"
                      @click=${()=>(0,i.Hv)(e.perimeter[0]?.entity?.entity_id||e.motion[0]?.entity?.entity_id)} />
              <text x="${g(a,s,116,e.angle).x}"
                    y="${g(a,s,116,e.angle).y}"
                    class="tac-zone-label" text-anchor="middle" dominant-baseline="central">${e.name}</text>
            `})}

          <!-- Shield Core (F-02) -->
          <rect x="${110}" y="${122}" width="80" height="56" rx="8"
                class="tac-shield-core" style="fill:${d}" />
          <text x="${a}" y="${142}" class="tac-shield-text"
                text-anchor="middle" dominant-baseline="central">
            ${t.alarmState.replace(/_/g," ").toUpperCase()}
          </text>
          <text x="${a}" y="${162}" class="tac-shield-subtext"
                text-anchor="middle" dominant-baseline="central">
            ${"hidden"===this._config?.tactical?.privacy?"":p>0?`${p} HOME`:"EMPTY"}
          </text>
        </svg>
      </div>
    `}_renderCameras(e){if(0===e.length)return"";const t=[],a=[];for(const r of e){const e=this._getCameraDetection(r.entity.entity_id);e?t.push({cam:r,det:e}):a.push(r)}return r.qy`
      ${t.length>0?r.qy`
        <div class="tac-section-header">
          <span class="tac-section-label">ACTIVE VIEWSCREENS</span>
          <span class="tac-section-line"></span>
        </div>
        <div class="tac-camera-grid tac-camera-active">
          ${t.map(({cam:e,det:t})=>this._renderCamera(e,t))}
        </div>
      `:""}
      <div class="tac-section-header">
        <span class="tac-section-label">VIEWSCREENS</span>
        <span class="tac-section-line"></span>
        <span class="tac-camera-count">${e.filter(e=>"unavailable"!==(this._hass?.states?.[e.entity?.entity_id]||e.state)?.state).length}/${e.length}</span>
      </div>
      <div class="tac-camera-grid">
        ${a.map(e=>this._renderCamera(e,null))}
      </div>
    `}_renderCamera(e,t){const a=e.entity?.entity_id,s=this._hass?.states?.[a]||e.state,n=(s?.attributes?.friendly_name||a||"").toUpperCase(),o=s?.attributes?.entity_picture,l=s?.state||"unknown",c="unavailable"!==l&&"unknown"!==l&&o?"connecting":"offline",d=t?.level||0,p=$[d],u=k[d],m=C[d]||"none",h=3===d?"PERSON":2===d?"VEHICLE":1===d?"MOTION":"";return r.qy`
      <div class="tac-camera" data-state="${c}" data-level="${d}"
           style="--cam-border:${p}; --cam-scale:${u}; --cam-glow:${m}; --cam-z:${d>0?10+10*d:1}"
           @click=${()=>(0,i.Hv)(a)}
           role="button" tabindex="0" aria-label="${n}${h?` — ${h} DETECTED`:""}">
        <div class="tac-camera__connecting">
          <span class="tac-camera__connecting-text">ESTABLISHING LINK</span>
        </div>
        <div class="tac-camera__offline">
          <ha-icon .icon=${"mdi:video-off"} style="--mdc-icon-size:24px"></ha-icon>
          <span class="tac-camera__offline-text">VIEWSCREEN OFFLINE</span>
        </div>
        ${o?r.qy`
          <img src="${o}" alt="${n}" loading="lazy"
               @load=${e=>{e.target.closest(".tac-camera")?.setAttribute("data-state","live")}}
               @error=${e=>{e.target.closest(".tac-camera")?.setAttribute("data-state","offline")}} />
        `:""}
        <span class="tac-camera__label">
          ${n}
          ${h?r.qy`<span class="tac-camera__detect-badge" style="color:${p}">${h}</span>`:""}
        </span>
      </div>
    `}_renderLockStatus(e,t,a){if(0===t)return"";const i=a===t,s=t-a;return r.qy`
      <div class="tac-structural-bar">
        <span class="tac-bar-label">LOCKS</span>
        <span class="tac-bar-value" style="color:${i?"var(--lcars-ice)":"var(--lcars-tomato)"}">
          ${a}/${t} ${i?"ENGAGED":`· ${s} UNSECURED`}
        </span>
        ${i?"":r.qy`
          <button class="tac-lock-all-btn" @click=${()=>this._lockAll(e)}
                  aria-label="Lock all doors">
            LOCK ALL
          </button>
        `}
      </div>
      <div class="tac-lock-grid">
        ${e.map(e=>{const t=this._hass?.states?.[e.entity?.entity_id]||e.state,a=(t?.attributes?.friendly_name||e.entity?.entity_id||"").toUpperCase(),i="locked"===t?.state;return r.qy`
            <button class="tac-lock-pill ${i?"locked":"unlocked"}"
                    role="switch" aria-checked="${i}"
                    aria-label="${a}: ${i?"locked":"unlocked"}"
                    @click=${()=>this._toggleLock(e.entity.entity_id,i)}>
              <ha-icon .icon=${i?"mdi:lock":"mdi:lock-open"} style="--mdc-icon-size:18px"></ha-icon>
              <span class="tac-lock-name">${a}</span>
              <span class="tac-lock-state">${i?"ENGAGED":"UNSECURED"}</span>
            </button>
          `})}
      </div>
    `}_toggleLock(e,t){this._hass.callService("lock",t?"unlock":"lock",{entity_id:e}),c.e.play(t?"switchToggle":"lockToggle")}_lockAll(e){if(!this._lockAllPending){this._lockAllPending=!0,setTimeout(()=>{this._lockAllPending=!1},5e3);for(const t of e){const e=this._hass?.states?.[t.entity?.entity_id];"locked"!==e?.state&&this._hass.callService("lock","lock",{entity_id:t.entity.entity_id})}c.e.play("acknowledge")}}_renderCrewManifest(e){if(0===e.length)return"";const t=this._config?.tactical?.privacy||"full";if("hidden"===t)return"";const a=e.filter(e=>"home"===e.state?.state),i=e.filter(e=>"home"!==e.state?.state);return"icons"===t?r.qy`<span class="tac-bar-value" style="color:var(--lcars-ice)">${a.length} HOME</span>`:r.qy`
      <div class="tac-structural-bar">
        <span class="tac-bar-label">CREW</span>
        ${a.map(e=>r.qy`<span class="tac-crew-pill home">${(e.state?.attributes?.friendly_name||e.entity_id).toUpperCase()}</span>`)}
        ${i.map(e=>r.qy`<span class="tac-crew-pill away">${(e.state?.attributes?.friendly_name||e.entity_id).toUpperCase()}</span>`)}
      </div>
    `}_renderTimeline(e){return r.qy`
      <div class="tac-timeline" role="img" aria-label="24-hour sensor timeline">
        <span class="tac-timeline-label">SENSOR LOG</span>
        <div class="tac-timeline-track"></div>
      </div>
    `}render(){if(!this._hass)return r.qy`<div class="tac-loading">INITIALIZING TACTICAL SYSTEMS...</div>`;const e=this._getAreasWithTactical(),t=this._getGlobalSummary(e),a="triggered"===t.alarmState||"pending"===t.alarmState;return r.qy`
      <div class="tac-dashboard ${a?"red-alert":""} mode-${this._mode}">
        ${this._renderPerimeter(e,t)}
        ${this._renderCrewManifest(t.allPersons)}
        ${this._renderLockStatus(t.allLocks,t.locksTotal,t.locksLocked)}
        ${this._renderCameras(t.allCameras)}
        ${this._renderTimeline(e)}
      </div>
    `}static get styles(){return[s.Bx,r.AH`
        :host { display: block; }
        .tac-dashboard { display: flex; flex-direction: column; gap: 0.75rem; }
        .tac-loading { font-family: var(--lcars-font, 'Antonio', sans-serif); color: var(--lcars-gray); text-transform: uppercase; padding: 2rem; text-align: center; font-size: 1.25rem; letter-spacing: 0.1em; }

        /* ─── Perimeter Schematic ─── */
        .tac-perimeter { display: flex; justify-content: center; padding: 0.5rem; }
        .tac-perimeter-svg { width: 100%; max-width: 400px; height: auto; }
        .tac-shield-arc {
          fill: none; stroke-width: 3; stroke-linecap: round; opacity: 0.4;
          transition: opacity 300ms ease;
        }
        .mode-tactical .tac-shield-arc, .mode-redalert .tac-shield-arc { opacity: 0.8; stroke-width: 4; }
        .tac-sensor-arc { fill: none; stroke-width: 5; stroke-linecap: round; opacity: 0.6; }
        .tac-sensor-arc.motion-flash {
          opacity: 1; stroke-width: 7;
          animation: tac-arc-flash 2s ease-out forwards;
        }
        @keyframes tac-arc-flash { 0% { opacity: 1; stroke-width: 7; } 100% { opacity: 0.6; stroke-width: 5; } }
        @media (prefers-reduced-motion: reduce) { .tac-sensor-arc.motion-flash { animation: none; opacity: 0.8; } }
        .tac-sensor-node { cursor: pointer; transition: r 300ms ease; }
        .tac-sensor-node:hover { r: 8; }
        .tac-sensor-node.breach { animation: tac-node-pulse 1s ease-in-out infinite; }
        @keyframes tac-node-pulse { 0%, 100% { r: 6; } 50% { r: 9; } }
        @media (prefers-reduced-motion: reduce) { .tac-sensor-node.breach { animation: none; r: 8; } }
        .tac-zone-label {
          font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 9px;
          fill: var(--lcars-gray, #666688); text-transform: uppercase; letter-spacing: 0.08em;
        }
        .tac-shield-core { opacity: 0.9; transition: fill 500ms ease; }
        .tac-shield-text {
          font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 11px;
          fill: var(--lcars-black, #000); text-transform: uppercase; letter-spacing: 0.08em; font-weight: bold;
        }
        .tac-shield-subtext {
          font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 8px;
          fill: var(--lcars-black, #000); text-transform: uppercase; opacity: 0.7;
        }

        /* ─── Section Headers ─── */
        .tac-section-header { display: flex; align-items: center; gap: 0.5rem; }
        .tac-section-label {
          font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 1.25rem;
          color: var(--lcars-ice, #99ccff); text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap;
        }
        .tac-section-line { flex: 1; height: 2px; background: var(--lcars-ice, #99ccff); opacity: 0.4; }
        .tac-camera-count {
          font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 1rem;
          color: var(--lcars-ice, #99ccff); white-space: nowrap;
        }

        /* ─── Camera Grid ─── */
        .tac-camera-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(min(16rem, 100%), 1fr));
          gap: 0.375rem; overflow: visible;
        }
        .tac-camera-active { padding: 0.5rem 0; }
        .tac-camera {
          position: relative; border-radius: 0.25rem; overflow: visible;
          cursor: pointer; border: 2px solid var(--cam-border, var(--lcars-butterscotch));
          aspect-ratio: 16/9; background: var(--lcars-bg, #000);
          transform: scale(var(--cam-scale, 1)); transform-origin: center center;
          box-shadow: var(--cam-glow, none);
          transition: transform 300ms ease, box-shadow 300ms ease, border-color 300ms ease;
          z-index: var(--cam-z, 1);
        }
        .tac-camera img { width: 100%; height: 100%; object-fit: cover; display: block; position: relative; z-index: 0; border-radius: 0.2rem; }
        .tac-camera__label {
          position: absolute; bottom: 0; left: 0; right: 0; z-index: 3;
          padding: 0.25rem 0.5rem; font-family: var(--lcars-font, 'Antonio', sans-serif);
          font-size: 0.75rem; color: var(--lcars-space-white, #f5f6fa);
          background: rgba(0,0,0,0.6); text-transform: uppercase;
          display: flex; justify-content: space-between; align-items: center;
        }
        .tac-camera__detect-badge { font-size: 0.65rem; font-weight: bold; }
        .tac-camera:focus-visible { outline: 2px solid var(--lcars-space-white, #f5f6fa); outline-offset: 2px; }

        /* Camera state overlays */
        .tac-camera__connecting, .tac-camera__offline {
          position: absolute; inset: 0; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 0.25rem;
          background: var(--lcars-bg, #000); z-index: 2; border-radius: 0.2rem;
          opacity: 0; visibility: hidden; transition: opacity 300ms ease-out, visibility 300ms ease-out;
        }
        .tac-camera[data-state="connecting"] .tac-camera__connecting {
          opacity: 1; visibility: visible;
          transition: opacity 300ms ease-out 500ms, visibility 300ms ease-out 500ms;
        }
        .tac-camera[data-state="connecting"] .tac-camera__offline,
        .tac-camera[data-state="offline"] .tac-camera__connecting,
        .tac-camera[data-state="live"] .tac-camera__connecting,
        .tac-camera[data-state="live"] .tac-camera__offline { opacity: 0; visibility: hidden; }
        .tac-camera[data-state="offline"] .tac-camera__offline { opacity: 1; visibility: visible; }
        .tac-camera__connecting-text {
          font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 0.7rem;
          color: var(--lcars-ice, #99ccff); text-transform: uppercase; letter-spacing: 0.1em;
          animation: tac-breathe 4s ease-in-out infinite;
        }
        .tac-camera__offline ha-icon { color: var(--lcars-gray, #666688); }
        .tac-camera__offline-text {
          font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 0.7rem;
          color: var(--lcars-gray, #666688); text-transform: uppercase; letter-spacing: 0.1em;
        }
        @keyframes tac-breathe { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @media (prefers-reduced-motion: reduce) { .tac-camera__connecting-text { animation: none; } }

        /* ─── Structural Bars ─── */
        .tac-structural-bar {
          display: flex; align-items: center; gap: 0.5rem; padding: 0.375rem 0.75rem;
          background: var(--lcars-butterscotch, #ff9966); border-radius: 0.375rem;
          font-family: var(--lcars-font, 'Antonio', sans-serif); text-transform: uppercase;
          color: var(--lcars-black, #000); min-height: 2rem;
        }
        .tac-bar-label { font-size: 0.75rem; letter-spacing: 0.08em; opacity: 0.7; }
        .tac-bar-value { font-size: 0.875rem; font-variant-numeric: tabular-nums; }

        /* Crew pills */
        .tac-crew-pill {
          display: inline-block; padding: 0.125rem 0.5rem; border-radius: 0 1rem 1rem 0;
          font-size: 0.75rem; letter-spacing: 0.05em;
        }
        .tac-crew-pill.home { background: var(--lcars-ice, #99ccff); color: var(--lcars-black, #000); }
        .tac-crew-pill.away { background: var(--lcars-gray, #666688); color: var(--lcars-space-white, #f5f6fa); }

        /* Lock All button */
        .tac-lock-all-btn {
          margin-left: auto; padding: 0.25rem 0.75rem; border: none;
          border-radius: 0 1rem 1rem 0; background: var(--lcars-gold, #ffaa00);
          color: var(--lcars-black, #000); font-family: var(--lcars-font, 'Antonio', sans-serif);
          font-size: 0.75rem; text-transform: uppercase; cursor: pointer;
          transition: filter 200ms ease;
        }
        .tac-lock-all-btn:hover { filter: brightness(1.2); }
        .tac-lock-all-btn:focus-visible { outline: 2px solid var(--lcars-space-white); outline-offset: 2px; }

        /* Lock individual pills */
        .tac-lock-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(min(14rem, 100%), 1fr));
          gap: 0.375rem;
        }
        .tac-lock-pill {
          display: flex; align-items: center; gap: 0.5rem; height: 3rem; padding: 0 1rem;
          border: none; border-radius: 0 var(--lcars-btn-radius, 1.5rem) var(--lcars-btn-radius, 1.5rem) 0;
          font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 1rem;
          text-transform: uppercase; cursor: pointer; transition: background 200ms ease, filter 200ms ease;
        }
        .tac-lock-pill.locked {
          background: var(--lcars-ice, #99ccff); color: var(--lcars-black, #000);
        }
        .tac-lock-pill.unlocked {
          background: var(--lcars-tomato, #ff5555); color: var(--lcars-black, #000);
        }
        .tac-lock-pill:hover { filter: brightness(1.2); }
        .tac-lock-pill:focus-visible { outline: 2px solid var(--lcars-space-white); outline-offset: 2px; }
        .tac-lock-name { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .tac-lock-state { font-size: 0.75rem; opacity: 0.8; flex-shrink: 0; }

        /* ─── Timeline ─── */
        .tac-timeline {
          display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0;
        }
        .tac-timeline-label {
          font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 0.625rem;
          color: var(--lcars-gray, #666688); text-transform: uppercase; letter-spacing: 0.08em; white-space: nowrap;
        }
        .tac-timeline-track {
          flex: 1; height: 1.5rem; background: rgba(153,204,255,0.08);
          border-radius: 0 0.75rem 0.75rem 0;
        }

        /* ─── Red Alert ─── */
        .red-alert { }
        .red-alert .tac-perimeter-svg .tac-shield-core {
          animation: tac-redalert-pulse 1s ease-in-out infinite;
        }
        @keyframes tac-redalert-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @media (prefers-reduced-motion: reduce) { .red-alert .tac-perimeter-svg .tac-shield-core { animation: none; } }
      `]}}Promise.race([customElements.whenDefined("hui-masonry-view"),new Promise(e=>setTimeout(e,5e3))]).then(()=>{customElements.get("tactical-card")||customElements.define("tactical-card",E)})},5884(e,t,a){var r=a(7349),i=a(2622),s=a(8851),n=a(6940),o=a(5824);const l="all",c="access",d="zones";class p extends r.WF{static get properties(){return{cards:{type:Array},_hass:{type:Object},_config:{type:Object},_filter:{type:String},_siteName:{type:String},_audioMuted:{type:Boolean},_editMode:{type:Boolean}}}constructor(){super(),this.cards=[],this._hass=null,this._config={},this._filter=l,this._siteName="LCARS",this._audioMuted=n.e.isMuted,this._editMode=!1}setConfig(e){this._config=e}set hass(e){this._hass=e,e?.config?.location_name&&(this._siteName=e.config.location_name.toUpperCase()),this.cards&&this.cards.forEach(t=>{t&&(t.hass=e)}),(0,o.X)(e)}_setFilter(e){this._filter=e,n.e.play("navAcknowledge"),s.o6.dispatchEvent(new CustomEvent("lcars-tac-filter",{detail:{filter:e}}))}_toggleMute(){n.e.toggle(),this._audioMuted=n.e.isMuted}_openSidebarReorder(){if(!this._hass?.user?.is_admin)return;let e=this.shadowRoot.querySelector("lcars-sidebar-reorder");e||(e=document.createElement("lcars-sidebar-reorder"),this.shadowRoot.appendChild(e)),e.hass=this._hass,e.open()}_toggleEditMode(){this._editMode=!this._editMode,s.o6.dispatchEvent(new CustomEvent("lcars-tac-edit",{detail:{enabled:this._editMode}}))}render(){const e=a(8330).version;return r.qy`
      <div class="lcars-frame">
        <div class="lcars-elbow-top" aria-hidden="true"></div>
        <div class="lcars-header" role="banner">
          <span class="lcars-header-title">${this._siteName}</span>
          <div class="lcars-header-bar" aria-hidden="true"></div>
          <div class="lcars-header-endcap">
            <button class="mute-btn" role="switch" aria-checked=${!this._audioMuted} aria-label="Dashboard sounds" @click=${()=>this._toggleMute()}>
              <ha-icon .icon=${this._audioMuted?"mdi:volume-off":"mdi:volume-high"}></ha-icon>
            </button>
            ${this._hass?.user?.is_admin?r.qy`
              <button class="mute-btn" aria-label="Reorder sidebar dashboards" @click=${()=>this._openSidebarReorder()}>
                <ha-icon .icon=${"mdi:sort-variant"}></ha-icon>
              </button>
              <button class="mute-btn" aria-pressed=${this._editMode} aria-label="${this._editMode?"Exit configuration mode":"Enter configuration mode"}" @click=${()=>this._toggleEditMode()}>
                <ha-icon .icon=${"mdi:cog-outline"}></ha-icon>
              </button>
            `:""}
          </div>
        </div>
        <nav class="lcars-sidebar" role="tablist" aria-label="Filter tactical devices">
          <div class="lcars-sidebar-panel">Tactical</div>
          <div class="lcars-sidebar-filters">
            <button class="sidebar-filter-btn ${this._filter===l?"active":""}" role="tab" aria-selected="${this._filter===l?"true":"false"}" @click=${()=>this._setFilter(l)}>
              <span class="filter-label">ALL</span>
            </button>
            <button class="sidebar-filter-btn ${this._filter===c?"active":""}" role="tab" aria-selected="${this._filter===c?"true":"false"}" @click=${()=>this._setFilter(c)}>
              <span class="filter-label">ACCESS</span>
            </button>
            <button class="sidebar-filter-btn ${this._filter===d?"active":""}" role="tab" aria-selected="${this._filter===d?"true":"false"}" @click=${()=>this._setFilter(d)}>
              <span class="filter-label">ZONES</span>
            </button>
          </div>
          <div class="lcars-sidebar-filler" aria-hidden="true"></div>
        </nav>
        <main class="lcars-content" id="lcars-main-content" aria-label="Tactical dashboard">
          ${this.cards?.length>0?this.cards.map(e=>r.qy`${e}`):r.qy`<div class="lcars-heading">No data available</div>`}
        </main>
        <div class="lcars-elbow-bottom" aria-hidden="true"></div>
        <div class="lcars-footer" role="contentinfo">
          <div class="lcars-footer-bar" aria-hidden="true"></div>
          <span class="lcars-footer-text">LCARS ${e}</span>
          <div class="lcars-footer-endcap" aria-hidden="true"></div>
        </div>
      </div>
    `}static get styles(){return[i.Bx,r.AH`
        :host { display: block; height: calc(100vh - var(--header-height, 0px)); overflow: hidden; box-sizing: border-box; background: var(--lcars-bg, #000); padding: var(--lcars-gap, 0.25rem); }
        .lcars-frame { display: grid; grid-template-columns: var(--lcars-sidebar-w, 12rem) 1fr; grid-template-rows: var(--lcars-elbow-h, 4.5rem) 1fr var(--lcars-elbow-h, 4.5rem); gap: var(--lcars-gap, 0.25rem); height: 100%; }
        .lcars-elbow-top { grid-column: 1; grid-row: 1; background: var(--lcars-ice, #99ccff); border-radius: var(--lcars-elbow-radius, 3.75rem) 0 0 0; position: relative; overflow: hidden; }
        .lcars-elbow-top::after { content: ''; position: absolute; bottom: 0; right: 0; width: calc(var(--lcars-sidebar-w, 12rem) - var(--lcars-elbow-w, 9.5rem)); height: calc(var(--lcars-elbow-h, 4.5rem) - var(--lcars-bar-h, 1.5rem)); background: var(--lcars-bg, #000); border-radius: 1.5rem 0 0 0; }
        .lcars-header { grid-column: 2; grid-row: 1; display: flex; align-items: flex-start; gap: var(--lcars-gap, 0.25rem); }
        .lcars-header-title { font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: var(--lcars-font-size-title, 2rem); color: var(--lcars-ice, #99ccff); text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap; line-height: var(--lcars-bar-h, 1.5rem); padding: 0 1rem; }
        .lcars-header-bar { flex: 1; height: var(--lcars-bar-h, 1.5rem); background: var(--lcars-ice, #99ccff); }
        .lcars-header-endcap { height: var(--lcars-bar-h, 1.5rem); background: var(--lcars-ice, #99ccff); border-radius: 0; display: flex; align-items: center; padding: 0 0.5rem; }
        .mute-btn { background: none; border: none; cursor: pointer; color: var(--lcars-black, #000); padding: 0 0.25rem; display: flex; align-items: center; }
        .mute-btn:focus-visible { outline: 2px solid var(--lcars-ice, #99ccff); outline-offset: 2px; }
        .mute-btn ha-icon { --mdc-icon-size: 18px; }
        .lcars-sidebar { grid-column: 1; grid-row: 2; display: flex; flex-direction: column; gap: var(--lcars-gap, 0.25rem); overflow: hidden; }
        .lcars-sidebar-panel { background: var(--lcars-african-violet, #cc99ff); color: var(--lcars-black, #000); font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: var(--lcars-font-size-data, 0.875rem); text-transform: uppercase; padding: 0.25rem 0.5rem; text-align: right; border-radius: 0 0 0 var(--lcars-btn-radius, 1.5rem); flex-shrink: 0; }
        .lcars-sidebar-filters { display: flex; flex-direction: column; gap: var(--lcars-gap, 0.25rem); flex: 1; }
        .sidebar-filter-btn { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem; border: none; border-radius: var(--lcars-btn-radius, 1.5rem) 0 0 var(--lcars-btn-radius, 1.5rem); background: var(--lcars-african-violet, #cc99ff); color: var(--lcars-black, #000); font-family: var(--lcars-font, 'Antonio', sans-serif); text-transform: uppercase; cursor: pointer; transition: background 200ms ease; padding: 0.5rem; }
        .sidebar-filter-btn:hover { filter: brightness(1.2); }
        .sidebar-filter-btn:focus-visible { outline: 2px solid var(--lcars-ice, #99ccff); outline-offset: 2px; }
        .sidebar-filter-btn.active { background: var(--lcars-gold, #ffaa00); }
        .filter-label { font-size: 1.25rem; letter-spacing: 0.08em; text-align: center; }
        .lcars-sidebar-filler { flex: 1 0 0px; min-height: 0; background: var(--lcars-gray, #666688); border-radius: var(--lcars-btn-radius, 1.5rem) 0 0 0; }
        .lcars-content { grid-column: 2; grid-row: 2; overflow-y: auto; overflow-x: hidden; padding: 0.5rem; scrollbar-width: thin; scrollbar-color: var(--lcars-gray, #666688) transparent; }
        .lcars-elbow-bottom { grid-column: 1; grid-row: 3; background: var(--lcars-african-violet, #cc99ff); border-radius: 0 0 0 var(--lcars-elbow-radius, 3.75rem); position: relative; overflow: hidden; }
        .lcars-elbow-bottom::after { content: ''; position: absolute; top: 0; right: 0; width: calc(var(--lcars-sidebar-w, 12rem) - var(--lcars-elbow-w, 9.5rem)); height: calc(var(--lcars-elbow-h, 4.5rem) - var(--lcars-bar-h, 1.5rem)); background: var(--lcars-bg, #000); border-radius: 0 0 0 1.5rem; }
        .lcars-footer { grid-column: 2; grid-row: 3; display: flex; align-items: flex-end; gap: var(--lcars-gap, 0.25rem); }
        .lcars-footer-bar { flex: 1; height: var(--lcars-bar-h, 1.5rem); background: var(--lcars-african-violet, #cc99ff); }
        .lcars-footer-text { font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: var(--lcars-font-size-data, 0.875rem); color: var(--lcars-sky, #aaaaff); text-transform: uppercase; white-space: nowrap; line-height: var(--lcars-bar-h, 1.5rem); padding: 0 0.5rem; }
        .lcars-footer-endcap { width: var(--lcars-endcap-size, 1.5rem); height: var(--lcars-bar-h, 1.5rem); background: var(--lcars-african-violet, #cc99ff); border-radius: 0; flex-shrink: 0; }
      `]}}Promise.race([customElements.whenDefined("hui-masonry-view"),new Promise(e=>setTimeout(e,5e3))]).then(()=>{customElements.get("lcars-tactical-layout")||customElements.define("lcars-tactical-layout",p)})},6564(e,t,a){var r=a(7349),i=a(7850),s=a(4867),n=a(9411),o=a(1109);const l=r.AH`
  :host {
    display: block;
  }

  /* ═══ Device Panel Content ═══ */
  .lcars-device-panel {
    --panel-frame-color: var(--lcars-butterscotch);
    display: grid;
    gap: var(--lcars-gap);
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
`;var c=a(6940);class d extends i.j{get panelType(){return"battery"}get defaultPanelTitle(){return"Battery"}get frameColor(){return"var(--lcars-ice)"}static get styles(){return[...super.styles,o.PF,o.yW,l]}_classifyPowerEntity(e){const t=(e||"").toLowerCase();return/total\s*in\s*power/.test(t)?{side:"in",type:"total"}:/total\s*out\s*power/.test(t)?{side:"out",type:"total"}:/solar.*in.*power/.test(t)?{side:"in",type:"solar"}:/ac.*in.*power/.test(t)?{side:"in",type:"ac"}:/ac.*out.*power/.test(t)?{side:"out",type:"ac"}:/dc.*out.*power/.test(t)?{side:"out",type:"dc"}:/usb.*out.*power/.test(t)?{side:"out",type:"usb"}:/type.*c.*out.*power/.test(t)?{side:"out",type:"usbc"}:/power.*i.*o.*input.*power/.test(t)?{side:"in",type:"pio"}:/power.*i.*o.*output.*power/.test(t)?{side:"out",type:"pio"}:/anderson.*out.*power/.test(t)?{side:"out",type:"dc"}:/alternator.*in.*power/.test(t)?{side:"in",type:"alt"}:/station.*power/.test(t)?{side:"out",type:"station"}:/\bin\b/.test(t)?{side:"in",type:"other"}:/\bout\b/.test(t)?{side:"out",type:"other"}:null}_isNutDevice(e){let t=!1,a=!1,r=!1;for(const i of e){const e=i.state?.attributes||{},s=e.device_class||"",n=e.unit_of_measurement||"";"battery"===s&&"%"===n&&(t=!0),"power"===s&&"W"===n&&(a=!0);const o=i.entity?.entity_id||"";/ups[._]load|ups[._]status/i.test(o)&&(r=!0),"voltage"===s&&"V"===n&&(r=!0)}return t&&!a&&r}_parseNutStatus(e){const t=(e||"").toUpperCase();return{online:t.includes("OL"),onBattery:t.includes("OB"),charging:t.includes("CHRG"),lowBattery:t.includes("LB"),shutdown:t.includes("FSD"),off:"OFF"===t}}_formatNutRuntime(e){const t=parseInt(e,10);if(isNaN(t)||t<0)return"N/A";const a=Math.floor(t/3600),r=Math.floor(t%3600/60);return a>0?`${a}h ${r}m`:`${r}m`}_partitionBatteryEntities(e,t){const a=[],r=[],i=[],s=[],n=[],o=[],l=[],c=this._isNutDevice(e);let d=null,p=null,u=null,m=null,h=null;for(const t of e){const e=t.state?.attributes||{},o=e.device_class||"",l=e.unit_of_measurement||"",f=t.domain,v=e.friendly_name||t.entity.entity_id,g=t.entity?.entity_id||"";if(["switch","number","button","select"].includes(f))n.push(t);else if("battery"!==o||"%"!==l)if(c){if(/ups[._]load$/i.test(g)||/\bload\b/i.test(v)&&"%"===l){d=t;continue}if(/ups[._]status_data$/i.test(g)||/status\s*data/i.test(v)){u=t;continue}if(/ups[._]status$/i.test(g)&&!/status_data/i.test(g)){p=t;continue}if(/nominal.*real.*power|realpower.*nominal/i.test(v)){m=parseFloat(t.state?.state)||null,s.push(t);continue}if("duration"===o||/battery.*runtime/i.test(g)){h=t,s.push(t);continue}if("voltage"===o&&"V"===l){s.push(t);continue}s.push(t)}else{if("power"===o&&"W"===l){const e=this._classifyPowerEntity(v);e?"in"===e.side?r.push({...t,ioType:e.type}):i.push({...t,ioType:e.type}):s.push(t);continue}s.push(t)}else a.push(t)}if(c){const e=u?.state?.state||"",t=this._parseNutStatus(e),a=d&&parseFloat(d.state?.state)||0,r=m?Math.round(a*m/100):null;if(d){const e=null!=r?`${r}W (${a}%)`:`${a}%`;i.push({...d,ioType:"total",_nutSynthetic:!0,_nutDisplayValue:e,_nutWatts:r||a})}this._nutStatus=t,this._nutStatusEntry=p,this._nutRuntimeEntry=h,this._nutLoadEntry=d,this._nutComputedWatts=r}else this._nutStatus=null;if(t){for(const e of t.config){const t=this._getEntityState(e.entity_id);t&&o.push({entity:e,domain:e.entity_id.split(".")[0],state:t})}for(const e of t.diagnostic){const t=this._getEntityState(e.entity_id);t&&l.push({entity:e,domain:e.entity_id.split(".")[0],state:t})}}return{soc:a,powerIn:r,powerOut:i,telemetry:s,controls:n,configControls:o,diagnostics:l}}_getCoreColor(e){return e>=80?"var(--lcars-ice)":e>=60?"var(--lcars-sky)":e>=40?"var(--lcars-bluey)":e>=20?"var(--lcars-butterscotch)":e>=10?"var(--lcars-peach)":"var(--lcars-tomato)"}_getFlowSpeed(e){const t=Math.abs(parseFloat(e)||0);return 0===t?"flow-stopped":t>1e3?"flow-fast":t>100?"flow-medium":"flow-slow"}renderBadge(){const{soc:e}=this._partitionBatteryEntities(this.group.entities,this._getDeviceCategoryEntities(this.group.device.id)),t=e[0],a=t&&parseFloat(t.state.state)||0,i=t&&"unavailable"!==t.state.state&&"unknown"!==t.state.state,s=i?this._getCoreColor(a):"var(--lcars-gray)";return r.qy`<span style="color:${s}">${i?`${Math.round(a)}%`:"N/A"}</span>`}renderContent(){const e=this._getDeviceCategoryEntities(this.group.device.id),{soc:t,powerIn:a,powerOut:i,telemetry:o,controls:l,configControls:d,diagnostics:p}=this._partitionBatteryEntities(this.group.entities,e),u=this._shortDeviceName(this.group.device)||"Battery",m=t[0],h=m&&parseFloat(m.state.state)||0,f=m&&"unavailable"!==m.state.state&&"unknown"!==m.state.state,v=f?this._getCoreColor(h):"var(--lcars-gray)",g=a.find(e=>"total"===e.ioType),b=i.find(e=>"total"===e.ioType),y=g&&parseFloat(g.state.state)||0,_=b&&!b._nutSynthetic&&parseFloat(b.state.state)||0;let w,x,$;this._nutStatus?(w=this._nutStatus.charging,x=this._nutStatus.onBattery,$=!w&&!x):(w=y>5,x=_>5,$=!w&&!x);const k=new Set;a.filter(e=>"total"!==e.ioType).forEach(e=>k.add(e.ioType)),i.filter(e=>"total"!==e.ioType).forEach(e=>k.add(e.ioType));const S=[...k].map(e=>({type:e,label:e.toUpperCase(),inEntry:a.find(t=>t.ioType===e),outEntry:i.find(t=>t.ioType===e)})),C=o.filter(e=>{const t=e.state?.attributes?.device_class||"",a=(e.state?.attributes?.friendly_name||"").toLowerCase();return"temperature"===t||"duration"===t||"voltage"===t||/state.*health|cycles|remain.*time|status|error.*code|battery.*count|runtime|load/.test(a)}).slice(0,8),E=p.filter(e=>{const t=e.state?.attributes?.device_class||"",a=(e.state?.attributes?.friendly_name||"").toLowerCase();return"temperature"===t||/cycles|status|error|battery.*count|charging.*state|power.*diff/.test(a)}).slice(0,8);return r.qy`
      <div class="battery-content">
        <!-- Telemetry (left) -->
        <div class="battery-telemetry" role="list" aria-label="${u} telemetry">
          ${this._nutStatus&&this._nutStatusEntry?r.qy`
            <div class="battery-total-line" tabindex="0" role="button"
              @click=${()=>this._handleEntityClick(this._nutStatusEntry.entity.entity_id)}
              @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._handleEntityClick(this._nutStatusEntry.entity.entity_id))}}>
              <ha-icon icon="mdi:${this._nutStatus.onBattery?"battery-alert":"power-plug"}" style="--mdc-icon-size:14px;color:${this._nutStatus.onBattery?"var(--lcars-butterscotch)":"var(--lcars-ice)"}"></ha-icon>
              <span class="sensor-label">Status</span>
              <span class="sensor-state-value" style="color:${this._nutStatus.onBattery?"var(--lcars-butterscotch)":"var(--lcars-ice)"}">${this._nutStatusEntry.state.state}</span>
            </div>
          `:""}
          ${this._nutStatus&&this._nutLoadEntry?r.qy`
            <div class="battery-total-line" tabindex="0" role="button"
              @click=${()=>this._handleEntityClick(this._nutLoadEntry.entity.entity_id)}
              @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._handleEntityClick(this._nutLoadEntry.entity.entity_id))}}>
              <ha-icon icon="mdi:gauge" style="--mdc-icon-size:14px;color:var(--lcars-butterscotch)"></ha-icon>
              <span class="sensor-label">Load</span>
              <span class="sensor-state-value" style="color:var(--lcars-butterscotch)">${b?._nutDisplayValue||this._nutLoadEntry.state.state+"%"}</span>
            </div>
          `:""}
          ${this._nutStatus&&this._nutRuntimeEntry?r.qy`
            <div class="battery-total-line" tabindex="0" role="button"
              @click=${()=>this._handleEntityClick(this._nutRuntimeEntry.entity.entity_id)}
              @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._handleEntityClick(this._nutRuntimeEntry.entity.entity_id))}}>
              <ha-icon icon="mdi:timer-outline" style="--mdc-icon-size:14px;color:var(--lcars-sky)"></ha-icon>
              <span class="sensor-label">Runtime</span>
              <span class="sensor-state-value" style="color:var(--lcars-sky)">${this._formatNutRuntime(this._nutRuntimeEntry.state.state)}</span>
            </div>
          `:""}
          ${!this._nutStatus&&g?r.qy`
            <div class="battery-total-line" tabindex="0" role="button"
              @click=${()=>this._handleEntityClick(g.entity.entity_id)}
              @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._handleEntityClick(g.entity.entity_id))}}>
              <ha-icon icon="mdi:transmission-tower-import" style="--mdc-icon-size:14px;color:var(--lcars-ice)"></ha-icon>
              <span class="sensor-label">Total In</span>
              <span class="sensor-state-value" style="color:var(--lcars-ice)">${(0,n.ZV)(g.state.state,"power")} W</span>
            </div>
          `:""}
          ${!this._nutStatus&&b?r.qy`
            <div class="battery-total-line" tabindex="0" role="button"
              @click=${()=>this._handleEntityClick(b.entity.entity_id)}
              @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._handleEntityClick(b.entity.entity_id))}}>
              <ha-icon icon="mdi:transmission-tower-export" style="--mdc-icon-size:14px;color:var(--lcars-butterscotch)"></ha-icon>
              <span class="sensor-label">Total Out</span>
              <span class="sensor-state-value" style="color:var(--lcars-butterscotch)">${(0,n.ZV)(b.state.state,"power")} W</span>
            </div>
          `:""}
          ${C.map(({entity:e,state:t})=>{const a=this._friendlyName(t,e),i=(0,n.ZV)(t.state,t.attributes?.device_class||""),s=t.attributes?.unit_of_measurement||"",o=this._getSensorIndicatorColor(t);return r.qy`
              <lcars-sensor-row
                label="${a}"
                value="${i}${s?" "+s:""}"
                color="${o}"
                entity-id="${e.entity_id}">
              </lcars-sensor-row>
            `})}
          ${E.length>0?r.qy`
            <lcars-section-divider label="DIAGNOSTICS"></lcars-section-divider>
            ${E.map(({entity:e,state:t})=>{const a=this._friendlyName(t,e),i=(0,n.ZV)(t.state,t.attributes?.device_class||""),s=t.attributes?.unit_of_measurement||"",o=this._getSensorIndicatorColor(t);return r.qy`
                <lcars-sensor-row
                  label="${a}"
                  value="${i}${s?" "+s:""}"
                  color="${o}"
                  entity-id="${e.entity_id}">
                </lcars-sensor-row>
              `})}
          `:""}
        </div>

        <!-- Warp Core (center) -->
        <div class="warp-core-container" role="meter"
          aria-valuenow="${h}" aria-valuemin="0" aria-valuemax="100"
          aria-label="Battery charge level: ${Math.round(h)} percent">
          <div class="warp-core" style="--core-color:${v};--core-charge:${f?h:0}">
            <div class="warp-core-fill ${$?"core-idle":""} ${w?"core-charging":""}">
              <div class="warp-core-stream"></div>
            </div>
            <div class="warp-core-tick" style="bottom:25%"></div>
            <div class="warp-core-tick" style="bottom:50%"></div>
            <div class="warp-core-tick" style="bottom:75%"></div>
          </div>
        </div>

        <!-- Controls (right) -->
        <div class="battery-controls" aria-label="${u} controls">
          ${l.map(({entity:e,state:t})=>{const a=this._friendlyName(t,e),i=e.entity_id.split(".")[0];if("number"===i){const i=t.attributes?.min||0,s=t.attributes?.max||100,o=parseFloat(t.state)||0,l=t.attributes?.unit_of_measurement||"",c=s>i?(o-i)/(s-i)*100:0;return r.qy`
                <div class="battery-slider-control">
                  <span class="battery-slider-label" id="slider-${e.entity_id}">${a}</span>
                  <div class="battery-slider-track"
                    tabindex="0" role="slider"
                    aria-labelledby="slider-${e.entity_id}"
                    aria-valuemin="${i}" aria-valuemax="${s}" aria-valuenow="${o}"
                    @click=${t=>{const a=t.currentTarget.getBoundingClientRect(),r=Math.max(0,Math.min(1,(t.clientX-a.left)/a.width)),n=Math.round(i+r*(s-i));this.hass.callService("number","set_value",{entity_id:e.entity_id,value:n})}}
                    @keydown=${t=>{let a=o;if("ArrowRight"===t.key||"ArrowUp"===t.key)a=Math.min(s,o+1);else if("ArrowLeft"===t.key||"ArrowDown"===t.key)a=Math.max(i,o-1);else if("Home"===t.key)a=i;else{if("End"!==t.key)return;a=s}t.preventDefault(),this.hass.callService("number","set_value",{entity_id:e.entity_id,value:a})}}>
                    <div class="battery-slider-fill" style="width:${c}%"></div>
                    <div class="battery-slider-thumb" style="left:${c}%"></div>
                  </div>
                  <span class="battery-slider-value">${(0,n.ZV)(String(o),t.attributes?.device_class||"")}${l?" "+l:""}</span>
                </div>
              `}const o="on"===t.state,l=this._isOff(t);return r.qy`
              <button class="device-control-btn" ?data-on=${o} ?data-off=${l}
                @click=${()=>s.Zz.has(i)?this._handleToggle(e.entity_id):this._handleEntityClick(e.entity_id)}
                title="${a}: ${t.state}">
                <ha-icon .icon=${this._getEntityIcon(t)}></ha-icon>
                <span>${a}</span>
              </button>
            `})}
          ${d.length>0?r.qy`
            <lcars-section-divider label="CONFIG"></lcars-section-divider>
            ${d.map(({entity:e,state:t})=>{const a=this._friendlyName(t,e),i=e.entity_id.split(".")[0];if("number"===i){const i=t.attributes?.min||0,s=t.attributes?.max||100,o=t.attributes?.step||1,l=parseFloat(t.state)||0,c=t.attributes?.unit_of_measurement||"",d=s>i?(l-i)/(s-i)*100:0;return r.qy`
                  <div class="battery-slider-control">
                    <span class="battery-slider-label" id="slider-${e.entity_id}">${a}</span>
                    <div class="battery-slider-track"
                      tabindex="0" role="slider"
                      aria-labelledby="slider-${e.entity_id}"
                      aria-valuemin="${i}" aria-valuemax="${s}" aria-valuenow="${l}"
                      @click=${t=>{const a=t.currentTarget.getBoundingClientRect(),r=Math.max(0,Math.min(1,(t.clientX-a.left)/a.width));let n=i+r*(s-i);n=Math.round(n/o)*o,n=Math.max(i,Math.min(s,n)),this.hass.callService("number","set_value",{entity_id:e.entity_id,value:n})}}
                      @keydown=${t=>{let a=l;if("ArrowRight"===t.key||"ArrowUp"===t.key)a=Math.min(s,l+o);else if("ArrowLeft"===t.key||"ArrowDown"===t.key)a=Math.max(i,l-o);else if("Home"===t.key)a=i;else{if("End"!==t.key)return;a=s}t.preventDefault(),this.hass.callService("number","set_value",{entity_id:e.entity_id,value:a})}}>
                      <div class="battery-slider-fill" style="width:${d}%"></div>
                      <div class="battery-slider-thumb" style="left:${d}%"></div>
                    </div>
                    <span class="battery-slider-value">${(0,n.ZV)(String(l),t.attributes?.device_class||"")}${c?" "+c:""}</span>
                  </div>
                `}if("select"===i){const i=t.attributes?.options||[],s=t.state;return r.qy`
                  <div class="lcars-option-strip" role="radiogroup" aria-label="${a}">
                    <span class="lcars-option-strip-label">${a}</span>
                    <div class="lcars-option-strip-btns">
                      ${i.map(t=>r.qy`
                        <button class="lcars-option-btn"
                          role="radio"
                          aria-checked="${t===s}"
                          ?data-selected=${t===s}
                          @click=${()=>{c.e.play("switchToggle"),this.hass.callService("select","select_option",{entity_id:e.entity_id,option:t})}}>
                          ${t}
                        </button>
                      `)}
                    </div>
                  </div>
                `}const o="on"===t.state,l=this._isOff(t);return r.qy`
                <button class="device-control-btn" ?data-on=${o} ?data-off=${l}
                  @click=${()=>s.Zz.has(i)?this._handleToggle(e.entity_id):this._handleEntityClick(e.entity_id)}
                  title="${a}: ${t.state}">
                  <ha-icon .icon=${this._getEntityIcon(t)}></ha-icon>
                  <span>${a}</span>
                </button>
              `})}
          `:""}
        </div>

        <!-- Power I/O Flow (bottom) -->
        <div class="battery-io-flow" aria-label="Power flow">
          ${this._nutStatus?r.qy`
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
                <span class="io-watts" style="color:var(--lcars-butterscotch)">${b?._nutDisplayValue||"—"}</span>
              </div>
            </div>
          `:r.qy`
          ${S.map(e=>{const t=e.inEntry&&parseFloat(e.inEntry.state.state)||0,a=e.outEntry&&parseFloat(e.outEntry.state.state)||0,i=this._getFlowSpeed(t),s=this._getFlowSpeed(a);return r.qy`
              <div class="io-pair-row">
                <div class="io-port io-in" aria-label="${e.label} input: ${t} watts">
                  <span class="io-label">${e.label} IN</span>
                  <span class="io-watts" style="color:var(--lcars-ice)">${t>0?`${Math.round(t)}W`:"—"}</span>
                </div>
                <div class="io-conduit io-conduit-in ${i}"></div>
                <div class="io-core-gap"></div>
                <div class="io-conduit io-conduit-out ${s}"></div>
                <div class="io-port io-out" aria-label="${e.label} output: ${a} watts">
                  <span class="io-label">${e.label} OUT</span>
                  <span class="io-watts" style="color:var(--lcars-butterscotch)">${a>0?`${Math.round(a)}W`:"—"}</span>
                </div>
              </div>
            `})}
          `}
        </div>
      </div>
    `}}customElements.get("lcars-battery-panel")||customElements.define("lcars-battery-panel",d)},3801(e,t,a){var r=a(7349),i=a(4867),s=a(8851),n=a(717),o=a(1109),l=a(6940);class c extends r.WF{static get properties(){return{value:{type:Number},min:{type:Number},max:{type:Number},step:{type:Number},color:{type:String},label:{type:String},disabled:{type:Boolean,reflect:!0}}}constructor(){super(),this.value=0,this.min=0,this.max=100,this.step=1,this.color="var(--lcars-sunflower, #ffcc99)",this.label="",this.disabled=!1,this._dragging=!1,this._boundMove=this._onPointerMove.bind(this),this._boundUp=this._onPointerUp.bind(this)}get _pct(){const e=this.max-this.min;return e<=0?0:Math.max(0,Math.min(100,(this.value-this.min)/e*100))}_valueFromPct(e){const t=this.max-this.min;let a=this.min+e/100*t;return a=Math.round(a/this.step)*this.step,Math.max(this.min,Math.min(this.max,a))}_onPointerDown(e){if(this.disabled)return;e.preventDefault(),e.stopPropagation();const t=this.shadowRoot.querySelector(".lcars-slider");t.setPointerCapture(e.pointerId),t.addEventListener("pointermove",this._boundMove),t.addEventListener("pointerup",this._boundUp),t.addEventListener("pointercancel",this._boundUp),this._dragging=!0,this._updateFromPointer(e),this.requestUpdate()}_onPointerMove(e){this._dragging&&this._updateFromPointer(e)}_onPointerUp(e){if(!this._dragging)return;const t=this.shadowRoot.querySelector(".lcars-slider");try{t.releasePointerCapture(e.pointerId)}catch{}t.removeEventListener("pointermove",this._boundMove),t.removeEventListener("pointerup",this._boundUp),t.removeEventListener("pointercancel",this._boundUp),this._dragging=!1,this._updateFromPointer(e),this.dispatchEvent(new CustomEvent("lcars-slider-change",{detail:{value:this.value},bubbles:!0,composed:!0})),this.requestUpdate()}_updateFromPointer(e){const t=this.shadowRoot.querySelector(".lcars-slider").getBoundingClientRect(),a=Math.max(0,Math.min(100,(e.clientX-t.left)/t.width*100)),r=this._valueFromPct(a);r!==this.value&&(this.value=r,this.dispatchEvent(new CustomEvent("lcars-slider-input",{detail:{value:this.value},bubbles:!0,composed:!0})))}_onKeyDown(e){if(this.disabled)return;const t=this.step,a=Math.max(t,Math.round((this.max-this.min)/4));let r=this.value;switch(e.key){case"ArrowRight":case"ArrowUp":r=Math.min(this.max,this.value+t);break;case"ArrowLeft":case"ArrowDown":r=Math.max(this.min,this.value-t);break;case"PageUp":r=Math.min(this.max,this.value+a);break;case"PageDown":r=Math.max(this.min,this.value-a);break;case"Home":r=this.min;break;case"End":r=this.max;break;default:return}e.preventDefault(),e.stopPropagation(),r=Math.round(r/this.step)*this.step,r!==this.value&&(this.value=r,this.dispatchEvent(new CustomEvent("lcars-slider-input",{detail:{value:this.value},bubbles:!0,composed:!0})),this.dispatchEvent(new CustomEvent("lcars-slider-change",{detail:{value:this.value},bubbles:!0,composed:!0})))}render(){const e=this._pct;return r.qy`
      <div class="lcars-slider ${this._dragging?"dragging":""}"
           role="slider"
           tabindex="0"
           aria-label="${this.label}"
           aria-valuemin="${this.min}"
           aria-valuemax="${this.max}"
           aria-valuenow="${this.value}"
           aria-valuetext="${Math.round(this.value)}%"
           style="--slider-pct:${e}%; --slider-color:${this.color}"
           @pointerdown=${this._onPointerDown}
           @keydown=${this._onKeyDown}>
        <div class="lcars-slider__fill"></div>
        <div class="lcars-slider__segments"></div>
        <div class="lcars-slider__thumb"></div>
      </div>
    `}static get styles(){return r.AH`
      :host {
        display: block;
        width: 100%;
        touch-action: none;
        user-select: none;
      }

      :host([disabled]) {
        opacity: 0.4;
        pointer-events: none;
      }

      .lcars-slider {
        position: relative;
        display: flex;
        align-items: center;
        height: 2.5rem;
        border-radius: 0 var(--lcars-btn-radius, 1.5rem) var(--lcars-btn-radius, 1.5rem) 0;
        background: rgba(102, 102, 136, 0.15);
        overflow: hidden;
        cursor: pointer;
      }

      .lcars-slider:focus-visible {
        outline: 2px solid var(--lcars-ice, #99ccff);
        outline-offset: 2px;
      }

      /* Flat fill bar — width set by --slider-pct */
      .lcars-slider__fill {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: var(--slider-pct, 0%);
        background: var(--slider-color, var(--lcars-sunflower, #ffcc99));
        opacity: 0.35;
        transition: width 150ms ease;
        pointer-events: none;
      }

      .dragging .lcars-slider__fill {
        transition: none;
      }

      /* Segment tick marks — black gaps creating |==|==|==| pattern */
      .lcars-slider__segments {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: repeating-linear-gradient(
          to right,
          transparent 0,
          transparent calc(6.25% - 2px),
          var(--lcars-bg, #000) calc(6.25% - 2px),
          var(--lcars-bg, #000) 6.25%
        );
        pointer-events: none;
      }

      /* Pill thumb at fill edge */
      .lcars-slider__thumb {
        position: absolute;
        top: 50%;
        left: var(--slider-pct, 0%);
        transform: translate(-50%, -50%);
        width: 0.75rem;
        height: 1.75rem;
        background: var(--lcars-space-white, #f5f6fa);
        border-radius: var(--lcars-btn-radius, 1.5rem);
        pointer-events: none;
        transition: left 150ms ease;
        box-shadow: 0 0 6px 2px rgba(255, 204, 153, 0.5);
        z-index: 2;
      }

      .dragging .lcars-slider__thumb {
        transition: none;
        box-shadow: 0 0 8px 4px rgba(255, 204, 153, 0.7);
      }

      @media (prefers-reduced-motion: reduce) {
        .lcars-slider__fill,
        .lcars-slider__thumb {
          transition-duration: 0.01ms;
        }
      }
    `}}customElements.define("lcars-slider",c),a(9761),a(58);class d extends r.WF{static get properties(){return{hass:{type:Object},entities:{type:Array},group:{type:Object},config:{type:Object},areaId:{type:String,attribute:"area-id"},editMode:{type:Boolean,attribute:"edit-mode",reflect:!0},filter:{type:String}}}constructor(){super(),this.hass=null,this.entities=null,this.group=null,this.config=null,this.filter="all",this.areaId=null,this.editMode=!1,this._expandedEffects=new Set,this._dragEntityId=null,this._dragState=null,this._boundPointerMove=this._onPointerMove.bind(this),this._boundPointerUp=this._onPointerUp.bind(this),this._brightnessDebouncer=(0,n.eU)((e,t)=>{const a=(0,n.L3)(t,1,100),r=Math.round(a/100*255);this._callService("light","turn_on",{entity_id:e,brightness:r})},300),this._sceneRateLimiter=(0,n.x)(3,5e3)}disconnectedCallback(){super.disconnectedCallback(),this._cancelDrag(),this._brightnessDebouncer.cancel()}_getPartition(){const e=this.entities||this.group?.entities||[],t=[],a=[],r=[],s=new Set;for(const a of e)"scene"===a.domain?r.push(a):"light"===a.domain&&(0,i.eX)(a)&&(t.push(a),a.entity?.device_id&&s.add(a.entity.device_id));const n=new Set,o=new Map;for(const t of e){const e=t.entity?.device_id;e&&!s.has(e)&&(o.has(e)||o.set(e,[]),o.get(e).push(t))}for(const[e,t]of o)(0,i.v3)(t)&&n.add(e);for(const t of e)"light"!==t.domain&&"scene"!==t.domain&&(t.entity?.device_id&&s.has(t.entity.device_id)||(0,i.eX)(t)&&(t.entity?.device_id&&n.has(t.entity.device_id)||a.push(t)));return{lights:t,circuits:a,scenes:r}}render(){const{lights:e,circuits:t,scenes:a}=this._getPartition(),s="circuits"!==this.filter?e:[],n="lights"!==this.filter?t:[];if(0===s.length&&0===n.length)return r.qy``;const o=this._getOrderedEntities(s.filter(e=>{const t=this.hass?.states?.[e.entity?.entity_id]||e.state,a=(0,i.hk)(t);return"dimmer"===a||"full"===a})),l=this._getOrderedEntities(s.filter(e=>{const t=this.hass?.states?.[e.entity?.entity_id]||e.state;return"onoff"===(0,i.hk)(t)})),c=this._getOrderedEntities(n),d=r.qy`
      ${s.length>0?r.qy`
        <div class="ilm-lights-split">
          ${o.length>0?r.qy`
            <div class="ilm-devices ilm-complex">
              ${o.map(e=>this._renderDevice(e))}
            </div>
          `:""}
          ${l.length>0?r.qy`
            <div class="ilm-simple-group">
              ${l.map(e=>this._renderDevice(e))}
            </div>
          `:""}
        </div>
      `:""}
      ${s.length>0&&n.length>0?r.qy`
        <div class="ilm-section-divider">
          <span class="ilm-section-label">CIRCUITS</span>
          <span class="ilm-section-line"></span>
        </div>
      `:""}
      ${n.length>0?r.qy`
        <div class="ilm-devices">
          ${c.map(e=>this._renderDevice(e))}
        </div>
      `:""}
    `;if(this.group){const a=[...e,...t],i=a.filter(e=>{const t=e.entity?.entity_id;return"on"===(this.hass?.states?.[t]||e.state)?.state}).length,s=this._getPanelName(),n=this._getPanelCode();return r.qy`
        <lcars-panel-frame
          panel-name="${s}"
          panel-code="${n}"
          frame-color="var(--lcars-sunflower)"
          panel-type="illumination">
          <span slot="badge">
            <lcars-summary-badge value="${i}" total="${a.length}" label="ON" color="var(--lcars-sunflower)"></lcars-summary-badge>
          </span>
          ${d}
        </lcars-panel-frame>
      `}return d}_getPanelName(){if(this.group?.device){const e=this.group.device,t=e.name_by_user||e.name||"ILLUMINATION CONTROL",a=this.hass?.areas?.[this.areaId];return a?.name&&t.toLowerCase().startsWith(a.name.toLowerCase())&&t.slice(a.name.length).trim().replace(/^[-–:]\s*/,"")||t}return"ILLUMINATION CONTROL"}_getPanelCode(){const e=this.entities?.[0]?.entity?.entity_id||this.group?.entities?.[0]?.entity?.entity_id||this.group?.device?.id||this.areaId||"panel";let t=5381;for(let a=0;a<e.length;a++)t=(t<<5)+t+e.charCodeAt(a)|0;const a=String(Math.abs(t)%1e6).padStart(6,"0");return`${a.slice(0,3)}-${a.slice(3)}`}_renderDevice(e){const t=e.entity?.entity_id,a=this.hass?.states?.[t]||e.state,s="on"===a?.state,n=this._shortName(e);let o;if("light"===e.domain)switch((0,i.hk)(a)){case"onoff":default:o=this._renderOnOffPill(t,n,s);break;case"dimmer":o=this._renderDimmer(t,n,s,a);break;case"full":o=this._renderFullLight(t,n,s,a)}else o=this._renderCircuitPill(t,n,s);return this.editMode?r.qy`
        <div class="ilm-drag-wrap ${this._dragEntityId===t?"dragging":""}"
             data-entity-id="${t}">
          <span class="ilm-grip"
                @pointerdown=${e=>this._onPointerDown(e,t)}>
            <span></span><span></span><span></span>
          </span>
          ${o}
        </div>
      `:o}_renderOnOffPill(e,t,a){return r.qy`
      <button class="ilm-pill ${a?"on":"off"}"
              aria-pressed="${a?"true":"false"}"
              aria-label="${t} â€” ${a?"ON":"OFF"}"
              @click=${()=>this._toggleEntity(e)}
              @contextmenu=${t=>{t.preventDefault(),(0,s.Hv)(e)}}>
        <span class="ilm-pill__indicator ${a?"active":""}"></span>
        <span class="ilm-pill__name">${t}</span>
        <span class="ilm-pill__state">${a?"ON":"OFF"}</span>
      </button>
    `}_renderDimmer(e,t,a,i){const n=a?Math.round((i?.attributes?.brightness||0)/255*100):0,o=this._getBarColor(i);return r.qy`
      <div class="ilm-dimmer">
        <div class="ilm-dimmer__header">
          <span class="ilm-dimmer__name">${t}</span>
          <span class="ilm-type-badge">DIM</span>
          <span class="ilm-dimmer__value">${a?n+"%":"OFF"}</span>
        </div>
        <lcars-slider
          .value=${n}
          min="1"
          max="100"
          step="1"
          color="${o}"
          label="${t} brightness"
          @lcars-slider-input=${t=>{t.stopPropagation(),this._brightnessDebouncer.call(e,t.detail.value)}}
          @lcars-slider-change=${t=>{t.stopPropagation(),this._setBrightness(e,t.detail.value)}}
          @click=${e=>e.stopPropagation()}>
        </lcars-slider>
        <button class="ilm-pill compact ${a?"on":"off"}"
                aria-pressed="${a?"true":"false"}"
                aria-label="${t} power"
                @click=${()=>this._toggleEntity(e)}
                @contextmenu=${t=>{t.preventDefault(),(0,s.Hv)(e)}}>
          <span class="ilm-pill__state">${a?"ON":"OFF"}</span>
        </button>
      </div>
    `}_renderFullLight(e,t,a,i){const n=a?Math.round((i?.attributes?.brightness||0)/255*100):0,o=this._getBarColor(i),l=(i?.attributes?.supported_color_modes||[]).some(e=>"hs"===e||"rgb"===e||"xy"===e),c=i?.attributes?.effect_list,p=i?.attributes?.effect,u=Array.isArray(c)&&c.length>0,m=i?.attributes?.hs_color?.[0];return r.qy`
      <div class="ilm-full" role="group" aria-label="${t} controls">
        <div class="ilm-dimmer__header">
          <span class="ilm-dimmer__name">${t}</span>
          <span class="ilm-type-badge full">${l?"RGB":"FX"}</span>
          <span class="ilm-dimmer__value">${a?n+"%":"OFF"}</span>
        </div>
        <lcars-slider
          .value=${n}
          min="1"
          max="100"
          step="1"
          color="${o}"
          label="${t} brightness"
          @lcars-slider-input=${t=>{t.stopPropagation(),this._brightnessDebouncer.call(e,t.detail.value)}}
          @lcars-slider-change=${t=>{t.stopPropagation(),this._setBrightness(e,t.detail.value)}}
          @click=${e=>e.stopPropagation()}>
        </lcars-slider>
        <div class="ilm-full__controls">
          <button class="ilm-pill compact ${a?"on":"off"}"
                  aria-pressed="${a?"true":"false"}"
                  aria-label="${t} power"
                  @click=${()=>this._toggleEntity(e)}
                  @contextmenu=${t=>{t.preventDefault(),(0,s.Hv)(e)}}>
            <span class="ilm-pill__state">${a?"ON":"OFF"}</span>
          </button>
          ${l?r.qy`
            <div class="ilm-color-presets">
              ${d.COLOR_PRESETS.map(t=>r.qy`
                <button class="ilm-color-btn ${this._isActivePreset(m,t.hs[0])?"active":""}"
                        style="--preset-color:${t.color}"
                        aria-pressed="${this._isActivePreset(m,t.hs[0])?"true":"false"}"
                        aria-label="Set ${t.name.toLowerCase()} color"
                        @click=${a=>{a.stopPropagation(),this._setColor(e,t.hs)}}>
                  ${t.name}
                </button>
              `)}
            </div>
          `:""}
          ${u?r.qy`
            <button class="ilm-fx-toggle"
                    aria-expanded="${this._expandedEffects.has(e)?"true":"false"}"
                    @click=${t=>{t.stopPropagation(),this._toggleEffects(e)}}>
              ${this._expandedEffects.has(e)?"▾":"▸"} ${c.length} EFFECTS
            </button>
            ${this._expandedEffects.has(e)?r.qy`
              <div class="ilm-effect-strip">
                <button class="ilm-effect-btn ${p&&"none"!==p?"":"active"}"
                        aria-pressed="${p&&"none"!==p?"false":"true"}"
                        @click=${t=>{t.stopPropagation(),this._clearEffect(e)}}>
                  SOLID
                </button>
                ${c.map(t=>r.qy`
                  <button class="ilm-effect-btn ${p===t?"active":""}"
                          aria-pressed="${p===t?"true":"false"}"
                          @click=${a=>{a.stopPropagation(),this._setEffect(e,t)}}>
                    ${t.toUpperCase()}
                  </button>
                `)}
              </div>
            `:""}
          `:""}
        </div>
      </div>
    `}_renderCircuitPill(e,t,a){return r.qy`
      <button class="ilm-pill circuit ${a?"on":"off"}"
              aria-pressed="${a?"true":"false"}"
              aria-label="${t} â€” ${a?"ON":"OFF"}"
              @click=${()=>this._toggleEntity(e)}
              @contextmenu=${t=>{t.preventDefault(),(0,s.Hv)(e)}}>
        <span class="ilm-pill__indicator ${a?"active":""}"></span>
        <span class="ilm-pill__name">${t}</span>
        <span class="ilm-pill__state">${a?"ON":"OFF"}</span>
      </button>
    `}_toggleEffects(e){this._expandedEffects.has(e)?this._expandedEffects.delete(e):this._expandedEffects.add(e),this.requestUpdate()}_getOrderKey(){return`lcars-ilm-order-${this.areaId||"default"}`}_loadOrder(){try{const e=JSON.parse(localStorage.getItem(this._getOrderKey()));return Array.isArray(e)?e:null}catch{return null}}_saveOrder(e){try{localStorage.setItem(this._getOrderKey(),JSON.stringify(e))}catch(e){}}_getOrderedEntities(e){const t=this._loadOrder();if(!t)return e;const a=new Map(t.map((e,t)=>[e,t]));return[...e].sort((e,t)=>(a.get(e.entity?.entity_id)??999)-(a.get(t.entity?.entity_id)??999))}_onPointerDown(e,t){if(!this.editMode)return;e.preventDefault(),e.stopPropagation();const a=e.target.closest(".ilm-drag-wrap");if(!a)return;const r=a.parentElement;if(!r)return;a.setPointerCapture(e.pointerId),a.addEventListener("pointermove",this._boundPointerMove),a.addEventListener("pointerup",this._boundPointerUp),a.addEventListener("pointercancel",this._boundPointerUp);const i=[...r.querySelectorAll(".ilm-drag-wrap")].map(e=>e.dataset.entityId),s=i.indexOf(t);this._dragState={entityId:t,pointerId:e.pointerId,startY:e.clientY,wrapEl:a,container:r,currentIndex:s,orderedIds:[...i],didDrag:!1},this._dragEntityId=t}_onPointerMove(e){if(!this._dragState)return;const t=e.clientY-this._dragState.startY;if(!this._dragState.didDrag&&Math.abs(t)<8)return;this._dragState.didDrag=!0;const a=[...this._dragState.container.querySelectorAll(".ilm-drag-wrap")];if(!a.length)return;const r=a[0].getBoundingClientRect().height+6,i=Math.round(t/r),s=(0,n.L3)(this._dragState.currentIndex+i,0,this._dragState.orderedIds.length-1);if(s!==this._dragState.hoverIndex){this._dragState.hoverIndex=s;const e=[...this._dragState.orderedIds],t=e.indexOf(this._dragState.entityId);e.splice(t,1),e.splice(s,0,this._dragState.entityId),this._saveOrder(e),this.requestUpdate()}}_onPointerUp(e){if(!this._dragState)return;const t=this._dragState.wrapEl;try{t.releasePointerCapture(this._dragState.pointerId)}catch{}t.removeEventListener("pointermove",this._boundPointerMove),t.removeEventListener("pointerup",this._boundPointerUp),t.removeEventListener("pointercancel",this._boundPointerUp),this._dragState=null,this._dragEntityId=null,this.requestUpdate()}_cancelDrag(){if(this._dragState?.wrapEl){const e=this._dragState.wrapEl;try{e.releasePointerCapture(this._dragState.pointerId)}catch{}e.removeEventListener("pointermove",this._boundPointerMove),e.removeEventListener("pointerup",this._boundPointerUp),e.removeEventListener("pointercancel",this._boundPointerUp)}this._dragState=null,this._dragEntityId=null}_getBarColor(e){if("on"!==e?.state)return"var(--lcars-gray, #666688)";const t=e?.attributes?.color_mode;if("hs"===t||"rgb"===t||"xy"===t){const t=e?.attributes?.hs_color;if(t)return this._hueToLcarsColor(t[0],t[1])}const a=e?.attributes?.color_temp_kelvin;if(!a)return"var(--lcars-sunflower)";const r=Math.max(0,Math.min(1,(a-2e3)/4500));return r<.5?"var(--lcars-butterscotch)":r<.8?"var(--lcars-sunflower)":"var(--lcars-ice)"}_hueToLcarsColor(e,t){return null!=t&&t<15?"var(--lcars-sunflower)":e<30?"var(--lcars-tomato)":e<60?"var(--lcars-butterscotch)":e<90?"var(--lcars-sunflower)":e<160?"var(--lcars-green, #66bb6a)":e<220?"var(--lcars-ice)":e<270?"var(--lcars-bluey)":e<330?"var(--lcars-lilac)":"var(--lcars-tomato)"}static get COLOR_PRESETS(){return[{name:"WARM",hs:[30,80],color:"var(--lcars-butterscotch, #ff9966)"},{name:"COOL",hs:[210,20],color:"var(--lcars-ice, #99ccff)"},{name:"RED",hs:[0,100],color:"var(--lcars-tomato, #ff5555)"},{name:"GREEN",hs:[120,100],color:"var(--lcars-green, #66bb6a)"},{name:"BLUE",hs:[240,100],color:"var(--lcars-bluey, #8899ff)"},{name:"PURPLE",hs:[280,80],color:"var(--lcars-lilac, #cc55ff)"}]}_isActivePreset(e,t){if(null==e)return!1;const a=Math.abs(e-t);return a<20||a>340}_callService(e,t,a){if(this.hass)return this.hass.callService(e,t,a)}_toggleEntity(e){if(!this.hass||!e)return;l.e.playForEntity(e);const t=e.split(".")[0];this._callService(t,"toggle",{entity_id:e})}_setBrightness(e,t){if(!this.hass||!e)return;l.e.play("climateAdjust");const a=(0,n.L3)(t,1,100),r=Math.round(a/100*255);this._callService("light","turn_on",{entity_id:e,brightness:r})}_setEffect(e,t){this.hass&&e&&(l.e.play("lightToggle"),this._callService("light","turn_on",{entity_id:e,effect:t}))}_clearEffect(e){this.hass&&e&&(l.e.play("lightToggle"),this._callService("light","turn_on",{entity_id:e,effect:"none"}))}_setColor(e,t){this.hass&&e&&(l.e.play("lightToggle"),this._callService("light","turn_on",{entity_id:e,hs_color:t}))}_activateScene(e){this.hass&&e&&this._sceneRateLimiter.allow()&&(l.e.play("scriptFire"),this._callService("scene","turn_on",{entity_id:e}))}_shortName(e){const t=e.state?.attributes?.friendly_name||e.entity?.entity_id||"",a=this.hass?.areas?.[this.areaId];if(!a?.name)return t.toUpperCase();let r=t;const i=[a.name,a.name.replace(/[''']s$/i,"")];for(const e of i)r.toLowerCase().startsWith(e.toLowerCase())&&(r=r.slice(e.length).trim().replace(/^[-â€“:]\s*/,""));return(r||t).toUpperCase()}static get styles(){return[o.PF,o.yW,r.AH`
        :host { display: block; }

        /* ─── Section Divider ─── */
        .ilm-section-divider {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0.5rem 0 0.25rem 0;
        }
        .ilm-section-label {
          font-family: var(--lcars-font, 'Antonio', sans-serif);
          font-size: 0.75rem;
          color: var(--lcars-gray, #666688);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          white-space: nowrap;
        }
        .ilm-section-line {
          flex: 1;
          height: 1px;
          background: var(--lcars-gray, #666688);
          opacity: 0.3;
        }

        /* ─── Drag & Drop (Edit Mode) ─── */
        .ilm-drag-wrap {
          display: flex;
          align-items: stretch;
          gap: 0.25rem;
          transition: opacity 150ms ease;
        }
        .ilm-drag-wrap.dragging { opacity: 0.5; }
        .ilm-drag-wrap > :not(.ilm-grip) { flex: 1; min-width: 0; }

        .ilm-grip {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          width: 1.25rem;
          flex-shrink: 0;
          cursor: grab;
          touch-action: none;
          padding: 0.25rem 0;
        }
        .ilm-grip:active { cursor: grabbing; }
        .ilm-grip > span {
          display: block;
          width: 0.75rem;
          height: 2px;
          background: var(--lcars-gray, #666688);
          border-radius: 1px;
        }

        .ilm-devices {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(18rem, 100%), 1fr));
          gap: 0.375rem;
        }

        /* Split layout: complex lights left, simple pills right */
        .ilm-lights-split {
          display: flex;
          gap: 0.5rem;
        }

        .ilm-complex {
          flex: 1;
          min-width: 0;
        }

        .ilm-simple-group {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
          flex-shrink: 0;
          min-width: 10rem;
          max-width: 14rem;
          border-left: 1px solid rgba(102, 102, 136, 0.2);
          padding-left: 0.5rem;
        }

        /* â”€â”€â”€ Shared Pill Button (Type A & D) â”€â”€â”€ */

        .ilm-pill {
          display: flex;
          align-items: center;
          height: 3rem;
          padding: 0 1rem 0 0.75rem;
          border-radius: 0 var(--lcars-btn-radius, 1.5rem) var(--lcars-btn-radius, 1.5rem) 0;
          background: var(--lcars-sunflower, #ffcc99);
          color: var(--lcars-black, #000);
          font-family: var(--lcars-font, 'Antonio', sans-serif);
          font-size: 1rem;
          text-transform: uppercase;
          cursor: pointer;
          border: 1px solid rgba(255, 204, 153, 0.2);
          transition: filter 200ms ease;
          width: 100%;
          text-align: left;
        }

        .ilm-pill:hover { filter: brightness(1.2); }
        .ilm-pill:active { background: var(--lcars-gold, #ffaa00); }
        .ilm-pill:focus-visible {
          outline: 2px solid var(--lcars-ice, #99ccff);
          outline-offset: 2px;
        }

        .ilm-pill.off {
          background: var(--lcars-gray, #666688);
          color: var(--lcars-space-white, #f5f6fa);
          border-color: rgba(102, 102, 136, 0.3);
          animation: standbyPulse 4s ease-in-out infinite;
        }

        .ilm-pill.circuit { background: var(--lcars-almond-creme, #ffbbaa); }
        .ilm-pill.circuit.off { background: var(--lcars-gray, #666688); }

        .ilm-pill.compact {
          height: 2rem;
          width: auto;
          min-width: 5rem;
          padding: 0 0.75rem;
          justify-content: center;
          border-radius: var(--lcars-btn-radius, 1.5rem);
        }

        @keyframes standbyPulse {
          0%, 100% { opacity: 0.5; }
          50%      { opacity: 0.65; }
        }

        @media (prefers-reduced-motion: reduce) {
          .ilm-pill.off { animation: none; opacity: 0.55; }
        }

        .ilm-pill__indicator {
          display: inline-block;
          width: 3px;
          height: 1.25rem;
          border-radius: 1.5px;
          background: var(--lcars-black, #000);
          margin-right: 0.625rem;
          flex-shrink: 0;
          opacity: 0.3;
        }

        .ilm-pill__indicator.active { opacity: 1; }

        .ilm-pill__name {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .ilm-pill__state {
          font-variant-numeric: tabular-nums;
          min-width: 2.5rem;
          text-align: right;
          flex-shrink: 0;
        }

        /* â”€â”€â”€ Dimmer (Type B) â”€â”€â”€ */

        .ilm-dimmer {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          border: 1px solid rgba(255, 204, 153, 0.15);
          border-radius: 0.5rem;
          padding: 0.375rem;
        }

        .ilm-dimmer__header {
          display: flex;
          align-items: center;
          padding: 0 0.25rem;
        }

        .ilm-type-badge {
          font-family: var(--lcars-font, 'Antonio', sans-serif);
          font-size: 0.625rem;
          color: var(--lcars-gray, #666688);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-left: 0.5rem;
          flex-shrink: 0;
        }
        .ilm-type-badge.full {
          color: var(--lcars-gold, #ffaa00);
        }

        .ilm-fx-toggle {
          font-family: var(--lcars-font, 'Antonio', sans-serif);
          font-size: 0.625rem;
          text-transform: uppercase;
          color: var(--lcars-gray, #666688);
          background: rgba(102, 102, 136, 0.15);
          border: none;
          padding: 0.25rem 0.5rem;
          height: 1.5rem;
          border-radius: var(--lcars-btn-radius, 1.5rem);
          cursor: pointer;
          white-space: nowrap;
          transition: filter 150ms ease;
        }
        .ilm-fx-toggle:hover { filter: brightness(1.3); }
        .ilm-fx-toggle:focus-visible {
          outline: 2px solid var(--lcars-ice, #99ccff);
          outline-offset: 2px;
        }

        .ilm-dimmer__name {
          flex: 1;
          font-family: var(--lcars-font, 'Antonio', sans-serif);
          font-size: 0.875rem;
          color: var(--lcars-sunflower, #ffcc99);
          text-transform: uppercase;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .ilm-dimmer__value {
          font-family: var(--lcars-font, 'Antonio', sans-serif);
          font-size: 0.875rem;
          color: var(--lcars-sunflower, #ffcc99);
          font-variant-numeric: tabular-nums;
          min-width: 3rem;
          text-align: right;
        }

        /* â”€â”€â”€ Full-Featured Light (Type C) â”€â”€â”€ */

        .ilm-full {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          border: 1px solid rgba(255, 204, 153, 0.15);
          border-left: 4px solid var(--lcars-gold, #ffaa00);
          border-radius: 0.5rem;
          padding: 0.375rem;
        }

        .ilm-full__controls {
          display: flex;
          flex-wrap: wrap;
          gap: 0.375rem;
          align-items: center;
        }

        /* â”€â”€â”€ Color Presets â”€â”€â”€ */

        .ilm-color-presets {
          display: flex;
          gap: 0.125rem;
          flex-wrap: wrap;
        }

        .ilm-color-btn {
          font-family: var(--lcars-font, 'Antonio', sans-serif);
          font-size: 0.625rem;
          text-transform: uppercase;
          color: var(--lcars-black, #000);
          background: var(--preset-color, var(--lcars-sunflower));
          border: none;
          padding: 0.125rem 0.375rem;
          height: 1.5rem;
          border-radius: var(--lcars-btn-radius, 1.5rem);
          cursor: pointer;
          transition: filter 150ms ease;
          opacity: 0.45;
        }

        .ilm-color-btn.active { opacity: 1; }
        .ilm-color-btn:hover { filter: brightness(1.2); }
        .ilm-color-btn:focus-visible {
          outline: 2px solid var(--lcars-ice, #99ccff);
          outline-offset: 2px;
        }

        /* â”€â”€â”€ Effect Strip â”€â”€â”€ */

        .ilm-effect-strip {
          display: flex;
          gap: 0.25rem;
          flex-wrap: wrap;
        }

        .ilm-effect-btn {
          font-family: var(--lcars-font, 'Antonio', sans-serif);
          font-size: 0.75rem;
          text-transform: uppercase;
          color: var(--lcars-space-white, #f5f6fa);
          background: rgba(102, 102, 136, 0.3);
          border: none;
          padding: 0.25rem 0.5rem;
          height: 2rem;
          border-radius: var(--lcars-btn-radius, 1.5rem);
          cursor: pointer;
          transition: filter 150ms ease;
        }

        .ilm-effect-btn.active {
          background: var(--lcars-gold, #ffaa00);
          color: var(--lcars-black, #000);
        }

        .ilm-effect-btn:hover { filter: brightness(1.2); }
        .ilm-effect-btn:focus-visible {
          outline: 2px solid var(--lcars-ice, #99ccff);
          outline-offset: 2px;
        }
      `]}}customElements.define("lcars-illumination-panel",d)},7349(e,t,a){a.d(t,{WF:()=>z,AH:()=>C,qy:()=>p.qy,JW:()=>p.JW});var r=a(601),i=a(9995);function s(e,t){const{element:{content:a},parts:r}=e,i=document.createTreeWalker(a,133,null,!1);let s=o(r),n=r[s],l=-1,c=0;const d=[];let p=null;for(;i.nextNode();){l++;const e=i.currentNode;for(e.previousSibling===p&&(p=null),t.has(e)&&(d.push(e),null===p&&(p=e)),null!==p&&c++;void 0!==n&&n.index===l;)n.index=null!==p?-1:n.index-c,s=o(r,s),n=r[s]}d.forEach(e=>e.parentNode.removeChild(e))}const n=e=>{let t=11===e.nodeType?0:1;const a=document.createTreeWalker(e,133,null,!1);for(;a.nextNode();)t++;return t},o=(e,t=-1)=>{for(let a=t+1;a<e.length;a++){const t=e[a];if((0,i.s9)(t))return a}return-1};var l=a(3841),c=a(5172),d=a(4679),p=a(7637);const u=(e,t)=>`${e}--${t}`;let m=!0;void 0===window.ShadyCSS?m=!1:void 0===window.ShadyCSS.prepareTemplateDom&&(console.warn("Incompatible ShadyCSS version detected. Please update to at least @webcomponents/webcomponentsjs@2.0.2 and @webcomponents/shadycss@1.3.1."),m=!1);const h=e=>t=>{const a=u(t.type,e);let r=c.c.get(a);void 0===r&&(r={stringsArray:new WeakMap,keyString:new Map},c.c.set(a,r));let s=r.stringsArray.get(t.strings);if(void 0!==s)return s;const n=t.strings.join(i.xL);if(s=r.keyString.get(n),void 0===s){const a=t.getTemplateElement();m&&window.ShadyCSS.prepareTemplateDom(a,e),s=new i.Bj(t,a),r.keyString.set(n,s)}return r.stringsArray.set(t.strings,s),s},f=["html","svg"],v=new Set;window.JSCompiler_renameProperty=(e,t)=>e;const g={toAttribute(e,t){switch(t){case Boolean:return e?"":null;case Object:case Array:return null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){switch(t){case Boolean:return null!==e;case Number:return null===e?null:Number(e);case Object:case Array:return JSON.parse(e)}return e}},b=(e,t)=>t!==e&&(t==t||e==e),y={attribute:!0,type:String,converter:g,reflect:!1,hasChanged:b},_="finalized";class w extends HTMLElement{constructor(){super(),this.initialize()}static get observedAttributes(){this.finalize();const e=[];return this._classProperties.forEach((t,a)=>{const r=this._attributeNameForProperty(a,t);void 0!==r&&(this._attributeToPropertyMap.set(r,a),e.push(r))}),e}static _ensureClassProperties(){if(!this.hasOwnProperty(JSCompiler_renameProperty("_classProperties",this))){this._classProperties=new Map;const e=Object.getPrototypeOf(this)._classProperties;void 0!==e&&e.forEach((e,t)=>this._classProperties.set(t,e))}}static createProperty(e,t=y){if(this._ensureClassProperties(),this._classProperties.set(e,t),t.noAccessor||this.prototype.hasOwnProperty(e))return;const a="symbol"==typeof e?Symbol():`__${e}`,r=this.getPropertyDescriptor(e,a,t);void 0!==r&&Object.defineProperty(this.prototype,e,r)}static getPropertyDescriptor(e,t,a){return{get(){return this[t]},set(r){const i=this[e];this[t]=r,this.requestUpdateInternal(e,i,a)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this._classProperties&&this._classProperties.get(e)||y}static finalize(){const e=Object.getPrototypeOf(this);if(e.hasOwnProperty(_)||e.finalize(),this[_]=!0,this._ensureClassProperties(),this._attributeToPropertyMap=new Map,this.hasOwnProperty(JSCompiler_renameProperty("properties",this))){const e=this.properties,t=[...Object.getOwnPropertyNames(e),..."function"==typeof Object.getOwnPropertySymbols?Object.getOwnPropertySymbols(e):[]];for(const a of t)this.createProperty(a,e[a])}}static _attributeNameForProperty(e,t){const a=t.attribute;return!1===a?void 0:"string"==typeof a?a:"string"==typeof e?e.toLowerCase():void 0}static _valueHasChanged(e,t,a=b){return a(e,t)}static _propertyValueFromAttribute(e,t){const a=t.type,r=t.converter||g,i="function"==typeof r?r:r.fromAttribute;return i?i(e,a):e}static _propertyValueToAttribute(e,t){if(void 0===t.reflect)return;const a=t.type,r=t.converter;return(r&&r.toAttribute||g.toAttribute)(e,a)}initialize(){this._updateState=0,this._updatePromise=new Promise(e=>this._enableUpdatingResolver=e),this._changedProperties=new Map,this._saveInstanceProperties(),this.requestUpdateInternal()}_saveInstanceProperties(){this.constructor._classProperties.forEach((e,t)=>{if(this.hasOwnProperty(t)){const e=this[t];delete this[t],this._instanceProperties||(this._instanceProperties=new Map),this._instanceProperties.set(t,e)}})}_applyInstanceProperties(){this._instanceProperties.forEach((e,t)=>this[t]=e),this._instanceProperties=void 0}connectedCallback(){this.enableUpdating()}enableUpdating(){void 0!==this._enableUpdatingResolver&&(this._enableUpdatingResolver(),this._enableUpdatingResolver=void 0)}disconnectedCallback(){}attributeChangedCallback(e,t,a){t!==a&&this._attributeToProperty(e,a)}_propertyToAttribute(e,t,a=y){const r=this.constructor,i=r._attributeNameForProperty(e,a);if(void 0!==i){const e=r._propertyValueToAttribute(t,a);if(void 0===e)return;this._updateState=8|this._updateState,null==e?this.removeAttribute(i):this.setAttribute(i,e),this._updateState=-9&this._updateState}}_attributeToProperty(e,t){if(8&this._updateState)return;const a=this.constructor,r=a._attributeToPropertyMap.get(e);if(void 0!==r){const e=a.getPropertyOptions(r);this._updateState=16|this._updateState,this[r]=a._propertyValueFromAttribute(t,e),this._updateState=-17&this._updateState}}requestUpdateInternal(e,t,a){let r=!0;if(void 0!==e){const i=this.constructor;a=a||i.getPropertyOptions(e),i._valueHasChanged(this[e],t,a.hasChanged)?(this._changedProperties.has(e)||this._changedProperties.set(e,t),!0!==a.reflect||16&this._updateState||(void 0===this._reflectingProperties&&(this._reflectingProperties=new Map),this._reflectingProperties.set(e,a))):r=!1}!this._hasRequestedUpdate&&r&&(this._updatePromise=this._enqueueUpdate())}requestUpdate(e,t){return this.requestUpdateInternal(e,t),this.updateComplete}async _enqueueUpdate(){this._updateState=4|this._updateState;try{await this._updatePromise}catch(e){}const e=this.performUpdate();return null!=e&&await e,!this._hasRequestedUpdate}get _hasRequestedUpdate(){return 4&this._updateState}get hasUpdated(){return 1&this._updateState}performUpdate(){if(!this._hasRequestedUpdate)return;this._instanceProperties&&this._applyInstanceProperties();let e=!1;const t=this._changedProperties;try{e=this.shouldUpdate(t),e?this.update(t):this._markUpdated()}catch(t){throw e=!1,this._markUpdated(),t}e&&(1&this._updateState||(this._updateState=1|this._updateState,this.firstUpdated(t)),this.updated(t))}_markUpdated(){this._changedProperties=new Map,this._updateState=-5&this._updateState}get updateComplete(){return this._getUpdateComplete()}_getUpdateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._updatePromise}shouldUpdate(e){return!0}update(e){void 0!==this._reflectingProperties&&this._reflectingProperties.size>0&&(this._reflectingProperties.forEach((e,t)=>this._propertyToAttribute(t,this[t],e)),this._reflectingProperties=void 0),this._markUpdated()}updated(e){}firstUpdated(e){}}w[_]=!0;const x=Element.prototype;x.msMatchesSelector||x.webkitMatchesSelector;const $=window.ShadowRoot&&(void 0===window.ShadyCSS||window.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,k=Symbol();class S{constructor(e,t){if(t!==k)throw new Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e}get styleSheet(){return void 0===this._styleSheet&&($?(this._styleSheet=new CSSStyleSheet,this._styleSheet.replaceSync(this.cssText)):this._styleSheet=null),this._styleSheet}toString(){return this.cssText}}const C=(e,...t)=>{const a=t.reduce((t,a,r)=>t+(e=>{if(e instanceof S)return e.cssText;if("number"==typeof e)return e;throw new Error(`Value passed to 'css' function must be a 'css' function result: ${e}. Use 'unsafeCSS' to pass non-literal values, but\n            take care to ensure page security.`)})(a)+e[r+1],e[0]);return new S(a,k)};(window.litElementVersions||(window.litElementVersions=[])).push("2.5.1");const E={};class z extends w{static getStyles(){return this.styles}static _getUniqueStyles(){if(this.hasOwnProperty(JSCompiler_renameProperty("_styles",this)))return;const e=this.getStyles();if(Array.isArray(e)){const t=(e,a)=>e.reduceRight((e,a)=>Array.isArray(a)?t(a,e):(e.add(a),e),a),a=t(e,new Set),r=[];a.forEach(e=>r.unshift(e)),this._styles=r}else this._styles=void 0===e?[]:[e];this._styles=this._styles.map(e=>{if(e instanceof CSSStyleSheet&&!$){const t=Array.prototype.slice.call(e.cssRules).reduce((e,t)=>e+t.cssText,"");return new S(String(t),k)}return e})}initialize(){super.initialize(),this.constructor._getUniqueStyles(),this.renderRoot=this.createRenderRoot(),window.ShadowRoot&&this.renderRoot instanceof window.ShadowRoot&&this.adoptStyles()}createRenderRoot(){return this.attachShadow(this.constructor.shadowRootOptions)}adoptStyles(){const e=this.constructor._styles;0!==e.length&&(void 0===window.ShadyCSS||window.ShadyCSS.nativeShadow?$?this.renderRoot.adoptedStyleSheets=e.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet):this._needsShimAdoptedStyleSheets=!0:window.ShadyCSS.ScopingShim.prepareAdoptedCssText(e.map(e=>e.cssText),this.localName))}connectedCallback(){super.connectedCallback(),this.hasUpdated&&void 0!==window.ShadyCSS&&window.ShadyCSS.styleElement(this)}update(e){const t=this.render();super.update(e),t!==E&&this.constructor.render(t,this.renderRoot,{scopeName:this.localName,eventContext:this}),this._needsShimAdoptedStyleSheets&&(this._needsShimAdoptedStyleSheets=!1,this.constructor._styles.forEach(e=>{const t=document.createElement("style");t.textContent=e.cssText,this.renderRoot.appendChild(t)}))}render(){return E}}z.finalized=!0,z.render=(e,t,a)=>{if(!a||"object"!=typeof a||!a.scopeName)throw new Error("The `scopeName` option is required.");const i=a.scopeName,p=l.r.has(t),g=m&&11===t.nodeType&&!!t.host,b=g&&!v.has(i),y=b?document.createDocumentFragment():t;if((0,l.X)(e,y,Object.assign({templateFactory:h(i)},a)),b){const e=l.r.get(y);l.r.delete(y);((e,t,a)=>{v.add(e);const r=a?a.element:document.createElement("template"),i=t.querySelectorAll("style"),{length:l}=i;if(0===l)return void window.ShadyCSS.prepareTemplateStyles(r,e);const d=document.createElement("style");for(let e=0;e<l;e++){const t=i[e];t.parentNode.removeChild(t),d.textContent+=t.textContent}(e=>{f.forEach(t=>{const a=c.c.get(u(t,e));void 0!==a&&a.keyString.forEach(e=>{const{element:{content:t}}=e,a=new Set;Array.from(t.querySelectorAll("style")).forEach(e=>{a.add(e)}),s(e,a)})})})(e);const p=r.content;a?function(e,t,a=null){const{element:{content:r},parts:i}=e;if(null==a)return void r.appendChild(t);const s=document.createTreeWalker(r,133,null,!1);let l=o(i),c=0,d=-1;for(;s.nextNode();)for(d++,s.currentNode===a&&(c=n(t),a.parentNode.insertBefore(t,a));-1!==l&&i[l].index===d;){if(c>0){for(;-1!==l;)i[l].index+=c,l=o(i,l);return}l=o(i,l)}}(a,d,p.firstChild):p.insertBefore(d,p.firstChild),window.ShadyCSS.prepareTemplateStyles(r,e);const m=p.querySelector("style");if(window.ShadyCSS.nativeShadow&&null!==m)t.insertBefore(m.cloneNode(!0),t.firstChild);else if(a){p.insertBefore(d,p.firstChild);const e=new Set;e.add(d),s(a,e)}})(i,y,e.value instanceof d.i?e.value.template:void 0),(0,r.if)(t,t.firstChild),t.appendChild(y),l.r.set(t,e)}!p&&g&&window.ShadyCSS.styleElement(t.host)},z.shadowRootOptions={mode:"open"}},1012(e,t,a){a.d(t,{q:()=>i});const r=new WeakMap,i=e=>"function"==typeof e&&r.has(e)},601(e,t,a){a.d(t,{Pf:()=>i,if:()=>s,o6:()=>r});const r="undefined"!=typeof window&&null!=window.customElements&&void 0!==window.customElements.polyfillWrapFlushCallback,i=(e,t,a=null,r=null)=>{for(;t!==a;){const a=t.nextSibling;e.insertBefore(t,r),t=a}},s=(e,t,a=null)=>{for(;t!==a;){const a=t.nextSibling;e.removeChild(t),t=a}}},624(e,t,a){a.d(t,{c:()=>r,s:()=>i});const r={},i={}},6671(e,t,a){a.d(t,{GP:()=>b,Qh:()=>m,Yp:()=>h,g$:()=>f,pU:()=>p});var r=a(1012),i=a(601),s=a(624),n=a(4679),o=a(3957),l=a(9995);const c=e=>null===e||!("object"==typeof e||"function"==typeof e),d=e=>Array.isArray(e)||!(!e||!e[Symbol.iterator]);class p{constructor(e,t,a){this.dirty=!0,this.element=e,this.name=t,this.strings=a,this.parts=[];for(let e=0;e<a.length-1;e++)this.parts[e]=this._createPart()}_createPart(){return new u(this)}_getValue(){const e=this.strings,t=e.length-1,a=this.parts;if(1===t&&""===e[0]&&""===e[1]){const e=a[0].value;if("symbol"==typeof e)return String(e);if("string"==typeof e||!d(e))return e}let r="";for(let i=0;i<t;i++){r+=e[i];const t=a[i];if(void 0!==t){const e=t.value;if(c(e)||!d(e))r+="string"==typeof e?e:String(e);else for(const t of e)r+="string"==typeof t?t:String(t)}}return r+=e[t],r}commit(){this.dirty&&(this.dirty=!1,this.element.setAttribute(this.name,this._getValue()))}}class u{constructor(e){this.value=void 0,this.committer=e}setValue(e){e===s.c||c(e)&&e===this.value||(this.value=e,(0,r.q)(e)||(this.committer.dirty=!0))}commit(){for(;(0,r.q)(this.value);){const e=this.value;this.value=s.c,e(this)}this.value!==s.c&&this.committer.commit()}}class m{constructor(e){this.value=void 0,this.__pendingValue=void 0,this.options=e}appendInto(e){this.startNode=e.appendChild((0,l.h5)()),this.endNode=e.appendChild((0,l.h5)())}insertAfterNode(e){this.startNode=e,this.endNode=e.nextSibling}appendIntoPart(e){e.__insert(this.startNode=(0,l.h5)()),e.__insert(this.endNode=(0,l.h5)())}insertAfterPart(e){e.__insert(this.startNode=(0,l.h5)()),this.endNode=e.endNode,e.endNode=this.startNode}setValue(e){this.__pendingValue=e}commit(){if(null===this.startNode.parentNode)return;for(;(0,r.q)(this.__pendingValue);){const e=this.__pendingValue;this.__pendingValue=s.c,e(this)}const e=this.__pendingValue;e!==s.c&&(c(e)?e!==this.value&&this.__commitText(e):e instanceof o.Q?this.__commitTemplateResult(e):e instanceof Node?this.__commitNode(e):d(e)?this.__commitIterable(e):e===s.s?(this.value=s.s,this.clear()):this.__commitText(e))}__insert(e){this.endNode.parentNode.insertBefore(e,this.endNode)}__commitNode(e){this.value!==e&&(this.clear(),this.__insert(e),this.value=e)}__commitText(e){const t=this.startNode.nextSibling,a="string"==typeof(e=null==e?"":e)?e:String(e);t===this.endNode.previousSibling&&3===t.nodeType?t.data=a:this.__commitNode(document.createTextNode(a)),this.value=e}__commitTemplateResult(e){const t=this.options.templateFactory(e);if(this.value instanceof n.i&&this.value.template===t)this.value.update(e.values);else{const a=new n.i(t,e.processor,this.options),r=a._clone();a.update(e.values),this.__commitNode(r),this.value=a}}__commitIterable(e){Array.isArray(this.value)||(this.value=[],this.clear());const t=this.value;let a,r=0;for(const i of e)a=t[r],void 0===a&&(a=new m(this.options),t.push(a),0===r?a.appendIntoPart(this):a.insertAfterPart(t[r-1])),a.setValue(i),a.commit(),r++;r<t.length&&(t.length=r,this.clear(a&&a.endNode))}clear(e=this.startNode){(0,i.if)(this.startNode.parentNode,e.nextSibling,this.endNode)}}class h{constructor(e,t,a){if(this.value=void 0,this.__pendingValue=void 0,2!==a.length||""!==a[0]||""!==a[1])throw new Error("Boolean attributes can only contain a single expression");this.element=e,this.name=t,this.strings=a}setValue(e){this.__pendingValue=e}commit(){for(;(0,r.q)(this.__pendingValue);){const e=this.__pendingValue;this.__pendingValue=s.c,e(this)}if(this.__pendingValue===s.c)return;const e=!!this.__pendingValue;this.value!==e&&(e?this.element.setAttribute(this.name,""):this.element.removeAttribute(this.name),this.value=e),this.__pendingValue=s.c}}class f extends p{constructor(e,t,a){super(e,t,a),this.single=2===a.length&&""===a[0]&&""===a[1]}_createPart(){return new v(this)}_getValue(){return this.single?this.parts[0].value:super._getValue()}commit(){this.dirty&&(this.dirty=!1,this.element[this.name]=this._getValue())}}class v extends u{}let g=!1;(()=>{try{const e={get capture(){return g=!0,!1}};window.addEventListener("test",e,e),window.removeEventListener("test",e,e)}catch(e){}})();class b{constructor(e,t,a){this.value=void 0,this.__pendingValue=void 0,this.element=e,this.eventName=t,this.eventContext=a,this.__boundHandleEvent=e=>this.handleEvent(e)}setValue(e){this.__pendingValue=e}commit(){for(;(0,r.q)(this.__pendingValue);){const e=this.__pendingValue;this.__pendingValue=s.c,e(this)}if(this.__pendingValue===s.c)return;const e=this.__pendingValue,t=this.value,a=null==e||null!=t&&(e.capture!==t.capture||e.once!==t.once||e.passive!==t.passive),i=null!=e&&(null==t||a);a&&this.element.removeEventListener(this.eventName,this.__boundHandleEvent,this.__options),i&&(this.__options=y(e),this.element.addEventListener(this.eventName,this.__boundHandleEvent,this.__options)),this.value=e,this.__pendingValue=s.c}handleEvent(e){"function"==typeof this.value?this.value.call(this.eventContext||this.element,e):this.value.handleEvent(e)}}const y=e=>e&&(g?{capture:e.capture,passive:e.passive,once:e.once}:e.capture)},3841(e,t,a){a.d(t,{X:()=>o,r:()=>n});var r=a(601),i=a(6671),s=a(5172);const n=new WeakMap,o=(e,t,a)=>{let o=n.get(t);void 0===o&&((0,r.if)(t,t.firstChild),n.set(t,o=new i.Qh(Object.assign({templateFactory:s.v},a))),o.appendInto(t)),o.setValue(e),o.commit()}},5172(e,t,a){a.d(t,{c:()=>s,v:()=>i});var r=a(9995);function i(e){let t=s.get(e.type);void 0===t&&(t={stringsArray:new WeakMap,keyString:new Map},s.set(e.type,t));let a=t.stringsArray.get(e.strings);if(void 0!==a)return a;const i=e.strings.join(r.xL);return a=t.keyString.get(i),void 0===a&&(a=new r.Bj(e,e.getTemplateElement()),t.keyString.set(i,a)),t.stringsArray.set(e.strings,a),a}const s=new Map},4679(e,t,a){a.d(t,{i:()=>s});var r=a(601),i=a(9995);class s{constructor(e,t,a){this.__parts=[],this.template=e,this.processor=t,this.options=a}update(e){let t=0;for(const a of this.__parts)void 0!==a&&a.setValue(e[t]),t++;for(const e of this.__parts)void 0!==e&&e.commit()}_clone(){const e=r.o6?this.template.element.content.cloneNode(!0):document.importNode(this.template.element.content,!0),t=[],a=this.template.parts,s=document.createTreeWalker(e,133,null,!1);let n,o=0,l=0,c=s.nextNode();for(;o<a.length;)if(n=a[o],(0,i.s9)(n)){for(;l<n.index;)l++,"TEMPLATE"===c.nodeName&&(t.push(c),s.currentNode=c.content),null===(c=s.nextNode())&&(s.currentNode=t.pop(),c=s.nextNode());if("node"===n.type){const e=this.processor.handleTextExpression(this.options);e.insertAfterNode(c.previousSibling),this.__parts.push(e)}else this.__parts.push(...this.processor.handleAttributeExpressions(c,n.name,n.strings,this.options));o++}else this.__parts.push(void 0),o++;return r.o6&&(document.adoptNode(e),customElements.upgrade(e)),e}}},3957(e,t,a){a.d(t,{Q:()=>o,U:()=>l});var r=a(601),i=a(9995);const s=window.trustedTypes&&trustedTypes.createPolicy("lit-html",{createHTML:e=>e}),n=` ${i.xL} `;class o{constructor(e,t,a,r){this.strings=e,this.values=t,this.type=a,this.processor=r}getHTML(){const e=this.strings.length-1;let t="",a=!1;for(let r=0;r<e;r++){const e=this.strings[r],s=e.lastIndexOf("\x3c!--");a=(s>-1||a)&&-1===e.indexOf("--\x3e",s+1);const o=i.zY.exec(e);t+=null===o?e+(a?n:i.XY):e.substr(0,o.index)+o[1]+o[2]+i.c1+o[3]+i.xL}return t+=this.strings[e],t}getTemplateElement(){const e=document.createElement("template");let t=this.getHTML();return void 0!==s&&(t=s.createHTML(t)),e.innerHTML=t,e}}class l extends o{getHTML(){return`<svg>${super.getHTML()}</svg>`}getTemplateElement(){const e=super.getTemplateElement(),t=e.content,a=t.firstChild;return t.removeChild(a),(0,r.Pf)(t,a.firstChild),e}}},9995(e,t,a){a.d(t,{Bj:()=>o,XY:()=>i,c1:()=>n,h5:()=>d,s9:()=>c,xL:()=>r,zY:()=>p});const r=`{{lit-${String(Math.random()).slice(2)}}}`,i=`\x3c!--${r}--\x3e`,s=new RegExp(`${r}|${i}`),n="$lit$";class o{constructor(e,t){this.parts=[],this.element=t;const a=[],i=[],o=document.createTreeWalker(t.content,133,null,!1);let c=0,u=-1,m=0;const{strings:h,values:{length:f}}=e;for(;m<f;){const e=o.nextNode();if(null!==e){if(u++,1===e.nodeType){if(e.hasAttributes()){const t=e.attributes,{length:a}=t;let r=0;for(let e=0;e<a;e++)l(t[e].name,n)&&r++;for(;r-- >0;){const t=h[m],a=p.exec(t)[2],r=a.toLowerCase()+n,i=e.getAttribute(r);e.removeAttribute(r);const o=i.split(s);this.parts.push({type:"attribute",index:u,name:a,strings:o}),m+=o.length-1}}"TEMPLATE"===e.tagName&&(i.push(e),o.currentNode=e.content)}else if(3===e.nodeType){const t=e.data;if(t.indexOf(r)>=0){const r=e.parentNode,i=t.split(s),o=i.length-1;for(let t=0;t<o;t++){let a,s=i[t];if(""===s)a=d();else{const e=p.exec(s);null!==e&&l(e[2],n)&&(s=s.slice(0,e.index)+e[1]+e[2].slice(0,-n.length)+e[3]),a=document.createTextNode(s)}r.insertBefore(a,e),this.parts.push({type:"node",index:++u})}""===i[o]?(r.insertBefore(d(),e),a.push(e)):e.data=i[o],m+=o}}else if(8===e.nodeType)if(e.data===r){const t=e.parentNode;null!==e.previousSibling&&u!==c||(u++,t.insertBefore(d(),e)),c=u,this.parts.push({type:"node",index:u}),null===e.nextSibling?e.data="":(a.push(e),u--),m++}else{let t=-1;for(;-1!==(t=e.data.indexOf(r,t+1));)this.parts.push({type:"node",index:-1}),m++}}else o.currentNode=i.pop()}for(const e of a)e.parentNode.removeChild(e)}}const l=(e,t)=>{const a=e.length-t.length;return a>=0&&e.slice(a)===t},c=e=>-1!==e.index,d=()=>document.createComment(""),p=/([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F "'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/},7637(e,t,a){a.d(t,{qy:()=>o,XX:()=>n.X,JW:()=>l});var r=a(6671);const i=new class{handleAttributeExpressions(e,t,a,i){const s=t[0];return"."===s?new r.g$(e,t.slice(1),a).parts:"@"===s?[new r.GP(e,t.slice(1),i.eventContext)]:"?"===s?[new r.Yp(e,t.slice(1),a)]:new r.pU(e,t,a).parts}handleTextExpression(e){return new r.Qh(e)}};var s=a(3957),n=(a(1012),a(601),a(624),a(3841));a(5172),a(4679),a(9995),"undefined"!=typeof window&&(window.litHtmlVersions||(window.litHtmlVersions=[])).push("1.4.1");const o=(e,...t)=>new s.Q(e,t,"html",i),l=(e,...t)=>new s.U(e,t,"svg",i)},8330(e){e.exports=JSON.parse('{"name":"lcars-dashboard","private":true,"version":"5.1.0-beta.4","description":"LCARS Dashboard — Home Assistant Lovelace dashboard with Star Trek LCARS UI. Based on Dwains Dashboard by Dwain Scheeren.","scripts":{"build":"webpack --mode=production","watch":"webpack --watch --mode=development"},"keywords":["lcars","home-assistant","lovelace","dashboard","hacs"],"author":"htiel (based on Dwains Dashboard by Dwain Scheeren)","license":"MIT","devDependencies":{"autoprefixer":"^10.2.5","css-loader":"^5.1.3","html-webpack-plugin":"^5.3.1","postcss":"^8.2.8","postcss-cli":"^8.3.1","postcss-loader":"^5.2.0","style-loader":"^2.0.0","tailwindcss":"^2.0.3","webpack":"^5.26.0","webpack-cli":"^4.5.0","webpack-dev-server":"^5.2.3","webpack-merge":"^5.7.3"},"dependencies":{"@mdi/js":"^6.5.95","card-tools":"github:thomasloven/lovelace-card-tools#477f3d4eeb5c70cab047d418d19afb6b0f07bf49","custom-card-helpers":"^1.8.0","js-cookie":"^3.0.1","lit-element":"^2.2.1","lit-html":"^1.1.2","sortablejs":"^1.14.0"}}')}},t={};function a(r){var i=t[r];if(void 0!==i)return i.exports;var s=t[r]={exports:{}};return e[r](s,s.exports,a),s.exports}a.d=(e,t)=>{for(var r in t)a.o(t,r)&&!a.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},a.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),a(7753),a(1406),a(513),a(8240),a(5799),a(8532),a(3033),a(2982),a(6888),a(4459),a(6280),a(4113),a(8233),a(755),a(4532),a(772),a(1568),a(145),a(1540),a(6586),a(1053),a(5603),a(7411),a(5414),a(8888),a(5824),a(1160),a(4338),a(1998),a(7908),a(5884),a(5316),a(1884),a(958),a(114),a(1255),a(4795)})();