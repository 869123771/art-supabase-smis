import { useSupabase } from '@/hooks'
import TreeUtils from '@/utils/tree'
import type { SmisSpecialEquipmentAnalysis } from '@smis/api/types'

const { supabase, responseHandle } = useSupabase()
const organizationTreeUtils = new TreeUtils({
  idKey: 'id',
  parentKey: 'parentId',
  childrenKey: 'children'
})

const emptyAnalysis = (): SmisSpecialEquipmentAnalysis => ({
  rows: [],
  categories: [],
  organizations: [],
  overview: {
    total: 0,
    organizationCount: 0,
    categoryCount: 0,
    boilerCount: 0,
    majorHazardCount: 0
  }
})

export async function fetchSpecialEquipmentAnalysis(organizationId?: string) {
  const result = await responseHandle<SmisSpecialEquipmentAnalysis>(
    () =>
      supabase.rpc('smis_get_special_equipment_analysis_secure', {
        p_organization_id: organizationId || null
      }),
    { showErrorMessage: true }
  )
  const data = result.data ?? emptyAnalysis()
  return {
    data: {
      ...data,
      organizations: organizationTreeUtils.listToTree(data.organizations, (a, b) => {
        const sortDiff = (a.sort ?? 0) - (b.sort ?? 0)
        return sortDiff || a.organizationName.localeCompare(b.organizationName, 'zh-CN')
      })
    },
    error: result.error
  }
}
