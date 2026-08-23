<template>
  <div
    v-auth="'SmisSafetyDashboard:View'"
    class="smis-safety-dashboard art-full-height business-workspace-page"
  >
    <BusinessWorkspaceHeader
      eyebrow="SAFETY OPERATIONS CENTER"
      title="安全生产驾驶舱"
      description="汇总风险分级管控、检查隐患、事故事件和应急准备，形成租户范围内的只读安全态势。"
      icon="ri:dashboard-3-line"
      :tags="[
        { label: '双控闭环', type: 'primary' },
        { label: 'AI只读研判', type: 'success' }
      ]"
      :metrics="metrics"
      density="compact"
      refreshable
      refresh-label="刷新安全驾驶舱数据"
      :refresh-loading="state.loading"
      @metric-click="handleMetricClick"
      @refresh="loadDashboard"
    >
      <template #actions>
        <ElButton
          v-auth="'SmisSafetyDashboard:AiAnalyze'"
          type="primary"
          @click="void aiAdvisorRef?.handleOpen()"
        >
          <ArtSvgIcon icon="ri:sparkling-2-line" />AI 安全研判
        </ElButton>
      </template>
    </BusinessWorkspaceHeader>

    <ArtAsyncState
      :loading="state.loading"
      :error="state.error"
      :empty="!state.data"
      loading-mode="skeleton"
      @retry="loadDashboard"
    >
      <div v-if="state.data" class="smis-safety-dashboard__content">
        <section class="smis-safety-dashboard__overview-grid">
          <article class="smis-safety-dashboard__distribution art-card-xs">
            <header
              ><div><strong>风险等级结构</strong><p>当前启用风险点的动态 LEC 等级。</p></div
              ><ElTag effect="plain">{{ state.data.riskPointTotal }} 个</ElTag></header
            >
            <div class="smis-safety-dashboard__bars">
              <div v-for="item in state.data.riskDistribution" :key="item.level">
                <span>{{ riskLevelLabel(item.level) }}</span>
                <div
                  ><i :class="`is-${item.level}`" :style="{ width: distributionWidth(item.count) }"
                /></div>
                <strong>{{ item.count }}</strong>
              </div>
            </div>
          </article>
          <article class="smis-safety-dashboard__pulse art-card-xs">
            <header
              ><div><strong>闭环健康脉冲</strong><p>逾期事项和应急准备的即时信号。</p></div></header
            >
            <div class="smis-safety-dashboard__pulse-grid">
              <button type="button" @click="go(smisRoutes.hiddenDanger)"
                ><span class="is-danger"><ArtSvgIcon icon="ri:alarm-warning-line" /></span
                ><strong>{{ state.data.overdueDangerCount }}</strong
                ><small>逾期隐患</small></button
              >
              <button type="button" @click="go(smisRoutes.inspectionTask)"
                ><span class="is-warning"><ArtSvgIcon icon="ri:task-line" /></span
                ><strong>{{ state.data.pendingInspectionCount }}</strong
                ><small>待办检查</small></button
              >
              <button type="button" @click="go(smisRoutes.accident)"
                ><span class="is-danger"><ArtSvgIcon icon="ri:first-aid-kit-line" /></span
                ><strong>{{ state.data.openAccidentCount }}</strong
                ><small>未结事故</small></button
              >
              <button type="button" @click="go(smisRoutes.emergencyPlan)"
                ><span class="is-success"><ArtSvgIcon icon="ri:file-shield-2-line" /></span
                ><strong>{{ state.data.activeEmergencyPlanCount }}</strong
                ><small>生效预案</small></button
              >
            </div>
          </article>
        </section>

        <section class="smis-safety-dashboard__main-grid">
          <SafetyRiskMap :points="state.data.mapPoints" />
          <article class="smis-safety-dashboard__hotspots art-card-xs">
            <header
              ><div><strong>重点风险点</strong><p>按逾期隐患和开放隐患排序。</p></div
              ><ElButton text type="primary" @click="go(smisRoutes.riskPoint)"
                >查看全部</ElButton
              ></header
            >
            <div v-if="state.data.hotspots.length" class="smis-safety-dashboard__hotspot-list">
              <button
                v-for="(item, index) in state.data.hotspots"
                :key="item.id"
                type="button"
                @click="go(smisRoutes.riskPoint)"
              >
                <span>{{ String(index + 1).padStart(2, '0') }}</span>
                <div
                  ><strong>{{ item.riskPointName }}</strong
                  ><small>{{
                    [item.siteName, item.areaName].filter(Boolean).join(' · ') || item.riskPointNo
                  }}</small></div
                >
                <div class="smis-safety-dashboard__hotspot-tags"
                  ><ElTag v-if="item.overdueDangerCount" type="danger" size="small"
                    >逾期 {{ item.overdueDangerCount }}</ElTag
                  ><ElTag v-if="item.openDangerCount" type="warning" size="small"
                    >隐患 {{ item.openDangerCount }}</ElTag
                  ></div
                >
              </button>
            </div>
            <ArtEmptyState
              v-else
              compact
              title="暂无重点风险点"
              description="风险点建立并产生评估或隐患后会显示排序。"
            />
          </article>
        </section>

        <section class="smis-safety-dashboard__recent-grid">
          <article class="art-card-xs">
            <header
              ><div><strong>最新开放隐患</strong><p>优先关注重大、较大和已逾期记录。</p></div
              ><ElButton text type="primary" @click="go(smisRoutes.hiddenDanger)"
                >进入治理台账</ElButton
              ></header
            >
            <div v-if="state.data.recentDangers.length" class="smis-safety-dashboard__recent-list">
              <button
                v-for="item in state.data.recentDangers"
                :key="item.id"
                type="button"
                @click="go(smisRoutes.hiddenDanger)"
                ><span :class="`is-${item.dangerLevel}`"><ArtSvgIcon icon="ri:alert-line" /></span
                ><div
                  ><strong>{{ item.dangerTitle }}</strong
                  ><small
                    >{{ item.riskPoint?.riskPointName || item.dangerNo }} ·
                    {{ formatWithDayjs(item.reportedAt) }}</small
                  ></div
                ><ArtDictDisplay
                  dict-code="smisHiddenDangerStatus"
                  :value="item.status"
                  display="tag"
              /></button>
            </div>
            <ArtEmptyState
              v-else
              compact
              title="暂无开放隐患"
              description="当前没有待整改或待复查隐患。"
            />
          </article>
          <article class="art-card-xs">
            <header
              ><div><strong>最新未结事故事件</strong><p>跟踪原因调查、整改措施和结案进度。</p></div
              ><ElButton text type="primary" @click="go(smisRoutes.accident)"
                >进入事故台账</ElButton
              ></header
            >
            <div
              v-if="state.data.recentAccidents.length"
              class="smis-safety-dashboard__recent-list"
            >
              <button
                v-for="item in state.data.recentAccidents"
                :key="item.id"
                type="button"
                @click="go(smisRoutes.accident)"
                ><span :class="`is-${item.severity}`"
                  ><ArtSvgIcon icon="ri:first-aid-kit-line" /></span
                ><div
                  ><strong>{{ item.caseTitle }}</strong
                  ><small
                    >{{ item.location || item.caseNo }} ·
                    {{ formatWithDayjs(item.occurredAt) }}</small
                  ></div
                ><ArtDictDisplay
                  dict-code="smisAccidentCaseStatus"
                  :value="item.status"
                  display="tag"
              /></button>
            </div>
            <ArtEmptyState
              v-else
              compact
              title="暂无未结事故事件"
              description="当前事故与事件均已完成闭环。"
            />
          </article>
        </section>
      </div>
    </ArtAsyncState>
    <SafetyAiAdvisorDrawer ref="aiAdvisorRef" />
  </div>
