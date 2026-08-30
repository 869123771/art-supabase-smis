<template>
  <ArtTableMultipleSelect
    :model-value="modelValue"
    :selected-data="selectedData"
    :api-fn="fetchEmployees"
    :columns="columns"
    :title="title"
    subtitle="按姓名、工号、组织或岗位检索当前租户员工花名册"
    :placeholder="placeholder"
    search-placeholder="搜索姓名、工号、组织或岗位"
    row-key="id"
    :label-key="employeeLabel"
    :description-key="employeeDescription"
    empty-text="暂无可选员工"
    empty-description="当前租户没有可选的在职或试用期员工，请先完善员工花名册。"
    @update:model-value="emit('update:modelValue', normalizeIds($event))"
    @update:selected-data="emit('update:selectedData', normalizeRows($event))"
  >
    <template #empty>
      <SmisDataSourceEmptyActions source="employee" />
    </template>
  </ArtTableMultipleSelect>
</template>

<script setup lang="ts">
  import ArtTableMultipleSelect from '@/components/core/forms/art-data-select/table-multiple.vue'
  import SmisDataSourceEmptyActions from '@smis/views/components/smis-data-source-empty-actions.vue'
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
  import { useUserStore } from '@/store/modules/user'

  defineOptions({ name: 'SmisAntiViolationEmployeeMultipleSelect' })
  withDefaults(
    defineProps<{
      modelValue?: string[]
      selectedData?: EmployeeIntegrationItem[]
      title?: string
      placeholder?: string
    }>(),
    {
      modelValue: () => [],
      selectedData: () => [],
      title: '选择员工',
      placeholder: '批量选择员工'
    }
  )
  const emit = defineEmits<{
    'update:modelValue': [value: string[]]
    'update:selectedData': [rows: EmployeeIntegrationItem[]]
  }>()
  const userStore = useUserStore()
  const { getUserInfo } = storeToRefs(userStore)
  const employee = (row: DataSelectRecord) => row as EmployeeIntegrationItem
  const employeeLabel = (row: DataSelectRecord) =>
    `${employee(row).employeeName} · ${employee(row).employeeNo}`
  const employeeDescription = (row: DataSelectRecord) =>
    [employee(row).organization?.organizationName, employee(row).jobTitle]
      .filter(Boolean)
      .join(' · ')
  const columns: DataSelectColumn[] = [
    { prop: 'employeeName', label: '员工姓名', minWidth: 130 },
    { prop: 'employeeNo', label: '员工工号', minWidth: 130 },
    {
      prop: 'organization',
      label: '所属组织',
      minWidth: 180,
      formatter: (row) => employee(row).organization?.organizationName || '未分配组织'
    },
    {
      prop: 'jobTitle',
      label: '岗位',
      minWidth: 150,
      formatter: (row) => employee(row).jobTitle || '未分配岗位'
    }
  ]
  const fetchEmployees = async (params: DataSelectFetchParams) => {
    const from = Math.max((params.page - 1) * params.pageSize, 0)
    const result = await fetchEmployeeSelectorList({
      tenantId: getUserInfo.value.tenantId || '',
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
