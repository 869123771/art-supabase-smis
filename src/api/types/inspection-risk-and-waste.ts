import type { SmisHazardFactorType, SmisRiskPoint, SmisRiskPointType } from './foundation'

export type SmisConfigurationStatus = 'enabled' | 'disabled' | 'voided'
export type SmisConfigurationTagStyle = 'primary' | 'success' | 'info' | 'warning' | 'danger' | ''

export interface SmisInspectionStandard {
  id: string
  tenantId: string
  parentId?: string | null
  standardCode: string
  standardName: string
  sort: number
  textColor?: string | null
  tagStyle: SmisConfigurationTagStyle
  status: SmisConfigurationStatus
  children?: SmisInspectionStandard[]
  itemCount?: number
  createBy?: string | null
  createTime: string
  updateBy?: string | null
  updateTime: string
}

export interface SmisInspectionStandardPayload {
  id?: string
  tenantId?: string | null
  parentId?: string | null
  standardCode: string
  standardName: string
  sort: number
  textColor?: string | null
  tagStyle: SmisConfigurationTagStyle
  status: Exclude<SmisConfigurationStatus, 'voided'>
}

export interface SmisInspectionItem {
  id: string
  tenantId: string
  standardId: string
  itemCode: string
  inspectionContent: string
  sort: number
  textColor?: string | null
  tagStyle: SmisConfigurationTagStyle
  status: SmisConfigurationStatus
  standard?: Pick<SmisInspectionStandard, 'id' | 'standardCode' | 'standardName'> | null
  createBy?: string | null
  createTime: string
  updateBy?: string | null
  updateTime: string
}

export interface SmisInspectionItemPayload {
  id?: string
  tenantId?: string | null
  standardId: string
  itemCode: string
  inspectionContent: string
  sort: number
  textColor?: string | null
  tagStyle: SmisConfigurationTagStyle
  status: Exclude<SmisConfigurationStatus, 'voided'>
}

export interface SmisInspectionItemSearchParams {
  standardId?: string
  ancestorStandardIds?: string[]
  keyword?: string
  status?: SmisConfigurationStatus
  tenantId?: string | null
  ids?: string[]
  from?: number
  to?: number
}

export interface SmisInspectionType {
  id: string
  tenantId: string
  typeCode: string
  typeName: string
  sort: number
  textColor?: string | null
  tagStyle: SmisConfigurationTagStyle
  status: SmisConfigurationStatus
  createBy?: string | null
  createTime: string
  updateBy?: string | null
  updateTime: string
}

export type SmisInspectionTypePayload = Omit<
  SmisInspectionType,
  'id' | 'tenantId' | 'createBy' | 'createTime' | 'updateBy' | 'updateTime' | 'status'
> & {
  id?: string
  tenantId?: string | null
  status: Exclude<SmisConfigurationStatus, 'voided'>
}

export interface SmisInspectionTypeSearchParams {
  keyword?: string
  status?: SmisConfigurationStatus
  tagStyle?: Exclude<SmisConfigurationTagStyle, ''>
  tenantId?: string | null
  ids?: string[]
  from?: number
  to?: number
}

export type SmisRepeatCalendarType = 'none' | 'week' | 'month'

export interface SmisConfigurableMenuOption {
  id: string
  name: string
  title: string
  path?: string | null
  parentTitle?: string | null
}

export interface SmisDuplicateConfiguration {
  id: string
  tenantId: string
  menuId: string
  contentItem: string
  repeatEnabled: boolean
  repeatFrequency?: number | null
  frequencyUnit?: string | null
  calendarType: SmisRepeatCalendarType
  calendarDays: number[]
  deadlineTime?: string | null
  sort: number
  textColor?: string | null
  tagStyle: SmisConfigurationTagStyle
  status: SmisConfigurationStatus
  menu?: SmisConfigurableMenuOption | null
  createBy?: string | null
  createTime: string
  updateBy?: string | null
  updateTime: string
}

