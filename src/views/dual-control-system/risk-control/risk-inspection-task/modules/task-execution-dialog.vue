<template>
  <ArtDialog ref="dialogRef" size="xl" :loading="loading" loading-text="正在加载巡查项目…">
    <div v-if="detail" class="task-execution-dialog">
      <div class="task-execution-dialog__context">
        <span aria-hidden="true"><ArtSvgIcon icon="ri:task-line" /></span>
        <div
          ><strong>{{ detail.taskNo }}</strong
          ><p>{{ detail.riskPointName }} · 计划完成 {{ formatDate(detail.plannedEndAt) }}</p></div
        >
        <span class="task-execution-dialog__progress"
          >{{ completedCount }} / {{ detail.items.length }}</span
        >
      </div>

      <ElForm ref="formRef" :model="form" :rules="rules" label-position="top">
        <ArtSectionTitle title="执行信息" subtitle="选择实际执行人并记录现场巡查总结" />
        <div class="task-execution-dialog__grid">
          <ElFormItem label="实际执行人" prop="actualExecutorEmployeeId">
            <ArtEmployeeSelect
              v-model="form.actualExecutorEmployeeId"
              v-model:selected-data="executorSelection"
              title="选择实际执行人"
              subtitle="执行人来自当前租户员工花名册"
            />
          </ElFormItem>
          <ElFormItem label="任务附件">
            <ArtUploadImage
              v-model="form.attachmentUrls"
              multiple
              :limit="8"
              :size="88"
              title="上传现场照片"
            />
          </ElFormItem>
          <ElFormItem class="task-execution-dialog__wide" label="执行总结">
            <ElInput
              v-model="form.executionSummary"
              type="textarea"
              :rows="3"
              maxlength="2000"
              show-word-limit
              placeholder="说明本次巡查总体情况、发现问题和后续建议"
            />
          </ElFormItem>
        </div>

        <ArtSectionTitle
          title="巡查项目"
          :subtitle="`逐项判断正常或异常；提交完成前必须填写全部 ${detail.items.length} 项`"
        />
        <div class="task-execution-dialog__items">
          <article
            v-for="(item, index) in form.items"
            :key="item.id"
            class="task-execution-dialog__item"
            :data-result="item.result"
          >
            <header
              ><span>{{ String(index + 1).padStart(2, '0') }}</span
              ><div
                ><strong>{{ detail.items[index]?.hazardSource || '风险控制措施' }}</strong
                ><small>{{ detail.items[index]?.hazardNo || '历史任务快照' }}</small></div
              ><ElRadioGroup v-model="item.result" size="small"
                ><ElRadioButton value="normal">正常</ElRadioButton
                ><ElRadioButton value="abnormal">异常</ElRadioButton></ElRadioGroup
              ></header
            >
            <p>{{ detail.items[index]?.inspectionContent }}</p>
            <div class="task-execution-dialog__item-fields">
              <ElInput
                v-model="item.remark"
                type="textarea"
                :rows="2"
                maxlength="1000"
                show-word-limit
                placeholder="填写检查说明；异常项请描述问题位置、现象与处置建议"
              />
              <ArtUploadImage
                v-model="item.attachmentUrls"
                multiple
                :limit="4"
                :size="72"
                title="项目照片"
              />
            </div>
          </article>
        </div>
      </ElForm>
    </div>

    <template #footer="{ api }">
      <div class="task-execution-dialog__footer">
        <span>保存进度允许保留未检查项目；提交完成后任务不可再次编辑。</span>
        <div
          ><ElButton @click="api.handleClose()">关闭</ElButton
          ><ElButton :loading="submitting" @click="handleSubmit(false)">保存进度</ElButton
          ><ElButton type="primary" :loading="submitting" @click="handleSubmit(true)"
            >提交并完成</ElButton
          ></div
        >
      </div>
    </template>
  </ArtDialog>
</template>

