<template>
  <div
    v-auth="'SmisCatalog:View'"
    class="training-analytics-page business-workspace-page art-full-height"
  >
    <BusinessWorkspaceHeader
      eyebrow="SAFETY LEARNING ASSURANCE"
      title="培训统计报表"
      description="贯通培训计划、实施签到、考核结果与人员证照，优先发现覆盖不足和临期风险。"
      icon="ri:graduation-cap-line"
      :tags="[
        { label: '培训闭环', type: 'primary' },
        { label: '资质临期', type: 'warning' },
        { label: '只读分析', type: 'success' }
      ]"
      :metrics="metrics"
      refreshable
      refresh-label="刷新培训分析"
      :refresh-loading="state.loading"
      @refresh="loadData"
    />

    <ArtAsyncState
      v-if="state.loading || state.error"
      :loading="state.loading"
      loading-mode="skeleton"
      :skeleton-rows="7"
      :error="state.error"
      error-title="培训统计加载失败"
      :min-height="420"
      @retry="loadData"
    />

    <template v-else>
      <section
        class="training-analytics-page__assurance art-card-xs"
        :class="{ 'is-attention': assuranceState.attention }"
      >
        <span><ArtSvgIcon :icon="assuranceState.icon" /></span>
        <div>
          <strong>{{ assuranceState.title }}</strong>
          <p>{{ assuranceState.description }}</p>
        </div>
        <ElButton type="primary" plain @click="openTrainingRecords"> 查看培训记录 </ElButton>
      </section>

      <div class="training-analytics-page__grid">
        <section class="training-analytics-page__quality art-card-xs">
          <header>
            <div>
              <ArtSectionTitle :show-line="false">培训质量</ArtSectionTitle>
              <p>基于培训记录中的应到、签到与考核合格人数计算。</p>
            </div>
            <ElTag effect="plain" round>{{ trainingRecords.length }} 场培训</ElTag>
          </header>
          <div class="training-analytics-page__quality-grid">
            <article>
              <div>
                <span>签到率</span>
                <strong>{{ attendanceRate }}%</strong>
              </div>
              <ElProgress
                :percentage="attendanceRate"
                :stroke-width="9"
                :status="attendanceProgressStatus"
              />
              <small>{{ checkinCount }} / {{ attendeeCount }} 人次</small>
            </article>
            <article>
              <div>
                <span>考核合格率</span>
                <strong>{{ qualificationRate }}%</strong>
              </div>
              <ElProgress
                :percentage="qualificationRate"
                :stroke-width="9"
                :status="qualificationProgressStatus"
              />
              <small>{{ qualifiedCount }} / {{ checkinCount }} 人次</small>
            </article>
            <article>
              <div>
                <span>累计培训学时</span>
                <strong>{{ totalTrainingHours }}</strong>
              </div>
              <p>来自已登记培训记录</p>
              <small>课程库 {{ courseCount }} 门 · 考试 {{ exams.length }} 场</small>
            </article>
          </div>
        </section>

        <section class="training-analytics-page__plans art-card-xs">
          <header>
            <div>
              <ArtSectionTitle :show-line="false">计划执行</ArtSectionTitle>
              <p>关注仍在推进中的计划及尚未沉淀实施记录的主题。</p>
            </div>
            <ElButton link type="primary" @click="openTrainingPlans">维护计划</ElButton>
          </header>
          <ArtEmptyState
            v-if="!trainingPlans.length"
            title="暂无培训计划"
            description="创建计划后会在这里展示执行状态。"
            icon="ri:calendar-check-line"
          />
          <ElScrollbar v-else max-height="248px">
            <div class="training-analytics-page__plan-list">
              <article v-for="plan in trainingPlans.slice(0, 8)" :key="plan.id || plan.recordNo">
                <BusinessRecordLink
                  :label="plan.title"
                  :meta="plan.recordNo"
                  :description="textValue(plan.payload.trainingType, '未分类')"
                  interactive
                  compact
                  @click="openRecord(plan)"
                />
                <span>{{ dateRange(plan.payload.startDate, plan.payload.endDate) }}</span>
                <ElTag :type="statusTagType(plan.status)" effect="light" size="small">
                  {{ statusLabel(plan.status) }}
                </ElTag>
              </article>
            </div>
          </ElScrollbar>
        </section>
      </div>

      <section class="training-analytics-page__certificates art-card-xs">
        <header>
          <div>
            <ArtSectionTitle :show-line="false">证照临期与过期</ArtSectionTitle>
            <p>覆盖特种作业操作证、安全管理人员证和注册安全工程师台账。</p>
          </div>
          <ElTag :type="certificateRiskCount ? 'warning' : 'success'" effect="plain" round>
            {{ certificateRiskCount ? `${certificateRiskCount} 项需关注` : '证照状态正常' }}
          </ElTag>
        </header>
        <ArtEmptyState
          v-if="!certificateRisks.length"
          title="暂无临期或过期证照"
          description="未来 60 天内没有需要关注的证照记录。"
          icon="ri:shield-check-line"
        />
        <div v-else class="training-analytics-page__certificate-list">
          <article
            v-for="item in certificateRisks.slice(0, 10)"
            :key="item.record.id || item.record.recordNo"
          >
            <span :class="item.daysRemaining < 0 ? 'is-danger' : 'is-warning'">
              <ArtSvgIcon
                :icon="item.daysRemaining < 0 ? 'ri:error-warning-line' : 'ri:timer-line'"
              />
            </span>
            <BusinessRecordLink
              :label="textValue(item.record.payload.employeeName, item.record.title)"
              :meta="item.record.recordNo"
              :description="textValue(item.record.payload.certificateType, '安全资质')"
              interactive
              compact
              @click="openRecord(item.record)"
            />
            <p>{{ formatDate(item.expiryDate) }}</p>
            <ElTag
              :type="item.daysRemaining < 0 ? 'danger' : 'warning'"
              effect="light"
              size="small"
            >
              {{
                item.daysRemaining < 0
                  ? `已过期 ${Math.abs(item.daysRemaining)} 天`
                  : `${item.daysRemaining} 天后到期`
              }}
            </ElTag>
          </article>
        </div>
      </section>

      <section class="training-analytics-page__recent art-card-xs">
        <header>
          <div>
            <ArtSectionTitle :show-line="false">近期培训实施</ArtSectionTitle>
            <p>按培训时间倒序展示最近的签到与考核结果。</p>
          </div>
          <span>数据更新于 {{ formatDate(state.generatedAt, true) }}</span>
        </header>
        <ArtEmptyState
          v-if="!trainingRecords.length"
          title="暂无培训实施记录"
          description="完成培训后登记签到与考核结果即可形成分析。"
          icon="ri:article-line"
        />
        <div v-else class="training-analytics-page__recent-list">
          <article
            v-for="record in trainingRecords.slice(0, 8)"
            :key="record.id || record.recordNo"
          >
            <BusinessRecordLink
              :label="record.title"
              :meta="record.recordNo"
              :description="textValue(record.payload.courseName, '未关联课程')"
              interactive
              compact
              @click="openRecord(record)"
            />
            <p
              ><span>培训时间</span><strong>{{ formatDate(record.payload.occurredAt) }}</strong></p
            >
            <p
              ><span>签到</span
              ><strong>{{ numberValue(record.payload.checkinCount) }} 人</strong></p
            >
            <p
              ><span>合格</span
              ><strong>{{ numberValue(record.payload.qualifiedCount) }} 人</strong></p
            >
          </article>
        </div>
      </section>
    </template>
    <SafetyCatalogDetailDrawer ref="detailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
  import dayjs from 'dayjs'
  import { sumBy, toNumber } from 'lodash-es'
  import type { TagProps } from 'element-plus'
  import BusinessWorkspaceHeader, {
    type BusinessWorkspaceMetric
  } from '@/components/business/business-workspace-header/index.vue'
  import BusinessRecordLink from '@/components/business/business-record-link/index.vue'
  import ArtAsyncState from '@/components/core/layouts/art-async-state/index.vue'
  import ArtEmptyState from '@/components/core/layouts/art-empty-state/index.vue'
  import ArtSectionTitle from '@/components/core/forms/art-section-title/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import { createFriendlySupabaseError } from '@/utils/supabase'
  import { fetchSafetyCatalogRecords, type SafetyCatalogRecord } from '@smis/api'
  import { getSafetyModuleDefinition } from '@smis/domain/safety-module-catalog'
  import SafetyCatalogDetailDrawer from '../catalog/modules/safety-catalog-detail-drawer.vue'

  defineOptions({ name: 'SmisTrainingAnalytics' })

  interface CertificateRisk {
    record: SafetyCatalogRecord
    expiryDate: string
    daysRemaining: number
  }

  const router = useRouter()
  const detailDrawerRef = ref<{
    handleOpen: (data: {
      workspace: ReturnType<typeof getSafetyModuleDefinition>
      record: SafetyCatalogRecord
    }) => Promise<void>
  }>()
  const state = reactive<{
    loading: boolean
    error: Error | null
    generatedAt: string
    rows: SafetyCatalogRecord[]
  }>({ loading: false, error: null, generatedAt: '', rows: [] })
  const moduleCodes = [
    'training-plan',
    'training-record',
    'course-management',
    'exam-management',
    'special-operation-certificate',
    'safety-manager-certificate',
    'registered-safety-engineer'
  ]

  const byModule = (moduleCode: string): SafetyCatalogRecord[] =>
    state.rows.filter((row) => row.moduleCode === moduleCode)
  const trainingPlans = computed(() => byModule('training-plan'))
  const trainingRecords = computed(() =>
    byModule('training-record').sort(
      (left, right) =>
        dateTimestamp(right.payload.occurredAt) - dateTimestamp(left.payload.occurredAt)
    )
  )
  const exams = computed(() => byModule('exam-management'))
  const courseCount = computed(() => byModule('course-management').length)
  const certificates = computed(() =>
    state.rows.filter((row) =>
      [
        'special-operation-certificate',
        'safety-manager-certificate',
        'registered-safety-engineer'
      ].includes(row.moduleCode)
    )
  )

  const numberValue = (value: unknown): number => {
    const number = toNumber(value)
    return Number.isFinite(number) ? number : 0
  }
  const textValue = (value: unknown, fallback = '--'): string =>
    typeof value === 'string' && value.trim() ? value.trim() : fallback
  const dateTimestamp = (value: unknown): number => {
    const date = dayjs(typeof value === 'string' ? value : undefined)
    return date.isValid() ? date.valueOf() : 0
  }
  const formatDate = (value: unknown, withTime = false): string => {
    const date = dayjs(typeof value === 'string' ? value : undefined)
    return date.isValid() ? date.format(withTime ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD') : '--'
  }
  const dateRange = (start: unknown, end: unknown): string =>
    `${formatDate(start)} 至 ${formatDate(end)}`

  const attendeeCount = computed(() =>
    sumBy(trainingRecords.value, (record) => numberValue(record.payload.attendeeCount))
  )
  const checkinCount = computed(() =>
    sumBy(trainingRecords.value, (record) => numberValue(record.payload.checkinCount))
  )
  const qualifiedCount = computed(() =>
    sumBy(trainingRecords.value, (record) => numberValue(record.payload.qualifiedCount))
  )
  const totalTrainingHours = computed(() =>
    Number(
      sumBy(trainingRecords.value, (record) => numberValue(record.payload.trainingHours)).toFixed(1)
    )
  )
  const ratio = (numerator: number, denominator: number): number =>
    denominator > 0 ? Math.min(100, Math.round((numerator / denominator) * 100)) : 0
  const attendanceRate = computed(() => ratio(checkinCount.value, attendeeCount.value))
  const qualificationRate = computed(() => ratio(qualifiedCount.value, checkinCount.value))
  const hasAttendanceSample = computed(() => attendeeCount.value > 0)
  const hasQualificationSample = computed(() => checkinCount.value > 0)
  const attendanceProgressStatus = computed(() => {
    if (!hasAttendanceSample.value) return undefined
    if (attendanceRate.value < 80) return 'exception'
    return attendanceRate.value < 90 ? 'warning' : 'success'
  })
  const qualificationProgressStatus = computed(() => {
    if (!hasQualificationSample.value) return undefined
    if (qualificationRate.value < 80) return 'exception'
    return qualificationRate.value < 90 ? 'warning' : 'success'
  })
  const activePlanCount = computed(
    () =>
      trainingPlans.value.filter((plan) => ['draft', 'pending', 'active'].includes(plan.status))
        .length
  )
  const certificateRisks = computed<CertificateRisk[]>(() =>
    certificates.value
      .flatMap((record) => {
        const expiryDate = textValue(record.payload.expiryDate, '')
        if (!expiryDate) return []
        const daysRemaining = dayjs(expiryDate).startOf('day').diff(dayjs().startOf('day'), 'day')
        return daysRemaining <= 60 ? [{ record, expiryDate, daysRemaining }] : []
      })
      .sort((left, right) => left.daysRemaining - right.daysRemaining)
  )
  const certificateRiskCount = computed(() => certificateRisks.value.length)

  const metrics = computed<BusinessWorkspaceMetric[]>(() => [
    {
      label: '推进中计划',
      value: activePlanCount.value,
      description: `共 ${trainingPlans.value.length} 个培训计划`,
      icon: 'ri:calendar-check-line',
      tone: 'primary',
      loading: state.loading
    },
    {
      label: '培训签到率',
      value: `${attendanceRate.value}%`,
      description: hasAttendanceSample.value
        ? `${checkinCount.value} / ${attendeeCount.value} 人次`
        : '暂无签到样本',
      icon: 'ri:user-follow-line',
      tone: !hasAttendanceSample.value ? 'info' : attendanceRate.value < 90 ? 'warning' : 'success',
      loading: state.loading
    },
    {
      label: '考核合格率',
      value: `${qualificationRate.value}%`,
      description: hasQualificationSample.value
        ? `${qualifiedCount.value} 人次合格`
        : '暂无考核样本',
      icon: 'ri:medal-line',
      tone: !hasQualificationSample.value
        ? 'info'
        : qualificationRate.value < 90
          ? 'warning'
          : 'success',
      loading: state.loading
    },
    {
      label: '临期 / 过期证照',
      value: certificateRiskCount.value,
      description: '未来 60 天需关注',
      icon: 'ri:shield-keyhole-line',
      tone: certificateRiskCount.value ? 'danger' : 'success',
      loading: state.loading
    }
  ])
  const assuranceState = computed(() => {
    if (certificateRiskCount.value > 0) {
      return {
        icon: 'ri:alert-line',
        title: '培训保障存在待改进项',
        description: `当前有 ${certificateRiskCount.value} 项证照风险，建议优先安排复审并核对关联人员。`,
        attention: true
      }
    }
    if (hasAttendanceSample.value && attendanceRate.value < 90) {
      return {
        icon: 'ri:alert-line',
        title: '培训签到覆盖需要提升',
        description: `当前培训签到率为 ${attendanceRate.value}%，建议核对缺勤原因并安排补训。`,
        attention: true
      }
    }
    if (!hasAttendanceSample.value) {
      return {
        icon: 'ri:information-line',
        title: '培训分析样本尚未形成',
        description: '登记培训签到与考核结果后，系统将自动评估覆盖率和培训质量。',
        attention: false
      }
    }
    return {
      icon: 'ri:shield-check-line',
      title: '培训与资质保障整体稳定',
      description: '当前签到、考核和证照有效期未发现显著风险，请持续按计划沉淀培训记录。',
      attention: false
    }
  })

  const statusLabel = (status: string): string =>
    ({
      draft: '草稿',
      pending: '待审核',
      active: '执行中',
      completed: '已完成',
      disabled: '已停用'
    })[status] ?? status
  const statusTagType = (status: string): TagProps['type'] => {
    if (status === 'completed') return 'success'
    if (status === 'active') return 'primary'
    if (status === 'pending') return 'warning'
    return 'info'
  }

  const openTrainingPlans = (): void => {
    void router.push('/smis/qualification/training-management/training-plan')
  }
  const openTrainingRecords = (): void => {
    void router.push('/smis/qualification/training-management/training-record')
  }
  const openRecord = (record: SafetyCatalogRecord): void => {
    void detailDrawerRef.value?.handleOpen({
      workspace: getSafetyModuleDefinition(record.moduleCode),
      record
    })
  }

  async function loadData(): Promise<void> {
    state.loading = true
    state.error = null
    try {
      const result = await fetchSafetyCatalogRecords({
        moduleCode: moduleCodes[0],
        moduleCodes,
        from: 0,
        to: 999
      })
      if (result.error) throw result.error
      state.rows = result.data ?? []
      state.generatedAt = new Date().toISOString()
    } catch (error) {
      state.error = createFriendlySupabaseError(error, '培训统计加载失败，请稍后重试')
    } finally {
      state.loading = false
    }
  }

  onMounted(() => void loadData())
</script>

<style scoped lang="scss">
  .training-analytics-page {
    gap: 12px;
    min-width: 0;
    overflow: hidden;

    &__assurance,
    &__quality,
    &__plans,
    &__certificates,
    &__recent {
      min-width: 0;
      padding: 16px;
    }

    &__assurance {
      display: flex;
      gap: 14px;
      align-items: center;
      border-left: 3px solid var(--el-color-success);

      > span {
        display: grid;
        flex: 0 0 38px;
        place-items: center;
        width: 38px;
        height: 38px;
        color: var(--el-color-success);
        background: var(--el-color-success-light-9);
        border-radius: var(--el-border-radius-base);
      }

      > div {
        flex: 1;
        min-width: 0;
      }

      strong {
        color: var(--art-gray-900);
      }

      p {
        margin: 3px 0 0;
        font-size: 12px;
        color: var(--art-gray-600);
      }

      &.is-attention {
        border-left-color: var(--el-color-warning);

        > span {
          color: var(--el-color-warning-dark-2);
          background: var(--el-color-warning-light-9);
        }
      }
    }

    &__grid {
      display: grid;
      grid-template-columns: minmax(0, 1.2fr) minmax(360px, 0.8fr);
      gap: 12px;
      min-width: 0;
    }

    header {
      display: flex;
      gap: 16px;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 14px;

      p,
      > span {
        margin: 3px 0 0;
        font-size: 11px;
        color: var(--art-gray-500);
      }
    }

    &__quality-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 10px;

      article {
        display: grid;
        gap: 10px;
        align-content: start;
        min-width: 0;
        padding: 13px;
        background: var(--art-gray-50);
        border-radius: var(--el-border-radius-base);

        > div {
          display: flex;
          gap: 10px;
          align-items: baseline;
          justify-content: space-between;
        }

        span,
        small,
        p {
          font-size: 11px;
          color: var(--art-gray-500);
        }

        strong {
          font-size: 22px;
          color: var(--art-gray-900);
        }

        p {
          margin: 0;
        }
      }
    }

    &__plan-list,
    &__certificate-list,
    &__recent-list {
      display: grid;
      gap: 8px;

      article {
        min-width: 0;
        padding: 10px 12px;
        background: var(--art-gray-50);
        border-radius: var(--el-border-radius-base);
      }
    }

    &__plan-list {
      padding-right: 8px;

      article {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto auto;
        gap: 10px;
        align-items: center;

        > div {
          display: grid;
          gap: 3px;
          min-width: 0;
        }

        strong,
        small,
        > span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        small,
        > span {
          font-size: 11px;
          color: var(--art-gray-500);
        }
      }
    }

    &__certificate-list {
      grid-template-columns: repeat(2, minmax(0, 1fr));

      article {
        display: grid;
        grid-template-columns: 34px minmax(0, 1fr) auto auto;
        gap: 10px;
        align-items: center;

        > span {
          display: grid;
          place-items: center;
          width: 34px;
          height: 34px;
          border-radius: var(--el-border-radius-base);

          &.is-danger {
            color: var(--el-color-danger);
            background: var(--el-color-danger-light-9);
          }

          &.is-warning {
            color: var(--el-color-warning-dark-2);
            background: var(--el-color-warning-light-9);
          }
        }

        > div {
          display: grid;
          gap: 3px;
          min-width: 0;
        }

        strong,
        small {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        small,
        p {
          font-size: 11px;
          color: var(--art-gray-500);
        }

        p {
          margin: 0;
        }
      }
    }

    &__recent-list article {
      display: grid;
      grid-template-columns: minmax(200px, 1.4fr) repeat(3, minmax(96px, 0.6fr));
      gap: 12px;
      align-items: center;

      > div,
      p {
        display: grid;
        gap: 3px;
        min-width: 0;
      }

      p {
        margin: 0;
      }

      span,
      small {
        font-size: 10px;
        color: var(--art-gray-500);
      }

      strong,
      small {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    @media (width <= 1100px) {
      overflow: visible;

      &__grid {
        grid-template-columns: 1fr;
      }

      &__certificate-list {
        grid-template-columns: 1fr;
      }
    }

    @media (width <= 760px) {
      height: auto;

      &__assurance,
      header {
        flex-direction: column;
        align-items: flex-start;
      }

      &__assurance .el-button {
        width: 100%;
      }

      &__quality-grid {
        grid-template-columns: 1fr;
      }

      &__plan-list article,
      &__certificate-list article,
      &__recent-list article {
        grid-template-columns: 1fr;
      }

      &__certificate-list article > span {
        display: none;
      }
    }
  }
</style>
