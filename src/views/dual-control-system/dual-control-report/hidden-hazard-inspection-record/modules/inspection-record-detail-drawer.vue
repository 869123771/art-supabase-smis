<template>
  <ArtDrawer ref="drawerRef">
    <template #default>
      <div v-if="currentData" class="inspection-record-detail">
        <section class="inspection-record-detail__summary" aria-label="执行人排查任务摘要">
          <div class="inspection-record-detail__identity">
            <span aria-hidden="true">{{ currentData.inspector.employeeName.slice(0, 1) }}</span>
            <div>
              <strong>{{ currentData.inspector.employeeName }}</strong>
              <p
                >{{ currentData.inspector.employeeNo }} ·
                {{ currentData.inspector.positionName || '岗位未维护' }}</p
              >
              <small>{{ currentData.inspector.organizationName }}</small>
            </div>
          </div>
          <dl>
            <div
              ><dt>任务总数</dt><dd>{{ currentData.inspector.taskCount }}</dd></div
            >
            <div
              ><dt>已完成</dt><dd>{{ currentData.inspector.completedCount }}</dd></div
            >
            <div
              ><dt>异常任务</dt><dd>{{ currentData.inspector.abnormalTaskCount }}</dd></div
            >
            <div
              ><dt>完成率</dt><dd>{{ currentData.inspector.completionRate }}%</dd></div
            >
          </dl>
        </section>

        <ArtSectionCard
          title="任务级排查记录"
          subtitle="核对计划周期、执行结果、风险级别与异常数量"
          :empty="!currentData.details.length"
          empty-title="该执行人暂无任务明细"
          empty-description="当前筛选范围内未查询到该执行人的风险巡查任务。"
          :min-height="360"
        >
          <template #actions>
            <ElTag effect="plain" type="primary">共 {{ currentData.details.length }} 项</ElTag>
          </template>
          <ArtTable
            :data="currentData.details"
            :columns="columns"
            :pagination="false"
            table-layout="fixed"
            max-height="calc(100vh - 330px)"
            empty-text="暂无排查任务明细"
          />
        </ArtSectionCard>
      </div>
    </template>
  </ArtDrawer>
</template>

