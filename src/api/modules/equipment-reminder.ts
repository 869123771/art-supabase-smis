import { useSupabase } from '@/hooks'
import type { SmisEquipmentReminderConfig, SmisEquipmentReminderDetail } from '@smis/api/types'

const { supabase, keysToSnakeDeep, responseHandle } = useSupabase()

export async function fetchEquipmentReminder(equipmentId: string) {
  return await responseHandle<SmisEquipmentReminderDetail>(
    () => supabase.rpc('smis_get_equipment_reminder_secure', { p_equipment_id: equipmentId }),
    { showErrorMessage: true }
  )
}

export async function saveEquipmentReminder(
  equipmentId: string,
  config: Omit<SmisEquipmentReminderConfig, 'id' | 'equipmentId' | 'responsible'>
) {
  return await responseHandle<string>(
    () =>
      supabase.rpc('smis_save_equipment_reminder_secure', {
        p_equipment_id: equipmentId,
        p_payload: keysToSnakeDeep(config)
      }),
    { showMessage: true, breakReturn: true, message: '设备提醒配置已保存' }
  )
}
