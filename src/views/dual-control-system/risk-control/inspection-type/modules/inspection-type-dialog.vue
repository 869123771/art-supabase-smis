<template>
  <ArtDialog ref="dialogRef" size="md">
    <div class="inspection-type-dialog">
      <div class="inspection-type-dialog__note">
        <ArtSvgIcon icon="ri:price-tag-3-line" />
        <div>
          <strong>租户自定义排查场景</strong>
          <p>编码用于业务规则识别；颜色与标签样式用于任务列表和统计看板中的快速辨识。</p>
        </div>
      </div>
      <ArtForm
        ref="formRef"
        v-model="form.model"
        :items="form.items"
        :rules="form.rules"
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
  import ArtForm, {
    type FormItem,
    type FormItemOption
  } from '@/components/core/forms/art-form/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import { useUserStore } from '@/store/modules/user'
  import {
    saveInspectionType,
    type SmisInspectionType,
    type SmisInspectionTypePayload
  } from '@smis/api'

  export interface InspectionTypeDialogOpenData {
    row?: SmisInspectionType
    tenantId?: string | null
  }

  interface FormExpose {
    validate: () => Promise<boolean>
    clearValidate: () => void
  }

  const emit = defineEmits<{ success: [type: 'add' | 'edit'] }>()
  const userStore = useUserStore()
  const { getDictMap } = storeToRefs(userStore)
  const dialogRef = ref<ArtDialogExpose<InspectionTypeDialogOpenData>>()
  const formRef = ref<FormExpose>()

  const initialForm = (): SmisInspectionTypePayload & { tenantId?: string | null } => ({
    tenantId: null,
    typeCode: '',
    typeName: '',
    sort: 10,
    textColor: '#2563EB',
    tagStyle: 'primary',
    status: 'enabled'
  })

  const statusOptions = computed<FormItemOption[]>(() =>
    (getDictMap.value.smisConfigStatus ?? [])
      .filter((item) => item.value !== 'voided')
      .map((item) => ({ label: item.label || item.name, value: item.value }))
  )
  const tagOptions = computed<FormItemOption[]>(() =>
    (getDictMap.value.smisTagStyle ?? []).map((item) => ({
      label: item.label || item.name,
      value: item.value
    }))
  )

  const form = reactive<{
    model: ReturnType<typeof initialForm>
    items: ComputedRef<FormItem[]>
    rules: FormRules
  }>({
    model: initialForm(),
    items: computed(() => [
      {
        label: '排查类型编号',
        key: 'typeCode',
        type: 'input',
        props: { maxlength: 40, clearable: true, placeholder: '如 DAILY_INSPECTION' }
      },
      {
        label: '排查类型',
        key: 'typeName',
        type: 'input',
        props: { maxlength: 80, clearable: true, placeholder: '如 日常排查' }
      },
      {
        label: '排序',
        key: 'sort',
        type: 'number',
        props: { min: 0, max: 9999, controlsPosition: 'right' }
      },
      {
        label: '文字颜色',
        key: 'textColor',
        render: () =>
          h(ElColorPicker, {
            modelValue: form.model.textColor,
            showAlpha: false,
            predefine: ['#2563EB', '#059669', '#D97706', '#DC2626', '#7C3AED', '#475569'],
            'onUpdate:modelValue': (value: string | null) => (form.model.textColor = value || '')
          })
      },
      {
        label: '标签样式',
        key: 'tagStyle',
        type: 'select',
        options: tagOptions.value,
        props: { clearable: false, placeholder: '请选择标签样式' }
      },
      {
        label: '状态',
        key: 'status',
        type: 'radioGroup',
        options: statusOptions.value,
        props: { optionType: 'button' }
      }
    ]),
    rules: {
      typeCode: [
        { required: true, message: '请输入排查类型编号', trigger: 'blur' },
        {
          pattern: /^[A-Za-z][A-Za-z0-9_]*$/,
          message: '编号须以字母开头，仅支持字母、数字和下划线',
          trigger: 'blur'
        }
      ],
      typeName: [{ required: true, message: '请输入排查类型', trigger: 'blur' }],
      tagStyle: [{ required: true, message: '请选择标签样式', trigger: 'change' }],
      status: [{ required: true, message: '请选择状态', trigger: 'change' }]
    }
  })

  const resetForm = async () => {
    Object.assign(form.model, initialForm())
    await nextTick()
    formRef.value?.clearValidate()
  }

  const handleSubmit = async (): Promise<boolean> => {
    try {
      await formRef.value?.validate()
      await saveInspectionType({
        ...form.model,
        typeCode: form.model.typeCode.trim().toUpperCase(),
        typeName: form.model.typeName.trim(),
        textColor: form.model.textColor || null
      } as SmisInspectionTypePayload)
      emit('success', form.model.id ? 'edit' : 'add')
      return true
    } catch {
      return false
    }
  }

  const handleOpen = async (data: InspectionTypeDialogOpenData) => {
    await resetForm()
    form.model.tenantId = data.tenantId
    if (data.row) {
      Object.assign(form.model, {
        id: data.row.id,
        tenantId: data.row.tenantId,
        typeCode: data.row.typeCode,
        typeName: data.row.typeName,
        sort: data.row.sort,
        textColor: data.row.textColor || '#2563EB',
        tagStyle: data.row.tagStyle,
        status: data.row.status === 'voided' ? 'disabled' : data.row.status
      })
    }
    await dialogRef.value?.handleOpen(data, {
      title: data.row ? '编辑排查类型' : '新增排查类型',
      subtitle: '配置租户可选的排查业务场景与视觉标识',
      confirmText: '保存排查类型',
      onOpen: async (_data, api) => {
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
      onConfirm: handleSubmit
    })
  }

  defineExpose({ handleOpen })
</script>

<style scoped lang="scss">
  .inspection-type-dialog__note {
    display: grid;
    grid-template-columns: 38px minmax(0, 1fr);
    gap: 12px;
    align-items: center;
    padding: 12px 14px;
    margin-bottom: 18px;
    color: var(--el-text-color-regular);
    background: color-mix(in srgb, var(--theme-color) 7%, var(--default-box-color));
    border-left: 3px solid var(--theme-color);
    border-radius: var(--el-border-radius-base);

    > svg {
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
