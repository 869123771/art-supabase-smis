<template>
  <ArtPermissionGuard permission="SmisDualControlSafetyInspection:View">
    <div class="safety-inspection-page business-workspace-page art-full-height">
      <BusinessWorkspaceHeader
        class="safety-inspection-page__overview"
        eyebrow="SAFETY INSPECTION LEDGER"
        title="安全检查"
        description="按排查类型与组织快速定位检查记录，集中完成台账维护、证据留痕和整改指令输出。"
        icon="ri:shield-check-line"
        density="compact"
        :tags="workspaceTags"
        :metrics="workspaceMetrics"
      >
        <template #actions><BusinessTableWorkspaceActions :table="tableQueryRef" /></template>
      </BusinessWorkspaceHeader>

      <div class="safety-inspection-page__workspace">
        <ArtWorkspaceSplitter
          primary-size="252px"
          primary-min="228px"
          primary-max="320px"
          :breakpoint="980"
          narrow-mode="stack"
          stacked-primary-size="320px"
          stacked-secondary-min-size="760px"
        >
          <template #primary>
            <SafetyInspectionNavigator
              v-model="navigation.value"
              :inspection-types="options.inspectionTypes"
              :organizations="options.organizations"
              :loading="options.loading"
              :error="options.error"
              @change="handleNavigationChange"
              @refresh="loadOptions"
            />
          </template>

          <ArtTableQuery
            ref="tableQueryRef"
            v-model="table.searchQuery"
            class="safety-inspection-page__table"
            :search-items="searchItems"
            :api-fn="fetchTableData"
            :columns-factory="columnsFactory"
            :header-actions="headerActions"
            header-actions-placement="workspace"
            :search-bar-props="{
              span: 6,
              labelWidth: 92,
              showExpand: true,
              defaultExpanded: true
            }"
            :table-props="{
              rowKey: 'id',
              tableLayout: 'fixed',
              emptyText: '暂无安全检查记录',
              emptyDescription: '调整查询条件，或新增一条安全检查记录。',
              showOverflowTooltip: true
            }"
            :on-success="handleTableSuccess"
            focusable
            focus-scope-selector=".safety-inspection-page__workspace"
          />
        </ArtWorkspaceSplitter>
      </div>

      <SafetyInspectionDialog ref="dialogRef" @success="handleDialogSuccess" />
    </div>
  </ArtPermissionGuard>
</template>

