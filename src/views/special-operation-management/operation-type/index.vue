<template>
  <ArtPermissionGuard permission="SmisSpecialOperationType:View" resource-name="作业类型">
    <div class="operation-type-page business-workspace-page art-full-height">
      <BusinessWorkspaceHeader
        eyebrow="SPECIAL OPERATION TYPE MASTER DATA"
        title="作业类型"
        description="统一维护租户适用的特殊作业类型、视觉标识和作业票专有字段，为不同作业场景提供可配置的数据基础。"
        icon="ri:tools-line"
        :tags="[
          { label: '租户自定义', type: 'primary', effect: 'plain' },
          { label: '专有字段可配', type: 'warning', effect: 'light' },
          { label: '作业票基础数据', type: 'success', effect: 'plain' }
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
        :search-bar-props="{ span: 8, labelWidth: 76, showExpand: false }"
        :table-props="{
          rowKey: 'id',
          tableLayout: 'fixed',
          emptyText: '暂无作业类型',
          emptyDescription: '可新增动火、高处、吊装、受限空间等租户适用的作业类型。'
        }"
        focusable
      />

      <OperationTypeDialog ref="dialogRef" @success="handleSaveSuccess" />
    </div>
  </ArtPermissionGuard>
</template>

<script setup lang="tsx">
  import dayjs from 'dayjs'
  import { ElTag } from 'element-plus'
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
    deleteSpecialOperationTypes,
    fetchSpecialOperationTypeList,
    voidSpecialOperationTypes,
    type SmisSpecialOperationType,
    type SmisSpecialOperationTypeOverview,
    type SmisSpecialOperationTypeSearchParams
  } from '@smis/api'
  import OperationTypeDialog, {
    type OperationTypeDialogOpenData
  } from './modules/operation-type-dialog.vue'

  defineOptions({ name: 'SmisSpecialOperationType' })

  type TableParams = SmisSpecialOperationTypeSearchParams &
    Pick<Api.Common.PaginationParams, 'current' | 'size'>

  interface DialogExpose {
    handleOpen: (data: OperationTypeDialogOpenData) => Promise<void>
  }

  interface TableGroup {
    searchQuery: SmisSpecialOperationTypeSearchParams
    searchItems: ComputedRef<SearchFormItem[]>
    headerActions: ComputedRef<ArtTableQueryHeaderAction[]>
  }

  const { confirm, confirmDelete } = useArtFeedback()
  const userStore = useUserStore()
  const tenantScopeStore = useTenantScopeStore()
  const { getDictMap, getUserInfo } = storeToRefs(userStore)
  const { effectiveTenantId, selectedTenant, revision, scopeLabel, isPlatformScope } =
    storeToRefs(tenantScopeStore)
  const tableQueryRef = ref<ArtTableQueryExpose>()
  const dialogRef = ref<DialogExpose>()
  const overview = reactive<SmisSpecialOperationTypeOverview>({
    total: 0,
    enabled: 0,
    disabled: 0,
    voided: 0,
    customFields: 0
  })

  const statusOptions = computed(() =>
    (getDictMap.value.smisSpecialOperationStatus ?? []).map((item) => ({
      label: item.label || item.name,
      value: item.value
    }))
  )
  const tagStyleOptions = computed(() =>
    (getDictMap.value.smisTagStyle ?? []).map((item) => ({
      label: item.label || item.name,
      value: item.value
    }))
  )
  const workspaceMetrics = computed<BusinessWorkspaceMetric[]>(() => [
    {
      label: '类型总数',
      value: overview.total,
      description: isPlatformScope.value ? `${scopeLabel.value}配置` : '当前租户配置',
      icon: 'ri:stack-line'
    },
    {
      label: '已启用',
      value: overview.enabled,
      description: '可用于新增作业票',
      icon: 'ri:checkbox-circle-line',
      tone: 'success'
    },
    {
      label: '专有字段',
      value: overview.customFields,
      description: '跨类型配置总数',
      icon: 'ri:input-field',
      tone: 'warning'
    },
    {
      label: '已作废',
      value: overview.voided,
      description: '仅保留历史口径',
      icon: 'ri:archive-line'
    }
  ])
  const exportColumns: ArtTableQueryExcelColumn[] = [
    { key: 'typeCode', title: '作业类型编号', required: true },
    { key: 'typeName', title: '作业类型', required: true },
    { key: 'remark', title: '备注' },
    { key: 'sort', title: '排序' },
    { key: 'textColor', title: '文字颜色' },
    { key: 'tagStyle', title: '标签样式' },
    { key: 'status', title: '状态' },
    { key: 'fieldCount', title: '专有字段数' },
    { key: 'createTime', title: '创建时间' },
    { key: 'createBy', title: '创建人' }
  ]

  const openDialog = (row?: SmisSpecialOperationType): void => {
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

  const groupIdsByTenant = (rows: SmisSpecialOperationType[]): Map<string, string[]> => {
    const result = new Map<string, string[]>()
    rows.forEach((row) => {
      const ids = result.get(row.tenantId) ?? []
      ids.push(row.id)
      result.set(row.tenantId, ids)
    })
    return result
  }

  const deleteRows = async (rows: SmisSpecialOperationType[]): Promise<void> => {
    await Promise.all(
      [...groupIdsByTenant(rows).entries()].map(([tenantId, ids]) =>
        deleteSpecialOperationTypes(ids, tenantId)
      )
    )
  }

  const voidRows = async (rows: SmisSpecialOperationType[]): Promise<void> => {
    await Promise.all(
      [...groupIdsByTenant(rows).entries()].map(([tenantId, ids]) =>
        voidSpecialOperationTypes(ids, tenantId)
      )
    )
  }

  const headerActions = computed<ArtTableQueryHeaderAction[]>(() => [
    {
      permission: 'SmisSpecialOperationType:Add',
      type: 'add',
      label: '新增作业类型',
      onClick: () => openDialog()
    },
    {
      permission: 'SmisSpecialOperationType:Export',
      type: 'export',
      exportFilename: '作业类型配置',
      exportSheetName: '作业类型',
      exportColumns,
      exportApi: async ({ selectedIds, searchParams, maxRows }) => {
        const response = await fetchSpecialOperationTypeList({
          ...(searchParams as SmisSpecialOperationTypeSearchParams),
          tenantId: effectiveTenantId.value,
          from: 0,
          to: Math.max((maxRows ?? 10000) - 1, 0)
        })
        const selected = new Set(selectedIds.map(String))
        return {
          data: response.data
            .filter((row) => !selected.size || selected.has(row.id))
            .map((row) => ({
              ...row,
              status:
                statusOptions.value.find((item) => item.value === row.status)?.label || row.status
            }))
        }
      }
    },
    {
      key: 'void',
      permission: 'SmisSpecialOperationType:Void',
      label: '作废',
      icon: 'ri:forbid-line',
      selectionRequired: true,
      confirm: true,
      confirmTitle: '作废确认',
      content: ({ selectedCount }: ArtTableQueryHeaderActionContext) =>
        `确定作废选中的 ${selectedCount} 个作业类型吗？其下配置项也将同步作废。`,
      disabled: ({ selectedRows }) =>
        selectedRows.every((row) => (row as SmisSpecialOperationType).status === 'voided'),
      onClick: async ({ selectedRows, api }) => {
        await voidRows(
          (selectedRows as SmisSpecialOperationType[]).filter((row) => row.status !== 'voided')
        )
        await api.refreshUpdate()
      }
    },
    {
      permission: 'SmisSpecialOperationType:Delete',
      type: 'delete',
      content: ({ selectedCount }: ArtTableQueryHeaderActionContext) =>
        `确定删除选中的 ${selectedCount} 个作业类型吗？存在检查项、危害因素或分析项的类型不会被删除。`,
      onClick: async ({ selectedRows, api }) => {
        await deleteRows(selectedRows as SmisSpecialOperationType[])
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
        props: { clearable: true, placeholder: '类型编号或名称' }
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
        props: { options: tagStyleOptions.value, clearable: true, placeholder: '全部样式' }
      }
    ]),
    headerActions
  })

  const renderTypePreview = (row: SmisSpecialOperationType) =>
    row.tagStyle ? (
      <ElTag type={row.tagStyle}>{row.typeName}</ElTag>
    ) : (
      <span
        class="operation-type-page__plain-preview"
        style={{ color: row.textColor || undefined }}
      >
        <i style={{ backgroundColor: row.textColor || 'var(--theme-color)' }} aria-hidden="true" />
        {row.typeName}
      </span>
    )

  const columnsFactory = (): ColumnOption<SmisSpecialOperationType>[] => [
    { type: 'selection', width: 48 },
    { type: 'globalIndex', label: '序号', width: 68 },
    {
      prop: 'typeName',
      label: '作业类型',
      minWidth: 236,
      fixed: 'left',
      formatter: (row) => (
        <div class="operation-type-page__identity">
          <span aria-hidden="true">
            <ArtSvgIcon icon="ri:tools-line" />
          </span>
          <div>
            <strong title={row.typeName}>{row.typeName}</strong>
            <small>{row.typeCode}</small>
          </div>
        </div>
      )
    },
    { prop: 'preview', label: '标签预览', minWidth: 180, formatter: renderTypePreview },
    { prop: 'remark', label: '备注', minWidth: 220, showOverflowTooltip: true },
    {
      prop: 'fieldCount',
      label: '专有字段',
      width: 106,
      align: 'center',
      formatter: (row) => (
        <span class="operation-type-page__field-count">
          <ArtSvgIcon icon="ri:input-field" /> {row.fieldCount}
        </span>
      )
    },
    { prop: 'sort', label: '排序', width: 76, align: 'center' },
    {
      prop: 'textColor',
      label: '文字颜色',
      width: 132,
      formatter: (row) =>
        row.textColor ? (
          <span class="operation-type-page__color-value">
            <i style={{ backgroundColor: row.textColor }} aria-hidden="true" />
            {row.textColor.toUpperCase()}
          </span>
        ) : (
          <span class="operation-type-page__unset">未设置</span>
        )
    },
    {
      prop: 'tagStyle',
      label: '标签样式',
      width: 108,
      align: 'center',
      formatter: (row) =>
        row.tagStyle ? (
          <ElTag type={row.tagStyle} effect="plain">
            {tagStyleOptions.value.find((item) => item.value === row.tagStyle)?.label}
          </ElTag>
        ) : (
          <span class="operation-type-page__unset">未设置</span>
        )
    },
    {
      prop: 'status',
      label: '状态',
      width: 96,
      align: 'center',
      formatter: (row) => (
        <ArtDictDisplay dictCode="smisSpecialOperationStatus" value={row.status} display="tag" />
      )
    },
    { prop: 'createBy', label: '创建人', width: 138, showOverflowTooltip: true },
    {
      prop: 'createTime',
      label: '创建时间',
      width: 164,
      formatter: (row) => dayjs(row.createTime).format('YYYY-MM-DD HH:mm')
    },
    ...(isPlatformScope.value
      ? [
          {
            prop: 'tenantName',
            label: '所属租户',
            minWidth: 180,
            showOverflowTooltip: true,
            formatter: (row: SmisSpecialOperationType) =>
              row.tenantName ? `${row.tenantName}（${row.tenantCode || '—'}）` : '—'
          }
        ]
      : []),
    {
      prop: 'operation',
      label: '操作',
      width: 154,
      fixed: 'right',
      formatter: (row) => (
        <div class="operation-type-page__actions">
          <ArtButtonTable
            type="edit"
            permission="SmisSpecialOperationType:Edit"
            label="编辑作业类型"
            disabled={row.status === 'voided'}
            onClick={() => openDialog(row)}
          />
          <ArtButtonTable
            type="edit"
            icon="ri:forbid-line"
            iconColor="var(--el-color-warning)"
            permission="SmisSpecialOperationType:Void"
            label="作废作业类型"
            disabled={row.status === 'voided'}
            onClick={() => void handleVoid(row)}
          />
          <ArtButtonTable
            type="delete"
            permission="SmisSpecialOperationType:Delete"
            label="删除作业类型"
            onClick={() => void handleDelete(row)}
          />
        </div>
      )
    }
  ]

  const fetchTableData = async (params: TableParams) => {
    const response = await fetchSpecialOperationTypeList({
      keyword: params.keyword,
      status: params.status,
      tagStyle: params.tagStyle,
      tenantId: effectiveTenantId.value,
      ...pageInfoHandler({ current: params.current, size: params.size })
    })
    Object.assign(overview, response.overview)
    return response
  }

  const handleSaveSuccess = (type: 'add' | 'edit'): void => {
    void (type === 'add'
      ? tableQueryRef.value?.refreshCreate()
      : tableQueryRef.value?.refreshUpdate())
  }

  const handleVoid = async (row: SmisSpecialOperationType): Promise<void> => {
    if (row.status === 'voided') return
    try {
      await confirm(`确定作废作业类型“${row.typeName}”吗？其下配置项也将同步作废。`, {
        title: '作废确认',
        confirmButtonText: '作废',
        confirmButtonType: 'warning'
      })
      await voidSpecialOperationTypes([row.id], row.tenantId)
      await tableQueryRef.value?.refreshUpdate()
    } catch {
      /* 用户取消 */
    }
  }

  const handleDelete = async (row: SmisSpecialOperationType): Promise<void> => {
    try {
      await confirmDelete(`确定删除作业类型“${row.typeName}”吗？存在下级配置时请改为作废。`)
      await deleteSpecialOperationTypes([row.id], row.tenantId)
      await tableQueryRef.value?.refreshRemove()
    } catch {
      /* 用户取消 */
    }
  }

  onMounted(async () => {
    await Promise.all([
      userStore.ensureDictLoaded('smisSpecialOperationStatus'),
      userStore.ensureDictLoaded('smisTagStyle'),
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
  .operation-type-page {
    gap: 12px;
    min-width: 0;

    :deep(.operation-type-page__identity) {
      display: grid;
      grid-template-columns: 36px minmax(0, 1fr);
      gap: 10px;
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

      > div,
      strong,
      small {
        display: block;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      small {
        margin-top: 2px;
        font-family: var(--art-font-family-mono, Consolas, monospace);
        font-size: 11px;
        color: var(--el-text-color-secondary);
      }
    }

    :deep(.operation-type-page__plain-preview),
    :deep(.operation-type-page__color-value),
    :deep(.operation-type-page__field-count) {
      display: inline-flex;
      gap: 8px;
      align-items: center;

      i {
        flex: 0 0 auto;
        width: 10px;
        height: 10px;
        border: 1px solid color-mix(in srgb, currentcolor 18%, transparent);
        border-radius: 50%;
      }
    }

    :deep(.operation-type-page__plain-preview) {
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    :deep(.operation-type-page__color-value) {
      font-family: var(--art-font-family-mono, Consolas, monospace);
      font-size: 12px;
      color: var(--el-text-color-regular);
    }

    :deep(.operation-type-page__field-count) {
      justify-content: center;
      min-width: 52px;
      padding: 4px 8px;
      color: var(--theme-color);
      background: color-mix(in srgb, var(--theme-color) 8%, var(--el-bg-color));
      border-radius: var(--el-border-radius-small);
    }

    :deep(.operation-type-page__unset) {
      font-size: 12px;
      color: var(--el-text-color-placeholder);
    }

    :deep(.operation-type-page__actions) {
      display: flex;
      align-items: center;
    }
  }
</style>
