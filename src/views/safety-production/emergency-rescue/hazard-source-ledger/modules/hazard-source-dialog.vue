<template>
  <ArtDialog ref="dialogRef" size="xl">
    <div class="hazard-dialog">
      <div class="hazard-dialog__context">
        <span><ArtSvgIcon icon="ri:alarm-warning-line" /></span>
        <div>
          <strong>危险源基础信息与管控责任</strong>
          <p>危险源编号保存后按租户编号规则自动生成；提交后进入正式台账统计。</p>
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
        <template #siteId>
          <ElTreeSelect
            v-model="form.siteId"
            class="hazard-dialog__control"
            :data="sites"
            :props="{ label: 'siteName', children: 'children' }"
            node-key="id"
            value-key="id"
            check-strictly
            filterable
            default-expand-all
            placeholder="请选择场所"
          />
        </template>
        <template #controlOrganizationId>
          <ElTreeSelect
            v-model="form.controlOrganizationId"
            class="hazard-dialog__control"
            :data="organizations"
            :props="{ label: 'organizationName', children: 'children' }"
            node-key="id"
            value-key="id"
            check-strictly
            filterable
            default-expand-all
            placeholder="请选择管控部门"
          />
        </template>
        <template #responsibleEmployeeId>
          <ArtEmployeeSelect
            v-model="form.responsibleEmployeeId"
            v-model:selected-data="employeeSelection"
            :api-fn="fetchHazardSourceEmployees"
            :tenant-id="getUserInfo.tenantId"
            title="选择危险源责任人"
            subtitle="数据来自当前租户员工花名册"
            placeholder="点击从员工花名册选择"
          />
        </template>
        <template #imageUrls>
          <ArtUploadImage
            v-model="form.imageUrls"
            title="上传危险源照片"
            multiple
            :limit="9"
            :size="112"
          />
        </template>
      </ArtForm>
    </div>

    <template #footer="{ api }">
      <div class="hazard-dialog__footer">
        <ElButton :disabled="submitting" @click="api.handleClose()">关闭</ElButton>
        <ElButton :loading="submitting" @click="handleSave(false)">保存</ElButton>
        <ElButton
          v-auth="'SmisHazardSourceLedger:Submit'"
          type="primary"
          :loading="submitting"
          @click="handleSave(true)"
        >
          保存并提交
        </ElButton>
      </div>
    </template>
  </ArtDialog>
</template>

