<template>
  <SmisAiPanelFrame
    class="smis-ai-ocr"
    :permission="permission"
    eyebrow="AI 文档识别"
    :title="title"
    :subtitle="subtitle"
    icon="ri:file-search-line"
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
        {{ state.result ? '重新识别' : '开始识别' }}
      </ElButton>
    </template>

    <ElAlert
      v-if="state.error"
      class="smis-ai-ocr__alert"
      type="error"
      :title="state.error"
      show-icon
      :closable="false"
    />

    <SmisAiCapabilityGuide v-if="!state.result" :items="guideItems" />

    <div v-else class="smis-ai-ocr__result" aria-live="polite">
      <div class="smis-ai-ocr__result-head">
        <span>
          <strong>识别完成</strong>
          <ElTag :type="confidenceType" effect="light" round>
            可信度 {{ confidencePercent }}%
          </ElTag>
        </span>
        <ElButton type="primary" @click="applyResult">应用到空白字段</ElButton>
      </div>
      <p>{{ state.result.summary }}</p>
      <dl class="smis-ai-ocr__fields">
        <template v-if="isCertificateResult(state.result)">
          <div
            ><dt>持证人</dt><dd>{{ state.result.certificate.holderName || '未识别' }}</dd></div
          >
          <div
            ><dt>证件编号</dt
            ><dd>{{ state.result.certificate.certificateNumber || '未识别' }}</dd></div
          >
          <div
            ><dt>发证机关</dt
            ><dd>{{ state.result.certificate.issuingAuthority || '未识别' }}</dd></div
          >
          <div
            ><dt>批准 / 有效日期</dt
            ><dd>{{
              dateRangeText(
                state.result.certificate.approvalDate,
                state.result.certificate.effectiveDate
              )
            }}</dd></div
          >
        </template>
        <template v-else>
          <div
            ><dt>外部报告编号</dt><dd>{{ state.result.report.reportNumber || '未识别' }}</dd></div
          >
          <div
            ><dt>设备</dt><dd>{{ equipmentText(state.result.report) }}</dd></div
          >
          <div
            ><dt>检验机构</dt><dd>{{ state.result.report.institutionName || '未识别' }}</dd></div
          >
          <div
            ><dt>检验 / 下次日期</dt
            ><dd>{{
              dateRangeText(state.result.report.inspectionDate, state.result.report.nextDueDate)
            }}</dd></div
          >
        </template>
      </dl>
      <ElAlert
        v-if="state.result.warnings.length"
        class="smis-ai-ocr__alert"
        type="warning"
        :title="state.result.warnings.slice(0, 3).join('；')"
        show-icon
        :closable="false"
      />
      <OcrOriginalText class="smis-ai-ocr__raw" :text="state.result.rawText" />
    </div>
  </SmisAiPanelFrame>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import OcrOriginalText from '@/components/business/ocr-original-text/index.vue'
  import { getFriendlySupabaseErrorMessage } from '@/utils/supabase/error'
  import SmisAiCapabilityGuide from '@smis/views/components/smis-ai-capability-guide.vue'
  import SmisAiPanelFrame from '@smis/views/components/smis-ai-panel-frame.vue'
  import {
    analyzeEquipmentInspectionReportByAi,
    analyzePersonnelCertificateByAi,
    type SmisCertificateCategory,
    type SmisCertificateOcrResponse,
    type SmisInspectionReportOcrDraft,
    type SmisInspectionReportOcrResponse
  } from '@smis/api'

  defineOptions({ name: 'SmisAiDocumentOcrPanel' })

  type OcrResult = SmisCertificateOcrResponse | SmisInspectionReportOcrResponse
  const props = defineProps<{
    mode: 'certificate' | 'inspection'
    permission: string
    imageUrls: string[]
    category?: SmisCertificateCategory
  }>()
  const emit = defineEmits<{
    applyCertificate: [result: SmisCertificateOcrResponse]
    applyInspection: [result: SmisInspectionReportOcrResponse]
  }>()

  const state = reactive<{ analyzing: boolean; error: string; result?: OcrResult }>({
    analyzing: false,
    error: '',
    result: undefined
  })
  const title = computed(() =>
    props.mode === 'certificate' ? '识别证件并补全基础字段' : '识别检验报告并提取结论'
  )
  const subtitle = computed(() =>
    props.mode === 'certificate'
      ? '结果仅写入当前证件草稿；持证人与作业项目仍由人工确认。'
      : '结果仅写入当前申报草稿；设备与检验机构仍由人工选择。'
  )
  const guideItems = [
    {
      icon: 'ri:text-snippet',
      tone: 'primary',
      title: '编号与机构',
      description: '定位证号、报告号与签发机构'
    },
    {
      icon: 'ri:calendar-check-line',
      tone: 'warning',
      title: '关键日期',
      description: '统一提取发证、检验与有效日期'
    },
    {
      icon: 'ri:shield-check-line',
      tone: 'success',
      title: '结论与风险',
      description: '标记缺失、冲突和人工复核项'
    }
  ] as const
  const confidencePercent = computed(() => Math.round((state.result?.confidence ?? 0) * 100))
  const confidenceType = computed(() =>
    confidencePercent.value >= 85 ? 'success' : confidencePercent.value >= 65 ? 'warning' : 'danger'
  )

  watch(
    () => props.imageUrls.join('|'),
    () => reset()
  )

  function isCertificateResult(result: OcrResult): result is SmisCertificateOcrResponse {
    return 'certificate' in result
  }

  function dateRangeText(start?: string | null, end?: string | null): string {
    if (!start && !end) return '未识别'
    return `${start || '—'} / ${end || '—'}`
  }

  function equipmentText(report: SmisInspectionReportOcrDraft): string {
    return [report.equipmentCode, report.equipmentName].filter(Boolean).join(' · ') || '未识别'
  }

  async function handleAnalyze(): Promise<void> {
    if (!props.imageUrls.length || state.analyzing) return
    state.analyzing = true
    state.error = ''
    try {
      const response =
        props.mode === 'certificate'
          ? await analyzePersonnelCertificateByAi({
              imageUrl: props.imageUrls[0],
              category: props.category || 'special_equipment_personnel'
            })
          : await analyzeEquipmentInspectionReportByAi(props.imageUrls)
      if (response.error || !response.data) throw response.error || new Error('未返回识别结果')
      state.result = response.data
      ElMessage.success('文档识别完成，请核对后应用')
    } catch (error) {
      state.error = getFriendlySupabaseErrorMessage(error, '文档识别失败，请稍后重试或继续手工填写')
    } finally {
      state.analyzing = false
    }
  }

  function applyResult(): void {
    const result = state.result
    if (!result) return
    if (isCertificateResult(result)) emit('applyCertificate', result)
    else emit('applyInspection', result)
  }

  function reset(): void {
    state.analyzing = false
    state.error = ''
    state.result = undefined
  }

  defineExpose({ reset })
</script>

<style scoped lang="scss">
  .smis-ai-ocr {
    &__result,
    &__result-head,
    &__result-head > span {
      min-width: 0;
    }

    &__result {
      padding-top: var(--art-space-4);
      margin-top: var(--art-space-4);
      border-top: 1px dashed var(--el-border-color);

      > p {
        margin: var(--art-space-3) 0;
        line-height: 1.6;
        color: var(--art-text-gray-600);
      }
    }

    &__result-head,
    &__result-head > span {
      display: flex;
      align-items: center;
    }

    &__result-head {
      gap: var(--art-space-4);
      justify-content: space-between;

      > span {
        gap: var(--art-space-2);
      }
    }

    &__fields {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
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
        line-height: 1.55;
        color: var(--art-text-gray-800);
        overflow-wrap: anywhere;
      }
    }

    &__alert,
    &__raw {
      margin-top: var(--art-space-3);
    }

    @media (width <= 860px) {
      &__fields {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (width <= 540px) {
      &__result-head {
        flex-direction: column;
        align-items: stretch;
      }

      &__fields {
        grid-template-columns: 1fr;
      }
    }
  }
</style>
