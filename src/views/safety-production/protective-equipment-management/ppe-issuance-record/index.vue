<template>
  <ArtPermissionGuard permission="SmisPpeIssuanceRecord:View">
    <div class="ppe-issuance-page business-workspace-page art-full-height">
      <BusinessWorkspaceHeader
        eyebrow="PROTECTIVE EQUIPMENT FULFILLMENT"
        title="防护用品发放记录"
        description="统一维护领用人、发放仓库、发放人和物料数量；草稿核对完成后发放过账并形成可打印劳保单。"
        icon="ri:archive-drawer-line"
        :tags="[
          { label: '4 位月度流水', type: 'primary', effect: 'plain' },
          { label: '同一领用人批量过账', type: 'success', effect: 'light' },
          { label: '发放快照可追溯', type: 'info', effect: 'plain' }
        ]"
        :metrics="metrics"
      >
        <template #actions>
          <BusinessTableWorkspaceActions :table="tableQueryRef" />
        </template>
      </BusinessWorkspaceHeader>

      <ArtTableQuery
        ref="tableQueryRef"
        v-model="searchQuery"
        :api-fn="fetchTableData"
        :search-items="searchItems"
        :columns-factory="columnsFactory"
        :header-actions="headerActions"
        header-actions-placement="workspace"
        :search-bar-props="{ span: 8, labelWidth: 76 }"
        :table-props="{
          rowKey: 'id',
          tableLayout: 'fixed',
          emptyText: '暂无防护用品发放记录',
          emptyDescription: '可新增草稿，或从个人领用页面选择同一领用人的明细下推发放。'
        }"
        focusable
      />

      <IssuanceRecordDialog ref="recordDialogRef" @success="refreshData" />
      <IssuanceStatisticsDialog ref="statisticsDialogRef" />
    </div>
  </ArtPermissionGuard>
</template>

