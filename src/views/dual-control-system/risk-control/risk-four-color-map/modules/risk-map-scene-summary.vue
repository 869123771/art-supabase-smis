<template>
  <div v-if="scene" class="risk-map-scene-summary art-card-xs">
    <div class="risk-map-scene-summary__heading">
      <span>场景设置</span>
      <small>底图与画布尺寸</small>
    </div>
    <dl>
      <div
        ><dt>场景底图</dt><dd>{{ scene.backgroundUrl ? '已配置' : '未配置' }}</dd></div
      >
      <div
        ><dt>画布尺寸</dt><dd>{{ scene.canvasWidth }} × {{ scene.canvasHeight }}</dd></div
      >
    </dl>
    <ElButton
      v-if="showAction"
      v-auth="'SmisDualControlRiskFourColorMap:EditScene'"
      class="w-full"
      @click="emit('edit-scene')"
    >
      编辑底图与尺寸
    </ElButton>
  </div>
</template>

<script setup lang="ts">
  import type { SmisRiskMapScene } from '@smis/api'

  defineOptions({ name: 'SmisRiskMapSceneSummary' })

  withDefaults(defineProps<{ scene?: SmisRiskMapScene; showAction?: boolean }>(), {
    showAction: true
  })
  const emit = defineEmits<{ 'edit-scene': [] }>()
</script>

<style scoped lang="scss">
  .risk-map-scene-summary {
    display: grid;
    gap: var(--art-space-3);
    width: 100%;
    padding: var(--art-space-3);
    margin-top: var(--art-space-4);

    &__heading {
      display: flex;
      gap: var(--art-space-2);
      align-items: baseline;
      justify-content: space-between;

      span {
        font-weight: 700;
        color: var(--el-text-color-primary);
      }

      small {
        font-size: var(--art-font-size-caption);
        color: var(--el-text-color-secondary);
      }
    }

    dl {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--art-space-2);
      margin: 0;
    }

    dl > div {
      display: grid;
      gap: 2px;
      min-width: 0;
      padding: var(--art-space-2);
      background: var(--el-fill-color-light);
      border-radius: var(--el-border-radius-small);
    }

    dt {
      color: var(--el-text-color-secondary);
    }

    dd {
      margin: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      font-weight: 600;
      color: var(--el-text-color-primary);
      white-space: nowrap;
    }
  }
</style>