export type SmisDuplicateConfigurationPayload = Omit<
  SmisDuplicateConfiguration,
  'id' | 'tenantId' | 'menu' | 'createBy' | 'createTime' | 'updateBy' | 'updateTime' | 'status'
> & {
  id?: string
  tenantId?: string | null
  status: Exclude<SmisConfigurationStatus, 'voided'>
}

export interface SmisDuplicateConfigurationSearchParams {
  keyword?: string
  menuId?: string
  repeatEnabled?: boolean | ''
  status?: SmisConfigurationStatus
  tenantId?: string | null
  ids?: string[]
  from?: number
  to?: number
}

export type SmisRiskAssessmentMethod = 'LEC' | 'LS'
export type SmisRiskDimensionCode = 'L' | 'E' | 'C' | 'S'

export interface SmisRiskAssessmentCriterion {
  id: string
  tenantId: string
  dimensionId: string
  criterionText: string
  score: number
  sort: number
  createBy?: string | null
  createTime: string
  updateBy?: string | null
  updateTime: string
}

export interface SmisRiskAssessmentDimension {
  id: string
  tenantId: string
  modelId: string
  dimensionCode: SmisRiskDimensionCode
  dimensionName: string
  description?: string | null
  sort: number
  criteria: SmisRiskAssessmentCriterion[]
}

export interface SmisRiskAssessmentLevel {
  id: string
  tenantId: string
  modelId: string
  levelCode: string
  levelName: string
  minScore: number
  maxScore?: number | null
  color: string
  tagStyle: Exclude<SmisConfigurationTagStyle, ''>
  sort: number
  createBy?: string | null
  createTime: string
  updateBy?: string | null
  updateTime: string
}

export interface SmisRiskAssessmentModel {
  id: string
  tenantId: string
  methodCode: SmisRiskAssessmentMethod
  modelName: string
  description?: string | null
  status: 'enabled' | 'disabled'
  dimensions: SmisRiskAssessmentDimension[]
  levels: SmisRiskAssessmentLevel[]
}

export interface SmisRiskAssessmentCriterionPayload {
  id?: string
  tenantId?: string | null
  dimensionId: string
  criterionText: string
  score: number
  sort: number
}

export interface SmisRiskAssessmentLevelPayload {
  id: string
  levelName: string
  minScore: number
  maxScore?: number | null
  color: string
  tagStyle: Exclude<SmisConfigurationTagStyle, ''>
  sort: number
}

export type SmisRiskItemStatus = 'identified' | 'evaluated' | 'voided'

export interface SmisRiskFactorCategoryOption {
  id: string
  categoryCode: string
  categoryName: string
  factorType: SmisHazardFactorType
}

export interface SmisRiskEvaluation {
  id: string
  tenantId: string
  riskItemId: string
  modelId: string
  methodCode: SmisRiskAssessmentMethod
  lValue: number
  eValue?: number | null
  cValue?: number | null
  sValue?: number | null
  dValue: number
  riskLevelId: string
  level?: SmisRiskAssessmentLevel | null
  createBy?: string | null
  createTime: string
  updateBy?: string | null
  updateTime: string
}

export interface SmisRiskItem {
  id: string
  tenantId: string
  itemNo: string
  riskPoint: string
  hazardFactor: string
  factorCategoryId?: string | null
  riskPointId?: string | null
  riskPointRecord?: Pick<SmisRiskPoint, 'id' | 'pointNo' | 'pointName'> | null
  accidentTypes?: string[]
  consequence?: string | null
  organizationId?: string | null
  sort: number
  status: SmisRiskItemStatus
  factorCategory?: SmisRiskFactorCategoryOption | null
  evaluation?: SmisRiskEvaluation | null
  measureCount?: number
  createBy?: string | null
  createTime: string
  updateBy?: string | null
  updateTime: string
}

export interface SmisRiskItemPayload {
  id?: string
  tenantId?: string | null
  itemNo: string
  riskPoint: string
  hazardFactor: string
  factorCategoryId?: string | null
  sort: number
}

