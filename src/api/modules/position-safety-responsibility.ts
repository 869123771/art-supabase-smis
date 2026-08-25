import { useSupabase } from '@/hooks'
import { withRequestOptions } from '@/api/providers/supabase/query'
import type { ApiRequestOptions } from '@/types/api/request'
import type {
  PositionSafetyResponsibility,
  PositionSafetyResponsibilitySavePayload,
  PositionSafetyResponsibilitySearchParams,
  SmisPositionOption,
  SmisPositionSearchParams
} from '@smis/api/types'

interface PositionListPayload {
  records: SmisPositionOption[]
  total: number
}

const TABLE_NAME = 'smis_position_safety_responsibility'
const { supabase, keysToSnakeDeep, responseHandle } = useSupabase()

export async function fetchSmisPositionList(
  params: SmisPositionSearchParams = {},
  options?: ApiRequestOptions
) {
  const from = Math.max(params.from ?? 0, 0)
  const result = await responseHandle<PositionListPayload>(
    () =>
      withRequestOptions(
        supabase.rpc('smis_list_positions_secure', {
          p_from: from,
          p_to: Math.max(params.to ?? 499, from),
          p_keyword: params.keyword?.trim() || null,
          p_organization_id: params.organizationId || null
        }),
        options
      ),
    { showErrorMessage: true }
  )

  return {
    data: result.data?.records ?? [],
    total: result.data?.total ?? 0,
    error: result.error
  }
}

export async function fetchPositionSafetyResponsibilityList(
  params: PositionSafetyResponsibilitySearchParams,
  options?: ApiRequestOptions
) {
  const from = Math.max(params.from ?? 0, 0)
  const to = Math.max(params.to ?? from + 19, from)
  let query = supabase
    .from(TABLE_NAME)
    .select('*', { count: 'exact' })
    .eq('position_id', params.positionId)
    .order('revision_date', { ascending: false })
    .order('create_time', { ascending: false })
    .range(from, to)

  if (params.organizationId) query = query.eq('organization_id', params.organizationId)
  if (params.primaryHazardCategory) {
    query = query.eq('primary_hazard_category', params.primaryHazardCategory)
  }
  if (params.hazardLevel) query = query.eq('hazard_level', params.hazardLevel)
  if (params.keyword?.trim()) {
    query = query.ilike('hazard_content', `%${params.keyword.trim()}%`)
  }

  return await responseHandle<PositionSafetyResponsibility[]>(
    () => withRequestOptions(query, options),
    { showErrorMessage: true }
  )
}

export async function addPositionSafetyResponsibility(
  payload: PositionSafetyResponsibilitySavePayload
) {
  return await responseHandle(() => supabase.from(TABLE_NAME).insert(keysToSnakeDeep(payload)), {
    showMessage: true,
    message: '隐患排查标准已新增',
    breakReturn: true
  })
}

export async function editPositionSafetyResponsibility(
  id: string,
  payload: PositionSafetyResponsibilitySavePayload
) {
  return await responseHandle(
    () => supabase.from(TABLE_NAME).update(keysToSnakeDeep(payload)).eq('id', id),
    { showMessage: true, message: '隐患排查标准已更新', breakReturn: true }
  )
}

export async function deletePositionSafetyResponsibilities(ids: string[]) {
  return await responseHandle(
    () => supabase.from(TABLE_NAME).delete({ count: 'exact' }).in('id', ids),
    { showMessage: true, message: '隐患排查标准已删除' }
  )
}

export async function importPositionSafetyResponsibilities(
  rows: PositionSafetyResponsibilitySavePayload[]
) {
  return await responseHandle(() => supabase.from(TABLE_NAME).insert(keysToSnakeDeep(rows)), {
    showMessage: true,
    message: `已导入 ${rows.length} 条隐患排查标准`,
    breakReturn: true
  })
}
