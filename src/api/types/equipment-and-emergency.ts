import type {
  SmisEquipmentCategory,
  SmisEquipmentProfileType,
  SmisInspectionCategory,
  SmisOrganizationSummary,
  SmisStorageLocation,
  SmisStorageLocationResponsible,
  SmisSupplier,
  WorkInstructionOrganization
} from './foundation'

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
  sort: number
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
  profileType?: SmisEquipmentProfileType
  specification?: string | null
  model?: string | null
  manufacturer?: string | null
  factoryNo?: string | null
  registrationCode?: string | null
  internalNo?: string | null
  useCertificateNo?: string | null
  detailLocation?: string | null
  maintenanceOrganization?: string | null
  installationOrganization?: string | null
  designOrganization?: string | null
  maintenanceQualificationUrl?: string | null
  useRegistrationCertificateUrl?: string | null
  nameplateUrl?: string | null
  photoUrl?: string | null
  specialParameters?: Record<string, string | number | boolean | null>
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
  category: Pick<SmisEquipmentCategory, 'id' | 'categoryCode' | 'categoryName' | 'profileType'>
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
  organizationCode?: string
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
  quantity?: number | null
  location?: string | null
  evaluationDate?: string | null
  evaluationOrganization?: string | null
  filingDate?: string | null
  filingOrganization?: string | null
  filingNo?: string | null
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
  quantity?: number | null
  location?: string | null
  evaluationDate?: string | null
  evaluationOrganization?: string | null
  filingDate?: string | null
  filingOrganization?: string | null
  filingNo?: string | null
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
  planVersion?: string | null
  applicableOrganizationId: string
  applicableOrganizationName: string
  applicableOrganizationCode?: string | null
  isPublicScope: boolean
  planCategory: SmisEmergencyPlanCategory
  applicablePositionId?: string | null
  applicablePositionName?: string | null
  applicablePositionIds: string[]
  applicablePositions: SmisEmergencyPosition[]
  frequency: SmisEmergencyPlanFrequency
  reviewDate?: string | null
  reviewExperts?: string | null
  nextReviewDate?: string | null
  lastDrillDate?: string | null
  reviewRequiredAfterDrill?: boolean | null
  planAttachmentUrls: string[]
  filingAttachmentUrls: string[]
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
  planVersion: string
  applicableOrganizationId: string
  planCategory: SmisEmergencyPlanCategory
  applicablePositionIds: string[]
  frequency: SmisEmergencyPlanFrequency
  reviewDate: string
  reviewExperts: string
  planAttachmentUrls: string[]
  filingAttachmentUrls: string[]
  isSpecialEquipmentDrill: boolean
  description?: string
}

export type SmisEmergencyDrillForm = 'onsite' | 'desktop'
export type SmisEmergencyDrillPlanStatus = 'draft' | 'planned' | 'completed' | 'cancelled'
export type SmisEmergencyDrillRecordStatus = 'draft' | 'submitted'

export interface SmisEmergencyEmployeeSnapshot {
  id: string
  tenantId: string
  organizationId?: string | null
  employeeNo: string
  employeeName: string
  jobTitle?: string | null
  phone?: string | null
  employmentStatus: string
  organization?: { id?: string; organizationCode?: string; organizationName?: string } | null
}

export interface SmisEmergencyDrillPlan {
  id: string
  planNo: string
  drillName: string
  sourcePlanId: string
  sourcePlanNo: string
  sourcePlanName: string
  compilationOrganizationId: string
  compilationOrganizationName: string
  applicableOrganizationId: string
  applicableOrganizationName: string
  drillForm: SmisEmergencyDrillForm
  planCategory: SmisEmergencyPlanCategory
  responsibleEmployeeId?: string | null
  responsibleEmployeeNo?: string | null
  responsibleEmployeeName?: string | null
  planStartDate?: string | null
  planEndDate?: string | null
  drillLocation?: string | null
  drillSubject?: string | null
  drillPurpose?: string | null
  planLevel: SmisEmergencyPlanLevel
  isSpecialEquipmentDrill: boolean
  attachmentUrls: string[]
  remark?: string | null
  status: SmisEmergencyDrillPlanStatus
  warningStatus: SmisEmergencyPlanWarningStatus
  recordId?: string | null
  recordStatus?: SmisEmergencyDrillRecordStatus | null
  actualStartDate?: string | null
  trainees: SmisEmergencyEmployeeSnapshot[]
  createTime?: string
  updateTime?: string
}