<script setup lang="ts">
  import dayjs from 'dayjs'
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
  import type { EmployeeIntegrationItem } from '@/api/integration/employees'
  import ArtDialog from '@/components/core/dialogs/art-dialog/index.vue'
  import type { ArtDialogExpose } from '@/components/core/dialogs/art-dialog/types'
  import ArtSectionTitle from '@/components/core/surfaces/art-section-title/index.vue'
  import ArtEmployeeSelect from '@/components/business/art-employee-select/index.vue'
  import ArtUploadImage from '@/components/core/forms/art-upload-image/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import {
    fetchRiskInspectionTaskDetail,
    saveRiskInspectionExecution,
    type SmisRiskInspectionResult,
    type SmisRiskInspectionTask,
    type SmisRiskInspectionTaskDetail
  } from '@smis/api'

  export interface TaskExecutionDialogOpenData {
    row: SmisRiskInspectionTask
  }
  interface ExecutionItem {
    id: string
    result: SmisRiskInspectionResult
    remark: string
    attachmentUrls: string[]
  }
  interface ExecutionForm {
    actualExecutorEmployeeId?: string
    executionSummary: string
    attachmentUrls: string[]
    items: ExecutionItem[]
  }
  const emit = defineEmits<{ success: [] }>()
  const dialogRef = ref<ArtDialogExpose<TaskExecutionDialogOpenData>>()
  const formRef = ref<FormInstance>()
  const detail = shallowRef<SmisRiskInspectionTaskDetail | null>(null)
  const executorSelection = shallowRef<EmployeeIntegrationItem[]>([])
  const loading = ref(false)
  const submitting = ref(false)
  const form = reactive<ExecutionForm>({
    actualExecutorEmployeeId: undefined,
    executionSummary: '',
    attachmentUrls: [],
    items: []
  })
  const rules: FormRules<ExecutionForm> = {
    actualExecutorEmployeeId: [{ required: true, message: '请选择实际执行人', trigger: 'change' }]
  }
  const completedCount = computed(
    () => form.items.filter((item) => item.result !== 'pending').length
  )
  const formatDate = (value: string): string => dayjs(value).format('YYYY-MM-DD HH:mm')
  const toEmployee = (value: SmisRiskInspectionTaskDetail): EmployeeIntegrationItem[] =>
    value.actualExecutorEmployeeId && value.actualExecutorEmployeeName
      ? [
          {
            id: value.actualExecutorEmployeeId,
            tenantId: '',
            employeeNo: value.actualExecutorEmployeeNo || '',
            employeeName: value.actualExecutorEmployeeName,
            employmentStatus: 'active'
          }
        ]
      : []
  const initialize = (value: SmisRiskInspectionTaskDetail): void => {
    form.actualExecutorEmployeeId = value.actualExecutorEmployeeId || value.assigneeEmployeeId
    form.executionSummary = value.executionSummary || ''
    form.attachmentUrls = [...value.attachmentUrls]
    form.items = value.items.map((item) => ({
      id: item.id,
      result: item.result,
      remark: item.remark || '',
      attachmentUrls: [...item.attachmentUrls]
    }))
    executorSelection.value = toEmployee(value)
    if (!executorSelection.value.length)
      executorSelection.value = [
        {
          id: value.assigneeEmployeeId,
          tenantId: '',
          employeeNo: value.assigneeEmployeeNo,
          employeeName: value.assigneeEmployeeName,
          employmentStatus: 'active'
        }
      ]
  }
  const handleSubmit = async (complete: boolean): Promise<void> => {
    if (!detail.value || submitting.value) return
    try {
      await formRef.value?.validate()
      if (complete && form.items.some((item) => item.result === 'pending'))
        return void ElMessage.warning('提交完成前请填写全部巡查项目结果')
      const abnormalWithoutRemark = form.items.some(
        (item) => item.result === 'abnormal' && !item.remark.trim()
      )
      if (complete && abnormalWithoutRemark)
        return void ElMessage.warning('异常项目必须填写问题说明')
      submitting.value = true
      await saveRiskInspectionExecution({
        id: detail.value.id,
        actualExecutorEmployeeId: form.actualExecutorEmployeeId!,
        executionSummary: form.executionSummary.trim() || null,
        attachmentUrls: [...form.attachmentUrls],
        items: form.items.map((item) => ({ ...item, remark: item.remark.trim() || null })),
        complete
      })
      emit('success')
      dialogRef.value?.handleClose(true)
    } catch {
      /* 表单与响应层统一提示 */
    } finally {
      submitting.value = false
    }
  }
  const handleOpen = async (data: TaskExecutionDialogOpenData): Promise<void> => {
    detail.value = null
    executorSelection.value = []
    loading.value = true
    await dialogRef.value?.handleOpen(data, {
      title: '执行风险巡查任务',
      subtitle: `${data.row.taskNo} · ${data.row.riskPointName}`,
      contentMaxHeight: 'calc(100vh - 150px)',
      onOpen: async () => {
        try {
          const value = await fetchRiskInspectionTaskDetail(data.row.id)
          detail.value = value
          if (value) initialize(value)
        } finally {
          loading.value = false
        }
        await nextTick()
        formRef.value?.clearValidate()
      }
    })
  }
  defineExpose({ handleOpen })
