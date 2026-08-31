<template>
  <ArtPermissionGuard permission="SmisSafetyTrainingRecord:View">
    <div class="training-record-page business-workspace-page art-full-height">
      <BusinessWorkspaceHeader
        eyebrow="TRAINING EVIDENCE"
        title="安全培训记录"
        description="承接已发布计划，沉淀实际培训、逐人签到、考核结果与归档证据。"
        icon="ri:file-list-3-line"
        :tags="[
          { label: '计划自动带入', type: 'primary', effect: 'plain' },
          { label: '逐人签到', type: 'success', effect: 'light' },
          { label: '归档后锁定', type: 'warning', effect: 'plain' }
        ]"
        :metrics="metrics"
      >
        <template #actions><BusinessTableWorkspaceActions :table="tableRef" /></template>
      </BusinessWorkspaceHeader>
      <ArtTableQuery
        ref="tableRef"
        v-model="searchQuery"
        class="training-record-page__table"
        :api-fn="fetchTableData"
        :search-items="searchItems"
        :columns-factory="columnsFactory"
        :header-actions="headerActions"
        header-actions-placement="workspace"
        :search-bar-props="{ span: 6, labelWidth: 82, showExpand: false }"
        :table-props="{
          rowKey: 'id',
          tableLayout: 'fixed',
          emptyText: '暂无安全培训记录',
          emptyDescription: '请先发布培训计划，再从计划创建培训记录。'
        }"
        focusable
      />
      <TrainingRecordDialog ref="dialogRef" @success="handleSaveSuccess" />
    </div>
  </ArtPermissionGuard>
</template>

