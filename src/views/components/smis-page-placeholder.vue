<template>
  <div class="smis-page-placeholder art-full-height business-workspace-page">
    <BusinessWorkspaceHeader
      eyebrow="SMIS安全管理"
      :title="title"
      :description="`${section}菜单入口已建立，业务页面将在后续需求中继续完善。`"
      icon="ri:shield-check-line"
      :tags="[
        { label: section, type: 'info' },
        { label: '页面待建设', type: 'warning' }
      ]"
      density="compact"
    />

    <section class="smis-page-placeholder__content art-card-xs" :aria-label="`${title}占位页`">
      <ArtEmptyState
        title="页面入口已预留"
        :description="`${title}的菜单、路由和页面目录已就绪，详细功能将在后续页面需求中补充。`"
        size="large"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
  import BusinessWorkspaceHeader from '@/components/business/business-workspace-header/index.vue'
  import ArtEmptyState from '@/components/core/feedback/art-empty-state/index.vue'

  defineOptions({ name: 'SmisPagePlaceholder' })

  defineProps<{
    section: string
    title: string
  }>()
</script>

<style scoped lang="scss">
  .smis-page-placeholder {
    gap: var(--art-space-3);
    min-width: 0;

    &__content {
      display: grid;
      flex: 1;
      place-items: center;
      min-height: 280px;
    }
  }
</style>
