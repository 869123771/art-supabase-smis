<template>
  <ArtDialog ref="dialogRef" size="lg">
    <div class="inspection-rectification-dialog">
      <div v-if="selectedRecord" class="inspection-rectification-dialog__summary">
        <span aria-hidden="true"><ArtSvgIcon icon="ri:tools-line" /></span>
        <div>
          <strong
            >{{ selectedRecord.hazardNo }} · {{ selectedRecord.inspectedOrganizationName }}</strong
          >
          <p>{{ selectedRecord.hazardDescription }}</p>
        </div>
        <ArtDictDisplay
          dict-code="smisHazardLevel"
          :value="selectedRecord.hazardLevel"
          display="tag"
        />
      </div>
      <ArtForm
        ref="formRef"
        v-model="form.model"
        :items="formItems"
        :rules="form.rules"
        :span="12"
        :gutter="24"
        label-position="top"
        :show-reset="false"
        :show-submit="false"
      >
        <template #imageUrls>
          <ArtUploadImage
            v-model="form.model.imageUrls"
            title="上传整改照片"
            multiple
            :limit="9"
            :size="124"
          />
        </template>
      </ArtForm>
    </div>
  </ArtDialog>
</template>

<script setup lang="ts">
  import dayjs from 'dayjs'
  import type { FormRules } from 'element-plus'
  import ArtDialog from '@/components/core/dialogs/art-dialog/index.vue'
  import type { ArtDialogExpose } from '@/components/core/dialogs/art-dialog/types'
  import ArtForm, { type FormItem } from '@/components/core/forms/art-form/index.vue'
  import ArtDictDisplay from '@/components/core/base/art-dict-display/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import ArtUploadImage from '@/components/core/forms/art-upload-image/index.vue'
  import {
    createInspectionRectification,
    type SmisInspectionRectificationPayload,
    type SmisRectificationNoticeRecord
  } from '@smis/api'

  export interface InspectionRectificationDialogOpenData {
    records: SmisRectificationNoticeRecord[]
    selectedId?: string
  }
  interface FormExpose {
    validate: () => Promise<boolean>
    clearValidate: () => void
  }

  const emit = defineEmits<{ success: [] }>()
  const dialogRef = ref<ArtDialogExpose<InspectionRectificationDialogOpenData>>()
  const formRef = ref<FormExpose>()
  const records = ref<SmisRectificationNoticeRecord[]>([])
  const initialModel = (): SmisInspectionRectificationPayload => ({
    id: '',
    completedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    description: '',
    imageUrls: []
  })
  const form = reactive<{
    model: SmisInspectionRectificationPayload
    rules: FormRules<SmisInspectionRectificationPayload>
  }>({
    model: initialModel(),
    rules: {
      id: [{ required: true, message: '请选择待整改隐患', trigger: 'change' }],
      completedAt: [{ required: true, message: '请选择整改时间', trigger: 'change' }],
      description: [{ required: true, message: '请输入实际整改说明', trigger: 'blur' }]
    }
  })
  const selectedRecord = computed(() => records.value.find((item) => item.id === form.model.id))
  const formItems = computed<FormItem[]>(() => [
    {
      label: '待整改隐患',
      key: 'id',
      type: 'select',
      span: 24,
      options: records.value.map((item) => ({
        label: `${item.hazardNo} · ${item.inspectedOrganizationName} · ${item.hazardDescription}`,
        value: item.id
      })),
      props: { filterable: true, placeholder: '选择一条整改中的隐患' }
    },
    {
      label: '整改责任人',
      key: 'responsibleEmployeeName',
      type: 'input',
      span: 12,
      props: { readonly: true, modelValue: selectedRecord.value?.responsibleEmployeeName || '—' }
    },
    {
      label: '整改完成时间',
      key: 'completedAt',
      type: 'date',
      span: 12,
      props: {
        type: 'datetime',
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
        class: '!w-full',
        clearable: false
      }
    },
    {
      label: '实际整改说明',
      key: 'description',
      type: 'textarea',
      span: 24,
      props: {
        rows: 5,
        maxlength: 2000,
        showWordLimit: true,
        resize: 'none',
        placeholder: '说明采取的措施、完成情况及现场复核结果'
      }
    },
    { label: '整改照片', key: 'imageUrls', type: 'text', span: 24 }
  ])
  const handleSubmit = async (): Promise<boolean> => {
    try {
      await formRef.value?.validate()
      await createInspectionRectification({
        ...toRaw(form.model),
        description: form.model.description.trim(),
        imageUrls: [...form.model.imageUrls]
      })
      emit('success')
      return true
    } catch {
      return false
    }
  }
  const handleOpen = async (data: InspectionRectificationDialogOpenData): Promise<void> => {
    records.value = data.records
    Object.assign(form.model, initialModel(), { id: data.selectedId || '' })
    await nextTick()
    formRef.value?.clearValidate()
    await dialogRef.value?.handleOpen(data, {
      title: '新增整改落实记录',
      subtitle: '记录实际整改措施、完成时间和现场证据',
      confirmText: '提交整改结果',
      contentMaxHeight: 'calc(100vh - 150px)',
      onConfirm: handleSubmit
    })
  }
  defineExpose({ handleOpen })
</script>

<style scoped lang="scss">
  .inspection-rectification-dialog {
    min-width: 0;

    &__summary {
      display: grid;
      grid-template-columns: 44px minmax(0, 1fr) auto;
      gap: var(--art-space-3);
      align-items: center;
      padding: var(--art-space-3) var(--art-space-4);
      margin-bottom: var(--art-space-4);
      background: color-mix(in srgb, var(--el-color-warning) 8%, var(--default-box-color));
      border-left: 3px solid var(--el-color-warning);
      border-radius: var(--el-border-radius-base);
    }

    &__summary > span {
      display: grid;
      place-items: center;
      width: 44px;
      height: 44px;
      color: var(--el-color-warning);
      background: var(--default-box-color);
      border-radius: var(--el-border-radius-base);
    }

    &__summary p {
      margin: 3px 0 0;
      overflow: hidden;
      text-overflow: ellipsis;
      color: var(--el-text-color-secondary);
      white-space: nowrap;
    }
  }
</style>
