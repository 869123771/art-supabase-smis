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
    empty-description="请先在系统组织管理中维护并启用组织部门。"
    @update:model-value="emit('update:modelValue', normalizeValue($event))"
  >
    <template #empty><SmisDataSourceEmptyActions source="organization" /></template>
  </ArtTreeSingleSelect>
</template>

<script setup lang="ts">
  import ArtTreeSingleSelect from '@/components/core/forms/art-data-select/tree-single.vue'
  import type {
    DataSelectKey,
    DataSelectRecord
  } from '@/components/core/forms/art-data-select/types'
  import SmisDataSourceEmptyActions from '@smis/views/components/smis-data-source-empty-actions.vue'
  import {
    findDualControlOrganization,
    toDualControlOrganizationTree,
    type DualControlOrganizationNode
  } from './organization-tree'

  type OrganizationSelectRecord = DualControlOrganizationNode & DataSelectRecord

  const props = withDefaults(
    defineProps<{
      modelValue?: string
      organizations?: DualControlOrganizationNode[]
      title?: string
      subtitle?: string
      placeholder?: string
    }>(),
    {
      modelValue: undefined,
      organizations: () => [],
      title: '选择组织部门',
      subtitle: '数据来自系统管理 / 组织部门',
      placeholder: '点击选择组织部门'
    }
  )
  const emit = defineEmits<{ 'update:modelValue': [value: string | undefined] }>()
  const selectData = computed<OrganizationSelectRecord[]>(
    () => toDualControlOrganizationTree(props.organizations) as OrganizationSelectRecord[]
  )
  const selectedData = computed<DataSelectRecord[]>(() => {
    if (!props.modelValue) return []
    const selected = findDualControlOrganization(selectData.value, props.modelValue)
    return selected ? [selected] : []
  })
  const organizationDescription = (row: DataSelectRecord): string =>
    [row.organizationCode, row.organizationType].filter(Boolean).join(' · ')
  const normalizeValue = (
    value: DataSelectKey | DataSelectKey[] | undefined
  ): string | undefined =>
    typeof value === 'string' ? value : value == null ? undefined : String(value)
</script>
