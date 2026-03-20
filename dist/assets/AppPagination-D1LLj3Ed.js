import{c as m,j as t,a as b}from"./index-CI5GufsS.js";import{C as p}from"./chevron-left-Cp_SQycM.js";/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=[["path",{d:"m11 17-5-5 5-5",key:"13zhaf"}],["path",{d:"m18 17-5-5 5-5",key:"h8a8et"}]],v=m("chevrons-left",g);/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const f=[["path",{d:"m6 17 5-5-5-5",key:"xnjwq"}],["path",{d:"m13 17 5-5-5-5",key:"17xmmf"}]],j=m("chevrons-right",f),$=({current:e,total:a,onChange:o,maxVisible:d=5})=>{let n=Math.max(1,e-Math.floor(d/2));const h=Math.min(a,n+d-1);h-n+1<d&&(n=Math.max(1,h-d+1));const l=[];for(let s=n;s<=h;s++)l.push(s);const i="flex h-8 w-8 items-center justify-center rounded-lg border text-[13px] font-bold transition-all active:scale-95",x="bg-primary border-primary text-white shadow-[var(--shadow-md)] shadow-primary/20",r="bg-card border-[var(--border)] text-secondary-foreground hover:border-primary hover:text-primary hover:bg-primary-light-bg/30",c="bg-accent/50 border-[var(--border)] text-muted-foreground opacity-40 cursor-not-allowed";return t.jsxs("div",{className:"flex items-center gap-1.5",children:[t.jsx("button",{onClick:()=>o(1),disabled:e===1,className:`${i} ${e===1?c:r}`,title:"First Page",children:t.jsx(v,{size:14,strokeWidth:2.5})}),t.jsx("button",{onClick:()=>o(Math.max(1,e-1)),disabled:e===1,className:`${i} ${e===1?c:r}`,title:"Previous Page",children:t.jsx(p,{size:14,strokeWidth:2.5})}),t.jsx("div",{className:"flex items-center gap-1 mx-1",children:l.map(s=>t.jsx("button",{onClick:()=>o(s),className:`${i} ${s===e?x:r}`,children:s},s))}),t.jsx("button",{onClick:()=>o(Math.min(a,e+1)),disabled:e>=a,className:`${i} ${e>=a?c:r}`,title:"Next Page",children:t.jsx(b,{size:14,strokeWidth:2.5})}),t.jsx("button",{onClick:()=>o(a),disabled:e>=a,className:`${i} ${e>=a?c:r}`,title:"Last Page",children:t.jsx(j,{size:14,strokeWidth:2.5})})]})};export{$ as A};
