import { omit } from 'lodash-es'
import { useSupabase } from '@/hooks'
import type {
  SmisEquipmentDepreciation,
  SmisEquipmentDepreciationOverview,
  SmisEquipmentDepreciationSavePayload,
  SmisEquipmentDepreciationSearchParams
} from '@smis/api/types'

interface EquipmentDepreciationListResult {
  records?: SmisEquipmentDepreciation[]
  total?: number
  overview?: SmisEquipmentDepreciationOverview
}
const { supabase, keysToSnakeDeep, responseHandle } = useSupabase()

export async function fetchEquipmentDepreciationList(
  params: SmisEquipmentDepreciationSearchParams = {}
) {
  const from = Math.max(params.from ?? 0, 0)
  const result = await responseHandle<EquipmentDepreciationListResult>(
    () =>
      supabase.rpc('smis_list_equipment_depreciations_secure', {
        p_from: from,
        p_to: Math.max(params.to ?? from + 19, from),
        p_keyword: params.keyword?.trim() || null,
        p_depreciation_method: params.depreciationMethod || null,
        p_status: params.status || null
      }),
    { showErrorMessage: true }
  )
  return {
    data: result.data?.records ?? [],
    total: result.data?.total ?? 0,
    overview: result.data?.overview ?? {
      total: 0,
      active: 0,
      totalOriginalValue: 0,
      totalNetValue: 0
    },
    error: result.error
  }
}

export async function saveEquipmentDepreciation(params: SmisEquipmentDepreciationSavePayload) {
  return await responseHandle<string>(
    () =>
      supabase.rpc('smis_save_equipment_depreciation_secure', {
        p_id: params.id ?? null,
        p_payload: keysToSnakeDeep(omit(params, ['id']))
      }),
    {
      showMessage: true,
      breakReturn: true,
      message: params.id ? '设备折旧已更新' : '设备折旧已新增'
    }
  )
}

export async function deleteEquipmentDepreciations(ids: string[]) {
  return await responseHandle<number>(
    () => supabase.rpc('smis_delete_equipment_depreciations_secure', { p_ids: ids }),
    { showMessage: true, breakReturn: true, message: '设备折旧已删除' }
  )
}
