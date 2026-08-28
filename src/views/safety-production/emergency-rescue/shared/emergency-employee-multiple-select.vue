<template>
  <ArtTableMultipleSelect
    :model-value="modelValue"
    :selected-data="selectedData"
    :api-fn="fetchEmployees"
    :columns="columns"
    :title="title"
    subtitle="按姓名、工号、组织或岗位检索当前租户员工花名册"
    placeholder="批量选择员工"
    search-placeholder="搜索姓名、工号、组织或岗位"
    row-key="id"
    :label-key="employeeLabel"
    :description-key="employeeDescription"
    empty-text="暂无可选员工"
    @update:model-value="emit('update:modelValue', normalizeIds($event))"
    @update:selected-data="emit('update:selectedData', normalizeRows($event))"
  />
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
  import { useUserStore } from '@/store/modules/user'

  defineOptions({ name: 'SmisEmergencyEmployeeMultipleSelect' })
  withDefaults(
    defineProps<{
      modelValue?: string[]
      selectedData?: EmployeeIntegrationItem[]
      title?: string
    }>(),
    {
      modelValue: () => [],
      selectedData: () => [],
      title: '批量选择员工'
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
    [employee(row).organization?.organizationName, employee(row).jobTitle, employee(row).phone]
      .filter(Boolean)
      .join(' · ')
  const columns: DataSelectColumn[] = [
    { prop: 'employeeName', label: '员工姓名', minWidth: 130 },
    { prop: 'employeeNo', label: '员工工号', minWidth: 130 },
    {
      prop: 'organization',
      label: '所属组织',
      minWidth: 170,
      formatter: (row) => employee(row).organization?.organizationName || '未分配组织'
    },
    {
      prop: 'jobTitle',
      label: '岗位',
      minWidth: 140,
      formatter: (row) => employee(row).jobTitle || '未分配岗位'
    },
    { prop: 'phone', label: '手机号码', width: 140 }
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
