<template>
  <div class="smis-catalog-page art-full-height">
    <BusinessWorkspaceHeader
      :eyebrow="workspace.section"
      :title="workspace.title"
      :description="workspace.description"
      :icon="workspace.icon"
      :tags="[
        { label: '租户数据隔离', type: 'primary' },
        { label: '文档 V1.0', type: 'info' }
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
      :search-items="searchItems"
      :api-fn="fetchTableData"
      :columns-factory="columnsFactory"
      :header-actions="headerActions"
      header-actions-placement="workspace"
      :search-bar-props="{ span: 6, labelWidth: 76 }"
      :table-props="{
        rowKey: 'id',
        tableLayout: 'fixed',
        emptyText: `暂无${workspace.recordNoun}`,
        emptyDescription: `可新增第一条${workspace.recordNoun}，或调整筛选条件后重新查询。`
      }"
      :on-success="handleTableSuccess"
      focusable
    />

    <ElDialog
      v-model="dialogVisible"
      :title="`${editingRecord?.id ? '编辑' : '新增'}${workspace.recordNoun}`"
      width="760px"
      destroy-on-close
      align-center
      @closed="resetDialog"
    >
      <ElAlert
        class="smis-catalog-page__dialog-note"
        :title="workspace.description"
        type="info"
        :closable="false"
        show-icon
      />
      <ElForm ref="formRef" :model="formData" :rules="formRules" label-width="108px">
        <ElRow :gutter="16">
          <ElCol
            v-for="field in workspace.fields"
            :key="field.key"
            :xs="24"
            :md="field.type === 'textarea' ? 24 : 12"
          >
            <ElFormItem :label="field.label" :prop="field.key">
              <ElInput
                v-if="field.type === 'text' || field.type === 'textarea'"
                v-model="formData[field.key]"
                :type="field.type === 'textarea' ? 'textarea' : 'text'"
                :rows="field.type === 'textarea' ? 4 : undefined"
                :placeholder="field.placeholder || `请输入${field.label}`"
                clearable
              />
              <ElInputNumber
                v-else-if="field.type === 'number'"
                :model-value="numberFieldValue(field.key)"
                :min="0"
                :precision="0"
                class="!w-full"
                @update:model-value="formData[field.key] = $event ?? undefined"
              />
              <ElDatePicker
                v-else-if="field.type === 'date' || field.type === 'datetime'"
                v-model="formData[field.key]"
                :type="field.type === 'datetime' ? 'datetime' : 'date'"
                :value-format="field.type === 'datetime' ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD'"
                :placeholder="`请选择${field.label}`"
                class="!w-full"
              />
              <ElSelect
                v-else-if="field.type === 'employee'"
                v-model="formData[field.key]"
                filterable
                remote
                clearable
                :remote-method="loadEmployeeOptions"
                :loading="employeeLoading"
                :placeholder="`搜索并选择${field.label}`"
                class="!w-full"
              >
                <ElOption
                  v-for="employee in employeeOptions"
                  :key="employee.value"
                  :label="employee.label"
                  :value="employee.label"
                >
                  <div class="smis-catalog-page__employee-option">
                    <span>{{ employee.label }}</span>
                    <small>{{ employee.description }}</small>
                  </div>
                </ElOption>
              </ElSelect>
              <ElSelect
                v-else
                v-model="formData[field.key]"
                clearable
                :placeholder="`请选择${field.label}`"
                class="!w-full"
              >
                <ElOption
                  v-for="option in field.options ?? []"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </ElSelect>
            </ElFormItem>
          </ElCol>
        </ElRow>
      </ElForm>
      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="saving" @click="handleSave">保存</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="tsx">
  import type { FormInstance, FormRules } from 'element-plus'
  import { ElTag } from 'element-plus'
  import type { SearchFormItem } from '@/components/core/forms/art-search-bar/index.vue'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import type {
    ArtTableQueryExpose,
    ArtTableQueryHeaderAction,
    ArtTableQueryProps
  } from '@/components/core/tables/art-table-query/index.vue'
  import BusinessTableWorkspaceActions from '@/components/business/business-table-workspace-actions/index.vue'
  import BusinessWorkspaceHeader, {
    type BusinessWorkspaceMetric
  } from '@/components/business/business-workspace-header/index.vue'
  import { useArtFeedback } from '@/hooks/core/useArtFeedback'
  import { fetchEmployeeSelectorList } from '@/api/integration/employees'
  import type { ColumnOption } from '@/types'
  import { pageInfoHandler } from '@/utils/table/tableUtils'
  import { formatWithDayjs } from '@/utils/time'
  import {
    deleteSafetyCatalogRecord,
    fetchSafetyCatalogRecords,
    saveSafetyCatalogRecord,
    type SafetyCatalogRecord,
    type SafetyCatalogSearchParams
  } from '@smis/api'
  import {
    getSafetyModuleDefinition,
    type SafetyFieldDefinition
  } from '@smis/domain/safety-module-catalog'

  defineOptions({ name: 'SmisCatalogWorkspace' })

  interface EmployeeOption {
    label: string
    value: string
    description: string
  }

  type TableParams = SafetyCatalogSearchParams &
    Pick<Api.Common.PaginationParams, 'current' | 'size'>

  const route = useRoute()
  const { confirmAction } = useArtFeedback()
  const tableQueryRef = ref<ArtTableQueryExpose>()
  const formRef = ref<FormInstance>()
  const dialogVisible = ref(false)
  const saving = ref(false)
  const editingRecord = ref<SafetyCatalogRecord | null>(null)
  const formData = reactive<Record<string, string | number | undefined>>({})
  const employeeOptions = ref<EmployeeOption[]>([])
  const employeeLoading = ref(false)
  const overview = reactive({ total: 0, rows: [] as SafetyCatalogRecord[] })

  const catalogCode = computed(() => {
    const metaCode = route.meta.catalogCode
    if (typeof metaCode === 'string' && metaCode) return metaCode
    return route.path.split('/').filter(Boolean).at(-1)
  })
  const workspace = computed(() => getSafetyModuleDefinition(catalogCode.value))

  const searchQuery = reactive<SafetyCatalogSearchParams>({
    moduleCode: workspace.value.code,
    keyword: '',
    status: ''
  })

  const searchItems = computed<SearchFormItem[]>(() => [
    {
      label: '关键词',
      key: 'keyword',
      type: 'input',
      props: { placeholder: `编号、名称或负责人` }
    },
    {
      label: '状态',
      key: 'status',
      type: 'select',
      props: {
        options: [
          { label: '草稿', value: 'draft' },
          { label: '待审核', value: 'pending' },
          { label: '有效', value: 'active' },
          { label: '已完成', value: 'completed' },
          { label: '已停用', value: 'disabled' }
        ]
      }
    }
  ])

  const workspaceMetrics = computed<BusinessWorkspaceMetric[]>(() => [
    {
      label: `${workspace.value.recordNoun}总数`,
      value: overview.total,
      description: '当前筛选条件下的数据量',
      icon: 'ri:file-list-3-line'
    },
    {
      label: '本页有效',
      value: overview.rows.filter((row) => ['active', 'completed'].includes(row.status)).length,
      description: '已生效或已完成记录',
      icon: 'ri:checkbox-circle-line',
      tone: 'success'
    },
    {
      label: '本页待处理',
      value: overview.rows.filter((row) => ['draft', 'pending'].includes(row.status)).length,
      description: '草稿及待审核记录',
      icon: 'ri:time-line',
      tone: 'warning'
    }
  ])

  const headerActions = computed<ArtTableQueryHeaderAction[]>(() => [
    {
      type: 'add',
      label: `新增${workspace.value.recordNoun}`,
      permission: 'SmisCatalog:Add',
      onClick: () => openDialog()
    }
  ])

  const formRules = computed<FormRules>(() =>
    Object.fromEntries(
      workspace.value.fields
        .filter((field) => field.required)
        .map((field) => [
          field.key,
          [{ required: true, message: `请填写${field.label}`, trigger: 'blur' }]
        ])
    )
  )

  const statusLabel = (status: string): string =>
    ({
      draft: '草稿',
      pending: '待审核',
      active: '有效',
      completed: '已完成',
      disabled: '已停用'
    })[status] ??
    status ??
    '--'

  const statusTagType = (status: string) => {
    if (['active', 'completed'].includes(status)) return 'success'
    if (status === 'pending') return 'warning'
    if (status === 'disabled') return 'info'
    return 'primary'
  }

  const fieldValue = (row: SafetyCatalogRecord, field: SafetyFieldDefinition): unknown => {
    const value = row.payload?.[field.key]
    if (field.type !== 'select') return value ?? '--'
    return field.options?.find((option) => option.value === value)?.label ?? value ?? '--'
  }

  const columnsFactory = (): ColumnOption<SafetyCatalogRecord>[] => [
    { type: 'globalIndex', label: '序号', width: 64 },
    { prop: 'recordNo', label: '业务编号', minWidth: 138 },
    { prop: 'title', label: workspace.value.title, minWidth: 190 },
    ...workspace.value.fields
      .filter((field) => field.table)
      .filter((field) => !['recordNo', 'name', 'status'].includes(field.key))
      .slice(0, 3)
      .map<ColumnOption<SafetyCatalogRecord>>((field) => ({
        prop: `payload.${field.key}`,
        label: field.label,
        minWidth: field.type === 'datetime' ? 168 : 128,
        formatter: (row) => String(fieldValue(row, field))
      })),
    {
      prop: 'status',
      label: '状态',
      width: 96,
      formatter: (row) => <ElTag type={statusTagType(row.status)}>{statusLabel(row.status)}</ElTag>
    },
    {
      prop: 'updateTime',
      label: '更新时间',
      minWidth: 168,
      formatter: (row) => formatWithDayjs(row.updateTime)
    },
    {
      prop: 'operation',
      label: '操作',
      width: 124,
      fixed: 'right',
      formatter: (row) => (
        <div class="flex">
          <ArtButtonTable
            type="edit"
            permission="SmisCatalog:Edit"
            onClick={() => openDialog(row)}
          />
          <ArtButtonTable
            type="delete"
            permission="SmisCatalog:Delete"
            onClick={() => void handleDelete(row)}
          />
        </div>
      )
    }
  ]

  const fetchTableData = (params: TableParams) => {
    const { from, to } = pageInfoHandler({ current: params.current, size: params.size })
    return fetchSafetyCatalogRecords({
      moduleCode: workspace.value.code,
      keyword: params.keyword,
      status: params.status,
      from,
      to
    })
  }

  const handleTableSuccess: NonNullable<ArtTableQueryProps['onSuccess']> = (rows, response) => {
    overview.rows = rows as SafetyCatalogRecord[]
    overview.total = response.total ?? rows.length
  }

  const resetDialog = (): void => {
    editingRecord.value = null
    Object.keys(formData).forEach((key) => delete formData[key])
    formRef.value?.clearValidate()
  }

  const openDialog = (record?: SafetyCatalogRecord): void => {
    resetDialog()
    editingRecord.value = record ?? null
    for (const field of workspace.value.fields) {
      formData[field.key] =
        (record?.payload?.[field.key] as string | number | undefined) ??
        (field.key === 'status' ? 'active' : undefined)
    }
    dialogVisible.value = true
  }

  const firstValue = (keys: string[], fallback: string): string => {
    for (const key of keys) {
      const value = formData[key]
      if (typeof value === 'string' && value.trim()) return value.trim()
      if (typeof value === 'number') return String(value)
    }
    return fallback
  }

  const numberFieldValue = (key: string): number | undefined => {
    const value = formData[key]
    return typeof value === 'number' ? value : undefined
  }

  const handleSave = async (): Promise<void> => {
    if (!(await formRef.value?.validate().catch(() => false))) return
    saving.value = true
    try {
      const generatedNo = `${workspace.value.code.toUpperCase()}-${Date.now().toString().slice(-8)}`
      await saveSafetyCatalogRecord({
        id: editingRecord.value?.id,
        moduleCode: workspace.value.code,
        recordNo: firstValue(
          ['recordNo', 'certificateNo', 'standardNo', 'applicationNo', 'code'],
          generatedNo
        ),
        title: firstValue(
          ['name', 'subjectName', 'employeeName', 'title', 'reportPeriod'],
          workspace.value.title
        ),
        status: firstValue(['status', 'result'], 'active'),
        ownerName: firstValue(
          ['responsiblePerson', 'ownerName', 'employeeName', 'applicantName'],
          ''
        ),
        businessDate: firstValue(
          ['businessDate', 'effectiveDate', 'inspectionDate', 'occurredAt', 'startDate'],
          ''
        ),
        payload: { ...formData }
      })
      dialogVisible.value = false
      await tableQueryRef.value?.refreshUpdate()
    } finally {
      saving.value = false
    }
  }

  const handleDelete = async (row: SafetyCatalogRecord): Promise<void> => {
    if (!row.id) return
    try {
      await confirmAction(`确定删除“${row.title}”吗？`, '删除确认', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      })
      await deleteSafetyCatalogRecord(row.id)
      await tableQueryRef.value?.refreshRemove()
    } catch {
      // 用户取消删除时无需提示。
    }
  }

  const loadEmployeeOptions = async (keyword = ''): Promise<void> => {
    employeeLoading.value = true
    try {
      const result = await fetchEmployeeSelectorList({ keyword, from: 0, to: 49 })
      const rows = (result.data ?? []) as Array<{
        id: string
        employeeNo: string
        employeeName: string
        jobTitle?: string | null
        organization?: { organizationName?: string | null } | null
      }>
      employeeOptions.value = rows.map((employee) => ({
        label: `${employee.employeeName}（${employee.employeeNo}）`,
        value: employee.id,
        description: [employee.organization?.organizationName, employee.jobTitle]
          .filter(Boolean)
          .join(' / ')
      }))
    } finally {
      employeeLoading.value = false
    }
  }

  watch(
    () => workspace.value.code,
    (code) => {
      searchQuery.moduleCode = code
      searchQuery.keyword = ''
      searchQuery.status = ''
      overview.total = 0
      overview.rows = []
      void tableQueryRef.value?.refreshData()
    }
  )

  onMounted(() => {
    if (workspace.value.fields.some((field) => field.type === 'employee')) {
      void loadEmployeeOptions()
    }
  })
</script>

<style scoped lang="scss">
  .smis-catalog-page {
    gap: 12px;
    min-width: 0;

    &__dialog-note {
      margin-bottom: 18px;
    }

    &__employee-option {
      display: flex;
      gap: 16px;
      align-items: center;
      justify-content: space-between;

      small {
        overflow: hidden;
        text-overflow: ellipsis;
        color: var(--art-text-gray-500);
        white-space: nowrap;
      }
    }
  }

  @media (width <= 768px) {
    .smis-catalog-page :deep(.el-dialog) {
      width: calc(100vw - 24px) !important;
      margin: 12px;
    }
  }
</style>
