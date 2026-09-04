<template>
  <ArtSectionCard
    class="hazardous-category-nav"
    title="危废分类"
    subtitle="分类上下文与名录同步"
    :loading="loading"
    :error="error"
    :empty="!loading && !error && !data.length"
    empty-title="暂无危废分类"
    empty-description="请先新增一级分类。"
    :min-height="340"
    @retry="emit('refresh')"
  >
    <template #actions>
      <ArtIconButton
        v-auth="'SmisHazardousWasteCatalog:AddCategory'"
        icon="ri:add-line"
        :label="selectedCategory ? '新增下级分类' : '新增危废分类'"
        @click="emit('add', selectedCategory?.id)"
      />
      <ArtIconButton
        v-auth="'SmisHazardousWasteCatalog:EditCategory'"
        icon="ri:edit-line"
        label="编辑当前分类"
        :disabled="!selectedCategory"
        @click="selectedCategory && emit('edit', selectedCategory)"
      />
      <ArtIconButton
        v-auth="'SmisHazardousWasteCatalog:DeleteCategory'"
        icon="ri:delete-bin-line"
        label="删除当前分类"
        :disabled="!selectedCategory"
        @click="selectedCategory && emit('delete', selectedCategory)"
      />
      <ArtIconButton
        icon="ri:refresh-line"
        label="刷新分类"
        :loading="loading"
        @click="emit('refresh')"
      />
    </template>
    <div class="hazardous-category-nav__content">
      <ElInput v-model="keyword" clearable placeholder="搜索名称或编码" aria-label="搜索危废分类"
        ><template #prefix><ArtSvgIcon icon="ri:search-line" /></template
      ></ElInput>
      <button
        type="button"
        class="hazardous-category-nav__all"
        :class="{ 'is-current': selectedKey === ALL_KEY }"
        @click="emit('select', ALL_KEY)"
        ><ArtSvgIcon icon="ri:archive-stack-line" /><span
          ><strong>全部名录</strong><small>{{ categoryCount }} 个分类节点</small></span
        ><ArtSvgIcon v-if="selectedKey === ALL_KEY" icon="ri:check-line"
      /></button>
      <ElScrollbar class="hazardous-category-nav__scrollbar">
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
          <template #default="{ data: node }"
            ><div class="hazardous-category-nav__node"
              ><ArtSvgIcon
                :icon="node.children?.length ? 'ri:folder-3-line' : 'ri:price-tag-3-line'" /><span
                ><strong>{{ node.categoryName }}</strong
                ><small>{{ node.categoryCode }} · {{ node.catalogCount || 0 }} 项</small></span
              ><ArtSvgIcon v-if="selectedKey === node.id" icon="ri:check-line" /></div
          ></template>
        </ElTree>
      </ElScrollbar>
    </div>
  </ArtSectionCard>
</template>
<script setup lang="ts">
  import type { ElTree, TreeNodeData } from 'element-plus'
  import ArtIconButton from '@/components/core/widget/art-icon-button/index.vue'
  import ArtSectionCard from '@/components/core/surfaces/art-section-card/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import TreeUtils from '@/utils/tree'
  import type { SmisHazardousWasteCategory } from '@smis/api'
  const ALL_KEY = 'all'
  const props = defineProps<{
    data: SmisHazardousWasteCategory[]
    loading: boolean
    error: string | null
    selectedKey: string
  }>()
  const emit = defineEmits<{
    select: [key: string]
    refresh: []
    add: [parentId?: string]
    edit: [row: SmisHazardousWasteCategory]
    delete: [row: SmisHazardousWasteCategory]
  }>()
  const treeRef = ref<InstanceType<typeof ElTree>>()
  const keyword = ref('')
  const treeProps = { children: 'children', label: 'categoryName' }
  const utils = new TreeUtils({ idKey: 'id', parentKey: 'parentId', childrenKey: 'children' })
  const categoryCount = computed(() => utils.treeToList(props.data).length)
  const selectedCategory = computed(() =>
    props.selectedKey === ALL_KEY
      ? undefined
      : (utils.findNode(props.data, props.selectedKey) as SmisHazardousWasteCategory | undefined)
  )
  const defaultExpandedKeys = computed(() => props.data.map((item) => item.id))
  const filterNode = (value: string, data: TreeNodeData): boolean => {
    const item = data as SmisHazardousWasteCategory
    const term = value.trim().toLowerCase()
    return !term || `${item.categoryName} ${item.categoryCode}`.toLowerCase().includes(term)
  }
  const handleNodeClick = (item: SmisHazardousWasteCategory): void => emit('select', item.id)
  watch(keyword, (value) => treeRef.value?.filter(value))
  watch(
    () => props.selectedKey,
    async (value) => {
      await nextTick()
      treeRef.value?.setCurrentKey(value === ALL_KEY ? undefined : value)
    },
    { immediate: true }
  )
</script>
<style scoped lang="scss">
  .hazardous-category-nav {
    height: 100%;

    :deep(.art-section-card__body),
    :deep(.art-async-state),
    :deep(.art-async-state__content) {
      height: 100%;
      min-height: 0;
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
      grid-template-columns: 36px 1fr 18px;
      gap: 10px;
      align-items: center;
      width: 100%;
      min-height: 58px;
      padding: 8px 10px;
      font: inherit;
      text-align: left;
      cursor: pointer;
      background: var(--art-gray-100);
      border: 1px solid transparent;
      border-radius: var(--el-border-radius-base);

      &.is-current,
      &:hover {
        background: color-mix(in srgb, var(--theme-color) 9%, var(--default-box-color));
        border-color: color-mix(in srgb, var(--theme-color) 22%, transparent);
      }

      > svg:first-child {
        width: 22px;
        color: var(--theme-color);
      }

      span {
        display: grid;
        min-width: 0;
      }

      small {
        margin-top: 2px;
        font-size: 11px;
        color: var(--el-text-color-secondary);
      }
    }

    &__scrollbar {
      flex: 1;
      min-height: 0;
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

      > svg {
        color: var(--theme-color);
      }

      span {
        display: grid;
        min-width: 0;
      }

      strong,
      small {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      small {
        font-size: 10px;
        color: var(--el-text-color-secondary);
      }
    }
  }
</style>