<script setup lang="ts">
  import type { FormRules } from 'element-plus'
  import type { EmployeeIntegrationItem } from '@/api/integration/employees'
  import ArtDialog from '@/components/core/dialogs/art-dialog/index.vue'
  import type { ArtDialogExpose } from '@/components/core/dialogs/art-dialog/types'
  import ArtForm, { type FormItem } from '@/components/core/forms/art-form/index.vue'
  import ArtUploadImage from '@/components/core/forms/art-upload-image/index.vue'
  import ArtEmployeeSelect from '@/components/business/art-employee-select/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import { useDocumentNumberRule } from '@/hooks/core/useDocumentNumberRule'
  import { useUserStore } from '@/store/modules/user'
  import {
    fetchHazardSourceEmployees,
    saveHazardSource,
    type SmisHazardSite,
    type SmisTreeOrganization,
    type SmisHazardSource,
    type SmisHazardSourceLevel,
    type SmisHazardSourceRiskLevel
  } from '@smis/api'

  export interface HazardSourceDialogOpenData {
    row?: SmisHazardSource
    sites: SmisHazardSite[]
    organizations: SmisTreeOrganization[]
    presetSiteId?: string
  }
  interface HazardForm {
    id?: string
    hazardNo: string
    hazardName: string
    siteId: string
    hazardLevel: SmisHazardSourceLevel | ''
    riskLevel: SmisHazardSourceRiskLevel
    controlOrganizationId: string
    responsibleEmployeeId?: string
    quantity?: number
    location: string
    evaluationDate: string
    evaluationOrganization: string
    filingDate: string
    filingOrganization: string
    filingNo: string
    imageUrls: string[]
    remark: string
  }
  interface FormExpose {
    validate: () => Promise<boolean>
    clearValidate: () => void
  }

  const emit = defineEmits<{ success: [type: 'add' | 'edit'] }>()
  const userStore = useUserStore()
  const { getDictMap, getUserInfo } = storeToRefs(userStore)
  const dialogRef = ref<ArtDialogExpose<HazardSourceDialogOpenData>>()
  const formRef = ref<FormExpose>()
  const numberRule = useDocumentNumberRule('smis.hazard_source')
  const submitting = ref(false)
  const sites = shallowRef<SmisHazardSite[]>([])
  const organizations = shallowRef<SmisTreeOrganization[]>([])
  const employeeSelection = shallowRef<EmployeeIntegrationItem[]>([])
  const initialForm = (): HazardForm => ({
    hazardNo: '',
    hazardName: '',
    siteId: '',
    hazardLevel: '',
    riskLevel: 'unidentified',
    controlOrganizationId: '',
    responsibleEmployeeId: undefined,
    quantity: undefined,
    location: '',
    evaluationDate: '',
    evaluationOrganization: '',
    filingDate: '',
    filingOrganization: '',
    filingNo: '',
    imageUrls: [],
    remark: ''
  })
  const form = reactive<HazardForm>(initialForm())
  const dictOptions = (code: string) =>
    (getDictMap.value[code] ?? []).map((item) => ({
      label: item.label || item.name,
      value: item.value
    }))
  const items = computed<FormItem[]>(() => [
    { label: '识别信息', key: 'identity', type: 'divider', span: 24 },
    {
      label: '危险源编号',
      key: 'hazardNo',
      type: 'input',
      description: numberRule.description.value,
      props: numberRule.inputProps(Boolean(form.id), '保存后自动生成', true)
    },
    {
      label: '危险源名称',
      key: 'hazardName',
      type: 'input',
      props: { maxlength: 160, placeholder: '请输入危险源名称' }
    },
    { label: '所在场所', key: 'siteId', type: 'text' },
    {
      label: '数量',
      key: 'quantity',
      type: 'number',
      props: {
        min: 0.001,
        precision: 3,
        step: 1,
        controlsPosition: 'right',
        class: '!w-full',
        placeholder: '请输入数量'
      }
    },
    {
      label: '地点',
      key: 'location',
      type: 'input',
      props: { maxlength: 200, placeholder: '请输入危险源具体地点' }
    },
    {
      label: '危险等级',
      key: 'hazardLevel',
      type: 'select',
      options: dictOptions('smisHazardSourceLevel'),
      props: { clearable: false }
    },
    { label: '风险与责任', key: 'control', type: 'divider', span: 24 },
    {
      label: '风险等级',
      key: 'riskLevel',
      type: 'select',
      options: dictOptions('smisHazardSourceRiskLevel'),
      props: { clearable: false }
    },
    { label: '管控部门', key: 'controlOrganizationId', type: 'text' },
    { label: '责任人', key: 'responsibleEmployeeId', type: 'text' },
    { label: '评价与备案', key: 'archive', type: 'divider', span: 24 },
    {
      label: '评价时间',
      key: 'evaluationDate',
      type: 'date',
      props: {
        valueFormat: 'YYYY-MM-DD',
        clearable: true,
        class: '!w-full',
        placeholder: '请选择评价时间'
      }
    },
    {
      label: '评价单位',
      key: 'evaluationOrganization',
      type: 'input',
      props: { maxlength: 200, placeholder: '请输入评价单位' }
    },
    {
      label: '备案时间',
      key: 'filingDate',
      type: 'date',
      props: {
        valueFormat: 'YYYY-MM-DD',
        clearable: true,
        class: '!w-full',
        placeholder: '请选择备案时间'
      }
    },
    {
      label: '备案单位',
      key: 'filingOrganization',
      type: 'input',
      props: { maxlength: 200, placeholder: '请输入备案单位' }
    },
    {
      label: '备案号',
      key: 'filingNo',
      type: 'input',
      span: 24,
      props: { maxlength: 100, placeholder: '请输入备案号' }
    },
    { label: '照片与说明', key: 'evidence', type: 'divider', span: 24 },
    { label: '危险源照片', key: 'imageUrls', type: 'text', span: 24 },
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
        placeholder: '补充危险特征、管控边界或现场说明'
      }
    }
  ])
  const rules: FormRules<HazardForm> = {
    hazardName: [{ required: true, message: '请输入危险源名称', trigger: 'blur' }],
    siteId: [{ required: true, message: '请选择场所', trigger: 'change' }],
    hazardLevel: [{ required: true, message: '请选择危险等级', trigger: 'change' }],
    riskLevel: [{ required: true, message: '请选择风险等级', trigger: 'change' }],
    controlOrganizationId: [{ required: true, message: '请选择管控部门', trigger: 'change' }]
  }

  const toEmployeeSelection = (row: SmisHazardSource): EmployeeIntegrationItem[] =>
    row.responsibleEmployeeId
      ? [
          {
            id: row.responsibleEmployeeId,
            tenantId: getUserInfo.value.tenantId || '',
            organizationId: row.controlOrganizationId,
            employeeNo: row.responsibleEmployeeNo || '',
            employeeName: row.responsibleEmployeeName || '未命名员工',
            avatarUrl: null,
            jobTitle: null,
            employmentStatus: 'active',
            organization: {
              id: row.controlOrganizationId,
              organizationCode: '',
              organizationName: row.controlOrganizationName
            }
          }
        ]
      : []
  const handleSave = async (submit: boolean): Promise<void> => {
    if (submitting.value) return
    try {
      await formRef.value?.validate()
      submitting.value = true
      await saveHazardSource(
        {
          ...toRaw(form),
          hazardLevel: form.hazardLevel as SmisHazardSourceLevel,
          responsibleEmployeeId: form.responsibleEmployeeId || null,
          quantity: form.quantity ?? null,
          location: form.location || null,
          evaluationDate: form.evaluationDate || null,
          evaluationOrganization: form.evaluationOrganization || null,
          filingDate: form.filingDate || null,
          filingOrganization: form.filingOrganization || null,
          filingNo: form.filingNo || null
        },
        submit
      )
      emit('success', form.id ? 'edit' : 'add')
      dialogRef.value?.handleClose(true)
    } catch {
      /* 表单或服务端会给出明确提示 */
    } finally {
      submitting.value = false
    }
  }
  const handleOpen = async (data: HazardSourceDialogOpenData): Promise<void> => {
    Object.assign(form, initialForm())
    sites.value = data.sites
    organizations.value = data.organizations
    employeeSelection.value = []
    if (data.row) {
      Object.assign(form, {
        id: data.row.id,
        hazardNo: data.row.hazardNo,
        hazardName: data.row.hazardName,
        siteId: data.row.siteId,
        hazardLevel: data.row.hazardLevel,
        riskLevel: data.row.riskLevel,
        controlOrganizationId: data.row.controlOrganizationId,
        responsibleEmployeeId: data.row.responsibleEmployeeId || undefined,
        quantity: data.row.quantity ?? undefined,
        location: data.row.location || '',
        evaluationDate: data.row.evaluationDate || '',
        evaluationOrganization: data.row.evaluationOrganization || '',
        filingDate: data.row.filingDate || '',
        filingOrganization: data.row.filingOrganization || '',
        filingNo: data.row.filingNo || '',
        imageUrls: [...data.row.imageUrls],
        remark: data.row.remark || ''
      })
      employeeSelection.value = toEmployeeSelection(data.row)
    } else form.siteId = data.presetSiteId || ''
    await nextTick()
    formRef.value?.clearValidate()
    await dialogRef.value?.handleOpen(data, {
      title: data.row ? '编辑危险源' : '新增危险源',
      subtitle: '维护危险源识别、场所归属、风险分级与管控责任',
      contentMaxHeight: 'calc(100vh - 150px)',
      loading: true,
      onOpen: async (_data, api) => {
        try {
          await Promise.all([
            numberRule.loadRule(),
            userStore.ensureDictLoaded('smisHazardSourceLevel'),
            userStore.ensureDictLoaded('smisHazardSourceRiskLevel')
          ])
        } finally {
          api.setLoading(false)
        }
      }
    })
  }
  defineExpose({ handleOpen })
</script>

<style scoped lang="scss">
  .hazard-dialog {
    &__context {
      display: grid;
      grid-template-columns: 44px minmax(0, 1fr);
      gap: 12px;
      align-items: center;
      padding: 14px 16px;
      margin-bottom: 18px;
      background: color-mix(in srgb, var(--el-color-danger) 7%, var(--default-box-color));
      border-left: 3px solid var(--el-color-danger);
      border-radius: var(--el-border-radius-base);
    }

    &__context > span {
      display: grid;
      place-items: center;
      width: 44px;
      height: 44px;
      color: var(--el-color-danger);
      background: var(--default-box-color);
      border-radius: var(--el-border-radius-base);
    }

    &__context p {
      margin: 3px 0 0;
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }

    &__control {
      width: 100%;
    }

    &__footer {
      display: flex;
      gap: 10px;
      align-items: center;
      justify-content: flex-end;
      width: 100%;
    }

    :deep(.art-upload) {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
  }
</style>
