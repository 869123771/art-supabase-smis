export interface SmisPositionOption {
  id: string
  tenantId?: string
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

export interface SmisChecklistOrganization {
  organizationId: string
  organizationCode: string
  organizationName: string
}

export interface SmisPersonnelChecklistRecord {
  id: string
  employeeNo: string
  employeeName: string
  gender?: string | null
  age?: number | null
  avatarUrl?: string | null
  organizationId?: string | null
  organizationCode?: string | null
  organizationName?: string | null
  positionId?: string | null
  positionCode?: string | null
  positionName: string
  riskCount: number
  inspectionCount: number
  hazardCount: number
  scheduleCount: number
}

export interface SmisPersonnelChecklistOverview {
  total: number
  scheduled: number
  withRisk: number
  withInspection: number
}

export interface SmisEmployeeShiftAssignment {
  id: string
  workDate: string
  assignmentStatus: 'scheduled' | 'worked' | 'leave' | 'cancelled'
  shiftCode: string
  shiftName: string
  shiftType: string
  startTime: string
  endTime: string
  crossDay: boolean
  remark?: string | null
}

export interface SmisEmployeeShiftCalendar {
  employeeId: string
  employeeName: string
  month: string
  assignments: SmisEmployeeShiftAssignment[]
}

export interface SmisPositionRiskChecklistRecord {
  id: string
  positionId: string
  positionCode: string
  positionName: string
  organizationId: string
  organizationCode: string
  organizationName: string
  pointNo: string
  identificationLocation: string
  equipmentFacility: string
  activityNames: string
  hazardFactor: string
  accidentTypes: string[]
  methodCode?: string | null
  lValue?: number | null
  eValue?: number | null
  cValue?: number | null
  sValue?: number | null
  riskScore?: number | null
  riskLevelCode?: string | null
  riskLevelName?: string | null
  riskLevelColor?: string | null
  controlMeasureCategory: string
  controlLevel: string
  controlMeasure: string
  standardBasis: string
  failureMode: string
  hazardLevel: string
  frequencyCount: number
  frequencyUnit: string
  identificationUnits: SmisChecklistOrganization[]
}

export interface SmisPositionRiskChecklistOverview {
  total: number
  major: number
  identifiedUnits: number
  positions: number
}

export interface SmisAccidentInspectionChecklistRecord {
  id: string
  organizationId: string
  organizationCode: string
  organizationName: string
  positionId: string
  positionCode: string
  positionName: string
  inspectionItem: string
  inspectionStandard: string
  primaryHazardCategory: string
  secondaryHazardCategory: string
  hazardLevel: string
  riskLevel: string
  inspectionFrequency: number
  frequencyUnit: string
  revisionDate: string
  standardSource: string
}

export interface SmisAccidentInspectionChecklistOverview {
  total: number
  positions: number
  organizations: number
  major: number
}

export interface SmisPositionResponsibilityChecklistRecord {
  id: string
  organizationId: string
  organizationCode: string
  organizationName: string
  positionId: string
  positionCode: string
  positionName: string
  riskCount: number
  inspectionCount: number
  responsibilityScope: string
  workContent: string
}

export interface SmisPositionResponsibilityChecklistOverview {
  total: number
  organizations: number
  riskMeasures: number
  inspectionStandards: number
}

export interface SmisChecklistSearchParams {
  keyword?: string
  organizationId?: string
  gender?: string
  riskLevel?: string
  hazardLevel?: string
  from?: number
  to?: number
}

export interface SmisRiskControlInformationOverview {
  total: number
  evaluated: number
  major: number
  controlled: number
  generatedHazards: number
}

export interface SmisRiskControlMeasureSummary {
  id: string
  category: string
  controlLevel: string
  content: string
  standardBasis?: string | null
  failureMode?: string | null
  hazardLevel: string
  positions: string
  frequency: string
}

export interface SmisRiskControlInformationRecord {
  id: string
  hazardNo: string
  pointNo: string
  identificationLocation: string
  organizationIds: string[]
  organizationNames: string
  siteId?: string | null
  siteName: string
  equipmentFacility: string
  isSpecialEquipment: boolean
  activityNames: string
  hazardFactor: string
  accidentTypes: string[]
  consequence?: string | null
  methodCode?: string | null
  lValue?: number | null
  eValue?: number | null
  cValue?: number | null
  sValue?: number | null
  riskScore?: number | null
  riskLevelCode?: string | null
  riskLevelName?: string | null
  riskLevelColor?: string | null
  measureCount: number
  linkedPositionCount: number
  generatedHazardCount: number
  measures?: SmisRiskControlMeasureSummary[]
}

export interface SmisRiskControlInformationSearchParams extends SmisChecklistSearchParams {
  siteId?: string
  isSpecialEquipment?: boolean | ''
}

export interface SmisHiddenHazardLedgerOverview {
  total: number
  open: number
  overdue: number
  completed: number
  major: number
}

export interface SmisHiddenHazardLedgerRecord {
  id: string
  hazardNo: string
  inspectionTypeName?: string | null
  sourceType: string
  sourceRecordNo?: string | null
  description: string
  hazardOrganizationId?: string | null
  hazardOrganizationName?: string | null
  reporterOrganizationName?: string | null
  location: string
  hazardLevel: string
  status: string
  reporterEmployeeNo: string
  reporterEmployeeName: string
  reportedAt: string
  imageUrls: string[]
  rectificationSuggestion?: string | null
  approverEmployeeName?: string | null
  approvedAt?: string | null
  approvalResult?: string | null
  approvalDescription?: string | null
  rectificationDeadline?: string | null
  rectificationMeasures?: string | null
  rectificationResponsibleEmployeeName?: string | null
  rectificationCompletedAt?: string | null
  rectificationDescription?: string | null
  rectificationImageUrls: string[]
  acceptorEmployeeName?: string | null
  acceptedAt?: string | null
  acceptanceResult?: string | null
  acceptanceDescription?: string | null
  acceptanceImageUrls: string[]
  closedAt?: string | null
  closeReason?: string | null
  overdue: boolean
  evidenceCount: number
  events?: Array<{
    id: string
    title: string
    content?: string | null
    operatorName?: string | null
    evidenceUrls: string[]
    eventAt: string
  }>
}

export interface SmisHiddenHazardLedgerSearchParams extends SmisChecklistSearchParams {
  reportedFrom?: string
  reportedTo?: string
  status?: string
  sourceType?: string
}

export interface SmisDualControlReportOverview {
  organizations: number
  riskItems: number
  measures: number
  inspectionRate: number
  openHazards: number
}

export interface SmisDualControlReportRecord {
  id: string
  organizationId: string
  organizationCode: string
  organizationName: string
  majorCount: number
  highCount: number
  mediumCount: number
  lowCount: number
  unevaluatedCount: number
  riskPointCount: number
  riskItemCount: number
  measureCount: number
  riskValue: number
  generatedTaskCount: number
  completedTaskCount: number
  abnormalCount: number
  inspectionRate: number
  hazardCount: number
  closedHazardCount: number
  openHazardCount: number
  closureRate: number
}

export interface SmisDualControlReportSearchParams extends SmisChecklistSearchParams {
  month?: string
}

export interface SmisHiddenHazardInspectionReportOverview {
  organizations: number
  generatedTasks: number
  completedTasks: number
  inspectionRate: number
  missedInspectors: number
  generatedHazards: number
}

export interface SmisHiddenHazardInspectionReportRecord {
  id: string
  organizationId: string
  organizationCode: string
  organizationName: string
  organizationType: string
  activePlanCount: number
  generatedTaskCount: number
  completedTaskCount: number
  inProgressTaskCount: number
  overdueTaskCount: number
  cancelledTaskCount: number
  inspectionRate: number
  executorCount: number
  missedInspectorCount: number
  abnormalCount: number
  generatedHazardCount: number
}

export interface SmisHiddenHazardInspectionReportSearchParams extends SmisChecklistSearchParams {
  plannedFrom?: string
  plannedTo?: string
}

export interface SmisReportOrganizationOption {
  id: string
  parentId?: string | null
  organizationCode: string
  organizationName: string
  organizationType: string
  sort: number
  children?: SmisReportOrganizationOption[]
}

export interface SmisHazardGovernanceReportOverview {
  total: number
  closed: number
  open: number
  overdue: number
  major: number
  closureRate: number
}

export interface SmisHazardGovernanceOrganizationStat {
  organizationId?: string | null
  organizationName: string
  hazardCount: number
  closedCount: number
  openCount: number
  overdueCount: number
  majorCount: number
  closureRate: number
}

export interface SmisHazardGovernanceDimensionStat {
  name?: string
  value?: string
  count: number
}

export interface SmisHazardGovernanceCycleStat {
  withinDay: number
  withinThreeDays: number
  withinWeek: number
  withinMonth: number
  overMonth: number
}

export interface SmisHazardGovernanceReportDetail {
  id: string
  hazardNo: string
  organizationName: string
  description: string
  location: string
  hazardLevel?: string
  status: string
  sourceType?: string
  reporterName: string
  reportedAt: string
  rectificationDeadline?: string | null
  rectificationMeasures?: string | null
  rectifierName?: string | null
  rectificationCompletedAt?: string | null
  acceptorName?: string | null
  acceptedAt?: string | null
}

export interface SmisHazardGovernanceReportResult {
  overview: SmisHazardGovernanceReportOverview
  organizationStats: SmisHazardGovernanceOrganizationStat[]
  categoryStats: SmisHazardGovernanceDimensionStat[]
  sourceStats: SmisHazardGovernanceDimensionStat[]
  cycleStats: SmisHazardGovernanceCycleStat
  hazardDetails: SmisHazardGovernanceReportDetail[]
  majorHazards: SmisHazardGovernanceReportDetail[]
  yearOutstanding: SmisHazardGovernanceReportDetail[]
  organizationOptions: SmisReportOrganizationOption[]
}

export interface SmisHazardGovernanceReportSearchParams {
  reportedFrom?: string
  reportedTo?: string
  organizationId?: string
}

export type SmisInspectionStatisticsReportType = 'inspection_rate' | 'missed_rate'

export interface SmisInspectionStatisticsOverview {
  organizationCount: number
  generatedCount: number
  completedCount: number
  pendingCount: number
  missedCount: number
  repeatedMissedCount: number
  inspectionRate: number
  missedRate: number
}

export interface SmisInspectionOrganizationStat {
  organizationId?: string | null
  organizationName: string
  generatedCount: number
  completedCount: number
  pendingCount: number
  missedCount: number
  missedPointCount: number
  missedExecutorCount: number
  repeatedMissedCount: number
  inspectionRate: number
  missedRate: number
  repeatRate: number
}

export interface SmisInspectionRiskLevelOption {
  value: string
  label: string
  color?: string | null
}

export interface SmisInspectionStatisticsResult {
  overview: SmisInspectionStatisticsOverview
  organizationStats: SmisInspectionOrganizationStat[]
  organizationOptions: SmisReportOrganizationOption[]
  riskLevelOptions: SmisInspectionRiskLevelOption[]
}

export interface SmisInspectionStatisticsSearchParams {
  reportType: SmisInspectionStatisticsReportType
  plannedFrom?: string
  plannedTo?: string
  organizationId?: string
  riskLevel?: string
}

export interface SmisInspectionStatisticsDetailRecord {
  id: string
  taskNo: string
  organizationId?: string | null
  organizationName: string
  riskPointName: string
  riskLevelNames: string
  executorName: string
  executorNo: string
  plannedStartAt: string
  plannedEndAt: string
  completedAt?: string | null
  status: string
  inspectionContent: string
  itemCount: number
  normalCount: number
  abnormalCount: number
  missed: boolean
  missedFrequency: number
  repeatedMissed: boolean
}

export interface SmisInspectionPersonnelIssue {
  executorName: string
  executorNo: string
  pendingCount: number
  missedCount: number
  riskPointCount: number
  earliestDeadline: string
}

export interface SmisInspectionStatisticsDetailResult {
  records: SmisInspectionStatisticsDetailRecord[]
  personnelIssues: SmisInspectionPersonnelIssue[]
}

export interface SmisInspectionStatisticsDetailParams extends SmisInspectionStatisticsSearchParams {
  organizationId: string
}

export interface SmisHiddenHazardInspectionRecordOverview {
  inspectorCount: number
  taskCount: number
  completedCount: number
  overdueCount: number
  abnormalTaskCount: number
  completionRate: number
}

export interface SmisInspectionCycleCounts {
  shift: number
  day: number
  week: number
  tenDay: number
  month: number
  quarter: number
  year: number
}

export interface SmisHiddenHazardInspectionPersonnelStat {
  employeeId?: string | null
  employeeName: string
  employeeNo: string
  organizationId?: string | null
  organizationName: string
  positionName: string
  taskCount: number
  completedCount: number
  overdueCount: number
  abnormalTaskCount: number
  completionRate: number
  cycleCounts: SmisInspectionCycleCounts
}

export interface SmisHiddenHazardInspectionRecordDetail {
  id: string
  taskNo: string
  employeeId?: string | null
  employeeName: string
  employeeNo: string
  organizationName: string
  positionName: string
  riskPointName: string
  equipmentName: string
  specialEquipment: boolean
  controlLevel: string
  frequencyUnit: string
  repeatFrequency: number
  plannedStartAt: string
  plannedEndAt: string
  actualStartAt?: string | null
  completedAt?: string | null
  status: string
  riskLevelNames: string
  inspectionContent: string
  controlMeasures: string
  itemCount: number
  normalCount: number
  abnormalCount: number
  pendingItemCount: number
  executionSummary?: string | null
}

export interface SmisHiddenHazardInspectionRecordResult {
  overview: SmisHiddenHazardInspectionRecordOverview
  personnelStats: SmisHiddenHazardInspectionPersonnelStat[]
  details: SmisHiddenHazardInspectionRecordDetail[]
  organizationOptions: SmisReportOrganizationOption[]
}

export interface SmisHiddenHazardInspectionRecordSearchParams {
  plannedFrom?: string
  plannedTo?: string
  organizationId?: string
  executorKeyword?: string
  isSpecialEquipment?: boolean | ''
}

export interface SmisNoHazardPersonnelOverview {
  personnelCount: number
  matchedCount: number
  zeroReportCount: number
  onLeaveCount: number
  averageHazardCount: number
}

export interface SmisNoHazardPersonnelRecord {
  employeeId: string
  employeeNo: string
  employeeName: string
  organizationId?: string | null
  organizationName: string
  positionName: string
  onLeave: boolean
  hazardCount: number
  lastReportedAt?: string | null
}

export interface SmisNoHazardPersonnelStatisticsResult {
  overview: SmisNoHazardPersonnelOverview
  records: SmisNoHazardPersonnelRecord[]
  organizationOptions: SmisReportOrganizationOption[]
}

export interface SmisNoHazardPersonnelStatisticsSearchParams {
  reportedFrom?: string
  reportedTo?: string
  organizationId?: string
  maxHazardCount?: number
  employeeKeyword?: string
}

export interface SmisTeamSelfInspectionCoverageOverview {
  organizationCount: number
  teamCount: number
  memberCount: number
  coveredMemberCount: number
  coverageRate: number
  completedTaskCount: number
}

export interface SmisTeamSelfInspectionCoverageRecord {
  organizationId: string
  organizationName: string
  teamCount: number
  memberCount: number
  coveredMemberCount: number
  coverageRate: number
  taskCount: number
  completedTaskCount: number
  taskCompletionRate: number
}

export interface SmisTeamSelfInspectionCoverageResult {
  overview: SmisTeamSelfInspectionCoverageOverview
  records: SmisTeamSelfInspectionCoverageRecord[]
  organizationOptions: SmisReportOrganizationOption[]
}

export interface SmisTeamSelfInspectionCoverageSearchParams {
  plannedFrom?: string
  plannedTo?: string
  organizationId?: string
}

export interface SmisSpecialEquipmentRiskControlOverview {
  equipmentCount: number
  riskPointCount: number
  highRiskPointCount: number
  riskItemCount: number
  measureCount: number
  taskCount: number
  completedTaskCount: number
  inspectionRate: number
}

export interface SmisSpecialEquipmentRiskLevelStat {
  riskLevelCode: string
  riskLevelName: string
  color?: string | null
  equipmentCount: number
  riskPointCount: number
  riskItemCount: number
  measureCount: number
}

export interface SmisSpecialEquipmentRiskCategoryStat {
  categoryName: string
  equipmentCount: number
  riskPointCount: number
  riskItemCount: number
  measureCount: number
}

export interface SmisSpecialEquipmentCycleStat {
  frequencyUnit: string
  taskCount: number
  completedCount: number
  completionRate: number
}

export interface SmisSpecialEquipmentOrganizationStat {
  organizationId?: string | null
  organizationName: string
  equipmentCount: number
  riskPointCount: number
  taskCount: number
  completedTaskCount: number
  inspectionRate: number
}

export interface SmisSpecialEquipmentRiskDetail {
  equipmentId: string
  equipmentCode: string
  equipmentName: string
  categoryName: string
  organizationId?: string | null
  organizationName: string
  riskPointId?: string | null
  riskPointName: string
  riskLevelCode: string
  riskLevelName: string
  riskLevelColor?: string | null
  riskItemCount: number
  hazardFactors: string
  measureCount: number
  controlMeasures: string
  taskCount: number
  completedTaskCount: number
  inspectionRate: number
}

export interface SmisSpecialEquipmentRiskControlStatisticsResult {
  overview: SmisSpecialEquipmentRiskControlOverview
  riskLevelStats: SmisSpecialEquipmentRiskLevelStat[]
  categoryStats: SmisSpecialEquipmentRiskCategoryStat[]
  cycleStats: SmisSpecialEquipmentCycleStat[]
  organizationStats: SmisSpecialEquipmentOrganizationStat[]
  riskDetails: SmisSpecialEquipmentRiskDetail[]
  organizationOptions: SmisReportOrganizationOption[]
}

export interface SmisSpecialEquipmentRiskControlStatisticsSearchParams {
  organizationId?: string
}

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

export type SmisHazardFactorCategoryStatus = 'enabled' | 'disabled'
export type SmisHazardFactorType = 'human' | 'material' | 'environment' | 'management'
export type SmisHazardFactorCategoryTagStyle =
  'primary' | 'success' | 'info' | 'warning' | 'danger' | ''

export interface SmisHazardFactorCategory {
  id?: string
  tenantId: string
  tenantName?: string
  tenantCode?: string
  factorType: SmisHazardFactorType
  categoryCode: string
  categoryName: string
  sort: number
  textColor?: string | null
  tagStyle: SmisHazardFactorCategoryTagStyle
  status: SmisHazardFactorCategoryStatus
  createBy?: string | null
  createTime?: string
  updateBy?: string | null
  updateTime?: string
}

export interface SmisHazardFactorCategorySearchParams {
  keyword?: string
  factorType?: SmisHazardFactorType
  status?: SmisHazardFactorCategoryStatus
  tagStyle?: Exclude<SmisHazardFactorCategoryTagStyle, ''>
  tenantId?: string | null
  from?: number
  to?: number
}

export interface SmisHazardFactorCategoryOverview {
  total: number
  enabled: number
  disabled: number
  styled: number
}

export interface SmisHazardFactorCategorySavePayload {
  id?: string
  tenantId?: string | null
  factorType: SmisHazardFactorType
  categoryCode: string
  categoryName: string
  sort: number
  textColor?: string | null
  tagStyle: SmisHazardFactorCategoryTagStyle
  status: SmisHazardFactorCategoryStatus
}

export type SmisRiskPointType = 'unset' | 'location' | 'equipment' | 'activity'
export type SmisRiskPointLevel = 'major' | 'high' | 'medium' | 'general' | 'low' | 'unidentified'

export interface SmisRiskIdentificationOrganization {
  id: string
  parentId?: string | null
  organizationCode: string
  organizationName: string
  organizationType?: string
  children?: SmisRiskIdentificationOrganization[]
}

export interface SmisRiskIdentificationSite {
  id: string
  parentId?: string | null
  siteName: string
  organizationId: string
  organizationName?: string | null
  categoryCode: string
  children?: SmisRiskIdentificationSite[]
}

export interface SmisRiskIdentificationEquipment {
  id: string
  equipmentCode: string
  equipmentName: string
  isSpecialEquipment: boolean
  usingOrganizationId: string
}

export interface SmisRiskIdentificationOptions {
  sites: SmisRiskIdentificationSite[]
  organizations: SmisRiskIdentificationOrganization[]
  equipment: SmisRiskIdentificationEquipment[]
  hazardCategories: Array<
    Omit<
      Pick<SmisHazardFactorCategory, 'id' | 'categoryCode' | 'categoryName' | 'factorType'>,
      'id'
    > & { id: string }
  >
}

export interface SmisRiskPoint {
  id: string
  pointNo: string
  pointName: string
  riskType: SmisRiskPointType
  siteId: string
  siteName: string
  equipmentId?: string | null
  equipmentName: string
  isSpecialEquipment: boolean
  controlPlanName?: string | null
  controlPlanAttachmentUrls: string[]
  photoUrls: string[]
  attachmentUrls: string[]
  status: 'enabled' | 'voided'
  sort: number
  organizations: SmisRiskIdentificationOrganization[]
  hazardCount: number
  activityCount: number
  riskScore: number
  riskLevel: SmisRiskPointLevel
  createTime?: string
  updateTime?: string
}

export interface SmisRiskPointSearchParams {
  keyword?: string
  organizationId?: string
  siteId?: string
  equipment?: string
  riskLevel?: SmisRiskPointLevel
  riskType?: SmisRiskPointType
  from?: number
  to?: number
  purpose?: 'list' | 'export'
}

export interface SmisRiskPointOverview {
  total: number
  identified: number
  specialEquipment: number
  unidentified: number
}

export interface SmisRiskPointListResult {
  records: SmisRiskPoint[]
  total: number
  overview: SmisRiskPointOverview
}

export interface SmisRiskPointSavePayload {
  id?: string
  pointName: string
  riskType: SmisRiskPointType
  siteId: string
  equipmentId?: string | null
  equipmentName: string
  isSpecialEquipment: boolean
  controlPlanName?: string | null
  controlPlanAttachmentUrls: string[]
  photoUrls: string[]
  attachmentUrls: string[]
  organizationIds: string[]
  sort: number
}

export interface SmisRiskActivity {
  id: string
  activityName: string
  workStep: string
  sort: number
  hazardCount: number
}

export interface SmisRiskActivitySavePayload {
  id?: string
  riskPointId: string
  activityName: string
  workStep: string
  sort: number
}

export interface SmisRiskHazard {
  id: string
  hazardNo: string
  hazardFactor: string
  factorCategoryId: string
  factorCategoryName?: string | null
  accidentTypes: string[]
  consequence?: string | null
  activityIds: string[]
  status: 'identified' | 'evaluated' | 'voided'
  sort: number
}

export interface SmisRiskHazardSavePayload {
  id?: string
  riskPointId: string
  hazardFactor: string
  factorCategoryId: string
  accidentTypes: string[]
  consequence?: string | null
  activityIds: string[]
  sort: number
}

export interface SmisRiskHazardWorkspace {
  activities: SmisRiskActivity[]
  hazards: SmisRiskHazard[]
}

export type SmisEquipmentCategoryStatus = 'enabled' | 'disabled'
export type SmisEquipmentProfileType =
  | 'general'
  | 'boiler'
  | 'pressure_vessel'
  | 'pressure_pipeline'
  | 'lifting_machinery'
  | 'elevator'
  | 'industrial_vehicle'
  | 'safety_valve'
  | 'pressure_gauge'
  | 'gas_cylinder'

export interface SmisEquipmentInspectionCategory {
  id: string
  tenantId?: string
  categoryCode: string
  categoryName: string
  status: SmisInspectionCategoryStatus
}

export interface SmisEquipmentCategory {
  id?: string
  tenantId?: string
  parentId?: string | null
  parentCategoryName?: string | null
  categoryCode: string
  categoryName: string
  categoryShortName?: string | null
  profileType: SmisEquipmentProfileType
  remark?: string | null
  status: SmisEquipmentCategoryStatus
  sort: number
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
  profileType: SmisEquipmentProfileType
  inspectionCategoryIds: string[]
  remark?: string
  status: SmisEquipmentCategoryStatus
  sort: number
}

export type SmisMaterialStatus = 'enabled' | 'disabled'
export type SmisMaterialType = 'protective_equipment' | 'tool' | 'office_supply'
export type SmisMaterialSource = 'purchase' | 'self_made'

export interface SmisMaterialCategory {
  id?: string
  tenantId?: string
  parentId?: string | null
  parentCategoryName?: string | null
  categoryCode: string
  categoryName: string
  sort: number
  status: SmisMaterialStatus
  description?: string | null
  childCount: number
  materialCount: number
  children?: SmisMaterialCategory[]
  createBy?: string | null
  createTime?: string
  updateBy?: string | null
  updateTime?: string
}

export interface SmisMaterialCategorySearchParams {
  keyword?: string
  status?: SmisMaterialStatus
  ancestorId?: string
  from?: number
  to?: number
}

export interface SmisMaterialCategoryOverview {
  total: number
  enabled: number
  rootCount: number
  usedCount: number
}

export interface SmisMaterialCategorySavePayload {
  id?: string
  parentId?: string | null
  categoryCode: string
  categoryName: string
  sort: number
  status: SmisMaterialStatus
  description?: string
}

export interface SmisMaterial {
  id: string
  tenantId?: string
  categoryId: string
  materialCode: string
  materialName: string
  specificationModel?: string | null
  drawingNo?: string | null
  basicUnit: string
  materialType: SmisMaterialType
  materialSource: SmisMaterialSource
  brand?: string | null
  materialComposition?: string | null
  placeOfOrigin?: string | null
  imageUrls: string[]
  description?: string | null
  status: SmisMaterialStatus
  sort: number
  category: Pick<SmisMaterialCategory, 'id' | 'categoryCode' | 'categoryName'>
  createBy?: string | null
  createTime?: string
  updateBy?: string | null
  updateTime?: string
}

export interface SmisMaterialSearchParams {
  materialName?: string
  materialCode?: string
  specificationModel?: string
  drawingNo?: string
  categoryId?: string
  materialType?: SmisMaterialType
  materialSource?: SmisMaterialSource
  status?: SmisMaterialStatus
  ids?: string[]
  purpose?: 'list' | 'export'
  from?: number
  to?: number
}

export interface SmisMaterialOverview {
  total: number
  enabled: number
  protectiveEquipment: number
  pictured: number
}

export type SmisMaterialSavePayload = Omit<
  SmisMaterial,
  'id' | 'tenantId' | 'category' | 'createBy' | 'createTime' | 'updateBy' | 'updateTime'
> & { id?: string }

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
  tenantId: string
  tenant?: {
    id: string
    tenantName: string
  }
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
      | 'safetyEducationLevel'
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

export type SmisQualificationCatalogType =
  'work_item' | 'work_category' | 'permitted_operation_item' | 'certificate_term'
export type SmisQualificationMaintenanceCatalogType = Exclude<
  SmisQualificationCatalogType,
  'certificate_term'
>
export type SmisQualificationStatus = 'enabled' | 'disabled'

export interface SmisQualificationCatalog {
  id: string
  tenantId?: string
  parentId?: string | null
  parentName?: string | null
  workCategoryId?: string | null
  workCategoryName?: string | null
  workCategoryStatus?: SmisQualificationStatus | null
  catalogType: SmisQualificationCatalogType
  itemCode: string
  itemName: string
  sort: number
  status: SmisQualificationStatus
  remark?: string | null
  childCount: number
  children?: SmisQualificationCatalog[]
  createBy?: string | null
  createTime?: string
  updateBy?: string | null
  updateTime?: string
}

export interface SmisQualificationCatalogNavigationNode extends Omit<
  SmisQualificationCatalog,
  'children'
> {
  nodeKind: 'category' | 'item'
  children?: SmisQualificationCatalogNavigationNode[]
}

export interface SmisQualificationCatalogOverview {
  total: number
  enabled: number
  disabled: number
  rootCount: number
}

export interface SmisQualificationCatalogSearchParams {
  catalogType: SmisQualificationMaintenanceCatalogType
  keyword?: string
  status?: SmisQualificationStatus
  ancestorId?: string
  workCategoryId?: string
  purpose?: 'list' | 'export' | 'option'
  from?: number
  to?: number
}

export interface SmisQualificationCatalogSavePayload {
  id?: string
  catalogType: SmisQualificationMaintenanceCatalogType
  parentId?: string | null
  workCategoryId?: string | null
  itemCode: string
  itemName: string
  sort: number
  status: SmisQualificationStatus
  remark?: string | null
}

export type SmisCertificateCategory =
  | 'special_equipment_personnel'
  | 'special_equipment_operator'
  | 'special_operation'
  | 'safety_manager'
  | 'registered_safety_engineer'
export type SmisCertificateWarningStatus = 'normal' | 'warning'
export type SmisCertificateReminderState = 'normal' | 'warning' | 'expired' | 'dismissed'
export type SmisCertificateDismissalReason = 'offboarded' | 'trained'

export interface SmisCertificateReviewHistory {
  id: string
  previousApprovalDate: string
  previousEffectiveDate: string
  approvalDate: string
  effectiveDate: string
  reviewBy?: string | null
  reviewTime: string
}

export interface SmisPersonnelCertificateItem {
  id?: string
  catalogId: string
  catalogType: SmisQualificationCatalogType
  workCategoryId?: string | null
  workCategoryName?: string | null
  workCode: string
  workName: string
  approvalDate: string
  effectiveDate: string
  reminderDays: number
  dismissalReason?: SmisCertificateDismissalReason | null
  reminderState: SmisCertificateReminderState
  reviewCount: number
  reviewHistory: SmisCertificateReviewHistory[]
  sort: number
}

export interface SmisPersonnelCertificate {
  id: string
  tenantId?: string
  employeeId: string
  employeeNo: string
  employeeName: string
  gender?: string | null
  idCardNo?: string | null
  educationLevel?: string | null
  phone?: string | null
  jobTitle?: string | null
  avatarUrl?: string | null
  organizationName?: string | null
  certificateCategory: SmisCertificateCategory
  certificateNumber: string
  issuingAuthority?: string | null
  archiveNumber?: string | null
  certificatePhotoUrl?: string | null
  warningStatus: SmisCertificateWarningStatus
  reminderState: Exclude<SmisCertificateReminderState, 'dismissed'>
  nearestEffectiveDate?: string | null
  extraFields: Record<string, string>
  remark?: string | null
  items: SmisPersonnelCertificateItem[]
  createBy?: string | null
  createTime?: string
  updateBy?: string | null
  updateTime?: string
}

export interface SmisPersonnelCertificateOverview {
  total: number
  normal: number
  warning: number
  expired: number
  employees: number
}

export interface SmisPersonnelCertificateSearchParams {
  employeeName?: string
  certificateNumber?: string
  certificateCategory?: SmisCertificateCategory
  effectiveDateRange?: string[]
  warningStatus?: SmisCertificateWarningStatus
  purpose?: 'list' | 'export'
  from?: number
  to?: number
}

export interface SmisPersonnelCertificateItemSavePayload {
  id?: string
  catalogId: string
  approvalDate: string
  effectiveDate: string
  reminderDays: number
  dismissalReason?: SmisCertificateDismissalReason | null
}

export interface SmisPersonnelCertificateSavePayload {
  id?: string
  employeeId: string
  certificateCategory: SmisCertificateCategory
  certificateNumber: string
  issuingAuthority?: string | null
  archiveNumber?: string | null
  certificatePhotoUrl?: string | null
  warningStatus: SmisCertificateWarningStatus
  extraFields: Record<string, string>
  remark?: string | null
  items: SmisPersonnelCertificateItemSavePayload[]
}

export interface SmisSafetyQualificationAnalysisSearchParams {
  startDate?: string
  endDate?: string
  organizationId?: string
}

export interface SmisSafetyQualificationCertificateCounts {
  specialEquipmentPersonnel: number
  specialEquipmentOperator: number
  specialOperation: number
  safetyManager: number
  registeredSafetyEngineer: number
  total: number
}

export interface SmisSafetyQualificationAnalysisOverview {
  totalCertificates: number
  certificateHolders: number
  warningCount: number
  expiringInRange: number
  dismissedInRange: number
  addedInRange: number
}

export interface SmisSafetyQualificationOrganizationStat extends SmisSafetyQualificationCertificateCounts {
  organizationId: string
  organizationName: string
}

export interface SmisSafetyQualificationHolderStat {
  employeeId: string
  employeeName: string
  employeeNo: string
  organizationName?: string | null
  certificateCount: number
  certificateCategories: SmisCertificateCategory[]
}

export interface SmisSafetyQualificationPeriodStat extends SmisSafetyQualificationCertificateCounts {
  organizationId: string
  organizationName: string
  metric: 'reminder' | 'dismissed' | 'added'
}

export interface SmisSafetyQualificationEquipmentProjectStat {
  workCode: string
  workName: string
  safetyManagerCount: number
  operatorCount: number
  total: number
}

export interface SmisSafetyQualificationSpecialOperationStat {
  workCategoryName: string
  workName: string
  count: number
}

export interface SmisSafetyQualificationDimensionStat {
  dimension:
    'unitType' | 'occupationType' | 'safetyOfficerType' | 'engineerType' | 'practiceCategory'
  value: string
  count: number
}

export interface SmisSafetyQualificationEducationStat {
  educationLevel: string
  safetyManagerCount: number
  registeredSafetyEngineerCount: number
  total: number
}

export interface SmisSafetyQualificationOrganizationOption {
  id: string
  parentId?: string | null
  organizationCode: string
  organizationName: string
  sort: number
  children?: SmisSafetyQualificationOrganizationOption[]
}

export interface SmisSafetyQualificationAnalysisResult {
  overview: SmisSafetyQualificationAnalysisOverview
  organizationDistribution: SmisSafetyQualificationOrganizationStat[]
  topHolders: SmisSafetyQualificationHolderStat[]
  periodStats: SmisSafetyQualificationPeriodStat[]
  equipmentProjects: SmisSafetyQualificationEquipmentProjectStat[]
  specialOperations: SmisSafetyQualificationSpecialOperationStat[]
  safetyManagerTypes: SmisSafetyQualificationDimensionStat[]
  registeredEngineerTypes: SmisSafetyQualificationDimensionStat[]
  educationDistribution: SmisSafetyQualificationEducationStat[]
  organizationOptions: SmisSafetyQualificationOrganizationOption[]
}

export type SmisSafetyTrainingPlanStatus = 'draft' | 'published' | 'completed' | 'cancelled'
export type SmisSafetyTrainingExecutionStatus = 'not_started' | 'in_progress' | 'ended'
export type SmisSafetyTrainingRecordStatus = 'draft' | 'submitted'
export type SmisSafetyTrainingAttendanceStatus = 'pending' | 'present' | 'absent' | 'leave'
export type SmisSafetyTrainingSignMethod = 'manual' | 'qrcode' | 'import'
export type SmisSafetyTrainingAssessmentResult = 'not_assessed' | 'pass' | 'fail'

export interface SmisSafetyTrainingOrganizationOption {
  id: string
  parentId?: string | null
  organizationCode: string
  organizationName: string
  sort: number
  children?: SmisSafetyTrainingOrganizationOption[]
}

export interface SmisSafetyTrainingParticipant {
  employeeId: string
  employeeNo: string
  employeeName: string
  organizationId?: string | null
  organizationName?: string | null
  jobTitle?: string | null
  phone?: string | null
}

export interface SmisSafetyTrainingAttendance extends SmisSafetyTrainingParticipant {
  attendanceStatus: SmisSafetyTrainingAttendanceStatus
  checkInAt?: string | null
  signMethod?: SmisSafetyTrainingSignMethod | null
  score?: number | null
  assessmentResult: SmisSafetyTrainingAssessmentResult
  remark?: string | null
}

export interface SmisSafetyTrainingPlan {
  id: string
  tenantId: string
  planNo: string
  subject: string
  trainingCategory: string
  trainingType: string
  trainingForm: string
  trainingLevel: string
  organizerOrganizationId: string
  organizerOrganizationName: string
  targetOrganizationId?: string | null
  targetOrganizationName?: string | null
  responsibleEmployeeId?: string | null
  responsibleEmployeeNo?: string | null
  responsibleEmployeeName?: string | null
  instructorName?: string | null
  plannedStartAt: string
  plannedEndAt: string
  location?: string | null
  content: string
  requirements?: string | null
  trainingHours: number
  assessmentMethod: string
  warningStatus: 'normal' | 'warning'
  status: SmisSafetyTrainingPlanStatus
  executionStatus: SmisSafetyTrainingExecutionStatus
  attachmentUrls: string[]
  remark?: string | null
  participantCount: number
  participants: SmisSafetyTrainingParticipant[]
  recordId?: string | null
  recordNo?: string | null
  recordStatus?: SmisSafetyTrainingRecordStatus | null
  createBy?: string | null
  createTime: string
  updateBy?: string | null
  updateTime: string
}

export interface SmisSafetyTrainingPlanOverview {
  total: number
  draft: number
  published: number
  completed: number
  warning: number
}

export interface SmisSafetyTrainingPlanSearchParams {
  keyword?: string
  status?: SmisSafetyTrainingPlanStatus
  executionStatus?: SmisSafetyTrainingExecutionStatus
  trainingCategory?: string
  organizationId?: string
  dateRange?: string[]
  warningStatus?: 'normal' | 'warning'
  purpose?: 'list' | 'export'
  from?: number
  to?: number
}

export interface SmisSafetyTrainingPlanSavePayload {
  id?: string
  subject: string
  trainingCategory: string
  trainingType: string
  trainingForm: string
  trainingLevel: string
  organizerOrganizationId: string
  targetOrganizationId?: string | null
  responsibleEmployeeId?: string | null
  instructorName?: string | null
  plannedStartAt: string
  plannedEndAt: string
  location?: string | null
  content: string
  requirements?: string | null
  trainingHours: number
  assessmentMethod: string
  warningStatus: 'normal' | 'warning'
  attachmentUrls: string[]
  remark?: string | null
  participantIds: string[]
}

export interface SmisSafetyTrainingPlanListResult {
  records: SmisSafetyTrainingPlan[]
  total: number
  overview: SmisSafetyTrainingPlanOverview
  organizations: SmisSafetyTrainingOrganizationOption[]
}

export interface SmisSafetyTrainingPlanOption {
  id: string
  planNo: string
  subject: string
  plannedStartAt: string
  plannedEndAt: string
  location?: string | null
  instructorName?: string | null
  trainingHours: number
  content: string
  assessmentMethod: string
  participants: SmisSafetyTrainingParticipant[]
}

export interface SmisSafetyTrainingRecord {
  id: string
  tenantId: string
  trainingPlanId: string
  recordNo: string
  planNo: string
  subject: string
  trainingCategory: string
  trainingType: string
  trainingForm: string
  trainingLevel: string
  organizerOrganizationId: string
  organizerOrganizationName: string
  targetOrganizationId?: string | null
  targetOrganizationName?: string | null
  assessmentMethod: string
  actualStartAt?: string | null
  actualEndAt?: string | null
  location?: string | null
  instructorName?: string | null
  lecturerName?: string | null
  trainingContent?: string | null
  trainingHours: number
  effectEvaluation?: string | null
  attachmentUrls: string[]
  signInAttachmentUrls: string[]
  status: SmisSafetyTrainingRecordStatus
  submittedAt?: string | null
  submittedBy?: string | null
  remark?: string | null
  participantCount: number
  presentCount: number
  attendanceRate: number
  participants: SmisSafetyTrainingAttendance[]
  createBy?: string | null
  createTime: string
  updateBy?: string | null
  updateTime: string
}

export interface SmisSafetyTrainingRecordOverview {
  total: number
  draft: number
  submitted: number
  participantCount: number
  presentCount: number
}

export interface SmisSafetyTrainingRecordSearchParams {
  keyword?: string
  status?: SmisSafetyTrainingRecordStatus
  dateRange?: string[]
  organizationId?: string
  purpose?: 'list' | 'export'
  from?: number
  to?: number
}

export interface SmisSafetyTrainingRecordSavePayload {
  id?: string
  trainingPlanId: string
  actualStartAt?: string | null
  actualEndAt?: string | null
  location?: string | null
  instructorName?: string | null
  lecturerName?: string | null
  trainingContent?: string | null
  trainingHours: number
  effectEvaluation?: string | null
  attachmentUrls: string[]
  signInAttachmentUrls: string[]
  remark?: string | null
  participants: Array<{
    employeeId: string
    attendanceStatus: SmisSafetyTrainingAttendanceStatus
    checkInAt?: string | null
    signMethod?: SmisSafetyTrainingSignMethod | null
    score?: number | null
    assessmentResult: SmisSafetyTrainingAssessmentResult
    remark?: string | null
  }>
}

export interface SmisSafetyTrainingRecordListResult {
  records: SmisSafetyTrainingRecord[]
  total: number
  overview: SmisSafetyTrainingRecordOverview
  planOptions: SmisSafetyTrainingPlanOption[]
  organizations: SmisSafetyTrainingOrganizationOption[]
}

export interface SmisSafetyTrainingReportSearchParams {
  startDate?: string
  endDate?: string
  organizationId?: string
}

export interface SmisSafetyTrainingReportOverview {
  planCount: number
  completedPlanCount: number
  recordCount: number
  plannedPersonTimes: number
  actualPersonTimes: number
  trainingHours: number
  outstandingCount: number
  completionRate: number
  attendanceRate: number
}

export interface SmisSafetyTrainingOrganizationStat {
  organizationId: string
  organizationName: string
  planCount: number
  recordCount: number
  plannedPersonTimes: number
  actualPersonTimes: number
  trainingHours: number
  completionRate: number
  attendanceRate: number
}

export interface SmisSafetyTrainingMonthlyTrend {
  month: string
  planCount: number
  recordCount: number
  attendanceCount: number
  trainingHours: number
}

export interface SmisSafetyTrainingCategoryStat {
  dimension: 'trainingCategory' | 'trainingType' | 'trainingForm'
  value: string
  planCount: number
}

export interface SmisSafetyTrainingAttendanceStat {
  value: SmisSafetyTrainingAttendanceStatus
  count: number
}

export interface SmisSafetyTrainingOutstandingPlan {
  id: string
  planNo: string
  subject: string
  organizationName: string
  plannedEndAt: string
  warningStatus: 'normal' | 'warning'
  participantCount: number
}

export interface SmisSafetyTrainingReportResult {
  overview: SmisSafetyTrainingReportOverview
  organizationStats: SmisSafetyTrainingOrganizationStat[]
  monthlyTrend: SmisSafetyTrainingMonthlyTrend[]
  categoryStats: SmisSafetyTrainingCategoryStat[]
  attendanceStats: SmisSafetyTrainingAttendanceStat[]
  outstandingPlans: SmisSafetyTrainingOutstandingPlan[]
  organizationOptions: SmisSafetyTrainingOrganizationOption[]
}

export type SmisQuestionType = 'single' | 'multiple' | 'judgement'
export type SmisQuestionStatus = 'enabled' | 'disabled'
export type SmisExamPaperStatus = 'draft' | 'published' | 'closed'
export type SmisExamStatus = 'not_started' | 'in_progress' | 'passed' | 'failed'
export type SmisCourseStatus = 'draft' | 'published' | 'closed'
export type SmisLearningStatus = 'assigned' | 'in_progress' | 'completed'

export interface SmisQuestionCategory {
  id: string
  parentId?: string | null
  categoryName: string
  status: SmisQuestionStatus
  sort: number
  remark?: string | null
  questionCount: number
}

export interface SmisQuestionOption {
  key: string
  content: string
}

export interface SmisQuestion {
  id: string
  categoryId: string
  categoryName: string
  questionType: SmisQuestionType
  stem: string
  options: SmisQuestionOption[]
  correctAnswers: string[]
  analysis?: string | null
  defaultScore: number
  status: SmisQuestionStatus
  createTime: string
  updateTime: string
}

export interface SmisQuestionBankSearchParams {
  keyword?: string
  categoryId?: string
  questionType?: SmisQuestionType
  status?: SmisQuestionStatus
  from?: number
  to?: number
}

export interface SmisQuestionBankOverview {
  total: number
  enabled: number
  single: number
  multiple: number
  judgement: number
}
export interface SmisQuestionBankListResult {
  records: SmisQuestion[]
  total: number
  overview: SmisQuestionBankOverview
  categories: SmisQuestionCategory[]
}
export interface SmisQuestionCategoryPayload {
  id?: string
  parentId?: string | null
  categoryName: string
  status: SmisQuestionStatus
  sort: number
  remark?: string | null
}
export interface SmisQuestionPayload {
  id?: string
  categoryId: string
  questionType: SmisQuestionType
  stem: string
  options: SmisQuestionOption[]
  correctAnswers: string[]
  analysis?: string | null
  defaultScore: number
  status: SmisQuestionStatus
}

export interface SmisExamQuestionSelection {
  id: string
  questionId: string
  categoryId?: string
  categoryName?: string
  questionType: SmisQuestionType
  stem: string
  score: number
  options?: SmisQuestionOption[]
  correctAnswers?: string[] | null
  analysis?: string | null
  answerValues?: string[]
  isCorrect?: boolean | null
  awardedScore?: number | null
  sort?: number
}

export interface SmisRandomRule {
  categoryId?: string | null
  questionType?: SmisQuestionType | null
  count: number
  score: number
}

export interface SmisExamPaper {
  id: string
  paperNo: string
  paperTitle: string
  assemblyMode: 'fixed' | 'random'
  randomRule: SmisRandomRule[]
  totalScore: number
  passingScore: number
  timeLimitMinutes?: number | null
  allowRetake: boolean
  maxAttempts: number
  openAt?: string | null
  closeAt?: string | null
  status: SmisExamPaperStatus
  remark?: string | null
  questionCount: number
  assigneeCount: number
  assignmentId?: string | null
  examStatus?: SmisExamStatus | null
  attemptCount?: number | null
  bestScore?: number | null
  createTime: string
  updateTime: string
}

export interface SmisExamPaperSearchParams {
  keyword?: string
  status?: SmisExamPaperStatus
  scope?: 'manage' | 'mine'
  from?: number
  to?: number
}
export interface SmisExamPaperOverview {
  total: number
  draft: number
  published: number
  inProgress: number
  completed: number
}
export interface SmisExamPaperListResult {
  records: SmisExamPaper[]
  total: number
  overview: SmisExamPaperOverview
}
export interface SmisExamPaperPayload {
  id?: string
  paperNo?: string
  paperTitle: string
  assemblyMode: 'fixed' | 'random'
  randomRule: SmisRandomRule[]
  passingScore: number
  timeLimitMinutes?: number | null
  allowRetake: boolean
  maxAttempts: number
  openAt?: string | null
  closeAt?: string | null
  remark?: string | null
  questions: Array<{ questionId: string; score: number }>
  employeeIds: string[]
}

export interface SmisExamAttempt {
  id: string
  attemptNo: number
  attemptStatus: 'in_progress' | 'graded'
  startedAt: string
  expiresAt?: string | null
  submittedAt?: string | null
  durationSeconds?: number | null
  score?: number | null
  passed?: boolean | null
}

export interface SmisExamDetail {
  paper: SmisExamPaper
  attempt?: SmisExamAttempt | null
  questions: SmisExamQuestionSelection[]
}
export interface SmisExamRecord extends SmisExamAttempt {
  paperId: string
  paperNo: string
  paperTitle: string
  totalScore: number
  passingScore: number
  employeeId: string
  employeeNo: string
  employeeName: string
  organizationName?: string | null
  jobTitle?: string | null
}
export interface SmisExamRecordSearchParams {
  keyword?: string
  status?: 'in_progress' | 'passed' | 'failed'
  from?: number
  to?: number
}
export interface SmisExamRecordOverview {
  total: number
  inProgress: number
  passed: number
  failed: number
}
export interface SmisExamRecordListResult {
  records: SmisExamRecord[]
  total: number
  overview: SmisExamRecordOverview
}

export interface SmisLearningCourse {
  id: string
  courseNo: string
  courseName: string
  courseCategory: string
  courseType: 'video' | 'pdf' | 'link'
  resourceUrl?: string | null
  coverUrl?: string | null
  introduction?: string | null
  minimumLearningMinutes: number
  creditHours: number
  dueDate?: string | null
  examPaperId?: string | null
  examPaperTitle?: string | null
  status: SmisCourseStatus
  learnerCount: number
  completedCount: number
  assignmentId?: string | null
  learningStatus?: SmisLearningStatus | null
  progressPercent?: number | null
  totalLearningSeconds?: number | null
  startedAt?: string | null
  lastLearningAt?: string | null
  completedAt?: string | null
  createTime: string
  updateTime: string
}

export interface SmisCourseSearchParams {
  keyword?: string
  status?: SmisCourseStatus
  category?: string
  scope?: 'manage' | 'mine'
  from?: number
  to?: number
}
export interface SmisCourseOverview {
  total: number
  draft: number
  published: number
  learning: number
  completed: number
}
export interface SmisCourseListResult {
  records: SmisLearningCourse[]
  total: number
  overview: SmisCourseOverview
}
export interface SmisCoursePayload {
  id?: string
  courseNo?: string
  courseName: string
  courseCategory: string
  courseType: 'video' | 'pdf' | 'link'
  resourceUrl?: string | null
  coverUrl?: string | null
  introduction?: string | null
  minimumLearningMinutes: number
  creditHours: number
  dueDate?: string | null
  examPaperId?: string | null
  employeeIds: string[]
}
export interface SmisCourseLearningRecord {
  id: string
  courseId: string
  courseNo: string
  courseName: string
  minimumLearningMinutes: number
  dueDate?: string | null
  employeeId: string
  employeeNo: string
  employeeName: string
  organizationName?: string | null
  jobTitle?: string | null
  learningStatus: SmisLearningStatus
  progressPercent: number
  totalLearningSeconds: number
  startedAt?: string | null
  lastLearningAt?: string | null
  completedAt?: string | null
}
export interface SmisCourseLearningSearchParams {
  keyword?: string
  status?: SmisLearningStatus
  from?: number
  to?: number
}
export interface SmisCourseLearningOverview {
  total: number
  assigned: number
  inProgress: number
  completed: number
}
export interface SmisCourseLearningListResult {
  records: SmisCourseLearningRecord[]
  total: number
  overview: SmisCourseLearningOverview
}

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
