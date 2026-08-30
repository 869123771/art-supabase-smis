<template>
  <ArtPermissionGuard permission="SmisToolPersonalStandard:View">
    <div class="personal-page business-workspace-page art-full-height">
      <BusinessWorkspaceHeader
        eyebrow="EMPLOYEE TOOL ENTITLEMENT"
        title="工器具个人标准"
        description="从启用的发放标准按员工岗位和所属组织生成个人定额，清晰追溯每项物料的来源标准。"
        icon="ri:user-settings-line"
        :tags="[
          { label: '组织岗位联动', type: 'primary', effect: 'plain' },
          { label: '批量生成', type: 'success', effect: 'light' },
          { label: '来源可追溯', type: 'info', effect: 'plain' }
        ]"
        :metrics="metrics"
      >
        <template #actions><BusinessTableWorkspaceActions :table="tableQueryRef" /></template>
      </BusinessWorkspaceHeader>

      <div class="personal-page__workspace">
        <ArtWorkspaceSplitter
          primary-size="296px"
          primary-min="264px"
          primary-max="400px"
          :breakpoint="1200"
          narrow-mode="hide"
        >
          <template #primary>
            <aside v-if="isDesktopOrganizationLayout" class="personal-page__organization-panel">
              <ToolOrganizationNavigator
                :data="organizations"
                :loading="organizationLoading"
                :error="organizationError"
                :selected-key="selectedOrganizationId"
                :employee-count="overview.employeeTotal"
                @select="selectOrganization"
                @refresh="loadOrganizations"
              />
            </aside>
          </template>

          <main class="personal-page__main">
            <section
              v-if="!isDesktopOrganizationLayout"
              class="personal-page__mobile-scope art-card-xs"
            >
              <span aria-hidden="true"><ArtSvgIcon icon="ri:node-tree" /></span>
              <div
                ><small>当前组织范围</small><strong>{{ selectedOrganizationLabel }}</strong></div
              >
              <ElButton type="primary" plain @click="openOrganizationDrawer">
                <ArtSvgIcon icon="ri:filter-3-line" />选择组织
              </ElButton>
            </section>

            <section class="personal-page__scope-bar" aria-live="polite">
              <div class="personal-page__scope-identity">
                <span aria-hidden="true"><ArtSvgIcon icon="ri:group-line" /></span>
                <span
                  ><small>当前员工范围</small><strong>{{ selectedOrganizationLabel }}</strong></span
                >
              </div>
              <div class="personal-page__scope-summary">
                <span>{{ overview.employeeTotal }} 名员工</span>
                <span>{{ overview.generatedTotal }} 名已生成</span>
                <span>{{ overview.itemTotal }} 项工器具明细</span>
              </div>
            </section>

            <ArtTableQuery
              ref="tableQueryRef"
              v-model="searchQuery"
              class="personal-page__table"
              :api-fn="fetchTableData"
              :search-items="searchItems"
              :columns-factory="columnsFactory"
              :header-actions="headerActions"
              header-actions-placement="workspace"
              :search-bar-props="{ span: 8, labelWidth: 72, showExpand: false }"
              :table-props="{
                rowKey: 'employeeId',
                tableLayout: 'fixed',
                emptyText: '当前范围暂无员工',
                emptyDescription: '请切换组织范围，或检查 HR 员工花名册与岗位配置。'
              }"
              focusable
              focus-scope-selector=".personal-page__workspace"
            />
          </main>
        </ArtWorkspaceSplitter>
      </div>

      <ArtDrawer
        ref="organizationDrawerRef"
        size="sm"
        :show-footer="false"
        content-height="calc(100vh - 126px)"
      >
        <ToolOrganizationNavigator
          class="personal-page__drawer-navigator"
          :data="organizations"
          :loading="organizationLoading"
          :error="organizationError"
          :selected-key="selectedOrganizationId"
          :employee-count="overview.employeeTotal"
          @select="selectOrganization"
          @refresh="loadOrganizations"
        />
      </ArtDrawer>
      <PersonalStandardDetailDrawer ref="detailDrawerRef" />
      <PersonalIssuePlanDialog ref="planDialogRef" @success="refreshPlanData" />
    </div>
  </ArtPermissionGuard>
</template>

