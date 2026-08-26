<template>
  <ArtDialog ref="dialogRef" size="lg">
    <ArtForm
      ref="formRef"
      v-model="form"
      :items="formItems"
      :rules="formRules"
      :span="12"
      :gutter="24"
      label-position="top"
      :show-reset="false"
      :show-submit="false"
    >
      <template #context>
        <div class="risk-dialog__context">
          <span class="risk-dialog__context-icon" aria-hidden="true">
            <ArtSvgIcon icon="ri:shield-check-line" />
          </span>
          <div class="risk-dialog__context-copy">
            <small>当前维护岗位</small>
            <strong>{{ context.positionName || '未选择岗位' }}</strong>
            <div>
              <span><ArtSvgIcon icon="ri:node-tree" />{{ context.organizationName }}</span>
              <span translate="no"><ArtSvgIcon icon="ri:hashtag" />{{ context.positionCode }}</span>
            </div>
          </div>
          <span class="risk-dialog__source"><ArtSvgIcon icon="ri:link-m" />关联 HR 岗位</span>
        </div>
      </template>
    </ArtForm>
  </ArtDialog>
</template>

<script setup lang="ts">
  import { computed, nextTick, reactive, ref, toRaw } from 'vue'
  import { storeToRefs } from 'pinia'
  import type { FormRules } from 'element-plus'
  import ArtDialog from '@/components/core/dialogs/art-dialog/index.vue'
  import type { ArtDialogExpose } from '@/components/core/dialogs/art-dialog/types'
  import ArtForm, {
    type FormItem,
    type FormItemOption
  } from '@/components/core/forms/art-form/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import { useUserStore } from '@/store/modules/user'
  import { findDictionaryItem, getChildDictionaryItems } from '@smis/domain/hazard-dictionary'
  import {
    addPositionRiskControl,
    editPositionRiskControl,
    type PositionRiskControl,
    type PositionRiskControlSavePayload
  } from '@smis/api'

  const DICTIONARY_CODES = [
    'smisControlLevel',
    'smisControlMeasureCategory',
    'smisPrimaryHazardCategory',
    'smisSecondaryHazardCategory',
    'smisHazardLevel'
  ] as const

  export interface RiskControlDialogOpenData {
    organizationId: string
    organizationName: string
    positionId: string
    positionName: string
    positionCode: string
    row?: PositionRiskControl
  }

  interface DialogFormExpose {
    validate: () => Promise<boolean>
    clearValidate: () => void
  }

  const emit = defineEmits<{ success: [type: 'add' | 'edit'] }>()
  const userStore = useUserStore()
  const { getDictMap } = storeToRefs(userStore)
  const dialogRef = ref<ArtDialogExpose<RiskControlDialogOpenData>>()
  const formRef = ref<DialogFormExpose>()
  const context = reactive({ organizationName: '', positionName: '', positionCode: '' })

  const createInitialForm = (): PositionRiskControl => ({
    organizationId: '',
    positionId: '',
    hazardFactor: '',
    controlMeasure: '',
    controlMeasureCategory: 'engineering',
    controlLevel: 'team',
    standardBasis: '',
    failureMode: '',
    primaryHazardCategory: 'basic_management',
    secondaryHazardCategory: 'safety_rules',
    hazardLevel: 'general_d',
    isSpecialEquipment: false
  })
  const form = reactive<PositionRiskControl>(createInitialForm())

  const toOptions = (code: string): FormItemOption[] =>
    (getDictMap.value[code] ?? []).map((item) => ({
      label: item.label || item.name,
      value: item.value
    }))
  const primaryCategoryItems = computed(() => getDictMap.value.smisPrimaryHazardCategory ?? [])
  const secondaryCategoryItems = computed(() => getDictMap.value.smisSecondaryHazardCategory ?? [])
  const selectedPrimaryCategory = computed(() =>
    findDictionaryItem(primaryCategoryItems.value, form.primaryHazardCategory)
  )
  const secondaryCategoryOptions = computed<FormItemOption[]>(() => {
    return getChildDictionaryItems(secondaryCategoryItems.value, selectedPrimaryCategory.value).map(
      (item) => ({ label: item.label || item.name, value: item.value })
    )
  })

  const requiredTextRule = (label: string, max: number) => [
    { required: true, message: `请输入${label}`, trigger: 'blur' },
    { max, message: `${label}不能超过 ${max} 个字符`, trigger: 'blur' }
  ]
  const formRules = computed<FormRules<PositionRiskControl>>(() => ({
    hazardFactor: requiredTextRule('危害因素', 1000),
    controlMeasure: requiredTextRule('管控措施', 2000),
    controlMeasureCategory: [{ required: true, message: '请选择管控措施类别', trigger: 'change' }],
    controlLevel: [{ required: true, message: '请选择防控级别', trigger: 'change' }],
    standardBasis: requiredTextRule('标准依据', 1000),
    failureMode: requiredTextRule('失效形式', 1000),
    primaryHazardCategory: [{ required: true, message: '请选择一级隐患类别', trigger: 'change' }],
    secondaryHazardCategory: [{ required: true, message: '请选择二级隐患类别', trigger: 'change' }],
    hazardLevel: [{ required: true, message: '请选择隐患级别', trigger: 'change' }]
  }))

  const formItems = computed<FormItem[]>(() => [
    { label: '适用岗位', key: 'context', type: 'text', span: 24 },
    { label: '危害与管控', key: 'controlSection', type: 'divider', span: 24 },
    {
      label: '危害因素',
      key: 'hazardFactor',
      type: 'input',
      span: 24,
      props: {
        type: 'textarea',
        rows: 3,
        maxlength: 1000,
        showWordLimit: true,
        placeholder: '描述岗位可能导致事故或职业伤害的危害因素'
      }
    },
    {
      label: '管控措施',
      key: 'controlMeasure',
      type: 'input',
      span: 24,
      props: {
        type: 'textarea',
        rows: 4,
        maxlength: 2000,
        showWordLimit: true,
        placeholder: '填写具体、可执行、可检查的控制措施'
      }
    },
    {
      label: '管控措施类别',
      key: 'controlMeasureCategory',
      type: 'select',
      options: toOptions('smisControlMeasureCategory'),
      props: { placeholder: '请选择管控措施类别' }
    },
    {
      label: '防控级别',
      key: 'controlLevel',
      type: 'select',
      options: toOptions('smisControlLevel'),
      props: { placeholder: '请选择防控级别' }
    },
    { label: '依据与失效', key: 'basisSection', type: 'divider', span: 24 },
    {
      label: '标准依据',
      key: 'standardBasis',
      type: 'input',
      span: 24,
      props: {
        type: 'textarea',
        rows: 3,
        maxlength: 1000,
        showWordLimit: true,
        placeholder: '填写法律法规、制度、规程或技术标准名称及条款'
      }
    },
    {
      label: '失效形式',
      key: 'failureMode',
      type: 'input',
      span: 24,
      props: {
        type: 'textarea',
        rows: 3,
        maxlength: 1000,
        showWordLimit: true,
        placeholder: '描述措施缺失、失效或执行不到位时的表现'
      }
    },
    { label: '隐患分类', key: 'categorySection', type: 'divider', span: 24 },
    {
      label: '一级隐患类别',
      key: 'primaryHazardCategory',
      type: 'select',
      options: toOptions('smisPrimaryHazardCategory'),
      props: {
        placeholder: '请选择一级隐患类别',
        onChange: () => {
          form.secondaryHazardCategory = ''
        }
      }
    },
    {
      label: '二级隐患类别',
      key: 'secondaryHazardCategory',
      type: 'select',
      options: secondaryCategoryOptions.value,
      props: {
        disabled: !form.primaryHazardCategory,
        placeholder: form.primaryHazardCategory ? '请选择二级隐患类别' : '请先选择一级类别'
      }
    },
    {
      label: '隐患级别',
      key: 'hazardLevel',
      type: 'select',
      options: toOptions('smisHazardLevel'),
      props: { placeholder: '请选择隐患级别' }
    },
    {
      label: '是否特种设备',
      key: 'isSpecialEquipment',
      type: 'radioGroup',
      options: [
        { label: '否', value: false },
        { label: '是', value: true }
      ],
      props: { optionType: 'button' }
    }
  ])

  const resetForm = async (): Promise<void> => {
    Object.assign(form, createInitialForm())
    Object.assign(context, { organizationName: '', positionName: '', positionCode: '' })
    await nextTick()
    formRef.value?.clearValidate()
  }
  const buildPayload = (): PositionRiskControlSavePayload => ({
    organizationId: form.organizationId,
    positionId: form.positionId,
    hazardFactor: form.hazardFactor.trim(),
    controlMeasure: form.controlMeasure.trim(),
    controlMeasureCategory: form.controlMeasureCategory,
    controlLevel: form.controlLevel,
    standardBasis: form.standardBasis.trim(),
    failureMode: form.failureMode.trim(),
    primaryHazardCategory: form.primaryHazardCategory,
    secondaryHazardCategory: form.secondaryHazardCategory,
    hazardLevel: form.hazardLevel,
    isSpecialEquipment: Boolean(form.isSpecialEquipment)
  })
  const handleSubmit = async (): Promise<boolean> => {
    try {
      await formRef.value?.validate()
      const type = form.id ? 'edit' : 'add'
      if (type === 'edit') await editPositionRiskControl(form.id!, buildPayload())
      else await addPositionRiskControl(buildPayload())
      emit('success', type)
      return true
    } catch {
      return false
    }
  }
  const handleOpen = async (data: RiskControlDialogOpenData): Promise<void> => {
    await resetForm()
    Object.assign(context, data)
    Object.assign(form, {
      ...createInitialForm(),
      organizationId: data.organizationId,
      positionId: data.positionId,
      ...(data.row ? structuredClone(toRaw(data.row)) : {})
    })
    await dialogRef.value?.handleOpen(data, {
      title: data.row ? '编辑隐患控制措施' : '新增隐患控制措施',
      subtitle: `${data.organizationName} · ${data.positionName}`,
      confirmText: data.row ? '保存更改' : '新增措施',
      contentMaxHeight: 'calc(100vh - 184px)',
      onOpen: async (_data, api) => {
        const missingCodes = DICTIONARY_CODES.filter(
          (code) => !(getDictMap.value[code]?.length ?? 0)
        )
        if (!missingCodes.length) return
        api.setLoading(true)
        try {
          await Promise.all(missingCodes.map((code) => userStore.ensureDictLoaded(code)))
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
  .risk-dialog {
    &__context {
      display: flex;
      gap: 12px;
      align-items: center;
      width: 100%;
      min-width: 0;
      padding: 12px 14px;
      background: var(--art-gray-100);
      border: 1px solid var(--el-border-color-lighter);
      border-radius: var(--el-border-radius-base);
    }

    &__context-icon {
      display: inline-flex;
      flex: 0 0 42px;
      align-items: center;
      justify-content: center;
      width: 42px;
      height: 42px;
      color: var(--theme-color);
      background: color-mix(in srgb, var(--theme-color) 10%, var(--default-box-color));
      border-radius: var(--el-border-radius-base);
    }

    &__context-copy {
      display: grid;
      flex: 1;
      min-width: 0;

      > small {
        font-size: 11px;
        color: var(--el-text-color-secondary);
      }

      > strong {
        margin: 2px 0 4px;
        color: var(--el-text-color-primary);
      }

      > div {
        display: flex;
        flex-wrap: wrap;
        gap: 6px 16px;
      }

      span {
        display: inline-flex;
        gap: 5px;
        align-items: center;
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }

    &__source {
      display: inline-flex;
      flex: none;
      gap: 5px;
      align-items: center;
      padding: 5px 9px;
      font-size: 11px;
      color: var(--el-color-success-dark-2);
      background: var(--el-color-success-light-9);
      border-radius: 999px;
    }

    @media (width <= 640px) {
      &__source {
        display: none;
      }
    }
  }
</style>
