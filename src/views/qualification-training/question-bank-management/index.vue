<template>
  <ArtPermissionGuard permission="SmisQuestionBankManagement:View">
    <div class="question-bank business-workspace-page art-full-height">
      <BusinessWorkspaceHeader
        density="compact"
        eyebrow="ASSESSMENT CONTENT"
        title="题库管理"
        description="集中维护培训题目、标准答案与解析，为固定组卷和随机组卷提供可信题源。"
        icon="ri:questionnaire-line"
        :tags="[
          { label: '客观题自动评分', type: 'primary', effect: 'plain' },
          { label: '发布试卷使用快照', type: 'success', effect: 'plain' },
          { label: '停用题目保留历史', type: 'warning', effect: 'light' }
        ]"
        :metrics="metrics"
        ><template #actions><BusinessTableWorkspaceActions :table="tableRef" /></template
      ></BusinessWorkspaceHeader>

      <div class="question-bank__workspace">
        <aside class="question-bank__categories art-card-xs">
          <header
            ><div
              ><strong>题库分类</strong><small>{{ categories.length }} 个分类</small></div
            ><ElButton
              v-auth="'SmisQuestionBankManagement:ManageCategory'"
              circle
              text
              aria-label="新增分类"
              title="新增题库分类"
              @click="openCategory()"
              ><ArtSvgIcon icon="ri:add-line" /></ElButton
          ></header>
          <ElScrollbar class="question-bank__category-scroll">
            <nav aria-label="题库分类">
              <button
                class="question-bank__category-select"
                :class="{ 'is-active': !searchQuery.categoryId }"
                type="button"
                @click="selectCategory()"
                ><span><ArtSvgIcon icon="ri:folder-3-line" />全部题目</span
                ><b>{{ overview.total }}</b></button
              >
              <div
                v-for="item in categories"
                :key="item.id"
                class="question-bank__category-row"
                :class="{ 'is-active': searchQuery.categoryId === item.id }"
              >
                <button
                  class="question-bank__category-select"
                  type="button"
                  :title="item.categoryName"
                  @click="selectCategory(item.id)"
                  ><span><ArtSvgIcon icon="ri:folder-line" />{{ item.categoryName }}</span
                  ><b>{{ item.questionCount }}</b></button
                >
                <span class="question-bank__category-actions">
                  <ElButton
                    v-auth="'SmisQuestionBankManagement:ManageCategory'"
                    link
                    :aria-label="`编辑分类${item.categoryName}`"
                    :title="`编辑分类：${item.categoryName}`"
                    @click="openCategory(item)"
                    ><ArtSvgIcon icon="ri:edit-line"
                  /></ElButton>
                  <ElButton
                    v-auth="'SmisQuestionBankManagement:ManageCategory'"
                    link
                    type="danger"
                    :aria-label="`删除分类${item.categoryName}`"
                    :title="`删除分类：${item.categoryName}`"
                    @click="removeCategory(item)"
                    ><ArtSvgIcon icon="ri:delete-bin-line"
                  /></ElButton>
                </span>
              </div>
              <ArtEmptyState
                v-if="!categories.length"
                title="暂无题库分类"
                description="新增分类后可按培训主题组织题目。"
                size="compact"
                :visual-size="60"
              />
            </nav>
          </ElScrollbar>
        </aside>

        <ArtTableQuery
          ref="tableRef"
          v-model="searchQuery"
          class="question-bank__table"
          :api-fn="fetchTableData"
          :search-items="searchItems"
          :columns-factory="columnsFactory"
          :header-actions="headerActions"
          header-actions-placement="workspace"
          :search-bar-props="{ span: 8, labelWidth: 72 }"
          :table-props="{
            rowKey: 'id',
            tableLayout: 'fixed',
            emptyText: '暂无题目',
            emptyDescription: '新增题目后即可用于固定或随机组卷。'
          }"
          focus-scope-selector=".question-bank__workspace"
          focusable
        />
      </div>

      <ArtDialog ref="categoryDialogRef" size="sm">
        <ArtForm
          ref="categoryFormRef"
          v-model="categoryForm"
          :items="categoryItems"
          :rules="categoryRules"
          :span="24"
          label-position="top"
          :show-reset="false"
          :show-submit="false"
        />
        <template #footer="{ api }"
          ><ElButton @click="api.handleClose()">取消</ElButton
          ><ElButton type="primary" :loading="submitting" @click="submitCategory"
            >确定</ElButton
          ></template
        >
      </ArtDialog>

      <ArtDialog ref="questionDialogRef" size="xl">
        <ArtForm
          ref="questionFormRef"
          v-model="questionForm"
          :items="questionItems"
          :rules="questionRules"
          :span="12"
          :gutter="24"
          label-position="top"
          :show-reset="false"
          :show-submit="false"
        >
          <template #options>
            <div class="question-bank__options">
              <div
                v-for="(option, index) in questionForm.options"
                :key="option.key"
                class="question-bank__option"
              >
                <ElCheckbox
                  v-if="questionForm.questionType === 'multiple'"
                  :model-value="questionForm.correctAnswers.includes(option.key)"
                  @change="setCorrect(option.key, Boolean($event))"
                  >正确</ElCheckbox
                >
                <ElRadio v-else v-model="singleAnswer" :value="option.key">正确</ElRadio>
                <ElTag effect="plain">{{ option.key }}</ElTag
                ><ElInput
                  v-model="option.content"
                  :placeholder="`请输入选项 ${option.key}`"
                  maxlength="1000"
                />
                <ElButton
                  v-if="
                    questionForm.questionType !== 'judgement' && questionForm.options.length > 2
                  "
                  circle
                  text
                  type="danger"
                  aria-label="删除选项"
                  @click="removeOption(index)"
                  ><ArtSvgIcon icon="ri:close-line"
                /></ElButton>
              </div>
              <ElButton
                v-if="questionForm.questionType !== 'judgement' && questionForm.options.length < 8"
                plain
                @click="addOption"
                ><ArtSvgIcon icon="ri:add-line" />添加选项</ElButton
              >
            </div>
          </template>
        </ArtForm>
        <template #footer="{ api }"
          ><ElButton @click="api.handleClose()">取消</ElButton
          ><ElButton type="primary" :loading="submitting" @click="submitQuestion"
            >保存题目</ElButton
          ></template
        >
      </ArtDialog>
    </div>
  </ArtPermissionGuard>
