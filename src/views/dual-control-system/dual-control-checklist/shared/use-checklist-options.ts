import { computed, shallowRef } from 'vue'
import { storeToRefs } from 'pinia'
import { fetchGetOrganizationTree } from '@/api/system-manage'
import { useUserStore } from '@/store/modules/user'
import TreeUtils from '@/utils/tree'

type Organization = Api.SystemManage.OrganizationListItem

const frequencyUnitLabels: Record<string, string> = {
  shift: '班',
  day: '日',
  week: '周',
  month: '月',
  quarter: '季度',
  year: '年',
  ten_day: '旬'
}

export const formatChecklistFrequency = (count: number, unit: string): string =>
  `${Math.max(count || 1, 1)}${frequencyUnitLabels[unit] || unit}1次`

export function useChecklistOptions(dictionaryCodes: readonly string[] = []) {
  const userStore = useUserStore()
  const { getDictMap } = storeToRefs(userStore)
  const organizationTree = shallowRef<Organization[]>([])
  const treeUtils = new TreeUtils({ idKey: 'id', parentKey: 'parentId', childrenKey: 'children' })

  const flatOrganizations = computed(() => treeUtils.treeToList(organizationTree.value))
  const organizationTreeProps = {
    children: 'children',
    label: 'organizationName',
    value: 'id'
  }
  const dictionaryOptions = (code: string) =>
    (getDictMap.value[code] ?? []).map((item) => ({
      label: item.label || item.name,
      value: item.value
    }))
  const dictionaryLabel = (code: string, value?: string | null): string =>
    value ? dictionaryOptions(code).find((item) => item.value === value)?.label || value : '—'
  const loadOptions = async (): Promise<void> => {
    const [organizationResponse] = await Promise.all([
      fetchGetOrganizationTree({ status: '1' }),
      ...dictionaryCodes.map((code) => userStore.ensureDictLoaded(code))
    ])
    organizationTree.value = organizationResponse.data ?? []
  }

  return {
    organizationTree,
    flatOrganizations,
    organizationTreeProps,
    dictionaryOptions,
    dictionaryLabel,
    loadOptions
  }
}
