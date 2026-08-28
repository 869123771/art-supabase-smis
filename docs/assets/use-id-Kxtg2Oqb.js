import{P as e}from"./focus-trap-CWDqsKZM.js";import{Dt as t,Nn as n,Ot as r,Sn as i,et as a,pi as o}from"./style-C1L0GNpN.js";var s={prefix:Math.floor(Math.random()*1e4),current:0},c=Symbol(`elIdInjection`),l=()=>i()?n(c,s):s,u=n=>{let i=l();!r&&i===s&&e(`IdInjection`,`Looks like you are using server rendering, you must provide a id provider to ensure the hydration process to be succeed
usage: app.provide(ID_INJECTION_KEY, {
  prefix: number,
  current: number,
})`);let c=a();return t(()=>o(n)||`${c.value}-id-${i.prefix}-${i.current++}`)};export{l as n,u as t};