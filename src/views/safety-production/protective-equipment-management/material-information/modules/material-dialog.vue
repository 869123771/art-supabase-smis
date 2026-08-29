<template>
  <ArtDialog ref="dialogRef" size="xl">
    <div class="material-dialog">
      <div class="material-dialog__context" role="note">
        <span aria-hidden="true"><ArtSvgIcon icon="ri:archive-stack-line" /></span>
        <div>
          <strong>维护物料主数据</strong>
          <p>编码用于唯一识别；类别、单位、类型和来源均使用系统统一字典。</p>
        </div>
      </div>
      <ArtForm
        ref="formRef"
        v-model="form.model"
        :items="form.items"
        :rules="form.rules"
        :span="8"
        :gutter="24"
        label-position="top"
        :show-reset="false"
        :show-submit="false"
      >
        <template #imageUrls>
          <ArtUploadImage
            v-model="form.model.imageUrls"
            title="上传物料图片"
            multiple
            :limit="5"
            :size="108"
          />
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
  import ArtUploadImage from '@/components/core/forms/art-upload-image/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import { useUserStore } from '@/store/modules/user'
  import TreeUtils from '@/utils/tree'
  import {
    saveMaterial,
    type SmisMaterial,
    type SmisMaterialCategory,
    type SmisMaterialSavePayload,
    type SmisMaterialSource,
    type SmisMaterialStatus,
    type SmisMaterialType
  } from '@smis/api'

  interface CategoryTreeOption extends SmisMaterialCategory {
    categoryLabel: string
    disabled?: boolean
    children?: CategoryTreeOption[]
  }
  export interface MaterialDialogOpenData {
    row?: SmisMaterial
    categoryTree: SmisMaterialCategory[]
    presetCategoryId?: string
  }
  interface MaterialForm {
    id?: string
    categoryId?: string
    materialCode: string
    materialName: string
    specificationModel: string
    drawingNo: string
    basicUnit: string
    materialType: SmisMaterialType | ''
    materialSource: SmisMaterialSource | ''
    brand: string
    materialComposition: string
    placeOfOrigin: string
    imageUrls: string[]
    description: string
    status: SmisMaterialStatus
    sort: number
  }
  interface FormExpose {
    validate: () => Promise<boolean>
    clearValidate: () => void
  }
  const emit = defineEmits<{ success: [type: 'add' | 'edit'] }>()
  const userStore = useUserStore()
  const treeUtils = new TreeUtils({ idKey: 'id', parentKey: 'parentId', childrenKey: 'children' })
  const { getDictMap } = storeToRefs(userStore)
  const dialogRef = ref<ArtDialogExpose<MaterialDialogOpenData>>()
  const formRef = ref<FormExpose>()
  const categoryTree = ref<SmisMaterialCategory[]>([])
  const initialForm = (): MaterialForm => ({
    id: undefined,
    categoryId: undefined,
    materialCode: '',
    materialName: '',
    specificationModel: '',
    drawingNo: '',
    basicUnit: '',
    materialType: '',
    materialSource: '',
    brand: '',
    materialComposition: '',
    placeOfOrigin: '',
    imageUrls: [],
    description: '',
    status: 'enabled',
    sort: 10
  })
  const formModel = reactive<MaterialForm>(initialForm())
  const toOptions = (code: string): FormItemOption[] =>
    (getDictMap.value[code] ?? []).map((item) => ({
      label: item.label || item.name,
      value: item.value
    }))
  const categoryOptions = computed<CategoryTreeOption[]>(() =>
    treeUtils.mapTree(categoryTree.value as CategoryTreeOption[], (item) => ({
      ...item,
      categoryLabel: `${item.categoryName} · ${item.categoryCode}${item.status === 'disabled' ? '（停用）' : ''}`,
      disabled: item.status === 'disabled' && item.id !== formModel.categoryId
    }))
  )
  const form = reactive<{
    model: MaterialForm
    items: ComputedRef<FormItem[]>
    rules: FormRules<MaterialForm>
  }>({
    model: formModel,
    items: computed(() => [
      {
        label: '物料编码',
        key: 'materialCode',
        type: 'input',
        props: { maxlength: 60, clearable: true, placeholder: '如 PPE-HELMET-001' }
      },
      {
        label: '物料名称',
        key: 'materialName',
        type: 'input',
        props: { maxlength: 120, clearable: true, placeholder: '如 ABS 安全帽' }
      },
      {
        label: '物料类别',
        key: 'categoryId',
        type: 'treeSelect',
        props: {
          data: categoryOptions.value,
          clearable: true,
          filterable: true,
          checkStrictly: true,
          nodeKey: 'id',
          defaultExpandAll: true,
          placeholder: '请选择物料类别',
          props: { label: 'categoryLabel', value: 'id', children: 'children', disabled: 'disabled' }
        }
      },
      {
        label: '规格型号',
        key: 'specificationModel',
        type: 'input',
        props: { maxlength: 120, clearable: true, placeholder: '输入规格或型号' }
      },
      {
        label: '图号',
        key: 'drawingNo',
        type: 'input',
        props: { maxlength: 80, clearable: true, placeholder: '无图号可不填' }
      },
      {
        label: '基本单位',
        key: 'basicUnit',
        type: 'select',
        options: toOptions('smisMaterialUnit'),
        props: { clearable: false, filterable: true, placeholder: '请选择计量单位' }
      },
      {
        label: '物料类型',
        key: 'materialType',
        type: 'select',
        options: toOptions('smisMaterialType'),
        props: { clearable: false, placeholder: '请选择物料类型' }
      },
      {
        label: '物料来源',
        key: 'materialSource',
        type: 'select',
        options: toOptions('smisMaterialSource'),
        props: { clearable: false, placeholder: '请选择物料来源' }
      },
      {
        label: '品牌',
        key: 'brand',
        type: 'input',
        props: { maxlength: 80, clearable: true, placeholder: '输入品牌' }
      },
      {
        label: '材质',
        key: 'materialComposition',
        type: 'input',
        props: { maxlength: 120, clearable: true, placeholder: '输入主要材质' }
      },
      {
        label: '产地',
        key: 'placeOfOrigin',
        type: 'input',
        props: { maxlength: 120, clearable: true, placeholder: '输入产地' }
      },
      {
        label: '启用状态',
        key: 'status',
        type: 'select',
        options: toOptions('smisMaterialEnableStatus'),
        props: { clearable: false, placeholder: '请选择启用状态' }
      },
      {
        label: '显示顺序',
        key: 'sort',
        type: 'number',
        props: {
          min: 0,
          max: 999999,
          step: 1,
          precision: 0,
          controlsPosition: 'right',
          class: '!w-full'
        }
      },
      { label: '物料图片', key: 'imageUrls', type: 'text', span: 24 },
      {
        label: '说明',
        key: 'description',
        type: 'input',
        span: 24,
        props: {
          type: 'textarea',
          rows: 4,
          maxlength: 1000,
          showWordLimit: true,
          resize: 'none',
          placeholder: '补充物料用途、选型要求或保管说明'
        }
      }
    ]),
    rules: {
      materialCode: [
        { required: true, message: '请输入物料编码', trigger: 'blur' },
        { max: 60, message: '物料编码不能超过 60 个字符', trigger: 'blur' }
      ],
      materialName: [
        { required: true, message: '请输入物料名称', trigger: 'blur' },
        { max: 120, message: '物料名称不能超过 120 个字符', trigger: 'blur' }
      ],
      categoryId: [{ required: true, message: '请选择物料类别', trigger: 'change' }],
      basicUnit: [{ required: true, message: '请选择基本单位', trigger: 'change' }],
      materialType: [{ required: true, message: '请选择物料类型', trigger: 'change' }],
      materialSource: [{ required: true, message: '请选择物料来源', trigger: 'change' }],
      status: [{ required: true, message: '请选择启用状态', trigger: 'change' }],
      sort: [{ required: true, message: '请输入显示顺序', trigger: 'change' }]
    }
  })
  const resetForm = async (): Promise<void> => {
    Object.assign(form.model, initialForm())
    categoryTree.value = []
    await nextTick()
    formRef.value?.clearValidate()
  }
  const handleSubmit = async (): Promise<boolean> => {
    try {
      await formRef.value?.validate()
      const payload: SmisMaterialSavePayload = {
        id: form.model.id,
        categoryId: form.model.categoryId || '',
        materialCode: form.model.materialCode.trim().toUpperCase(),
        materialName: form.model.materialName.trim(),
        specificationModel: form.model.specificationModel.trim(),
        drawingNo: form.model.drawingNo.trim(),
        basicUnit: form.model.basicUnit,
        materialType: form.model.materialType as SmisMaterialType,
        materialSource: form.model.materialSource as SmisMaterialSource,
        brand: form.model.brand.trim(),
        materialComposition: form.model.materialComposition.trim(),
        placeOfOrigin: form.model.placeOfOrigin.trim(),
        imageUrls: [...form.model.imageUrls],
        description: form.model.description.trim(),
        status: form.model.status,
        sort: Number(form.model.sort || 0)
      }
      await saveMaterial(payload)
      emit('success', form.model.id ? 'edit' : 'add')
      return true
    } catch {
      return false
    }
  }
  const handleOpen = async (data: MaterialDialogOpenData): Promise<void> => {
    await resetForm()
    categoryTree.value = data.categoryTree
    if (data.row)
      Object.assign(form.model, {
        id: data.row.id,
        categoryId: data.row.categoryId,
        materialCode: data.row.materialCode,
        materialName: data.row.materialName,
        specificationModel: data.row.specificationModel || '',
        drawingNo: data.row.drawingNo || '',
        basicUnit: data.row.basicUnit,
        materialType: data.row.materialType,
        materialSource: data.row.materialSource,
        brand: data.row.brand || '',
        materialComposition: data.row.materialComposition || '',
        placeOfOrigin: data.row.placeOfOrigin || '',
        imageUrls: [...(data.row.imageUrls || [])],
        description: data.row.description || '',
        status: data.row.status,
        sort: data.row.sort
      })
    else form.model.categoryId = data.presetCategoryId
    await dialogRef.value?.handleOpen(data, {
      title: data.row ? '编辑物料信息' : '新增物料信息',
      subtitle: '维护物料编码、分类、规格、单位和来源',
      confirmText: '保存物料信息',
      contentMaxHeight: '74vh',
      onOpen: async (_openData, api) => {
        api.setLoading(true)
        try {
          await Promise.all(
            [
              'smisMaterialEnableStatus',
              'smisMaterialType',
              'smisMaterialSource',
              'smisMaterialUnit'
            ].map((code) => userStore.ensureDictLoaded(code))
          )
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
  .material-dialog {
    &__context {
      display: grid;
      grid-template-columns: 40px minmax(0, 1fr);
      gap: 12px;
      align-items: center;
      padding: 12px 14px;
      margin-bottom: 18px;
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
  }
</style>
