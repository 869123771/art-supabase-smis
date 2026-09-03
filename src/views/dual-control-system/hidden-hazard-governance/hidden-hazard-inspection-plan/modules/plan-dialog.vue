<template>
  <ArtDialog ref="dialogRef" size="xl" :loading="loading" loading-text="正在加载计划详情…">
    <div class="hidden-hazard-plan-dialog">
      <div class="hidden-hazard-plan-dialog__context">
        <span aria-hidden="true"><ArtSvgIcon icon="ri:calendar-check-line" /></span>
        <div>
          <strong>建立可自动派发的隐患排查计划</strong>
          <p>提醒时间与提醒方式不在此维护；后续统一由消息提醒场景配置负责。</p>
        </div>
      </div>
      <ArtForm
        ref="formRef"
        v-model="form.model"
        :items="form.items"
        :rules="form.rules"
        :span="12"
        :gutter="24"
        label-position="top"
        :show-reset="false"
        :show-submit="false"
      >
        <template #inspectionTypeId>
          <ElSelect
            v-model="form.model.inspectionTypeId"
            filterable
            class="w-full"
            placeholder="请选择排查类型"
          >
            <ElOption
              v-for="item in options.inspectionTypes"
              :key="item.id"
              :label="`${item.typeName} · ${item.typeCode}`"
              :value="item.id"
            />
          </ElSelect>
        </template>
        <template #inspectionOrganizationId>
          <OrganizationTreeSelect
            v-model="form.model.inspectionOrganizationId"
            :organizations="options.organizations"
            title="选择检查单位"
            placeholder="点击选择检查单位"
          />
        </template>
        <template #inspectedOrganizationId>
          <OrganizationTreeSelect
            v-model="form.model.inspectedOrganizationId"
            :organizations="options.organizations"
            title="选择被检查单位"
            placeholder="点击选择被检查单位"
          />
        </template>
        <template #executorEmployeeId>
          <ArtEmployeeSelect
            v-model="form.model.executorEmployeeId"
            v-model:selected-data="executorSelection"
            title="选择执行人"
            subtitle="执行人来自当前租户员工花名册"
          />
        </template>
        <template #taskDeadlineValue>
          <ElInputNumber
            v-model="form.model.taskDeadlineValue"
            :min="1"
            :max="9999"
            controls-position="right"
            class="w-full"
          />
        </template>
        <template #taskDeadlineUnit>
          <ElSelect v-model="form.model.taskDeadlineUnit" class="w-full">
            <ElOption
              v-for="item in deadlineOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </ElSelect>
        </template>
        <template #cycleType>
          <ElSelect v-model="form.model.cycleType" class="w-full">
            <ElOption
              v-for="item in cycleOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </ElSelect>
        </template>
        <template #cycleInterval>
          <ElInputNumber
            v-model="form.model.cycleInterval"
            :min="1"
            :max="365"
            controls-position="right"
            class="w-full"
            :disabled="form.model.cycleType === 'once'"
          />
        </template>
        <template #inspectionItemIds>
          <InspectionItemMultipleSelect
            v-model="form.model.inspectionItemIds"
            v-model:selected-data="itemSelection"
          />
        </template>
        <template #attachmentUrls>
          <ArtUploadFile
            v-model="form.model.attachmentUrls"
            multiple
            :limit="8"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,image/*"
            tip="支持计划文件、表单与图片，单个文件不超过 20 MB"
          />
        </template>
      </ArtForm>
    </div>
  </ArtDialog>
</template>

<script setup lang="ts">
  import dayjs from 'dayjs'
  import type { FormRules } from 'element-plus'
  import type { EmployeeIntegrationItem } from '@/api/integration/employees'
  import ArtDialog from '@/components/core/dialogs/art-dialog/index.vue'
  import type { ArtDialogExpose } from '@/components/core/dialogs/art-dialog/types'
  import ArtForm, { type FormItem } from '@/components/core/forms/art-form/index.vue'
  import ArtUploadFile from '@/components/core/forms/art-upload-file/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import ArtEmployeeSelect from '@/components/business/art-employee-select/index.vue'
  import {
    fetchHiddenHazardInspectionPlanDetail,
    saveHiddenHazardInspectionPlan,
    type SmisHiddenHazardInspectionPlan,
    type SmisHiddenHazardInspectionPlanPayload,
    type SmisHiddenHazardPlanOptions,
    type SmisInspectionItem
  } from '@smis/api'
  import OrganizationTreeSelect from '@smis/views/dual-control-system/shared/organization-tree-select.vue'
  import InspectionItemMultipleSelect from './inspection-item-multiple-select.vue'

  export interface HiddenHazardPlanDialogOpenData {
    row?: SmisHiddenHazardInspectionPlan
    options: SmisHiddenHazardPlanOptions
    presetInspectionTypeId?: string
  }
  interface FormExpose {
    validate: () => Promise<boolean>
    clearValidate: () => void
  }

  const emit = defineEmits<{ success: [type: 'add' | 'edit'] }>()
  const dialogRef = ref<ArtDialogExpose<HiddenHazardPlanDialogOpenData>>()
  const formRef = ref<FormExpose>()
  const loading = ref(false)
  const executorSelection = shallowRef<EmployeeIntegrationItem[]>([])
  const itemSelection = shallowRef<SmisInspectionItem[]>([])
  const options = reactive<SmisHiddenHazardPlanOptions>({ inspectionTypes: [], organizations: [] })
  const deadlineOptions = [
    { label: '分钟', value: 'minute' },
    { label: '小时', value: 'hour' },
    { label: '天', value: 'day' }
  ] as const
  const cycleOptions = [
    { label: '不循环', value: 'once' },
    { label: '按天', value: 'day' },
    { label: '按周', value: 'week' },
    { label: '按月', value: 'month' }
  ] as const
  const initial = (): SmisHiddenHazardInspectionPlanPayload => ({
    planName: '',
    inspectionTypeId: '',
    inspectionOrganizationId: '',
    inspectedOrganizationId: '',
    executorEmployeeId: '',
    plannedStartAt: dayjs().add(1, 'hour').startOf('hour').format('YYYY-MM-DD HH:mm:ss'),
    plannedEndAt: dayjs().add(30, 'day').endOf('day').format('YYYY-MM-DD HH:mm:ss'),
    taskDeadlineValue: 1,
    taskDeadlineUnit: 'day',
    cycleType: 'once',
    cycleInterval: 1,
    attachmentUrls: [],
    inspectionDescription: '',
    status: 'enabled',
    inspectionItemIds: []
  })
  const form = reactive<{
    model: SmisHiddenHazardInspectionPlanPayload
    items: FormItem[]
    rules: FormRules<SmisHiddenHazardInspectionPlanPayload>
  }>({
    model: initial(),
    items: [
      { label: '计划基础信息', key: 'base', type: 'divider', span: 24 },
      {
        label: '计划名称',
        key: 'planName',
        type: 'input',
        props: { maxlength: 160, placeholder: '例如：生产区域月度隐患排查计划' }
      },
      { label: '排查类型', key: 'inspectionTypeId', type: 'text' },
      {
        label: '计划开始时间',
        key: 'plannedStartAt',
        type: 'date',
        props: { type: 'datetime', valueFormat: 'YYYY-MM-DD HH:mm:ss', class: '!w-full' }
      },
      {
        label: '计划结束时间',
        key: 'plannedEndAt',
        type: 'date',
        props: { type: 'datetime', valueFormat: 'YYYY-MM-DD HH:mm:ss', class: '!w-full' }
      },
      { label: '检查单位', key: 'inspectionOrganizationId', type: 'text' },
      { label: '被检查单位', key: 'inspectedOrganizationId', type: 'text' },
      { label: '执行与周期', key: 'execution', type: 'divider', span: 24 },
      { label: '执行人', key: 'executorEmployeeId', type: 'text', span: 24 },
      { label: '任务时限', key: 'taskDeadlineValue', type: 'text' },
      { label: '时限单位', key: 'taskDeadlineUnit', type: 'text' },
      { label: '循环周期', key: 'cycleType', type: 'text' },
      { label: '循环间隔', key: 'cycleInterval', type: 'text' },
      {
        label: '计划状态',
        key: 'status',
        type: 'select',
        props: {
          options: [
            { label: '启用', value: 'enabled' },
            { label: '禁用', value: 'disabled' }
          ]
        }
      },
      {
        label: '排查说明',
        key: 'inspectionDescription',
        type: 'textarea',
        span: 24,
        props: { rows: 3, maxlength: 2000, showWordLimit: true, resize: 'none' }
      },
      { label: '排查明细', key: 'details', type: 'divider', span: 24 },
      { label: '排查标准', key: 'inspectionItemIds', type: 'text', span: 24 },
      { label: '检查计划附件', key: 'attachmentUrls', type: 'text', span: 24 }
    ],
    rules: {
      planName: [{ required: true, message: '请输入计划名称', trigger: 'blur' }],
      inspectionTypeId: [{ required: true, message: '请选择排查类型', trigger: 'change' }],
      inspectionOrganizationId: [{ required: true, message: '请选择检查单位', trigger: 'change' }],
      inspectedOrganizationId: [{ required: true, message: '请选择被检查单位', trigger: 'change' }],
      executorEmployeeId: [{ required: true, message: '请选择执行人', trigger: 'change' }],
      plannedStartAt: [{ required: true, message: '请选择计划开始时间', trigger: 'change' }],
      plannedEndAt: [{ required: true, message: '请选择计划结束时间', trigger: 'change' }],
      inspectionItemIds: [
        {
          type: 'array',
          required: true,
          min: 1,
          message: '请至少选择一条排查标准',
          trigger: 'change'
        }
      ]
    }
  })

  const initializeEdit = async (id: string): Promise<void> => {
    const detail = await fetchHiddenHazardInspectionPlanDetail(id)
    if (!detail) return
    Object.assign(form.model, {
      id: detail.id,
      planName: detail.planName,
      inspectionTypeId: detail.inspectionTypeId,
      inspectionOrganizationId: detail.inspectionOrganizationId,
      inspectedOrganizationId: detail.inspectedOrganizationId,
      executorEmployeeId: detail.executorEmployeeId,
      plannedStartAt: dayjs(detail.plannedStartAt).format('YYYY-MM-DD HH:mm:ss'),
      plannedEndAt: dayjs(detail.plannedEndAt).format('YYYY-MM-DD HH:mm:ss'),
      taskDeadlineValue: detail.taskDeadlineValue,
      taskDeadlineUnit: detail.taskDeadlineUnit,
      cycleType: detail.cycleType,
      cycleInterval: detail.cycleInterval,
      attachmentUrls: [...detail.attachmentUrls],
      inspectionDescription: detail.inspectionDescription || '',
      status: detail.status === 'voided' ? 'disabled' : detail.status,
      inspectionItemIds: detail.items.flatMap((item) => item.inspectionItemId ?? [])
    })
    executorSelection.value = [
      {
        id: detail.executorEmployeeId,
        tenantId: '',
        employeeNo: detail.executorEmployeeNo,
        employeeName: detail.executorEmployeeName,
        employmentStatus: 'active'
      }
    ]
    itemSelection.value = detail.items.flatMap((item) =>
      item.inspectionItemId
        ? [
            {
              id: item.inspectionItemId,
              tenantId: '',
              standardId: '',
              itemCode: item.itemCode,
              inspectionContent: item.inspectionContent,
              sort: item.sort,
              tagStyle: '',
              status: 'enabled' as const,
              createTime: '',
              updateTime: '',
              standard: { id: '', standardCode: item.standardCode, standardName: item.standardName }
            }
          ]
        : []
    )
  }
  const handleSubmit = async (): Promise<boolean> => {
    try {
      await formRef.value?.validate()
      if (dayjs(form.model.plannedEndAt).isBefore(dayjs(form.model.plannedStartAt))) {
        ElMessage.warning('计划结束时间不能早于开始时间')
        return false
      }
      await saveHiddenHazardInspectionPlan({
        ...toRaw(form.model),
        planName: form.model.planName.trim(),
        inspectionDescription: form.model.inspectionDescription?.trim() || null,
        attachmentUrls: [...form.model.attachmentUrls],
        inspectionItemIds: [...form.model.inspectionItemIds]
      })
      emit('success', form.model.id ? 'edit' : 'add')
      return true
    } catch {
      return false
    }
  }
  const handleOpen = async (data: HiddenHazardPlanDialogOpenData): Promise<void> => {
    Object.assign(form.model, initial())
    executorSelection.value = []
    itemSelection.value = []
    Object.assign(options, data.options)
    form.model.inspectionTypeId = data.presetInspectionTypeId || ''
    loading.value = Boolean(data.row)
    await dialogRef.value?.handleOpen(data, {
      title: data.row ? '编辑隐患排查计划' : '新增隐患排查计划',
      subtitle: data.row
        ? `${data.row.planNo} · ${data.row.planName}`
        : '配置对象、周期、执行人和排查标准',
      confirmText: data.row ? '保存更改' : '创建排查计划',
      contentMaxHeight: 'calc(100vh - 150px)',
      onConfirm: handleSubmit,
      onOpen: async () => {
        try {
          if (data.row) await initializeEdit(data.row.id)
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
  .hidden-hazard-plan-dialog {
    &__context {
      display: grid;
      grid-template-columns: 44px minmax(0, 1fr);
      gap: var(--art-space-3);
      align-items: center;
      padding: var(--art-space-3) var(--art-space-4);
      margin-bottom: var(--art-space-4);
      background: color-mix(in srgb, var(--theme-color) 7%, var(--default-box-color));
      border-left: 3px solid var(--theme-color);
      border-radius: var(--el-border-radius-base);

      > span {
        display: grid;
        place-items: center;
        width: 44px;
        height: 44px;
        color: var(--theme-color);
        background: var(--default-box-color);
        border-radius: var(--el-border-radius-base);
      }

      p {
        margin: 3px 0 0;
        font-size: var(--art-font-size-caption);
        color: var(--el-text-color-secondary);
      }
    }
  }
</style>
