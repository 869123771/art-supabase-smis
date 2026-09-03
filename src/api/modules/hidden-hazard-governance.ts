import { omit } from 'lodash-es'
import { useSupabase } from '@/hooks'

export type SmisHiddenHazardGovernanceStatus =
  'pending_approval' | 'rectifying' | 'pending_acceptance' | 'completed' | 'closed'

export type SmisHiddenHazardSourceType =
  | 'quick_report'
  | 'public_report'
  | 'hazard_report'
  | 'hidden_hazard_inspection'
  | 'risk_inspection'

export type SmisHiddenHazardApprovalResult = 'rectify' | 'close'
export type SmisHiddenHazardAcceptanceResult = 'passed' | 'rejected'

export interface SmisHiddenHazardGovernanceOverview {
  total: number
  pendingApproval: number
  rectifying: number
  pendingAcceptance: number
  completed: number
  closed: number
}

export interface SmisHiddenHazardGovernanceRecord {
  id: string
  hazardNo: string
  inspectionTypeId?: string | null
  inspectionTypeName?: string | null
  inspectionTypeCode?: string | null
  sourceType: SmisHiddenHazardSourceType
  sourceRecordId?: string | null
  sourceRecordNo?: string | null
  description: string
  siteId?: string | null
  location: string
  hazardLevel: string
  status: SmisHiddenHazardGovernanceStatus
  reporterEmployeeId: string
  reporterEmployeeNo: string
  reporterEmployeeName: string
  reportedAt: string
  imageUrls: string[]
  rectificationSuggestion?: string | null
  rectificationDeadline?: string | null
  rectificationMeasures?: string | null
  rectificationResponsibleEmployeeId?: string | null
  rectificationResponsibleEmployeeNo?: string | null
  rectificationResponsibleEmployeeName?: string | null
  rectificationCompletedAt?: string | null
  acceptorEmployeeName?: string | null
  acceptedAt?: string | null
  createTime: string
  updateTime: string
}

export interface SmisHiddenHazardGovernanceEvent {
  id: string
  eventType:
    | 'registered'
    | 'approved'
    | 'closed'
    | 'rectification_submitted'
    | 'acceptance_passed'
    | 'acceptance_rejected'
  eventTitle: string
  eventContent?: string | null
  operatorEmployeeId?: string | null
  operatorEmployeeNo?: string | null
  operatorEmployeeName?: string | null
  evidenceUrls: string[]
  eventAt: string
}

export interface SmisHiddenHazardGovernanceDetail extends SmisHiddenHazardGovernanceRecord {
  approverEmployeeName?: string | null
  approverEmployeeNo?: string | null
  approvedAt?: string | null
  approvalResult?: SmisHiddenHazardApprovalResult | null
  approvalDescription?: string | null
  rectificationDescription?: string | null
  rectificationImageUrls: string[]
  acceptorEmployeeNo?: string | null
  acceptanceResult?: SmisHiddenHazardAcceptanceResult | null
  acceptanceDescription?: string | null
  acceptanceImageUrls: string[]
  closedAt?: string | null
  closeReason?: string | null
  createBy?: string | null
  updateBy?: string | null
  events: SmisHiddenHazardGovernanceEvent[]
}

export interface SmisHiddenHazardGovernanceSearchParams {
  hazardNo?: string
  reportedFrom?: string
  reportedTo?: string
  status?: SmisHiddenHazardGovernanceStatus
  rectifierKeyword?: string
  reporterKeyword?: string
  inspectionTypeId?: string
  ids?: string[]
  from?: number
  to?: number
}

export interface SmisHiddenHazardRegistrationPayload {
  description: string
  siteId: string
  hazardLevel: string
  reporterEmployeeId: string
  reportedAt: string
  imageUrls: string[]
  rectificationSuggestion?: string | null
}

