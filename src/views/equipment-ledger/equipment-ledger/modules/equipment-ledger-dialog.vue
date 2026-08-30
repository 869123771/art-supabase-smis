<template>
  <ArtDialog ref="dialogRef" size="xl">
    <div class="equipment-ledger-dialog">
      <div class="equipment-ledger-dialog__context">
        <span><ArtSvgIcon icon="ri:qr-code-line" /></span>
        <div
          ><strong>一物一码，贯穿设备全生命周期</strong
          ><p>主档、锅炉扩展、安全附件和责任组织统一按当前租户维护。</p></div
        >
      </div>
      <ArtForm
        ref="formRef"
        v-model="form.model"
        :items="form.items"
        :rules="form.rules"
        :span="8"
        :gutter="22"
        label-position="top"
        :show-reset="false"
        :show-submit="false"
      >
        <template #responsibleEmployeeId>
          <ArtEmployeeSelect
            v-model="form.model.responsibleEmployeeId"
            :tenant-id="getUserInfo.tenantId"
            title="选择设备责任人"
            subtitle="数据来自当前租户员工花名册"
            placeholder="从员工花名册选择"
          />
        </template>
        <template #supplierId>
          <ArtTableSingleSelect
            v-model="form.model.supplierId"
            :selected-data="supplierSelection"
            :api-fn="fetchSupplierOptions"
            :columns="supplierColumns"
            title="选择供应商"
            subtitle="数据来自租户级供应商主数据"
            label-key="supplierName"
            description-key="supplierCode"
            placeholder="选择设备供应商"
            empty-text="暂无可选供应商"
            empty-description="请先维护当前租户的供应商主数据。"
            show-pagination
          >
            <template #empty>
              <SmisDataSourceEmptyActions source="supplier" />
            </template>
          </ArtTableSingleSelect>
        </template>
        <template #pressureGaugeIds>
          <ArtTableMultipleSelect
            v-model="form.model.pressureGaugeIds"
            :selected-data="pressureGaugeSelection"
            :api-fn="(params) => fetchAccessoryOptions('pressure_gauge', params)"
            :columns="accessoryColumns"
            title="选择压力表"
            subtitle="仅展示当前租户设备台账中的压力表"
            label-key="equipmentName"
            description-key="equipmentCode"
            placeholder="选择一台或多台压力表"
            empty-text="暂无可选压力表"
            empty-description="请先在设备台账中新增设备，并将设备类型维护为压力表。"
          >
            <template #empty>
              <SmisDataSourceEmptyActions source="equipment" />
            </template>
          </ArtTableMultipleSelect>
        </template>
        <template #safetyValveIds>
          <ArtTableMultipleSelect
            v-model="form.model.safetyValveIds"
            :selected-data="safetyValveSelection"
            :api-fn="(params) => fetchAccessoryOptions('safety_valve', params)"
            :columns="accessoryColumns"
            title="选择安全阀"
            subtitle="仅展示当前租户设备台账中的安全阀"
            label-key="equipmentName"
            description-key="equipmentCode"
            placeholder="选择一台或多台安全阀"
            empty-text="暂无可选安全阀"
            empty-description="请先在设备台账中新增设备，并将设备类型维护为安全阀。"
          >
            <template #empty>
              <SmisDataSourceEmptyActions source="equipment" />
            </template>
          </ArtTableMultipleSelect>
        </template>
      </ArtForm>
    </div>
  </ArtDialog>
</template>

