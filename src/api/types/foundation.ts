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
