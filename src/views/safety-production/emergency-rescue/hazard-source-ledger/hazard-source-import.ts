import { normalizeNullableNumber, normalizeNullableText } from '@/utils/form/normalize'
import { isPlainObjectRecord } from '@/utils/type-guards'
import type {
  SmisHazardSourceLevel,
  SmisHazardSourceRiskLevel,
  SmisHazardSourceSavePayload
} from '@smis/api'

interface NamedReference {
  id: string
  name: string
}

export interface PreparedHazardSourceImport {
  fileRow: number
  responsibleEmployeeNo: string
  payload: Omit<SmisHazardSourceSavePayload, 'responsibleEmployeeId'>
}

/** Build reference indexes once and validate the complete file before reads or writes begin. */
export function prepareHazardSourceImport(
  rows: readonly unknown[],
  sites: readonly NamedReference[],
  organizations: readonly NamedReference[],
  resolveDictValue: (code: string, input: unknown) => string
): PreparedHazardSourceImport[] {
  const siteByName = firstReferenceByName(sites)
  const organizationByName = firstReferenceByName(organizations)
  return rows.map((raw, index) => {
    if (!isPlainObjectRecord(raw)) throw new Error(`第 ${index + 2} 行格式无效`)
    const fileRow = index + 2
    const hazardName = String(raw.hazardName ?? '').trim()
    const siteName = String(raw.siteName ?? '').trim()
    const organizationName = String(raw.controlOrganizationName ?? '').trim()
    const site = siteByName.get(siteName)
    const organization = organizationByName.get(organizationName)
    if (!hazardName) throw new Error(`第 ${fileRow} 行缺少危险源名称`)
    if (!site) throw new Error(`第 ${fileRow} 行未找到场所：${siteName}`)
    if (!organization) throw new Error(`第 ${fileRow} 行未找到管控部门：${organizationName}`)
    const hazardLevel = resolveDictValue(
      'smisHazardSourceLevel',
      raw.hazardLevel
    ) as SmisHazardSourceLevel
    const riskLevel = resolveDictValue(
      'smisHazardSourceRiskLevel',
      raw.riskLevel
    ) as SmisHazardSourceRiskLevel
    if (!hazardLevel || !riskLevel) throw new Error(`第 ${fileRow} 行危险等级或风险等级无法识别`)
    const quantity = normalizeNullableNumber(raw.quantity)
    const hasQuantity =
      raw.quantity != null && (typeof raw.quantity !== 'string' || Boolean(raw.quantity.trim()))
    if (hasQuantity && (quantity === null || quantity <= 0))
      throw new Error(`第 ${fileRow} 行数量必须为大于0的数字`)
    return {
      fileRow,
      responsibleEmployeeNo: String(raw.responsibleEmployeeNo ?? '').trim(),
      payload: {
        hazardName,
        siteId: site.id,
        hazardLevel,
        riskLevel,
        controlOrganizationId: organization.id,
        quantity,
        location: normalizeNullableText(String(raw.location ?? '')),
        evaluationDate: normalizeNullableText(String(raw.evaluationDate ?? '')),
        evaluationOrganization: normalizeNullableText(String(raw.evaluationOrganization ?? '')),
        filingDate: normalizeNullableText(String(raw.filingDate ?? '')),
        filingOrganization: normalizeNullableText(String(raw.filingOrganization ?? '')),
        filingNo: normalizeNullableText(String(raw.filingNo ?? '')),
        imageUrls: [],
        remark: String(raw.remark ?? '')
      }
    }
  })
}

function firstReferenceByName(references: readonly NamedReference[]): Map<string, NamedReference> {
  const result = new Map<string, NamedReference>()
  for (const reference of references)
    if (!result.has(reference.name)) result.set(reference.name, reference)
  return result
}
