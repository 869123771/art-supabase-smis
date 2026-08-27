import { omit } from 'lodash-es'
import { useSupabase } from '@/hooks'
import type {
  SmisEquipmentInspection,
  SmisEquipmentInspectionOverview,
  SmisEquipmentInspectionSavePayload,
  SmisEquipmentInspectionSearchParams
} from '@smis/api/types'

interface InspectionListResult {
  records?: SmisEquipmentInspection[]
  total?: number
  overview?: SmisEquipmentInspectionOverview
}

const { supabase, keysToSnakeDeep, responseHandle } = useSupabase()

const emptyOverview = (): SmisEquipmentInspectionOverview => ({
  total: 0,
  completed: 0,
  dueSoon: 0,
  imageCount: 0
})

export async function fetchEquipmentInspectionList(
  params: SmisEquipmentInspectionSearchParams = {}
) {
  const from = Math.max(params.from ?? 0, 0)
  const result = await responseHandle<InspectionListResult>(
    () =>
      supabase.rpc('smis_list_equipment_inspections_secure', {
        p_from: from,
        p_to: Math.max(params.to ?? from + 19, from),
        p_keyword: params.keyword?.trim() || null,
        p_equipment_id: params.equipmentId || null,
        p_organization_id: params.organizationId || null,
        p_inspection_category_id: params.inspectionCategoryId || null,
        p_status: params.status || null
      }),
    { showErrorMessage: true }
  )
  return {
    data: result.data?.records ?? [],
    total: result.data?.total ?? 0,
    overview: result.data?.overview ?? emptyOverview(),
    error: result.error
  }
}

export async function saveEquipmentInspection(params: SmisEquipmentInspectionSavePayload) {
  return await responseHandle<string>(
    () =>
      supabase.rpc('smis_save_equipment_inspection_secure', {
        p_id: params.id ?? null,
        p_payload: keysToSnakeDeep(omit(params, ['id']))
      }),
    {
      showMessage: true,
      breakReturn: true,
      message: params.id ? '检验申报已更新' : '检验申报已新增'
    }
  )
}

export async function deleteEquipmentInspections(ids: string[]) {
  return await responseHandle<number>(
    () => supabase.rpc('smis_delete_equipment_inspections_secure', { p_ids: ids }),
    { showMessage: true, breakReturn: true, message: '检验申报已删除' }
  )
}
