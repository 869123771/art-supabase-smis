<template>
  <ArtDialog ref="dialogRef" size="xl">
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
      <template #scopeKeys>
        <div class="work-instruction-dialog__scope-picker">
          <ArtTreeMultipleSelect
            v-model="form.scopeKeys"
            :selected-data="selectedScopeNodes"
            :data="treeData"
            row-key="key"
            label-key="label"
            description-key="description"
            disabled-key="disabled"
            children-key="children"
            title="选择适用组织岗位"
            subtitle="可跨组织多选岗位；组织节点用于分组，岗位叶子可勾选"
            placeholder="请选择一个或多个适用岗位"
            search-placeholder="搜索组织、岗位名称或编码"
            :show-pagination="false"
            :show-selected-panel="true"
            :tree-check-strictly="true"
            :max-tag-count="3"
            empty-text="暂无可选岗位"
            empty-description="请先在 HR 岗位管理中新增并启用岗位，再维护岗位作业指导书。"
            @update:selected-data="handleSelectedDataUpdate"
          >
            <template #empty>
              <SmisDataSourceEmptyActions source="position" />
            </template>
          </ArtTreeMultipleSelect>
          <p>
            <ArtSvgIcon icon="ri:information-line" />
            已选择 {{ form.scopeKeys.length }} 个岗位，同一份指导书可同时适用于多个组织岗位。
          </p>
        </div>
      </template>

      <template #fileUrl>
        <div class="work-instruction-dialog__file-field">
          <ElInput
            v-model="form.fileUrl"
            clearable
            maxlength="2048"
            placeholder="选择系统资源，或粘贴可访问的文件地址"
          >
            <template #prefix><ArtSvgIcon icon="ri:link-m" /></template>
          </ElInput>
          <ElButton @click="resourcePickerVisible = true">
            <ArtSvgIcon icon="ri:attachment-2" />选择文件
          </ElButton>
        </div>
        <div v-if="form.fileUrl" class="work-instruction-dialog__file-ready">
          <span><ArtSvgIcon icon="ri:checkbox-circle-line" />文件地址已就绪</span>
          <ArtAttachmentLink
            :file="{
              name: form.originalFileName || form.fileNumber || form.instructionName,
              url: form.fileUrl,
              fileType: form.fileType
            }"
          />
        </div>
      </template>
    </ArtForm>
  </ArtDialog>

  <ArtResourcePicker
    v-model:visible="resourcePickerVisible"
    v-model="resourcePickerValue"
    title="选择作业指导书文件"
    default-file-type="document"
    :multiple="false"
    @confirm="handleResourceConfirm"
  />
</template>

