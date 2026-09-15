import { normalizeSupabaseFunctionError } from '@/utils/supabase'
import { useSupabase } from '@/hooks'
import type { SmisCertificateCategory, SmisEquipmentInspectionConclusion } from '@smis/api/types'

export interface SmisAiOcrResponseBase {
  rawText: string
  summary: string
  confidence: number
  fieldConfidence: Record<string, number>
  missingFields: string[]
  warnings: string[]
  artifactId: string
  runId: string
  reviewConfidenceThreshold: number
  generatedAt: string
}

export interface SmisCertificateOcrDraft {
  holderName?: string | null
  certificateNumber?: string | null
  issuingAuthority?: string | null
  archiveNumber?: string | null
  approvalDate?: string | null
  effectiveDate?: string | null
  workItemCodes: string[]
}

export interface SmisCertificateOcrResponse extends SmisAiOcrResponseBase {
  certificate: SmisCertificateOcrDraft
}

export interface SmisInspectionReportOcrDraft {
  reportNumber?: string | null
  equipmentCode?: string | null
  equipmentName?: string | null
  institutionName?: string | null
  inspectionDate?: string | null
  conclusion?: SmisEquipmentInspectionConclusion | null
  nextDueDate?: string | null
  remark?: string | null
}

export interface SmisInspectionReportOcrResponse extends SmisAiOcrResponseBase {
  report: SmisInspectionReportOcrDraft
}

const { supabase } = useSupabase()

export async function analyzePersonnelCertificateByAi(params: {
  imageUrl: string
  category: SmisCertificateCategory
}) {
  const { data, error } = await supabase.functions.invoke<SmisCertificateOcrResponse>(
    'ai-smis-certificate-ocr',
    { body: { action: 'analyze', imageUrls: [params.imageUrl], category: params.category } }
  )
  return { data: data ?? null, error: await normalizeSupabaseFunctionError(error) }
}

export async function reviewPersonnelCertificateOcr(params: {
  artifactId: string
  entityId: string
  category: SmisCertificateCategory
  finalPayload: Record<string, unknown>
}) {
  const { data, error } = await supabase.functions.invoke('ai-smis-certificate-ocr', {
    body: { action: 'review', outcome: 'applied', ...params }
  })
  return { data: data ?? null, error: await normalizeSupabaseFunctionError(error) }
}

export async function analyzeEquipmentInspectionReportByAi(imageUrls: string[]) {
  const { data, error } = await supabase.functions.invoke<SmisInspectionReportOcrResponse>(
    'ai-smis-inspection-report-ocr',
    { body: { action: 'analyze', imageUrls: imageUrls.slice(0, 3) } }
  )
  return { data: data ?? null, error: await normalizeSupabaseFunctionError(error) }
}

export async function reviewEquipmentInspectionReportOcr(params: {
  artifactId: string
  entityId: string
  finalPayload: Record<string, unknown>
}) {
  const { data, error } = await supabase.functions.invoke('ai-smis-inspection-report-ocr', {
    body: { action: 'review', outcome: 'applied', ...params }
  })
  return { data: data ?? null, error: await normalizeSupabaseFunctionError(error) }
}