</template>

<script setup lang="tsx">
  import type { FormRules } from 'element-plus'
  import type { SearchFormItem } from '@/components/core/forms/art-search-bar/index.vue'
  import type {
    ArtTableQueryExpose,
    ArtTableQueryHeaderAction,
    ArtTableQueryHeaderActionContext
  } from '@/components/core/tables/art-table-query/index.vue'
  import type { ColumnOption } from '@/types'
  import { pageInfoHandler } from '@/utils/table/tableUtils'
  import { useArtFeedback } from '@/hooks/core/useArtFeedback'
  import { useUserStore } from '@/store/modules/user'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import ArtButtonMore, {
    type ButtonMoreItem
  } from '@/components/core/forms/art-button-more/index.vue'
  import ArtDictDisplay from '@/components/core/base/art-dict-display/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import ArtEmptyState from '@/components/core/feedback/art-empty-state/index.vue'
  import ArtDialog from '@/components/core/dialogs/art-dialog/index.vue'
  import type { ArtDialogExpose } from '@/components/core/dialogs/art-dialog/types'
  import ArtForm, { type FormItem } from '@/components/core/forms/art-form/index.vue'
  import BusinessWorkspaceHeader, {
    type BusinessWorkspaceMetric
  } from '@/components/business/business-workspace-header/index.vue'
  import BusinessTableWorkspaceActions from '@/components/business/business-table-workspace-actions/index.vue'
  import {
    deleteQuestionCategory,
    deleteQuestions,
    fetchQuestionBankList,
    saveQuestion,
    saveQuestionCategory,
    toggleQuestions,
    type SmisQuestion,
    type SmisQuestionBankOverview,
    type SmisQuestionBankSearchParams,
    type SmisQuestionCategory,
    type SmisQuestionPayload
  } from '@smis/api'

  defineOptions({ name: 'SmisQuestionBankManagement' })
  type TableParams = SmisQuestionBankSearchParams &
    Pick<Api.Common.PaginationParams, 'current' | 'size'>
  const userStore = useUserStore()
  const { getDictMap } = storeToRefs(userStore)
  const { confirmDelete } = useArtFeedback()
  const tableRef = ref<ArtTableQueryExpose>()
  const categoryDialogRef = ref<ArtDialogExpose>()
  const questionDialogRef = ref<ArtDialogExpose>()
  const categoryFormRef = ref<InstanceType<typeof ArtForm>>()
  const questionFormRef = ref<InstanceType<typeof ArtForm>>()
  const submitting = ref(false)
  const searchQuery = ref<SmisQuestionBankSearchParams>({})
  const categories = ref<SmisQuestionCategory[]>([])
  const overview = reactive<SmisQuestionBankOverview>({
    total: 0,
    enabled: 0,
    single: 0,
    multiple: 0,
    judgement: 0
  })
  const categoryForm = reactive({
    id: '',
    categoryName: '',
    status: 'enabled' as 'enabled' | 'disabled',
    sort: 10,
    remark: ''
  })
  const createQuestion = (): SmisQuestionPayload => ({
    categoryId: '',
    questionType: 'single',
    stem: '',
    options: [
      { key: 'A', content: '' },
      { key: 'B', content: '' }
    ],
    correctAnswers: [],
    analysis: '',
    defaultScore: 2,
    status: 'enabled'
  })
  const questionForm = reactive<SmisQuestionPayload>(createQuestion())
  const singleAnswer = computed({
    get: () => questionForm.correctAnswers[0] ?? '',
    set: (value: string) => {
      questionForm.correctAnswers = value ? [value] : []
    }
  })
  const dictOptions = (code: string) =>
    (getDictMap.value[code] ?? []).map((item) => ({
      label: item.label || item.name,
      value: item.value
    }))
  const exportDictLabel = (code: string, value: unknown) =>
    dictOptions(code).find((item) => item.value === String(value))?.label ?? String(value ?? '')
  const categoryOptions = computed(() =>
    categories.value
      .filter((item) => item.status === 'enabled')
      .map((item) => ({ label: item.categoryName, value: item.id }))
  )
  const metrics = computed<BusinessWorkspaceMetric[]>(() => [
    {
      label: '题目总数',
      value: overview.total,
      description: '当前租户题库规模',
      icon: 'ri:questionnaire-line'
    },
    {
      label: '已启用',
      value: overview.enabled,
      description: '可用于组卷',
      icon: 'ri:checkbox-circle-line',
      tone: 'success'
    },
    {
      label: '单选 / 多选',
      value: `${overview.single} / ${overview.multiple}`,
      description: '主要客观题型',
      icon: 'ri:list-check-3'
    },
    {
      label: '判断题',
      value: overview.judgement,
      description: '快速知识校验',
      icon: 'ri:toggle-line'
    }
  ])
  const searchItems = computed<SearchFormItem[]>(() => [
    {
      label: '题目',
      key: 'keyword',
      type: 'input',
      props: { clearable: true, placeholder: '搜索题干或解析' }
    },
    {
      label: '题型',
      key: 'questionType',
      type: 'select',
      props: { options: dictOptions('smisQuestionType'), clearable: true, placeholder: '全部题型' }
    },
    {
      label: '状态',
      key: 'status',
      type: 'select',
      props: {
        options: dictOptions('smisQuestionStatus'),
        clearable: true,
        placeholder: '全部状态'
      }
    }
  ])
  const categoryItems = computed<FormItem[]>(() => [
    {
      label: '分类名称',
      key: 'categoryName',
      type: 'input',
      props: { maxlength: 100, showWordLimit: true }
    },
    {
      label: '启用状态',
      key: 'status',
      type: 'radioGroup',
      options: dictOptions('smisQuestionStatus'),
      props: { optionType: 'button' }
    },
    {
      label: '排序',
      key: 'sort',
      type: 'inputNumber',
      props: { min: 0, max: 9999, class: '!w-full' }
    },
    {
      label: '备注',
      key: 'remark',
      type: 'textarea',
      props: { rows: 3, maxlength: 500, showWordLimit: true }
    }
  ])
  const categoryRules: FormRules = {
    categoryName: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
  }
  const questionItems = computed<FormItem[]>(() => [
    { label: '题目设置', key: 'settingSection', type: 'divider', span: 24 },
    {
      label: '所属分类',
      key: 'categoryId',
      type: 'select',
      props: { options: categoryOptions.value, filterable: true, placeholder: '选择题库分类' }
    },
    {
      label: '题目类型',
      key: 'questionType',
      type: 'radioGroup',
      options: dictOptions('smisQuestionType'),
      props: { optionType: 'button' }
    },
    {
      label: '默认分值',
      key: 'defaultScore',
      type: 'inputNumber',
      props: { min: 0.01, max: 999, precision: 2, class: '!w-full' }
    },
    {
      label: '启用状态',
      key: 'status',
      type: 'radioGroup',
      options: dictOptions('smisQuestionStatus'),
      props: { optionType: 'button' }
    },
    { label: '题目内容', key: 'contentSection', type: 'divider', span: 24 },
    {
      label: '题目内容',
      key: 'stem',
      type: 'textarea',
      span: 24,
      props: { rows: 5, maxlength: 8000, showWordLimit: true }
    },
    { label: '答案与解析', key: 'answerSection', type: 'divider', span: 24 },
    { label: '答案选项与正确答案', key: 'options', span: 24 },
    {
      label: '答案解析',
      key: 'analysis',
      type: 'textarea',
      span: 24,
      props: { rows: 4, maxlength: 8000, showWordLimit: true }
    }
  ])
  const questionRules: FormRules = {
    categoryId: [{ required: true, message: '请选择所属分类', trigger: 'change' }],
    questionType: [{ required: true, message: '请选择题目类型', trigger: 'change' }],
    stem: [{ required: true, message: '请输入题目内容', trigger: 'blur' }]
  }
  watch(
    () => questionForm.questionType,
    (type) => {
      if (type === 'judgement') {
        questionForm.options = [
          { key: 'A', content: '正确' },
          { key: 'B', content: '错误' }
        ]
        questionForm.correctAnswers = []
      }
    }
  )
  const selectCategory = (id?: string) => {
    searchQuery.value.categoryId = id
    void tableRef.value?.refreshUpdate()
  }
  const openCategory = async (row?: SmisQuestionCategory) => {
    Object.assign(categoryForm, {
      id: row?.id ?? '',
      categoryName: row?.categoryName ?? '',
      status: row?.status ?? 'enabled',
      sort: row?.sort ?? 10,
      remark: row?.remark ?? ''
    })
    await categoryDialogRef.value?.handleOpen(undefined, {
      title: row ? '编辑题库分类' : '新增题库分类'
    })
  }
  const submitCategory = async () => {
    try {
      await categoryFormRef.value?.validate()
      submitting.value = true
      await saveQuestionCategory({ ...categoryForm, id: categoryForm.id || undefined })
      await categoryDialogRef.value?.handleClose(true)
      await tableRef.value?.refreshUpdate()
    } catch {
      /* 保留表单 */
    } finally {
      submitting.value = false
    }
  }
  const removeCategory = async (row: SmisQuestionCategory) => {
    try {
      await confirmDelete(`确定删除分类“${row.categoryName}”吗？`)
      await deleteQuestionCategory(row.id)
      if (searchQuery.value.categoryId === row.id) searchQuery.value.categoryId = undefined
      await tableRef.value?.refreshRemove()
    } catch {
      /* 用户取消 */
    }
  }
  const openQuestion = async (row?: SmisQuestion, copy = false) => {
    Object.assign(
      questionForm,
      createQuestion(),
      row
        ? {
            ...row,
            id: copy ? undefined : row.id,
            stem: copy ? `${row.stem}（复制）` : row.stem,
            options: row.options.map((item) => ({ ...item })),
            correctAnswers: [...row.correctAnswers]
          }
        : {}
    )
    await questionDialogRef.value?.handleOpen(undefined, {
      title: copy ? '复制并新增题目' : row ? '编辑题目' : '新增题目',
      contentMaxHeight: '76vh'
    })
  }
  const addOption = () =>
    questionForm.options.push({
      key: String.fromCharCode(65 + questionForm.options.length),
      content: ''
    })
  const removeOption = (index: number) => {
    const removed = questionForm.options[index]?.key
    questionForm.options.splice(index, 1)
    questionForm.options.forEach((item, i) => {
      item.key = String.fromCharCode(65 + i)
    })
    questionForm.correctAnswers = questionForm.correctAnswers.filter((key) => key !== removed)
  }
  const setCorrect = (key: string, checked: boolean) => {
    questionForm.correctAnswers = checked
      ? [...new Set([...questionForm.correctAnswers, key])]
      : questionForm.correctAnswers.filter((item) => item !== key)
  }
  const submitQuestion = async () => {
    try {
      await questionFormRef.value?.validate()
      if (questionForm.options.some((item) => !item.content.trim())) throw new Error('选项不能为空')
      if (!questionForm.correctAnswers.length) throw new Error('请选择正确答案')
      submitting.value = true
      await saveQuestion({
        ...questionForm,
        options: questionForm.options.map((item) => ({ ...item, content: item.content.trim() }))
      })
      await questionDialogRef.value?.handleClose(true)
      await tableRef.value?.refreshUpdate()
    } catch {
      /* 保留表单 */
    } finally {
      submitting.value = false
    }
  }
  const removeQuestion = async (row: SmisQuestion) => {
    try {
      await confirmDelete('确定删除该题目吗？')
      await deleteQuestions([row.id])
      await tableRef.value?.refreshRemove()
    } catch {
      /* 用户取消 */
    }
  }
  const moreActions = (row: SmisQuestion): ButtonMoreItem[] => [
    {
      auth: 'SmisQuestionBankManagement:Add',
      key: 'copy',
      label: '复制并新增',
      icon: 'ri:file-copy-2-line'
    },
    {
      auth: 'SmisQuestionBankManagement:ToggleStatus',
      key: 'toggle',
      label: row.status === 'enabled' ? '停用题目' : '启用题目',
      icon: 'ri:toggle-line'
    },
    {
      auth: 'SmisQuestionBankManagement:Delete',
      key: 'delete',
      label: '删除',
      icon: 'ri:delete-bin-line',
      color: 'var(--el-color-danger)'
    }
  ]
  const columnsFactory = (): ColumnOption<SmisQuestion>[] => [
    { type: 'selection', width: 48 },
    { type: 'globalIndex', label: '序号', width: 68 },
    {
      prop: 'stem',
      label: '题目内容',
      minWidth: 360,
      fixed: 'left',
      formatter: (row) => (
        <div class="question-bank__stem">
          <ArtSvgIcon icon="ri:question-answer-line" />
          <span>
            <strong>{row.stem}</strong>
            <small>{row.categoryName}</small>
          </span>
        </div>
      )
    },
    {
      prop: 'questionType',
      label: '题型',
      width: 100,
      formatter: (row) => (
        <ArtDictDisplay dictCode="smisQuestionType" value={row.questionType} display="tag" />
      )
    },
    {
      prop: 'defaultScore',
      label: '默认分值',
      width: 92,
      align: 'center',
      formatter: (row) => `${row.defaultScore} 分`
    },
    {
      prop: 'options',
      label: '选项数',
      width: 82,
      align: 'center',
      formatter: (row) => `${row.options.length} 项`
    },
    {
      prop: 'status',
      label: '状态',
      width: 88,
      formatter: (row) => (
        <ArtDictDisplay dictCode="smisQuestionStatus" value={row.status} display="tag" />
      )
    },
    { prop: 'updateTime', label: '最近更新', width: 168 },
    {
      prop: 'operation',
      label: '操作',
      width: 124,
      fixed: 'right',
      formatter: (row) => (
        <div class="flex">
          <ArtButtonTable
            type="edit"
            permission="SmisQuestionBankManagement:Edit"
            onClick={() => openQuestion(row)}
          />
          <ArtButtonMore
            list={moreActions(row)}
            onClick={(item: ButtonMoreItem) =>
              item.key === 'copy'
                ? openQuestion(row, true)
                : item.key === 'toggle'
                  ? toggleQuestions(
                      [row.id],
                      row.status === 'enabled' ? 'disabled' : 'enabled'
                    ).then(() => tableRef.value?.refreshUpdate())
                  : removeQuestion(row)
            }
          />
        </div>
      )
    }
  ]
  const headerActions = computed<ArtTableQueryHeaderAction[]>(() => [
    {
      permission: 'SmisQuestionBankManagement:Add',
      type: 'add',
      label: '新增题目',
      onClick: () => openQuestion()
    },
    {
      permission: 'SmisQuestionBankManagement:Delete',
      type: 'delete',
      content: ({ selectedCount }: ArtTableQueryHeaderActionContext) =>
        `确定删除选中的 ${selectedCount} 道题目吗？`,
      onClick: async ({ selectedRows, api }) => {
        await deleteQuestions(selectedRows.map((row) => row.id as string))
        await api.refreshRemove()
      }
    },
    {
      permission: 'SmisQuestionBankManagement:Export',
      type: 'export',
      label: '导出题库',
      exportFilename: '安全培训题库',
      exportSheetName: '题目',
      exportColumns: [
        { key: 'categoryName', title: '题库分类' },
        {
          key: 'questionType',
          title: '题型',
          formatter: (value) => exportDictLabel('smisQuestionType', value)
        },
        { key: 'stem', title: '题目' },
        { key: 'defaultScore', title: '默认分值' },
        {
          key: 'status',
          title: '状态',
          formatter: (value) => exportDictLabel('smisQuestionStatus', value)
        }
      ],
      exportApi: async () => ({
        data: (await fetchQuestionBankList({ ...searchQuery.value, from: 0, to: 4999 })).data
      })
    }
  ])
  const fetchTableData = async (params: TableParams) => {
    const { from, to } = pageInfoHandler({ current: params.current, size: params.size })
    const result = await fetchQuestionBankList({ ...params, from, to })
    categories.value = result.categories
    Object.assign(overview, result.overview)
    return result
  }
  onMounted(async () => {
    await Promise.all(
      ['smisQuestionType', 'smisQuestionStatus'].map((code) => userStore.ensureDictLoaded(code))
    )
  })
