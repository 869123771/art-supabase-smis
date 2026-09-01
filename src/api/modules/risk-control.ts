import { omit } from 'lodash-es'
import { useSupabase } from '@/hooks'
import type {
  SmisRiskControlListResult,
  SmisRiskControlOptions,
  SmisRiskControlPlanSavePayload,
  SmisRiskControlSearchParams,
  SmisRiskInspectionExecutionPayload,
  SmisRiskInspectionTaskDetail,
  SmisRiskInspectionTaskListResult,
  SmisRiskInspectionTaskSearchParams,
  SmisSafetyRiskListResult,
  SmisSafetyRiskOptions,
  SmisSafetyRiskSavePayload,
  SmisSafetyRiskSearchParams
} from '@smis/api/types'

const { supabase, keysToSnakeDeep, responseHandle } = useSupabase()

const emptySafetyOverview = () => ({ total: 0, evaluated: 0, major: 0, controlled: 0 })
const emptyControlOverview = () => ({ total: 0, uncontrolled: 0, active: 0, major: 0 })
const emptyTaskOverview = () => ({
  total: 0,
  notStarted: 0,
  inProgress: 0,
  overdue: 0,
  completed: 0
})

export async function fetchSafetyRiskOptions() {
  const result = await responseHandle<SmisSafetyRiskOptions>(
    () => supabase.rpc('smis_list_safety_risk_options_secure'),
    { showErrorMessage: true }
  )
  return result.data ?? { riskPoints: [], hazardCategories: [] }
}

export async function fetchSafetyRiskList(params: SmisSafetyRiskSearchParams = {}) {
  const from = Math.max(params.from ?? 0, 0)
  const result = await responseHandle<SmisSafetyRiskListResult>(
    () =>
      supabase.rpc('smis_list_safety_risks_secure', {
        p_from: from,
        p_to: Math.max(params.to ?? from + 19, from),
        p_keyword: params.keyword?.trim() || null,
        p_risk_name: params.riskName?.trim() || null,
        p_accident_type: params.accidentType || null,
        p_identified_from: params.identifiedFrom || null,
        p_identified_to: params.identifiedTo || null,
        p_control_level: params.controlLevel || null,
        p_status: params.status || null,
        p_responsible_keyword: params.responsibleKeyword?.trim() || null
      }),
    { showErrorMessage: true }
  )
  return {
    data: result.data?.records ?? [],
    total: result.data?.total ?? 0,
    overview: result.data?.overview ?? emptySafetyOverview(),
    error: result.error
  }
}

export async function saveSafetyRisk(params: SmisSafetyRiskSavePayload) {
  return await responseHandle<string>(
    () =>
      supabase.rpc('smis_save_safety_risk_secure', {
        p_id: params.id ?? null,
        p_risk_point_id: params.riskPointId,
        p_payload: keysToSnakeDeep(omit(params, ['id', 'riskPointId', 'activityIds'])),
        p_activity_ids: params.activityIds
      }),
    {
      showMessage: true,
      breakReturn: true,
      message: params.id ? '安全风险已更新' : '安全风险已新增'
    }
  )
}

export async function deleteSafetyRisks(ids: string[]) {
  return await responseHandle<number>(
    () => supabase.rpc('smis_delete_safety_risks_secure', { p_ids: ids }),
    { showMessage: true, breakReturn: true, message: '安全风险已删除' }
  )
}

export async function fetchRiskControlOptions() {
  const result = await responseHandle<SmisRiskControlOptions>(
    () => supabase.rpc('smis_list_risk_control_options_secure'),
    { showErrorMessage: true }
  )
  return result.data ?? { riskPoints: [], duplicateConfigurations: [] }
}

export async function fetchRiskControlPointList(params: SmisRiskControlSearchParams = {}) {
  const from = Math.max(params.from ?? 0, 0)
  const result = await responseHandle<SmisRiskControlListResult>(
    () =>
      supabase.rpc('smis_list_risk_control_points_secure', {
        p_from: from,
        p_to: Math.max(params.to ?? from + 19, from),
        p_keyword: params.keyword?.trim() || null,
        p_risk_type: params.riskType || null,
        p_control_level: params.controlLevel || null,
        p_control_status: params.controlStatus || null
      }),
    { showErrorMessage: true }
  )
  return {
    data: result.data?.records ?? [],
    total: result.data?.total ?? 0,
    overview: result.data?.overview ?? emptyControlOverview(),
    error: result.error
  }
}

