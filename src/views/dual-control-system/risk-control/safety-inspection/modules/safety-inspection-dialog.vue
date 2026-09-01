<template>
  <ArtDialog ref="dialogRef" size="lg">
    <div class="safety-inspection-dialog">
      <div class="safety-inspection-dialog__context">
        <span><ArtSvgIcon icon="ri:shield-check-line" /></span>
        <div>
          <strong>形成可追溯的安全检查记录</strong>
          <p>检查类别、组织与员工均引用当前租户主数据；记录同时保留检查时点名称快照。</p>
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
            placeholder="请选择排查类型"
            class="w-full"
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
          <SafetyInspectionOrganizationSelect
            v-model="form.model.inspectionOrganizationId"
            :organizations="options.organizations"
            title="选择检查单位"
            placeholder="点击选择检查单位"
          />
        </template>
        <template #inspectedOrganizationId>
          <SafetyInspectionOrganizationSelect
            v-model="form.model.inspectedOrganizationId"
            :organizations="options.organizations"
            title="选择被检查单位"
            placeholder="点击选择被检查单位"
          />
        </template>
        <template #inspectorIds>
          <SafetyInspectionEmployeeMultipleSelect
            v-model="form.model.inspectorIds"
            v-model:selected-data="inspectorSelection"
            :tenant-id="getUserInfo.tenantId"
          />
        </template>
        <template #planAttachmentUrls>
          <ArtUploadFile
            v-model="form.model.planAttachmentUrls"
            multiple
            :limit="8"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,image/*"
            tip="支持检查计划、表单、图片与压缩包，单个文件不超过 20 MB"
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
  import { useUserStore } from '@/store/modules/user'
  import {
    saveSafetyInspection,
    type SmisSafetyInspectionOrganization,
    type SmisSafetyInspectionPayload,
    type SmisSafetyInspectionRecord,
    type SmisSafetyInspectionTypeOption
  } from '@smis/api'
  import SafetyInspectionOrganizationSelect from './safety-inspection-organization-select.vue'
  import SafetyInspectionEmployeeMultipleSelect from './safety-inspection-employee-multiple-select.vue'

  export interface SafetyInspectionDialogOpenData {
    row?: SmisSafetyInspectionRecord
    inspectionTypes: SmisSafetyInspectionTypeOption[]
    organizations: SmisSafetyInspectionOrganization[]
    presetInspectionTypeId?: string
    presetInspectedOrganizationId?: string
  }
  interface FormExpose {
    validate: () => Promise<boolean>
    clearValidate: () => void
  }

  const emit = defineEmits<{ success: [type: 'add' | 'edit'] }>()
  const userStore = useUserStore()
  const { getUserInfo } = storeToRefs(userStore)
  const dialogRef = ref<ArtDialogExpose<SafetyInspectionDialogOpenData>>()
  const formRef = ref<FormExpose>()
  const inspectorSelection = shallowRef<EmployeeIntegrationItem[]>([])
  const options = reactive({
    inspectionTypes: [] as SmisSafetyInspectionTypeOption[],
    organizations: [] as SmisSafetyInspectionOrganization[]
  })
  const initial = (): SmisSafetyInspectionPayload => ({
    inspectionTypeId: '',
    inspectionName: '',
    inspectionOrganizationId: '',
    inspectedOrganizationId: '',
    inspectionTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    planAttachmentUrls: [],
    inspectorIds: [],
    remark: ''
  })
  const form = reactive<{
    model: SmisSafetyInspectionPayload
    items: FormItem[]
    rules: FormRules<SmisSafetyInspectionPayload>
  }>({
    model: initial(),
    items: [
      { label: '检查信息', key: 'base', type: 'divider', span: 24 },
      { label: '检查名称', key: 'inspectionName', type: 'input', props: { maxlength: 160 } },
      { label: '检查类别', key: 'inspectionTypeId', type: 'text' },
      {
        label: '检查时间',
        key: 'inspectionTime',
        type: 'date',
        props: {
          type: 'datetime',
          valueFormat: 'YYYY-MM-DD HH:mm:ss',
          clearable: true,
          class: '!w-full'
        }
      },
      { label: '检查人员', key: 'people', type: 'divider', span: 24 },
      { label: '检查单位', key: 'inspectionOrganizationId', type: 'text' },
      { label: '被检查单位', key: 'inspectedOrganizationId', type: 'text' },
      { label: '检查人', key: 'inspectorIds', type: 'text', span: 24 },
      { label: '证据材料', key: 'evidence', type: 'divider', span: 24 },
      { label: '检查计划附件', key: 'planAttachmentUrls', type: 'text', span: 24 },
      {
        label: '检查说明',
        key: 'remark',
        type: 'textarea',
        span: 24,
        props: { rows: 4, maxlength: 2000, showWordLimit: true, resize: 'none' }
      }
    ],
    rules: {
      inspectionName: [{ required: true, message: '请输入检查名称', trigger: 'blur' }],
      inspectionTypeId: [{ required: true, message: '请选择检查类别', trigger: 'change' }],
      inspectionOrganizationId: [{ required: true, message: '请选择检查单位', trigger: 'change' }],
      inspectedOrganizationId: [{ required: true, message: '请选择被检查单位', trigger: 'change' }],
      inspectionTime: [{ required: true, message: '请选择检查时间', trigger: 'change' }],
      inspectorIds: [
        {
          type: 'array',
          required: true,
          min: 1,
          message: '请至少选择一名检查人',
          trigger: 'change'
        }
      ]
    }
  })

  const toSelectedEmployees = (row: SmisSafetyInspectionRecord): EmployeeIntegrationItem[] =>
    row.inspectors.map((employee) => ({
      id: employee.id,
      tenantId: employee.tenantId,
      organizationId: employee.organizationId ?? null,
      employeeNo: employee.employeeNo,
      employeeName: employee.employeeName,
      avatarUrl: null,
      jobTitle: employee.jobTitle ?? null,
      employmentStatus: employee.employmentStatus
    }))
  const handleSubmit = async (): Promise<boolean> => {
    try {
      await formRef.value?.validate()
      await saveSafetyInspection({
        ...toRaw(form.model),
        inspectionName: form.model.inspectionName.trim(),
        remark: form.model.remark?.trim() || null,
        planAttachmentUrls: [...form.model.planAttachmentUrls],
        inspectorIds: [...form.model.inspectorIds]
      })
      emit('success', form.model.id ? 'edit' : 'add')
      return true
    } catch {
      return false
    }
  }
  const handleOpen = async (data: SafetyInspectionDialogOpenData): Promise<void> => {
    Object.assign(form.model, initial())
    options.inspectionTypes = data.inspectionTypes
    options.organizations = data.organizations
    inspectorSelection.value = []
    if (data.row) {
      Object.assign(form.model, {
        id: data.row.id,
        inspectionTypeId: data.row.inspectionTypeId,
        inspectionName: data.row.inspectionName,
        inspectionOrganizationId: data.row.inspectionOrganizationId,
        inspectedOrganizationId: data.row.inspectedOrganizationId,
        inspectionTime: dayjs(data.row.inspectionTime).format('YYYY-MM-DD HH:mm:ss'),
        planAttachmentUrls: [...data.row.planAttachmentUrls],
        inspectorIds: data.row.inspectors.map((employee) => employee.id),
        remark: data.row.remark || ''
      })
      inspectorSelection.value = toSelectedEmployees(data.row)
    } else {
      form.model.inspectionTypeId = data.presetInspectionTypeId || ''
      form.model.inspectedOrganizationId = data.presetInspectedOrganizationId || ''
    }
    await nextTick()
    formRef.value?.clearValidate()
    await dialogRef.value?.handleOpen(data, {
      title: data.row ? '编辑安全检查' : '新增安全检查',
      subtitle: '明确检查对象、类别、时间、人员和计划证据',
      confirmText: data.row ? '保存更改' : '创建检查记录',
      contentMaxHeight: 'calc(100vh - 150px)',
      onConfirm: handleSubmit
    })
  }

  defineExpose({ handleOpen })
</script>

<style scoped lang="scss">
  .safety-inspection-dialog {
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
