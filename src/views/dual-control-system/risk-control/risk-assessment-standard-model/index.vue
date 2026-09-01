<template>
  <ArtPermissionGuard permission="SmisDualControlRiskAssessmentStandardModel:View">
    <div class="risk-model-page business-workspace-page art-full-height">
      <BusinessWorkspaceHeader
        eyebrow="QUANTITATIVE RISK MODEL"
        title="风险评估标准模型"
        description="维护 LEC 作业条件危险分析法与 LS 风险矩阵的判定标准、分值区间和风险等级映射。"
        icon="ri:function-line"
        density="compact"
        refreshable
        :refresh-loading="loading"
        @refresh="loadModels"
        :tags="[
          { label: 'LEC 定量评价', type: 'primary', effect: 'plain' },
          { label: 'LS 风险矩阵', type: 'warning', effect: 'light' },
          { label: '自动匹配等级', type: 'success', effect: 'plain' }
        ]"
        :metrics="metrics"
      >
      </BusinessWorkspaceHeader>

      <ElScrollbar class="risk-model-page__scrollbar">
        <div class="risk-model-page__content">
          <div class="risk-model-page__method-switch" role="tablist" aria-label="风险评估方法">
            <button
              v-for="model in models"
              :key="model.id"
              type="button"
              role="tab"
              :aria-selected="activeMethod === model.methodCode"
              :class="{ 'is-active': activeMethod === model.methodCode }"
              @click="activeMethod = model.methodCode"
            >
              <span>{{ model.methodCode }}</span
              ><div
                ><strong>{{ model.modelName }}</strong
                ><small>{{ model.description }}</small></div
              ><ArtSvgIcon icon="ri:arrow-right-s-line" />
            </button>
          </div>

          <ArtSectionCard
            v-if="activeModel"
            class="risk-model-page__formula"
            :title="activeModel.modelName"
            :subtitle="activeModel.description || ''"
            :loading="loading"
            :error="error"
            @retry="loadModels"
          >
            <div class="risk-model-page__equation"
              ><span
                v-for="(part, index) in equationParts"
                :key="`${part}-${index}`"
                :class="{ 'is-operator': ['×', '='].includes(part) }"
                >{{ part }}</span
              ></div
            >
            <p>{{
              activeMethod === 'LEC'
                ? 'D = L × E × C，系统依据 D 值自动匹配风险等级。'
                : 'R = L × S，矩阵交叉结果自动映射风险等级。'
            }}</p>
          </ArtSectionCard>

          <div v-if="activeModel" class="risk-model-page__dimension-grid">
            <ArtSectionCard
              v-for="dimension in activeModel.dimensions"
              :key="dimension.id"
              :title="`${dimension.dimensionCode} · ${dimension.dimensionName}`"
              :subtitle="dimension.description || '配置该维度的量化判定标准'"
            >
              <template #actions
                ><ArtIconButton
                  icon="ri:add-line"
                  label="新增判定标准"
                  permission="SmisDualControlRiskAssessmentStandardModel:Add"
                  @click="openCriterion(dimension)"
              /></template>
              <ElTable :data="dimension.criteria" table-layout="fixed" max-height="330">
                <ElTableColumn prop="score" label="分值" width="86" align="center"
                  ><template #default="{ row }"
                    ><strong class="risk-model-page__score">{{ row.score }}</strong></template
                  ></ElTableColumn
                >
                <ElTableColumn
                  prop="criterionText"
                  label="判定标准"
                  min-width="230"
                  show-overflow-tooltip
                />
                <ElTableColumn label="操作" width="88" align="right"
                  ><template #default="{ row }"
                    ><ArtButtonTable
                      type="edit"
                      permission="SmisDualControlRiskAssessmentStandardModel:Edit"
                      label="编辑判定标准"
                      @click="openCriterionRow(dimension, row)" /><ArtButtonTable
                      type="delete"
                      permission="SmisDualControlRiskAssessmentStandardModel:Delete"
                      label="删除判定标准"
                      @click="deleteCriterionRow(row)" /></template
                ></ElTableColumn>
              </ElTable>
            </ArtSectionCard>
          </div>

          <ArtSectionCard
            v-if="activeModel"
            title="风险等级映射"
            subtitle="分值达到最低值且低于最高值时匹配对应等级；最高等级可无上限。"
          >
            <div class="risk-model-page__levels">
              <button
                v-for="level in activeModel.levels"
                :key="level.id"
                v-auth="'SmisDualControlRiskAssessmentStandardModel:Edit'"
                type="button"
                :style="{ '--level-color': level.color }"
                @click="openLevel(level)"
              >
                <span>{{ level.levelCode }}</span
                ><strong>{{ level.levelName }}</strong
                ><small
                  >{{ level.minScore }} ≤ {{ activeMethod === 'LEC' ? 'D' : 'R' }}
                  {{ level.maxScore == null ? '' : `< ${level.maxScore}` }}</small
                ><ArtSvgIcon icon="ri:edit-line" />
              </button>
            </div>
          </ArtSectionCard>

          <ArtSectionCard
            v-if="activeModel && activeMethod === 'LS'"
            title="LS 风险矩阵预览"
            subtitle="纵轴为可能性 L，横轴为严重性 S；颜色按当前等级阈值实时计算。"
          >
            <ElScrollbar class="risk-model-page__matrix-scrollbar">
              <div class="risk-model-page__matrix">
                <div class="risk-model-page__matrix-corner">L \ S</div>
                <div v-for="s in sScores" :key="`s-${s}`" class="risk-model-page__matrix-head">{{
                  s
                }}</div>
                <template v-for="l in lScores" :key="`l-${l}`"
                  ><div class="risk-model-page__matrix-head">{{ l }}</div
                  ><div
                    v-for="s in sScores"
                    :key="`${l}-${s}`"
                    class="risk-model-page__matrix-cell"
                    :style="{ background: levelFor(l * s)?.color || 'var(--el-fill-color)' }"
                    ><strong>{{ l * s }}</strong
                    ><small>{{ levelFor(l * s)?.levelName }}</small></div
                  ></template
                >
              </div>
            </ElScrollbar>
          </ArtSectionCard>
        </div>
      </ElScrollbar>

      <CriterionDialog ref="criterionDialogRef" @success="loadModels" /><LevelDialog
        ref="levelDialogRef"
        @success="loadModels"
      />
    </div>
  </ArtPermissionGuard>
