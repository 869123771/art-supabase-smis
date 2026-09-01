<template>
  <ArtPermissionGuard permission="SmisExamManagement:View">
    <div class="exam-page business-workspace-page art-full-height">
      <BusinessWorkspaceHeader
        density="compact"
        eyebrow="ASSESSMENT OPERATIONS"
        title="考试管理"
        description="从固定或随机组卷、考试发布到在线作答和自动评分，形成完整考核证据链。"
        icon="ri:file-list-3-line"
        :tags="[
          { label: '固定 / 随机组卷', type: 'primary', effect: 'plain' },
          { label: '断点继续考试', type: 'warning', effect: 'light' },
          { label: '客观题自动评分', type: 'success', effect: 'plain' }
        ]"
        :metrics="metrics"
      >
        <template #actions
          ><BusinessTableWorkspaceActions
            :table="activeTab === 'paper' ? paperTableRef : recordTableRef"
        /></template>
      </BusinessWorkspaceHeader>

      <div class="exam-page__body art-card-xs">
        <ElTabs v-model="activeTab" class="exam-page__tabs" stretch
          ><ElTabPane label="试卷管理" name="paper" /><ElTabPane
            v-if="hasAuth('SmisExamManagement:ViewRecord')"
            label="考试记录"
            name="record"
        /></ElTabs>
        <ArtTableQuery
          v-show="activeTab === 'paper'"
          ref="paperTableRef"
          v-model="paperQuery"
          class="exam-page__table"
          :api-fn="fetchPapers"
          :search-items="paperSearchItems"
          :columns-factory="paperColumns"
          :header-actions="paperActions"
          header-actions-placement="workspace"
          :search-bar-props="{ span: 8, labelWidth: 72 }"
          :table-props="{
            rowKey: 'id',
            tableLayout: 'fixed',
            emptyText: '暂无试卷',
            emptyDescription: '创建试卷并选择题目后，可分配人员并发布考试。'
          }"
          focus-scope-selector=".exam-page__body"
          focusable
        />
        <ArtTableQuery
          v-if="hasAuth('SmisExamManagement:ViewRecord')"
          v-show="activeTab === 'record'"
          ref="recordTableRef"
          v-model="recordQuery"
          class="exam-page__table"
          :api-fn="fetchRecords"
          :search-items="recordSearchItems"
          :columns-factory="recordColumns"
          :header-actions="recordActions"
          header-actions-placement="workspace"
          :search-bar-props="{ span: 8, labelWidth: 72 }"
          :table-props="{
            rowKey: 'id',
            tableLayout: 'fixed',
            emptyText: '暂无考试记录',
            emptyDescription: '员工开始考试后，每次尝试会单独留痕。'
          }"
          focus-scope-selector=".exam-page__body"
          focusable
        />
      </div>

      <ArtDialog ref="paperDialogRef" size="xl">
        <div class="exam-page__paper-hero">
          <span aria-hidden="true"><ArtSvgIcon icon="ri:file-settings-line" /></span>
          <div>
            <strong>{{ paperForm.id ? '维护试卷配置' : '创建标准化考试' }}</strong>
            <small>先设置考试规则，再完成组卷与人员分配；未分配人员时仍可保存草稿。</small>
          </div>
          <ol aria-label="试卷配置进度">
            <li :class="{ 'is-ready': Boolean(paperForm.paperTitle) }">1 基本规则</li>
            <li :class="{ 'is-ready': selectedQuestions.length > 0 }">2 完成组卷</li>
            <li :class="{ 'is-ready': paperForm.employeeIds.length > 0 }">3 分配人员</li>
          </ol>
        </div>
        <ArtForm
          ref="paperFormRef"
          v-model="paperForm"
          :items="paperItems"
          :rules="paperRules"
          :span="12"
          :gutter="24"
          label-position="top"
          :show-reset="false"
          :show-submit="false"
        >
          <template #questions>
            <div class="exam-page__assembly">
              <header class="exam-page__assembly-heading">
                <div>
                  <small>STEP 02 · ASSEMBLY</small>
                  <strong>配置试题与分值</strong>
                  <p>固定组卷适合统一试卷，随机组卷适合降低重复考试的答案传播风险。</p>
                </div>
                <ElRadioGroup v-model="paperForm.assemblyMode" class="exam-page__assembly-mode">
                  <ElRadioButton
                    v-for="item in assemblyModeOptions"
                    :key="item.value"
                    :value="item.value"
                  >
                    {{ item.label }}
                  </ElRadioButton>
                </ElRadioGroup>
              </header>
              <ElAlert
                title="试卷发布时会固定题目快照，后续题库调整不会改变历史试卷和评分口径。"
                type="info"
                :closable="false"
                show-icon
              />
              <ElAlert
                v-if="passingScoreInvalid"
                title="及格分数不能高于当前试卷总分，请调整及格线或题目分值。"
                type="warning"
                :closable="false"
                show-icon
              />
              <template v-if="paperForm.assemblyMode === 'random'">
                <div class="exam-page__rule-guide" aria-hidden="true">
                  <span>抽题分类</span><span>题型</span><span>数量</span><span>每题分值</span
                  ><span>操作</span>
                </div>
                <div
                  v-for="(rule, index) in paperForm.randomRule"
                  :key="index"
                  class="exam-page__rule"
                >
                  <b>{{ index + 1 }}</b>
                  <ElSelect v-model="rule.categoryId" clearable placeholder="全部分类"
                    ><ElOption
                      v-for="item in categoryOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                  /></ElSelect>
                  <ElSelect v-model="rule.questionType" clearable placeholder="全部题型"
                    ><ElOption
                      v-for="item in questionTypeOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                  /></ElSelect>
                  <div class="exam-page__number-field"
                    ><ElInputNumber v-model="rule.count" :min="1" :max="200" /><span>题</span></div
                  >
                  <div class="exam-page__number-field"
                    ><ElInputNumber
                      v-model="rule.score"
                      :min="0.01"
                      :max="999"
                      :precision="2"
                    /><span>分</span></div
                  >
                  <ElButton
                    circle
                    text
                    type="danger"
                    aria-label="删除抽题规则"
                    @click="paperForm.randomRule.splice(index, 1)"
                    ><ArtSvgIcon icon="ri:delete-bin-line"
                  /></ElButton>
                </div>
                <div class="exam-page__rule-actions">
                  <small>随机生成会替换当前已选题目，生成后仍可逐题调整分值。</small>
                  <div>
                    <ElButton
                      plain
                      @click="
                        paperForm.randomRule.push({
                          categoryId: null,
                          questionType: null,
                          count: 5,
                          score: 2
                        })
                      "
                    >
                      <ArtSvgIcon icon="ri:add-line" />添加抽题规则
                    </ElButton>
                    <ElButton
                      v-auth="'SmisExamManagement:Generate'"
                      type="primary"
                      :loading="generating"
                      @click="randomGenerate"
                    >
                      <ArtSvgIcon icon="ri:shuffle-line" />随机生成
                    </ElButton>
                  </div>
                </div>
              </template>
              <div
                class="exam-page__assembly-workspace"
                :class="{ 'is-random': paperForm.assemblyMode === 'random' }"
              >
                <section
                  v-if="paperForm.assemblyMode === 'fixed'"
                  class="exam-page__question-picker"
                >
                  <header>
                    <div
                      ><strong>可选题目</strong
                      ><small>{{ filteredQuestions.length }} 道可用</small></div
                    >
                    <span class="exam-page__picker-hint">
                      <ArtSvgIcon icon="ri:checkbox-circle-line" />勾选即加入试卷
                    </span>
                  </header>
                  <ElInput v-model="questionKeyword" clearable placeholder="搜索题干">
                    <template #prefix><ArtSvgIcon icon="ri:search-line" /></template>
                  </ElInput>
                  <ElScrollbar height="300px" class="exam-page__question-list">
                    <ElCheckboxGroup v-if="filteredQuestions.length" v-model="selectedQuestionIds">
                      <ElCheckbox
                        v-for="question in filteredQuestions"
                        :key="question.id"
                        :value="question.id"
                        class="exam-page__question-option"
                      >
                        <span class="exam-page__question-copy">
                          <strong>{{ question.stem }}</strong>
                          <small>
                            {{ question.categoryName }} ·
                            <ArtDictDisplay
                              dict-code="smisQuestionType"
                              :value="question.questionType"
                              display="text"
                            />
                            · 默认 {{ question.defaultScore }} 分
                          </small>
                        </span>
                      </ElCheckbox>
                    </ElCheckboxGroup>
                    <ElEmpty v-else description="没有匹配的可用题目" :image-size="64" />
                  </ElScrollbar>
                </section>
                <section class="exam-page__selected">
                  <header>
                    <div><strong>试卷题目</strong><small>可直接调整每题分值</small></div>
                    <span>{{ selectedQuestions.length }} 题 · {{ totalScore }} 分</span>
                  </header>
                  <ArtTable
                    :data="selectedQuestions"
                    :columns="selectedQuestionColumns"
                    :pagination="false"
                    row-key="questionId"
                    table-layout="fixed"
                    size="small"
                    max-height="300"
                    empty-text="尚未选择试题"
                  />
                </section>
              </div>
            </div>
          </template>
          <template #employeeIds>
            <div class="exam-page__assignment">
              <header>
                <div><strong>考试人员</strong><small>保存后将为所选员工创建考试任务</small></div>
                <ElTag :type="paperForm.employeeIds.length ? 'success' : 'info'" effect="light">
                  已选 {{ paperForm.employeeIds.length }} 人
                </ElTag>
              </header>
              <TrainingEmployeeMultipleSelect
                v-if="hasAuth('SmisExamManagement:Assign')"
                v-model="paperForm.employeeIds"
                v-model:selected-data="employeeSelection"
                title="选择考试人员"
              />
              <ElAlert
                v-else
                title="当前账号可维护试卷内容，但没有分配考试人员的权限。"
                type="info"
                :closable="false"
                show-icon
              />
              <small class="exam-page__helper">
                暂不分配人员也可保存草稿，发布前再补充考试范围。
              </small>
            </div>
          </template>
        </ArtForm>
        <template #footer="{ api }">
          <div class="exam-page__footer">
            <div class="exam-page__footer-summary">
              <span :class="{ 'is-ready': paperConfigurationReady }" aria-hidden="true"></span>
              <div>
                <strong>{{ selectedQuestions.length }} 题 · {{ totalScore }} 分</strong>
                <small>及格线 {{ paperForm.passingScore || 0 }} 分</small>
              </div>
            </div>
            <div>
              <ElButton @click="api.handleClose()">取消</ElButton>
              <ElButton type="primary" :loading="submitting" @click="submitPaper">{{
                paperForm.id ? '保存变更' : '保存试卷'
              }}</ElButton>
            </div>
          </div>
        </template>
      </ArtDialog>

      <ArtDialog ref="detailDialogRef" size="xl">
        <div v-if="detail" class="exam-page__detail"
          ><div class="exam-page__detail-summary"
            ><div
              ><small>试卷总分</small><strong>{{ detail.paper.totalScore }}</strong></div
            ><div
              ><small>及格分数</small><strong>{{ detail.paper.passingScore }}</strong></div
            ><div
              ><small>考试时长</small
              ><strong>{{ detail.paper.timeLimitMinutes || '不限' }}<i> 分钟</i></strong></div
            ><div v-if="detail.attempt"
              ><small>本次成绩</small
              ><strong :class="detail.attempt.passed ? 'is-pass' : 'is-fail'">{{
                detail.attempt.score ?? '—'
              }}</strong></div
            ></div
          ><article v-for="(question, index) in detail.questions" :key="question.id"
            ><header
              ><ArtDictDisplay
                dict-code="smisQuestionType"
                :value="question.questionType"
                display="tag"
              />
              ><strong>{{ index + 1 }}. {{ question.stem }}</strong
              ><span>{{ question.score }} 分</span></header
            ><div class="exam-page__detail-options"
              ><p
                v-for="option in question.options"
                :key="option.key"
                :class="{
                  'is-correct': question.correctAnswers?.includes(option.key),
                  'is-answer': question.answerValues?.includes(option.key)
                }"
                ><b>{{ option.key }}</b
                >{{ option.content }}</p
              ></div
            ><ElAlert
              v-if="question.analysis"
              :title="`解析：${question.analysis}`"
              type="info"
              :closable="false" /></article
        ></div>
      </ArtDialog>

      <ArtDialog ref="sessionDialogRef" size="full">
        <div v-if="session" class="exam-session"
          ><aside
            ><small>剩余时间</small><strong>{{ remainingText }}</strong
            ><span>题卡</span
            ><div
              ><button
                v-for="(question, index) in session.questions"
                :key="question.id"
                :class="{
                  'is-active': index === currentIndex,
                  'is-answered': Boolean(answers[question.id]?.length)
                }"
                type="button"
                @click="goQuestion(index)"
                >{{ index + 1 }}</button
              ></div
            ><ElProgress :percentage="answerProgress" :stroke-width="8" /></aside
          ><main
            ><header
              ><div
                ><ArtDictDisplay
                  dict-code="smisQuestionType"
                  :value="currentQuestion.questionType"
                  display="tag"
                />
                ><span>第 {{ currentIndex + 1 }} / {{ session.questions.length }} 题</span></div
              ><b>{{ currentQuestion.score }} 分</b></header
            ><h3>{{ currentQuestion.stem }}</h3
            ><ElCheckboxGroup
              v-if="currentQuestion.questionType === 'multiple'"
              v-model="answers[currentQuestion.id]"
              class="exam-session__answers"
              ><ElCheckbox
                v-for="option in currentQuestion.options"
                :key="option.key"
                :value="option.key"
                ><b>{{ option.key }}</b
                >{{ option.content }}</ElCheckbox
              ></ElCheckboxGroup
            ><ElRadioGroup
              v-else
              v-model="singleAnswers[currentQuestion.id]"
              class="exam-session__answers"
              ><ElRadio
                v-for="option in currentQuestion.options"
                :key="option.key"
                :value="option.key"
                ><b>{{ option.key }}</b
                >{{ option.content }}</ElRadio
              ></ElRadioGroup
            ><footer
              ><ElButton :disabled="currentIndex === 0" @click="goQuestion(currentIndex - 1)"
                >上一题</ElButton
              ><ElButton
                v-if="currentIndex < session.questions.length - 1"
                type="primary"
                @click="goQuestion(currentIndex + 1)"
                >保存并下一题</ElButton
              ><ElButton v-else type="success" :loading="submitting" @click="finishExam"
                >提交试卷</ElButton
              ></footer
            ></main
          ></div
        >
      </ArtDialog>
    </div>
  </ArtPermissionGuard>
