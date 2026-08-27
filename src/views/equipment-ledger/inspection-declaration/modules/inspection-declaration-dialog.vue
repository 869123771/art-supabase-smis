<template>
  <ArtDialog ref="dialogRef" size="xl">
    <div class="inspection-dialog">
      <div class="inspection-dialog__context" role="note">
        <span><ArtSvgIcon icon="ri:shield-check-line" /></span>
        <div>
          <strong>检验结果将同步进入设备全生命周期</strong>
          <p>报告编号按租户规则自动生成；检验类别、机构和图片证据均保留结构化关联。</p>
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
      >
        <template #equipmentId>
          <ArtTableSingleSelect
            v-model="form.model.equipmentId"
            :selected-data="equipmentSelection"
            :api-fn="fetchEquipmentOptions"
            :columns="equipmentColumns"
            title="选择检验设备"
            subtitle="数据来自当前租户设备台账"
            label-key="equipmentName"
            description-key="equipmentCode"
            placeholder="点击选择设备"
            show-pagination
          />
        </template>

        <template #inspectionInstitutionId>
          <ArtTableSingleSelect
            v-model="form.model.inspectionInstitutionId"
            :selected-data="institutionSelection"
            :api-fn="fetchInstitutionOptions"
            :columns="institutionColumns"
            title="选择检验机构"
            subtitle="仅展示供应商主数据中分类为“检验机构”的单位"
            label-key="supplierName"
            description-key="supplierCode"
            placeholder="点击选择检验机构"
            show-pagination
          />
        </template>

        <template #images>
          <div class="inspection-dialog__images">
            <button
              v-for="image in form.images"
              :key="image.attachmentId"
              type="button"
              class="inspection-dialog__image"
              :aria-label="`预览检验图片 ${image.originName}`"
              @click="previewImage(image.url)"
            >
              <img :src="image.url" :alt="image.originName" width="144" height="104" />
              <span :title="image.originName">{{ image.originName }}</span>
              <ElButton
                text
                type="danger"
                aria-label="移除检验图片"
                @click.stop="removeImage(image.attachmentId)"
              >
                <ArtSvgIcon icon="ri:close-line" />
              </ElButton>
            </button>
            <button
              v-if="form.images.length < 9"
              type="button"
              class="inspection-dialog__upload"
              @click="resourcePickerVisible = true"
            >
              <ArtSvgIcon icon="ri:image-add-line" />
              <strong>上传检验图片</strong>
              <small>{{ form.images.length }}/9 张</small>
            </button>
          </div>
        </template>
      </ArtForm>
    </div>
  </ArtDialog>

  <ArtResourcePicker
    v-model:visible="resourcePickerVisible"
    title="选择检验图片"
    default-file-type="image"
    multiple
    :limit="9"
    @confirm="handleResourceConfirm"
  />
</template>

