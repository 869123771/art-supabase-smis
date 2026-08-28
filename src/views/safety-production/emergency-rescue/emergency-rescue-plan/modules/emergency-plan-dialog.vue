<template>
  <ArtDialog ref="dialogRef" size="xl">
    <div class="plan-dialog">
      <div class="plan-dialog__context">
        <span><ArtSvgIcon icon="ri:file-shield-2-line" /></span>
        <div
          ><strong>预案适用范围与演练规则</strong
          ><p>预案编码保存后自动生成；预案级别随适用单位自动联动，不允许手工篡改。</p></div
        >
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
        <template #applicableOrganizationId>
          <ElTreeSelect
            v-model="form.applicableOrganizationId"
            class="plan-dialog__control"
            :data="organizations"
            :props="{ label: 'organizationName', children: 'children' }"
            node-key="id"
            value-key="id"
            check-strictly
            filterable
            default-expand-all
            placeholder="请选择适用单位"
          />
        </template>
        <template #applicablePositionId>
          <ElSelect
            v-model="form.applicablePositionId"
            class="plan-dialog__control"
            filterable
            clearable
            placeholder="请选择适用岗位"
          >
            <ElOption
              v-for="position in positionOptions"
              :key="position.id"
              :label="`${position.positionName} · ${position.positionCode}`"
              :value="position.id"
            />
          </ElSelect>
        </template>
        <template #planLevel>
          <div class="plan-dialog__derived">
            <ArtDictDisplay
              dict-code="smisEmergencyPlanLevel"
              :value="derivedPlanLevel"
              display="tag"
            />
            <small>由适用单位自动联动</small>
          </div>
        </template>
        <template #isValid>
          <div class="plan-dialog__derived">
            <ElTag :type="currentIsValid ? 'success' : 'info'" effect="light">{{
              currentIsValid ? '是' : '否'
            }}</ElTag>
            <small>请使用列表“有效/置废”操作变更</small>
          </div>
        </template>
      </ArtForm>
    </div>

    <template #footer="{ api }">
      <div class="plan-dialog__footer">
        <ElButton @click="api.handleClose()">关闭</ElButton>
        <ElButton :loading="submitting" @click="handleSave(false)">保存</ElButton>
        <ElButton
          v-auth="'SmisEmergencyRescuePlan:Submit'"
          type="primary"
          :loading="submitting"
          @click="handleSave(true)"
          >保存并提交</ElButton
        >
      </div>
    </template>
  </ArtDialog>
</template>

