export interface UnilevelTreeNode {
  id: number;
  phone: string;
  email: string;
  level: number;
  father: number | null;
  imageProfileUrl: string | null;
}

export interface UnilevelTreeResponse {
  tree: UnilevelTreeNode[];
  totalNodes: number;
  maxLevel: number;
}
