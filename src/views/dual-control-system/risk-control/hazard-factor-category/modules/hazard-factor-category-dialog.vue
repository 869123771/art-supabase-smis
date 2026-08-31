<template>
  <ArtDialog ref="dialogRef" size="md">
    <div class="hazard-factor-category-dialog">
      <div class="hazard-factor-category-dialog__context" role="note">
        <span aria-hidden="true"><ArtSvgIcon icon="ri:shield-check-line" /></span>
        <div>
          <strong>{{ targetTenantName }} · 风险辨识基础口径</strong>
          <p>因素类型用于一级分组，类别用于具体风险项；禁用后保留历史数据。</p>
        </div>
      </div>

      <div class="hazard-factor-category-dialog__preview" aria-live="polite">
        <span class="hazard-factor-category-dialog__preview-label">标签预览</span>
        <ArtDictDisplay
          v-if="form.model.factorType"
          dict-code="smisHazardFactorType"
          :value="form.model.factorType"
          display="tag"
        />
        <ElTag v-if="form.model.tagStyle" :type="form.model.tagStyle">
          {{ previewName }}
        </ElTag>
        <span
          v-else
          class="hazard-factor-category-dialog__plain-preview"
          :style="{ color: form.model.textColor || undefined }"
        >
          <i :style="{ backgroundColor: form.model.textColor || 'var(--el-color-info)' }" />
          {{ previewName }}
        </span>
        <small>设置标签样式时优先显示标签；未设置时使用文字颜色。</small>
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
        <template #textColor>
          <div class="hazard-factor-category-dialog__color-field">
            <ElColorPicker v-model="form.model.textColor" :predefine="presetColors" />
            <span>{{ form.model.textColor?.toUpperCase() || '未设置颜色' }}</span>
          </div>
        </template>

        <template #tagStyle>
          <ElSelect v-model="form.model.tagStyle" clearable placeholder="请选择标签样式">
            <ElOption
              v-for="option in tagStyleOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            >
              <div class="hazard-factor-category-dialog__tag-option">
                <span>{{ option.label }}</span>
                <ElTag :type="option.value">{{ option.example }}</ElTag>
              </div>
            </ElOption>
          </ElSelect>
        </template>
      </ArtForm>
    </div>
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
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import ArtDictDisplay from '@/components/core/base/art-dict-display/index.vue'
  import { useUserStore } from '@/store/modules/user'
  import { useTenantScopeStore } from '@/store/modules/tenantScope'
  import {
    saveHazardFactorCategory,
    type SmisHazardFactorCategory,
    type SmisHazardFactorCategorySavePayload,
    type SmisHazardFactorCategoryStatus,
    type SmisHazardFactorCategoryTagStyle,
    type SmisHazardFactorType
  } from '@smis/api'

  export interface HazardFactorCategoryDialogOpenData {
    row?: SmisHazardFactorCategory
    tenantId?: string | null
    tenantName: string
  }

  interface HazardFactorCategoryForm {
    id?: string
    tenantId: string
    factorType: SmisHazardFactorType | ''
    categoryCode: string
    categoryName: string
    sort: number
    textColor: string
    tagStyle: SmisHazardFactorCategoryTagStyle
    status: SmisHazardFactorCategoryStatus
  }

  interface FormExpose {
    validate: () => Promise<boolean>
    clearValidate: () => void
  }

  const presetColors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399']
  const tagStyleOptions: Array<{
    label: string
    example: string
    value: Exclude<SmisHazardFactorCategoryTagStyle, ''>
  }> = [
    { label: '主要', example: '主要因素', value: 'primary' },
    { label: '成功', example: '受控因素', value: 'success' },
    { label: '信息', example: '一般因素', value: 'info' },
    { label: '警告', example: '关注因素', value: 'warning' },
    { label: '危险', example: '重点因素', value: 'danger' }
  ]
  const emit = defineEmits<{ success: [type: 'add' | 'edit'] }>()
  const userStore = useUserStore()
  const tenantScopeStore = useTenantScopeStore()
  const { getDictMap, isPlatformSuper } = storeToRefs(userStore)
  const { tenantOptions } = storeToRefs(tenantScopeStore)
  const dialogRef = ref<ArtDialogExpose<HazardFactorCategoryDialogOpenData>>()
  const formRef = ref<FormExpose>()
  const fallbackTenantName = ref('当前租户')
  const isCreating = ref(true)

  const initialForm = (): HazardFactorCategoryForm => ({
    id: undefined,
    tenantId: '',
    factorType: '',
    categoryCode: '',
    categoryName: '',
    sort: 1,
    textColor: '',
    tagStyle: '',
    status: 'enabled'
  })

  const statusOptions = computed<FormItemOption[]>(() =>
    (getDictMap.value.smisHazardFactorCategoryStatus ?? []).map((item) => ({
      label: item.label || item.name,
      value: item.value
    }))
  )

  const factorTypeOptions = computed<FormItemOption[]>(() =>
    (getDictMap.value.smisHazardFactorType ?? []).map((item) => ({
      label: item.label || item.name,
      value: item.value
    }))
  )

  const form = reactive<{
    model: HazardFactorCategoryForm
    items: ComputedRef<FormItem[]>
    rules: FormRules<HazardFactorCategoryForm>
  }>({
    model: initialForm(),
    items: computed(() => [
      ...(isPlatformSuper.value && isCreating.value
        ? [
            {
              label: '所属租户',
              key: 'tenantId',
              type: 'select' as const,
              options: tenantOptions.value.map((tenant) => ({
                label: `${tenant.tenantName}（${tenant.tenantCode}）`,
                value: tenant.id
              })),
              props: {
                clearable: false,
                filterable: true,
                placeholder: '请选择新增记录所属租户'
              },
              span: 24
            }
          ]
        : []),
      {
        label: '因素类型',
        key: 'factorType',
        type: 'select',
        options: factorTypeOptions.value,
        props: { clearable: false, placeholder: '请选择人的、物的、环境或管理因素' }
      },
      {
        label: '危害因素类别编号',
        key: 'categoryCode',
        type: 'input',
        props: { maxlength: 20, clearable: true, placeholder: '如 1、HF-001' }
      },
      {
        label: '危害因素类别',
        key: 'categoryName',
        type: 'input',
        span: 24,
        props: { maxlength: 200, clearable: true, placeholder: '请输入具体危害因素类别' }
      },
      {
        label: '排序',
        key: 'sort',
        type: 'number',
        help: '数值越小，在风险辨识选项中越靠前',
        props: { min: 0, max: 9999, controlsPosition: 'right', placeholder: '请输入排序' }
      },
      {
        label: '状态',
        key: 'status',
        type: 'radioGroup',
        options: statusOptions.value
      },
      { label: '文字颜色', key: 'textColor' },
      { label: '标签样式', key: 'tagStyle' }
    ]),
    rules: {
      tenantId: [{ required: true, message: '请选择所属租户', trigger: 'change' }],
      factorType: [{ required: true, message: '请选择因素类型', trigger: 'change' }],
      categoryCode: [
        { required: true, message: '请输入危害因素类别编号', trigger: 'blur' },
        {
          pattern: /^[A-Za-z0-9][A-Za-z0-9_-]{0,19}$/,
          message: '编号仅支持字母、数字、连字符和下划线，且不能以符号开头',
          trigger: 'blur'
        }
      ],
      categoryName: [
        { required: true, message: '请输入危害因素类别', trigger: 'blur' },
        { max: 200, message: '危害因素类别不能超过 200 个字符', trigger: 'blur' }
      ],
      sort: [{ required: true, message: '请输入排序', trigger: 'change' }],
      textColor: [
        {
          pattern: /^(#[0-9A-Fa-f]{6})?$/,
          message: '文字颜色须为 6 位十六进制颜色值',
          trigger: 'change'
        }
      ],
      status: [{ required: true, message: '请选择状态', trigger: 'change' }]
    }
  })

  const previewName = computed(() => form.model.categoryName.trim() || '危害因素类别预览')
  const targetTenantName = computed(
    () =>
      tenantOptions.value.find((tenant) => tenant.id === form.model.tenantId)?.tenantName ||
      fallbackTenantName.value
  )

  const resetForm = async (): Promise<void> => {
    Object.assign(form.model, initialForm())
    isCreating.value = true
    await nextTick()
    formRef.value?.clearValidate()
  }

  const handleSubmit = async (): Promise<boolean> => {
    try {
      await formRef.value?.validate()
      const factorType = form.model.factorType
      if (!factorType) return false
      const payload: SmisHazardFactorCategorySavePayload = {
        id: form.model.id,
        tenantId: form.model.tenantId,
        factorType,
        categoryCode: form.model.categoryCode.trim().toUpperCase(),
        categoryName: form.model.categoryName.trim(),
        sort: form.model.sort,
        textColor: form.model.textColor || null,
        tagStyle: form.model.tagStyle,
        status: form.model.status
      }
      await saveHazardFactorCategory(payload)
      emit('success', form.model.id ? 'edit' : 'add')
      return true
    } catch {
      return false
    }
  }

  const handleOpen = async (data: HazardFactorCategoryDialogOpenData): Promise<void> => {
    await resetForm()
    fallbackTenantName.value = data.tenantName
    form.model.tenantId = data.tenantId || ''
    if (data.row) {
      isCreating.value = false
      Object.assign(form.model, {
        id: data.row.id,
        tenantId: data.row.tenantId,
        factorType: data.row.factorType,
        categoryCode: data.row.categoryCode,
        categoryName: data.row.categoryName,
        sort: data.row.sort,
        textColor: data.row.textColor || '',
        tagStyle: data.row.tagStyle,
        status: data.row.status
      })
    }

    await dialogRef.value?.handleOpen(data, {
      title: data.row ? '编辑危害因素类别' : '新增危害因素类别',
      subtitle: '选择因素类型，并维护具体类别、排序、视觉标识与启停状态',
      confirmText: '保存危害因素类别',
      onOpen: async (_openData, api) => {
        api.setLoading(true)
        try {
          await Promise.all([
            userStore.ensureDictLoaded('smisHazardFactorCategoryStatus'),
            userStore.ensureDictLoaded('smisHazardFactorType'),
            isPlatformSuper.value ? tenantScopeStore.loadTenantOptions() : Promise.resolve()
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
  .hazard-factor-category-dialog {
    &__context {
      display: grid;
      grid-template-columns: 40px minmax(0, 1fr);
      gap: 12px;
      align-items: center;
      padding: 12px 14px;
      margin-bottom: 12px;
      background: color-mix(in srgb, var(--theme-color) 7%, var(--default-box-color));
      border-left: 3px solid var(--theme-color);
      border-radius: var(--el-border-radius-base);

      > span {
        display: grid;
        place-items: center;
        width: 40px;
        height: 40px;
        color: var(--theme-color);
        background: var(--default-box-color);
        border-radius: var(--el-border-radius-base);
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

    &__preview {
      display: flex;
      gap: 10px;
      align-items: center;
      min-width: 0;
      padding: 10px 14px;
      margin-bottom: 18px;
      background: var(--art-gray-100);
      border-radius: var(--el-border-radius-base);

      small {
        min-width: 0;
        margin-left: auto;
        color: var(--el-text-color-secondary);
      }
    }

    &__preview-label {
      flex: 0 0 auto;
      font-size: 12px;
      font-weight: 600;
      color: var(--el-text-color-secondary);
    }

    &__plain-preview,
    &__color-field {
      display: inline-flex;
      gap: 8px;
      align-items: center;
    }

    &__plain-preview {
      min-width: 0;
      font-weight: 600;

      i {
        flex: 0 0 auto;
        width: 10px;
        height: 10px;
        border-radius: 50%;
      }
    }

    &__color-field {
      min-height: 32px;

      span {
        font-family: var(--art-font-family-mono, Consolas, monospace);
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }

    &__tag-option {
      display: flex;
      gap: 16px;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }

    @media only screen and (width <= 720px) {
      &__preview {
        flex-wrap: wrap;

        small {
          flex-basis: 100%;
          margin-left: 0;
        }
      }
    }
  }
</style>
