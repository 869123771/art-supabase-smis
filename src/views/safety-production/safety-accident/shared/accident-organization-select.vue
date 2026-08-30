<template>
  <ArtTreeSingleSelect
    :model-value="modelValue"
    :data="selectData"
    :selected-data="selectedData"
    :title="title"
    :subtitle="subtitle"
    :placeholder="placeholder"
    search-placeholder="搜索组织名称或编码"
    row-key="id"
    label-key="organizationName"
    :description-key="organizationDescription"
    children-key="children"
    clearable
    empty-text="暂无可选组织"
    empty-description="请先在系统组织管理中维护当前租户的公司、部门或作业区。"
    @update:model-value="emit('update:modelValue', normalizeValue($event))"
  >
    <template #empty><SmisDataSourceEmptyActions source="organization" /></template>
  </ArtTreeSingleSelect>
</template>

<script setup lang="ts">
  import ArtTreeSingleSelect from '@/components/core/forms/art-data-select/tree-single.vue'
  import SmisDataSourceEmptyActions from '@smis/views/components/smis-data-source-empty-actions.vue'
  import type {
    DataSelectKey,
    DataSelectRecord
  } from '@/components/core/forms/art-data-select/types'
  import TreeUtils from '@/utils/tree'
  import type { SmisTreeOrganization } from '@smis/api'

  defineOptions({ name: 'SmisAccidentOrganizationSelect' })
  const props = withDefaults(
    defineProps<{
      modelValue?: string
      organizations?: SmisTreeOrganization[]
      title?: string
      subtitle?: string
      placeholder?: string
    }>(),
    {
      modelValue: undefined,
      organizations: () => [],
      title: '选择事故发生作业区',
      subtitle: '数据来自系统组织管理；可按组织名称或编码检索',
      placeholder: '点击选择组织'
    }
  )
  const emit = defineEmits<{ 'update:modelValue': [value: string | undefined] }>()
  const tree = new TreeUtils({ idKey: 'id', parentKey: 'parentId', childrenKey: 'children' })
  const selectData = computed<DataSelectRecord[]>(() =>
    tree.normalizeTreeData<DataSelectRecord>(props.organizations)
  )
  const selectedData = computed<DataSelectRecord[]>(() => {
    if (!props.modelValue) return []
    const selected = tree.findNode(selectData.value, props.modelValue)
    return selected ? [selected] : []
  })
  const organizationDescription = (row: DataSelectRecord): string =>
    [row.organizationCode, row.organizationType].filter(Boolean).join(' · ')
  const normalizeValue = (
    value: DataSelectKey | DataSelectKey[] | undefined
  ): string | undefined =>
    typeof value === 'string' ? value : value == null ? undefined : String(value)
</script>
