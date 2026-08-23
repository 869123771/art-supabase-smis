<template>
  <ArtDrawer ref="drawerRef">
    <div v-if="record && workspace" class="catalog-detail">
      <section class="catalog-detail__hero">
        <div class="catalog-detail__identity">
          <span class="catalog-detail__icon"><ArtSvgIcon :icon="workspace.icon" /></span>
          <div>
            <div class="catalog-detail__tags">
              <ElTag :type="statusType(record.status)" effect="light">
                {{ statusLabel(record.status) }}
              </ElTag>
              <ElTag effect="plain">文档第 {{ workspace.documentPages.join('、') }} 页</ElTag>
            </div>
            <h2>{{ record.title }}</h2>
            <p>{{ record.recordNo }} · {{ workspace.description }}</p>
          </div>
        </div>
        <div v-if="workspace.capabilities.includes('qr-code')" class="catalog-detail__qr">
          <QrcodeVue :value="qrValue" :size="88" level="M" />
          <span>设备唯一二维码</span>
        </div>
      </section>

      <ArtSectionTitle>业务信息</ArtSectionTitle>
      <div class="catalog-detail__fields">
        <article v-for="field in visibleFields" :key="field.key">
          <span>{{ field.label }}</span>
          <strong>{{ displayValue(field) }}</strong>
        </article>
      </div>

      <template v-if="detailSchema">
        <ArtSectionTitle>{{ detailSchema.title }}</ArtSectionTitle>
        <ElTable v-if="detailRows.length" :data="detailRows" border>
          <ElTableColumn type="index" label="序号" width="58" align="center" />
          <ElTableColumn
            v-for="field in detailSchema.fields"
            :key="field.key"
            :prop="field.key"
            :label="field.label"
            :min-width="field.type === 'date' ? 130 : 118"
            show-overflow-tooltip
          />
        </ElTable>
        <ArtEmptyState
          v-else
          compact
          :title="detailSchema.emptyText"
          description="编辑主档后可继续维护子表明细。"
        />
      </template>

      <template v-if="workspace.experience === 'special-work'">
        <ArtSectionTitle>作业安全确认</ArtSectionTitle>
        <div class="catalog-detail__permit">
          <article>
            <span>作业人员与监护</span>
            <strong>{{ permitPeople }}</strong>
          </article>
          <article>
            <span>危险 / 环境因素</span>
            <strong>{{ payloadText('hazardAnalysis', '待申请人补充危险因素辨识') }}</strong>
          </article>
        </div>
        <div class="catalog-detail__measures">
          <div v-for="(measure, index) in safetyMeasures" :key="`${index}-${measure}`">
            <ArtSvgIcon icon="ri:checkbox-circle-fill" />
            <span>{{ measure }}</span>
          </div>
        </div>
      </template>

      <template v-if="workspace.capabilities.includes('attachments')">
        <ArtSectionTitle>附件与现场证据</ArtSectionTitle>
        <SmisAttachmentEvidence :model-value="attachments" readonly />
      </template>

      <template v-if="workspace.capabilities.includes('timeline')">
        <ArtSectionTitle>流程与审批留痕</ArtSectionTitle>
        <div v-loading="eventState.loading" class="catalog-detail__timeline">
          <ElTimeline v-if="eventState.rows.length">
            <ElTimelineItem
              v-for="event in eventState.rows"
              :key="event.id"
              :timestamp="formatWithDayjs(event.createTime)"
              placement="top"
              :type="eventType(event.action)"
            >
              <strong>{{ actionLabel(event.action) }}</strong>
              <p>
                {{ event.operatorName || '系统用户' }} · {{ statusLabel(event.fromStatus) }} →
                {{ statusLabel(event.toStatus) }}
              </p>
              <small v-if="event.comment">{{ event.comment }}</small>
            </ElTimelineItem>
          </ElTimeline>
          <ArtEmptyState
            v-else-if="!eventState.loading"
            compact
            title="暂无流程留痕"
            description="提交、审批、执行和关闭后会在这里形成不可变审计记录。"
          />
        </div>
      </template>
    </div>

    <template #footer="{ api }">
      <ElButton @click="api.handleClose()">关闭</ElButton>
      <ElButton
        v-if="record?.status === 'draft'"
        v-auth="'SmisCatalog:Submit'"
        type="primary"
        :loading="transitioning"
        @click="handleTransition('submit', '提交审批')"
        >提交审批</ElButton
      >
      <ElButton
        v-if="record?.status === 'pending'"
        v-auth="'SmisCatalog:Approve'"
        :loading="transitioning"
        @click="handleTransition('reject', '退回修改')"
        >退回修改</ElButton
      >
      <ElButton
        v-if="record?.status === 'pending'"
        v-auth="'SmisCatalog:Approve'"
        type="primary"
        :loading="transitioning"
        @click="handleTransition('approve', '审批通过')"
        >审批通过</ElButton
      >
      <ElButton
        v-if="record?.status === 'active'"
        v-auth="'SmisCatalog:Execute'"
        :loading="transitioning"
        @click="handleTransition('transfer', '转交处理')"
        >转交</ElButton
      >
      <ElButton
        v-if="record?.status === 'active'"
        v-auth="'SmisCatalog:Execute'"
        :loading="transitioning"
        @click="handleTransition('cancel', '取消作废')"
        >取消</ElButton
      >
      <ElButton
        v-if="record?.status === 'active'"
        v-auth="'SmisCatalog:Execute'"
        type="primary"
        :loading="transitioning"
        @click="handleTransition('complete', '执行完成')"
        >执行完成</ElButton
      >
      <ElButton
        v-if="['completed', 'disabled'].includes(record?.status || '')"
        v-auth="'SmisCatalog:Approve'"
        :loading="transitioning"
        @click="handleTransition('reopen', '重新启用')"
        >重新启用</ElButton
      >
      <ElButton
        v-if="workspace?.capabilities.includes('print')"
        v-auth="'SmisCatalog:Print'"
        @click="handlePrint"
      >
        <ArtSvgIcon icon="ri:printer-line" />打印作业票
      </ElButton>
    </template>
  </ArtDrawer>