</template>

<script setup lang="tsx">
  import type { FormRules } from 'element-plus'
  import { ElButton, ElInputNumber, ElMessage } from 'element-plus'
  import type { EmployeeIntegrationItem } from '@/api/integration/employees'
  import type { SearchFormItem } from '@/components/core/forms/art-search-bar/index.vue'
  import type {
    ArtTableQueryExpose,
    ArtTableQueryHeaderAction,
    ArtTableQueryHeaderActionContext
  } from '@/components/core/tables/art-table-query/index.vue'
  import type { ColumnOption } from '@/types'
  import { pageInfoHandler } from '@/utils/table/tableUtils'
  import { useArtFeedback } from '@/hooks/core/useArtFeedback'
  import { useAuth } from '@/hooks/core/useAuth'
  import { useUserStore } from '@/store/modules/user'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import ArtButtonMore, {
    type ButtonMoreItem
  } from '@/components/core/forms/art-button-more/index.vue'
  import ArtDictDisplay from '@/components/core/base/art-dict-display/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import ArtDialog from '@/components/core/dialogs/art-dialog/index.vue'
  import type { ArtDialogExpose } from '@/components/core/dialogs/art-dialog/types'
  import ArtForm, { type FormItem } from '@/components/core/forms/art-form/index.vue'
  import ArtTable from '@/components/core/tables/art-table/index.vue'
  import BusinessWorkspaceHeader, {
    type BusinessWorkspaceMetric
  } from '@/components/business/business-workspace-header/index.vue'
  import BusinessTableWorkspaceActions from '@/components/business/business-table-workspace-actions/index.vue'
  import TrainingEmployeeMultipleSelect from '../training-management/shared/training-employee-multiple-select.vue'
  import {
    deleteExamPapers,
    fetchExamDetail,
    fetchExamPaperList,
    fetchExamRecordList,
    fetchQuestionBankList,
    generateExamQuestions,
    saveExamAnswer,
    saveExamPaper,
    startExam,
    submitExam,
    transitionExamPaper,
    type SmisExamDetail,
    type SmisExamPaper,
    type SmisExamPaperOverview,
    type SmisExamPaperPayload,
    type SmisExamPaperSearchParams,
    type SmisExamQuestionSelection,
    type SmisExamRecord,
    type SmisExamRecordOverview,
    type SmisExamRecordSearchParams,
    type SmisQuestion,
    type SmisQuestionCategory
  } from '@smis/api'

  defineOptions({ name: 'SmisExamManagement' })
  type PaperParams = SmisExamPaperSearchParams &
    Pick<Api.Common.PaginationParams, 'current' | 'size'>
  type RecordParams = SmisExamRecordSearchParams &
    Pick<Api.Common.PaginationParams, 'current' | 'size'>
  const userStore = useUserStore()
  const { hasAuth } = useAuth()
  const { getDictMap } = storeToRefs(userStore)
  const { confirm, confirmDelete } = useArtFeedback()
  const activeTab = ref<'paper' | 'record'>('paper')
  const paperTableRef = ref<ArtTableQueryExpose>()
  const recordTableRef = ref<ArtTableQueryExpose>()
  const paperDialogRef = ref<ArtDialogExpose>()
  const detailDialogRef = ref<ArtDialogExpose>()
  const sessionDialogRef = ref<ArtDialogExpose>()
  const paperFormRef = ref<InstanceType<typeof ArtForm>>()
  const submitting = ref(false),
    generating = ref(false)
  const paperQuery = ref<SmisExamPaperSearchParams>({})
  const recordQuery = ref<SmisExamRecordSearchParams>({})
  const paperOverview = reactive<SmisExamPaperOverview>({
    total: 0,
    draft: 0,
    published: 0,
    inProgress: 0,
    completed: 0
  })
  const recordOverview = reactive<SmisExamRecordOverview>({
    total: 0,
    inProgress: 0,
    passed: 0,
    failed: 0
  })
  const questions = ref<SmisQuestion[]>([]),
    categories = ref<SmisQuestionCategory[]>([]),
    selectedQuestions = ref<SmisExamQuestionSelection[]>([])
  const selectedQuestionIds = ref<string[]>([]),
    questionKeyword = ref(''),
    employeeSelection = ref<EmployeeIntegrationItem[]>([])
  const detail = ref<SmisExamDetail>(),
    session = ref<SmisExamDetail>(),
    currentIndex = ref(0),
    answers = reactive<Record<string, string[]>>({}),
    singleAnswers = reactive<Record<string, string>>({}),
    nowTick = ref(Date.now())
  const createPaper = (): SmisExamPaperPayload => ({
    paperTitle: '',
    paperNo: '',
    assemblyMode: 'fixed',
    randomRule: [{ categoryId: null, questionType: null, count: 5, score: 2 }],
    passingScore: 60,
    timeLimitMinutes: 60,
    allowRetake: false,
    maxAttempts: 1,
    openAt: null,
    closeAt: null,
    remark: '',
    questions: [],
    employeeIds: []
  })
  const paperForm = reactive<SmisExamPaperPayload>(createPaper())
  const dictOptions = (code: string) =>
    (getDictMap.value[code] ?? []).map((item) => ({
      label: item.label || item.name,
      value: item.value
    }))
  const questionTypeOptions = computed(() => dictOptions('smisQuestionType')),
    assemblyModeOptions = computed(() => dictOptions('smisExamAssemblyMode')),
    categoryOptions = computed(() =>
      categories.value.map((item) => ({ label: item.categoryName, value: item.id }))
    )
  const exportDictLabel = (code: string, value: unknown) =>
    dictOptions(code).find((item) => item.value === String(value))?.label ?? String(value ?? '')
  const examResultStatus = (row: SmisExamRecord) =>
    row.attemptStatus === 'in_progress' ? 'in_progress' : row.passed ? 'passed' : 'failed'
  const selectedQuestionColumns = computed<ColumnOption<SmisExamQuestionSelection>[]>(() => [
    { type: 'globalIndex', label: '序号', width: 58, align: 'center' },
    { prop: 'stem', label: '题目', minWidth: 180, showOverflowTooltip: true },
    {
      prop: 'questionType',
      label: '题型',
      width: 82,
      formatter: (row) => (
        <ArtDictDisplay dictCode="smisQuestionType" value={row.questionType} display="tag" />
      )
    },
    {
      prop: 'score',
      label: '分值',
      width: 124,
      required: true,
      formatter: (row) => (
        <ElInputNumber
          v-model={row.score}
          min={0.01}
          max={999}
          precision={2}
          size="small"
          class="!w-full"
        />
      )
    },
    {
      prop: 'operation',
      label: '操作',
      width: 64,
      align: 'center',
      formatter: (row) => (
        <ElButton link type="danger" onClick={() => removeSelected(row.questionId)}>
          移除
        </ElButton>
      )
    }
  ])
  const filteredQuestions = computed(() =>
    questions.value.filter(
      (item) => !questionKeyword.value || item.stem.includes(questionKeyword.value.trim())
    )
  )
  const totalScore = computed(() =>
    selectedQuestions.value.reduce((sum, item) => sum + Number(item.score || 0), 0)
  )
  const passingScoreInvalid = computed(
    () => totalScore.value > 0 && Number(paperForm.passingScore) > totalScore.value
  )
  const dateRangeInvalid = computed(
    () =>
      Boolean(paperForm.openAt) &&
      Boolean(paperForm.closeAt) &&
      new Date(paperForm.closeAt as string).getTime() <=
        new Date(paperForm.openAt as string).getTime()
  )
  const paperConfigurationReady = computed(
    () =>
      Boolean(paperForm.paperTitle.trim()) &&
      selectedQuestions.value.length > 0 &&
      totalScore.value > 0 &&
      !passingScoreInvalid.value &&
      !dateRangeInvalid.value
  )
  watch(
    selectedQuestionIds,
    (ids) => {
      const existing = new Map(selectedQuestions.value.map((item) => [item.questionId, item]))
      selectedQuestions.value = ids.map(
        (id) =>
          existing.get(id) ??
          (() => {
            const q = questions.value.find((item) => item.id === id)!
            return {
              id: q.id,
              questionId: q.id,
              categoryId: q.categoryId,
              categoryName: q.categoryName,
              questionType: q.questionType,
              stem: q.stem,
              score: q.defaultScore
            }
          })()
      )
    },
    { deep: true }
  )
  watch(
    singleAnswers,
    (value) => {
      Object.entries(value).forEach(([id, answer]) => {
        answers[id] = answer ? [answer] : []
      })
    },
    { deep: true }
  )
  watch(
    () => paperForm.allowRetake,
    (allowed) => {
      paperForm.maxAttempts = allowed ? Math.max(Number(paperForm.maxAttempts || 0), 2) : 1
    }
  )
  useIntervalFn(() => {
    nowTick.value = Date.now()
  }, 1000)
  const emptyExamQuestion: SmisExamQuestionSelection = {
    id: '',
    questionId: '',
    questionType: 'single',
    stem: '',
    score: 0,
    options: []
  }
  const currentQuestion = computed<SmisExamQuestionSelection>(
    () => session.value?.questions[currentIndex.value] ?? emptyExamQuestion
  )
  const answerProgress = computed(() =>
    !session.value?.questions.length
      ? 0
      : Math.round(
          (Object.values(answers).filter((item) => item.length).length /
            session.value.questions.length) *
            100
        )
  )
  const remainingText = computed(() => {
    const expires = session.value?.attempt?.expiresAt
    if (!expires) return '不限时'
    const seconds = Math.max(Math.floor((new Date(expires).getTime() - nowTick.value) / 1000), 0)
    return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
  })
  const metrics = computed<BusinessWorkspaceMetric[]>(() =>
    activeTab.value === 'paper'
      ? [
          {
            label: '试卷总数',
            value: paperOverview.total,
            description: '当前租户试卷',
            icon: 'ri:file-list-3-line'
          },
          {
            label: '待发布',
            value: paperOverview.draft,
            description: '仍可调整题目',
            icon: 'ri:draft-line'
          },
          {
            label: '已发布',
            value: paperOverview.published,
            description: '可开始考试',
            icon: 'ri:send-plane-line',
            tone: 'success'
          },
          {
            label: '考试中',
            value: paperOverview.inProgress,
            description: '当前账号进行中',
            icon: 'ri:timer-line',
            tone: 'warning'
          }
        ]
      : [
          {
            label: '考试次数',
            value: recordOverview.total,
            description: '独立考试尝试',
            icon: 'ri:file-history-line'
          },
          {
            label: '进行中',
            value: recordOverview.inProgress,
            description: '可断点继续',
            icon: 'ri:timer-line',
            tone: 'warning'
          },
          {
            label: '已及格',
            value: recordOverview.passed,
            description: '达到及格线',
            icon: 'ri:checkbox-circle-line',
            tone: 'success'
          },
          {
            label: '未及格',
            value: recordOverview.failed,
            description: '可按规则补考',
            icon: 'ri:close-circle-line',
            tone: 'danger'
          }
        ]
  )
  const paperSearchItems = computed<SearchFormItem[]>(() => [
    {
      label: '试卷',
      key: 'keyword',
      type: 'input',
      props: { clearable: true, placeholder: '试卷编号或标题' }
    },
    {
      label: '状态',
      key: 'status',
      type: 'select',
      props: {
        options: dictOptions('smisExamPaperStatus'),
        clearable: true,
        placeholder: '全部状态'
      }
    }
  ])
  const recordSearchItems = computed<SearchFormItem[]>(() => [
    {
      label: '关键字',
      key: 'keyword',
      type: 'input',
      props: { clearable: true, placeholder: '试卷或考生姓名' }
    },
    {
      label: '考试结果',
      key: 'status',
      type: 'select',
      props: {
        options: dictOptions('smisExamStatus').filter((item) => item.value !== 'not_started'),
        clearable: true,
        placeholder: '全部结果'
      }
    }
  ])
  const paperItems = computed<FormItem[]>(() => [
    { label: '试卷信息', key: 'basicSection', type: 'divider', span: 24 },
    {
      label: '试卷标题',
      key: 'paperTitle',
      type: 'input',
      span: 12,
      props: { maxlength: 200, showWordLimit: true }
    },
    {
      label: '试卷编号（可选）',
      key: 'paperNo',
      type: 'input',
      span: 6,
      props: { placeholder: '留空自动生成' }
    },
    {
      label: '及格分数',
      key: 'passingScore',
      type: 'inputNumber',
      span: 6,
      props: { min: 0.01, max: 99999, precision: 2, class: '!w-full' }
    },
    { label: '考试规则', key: 'ruleSection', type: 'divider', span: 24 },
    {
      label: '考试时长（分钟）',
      key: 'timeLimitMinutes',
      type: 'inputNumber',
      span: 6,
      props: { min: 1, max: 1440, class: '!w-full' }
    },
    {
      label: '开放时间',
      key: 'openAt',
      type: 'date',
      span: 9,
      props: {
        type: 'datetime',
        valueFormat: 'YYYY-MM-DDTHH:mm:ssZ',
        clearable: true,
        class: '!w-full'
      }
    },
    {
      label: '结束时间',
      key: 'closeAt',
      type: 'date',
      span: 9,
      props: {
        type: 'datetime',
        valueFormat: 'YYYY-MM-DDTHH:mm:ssZ',
        clearable: true,
        class: '!w-full'
      }
    },
    { label: '允许补考', key: 'allowRetake', type: 'switch', span: 6 },
    {
      label: '最多考试次数（含首次）',
      key: 'maxAttempts',
      type: 'inputNumber',
      span: 6,
      props: {
        min: paperForm.allowRetake ? 2 : 1,
        max: 20,
        disabled: !paperForm.allowRetake,
        class: '!w-full'
      }
    },
    { label: '组卷与人员', key: 'assemblySection', type: 'divider', span: 24 },
    { label: '组卷配置', key: 'questions', span: 24 },
    { label: '考试人员', key: 'employeeIds', span: 24 },
    {
      label: '备注',
      key: 'remark',
      type: 'textarea',
      span: 24,
      props: { rows: 3, maxlength: 1000, showWordLimit: true }
    }
  ])
  const paperRules: FormRules = {
    paperTitle: [{ required: true, message: '请输入试卷标题', trigger: 'blur' }],
    passingScore: [{ required: true, message: '请输入及格分数', trigger: 'change' }],
    timeLimitMinutes: [{ required: true, message: '请输入考试时长', trigger: 'change' }],
    closeAt: [
      {
        validator: (_rule, _value, callback) =>
          dateRangeInvalid.value ? callback(new Error('结束时间必须晚于开放时间')) : callback(),
        trigger: 'change'
      }
    ]
  }
  const openPaper = async (row?: SmisExamPaper, copy = false) => {
    const bank = await fetchQuestionBankList({ status: 'enabled', from: 0, to: 4999 })
    questions.value = bank.data
    categories.value = bank.categories
    Object.assign(
      paperForm,
      createPaper(),
      row
        ? {
            ...row,
            id: copy ? undefined : row.id,
            paperNo: copy ? '' : row.paperNo,
            paperTitle: copy ? `${row.paperTitle}（复制）` : row.paperTitle,
            employeeIds: []
          }
        : {}
    )
    employeeSelection.value = []
    selectedQuestions.value = []
    selectedQuestionIds.value = []
    if (row) {
      const value = await fetchExamDetail(row.id, null, true)
      selectedQuestions.value = (value?.questions ?? []).map((item) => ({
        ...item,
        questionId: item.id
      }))
      selectedQuestionIds.value = selectedQuestions.value.map((item) => item.questionId)
    }
    await paperDialogRef.value?.handleOpen(undefined, {
      title: copy ? '复制并创建试卷' : row ? '编辑试卷' : '创建试卷',
      contentMaxHeight: '78vh'
    })
  }
  const randomGenerate = async () => {
    if (!paperForm.randomRule.length) {
      ElMessage.warning('请至少添加一条随机抽题规则')
      return
    }
    if (selectedQuestions.value.length) {
      try {
        await confirm('随机生成会替换当前已选题目，是否继续？', {
          title: '重新生成试题',
          confirmButtonText: '继续生成'
        })
      } catch {
        return
      }
    }
    try {
      generating.value = true
      selectedQuestions.value = (await generateExamQuestions(paperForm.randomRule)).map((item) => ({
        ...item,
        id: item.questionId,
        questionType: item.questionType as SmisExamQuestionSelection['questionType']
      }))
      selectedQuestionIds.value = selectedQuestions.value.map((item) => item.questionId)
      if (!selectedQuestions.value.length) {
        ElMessage.warning('当前规则没有匹配到可用题目，请调整分类、题型或数量')
      }
    } finally {
      generating.value = false
    }
  }
  const removeSelected = (id: string) => {
    selectedQuestionIds.value = selectedQuestionIds.value.filter((item) => item !== id)
    selectedQuestions.value = selectedQuestions.value.filter((item) => item.questionId !== id)
  }
  const submitPaper = async () => {
    try {
      await paperFormRef.value?.validate()
      if (dateRangeInvalid.value) {
        ElMessage.warning('结束时间必须晚于开放时间')
        return
      }
      if (!selectedQuestions.value.length) {
        ElMessage.warning('请至少选择一道试题后再保存')
        return
      }
      if (totalScore.value <= 0) {
        ElMessage.warning('试卷总分必须大于 0 分')
        return
      }
      if (passingScoreInvalid.value) {
        ElMessage.warning('及格分数不能高于试卷总分')
        return
      }
      if (paperForm.allowRetake && paperForm.maxAttempts < 2) {
        ElMessage.warning('允许补考时，最多考试次数至少为 2 次')
        return
      }
      submitting.value = true
      await saveExamPaper({
        ...paperForm,
        questions: selectedQuestions.value.map((item) => ({
          questionId: item.questionId,
          score: Number(item.score)
        }))
      })
      await paperDialogRef.value?.handleClose(true)
      await paperTableRef.value?.refreshUpdate()
    } catch {
      /* 保留表单 */
    } finally {
      submitting.value = false
    }
  }
  const showDetail = async (paperId: string, attemptId?: string, preview = true) => {
    detail.value = (await fetchExamDetail(paperId, attemptId, preview)) ?? undefined
    await detailDialogRef.value?.handleOpen(undefined, {
      title: attemptId ? '试卷详情' : '考试预览',
      contentMaxHeight: '78vh'
    })
  }
  const beginExam = async (row: SmisExamPaper) => {
    session.value = (await startExam(row.id)) ?? undefined
    currentIndex.value = 0
    Object.keys(answers).forEach((key) => delete answers[key])
    Object.keys(singleAnswers).forEach((key) => delete singleAnswers[key])
    session.value?.questions.forEach((item) => {
      answers[item.id] = [...(item.answerValues ?? [])]
      singleAnswers[item.id] = item.answerValues?.[0] ?? ''
    })
    await sessionDialogRef.value?.handleOpen(undefined, {
      title: row.examStatus === 'in_progress' ? '继续考试' : '开始考试',
      contentMaxHeight: '84vh'
    })
  }
  const persistCurrent = async () => {
    if (!session.value?.attempt || !currentQuestion.value.id) return
    await saveExamAnswer(
      session.value.attempt.id,
      currentQuestion.value.id,
      answers[currentQuestion.value.id] ?? []
    )
  }
  const goQuestion = async (index: number) => {
    await persistCurrent()
    currentIndex.value = Math.min(Math.max(index, 0), (session.value?.questions.length ?? 1) - 1)
  }
  const finishExam = async () => {
    if (!session.value?.attempt) return
    try {
      await persistCurrent()
      submitting.value = true
      await confirmDelete(
        `确定提交试卷吗？当前已作答 ${Object.values(answers).filter((item) => item.length).length}/${session.value.questions.length} 题。`
      )
      detail.value = (await submitExam(session.value.attempt.id)) ?? undefined
      await sessionDialogRef.value?.handleClose(true)
      await Promise.all([
        paperTableRef.value?.refreshUpdate(),
        recordTableRef.value?.refreshUpdate()
      ])
      await detailDialogRef.value?.handleOpen(undefined, {
        title: '考试结果',
        contentMaxHeight: '78vh'
      })
    } catch {
      /* 取消提交 */
    } finally {
      submitting.value = false
    }
  }
  const removePaper = async (row: SmisExamPaper) => {
    try {
      await confirmDelete(`确定删除草稿试卷“${row.paperTitle}”吗？`)
      await deleteExamPapers([row.id])
      await paperTableRef.value?.refreshRemove()
    } catch {
      /* 用户取消 */
    }
  }
  const paperMore = (row: SmisExamPaper): ButtonMoreItem[] => [
    {
      auth: 'SmisExamManagement:Add',
      key: 'copy',
      label: '复制并创建',
      icon: 'ri:file-copy-2-line'
    },
    { auth: 'SmisExamManagement:Preview', key: 'preview', label: '考试预览', icon: 'ri:eye-line' },
    {
      auth: 'SmisExamManagement:Publish',
      key: row.status === 'published' ? 'close' : 'publish',
      label: row.status === 'published' ? '关闭试卷' : '发布试卷',
      icon: row.status === 'published' ? 'ri:stop-circle-line' : 'ri:send-plane-line',
      disabled: row.status === 'closed'
    },
    {
      auth: 'SmisExamManagement:Take',
      key: 'take',
      label: row.examStatus === 'in_progress' ? '继续考试' : '开始考试',
      icon: 'ri:play-circle-line',
      disabled: !row.assignmentId || row.status !== 'published' || row.examStatus === 'passed'
    },
    {
      auth: 'SmisExamManagement:Delete',
      key: 'delete',
      label: '删除',
      icon: 'ri:delete-bin-line',
      color: 'var(--el-color-danger)',
      disabled: row.status !== 'draft'
    }
  ]
  const handlePaperMore = async (item: ButtonMoreItem, row: SmisExamPaper) => {
    if (item.key === 'copy') await openPaper(row, true)
    else if (item.key === 'preview') await showDetail(row.id)
    else if (item.key === 'take') await beginExam(row)
    else if (item.key === 'delete') await removePaper(row)
    else {
      await transitionExamPaper(row.id, item.key as 'publish' | 'close')
      await paperTableRef.value?.refreshUpdate()
    }
  }
  const paperColumns = (): ColumnOption<SmisExamPaper>[] => [
    { type: 'selection', width: 48 },
    { type: 'globalIndex', label: '序号', width: 68 },
    {
      prop: 'paperTitle',
      label: '试卷',
      minWidth: 260,
      fixed: 'left',
      formatter: (row) => (
        <div class="exam-page__identity">
          <span>
            <ArtSvgIcon icon="ri:file-list-3-line" />
          </span>
          <span>
            <strong>{row.paperTitle}</strong>
            <small>{row.paperNo}</small>
          </span>
        </div>
      )
    },
    {
      prop: 'assemblyMode',
      label: '组卷方式',
      width: 120,
      formatter: (row) => (
        <ArtDictDisplay dictCode="smisExamAssemblyMode" value={row.assemblyMode} display="tag" />
      )
    },
    {
      prop: 'questionCount',
      label: '题量',
      width: 76,
      align: 'center',
      formatter: (row) => `${row.questionCount} 题`
    },
    {
      prop: 'totalScore',
      label: '总分 / 及格',
      width: 110,
      align: 'center',
      formatter: (row) => `${row.totalScore} / ${row.passingScore}`
    },
    {
      prop: 'timeLimitMinutes',
      label: '时长',
      width: 82,
      align: 'center',
      formatter: (row) => (row.timeLimitMinutes ? `${row.timeLimitMinutes} 分` : '不限时')
    },
    { prop: 'assigneeCount', label: '考试人数', width: 90, align: 'center' },
    {
      prop: 'status',
      label: '状态',
      width: 90,
      formatter: (row) => (
        <ArtDictDisplay dictCode="smisExamPaperStatus" value={row.status} display="tag" />
      )
    },
    {
      prop: 'operation',
      label: '操作',
      width: 124,
      fixed: 'right',
      formatter: (row) => (
        <div class="flex">
          <ArtButtonTable
            type="edit"
            permission="SmisExamManagement:Edit"
            disabled={row.status !== 'draft'}
            onClick={() => openPaper(row)}
          />
          <ArtButtonMore
            list={paperMore(row)}
            onClick={(item: ButtonMoreItem) => handlePaperMore(item, row)}
          />
        </div>
      )
    }
  ]
  const recordColumns = (): ColumnOption<SmisExamRecord>[] => [
    { type: 'globalIndex', label: '序号', width: 68 },
    {
      prop: 'paperTitle',
      label: '试卷',
      minWidth: 230,
      fixed: 'left',
      formatter: (row) => (
        <div>
          <strong>{row.paperTitle}</strong>
          <div class="text-xs text-gray-400">
            {row.paperNo} · 第 {row.attemptNo} 次
          </div>
        </div>
      )
    },
    {
      prop: 'employeeName',
      label: '考生',
      width: 130,
      formatter: (row) => (
        <div>
          <strong>{row.employeeName}</strong>
          <div class="text-xs text-gray-400">{row.employeeNo}</div>
        </div>
      )
    },
    {
      prop: 'organizationName',
      label: '部门 / 岗位',
      minWidth: 170,
      formatter: (row) => [row.organizationName, row.jobTitle].filter(Boolean).join(' · ') || '—'
    },
    {
      prop: 'score',
      label: '得分',
      width: 92,
      align: 'center',
      formatter: (row) => (row.score == null ? '考试中' : `${row.score} / ${row.totalScore}`)
    },
    {
      prop: 'passed',
      label: '结果',
      width: 90,
      formatter: (row) => (
        <ArtDictDisplay dictCode="smisExamStatus" value={examResultStatus(row)} display="tag" />
      )
    },
    { prop: 'startedAt', label: '开始时间', width: 168 },
    {
      prop: 'durationSeconds',
      label: '用时',
      width: 92,
      formatter: (row) =>
        row.durationSeconds == null ? '—' : `${Math.ceil(row.durationSeconds / 60)} 分钟`
    },
    {
      prop: 'operation',
      label: '操作',
      width: 88,
      fixed: 'right',
      formatter: (row) => (
        <ElButton
          v-auth="'SmisExamManagement:ViewDetail'"
          link
          type="primary"
          onClick={() => showDetail(row.paperId, row.id, false)}
        >
          详情
        </ElButton>
      )
    }
  ]
  const paperActions = computed<ArtTableQueryHeaderAction[]>(() => [
    {
      permission: 'SmisExamManagement:Add',
      type: 'add',
      label: '创建试卷',
      onClick: () => openPaper()
    },
    {
      permission: 'SmisExamManagement:Delete',
      type: 'delete',
      content: ({ selectedCount }: ArtTableQueryHeaderActionContext) =>
        `确定删除选中的 ${selectedCount} 份草稿试卷吗？`,
      onClick: async ({ selectedRows, api }) => {
        await deleteExamPapers(selectedRows.map((row) => row.id as string))
        await api.refreshRemove()
      }
    },
    {
      permission: 'SmisExamManagement:Export',
      type: 'export',
      label: '导出试卷',
      exportFilename: '考试试卷',
      exportSheetName: '试卷',
      exportColumns: [
        { key: 'paperNo', title: '试卷编号' },
        { key: 'paperTitle', title: '试卷标题' },
        {
          key: 'assemblyMode',
          title: '组卷方式',
          formatter: (value) => exportDictLabel('smisExamAssemblyMode', value)
        },
        { key: 'questionCount', title: '题量' },
        { key: 'totalScore', title: '总分' },
        { key: 'passingScore', title: '及格分数' },
        {
          key: 'status',
          title: '状态',
          formatter: (value) => exportDictLabel('smisExamPaperStatus', value)
        }
      ],
      exportApi: async () => ({
        data: (await fetchExamPaperList({ ...paperQuery.value, from: 0, to: 4999 })).data
      })
    }
  ])
  const recordActions = computed<ArtTableQueryHeaderAction[]>(() => [
    {
      permission: 'SmisExamManagement:Export',
      type: 'export',
      label: '导出考试记录',
      exportFilename: '考试记录',
      exportSheetName: '考试记录',
      exportColumns: [
        { key: 'paperNo', title: '试卷编号' },
        { key: 'paperTitle', title: '试卷标题' },
        { key: 'employeeName', title: '考生姓名' },
        { key: 'organizationName', title: '所属部门' },
        { key: 'attemptNo', title: '考试次数' },
        { key: 'score', title: '得分' },
        {
          key: 'passed',
          title: '考试结果',
          formatter: (value, row) =>
            exportDictLabel(
              'smisExamStatus',
              row.attemptStatus === 'in_progress' ? 'in_progress' : value ? 'passed' : 'failed'
            )
        },
        { key: 'startedAt', title: '开始时间' },
        { key: 'submittedAt', title: '交卷时间' }
      ],
      exportApi: async () => ({
        data: (await fetchExamRecordList({ ...recordQuery.value, from: 0, to: 4999 })).data
      })
    }
  ])
  const fetchPapers = async (params: PaperParams) => {
    const { from, to } = pageInfoHandler({ current: params.current, size: params.size })
    const result = await fetchExamPaperList({ ...params, from, to })
    Object.assign(paperOverview, result.overview)
    return result
  }
  const fetchRecords = async (params: RecordParams) => {
    const { from, to } = pageInfoHandler({ current: params.current, size: params.size })
    const result = await fetchExamRecordList({ ...params, from, to })
    Object.assign(recordOverview, result.overview)
    return result
  }
  onMounted(async () => {
    await Promise.all(
      ['smisQuestionType', 'smisExamAssemblyMode', 'smisExamPaperStatus', 'smisExamStatus'].map(
        (code) => userStore.ensureDictLoaded(code)
      )
    )
  })
