import TreeUtils from '@/utils/tree'

export interface DualControlOrganizationNode {
  id: string
  parentId?: string | null
  organizationCode: string
  organizationName: string
  organizationType?: string
  sort?: number
  children?: DualControlOrganizationNode[]
}

const organizationTree = new TreeUtils({
  idKey: 'id',
  parentKey: 'parentId',
  childrenKey: 'children'
})

/**
 * Normalize organization data from either flat API records or an existing tree.
 * Keeping this conversion at the dual-control boundary prevents individual pages
 * from silently degrading hierarchy into a flat list.
 */
export const toDualControlOrganizationTree = <T extends DualControlOrganizationNode>(
  organizations: T[]
): T[] => {
  const normalized = organizationTree.normalizeTreeData<T>(organizations)
  const flattened = organizationTree.treeToList<T>(normalized)

  return organizationTree.listToTree<T>(flattened, (left, right) => {
    const sortDifference = Number(left.sort ?? 0) - Number(right.sort ?? 0)
    return sortDifference || left.organizationName.localeCompare(right.organizationName, 'zh-CN')
  })
}

export const findDualControlOrganization = <T extends DualControlOrganizationNode>(
  organizations: T[],
  id: string
): T | null => organizationTree.findNode<T>(organizations, id)
