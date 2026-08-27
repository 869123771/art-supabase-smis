<template>
  <div class="inspection-category-page business-workspace-page art-full-height">
    <BusinessWorkspaceHeader
      eyebrow="INSPECTION CATEGORY MASTER DATA"
      title="检验类别"
      description="按租户维护统一的检验类别编码、名称与启停状态，为设备检验和安全业务提供一致的分类口径。"
      icon="ri:filter-3-line"
      :tags="[
        { label: '租户级配置', type: 'primary', effect: 'plain' },
        { label: '统一分类口径', type: 'success', effect: 'light' },
        { label: '启停可控', type: 'info', effect: 'plain' }
      ]"
      :metrics="workspaceMetrics"
    >
      <template #actions>
        <BusinessTableWorkspaceActions :table="tableQueryRef" />
      </template>
    </BusinessWorkspaceHeader>

    <ArtTableQuery
      ref="tableQueryRef"
      v-model="table.searchQuery"
      :api-fn="fetchTableData"
      :search-items="table.searchItems"
      :columns-factory="columnsFactory"
      :header-actions="table.headerActions"
      header-actions-placement="workspace"
      :search-bar-props="{ span: 8, labelWidth: 82, showExpand: false }"
      :table-props="{
        rowKey: 'id',
        tableLayout: 'fixed',
        emptyText: '暂无检验类别',
        emptyDescription: '可新增外部检验、内部检验等租户专属分类。'
      }"
      focusable
    />

    <InspectionCategoryDialog ref="dialogRef" @success="handleSaveSuccess" />
  </div>
</template>

