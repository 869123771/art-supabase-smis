<template>
  <ArtDrawer ref="drawerRef" size="lg" :show-footer="false" content-height="calc(100vh - 126px)">
    <div v-if="employee" class="ppe-detail">
      <section class="ppe-detail__identity" aria-label="员工个人标准概览">
        <ElAvatar
          :size="52"
          :src="employee.avatarUrl || undefined"
          :alt="`${employee.employeeName}的头像`"
        >
          {{ employee.employeeName.trim().slice(0, 1) || '员' }}
        </ElAvatar>
        <div class="ppe-detail__person">
          <strong>{{ employee.employeeName }}</strong>
          <span translate="no">{{ employee.employeeNo }}</span>
          <small
            >{{ employee.organizationName || '未分配组织' }} ·
            {{ employee.positionName || '未配置岗位' }}</small
          >
        </div>
        <div class="ppe-detail__summary">
          <span>
            <small>生成状态</small>
            <ElTag :type="employee.personalStandardId ? 'success' : 'warning'" effect="light">
              {{ employee.personalStandardId ? '已生成' : '待生成' }}
            </ElTag>
          </span>
          <span
            ><small>用品定额</small><strong>{{ items.length }} 项</strong></span
          >
          <span
            ><small>最近生成</small><strong>{{ generatedAtLabel }}</strong></span
          >
        </div>
      </section>

      <ArtSectionCard
        class="ppe-detail__items"
        title="个人防护用品明细"
        subtitle="展示定额、发放周期、领用节点及来源标准。"
        :loading="loading"
        :error="error"
        :empty="!loading && !error && !items.length"
        :empty-title="employee.personalStandardId ? '暂无用品明细' : '尚未生成个人标准'"
        :empty-description="
          employee.personalStandardId
            ? '当前个人标准中没有可用的防护用品定额。'
            : '返回员工列表，点击“生成个人标准”后再查看明细。'
        "
        :min-height="280"
        @retry="loadItems"
      >
        <template #actions>
          <ElTag type="primary" effect="plain">{{ items.length }} 项用品</ElTag>
        </template>

        <div class="ppe-detail__list">
          <article v-for="item in items" :key="item.id" class="ppe-detail__item">
            <div class="ppe-detail__material">
              <ElImage
                v-if="item.imageUrls?.[0]"
                class="ppe-detail__image"
                :src="item.imageUrls[0]"
                :preview-src-list="item.imageUrls"
                :alt="`${item.materialName}图片`"
                fit="cover"
                preview-teleported
              />
              <span v-else class="ppe-detail__image is-empty" aria-hidden="true">
                <ArtSvgIcon icon="ri:image-line" />
              </span>
              <div>
                <strong :title="item.materialName">{{ item.materialName }}</strong>
                <small :title="item.materialCode" translate="no">{{ item.materialCode }}</small>
                <span>{{ item.categoryName }} · {{ item.specificationModel || '无规格型号' }}</span>
              </div>
            </div>

            <dl class="ppe-detail__facts">
              <div>
                <dt>定额数量</dt>
                <dd>
                  <strong>{{ item.quotaQuantity }}</strong>
                  <ArtDictDisplay
                    dict-code="smisMaterialUnit"
                    :value="item.basicUnit"
                    display="text"
                  />
                </dd>
              </div>
              <div>
                <dt>发放规则</dt>
                <dd>
                  <ArtDictDisplay
                    dict-code="smisPpeIssuanceCycle"
                    :value="item.issuanceCycle"
                    display="text"
                  />
                  <span> · {{ item.issuanceFrequency }} 次</span>
                </dd>
              </div>
              <div>
                <dt>首次 / 下次领用</dt>
                <dd
                  >{{ item.initialIssueDate || '待设置' }} /
                  {{ item.nextIssueDate || '待计算' }}</dd
                >
              </div>
              <div>
                <dt>来源标准</dt>
                <dd :title="`${item.sourceStandardName} · ${item.sourceStandardNo}`">
                  {{ item.sourceStandardName }}
                  <small translate="no">{{ item.sourceStandardNo }}</small>
                </dd>
              </div>
            </dl>

            <ArtDictDisplay
              class="ppe-detail__status"
              dict-code="smisMaterialEnableStatus"
              :value="item.status"
              display="tag"
            />
          </article>
        </div>
      </ArtSectionCard>
    </div>
  </ArtDrawer>
</template>

