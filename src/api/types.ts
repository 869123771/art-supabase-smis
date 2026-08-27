export interface SmisPositionOption {
  id: string
  tenantId: string
  positionCode: string
  positionName: string
  positionKind: 'standard' | 'driver'
  description?: string | null
  sort: number
  employeeCount: number
  controlCount?: number
}

export interface SmisPositionSearchParams {
  organizationId?: string
  keyword?: string
  from?: number
  to?: number
}

export interface PositionSafetyResponsibility {
  id?: string
  organizationId: string
  positionId: string
  primaryHazardCategory: string
  secondaryHazardCategory: string
  hazardContent: string | null
  hazardLevel: string
  riskLevel: string
  inspectionItem: string
  inspectionStandard: string
  inspectionFrequency: number
  frequencyUnit: string
  revisionDate: string
  createBy?: string | null
  createTime?: string
  updateBy?: string | null
  updateTime?: string
}

export interface PositionSafetyResponsibilitySearchParams {
  organizationId?: string
  positionId: string
  primaryHazardCategory?: string
  hazardLevel?: string
  keyword?: string
  from?: number
  to?: number
}

export type PositionSafetyResponsibilitySavePayload = Omit<
  PositionSafetyResponsibility,
  'id' | 'createBy' | 'createTime' | 'updateBy' | 'updateTime'
>

export interface PositionRiskControl {
  id?: string
  organizationId: string
  positionId: string
  hazardFactor: string
  controlMeasure: string
  controlMeasureCategory: string
  controlLevel: string
  standardBasis: string
  failureMode: string
  primaryHazardCategory: string
  secondaryHazardCategory: string
  hazardLevel: string
  isSpecialEquipment: boolean
  createBy?: string | null
  createTime?: string
  updateBy?: string | null
  updateTime?: string
}

export interface PositionRiskControlSearchParams {
  organizationId: string
  positionId: string
  controlMeasureCategory?: string
  controlLevel?: string
  hazardLevel?: string
  isSpecialEquipment?: string
  keyword?: string
  from?: number
  to?: number
}

export type PositionRiskControlSavePayload = Omit<
  PositionRiskControl,
  'id' | 'createBy' | 'createTime' | 'updateBy' | 'updateTime'
>

export interface WorkInstructionOrganization {
  id: string
  parentId?: string | null
  organizationCode: string
  organizationName: string
  organizationType: string
  sort: number
}

export interface WorkInstructionPosition {
  scopeKey: string
  organizationId: string
  positionId: string
  positionCode: string
  positionName: string
  sort: number
  employeeCount: number
  instructionCount: number
}

export interface WorkInstructionPositionTree {
  organizations: WorkInstructionOrganization[]
  positions: WorkInstructionPosition[]
}

export interface WorkInstructionScope {
  scopeKey: string
  organizationId: string
  organizationName: string
  organizationCode: string
  positionId: string
  positionName: string
  positionCode: string
}

export interface PositionWorkInstruction {
  id?: string
  tenantId?: string
  instructionName: string
  fileNumber?: string | null
  fileType?: string | null
  uploadDate?: string | null
  versionNo?: string | null
  fileUrl?: string | null
  originalFileName?: string | null
  scopes: WorkInstructionScope[]
  createBy?: string | null
  createTime?: string
  updateBy?: string | null
  updateTime?: string
}

export interface PositionWorkInstructionSearchParams {
  keyword?: string
  fileType?: string
  organizationId?: string
  positionId?: string
  from?: number
  to?: number
}

export interface PositionWorkInstructionSavePayload {
  id?: string
  instructionName: string
  fileNumber?: string
  fileType?: string
  uploadDate?: string
  versionNo?: string
  fileUrl?: string
  originalFileName?: string
  scopes: Array<Pick<WorkInstructionScope, 'organizationId' | 'positionId'>>
}

