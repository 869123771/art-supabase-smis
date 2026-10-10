import dayjs from 'dayjs'
import { printHtmlDocument } from '@/utils/file/print-document'
import { escape } from 'lodash-es'
import type { SmisThreeViolationEducation } from '@smis/api'

export const formatGender = (value?: string | null): string =>
  ({ '1': '男', '2': '女', male: '男', female: '女', 男: '男', 女: '女' })[value || ''] || '—'

const formatOrganizationPosition = (row: SmisThreeViolationEducation): string =>
  [row.organizationName, row.positionName].filter(Boolean).join(' · ') || '—'

export const printThreeViolationLedger = (row: SmisThreeViolationEducation): void => {
  const responsibleNames = row.responsibleEmployees.map((item) => item.employeeName).join('、')
  const ledgerDate = dayjs(row.educationCompletedAt || row.inspectionTime)
  const trainingContent = row.educationContent || row.plannedEducationContent || '待记录'
  const trainingResult = row.educationResult || '待记录'
  const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>班组安全教育台账-${escape(row.employeeName ?? '—')}</title>
  <style>
    @page { size: A4 portrait; margin: 12mm; }
    * { box-sizing: border-box; }
    body { margin: 0; color: #111; font: 14px/1.55 "Microsoft YaHei", "PingFang SC", sans-serif; }
    h1 { margin: 0 0 10px; text-align: center; font-size: 25px; letter-spacing: 5px; }
    .ledger-date { min-height: 26px; padding-right: 28px; text-align: right; font-size: 16px; }
    table { width: 100%; border-collapse: collapse; table-layout: fixed; }
    th, td { padding: 7px 8px; border: 1px solid #111; vertical-align: middle; overflow-wrap: anywhere; }
    th { width: 13%; font-weight: 500; text-align: center; background: #f7f7f7; }
    td { width: 20%; }
    .section { height: 230px; vertical-align: top; white-space: pre-wrap; }
    .section strong { display: block; margin-bottom: 16px; font-size: 15px; }
    .section-result { height: 205px; }
    .signature { height: 58px; }
    .footer { display: flex; justify-content: space-between; margin-top: 18px; padding: 0 10px; }
    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <h1>班组安全教育台账</h1>
  <div class="ledger-date">${ledgerDate.format('YYYY 年 MM 月 DD 日')}</div>
  <table aria-label="班组安全教育台账">
    <tr>
      <th>受教育人姓名</th><td>${escape(row.employeeName ?? '—')}</td>
      <th>性别</th><td>${escape(formatGender(row.gender))}</td>
      <th>年龄</th><td>${escape(String(row.age ?? '—'))}</td>
    </tr>
    <tr>
      <th>教育类型</th><td colspan="2">三违人员教育</td>
      <th>组织岗位</th><td colspan="2">${escape(formatOrganizationPosition(row))}</td>
    </tr>
    <tr>
      <th>考核分数</th><td colspan="2">${escape(String(row.examScore ?? '—'))}</td>
      <th>培训课时</th><td colspan="2">${escape(String(row.trainingHours ?? '—'))}</td>
    </tr>
    <tr>
      <td class="section" colspan="6"><strong>教育培训内容：</strong>${escape(trainingContent)}</td>
    </tr>
    <tr>
      <td class="section section-result" colspan="6"><strong>教育培训结果：</strong>${escape(trainingResult)}</td>
    </tr>
    <tr>
      <th>教育负责人</th><td colspan="2">${escape(responsibleNames || '—')}</td>
      <th>教育完成时间</th><td colspan="2">${escape(row.educationCompletedAt ? dayjs(row.educationCompletedAt).format('YYYY-MM-DD HH:mm') : '待完成')}</td>
    </tr>
    <tr><th>领导检查意见</th><td class="signature" colspan="5"></td></tr>
  </table>
  <div class="footer"><span>受教育人签字：____________</span><span>教育负责人签字：____________</span></div>
</body>
</html>`

  printHtmlDocument(html, 'width=980,height=820')
}