<script setup lang="ts">
  import dayjs from 'dayjs'
  import ArtDictDisplay from '@/components/core/base/art-dict-display/index.vue'
  import ArtDrawer from '@/components/core/drawers/art-drawer/index.vue'
  import type { ArtDrawerExpose } from '@/components/core/drawers/art-drawer/types'
  import ArtSectionCard from '@/components/core/surfaces/art-section-card/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import { getFriendlySupabaseErrorMessage } from '@/utils/supabase/error'
  import {
    fetchPpePersonalStandardItems,
    type SmisPpePersonalStandard,
    type SmisPpePersonalStandardItem
  } from '@smis/api'

  const drawerRef = ref<ArtDrawerExpose<SmisPpePersonalStandard>>()
  const employee = ref<SmisPpePersonalStandard>()
  const items = ref<SmisPpePersonalStandardItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const generatedAtLabel = computed(() =>
    employee.value?.generatedAt ? dayjs(employee.value.generatedAt).format('YYYY-MM-DD HH:mm') : '—'
  )

  const loadItems = async (): Promise<void> => {
    if (!employee.value) return
    loading.value = true
    error.value = null
    try {
      const result = await fetchPpePersonalStandardItems(employee.value.employeeId)
      if (result.error) throw result.error
      items.value = result.data ?? []
    } catch (reason) {
      items.value = []
      error.value = getFriendlySupabaseErrorMessage(reason, '个人防护用品明细加载失败，请稍后重试')
    } finally {
      loading.value = false
    }
  }
  const handleOpen = async (row: SmisPpePersonalStandard): Promise<void> => {
    employee.value = row
    items.value = []
    error.value = null
    await drawerRef.value?.handleOpen(row, {
      title: '个人防护用品明细',
      subtitle: `${row.employeeName} · ${row.employeeNo}`,
      showFooter: false,
      onOpen: loadItems
    })
  }

  defineExpose({ handleOpen })
</script>

<style scoped lang="scss">
  .ppe-detail {
    display: grid;
    gap: 14px;
    min-width: 0;

    &__identity {
      display: grid;
      grid-template-columns: 52px minmax(0, 1fr) auto;
      gap: 14px;
      align-items: center;
      padding: 14px 16px;
      background: var(--art-gray-100);
      border-left: 3px solid var(--theme-color);
      border-radius: var(--el-border-radius-base);
    }

    &__identity :deep(.el-avatar) {
      color: var(--art-gray-700);
      background: var(--art-gray-200);
    }

    &__person {
      display: grid;
      min-width: 0;

      strong {
        font-size: 16px;
        color: var(--el-text-color-primary);
      }

      span,
      small {
        margin-top: 2px;
        color: var(--el-text-color-secondary);
      }

      span {
        font-size: 12px;
      }

      small {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    &__summary {
      display: grid;
      grid-template-columns: repeat(3, minmax(86px, auto));
      gap: 10px;

      > span {
        display: grid;
        align-content: center;
        min-height: 48px;
        padding: 6px 10px;
        background: var(--default-box-color);
        border: 1px solid var(--el-border-color-lighter);
        border-radius: var(--el-border-radius-base);
      }

      small {
        margin-bottom: 4px;
        font-size: 10px;
        color: var(--el-text-color-secondary);
      }

      strong {
        font-size: 12px;
        color: var(--el-text-color-primary);
      }
    }

    &__list {
      display: grid;
      gap: 10px;
    }

    &__item {
      display: grid;
      grid-template-columns: minmax(220px, 0.9fr) minmax(420px, 1.6fr) 70px;
      gap: 16px;
      align-items: center;
      min-width: 0;
      padding: 14px;
      background: var(--art-gray-100);
      border: 1px solid var(--el-border-color-lighter);
      border-radius: var(--el-border-radius-base);
    }

    &__material {
      display: grid;
      grid-template-columns: 58px minmax(0, 1fr);
      gap: 12px;
      align-items: center;
      min-width: 0;

      > div {
        display: grid;
        min-width: 0;
      }

      strong,
      small,
      span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      strong {
        color: var(--el-text-color-primary);
      }

      small,
      span {
        margin-top: 3px;
        font-size: 11px;
        color: var(--el-text-color-secondary);
      }
    }

    &__image {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 58px;
      height: 58px;
      background: var(--art-gray-200);
      border-radius: var(--el-border-radius-base);

      &.is-empty {
        font-size: 20px;
        color: var(--el-text-color-placeholder);
      }
    }

    &__facts {
      display: grid;
      grid-template-columns: 0.7fr 0.9fr 1.15fr 1.25fr;
      gap: 12px;
      min-width: 0;
      margin: 0;

      > div {
        min-width: 0;
      }

      dt {
        margin-bottom: 4px;
        font-size: 10px;
        color: var(--el-text-color-secondary);
      }

      dd {
        min-width: 0;
        margin: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 12px;
        color: var(--el-text-color-primary);
        white-space: nowrap;

        strong {
          margin-right: 4px;
          font-size: 15px;
        }

        small {
          display: block;
          margin-top: 3px;
          overflow: hidden;
          text-overflow: ellipsis;
          color: var(--el-text-color-secondary);
          white-space: nowrap;
        }
      }
    }

    &__status {
      justify-self: end;
    }

    @media (width <= 900px) {
      &__identity {
        grid-template-columns: 52px minmax(0, 1fr);
      }

      &__summary {
        grid-column: 1 / -1;
      }

      &__item {
        grid-template-columns: minmax(0, 1fr) auto;
      }

      &__facts {
        grid-column: 1 / -1;
      }

      &__status {
        grid-row: 1;
        grid-column: 2;
      }
    }

    @media (width <= 600px) {
      &__summary,
      &__facts {
        grid-template-columns: 1fr 1fr;
      }

      &__item {
        grid-template-columns: minmax(0, 1fr);
      }

      &__status {
        grid-row: auto;
        grid-column: 1;
        justify-self: start;
      }
    }
  }
</style>
