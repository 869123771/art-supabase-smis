<template>
  <ArtPermissionGuard :permission="permissions.view" :resource-name="businessName">
    <div class="hazardous-document-page business-workspace-page art-full-height">
      <BusinessWorkspaceHeader
        :eyebrow="direction === 'inbound' ? 'HAZARDOUS WASTE RECEIPT' : 'HAZARDOUS WASTE DISPATCH'"
        :title="businessName"
        :description="
          direction === 'inbound'
            ? '登记危废入库仓库、经办人和批次明细；单据按月自动编号，审核通过后形成可用库存。'
            : '登记危废出库仓库、经办人和转移信息；审核时校验可用库存，避免超量出库。'
        "
        :icon="direction === 'inbound' ? 'ri:inbox-archive-line' : 'ri:send-plane-line'"
        :tags="[
          { label: '3 位月度流水', type: 'primary', effect: 'plain' },
          { label: '审核后计入库存', type: 'success', effect: 'light' },
          { label: '全程可追溯', type: 'info', effect: 'plain' }
        ]"
        :metrics="metrics"
        ><template #actions><BusinessTableWorkspaceActions :table="tableQueryRef" /></template
      ></BusinessWorkspaceHeader>
      <ArtTableQuery
        ref="tableQueryRef"
        v-model="searchQuery"
        class="hazardous-document-page__table"
        :api-fn="fetchData"
        :search-items="searchItems"
        :columns-factory="columnsFactory"
        :header-actions="headerActions"
        header-actions-placement="workspace"
        :search-bar-props="{ span: 6, labelWidth: 78 }"
        :table-props="{
          rowKey: 'id',
          tableLayout: 'fixed',
          emptyText: `暂无${businessName}单据`,
          emptyDescription: '可点击新增建立草稿，核对无误后提交审核。'
        }"
        focusable
      />
      <DocumentDialog ref="dialogRef" :direction="direction" @success="refresh" />
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
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import ArtButtonMore from '@/components/core/forms/art-button-more/index.vue'
  import type { ButtonMoreItem } from '@/components/core/forms/art-button-more/index.vue'
  import ArtDictDisplay from '@/components/core/base/art-dict-display/index.vue'
  import ArtPermissionGuard from '@/components/core/feedback/art-permission-guard/index.vue'
  import BusinessTableWorkspaceActions from '@/components/business/business-table-workspace-actions/index.vue'
  import BusinessWorkspaceHeader, {
    type BusinessWorkspaceMetric
  } from '@/components/business/business-workspace-header/index.vue'
  import {
    deleteHazardousWasteDocuments,
    fetchHazardousWasteDocumentList,
    fetchHazardousWasteWarehouseList,
    transitionHazardousWasteDocument,
    type SmisHazardousWasteDocument,
    type SmisHazardousWasteDocumentDirection,
    type SmisHazardousWasteDocumentOverview,
    type SmisHazardousWasteDocumentSearchParams,
    type SmisHazardousWasteWarehouse
  } from '@smis/api'
  import DocumentDialog, { type DocumentDialogOpenData } from './document-dialog.vue'
  interface DocumentPermissions {
    view: string
    add: string
    edit: string
    delete: string
    export: string
    submit: string
    review: string
  }

  const props = defineProps<{
    direction: SmisHazardousWasteDocumentDirection
    permissions: DocumentPermissions
  }>()
  const direction = toRef(props, 'direction')
  const permissions = toRef(props, 'permissions')
  const businessName = computed(() => (direction.value === 'inbound' ? '危废入库' : '危废出库'))
  type TableParams = SmisHazardousWasteDocumentSearchParams &
    Pick<Api.Common.PaginationParams, 'current' | 'size'>
  interface DialogExpose {
    handleOpen: (data: DocumentDialogOpenData) => Promise<void>
  }
  const { confirmAction, confirmDelete, promptReason } = useArtFeedback()
  const userStore = useUserStore()
  const { getDictMap } = storeToRefs(userStore)
  const tableQueryRef = ref<ArtTableQueryExpose>()
  const dialogRef = ref<DialogExpose>()
  const searchQuery = reactive<SmisHazardousWasteDocumentSearchParams>({})
  const warehouses = ref<SmisHazardousWasteWarehouse[]>([])
  const overview = reactive<SmisHazardousWasteDocumentOverview>({
    total: 0,
    draft: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    quantity: 0
  })
  const statusOptions = computed(() =>
    (getDictMap.value.smisHazardousWasteDocumentStatus ?? []).map((item) => ({
      label: item.label || item.name,
      value: item.value
    }))
  )
  const warehouseOptions = computed(() =>
    warehouses.value.map((item) => ({
      label: `${item.warehouseName} · ${item.warehouseCode}`,
      value: item.id
    }))
  )
  const metrics = computed<BusinessWorkspaceMetric[]>(() => [
    {
      label: '单据总数',
      value: overview.total,
      description: '当前查询范围',
      icon: 'ri:file-list-3-line'
    },
    {
      label: '待审核',
      value: overview.pending,
      description: '等待业务审核',
      icon: 'ri:time-line',
      tone: 'warning'
    },
    {
      label: '已通过',
      value: overview.approved,
      description: '已计入仓库库存',
      icon: 'ri:checkbox-circle-line',
      tone: 'success'
    },
    {
      label: '明细总量',
      value: overview.quantity,
      description: '按危废明细汇总',
      icon: 'ri:scales-3-line'
    }
  ])
  const searchItems = computed<SearchFormItem[]>(() => [
    {
      label: '单据编码',
      key: 'documentNo',
      type: 'input',
      props: { clearable: true, placeholder: '请输入单据编码' }
    },
    {
      label: direction.value === 'inbound' ? '入库时间' : '出库时间',
      key: 'dateRange',
      type: 'daterange',
      props: { valueFormat: 'YYYY-MM-DD', startPlaceholder: '开始日期', endPlaceholder: '结束日期' }
    },
    {
      label: '仓库',
      key: 'warehouseId',
      type: 'select',
      props: {
        options: warehouseOptions.value,
        filterable: true,
        clearable: true,
        placeholder: '全部仓库'
      }
    },
    {
      label: '经办人',
      key: 'handlerKeyword',
      type: 'input',
      props: { clearable: true, placeholder: '姓名或工号' }
    },
    {
      label: '单据状态',
      key: 'status',
      type: 'select',
      props: { options: statusOptions.value, clearable: true, placeholder: '全部状态' }
    }
  ])
  const editable = (row: SmisHazardousWasteDocument) => ['draft', 'rejected'].includes(row.status)
  const open = (row?: SmisHazardousWasteDocument) => void dialogRef.value?.handleOpen({ row })
  const refresh = async () => {
    await tableQueryRef.value?.getData()
  }
  const unitLabel = (value: string) =>
    getDictMap.value.smisMaterialUnit?.find((item) => item.value === value)?.label || value
  const exportColumns = [
    { key: 'documentNo', title: '单据编码' },
    { key: 'operationDate', title: direction.value === 'inbound' ? '入库日期' : '出库日期' },
    { key: 'warehouseName', title: '仓库' },
    { key: 'handlerEmployeeName', title: '经办人' },
    { key: 'itemSummary', title: '危废明细' },
    { key: 'statusLabel', title: '单据状态' },
    { key: 'description', title: '说明' }
  ]
  const headerActions = computed<ArtTableQueryHeaderAction[]>(() => [
    { permission: permissions.value.add, type: 'add', label: '新增', onClick: () => open() },
    {
      permission: permissions.value.edit,
      key: 'edit',
      label: '编辑',
      icon: 'ri:edit-line',
      selectionRequired: true,
      disabled: ({ selectedRows }) =>
        selectedRows.length !== 1 || !editable(selectedRows[0] as SmisHazardousWasteDocument),
      onClick: ({ selectedRows }) => open(selectedRows[0] as SmisHazardousWasteDocument)
    },
    {
      permission: permissions.value.delete,
      type: 'delete',
      disabled: ({ selectedRows }) =>
        selectedRows.some((row) => !editable(row as SmisHazardousWasteDocument)),
      content: ({ selectedCount }: ArtTableQueryHeaderActionContext) =>
        `确定删除选中的 ${selectedCount} 张草稿或退回单据吗？`,
      onClick: async ({ selectedRows, api }) => {
        await deleteHazardousWasteDocuments(
          direction.value,
          selectedRows.map((row) => String(row.id))
        )
        await api.refreshRemove()
      }
    },
    {
      permission: permissions.value.export,
      type: 'export',
      exportFilename: businessName.value,
      exportSheetName: businessName.value,
      exportColumns,
      exportApi: async ({ searchParams, maxRows }) => {
        const result = await fetchHazardousWasteDocumentList(direction.value, {
          ...(searchParams as SmisHazardousWasteDocumentSearchParams),
          purpose: 'export',
          to: Math.max((maxRows ?? 10000) - 1, 0)
        })
        return {
          data: result.data.map((row) => ({
            ...row,
            itemSummary: row.items
              .map((item) => `${item.wasteName} × ${item.quantity}${unitLabel(item.unit)}`)
              .join('；'),
            statusLabel:
              statusOptions.value.find((item) => item.value === row.status)?.label || row.status
          }))
        }
      }
    }
  ])
  const handleSubmit = async (row: SmisHazardousWasteDocument) => {
    try {
      await confirmAction(`确认提交单据 ${row.documentNo} 进入审核？`, {
        title: '提交审核',
        confirmButtonText: '确认提交'
      })
      await transitionHazardousWasteDocument(direction.value, row.id, 'submit')
      await refresh()
    } catch {
      /* 用户取消 */
    }
  }
  const handleReview = async (row: SmisHazardousWasteDocument, approved: boolean) => {
    try {
      let remark = ''
      if (!approved)
        remark = await promptReason(`请填写单据 ${row.documentNo} 的退回原因`, '审核退回', {
          maxLength: 500
        })
      else
        await confirmAction(
          `确认审核通过单据 ${row.documentNo}？${direction.value === 'outbound' ? '系统将同步校验可用库存。' : ''}`,
          { title: '审核确认', confirmButtonText: '审核通过' }
        )
      await transitionHazardousWasteDocument(
        direction.value,
        row.id,
        approved ? 'approve' : 'reject',
        remark
      )
      await refresh()
    } catch {
      /* 用户取消 */
    }
  }
  const handleDelete = async (row: SmisHazardousWasteDocument) => {
    try {
      await confirmDelete(`确定删除单据“${row.documentNo}”吗？`)
      await deleteHazardousWasteDocuments(direction.value, [row.id])
      await refresh()
    } catch {
      /* 用户取消 */
    }
  }
  const columnsFactory = (): ColumnOption<SmisHazardousWasteDocument>[] => [
    { type: 'selection', width: 48 },
    {
      prop: 'documentNo',
      label: '单据编码',
      width: 160,
      fixed: 'left',
      formatter: (row) => <strong class="hazardous-document-page__number">{row.documentNo}</strong>
    },
    {
      prop: 'operationDate',
      label: direction.value === 'inbound' ? '入库日期' : '出库日期',
      width: 116,
      align: 'center'
    },
    { prop: 'warehouseName', label: '仓库', minWidth: 150, showOverflowTooltip: true },
    {
      prop: 'handlerEmployeeName',
      label: '经办人',
      minWidth: 130,
      formatter: (row) => `${row.handlerEmployeeName} · ${row.handlerEmployeeNo}`
    },
    {
      prop: 'items',
      label: '危废明细',
      minWidth: 280,
      showOverflowTooltip: true,
      formatter: (row) =>
        row.items
          .map((item) => `${item.wasteName} × ${item.quantity}${unitLabel(item.unit)}`)
          .join('；')
    },
    {
      prop: 'status',
      label: '单据状态',
      width: 106,
      align: 'center',
      formatter: (row) => (
        <ArtDictDisplay
          dictCode="smisHazardousWasteDocumentStatus"
          value={row.status}
          display="tag"
        />
      )
    },
    {
      prop: 'description',
      label: '说明',
      minWidth: 160,
      showOverflowTooltip: true,
      formatter: (row) => row.description || '—'
    },
    {
      prop: 'createTime',
      label: '创建时间',
      width: 164,
      formatter: (row) => dayjs(row.createTime).format('YYYY-MM-DD HH:mm')
    },
    {
      prop: 'operation',
      label: '操作',
      width: 210,
      fixed: 'right',
      formatter: (row) => (
        <div class="hazardous-document-page__actions">
          {editable(row) && (
            <ArtButtonTable
              permission={permissions.value.submit}
              icon="ri:send-plane-line"
              label="提交"
              onClick={() => void handleSubmit(row)}
            />
          )}{' '}
          {row.status === 'pending' && (
            <ArtButtonTable
              permission={permissions.value.review}
              icon="ri:checkbox-circle-line"
              label="通过"
              onClick={() => void handleReview(row, true)}
            />
          )}
          <ArtButtonMore
            list={[
              ...(editable(row)
                ? [
                    {
                      key: 'edit',
                      label: '编辑',
                      icon: 'ri:edit-line',
                      auth: permissions.value.edit
                    },
                    {
                      key: 'delete',
                      label: '删除',
                      icon: 'ri:delete-bin-line',
                      auth: permissions.value.delete,
                      color: 'var(--el-color-danger)'
                    }
                  ]
                : []),
              ...(row.status === 'pending'
                ? [
                    {
                      key: 'reject',
                      label: '审核退回',
                      icon: 'ri:close-circle-line',
                      auth: permissions.value.review,
                      color: 'var(--el-color-danger)'
                    }
                  ]
                : [])
            ]}
            onClick={(item: ButtonMoreItem) => {
              if (item.key === 'edit') open(row)
              if (item.key === 'delete') void handleDelete(row)
              if (item.key === 'reject') void handleReview(row, false)
            }}
          />
        </div>
      )
    }
  ]
  const fetchData = async (params: TableParams) => {
    const result = await fetchHazardousWasteDocumentList(direction.value, {
      ...params,
      ...pageInfoHandler(params)
    })
    Object.assign(overview, result.overview)
    return { records: result.data, total: result.total }
  }
  onMounted(async () => {
    const [result] = await Promise.all([
      fetchHazardousWasteWarehouseList({ status: 'enabled', from: 0, to: 999 }),
      userStore.ensureDictLoaded('smisHazardousWasteDocumentStatus'),
      userStore.ensureDictLoaded('smisMaterialUnit')
    ])
    warehouses.value = result.data
  })
</script>
<style scoped lang="scss">
  .hazardous-document-page {
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-width: 0;
    min-height: 0;

    &__table {
      flex: 1;
      min-width: 0;
      min-height: 0;
    }

    :deep(.hazardous-document-page__number) {
      font-variant-numeric: tabular-nums;
      color: var(--theme-color);
    }

    :deep(.hazardous-document-page__actions) {
      display: flex;
      gap: 4px;
      align-items: center;
    }
  }
</style>
