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
    p_from: from,
    p_to: Math.max(params.to ?? from + 19, from),
    p_keyword: params.keyword?.trim() || null,
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
  return await fetchSupplierList({ ...params, from: 0, to: 9999, purpose: 'export' })
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

export async function deleteSuppliers(ids: string[]) {
  return await responseHandle<number>(
    () => supabase.rpc('smis_delete_suppliers_secure', { p_ids: ids }),
    { showMessage: true, breakReturn: true, message: '供应商已删除' }
  )
}
