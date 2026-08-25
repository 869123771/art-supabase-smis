import { useSupabase } from '@/hooks'
import { withRequestOptions } from '@/api/providers/supabase/query'
import type { ApiRequestOptions } from '@/types/api/request'
import type {
  PositionWorkInstruction,
  PositionWorkInstructionSavePayload,
  PositionWorkInstructionSearchParams,
  WorkInstructionPositionTree
} from '@smis/api/types'

interface WorkInstructionListPayload {
  records: PositionWorkInstruction[]
  total: number
}

const { supabase, keysToSnakeDeep, responseHandle } = useSupabase()

export async function fetchWorkInstructionPositionTree(options?: ApiRequestOptions) {
  const result = await responseHandle<WorkInstructionPositionTree>(
    () =>
      withRequestOptions(supabase.rpc('smis_get_work_instruction_position_tree_secure'), options),
    { showErrorMessage: true }
  )

  return {
    data: result.data ?? { organizations: [], positions: [] },
    error: result.error
  }
}

export async function fetchPositionWorkInstructionList(
  params: PositionWorkInstructionSearchParams,
  options?: ApiRequestOptions
) {
  const from = Math.max(params.from ?? 0, 0)
  const result = await responseHandle<WorkInstructionListPayload>(
    () =>
      withRequestOptions(
        supabase.rpc('smis_list_position_work_instructions_secure', {
          p_from: from,
          p_to: Math.max(params.to ?? from + 19, from),
          p_keyword: params.keyword?.trim() || null,
          p_file_type: params.fileType?.trim() || null,
          p_organization_id: params.organizationId || null,
          p_position_id: params.positionId || null
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

export async function savePositionWorkInstruction(payload: PositionWorkInstructionSavePayload) {
  const result = await responseHandle<string>(
    () =>
      supabase.rpc('smis_save_position_work_instruction_secure', {
        p_payload: keysToSnakeDeep(payload)
      }),
    {
      showMessage: true,
      message: payload.id ? '岗位作业指导书已更新' : '岗位作业指导书已新增',
      breakReturn: true
    }
  )
  return result.data
}

export async function deletePositionWorkInstructions(ids: string[]) {
  return await responseHandle(
    () => supabase.rpc('smis_delete_position_work_instructions_secure', { p_ids: ids }),
    { showMessage: true, message: '岗位作业指导书已删除', breakReturn: true }
  )
}
