import { omit } from 'lodash-es'
import { useSupabase } from '@/hooks'
import type {
  StatutoryHoliday,
  StatutoryHolidaySavePayload,
  StatutoryHolidaySearchParams
} from '@smis/api/types'

interface StatutoryHolidayListResult {
  records?: StatutoryHoliday[]
  total?: number
}

const { supabase, keysToSnakeDeep, responseHandle } = useSupabase()

export async function fetchStatutoryHolidayList(params: StatutoryHolidaySearchParams = {}) {
  const from = Math.max(params.from ?? 0, 0)
  const result = await responseHandle<StatutoryHolidayListResult>(
    () =>
      supabase.rpc('smis_list_statutory_holidays_secure', {
        p_from: from,
        p_to: Math.max(params.to ?? from + 999, from),
        p_organization_id: params.organizationId || null,
        p_holiday_type: params.holidayType || null,
        p_year: params.year || null
      }),
    { showErrorMessage: true }
  )
  return {
    data: result.data?.records ?? [],
    total: result.data?.total ?? 0,
    error: result.error
  }
}

export async function saveStatutoryHoliday(params: StatutoryHolidaySavePayload) {
  return await responseHandle<string>(
    () =>
      supabase.rpc('smis_save_statutory_holiday_secure', {
        p_id: params.id ?? null,
        p_payload: keysToSnakeDeep(omit(params, ['id']))
      }),
    {
      showMessage: true,
      breakReturn: true,
      message: params.id ? '节假日安排已更新' : '节假日安排已新增'
    }
  )
}

export async function deleteStatutoryHolidays(ids: string[]) {
  return await responseHandle<number>(
    () => supabase.rpc('smis_delete_statutory_holidays_secure', { p_ids: ids }),
    { showMessage: true, breakReturn: true, message: '节假日安排已删除' }
  )
}