</script>

<style scoped lang="scss">
  .exam-page {
    gap: 12px;
    min-width: 0;
  }

  .exam-page__body {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    padding: 0 14px 14px;
  }

  .exam-page__tabs {
    flex: none;

    :deep(.el-tabs__header) {
      margin-bottom: 10px;
    }
  }

  .exam-page__table {
    flex: 1;
    min-width: 0;
    min-height: 0;
  }

  :deep(.exam-page__identity) {
    display: grid;
    grid-template-columns: 36px minmax(0, 1fr);
    gap: 10px;
    align-items: center;

    > span:first-child {
      display: grid;
      place-items: center;
      width: 36px;
      height: 36px;
      color: var(--theme-color);
      background: color-mix(in srgb, var(--theme-color) 9%, transparent);
      border-radius: var(--el-border-radius-base);
    }

    > span:last-child {
      display: grid;
      min-width: 0;
    }

    strong,
    small {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    small {
      color: var(--el-text-color-secondary);
    }
  }

  .exam-page__paper-hero {
    display: grid;
    grid-template-columns: 44px minmax(0, 1fr) auto;
    gap: 14px;
    align-items: center;
    padding: 14px 16px;
    margin-bottom: 18px;
    background:
      linear-gradient(
        115deg,
        color-mix(in srgb, var(--theme-color) 10%, transparent),
        transparent 62%
      ),
      var(--el-fill-color-lighter);
    border: 1px solid color-mix(in srgb, var(--theme-color) 16%, var(--el-border-color-lighter));
    border-radius: var(--custom-radius);

    > span {
      display: grid;
      place-items: center;
      width: 44px;
      height: 44px;
      font-size: 20px;
      color: var(--theme-color);
      background: var(--default-box-color);
      border-radius: var(--el-border-radius-base);
    }

    > div {
      display: grid;
      gap: 3px;
      min-width: 0;

      strong {
        font-size: 16px;
      }

      small {
        color: var(--el-text-color-secondary);
      }
    }

    ol {
      display: flex;
      gap: 6px;
      padding: 0;
      margin: 0;
      list-style: none;
    }

    li {
      padding: 5px 9px;
      font-size: 12px;
      color: var(--el-text-color-secondary);
      background: var(--default-box-color);
      border: 1px solid var(--el-border-color-lighter);
      border-radius: 999px;

      &.is-ready {
        color: var(--el-color-success);
        background: var(--el-color-success-light-9);
        border-color: var(--el-color-success-light-7);
      }
    }
  }

  .exam-page__assembly {
    display: grid;
    gap: 16px;
    padding: 18px;
    background: color-mix(in srgb, var(--el-fill-color-light) 42%, transparent);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: var(--custom-radius);
  }

  .exam-page__assembly-heading {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 18px;
    align-items: flex-end;

    > div {
      display: grid;
      gap: 3px;
    }

    small {
      font-size: 10px;
      font-weight: 700;
      color: var(--theme-color);
      letter-spacing: 0.12em;
    }

    strong {
      font-size: 16px;
    }

    p {
      margin: 0;
      color: var(--el-text-color-secondary);
    }
  }

  :deep(.exam-page__assembly-mode.el-radio-group) {
    display: inline-flex;
    flex-wrap: nowrap !important;
    justify-self: end;
    width: auto;
    min-width: 270px;
  }

  :deep(.exam-page__assembly-mode .el-radio-button) {
    flex: 0 0 auto;
  }

  .exam-page__rule-guide {
    display: grid;
    grid-template-columns: minmax(140px, 1fr) minmax(130px, 1fr) 150px 150px 34px;
    gap: 8px;
    padding: 0 10px 0 50px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .exam-page__rule {
    display: grid;
    grid-template-columns: 30px minmax(140px, 1fr) minmax(130px, 1fr) 150px 150px 34px;
    gap: 8px;
    align-items: center;
    padding: 11px 10px;
    background: var(--default-box-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: var(--el-border-radius-base);

    > b {
      display: grid;
      place-items: center;
      width: 28px;
      height: 28px;
      color: var(--theme-color);
      background: color-mix(in srgb, var(--theme-color) 10%, transparent);
      border-radius: 50%;
    }
  }

  .exam-page__number-field {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 24px;
    gap: 6px;
    align-items: center;

    > span {
      color: var(--el-text-color-secondary);
    }
  }

  .exam-page__rule-actions {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;

    > small {
      color: var(--el-text-color-secondary);
    }

    > div {
      display: flex;
      gap: 8px;
    }
  }

  .exam-page__assembly-workspace {
    display: grid;
    grid-template-columns: minmax(320px, 0.9fr) minmax(0, 1.1fr);
    gap: 14px;
    align-items: stretch;

    &.is-random {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  .exam-page__question-picker,
  .exam-page__selected,
  .exam-page__assignment {
    display: grid;
    gap: 12px;
    min-width: 0;
    padding: 14px;
    background: var(--default-box-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: var(--el-border-radius-base);

    > header {
      display: flex;
      gap: 12px;
      align-items: center;
      justify-content: space-between;

      > div {
        display: grid;
        gap: 2px;
      }

      small {
        color: var(--el-text-color-secondary);
      }
    }
  }

  .exam-page__question-picker {
    grid-template-rows: auto auto minmax(0, 1fr);
  }

  .exam-page__selected {
    grid-template-rows: auto minmax(0, 1fr);
    align-content: start;
  }

  .exam-page__question-list {
    border: 1px solid var(--el-border-color-lighter);
    border-radius: var(--el-border-radius-base);

    :deep(.el-checkbox-group) {
      display: grid;
    }

    :deep(.exam-page__question-option.el-checkbox) {
      display: flex;
      gap: 8px;
      align-items: start;
      width: 100%;
      height: auto;
      padding: 10px 12px;
      margin: 0;
      border-bottom: 1px solid var(--el-border-color-lighter);
      transition: background-color var(--art-motion-duration-fast);

      &:hover {
        background: var(--el-fill-color-lighter);
      }
    }

    :deep(.exam-page__question-option .el-checkbox__input) {
      flex: 0 0 auto;
      margin-top: 2px;
    }

    :deep(.exam-page__question-option .el-checkbox__label) {
      min-width: 0;
      padding-left: 0;
      color: inherit;
    }

    .exam-page__question-copy {
      display: grid;
      min-width: 0;

      strong,
      small {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      small {
        margin-top: 3px;
        color: var(--el-text-color-secondary);
      }
    }
  }

  .exam-page__selected > header > span {
    font-weight: 600;
    color: var(--theme-color);
  }

  .exam-page__picker-hint {
    display: inline-flex;
    gap: 5px;
    align-items: center;
    font-size: 12px;
    color: var(--el-text-color-secondary);

    svg {
      color: var(--el-color-success);
    }
  }

  .exam-page__assignment {
    padding: 16px;
  }

  .exam-page__footer {
    display: flex;
    gap: 16px;
    align-items: center;
    justify-content: space-between;

    > div:last-child {
      display: flex;
      gap: 8px;
    }
  }

  .exam-page__footer-summary {
    display: flex;
    gap: 10px;
    align-items: center;

    > span {
      width: 9px;
      height: 9px;
      background: var(--el-color-warning);
      border-radius: 50%;
      box-shadow: 0 0 0 4px var(--el-color-warning-light-9);

      &.is-ready {
        background: var(--el-color-success);
        box-shadow: 0 0 0 4px var(--el-color-success-light-9);
      }
    }

    > div {
      display: grid;
      gap: 1px;
    }

    small {
      color: var(--el-text-color-secondary);
    }
  }

  .exam-page__helper {
    display: block;
    margin-top: 7px;
    color: var(--el-text-color-secondary);
  }

  .exam-page__detail {
    display: grid;
    gap: 14px;
  }

  .exam-page__detail-summary {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;

    > div {
      display: grid;
      gap: 5px;
      padding: 14px;
      background: var(--el-fill-color-lighter);
      border-radius: var(--el-border-radius-base);
    }

    small {
      color: var(--el-text-color-secondary);
    }

    strong {
      font-size: 22px;
    }

    i {
      font-size: 12px;
      font-style: normal;
    }

    .is-pass {
      color: var(--el-color-success);
    }

    .is-fail {
      color: var(--el-color-danger);
    }
  }

  .exam-page__detail article {
    padding: 16px;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: var(--custom-radius);

    header {
      display: flex;
      gap: 9px;
      align-items: flex-start;

      strong {
        flex: 1;
      }
    }
  }

  .exam-page__detail-options {
    display: grid;
    gap: 7px;
    padding: 12px 0;

    p {
      display: flex;
      gap: 9px;
      padding: 9px 11px;
      margin: 0;
      background: var(--el-fill-color-lighter);
      border-radius: var(--el-border-radius-base);

      &.is-correct {
        color: var(--el-color-success);
        background: var(--el-color-success-light-9);
      }

      &.is-answer {
        outline: 1px solid var(--theme-color);
      }
    }
  }

  .exam-session {
    display: grid;
    grid-template-columns: 190px minmax(0, 1fr);
    min-height: 620px;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: var(--custom-radius);
  }

  .exam-session aside {
    padding: 20px;
    border-right: 1px solid var(--el-border-color-lighter);

    > small,
    > span {
      display: block;
      color: var(--el-text-color-secondary);
    }

    > strong {
      display: block;
      margin: 4px 0 22px;
      font-size: 28px;
      color: var(--theme-color);
    }

    > div {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 7px;
      margin: 10px 0 18px;
    }

    button {
      height: 34px;
      color: var(--el-text-color-regular);
      cursor: pointer;
      background: var(--el-bg-color);
      border: 1px solid var(--el-border-color);
      border-radius: var(--el-border-radius-small);

      &.is-answered {
        color: white;
        background: var(--theme-color);
        border-color: var(--theme-color);
      }

      &.is-active {
        outline: 2px solid color-mix(in srgb, var(--theme-color) 35%, transparent);
      }
    }
  }

  .exam-session main {
    display: flex;
    flex-direction: column;
    padding: 28px 34px;

    header {
      display: flex;
      justify-content: space-between;

      div {
        display: flex;
        gap: 10px;
        align-items: center;
      }
    }

    h3 {
      margin: 24px 0;
      font-size: 20px;
      line-height: 1.7;
    }

    footer {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      margin-top: auto;
    }
  }

  .exam-session__answers {
    display: grid;
    gap: 12px;

    :deep(.el-checkbox),
    :deep(.el-radio) {
      height: auto;
      padding: 14px;
      margin: 0;
      white-space: normal;
      border: 1px solid var(--el-border-color-lighter);
      border-radius: var(--el-border-radius-base);
    }

    b {
      margin-right: 10px;
    }
  }

  @media (width <= 1100px) {
    .exam-page__paper-hero {
      grid-template-columns: 44px minmax(0, 1fr);

      ol {
        grid-column: 1 / -1;
      }
    }

    .exam-page__assembly-workspace {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  @media (width <= 900px) {
    .exam-page__assembly-heading,
    .exam-page__rule-actions {
      grid-template-columns: 1fr;
      align-items: stretch;
    }

    :deep(.exam-page__assembly-mode.el-radio-group) {
      justify-self: stretch;
      width: 100%;
      min-width: 0;
    }

    .exam-page__assembly-heading :deep(.el-radio-button) {
      flex: 1;
    }

    .exam-page__rule-guide {
      display: none;
    }

    .exam-page__rule {
      grid-template-columns: 1fr 1fr;

      > b {
        grid-column: 1 / -1;
      }
    }

    .exam-page__detail-summary {
      grid-template-columns: 1fr 1fr;
    }

    .exam-session {
      grid-template-columns: 1fr;
    }

    .exam-session aside {
      border-right: 0;
      border-bottom: 1px solid var(--el-border-color-lighter);
    }
  }
</style>
