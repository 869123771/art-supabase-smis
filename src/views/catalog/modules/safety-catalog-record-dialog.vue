<template>
  <ArtDialog ref="dialogRef" size="lg">
    <ArtForm
      ref="formRef"
      v-model="formData"
      :items="formItems"
      :rules="formRules"
      :span="12"
      :gutter="20"
      label-width="118px"
      :show-reset="false"
      :show-submit="false"
    />
  </ArtDialog>
</template>

<script setup lang="ts">
  import type { FormRules } from 'element-plus'
  import ArtDialog from '@/components/core/dialogs/art-dialog/index.vue'
  import type { ArtDialogExpose } from '@/components/core/dialogs/art-dialog/types'
  import ArtForm, {
    type FormItem,
    type FormItemOption
  } from '@/components/core/forms/art-form/index.vue'
  import { fetchEmployeeSelectorList } from '@/api/integration/employees'
  import { saveSafetyCatalogRecord, type SafetyCatalogRecord } from '@smis/api'
  import type {
    SafetyFieldDefinition,
    SafetyModuleDefinition
  } from '@smis/domain/safety-module-catalog'

  defineOptions({ name: 'SmisSafetyCatalogRecordDialog' })

  interface DialogFormExpose {
    validate: () => Promise<boolean>
    clearValidate: () => void
  }

  interface OpenData {
    workspace: SafetyModuleDefinition
    record?: SafetyCatalogRecord
  }

  const emit = defineEmits<{ (event: 'success', type: 'add' | 'edit'): void }>()
  const dialogRef = ref<ArtDialogExpose<OpenData>>()
  const formRef = ref<DialogFormExpose>()
  const currentWorkspace = shallowRef<SafetyModuleDefinition>()
  const editingRecord = shallowRef<SafetyCatalogRecord>()
  const employeeOptions = ref<FormItemOption[]>([])
  const formData = reactive<Record<string, unknown>>({})

  const formRules = computed<FormRules>(() =>
    Object.fromEntries(
      (currentWorkspace.value?.fields ?? [])
        .filter((item) => item.required)
        .map((item) => [
          item.key,
          [
            {
              required: true,
              message: `${item.type === 'select' || item.type === 'employee' ? '请选择' : '请输入'}${item.label}`,
              trigger: item.type === 'select' || item.type === 'employee' ? 'change' : 'blur'
            }
          ]
        ])
    )
  )

  const toFormItem = (item: SafetyFieldDefinition): FormItem => {
    const common = {
      key: item.key,
      label: item.label,
      span: item.type === 'textarea' ? 24 : 12,
      placeholder:
        item.placeholder ||
        `${['select', 'employee', 'date', 'datetime'].includes(item.type) ? '请选择' : '请输入'}${item.label}`
    }

    if (item.type === 'textarea') {
      return {
        ...common,
        type: 'input',
        props: { type: 'textarea', rows: 4, maxlength: 1000, showWordLimit: true }
      }
    }
    if (item.type === 'number') {
      return {
        ...common,
        type: 'number',
        props: { min: 0, precision: 0, controlsPosition: 'right' }
      }
    }
    if (item.type === 'date' || item.type === 'datetime') {
      return {
        ...common,
        type: 'date',
        props: {
          type: item.type === 'datetime' ? 'datetime' : 'date',
          valueFormat: item.type === 'datetime' ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD'
        }
      }
    }
    if (item.type === 'employee') {
      return {
        ...common,
        type: 'select',
        options: employeeOptions.value,
        props: { clearable: true, filterable: true }
      }
    }
    if (item.type === 'select') {
      return {
        ...common,
        type: 'select',
        options: item.options ?? [],
        props: { clearable: true, filterable: true }
      }
    }
    return { ...common, type: 'input', props: { maxlength: 200 } }
  }

  const formItems = computed<FormItem[]>(() => [
    {
      key: 'businessFields',
      label: currentWorkspace.value?.recordNoun ?? '业务信息',
      type: 'divider',
      span: 24
    },
    ...(currentWorkspace.value?.fields ?? []).map(toFormItem)
  ])

  const replaceForm = (next: Record<string, unknown>): void => {
    Object.keys(formData).forEach((key) => delete formData[key])
    Object.assign(formData, next)
  }

  const createInitialForm = (
    workspace: SafetyModuleDefinition,
    record?: SafetyCatalogRecord
  ): Record<string, unknown> =>
    Object.fromEntries(
      workspace.fields.map((item) => [
        item.key,
        record?.payload?.[item.key] ?? (item.key === 'status' ? '有效' : undefined)
      ])
    )

  const loadEmployeeOptions = async (): Promise<void> => {
    if (!currentWorkspace.value?.fields.some((item) => item.type === 'employee')) return
    const result = await fetchEmployeeSelectorList({ keyword: '', from: 0, to: 199 })
    employeeOptions.value = (result.data ?? []).map((employee) => ({
      label: `${employee.employeeName}（${employee.employeeNo}）`,
      value: `${employee.employeeName}（${employee.employeeNo}）`,
      description: [employee.organization?.organizationName, employee.jobTitle]
        .filter(Boolean)
        .join(' / ')
    }))
  }

  const firstValue = (keys: string[], fallback: string): string => {
    for (const key of keys) {
      const value = formData[key]
      if (typeof value === 'string' && value.trim()) return value.trim()
      if (typeof value === 'number') return String(value)
    }
    return fallback
  }

  const normalizeRecordStatus = (value: string): string =>
    ({
      草稿: 'draft',
      待审核: 'pending',
      审批中: 'pending',
      有效: 'active',
      启用: 'active',
      合格: 'active',
      已批准: 'active',
      已完成: 'completed',
      已关闭: 'completed',
      停用: 'disabled',
      已停用: 'disabled',
      已作废: 'disabled',
      不合格: 'pending',
      限期整改: 'pending'
    })[value] ?? value

  const handleSubmit = async (): Promise<boolean> => {
    try {
      if (!(await formRef.value?.validate())) return false
      const workspace = currentWorkspace.value
      if (!workspace) return false
      const generatedNo = `${workspace.code.toUpperCase()}-${Date.now().toString().slice(-8)}`
      const type = editingRecord.value?.id ? 'edit' : 'add'
      await saveSafetyCatalogRecord({
        id: editingRecord.value?.id,
        moduleCode: workspace.code,
        recordNo: firstValue(
          ['recordNo', 'certificateNo', 'standardNo', 'applicationNo', 'code'],
          generatedNo
        ),
        title: firstValue(
          ['name', 'subjectName', 'employeeName', 'title', 'reportPeriod'],
          workspace.title
        ),
        status: normalizeRecordStatus(firstValue(['status', 'result'], 'active')),
        ownerName: firstValue(
          ['responsiblePerson', 'ownerName', 'employeeName', 'applicantName'],
          ''
        ),
        businessDate: firstValue(
          ['businessDate', 'effectiveDate', 'inspectionDate', 'occurredAt', 'startDate'],
          ''
        ),
        payload: structuredClone(toRaw(formData))
      })
      emit('success', type)
      return true
    } catch {
      return false
    }
  }

  const handleOpen = async (data: OpenData): Promise<void> => {
    currentWorkspace.value = data.workspace
    editingRecord.value = data.record
    replaceForm(createInitialForm(data.workspace, data.record))
    await loadEmployeeOptions()
    await nextTick()
    formRef.value?.clearValidate()
    await dialogRef.value?.handleOpen(data, {
      title: `${data.record?.id ? '编辑' : '新增'}${data.workspace.recordNoun}`,
      subtitle: data.workspace.description,
      contentMaxHeight: '72vh',
      confirmText: '保存记录',
      onConfirm: handleSubmit,
      onReset: () => replaceForm(createInitialForm(data.workspace, data.record))
    })
  }

  defineExpose({ handleOpen, handleClose: () => dialogRef.value?.handleClose() })
</script>
