<template>
  <ArtSectionCard
    class="document-category-navigator"
    title="文档分类"
    subtitle="树形结构由当前租户自定义维护"
    :loading="loading"
    :error="error"
    :empty="!loading && !error && !data.length"
    empty-title="暂无文档分类"
    empty-description="新增一级分类后，即可在右侧登记文档。"
    :min-height="340"
    @retry="emit('refresh')"
  >
    <template #actions>
      <ArtIconButton
        v-auth="'SmisRequiredKnowledge:CategoryAdd'"
        icon="ri:add-line"
        label="新增文档分类"
        @click="emit('add')"
      />
      <ArtIconButton
        v-auth="'SmisRequiredKnowledge:CategoryEdit'"
        icon="ri:edit-line"
        label="编辑当前分类"
        :disabled="!selectedCategory"
        @click="selectedCategory && emit('edit', selectedCategory)"
      />
      <ArtIconButton
        v-auth="'SmisRequiredKnowledge:CategoryDelete'"
        icon="ri:delete-bin-line"
        label="删除当前分类"
        :disabled="!selectedCategory"
        @click="selectedCategory && emit('delete', selectedCategory)"
      />
      <ArtIconButton
        icon="ri:refresh-line"
        label="刷新文档分类"
        :loading="loading"
        @click="emit('refresh')"
      />
    </template>

    <div class="document-category-navigator__content">
      <ElInput v-model="keyword" clearable placeholder="搜索分类名称" aria-label="搜索文档分类名称">
        <template #prefix><ArtSvgIcon icon="ri:search-line" /></template>
      </ElInput>

      <button
        type="button"
        class="document-category-navigator__all"
        :class="{ 'is-current': selectedKey === ALL_KEY }"
        @click="emit('select', ALL_KEY)"
      >
        <span aria-hidden="true"><ArtSvgIcon icon="ri:folder-open-line" /></span>
        <span>
          <strong>全部分类</strong>
          <small>查看全部应知应会文档</small>
        </span>
        <ArtSvgIcon v-if="selectedKey === ALL_KEY" icon="ri:check-line" aria-hidden="true" />
      </button>

      <div class="document-category-navigator__section-label">
        <span>分类结构</span>
        <small>{{ categoryCount }} 个节点</small>
      </div>

      <ElScrollbar class="document-category-navigator__scrollbar">
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
            <div class="document-category-navigator__node">
              <span
                class="document-category-navigator__node-icon"
                :class="{ 'is-disabled': node.status === 'disabled' }"
                aria-hidden="true"
              >
                <ArtSvgIcon :icon="node.children?.length ? 'ri:folder-3-line' : 'ri:folder-line'" />
              </span>
              <span>
                <strong :title="node.categoryName">{{ node.categoryName }}</strong>
                <small>
                  {{ node.documentCount || 0 }} 份文档
                  <template v-if="node.status === 'disabled'"> · 已停用</template>
                </small>
              </span>
              <ArtSvgIcon
                v-if="selectedKey === node.id"
                class="document-category-navigator__check"
                icon="ri:check-line"
                aria-hidden="true"
              />
            </div>
          </template>
        </ElTree>
      </ElScrollbar>
    </div>
  </ArtSectionCard>
</template>

<script setup lang="ts">
  import type { ElTree, TreeNodeData } from 'element-plus'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import ArtSectionCard from '@/components/core/surfaces/art-section-card/index.vue'
  import ArtIconButton from '@/components/core/widget/art-icon-button/index.vue'
  import TreeUtils from '@/utils/tree'
  import type { SmisDocumentCategory } from '@smis/api'

  const ALL_KEY = 'all'
  const props = defineProps<{
    data: SmisDocumentCategory[]
    loading: boolean
    error: string | null
    selectedKey: string
  }>()
  const emit = defineEmits<{
    select: [key: string]
    refresh: []
    add: []
    edit: [row: SmisDocumentCategory]
    delete: [row: SmisDocumentCategory]
  }>()
  const treeUtils = new TreeUtils({ idKey: 'id', parentKey: 'parentId', childrenKey: 'children' })
  const treeRef = ref<InstanceType<typeof ElTree>>()
  const keyword = ref('')
  const treeProps = { children: 'children', label: 'categoryName' }
  const categoryCount = computed(() => treeUtils.treeToList(props.data).length)
  const selectedCategory = computed(() =>
    props.selectedKey === ALL_KEY
      ? undefined
      : (treeUtils.findNode(props.data, props.selectedKey) as SmisDocumentCategory | undefined)
  )
  const defaultExpandedKeys = computed(() => props.data.map((item) => item.id))

  const filterNode = (value: string, data: TreeNodeData): boolean => {
    const category = data as SmisDocumentCategory
    const normalized = value.trim().toLocaleLowerCase('zh-CN')
    return !normalized || category.categoryName.toLocaleLowerCase('zh-CN').includes(normalized)
  }
  const handleNodeClick = (category: SmisDocumentCategory): void => emit('select', category.id)
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
  .document-category-navigator {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    overflow: hidden;

    :deep(.art-section-card__body) {
      display: flex;
      flex: 1;
      flex-direction: column;
      min-height: 0;
      overflow: hidden;
    }

    &__content {
      display: flex;
      flex: 1;
      flex-direction: column;
      gap: 12px;
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
    }

    &__section-label {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-inline: 2px;
      font-size: 12px;
      color: var(--el-text-color-secondary);

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
      min-height: 50px;
      margin-bottom: 2px;
      border-radius: var(--el-border-radius-base);
    }

    :deep(.el-tree-node.is-current > .el-tree-node__content) {
      background: color-mix(in srgb, var(--theme-color) 10%, var(--default-box-color));
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

    &__node-icon {
      color: var(--theme-color);

      &.is-disabled {
        color: var(--el-text-color-placeholder);
      }
    }

    &__check {
      color: var(--theme-color);
    }
  }
</style>
