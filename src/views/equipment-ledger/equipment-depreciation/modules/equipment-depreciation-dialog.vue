<template>
  <ArtDialog ref="dialogRef" size="lg">
    <div class="equipment-depreciation-dialog">
      <div class="equipment-depreciation-dialog__context">
        <span><ArtSvgIcon icon="ri:funds-line" /></span>
        <div>
          <strong>折旧方案与设备主档保持一致</strong>
          <p>折旧单号按租户编号规则自动生成；选择设备后自动带入只读编码与资产参数。</p>
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
        <template #equipmentId>
          <ArtTableSingleSelect
            v-model="form.model.equipmentId"
            :selected-data="equipmentSelection"
            :api-fn="fetchEquipmentOptions"
            :columns="equipmentColumns"
            title="选择折旧设备"
            subtitle="数据来自当前租户设备台账；选择后自动回填设备编码、原值和使用年限"
            label-key="equipmentName"
            description-key="equipmentCode"
            placeholder="点击选择设备"
            show-pagination
            @change="handleEquipmentChange"
          />
        </template>
        <template #depreciationMethod>
          <ElRadioGroup
            v-model="form.model.depreciationMethod"
            class="equipment-depreciation-dialog__methods"
          >
            <ElRadio v-for="method in methodCards" :key="method.value" :value="method.value" border>
              <span
                ><strong>{{ method.label }}</strong
                ><small>{{ method.description }}</small></span
              >
            </ElRadio>
          </ElRadioGroup>
        </template>
      </ArtForm>
    </div>
  </ArtDialog>
</template>

