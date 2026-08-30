<template>
  <ArtTableMultipleSelect
    :model-value="modelValue"
    :selected-data="selectedData"
    :api-fn="fetchEmployees"
    :columns="columns"
    :placeholder="placeholder"
    row-key="id"
    :label-key="getEmployeeLabel"
    :description-key="getEmployeeDescription"
    :title="title"
    :subtitle="subtitle"
    search-placeholder="搜索姓名、工号、组织或岗位"
    empty-text="暂无可选员工"
    empty-description="当前租户没有可选的在职或试用期员工，请先完善员工花名册。"
    :show-pagination="true"
    :page-size="10"
    :page-sizes="[10, 20, 30, 50]"
    @update:model-value="emit('update:modelValue', normalizeValues($event))"
    @update:selected-data="emit('update:selectedData', normalizeRows($event))"
    @change="handleChange"
    @confirm="handleConfirm"
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
  import { useUserStore } from '@/store/modules/user'
  import {
    fetchEmployeeSelectorList,
    type EmployeeIntegrationItem
  } from '@/api/integration/employees'

  interface Props {
    modelValue?: string[]
    selectedData?: EmployeeIntegrationItem[]
    title?: string
    subtitle?: string
    placeholder?: string
  }

  withDefaults(defineProps<Props>(), {
    modelValue: () => [],
    selectedData: () => [],
    title: '选择员工',
    subtitle: '按姓名、工号、组织或岗位检索，可多选',
    placeholder: '请选择员工'
  })
  const emit = defineEmits<{
    'update:modelValue': [value: string[]]
    'update:selectedData': [rows: EmployeeIntegrationItem[]]
    change: [value: string[], rows: EmployeeIntegrationItem[]]
    confirm: [value: string[], rows: EmployeeIntegrationItem[]]
  }>()

  const userStore = useUserStore()
  const { getUserInfo } = storeToRefs(userStore)
  const getEmployee = (row: DataSelectRecord): EmployeeIntegrationItem =>
    row as EmployeeIntegrationItem
  const getEmployeeLabel = (row: DataSelectRecord): string => {
    const employee = getEmployee(row)
    return employee.employeeNo
      ? `${employee.employeeName} · ${employee.employeeNo}`
      : employee.employeeName
  }
  const getEmployeeDescription = (row: DataSelectRecord): string => {
    const employee = getEmployee(row)
    return [employee.organization?.organizationName, employee.jobTitle, employee.phone]
      .filter(Boolean)
      .join(' · ')
  }
  const columns: DataSelectColumn[] = [
    { prop: 'employeeName', label: '员工姓名', minWidth: 130 },
    { prop: 'employeeNo', label: '员工工号', minWidth: 130 },
    {
      prop: 'organization',
      label: '所属组织',
      minWidth: 180,
      formatter: (row) => getEmployee(row).organization?.organizationName || '未分配组织'
    },
    {
      prop: 'jobTitle',
      label: '工作岗位',
      minWidth: 150,
      formatter: (row) => getEmployee(row).jobTitle || '未分配岗位'
    },
    { prop: 'phone', label: '手机号码', width: 140 }
  ]

  const normalizeValues = (value: DataSelectKey | DataSelectKey[] | undefined): string[] =>
    (Array.isArray(value) ? value : value == null ? [] : [value]).map(String)
  const normalizeRows = (rows: DataSelectRecord[]): EmployeeIntegrationItem[] =>
    rows.map(getEmployee)
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
  const handleChange = (
    value: DataSelectKey | DataSelectKey[] | undefined,
    rows: DataSelectRecord[]
  ): void => emit('change', normalizeValues(value), normalizeRows(rows))
  const handleConfirm = (
    value: DataSelectKey | DataSelectKey[] | undefined,
    rows: DataSelectRecord[]
  ): void => emit('confirm', normalizeValues(value), normalizeRows(rows))
</script>
