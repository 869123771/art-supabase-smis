<template>
  <ArtTableMultipleSelect
    :model-value="modelValue"
    :selected-data="selectedData"
    :data="standards"
    :columns="columns"
    title="选择违章项目"
    subtitle="数据来自反违章标准库，可按分类、编码或项目名称检索"
    placeholder="选择一个或多个违章项目"
    search-placeholder="搜索分类、项目编码或名称"
    row-key="id"
    :label-key="standardLabel"
    :description-key="standardDescription"
    :show-pagination="false"
    empty-text="暂无可选违章项目"
    empty-description="请先在反违章标准库中维护并启用违章项目。"
    @update:model-value="emit('update:modelValue', normalizeIds($event))"
    @update:selected-data="emit('update:selectedData', normalizeRows($event))"
  >
    <template #empty>
      <SmisDataSourceEmptyActions source="antiViolationStandard" />
    </template>
  </ArtTableMultipleSelect>
</template>

<script setup lang="ts">
  import ArtTableMultipleSelect from '@/components/core/forms/art-data-select/table-multiple.vue'
  import SmisDataSourceEmptyActions from '@smis/views/components/smis-data-source-empty-actions.vue'
  import type {
    DataSelectColumn,
    DataSelectKey,
    DataSelectRecord
  } from '@/components/core/forms/art-data-select/types'
  import type { SmisAntiViolationStandardOption } from '@smis/api'

  defineOptions({ name: 'SmisAntiViolationStandardMultipleSelect' })
  withDefaults(
    defineProps<{
      modelValue?: string[]
      selectedData?: SmisAntiViolationStandardOption[]
      standards?: SmisAntiViolationStandardOption[]
    }>(),
    { modelValue: () => [], selectedData: () => [], standards: () => [] }
  )
  const emit = defineEmits<{
    'update:modelValue': [value: string[]]
    'update:selectedData': [rows: SmisAntiViolationStandardOption[]]
  }>()
  const standard = (row: DataSelectRecord) => row as SmisAntiViolationStandardOption
  const standardLabel = (row: DataSelectRecord) =>
    `(${standard(row).standardCode}) ${standard(row).standardName}`
  const standardDescription = (row: DataSelectRecord) =>
    `${standard(row).categoryName} · 扣 ${standard(row).deductionPoints} 分`
  const columns: DataSelectColumn[] = [
    { prop: 'categoryName', label: '违章分类', minWidth: 150 },
    { prop: 'standardCode', label: '项目编码', width: 130 },
    { prop: 'standardName', label: '项目名称', minWidth: 300 },
    { prop: 'deductionPoints', label: '扣减分值', width: 110, align: 'right' }
  ]
  const normalizeIds = (value: DataSelectKey | DataSelectKey[] | undefined): string[] =>
    (Array.isArray(value) ? value : value == null ? [] : [value]).map(String)
  const normalizeRows = (rows: DataSelectRecord[]): SmisAntiViolationStandardOption[] =>
    rows.map(standard)
</script>