export interface SmisRiskItemSearchParams {
  keyword?: string
  factorCategoryId?: string
  status?: SmisRiskItemStatus
  tenantId?: string | null
  ids?: string[]
  from?: number
  to?: number
}

export interface SmisRiskEvaluationPayload {
  riskItemId: string
  methodCode: SmisRiskAssessmentMethod
  lValue: number
  eValue?: number | null
  cValue?: number | null
  sValue?: number | null
}

export interface SmisRiskEvaluationResult {
  id: string
  methodCode: SmisRiskAssessmentMethod
  dValue: number
  riskLevelId: string
  riskLevelCode: string
  riskLevelName: string
  riskLevelColor: string
}

export interface SmisRiskPositionOption {
  id: string
  positionCode: string
  positionName: string
  organizationId?: string | null
  organizationName?: string | null
}

export interface SmisRiskControlMeasurePosition {
  id?: string
  positionId: string
  organizationId?: string | null
  frequencyCount: number
  frequencyUnit: string
  position?: SmisRiskPositionOption | null
}

export interface SmisRiskControlMeasure {
  id: string
  tenantId: string
  riskItemId: string
  controlMeasure: string
  controlMeasureCategory: string
  controlLevel: string
  standardBasis?: string | null
  failureMode?: string | null
  hazardLevel: string
  sort: number
  status: 'enabled' | 'voided'
  positions: SmisRiskControlMeasurePosition[]
  createBy?: string | null
  createTime: string
  updateBy?: string | null
  updateTime: string
}

export interface SmisRiskControlMeasurePayload {
  id?: string
  riskItemId: string
  controlMeasure: string
  controlMeasureCategory: string
  controlLevel: string
  standardBasis?: string | null
  failureMode?: string | null
  hazardLevel: string
  sort: number
  positions: Array<
    Pick<SmisRiskControlMeasurePosition, 'positionId' | 'frequencyCount' | 'frequencyUnit'>
  >
}

export type SmisRiskControlLevel = 'company' | 'department' | 'team' | 'position'
export type SmisRiskControlStatus = 'uncontrolled' | 'active' | 'suspended'
export type SmisRiskInspectionTaskStatus =
  'not_started' | 'in_progress' | 'completed' | 'overdue' | 'cancelled'
export type SmisRiskInspectionResult = 'pending' | 'normal' | 'abnormal'

export interface SmisSafetyRiskOverview {
  total: number
  evaluated: number
  major: number
  controlled: number
}

export interface SmisSafetyRiskRecord {
  id: string
  hazardNo: string
  riskPointId: string
  riskPointNo: string
  riskName: string
  riskPointType: SmisRiskPointType
  siteName: string
  organizationName?: string | null
  hazardSource: string
  factorCategoryName?: string | null
  activityNames: string
  activityIds: string[]
  accidentTypes: string[]
  riskDescription?: string | null
  engineeringMeasures: string
  managementMeasures: string
  educationMeasures: string
  personalProtectionMeasures: string
  emergencyMeasures: string
  riskAssessmentMethod?: SmisRiskAssessmentMethod | null
  riskScore?: number | null
  riskLevelCode?: string | null
  riskLevelName?: string | null
  riskLevelColor?: string | null
  controlLevels: SmisRiskControlLevel[]
  responsibleEmployeeIds: string[]
  responsibleNames: string
  responsibleDepartments: string
  identifiedBy?: string | null
  identifiedAt: string
  status: SmisRiskItemStatus
}

export interface SmisSafetyRiskSearchParams {
  keyword?: string
  riskName?: string
  accidentType?: string
  identifiedFrom?: string
  identifiedTo?: string
  controlLevel?: SmisRiskControlLevel
  status?: SmisRiskItemStatus
  responsibleKeyword?: string
  from?: number
  to?: number
}

export interface SmisSafetyRiskListResult {
  records: SmisSafetyRiskRecord[]
  total: number
  overview: SmisSafetyRiskOverview
}