export interface SmisEmergencyDrillPlanSearchParams {
  keyword?: string
  status?: SmisEmergencyDrillPlanStatus
  drillForm?: SmisEmergencyDrillForm
  planCategory?: SmisEmergencyPlanCategory
  organizationId?: string
  warningStatus?: SmisEmergencyPlanWarningStatus
  from?: number
  to?: number
}

export interface SmisEmergencyDrillPlanOverview {
  total: number
  planned: number
  completed: number
  warning: number
}

export interface SmisEmergencyDrillPlanListResult {
  records: SmisEmergencyDrillPlan[]
  total: number
  overview: SmisEmergencyDrillPlanOverview
  organizations: SmisTreeOrganization[]
}

export interface SmisEmergencyDrillPlanSavePayload {
  id?: string
  planNo?: string
  drillName: string
  sourcePlanId: string
  compilationOrganizationId: string
  applicableOrganizationId: string
  drillForm: SmisEmergencyDrillForm
  planCategory: SmisEmergencyPlanCategory
  responsibleEmployeeId?: string | null
  planStartDate?: string
  planEndDate?: string
  drillLocation?: string
  drillSubject?: string
  drillPurpose?: string
  isSpecialEquipmentDrill: boolean
  attachmentUrls: string[]
  traineeIds: string[]
  remark?: string
}

export interface SmisEmergencyDrillPlanOption {
  id: string
  planNo: string
  drillName: string
  sourcePlanName: string
  drillForm: SmisEmergencyDrillForm
  planCategory: SmisEmergencyPlanCategory
  planLevel: SmisEmergencyPlanLevel
  applicableOrganizationId: string
  applicableOrganizationName: string
  responsibleEmployeeName?: string | null
  planStartDate?: string | null
  planEndDate?: string | null
  drillLocation?: string | null
  drillSubject?: string | null
  drillPurpose?: string | null
}

export interface SmisEmergencyDrillRecord {
  id: string
  drillPlanId: string
  planNo: string
  drillName: string
  sourcePlanName: string
  drillForm: SmisEmergencyDrillForm
  planCategory: SmisEmergencyPlanCategory
  planLevel: SmisEmergencyPlanLevel
  applicableOrganizationId: string
  applicableOrganizationName: string
  responsibleEmployeeName?: string | null
  planStartDate?: string | null
  planEndDate?: string | null
  actualStartDate?: string | null
  actualEndDate?: string | null
  drillLocation?: string | null
  drillSubject?: string | null
  drillPurpose?: string | null
  drillProcess?: string | null
  drillSummary?: string | null
  drillEvaluation?: string | null
  drillTeam?: string | null
  equipmentMaterials?: string | null
  imageUrls: string[]
  attachmentUrls: string[]
  status: SmisEmergencyDrillRecordStatus
  remark?: string | null
  participants: SmisEmergencyEmployeeSnapshot[]
  createTime?: string
  updateTime?: string
}

export interface SmisEmergencyDrillRecordSearchParams {
  keyword?: string
  status?: SmisEmergencyDrillRecordStatus
  startDate?: string
  endDate?: string
  organizationId?: string
  from?: number
  to?: number
}

export interface SmisEmergencyDrillRecordOverview {
  total: number
  draft: number
  submitted: number
  late: number
}

export interface SmisEmergencyDrillRecordListResult {
  records: SmisEmergencyDrillRecord[]
  total: number
  overview: SmisEmergencyDrillRecordOverview
  planOptions: SmisEmergencyDrillPlanOption[]
  organizations: SmisTreeOrganization[]
}

