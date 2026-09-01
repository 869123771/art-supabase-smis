<template>
  <ArtPermissionGuard permission="SmisDualControlInspectionType:View">
    <div class="inspection-type-page business-workspace-page art-full-height">
      <BusinessWorkspaceHeader
        class="inspection-type-page__overview"
        eyebrow="TENANT INSPECTION SCENARIOS"
        title="排查类型"
        description="统一维护日常、专项、季节性等排查场景，租户可按业务调整编号、视觉标识与启停状态。"
        icon="ri:compass-3-line"
        density="compact"
        :tags="[
          { label: '租户级配置', type: 'primary', effect: 'plain' },
          { label: '12 类预置场景', type: 'success', effect: 'light' },
          { label: '启停与作废', type: 'info', effect: 'plain' }
        ]"
        :metrics="metrics"
      >
        <template #actions><BusinessTableWorkspaceActions :table="tableQueryRef" /></template>
      </BusinessWorkspaceHeader>

      <ArtTableQuery
        ref="tableQueryRef"
        class="inspection-type-page__table"
        v-model="searchQuery"
        :api-fn="fetchTableData"
        :search-items="searchItems"
        :columns-factory="columnsFactory"
        :header-actions="headerActions"
        header-actions-placement="workspace"
        :search-bar-props="{ span: 8, labelWidth: 78, showExpand: false }"
        :table-props="{
          rowKey: 'id',
          tableLayout: 'fixed',
          emptyText: '暂无排查类型',
          emptyDescription: '新增租户需要使用的排查业务场景。'
        }"
        :on-success="handleSuccess"
        focusable
      />
      <InspectionTypeDialog ref="dialogRef" @success="handleDialogSuccess" />
    </div>
  </ArtPermissionGuard>
</template>

