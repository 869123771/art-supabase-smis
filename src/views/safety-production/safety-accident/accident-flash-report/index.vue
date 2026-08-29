<template>
  <ArtPermissionGuard permission="SmisAccidentFlashReport:View">
    <div class="accident-page business-workspace-page art-full-height">
      <BusinessWorkspaceHeader
        eyebrow="INCIDENT RESPONSE"
        title="事故快报"
        description="及时固化事故事实、人员影响与防范责任，为调查处置和工伤申报提供统一依据。"
        icon="ri:alarm-warning-line"
        :tags="[
          { label: '编号自动生成', type: 'primary', effect: 'plain' },
          { label: '人员档案快照', type: 'warning', effect: 'light' },
          { label: '防范责任闭环', type: 'success', effect: 'plain' }
        ]"
        :metrics="metrics"
      >
        <template #actions><BusinessTableWorkspaceActions :table="tableRef" /></template>
      </BusinessWorkspaceHeader>

      <div class="accident-page__risk-strip" role="note">
        <span><ArtSvgIcon icon="ri:shield-cross-line" /></span>
        <p
          ><strong>快报完整性提示</strong
          >事故时间、地点、类别与级别是追溯核心；人员记录按保存时的花名册内容留存。</p
        >
      </div>

      <ArtTableQuery
        ref="tableRef"
        v-model="searchQuery"
        class="accident-page__table"
        :api-fn="fetchTableData"
        :search-items="searchItems"
        :columns-factory="columnsFactory"
        :header-actions="headerActions"
        header-actions-placement="workspace"
        :search-bar-props="{ span: 6, labelWidth: 76, showExpand: false }"
        :table-props="{
          rowKey: 'id',
          tableLayout: 'fixed',
          emptyText: '暂无事故快报',
          emptyDescription: '可点击新增，快速记录事故及相关人员信息。'
        }"
        focusable
      />
      <AccidentReportDialog ref="dialogRef" @success="handleSaveSuccess" />
    </div>
  </ArtPermissionGuard>
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
  import { useUserStore } from '@/store/modules/user'
  import { useArtFeedback } from '@/hooks/core/useArtFeedback'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import ArtDictDisplay from '@/components/core/base/art-dict-display/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import BusinessWorkspaceHeader, {
    type BusinessWorkspaceMetric
  } from '@/components/business/business-workspace-header/index.vue'
  import BusinessTableWorkspaceActions from '@/components/business/business-table-workspace-actions/index.vue'
  import {
    deleteAccidentReports,
    fetchAccidentReportList,
    type SmisAccidentEmployee,
    type SmisAccidentReport,
    type SmisAccidentReportSearchParams,
    type SmisTreeOrganization
  } from '@smis/api'
  import AccidentReportDialog, {
    type AccidentReportDialogOpenData
  } from './modules/accident-report-dialog.vue'

  defineOptions({ name: 'SmisAccidentFlashReport' })
  interface AccidentSearchModel extends SmisAccidentReportSearchParams {
    accidentTimeRange?: [string, string]
  }
  type TableParams = AccidentSearchModel & Pick<Api.Common.PaginationParams, 'current' | 'size'>
  interface DialogExpose {
    handleOpen: (data: AccidentReportDialogOpenData) => Promise<void>
  }

  const userStore = useUserStore()
  const { getDictMap } = storeToRefs(userStore)
  const { confirmDelete } = useArtFeedback()
  const tableRef = ref<ArtTableQueryExpose>()
  const dialogRef = ref<DialogExpose>()
  const searchQuery = ref<AccidentSearchModel>({})
  const organizations = shallowRef<SmisTreeOrganization[]>([])
  const currentEmployee = shallowRef<SmisAccidentEmployee | null>(null)
  const overview = reactive({ total: 0, currentMonth: 0, highSeverity: 0, affectedPeople: 0 })
  const dictOptions = (code: string) =>
    (getDictMap.value[code] ?? []).map((item) => ({
      label: item.label || item.name,
      value: item.value
    }))
  const dictLabel = (code: string, value: string): string =>
    getDictMap.value[code]?.find((item) => item.value === value)?.label || value
  const metrics = computed<BusinessWorkspaceMetric[]>(() => [
    {
      label: '事故快报',
      value: overview.total,
      description: '当前租户全部记录',
      icon: 'ri:file-warning-line'
    },
    {
      label: '本月新增',
      value: overview.currentMonth,
      description: '本月发生事故',
      icon: 'ri:calendar-event-line'
    },
    {
      label: '较大及以上',
      value: overview.highSeverity,
      description: '需重点跟踪处置',
      icon: 'ri:alarm-warning-line',
      tone: 'danger'
    },
    {
      label: '涉及人员',
      value: overview.affectedPeople,
      description: '已登记人员人次',
      icon: 'ri:group-line',
      tone: 'warning'
    }
  ])
  const searchItems = computed<SearchFormItem[]>(() => [
    {
      label: '关键字',
      key: 'keyword',
      type: 'input',
      props: { clearable: true, placeholder: '事故编号、名称或地点' }
    },
    {
      label: '事故级别',
      key: 'accidentLevel',
      type: 'select',
      props: { options: dictOptions('smisAccidentLevel'), clearable: true, placeholder: '全部级别' }
    },
    {
      label: '事故类别',
      key: 'accidentCategory',
      type: 'select',
      props: {
        options: dictOptions('smisAccidentCategory'),
        clearable: true,
        filterable: true,
        placeholder: '全部类别'
      }
    },
    {
      label: '事故时间',
      key: 'accidentTimeRange',
      type: 'date',
      props: {
        type: 'daterange',
        valueFormat: 'YYYY-MM-DD',
        startPlaceholder: '开始日期',
        endPlaceholder: '结束日期',
        clearable: true
      }
    }
  ])
  const openDialog = (row?: SmisAccidentReport): void => {
    void dialogRef.value?.handleOpen({
      row,
      organizations: organizations.value,
      currentEmployee: currentEmployee.value
    })
  }
  const handleDelete = async (row: SmisAccidentReport): Promise<void> => {
    try {
      await confirmDelete(`确定删除事故快报“${row.accidentName}”吗？`)
      await deleteAccidentReports([row.id])
      await tableRef.value?.refreshRemove()
    } catch {
      /* 用户取消或服务端校验失败 */
    }
  }
  const categorySummary = (row: SmisAccidentReport): string =>
    row.accidentCategories.map((value) => dictLabel('smisAccidentCategory', value)).join('、') ||
    '—'
  const columnsFactory = (): ColumnOption<SmisAccidentReport>[] => [
    { type: 'selection', width: 48 },
    { type: 'globalIndex', label: '序号', width: 68 },
    {
      prop: 'accidentName',
      label: '事故信息',
      minWidth: 250,
      fixed: 'left',
      formatter: (row) => (
        <div class="accident-page__identity">
          <span
            class={{
              'is-critical': ['major', 'severe', 'catastrophic'].includes(row.accidentLevel)
            }}
          >
            <ArtSvgIcon icon="ri:alarm-warning-line" />
          </span>
          <span>
            <strong title={row.accidentName}>{row.accidentName}</strong>
            <small>{row.accidentNo}</small>
          </span>
        </div>
      )
    },
    {
      prop: 'accidentTime',
      label: '事故时间',
      width: 158,
      formatter: (row) => dayjs(row.accidentTime).format('YYYY-MM-DD HH:mm')
    },
    { prop: 'accidentLocation', label: '事故地点', minWidth: 180, showOverflowTooltip: true },
    {
      prop: 'accidentCategories',
      label: '事故类别',
      minWidth: 180,
      showOverflowTooltip: true,
      formatter: categorySummary
    },
    {
      prop: 'accidentLevel',
      label: '事故级别',
      width: 112,
      align: 'center',
      formatter: (row) => (
        <ArtDictDisplay dictCode="smisAccidentLevel" value={row.accidentLevel} display="tag" />
      )
    },
    {
      prop: 'operationAreaOrganizationName',
      label: '发生作业区',
      minWidth: 150,
      showOverflowTooltip: true,
      formatter: (row) => row.operationAreaOrganizationName || '未选择'
    },
    {
      prop: 'reporterEmployee',
      label: '上报人',
      width: 112,
      formatter: (row) => row.reporterEmployee?.employeeName || '—'
    },
    {
      prop: 'people',
      label: '涉及人员',
      width: 96,
      align: 'center',
      formatter: (row) => `${row.people.length} 人`
    },
    {
      prop: 'indirectEconomicLoss',
      label: '间接损失',
      width: 112,
      align: 'right',
      formatter: (row) => `${Number(row.indirectEconomicLoss || 0).toFixed(2)} 万元`
    },
    {
      prop: 'updateTime',
      label: '更新时间',
      width: 158,
      formatter: (row) => (row.updateTime ? dayjs(row.updateTime).format('YYYY-MM-DD HH:mm') : '—')
    },
    {
      prop: 'operation',
      label: '操作',
      width: 112,
      fixed: 'right',
      formatter: (row) => (
        <div>
          <ArtButtonTable
            type="edit"
            permission="SmisAccidentFlashReport:Edit"
            onClick={() => openDialog(row)}
          />
          <ArtButtonTable
            type="delete"
            permission="SmisAccidentFlashReport:Delete"
            onClick={() => void handleDelete(row)}
          />
        </div>
      )
    }
  ]
  const excelColumns: ArtTableQueryExcelColumn[] = [
    { key: 'accidentNo', title: '事故编号' },
    { key: 'accidentName', title: '事故名称' },
    { key: 'reporterName', title: '上报人' },
    { key: 'accidentTime', title: '事故时间' },
    { key: 'accidentLocation', title: '事故地点' },
    { key: 'accidentCategories', title: '事故类别' },
    { key: 'operationAreaOrganizationName', title: '事故发生作业区' },
    { key: 'accidentLevel', title: '事故级别' },
    { key: 'indirectEconomicLoss', title: '间接经济损失（万元）' },
    { key: 'causeAnalysis', title: '原因分析' },
    { key: 'resultDetermination', title: '结果判定' },
    { key: 'peopleCount', title: '涉及人员数' }
  ]
  const toApiParams = (params: AccidentSearchModel): SmisAccidentReportSearchParams => {
    const { accidentTimeRange, ...rest } = params
    return {
      ...rest,
      startTime: accidentTimeRange?.[0] ? `${accidentTimeRange[0]} 00:00:00` : undefined,
      endTime: accidentTimeRange?.[1] ? `${accidentTimeRange[1]} 23:59:59` : undefined
    }
  }
  const headerActions = computed<ArtTableQueryHeaderAction[]>(() => [
    {
      permission: 'SmisAccidentFlashReport:Add',
      type: 'add',
      label: '新增事故快报',
      onClick: () => openDialog()
    },
    {
      permission: 'SmisAccidentFlashReport:Export',
      type: 'export',
      label: '导出',
      exportFilename: '事故快报',
      exportSheetName: '事故快报',
      exportColumns: excelColumns,
      exportApi: async ({ selectedIds, maxRows }) => {
        const rows = (
          await fetchAccidentReportList({
            ...toApiParams(searchQuery.value),
            ids: selectedIds?.map(String),
            from: 0,
            to: maxRows - 1
          })
        ).data
        return {
          data: rows.map((row) => ({
            accidentNo: row.accidentNo,
            accidentName: row.accidentName,
            reporterName: row.reporterEmployee?.employeeName || '',
            accidentTime: dayjs(row.accidentTime).format('YYYY-MM-DD HH:mm:ss'),
            accidentLocation: row.accidentLocation,
            accidentCategories: categorySummary(row),
            operationAreaOrganizationName: row.operationAreaOrganizationName || '',
            accidentLevel: dictLabel('smisAccidentLevel', row.accidentLevel),
            indirectEconomicLoss: Number(row.indirectEconomicLoss || 0),
            causeAnalysis: row.causeAnalysis || '',
            resultDetermination: row.resultDetermination || '',
            peopleCount: row.people.length
          }))
        }
      }
    },
    {
      permission: 'SmisAccidentFlashReport:Delete',
      type: 'delete',
      content: ({ selectedCount }: ArtTableQueryHeaderActionContext) =>
        `确定删除选中的 ${selectedCount} 条事故快报吗？关联工伤申报的事故不可删除。`,
      onClick: async ({ selectedRows, api }) => {
        await deleteAccidentReports(selectedRows.map((row) => String(row.id)))
        await api.refreshRemove()
      }
    }
  ])
  const fetchTableData = async (params: TableParams) => {
    const { current, size, ...filters } = params
    const { from, to } = pageInfoHandler({ current, size })
    const result = await fetchAccidentReportList({ ...toApiParams(filters), from, to })
    Object.assign(overview, result.overview)
    organizations.value = result.organizations
    currentEmployee.value = result.currentEmployee
    return result
  }
  const handleSaveSuccess = (type: 'add' | 'edit'): void => {
    void (type === 'add' ? tableRef.value?.refreshCreate() : tableRef.value?.refreshUpdate())
  }
  onMounted(async () => {
    await Promise.all(
      ['smisAccidentCategory', 'smisAccidentLevel'].map((code) => userStore.ensureDictLoaded(code))
    )
  })
