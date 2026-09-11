export type SmisPpeIssuanceCycle = 'day' | 'week' | 'month' | 'half_year' | 'quarter' | 'year'
export type SmisPpeStandardStatus = 'enabled' | 'disabled'

export interface SmisPpeScopeOption {
  id: string
  parentId?: string | null
  code: string
  name: string
  type?: string
  sort?: number
  organizationId?: string | null
  organizationName?: string | null
  children?: SmisPpeScopeOption[]
}

export interface SmisPpeIssuanceStandardDetail {
  id?: string
  materialId: string
  materialCode: string
  materialName: string
  categoryName?: string
  specificationModel?: string | null
  basicUnit: string
  imageUrls: string[]
  quotaQuantity: number
  issuanceCycle: SmisPpeIssuanceCycle
  issuanceFrequency: number
  status: SmisPpeStandardStatus
  remark?: string | null
  sort: number
}

export interface SmisPpeIssuanceStandard {
  id: string
  tenantId: string
  standardNo: string
  standardName: string
  ratedQuantity: number
  issuanceCycle: SmisPpeIssuanceCycle
  issuanceFrequency: number
  status: SmisPpeStandardStatus
  description?: string | null
  positions: SmisPpeScopeOption[]
  organizations: SmisPpeScopeOption[]
  details: SmisPpeIssuanceStandardDetail[]
  createTime?: string
  updateTime?: string
}

export interface SmisPpeIssuanceStandardSearchParams {
  keyword?: string
  status?: SmisPpeStandardStatus
  purpose?: 'list' | 'export'
  from?: number
  to?: number
}

export interface SmisPpeIssuanceStandardOverview {
  total: number
  enabled: number
  disabled: number
  detailTotal: number
}

export interface SmisPpeIssuanceStandardSavePayload {
  id?: string
  standardNo?: string
  standardName: string
  positionIds: string[]
  organizationIds: string[]
  ratedQuantity: number
  issuanceCycle: SmisPpeIssuanceCycle
  issuanceFrequency: number
  status: SmisPpeStandardStatus
  description?: string | null
  details: Array<
    Pick<
      SmisPpeIssuanceStandardDetail,
      | 'materialId'
      | 'quotaQuantity'
      | 'issuanceCycle'
      | 'issuanceFrequency'
      | 'status'
      | 'remark'
      | 'sort'
    >
  >
}

export interface SmisPpePersonalStandard {
  employeeId: string
  employeeNo: string
  employeeName: string
  avatarUrl?: string | null
  organizationId?: string | null
  organizationName?: string | null
  positionId?: string | null
  positionName?: string | null
  personalStandardId?: string | null
  generatedAt?: string | null
  status?: SmisPpeStandardStatus | null
  itemCount: number
}

export interface SmisPpePersonalStandardItem {
  id: string
  sourceStandardId: string
  sourceStandardNo: string
  sourceStandardName: string
  materialId: string
  materialCode: string
  materialName: string
  categoryName: string
  specificationModel?: string | null
  basicUnit: string
  imageUrls: string[]
  quotaQuantity: number
  issuanceCycle: SmisPpeIssuanceCycle
  issuanceFrequency: number
  status: SmisPpeStandardStatus
  initialIssueDate?: string | null
  lastIssueDate?: string | null
  nextIssueDate?: string | null
}

export interface SmisPpePersonalStandardSearchParams {
  keyword?: string
  organizationIds?: string[]
  positionId?: string
  onlyMissing?: boolean
  purpose?: 'list' | 'export'
  from?: number
  to?: number
}

export interface SmisPpePersonalStandardOverview {
  employeeTotal: number
  generatedTotal: number
  missingTotal: number
  itemTotal: number
}

export interface SmisPpeGenerateResult {
  employeeCount: number
  itemCount: number
  unmatchedCount: number
}

export interface SmisPpeDueGenerateResult {
  documentCount: number
  itemCount: number
}

export type SmisPpeRequisitionStatus =
  'pending_issue' | 'issued_pending_confirmation' | 'confirmed' | 'denied' | 'cancelled'

export type SmisPpeIssuanceStatus = 'draft' | 'posted' | 'voided'