<script setup lang="tsx">
  import dayjs from 'dayjs'
  import type { SearchFormItem } from '@/components/core/forms/art-search-bar/index.vue'
  import type {
    ArtTableQueryExpose,
    ArtTableQueryHeaderAction,
    ArtTableQueryHeaderActionContext
  } from '@/components/core/tables/art-table-query/index.vue'
  import type { ColumnOption } from '@/types'
  import { pageInfoHandler } from '@/utils/table/tableUtils'
  import { useArtFeedback } from '@/hooks/core/useArtFeedback'
  import { useUserStore } from '@/store/modules/user'
  import { useTenantScopeStore } from '@/store/modules/tenantScope'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import ArtDictDisplay from '@/components/core/base/art-dict-display/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import BusinessTableWorkspaceActions from '@/components/business/business-table-workspace-actions/index.vue'
  import BusinessWorkspaceHeader, {
    type BusinessWorkspaceMetric
  } from '@/components/business/business-workspace-header/index.vue'
  import {
    deleteInspectionCategories,
    fetchInspectionCategoryList,
    type SmisInspectionCategory,
    type SmisInspectionCategoryOverview,
    type SmisInspectionCategorySearchParams
  } from '@smis/api'
  import InspectionCategoryDialog, {
    type InspectionCategoryDialogOpenData
  } from './modules/inspection-category-dialog.vue'

  defineOptions({ name: 'SmisInspectionCategory' })

  type TableParams = SmisInspectionCategorySearchParams &
    Pick<Api.Common.PaginationParams, 'current' | 'size'>

  interface DialogExpose {
    handleOpen: (data: InspectionCategoryDialogOpenData) => Promise<void>
  }

  interface TableGroup {
    searchQuery: SmisInspectionCategorySearchParams
    searchItems: ComputedRef<SearchFormItem[]>
    headerActions: ComputedRef<ArtTableQueryHeaderAction[]>
  }

  const { confirmDelete } = useArtFeedback()
  const userStore = useUserStore()
  const tenantScopeStore = useTenantScopeStore()
  const { getDictMap, isPlatformSuper, getUserInfo } = storeToRefs(userStore)
  const { effectiveTenantId, selectedTenant, revision, scopeLabel } = storeToRefs(tenantScopeStore)
  const tableQueryRef = ref<ArtTableQueryExpose>()
  const dialogRef = ref<DialogExpose>()
  const overview = reactive<SmisInspectionCategoryOverview>({
    total: 0,
    enabled: 0,
    disabled: 0,
    recentlyUpdated: 0
  })

  const statusOptions = computed(() =>
    (getDictMap.value.smisInspectionCategoryStatus ?? []).map((item) => ({
      label: item.label || item.name,
      value: item.value
    }))
  )

  const workspaceMetrics = computed<BusinessWorkspaceMetric[]>(() => [
    {
      label: '类别总数',
      value: overview.total,
      description: isPlatformSuper.value ? `${scopeLabel.value}配置` : '当前租户配置',
      icon: 'ri:stack-line'
    },
    {
      label: '已启用',
      value: overview.enabled,
      description: '可用于业务选择',
      icon: 'ri:checkbox-circle-line',
      tone: 'success'
    },
    {
      label: '已停用',
      value: overview.disabled,
      description: '保留历史口径',
      icon: 'ri:pause-circle-line',
      tone: 'warning'
    },
    {
      label: '近 30 日更新',
      value: overview.recentlyUpdated,
      description: '新增或调整记录',
      icon: 'ri:history-line'
    }
  ])

  const openDialog = (row?: SmisInspectionCategory): void => {
    const tenantId = row?.tenantId || effectiveTenantId.value

    void dialogRef.value?.handleOpen({
      row,
      tenantId,
      tenantName:
        row?.tenantName ||
        selectedTenant.value?.tenantName ||
        getUserInfo.value.tenant?.tenantName ||
        '当前租户'
    })
  }

  async function deleteRowsByTenant(rows: SmisInspectionCategory[]): Promise<void> {
    const idsByTenant = new Map<string, string[]>()
    rows.forEach((row) => {
      if (!row.id || !row.tenantId) return
      const ids = idsByTenant.get(row.tenantId) ?? []
      ids.push(row.id)
      idsByTenant.set(row.tenantId, ids)
    })

    await Promise.all(
      [...idsByTenant.entries()].map(([tenantId, ids]) => deleteInspectionCategories(ids, tenantId))
    )
  }

  const headerActions = computed<ArtTableQueryHeaderAction[]>(() => [
    {
      permission: 'SmisInspectionCategory:Add',
      type: 'add',
      label: '新增检验类别',
      onClick: () => openDialog()
    },
    {
      permission: 'SmisInspectionCategory:Delete',
      type: 'delete',
      content: ({ selectedCount }: ArtTableQueryHeaderActionContext) =>
        `确定删除选中的 ${selectedCount} 个检验类别吗？删除后无法恢复。`,
      onClick: async ({ selectedRows, api }) => {
        await deleteRowsByTenant(selectedRows as SmisInspectionCategory[])
        await api.refreshRemove()
      }
    }
  ])

  const table = reactive<TableGroup>({
    searchQuery: {},
    searchItems: computed(() => [
      {
        label: '关键字',
        key: 'keyword',
        type: 'input',
        props: { clearable: true, placeholder: '检验类别编码、名称或备注' }
      },
      {
        label: '启用状态',
        key: 'status',
        type: 'select',
        props: {
          options: statusOptions.value,
          clearable: true,
          placeholder: '全部状态'
        }
      }
    ]),
    headerActions
  })

  const columnsFactory = (): ColumnOption<SmisInspectionCategory>[] => [
    { type: 'selection', width: 48 },
    { type: 'globalIndex', label: '序号', width: 76 },
    {
      prop: 'categoryName',
      label: '检验类别名称',
      minWidth: 210,
      fixed: 'left',
      formatter: (row) => (
        <div class="inspection-category-page__identity">
          <span aria-hidden="true">
            <ArtSvgIcon icon="ri:filter-3-line" />
          </span>
          <strong title={row.categoryName}>{row.categoryName}</strong>
        </div>
      )
    },
    {
      prop: 'categoryCode',
      label: '检验类别编码',
      minWidth: 170,
      formatter: (row) => (
        <span class="inspection-category-page__code" title={row.categoryCode}>
          {row.categoryCode}
        </span>
      )
    },
    ...(isPlatformSuper.value
      ? [
          {
            prop: 'tenantName',
            label: '所属租户',
            minWidth: 190,
            showOverflowTooltip: true,
            formatter: (row: SmisInspectionCategory) =>
              row.tenantName ? `${row.tenantName}（${row.tenantCode || '—'}）` : '—'
          }
        ]
      : []),
    {
      prop: 'status',
      label: '启用状态',
      width: 106,
      align: 'center',
      formatter: (row) => (
        <ArtDictDisplay dictCode="smisInspectionCategoryStatus" value={row.status} display="tag" />
      )
    },
    { prop: 'remark', label: '备注', minWidth: 280, showOverflowTooltip: true },
    {
      prop: 'updateTime',
      label: '更新时间',
      width: 164,
      formatter: (row) => (row.updateTime ? dayjs(row.updateTime).format('YYYY-MM-DD HH:mm') : '—')
    },
    {
      prop: 'operation',
      label: '操作',
      width: 112,
      fixed: 'right',
      formatter: (row) => (
        <div class="inspection-category-page__actions">
          <ArtButtonTable
            type="edit"
            permission="SmisInspectionCategory:Edit"
            label="编辑检验类别"
            onClick={() => openDialog(row)}
          />
          <ArtButtonTable
            type="delete"
            permission="SmisInspectionCategory:Delete"
            label="删除检验类别"
            onClick={() => void handleDelete(row)}
          />
        </div>
      )
    }
  ]

  const fetchTableData = async (params: TableParams) => {
    const { from, to } = pageInfoHandler({ current: params.current, size: params.size })
    const response = await fetchInspectionCategoryList({
      keyword: params.keyword,
      status: params.status,
      tenantId: effectiveTenantId.value,
      from,
      to
    })
    Object.assign(overview, response.overview)
    return response
  }

  const handleSaveSuccess = (type: 'add' | 'edit'): void => {
    void (type === 'add'
      ? tableQueryRef.value?.refreshCreate()
      : tableQueryRef.value?.refreshUpdate())
  }

  const handleDelete = async (row: SmisInspectionCategory): Promise<void> => {
    if (!row.id) return
    try {
      await confirmDelete(`确定删除检验类别“${row.categoryName}”吗？删除后无法恢复。`)
      await deleteInspectionCategories([row.id], row.tenantId)
      await tableQueryRef.value?.refreshRemove()
    } catch {
      /* 用户取消 */
    }
  }

  onMounted(async () => {
    await Promise.all([
      userStore.ensureDictLoaded('smisInspectionCategoryStatus'),
      tenantScopeStore.loadTenantOptions()
    ])
  })

  watch(revision, () => {
    const tableQuery = tableQueryRef.value
    tableQuery?.clearSelection()
    tableQuery?.resetColumns()
    void tableQuery?.refreshContext()
  })
