<template>
  <div class="special-equipment-page business-workspace-page art-full-height">
    <BusinessWorkspaceHeader
      eyebrow="SPECIAL EQUIPMENT & ALERTS"
      title="特种设备管理台账"
      description="集中管理锅炉、重大危险源与特种设备，维护压力表、安全阀、责任人和多渠道检验到期提醒。"
      icon="ri:shield-star-line"
      :tags="[
        { label: '锅炉专用表单', type: 'warning', effect: 'light' },
        { label: '企微 / 钉钉 / 移动端 / 短信', type: 'primary', effect: 'plain' },
        { label: '发送队列可审计', type: 'success', effect: 'plain' }
      ]"
      :metrics="workspaceMetrics"
    >
      <template #actions><BusinessTableWorkspaceActions :table="tableQueryRef" /></template>
    </BusinessWorkspaceHeader>

    <ArtSectionCard
      title="部门分类数量报表"
      subtitle="随部门查询范围实时汇总特种设备分类，可前往“特种设备统计分析”查看完整部门矩阵与图表。"
      :loading="report.loading"
      :error="report.error"
      :empty="!report.categories.length"
      empty-title="当前范围暂无分类数据"
      empty-description="将设备标记为特种设备、锅炉或重大危险源后生成。"
      :min-height="112"
      @retry="refreshTable"
    >
      <div class="special-equipment-page__category-report">
        <article v-for="item in report.categories" :key="item.categoryId">
          <span>{{ item.categoryName }}</span>
          <strong>{{ item.count }}</strong>
          <small>台</small>
        </article>
      </div>
    </ArtSectionCard>

    <ArtTableQuery
      ref="tableQueryRef"
      v-model="searchQuery"
      class="special-equipment-page__table"
      :api-fn="fetchTableData"
      :search-items="searchItems"
      :columns-factory="columnsFactory"
      :header-actions="headerActions"
      header-actions-placement="workspace"
      :search-bar-props="{ span: 5, labelWidth: 82, isExpand: true, showExpand: false }"
      :table-props="{
        rowKey: 'id',
        tableLayout: 'fixed',
        emptyText: '暂无特种设备',
        emptyDescription: '可新增锅炉，或在设备台账中将设备标记为重大危险源 / 特种设备。'
      }"
      focusable
    />

    <EquipmentLedgerDialog ref="equipmentDialogRef" @success="refreshTable" />
    <EquipmentReminderDialog ref="reminderDialogRef" @success="refreshTable" />
  </div>
</template>

