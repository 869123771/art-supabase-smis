<template>
  <ArtSectionCard
    class="tool-org-nav"
    title="组织导航"
    subtitle="按组织结构筛选员工花名册"
    :loading="loading"
    :error="error"
    :empty="!loading && !error && !data.length"
    empty-title="暂无可用组织"
    empty-description="请先在系统组织管理中维护并启用组织。"
    :min-height="320"
    @retry="emit('refresh')"
  >
    <template #actions>
      <ArtIconButton
        icon="ri:refresh-line"
        label="刷新组织结构"
        :loading="loading"
        @click="emit('refresh')"
      />
    </template>

    <div class="tool-org-nav__content">
      <ElInput
        v-model="keyword"
        clearable
        placeholder="搜索组织名称或编码"
        aria-label="搜索组织名称或编码"
      >
        <template #prefix><ArtSvgIcon icon="ri:search-line" /></template>
      </ElInput>

      <button
        type="button"
        class="tool-org-nav__all"
        :class="{ 'is-current': selectedKey === ALL_KEY }"
        @click="emit('select', ALL_KEY)"
      >
        <span aria-hidden="true"><ArtSvgIcon icon="ri:group-line" /></span>
        <span><strong>全部员工</strong><small>查看当前租户全部员工档案</small></span>
        <ArtSvgIcon v-if="selectedKey === ALL_KEY" icon="ri:check-line" aria-hidden="true" />
      </button>

      <div class="tool-org-nav__section-label">
        <span>组织结构</span><small>{{ organizationCount }} 个有效节点</small>
      </div>

      <ElScrollbar class="tool-org-nav__scrollbar">
        <ElTree
          ref="treeRef"
          :data="data"
          :props="treeProps"
          :filter-node-method="filterNode"
          :default-expanded-keys="defaultExpandedKeys"
          node-key="id"
          highlight-current
          :expand-on-click-node="false"
          @node-click="handleNodeClick"
        >
          <template #default="{ data: node }">
            <div class="tool-org-nav__node">
              <span aria-hidden="true"><ArtSvgIcon :icon="getOrganizationIcon(node)" /></span>
              <span>
                <strong :title="node.name">{{ node.name }}</strong>
                <small :title="node.code" translate="no">{{ node.code }}</small>
              </span>
              <ArtSvgIcon
                v-if="selectedKey === node.id"
                class="tool-org-nav__check"
                icon="ri:check-line"
                aria-hidden="true"
              />
            </div>
          </template>
        </ElTree>
      </ElScrollbar>

      <footer class="tool-org-nav__selection" aria-live="polite">
        <span aria-hidden="true"><ArtSvgIcon icon="ri:filter-3-line" /></span>
        <div
          ><small>当前范围</small><strong>{{ selectedLabel }}</strong></div
        >
        <ElTag type="primary" size="small" effect="plain" round>{{ employeeCount }} 人</ElTag>
      </footer>
    </div>
  </ArtSectionCard>
</template>

<script setup lang="ts">
  import type { ElTree, TreeNodeData } from 'element-plus'
  import ArtIconButton from '@/components/core/widget/art-icon-button/index.vue'
  import ArtSectionCard from '@/components/core/surfaces/art-section-card/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import TreeUtils from '@/utils/tree'
  import type { SmisToolScopeOption } from '@smis/api'

  const ALL_KEY = 'all'
  const props = defineProps<{
    data: SmisToolScopeOption[]
    loading: boolean
    error: string | null
    selectedKey: string
    employeeCount: number
  }>()
  const emit = defineEmits<{ select: [key: string]; refresh: [] }>()
  const treeUtils = new TreeUtils({ idKey: 'id', parentKey: 'parentId', childrenKey: 'children' })
  const treeRef = ref<InstanceType<typeof ElTree>>()
  const keyword = ref('')
  const treeProps = { children: 'children', label: 'name' }
  const flatOrganizations = computed(() => treeUtils.treeToList(props.data))
  const organizationCount = computed(() => flatOrganizations.value.length)
  const defaultExpandedKeys = computed(() => props.data.map((item) => item.id))
  const selectedLabel = computed(
    () =>
      (props.selectedKey === ALL_KEY
        ? undefined
        : flatOrganizations.value.find((item) => item.id === props.selectedKey)?.name) || '全部员工'
  )

  const filterNode = (value: string, data: TreeNodeData): boolean => {
    const node = data as SmisToolScopeOption
    const normalized = value.trim().toLocaleLowerCase('zh-CN')
    return (
      !normalized ||
      [node.name, node.code].some((field) =>
        String(field ?? '')
          .toLocaleLowerCase('zh-CN')
          .includes(normalized)
      )
    )
  }
  const getOrganizationIcon = (node: SmisToolScopeOption): string =>
    ({
      company: 'ri:building-4-line',
      division: 'ri:git-branch-line',
      department: 'ri:team-line',
      team: 'ri:group-2-line'
    })[node.type || ''] || 'ri:node-tree'
  const handleNodeClick = (node: SmisToolScopeOption): void => emit('select', node.id)
  const syncCurrentNode = async (): Promise<void> => {
    await nextTick()
    treeRef.value?.setCurrentKey(props.selectedKey === ALL_KEY ? undefined : props.selectedKey)
  }

  watch(keyword, (value) => treeRef.value?.filter(value))
  watch(() => props.selectedKey, syncCurrentNode, { immediate: true })
  watch(
    () => props.data,
    async () => {
      await syncCurrentNode()
      treeRef.value?.filter(keyword.value)
    }
  )