<script setup lang="tsx">
  import dayjs from 'dayjs'
  import type { ColumnOption } from '@/types'
  import ArtDrawer from '@/components/core/drawers/art-drawer/index.vue'
  import type { ArtDrawerExpose } from '@/components/core/drawers/art-drawer/types'
  import ArtSectionCard from '@/components/core/surfaces/art-section-card/index.vue'
  import ArtTable from '@/components/core/tables/art-table/index.vue'
  import ArtDictDisplay from '@/components/core/base/art-dict-display/index.vue'
  import type {
    SmisHiddenHazardInspectionPersonnelStat,
    SmisHiddenHazardInspectionRecordDetail
  } from '@smis/api'

  defineOptions({ name: 'SmisInspectionRecordDetailDrawer' })

  export interface InspectionRecordDetailOpenData {
    inspector: SmisHiddenHazardInspectionPersonnelStat
    details: SmisHiddenHazardInspectionRecordDetail[]
  }

  export interface InspectionRecordDetailDrawerExpose {
    handleOpen: (data: InspectionRecordDetailOpenData) => Promise<void>
  }

  const drawerRef = ref<ArtDrawerExpose<InspectionRecordDetailOpenData>>()
  const currentData = shallowRef<InspectionRecordDetailOpenData | null>(null)
  const formatDateTime = (value?: string | null): string =>
    value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '—'
  const frequencyLabel = (unit: string, count: number): string =>
    `${count || 1}${({ shift: '班', day: '日', week: '周', ten_day: '旬', month: '月', quarter: '季', year: '年' } as Record<string, string>)[unit] || unit}`

  const columns: ColumnOption<SmisHiddenHazardInspectionRecordDetail>[] = [
    { type: 'globalIndex', label: '序号', width: 66 },
    { prop: 'taskNo', label: '任务编号', width: 170, fixed: 'left' },
    { prop: 'riskPointName', label: '排查对象', minWidth: 160, showOverflowTooltip: true },
    { prop: 'equipmentName', label: '设备 / 设施', minWidth: 170, showOverflowTooltip: true },
    {
      prop: 'plannedStartAt',
      label: '计划开始',
      width: 154,
      formatter: (row) => formatDateTime(row.plannedStartAt)
    },
    {
      prop: 'plannedEndAt',
      label: '计划结束',
      width: 154,
      formatter: (row) => formatDateTime(row.plannedEndAt)
    },
    {
      prop: 'completedAt',
      label: '实际完成',
      width: 154,
      formatter: (row) => formatDateTime(row.completedAt)
    },
    {
      prop: 'status',
      label: '状态',
      width: 104,
      formatter: (row) => (
        <ArtDictDisplay dictCode="smisRiskInspectionTaskStatus" value={row.status} display="tag" />
      )
    },
    {
      prop: 'frequencyUnit',
      label: '周期',
      width: 82,
      formatter: (row) => frequencyLabel(row.frequencyUnit, row.repeatFrequency)
    },
    { prop: 'riskLevelNames', label: '风险级别', width: 120, showOverflowTooltip: true },
    { prop: 'inspectionContent', label: '排查项目', minWidth: 230, showOverflowTooltip: true },
    { prop: 'controlMeasures', label: '排查标准', minWidth: 230, showOverflowTooltip: true },
    { prop: 'itemCount', label: '排查项', width: 82, align: 'right' },
    { prop: 'normalCount', label: '正常', width: 72, align: 'right' },
    { prop: 'abnormalCount', label: '异常', width: 72, align: 'right' }
  ]

  const handleOpen = async (data: InspectionRecordDetailOpenData): Promise<void> => {
    currentData.value = data
    await drawerRef.value?.handleOpen(data, {
      title: '排查任务明细',
      subtitle: `${data.inspector.employeeName} · ${data.inspector.organizationName}`,
      size: 'xl',
      showFullscreenButton: true,
      showFooter: false,
      contentHeight: 'calc(100vh - 112px)'
    })
  }

  defineExpose<InspectionRecordDetailDrawerExpose>({ handleOpen })
</script>

<style scoped lang="scss">
  .inspection-record-detail {
    display: grid;
    gap: var(--art-space-4);
    min-width: 0;

    &__summary {
      display: grid;
      grid-template-columns: minmax(240px, 1fr) minmax(420px, 1.25fr);
      gap: var(--art-space-4);
      align-items: center;
      padding: var(--art-section-padding);
      background: var(--el-fill-color-light);
      border: 1px solid var(--el-border-color-lighter);
      border-radius: var(--el-border-radius-base);
    }

    &__identity {
      display: flex;
      gap: var(--art-space-3);
      align-items: center;
      min-width: 0;

      > span {
        display: grid;
        flex: none;
        place-items: center;
        width: 44px;
        height: 44px;
        font-size: 16px;
        font-weight: 700;
        color: var(--theme-color);
        background: var(--el-color-primary-light-9);
        border: 1px solid var(--el-color-primary-light-7);
        border-radius: 50%;
      }

      div {
        min-width: 0;
      }

      strong,
      p,
      small {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      p {
        margin: var(--art-space-1) 0 0;
        color: var(--el-text-color-regular);
      }

      small {
        margin-top: 2px;
        color: var(--el-text-color-secondary);
      }
    }

    dl {
      display: grid;
      grid-template-columns: repeat(4, minmax(80px, 1fr));
      gap: var(--art-space-2);
      margin: 0;

      div {
        padding: var(--art-space-3);
        text-align: center;
        background: var(--el-bg-color);
        border: 1px solid var(--el-border-color-lighter);
        border-radius: var(--el-border-radius-base);
      }

      dt {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }

      dd {
        margin: var(--art-space-1) 0 0;
        font-size: 20px;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
        color: var(--el-text-color-primary);
      }
    }

    @media (width <= 900px) {
      &__summary {
        grid-template-columns: 1fr;
      }

      dl {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
  }
</style>
