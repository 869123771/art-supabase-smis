import { normalizeSupabaseFunctionError } from '@/utils/supabase'
import { useSupabase } from '@/hooks'

export type SmisSpecialOperationPrecheckReadiness = 'ready' | 'needs_attention' | 'blocked'

export interface SmisSpecialOperationPrecheckIssue {
  code: string
  severity: 'blocking' | 'warning'
  title: string
  description: string
  field?: string
}

export interface SmisSpecialOperationPrecheckDraft {
  operationTypeCode: string
  operationTypeName: string
  workContent: string | null
  workStartTime: string | null
  workEndTime: string | null
  workLocation: string | null
  workUnit: string | null
  workSection: string | null
  hotWorkLevel: string | null
  hotWorkMethodCount: number
  hazardFactorCount: number
  responsibleEmployeeSelected: boolean
  guardianCount: number
  verifierCount: number
  briefingGiverCount: number
  briefingReceiverCount: number
  workerCount: number
  analystCount: number
  siteAnalysisTotal: number
  siteAnalysisCompleted: number
  safetyMeasureTotal: number
  safetyMeasureConfirmed: number
  sitePhotoCount: number
  relatedOperationCount: number
  requiredCustomFields: Array<{ label: string; present: boolean }>
  blindPlateItemCount: number
}

export interface SmisSpecialOperationPrecheckAssessment {
  score: number
  readiness: SmisSpecialOperationPrecheckReadiness
  summary: string
  blockers: SmisSpecialOperationPrecheckIssue[]
  warnings: SmisSpecialOperationPrecheckIssue[]
  passedChecks: string[]
  recommendations: string[]
  metrics: {
    completedAnalysis: string
    confirmedMeasures: string
    workerCount: number
    photoCount: number
  }
}

export interface SmisSpecialOperationPrecheckResponse {
  runId: string
  ruleVersion: string
  generatedAt: string
  assessment: SmisSpecialOperationPrecheckAssessment
}

const { supabase } = useSupabase()

export async function precheckSpecialOperationPermitByAi(params: {
  permissionCode: string
  draft: SmisSpecialOperationPrecheckDraft
}) {
  const { data, error } = await supabase.functions.invoke<SmisSpecialOperationPrecheckResponse>(
    'ai-smis-special-operation-precheck',
    { body: params }
  )
  return { data: data ?? null, error: await normalizeSupabaseFunctionError(error) }
}