export interface LeaveInformationEmployee {
  id: string
  tenantId?: string
  organizationId?: string | null
  employeeNo: string
  employeeName: string
  avatarUrl?: string | null
  jobTitle?: string | null
  employmentStatus?: string
  organization?: {
    id?: string
    organizationCode?: string
    organizationName?: string
  } | null
}

export interface LeaveInformationOrganization {
  id: string
  organizationCode: string
  organizationName: string
}

export interface LeaveInformation {
  id?: string
  requestNo?: string
  organizationId: string
  employeeId: string
  leaveTypeId?: string
  leaveTypeCode: string
  leaveTypeName?: string
  startDate: string
  endDate: string
  requestedAmount?: number
  reason: string
  isProxy: boolean
  proxyEmployeeId?: string | null
  applicantIdCardNo?: string
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled'
  organization?: LeaveInformationOrganization | null
  applicant: LeaveInformationEmployee
  proxyEmployee?: LeaveInformationEmployee | null
  createBy?: string | null
  createTime?: string
  updateBy?: string | null
  updateTime?: string
}

export interface LeaveInformationSearchParams {
  organizationId?: string
  companyKeyword?: string
  applicantKeyword?: string
  startDate?: string
  endDate?: string
  from?: number
  to?: number
}

export interface LeaveInformationOverview {
  total: number
  currentMonth: number
  proxyCount: number
  organizationCount: number
  latestUpdateTime?: string | null
}

export interface LeaveInformationSavePayload {
  id?: string
  organizationId: string
  employeeId: string
  leaveTypeCode: string
  startDate: string
  endDate: string
  reason: string
  isProxy: boolean
  proxyEmployeeId?: string | null
}

export interface SmisOrganizationSummary {
  id: string
  organizationCode: string
  organizationName: string
  organizationType?: string
  parentOrganizationName?: string | null
}

export interface StatutoryHoliday {
  id?: string
  organizationId: string
  holidayType: string
  startDate: string
  endDate: string
  remark?: string | null
  organization: SmisOrganizationSummary
  createTime?: string
  updateTime?: string
}

export interface StatutoryHolidaySearchParams {
  organizationId?: string
  holidayType?: string
  year?: number
  from?: number
  to?: number
}

export interface StatutoryHolidaySavePayload {
  id?: string
  organizationId: string
  holidayType: string
  startDate: string
  endDate: string
  remark?: string
}

export interface SiteResponsibleEmployee {
  id: string
  employeeNo: string
  employeeName: string
  phone: string
  jobTitle?: string | null
}

export interface SmisSite {
  id?: string
  parentId?: string | null
  organizationId: string
  siteName: string
  categoryCode: string
  sort: number
  responsibleEmployeeId?: string | null
  addressDetail?: string | null
  longitude?: number | string | null
  latitude?: number | string | null
  coordinateSystem: string
  imageUrls: string[]
  remark?: string | null
  parentSiteName?: string | null
  organization: SmisOrganizationSummary
  responsible?: SiteResponsibleEmployee | null
  children?: SmisSite[]
  createTime?: string
  updateTime?: string
}

export interface SmisSiteSearchParams {
  keyword?: string
  organizationId?: string
  categoryCode?: string
}

export interface SmisSiteSavePayload {
  id?: string
  parentId?: string | null
  organizationId: string
  siteName: string
  categoryCode: string
  sort: number
  responsibleEmployeeId?: string | null
  addressDetail?: string
  longitude?: number | string | null
  latitude?: number | string | null
  coordinateSystem?: string
  imageUrls: string[]
  remark?: string
}

export interface SmisSiteBatchCreatePayload extends Omit<
  SmisSiteSavePayload,
  'id' | 'organizationId'
> {
  organizationIds: string[]
}

export type SmisInspectionCategoryStatus = 'enabled' | 'disabled'

export interface SmisInspectionCategory {
  id?: string
  tenantId: string
  tenantName?: string
  tenantCode?: string
  categoryCode: string
  categoryName: string
  remark?: string | null
  status: SmisInspectionCategoryStatus
  createBy?: string | null
  createTime?: string
  updateBy?: string | null
  updateTime?: string
}

