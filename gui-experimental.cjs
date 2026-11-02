"use strict";Object.defineProperties(exports,{__esModule:{value:!0},[Symbol.toStringTag]:{value:"Module"}});const d=require("solid-js/web"),S=require("@opencode/plugin/gui"),g=require("solid-js");var j=d.template("<div class=oc-rail><div class=oc-ticks></div><div class=oc-card>"),D=d.template("<div class=oc-tick>"),F=d.template("<button class=oc-item><span class=oc-label></span><span class=oc-mark>");const Y=`
.oc-rail {
  position: fixed;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2147483000;
  display: flex;
  align-items: center;
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
  background: var(--oc-accent, #4d6bfe);
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
  background: var(--oc-bg, #fff);
  box-shadow: 0 14px 44px rgba(15,15,20,.16), 0 0 0 1px rgba(15,15,20,.05);
  transform: translate(10px, -50%);
  opacity: 0;
  pointer-events: none;
  transition: opacity .16s ease, transform .16s ease;
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
.oc-item.is-active { opacity: 1; color: var(--oc-accent, #4d6bfe); }
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
  background: var(--oc-accent, #4d6bfe);
}
`;function O(){const h=S.usePlugin(),[C,b]=g.createSignal();let w=!1;const y=()=>h.sessions.current(),p=g.createMemo(()=>{const e=y(),t=e?h.servers.get(e.server.id)?.data:void 0;if(!e||!t)return[];const s=t.session.get(e.id)?.revert?.messageID;return t.session.message.list(e.id).filter(n=>n.type==="user"&&(!s||n.id<s))}),f=e=>{for(let t=e.parentElement;t;t=t.parentElement)if(/(auto|scroll)/.test(getComputedStyle(t).overflowY)&&t.scrollHeight>t.clientHeight)return t},T=()=>{const e=p();if(!e.length)return;const t=document.querySelector("[data-message-id]"),n=((t&&f(t))?.getBoundingClientRect().top??0)+100;let o;for(const i of document.querySelectorAll("[data-message-id]")){if(i.getBoundingClientRect().top>n)break;o=i.getAttribute("data-message-id")||o}if(!o)return e[0].id;const r=e.filter(i=>i.id<=o);return r.length?r[r.length-1].id:e[0].id},k=()=>{const e=document.querySelector("[data-message-id]");(e&&f(e))?.dispatchEvent(new WheelEvent("wheel",{deltaY:-1,bubbles:!0}))},B=e=>{const t=f(e);if(!t){e.scrollIntoView({block:"start",behavior:"auto"});return}const n=t.querySelector("[data-session-title]")?.offsetHeight??64,o=()=>{const r=e.getBoundingClientRect().top-t.getBoundingClientRect().top;t.scrollTop+=r-n};o(),o(),setTimeout(()=>{if(!e.isConnected)return;const r=e.getBoundingClientRect().top-t.getBoundingClientRect().top;console.debug("[timeline] align",Math.round(n),Math.round(r),Math.round(t.scrollTop)),Math.abs(r-n)>2&&o()},180)},x=()=>new Promise(e=>requestAnimationFrame(()=>e())),M=e=>{const t=f(e);if(!t)return;const s=t.querySelector("[data-session-title]"),n=e.getBoundingClientRect().top-t.getBoundingClientRect().top-(s?.offsetHeight??0);Math.abs(n)>.5&&(t.scrollTop+=n)},I=async(e,t)=>{const s=performance.now();let n=0,o=-1,r=Number.NaN;for(;performance.now()-s<1e3;){const i=document.getElementById("message-"+t),c=e.scrollHeight,a=i?.getBoundingClientRect().top??Number.NaN;if(i&&c===o&&Math.abs(a-r)<.5?n++:n=0,o=c,r=a,n>=3&&i)return i;await x()}return document.getElementById("message-"+t)??void 0},R=(e,t)=>e.getBoundingClientRect().top-t.getBoundingClientRect().top+t.scrollTop,L=e=>{const t=p(),s=new Map;for(const n of document.querySelectorAll("[data-message-id]")){const o=t.findIndex(i=>i.id===n.getAttribute("data-message-id"));if(o<0)continue;const r=R(n,e);r<(s.get(o)??1/0)&&s.set(o,r)}return[...s].map(([n,o])=>({index:n,top:o})).sort((n,o)=>n.index-o.index)},A=e=>{const t=document.querySelector("[data-message-id]"),s=t&&f(t);if(!s)return!1;const o=p().findIndex(v=>v.id===e);if(o<0)return!1;const r=L(s);if(!r.length)return!1;const c=s.querySelector("[data-session-title]")?.offsetHeight??0,a=Math.max(64,s.clientHeight-c-40),l=r[0],u=r[r.length-1],m=s.scrollTop;if(l.index<=o&&o<=u.index)return s.scrollBy({top:-a}),s.scrollTop!==m;if(r.length>=2&&u.index!==l.index){const v=(u.top-l.top)/(u.index-l.index);if(v>0){const $=s.scrollHeight-s.clientHeight,N=l.top+(o-l.index)*v;return s.scrollTop=Math.min($,Math.max(0,N-c)),s.scrollTop!==m}}return s.scrollBy({top:o<l.index?-a:a}),s.scrollTop!==m},q=async e=>{b(e),w=!0;const t=performance.now(),s=document.getElementById("message-"+e);if(s){B(s);return}k(),await new Promise(n=>setTimeout(n,50));for(let n=0;n<8;n++){const o=document.getElementById("message-"+e);if(o){B(o),console.debug("[timeline] jump ok",n,Math.round(performance.now()-t));return}if(!A(e))return;await new Promise(r=>setTimeout(r,40))}console.debug("[timeline] jump fail",Math.round(performance.now()-t))},P=async e=>{const t=p(),s=t.findIndex(i=>i.id===e);if(s<0)return;const n=T(),o=n?t.findIndex(i=>i.id===n):-1;if(o<0){await q(e);return}k();const r=s-o;if(r){const i=r>0?"message.next":"message.previous";for(let c=0;c<Math.abs(r)&&h.commands.run(i);c++);}await x(),document.getElementById("message-"+e)||await q(e)};let E=0;const _=async e=>{if(!p().some(c=>c.id===e))return;const t=++E,s=performance.now();b(e),w=!0;const n=document.querySelector("[data-message-id]"),o=n?f(n):void 0,r=o?.querySelector("[data-timeline-virtual-content]");if(!o||!r)return;const i=r.style.visibility;r.style.visibility="hidden";try{const c="#message-"+e;location.hash!==c?(history.replaceState(history.state,"",c),window.dispatchEvent(new PopStateEvent("popstate",{state:history.state})),await x()):k(),document.getElementById("message-"+e)||(history.replaceState(history.state,"",location.pathname+location.search),await P(e));const a=await I(o,e);if(!a||t!==E||(M(a),await x(),t!==E))return;M(a),console.debug("[timeline] jump",Math.round(performance.now()-s),Math.round(a.getBoundingClientRect().top-o.getBoundingClientRect().top))}finally{t===E&&(r.style.visibility=i)}},H=new Set;return g.createEffect(()=>{const e=y(),t=e?h.servers.get(e.server.id)?.data:void 0;!e||!t||H.has(e.id)||(H.add(e.id),t.session.message.loadMore(e.id,{all:!0}).catch(()=>{}))}),g.createEffect(()=>{y()?.key,b(void 0),w=!1}),g.onMount(()=>{const e=()=>{if(w)return;const a=p();if(!a.length)return;const l=document.querySelector("[data-message-id]"),u=l&&f(l);if(u){const v=u.scrollHeight-u.clientHeight;if(v>24&&v-u.scrollTop<=24){b(a[a.length-1].id);return}}const m=T();m&&b(m)};let t=0;const s=()=>{cancelAnimationFrame(t),t=requestAnimationFrame(e)},n=a=>{const l=document.querySelector("[data-message-id]"),u=l&&f(l),m=a.target;return!u||!(m instanceof Node)?!1:u.contains(m)?!0:m instanceof Element&&!!m.closest(".scroll-view__thumb")},o=()=>{w&&(w=!1,e())},r=a=>{a.isTrusted&&n(a)&&o()},i=a=>{const l=a.target;l instanceof Element&&l.closest("input, textarea, [contenteditable]")||["PageUp","PageDown","Home","End","ArrowUp","ArrowDown"," "].includes(a.key)&&o()};document.addEventListener("scroll",s,!0),document.addEventListener("wheel",r,{passive:!0,capture:!0}),document.addEventListener("touchstart",r,{passive:!0,capture:!0}),document.addEventListener("pointerdown",r,!0),document.addEventListener("keydown",i,!0);const c=window.setInterval(e,800);e(),g.onCleanup(()=>{document.removeEventListener("scroll",s,!0),document.removeEventListener("wheel",r,!0),document.removeEventListener("touchstart",r,!0),document.removeEventListener("pointerdown",r,!0),document.removeEventListener("keydown",i,!0),cancelAnimationFrame(t),window.clearInterval(c)})}),d.createComponent(g.Show,{get when(){return y()},get children(){return d.createComponent(d.Portal,{get mount(){return document.body},get children(){var e=j(),t=e.firstChild,s=t.nextSibling;return d.insert(t,d.createComponent(g.For,{get each(){return p()},children:n=>(()=>{var o=D();return d.effect(()=>o.classList.toggle("is-active",C()===n.id)),o})()})),s.addEventListener("wheel",n=>{const o=n.currentTarget,r=o.scrollHeight>o.clientHeight+1,i=o.scrollTop<=0&&n.deltaY<0,c=o.scrollTop+o.clientHeight>=o.scrollHeight-1&&n.deltaY>0;(!r||i||c)&&n.preventDefault(),n.stopPropagation()}),d.insert(s,d.createComponent(g.For,{get each(){return p()},children:n=>(()=>{var o=F(),r=o.firstChild;return o.$$click=()=>_(n.id),d.insert(r,()=>n.text||"（无文本）"),d.effect(i=>{var c=C()===n.id,a=new Date(n.time.created).toLocaleString()+"  "+(n.text||"（无文本）");return c!==i.e&&o.classList.toggle("is-active",i.e=c),a!==i.t&&d.setAttribute(o,"title",i.t=a),i},{e:void 0,t:void 0}),o})()})),e}})}})}const z=S.Plugin.define({setup(h){h.add(S.Style,Y),h.add(S.Slot,{at:"window.bottom",render:()=>d.createComponent(O,{})})}});d.delegateEvents(["click"]);exports.default=z;