<script setup lang="tsx">
  import dayjs from 'dayjs'
  import { ElProgress } from 'element-plus'
  import type { SearchFormItem } from '@/components/core/forms/art-search-bar/index.vue'
  import type {
    ArtTableQueryExpose,
    ArtTableQueryExcelColumn,
    ArtTableQueryHeaderAction,
    ArtTableQueryHeaderActionContext
  } from '@/components/core/tables/art-table-query/index.vue'
  import type { ColumnOption } from '@/types'
  import { pageInfoHandler } from '@/utils/table/tableUtils'
  import { useArtFeedback } from '@/hooks/core/useArtFeedback'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import ArtDictDisplay from '@/components/core/base/art-dict-display/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import BusinessWorkspaceHeader, {
    type BusinessWorkspaceMetric
  } from '@/components/business/business-workspace-header/index.vue'
  import BusinessTableWorkspaceActions from '@/components/business/business-table-workspace-actions/index.vue'
  import {
    deleteSafetyTrainingRecords,
    fetchSafetyTrainingRecordList,
    type SmisSafetyTrainingOrganizationOption,
    type SmisSafetyTrainingPlanOption,
    type SmisSafetyTrainingRecord,
    type SmisSafetyTrainingRecordSearchParams
  } from '@smis/api'
  import TrainingRecordDialog, {
    type TrainingRecordDialogOpenData
  } from './modules/training-record-dialog.vue'
  import {
    trainingRecordStatusItem,
    trainingRecordStatusLabel,
    trainingRecordStatusOptions
  } from './modules/training-record-status'

  defineOptions({ name: 'SmisSafetyTrainingRecord' })
  type TableParams = SmisSafetyTrainingRecordSearchParams &
    Pick<Api.Common.PaginationParams, 'current' | 'size'>
  interface DialogExpose {
    handleOpen: (data: TrainingRecordDialogOpenData) => Promise<void>
  }

  const route = useRoute()
  const router = useRouter()
  const { confirmDelete } = useArtFeedback()
  const tableRef = ref<ArtTableQueryExpose>()
  const dialogRef = ref<DialogExpose>()
  const searchQuery = ref<SmisSafetyTrainingRecordSearchParams>({})
  const planOptions = shallowRef<SmisSafetyTrainingPlanOption[]>([])
  const organizations = shallowRef<SmisSafetyTrainingOrganizationOption[]>([])
  const pendingPlanId = ref(typeof route.query.planId === 'string' ? route.query.planId : '')
  const overview = reactive({
    total: 0,
    draft: 0,
    submitted: 0,
    participantCount: 0,
    presentCount: 0
  })
  const attendanceRate = computed(() =>
    overview.participantCount
      ? Math.round((overview.presentCount * 1000) / overview.participantCount) / 10
      : 0
  )
  const metrics = computed<BusinessWorkspaceMetric[]>(() => [
    {
      label: '培训记录',
      value: overview.total,
      description: '当前租户全部记录',
      icon: 'ri:file-list-3-line'
    },
    {
      label: '待提交',
      value: overview.draft,
      description: '可继续维护签到',
      icon: 'ri:draft-line',
      tone: 'warning'
    },
    {
      label: '已归档',
      value: overview.submitted,
      description: '已形成正式证据',
      icon: 'ri:shield-check-line',
      tone: 'success'
    },
    {
      label: '参训人次',
      value: overview.participantCount,
      description: '记录内人员总人次',
      icon: 'ri:team-line'
    },
    {
      label: '签到率',
      value: `${attendanceRate.value}%`,
      description: `${overview.presentCount} 人次已签到`,
      icon: 'ri:user-follow-line',
      tone: attendanceRate.value >= 90 ? 'success' : 'warning'
    }
  ])
  const searchItems = computed<SearchFormItem[]>(() => [
    {
      label: '关键字',
      key: 'keyword',
      type: 'input',
      props: { clearable: true, placeholder: '记录单号、计划编号或主题' }
    },
    {
      label: '记录状态',
      key: 'status',
      type: 'select',
      props: {
        options: trainingRecordStatusOptions,
        clearable: true,
        placeholder: '全部状态'
      }
    },
    {
      label: '组织单位',
      key: 'organizationId',
      type: 'treeSelect',
      props: {
        data: organizations.value,
        props: { label: 'organizationName', children: 'children' },
        nodeKey: 'id',
        valueKey: 'id',
        checkStrictly: true,
        clearable: true,
        filterable: true,
        defaultExpandAll: true,
        placeholder: '全部组织'
      }
    },
    {
      label: '实际时间',
      key: 'dateRange',
      type: 'date',
      props: {
        type: 'datetimerange',
        valueFormat: 'YYYY-MM-DDTHH:mm:ssZ',
        startPlaceholder: '开始时间',
        endPlaceholder: '结束时间',
        clearable: true
      }
    }
  ])
  const toPlanOption = (row: SmisSafetyTrainingRecord): SmisSafetyTrainingPlanOption => ({
    id: row.trainingPlanId,
    planNo: row.planNo,
    subject: row.subject,
    plannedStartAt: row.actualStartAt || row.createTime,
    plannedEndAt: row.actualEndAt || row.updateTime,
    location: row.location,
    instructorName: row.instructorName,
    trainingHours: row.trainingHours,
    content: row.trainingContent || '',
    assessmentMethod: row.assessmentMethod,
    participants: row.participants.map((participant) => ({
      employeeId: participant.employeeId,
      employeeNo: participant.employeeNo,
      employeeName: participant.employeeName,
      organizationId: participant.organizationId,
      organizationName: participant.organizationName,
      jobTitle: participant.jobTitle,
      phone: participant.phone
    }))
  })
  const openDialog = (
    row?: SmisSafetyTrainingRecord,
    readonly = false,
    presetPlanId?: string
  ): void => {
    const availablePlans = row
      ? [toPlanOption(row), ...planOptions.value.filter((item) => item.id !== row.trainingPlanId)]
      : planOptions.value
    void dialogRef.value?.handleOpen({ row, readonly, presetPlanId, planOptions: availablePlans })
  }
  const handleDelete = async (row: SmisSafetyTrainingRecord): Promise<void> => {
    try {
      await confirmDelete(`确定删除草稿记录“${row.recordNo}”吗？`)
      await deleteSafetyTrainingRecords([row.id])
      await tableRef.value?.refreshRemove()
    } catch {
      // 用户取消或服务端业务校验失败。
    }
  }
  const columnsFactory = (): ColumnOption<SmisSafetyTrainingRecord>[] => [
    { type: 'selection', width: 48 },
    { type: 'globalIndex', label: '序号', width: 68 },
    {
      prop: 'subject',
      label: '培训记录',
      minWidth: 260,
      fixed: 'left',
      formatter: (row) => (
        <div class="training-record-page__identity">
          <span>
            <ArtSvgIcon icon="ri:clipboard-check-line" />
          </span>
          <span>
            <strong title={row.subject}>{row.subject}</strong>
            <small>
              {row.recordNo} · {row.planNo}
            </small>
          </span>
        </div>
      )
    },
    {
      prop: 'actualStartAt',
      label: '实际培训时间',
      width: 220,
      formatter: (row) =>
        row.actualStartAt && row.actualEndAt
          ? `${dayjs(row.actualStartAt).format('MM-DD HH:mm')} 至 ${dayjs(row.actualEndAt).format('MM-DD HH:mm')}`
          : '待填写'
    },
    {
      prop: 'organizerOrganizationName',
      label: '组织单位',
      minWidth: 160,
      showOverflowTooltip: true
    },
    {
      prop: 'instructorName',
      label: '培训讲师',
      width: 110,
      formatter: (row) => row.instructorName || '待完善'
    },
    {
      prop: 'trainingHours',
      label: '学时',
      width: 76,
      align: 'center',
      formatter: (row) => `${row.trainingHours} h`
    },
    {
      prop: 'participantCount',
      label: '参训人数',
      width: 92,
      align: 'center',
      formatter: (row) => `${row.participantCount} 人`
    },
    {
      prop: 'attendanceRate',
      label: '签到完成度',
      width: 150,
      formatter: (row) => (
        <div class="training-record-page__attendance">
          <ElProgress percentage={row.attendanceRate} strokeWidth={7} showText={false} />
          <span>
            {row.presentCount}/{row.participantCount} · {row.attendanceRate}%
          </span>
        </div>
      )
    },
    {
      prop: 'status',
      label: '记录状态',
      width: 96,
      formatter: (row) => (
        <ArtDictDisplay item={trainingRecordStatusItem(row.status)} display="tag" />
      )
    },
    {
      prop: 'submittedAt',
      label: '归档时间',
      width: 158,
      formatter: (row) =>
        row.submittedAt ? dayjs(row.submittedAt).format('YYYY-MM-DD HH:mm') : '—'
    },
    {
      prop: 'operation',
      label: '操作',
      width: 154,
      fixed: 'right',
      formatter: (row) => (
        <div class="flex">
          <ArtButtonTable
            type="view"
            permission="SmisSafetyTrainingRecord:View"
            onClick={() => openDialog(row, true)}
          />
          <ArtButtonTable
            type="edit"
            permission="SmisSafetyTrainingRecord:Edit"
            disabled={row.status !== 'draft'}
            onClick={() => openDialog(row)}
          />
          <ArtButtonTable
            type="delete"
            permission="SmisSafetyTrainingRecord:Delete"
            disabled={row.status !== 'draft'}
            onClick={() => void handleDelete(row)}
          />
        </div>
      )
    }
  ]
  const exportColumns: ArtTableQueryExcelColumn[] = [
    { key: 'recordNo', title: '培训记录单号' },
    { key: 'planNo', title: '培训计划编号' },
    { key: 'subject', title: '培训主题' },
    { key: 'organizerOrganizationName', title: '组织单位' },
    { key: 'actualStartAt', title: '实际开始时间' },
    { key: 'actualEndAt', title: '实际结束时间' },
    { key: 'instructorName', title: '培训讲师' },
    { key: 'participantCount', title: '参训人数' },
    { key: 'presentCount', title: '签到人数' },
    { key: 'attendanceRate', title: '签到率(%)' },
    { key: 'trainingHours', title: '培训学时' },
    {
      key: 'status',
      title: '记录状态',
      formatter: (value) => trainingRecordStatusLabel(value as SmisSafetyTrainingRecord['status'])
    }
  ]
  const headerActions = computed<ArtTableQueryHeaderAction[]>(() => [
    {
      permission: 'SmisSafetyTrainingRecord:Add',
      type: 'add',
      label: '新增培训记录',
      onClick: () => openDialog()
    },
    {
      permission: 'SmisSafetyTrainingRecord:Delete',
      type: 'delete',
      content: ({ selectedCount }: ArtTableQueryHeaderActionContext) =>
        `确定删除选中的 ${selectedCount} 条草稿记录吗？`,
      onClick: async ({ selectedRows, api }) => {
        await deleteSafetyTrainingRecords(selectedRows.map((row) => row.id as string))
        await api.refreshRemove()
      }
    },
    {
      permission: 'SmisSafetyTrainingRecord:Export',
      type: 'export',
      label: '导出',
      exportFilename: '安全培训记录',
      exportSheetName: '培训记录',
      exportColumns,
      exportApi: async () => ({
        data: (await fetchSafetyTrainingRecordList({ ...searchQuery.value, from: 0, to: 4999 }))
          .data
      })
    }
  ])
  const fetchTableData = async (params: TableParams) => {
    const { from, to } = pageInfoHandler({ current: params.current, size: params.size })
    const result = await fetchSafetyTrainingRecordList({ ...params, from, to })
    Object.assign(overview, result.overview)
    planOptions.value = result.planOptions
    organizations.value = result.organizations
    if (pendingPlanId.value && planOptions.value.some((item) => item.id === pendingPlanId.value)) {
      const planId = pendingPlanId.value
      pendingPlanId.value = ''
      await nextTick()
      openDialog(undefined, false, planId)
      await router.replace({ query: { ...route.query, planId: undefined } })
    }
    return result
  }
  const handleSaveSuccess = (type: 'add' | 'edit') =>
    void (type === 'add' ? tableRef.value?.refreshCreate() : tableRef.value?.refreshUpdate())