export interface SmisRiskPointOption {
  id: string
  pointNo: string
  pointName: string
  riskType: SmisRiskPointType
  siteName: string
}

export interface SmisSafetyRiskOptions {
  riskPoints: SmisRiskPointOption[]
  hazardCategories: SmisRiskFactorCategoryOption[]
}

export interface SmisSafetyRiskSavePayload {
  id?: string
  riskPointId: string
  hazardFactor: string
  factorCategoryId?: string | null
  accidentTypes: string[]
  consequence?: string | null
  sort: number
  activityIds: string[]
}

export interface SmisRiskControlFrequencyOption {
  id: string
  contentItem: string
  repeatFrequency: number
  frequencyUnit: string
  calendarType: SmisRepeatCalendarType
  calendarDays: number[]
  deadlineTime?: string | null
  displayLabel: string
}

export interface SmisRiskControlOptions {
  riskPoints: SmisRiskPointOption[]
  duplicateConfigurations: SmisRiskControlFrequencyOption[]
}

export interface SmisRiskControlAssignment {
  id?: string
  controlLevel: SmisRiskControlLevel
  responsibleEmployeeId: string
  responsibleEmployeeNo?: string | null
  responsibleEmployeeName?: string | null
  responsibleOrganizationId?: string | null
  responsibleOrganizationName?: string | null
  duplicateConfigurationId: string
  frequencyLabel?: string | null
  controlMeasure?: string | null
  sort: number
}

export interface SmisRiskControlPoint {
  riskPointId: string
  riskPointNo: string
  riskPointName: string
  riskPointType: SmisRiskPointType
  siteName: string
  riskLevelCode: string
  riskLevelName: string
  riskLevelColor: string
  accidentTypes: string[]
  planId?: string | null
  controlStartAt?: string | null
  controlDescription?: string | null
  controlStatus: SmisRiskControlStatus
  controlLevels: SmisRiskControlLevel[]
  responsibleNames: string
  taskCount: number
  assignments: SmisRiskControlAssignment[]
}

export interface SmisRiskControlOverview {
  total: number
  uncontrolled: number
  active: number
  major: number
}

export interface SmisRiskControlSearchParams {
  keyword?: string
  riskType?: SmisRiskPointType
  controlLevel?: SmisRiskControlLevel
  controlStatus?: SmisRiskControlStatus
  from?: number
  to?: number
}

export interface SmisRiskControlListResult {
  records: SmisRiskControlPoint[]
  total: number
  overview: SmisRiskControlOverview
}

export interface SmisRiskControlPlanSavePayload {
  id?: string | null
  riskPointId: string
  controlStartAt: string
  status: Exclude<SmisRiskControlStatus, 'uncontrolled'>
  controlDescription?: string | null
  assignments: SmisRiskControlAssignment[]
}

export interface SmisRiskInspectionTaskOverview {
  total: number
  notStarted: number
  inProgress: number
  overdue: number
  completed: number
}

export interface SmisRiskInspectionTask {
  id: string
  taskNo: string
  riskPointId: string
  riskPointNo: string
  riskPointName: string
  riskPointType: SmisRiskPointType
  riskLevelCode: string
  riskLevelName: string
  riskLevelColor: string
  controlLevel: SmisRiskControlLevel
  responsibleEmployeeId: string
  responsibleEmployeeNo: string
  responsibleEmployeeName: string
  assigneeEmployeeId: string
  assigneeEmployeeNo: string
  assigneeEmployeeName: string
  actualExecutorEmployeeId?: string | null
  actualExecutorEmployeeNo?: string | null
  actualExecutorEmployeeName?: string | null
  plannedStartAt: string
  plannedEndAt: string
  actualStartAt?: string | null
  completedAt?: string | null
  status: SmisRiskInspectionTaskStatus
  executionSummary?: string | null
  itemCount: number
  completedItemCount: number
  abnormalCount: number
  createTime: string
  updateTime: string
}

