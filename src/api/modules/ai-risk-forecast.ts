import { normalizeSupabaseFunctionError } from '@/utils/supabase'
import { useSupabase } from '@/hooks'

export type SmisAiRiskLevel = 'low' | 'medium' | 'high' | 'critical'
export type SmisAiForecastConfidence = 'low' | 'medium' | 'high'

export interface SmisAiRiskForecastDriver {
  code: string
  label: string
  value: string
  description: string
  tone: 'danger' | 'warning' | 'primary' | 'success'
}

export interface SmisAiRiskForecastAssessment {
  score: number
  riskLevel: SmisAiRiskLevel
  confidence: SmisAiForecastConfidence
  confidenceScore: number
  lookbackDays: number
  currentPeriodCount: number
  previousPeriodCount: number
  openCount: number
  overdueCount: number
  forecast30DayCount: number
  trendPercent: number | null
  drivers: SmisAiRiskForecastDriver[]
  recommendations: string[]
  methodology: string
}

export interface SmisAiRiskForecastResponse {
  runId: string
  model: string
  generatedAt: string
  dataThrough: string
  assessment: SmisAiRiskForecastAssessment
}

const { supabase } = useSupabase()

export async function forecastSmisHazardRisk(lookbackDays = 30) {
  const { data, error } = await supabase.functions.invoke<SmisAiRiskForecastResponse>(
    'ai-smis-risk-forecast',
    { body: { lookbackDays } }
  )
  return { data: data ?? null, error: await normalizeSupabaseFunctionError(error) }
}
