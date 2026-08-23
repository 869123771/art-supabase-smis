import type { SafetyWorkspaceKind } from './safety-module-catalog'

export type SafetyWorkspaceExperience =
  | 'tree'
  | 'ledger'
  | 'master-detail'
  | 'workflow'
  | 'analytics'
  | 'exam'
  | 'risk-map'
  | 'special-work'
  | 'inventory'

export type SafetyWorkspaceCapability =
  | 'attachments'
  | 'approval'
  | 'child-records'
  | 'employee-reference'
  | 'exam-paper'
  | 'inventory-balance'
  | 'print'
  | 'qr-code'
  | 'recurrence'
  | 'risk-matrix'
  | 'timeline'
  | 'visual-map'

export interface SafetyModuleExperienceDefinition {
  experience: SafetyWorkspaceExperience
  documentPages: readonly number[]
  capabilities: readonly SafetyWorkspaceCapability[]
}

const experience = (
  workspace: SafetyWorkspaceExperience,
  documentPages: readonly number[],
  capabilities: readonly SafetyWorkspaceCapability[] = []
): SafetyModuleExperienceDefinition => ({ experience: workspace, documentPages, capabilities })

const tree = (pages: readonly number[]) => experience('tree', pages, ['child-records'])
const ledger = (
  pages: readonly number[],
  capabilities: readonly SafetyWorkspaceCapability[] = []
) => experience('ledger', pages, capabilities)
const masterDetail = (
  pages: readonly number[],
  capabilities: readonly SafetyWorkspaceCapability[] = []
) => experience('master-detail', pages, ['child-records', ...capabilities])
const workflow = (
  pages: readonly number[],
  capabilities: readonly SafetyWorkspaceCapability[] = []
) => experience('workflow', pages, ['approval', 'timeline', ...capabilities])
const analytics = (pages: readonly number[]) => experience('analytics', pages)

/**
 * AI+安全功能模块开发 V1.0 的逐菜单验收矩阵。
 *
 * 每项必须指向文档页码和专用交互形态。禁止让业务菜单回退为“新增一条 JSON 记录”式的
 * 通用 CRUD；同一交互骨架可以复用，但页面行为必须由这里声明的能力驱动。
 */
