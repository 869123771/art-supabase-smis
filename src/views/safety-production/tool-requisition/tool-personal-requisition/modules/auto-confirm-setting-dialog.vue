<template>
  <ArtDialog ref="dialogRef" size="sm">
    <div class="auto-confirm-setting__notice">
      <ArtSvgIcon icon="ri:timer-line" />
      <p>发放后领用人未主动确认时，系统将在设定天数到期后自动确认，并记录确认来源为“系统”。</p>
    </div>
    <ArtForm
      ref="formRef"
      v-model="form"
      :rules="rules"
      :items="formItems"
      :span="24"
      label-position="top"
      :show-submit="false"
      :show-reset="false"
    />
  </ArtDialog>
</template>

<script setup lang="ts">
  import type { FormRules } from 'element-plus'
  import type { ArtDialogExpose } from '@/components/core/dialogs/art-dialog/types'
  import type { FormItem } from '@/components/core/forms/art-form/index.vue'
  import { fetchToolSetting, saveToolSetting } from '@smis/api'

  interface SettingForm {
    autoConfirmDays: number
  }

  const emit = defineEmits<{ success: [days: number] }>()
  const dialogRef = ref<ArtDialogExpose>()
  const formRef = ref<{ validate: () => Promise<boolean>; clearValidate: () => void }>()
  const form = reactive<SettingForm>({ autoConfirmDays: 3 })
  const formItems: FormItem[] = [
    {
      label: '自动确认等待天数',
      key: 'autoConfirmDays',
      type: 'number',
      span: 24,
      description: '可配置 1–30 天，默认 3 天；修改后仅影响尚未确认的领用明细。',
      props: { min: 1, max: 30, precision: 0, controlsPosition: 'right', class: '!w-full' }
    }
  ]
  const rules: FormRules<SettingForm> = {
    autoConfirmDays: [{ required: true, message: '请输入自动确认等待天数', trigger: 'change' }]
  }

  const handleSubmit = async (): Promise<boolean> => {
    try {
      await formRef.value?.validate()
      await saveToolSetting(form.autoConfirmDays)
      emit('success', form.autoConfirmDays)
      return true
    } catch {
      return false
    }
  }

  const handleOpen = async (): Promise<void> => {
    await dialogRef.value?.handleOpen(undefined, {
      title: '自动确认规则',
      subtitle: '配置领用人未操作时的系统确认时限',
      confirmText: '保存规则',
      onOpen: async (_data, api) => {
        api.setLoading(true)
        try {
          const result = await fetchToolSetting()
          form.autoConfirmDays = result.data?.autoConfirmDays ?? 3
          await nextTick()
          formRef.value?.clearValidate()
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
  .auto-confirm-setting {
    &__notice {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      padding: 12px 16px;
      margin-bottom: 16px;
      color: var(--art-gray-800);
      background: var(--art-gray-100);
      border-radius: var(--el-border-radius-base);

      svg {
        flex: 0 0 auto;
        margin-top: 2px;
        font-size: 22px;
        color: var(--theme-color);
      }

      p {
        margin: 0;
      }
    }
  }
</style>
