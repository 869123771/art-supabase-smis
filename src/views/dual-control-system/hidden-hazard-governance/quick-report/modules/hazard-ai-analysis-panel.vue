<template>
  <SmisAiPanelFrame
    class="hazard-ai-panel"
    permission="SmisDualControlQuickReport:AiAnalyze"
    eyebrow="AI 现场辅助分析"
    title="从照片提取隐患现象与整改建议"
    subtitle="结果仅用于补全当前草稿，不会自动提交、核准或改变流程状态。"
    icon="ri:sparkling-2-line"
  >
    <template #action>
      <ElButton
        type="primary"
        plain
        :loading="state.analyzing"
        :disabled="!imageUrls.length"
        @click="handleAnalyze"
      >
        <ArtSvgIcon v-if="!state.analyzing" icon="ri:scan-2-line" />
        {{ state.result ? '重新分析' : '分析现场照片' }}
      </ElButton>
    </template>

    <ElAlert
      v-if="state.error"
      class="hazard-ai-panel__error"
      type="error"
      :title="state.error"
      show-icon
      :closable="false"
    />

    <SmisAiCapabilityGuide v-if="!state.result" aria-label="AI 分析内容" :items="guideItems" />

    <div v-else class="hazard-ai-panel__result" aria-live="polite">
      <div class="hazard-ai-panel__result-head">
        <div>
          <strong>分析建议</strong>
          <ElTag :type="confidenceType" effect="light" round>
            可信度 {{ confidencePercent }}%
          </ElTag>
        </div>
        <ElButton type="primary" :disabled="!hasSuggestion" @click="emitApply">
          应用到空白字段
        </ElButton>
      </div>
      <p class="hazard-ai-panel__summary">{{ state.result.summary }}</p>

      <dl class="hazard-ai-panel__fields">
        <div>
          <dt>建议级别</dt>
          <dd>{{ suggestedLevelLabel }}</dd>
        </div>
        <div>
          <dt>隐患描述</dt>
          <dd>{{ state.result.hazard.description || '未识别到足够信息' }}</dd>
        </div>
        <div>
          <dt>整改建议</dt>
          <dd>{{ state.result.hazard.rectificationSuggestion || '建议人工补充' }}</dd>
        </div>
      </dl>

      <div v-if="state.result.observedHazards.length" class="hazard-ai-panel__evidence">
        <strong>可见隐患</strong>
        <ul>
          <li v-for="item in state.result.observedHazards" :key="item">{{ item }}</li>
        </ul>
      </div>
      <ElAlert
        v-if="state.result.warnings.length"
        class="hazard-ai-panel__warning"
        type="warning"
        :title="state.result.warnings.slice(0, 3).join('；')"
        show-icon
        :closable="false"
      />
    </div>
  </SmisAiPanelFrame>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import { getFriendlySupabaseErrorMessage } from '@/utils/supabase/error'
  import SmisAiCapabilityGuide from '@smis/views/components/smis-ai-capability-guide.vue'
  import SmisAiPanelFrame from '@smis/views/components/smis-ai-panel-frame.vue'
  import { analyzeHazardImagesByAi, type SmisHazardImageAnalysisResponse } from '@smis/api'

  defineOptions({ name: 'SmisHazardAiAnalysisPanel' })

  const props = defineProps<{
    imageUrls: string[]
    organizationName?: string
    siteName?: string
    location?: string
    existingDescription?: string
    hazardLevelOptions: Array<{ label: string; value: string }>
  }>()
  const emit = defineEmits<{ apply: [result: SmisHazardImageAnalysisResponse] }>()

  const guideItems = [
    {
      icon: 'ri:eye-2-line',
      tone: 'primary',
      title: '可见现象',
      description: '只提取照片中可观察证据'
    },
    {
      icon: 'ri:alarm-warning-line',
      tone: 'warning',
      title: '级别候选',
      description: '给出候选值，仍需人工认定'
    },
    {
      icon: 'ri:tools-line',
      tone: 'success',
      title: '整改建议',
      description: '生成可核对的控制措施草稿'
    }
  ] as const
  const state = reactive<{
    analyzing: boolean
    error: string
    result?: SmisHazardImageAnalysisResponse
  }>({ analyzing: false, error: '', result: undefined })

  const confidencePercent = computed(() => Math.round((state.result?.confidence ?? 0) * 100))
  const confidenceType = computed(() =>
    confidencePercent.value >= 85 ? 'success' : confidencePercent.value >= 65 ? 'warning' : 'danger'
  )
  const suggestedLevelLabel = computed(() => {
    const level = state.result?.hazard.hazardLevel
    return props.hazardLevelOptions.find((item) => item.value === level)?.label || '建议人工选择'
  })
  const hasSuggestion = computed(() => {
    const hazard = state.result?.hazard
    return Boolean(hazard?.description || hazard?.hazardLevel || hazard?.rectificationSuggestion)
  })

  watch(
    () => props.imageUrls.join('|'),
    () => reset()
  )

  async function handleAnalyze(): Promise<void> {
    if (!props.imageUrls.length || state.analyzing) return
    state.analyzing = true
    state.error = ''
    try {
      const response = await analyzeHazardImagesByAi({
        action: 'analyze',
        imageUrls: props.imageUrls.slice(0, 3),
        organizationName: props.organizationName || null,
        siteName: props.siteName || null,
        location: props.location || null,
        existingDescription: props.existingDescription || null
      })
      if (response.error || !response.data) throw response.error || new Error('未返回分析结果')
      state.result = response.data
      ElMessage.success('现场照片分析完成，请核对后应用')
    } catch (error) {
      state.error = getFriendlySupabaseErrorMessage(
        error,
        '现场照片分析失败，请稍后重试或继续手工填写'
      )
    } finally {
      state.analyzing = false
    }
  }

  function emitApply(): void {
    if (!state.result || !hasSuggestion.value) return
    emit('apply', state.result)
  }

  function reset(): void {
    state.analyzing = false
    state.error = ''
    state.result = undefined
  }

  defineExpose({ reset })
