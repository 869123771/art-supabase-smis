<template>
  <div v-auth="'SmisCatalog:View'" class="smis-catalog-page art-full-height">
    <BusinessWorkspaceHeader
      :eyebrow="workspace.section"
      :title="workspace.title"
      :description="workspace.description"
      :icon="workspace.icon"
      :tags="[
        { label: '租户数据隔离', type: 'primary' },
        { label: experienceLabel, type: 'success' },
        { label: `文档 P${workspace.documentPages.join(' / ')}`, type: 'info' }
      ]"
      :metrics="workspaceMetrics"
    >
      <template #actions>
        <BusinessTableWorkspaceActions
          v-if="workspace.experience !== 'analytics'"
          :table="tableQueryRef"
        />
      </template>
    </BusinessWorkspaceHeader>

    <section v-if="workspace.experience === 'analytics'" class="catalog-analytics art-card-xs">
      <header>
        <div
          ><strong>{{ workspace.title }}趋势分析</strong
          ><p>统计结果由当前租户真实业务记录即时汇总，不创建“报表记录”。</p></div
        >
        <ElTag effect="plain">{{ overview.total }} 条业务样本</ElTag>
      </header>
      <div class="catalog-analytics__grid">
        <article v-for="item in analyticsBars" :key="item.label">
          <span>{{ item.label }}</span
          ><strong>{{ item.value }}</strong>
          <div><i :style="{ width: `${item.percent}%`, background: item.color }" /></div>
          <small>占比 {{ item.percent }}%</small>
        </article>
      </div>
    </section>

    <section v-else-if="workspace.experience === 'risk-map'" class="catalog-risk-map art-card-xs">
      <header>
        <div
          ><strong>风险四色空间图</strong
          ><p>按文档要求以红、橙、黄、蓝标识重大、较大、一般和低风险区域。</p></div
        >
        <ElTag type="danger" effect="plain">支持区域风险维护</ElTag>
      </header>
      <div class="catalog-risk-map__canvas">
        <article v-for="zone in riskZones" :key="zone.level" :class="`is-${zone.level}`">
          <span>{{ zone.label }}</span
          ><strong>{{ zone.count }}</strong
          ><small>{{ zone.description }}</small>
        </article>
      </div>
      <p class="catalog-risk-map__legend"
        >四色图只展示当前租户已登记的风险评价结果；未评价区域不会被默认标成低风险。</p
      >
    </section>

    <section v-else-if="workspace.experience === 'exam'" class="catalog-exam-flow art-card-xs">
      <article v-for="step in examSteps" :key="step.title">
        <span><ArtSvgIcon :icon="step.icon" /></span>
        <div
          ><strong>{{ step.title }}</strong
          ><p>{{ step.description }}</p></div
        >
      </article>
    </section>

    <section v-else-if="workspace.experience === 'inventory'" class="catalog-stock art-card-xs">
      <header>
        <div
          ><strong>危废库存总览</strong
          ><p>入库与出库统一折算为千克，服务端事务禁止超库存出库。</p></div
        >
        <ElTag type="success" effect="plain">库存实时核算</ElTag>
      </header>
      <div class="catalog-stock__grid">
        <article v-for="stock in stockState.rows.slice(0, 6)" :key="stock.wasteCode">
          <span>{{ stock.wasteCode }}</span
          ><strong>{{ stock.availableQuantity }} {{ stock.unit }}</strong>
          <small
            >{{ stock.wasteName }} · 入 {{ stock.inboundQuantity }} / 出
            {{ stock.outboundQuantity }}</small
          >
        </article>
        <ArtEmptyState
          v-if="!stockState.loading && !stockState.rows.length"
          compact
          title="暂无危废库存"
          description="先维护危废名录并登记第一笔入库单。"
        />
      </div>
    </section>

    <section
      v-else-if="workspace.experience === 'special-work'"
      class="catalog-permit-guide art-card-xs"
    >
      <article v-for="step in permitSteps" :key="step.title">
        <span>{{ step.index }}</span
        ><div
          ><strong>{{ step.title }}</strong
          ><p>{{ step.description }}</p></div
        >
      </article>
    </section>

    <div class="catalog-content" :class="{ 'is-tree': workspace.experience === 'tree' }">
      <aside v-if="workspace.experience === 'tree'" class="catalog-tree art-card-xs">
        <header
          ><strong>{{ workspace.title }}层级</strong><small>父子结构实时同步</small></header
        >
        <ElTree
          :data="treeNodes"
          node-key="id"
          default-expand-all
          highlight-current
          :empty-text="`暂无${workspace.recordNoun}`"
        />
      </aside>

      <ArtTableQuery
        v-if="workspace.experience !== 'analytics'"
        ref="tableQueryRef"
        v-model="searchQuery"
        :search-items="searchItems"
        :api-fn="fetchTableData"
        :columns-factory="columnsFactory"
        :header-actions="headerActions"
        header-actions-placement="workspace"
        :search-bar-props="{ span: 6, labelWidth: 76 }"
        :table-props="{
          rowKey: 'id',
          tableLayout: 'fixed',
          emptyText: `暂无${workspace.recordNoun}`,
          emptyDescription: emptyDescription
        }"
        :on-success="handleTableSuccess"
        focusable
      />
    </div>
    <SafetyCatalogRecordDialog ref="recordDialogRef" @success="handleSaveSuccess" />
    <SafetyCatalogDetailDrawer ref="detailDrawerRef" @updated="handleDetailUpdated" />
    <SafetyExamRunnerDialog ref="examRunnerRef" @completed="handleExamCompleted" />
  </div>
