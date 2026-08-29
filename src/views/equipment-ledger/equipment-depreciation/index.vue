<template>
  <div class="equipment-depreciation-page business-workspace-page art-full-height">
    <BusinessWorkspaceHeader
      eyebrow="ASSET DEPRECIATION"
      title="设备折旧"
      description="按设备建立租户级折旧方案，统一折旧方法、年度三位流水单号、资产原值、使用年限和当前净值。"
      icon="ri:funds-box-line"
      :tags="[
        { label: '编号规则自动取号', type: 'primary', effect: 'plain' },
        { label: '设备台账联动', type: 'success', effect: 'light' },
        { label: '三种折旧方法', type: 'info', effect: 'plain' }
      ]"
      :metrics="workspaceMetrics"
    >
      <template #actions><BusinessTableWorkspaceActions :table="tableQueryRef" /></template>
    </BusinessWorkspaceHeader>

    <ArtTableQuery
      ref="tableQueryRef"
      v-model="table.searchQuery"
      class="equipment-depreciation-page__table"
      :api-fn="fetchTableData"
      :search-items="table.searchItems"
      :columns-factory="columnsFactory"
      :header-actions="table.headerActions"
      header-actions-placement="workspace"
      :search-bar-props="{ span: 8, labelWidth: 82, showExpand: false }"
      :table-props="{
        rowKey: 'id',
        tableLayout: 'fixed',
        emptyText: '暂无设备折旧方案',
        emptyDescription: '选择设备台账中的设备，建立第一份折旧方案。'
      }"
      focusable
    />

    <EquipmentDepreciationDialog ref="dialogRef" @success="refreshTable" />
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
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import ArtDictDisplay from '@/components/core/base/art-dict-display/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import BusinessTableWorkspaceActions from '@/components/business/business-table-workspace-actions/index.vue'
  import BusinessWorkspaceHeader, {
    type BusinessWorkspaceMetric
  } from '@/components/business/business-workspace-header/index.vue'
  import {
    deleteEquipmentDepreciations,
    fetchEquipmentDepreciationList,
    type SmisEquipmentDepreciation,
    type SmisEquipmentDepreciationOverview,
    type SmisEquipmentDepreciationSearchParams
  } from '@smis/api'
  import EquipmentDepreciationDialog, {
    type EquipmentDepreciationDialogOpenData
  } from './modules/equipment-depreciation-dialog.vue'

  defineOptions({ name: 'SmisEquipmentDepreciation' })
  type TableParams = SmisEquipmentDepreciationSearchParams &
    Pick<Api.Common.PaginationParams, 'current' | 'size'>
  interface DialogExpose {
    handleOpen: (data: EquipmentDepreciationDialogOpenData) => Promise<void>
  }
  const { confirmDelete } = useArtFeedback()
  const userStore = useUserStore()
  const { getDictMap } = storeToRefs(userStore)
  const tableQueryRef = ref<ArtTableQueryExpose>()
  const dialogRef = ref<DialogExpose>()
  const overview = reactive<SmisEquipmentDepreciationOverview>({
    total: 0,
    active: 0,
    totalOriginalValue: 0,
    totalNetValue: 0
  })
  const currency = (value: number | string) =>
    Number(value || 0).toLocaleString('zh-CN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  const workspaceMetrics = computed<BusinessWorkspaceMetric[]>(() => [
    {
      label: '折旧方案',
      value: overview.total,
      description: '当前租户全部方案',
      icon: 'ri:file-list-3-line'
    },
    {
      label: '执行中',
      value: overview.active,
      description: '当前有效折旧方案',
      icon: 'ri:play-circle-line',
      tone: 'success'
    },
    {
      label: '资产原值',
      value: `¥ ${currency(overview.totalOriginalValue)}`,
      description: '折旧方案资产原值合计',
      icon: 'ri:money-cny-circle-line'
    },
    {
      label: '当前净值',
      value: `¥ ${currency(overview.totalNetValue)}`,
      description: '折旧方案账面净值合计',
      icon: 'ri:line-chart-line',
      tone: 'primary'
    }
  ])
  const dictOptions = (code: string) =>
    (getDictMap.value[code] ?? []).map((item) => ({
      label: item.label || item.name,
      value: item.value
    }))
  const openDialog = (row?: SmisEquipmentDepreciation): void => {
    void dialogRef.value?.handleOpen({ row })
  }
  const headerActions = computed<ArtTableQueryHeaderAction[]>(() => [
    {
      permission: 'SmisEquipmentDepreciation:Add',
      type: 'add',
      label: '新增折旧方案',
      onClick: () => openDialog()
    },
    {
      permission: 'SmisEquipmentDepreciation:Delete',
      type: 'delete',
      content: ({ selectedCount }: ArtTableQueryHeaderActionContext) =>
        `确定删除选中的 ${selectedCount} 份折旧方案吗？`,
      onClick: async ({ selectedRows, api }) => {
        const ids = selectedRows
          .map((row) => row.id)
          .filter((id): id is string => typeof id === 'string')
        await deleteEquipmentDepreciations(ids)
        await api.refreshRemove()
      }
    }
  ])
  const table = reactive<{
    searchQuery: SmisEquipmentDepreciationSearchParams
    searchItems: ComputedRef<SearchFormItem[]>
    headerActions: ComputedRef<ArtTableQueryHeaderAction[]>
  }>({
    searchQuery: {},
    searchItems: computed(() => [
      {
        label: '关键字',
        key: 'keyword',
        type: 'input',
        props: { clearable: true, placeholder: '折旧单号、设备名称或设备编码' }
      },
      {
        label: '折旧方法',
        key: 'depreciationMethod',
        type: 'select',
        props: {
          options: dictOptions('smisEquipmentDepreciationMethod'),
          clearable: true,
          placeholder: '全部方法'
        }
      },
      {
        label: '折旧状态',
        key: 'status',
        type: 'select',
        props: {
          options: dictOptions('smisEquipmentDepreciationStatus'),
          clearable: true,
          placeholder: '全部状态'
        }
      }
    ]),
    headerActions
  })
  const columnsFactory = (): ColumnOption<SmisEquipmentDepreciation>[] => [
    { type: 'selection', width: 48 },
    { type: 'globalIndex', label: '序号', width: 70 },
    {
      prop: 'depreciationNo',
      label: '折旧单号',
      width: 165,
      fixed: 'left',
      formatter: (row) => (
        <span class="equipment-depreciation-page__code">{row.depreciationNo}</span>
      )
    },
    {
      prop: 'equipment',
      label: '设备信息',
      minWidth: 250,
      formatter: (row) => (
        <div class="equipment-depreciation-page__equipment">
          <span aria-hidden="true">
            <ArtSvgIcon icon="ri:archive-line" />
          </span>
          <span>
            <strong title={row.equipment.equipmentName}>{row.equipment.equipmentName}</strong>
            <small title={row.equipment.equipmentCode}>{row.equipment.equipmentCode}</small>
          </span>
        </div>
      )
    },
    {
      prop: 'depreciationMethod',
      label: '折旧方法',
      minWidth: 145,
      formatter: (row) => (
        <ArtDictDisplay dictCode="smisEquipmentDepreciationMethod" value={row.depreciationMethod} />
      )
    },
    {
      prop: 'depreciationStartDate',
      label: '开始日期',
      width: 120,
      formatter: (row) => dayjs(row.depreciationStartDate).format('YYYY-MM-DD')
    },
    {
      prop: 'originalValue',
      label: '资产原值（元）',
      width: 140,
      align: 'right',
      formatter: (row) => currency(row.originalValue)
    },
    {
      prop: 'residualRate',
      label: '净残值率',
      width: 105,
      align: 'right',
      formatter: (row) => `${Number(row.residualRate)}%`
    },
    {
      prop: 'usefulLifeYears',
      label: '使用年限',
      width: 105,
      align: 'right',
      formatter: (row) => `${Number(row.usefulLifeYears)} 年`
    },
    {
      prop: 'accumulatedDepreciation',
      label: '累计折旧（元）',
      width: 145,
      align: 'right',
      formatter: (row) => currency(row.accumulatedDepreciation)
    },
    {
      prop: 'netValue',
      label: '当前净值（元）',
      width: 140,
      align: 'right',
      formatter: (row) => (
        <strong class="equipment-depreciation-page__net">{currency(row.netValue)}</strong>
      )
    },
    {
      prop: 'status',
      label: '状态',
      width: 95,
      formatter: (row) => (
        <ArtDictDisplay dictCode="smisEquipmentDepreciationStatus" value={row.status} />
      )
    },
    {
      prop: 'operation',
      label: '操作',
      width: 112,
      fixed: 'right',
      formatter: (row) => (
        <div class="equipment-depreciation-page__actions">
          <ArtButtonTable
            permission="SmisEquipmentDepreciation:Edit"
            type="edit"
            onClick={() => openDialog(row)}
          />
          <ArtButtonTable
            permission="SmisEquipmentDepreciation:Delete"
            type="delete"
            onClick={async () => {
              await confirmDelete(`确定删除折旧方案“${row.depreciationNo}”吗？`)
              await deleteEquipmentDepreciations([row.id])
              await refreshTable()
            }}
          />
        </div>
      )
    }
  ]
  const fetchTableData = async (params: TableParams) => {
    const result = await fetchEquipmentDepreciationList({ ...pageInfoHandler(params), ...params })
    Object.assign(overview, result.overview)
    return { records: result.data, total: result.total }
  }
  const refreshTable = async (): Promise<void> => {
    await tableQueryRef.value?.getData()
  }
  onMounted(() => {
    void Promise.all([
      userStore.ensureDictLoaded('smisEquipmentDepreciationMethod'),
      userStore.ensureDictLoaded('smisEquipmentDepreciationStatus')
    ])
  })
</script>

<style scoped lang="scss">
  .equipment-depreciation-page {
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-height: 0;

    &__table {
      flex: 1;
      min-height: 0;
    }

    :deep(.equipment-depreciation-page__code) {
      font-family: var(--art-code-font-family, 'SFMono-Regular', Consolas, monospace);
      font-weight: 600;
      color: var(--theme-color);
    }

    :deep(.equipment-depreciation-page__equipment) {
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

    :deep(.equipment-depreciation-page__net) {
      color: var(--el-color-success-dark-2);
    }

    :deep(.equipment-depreciation-page__actions) {
      display: flex;
      gap: 4px;
    }
  }
</style>
