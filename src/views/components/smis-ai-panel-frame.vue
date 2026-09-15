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
  .smis-ai-panel-frame {
    position: relative;
    padding: var(--art-space-4);
    overflow: hidden;
    background:
      radial-gradient(
        circle at 0 0,
        color-mix(in srgb, var(--theme-color) 8%, transparent) 0,
        transparent 34%
      ),
      var(--default-box-color);
    border: 1px solid color-mix(in srgb, var(--theme-color) 16%, var(--el-border-color));
    border-radius: calc(var(--el-border-radius-base) + 2px);

    &::before {
      position: absolute;
      inset: 0 0 auto;
      height: 2px;
      content: '';
      background: linear-gradient(
        90deg,
        var(--theme-color),
        rgb(56 189 248 / 75%),
        transparent 72%
      );
    }

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
      display: grid;
      flex: 0 0 42px;
      place-items: center;
      width: 42px;
      height: 42px;
      font-size: 20px;
      color: #fff;
      background: linear-gradient(145deg, var(--theme-color), #6366f1);
      border: 1px solid rgb(255 255 255 / 28%);
      border-radius: calc(var(--el-border-radius-base) + 2px);
      box-shadow: 0 7px 18px color-mix(in srgb, var(--theme-color) 18%, transparent);
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
        color: var(--art-text-gray-900);
      }

      small {
        font-size: var(--art-font-size-caption);
        line-height: 1.5;
        color: var(--art-text-gray-500);
      }
    }

    &__eyebrow {
      font-size: 11px;
      font-weight: 700;
      color: var(--theme-color);
      letter-spacing: 0.08em;
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