<script setup lang="ts">
  import dayjs from 'dayjs'
  import { computed, nextTick, reactive, ref, toRaw } from 'vue'
  import { storeToRefs } from 'pinia'
  import type { FormRules } from 'element-plus'
  import ArtDialog from '@/components/core/dialogs/art-dialog/index.vue'
  import type { ArtDialogExpose } from '@/components/core/dialogs/art-dialog/types'
  import ArtForm, {
    type FormItem,
    type FormItemOption
  } from '@/components/core/forms/art-form/index.vue'
  import ArtTreeMultipleSelect from '@/components/core/forms/art-data-select/tree-multiple.vue'
  import ArtResourcePicker from '@/components/core/forms/art-resource-picker/index.vue'
  import type { Resource } from '@/components/core/forms/art-resource-picker/type'
  import ArtAttachmentLink from '@/components/core/media/art-file-viewer/attachment-link.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import SmisDataSourceEmptyActions from '@smis/views/components/smis-data-source-empty-actions.vue'
  import { useUserStore } from '@/store/modules/user'
  import {
    savePositionWorkInstruction,
    type PositionWorkInstruction,
    type PositionWorkInstructionSavePayload
  } from '@smis/api'
  import { flattenWorkInstructionTree, type WorkInstructionTreeNode } from './types'

  export interface WorkInstructionDialogOpenData {
    treeData: WorkInstructionTreeNode[]
    row?: PositionWorkInstruction
  }

  interface WorkInstructionForm {
    id?: string
    instructionName: string
    scopeKeys: Array<string | number>
    fileNumber: string
    fileType: string
    uploadDate: string
    versionNo: string
    fileUrl: string
    originalFileName: string
  }

  interface DialogFormExpose {
    validate: () => Promise<boolean>
    clearValidate: () => void
  }

  const emit = defineEmits<{ success: [type: 'add' | 'edit'] }>()
  const userStore = useUserStore()
  const { getDictMap } = storeToRefs(userStore)
  const dialogRef = ref<ArtDialogExpose<WorkInstructionDialogOpenData>>()
  const formRef = ref<DialogFormExpose>()
  const treeData = ref<WorkInstructionTreeNode[]>([])
  const selectedScopeNodes = ref<WorkInstructionTreeNode[]>([])
  const resourcePickerVisible = ref(false)
  const resourcePickerValue = ref<string>()

  const createInitialForm = (): WorkInstructionForm => ({
    instructionName: '',
    scopeKeys: [],
    fileNumber: '',
    fileType: '',
    uploadDate: dayjs().format('YYYY-MM-DD'),
    versionNo: 'V1.0',
    fileUrl: '',
    originalFileName: ''
  })
  const form = reactive<WorkInstructionForm>(createInitialForm())
  const leafNodeMap = computed(
    () =>
      new Map(
        flattenWorkInstructionTree(treeData.value)
          .filter((node) => node.nodeType === 'position')
          .map((node) => [node.key, node])
      )
  )
  const fileTypeOptions = computed<FormItemOption[]>(() => {
    const options = (getDictMap.value.FILE_EXTENSION_LABEL_MAP ?? []).map((item) => ({
      label: item.label || item.name,
      value: item.value
    }))
    if (form.fileType && !options.some((item) => item.value === form.fileType)) {
      return [{ label: form.fileType, value: form.fileType }, ...options]
    }
    return options
  })

  const formRules = computed<FormRules<WorkInstructionForm>>(() => ({
    instructionName: [
      { required: true, message: '请输入作业指导名称', trigger: 'blur' },
      { max: 200, message: '作业指导名称不能超过 200 个字符', trigger: 'blur' }
    ],
    scopeKeys: [
      {
        type: 'array',
        required: true,
        min: 1,
        message: '请至少选择一个适用组织岗位',
        trigger: 'change'
      }
    ]
  }))
  const formItems = computed<FormItem[]>(() => [
    { label: '指导书基本信息', key: 'basicSection', type: 'divider', span: 24 },
    {
      label: '作业指导名称',
      key: 'instructionName',
      type: 'input',
      span: 16,
      props: { maxlength: 200, showWordLimit: true, placeholder: '例如：危化品车辆装卸作业指导书' }
    },
    {
      label: '版本号',
      key: 'versionNo',
      type: 'input',
      span: 8,
      props: { maxlength: 50, placeholder: '例如：V1.0' }
    },
    { label: '适用组织岗位', key: 'scopeKeys', type: 'text', span: 24 },
    { label: '文件信息', key: 'fileSection', type: 'divider', span: 24 },
    {
      label: '文件编号',
      key: 'fileNumber',
      type: 'input',
      props: { maxlength: 100, placeholder: '填写企业文件编号' }
    },
    {
      label: '文件类型',
      key: 'fileType',
      type: 'select',
      options: fileTypeOptions.value,
      props: {
        clearable: true,
        filterable: true,
        placeholder: '请选择文件类型'
      }
    },
    {
      label: '上传日期',
      key: 'uploadDate',
      type: 'date',
      props: {
        type: 'date',
        valueFormat: 'YYYY-MM-DD',
        format: 'YYYY-MM-DD',
        placeholder: '请选择上传日期'
      }
    },
    { label: '文件地址', key: 'fileUrl', type: 'text', span: 24 }
  ])

  const handleSelectedDataUpdate = (rows: Record<string, unknown>[]): void => {
    selectedScopeNodes.value = rows.filter(
      (row): row is WorkInstructionTreeNode => row.nodeType === 'position'
    )
  }
  const handleResourceConfirm = (resources: Resource[]): void => {
    const resource = resources[0]
    if (!resource) return
    form.fileUrl = resource.url?.trim() || ''
    form.originalFileName = resource.originName?.trim() || ''
    form.fileType = getResourceExtension(resource) || form.fileType
    form.uploadDate = dayjs().format('YYYY-MM-DD')
    resourcePickerValue.value = resource.url
  }
  const resetForm = async (): Promise<void> => {
    Object.assign(form, createInitialForm())
    selectedScopeNodes.value = []
    resourcePickerValue.value = undefined
    resourcePickerVisible.value = false
    await nextTick()
    formRef.value?.clearValidate()
  }
  const getResourceExtension = (resource: Resource): string => {
    const suffix = resource.suffix?.trim().replace(/^\./, '')
    if (suffix) return suffix.toLocaleLowerCase('en-US')
    const fileName = resource.originName?.trim() || resource.url?.trim() || ''
    const extension = fileName.split(/[?#]/, 1)[0]?.match(/\.([^./\\]+)$/)?.[1]
    return extension?.toLocaleLowerCase('en-US') || ''
  }
  const buildPayload = (): PositionWorkInstructionSavePayload => ({
    id: form.id,
    instructionName: form.instructionName.trim(),
    fileNumber: form.fileNumber.trim(),
    fileType: form.fileType.trim(),
    uploadDate: form.uploadDate,
    versionNo: form.versionNo.trim(),
    fileUrl: form.fileUrl.trim(),
    originalFileName: form.originalFileName.trim(),
    scopes: form.scopeKeys
      .map((key) => leafNodeMap.value.get(String(key)))
      .filter((node): node is WorkInstructionTreeNode => Boolean(node?.positionId))
      .map((node) => ({ organizationId: node.organizationId, positionId: node.positionId! }))
  })
  const handleSubmit = async (): Promise<boolean> => {
    try {
      await formRef.value?.validate()
      const type = form.id ? 'edit' : 'add'
      await savePositionWorkInstruction(buildPayload())
      emit('success', type)
      return true
    } catch {
      return false
    }
  }
  const handleOpen = async (data: WorkInstructionDialogOpenData): Promise<void> => {
    await resetForm()
    treeData.value = data.treeData
    if (data.row) {
      const row = structuredClone(toRaw(data.row))
      Object.assign(form, {
        ...createInitialForm(),
        id: row.id,
        instructionName: row.instructionName,
        scopeKeys: row.scopes.map((scope) => scope.scopeKey),
        fileNumber: row.fileNumber || '',
        fileType: row.fileType || '',
        uploadDate: row.uploadDate || '',
        versionNo: row.versionNo || '',
        fileUrl: row.fileUrl || '',
        originalFileName: row.originalFileName || ''
      })
      selectedScopeNodes.value = form.scopeKeys
        .map((key) => leafNodeMap.value.get(String(key)))
        .filter((node): node is WorkInstructionTreeNode => Boolean(node))
      resourcePickerValue.value = form.fileUrl || undefined
    }

    await dialogRef.value?.handleOpen(data, {
      title: data.row ? '编辑岗位作业指导书' : '新增岗位作业指导书',
      subtitle: '维护指导书文件信息，并选择一个或多个适用组织岗位',
      confirmText: '保存',
      contentMaxHeight: 'calc(100vh - 176px)',
      onOpen: async (_data, api) => {
        if (getDictMap.value.FILE_EXTENSION_LABEL_MAP?.length) return
        api.setLoading(true)
        try {
          await userStore.ensureDictLoaded('FILE_EXTENSION_LABEL_MAP')
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
  .work-instruction-dialog {
    &__scope-picker {
      width: 100%;
    }

    &__scope-picker > p {
      display: flex;
      gap: 6px;
      align-items: center;
      margin: 8px 0 0;
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }

    &__scope-picker > p :deep(svg) {
      color: var(--theme-color);
    }

    &__file-field {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 10px;
      width: 100%;
    }

    &__file-ready {
      display: flex;
      gap: 16px;
      align-items: center;
      justify-content: space-between;
      min-width: 0;
      padding: 8px 10px;
      margin-top: 8px;
      font-size: 12px;
      background: var(--el-color-success-light-9);
      border: 1px solid var(--el-color-success-light-7);
      border-radius: var(--el-border-radius-base);
    }

    &__file-ready > span {
      display: inline-flex;
      flex: none;
      gap: 5px;
      align-items: center;
      color: var(--el-color-success-dark-2);
    }

    @media (width <= 640px) {
      &__file-field {
        grid-template-columns: 1fr;
      }

      &__file-ready {
        flex-direction: column;
        gap: 6px;
        align-items: flex-start;
      }
    }
  }
</style>
