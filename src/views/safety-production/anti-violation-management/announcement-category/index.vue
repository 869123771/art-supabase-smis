<template>
  <ArtPermissionGuard permission="SmisAnnouncementCategory:View" resource-name="公告分类">
    <div class="announcement-category-page business-workspace-page art-full-height">
      <BusinessWorkspaceHeader
        eyebrow="ANNOUNCEMENT CATEGORIES"
        title="公告分类"
        description="维护统一的公告主题分类，为发布、检索和查阅分析提供稳定口径。"
        icon="ri:folder-settings-line"
        :tags="[
          { label: '统一分类口径', type: 'primary', effect: 'plain' },
          { label: '停用保护历史公告', type: 'warning', effect: 'light' }
        ]"
        :metrics="workspaceMetrics"
        ><template #actions><BusinessTableWorkspaceActions :table="tableQueryRef" /></template
      ></BusinessWorkspaceHeader>
      <ArtTableQuery
        ref="tableQueryRef"
        v-model="searchQuery"
        class="announcement-category-page__table"
        :api-fn="fetchTableData"
        :search-items="searchItems"
        :columns-factory="columnsFactory"
        :header-actions="headerActions"
        header-actions-placement="workspace"
        :search-bar-props="{ span: 8, labelWidth: 82 }"
        :table-props="{
          rowKey: 'id',
          tableLayout: 'fixed',
          emptyText: '暂无公告分类',
          emptyDescription: '新增分类后即可在新建公告时选择。'
        }"
        focusable
      />
      <AnnouncementCategoryDialog ref="dialogRef" @success="handleSaveSuccess" />
    </div>
  </ArtPermissionGuard>
</template>

