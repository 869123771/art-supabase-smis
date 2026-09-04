<template>
  <ArtDialog
    ref="dialogRef"
    size="xl"
    :show-fullscreen-button="true"
    :show-confirm-button="false"
    :loading="loading"
    loading-text="正在加载作业票…"
  >
    <ArtForm
      ref="formRef"
      v-model="form"
      :items="[]"
      :rules="rules"
      :show-reset="false"
      :show-submit="false"
      custom-layout
      label-position="top"
      root-class="permit-form-shell"
      scroll-to-error
    >
      <div class="permit-form">
        <ArtSectionCard title="基础信息" subtitle="明确作业范围、时段与责任主体">
          <div class="permit-form__grid">
            <ElFormItem label="作业证编号">
              <ElInput :model-value="displayPermitNo" disabled />
            </ElFormItem>
            <ElFormItem label="作业类型" prop="operationTypeId">
              <ElSelect
                v-model="form.operationTypeId"
                :disabled="Boolean(forcedOperationTypeCode)"
                placeholder="请选择作业类型"
                @change="handleOperationTypeChange"
              >
                <ElOption
                  v-for="item in enabledOperationTypes"
                  :key="item.id"
                  :label="item.typeName"
                  :value="item.id"
                />
              </ElSelect>
            </ElFormItem>
            <ElFormItem label="作业开始时间" prop="workStartTime">
              <ElDatePicker
                v-model="form.workStartTime"
                type="datetime"
                value-format="YYYY-MM-DDTHH:mm:ssZ"
                placeholder="选择开始时间"
                class="w-full"
              />
            </ElFormItem>
            <ElFormItem label="作业结束时间" prop="workEndTime">
              <ElDatePicker
                v-model="form.workEndTime"
                type="datetime"
                value-format="YYYY-MM-DDTHH:mm:ssZ"
                placeholder="选择结束时间"
                class="w-full"
              />
            </ElFormItem>
            <ElFormItem label="作业内容" prop="workContent" class="permit-form__span-2">
              <ElInput
                v-model="form.workContent"
                maxlength="500"
                show-word-limit
                placeholder="说明本次作业的具体内容"
              />
            </ElFormItem>
            <ElFormItem label="作业地点" prop="workLocation">
              <ElInput
                v-model="form.workLocation"
                maxlength="200"
                placeholder="填写具体区域或设备位置"
              />
            </ElFormItem>
            <ElFormItem label="作业部位">
              <ElInput v-model="form.workSection" maxlength="200" placeholder="填写作业部位" />
            </ElFormItem>
            <ElFormItem label="作业单位">
              <ElInput v-model="form.workUnit" maxlength="200" placeholder="填写承包或执行单位" />
            </ElFormItem>
            <ElFormItem label="涉及其他作业">
              <ElSelect
                v-model="form.relatedOperationTypeIds"
                multiple
                collapse-tags
                collapse-tags-tooltip
                placeholder="可关联其他作业类型"
              >
                <ElOption
                  v-for="item in relatedTypeOptions"
                  :key="item.id"
                  :label="item.typeName"
                  :value="item.id"
                />
              </ElSelect>
            </ElFormItem>
          </div>
        </ArtSectionCard>

        <ArtSectionCard
          v-if="isHotWork"
          title="动火专有信息"
          subtitle="按动火作业制度补充级别、方式和危害因素"
        >
          <div class="permit-form__grid">
            <ElFormItem label="动火级别" prop="hotWorkLevel">
              <ElSelect v-model="form.hotWorkLevel" placeholder="请选择动火级别">
                <ElOption
                  v-for="item in hotWorkLevelOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </ElSelect>
            </ElFormItem>
            <ElFormItem label="动火方式" prop="hotWorkMethods">
              <ElSelect
                v-model="form.hotWorkMethods"
                multiple
                collapse-tags
                collapse-tags-tooltip
                placeholder="可多选动火方式"
              >
                <ElOption
                  v-for="item in hotWorkMethodOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </ElSelect>
            </ElFormItem>
            <ElFormItem label="危害因素" class="permit-form__span-2">
              <ElSelect
                v-model="form.hazardFactorIds"
                multiple
                collapse-tags
                collapse-tags-tooltip
                filterable
                placeholder="选择已识别的危害因素"
              >
                <ElOption
                  v-for="item in catalogs.hazards"
                  :key="item.id"
                  :label="item.itemName"
                  :value="item.id"
                />
              </ElSelect>
            </ElFormItem>
          </div>
        </ArtSectionCard>

        <ArtSectionCard
          v-if="visibleCustomFields.length"
          title="作业专有信息"
          :subtitle="`${selectedOperationType?.typeName || '当前作业类型'}配置的专有字段`"
        >
          <div class="permit-form__grid">
            <ElFormItem
              v-for="field in visibleCustomFields"
              :key="field.fieldCode"
              :label="field.fieldLabel"
              :prop="`customValues.${field.fieldCode}`"
              :rules="field.required ? [requiredCustomFieldRule(field.fieldLabel)] : undefined"
              :class="{ 'permit-form__span-2': field.fieldType === 'textarea' }"
            >
              <SpecialOperationCustomField
                :field="field"
                :model-value="readCustomValue(form.customValues, field.fieldCode)"
                @update:model-value="setCustomValue(field.fieldCode, $event)"
              />
            </ElFormItem>
            <ElFormItem v-if="isWorkAtHeight" label="作业级别">
              <ElInput :model-value="workAtHeightLevel" disabled>
                <template #suffix>按最大作业高度自动判定</template>
              </ElInput>
            </ElFormItem>
          </div>
        </ArtSectionCard>

        <ArtSectionCard
          v-if="isBlindPlate"
          title="盲板抽堵配置"
          subtitle="按现场隔离方案逐块登记盲板工况、规格和标识"
        >
          <SpecialOperationBlindPlateItems v-model="blindPlateItems" />
        </ArtSectionCard>

        <ArtSectionCard title="责任与交底" subtitle="人员均来自当前租户员工花名册">
          <div class="permit-form__grid">
            <ElFormItem label="作业负责人" prop="responsibleEmployeeId">
              <ArtEmployeeSelect
                v-model="form.responsibleEmployeeId"
                v-model:selected-data="selection.responsible"
                :tenant-id="tenantId || undefined"
                placeholder="选择作业负责人"
              />
            </ElFormItem>
            <ElFormItem label="现场监护人">
              <SpecialOperationEmployeeMultipleSelect
                v-model="form.guardianIds"
                v-model:selected-data="selection.guardians"
                :tenant-id="tenantId"
                placeholder="可多选现场监护人"
              />
            </ElFormItem>
            <ElFormItem label="作业验证人">
              <SpecialOperationEmployeeMultipleSelect
                v-model="form.verifierIds"
                v-model:selected-data="selection.verifiers"
                :tenant-id="tenantId"
                placeholder="可多选作业验证人"
              />
            </ElFormItem>
            <ElFormItem label="安全交底人">
              <SpecialOperationEmployeeMultipleSelect
                v-model="form.briefingGiverIds"
                v-model:selected-data="selection.briefingGivers"
                :tenant-id="tenantId"
                placeholder="可多选安全交底人"
              />
            </ElFormItem>
            <ElFormItem label="接受交底人">
              <SpecialOperationEmployeeMultipleSelect
                v-model="form.briefingReceiverIds"
                v-model:selected-data="selection.briefingReceivers"
                :tenant-id="tenantId"
                placeholder="可多选接受交底人"
              />
            </ElFormItem>
            <ElFormItem label="现场分析人">
              <SpecialOperationEmployeeMultipleSelect
                v-model="form.analystIds"
                v-model:selected-data="selection.analysts"
                :tenant-id="tenantId"
                placeholder="可多选现场分析人"
              />
            </ElFormItem>
          </div>
        </ArtSectionCard>

        <ArtSectionCard
          title="作业人员明细"
          subtitle="批量选择后自动带入员工与证书信息，允许按本次作业修正"
        >
          <div class="permit-form__section-action">
            <SpecialOperationEmployeeMultipleSelect
              v-model="form.workerIds"
              v-model:selected-data="selection.workers"
              :tenant-id="tenantId"
              title="批量添加作业人员"
              placeholder="批量选择作业人员"
              @confirm="handleWorkerConfirm"
            />
          </div>
          <ArtTable
            :data="form.workers"
            :pagination="false"
            row-key="employeeId"
            table-layout="fixed"
            empty-text="尚未添加作业人员"
          >
            <ElTableColumn type="index" label="序号" width="62" />
            <ElTableColumn label="作业人员" min-width="132"
              ><template #default="{ row }"><ElInput v-model="row.employeeName" /></template
            ></ElTableColumn>
            <ElTableColumn label="部门" min-width="150"
              ><template #default="{ row }"><ElInput v-model="row.organizationName" /></template
            ></ElTableColumn>
            <ElTableColumn label="身份证号" min-width="190"
              ><template #default="{ row }"><ElInput v-model="row.idCardNo" /></template
            ></ElTableColumn>
            <ElTableColumn label="手机号" min-width="145"
              ><template #default="{ row }"><ElInput v-model="row.phone" /></template
            ></ElTableColumn>
            <ElTableColumn label="证件" min-width="150"
              ><template #default="{ row }"><ElInput v-model="row.certificateName" /></template
            ></ElTableColumn>
            <ElTableColumn label="证书编号" min-width="160"
              ><template #default="{ row }"><ElInput v-model="row.certificateNumber" /></template
            ></ElTableColumn>
            <ElTableColumn label="操作" width="76" fixed="right"
              ><template #default="{ row }"
                ><ElButton link type="danger" @click="removeWorker(row.employeeId)"
                  >移除</ElButton
                ></template
              ></ElTableColumn
            >
          </ArtTable>
        </ArtSectionCard>

        <ArtSectionCard
          title="现场分析"
          subtitle="分析项目随作业类型自动加载，可直接记录本次检测结果"
        >
          <ArtTable
            :data="form.siteAnalysisRecords"
            :pagination="false"
            row-key="id"
            table-layout="fixed"
            empty-text="当前作业类型未配置现场分析项"
          >
            <ElTableColumn type="index" label="序号" width="62" />
            <ElTableColumn prop="itemName" label="分析项" min-width="180" />
            <ElTableColumn label="记录类型" width="100"
              ><template #default="{ row }"
                ><ArtDictDisplay
                  dict-code="smisSpecialOperationRecordType"
                  :value="row.recordType"
                  display="tag" /></template
            ></ElTableColumn>
            <ElTableColumn prop="normalValue" label="正常值" min-width="140" />
            <ElTableColumn label="本次记录" min-width="180"
              ><template #default="{ row }"
                ><ElInput v-model="row.recordedValue" placeholder="填写检测结果" /></template
            ></ElTableColumn>
          </ArtTable>
        </ArtSectionCard>

        <ArtSectionCard
          title="安全措施与现场说明"
          subtitle="逐项确认安全措施，并保留现场文字和影像记录"
        >
          <div v-if="form.safetyMeasures.length" class="permit-form__measure-list">
            <ElCheckbox
              v-for="item in form.safetyMeasures"
              :key="item.id"
              v-model="item.involved"
              >{{ item.itemName }}</ElCheckbox
            >
          </div>
          <ElEmpty v-else description="当前作业类型未配置安全检查项" :image-size="72" />
          <ElFormItem label="作业描述" class="permit-form__description">
            <ElInput
              v-model="form.workDescription"
              type="textarea"
              :rows="4"
              maxlength="1000"
              show-word-limit
              placeholder="补充作业环境、边界或注意事项"
            />
          </ElFormItem>
          <ElFormItem label="作业现场照片">
            <ArtUploadImage
              v-model="form.sitePhotoUrls"
              multiple
              :limit="6"
              :size="104"
              tip="支持 jpg、png，最多 6 张"
            />
          </ElFormItem>
        </ArtSectionCard>
      </div>
    </ArtForm>

    <template #footer="{ api }">
      <div class="permit-form__footer">
        <span>草稿可继续编辑；提交后进入审批流程。</span>
        <div>
          <ElButton :disabled="submitting" @click="api.handleClose()">取消</ElButton>
          <ElButton :loading="submitting && submitMode === 'draft'" @click="handleSave(false)"
            >保存草稿</ElButton
          >
          <ElButton
            type="primary"
            :loading="submitting && submitMode === 'submit'"
            @click="handleSave(true)"
            >提交审批</ElButton
          >
        </div>
      </div>
    </template>
  </ArtDialog>
