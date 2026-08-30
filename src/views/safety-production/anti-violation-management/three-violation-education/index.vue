<template>
  <ArtPermissionGuard
    permission="SmisThreeViolationEducation:View"
    resource-name="三违人员教育信息"
  >
    <div class="three-violation-page business-workspace-page art-full-height">
      <BusinessWorkspaceHeader
        eyebrow="THREE-VIOLATION EDUCATION"
        title="三违人员教育信息"
        description="从检查发现到教育完成，统一管理三违人员、责任人、教育过程与台账证据。"
        icon="ri:user-warning-line"
        :tags="[
          { label: '员工花名册联动', type: 'primary', effect: 'plain' },
          { label: '待教育闭环', type: 'warning', effect: 'light' },
          { label: '安全教育台账', type: 'success', effect: 'plain' }
        ]"
        :metrics="workspaceMetrics"
      >
        <template #actions><BusinessTableWorkspaceActions :table="tableQueryRef" /></template>
      </BusinessWorkspaceHeader>

      <ArtTableQuery
        ref="tableQueryRef"
        v-model="searchQuery"
        class="three-violation-page__table"
        :api-fn="fetchTableData"
        :search-items="searchItems"
        :columns-factory="columnsFactory"
        :header-actions="headerActions"
        header-actions-placement="workspace"
        :search-bar-props="{ span: 6, labelWidth: 82, showExpand: true, defaultExpanded: true }"
        :table-props="{
          rowKey: 'id',
          tableLayout: 'fixed',
          emptyText: '暂无三违人员教育记录',
          emptyDescription: '新增检查发现后，可继续记录教育过程并打印安全教育台账。'
        }"
        focusable
      >
        <template #search-checkerEmployeeId="{ value, setValue }">
          <ArtEmployeeSelect
            :model-value="value"
            :selected-data="checkerSearchSelection"
            title="选择检查人"
            subtitle="数据来自当前租户员工花名册"
            placeholder="请选择检查人"
            @update:model-value="setValue"
            @update:selected-data="checkerSearchSelection = $event"
          />
        </template>
      </ArtTableQuery>

      <ThreeViolationDialog ref="dialogRef" @success="handleSaveSuccess" />
      <EducationRecordDialog ref="recordDialogRef" @success="handleSaveSuccess" />
    </div>
  </ArtPermissionGuard>
</template>

