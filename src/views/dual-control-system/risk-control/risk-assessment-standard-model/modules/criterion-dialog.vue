<template>
  <ArtDialog ref="dialogRef" size="sm"
    ><ArtForm
      ref="formRef"
      v-model="model"
      :items="items"
      :rules="rules"
      :span="24"
      label-position="top"
      :show-reset="false"
      :show-submit="false"
  /></ArtDialog>
</template>
<script setup lang="ts">
  import type { FormRules } from 'element-plus'
  import ArtDialog from '@/components/core/dialogs/art-dialog/index.vue'
  import type { ArtDialogExpose } from '@/components/core/dialogs/art-dialog/types'
  import ArtForm, { type FormItem } from '@/components/core/forms/art-form/index.vue'
  import {
    saveRiskAssessmentCriterion,
    type SmisRiskAssessmentCriterion,
    type SmisRiskAssessmentCriterionPayload,
    type SmisRiskAssessmentDimension
  } from '@smis/api'
  export interface CriterionDialogOpenData {
    row?: SmisRiskAssessmentCriterion
    dimension: SmisRiskAssessmentDimension
    tenantId: string
  }
  interface FormExpose {
    validate: () => Promise<boolean>
    clearValidate: () => void
  }
  const emit = defineEmits<{ success: [] }>()
  const dialogRef = ref<ArtDialogExpose<CriterionDialogOpenData>>()
  const formRef = ref<FormExpose>()
  const initial = (): SmisRiskAssessmentCriterionPayload => ({
    tenantId: null,
    dimensionId: '',
    criterionText: '',
    score: 1,
    sort: 10
  })
  const model = reactive(initial())
  const dimensionName = ref('')
  const items: FormItem[] = [
    {
      label: '判定标准',
      key: 'criterionText',
      type: 'input',
      props: {
        type: 'textarea',
        rows: 4,
        maxlength: 500,
        showWordLimit: true,
        resize: 'none',
        placeholder: '描述该评分对应的判断条件'
      }
    },
    {
      label: '分值',
      key: 'score',
      type: 'number',
      props: { min: 0, max: 1000, precision: 2, controlsPosition: 'right' }
    },
    {
      label: '排序',
      key: 'sort',
      type: 'number',
      props: { min: 0, max: 9999, controlsPosition: 'right' }
    }
  ]
  const rules: FormRules = {
    criterionText: [{ required: true, message: '请输入判定标准', trigger: 'blur' }],
    score: [{ required: true, message: '请输入分值', trigger: 'change' }]
  }
  const submit = async () => {
    try {
      await formRef.value?.validate()
      await saveRiskAssessmentCriterion({ ...model, criterionText: model.criterionText.trim() })
      emit('success')
      return true
    } catch {
      return false
    }
  }
  const handleOpen = async (data: CriterionDialogOpenData) => {
    dimensionName.value = data.dimension.dimensionName
    Object.assign(model, initial(), { tenantId: data.tenantId, dimensionId: data.dimension.id })
    if (data.row)
      Object.assign(model, {
        id: data.row.id,
        tenantId: data.tenantId,
        dimensionId: data.dimension.id,
        criterionText: data.row.criterionText,
        score: data.row.score,
        sort: data.row.sort
      })
    await nextTick()
    formRef.value?.clearValidate()
    await dialogRef.value?.handleOpen(data, {
      title: data.row ? '编辑判定标准' : '新增判定标准',
      subtitle: `${data.dimension.dimensionCode} · ${dimensionName.value}`,
      confirmText: '保存判定标准',
      onConfirm: submit
    })
  }
  defineExpose({ handleOpen })
</script>
