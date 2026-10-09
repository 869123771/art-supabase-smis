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
    @update:model-value="emit('update:modelValue', normalizeSingleStringKey($event))"
    @update:selected-data="emit('update:selectedData', $event)"
  >
    <template #empty>
      <SmisDataSourceEmptyActions source="site" />
    </template>
  </ArtTableSingleSelect>
</template>

<script setup lang="ts">
  import { normalizeSingleStringKey } from '@/utils/form/normalize'
  import ArtTableSingleSelect from '@/components/core/forms/art-data-select/table-single.vue'
  import SmisDataSourceEmptyActions from '@smis/views/components/smis-data-source-empty-actions.vue'
  import type { DataSelectColumn } from '@/components/core/forms/art-data-select/types'
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
  const siteDescription = (row: SmisSite) =>
    [row.organization?.organizationName, row.addressDetail].filter(Boolean).join(' · ')
  const columns: DataSelectColumn<SmisSite>[] = [
    { prop: 'siteName', label: '场所名称', minWidth: 180 },
    {
      prop: 'organization',
      label: '所属组织',
      minWidth: 180,
      formatter: (row) => row.organization?.organizationName || '未分配组织'
    },
    { prop: 'addressDetail', label: '详细地址', minWidth: 260 }
  ]
</script>
