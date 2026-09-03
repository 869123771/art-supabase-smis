import { useSupabase } from '@/hooks'
import type {
  SmisDualControlReportOverview,
  SmisDualControlReportRecord,
  SmisDualControlReportSearchParams,
  SmisHazardGovernanceReportResult,
  SmisHazardGovernanceReportSearchParams,
  SmisHiddenHazardInspectionReportOverview,
  SmisHiddenHazardInspectionReportRecord,
  SmisHiddenHazardInspectionReportSearchParams,
  SmisHiddenHazardInspectionRecordResult,
  SmisHiddenHazardInspectionRecordSearchParams,
  SmisHiddenHazardLedgerOverview,
  SmisHiddenHazardLedgerRecord,
  SmisHiddenHazardLedgerSearchParams,
  SmisInspectionStatisticsDetailParams,
  SmisInspectionStatisticsDetailResult,
  SmisInspectionStatisticsResult,
  SmisInspectionStatisticsSearchParams,
  SmisNoHazardPersonnelStatisticsResult,
  SmisNoHazardPersonnelStatisticsSearchParams,
  SmisRiskControlInformationOverview,
  SmisRiskControlInformationRecord,
  SmisRiskControlInformationSearchParams,
  SmisSpecialEquipmentRiskControlStatisticsResult,
  SmisSpecialEquipmentRiskControlStatisticsSearchParams,
  SmisTeamSelfInspectionCoverageResult,
  SmisTeamSelfInspectionCoverageSearchParams
} from '@smis/api/types'

interface ListResult<TRecord, TOverview> {
  records?: TRecord[]
  total?: number
  overview?: TOverview
}

const { supabase, responseHandle } = useSupabase()

const emptyHazardGovernanceReport = (): SmisHazardGovernanceReportResult => ({
  overview: { total: 0, closed: 0, open: 0, overdue: 0, major: 0, closureRate: 0 },
  organizationStats: [],
  categoryStats: [],
  sourceStats: [],
  cycleStats: {
    withinDay: 0,
    withinThreeDays: 0,
    withinWeek: 0,
    withinMonth: 0,
    overMonth: 0
  },
  hazardDetails: [],
  majorHazards: [],
  yearOutstanding: [],
  organizationOptions: []
})

const emptyInspectionStatistics = (): SmisInspectionStatisticsResult => ({
  overview: {
    organizationCount: 0,
    generatedCount: 0,
    completedCount: 0,
    pendingCount: 0,
    missedCount: 0,
    repeatedMissedCount: 0,
    inspectionRate: 0,
    missedRate: 0
  },
  organizationStats: [],
  organizationOptions: [],
  riskLevelOptions: []
})

const emptyHiddenHazardInspectionRecord = (): SmisHiddenHazardInspectionRecordResult => ({
  overview: {
    inspectorCount: 0,
    taskCount: 0,
    completedCount: 0,
    overdueCount: 0,
    abnormalTaskCount: 0,
    completionRate: 0
  },
  personnelStats: [],
  details: [],
  organizationOptions: []
})

const emptyNoHazardPersonnelStatistics = (): SmisNoHazardPersonnelStatisticsResult => ({
  overview: {
    personnelCount: 0,
    matchedCount: 0,
    zeroReportCount: 0,
    onLeaveCount: 0,
    averageHazardCount: 0
  },
  records: [],
  organizationOptions: []
})

const emptyTeamSelfInspectionCoverage = (): SmisTeamSelfInspectionCoverageResult => ({
  overview: {
    organizationCount: 0,
    teamCount: 0,
    memberCount: 0,
    coveredMemberCount: 0,
    coverageRate: 0,
    completedTaskCount: 0
  },
  records: [],
  organizationOptions: []
})

const emptySpecialEquipmentRiskControl = (): SmisSpecialEquipmentRiskControlStatisticsResult => ({
  overview: {
    equipmentCount: 0,
    riskPointCount: 0,
    highRiskPointCount: 0,
    riskItemCount: 0,
    measureCount: 0,
    taskCount: 0,
    completedTaskCount: 0,
    inspectionRate: 0
  },
  riskLevelStats: [],
  categoryStats: [],
  cycleStats: [],
  organizationStats: [],
  riskDetails: [],
  organizationOptions: []
})

