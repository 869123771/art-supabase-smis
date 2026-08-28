<template>
  <ArtTableMultipleSelect
    :model-value="modelValue"
    :selected-data="selectedData"
    :api-fn="fetchEmployees"
    :columns="columns"
    :title="title"
    :subtitle="subtitle"
    :placeholder="placeholder"
    :search-placeholder="searchPlaceholder"
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
  import { fetchAccidentEmployeeCandidates, type SmisAccidentEmployee } from '@smis/api'

  defineOptions({ name: 'SmisAccidentEmployeeMultipleSelect' })
  withDefaults(
    defineProps<{
      modelValue?: string[]
      selectedData?: SmisAccidentEmployee[]
      title?: string
      subtitle?: string
      placeholder?: string
      searchPlaceholder?: string
    }>(),
    {
      modelValue: () => [],
      selectedData: () => [],
      title: '批量添加事故人员',
      subtitle: '从当前租户员工花名册选择，确认后自动带入组织、身份与任职档案',
      placeholder: '批量选择人员',
      searchPlaceholder: '搜索姓名、工号、组织或岗位'
    }
  )
  const emit = defineEmits<{
    'update:modelValue': [value: string[]]
    'update:selectedData': [rows: SmisAccidentEmployee[]]
  }>()

  const employee = (row: DataSelectRecord): SmisAccidentEmployee => row as SmisAccidentEmployee
  const employeeLabel = (row: DataSelectRecord): string =>
    `${employee(row).employeeName} · ${employee(row).employeeNo}`
  const employeeDescription = (row: DataSelectRecord): string =>
    [employee(row).organization?.organizationName, employee(row).jobTitle, employee(row).phone]
      .filter(Boolean)
      .join(' · ')
  const columns: DataSelectColumn[] = [
    { prop: 'employeeName', label: '员工姓名', minWidth: 130 },
    { prop: 'employeeNo', label: '员工工号', minWidth: 120 },
    {
      prop: 'organization',
      label: '所属组织',
      minWidth: 180,
      formatter: (row) => employee(row).organization?.organizationName || '未分配组织'
    },
    { prop: 'jobTitle', label: '工种 / 岗位', minWidth: 140 },
    { prop: 'gender', label: '性别', width: 80 },
    { prop: 'age', label: '年龄', width: 80 },
    { prop: 'phone', label: '手机号码', width: 140 }
  ]
  const fetchEmployees = async (params: DataSelectFetchParams) => {
    const from = Math.max((params.page - 1) * params.pageSize, 0)
    const result = await fetchAccidentEmployeeCandidates({
      keyword: params.keyword,
      from,
      to: from + params.pageSize - 1
    })
    return { data: result.data, total: result.total }
  }
  const normalizeIds = (value: DataSelectKey | DataSelectKey[] | undefined): string[] =>
    (Array.isArray(value) ? value : value == null ? [] : [value]).map(String)
  const normalizeRows = (rows: DataSelectRecord[]): SmisAccidentEmployee[] => rows.map(employee)
</script>