<script setup lang="tsx">
  import dayjs from 'dayjs'
  import { ElTag } from 'element-plus'
  import type { SearchFormItem } from '@/components/core/forms/art-search-bar/index.vue'
  import type {
    ArtTableQueryExpose,
    ArtTableQueryHeaderAction
  } from '@/components/core/tables/art-table-query/index.vue'
  import type { ColumnOption } from '@/types'
  import TreeUtils from '@/utils/tree'
  import { useUserStore } from '@/store/modules/user'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import ArtDictDisplay from '@/components/core/base/art-dict-display/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import BusinessTableWorkspaceActions from '@/components/business/business-table-workspace-actions/index.vue'
  import ArtSectionCard from '@/components/core/surfaces/art-section-card/index.vue'
  import BusinessWorkspaceHeader, {
    type BusinessWorkspaceMetric
  } from '@/components/business/business-workspace-header/index.vue'
  import {
    fetchEquipmentLedgerList,
    fetchSpecialEquipmentAnalysis,
    type SmisEquipment,
    type SmisEquipmentCategory,
    type SmisSpecialEquipmentCategoryStat,
    type SmisStorageLocation,
    type WorkInstructionOrganization
  } from '@smis/api'
  import EquipmentLedgerDialog, {
    type EquipmentLedgerDialogOpenData
  } from '../equipment-ledger/modules/equipment-ledger-dialog.vue'
  import EquipmentReminderDialog, {
    type EquipmentReminderDialogOpenData
  } from './modules/equipment-reminder-dialog.vue'

  defineOptions({ name: 'SmisSpecialEquipmentLedger' })
  interface TableParams extends Pick<Api.Common.PaginationParams, 'current' | 'size'> {
    keyword?: string
    equipmentKind?: string
    operationStatus?: string
    organizationId?: string
  }
  interface EquipmentDialogExpose {
    handleOpen: (data: EquipmentLedgerDialogOpenData) => Promise<void>
  }
  interface ReminderDialogExpose {
    handleOpen: (data: EquipmentReminderDialogOpenData) => Promise<void>
  }
  const userStore = useUserStore()
  const { getDictMap } = storeToRefs(userStore)
  const tableQueryRef = ref<ArtTableQueryExpose>()
  const equipmentDialogRef = ref<EquipmentDialogExpose>()
  const reminderDialogRef = ref<ReminderDialogExpose>()
  const searchQuery = reactive<TableParams>({ current: 1, size: 20 })
  const tree = reactive<{
    categoryTree: SmisEquipmentCategory[]
    locationTree: SmisStorageLocation[]
  }>({ categoryTree: [], locationTree: [] })
  const organizationTreeUtils = new TreeUtils({
    idKey: 'id',
    parentKey: 'parentId',
    childrenKey: 'children'
  })
  const report = reactive<{
    organizations: WorkInstructionOrganization[]
    categories: SmisSpecialEquipmentCategoryStat[]
    loading: boolean
    error: string | null
  }>({ organizations: [], categories: [], loading: false, error: null })
  const stats = reactive({ total: 0, boilers: 0, majorHazards: 0, dueSoon: 0 })
  const dictOptions = (code: string) =>
    (getDictMap.value[code] ?? []).map((item) => ({
      label: item.label || item.name,
      value: item.value
    }))
  const workspaceMetrics = computed<BusinessWorkspaceMetric[]>(() => [
    {
      label: '重点设备',
      value: stats.total,
      description: '特种设备或重大危险源',
      icon: 'ri:shield-star-line'
    },
    {
      label: '锅炉',
      value: stats.boilers,
      description: '已维护锅炉专用信息',
      icon: 'ri:fire-line',
      tone: 'warning'
    },
    {
      label: '重大危险源',
      value: stats.majorHazards,
      description: '已标记重点监控',
      icon: 'ri:alarm-warning-line',
      tone: 'danger'
    },
    {
      label: '30 天内到期',
      value: stats.dueSoon,
      description: '检验提醒关注项',
      icon: 'ri:calendar-event-line',
      tone: stats.dueSoon ? 'danger' : undefined
    }
  ])
  const searchItems = computed<SearchFormItem[]>(() => [
    {
      label: '关键字',
      key: 'keyword',
      type: 'input',
      props: { clearable: true, placeholder: '设备编码、名称或型号' }
    },
    {
      label: '设备类型',
      key: 'equipmentKind',
      type: 'select',
      props: { options: dictOptions('smisEquipmentKind'), clearable: true, placeholder: '全部类型' }
    },
    {
      label: '运行状态',
      key: 'operationStatus',
      type: 'select',
      props: {
        options: dictOptions('smisEquipmentOperationStatus'),
        clearable: true,
        placeholder: '全部状态'
      }
    },
    {
      label: '使用部门',
      key: 'organizationId',
      type: 'treeSelect',
      props: {
        data: report.organizations,
        nodeKey: 'id',
        props: { label: 'organizationName', value: 'id', children: 'children' },
        checkStrictly: true,
        clearable: true,
        placeholder: '全部部门'
      }
    }
  ])
  const openEquipment = (row?: SmisEquipment, boiler = false) =>
    void equipmentDialogRef.value?.handleOpen({
      row,
      categoryTree: tree.categoryTree,
      locationTree: tree.locationTree,
      presetKind: boiler ? 'boiler' : undefined
    })
  const headerActions = computed<ArtTableQueryHeaderAction[]>(() => [
    {
      permission: 'SmisEquipmentLedger:Add',
      type: 'add',
      label: '新增锅炉',
      onClick: () => openEquipment(undefined, true)
    }
  ])
  const columnsFactory = (): ColumnOption<SmisEquipment>[] => [
    { type: 'globalIndex', label: '序号', width: 70 },
    {
      prop: 'equipmentName',
      label: '设备信息',
      minWidth: 220,
      fixed: 'left',
      formatter: (row) => (
        <div class="special-equipment-page__identity">
          <span aria-hidden="true">
            <ArtSvgIcon
              icon={row.equipmentKind === 'boiler' ? 'ri:fire-line' : 'ri:shield-star-line'}
            />
          </span>
          <span>
            <strong title={row.equipmentName}>{row.equipmentName}</strong>
            <small title={row.equipmentCode}>{row.equipmentCode}</small>
          </span>
        </div>
      )
    },
    {
      prop: 'equipmentKind',
      label: '设备类型',
      width: 115,
      formatter: (row) => <ArtDictDisplay dictCode="smisEquipmentKind" value={row.equipmentKind} />
    },
    {
      prop: 'boiler',
      label: '锅炉种类',
      width: 110,
      formatter: (row) =>
        row.boiler ? (
          <ArtDictDisplay dictCode="smisBoilerType" value={row.boiler.boilerType} />
        ) : (
          '—'
        )
    },
    {
      prop: 'location',
      label: '安装位置',
      minWidth: 150,
      showOverflowTooltip: true,
      formatter: (row) => row.location?.locationName || '未设置'
    },
    {
      prop: 'usingOrganization',
      label: '使用部门',
      minWidth: 150,
      showOverflowTooltip: true,
      formatter: (row) => row.usingOrganization.organizationName
    },
    {
      prop: 'managingOrganization',
      label: '管理部门',
      minWidth: 150,
      showOverflowTooltip: true,
      formatter: (row) => row.managingOrganization.organizationName
    },
    {
      prop: 'responsible',
      label: '责任人',
      width: 110,
      formatter: (row) => row.responsible?.employeeName || '未配置'
    },
    {
      prop: 'flags',
      label: '重点标识',
      width: 155,
      formatter: (row) => (
        <div class="special-equipment-page__flags">
          {row.isSpecialEquipment && (
            <ElTag size="small" type="warning">
              特种设备
            </ElTag>
          )}
          {row.isMajorHazardSource && (
            <ElTag size="small" type="danger">
              重大危险源
            </ElTag>
          )}
        </div>
      )
    },
    {
      prop: 'operationStatus',
      label: '运行状态',
      width: 105,
      formatter: (row) => (
        <ArtDictDisplay dictCode="smisEquipmentOperationStatus" value={row.operationStatus} />
      )
    },
    {
      prop: 'nextInspectionDueDate',
      label: '最近检验到期',
      width: 135,
      formatter: (row) =>
        row.nextInspectionDueDate ? dayjs(row.nextInspectionDueDate).format('YYYY-MM-DD') : '未计划'
    },
    {
      prop: 'operation',
      label: '操作',
      width: 120,
      fixed: 'right',
      formatter: (row) => (
        <div class="special-equipment-page__actions">
          <ArtButtonTable
            permission="SmisEquipmentReminder:Manage"
            icon="ri:notification-3-line"
            label="配置到期提醒"
            onClick={() => void reminderDialogRef.value?.handleOpen({ equipment: row })}
          />
          <ArtButtonTable
            permission="SmisEquipmentLedger:Edit"
            type="edit"
            onClick={() => openEquipment(row)}
          />
        </div>
      )
    }
  ]
  const fetchTableData = async (params: TableParams) => {
    report.loading = true
    report.error = null
    try {
      const [result, analysis] = await Promise.all([
        fetchEquipmentLedgerList({
          keyword: params.keyword,
          equipmentKind: params.equipmentKind as never,
          operationStatus: params.operationStatus as never,
          from: 0,
          to: 9999
        }),
        fetchSpecialEquipmentAnalysis(params.organizationId)
      ])
      tree.categoryTree = result.categoryTree
      tree.locationTree = result.locationTree
      report.organizations = analysis.data.organizations
      report.categories = analysis.data.categories
      report.error = analysis.error ? '部门分类报表加载失败，请重试。' : null
      const organizationIds = params.organizationId
        ? new Set(
            organizationTreeUtils
              .getDescendants(report.organizations, params.organizationId, true)
              .map((item) => item.id)
          )
        : null
      const all = result.data.filter(
        (row) =>
          (row.isSpecialEquipment || row.isMajorHazardSource || row.equipmentKind === 'boiler') &&
          (!organizationIds || organizationIds.has(row.usingOrganizationId))
      )
      stats.total = all.length
      stats.boilers = all.filter((row) => row.equipmentKind === 'boiler').length
      stats.majorHazards = all.filter((row) => row.isMajorHazardSource).length
      stats.dueSoon = all.filter(
        (row) =>
          row.nextInspectionDueDate &&
          dayjs(row.nextInspectionDueDate).isBefore(dayjs().add(31, 'day')) &&
          !dayjs(row.nextInspectionDueDate).isBefore(dayjs(), 'day')
      ).length
      const from = (Math.max(params.current || 1, 1) - 1) * (params.size || 20)
      return { records: all.slice(from, from + (params.size || 20)), total: all.length }
    } finally {
      report.loading = false
    }
  }
  const refreshTable = async () => {
    await tableQueryRef.value?.getData()
  }
  onMounted(
    () =>
      void Promise.all(
        [
          'smisEquipmentKind',
          'smisEquipmentOperationStatus',
          'smisBoilerType',
          'smisEquipmentReminderChannel'
        ].map((code) => userStore.ensureDictLoaded(code))
      )
  )
