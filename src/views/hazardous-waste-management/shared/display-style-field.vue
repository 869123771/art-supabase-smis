<template>
  <div class="hazardous-display-style-field">
    <ElColorPicker v-model="textColor" show-alpha aria-label="选择文字颜色" />
    <ElSelect
      v-model="tagStyle"
      class="hazardous-display-style-field__select"
      placeholder="标签样式"
    >
      <ElOption
        v-for="item in options"
        :key="String(item.value)"
        :label="item.label"
        :value="String(item.value)"
      />
    </ElSelect>
    <ElTag
      class="hazardous-display-style-field__preview"
      :type="tagStyle || 'info'"
      effect="light"
      :title="previewText"
    >
      <span :style="{ color: textColor || undefined }">{{ previewText }}</span>
    </ElTag>
  </div>
</template>

<script setup lang="ts">
  import type { FormItemOption } from '@/components/core/forms/art-form/index.vue'
  import type { SmisHazardousWasteTagStyle } from '@smis/api'

  defineProps<{
    options: FormItemOption[]
    previewText: string
  }>()

  const textColor = defineModel<string | null | undefined>('textColor', { required: true })
  const tagStyle = defineModel<SmisHazardousWasteTagStyle>('tagStyle', { required: true })
</script>

<style scoped lang="scss">
  .hazardous-display-style-field {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    width: fit-content;
    max-width: 100%;

    &__select {
      width: 168px;
    }

    &__preview {
      justify-content: center;
      width: auto;
      min-width: 112px;
      max-width: 200px;

      span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  @media (width <= 480px) {
    .hazardous-display-style-field {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      width: 100%;

      &__select {
        width: 100%;
      }

      &__preview {
        grid-column: 1 / -1;
      }
    }
  }
</style>
