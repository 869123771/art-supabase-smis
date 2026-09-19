import TreeUtils from '@/utils/tree'

interface OrganizationTreeNode {
  id: string
  parentId?: string | null
  organizationName: string
  sort?: number
}

const organizationTree = new TreeUtils({
  idKey: 'id',
  parentKey: 'parentId',
  childrenKey: 'children'
})

export function buildOrganizationTree<T extends OrganizationTreeNode>(rows: T[]): T[] {
  return organizationTree.listToTree(rows, (left, right) => {
    const sortDifference = (left.sort ?? 0) - (right.sort ?? 0)
    return sortDifference || left.organizationName.localeCompare(right.organizationName, 'zh-CN')
  })
}