</template>

<script setup lang="ts">
  import ArtAsyncState from '@/components/core/layouts/art-async-state/index.vue'
  import ArtEmptyState from '@/components/core/layouts/art-empty-state/index.vue'
  import ArtDictDisplay from '@/components/core/base/art-dict-display/index.vue'
  import BusinessWorkspaceHeader, {
    type BusinessWorkspaceMetric
  } from '@/components/business/business-workspace-header/index.vue'
  import { fetchSmisSafetyDashboard } from '@smis/api'
  import { formatWithDayjs } from '@/utils/time'
  import SafetyRiskMap from './modules/safety-risk-map.vue'
  import SafetyAiAdvisorDrawer from './modules/safety-ai-advisor-drawer.vue'

  defineOptions({ name: 'SmisSafetyDashboard' })
  const router = useRouter()
  const aiAdvisorRef = ref<{ handleOpen: () => Promise<void> }>()
  const smisRoutes = {
    riskPoint: '/smis/dual-control/risk-control/risk-identification',
    inspectionTask: '/smis/dual-control/risk-control/inspection-task',
    hiddenDanger: '/smis/dual-control/risk-control/danger-governance',
    accident: '/smis/production/safety-accident/casualty-quick-report',
    emergencyPlan: '/smis/production/emergency-rescue/emergency-plan',
    emergencyDrill: '/smis/production/emergency-rescue/emergency-drill-plan'
  } as const
  const metricPaths: Record<string, string> = {
    'risk-point': smisRoutes.riskPoint,
    'hidden-danger': smisRoutes.hiddenDanger,
    accident: smisRoutes.accident,
    'emergency-drill': smisRoutes.emergencyDrill
  }
  const state = reactive<{
    loading: boolean
    error: Error | null
    data: Api.Smis.Dashboard.SafetyDashboardData | null
  }>({ loading: false, error: null, data: null })
  const metrics = computed<BusinessWorkspaceMetric[]>(() => [
    {
      key: 'risk-point',
      label: '风险点',
      value: state.data?.riskPointTotal ?? 0,
      description: `较大及以上 ${state.data?.majorRiskPointCount ?? 0}`,
      icon: 'ri:radar-line',
      interactive: true
    },
    {
      key: 'hidden-danger',
      label: '开放隐患',
      value: state.data?.openDangerCount ?? 0,
      description: `已逾期 ${state.data?.overdueDangerCount ?? 0}`,
      icon: 'ri:alert-line',
      tone: state.data?.overdueDangerCount ? 'danger' : 'warning',
      interactive: true
    },
    {
      key: 'accident',
      label: '未结事故',
      value: state.data?.openAccidentCount ?? 0,
      description: '调查、整改或待结案',
      icon: 'ri:first-aid-kit-line',
      tone: state.data?.openAccidentCount ? 'danger' : 'success',
      interactive: true
    },
    {
      key: 'emergency-drill',
      label: '近期演练',
      value: state.data?.upcomingDrillCount ?? 0,
      description: '未来 30 天计划',
      icon: 'ri:team-line',
      tone: 'success',
      interactive: true
    }
  ])
  const maxDistribution = computed(() =>
    Math.max(1, ...(state.data?.riskDistribution.map((item) => item.count) ?? [1]))
  )
  const distributionWidth = (count: number): string =>
    `${Math.max(count ? 8 : 0, (count / maxDistribution.value) * 100)}%`
  const riskLevelLabel = (level: Api.Smis.RiskControl.RiskLevel) =>
    ({ low: '低风险', general: '一般风险', major: '较大风险', critical: '重大风险' })[level]
  const go = (path: string): void => {
    void router.push(path)
  }
  const handleMetricClick = (metric: BusinessWorkspaceMetric): void => {
    const path = metricPaths[metric.key ?? '']
    if (path) go(path)
  }
  const loadDashboard = async (): Promise<void> => {
    state.loading = true
    state.error = null
    try {
      const result = await fetchSmisSafetyDashboard()
      state.data = result.data
    } catch (error) {
      state.error = error instanceof Error ? error : new Error('安全驾驶舱加载失败')
    } finally {
      state.loading = false
    }
  }
  onMounted(() => void loadDashboard())