<script setup lang="tsx">
  import dayjs from 'dayjs'
  import { ElAvatar } from 'element-plus'
  import type { EmployeeIntegrationItem } from '@/api/integration/employees'
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
  import ArtButtonMore, {
    type ButtonMoreItem
  } from '@/components/core/forms/art-button-more/index.vue'
  import ArtEmployeeSelect from '@/components/business/art-employee-select/index.vue'
  import ArtDictDisplay from '@/components/core/base/art-dict-display/index.vue'
  import ArtPermissionGuard from '@/components/core/feedback/art-permission-guard/index.vue'
  import BusinessTableWorkspaceActions from '@/components/business/business-table-workspace-actions/index.vue'
  import BusinessWorkspaceHeader, {
    type BusinessWorkspaceMetric
  } from '@/components/business/business-workspace-header/index.vue'
  import {
    deleteThreeViolationEducation,
    fetchThreeViolationEducationList,
    type SmisAntiViolationOrganization,
    type SmisAntiViolationStandardOption,
    type SmisThreeViolationEducation,
    type SmisThreeViolationEducationOverview,
    type SmisThreeViolationEducationSearchParams
  } from '@smis/api'
  import ThreeViolationDialog, {
    type ThreeViolationDialogMode,
    type ThreeViolationDialogOpenData
  } from './modules/three-violation-dialog.vue'
  import EducationRecordDialog from './modules/education-record-dialog.vue'

  defineOptions({ name: 'SmisThreeViolationEducation' })

  type TableParams = SmisThreeViolationEducationSearchParams &
    Pick<Api.Common.PaginationParams, 'current' | 'size'>
  interface DialogExpose {
    handleOpen: (data: ThreeViolationDialogOpenData) => Promise<void>
  }
  interface RecordDialogExpose {
    handleOpen: (row: SmisThreeViolationEducation) => Promise<void>
  }

  const { confirmDelete } = useArtFeedback()
  const userStore = useUserStore()
  const { getDictMap } = storeToRefs(userStore)
  const tableQueryRef = ref<ArtTableQueryExpose>()
  const dialogRef = ref<DialogExpose>()
  const recordDialogRef = ref<RecordDialogExpose>()
  const checkerSearchSelection = ref<EmployeeIntegrationItem[]>([])
  const searchQuery = reactive<SmisThreeViolationEducationSearchParams>({})
  const organizations = shallowRef<SmisAntiViolationOrganization[]>([])
  const standards = shallowRef<SmisAntiViolationStandardOption[]>([])
  const overview = reactive<SmisThreeViolationEducationOverview>({
    total: 0,
    pending: 0,
    educated: 0,
    warning: 0
  })

  const educationStatusOptions = computed(() =>
    (getDictMap.value.smisThreeViolationEducationStatus ?? []).map((item) => ({
      label: item.label || item.name,
      value: item.value
    }))
  )
  const warningStatusOptions = computed(() =>
    (getDictMap.value.smisThreeViolationWarningStatus ?? []).map((item) => ({
      label: item.label || item.name,
      value: item.value
    }))
  )
  const workspaceMetrics = computed<BusinessWorkspaceMetric[]>(() => [
    {
      label: '教育记录',
      value: overview.total,
      description: '当前筛选范围',
      icon: 'ri:file-list-3-line'
    },
    {
      label: '待教育',
      value: overview.pending,
      description: '需要推进闭环',
      icon: 'ri:time-line',
      tone: 'warning'
    },
    {
      label: '已教育',
      value: overview.educated,
      description: '台账证据已记录',
      icon: 'ri:checkbox-circle-line',
      tone: 'success'
    },
    {
      label: '预警人员',
      value: overview.warning,
      description: '需重点关注',
      icon: 'ri:alarm-warning-line',
      tone: 'danger'
    }
  ])

  const searchItems = computed<SearchFormItem[]>(() => [
    {
      label: '所属公司',
      key: 'organizationId',
      type: 'treeSelect',
      props: {
        data: organizations.value,
        nodeKey: 'id',
        checkStrictly: true,
        clearable: true,
        defaultExpandAll: true,
        props: { label: 'name', value: 'id', children: 'children' },
        placeholder: '全部公司与组织'
      }
    },
    { label: '检查人', key: 'checkerEmployeeId' },
    {
      label: '教育状态',
      key: 'educationStatus',
      type: 'select',
      options: educationStatusOptions.value,
      props: { clearable: true, placeholder: '全部状态' }
    },
    {
      label: '检查时间',
      key: 'inspectionTimeRange',
      type: 'date',
      span: 12,
      props: {
        type: 'daterange',
        valueFormat: 'YYYY-MM-DD',
        startPlaceholder: '开始日期',
        endPlaceholder: '结束日期',
        rangeSeparator: '至',
        clearable: true,
        class: '!w-full'
      }
    },
    {
      label: '预警状态',
      key: 'warningStatus',
      type: 'select',
      options: warningStatusOptions.value,
      props: { clearable: true, placeholder: '全部预警状态' }
    },
    {
      label: '关键字',
      key: 'keyword',
      type: 'input',
      props: { clearable: true, placeholder: '姓名、工号、问题或标准' }
    }
  ])

  const excelColumns: ArtTableQueryExcelColumn[] = [
    { key: 'employeeNo', title: '被检查人工号' },
    { key: 'employeeName', title: '被检查人' },
    { key: 'gender', title: '性别' },
    { key: 'age', title: '年龄' },
    { key: 'organizationName', title: '所属公司/组织' },
    { key: 'positionName', title: '岗位' },
    { key: 'checkerName', title: '检查人' },
    { key: 'inspectionTimeText', title: '检查时间' },
    { key: 'warningStatusText', title: '预警状态' },
    { key: 'educationStatusText', title: '教育状态' },
    { key: 'categoryName', title: '违章分类' },
    { key: 'standardName', title: '反违章标准' },
    { key: 'violationDescription', title: '三违问题描述' },
    { key: 'responsibleNames', title: '教育负责人' },
    { key: 'plannedEducationContent', title: '拟教育内容' },
    { key: 'educationContent', title: '教育培训内容' },
    { key: 'educationResult', title: '教育培训结果' },
    { key: 'educationCompletedAtText', title: '教育完成时间' },
    { key: 'trainingHours', title: '培训课时' },
    { key: 'examScore', title: '考核分数' },
    { key: 'remark', title: '备注' }
  ]

  const openDialog = (mode: ThreeViolationDialogMode, row?: SmisThreeViolationEducation): void => {
    void dialogRef.value?.handleOpen({ mode, row, standards: standards.value })
  }

  const formatEducationRows = (rows: SmisThreeViolationEducation[]) =>
    rows.map((row) => ({
      ...row,
      inspectionTimeText: dayjs(row.inspectionTime).format('YYYY-MM-DD HH:mm'),
      warningStatusText: row.warningStatus === 'warning' ? '预警' : '正常',
      educationStatusText: row.educationStatus === 'educated' ? '已教育' : '待教育',
      responsibleNames: row.responsibleEmployees.map((item) => item.employeeName).join('、'),
      educationCompletedAtText: row.educationCompletedAt
        ? dayjs(row.educationCompletedAt).format('YYYY-MM-DD HH:mm')
        : ''
    }))

  const escapeHtml = (value: unknown): string =>
    String(value ?? '—')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;')

  const printLedger = (row: SmisThreeViolationEducation): void => {
    const popup = window.open('', '_blank', 'noopener,noreferrer,width=980,height=820')
    if (!popup) {
      ElMessage.warning('浏览器阻止了打印窗口，请允许弹窗后重试')
      return
    }
    const responsibleNames = row.responsibleEmployees.map((item) => item.employeeName).join('、')
    const date = dayjs(row.educationCompletedAt || row.inspectionTime)
    popup.document.write(
      `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>安全教育台账-${escapeHtml(row.employeeName)}</title><style>@page{size:A4 portrait;margin:14mm}*{box-sizing:border-box}body{font:14px/1.65 "Microsoft YaHei",sans-serif;color:#111;margin:0}h1{text-align:center;font-size:24px;letter-spacing:4px;margin:0 0 2px}.date{text-align:right;margin:0 4px 8px}table{width:100%;border-collapse:collapse;table-layout:fixed}th,td{border:1px solid #111;padding:7px 8px;vertical-align:top;word-break:break-word}th{width:110px;text-align:center;font-weight:600;background:#f7f7f7}.section{height:205px}.section strong{display:block;margin-bottom:10px}.signature{height:74px}.muted{color:#666}.footer{display:flex;justify-content:space-between;margin-top:20px}@media print{th{background:#fff}}</style></head><body><h1>安全教育台账</h1><div class="date">${date.format('YYYY 年 MM 月 DD 日')}</div><table><tr><th>受教育人姓名</th><td>${escapeHtml(row.employeeName)}</td><th>员工工号</th><td>${escapeHtml(row.employeeNo)}</td><th>性别 / 年龄</th><td>${escapeHtml(row.gender || '—')} / ${escapeHtml(row.age ?? '—')}</td></tr><tr><th>教育类型</th><td colspan="2">三违人员教育</td><th>组织岗位</th><td colspan="2">${escapeHtml([row.organizationName, row.positionName].filter(Boolean).join(' · '))}</td></tr><tr><th>违章分类</th><td colspan="2">${escapeHtml(row.categoryName || '未关联')}</td><th>考核分数</th><td colspan="2">${escapeHtml(row.examScore ?? '—')}</td></tr><tr><td class="section" colspan="6"><strong>三违问题及教育培训内容：</strong><div>${escapeHtml(row.violationDescription)}</div><br><div>${escapeHtml(row.educationContent || row.plannedEducationContent || '待记录')}</div></td></tr><tr><td class="section" colspan="6"><strong>教育培训结果：</strong><div>${escapeHtml(row.educationResult || '待记录')}</div></td></tr><tr><th>教育负责人</th><td colspan="2">${escapeHtml(responsibleNames || '—')}</td><th>培训课时</th><td colspan="2">${escapeHtml(row.trainingHours ?? '—')}</td></tr><tr><th>领导检查意见</th><td class="signature" colspan="5"></td></tr></table><div class="footer"><span>受教育人签字：____________</span><span>教育负责人签字：____________</span></div><script>window.onload=()=>window.print()<${'/script'}></body></html>`
    )
    popup.document.close()
  }

  const headerActions = computed<ArtTableQueryHeaderAction[]>(() => [
    {
      permission: 'SmisThreeViolationEducation:Add',
      type: 'add',
      label: '新增',
      onClick: () => openDialog('add')
    },
    {
      permission: 'SmisThreeViolationEducation:Copy',
      key: 'copy',
      label: '复制并新增',
      icon: 'ri:file-copy-line',
      selectionRequired: true,
      disabled: ({ selectedRows }) => selectedRows.length !== 1,
      onClick: ({ selectedRows }) =>
        openDialog('copy', selectedRows[0] as SmisThreeViolationEducation)
    },
    {
      permission: 'SmisThreeViolationEducation:Edit',
      key: 'edit',
      label: '编辑',
      icon: 'ri:edit-line',
      selectionRequired: true,
      disabled: ({ selectedRows }) =>
        selectedRows.length !== 1 || selectedRows[0]?.educationStatus !== 'pending',
      onClick: ({ selectedRows }) =>
        openDialog('edit', selectedRows[0] as SmisThreeViolationEducation)
    },
    {
      permission: 'SmisThreeViolationEducation:Delete',
      type: 'delete',
      content: ({ selectedCount }: ArtTableQueryHeaderActionContext) =>
        `确定删除选中的 ${selectedCount} 条待教育记录吗？已完成教育的台账不可删除。`,
      disabled: ({ selectedRows }) =>
        !selectedRows.length || selectedRows.some((row) => row.educationStatus !== 'pending'),
      onClick: async ({ selectedRows, api }) => {
        await deleteThreeViolationEducation(selectedRows.map((row) => String(row.id)))
        await api.refreshRemove()
      }
    },
    {
      permission: 'SmisThreeViolationEducation:RecordEducation',
      key: 'recordEducation',
      label: '记录教育信息',
      icon: 'ri:graduation-cap-line',
      selectionRequired: true,
      disabled: ({ selectedRows }) => selectedRows.length !== 1,
      onClick: ({ selectedRows }) =>
        void recordDialogRef.value?.handleOpen(selectedRows[0] as SmisThreeViolationEducation)
    },
    {
      permission: 'SmisThreeViolationEducation:Print',
      key: 'print',
      label: '打印安全教育台账',
      icon: 'ri:printer-line',
      selectionRequired: true,
      disabled: ({ selectedRows }) => selectedRows.length !== 1,
      onClick: ({ selectedRows }) => printLedger(selectedRows[0] as SmisThreeViolationEducation)
    },
    {
      permission: 'SmisThreeViolationEducation:Export',
      type: 'export',
      label: '导出',
      exportFilename: '三违人员教育信息',
      exportSheetName: '三违人员教育台账',
      exportColumns: excelColumns,
      exportApi: async ({ maxRows }) => ({
        data: formatEducationRows(
          (
            await fetchThreeViolationEducationList({
              ...searchQuery,
              purpose: 'export',
              from: 0,
              to: maxRows - 1
            })
          ).data
        )
      })
    }
  ])

  const columnsFactory = (): ColumnOption<SmisThreeViolationEducation>[] => [
    { type: 'selection', width: 48 },
    { type: 'globalIndex', label: '序号', width: 68 },
    {
      prop: 'employeeName',
      label: '被检查人',
      minWidth: 210,
      fixed: 'left',
      formatter: (row) => (
        <div class="three-violation-page__employee">
          <ElAvatar size={38} src={row.avatarUrl || undefined}>
            {row.employeeName.slice(-1)}
          </ElAvatar>
          <div>
            <strong>{row.employeeName}</strong>
            <small>{[row.employeeNo, row.positionName].filter(Boolean).join(' · ')}</small>
          </div>
        </div>
      )
    },
    { prop: 'organizationName', label: '所属公司/组织', minWidth: 190, showOverflowTooltip: true },
    {
      prop: 'warningStatus',
      label: '预警状态',
      width: 106,
      align: 'center',
      formatter: (row) => (
        <ArtDictDisplay
          dictCode="smisThreeViolationWarningStatus"
          value={row.warningStatus}
          display="tag"
        />
      )
    },
    {
      prop: 'educationStatus',
      label: '教育状态',
      width: 106,
      align: 'center',
      formatter: (row) => (
        <ArtDictDisplay
          dictCode="smisThreeViolationEducationStatus"
          value={row.educationStatus}
          display="tag"
        />
      )
    },
    { prop: 'checkerName', label: '检查人', width: 118, showOverflowTooltip: true },
    {
      prop: 'inspectionTime',
      label: '检查时间',
      width: 162,
      formatter: (row) => dayjs(row.inspectionTime).format('YYYY-MM-DD HH:mm')
    },
    { prop: 'categoryName', label: '违章分类', minWidth: 150, showOverflowTooltip: true },
    { prop: 'standardName', label: '反违章标准', minWidth: 220, showOverflowTooltip: true },
    {
      prop: 'violationDescription',
      label: '三违问题描述',
      minWidth: 300,
      showOverflowTooltip: true
    },
    {
      prop: 'responsibleEmployees',
      label: '教育负责人',
      minWidth: 160,
      showOverflowTooltip: true,
      formatter: (row) =>
        row.responsibleEmployees.map((item) => item.employeeName).join('、') || '—'
    },
    {
      prop: 'educationCompletedAt',
      label: '教育完成时间',
      width: 162,
      formatter: (row) =>
        row.educationCompletedAt
          ? dayjs(row.educationCompletedAt).format('YYYY-MM-DD HH:mm')
          : '待完成'
    },
    {
      prop: 'operation',
      label: '操作',
      width: 196,
      fixed: 'right',
      formatter: (row) => (
        <div class="three-violation-page__actions">
          <ArtButtonTable
            permission="SmisThreeViolationEducation:RecordEducation"
            icon="ri:graduation-cap-line"
            label={row.educationStatus === 'educated' ? '补充教育' : '记录教育'}
            onClick={() => void recordDialogRef.value?.handleOpen(row)}
          />
          <ArtButtonTable
            permission="SmisThreeViolationEducation:Edit"
            type="edit"
            disabled={row.educationStatus !== 'pending'}
            onClick={() => openDialog('edit', row)}
          />
          <ArtButtonMore
            list={[
              {
                key: 'copy',
                label: '复制并新增',
                icon: 'ri:file-copy-line',
                auth: 'SmisThreeViolationEducation:Copy'
              },
              {
                key: 'print',
                label: '打印安全教育台账',
                icon: 'ri:printer-line',
                auth: 'SmisThreeViolationEducation:Print'
              },
              {
                key: 'delete',
                label: '删除',
                icon: 'ri:delete-bin-line',
                color: 'var(--el-color-danger)',
                disabled: row.educationStatus !== 'pending',
                auth: 'SmisThreeViolationEducation:Delete'
              }
            ]}
            onClick={(item: ButtonMoreItem) => void handleMoreAction(item, row)}
          />
        </div>
      )
    }
  ]

  const fetchTableData = async (params: TableParams) => {
    const result = await fetchThreeViolationEducationList({
      ...params,
      ...pageInfoHandler(params)
    })
    organizations.value = result.organizations
    standards.value = result.standards
    Object.assign(overview, result.overview)
    return { records: result.data, total: result.total }
  }

  const handleMoreAction = async (
    item: ButtonMoreItem,
    row: SmisThreeViolationEducation
  ): Promise<void> => {
    if (item.key === 'copy') openDialog('copy', row)
    if (item.key === 'print') printLedger(row)
    if (item.key !== 'delete') return
    try {
      await confirmDelete(`确定删除“${row.employeeName}”的待教育记录吗？`)
      await deleteThreeViolationEducation([row.id])
      await tableQueryRef.value?.refreshRemove()
    } catch {
      /* 用户取消 */
    }
  }

  const handleSaveSuccess = (): void => void tableQueryRef.value?.getData()

  watch(
    () => searchQuery.checkerEmployeeId,
    (value) => {
      if (!value) checkerSearchSelection.value = []
    }
  )

  onMounted(
    () =>
      void Promise.all([
        userStore.ensureDictLoaded('smisThreeViolationWarningStatus'),
        userStore.ensureDictLoaded('smisThreeViolationEducationStatus')
      ])
  )
</script>

<style scoped lang="scss">
  .three-violation-page {
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-height: 0;

    &__table {
      flex: 1;
      min-height: 0;
    }

    :deep(.three-violation-page__employee) {
      display: flex;
      gap: 10px;
      align-items: center;
      min-width: 0;

      > div {
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

    :deep(.three-violation-page__actions) {
      display: flex;
      gap: 4px;
      align-items: center;
    }
  }
</style>
