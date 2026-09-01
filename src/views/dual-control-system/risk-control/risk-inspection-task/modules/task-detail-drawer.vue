<template>
  <ArtDrawer ref="drawerRef" :loading="loading" loading-text="正在加载任务详情…">
    <div v-if="detail" class="task-detail-drawer">
      <div class="task-detail-drawer__status" :data-status="detail.status">
        <span><ArtSvgIcon icon="ri:clipboard-line" /></span>
        <div
          ><small>任务编号</small><strong>{{ detail.taskNo }}</strong
          ><p>{{ detail.riskPointName }} · {{ detail.riskPointNo }}</p></div
        >
        <ArtDictDisplay
          dict-code="smisRiskInspectionTaskStatus"
          :value="detail.status"
          display="tag"
        />
      </div>

      <ArtSectionTitle title="任务计划" subtitle="风险对象、管控责任与执行时限" />
      <ElDescriptions class="task-detail-drawer__descriptions" :column="2" border>
        <ElDescriptionsItem label="风险点类型"
          ><ArtDictDisplay dict-code="smisRiskPointType" :value="detail.riskPointType"
        /></ElDescriptionsItem>
        <ElDescriptionsItem label="风险等级"
          ><span class="task-detail-drawer__risk" :style="{ color: detail.riskLevelColor }">{{
            detail.riskLevelName
          }}</span></ElDescriptionsItem
        >
        <ElDescriptionsItem label="管控层级"
          ><ArtDictDisplay dict-code="smisRiskControlLevel" :value="detail.controlLevel"
        /></ElDescriptionsItem>
        <ElDescriptionsItem label="管控责任人"
          >{{ detail.responsibleEmployeeName }} ·
          {{ detail.responsibleEmployeeNo }}</ElDescriptionsItem
        >
        <ElDescriptionsItem label="当前接收人"
          >{{ detail.assigneeEmployeeName }} · {{ detail.assigneeEmployeeNo }}</ElDescriptionsItem
        >
        <ElDescriptionsItem label="实际执行人">{{
          detail.actualExecutorEmployeeName || '尚未执行'
        }}</ElDescriptionsItem>
        <ElDescriptionsItem label="计划开始">{{
          formatDate(detail.plannedStartAt)
        }}</ElDescriptionsItem>
        <ElDescriptionsItem label="计划完成">{{
          formatDate(detail.plannedEndAt)
        }}</ElDescriptionsItem>
        <ElDescriptionsItem label="实际开始">{{
          formatDate(detail.actualStartAt)
        }}</ElDescriptionsItem>
        <ElDescriptionsItem label="完成时间">{{
          formatDate(detail.completedAt)
        }}</ElDescriptionsItem>
      </ElDescriptions>

      <ArtSectionTitle
        title="巡查项目"
        :subtitle="`共 ${detail.items.length} 项，异常 ${abnormalCount} 项`"
      />
      <ElTable :data="detail.items" border table-layout="fixed" empty-text="暂无巡查项目">
        <ElTableColumn type="index" label="序号" width="62" align="center" />
        <ElTableColumn label="危险源" min-width="150"
          ><template #default="{ row }"
            ><div class="task-detail-drawer__item"
              ><strong>{{ row.hazardSource || '关联风险项已删除' }}</strong
              ><small>{{ row.hazardNo || '历史快照' }}</small></div
            ></template
          ></ElTableColumn
        >
        <ElTableColumn prop="inspectionContent" label="排查内容 / 控制措施" min-width="260" />
        <ElTableColumn label="结果" width="96" align="center"
          ><template #default="{ row }"
            ><ArtDictDisplay
              dict-code="smisRiskInspectionResult"
              :value="row.result"
              display="tag" /></template
        ></ElTableColumn>
        <ElTableColumn prop="remark" label="执行备注" min-width="180"
          ><template #default="{ row }">{{ row.remark || '—' }}</template></ElTableColumn
        >
      </ElTable>

      <ArtSectionTitle title="执行记录" subtitle="任务生成、转交、进度保存与完成事件" />
      <ElTimeline class="task-detail-drawer__timeline">
        <ElTimelineItem
          v-for="event in [...detail.events].reverse()"
          :key="event.id"
          :timestamp="formatDate(event.eventAt)"
          placement="top"
        >
          <div class="task-detail-drawer__event"
            ><strong>{{ eventLabel(event.eventType) }}</strong
            ><p>{{ event.eventContent || '系统记录' }}</p
            ><small>{{ event.operatorName || '系统' }}</small></div
          >
        </ElTimelineItem>
      </ElTimeline>

      <div
        v-if="detail.executionSummary || detail.transferReason || detail.cancellationReason"
        class="task-detail-drawer__notes"
      >
        <p v-if="detail.executionSummary"><strong>执行总结</strong>{{ detail.executionSummary }}</p>
        <p v-if="detail.transferReason"><strong>最近转交原因</strong>{{ detail.transferReason }}</p>
        <p v-if="detail.cancellationReason"
          ><strong>取消原因</strong>{{ detail.cancellationReason }}</p
        >
      </div>
    </div>
  </ArtDrawer>
