import { omit } from 'lodash-es'
import { useSupabase } from '@/hooks'

export type SmisSpecialOperationStatus = 'enabled' | 'disabled' | 'voided'
export type SmisSpecialOperationEditableStatus = Exclude<SmisSpecialOperationStatus, 'voided'>
export type SmisSpecialOperationTagStyle =
  '' | 'primary' | 'success' | 'info' | 'warning' | 'danger'
export type SmisSpecialOperationCatalogKind = 'safety_checklist' | 'hazard_factor' | 'site_analysis'
export type SmisSpecialOperationRecordType = 'text' | 'number' | 'single'
export type SmisSpecialOperationFieldType =
  'text' | 'textarea' | 'number' | 'date' | 'datetime' | 'single' | 'multiple' | 'switch'

export interface SmisSpecialOperationFieldDefinition {
  id?: string
  fieldCode: string
  fieldLabel: string
  fieldType: SmisSpecialOperationFieldType
  required: boolean
  placeholder: string | null
  unit: string | null
  options: string[]
  sort: number
}

export interface SmisSpecialOperationType {
  id: string
  tenantId: string
  tenantName?: string
  tenantCode?: string
  typeCode: string
  typeName: string
  remark: string | null
  sort: number
  textColor: string | null
  tagStyle: SmisSpecialOperationTagStyle
  status: SmisSpecialOperationStatus
  fieldCount: number
  fieldDefinitions: SmisSpecialOperationFieldDefinition[]
  createBy: string | null
  createTime: string
  updateBy: string | null
  updateTime: string
}

export interface SmisSpecialOperationTypeOverview {
  total: number
  enabled: number
  disabled: number
  voided: number
  customFields: number
}

export interface SmisSpecialOperationTypeSearchParams {
  from?: number
  to?: number
  keyword?: string
  status?: SmisSpecialOperationStatus
  tagStyle?: SmisSpecialOperationTagStyle
  tenantId?: string | null
}

export interface SmisSpecialOperationTypeSavePayload {
  id?: string
  tenantId?: string | null
  typeCode: string
  typeName: string
  remark: string | null
  sort: number
  textColor: string | null
  tagStyle: SmisSpecialOperationTagStyle
  status: SmisSpecialOperationEditableStatus
  fieldDefinitions: SmisSpecialOperationFieldDefinition[]
}

export interface SmisSpecialOperationCatalogItem {
  id: string
  tenantId: string
  tenantName?: string
  tenantCode?: string
  catalogKind: SmisSpecialOperationCatalogKind
  operationTypeId: string
  operationTypeCode: string
  operationTypeName: string
  itemName: string
  recordType: SmisSpecialOperationRecordType | null
  normalValue: string | null
  abnormalValue: string | null
  sort: number
  textColor: string | null
  tagStyle: SmisSpecialOperationTagStyle
  status: SmisSpecialOperationStatus
  createBy: string | null
  createTime: string
  updateBy: string | null
  updateTime: string
}

export interface SmisSpecialOperationCatalogOverview {
  total: number
  enabled: number
  disabled: number
  voided: number
}

export interface SmisSpecialOperationCatalogSearchParams {
  catalogKind: SmisSpecialOperationCatalogKind
  from?: number
  to?: number
  keyword?: string
  operationTypeId?: string | null
  recordType?: SmisSpecialOperationRecordType
  status?: SmisSpecialOperationStatus
  tagStyle?: SmisSpecialOperationTagStyle
  tenantId?: string | null
}

export interface SmisSpecialOperationCatalogSavePayload {
  id?: string
  tenantId?: string | null
  catalogKind: SmisSpecialOperationCatalogKind
  operationTypeId: string
  itemName: string
  recordType: SmisSpecialOperationRecordType | null
  normalValue: string | null
  abnormalValue: string | null
  sort: number
  textColor: string | null
  tagStyle: SmisSpecialOperationTagStyle
  status: SmisSpecialOperationEditableStatus
}

interface OperationTypeListResult {
  records?: SmisSpecialOperationType[]
  total?: number
  overview?: SmisSpecialOperationTypeOverview
}

interface CatalogListResult {
  records?: SmisSpecialOperationCatalogItem[]
  total?: number
  overview?: SmisSpecialOperationCatalogOverview
}

const { supabase, keysToSnakeDeep, responseHandle } = useSupabase()

const emptyTypeOverview = (): SmisSpecialOperationTypeOverview => ({
  total: 0,
  enabled: 0,
  disabled: 0,
  voided: 0,
  customFields: 0
})

const emptyCatalogOverview = (): SmisSpecialOperationCatalogOverview => ({
  total: 0,
  enabled: 0,
  disabled: 0,
  voided: 0
})