<script setup lang="tsx">
  import dayjs from 'dayjs'
  import { ElTag } from 'element-plus'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import BusinessTableWorkspaceActions from '@/components/business/business-table-workspace-actions/index.vue'
  import BusinessWorkspaceHeader, {
    type BusinessWorkspaceMetric
  } from '@/components/business/business-workspace-header/index.vue'
  import type { SearchFormItem } from '@/components/core/forms/art-search-bar/index.vue'
  import type {
    ArtTableQueryExpose,
    ArtTableQueryHeaderAction,
    ArtTableQueryExcelColumn,
    ArtTableQueryProps
  } from '@/components/core/tables/art-table-query/index.vue'
  import type { ColumnOption } from '@/types'
  import { pageInfoHandler } from '@/utils/table/tableUtils'
  import { useArtFeedback } from '@/hooks/core/useArtFeedback'
  import { useUserStore } from '@/store/modules/user'
  import { useTenantScopeStore } from '@/store/modules/tenantScope'
  import {
    deleteInspectionTypes,
    fetchInspectionTypes,
    voidInspectionTypes,
    type SmisInspectionType,
    type SmisInspectionTypeSearchParams
  } from '@smis/api'
  import InspectionTypeDialog, {
    type InspectionTypeDialogOpenData
  } from './modules/inspection-type-dialog.vue'

  defineOptions({ name: 'SmisDualControlInspectionType' })
  type TableParams = SmisInspectionTypeSearchParams &
    Pick<Api.Common.PaginationParams, 'current' | 'size'>
  interface DialogExpose {
    handleOpen: (data: InspectionTypeDialogOpenData) => Promise<void>
  }

  const { confirmDelete, confirmAction } = useArtFeedback()
  const userStore = useUserStore()
  const tenantScopeStore = useTenantScopeStore()
  const { getDictMap } = storeToRefs(userStore)
  const { effectiveTenantId, revision } = storeToRefs(tenantScopeStore)
  const tableQueryRef = ref<ArtTableQueryExpose>()
  const dialogRef = ref<DialogExpose>()
  const searchQuery = ref<SmisInspectionTypeSearchParams>({})
  const overview = reactive({ total: 0, enabled: 0, disabled: 0, voided: 0 })

  const optionsOf = (code: string) =>
    (getDictMap.value[code] ?? []).map((item) => ({
      label: item.label || item.name,
      value: item.value
    }))
  const statusOptions = computed(() => optionsOf('smisConfigStatus'))
  const tagOptions = computed(() => optionsOf('smisTagStyle'))
  const metrics = computed<BusinessWorkspaceMetric[]>(() => [
    {
      label: '类型总数',
      value: overview.total,
      description: '当前租户场景',
      icon: 'ri:stack-line'
    },
    {
      label: '已启用',
      value: overview.enabled,
      description: '可用于排查计划',
      icon: 'ri:checkbox-circle-line',
      tone: 'success'
    },
    {
      label: '已禁用',
      value: overview.disabled,
      description: '保留历史配置',
      icon: 'ri:pause-circle-line',
      tone: 'warning'
    },
    {
      label: '已作废',
      value: overview.voided,
      description: '终止后续使用',
      icon: 'ri:forbid-2-line'
    }
  ])
  const searchItems = computed<SearchFormItem[]>(() => [
    {
      label: '关键字',
      key: 'keyword',
      type: 'input',
      props: { clearable: true, placeholder: '编号或排查类型' }
    },
    {
      label: '状态',
      key: 'status',
      type: 'select',
      props: { options: statusOptions.value, clearable: true, placeholder: '全部状态' }
    },
    {
      label: '标签样式',
      key: 'tagStyle',
      type: 'select',
      props: { options: tagOptions.value, clearable: true, placeholder: '全部样式' }
    }
  ])
  const excelColumns: ArtTableQueryExcelColumn[] = [
    { key: 'typeCode', title: '排查类型编号', required: true },
    { key: 'typeName', title: '排查类型', required: true },
    { key: 'sort', title: '排序' },
    { key: 'textColor', title: '文字颜色' },
    { key: 'tagStyle', title: '标签样式' },
    { key: 'status', title: '状态' },
    { key: 'createTime', title: '创建时间' }
  ]

  const openDialog = (row?: SmisInspectionType) =>
    void dialogRef.value?.handleOpen({ row, tenantId: row?.tenantId || effectiveTenantId.value })
  const headerActions = computed<ArtTableQueryHeaderAction[]>(() => [
    {
      permission: 'SmisDualControlInspectionType:Add',
      type: 'add',
      label: '新增排查类型',
      onClick: () => openDialog()
    },
    {
      permission: 'SmisDualControlInspectionType:Export',
      type: 'export',
      exportFilename: '排查类型',
      exportSheetName: '排查类型',
      exportColumns: excelColumns,
      exportApi: async ({ selectedIds, searchParams, maxRows }) => {
        const result = await fetchInspectionTypes({
          ...(searchParams as SmisInspectionTypeSearchParams),
          tenantId: effectiveTenantId.value,
          ids: selectedIds.map(String),
          to: Math.max((maxRows ?? 10000) - 1, 0)
        })
        return { data: result.data }
      }
    },
    {
      permission: 'SmisDualControlInspectionType:Void',
      key: 'void',
      label: '作废',
      icon: 'ri:forbid-2-line',
      selectionRequired: true,
      onClick: async ({ selectedRows, api }) => {
        await confirmAction('确定作废选中的排查类型吗？作废后仅保留历史引用。', '作废排查类型')
        await voidInspectionTypes(selectedRows.map((row) => String(row.id)))
        await api.refreshUpdate()
      }
    },
    {
      permission: 'SmisDualControlInspectionType:Delete',
      type: 'delete',
      content: ({ selectedCount }: { selectedCount: number }) =>
        `确定删除选中的 ${selectedCount} 个排查类型吗？`,
      onClick: async ({ selectedRows, api }) => {
        await deleteInspectionTypes(selectedRows.map((row) => String(row.id)))
        await api.refreshRemove()
      }
    }
  ])

  const columnsFactory = (): ColumnOption<SmisInspectionType>[] => [
    { type: 'selection', width: 48 },
    { type: 'globalIndex', label: '序号', width: 70 },
    {
      prop: 'typeCode',
      label: '排查类型编号',
      minWidth: 170,
      fixed: 'left',
      showOverflowTooltip: true,
      formatter: (row) => <span class="inspection-type-page__code">{row.typeCode}</span>
    },
    {
      prop: 'typeName',
      label: '排查类型',
      minWidth: 180,
      formatter: (row) => (
        <strong style={{ color: row.textColor || undefined }}>{row.typeName}</strong>
      )
    },
    {
      prop: 'tagStyle',
      label: '标签样式',
      width: 120,
      align: 'center',
      formatter: (row) => (
        <ElTag type={row.tagStyle || 'info'} effect="light">
          {tagOptions.value.find((item) => item.value === row.tagStyle)?.label ||
            row.tagStyle ||
            '默认'}
        </ElTag>
      )
    },
    { prop: 'sort', label: '排序', width: 80, align: 'right' },
    {
      prop: 'status',
      label: '状态',
      width: 100,
      align: 'center',
      formatter: (row) => (
        <ElTag
          type={
            row.status === 'enabled' ? 'success' : row.status === 'disabled' ? 'warning' : 'info'
          }
          effect="plain"
        >
          {statusOptions.value.find((item) => item.value === row.status)?.label || row.status}
        </ElTag>
      )
    },
    { prop: 'createBy', label: '创建人', minWidth: 120, showOverflowTooltip: true },
    {
      prop: 'createTime',
      label: '创建时间',
      width: 164,
      formatter: (row) => dayjs(row.createTime).format('YYYY-MM-DD HH:mm')
    },
    {
      prop: 'operation',
      label: '操作',
      width: 140,
      fixed: 'right',
      formatter: (row) => (
        <div class="inspection-type-page__actions">
          <ArtButtonTable
            type="edit"
            permission="SmisDualControlInspectionType:Edit"
            label="编辑排查类型"
            disabled={row.status === 'voided'}
            onClick={() => openDialog(row)}
          />
          <ArtButtonTable
            type="delete"
            permission="SmisDualControlInspectionType:Delete"
            label="删除排查类型"
            onClick={() => void handleDelete(row)}
          />
        </div>
      )
    }
  ]
  const fetchTableData = async (params: TableParams) => {
    const { from, to } = pageInfoHandler({ current: params.current, size: params.size })
    return await fetchInspectionTypes({ ...params, tenantId: effectiveTenantId.value, from, to })
  }
  const handleSuccess: NonNullable<ArtTableQueryProps['onSuccess']> = (records, response) => {
    const rows = records as SmisInspectionType[]
    overview.total = response.total ?? 0
    overview.enabled = rows.filter((row) => row.status === 'enabled').length
    overview.disabled = rows.filter((row) => row.status === 'disabled').length
    overview.voided = rows.filter((row) => row.status === 'voided').length
  }
  const handleDialogSuccess = (type: 'add' | 'edit') =>
    void (type === 'add'
      ? tableQueryRef.value?.refreshCreate()
      : tableQueryRef.value?.refreshUpdate())
  const handleDelete = async (row: SmisInspectionType) => {
    try {
      await confirmDelete(`确定删除排查类型“${row.typeName}”吗？`)
      await deleteInspectionTypes([row.id])
      await tableQueryRef.value?.refreshRemove()
    } catch {
      /* 用户取消 */
    }
  }
  onMounted(async () => {
    await Promise.all([
      userStore.ensureDictLoaded('smisConfigStatus'),
      userStore.ensureDictLoaded('smisTagStyle'),
      tenantScopeStore.loadTenantOptions()
    ])
  })
  watch(revision, () => void tableQueryRef.value?.refreshContext())
</script>

<style scoped lang="scss">
  .inspection-type-page {
    gap: 12px;
    min-width: 0;

    &__overview {
      min-width: 0;
      overflow: hidden;
    }

    &__table {
      flex: 1 1 auto;
      min-width: 0;
      min-height: 0;
    }

    :deep(.inspection-type-page__code) {
      display: inline-block;
      max-width: 100%;
      padding: 4px 8px;
      overflow: hidden;
      text-overflow: ellipsis;
      font-family: var(--art-font-family-mono, Consolas, monospace);
      font-size: 12px;
      font-weight: 700;
      color: var(--theme-color);
      white-space: nowrap;
      background: color-mix(in srgb, var(--theme-color) 8%, var(--el-bg-color));
      border-radius: var(--el-border-radius-small);
    }

    :deep(.inspection-type-page__actions) {
      display: flex;
      align-items: center;
    }
  }
</style>
