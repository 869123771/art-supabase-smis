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
