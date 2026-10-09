<template>
  <ArtTableMultipleSelect
    :model-value="modelValue"
    :selected-data="selectedData"
    :api-fn="fetchItems"
    :columns="columns"
    title="选择排查标准"
    subtitle="可跨标准多选排查项，任务生成时会保留标准与内容快照"
    placeholder="选择一条或多条排查标准"
    search-placeholder="搜索标准、内容编号或排查内容"
    row-key="id"
    :label-key="itemLabel"
    :description-key="itemDescription"
    empty-text="暂无可用排查标准"
    empty-description="请先在排查标准中启用至少一条排查项。"
    @update:model-value="emit('update:modelValue', normalizeStringList($event))"
    @update:selected-data="emit('update:selectedData', $event)"
  >
    <template #empty><SmisDataSourceEmptyActions source="inspection-standard" /></template>
  </ArtTableMultipleSelect>
</template>

<script setup lang="ts">
  import { buildSupabasePageRange } from '@/utils/supabase/pagination'
  import { normalizeStringList } from '@/utils/form/normalize'

  import ArtTableMultipleSelect from '@/components/core/forms/art-data-select/table-multiple.vue'
  import type {
    DataSelectColumn,
    DataSelectFetchParams
  } from '@/components/core/forms/art-data-select/types'
  import { fetchInspectionItems, type SmisInspectionItem } from '@smis/api'
  import SmisDataSourceEmptyActions from '@smis/views/components/smis-data-source-empty-actions.vue'

  withDefaults(defineProps<{ modelValue?: string[]; selectedData?: SmisInspectionItem[] }>(), {
    modelValue: () => [],
    selectedData: () => []
  })
  const emit = defineEmits<{
    'update:modelValue': [value: string[]]
    'update:selectedData': [rows: SmisInspectionItem[]]
  }>()
  const itemLabel = (row: SmisInspectionItem): string => {
    return `${row.itemCode} · ${row.inspectionContent}`
  }
  const itemDescription = (row: SmisInspectionItem): string => {
    return row.standard
      ? `${row.standard.standardName} · ${row.standard.standardCode}`
      : '未关联排查标准'
  }
  const columns: DataSelectColumn<SmisInspectionItem>[] = [
    { prop: 'itemCode', label: '内容编号', width: 130 },
    { prop: 'inspectionContent', label: '排查内容', minWidth: 280 },
    {
      prop: 'standard',
      label: '所属标准',
      minWidth: 180,
      formatter: (row) => row.standard?.standardName || '未关联标准'
    }
  ]
  const fetchItems = async (params: DataSelectFetchParams) => {
    const { from, to } = buildSupabasePageRange({ current: params.page, size: params.pageSize })
    return fetchInspectionItems({
      keyword: params.keyword,
      status: 'enabled',
      from,
      to
    })
  }
</script>
