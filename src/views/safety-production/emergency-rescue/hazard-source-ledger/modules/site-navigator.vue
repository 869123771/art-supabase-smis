<template>
  <ArtSectionCard class="site-navigator" title="场所导航" subtitle="按场所层级筛选危险源">
    <template #actions>
      <ElButton text circle aria-label="刷新场所树" @click="$emit('refresh')">
        <ArtSvgIcon icon="ri:refresh-line" />
      </ElButton>
    </template>
    <ElScrollbar class="site-navigator__scroll">
      <div class="site-navigator__body" v-loading="loading">
        <ElAlert v-if="error" :title="error" type="error" :closable="false" show-icon />
        <ElTree
          v-else-if="treeData.length"
          :data="treeData"
          node-key="id"
          :props="{ label: 'siteName', children: 'children' }"
          default-expand-all
          highlight-current
          :current-node-key="selectedKey"
          @node-click="(node: SmisHazardSite) => $emit('select', node.id)"
        >
          <template #default="{ data }">
            <span class="site-navigator__node">
              <ArtSvgIcon :icon="data.children?.length ? 'ri:folder-3-line' : 'ri:map-pin-line'" />
              <span :title="data.siteName">{{ data.siteName }}</span>
            </span>
          </template>
        </ElTree>
        <ArtEmptyState v-else title="暂无场所" description="请先在场所维护中建立场所树。" />
      </div>
    </ElScrollbar>
  </ArtSectionCard>
</template>

<script setup lang="ts">
  import ArtSectionCard from '@/components/core/surfaces/art-section-card/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import ArtEmptyState from '@/components/core/feedback/art-empty-state/index.vue'
  import type { SmisHazardSite } from '@smis/api'

  const props = defineProps<{
    data: SmisHazardSite[]
    loading?: boolean
    error?: string | null
    selectedKey: string
  }>()
  defineEmits<{ select: [key: string]; refresh: [] }>()

  const treeData = computed(() => [
    { id: 'all', siteName: '全部场所', organizationId: '', sort: -1, children: props.data }
  ])
</script>

<style scoped lang="scss">
  .site-navigator {
    height: 100%;

    :deep(.art-section-card__body),
    :deep(.art-async-state) {
      display: flex;
      flex: 1 1 auto;
      flex-direction: column;
      min-height: 0;
    }

    &__scroll {
      flex: 1 1 auto;
      min-height: 0;
    }

    &__body {
      padding: 4px 2px 12px;
    }

    &__node {
      display: flex;
      gap: 8px;
      align-items: center;
      min-width: 0;
    }

    &__node svg {
      flex: 0 0 auto;
      color: var(--theme-color);
    }

    &__node span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    :deep(.el-tree-node__content) {
      height: 38px;
      border-radius: var(--el-border-radius-base);
    }

    :deep(.el-tree-node.is-current > .el-tree-node__content) {
      color: var(--theme-color);
      background: color-mix(in srgb, var(--theme-color) 10%, transparent);
    }
  }
</style>
