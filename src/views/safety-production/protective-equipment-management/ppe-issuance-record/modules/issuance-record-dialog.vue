<template>
  <ArtDialog ref="dialogRef" size="xl">
    <div class="issuance-record-dialog__intro">
      <ArtSvgIcon icon="ri:archive-drawer-line" />
      <div>
        <strong>建立发放草稿</strong>
        <p>单据编号由系统按月生成 4 位流水码；完成核对后再执行发放过账。</p>
      </div>
    </div>
    <ArtForm
      ref="formRef"
      v-model="form.model"
      :rules="form.rules"
      :items="formItems"
      :span="8"
      :gutter="16"
      label-position="top"
      :show-submit="false"
      :show-reset="false"
    >
      <template #employeeId>
        <ArtEmployeeSelect
          v-model="form.model.employeeId"
          :selected-data="selection.employee"
          @update:selected-data="selection.employee = $event"
        />
      </template>
      <template #warehouseId>
        <ArtTableSingleSelect
          v-model="form.model.warehouseId"
          :selected-data="selection.warehouse"
          :api-fn="fetchWarehouseOptions"
          :columns="warehouseColumns"
          row-key="id"
          label-key="locationName"
          description-key="locationCode"
          title="选择发放仓库"
          subtitle="仅显示当前租户已启用的仓库或存放位置"
          placeholder="请选择发放仓库"
          search-placeholder="搜索仓库名称或编码"
          @update:selected-data="selection.warehouse = normalizeWarehouses($event)"
        />
      </template>
      <template #issuerEmployeeId>
        <ArtEmployeeSelect
          v-model="form.model.issuerEmployeeId"
          :selected-data="selection.issuer"
          title="选择发放人"
          subtitle="默认当前登录账号关联员工，可从员工花名册修改"
          placeholder="请选择发放人"
          @update:selected-data="selection.issuer = $event"
        />
      </template>
    </ArtForm>

    <ArtSectionCard
      title="防护用品明细"
      subtitle="发放数量必须大于 0；物料信息来自防护用品主数据。"
    >
      <template #actions>
        <ArtTableMultipleSelect
          v-model="selection.materialIds"
          :selected-data="selection.materials"
          :api-fn="fetchMaterialOptions"
          :columns="materialColumns"
          row-key="id"
          label-key="materialName"
          description-key="materialCode"
          title="选择防护用品"
          subtitle="支持一次选择多条防护用品明细"
          placeholder="新增明细"
          search-placeholder="搜索物料名称或编码"
          @update:selected-data="handleMaterialsChange"
        />
      </template>
      <ArtTable
        :data="form.model.items"
        :columns="detailColumns"
        :pagination="false"
        row-key="materialId"
        table-layout="fixed"
        empty-text="暂无发放明细"
        empty-description="点击新增明细选择需要发放的防护用品。"
      />
    </ArtSectionCard>
  </ArtDialog>
</template>

