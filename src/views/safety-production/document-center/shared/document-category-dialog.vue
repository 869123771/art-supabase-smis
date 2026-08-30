<template>
  <ArtDialog ref="dialogRef" size="md">
    <div class="document-category-dialog">
      <div class="document-category-dialog__context">
        <span aria-hidden="true"><ArtSvgIcon icon="ri:folder-settings-line" /></span>
        <div>
          <strong>维护清晰稳定的分类层级</strong>
          <p>同一上级下分类名称不可重复，移动分类会保留下级和文档归属。</p>
        </div>
      </div>

      <ArtForm
        ref="formRef"
        v-model="form"
        :items="items"
        :rules="rules"
        :span="12"
        :gutter="24"
        label-position="top"
        :show-reset="false"
        :show-submit="false"
      >
        <template #parentId>
          <ElTreeSelect
            v-model="form.parentId"
            :data="categories"
            :props="categoryProps"
            node-key="id"
            value-key="id"
            check-strictly
            default-expand-all
            filterable
            clearable
            class="w-full"
            placeholder="留空表示一级分类"
          />
        </template>
      </ArtForm>
    </div>
  </ArtDialog>
</template>

<script setup lang="ts">
  import type { FormRules } from 'element-plus'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import ArtDialog from '@/components/core/dialogs/art-dialog/index.vue'
  import type { ArtDialogExpose } from '@/components/core/dialogs/art-dialog/types'
  import ArtForm, { type FormItem } from '@/components/core/forms/art-form/index.vue'
  import {
    saveDocumentCategory,
    type SmisDocumentCategory,
    type SmisDocumentCategorySavePayload
  } from '@smis/api'

  export interface DocumentCategoryDialogOpenData {
    categories: SmisDocumentCategory[]
    row?: SmisDocumentCategory
    parentId?: string
  }

  interface FormExpose {
    validate: () => Promise<boolean>
    clearValidate: () => void
  }

  const emit = defineEmits<{ success: [] }>()
  const dialogRef = ref<ArtDialogExpose<DocumentCategoryDialogOpenData>>()
  const formRef = ref<FormExpose>()
  const categories = shallowRef<SmisDocumentCategory[]>([])
  const categoryProps = { label: 'categoryName', children: 'children' }
  const initial = (): SmisDocumentCategorySavePayload => ({
    parentId: null,
    categoryName: '',
    sort: 10,
    status: 'enabled',
    description: ''
  })
  const form = reactive<SmisDocumentCategorySavePayload>(initial())
  const items: FormItem[] = [
    {
      label: '分类名称',
      key: 'categoryName',
      type: 'input',
      span: 12,
      props: { maxlength: 100, showWordLimit: true, placeholder: '请输入分类名称' }
    },
    { label: '上级分类', key: 'parentId', type: 'text', span: 12 },
    {
      label: '排序权重',
      key: 'sort',
      type: 'number',
      span: 12,
      description: '数值越小越靠前，仅用于分类树排序。',
      props: { min: 0, max: 999999, step: 10, controlsPosition: 'right', class: '!w-full' }
    },
    {
      label: '启用状态',
      key: 'status',
      type: 'switch',
      span: 12,
      props: {
        activeValue: 'enabled',
        inactiveValue: 'disabled',
        activeText: '启用',
        inactiveText: '停用',
        inlinePrompt: true
      }
    },
    {
      label: '分类说明',
      key: 'description',
      type: 'textarea',
      span: 24,
      props: {
        rows: 4,
        maxlength: 1000,
        showWordLimit: true,
        resize: 'none',
        placeholder: '说明该分类收录范围，便于维护人员保持一致口径'
      }
    }
  ]
  const rules: FormRules<SmisDocumentCategorySavePayload> = {
    categoryName: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
    sort: [{ required: true, message: '请输入排序权重', trigger: 'change' }]
  }

  const handleSubmit = async (): Promise<boolean> => {
    try {
      await formRef.value?.validate()
      await saveDocumentCategory({
        ...toRaw(form),
        parentId: form.parentId || null,
        categoryName: form.categoryName.trim(),
        description: form.description?.trim() || null
      })
      emit('success')
      return true
    } catch {
      return false
    }
  }

  const handleOpen = async (data: DocumentCategoryDialogOpenData): Promise<void> => {
    Object.assign(form, initial())
    categories.value = data.categories
    if (data.row) {
      Object.assign(form, {
        id: data.row.id,
        parentId: data.row.parentId || null,
        categoryName: data.row.categoryName,
        sort: data.row.sort,
        status: data.row.status,
        description: data.row.description || ''
      })
    } else if (data.parentId) {
      form.parentId = data.parentId
    }
    await nextTick()
    formRef.value?.clearValidate()
    await dialogRef.value?.handleOpen(data, {
      title: data.row ? '编辑文档分类' : '新增文档分类',
      subtitle: '分类树由当前租户统一维护，并供各类文档台账参选',
      confirmText: data.row ? '保存分类更改' : '创建分类',
      contentMaxHeight: 'calc(100vh - 180px)',
      onConfirm: handleSubmit
    })
  }

  defineExpose({ handleOpen })
</script>

<style scoped lang="scss">
  .document-category-dialog {
    &__context {
      display: grid;
      grid-template-columns: 44px minmax(0, 1fr);
      gap: 12px;
      align-items: center;
      padding: 14px 16px;
      margin-bottom: 18px;
      background: color-mix(in srgb, var(--theme-color) 7%, var(--default-box-color));
      border-left: 3px solid var(--theme-color);
      border-radius: var(--el-border-radius-base);

      > span {
        display: grid;
        place-items: center;
        width: 44px;
        height: 44px;
        color: var(--theme-color);
        background: var(--default-box-color);
        border-radius: var(--el-border-radius-base);
      }

      p {
        margin: 3px 0 0;
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }
  }
</style>