</script>

<style scoped lang="scss">
  .special-equipment-page {
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-height: 0;

    &__table {
      flex: 1;
      min-height: 0;
    }

    &__category-report {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 10px;
    }

    &__category-report article {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto auto;
      gap: 5px;
      align-items: baseline;
      padding: 11px 13px;
      background: var(--art-gray-100);
      border-radius: var(--el-border-radius-base);
    }

    &__category-report span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__category-report strong {
      font-size: 20px;
      color: var(--theme-color);
    }

    &__category-report small {
      color: var(--el-text-color-secondary);
    }

    :deep(.special-equipment-page__identity) {
      display: grid;
      grid-template-columns: 36px minmax(0, 1fr);
      gap: 10px;
      align-items: center;
      min-width: 0;

      > span:first-child {
        display: grid;
        place-items: center;
        width: 36px;
        height: 36px;
        color: var(--theme-color);
        background: color-mix(in srgb, var(--theme-color) 9%, var(--el-bg-color));
        border-radius: var(--el-border-radius-base);
      }

      > span:last-child {
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
        color: var(--el-text-color-primary);
      }

      small {
        margin-top: 2px;
        font-size: 11px;
        color: var(--el-text-color-secondary);
      }
    }

    &__flags,
    &__actions {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }
  }
</style>