export interface SmisInspectionCategorySearchParams {
  keyword?: string
  status?: SmisInspectionCategoryStatus
  tenantId?: string | null
  from?: number
  to?: number
}

export interface SmisInspectionCategoryOverview {
  total: number
  enabled: number
  disabled: number
  recentlyUpdated: number
}

export interface SmisInspectionCategorySavePayload {
  id?: string
  tenantId?: string | null
  categoryCode: string
  categoryName: string
  remark?: string
  status: SmisInspectionCategoryStatus
}

export type SmisEquipmentCategoryStatus = 'enabled' | 'disabled'

export interface SmisEquipmentInspectionCategory {
  id: string
  categoryCode: string
  categoryName: string
  status: SmisInspectionCategoryStatus
}

export interface SmisEquipmentCategory {
  id?: string
  parentId?: string | null
  parentCategoryName?: string | null
  categoryCode: string
  categoryName: string
  categoryShortName?: string | null
  remark?: string | null
  status: SmisEquipmentCategoryStatus
  childCount: number
  inspectionCategories: SmisEquipmentInspectionCategory[]
  children?: SmisEquipmentCategory[]
  createBy?: string | null
  createTime?: string
  updateBy?: string | null
  updateTime?: string
}

export interface SmisEquipmentCategorySearchParams {
  keyword?: string
  status?: SmisEquipmentCategoryStatus
  ancestorId?: string
  from?: number
  to?: number
}

export interface SmisEquipmentCategoryOverview {
  total: number
  enabled: number
  rootCount: number
  linkedCount: number
}

export interface SmisEquipmentCategorySavePayload {
  id?: string
  parentId?: string | null
  categoryCode: string
  categoryName: string
  categoryShortName?: string
  inspectionCategoryIds: string[]
  remark?: string
  status: SmisEquipmentCategoryStatus
}

export type SmisStorageLocationStatus = 'enabled' | 'disabled'

export interface SmisStorageLocationResponsible {
  id: string
  employeeNo: string
  employeeName: string
  jobTitle?: string | null
  employmentStatus: string
  organizationId?: string | null
  organizationCode?: string | null
  organizationName?: string | null
}

export interface SmisStorageLocation {
  id?: string
  parentId?: string | null
  organizationId: string
  responsibleEmployeeId?: string | null
  locationCode: string
  locationName: string
  locationShortName?: string | null
  detailLocation?: string | null
  remark?: string | null
  status: SmisStorageLocationStatus
  parentLocationName?: string | null
  childCount: number
  organization: SmisOrganizationSummary
  responsible?: SmisStorageLocationResponsible | null
  children?: SmisStorageLocation[]
  createBy?: string | null
  createTime?: string
  updateBy?: string | null
  updateTime?: string
}

export interface SmisStorageLocationSearchParams {
  keyword?: string
  status?: SmisStorageLocationStatus
  ancestorId?: string
  from?: number
  to?: number
}

export interface SmisStorageLocationOverview {
  total: number
  enabled: number
  rootCount: number
  managedCount: number
}

export interface SmisStorageLocationSavePayload {
  id?: string
  parentId?: string | null
  organizationId: string
  responsibleEmployeeId?: string | null
  locationCode: string
  locationName: string
  locationShortName?: string
  detailLocation?: string
  remark?: string
  status: SmisStorageLocationStatus
}

export interface SmisSupplier {
  id?: string
  supplierCode: string
  supplierName: string
  supplierCategory: string
  supplierGroup?: string | null
  supplierType: string
  enterpriseNature?: string | null
  industry?: string | null
  contactPerson?: string | null
  contactPhone?: string | null
  region?: string | null
  regionAdcode?: string | null
  addressDetail?: string | null
  longitude?: number | string | null
  latitude?: number | string | null
  coordinateSystem: string
  remark?: string | null
  createBy?: string | null
  createTime?: string
  updateBy?: string | null
  updateTime?: string
}

