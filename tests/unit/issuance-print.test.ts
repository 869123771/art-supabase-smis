import assert from 'node:assert/strict'
import test from 'node:test'
import type { SmisPpeIssuanceRecord } from '../../src/api/types/issuance-and-documents'
import { printIssuanceRecord } from '../../src/views/safety-production/issuance-print'

const row: SmisPpeIssuanceRecord = {
  id: 'record-1',
  tenantId: 'tenant-1',
  issuanceNo: 'ISS-001',
  employeeId: 'employee-1',
  employeeNo: 'E001',
  employeeName: '<领用人>',
  warehouseId: 'warehouse-1',
  warehouseName: '一号仓库',
  issuerEmployeeId: 'issuer-1',
  issuerName: '发放人',
  issueDate: '2026-09-20',
  status: 'posted',
  items: [
    {
      materialId: 'material-1',
      materialName: '<手套>',
      unit: 'piece',
      issueQuantity: 2,
      remark: '<备注>'
    }
  ]
}

test('issuance print shares the template and escapes business data', () => {
  const previousWindow = globalThis.window
  let html = ''
  let closed = false
  const popup = {
    opener: {} as unknown,
    document: {
      write: (content: string) => {
        html = content
      },
      close: () => {
        closed = true
      }
    }
  }
  globalThis.window = {
    open: () => popup
  } as unknown as Window & typeof globalThis

  try {
    printIssuanceRecord(row, '防护用品', (unit) => `${unit}<件>`)
    assert.equal(popup.opener, null)
    assert.equal(closed, true)
    assert.match(html, /防护用品发放单/)
    assert.match(html, /左右滑动表格查看完整明细/)
    assert.match(html, /&lt;领用人&gt;/)
    assert.match(html, /&lt;手套&gt;/)
    assert.match(html, /piece&lt;件&gt;/)
    assert.match(html, /&lt;备注&gt;/)
    assert.doesNotMatch(html, /<手套>/)
  } finally {
    globalThis.window = previousWindow
  }
})