export async function saveRiskControlPlan(params: SmisRiskControlPlanSavePayload) {
  return await responseHandle<string>(
    () =>
      supabase.rpc('smis_save_risk_control_plan_secure', {
        p_id: params.id ?? null,
        p_risk_point_id: params.riskPointId,
        p_control_start_at: params.controlStartAt,
        p_status: params.status,
        p_control_description: params.controlDescription?.trim() || null,
        p_assignments: keysToSnakeDeep(
          params.assignments.map((assignment) => omit(assignment, ['id']))
        )
      }),
    {
      showMessage: true,
      breakReturn: true,
      message: params.id ? '风险管控设置已更新' : '风险管控设置已保存'
    }
  )
}

export async function deleteRiskControlPlans(ids: string[]) {
  return await responseHandle<number>(
    () => supabase.rpc('smis_delete_risk_control_plans_secure', { p_ids: ids }),
    { showMessage: true, breakReturn: true, message: '风险管控配置已删除或停用' }
  )
}

export async function generateDueRiskInspectionTasks() {
  return await responseHandle<number>(
    () => supabase.rpc('smis_generate_due_risk_inspection_tasks_secure'),
    { showErrorMessage: true }
  )
}

export async function fetchRiskInspectionTaskList(params: SmisRiskInspectionTaskSearchParams = {}) {
  const from = Math.max(params.from ?? 0, 0)
  const result = await responseHandle<SmisRiskInspectionTaskListResult>(
    () =>
      supabase.rpc('smis_list_risk_inspection_tasks_secure', {
        p_from: from,
        p_to: Math.max(params.to ?? from + 19, from),
        p_keyword: params.keyword?.trim() || null,
        p_risk_name: params.riskName?.trim() || null,
        p_risk_type: params.riskType || null,
        p_planned_from: params.plannedFrom || null,
        p_planned_to: params.plannedTo || null,
        p_responsible_employee_id: params.responsibleEmployeeId || null,
        p_status: params.status || null,
        p_executor_keyword: params.executorKeyword?.trim() || null
      }),
    { showErrorMessage: true }
  )
  return {
    data: result.data?.records ?? [],
    total: result.data?.total ?? 0,
    overview: result.data?.overview ?? emptyTaskOverview(),
    error: result.error
  }
}

export async function fetchRiskInspectionTaskDetail(id: string) {
  const result = await responseHandle<SmisRiskInspectionTaskDetail>(
    () => supabase.rpc('smis_get_risk_inspection_task_secure', { p_id: id }),
    { showErrorMessage: true }
  )
  return result.data ?? null
}

export async function cancelRiskInspectionTask(id: string, reason: string) {
  return await responseHandle<void>(
    () => supabase.rpc('smis_cancel_risk_inspection_task_secure', { p_id: id, p_reason: reason }),
    { showMessage: true, breakReturn: true, message: '风险巡查任务已取消' }
  )
}

export async function transferRiskInspectionTask(id: string, employeeId: string, reason: string) {
  return await responseHandle<void>(
    () =>
      supabase.rpc('smis_transfer_risk_inspection_task_secure', {
        p_id: id,
        p_employee_id: employeeId,
        p_reason: reason
      }),
    { showMessage: true, breakReturn: true, message: '风险巡查任务已转交' }
  )
}

export async function saveRiskInspectionExecution(params: SmisRiskInspectionExecutionPayload) {
  return await responseHandle<void>(
    () =>
      supabase.rpc('smis_save_risk_inspection_execution_secure', {
        p_id: params.id,
        p_actual_executor_employee_id: params.actualExecutorEmployeeId,
        p_execution_summary: params.executionSummary?.trim() || null,
        p_attachment_urls: params.attachmentUrls,
        p_items: keysToSnakeDeep(params.items),
        p_complete: params.complete
      }),
    {
      showMessage: true,
      breakReturn: true,
      message: params.complete ? '巡查结果已提交，任务已完成' : '巡查进度已保存'
    }
  )
}