export interface SmisSupplierSearchParams {
  keyword?: string
  supplierCategory?: string
  supplierType?: string
  enterpriseNature?: string
  industry?: string
  ids?: string[]
  purpose?: 'list' | 'export'
  from?: number
  to?: number
}

export interface SmisSupplierOverview {
  total: number
  keySuppliers: number
  categoryCount: number
  contactComplete: number
}

export type SmisSupplierSavePayload = Omit<
  SmisSupplier,
  'createBy' | 'createTime' | 'updateBy' | 'updateTime'
>

export type SmisEquipmentKind = 'general' | 'boiler' | 'pressure_gauge' | 'safety_valve'
export type SmisEquipmentUseStatus = 'in_use' | 'stopped' | 'scrapped' | 'dismantled' | 'installing'
export type SmisEquipmentOperationStatus = 'normal' | 'maintenance' | 'fault' | 'idle'
export type SmisEquipmentAssetStatus = 'active' | 'pending_disposal' | 'disposed'
export type SmisEquipmentImportanceLevel = string
export type SmisEquipmentStatus = 'enabled' | 'disabled'

export interface SmisEquipmentBoiler {
  boilerType: 'water' | 'steam'
  registrationCode?: string | null
  useCertificateNo?: string | null
  internalNo?: string | null
  ratedEvaporation?: number | string | null
  designPressure?: number | string | null
  workingPressure?: number | string | null
  workingTemperature?: number | string | null
  fuelType?: string | null
  purpose?: string | null
  maintenanceOrganization?: string | null
  installationOrganization?: string | null
}

export interface SmisEquipment {
  id: string
  categoryId: string
  locationId?: string | null
  usingOrganizationId: string
  managingOrganizationId: string
  responsibleEmployeeId?: string | null
  supplierId?: string | null
  equipmentCode: string
  equipmentName: string
  equipmentShortName?: string | null
  equipmentKind: SmisEquipmentKind
  specification?: string | null
  model?: string | null
  manufacturer?: string | null
  factoryNo?: string | null
  manufactureDate?: string | null
  installationDate?: string | null
  commissioningDate?: string | null
  enableDate?: string | null
  useStatus: SmisEquipmentUseStatus
  operationStatus: SmisEquipmentOperationStatus
  assetStatus: SmisEquipmentAssetStatus
  importanceLevel: SmisEquipmentImportanceLevel
  assetOriginalValue?: number | string | null
  serviceLifeYears?: number | string | null
  netValue?: number | string | null
  fixedAssetNo?: string | null
  erpCode?: string | null
  electronicTagCode?: string | null
  qrToken: string
  isMajorHazardSource: boolean
  isSpecialEquipment: boolean
  remark?: string | null
  status: SmisEquipmentStatus
  category: Pick<SmisEquipmentCategory, 'id' | 'categoryCode' | 'categoryName'>
  location?: Pick<
    SmisStorageLocation,
    'id' | 'locationCode' | 'locationName' | 'detailLocation'
  > | null
  usingOrganization: SmisOrganizationSummary
  managingOrganization: SmisOrganizationSummary
  responsible?: SmisStorageLocationResponsible | null
  supplier?: Pick<SmisSupplier, 'id' | 'supplierCode' | 'supplierName'> | null
  boiler?: SmisEquipmentBoiler | null
  pressureGaugeIds: string[]
  safetyValveIds: string[]
  attachmentCount: number
  inspectionCount: number
  nextInspectionDueDate?: string | null
  createBy?: string | null
  createTime?: string
  updateBy?: string | null
  updateTime?: string
}

export interface SmisEquipmentSearchParams {
  keyword?: string
  categoryId?: string
  locationId?: string
  equipmentKind?: SmisEquipmentKind
  model?: string
  operationStatus?: SmisEquipmentOperationStatus
  supplierId?: string
  importanceLevel?: SmisEquipmentImportanceLevel
  enableDateFrom?: string
  enableDateTo?: string
  assetStatus?: SmisEquipmentAssetStatus
  useStatus?: SmisEquipmentUseStatus
  from?: number
  to?: number
}

