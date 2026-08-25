export interface SmisPositionOption {
  id: string
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
  hazardContent: string
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