</template>

<script setup lang="ts">
  import { ElMessage, type FormRules } from 'element-plus'
  import type { EmployeeIntegrationItem } from '@/api/integration/employees'
  import ArtDialog from '@/components/core/dialogs/art-dialog/index.vue'
  import type { ArtDialogExpose } from '@/components/core/dialogs/art-dialog/types'
  import ArtForm from '@/components/core/forms/art-form/index.vue'
  import ArtDictDisplay from '@/components/core/base/art-dict-display/index.vue'
  import ArtEmployeeSelect from '@/components/business/art-employee-select/index.vue'
  import ArtSectionCard from '@/components/core/surfaces/art-section-card/index.vue'
  import ArtUploadImage from '@/components/core/forms/art-upload-image/index.vue'
  import {
    fetchSpecialOperationCatalogList,
    fetchSpecialOperationPermit,
    fetchSpecialOperationWorkerDefaults,
    saveSpecialOperationPermit,
    type SmisSpecialOperationCatalogItem,
    type SmisSpecialOperationCatalogSelection,
    type SmisSpecialOperationBlindPlateItem,
    type SmisSpecialOperationPermit,
    type SmisSpecialOperationPermitSavePayload,
    type SmisSpecialOperationPerson,
    type SmisSpecialOperationType
  } from '@smis/api'
  import { useUserStore } from '@/store/modules/user'
  import SpecialOperationEmployeeMultipleSelect from './special-operation-employee-multiple-select.vue'
  import SpecialOperationCustomField from './special-operation-custom-field.vue'
  import SpecialOperationBlindPlateItems from './special-operation-blind-plate-items.vue'
  import {
    normalizeBlindPlateItems,
    normalizeCustomValues,
    readCustomValue
  } from './special-operation-permit-utils'

  export interface SpecialOperationPermitDialogOpenData {
    row?: Pick<SmisSpecialOperationPermit, 'id' | 'tenantId' | 'permitNo'>
    mode?: 'add' | 'edit' | 'copy'
    operationTypes: SmisSpecialOperationType[]
    forcedOperationTypeCode?: string | null
    tenantId?: string | null
  }

  interface PermitFormState {
    operationTypeId: string
    workContent: string
    workStartTime: string | null
    workEndTime: string | null
    workLocation: string
    workUnit: string
    workSection: string
    hotWorkLevel: string
    hotWorkMethods: string[]
    hazardFactorIds: string[]
    responsibleEmployeeId?: string
    guardianIds: string[]
    verifierIds: string[]
    briefingGiverIds: string[]
    briefingReceiverIds: string[]
    analystIds: string[]
    workerIds: string[]
    workers: SmisSpecialOperationPerson[]
    siteAnalysisRecords: SmisSpecialOperationCatalogSelection[]
    relatedOperationTypeIds: string[]
    safetyMeasures: SmisSpecialOperationCatalogSelection[]
    customValues: Record<string, unknown>
    workDescription: string
    sitePhotoUrls: string[]
  }

  const emit = defineEmits<{ success: [] }>()
  const userStore = useUserStore()
  const { getDictMap } = storeToRefs(userStore)
  const dialogRef = ref<ArtDialogExpose<SpecialOperationPermitDialogOpenData>>()
  const formRef = ref<InstanceType<typeof ArtForm>>()
  const loading = ref(false)
  const submitting = ref(false)
  const submitMode = ref<'draft' | 'submit'>('draft')
  const editingId = ref<string>()
  const sourcePermitNo = ref<string>()
  const tenantId = ref<string | null>(null)
  const operationTypes = ref<SmisSpecialOperationType[]>([])
  const forcedOperationTypeCode = ref<string | null>(null)
  const catalogs = reactive<{ hazards: SmisSpecialOperationCatalogItem[] }>({ hazards: [] })

  const emptyForm = (): PermitFormState => ({
    operationTypeId: '',
    workContent: '',
    workStartTime: null,
    workEndTime: null,
    workLocation: '',
    workUnit: '',
    workSection: '',
    hotWorkLevel: '',
    hotWorkMethods: [],
    hazardFactorIds: [],
    responsibleEmployeeId: undefined,
    guardianIds: [],
    verifierIds: [],
    briefingGiverIds: [],
    briefingReceiverIds: [],
    analystIds: [],
    workerIds: [],
    workers: [],
    siteAnalysisRecords: [],
    relatedOperationTypeIds: [],
    safetyMeasures: [],
    customValues: {},
    workDescription: '',
    sitePhotoUrls: []
  })
  const form = reactive<PermitFormState>(emptyForm())
  const selection = reactive({
    responsible: [] as EmployeeIntegrationItem[],
    guardians: [] as EmployeeIntegrationItem[],
    verifiers: [] as EmployeeIntegrationItem[],
    briefingGivers: [] as EmployeeIntegrationItem[],
    briefingReceivers: [] as EmployeeIntegrationItem[],
    analysts: [] as EmployeeIntegrationItem[],
    workers: [] as EmployeeIntegrationItem[]
  })
  const rules: FormRules<PermitFormState> = {
    operationTypeId: [{ required: true, message: '请选择作业类型', trigger: 'change' }],
    workContent: [{ required: true, message: '请填写作业内容', trigger: 'blur' }],
    workStartTime: [{ required: true, message: '请选择作业开始时间', trigger: 'change' }],
    workEndTime: [{ required: true, message: '请选择作业结束时间', trigger: 'change' }],
    workLocation: [{ required: true, message: '请填写作业地点', trigger: 'blur' }],
    responsibleEmployeeId: [{ required: true, message: '请选择作业负责人', trigger: 'change' }],
    hotWorkLevel: [{ required: true, message: '请选择动火级别', trigger: 'change' }],
    hotWorkMethods: [
      {
        type: 'array',
        required: true,
        min: 1,
        message: '请至少选择一种动火方式',
        trigger: 'change'
      }
    ]
  }
  const dictOptions = (code: string) =>
    (getDictMap.value[code] ?? []).map((item) => ({
      label: item.label || item.name,
      value: item.value
    }))
  const hotWorkLevelOptions = computed(() => dictOptions('smisHotWorkLevel'))
  const hotWorkMethodOptions = computed(() => dictOptions('smisHotWorkMethod'))
  const enabledOperationTypes = computed(() =>
    operationTypes.value.filter((item) => item.status === 'enabled')
  )
  const selectedOperationType = computed(() =>
    operationTypes.value.find((item) => item.id === form.operationTypeId)
  )
  const hotWorkBuiltinFieldCodes = new Set([
    'hot_work_level',
    'fire_method',
    'hot_work_method',
    'hot_work_methods',
    'hazard_factor',
    'hazard_factors'
  ])
  const visibleCustomFields = computed(() =>
    (selectedOperationType.value?.fieldDefinitions ?? []).filter(
      (field) => !isHotWork.value || !hotWorkBuiltinFieldCodes.has(field.fieldCode)
    )
  )
  const isHotWork = computed(() => selectedOperationType.value?.typeCode === 'HOT_WORK')
  const isWorkAtHeight = computed(() => selectedOperationType.value?.typeCode === 'WORK_AT_HEIGHT')
  const isBlindPlate = computed(() => selectedOperationType.value?.typeCode === 'BLIND_PLATE')
  const blindPlateItems = computed<SmisSpecialOperationBlindPlateItem[]>({
    get: () => normalizeBlindPlateItems(readCustomValue(form.customValues, 'blind_plate_items')),
    set: (value) => setCustomValue('blind_plate_items', value)
  })
  const workAtHeightLevel = computed(() => {
    const value = Number(readCustomValue(form.customValues, 'work_height'))
    if (!Number.isFinite(value) || value < 2) return '填写高度后自动判定'
    if (value <= 5) return '一级'
    if (value <= 15) return '二级'
    if (value <= 30) return '三级'
    return '特级'
  })
  const relatedTypeOptions = computed(() =>
    enabledOperationTypes.value.filter((item) => item.id !== form.operationTypeId)
  )
  const displayPermitNo = computed(() => sourcePermitNo.value || '保存后按编号规则自动生成')
  const requiredCustomFieldRule = (label: string) => ({
    validator: (_rule: unknown, value: unknown, callback: (error?: Error) => void): void => {
      const empty =
        value === null ||
        value === undefined ||
        (typeof value === 'string' && !value.trim()) ||
        (Array.isArray(value) && value.length === 0)
      callback(empty ? new Error(`请填写${label}`) : undefined)
    },
    trigger: ['blur', 'change']
  })
  const setCustomValue = (key: string, value: unknown): void => {
    form.customValues[key] = value
  }

  const toEmployeeOption = (person: SmisSpecialOperationPerson): EmployeeIntegrationItem =>
    ({
      id: person.employeeId,
      employeeNo: person.employeeNo || '',
      employeeName: person.employeeName,
      phone: person.phone || '',
      organization: person.organizationName
        ? { id: '', organizationName: person.organizationName }
        : null
    }) as EmployeeIntegrationItem
  const toPerson = (row: EmployeeIntegrationItem): SmisSpecialOperationPerson => ({
    employeeId: row.id,
    employeeNo: row.employeeNo,
    employeeName: row.employeeName,
    phone: row.phone,
    organizationName: row.organization?.organizationName || null
  })
  const people = (rows: EmployeeIntegrationItem[]) => rows.map(toPerson)
  const resetSelections = (): void => Object.values(selection).forEach((rows) => rows.splice(0))

  const loadCatalogs = async (preserveValues = false): Promise<void> => {
    if (!form.operationTypeId) return
    const [hazards, analyses, measures] = await Promise.all([
      fetchSpecialOperationCatalogList({
        catalogKind: 'hazard_factor',
        operationTypeId: form.operationTypeId,
        status: 'enabled',
        tenantId: tenantId.value,
        from: 0,
        to: 499
      }),
      fetchSpecialOperationCatalogList({
        catalogKind: 'site_analysis',
        operationTypeId: form.operationTypeId,
        status: 'enabled',
        tenantId: tenantId.value,
        from: 0,
        to: 499
      }),
      fetchSpecialOperationCatalogList({
        catalogKind: 'safety_checklist',
        operationTypeId: form.operationTypeId,
        status: 'enabled',
        tenantId: tenantId.value,
        from: 0,
        to: 499
      })
    ])
    catalogs.hazards = hazards.data
    if (!preserveValues) {
      form.hazardFactorIds = []
      form.siteAnalysisRecords = analyses.data.map((item) => ({
        id: item.id,
        itemName: item.itemName,
        recordType: item.recordType,
        normalValue: item.normalValue,
        abnormalValue: item.abnormalValue,
        recordedValue: null
      }))
      form.safetyMeasures = measures.data.map((item) => ({
        id: item.id,
        itemName: item.itemName,
        involved: false
      }))
      form.customValues = {}
    }
  }
  const handleOperationTypeChange = async (): Promise<void> => {
    await loadCatalogs(false)
  }

  const hydrate = (record: SmisSpecialOperationPermit): void => {
    Object.assign(form, {
      operationTypeId: record.operationTypeId,
      workContent: record.workContent || '',
      workStartTime: record.workStartTime,
      workEndTime: record.workEndTime,
      workLocation: record.workLocation || '',
      workUnit: record.workUnit || '',
      workSection: record.workSection || '',
      hotWorkLevel: record.hotWorkLevel || '',
      hotWorkMethods: record.hotWorkMethods || [],
      hazardFactorIds: (record.hazardFactors || []).map((item) => item.id),
      responsibleEmployeeId: record.responsibleEmployee?.employeeId,
      guardianIds: record.guardianEmployees.map((item) => item.employeeId),
      verifierIds: record.verifierEmployees.map((item) => item.employeeId),
      briefingGiverIds: record.briefingGiverEmployees.map((item) => item.employeeId),
      briefingReceiverIds: record.briefingReceiverEmployees.map((item) => item.employeeId),
      analystIds: record.analysts.map((item) => item.employeeId),
      workerIds: record.workers.map((item) => item.employeeId),
      workers: record.workers,
      siteAnalysisRecords: record.siteAnalysisRecords || [],
      relatedOperationTypeIds: (record.relatedPermits || []).map((item) => item.id),
      safetyMeasures: record.safetyMeasures || [],
      customValues: normalizeCustomValues(record.customValues),
      workDescription: record.workDescription || '',
      sitePhotoUrls: record.sitePhotoUrls || []
    })
    selection.responsible = record.responsibleEmployee
      ? [toEmployeeOption(record.responsibleEmployee)]
      : []
    selection.guardians = record.guardianEmployees.map(toEmployeeOption)
    selection.verifiers = record.verifierEmployees.map(toEmployeeOption)
    selection.briefingGivers = record.briefingGiverEmployees.map(toEmployeeOption)
    selection.briefingReceivers = record.briefingReceiverEmployees.map(toEmployeeOption)
    selection.analysts = record.analysts.map(toEmployeeOption)
    selection.workers = record.workers.map(toEmployeeOption)
  }

  const handleWorkerConfirm = async (ids: string[]): Promise<void> => {
    const response = await fetchSpecialOperationWorkerDefaults(
      ids,
      selectedOperationType.value?.typeCode || 'HOT_WORK',
      tenantId.value
    )
    form.workerIds = ids
    form.workers = response.data || []
  }
  const removeWorker = (employeeId: string): void => {
    form.workerIds = form.workerIds.filter((id) => id !== employeeId)
    form.workers = form.workers.filter((item) => item.employeeId !== employeeId)
    selection.workers = selection.workers.filter((item) => item.id !== employeeId)
  }

  const buildCustomValues = (): Record<string, unknown> => {
    const values: Record<string, unknown> = { ...form.customValues }
    if (isHotWork.value) {
      const hazardNames = catalogs.hazards
        .filter((item) => form.hazardFactorIds.includes(item.id))
        .map((item) => item.itemName)
      Object.assign(values, {
        hot_work_level: form.hotWorkLevel,
        fire_method: form.hotWorkMethods,
        hot_work_method: form.hotWorkMethods.join('、'),
        hot_work_methods: form.hotWorkMethods,
        hazard_factor: hazardNames.join('、'),
        hazard_factors: hazardNames
      })
    }
    return values
  }
  const buildPayload = (): SmisSpecialOperationPermitSavePayload => ({
    operationTypeId: form.operationTypeId,
    workContent: form.workContent || null,
    workStartTime: form.workStartTime,
    workEndTime: form.workEndTime,
    workLocation: form.workLocation || null,
    workUnit: form.workUnit || null,
    workSection: form.workSection || null,
    hotWorkLevel: form.hotWorkLevel || null,
    hotWorkMethods: form.hotWorkMethods,
    hazardFactors: catalogs.hazards
      .filter((item) => form.hazardFactorIds.includes(item.id))
      .map((item) => ({ id: item.id, itemName: item.itemName })),
    responsibleEmployee: selection.responsible[0] ? toPerson(selection.responsible[0]) : null,
    guardianEmployees: people(selection.guardians),
    verifierEmployees: people(selection.verifiers),
    briefingGiverEmployees: people(selection.briefingGivers),
    briefingReceiverEmployees: people(selection.briefingReceivers),
    workers: form.workers,
    analysts: people(selection.analysts),
    siteAnalysisRecords: form.siteAnalysisRecords,
    relatedPermits: operationTypes.value
      .filter((item) => form.relatedOperationTypeIds.includes(item.id))
      .map((item) => ({ id: item.id, permitNo: '', operationTypeName: item.typeName })),
    safetyMeasures: form.safetyMeasures,
    customValues: buildCustomValues(),
    workDescription: form.workDescription || null,
    sitePhotoUrls: form.sitePhotoUrls
  })
  const handleSave = async (submit: boolean): Promise<void> => {
    if (submit) {
      const currentForm = formRef.value
      if (!currentForm) return
      const validation = currentForm.validate()
      if (!validation) return
      const valid = await validation.catch(() => false)
      if (!valid) return
      if (isHotWork.value && !form.hazardFactorIds.length) {
        ElMessage.warning('请至少选择一项危害因素')
        return
      }
      if (!form.workers.length) {
        ElMessage.warning('请至少添加一名作业人员')
        return
      }
      if (isBlindPlate.value) {
        if (!blindPlateItems.value.length) {
          ElMessage.warning('请至少添加一项盲板明细')
          return
        }
        const incompleteIndex = blindPlateItems.value.findIndex(
          (item) => !item.equipmentPipelineName.trim() || !item.specification.trim()
        )
        if (incompleteIndex >= 0) {
          ElMessage.warning(`请完善第 ${incompleteIndex + 1} 项盲板的设备 / 管线名称和规格`)
          return
        }
      }
    } else if (!form.operationTypeId) {
      await formRef.value?.ref?.validateField('operationTypeId')
      return
    }
    submitMode.value = submit ? 'submit' : 'draft'
    submitting.value = true
    try {
      await saveSpecialOperationPermit(editingId.value, buildPayload(), submit, tenantId.value)
      await dialogRef.value?.handleClose()
      emit('success')
    } finally {
      submitting.value = false
    }
  }

  const handleOpen = async (data: SpecialOperationPermitDialogOpenData): Promise<void> => {
    Object.assign(form, emptyForm())
    resetSelections()
    operationTypes.value = data.operationTypes
    tenantId.value = data.tenantId || data.row?.tenantId || null
    forcedOperationTypeCode.value = data.forcedOperationTypeCode || null
    editingId.value = data.mode === 'copy' ? undefined : data.row?.id
    sourcePermitNo.value = data.mode === 'copy' ? undefined : data.row?.permitNo
    const forcedType = operationTypes.value.find(
      (item) => item.typeCode === forcedOperationTypeCode.value
    )
    form.operationTypeId = forcedType?.id || enabledOperationTypes.value[0]?.id || ''
    loading.value = true
    try {
      await dialogRef.value?.handleOpen(data, {
        title:
          data.mode === 'edit'
            ? '编辑特殊作业票'
            : data.mode === 'copy'
              ? '复制特殊作业票'
              : '新增特殊作业票',
        subtitle:
          data.mode === 'copy'
            ? '已复制原单内容，保存时将生成新的作业证编号'
            : '保存草稿或校验完整后提交审批'
      })
      if (data.row?.id) {
        const result = await fetchSpecialOperationPermit(data.row.id, tenantId.value)
        if (result.data) hydrate(result.data)
        if (forcedType) form.operationTypeId = forcedType.id
        await loadCatalogs(true)
      } else await loadCatalogs(false)
    } finally {
      loading.value = false
    }
  }
  defineExpose({ handleOpen })
</script>

<style scoped lang="scss">
  .permit-form {
    display: grid;
    gap: 16px;

    &__grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0 20px;
    }

    &__span-2 {
      grid-column: 1 / -1;
    }

    &__section-action {
      width: min(480px, 100%);
      margin-bottom: 12px;
    }

    &__measure-list {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px 20px;
      padding: 12px 16px;
      background: var(--art-gray-100);
      border-radius: var(--art-control-radius);
    }

    &__description {
      margin-top: 16px;
    }

    &__footer {
      display: flex;
      gap: 16px;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      color: var(--el-text-color-secondary);
    }
  }

  :deep(.permit-form-shell) {
    padding: 0;
  }

  :deep(.permit-form .el-date-editor),
  :deep(.permit-form .el-select) {
    width: 100%;
  }

  :deep(.permit-form .art-section-card__body) {
    min-width: 0;
  }

  @media (width <= 900px) {
    .permit-form__grid,
    .permit-form__measure-list {
      grid-template-columns: minmax(0, 1fr);
    }

    .permit-form__span-2 {
      grid-column: auto;
    }

    .permit-form__footer {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>