</script>

<style scoped lang="scss">
  .training-record-page {
    gap: 12px;
    min-width: 0;

    &__table {
      flex: 1;
      min-width: 0;
      min-height: 0;
    }

    :deep(.training-record-page__identity) {
      display: grid;
      grid-template-columns: 36px minmax(0, 1fr);
      gap: 10px;
      align-items: center;
      min-width: 0;
    }

    :deep(.training-record-page__identity > span:first-child) {
      display: grid;
      place-items: center;
      width: 36px;
      height: 36px;
      color: var(--el-color-success);
      background: color-mix(in srgb, var(--el-color-success) 9%, var(--el-bg-color));
      border-radius: var(--el-border-radius-base);
    }

    :deep(.training-record-page__identity > span:last-child) {
      display: grid;
      min-width: 0;
    }

    :deep(.training-record-page__identity strong),
    :deep(.training-record-page__identity small) {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    :deep(.training-record-page__identity small) {
      margin-top: 2px;
      font-family: var(--art-font-family-mono, Consolas, monospace);
      font-size: 11px;
      color: var(--el-text-color-secondary);
    }

    :deep(.training-record-page__attendance) {
      display: grid;
      grid-template-columns: 74px minmax(0, 1fr);
      gap: 8px;
      align-items: center;
    }

    :deep(.training-record-page__attendance span) {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      white-space: nowrap;
    }
  }
</style>
