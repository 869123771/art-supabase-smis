<template>
  <div class="site-page business-workspace-page art-full-height">
    <BusinessWorkspaceHeader
      class="site-page__overview"
      eyebrow="SITE MASTER DATA"
      title="场所维护"
      description="以树形层级维护部门场所、责任人员、现场图片与地图坐标，为安全业务提供统一位置底座。"
      icon="ri:map-pin-2-line"
      density="compact"
      :tags="[
        { label: '树形场所层级', type: 'primary', effect: 'plain' },
        { label: '员工花名册联动', type: 'success', effect: 'light' },
        { label: '地图选点', type: 'info', effect: 'plain' }
      ]"
      :metrics="workspaceMetrics"
    >
      <template #actions>
        <BusinessTableWorkspaceActions :table="tableQueryRef" />
      </template>
    </BusinessWorkspaceHeader>

    <div class="site-page__workspace">
      <ArtWorkspaceSplitter
        primary-size="288px"
        primary-min="244px"
        primary-max="380px"
        :breakpoint="820"
        stacked-primary-size="320px"
      >
        <template #primary>
          <aside class="site-page__department-panel">
            <DepartmentNavigator
              :data="organizationState.tree"
              :loading="organizationState.loading"
              :error="organizationState.error"
              :selected-key="organizationState.selectedKey"
              @select="handleOrganizationSelect"
              @refresh="handleOrganizationRefresh"
            />
          </aside>
        </template>

        <main class="site-page__main">
          <div class="site-page__scope-bar">
            <div class="site-page__scope-identity">
              <span aria-hidden="true"><ArtSvgIcon :icon="selectedOrganizationIcon" /></span>
              <span>
                <small>当前部门范围</small>
                <strong>{{ selectedOrganizationLabel }}</strong>
              </span>
            </div>
            <p><ArtSvgIcon icon="ri:git-merge-line" />选择部门节点时自动包含其下级部门</p>
          </div>

          <ArtTableQuery
            ref="tableQueryRef"
            v-model="searchQuery"
            class="site-page__table"
            :api-params="{ current: 1, size: 1000 }"
            :api-fn="fetchTableData"
            :search-items="searchItems"
            :columns-factory="columnsFactory"
            :header-actions="headerActions"
            header-actions-placement="workspace"
            :search-bar-props="{ span: 8, labelWidth: 86, showExpand: false }"
            :table-props="tableProps"
            focusable
            focus-scope-selector=".site-page__workspace"
          />
        </main>
      </ArtWorkspaceSplitter>
    </div>

    <SiteDialog ref="dialogRef" @success="handleSaveSuccess" />
  </div>
</template>

