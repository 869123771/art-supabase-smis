<template>
  <ArtPermissionGuard
    permission="SmisDualControlHazardFactorCategory:View"
    resource-name="危害因素类别"
  >
    <div class="hazard-factor-category-page business-workspace-page art-full-height">
      <BusinessWorkspaceHeader
        eyebrow="HAZARD FACTOR CATEGORY MASTER DATA"
        title="危害因素类别"
        description="统一维护风险辨识使用的危害因素编号、名称与视觉标识，保证风险清单和排查场景采用一致口径。"
        icon="ri:price-tag-3-line"
        :tags="[
          { label: '租户级主数据', type: 'primary', effect: 'plain' },
          { label: '风险辨识口径', type: 'warning', effect: 'light' },
          { label: '视觉标识可配', type: 'success', effect: 'plain' }
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
        :search-bar-props="{ span: 6, labelWidth: 84, showExpand: false }"
        :table-props="{
          rowKey: 'id',
          tableLayout: 'fixed',
          emptyText: '暂无危害因素类别',
          emptyDescription: '可新增人的因素、物的因素、环境因素或管理因素下的具体类别。'
        }"
        focusable
      />

      <HazardFactorCategoryDialog ref="dialogRef" @success="handleSaveSuccess" />
    </div>
  </ArtPermissionGuard>
</template>