<script setup lang="ts">
  import dayjs from 'dayjs'
  import type { FormRules } from 'element-plus'
  import type {
    DataSelectColumn,
    DataSelectFetchParams,
    DataSelectRecord,
    DataSelectModelValue
  } from '@/components/core/forms/art-data-select/types'
  import ArtDialog from '@/components/core/dialogs/art-dialog/index.vue'
  import type { ArtDialogExpose } from '@/components/core/dialogs/art-dialog/types'
  import ArtForm, { type FormItem } from '@/components/core/forms/art-form/index.vue'
  import ArtTableSingleSelect from '@/components/core/forms/art-data-select/table-single.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import { useDocumentNumberRule } from '@/hooks/core/useDocumentNumberRule'
  import { useUserStore } from '@/store/modules/user'
  import {
    fetchEquipmentLedgerList,
    saveEquipmentDepreciation,
    type SmisEquipment,
    type SmisEquipmentDepreciation,
    type SmisEquipmentDepreciationMethod,
    type SmisEquipmentDepreciationSavePayload,
    type SmisEquipmentDepreciationStatus
  } from '@smis/api'

  export interface EquipmentDepreciationDialogOpenData {
    row?: SmisEquipmentDepreciation
  }
  interface DepreciationForm {
    id?: string
    depreciationNo: string
    equipmentId: string
    equipmentCode: string
    depreciationMethod: SmisEquipmentDepreciationMethod
    depreciationStartDate: string
    originalValue?: number
    residualRate: number
    usefulLifeYears?: number
    accumulatedDepreciation: number
    netValue?: number
    remark: string
    status: SmisEquipmentDepreciationStatus
  }
  interface FormExpose {
    validate: () => Promise<boolean>
    clearValidate: () => void
  }

  const emit = defineEmits<{ success: [type: 'add' | 'edit'] }>()
  const userStore = useUserStore()
  const { getDictMap } = storeToRefs(userStore)
  const dialogRef = ref<ArtDialogExpose<EquipmentDepreciationDialogOpenData>>()
  const formRef = ref<FormExpose>()
  const equipmentSelection = shallowRef<DataSelectRecord[]>([])
  const numberRule = useDocumentNumberRule('smis.equipment_depreciation')
  const initialForm = (): DepreciationForm => ({
    depreciationNo: '',
    equipmentId: '',
    equipmentCode: '',
    depreciationMethod: 'straight_line',
    depreciationStartDate: dayjs().format('YYYY-MM-DD'),
    originalValue: undefined,
    residualRate: 5,
    usefulLifeYears: undefined,
    accumulatedDepreciation: 0,
    netValue: undefined,
    remark: '',
    status: 'active'
  })
  const formModel = reactive<DepreciationForm>(initialForm())
  const methodCards = [
    {
      value: 'straight_line' as const,
      label: '平均年限法',
      description: '扣除预计净残值后，在使用年限内均匀分摊。'
    },
    {
      value: 'double_declining_balance' as const,
      label: '双倍余额递减法',
      description: '前期折旧较快，按期初净值与双倍直线率计提。'
    },
    {
      value: 'sum_of_years_digits' as const,
      label: '年限总和法',
      description: '按尚可使用年限占年限总和的比例逐年递减。'
    }
  ]
  const statusOptions = computed(() =>
    (getDictMap.value.smisEquipmentDepreciationStatus ?? []).map((item) => ({
      label: item.label || item.name,
      value: item.value
    }))
  )
  const depreciationNoProps = computed<Record<string, unknown>>(() =>
    numberRule.inputProps(Boolean(formModel.id), '请输入折旧单号', true)
  )
  const form = reactive<{
    model: DepreciationForm
    items: ComputedRef<FormItem[]>
    rules: FormRules<DepreciationForm>
  }>({
    model: formModel,
    items: computed(() => [
      { label: '折旧方案', key: 'planSection', type: 'divider', span: 24 },
      {
        label: '折旧单号',
        key: 'depreciationNo',
        type: 'input',
        description: numberRule.description.value,
        props: depreciationNoProps.value
      },
      {
        label: '折旧状态',
        key: 'status',
        type: 'select',
        options: statusOptions.value,
        props: { clearable: false }
      },
      { label: '设备名称', key: 'equipmentId', type: 'text', span: 12 },
      {
        label: '设备编码',
        key: 'equipmentCode',
        type: 'input',
        span: 12,
        description: '由所选设备台账自动带入，只读。',
        props: { readonly: true, placeholder: '选择设备后自动带入' }
      },
      { label: '折旧方法', key: 'depreciationMethod', type: 'text', span: 24 },
      { label: '价值与期间', key: 'valueSection', type: 'divider', span: 24 },
      {
        label: '折旧开始日期',
        key: 'depreciationStartDate',
        type: 'date',
        props: { valueFormat: 'YYYY-MM-DD', clearable: false }
      },
      {
        label: '资产原值（元）',
        key: 'originalValue',
        type: 'number',
        props: { min: 0.01, precision: 2, controlsPosition: 'right' }
      },
      {
        label: '预计净残值率（%）',
        key: 'residualRate',
        type: 'number',
        props: { min: 0, max: 100, precision: 4, controlsPosition: 'right' }
      },
      {
        label: '使用年限（年）',
        key: 'usefulLifeYears',
        type: 'number',
        props: { min: 0.01, precision: 2, controlsPosition: 'right' }
      },
      {
        label: '累计折旧（元）',
        key: 'accumulatedDepreciation',
        type: 'number',
        props: { min: 0, precision: 2, controlsPosition: 'right' }
      },
      {
        label: '当前净值（元）',
        key: 'netValue',
        type: 'number',
        description: '默认按资产原值减累计折旧计算，可按实际账面价值调整。',
        props: { min: 0, precision: 2, controlsPosition: 'right' }
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
          placeholder: '补充折旧政策依据、调整原因或财务说明'
        }
      }
    ]),
    rules: {
      depreciationNo: [
        {
          validator: (_rule, value, callback) => {
            if (numberRule.manualRequired(Boolean(formModel.id)) && !String(value || '').trim())
              callback(new Error('请输入折旧单号'))
            else callback()
          },
          trigger: 'blur'
        }
      ],
      equipmentId: [{ required: true, message: '请选择设备', trigger: 'change' }],
      depreciationMethod: [{ required: true, message: '请选择折旧方法', trigger: 'change' }],
      depreciationStartDate: [{ required: true, message: '请选择折旧开始日期', trigger: 'change' }],
      originalValue: [{ required: true, message: '请输入资产原值', trigger: 'blur' }],
      usefulLifeYears: [{ required: true, message: '请输入使用年限', trigger: 'blur' }]
    }
  })
  const equipmentColumns: DataSelectColumn[] = [
    { prop: 'equipmentCode', label: '设备编码', minWidth: 150 },
    { prop: 'equipmentName', label: '设备名称', minWidth: 210 },
    { prop: 'model', label: '型号', minWidth: 130 },
    { prop: 'categoryName', label: '设备分类', minWidth: 140 },
    { prop: 'locationName', label: '存放位置', minWidth: 140 }
  ]
  const fetchEquipmentOptions = async (params: DataSelectFetchParams) => {
    const from = (params.page - 1) * params.pageSize
    const result = await fetchEquipmentLedgerList({
      keyword: params.keyword,
      from,
      to: from + params.pageSize - 1
    })
    return {
      data: result.data.map((row) => ({
        ...row,
        categoryName: row.category.categoryName,
        locationName: row.location?.locationName || '未设置'
      })) as DataSelectRecord[],
      total: result.total
    }
  }
  const applyEquipment = (equipment?: SmisEquipment) => {
    if (!equipment) {
      form.model.equipmentCode = ''
      return
    }
    form.model.equipmentCode = equipment.equipmentCode
    if (equipment.assetOriginalValue != null)
      form.model.originalValue = Number(equipment.assetOriginalValue)
    if (equipment.serviceLifeYears != null)
      form.model.usefulLifeYears = Number(equipment.serviceLifeYears)
    if (equipment.netValue != null) form.model.netValue = Number(equipment.netValue)
    else if (form.model.originalValue != null)
      form.model.netValue = form.model.originalValue - form.model.accumulatedDepreciation
  }
  const handleEquipmentChange = (_value: DataSelectModelValue, rows: DataSelectRecord[]) =>
    applyEquipment(rows[0] as unknown as SmisEquipment | undefined)
  watch(
    () => [form.model.originalValue, form.model.accumulatedDepreciation] as const,
    ([original, accumulated]) => {
      if (original != null && accumulated != null)
        form.model.netValue = Math.max(Number(original) - Number(accumulated), 0)
    }
  )
  const resetForm = async () => {
    Object.assign(form.model, initialForm())
    equipmentSelection.value = []
    await nextTick()
    formRef.value?.clearValidate()
  }
  const buildPayload = (): SmisEquipmentDepreciationSavePayload => ({
    id: form.model.id,
    depreciationNo: form.model.depreciationNo.trim(),
    equipmentId: form.model.equipmentId,
    depreciationMethod: form.model.depreciationMethod,
    depreciationStartDate: form.model.depreciationStartDate,
    originalValue: form.model.originalValue || 0,
    residualRate: form.model.residualRate,
    usefulLifeYears: form.model.usefulLifeYears || 0,
    accumulatedDepreciation: form.model.accumulatedDepreciation,
    netValue: form.model.netValue ?? 0,
    remark: form.model.remark.trim(),
    status: form.model.status
  })
  const handleSubmit = async (): Promise<boolean> => {
    try {
      await formRef.value?.validate()
      await saveEquipmentDepreciation(buildPayload())
      emit('success', form.model.id ? 'edit' : 'add')
      return true
    } catch {
      return false
    }
  }
  const handleOpen = async (data: EquipmentDepreciationDialogOpenData): Promise<void> => {
    await resetForm()
    if (data.row) {
      Object.assign(form.model, {
        id: data.row.id,
        depreciationNo: data.row.depreciationNo,
        equipmentId: data.row.equipmentId,
        equipmentCode: data.row.equipment.equipmentCode,
        depreciationMethod: data.row.depreciationMethod,
        depreciationStartDate: data.row.depreciationStartDate,
        originalValue: Number(data.row.originalValue),
        residualRate: Number(data.row.residualRate),
        usefulLifeYears: Number(data.row.usefulLifeYears),
        accumulatedDepreciation: Number(data.row.accumulatedDepreciation),
        netValue: Number(data.row.netValue),
        remark: data.row.remark || '',
        status: data.row.status
      })
      equipmentSelection.value = [data.row.equipment as unknown as DataSelectRecord]
    }
    await dialogRef.value?.handleOpen(data, {
      title: data.row ? '编辑设备折旧' : '新增设备折旧',
      subtitle: '维护折旧方法、资产价值与折旧期间',
      confirmText: '保存折旧方案',
      contentMaxHeight: 'calc(100vh - 176px)',
      loading: true,
      onOpen: async (_data, api) => {
        try {
          await Promise.all([
            numberRule.loadRule(),
            userStore.ensureDictLoaded('smisEquipmentDepreciationStatus'),
            userStore.ensureDictLoaded('smisEquipmentDepreciationMethod')
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
  .equipment-depreciation-dialog {
    &__context {
      display: grid;
      grid-template-columns: 42px 1fr;
      gap: 12px;
      align-items: center;
      padding: 13px 15px;
      margin-bottom: 18px;
      background: color-mix(in srgb, #10b981 7%, var(--default-box-color));
      border-left: 3px solid #10b981;
      border-radius: 10px;
    }
    &__context > span {
      display: grid;
      place-items: center;
      width: 42px;
      height: 42px;
      color: #059669;
      background: var(--default-box-color);
      border-radius: 10px;
    }
    &__context p {
      margin: 3px 0 0;
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
    &__methods {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      width: 100%;
    }
    &__methods :deep(.el-radio) {
      align-items: flex-start;
      height: auto;
      min-height: 92px;
      padding: 13px;
      margin: 0 10px 0 0;
      white-space: normal;
      border-radius: 10px;
    }
    &__methods :deep(.el-radio:last-child) {
      margin-right: 0;
    }
    &__methods span {
      display: grid;
      gap: 5px;
    }
    &__methods strong {
      color: var(--el-text-color-primary);
    }
    &__methods small {
      line-height: 1.55;
      color: var(--el-text-color-secondary);
    }
    @media (max-width: 760px) {
      &__methods {
        grid-template-columns: 1fr;
        gap: 8px;
      }
      &__methods :deep(.el-radio) {
        margin-right: 0;
      }
    }
  }
</style>