export interface SmisPpePersonalRequisitionItem {
  id: string
  tenantId: string
  requisitionId: string
  requisitionNo: string
  employeeId: string
  employeeNo: string
  employeeName: string
  positionName?: string | null
  organizationId?: string | null
  organizationName?: string | null
  operationDepartment?: string | null
  operationArea?: string | null
  team?: string | null
  materialId: string
  materialCategory?: string | null
  materialName: string
  specificationModel?: string | null
  unit: string
  imageUrls: string[]
  quotaQuantity: number
  requestedQuantity: number
  quotaCycleMonths: number
  plannedIssueDate: string
  status: SmisPpeRequisitionStatus
  reminder?: string | null
  issuedAt?: string | null
  confirmedAt?: string | null
  confirmationSource?: 'employee' | 'system' | null
  denialReason?: string | null
  remark?: string | null
}

export interface SmisPpePersonalRequisitionSearchParams {
  dateRange?: [string, string]
  organizationId?: string
  employeeId?: string
  status?: SmisPpeRequisitionStatus
  keyword?: string
  purpose?: 'list' | 'export'
  from?: number
  to?: number
}

export interface SmisPpePersonalRequisitionOverview {
  total: number
  pending: number
  waitingConfirmation: number
  confirmed: number
  overdue: number
}

export interface SmisPpeSetting {
  autoConfirmDays: number
}

export interface SmisPpeIssuanceRecordItem {
  id?: string
  requisitionItemId?: string | null
  materialId: string
  materialCategory?: string | null
  materialName: string
  specificationModel?: string | null
  unit: string
  issueQuantity: number
  remark?: string | null
}

export interface SmisPpeIssuanceRecord {
  id: string
  tenantId: string
  issuanceNo: string
  employeeId: string
  employeeNo: string
  employeeName: string
  positionName?: string | null
  organizationId?: string | null
  organizationName?: string | null
  warehouseId: string
  warehouseName: string
  issuerEmployeeId: string
  issuerName: string
  issueDate: string
  status: SmisPpeIssuanceStatus
  postedAt?: string | null
  remark?: string | null
  createTime?: string | null
  items: SmisPpeIssuanceRecordItem[]
}

export interface SmisPpeIssuanceRecordSearchParams {
  dateRange?: [string, string]
  organizationId?: string
  employeeId?: string
  status?: SmisPpeIssuanceStatus
  keyword?: string
  purpose?: 'list' | 'export'
  from?: number
  to?: number
}

export interface SmisPpeIssuanceRecordOverview {
  total: number
  draft: number
  posted: number
  today: number
  quantity: number
}

export interface SmisPpeIssuanceRecordSavePayload {
  id?: string
  employeeId: string
  warehouseId: string
  issuerEmployeeId: string
  issueDate: string
  remark?: string | null
  items: Array<
    Pick<SmisPpeIssuanceRecordItem, 'requisitionItemId' | 'materialId' | 'issueQuantity' | 'remark'>
  >
}

export interface SmisPpeIssuanceStatisticsRow {
  organizationId?: string | null
  organizationName: string
  materialName: string
  specificationModel?: string | null
  unit: string
  quantity: number
  employeeCount: number
}

export interface SmisPpeIssuanceStatistics {
  summary: {
    documentCount: number
    employeeCount: number
    materialCount: number
    totalQuantity: number
  }
  rows: SmisPpeIssuanceStatisticsRow[]
}