export interface SmisEmergencyDrillRecordSavePayload {
  id?: string
  drillPlanId: string
  actualStartDate?: string
  actualEndDate?: string
  drillLocation?: string
  drillSubject?: string
  drillPurpose?: string
  drillProcess?: string
  drillSummary?: string
  drillEvaluation?: string
  drillTeam?: string
  equipmentMaterials?: string
  imageUrls: string[]
  attachmentUrls: string[]
  participantIds: string[]
  remark?: string
}

export interface SmisEmergencyDrillReportSearchParams {
  startDate?: string
  endDate?: string
  organizationId?: string
}

export interface SmisEmergencyDrillReportOverview {
  planCount: number
  completedCount: number
  outstandingCount: number
  warningCount: number
  lateCount: number
}

export interface SmisEmergencyDrillReportRow {
  organizationId: string
  organizationName: string
  planCategory: SmisEmergencyPlanCategory
  planLevel: SmisEmergencyPlanLevel
  planCount: number
  completedCount: number
  sprintRate: number
  drillCount: number
  lateCount: number
  averageIntervalDays?: number | null
}

export interface SmisEmergencyOutstandingPlan {
  id: string
  planNo: string
  drillName: string
  organizationName: string
  planCategory: SmisEmergencyPlanCategory
  planLevel: SmisEmergencyPlanLevel
  planEndDate?: string | null
  warningStatus: SmisEmergencyPlanWarningStatus
}

export interface SmisEmergencyDrillReportResult {
  overview: SmisEmergencyDrillReportOverview
  rows: SmisEmergencyDrillReportRow[]
  outstanding: SmisEmergencyOutstandingPlan[]
}

export type SmisAccidentLevel =
  'near_miss' | 'minor_injury' | 'general' | 'major' | 'severe' | 'catastrophic'

export type SmisAccidentCategory =
  | 'object_strike'
  | 'other_injury'
  | 'mechanical_injury'
  | 'lifting_injury'
  | 'electric_shock'
  | 'drowning'
  | 'burn'
  | 'fire'
  | 'fall_from_height'
  | 'collapse'
  | 'roof_fall'
  | 'water_inrush'
  | 'blasting'
  | 'explosive_material'
  | 'gas_explosion'
  | 'boiler_explosion'
  | 'vessel_explosion'
  | 'other_explosion'
  | 'poisoning_asphyxiation'

export interface SmisAccidentEmployee {
  id: string
  tenantId: string
  organizationId?: string | null
  employeeNo: string
  employeeName: string
  avatarUrl?: string | null
  jobTitle?: string | null
  employmentStatus: string
  gender?: string | null
  birthDate?: string | null
  idCardNo?: string | null
  age?: number | null
  phone?: string | null
  hireDate?: string | null
  workYears?: number | string | null
  educationLevel?: string | null
  homeAddress?: string | null
  companyName?: string | null
  operationDepartmentName?: string | null
  operationAreaName?: string | null
  teamName?: string | null
  organization?: {
    id: string
    organizationCode: string
    organizationName: string
  } | null
}

export interface SmisAccidentPreventionMeasure {
  id?: string
  plannedMeasure: string
  plannedImplementationDate?: string | null
  responsibleEmployeeId?: string | null
  responsibleEmployee?: SmisAccidentEmployee | null
  sort: number
}

export interface SmisAccidentPerson {
  id?: string
  employeeId: string
  companyName?: string | null
  operationDepartmentName?: string | null
  operationAreaName?: string | null
  teamName?: string | null
  employeeNo: string
  employeeName: string
  gender?: string | null
  idCardNo?: string | null
  age?: number | null
  phone?: string | null
  jobTitle?: string | null
  workYears?: number | string | null
  jobYears?: number | string | null
  safetyEducationLevel?: string | null
  safetyEducationCount?: number | null
  victimNature?: string | null
  injuryPart?: string | null
  injuryDegree?: string | null
  educationLevel?: string | null
  homeAddress?: string | null
  remark?: string | null
  sort: number
}

