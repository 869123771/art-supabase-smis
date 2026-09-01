<template>
  <ArtDialog ref="dialogRef" size="sm">
    <div class="task-action-dialog">
      <div class="task-action-dialog__context">
        <span aria-hidden="true"
          ><ArtSvgIcon :icon="mode === 'transfer' ? 'ri:user-shared-line' : 'ri:close-circle-line'"
        /></span>
        <div
          ><strong>{{ row?.taskNo }}</strong
          ><p>{{ row?.riskPointName }} · {{ row?.riskPointNo }}</p></div
        >
      </div>
      <ElForm ref="formRef" :model="form" :rules="rules" label-position="top">
        <ElFormItem v-if="mode === 'transfer'" label="转交接收人" prop="employeeId">
          <ArtEmployeeSelect
            v-model="form.employeeId"
            v-model:selected-data="employeeSelection"
            title="选择任务接收人"
            subtitle="仅显示当前租户在职或试用期员工"
          />
        </ElFormItem>
        <ElFormItem :label="mode === 'transfer' ? '转交原因' : '取消原因'" prop="reason">
          <ElInput
            v-model="form.reason"
            type="textarea"
            :rows="4"
            maxlength="500"
            show-word-limit
            :placeholder="mode === 'transfer' ? '说明转交原因和交接事项' : '说明取消任务的业务原因'"
          />
        </ElFormItem>
      </ElForm>
    </div>
    <template #footer="{ api }">
      <ElButton @click="api.handleClose()">取消</ElButton>
      <ElButton
        :type="mode === 'cancel' ? 'danger' : 'primary'"
        :loading="submitting"
        @click="handleSubmit"
      >
        {{ mode === 'transfer' ? '确认转交' : '确认取消任务' }}
      </ElButton>
    </template>
  </ArtDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import type { EmployeeIntegrationItem } from '@/api/integration/employees'
  import ArtDialog from '@/components/core/dialogs/art-dialog/index.vue'
  import type { ArtDialogExpose } from '@/components/core/dialogs/art-dialog/types'
  import ArtEmployeeSelect from '@/components/business/art-employee-select/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import {
    cancelRiskInspectionTask,
    transferRiskInspectionTask,
    type SmisRiskInspectionTask
  } from '@smis/api'

  export interface TaskActionDialogOpenData {
    row: SmisRiskInspectionTask
    mode: 'cancel' | 'transfer'
  }
  interface ActionForm {
    employeeId?: string
    reason: string
  }
  const emit = defineEmits<{ success: [] }>()
  const dialogRef = ref<ArtDialogExpose<TaskActionDialogOpenData>>()
  const formRef = ref<FormInstance>()
  const row = shallowRef<SmisRiskInspectionTask>()
  const mode = ref<'cancel' | 'transfer'>('transfer')
  const form = reactive<ActionForm>({ employeeId: undefined, reason: '' })
  const employeeSelection = shallowRef<EmployeeIntegrationItem[]>([])
  const submitting = ref(false)
  const rules: FormRules<ActionForm> = {
    employeeId: [
      {
        validator: (_rule, value, callback) =>
          mode.value === 'transfer' && !value
            ? callback(new Error('请选择任务接收人'))
            : callback(),
        trigger: 'change'
      }
    ],
    reason: [{ required: true, message: '请输入业务原因', trigger: 'blur' }]
  }
  const handleSubmit = async (): Promise<void> => {
    if (!row.value || submitting.value) return
    try {
      await formRef.value?.validate()
      submitting.value = true
      if (mode.value === 'transfer')
        await transferRiskInspectionTask(row.value.id, form.employeeId!, form.reason.trim())
      else await cancelRiskInspectionTask(row.value.id, form.reason.trim())
      emit('success')
      dialogRef.value?.handleClose(true)
    } catch {
      /* 表单与响应层统一提示 */
    } finally {
      submitting.value = false
    }
  }
  const handleOpen = async (data: TaskActionDialogOpenData): Promise<void> => {
    row.value = data.row
    mode.value = data.mode
    form.employeeId = undefined
    form.reason = ''
    employeeSelection.value = []
    await dialogRef.value?.handleOpen(data, {
      title: data.mode === 'transfer' ? '转交风险巡查任务' : '取消风险巡查任务',
      subtitle:
        data.mode === 'transfer'
          ? '转交后任务责任人保持不变，实际执行接收人更新'
          : '取消将写入任务事件，保留完整审计轨迹'
    })
    await nextTick()
    formRef.value?.clearValidate()
  }
  defineExpose({ handleOpen })
</script>

<style scoped lang="scss">
  .task-action-dialog__context {
    display: grid;
    grid-template-columns: 42px minmax(0, 1fr);
    gap: 12px;
    align-items: center;
    padding: 13px 14px;
    margin-bottom: 18px;
    background: color-mix(in srgb, var(--theme-color) 6%, var(--default-box-color));
    border-left: 3px solid var(--theme-color);
    border-radius: var(--el-border-radius-base);
  }

  .task-action-dialog__context > span {
    display: grid;
    place-items: center;
    width: 42px;
    height: 42px;
    color: var(--theme-color);
    background: var(--default-box-color);
    border-radius: var(--el-border-radius-base);
  }

  .task-action-dialog__context p {
    margin: 3px 0 0;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
</style>