// 工器具领用与防护用品领用遵循同一套字段契约，但由独立表、RPC 和权限承载。
export type SmisToolIssuanceCycle = SmisPpeIssuanceCycle
export type SmisToolStandardStatus = SmisPpeStandardStatus
export type SmisToolScopeOption = SmisPpeScopeOption
export type SmisToolIssuanceStandardDetail = SmisPpeIssuanceStandardDetail
export type SmisToolIssuanceStandard = SmisPpeIssuanceStandard
export type SmisToolIssuanceStandardSearchParams = SmisPpeIssuanceStandardSearchParams
export type SmisToolIssuanceStandardOverview = SmisPpeIssuanceStandardOverview
export type SmisToolIssuanceStandardSavePayload = SmisPpeIssuanceStandardSavePayload
export type SmisToolPersonalStandard = SmisPpePersonalStandard
export type SmisToolPersonalStandardItem = SmisPpePersonalStandardItem
export type SmisToolPersonalStandardSearchParams = SmisPpePersonalStandardSearchParams
export type SmisToolPersonalStandardOverview = SmisPpePersonalStandardOverview
export type SmisToolGenerateResult = SmisPpeGenerateResult
export type SmisToolDueGenerateResult = SmisPpeDueGenerateResult
export type SmisToolRequisitionStatus = SmisPpeRequisitionStatus
export type SmisToolIssuanceStatus = SmisPpeIssuanceStatus
export type SmisToolPersonalRequisitionItem = SmisPpePersonalRequisitionItem
export type SmisToolPersonalRequisitionSearchParams = SmisPpePersonalRequisitionSearchParams
export type SmisToolPersonalRequisitionOverview = SmisPpePersonalRequisitionOverview
export type SmisToolSetting = SmisPpeSetting
export type SmisToolIssuanceRecordItem = SmisPpeIssuanceRecordItem
export type SmisToolIssuanceRecord = SmisPpeIssuanceRecord
export type SmisToolIssuanceRecordSearchParams = SmisPpeIssuanceRecordSearchParams
export type SmisToolIssuanceRecordOverview = SmisPpeIssuanceRecordOverview
export type SmisToolIssuanceRecordSavePayload = SmisPpeIssuanceRecordSavePayload
export type SmisToolIssuanceStatisticsRow = SmisPpeIssuanceStatisticsRow
export type SmisToolIssuanceStatistics = SmisPpeIssuanceStatistics

export type SmisToolReturnStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected'
export type SmisToolReturnSaveAction = 'add' | 'copy' | 'return'

export interface SmisToolReturnableItem {
  id: string
  issuanceRecordId: string
  issuanceNo: string
  employeeId: string
  employeeNo: string
  employeeName: string
  positionName?: string | null
  organizationId?: string | null
  organizationName?: string | null
  issueDate: string
  materialId: string
  materialCategory?: string | null
  materialName: string
  specificationModel?: string | null
  unit: string
  issuedQuantity: number
  returnableQuantity: number
}

export interface SmisToolReturnItem {
  id?: string
  sourceIssuanceRecordId: string
  sourceIssuanceItemId: string
  sourceIssuanceNo: string
  materialId: string
  materialCategory?: string | null
  materialName: string
  specificationModel?: string | null
  unit: string
  issuedQuantity: number
  returnQuantity: number
  remark?: string | null
}

export interface SmisToolReturn {
  id: string
  returnNo: string
  employeeId: string
  employeeNo: string
  employeeName: string
  positionName?: string | null
  organizationId?: string | null
  organizationName?: string | null
  sourceDocumentNo: string
  returnDate: string
  status: SmisToolReturnStatus
  submittedAt?: string | null
  approvedAt?: string | null
  rejectionReason?: string | null
  remark?: string | null
  createTime?: string | null
  items: SmisToolReturnItem[]
}

export interface SmisToolReturnSearchParams {
  dateRange?: [string, string]
  employeeId?: string
  status?: SmisToolReturnStatus
  keyword?: string
  purpose?: 'list' | 'export'
  from?: number
  to?: number
}

export interface SmisToolReturnableSearchParams {
  employeeId?: string
  keyword?: string
  purpose?: 'list' | 'export'
  from?: number
  to?: number
}

export interface SmisToolReturnOverview {
  total: number
  draft: number
  pendingApproval: number
  approved: number
  rejected: number
}

export interface SmisToolReturnSavePayload {
  id?: string
  returnDate: string
  remark?: string | null
  items: Array<{
    sourceIssuanceItemId: string
    returnQuantity: number
    remark?: string | null
  }>
}

export type SmisAntiViolationStatus = 'enabled' | 'disabled'
export type SmisThreeViolationWarningStatus = 'normal' | 'warning'
export type SmisThreeViolationEducationStatus = 'pending' | 'educated'

