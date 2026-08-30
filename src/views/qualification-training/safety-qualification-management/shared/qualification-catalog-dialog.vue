<template>
  <ArtDialog ref="dialogRef" size="md">
    <div class="qualification-catalog-dialog">
      <div class="qualification-catalog-dialog__context" role="note">
        <span aria-hidden="true"><ArtSvgIcon icon="ri:node-tree" /></span>
        <div>
          <strong>维护{{ config.title }}层级</strong>
          <p>编码用于业务联动；停用节点保留历史引用，不再用于新增证件。</p>
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
      />
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
  import { useUserStore } from '@/store/modules/user'
  import TreeUtils from '@/utils/tree'
  import {
    saveQualificationCatalog,
    type SmisQualificationCatalog,
    type SmisQualificationCatalogSavePayload,
    type SmisQualificationCatalogType,
    type SmisQualificationStatus
  } from '@smis/api'
  import { qualificationCatalogConfig } from './qualification-catalog-meta'

  export interface QualificationCatalogDialogOpenData {
    catalogType: SmisQualificationCatalogType
    row?: SmisQualificationCatalog
    tree: SmisQualificationCatalog[]
    presetParentId?: string
  }

  interface FormModel {
    id?: string
    parentId?: string
    itemCode: string
    itemName: string
    sort: number
    status: SmisQualificationStatus
    remark: string
  }
  interface FormExpose {
    validate: () => Promise<boolean>
    clearValidate: () => void
  }

  const emit = defineEmits<{ success: [] }>()
  const userStore = useUserStore()
  const { getDictMap } = storeToRefs(userStore)
  const treeUtils = new TreeUtils({ idKey: 'id', parentKey: 'parentId', childrenKey: 'children' })
  const dialogRef = ref<ArtDialogExpose<QualificationCatalogDialogOpenData>>()
  const formRef = ref<FormExpose>()
  const catalogType = ref<SmisQualificationCatalogType>('work_item')
  const sourceTree = shallowRef<SmisQualificationCatalog[]>([])
  const config = computed(() => qualificationCatalogConfig[catalogType.value])
  const initial = (): FormModel => ({
    id: undefined,
    parentId: undefined,
    itemCode: '',
    itemName: '',
    sort: 10,
    status: 'enabled',
    remark: ''
  })
  const statusOptions = computed<FormItemOption[]>(() =>
    (getDictMap.value.smisQualificationStatus ?? []).map((item) => ({
      label: item.label || item.name,
      value: item.value
    }))
  )
  const form = reactive<{
    model: FormModel
    items: ComputedRef<FormItem[]>
    rules: FormRules<FormModel>
  }>({
    model: initial(),
    items: computed(() => [
      {
        label: `上级${config.value.title}`,
        key: 'parentId',
        type: 'treeSelect',
        span: 24,
        props: {
          data: sourceTree.value,
          nodeKey: 'id',
          checkStrictly: true,
          clearable: true,
          defaultExpandAll: true,
          props: { label: 'itemName', value: 'id', children: 'children' },
          placeholder: '不选择则创建一级节点'
        }
      },
      {
        label: `${config.value.title}编码`,
        key: 'itemCode',
        type: 'input',
        props: { maxlength: 50, clearable: true, placeholder: config.value.codePlaceholder }
      },
      {
        label: `${config.value.title}名称`,
        key: 'itemName',
        type: 'input',
        props: { maxlength: 120, clearable: true, placeholder: config.value.namePlaceholder }
      },
      {
        label: '显示顺序',
        key: 'sort',
        type: 'number',
        props: { min: 0, max: 999999, precision: 0, controlsPosition: 'right', class: '!w-full' }
      },
      { label: '启用状态', key: 'status', type: 'radioGroup', options: statusOptions.value },
      {
        label: '备注',
        key: 'remark',
        type: 'textarea',
        span: 24,
        props: {
          rows: 4,
          maxlength: 1000,
          showWordLimit: true,
          resize: 'none',
          placeholder: `补充${config.value.title}适用范围或管理说明`
        }
      }
    ]),
    rules: {
      itemCode: [{ required: true, message: '请输入编码', trigger: 'blur' }],
      itemName: [{ required: true, message: '请输入名称', trigger: 'blur' }],
      status: [{ required: true, message: '请选择启用状态', trigger: 'change' }]
    }
  })

  const handleSubmit = async (): Promise<boolean> => {
    try {
      await formRef.value?.validate()
      const payload: SmisQualificationCatalogSavePayload = {
        id: form.model.id,
        catalogType: catalogType.value,
        parentId: form.model.parentId || null,
        itemCode: form.model.itemCode.trim().toUpperCase(),
        itemName: form.model.itemName.trim(),
        sort: Number(form.model.sort),
        status: form.model.status,
        remark: form.model.remark.trim() || null
      }
      await saveQualificationCatalog(payload)
      emit('success')
      return true
    } catch {
      return false
    }
  }

  const handleOpen = async (data: QualificationCatalogDialogOpenData): Promise<void> => {
    catalogType.value = data.catalogType
    Object.assign(form.model, initial())
    sourceTree.value = data.tree
    if (data.row) {
      const blocked = new Set(
        treeUtils.getDescendants(data.tree, data.row.id, true).map((item) => item.id)
      )
      sourceTree.value = treeUtils.removeNodesByCondition(data.tree, (item) =>
        blocked.has(item.id)
      ).tree
      Object.assign(form.model, {
        id: data.row.id,
        parentId: data.row.parentId || undefined,
        itemCode: data.row.itemCode,
        itemName: data.row.itemName,
        sort: data.row.sort,
        status: data.row.status,
        remark: data.row.remark || ''
      })
    } else form.model.parentId = data.presetParentId
    await nextTick()
    formRef.value?.clearValidate()
    await dialogRef.value?.handleOpen(data, {
      title: data.row ? `编辑${config.value.title}` : `新增${config.value.title}`,
      subtitle: '维护业务编码、树形层级、启用状态和备注',
      confirmText: `保存${config.value.title}`,
      onOpen: async (_openData, api) => {
        api.setLoading(true)
        try {
          await userStore.ensureDictLoaded('smisQualificationStatus')
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
  .qualification-catalog-dialog__context {
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

    p {
      margin: 3px 0 0;
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }
</style>