</template>

<script setup lang="ts">
  import QrcodeVue from 'qrcode.vue'
  import ArtDrawer from '@/components/core/drawers/art-drawer/index.vue'
  import type { ArtDrawerExpose } from '@/components/core/drawers/art-drawer/types'
  import ArtEmptyState from '@/components/core/layouts/art-empty-state/index.vue'
  import ArtSectionTitle from '@/components/core/forms/art-section-title/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import { formatWithDayjs } from '@/utils/time'
  import { useArtFeedback } from '@/hooks/core/useArtFeedback'
  import {
    fetchSafetyCatalogEvents,
    transitionSafetyCatalogRecord,
    type SafetyCatalogEvent,
    type SafetyCatalogRecord,
    type SafetyWorkflowAction
  } from '@smis/api'
  import type {
    SafetyFieldDefinition,
    SafetyModuleDefinition
  } from '@smis/domain/safety-module-catalog'
  import { getSafetyModuleDetailSchema } from '@smis/domain/safety-module-detail-schema'
  import SmisAttachmentEvidence from '../../components/smis-attachment-evidence.vue'

  defineOptions({ name: 'SmisSafetyCatalogDetailDrawer' })

  interface OpenData {
    workspace: SafetyModuleDefinition
    record: SafetyCatalogRecord
  }

  type Attachment = Api.Smis.InspectionControl.AttachmentRef

  const emit = defineEmits<{ (event: 'updated'): void }>()
  const { promptReason } = useArtFeedback()

  const drawerRef = ref<ArtDrawerExpose<OpenData>>()
  const workspace = shallowRef<SafetyModuleDefinition>()
  const record = shallowRef<SafetyCatalogRecord>()
  const eventState = reactive({ loading: false, rows: [] as SafetyCatalogEvent[] })
  const transitioning = ref(false)

  const visibleFields = computed(() =>
    (workspace.value?.fields ?? []).filter((field) => record.value?.payload?.[field.key] != null)
  )
  const detailSchema = computed(() =>
    workspace.value ? getSafetyModuleDetailSchema(workspace.value.code) : undefined
  )
  const detailRows = computed<Record<string, unknown>[]>(() => {
    const value = record.value?.payload?.detailRows
    return Array.isArray(value) ? (value as Record<string, unknown>[]) : []
  })
  const qrValue = computed(() =>
    String(
      record.value?.payload?.qrCodeValue || `SMIS:${record.value?.id || record.value?.recordNo}`
    )
  )
  const attachments = computed<Attachment[]>(() => {
    const value = record.value?.payload?.attachments
    return Array.isArray(value) ? (value as Attachment[]) : []
  })
  const safetyMeasures = computed(() => {
    const value = record.value?.payload?.safetyMeasures
    if (Array.isArray(value)) return value.map(String).filter(Boolean)
    if (typeof value === 'string') {
      return value
        .split(/[\n；;]/)
        .map((item) => item.trim())
        .filter(Boolean)
    }
    return ['作业前完成风险交底', '监护人员已到位', '应急与防护器材已确认']
  })
  const permitPeople = computed(
    () =>
      [record.value?.payload?.applicantName, record.value?.payload?.guardianName]
        .filter(Boolean)
        .join(' / ') || '待补充作业申请人与监护人'
  )

  const payloadText = (key: string, fallback = '--'): string =>
    String(record.value?.payload?.[key] || fallback)

  const statusLabel = (status: string): string =>
    ({
      draft: '草稿',
      pending: '待审批',
      active: '已批准 / 执行中',
      completed: '已完成',
      disabled: '已取消'
    })[status] ?? status

  const statusType = (status: string) => {
    if (status === 'completed' || status === 'active') return 'success'
    if (status === 'pending') return 'warning'
    if (status === 'disabled') return 'info'
    return 'primary'
  }

  const actionLabel = (action: string): string =>
    ({
      created: '创建业务单',
      updated: '更新业务单',
      submit: '提交审批',
      approve: '审批通过',
      reject: '审批退回',
      start: '开始执行',
      complete: '执行完成',
      cancel: '取消 / 作废',
      reopen: '重新启用',
      transfer: '转交处理'
    })[action] ?? action

  const eventType = (action: string) => {
    if (['approve', 'complete'].includes(action)) return 'success'
    if (['reject', 'cancel'].includes(action)) return 'danger'
    if (['submit', 'start', 'transfer'].includes(action)) return 'primary'
    return 'info'
  }

  const displayValue = (field: SafetyFieldDefinition): string => {
    const value = record.value?.payload?.[field.key]
    if (Array.isArray(value)) return value.map(String).join('、') || '--'
    if (field.type === 'select') {
      return field.options?.find((option) => option.value === value)?.label ?? String(value || '--')
    }
    return String(value ?? '--')
  }

  const loadEvents = async (): Promise<void> => {
    if (!record.value?.id || !workspace.value?.capabilities.includes('timeline')) return
    eventState.loading = true
    try {
      const result = await fetchSafetyCatalogEvents(record.value.id)
      eventState.rows = result.data ?? []
    } finally {
      eventState.loading = false
    }
  }

  const handleOpen = async (data: OpenData): Promise<void> => {
    workspace.value = data.workspace
    record.value = data.record
    eventState.rows = []
    await drawerRef.value?.handleOpen(data, {
      title: `${data.workspace.title}详情`,
      subtitle: `${data.record.recordNo} · 租户业务数据`,
      size: 'lg',
      showFullscreenButton: true
    })
    await loadEvents()
  }

  const handlePrint = (): void => window.print()

  const handleTransition = async (action: SafetyWorkflowAction, label: string): Promise<void> => {
    if (!record.value?.id || transitioning.value) return
    try {
      const comment = await promptReason(
        `请填写“${label}”处理意见，内容会进入不可变审批留痕。`,
        label,
        {
          placeholder: '请输入审批依据、现场确认结果或转交说明',
          minLength: 2,
          maxLength: 500,
          confirmButtonText: label
        }
      )
      transitioning.value = true
      const result = await transitionSafetyCatalogRecord(record.value.id, action, comment)
      if (result.data) record.value = result.data
      await loadEvents()
      emit('updated')
    } catch {
      // 用户取消流程操作时保持当前状态。
    } finally {
      transitioning.value = false
    }
  }

  defineExpose({ handleOpen, handleClose: () => drawerRef.value?.handleClose() })