<script setup lang="tsx">
  import dayjs from 'dayjs'
  import { ElMessage, ElTag } from 'element-plus'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import ArtAttachmentLink from '@/components/core/media/art-file-viewer/attachment-link.vue'
  import ArtWorkspaceSplitter from '@/components/core/layouts/art-workspace-splitter/index.vue'
  import BusinessTableWorkspaceActions from '@/components/business/business-table-workspace-actions/index.vue'
  import BusinessWorkspaceHeader, {
    type BusinessWorkspaceMetric,
    type BusinessWorkspaceTag
  } from '@/components/business/business-workspace-header/index.vue'
  import type { SearchFormItem } from '@/components/core/forms/art-search-bar/index.vue'
  import type {
    ArtTableQueryExpose,
    ArtTableQueryHeaderAction,
    ArtTableQueryHeaderActionContext,
    ArtTableQueryProps
  } from '@/components/core/tables/art-table-query/index.vue'
  import type { ColumnOption } from '@/types'
  import { pageInfoHandler } from '@/utils/table/tableUtils'
  import {
    copySafetyInspection,
    deleteSafetyInspections,
    fetchSafetyInspectionList,
    fetchSafetyInspectionOptions,
    type SmisSafetyInspectionOrganization,
    type SmisSafetyInspectionOverview,
    type SmisSafetyInspectionRecord,
    type SmisSafetyInspectionSearchParams,
    type SmisSafetyInspectionTypeOption
  } from '@smis/api'
  import { toDualControlOrganizationTree } from '@smis/views/dual-control-system/shared/organization-tree'
  import SafetyInspectionNavigator from './modules/safety-inspection-navigator.vue'
  import SafetyInspectionDialog, {
    type SafetyInspectionDialogOpenData
  } from './modules/safety-inspection-dialog.vue'
  import { buildRectificationNoticeHtml } from './modules/safety-inspection-document'

  defineOptions({ name: 'SmisDualControlSafetyInspection' })

  type TableSearchModel = SmisSafetyInspectionSearchParams & { inspectionRange?: string[] }
  type TableParams = TableSearchModel & Pick<Api.Common.PaginationParams, 'current' | 'size'>
  interface DialogExpose {
    handleOpen: (data: SafetyInspectionDialogOpenData) => Promise<void>
  }

  const tableQueryRef = ref<ArtTableQueryExpose>()
  const dialogRef = ref<DialogExpose>()
  const navigation = reactive({ value: '' })
  const options = reactive({
    inspectionTypes: [] as SmisSafetyInspectionTypeOption[],
    organizations: [] as SmisSafetyInspectionOrganization[],
    loading: false,
    error: null as string | null
  })
  const table = reactive({
    searchQuery: {
      inspectionName: '',
      inspectionRange: [],
      inspectedOrganizationId: '',
      inspectorKeyword: ''
    } as TableSearchModel,
    overview: {
      total: 0,
      thisMonth: 0,
      organizationCount: 0,
      inspectorCount: 0
    } as SmisSafetyInspectionOverview
  })

  const workspaceTags: BusinessWorkspaceTag[] = [
    { label: '类型联动', type: 'primary', effect: 'plain' },
    { label: '组织导航', type: 'success', effect: 'light' }
  ]
  const workspaceMetrics = computed<BusinessWorkspaceMetric[]>(() => [
    {
      label: '检查记录',
      value: table.overview.total,
      description: '当前查询范围',
      icon: 'ri:file-list-3-line'
    },
    {
      label: '本月检查',
      value: table.overview.thisMonth,
      description: '按检查时间统计',
      icon: 'ri:calendar-check-line',
      tone: 'success'
    },
    {
      label: '覆盖单位',
      value: table.overview.organizationCount,
      description: '去重被检查组织',
      icon: 'ri:building-4-line',
      tone: 'info'
    },
    {
      label: '参与检查人',
      value: table.overview.inspectorCount,
      description: '当前范围去重人数',
      icon: 'ri:team-line',
      tone: 'warning'
    }
  ])
  const searchItems = computed<SearchFormItem[]>(() => [
    {
      label: '检查名称',
      key: 'inspectionName',
      type: 'input',
      props: { clearable: true, placeholder: '输入检查名称' }
    },
    {
      label: '检查时间',
      key: 'inspectionRange',
      type: 'daterange',
      props: {
        valueFormat: 'YYYY-MM-DD',
        rangeSeparator: '至',
        startPlaceholder: '开始日期',
        endPlaceholder: '结束日期',
        clearable: true
      }
    },
    {
      label: '被检查单位',
      key: 'inspectedOrganizationId',
      type: 'treeSelect',
      props: {
        data: options.organizations,
        props: { label: 'organizationName', value: 'id', children: 'children' },
        nodeKey: 'id',
        valueKey: 'id',
        checkStrictly: true,
        defaultExpandAll: true,
        filterable: true,
        clearable: true,
        placeholder: '全部单位'
      }
    },
    {
      label: '检查人',
      key: 'inspectorKeyword',
      type: 'input',
      props: { clearable: true, placeholder: '姓名或工号' }
    }
  ])

  const filenameFromUrl = (url: string): string => {
    const rawName = url.split('/').pop() || '检查计划附件'
    try {
      return decodeURIComponent(rawName)
    } catch {
      return rawName
    }
  }
  const columnsFactory = (): ColumnOption<SmisSafetyInspectionRecord>[] => [
    { type: 'selection', width: 48, reserveSelection: true },
    { type: 'globalIndex', label: '序号', width: 68 },
    {
      prop: 'inspectionTypeName',
      label: '检查类别',
      width: 132,
      formatter: (row) => <ElTag effect="plain">{row.inspectionTypeName}</ElTag>
    },
    {
      prop: 'inspectionName',
      label: '检查名称',
      minWidth: 210,
      showOverflowTooltip: true
    },
    {
      prop: 'inspectionOrganizationName',
      label: '检查单位',
      minWidth: 170,
      showOverflowTooltip: true
    },
    {
      prop: 'inspectionTime',
      label: '检查时间',
      width: 166,
      formatter: (row) => dayjs(row.inspectionTime).format('YYYY-MM-DD HH:mm')
    },
    {
      prop: 'planAttachmentUrls',
      label: '检查计划附件',
      minWidth: 180,
      formatter: (row) => {
        const url = row.planAttachmentUrls[0]
        return url ? (
          <div class="safety-inspection-page__attachment">
            <ArtAttachmentLink file={{ url, name: filenameFromUrl(url) }} />
            {row.planAttachmentUrls.length > 1 ? (
              <span>+{row.planAttachmentUrls.length - 1}</span>
            ) : null}
          </div>
        ) : (
          <span class="safety-inspection-page__muted">未上传</span>
        )
      }
    },
    {
      prop: 'inspectorNames',
      label: '检查人',
      minWidth: 160,
      showOverflowTooltip: true
    },
    {
      prop: 'inspectedOrganizationName',
      label: '被检查单位',
      minWidth: 180,
      showOverflowTooltip: true
    },
    { prop: 'createBy', label: '创建人', minWidth: 126, showOverflowTooltip: true },
    {
      prop: 'createTime',
      label: '创建时间',
      width: 166,
      formatter: (row) => dayjs(row.createTime).format('YYYY-MM-DD HH:mm')
    },
    {
      prop: 'operation',
      label: '操作',
      width: 82,
      fixed: 'right',
      formatter: (row) => (
        <ArtButtonTable
          type="edit"
          permission="SmisDualControlSafetyInspection:Edit"
          label="编辑安全检查"
          onClick={() => openDialog(row)}
        />
      )
    }
  ]

  const exportColumns = [
    { key: 'inspectionTypeName', title: '检查类别', required: true },
    { key: 'inspectionName', title: '检查名称', required: true },
    { key: 'inspectionOrganizationName', title: '检查单位' },
    { key: 'inspectionTime', title: '检查时间' },
    { key: 'planAttachmentUrls', title: '检查计划附件' },
    { key: 'inspectorNames', title: '检查人' },
    { key: 'inspectedOrganizationName', title: '被检查单位' },
    { key: 'createBy', title: '创建人' },
    { key: 'createTime', title: '创建时间' }
  ]
  const requireSingleRow = (
    context: ArtTableQueryHeaderActionContext
  ): SmisSafetyInspectionRecord | null => {
    if (context.selectedRows.length !== 1) {
      ElMessage.warning('请选择一条安全检查记录')
      return null
    }
    return context.selectedRows[0] as SmisSafetyInspectionRecord
  }
  const headerActions = computed<ArtTableQueryHeaderAction[]>(() => [
    {
      type: 'add',
      label: '新增安全检查',
      permission: 'SmisDualControlSafetyInspection:Add',
      onClick: () => openDialog()
    },
    {
      key: 'copy',
      label: '复制',
      icon: 'ri:file-copy-2-line',
      permission: 'SmisDualControlSafetyInspection:Copy',
      selectionRequired: true,
      onClick: async (context) => {
        const row = requireSingleRow(context)
        if (!row) return
        await copySafetyInspection(row.id)
        await context.api.refreshCreate()
      }
    },
    {
      key: 'notice',
      label: '安全检查整改指令书',
      icon: 'ri:file-warning-line',
      permission: 'SmisDualControlSafetyInspection:RectificationNotice',
      selectionRequired: true,
      onClick: (context) => {
        const row = requireSingleRow(context)
        if (row) printRectificationNotice(row)
      }
    },
    {
      type: 'export',
      label: '导出',
      permission: 'SmisDualControlSafetyInspection:Export',
      exportFilename: '安全检查记录',
      exportSheetName: '安全检查',
      exportColumns,
      exportApi: async ({ selectedIds, searchParams, maxRows }) => {
        const params = normalizeSearchParams(searchParams as TableSearchModel)
        const result = await fetchSafetyInspectionList({
          ...params,
          ids: selectedIds.map(String),
          from: 0,
          to: Math.max((maxRows ?? 10000) - 1, 0)
        })
        return { data: result.data }
      }
    },
    {
      type: 'delete',
      label: '删除',
      permission: 'SmisDualControlSafetyInspection:Delete',
      content: ({ selectedCount }: ArtTableQueryHeaderActionContext) =>
        `确定删除选中的 ${selectedCount} 条安全检查记录吗？删除后无法恢复。`,
      onClick: async ({ selectedRows, api }) => {
        await deleteSafetyInspections(selectedRows.map((row) => String(row.id)))
        await api.refreshRemove()
      }
    }
  ])

  const normalizeSearchParams = (params: TableSearchModel): SmisSafetyInspectionSearchParams => {
    const range = Array.isArray(params.inspectionRange) ? params.inspectionRange : []
    const inspectionTypeId = navigation.value.startsWith('type:')
      ? navigation.value.slice('type:'.length)
      : undefined
    const navigationOrganizationId = navigation.value.startsWith('organization:')
      ? navigation.value.slice('organization:'.length)
      : undefined
    return {
      inspectionName: params.inspectionName,
      inspectionFrom: range[0] ? dayjs(range[0]).startOf('day').toISOString() : undefined,
      inspectionTo: range[1] ? dayjs(range[1]).endOf('day').toISOString() : undefined,
      inspectedOrganizationId: navigationOrganizationId || params.inspectedOrganizationId,
      inspectionTypeId,
      inspectorKeyword: params.inspectorKeyword
    }
  }
  const fetchTableData = (params: TableParams) => {
    const { from, to } = pageInfoHandler({ current: params.current, size: params.size })
    return fetchSafetyInspectionList({ ...normalizeSearchParams(params), from, to })
  }
  const handleTableSuccess: NonNullable<ArtTableQueryProps['onSuccess']> = (_records, response) => {
    const result = response as typeof response & { overview?: SmisSafetyInspectionOverview }
    Object.assign(table.overview, result.overview ?? { total: response.total ?? 0 })
  }
  const handleNavigationChange = (): void => {
    if (navigation.value.startsWith('organization:')) {
      table.searchQuery.inspectedOrganizationId = ''
    }
    void tableQueryRef.value?.refreshContext()
  }
  const loadOptions = async (): Promise<void> => {
    options.loading = true
    options.error = null
    try {
      const result = await fetchSafetyInspectionOptions()
      options.inspectionTypes = result.inspectionTypes
      options.organizations = toDualControlOrganizationTree(result.organizations)
    } catch {
      options.error = '检查导航加载失败，请稍后重试'
    } finally {
      options.loading = false
    }
  }
  const openDialog = (row?: SmisSafetyInspectionRecord): void => {
    if (!options.inspectionTypes.length || !options.organizations.length) {
      ElMessage.warning('请先维护并启用排查类型和系统组织')
      return
    }
    void dialogRef.value?.handleOpen({
      row,
      inspectionTypes: options.inspectionTypes,
      organizations: options.organizations,
      presetInspectionTypeId: navigation.value.startsWith('type:')
        ? navigation.value.slice('type:'.length)
        : undefined,
      presetInspectedOrganizationId: navigation.value.startsWith('organization:')
        ? navigation.value.slice('organization:'.length)
        : undefined
    })
  }
  const handleDialogSuccess = (type: 'add' | 'edit'): void =>
    void (type === 'add'
      ? tableQueryRef.value?.refreshCreate()
      : tableQueryRef.value?.refreshUpdate())
  const printRectificationNotice = (row: SmisSafetyInspectionRecord): void => {
    const popup = window.open('', '_blank', 'noopener,noreferrer,width=980,height=820')
    if (!popup) {
      ElMessage.warning('浏览器阻止了打印窗口，请允许本站打开弹出式窗口')
      return
    }
    popup.document.write(buildRectificationNoticeHtml(row))
    popup.document.close()
  }

  onMounted(loadOptions)
</script>

<style scoped lang="scss">
  .safety-inspection-page {
    gap: var(--art-space-3);
    min-width: 0;

    &__overview,
    &__workspace,
    &__table {
      min-width: 0;
      min-height: 0;
    }

    &__overview {
      overflow: hidden;
    }

    &__workspace {
      flex: 1 1 auto;
      width: 100%;
    }

    &__table {
      height: 100%;
    }

    :deep(.safety-inspection-page__attachment) {
      display: flex;
      gap: var(--art-space-2);
      align-items: center;
      min-width: 0;

      .art-attachment-link {
        min-width: 0;
      }

      > span {
        flex: none;
        font-size: var(--art-font-size-caption);
        color: var(--theme-color);
      }
    }

    :deep(.safety-inspection-page__muted) {
      color: var(--el-text-color-secondary);
    }

    @media (width <= 980px) {
      &__workspace {
        flex: 0 0 auto;
        min-height: 1140px;
      }
    }
  }
</style>
