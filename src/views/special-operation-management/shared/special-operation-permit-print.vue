<template>
  <article class="permit-print" :aria-label="`${documentTitle}打印预览`">
    <header class="permit-print__header">
      <div>
        <span>特殊作业安全许可</span>
        <h2>{{ documentTitle }}</h2>
      </div>
      <dl>
        <dt>作业编号</dt>
        <dd>{{ record.permitNo }}</dd>
        <dt>当前状态</dt>
        <dd>{{ statusLabel }}</dd>
      </dl>
    </header>

    <table class="permit-print__table permit-print__table--summary">
      <tbody>
        <tr>
          <th>作业申请单位</th>
          <td>{{ record.workUnit || '—' }}</td>
          <th>作业申请时间</th>
          <td>{{ formatDate(record.applicationTime) }}</td>
        </tr>
        <tr>
          <th>作业内容</th>
          <td colspan="3">{{ record.workContent || '—' }}</td>
        </tr>
        <tr>
          <th>作业地点</th>
          <td>{{ record.workLocation || '—' }}</td>
          <th>作业部位</th>
          <td>{{ record.workSection || '—' }}</td>
        </tr>
        <tr>
          <th>作业起止时间</th>
          <td colspan="3">
            {{ formatDate(record.workStartTime) }} 至 {{ formatDate(record.workEndTime) }}
          </td>
        </tr>
        <tr>
          <th>危害因素</th>
          <td colspan="3">{{ hazardNames }}</td>
        </tr>
        <tr v-for="(row, index) in customRows" :key="`${row[0]?.label}-${index}`">
          <template v-for="item in row" :key="item.label">
            <th>{{ item.label }}</th>
            <td>{{ item.value }}</td>
          </template>
          <template v-if="row.length === 1">
            <th></th>
            <td></td>
          </template>
        </tr>
        <tr>
          <th>作业负责人</th>
          <td>{{ record.responsibleEmployee?.employeeName || '—' }}</td>
          <th>现场监护人</th>
          <td>{{ peopleNames(record.guardianEmployees) }}</td>
        </tr>
        <tr>
          <th>作业验证人</th>
          <td>{{ peopleNames(record.verifierEmployees) }}</td>
          <th>现场分析人</th>
          <td>{{ peopleNames(record.analysts) }}</td>
        </tr>
        <tr>
          <th>作业人员</th>
          <td colspan="3">{{ workerSummary }}</td>
        </tr>
        <tr>
          <th>涉及其他作业</th>
          <td colspan="3">{{ relatedPermitSummary }}</td>
        </tr>
      </tbody>
    </table>

    <section v-if="blindPlateItems.length" class="permit-print__section">
      <h3>盲板明细</h3>
      <table class="permit-print__table permit-print__table--blind-plate">
        <thead>
          <tr>
            <th>序号</th><th>设备 / 管线名称</th><th>介质</th><th>温度</th><th>压力</th
            ><th>材质 / 规格</th><th>盲板编号</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in blindPlateItems" :key="item.id">
            <td>{{ index + 1 }}</td>
            <td>{{ item.equipmentPipelineName }}</td>
            <td>{{ formatValue(item.medium) }}</td>
            <td>{{ formatValue(item.temperature) }}</td>
            <td>{{ formatValue(item.pressure) }}</td>
            <td>{{ [item.material, item.specification].filter(Boolean).join(' / ') || '—' }}</td>
            <td>{{ formatValue(item.blindPlateNo) }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section v-if="record.siteAnalysisRecords.length" class="permit-print__section">
      <h3>现场分析记录</h3>
      <table class="permit-print__table">
        <thead>
          <tr><th>序号</th><th>分析项目</th><th>正常值</th><th>本次记录</th><th>分析人</th></tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in record.siteAnalysisRecords" :key="item.id">
            <td>{{ index + 1 }}</td>
            <td>{{ item.itemName }}</td>
            <td>{{ formatValue(item.normalValue) }}</td>
            <td>{{ formatValue(item.recordedValue) }}</td>
            <td>{{ peopleNames(record.analysts) }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="permit-print__section">
      <h3>安全措施确认</h3>
      <table class="permit-print__table">
        <thead>
          <tr><th>序号</th><th>安全措施</th><th>是否落实</th><th>确认人</th></tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in record.safetyMeasures" :key="item.id">
            <td>{{ index + 1 }}</td>
            <td>{{ item.itemName }}</td>
            <td>{{ item.involved ? '√ 已落实' : '／ 未确认' }}</td>
            <td>{{ safetyConfirmer }}</td>
          </tr>
          <tr v-if="!record.safetyMeasures.length">
            <td colspan="4">暂无安全措施记录</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="permit-print__section">
      <h3>交底、审批与验收记录</h3>
      <table class="permit-print__table permit-print__table--events">
        <tbody>
          <tr>
            <th>安全交底人</th>
            <td>{{ peopleNames(record.briefingGiverEmployees) }}</td>
            <th>接受交底人</th>
            <td>{{ peopleNames(record.briefingReceiverEmployees) }}</td>
          </tr>
          <tr v-for="event in orderedEvents" :key="event.id">
            <th>{{ event.eventTitle }}</th>
            <td>{{ event.operatorName || '系统' }}</td>
            <td>{{ event.eventDescription || '—' }}</td>
            <td>{{ formatDate(event.createTime) }}</td>
          </tr>
          <tr v-if="!orderedEvents.length">
            <th>流程记录</th>
            <td colspan="3">暂无审批或验收记录</td>
          </tr>
          <tr>
            <th>验收结果</th>
            <td>{{ acceptanceLabel }}</td>
            <td>{{ record.acceptanceDescription || '—' }}</td>
            <td>{{ record.acceptedBy || '—' }} · {{ formatDate(record.acceptedAt) }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <footer class="permit-print__footer">
      <span>本票据由系统生成，流程记录与业务台账同步留痕。</span>
      <span>打印时间：{{ printedAt }}</span>
    </footer>
  </article>
</template>

<script setup lang="ts">
  import dayjs from 'dayjs'
  import type {
    SmisSpecialOperationFieldDefinition,
    SmisSpecialOperationPermit,
    SmisSpecialOperationPerson
  } from '@smis/api'
  import { normalizeBlindPlateItems, readCustomValue } from './special-operation-permit-utils'

  const props = defineProps<{
    record: SmisSpecialOperationPermit
    fieldDefinitions?: SmisSpecialOperationFieldDefinition[]
    hotWorkLevelLabels?: Record<string, string>
    hotWorkMethodLabels?: Record<string, string>
  }>()

  interface PrintField {
    label: string
    value: string
  }

  const statusLabels: Record<SmisSpecialOperationPermit['status'], string> = {
    draft: '草稿',
    pending_approval: '待审批',
    rejected: '已拒绝',
    in_progress: '作业中',
    pending_acceptance: '待验收',
    completed: '已完成',
    voided: '已作废'
  }
  const titleMap: Record<string, string> = {
    HOT_WORK: '动火安全作业票',
    WORK_AT_HEIGHT: '高处作业票',
    LIFTING: '吊装作业票',
    CONFINED_SPACE: '受限空间作业票',
    TEMP_ELECTRICITY: '临时用电安全作业票',
    ROAD_BREAKING: '断路安全作业票',
    BLIND_PLATE: '盲板抽堵安全作业票'
  }
  const documentTitle = computed(
    () => titleMap[props.record.operationTypeCode] || `${props.record.operationTypeName}票`
  )
  const statusLabel = computed(() => statusLabels[props.record.status])
  const printedAt = dayjs().format('YYYY-MM-DD HH:mm')
  const formatDate = (value?: string | null) =>
    value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '—'
  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined || value === '') return '—'
    if (Array.isArray(value)) return value.map((item) => String(item)).join('、') || '—'
    if (typeof value === 'boolean') return value ? '是' : '否'
    return String(value)
  }
  const formatLabeledValue = (labels: Record<string, string> | undefined, value: unknown) => {
    const values = Array.isArray(value) ? value : [value]
    return (
      values
        .map((item) => labels?.[String(item)] || formatValue(item))
        .filter((item) => item !== '—')
        .join('、') || '—'
    )
  }
  const peopleNames = (people: SmisSpecialOperationPerson[]) =>
    people
      .map((item) => item.employeeName)
      .filter(Boolean)
      .join('、') || '—'
  const hazardNames = computed(
    () => props.record.hazardFactors.map((item) => item.itemName).join('、') || '—'
  )
  const workerSummary = computed(
    () =>
      props.record.workers
        .map((item) =>
          [item.employeeName, item.certificateNumber ? `(${item.certificateNumber})` : '']
            .filter(Boolean)
            .join(' ')
        )
        .join('、') || '—'
  )
  const relatedPermitSummary = computed(
    () =>
      props.record.relatedPermits
        .map((item) =>
          [item.operationTypeName, item.permitNo ? `(${item.permitNo})` : '']
            .filter(Boolean)
            .join(' ')
        )
        .join('、') || '—'
  )
  const safetyConfirmer = computed(() =>
    peopleNames(props.record.guardianEmployees) === '—'
      ? props.record.responsibleEmployee?.employeeName || '—'
      : peopleNames(props.record.guardianEmployees)
  )
  const blindPlateItems = computed(() =>
    normalizeBlindPlateItems(readCustomValue(props.record.customValues, 'blind_plate_items'))
  )
  const workAtHeightLevel = computed(() => {
    const height = Number(readCustomValue(props.record.customValues, 'work_height'))
    if (!Number.isFinite(height) || height < 2) return '—'
    if (height <= 5) return '一级'
    if (height <= 15) return '二级'
    if (height <= 30) return '三级'
    return '特级'
  })
  const customFields = computed<PrintField[]>(() => {
    const fields = (props.fieldDefinitions ?? [])
      .filter(
        (field) =>
          props.record.operationTypeCode !== 'HOT_WORK' ||
          !['hot_work_level', 'fire_method', 'hot_work_method', 'hot_work_methods'].includes(
            field.fieldCode
          )
      )
      .map((field) => ({
        label: field.unit ? `${field.fieldLabel}（${field.unit}）` : field.fieldLabel,
        value: formatValue(readCustomValue(props.record.customValues, field.fieldCode))
      }))
    if (props.record.operationTypeCode === 'HOT_WORK') {
      fields.unshift(
        {
          label: '动火级别',
          value: formatLabeledValue(props.hotWorkLevelLabels, props.record.hotWorkLevel)
        },
        {
          label: '动火方式',
          value: formatLabeledValue(props.hotWorkMethodLabels, props.record.hotWorkMethods)
        }
      )
    }
    if (props.record.operationTypeCode === 'WORK_AT_HEIGHT') {
      fields.push({ label: '作业级别', value: workAtHeightLevel.value })
    }
    return fields
  })
  const customRows = computed<PrintField[][]>(() => {
    const result: PrintField[][] = []
    for (let index = 0; index < customFields.value.length; index += 2) {
      result.push(customFields.value.slice(index, index + 2))
    }
    return result
  })
  const orderedEvents = computed(() => [...(props.record.events ?? [])].reverse())
  const acceptanceLabel = computed(() => {
    if (props.record.acceptanceResult === 'passed') return '验收通过'
    if (props.record.acceptanceResult === 'returned') return '退回整改'
    return '—'
  })
</script>

<style scoped lang="scss">
  .permit-print {
    width: min(210mm, 100%);
    min-height: 297mm;
    padding: 14mm 13mm;
    margin: 0 auto;
    color: #172033;
    background: #fff;
    border: 1px solid #d9dee8;
    box-shadow: 0 14px 36px rgb(30 48 78 / 12%);
  }

  .permit-print__header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 24px;
    align-items: end;
    padding-bottom: 12px;
    border-bottom: 2px solid #172033;
  }

  .permit-print__header span {
    font-size: 11px;
    font-weight: 700;
    color: #667085;
    letter-spacing: 0.14em;
  }

  .permit-print__header h2 {
    margin: 4px 0 0;
    font-size: 25px;
    letter-spacing: 0.08em;
  }

  .permit-print__header dl {
    display: grid;
    grid-template-columns: auto auto;
    gap: 4px 12px;
    margin: 0;
    font-size: 11px;
  }

  .permit-print__header dt {
    color: #667085;
  }

  .permit-print__header dd {
    margin: 0;
    font-weight: 700;
    text-align: right;
  }

  .permit-print__table {
    width: 100%;
    margin-top: 10px;
    font-size: 11px;
    line-height: 1.45;
    table-layout: fixed;
    border-spacing: 0;
    border-collapse: collapse;
  }

  .permit-print__table th,
  .permit-print__table td {
    padding: 6px 8px;
    vertical-align: middle;
    overflow-wrap: anywhere;
    border: 1px solid #98a2b3;
  }

  .permit-print__table th {
    font-weight: 700;
    text-align: center;
    background: #f2f4f7;
  }

  .permit-print__table--summary th {
    width: 16%;
  }

  .permit-print__table--summary td {
    width: 34%;
  }

  .permit-print__section {
    margin-top: 13px;
    break-inside: avoid;
  }

  .permit-print__section h3 {
    margin: 0;
    font-size: 13px;
  }

  .permit-print__table--events th {
    width: 18%;
  }

  .permit-print__table--blind-plate {
    font-size: 9.5px;
  }

  .permit-print__table--blind-plate th:first-child,
  .permit-print__table--blind-plate td:first-child {
    width: 7%;
  }

  .permit-print__table--blind-plate th:nth-child(2),
  .permit-print__table--blind-plate td:nth-child(2) {
    width: 23%;
  }

  .permit-print__footer {
    display: flex;
    gap: 16px;
    justify-content: space-between;
    padding-top: 9px;
    margin-top: 14px;
    font-size: 10px;
    color: #667085;
    border-top: 1px solid #d0d5dd;
  }

  @media (width <= 900px) {
    .permit-print {
      min-height: auto;
      padding: 20px;
    }

    .permit-print__header {
      grid-template-columns: minmax(0, 1fr);
    }

    .permit-print__header dd {
      text-align: left;
    }

    .permit-print__footer {
      flex-direction: column;
    }
  }

  @media print {
    :global(body *) {
      visibility: hidden !important;
    }

    .permit-print,
    .permit-print * {
      visibility: visible !important;
    }

    .permit-print {
      position: absolute;
      inset: 0;
      width: 100%;
      min-height: auto;
      padding: 8mm;
      margin: 0;
      border: 0;
      box-shadow: none;
    }
  }
</style>
