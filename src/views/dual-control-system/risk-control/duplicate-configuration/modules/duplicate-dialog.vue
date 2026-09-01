<template>
  <ArtDialog ref="dialogRef" size="lg">
    <div class="duplicate-dialog">
      <div class="duplicate-dialog__note"
        ><ArtSvgIcon icon="ri:repeat-2-line" /><div
          ><strong>业务菜单重复规则</strong
          ><p
            >规则独立于具体业务数据，可由接入菜单读取后生成周期事项；关闭重复时不提交频次和日历条件。</p
          ></div
        ></div
      >
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
    saveDuplicateConfiguration,
    type SmisConfigurableMenuOption,
    type SmisDuplicateConfiguration,
    type SmisDuplicateConfigurationPayload
  } from '@smis/api'
  export interface DuplicateDialogOpenData {
    row?: SmisDuplicateConfiguration
    tenantId?: string | null
    menus: SmisConfigurableMenuOption[]
  }
  interface FormExpose {
    validate: () => Promise<boolean>
    clearValidate: () => void
  }
  const emit = defineEmits<{ success: [type: 'add' | 'edit'] }>()
  const userStore = useUserStore()
  const { getDictMap } = storeToRefs(userStore)
  const dialogRef = ref<ArtDialogExpose<DuplicateDialogOpenData>>()
  const formRef = ref<FormExpose>()
  const menus = ref<SmisConfigurableMenuOption[]>([])
  const initial = (): SmisDuplicateConfigurationPayload => ({
    tenantId: null,
    menuId: '',
    contentItem: '',
    repeatEnabled: false,
    repeatFrequency: null,
    frequencyUnit: null,
    calendarType: 'none',
    calendarDays: [],
    deadlineTime: null,
    sort: 10,
    textColor: '#2563EB',
    tagStyle: 'primary',
    status: 'enabled'
  })
  const model = reactive(initial())
  const dictOptions = (code: string) =>
    (getDictMap.value[code] ?? []).map((i) => ({ label: i.label || i.name, value: i.value }))
  const statusOptions = computed(() =>
    dictOptions('smisConfigStatus').filter((i) => i.value !== 'voided')
  )
  const tagOptions = computed(() => dictOptions('smisTagStyle'))
  const unitOptions = computed(() => dictOptions('smisFrequencyUnit'))
  const calendarOptions = computed(() => dictOptions('smisCalendarType'))
  const weekOptions = [
    { label: '周一', value: 1 },
    { label: '周二', value: 2 },
    { label: '周三', value: 3 },
    { label: '周四', value: 4 },
    { label: '周五', value: 5 },
    { label: '周六', value: 6 },
    { label: '周日', value: 7 }
  ]
  const monthOptions = Array.from({ length: 31 }, (_, index) => ({
    label: `${index + 1} 日`,
    value: index + 1
  }))
  const items = computed<FormItem[]>(() => [
    {
      label: '关联菜单功能',
      key: 'menuId',
      type: 'select',
      span: 24,
      options: menus.value.map((i) => ({
        label: i.parentTitle ? `${i.parentTitle} / ${i.title}` : i.title,
        value: i.id
      })),
      props: { filterable: true, clearable: false, placeholder: '请选择需要接入重复规则的菜单' }
    },
    {
      label: '内容事项',
      key: 'contentItem',
      type: 'input',
      span: 24,
      props: { maxlength: 200, clearable: true, placeholder: '如 安全巡检任务' }
    },
    {
      label: '重复',
      key: 'repeatEnabled',
      type: 'radioGroup',
      options: [
        { label: '不重复', value: false },
        { label: '重复', value: true }
      ],
      props: { optionType: 'button' }
    },
    {
      label: '重复频次',
      key: 'repeatFrequency',
      type: 'number',
      hidden: !model.repeatEnabled,
      props: { min: 1, max: 999, controlsPosition: 'right' }
    },
    {
      label: '频次单位',
      key: 'frequencyUnit',
      type: 'select',
      hidden: !model.repeatEnabled,
      options: unitOptions.value,
      props: { clearable: false, placeholder: '请选择频次单位' }
    },
    {
      label: '日历规则',
      key: 'calendarType',
      type: 'select',
      hidden: !model.repeatEnabled,
      options: calendarOptions.value,
      props: {
        clearable: false,
        onChange: () => {
          model.calendarDays = []
        }
      }
    },
    {
      label: model.calendarType === 'week' ? '星期选择' : '日期选择',
      key: 'calendarDays',
      type: 'checkboxGroup',
      span: 24,
      hidden: !model.repeatEnabled || model.calendarType === 'none',
      options: model.calendarType === 'week' ? weekOptions : monthOptions,
      props: { optionType: 'button' }
    },
    {
      label: '截止时间',
      key: 'deadlineTime',
      type: 'timePicker',
      hidden: !model.repeatEnabled,
      props: { format: 'HH:mm', valueFormat: 'HH:mm:ss', clearable: true, placeholder: '可选' }
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
          'onUpdate:modelValue': (v: string | null) => (model.textColor = v || '')
        })
    },
    {
      label: '标签样式',
      key: 'tagStyle',
      type: 'select',
      options: tagOptions.value,
      props: { clearable: false }
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
    menuId: [{ required: true, message: '请选择关联菜单功能', trigger: 'change' }],
    contentItem: [{ required: true, message: '请输入内容事项', trigger: 'blur' }],
    repeatFrequency: [
      {
        validator: (_r, _v, cb) =>
          model.repeatEnabled && !model.repeatFrequency ? cb(new Error('请输入重复频次')) : cb(),
        trigger: 'change'
      }
    ],
    frequencyUnit: [
      {
        validator: (_r, _v, cb) =>
          model.repeatEnabled && !model.frequencyUnit ? cb(new Error('请选择频次单位')) : cb(),
        trigger: 'change'
      }
    ],
    calendarDays: [
      {
        validator: (_r, _v, cb) =>
          model.repeatEnabled && model.calendarType !== 'none' && !model.calendarDays.length
            ? cb(new Error('请选择日历日期'))
            : cb(),
        trigger: 'change'
      }
    ]
  }
  watch(
    () => model.repeatEnabled,
    (enabled) => {
      if (!enabled) {
        model.repeatFrequency = null
        model.frequencyUnit = null
        model.calendarType = 'none'
        model.calendarDays = []
        model.deadlineTime = null
      }
    }
  )
  const submit = async () => {
    try {
      await formRef.value?.validate()
      await saveDuplicateConfiguration({
        ...model,
        contentItem: model.contentItem.trim(),
        textColor: model.textColor || null
      })
      emit('success', model.id ? 'edit' : 'add')
      return true
    } catch {
      return false
    }
  }
  const handleOpen = async (data: DuplicateDialogOpenData) => {
    menus.value = data.menus
    Object.assign(model, initial(), { tenantId: data.tenantId })
    if (data.row)
      Object.assign(model, {
        id: data.row.id,
        tenantId: data.row.tenantId,
        menuId: data.row.menuId,
        contentItem: data.row.contentItem,
        repeatEnabled: data.row.repeatEnabled,
        repeatFrequency: data.row.repeatFrequency,
        frequencyUnit: data.row.frequencyUnit,
        calendarType: data.row.calendarType,
        calendarDays: [...data.row.calendarDays],
        deadlineTime: data.row.deadlineTime,
        sort: data.row.sort,
        textColor: data.row.textColor || '#2563EB',
        tagStyle: data.row.tagStyle,
        status: data.row.status === 'voided' ? 'disabled' : data.row.status
      })
    await nextTick()
    formRef.value?.clearValidate()
    await dialogRef.value?.handleOpen(data, {
      title: data.row ? '编辑重复配置' : '新增重复配置',
      subtitle: '按业务菜单定义频次、日历与截止时间',
      confirmText: '保存重复配置',
      onOpen: async (_d, api) => {
        api.setLoading(true)
        try {
          await Promise.all(
            ['smisConfigStatus', 'smisTagStyle', 'smisFrequencyUnit', 'smisCalendarType'].map(
              (code) => userStore.ensureDictLoaded(code)
            )
          )
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
  .duplicate-dialog__note {
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
</style>
