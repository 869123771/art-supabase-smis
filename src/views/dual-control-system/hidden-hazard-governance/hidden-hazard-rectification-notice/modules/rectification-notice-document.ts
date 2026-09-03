import dayjs from 'dayjs'
import { escape } from 'lodash-es'
import type { SmisRectificationNoticeRecord } from '@smis/api'

export const buildHiddenHazardRectificationNoticeHtml = (
  row: SmisRectificationNoticeRecord
): string => {
  const inspectionDate = dayjs(row.inspectionTime).format('YYYY年MM月DD日')
  const deadline = row.rectificationDeadline
    ? dayjs(row.rectificationDeadline).format('YYYY年MM月DD日 HH:mm')
    : '待确定'
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8">
    <title>隐患整改通知书-${escape(row.noticeNo)}</title>
    <style>
      @page { size: A4 portrait; margin: 17mm 18mm; }
      * { box-sizing: border-box; }
      body { margin: 0; color: #111; font: 16px/1.85 "Microsoft YaHei", sans-serif; }
      h1 { margin: 14px 0 0; font-size: 29px; text-align: center; letter-spacing: 5px; }
      .number { margin: 2px 0 26px; font-size: 18px; text-align: center; }
      .meta { margin-bottom: 18px; text-align: right; }
      .recipient { font-size: 17px; text-decoration: underline; text-underline-offset: 6px; }
      .content { min-height: 260px; margin: 24px 0; }
      .content strong { display: block; margin-bottom: 10px; }
      .requirement { padding: 14px 18px; margin-top: 18px; border: 1px solid #111; }
      .deadline { margin-top: 18px; font-weight: 600; }
      .signature { display: grid; grid-template-columns: 1fr 1fr; gap: 46px; margin-top: 52px; }
      .date { margin-top: 34px; text-align: right; }
      @media print { body { print-color-adjust: exact; } }
    </style>
  </head>
  <body>
    <div class="meta">通知单号：${escape(row.noticeNo)}</div>
    <h1>隐患整改通知书</h1>
    <div class="number">〔${escape(row.rectificationPlanNo)}〕</div>
    <p class="recipient">${escape(row.inspectedOrganizationName)}：</p>
    <p>经检查，你单位存在以下安全隐患，请按照有关标准和制度要求落实整改，并在规定时限内反馈整改结果。</p>
    <div class="content">
      <strong>一、隐患（问题）详细情况</strong>
      <p>${escape(row.hazardDescription)}</p>
      <div class="requirement"><strong>二、整改要求</strong>${escape(row.rectificationRequirement || '请明确责任人和整改措施，完成后提交现场整改证据。')}</div>
      <div class="deadline">整改时限：${escape(deadline)}</div>
    </div>
    <div class="signature">
      <span>检查单位检查人员（签名）：____________</span>
      <span>被检查单位负责人（签名）：____________</span>
    </div>
    <div class="date">检查单位：${escape(row.inspectionOrganizationName)}<br>检查时间：${escape(inspectionDate)}</div>
    <script>window.onload = () => window.print()<${'/script'}>
  </body>
</html>`
}