<script setup lang="tsx">
  import { ElImage, ElMessage } from 'element-plus'
  import type { SearchFormItem } from '@/components/core/forms/art-search-bar/index.vue'
  import type {
    ArtTableQueryExcelColumn,
    ArtTableQueryExpose,
    ArtTableQueryHeaderAction,
    ArtTableQueryHeaderActionContext,
    ArtTableQueryTableProps
  } from '@/components/core/tables/art-table-query/index.vue'
  import type { ColumnOption } from '@/types'
  import { useArtFeedback } from '@/hooks/core/useArtFeedback'
  import { useUserStore } from '@/store/modules/user'
  import { useTenantScopeStore } from '@/store/modules/tenantScope'
  import { fetchGetOrganizationTree } from '@/api/system-manage'
  import { getFriendlySupabaseErrorMessage } from '@/utils/supabase/error'
  import TreeUtils from '@/utils/tree'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import ArtButtonMore, {
    type ButtonMoreItem
  } from '@/components/core/forms/art-button-more/index.vue'
  import ArtDictDisplay from '@/components/core/base/art-dict-display/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import BusinessTableWorkspaceActions from '@/components/business/business-table-workspace-actions/index.vue'
  import BusinessWorkspaceHeader, {
    type BusinessWorkspaceMetric
  } from '@/components/business/business-workspace-header/index.vue'
  import ArtWorkspaceSplitter from '@/components/core/layouts/art-workspace-splitter/index.vue'
  import {
    deleteSites,
    fetchSiteEmployeeOptions,
    fetchSiteList,
    saveSite,
    type SmisSite,
    type SmisSiteSearchParams
  } from '@smis/api'
  import DepartmentNavigator from './modules/department-navigator.vue'
  import SiteDialog, { type SiteDialogOpenData } from './modules/site-dialog.vue'

  defineOptions({ name: 'SmisSite' })
  type Organization = Api.SystemManage.OrganizationListItem
  interface DialogExpose {
    handleOpen: (data: SiteDialogOpenData) => Promise<void>
  }
  interface SiteImportRow {
    organizationCode: string
    parentSiteName?: string
    siteName: string
    categoryCode: string
    sort?: number
    responsibleEmployeeNo?: string
    addressDetail?: string
    longitude?: string | number
    latitude?: string | number
    imageUrls?: string
    remark?: string
  }

  const ALL_ORGANIZATIONS_KEY = 'all'
  const { confirmAction } = useArtFeedback()
  const userStore = useUserStore()
  const { getDictMap } = storeToRefs(userStore)
  const { effectiveTenantId } = storeToRefs(useTenantScopeStore())
  const organizationTreeUtils = new TreeUtils({
    idKey: 'id',
    parentKey: 'parentId',
    childrenKey: 'children'
  })
  const siteTreeUtils = new TreeUtils({
    idKey: 'id',
    parentKey: 'parentId',
    childrenKey: 'children'
  })
  const tableQueryRef = ref<ArtTableQueryExpose>()
  const dialogRef = ref<DialogExpose>()
  const organizationState = reactive({
    tree: [] as Organization[],
    loading: false,
    error: null as string | null,
    selectedKey: ALL_ORGANIZATIONS_KEY
  })
  const allSites = shallowRef<SmisSite[]>([])
  const displaySites = shallowRef<SmisSite[]>([])
  const searchQuery = ref<SmisSiteSearchParams>({
    keyword: '',
    categoryCode: undefined
  })

  const flatOrganizations = computed(() => organizationTreeUtils.treeToList(organizationState.tree))
  const selectedOrganization = computed(() =>
    organizationState.selectedKey === ALL_ORGANIZATIONS_KEY
      ? undefined
      : organizationTreeUtils.findNode(organizationState.tree, organizationState.selectedKey)
  )
  const selectedOrganizationLabel = computed(
    () => selectedOrganization.value?.organizationName || '全部部门'
  )
  const selectedOrganizationIcon = computed(() =>
    selectedOrganization.value?.organizationType === 'company'
      ? 'ri:building-4-line'
      : selectedOrganization.value
        ? 'ri:team-line'
        : 'ri:organization-chart'
  )
  const selectedOrganizationIds = computed(() => {
    if (!selectedOrganization.value?.id) return []
    return organizationTreeUtils
      .getDescendants(organizationState.tree, selectedOrganization.value.id, true)
      .map((organization) => organization.id)
      .filter((id): id is string => Boolean(id))
  })
  const categoryOptions = computed(() =>
    (getDictMap.value.smisSiteCategory ?? []).map((item) => ({
      label: item.label || item.name,
      value: item.value
    }))
  )
  const resolveCategory = (value: string): string =>
    categoryOptions.value.find((item) => item.value === value)?.label || value
  const workspaceMetrics = computed<BusinessWorkspaceMetric[]>(() => [
    {
      label: '场所节点',
      value: allSites.value.length,
      description: '当前租户已维护',
      icon: 'ri:node-tree'
    },
    {
      label: '一级场所',
      value: allSites.value.filter((row) => !row.parentId).length,
      description: '树形根节点',
      icon: 'ri:folder-3-line'
    },
    {
      label: '已定责任人',
      value: allSites.value.filter((row) => row.responsibleEmployeeId).length,
      description: '来自员工花名册',
      icon: 'ri:user-star-line',
      tone: 'success'
    },
    {
      label: '已定位',
      value: allSites.value.filter((row) => row.longitude != null && row.latitude != null).length,
      description: '已取得经纬度',
      icon: 'ri:map-pin-line',
      tone: 'warning'
    }
  ])
  const searchItems = computed<SearchFormItem[]>(() => [
    {
      label: '关键字',
      key: 'keyword',
      type: 'input',
      props: { clearable: true, placeholder: '场所名称、责任人、手机号或地址' }
    },
    {
      label: '属性类别',
      key: 'categoryCode',
      type: 'select',
      props: { options: categoryOptions.value, clearable: true, placeholder: '全部类别' }
    }
  ])
  const excelColumns: ArtTableQueryExcelColumn[] = [
    { key: 'organizationCode', title: '部门编码', required: true },
    { key: 'parentSiteName', title: '上级场所' },
    { key: 'siteName', title: '场所名称', required: true },
    { key: 'categoryCode', title: '属性类别', required: true },
    { key: 'sort', title: '顺序号' },
    { key: 'responsibleEmployeeNo', title: '责任人员工号' },
    { key: 'addressDetail', title: '场所地址' },
    { key: 'longitude', title: '经度' },
    { key: 'latitude', title: '纬度' },
    { key: 'imageUrls', title: '图片地址（多个用逗号分隔）' },
    { key: 'remark', title: '备注' }
  ]

  const buildTree = (rows: SmisSite[]): SmisSite[] => {
    const validRows = rows.filter(
      (row): row is SmisSite & { id: string } => typeof row.id === 'string'
    )
    return siteTreeUtils.listToTree(validRows, (left, right) => {
      return left.sort - right.sort || left.siteName.localeCompare(right.siteName, 'zh-CN')
    })
  }
  const filterRows = (rows: SmisSite[], params: SmisSiteSearchParams): SmisSite[] => {
    const keyword = params.keyword?.trim().toLocaleLowerCase('zh-CN')
    const map = new Map(rows.map((row) => [row.id, row]))
    const included = new Set<string>()
    const organizationIds = new Set(selectedOrganizationIds.value)
    rows.forEach((row) => {
      const matchesKeyword =
        !keyword ||
        [
          row.siteName,
          row.organization.organizationName,
          row.responsible?.employeeName,
          row.responsible?.phone,
          row.addressDetail
        ].some((value) =>
          String(value ?? '')
            .toLocaleLowerCase('zh-CN')
            .includes(keyword)
        )
      if (
        matchesKeyword &&
        (!organizationIds.size || organizationIds.has(row.organizationId)) &&
        (!params.categoryCode || row.categoryCode === params.categoryCode)
      ) {
        let current: SmisSite | undefined = row
        while (current?.id) {
          included.add(current.id)
          current = current.parentId ? map.get(current.parentId) : undefined
        }
      }
    })
    return rows.filter((row) => row.id && included.has(row.id))
  }
  const fetchTableData = async (params: SmisSiteSearchParams) => {
    const response = await fetchSiteList()
    allSites.value = response.data ?? []
    const filtered = filterRows(allSites.value, params)
    displaySites.value = buildTree(filtered)
    return { data: displaySites.value, total: filtered.length, error: response.error }
  }
  const tableProps = computed<ArtTableQueryTableProps>(() => ({
    rowKey: 'id',
    treeProps: { children: 'children' },
    indent: 20,
    tableLayout: 'fixed',
    emptyText: selectedOrganization.value ? '当前部门暂无场所' : '暂无场所数据',
    emptyDescription: selectedOrganization.value
      ? '可新增当前部门的一级场所，再逐级维护下级区域与位置。'
      : '可新增一级场所，再逐级维护下级区域与位置。',
    paginationOptions: { hideOnSinglePage: true },
    rowClassName: ({ row }) => (row.parentId ? 'site-tree-row is-child' : 'site-tree-row is-root')
  }))

  const openDialog = (row?: SmisSite, parent?: SmisSite): void => {
    const excluded = row?.id ? new Set(collectDescendantIds(row.id)) : new Set<string>()
    if (row?.id) excluded.add(row.id)
    void dialogRef.value?.handleOpen({
      organizations: organizationState.tree,
      sites: buildTree(allSites.value.filter((item) => !item.id || !excluded.has(item.id))),
      row,
      parent,
      initialOrganizationId: selectedOrganization.value?.id
    })
  }
  const collectDescendantIds = (id: string): string[] => {
    return siteTreeUtils
      .getDescendants(buildTree(allSites.value), id)
      .map((site) => site.id)
      .filter((siteId): siteId is string => Boolean(siteId))
  }
  const handleMoreAction = (item: ButtonMoreItem, row: SmisSite): void => {
    if (item.key === 'addChild') openDialog(undefined, row)
    if (item.key === 'delete') void handleDelete(row)
  }
  const moreActions: ButtonMoreItem[] = [
    { auth: 'SmisSite:Add', key: 'addChild', label: '新增下级', icon: 'ri:add-line' },
    {
      auth: 'SmisSite:Delete',
      key: 'delete',
      label: '删除',
      icon: 'ri:delete-bin-line',
      color: 'var(--el-color-danger)'
    }
  ]
  const columnsFactory = (): ColumnOption<SmisSite>[] => [
    { type: 'selection', width: 48 },
    {
      prop: 'siteName',
      label: '场所层级',
      minWidth: 260,
      fixed: 'left',
      formatter: (row) => (
        <div class="site-page__identity">
          <span aria-hidden="true">
            <ArtSvgIcon icon={row.children?.length ? 'ri:folder-3-line' : 'ri:map-pin-line'} />
          </span>
          <span>
            <strong>{row.siteName}</strong>
            <small>{row.parentSiteName || '一级场所'}</small>
          </span>
        </div>
      )
    },
    {
      prop: 'organization',
      label: '部门名称',
      minWidth: 180,
      formatter: (row) => (
        <div class="site-page__stack">
          <strong>{row.organization.organizationName}</strong>
          <small>{row.organization.parentOrganizationName || '顶级组织'}</small>
        </div>
      )
    },
    {
      prop: 'categoryCode',
      label: '属性类别',
      width: 108,
      formatter: (row) => (
        <ArtDictDisplay dictCode="smisSiteCategory" value={row.categoryCode} display="tag" />
      )
    },
    { prop: 'sort', label: '顺序号', width: 82, align: 'center' },
    {
      prop: 'responsible',
      label: '责任人 / 职务',
      minWidth: 170,
      formatter: (row) =>
        row.responsible ? (
          <div class="site-page__stack">
            <strong>{row.responsible.employeeName}</strong>
            <small>{row.responsible.jobTitle || '职务未维护'}</small>
          </div>
        ) : (
          <span class="site-page__muted">待指定</span>
        )
    },
    {
      prop: 'phone',
      label: '手机号',
      width: 128,
      formatter: (row) => row.responsible?.phone || '—'
    },
    {
      prop: 'imageUrls',
      label: '所属图片',
      width: 112,
      formatter: (row) =>
        row.imageUrls?.length ? (
          <ElImage
            class="site-page__thumb"
            src={row.imageUrls[0]}
            previewSrcList={row.imageUrls}
            previewTeleported
            fit="cover"
          />
        ) : (
          <span class="site-page__muted">暂无图片</span>
        )
    },
    {
      prop: 'location',
      label: '地址 / 经纬度',
      minWidth: 240,
      formatter: (row) => (
        <div class="site-page__stack">
          <strong title={row.addressDetail || ''}>{row.addressDetail || '地址未维护'}</strong>
          <small>
            {row.longitude != null && row.latitude != null
              ? `${row.longitude}, ${row.latitude}`
              : '坐标未获取'}
          </small>
        </div>
      )
    },
    {
      prop: 'operation',
      label: '操作',
      width: 120,
      fixed: 'right',
      formatter: (row) => (
        <div class="site-page__actions">
          <ArtButtonTable type="edit" permission="SmisSite:Edit" onClick={() => openDialog(row)} />
          <ArtButtonMore
            list={moreActions}
            onClick={(item: ButtonMoreItem) => handleMoreAction(item, row)}
          />
        </div>
      )
    }
  ]

  const importRows = async (rows: unknown[]): Promise<void> => {
    for (const raw of rows as SiteImportRow[]) {
      const organization = flatOrganizations.value.find(
        (item) => item.organizationCode === String(raw.organizationCode).trim()
      )
      if (!organization?.id) throw new Error(`未找到部门编码：${raw.organizationCode}`)
      const category = categoryOptions.value.find(
        (item) => item.value === raw.categoryCode || item.label === raw.categoryCode
      )
      if (!category) throw new Error(`无法识别属性类别：${raw.categoryCode}`)
      let employeeId: string | null = null
      if (raw.responsibleEmployeeNo) {
        const employees = await fetchSiteEmployeeOptions({
          keyword: String(raw.responsibleEmployeeNo),
          from: 0,
          to: 99
        })
        employeeId =
          employees.data.find(
            (item) => item.employeeNo === String(raw.responsibleEmployeeNo).trim()
          )?.id || null
        if (!employeeId) throw new Error(`未找到责任人员工号：${raw.responsibleEmployeeNo}`)
      }
      const currentSites = (await fetchSiteList()).data ?? []
      const parent = raw.parentSiteName
        ? currentSites.find(
            (item) =>
              item.siteName === String(raw.parentSiteName).trim() &&
              item.organizationId === organization.id
          )
        : undefined
      if (raw.parentSiteName && !parent?.id)
        throw new Error(`未找到上级场所：${raw.parentSiteName}`)
      await saveSite({
        organizationId: organization.id,
        parentId: parent?.id || null,
        siteName: String(raw.siteName).trim(),
        categoryCode: category.value,
        sort: Number(raw.sort || 0),
        responsibleEmployeeId: employeeId,
        addressDetail: raw.addressDetail || '',
        longitude: raw.longitude ?? null,
        latitude: raw.latitude ?? null,
        coordinateSystem: 'gcj02',
        imageUrls: String(raw.imageUrls || '')
          .split(/[,，]/)
          .map((item) => item.trim())
          .filter(Boolean),
        remark: raw.remark || ''
      })
    }
  }
  const headerActions = computed<ArtTableQueryHeaderAction[]>(() => [
    { permission: 'SmisSite:Add', type: 'add', label: '新增场所', onClick: () => openDialog() },
    {
      permission: 'SmisSite:Import',
      type: 'import',
      importColumns: excelColumns,
      importApi: importRows,
      onImportError: () => {
        ElMessage.error('导入失败，请检查部门编码、层级、责任人员工号和坐标格式')
      }
    },
    {
      permission: 'SmisSite:Export',
      type: 'export',
      exportFilename: '场所维护',
      exportSheetName: '场所维护',
      exportColumns: excelColumns,
      exportApi: async () => ({
        data: filterRows((await fetchSiteList()).data ?? [], searchQuery.value).map((row) => ({
          organizationCode: row.organization.organizationCode,
          parentSiteName: row.parentSiteName || '',
          siteName: row.siteName,
          categoryCode: resolveCategory(row.categoryCode),
          sort: row.sort,
          responsibleEmployeeNo: row.responsible?.employeeNo || '',
          addressDetail: row.addressDetail || '',
          longitude: row.longitude ?? '',
          latitude: row.latitude ?? '',
          imageUrls: row.imageUrls.join(','),
          remark: row.remark || ''
        }))
      })
    },
    {
      permission: 'SmisSite:Delete',
      type: 'delete',
      content: ({ selectedCount }: ArtTableQueryHeaderActionContext) =>
        `确定删除选中的 ${selectedCount} 个场所吗？存在下级场所时系统会阻止删除。`,
      onClick: async ({ selectedRows, api }) => {
        const ids = selectedRows
          .map((row) => row.id)
          .filter((id): id is string => typeof id === 'string')
        await deleteSites(ids)
        await api.refreshRemove()
      }
    }
  ])
  const loadOrganizations = async (): Promise<void> => {
    organizationState.loading = true
    organizationState.error = null
    try {
      organizationState.tree =
        (
          await fetchGetOrganizationTree({
            status: '1',
            tenantId: effectiveTenantId.value ?? undefined
          })
        ).data ?? []
      if (
        organizationState.selectedKey !== ALL_ORGANIZATIONS_KEY &&
        !organizationTreeUtils.findNode(organizationState.tree, organizationState.selectedKey)
      ) {
        organizationState.selectedKey = ALL_ORGANIZATIONS_KEY
      }
    } catch (error) {
      organizationState.error = getFriendlySupabaseErrorMessage(
        error,
        '部门结构加载失败，请稍后重试'
      )
    } finally {
      organizationState.loading = false
    }
  }
  const handleOrganizationSelect = async (key: string): Promise<void> => {
    if (organizationState.selectedKey === key) return
    organizationState.selectedKey = key
    await tableQueryRef.value?.getData()
  }
  const handleOrganizationRefresh = async (): Promise<void> => {
    await loadOrganizations()
    await tableQueryRef.value?.getData()
  }
  const handleSaveSuccess = (type: 'add' | 'edit'): void => {
    void (type === 'add'
      ? tableQueryRef.value?.refreshCreate()
      : tableQueryRef.value?.refreshUpdate())
  }
  const handleDelete = async (row: SmisSite): Promise<void> => {
    if (!row.id) return
    try {
      await confirmAction(
        `确定删除场所“${row.siteName}”吗？存在下级场所时系统会阻止删除。`,
        '删除场所',
        {
          type: 'warning',
          confirmButtonText: '确认删除',
          cancelButtonText: '取消',
          confirmButtonClass: 'el-button--danger'
        }
      )
      await deleteSites([row.id])
      await tableQueryRef.value?.refreshRemove()
    } catch {
      /* 用户取消或存在引用 */
    }
  }
  onMounted(async () => {
    await Promise.all([userStore.ensureDictLoaded('smisSiteCategory'), loadOrganizations()])
  })