<script setup lang="ts">
  import type { FormRules } from 'element-plus'
  import ArtDialog from '@/components/core/dialogs/art-dialog/index.vue'
  import type { ArtDialogExpose } from '@/components/core/dialogs/art-dialog/types'
  import ArtForm, { type FormItem } from '@/components/core/forms/art-form/index.vue'
  import ArtDictDisplay from '@/components/core/base/art-dict-display/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import { useDocumentNumberRule } from '@/hooks/core/useDocumentNumberRule'
  import { useUserStore } from '@/store/modules/user'
  import TreeUtils from '@/utils/tree'
  import {
    saveEmergencyRescuePlan,
    type SmisEmergencyPosition,
    type SmisEmergencyRescuePlan,
    type SmisEmergencyPlanCategory,
    type SmisEmergencyPlanFrequency,
    type SmisEmergencyPlanLevel,
    type SmisEmergencyPlanWarningStatus,
    type SmisTreeOrganization
  } from '@smis/api'

  export interface EmergencyPlanDialogOpenData {
    row?: SmisEmergencyRescuePlan
    organizations: SmisTreeOrganization[]
    positions: SmisEmergencyPosition[]
  }
  interface PlanForm {
    id?: string
    planNo: string
    planName: string
    applicableOrganizationId: string
    planCategory: SmisEmergencyPlanCategory | ''
    applicablePositionId?: string
    frequency: SmisEmergencyPlanFrequency | ''
    isSpecialEquipmentDrill: boolean
    warningStatus: SmisEmergencyPlanWarningStatus
    description: string
  }
  interface FormExpose {
    validate: () => Promise<boolean>
    clearValidate: () => void
  }

  const emit = defineEmits<{ success: [type: 'add' | 'edit'] }>()
  const userStore = useUserStore()
  const { getDictMap } = storeToRefs(userStore)
  const dialogRef = ref<ArtDialogExpose<EmergencyPlanDialogOpenData>>()
  const formRef = ref<FormExpose>()
  const numberRule = useDocumentNumberRule('smis.emergency_rescue_plan')
  const organizations = shallowRef<SmisTreeOrganization[]>([])
  const positions = shallowRef<SmisEmergencyPosition[]>([])
  const currentIsValid = ref(true)
  const submitting = ref(false)
  const treeUtils = new TreeUtils({ idKey: 'id', parentKey: 'parentId', childrenKey: 'children' })
  const initialForm = (): PlanForm => ({
    planNo: '',
    planName: '',
    applicableOrganizationId: '',
    planCategory: '',
    applicablePositionId: undefined,
    frequency: '',
    isSpecialEquipmentDrill: false,
    warningStatus: 'normal',
    description: ''
  })
  const form = reactive<PlanForm>(initialForm())
  const dictOptions = (code: string) =>
    (getDictMap.value[code] ?? []).map((item) => ({
      label: item.label || item.name,
      value: item.value
    }))
  const flatOrganizations = computed(
    () => treeUtils.treeToList(organizations.value) as SmisTreeOrganization[]
  )
  const selectedOrganization = computed(() =>
    flatOrganizations.value.find((item) => item.id === form.applicableOrganizationId)
  )
  const positionOptions = computed(() =>
    positions.value.filter(
      (item) =>
        !form.applicableOrganizationId ||
        !item.organizationId ||
        item.organizationId === form.applicableOrganizationId
    )
  )
  const derivedPlanLevel = computed<SmisEmergencyPlanLevel>(() => {
    const organization = selectedOrganization.value
    if (!organization || organization.organizationType === 'company') return 'company'
    if (organization.organizationType === 'division') return 'operation_area'
    let depth = 1
    let parentId = organization.parentId
    while (parentId) {
      depth += 1
      parentId = flatOrganizations.value.find((item) => item.id === parentId)?.parentId
    }
    return depth >= 4 ? 'team' : 'operation_department'
  })
  const booleanOptions = computed(() =>
    dictOptions('commonBoolean').map((item) => ({ ...item, value: item.value === 'true' }))
  )
  const items = computed<FormItem[]>(() => [
    { label: '预案信息', key: 'identity', type: 'divider', span: 24 },
    {
      label: '预案编码',
      key: 'planNo',
      type: 'input',
      description: numberRule.description.value,
      props: numberRule.inputProps(Boolean(form.id), '保存后自动生成', true)
    },
    {
      label: '预案名称',
      key: 'planName',
      type: 'input',
      props: { maxlength: 160, placeholder: '请输入预案名称' }
    },
    {
      label: '预案类别',
      key: 'planCategory',
      type: 'select',
      options: dictOptions('smisEmergencyPlanCategory'),
      props: { clearable: false }
    },
    {
      label: '周期频次',
      key: 'frequency',
      type: 'select',
      options: dictOptions('smisEmergencyPlanFrequency'),
      props: { clearable: false }
    },
    { label: '适用范围', key: 'scope', type: 'divider', span: 24 },
    { label: '适用单位', key: 'applicableOrganizationId', type: 'text' },
    { label: '预案级别', key: 'planLevel', type: 'text' },
    { label: '适用岗位', key: 'applicablePositionId', type: 'text' },
    {
      label: '是否特种设备演练',
      key: 'isSpecialEquipmentDrill',
      type: 'radioGroup',
      options: booleanOptions.value
    },
    { label: '状态与说明', key: 'state', type: 'divider', span: 24 },
    { label: '是否有效', key: 'isValid', type: 'text' },
    {
      label: '预警状态',
      key: 'warningStatus',
      type: 'radioGroup',
      options: dictOptions('smisEmergencyPlanWarningStatus')
    },
    {
      label: '预案描述',
      key: 'description',
      type: 'textarea',
      span: 24,
      props: {
        rows: 5,
        maxlength: 2000,
        showWordLimit: true,
        resize: 'none',
        placeholder: '说明适用场景、响应范围及演练要点'
      }
    }
  ])
  const rules: FormRules<PlanForm> = {
    planName: [{ required: true, message: '请输入预案名称', trigger: 'blur' }],
    planCategory: [{ required: true, message: '请选择预案类别', trigger: 'change' }],
    frequency: [{ required: true, message: '请选择周期频次', trigger: 'change' }],
    applicableOrganizationId: [{ required: true, message: '请选择适用单位', trigger: 'change' }]
  }
  watch(
    () => form.applicableOrganizationId,
    () => {
      if (
        form.applicablePositionId &&
        !positionOptions.value.some((item) => item.id === form.applicablePositionId)
      )
        form.applicablePositionId = undefined
    }
  )
  const handleSave = async (submit: boolean): Promise<void> => {
    if (submitting.value) return
    try {
      await formRef.value?.validate()
      submitting.value = true
      await saveEmergencyRescuePlan(
        {
          ...toRaw(form),
          planCategory: form.planCategory as SmisEmergencyPlanCategory,
          frequency: form.frequency as SmisEmergencyPlanFrequency,
          applicablePositionId: form.applicablePositionId || null
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
  const handleOpen = async (data: EmergencyPlanDialogOpenData): Promise<void> => {
    Object.assign(form, initialForm())
    organizations.value = data.organizations
    positions.value = data.positions
    currentIsValid.value = data.row?.isValid ?? true
    if (data.row)
      Object.assign(form, {
        id: data.row.id,
        planNo: data.row.planNo,
        planName: data.row.planName,
        applicableOrganizationId: data.row.applicableOrganizationId,
        planCategory: data.row.planCategory,
        applicablePositionId: data.row.applicablePositionId || undefined,
        frequency: data.row.frequency,
        isSpecialEquipmentDrill: data.row.isSpecialEquipmentDrill,
        warningStatus: data.row.warningStatus,
        description: data.row.description || ''
      })
    await nextTick()
    formRef.value?.clearValidate()
    await dialogRef.value?.handleOpen(data, {
      title: data.row ? '编辑应急救援预案' : '新增应急救援预案',
      subtitle: '维护预案适用范围、类别、演练频次与预警状态',
      contentMaxHeight: 'calc(100vh - 150px)',
      loading: true,
      onOpen: async (_data, api) => {
        try {
          await Promise.all([
            numberRule.loadRule(),
            ...[
              'commonBoolean',
              'smisEmergencyPlanCategory',
              'smisEmergencyPlanFrequency',
              'smisEmergencyPlanLevel',
              'smisEmergencyPlanWarningStatus'
            ].map((code) => userStore.ensureDictLoaded(code))
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
  .plan-dialog {
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

    &__control {
      width: 100%;
    }

    &__derived {
      display: flex;
      gap: 10px;
      align-items: center;
      min-height: 32px;

      small {
        color: var(--el-text-color-secondary);
      }
    }

    &__footer {
      display: flex;
      gap: 10px;
      align-items: center;
      justify-content: flex-end;
      width: 100%;
    }
  }
</style>