<script setup lang="tsx">
  import dayjs from 'dayjs'
  import { ElButton, ElInput, ElInputNumber, type FormRules } from 'element-plus'
  import type { EmployeeIntegrationItem } from '@/api/integration/employees'
  import ArtEmployeeSelect from '@/components/business/art-employee-select/index.vue'
  import ArtForm, { type FormItem } from '@/components/core/forms/art-form/index.vue'
  import ArtTableMultipleSelect from '@/components/core/forms/art-data-select/table-multiple.vue'
  import ArtTableSingleSelect from '@/components/core/forms/art-data-select/table-single.vue'
  import type {
    DataSelectColumn,
    DataSelectFetchParams,
    DataSelectRecord
  } from '@/components/core/forms/art-data-select/types'
  import type { ArtDialogExpose } from '@/components/core/dialogs/art-dialog/types'
  import type { ColumnOption } from '@/types'
  import { useUserStore } from '@/store/modules/user'
  import {
    fetchMaterialList,
    fetchStorageLocationList,
    savePpeIssuanceRecord,
    type SmisMaterial,
    type SmisPpeIssuanceRecord,
    type SmisPpeIssuanceRecordItem,
    type SmisStorageLocation
  } from '@smis/api'

  interface OpenData {
    mode: 'add' | 'edit' | 'copy'
    row?: SmisPpeIssuanceRecord
  }

  interface FormModel {
    id?: string
    issuanceNo: string
    employeeId?: string
    warehouseId?: string
    issuerEmployeeId?: string
    issueDate: string
    remark: string
    items: SmisPpeIssuanceRecordItem[]
  }

  interface SelectionState {
    employee: EmployeeIntegrationItem[]
    issuer: EmployeeIntegrationItem[]
    warehouse: SmisStorageLocation[]
    materialIds: string[]
    materials: SmisMaterial[]
  }

  const emit = defineEmits<{ success: [] }>()
  const dialogRef = ref<ArtDialogExpose<OpenData>>()
  const formRef = ref<{ validate: () => Promise<boolean>; clearValidate: () => void }>()
  const userStore = useUserStore()
  const { getUserInfo, getDictMap } = storeToRefs(userStore)

  const createInitialForm = (): FormModel => ({
    id: undefined,
    issuanceNo: '',
    employeeId: undefined,
    warehouseId: undefined,
    issuerEmployeeId: getUserInfo.value.hrEmployeeId || undefined,
    issueDate: dayjs().format('YYYY-MM-DD'),
    remark: '',
    items: []
  })

  const form = reactive<{ model: FormModel; rules: FormRules<FormModel> }>({
    model: createInitialForm(),
    rules: {
      employeeId: [{ required: true, message: '请选择领用人', trigger: 'change' }],
      warehouseId: [{ required: true, message: '请选择发放仓库', trigger: 'change' }],
      issuerEmployeeId: [{ required: true, message: '请选择发放人', trigger: 'change' }],
      issueDate: [{ required: true, message: '请选择发放日期', trigger: 'change' }]
    }
  })
  const selection = reactive<SelectionState>({
    employee: [],
    issuer: [],
    warehouse: [],
    materialIds: [],
    materials: []
  })
  const formItems = computed<FormItem[]>(() => [
    {
      label: '单据编号',
      key: 'issuanceNo',
      type: 'input',
      props: { disabled: true, placeholder: '保存时自动生成' }
    },
    { label: '领用人', key: 'employeeId', type: 'input' },
    {
      label: '发放日期',
      key: 'issueDate',
      type: 'date',
      props: { valueFormat: 'YYYY-MM-DD', placeholder: '请选择发放日期', class: '!w-full' }
    },
    { label: '发放仓库', key: 'warehouseId', type: 'input' },
    { label: '发放人', key: 'issuerEmployeeId', type: 'input' },
    {
      label: '备注',
      key: 'remark',
      type: 'input',
      props: { maxlength: 1000, showWordLimit: true, placeholder: '补充班组领用、异常更换等说明' }
    }
  ])
  const detailColumns: ColumnOption<SmisPpeIssuanceRecordItem>[] = [
    {
      prop: 'materialName',
      label: '物料信息',
      minWidth: 220,
      formatter: (row) => (
        <div class="issuance-record-dialog__material">
          <strong>{row.materialName}</strong>
          <small>{row.materialCategory || '未分类'}</small>
        </div>
      )
    },
    { prop: 'specificationModel', label: '规格型号', minWidth: 140, showOverflowTooltip: true },
    {
      prop: 'unit',
      label: '计量单位',
      width: 96,
      align: 'center',
      dict: { code: 'smisMaterialUnit', display: 'text' }
    },
    {
      prop: 'issueQuantity',
      label: '发放数量',
      required: true,
      width: 160,
      formatter: (row) => (
        <ElInputNumber
          v-model={row.issueQuantity}
          min={0.001}
          precision={3}
          controlsPosition="right"
          class="!w-full"
        />
      )
    },
    {
      prop: 'remark',
      label: '备注',
      minWidth: 170,
      formatter: (row) => <ElInput v-model={row.remark} maxlength={500} placeholder="选填" />
    },
    {
      prop: 'operation',
      label: '操作',
      width: 76,
      fixed: 'right',
      align: 'center',
      formatter: (row) => (
        <ElButton link type="danger" onClick={() => removeMaterial(row.materialId)}>
          移除
        </ElButton>
      )
    }
  ]

  const warehouseColumns: DataSelectColumn[] = [
    { prop: 'locationName', label: '仓库 / 存放位置', minWidth: 180 },
    { prop: 'locationCode', label: '位置编码', width: 140 },
    {
      prop: 'organization',
      label: '所属组织',
      minWidth: 160,
      formatter: (row) => (row as SmisStorageLocation).organization?.organizationName || '—'
    }
  ]
  const materialColumns: DataSelectColumn[] = [
    { prop: 'materialName', label: '物料名称', minWidth: 180 },
    { prop: 'materialCode', label: '物料编码', width: 150 },
    { prop: 'specificationModel', label: '规格型号', minWidth: 150 },
    {
      prop: 'basicUnit',
      label: '计量单位',
      width: 96,
      formatter: (row) => {
        const value = (row as SmisMaterial).basicUnit
        return (
          getDictMap.value.smisMaterialUnit?.find((item) => item.value === value)?.label || value
        )
      }
    }
  ]

  const normalizeWarehouses = (rows: DataSelectRecord[]): SmisStorageLocation[] =>
    rows as SmisStorageLocation[]

  const fetchWarehouseOptions = async (params: DataSelectFetchParams) => {
    const from = (params.page - 1) * params.pageSize
    const result = await fetchStorageLocationList({
      keyword: params.keyword,
      status: 'enabled',
      from,
      to: from + params.pageSize - 1
    })
    return { data: result.data, total: result.total }
  }

  const fetchMaterialOptions = async (params: DataSelectFetchParams) => {
    const from = (params.page - 1) * params.pageSize
    const result = await fetchMaterialList({
      materialName: params.keyword,
      materialType: 'protective_equipment',
      status: 'enabled',
      from,
      to: from + params.pageSize - 1
    })
    return { data: result.data, total: result.total }
  }

  const handleMaterialsChange = (rows: DataSelectRecord[]): void => {
    const materials = rows as SmisMaterial[]
    const existing = new Map(form.model.items.map((item) => [item.materialId, item]))
    selection.materials = materials
    form.model.items = materials.map(
      (material) =>
        existing.get(String(material.id)) ?? {
          materialId: String(material.id),
          materialCategory: material.category.categoryName,
          materialName: material.materialName,
          specificationModel: material.specificationModel,
          unit: material.basicUnit,
          issueQuantity: 1,
          remark: ''
        }
    )
  }

  const removeMaterial = (materialId: string): void => {
    form.model.items = form.model.items.filter((item) => item.materialId !== materialId)
    selection.materialIds = selection.materialIds.filter((id) => id !== materialId)
    selection.materials = selection.materials.filter((item) => item.id !== materialId)
  }

  const employeeSnapshot = (
    id: string,
    employeeNo: string,
    employeeName: string,
    jobTitle?: string | null
  ): EmployeeIntegrationItem => ({
    id,
    tenantId: getUserInfo.value.tenantId || '',
    employeeNo,
    employeeName,
    jobTitle,
    employmentStatus: 'active'
  })

  const materialSnapshot = (item: SmisPpeIssuanceRecordItem): SmisMaterial => ({
    id: item.materialId,
    tenantId: getUserInfo.value.tenantId || '',
    materialCode: '',
    materialName: item.materialName,
    categoryId: '',
    category: { id: '', categoryCode: '', categoryName: item.materialCategory || '' },
    specificationModel: item.specificationModel,
    drawingNo: null,
    basicUnit: item.unit,
    materialType: 'protective_equipment',
    materialSource: 'purchase',
    brand: null,
    materialComposition: null,
    placeOfOrigin: null,
    imageUrls: [],
    description: null,
    status: 'enabled',
    sort: 10
  })

  const resetForm = async (): Promise<void> => {
    Object.assign(form.model, createInitialForm())
    selection.employee = []
    selection.issuer = getUserInfo.value.hrEmployee
      ? [
          employeeSnapshot(
            getUserInfo.value.hrEmployee.id,
            getUserInfo.value.hrEmployee.employeeNo,
            getUserInfo.value.hrEmployee.employeeName,
            getUserInfo.value.hrEmployee.jobTitle
          )
        ]
      : []
    selection.warehouse = []
    selection.materialIds = []
    selection.materials = []
    await nextTick()
    formRef.value?.clearValidate()
  }

  const initializeFromRecord = (row: SmisPpeIssuanceRecord, copy: boolean): void => {
    Object.assign(form.model, {
      id: copy ? undefined : row.id,
      issuanceNo: copy ? '' : row.issuanceNo,
      employeeId: row.employeeId,
      warehouseId: row.warehouseId,
      issuerEmployeeId: row.issuerEmployeeId,
      issueDate: copy ? dayjs().format('YYYY-MM-DD') : row.issueDate,
      remark: row.remark || '',
      items: row.items.map((item) => ({ ...item, id: undefined }))
    })
    selection.employee = [
      employeeSnapshot(row.employeeId, row.employeeNo, row.employeeName, row.positionName)
    ]
    selection.issuer = [employeeSnapshot(row.issuerEmployeeId, '', row.issuerName)]
    selection.warehouse = [
      {
        id: row.warehouseId,
        tenantId: row.tenantId,
        organizationId: row.organizationId || '',
        locationCode: '',
        locationName: row.warehouseName,
        status: 'enabled',
        childCount: 0,
        organization: {
          id: row.organizationId || '',
          organizationCode: '',
          organizationName: row.organizationName || ''
        }
      }
    ]
    selection.materialIds = row.items.map((item) => item.materialId)
    selection.materials = row.items.map(materialSnapshot)
  }

  const handleSubmit = async (): Promise<boolean> => {
    try {
      await formRef.value?.validate()
      if (!form.model.items.length) {
        ElMessage.warning('请至少添加一条防护用品明细')
        return false
      }
      await savePpeIssuanceRecord({
        id: form.model.id,
        employeeId: String(form.model.employeeId),
        warehouseId: String(form.model.warehouseId),
        issuerEmployeeId: String(form.model.issuerEmployeeId),
        issueDate: form.model.issueDate,
        remark: form.model.remark || null,
        items: form.model.items.map((item) => ({
          requisitionItemId: item.requisitionItemId,
          materialId: item.materialId,
          issueQuantity: item.issueQuantity,
          remark: item.remark
        }))
      })
      emit('success')
      return true
    } catch {
      return false
    }
  }

  const handleOpen = async (data: OpenData): Promise<void> => {
    await userStore.ensureDictLoaded('smisMaterialUnit')
    await resetForm()
    if (data.row) initializeFromRecord(data.row, data.mode === 'copy')
    await dialogRef.value?.handleOpen(data, {
      title:
        data.mode === 'edit'
          ? '编辑防护用品发放记录'
          : data.mode === 'copy'
            ? '复制并新增防护用品发放记录'
            : '新增防护用品发放记录',
      subtitle: '维护领用人、发放仓库、发放人及用品明细',
      confirmText: '保存草稿',
      contentMaxHeight: '78vh',
      onConfirm: handleSubmit
    })
  }

  defineExpose({ handleOpen })
</script>

<style scoped lang="scss">
  .issuance-record-dialog {
    &__intro {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      padding: 12px 16px;
      margin-bottom: 16px;
      color: var(--art-gray-800);
      background: var(--art-gray-100);
      border-radius: var(--el-border-radius-base);

      svg {
        flex: 0 0 auto;
        margin-top: 2px;
        font-size: 22px;
        color: var(--theme-color);
      }

      strong,
      p {
        display: block;
        margin: 0;
      }

      p {
        margin-top: 4px;
        color: var(--art-gray-700);
      }
    }

    &__material {
      display: flex;
      flex-direction: column;
      min-width: 0;

      strong,
      small {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      small {
        margin-top: 2px;
        color: var(--art-gray-600);
      }
    }
  }
</style>
