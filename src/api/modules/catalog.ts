import { omit } from 'lodash-es'
import { useSupabase } from '@/hooks'
import type { ApiRequestOptions } from '@/types/api/request'
import { withRequestOptions } from '@/api/providers/supabase/query'

export interface SafetyCatalogRecord {
  id?: string
  tenantId?: string
  moduleCode: string
  recordNo: string
  title: string
  status: string
  ownerName?: string | null
  businessDate?: string | null
  payload: Record<string, unknown>
  createdBy?: string | null
  createTime?: string
  updateTime?: string
}

export interface SafetyCatalogSearchParams {
  moduleCode: string
  moduleCodes?: string[]
  recordId?: string
  keyword?: string
  status?: string
  category?: string
  storageLocation?: string
  equipmentId?: string
  from?: number
  to?: number
}

export interface SmisEmployeeReference {
  id: string
  employeeNo: string
  employeeName: string
  organizationName?: string | null
  jobTitle?: string | null
  totalCount?: number
}

export interface SmisSupplierReference {
  id: string
  supplierCode: string
  supplierName: string
  contactName?: string | null
  contactPhone?: string | null
  totalCount?: number
}

export interface SafetyCatalogEvent {
  id: string
  recordId: string
  action: string
  fromStatus: string
  toStatus: string
  comment?: string | null
  operatorName?: string | null
  createTime: string
}

export interface HazardousWasteStock {
  wasteCode: string
  wasteName: string
  unit: string
  inboundQuantity: number
  outboundQuantity: number
  availableQuantity: number
  lastTransactionAt?: string | null
}

export interface SafetyExamAttempt {
  id: string
  examRecordId: string
  userId: string
  attemptNo: number
  status: 'in_progress' | 'submitted'
  answers: Record<string, string>
  score?: number | null
  passed?: boolean | null
  startedAt: string
  submittedAt?: string | null
}

export type SafetyWorkflowAction =
  'submit' | 'approve' | 'reject' | 'start' | 'complete' | 'cancel' | 'reopen' | 'transfer'

const { supabase, keysToSnakeDeep, responseHandle } = useSupabase()

export async function fetchSafetyCatalogRecords(
  params: SafetyCatalogSearchParams,
  options?: ApiRequestOptions
) {
  const { from = 0, to = 9 } = params
  let query = supabase
    .from('smis_business_record')
    .select('*', { count: 'exact' })
    .order('update_time', { ascending: false })
    .range(from, to)

  query = params.moduleCodes?.length
    ? query.in('module_code', params.moduleCodes)
    : query.eq('module_code', params.moduleCode)

  if (params.recordId) query = query.eq('id', params.recordId)
  if (params.status) query = query.eq('status', params.status)
  if (params.category) query = query.eq('payload->>category', params.category)
  if (params.storageLocation) {
    query = query.eq('payload->>storage_location', params.storageLocation)
  }
  if (params.equipmentId) query = query.eq('payload->>equipment_id', params.equipmentId)
  if (params.keyword?.trim()) {
    const keyword = params.keyword.trim().replaceAll(',', ' ')
    query = query.or(
      `record_no.ilike.%${keyword}%,title.ilike.%${keyword}%,owner_name.ilike.%${keyword}%`
    )
  }

  return await responseHandle<SafetyCatalogRecord[]>(() => withRequestOptions(query, options), {
    ignoreCheck: true,
    showErrorMessage: true
  })
}

export async function fetchSmisEmployeeReferences(params: {
  keyword?: string
  from?: number
  to?: number
}) {
  const { from = 0, to = 9 } = params
  return await responseHandle<SmisEmployeeReference[]>(
    () =>
      supabase.rpc('smis_list_employee_reference_options', {
        p_keyword: params.keyword?.trim() || null,
        p_from: from,
        p_to: to
      }),
    { ignoreCheck: true, showErrorMessage: true }
  )
}

export async function fetchSmisSupplierReferences(params: {
  keyword?: string
  from?: number
  to?: number
}) {
  const { from = 0, to = 9 } = params
  return await responseHandle<SmisSupplierReference[]>(
    () =>
      supabase.rpc('smis_list_supplier_reference_options', {
        p_keyword: params.keyword?.trim() || null,
        p_from: from,
        p_to: to
      }),
    { ignoreCheck: true, showErrorMessage: true }
  )
}

export async function saveSafetyCatalogRecord(record: SafetyCatalogRecord) {
  const payload = omit(record, ['tenantId', 'createdBy', 'createTime', 'updateTime'])
  return await responseHandle<SafetyCatalogRecord>(
    () => supabase.rpc('smis_save_business_record', { p_payload: keysToSnakeDeep(payload) }),
    {
      breakReturn: true,
      showMessage: true,
      message: record.id ? '业务记录已更新' : '业务记录已创建'
    }
  )
}

export async function deleteSafetyCatalogRecord(id: string) {
  return await responseHandle<void>(
    () => supabase.rpc('smis_delete_business_record', { p_record_id: id }),
    { breakReturn: true, showMessage: true, message: '业务记录已删除' }
  )
}

export async function fetchSafetyCatalogEvents(recordId: string, options?: ApiRequestOptions) {
  const query = supabase
    .from('smis_business_event')
    .select('*')
    .eq('record_id', recordId)
    .order('create_time', { ascending: false })

  return await responseHandle<SafetyCatalogEvent[]>(() => withRequestOptions(query, options), {
    ignoreCheck: true,
    showErrorMessage: true
  })
}

export async function transitionSafetyCatalogRecord(
  id: string,
  action: SafetyWorkflowAction,
  comment?: string
) {
  return await responseHandle<SafetyCatalogRecord>(
    () =>
      supabase.rpc('smis_transition_business_record', {
        p_record_id: id,
        p_action: action,
        p_comment: comment?.trim() || null
      }),
    {
      breakReturn: true,
      showMessage: true,
      message: '业务流程状态已更新'
    }
  )
}

export async function fetchHazardousWasteStock(options?: ApiRequestOptions) {
  return await responseHandle<HazardousWasteStock[]>(
    () => withRequestOptions(supabase.rpc('smis_get_hazardous_waste_stock'), options),
    { ignoreCheck: true, showErrorMessage: true }
  )
}

export async function startSafetyExam(examRecordId: string) {
  return await responseHandle<SafetyExamAttempt>(
    () => supabase.rpc('smis_start_exam_attempt', { p_exam_record_id: examRecordId }),
    { breakReturn: true, showMessage: true, message: '考试已开始' }
  )
}

export async function submitSafetyExam(attemptId: string, answers: Record<string, string>) {
  return await responseHandle<SafetyExamAttempt>(
    () =>
      supabase.rpc('smis_submit_exam_attempt', {
        p_attempt_id: attemptId,
        p_answers: answers
      }),
    { breakReturn: true, showMessage: true, message: '试卷已提交并完成评分' }
  )
}

export async function saveSafetyExamDraft(attemptId: string, answers: Record<string, string>) {
  return await responseHandle<SafetyExamAttempt>(
    () =>
      supabase.rpc('smis_save_exam_draft', {
        p_attempt_id: attemptId,
        p_answers: answers
      }),
    { breakReturn: true, showMessage: false }
  )
}