const normalizeList = <TRecord, TOverview>(
  data: ListResult<TRecord, TOverview> | null,
  emptyOverview: TOverview
) => ({
  data: data?.records ?? [],
  total: data?.total ?? 0,
  overview: data?.overview ?? emptyOverview
})

export async function fetchRiskControlInformationList(
  params: SmisRiskControlInformationSearchParams = {}
) {
  const from = Math.max(params.from ?? 0, 0)
  const result = await responseHandle<
    ListResult<SmisRiskControlInformationRecord, SmisRiskControlInformationOverview>
  >(
    () =>
      supabase.rpc('smis_list_risk_control_information_secure', {
        p_from: from,
        p_to: Math.max(params.to ?? from + 19, from),
        p_keyword: params.keyword?.trim() || null,
        p_organization_id: params.organizationId || null,
        p_site_id: params.siteId || null,
        p_risk_level: params.riskLevel || null,
        p_is_special_equipment:
          params.isSpecialEquipment === '' ? null : (params.isSpecialEquipment ?? null)
      }),
    { showErrorMessage: true }
  )
  return {
    ...normalizeList(result.data, {
      total: 0,
      evaluated: 0,
      major: 0,
      controlled: 0,
      generatedHazards: 0
    }),
    error: result.error
  }
}

export async function fetchHiddenHazardLedgerList(params: SmisHiddenHazardLedgerSearchParams = {}) {
  const from = Math.max(params.from ?? 0, 0)
  const result = await responseHandle<
    ListResult<SmisHiddenHazardLedgerRecord, SmisHiddenHazardLedgerOverview>
  >(
    () =>
      supabase.rpc('smis_list_hidden_hazard_ledger_secure', {
        p_from: from,
        p_to: Math.max(params.to ?? from + 19, from),
        p_keyword: params.keyword?.trim() || null,
        p_organization_id: params.organizationId || null,
        p_reported_from: params.reportedFrom || null,
        p_reported_to: params.reportedTo || null,
        p_status: params.status || null,
        p_hazard_level: params.hazardLevel || null,
        p_source_type: params.sourceType || null
      }),
    { showErrorMessage: true }
  )
  return {
    ...normalizeList(result.data, { total: 0, open: 0, overdue: 0, completed: 0, major: 0 }),
    error: result.error
  }
}

export async function fetchDualControlManagementReport(
  params: SmisDualControlReportSearchParams = {}
) {
  const from = Math.max(params.from ?? 0, 0)
  const result = await responseHandle<
    ListResult<SmisDualControlReportRecord, SmisDualControlReportOverview>
  >(
    () =>
      supabase.rpc('smis_get_dual_control_management_report_secure', {
        p_from: from,
        p_to: Math.max(params.to ?? from + 19, from),
        p_month: params.month ? `${params.month}-01` : null,
        p_organization_id: params.organizationId || null,
        p_keyword: params.keyword?.trim() || null
      }),
    { showErrorMessage: true }
  )
  return {
    ...normalizeList(result.data, {
      organizations: 0,
      riskItems: 0,
      measures: 0,
      inspectionRate: 0,
      openHazards: 0
    }),
    error: result.error
  }
}

export async function fetchHiddenHazardInspectionReport(
  params: SmisHiddenHazardInspectionReportSearchParams = {}
) {
  const from = Math.max(params.from ?? 0, 0)
  const result = await responseHandle<
    ListResult<SmisHiddenHazardInspectionReportRecord, SmisHiddenHazardInspectionReportOverview>
  >(
    () =>
      supabase.rpc('smis_get_hidden_hazard_inspection_report_secure', {
        p_from: from,
        p_to: Math.max(params.to ?? from + 19, from),
        p_planned_from: params.plannedFrom || null,
        p_planned_to: params.plannedTo || null,
        p_organization_id: params.organizationId || null,
        p_keyword: params.keyword?.trim() || null
      }),
    { showErrorMessage: true }
  )
  return {
    ...normalizeList(result.data, {
      organizations: 0,
      generatedTasks: 0,
      completedTasks: 0,
      inspectionRate: 0,
      missedInspectors: 0,
      generatedHazards: 0
    }),
    error: result.error
  }
}

