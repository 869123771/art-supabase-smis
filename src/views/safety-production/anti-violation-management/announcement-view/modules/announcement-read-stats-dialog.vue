<template>
  <ArtDialog ref="dialogRef" size="xl">
    <div v-if="stats" class="announcement-read-stats-dialog">
      <div class="announcement-read-stats-dialog__summary art-card-xs">
        <div
          ><small>应查阅</small><strong>{{ stats.total }}</strong></div
        >
        <div
          ><small>已查阅</small><strong class="is-success">{{ stats.read }}</strong></div
        >
        <div
          ><small>未查阅</small><strong class="is-warning">{{ stats.unread }}</strong></div
        >
        <ElProgress :percentage="readRate" :stroke-width="10" />
      </div>
      <div class="announcement-read-stats-dialog__filter">
        <ElInput
          v-model="keyword"
          clearable
          placeholder="搜索部门或人员姓名"
          prefix-icon="Search"
        />
      </div>
      <ElTable :data="filteredOrganizations" row-key="organizationName" table-layout="fixed">
        <ElTableColumn
          prop="organizationName"
          label="部门/组织"
          min-width="180"
          show-overflow-tooltip
        />
        <ElTableColumn prop="read" label="已读" width="90" align="right" />
        <ElTableColumn prop="unread" label="未读" width="90" align="right" />
        <ElTableColumn label="已读 / 未读人员" min-width="420">
          <template #default="{ row }">
            <div class="announcement-read-stats-dialog__people">
              <ElTag
                v-for="person in row.readers"
                :key="person.userId"
                :type="person.readAt ? 'success' : 'warning'"
                effect="plain"
              >
                {{ person.readerName }} · {{ person.readAt ? '已读' : '未读' }}
              </ElTag>
            </div>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>
  </ArtDialog>
</template>

<script setup lang="ts">
  import ArtDialog from '@/components/core/dialogs/art-dialog/index.vue'
  import type { ArtDialogExpose } from '@/components/core/dialogs/art-dialog/types'
  import {
    fetchAnnouncementReadStats,
    type SmisAnnouncement,
    type SmisAnnouncementReadStats
  } from '@smis/api'

  const dialogRef = ref<ArtDialogExpose<SmisAnnouncement>>()
  const stats = shallowRef<SmisAnnouncementReadStats>()
  const keyword = ref('')
  const readRate = computed(() =>
    stats.value?.total ? Math.round((stats.value.read / stats.value.total) * 100) : 0
  )
  const filteredOrganizations = computed(() => {
    const target = keyword.value.trim().toLowerCase()
    if (!target) return stats.value?.organizations ?? []
    return (stats.value?.organizations ?? []).filter(
      (item) =>
        item.organizationName.toLowerCase().includes(target) ||
        item.readers.some((person) => person.readerName.toLowerCase().includes(target))
    )
  })
  const handleOpen = async (row: SmisAnnouncement): Promise<void> => {
    stats.value = undefined
    keyword.value = ''
    await dialogRef.value?.handleOpen(row, {
      title: '公告查阅情况',
      subtitle: row.title,
      showFooter: false,
      contentHeight: 'min(640px, calc(100vh - 180px))',
      onOpen: async (_data, api) => {
        api.setLoading(true)
        try {
          stats.value = (await fetchAnnouncementReadStats(row.id)).data ?? undefined
        } finally {
          api.setLoading(false)
        }
      }
    })
  }
  defineExpose({ handleOpen })
</script>

<style scoped lang="scss">
  .announcement-read-stats-dialog {
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-height: 0;

    &__summary {
      display: grid;
      grid-template-columns: repeat(3, minmax(100px, 1fr)) minmax(220px, 2fr);
      gap: 18px;
      align-items: center;
      padding: 14px 16px;
    }

    &__summary > div {
      display: grid;
      gap: 4px;
    }

    &__summary small {
      color: var(--el-text-color-secondary);
    }

    &__summary strong {
      font-size: 24px;
      font-variant-numeric: tabular-nums;
    }

    .is-success {
      color: var(--el-color-success);
    }

    .is-warning {
      color: var(--el-color-warning);
    }

    &__filter {
      display: flex;
      justify-content: flex-end;
    }

    &__filter .el-input {
      width: min(320px, 100%);
    }

    &__people {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      padding: 4px 0;
    }

    @media (width <= 760px) {
      &__summary {
        grid-template-columns: repeat(3, 1fr);
      }

      &__summary .el-progress {
        grid-column: 1 / -1;
      }
    }
  }
</style>