export interface SmisHiddenHazardApprovalPayload {
  id: string
  result: SmisHiddenHazardApprovalResult
  approvalDescription?: string | null
  rectificationResponsibleEmployeeId?: string | null
  rectificationDeadline?: string | null
  rectificationMeasures?: string | null
}

export interface SmisHiddenHazardRectificationPayload {
  id: string
  completedAt: string
  description: string
  imageUrls: string[]
}

export interface SmisHiddenHazardAcceptancePayload {
  id: string
  result: SmisHiddenHazardAcceptanceResult
  description: string
  imageUrls: string[]
}

export interface SmisHazardReporterProfile {
  employeeId?: string | null
  employeeNo: string
  employeeName: string
  idCardNo: string
  phone: string
  organizationId?: string | null
  organizationName?: string | null
  isEmployeeLinked: boolean
}

export interface SmisHazardReportingOrganization {
  id: string
  parentId?: string | null
  organizationCode: string
  organizationName: string
  organizationType: string
  sort: number
  children?: SmisHazardReportingOrganization[]
}

export interface SmisHazardReportingSite {
  id: string
  parentId?: string | null
  organizationId: string
  siteName: string
  categoryCode: string
  addressDetail?: string | null
  sort: number
  children?: SmisHazardReportingSite[]
}

export interface SmisHazardReportingOptions {
  profile?: SmisHazardReporterProfile | null
  organizations: SmisHazardReportingOrganization[]
  sites: SmisHazardReportingSite[]
}

export interface SmisHazardSourceReportPayload {
  description: string
  hazardOrganizationId: string
  siteId: string
  location: string
  hazardLevel: string
  imageUrls: string[]
  rectificationSuggestion?: string | null
  publicReporterName?: string | null
  publicReporterPhone?: string | null
  publicReporterIdCard?: string | null
  publicReporterUnit?: string | null
}

export interface SmisHazardSourceReportResult {
  id: string
  hazardNo: string
}

export interface SmisPublicHazardReportRecord {
  id: string
  hazardNo: string
  status: SmisHiddenHazardGovernanceStatus
  reporterName: string
  reporterPhone?: string | null
  reporterIdCard?: string | null
  reporterUnit?: string | null
  description: string
  hazardOrganizationName?: string | null
  siteName?: string | null
  location: string
  hazardLevel: string
  imageUrls: string[]
  reportedAt: string
  handlerName: string
  createTime: string
}

export interface SmisPublicHazardReportSearchParams {
  keyword?: string
  status?: SmisHiddenHazardGovernanceStatus
  reportedFrom?: string
  reportedTo?: string
  ids?: string[]
  from?: number
  to?: number
}

export interface SmisRectificationNoticeRecord {
  id: string
  noticeNo: string
  hazardNo: string
  rectificationPlanNo: string
  inspectionTime: string
  inspectionOrganizationName: string
  inspectorNames: string
  inspectedOrganizationName: string
  hazardDescription: string
  rectificationRequirement?: string | null
  rectificationDeadline?: string | null
  status: SmisHiddenHazardGovernanceStatus
  rectificationCompletedAt?: string | null
  rectificationDescription?: string | null
  rectificationImageUrls: string[]
  hazardImageUrls: string[]
  location: string
  hazardLevel: string
  responsibleEmployeeName?: string | null
}

export interface SmisRectificationNoticeSearchParams {
  inspectionFrom?: string
  inspectionTo?: string
  inspectionOrganizationId?: string
  inspectedOrganizationId?: string
  inspectorKeyword?: string
  rectifiableOnly?: boolean
  ids?: string[]
  from?: number
  to?: number
}

export interface SmisInspectionRectificationPayload {
  id: string
  completedAt: string
  description: string
  imageUrls: string[]
}

interface GovernanceListResult {
  records?: SmisHiddenHazardGovernanceRecord[]
  total?: number
  overview?: SmisHiddenHazardGovernanceOverview
}

