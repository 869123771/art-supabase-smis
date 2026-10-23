import { normalizeNullableNumber, normalizeNullableText } from '@/utils/form/normalize'
import { isPlainObjectRecord } from '@/utils/type-guards'
import type { SmisAntiViolationStandardSavePayload, SmisViolationCategory } from '@smis/api'

/** Validate a complete spreadsheet before any row is persisted and index categories once. */
export function prepareAntiViolationStandardImport(
  rows: readonly unknown[],
  categories: readonly SmisViolationCategory[]
): SmisAntiViolationStandardSavePayload[] {
  const categoryByCode = new Map<string, SmisViolationCategory>()
  for (const category of categories) {
    const code = category.categoryCode.trim().toUpperCase()
    if (category.id && category.status === 'enabled' && !categoryByCode.has(code)) {
      categoryByCode.set(code, category)
    }
  }

  return rows.map((raw, index) => {
    if (!isPlainObjectRecord(raw)) throw invalidRow(index)
    const categoryCode = String(raw.categoryCode ?? '')
      .trim()
      .toUpperCase()
    const category = categoryByCode.get(categoryCode)
    const standardCode = String(raw.standardCode ?? '').trim()
    const standardName = String(raw.standardName ?? '').trim()
    const deductionPoints = normalizeNullableNumber(raw.deductionPoints)
    if (
      !category?.id ||
      !standardCode ||
      !standardName ||
      deductionPoints === null ||
      deductionPoints < 0 ||
      deductionPoints > 99_999_999.99
    ) {
      throw invalidRow(index)
    }
    return {
      operation: 'import',
      categoryId: category.id,
      standardCode,
      standardName,
      deductionPoints,
      handlingRequirements: normalizeNullableText(String(raw.handlingRequirements ?? '')),
      legalBasis: normalizeNullableText(String(raw.legalBasis ?? '')),
      status: raw.status === 'disabled' ? 'disabled' : 'enabled',
      description: normalizeNullableText(String(raw.description ?? ''))
    }
  })
}

function invalidRow(index: number): Error {
  return new Error(
    `第 ${index + 1} 行缺少违章编号、名称、有效分类编码或 0 至 99999999.99 的扣减分值`
  )
}
