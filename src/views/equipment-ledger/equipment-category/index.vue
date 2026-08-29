<template>
  <div class="equipment-category-page business-workspace-page art-full-height">
    <BusinessWorkspaceHeader
      eyebrow="SHARED EQUIPMENT TAXONOMY"
      title="设备分类"
      description="按租户维护可扩展的设备分类树与适用检验规则，为安全、资产和设备管理系统提供统一台账口径。"
      icon="ri:node-tree"
      :tags="[
        { label: '租户级隔离', type: 'primary', effect: 'plain' },
        { label: '跨系统共享', type: 'success', effect: 'light' },
        { label: '树形分类', type: 'info', effect: 'plain' }
      ]"
      :metrics="workspaceMetrics"
    >
      <template #actions>
        <BusinessTableWorkspaceActions :table="tableQueryRef" />
      </template>
    </BusinessWorkspaceHeader>

    <div class="equipment-category-page__workspace">
      <ArtWorkspaceSplitter
        primary-size="300px"
        primary-min="250px"
        primary-max="400px"
        :breakpoint="900"
        stacked-primary-size="36vh"
      >
        <template #primary>
          <EquipmentCategoryNavigator
            :data="tree.data"
            :loading="tree.loading"
            :error="tree.error"
            :selected-key="tree.selectedKey"
            @select="handleTreeSelect"
            @refresh="handleTreeRefresh"
          />
        </template>

        <ArtTableQuery
          ref="tableQueryRef"
          v-model="table.searchQuery"
          class="equipment-category-page__table"
          :api-fn="fetchTableData"
          :search-items="table.searchItems"
          :columns-factory="columnsFactory"
          :header-actions="table.headerActions"
          header-actions-placement="workspace"
          :search-bar-props="{ span: 8, labelWidth: 82, showExpand: false }"
          :table-props="{
            rowKey: 'id',
            tableLayout: 'fixed',
            emptyText: tree.selectedKey === ALL_KEY ? '暂无设备分类' : '当前分类下暂无数据',
            emptyDescription:
              tree.selectedKey === ALL_KEY
                ? '请先新增一级设备分类，再逐步维护下级结构与检验规则。'
                : '可新增下级分类，或切换左侧节点查看其他分类。'
          }"
          focusable
          focus-scope-selector=".equipment-category-page__workspace"
        />
      </ArtWorkspaceSplitter>
    </div>

    <EquipmentCategoryDialog ref="dialogRef" @success="handleSaveSuccess" />
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
  import TreeUtils from '@/utils/tree'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import ArtDictDisplay from '@/components/core/base/art-dict-display/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import BusinessTableWorkspaceActions from '@/components/business/business-table-workspace-actions/index.vue'
  import BusinessWorkspaceHeader, {
    type BusinessWorkspaceMetric
  } from '@/components/business/business-workspace-header/index.vue'
  import ArtWorkspaceSplitter from '@/components/core/layouts/art-workspace-splitter/index.vue'
  import {
    deleteEquipmentCategories,
    fetchEquipmentCategoryList,
    type SmisEquipmentCategory,
    type SmisEquipmentCategoryOverview,
    type SmisEquipmentCategorySearchParams,
    type SmisEquipmentInspectionCategory
  } from '@smis/api'
  import EquipmentCategoryNavigator from './modules/equipment-category-navigator.vue'
  import EquipmentCategoryDialog, {
    type EquipmentCategoryDialogOpenData
  } from './modules/equipment-category-dialog.vue'

  defineOptions({ name: 'SmisEquipmentCategory' })

  const ALL_KEY = 'all'
  type TableParams = SmisEquipmentCategorySearchParams &
    Pick<Api.Common.PaginationParams, 'current' | 'size'>

  interface DialogExpose {
    handleOpen: (data: EquipmentCategoryDialogOpenData) => Promise<void>
  }

  interface TableGroup {
    searchQuery: SmisEquipmentCategorySearchParams
    searchItems: ComputedRef<SearchFormItem[]>
    headerActions: ComputedRef<ArtTableQueryHeaderAction[]>
  }

  interface TreeGroup {
    data: SmisEquipmentCategory[]
    inspectionOptions: SmisEquipmentInspectionCategory[]
    selectedKey: string
    loading: boolean
    error: string | null
  }

  const { confirmDelete } = useArtFeedback()
  const userStore = useUserStore()
  const { getDictMap, getUserInfo } = storeToRefs(userStore)
  const { effectiveTenantId, isAllTenants } = storeToRefs(useTenantScopeStore())
  const treeUtils = new TreeUtils({ idKey: 'id', parentKey: 'parentId', childrenKey: 'children' })
  const tableQueryRef = ref<ArtTableQueryExpose>()
  const dialogRef = ref<DialogExpose>()
  const overview = reactive<SmisEquipmentCategoryOverview>({
    total: 0,
    enabled: 0,
    rootCount: 0,
    linkedCount: 0
  })
  const tree = reactive<TreeGroup>({
    data: [],
    inspectionOptions: [],
    selectedKey: ALL_KEY,
    loading: false,
    error: null
  })

  const statusOptions = computed(() =>
    (getDictMap.value.smisEquipmentCategoryStatus ?? []).map((item) => ({
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
      description: '可用于新增设备',
      icon: 'ri:checkbox-circle-line',
      tone: 'success'
    },
    {
      label: '一级分类',
      value: overview.rootCount,
      description: '设备分类树根节点',
      icon: 'ri:git-branch-line'
    },
    {
      label: '已配置检验规则',
      value: overview.linkedCount,
      description: '关联至少一种检验',
      icon: 'ri:shield-check-line',
      tone: 'warning'
    }
  ])

  const openDialog = (row?: SmisEquipmentCategory): void => {
    const targetTenantId =
      row?.tenantId || effectiveTenantId.value || getUserInfo.value.tenantId || ''
    void dialogRef.value?.handleOpen({
      row,
      tenantId: targetTenantId,
      allTenants: isAllTenants.value,
      tree: tree.data,
      inspectionOptions: tree.inspectionOptions,
      presetParentId:
        !row && selectedCategory.value?.tenantId === targetTenantId
          ? selectedCategory.value.id
          : undefined
    })
  }

  const headerActions = computed<ArtTableQueryHeaderAction[]>(() => [
    {
      permission: 'SmisEquipmentCategory:Add',
      type: 'add',
      label: selectedCategory.value ? '新增下级分类' : '新增设备分类',
      onClick: () => openDialog()
    },
    {
      permission: 'SmisEquipmentCategory:Delete',
      type: 'delete',
      content: ({ selectedCount }: ArtTableQueryHeaderActionContext) =>
        `确定删除选中的 ${selectedCount} 个设备分类吗？存在未选中的下级分类时将无法删除。`,
      onClick: async ({ selectedRows, api }) => {
        const ids = selectedRows
          .map((row) => row.id)
          .filter((id): id is string => typeof id === 'string')
        if (ids.includes(tree.selectedKey)) resetTreeSelection()
        await deleteEquipmentCategories(ids)
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
        props: { clearable: true, placeholder: '分类编码、名称、简称或备注' }
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

  const columnsFactory = (): ColumnOption<SmisEquipmentCategory>[] => [
    { type: 'selection', width: 48 },
    { prop: 'sort', label: '排序', width: 82, align: 'center', sortable: true },
    {
      prop: 'categoryName',
      label: '设备分类',
      minWidth: 210,
      fixed: 'left',
      formatter: (row) => (
        <div class="equipment-category-page__identity">
          <span aria-hidden="true">
            <ArtSvgIcon icon={row.childCount ? 'ri:folder-3-line' : 'ri:price-tag-3-line'} />
          </span>
          <span>
            <strong title={row.categoryName}>{row.categoryName}</strong>
            <small title={row.categoryShortName || '未设置简称'}>
              {row.categoryShortName || '未设置简称'}
            </small>
          </span>
        </div>
      )
    },
    {
      prop: 'categoryCode',
      label: '设备分类编码',
      minWidth: 180,
      sortable: true,
      formatter: (row) => (
        <span class="equipment-category-page__code" title={row.categoryCode}>
          {row.categoryCode}
        </span>
      )
    },
    {
      prop: 'parentCategoryName',
      label: '上级设备分类',
      minWidth: 160,
      showOverflowTooltip: true,
      formatter: (row) => row.parentCategoryName || '一级分类'
    },
    {
      prop: 'inspectionCategories',
      label: '适用检验类别',
      minWidth: 250,
      showOverflowTooltip: true,
      formatter: (row) => (
        <span
          class={{
            'equipment-category-page__inspection': true,
            'is-empty': !row.inspectionCategories.length
          }}
          title={row.inspectionCategories.map((item) => item.categoryName).join('、')}
        >
          {row.inspectionCategories.length
            ? row.inspectionCategories.map((item) => item.categoryName).join('、')
            : '未配置'}
        </span>
      )
    },
    {
      prop: 'status',
      label: '启用状态',
      width: 106,
      align: 'center',
      formatter: (row) => (
        <ArtDictDisplay dictCode="smisEquipmentCategoryStatus" value={row.status} display="tag" />
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
        <div class="equipment-category-page__actions">
          <ArtButtonTable
            type="edit"
            permission="SmisEquipmentCategory:Edit"
            onClick={() => openDialog(row)}
          />
          <ArtButtonTable
            type="delete"
            permission="SmisEquipmentCategory:Delete"
            onClick={() => void handleDelete(row)}
          />
        </div>
      )
    }
  ]

  const fetchTableData = async (params: TableParams) => {
    const { from, to } = pageInfoHandler({ current: params.current, size: params.size })
    tree.loading = true
    tree.error = null
    try {
      const response = await fetchEquipmentCategoryList({
        keyword: params.keyword,
        status: params.status,
        ancestorId: params.ancestorId,
        from,
        to
      })
      Object.assign(overview, response.overview)
      Object.assign(tree, {
        data: response.tree,
        inspectionOptions: response.inspectionOptions
      })
      return response
    } catch (error) {
      tree.error = '设备分类树加载失败，请稍后重试。'
      throw error
    } finally {
      tree.loading = false
    }
  }

  const resetTreeSelection = (): void => {
    tree.selectedKey = ALL_KEY
    table.searchQuery.ancestorId = undefined
  }

  const handleTreeSelect = (key: string): void => {
    tree.selectedKey = key
    table.searchQuery.ancestorId = key === ALL_KEY ? undefined : key
    void tableQueryRef.value?.getData()
  }

  const handleTreeRefresh = (): void => {
    void tableQueryRef.value?.refreshData()
  }

  const handleSaveSuccess = (type: 'add' | 'edit'): void => {
    void (type === 'add'
      ? tableQueryRef.value?.refreshCreate()
      : tableQueryRef.value?.refreshUpdate())
  }

  const handleDelete = async (row: SmisEquipmentCategory): Promise<void> => {
    if (!row.id) return
    try {
      await confirmDelete(
        `确定删除设备分类“${row.categoryName}”吗？存在下级分类或已被设备引用时将无法删除。`
      )
      if (tree.selectedKey === row.id) resetTreeSelection()
      await deleteEquipmentCategories([row.id])
      await tableQueryRef.value?.refreshRemove()
    } catch {
      /* 用户取消或业务校验未通过 */
    }
  }

  onMounted(async () => {
    await userStore.ensureDictLoaded('smisEquipmentCategoryStatus')
  })
</script>

<style scoped lang="scss">
  .equipment-category-page {
    gap: 12px;
    min-width: 0;

    &__workspace {
      flex: 1;
      width: 100%;
      min-height: 0;
    }

    &__table {
      min-width: 0;
      height: 100%;
    }

    :deep(.equipment-category-page__identity) {
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

      strong {
        color: var(--el-text-color-primary);
      }

      small {
        margin-top: 2px;
        font-size: 11px;
        color: var(--el-text-color-secondary);
      }
    }

    :deep(.equipment-category-page__code) {
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

    :deep(.equipment-category-page__inspection) {
      color: var(--el-text-color-regular);

      &.is-empty {
        color: var(--el-text-color-placeholder);
      }
    }

    :deep(.equipment-category-page__actions) {
      display: flex;
      align-items: center;
    }

    @media (width <= 900px) {
      &__workspace {
        overflow: visible;
      }
    }
  }
</style>