</template>

<script setup lang="tsx">
  import { ElTag } from 'element-plus'
  import type { SearchFormItem } from '@/components/core/forms/art-search-bar/index.vue'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import type {
    ArtTableQueryExpose,
    ArtTableQueryHeaderAction,
    ArtTableQueryProps
  } from '@/components/core/tables/art-table-query/index.vue'
  import BusinessTableWorkspaceActions from '@/components/business/business-table-workspace-actions/index.vue'
  import BusinessWorkspaceHeader, {
    type BusinessWorkspaceMetric
  } from '@/components/business/business-workspace-header/index.vue'
  import ArtEmptyState from '@/components/core/layouts/art-empty-state/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import { useArtFeedback } from '@/hooks/core/useArtFeedback'
  import type { ColumnOption } from '@/types'
  import { pageInfoHandler } from '@/utils/table/tableUtils'
  import { formatWithDayjs } from '@/utils/time'
  import {
    deleteSafetyCatalogRecord,
    fetchHazardousWasteStock,
    fetchSafetyCatalogRecords,
    transitionSafetyCatalogRecord,
    type HazardousWasteStock,
    type SafetyCatalogRecord,
    type SafetyCatalogSearchParams,
    type SafetyWorkflowAction
  } from '@smis/api'
  import {
    getSafetyModuleDefinition,
    safetyModuleCatalog,
    type SafetyFieldDefinition
  } from '@smis/domain/safety-module-catalog'
  import SafetyCatalogRecordDialog from './modules/safety-catalog-record-dialog.vue'
  import SafetyCatalogDetailDrawer from './modules/safety-catalog-detail-drawer.vue'
  import SafetyExamRunnerDialog from './modules/safety-exam-runner-dialog.vue'

  defineOptions({ name: 'SmisCatalogWorkspace' })

  interface RecordDialogExpose {
    handleOpen: (data: {
      workspace: ReturnType<typeof getSafetyModuleDefinition>
      record?: SafetyCatalogRecord
    }) => Promise<void>
  }

  type TableParams = SafetyCatalogSearchParams &
    Pick<Api.Common.PaginationParams, 'current' | 'size'>

  const route = useRoute()
  const { confirmAction, promptReason } = useArtFeedback()
  const tableQueryRef = ref<ArtTableQueryExpose>()
  const recordDialogRef = ref<RecordDialogExpose>()
  const detailDrawerRef = ref<{
    handleOpen: (data: {
      workspace: ReturnType<typeof getSafetyModuleDefinition>
      record: SafetyCatalogRecord
    }) => Promise<void>
  }>()
  const examRunnerRef = ref<{ handleOpen: (record: SafetyCatalogRecord) => Promise<void> }>()
  const overview = reactive({ total: 0, rows: [] as SafetyCatalogRecord[] })
  const stockState = reactive({ loading: false, rows: [] as HazardousWasteStock[] })

  const catalogCode = computed(() => {
    const metaCode = route.meta.catalogCode
    if (typeof metaCode === 'string' && metaCode) return metaCode
    return route.path.split('/').filter(Boolean).at(-1)
  })
  const workspace = computed(() => getSafetyModuleDefinition(catalogCode.value))

  const experienceLabel = computed(
    () =>
      ({
        tree: '树形维护',
        ledger: '专业台账',
        'master-detail': '主从档案',
        workflow: '流程闭环',
        analytics: '实时分析',
        exam: '培训考试',
        'risk-map': '四色风险图',
        'special-work': '电子作业票',
        inventory: '库存闭环'
      })[workspace.value.experience]
  )

  const emptyDescription = computed(() => {
    if (workspace.value.experience === 'analytics') return '统计将在业务数据产生后自动生成。'
    if (workspace.value.experience === 'risk-map') return '先完成风险辨识与评价，再生成四色分布。'
    if (workspace.value.experience === 'inventory') return '请先维护危废名录，再登记入库或出库。'
    return `可新增第一条${workspace.value.recordNoun}，或调整筛选条件后重新查询。`
  })

  const searchQuery = reactive<SafetyCatalogSearchParams>({
    moduleCode: workspace.value.code,
    keyword: '',
    status: ''
  })

  const searchItems = computed<SearchFormItem[]>(() => [
    {
      label: '关键词',
      key: 'keyword',
      type: 'input',
      props: { placeholder: `编号、名称或负责人` }
    },
    {
      label: '状态',
      key: 'status',
      type: 'select',
      props: {
        options: [
          { label: '草稿', value: 'draft' },
          { label: '待审核', value: 'pending' },
          { label: '有效', value: 'active' },
          { label: '已完成', value: 'completed' },
          { label: '已停用', value: 'disabled' }
        ]
      }
    }
  ])

  const workspaceMetrics = computed<BusinessWorkspaceMetric[]>(() => [
    {
      label: `${workspace.value.recordNoun}总数`,
      value: overview.total,
      description: '当前筛选条件下的数据量',
      icon: 'ri:file-list-3-line'
    },
    {
      label: '本页有效',
      value: overview.rows.filter((row) => ['active', 'completed'].includes(row.status)).length,
      description: '已生效或已完成记录',
      icon: 'ri:checkbox-circle-line',
      tone: 'success'
    },
    {
      label: '本页待处理',
      value: overview.rows.filter((row) => ['draft', 'pending'].includes(row.status)).length,
      description: '草稿及待审核记录',
      icon: 'ri:time-line',
      tone: 'warning'
    }
  ])

  const analyticsBars = computed(() => {
    const total = Math.max(overview.rows.length, 1)
    const items = [
      { label: '有效 / 已批准', statuses: ['active'], color: '#22c55e' },
      { label: '待处理', statuses: ['draft', 'pending'], color: '#f59e0b' },
      { label: '已完成', statuses: ['completed'], color: '#6366f1' },
      { label: '停用 / 作废', statuses: ['disabled'], color: '#94a3b8' }
    ]
    return items.map((item) => {
      const value = overview.rows.filter((row) => item.statuses.includes(row.status)).length
      return { ...item, value, percent: Math.round((value / total) * 100) }
    })
  })

  const riskZones = computed(() => {
    const levelCount = (values: string[]) =>
      overview.rows.filter((row) => values.includes(String(row.payload?.riskLevel || ''))).length
    return [
      {
        level: 'critical',
        label: '重大风险',
        count: levelCount(['重大', 'critical']),
        description: '公司级重点管控'
      },
      {
        level: 'major',
        label: '较大风险',
        count: levelCount(['较大', 'major']),
        description: '部门级重点管控'
      },
      {
        level: 'general',
        label: '一般风险',
        count: levelCount(['一般', 'general']),
        description: '班组级周期管控'
      },
      {
        level: 'low',
        label: '低风险',
        count: levelCount(['低', 'low']),
        description: '岗位日常管控'
      }
    ]
  })

  const examSteps = [
    {
      title: '题库与分类',
      description: '维护单选、多选、判断题及答案解析',
      icon: 'ri:question-answer-line'
    },
    {
      title: '组卷与发布',
      description: '固定 / 随机组卷，设置人员、时长与合格分',
      icon: 'ri:file-list-3-line'
    },
    { title: '在线考试', description: '计时答题、题目导航、续考与主动交卷', icon: 'ri:timer-line' },
    {
      title: '成绩归档',
      description: '保存答卷、正确答案、得分和通过状态',
      icon: 'ri:bar-chart-box-line'
    }
  ]

  const permitSteps = [
    { index: '01', title: '填写作业票', description: '作业范围、时间、人员、监护与危害辨识' },
    { index: '02', title: '确认安全措施', description: '逐项确认措施、分析结果与现场附件' },
    { index: '03', title: '审批与执行', description: '提交、审批、执行、转交和异常取消留痕' },
    { index: '04', title: '关闭与打印', description: '完工验收后关闭，可按标准票面打印归档' }
  ]

  interface TreeNode {
    id: string
    label: string
    children?: TreeNode[]
  }

  const treeNodes = computed<TreeNode[]>(() => {
    const rows = overview.rows
    const nodes = new Map<string, TreeNode>()
    rows.forEach((row) =>
      nodes.set(row.id || row.recordNo, { id: row.id || row.recordNo, label: row.title })
    )
    const roots: TreeNode[] = []
    rows.forEach((row) => {
      const node = nodes.get(row.id || row.recordNo)!
      const parentName = String(row.payload?.parentName || '')
      const parent = rows.find((candidate) => candidate.title === parentName)
      if (parent) {
        const parentNode = nodes.get(parent.id || parent.recordNo)!
        parentNode.children ??= []
        parentNode.children.push(node)
      } else roots.push(node)
    })
    return roots
  })

  const headerActions = computed<ArtTableQueryHeaderAction[]>(() => {
    if (['analytics', 'risk-map'].includes(workspace.value.experience)) return []
    return [
      {
        type: 'add',
        label: `新增${workspace.value.recordNoun}`,
        permission: 'SmisCatalog:Add',
        onClick: () => void openDialog()
      }
    ]
  })

  const statusLabel = (status: string): string =>
    ({
      draft: '草稿',
      pending: '待审核',
      active: '有效',
      completed: '已完成',
      disabled: '已停用'
    })[status] ??
    status ??
    '--'

  const statusTagType = (status: string) => {
    if (['active', 'completed'].includes(status)) return 'success'
    if (status === 'pending') return 'warning'
    if (status === 'disabled') return 'info'
    return 'primary'
  }

  const fieldValue = (row: SafetyCatalogRecord, field: SafetyFieldDefinition): unknown => {
    const value = row.payload?.[field.key]
    if (field.type !== 'select') return value ?? '--'
    return field.options?.find((option) => option.value === value)?.label ?? value ?? '--'
  }

  const columnsFactory = (): ColumnOption<SafetyCatalogRecord>[] => [
    { type: 'globalIndex', label: '序号', width: 64 },
    { prop: 'recordNo', label: '业务编号', minWidth: 138 },
    { prop: 'title', label: workspace.value.title, minWidth: 190 },
    ...workspace.value.fields
      .filter((field) => field.table)
      .filter((field) => !['recordNo', 'name', 'status'].includes(field.key))
      .slice(0, 3)
      .map<ColumnOption<SafetyCatalogRecord>>((field) => ({
        prop: `payload.${field.key}`,
        label: field.label,
        minWidth: field.type === 'datetime' ? 168 : 128,
        formatter: (row) => String(fieldValue(row, field))
      })),
    {
      prop: 'status',
      label: '状态',
      width: 96,
      formatter: (row) => <ElTag type={statusTagType(row.status)}>{statusLabel(row.status)}</ElTag>
    },
    {
      prop: 'updateTime',
      label: '更新时间',
      minWidth: 168,
      formatter: (row) => formatWithDayjs(row.updateTime)
    },
    {
      prop: 'operation',
      label: '操作',
      width:
        workspace.value.capabilities.includes('timeline') ||
        workspace.value.code === 'exam-management'
          ? 202
          : 164,
      fixed: 'right',
      formatter: (row) => (
        <div class="flex">
          <ArtButtonTable
            type="view"
            permission="SmisCatalog:View"
            onClick={() => void openDetail(row)}
          />
          {workspace.value.experience !== 'analytics' && (
            <ArtButtonTable
              type="edit"
              permission="SmisCatalog:Edit"
              disabled={!['draft', 'active'].includes(row.status)}
              onClick={() => void openDialog(row)}
            />
          )}
          {workspace.value.capabilities.includes('timeline') && workflowActionFor(row) && (
            <ArtButtonTable
              type="sign"
              label={workflowActionFor(row)?.label}
              permission={workflowActionFor(row)?.permission}
              onClick={() => void handleWorkflowAction(row, workflowActionFor(row)!)}
            />
          )}
          {workspace.value.code === 'exam-management' && row.status === 'active' && (
            <ArtButtonTable
              type="sign"
              label="参加考试"
              permission="SmisCatalog:TakeExam"
              onClick={() => void examRunnerRef.value?.handleOpen(row)}
            />
          )}
          {workspace.value.experience !== 'analytics' && (
            <ArtButtonTable
              type="delete"
              permission="SmisCatalog:Delete"
              disabled={row.status === 'pending'}
              onClick={() => void handleDelete(row)}
            />
          )}
        </div>
      )
    }
  ]

  const fetchTableData = (params: TableParams) => {
    const { from, to } = pageInfoHandler({ current: params.current, size: params.size })
    const moduleCodes =
      workspace.value.experience === 'risk-map'
        ? ['risk-level-control', 'quantitative-risk-control', 'risk-assessment-standard']
        : undefined
    return fetchSafetyCatalogRecords({
      moduleCode: workspace.value.code,
      moduleCodes,
      keyword: params.keyword,
      status: params.status,
      from,
      to
    })
  }

  const analyticsSourceCodes = computed(() =>
    safetyModuleCatalog
      .filter(
        (definition) =>
          definition.section === workspace.value.section &&
          definition.code !== workspace.value.code &&
          definition.experience !== 'analytics'
      )
      .map((definition) => definition.code)
  )

  const loadAnalyticsOverview = async (): Promise<void> => {
    if (workspace.value.experience !== 'analytics') return
    const result = await fetchSafetyCatalogRecords({
      moduleCode: workspace.value.code,
      moduleCodes: analyticsSourceCodes.value,
      keyword: searchQuery.keyword,
      status: searchQuery.status,
      from: 0,
      to: 999
    })
    overview.rows = result.data ?? []
    overview.total = result.total ?? overview.rows.length
  }

  const handleTableSuccess: NonNullable<ArtTableQueryProps['onSuccess']> = (rows, response) => {
    overview.rows = rows as SafetyCatalogRecord[]
    overview.total = response.total ?? rows.length
  }

  interface WorkflowActionOption {
    action: SafetyWorkflowAction
    label: string
    permission: string
  }

  const workflowActionFor = (row: SafetyCatalogRecord): WorkflowActionOption | undefined => {
    if (row.status === 'draft') {
      return { action: 'submit', label: '提交审批', permission: 'SmisCatalog:Submit' }
    }
    if (row.status === 'pending') {
      return { action: 'approve', label: '审批通过', permission: 'SmisCatalog:Approve' }
    }
    if (row.status === 'active') {
      return { action: 'complete', label: '完成业务', permission: 'SmisCatalog:Execute' }
    }
    return undefined
  }

  const openDetail = (record: SafetyCatalogRecord): Promise<void> =>
    detailDrawerRef.value?.handleOpen({ workspace: workspace.value, record }) ?? Promise.resolve()

  const handleWorkflowAction = async (
    row: SafetyCatalogRecord,
    option: WorkflowActionOption
  ): Promise<void> => {
    if (!row.id) return
    try {
      const comment = await promptReason(
        `请填写“${option.label}”的处理意见，意见会进入不可变审批留痕。`,
        option.label,
        {
          placeholder: '请输入处理意见、现场确认结果或审批依据',
          minLength: 2,
          maxLength: 500,
          confirmButtonText: option.label
        }
      )
      await transitionSafetyCatalogRecord(row.id, option.action, comment)
      await tableQueryRef.value?.refreshUpdate()
      if (workspace.value.experience === 'inventory') await loadStock()
    } catch {
      // 用户取消流程操作时无需提示。
    }
  }

  const loadStock = async (): Promise<void> => {
    if (workspace.value.experience !== 'inventory') {
      stockState.rows = []
      return
    }
    stockState.loading = true
    try {
      const result = await fetchHazardousWasteStock()
      stockState.rows = result.data ?? []
    } finally {
      stockState.loading = false
    }
  }

  const openDialog = (record?: SafetyCatalogRecord): Promise<void> =>
    recordDialogRef.value?.handleOpen({ workspace: workspace.value, record }) ?? Promise.resolve()

  const handleSaveSuccess = async (type: 'add' | 'edit'): Promise<void> => {
    if (type === 'edit') await tableQueryRef.value?.refreshUpdate()
    else await tableQueryRef.value?.refreshCreate()
    await loadStock()
  }

  const handleExamCompleted = async (): Promise<void> => {
    await tableQueryRef.value?.refreshData()
  }

  const handleDetailUpdated = async (): Promise<void> => {
    await tableQueryRef.value?.refreshUpdate()
    await loadStock()
  }

  const handleDelete = async (row: SafetyCatalogRecord): Promise<void> => {
    if (!row.id) return
    try {
      await confirmAction(`确定删除“${row.title}”吗？`, '删除确认', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      })
      await deleteSafetyCatalogRecord(row.id)
      await tableQueryRef.value?.refreshRemove()
      await loadStock()
    } catch {
      // 用户取消删除时无需提示。
    }
  }

  watch(
    () => workspace.value.code,
    (code) => {
      searchQuery.moduleCode = code
      searchQuery.keyword = ''
      searchQuery.status = ''
      overview.total = 0
      overview.rows = []
      void loadStock()
      if (workspace.value.experience === 'analytics') void loadAnalyticsOverview()
      else void tableQueryRef.value?.refreshData()
    }
  )

  watch(
    () => [searchQuery.keyword, searchQuery.status],
    () => {
      if (workspace.value.experience === 'analytics') void loadAnalyticsOverview()
    }
  )

  onMounted(() => {
    void loadStock()
    void loadAnalyticsOverview()
  })
