import { omit } from 'lodash-es'
import { useSupabase } from '@/hooks'
import TreeUtils from '@/utils/tree'
import type {
  SmisEquipmentCategory,
  SmisEquipmentCategoryOverview,
  SmisEquipmentCategorySavePayload,
  SmisEquipmentCategorySearchParams,
  SmisEquipmentInspectionCategory
} from '@smis/api/types'

interface EquipmentCategoryListResult {
  records?: SmisEquipmentCategory[]
  total?: number
  tree?: SmisEquipmentCategory[]
  inspectionOptions?: SmisEquipmentInspectionCategory[]
  overview?: SmisEquipmentCategoryOverview
}

const emptyOverview = (): SmisEquipmentCategoryOverview => ({
  total: 0,
  enabled: 0,
  rootCount: 0,
  linkedCount: 0
})

const treeUtils = new TreeUtils({
  idKey: 'id',
  parentKey: 'parentId',
  childrenKey: 'children'
})
const { supabase, keysToSnakeDeep, responseHandle } = useSupabase()

export async function fetchEquipmentCategoryList(params: SmisEquipmentCategorySearchParams = {}) {
  const from = Math.max(params.from ?? 0, 0)
  const result = await responseHandle<EquipmentCategoryListResult>(
    () =>
      supabase.rpc('smis_list_equipment_categories_secure', {
        p_from: from,
        p_to: Math.max(params.to ?? from + 19, from),
        p_keyword: params.keyword?.trim() || null,
        p_status: params.status || null,
        p_ancestor_id: params.ancestorId || null
      }),
    { showErrorMessage: true }
  )

  const flatTree = (result.data?.tree ?? []).map((item) => ({
    ...item,
    childCount: item.childCount ?? 0,
    inspectionCategories: item.inspectionCategories ?? []
  }))

  return {
    data: result.data?.records ?? [],
    total: result.data?.total ?? 0,
    tree: treeUtils.listToTree(
      flatTree,
      (a, b) =>
        (a.sort ?? 0) - (b.sort ?? 0) || a.categoryName.localeCompare(b.categoryName, 'zh-CN')
    ),
    inspectionOptions: result.data?.inspectionOptions ?? [],
    overview: result.data?.overview ?? emptyOverview(),
    error: result.error
  }
}

export async function saveEquipmentCategory(params: SmisEquipmentCategorySavePayload) {
  return await responseHandle<string>(
    () =>
      supabase.rpc('smis_save_equipment_category_secure', {
        p_id: params.id ?? null,
        p_payload: keysToSnakeDeep(omit(params, ['id']))
      }),
    {
      showMessage: true,
      breakReturn: true,
      message: params.id ? '设备分类已更新' : '设备分类已新增'
    }
  )
}

export async function deleteEquipmentCategories(ids: string[]) {
  return await responseHandle<number>(
    () => supabase.rpc('smis_delete_equipment_categories_secure', { p_ids: ids }),
    { showMessage: true, breakReturn: true, message: '设备分类已删除' }
  )
}
