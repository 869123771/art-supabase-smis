import"./rolldown-runtime-C0FnF6B9.js";import{C as e}from"./_baseIteratee-CPI_0FGK.js";import{No as t,Nr as n,zn as r}from"./api-BKwcw-fC.js";import{Ht as i,lt as a}from"./sys-C0fqjCK4.js";import{t as o}from"./escape-D22-JS8O.js";/* empty css                            */import{n as s}from"./art-employee-select-BdllAXd5.js";function c(e,t){let[n]=e;if(!n?.id)throw Error(`未找到${t}`);if(e.length!==1)throw Error(`${t}存在多个匹配记录，请核对编号后重新导入`);return n}function l(i,o){let l=a(),u=e(async e=>c((await t(s,{tenantId:i,keyword:e,from:0})).filter(t=>t.tenantId===i&&t.employeeNo===e),`员工工号：${e}`)),d=e(async e=>c((await t(r,{keyword:e,status:`enabled`,from:0})).filter(t=>t.tenantId===i&&t.locationCode===e),`启用仓库编码：${e}`)),f=e(async e=>c((await t(n,{materialCode:e,materialType:o,status:`enabled`,from:0})).filter(t=>t.tenantId===i&&t.materialCode===e),`${o===`tool`?`工器具`:`防护用品`}编码：${e}`));return async e=>{l();let[t,n,r,i]=await Promise.all([u(e.employeeNo),u(e.issuerEmployeeNo),d(e.warehouseCode),f(e.materialCode)]);return l(),{employee:t,issuer:n,warehouse:r,material:i}}}function u(e,t,n){let r=window.open(``,`_blank`,`width=980,height=760`);if(!r){i.warning(`浏览器阻止了打印窗口，请允许本站打开弹窗后重试`);return}r.opener=null;let a=e.items.map((e,t)=>`<tr><td>${t+1}</td><td>${o(e.materialName)}</td><td>${o(e.specificationModel||`—`)}</td><td>${o(String(e.issueQuantity))}</td><td>${o(n(e.unit))}</td><td>${o(e.remark||``)}</td></tr>`).join(``);r.document.write(`<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <title>${o(e.issuanceNo)}</title>
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
    <span>单据编号：${o(e.issuanceNo)}</span>
    <span>领用人：${o(e.employeeName)}</span>
    <span>员工工号：${o(e.employeeNo)}</span>
    <span>所属组织：${o(e.organizationName||`—`)}</span>
    <span>发放仓库：${o(e.warehouseName)}</span>
    <span>发放日期：${o(e.issueDate)}</span>
  </div>
  <table>
    <thead><tr><th>序号</th><th>${t}</th><th>规格型号</th><th>发放数量</th><th>单位</th><th>备注</th></tr></thead>
    <tbody>${a}</tbody>
  </table>
  <div class="sign">
    <span>领用人签字：____________</span>
    <span>发放人：${o(e.issuerName)}</span>
    <span>日期：____________</span>
  </div>
  <script>window.onload=()=>window.print()<\/script>
</body>
</html>`),r.document.close()}export{l as n,u as t};