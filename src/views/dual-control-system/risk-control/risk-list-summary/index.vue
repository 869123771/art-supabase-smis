<template>
  <ArtPermissionGuard permission="SmisDualControlRiskListSummary:View" resource-name="风险清单汇总">
    <div class="risk-summary-page business-workspace-page art-full-height">
      <BusinessWorkspaceHeader
        eyebrow="ENTERPRISE RISK OVERVIEW"
        title="风险清单汇总"
        description="以企业风险底账口径汇总风险等级、控制措施和责任落实情况，支持全量报表导出。"
        icon="ri:bar-chart-box-line"
        density="compact"
        :tags="[
          { label: '统一风险口径', type: 'primary', effect: 'plain' },
          { label: '控制措施全景', type: 'warning', effect: 'light' },
          { label: '管理报表', type: 'success', effect: 'plain' }
        ]"
        :metrics="workspaceMetrics"
      >
        <template #actions><BusinessTableWorkspaceActions :table="tableQueryRef" /></template>
      </BusinessWorkspaceHeader>

      <div class="risk-summary-page__insight">
        <div
          ><span>评价覆盖率</span><strong>{{ evaluationRate }}%</strong
          ><ElProgress :percentage="evaluationRate" :stroke-width="6" :show-text="false"
        /></div>
        <div
          ><span>管控覆盖率</span><strong>{{ controlRate }}%</strong
          ><ElProgress
            :percentage="controlRate"
            :stroke-width="6"
            :show-text="false"
            status="success"
        /></div>
        <p
          ><ArtSvgIcon icon="ri:information-line" />
          汇总表沿用安全风险清单口径，横向滚动可查看五类措施、责任人和责任部门。</p
        >
      </div>

      <ArtTableQuery
        ref="tableQueryRef"
        class="risk-summary-page__table"
        v-model="searchQuery"
        :api-fn="fetchTableData"
        :search-items="searchItems"
        :columns-factory="columnsFactory"
        :header-actions="headerActions"
        header-actions-placement="workspace"
        :search-bar-props="{ span: 6, labelWidth: 84 }"
        :table-props="{
          rowKey: 'id',
          tableLayout: 'fixed',
          emptyText: '暂无风险汇总数据',
          emptyDescription: '完成风险辨识后，汇总数据将在此自动形成。'
        }"
        focusable
      />
    </div>
  </ArtPermissionGuard>
</template>