export const safetyModuleExperienceMap: Record<string, SafetyModuleExperienceDefinition> = {
  'equipment-category': tree([4]),
  'storage-location': tree([5]),
  'equipment-depreciation': ledger([5]),
  'equipment-ledger': masterDetail([6, 7, 8], ['attachments', 'qr-code']),
  'equipment-attachment': ledger([7, 8], ['attachments']),
  'external-inspection': ledger([8, 9], ['attachments']),
  'internal-inspection': ledger([8, 9], ['attachments']),
  'annual-inspection': ledger([8, 9], ['attachments']),
  'periodic-inspection': ledger([8, 9], ['attachments']),
  'special-equipment-personnel': masterDetail([9, 10], ['employee-reference', 'attachments']),
  'special-equipment-operator': masterDetail([10], ['employee-reference', 'attachments']),
  'special-operation-category': tree([10]),
  'special-operation-certificate': masterDetail([11], ['employee-reference', 'attachments']),
  'safety-manager-certificate': ledger([11], ['employee-reference', 'attachments']),
  'registered-safety-engineer': ledger([11, 12], ['employee-reference', 'attachments']),
  'qualification-analysis': analytics([12, 13]),
  'training-plan': workflow([13, 14], ['employee-reference', 'recurrence', 'child-records']),
  'training-record': masterDetail([14, 15], ['employee-reference', 'attachments']),
  'training-analysis': analytics([15]),
  'course-management': masterDetail([16], ['attachments', 'employee-reference']),
  'exam-management': experience(
    'exam',
    [17, 18, 19, 20, 21, 22, 23],
    ['exam-paper', 'employee-reference', 'approval', 'timeline']
  ),
  'question-bank': experience('exam', [23, 24], ['exam-paper', 'child-records']),
  'major-hazard-ledger': masterDetail([25], ['attachments', 'employee-reference']),
  'emergency-plan': ledger([25], ['attachments']),
  'emergency-drill-plan': workflow([25, 26], ['employee-reference', 'recurrence']),
  'emergency-drill-record': masterDetail([26], ['employee-reference', 'attachments']),
  'emergency-drill-analysis': analytics([26]),
  'casualty-quick-report': workflow([27], ['employee-reference', 'attachments']),
  'work-injury-declaration': workflow([27, 28], ['employee-reference', 'attachments']),
  'accident-analysis': analytics([28, 29]),
  'work-injury-document': ledger([29], ['employee-reference', 'attachments']),
  'historical-accident-case': masterDetail([29, 30], ['attachments']),
  'safety-accident-statistics': analytics([30]),
  'ppe-category': tree([30, 31]),
  'ppe-issue-standard': masterDetail([31], ['employee-reference']),
  'ppe-personal-standard': masterDetail([31], ['employee-reference']),
  'ppe-issue-record': masterDetail([31, 32], ['employee-reference']),
  'ppe-personal-claim': workflow([32], ['employee-reference']),
  'tool-category': tree([32]),
  'tool-issue-standard': masterDetail([32, 33], ['employee-reference']),
  'tool-personal-standard': masterDetail([33], ['employee-reference']),
  'tool-issue-record': masterDetail([33], ['employee-reference']),
  'tool-personal-claim': workflow([33], ['employee-reference']),
  'tool-return': workflow([33, 34], ['employee-reference']),
  'violation-education': workflow([34], ['employee-reference', 'attachments']),
  'violation-category': tree([34, 35]),
  'anti-violation-standard': masterDetail([35], ['child-records']),
  'violation-record': workflow([35, 36, 37], ['employee-reference', 'attachments']),
  'safety-knowledge': ledger([37], ['attachments']),
  'safety-regulation': ledger([37], ['attachments']),
  'hazard-factor-category': tree([38, 39]),
  'risk-level-control': masterDetail([40, 41, 42], ['employee-reference', 'risk-matrix']),
  'risk-inspection-task': workflow([43, 44], ['employee-reference', 'attachments']),
  'risk-assessment-standard': experience('master-detail', [45], ['child-records', 'risk-matrix']),
  'risk-four-color-map': experience('risk-map', [46], ['visual-map']),
  'quantitative-risk-control': masterDetail([47], ['risk-matrix', 'child-records']),
  'inspection-plan': workflow([48, 49], ['employee-reference', 'recurrence']),
  'inspection-task': workflow([50, 51], ['employee-reference', 'attachments']),
  'danger-governance': workflow([51, 52, 53, 54], ['employee-reference', 'attachments']),
  'inspection-form': masterDetail([54], ['child-records']),
  'safety-inspection': masterDetail([55], ['employee-reference', 'attachments']),
  'inspection-rectification': workflow([55], ['employee-reference', 'attachments']),
  'inspection-type': tree([56]),
  'snapshot-report': workflow([57], ['employee-reference', 'attachments']),
  'public-danger-report': workflow([57], ['attachments']),
  'danger-statistics': analytics([58]),
  'special-work-management': experience(
    'special-work',
    [58, 59],
    ['approval', 'timeline', 'employee-reference', 'print']
  ),
  'hot-work': experience(
    'special-work',
    [59, 60, 61],
    ['approval', 'timeline', 'employee-reference', 'attachments', 'print']
  ),
  'work-at-height': experience(
    'special-work',
    [61, 62],
    ['approval', 'timeline', 'employee-reference', 'attachments', 'print']
  ),
  'lifting-work': experience(
    'special-work',
    [63, 64],
    ['approval', 'timeline', 'employee-reference', 'attachments', 'print']
  ),
  'confined-space-work': experience(
    'special-work',
    [64, 65],
    ['approval', 'timeline', 'employee-reference', 'attachments', 'print']
  ),
  'temporary-electricity': experience(
    'special-work',
    [66, 67],
    ['approval', 'timeline', 'employee-reference', 'attachments', 'print']
  ),
  'road-breaking-work': experience(
    'special-work',
    [67, 68],
    ['approval', 'timeline', 'employee-reference', 'attachments', 'print']
  ),
  'blind-plate-work': experience(
    'special-work',
    [69, 70],
    ['approval', 'timeline', 'employee-reference', 'attachments', 'print']
  ),
  'hazardous-work': experience(
    'special-work',
    [70, 71],
    ['approval', 'timeline', 'employee-reference', 'attachments', 'print']
  ),
  'hazardous-waste-inbound': experience(
    'inventory',
    [72],
    ['inventory-balance', 'employee-reference', 'attachments']
  ),
  'hazardous-waste-outbound': experience(
    'inventory',
    [73],
    ['inventory-balance', 'employee-reference', 'attachments']
  ),
  'hazardous-waste-catalog': experience(
    'inventory',
    [72, 74],
    ['inventory-balance', 'child-records']
  )
}

export function inferExperienceFromKind(kind: SafetyWorkspaceKind): SafetyWorkspaceExperience {
  if (kind === 'tree' || kind === 'dictionary') return 'tree'
  if (kind === 'report') return 'analytics'
  if (kind === 'workflow') return 'workflow'
  return 'ledger'
}