export async function fetchSpecialOperationTypeList(
  params: SmisSpecialOperationTypeSearchParams = {}
) {
  const from = Math.max(params.from ?? 0, 0)
  const result = await responseHandle<OperationTypeListResult>(
    () =>
      supabase.rpc('smis_list_special_operation_types_secure', {
        p_from: from,
        p_to: Math.max(params.to ?? from + 19, from),
        p_keyword: params.keyword?.trim() || null,
        p_status: params.status || null,
        p_tag_style: params.tagStyle || null,
        p_tenant_id: params.tenantId || null
      }),
    { showErrorMessage: true }
  )

  return {
    data: result.data?.records ?? [],
    total: result.data?.total ?? 0,
    overview: result.data?.overview ?? emptyTypeOverview(),
    error: result.error
  }
}

export async function saveSpecialOperationType(params: SmisSpecialOperationTypeSavePayload) {
  return await responseHandle<string>(
    () =>
      supabase.rpc('smis_save_special_operation_type_secure', {
        p_id: params.id ?? null,
        p_payload: keysToSnakeDeep(omit(params, ['id', 'tenantId'])),
        p_tenant_id: params.tenantId || null
      }),
    {
      showMessage: true,
      breakReturn: true,
      message: params.id ? '作业类型已更新' : '作业类型已新增'
    }
  )
}

export async function deleteSpecialOperationTypes(ids: string[], tenantId?: string | null) {
  return await responseHandle<number>(
    () =>
      supabase.rpc('smis_delete_special_operation_types_secure', {
        p_ids: ids,
        p_tenant_id: tenantId || null
      }),
    { showMessage: true, breakReturn: true, message: '作业类型已删除' }
  )
}

export async function voidSpecialOperationTypes(ids: string[], tenantId?: string | null) {
  return await responseHandle<number>(
    () =>
      supabase.rpc('smis_void_special_operation_types_secure', {
        p_ids: ids,
        p_tenant_id: tenantId || null
      }),
    { showMessage: true, breakReturn: true, message: '作业类型已作废' }
  )
}

export async function fetchSpecialOperationCatalogList(
  params: SmisSpecialOperationCatalogSearchParams
) {
  const from = Math.max(params.from ?? 0, 0)
  const result = await responseHandle<CatalogListResult>(
    () =>
      supabase.rpc('smis_list_special_operation_catalog_secure', {
        p_catalog_kind: params.catalogKind,
        p_from: from,
        p_to: Math.max(params.to ?? from + 19, from),
        p_keyword: params.keyword?.trim() || null,
        p_operation_type_id: params.operationTypeId || null,
        p_record_type: params.recordType || null,
        p_status: params.status || null,
        p_tag_style: params.tagStyle || null,
        p_tenant_id: params.tenantId || null
      }),
    { showErrorMessage: true }
  )

  return {
    data: result.data?.records ?? [],
    total: result.data?.total ?? 0,
    overview: result.data?.overview ?? emptyCatalogOverview(),
    error: result.error
  }
}

export async function saveSpecialOperationCatalogItem(
  params: SmisSpecialOperationCatalogSavePayload
) {
  return await responseHandle<string>(
    () =>
      supabase.rpc('smis_save_special_operation_catalog_secure', {
        p_id: params.id ?? null,
        p_payload: keysToSnakeDeep(omit(params, ['id', 'tenantId'])),
        p_tenant_id: params.tenantId || null
      }),
    {
      showMessage: true,
      breakReturn: true,
      message: params.id ? '配置项已更新' : '配置项已新增'
    }
  )
}

export async function deleteSpecialOperationCatalogItems(
  catalogKind: SmisSpecialOperationCatalogKind,
  ids: string[],
  tenantId?: string | null
) {
  return await responseHandle<number>(
    () =>
      supabase.rpc('smis_delete_special_operation_catalog_secure', {
        p_catalog_kind: catalogKind,
        p_ids: ids,
        p_tenant_id: tenantId || null
      }),
    { showMessage: true, breakReturn: true, message: '配置项已删除' }
  )
}

export async function voidSpecialOperationCatalogItems(
  catalogKind: SmisSpecialOperationCatalogKind,
  ids: string[],
  tenantId?: string | null
) {
  return await responseHandle<number>(
    () =>
      supabase.rpc('smis_void_special_operation_catalog_secure', {
        p_catalog_kind: catalogKind,
        p_ids: ids,
        p_tenant_id: tenantId || null
      }),
    { showMessage: true, breakReturn: true, message: '配置项已作废' }
  )
}
