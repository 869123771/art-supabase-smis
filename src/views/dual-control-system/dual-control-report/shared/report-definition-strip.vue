<template>
  <aside class="report-definition-strip art-card-xs" role="note" :aria-label="label">
    <span aria-hidden="true"><ArtSvgIcon icon="ri:information-line" /></span>
    <p
      ><strong>{{ label }}：</strong>{{ description }}</p
    >
  </aside>
</template>

<script setup lang="ts">
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'

  defineOptions({ name: 'SmisReportDefinitionStrip' })

  withDefaults(
    defineProps<{
      label?: string
      description: string
    }>(),
    { label: '统计口径' }
  )
</script>

<style scoped lang="scss">
  .report-definition-strip {
    display: flex;
    gap: var(--art-space-2);
    align-items: flex-start;
    min-width: 0;
    padding: 11px var(--art-section-padding);
    color: var(--el-text-color-secondary);
    background: color-mix(in srgb, var(--theme-color) 5%, var(--default-box-color));

    > span {
      flex: none;
      margin-top: 2px;
      color: var(--theme-color);
    }

    p {
      min-width: 0;
      margin: 0;
      font-size: 12px;
      line-height: 1.65;
      text-wrap: pretty;
    }

    strong {
      color: var(--el-text-color-primary);
    }
  }
</style>