</script>

<style scoped lang="scss">
  .question-bank {
    gap: 12px;
    min-width: 0;
  }

  .question-bank__workspace {
    display: grid;
    flex: 1;
    grid-template-columns: 236px minmax(0, 1fr);
    gap: 12px;
    min-height: 0;
  }

  .question-bank__categories {
    display: flex;
    flex-direction: column;
    min-height: 0;
    padding: 14px;

    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 2px 4px 12px;

      div {
        display: grid;
        gap: 2px;
      }

      small {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }
  }

  .question-bank__category-scroll {
    flex: 1;
    min-height: 0;
  }

  .question-bank__category-row {
    position: relative;
    display: flex;
    align-items: center;
    min-width: 0;
    margin-bottom: 4px;
    border-radius: var(--el-border-radius-base);

    &:hover,
    &:focus-within,
    &.is-active {
      color: var(--theme-color);
      background: color-mix(in srgb, var(--theme-color) 9%, transparent);
    }

    &:hover .question-bank__category-actions,
    &:focus-within .question-bank__category-actions {
      display: flex;
    }
  }

  .question-bank__category-select {
    position: relative;
    display: flex;
    flex: 1;
    align-items: center;
    width: 100%;
    min-width: 0;
    min-height: 42px;
    padding: 0 10px;
    margin-bottom: 4px;
    color: var(--el-text-color-regular);
    text-align: left;
    cursor: pointer;
    background: transparent;
    border: 0;
    border-radius: var(--el-border-radius-base);

    span:first-child {
      display: flex;
      gap: 8px;
      align-items: center;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    b {
      margin-left: auto;
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }

    &:hover,
    &:focus-visible,
    &.is-active {
      color: var(--theme-color);
      background: color-mix(in srgb, var(--theme-color) 9%, transparent);
    }

    &:focus-visible {
      outline: 2px solid color-mix(in srgb, var(--theme-color) 38%, transparent);
      outline-offset: -2px;
    }
  }

  .question-bank__category-row .question-bank__category-select {
    padding-right: 66px;
    margin-bottom: 0;
    background: transparent;
  }

  .question-bank__category-actions {
    position: absolute;
    right: 6px;
    display: none;
    align-items: center;
  }

  .question-bank__table {
    min-width: 0;
    min-height: 0;
  }

  :deep(.question-bank__stem) {
    display: grid;
    grid-template-columns: 30px minmax(0, 1fr);
    gap: 10px;
    align-items: center;
    min-width: 0;

    > svg {
      color: var(--theme-color);
    }

    span {
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
      margin-top: 3px;
      color: var(--el-text-color-secondary);
    }
  }

  .question-bank__options {
    display: grid;
    gap: 10px;
  }

  .question-bank__option {
    display: grid;
    grid-template-columns: 62px 40px minmax(0, 1fr) 32px;
    gap: 8px;
    align-items: center;
    padding: 10px;
    background: var(--el-fill-color-lighter);
    border-radius: var(--el-border-radius-base);
  }

  @media (width <= 900px) {
    .question-bank__workspace {
      grid-template-columns: 1fr;
    }

    .question-bank__categories {
      max-height: 210px;
    }
  }
</style>