export interface SmisViolationCategory {
  id?: string
  tenantId: string
  parentId?: string | null
  parentCategoryName?: string | null
  categoryCode: string
  categoryName: string
  sort: number
  status: SmisAntiViolationStatus
  description?: string | null
  childCount: number
  standardCount: number
  children?: SmisViolationCategory[]
  createBy?: string | null
  createTime?: string
  updateBy?: string | null
  updateTime?: string
}

export interface SmisViolationCategoryOverview {
  total: number
  enabled: number
  rootCount: number
  usedCount: number
}

export interface SmisViolationCategorySearchParams {
  keyword?: string
  status?: SmisAntiViolationStatus
  ancestorId?: string
  purpose?: 'list' | 'export'
  from?: number
  to?: number
}

export interface SmisViolationCategoryListResult {
  records: SmisViolationCategory[]
  total: number
  tree: SmisViolationCategory[]
  overview: SmisViolationCategoryOverview
}

export interface SmisViolationCategorySavePayload {
  id?: string
  parentId?: string | null
  categoryCode: string
  categoryName: string
  sort: number
  status: SmisAntiViolationStatus
  description?: string | null
}

export interface SmisAntiViolationStandard {
  id: string
  tenantId: string
  categoryId: string
  categoryCode: string
  categoryName: string
  standardCode: string
  standardName: string
  deductionPoints: number
  handlingRequirements?: string | null
  legalBasis?: string | null
  status: SmisAntiViolationStatus
  description?: string | null
  createBy?: string | null
  createTime?: string
  updateBy?: string | null
  updateTime?: string
}

export interface SmisAntiViolationStandardOverview {
  total: number
  enabled: number
  disabled: number
  totalPoints: number
}

export interface SmisAntiViolationStandardSearchParams {
  keyword?: string
  status?: SmisAntiViolationStatus
  categoryId?: string
  purpose?: 'list' | 'export'
  from?: number
  to?: number
}

export interface SmisAntiViolationStandardSavePayload {
  id?: string
  operation?: 'add' | 'edit' | 'import'
  categoryId: string
  standardCode: string
  standardName: string
  deductionPoints: number
  handlingRequirements?: string | null
  legalBasis?: string | null
  status: SmisAntiViolationStatus
  description?: string | null
}

export interface SmisAntiViolationOrganization {
  id: string
  parentId?: string | null
  code: string
  name: string
  type?: string
  sort?: number
  children?: SmisAntiViolationOrganization[]
}

export interface SmisAntiViolationStandardOption {
  id: string
  standardCode: string
  standardName: string
  categoryId: string
  categoryName: string
  deductionPoints: number
}

export interface SmisThreeViolationResponsibleEmployee {
  id: string
  employeeNo: string
  employeeName: string
  organizationName?: string | null
  positionName?: string | null
}

export interface SmisThreeViolationEducation {
  id: string
  tenantId: string
  inspectedEmployeeId: string
  checkerEmployeeId: string
  standardId?: string | null
  organizationId?: string | null
  employeeNo: string
  employeeName: string
  avatarUrl?: string | null
  gender?: string | null
  birthDate?: string | null
  age?: number | null
  organizationName?: string | null
  positionName?: string | null
  checkerName: string
  checkerOrganizationName?: string | null
  checkerPositionName?: string | null
  standardCode?: string | null
  standardName?: string | null
  categoryName?: string | null
  warningStatus: SmisThreeViolationWarningStatus
  educationStatus: SmisThreeViolationEducationStatus
  inspectionTime: string
  violationDescription: string
  plannedEducationContent?: string | null
  educationContent?: string | null
  educationResult?: string | null
  educationStartTime?: string | null
  educationCompletedAt?: string | null
  trainingHours?: number | null
  examScore?: number | null
  attachmentUrls: string[]
  educationRemark?: string | null
  remark?: string | null
  responsibleEmployees: SmisThreeViolationResponsibleEmployee[]
  createBy?: string | null
  createTime?: string
  updateBy?: string | null
  updateTime?: string
}

export interface SmisThreeViolationEducationOverview {
  total: number
  pending: number
  educated: number
  warning: number
}

