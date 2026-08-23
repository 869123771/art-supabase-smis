<template>
  <ArtDialog ref="dialogRef" size="lg">
    <div v-if="record" class="exam-runner">
      <section class="exam-runner__summary">
        <div
          ><span>考试名称</span><strong>{{ record.title }}</strong></div
        >
        <div
          ><span>剩余时间</span
          ><strong :class="{ 'is-warning': remainingSeconds < 300 }">{{
            remainingText
          }}</strong></div
        >
        <div
          ><span>答题进度</span><strong>{{ answeredCount }} / {{ questions.length }}</strong></div
        >
        <div
          ><span>合格分数</span><strong>{{ record.payload?.passingScore || 60 }} 分</strong></div
        >
      </section>

      <ElResult
        v-if="submittedAttempt"
        :icon="submittedAttempt.passed ? 'success' : 'warning'"
        :title="submittedAttempt.passed ? '考试通过' : '考试未通过'"
        :sub-title="`本次得分 ${submittedAttempt.score ?? 0} 分 · 第 ${submittedAttempt.attemptNo} 次作答`"
      />

      <template v-else>
        <nav class="exam-runner__navigator" aria-label="题目导航">
          <button
            v-for="(question, index) in questions"
            :key="question.questionNo"
            type="button"
            :class="{
              'is-active': currentIndex === index,
              'is-answered': hasAnswer(question.questionNo)
            }"
            @click="currentIndex = index"
          >
            {{ index + 1 }}
          </button>
        </nav>

        <article v-if="currentQuestion" class="exam-runner__question">
          <header>
            <ElTag effect="plain">{{ currentQuestion.questionType || '单选题' }}</ElTag>
            <strong>{{ currentIndex + 1 }}. {{ currentQuestion.questionContent }}</strong>
            <span>{{ currentQuestion.score || 0 }} 分</span>
          </header>
          <ElCheckboxGroup
            v-if="currentQuestion.questionType === '多选题'"
            v-model="multipleAnswers[currentQuestion.questionNo]"
            class="exam-runner__options"
          >
            <ElCheckbox
              v-for="option in currentOptions"
              :key="option.value"
              :value="option.value"
              border
            >
              {{ option.label }}
            </ElCheckbox>
          </ElCheckboxGroup>
          <ElRadioGroup
            v-else
            v-model="singleAnswers[currentQuestion.questionNo]"
            class="exam-runner__options"
          >
            <ElRadio
              v-for="option in currentOptions"
              :key="option.value"
              :value="option.value"
              border
            >
              {{ option.label }}
            </ElRadio>
          </ElRadioGroup>
          <footer>
            <ElButton :disabled="currentIndex === 0" @click="currentIndex -= 1">上一题</ElButton>
            <ElButton
              type="primary"
              :disabled="currentIndex >= questions.length - 1"
              @click="currentIndex += 1"
            >
              下一题
            </ElButton>
          </footer>
        </article>
      </template>
    </div>
  </ArtDialog>
</template>