</script>

<style scoped lang="scss">
  .inspection-category-page {
    gap: 12px;
    min-width: 0;

    :deep(.inspection-category-page__identity) {
      display: grid;
      grid-template-columns: 34px minmax(0, 1fr);
      gap: 10px;
      align-items: center;
      min-width: 0;

      > span {
        display: grid;
        place-items: center;
        width: 34px;
        height: 34px;
        color: var(--theme-color);
        background: color-mix(in srgb, var(--theme-color) 9%, var(--el-bg-color));
        border-radius: var(--el-border-radius-base);
      }

      strong {
        overflow: hidden;
        text-overflow: ellipsis;
        color: var(--el-text-color-primary);
        white-space: nowrap;
      }
    }

    :deep(.inspection-category-page__code) {
      display: inline-block;
      max-width: 100%;
      padding: 4px 8px;
      overflow: hidden;
      text-overflow: ellipsis;
      font-family: var(--art-font-family-mono, Consolas, monospace);
      font-size: 12px;
      color: var(--theme-color);
      white-space: nowrap;
      background: color-mix(in srgb, var(--theme-color) 7%, var(--el-bg-color));
      border-radius: var(--el-border-radius-small);
    }

    :deep(.inspection-category-page__actions) {
      display: flex;
      align-items: center;
    }
  }
</style>
