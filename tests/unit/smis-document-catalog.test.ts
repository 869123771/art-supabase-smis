import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { safetyModuleCatalog } from '../../src/domain/safety-module-catalog'
import { safetyModuleFieldOverrides } from '../../src/domain/safety-module-fields'
import { safetyModuleExperienceMap } from '../../src/domain/safety-module-experience'
import { getSafetyModuleDetailSchema } from '../../src/domain/safety-module-detail-schema'

const requiredDocumentMenus = [
  '设备分类',
  '设备台账',
  '特种设备人员证件台账',
  '安全培训计划',
  '考试管理',
  '题库管理',
  '重大危险源台账',
  '伤亡事故快报',
  '防护用品发放记录',
  '工器具领用归还',
  '违章记录',
  '风险评估标准设置',
  '风险四色图',
  '隐患治理跟踪',
  '动火作业申请',
  '盲板抽堵申请',
  '危废入库',
  '危废名录'
]

const menuMigration = readFileSync(
  new URL('../../supabase/migrations/20260823091000_smis_document_v1_menu.sql', import.meta.url),
  'utf8'
)

test('only the SMIS application root mounts the shared platform layout', () => {
  const folderRows = menuMigration
    .split('\n')
    .filter((line) => line.includes("'folder', 'smis', 'smis-doc-v1'"))

  assert.equal(folderRows.length, 18)
  assert.equal(folderRows.filter((line) => line.includes("'/index/index'")).length, 1)
  assert.match(folderRows[0], /'SmisApplication', '\/smis', '\/index\/index'/)

  for (const row of folderRows.slice(1)) {
    assert.match(row, /, '', '\{"title":/)
  }
})

test('the complete V1.0 document menu is represented by business workspaces', () => {
  assert.equal(safetyModuleCatalog.length, 78)
  const titles = new Set(safetyModuleCatalog.map((item) => item.title))
  for (const title of requiredDocumentMenus) assert.equal(titles.has(title), true, title)
})

test('master-detail document pages declare reusable child-table schemas', () => {
  for (const workspace of safetyModuleCatalog.filter(
    (item) => item.experience === 'master-detail'
  )) {
    const schema = getSafetyModuleDetailSchema(workspace.code)
    assert.ok(schema, `${workspace.title} must declare a child-table schema`)
    assert.ok(schema.fields.length >= 5, `${workspace.title} child table is incomplete`)
  }
})

test('every special-work permit supports structured people and safety-measure details', () => {
  for (const workspace of safetyModuleCatalog.filter(
    (item) => item.experience === 'special-work'
  )) {
    const schema = getSafetyModuleDetailSchema(workspace.code)
    assert.ok(schema, `${workspace.title} must declare permit detail rows`)
    assert.ok(
      schema.fields.some((field) => field.key === 'rowType'),
      `${workspace.title} must distinguish people, measures, analyses and approval nodes`
    )
  }
})

test('every document workspace owns dedicated field metadata', () => {
  const catalogCodes = new Set(safetyModuleCatalog.map((item) => item.code))
  assert.deepEqual(new Set(Object.keys(safetyModuleFieldOverrides)), catalogCodes)

  for (const workspace of safetyModuleCatalog) {
    assert.ok(
      workspace.fields.length >= 6,
      `${workspace.title} should expose complete business fields`
    )
    assert.ok(
      workspace.fields.some((item) => item.required),
      `${workspace.title} should declare required fields`
    )
    assert.equal(
      new Set(workspace.fields.map((item) => item.key)).size,
      workspace.fields.length,
      `${workspace.title} should not contain duplicate fields`
    )
  }
})

test('cross-module people references use the platform HR integration field', () => {
  const peopleWorkspaces = safetyModuleCatalog.filter((workspace) =>
    workspace.fields.some((field) => field.type === 'employee')
  )
  assert.ok(peopleWorkspaces.length >= 30)
  assert.ok(peopleWorkspaces.every((workspace) => workspace.code !== 'hazardous-waste-catalog'))
})

test('every document menu is bound to reviewed pages and a non-fallback experience', () => {
  const catalogCodes = new Set(safetyModuleCatalog.map((item) => item.code))
  assert.deepEqual(new Set(Object.keys(safetyModuleExperienceMap)), catalogCodes)

  for (const workspace of safetyModuleCatalog) {
    assert.ok(workspace.documentPages.length > 0, `${workspace.title} must cite document pages`)
    assert.ok(
      workspace.documentPages.every((page) => page >= 4 && page <= 74),
      `${workspace.title} cites an invalid document page`
    )
    if (workspace.kind === 'report') {
      assert.ok(
        ['analytics', 'risk-map', 'master-detail'].includes(workspace.experience),
        `${workspace.title} must use a visual report experience`
      )
    }
    if (workspace.section === '特殊作业') {
      assert.equal(
        workspace.experience,
        'special-work',
        `${workspace.title} must use a work permit`
      )
      assert.ok(
        workspace.capabilities.includes('print'),
        `${workspace.title} must support printing`
      )
    }
  }
})