<script setup lang="ts">
  import ArtDialog from '@/components/core/dialogs/art-dialog/index.vue'
  import type { ArtDialogExpose } from '@/components/core/dialogs/art-dialog/types'
  import {
    saveSafetyExamDraft,
    startSafetyExam,
    submitSafetyExam,
    type SafetyCatalogRecord,
    type SafetyExamAttempt
  } from '@smis/api'

  defineOptions({ name: 'SmisSafetyExamRunnerDialog' })

  interface ExamQuestion {
    questionNo: string
    questionType?: string
    questionContent: string
    optionContent?: string
    score?: number
  }

  interface ExamOption {
    label: string
    value: string
  }

  const emit = defineEmits<{ completed: [attempt: SafetyExamAttempt] }>()
  const dialogRef = ref<ArtDialogExpose<SafetyCatalogRecord>>()
  const record = shallowRef<SafetyCatalogRecord>()
  const attempt = shallowRef<SafetyExamAttempt>()
  const submittedAttempt = shallowRef<SafetyExamAttempt>()
  const singleAnswers = reactive<Record<string, string>>({})
  const multipleAnswers = reactive<Record<string, string[]>>({})
  const currentIndex = ref(0)
  const remainingSeconds = ref(0)
  const submitting = ref(false)
  let timer: ReturnType<typeof setInterval> | undefined
  let draftTimer: ReturnType<typeof setTimeout> | undefined

  const questions = computed<ExamQuestion[]>(() => {
    const value = record.value?.payload?.detailRows
    if (!Array.isArray(value)) return []
    return value
      .map((question) => question as unknown as ExamQuestion)
      .filter((question) => question.questionNo && question.questionContent)
  })
  const currentQuestion = computed(() => questions.value[currentIndex.value])
  const currentOptions = computed<ExamOption[]>(() => {
    const question = currentQuestion.value
    if (!question) return []
    if (question.questionType === '判断题') {
      return [
        { label: '正确', value: '正确' },
        { label: '错误', value: '错误' }
      ]
    }
    return String(question.optionContent || '')
      .split(/[\n；;]/)
      .map((item, index) => {
        const normalized = item.trim()
        const match = normalized.match(/^([A-Za-z])\s*[.、:：]\s*(.+)$/)
        return {
          value: (match?.[1] || String.fromCharCode(65 + index)).toUpperCase(),
          label: match ? `${match[1].toUpperCase()}. ${match[2]}` : normalized
        }
      })
      .filter((item) => item.label)
  })
  const answeredCount = computed(
    () => questions.value.filter((question) => hasAnswer(question.questionNo)).length
  )
  const remainingText = computed(() => {
    const minutes = Math.floor(remainingSeconds.value / 60)
    const seconds = remainingSeconds.value % 60
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  })

  const hasAnswer = (questionNo: string): boolean =>
    Boolean(singleAnswers[questionNo] || multipleAnswers[questionNo]?.length)

  const startTimer = (): void => {
    if (timer) clearInterval(timer)
    timer = setInterval(() => {
      if (remainingSeconds.value > 0) remainingSeconds.value -= 1
      if (remainingSeconds.value === 0 && !submittedAttempt.value) void handleSubmit()
    }, 1000)
  }

  const buildAnswers = (): Record<string, string> =>
    Object.fromEntries(
      questions.value.map((question) => [
        question.questionNo,
        question.questionType === '多选题'
          ? [...(multipleAnswers[question.questionNo] ?? [])].sort().join(',')
          : singleAnswers[question.questionNo] || ''
      ])
    )

  const handleSubmit = async (): Promise<boolean> => {
    if (submittedAttempt.value) return true
    if (!attempt.value || submitting.value) return false
    submitting.value = true
    try {
      const result = await submitSafetyExam(attempt.value.id, buildAnswers())
      const completedAttempt = result.data
      if (!completedAttempt) return false
      submittedAttempt.value = completedAttempt
      if (timer) clearInterval(timer)
      if (draftTimer) clearTimeout(draftTimer)
      dialogRef.value?.setOptions({
        confirmText: '完成',
        showCancelButton: false,
        confirmDisabled: false
      })
      emit('completed', completedAttempt)
    } finally {
      submitting.value = false
    }
    return false
  }

  const persistDraft = async (): Promise<void> => {
    if (!attempt.value || submittedAttempt.value || submitting.value) return
    await saveSafetyExamDraft(attempt.value.id, buildAnswers())
  }

  const scheduleDraftSave = (): void => {
    if (draftTimer) clearTimeout(draftTimer)
    draftTimer = setTimeout(() => void persistDraft(), 700)
  }

  const resetAnswers = (): void => {
    Object.keys(singleAnswers).forEach((key) => delete singleAnswers[key])
    Object.keys(multipleAnswers).forEach((key) => delete multipleAnswers[key])
  }

  const handleOpen = async (examRecord: SafetyCatalogRecord): Promise<void> => {
    if (!examRecord.id) return
    const result = await startSafetyExam(examRecord.id)
    const startedAttempt = result.data
    if (!startedAttempt) return
    record.value = examRecord
    attempt.value = startedAttempt
    submittedAttempt.value = undefined
    currentIndex.value = 0
    resetAnswers()
    Object.entries(startedAttempt.answers ?? {}).forEach(([questionNo, answer]) => {
      const question = questions.value.find((item) => item.questionNo === questionNo)
      if (question?.questionType === '多选题') {
        multipleAnswers[questionNo] = String(answer).split(',').filter(Boolean)
      } else {
        singleAnswers[questionNo] = String(answer)
      }
    })
    const durationMinutes = Math.max(Number(examRecord.payload?.durationMinutes || 60), 1)
    const elapsedSeconds = Math.max(
      Math.floor((Date.now() - new Date(startedAttempt.startedAt).getTime()) / 1000),
      0
    )
    remainingSeconds.value = Math.max(durationMinutes * 60 - elapsedSeconds, 0)
    await dialogRef.value?.handleOpen(examRecord, {
      title: examRecord.title,
      subtitle: `第 ${startedAttempt.attemptNo} 次作答 · 答案由服务端评分`,
      contentMaxHeight: '74vh',
      confirmText: '提交试卷',
      cancelText: '暂存离开',
      confirmDisabled: questions.value.length === 0,
      onConfirm: handleSubmit,
      onClose: () => {
        if (timer) clearInterval(timer)
        if (draftTimer) clearTimeout(draftTimer)
        void persistDraft()
      }
    })
    startTimer()
  }

  onBeforeUnmount(() => {
    if (timer) clearInterval(timer)
    if (draftTimer) clearTimeout(draftTimer)
  })

  watch([singleAnswers, multipleAnswers], scheduleDraftSave, { deep: true })

  defineExpose({ handleOpen, handleClose: () => dialogRef.value?.handleClose() })
