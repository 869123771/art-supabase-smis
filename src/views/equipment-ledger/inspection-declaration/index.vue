<template>
  <div class="inspection-page business-workspace-page art-full-height">
    <BusinessWorkspaceHeader
      eyebrow="INSPECTION DECLARATION & EVIDENCE"
      title="检验申报"
      description="统一申报设备检验，自动生成报告编号，并沉淀结论、延期、提醒与图片证据到设备全生命周期。"
      icon="ri:file-shield-2-line"
      :tags="[
        { label: '租户编号规则', type: 'primary', effect: 'plain' },
        { label: '检验类别联动', type: 'success', effect: 'light' },
        { label: '图片证据可追溯', type: 'info', effect: 'plain' }
      ]"
      :metrics="workspaceMetrics"
    >
      <template #actions><BusinessTableWorkspaceActions :table="tableQueryRef" /></template>
    </BusinessWorkspaceHeader>

    <ArtTableQuery
      ref="tableQueryRef"
      v-model="table.searchQuery"
      class="inspection-page__table"
      :api-fn="fetchTableData"
      :search-items="table.searchItems"
      :columns-factory="columnsFactory"
      :header-actions="table.headerActions"
      header-actions-placement="workspace"
      :search-bar-props="{ span: 6, labelWidth: 82 }"
      :table-props="{
        rowKey: 'id',
        tableLayout: 'fixed',
        emptyText: '暂无检验申报',
        emptyDescription: '从设备台账选择设备，创建第一份检验申报。'
      }"
      focusable
    />

    <InspectionDeclarationDialog ref="dialogRef" @success="refreshTable" />
  </div>
</template>

