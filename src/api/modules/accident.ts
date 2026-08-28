import { omit } from 'lodash-es'
import { useSupabase } from '@/hooks'
import TreeUtils from '@/utils/tree'
import type {
  SmisAccidentEmployee,
  SmisAccidentAnalysisListResult,
  SmisAccidentAnalysisSavePayload,
  SmisAccidentAnalysisSearchParams,
  SmisAccidentOption,
  SmisAccidentReportListResult,
  SmisAccidentReportSavePayload,
  SmisAccidentReportSearchParams,
  SmisTreeOrganization,
  SmisWorkInjuryListResult,
  SmisWorkInjurySavePayload,
  SmisWorkInjurySearchParams
} from '@smis/api/types'

const { supabase, keysToSnakeDeep, responseHandle } = useSupabase()
const organizationTree = new TreeUtils({
  idKey: 'id',
  parentKey: 'parentId',
  childrenKey: 'children'
})

const toOrganizationTree = (rows: SmisTreeOrganization[]): SmisTreeOrganization[] =>
  organizationTree.listToTree(rows, (left, right) => {
    const sortDifference = (left.sort ?? 0) - (right.sort ?? 0)
    return sortDifference || left.organizationName.localeCompare(right.organizationName, 'zh-CN')
  })

const accidentOverview = () => ({ total: 0, currentMonth: 0, highSeverity: 0, affectedPeople: 0 })
const accidentAnalysisOverview = () => ({ total: 0, complete: 0, pending: 0, participantCount: 0 })
const workInjuryOverview = () => ({ total: 0, slight: 0, minor: 0, serious: 0, fatal: 0 })

export async function fetchAccidentEmployeeCandidates(
  params: {
    keyword?: string
    from?: number
    to?: number
  } = {}
) {
  const from = Math.max(params.from ?? 0, 0)
  const result = await responseHandle<{ records?: SmisAccidentEmployee[]; total?: number }>(
    () =>
      supabase.rpc('smis_list_accident_employee_candidates_secure', {
        p_from: from,
        p_to: Math.max(params.to ?? from + 19, from),
        p_keyword: params.keyword?.trim() || null
      }),
    { showErrorMessage: true }
  )
  return {
    data: result.data?.records ?? [],
    total: result.data?.total ?? 0,
    error: result.error,
    fieldAccess: {}
  }
}

export async function fetchAccidentReportList(params: SmisAccidentReportSearchParams = {}) {
  const from = Math.max(params.from ?? 0, 0)
  const result = await responseHandle<Partial<SmisAccidentReportListResult>>(
    () =>
      supabase.rpc('smis_list_accident_reports_secure', {
        p_from: from,
        p_to: Math.max(params.to ?? from + 19, from),
        p_keyword: params.keyword?.trim() || null,
        p_accident_level: params.accidentLevel || null,
        p_accident_category: params.accidentCategory || null,
        p_organization_id: params.organizationId || null,
        p_start_time: params.startTime || null,
        p_end_time: params.endTime || null,
        p_ids: params.ids?.length ? params.ids : null
      }),
    { showErrorMessage: true }
  )
  return {
    data: result.data?.records ?? [],
    total: result.data?.total ?? 0,
    overview: result.data?.overview ?? accidentOverview(),
    organizations: toOrganizationTree(result.data?.organizations ?? []),
    currentEmployee: result.data?.currentEmployee ?? null,
    error: result.error
  }
}

export async function saveAccidentReport(params: SmisAccidentReportSavePayload) {
  return await responseHandle<string>(
    () =>
      supabase.rpc('smis_save_accident_report_secure', {
        p_id: params.id ?? null,
        p_payload: keysToSnakeDeep(omit(params, ['id']))
      }),
    {
      showMessage: true,
      breakReturn: true,
      message: params.id ? '事故快报已更新' : '事故快报已新增'
    }
  )
}

export async function deleteAccidentReports(ids: string[]) {
  return await responseHandle<number>(
    () => supabase.rpc('smis_delete_accident_reports_secure', { p_ids: ids }),
    { showMessage: true, breakReturn: true, message: '事故快报已删除' }
  )
}

export async function fetchAccidentReportOptions(keyword?: string) {
  const result = await responseHandle<SmisAccidentOption[]>(
    () =>
      supabase.rpc('smis_list_accident_report_options_secure', {
        p_keyword: keyword?.trim() || null
      }),
    { showErrorMessage: true }
  )
  return result.data ?? []
}

export async function fetchAccidentAnalysisList(params: SmisAccidentAnalysisSearchParams = {}) {
  const from = Math.max(params.from ?? 0, 0)
  const result = await responseHandle<Partial<SmisAccidentAnalysisListResult>>(
    () =>
      supabase.rpc('smis_list_accident_analyses_secure', {
        p_from: from,
        p_to: Math.max(params.to ?? from + 19, from),
        p_keyword: params.keyword?.trim() || null,
        p_accident_level: params.accidentLevel || null,
        p_ids: params.ids?.length ? params.ids : null
      }),
    { showErrorMessage: true }
  )
  return {
    data: result.data?.records ?? [],
    total: result.data?.total ?? 0,
    overview: result.data?.overview ?? accidentAnalysisOverview(),
    error: result.error
  }
}

export async function saveAccidentAnalysis(params: SmisAccidentAnalysisSavePayload) {
  return await responseHandle<string>(
    () =>
      supabase.rpc('smis_save_accident_analysis_secure', {
        p_id: params.id ?? null,
        p_payload: keysToSnakeDeep(omit(params, ['id']))
      }),
    {
      showMessage: true,
      breakReturn: true,
      message: params.id ? '事故分析单已更新' : '事故分析单已保存'
    }
  )
}

export async function deleteAccidentAnalyses(ids: string[]) {
  return await responseHandle<number>(
    () => supabase.rpc('smis_delete_accident_analyses_secure', { p_ids: ids }),
    { showMessage: true, breakReturn: true, message: '事故分析单已删除' }
  )
}

export async function fetchWorkInjuryDeclarationList(params: SmisWorkInjurySearchParams = {}) {
  const from = Math.max(params.from ?? 0, 0)
  const result = await responseHandle<Partial<SmisWorkInjuryListResult>>(
    () =>
      supabase.rpc('smis_list_work_injury_declarations_secure', {
        p_from: from,
        p_to: Math.max(params.to ?? from + 19, from),
        p_keyword: params.keyword?.trim() || null,
        p_injury_type: params.injuryType || null,
        p_start_date: params.startDate || null,
        p_end_date: params.endDate || null,
        p_ids: params.ids?.length ? params.ids : null
      }),
    { showErrorMessage: true }
  )
  return {
    data: result.data?.records ?? [],
    total: result.data?.total ?? 0,
    overview: result.data?.overview ?? workInjuryOverview(),
    currentEmployee: result.data?.currentEmployee ?? null,
    error: result.error
  }
}

export async function saveWorkInjuryDeclaration(params: SmisWorkInjurySavePayload) {
  return await responseHandle<string>(
    () =>
      supabase.rpc('smis_save_work_injury_declaration_secure', {
        p_id: params.id ?? null,
        p_payload: keysToSnakeDeep(omit(params, ['id']))
      }),
    {
      showMessage: true,
      breakReturn: true,
      message: params.id ? '工伤申报已更新' : '工伤申报已新增'
    }
  )
}

export async function deleteWorkInjuryDeclarations(ids: string[]) {
  return await responseHandle<number>(
    () => supabase.rpc('smis_delete_work_injury_declarations_secure', { p_ids: ids }),
    { showMessage: true, breakReturn: true, message: '工伤申报已删除' }
  )
}