<script setup lang="tsx">
  import dayjs from 'dayjs'
  import type { SearchFormItem } from '@/components/core/forms/art-search-bar/index.vue'
  import type {
    ArtTableQueryExcelColumn,
    ArtTableQueryExpose,
    ArtTableQueryHeaderAction
  } from '@/components/core/tables/art-table-query/index.vue'
  import type { ColumnOption } from '@/types'
  import { pageInfoHandler } from '@/utils/table/tableUtils'
  import { useUserStore } from '@/store/modules/user'
  import ArtPermissionGuard from '@/components/core/feedback/art-permission-guard/index.vue'
  import ArtDictDisplay from '@/components/core/base/art-dict-display/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import BusinessTableWorkspaceActions from '@/components/business/business-table-workspace-actions/index.vue'
  import BusinessWorkspaceHeader, {
    type BusinessWorkspaceMetric
  } from '@/components/business/business-workspace-header/index.vue'
  import {
    fetchSafetyRiskList,
    type SmisRiskControlLevel,
    type SmisSafetyRiskOverview,
    type SmisSafetyRiskRecord,
    type SmisSafetyRiskSearchParams
  } from '@smis/api'

  defineOptions({ name: 'SmisDualControlRiskListSummary' })
  type TableParams = SmisSafetyRiskSearchParams &
    Pick<Api.Common.PaginationParams, 'current' | 'size'>
  const userStore = useUserStore()
  const { getDictMap } = storeToRefs(userStore)
  const tableQueryRef = ref<ArtTableQueryExpose>()
  const searchQuery = ref<SmisSafetyRiskSearchParams>({})
  const overview = reactive<SmisSafetyRiskOverview>({
    total: 0,
    evaluated: 0,
    major: 0,
    controlled: 0
  })
  const controlLevelOptions: Array<{ label: string; value: SmisRiskControlLevel }> = [
    { label: '公司级（厂级）', value: 'company' },
    { label: '车间（部门级）', value: 'department' },
    { label: '班组级', value: 'team' },
    { label: '岗位级', value: 'position' }
  ]
  const controlLevelLabel = new Map(controlLevelOptions.map((item) => [item.value, item.label]))
  const evaluationRate = computed(() =>
    overview.total ? Math.round((overview.evaluated / overview.total) * 100) : 0
  )
  const controlRate = computed(() =>
    overview.total ? Math.round((overview.controlled / overview.total) * 100) : 0
  )
  const workspaceMetrics = computed<BusinessWorkspaceMetric[]>(() => [
    {
      label: '风险总数',
      value: overview.total,
      description: '当前汇总口径',
      icon: 'ri:file-list-3-line'
    },
    {
      label: '已评价',
      value: overview.evaluated,
      description: `覆盖率 ${evaluationRate.value}%`,
      icon: 'ri:calculator-line',
      tone: 'success'
    },
    {
      label: '重大风险',
      value: overview.major,
      description: '需优先跟踪',
      icon: 'ri:alarm-warning-line',
      tone: 'danger'
    },
    {
      label: '已管控',
      value: overview.controlled,
      description: `覆盖率 ${controlRate.value}%`,
      icon: 'ri:shield-check-line',
      tone: 'primary'
    }
  ])
  const searchItems = computed<SearchFormItem[]>(() => [
    {
      label: '风险关键字',
      key: 'keyword',
      type: 'input',
      props: { clearable: true, placeholder: '危险编号、风险点编号或危险源' }
    },
    {
      label: '风险名称',
      key: 'riskName',
      type: 'input',
      props: { clearable: true, placeholder: '风险点名称' }
    },
    {
      label: '管控层级',
      key: 'controlLevel',
      type: 'select',
      props: { options: controlLevelOptions, clearable: true, placeholder: '全部层级' }
    }
  ])
  const excelColumns: ArtTableQueryExcelColumn[] = [
    { key: 'hazardNo', title: '危险编号' },
    { key: 'riskName', title: '风险点名称' },
    { key: 'riskPointType', title: '风险点类型' },
    { key: 'siteName', title: '环节/单位' },
    { key: 'hazardSource', title: '危险源' },
    { key: 'accidentTypes', title: '事故类型' },
    { key: 'riskDescription', title: '风险描述' },
    { key: 'engineeringMeasures', title: '工程技术措施' },
    { key: 'managementMeasures', title: '管理措施' },
    { key: 'educationMeasures', title: '教育培训措施' },
    { key: 'personalProtectionMeasures', title: '个体防护措施' },
    { key: 'emergencyMeasures', title: '应急处置措施' },
    { key: 'riskAssessmentMethod', title: '风险评估方法' },
    { key: 'riskLevelName', title: '风险等级' },
    { key: 'controlLevels', title: '管控层级' },
    { key: 'responsibleNames', title: '责任人' },
    { key: 'responsibleDepartments', title: '责任部门' },
    { key: 'identifiedBy', title: '辨识人' },
    { key: 'identifiedAt', title: '辨识时间' }
  ]
  const textColumn = (
    prop: keyof SmisSafetyRiskRecord,
    label: string,
    minWidth = 200
  ): ColumnOption<SmisSafetyRiskRecord> => ({
    prop: String(prop),
    label,
    minWidth,
    showOverflowTooltip: true,
    formatter: (row) => String(row[prop] || '—')
  })
  const columnsFactory = (): ColumnOption<SmisSafetyRiskRecord>[] => [
    { type: 'globalIndex', label: '序号', width: 68 },
    {
      prop: 'hazardNo',
      label: '危险编号',
      width: 142,
      fixed: 'left',
      formatter: (row) => <span class="risk-summary-page__code">{row.hazardNo}</span>
    },
    {
      prop: 'riskName',
      label: '风险点 / 危险源',
      minWidth: 260,
      fixed: 'left',
      formatter: (row) => (
        <div class="risk-summary-page__identity">
          <strong>{row.riskName}</strong>
          <small>{row.hazardSource}</small>
        </div>
      )
    },
    {
      prop: 'riskPointType',
      label: '风险点类型',
      width: 116,
      formatter: (row) => (
        <ArtDictDisplay dictCode="smisRiskPointType" value={row.riskPointType} display="tag" />
      )
    },
    {
      prop: 'siteName',
      label: '环节 / 单位',
      minWidth: 180,
      formatter: (row) => (
        <div class="risk-summary-page__identity">
          <strong>{row.siteName}</strong>
          <small>{row.organizationName || '—'}</small>
        </div>
      )
    },
    {
      prop: 'accidentTypes',
      label: '事故类型',
      minWidth: 180,
      formatter: (row) =>
        row.accidentTypes
          .map(
            (item) =>
              (getDictMap.value.smisAccidentCategory ?? []).find((dict) => dict.value === item)
                ?.label || item
          )
          .join('、') || '—'
    },
    textColumn('riskDescription', '风险描述', 240),
    textColumn('engineeringMeasures', '工程技术措施', 220),
    textColumn('managementMeasures', '管理措施', 220),
    textColumn('educationMeasures', '教育培训措施', 220),
    textColumn('personalProtectionMeasures', '个体防护措施', 220),
    textColumn('emergencyMeasures', '应急处置措施', 220),
    {
      prop: 'riskAssessmentMethod',
      label: '评价方法 / 等级',
      width: 148,
      formatter: (row) => (
        <div class="risk-summary-page__identity">
          <strong>{row.riskAssessmentMethod || '待评价'}</strong>
          <small style={{ color: row.riskLevelColor || undefined }}>
            {row.riskLevelName || '暂无等级'}
          </small>
        </div>
      )
    },
    {
      prop: 'controlLevels',
      label: '管控层级',
      minWidth: 210,
      formatter: (row) =>
        row.controlLevels.map((item) => controlLevelLabel.get(item)).join('、') || '未管控'
    },
    {
      prop: 'responsibleNames',
      label: '责任人 / 部门',
      minWidth: 190,
      formatter: (row) => (
        <div class="risk-summary-page__identity">
          <strong>{row.responsibleNames || '待落实'}</strong>
          <small>{row.responsibleDepartments || '—'}</small>
        </div>
      )
    },
    {
      prop: 'identifiedAt',
      label: '辨识信息',
      width: 170,
      formatter: (row) => (
        <div class="risk-summary-page__identity">
          <strong>{row.identifiedBy || '系统记录'}</strong>
          <small>{dayjs(row.identifiedAt).format('YYYY-MM-DD HH:mm')}</small>
        </div>
      )
    }
  ]
  const fetchTableData = async (params: TableParams) => {
    const { from, to } = pageInfoHandler({ current: params.current, size: params.size })
    const response = await fetchSafetyRiskList({ ...params, from, to })
    Object.assign(overview, response.overview)
    return response
  }
  const headerActions = computed<ArtTableQueryHeaderAction[]>(() => [
    {
      permission: 'SmisDualControlRiskListSummary:Export',
      type: 'export',
      exportFilename: '风险清单汇总',
      exportSheetName: '风险汇总',
      exportColumns: excelColumns,
      exportApi: async () => ({
        data: (await fetchSafetyRiskList({ ...searchQuery.value, from: 0, to: 9999 })).data.map(
          (row) => ({
            ...row,
            accidentTypes: row.accidentTypes.join('、'),
            controlLevels: row.controlLevels.map((item) => controlLevelLabel.get(item)).join('、'),
            identifiedAt: dayjs(row.identifiedAt).format('YYYY-MM-DD HH:mm')
          })
        )
      })
    }
  ])
  onMounted(async () => {
    await Promise.all([
      userStore.ensureDictLoaded('smisRiskPointType'),
      userStore.ensureDictLoaded('smisAccidentCategory')
    ])
  })