<script setup lang="tsx">
  import dayjs from 'dayjs'
  import { fetchGetOrganizationTree } from '@/api/system-manage'
  import type { SearchFormItem } from '@/components/core/forms/art-search-bar/index.vue'
  import type {
    ArtTableQueryExpose,
    ArtTableQueryHeaderAction,
    ArtTableQueryHeaderActionContext
  } from '@/components/core/tables/art-table-query/index.vue'
  import type { ColumnOption } from '@/types'
  import { pageInfoHandler } from '@/utils/table/tableUtils'
  import { useArtFeedback } from '@/hooks/core/useArtFeedback'
  import { useImageViewer } from '@/hooks/core/useImageViewer'
  import { useUserStore } from '@/store/modules/user'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import ArtDictDisplay from '@/components/core/base/art-dict-display/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import BusinessTableWorkspaceActions from '@/components/business/business-table-workspace-actions/index.vue'
  import BusinessWorkspaceHeader, {
    type BusinessWorkspaceMetric
  } from '@/components/business/business-workspace-header/index.vue'
  import {
    deleteEquipmentInspections,
    fetchEquipmentInspectionList,
    fetchInspectionCategoryList,
    type SmisEquipmentInspection,
    type SmisEquipmentInspectionOverview,
    type SmisEquipmentInspectionSearchParams
  } from '@smis/api'
  import InspectionDeclarationDialog, {
    type InspectionDeclarationDialogOpenData
  } from './modules/inspection-declaration-dialog.vue'

  defineOptions({ name: 'SmisInspectionDeclaration' })
  type TableParams = SmisEquipmentInspectionSearchParams &
    Pick<Api.Common.PaginationParams, 'current' | 'size'>
  interface DialogExpose {
    handleOpen: (data: InspectionDeclarationDialogOpenData) => Promise<void>
  }

  const { confirmDelete } = useArtFeedback()
  const userStore = useUserStore()
  const { getDictMap } = storeToRefs(userStore)
  const tableQueryRef = ref<ArtTableQueryExpose>()
  const dialogRef = ref<DialogExpose>()
  const organizationTree = ref<Api.SystemManage.OrganizationListItem[]>([])
  const inspectionCategoryOptions = ref<Array<{ label: string; value: string }>>([])
  const overview = reactive<SmisEquipmentInspectionOverview>({
    total: 0,
    completed: 0,
    dueSoon: 0,
    imageCount: 0
  })

  const workspaceMetrics = computed<BusinessWorkspaceMetric[]>(() => [
    {
      label: '检验申报',
      value: overview.total,
      description: '当前租户全部记录',
      icon: 'ri:file-list-3-line'
    },
    {
      label: '已完成',
      value: overview.completed,
      description: '已形成检验结论',
      icon: 'ri:checkbox-circle-line',
      tone: 'success'
    },
    {
      label: '90 天内到期',
      value: overview.dueSoon,
      description: '需关注下次检验',
      icon: 'ri:alarm-warning-line',
      tone: overview.dueSoon ? 'warning' : undefined
    },
    {
      label: '图片证据',
      value: overview.imageCount,
      description: '已关联检验图片',
      icon: 'ri:image-2-line',
      tone: 'primary'
    }
  ])
  const dictOptions = (code: string) =>
    (getDictMap.value[code] ?? []).map((item) => ({
      label: item.label || item.name,
      value: item.value
    }))
  const openDialog = (row?: SmisEquipmentInspection): void => {
    void dialogRef.value?.handleOpen({ row })
  }
  const headerActions = computed<ArtTableQueryHeaderAction[]>(() => [
    {
      permission: 'SmisInspectionDeclaration:Add',
      type: 'add',
      label: '新增检验申报',
      onClick: () => openDialog()
    },
    {
      permission: 'SmisInspectionDeclaration:Delete',
      type: 'delete',
      content: ({ selectedCount }: ArtTableQueryHeaderActionContext) =>
        `确定删除选中的 ${selectedCount} 份检验申报吗？相关生命周期记录与图片关联将一并移除。`,
      onClick: async ({ selectedRows, api }) => {
        const ids = selectedRows
          .map((row) => row.id)
          .filter((id): id is string => typeof id === 'string')
        await deleteEquipmentInspections(ids)
        await api.refreshRemove()
      }
    }
  ])
  const table = reactive<{
    searchQuery: SmisEquipmentInspectionSearchParams
    searchItems: ComputedRef<SearchFormItem[]>
    headerActions: ComputedRef<ArtTableQueryHeaderAction[]>
  }>({
    searchQuery: {},
    searchItems: computed(() => [
      {
        label: '关键字',
        key: 'keyword',
        type: 'input',
        props: { clearable: true, placeholder: '报告编号、设备编码或名称' }
      },
      {
        label: '使用部门',
        key: 'organizationId',
        type: 'treeSelect',
        props: {
          data: organizationTree.value,
          nodeKey: 'id',
          props: { label: 'organizationName', value: 'id', children: 'children' },
          checkStrictly: true,
          clearable: true,
          placeholder: '全部部门'
        }
      },
      {
        label: '检验类别',
        key: 'inspectionCategoryId',
        type: 'select',
        props: {
          options: inspectionCategoryOptions.value,
          clearable: true,
          placeholder: '全部类别'
        }
      },
      {
        label: '检验状态',
        key: 'status',
        type: 'select',
        props: {
          options: dictOptions('smisEquipmentInspectionStatus'),
          clearable: true,
          placeholder: '全部状态'
        }
      }
    ]),
    headerActions
  })

  const columnsFactory = (): ColumnOption<SmisEquipmentInspection>[] => [
    { type: 'selection', width: 48 },
    { type: 'globalIndex', label: '序号', width: 70 },
    {
      prop: 'inspectionNo',
      label: '检验报告编号',
      width: 172,
      fixed: 'left',
      formatter: (row) => <span class="inspection-page__code">{row.inspectionNo}</span>
    },
    {
      prop: 'equipment',
      label: '设备信息',
      minWidth: 225,
      formatter: (row) => (
        <div class="inspection-page__equipment">
          <span>
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
      prop: 'inspectionCategory',
      label: '检验类别',
      minWidth: 125,
      formatter: (row) => row.inspectionCategory.categoryName
    },
    {
      prop: 'inspectionDate',
      label: '检验日期',
      width: 118,
      formatter: (row) => dayjs(row.inspectionDate).format('YYYY-MM-DD')
    },
    {
      prop: 'conclusion',
      label: '检验结论',
      width: 125,
      formatter: (row) => (
        <ArtDictDisplay dictCode="smisEquipmentInspectionConclusion" value={row.conclusion} />
      )
    },
    {
      prop: 'inspectionInstitution',
      label: '检验机构',
      minWidth: 170,
      showOverflowTooltip: true,
      formatter: (row) => row.inspectionInstitution?.supplierName || '未设置'
    },
    {
      prop: 'organization',
      label: '使用部门',
      minWidth: 145,
      showOverflowTooltip: true,
      formatter: (row) => row.equipment.organizationName
    },
    {
      prop: 'nextDueDate',
      label: '下次检验',
      width: 118,
      formatter: (row) => (row.nextDueDate ? dayjs(row.nextDueDate).format('YYYY-MM-DD') : '未计划')
    },
    {
      prop: 'extensionDate',
      label: '延期安排',
      width: 126,
      formatter: (row) =>
        row.needsExtension && row.extensionDate
          ? dayjs(row.extensionDate).format('YYYY-MM-DD')
          : '无需延期'
    },
    {
      prop: 'images',
      label: '检验图片',
      width: 116,
      formatter: (row) =>
        row.images.length ? (
          <button
            type="button"
            class="inspection-page__preview"
            aria-label={`预览 ${row.images.length} 张检验图片`}
            onClick={() => useImageViewer(row.images.map((image) => image.url))}
          >
            <img
              src={row.images[0].url}
              alt={`${row.equipment.equipmentName}检验图片`}
              width="46"
              height="34"
            />
            <span>{row.images.length} 张</span>
          </button>
        ) : (
          '—'
        )
    },
    {
      prop: 'status',
      label: '状态',
      width: 100,
      formatter: (row) => (
        <ArtDictDisplay dictCode="smisEquipmentInspectionStatus" value={row.status} />
      )
    },
    {
      prop: 'operation',
      label: '操作',
      width: 112,
      fixed: 'right',
      formatter: (row) => (
        <div class="inspection-page__actions">
          <ArtButtonTable
            permission="SmisInspectionDeclaration:Edit"
            type="edit"
            onClick={() => openDialog(row)}
          />
          <ArtButtonTable
            permission="SmisInspectionDeclaration:Delete"
            type="delete"
            onClick={async () => {
              await confirmDelete(`确定删除检验申报“${row.inspectionNo}”吗？`)
              await deleteEquipmentInspections([row.id])
              await refreshTable()
            }}
          />
        </div>
      )
    }
  ]
  const fetchTableData = async (params: TableParams) => {
    const result = await fetchEquipmentInspectionList({ ...pageInfoHandler(params), ...params })
    Object.assign(overview, result.overview)
    return { records: result.data, total: result.total }
  }
  const refreshTable = async (): Promise<void> => {
    await tableQueryRef.value?.getData()
  }

  onMounted(async () => {
    const [organizations, categories] = await Promise.all([
      fetchGetOrganizationTree({ status: '1' }),
      fetchInspectionCategoryList({ status: 'enabled', from: 0, to: 9999 }),
      ...[
        'smisEquipmentInspectionConclusion',
        'smisEquipmentInspectionReminderMonths',
        'smisEquipmentInspectionStatus'
      ].map((code) => userStore.ensureDictLoaded(code))
    ])
    organizationTree.value = organizations.data ?? []
    inspectionCategoryOptions.value = categories.data
      .filter((item) => item.id)
      .map((item) => ({ label: item.categoryName, value: item.id || '' }))
  })
</script>

<style scoped lang="scss">
  .inspection-page {
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-height: 0;

    &__table {
      flex: 1;
      min-height: 0;
    }

    &__code {
      font-family: var(--art-code-font-family, 'SFMono-Regular', Consolas, monospace);
      font-weight: 600;
      color: var(--theme-color);
    }

    &__equipment {
      display: grid;
      grid-template-columns: 40px minmax(0, 1fr);
      gap: 10px;
      align-items: center;

      > span:first-child {
        display: grid;
        place-items: center;
        width: 40px;
        height: 40px;
        color: var(--theme-color);
        background: color-mix(in srgb, var(--theme-color) 9%, var(--default-box-color));
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
        margin-top: 3px;
        font-size: 11px;
        color: var(--el-text-color-secondary);
      }
    }

    &__preview {
      display: inline-grid;
      grid-template-columns: 46px auto;
      gap: 7px;
      align-items: center;
      min-height: 38px;
      padding: 2px 8px 2px 2px;
      font-size: 12px;
      color: var(--theme-color);
      cursor: pointer;
      background: var(--art-gray-100);
      border: 1px solid var(--el-border-color-lighter);
      border-radius: var(--el-border-radius-small);

      img {
        width: 46px;
        height: 34px;
        object-fit: cover;
        border-radius: var(--el-border-radius-small);
      }

      &:focus-visible {
        outline: 2px solid var(--theme-color);
        outline-offset: 2px;
      }
    }

    &__actions {
      display: flex;
      gap: 4px;
    }
  }
</style>