</script>

<style scoped lang="scss">
  .task-execution-dialog__context {
    display: grid;
    grid-template-columns: 44px minmax(0, 1fr) auto;
    gap: 12px;
    align-items: center;
    padding: 14px 16px;
    margin-bottom: 18px;
    background: color-mix(in srgb, var(--theme-color) 7%, var(--default-box-color));
    border-left: 3px solid var(--theme-color);
    border-radius: var(--el-border-radius-base);
  }

  .task-execution-dialog__context > span:first-child {
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    color: var(--theme-color);
    background: var(--default-box-color);
    border-radius: var(--el-border-radius-base);
  }

  .task-execution-dialog__context strong {
    font-family: var(--art-font-family-mono, Consolas, monospace);
  }

  .task-execution-dialog__context p {
    margin: 3px 0 0;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .task-execution-dialog__progress {
    padding: 6px 10px;
    font-family: var(--art-font-family-mono, Consolas, monospace);
    color: var(--theme-color);
    background: color-mix(in srgb, var(--theme-color) 9%, var(--el-bg-color));
    border-radius: 999px;
  }

  .task-execution-dialog__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0 24px;
    margin: 12px 0 20px;
  }

  .task-execution-dialog__wide {
    grid-column: 1 / -1;
  }

  .task-execution-dialog__items {
    display: grid;
    gap: 12px;
    margin-top: 12px;
  }

  .task-execution-dialog__item {
    padding: 16px;
    background: var(--default-box-color);
    border: 1px solid var(--el-border-color-lighter);
    border-left: 3px solid var(--el-border-color);
    border-radius: var(--el-border-radius-base);
  }

  .task-execution-dialog__item[data-result='normal'] {
    border-left-color: var(--el-color-success);
  }

  .task-execution-dialog__item[data-result='abnormal'] {
    border-left-color: var(--el-color-danger);
  }

  .task-execution-dialog__item header {
    display: grid;
    grid-template-columns: 34px minmax(0, 1fr) auto;
    gap: 10px;
    align-items: center;
  }

  .task-execution-dialog__item header > span {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    font-family: var(--art-font-family-mono, Consolas, monospace);
    color: var(--theme-color);
    background: color-mix(in srgb, var(--theme-color) 8%, var(--el-bg-color));
    border-radius: var(--el-border-radius-base);
  }

  .task-execution-dialog__item header strong,
  .task-execution-dialog__item header small {
    display: block;
  }

  .task-execution-dialog__item header small {
    margin-top: 2px;
    font-size: 11px;
    color: var(--el-text-color-secondary);
  }

  .task-execution-dialog__item > p {
    margin: 12px 0;
    line-height: 1.6;
  }

  .task-execution-dialog__item-fields {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 250px;
    gap: 16px;
    align-items: start;
  }

  .task-execution-dialog__footer {
    display: flex;
    gap: 16px;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  .task-execution-dialog__footer > span {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  @media (width <= 760px) {
    .task-execution-dialog__grid,
    .task-execution-dialog__item-fields {
      grid-template-columns: minmax(0, 1fr);
    }

    .task-execution-dialog__wide {
      grid-column: auto;
    }

    .task-execution-dialog__item header {
      grid-template-columns: 34px minmax(0, 1fr);
    }

    .task-execution-dialog__item header .el-radio-group {
      grid-column: 1 / -1;
    }

    .task-execution-dialog__footer {
      flex-direction: column;
      align-items: flex-end;
    }
  }
</style>
