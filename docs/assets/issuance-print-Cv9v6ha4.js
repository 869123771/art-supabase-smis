import"./rolldown-runtime-C0FnF6B9.js";import{Hn as e}from"./use-global-config-TrC6eEMf.js";import{Nr as t,zn as n}from"./api-tt767gTU.js";import{t as r}from"./escape-ClPIfvfb.js";/* empty css                            */import{Q as i,Z as a,jn as o}from"./index-CkMLIRos.js";import{n as s}from"./art-employee-select-Dd91GCwp.js";function c(e,t){let[n]=e;if(!n?.id)throw Error(`未找到${t}`);if(e.length!==1)throw Error(`${t}存在多个匹配记录，请核对编号后重新导入`);return n}function l(r,o){let l=i(),u=e(async e=>c((await a(s,{tenantId:r,keyword:e,from:0})).filter(t=>t.tenantId===r&&t.employeeNo===e),`员工工号：${e}`)),d=e(async e=>c((await a(n,{keyword:e,status:`enabled`,from:0})).filter(t=>t.tenantId===r&&t.locationCode===e),`启用仓库编码：${e}`)),f=e(async e=>c((await a(t,{materialCode:e,materialType:o,status:`enabled`,from:0})).filter(t=>t.tenantId===r&&t.materialCode===e),`${o===`tool`?`工器具`:`防护用品`}编码：${e}`));return async e=>{l();let[t,n,r,i]=await Promise.all([u(e.employeeNo),u(e.issuerEmployeeNo),d(e.warehouseCode),f(e.materialCode)]);return l(),{employee:t,issuer:n,warehouse:r,material:i}}}function u(e,t,n){let i=window.open(``,`_blank`,`width=980,height=760`);if(!i){o.warning(`浏览器阻止了打印窗口，请允许本站打开弹窗后重试`);return}i.opener=null;let a=e.items.map((e,t)=>`<tr><td>${t+1}</td><td>${r(e.materialName)}</td><td>${r(e.specificationModel||`—`)}</td><td>${r(String(e.issueQuantity))}</td><td>${r(n(e.unit))}</td><td>${r(e.remark||``)}</td></tr>`).join(``);i.document.write(`<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <title>${r(e.issuanceNo)}</title>
  <style>
    body { padding: 32px; color: #1f2937; font: 14px/1.5 sans-serif; }
    h1 { text-align: center; font-size: 22px; }
    .meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px 24px; margin: 24px 0; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 9px; border: 1px solid #9ca3af; text-align: left; }
    .sign { display: flex; justify-content: space-between; margin-top: 48px; }
    @media screen and (max-width: 640px) {
      body { padding: 12px; }
      .meta { grid-template-columns: 1fr; }
      table { table-layout: fixed; font-size: 11px; }
      th, td { padding: 4px; overflow-wrap: anywhere; }
      .sign { flex-wrap: wrap; gap: 12px 24px; }
    }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <h1>${t}发放单</h1>
  <div class="meta">
    <span>单据编号：${r(e.issuanceNo)}</span>
    <span>领用人：${r(e.employeeName)}</span>
    <span>员工工号：${r(e.employeeNo)}</span>
    <span>所属组织：${r(e.organizationName||`—`)}</span>
    <span>发放仓库：${r(e.warehouseName)}</span>
    <span>发放日期：${r(e.issueDate)}</span>
  </div>
  <table>
    <thead><tr><th>序号</th><th>${t}</th><th>规格型号</th><th>发放数量</th><th>单位</th><th>备注</th></tr></thead>
    <tbody>${a}</tbody>
  </table>
  <div class="sign">
    <span>领用人签字：____________</span>
    <span>发放人：${r(e.issuerName)}</span>
    <span>日期：____________</span>
  </div>
  <script>window.onload=()=>window.print()<\/script>
</body>
</html>`),i.document.close()}export{l as n,u as t};