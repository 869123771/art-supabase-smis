<template>
  <ArtTableSingleSelect
    :model-value="modelValue"
    :selected-data="selectedData"
    :api-fn="fetchOptions"
    :columns="columns"
    title="选择关联事故"
    subtitle="数据来自当前租户事故快报，确认后自动带入事故单号"
    placeholder="点击选择事故名称"
    search-placeholder="搜索事故编号或名称"
    row-key="id"
    label-key="accidentName"
    description-key="accidentNo"
    empty-text="暂无可关联事故快报"
    empty-description="请先新增当前租户的事故快报，再返回关联事故。"
    @update:model-value="emit('update:modelValue', normalizeValue($event))"
    @update:selected-data="emit('update:selectedData', normalizeRows($event))"
  >
    <template #empty>
      <SmisDataSourceEmptyActions source="accident-report" />
    </template>
  </ArtTableSingleSelect>
</template>

<script setup lang="ts">
  import dayjs from 'dayjs'
  import ArtTableSingleSelect from '@/components/core/forms/art-data-select/table-single.vue'
  import SmisDataSourceEmptyActions from '@smis/views/components/smis-data-source-empty-actions.vue'
  import type {
    DataSelectColumn,
    DataSelectFetchParams,
    DataSelectKey,
    DataSelectRecord
  } from '@/components/core/forms/art-data-select/types'
  import { fetchAccidentReportOptions, type SmisAccidentOption } from '@smis/api'

  defineOptions({ name: 'SmisAccidentReportSelect' })
  withDefaults(defineProps<{ modelValue?: string; selectedData?: SmisAccidentOption[] }>(), {
    modelValue: undefined,
    selectedData: () => []
  })
  const emit = defineEmits<{
    'update:modelValue': [value: string | undefined]
    'update:selectedData': [rows: SmisAccidentOption[]]
  }>()
  const columns: DataSelectColumn[] = [
    { prop: 'accidentNo', label: '事故编号', minWidth: 150 },
    { prop: 'accidentName', label: '事故名称', minWidth: 220 },
    {
      prop: 'accidentTime',
      label: '事故时间',
      width: 160,
      formatter: (row) => dayjs(row.accidentTime).format('YYYY-MM-DD HH:mm')
    },
    { prop: 'accidentLocation', label: '事故地点', minWidth: 170 }
  ]
  const fetchOptions = async (params: DataSelectFetchParams) => {
    const records = await fetchAccidentReportOptions(params.keyword)
    return { data: records, total: records.length }
  }
  const normalizeValue = (
    value: DataSelectKey | DataSelectKey[] | undefined
  ): string | undefined =>
    Array.isArray(value)
      ? value[0] == null
        ? undefined
        : String(value[0])
      : value == null
        ? undefined
        : String(value)
  const normalizeRows = (rows: DataSelectRecord[]): SmisAccidentOption[] =>
    rows as SmisAccidentOption[]
</script>