</template>
<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import ArtIconButton from '@/components/core/widget/art-icon-button/index.vue'
  import ArtSectionCard from '@/components/core/surfaces/art-section-card/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import BusinessWorkspaceHeader, {
    type BusinessWorkspaceMetric
  } from '@/components/business/business-workspace-header/index.vue'
  import { useArtFeedback } from '@/hooks/core/useArtFeedback'
  import { useTenantScopeStore } from '@/store/modules/tenantScope'
  import {
    deleteRiskAssessmentCriteria,
    fetchRiskAssessmentModels,
    type SmisRiskAssessmentCriterion,
    type SmisRiskAssessmentDimension,
    type SmisRiskAssessmentLevel,
    type SmisRiskAssessmentMethod,
    type SmisRiskAssessmentModel
  } from '@smis/api'
  import CriterionDialog, { type CriterionDialogOpenData } from './modules/criterion-dialog.vue'
  import LevelDialog, { type LevelDialogOpenData } from './modules/level-dialog.vue'
  defineOptions({ name: 'SmisDualControlRiskAssessmentStandardModel' })
  interface CriterionDialogExpose {
    handleOpen: (data: CriterionDialogOpenData) => Promise<void>
  }
  interface LevelDialogExpose {
    handleOpen: (data: LevelDialogOpenData) => Promise<void>
  }
  const { confirmDelete } = useArtFeedback()
  const tenantScopeStore = useTenantScopeStore()
  const { effectiveTenantId, revision } = storeToRefs(tenantScopeStore)
  const criterionDialogRef = ref<CriterionDialogExpose>()
  const levelDialogRef = ref<LevelDialogExpose>()
  const models = ref<SmisRiskAssessmentModel[]>([])
  const activeMethod = ref<SmisRiskAssessmentMethod>('LEC')
  const loading = ref(false)
  const error = ref('')
  const activeModel = computed(() => models.value.find((m) => m.methodCode === activeMethod.value))
  const equationParts = computed(() =>
    activeMethod.value === 'LEC' ? ['L', '×', 'E', '×', 'C', '=', 'D'] : ['L', '×', 'S', '=', 'R']
  )
  const metrics = computed<BusinessWorkspaceMetric[]>(() => [
    {
      label: '评估模型',
      value: models.value.length,
      description: 'LEC 与 LS',
      icon: 'ri:function-line'
    },
    {
      label: '判定维度',
      value: models.value.reduce((n, m) => n + m.dimensions.length, 0),
      description: '量化因子',
      icon: 'ri:axis-line'
    },
    {
      label: '判定标准',
      value: models.value.reduce(
        (n, m) => n + m.dimensions.reduce((c, d) => c + d.criteria.length, 0),
        0
      ),
      description: '分值选项',
      icon: 'ri:list-check-3'
    },
    {
      label: '风险等级',
      value: activeModel.value?.levels.length || 0,
      description: '当前模型分级',
      icon: 'ri:shield-star-line',
      tone: 'success'
    }
  ])
  const lScores = computed(() =>
    [...(activeModel.value?.dimensions.find((d) => d.dimensionCode === 'L')?.criteria || [])]
      .map((i) => i.score)
      .sort((a, b) => b - a)
  )
  const sScores = computed(() =>
    [...(activeModel.value?.dimensions.find((d) => d.dimensionCode === 'S')?.criteria || [])]
      .map((i) => i.score)
      .sort((a, b) => a - b)
  )
  const levelFor = (score: number) =>
    [...(activeModel.value?.levels || [])]
      .sort((a, b) => b.minScore - a.minScore)
      .find(
        (level) => score >= level.minScore && (level.maxScore == null || score < level.maxScore)
      )
  const loadModels = async () => {
    loading.value = true
    error.value = ''
    try {
      const result = await fetchRiskAssessmentModels(effectiveTenantId.value)
      models.value = result.data ?? []
      if (!models.value.some((m) => m.methodCode === activeMethod.value))
        activeMethod.value = models.value[0]?.methodCode || 'LEC'
    } catch (e) {
      error.value = e instanceof Error ? e.message : '评估模型加载失败'
    } finally {
      loading.value = false
    }
  }
  const openCriterion = (
    dimension: SmisRiskAssessmentDimension,
    row?: SmisRiskAssessmentCriterion
  ) =>
    void criterionDialogRef.value?.handleOpen({
      row,
      dimension,
      tenantId: activeModel.value?.tenantId || effectiveTenantId.value || ''
    })
  const openLevel = (row: SmisRiskAssessmentLevel) => void levelDialogRef.value?.handleOpen({ row })
  const openCriterionRow = (dimension: SmisRiskAssessmentDimension, row: unknown) =>
    openCriterion(dimension, row as SmisRiskAssessmentCriterion)
  const deleteCriterionRow = (row: unknown) =>
    void deleteCriterion(row as SmisRiskAssessmentCriterion)
  const deleteCriterion = async (row: SmisRiskAssessmentCriterion) => {
    try {
      await confirmDelete(`确定删除分值 ${row.score} 的判定标准吗？`)
      await deleteRiskAssessmentCriteria([row.id])
      await loadModels()
    } catch {
      /* 用户取消 */
    }
  }
  onMounted(async () => {
    await tenantScopeStore.loadTenantOptions()
    await loadModels()
  })
  watch(revision, loadModels)
