<template>
  <ArtDialog ref="dialogRef" size="sm">
    <div class="hidden-hazard-task-action">
      <div class="hidden-hazard-task-action__context">
        <span aria-hidden="true"
          ><ArtSvgIcon :icon="mode === 'transfer' ? 'ri:user-shared-line' : 'ri:close-circle-line'"
        /></span>
        <div
          ><strong>{{ row?.taskNo }}</strong
          ><p>{{ row?.inspectionObject }} · {{ row?.sourcePlanName }}</p></div
        >
      </div>
      <ArtForm
        ref="formRef"
        v-model="form.model"
        :items="form.items"
        :rules="form.rules"
        label-position="top"
        :show-reset="false"
        :show-submit="false"
      >
        <template #employeeId>
          <ArtEmployeeSelect
            v-model="form.model.employeeId"
            v-model:selected-data="employeeSelection"
            title="选择任务接收人"
            subtitle="仅显示当前租户在职或试用期员工"
          />
        </template>
      </ArtForm>
    </div>
  </ArtDialog>
</template>

<script setup lang="ts">
  import type { FormRules } from 'element-plus'
  import type { EmployeeIntegrationItem } from '@/api/integration/employees'
  import ArtDialog from '@/components/core/dialogs/art-dialog/index.vue'
  import type { ArtDialogExpose } from '@/components/core/dialogs/art-dialog/types'
  import ArtForm, { type FormItem } from '@/components/core/forms/art-form/index.vue'
  import ArtEmployeeSelect from '@/components/business/art-employee-select/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import {
    cancelHiddenHazardInspectionTask,
    transferHiddenHazardInspectionTask,
    type SmisHiddenHazardInspectionTask
  } from '@smis/api'

  export interface HiddenHazardTaskActionOpenData {
    row: SmisHiddenHazardInspectionTask
    mode: 'cancel' | 'transfer'
  }
  interface ActionForm {
    employeeId?: string
    reason: string
  }
  interface FormExpose {
    validate: () => Promise<boolean>
    clearValidate: () => void
  }

  const emit = defineEmits<{ success: [] }>()
  const dialogRef = ref<ArtDialogExpose<HiddenHazardTaskActionOpenData>>()
  const formRef = ref<FormExpose>()
  const row = shallowRef<SmisHiddenHazardInspectionTask>()
  const mode = ref<'cancel' | 'transfer'>('transfer')
  const employeeSelection = shallowRef<EmployeeIntegrationItem[]>([])
  const form = reactive<{ model: ActionForm; items: FormItem[]; rules: FormRules<ActionForm> }>({
    model: { employeeId: undefined, reason: '' },
    items: [
      {
        label: '转交接收人',
        key: 'employeeId',
        type: 'text',
        span: 24,
        hidden: () => mode.value !== 'transfer'
      },
      {
        label: () => (mode.value === 'transfer' ? '转交原因' : '取消原因'),
        key: 'reason',
        type: 'textarea',
        span: 24,
        props: {
          rows: 4,
          maxlength: 500,
          showWordLimit: true,
          resize: 'none',
          placeholder: '说明业务原因与相关事项'
        }
      }
    ],
    rules: {
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
  })
  const handleSubmit = async (): Promise<boolean> => {
    if (!row.value) return false
    try {
      await formRef.value?.validate()
      if (mode.value === 'transfer')
        await transferHiddenHazardInspectionTask(
          row.value.id,
          form.model.employeeId!,
          form.model.reason.trim()
        )
      else await cancelHiddenHazardInspectionTask(row.value.id, form.model.reason.trim())
      emit('success')
      return true
    } catch {
      return false
    }
  }
  const handleOpen = async (data: HiddenHazardTaskActionOpenData): Promise<void> => {
    row.value = data.row
    mode.value = data.mode
    Object.assign(form.model, { employeeId: undefined, reason: '' })
    employeeSelection.value = []
    await dialogRef.value?.handleOpen(data, {
      title: data.mode === 'transfer' ? '转交隐患排查任务' : '取消隐患排查任务',
      subtitle:
        data.mode === 'transfer'
          ? '转交仅更换执行人，来源计划与审计记录保持不变'
          : '取消后保留任务和全部操作记录',
      confirmText: data.mode === 'transfer' ? '确认转交' : '确认取消任务',
      onConfirm: handleSubmit
    })
    await nextTick()
    formRef.value?.clearValidate()
  }
  defineExpose({ handleOpen })
</script>

<style scoped lang="scss">
  .hidden-hazard-task-action {
    &__context {
      display: grid;
      grid-template-columns: 42px minmax(0, 1fr);
      gap: 12px;
      align-items: center;
      padding: 13px 14px;
      margin-bottom: 18px;
      background: color-mix(in srgb, var(--theme-color) 6%, var(--default-box-color));
      border-left: 3px solid var(--theme-color);
      border-radius: var(--el-border-radius-base);

      > span {
        display: grid;
        place-items: center;
        width: 42px;
        height: 42px;
        color: var(--theme-color);
        background: var(--default-box-color);
        border-radius: var(--el-border-radius-base);
      }

      p {
        margin: 3px 0 0;
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }
  }
</style>
