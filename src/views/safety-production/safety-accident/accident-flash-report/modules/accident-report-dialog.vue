<template>
  <ArtDialog ref="dialogRef" size="xl">
    <div class="accident-report-dialog">
      <div class="accident-report-dialog__context">
        <span><ArtSvgIcon icon="ri:alarm-warning-line" /></span>
        <div>
          <strong>快速固化事故事实、人员影响与防范责任</strong>
          <p>事故编号保存后自动生成；人员档案按事故发生时点留存，便于后续调查与申报追溯。</p>
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
        <template #reporterEmployeeId>
          <ArtEmployeeSelect
            v-model="form.reporterEmployeeId"
            v-model:selected-data="reporterSelection"
            :api-fn="fetchAccidentEmployeeCandidates"
            title="选择事故上报人"
            subtitle="默认当前登录账号关联员工，可从员工花名册修改"
            placeholder="点击选择上报人"
            :clearable="false"
          />
        </template>
        <template #operationAreaOrganizationId>
          <AccidentOrganizationSelect
            v-model="form.operationAreaOrganizationId"
            :organizations="organizations"
          />
        </template>
        <template #imageUrls>
          <ArtUploadImage
            v-model="form.imageUrls"
            title="上传事故照片"
            multiple
            :limit="9"
            :size="112"
          />
        </template>
        <template #measures>
          <AccidentMeasuresEditor v-model="form.measures" />
        </template>
        <template #people>
          <AccidentPeopleEditor v-model="form.people" />
        </template>
      </ArtForm>
    </div>
  </ArtDialog>
</template>

