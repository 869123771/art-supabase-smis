<template>
  <div v-auth="'SmisCatalog:View'" class="smis-catalog-page art-full-height">
    <BusinessWorkspaceHeader
      :eyebrow="workspace.section"
      :title="workspace.title"
      :description="workspace.description"
      :icon="workspace.icon"
      :tags="[
        { label: '租户数据隔离', type: 'primary' },
        { label: '文档 V1.0', type: 'info' }
      ]"
      :metrics="workspaceMetrics"
    >
      <template #actions>
        <BusinessTableWorkspaceActions :table="tableQueryRef" />
      </template>
    </BusinessWorkspaceHeader>

    <ArtTableQuery
      ref="tableQueryRef"
      v-model="searchQuery"
      :search-items="searchItems"
      :api-fn="fetchTableData"
      :columns-factory="columnsFactory"
      :header-actions="headerActions"
      header-actions-placement="workspace"
      :search-bar-props="{ span: 6, labelWidth: 76 }"
      :table-props="{
        rowKey: 'id',
        tableLayout: 'fixed',
        emptyText: `暂无${workspace.recordNoun}`,
        emptyDescription: `可新增第一条${workspace.recordNoun}，或调整筛选条件后重新查询。`
      }"
      :on-success="handleTableSuccess"
      focusable
    />
    <SafetyCatalogRecordDialog ref="recordDialogRef" @success="handleSaveSuccess" />
  </div>
</template>

