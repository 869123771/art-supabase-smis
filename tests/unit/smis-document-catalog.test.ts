import assert from 'node:assert/strict'
import test from 'node:test'
import { safetyModuleCatalog } from '../../src/domain/safety-module-catalog'
import { safetyModuleFieldOverrides } from '../../src/domain/safety-module-fields'

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

test('the complete V1.0 document menu is represented by business workspaces', () => {
  assert.equal(safetyModuleCatalog.length, 78)
  const titles = new Set(safetyModuleCatalog.map((item) => item.title))
  for (const title of requiredDocumentMenus) assert.equal(titles.has(title), true, title)
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
