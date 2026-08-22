import { writeFileSync } from 'node:fs'
import path from 'node:path'
import { safetyModuleCatalog } from '../src/domain/safety-module-catalog'

interface MenuNode {
  key: string
  parentKey?: string
  name: string
  title: string
  path: string
  component: string
  icon?: string
  sort: number
  type: 'folder' | 'menu' | 'button'
  catalogCode?: string
}

const nodes: MenuNode[] = []
const add = (node: MenuNode): void => {
  nodes.push(node)
}

add({
  key: 'root',
  name: 'SmisApplication',
  title: 'SMIS 安全生产',
  path: '/smis',
  component: '/index/index',
  icon: 'ri:shield-check-line',
  sort: 40,
  type: 'folder'
})
add({
  key: 'dashboard',
  parentKey: 'root',
  name: 'SmisSafetyDashboard',
  title: '安全生产驾驶舱',
  path: 'dashboard',
  component: '/smis/dashboard',
  icon: 'ri:dashboard-3-line',
  sort: 1,
  type: 'menu'
})

const topLevel = [
  ['equipment', '设备台账', 'ri:archive-stack-line'],
  ['qualification', '培训资质', 'ri:graduation-cap-line'],
  ['production', '安全生产', 'ri:shield-star-line'],
  ['dual-control', '双控体系', 'ri:radar-line'],
  ['special-work', '特殊作业', 'ri:fire-line'],
  ['hazardous-waste', '危废管理', 'ri:recycle-line']
] as const

topLevel.forEach(([key, title, icon], index) =>
  add({
    key,
    parentKey: 'root',
    name: `Smis${key.replace(/(^|-)(\w)/g, (_, _dash, value: string) => value.toUpperCase())}`,
    title,
    path: key,
    component: '/index/index',
    icon,
    sort: (index + 1) * 10,
    type: 'folder'
  })
)

const folders = [
  ['equipment-ledger-folder', 'equipment', '设备台账', 'ledger'],
  ['safety-qualification', 'qualification', '安全资质管理', 'safety-qualification'],
  ['training-management', 'qualification', '培训管理', 'training-management'],
  ['emergency-rescue', 'production', '应急救援', 'emergency-rescue'],
  ['safety-accident', 'production', '安全事故', 'safety-accident'],
  ['ppe-management', 'production', '防护用品管理', 'ppe-management'],
  ['tool-management', 'production', '工器具领用', 'tool-management'],
  ['anti-violation', 'production', '反违章管理', 'anti-violation'],
  ['safety-system', 'production', '安全制度', 'safety-system'],
  ['risk-control', 'dual-control', '风险管控', 'risk-control'],
  ['danger-governance-folder', 'dual-control', '隐患治理', 'danger-governance']
] as const

folders.forEach(([key, parentKey, title, pathSegment], index) =>
  add({
    key,
    parentKey,
    name: `SmisFolder${index + 1}`,
    title,
    path: pathSegment,
    component: '/index/index',
    sort: (index + 1) * 10,
    type: 'folder'
  })
)

add({
  key: 'risk-identification',
  parentKey: 'risk-control',
  name: 'SmisRiskPoint',
  title: '风险辨识',
  path: 'risk-identification',
  component: '/smis/risk-control/risk-point',
  icon: 'ri:map-pin-warning-line',
  sort: 1,
  type: 'menu'
})

const sectionParents: Record<string, string> = {
  设备台账: 'equipment',
  '培训资质 / 安全资质管理': 'safety-qualification',
  '培训资质 / 培训管理': 'training-management',
  培训资质: 'qualification',
  '安全生产 / 应急救援': 'emergency-rescue',
  '安全生产 / 安全事故': 'safety-accident',
  '安全生产 / 防护用品管理': 'ppe-management',
  '安全生产 / 工器具领用': 'tool-management',
  '安全生产 / 反违章管理': 'anti-violation',
  '安全生产 / 安全制度': 'safety-system',
  '双控体系 / 风险管控': 'risk-control',
  '双控体系 / 隐患治理': 'danger-governance-folder',
  特殊作业: 'special-work',
  危废管理: 'hazardous-waste'
}

const equipmentLedgerChildren = new Set([
  'equipment-ledger',
  'equipment-attachment',
  'external-inspection',
  'internal-inspection',
  'annual-inspection',
  'periodic-inspection'
])
const accidentEmergencyCodes = new Set([
  'emergency-plan',
  'emergency-drill-plan',
  'emergency-drill-record',
  'emergency-drill-analysis',
  'casualty-quick-report'
])
const hiddenDangerCodes = new Set(['inspection-task', 'danger-governance'])

