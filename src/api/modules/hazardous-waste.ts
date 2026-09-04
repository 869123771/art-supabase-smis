import { omit } from 'lodash-es'
import { useSupabase } from '@/hooks'
import TreeUtils from '@/utils/tree'
import type {
  SmisHazardousWasteCatalogItem,
  SmisHazardousWasteCatalogOverview,
  SmisHazardousWasteCatalogSavePayload,
  SmisHazardousWasteCatalogSearchParams,
  SmisHazardousWasteCategory,
  SmisHazardousWasteCategorySavePayload,
  SmisHazardousWasteDocument,
  SmisHazardousWasteDocumentDirection,
  SmisHazardousWasteDocumentOverview,
  SmisHazardousWasteDocumentSavePayload,
  SmisHazardousWasteDocumentSearchParams,
  SmisHazardousWasteWarehouse,
  SmisHazardousWasteWarehouseOverview,
  SmisHazardousWasteWarehouseSavePayload,
  SmisHazardousWasteWarehouseSearchParams
} from '@smis/api/types'

interface WarehouseListResult {
  records?: SmisHazardousWasteWarehouse[]
  total?: number
  overview?: SmisHazardousWasteWarehouseOverview
}

interface CatalogListResult {
  records?: SmisHazardousWasteCatalogItem[]
  total?: number
  categories?: SmisHazardousWasteCategory[]
  overview?: SmisHazardousWasteCatalogOverview
}

interface DocumentListResult {
  records?: SmisHazardousWasteDocument[]
  total?: number
  overview?: SmisHazardousWasteDocumentOverview
}

const categoryTree = new TreeUtils({ idKey: 'id', parentKey: 'parentId', childrenKey: 'children' })
const { supabase, keysToSnakeDeep, responseHandle } = useSupabase()

export async function fetchHazardousWasteWarehouseList(
  params: SmisHazardousWasteWarehouseSearchParams = {}
) {
  const from = Math.max(params.from ?? 0, 0)
  const result = await responseHandle<WarehouseListResult>(
    () =>
      supabase.rpc('smis_list_hazardous_waste_warehouses_secure', {
        p_from: from,
        p_to: Math.max(params.to ?? from + 19, from),
        p_keyword: params.keyword?.trim() || null,
        p_status: params.status || null,
        p_ids: params.ids?.length ? params.ids : null,
        p_purpose: params.purpose ?? 'list'
      }),
    { showErrorMessage: true }
  )
  return {
    data: result.data?.records ?? [],
    total: result.data?.total ?? 0,
    overview: result.data?.overview ?? { total: 0, enabled: 0, managed: 0, regionCount: 0 },
    error: result.error
  }
}

export async function saveHazardousWasteWarehouse(params: SmisHazardousWasteWarehouseSavePayload) {
  return await responseHandle<string>(
    () =>
      supabase.rpc('smis_save_hazardous_waste_warehouse_secure', {
        p_id: params.id ?? null,
        p_payload: keysToSnakeDeep(omit(params, ['id']))
      }),
    {
      showMessage: true,
      breakReturn: true,
      message: params.id ? '危废仓库已更新' : '危废仓库已新增'
    }
  )
}

export async function deleteHazardousWasteWarehouses(ids: string[]) {
  return await responseHandle<number>(
    () => supabase.rpc('smis_delete_hazardous_waste_warehouses_secure', { p_ids: ids }),
    { showMessage: true, breakReturn: true, message: '危废仓库已删除' }
  )
}

export async function fetchHazardousWasteCatalogList(
  params: SmisHazardousWasteCatalogSearchParams = {}
) {
  const from = Math.max(params.from ?? 0, 0)
  const result = await responseHandle<CatalogListResult>(
    () =>
      supabase.rpc('smis_list_hazardous_waste_catalog_secure', {
        p_from: from,
        p_to: Math.max(params.to ?? from + 19, from),
        p_keyword: params.keyword?.trim() || null,
        p_status: params.status || null,
        p_category_id: params.categoryId || null,
        p_ids: params.ids?.length ? params.ids : null,
        p_purpose: params.purpose ?? 'list'
      }),
    { showErrorMessage: true }
  )
  return {
    data: result.data?.records ?? [],
    total: result.data?.total ?? 0,
    categories: categoryTree.listToTree(
      result.data?.categories ?? [],
      (left, right) =>
        (left.sort ?? 0) - (right.sort ?? 0) ||
        left.categoryName.localeCompare(right.categoryName, 'zh-CN')
    ),
    overview: result.data?.overview ?? {
      total: 0,
      enabled: 0,
      categoryCount: 0,
      characteristicCount: 0
    },
    error: result.error
  }
}