interface PublicHazardReportListResult {
  records?: SmisPublicHazardReportRecord[]
  total?: number
  pendingCount?: number
  processingCount?: number
  closedCount?: number
}

interface RectificationNoticeListResult {
  records?: SmisRectificationNoticeRecord[]
  total?: number
  rectifyingCount?: number
  pendingAcceptanceCount?: number
  completedCount?: number
}

const { supabase, keysToSnakeDeep, responseHandle } = useSupabase()
const emptyOverview = (): SmisHiddenHazardGovernanceOverview => ({
  total: 0,
  pendingApproval: 0,
  rectifying: 0,
  pendingAcceptance: 0,
  completed: 0,
  closed: 0
})

export async function fetchHiddenHazardGovernanceList(
  params: SmisHiddenHazardGovernanceSearchParams = {}
) {
  const from = Math.max(params.from ?? 0, 0)
  const result = await responseHandle<GovernanceListResult>(
    () =>
      supabase.rpc('smis_list_hidden_hazard_governance_secure', {
        p_from: from,
        p_to: Math.max(params.to ?? from + 19, from),
        p_hazard_no: params.hazardNo?.trim() || null,
        p_reported_from: params.reportedFrom || null,
        p_reported_to: params.reportedTo || null,
        p_status: params.status || null,
        p_rectifier_keyword: params.rectifierKeyword?.trim() || null,
        p_reporter_keyword: params.reporterKeyword?.trim() || null,
        p_inspection_type_id: params.inspectionTypeId || null
      }),
    { showErrorMessage: true }
  )
  const records = result.data?.records ?? []
  const idSet = params.ids?.length ? new Set(params.ids) : null
  const data = idSet ? records.filter((item) => idSet.has(item.id)) : records
  return {
    data,
    total: idSet ? data.length : (result.data?.total ?? 0),
    overview: result.data?.overview ?? emptyOverview(),
    error: result.error
  }
}

export async function fetchHiddenHazardGovernanceDetail(id: string) {
  const result = await responseHandle<SmisHiddenHazardGovernanceDetail>(
    () => supabase.rpc('smis_get_hidden_hazard_governance_secure', { p_id: id }),
    { showErrorMessage: true }
  )
  return result.data ?? null
}

export async function registerHiddenHazard(payload: SmisHiddenHazardRegistrationPayload) {
  return await responseHandle<string>(
    () =>
      supabase.rpc('smis_register_hidden_hazard_governance_secure', {
        p_payload: keysToSnakeDeep(payload)
      }),
    { showMessage: true, breakReturn: true, message: '隐患已登记并进入待核准状态' }
  )
}

export async function approveHiddenHazard(payload: SmisHiddenHazardApprovalPayload) {
  return await responseHandle<boolean>(
    () =>
      supabase.rpc('smis_approve_hidden_hazard_governance_secure', {
        p_id: payload.id,
        p_payload: keysToSnakeDeep(omit(payload, ['id']))
      }),
    {
      showMessage: true,
      breakReturn: true,
      message: payload.result === 'close' ? '隐患已核准关闭' : '隐患已核准并进入整改'
    }
  )
}

export async function rectifyHiddenHazard(payload: SmisHiddenHazardRectificationPayload) {
  return await responseHandle<boolean>(
    () =>
      supabase.rpc('smis_rectify_hidden_hazard_governance_secure', {
        p_id: payload.id,
        p_payload: keysToSnakeDeep(omit(payload, ['id']))
      }),
    { showMessage: true, breakReturn: true, message: '整改结果已提交，等待验收' }
  )
}

export async function acceptHiddenHazard(payload: SmisHiddenHazardAcceptancePayload) {
  return await responseHandle<boolean>(
    () =>
      supabase.rpc('smis_accept_hidden_hazard_governance_secure', {
        p_id: payload.id,
        p_payload: keysToSnakeDeep(omit(payload, ['id']))
      }),
    {
      showMessage: true,
      breakReturn: true,
      message: payload.result === 'passed' ? '隐患验收通过' : '验收已退回整改'
    }
  )
}

