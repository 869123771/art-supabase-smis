<template>
  <ArtPermissionGuard permission="SmisHazardousWasteCatalog:View" resource-name="危废名录">
    <div class="hazardous-catalog-page business-workspace-page art-full-height">
      <BusinessWorkspaceHeader
        eyebrow="HAZARDOUS WASTE CATALOG"
        title="危废名录"
        description="按分类维护危废编号、危险特性、安全措施和计量单位，为入出库明细建立统一识别标准。"
        icon="ri:flask-line"
        :tags="[
          { label: '树形分类', type: 'primary', effect: 'plain' },
          { label: '危险特性字典', type: 'warning', effect: 'light' },
          { label: '租户级隔离', type: 'info', effect: 'plain' }
        ]"
        :metrics="metrics"
        ><template #actions><BusinessTableWorkspaceActions :table="tableQueryRef" /></template
      ></BusinessWorkspaceHeader>
      <div class="hazardous-catalog-page__workspace"
        ><ArtWorkspaceSplitter
          primary-size="300px"
          primary-min="250px"
          primary-max="400px"
          :breakpoint="900"
          stacked-primary-size="36vh"
          ><template #primary
            ><CategoryNavigator
              :data="tree.data"
              :loading="tree.loading"
              :error="tree.error"
              :selected-key="tree.selectedKey"
              @select="handleSelect"
              @refresh="refresh"
              @add="handleAddCategory"
              @edit="openCategory"
              @delete="handleDeleteCategory" /></template
          ><ArtTableQuery
            ref="tableQueryRef"
            v-model="searchQuery"
            class="hazardous-catalog-page__table"
            :api-fn="fetchData"
            :search-items="searchItems"
            :columns-factory="columnsFactory"
            :header-actions="headerActions"
            header-actions-placement="workspace"
            :search-bar-props="{ span: 8, labelWidth: 82, showExpand: false }"
            :table-props="{
              rowKey: 'id',
              tableLayout: 'fixed',
              emptyText: '暂无危废名录',
              emptyDescription: '请选择或新增分类，再维护危废名录。'
            }"
            focusable
            focus-scope-selector=".hazardous-catalog-page__workspace" /></ArtWorkspaceSplitter
      ></div>
      <CategoryDialog ref="categoryDialogRef" @success="refresh" /><CatalogDialog
        ref="catalogDialogRef"
        @success="refresh"
      />
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
  import TreeUtils from '@/utils/tree'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import ArtDictDisplay from '@/components/core/base/art-dict-display/index.vue'
  import ArtPermissionGuard from '@/components/core/feedback/art-permission-guard/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import ArtWorkspaceSplitter from '@/components/core/layouts/art-workspace-splitter/index.vue'
  import BusinessTableWorkspaceActions from '@/components/business/business-table-workspace-actions/index.vue'
  import BusinessWorkspaceHeader, {
    type BusinessWorkspaceMetric
  } from '@/components/business/business-workspace-header/index.vue'
  import {
    deleteHazardousWasteCatalog,
    deleteHazardousWasteCategories,
    fetchHazardousWasteCatalogList,
    type SmisHazardousWasteCatalogItem,
    type SmisHazardousWasteCatalogOverview,
    type SmisHazardousWasteCatalogSearchParams,
    type SmisHazardousWasteCategory
  } from '@smis/api'
  import CategoryNavigator from './modules/category-navigator.vue'
  import CategoryDialog, { type CategoryDialogOpenData } from './modules/category-dialog.vue'
  import CatalogDialog, { type CatalogDialogOpenData } from './modules/catalog-dialog.vue'
  defineOptions({ name: 'SmisHazardousWasteCatalog' })
  const ALL_KEY = 'all'
  type TableParams = SmisHazardousWasteCatalogSearchParams &
    Pick<Api.Common.PaginationParams, 'current' | 'size'>
  interface CategoryExpose {
    handleOpen: (data: CategoryDialogOpenData) => Promise<void>
  }
  interface CatalogExpose {
    handleOpen: (data: CatalogDialogOpenData) => Promise<void>
  }
  const { confirmDelete } = useArtFeedback()
  const userStore = useUserStore()
  const { getDictMap } = storeToRefs(userStore)
  const utils = new TreeUtils({ idKey: 'id', parentKey: 'parentId', childrenKey: 'children' })
  const tableQueryRef = ref<ArtTableQueryExpose>()
  const categoryDialogRef = ref<CategoryExpose>()
  const catalogDialogRef = ref<CatalogExpose>()
  const searchQuery = reactive<SmisHazardousWasteCatalogSearchParams>({})
  const tree = reactive<{
    data: SmisHazardousWasteCategory[]
    selectedKey: string
    loading: boolean
    error: string | null
  }>({ data: [], selectedKey: ALL_KEY, loading: false, error: null })
  const overview = reactive<SmisHazardousWasteCatalogOverview>({
    total: 0,
    enabled: 0,
    categoryCount: 0,
    characteristicCount: 0
  })
  const selectedCategory = computed(() =>
    tree.selectedKey === ALL_KEY ? null : utils.findNode(tree.data, tree.selectedKey)
  )
  const options = computed(() =>
    (getDictMap.value.smisHazardousWasteEnableStatus ?? []).map((item) => ({
      label: item.label || item.name,
      value: item.value
    }))
  )
  const metrics = computed<BusinessWorkspaceMetric[]>(() => [
    {
      label: '名录总数',
      value: overview.total,
      description: '危废识别条目',
      icon: 'ri:file-list-3-line'
    },
    {
      label: '已启用',
      value: overview.enabled,
      description: '可用于新增单据',
      icon: 'ri:checkbox-circle-line',
      tone: 'success'
    },
    {
      label: '分类数量',
      value: overview.categoryCount,
      description: '当前分类节点',
      icon: 'ri:node-tree'
    },
    {
      label: '特性覆盖',
      value: overview.characteristicCount,
      description: '已配置危险特性',
      icon: 'ri:alert-line',
      tone: 'warning'
    }
  ])
  const searchItems = computed<SearchFormItem[]>(() => [
    {
      label: '关键字',
      key: 'keyword',
      type: 'input',
      props: { clearable: true, placeholder: '危废编号、名称或类型' }
    },
    {
      label: '启用状态',
      key: 'status',
      type: 'select',
      props: { options: options.value, clearable: true, placeholder: '全部状态' }
    }
  ])
  const openCategory = (row?: SmisHazardousWasteCategory, presetParentId?: string): void =>
    void categoryDialogRef.value?.handleOpen({
      row,
      tree: tree.data,
      presetParentId: row ? undefined : presetParentId
    })
  const handleAddCategory = (parentId?: string): void => openCategory(undefined, parentId)
  const openCatalog = (row?: SmisHazardousWasteCatalogItem): void =>
    void catalogDialogRef.value?.handleOpen({
      row,
      categories: tree.data,
      presetCategoryId: selectedCategory.value?.id
    })
  const exportColumns = [
    { key: 'wasteCode', title: '危废编号' },
    { key: 'wasteName', title: '危废名称' },
    { key: 'categoryName', title: '危废分类' },
    { key: 'wasteType', title: '废物类型' },
    { key: 'safetyMeasure', title: '安全措施' },
    { key: 'hazardCharacteristic', title: '危险特性' },
    { key: 'unit', title: '单位' },
    { key: 'statusLabel', title: '状态' }
  ]
  const headerActions = computed<ArtTableQueryHeaderAction[]>(() => [
    {
      permission: 'SmisHazardousWasteCatalog:Add',
      type: 'add',
      label: '新增危废名录',
      onClick: () => openCatalog()
    },
    {
      permission: 'SmisHazardousWasteCatalog:Export',
      type: 'export',
      exportFilename: '危废名录',
      exportSheetName: '危废名录',
      exportColumns,
      exportApi: async ({ selectedIds, searchParams, maxRows }) => {
        const response = await fetchHazardousWasteCatalogList({
          ...(searchParams as SmisHazardousWasteCatalogSearchParams),
          categoryId: tree.selectedKey === ALL_KEY ? undefined : tree.selectedKey,
          ids: selectedIds.map(String),
          purpose: 'export',
          to: Math.max((maxRows ?? 10000) - 1, 0)
        })
        return {
          data: response.data.map((row) => ({
            ...row,
            categoryName: row.category.categoryName,
            statusLabel: row.status === 'enabled' ? '启用' : '禁用'
          }))
        }
      }
    },
    {
      permission: 'SmisHazardousWasteCatalog:Delete',
      type: 'delete',
      content: ({ selectedCount }: ArtTableQueryHeaderActionContext) =>
        `确定删除选中的 ${selectedCount} 条危废名录吗？`,
      onClick: async ({ selectedRows, api }) => {
        await deleteHazardousWasteCatalog(selectedRows.map((row) => String(row.id)))
        await api.refreshRemove()
      }
    }
  ])
  const columnsFactory = (): ColumnOption<SmisHazardousWasteCatalogItem>[] => [
    { type: 'selection', width: 48 },
    { prop: 'sort', label: '排序', width: 76, align: 'center' },
    {
      prop: 'wasteName',
      label: '危废名录',
      minWidth: 220,
      fixed: 'left',
      formatter: (row) => (
        <div class="hazardous-catalog-page__identity">
          <ArtSvgIcon icon="ri:flask-line" />
          <span>
            <strong>{row.wasteName}</strong>
            <small>{row.wasteCode}</small>
          </span>
        </div>
      )
    },
    {
      prop: 'category',
      label: '危废分类',
      minWidth: 150,
      formatter: (row) => (
        <ElTag type={row.tagStyle || 'info'}>
          <span style={{ color: row.textColor || undefined }}>{row.category.categoryName}</span>
        </ElTag>
      )
    },
    {
      prop: 'wasteType',
      label: '废物类型',
      minWidth: 130,
      showOverflowTooltip: true,
      formatter: (row) => row.wasteType || '—'
    },
    {
      prop: 'hazardCharacteristic',
      label: '危险特性',
      minWidth: 130,
      formatter: (row) => (
        <ArtDictDisplay
          dictCode="smisHazardousWasteCharacteristic"
          value={row.hazardCharacteristic}
          display="tag"
        />
      )
    },
    {
      prop: 'safetyMeasure',
      label: '安全措施',
      minWidth: 140,
      showOverflowTooltip: true,
      formatter: (row) => (
        <ArtDictDisplay dictCode="smisHazardousWasteSafetyMeasure" value={row.safetyMeasure} />
      )
    },
    {
      prop: 'unit',
      label: '单位',
      width: 90,
      align: 'center',
      formatter: (row) => <ArtDictDisplay dictCode="smisMaterialUnit" value={row.unit} />
    },
    {
      prop: 'status',
      label: '状态',
      width: 100,
      align: 'center',
      formatter: (row) => (
        <ArtDictDisplay
          dictCode="smisHazardousWasteEnableStatus"
          value={row.status}
          display="tag"
        />
      )
    },
    {
      prop: 'updateTime',
      label: '更新时间',
      width: 164,
      formatter: (row) => dayjs(row.updateTime).format('YYYY-MM-DD HH:mm')
    },
    {
      prop: 'operation',
      label: '操作',
      width: 112,
      fixed: 'right',
      formatter: (row) => (
        <div class="hazardous-catalog-page__actions">
          <ArtButtonTable
            type="edit"
            permission="SmisHazardousWasteCatalog:Edit"
            onClick={() => openCatalog(row)}
          />
          <ArtButtonTable
            type="delete"
            permission="SmisHazardousWasteCatalog:Delete"
            onClick={() => void deleteRow(row)}
          />
        </div>
      )
    }
  ]
  const fetchData = async (params: TableParams) => {
    tree.loading = !tree.data.length
    tree.error = null
    try {
      const result = await fetchHazardousWasteCatalogList({
        ...params,
        ...pageInfoHandler(params),
        categoryId: tree.selectedKey === ALL_KEY ? undefined : tree.selectedKey
      })
      tree.data = result.categories
      Object.assign(overview, result.overview)
      return { records: result.data, total: result.total }
    } catch (error) {
      tree.error = '危废分类加载失败，请稍后重试。'
      throw error
    } finally {
      tree.loading = false
    }
  }
  const handleSelect = (key: string): void => {
    tree.selectedKey = key
    void tableQueryRef.value?.getData()
  }
  const refresh = async (): Promise<void> => {
    await tableQueryRef.value?.getData()
  }
  const deleteRow = async (row: SmisHazardousWasteCatalogItem): Promise<void> => {
    try {
      await confirmDelete(`确定删除危废名录“${row.wasteName}”吗？`)
      await deleteHazardousWasteCatalog([row.id])
      await refresh()
    } catch {
      /* 取消删除 */
    }
  }
  const handleDeleteCategory = async (row: SmisHazardousWasteCategory): Promise<void> => {
    try {
      await confirmDelete(`确定删除危废分类“${row.categoryName}”吗？`)
      await deleteHazardousWasteCategories([row.id])
      tree.selectedKey = ALL_KEY
      await refresh()
    } catch {
      /* 取消删除 */
    }
  }
  onMounted(
    () =>
      void Promise.all(
        [
          'smisHazardousWasteEnableStatus',
          'smisHazardousWasteCharacteristic',
          'smisHazardousWasteSafetyMeasure',
          'smisMaterialUnit'
        ].map((code) => userStore.ensureDictLoaded(code))
      )
  )
</script>
<style scoped lang="scss">
  .hazardous-catalog-page {
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-width: 0;
    min-height: 0;

    &__workspace {
      flex: 1;
      min-height: 0;
    }

    &__table {
      min-width: 0;
      min-height: 0;
    }

    :deep(.hazardous-catalog-page__identity) {
      display: grid;
      grid-template-columns: 36px minmax(0, 1fr);
      gap: 10px;
      align-items: center;
      min-width: 0;

      > svg {
        box-sizing: content-box;
        width: 20px;
        height: 20px;
        padding: 8px;
        color: var(--theme-color);
        background: color-mix(in srgb, var(--theme-color) 9%, var(--el-bg-color));
        border-radius: var(--el-border-radius-base);
      }

      span {
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
        font: 11px var(--art-font-family-mono, Consolas, monospace);
        color: var(--el-text-color-secondary);
      }
    }

    :deep(.hazardous-catalog-page__actions) {
      display: flex;
    }
  }
</style>