</script>

<style scoped lang="scss">
  .smis-safety-dashboard {
    gap: 12px;
    min-width: 0;
  }

  .smis-safety-dashboard__content {
    display: grid;
    gap: 12px;
    min-width: 0;
  }

  .smis-safety-dashboard__overview-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .smis-safety-dashboard article {
    min-width: 0;
    padding: 16px;
  }

  .smis-safety-dashboard article > header {
    display: flex;
    gap: 16px;
    align-items: flex-start;
    justify-content: space-between;
  }

  .smis-safety-dashboard article > header strong {
    font-size: 15px;
    color: var(--el-text-color-primary);
  }

  .smis-safety-dashboard article > header p {
    margin: 4px 0 0;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .smis-safety-dashboard__bars {
    display: grid;
    gap: 12px;
    margin-top: 16px;
  }

  .smis-safety-dashboard__bars > div {
    display: grid;
    grid-template-columns: 74px minmax(0, 1fr) 34px;
    gap: 12px;
    align-items: center;
  }

  .smis-safety-dashboard__bars > div > div {
    height: 8px;
    overflow: hidden;
    background: var(--el-fill-color-light);
    border-radius: 99px;
  }

  .smis-safety-dashboard__bars i {
    display: block;
    height: 100%;
    background: var(--el-color-success);
    border-radius: inherit;
  }

  .smis-safety-dashboard__bars i.is-general {
    background: var(--el-color-warning);
  }

  .smis-safety-dashboard__bars i.is-major {
    background: color-mix(in srgb, var(--el-color-danger) 62%, var(--el-color-warning));
  }

  .smis-safety-dashboard__bars i.is-critical {
    background: var(--el-color-danger);
  }

  .smis-safety-dashboard__pulse-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
    margin-top: 14px;
  }

  .smis-safety-dashboard__pulse-grid button {
    display: grid;
    gap: 5px;
    place-items: center;
    padding: 11px 8px;
    color: inherit;
    cursor: pointer;
    background: var(--el-fill-color-lighter);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: var(--el-border-radius-base);
    transition:
      color 0.18s ease,
      background-color 0.18s ease,
      border-color 0.18s ease;
  }

  .smis-safety-dashboard__pulse-grid button:hover,
  .smis-safety-dashboard__pulse-grid button:focus-visible {
    color: var(--theme-color);
    background: color-mix(in srgb, var(--theme-color) 6%, var(--default-box-color));
    border-color: var(--theme-color);
  }

  .smis-safety-dashboard__pulse-grid button:focus-visible,
  .smis-safety-dashboard__hotspot-list button:focus-visible,
  .smis-safety-dashboard__recent-list button:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--theme-color) 52%, transparent);
    outline-offset: 2px;
  }

  .smis-safety-dashboard__pulse-grid span {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    border-radius: var(--el-border-radius-base);
  }

  .smis-safety-dashboard__pulse-grid span.is-danger {
    color: var(--el-color-danger);
    background: var(--el-color-danger-light-9);
  }

  .smis-safety-dashboard__pulse-grid span.is-warning {
    color: var(--el-color-warning);
    background: var(--el-color-warning-light-9);
  }

  .smis-safety-dashboard__pulse-grid span.is-success {
    color: var(--el-color-success);
    background: var(--el-color-success-light-9);
  }

  .smis-safety-dashboard__pulse-grid strong {
    font-size: 22px;
  }

  .smis-safety-dashboard__pulse-grid small {
    color: var(--el-text-color-secondary);
  }

  .smis-safety-dashboard__main-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.7fr) minmax(320px, 0.8fr);
    gap: 12px;
  }

  .smis-safety-dashboard__hotspot-list,
  .smis-safety-dashboard__recent-list {
    display: grid;
    gap: 8px;
    margin-top: 14px;
  }

  .smis-safety-dashboard__hotspot-list button,
  .smis-safety-dashboard__recent-list button {
    display: flex;
    gap: 11px;
    align-items: center;
    width: 100%;
    min-width: 0;
    padding: 9px 10px;
    color: inherit;
    text-align: left;
    cursor: pointer;
    background: transparent;
    border: 0;
    border: 1px solid transparent;
    border-radius: var(--el-border-radius-base);
    transition:
      background-color 0.18s ease,
      border-color 0.18s ease;
  }

  .smis-safety-dashboard__hotspot-list button:hover,
  .smis-safety-dashboard__recent-list button:hover {
    background: var(--el-fill-color-lighter);
    border-color: var(--el-border-color-lighter);
  }

  .smis-safety-dashboard__hotspot-list button > span,
  .smis-safety-dashboard__recent-list button > span {
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    width: 34px;
    height: 34px;
    color: var(--theme-color);
    background: color-mix(in srgb, var(--theme-color) 10%, var(--el-bg-color));
    border-radius: var(--el-border-radius-base);
  }

  .smis-safety-dashboard__hotspot-list button > div:not(.smis-safety-dashboard__hotspot-tags),
  .smis-safety-dashboard__recent-list button > div {
    display: grid;
    flex: 1;
    gap: 3px;
    min-width: 0;
  }

  .smis-safety-dashboard__hotspot-list small,
  .smis-safety-dashboard__recent-list small {
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--el-text-color-secondary);
    white-space: nowrap;
  }

  .smis-safety-dashboard__hotspot-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    justify-content: flex-end;
  }

  .smis-safety-dashboard__recent-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .smis-safety-dashboard__recent-list span.is-major {
    color: var(--el-color-warning);
    background: var(--el-color-warning-light-9);
  }

  .smis-safety-dashboard__recent-list span.is-critical {
    color: var(--el-color-danger);
    background: var(--el-color-danger-light-9);
  }

  @media (width <= 1180px) {
    .smis-safety-dashboard__main-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (width <= 900px) {
    .smis-safety-dashboard__overview-grid,
    .smis-safety-dashboard__recent-grid {
      grid-template-columns: 1fr;
    }

    .smis-safety-dashboard__pulse-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (width <= 560px) {
    .smis-safety-dashboard__pulse-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