<script setup lang="tsx">
  import dayjs from 'dayjs'
  import { useMediaQuery } from '@vueuse/core'
  import { ElAvatar, ElTag } from 'element-plus'
  import type { SearchFormItem } from '@/components/core/forms/art-search-bar/index.vue'
  import type {
    ArtTableQueryExpose,
    ArtTableQueryHeaderAction
  } from '@/components/core/tables/art-table-query/index.vue'
  import type { ArtDrawerExpose } from '@/components/core/drawers/art-drawer/types'
  import type { ColumnOption } from '@/types'
  import { pageInfoHandler } from '@/utils/table/tableUtils'
  import { useUserStore } from '@/store/modules/user'
  import { getFriendlySupabaseErrorMessage } from '@/utils/supabase/error'
  import TreeUtils from '@/utils/tree'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import ArtDrawer from '@/components/core/drawers/art-drawer/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import ArtWorkspaceSplitter from '@/components/core/layouts/art-workspace-splitter/index.vue'
  import BusinessTableWorkspaceActions from '@/components/business/business-table-workspace-actions/index.vue'
  import BusinessWorkspaceHeader, {
    type BusinessWorkspaceMetric
  } from '@/components/business/business-workspace-header/index.vue'
  import PersonalIssuePlanDialog from './modules/personal-issue-plan-dialog.vue'
  import PersonalStandardDetailDrawer from './modules/personal-standard-detail-drawer.vue'
  import ToolOrganizationNavigator from './modules/tool-organization-navigator.vue'
  import {
    fetchToolPersonalStandardList,
    fetchToolScopeOptions,
    generateToolPersonalStandards,
    type SmisToolPersonalStandard,
    type SmisToolPersonalStandardOverview,
    type SmisToolPersonalStandardSearchParams,
    type SmisToolScopeOption
  } from '@smis/api'

  defineOptions({ name: 'SmisToolPersonalStandard' })

  const ALL_KEY = 'all'
  type TableParams = SmisToolPersonalStandardSearchParams &
    Pick<Api.Common.PaginationParams, 'current' | 'size'>

  const userStore = useUserStore()
  const treeUtils = new TreeUtils({ idKey: 'id', parentKey: 'parentId', childrenKey: 'children' })
  const isDesktopOrganizationLayout = useMediaQuery('(min-width: 1201px)')
  const tableQueryRef = ref<ArtTableQueryExpose>()
  const organizationDrawerRef = ref<ArtDrawerExpose<Record<string, never>>>()
  const detailDrawerRef = ref<{ handleOpen: (row: SmisToolPersonalStandard) => Promise<void> }>()
  const planDialogRef = ref<{ handleOpen: (row: SmisToolPersonalStandard) => Promise<void> }>()
  const organizations = ref<SmisToolScopeOption[]>([])
  const organizationLoading = ref(false)
  const organizationError = ref<string | null>(null)
  const selectedOrganizationId = ref(ALL_KEY)
  const positionOptions = ref<SmisToolScopeOption[]>([])
  const searchQuery = reactive<SmisToolPersonalStandardSearchParams>({ onlyMissing: false })
  const overview = reactive<SmisToolPersonalStandardOverview>({
    employeeTotal: 0,
    generatedTotal: 0,
    missingTotal: 0,
    itemTotal: 0
  })

  const metrics = computed<BusinessWorkspaceMetric[]>(() => [
    {
      label: '范围内员工',
      value: overview.employeeTotal,
      description: '当前组织筛选结果',
      icon: 'ri:team-line'
    },
    {
      label: '已生成',
      value: overview.generatedTotal,
      description: '拥有工器具个人标准',
      icon: 'ri:user-follow-line',
      tone: 'success'
    },
    {
      label: '待生成',
      value: overview.missingTotal,
      description: '尚无个人标准',
      icon: 'ri:user-unfollow-line',
      tone: 'warning'
    },
    {
      label: '工器具明细',
      value: overview.itemTotal,
      description: '全部员工工器具项',
      icon: 'ri:archive-stack-line'
    }
  ])
  const searchItems = computed<SearchFormItem[]>(() => [
    {
      label: '员工信息',
      key: 'keyword',
      type: 'input',
      props: { clearable: true, placeholder: '姓名、工号或岗位' }
    },
    {
      label: '岗位',
      key: 'positionId',
      type: 'select',
      options: positionOptions.value.map((item) => ({
        label: `${item.name} · ${item.code}`,
        value: item.id
      })),
      props: { clearable: true, filterable: true, placeholder: '全部岗位' }
    },
    {
      label: '生成状态',
      key: 'onlyMissing',
      type: 'switch',
      props: { activeText: '仅待生成', inactiveText: '全部员工', inlinePrompt: false }
    }
  ])
  const flatOrganizations = computed(() => treeUtils.treeToList(organizations.value))
  const selectedOrganization = computed(() =>
    selectedOrganizationId.value === ALL_KEY
      ? null
      : flatOrganizations.value.find((item) => item.id === selectedOrganizationId.value)
  )
  const selectedOrganizationLabel = computed(() => selectedOrganization.value?.name || '全部员工')
  const descendantIds = computed(() => {
    if (selectedOrganizationId.value === ALL_KEY) return undefined
    const node = treeUtils.findNode(
      organizations.value,
      selectedOrganizationId.value
    ) as SmisToolScopeOption | null
    return node
      ? treeUtils.treeToList([node]).map((item) => String(item.id))
      : [selectedOrganizationId.value]
  })

  const selectOrganization = async (id: string): Promise<void> => {
    if (selectedOrganizationId.value !== id) {
      selectedOrganizationId.value = id
      await tableQueryRef.value?.getData()
    }
    if (!isDesktopOrganizationLayout.value) organizationDrawerRef.value?.handleClose()
  }
  const loadOrganizations = async (): Promise<void> => {
    organizationLoading.value = true
    organizationError.value = null
    try {
      const result = await fetchToolScopeOptions('organization')
      if (result.error) throw result.error
      organizations.value = result.data ?? []
      if (
        selectedOrganizationId.value !== ALL_KEY &&
        !treeUtils.findNode(organizations.value, selectedOrganizationId.value)
      )
        selectedOrganizationId.value = ALL_KEY
    } catch (error) {
      organizations.value = []
      organizationError.value = getFriendlySupabaseErrorMessage(
        error,
        '组织结构加载失败，请稍后重试'
      )
    } finally {
      organizationLoading.value = false
    }
  }
  const openOrganizationDrawer = (): void => {
    organizationDrawerRef.value?.handleOpen(
      {},
      {
        title: '选择组织范围',
        subtitle: '按组织结构筛选员工花名册',
        showFooter: false
      }
    )
  }
  const openDetails = (row: SmisToolPersonalStandard): void => {
    void detailDrawerRef.value?.handleOpen(row)
  }
  const generate = async (rows: SmisToolPersonalStandard[]): Promise<void> => {
    const result = await generateToolPersonalStandards(rows.map((row) => row.employeeId))
    if (result.data?.unmatchedCount)
      ElMessage.warning(`${result.data.unmatchedCount} 名员工未匹配到启用的发放标准`)
    await tableQueryRef.value?.getData()
  }
  const openPlan = (row: SmisToolPersonalStandard): void => {
    if (!row.personalStandardId) {
      ElMessage.warning('请先为该员工生成工器具个人标准')
      return
    }
    void planDialogRef.value?.handleOpen(row)
  }
  const refreshPlanData = async (): Promise<void> => {
    await tableQueryRef.value?.getData()
  }
  const headerActions = computed<ArtTableQueryHeaderAction[]>(() => [
    {
      permission: 'SmisToolPersonalStandard:Generate',
      label: '生成个人标准',
      icon: 'ri:magic-line',
      type: 'add',
      selectionRequired: true,
      onClick: ({ selectedRows }) => generate(selectedRows as SmisToolPersonalStandard[])
    },
    {
      permission: 'SmisToolPersonalStandard:Schedule',
      key: 'schedule',
      label: '设置领用计划',
      icon: 'ri:calendar-schedule-line',
      selectionRequired: true,
      disabled: ({ selectedRows }) =>
        selectedRows.length !== 1 ||
        !(selectedRows[0] as SmisToolPersonalStandard).personalStandardId,
      onClick: ({ selectedRows }) => openPlan(selectedRows[0] as SmisToolPersonalStandard)
    },
    {
      permission: 'SmisToolPersonalStandard:Export',
      type: 'export',
      label: '导出',
      exportFilename: '工器具个人标准',
      exportSheetName: '个人标准',
      exportColumns: [
        { key: 'employeeNo', title: '员工工号' },
        { key: 'employeeName', title: '员工姓名' },
        { key: 'organizationName', title: '所属部门' },
        { key: 'positionName', title: '岗位' },
        { key: 'itemCount', title: '工器具项数' },
        { key: 'generatedAt', title: '生成时间' }
      ],
      exportApi: async ({ maxRows }) => {
        const result = await fetchToolPersonalStandardList({
          ...searchQuery,
          organizationIds: descendantIds.value,
          purpose: 'export',
          from: 0,
          to: maxRows - 1
        })
        return { data: result.data }
      }
    }
  ])
  const columnsFactory = (): ColumnOption<SmisToolPersonalStandard>[] => [
    { type: 'selection', width: 48, reserveSelection: true },
    {
      prop: 'employeeName',
      label: '员工身份',
      minWidth: 220,
      fixed: 'left',
      formatter: (row) => (
        <button
          class="personal-page__employee"
          type="button"
          title={`查看 ${row.employeeName} 的工器具个人标准明细`}
          onClick={() => openDetails(row)}
        >
          <ElAvatar size={38} src={row.avatarUrl || undefined} alt={`${row.employeeName}的头像`}>
            {row.employeeName.trim().slice(0, 1) || '员'}
          </ElAvatar>
          <span>
            <strong>{row.employeeName}</strong>
            <small translate="no">{row.employeeNo}</small>
          </span>
        </button>
      )
    },
    {
      prop: 'organizationName',
      label: '组织与岗位',
      minWidth: 240,
      formatter: (row) => (
        <div class="personal-page__assignment">
          <strong title={row.organizationName || undefined}>
            {row.organizationName || '未分配组织'}
          </strong>
          <small title={row.positionName || undefined}>{row.positionName || '未配置岗位'}</small>
        </div>
      )
    },
    {
      prop: 'personalStandardId',
      label: '个人标准',
      minWidth: 176,
      formatter: (row) => (
        <div class="personal-page__standard-status">
          <ElTag type={row.personalStandardId ? 'success' : 'warning'} effect="light">
            {row.personalStandardId ? '已生成' : '待生成'}
          </ElTag>
          <small>{row.itemCount ? `${row.itemCount} 项工器具定额` : '尚无工器具明细'}</small>
        </div>
      )
    },
    {
      prop: 'generatedAt',
      label: '最近生成',
      width: 172,
      formatter: (row) =>
        row.generatedAt ? (
          <div class="personal-page__generated-time">
            <strong>{dayjs(row.generatedAt).format('YYYY-MM-DD')}</strong>
            <small>{dayjs(row.generatedAt).format('HH:mm')}</small>
          </div>
        ) : (
          <span class="personal-page__muted">尚未生成</span>
        )
    },
    {
      prop: 'operation',
      label: '操作',
      width: 150,
      fixed: 'right',
      formatter: (row) => (
        <div class="personal-page__row-actions">
          <ArtButtonTable
            icon="ri:file-list-3-line"
            label="查看明细"
            onClick={() => openDetails(row)}
          />
          <ArtButtonTable
            permission="SmisToolPersonalStandard:Generate"
            icon="ri:magic-line"
            label={row.personalStandardId ? '重新生成' : '生成个人标准'}
            onClick={() => generate([row])}
          />
          <ArtButtonTable
            permission="SmisToolPersonalStandard:Schedule"
            icon="ri:calendar-schedule-line"
            label="设置领用计划"
            disabled={!row.personalStandardId}
            onClick={() => openPlan(row)}
          />
        </div>
      )
    }
  ]
  const fetchTableData = async (params: TableParams) => {
    const result = await fetchToolPersonalStandardList({
      ...pageInfoHandler(params),
      ...params,
      organizationIds: descendantIds.value
    })
    Object.assign(overview, result.overview)
    return { records: result.data, total: result.total }
  }

  onMounted(async () => {
    await Promise.all([
      loadOrganizations(),
      fetchToolScopeOptions('position').then((result) => {
        positionOptions.value = result.data ?? []
      }),
      ...['smisToolIssuanceCycle', 'smisMaterialEnableStatus', 'smisMaterialUnit'].map((code) =>
        userStore.ensureDictLoaded(code)
      )
    ])
  })
