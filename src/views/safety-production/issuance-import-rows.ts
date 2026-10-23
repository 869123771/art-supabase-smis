import { normalizeNullableNumber } from '@/utils/form/normalize'
import { isPlainObjectRecord } from '@/utils/type-guards'
import dayjs from 'dayjs'

export interface IssuanceImportCodes {
  employeeNo: string
  issuerEmployeeNo: string
  warehouseCode: string
  materialCode: string
}

export interface IssuanceImportRow extends IssuanceImportCodes {
  fileRow: number
  issueQuantity: number
  issueDate: string
  remark: string
}

/** Validate every basic field before reference reads or business writes begin. */
export function readIssuanceImportRows(
  rows: readonly unknown[],
  fallbackDate = dayjs().format('YYYY-MM-DD')
): IssuanceImportRow[] {
  return rows.map((raw, index) => {
    if (!isPlainObjectRecord(raw)) throw invalidIssuanceRow(index)
    const employeeNo = String(raw.employeeNo ?? '').trim()
    const warehouseCode = String(raw.warehouseCode ?? '').trim()
    const issuerEmployeeNo = String(raw.issuerEmployeeNo ?? '').trim()
    const materialCode = String(raw.materialCode ?? '').trim()
    const issueQuantity = normalizeNullableNumber(raw.issueQuantity)
    if (
      !employeeNo ||
      !warehouseCode ||
      !issuerEmployeeNo ||
      !materialCode ||
      issueQuantity === null ||
      issueQuantity <= 0
    ) {
      throw invalidIssuanceRow(index)
    }
    const rawIssueDate = String(raw.issueDate ?? '')
    return {
      employeeNo,
      warehouseCode,
      issuerEmployeeNo,
      materialCode,
      fileRow: index + 1,
      issueQuantity,
      issueDate: dayjs(rawIssueDate).isValid()
        ? dayjs(rawIssueDate).format('YYYY-MM-DD')
        : fallbackDate,
      remark: String(raw.remark ?? '')
    }
  })
}

/** Resolve a complete batch before the caller starts its ordered persistence loop. */
export async function resolveIssuanceImportRows<TReferences extends object>(
  rows: readonly IssuanceImportRow[],
  resolveReferences: (codes: IssuanceImportCodes) => Promise<TReferences>
): Promise<Array<IssuanceImportRow & TReferences>> {
  const resolved: Array<IssuanceImportRow & TReferences> = []
  for (const row of rows) resolved.push({ ...row, ...(await resolveReferences(row)) })
  return resolved
}

function invalidIssuanceRow(index: number): Error {
  return new Error(`第 ${index + 1} 行缺少必填字段或发放数量不是正数`)
}
