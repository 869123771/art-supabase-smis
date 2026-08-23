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
    <SafetyDetailLinesEditor
      v-if="detailSchema"
      :model-value="detailRows"
      :schema="detailSchema"
      @update:model-value="handleDetailRowsChange"
    />
    <SmisAttachmentEvidence
      v-if="currentWorkspace?.capabilities.includes('attachments')"
      :model-value="attachments"
      title="业务附件与现场证据"
      description="支持文档截图中的证书、检验报告、现场照片和审批附件；文件进入平台统一资源库。"
      @update:model-value="handleAttachmentsChange"
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
  import { getSafetyModuleDetailSchema } from '@smis/domain/safety-module-detail-schema'
  import SmisAttachmentEvidence from '../../components/smis-attachment-evidence.vue'
  import SafetyDetailLinesEditor from './safety-detail-lines-editor.vue'

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
  type Attachment = Api.Smis.InspectionControl.AttachmentRef
  const attachments = computed<Attachment[]>(() => {
    const value = formData.attachments
    return Array.isArray(value) ? (value as Attachment[]) : []
  })
  type DetailRow = Record<string, unknown> & { _key: string }
  const detailSchema = computed(() =>
    currentWorkspace.value ? getSafetyModuleDetailSchema(currentWorkspace.value.code) : undefined
  )
  const detailRows = computed<DetailRow[]>(() => {
    const value = formData.detailRows
    return Array.isArray(value) ? (value as DetailRow[]) : []
  })

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
  ): Record<string, unknown> => {
    const rawDetailRows = record?.payload?.detailRows
    const initialDetailRows = Array.isArray(rawDetailRows)
      ? structuredClone(rawDetailRows).map((row: Record<string, unknown>, index: number) => ({
          ...row,
          _key: String(row._key || `${Date.now()}-${index}`)
        }))
      : []

    return Object.assign(
      Object.fromEntries(
        workspace.fields.map((item) => [
          item.key,
          record?.payload?.[item.key] ??
            (item.key === 'status'
              ? workspace.code === 'exam-management'
                ? '未开始'
                : workspace.capabilities.includes('approval')
                  ? '草稿'
                  : '有效'
              : undefined)
        ])
      ),
      workspace.capabilities.includes('attachments')
        ? { attachments: structuredClone(record?.payload?.attachments ?? []) }
        : {},
      getSafetyModuleDetailSchema(workspace.code) ? { detailRows: initialDetailRows } : {}
    )
  }

  const handleAttachmentsChange = (value: Attachment[]): void => {
    formData.attachments = value
  }

  const handleDetailRowsChange = (value: DetailRow[]): void => {
    formData.detailRows = value
  }

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

  const normalizeRecordStatus = (value: string): string => {
    const explicit = {
      草稿: 'draft',
      未开始: 'draft',
      待审核: 'pending',
      待审批: 'pending',
      审批中: 'pending',
      有效: 'active',
      启用: 'active',
      合格: 'active',
      已批准: 'active',
      进行中: 'active',
      已发布: 'active',
      已完成: 'completed',
      已关闭: 'completed',
      已结束: 'completed',
      已发布成绩: 'completed',
      停用: 'disabled',
      已停用: 'disabled',
      已作废: 'disabled',
      已下架: 'disabled',
      不合格: 'pending',
      限期整改: 'pending'
    }[value]
    if (explicit) return explicit
    if (/草稿|未开始/.test(value)) return 'draft'
    if (/待|审批|处理中|整改中|核实中/.test(value)) return 'pending'
    if (/完成|关闭|结束|办结|归还|成绩/.test(value)) return 'completed'
    if (/停|作废|下架|无效|取消/.test(value)) return 'disabled'
    return 'active'
  }

  const handleSubmit = async (): Promise<boolean> => {
    try {
      if (!(await formRef.value?.validate())) return false
      const workspace = currentWorkspace.value
      if (!workspace) return false
      const generatedNo = `${workspace.code.toUpperCase()}-${Date.now().toString().slice(-8)}`
      const type = editingRecord.value?.id ? 'edit' : 'add'
      const normalizedPayload = structuredClone(toRaw(formData))
      if (Array.isArray(normalizedPayload.detailRows)) {
        normalizedPayload.detailRows = normalizedPayload.detailRows.map((row) => {
          if (!row || typeof row !== 'object') return row
          return Object.fromEntries(
            Object.entries(row as Record<string, unknown>).filter(([key]) => key !== '_key')
          )
        })
      }
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
        status:
          editingRecord.value?.status ??
          normalizeRecordStatus(firstValue(['status', 'result'], 'active')),
        ownerName: firstValue(
          ['responsiblePerson', 'ownerName', 'employeeName', 'applicantName'],
          ''
        ),
        businessDate: firstValue(
          ['businessDate', 'effectiveDate', 'inspectionDate', 'occurredAt', 'startDate'],
          ''
        ),
        payload: normalizedPayload
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
