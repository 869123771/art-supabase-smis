<template>
  <ArtTableSingleSelect
    :model-value="modelValue"
    :selected-data="selectedSite"
    :data="sites"
    :columns="columns"
    title="选择风险点场所"
    subtitle="数据来自场所维护；双击目标行或选中后确认"
    placeholder="双击选择场所"
    search-placeholder="搜索场所名称或所属组织"
    row-key="id"
    label-key="siteName"
    :description-key="siteDescription"
    :show-pagination="false"
    empty-text="暂无可选场所"
    empty-description="请先在场所维护中建立场所主数据。"
    @update:model-value="emit('update:modelValue', normalizeId($event))"
  >
    <template #empty><SmisDataSourceEmptyActions source="site" /></template>
  </ArtTableSingleSelect>
</template>

<script setup lang="ts">
  import ArtTableSingleSelect from '@/components/core/forms/art-data-select/table-single.vue'
  import type {
    DataSelectColumn,
    DataSelectKey,
    DataSelectRecord
  } from '@/components/core/forms/art-data-select/types'
  import SmisDataSourceEmptyActions from '@smis/views/components/smis-data-source-empty-actions.vue'
  import type { SmisRiskIdentificationSite } from '@smis/api'

  const props = withDefaults(
    defineProps<{ modelValue?: string; sites?: SmisRiskIdentificationSite[] }>(),
    { modelValue: undefined, sites: () => [] }
  )
  const emit = defineEmits<{ 'update:modelValue': [value: string | undefined] }>()
  const columns: DataSelectColumn[] = [
    { prop: 'siteName', label: '场所名称', minWidth: 220 },
    { prop: 'organizationName', label: '所属组织', minWidth: 180 },
    { prop: 'categoryCode', label: '场所分类', width: 130 }
  ]
  const selectedSite = computed<DataSelectRecord[]>(() => {
    const row = props.sites.find((item) => item.id === props.modelValue)
    return row ? [row as DataSelectRecord] : []
  })
  const siteDescription = (row: DataSelectRecord): string =>
    [row.organizationName, row.categoryCode].filter(Boolean).join(' · ')
  const normalizeId = (value: DataSelectKey | DataSelectKey[] | undefined): string | undefined =>
    typeof value === 'string' ? value : value == null ? undefined : String(value)
</script>
