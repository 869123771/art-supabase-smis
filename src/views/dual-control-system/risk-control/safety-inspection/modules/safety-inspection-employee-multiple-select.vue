<template>
  <ArtTableMultipleSelect
    :model-value="modelValue"
    :selected-data="selectedData"
    :api-fn="fetchEmployees"
    :columns="columns"
    title="选择检查人"
    subtitle="数据来自当前租户员工花名册，可多选"
    placeholder="选择一名或多名检查人"
    search-placeholder="搜索姓名、工号、组织或岗位"
    row-key="id"
    :label-key="employeeLabel"
    :description-key="employeeDescription"
    empty-text="暂无可选员工"
    empty-description="当前租户没有可用员工，请先完善员工花名册。"
    @update:model-value="emit('update:modelValue', normalizeIds($event))"
    @update:selected-data="emit('update:selectedData', normalizeRows($event))"
  >
    <template #empty><SmisDataSourceEmptyActions source="employee" /></template>
  </ArtTableMultipleSelect>
</template>

<script setup lang="ts">
  import ArtTableMultipleSelect from '@/components/core/forms/art-data-select/table-multiple.vue'
  import type {
    DataSelectColumn,
    DataSelectFetchParams,
    DataSelectKey,
    DataSelectRecord
  } from '@/components/core/forms/art-data-select/types'
  import {
    fetchEmployeeSelectorList,
    type EmployeeIntegrationItem
  } from '@/api/integration/employees'
  import SmisDataSourceEmptyActions from '@smis/views/components/smis-data-source-empty-actions.vue'

  const props = withDefaults(
    defineProps<{
      modelValue?: string[]
      selectedData?: EmployeeIntegrationItem[]
      tenantId?: string
    }>(),
    { modelValue: () => [], selectedData: () => [], tenantId: '' }
  )
  const emit = defineEmits<{
    'update:modelValue': [value: string[]]
    'update:selectedData': [rows: EmployeeIntegrationItem[]]
  }>()

  const employee = (row: DataSelectRecord): EmployeeIntegrationItem =>
    row as EmployeeIntegrationItem
  const employeeLabel = (row: DataSelectRecord): string => {
    const item = employee(row)
    return item.employeeNo ? `${item.employeeName} · ${item.employeeNo}` : item.employeeName
  }
  const employeeDescription = (row: DataSelectRecord): string => {
    const item = employee(row)
    return [item.organization?.organizationName, item.jobTitle, item.phone]
      .filter(Boolean)
      .join(' · ')
  }
  const columns: DataSelectColumn[] = [
    { prop: 'employeeName', label: '员工姓名', minWidth: 130 },
    { prop: 'employeeNo', label: '员工工号', minWidth: 120 },
    {
      prop: 'organization',
      label: '所属组织',
      minWidth: 180,
      formatter: (row) => employee(row).organization?.organizationName || '未分配组织'
    },
    { prop: 'jobTitle', label: '工作岗位', minWidth: 140 },
    { prop: 'phone', label: '手机号码', width: 140 },
    {
      prop: 'employmentStatus',
      label: '任职状态',
      width: 108,
      dict: { code: 'hrEmploymentStatus', display: 'auto' }
    }
  ]
  const fetchEmployees = async (params: DataSelectFetchParams) => {
    const from = Math.max((params.page - 1) * params.pageSize, 0)
    const result = await fetchEmployeeSelectorList({
      tenantId: props.tenantId,
      keyword: params.keyword,
      from,
      to: from + params.pageSize - 1
    })
    return { data: result.data, total: result.total }
  }
  const normalizeIds = (value: DataSelectKey | DataSelectKey[] | undefined): string[] =>
    (Array.isArray(value) ? value : value == null ? [] : [value]).map(String)
  const normalizeRows = (rows: DataSelectRecord[]): EmployeeIntegrationItem[] => rows.map(employee)
</script>
