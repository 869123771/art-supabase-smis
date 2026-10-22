import type {
  SmisSafetyQualificationAnalysisResult,
  SmisHazardGovernanceReportResult,
  SmisSpecialEquipmentRiskControlStatisticsResult,
  SmisInspectionStatisticsResult,
  SmisHiddenHazardInspectionRecordResult,
  SmisTeamSelfInspectionCoverageResult,
  SmisNoHazardPersonnelStatisticsResult
} from '@smis/api/types'

/** Fresh read models shared by report initialization and incomplete API envelopes. */
export const emptySafetyQualificationAnalysis = (): SmisSafetyQualificationAnalysisResult => ({
  overview: {
    totalCertificates: 0,
    certificateHolders: 0,
    warningCount: 0,
    expiringInRange: 0,
    dismissedInRange: 0,
    addedInRange: 0
  },
  organizationDistribution: [],
  topHolders: [],
  periodStats: [],
  equipmentProjects: [],
  specialOperations: [],
  safetyManagerTypes: [],
  registeredEngineerTypes: [],
  educationDistribution: [],
  organizationOptions: []
})

export const emptyHazardGovernanceReport = (): SmisHazardGovernanceReportResult => ({
  overview: { total: 0, closed: 0, open: 0, overdue: 0, major: 0, closureRate: 0 },
  organizationStats: [],
  categoryStats: [],
  sourceStats: [],
  cycleStats: {
    withinDay: 0,
    withinThreeDays: 0,
    withinWeek: 0,
    withinMonth: 0,
    overMonth: 0
  },
  hazardDetails: [],
  majorHazards: [],
  yearOutstanding: [],
  organizationOptions: []
})

export const emptySpecialEquipmentRiskControl =
  (): SmisSpecialEquipmentRiskControlStatisticsResult => ({
    overview: {
      equipmentCount: 0,
      riskPointCount: 0,
      highRiskPointCount: 0,
      riskItemCount: 0,
      measureCount: 0,
      taskCount: 0,
      completedTaskCount: 0,
      inspectionRate: 0
    },
    riskLevelStats: [],
    categoryStats: [],
    cycleStats: [],
    organizationStats: [],
    riskDetails: [],
    organizationOptions: []
  })

export const emptyInspectionStatistics = (): SmisInspectionStatisticsResult => ({
  overview: {
    organizationCount: 0,
    generatedCount: 0,
    completedCount: 0,
    pendingCount: 0,
    missedCount: 0,
    repeatedMissedCount: 0,
    inspectionRate: 0,
    missedRate: 0
  },
  organizationStats: [],
  organizationOptions: [],
  riskLevelOptions: []
})

export const emptyHiddenHazardInspectionRecord = (): SmisHiddenHazardInspectionRecordResult => ({
  overview: {
    inspectorCount: 0,
    taskCount: 0,
    completedCount: 0,
    overdueCount: 0,
    abnormalTaskCount: 0,
    completionRate: 0
  },
  personnelStats: [],
  details: [],
  organizationOptions: []
})

export const emptyTeamSelfInspectionCoverage = (): SmisTeamSelfInspectionCoverageResult => ({
  overview: {
    organizationCount: 0,
    teamCount: 0,
    memberCount: 0,
    coveredMemberCount: 0,
    coverageRate: 0,
    completedTaskCount: 0
  },
  records: [],
  organizationOptions: []
})

export const emptyNoHazardPersonnelStatistics = (): SmisNoHazardPersonnelStatisticsResult => ({
  overview: {
    personnelCount: 0,
    matchedCount: 0,
    zeroReportCount: 0,
    onLeaveCount: 0,
    averageHazardCount: 0
  },
  records: [],
  organizationOptions: []
})
