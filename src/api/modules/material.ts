import { omit } from 'lodash-es'
import { useSupabase } from '@/hooks'
import TreeUtils from '@/utils/tree'
import type {
  SmisMaterial,
  SmisMaterialCategory,
  SmisMaterialCategoryOverview,
  SmisMaterialCategorySavePayload,
  SmisMaterialCategorySearchParams,
  SmisMaterialOverview,
  SmisMaterialSavePayload,
  SmisMaterialSearchParams
} from '@smis/api/types'

interface MaterialCategoryListResult {
  records?: SmisMaterialCategory[]
  total?: number
  tree?: SmisMaterialCategory[]
  overview?: SmisMaterialCategoryOverview
}

interface MaterialListResult {
  records?: SmisMaterial[]
  total?: number
  categoryTree?: SmisMaterialCategory[]
  overview?: SmisMaterialOverview
}

const categoryTreeUtils = new TreeUtils({
  idKey: 'id',
  parentKey: 'parentId',
  childrenKey: 'children'
})
const { supabase, keysToSnakeDeep, responseHandle } = useSupabase()

const emptyCategoryOverview = (): SmisMaterialCategoryOverview => ({
  total: 0,
  enabled: 0,
  rootCount: 0,
  usedCount: 0
})

const emptyMaterialOverview = (): SmisMaterialOverview => ({
  total: 0,
  enabled: 0,
  protectiveEquipment: 0,
  pictured: 0
})

const buildCategoryTree = (items: SmisMaterialCategory[]): SmisMaterialCategory[] =>
  categoryTreeUtils.listToTree(
    items,
    (a, b) => (a.sort ?? 0) - (b.sort ?? 0) || a.categoryName.localeCompare(b.categoryName, 'zh-CN')
  )

export async function fetchMaterialCategoryList(params: SmisMaterialCategorySearchParams = {}) {
  const from = Math.max(params.from ?? 0, 0)
  const result = await responseHandle<MaterialCategoryListResult>(
    () =>
      supabase.rpc('smis_list_material_categories_secure', {
        p_from: from,
        p_to: Math.max(params.to ?? from + 19, from),
        p_keyword: params.keyword?.trim() || null,
        p_status: params.status || null,
        p_ancestor_id: params.ancestorId || null
      }),
    { showErrorMessage: true }
  )

  return {
    data: result.data?.records ?? [],
    total: result.data?.total ?? 0,
    tree: buildCategoryTree(result.data?.tree ?? []),
    overview: result.data?.overview ?? emptyCategoryOverview(),
    error: result.error
  }
}

export async function saveMaterialCategory(params: SmisMaterialCategorySavePayload) {
  return await responseHandle<string>(
    () =>
      supabase.rpc('smis_save_material_category_secure', {
        p_id: params.id ?? null,
        p_payload: keysToSnakeDeep(omit(params, ['id']))
      }),
    {
      showMessage: true,
      breakReturn: true,
      message: params.id ? '物料类别已更新' : '物料类别已新增'
    }
  )
}

export async function deleteMaterialCategories(ids: string[]) {
  return await responseHandle<number>(
    () => supabase.rpc('smis_delete_material_categories_secure', { p_ids: ids }),
    { showMessage: true, breakReturn: true, message: '物料类别已删除' }
  )
}

export async function fetchMaterialList(params: SmisMaterialSearchParams = {}) {
  const from = Math.max(params.from ?? 0, 0)
  const result = await responseHandle<MaterialListResult>(
    () =>
      supabase.rpc('smis_list_materials_secure', {
        p_from: from,
        p_to: Math.max(params.to ?? from + 19, from),
        p_material_name: params.materialName?.trim() || null,
        p_material_code: params.materialCode?.trim() || null,
        p_specification_model: params.specificationModel?.trim() || null,
        p_drawing_no: params.drawingNo?.trim() || null,
        p_category_id: params.categoryId || null,
        p_material_type: params.materialType || null,
        p_material_source: params.materialSource || null,
        p_status: params.status || null,
        p_ids: params.ids?.length ? params.ids : null,
        p_purpose: params.purpose ?? 'list'
      }),
    { showErrorMessage: true }
  )

  return {
    data: result.data?.records ?? [],
    total: result.data?.total ?? 0,
    categoryTree: buildCategoryTree(result.data?.categoryTree ?? []),
    overview: result.data?.overview ?? emptyMaterialOverview(),
    error: result.error
  }
}

export async function saveMaterial(params: SmisMaterialSavePayload) {
  return await responseHandle<string>(
    () =>
      supabase.rpc('smis_save_material_secure', {
        p_id: params.id ?? null,
        p_payload: keysToSnakeDeep(omit(params, ['id']))
      }),
    {
      showMessage: true,
      breakReturn: true,
      message: params.id ? '物料信息已更新' : '物料信息已新增'
    }
  )
}

export async function deleteMaterials(ids: string[]) {
  return await responseHandle<number>(
    () => supabase.rpc('smis_delete_materials_secure', { p_ids: ids }),
    { showMessage: true, breakReturn: true, message: '物料信息已删除' }
  )
}
