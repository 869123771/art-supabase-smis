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
      description="集中归档证书、检验报告、现场照片和审批附件，文件进入平台统一资源库。"
      @update:model-value="handleAttachmentsChange"
    />
  </ArtDialog>
</template>

<script setup lang="ts">
  import type { FormRules } from 'element-plus'
  import { storeToRefs } from 'pinia'
  import { cloneDeep } from 'lodash-es'
  import ArtDialog from '@/components/core/dialogs/art-dialog/index.vue'
  import type { ArtDialogExpose } from '@/components/core/dialogs/art-dialog/types'
  import ArtForm, { type FormItem } from '@/components/core/forms/art-form/index.vue'
  import ArtUploadImage from '@/components/core/forms/art-upload-image/index.vue'
  import type {
    DataSelectFetchParams,
    DataSelectRecord
  } from '@/components/core/forms/art-data-select/types'
  import { useUserStore } from '@/store/modules/user'
  import { pageInfoHandler } from '@/utils/table/tableUtils'
  import {
    fetchSafetyCatalogRecords,
    fetchSmisEmployeeReferences,
    fetchSmisSupplierReferences,
    saveSafetyCatalogRecord,
    type SafetyCatalogRecord
  } from '@smis/api'
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
    reloadOptions: (key?: string) => Promise<unknown>
  }

  interface OpenData {
    workspace: SafetyModuleDefinition
    record?: SafetyCatalogRecord
  }

  const emit = defineEmits<{ (event: 'success', type: 'add' | 'edit'): void }>()
  const dialogRef = ref<ArtDialogExpose<OpenData>>()
  const formRef = ref<DialogFormExpose>()
  const { getDictMap } = storeToRefs(useUserStore())
  const currentWorkspace = shallowRef<SafetyModuleDefinition>()
  const editingRecord = shallowRef<SafetyCatalogRecord>()
  const formData = reactive<Record<string, unknown>>({})
  const catalogReferenceRows = new Map<string, SafetyCatalogRecord[]>()
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
              message: `${isChoiceField(item) ? '请选择' : '请输入'}${item.label}`,
              trigger: isChoiceField(item) ? 'change' : 'blur'
            }
          ]
        ])
    )
  )

  const isChoiceField = (item: SafetyFieldDefinition): boolean =>
    [
      'select',
      'multi-select',
      'employee',
      'catalog-reference',
      'equipment-reference',
      'supplier-reference',
      'date',
      'datetime'
    ].includes(item.type)

  const pageRange = (params: DataSelectFetchParams) =>
    pageInfoHandler({ current: params.page, size: params.pageSize })

  type CatalogTreeRecord = SafetyCatalogRecord & {
    children?: CatalogTreeRecord[]
    disabled?: boolean
  }

  const buildCatalogTree = (rows: SafetyCatalogRecord[]): CatalogTreeRecord[] => {
    const nodes = new Map<string, CatalogTreeRecord>()
    rows.forEach((row) =>
      nodes.set(row.id || row.recordNo, {
        ...row,
        disabled: row.id === editingRecord.value?.id
      })
    )
    const roots: CatalogTreeRecord[] = []
    rows.forEach((row) => {
      const node = nodes.get(row.id || row.recordNo)!
      const parentId = String(row.payload?.parentId || '')
      const parentName = String(row.payload?.parentName || '')
      const parent = parentId
        ? rows.find((candidate) => candidate.id === parentId)
        : rows.find((candidate) => candidate.title === parentName)
      const parentNode = parent ? nodes.get(parent.id || parent.recordNo) : undefined
      if (parentNode) {
        parentNode.children ??= []
        parentNode.children.push(node)
      } else roots.push(node)
    })
    return roots
  }

  const fetchCatalogTree = (moduleCode: string) => async () => {
    const result = await fetchSafetyCatalogRecords({
      moduleCode,
      status: 'active',
      from: 0,
      to: 999
    })
    const rows = result.data ?? []
    catalogReferenceRows.set(moduleCode, rows)
    return {
      data: buildCatalogTree(rows),
      total: result.total ?? rows.length
    }
  }

  const fetchEquipmentReference = async (params: DataSelectFetchParams) => {
    const { from, to } = pageRange(params)
    const result = await fetchSafetyCatalogRecords({
      moduleCode: 'equipment-ledger',
      keyword: params.keyword,
      status: 'active',
      from,
      to
    })
    return {
      data: (result.data ?? []).map((row) => ({
        ...row,
        value: row.title,
        label: `${row.title}（${row.recordNo}）`
      })),
      total: result.total ?? 0
    }
  }

  const fetchEmployeeReference = async (params: DataSelectFetchParams) => {
    const { from, to } = pageRange(params)
    const result = await fetchSmisEmployeeReferences({ keyword: params.keyword, from, to })
    const rows = result.data ?? []
    return {
      data: rows.map((row) => ({
        ...row,
        value: row.employeeName,
        label: `${row.employeeName}（${row.employeeNo}）`
      })),
      total: Number(rows[0]?.totalCount ?? rows.length)
    }
  }

  const fetchSupplierReference = async (params: DataSelectFetchParams) => {
    const { from, to } = pageRange(params)
    const result = await fetchSmisSupplierReferences({ keyword: params.keyword, from, to })
    const rows = result.data ?? []
    return {
      data: rows.map((row) => ({
        ...row,
        value: row.supplierName,
        label: `${row.supplierName}（${row.supplierCode}）`
      })),
      total: Number(rows[0]?.totalCount ?? rows.length)
    }
  }

  const selectedData = (item: SafetyFieldDefinition): DataSelectRecord[] => {
    const value = formData[item.key]
    if (typeof value !== 'string' || !value) return []
    return [{ value, label: value }]
  }

  const handleReferenceConfirm = (
    item: SafetyFieldDefinition,
    _value: unknown,
    rows: DataSelectRecord[]
  ): void => {
    const row = rows[0]
    if (!row) return
    formData[item.key] = row.value
    if (item.type === 'catalog-reference') {
      const idKey =
        item.key === 'parentName'
          ? 'parentId'
          : item.key === 'storageLocation'
            ? 'storageLocationId'
            : item.key === 'category'
              ? 'categoryId'
              : `${item.key}Id`
      formData[idKey] = row.id
    }
    if (item.type === 'equipment-reference') {
      formData.equipmentId = row.id
      formData.equipmentNo = row.recordNo
    }
    if (item.type === 'supplier-reference') {
      formData.supplierId = row.id
      formData.supplierCode = row.supplierCode
    }
    if (item.type === 'employee') {
      formData[`${item.key}Id`] = row.id
      formData[`${item.key}No`] = row.employeeNo
    }
  }

  const dataSelectItem = (item: SafetyFieldDefinition, common: FormItem): FormItem => {
    const api =
      item.type === 'employee'
        ? fetchEmployeeReference
        : item.type === 'equipment-reference'
          ? fetchEquipmentReference
          : fetchSupplierReference
    return {
      ...common,
      type: 'dataSelect',
      api: api as FormItem['api'],
      immediate: false,
      props: {
        selectedData: selectedData(item),
        rowKey: 'value',
        labelKey: 'label',
        descriptionKey: (row: DataSelectRecord) =>
          [row.organizationName, row.jobTitle, row.contactName, row.contactPhone]
            .filter(Boolean)
            .join(' / '),
        columns:
          item.type === 'employee'
            ? [
                { prop: 'employeeNo', label: '员工工号', width: 130 },
                { prop: 'employeeName', label: '员工姓名', minWidth: 140 },
                { prop: 'organizationName', label: '所属组织', minWidth: 160 },
                { prop: 'jobTitle', label: '岗位', minWidth: 140 }
              ]
            : item.type === 'supplier-reference'
              ? [
                  { prop: 'supplierCode', label: '供应商编码', width: 150 },
                  { prop: 'supplierName', label: '供应商名称', minWidth: 190 },
                  { prop: 'contactName', label: '联系人', width: 120 },
                  { prop: 'contactPhone', label: '联系电话', width: 140 }
                ]
              : [
                  { prop: 'recordNo', label: '编号', width: 150 },
                  { prop: 'title', label: '名称', minWidth: 200 }
                ],
        title: `选择${item.label}`,
        subtitle: '仅展示当前租户内可用的数据，支持编号或名称搜索。',
        dialogWidth: 'xl',
        showPagination: true,
        pageSize: 10,
        onConfirm: (value: unknown, rows: DataSelectRecord[]) =>
          handleReferenceConfirm(item, value, rows),
        onClear: () => handleReferenceClear(item)
      }
    }
  }

  const handleReferenceClear = (item: SafetyFieldDefinition): void => {
    formData[item.key] = undefined
    const relatedKeys =
      item.type === 'equipment-reference'
        ? ['equipmentId', 'equipmentNo']
        : item.type === 'supplier-reference'
          ? ['supplierId', 'supplierCode']
          : item.type === 'employee'
            ? [`${item.key}Id`, `${item.key}No`]
            : [
                item.key === 'parentName'
                  ? 'parentId'
                  : item.key === 'storageLocation'
                    ? 'storageLocationId'
                    : item.key === 'category'
                      ? 'categoryId'
                      : `${item.key}Id`
              ]
    relatedKeys.forEach((key) => (formData[key] = undefined))
  }

  const handleCatalogTreeChange = (
    item: SafetyFieldDefinition,
    value: unknown,
    moduleCode: string
  ): void => {
    if (typeof value !== 'string' || !value) {
      handleReferenceClear(item)
      return
    }
    const selected = (catalogReferenceRows.get(moduleCode) ?? []).find((row) => row.title === value)
    const idKey =
      item.key === 'parentName'
        ? 'parentId'
        : item.key === 'storageLocation'
          ? 'storageLocationId'
          : item.key === 'category'
            ? 'categoryId'
            : `${item.key}Id`
    formData[idKey] = selected?.id
  }

  const toFormItem = (item: SafetyFieldDefinition): FormItem => {
    const common = {
      key: item.key,
      label: item.label,
      span: item.type === 'textarea' || item.type === 'image' ? 24 : 12,
      hidden: item.visibleWhen
        ? () => formData[item.visibleWhen!.key] !== item.visibleWhen!.value
        : false,
      placeholder: item.placeholder || `${isChoiceField(item) ? '请选择' : '请输入'}${item.label}`
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
        props: {
          min: 0,
          precision: item.key === 'sort' ? 0 : 2,
          controlsPosition: 'right',
          disabled: item.readonly,
          style: { width: '100%' }
        }
      }
    }
    if (item.type === 'date' || item.type === 'datetime') {
      return {
        ...common,
        type: 'date',
        props: {
          type: item.type === 'datetime' ? 'datetime' : 'date',
          valueFormat: item.type === 'datetime' ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD',
          disabled: item.readonly
        }
      }
    }
    if (['employee', 'equipment-reference', 'supplier-reference'].includes(item.type)) {
      return dataSelectItem(item, common)
    }
    if (item.type === 'catalog-reference') {
      const moduleCode = item.referenceModuleCode || currentWorkspace.value?.code || ''
      return {
        ...common,
        type: 'treeSelect',
        api: fetchCatalogTree(moduleCode),
        immediate: false,
        resultField: 'data',
        labelField: 'title',
        valueField: 'title',
        childrenField: 'children',
        props: {
          checkStrictly: true,
          defaultExpandAll: true,
          renderAfterExpand: false,
          clearable: true,
          filterable: true,
          style: { width: '100%' },
          props: {
            label: 'title',
            value: 'title',
            children: 'children',
            disabled: 'disabled'
          },
          onChange: (value: unknown) => handleCatalogTreeChange(item, value, moduleCode)
        }
      }
    }
    if (item.type === 'select' || item.type === 'multi-select') {
      return {
        ...common,
        type: 'select',
        options: item.dictCode ? (getDictMap.value[item.dictCode] ?? []) : (item.options ?? []),
        props: {
          clearable: true,
          filterable: true,
          multiple: item.type === 'multi-select',
          disabled: item.readonly
        }
      }
    }
    if (item.type === 'image') {
      return {
        ...common,
        render: ArtUploadImage,
        description: '建议上传清晰的设备全景图，便于档案详情快速识别。'
      }
    }
    return {
      ...common,
      type: 'input',
      props: { maxlength: 200, disabled: item.readonly },
      description: item.readonly && item.key === 'recordNo' ? item.placeholder : undefined
    }
  }

  const formItems = computed<FormItem[]>(() => {
    const result: FormItem[] = []
    let currentSection = ''
    for (const field of currentWorkspace.value?.fields ?? []) {
      const section = field.section || currentWorkspace.value?.recordNoun || '业务信息'
      if (section !== currentSection) {
        result.push({
          key: `section-${section}`,
          label: section,
          type: 'divider',
          span: 24
        })
        currentSection = section
      }
      result.push(toFormItem(field))
    }
    return result
  })

  const replaceForm = (next: Record<string, unknown>): void => {
    Object.keys(formData).forEach((key) => delete formData[key])
    Object.assign(formData, next)
  }

  const createInitialForm = (
    workspace: SafetyModuleDefinition,
    record?: SafetyCatalogRecord
  ): Record<string, unknown> => {
    const inspectionRecordType = {
      'external-inspection': 'external',
      'internal-inspection': 'internal',
      'annual-inspection': 'annual',
      'periodic-inspection': 'periodic'
    }[workspace.code]
    const rawDetailRows = record?.payload?.detailRows
    const initialDetailRows = Array.isArray(rawDetailRows)
      ? cloneDeep(rawDetailRows).map((row: Record<string, unknown>, index: number) => ({
          ...row,
          _key: String(row._key || `${Date.now()}-${index}`)
        }))
      : []

    return Object.assign(
      Object.fromEntries(
        workspace.fields.map((item) => [
          item.key,
          record?.payload?.[item.key] ??
            (item.key === 'recordType' && inspectionRecordType
              ? inspectionRecordType
              : item.key === 'needsNextInspection' && inspectionRecordType
                ? true
                : item.key === 'status'
                  ? workspace.code === 'exam-management'
                    ? '未开始'
                    : workspace.capabilities.includes('approval')
                      ? '草稿'
                      : '有效'
                  : undefined)
        ])
      ),
      workspace.capabilities.includes('attachments')
        ? { attachments: cloneDeep(record?.payload?.attachments ?? []) }
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
      const isAutomaticNumber = [
        'equipment-depreciation',
        'external-inspection',
        'internal-inspection',
        'annual-inspection',
        'periodic-inspection'
      ].includes(workspace.code)
      const generatedNo = isAutomaticNumber
        ? ''
        : `${workspace.code.toUpperCase()}-${Date.now().toString().slice(-8)}`
      const type = editingRecord.value?.id ? 'edit' : 'add'
      const normalizedPayload = cloneDeep(toRaw(formData))
      if (Array.isArray(normalizedPayload.detailRows)) {
        normalizedPayload.detailRows = normalizedPayload.detailRows.map((row) => {
          if (!row || typeof row !== 'object') return row
          return Object.fromEntries(
            Object.entries(row as Record<string, unknown>).filter(([key]) => key !== '_key')
          )
        })
      }
      if (normalizedPayload.needsNextInspection === false) {
        normalizedPayload.nextInspectionDate = undefined
        normalizedPayload.waterQualityNextInspectionDate = undefined
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
    await nextTick()
    await dialogRef.value?.handleOpen(data, {
      title: `${data.record?.id ? '编辑' : '新增'}${data.workspace.recordNoun}`,
      subtitle: data.workspace.description,
      contentMaxHeight: '72vh',
      confirmText: '保存记录',
      onConfirm: handleSubmit,
      onReset: () => replaceForm(createInitialForm(data.workspace, data.record)),
      onOpen: async () => {
        await nextTick()
        formRef.value?.clearValidate()
        data.workspace.fields
          .filter((field) => field.type === 'catalog-reference')
          .forEach((field) => void formRef.value?.reloadOptions(field.key))
      }
    })
  }

  defineExpose({ handleOpen, handleClose: () => dialogRef.value?.handleClose() })
</script>
