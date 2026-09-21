import { ElMessage } from 'element-plus'
import { escape } from 'lodash-es'
import type { SmisPpeIssuanceRecord } from '@smis/api'

export function printIssuanceRecord(
  row: SmisPpeIssuanceRecord,
  materialLabel: '工器具' | '防护用品',
  unitLabel: (unit: string) => string
): void {
  const popup = window.open('', '_blank', 'width=980,height=760')
  if (!popup) {
    ElMessage.warning('浏览器阻止了打印窗口，请允许本站打开弹窗后重试')
    return
  }

  popup.opener = null
  const itemRows = row.items
    .map(
      (item, index) =>
        `<tr><td>${index + 1}</td><td>${escape(item.materialName)}</td><td>${escape(item.specificationModel || '—')}</td><td>${escape(String(item.issueQuantity))}</td><td>${escape(unitLabel(item.unit))}</td><td>${escape(item.remark || '')}</td></tr>`
    )
    .join('')

  popup.document.write(`<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <title>${escape(row.issuanceNo)}</title>
  <style>
    body { padding: 32px; color: #1f2937; font: 14px/1.5 sans-serif; }
    h1 { text-align: center; font-size: 22px; }
    .meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px 24px; margin: 24px 0; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 9px; border: 1px solid #9ca3af; text-align: left; }
    .sign { display: flex; justify-content: space-between; margin-top: 48px; }
    .scroll-hint { display: none; }
    @media screen and (max-width: 640px) {
      body { padding: 16px; }
      .meta { grid-template-columns: 1fr; }
      table { display: block; overflow-x: auto; white-space: nowrap; }
      .sign { flex-wrap: wrap; gap: 12px 24px; }
      .scroll-hint { display: block; margin: 0 0 8px; color: #6b7280; font-size: 12px; }
    }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <h1>${materialLabel}发放单</h1>
  <div class="meta">
    <span>单据编号：${escape(row.issuanceNo)}</span>
    <span>领用人：${escape(row.employeeName)}</span>
    <span>员工工号：${escape(row.employeeNo)}</span>
    <span>所属组织：${escape(row.organizationName || '—')}</span>
    <span>发放仓库：${escape(row.warehouseName)}</span>
    <span>发放日期：${escape(row.issueDate)}</span>
  </div>
  <p class="scroll-hint">左右滑动表格查看完整明细</p>
  <table>
    <thead><tr><th>序号</th><th>${materialLabel}</th><th>规格型号</th><th>发放数量</th><th>单位</th><th>备注</th></tr></thead>
    <tbody>${itemRows}</tbody>
  </table>
  <div class="sign">
    <span>领用人签字：____________</span>
    <span>发放人：${escape(row.issuerName)}</span>
    <span>日期：____________</span>
  </div>
  <script>window.onload=()=>window.print()<${'/script'}>
</body>
</html>`)
  popup.document.close()
}