export async function fetchHazardGovernanceReport(
  params: SmisHazardGovernanceReportSearchParams = {}
) {
  const result = await responseHandle<SmisHazardGovernanceReportResult>(
    () =>
      supabase.rpc('smis_get_hidden_hazard_governance_report_secure', {
        p_reported_from: params.reportedFrom || null,
        p_reported_to: params.reportedTo || null,
        p_organization_id: params.organizationId || null
      }),
    { showErrorMessage: true }
  )
  return { ...(result.data ?? emptyHazardGovernanceReport()), error: result.error }
}

export async function fetchRiskInspectionStatistics(params: SmisInspectionStatisticsSearchParams) {
  const result = await responseHandle<SmisInspectionStatisticsResult>(
    () =>
      supabase.rpc('smis_get_risk_inspection_statistics_secure', {
        p_report_type: params.reportType,
        p_planned_from: params.plannedFrom || null,
        p_planned_to: params.plannedTo || null,
        p_organization_id: params.organizationId || null,
        p_risk_level: params.riskLevel || null
      }),
    { showErrorMessage: true }
  )
  return { ...(result.data ?? emptyInspectionStatistics()), error: result.error }
}

export async function fetchRiskInspectionStatisticsDetail(
  params: SmisInspectionStatisticsDetailParams
) {
  const result = await responseHandle<SmisInspectionStatisticsDetailResult>(
    () =>
      supabase.rpc('smis_get_risk_inspection_statistics_detail_secure', {
        p_report_type: params.reportType,
        p_organization_id: params.organizationId,
        p_planned_from: params.plannedFrom || null,
        p_planned_to: params.plannedTo || null,
        p_risk_level: params.riskLevel || null
      }),
    { showErrorMessage: true }
  )
  return {
    records: result.data?.records ?? [],
    personnelIssues: result.data?.personnelIssues ?? [],
    error: result.error
  }
}

export async function fetchHiddenHazardInspectionRecord(
  params: SmisHiddenHazardInspectionRecordSearchParams = {}
) {
  const result = await responseHandle<SmisHiddenHazardInspectionRecordResult>(
    () =>
      supabase.rpc('smis_get_hidden_hazard_inspection_record_secure', {
        p_planned_from: params.plannedFrom || null,
        p_planned_to: params.plannedTo || null,
        p_organization_id: params.organizationId || null,
        p_executor_keyword: params.executorKeyword?.trim() || null,
        p_is_special_equipment:
          params.isSpecialEquipment === '' ? null : (params.isSpecialEquipment ?? null)
      }),
    { showErrorMessage: true }
  )
  return { ...(result.data ?? emptyHiddenHazardInspectionRecord()), error: result.error }
}

export async function fetchNoHiddenHazardPersonnelStatistics(
  params: SmisNoHazardPersonnelStatisticsSearchParams = {}
) {
  const result = await responseHandle<SmisNoHazardPersonnelStatisticsResult>(
    () =>
      supabase.rpc('smis_get_no_hidden_hazard_personnel_statistics_secure', {
        p_reported_from: params.reportedFrom || null,
        p_reported_to: params.reportedTo || null,
        p_organization_id: params.organizationId || null,
        p_max_hazard_count: Math.max(params.maxHazardCount ?? 0, 0),
        p_employee_keyword: params.employeeKeyword?.trim() || null
      }),
    { showErrorMessage: true }
  )
  return { ...(result.data ?? emptyNoHazardPersonnelStatistics()), error: result.error }
}

export async function fetchTeamSelfInspectionCoverage(
  params: SmisTeamSelfInspectionCoverageSearchParams = {}
) {
  const result = await responseHandle<SmisTeamSelfInspectionCoverageResult>(
    () =>
      supabase.rpc('smis_get_team_self_inspection_coverage_secure', {
        p_planned_from: params.plannedFrom || null,
        p_planned_to: params.plannedTo || null,
        p_organization_id: params.organizationId || null
      }),
    { showErrorMessage: true }
  )
  return { ...(result.data ?? emptyTeamSelfInspectionCoverage()), error: result.error }
}

export async function fetchSpecialEquipmentRiskControlStatistics(
  params: SmisSpecialEquipmentRiskControlStatisticsSearchParams = {}
) {
  const result = await responseHandle<SmisSpecialEquipmentRiskControlStatisticsResult>(
    () =>
      supabase.rpc('smis_get_special_equipment_risk_control_statistics_secure', {
        p_organization_id: params.organizationId || null
      }),
    { showErrorMessage: true }
  )
  return { ...(result.data ?? emptySpecialEquipmentRiskControl()), error: result.error }
}