</script>

<style scoped lang="scss">
  .site-page {
    gap: 12px;
    min-width: 0;

    &__overview {
      flex: 0 0 auto;
      min-width: 0;
      overflow: hidden;
    }

    &__workspace {
      flex: 1 1 auto;
      width: 100%;
      min-width: 0;
      min-height: 0;
    }

    &__department-panel,
    &__main,
    &__table {
      min-width: 0;
      min-height: 0;
    }

    &__department-panel {
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

    &__scope-bar {
      display: flex;
      flex: 0 0 auto;
      gap: 16px;
      align-items: center;
      justify-content: space-between;
      min-height: 56px;
      padding: 8px 14px 8px 12px;
      background: var(--art-gray-100);
      border-left: 3px solid var(--theme-color);
      border-radius: var(--el-border-radius-base);

      > p {
        display: inline-flex;
        gap: 6px;
        align-items: center;
        margin: 0;
        font-size: 12px;
        color: var(--el-text-color-secondary);

        :deep(svg) {
          color: var(--theme-color);
        }
      }
    }

    &__scope-identity {
      display: flex;
      gap: 10px;
      align-items: center;
      min-width: 0;

      > span:first-child {
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

      > span:last-child {
        display: grid;
        min-width: 0;
      }

      small {
        font-size: 11px;
        color: var(--el-text-color-secondary);
      }

      strong {
        margin-top: 2px;
        overflow: hidden;
        text-overflow: ellipsis;
        color: var(--el-text-color-primary);
        white-space: nowrap;
      }
    }

    :deep(.site-tree-row.is-root > td) {
      background: color-mix(in srgb, var(--theme-color) 3%, var(--el-bg-color));
    }

    :deep(.site-tree-row.is-root > td:first-child) {
      box-shadow: inset 3px 0 0 var(--theme-color);
    }

    :deep(.site-tree-row .el-table__expand-icon) {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      margin-right: 6px;
      color: var(--theme-color);
      background: color-mix(in srgb, var(--theme-color) 8%, var(--el-bg-color));
      border-radius: var(--el-border-radius-small);
    }

    :deep(.site-page__identity) {
      display: grid;
      grid-template-columns: 34px minmax(0, 1fr);
      gap: 10px;
      align-items: center;
      min-width: 0;
    }

    :deep(.site-page__identity > span:first-child) {
      display: grid;
      place-items: center;
      width: 34px;
      height: 34px;
      color: var(--theme-color);
      background: color-mix(in srgb, var(--theme-color) 8%, var(--el-bg-color));
      border-radius: var(--el-border-radius-base);
    }

    :deep(.site-page__identity > span:last-child),
    :deep(.site-page__stack) {
      display: grid;
      align-content: center;
      min-width: 0;
    }

    :deep(.site-page__identity strong),
    :deep(.site-page__identity small),
    :deep(.site-page__stack strong),
    :deep(.site-page__stack small) {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    :deep(.site-page__identity strong),
    :deep(.site-page__stack strong) {
      line-height: 20px;
    }

    :deep(.site-page__identity small),
    :deep(.site-page__stack small) {
      margin-top: 2px;
      font-size: 11px;
      line-height: 16px;
      color: var(--el-text-color-secondary);
    }

    :deep(.site-page__muted) {
      font-size: 12px;
      color: var(--el-text-color-placeholder);
    }

    :deep(.site-page__thumb) {
      width: 52px;
      height: 38px;
      border-radius: var(--el-border-radius-small);
    }

    :deep(.site-page__actions) {
      display: flex;
      gap: 4px;
      align-items: center;
      justify-content: center;
      min-width: 0;
      white-space: nowrap;
    }

    :deep(.site-page__actions .art-button-table) {
      flex: 0 0 32px;
      margin-right: 0;
    }

    @media (width <= 1080px) {
      &__scope-bar > p {
        display: none;
      }
    }

    @media (width <= 820px) {
      &__main {
        flex: 0 0 760px;
      }
    }
  }
</style>