<script setup lang="ts">
  import dayjs from 'dayjs'
  import type { FormRules } from 'element-plus'
  import type { Resource } from '@/components/core/forms/art-resource-picker/type'
  import type {
    DataSelectColumn,
    DataSelectFetchParams,
    DataSelectRecord
  } from '@/components/core/forms/art-data-select/types'
  import ArtDialog from '@/components/core/dialogs/art-dialog/index.vue'
  import type { ArtDialogExpose } from '@/components/core/dialogs/art-dialog/types'
  import ArtForm, { type FormItem } from '@/components/core/forms/art-form/index.vue'
  import ArtTableSingleSelect from '@/components/core/forms/art-data-select/table-single.vue'
  import ArtResourcePicker from '@/components/core/forms/art-resource-picker/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import { useDocumentNumberRule } from '@/hooks/core/useDocumentNumberRule'
  import { useImageViewer } from '@/hooks/core/useImageViewer'
  import { useUserStore } from '@/store/modules/user'
  import {
    fetchEquipmentLedgerList,
    fetchInspectionCategoryList,
    fetchSupplierList,
    saveEquipmentInspection,
    type SmisEquipmentInspection,
    type SmisEquipmentInspectionConclusion,
    type SmisEquipmentInspectionImage,
    type SmisEquipmentInspectionSavePayload,
    type SmisEquipmentInspectionStatus
  } from '@smis/api'

  export interface InspectionDeclarationDialogOpenData {
    row?: SmisEquipmentInspection
    presetEquipmentId?: string
  }
  interface InspectionForm {
    id?: string
    inspectionNo: string
    equipmentId: string
    inspectionCategoryId: string
    inspectionInstitutionId: string
    inspectionDate: string
    conclusion: SmisEquipmentInspectionConclusion | ''
    nextDueDate: string
    needsExtension: boolean
    extensionDate: string
    reminderMonths: 1 | 2 | 3
    status: SmisEquipmentInspectionStatus
    images: string
    remark: string
  }
  interface FormExpose {
    validate: () => Promise<boolean>
    clearValidate: () => void
    reloadOptions: (key?: string) => Promise<unknown>
  }

  const emit = defineEmits<{ success: [type: 'add' | 'edit'] }>()
  const userStore = useUserStore()
  const { getDictMap } = storeToRefs(userStore)
  const dialogRef = ref<ArtDialogExpose<InspectionDeclarationDialogOpenData>>()
  const formRef = ref<FormExpose>()
  const equipmentSelection = shallowRef<DataSelectRecord[]>([])
  const institutionSelection = shallowRef<DataSelectRecord[]>([])
  const resourcePickerVisible = ref(false)
  const numberRule = useDocumentNumberRule('smis.equipment_inspection')

  const initialForm = (): InspectionForm => ({
    inspectionNo: '',
    equipmentId: '',
    inspectionCategoryId: '',
    inspectionInstitutionId: '',
    inspectionDate: dayjs().format('YYYY-MM-DD'),
    conclusion: '',
    nextDueDate: '',
    needsExtension: false,
    extensionDate: '',
    reminderMonths: 1,
    status: 'completed',
    images: '',
    remark: ''
  })
  const formModel = reactive<InspectionForm>(initialForm())
  const images = shallowRef<SmisEquipmentInspectionImage[]>([])

  const dictOptions = (code: string) =>
    (getDictMap.value[code] ?? []).map((item) => ({
      label: item.label || item.name,
      value: item.value
    }))
  const conclusionOptions = computed(() => dictOptions('smisEquipmentInspectionConclusion'))
  const statusOptions = computed(() => dictOptions('smisEquipmentInspectionStatus'))
  const reminderOptions = computed(() =>
    dictOptions('smisEquipmentInspectionReminderMonths').map((item) => ({
      ...item,
      value: Number(item.value)
    }))
  )
  const booleanOptions = computed(() =>
    dictOptions('commonBoolean').map((item) => ({ ...item, value: item.value === 'true' }))
  )
  const inspectionNoProps = computed<Record<string, unknown>>(() =>
    numberRule.inputProps(Boolean(formModel.id), '系统自动生成检验报告编号', true)
  )

  const form = reactive<{
    model: InspectionForm
    images: SmisEquipmentInspectionImage[]
    items: ComputedRef<FormItem[]>
    rules: FormRules<InspectionForm>
  }>({
    model: formModel,
    images: images.value,
    items: computed(() => [
      { label: '申报与报告', key: 'reportSection', type: 'divider', span: 24 },
      {
        label: '检验报告编号',
        key: 'inspectionNo',
        type: 'input',
        description: numberRule.description.value,
        props: inspectionNoProps.value
      },
      {
        label: '检验状态',
        key: 'status',
        type: 'select',
        options: statusOptions.value,
        props: { clearable: false }
      },
      { label: '检验设备', key: 'equipmentId', type: 'text', span: 12 },
      {
        label: '检验类别',
        key: 'inspectionCategoryId',
        type: 'select',
        span: 12,
        api: () => fetchInspectionCategoryList({ status: 'enabled', from: 0, to: 9999 }),
        resultField: 'data',
        labelField: 'categoryName',
        valueField: 'id',
        props: { placeholder: '请选择租户检验类别' }
      },
      { label: '检验结果', key: 'resultSection', type: 'divider', span: 24 },
      {
        label: '检验日期',
        key: 'inspectionDate',
        type: 'date',
        props: { valueFormat: 'YYYY-MM-DD', clearable: false }
      },
      {
        label: '检验结论',
        key: 'conclusion',
        type: 'select',
        options: conclusionOptions.value,
        props: { clearable: false }
      },
      { label: '检验机构', key: 'inspectionInstitutionId', type: 'text', span: 12 },
      {
        label: '下次检验日期',
        key: 'nextDueDate',
        type: 'date',
        span: 12,
        props: { valueFormat: 'YYYY-MM-DD' }
      },
      {
        label: '是否需要下次检验延期',
        key: 'needsExtension',
        type: 'select',
        options: booleanOptions.value,
        props: { clearable: false }
      },
      {
        label: '检验延期日期',
        key: 'extensionDate',
        type: 'date',
        description: formModel.needsExtension
          ? '请选择获批后的延期日期。'
          : '选择“是”后方可维护延期日期。',
        props: {
          valueFormat: 'YYYY-MM-DD',
          disabled: !formModel.needsExtension,
          clearable: formModel.needsExtension
        }
      },
      {
        label: '提前提醒时间',
        key: 'reminderMonths',
        type: 'select',
        options: reminderOptions.value,
        props: { clearable: false }
      },
      { label: '图片与说明', key: 'evidenceSection', type: 'divider', span: 24 },
      { label: '检验图片', key: 'images', type: 'text', span: 24 },
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
          placeholder: '补充检验范围、整改要求或延期依据'
        }
      }
    ]),
    rules: {
      inspectionNo: [
        {
          validator: (_rule, value, callback) => {
            if (numberRule.manualRequired(Boolean(formModel.id)) && !String(value || '').trim())
              callback(new Error('请输入检验报告编号'))
            else callback()
          },
          trigger: 'blur'
        }
      ],
      equipmentId: [{ required: true, message: '请选择检验设备', trigger: 'change' }],
      inspectionCategoryId: [{ required: true, message: '请选择检验类别', trigger: 'change' }],
      inspectionInstitutionId: [{ required: true, message: '请选择检验机构', trigger: 'change' }],
      inspectionDate: [{ required: true, message: '请选择检验日期', trigger: 'change' }],
      conclusion: [{ required: true, message: '请选择检验结论', trigger: 'change' }],
      extensionDate: [
        {
          validator: (_rule, value, callback) => {
            if (formModel.needsExtension && !value) callback(new Error('请选择检验延期日期'))
            else callback()
          },
          trigger: 'change'
        }
      ]
    }
  })

  watch(images, (value) => {
    form.images = value
  })
  watch(
    () => form.model.needsExtension,
    (needsExtension) => {
      if (!needsExtension) form.model.extensionDate = ''
    }
  )

  const equipmentColumns: DataSelectColumn[] = [
    { prop: 'equipmentCode', label: '设备编码', minWidth: 150 },
    { prop: 'equipmentName', label: '设备名称', minWidth: 210 },
    { prop: 'categoryName', label: '设备分类', minWidth: 150 },
    { prop: 'organizationName', label: '使用部门', minWidth: 160 }
  ]
  const institutionColumns: DataSelectColumn[] = [
    { prop: 'supplierCode', label: '机构编码', minWidth: 150 },
    { prop: 'supplierName', label: '检验机构', minWidth: 240 },
    { prop: 'contactPerson', label: '联系人', minWidth: 120 },
    { prop: 'contactPhone', label: '联系电话', minWidth: 140 }
  ]
  const fetchEquipmentOptions = async (params: DataSelectFetchParams) => {
    const from = (params.page - 1) * params.pageSize
    const result = await fetchEquipmentLedgerList({
      keyword: params.keyword,
      from,
      to: from + params.pageSize - 1
    })
    return {
      data: result.data.map((row) => ({
        ...row,
        categoryName: row.category.categoryName,
        organizationName: row.usingOrganization.organizationName
      })) as DataSelectRecord[],
      total: result.total
    }
  }
  const fetchInstitutionOptions = async (params: DataSelectFetchParams) => {
    const from = (params.page - 1) * params.pageSize
    const result = await fetchSupplierList({
      keyword: params.keyword,
      supplierCategory: 'inspection_agency',
      from,
      to: from + params.pageSize - 1
    })
    return { data: result.data as DataSelectRecord[], total: result.total }
  }

  const handleResourceConfirm = (resources: Resource[]): void => {
    const known = new Set(images.value.map((item) => item.attachmentId))
    const additions = resources
      .filter((resource) => resource.id != null && resource.url && !known.has(String(resource.id)))
      .map((resource, index): SmisEquipmentInspectionImage => ({
        attachmentId: String(resource.id),
        sort: images.value.length + index,
        originName: resource.originName || `检验图片 ${images.value.length + index + 1}`,
        url: resource.url || '',
        mimeType: resource.mimeType,
        suffix: resource.suffix,
        sizeInfo: resource.sizeInfo
      }))
    images.value = [...images.value, ...additions].slice(0, 9)
    resourcePickerVisible.value = false
  }
  const removeImage = (attachmentId: string): void => {
    images.value = images.value.filter((item) => item.attachmentId !== attachmentId)
  }
  const previewImage = (url: string): void => {
    useImageViewer([url])
  }

  const resetForm = async (): Promise<void> => {
    Object.assign(form.model, initialForm())
    images.value = []
    equipmentSelection.value = []
    institutionSelection.value = []
    await nextTick()
    formRef.value?.clearValidate()
  }
  const buildPayload = (): SmisEquipmentInspectionSavePayload => ({
    id: form.model.id,
    inspectionNo: form.model.inspectionNo.trim(),
    equipmentId: form.model.equipmentId,
    inspectionCategoryId: form.model.inspectionCategoryId,
    inspectionInstitutionId: form.model.inspectionInstitutionId,
    inspectionDate: form.model.inspectionDate,
    conclusion: form.model.conclusion as SmisEquipmentInspectionConclusion,
    nextDueDate: form.model.nextDueDate || null,
    needsExtension: form.model.needsExtension,
    extensionDate: form.model.needsExtension ? form.model.extensionDate || null : null,
    reminderMonths: form.model.reminderMonths,
    status: form.model.status,
    remark: form.model.remark.trim(),
    imageAttachmentIds: images.value.map((item) => item.attachmentId)
  })
  const handleSubmit = async (): Promise<boolean> => {
    try {
      await formRef.value?.validate()
      await saveEquipmentInspection(buildPayload())
      emit('success', form.model.id ? 'edit' : 'add')
      return true
    } catch {
      return false
    }
  }
  const handleOpen = async (data: InspectionDeclarationDialogOpenData): Promise<void> => {
    await resetForm()
    if (data.row) {
      Object.assign(form.model, {
        id: data.row.id,
        inspectionNo: data.row.inspectionNo,
        equipmentId: data.row.equipmentId,
        inspectionCategoryId: data.row.inspectionCategoryId,
        inspectionInstitutionId: data.row.inspectionInstitutionId,
        inspectionDate: data.row.inspectionDate,
        conclusion: data.row.conclusion,
        nextDueDate: data.row.nextDueDate || '',
        needsExtension: data.row.needsExtension,
        extensionDate: data.row.extensionDate || '',
        reminderMonths: data.row.reminderMonths,
        status: data.row.status,
        remark: data.row.remark || ''
      })
      equipmentSelection.value = [
        {
          id: data.row.equipment.id,
          equipmentCode: data.row.equipment.equipmentCode,
          equipmentName: data.row.equipment.equipmentName,
          equipmentKind: data.row.equipment.equipmentKind,
          model: data.row.equipment.model,
          categoryName: data.row.equipment.categoryName,
          organizationName: data.row.equipment.organizationName
        }
      ]
      institutionSelection.value = data.row.inspectionInstitution
        ? [
            {
              id: data.row.inspectionInstitution.id,
              supplierCode: data.row.inspectionInstitution.supplierCode,
              supplierName: data.row.inspectionInstitution.supplierName
            }
          ]
        : []
      images.value = [...data.row.images]
    } else if (data.presetEquipmentId) {
      form.model.equipmentId = data.presetEquipmentId
    }
    await dialogRef.value?.handleOpen(data, {
      title: data.row ? '编辑检验申报' : '新增检验申报',
      subtitle: '维护检验报告、结论、延期与图片证据',
      confirmText: data.row ? '保存检验申报' : '创建检验申报',
      contentMaxHeight: 'calc(100vh - 176px)',
      loading: true,
      onOpen: async (_data, api) => {
        try {
          await Promise.all([
            numberRule.loadRule(),
            formRef.value?.reloadOptions('inspectionCategoryId'),
            ...[
              'commonBoolean',
              'smisEquipmentInspectionConclusion',
              'smisEquipmentInspectionReminderMonths',
              'smisEquipmentInspectionStatus'
            ].map((code) => userStore.ensureDictLoaded(code))
          ])
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
  .inspection-dialog {
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
        font-size: 21px;
        color: var(--theme-color);
        background: var(--default-box-color);
        border-radius: var(--el-border-radius-base);
      }

      p {
        margin: 3px 0 0;
        font-size: 12px;
        line-height: 1.6;
        color: var(--el-text-color-secondary);
      }
    }

    &__images {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(132px, 1fr));
      gap: 12px;
      width: 100%;
    }

    &__image,
    &__upload {
      position: relative;
      min-height: 132px;
      padding: 0;
      overflow: hidden;
      color: var(--el-text-color-regular);
      cursor: pointer;
      background: var(--art-gray-100);
      border: 1px solid var(--el-border-color-lighter);
      border-radius: var(--el-border-radius-base);
      transition:
        border-color var(--el-transition-duration-fast),
        background-color var(--el-transition-duration-fast);
    }

    &__image:focus-visible,
    &__upload:focus-visible {
      outline: 2px solid var(--theme-color);
      outline-offset: 2px;
    }

    &__image {
      display: grid;
      grid-template-rows: 104px auto;

      img {
        width: 100%;
        height: 104px;
        object-fit: cover;
      }

      > span {
        padding: 8px 34px 8px 10px;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 12px;
        text-align: left;
        white-space: nowrap;
      }

      :deep(.el-button) {
        position: absolute;
        right: 3px;
        bottom: 2px;
        width: 30px;
        height: 30px;
      }
    }

    &__upload {
      display: grid;
      gap: 4px;
      place-content: center;
      min-height: 132px;

      svg {
        margin: 0 auto 4px;
        font-size: 25px;
        color: var(--theme-color);
      }

      small {
        color: var(--el-text-color-secondary);
      }

      &:hover {
        background: color-mix(in srgb, var(--theme-color) 6%, var(--art-gray-100));
        border-color: color-mix(in srgb, var(--theme-color) 40%, var(--el-border-color));
      }
    }
  }
</style>