export async function fetchHazardReportingOptions() {
  const result = await responseHandle<SmisHazardReportingOptions>(
    () => supabase.rpc('smis_get_hazard_reporting_options_secure'),
    { showErrorMessage: true }
  )
  return {
    profile: result.data?.profile ?? null,
    organizations: result.data?.organizations ?? [],
    sites: result.data?.sites ?? []
  }
}

export async function submitHazardSourceReport(
  sourceType: Extract<SmisHiddenHazardSourceType, 'quick_report' | 'public_report'>,
  payload: SmisHazardSourceReportPayload
) {
  return await responseHandle<SmisHazardSourceReportResult>(
    () =>
      supabase.rpc('smis_submit_hazard_source_report_secure', {
        p_source_type: sourceType,
        p_payload: keysToSnakeDeep(payload)
      }),
    {
      showMessage: true,
      breakReturn: true,
      message: sourceType === 'quick_report' ? '随手拍已提交' : '公众举报隐患已登记'
    }
  )
}

export async function fetchPublicHazardReportList(params: SmisPublicHazardReportSearchParams = {}) {
  const from = Math.max(params.from ?? 0, 0)
  const result = await responseHandle<PublicHazardReportListResult>(
    () =>
      supabase.rpc('smis_list_public_hazard_reports_secure', {
        p_from: from,
        p_to: Math.max(params.to ?? from + 19, from),
        p_keyword: params.keyword?.trim() || null,
        p_status: params.status || null,
        p_reported_from: params.reportedFrom || null,
        p_reported_to: params.reportedTo || null
      }),
    { showErrorMessage: true }
  )
  const records = result.data?.records ?? []
  const idSet = params.ids?.length ? new Set(params.ids) : null
  const data = idSet ? records.filter((item) => idSet.has(item.id)) : records
  return {
    data,
    total: idSet ? data.length : (result.data?.total ?? 0),
    pendingCount: result.data?.pendingCount ?? 0,
    processingCount: result.data?.processingCount ?? 0,
    closedCount: result.data?.closedCount ?? 0,
    error: result.error
  }
}

export async function fetchRectificationNoticeList(
  params: SmisRectificationNoticeSearchParams = {}
) {
  const from = Math.max(params.from ?? 0, 0)
  const result = await responseHandle<RectificationNoticeListResult>(
    () =>
      supabase.rpc('smis_list_rectification_notices_secure', {
        p_from: from,
        p_to: Math.max(params.to ?? from + 19, from),
        p_inspection_from: params.inspectionFrom || null,
        p_inspection_to: params.inspectionTo || null,
        p_inspection_organization_id: params.inspectionOrganizationId || null,
        p_inspected_organization_id: params.inspectedOrganizationId || null,
        p_inspector_keyword: params.inspectorKeyword?.trim() || null,
        p_rectifiable_only: params.rectifiableOnly ?? false
      }),
    { showErrorMessage: true }
  )
  const records = result.data?.records ?? []
  const idSet = params.ids?.length ? new Set(params.ids) : null
  const data = idSet ? records.filter((item) => idSet.has(item.id)) : records
  return {
    data,
    total: idSet ? data.length : (result.data?.total ?? 0),
    rectifyingCount: result.data?.rectifyingCount ?? 0,
    pendingAcceptanceCount: result.data?.pendingAcceptanceCount ?? 0,
    completedCount: result.data?.completedCount ?? 0,
    error: result.error
  }
}

export async function createInspectionRectification(payload: SmisInspectionRectificationPayload) {
  return await responseHandle<boolean>(
    () =>
      supabase.rpc('smis_create_inspection_rectification_secure', {
        p_id: payload.id,
        p_payload: keysToSnakeDeep(omit(payload, ['id']))
      }),
    { showMessage: true, breakReturn: true, message: '整改落实记录已提交，等待验收' }
  )
}