</script>
<style scoped lang="scss">
  .risk-model-page {
    gap: 12px;
    min-width: 0;
    overflow: hidden;

    &__scrollbar {
      flex: 1 1 auto;
      min-height: 0;
    }

    &__content {
      display: flex;
      flex-direction: column;
      gap: 12px;
      min-width: 0;
      padding-right: 2px;
      padding-bottom: 2px;
    }

    &__method-switch {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;

      button {
        display: grid;
        grid-template-columns: 52px minmax(0, 1fr) 24px;
        gap: 12px;
        align-items: center;
        min-height: 76px;
        padding: 12px 14px;
        color: var(--el-text-color-regular);
        text-align: left;
        cursor: pointer;
        background: var(--art-gray-100);
        border: 1px solid transparent;
        border-radius: var(--el-border-radius-base);
        transition:
          background-color var(--art-motion-duration-fast),
          border-color var(--art-motion-duration-fast),
          box-shadow var(--art-motion-duration-fast);

        &:hover,
        &.is-active {
          background: color-mix(in srgb, var(--theme-color) 8%, var(--default-box-color));
          border-color: color-mix(in srgb, var(--theme-color) 24%, transparent);
        }

        &.is-active {
          box-shadow: inset 3px 0 0 var(--theme-color);
        }

        &:focus-visible {
          outline: 2px solid var(--theme-color);
          outline-offset: 2px;
        }

        > span {
          display: grid;
          place-items: center;
          width: 52px;
          height: 44px;
          font-weight: 800;
          color: var(--theme-color);
          background: var(--default-box-color);
          border-radius: var(--el-border-radius-base);
        }

        div {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
      }

      small {
        overflow: hidden;
        text-overflow: ellipsis;
        color: var(--el-text-color-secondary);
        white-space: nowrap;
      }
    }

    &__formula {
      :deep(.art-section-card__body) {
        display: flex;
        gap: 18px;
        align-items: center;
      }

      p {
        margin: 0;
        color: var(--el-text-color-secondary);
      }
    }

    &__equation {
      display: flex;
      gap: 6px;
      align-items: center;

      span {
        display: grid;
        place-items: center;
        min-width: 38px;
        height: 38px;
        font-weight: 800;
        color: var(--theme-color);
        background: color-mix(in srgb, var(--theme-color) 9%, var(--el-bg-color));
        border-radius: var(--el-border-radius-base);

        &.is-operator {
          min-width: 22px;
          color: var(--el-text-color-secondary);
          background: transparent;
        }
      }
    }

    &__dimension-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
      gap: 12px;
    }

    &__score {
      font-family: var(--art-font-family-mono, Consolas, monospace);
      color: var(--theme-color);
    }

    &__levels {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
      gap: 10px;

      button {
        position: relative;
        display: grid;
        grid-template-columns: 42px minmax(0, 1fr) 18px;
        gap: 10px;
        align-items: center;
        min-height: 72px;
        padding: 12px;
        text-align: left;
        cursor: pointer;
        background: color-mix(in srgb, var(--level-color) 7%, var(--default-box-color));
        border: 1px solid color-mix(in srgb, var(--level-color) 35%, var(--el-border-color));
        border-left: 4px solid var(--level-color);
        border-radius: var(--el-border-radius-base);
        transition:
          background-color var(--art-motion-duration-fast),
          box-shadow var(--art-motion-duration-fast);

        &:hover {
          background: color-mix(in srgb, var(--level-color) 12%, var(--default-box-color));
        }

        &:focus-visible {
          outline: 2px solid var(--level-color);
          outline-offset: 2px;
        }

        > span {
          display: grid;
          place-items: center;
          width: 38px;
          height: 38px;
          font-weight: 800;
          color: #fff;
          background: var(--level-color);
          border-radius: var(--el-border-radius-base);
        }

        strong,
        small {
          grid-column: 2;
        }

        small {
          margin-top: -8px;
          color: var(--el-text-color-secondary);
        }

        svg {
          grid-row: 1/3;
          grid-column: 3;
          color: var(--el-text-color-secondary);
        }
      }
    }

    &__matrix-scrollbar {
      width: 100%;
    }

    &__matrix {
      display: grid;
      grid-template-columns: 78px repeat(5, minmax(76px, 1fr));
      gap: 4px;
      min-width: 650px;
      padding-bottom: 8px;
    }

    &__matrix-corner,
    &__matrix-head {
      display: grid;
      place-items: center;
      min-height: 42px;
      font-weight: 700;
      color: var(--el-text-color-secondary);
      background: var(--el-fill-color-light);
      border-radius: var(--el-border-radius-small);
    }

    &__matrix-cell {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 58px;
      color: #fff;
      text-shadow: 0 1px 2px rgb(0 0 0 / 25%);
      border-radius: var(--el-border-radius-small);

      small {
        font-size: 11px;
      }
    }

    @media (width <= 900px) {
      &__dimension-grid,
      &__method-switch {
        grid-template-columns: 1fr;
      }

      &__formula :deep(.art-section-card__body) {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  }
</style>
