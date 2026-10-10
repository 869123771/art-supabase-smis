import{C as e}from"./_baseIteratee-CPI_0FGK.js";import{No as t,Nr as n,zn as r}from"./api-CKrHoM-L.js";import{lt as i}from"./sys-D2hfp_0j.js";import{n as a,t as o}from"./print-document-hEg858ta.js";import{n as s}from"./art-employee-select-CHQGe4-1.js";function c(e,t){let[n]=e;if(!n?.id)throw Error(`未找到${t}`);if(e.length!==1)throw Error(`${t}存在多个匹配记录，请核对编号后重新导入`);return n}function l(a,o){let l=i(),u=e(async e=>c((await t(s,{tenantId:a,keyword:e,from:0})).filter(t=>t.tenantId===a&&t.employeeNo===e),`员工工号：${e}`)),d=e(async e=>c((await t(r,{keyword:e,status:`enabled`,from:0})).filter(t=>t.tenantId===a&&t.locationCode===e),`启用仓库编码：${e}`)),f=e(async e=>c((await t(n,{materialCode:e,materialType:o,status:`enabled`,from:0})).filter(t=>t.tenantId===a&&t.materialCode===e),`${o===`tool`?`工器具`:`防护用品`}编码：${e}`));return async e=>{l();let[t,n,r,i]=await Promise.all([u(e.employeeNo),u(e.issuerEmployeeNo),d(e.warehouseCode),f(e.materialCode)]);return l(),{employee:t,issuer:n,warehouse:r,material:i}}}function u(e,t,n){let r=e.items.map((e,t)=>`<tr><td>${t+1}</td><td>${a(e.materialName)}</td><td>${a(e.specificationModel||`—`)}</td><td>${a(String(e.issueQuantity))}</td><td>${a(n(e.unit))}</td><td>${a(e.remark||``)}</td></tr>`).join(``);return`<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <title>${a(e.issuanceNo)}</title>
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
    <span>单据编号：${a(e.issuanceNo)}</span>
    <span>领用人：${a(e.employeeName)}</span>
    <span>员工工号：${a(e.employeeNo)}</span>
    <span>所属组织：${a(e.organizationName||`—`)}</span>
    <span>发放仓库：${a(e.warehouseName)}</span>
    <span>发放日期：${a(e.issueDate)}</span>
  </div>
  <table>
    <thead><tr><th>序号</th><th>${t}</th><th>规格型号</th><th>发放数量</th><th>单位</th><th>备注</th></tr></thead>
    <tbody>${r}</tbody>
  </table>
  <div class="sign">
    <span>领用人签字：____________</span>
    <span>发放人：${a(e.issuerName)}</span>
    <span>日期：____________</span>
  </div>
</body>
</html>`}function d(e,t,n){o(u(e,t,n),`width=980,height=760`)}export{l as n,d as t};