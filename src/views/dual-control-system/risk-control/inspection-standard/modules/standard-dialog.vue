<template>
  <ArtDialog ref="dialogRef" size="md">
    <div class="standard-dialog">
      <div class="standard-dialog__note">
        <ArtSvgIcon icon="ri:node-tree" />
        <div
          ><strong>标准层级节点</strong
          ><p>上级标准决定导航层级；有下级或排查项的标准需先完成业务迁移后再删除。</p></div
        >
      </div>
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
    saveInspectionStandard,
    type SmisInspectionStandard,
    type SmisInspectionStandardPayload
  } from '@smis/api'

  export interface StandardDialogOpenData {
    row?: SmisInspectionStandard
    parentId?: string | null
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
  const dialogRef = ref<ArtDialogExpose<StandardDialogOpenData>>()
  const formRef = ref<FormExpose>()
  const source = ref<SmisInspectionStandard[]>([])
  const initial = (): SmisInspectionStandardPayload => ({
    tenantId: null,
    parentId: null,
    standardCode: '',
    standardName: '',
    sort: 10,
    textColor: '#2563EB',
    tagStyle: 'primary',
    status: 'enabled'
  })
  const model = reactive(initial())
  const toTree = (rows: SmisInspectionStandard[]) => {
    const blockedId = model.id
    const nodes = rows
      .filter((row) => row.id !== blockedId)
      .map((row) => ({
        label: `${row.standardName}（${row.standardCode}）`,
        value: row.id,
        parentId: row.parentId,
        children: [] as unknown[]
      }))
    const map = new Map(nodes.map((node) => [node.value, node]))
    const roots: typeof nodes = []
    nodes.forEach((node) => {
      const parent = node.parentId ? map.get(node.parentId) : undefined
      if (parent) parent.children.push(node)
      else roots.push(node)
    })
    return roots
  }
  const statusOptions = computed(() =>
    (getDictMap.value.smisConfigStatus ?? [])
      .filter((item) => item.value !== 'voided')
      .map((item) => ({ label: item.label || item.name, value: item.value }))
  )
  const tagOptions = computed(() =>
    (getDictMap.value.smisTagStyle ?? []).map((item) => ({
      label: item.label || item.name,
      value: item.value
    }))
  )
  const items = computed<FormItem[]>(() => [
    {
      label: '上级排查标准',
      key: 'parentId',
      type: 'treeSelect',
      span: 24,
      props: {
        data: toTree(source.value),
        clearable: true,
        checkStrictly: true,
        defaultExpandAll: true,
        placeholder: '留空则作为一级标准'
      }
    },
    {
      label: '标准编号',
      key: 'standardCode',
      type: 'input',
      props: { maxlength: 40, clearable: true, placeholder: '如 FIRE_SAFETY' }
    },
    {
      label: '标准名称',
      key: 'standardName',
      type: 'input',
      props: { maxlength: 100, clearable: true, placeholder: '如 消防安全' }
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
          modelValue: model.textColor,
          predefine: ['#2563EB', '#059669', '#D97706', '#DC2626', '#7C3AED', '#475569'],
          'onUpdate:modelValue': (value: string | null) => (model.textColor = value || '')
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
  ])
  const rules: FormRules = {
    standardCode: [
      { required: true, message: '请输入标准编号', trigger: 'blur' },
      {
        pattern: /^[A-Za-z][A-Za-z0-9_]*$/,
        message: '编号须以字母开头，仅支持字母、数字和下划线',
        trigger: 'blur'
      }
    ],
    standardName: [{ required: true, message: '请输入标准名称', trigger: 'blur' }],
    tagStyle: [{ required: true, message: '请选择标签样式', trigger: 'change' }],
    status: [{ required: true, message: '请选择状态', trigger: 'change' }]
  }
  const submit = async () => {
    try {
      await formRef.value?.validate()
      await saveInspectionStandard({
        ...model,
        parentId: model.parentId || null,
        standardCode: model.standardCode.trim().toUpperCase(),
        standardName: model.standardName.trim(),
        textColor: model.textColor || null
      })
      emit('success', model.id ? 'edit' : 'add')
      return true
    } catch {
      return false
    }
  }
  const handleOpen = async (data: StandardDialogOpenData) => {
    Object.assign(model, initial(), { tenantId: data.tenantId, parentId: data.parentId || null })
    source.value = data.standards
    if (data.row)
      Object.assign(model, {
        id: data.row.id,
        tenantId: data.row.tenantId,
        parentId: data.row.parentId,
        standardCode: data.row.standardCode,
        standardName: data.row.standardName,
        sort: data.row.sort,
        textColor: data.row.textColor || '#2563EB',
        tagStyle: data.row.tagStyle,
        status: data.row.status === 'voided' ? 'disabled' : data.row.status
      })
    await nextTick()
    formRef.value?.clearValidate()
    await dialogRef.value?.handleOpen(data, {
      title: data.row ? '编辑排查标准' : '新增排查标准',
      subtitle: '维护层级、编号与业务视觉标识',
      confirmText: '保存排查标准',
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
      onConfirm: submit
    })
  }
  defineExpose({ handleOpen })
</script>

<style scoped lang="scss">
  .standard-dialog {
    &__note {
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
  }
</style>
