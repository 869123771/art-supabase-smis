import { omit } from 'lodash-es'
import { useSupabase } from '@/hooks'
import TreeUtils from '@/utils/tree'
import type {
  SmisStorageLocation,
  SmisStorageLocationOverview,
  SmisStorageLocationSavePayload,
  SmisStorageLocationSearchParams
} from '@smis/api/types'

interface StorageLocationListResult {
  records?: SmisStorageLocation[]
  total?: number
  tree?: SmisStorageLocation[]
  overview?: SmisStorageLocationOverview
}

const emptyOverview = (): SmisStorageLocationOverview => ({
  total: 0,
  enabled: 0,
  rootCount: 0,
  managedCount: 0
})

const treeUtils = new TreeUtils({
  idKey: 'id',
  parentKey: 'parentId',
  childrenKey: 'children'
})
const { supabase, keysToSnakeDeep, responseHandle } = useSupabase()

export async function fetchStorageLocationList(params: SmisStorageLocationSearchParams = {}) {
  const from = Math.max(params.from ?? 0, 0)
  const result = await responseHandle<StorageLocationListResult>(
    () =>
      supabase.rpc('smis_list_storage_locations_secure', {
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
    childCount: item.childCount ?? 0
  }))

  return {
    data: result.data?.records ?? [],
    total: result.data?.total ?? 0,
    tree: treeUtils.listToTree(flatTree, (a, b) =>
      a.locationName.localeCompare(b.locationName, 'zh-CN')
    ),
    overview: result.data?.overview ?? emptyOverview(),
    error: result.error
  }
}

export async function saveStorageLocation(params: SmisStorageLocationSavePayload) {
  return await responseHandle<string>(
    () =>
      supabase.rpc('smis_save_storage_location_secure', {
        p_id: params.id ?? null,
        p_payload: keysToSnakeDeep(omit(params, ['id']))
      }),
    {
      showMessage: true,
      breakReturn: true,
      message: params.id ? '存放位置已更新' : '存放位置已新增'
    }
  )
}

export async function deleteStorageLocations(ids: string[]) {
  return await responseHandle<number>(
    () => supabase.rpc('smis_delete_storage_locations_secure', { p_ids: ids }),
    { showMessage: true, breakReturn: true, message: '存放位置已删除' }
  )
}
