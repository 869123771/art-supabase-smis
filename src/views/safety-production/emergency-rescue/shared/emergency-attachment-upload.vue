<template>
  <div class="attachment-upload">
    <ElUpload
      v-model:file-list="files"
      :http-request="handleUpload"
      :on-success="handleSuccess"
      :on-remove="syncModel"
      :on-error="handleError"
      :limit="limit"
      multiple
      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,image/*"
    >
      <span class="attachment-upload__button"><ArtSvgIcon icon="ri:attachment-2" />选择附件</span>
      <template #tip
        ><div class="attachment-upload__tip"
          >支持文档、压缩包和图片，单个文件不超过 20 MB</div
        ></template
      >
    </ElUpload>
  </div>
</template>

<script setup lang="ts">
  import {
    ElMessage,
    type UploadFile,
    type UploadRequestOptions,
    type UploadUserFile
  } from 'element-plus'
  import { uploadAttachment } from '@/api/common'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import { getFriendlySupabaseErrorMessage } from '@/utils/supabase'

  defineOptions({ name: 'SmisEmergencyAttachmentUpload' })
  const props = withDefaults(defineProps<{ modelValue?: string[]; limit?: number }>(), {
    modelValue: () => [],
    limit: 8
  })
  const emit = defineEmits<{ 'update:modelValue': [value: string[]] }>()
  const files = ref<UploadUserFile[]>([])
  watch(
    () => props.modelValue,
    (urls) => {
      const current = files.value.flatMap((file) => (file.url ? [file.url] : []))
      if (JSON.stringify(current) !== JSON.stringify(urls))
        files.value = urls.map((url) => ({
          name: decodeURIComponent(url.split('/').pop() || '附件'),
          url
        }))
    },
    { immediate: true, deep: true }
  )
  const handleUpload = async (options: UploadRequestOptions) => {
    if (options.file.size > 20 * 1024 * 1024) throw new Error('单个附件不能超过 20 MB')
    return await uploadAttachment(options.file)
  }
  const handleSuccess = (response: unknown, uploadFile: UploadFile) => {
    const resource = Array.isArray(response)
      ? (response[0] as { url?: string; originName?: string })
      : undefined
    if (!resource?.url) return handleError(new Error('附件上传未返回访问地址'))
    const target = files.value.find((file) => file.uid === uploadFile.uid)
    if (target) {
      target.url = resource.url
      target.name = resource.originName || uploadFile.name
    }
    syncModel()
  }
  const syncModel = () =>
    emit(
      'update:modelValue',
      files.value.flatMap((file) => (file.url ? [file.url] : []))
    )
  const handleError = (error: unknown) =>
    ElMessage.error(getFriendlySupabaseErrorMessage(error, '附件上传失败，请重试'))
</script>

<style scoped lang="scss">
  .attachment-upload {
    width: 100%;

    &__tip {
      margin-top: 6px;
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }

    &__button {
      display: inline-flex;
      gap: 6px;
      align-items: center;
      min-height: 32px;
      padding: 0 14px;
      color: var(--el-color-primary);
      cursor: pointer;
      border: 1px solid color-mix(in srgb, var(--el-color-primary) 55%, transparent);
      border-radius: var(--el-border-radius-base);
      transition: background-color 160ms ease;

      &:hover {
        background: color-mix(in srgb, var(--el-color-primary) 8%, transparent);
      }
    }

    :deep(.el-upload-list__item) {
      border-radius: var(--el-border-radius-base);
    }
  }
</style>
