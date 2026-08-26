<template>
  <div class="site-page business-workspace-page art-full-height">
    <BusinessWorkspaceHeader
      eyebrow="SITE MASTER DATA"
      title="场所维护"
      description="以树形层级维护部门场所、责任人员、现场图片与地图坐标，为安全业务提供统一位置底座。"
      icon="ri:map-pin-2-line"
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

    <ArtTableQuery
      ref="tableQueryRef"
      v-model="searchQuery"
      :api-params="{ current: 1, size: 1000 }"
      :api-fn="fetchTableData"
      :search-items="searchItems"
      :columns-factory="columnsFactory"
      :header-actions="headerActions"
      header-actions-placement="workspace"
      :search-bar-props="{ span: 8, labelWidth: 86, showExpand: false }"
      :table-props="tableProps"
      focusable
    />

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
  import { fetchGetOrganizationTree } from '@/api/system-manage'
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
  import {
    deleteSites,
    fetchSiteEmployeeOptions,
    fetchSiteList,
    saveSite,
    type SmisSite,
    type SmisSiteSearchParams
  } from '@smis/api'
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

  const { confirmAction } = useArtFeedback()
  const userStore = useUserStore()
  const { getDictMap } = storeToRefs(userStore)
  const tableQueryRef = ref<ArtTableQueryExpose>()
  const dialogRef = ref<DialogExpose>()
  const organizationTree = shallowRef<Organization[]>([])
  const allSites = shallowRef<SmisSite[]>([])
  const displaySites = shallowRef<SmisSite[]>([])
  const expandRowKeys = ref<string[]>([])
  const searchQuery = ref<SmisSiteSearchParams>({
    keyword: '',
    organizationId: undefined,
    categoryCode: undefined
  })

  const flattenOrganizations = (nodes: Organization[]): Organization[] =>
    nodes.flatMap((node) => [node, ...flattenOrganizations(node.children ?? [])])
  const flatOrganizations = computed(() => flattenOrganizations(organizationTree.value))
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
      props: { clearable: true, placeholder: '场所名称、部门、责任人或手机号' }
    },
    {
      label: '所属部门',
      key: 'organizationId',
      type: 'treeSelect',
      props: {
        data: organizationTree.value,
        props: { children: 'children', label: 'organizationName', value: 'id' },
        nodeKey: 'id',
        valueKey: 'id',
        checkStrictly: true,
        filterable: true,
        clearable: true,
        defaultExpandAll: true,
        placeholder: '全部部门'
      }
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
    const map = new Map(rows.map((row) => [row.id, { ...row, children: [] as SmisSite[] }]))
    const roots: SmisSite[] = []
    map.forEach((row) => {
      const parent = row.parentId ? map.get(row.parentId) : undefined
      if (parent) parent.children?.push(row)
      else roots.push(row)
    })
    const sortTree = (nodes: SmisSite[]): void => {
      nodes.sort((a, b) => a.sort - b.sort || a.siteName.localeCompare(b.siteName, 'zh-CN'))
      nodes.forEach((node) => sortTree(node.children ?? []))
    }
    sortTree(roots)
    return roots
  }
  const filterRows = (rows: SmisSite[], params: SmisSiteSearchParams): SmisSite[] => {
    const keyword = params.keyword?.trim().toLocaleLowerCase('zh-CN')
    const map = new Map(rows.map((row) => [row.id, row]))
    const included = new Set<string>()
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
        (!params.organizationId || row.organizationId === params.organizationId) &&
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
    if (!expandRowKeys.value.length)
      expandRowKeys.value = filtered.map((row) => row.id).filter((id): id is string => Boolean(id))
    return { data: displaySites.value, total: filtered.length, error: response.error }
  }
  const tableProps = computed<ArtTableQueryTableProps>(() => ({
    rowKey: 'id',
    treeProps: { children: 'children' },
    expandRowKeys: expandRowKeys.value,
    indent: 20,
    tableLayout: 'fixed',
    emptyText: '暂无场所数据',
    emptyDescription: '可新增一级场所，再逐级维护下级区域与位置。',
    paginationOptions: { hideOnSinglePage: true },
    rowClassName: ({ row }) => (row.parentId ? 'site-tree-row is-child' : 'site-tree-row is-root')
  }))

  const openDialog = (row?: SmisSite, parent?: SmisSite): void => {
    const excluded = row?.id ? new Set(collectDescendantIds(row.id)) : new Set<string>()
    if (row?.id) excluded.add(row.id)
    void dialogRef.value?.handleOpen({
      organizations: organizationTree.value,
      sites: buildTree(allSites.value.filter((item) => !item.id || !excluded.has(item.id))),
      row,
      parent
    })
  }
  const collectDescendantIds = (id: string): string[] => {
    const result: string[] = []
    const visit = (parentId: string): void => {
      allSites.value
        .filter((row) => row.parentId === parentId && row.id)
        .forEach((row) => {
          result.push(row.id!)
          visit(row.id!)
        })
    }
    visit(id)
    return result
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
    {
      key: 'expand',
      label: '全部展开',
      icon: 'ri:folder-open-line',
      selectionRequired: false,
      onClick: () => {
        expandRowKeys.value = allSites.value
          .map((row) => row.id)
          .filter((id): id is string => Boolean(id))
      }
    },
    {
      key: 'collapse',
      label: '全部折叠',
      icon: 'ri:folder-reduce-line',
      selectionRequired: false,
      onClick: () => {
        expandRowKeys.value = []
      }
    },
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
    organizationTree.value = (await fetchGetOrganizationTree({ status: '1' })).data ?? []
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

    &__identity {
      display: grid;
      grid-template-columns: 34px minmax(0, 1fr);
      gap: 10px;
      align-items: center;
      min-width: 0;
    }

    &__identity > span:first-child {
      display: grid;
      place-items: center;
      width: 34px;
      height: 34px;
      color: var(--theme-color);
      background: color-mix(in srgb, var(--theme-color) 8%, var(--el-bg-color));
      border-radius: var(--el-border-radius-base);
    }

    &__identity > span:last-child,
    &__stack {
      display: grid;
      min-width: 0;
    }

    &__identity strong,
    &__identity small,
    &__stack strong,
    &__stack small {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__identity small,
    &__stack small {
      margin-top: 2px;
      font-size: 11px;
      color: var(--el-text-color-secondary);
    }

    &__muted {
      font-size: 12px;
      color: var(--el-text-color-placeholder);
    }

    &__thumb {
      width: 52px;
      height: 38px;
      border-radius: var(--el-border-radius-small);
    }

    &__actions {
      display: flex;
      align-items: center;
    }
  }
</style>