export async function saveHazardousWasteCategory(params: SmisHazardousWasteCategorySavePayload) {
  return await responseHandle<string>(
    () =>
      supabase.rpc('smis_save_hazardous_waste_category_secure', {
        p_id: params.id ?? null,
        p_payload: keysToSnakeDeep(omit(params, ['id']))
      }),
    {
      showMessage: true,
      breakReturn: true,
      message: params.id ? '危废分类已更新' : '危废分类已新增'
    }
  )
}

export async function deleteHazardousWasteCategories(ids: string[]) {
  return await responseHandle<number>(
    () => supabase.rpc('smis_delete_hazardous_waste_categories_secure', { p_ids: ids }),
    { showMessage: true, breakReturn: true, message: '危废分类已删除' }
  )
}

export async function saveHazardousWasteCatalog(params: SmisHazardousWasteCatalogSavePayload) {
  return await responseHandle<string>(
    () =>
      supabase.rpc('smis_save_hazardous_waste_catalog_secure', {
        p_id: params.id ?? null,
        p_payload: keysToSnakeDeep(omit(params, ['id']))
      }),
    {
      showMessage: true,
      breakReturn: true,
      message: params.id ? '危废名录已更新' : '危废名录已新增'
    }
  )
}

export async function deleteHazardousWasteCatalog(ids: string[]) {
  return await responseHandle<number>(
    () => supabase.rpc('smis_delete_hazardous_waste_catalog_secure', { p_ids: ids }),
    { showMessage: true, breakReturn: true, message: '危废名录已删除' }
  )
}

export async function fetchHazardousWasteDocumentList(
  direction: SmisHazardousWasteDocumentDirection,
  params: SmisHazardousWasteDocumentSearchParams = {}
) {
  const from = Math.max(params.from ?? 0, 0)
  const result = await responseHandle<DocumentListResult>(
    () =>
      supabase.rpc('smis_list_hazardous_waste_documents_secure', {
        p_direction: direction,
        p_from: from,
        p_to: Math.max(params.to ?? from + 19, from),
        p_document_no: params.documentNo?.trim() || null,
        p_date_from: params.dateRange?.[0] ?? null,
        p_date_to: params.dateRange?.[1] ?? null,
        p_warehouse_id: params.warehouseId || null,
        p_handler_keyword: params.handlerKeyword?.trim() || null,
        p_status: params.status || null,
        p_purpose: params.purpose ?? 'list'
      }),
    { showErrorMessage: true }
  )
  return {
    data: result.data?.records ?? [],
    total: result.data?.total ?? 0,
    overview: result.data?.overview ?? {
      total: 0,
      draft: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      quantity: 0
    },
    error: result.error
  }
}

export async function saveHazardousWasteDocument(
  direction: SmisHazardousWasteDocumentDirection,
  params: SmisHazardousWasteDocumentSavePayload
) {
  return await responseHandle<string>(
    () =>
      supabase.rpc('smis_save_hazardous_waste_document_secure', {
        p_direction: direction,
        p_id: params.id ?? null,
        p_payload: keysToSnakeDeep(omit(params, ['id']))
      }),
    {
      showMessage: true,
      breakReturn: true,
      message: `${direction === 'inbound' ? '入库' : '出库'}单草稿已保存`
    }
  )
}

export async function deleteHazardousWasteDocuments(
  direction: SmisHazardousWasteDocumentDirection,
  ids: string[]
) {
  return await responseHandle<number>(
    () =>
      supabase.rpc('smis_delete_hazardous_waste_documents_secure', {
        p_direction: direction,
        p_ids: ids
      }),
    { showMessage: true, breakReturn: true, message: '危废单据已删除' }
  )
}

export async function transitionHazardousWasteDocument(
  direction: SmisHazardousWasteDocumentDirection,
  id: string,
  action: 'submit' | 'approve' | 'reject',
  remark?: string
) {
  const actionLabel = { submit: '提交审核', approve: '审核通过', reject: '审核拒绝' }[action]
  return await responseHandle<string>(
    () =>
      supabase.rpc('smis_transition_hazardous_waste_document_secure', {
        p_direction: direction,
        p_id: id,
        p_action: action,
        p_remark: remark?.trim() || null
      }),
    { showMessage: true, breakReturn: true, message: `危废单据已${actionLabel}` }
  )
}