</script>

<style scoped lang="scss">
  .exam-runner {
    display: grid;
    gap: 16px;

    &__summary {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      border: 1px solid var(--art-card-border);
      border-radius: 10px;

      div {
        display: grid;
        gap: 4px;
        padding: 12px 14px;
        border-right: 1px solid var(--art-card-border);
      }

      div:last-child {
        border-right: 0;
      }

      span {
        font-size: 12px;
        color: var(--art-text-gray-600);
      }

      .is-warning {
        color: var(--el-color-danger);
      }
    }

    &__navigator {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 12px;
      background: var(--art-main-bg-color);
      border-radius: 9px;

      button {
        display: grid;
        place-items: center;
        width: 34px;
        height: 34px;
        font: inherit;
        color: var(--art-gray-700);
        cursor: pointer;
        background: var(--default-box-color);
        border: 1px solid var(--art-card-border);
        border-radius: 7px;
      }

      button.is-answered {
        color: var(--el-color-success);
        border-color: var(--el-color-success-light-5);
      }

      button.is-active {
        color: #fff;
        background: var(--el-color-primary);
        border-color: var(--el-color-primary);
      }
    }

    &__question {
      display: grid;
      gap: 18px;
      min-height: 290px;
      padding: 18px;
      border: 1px solid var(--art-card-border);
      border-radius: 10px;

      header {
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: 10px;
        align-items: flex-start;
      }

      header strong {
        font-size: 16px;
        line-height: 1.65;
      }

      header > span {
        color: var(--el-color-primary);
      }

      footer {
        display: flex;
        align-items: flex-end;
        justify-content: flex-end;
      }
    }

    &__options {
      display: grid;
      gap: 10px;
      align-content: start;

      :deep(.el-radio),
      :deep(.el-checkbox) {
        width: 100%;
        min-height: 42px;
        margin: 0;
      }
    }
  }

  @media (width <= 760px) {
    .exam-runner__summary {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .exam-runner__question header {
      grid-template-columns: 1fr;
    }
  }
</style>
