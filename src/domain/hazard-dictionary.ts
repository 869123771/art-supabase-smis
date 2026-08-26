type DictionaryItem = Api.DataCenter.DictListItem & {
  cascadeParentId?: string | null
}

const getDictionaryItemLabel = (item?: DictionaryItem): string =>
  String(item?.label || item?.name || item?.value || '')

export const findDictionaryItem = (
  items: DictionaryItem[],
  value: unknown
): DictionaryItem | undefined => {
  const normalized = String(value ?? '').trim()
  if (!normalized) return undefined

  return items.find(
    (item) => item.value === normalized || item.label === normalized || item.name === normalized
  )
}

export const isChildDictionaryItem = (child: DictionaryItem, parent?: DictionaryItem): boolean => {
  if (!parent?.id) return false
  if (child.cascadeParentId) return String(child.cascadeParentId) === String(parent.id)
  if (child.parentId) return String(child.parentId) === String(parent.id)

  const legacyParentReferences = new Set([
    String(parent.value || ''),
    getDictionaryItemLabel(parent)
  ])
  return Boolean(child.remark && legacyParentReferences.has(child.remark))
}

export const getChildDictionaryItems = (
  items: DictionaryItem[],
  parent?: DictionaryItem
): DictionaryItem[] => items.filter((item) => isChildDictionaryItem(item, parent))

export const hasDictionaryParentReference = (
  item: DictionaryItem,
  allowLegacyRemark = false
): boolean => Boolean(item.cascadeParentId || item.parentId || (allowLegacyRemark && item.remark))