export interface SmisAccidentReport {
  id: string
  accidentNo: string
  accidentName: string
  reporterEmployeeId: string
  reporterEmployee: SmisAccidentEmployee
  accidentTime: string
  accidentLocation: string
  accidentCategories: SmisAccidentCategory[]
  operationAreaOrganizationId?: string | null
  operationAreaOrganizationName?: string | null
  accidentLevel: SmisAccidentLevel
  indirectEconomicLoss: number | string
  minorInjuryCount: number
  seriousInjuryCount: number
  deathCount: number
  onSiteCount: number
  briefDescription?: string | null
  causeAnalysis?: string | null
  resultDetermination?: string | null
  imageUrls: string[]
  measures: SmisAccidentPreventionMeasure[]
  people: SmisAccidentPerson[]
  createBy?: string | null
  createTime?: string
  updateBy?: string | null
  updateTime?: string
}

export interface SmisAccidentReportSearchParams {
  keyword?: string
  accidentLevel?: SmisAccidentLevel
  accidentCategory?: SmisAccidentCategory
  organizationId?: string
  startTime?: string
  endTime?: string
  ids?: string[]
  from?: number
  to?: number
}

export interface SmisAccidentReportOverview {
  total: number
  currentMonth: number
  highSeverity: number
  affectedPeople: number
}

export interface SmisAccidentReportListResult {
  records: SmisAccidentReport[]
  total: number
  overview: SmisAccidentReportOverview
  organizations: SmisTreeOrganization[]
  currentEmployee?: SmisAccidentEmployee | null
}

export interface SmisAccidentReportSavePayload {
  id?: string
  accidentName: string
  reporterEmployeeId: string
  accidentTime: string
  accidentLocation: string
  accidentCategories: SmisAccidentCategory[]
  operationAreaOrganizationId?: string | null
  accidentLevel: SmisAccidentLevel
  indirectEconomicLoss: number
  minorInjuryCount: number
  seriousInjuryCount: number
  deathCount: number
  onSiteCount: number
  briefDescription: string
  causeAnalysis?: string
  resultDetermination?: string
  imageUrls: string[]
  measures: Array<
    Pick<
      SmisAccidentPreventionMeasure,
      'id' | 'plannedMeasure' | 'plannedImplementationDate' | 'responsibleEmployeeId' | 'sort'
    >
  >
  people: Array<
    Pick<
      SmisAccidentPerson,
      | 'id'
      | 'employeeId'
      | 'jobYears'
      | 'safetyEducationCount'
      | 'victimNature'
      | 'injuryPart'
      | 'injuryDegree'
      | 'remark'
      | 'sort'
    >
  >
}

export type SmisAccidentCaseStatus = 'stopped' | 'in_use'

export interface SmisHistoricalAccidentCase {
  id: string
  accidentName: string
  accidentCategories: SmisAccidentCategory[]
  accidentLevel: SmisAccidentLevel
  accidentOrganizationId?: string | null
  accidentOrganizationName?: string | null
  occurrenceDate: string
  caseStatus?: SmisAccidentCaseStatus | null
  applicableCompanyId?: string | null
  applicableCompanyName?: string | null
  summary?: string | null
  content: string
  imageUrls: string[]
  attachmentUrls: string[]
  createBy?: string | null
  createTime?: string
  updateBy?: string | null
  updateTime?: string
}

export interface SmisHistoricalAccidentCaseSearchParams {
  keyword?: string
  accidentLevel?: SmisAccidentLevel
  startDate?: string
  endDate?: string
  ids?: string[]
  from?: number
  to?: number
}

export interface SmisHistoricalAccidentCaseOverview {
  total: number
  inUse: number
  currentYear: number
  highSeverity: number
}

export interface SmisHistoricalAccidentCaseListResult {
  records: SmisHistoricalAccidentCase[]
  total: number
  overview: SmisHistoricalAccidentCaseOverview
  organizations: SmisTreeOrganization[]
}

export interface SmisHistoricalAccidentCaseSavePayload {
  id?: string
  accidentName: string
  accidentCategories: SmisAccidentCategory[]
  accidentLevel: SmisAccidentLevel
  accidentOrganizationId?: string | null
  occurrenceDate: string
  caseStatus?: SmisAccidentCaseStatus | null
  applicableCompanyId?: string | null
  summary?: string | null
  content: string
  imageUrls: string[]
  attachmentUrls: string[]
}

