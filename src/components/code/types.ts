/** 文件树节点（children 为 null 表示目录尚未懒加载） */
export interface TreeNode {
  name: string
  path: string
  type: string
  children: TreeNode[] | null
  expanded: boolean
  loading: boolean
}
