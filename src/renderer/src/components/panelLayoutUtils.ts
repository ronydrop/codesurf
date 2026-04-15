// ─── Panel tree types ────────────────────────────────────────────────────────

export interface PanelLeaf {
  type: 'leaf'
  id: string
  tabs: string[]
  activeTab: string
}

export interface PanelSplit {
  type: 'split'
  id: string
  direction: 'horizontal' | 'vertical'
  children: PanelNode[]
  sizes: number[]
}

export type PanelNode = PanelLeaf | PanelSplit

export type DockZone = 'left' | 'right' | 'top' | 'bottom' | 'center'

// ─── Helpers ─────────────────────────────────────────────────────────────────

let panelCounter = 0
export const newPanelId = (): string => `panel-${Date.now()}-${panelCounter++}`

export function createLeaf(tileIds: string[], activeTab?: string): PanelLeaf {
  return { type: 'leaf', id: newPanelId(), tabs: tileIds, activeTab: activeTab ?? tileIds[0] ?? '' }
}

export function findLeafByTileId(node: PanelNode, tileId: string): PanelLeaf | null {
  if (node.type === 'leaf') return node.tabs.includes(tileId) ? node : null
  for (const child of node.children) {
    const found = findLeafByTileId(child, tileId)
    if (found) return found
  }
  return null
}

export function findLeafById(node: PanelNode, panelId: string): PanelLeaf | null {
  if (node.type === 'leaf') return node.id === panelId ? node : null
  for (const child of node.children) {
    const found = findLeafById(child, panelId)
    if (found) return found
  }
  return null
}

export function getAllTileIds(node: PanelNode): string[] {
  if (node.type === 'leaf') return [...node.tabs]
  return node.children.flatMap(getAllTileIds)
}

export function removeTileFromTree(node: PanelNode, tileId: string): PanelNode | null {
  if (node.type === 'leaf') {
    const newTabs = node.tabs.filter(id => id !== tileId)
    if (newTabs.length === 0) return null
    return { ...node, tabs: newTabs, activeTab: node.activeTab === tileId ? newTabs[0] : node.activeTab }
  }
  const newChildren: PanelNode[] = []
  const newSizes: number[] = []
  for (let i = 0; i < node.children.length; i++) {
    const result = removeTileFromTree(node.children[i], tileId)
    if (result) { newChildren.push(result); newSizes.push(node.sizes[i]) }
  }
  if (newChildren.length === 0) return null
  if (newChildren.length === 1) return newChildren[0]
  const total = newSizes.reduce((a, b) => a + b, 0)
  return { ...node, children: newChildren, sizes: newSizes.map(s => (s / total) * 100) }
}

export function addTabToLeaf(node: PanelNode, panelId: string, tileId: string): PanelNode {
  if (node.type === 'leaf') {
    if (node.id !== panelId) return node
    if (node.tabs.includes(tileId)) return { ...node, activeTab: tileId }
    return { ...node, tabs: [...node.tabs, tileId], activeTab: tileId }
  }
  return { ...node, children: node.children.map(c => addTabToLeaf(c, panelId, tileId)) }
}

export function setActiveTab(node: PanelNode, panelId: string, tileId: string): PanelNode {
  if (node.type === 'leaf') return node.id === panelId ? { ...node, activeTab: tileId } : node
  return { ...node, children: node.children.map(c => setActiveTab(c, panelId, tileId)) }
}

export function closeOthersInLeaf(root: PanelNode, panelId: string, keepId: string): PanelNode {
  const update = (n: PanelNode): PanelNode => {
    if (n.type === 'leaf') {
      if (n.id !== panelId) return n
      return { ...n, tabs: [keepId], activeTab: keepId }
    }
    return { ...n, children: n.children.map(update) }
  }
  return update(root)
}

export function closeToRightInLeaf(root: PanelNode, panelId: string, tileId: string): PanelNode {
  const update = (n: PanelNode): PanelNode => {
    if (n.type === 'leaf') {
      if (n.id !== panelId) return n
      const idx = n.tabs.indexOf(tileId)
      if (idx < 0) return n
      const newTabs = n.tabs.slice(0, idx + 1)
      return { ...n, tabs: newTabs, activeTab: newTabs.includes(n.activeTab) ? n.activeTab : tileId }
    }
    return { ...n, children: n.children.map(update) }
  }
  return update(root)
}

export function splitLeaf(node: PanelNode, targetPanelId: string, tileId: string, zone: DockZone): PanelNode {
  if (node.type === 'leaf') {
    if (node.id !== targetPanelId) return node
    if (zone === 'center') return addTabToLeaf(node, targetPanelId, tileId)
    const existingTabs = node.tabs.filter(id => id !== tileId)
    const existingLeaf: PanelLeaf = {
      ...node,
      tabs: existingTabs.length > 0 ? existingTabs : node.tabs,
      activeTab: existingTabs.length > 0 && node.activeTab === tileId ? existingTabs[0] : node.activeTab,
    }
    const newLeaf = createLeaf([tileId])
    const direction: 'horizontal' | 'vertical' = zone === 'left' || zone === 'right' ? 'horizontal' : 'vertical'
    const children: PanelNode[] = zone === 'left' || zone === 'top' ? [newLeaf, existingLeaf] : [existingLeaf, newLeaf]
    return { type: 'split', id: newPanelId(), direction, children, sizes: [50, 50] }
  }
  return { ...node, children: node.children.map(c => splitLeaf(c, targetPanelId, tileId, zone)) }
}