<script setup lang="tsx">
  import type { SearchFormItem } from '@/components/core/forms/art-search-bar/index.vue'
  import type {
    ArtTableQueryExcelColumn,
    ArtTableQueryExpose,
    ArtTableQueryHeaderAction,
    ArtTableQueryHeaderActionContext
  } from '@/components/core/tables/art-table-query/index.vue'
  import type { ColumnOption } from '@/types'
  import { pageInfoHandler } from '@/utils/table/tableUtils'
  import { useArtFeedback } from '@/hooks/core/useArtFeedback'
  import { useUserStore } from '@/store/modules/user'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import ArtPermissionGuard from '@/components/core/feedback/art-permission-guard/index.vue'
  import ArtDictDisplay from '@/components/core/base/art-dict-display/index.vue'
  import BusinessTableWorkspaceActions from '@/components/business/business-table-workspace-actions/index.vue'
  import BusinessWorkspaceHeader, {
    type BusinessWorkspaceMetric
  } from '@/components/business/business-workspace-header/index.vue'
  import {
    deleteAnnouncementCategories,
    fetchAnnouncementCategoryList,
    type SmisAnnouncementCategory,
    type SmisAnnouncementCategoryOverview,
    type SmisAnnouncementCategorySearchParams
  } from '@smis/api'
  import AnnouncementCategoryDialog, {
    type AnnouncementCategoryDialogOpenData
  } from './modules/announcement-category-dialog.vue'

  defineOptions({ name: 'SmisAnnouncementCategory' })
  type TableParams = SmisAnnouncementCategorySearchParams &
    Pick<Api.Common.PaginationParams, 'current' | 'size'>
  interface DialogExpose {
    handleOpen: (data: AnnouncementCategoryDialogOpenData) => Promise<void>
  }
  const { confirmDelete } = useArtFeedback()
  const userStore = useUserStore()
  const { getDictMap } = storeToRefs(userStore)
  const tableQueryRef = ref<ArtTableQueryExpose>()
  const dialogRef = ref<DialogExpose>()
  const searchQuery = reactive<SmisAnnouncementCategorySearchParams>({})
  const overview = reactive<SmisAnnouncementCategoryOverview>({
    total: 0,
    enabled: 0,
    disabled: 0,
    used: 0
  })
  const statusOptions = computed(() =>
    (getDictMap.value.smisAnnouncementCategoryStatus ?? []).map((item) => ({
      label: item.label || item.name,
      value: item.value
    }))
  )
  const workspaceMetrics = computed<BusinessWorkspaceMetric[]>(() => [
    {
      label: '分类总数',
      value: overview.total,
      description: '当前筛选范围',
      icon: 'ri:folder-3-line'
    },
    {
      label: '启用分类',
      value: overview.enabled,
      description: '新公告可选',
      icon: 'ri:checkbox-circle-line',
      tone: 'success'
    },
    {
      label: '停用分类',
      value: overview.disabled,
      description: '保留历史引用',
      icon: 'ri:forbid-line',
      tone: 'warning'
    },
    { label: '已使用', value: overview.used, description: '存在关联公告', icon: 'ri:links-line' }
  ])
  const searchItems = computed<SearchFormItem[]>(() => [
    {
      label: '分类名称',
      key: 'keyword',
      type: 'input',
      props: { clearable: true, placeholder: '搜索分类名称或说明' }
    },
    {
      label: '状态',
      key: 'status',
      type: 'select',
      options: statusOptions.value,
      props: { clearable: true, placeholder: '全部状态' }
    }
  ])
  const excelColumns: ArtTableQueryExcelColumn[] = [
    { key: 'categoryName', title: '公告分类名称' },
    { key: 'statusText', title: '状态' },
    { key: 'announcementCount', title: '公告数量' },
    { key: 'description', title: '分类说明' }
  ]
  const headerActions = computed<ArtTableQueryHeaderAction[]>(() => [
    {
      permission: 'SmisAnnouncementCategory:Add',
      type: 'add',
      label: '新增',
      onClick: () => void dialogRef.value?.handleOpen({})
    },
    {
      permission: 'SmisAnnouncementCategory:Edit',
      key: 'edit',
      label: '编辑',
      icon: 'ri:edit-line',
      selectionRequired: true,
      disabled: ({ selectedRows }) => selectedRows.length !== 1,
      onClick: ({ selectedRows }) =>
        void dialogRef.value?.handleOpen({ row: selectedRows[0] as SmisAnnouncementCategory })
    },
    {
      permission: 'SmisAnnouncementCategory:Delete',
      type: 'delete',
      content: ({ selectedCount }: ArtTableQueryHeaderActionContext) =>
        `确定删除选中的 ${selectedCount} 个公告分类吗？已被公告使用的分类不能删除。`,
      onClick: async ({ selectedRows, api }) => {
        await deleteAnnouncementCategories(selectedRows.map((row) => String(row.id)))
        await api.refreshRemove()
      }
    },
    {
      permission: 'SmisAnnouncementCategory:Export',
      type: 'export',
      label: '导出',
      exportFilename: '公告分类',
      exportSheetName: '公告分类',
      exportColumns: excelColumns,
      exportApi: async ({ maxRows }) => ({
        data: (
          await fetchAnnouncementCategoryList({
            ...searchQuery,
            purpose: 'export',
            from: 0,
            to: maxRows - 1
          })
        ).data.map((row) => ({ ...row, statusText: row.status === 'enabled' ? '启用' : '停用' }))
      })
    }
  ])
  const columnsFactory = (): ColumnOption<SmisAnnouncementCategory>[] => [
    { type: 'selection', width: 48 },
    {
      prop: 'categoryName',
      label: '公告分类名称',
      minWidth: 220,
      fixed: 'left',
      showOverflowTooltip: true
    },
    {
      prop: 'status',
      label: '状态',
      width: 100,
      align: 'center',
      formatter: (row) => (
        <ArtDictDisplay
          dictCode="smisAnnouncementCategoryStatus"
          value={row.status}
          display="tag"
        />
      )
    },
    { prop: 'announcementCount', label: '公告数量', width: 110, align: 'right' },
    { prop: 'description', label: '分类说明', minWidth: 280, showOverflowTooltip: true },
    {
      prop: 'operation',
      label: '操作',
      width: 124,
      fixed: 'right',
      formatter: (row) => (
        <div class="announcement-category-page__actions">
          <ArtButtonTable
            permission="SmisAnnouncementCategory:Edit"
            type="edit"
            onClick={() => void dialogRef.value?.handleOpen({ row })}
          />
          <ArtButtonTable
            permission="SmisAnnouncementCategory:Delete"
            type="delete"
            onClick={() => void handleDelete(row)}
          />
        </div>
      )
    }
  ]
  const fetchTableData = async (params: TableParams) => {
    const result = await fetchAnnouncementCategoryList({ ...params, ...pageInfoHandler(params) })
    Object.assign(overview, result.overview)
    return { records: result.data, total: result.total }
  }
  const handleDelete = async (row: SmisAnnouncementCategory): Promise<void> => {
    try {
      await confirmDelete(`确定删除公告分类“${row.categoryName}”吗？`)
      await deleteAnnouncementCategories([row.id])
      await tableQueryRef.value?.refreshRemove()
    } catch {
      /* 用户取消 */
    }
  }
  const handleSaveSuccess = (): void => void tableQueryRef.value?.getData()
  onMounted(() => void userStore.ensureDictLoaded('smisAnnouncementCategoryStatus'))
</script>

<style scoped lang="scss">
  .announcement-category-page {
    gap: 12px;
    min-width: 0;

    &__table {
      flex: 1 1 auto;
      min-width: 0;
      min-height: 0;
    }

    :deep(.announcement-category-page__actions) {
      display: flex;
      gap: 4px;
      align-items: center;
      justify-content: center;
    }
  }
</style>
