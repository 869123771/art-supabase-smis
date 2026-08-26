import { omit } from 'lodash-es'
import { useSupabase } from '@/hooks'
import type {
  EmployeeIntegrationItem,
  EmployeeSelectorContractParams
} from '@/api/integration/employees'
import type { SmisSite, SmisSiteSavePayload } from '@smis/api/types'

interface SiteEmployeeListResult {
  records?: EmployeeIntegrationItem[]
  total?: number
}

const { supabase, keysToSnakeDeep, responseHandle } = useSupabase()

export async function fetchSiteList() {
  return await responseHandle<SmisSite[]>(() => supabase.rpc('smis_list_sites_secure'), {
    showErrorMessage: true
  })
}

export async function fetchSiteEmployeeOptions(params: EmployeeSelectorContractParams = {}) {
  const from = Math.max(params.from ?? 0, 0)
  const result = await responseHandle<SiteEmployeeListResult>(
    () =>
      supabase.rpc('smis_list_site_employees_secure', {
        p_from: from,
        p_to: Math.max(params.to ?? from + 19, from),
        p_keyword: params.keyword?.trim() || null
      }),
    { showErrorMessage: true }
  )
  return {
    data: result.data?.records ?? [],
    total: result.data?.total ?? 0,
    error: result.error,
    fieldAccess: {}
  }
}

export async function saveSite(params: SmisSiteSavePayload) {
  return await responseHandle<string>(
    () =>
      supabase.rpc('smis_save_site_secure', {
        p_id: params.id ?? null,
        p_payload: keysToSnakeDeep(omit(params, ['id']))
      }),
    {
      showMessage: true,
      breakReturn: true,
      message: params.id ? '场所信息已更新' : '场所信息已新增'
    }
  )
}

export async function deleteSites(ids: string[]) {
  return await responseHandle<number>(
    () => supabase.rpc('smis_delete_sites_secure', { p_ids: ids }),
    { showMessage: true, breakReturn: true, message: '场所信息已删除' }
  )
}
