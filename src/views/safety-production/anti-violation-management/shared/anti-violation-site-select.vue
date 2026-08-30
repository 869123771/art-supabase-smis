<template>
  <ArtTableSingleSelect
    :model-value="modelValue"
    :selected-data="selectedData"
    :data="sites"
    :columns="columns"
    title="选择违章地点"
    subtitle="数据来自场所维护，可按场所名称、地址或所属组织检索"
    placeholder="从场所维护中选择"
    search-placeholder="搜索场所、地址或组织"
    row-key="id"
    label-key="siteName"
    :description-key="siteDescription"
    :show-pagination="false"
    empty-text="暂无可选场所"
    empty-description="请先在场所维护中建立可识别的场所。"
    @update:model-value="emit('update:modelValue', normalizeId($event))"
    @update:selected-data="emit('update:selectedData', normalizeRows($event))"
  >
    <template #empty>
      <SmisDataSourceEmptyActions source="site" />
    </template>
  </ArtTableSingleSelect>
</template>

<script setup lang="ts">
  import ArtTableSingleSelect from '@/components/core/forms/art-data-select/table-single.vue'
  import SmisDataSourceEmptyActions from '@smis/views/components/smis-data-source-empty-actions.vue'
  import type {
    DataSelectColumn,
    DataSelectKey,
    DataSelectRecord
  } from '@/components/core/forms/art-data-select/types'
  import type { SmisSite } from '@smis/api'

  defineOptions({ name: 'SmisAntiViolationSiteSelect' })
  withDefaults(
    defineProps<{
      modelValue?: string
      selectedData?: SmisSite[]
      sites?: SmisSite[]
    }>(),
    { modelValue: undefined, selectedData: () => [], sites: () => [] }
  )
  const emit = defineEmits<{
    'update:modelValue': [value: string | undefined]
    'update:selectedData': [rows: SmisSite[]]
  }>()
  const site = (row: DataSelectRecord) => row as SmisSite
  const siteDescription = (row: DataSelectRecord) =>
    [site(row).organization?.organizationName, site(row).addressDetail].filter(Boolean).join(' · ')
  const columns: DataSelectColumn[] = [
    { prop: 'siteName', label: '场所名称', minWidth: 180 },
    {
      prop: 'organization',
      label: '所属组织',
      minWidth: 180,
      formatter: (row) => site(row).organization?.organizationName || '未分配组织'
    },
    { prop: 'addressDetail', label: '详细地址', minWidth: 260 }
  ]
  const normalizeId = (value: DataSelectKey | DataSelectKey[] | undefined): string | undefined => {
    const target = Array.isArray(value) ? value[0] : value
    return target == null ? undefined : String(target)
  }
  const normalizeRows = (rows: DataSelectRecord[]): SmisSite[] => rows.map(site)
</script>
