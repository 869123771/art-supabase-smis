<template>
  <ArtPermissionGuard
    permission="SmisHazardousWasteWarehouseDefinition:View"
    resource-name="仓库定义"
  >
    <div class="hazardous-warehouse-page business-workspace-page art-full-height">
      <BusinessWorkspaceHeader
        eyebrow="HAZARDOUS WASTE STORAGE"
        title="仓库定义"
        description="统一维护危废库房、责任人员、行政区域与展示标识，为入库、出库和库存核验提供可信主数据。"
        icon="ri:archive-drawer-line"
        :tags="[
          { label: '花名册联动', type: 'primary', effect: 'plain' },
          { label: '区域字典', type: 'success', effect: 'light' },
          { label: '租户级隔离', type: 'info', effect: 'plain' }
        ]"
        :metrics="workspaceMetrics"
      >
        <template #actions><BusinessTableWorkspaceActions :table="tableQueryRef" /></template>
      </BusinessWorkspaceHeader>
      <ArtTableQuery
        ref="tableQueryRef"
        v-model="searchQuery"
        class="hazardous-warehouse-page__table"
        :api-fn="fetchTableData"
        :search-items="searchItems"
        :columns-factory="columnsFactory"
        :header-actions="headerActions"
        header-actions-placement="workspace"
        :search-bar-props="{ span: 8, labelWidth: 82, showExpand: false }"
        :table-props="{
          rowKey: 'id',
          tableLayout: 'fixed',
          emptyText: '暂无危废仓库',
          emptyDescription: '新增仓库并明确库管员、负责人及库房地址后，即可办理危废入出库。'
        }"
        focusable
      />
      <WarehouseDialog ref="dialogRef" @success="handleSaveSuccess" />
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
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import ArtDictDisplay from '@/components/core/base/art-dict-display/index.vue'
  import ArtPermissionGuard from '@/components/core/feedback/art-permission-guard/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import BusinessTableWorkspaceActions from '@/components/business/business-table-workspace-actions/index.vue'
  import BusinessWorkspaceHeader, {
    type BusinessWorkspaceMetric
  } from '@/components/business/business-workspace-header/index.vue'
  import {
    deleteHazardousWasteWarehouses,
    fetchHazardousWasteWarehouseList,
    type SmisHazardousWasteWarehouse,
    type SmisHazardousWasteWarehouseOverview,
    type SmisHazardousWasteWarehouseSearchParams
  } from '@smis/api'
  import WarehouseDialog, { type WarehouseDialogOpenData } from './modules/warehouse-dialog.vue'

  defineOptions({ name: 'SmisHazardousWasteWarehouseDefinition' })
  type TableParams = SmisHazardousWasteWarehouseSearchParams &
    Pick<Api.Common.PaginationParams, 'current' | 'size'>
  interface DialogExpose {
    handleOpen: (data: WarehouseDialogOpenData) => Promise<void>
  }

  const { confirmDelete } = useArtFeedback()
  const userStore = useUserStore()
  const { getDictMap } = storeToRefs(userStore)
  const { isAllTenants, scopeLabel } = storeToRefs(useTenantScopeStore())
  const tableQueryRef = ref<ArtTableQueryExpose>()
  const dialogRef = ref<DialogExpose>()
  const searchQuery = reactive<SmisHazardousWasteWarehouseSearchParams>({})
  const overview = reactive<SmisHazardousWasteWarehouseOverview>({
    total: 0,
    enabled: 0,
    managed: 0,
    regionCount: 0
  })
  const statusOptions = computed(() =>
    (getDictMap.value.smisHazardousWasteEnableStatus ?? []).map((item) => ({
      label: item.label || item.name,
      value: item.value
    }))
  )
  const workspaceMetrics = computed<BusinessWorkspaceMetric[]>(() => [
    {
      label: '仓库总数',
      value: overview.total,
      description: `${scopeLabel.value}危废库房`,
      icon: 'ri:archive-stack-line'
    },
    {
      label: '已启用',
      value: overview.enabled,
      description: '可办理入出库',
      icon: 'ri:checkbox-circle-line',
      tone: 'success'
    },
    {
      label: '责任到人',
      value: overview.managed,
      description: '库管与负责人齐备',
      icon: 'ri:user-star-line',
      tone: 'warning'
    },
    {
      label: '覆盖区域',
      value: overview.regionCount,
      description: '已关联行政区域',
      icon: 'ri:map-pin-range-line'
    }
  ])
  const searchItems = computed<SearchFormItem[]>(() => [
    {
      label: '关键字',
      key: 'keyword',
      type: 'input',
      props: { clearable: true, placeholder: '仓库编号、名称、人员或地址' }
    },
    {
      label: '启用状态',
      key: 'status',
      type: 'select',
      props: { options: statusOptions.value, clearable: true, placeholder: '全部状态' }
    }
  ])
  const exportColumns = [
    { key: 'warehouseCode', title: '仓库编号' },
    { key: 'warehouseName', title: '仓库名称' },
    { key: 'keeperEmployeeName', title: '库管员' },
    { key: 'responsibleEmployeeName', title: '负责人' },
    { key: 'address', title: '库房地址' },
    { key: 'statusLabel', title: '状态' },
    { key: 'sort', title: '排序' }
  ]
  const openDialog = (row?: SmisHazardousWasteWarehouse): void => {
    void dialogRef.value?.handleOpen({ row })
  }
  const headerActions = computed<ArtTableQueryHeaderAction[]>(() => [
    {
      permission: 'SmisHazardousWasteWarehouseDefinition:Add',
      type: 'add',
      label: '新增仓库',
      onClick: () => openDialog()
    },
    {
      permission: 'SmisHazardousWasteWarehouseDefinition:Export',
      type: 'export',
      exportFilename: '危废仓库定义',
      exportSheetName: '危废仓库',
      exportColumns,
      exportApi: async ({ selectedIds, searchParams, maxRows }) => {
        const response = await fetchHazardousWasteWarehouseList({
          ...(searchParams as SmisHazardousWasteWarehouseSearchParams),
          ids: selectedIds.map(String),
          purpose: 'export',
          to: Math.max((maxRows ?? 10000) - 1, 0)
        })
        return {
          data: response.data.map((row) => ({
            ...row,
            address: [...(row.regionPath || []), row.addressDetail].filter(Boolean).join(' / '),
            statusLabel: row.status === 'enabled' ? '启用' : '禁用'
          }))
        }
      }
    },
    {
      permission: 'SmisHazardousWasteWarehouseDefinition:Delete',
      type: 'delete',
      content: ({ selectedCount }: ArtTableQueryHeaderActionContext) =>
        `确定删除选中的 ${selectedCount} 个危废仓库吗？已被单据引用的仓库不能删除。`,
      onClick: async ({ selectedRows, api }) => {
        await deleteHazardousWasteWarehouses(selectedRows.map((row) => String(row.id)))
        await api.refreshRemove()
      }
    }
  ])
  const columnsFactory = (): ColumnOption<SmisHazardousWasteWarehouse>[] => [
    { type: 'selection', width: 48 },
    { prop: 'sort', label: '排序', width: 78, align: 'center', sortable: true },
    ...(isAllTenants.value
      ? [
          {
            prop: 'tenantName',
            label: '所属租户',
            minWidth: 160,
            showOverflowTooltip: true,
            formatter: (row: SmisHazardousWasteWarehouse) => row.tenantName || '—'
          } as ColumnOption<SmisHazardousWasteWarehouse>
        ]
      : []),
    {
      prop: 'warehouseName',
      label: '仓库',
      minWidth: 220,
      fixed: 'left',
      formatter: (row) => (
        <div class="hazardous-warehouse-page__identity">
          <span aria-hidden="true">
            <ArtSvgIcon icon="ri:archive-drawer-line" />
          </span>
          <span>
            <strong title={row.warehouseName}>{row.warehouseName}</strong>
            <small>{row.warehouseCode}</small>
          </span>
        </div>
      )
    },
    {
      prop: 'keeperEmployeeName',
      label: '库管员',
      minWidth: 145,
      showOverflowTooltip: true,
      formatter: (row) =>
        row.keeperEmployeeName
          ? `${row.keeperEmployeeName} · ${row.keeperEmployeeNo || '—'}`
          : '未配置'
    },
    {
      prop: 'responsibleEmployeeName',
      label: '负责人',
      minWidth: 145,
      showOverflowTooltip: true,
      formatter: (row) =>
        row.responsibleEmployeeName
          ? `${row.responsibleEmployeeName} · ${row.responsibleEmployeeNo || '—'}`
          : '未配置'
    },
    {
      prop: 'addressDetail',
      label: '库房地址',
      minWidth: 230,
      showOverflowTooltip: true,
      formatter: (row) =>
        [...(row.regionPath || []), row.addressDetail].filter(Boolean).join(' / ') || '—'
    },
    {
      prop: 'tagStyle',
      label: '标签样式',
      width: 130,
      align: 'center',
      formatter: (row) => (
        <ElTag type={row.tagStyle || 'info'} effect="light">
          <span style={{ color: row.textColor || undefined }}>{row.warehouseName}</span>
        </ElTag>
      )
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
        <div class="hazardous-warehouse-page__actions">
          <ArtButtonTable
            type="edit"
            permission="SmisHazardousWasteWarehouseDefinition:Edit"
            onClick={() => openDialog(row)}
          />
          <ArtButtonTable
            type="delete"
            permission="SmisHazardousWasteWarehouseDefinition:Delete"
            onClick={() => void handleDelete(row)}
          />
        </div>
      )
    }
  ]
  const fetchTableData = async (params: TableParams) => {
    const response = await fetchHazardousWasteWarehouseList({
      ...params,
      ...pageInfoHandler(params)
    })
    Object.assign(overview, response.overview)
    return { records: response.data, total: response.total }
  }
  const handleDelete = async (row: SmisHazardousWasteWarehouse): Promise<void> => {
    try {
      await confirmDelete(`确定删除危废仓库“${row.warehouseName}”吗？`)
      await deleteHazardousWasteWarehouses([row.id])
      await tableQueryRef.value?.refreshRemove()
    } catch {
      /* 取消删除 */
    }
  }
  const handleSaveSuccess = (type: 'add' | 'edit'): void => {
    void (type === 'add'
      ? tableQueryRef.value?.refreshCreate()
      : tableQueryRef.value?.refreshUpdate())
  }
  onMounted(() => void userStore.ensureDictLoaded('smisHazardousWasteEnableStatus'))
</script>

<style scoped lang="scss">
  .hazardous-warehouse-page {
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

    :deep(.hazardous-warehouse-page__identity) {
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
        font: 11px var(--art-font-family-mono, Consolas, monospace);
        color: var(--el-text-color-secondary);
      }
    }

    :deep(.hazardous-warehouse-page__actions) {
      display: flex;
      align-items: center;
    }
  }
</style>
