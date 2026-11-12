"use strict";Object.defineProperties(exports,{__esModule:{value:!0},[Symbol.toStringTag]:{value:"Module"}});const l=require("solid-js/web"),S=require("@opencode/plugin/gui"),p=require("solid-js");var z=l.template("<div class=oc-rail><div class=oc-ticks></div><div class=oc-card>"),j=l.template("<div class=oc-tick>"),O=l.template("<button class=oc-item><span class=oc-label></span><span class=oc-mark>");const U=`
.oc-rail {
  position: fixed;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2147483000;
  display: flex;
  align-items: center;
  color: var(--v2-text-text-base, currentColor);
  font: inherit;
}
.oc-ticks {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.64em;
  padding: 0.7em 0;
  transition: opacity .12s ease;
}
.oc-tick {
  width: 10px;
  height: 2px;
  border-radius: 1px;
  background: color-mix(in srgb, currentColor 22%, transparent);
  transition: width .15s ease, background .15s ease;
}
.oc-tick.is-active {
  width: 18px;
  background: var(--v2-icon-icon-accent, var(--oc-accent, #4d6bfe));
}
.oc-rail:hover .oc-ticks { opacity: 0; pointer-events: none; }
.oc-card {
  position: absolute;
  right: 0;
  top: 50%;
  width: 23.5em;
  max-height: 58vh;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 0.7em;
  border-radius: 1em;
  background: var(--v2-background-bg-base, var(--oc-bg, Canvas));
  color: var(--v2-text-text-base, CanvasText);
  box-shadow: var(--v2-elevation-floating, var(--v2-elevation-raised, 0 14px 44px rgba(15,15,20,.16))),
              0 0 0 1px var(--v2-border-border-base, transparent);
  scrollbar-color: var(--v2-text-text-muted, #888) transparent;
  transform: translate(10px, -50%);
  opacity: 0;
  pointer-events: none;
  transition: opacity .16s ease, transform .16s ease;
}
[data-color-scheme="dark"] .oc-card {
  background: var(--v2-background-bg-layer-01, var(--v2-background-bg-base, var(--oc-bg, Canvas)));
}
.oc-rail:hover .oc-card {
  opacity: 1;
  pointer-events: auto;
  transform: translate(0, -50%);
}
.oc-item {
  display: flex;
  align-items: center;
  gap: 0.7em;
  width: 100%;
  padding: 0.5em 0.64em;
  border: 0;
  border-radius: 0.57em;
  background: transparent;
  color: inherit;
  opacity: .55;
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.oc-item:hover { background: color-mix(in srgb, currentColor 6%, transparent); }
.oc-item.is-active { opacity: 1; color: var(--v2-icon-icon-accent, var(--oc-accent, #4d6bfe)); }
.oc-label {
  flex: 1;
  min-width: 0;
  font-size: .96em;
  line-height: 1.45;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.oc-mark {
  flex: none;
  width: 11px;
  height: 2px;
  border-radius: 1px;
  background: color-mix(in srgb, currentColor 25%, transparent);
}
.oc-item.is-active .oc-mark {
  width: 16px;
  background: var(--v2-icon-icon-accent, var(--oc-accent, #4d6bfe));
}
`;function V(){const h=S.usePlugin(),[T,b]=p.createSignal(),[R,P]=p.createSignal(window.innerHeight);let w=!1;const y=()=>h.sessions.current(),f=p.createMemo(()=>{const e=y(),t=e?h.servers.get(e.server.id)?.data:void 0;if(!e||!t)return[];const r=t.session.get(e.id)?.revert?.messageID;return t.session.message.list(e.id).filter(n=>n.type==="user"&&(!r||n.id<r))}),v=e=>{for(let t=e.parentElement;t;t=t.parentElement)if(/(auto|scroll)/.test(getComputedStyle(t).overflowY)&&t.scrollHeight>t.clientHeight)return t},H=p.createMemo(()=>{const e=f().length;if(e<2)return{gap:"0.64em",scale:1};const t=Math.max(120,Math.min(R()*.62,640)-24),r=Math.min(10,Math.max(2,(t-e*2)/(e-1))),n=e*2+(e-1)*r;return{gap:`${r}px`,scale:n>t?t/n:1}}),B=()=>{const e=f();if(!e.length)return;const t=document.querySelector("[data-message-id]"),n=((t&&v(t))?.getBoundingClientRect().top??0)+100;let o;for(const i of document.querySelectorAll("[data-message-id]")){if(i.getBoundingClientRect().top>n)break;o=i.getAttribute("data-message-id")||o}if(!o)return e[0].id;const s=e.filter(i=>i.id<=o);return s.length?s[s.length-1].id:e[0].id},C=()=>{const e=document.querySelector("[data-message-id]");(e&&v(e))?.dispatchEvent(new WheelEvent("wheel",{deltaY:-1,bubbles:!0}))},M=e=>{const t=v(e);if(!t){e.scrollIntoView({block:"start",behavior:"auto"});return}const n=t.querySelector("[data-session-title]")?.offsetHeight??64,o=()=>{const s=e.getBoundingClientRect().top-t.getBoundingClientRect().top;t.scrollTop+=s-n};o(),o(),setTimeout(()=>{if(!e.isConnected)return;const s=e.getBoundingClientRect().top-t.getBoundingClientRect().top;Math.abs(s-n)>2&&o()},180)},x=()=>new Promise(e=>requestAnimationFrame(()=>e())),q=e=>{const t=v(e);if(!t)return;const r=t.querySelector("[data-session-title]"),n=e.getBoundingClientRect().top-t.getBoundingClientRect().top-(r?.offsetHeight??0);Math.abs(n)>.5&&(t.scrollTop+=n)},A=async(e,t)=>{const r=performance.now();let n=0,o=-1,s=Number.NaN;for(;performance.now()-r<1e3;){const i=document.getElementById("message-"+t),a=e.scrollHeight,g=i?.getBoundingClientRect().top??Number.NaN;if(i&&a===o&&Math.abs(g-s)<.5?n++:n=0,o=a,s=g,n>=3&&i)return i;await x()}return document.getElementById("message-"+t)??void 0},$=(e,t)=>e.getBoundingClientRect().top-t.getBoundingClientRect().top+t.scrollTop,_=e=>{const t=f(),r=new Map;for(const n of document.querySelectorAll("[data-message-id]")){const o=t.findIndex(i=>i.id===n.getAttribute("data-message-id"));if(o<0)continue;const s=$(n,e);s<(r.get(o)??1/0)&&r.set(o,s)}return[...r].map(([n,o])=>({index:n,top:o})).sort((n,o)=>n.index-o.index)},N=e=>{const t=document.querySelector("[data-message-id]"),r=t&&v(t);if(!r)return!1;const o=f().findIndex(u=>u.id===e);if(o<0)return!1;const s=_(r);if(!s.length)return!1;const a=r.querySelector("[data-session-title]")?.offsetHeight??0,g=Math.max(64,r.clientHeight-a-40),c=s[0],d=s[s.length-1],m=r.scrollTop;if(c.index<=o&&o<=d.index)return r.scrollBy({top:-g}),r.scrollTop!==m;if(s.length>=2&&d.index!==c.index){const u=(d.top-c.top)/(d.index-c.index);if(u>0){const E=r.scrollHeight-r.clientHeight,Y=c.top+(o-c.index)*u;return r.scrollTop=Math.min(E,Math.max(0,Y-a)),r.scrollTop!==m}}return r.scrollBy({top:o<c.index?-g:g}),r.scrollTop!==m},I=async e=>{b(e),w=!0;const t=document.getElementById("message-"+e);if(t){M(t);return}C(),await new Promise(r=>setTimeout(r,50));for(let r=0;r<8;r++){const n=document.getElementById("message-"+e);if(n){M(n);return}if(!N(e))return;await new Promise(o=>setTimeout(o,40))}},D=async e=>{const t=f(),r=t.findIndex(i=>i.id===e);if(r<0)return;const n=B(),o=n?t.findIndex(i=>i.id===n):-1;if(o<0){await I(e);return}C();const s=r-o;if(s){const i=s>0?"message.next":"message.previous";for(let a=0;a<Math.abs(s)&&h.commands.run(i);a++);}await x(),document.getElementById("message-"+e)||await I(e)};let k=0;const F=async e=>{if(!f().some(i=>i.id===e))return;const t=++k;b(e),w=!0;const r=document.querySelector("[data-message-id]"),n=r?v(r):void 0,o=n?.querySelector("[data-timeline-virtual-content]");if(!n||!o)return;const s=o.style.visibility;o.style.visibility="hidden";try{const i="#message-"+e;location.hash!==i?(history.replaceState(history.state,"",i),window.dispatchEvent(new PopStateEvent("popstate",{state:history.state})),await x()):C(),document.getElementById("message-"+e)||(history.replaceState(history.state,"",location.pathname+location.search),await D(e));const a=await A(n,e);if(!a||t!==k||(q(a),await x(),t!==k))return;q(a)}finally{t===k&&(o.style.visibility=s)}},L=new Set;return p.createEffect(()=>{const e=y(),t=e?h.servers.get(e.server.id)?.data:void 0;!e||!t||L.has(e.id)||(L.add(e.id),t.session.message.loadMore(e.id,{all:!0}).catch(()=>{}))}),p.createEffect(()=>{y()?.key,b(void 0),w=!1}),p.onMount(()=>{const e=()=>{if(w)return;const c=f();if(!c.length)return;const d=document.querySelector("[data-message-id]"),m=d&&v(d);if(m){const E=m.scrollHeight-m.clientHeight;if(E>24&&E-m.scrollTop<=24){b(c[c.length-1].id);return}}const u=B();u&&b(u)};let t=0;const r=()=>{cancelAnimationFrame(t),t=requestAnimationFrame(e)},n=c=>{const d=document.querySelector("[data-message-id]"),m=d&&v(d),u=c.target;return!m||!(u instanceof Node)?!1:m.contains(u)?!0:u instanceof Element&&!!u.closest(".scroll-view__thumb")},o=()=>{w&&(w=!1,e())},s=c=>{c.isTrusted&&n(c)&&o()},i=c=>{const d=c.target;d instanceof Element&&d.closest("input, textarea, [contenteditable]")||["PageUp","PageDown","Home","End","ArrowUp","ArrowDown"," "].includes(c.key)&&o()};document.addEventListener("scroll",r,!0),document.addEventListener("wheel",s,{passive:!0,capture:!0}),document.addEventListener("touchstart",s,{passive:!0,capture:!0}),document.addEventListener("pointerdown",s,!0),document.addEventListener("keydown",i,!0);const a=()=>P(window.innerHeight);window.addEventListener("resize",a);const g=window.setInterval(e,800);e(),p.onCleanup(()=>{document.removeEventListener("scroll",r,!0),document.removeEventListener("wheel",s,!0),document.removeEventListener("touchstart",s,!0),document.removeEventListener("pointerdown",s,!0),document.removeEventListener("keydown",i,!0),window.removeEventListener("resize",a),cancelAnimationFrame(t),window.clearInterval(g)})}),l.createComponent(p.Show,{get when(){return y()},get children(){return l.createComponent(l.Portal,{get mount(){return document.body},get children(){var e=z(),t=e.firstChild,r=t.nextSibling;return l.insert(t,l.createComponent(p.For,{get each(){return f()},children:n=>(()=>{var o=j();return l.effect(()=>o.classList.toggle("is-active",T()===n.id)),o})()})),r.addEventListener("wheel",n=>{const o=n.currentTarget,s=o.scrollHeight>o.clientHeight+1,i=o.scrollTop<=0&&n.deltaY<0,a=o.scrollTop+o.clientHeight>=o.scrollHeight-1&&n.deltaY>0;(!s||i||a)&&n.preventDefault(),n.stopPropagation()}),l.insert(r,l.createComponent(p.For,{get each(){return f()},children:n=>(()=>{var o=O(),s=o.firstChild;return o.$$click=()=>F(n.id),l.insert(s,()=>n.text||"（无文本）"),l.effect(i=>{var a=T()===n.id,g=new Date(n.time.created).toLocaleString()+"  "+(n.text||"（无文本）");return a!==i.e&&o.classList.toggle("is-active",i.e=a),g!==i.t&&l.setAttribute(o,"title",i.t=g),i},{e:void 0,t:void 0}),o})()})),l.effect(n=>{var o=H().gap,s=`scaleY(${H().scale})`;return o!==n.e&&l.setStyleProperty(t,"gap",n.e=o),s!==n.t&&l.setStyleProperty(t,"transform",n.t=s),n},{e:void 0,t:void 0}),e}})}})}const G=S.Plugin.define({setup(h){h.add(S.Style,U),h.add(S.Slot,{at:"window.bottom",render:()=>l.createComponent(V,{})})}});l.delegateEvents(["click"]);exports.default=G;