export interface SmisThreeViolationEducationSearchParams {
  keyword?: string
  organizationId?: string
  checkerEmployeeId?: string
  educationStatus?: SmisThreeViolationEducationStatus
  warningStatus?: SmisThreeViolationWarningStatus
  inspectionTimeRange?: [string, string]
  purpose?: 'list' | 'export'
  from?: number
  to?: number
}

export interface SmisThreeViolationEducationListResult {
  records: SmisThreeViolationEducation[]
  total: number
  overview: SmisThreeViolationEducationOverview
  organizations: SmisAntiViolationOrganization[]
  standards: SmisAntiViolationStandardOption[]
}

export interface SmisThreeViolationEducationSavePayload {
  id?: string
  operation?: 'add' | 'edit' | 'copy'
  inspectedEmployeeId: string
  checkerEmployeeId: string
  standardId?: string | null
  warningStatus: SmisThreeViolationWarningStatus
  inspectionTime: string
  violationDescription: string
  plannedEducationContent?: string | null
  responsibleEmployeeIds: string[]
  remark?: string | null
}

export interface SmisThreeViolationEducationRecordPayload {
  educationContent: string
  educationResult: string
  educationStartTime: string
  educationCompletedAt: string
  trainingHours: number
  examScore?: number | null
  responsibleEmployeeIds: string[]
  attachmentUrls: string[]
  educationRemark?: string | null
}

export interface SmisViolationRecordEmployee {
  id: string
  employeeNo: string
  employeeName: string
  avatarUrl?: string | null
  organizationId?: string | null
  organizationName?: string | null
  positionName?: string | null
}

export interface SmisViolationRecordItem {
  id: string
  categoryId?: string | null
  categoryName: string
  standardCode: string
  standardName: string
  deductionPoints: number
}

export interface SmisViolationRecord {
  id: string
  tenantId: string
  recordNo: string
  violationTime: string
  siteId: string
  siteName: string
  siteAddress?: string | null
  checkerEmployeeId: string
  checkerName: string
  checkerOrganizationName?: string | null
  checkerPositionName?: string | null
  deductionPoints: number
  fineAmount: number
  situationDescription?: string | null
  imageUrls: string[]
  remark?: string | null
  violators: SmisViolationRecordEmployee[]
  items: SmisViolationRecordItem[]
  createBy?: string | null
  createTime?: string
  updateBy?: string | null
  updateTime?: string
}

export interface SmisViolationRecordOverview {
  total: number
  violatorCount: number
  deductionPoints: number
  fineAmount: number
}

export interface SmisViolationRecordSearchParams {
  recordNo?: string
  violationKeyword?: string
  violatorEmployeeId?: string
  violationTimeRange?: [string, string]
  purpose?: 'list' | 'export'
  from?: number
  to?: number
}

export interface SmisViolationRecordSavePayload {
  id?: string
  operation?: 'add' | 'edit' | 'copy'
  violationTime: string
  siteId: string
  checkerEmployeeId: string
  violatorEmployeeIds: string[]
  standardIds: string[]
  fineAmount: number
  situationDescription?: string | null
  imageUrls: string[]
  remark?: string | null
}

export type SmisAnnouncementLifecycleStatus = 'draft' | 'published' | 'withdrawn'
export type SmisAnnouncementDisplayStatus = SmisAnnouncementLifecycleStatus | 'expired'
export type SmisAnnouncementAudienceType = 'all' | 'employees' | 'organizations'

export interface SmisAnnouncementCategory {
  id: string
  tenantId: string
  categoryName: string
  sort: number
  status: SmisAntiViolationStatus
  description?: string | null
  announcementCount: number
  createBy?: string | null
  createTime?: string
  updateBy?: string | null
  updateTime?: string
}

export interface SmisAnnouncementCategoryOverview {
  total: number
  enabled: number
  disabled: number
  used: number
}

export interface SmisAnnouncementCategorySearchParams {
  keyword?: string
  status?: SmisAntiViolationStatus
  purpose?: 'list' | 'export'
  from?: number
  to?: number
}

export interface SmisAnnouncementCategorySavePayload {
  id?: string
  categoryName: string
  sort: number
  status: SmisAntiViolationStatus
  description?: string | null
}