<script setup lang="ts">
  import dayjs from 'dayjs'
  import { cloneDeep } from 'lodash-es'
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
    fetchAccidentEmployeeCandidates,
    saveAccidentReport,
    type SmisAccidentCategory,
    type SmisAccidentEmployee,
    type SmisAccidentLevel,
    type SmisAccidentPerson,
    type SmisAccidentPreventionMeasure,
    type SmisAccidentReport,
    type SmisTreeOrganization
  } from '@smis/api'
  import AccidentOrganizationSelect from '../../shared/accident-organization-select.vue'
  import AccidentMeasuresEditor from './accident-measures-editor.vue'
  import AccidentPeopleEditor from './accident-people-editor.vue'

  export interface AccidentReportDialogOpenData {
    row?: SmisAccidentReport
    organizations: SmisTreeOrganization[]
    currentEmployee?: SmisAccidentEmployee | null
  }
  interface AccidentReportForm {
    id?: string
    accidentNo: string
    accidentName: string
    reporterEmployeeId: string
    accidentTime: string
    accidentLocation: string
    accidentCategories: SmisAccidentCategory[]
    operationAreaOrganizationId?: string
    accidentLevel: SmisAccidentLevel | ''
    indirectEconomicLoss: number
    causeAnalysis: string
    resultDetermination: string
    imageUrls: string[]
    measures: SmisAccidentPreventionMeasure[]
    people: SmisAccidentPerson[]
  }
  interface FormExpose {
    validate: () => Promise<boolean>
    clearValidate: () => void
  }

  const emit = defineEmits<{ success: [type: 'add' | 'edit'] }>()
  const userStore = useUserStore()
  const { getDictMap } = storeToRefs(userStore)
  const dialogRef = ref<ArtDialogExpose<AccidentReportDialogOpenData>>()
  const formRef = ref<FormExpose>()
  const numberRule = useDocumentNumberRule('smis.accident_report')
  const organizations = shallowRef<SmisTreeOrganization[]>([])
  const reporterSelection = shallowRef<EmployeeIntegrationItem[]>([])
  const initialForm = (): AccidentReportForm => ({
    id: undefined,
    accidentNo: '',
    accidentName: '',
    reporterEmployeeId: '',
    accidentTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    accidentLocation: '',
    accidentCategories: [],
    operationAreaOrganizationId: undefined,
    accidentLevel: '',
    indirectEconomicLoss: 0,
    causeAnalysis: '',
    resultDetermination: '',
    imageUrls: [],
    measures: [],
    people: []
  })
  const form = reactive<AccidentReportForm>(initialForm())
  const dictOptions = (code: string) =>
    (getDictMap.value[code] ?? []).map((item) => ({
      label: item.label || item.name,
      value: item.value
    }))
  const items = computed<FormItem[]>(() => [
    { label: '事故识别', key: 'identity', type: 'divider', span: 24 },
    {
      label: '事故编号',
      key: 'accidentNo',
      type: 'input',
      description: numberRule.description.value,
      props: numberRule.inputProps(Boolean(form.id), '保存后自动生成', true)
    },
    {
      label: '事故名称',
      key: 'accidentName',
      type: 'input',
      props: { maxlength: 160, placeholder: '简明描述事故事件' }
    },
    { label: '上报人', key: 'reporterEmployeeId', type: 'text' },
    {
      label: '事故时间',
      key: 'accidentTime',
      type: 'date',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
      props: { placeholder: '选择事故发生时间', clearable: false, type: 'datetime' }
    },
    {
      label: '事故地点',
      key: 'accidentLocation',
      type: 'input',
      span: 24,
      props: { maxlength: 300, placeholder: '请输入具体地点，便于现场追溯' }
    },
    { label: '分类与影响', key: 'classification', type: 'divider', span: 24 },
    {
      label: '事故类别',
      key: 'accidentCategories',
      type: 'select',
      span: 24,
      options: dictOptions('smisAccidentCategory'),
      props: {
        multiple: true,
        collapseTags: true,
        collapseTagsTooltip: true,
        clearable: true,
        placeholder: '可多选事故类别'
      }
    },
    { label: '事故发生作业区', key: 'operationAreaOrganizationId', type: 'text' },
    {
      label: '事故级别',
      key: 'accidentLevel',
      type: 'select',
      options: dictOptions('smisAccidentLevel'),
      props: { clearable: false, placeholder: '请选择事故级别' }
    },
    {
      label: '间接经济损失（万元）',
      key: 'indirectEconomicLoss',
      type: 'number',
      props: { min: 0, precision: 2, controlsPosition: 'right', class: '!w-full' }
    },
    { label: '分析与判定', key: 'analysis', type: 'divider', span: 24 },
    {
      label: '原因分析',
      key: 'causeAnalysis',
      type: 'textarea',
      span: 12,
      props: {
        rows: 4,
        maxlength: 3000,
        showWordLimit: true,
        resize: 'none',
        placeholder: '记录直接原因、间接原因和管理因素'
      }
    },
    {
      label: '结果判定',
      key: 'resultDetermination',
      type: 'textarea',
      span: 12,
      props: {
        rows: 4,
        maxlength: 3000,
        showWordLimit: true,
        resize: 'none',
        placeholder: '记录事故性质、责任或初步判定'
      }
    },
    { label: '事故照片', key: 'imageUrls', type: 'text', span: 24 },
    { label: '防范措施', key: 'prevention', type: 'divider', span: 24 },
    { label: '', key: 'measures', type: 'text', span: 24 },
    { label: '人员信息', key: 'personnel', type: 'divider', span: 24 },
    { label: '', key: 'people', type: 'text', span: 24 }
  ])
  const rules: FormRules<AccidentReportForm> = {
    accidentName: [{ required: true, message: '请输入事故名称', trigger: 'blur' }],
    reporterEmployeeId: [{ required: true, message: '请选择上报人', trigger: 'change' }],
    accidentTime: [{ required: true, message: '请选择事故时间', trigger: 'change' }],
    accidentLocation: [{ required: true, message: '请输入事故地点', trigger: 'blur' }],
    accidentCategories: [{ required: true, message: '请选择至少一个事故类别', trigger: 'change' }],
    accidentLevel: [{ required: true, message: '请选择事故级别', trigger: 'change' }]
  }
  const toEmployeeSelection = (
    employee?: SmisAccidentEmployee | null
  ): EmployeeIntegrationItem[] => (employee ? [employee] : [])
  const handleSubmit = async (): Promise<boolean> => {
    try {
      await formRef.value?.validate()
      if (form.measures.some((measure) => !measure.plannedMeasure.trim())) {
        ElMessage.warning('请补充完整计划防范措施，或删除空白措施')
        return false
      }
      await saveAccidentReport({
        id: form.id,
        accidentName: form.accidentName.trim(),
        reporterEmployeeId: form.reporterEmployeeId,
        accidentTime: form.accidentTime,
        accidentLocation: form.accidentLocation.trim(),
        accidentCategories: [...form.accidentCategories],
        operationAreaOrganizationId: form.operationAreaOrganizationId || null,
        accidentLevel: form.accidentLevel as SmisAccidentLevel,
        indirectEconomicLoss: Number(form.indirectEconomicLoss || 0),
        causeAnalysis: form.causeAnalysis.trim(),
        resultDetermination: form.resultDetermination.trim(),
        imageUrls: [...form.imageUrls],
        measures: form.measures.map((measure, index) => ({
          id: measure.id,
          plannedMeasure: measure.plannedMeasure.trim(),
          plannedImplementationDate: measure.plannedImplementationDate || null,
          responsibleEmployeeId: measure.responsibleEmployeeId || null,
          sort: index
        })),
        people: form.people.map((person, index) => ({
          id: person.id,
          employeeId: person.employeeId,
          jobYears: person.jobYears ?? null,
          safetyEducationLevel: person.safetyEducationLevel?.trim() || null,
          victimNature: person.victimNature?.trim() || null,
          injuryPart: person.injuryPart?.trim() || null,
          injuryDegree: person.injuryDegree?.trim() || null,
          remark: person.remark?.trim() || null,
          sort: index
        }))
      })
      emit('success', form.id ? 'edit' : 'add')
      return true
    } catch {
      return false
    }
  }
  const handleOpen = async (data: AccidentReportDialogOpenData): Promise<void> => {
    Object.assign(form, initialForm())
    organizations.value = data.organizations
    reporterSelection.value = []
    if (data.row) {
      const row = cloneDeep(data.row)
      Object.assign(form, {
        id: row.id,
        accidentNo: row.accidentNo,
        accidentName: row.accidentName,
        reporterEmployeeId: row.reporterEmployeeId,
        accidentTime: dayjs(row.accidentTime).format('YYYY-MM-DD HH:mm:ss'),
        accidentLocation: row.accidentLocation,
        accidentCategories: [...row.accidentCategories],
        operationAreaOrganizationId: row.operationAreaOrganizationId || undefined,
        accidentLevel: row.accidentLevel,
        indirectEconomicLoss: Number(row.indirectEconomicLoss || 0),
        causeAnalysis: row.causeAnalysis || '',
        resultDetermination: row.resultDetermination || '',
        imageUrls: [...row.imageUrls],
        measures: row.measures,
        people: row.people
      })
      reporterSelection.value = toEmployeeSelection(row.reporterEmployee)
    } else if (data.currentEmployee) {
      form.reporterEmployeeId = data.currentEmployee.id
      reporterSelection.value = toEmployeeSelection(data.currentEmployee)
    }
    await nextTick()
    formRef.value?.clearValidate()
    await dialogRef.value?.handleOpen(data, {
      title: data.row ? '编辑事故快报' : '新增事故快报',
      subtitle: '记录事故事实、影响人员、分析判定与防范措施',
      contentMaxHeight: 'calc(100vh - 132px)',
      confirmText: data.row ? '保存更改' : '创建事故快报',
      loading: true,
      onOpen: async (_openData, api) => {
        try {
          await Promise.all([
            numberRule.loadRule(),
            userStore.ensureDictLoaded('smisAccidentCategory'),
            userStore.ensureDictLoaded('smisAccidentLevel')
          ])
        } finally {
          api.setLoading(false)
        }
      },
      onConfirm: handleSubmit,
      onReset: () => Object.assign(form, initialForm())
    })
  }
  onDeactivated(() => dialogRef.value?.handleClose())
  defineExpose({ handleOpen })
</script>

<style scoped lang="scss">
  .accident-report-dialog {
    min-width: 0;

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

      > span {
        display: grid;
        place-items: center;
        width: 44px;
        height: 44px;
        color: var(--el-color-danger);
        background: var(--default-box-color);
        border-radius: var(--el-border-radius-base);
      }

      p {
        margin: 3px 0 0;
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }

    :deep(.art-upload) {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
  }
</style>
