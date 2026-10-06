import { buildSupabaseRpcRange } from '@/utils/supabase'
import { loadAllDocumentPages } from '@/utils/business/document-detail-list'
import { normalizeNullableText } from '@/utils/form/normalize'
import { omit } from 'lodash-es'
import { useSupabase } from '@/hooks'
import type {
  SmisSupplier,
  SmisSupplierOverview,
  SmisSupplierSavePayload,
  SmisSupplierSearchParams
} from '@smis/api/types'

interface SupplierListResult {
  records?: SmisSupplier[]
  total?: number
  overview?: SmisSupplierOverview
}

const emptyOverview = (): SmisSupplierOverview => ({
  total: 0,
  keySuppliers: 0,
  categoryCount: 0,
  contactComplete: 0
})

const { supabase, keysToSnakeDeep, responseHandle } = useSupabase()

const buildListParams = (params: SmisSupplierSearchParams) => {
  const from = Math.max(params.from ?? 0, 0)
  return {
    ...buildSupabaseRpcRange(from, params.to ?? from + 19),
    p_keyword: normalizeNullableText(params.keyword),
    p_supplier_category: params.supplierCategory || null,
    p_supplier_type: params.supplierType || null,
    p_enterprise_nature: params.enterpriseNature || null,
    p_industry: params.industry || null,
    p_ids: params.ids?.length ? params.ids : null,
    p_purpose: params.purpose ?? 'list'
  }
}

export async function fetchSupplierList(params: SmisSupplierSearchParams = {}) {
  const result = await responseHandle<SupplierListResult>(
    () => supabase.rpc('smis_list_suppliers_secure', buildListParams(params)),
    { showErrorMessage: true }
  )

  return {
    data: result.data?.records ?? [],
    total: result.data?.total ?? 0,
    overview: result.data?.overview ?? emptyOverview(),
    error: result.error
  }
}

export async function exportSupplierList(params: SmisSupplierSearchParams = {}) {
  let overview = emptyOverview()
  const data = await loadAllDocumentPages(
    async (page) => {
      const result = await fetchSupplierList(page)
      if (page.from === 0) overview = result.overview
      return result
    },
    { ...params, purpose: 'export' as const }
  )
  return { data, total: data.length, overview, error: null }
}

export async function saveSupplier(params: SmisSupplierSavePayload) {
  return await responseHandle<string>(
    () =>
      supabase.rpc('smis_save_supplier_secure', {
        p_id: params.id ?? null,
        p_payload: keysToSnakeDeep(omit(params, ['id']))
      }),
    {
      showMessage: true,
      breakReturn: true,
      message: params.id ? '供应商已更新' : '供应商已新增'
    }
  )
}
