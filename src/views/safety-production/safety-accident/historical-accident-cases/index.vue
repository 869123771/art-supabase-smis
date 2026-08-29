<template>
  <ArtPermissionGuard permission="SmisHistoricalAccidentCases:View">
    <div class="historical-case-page business-workspace-page art-full-height">
      <BusinessWorkspaceHeader
        eyebrow="SAFETY KNOWLEDGE"
        title="历史事故案例"
        description="统一沉淀事故经过、分类、组织范围和防范经验，让历史教训可检索、可复用。"
        icon="ri:book-open-line"
        :tags="[
          { label: '事故类别多选', type: 'primary', effect: 'plain' },
          { label: '组织数据联动', type: 'success', effect: 'light' },
          { label: '案例知识沉淀', type: 'warning', effect: 'plain' }
        ]"
        :metrics="metrics"
      >
        <template #actions><BusinessTableWorkspaceActions :table="tableRef" /></template>
      </BusinessWorkspaceHeader>

      <div class="historical-case-page__knowledge-strip" role="note">
        <span aria-hidden="true"><ArtSvgIcon icon="ri:lightbulb-flash-line" /></span>
        <p>
          <strong>案例质量提示</strong>
          事故类别、级别和发生日期决定检索精度；正文应包含事故经过、原因、处置与防范建议。
        </p>
      </div>

      <ArtTableQuery
        ref="tableRef"
        v-model="searchQuery"
        class="historical-case-page__table"
        :api-fn="fetchTableData"
        :search-items="searchItems"
        :columns-factory="columnsFactory"
        :header-actions="headerActions"
        header-actions-placement="workspace"
        :search-bar-props="{ span: 8, labelWidth: 76, showExpand: false }"
        :table-props="{
          rowKey: 'id',
          tableLayout: 'fixed',
          emptyText: '暂无历史事故案例',
          emptyDescription: '可点击新增，沉淀第一条可复用的事故经验。'
        }"
        focusable
      />

      <HistoricalAccidentCaseDialog ref="dialogRef" @success="handleSaveSuccess" />
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
    deleteHistoricalAccidentCases,
    fetchHistoricalAccidentCaseList,
    type SmisHistoricalAccidentCase,
    type SmisHistoricalAccidentCaseSearchParams,
    type SmisTreeOrganization
  } from '@smis/api'
  import HistoricalAccidentCaseDialog, {
    type HistoricalAccidentCaseDialogOpenData
  } from './modules/historical-accident-case-dialog.vue'

  defineOptions({ name: 'SmisHistoricalAccidentCases' })
  interface HistoricalCaseSearchModel extends SmisHistoricalAccidentCaseSearchParams {
    occurrenceDateRange?: [string, string]
  }
  type TableParams = HistoricalCaseSearchModel &
    Pick<Api.Common.PaginationParams, 'current' | 'size'>
  interface DialogExpose {
    handleOpen: (data: HistoricalAccidentCaseDialogOpenData) => Promise<void>
  }

  const userStore = useUserStore()
  const { getDictMap } = storeToRefs(userStore)
  const { confirmDelete } = useArtFeedback()
  const tableRef = ref<ArtTableQueryExpose>()
  const dialogRef = ref<DialogExpose>()
  const searchQuery = ref<HistoricalCaseSearchModel>({})
  const organizations = shallowRef<SmisTreeOrganization[]>([])
  const overview = reactive({ total: 0, inUse: 0, currentYear: 0, highSeverity: 0 })
  const dictOptions = (code: string) =>
    (getDictMap.value[code] ?? []).map((item) => ({
      label: item.label || item.name,
      value: item.value
    }))
  const dictLabel = (code: string, value?: string | null): string =>
    (getDictMap.value[code] ?? []).find((item) => item.value === value)?.label || value || '未设置'

  const metrics = computed<BusinessWorkspaceMetric[]>(() => [
    {
      label: '案例总数',
      value: overview.total,
      description: '当前租户案例资产',
      icon: 'ri:archive-stack-line'
    },
    {
      label: '使用中',
      value: overview.inUse,
      description: '可用于安全教育',
      icon: 'ri:checkbox-circle-line',
      tone: 'success'
    },
    {
      label: '本年事故',
      value: overview.currentYear,
      description: '按发生日期统计',
      icon: 'ri:calendar-event-line',
      tone: 'primary'
    },
    {
      label: '较大及以上',
      value: overview.highSeverity,
      description: '重点警示案例',
      icon: 'ri:alarm-warning-line',
      tone: overview.highSeverity ? 'danger' : undefined
    }
  ])
  const searchItems = computed<SearchFormItem[]>(() => [
    {
      label: '事故名称',
      key: 'keyword',
      type: 'input',
      props: { clearable: true, placeholder: '请输入事故名称' }
    },
    {
      label: '事故级别',
      key: 'accidentLevel',
      type: 'select',
      props: { options: dictOptions('smisAccidentLevel'), clearable: true, placeholder: '全部级别' }
    },
    {
      label: '发生日期',
      key: 'occurrenceDateRange',
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
  const openDialog = (row?: SmisHistoricalAccidentCase): void => {
    void dialogRef.value?.handleOpen({ row, organizations: organizations.value })
  }
  const handleDelete = async (row: SmisHistoricalAccidentCase): Promise<void> => {
    try {
      await confirmDelete(`确定删除事故案例“${row.accidentName}”吗？删除后无法恢复。`)
      await deleteHistoricalAccidentCases([row.id])
      await tableRef.value?.refreshRemove()
    } catch {
      // 用户取消删除时保持当前列表状态。
    }
  }
  const categorySummary = (row: SmisHistoricalAccidentCase): string =>
    row.accidentCategories.map((value) => dictLabel('smisAccidentCategory', value)).join('、') ||
    '—'
  const columnsFactory = (): ColumnOption<SmisHistoricalAccidentCase>[] => [
    { type: 'selection', width: 48 },
    {
      prop: 'accidentName',
      label: '事故案例',
      minWidth: 260,
      fixed: 'left',
      formatter: (row) => (
        <div class="historical-case-page__identity">
          <span
            class={{
              'is-critical': ['major', 'severe', 'catastrophic'].includes(row.accidentLevel)
            }}
          >
            <ArtSvgIcon icon="ri:file-warning-line" />
          </span>
          <span>
            <strong title={row.accidentName}>{row.accidentName}</strong>
            <small title={row.summary || '暂无概述'}>{row.summary || '暂无案例概述'}</small>
          </span>
        </div>
      )
    },
    {
      prop: 'occurrenceDate',
      label: '发生日期',
      width: 120,
      formatter: (row) => dayjs(row.occurrenceDate).format('YYYY-MM-DD')
    },
    {
      prop: 'accidentCategories',
      label: '事故类别',
      minWidth: 220,
      showOverflowTooltip: true,
      formatter: categorySummary
    },
    {
      prop: 'accidentLevel',
      label: '事故级别',
      width: 112,
      formatter: (row) => (
        <ArtDictDisplay dictCode="smisAccidentLevel" value={row.accidentLevel} display="tag" />
      )
    },
    {
      prop: 'accidentOrganizationName',
      label: '事故单位',
      minWidth: 160,
      showOverflowTooltip: true,
      formatter: (row) => row.accidentOrganizationName || '—'
    },
    {
      prop: 'applicableCompanyName',
      label: '适用公司',
      minWidth: 160,
      showOverflowTooltip: true,
      formatter: (row) => row.applicableCompanyName || '—'
    },
    {
      prop: 'caseStatus',
      label: '案例状态',
      width: 110,
      formatter: (row) =>
        row.caseStatus ? (
          <ArtDictDisplay dictCode="smisAccidentCaseStatus" value={row.caseStatus} display="tag" />
        ) : (
          '—'
        )
    },
    {
      prop: 'createTime',
      label: '创建时间',
      width: 168,
      formatter: (row) => (row.createTime ? dayjs(row.createTime).format('YYYY-MM-DD HH:mm') : '—')
    },
    {
      prop: 'operation',
      label: '操作',
      width: 132,
      fixed: 'right',
      formatter: (row) => (
        <div class="flex gap-1">
          <ArtButtonTable
            type="edit"
            permission="SmisHistoricalAccidentCases:Edit"
            onClick={() => openDialog(row)}
          />
          <ArtButtonTable
            type="delete"
            permission="SmisHistoricalAccidentCases:Delete"
            onClick={() => void handleDelete(row)}
          />
        </div>
      )
    }
  ]
  const excelColumns: ArtTableQueryExcelColumn[] = [
    { key: 'accidentName', title: '事故名称' },
    { key: 'occurrenceDate', title: '发生日期' },
    { key: 'accidentCategories', title: '事故类别' },
    { key: 'accidentLevel', title: '事故级别' },
    { key: 'accidentOrganizationName', title: '事故单位' },
    { key: 'applicableCompanyName', title: '适用公司' },
    { key: 'caseStatus', title: '案例状态' },
    { key: 'summary', title: '案例概述' },
    { key: 'content', title: '案例正文' },
    { key: 'createTime', title: '创建时间' }
  ]
  const toApiParams = (
    params: HistoricalCaseSearchModel
  ): SmisHistoricalAccidentCaseSearchParams => {
    const { occurrenceDateRange, ...rest } = params
    return {
      ...rest,
      startDate: occurrenceDateRange?.[0],
      endDate: occurrenceDateRange?.[1]
    }
  }
  const headerActions = computed<ArtTableQueryHeaderAction[]>(() => [
    {
      permission: 'SmisHistoricalAccidentCases:Add',
      type: 'add',
      label: '新增事故案例',
      onClick: () => openDialog()
    },
    {
      permission: 'SmisHistoricalAccidentCases:Edit',
      label: '编辑',
      icon: 'ri:edit-line',
      selectionRequired: true,
      disabled: ({ selectedCount }) => selectedCount !== 1,
      onClick: ({ selectedRows }) => openDialog(selectedRows[0] as SmisHistoricalAccidentCase)
    },
    {
      permission: 'SmisHistoricalAccidentCases:Export',
      type: 'export',
      label: '导出',
      exportFilename: '历史事故案例',
      exportSheetName: '历史事故案例',
      exportColumns: excelColumns,
      exportApi: async ({ selectedIds, maxRows }) => {
        const rows = (
          await fetchHistoricalAccidentCaseList({
            ...toApiParams(searchQuery.value),
            ids: selectedIds?.map(String),
            from: 0,
            to: maxRows - 1
          })
        ).data
        return {
          data: rows.map((row) => ({
            accidentName: row.accidentName,
            occurrenceDate: dayjs(row.occurrenceDate).format('YYYY-MM-DD'),
            accidentCategories: categorySummary(row),
            accidentLevel: dictLabel('smisAccidentLevel', row.accidentLevel),
            accidentOrganizationName: row.accidentOrganizationName || '',
            applicableCompanyName: row.applicableCompanyName || '',
            caseStatus: dictLabel('smisAccidentCaseStatus', row.caseStatus),
            summary: row.summary || '',
            content: row.content,
            createTime: row.createTime ? dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss') : ''
          }))
        }
      }
    },
    {
      permission: 'SmisHistoricalAccidentCases:Delete',
      type: 'delete',
      content: ({ selectedCount }: ArtTableQueryHeaderActionContext) =>
        `确定删除选中的 ${selectedCount} 条事故案例吗？删除后无法恢复。`,
      onClick: async ({ selectedRows, api }) => {
        await deleteHistoricalAccidentCases(selectedRows.map((row) => String(row.id)))
        await api.refreshRemove()
      }
    }
  ])
  const fetchTableData = async (params: TableParams) => {
    const { current, size, ...filters } = params
    const { from, to } = pageInfoHandler({ current, size })
    const result = await fetchHistoricalAccidentCaseList({ ...toApiParams(filters), from, to })
    Object.assign(overview, result.overview)
    organizations.value = result.organizations
    return result
  }
  const handleSaveSuccess = (type: 'add' | 'edit'): void => {
    void (type === 'add' ? tableRef.value?.refreshCreate() : tableRef.value?.refreshUpdate())
  }

  onMounted(async () => {
    await Promise.all(
      ['smisAccidentCategory', 'smisAccidentLevel', 'smisAccidentCaseStatus'].map((code) =>
        userStore.ensureDictLoaded(code)
      )
    )
  })
</script>

<style scoped lang="scss">
  .historical-case-page {
    gap: 12px;
    min-width: 0;

    &__knowledge-strip {
      display: flex;
      gap: 10px;
      align-items: center;
      padding: 9px 14px;
      color: var(--el-text-color-regular);
      background: color-mix(in srgb, var(--theme-color) 6%, var(--el-bg-color));
      border-left: 3px solid var(--theme-color);
      border-radius: var(--el-border-radius-base);

      > span {
        display: grid;
        flex: 0 0 30px;
        place-items: center;
        width: 30px;
        height: 30px;
        color: var(--theme-color);
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

    :deep(.historical-case-page__identity) {
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
        background: color-mix(in srgb, var(--theme-color) 10%, transparent);
        border-radius: var(--el-border-radius-base);

        &.is-critical {
          color: var(--el-color-danger);
          background: var(--el-color-danger-light-9);
        }
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
        font-size: 11px;
        color: var(--el-text-color-secondary);
      }
    }

    @media (width <= 720px) {
      &__knowledge-strip {
        align-items: flex-start;
      }

      &__knowledge-strip strong {
        display: block;
        margin-bottom: 2px;
      }
    }
  }
</style>