export interface SmisEquipmentOverview {
  total: number
  inUse: number
  boilerCount: number
  dueSoon: number
}

export type SmisEquipmentInspectionConclusion =
  'operable' | 'inoperable' | 'operable_after_rectification'
export type SmisEquipmentInspectionStatus = 'planned' | 'completed' | 'overdue' | 'cancelled'

export interface SmisEquipmentInspectionImage {
  attachmentId: string
  sort: number
  originName: string
  url: string
  mimeType?: string | null
  suffix?: string | null
  sizeInfo?: string | null
}

export interface SmisEquipmentInspectionEquipment {
  id: string
  equipmentCode: string
  equipmentName: string
  equipmentKind: SmisEquipmentKind
  model?: string | null
  categoryName: string
  organizationId: string
  organizationName: string
}

export interface SmisEquipmentInspection {
  id: string
  equipmentId: string
  inspectionCategoryId: string
  inspectionInstitutionId: string
  inspectionNo: string
  inspectionDate: string
  conclusion: SmisEquipmentInspectionConclusion
  nextDueDate?: string | null
  needsExtension: boolean
  extensionDate?: string | null
  reminderMonths: 1 | 2 | 3
  status: SmisEquipmentInspectionStatus
  remark?: string | null
  equipment: SmisEquipmentInspectionEquipment
  inspectionCategory: Pick<SmisInspectionCategory, 'id' | 'categoryCode' | 'categoryName'>
  inspectionInstitution?: Pick<SmisSupplier, 'id' | 'supplierCode' | 'supplierName'> | null
  images: SmisEquipmentInspectionImage[]
  createBy?: string | null
  createTime?: string
  updateBy?: string | null
  updateTime?: string
}

export interface SmisEquipmentInspectionSearchParams {
  keyword?: string
  equipmentId?: string
  organizationId?: string
  inspectionCategoryId?: string
  status?: SmisEquipmentInspectionStatus
  from?: number
  to?: number
}

export interface SmisEquipmentInspectionOverview {
  total: number
  completed: number
  dueSoon: number
  imageCount: number
}

export interface SmisEquipmentInspectionSavePayload {
  id?: string
  equipmentId: string
  inspectionCategoryId: string
  inspectionInstitutionId: string
  inspectionNo?: string
  inspectionDate: string
  conclusion: SmisEquipmentInspectionConclusion
  nextDueDate?: string | null
  needsExtension: boolean
  extensionDate?: string | null
  reminderMonths: 1 | 2 | 3
  status: SmisEquipmentInspectionStatus
  remark?: string
  imageAttachmentIds: string[]
}

export interface SmisSpecialEquipmentAnalysisRow {
  organizationId: string
  organizationName: string
  categoryId: string
  categoryName: string
  count: number
}

export interface SmisSpecialEquipmentCategoryStat {
  categoryId: string
  categoryName: string
  count: number
}

export interface SmisSpecialEquipmentAnalysisOverview {
  total: number
  organizationCount: number
  categoryCount: number
  boilerCount: number
  majorHazardCount: number
}

export interface SmisSpecialEquipmentAnalysis {
  rows: SmisSpecialEquipmentAnalysisRow[]
  categories: SmisSpecialEquipmentCategoryStat[]
  organizations: WorkInstructionOrganization[]
  overview: SmisSpecialEquipmentAnalysisOverview
}

export interface SmisEquipmentSavePayload extends Omit<
  SmisEquipment,
  | 'id'
  | 'qrToken'
  | 'category'
  | 'location'
  | 'usingOrganization'
  | 'managingOrganization'
  | 'responsible'
  | 'supplier'
  | 'attachmentCount'
  | 'inspectionCount'
  | 'nextInspectionDueDate'
  | 'createBy'
  | 'createTime'
  | 'updateBy'
  | 'updateTime'
> {
  id?: string
}

