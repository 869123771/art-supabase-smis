<template>
  <div class="supplier-page business-workspace-page art-full-height">
    <BusinessWorkspaceHeader
      eyebrow="SHARED SUPPLIER MASTER DATA"
      title="供应商"
      description="统一维护各业务系统共用的供应商单位、分类、联系人和地图地址，避免重复建档与口径分散。"
      icon="ri:store-2-line"
      :tags="[
        { label: '跨系统公用', type: 'primary', effect: 'plain' },
        { label: '租户级主数据', type: 'success', effect: 'light' },
        { label: '地图地址', type: 'info', effect: 'plain' }
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
      header-actions-placement="workspace"
      :search-bar-props="{ span: 6, labelWidth: 86 }"
      :table-props="{
        rowKey: 'id',
        tableLayout: 'fixed',
        emptyText: '暂无供应商',
        emptyDescription: '可新增首家供应商，统一维护分类、联系人和地图地址。'
      }"
      focusable
    />

    <SupplierDialog ref="dialogRef" @success="handleSaveSuccess" />
  </div>
</template>

<script setup lang="tsx">
  import dayjs from 'dayjs'
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
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import BusinessTableWorkspaceActions from '@/components/business/business-table-workspace-actions/index.vue'
  import BusinessWorkspaceHeader, {
    type BusinessWorkspaceMetric
  } from '@/components/business/business-workspace-header/index.vue'
  import {
    deleteSuppliers,
    exportSupplierList,
    fetchSupplierList,
    type SmisSupplier,
    type SmisSupplierOverview,
    type SmisSupplierSearchParams
  } from '@smis/api'
  import SupplierDialog, { type SupplierDialogOpenData } from './modules/supplier-dialog.vue'
  import {
    getSupplierDictionaryOptions,
    resolveSupplierDictionaryLabel,
    SUPPLIER_DICTIONARY_CODES,
    type SupplierDictionaryCode
  } from '@smis/domain/supplier-dictionary'

  defineOptions({ name: 'SmisSupplier' })

  type TableParams = SmisSupplierSearchParams &
    Pick<Api.Common.PaginationParams, 'current' | 'size'>

  interface DialogExpose {
    handleOpen: (data: SupplierDialogOpenData) => Promise<void>
  }

  interface TableGroup {
    searchQuery: SmisSupplierSearchParams
    searchItems: ComputedRef<SearchFormItem[]>
    headerActions: ComputedRef<ArtTableQueryHeaderAction[]>
  }

  const { confirmDelete } = useArtFeedback()
  const userStore = useUserStore()
  const { getDictMap } = storeToRefs(userStore)
  const tableQueryRef = ref<ArtTableQueryExpose>()
  const dialogRef = ref<DialogExpose>()
  const overview = reactive<SmisSupplierOverview>({
    total: 0,
    keySuppliers: 0,
    categoryCount: 0,
    contactComplete: 0
  })

  const toOptions = (code: SupplierDictionaryCode) =>
    getSupplierDictionaryOptions(code, getDictMap.value[code])

  const resolveDictLabel = (code: SupplierDictionaryCode, value?: string | null) =>
    resolveSupplierDictionaryLabel(code, value, getDictMap.value[code])

  const workspaceMetrics = computed<BusinessWorkspaceMetric[]>(() => [
    {
      label: '供应商总数',
      value: overview.total,
      description: '当前租户统一主数据',
      icon: 'ri:store-3-line'
    },
    {
      label: '重点供应商',
      value: overview.keySuppliers,
      description: '需重点协同与维护',
      icon: 'ri:star-smile-line',
      tone: 'warning'
    },
    {
      label: '覆盖类别',
      value: overview.categoryCount,
      description: '当前已建档类别数',
      icon: 'ri:stack-line'
    },
    {
      label: '联络信息完整',
      value: overview.contactComplete,
      description: '联系人及电话均已维护',
      icon: 'ri:contacts-book-2-line',
      tone: 'success'
    }
  ])

  const exportColumns: ArtTableQueryExcelColumn[] = [
    { key: 'supplierCode', title: '单位编码', required: true },
    { key: 'supplierName', title: '单位名称', required: true },
    { key: 'supplierCategory', title: '供应商类别' },
    { key: 'supplierGroup', title: '供应商分组' },
    { key: 'supplierType', title: '供应商类型' },
    { key: 'enterpriseNature', title: '企业性质' },
    { key: 'industry', title: '行业' },
    { key: 'contactPerson', title: '联系人' },
    { key: 'contactPhone', title: '联系电话' },
    { key: 'addressDetail', title: '详细地址' },
    { key: 'longitude', title: '经度' },
    { key: 'latitude', title: '纬度' },
    { key: 'remark', title: '备注' }
  ]

  const openDialog = (row?: SmisSupplier): void => {
    void dialogRef.value?.handleOpen({ row })
  }

  const headerActions = computed<ArtTableQueryHeaderAction[]>(() => [
    {
      permission: 'SmisSupplier:Add',
      type: 'add',
      label: '新增供应商',
      onClick: () => openDialog()
    },
    {
      permission: 'SmisSupplier:Export',
      type: 'export',
      exportFilename: '供应商主数据',
      exportSheetName: '供应商',
      exportColumns,
      exportApi: async ({ selectedIds, searchParams, maxRows }) => {
        const response = await exportSupplierList({
          ...(searchParams as SmisSupplierSearchParams),
          ids: selectedIds.map(String),
          to: Math.max((maxRows ?? 10000) - 1, 0)
        })
        return {
          data: response.data.map((row) => ({
            ...row,
            supplierCategory: resolveDictLabel('supplierCategory', row.supplierCategory),
            supplierType: resolveDictLabel('supplierType', row.supplierType),
            enterpriseNature: resolveDictLabel('enterpriseNature', row.enterpriseNature),
            industry: resolveDictLabel('supplierIndustry', row.industry)
          }))
        }
      }
    },
    {
      permission: 'SmisSupplier:Delete',
      type: 'delete',
      content: ({ selectedCount }: ArtTableQueryHeaderActionContext) =>
        `确定删除选中的 ${selectedCount} 家供应商吗？删除后无法恢复。`,
      onClick: async ({ selectedRows, api }) => {
        const ids = selectedRows
          .map((row) => row.id)
          .filter((id): id is string => typeof id === 'string')
        await deleteSuppliers(ids)
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
        props: { clearable: true, placeholder: '编码、名称、分组、联系人或地址' }
      },
      {
        label: '供应商类别',
        key: 'supplierCategory',
        type: 'select',
        props: { options: toOptions('supplierCategory'), clearable: true, placeholder: '全部类别' }
      },
      {
        label: '供应商类型',
        key: 'supplierType',
        type: 'select',
        props: { options: toOptions('supplierType'), clearable: true, placeholder: '全部类型' }
      },
      {
        label: '企业性质',
        key: 'enterpriseNature',
        type: 'select',
        props: { options: toOptions('enterpriseNature'), clearable: true, placeholder: '全部性质' }
      },
      {
        label: '行业',
        key: 'industry',
        type: 'select',
        props: { options: toOptions('supplierIndustry'), clearable: true, placeholder: '全部行业' }
      }
    ]),
    headerActions
  })

  const columnsFactory = (): ColumnOption<SmisSupplier>[] => [
    { type: 'selection', width: 48, fixed: 'left', reserveSelection: true },
    { type: 'globalIndex', label: '序号', width: 72 },
    {
      prop: 'supplierName',
      label: '供应商单位',
      minWidth: 230,
      fixed: 'left',
      formatter: (row) => (
        <div class="supplier-page__identity">
          <span aria-hidden="true">
            <ArtSvgIcon icon="ri:building-4-line" />
          </span>
          <span>
            <strong title={row.supplierName}>{row.supplierName}</strong>
            <small title={row.supplierCode}>{row.supplierCode}</small>
          </span>
        </div>
      )
    },
    {
      prop: 'supplierCategory',
      label: '供应商类别',
      width: 126,
      formatter: (row) => resolveDictLabel('supplierCategory', row.supplierCategory)
    },
    {
      prop: 'supplierType',
      label: '供应商类型',
      width: 116,
      formatter: (row) => resolveDictLabel('supplierType', row.supplierType)
    },
    { prop: 'supplierGroup', label: '供应商分组', minWidth: 130, showOverflowTooltip: true },
    {
      prop: 'contact',
      label: '联系人 / 电话',
      minWidth: 170,
      formatter: (row) => (
        <div class="supplier-page__stack">
          <strong>{row.contactPerson || '联系人待完善'}</strong>
          <small>{row.contactPhone || '电话待完善'}</small>
        </div>
      )
    },
    {
      prop: 'enterpriseNature',
      label: '企业性质',
      width: 104,
      formatter: (row) => resolveDictLabel('enterpriseNature', row.enterpriseNature)
    },
    {
      prop: 'industry',
      label: '行业',
      width: 126,
      formatter: (row) => resolveDictLabel('supplierIndustry', row.industry)
    },
    {
      prop: 'addressDetail',
      label: '详细地址 / 坐标',
      minWidth: 260,
      formatter: (row) => (
        <div class="supplier-page__stack">
          <strong title={row.addressDetail || ''}>{row.addressDetail || '地址待完善'}</strong>
          <small>
            {row.longitude != null && row.latitude != null
              ? `${row.longitude}, ${row.latitude}`
              : '坐标待选取'}
          </small>
        </div>
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
        <div class="supplier-page__actions">
          <ArtButtonTable
            type="edit"
            permission="SmisSupplier:Edit"
            onClick={() => openDialog(row)}
          />
          <ArtButtonTable
            type="delete"
            permission="SmisSupplier:Delete"
            onClick={() => void handleDelete(row)}
          />
        </div>
      )
    }
  ]

  const fetchTableData = async (params: TableParams) => {
    const { from, to } = pageInfoHandler({ current: params.current, size: params.size })
    const response = await fetchSupplierList({
      keyword: params.keyword,
      supplierCategory: params.supplierCategory,
      supplierType: params.supplierType,
      enterpriseNature: params.enterpriseNature,
      industry: params.industry,
      from,
      to
    })
    Object.assign(overview, response.overview)
    return response
  }

  const handleSaveSuccess = (type: 'add' | 'edit'): void => {
    void (type === 'add'
      ? tableQueryRef.value?.refreshCreate()
      : tableQueryRef.value?.refreshUpdate())
  }

  const handleDelete = async (row: SmisSupplier): Promise<void> => {
    if (!row.id) return
    try {
      await confirmDelete(`确定删除供应商“${row.supplierName}”吗？删除后无法恢复。`)
      await deleteSuppliers([row.id])
      await tableQueryRef.value?.refreshRemove()
    } catch {
      /* 用户取消 */
    }
  }

  onMounted(async () => {
    await Promise.all(SUPPLIER_DICTIONARY_CODES.map((code) => userStore.ensureDictLoaded(code)))
  })
</script>

<style scoped lang="scss">
  .supplier-page {
    gap: 12px;
    min-width: 0;

    :deep(.supplier-page__identity) {
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

      > span:last-child,
      strong,
      small {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      > span:last-child,
      strong,
      small {
        display: block;
      }

      small {
        margin-top: 2px;
        font-family: var(--art-font-family-mono, Consolas, monospace);
        font-size: 11px;
        color: var(--el-text-color-secondary);
      }
    }

    :deep(.supplier-page__stack) {
      display: grid;
      align-content: center;
      min-width: 0;

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

    :deep(.supplier-page__actions) {
      display: flex;
      gap: 4px;
      align-items: center;
      justify-content: center;

      .art-button-table {
        margin-right: 0;
      }
    }
  }
</style>