<script setup lang="tsx">
  import { ElTag } from 'element-plus'
  import type { SearchFormItem } from '@/components/core/forms/art-search-bar/index.vue'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import type {
    ArtTableQueryExpose,
    ArtTableQueryHeaderAction,
    ArtTableQueryProps
  } from '@/components/core/tables/art-table-query/index.vue'
  import BusinessTableWorkspaceActions from '@/components/business/business-table-workspace-actions/index.vue'
  import BusinessWorkspaceHeader, {
    type BusinessWorkspaceMetric
  } from '@/components/business/business-workspace-header/index.vue'
  import { useArtFeedback } from '@/hooks/core/useArtFeedback'
  import type { ColumnOption } from '@/types'
  import { pageInfoHandler } from '@/utils/table/tableUtils'
  import { formatWithDayjs } from '@/utils/time'
  import {
    deleteSafetyCatalogRecord,
    fetchSafetyCatalogRecords,
    type SafetyCatalogRecord,
    type SafetyCatalogSearchParams
  } from '@smis/api'
  import {
    getSafetyModuleDefinition,
    type SafetyFieldDefinition
  } from '@smis/domain/safety-module-catalog'
  import SafetyCatalogRecordDialog from './modules/safety-catalog-record-dialog.vue'

  defineOptions({ name: 'SmisCatalogWorkspace' })

  interface RecordDialogExpose {
    handleOpen: (data: {
      workspace: ReturnType<typeof getSafetyModuleDefinition>
      record?: SafetyCatalogRecord
    }) => Promise<void>
  }

  type TableParams = SafetyCatalogSearchParams &
    Pick<Api.Common.PaginationParams, 'current' | 'size'>

  const route = useRoute()
  const { confirmAction } = useArtFeedback()
  const tableQueryRef = ref<ArtTableQueryExpose>()
  const recordDialogRef = ref<RecordDialogExpose>()
  const overview = reactive({ total: 0, rows: [] as SafetyCatalogRecord[] })

  const catalogCode = computed(() => {
    const metaCode = route.meta.catalogCode
    if (typeof metaCode === 'string' && metaCode) return metaCode
    return route.path.split('/').filter(Boolean).at(-1)
  })
  const workspace = computed(() => getSafetyModuleDefinition(catalogCode.value))

  const searchQuery = reactive<SafetyCatalogSearchParams>({
    moduleCode: workspace.value.code,
    keyword: '',
    status: ''
  })

  const searchItems = computed<SearchFormItem[]>(() => [
    {
      label: '关键词',
      key: 'keyword',
      type: 'input',
      props: { placeholder: `编号、名称或负责人` }
    },
    {
      label: '状态',
      key: 'status',
      type: 'select',
      props: {
        options: [
          { label: '草稿', value: 'draft' },
          { label: '待审核', value: 'pending' },
          { label: '有效', value: 'active' },
          { label: '已完成', value: 'completed' },
          { label: '已停用', value: 'disabled' }
        ]
      }
    }
  ])

  const workspaceMetrics = computed<BusinessWorkspaceMetric[]>(() => [
    {
      label: `${workspace.value.recordNoun}总数`,
      value: overview.total,
      description: '当前筛选条件下的数据量',
      icon: 'ri:file-list-3-line'
    },
    {
      label: '本页有效',
      value: overview.rows.filter((row) => ['active', 'completed'].includes(row.status)).length,
      description: '已生效或已完成记录',
      icon: 'ri:checkbox-circle-line',
      tone: 'success'
    },
    {
      label: '本页待处理',
      value: overview.rows.filter((row) => ['draft', 'pending'].includes(row.status)).length,
      description: '草稿及待审核记录',
      icon: 'ri:time-line',
      tone: 'warning'
    }
  ])

  const headerActions = computed<ArtTableQueryHeaderAction[]>(() => [
    {
      type: 'add',
      label: `新增${workspace.value.recordNoun}`,
      permission: 'SmisCatalog:Add',
      onClick: () => void openDialog()
    }
  ])

  const statusLabel = (status: string): string =>
    ({
      draft: '草稿',
      pending: '待审核',
      active: '有效',
      completed: '已完成',
      disabled: '已停用'
    })[status] ??
    status ??
    '--'

  const statusTagType = (status: string) => {
    if (['active', 'completed'].includes(status)) return 'success'
    if (status === 'pending') return 'warning'
    if (status === 'disabled') return 'info'
    return 'primary'
  }

  const fieldValue = (row: SafetyCatalogRecord, field: SafetyFieldDefinition): unknown => {
    const value = row.payload?.[field.key]
    if (field.type !== 'select') return value ?? '--'
    return field.options?.find((option) => option.value === value)?.label ?? value ?? '--'
  }

  const columnsFactory = (): ColumnOption<SafetyCatalogRecord>[] => [
    { type: 'globalIndex', label: '序号', width: 64 },
    { prop: 'recordNo', label: '业务编号', minWidth: 138 },
    { prop: 'title', label: workspace.value.title, minWidth: 190 },
    ...workspace.value.fields
      .filter((field) => field.table)
      .filter((field) => !['recordNo', 'name', 'status'].includes(field.key))
      .slice(0, 3)
      .map<ColumnOption<SafetyCatalogRecord>>((field) => ({
        prop: `payload.${field.key}`,
        label: field.label,
        minWidth: field.type === 'datetime' ? 168 : 128,
        formatter: (row) => String(fieldValue(row, field))
      })),
    {
      prop: 'status',
      label: '状态',
      width: 96,
      formatter: (row) => <ElTag type={statusTagType(row.status)}>{statusLabel(row.status)}</ElTag>
    },
    {
      prop: 'updateTime',
      label: '更新时间',
      minWidth: 168,
      formatter: (row) => formatWithDayjs(row.updateTime)
    },
    {
      prop: 'operation',
      label: '操作',
      width: 124,
      fixed: 'right',
      formatter: (row) => (
        <div class="flex">
          <ArtButtonTable
            type="edit"
            permission="SmisCatalog:Edit"
            onClick={() => void openDialog(row)}
          />
          <ArtButtonTable
            type="delete"
            permission="SmisCatalog:Delete"
            onClick={() => void handleDelete(row)}
          />
        </div>
      )
    }
  ]

  const fetchTableData = (params: TableParams) => {
    const { from, to } = pageInfoHandler({ current: params.current, size: params.size })
    return fetchSafetyCatalogRecords({
      moduleCode: workspace.value.code,
      keyword: params.keyword,
      status: params.status,
      from,
      to
    })
  }

  const handleTableSuccess: NonNullable<ArtTableQueryProps['onSuccess']> = (rows, response) => {
    overview.rows = rows as SafetyCatalogRecord[]
    overview.total = response.total ?? rows.length
  }

  const openDialog = (record?: SafetyCatalogRecord): Promise<void> =>
    recordDialogRef.value?.handleOpen({ workspace: workspace.value, record }) ?? Promise.resolve()

  const handleSaveSuccess = async (type: 'add' | 'edit'): Promise<void> => {
    if (type === 'edit') await tableQueryRef.value?.refreshUpdate()
    else await tableQueryRef.value?.refreshCreate()
  }

  const handleDelete = async (row: SafetyCatalogRecord): Promise<void> => {
    if (!row.id) return
    try {
      await confirmAction(`确定删除“${row.title}”吗？`, '删除确认', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      })
      await deleteSafetyCatalogRecord(row.id)
      await tableQueryRef.value?.refreshRemove()
    } catch {
      // 用户取消删除时无需提示。
    }
  }

  watch(
    () => workspace.value.code,
    (code) => {
      searchQuery.moduleCode = code
      searchQuery.keyword = ''
      searchQuery.status = ''
      overview.total = 0
      overview.rows = []
      void tableQueryRef.value?.refreshData()
    }
  )
</script>

<style scoped lang="scss">
  .smis-catalog-page {
    gap: 12px;
    min-width: 0;
  }
</style>