export type SmisEquipmentDepreciationMethod =
  'double_declining_balance' | 'sum_of_years_digits' | 'straight_line'
export type SmisEquipmentDepreciationStatus = 'active' | 'stopped'

export interface SmisEquipmentDepreciationEquipment {
  id: string
  equipmentCode: string
  equipmentName: string
  model?: string | null
  assetOriginalValue?: number | string | null
  serviceLifeYears?: number | string | null
  categoryName: string
  locationName?: string | null
}

export interface SmisEquipmentDepreciation {
  id: string
  depreciationNo: string
  equipmentId: string
  depreciationMethod: SmisEquipmentDepreciationMethod
  depreciationStartDate: string
  originalValue: number | string
  residualRate: number | string
  usefulLifeYears: number | string
  accumulatedDepreciation: number | string
  netValue: number | string
  remark?: string | null
  status: SmisEquipmentDepreciationStatus
  equipment: SmisEquipmentDepreciationEquipment
  createBy?: string | null
  createTime?: string
  updateBy?: string | null
  updateTime?: string
}

export interface SmisEquipmentDepreciationSearchParams {
  keyword?: string
  depreciationMethod?: SmisEquipmentDepreciationMethod
  status?: SmisEquipmentDepreciationStatus
  from?: number
  to?: number
}

export interface SmisEquipmentDepreciationOverview {
  total: number
  active: number
  totalOriginalValue: number | string
  totalNetValue: number | string
}

export interface SmisEquipmentDepreciationSavePayload extends Omit<
  SmisEquipmentDepreciation,
  'id' | 'equipment' | 'createBy' | 'createTime' | 'updateBy' | 'updateTime'
> {
  id?: string
}

export type SmisEquipmentReminderChannel = 'wecom' | 'dingtalk' | 'mobile_push' | 'sms'
export interface SmisEquipmentReminderResponsible {
  id: string
  employeeNo: string
  employeeName: string
  phone?: string | null
  organizationId?: string | null
  organizationName?: string | null
}
export interface SmisEquipmentReminderConfig {
  id?: string
  equipmentId: string
  responsibleEmployeeId: string
  reminderDays: number[]
  channels: SmisEquipmentReminderChannel[]
  messageTemplate: string
  enabled: boolean
  responsible?: SmisEquipmentReminderResponsible | null
}
export interface SmisEquipmentReminderDelivery {
  id: string
  channel: SmisEquipmentReminderChannel
  status: 'pending' | 'processing' | 'sent' | 'failed' | 'cancelled'
  dueDate: string
  leadDays: number
  messageContent: string
  scheduledTime: string
  sentTime?: string | null
  lastError?: string | null
}
export interface SmisEquipmentReminderDetail {
  config?: SmisEquipmentReminderConfig | null
  recentDeliveries: SmisEquipmentReminderDelivery[]
}

export interface SmisEquipmentAttachment {
  equipmentId: string
  attachmentId: string
  attachmentType: string
  remark?: string | null
  attachment: {
    id: string
    originName: string
    mimeType?: string | null
    suffix?: string | null
    sizeInfo?: string | null
    url: string
    createTime?: string
  }
}

export type SmisHazardSourceLevel = 'level_1' | 'level_2' | 'level_3' | 'level_4'
export type SmisHazardSourceRiskLevel = 'major' | 'high' | 'general' | 'low' | 'unidentified'
export type SmisBusinessRecordStatus = 'draft' | 'submitted'

export interface SmisTreeOrganization {
  id: string
  parentId?: string | null
  organizationName: string
  organizationType: string
  sort: number
  children?: SmisTreeOrganization[]
}

export interface SmisHazardSite {
  id: string
  parentId?: string | null
  siteName: string
  organizationId: string
  sort: number
  children?: SmisHazardSite[]
}

