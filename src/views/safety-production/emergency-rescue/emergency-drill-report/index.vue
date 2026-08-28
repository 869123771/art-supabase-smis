<template>
  <div
    v-auth="'SmisEmergencyDrillReport:View'"
    class="drill-report-page business-workspace-page art-full-height"
  >
    <BusinessWorkspaceHeader
      eyebrow="DRILL INSIGHTS"
      title="应急演练报表"
      description="按日期和组织分析演练兑现、频次、迟延情况与未兑现计划。"
      icon="ri:bar-chart-box-line"
      :tags="[
        { label: '多维检索', type: 'primary', effect: 'plain' },
        {
          label: `延迟完成 ${overview.lateCount}`,
          type: overview.lateCount ? 'danger' : 'success',
          effect: 'light'
        },
        { label: '未兑现计划可追溯', type: 'warning', effect: 'plain' }
      ]"
      :metrics="metrics"
    />
    <ElScrollbar class="drill-report-page__scroll">
      <div class="drill-report-page__body">
        <ArtSearchBar
          v-model="query"
          :items="searchItems"
          :span="6"
          label-position="top"
          :show-expand="false"
          :disabled-search="loading"
          @search="loadReport"
          @reset="resetQuery"
        />
        <div class="drill-report-page__content">
          <ArtSectionCard
            class="drill-report-page__panel"
            title="演练执行分析"
            subtitle="按组织、计划类别和演练级别聚合"
            :loading="loading"
            :error="loadError"
            :empty="!loading && !loadError && rows.length === 0"
            empty-title="暂无已提交演练记录"
            empty-description="调整日期或组织范围后重新查询。"
            :min-height="320"
            @retry="loadReport"
          >
            <template #actions
              ><ElTag type="success" effect="plain">{{ rows.length }} 个维度</ElTag></template
            >
            <ElTable
              :data="rows"
              height="100%"
              table-layout="fixed"
              empty-text="当前筛选范围暂无已提交演练记录"
            >
              <ElTableColumn
                prop="organizationName"
                label="演练组织"
                min-width="180"
                show-overflow-tooltip
              />
              <ElTableColumn prop="planCategory" label="计划类别" width="150"
                ><template #default="{ row }"
                  ><ArtDictDisplay
                    dict-code="smisEmergencyPlanCategory"
                    :value="row.planCategory"
                    display="tag" /></template
              ></ElTableColumn>
              <ElTableColumn prop="planLevel" label="演练级别" width="130"
                ><template #default="{ row }"
                  ><ArtDictDisplay
                    dict-code="smisEmergencyPlanLevel"
                    :value="row.planLevel" /></template
              ></ElTableColumn>
              <ElTableColumn prop="drillCount" label="实际演练次数" width="130" align="center"
                ><template #default="{ row }"
                  ><strong class="drill-report-page__number">{{ row.drillCount }}</strong></template
                ></ElTableColumn
              >
              <ElTableColumn prop="averageIntervalDays" label="平均间隔" width="130" align="center"
                ><template #default="{ row }">{{
                  row.averageIntervalDays == null ? '单次演练' : `${row.averageIntervalDays} 天`
                }}</template></ElTableColumn
              >
              <ElTableColumn prop="lateCount" label="延迟完成" width="110" align="center"
                ><template #default="{ row }"
                  ><ElTag :type="row.lateCount ? 'danger' : 'success'" effect="light">{{
                    row.lateCount
                  }}</ElTag></template
                ></ElTableColumn
              >
            </ElTable>
          </ArtSectionCard>
          <ArtSectionCard
            class="drill-report-page__panel drill-report-page__panel--warning"
            title="未兑现演练计划"
            subtitle="计划中且尚无已提交演练记录"
            :loading="loading"
            :error="loadError"
            :empty="!loading && !loadError && outstanding.length === 0"
            empty-title="当前范围没有未兑现计划"
            empty-description="所有计划均已兑现，或可调整筛选范围继续查看。"
            :min-height="320"
            @retry="loadReport"
          >
            <template #actions
              ><ElTag :type="outstanding.length ? 'warning' : 'success'" effect="light"
                >{{ outstanding.length }} 条</ElTag
              ></template
            >
            <ElTable
              :data="outstanding"
              height="100%"
              table-layout="fixed"
              empty-text="很好，当前范围没有未兑现演练计划"
            >
              <ElTableColumn prop="drillName" label="演练计划" min-width="210" show-overflow-tooltip
                ><template #default="{ row }"
                  ><div class="drill-report-page__plan"
                    ><strong>{{ row.drillName }}</strong
                    ><small>{{ row.planNo }}</small></div
                  ></template
                ></ElTableColumn
              >
              <ElTableColumn
                prop="organizationName"
                label="演练组织"
                min-width="150"
                show-overflow-tooltip
              />
              <ElTableColumn prop="planEndDate" label="计划完成日" width="120" />
              <ElTableColumn prop="warningStatus" label="状态" width="92"
                ><template #default="{ row }"
                  ><ArtDictDisplay
                    dict-code="smisEmergencyPlanWarningStatus"
                    :value="row.warningStatus"
                    display="tag" /></template
              ></ElTableColumn>
            </ElTable>
          </ArtSectionCard>
        </div>
      </div>
    </ElScrollbar>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import { fetchGetEnableOrganizationTree } from '@/api/system-manage'
  import { useUserStore } from '@/store/modules/user'
  import ArtSearchBar, {
    type SearchFormItem
  } from '@/components/core/forms/art-search-bar/index.vue'
  import ArtDictDisplay from '@/components/core/base/art-dict-display/index.vue'
  import ArtSectionCard from '@/components/core/surfaces/art-section-card/index.vue'
  import BusinessWorkspaceHeader, {
    type BusinessWorkspaceMetric
  } from '@/components/business/business-workspace-header/index.vue'
  import {
    fetchEmergencyDrillReport,
    type SmisEmergencyDrillReportRow,
    type SmisEmergencyOutstandingPlan,
    type SmisTreeOrganization
  } from '@smis/api'

  defineOptions({ name: 'SmisEmergencyDrillReport' })
  interface ReportQuery extends Record<string, unknown> {
    startDate?: string
    endDate?: string
    organizationId?: string
  }
  const userStore = useUserStore()
  const { getUserInfo } = storeToRefs(userStore)
  const query = reactive<ReportQuery>({})
  const loading = ref(false)
  const loadError = shallowRef<Error | null>(null)
  const organizations = shallowRef<SmisTreeOrganization[]>([])
  const rows = shallowRef<SmisEmergencyDrillReportRow[]>([])
  const outstanding = shallowRef<SmisEmergencyOutstandingPlan[]>([])
  const overview = reactive({
    planCount: 0,
    completedCount: 0,
    outstandingCount: 0,
    warningCount: 0,
    lateCount: 0
  })
  const metrics = computed<BusinessWorkspaceMetric[]>(() => [
    {
      label: '计划总数',
      value: overview.planCount,
      description: '筛选范围内计划',
      icon: 'ri:calendar-todo-line'
    },
    {
      label: '已兑现',
      value: overview.completedCount,
      description: '已有正式演练记录',
      icon: 'ri:checkbox-circle-line',
      tone: 'success'
    },
    {
      label: '未兑现',
      value: overview.outstandingCount,
      description: '计划中且无正式记录',
      icon: 'ri:time-line',
      tone: 'warning'
    },
    {
      label: '预警中',
      value: overview.warningCount,
      description: '三日内到期或已逾期',
      icon: 'ri:alarm-warning-line',
      tone: 'danger'
    }
  ])
  const searchItems = computed<SearchFormItem[]>(() => [
    {
      label: '开始日期',
      key: 'startDate',
      type: 'date',
      props: { valueFormat: 'YYYY-MM-DD', clearable: true, placeholder: '选择开始日期' }
    },
    {
      label: '结束日期',
      key: 'endDate',
      type: 'date',
      props: { valueFormat: 'YYYY-MM-DD', clearable: true, placeholder: '选择结束日期' }
    },
    {
      label: '演练组织',
      key: 'organizationId',
      type: 'treeSelect',
      props: {
        data: organizations.value,
        props: { label: 'organizationName', children: 'children' },
        nodeKey: 'id',
        valueKey: 'id',
        checkStrictly: true,
        filterable: true,
        clearable: true,
        defaultExpandAll: true,
        placeholder: '全部组织'
      }
    }
  ])
  const applyReport = (result: Awaited<ReturnType<typeof fetchEmergencyDrillReport>>): void => {
    if (result.error) {
      loadError.value = new Error('演练报表加载失败，请重试')
      return
    }
    Object.assign(overview, result.overview)
    rows.value = result.rows
    outstanding.value = result.outstanding
  }
  const loadReport = async (): Promise<void> => {
    if (loading.value) return
    if (query.startDate && query.endDate && query.startDate > query.endDate) {
      ElMessage.warning('开始日期不能晚于结束日期')
      return
    }
    loading.value = true
    loadError.value = null
    try {
      const result = await fetchEmergencyDrillReport(query)
      applyReport(result)
    } catch {
      loadError.value = new Error('演练报表加载失败，请重试')
    } finally {
      loading.value = false
    }
  }
  const resetQuery = () => {
    Object.assign(query, { startDate: undefined, endDate: undefined, organizationId: undefined })
    void loadReport()
  }
  onMounted(async () => {
    loading.value = true
    loadError.value = null
    try {
      const [tree, result] = await Promise.all([
        fetchGetEnableOrganizationTree({ tenantId: getUserInfo.value.tenantId }),
        fetchEmergencyDrillReport(),
        Promise.all(
          [
            'smisEmergencyPlanCategory',
            'smisEmergencyPlanLevel',
            'smisEmergencyPlanWarningStatus'
          ].map((code) => userStore.ensureDictLoaded(code))
        )
      ])
      organizations.value = (tree.data ?? []) as SmisTreeOrganization[]
      applyReport(result)
    } catch {
      loadError.value = new Error('演练报表加载失败，请重试')
    } finally {
      loading.value = false
    }
  })
