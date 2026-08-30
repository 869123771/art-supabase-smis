<template>
  <ArtPermissionGuard permission="SmisViolationCategory:View" resource-name="违章分类">
    <div class="violation-category-page business-workspace-page art-full-height">
      <BusinessWorkspaceHeader
        eyebrow="ANTI-VIOLATION TAXONOMY"
        title="违章分类"
        description="统一维护违章分类层级与业务边界，为标准库归档、三违教育和后续分析建立稳定口径。"
        icon="ri:node-tree"
        :tags="[
          { label: '树形分类', type: 'primary', effect: 'plain' },
          { label: '租户级隔离', type: 'success', effect: 'light' },
          { label: '历史关联保护', type: 'info', effect: 'plain' }
        ]"
        :metrics="workspaceMetrics"
      >
        <template #actions><BusinessTableWorkspaceActions :table="tableQueryRef" /></template>
      </BusinessWorkspaceHeader>

      <div class="violation-category-page__workspace">
        <ArtWorkspaceSplitter
          primary-size="304px"
          primary-min="264px"
          primary-max="430px"
          :breakpoint="920"
          stacked-primary-size="36vh"
        >
          <template #primary>
            <ViolationCategoryNavigator
              :data="tree.data"
              :loading="tree.loading"
              :error="tree.error"
              :selected-key="tree.selectedKey"
              target-label="违章分类"
              @select="handleTreeSelect"
              @refresh="handleTreeRefresh"
            />
          </template>

          <ArtTableQuery
            ref="tableQueryRef"
            v-model="table.searchQuery"
            class="violation-category-page__table"
            :api-fn="fetchTableData"
            :search-items="table.searchItems"
            :columns-factory="columnsFactory"
            :header-actions="table.headerActions"
            header-actions-placement="workspace"
            :search-bar-props="{ span: 8, labelWidth: 82, showExpand: false }"
            :table-props="{
              rowKey: 'id',
              tableLayout: 'fixed',
              emptyText: tree.selectedKey === ALL_KEY ? '暂无违章分类' : '当前层级暂无分类',
              emptyDescription:
                tree.selectedKey === ALL_KEY
                  ? '请先新增一级分类，再逐步维护下级结构。'
                  : '可新增下级分类，或切换左侧节点查看其他层级。'
            }"
            focusable
            focus-scope-selector=".violation-category-page__workspace"
          />
        </ArtWorkspaceSplitter>
      </div>

      <ViolationCategoryDialog ref="dialogRef" @success="handleSaveSuccess" />
    </div>
  </ArtPermissionGuard>
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
  import TreeUtils from '@/utils/tree'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import ArtDictDisplay from '@/components/core/base/art-dict-display/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import ArtPermissionGuard from '@/components/core/feedback/art-permission-guard/index.vue'
  import ArtWorkspaceSplitter from '@/components/core/layouts/art-workspace-splitter/index.vue'
  import BusinessTableWorkspaceActions from '@/components/business/business-table-workspace-actions/index.vue'
  import BusinessWorkspaceHeader, {
    type BusinessWorkspaceMetric
  } from '@/components/business/business-workspace-header/index.vue'
  import {
    deleteViolationCategories,
    fetchViolationCategoryList,
    type SmisViolationCategory,
    type SmisViolationCategoryOverview,
    type SmisViolationCategorySearchParams
  } from '@smis/api'
  import ViolationCategoryNavigator from '../shared/violation-category-navigator.vue'
  import ViolationCategoryDialog, {
    type ViolationCategoryDialogOpenData
  } from './modules/violation-category-dialog.vue'

  defineOptions({ name: 'SmisViolationCategory' })

  const ALL_KEY = 'all'
  type TableParams = SmisViolationCategorySearchParams &
    Pick<Api.Common.PaginationParams, 'current' | 'size'>
  interface DialogExpose {
    handleOpen: (data: ViolationCategoryDialogOpenData) => Promise<void>
  }
  interface TableGroup {
    searchQuery: SmisViolationCategorySearchParams
    searchItems: SearchFormItem[]
    headerActions: ArtTableQueryHeaderAction[]
  }
  interface TreeGroup {
    data: SmisViolationCategory[]
    selectedKey: string
    loading: boolean
    error: string | null
  }

  const { confirmDelete } = useArtFeedback()
  const userStore = useUserStore()
  const { getDictMap } = storeToRefs(userStore)
  const treeUtils = new TreeUtils({ idKey: 'id', parentKey: 'parentId', childrenKey: 'children' })
  const tableQueryRef = ref<ArtTableQueryExpose>()
  const dialogRef = ref<DialogExpose>()
  const overview = reactive<SmisViolationCategoryOverview>({
    total: 0,
    enabled: 0,
    rootCount: 0,
    usedCount: 0
  })
  const tree = reactive<TreeGroup>({ data: [], selectedKey: ALL_KEY, loading: false, error: null })
  const tableSearchQuery = reactive<SmisViolationCategorySearchParams>({})
  const statusOptions = computed(() =>
    (getDictMap.value.smisAntiViolationStatus ?? []).map((item) => ({
      label: item.label || item.name,
      value: item.value
    }))
  )
  const selectedCategory = computed(() =>
    tree.selectedKey === ALL_KEY ? null : treeUtils.findNode(tree.data, tree.selectedKey)
  )
  const workspaceMetrics = computed<BusinessWorkspaceMetric[]>(() => [
    {
      label: '分类总数',
      value: overview.total,
      description: '当前租户分类节点',
      icon: 'ri:stack-line'
    },
    {
      label: '已启用',
      value: overview.enabled,
      description: '可用于新增标准',
      icon: 'ri:checkbox-circle-line',
      tone: 'success'
    },
    {
      label: '一级分类',
      value: overview.rootCount,
      description: '分类树根节点',
      icon: 'ri:git-branch-line'
    },
    {
      label: '已使用分类',
      value: overview.usedCount,
      description: '已关联标准库',
      icon: 'ri:links-line',
      tone: 'warning'
    }
  ])

  const openDialog = (row?: SmisViolationCategory): void => {
    void dialogRef.value?.handleOpen({
      row,
      tree: tree.data,
      presetParentId: !row ? selectedCategory.value?.id : undefined
    })
  }

  const headerActions: ComputedRef<ArtTableQueryHeaderAction[]> = computed(() => [
    {
      permission: 'SmisViolationCategory:Add',
      type: 'add',
      label: selectedCategory.value ? '新增下级分类' : '新增违章分类',
      onClick: () => openDialog()
    },
    {
      permission: 'SmisViolationCategory:Delete',
      type: 'delete',
      content: ({ selectedCount }: ArtTableQueryHeaderActionContext) =>
        `确定删除选中的 ${selectedCount} 个违章分类吗？存在未选中的下级分类或关联标准时将无法删除。`,
      onClick: async ({ selectedRows, api }) => {
        const ids = selectedRows.flatMap((row) => (row.id ? [String(row.id)] : []))
        if (ids.includes(tree.selectedKey)) tree.selectedKey = ALL_KEY
        await deleteViolationCategories(ids)
        await api.refreshRemove()
      }
    },
    {
      permission: 'SmisViolationCategory:Export',
      type: 'export',
      label: '导出',
      exportFilename: '违章分类',
      exportSheetName: '违章分类',
      exportColumns: [
        { key: 'categoryCode', title: '分类编码' },
        { key: 'categoryName', title: '分类名称' },
        { key: 'parentCategoryName', title: '上级分类' },
        { key: 'standardCount', title: '关联标准数' },
        { key: 'status', title: '启用状态' },
        { key: 'description', title: '分类说明' }
      ],
      exportApi: async ({ maxRows }) => ({
        data: (
          await fetchViolationCategoryList({
            ...tableSearchQuery,
            ancestorId: tree.selectedKey === ALL_KEY ? undefined : tree.selectedKey,
            purpose: 'export',
            from: 0,
            to: maxRows - 1
          })
        ).data
      })
    }
  ])

  const table: TableGroup = reactive({
    searchQuery: tableSearchQuery,
    searchItems: computed(() => [
      {
        label: '关键字',
        key: 'keyword',
        type: 'input',
        props: { clearable: true, placeholder: '分类编码、名称或说明' }
      },
      {
        label: '启用状态',
        key: 'status',
        type: 'select',
        props: { options: statusOptions.value, clearable: true, placeholder: '全部状态' }
      }
    ]),
    headerActions
  })

  const columnsFactory = (): ColumnOption<SmisViolationCategory>[] => [
    { type: 'selection', width: 48 },
    { prop: 'sort', label: '显示顺序', width: 106, align: 'center', sortable: true },
    {
      prop: 'categoryName',
      label: '违章分类',
      minWidth: 220,
      fixed: 'left',
      formatter: (row) => (
        <div class="violation-category-page__identity">
          <span aria-hidden="true">
            <ArtSvgIcon
              icon={row.childCount ? 'ri:folder-warning-line' : 'ri:error-warning-line'}
            />
          </span>
          <span>
            <strong title={row.categoryName}>{row.categoryName}</strong>
            <small title={row.categoryCode}>{row.categoryCode}</small>
          </span>
        </div>
      )
    },
    {
      prop: 'parentCategoryName',
      label: '上级分类',
      minWidth: 160,
      showOverflowTooltip: true,
      formatter: (row) => row.parentCategoryName || '一级分类'
    },
    {
      prop: 'standardCount',
      label: '关联标准',
      width: 108,
      align: 'center',
      sortable: true,
      formatter: (row) => `${row.standardCount || 0} 项`
    },
    {
      prop: 'status',
      label: '启用状态',
      width: 108,
      align: 'center',
      formatter: (row) => (
        <ArtDictDisplay dictCode="smisAntiViolationStatus" value={row.status} display="tag" />
      )
    },
    { prop: 'description', label: '分类说明', minWidth: 240, showOverflowTooltip: true },
    {
      prop: 'updateTime',
      label: '更新时间',
      width: 164,
      formatter: (row) => (row.updateTime ? dayjs(row.updateTime).format('YYYY-MM-DD HH:mm') : '—')
    },
    {
      prop: 'operation',
      label: '操作',
      width: 120,
      fixed: 'right',
      formatter: (row) => (
        <div class="violation-category-page__actions">
          <ArtButtonTable
            permission="SmisViolationCategory:Edit"
            type="edit"
            onClick={() => openDialog(row)}
          />
          <ArtButtonTable
            permission="SmisViolationCategory:Delete"
            type="delete"
            onClick={() => void handleDelete(row)}
          />
        </div>
      )
    }
  ]

  const fetchTableData = async (params: TableParams) => {
    tree.loading = !tree.data.length
    tree.error = null
    try {
      const result = await fetchViolationCategoryList({
        ...params,
        ...pageInfoHandler(params),
        ancestorId: tree.selectedKey === ALL_KEY ? undefined : tree.selectedKey
      })
      tree.data = result.tree
      Object.assign(overview, result.overview)
      tree.error = result.error ? '违章分类结构加载失败，请重试。' : null
      return { records: result.data, total: result.total }
    } finally {
      tree.loading = false
    }
  }

  const handleTreeSelect = (key: string): void => {
    tree.selectedKey = key
    void tableQueryRef.value?.getData()
  }
  const handleTreeRefresh = (): void => void tableQueryRef.value?.getData()
  const handleSaveSuccess = (): void => void tableQueryRef.value?.getData()
  const handleDelete = async (row: SmisViolationCategory): Promise<void> => {
    if (!row.id) return
    try {
      await confirmDelete(`确定删除违章分类“${row.categoryName}”吗？`)
      await deleteViolationCategories([row.id])
      if (tree.selectedKey === row.id) tree.selectedKey = ALL_KEY
      await tableQueryRef.value?.getData()
    } catch {
      /* 用户取消 */
    }
  }

  onMounted(() => void userStore.ensureDictLoaded('smisAntiViolationStatus'))
</script>

<style scoped lang="scss">
  .violation-category-page {
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-height: 0;

    &__workspace {
      flex: 1;
      width: 100%;
      min-height: 0;
    }

    &__table {
      min-width: 0;
      min-height: 0;
    }

    :deep(.violation-category-page__identity) {
      display: grid;
      grid-template-columns: 36px minmax(0, 1fr);
      gap: 10px;
      align-items: center;
      min-width: 0;

      > span:first-child {
        display: grid;
        place-items: center;
        width: 36px;
        height: 36px;
        color: var(--theme-color);
        background: color-mix(in srgb, var(--theme-color) 9%, var(--el-bg-color));
        border-radius: var(--el-border-radius-base);
      }

      > span:last-child {
        display: grid;
        min-width: 0;
      }

      strong,
      small {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      small {
        margin-top: 2px;
        font-size: 11px;
        color: var(--el-text-color-secondary);
      }
    }

    :deep(.violation-category-page__actions) {
      display: flex;
      gap: 4px;
      align-items: center;
    }
  }
</style>
