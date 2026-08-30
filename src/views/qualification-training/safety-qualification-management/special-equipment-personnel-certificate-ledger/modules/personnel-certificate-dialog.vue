<template>
  <ArtDialog ref="dialogRef" size="xl">
    <ElForm
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      class="certificate-dialog"
    >
      <div class="certificate-dialog__employee">
        <ElAvatar :size="56" :src="employeeSelection[0]?.avatarUrl || undefined">{{
          employeeSelection[0]?.employeeName?.slice(-1) || '人'
        }}</ElAvatar>
        <div
          ><strong>{{ employeeSelection[0]?.employeeName || '从员工花名册选择持证人员' }}</strong
          ><p>{{ employeeContext }}</p></div
        >
        <span>人员信息实时联动花名册</span>
      </div>

      <ArtSectionCard title="人员与证件" subtitle="证件人员为主表，人员基础资料不重复录入">
        <div class="certificate-dialog__grid">
          <ElFormItem label="持证人员" prop="employeeId" class="is-wide">
            <ArtEmployeeSelect
              v-model="form.employeeId"
              v-model:selected-data="employeeSelection"
              title="选择持证人员"
              subtitle="选择后自动带出性别、组织、岗位、联系电话和头像"
            />
          </ElFormItem>
          <ElFormItem label="证件类别" prop="certificateCategory">
            <ElSelect
              v-model="form.certificateCategory"
              placeholder="请选择证件类别"
              @change="handleCategoryChange"
            >
              <ElOption
                v-for="item in categoryOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="证件编号" prop="certificateNumber"
            ><ElInput v-model="form.certificateNumber" maxlength="100" placeholder="请输入证件编号"
          /></ElFormItem>
          <ElFormItem label="发证机关"
            ><ElInput v-model="form.issuingAuthority" maxlength="200" placeholder="请输入发证机关"
          /></ElFormItem>
          <ElFormItem label="档案编号"
            ><ElInput v-model="form.archiveNumber" maxlength="100" placeholder="请输入档案编号"
          /></ElFormItem>
          <ElFormItem label="预警状态" prop="warningStatus">
            <ElRadioGroup v-model="form.warningStatus"
              ><ElRadioButton
                v-for="item in warningOptions"
                :key="item.value"
                :value="item.value"
                >{{ item.label }}</ElRadioButton
              ></ElRadioGroup
            >
          </ElFormItem>
          <ElFormItem v-if="extraFieldMeta" :label="extraFieldMeta.label">
            <ElInput
              v-model="form.extraFields[extraFieldMeta.key]"
              :placeholder="extraFieldMeta.placeholder"
              maxlength="120"
            />
          </ElFormItem>
          <ElFormItem label="证件照片" class="certificate-dialog__photo">
            <ArtUploadImage
              v-model="form.certificatePhotoUrl"
              title="上传证件照片"
              :limit="1"
              :size="112"
            />
          </ElFormItem>
          <ElFormItem label="备注" class="is-wide"
            ><ElInput
              v-model="form.remark"
              type="textarea"
              :rows="3"
              maxlength="1000"
              show-word-limit
              resize="none"
              placeholder="补充证件管理说明（选填）"
          /></ElFormItem>
        </div>
      </ArtSectionCard>

      <ArtSectionCard
        title="作业项目明细"
        subtitle="一个证件可关联多个作业项目；项目编码随选项自动带出"
      >
        <template #actions
          ><ElButton type="primary" plain @click="addItem"
            ><ArtSvgIcon icon="ri:add-line" />新增项目</ElButton
          ></template
        >
        <ElTable
          :data="form.items"
          row-key="key"
          table-layout="fixed"
          empty-text="请至少新增一个作业项目"
        >
          <ElTableColumn label="作业项目" min-width="250">
            <template #default="{ row }"
              ><ElSelect
                v-model="row.catalogId"
                filterable
                placeholder="选择后自动带出编码"
                @change="() => syncCatalog(row)"
                ><ElOption
                  v-for="item in activeCatalogOptions"
                  :key="item.id"
                  :label="`${item.itemCode} · ${item.itemName}`"
                  :value="item.id" /></ElSelect
            ></template>
          </ElTableColumn>
          <ElTableColumn label="项目编码" width="120"
            ><template #default="{ row }"
              ><ElInput :model-value="row.workCode || '—'" readonly /></template
          ></ElTableColumn>
          <ElTableColumn label="批准日期" width="160"
            ><template #default="{ row }"
              ><ElDatePicker
                v-model="row.approvalDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="批准日期" /></template
          ></ElTableColumn>
          <ElTableColumn label="有效日期" width="160"
            ><template #default="{ row }"
              ><ElDatePicker
                v-model="row.effectiveDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="有效日期" /></template
          ></ElTableColumn>
          <ElTableColumn label="提前提醒" width="160"
            ><template #default="{ row }"
              ><ElSelect v-model="row.reminderDays"
                ><ElOption
                  v-for="item in reminderOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="Number(item.value)" /></ElSelect></template
          ></ElTableColumn>
          <ElTableColumn v-if="isEditing" label="消除提醒" width="150"
            ><template #default="{ row }"
              ><ElSelect v-model="row.dismissalReason" clearable placeholder="仅离岗/培训"
                ><ElOption
                  v-for="item in dismissalOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value" /></ElSelect></template
          ></ElTableColumn>
          <ElTableColumn label="操作" width="74" align="center"
            ><template #default="{ $index }"
              ><ElButton type="danger" link aria-label="删除作业项目" @click="removeItem($index)"
                ><ArtSvgIcon icon="ri:delete-bin-line" /></ElButton></template
          ></ElTableColumn>
        </ElTable>
        <p class="certificate-dialog__hint"
          ><ArtSvgIcon icon="ri:information-line" />
          修改批准日期或有效日期时，系统自动保存旧值和新值，形成不可修改的复审记录。</p
        >
      </ArtSectionCard>
    </ElForm>
  </ArtDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import type { EmployeeIntegrationItem } from '@/api/integration/employees'
  import ArtDialog from '@/components/core/dialogs/art-dialog/index.vue'
  import type { ArtDialogExpose } from '@/components/core/dialogs/art-dialog/types'
  import ArtEmployeeSelect from '@/components/business/art-employee-select/index.vue'
  import ArtUploadImage from '@/components/core/forms/art-upload-image/index.vue'
  import ArtSectionCard from '@/components/core/surfaces/art-section-card/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import { useUserStore } from '@/store/modules/user'
  import {
    fetchQualificationCatalogList,
    savePersonnelCertificate,
    type SmisCertificateCategory,
    type SmisCertificateDismissalReason,
    type SmisCertificateWarningStatus,
    type SmisPersonnelCertificate,
    type SmisPersonnelCertificateSavePayload,
    type SmisQualificationCatalog,
    type SmisQualificationCatalogType
  } from '@smis/api'

  export type PersonnelCertificateDialogMode = 'add' | 'edit' | 'copy'
  export interface PersonnelCertificateDialogOpenData {
    mode: PersonnelCertificateDialogMode
    row?: SmisPersonnelCertificate
  }
  interface ItemForm {
    key: string
    id?: string
    catalogId: string
    workCode: string
    approvalDate: string
    effectiveDate: string
    reminderDays: number
    dismissalReason?: SmisCertificateDismissalReason
  }
  interface FormModel {
    id?: string
    employeeId: string
    certificateCategory: SmisCertificateCategory
    certificateNumber: string
    issuingAuthority: string
    archiveNumber: string
    certificatePhotoUrl: string
    warningStatus: SmisCertificateWarningStatus
    extraFields: Record<string, string>
    remark: string
    items: ItemForm[]
  }

  const emit = defineEmits<{ success: [] }>()
  const userStore = useUserStore()
  const { getDictMap } = storeToRefs(userStore)
  const dialogRef = ref<ArtDialogExpose<PersonnelCertificateDialogOpenData>>()
  const formRef = ref<FormInstance>()
  const employeeSelection = ref<EmployeeIntegrationItem[]>([])
  const catalogOptions = ref<SmisQualificationCatalog[]>([])
  const isEditing = ref(false)
  let itemSequence = 0
  const makeItem = (): ItemForm => ({
    key: `item-${++itemSequence}`,
    catalogId: '',
    workCode: '',
    approvalDate: '',
    effectiveDate: '',
    reminderDays: 30
  })
  const initial = (): FormModel => ({
    id: undefined,
    employeeId: '',
    certificateCategory: 'special_equipment_personnel',
    certificateNumber: '',
    issuingAuthority: '',
    archiveNumber: '',
    certificatePhotoUrl: '',
    warningStatus: 'normal',
    extraFields: {},
    remark: '',
    items: [makeItem()]
  })
  const form = reactive<FormModel>(initial())
  const rules: FormRules<FormModel> = {
    employeeId: [{ required: true, message: '请选择持证人员', trigger: 'change' }],
    certificateCategory: [{ required: true, message: '请选择证件类别', trigger: 'change' }],
    certificateNumber: [{ required: true, message: '请输入证件编号', trigger: 'blur' }],
    warningStatus: [{ required: true, message: '请选择预警状态', trigger: 'change' }]
  }
  const dictOptions = (code: string) =>
    computed(() =>
      (getDictMap.value[code] ?? []).map((item) => ({
        label: item.label || item.name,
        value: item.value
      }))
    )
  const categoryOptions = dictOptions('smisCertificateCategory')
  const warningOptions = dictOptions('smisCertificateWarningStatus')
  const reminderOptions = dictOptions('smisCertificateReminderDays')
  const dismissalOptions = dictOptions('smisCertificateDismissalReason')
  const catalogType = computed<SmisQualificationCatalogType>(
    () =>
      ({
        special_equipment_personnel: 'work_item',
        special_equipment_operator: 'work_item',
        special_operation: 'permitted_operation_item',
        safety_manager: 'work_category',
        registered_safety_engineer: 'work_category'
      })[form.certificateCategory] as SmisQualificationCatalogType
  )
  const activeCatalogOptions = computed(() =>
    catalogOptions.value.filter(
      (item) => item.catalogType === catalogType.value && item.status === 'enabled'
    )
  )
  const employeeContext = computed(() => {
    const employee = employeeSelection.value[0]
    return employee
      ? [
          employee.employeeNo,
          employee.gender,
          employee.organization?.organizationName,
          employee.jobTitle,
          employee.phone
        ]
          .filter(Boolean)
          .join(' · ')
      : '选择后自动展示性别、组织、岗位、联系电话和照片。'
  })
  const extraFieldMeta = computed(
    () =>
      ({
        special_equipment_personnel: {
          key: 'equipmentType',
          label: '设备种类',
          placeholder: '如 锅炉、压力容器'
        },
        special_equipment_operator: {
          key: 'operationLevel',
          label: '作业级别',
          placeholder: '请输入作业级别'
        },
        special_operation: {
          key: 'operationCategory',
          label: '操作类别',
          placeholder: '请输入操作类别'
        },
        safety_manager: {
          key: 'qualificationType',
          label: '资格类型',
          placeholder: '如 主要负责人、安全管理人员'
        },
        registered_safety_engineer: {
          key: 'practiceCategory',
          label: '执业类别',
          placeholder: '请输入注册执业类别'
        }
      })[form.certificateCategory]
  )
  const syncCatalog = (row: ItemForm): void => {
    row.workCode = catalogOptions.value.find((item) => item.id === row.catalogId)?.itemCode || ''
  }
  const addItem = (): void => {
    form.items.push(makeItem())
  }
  const removeItem = (index: number): void => {
    form.items.splice(index, 1)
  }
  const handleCategoryChange = (): void => {
    form.items = [makeItem()]
  }
  const toEmployee = (row: SmisPersonnelCertificate): EmployeeIntegrationItem => ({
    id: row.employeeId,
    tenantId: row.tenantId || '',
    employeeNo: row.employeeNo,
    employeeName: row.employeeName,
    avatarUrl: row.avatarUrl || null,
    gender: row.gender || null,
    phone: row.phone || '',
    jobTitle: row.jobTitle || null,
    employmentStatus: 'active',
    organization: row.organizationName
      ? { id: '', organizationCode: '', organizationName: row.organizationName }
      : null
  })

  const validateItems = (): boolean => {
    if (!form.items.length) {
      ElMessage.warning('请至少新增一个作业项目')
      return false
    }
    const invalid = form.items.some(
      (item) =>
        !item.catalogId ||
        !item.approvalDate ||
        !item.effectiveDate ||
        item.effectiveDate < item.approvalDate
    )
    if (invalid) {
      ElMessage.warning('请完整填写作业项目日期，且有效日期不能早于批准日期')
      return false
    }
    if (new Set(form.items.map((item) => item.catalogId)).size !== form.items.length) {
      ElMessage.warning('同一证件不能重复选择作业项目')
      return false
    }
    return true
  }
  const handleSubmit = async (): Promise<boolean> => {
    try {
      await formRef.value?.validate()
      if (!validateItems()) return false
      const payload: SmisPersonnelCertificateSavePayload = {
        id: form.id,
        employeeId: form.employeeId,
        certificateCategory: form.certificateCategory,
        certificateNumber: form.certificateNumber.trim(),
        issuingAuthority: form.issuingAuthority.trim() || null,
        archiveNumber: form.archiveNumber.trim() || null,
        certificatePhotoUrl: form.certificatePhotoUrl || null,
        warningStatus: form.warningStatus,
        extraFields: { ...form.extraFields },
        remark: form.remark.trim() || null,
        items: form.items.map((item) => ({
          id: item.id,
          catalogId: item.catalogId,
          approvalDate: item.approvalDate,
          effectiveDate: item.effectiveDate,
          reminderDays: Number(item.reminderDays),
          dismissalReason: isEditing.value ? item.dismissalReason || null : null
        }))
      }
      await savePersonnelCertificate(payload)
      emit('success')
      return true
    } catch {
      return false
    }
  }
  const loadCatalogs = async (): Promise<void> => {
    const types: SmisQualificationCatalogType[] = [
      'work_item',
      'work_category',
      'permitted_operation_item'
    ]
    const results = await Promise.all(
      types.map((type) =>
        fetchQualificationCatalogList({
          catalogType: type,
          status: 'enabled',
          purpose: 'option',
          from: 0,
          to: 9999
        })
      )
    )
    catalogOptions.value = results.flatMap((result) => result.data)
  }
  const handleOpen = async (data: PersonnelCertificateDialogOpenData): Promise<void> => {
    isEditing.value = data.mode === 'edit'
    Object.assign(form, initial())
    employeeSelection.value = []
    if (data.row) {
      Object.assign(form, {
        id: data.mode === 'edit' ? data.row.id : undefined,
        employeeId: data.row.employeeId,
        certificateCategory: data.row.certificateCategory,
        certificateNumber:
          data.mode === 'copy' ? `${data.row.certificateNumber}-副本` : data.row.certificateNumber,
        issuingAuthority: data.row.issuingAuthority || '',
        archiveNumber: data.row.archiveNumber || '',
        certificatePhotoUrl: data.row.certificatePhotoUrl || '',
        warningStatus: data.row.warningStatus,
        extraFields: { ...data.row.extraFields },
        remark: data.row.remark || '',
        items: data.row.items.map((item) => ({
          key: `item-${++itemSequence}`,
          id: data.mode === 'edit' ? item.id : undefined,
          catalogId: item.catalogId,
          workCode: item.workCode,
          approvalDate: item.approvalDate,
          effectiveDate: item.effectiveDate,
          reminderDays: item.reminderDays,
          dismissalReason: data.mode === 'edit' ? item.dismissalReason || undefined : undefined
        }))
      })
      employeeSelection.value = [toEmployee(data.row)]
    }
    await nextTick()
    formRef.value?.clearValidate()
    await dialogRef.value?.handleOpen(data, {
      title:
        data.mode === 'edit'
          ? '编辑人员证件'
          : data.mode === 'copy'
            ? '复制并新增人员证件'
            : '新增人员证件',
      subtitle: '统一维护人员、证件和多项作业资质；日期变更自动形成复审记录',
      confirmText: data.mode === 'copy' ? '复制并保存' : '保存人员证件',
      contentMaxHeight: 'calc(100vh - 128px)',
      onOpen: async (_data, api) => {
        api.setLoading(true)
        try {
          await Promise.all(
            [
              'smisCertificateCategory',
              'smisCertificateWarningStatus',
              'smisCertificateReminderDays',
              'smisCertificateDismissalReason'
            ].map((code) => userStore.ensureDictLoaded(code))
          )
          await loadCatalogs()
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
  .certificate-dialog {
    display: grid;
    gap: 16px;

    &__employee {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      gap: 14px;
      align-items: center;
      padding: 14px 16px;
      background: color-mix(in srgb, var(--theme-color) 7%, var(--default-box-color));
      border-left: 3px solid var(--theme-color);
      border-radius: var(--el-border-radius-base);

      p {
        margin: 4px 0 0;
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }

      > span {
        font-size: 12px;
        color: var(--theme-color);
      }
    }

    &__grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 0 20px;

      .is-wide {
        grid-column: span 2;
      }
    }

    &__photo {
      grid-row: span 2;
    }

    &__hint {
      display: flex;
      gap: 6px;
      align-items: center;
      margin: 12px 2px 0;
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }

    :deep(.el-select),
    :deep(.el-date-editor) {
      width: 100%;
    }
  }

  @media (width <= 980px) {
    .certificate-dialog__grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (width <= 680px) {
    .certificate-dialog__grid {
      grid-template-columns: 1fr;

      .is-wide {
        grid-column: auto;
      }
    }

    .certificate-dialog__employee {
      grid-template-columns: auto minmax(0, 1fr);

      > span {
        grid-column: 1/-1;
      }
    }
  }
</style>