</script>

<style scoped lang="scss">
  .drill-report-page {
    gap: 12px;
    min-width: 0;
    min-height: 0;
    overflow: hidden;

    &__scroll {
      flex: 1;
      min-width: 0;
      min-height: 0;
    }

    &__body {
      display: flex;
      flex-direction: column;
      gap: 12px;
      min-width: 0;
      height: 100%;
      min-height: 560px;
    }

    &__content {
      display: grid;
      flex: 1;
      grid-template-columns: minmax(0, 1.15fr) minmax(420px, 0.85fr);
      gap: 12px;
      min-height: 0;
    }

    &__panel {
      display: flex;
      flex-direction: column;
      min-width: 0;
      min-height: 0;

      :deep(.art-section-card__body) {
        flex: 1;
        min-height: 0;
      }

      &--warning {
        border-top: 3px solid color-mix(in srgb, var(--el-color-warning) 65%, transparent);
      }
    }

    &__number {
      font-size: 18px;
      color: var(--theme-color);
    }

    &__plan {
      display: grid;
      min-width: 0;

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

    @media (width <= 1180px) {
      &__body {
        height: auto;
        min-height: 960px;
      }

      &__content {
        grid-template-rows: minmax(400px, 1fr) minmax(360px, 0.85fr);
        grid-template-columns: 1fr;
      }
    }
  }
</style>