</script>

<style scoped lang="scss">
  .hazard-ai-panel {
    margin: var(--art-space-2) 0 var(--art-space-4);

    &__result-head,
    &__result-head > div {
      display: flex;
      align-items: center;
    }

    &__result-head {
      gap: var(--art-space-4);
      justify-content: space-between;

      > div {
        gap: var(--art-space-2);
      }
    }

    &__error,
    &__warning {
      margin-top: var(--art-space-3);
    }

    &__result {
      padding-top: var(--art-space-4);
      margin-top: var(--art-space-4);
      border-top: 1px dashed var(--el-border-color);
    }

    &__summary {
      margin: var(--art-space-3) 0;
      line-height: 1.65;
      color: var(--art-text-gray-600);
    }

    &__fields {
      display: grid;
      grid-template-columns: minmax(130px, 0.35fr) repeat(2, minmax(0, 1fr));
      gap: var(--art-space-2);
      margin: 0;

      > div {
        min-width: 0;
        padding: var(--art-space-3);
        background: color-mix(in srgb, var(--theme-color) 2%, var(--default-box-color));
        border: 1px solid var(--el-border-color-lighter);
        border-radius: var(--el-border-radius-base);
      }

      dt {
        margin-bottom: 4px;
        font-size: var(--art-font-size-caption);
        color: var(--art-text-gray-500);
      }

      dd {
        margin: 0;
        line-height: 1.6;
        color: var(--art-text-gray-800);
        overflow-wrap: anywhere;
      }
    }

    &__evidence {
      margin-top: var(--art-space-3);

      > strong {
        font-size: var(--art-font-size-caption);
        color: var(--art-text-gray-600);
      }

      ul {
        display: flex;
        flex-wrap: wrap;
        gap: var(--art-space-2);
        padding: 0;
        margin: var(--art-space-2) 0 0;
        list-style: none;
      }

      li {
        padding: 5px 9px;
        font-size: var(--art-font-size-caption);
        color: var(--art-text-gray-700);
        background: color-mix(in srgb, var(--theme-color) 3%, var(--default-box-color));
        border: 1px solid color-mix(in srgb, var(--theme-color) 14%, var(--el-border-color));
        border-radius: 999px;
      }
    }

    @media (width <= 860px) {
      &__fields {
        grid-template-columns: 1fr;
      }
    }

    @media (width <= 540px) {
      &__result-head {
        flex-direction: column;
        align-items: stretch;
      }
    }
  }
</style>
