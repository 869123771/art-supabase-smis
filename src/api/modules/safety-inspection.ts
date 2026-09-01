import { omit } from 'lodash-es'
import { useSupabase } from '@/hooks'

export interface SmisSafetyInspectionOrganization {
  id: string
  parentId?: string | null
  organizationCode: string
  organizationName: string
  organizationType: string
  sort: number
  children?: SmisSafetyInspectionOrganization[]
}

export interface SmisSafetyInspectionTypeOption {
  id: string
  typeCode: string
  typeName: string
  textColor?: string | null
  tagStyle?: 'primary' | 'success' | 'info' | 'warning' | 'danger' | ''
}

export interface SmisSafetyInspectionEmployee {
  id: string
  tenantId: string
  employeeName: string
  employeeNo: string
  organizationId?: string | null
  jobTitle?: string | null
  employmentStatus: string
}

export interface SmisSafetyInspectionRecord {
  id: string
  tenantId: string
  inspectionTypeId: string
  inspectionTypeName: string
  inspectionName: string
  inspectionOrganizationId: string
  inspectionOrganizationName: string
  inspectedOrganizationId: string
  inspectedOrganizationName: string
  inspectionTime: string
  planAttachmentUrls: string[]
  remark?: string | null
  inspectors: SmisSafetyInspectionEmployee[]
  inspectorNames: string
  createBy?: string | null
  createTime: string
  updateBy?: string | null
  updateTime: string
}

export interface SmisSafetyInspectionSearchParams {
  inspectionName?: string
  inspectionFrom?: string
  inspectionTo?: string
  inspectedOrganizationId?: string
  inspectionTypeId?: string
  inspectorKeyword?: string
  ids?: string[]
  from?: number
  to?: number
}

export interface SmisSafetyInspectionOverview {
  total: number
  thisMonth: number
  organizationCount: number
  inspectorCount: number
}

export interface SmisSafetyInspectionPayload {
  id?: string
  inspectionTypeId: string
  inspectionName: string
  inspectionOrganizationId: string
  inspectedOrganizationId: string
  inspectionTime: string
  planAttachmentUrls: string[]
  inspectorIds: string[]
  remark?: string | null
}

interface SafetyInspectionOptionsResult {
  inspectionTypes?: SmisSafetyInspectionTypeOption[]
  organizations?: SmisSafetyInspectionOrganization[]
}

interface SafetyInspectionListResult {
  records?: SmisSafetyInspectionRecord[]
  total?: number
  overview?: SmisSafetyInspectionOverview
}

const { supabase, keysToSnakeDeep, responseHandle } = useSupabase()

const emptyOverview = (): SmisSafetyInspectionOverview => ({
  total: 0,
  thisMonth: 0,
  organizationCount: 0,
  inspectorCount: 0
})

export async function fetchSafetyInspectionOptions() {
  const result = await responseHandle<SafetyInspectionOptionsResult>(
    () => supabase.rpc('smis_list_safety_inspection_options_secure'),
    { showErrorMessage: true }
  )
  return {
    inspectionTypes: result.data?.inspectionTypes ?? [],
    organizations: result.data?.organizations ?? []
  }
}

export async function fetchSafetyInspectionList(params: SmisSafetyInspectionSearchParams = {}) {
  const from = Math.max(params.from ?? 0, 0)
  const result = await responseHandle<SafetyInspectionListResult>(
    () =>
      supabase.rpc('smis_list_safety_inspections_secure', {
        p_from: from,
        p_to: Math.max(params.to ?? from + 19, from),
        p_inspection_name: params.inspectionName?.trim() || null,
        p_inspection_from: params.inspectionFrom || null,
        p_inspection_to: params.inspectionTo || null,
        p_inspected_organization_id: params.inspectedOrganizationId || null,
        p_inspection_type_id: params.inspectionTypeId || null,
        p_inspector_keyword: params.inspectorKeyword?.trim() || null
      }),
    { showErrorMessage: true }
  )
  const records = result.data?.records ?? []
  const idSet = params.ids?.length ? new Set(params.ids) : null
  const data = idSet ? records.filter((record) => idSet.has(record.id)) : records
  return {
    data,
    total: idSet ? data.length : (result.data?.total ?? 0),
    overview: result.data?.overview ?? emptyOverview(),
    error: result.error
  }
}

export async function saveSafetyInspection(params: SmisSafetyInspectionPayload) {
  return await responseHandle<string>(
    () =>
      supabase.rpc('smis_save_safety_inspection_secure', {
        p_id: params.id ?? null,
        p_payload: keysToSnakeDeep(omit(params, ['id', 'inspectorIds'])),
        p_inspector_ids: params.inspectorIds
      }),
    {
      showMessage: true,
      breakReturn: true,
      message: params.id ? '安全检查已更新' : '安全检查已新增'
    }
  )
}

export async function copySafetyInspection(id: string) {
  return await responseHandle<string>(
    () => supabase.rpc('smis_copy_safety_inspection_secure', { p_id: id }),
    { showMessage: true, breakReturn: true, message: '安全检查已复制' }
  )
}

export async function deleteSafetyInspections(ids: string[]) {
  return await responseHandle<number>(
    () => supabase.rpc('smis_delete_safety_inspections_secure', { p_ids: ids }),
    { showMessage: true, breakReturn: true, message: '安全检查已删除' }
  )
}
