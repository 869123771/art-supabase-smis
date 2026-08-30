import dayjs from 'dayjs'
import { omit } from 'lodash-es'
import { useSupabase } from '@/hooks'
import type {
  SmisViolationRecord,
  SmisViolationRecordOverview,
  SmisViolationRecordSavePayload,
  SmisViolationRecordSearchParams
} from '@smis/api/types'

interface ViolationRecordListPayload {
  records?: SmisViolationRecord[]
  total?: number
  overview?: SmisViolationRecordOverview
}

const { supabase, keysToSnakeDeep, responseHandle } = useSupabase()

const emptyOverview = (): SmisViolationRecordOverview => ({
  total: 0,
  violatorCount: 0,
  deductionPoints: 0,
  fineAmount: 0
})

export async function fetchViolationRecordList(params: SmisViolationRecordSearchParams = {}) {
  const from = Math.max(params.from ?? 0, 0)
  const [startTime, endTime] = params.violationTimeRange ?? []
  const result = await responseHandle<ViolationRecordListPayload>(
    () =>
      supabase.rpc('smis_list_violation_records_secure', {
        p_from: from,
        p_to: Math.max(params.to ?? from + 19, from),
        p_record_no: params.recordNo?.trim() || null,
        p_violation_keyword: params.violationKeyword?.trim() || null,
        p_violator_employee_id: params.violatorEmployeeId || null,
        p_start_time: startTime ? dayjs(startTime).startOf('day').toISOString() : null,
        p_end_time: endTime ? dayjs(endTime).endOf('day').toISOString() : null,
        p_purpose: params.purpose ?? 'list'
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

export async function saveViolationRecord(params: SmisViolationRecordSavePayload) {
  return await responseHandle<string>(
    () =>
      supabase.rpc('smis_save_violation_record_secure', {
        p_id: params.id ?? null,
        p_payload: keysToSnakeDeep(omit(params, ['id']))
      }),
    {
      showMessage: true,
      breakReturn: true,
      message: params.id ? '违章记录已更新' : '违章记录已新增'
    }
  )
}

export async function deleteViolationRecords(ids: string[]) {
  return await responseHandle<number>(
    () => supabase.rpc('smis_delete_violation_records_secure', { p_ids: ids }),
    { showMessage: true, breakReturn: true, message: '违章记录已删除' }
  )
}
