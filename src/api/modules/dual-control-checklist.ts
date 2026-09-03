import { useSupabase } from '@/hooks'
import type {
  SmisAccidentInspectionChecklistOverview,
  SmisAccidentInspectionChecklistRecord,
  SmisChecklistSearchParams,
  SmisEmployeeShiftCalendar,
  SmisPersonnelChecklistOverview,
  SmisPersonnelChecklistRecord,
  SmisPositionResponsibilityChecklistOverview,
  SmisPositionResponsibilityChecklistRecord,
  SmisPositionRiskChecklistOverview,
  SmisPositionRiskChecklistRecord
} from '@smis/api/types'

interface ChecklistListResult<TRecord, TOverview> {
  records?: TRecord[]
  total?: number
  overview?: TOverview
}

const { supabase, responseHandle } = useSupabase()

const listResult = <TRecord, TOverview>(
  result: Awaited<ReturnType<typeof responseHandle<ChecklistListResult<TRecord, TOverview>>>>,
  emptyOverview: TOverview
) => ({
  data: result.data?.records ?? [],
  total: result.data?.total ?? 0,
  overview: result.data?.overview ?? emptyOverview,
  error: result.error
})

export async function fetchPersonnelDualControlChecklist(params: SmisChecklistSearchParams = {}) {
  const from = Math.max(params.from ?? 0, 0)
  const result = await responseHandle<
    ChecklistListResult<SmisPersonnelChecklistRecord, SmisPersonnelChecklistOverview>
  >(
    () =>
      supabase.rpc('smis_list_personnel_dual_control_checklist_secure', {
        p_from: from,
        p_to: Math.max(params.to ?? from + 19, from),
        p_keyword: params.keyword?.trim() || null,
        p_organization_id: params.organizationId || null,
        p_gender: params.gender || null
      }),
    { showErrorMessage: true }
  )
  return listResult(result, { total: 0, scheduled: 0, withRisk: 0, withInspection: 0 })
}

export async function fetchEmployeeShiftCalendar(employeeId: string, month: string) {
  const result = await responseHandle<SmisEmployeeShiftCalendar>(
    () =>
      supabase.rpc('smis_get_employee_shift_calendar_secure', {
        p_employee_id: employeeId,
        p_month: `${month}-01`
      }),
    { showErrorMessage: true }
  )
  return result.data ?? null
}

export async function fetchPositionRiskChecklist(params: SmisChecklistSearchParams = {}) {
  const from = Math.max(params.from ?? 0, 0)
  const result = await responseHandle<
    ChecklistListResult<SmisPositionRiskChecklistRecord, SmisPositionRiskChecklistOverview>
  >(
    () =>
      supabase.rpc('smis_list_position_risk_checklist_secure', {
        p_from: from,
        p_to: Math.max(params.to ?? from + 19, from),
        p_keyword: params.keyword?.trim() || null,
        p_organization_id: params.organizationId || null,
        p_risk_level: params.riskLevel || null
      }),
    { showErrorMessage: true }
  )
  return listResult(result, { total: 0, major: 0, identifiedUnits: 0, positions: 0 })
}

export async function fetchAccidentInspectionChecklist(params: SmisChecklistSearchParams = {}) {
  const from = Math.max(params.from ?? 0, 0)
  const result = await responseHandle<
    ChecklistListResult<
      SmisAccidentInspectionChecklistRecord,
      SmisAccidentInspectionChecklistOverview
    >
  >(
    () =>
      supabase.rpc('smis_list_accident_hidden_hazard_inspection_checklist_secure', {
        p_from: from,
        p_to: Math.max(params.to ?? from + 19, from),
        p_keyword: params.keyword?.trim() || null,
        p_organization_id: params.organizationId || null,
        p_hazard_level: params.hazardLevel || null
      }),
    { showErrorMessage: true }
  )
  return listResult(result, { total: 0, positions: 0, organizations: 0, major: 0 })
}

export async function fetchPositionResponsibilityChecklist(params: SmisChecklistSearchParams = {}) {
  const from = Math.max(params.from ?? 0, 0)
  const result = await responseHandle<
    ChecklistListResult<
      SmisPositionResponsibilityChecklistRecord,
      SmisPositionResponsibilityChecklistOverview
    >
  >(
    () =>
      supabase.rpc('smis_list_position_safety_responsibility_checklist_secure', {
        p_from: from,
        p_to: Math.max(params.to ?? from + 19, from),
        p_keyword: params.keyword?.trim() || null,
        p_organization_id: params.organizationId || null
      }),
    { showErrorMessage: true }
  )
  return listResult(result, { total: 0, organizations: 0, riskMeasures: 0, inspectionStandards: 0 })
}
