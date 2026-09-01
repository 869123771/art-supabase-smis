import dayjs from 'dayjs'
import { escape } from 'lodash-es'
import type { SmisSafetyInspectionRecord } from '@smis/api'

const printStyles = `
  @page { size: A4 portrait; margin: 16mm; }
  * { box-sizing: border-box; }
  body { margin: 0; color: #111; font: 14px/1.7 "Microsoft YaHei", sans-serif; }
  h1 { margin: 0 0 4px; font-size: 26px; text-align: center; letter-spacing: 6px; }
  .document-no { margin-bottom: 18px; text-align: right; }
  table { width: 100%; table-layout: fixed; border-collapse: collapse; }
  th, td { padding: 9px 10px; vertical-align: top; word-break: break-word; border: 1px solid #111; }
  th { width: 126px; text-align: center; background: #f6f6f6; }
  .content { height: 260px; }
  .signature { height: 86px; }
  .footer { display: flex; justify-content: space-between; margin-top: 30px; }
`

export const buildRectificationNoticeHtml = (row: SmisSafetyInspectionRecord): string => {
  const inspectionDate = dayjs(row.inspectionTime).format('YYYY年MM月DD日 HH:mm')
  const inspectorNames = escape(row.inspectorNames || '—')

  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8">
    <title>安全检查整改指令书-${escape(row.inspectionName)}</title>
    <style>${printStyles}</style>
  </head>
  <body>
    <h1>安全检查整改指令书</h1>
    <div class="document-no">编号：__________</div>
    <table>
      <tr><th>被检查单位</th><td colspan="3">${escape(row.inspectedOrganizationName)}</td></tr>
      <tr><th>检查名称</th><td>${escape(row.inspectionName)}</td><th>检查类别</th><td>${escape(row.inspectionTypeName)}</td></tr>
      <tr><th>检查单位</th><td>${escape(row.inspectionOrganizationName)}</td><th>检查时间</th><td>${escape(inspectionDate)}</td></tr>
      <tr><th>检查人员</th><td colspan="3">${inspectorNames}</td></tr>
      <tr><td class="content" colspan="4"><strong>经检查，现责令对下列问题限期整改：</strong><br><br>1．<br><br>2．<br><br>3．</td></tr>
      <tr><th>整改要求</th><td colspan="3" class="signature">请落实责任人、整改措施和完成期限，并按要求反馈整改证据。</td></tr>
      <tr><th>检查单位签章</th><td class="signature"></td><th>被检查单位签章</th><td class="signature"></td></tr>
    </table>
    <div class="footer"><span>检查人：${inspectorNames}</span><span>${escape(inspectionDate)}</span></div>
    <script>window.onload = () => window.print()<${'/script'}>
  </body>
</html>`
}