</template>

<script setup lang="ts">
  import dayjs from 'dayjs'
  import ArtDrawer from '@/components/core/drawers/art-drawer/index.vue'
  import type { ArtDrawerExpose } from '@/components/core/drawers/art-drawer/types'
  import ArtSectionTitle from '@/components/core/surfaces/art-section-title/index.vue'
  import ArtDictDisplay from '@/components/core/base/art-dict-display/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import {
    fetchRiskInspectionTaskDetail,
    type SmisRiskInspectionTask,
    type SmisRiskInspectionTaskDetail,
    type SmisRiskInspectionTaskEvent
  } from '@smis/api'

  export interface TaskDetailDrawerOpenData {
    row: SmisRiskInspectionTask
  }
  const drawerRef = ref<ArtDrawerExpose<TaskDetailDrawerOpenData>>()
  const detail = shallowRef<SmisRiskInspectionTaskDetail | null>(null)
  const loading = ref(false)
  const abnormalCount = computed(
    () => detail.value?.items.filter((item) => item.result === 'abnormal').length ?? 0
  )
  const formatDate = (value?: string | null): string =>
    value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '—'
  const eventLabels: Record<SmisRiskInspectionTaskEvent['eventType'], string> = {
    generated: '任务生成',
    transferred: '任务转交',
    progress_saved: '保存进度',
    completed: '任务完成',
    cancelled: '任务取消'
  }
  const eventLabel = (value: SmisRiskInspectionTaskEvent['eventType']): string => eventLabels[value]
  const handleOpen = async (data: TaskDetailDrawerOpenData): Promise<void> => {
    detail.value = null
    await drawerRef.value?.handleOpen(data, {
      title: '风险巡查任务详情',
      subtitle: `${data.row.taskNo} · ${data.row.riskPointName}`,
      size: 'xl',
      showFooter: false,
      contentHeight: 'calc(100vh - 120px)',
      onOpen: async () => {
        loading.value = true
        try {
          const fetchedDetail = await fetchRiskInspectionTaskDetail(data.row.id)
          detail.value = fetchedDetail ? { ...data.row, ...fetchedDetail } : null
        } finally {
          loading.value = false
        }
      }
    })
  }
  defineExpose({ handleOpen })
</script>

<style scoped lang="scss">
  .task-detail-drawer {
    display: grid;
    gap: 18px;
    min-width: 0;
  }

  .task-detail-drawer__status {
    display: grid;
    grid-template-columns: 46px minmax(0, 1fr) auto;
    gap: 12px;
    align-items: center;
    padding: 16px;
    background: color-mix(in srgb, var(--theme-color) 6%, var(--default-box-color));
    border-left: 3px solid var(--theme-color);
    border-radius: var(--el-border-radius-base);
  }

  .task-detail-drawer__status > span {
    display: grid;
    place-items: center;
    width: 46px;
    height: 46px;
    color: var(--theme-color);
    background: var(--default-box-color);
    border-radius: var(--el-border-radius-base);
  }

  .task-detail-drawer__status small,
  .task-detail-drawer__status strong,
  .task-detail-drawer__status p {
    display: block;
    margin: 0;
  }

  .task-detail-drawer__status small,
  .task-detail-drawer__status p {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .task-detail-drawer__status strong {
    margin: 2px 0;
    font-family: var(--art-font-family-mono, Consolas, monospace);
    font-size: 16px;
  }

  .task-detail-drawer__descriptions {
    margin-top: -8px;
  }

  .task-detail-drawer__risk {
    font-weight: 600;
  }

  .task-detail-drawer__item strong,
  .task-detail-drawer__item small {
    display: block;
  }

  .task-detail-drawer__item small {
    margin-top: 2px;
    font-size: 11px;
    color: var(--el-text-color-secondary);
  }

  .task-detail-drawer__timeline {
    padding: 4px 12px 0;
  }

  .task-detail-drawer__event {
    padding: 12px 14px;
    background: var(--default-box-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: var(--el-border-radius-base);
  }

  .task-detail-drawer__event p {
    margin: 4px 0;
    color: var(--el-text-color-regular);
  }

  .task-detail-drawer__event small {
    color: var(--el-text-color-secondary);
  }

  .task-detail-drawer__notes {
    display: grid;
    gap: 8px;
    padding: 14px 16px;
    background: var(--el-fill-color-lighter);
    border-left: 3px solid var(--el-color-warning);
  }

  .task-detail-drawer__notes p {
    display: grid;
    grid-template-columns: 110px minmax(0, 1fr);
    margin: 0;
  }
</style>