</script>

<style scoped lang="scss">
  .tool-org-nav {
    height: 100%;

    :deep(.art-section-card__body),
    :deep(.art-async-state),
    :deep(.art-async-state__content) {
      height: 100%;
      min-height: 0;
    }

    :deep(.art-section-card__body) {
      display: flex;
      flex-direction: column;
    }

    &__content {
      display: flex;
      flex: 1;
      flex-direction: column;
      gap: 10px;
      min-height: 0;
    }

    &__all {
      display: grid;
      grid-template-columns: 36px minmax(0, 1fr) 18px;
      gap: 10px;
      align-items: center;
      width: 100%;
      min-height: 58px;
      padding: 8px 10px;
      font: inherit;
      color: var(--el-text-color-regular);
      text-align: left;
      cursor: pointer;
      background: var(--art-gray-100);
      border: 1px solid transparent;
      border-radius: var(--el-border-radius-base);
      transition:
        background-color var(--art-motion-duration-fast),
        border-color var(--art-motion-duration-fast),
        box-shadow var(--art-motion-duration-fast);

      &:hover,
      &.is-current {
        background: color-mix(in srgb, var(--theme-color) 9%, var(--default-box-color));
        border-color: color-mix(in srgb, var(--theme-color) 22%, transparent);
      }

      &.is-current {
        box-shadow: inset 3px 0 0 var(--theme-color);
      }

      &:focus-visible {
        outline: 2px solid var(--theme-color);
        outline-offset: 2px;
      }

      > span:first-child {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        color: var(--theme-color);
        background: var(--default-box-color);
        border-radius: var(--el-border-radius-base);
      }

      > span:nth-child(2) {
        display: grid;
        min-width: 0;
      }

      strong {
        color: var(--el-text-color-primary);
      }

      small {
        margin-top: 2px;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 11px;
        color: var(--el-text-color-secondary);
        white-space: nowrap;
      }

      > svg {
        color: var(--theme-color);
      }
    }

    &__section-label {
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-height: 28px;
      padding: 8px 2px 0;
      font-size: 12px;
      color: var(--el-text-color-secondary);
      border-top: 1px solid var(--el-border-color-lighter);

      span {
        font-weight: 600;
        color: var(--el-text-color-primary);
      }
    }

    &__scrollbar {
      flex: 1;
      min-height: 0;
    }

    :deep(.el-tree) {
      min-width: 100%;
      background: transparent;
    }

    :deep(.el-tree-node__content) {
      min-height: 48px;
      margin-bottom: 2px;
      border-radius: var(--el-border-radius-base);
    }

    :deep(.el-tree-node__content:hover) {
      background: var(--art-gray-100);
    }

    :deep(.el-tree-node.is-current > .el-tree-node__content) {
      background: color-mix(in srgb, var(--theme-color) 9%, var(--default-box-color));
      box-shadow: inset 3px 0 0 var(--theme-color);
    }

    &__node {
      display: grid;
      flex: 1;
      grid-template-columns: 20px minmax(0, 1fr) 18px;
      gap: 7px;
      align-items: center;
      min-width: 0;
      padding-right: 8px;

      > span:nth-child(2) {
        display: grid;
        min-width: 0;
      }

      strong,
      small {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      strong {
        font-size: 13px;
        color: var(--el-text-color-primary);
      }

      small {
        margin-top: 1px;
        font-size: 10px;
        color: var(--el-text-color-secondary);
      }
    }

    &__check {
      color: var(--theme-color);
    }

    &__selection {
      display: grid;
      flex: none;
      grid-template-columns: 28px minmax(0, 1fr) auto;
      gap: 9px;
      align-items: center;
      padding: 9px 10px;
      background: var(--art-gray-100);
      border: 1px solid var(--el-border-color-lighter);
      border-radius: var(--el-border-radius-base);

      > span {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        color: var(--theme-color);
        background: var(--default-box-color);
        border-radius: var(--el-border-radius-base);
      }

      > div {
        display: grid;
        min-width: 0;
      }

      small,
      strong {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      small {
        font-size: 10px;
        color: var(--el-text-color-secondary);
      }

      strong {
        font-size: 12px;
        color: var(--el-text-color-primary);
      }
    }
  }
</style>
