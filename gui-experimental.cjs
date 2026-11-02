"use strict";Object.defineProperties(exports,{__esModule:{value:!0},[Symbol.toStringTag]:{value:"Module"}});const d=require("solid-js/web"),k=require("@opencode/plugin/gui"),g=require("solid-js");var j=d.template("<div class=oc-rail><div class=oc-ticks></div><div class=oc-card>"),F=d.template("<div class=oc-tick>"),D=d.template("<button class=oc-item><span class=oc-label></span><span class=oc-mark>");const O=`
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
`;function Y(){const h=k.usePlugin(),[C,b]=g.createSignal();let w=!1;const y=()=>h.sessions.current(),f=g.createMemo(()=>{const e=y(),t=e?h.servers.get(e.server.id)?.data:void 0;if(!e||!t)return[];const s=t.session.get(e.id)?.revert?.messageID;return t.session.message.list(e.id).filter(o=>o.type==="user"&&(!s||o.id<s))}),p=e=>{for(let t=e.parentElement;t;t=t.parentElement)if(/(auto|scroll)/.test(getComputedStyle(t).overflowY)&&t.scrollHeight>t.clientHeight)return t},B=()=>{const e=f();if(!e.length)return;const t=document.querySelector("[data-message-id]"),o=((t&&p(t))?.getBoundingClientRect().top??0)+100;let n;for(const i of document.querySelectorAll("[data-message-id]")){if(i.getBoundingClientRect().top>o)break;n=i.getAttribute("data-message-id")||n}if(!n)return e[0].id;const r=e.filter(i=>i.id<=n);return r.length?r[r.length-1].id:e[0].id},S=()=>{const e=document.querySelector("[data-message-id]");(e&&p(e))?.dispatchEvent(new WheelEvent("wheel",{deltaY:-1,bubbles:!0}))},M=e=>{const t=p(e);if(!t){e.scrollIntoView({block:"start",behavior:"auto"});return}const o=t.querySelector("[data-session-title]")?.offsetHeight??64,n=()=>{const r=e.getBoundingClientRect().top-t.getBoundingClientRect().top;t.scrollTop+=r-o};n(),n(),setTimeout(()=>{if(!e.isConnected)return;const r=e.getBoundingClientRect().top-t.getBoundingClientRect().top;console.debug("[timeline] align",Math.round(o),Math.round(r),Math.round(t.scrollTop)),Math.abs(r-o)>2&&n()},180)},x=()=>new Promise(e=>requestAnimationFrame(()=>e())),T=e=>{const t=p(e);if(!t)return;const s=t.querySelector("[data-session-title]"),o=e.getBoundingClientRect().top-t.getBoundingClientRect().top-(s?.offsetHeight??0);Math.abs(o)>.5&&(t.scrollTop+=o)},R=async(e,t)=>{const s=performance.now();let o=0,n=-1,r=Number.NaN;for(;performance.now()-s<1e3;){const i=document.getElementById("message-"+t),c=e.scrollHeight,a=i?.getBoundingClientRect().top??Number.NaN;if(i&&c===n&&Math.abs(a-r)<.5?o++:o=0,n=c,r=a,o>=3&&i)return i;await x()}return document.getElementById("message-"+t)??void 0},H=(e,t)=>e.getBoundingClientRect().top-t.getBoundingClientRect().top+t.scrollTop,L=e=>{const t=f(),s=new Map;for(const o of document.querySelectorAll("[data-message-id]")){const n=t.findIndex(i=>i.id===o.getAttribute("data-message-id"));if(n<0)continue;const r=H(o,e);r<(s.get(n)??1/0)&&s.set(n,r)}return[...s].map(([o,n])=>({index:o,top:n})).sort((o,n)=>o.index-n.index)},A=e=>{const t=document.querySelector("[data-message-id]"),s=t&&p(t);if(!s)return!1;const n=f().findIndex(v=>v.id===e);if(n<0)return!1;const r=L(s);if(!r.length)return!1;const c=s.querySelector("[data-session-title]")?.offsetHeight??0,a=Math.max(64,s.clientHeight-c-40),l=r[0],u=r[r.length-1],m=s.scrollTop;if(l.index<=n&&n<=u.index)return s.scrollBy({top:-a}),s.scrollTop!==m;if(r.length>=2&&u.index!==l.index){const v=(u.top-l.top)/(u.index-l.index);if(v>0){const $=s.scrollHeight-s.clientHeight,N=l.top+(n-l.index)*v;return s.scrollTop=Math.min($,Math.max(0,N-c)),s.scrollTop!==m}}return s.scrollBy({top:n<l.index?-a:a}),s.scrollTop!==m},q=async e=>{b(e),w=!0;const t=performance.now(),s=document.getElementById("message-"+e);if(s){M(s);return}S(),await new Promise(o=>setTimeout(o,50));for(let o=0;o<8;o++){const n=document.getElementById("message-"+e);if(n){M(n),console.debug("[timeline] jump ok",o,Math.round(performance.now()-t));return}if(!A(e))return;await new Promise(r=>setTimeout(r,40))}console.debug("[timeline] jump fail",Math.round(performance.now()-t))},_=async e=>{const t=f(),s=t.findIndex(i=>i.id===e);if(s<0)return;const o=B(),n=o?t.findIndex(i=>i.id===o):-1;if(n<0){await q(e);return}S();const r=s-n;if(r){const i=r>0?"message.next":"message.previous";for(let c=0;c<Math.abs(r)&&h.commands.run(i);c++);}await x(),document.getElementById("message-"+e)||await q(e)};let E=0;const P=async e=>{if(!f().some(c=>c.id===e))return;const t=++E,s=performance.now();b(e),w=!0;const o=document.querySelector("[data-message-id]"),n=o?p(o):void 0,r=n?.querySelector("[data-timeline-virtual-content]");if(!n||!r)return;const i=r.style.visibility;r.style.visibility="hidden";try{const c="#message-"+e;location.hash!==c?(history.replaceState(history.state,"",c),window.dispatchEvent(new PopStateEvent("popstate",{state:history.state})),await x()):S(),document.getElementById("message-"+e)||(history.replaceState(history.state,"",location.pathname+location.search),await _(e));const a=await R(n,e);if(!a||t!==E||(T(a),await x(),t!==E))return;T(a),console.debug("[timeline] jump",Math.round(performance.now()-s),Math.round(a.getBoundingClientRect().top-n.getBoundingClientRect().top))}finally{t===E&&(r.style.visibility=i)}},I=new Set;return g.createEffect(()=>{const e=y(),t=e?h.servers.get(e.server.id)?.data:void 0;!e||!t||I.has(e.id)||(I.add(e.id),t.session.message.loadMore(e.id,{all:!0}).catch(()=>{}))}),g.createEffect(()=>{y()?.key,b(void 0),w=!1}),g.onMount(()=>{const e=()=>{if(w)return;const a=f();if(!a.length)return;const l=document.querySelector("[data-message-id]"),u=l&&p(l);if(u){const v=u.scrollHeight-u.clientHeight;if(v>24&&v-u.scrollTop<=24){b(a[a.length-1].id);return}}const m=B();m&&b(m)};let t=0;const s=()=>{cancelAnimationFrame(t),t=requestAnimationFrame(e)},o=a=>{const l=document.querySelector("[data-message-id]"),u=l&&p(l),m=a.target;return!u||!(m instanceof Node)?!1:u.contains(m)?!0:m instanceof Element&&!!m.closest(".scroll-view__thumb")},n=()=>{w&&(w=!1,e())},r=a=>{a.isTrusted&&o(a)&&n()},i=a=>{const l=a.target;l instanceof Element&&l.closest("input, textarea, [contenteditable]")||["PageUp","PageDown","Home","End","ArrowUp","ArrowDown"," "].includes(a.key)&&n()};document.addEventListener("scroll",s,!0),document.addEventListener("wheel",r,{passive:!0,capture:!0}),document.addEventListener("touchstart",r,{passive:!0,capture:!0}),document.addEventListener("pointerdown",r,!0),document.addEventListener("keydown",i,!0);const c=window.setInterval(e,800);e(),g.onCleanup(()=>{document.removeEventListener("scroll",s,!0),document.removeEventListener("wheel",r,!0),document.removeEventListener("touchstart",r,!0),document.removeEventListener("pointerdown",r,!0),document.removeEventListener("keydown",i,!0),cancelAnimationFrame(t),window.clearInterval(c)})}),d.createComponent(g.Show,{get when(){return y()},get children(){return d.createComponent(d.Portal,{get mount(){return document.body},get children(){var e=j(),t=e.firstChild,s=t.nextSibling;return d.insert(t,d.createComponent(g.For,{get each(){return f()},children:o=>(()=>{var n=F();return d.effect(()=>n.classList.toggle("is-active",C()===o.id)),n})()})),d.insert(s,d.createComponent(g.For,{get each(){return f()},children:o=>(()=>{var n=D(),r=n.firstChild;return n.$$click=()=>P(o.id),d.insert(r,()=>o.text||"（无文本）"),d.effect(i=>{var c=C()===o.id,a=new Date(o.time.created).toLocaleString()+"  "+(o.text||"（无文本）");return c!==i.e&&n.classList.toggle("is-active",i.e=c),a!==i.t&&d.setAttribute(n,"title",i.t=a),i},{e:void 0,t:void 0}),n})()})),e}})}})}const z=k.Plugin.define({setup(h){h.add(k.Style,O),h.add(k.Slot,{at:"window.bottom",render:()=>d.createComponent(Y,{})})}});d.delegateEvents(["click"]);exports.default=z;