</script>

<style scoped lang="scss">
  .accident-page {
    gap: 12px;
    min-width: 0;

    &__risk-strip {
      display: flex;
      gap: 10px;
      align-items: center;
      padding: 9px 14px;
      color: var(--el-text-color-regular);
      background: color-mix(in srgb, var(--el-color-warning) 7%, var(--el-bg-color));
      border-left: 3px solid var(--el-color-warning);
      border-radius: var(--el-border-radius-base);

      > span {
        display: grid;
        flex: 0 0 30px;
        place-items: center;
        width: 30px;
        height: 30px;
        color: var(--el-color-warning-dark-2);
        background: var(--el-bg-color);
        border-radius: 50%;
      }

      p {
        margin: 0;
        font-size: 12px;
      }

      strong {
        margin-right: 8px;
        font-size: 13px;
        color: var(--el-text-color-primary);
      }
    }

    &__table {
      flex: 1;
      min-width: 0;
      min-height: 0;
    }

    :deep(.accident-page__identity) {
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
        color: var(--el-color-warning-dark-2);
        background: var(--el-color-warning-light-9);
        border-radius: var(--el-border-radius-base);
      }

      > span:first-child.is-critical {
        color: var(--el-color-danger);
        background: var(--el-color-danger-light-9);
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
        font-family: var(--art-font-family-mono, Consolas, monospace);
        font-size: 11px;
        color: var(--el-text-color-secondary);
      }
    }

    @media (width <= 720px) {
      &__risk-strip {
        align-items: flex-start;
      }

      &__risk-strip strong {
        display: block;
        margin-bottom: 2px;
      }
    }
  }
</style>