export interface SmisRiskInspectionTaskSearchParams {
  keyword?: string
  riskName?: string
  riskType?: SmisRiskPointType
  plannedFrom?: string
  plannedTo?: string
  responsibleEmployeeId?: string
  status?: SmisRiskInspectionTaskStatus
  executorKeyword?: string
  from?: number
  to?: number
}

export interface SmisRiskInspectionTaskListResult {
  records: SmisRiskInspectionTask[]
  total: number
  overview: SmisRiskInspectionTaskOverview
}

export interface SmisRiskInspectionTaskItem {
  id: string
  riskItemId?: string | null
  controlMeasureId?: string | null
  hazardNo?: string | null
  hazardSource?: string | null
  inspectionContent: string
  result: SmisRiskInspectionResult
  remark?: string | null
  attachmentUrls: string[]
  sort: number
}

export interface SmisRiskInspectionTaskEvent {
  id: string
  eventType: 'generated' | 'transferred' | 'progress_saved' | 'completed' | 'cancelled'
  eventContent?: string | null
  operatorName?: string | null
  eventAt: string
}

export interface SmisRiskInspectionTaskDetail extends Omit<
  SmisRiskInspectionTask,
  'itemCount' | 'completedItemCount' | 'abnormalCount' | 'createTime' | 'updateTime'
> {
  cancelledAt?: string | null
  transferReason?: string | null
  cancellationReason?: string | null
  attachmentUrls: string[]
  items: SmisRiskInspectionTaskItem[]
  events: SmisRiskInspectionTaskEvent[]
}

export interface SmisRiskInspectionExecutionPayload {
  id: string
  actualExecutorEmployeeId: string
  executionSummary?: string | null
  attachmentUrls: string[]
  items: Array<Pick<SmisRiskInspectionTaskItem, 'id' | 'result' | 'remark' | 'attachmentUrls'>>
  complete: boolean
}

export type SmisHazardousWasteEnableStatus = 'enabled' | 'disabled'
export type SmisHazardousWasteTagStyle = '' | 'primary' | 'success' | 'info' | 'warning' | 'danger'
export type SmisHazardousWasteDocumentDirection = 'inbound' | 'outbound'
export type SmisHazardousWasteDocumentStatus = 'draft' | 'pending' | 'approved' | 'rejected'

export interface SmisHazardousWasteWarehouse {
  id: string
  tenantId: string
  tenantName?: string | null
  warehouseCode: string
  warehouseName: string
  sort: number
  textColor?: string | null
  tagStyle: SmisHazardousWasteTagStyle
  status: SmisHazardousWasteEnableStatus
  keeperEmployeeId?: string | null
  keeperEmployeeNo?: string | null
  keeperEmployeeName?: string | null
  responsibleEmployeeId?: string | null
  responsibleEmployeeNo?: string | null
  responsibleEmployeeName?: string | null
  regionPath: string[]
  regionAdcode?: string | null
  addressDetail?: string | null
  remark?: string | null
  createBy?: string | null
  createTime: string
  updateBy?: string | null
  updateTime: string
}

export interface SmisHazardousWasteWarehouseOverview {
  total: number
  enabled: number
  managed: number
  regionCount: number
}

export interface SmisHazardousWasteWarehouseSearchParams {
  keyword?: string
  status?: SmisHazardousWasteEnableStatus
  ids?: string[]
  purpose?: 'list' | 'export'
  from?: number
  to?: number
}

export interface SmisHazardousWasteWarehouseSavePayload {
  id?: string
  warehouseCode: string
  warehouseName: string
  sort: number
  textColor?: string | null
  tagStyle: SmisHazardousWasteTagStyle
  status: SmisHazardousWasteEnableStatus
  keeperEmployeeId?: string | null
  responsibleEmployeeId?: string | null
  regionPath: string[]
  regionAdcode?: string | null
  addressDetail?: string | null
  remark?: string | null
}

