import { omit } from 'lodash-es'
import { useSupabase } from '@/hooks'
import type { ApiRequestOptions } from '@/types/api/request'
import { withRequestOptions } from '@/api/providers/supabase/query'

export interface SafetyCatalogRecord {
  id?: string
  tenantId?: string
  moduleCode: string
  recordNo: string
  title: string
  status: string
  ownerName?: string | null
  businessDate?: string | null
  payload: Record<string, unknown>
  createdBy?: string | null
  createTime?: string
  updateTime?: string
}

export interface SafetyCatalogSearchParams {
  moduleCode: string
  keyword?: string
  status?: string
  from?: number
  to?: number
}

const { supabase, keysToSnakeDeep, responseHandle } = useSupabase()

export async function fetchSafetyCatalogRecords(
  params: SafetyCatalogSearchParams,
  options?: ApiRequestOptions
) {
  const { from = 0, to = 9 } = params
  let query = supabase
    .from('smis_business_record')
    .select('*', { count: 'exact' })
    .eq('module_code', params.moduleCode)
    .order('update_time', { ascending: false })
    .range(from, to)

  if (params.status) query = query.eq('status', params.status)
  if (params.keyword?.trim()) {
    const keyword = params.keyword.trim().replaceAll(',', ' ')
    query = query.or(
      `record_no.ilike.%${keyword}%,title.ilike.%${keyword}%,owner_name.ilike.%${keyword}%`
    )
  }

  return await responseHandle<SafetyCatalogRecord[]>(() => withRequestOptions(query, options), {
    ignoreCheck: true,
    showErrorMessage: true
  })
}

export async function saveSafetyCatalogRecord(record: SafetyCatalogRecord) {
  const payload = omit(record, ['tenantId', 'createdBy', 'createTime', 'updateTime'])
  return await responseHandle<SafetyCatalogRecord>(
    () => supabase.rpc('smis_save_business_record', { p_payload: keysToSnakeDeep(payload) }),
    {
      breakReturn: true,
      showMessage: true,
      message: record.id ? '业务记录已更新' : '业务记录已创建'
    }
  )
}

export async function deleteSafetyCatalogRecord(id: string) {
  return await responseHandle<void>(
    () => supabase.rpc('smis_delete_business_record', { p_record_id: id }),
    { breakReturn: true, showMessage: true, message: '业务记录已删除' }
  )
}