</script>

<style scoped lang="scss">
  .personal-page {
    gap: 12px;
    min-width: 0;
    min-height: 0;

    &__workspace {
      flex: 1 1 auto;
      width: 100%;
      min-width: 0;
      min-height: 0;
    }

    &__organization-panel,
    &__main,
    &__table {
      min-width: 0;
      min-height: 0;
    }

    &__organization-panel {
      height: 100%;
      overflow: hidden;
    }

    &__main {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    &__table {
      flex: 1 1 auto;
    }

    &__scope-bar,
    &__mobile-scope {
      display: flex;
      flex: 0 0 auto;
      gap: 16px;
      align-items: center;
      justify-content: space-between;
    }

    &__scope-bar {
      min-height: 56px;
      padding: 8px 14px 8px 12px;
      background: var(--art-gray-100);
      border-left: 3px solid var(--theme-color);
      border-radius: var(--el-border-radius-base);
    }

    &__scope-identity,
    &__mobile-scope > div {
      display: flex;
      gap: 10px;
      align-items: center;
      min-width: 0;
    }

    &__scope-identity > span:first-child,
    &__mobile-scope > span:first-child {
      display: inline-flex;
      flex: 0 0 32px;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      color: var(--theme-color);
      background: color-mix(in srgb, var(--theme-color) 10%, var(--default-box-color));
      border-radius: var(--el-border-radius-base);
    }

    &__scope-identity > span:last-child,
    &__mobile-scope > div {
      display: grid;
      min-width: 0;
    }

    &__scope-identity small,
    &__mobile-scope small {
      font-size: 11px;
      color: var(--el-text-color-secondary);
    }

    &__scope-identity strong,
    &__mobile-scope strong {
      margin-top: 2px;
      overflow: hidden;
      text-overflow: ellipsis;
      color: var(--el-text-color-primary);
      white-space: nowrap;
    }

    &__scope-summary {
      display: flex;
      gap: 16px;
      align-items: center;
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }

    &__scope-summary span + span {
      padding-left: 16px;
      border-left: 1px solid var(--el-border-color);
    }

    &__mobile-scope {
      padding: 10px 12px;

      > div {
        flex: 1;
      }
    }

    :deep(.personal-page__employee) {
      display: flex;
      gap: 10px;
      align-items: center;
      width: 100%;
      min-width: 0;
      padding: 2px 0;
      font: inherit;
      color: inherit;
      text-align: left;
      cursor: pointer;
      background: transparent;
      border: 0;
      border-radius: var(--el-border-radius-small);
    }

    :deep(.personal-page__employee:focus-visible) {
      outline: 2px solid var(--theme-color);
      outline-offset: 2px;
    }

    :deep(.personal-page__employee .el-avatar) {
      flex: 0 0 auto;
      color: var(--art-gray-700);
      background: var(--art-gray-200);
    }

    :deep(.personal-page__employee > span),
    :deep(.personal-page__assignment),
    :deep(.personal-page__standard-status),
    :deep(.personal-page__generated-time) {
      display: grid;
      min-width: 0;
    }

    :deep(.personal-page__employee strong),
    :deep(.personal-page__employee small),
    :deep(.personal-page__assignment strong),
    :deep(.personal-page__assignment small) {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    :deep(.personal-page__employee strong) {
      color: var(--el-text-color-primary);
    }

    :deep(.personal-page__employee:hover strong) {
      color: var(--theme-color);
    }

    :deep(.personal-page__employee small),
    :deep(.personal-page__assignment small),
    :deep(.personal-page__standard-status small),
    :deep(.personal-page__generated-time small) {
      margin-top: 3px;
      font-size: 11px;
      color: var(--el-text-color-secondary);
    }

    :deep(.personal-page__standard-status .el-tag) {
      justify-self: start;
    }

    :deep(.personal-page__row-actions) {
      display: flex;
      gap: 4px;
      align-items: center;
      justify-content: center;
      min-width: 0;
      white-space: nowrap;
    }

    :deep(.personal-page__row-actions .art-button-table) {
      flex: 0 0 32px;
      margin-right: 0;
    }

    :deep(.personal-page__muted) {
      color: var(--el-text-color-secondary);
    }

    &__drawer-navigator {
      height: 100%;
    }

    @media (width <= 1080px) {
      &__scope-summary {
        display: none;
      }
    }
  }
</style>