</script>

<style scoped lang="scss">
  .smis-catalog-page {
    gap: 12px;
    min-width: 0;
  }

  .catalog-content {
    display: flex;
    flex: 1;
    gap: 12px;
    min-width: 0;
    min-height: 0;

    > .art-table-query {
      flex: 1;
      min-width: 0;
    }
  }

  .catalog-tree {
    display: grid;
    flex: 0 0 238px;
    gap: 12px;
    min-height: 0;
    padding: 16px;
    overflow: auto;

    header {
      display: grid;
      gap: 3px;

      strong {
        font-size: 15px;
      }

      small {
        color: var(--art-text-gray-600);
      }
    }
  }

  .catalog-analytics,
  .catalog-risk-map,
  .catalog-stock,
  .catalog-exam-flow,
  .catalog-permit-guide {
    flex: 0 0 auto;
    min-width: 0;
    padding: 16px 18px;
  }

  .catalog-analytics > header,
  .catalog-risk-map > header,
  .catalog-stock > header {
    display: flex;
    gap: 16px;
    align-items: flex-start;
    justify-content: space-between;

    strong {
      font-size: 15px;
    }

    p {
      margin: 4px 0 0;
      font-size: 12px;
      color: var(--art-text-gray-600);
    }
  }

  .catalog-analytics__grid,
  .catalog-stock__grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
    margin-top: 14px;

    article {
      display: grid;
      gap: 6px;
      min-width: 0;
      padding: 12px;
      background: var(--art-main-bg-color);
      border: 1px solid var(--art-card-border);
      border-radius: 9px;
    }

    span,
    small {
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 12px;
      color: var(--art-text-gray-600);
      white-space: nowrap;
    }

    strong {
      font-size: 18px;
    }
  }

  .catalog-analytics__grid article > div {
    height: 6px;
    overflow: hidden;
    background: var(--el-fill-color-dark);
    border-radius: 999px;

    i {
      display: block;
      min-width: 2px;
      height: 100%;
      border-radius: inherit;
    }
  }

  .catalog-stock__grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .catalog-risk-map__canvas {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    min-height: 218px;
    padding: 14px;
    margin-top: 14px;
    background-color: var(--art-main-bg-color);
    background-image:
      linear-gradient(var(--art-card-border) 1px, transparent 1px),
      linear-gradient(90deg, var(--art-card-border) 1px, transparent 1px);
    background-size: 22px 22px;
    border: 1px solid var(--art-card-border);
    border-radius: 10px;

    article {
      display: grid;
      align-content: end;
      min-height: 86px;
      padding: 14px;
      color: #fff;
      border: 2px solid rgb(255 255 255 / 72%);
      border-radius: 8px;
      box-shadow: 0 8px 20px rgb(15 23 42 / 12%);
    }

    strong {
      margin: 4px 0;
      font-size: 24px;
    }

    small {
      opacity: 0.86;
    }

    .is-critical {
      background: #dc2626;
    }

    .is-major {
      background: #ea580c;
    }

    .is-general {
      color: #422006;
      background: #facc15;
    }

    .is-low {
      background: #2563eb;
    }
  }

  .catalog-risk-map__legend {
    margin: 10px 0 0;
    font-size: 12px;
    color: var(--art-text-gray-600);
  }

  .catalog-exam-flow,
  .catalog-permit-guide {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;

    article {
      display: flex;
      gap: 10px;
      min-width: 0;
      padding: 12px;
      background: var(--art-main-bg-color);
      border: 1px solid var(--art-card-border);
      border-radius: 9px;
    }

    article > span {
      display: grid;
      flex: 0 0 34px;
      place-items: center;
      width: 34px;
      height: 34px;
      font-weight: 700;
      color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
      border-radius: 8px;
    }

    strong {
      font-size: 13px;
    }

    p {
      margin: 4px 0 0;
      font-size: 12px;
      line-height: 1.5;
      color: var(--art-text-gray-600);
    }
  }

  @media (width <= 1100px) {
    .catalog-analytics__grid,
    .catalog-exam-flow,
    .catalog-permit-guide {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .catalog-stock__grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (width <= 760px) {
    .catalog-content.is-tree {
      flex-direction: column;
    }

    .catalog-tree {
      flex-basis: auto;
      max-height: 230px;
    }

    .catalog-analytics__grid,
    .catalog-stock__grid,
    .catalog-exam-flow,
    .catalog-permit-guide,
    .catalog-risk-map__canvas {
      grid-template-columns: 1fr;
    }
  }
</style>
