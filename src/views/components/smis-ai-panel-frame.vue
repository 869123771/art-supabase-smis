<template>
  <section v-auth="permission" class="smis-ai-panel-frame" :aria-label="`${eyebrow}：${title}`">
    <header class="smis-ai-panel-frame__header">
      <div class="smis-ai-panel-frame__identity">
        <span class="smis-ai-panel-frame__icon" aria-hidden="true">
          <ArtSvgIcon :icon="icon" />
        </span>
        <div class="smis-ai-panel-frame__copy">
          <span class="smis-ai-panel-frame__eyebrow">{{ eyebrow }}</span>
          <strong>{{ title }}</strong>
          <small>{{ subtitle }}</small>
        </div>
      </div>
      <div class="smis-ai-panel-frame__action">
        <slot name="action" />
      </div>
    </header>
    <slot />
  </section>
</template>

<script setup lang="ts">
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'

  defineOptions({ name: 'SmisAiPanelFrame' })

  defineProps<{
    permission: string
    eyebrow: string
    title: string
    subtitle: string
    icon: string
  }>()
</script>

<style scoped lang="scss">
  @use '@/assets/styles/core/ai-surface-mixins' as ai;

  .smis-ai-panel-frame {
    @include ai.surface;

    padding: var(--art-space-4);

    &__header,
    &__identity {
      display: flex;
      align-items: center;
    }

    &__header {
      gap: var(--art-space-4);
      justify-content: space-between;
    }

    &__identity {
      gap: var(--art-space-3);
      min-width: 0;
    }

    &__icon {
      @include ai.identity-icon(42px, 20px);
    }

    &__copy {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;

      strong {
        font-size: 16px;
        font-weight: 650;
        line-height: 1.45;
        color: var(--el-text-color-primary);
      }

      small {
        font-size: var(--art-font-size-caption);
        line-height: 1.5;
        color: var(--el-text-color-secondary);
      }
    }

    &__eyebrow {
      @include ai.eyebrow;
    }

    &__action {
      flex: 0 0 auto;
    }

    @media (width <= 860px) {
      &__header {
        flex-direction: column;
        align-items: stretch;
      }

      &__action :deep(.el-button) {
        width: 100%;
      }
    }
  }
</style>