export interface SmisAnnouncementCategoryOption {
  id: string
  categoryName: string
}

export interface SmisAnnouncementOrganization {
  id: string
  parentId?: string | null
  organizationCode: string
  organizationName: string
  sort?: number
  children?: SmisAnnouncementOrganization[]
}

export interface SmisAnnouncementAudienceEmployee {
  id: string
  employeeNo: string
  employeeName: string
  organizationName?: string | null
}

export interface SmisAnnouncementAudienceOrganization {
  id: string
  organizationName: string
}

export interface SmisAnnouncement {
  id: string
  tenantId: string
  categoryId: string
  categoryName: string
  title: string
  contentHtml: string
  contentText: string
  lifecycleStatus: SmisAnnouncementLifecycleStatus
  displayStatus: SmisAnnouncementDisplayStatus
  audienceType: SmisAnnouncementAudienceType
  effectiveStartDate: string
  effectiveEndDate?: string | null
  isPinned: boolean
  attachmentUrls: string[]
  publishedAt?: string | null
  publishedByName?: string | null
  withdrawnAt?: string | null
  withdrawnByName?: string | null
  createByName: string
  createOrganizationName?: string | null
  audienceEmployees: SmisAnnouncementAudienceEmployee[]
  audienceOrganizations: SmisAnnouncementAudienceOrganization[]
  myRead: boolean
  readCount: number
  createTime: string
  updateTime: string
}

export interface SmisAnnouncementOverview {
  total: number
  draft: number
  published: number
  expired: number
  unread: number
}

export interface SmisAnnouncementSearchParams {
  keyword?: string
  categoryId?: string
  status?: SmisAnnouncementDisplayStatus
  effectiveDateRange?: [string, string]
  from?: number
  to?: number
}

export interface SmisAnnouncementSavePayload {
  id?: string
  operation?: 'add' | 'edit'
  categoryId: string
  title: string
  contentHtml: string
  contentText: string
  audienceType: SmisAnnouncementAudienceType
  audienceEmployeeIds: string[]
  audienceOrganizationIds: string[]
  effectiveStartDate: string
  effectiveEndDate?: string | null
  isPinned: boolean
  attachmentUrls: string[]
}

export interface SmisAnnouncementReadPerson {
  userId: string
  employeeId?: string | null
  readerName: string
  readAt?: string | null
}

export interface SmisAnnouncementReadOrganization {
  organizationId?: string | null
  organizationName: string
  total: number
  read: number
  unread: number
  readers: SmisAnnouncementReadPerson[]
}

export interface SmisAnnouncementReadStats {
  announcementId: string
  title: string
  total: number
  read: number
  unread: number
  organizations: SmisAnnouncementReadOrganization[]
}

export type SmisDocumentStatus = 'published' | 'draft' | 'void' | 'archived'
export type SmisDocumentScope = 'all' | 'created' | 'following' | 'shared_by_me' | 'shared_to_me'
export type SmisDocumentViewMode = 'tree' | 'folder' | 'list'
export type SmisDocumentImplementationState = 'no_file' | 'scheduled' | 'effective'
export type SmisDocumentDuplicateAction = 'none' | 'replace' | 'keep_both'

export interface SmisDocumentCategory {
  id: string
  parentId?: string | null
  categoryName: string
  sort: number
  status: 'enabled' | 'disabled'
  description?: string | null
  documentCount: number
  createTime?: string
  updateTime?: string
  children?: SmisDocumentCategory[]
}

export interface SmisDocument {
  id: string
  categoryId: string
  categoryName: string
  categoryPath: string
  title: string
  status: SmisDocumentStatus
  summary?: string | null
  creatorUserId: string
  creatorName: string
  versionNo?: number | null
  fileName?: string | null
  fileUrl?: string | null
  fileType?: string | null
  fileSize?: number | null
  effectiveDate?: string | null
  latestEffectiveDate?: string | null
  scheduledEffectiveDate?: string | null
  implementationState: SmisDocumentImplementationState
  isFollowing: boolean
  sharedByMeCount: number
  sharedToMe: boolean
  createBy?: string | null
  createTime?: string
  updateBy?: string | null
  updateTime?: string
}