</script>

<style scoped lang="scss">
  .risk-summary-page {
    gap: 12px;
    min-width: 0;

    &__insight {
      display: grid;
      grid-template-columns: 220px 220px minmax(0, 1fr);
      gap: 18px;
      align-items: center;
      padding: 12px 16px;
      background: var(--default-box-color);
      border: 1px solid var(--el-border-color-lighter);
      border-radius: var(--el-border-radius-base);
    }

    &__insight > div {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 6px 12px;
      align-items: center;
    }

    &__insight .el-progress {
      grid-column: 1 / -1;
    }

    &__insight strong {
      font-family: var(--art-font-family-mono, Consolas, monospace);
      color: var(--theme-color);
    }

    &__insight p {
      display: flex;
      gap: 8px;
      align-items: center;
      justify-content: flex-end;
      margin: 0;
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }

    &__table {
      flex: 1 1 auto;
      min-width: 0;
      min-height: 0;
    }

    :deep(.risk-summary-page__code) {
      font-family: var(--art-font-family-mono, Consolas, monospace);
      font-size: 12px;
      color: var(--theme-color);
    }

    :deep(.risk-summary-page__identity) {
      display: grid;
      min-width: 0;
    }

    :deep(.risk-summary-page__identity strong),
    :deep(.risk-summary-page__identity small) {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    :deep(.risk-summary-page__identity small) {
      margin-top: 2px;
      font-size: 11px;
      color: var(--el-text-color-secondary);
    }
  }

  @media (width <= 900px) {
    .risk-summary-page__insight {
      grid-template-columns: 1fr 1fr;
    }

    .risk-summary-page__insight p {
      grid-column: 1 / -1;
      justify-content: flex-start;
    }
  }
</style>
