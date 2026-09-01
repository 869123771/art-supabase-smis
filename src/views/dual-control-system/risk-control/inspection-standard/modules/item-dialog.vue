<template>
  <ArtDialog ref="dialogRef" size="md">
    <div class="item-dialog">
      <div class="item-dialog__context"
        ><ArtSvgIcon icon="ri:checkbox-multiple-line" /><div
          ><strong>{{ standardName || '排查标准' }}</strong
          ><p>排查内容将作为后续计划和岗位任务的基础检查口径。</p></div
        ></div
      >
      <ArtForm
        ref="formRef"
        v-model="model"
        :items="items"
        :rules="rules"
        :span="12"
        :gutter="20"
        label-position="top"
        :show-reset="false"
        :show-submit="false"
      />
    </div>
  </ArtDialog>
</template>
<script setup lang="ts">
  import { ElColorPicker, type FormRules } from 'element-plus'
  import ArtDialog from '@/components/core/dialogs/art-dialog/index.vue'
  import type { ArtDialogExpose } from '@/components/core/dialogs/art-dialog/types'
  import ArtForm, { type FormItem } from '@/components/core/forms/art-form/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import { useUserStore } from '@/store/modules/user'
  import {
    saveInspectionItem,
    type SmisInspectionItem,
    type SmisInspectionItemPayload,
    type SmisInspectionStandard
  } from '@smis/api'
  export interface ItemDialogOpenData {
    row?: SmisInspectionItem
    standardId?: string
    tenantId?: string | null
    standards: SmisInspectionStandard[]
  }
  interface FormExpose {
    validate: () => Promise<boolean>
    clearValidate: () => void
  }
  const emit = defineEmits<{ success: [type: 'add' | 'edit'] }>()
  const userStore = useUserStore()
  const { getDictMap } = storeToRefs(userStore)
  const dialogRef = ref<ArtDialogExpose<ItemDialogOpenData>>()
  const formRef = ref<FormExpose>()
  const standards = ref<SmisInspectionStandard[]>([])
  const initial = (): SmisInspectionItemPayload => ({
    tenantId: null,
    standardId: '',
    itemCode: '',
    inspectionContent: '',
    sort: 10,
    textColor: '#334155',
    tagStyle: 'info',
    status: 'enabled'
  })
  const model = reactive(initial())
  const standardName = computed(
    () => standards.value.find((item) => item.id === model.standardId)?.standardName || ''
  )
  const statusOptions = computed(() =>
    (getDictMap.value.smisConfigStatus ?? [])
      .filter((i) => i.value !== 'voided')
      .map((i) => ({ label: i.label || i.name, value: i.value }))
  )
  const tagOptions = computed(() =>
    (getDictMap.value.smisTagStyle ?? []).map((i) => ({ label: i.label || i.name, value: i.value }))
  )
  const items = computed<FormItem[]>(() => [
    {
      label: '关联排查标准',
      key: 'standardId',
      type: 'select',
      span: 24,
      options: standards.value
        .filter((i) => i.status !== 'voided')
        .map((i) => ({ label: `${i.standardName}（${i.standardCode}）`, value: i.id })),
      props: { filterable: true, clearable: false, placeholder: '请选择排查标准' }
    },
    {
      label: '排查内容编号',
      key: 'itemCode',
      type: 'input',
      props: { maxlength: 50, clearable: true, placeholder: '如 FIRE-001' }
    },
    {
      label: '排序',
      key: 'sort',
      type: 'number',
      props: { min: 0, max: 9999, controlsPosition: 'right' }
    },
    {
      label: '排查内容',
      key: 'inspectionContent',
      type: 'input',
      span: 24,
      props: {
        type: 'textarea',
        rows: 4,
        maxlength: 1000,
        showWordLimit: true,
        resize: 'none',
        placeholder: '描述可直接执行、可核验的排查事项'
      }
    },
    {
      label: '文字颜色',
      key: 'textColor',
      render: () =>
        h(ElColorPicker, {
          modelValue: model.textColor,
          predefine: ['#2563EB', '#059669', '#D97706', '#DC2626', '#7C3AED', '#334155'],
          'onUpdate:modelValue': (v: string | null) => (model.textColor = v || '')
        })
    },
    {
      label: '标签样式',
      key: 'tagStyle',
      type: 'select',
      options: tagOptions.value,
      props: { clearable: false }
    },
    {
      label: '状态',
      key: 'status',
      type: 'radioGroup',
      options: statusOptions.value,
      props: { optionType: 'button' }
    }
  ])
  const rules: FormRules = {
    standardId: [{ required: true, message: '请选择排查标准', trigger: 'change' }],
    itemCode: [{ required: true, message: '请输入排查内容编号', trigger: 'blur' }],
    inspectionContent: [{ required: true, message: '请输入排查内容', trigger: 'blur' }],
    tagStyle: [{ required: true, message: '请选择标签样式', trigger: 'change' }],
    status: [{ required: true, message: '请选择状态', trigger: 'change' }]
  }
  const submit = async () => {
    try {
      await formRef.value?.validate()
      await saveInspectionItem({
        ...model,
        itemCode: model.itemCode.trim().toUpperCase(),
        inspectionContent: model.inspectionContent.trim(),
        textColor: model.textColor || null
      })
      emit('success', model.id ? 'edit' : 'add')
      return true
    } catch {
      return false
    }
  }
  const handleOpen = async (data: ItemDialogOpenData) => {
    standards.value = data.standards
    Object.assign(model, initial(), { tenantId: data.tenantId, standardId: data.standardId || '' })
    if (data.row)
      Object.assign(model, {
        id: data.row.id,
        tenantId: data.row.tenantId,
        standardId: data.row.standardId,
        itemCode: data.row.itemCode,
        inspectionContent: data.row.inspectionContent,
        sort: data.row.sort,
        textColor: data.row.textColor || '#334155',
        tagStyle: data.row.tagStyle,
        status: data.row.status === 'voided' ? 'disabled' : data.row.status
      })
    await nextTick()
    formRef.value?.clearValidate()
    await dialogRef.value?.handleOpen(data, {
      title: data.row ? '编辑排查项' : '新增排查项',
      subtitle: '维护排查内容编号、口径与展示状态',
      confirmText: '保存排查项',
      onOpen: async (_d, api) => {
        api.setLoading(true)
        try {
          await Promise.all([
            userStore.ensureDictLoaded('smisConfigStatus'),
            userStore.ensureDictLoaded('smisTagStyle')
          ])
        } finally {
          api.setLoading(false)
        }
      },
      onConfirm: submit
    })
  }
  defineExpose({ handleOpen })
</script>
<style scoped lang="scss">
  .item-dialog__context {
    display: grid;
    grid-template-columns: 38px minmax(0, 1fr);
    gap: 12px;
    align-items: center;
    padding: 12px 14px;
    margin-bottom: 18px;
    background: color-mix(in srgb, var(--theme-color) 7%, var(--default-box-color));
    border-left: 3px solid var(--theme-color);
    border-radius: var(--el-border-radius-base);

    svg {
      font-size: 22px;
      color: var(--theme-color);
    }

    strong {
      color: var(--el-text-color-primary);
    }

    p {
      margin: 3px 0 0;
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }
</style>