const sortByParent = new Map<string, number>()
for (const definition of safetyModuleCatalog) {
  let parentKey = sectionParents[definition.section]
  if (equipmentLedgerChildren.has(definition.code)) parentKey = 'equipment-ledger-folder'
  if (!parentKey) throw new Error(`缺少菜单父级映射：${definition.code}`)

  const sort = (sortByParent.get(parentKey) ?? 0) + 1
  sortByParent.set(parentKey, sort)
  const component = accidentEmergencyCodes.has(definition.code)
    ? '/smis/accident-emergency'
    : hiddenDangerCodes.has(definition.code)
      ? '/smis/inspection-control/hidden-danger'
      : '/smis/catalog'

  add({
    key: `catalog-${definition.code}`,
    parentKey,
    name: `SmisDoc${definition.code.replace(/(^|-)(\w)/g, (_, _dash, value: string) => value.toUpperCase())}`,
    title: definition.title,
    path: definition.code,
    component,
    icon: definition.icon,
    sort,
    type: 'menu',
    catalogCode: component === '/smis/catalog' ? definition.code : undefined
  })
}

const permissionButtons: Array<[string, string, string]> = [
  ['SmisCatalog:View', '查看台账', 'root'],
  ['SmisCatalog:Add', '新增台账', 'root'],
  ['SmisCatalog:Edit', '编辑台账', 'root'],
  ['SmisCatalog:Delete', '删除台账', 'root'],
  ['SmisSafetyDashboard:View', '查看安全驾驶舱', 'dashboard'],
  ['SmisSafetyDashboard:AiAnalyze', 'AI安全研判', 'dashboard'],
  ['SmisRiskPoint:View', '查看风险点', 'risk-identification'],
  ['SmisRiskPoint:Add', '新增风险点', 'risk-identification'],
  ['SmisRiskPoint:Edit', '编辑风险点', 'risk-identification'],
  ['SmisRiskPoint:Delete', '删除风险点', 'risk-identification'],
  ['SmisRiskPoint:Assess', '维护风险评估', 'risk-identification'],
  ['SmisRiskPoint:ActivateAssessment', '评估生效', 'risk-identification'],
  ['SmisHiddenDanger:View', '查看隐患', 'catalog-danger-governance'],
  ['SmisHiddenDanger:ExecuteInspection', '执行检查', 'catalog-danger-governance'],
  ['SmisHiddenDanger:Report', '上报隐患', 'catalog-danger-governance'],
  ['SmisHiddenDanger:Assign', '指派整改', 'catalog-danger-governance'],
  ['SmisHiddenDanger:Rectify', '提交整改', 'catalog-danger-governance'],
  ['SmisHiddenDanger:Review', '复查销号', 'catalog-danger-governance'],
  ['SmisAccidentEmergency:View', '查看事故与应急', 'catalog-emergency-plan'],
  ['SmisAccidentEmergency:ManageAccident', '管理事故事件', 'catalog-emergency-plan'],
  ['SmisAccidentEmergency:ManagePlan', '管理应急预案', 'catalog-emergency-plan'],
  ['SmisAccidentEmergency:ManageDrill', '管理应急演练', 'catalog-emergency-plan']
]

permissionButtons.forEach(([name, title, parentKey], index) =>
  add({
    key: `button-${index + 1}`,
    parentKey,
    name,
    title,
    path: '',
    component: '',
    sort: 900 + index,
    type: 'button'
  })
)

const ids = new Map(
  nodes.map((node, index) => [
    node.key,
    `5a150000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`
  ])
)

const quote = (value: string): string => `'${value.replaceAll("'", "''")}'`
const valueRows = nodes.map((node) => {
  const meta = {
    title: node.title,
    ...(node.icon ? { icon: node.icon } : {}),
    ...(node.catalogCode ? { catalogCode: node.catalogCode } : {})
  }
  return `  (${quote(ids.get(node.key)!)}, ${node.parentKey ? quote(ids.get(node.parentKey)!) : 'null'}, ${quote(node.name)}, ${quote(node.path)}, ${quote(node.component)}, ${quote(JSON.stringify(meta))}::jsonb, ${node.sort}, ${quote(node.type)}, 'smis', 'smis-doc-v1')`
})

const generatedIds = [...ids.values()].map(quote).join(',\n    ')
const sql =
  `-- Generated by scripts/generate-menu-migration.ts. Do not edit manually.\n` +
  `begin;\n\n` +
  `insert into public.sys_menu (id, parent_id, name, path, component, meta, sort, type, app_code, create_by)\nvalues\n${valueRows.join(',\n')}\n` +
  `on conflict (id) do update\nset parent_id = excluded.parent_id, name = excluded.name, path = excluded.path,\n    component = excluded.component, meta = excluded.meta, sort = excluded.sort,\n    type = excluded.type, app_code = excluded.app_code;\n\n` +
  `delete from public.sys_menu\nwhere app_code = 'smis'\n  and id not in (\n    ${generatedIds}\n  );\n\n` +
  `commit;\n`

const outputPath = path.resolve(
  process.cwd(),
  'supabase/migrations/20260823091000_smis_document_v1_menu.sql'
)
writeFileSync(outputPath, sql, 'utf8')
console.log(`Generated ${nodes.length} SMIS menu nodes: ${outputPath}`)