export interface SmisHazardousWasteCategory {
  id: string
  tenantId: string
  parentId?: string | null
  categoryCode: string
  categoryName: string
  sort: number
  textColor?: string | null
  tagStyle: SmisHazardousWasteTagStyle
  status: SmisHazardousWasteEnableStatus
  description?: string | null
  catalogCount: number
  children?: SmisHazardousWasteCategory[]
}

export interface SmisHazardousWasteCategorySavePayload {
  id?: string
  parentId?: string | null
  categoryCode: string
  categoryName: string
  sort: number
  textColor?: string | null
  tagStyle: SmisHazardousWasteTagStyle
  status: SmisHazardousWasteEnableStatus
  description?: string | null
}

export interface SmisHazardousWasteCatalogItem {
  id: string
  tenantId: string
  categoryId: string
  category: Pick<SmisHazardousWasteCategory, 'id' | 'categoryCode' | 'categoryName'>
  wasteCode: string
  wasteName: string
  wasteType?: string | null
  safetyMeasure?: string | null
  hazardCharacteristic?: string | null
  unit: string
  sort: number
  textColor?: string | null
  tagStyle: SmisHazardousWasteTagStyle
  status: SmisHazardousWasteEnableStatus
  remark?: string | null
  createBy?: string | null
  createTime: string
  updateBy?: string | null
  updateTime: string
}

export interface SmisHazardousWasteCatalogOverview {
  total: number
  enabled: number
  categoryCount: number
  characteristicCount: number
}

export interface SmisHazardousWasteCatalogSearchParams {
  keyword?: string
  status?: SmisHazardousWasteEnableStatus
  categoryId?: string
  ids?: string[]
  purpose?: 'list' | 'export'
  from?: number
  to?: number
}

export interface SmisHazardousWasteCatalogSavePayload {
  id?: string
  categoryId: string
  wasteCode: string
  wasteName: string
  wasteType?: string | null
  safetyMeasure?: string | null
  hazardCharacteristic?: string | null
  unit: string
  sort: number
  textColor?: string | null
  tagStyle: SmisHazardousWasteTagStyle
  status: SmisHazardousWasteEnableStatus
  remark?: string | null
}

export interface SmisHazardousWasteDocumentItem {
  id?: string
  catalogId: string
  categoryName: string
  wasteCode: string
  wasteName: string
  hazardCharacteristic?: string | null
  unit: string
  quantity: number
  productionDate: string
  remark?: string | null
}

export interface SmisHazardousWasteDocument {
  id: string
  tenantId: string
  direction: SmisHazardousWasteDocumentDirection
  documentNo: string
  operationDate: string
  warehouseId: string
  warehouseName: string
  handlerEmployeeId: string
  handlerEmployeeNo: string
  handlerEmployeeName: string
  transferOrderNo?: string | null
  outboundReason?: string | null
  description?: string | null
  status: SmisHazardousWasteDocumentStatus
  submittedAt?: string | null
  reviewedAt?: string | null
  reviewedBy?: string | null
  reviewRemark?: string | null
  items: SmisHazardousWasteDocumentItem[]
  createBy?: string | null
  createTime: string
  updateBy?: string | null
  updateTime: string
}

export interface SmisHazardousWasteDocumentOverview {
  total: number
  draft: number
  pending: number
  approved: number
  rejected: number
  quantity: number
}

export interface SmisHazardousWasteDocumentSearchParams {
  documentNo?: string
  dateRange?: [string, string]
  warehouseId?: string
  handlerKeyword?: string
  status?: SmisHazardousWasteDocumentStatus
  purpose?: 'list' | 'export'
  from?: number
  to?: number
}

export interface SmisHazardousWasteDocumentSavePayload {
  id?: string
  operationDate: string
  warehouseId: string
  handlerEmployeeId: string
  transferOrderNo?: string | null
  outboundReason?: string | null
  description?: string | null
  items: Array<
    Pick<SmisHazardousWasteDocumentItem, 'catalogId' | 'quantity' | 'productionDate' | 'remark'>
  >
}
