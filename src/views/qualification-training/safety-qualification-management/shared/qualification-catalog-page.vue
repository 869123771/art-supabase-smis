<template>
  <ArtPermissionGuard :permission="`${config.permission}:View`" :resource-name="config.title">
    <div class="qualification-catalog-page business-workspace-page art-full-height">
      <BusinessWorkspaceHeader
        :eyebrow="config.eyebrow"
        :title="config.title"
        :description="config.description"
        :icon="config.icon"
        :tags="[
          { label: '树形结构', type: 'primary', effect: 'plain' },
          { label: '证件联动', type: 'success', effect: 'light' },
          { label: '历史引用保护', type: 'info', effect: 'plain' }
        ]"
        :metrics="metrics"
      >
        <template #actions><BusinessTableWorkspaceActions :table="tableRef" /></template>
      </BusinessWorkspaceHeader>
      <div class="qualification-catalog-page__workspace">
        <ArtWorkspaceSplitter
          primary-size="300px"
          primary-min="260px"
          primary-max="420px"
          :breakpoint="920"
          stacked-primary-size="36vh"
        >
          <template #primary>
            <QualificationCatalogNavigator
              :data="tree.data"
              :loading="tree.loading"
              :error="tree.error"
              :selected-key="tree.selectedKey"
              :title="config.title"
              @select="handleTreeSelect"
              @refresh="refresh"
            />
          </template>
          <ArtTableQuery
            ref="tableRef"
            v-model="searchQuery"
            class="qualification-catalog-page__table"
            :api-fn="fetchTableData"
            :search-items="searchItems"
            :columns-factory="columnsFactory"
            :header-actions="headerActions"
            header-actions-placement="workspace"
            :search-bar-props="{ span: 8, labelWidth: 82, showExpand: false }"
            :table-props="{
              rowKey: 'id',
              tableLayout: 'fixed',
              emptyText: `暂无${config.title}`,
              emptyDescription: `新增${config.title}后，可在证件明细中直接选择并自动带出编码。`
            }"
            focusable
            focus-scope-selector=".qualification-catalog-page__workspace"
          />
        </ArtWorkspaceSplitter>
      </div>
      <QualificationCatalogDialog ref="dialogRef" @success="refresh" />
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
    deleteQualificationCatalog,
    fetchQualificationCatalogList,
    type SmisQualificationCatalog,
    type SmisQualificationCatalogOverview,
    type SmisQualificationCatalogSearchParams,
    type SmisQualificationCatalogType
  } from '@smis/api'
  import QualificationCatalogNavigator from './qualification-catalog-navigator.vue'
  import QualificationCatalogDialog, {
    type QualificationCatalogDialogOpenData
  } from './qualification-catalog-dialog.vue'
  import { qualificationCatalogConfig } from './qualification-catalog-meta'

  const props = defineProps<{ catalogType: SmisQualificationCatalogType }>()
  const ALL_KEY = 'all'
  type TableParams = SmisQualificationCatalogSearchParams &
    Pick<Api.Common.PaginationParams, 'current' | 'size'>
  interface DialogExpose {
    handleOpen: (data: QualificationCatalogDialogOpenData) => Promise<void>
  }
  const config = computed(() => qualificationCatalogConfig[props.catalogType])
  const { confirmDelete } = useArtFeedback()
  const userStore = useUserStore()
  const { getDictMap } = storeToRefs(userStore)
  const treeUtils = new TreeUtils({ idKey: 'id', parentKey: 'parentId', childrenKey: 'children' })
  const tableRef = ref<ArtTableQueryExpose>()
  const dialogRef = ref<DialogExpose>()
  const overview = reactive<SmisQualificationCatalogOverview>({
    total: 0,
    enabled: 0,
    disabled: 0,
    rootCount: 0
  })
  const tree = reactive<{
    data: SmisQualificationCatalog[]
    selectedKey: string
    loading: boolean
    error: string | null
  }>({ data: [], selectedKey: ALL_KEY, loading: false, error: null })
  const searchQuery = reactive<Omit<SmisQualificationCatalogSearchParams, 'catalogType'>>({})
  const selectedNode = computed(() =>
    tree.selectedKey === ALL_KEY ? null : treeUtils.findNode(tree.data, tree.selectedKey)
  )
  const statusOptions = computed(() =>
    (getDictMap.value.smisQualificationStatus ?? []).map((item) => ({
      label: item.label || item.name,
      value: item.value
    }))
  )
  const metrics = computed<BusinessWorkspaceMetric[]>(() => [
    {
      label: '节点总数',
      value: overview.total,
      description: '当前租户全部节点',
      icon: 'ri:stack-line'
    },
    {
      label: '已启用',
      value: overview.enabled,
      description: '证件新增可选',
      icon: 'ri:checkbox-circle-line',
      tone: 'success'
    },
    {
      label: '已停用',
      value: overview.disabled,
      description: '仅保留历史引用',
      icon: 'ri:forbid-line',
      tone: 'warning'
    },
    {
      label: '一级节点',
      value: overview.rootCount,
      description: '树形结构根节点',
      icon: 'ri:git-branch-line'
    }
  ])
  const searchItems = computed<SearchFormItem[]>(() => [
    {
      label: '关键字',
      key: 'keyword',
      type: 'input',
      props: { clearable: true, placeholder: '编码、名称或备注' }
    },
    {
      label: '启用状态',
      key: 'status',
      type: 'select',
      props: { options: statusOptions.value, clearable: true, placeholder: '全部状态' }
    }
  ])
  const openDialog = (row?: SmisQualificationCatalog): void =>
    void dialogRef.value?.handleOpen({
      catalogType: props.catalogType,
      row,
      tree: tree.data,
      presetParentId: !row ? selectedNode.value?.id : undefined
    })
  const headerActions = computed<ArtTableQueryHeaderAction[]>(() => [
    {
      permission: `${config.value.permission}:Add`,
      type: 'add',
      label: selectedNode.value ? `新增下级${config.value.title}` : `新增${config.value.title}`,
      onClick: () => openDialog()
    },
    {
      permission: `${config.value.permission}:Delete`,
      type: 'delete',
      content: ({ selectedCount }: ArtTableQueryHeaderActionContext) =>
        `确定删除选中的 ${selectedCount} 个${config.value.title}吗？存在下级或证件引用时将无法删除。`,
      onClick: async ({ selectedRows, api }) => {
        await deleteQualificationCatalog(
          props.catalogType,
          selectedRows.map((row) => String(row.id))
        )
        tree.selectedKey = ALL_KEY
        await api.refreshRemove()
      }
    },
    {
      permission: `${config.value.permission}:Export`,
      type: 'export',
      label: '导出',
      exportFilename: config.value.title,
      exportSheetName: config.value.title,
      exportColumns: [
        { key: 'itemCode', title: '编码' },
        { key: 'itemName', title: '名称' },
        { key: 'parentName', title: '上级节点' },
        { key: 'status', title: '启用状态' },
        { key: 'remark', title: '备注' }
      ],
      exportApi: async ({ maxRows }) => ({
        data: (
          await fetchQualificationCatalogList({
            ...searchQuery,
            catalogType: props.catalogType,
            ancestorId: tree.selectedKey === ALL_KEY ? undefined : tree.selectedKey,
            purpose: 'export',
            from: 0,
            to: maxRows - 1
          })
        ).data
      })
    }
  ])
  const columnsFactory = (): ColumnOption<SmisQualificationCatalog>[] => [
    { type: 'selection', width: 48 },
    { prop: 'sort', label: '显示顺序', width: 100, align: 'center', sortable: true },
    {
      prop: 'itemName',
      label: config.value.title,
      minWidth: 220,
      fixed: 'left',
      formatter: (row) => (
        <div class="qualification-catalog-page__identity">
          <span>
            <ArtSvgIcon icon={row.childCount ? 'ri:folder-3-line' : config.value.icon} />
          </span>
          <span>
            <strong title={row.itemName}>{row.itemName}</strong>
            <small>{row.itemCode}</small>
          </span>
        </div>
      )
    },
    {
      prop: 'parentName',
      label: '上级节点',
      minWidth: 160,
      showOverflowTooltip: true,
      formatter: (row) => row.parentName || '一级节点'
    },
    {
      prop: 'status',
      label: '启用状态',
      width: 108,
      align: 'center',
      formatter: (row) => (
        <ArtDictDisplay dictCode="smisQualificationStatus" value={row.status} display="tag" />
      )
    },
    { prop: 'remark', label: '备注', minWidth: 240, showOverflowTooltip: true },
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
        <div class="qualification-catalog-page__actions">
          <ArtButtonTable
            permission={`${config.value.permission}:Edit`}
            type="edit"
            onClick={() => openDialog(row)}
          />
          <ArtButtonTable
            permission={`${config.value.permission}:Delete`}
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
      const result = await fetchQualificationCatalogList({
        ...params,
        ...pageInfoHandler(params),
        catalogType: props.catalogType,
        ancestorId: tree.selectedKey === ALL_KEY ? undefined : tree.selectedKey
      })
      tree.data = result.tree
      Object.assign(overview, result.overview)
      tree.error = result.error ? `${config.value.title}结构加载失败，请重试。` : null
      return { records: result.data, total: result.total }
    } finally {
      tree.loading = false
    }
  }
  const handleDelete = async (row: SmisQualificationCatalog): Promise<void> => {
    try {
      await confirmDelete(`确定删除${config.value.title}“${row.itemName}”吗？`)
      await deleteQualificationCatalog(props.catalogType, [row.id])
      await refresh()
    } catch {
      /* 用户取消 */
    }
  }
  const handleTreeSelect = (key: string): void => {
    tree.selectedKey = key
    void tableRef.value?.getData()
  }
  const refresh = async (): Promise<void> => {
    await tableRef.value?.getData()
  }
  onMounted(() => void userStore.ensureDictLoaded('smisQualificationStatus'))
</script>

<style scoped lang="scss">
  .qualification-catalog-page {
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

    :deep(.qualification-catalog-page__identity) {
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

    :deep(.qualification-catalog-page__actions) {
      display: flex;
      gap: 4px;
      align-items: center;
    }
  }
</style>