</script>

<style scoped lang="scss">
  .catalog-detail {
    display: grid;
    gap: 18px;

    &__hero,
    &__identity,
    &__tags,
    &__permit {
      display: flex;
    }

    &__hero {
      gap: 20px;
      align-items: flex-start;
      justify-content: space-between;
      padding: 18px;
      background: linear-gradient(
        135deg,
        var(--el-color-primary-light-9),
        var(--art-main-bg-color)
      );
      border: 1px solid var(--art-card-border);
      border-radius: 12px;
    }

    &__identity {
      gap: 14px;
      min-width: 0;

      h2 {
        margin: 8px 0 4px;
        font-size: 20px;
      }

      p {
        margin: 0;
        color: var(--art-text-gray-600);
      }
    }

    &__icon {
      display: grid;
      flex: 0 0 44px;
      place-items: center;
      width: 44px;
      height: 44px;
      color: var(--el-color-primary);
      background: var(--el-color-primary-light-8);
      border-radius: 10px;
    }

    &__tags {
      flex-wrap: wrap;
      gap: 6px;
    }

    &__qr {
      display: grid;
      gap: 6px;
      justify-items: center;
      padding: 8px;
      font-size: 12px;
      color: var(--art-text-gray-600);
      background: #fff;
      border-radius: 8px;
    }

    &__fields {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      border-top: 1px solid var(--art-card-border);
      border-left: 1px solid var(--art-card-border);

      article,
      .catalog-detail__permit article {
        display: grid;
        gap: 6px;
        min-width: 0;
        padding: 13px 14px;
        border-right: 1px solid var(--art-card-border);
        border-bottom: 1px solid var(--art-card-border);
      }

      span,
      .catalog-detail__permit span {
        font-size: 12px;
        color: var(--art-text-gray-600);
      }

      strong {
        overflow-wrap: anywhere;
      }
    }

    &__permit {
      gap: 10px;

      article {
        flex: 1;
        border: 1px solid var(--art-card-border);
        border-radius: 8px;
      }
    }

    &__measures {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;

      div {
        display: flex;
        gap: 8px;
        align-items: flex-start;
        padding: 10px 12px;
        background: var(--el-color-success-light-9);
        border: 1px solid var(--el-color-success-light-7);
        border-radius: 8px;
      }

      svg {
        flex: 0 0 auto;
        color: var(--el-color-success);
      }
    }

    &__timeline {
      min-height: 96px;

      p,
      small {
        margin: 4px 0 0;
        color: var(--art-text-gray-600);
      }
    }
  }

  @media (width <= 720px) {
    .catalog-detail__hero {
      flex-direction: column;
    }

    .catalog-detail__fields,
    .catalog-detail__measures {
      grid-template-columns: 1fr;
    }

    .catalog-detail__permit {
      flex-direction: column;
    }
  }

  @media print {
    :global(.el-drawer__header),
    :global(.el-drawer__footer) {
      display: none !important;
    }

    .catalog-detail__hero {
      color: #111;
      background: #fff;
    }
  }
</style>