<script setup lang="tsx">
  import dayjs from 'dayjs'
  import { escape } from 'lodash-es'
  import { fetchEmployeeSelectorList } from '@/api/integration/employees'
  import BusinessTableWorkspaceActions from '@/components/business/business-table-workspace-actions/index.vue'
  import BusinessWorkspaceHeader from '@/components/business/business-workspace-header/index.vue'
  import type { BusinessWorkspaceMetric } from '@/components/business/business-workspace-header/index.vue'
  import ArtButtonMore from '@/components/core/forms/art-button-more/index.vue'
  import type { ButtonMoreItem } from '@/components/core/forms/art-button-more/index.vue'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import ArtDictDisplay from '@/components/core/base/art-dict-display/index.vue'
  import ArtPermissionGuard from '@/components/core/feedback/art-permission-guard/index.vue'
  import { useArtFeedback } from '@/hooks/core/useArtFeedback'
  import { useUserStore } from '@/store/modules/user'
  import type { SearchFormItem } from '@/components/core/forms/art-search-bar/index.vue'
  import type {
    ArtTableQueryExpose,
    ArtTableQueryHeaderAction,
    ArtTableQueryHeaderActionContext,
    ArtTableQueryExcelColumn
  } from '@/components/core/tables/art-table-query/index.vue'
  import type { ColumnOption } from '@/types/component'
  import { exportExcel } from '@/utils/file'
  import {
    deletePpeIssuanceRecords,
    fetchMaterialList,
    fetchPpeIssuanceRecordList,
    fetchPpeScopeOptions,
    fetchStorageLocationList,
    postPpeIssuanceRecord,
    savePpeIssuanceRecord,
    type SmisMaterial,
    type SmisPpeIssuanceRecord,
    type SmisPpeIssuanceRecordOverview,
    type SmisPpeIssuanceRecordSearchParams,
    type SmisPpeScopeOption,
    type SmisStorageLocation
  } from '@smis/api'
  import IssuanceRecordDialog from './modules/issuance-record-dialog.vue'
  import IssuanceStatisticsDialog from './modules/issuance-statistics-dialog.vue'

  defineOptions({ name: 'SmisPpeIssuanceRecord' })

  type TableParams = SmisPpeIssuanceRecordSearchParams & {
    current?: number
    size?: number
    page?: number
    pageSize?: number
  }

  interface RecordDialogExpose {
    handleOpen: (data: {
      mode: 'add' | 'edit' | 'copy'
      row?: SmisPpeIssuanceRecord
    }) => Promise<void>
  }

  interface StatisticsDialogExpose {
    handleOpen: () => Promise<void>
  }

  interface ImportRow {
    employeeNo?: unknown
    warehouseCode?: unknown
    issuerEmployeeNo?: unknown
    materialCode?: unknown
    issueQuantity?: unknown
    issueDate?: unknown
    remark?: unknown
  }

  const tableQueryRef = ref<ArtTableQueryExpose>()
  const userStore = useUserStore()
  const { confirmAction } = useArtFeedback()
  const recordDialogRef = ref<RecordDialogExpose>()
  const statisticsDialogRef = ref<StatisticsDialogExpose>()
  const searchQuery = reactive<SmisPpeIssuanceRecordSearchParams>({})
  const organizationOptions = ref<SmisPpeScopeOption[]>([])
  const overview = reactive<SmisPpeIssuanceRecordOverview>({
    total: 0,
    draft: 0,
    posted: 0,
    today: 0,
    quantity: 0
  })

  const statusOptions = [
    { label: '草稿', value: 'draft' },
    { label: '已过账', value: 'posted' },
    { label: '已作废', value: 'voided' }
  ]
  const metrics = computed<BusinessWorkspaceMetric[]>(() => [
    {
      label: '发放单据',
      value: overview.total,
      description: '当前查询范围',
      icon: 'ri:file-list-3-line'
    },
    {
      label: '待过账草稿',
      value: overview.draft,
      description: '需核对后发放',
      icon: 'ri:draft-line',
      tone: 'warning'
    },
    {
      label: '今日发放',
      value: overview.today,
      description: '已登记单据',
      icon: 'ri:calendar-check-line',
      tone: 'success'
    },
    {
      label: '用品总量',
      value: overview.quantity,
      description: '按发放明细合计',
      icon: 'ri:archive-stack-line'
    }
  ])
  const searchItems = computed<SearchFormItem[]>(() => [
    {
      label: '领用时间',
      key: 'dateRange',
      type: 'daterange',
      props: { valueFormat: 'YYYY-MM-DD', startPlaceholder: '开始日期', endPlaceholder: '结束日期' }
    },
    {
      label: '组织名称',
      key: 'organizationId',
      type: 'treeSelect',
      props: {
        data: organizationOptions.value,
        clearable: true,
        checkStrictly: true,
        nodeKey: 'id',
        props: { label: 'name', value: 'id', children: 'children' },
        placeholder: '全部公司或部门'
      }
    },
    {
      label: '单据 / 人员',
      key: 'keyword',
      type: 'input',
      props: { clearable: true, placeholder: '单据号、领用人或仓库' }
    },
    {
      label: '单据状态',
      key: 'status',
      type: 'select',
      options: statusOptions,
      props: { clearable: true, placeholder: '全部状态' }
    }
  ])

  const excelColumns: ArtTableQueryExcelColumn[] = [
    { key: 'employeeNo', title: '领用人工号', required: true },
    { key: 'warehouseCode', title: '发放仓库编码', required: true },
    { key: 'issuerEmployeeNo', title: '发放人工号', required: true },
    { key: 'materialCode', title: '防护用品编码', required: true },
    { key: 'issueQuantity', title: '发放数量', required: true },
    { key: 'issueDate', title: '发放日期', required: true },
    { key: 'remark', title: '备注' }
  ]

  const refreshData = async (): Promise<void> => {
    await tableQueryRef.value?.getData()
  }
  const unitLabel = (value: string): string =>
    userStore.getDictMap.smisMaterialUnit?.find((item) => item.value === value)?.label || value

  const openDialog = (mode: 'add' | 'edit' | 'copy', row?: SmisPpeIssuanceRecord): void => {
    void recordDialogRef.value?.handleOpen({ mode, row })
  }

  const resolveExactEmployee = async (employeeNo: string) => {
    const result = await fetchEmployeeSelectorList({ keyword: employeeNo, from: 0, to: 19 })
    const employee = result.data.find((item) => item.employeeNo === employeeNo)
    if (!employee) throw new Error(`未找到员工工号：${employeeNo}`)
    return employee
  }

  const resolveExactWarehouse = async (locationCode: string): Promise<SmisStorageLocation> => {
    const result = await fetchStorageLocationList({
      keyword: locationCode,
      status: 'enabled',
      from: 0,
      to: 99
    })
    const warehouse = result.data.find((item) => item.locationCode === locationCode)
    if (!warehouse?.id) throw new Error(`未找到启用仓库编码：${locationCode}`)
    return warehouse
  }

  const resolveExactMaterial = async (materialCode: string): Promise<SmisMaterial> => {
    const result = await fetchMaterialList({
      materialCode,
      materialType: 'protective_equipment',
      status: 'enabled',
      from: 0,
      to: 99
    })
    const material = result.data.find((item) => item.materialCode === materialCode)
    if (!material?.id) throw new Error(`未找到防护用品编码：${materialCode}`)
    return material
  }

  const importRows = async (rows: unknown[]): Promise<void> => {
    for (const raw of rows as ImportRow[]) {
      const employeeNo = String(raw.employeeNo || '').trim()
      const warehouseCode = String(raw.warehouseCode || '').trim()
      const issuerEmployeeNo = String(raw.issuerEmployeeNo || '').trim()
      const materialCode = String(raw.materialCode || '').trim()
      const quantity = Number(raw.issueQuantity)
      if (!employeeNo || !warehouseCode || !issuerEmployeeNo || !materialCode || !(quantity > 0)) {
        throw new Error('导入行缺少必填字段或发放数量无效')
      }
      const [employee, warehouse, issuer, material] = await Promise.all([
        resolveExactEmployee(employeeNo),
        resolveExactWarehouse(warehouseCode),
        resolveExactEmployee(issuerEmployeeNo),
        resolveExactMaterial(materialCode)
      ])
      const rawIssueDate = String(raw.issueDate ?? '')
      await savePpeIssuanceRecord({
        employeeId: employee.id,
        warehouseId: String(warehouse.id),
        issuerEmployeeId: issuer.id,
        issueDate: dayjs(rawIssueDate).isValid()
          ? dayjs(rawIssueDate).format('YYYY-MM-DD')
          : dayjs().format('YYYY-MM-DD'),
        remark: String(raw.remark || ''),
        items: [{ materialId: String(material.id), issueQuantity: quantity }]
      })
    }
    await refreshData()
  }

  const downloadTemplate = async (): Promise<void> => {
    await exportExcel({
      filename: '防护用品发放记录导入模板',
      sheetName: '发放记录',
      columns: excelColumns,
      data: [
        {
          employeeNo: '请填写员工花名册工号',
          warehouseCode: '请填写启用仓库编码',
          issuerEmployeeNo: '请填写发放人员工号',
          materialCode: '请填写防护用品物料编码',
          issueQuantity: 1,
          issueDate: dayjs().format('YYYY-MM-DD'),
          remark: '可选'
        }
      ]
    })
  }

  const printRecord = (row: SmisPpeIssuanceRecord): void => {
    const popup = window.open('', '_blank', 'noopener,noreferrer,width=980,height=760')
    if (!popup) {
      ElMessage.warning('浏览器阻止了打印窗口，请允许本站打开弹窗后重试')
      return
    }
    const itemRows = row.items
      .map(
        (item, index) =>
          `<tr><td>${index + 1}</td><td>${escape(item.materialName)}</td><td>${escape(item.specificationModel || '—')}</td><td>${item.issueQuantity}</td><td>${escape(unitLabel(item.unit))}</td><td>${escape(item.remark || '')}</td></tr>`
      )
      .join('')
    popup.document.write(
      `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>${escape(row.issuanceNo)}</title><style>body{font:14px/1.5 sans-serif;color:#1f2937;padding:32px}h1{text-align:center;font-size:22px}.meta{display:grid;grid-template-columns:repeat(3,1fr);gap:8px 24px;margin:24px 0}table{width:100%;border-collapse:collapse}th,td{padding:9px;border:1px solid #9ca3af;text-align:left}.sign{display:flex;justify-content:space-between;margin-top:48px}@media print{body{padding:0}}</style></head><body><h1>防护用品发放单</h1><div class="meta"><span>单据编号：${escape(row.issuanceNo)}</span><span>领用人：${escape(row.employeeName)}</span><span>员工工号：${escape(row.employeeNo)}</span><span>所属组织：${escape(row.organizationName || '—')}</span><span>发放仓库：${escape(row.warehouseName)}</span><span>发放日期：${escape(row.issueDate)}</span></div><table><thead><tr><th>序号</th><th>防护用品</th><th>规格型号</th><th>发放数量</th><th>单位</th><th>备注</th></tr></thead><tbody>${itemRows}</tbody></table><div class="sign"><span>领用人签字：____________</span><span>发放人：${escape(row.issuerName)}</span><span>日期：____________</span></div><script>window.onload=()=>window.print()<${'/script'}></body></html>`
    )
    popup.document.close()
  }

  const headerActions = computed<ArtTableQueryHeaderAction[]>(() => [
    {
      permission: 'SmisPpeIssuanceRecord:Add',
      type: 'add',
      label: '新增',
      onClick: () => openDialog('add')
    },
    {
      permission: 'SmisPpeIssuanceRecord:Copy',
      key: 'copy',
      label: '复制并新增',
      icon: 'ri:file-copy-line',
      selectionRequired: true,
      disabled: ({ selectedCount }) => selectedCount !== 1,
      onClick: ({ selectedRows }) => openDialog('copy', selectedRows[0] as SmisPpeIssuanceRecord)
    },
    {
      permission: 'SmisPpeIssuanceRecord:Edit',
      key: 'edit',
      label: '编辑',
      icon: 'ri:edit-line',
      selectionRequired: true,
      disabled: ({ selectedRows }) =>
        selectedRows.length !== 1 || (selectedRows[0] as SmisPpeIssuanceRecord).status !== 'draft',
      onClick: ({ selectedRows }) => openDialog('edit', selectedRows[0] as SmisPpeIssuanceRecord)
    },
    {
      permission: 'SmisPpeIssuanceRecord:Delete',
      type: 'delete',
      disabled: ({ selectedRows }) =>
        selectedRows.some((row) => (row as SmisPpeIssuanceRecord).status !== 'draft'),
      content: ({ selectedCount }: ArtTableQueryHeaderActionContext) =>
        `确定删除选中的 ${selectedCount} 条草稿吗？删除后无法恢复。`,
      onClick: async ({ selectedRows, api }) => {
        await deletePpeIssuanceRecords(selectedRows.map((row) => String(row.id)))
        await api.refreshRemove()
      }
    },
    {
      permission: 'SmisPpeIssuanceRecord:Issue',
      key: 'issue',
      label: '发放',
      icon: 'ri:send-plane-line',
      selectionRequired: true,
      disabled: ({ selectedRows }) =>
        selectedRows.length !== 1 || (selectedRows[0] as SmisPpeIssuanceRecord).status !== 'draft',
      confirm: true,
      content: '确认仓库、发放人和数量无误后执行发放过账？',
      onClick: async ({ selectedRows, api }) => {
        await postPpeIssuanceRecord(String(selectedRows[0].id))
        await api.refreshUpdate()
      }
    },
    {
      permission: 'SmisPpeIssuanceRecord:Import',
      type: 'import',
      label: '导入',
      importColumns: excelColumns,
      importApi: importRows,
      onImportError: (error) => {
        ElMessage.error(error.message || '导入失败，请检查模板内容')
      }
    },
    {
      permission: 'SmisPpeIssuanceRecord:DownloadTemplate',
      key: 'template',
      label: '下载导入模板',
      icon: 'ri:download-2-line',
      onClick: downloadTemplate
    },
    {
      permission: 'SmisPpeIssuanceRecord:Export',
      type: 'export',
      label: '导出',
      exportFilename: '防护用品发放记录',
      exportSheetName: '发放记录',
      exportColumns: [
        { key: 'issuanceNo', title: '单据编号' },
        { key: 'employeeNo', title: '领用人工号' },
        { key: 'employeeName', title: '领用人' },
        { key: 'organizationName', title: '所属组织' },
        { key: 'warehouseName', title: '发放仓库' },
        { key: 'issuerName', title: '发放人' },
        { key: 'issueDate', title: '发放日期' },
        { key: 'status', title: '状态' },
        { key: 'itemsText', title: '发放明细' },
        { key: 'remark', title: '备注' }
      ],
      exportApi: async ({ maxRows }) => ({
        data: (
          await fetchPpeIssuanceRecordList({
            ...searchQuery,
            purpose: 'export',
            from: 0,
            to: maxRows - 1
          })
        ).data.map((row) => ({
          ...row,
          itemsText: row.items
            .map((item) => `${item.materialName} ${item.issueQuantity}${unitLabel(item.unit)}`)
            .join('；')
        }))
      })
    },
    {
      permission: 'SmisPpeIssuanceRecord:Statistics',
      key: 'statistics',
      label: '统计分析',
      icon: 'ri:bar-chart-box-line',
      onClick: () => statisticsDialogRef.value?.handleOpen()
    },
    {
      permission: 'SmisPpeIssuanceRecord:Print',
      key: 'print',
      label: '打印劳保单',
      icon: 'ri:printer-line',
      selectionRequired: true,
      disabled: ({ selectedRows }) => selectedRows.length !== 1,
      onClick: ({ selectedRows }) => printRecord(selectedRows[0] as SmisPpeIssuanceRecord)
    }
  ])

  const columnsFactory = (): ColumnOption<SmisPpeIssuanceRecord>[] => [
    { type: 'selection', width: 48 },
    {
      prop: 'issuanceNo',
      label: '单据编号',
      width: 150,
      fixed: 'left',
      formatter: (row) => <strong class="document-no">{row.issuanceNo}</strong>
    },
    { prop: 'employeeName', label: '领用人', width: 120, showOverflowTooltip: true },
    { prop: 'employeeNo', label: '员工工号', width: 130, showOverflowTooltip: true },
    { prop: 'positionName', label: '领用人岗位', minWidth: 150, showOverflowTooltip: true },
    { prop: 'organizationName', label: '所属组织', minWidth: 180, showOverflowTooltip: true },
    { prop: 'warehouseName', label: '发放仓库', minWidth: 160, showOverflowTooltip: true },
    { prop: 'issuerName', label: '发放人', width: 120, showOverflowTooltip: true },
    { prop: 'issueDate', label: '发放日期', width: 116, align: 'center' },
    {
      prop: 'items',
      label: '发放明细',
      minWidth: 230,
      showOverflowTooltip: true,
      formatter: (row) =>
        row.items
          .map((item) => `${item.materialName} × ${item.issueQuantity}${unitLabel(item.unit)}`)
          .join('；')
    },
    {
      prop: 'status',
      label: '状态',
      width: 108,
      align: 'center',
      formatter: (row) => (
        <ArtDictDisplay dictCode="smisPpeIssuanceStatus" value={row.status} display="tag" />
      )
    },
    { prop: 'remark', label: '备注', minWidth: 150, showOverflowTooltip: true },
    {
      prop: 'operation',
      label: '操作',
      width: 210,
      fixed: 'right',
      formatter: (row) => (
        <div class="row-actions">
          <ArtButtonTable
            permission="SmisPpeIssuanceRecord:Issue"
            icon="ri:send-plane-line"
            label="发放过账"
            disabled={row.status !== 'draft'}
            onClick={async () => {
              await confirmAction('确认执行发放过账？', {
                title: '发放确认',
                confirmButtonText: '确认发放'
              })
              await postPpeIssuanceRecord(row.id)
              await refreshData()
            }}
          />
          <ArtButtonTable
            permission="SmisPpeIssuanceRecord:Edit"
            type="edit"
            disabled={row.status !== 'draft'}
            onClick={() => openDialog('edit', row)}
          />
          <ArtButtonMore
            list={[
              {
                key: 'copy',
                label: '复制并新增',
                icon: 'ri:file-copy-line',
                auth: 'SmisPpeIssuanceRecord:Copy'
              },
              {
                key: 'print',
                label: '打印劳保单',
                icon: 'ri:printer-line',
                auth: 'SmisPpeIssuanceRecord:Print'
              }
            ]}
            onClick={(item: ButtonMoreItem) => {
              if (item.key === 'copy') openDialog('copy', row)
              if (item.key === 'print') printRecord(row)
            }}
          />
        </div>
      )
    }
  ]

  const normalizePaginationParams = (params: TableParams): SmisPpeIssuanceRecordSearchParams => {
    const page = params.current ?? params.page ?? 1
    const size = params.size ?? params.pageSize ?? 20
    return { ...params, from: (page - 1) * size, to: page * size - 1 }
  }

  const fetchTableData = async (params: TableParams) => {
    const result = await fetchPpeIssuanceRecordList(normalizePaginationParams(params))
    Object.assign(overview, result.overview)
    return { records: result.data, total: result.total }
  }

  onMounted(async () => {
    const [organizations] = await Promise.all([
      fetchPpeScopeOptions('organization'),
      userStore.ensureDictLoaded('smisMaterialUnit'),
      userStore.ensureDictLoaded('smisPpeIssuanceStatus')
    ])
    organizationOptions.value = organizations.data
  })
</script>

<style scoped lang="scss">
  .ppe-issuance-page {
    min-width: 0;

    :deep(.document-no) {
      font-variant-numeric: tabular-nums;
      color: var(--theme-color);
    }

    :deep(.row-actions) {
      display: flex;
      gap: 8px;
      align-items: center;
    }
  }
</style>