<script setup lang="tsx">
  import dayjs from 'dayjs'
  import { ElTag } from 'element-plus'
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
  import ArtPermissionGuard from '@/components/core/feedback/art-permission-guard/index.vue'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import ArtDictDisplay from '@/components/core/base/art-dict-display/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import BusinessTableWorkspaceActions from '@/components/business/business-table-workspace-actions/index.vue'
  import BusinessWorkspaceHeader, {
    type BusinessWorkspaceMetric
  } from '@/components/business/business-workspace-header/index.vue'
  import {
    deleteHazardFactorCategories,
    fetchHazardFactorCategoryList,
    type SmisHazardFactorCategory,
    type SmisHazardFactorCategoryOverview,
    type SmisHazardFactorCategorySearchParams,
    type SmisHazardFactorCategoryTagStyle,
    type SmisHazardFactorType
  } from '@smis/api'
  import HazardFactorCategoryDialog, {
    type HazardFactorCategoryDialogOpenData
  } from './modules/hazard-factor-category-dialog.vue'

  defineOptions({ name: 'SmisDualControlHazardFactorCategory' })

  type TableParams = SmisHazardFactorCategorySearchParams &
    Pick<Api.Common.PaginationParams, 'current' | 'size'>

  interface DialogExpose {
    handleOpen: (data: HazardFactorCategoryDialogOpenData) => Promise<void>
  }

  interface TableGroup {
    searchQuery: SmisHazardFactorCategorySearchParams
    searchItems: ComputedRef<SearchFormItem[]>
    headerActions: ComputedRef<ArtTableQueryHeaderAction[]>
  }

  const tagStyleOptions: Array<{
    label: string
    value: Exclude<SmisHazardFactorCategoryTagStyle, ''>
  }> = [
    { label: '主要', value: 'primary' },
    { label: '成功', value: 'success' },
    { label: '信息', value: 'info' },
    { label: '警告', value: 'warning' },
    { label: '危险', value: 'danger' }
  ]
  const tagStyleLabel = new Map(tagStyleOptions.map((item) => [item.value, item.label]))
  const { confirmDelete } = useArtFeedback()
  const userStore = useUserStore()
  const tenantScopeStore = useTenantScopeStore()
  const { getDictMap, isPlatformSuper, getUserInfo } = storeToRefs(userStore)
  const { effectiveTenantId, selectedTenant, revision, scopeLabel } = storeToRefs(tenantScopeStore)
  const tableQueryRef = ref<ArtTableQueryExpose>()
  const dialogRef = ref<DialogExpose>()
  const overview = reactive<SmisHazardFactorCategoryOverview>({
    total: 0,
    enabled: 0,
    disabled: 0,
    styled: 0
  })

  const statusOptions = computed(() =>
    (getDictMap.value.smisHazardFactorCategoryStatus ?? []).map((item) => ({
      label: item.label || item.name,
      value: item.value
    }))
  )

  const factorTypeOptions = computed(() =>
    (getDictMap.value.smisHazardFactorType ?? []).map((item) => ({
      label: item.label || item.name,
      value: item.value as SmisHazardFactorType
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
      description: '可用于风险辨识',
      icon: 'ri:checkbox-circle-line',
      tone: 'success'
    },
    {
      label: '已禁用',
      value: overview.disabled,
      description: '仅保留历史口径',
      icon: 'ri:forbid-2-line',
      tone: 'warning'
    },
    {
      label: '已配置视觉',
      value: overview.styled,
      description: '颜色或标签样式',
      icon: 'ri:palette-line'
    }
  ])

  const openDialog = (row?: SmisHazardFactorCategory): void => {
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

  async function deleteRowsByTenant(rows: SmisHazardFactorCategory[]): Promise<void> {
    const idsByTenant = new Map<string, string[]>()
    rows.forEach((row) => {
      if (!row.id || !row.tenantId) return
      const ids = idsByTenant.get(row.tenantId) ?? []
      ids.push(row.id)
      idsByTenant.set(row.tenantId, ids)
    })

    await Promise.all(
      [...idsByTenant.entries()].map(([tenantId, ids]) =>
        deleteHazardFactorCategories(ids, tenantId)
      )
    )
  }

  const headerActions = computed<ArtTableQueryHeaderAction[]>(() => [
    {
      permission: 'SmisDualControlHazardFactorCategory:Add',
      type: 'add',
      label: '新增危害因素类别',
      onClick: () => openDialog()
    },
    {
      permission: 'SmisDualControlHazardFactorCategory:Delete',
      type: 'delete',
      content: ({ selectedCount }: ArtTableQueryHeaderActionContext) =>
        `确定删除选中的 ${selectedCount} 个危害因素类别吗？已被业务数据使用的类别不会被删除。`,
      onClick: async ({ selectedRows, api }) => {
        await deleteRowsByTenant(selectedRows as SmisHazardFactorCategory[])
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
        props: { clearable: true, placeholder: '类别编号或类别名称' }
      },
      {
        label: '因素类型',
        key: 'factorType',
        type: 'select',
        props: { options: factorTypeOptions.value, clearable: true, placeholder: '全部类型' }
      },
      {
        label: '启用状态',
        key: 'status',
        type: 'select',
        props: { options: statusOptions.value, clearable: true, placeholder: '全部状态' }
      },
      {
        label: '标签样式',
        key: 'tagStyle',
        type: 'select',
        props: { options: tagStyleOptions, clearable: true, placeholder: '全部样式' }
      }
    ]),
    headerActions
  })

  const renderCategoryPreview = (row: SmisHazardFactorCategory) =>
    row.tagStyle ? (
      <ElTag type={row.tagStyle}>{row.categoryName}</ElTag>
    ) : (
      <span
        class="hazard-factor-category-page__plain-preview"
        style={{ color: row.textColor || undefined }}
        title={row.categoryName}
      >
        <i
          style={{ backgroundColor: row.textColor || 'var(--el-color-info)' }}
          aria-hidden="true"
        />
        {row.categoryName}
      </span>
    )

  const columnsFactory = (): ColumnOption<SmisHazardFactorCategory>[] => [
    { type: 'selection', width: 48 },
    { type: 'globalIndex', label: '序号', width: 72 },
    {
      prop: 'categoryName',
      label: '危害因素类别',
      minWidth: 300,
      fixed: 'left',
      formatter: (row) => (
        <div class="hazard-factor-category-page__identity">
          <span aria-hidden="true">
            <ArtSvgIcon icon="ri:price-tag-3-line" />
          </span>
          <div>
            <strong title={row.categoryName}>{row.categoryName}</strong>
            <small>编号 {row.categoryCode}</small>
          </div>
        </div>
      )
    },
    {
      prop: 'factorType',
      label: '因素类型',
      width: 112,
      align: 'center',
      formatter: (row) => (
        <ArtDictDisplay dictCode="smisHazardFactorType" value={row.factorType} display="tag" />
      )
    },
    {
      prop: 'categoryCode',
      label: '类别编号',
      width: 116,
      align: 'center',
      formatter: (row) => <span class="hazard-factor-category-page__code">{row.categoryCode}</span>
    },
    {
      prop: 'preview',
      label: '标签预览',
      minWidth: 220,
      formatter: renderCategoryPreview
    },
    { prop: 'sort', label: '排序', width: 90, align: 'center' },
    {
      prop: 'textColor',
      label: '文字颜色',
      width: 142,
      formatter: (row) =>
        row.textColor ? (
          <span class="hazard-factor-category-page__color-value">
            <i style={{ backgroundColor: row.textColor }} aria-hidden="true" />
            {row.textColor.toUpperCase()}
          </span>
        ) : (
          <span class="hazard-factor-category-page__unset">未设置</span>
        )
    },
    {
      prop: 'tagStyle',
      label: '标签样式',
      width: 116,
      align: 'center',
      formatter: (row) =>
        row.tagStyle ? (
          <ElTag type={row.tagStyle} effect="plain">
            {tagStyleLabel.get(row.tagStyle)}
          </ElTag>
        ) : (
          <span class="hazard-factor-category-page__unset">未设置</span>
        )
    },
    ...(isPlatformSuper.value
      ? [
          {
            prop: 'tenantName',
            label: '所属租户',
            minWidth: 190,
            showOverflowTooltip: true,
            formatter: (row: SmisHazardFactorCategory) =>
              row.tenantName ? `${row.tenantName}（${row.tenantCode || '—'}）` : '—'
          }
        ]
      : []),
    {
      prop: 'status',
      label: '状态',
      width: 96,
      align: 'center',
      formatter: (row) => (
        <ArtDictDisplay
          dictCode="smisHazardFactorCategoryStatus"
          value={row.status}
          display="tag"
        />
      )
    },
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
        <div class="hazard-factor-category-page__actions">
          <ArtButtonTable
            type="edit"
            permission="SmisDualControlHazardFactorCategory:Edit"
            label="编辑危害因素类别"
            onClick={() => openDialog(row)}
          />
          <ArtButtonTable
            type="delete"
            permission="SmisDualControlHazardFactorCategory:Delete"
            label="删除危害因素类别"
            onClick={() => void handleDelete(row)}
          />
        </div>
      )
    }
  ]

  const fetchTableData = async (params: TableParams) => {
    const { from, to } = pageInfoHandler({ current: params.current, size: params.size })
    const response = await fetchHazardFactorCategoryList({
      keyword: params.keyword,
      factorType: params.factorType,
      status: params.status,
      tagStyle: params.tagStyle,
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

  const handleDelete = async (row: SmisHazardFactorCategory): Promise<void> => {
    if (!row.id) return
    try {
      await confirmDelete(
        `确定删除危害因素类别“${row.categoryName}”吗？已被风险业务使用时请改为禁用。`
      )
      await deleteHazardFactorCategories([row.id], row.tenantId)
      await tableQueryRef.value?.refreshRemove()
    } catch {
      /* 用户取消 */
    }
  }

  onMounted(async () => {
    await Promise.all([
      userStore.ensureDictLoaded('smisHazardFactorCategoryStatus'),
      userStore.ensureDictLoaded('smisHazardFactorType'),
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
  .hazard-factor-category-page {
    gap: 12px;
    min-width: 0;

    :deep(.hazard-factor-category-page__identity) {
      display: grid;
      grid-template-columns: 36px minmax(0, 1fr);
      gap: 11px;
      align-items: center;
      min-width: 0;

      > span {
        display: grid;
        place-items: center;
        width: 36px;
        height: 36px;
        color: var(--theme-color);
        background: color-mix(in srgb, var(--theme-color) 9%, var(--el-bg-color));
        border-radius: var(--el-border-radius-base);
      }

      > div {
        min-width: 0;
      }

      strong,
      small {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      strong {
        color: var(--el-text-color-primary);
      }

      small {
        margin-top: 3px;
        color: var(--el-text-color-secondary);
      }
    }

    :deep(.hazard-factor-category-page__code) {
      display: inline-flex;
      justify-content: center;
      min-width: 44px;
      padding: 4px 8px;
      font-family: var(--art-font-family-mono, Consolas, monospace);
      font-size: 12px;
      font-weight: 600;
      color: var(--theme-color);
      background: color-mix(in srgb, var(--theme-color) 8%, var(--el-bg-color));
      border-radius: var(--el-border-radius-small);
    }

    :deep(.hazard-factor-category-page__plain-preview),
    :deep(.hazard-factor-category-page__color-value) {
      display: inline-flex;
      gap: 8px;
      align-items: center;
      max-width: 100%;

      i {
        flex: 0 0 auto;
        width: 10px;
        height: 10px;
        border: 1px solid color-mix(in srgb, currentcolor 18%, transparent);
        border-radius: 50%;
      }
    }

    :deep(.hazard-factor-category-page__plain-preview) {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    :deep(.hazard-factor-category-page__color-value) {
      font-family: var(--art-font-family-mono, Consolas, monospace);
      font-size: 12px;
      color: var(--el-text-color-regular);
    }

    :deep(.hazard-factor-category-page__unset) {
      font-size: 12px;
      color: var(--el-text-color-placeholder);
    }

    :deep(.hazard-factor-category-page__actions) {
      display: flex;
      align-items: center;
    }
  }
</style>