export interface SmisDocumentOverview {
  total: number
  published: number
  draft: number
  scheduled: number
}

export interface SmisDocumentSearchParams {
  keyword?: string
  status?: SmisDocumentStatus
  categoryId?: string
  scope?: SmisDocumentScope
  ids?: string[]
  purpose?: 'list' | 'export'
  from?: number
  to?: number
}

export interface SmisDocumentCategorySavePayload {
  id?: string
  parentId?: string | null
  categoryName: string
  sort: number
  status: 'enabled' | 'disabled'
  description?: string | null
}

export interface SmisDocumentSavePayload {
  id?: string
  categoryId: string
  title: string
  status: SmisDocumentStatus
  summary?: string | null
  fileName?: string | null
  fileUrl?: string | null
  fileType?: string | null
  fileSize?: number | null
  effectiveDate?: string | null
  replacementNote?: string | null
  duplicateAction?: SmisDocumentDuplicateAction
  duplicateDocumentId?: string | null
}

export interface SmisDocumentDuplicate {
  id: string
  title: string
  status: SmisDocumentStatus
  categoryId: string
  fileName: string
  versionNo: number
  effectiveDate: string
  updateTime?: string
}

export interface SmisDocumentSaveResult {
  id: string
  versionNo?: number | null
  replaced: boolean
}

export type SmisDocumentRegisterKind =
  'required_knowledge' | 'safety_management_system' | 'legal_regulation'

export interface SmisDocumentRegister {
  id: string
  documentKind: SmisDocumentRegisterKind
  categoryId: string
  categoryName: string
  categoryPath: string
  fileName: string
  documentCode: string
  status: SmisDocumentStatus
  effectiveDate: string
  promulgationDate?: string | null
  obtainedDate?: string | null
  obtainedOrganizationId?: string | null
  obtainedOrganizationName?: string | null
  isSpecialEquipment: boolean
  attachmentName?: string | null
  attachmentUrl?: string | null
  attachmentType?: string | null
  attachmentSize?: number | null
  versionNo?: number | null
  remark?: string | null
  evaluationCount: number
  lastEvaluationDate?: string | null
  createBy?: string | null
  createTime?: string
  updateBy?: string | null
  updateTime?: string
}

export interface SmisDocumentRegisterOverview {
  total: number
  withAttachment: number
  specialEquipment: number
  evaluated: number
}

export interface SmisDocumentRegisterSearchParams {
  fileName?: string
  documentCode?: string
  categoryId?: string
  kind: SmisDocumentRegisterKind
  isSpecialEquipment?: boolean
  obtainedDateRange?: string[]
  evaluationDateRange?: string[]
  ids?: string[]
  purpose?: 'list' | 'export'
  from?: number
  to?: number
}

export interface SmisDocumentRegisterSavePayload {
  id?: string
  kind: SmisDocumentRegisterKind
  categoryId: string
  fileName: string
  documentCode: string
  effectiveDate: string
  promulgationDate?: string | null
  obtainedDate?: string | null
  obtainedOrganizationId?: string | null
  isSpecialEquipment: boolean
  attachmentName?: string | null
  attachmentUrl?: string | null
  attachmentType?: string | null
  attachmentSize?: number | null
  remark?: string | null
  copySourceId?: string | null
}

export interface SmisLegalComplianceEvaluation {
  id: string
  legalDocumentId: string
  relatedClause: string
  controlStatus: string
  evaluationConclusion: string
  evaluationDate: string
  evaluatorName: string
  remark?: string | null
  createBy?: string | null
  createTime?: string
  updateBy?: string | null
  updateTime?: string
}

export interface SmisLegalComplianceEvaluationSearchParams {
  documentId: string
  keyword?: string
  from?: number
  to?: number
}

export interface SmisLegalComplianceEvaluationSavePayload {
  id?: string
  documentId: string
  relatedClause: string
  controlStatus: string
  evaluationConclusion: string
  evaluationDate: string
  evaluatorName: string
  remark?: string | null
  copySourceId?: string | null
}
