import type {
  WorkInstructionOrganization,
  WorkInstructionPosition,
  WorkInstructionPositionTree
} from '@smis/api'

export type WorkInstructionTreeNodeType = 'organization' | 'position'

export interface WorkInstructionTreeNode {
  [key: string]: unknown
  key: string
  label: string
  description: string
  nodeType: WorkInstructionTreeNodeType
  organizationId: string
  positionId?: string
  organizationCode?: string
  positionCode?: string
  employeeCount?: number
  instructionCount?: number
  disabled?: boolean
  children?: WorkInstructionTreeNode[]
}

export function buildWorkInstructionTree(
  source: WorkInstructionPositionTree
): WorkInstructionTreeNode[] {
  const organizationMap = new Map<string, WorkInstructionTreeNode>()
  const roots: WorkInstructionTreeNode[] = []

  const sortedOrganizations = [...source.organizations].sort(compareOrganization)
  sortedOrganizations.forEach((organization) => {
    organizationMap.set(organization.id, {
      key: `org:${organization.id}`,
      label: organization.organizationName,
      description: organization.organizationCode,
      nodeType: 'organization',
      organizationId: organization.id,
      organizationCode: organization.organizationCode,
      disabled: true,
      children: []
    })
  })

  sortedOrganizations.forEach((organization) => {
    const node = organizationMap.get(organization.id)
    if (!node) return
    const parent = organization.parentId ? organizationMap.get(organization.parentId) : undefined
    if (parent) parent.children?.push(node)
    else roots.push(node)
  })

  source.positions.forEach((position) => {
    const parent = organizationMap.get(position.organizationId)
    if (!parent) return
    parent.children?.push(toPositionNode(position))
  })

  organizationMap.forEach((node) => {
    node.children?.sort((left, right) => {
      if (left.nodeType !== right.nodeType) return left.nodeType === 'organization' ? -1 : 1
      return left.label.localeCompare(right.label, 'zh-CN')
    })
  })

  return roots
}

export function flattenWorkInstructionTree(
  nodes: WorkInstructionTreeNode[]
): WorkInstructionTreeNode[] {
  return nodes.flatMap((node) => [node, ...flattenWorkInstructionTree(node.children ?? [])])
}

function compareOrganization(
  left: WorkInstructionOrganization,
  right: WorkInstructionOrganization
): number {
  return (
    left.sort - right.sort || left.organizationName.localeCompare(right.organizationName, 'zh-CN')
  )
}

function toPositionNode(position: WorkInstructionPosition): WorkInstructionTreeNode {
  return {
    key: position.scopeKey,
    label: position.positionName,
    description: `${position.positionCode} · ${position.employeeCount} 人在岗`,
    nodeType: 'position',
    organizationId: position.organizationId,
    positionId: position.positionId,
    positionCode: position.positionCode,
    employeeCount: position.employeeCount,
    instructionCount: position.instructionCount,
    disabled: false
  }
}