<script setup lang="ts">
  import type { FormRules } from 'element-plus'
  import type {
    DataSelectColumn,
    DataSelectFetchParams,
    DataSelectRecord
  } from '@/components/core/forms/art-data-select/types'
  import { fetchGetEnableOrganizationTree } from '@/api/system-manage'
  import ArtDialog from '@/components/core/dialogs/art-dialog/index.vue'
  import type { ArtDialogExpose } from '@/components/core/dialogs/art-dialog/types'
  import ArtForm, {
    type FormItem,
    type FormItemOption
  } from '@/components/core/forms/art-form/index.vue'
  import ArtEmployeeSelect from '@/components/business/art-employee-select/index.vue'
  import ArtTableSingleSelect from '@/components/core/forms/art-data-select/table-single.vue'
  import ArtTableMultipleSelect from '@/components/core/forms/art-data-select/table-multiple.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import SmisDataSourceEmptyActions from '@smis/views/components/smis-data-source-empty-actions.vue'
  import { useDocumentNumberRule } from '@/hooks/core/useDocumentNumberRule'
  import { useUserStore } from '@/store/modules/user'
  import { resolveSupplierDictionaryLabel } from '@smis/domain/supplier-dictionary'
  import {
    fetchEquipmentLedgerList,
    fetchSupplierList,
    saveEquipmentLedger,
    type SmisEquipment,
    type SmisEquipmentAssetStatus,
    type SmisEquipmentBoiler,
    type SmisEquipmentCategory,
    type SmisEquipmentImportanceLevel,
    type SmisEquipmentKind,
    type SmisEquipmentOperationStatus,
    type SmisEquipmentSavePayload,
    type SmisEquipmentStatus,
    type SmisEquipmentUseStatus,
    type SmisStorageLocation
  } from '@smis/api'

  export interface EquipmentLedgerDialogOpenData {
    row?: SmisEquipment
    categoryTree: SmisEquipmentCategory[]
    locationTree: SmisStorageLocation[]
    presetCategoryId?: string
    presetLocationId?: string
    presetKind?: SmisEquipmentKind
  }
  interface EquipmentForm {
    id?: string
    sort: number
    categoryId: string
    locationId?: string
    usingOrganizationId: string
    managingOrganizationId: string
    responsibleEmployeeId?: string
    supplierId?: string
    equipmentCode: string
    equipmentName: string
    equipmentShortName: string
    equipmentKind: SmisEquipmentKind
    specification: string
    model: string
    manufacturer: string
    factoryNo: string
    manufactureDate: string
    installationDate: string
    commissioningDate: string
    enableDate: string
    useStatus: SmisEquipmentUseStatus
    operationStatus: SmisEquipmentOperationStatus
    assetStatus: SmisEquipmentAssetStatus
    importanceLevel: SmisEquipmentImportanceLevel
    assetOriginalValue?: number
    serviceLifeYears?: number
    netValue?: number
    fixedAssetNo: string
    erpCode: string
    electronicTagCode: string
    isMajorHazardSource: boolean
    isSpecialEquipment: boolean
    remark: string
    status: SmisEquipmentStatus
    boiler: SmisEquipmentBoiler
    pressureGaugeIds: string[]
    safetyValveIds: string[]
  }
  interface FormExpose {
    validate: () => Promise<boolean>
    clearValidate: () => void
    reloadOptions: (key: string) => Promise<void>
  }

  const emit = defineEmits<{ success: [type: 'add' | 'edit'] }>()
  const userStore = useUserStore()
  const { getDictMap, getUserInfo } = storeToRefs(userStore)
  const dialogRef = ref<ArtDialogExpose<EquipmentLedgerDialogOpenData>>()
  const formRef = ref<FormExpose>()
  const source = reactive<{
    categoryTree: SmisEquipmentCategory[]
    locationTree: SmisStorageLocation[]
  }>({ categoryTree: [], locationTree: [] })
  const supplierSelection = shallowRef<DataSelectRecord[]>([])
  const pressureGaugeSelection = shallowRef<DataSelectRecord[]>([])
  const safetyValveSelection = shallowRef<DataSelectRecord[]>([])
  const numberRule = useDocumentNumberRule('smis.equipment')

  const initialForm = (): EquipmentForm => ({
    sort: 10,
    categoryId: '',
    locationId: undefined,
    usingOrganizationId: '',
    managingOrganizationId: '',
    responsibleEmployeeId: undefined,
    supplierId: undefined,
    equipmentCode: '',
    equipmentName: '',
    equipmentShortName: '',
    equipmentKind: 'general',
    specification: '',
    model: '',
    manufacturer: '',
    factoryNo: '',
    manufactureDate: '',
    installationDate: '',
    commissioningDate: '',
    enableDate: '',
    useStatus: 'in_use',
    operationStatus: 'normal',
    assetStatus: 'active',
    importanceLevel: 'general',
    assetOriginalValue: undefined,
    serviceLifeYears: undefined,
    netValue: undefined,
    fixedAssetNo: '',
    erpCode: '',
    electronicTagCode: '',
    isMajorHazardSource: false,
    isSpecialEquipment: false,
    remark: '',
    status: 'enabled',
    boiler: {
      boilerType: 'water',
      registrationCode: '',
      useCertificateNo: '',
      internalNo: '',
      ratedEvaporation: null,
      designPressure: null,
      workingPressure: null,
      workingTemperature: null,
      fuelType: '',
      purpose: '',
      maintenanceOrganization: '',
      installationOrganization: ''
    },
    pressureGaugeIds: [],
    safetyValveIds: []
  })
  const formModel = reactive<EquipmentForm>(initialForm())
  const dictOptions = (code: string): FormItemOption[] =>
    (getDictMap.value[code] ?? []).map((item) => ({
      label: item.label || item.name,
      value: item.value
    }))
  const mapCategory = (items: SmisEquipmentCategory[]): FormItemOption[] =>
    items.map((item) => ({
      label: `${item.categoryName} · ${item.categoryCode}`,
      value: item.id,
      disabled: item.status === 'disabled',
      children: item.children ? mapCategory(item.children) : undefined
    }))
  const mapLocation = (items: SmisStorageLocation[]): FormItemOption[] =>
    items.map((item) => ({
      label: `${item.locationName} · ${item.locationCode}`,
      value: item.id,
      disabled: item.status === 'disabled',
      children: item.children ? mapLocation(item.children) : undefined
    }))
  const categoryOptions = computed(() => mapCategory(source.categoryTree))
  const locationOptions = computed(() => mapLocation(source.locationTree))
  const boilerVisible = computed(() => formModel.equipmentKind === 'boiler')
  const equipmentCodeProps = computed<Record<string, unknown>>(() =>
    numberRule.inputProps(Boolean(formModel.id), '请输入设备编码', true)
  )
  watch(
    () => formModel.equipmentKind,
    (kind) => {
      if (kind === 'boiler') formModel.isSpecialEquipment = true
    }
  )

  const commonInput = (placeholder: string, maxlength = 120) => ({
    clearable: true,
    maxlength,
    placeholder
  })
  const form = reactive<{
    model: EquipmentForm
    items: ComputedRef<FormItem[]>
    rules: FormRules<EquipmentForm>
  }>({
    model: formModel,
    items: computed(() => [
      { label: '基本信息', key: 'basicSection', type: 'divider', span: 24 },
      {
        label: '设备编码',
        key: 'equipmentCode',
        type: 'input',
        description: numberRule.description.value,
        props: equipmentCodeProps.value
      },
      {
        label: '设备名称',
        key: 'equipmentName',
        type: 'input',
        props: commonInput('请输入设备名称')
      },
      {
        label: '设备简称',
        key: 'equipmentShortName',
        type: 'input',
        props: commonInput('用于列表紧凑展示', 60)
      },
      {
        label: '设备类型',
        key: 'equipmentKind',
        type: 'select',
        options: dictOptions('smisEquipmentKind'),
        props: { clearable: false }
      },
      {
        label: '排序',
        key: 'sort',
        type: 'number',
        props: {
          min: 0,
          max: 999999,
          step: 10,
          stepStrictly: true,
          controlsPosition: 'right',
          class: '!w-full'
        }
      },
      {
        label: '设备分类',
        key: 'categoryId',
        type: 'treeSelect',
        options: categoryOptions.value,
        props: {
          clearable: true,
          checkStrictly: true,
          defaultExpandAll: true,
          renderAfterExpand: false,
          placeholder: '选择设备分类'
        }
      },
      {
        label: '安装/存放位置',
        key: 'locationId',
        type: 'treeSelect',
        options: locationOptions.value,
        props: {
          clearable: true,
          checkStrictly: true,
          defaultExpandAll: true,
          renderAfterExpand: false,
          placeholder: '选择存放位置'
        }
      },
      { label: '规格', key: 'specification', type: 'input', props: commonInput('请输入规格') },
      { label: '型号', key: 'model', type: 'input', props: commonInput('请输入设备型号') },
      { label: '制造商', key: 'manufacturer', type: 'input', props: commonInput('请输入制造商') },
      { label: '出厂编号', key: 'factoryNo', type: 'input', props: commonInput('请输入出厂编号') },
      { label: '组织与责任', key: 'ownerSection', type: 'divider', span: 24 },
      {
        label: '使用部门',
        key: 'usingOrganizationId',
        type: 'treeSelect',
        api: fetchGetEnableOrganizationTree,
        immediate: false,
        beforeFetch: () => ({ tenantId: getUserInfo.value.tenantId }),
        resultField: 'data',
        labelField: 'organizationName',
        valueField: 'id',
        labelFn: (item) => `${item.organizationName}（${item.organizationCode}）`,
        childrenField: 'children',
        props: {
          clearable: true,
          checkStrictly: true,
          defaultExpandAll: true,
          renderAfterExpand: false
        }
      },
      {
        label: '管理部门',
        key: 'managingOrganizationId',
        type: 'treeSelect',
        api: fetchGetEnableOrganizationTree,
        immediate: false,
        beforeFetch: () => ({ tenantId: getUserInfo.value.tenantId }),
        resultField: 'data',
        labelField: 'organizationName',
        valueField: 'id',
        labelFn: (item) => `${item.organizationName}（${item.organizationCode}）`,
        childrenField: 'children',
        props: {
          clearable: true,
          checkStrictly: true,
          defaultExpandAll: true,
          renderAfterExpand: false
        }
      },
      { label: '设备责任人', key: 'responsibleEmployeeId', type: 'text' },
      { label: '供应商', key: 'supplierId', type: 'text' },
      { label: '状态与资产', key: 'statusSection', type: 'divider', span: 24 },
      {
        label: '使用状态',
        key: 'useStatus',
        type: 'select',
        options: dictOptions('smisEquipmentUseStatus')
      },
      {
        label: '运行状态',
        key: 'operationStatus',
        type: 'select',
        options: dictOptions('smisEquipmentOperationStatus')
      },
      {
        label: '资产状态',
        key: 'assetStatus',
        type: 'select',
        options: dictOptions('smisEquipmentAssetStatus')
      },
      {
        label: '重要级别',
        key: 'importanceLevel',
        type: 'select',
        options: dictOptions('smisEquipmentImportanceLevel')
      },
      {
        label: '启用状态',
        key: 'status',
        type: 'select',
        options: dictOptions('smisEquipmentStatus')
      },
      {
        label: '启用日期',
        key: 'enableDate',
        type: 'date',
        props: { valueFormat: 'YYYY-MM-DD', clearable: true }
      },
      {
        label: '制造日期',
        key: 'manufactureDate',
        type: 'date',
        props: { valueFormat: 'YYYY-MM-DD', clearable: true }
      },
      {
        label: '安装日期',
        key: 'installationDate',
        type: 'date',
        props: { valueFormat: 'YYYY-MM-DD', clearable: true }
      },
      {
        label: '投运日期',
        key: 'commissioningDate',
        type: 'date',
        props: { valueFormat: 'YYYY-MM-DD', clearable: true }
      },
      {
        label: '资产原值（元）',
        key: 'assetOriginalValue',
        type: 'number',
        props: { min: 0, precision: 2, controlsPosition: 'right' }
      },
      {
        label: '预计寿命（年）',
        key: 'serviceLifeYears',
        type: 'number',
        props: { min: 0.01, precision: 2, controlsPosition: 'right' }
      },
      {
        label: '当前净值（元）',
        key: 'netValue',
        type: 'number',
        props: { min: 0, precision: 2, controlsPosition: 'right' }
      },
      {
        label: '固定资产编号',
        key: 'fixedAssetNo',
        type: 'input',
        props: commonInput('请输入固定资产编号')
      },
      { label: 'ERP 编码', key: 'erpCode', type: 'input', props: commonInput('请输入 ERP 编码') },
      {
        label: '电子标签编码',
        key: 'electronicTagCode',
        type: 'input',
        props: commonInput('请输入电子标签编码')
      },
      {
        label: '重大危险源',
        key: 'isMajorHazardSource',
        type: 'switch',
        description: '开启后可配置到期提醒责任人和推送渠道'
      },
      {
        label: '特种设备',
        key: 'isSpecialEquipment',
        type: 'switch',
        description: '纳入特种设备检验与到期提醒范围'
      },
      {
        label: '锅炉专用信息',
        key: 'boilerSection',
        type: 'divider',
        span: 24,
        hidden: () => !boilerVisible.value
      },
      {
        label: '锅炉种类',
        key: 'boiler.boilerType',
        type: 'select',
        options: dictOptions('smisBoilerType'),
        hidden: () => !boilerVisible.value
      },
      {
        label: '注册代码',
        key: 'boiler.registrationCode',
        type: 'input',
        props: commonInput('请输入锅炉注册代码'),
        hidden: () => !boilerVisible.value
      },
      {
        label: '使用证编号',
        key: 'boiler.useCertificateNo',
        type: 'input',
        props: commonInput('请输入使用证编号'),
        hidden: () => !boilerVisible.value
      },
      {
        label: '内部编号',
        key: 'boiler.internalNo',
        type: 'input',
        props: commonInput('请输入内部编号'),
        hidden: () => !boilerVisible.value
      },
      {
        label: '额定蒸发量',
        key: 'boiler.ratedEvaporation',
        type: 'number',
        props: { min: 0, precision: 3 },
        hidden: () => !boilerVisible.value
      },
      {
        label: '设计压力（MPa）',
        key: 'boiler.designPressure',
        type: 'number',
        props: { min: 0, precision: 3 },
        hidden: () => !boilerVisible.value
      },
      {
        label: '工作压力（MPa）',
        key: 'boiler.workingPressure',
        type: 'number',
        props: { min: 0, precision: 3 },
        hidden: () => !boilerVisible.value
      },
      {
        label: '工作温度（℃）',
        key: 'boiler.workingTemperature',
        type: 'number',
        props: { min: 0, precision: 3 },
        hidden: () => !boilerVisible.value
      },
      {
        label: '燃料种类',
        key: 'boiler.fuelType',
        type: 'input',
        props: commonInput('如天然气、生物质'),
        hidden: () => !boilerVisible.value
      },
      {
        label: '用途',
        key: 'boiler.purpose',
        type: 'input',
        props: commonInput('请输入锅炉用途'),
        hidden: () => !boilerVisible.value
      },
      {
        label: '压力表',
        key: 'pressureGaugeIds',
        type: 'text',
        span: 12,
        hidden: () => !boilerVisible.value
      },
      {
        label: '安全阀',
        key: 'safetyValveIds',
        type: 'text',
        span: 12,
        hidden: () => !boilerVisible.value
      },
      {
        label: '备注',
        key: 'remark',
        type: 'input',
        span: 24,
        props: {
          type: 'textarea',
          rows: 4,
          maxlength: 1000,
          showWordLimit: true,
          resize: 'none',
          placeholder: '补充设备技术参数、运行边界或管理要求'
        }
      }
    ]),
    rules: {
      equipmentCode: [
        {
          validator: (_rule, value, callback) => {
            if (numberRule.manualRequired(Boolean(formModel.id)) && !String(value || '').trim())
              callback(new Error('请输入设备编码'))
            else callback()
          },
          trigger: 'blur'
        }
      ],
      equipmentName: [
        { required: true, message: '请输入设备名称', trigger: 'blur' },
        { max: 120, message: '设备名称不能超过 120 个字符', trigger: 'blur' }
      ],
      equipmentKind: [{ required: true, message: '请选择设备类型', trigger: 'change' }],
      sort: [{ required: true, message: '请输入排序', trigger: 'change' }],
      categoryId: [{ required: true, message: '请选择设备分类', trigger: 'change' }],
      usingOrganizationId: [{ required: true, message: '请选择使用部门', trigger: 'change' }],
      managingOrganizationId: [{ required: true, message: '请选择管理部门', trigger: 'change' }],
      'boiler.boilerType': [{ required: true, message: '请选择锅炉种类', trigger: 'change' }]
    }
  })

  const supplierColumns: DataSelectColumn[] = [
    { prop: 'supplierCode', label: '供应商编码', minWidth: 150 },
    { prop: 'supplierName', label: '供应商名称', minWidth: 220 },
    {
      prop: 'supplierCategory',
      label: '分类',
      width: 132,
      formatter: (row) =>
        resolveSupplierDictionaryLabel(
          'supplierCategory',
          String(row.supplierCategory || ''),
          getDictMap.value.supplierCategory
        ),
      tagType: 'primary'
    }
  ]
  const accessoryColumns: DataSelectColumn[] = [
    { prop: 'equipmentCode', label: '设备编码', minWidth: 150 },
    { prop: 'equipmentName', label: '设备名称', minWidth: 200 },
    { prop: 'model', label: '型号', minWidth: 130 },
    { prop: 'locationName', label: '存放位置', minWidth: 150 }
  ]
  const fetchSupplierOptions = async (params: DataSelectFetchParams) => {
    const from = (params.page - 1) * params.pageSize
    const result = await fetchSupplierList({
      keyword: params.keyword,
      from,
      to: from + params.pageSize - 1
    })
    return { data: result.data as DataSelectRecord[], total: result.total }
  }
  const fetchAccessoryOptions = async (kind: SmisEquipmentKind, params: DataSelectFetchParams) => {
    const from = (params.page - 1) * params.pageSize
    const result = await fetchEquipmentLedgerList({
      keyword: params.keyword,
      equipmentKind: kind,
      from,
      to: from + params.pageSize - 1
    })
    return {
      data: result.data.map((row) => ({
        ...row,
        locationName: row.location?.locationName || '未设置位置'
      })) as DataSelectRecord[],
      total: result.total
    }
  }
  const selectedRows = async (
    ids: string[],
    kind: SmisEquipmentKind
  ): Promise<DataSelectRecord[]> => {
    if (!ids.length) return []
    const result = await fetchEquipmentLedgerList({ equipmentKind: kind, from: 0, to: 9999 })
    return result.data.filter((row) => ids.includes(row.id)) as unknown as DataSelectRecord[]
  }
  const buildPayload = (): SmisEquipmentSavePayload => ({
    ...toRaw(form.model),
    locationId: form.model.locationId || null,
    responsibleEmployeeId: form.model.responsibleEmployeeId || null,
    supplierId: form.model.supplierId || null,
    equipmentCode: form.model.equipmentCode.trim(),
    equipmentName: form.model.equipmentName.trim(),
    equipmentShortName: form.model.equipmentShortName.trim(),
    specification: form.model.specification.trim(),
    model: form.model.model.trim(),
    manufacturer: form.model.manufacturer.trim(),
    factoryNo: form.model.factoryNo.trim(),
    fixedAssetNo: form.model.fixedAssetNo.trim(),
    erpCode: form.model.erpCode.trim(),
    electronicTagCode: form.model.electronicTagCode.trim(),
    remark: form.model.remark.trim(),
    boiler: form.model.equipmentKind === 'boiler' ? { ...toRaw(form.model.boiler) } : null,
    pressureGaugeIds: form.model.equipmentKind === 'boiler' ? [...form.model.pressureGaugeIds] : [],
    safetyValveIds: form.model.equipmentKind === 'boiler' ? [...form.model.safetyValveIds] : []
  })
  const resetForm = async () => {
    Object.assign(form.model, initialForm())
    supplierSelection.value = []
    pressureGaugeSelection.value = []
    safetyValveSelection.value = []
    await nextTick()
    formRef.value?.clearValidate()
  }
  const handleSubmit = async (): Promise<boolean> => {
    try {
      await formRef.value?.validate()
      await saveEquipmentLedger(buildPayload())
      emit('success', form.model.id ? 'edit' : 'add')
      return true
    } catch {
      return false
    }
  }
  const handleOpen = async (data: EquipmentLedgerDialogOpenData): Promise<void> => {
    await resetForm()
    source.categoryTree = data.categoryTree
    source.locationTree = data.locationTree
    if (data.row) {
      Object.assign(form.model, {
        ...data.row,
        locationId: data.row.locationId || undefined,
        responsibleEmployeeId: data.row.responsibleEmployeeId || undefined,
        supplierId: data.row.supplierId || undefined,
        equipmentShortName: data.row.equipmentShortName || '',
        specification: data.row.specification || '',
        model: data.row.model || '',
        manufacturer: data.row.manufacturer || '',
        factoryNo: data.row.factoryNo || '',
        manufactureDate: data.row.manufactureDate || '',
        installationDate: data.row.installationDate || '',
        commissioningDate: data.row.commissioningDate || '',
        enableDate: data.row.enableDate || '',
        fixedAssetNo: data.row.fixedAssetNo || '',
        erpCode: data.row.erpCode || '',
        electronicTagCode: data.row.electronicTagCode || '',
        remark: data.row.remark || '',
        boiler: data.row.boiler
          ? { ...initialForm().boiler, ...data.row.boiler }
          : initialForm().boiler
      })
      supplierSelection.value = data.row.supplier
        ? [data.row.supplier as unknown as DataSelectRecord]
        : []
      ;[pressureGaugeSelection.value, safetyValveSelection.value] = await Promise.all([
        selectedRows(data.row.pressureGaugeIds, 'pressure_gauge'),
        selectedRows(data.row.safetyValveIds, 'safety_valve')
      ])
    } else {
      form.model.categoryId = data.presetCategoryId || ''
      form.model.locationId = data.presetLocationId
      form.model.equipmentKind = data.presetKind || 'general'
      if (data.presetKind === 'boiler') form.model.isSpecialEquipment = true
    }
    await dialogRef.value?.handleOpen(data, {
      title: data.row ? '编辑设备台账' : '新增设备台账',
      subtitle: '维护设备主档、责任关系与专用设备扩展信息',
      confirmText: '保存设备台账',
      contentMaxHeight: 'calc(100vh - 168px)',
      loading: true,
      onOpen: async (_data, api) => {
        try {
          await Promise.all([
            numberRule.loadRule(),
            ...[
              'smisEquipmentKind',
              'smisEquipmentUseStatus',
              'smisEquipmentOperationStatus',
              'smisEquipmentAssetStatus',
              'smisEquipmentImportanceLevel',
              'smisEquipmentStatus',
              'smisBoilerType',
              'supplierCategory'
            ].map((code) => userStore.ensureDictLoaded(code)),
            formRef.value?.reloadOptions('usingOrganizationId'),
            formRef.value?.reloadOptions('managingOrganizationId')
          ])
        } finally {
          api.setLoading(false)
        }
      },
      onConfirm: handleSubmit,
      onReset: () => void resetForm()
    })
  }
  defineExpose({ handleOpen })
</script>

<style scoped lang="scss">
  .equipment-ledger-dialog {
    &__context {
      display: grid;
      grid-template-columns: 44px minmax(0, 1fr);
      gap: 13px;
      align-items: center;
      padding: 13px 15px;
      margin-bottom: 18px;
      background: linear-gradient(
        115deg,
        color-mix(in srgb, var(--theme-color) 9%, var(--default-box-color)),
        color-mix(in srgb, #14b8a6 6%, var(--default-box-color))
      );
      border: 1px solid color-mix(in srgb, var(--theme-color) 16%, transparent);
      border-radius: 12px;
    }

    &__context > span {
      display: grid;
      place-items: center;
      width: 44px;
      height: 44px;
      color: var(--theme-color);
      background: var(--default-box-color);
      border-radius: 11px;
      box-shadow: 0 8px 20px rgb(15 23 42 / 8%);
    }

    &__context strong {
      color: var(--el-text-color-primary);
    }

    &__context p {
      margin: 3px 0 0;
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }
</style>