export interface SmisSafetyAccidentStatisticsSearchParams {
  startDate?: string
  endDate?: string
  organizationId?: string
}

export interface SmisSafetyAccidentStatisticsOverview {
  total: number
  currentYear: number
  highSeverity: number
  affectedPeople: number
}

export interface SmisSafetyAccidentTrendPoint {
  period: string
  label: string
  count: number
}

export interface SmisSafetyAccidentDimensionStat {
  value: string
  count: number
}

export interface SmisSafetyAccidentOrganizationStat {
  organizationId?: string | null
  organizationName: string
  count: number
  highSeverity: number
}

export interface SmisSafetyAccidentStatisticsResult {
  overview: SmisSafetyAccidentStatisticsOverview
  trend: SmisSafetyAccidentTrendPoint[]
  levels: SmisSafetyAccidentDimensionStat[]
  categories: SmisSafetyAccidentDimensionStat[]
  organizations: SmisSafetyAccidentOrganizationStat[]
  organizationOptions: SmisTreeOrganization[]
}

export interface SmisAccidentOption {
  id: string
  accidentNo: string
  accidentName: string
  accidentTime: string
  accidentLocation: string
  accidentLevel: SmisAccidentLevel
}

export interface SmisAccidentAnalysis {
  id: string
  accidentReportId: string
  accident: SmisAccidentOption
  hostEmployeeId?: string | null
  hostEmployee?: SmisAccidentEmployee | null
  recorderEmployeeId?: string | null
  recorderEmployee?: SmisAccidentEmployee | null
  rectificationResponsibleEmployeeId?: string | null
  rectificationResponsibleEmployee?: SmisAccidentEmployee | null
  participants: SmisAccidentEmployee[]
  participantCount: number
  accidentLevel: SmisAccidentLevel
  isComplete: boolean
  createBy?: string | null
  createTime?: string
  updateBy?: string | null
  updateTime?: string
}

export interface SmisAccidentAnalysisSearchParams {
  keyword?: string
  accidentLevel?: SmisAccidentLevel
  ids?: string[]
  from?: number
  to?: number
}

export interface SmisAccidentAnalysisOverview {
  total: number
  complete: number
  pending: number
  participantCount: number
}

export interface SmisAccidentAnalysisListResult {
  records: SmisAccidentAnalysis[]
  total: number
  overview: SmisAccidentAnalysisOverview
}

export interface SmisAccidentAnalysisSavePayload {
  id?: string
  accidentReportId: string
  hostEmployeeId?: string | null
  recorderEmployeeId?: string | null
  rectificationResponsibleEmployeeId?: string | null
  participantEmployeeIds: string[]
  accidentLevel: SmisAccidentLevel
}

export type SmisWorkInjuryType = 'slight' | 'minor' | 'serious' | 'fatal'

export interface SmisWorkInjuryDeclaration {
  id: string
  declarationNo: string
  declarationDate: string
  accidentReportId: string
  accident: SmisAccidentOption
  declarantEmployeeId: string
  declarantEmployeeNoSnapshot: string
  declarantNameSnapshot: string
  departmentNameSnapshot?: string | null
  declarantEmployee: SmisAccidentEmployee
  injuryType: SmisWorkInjuryType
  createBy?: string | null
  createTime?: string
  updateBy?: string | null
  updateTime?: string
}

export interface SmisWorkInjurySearchParams {
  keyword?: string
  injuryType?: SmisWorkInjuryType
  startDate?: string
  endDate?: string
  ids?: string[]
  from?: number
  to?: number
}

export interface SmisWorkInjuryOverview {
  total: number
  slight: number
  minor: number
  serious: number
  fatal: number
}

export interface SmisWorkInjuryListResult {
  records: SmisWorkInjuryDeclaration[]
  total: number
  overview: SmisWorkInjuryOverview
  currentEmployee?: SmisAccidentEmployee | null
}

export interface SmisWorkInjurySavePayload {
  id?: string
  declarationDate: string
  accidentReportId: string
  declarantEmployeeId: string
  injuryType: SmisWorkInjuryType
}