export interface SmisHazardSource {
  id: string
  hazardNo: string
  hazardName: string
  siteId: string
  siteName: string
  hazardLevel: SmisHazardSourceLevel
  riskLevel: SmisHazardSourceRiskLevel
  controlOrganizationId: string
  controlOrganizationName: string
  responsibleEmployeeId?: string | null
  responsibleEmployeeName?: string | null
  responsibleEmployeeNo?: string | null
  imageUrls: string[]
  recordStatus: SmisBusinessRecordStatus
  remark?: string | null
  createTime?: string
  updateTime?: string
}

export interface SmisHazardSourceSearchParams {
  keyword?: string
  siteId?: string
  hazardLevel?: SmisHazardSourceLevel
  riskLevel?: SmisHazardSourceRiskLevel
  organizationId?: string
  from?: number
  to?: number
}

export interface SmisHazardSourceOverview {
  total: number
  submitted: number
  majorRisk: number
  siteCount: number
}

export interface SmisHazardSourceListResult {
  records: SmisHazardSource[]
  total: number
  overview: SmisHazardSourceOverview
  sites: SmisHazardSite[]
  organizations: SmisTreeOrganization[]
}

export interface SmisHazardSourceSavePayload {
  id?: string
  hazardNo?: string
  hazardName: string
  siteId: string
  hazardLevel: SmisHazardSourceLevel
  riskLevel: SmisHazardSourceRiskLevel
  controlOrganizationId: string
  responsibleEmployeeId?: string | null
  imageUrls: string[]
  remark?: string
}

export interface SmisHazardSourceStatistic {
  hazardLevel: SmisHazardSourceLevel
  count: number
}

export interface SmisHazardSourceStatistics {
  rows: SmisHazardSourceStatistic[]
  total: number
}

export type SmisEmergencyPlanCategory = 'comprehensive' | 'onsite' | 'special'
export type SmisEmergencyPlanFrequency =
  | 'once_per_shift'
  | 'daily'
  | 'weekly'
  | 'biweekly'
  | 'triweekly'
  | 'monthly'
  | 'bimonthly'
  | 'quarterly'
  | 'semiannual'
export type SmisEmergencyPlanLevel = 'company' | 'operation_department' | 'operation_area' | 'team'
export type SmisEmergencyPlanWarningStatus = 'normal' | 'warning'

export interface SmisEmergencyPosition {
  id: string
  positionCode: string
  positionName: string
  organizationId?: string | null
}

export interface SmisEmergencyRescuePlan {
  id: string
  planNo: string
  planName: string
  applicableOrganizationId: string
  applicableOrganizationName: string
  planCategory: SmisEmergencyPlanCategory
  applicablePositionId?: string | null
  applicablePositionName?: string | null
  frequency: SmisEmergencyPlanFrequency
  isSpecialEquipmentDrill: boolean
  planLevel: SmisEmergencyPlanLevel
  isValid: boolean
  warningStatus: SmisEmergencyPlanWarningStatus
  recordStatus: SmisBusinessRecordStatus
  description?: string | null
  drillDraftCount: number
  createTime?: string
  updateTime?: string
}

export interface SmisEmergencyRescuePlanSearchParams {
  keyword?: string
  planCategory?: SmisEmergencyPlanCategory
  organizationId?: string
  isValid?: boolean
  warningStatus?: SmisEmergencyPlanWarningStatus
  from?: number
  to?: number
}

export interface SmisEmergencyRescuePlanOverview {
  total: number
  valid: number
  warning: number
  submitted: number
}

export interface SmisEmergencyRescuePlanListResult {
  records: SmisEmergencyRescuePlan[]
  total: number
  overview: SmisEmergencyRescuePlanOverview
  organizations: SmisTreeOrganization[]
  positions: SmisEmergencyPosition[]
}

export interface SmisEmergencyRescuePlanSavePayload {
  id?: string
  planNo?: string
  planName: string
  applicableOrganizationId: string
  planCategory: SmisEmergencyPlanCategory
  applicablePositionId?: string | null
  frequency: SmisEmergencyPlanFrequency
  isSpecialEquipmentDrill: boolean
  warningStatus: SmisEmergencyPlanWarningStatus
  description?: string
}
