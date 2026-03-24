export interface TreeNode {
  id: string;
  title: string;
  slug: string;
  icon: string | null;
  parentId: string | null;
  order: number;
  status: "DRAFT" | "PUBLISHED";
  children: TreeNode[];
}

export interface FlatPage {
  id: string;
  title: string;
  slug: string;
  icon: string | null;
  parentId: string | null;
  order: number;
  status: "DRAFT" | "PUBLISHED";
}

export function buildTree(pages: FlatPage[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  for (const page of pages) {
    map.set(page.id, { ...page, children: [] });
  }

  for (const page of pages) {
    const node = map.get(page.id)!;
    if (page.parentId && map.has(page.parentId)) {
      map.get(page.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortChildren = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => a.order - b.order);
    for (const node of nodes) {
      sortChildren(node.children);
    }
  };

  sortChildren(roots);
  return roots;
}

export function flattenTree(tree: TreeNode[]): FlatPage[] {
  const result: FlatPage[] = [];

  const walk = (nodes: TreeNode[]) => {
    for (const node of nodes) {
      result.push({
        id: node.id,
        title: node.title,
        slug: node.slug,
        icon: node.icon,
        parentId: node.parentId,
        order: node.order,
        status: node.status,
      });
      walk(node.children);
    }
  };

  walk(tree);
  return result;
}

export function getPagePath(pageId: string, pages: FlatPage[]): string[] {
  const pageMap = new Map(pages.map((p) => [p.id, p]));
  const path: string[] = [];
  let current = pageMap.get(pageId);

  while (current) {
    path.unshift(current.slug);
    current = current.parentId ? pageMap.get(current.parentId) : undefined;
  }

  return path;
}

export function getPageBreadcrumbs(
  pageId: string,
  pages: FlatPage[]
): FlatPage[] {
  const pageMap = new Map(pages.map((p) => [p.id, p]));
  const breadcrumbs: FlatPage[] = [];
  let current = pageMap.get(pageId);

  while (current) {
    breadcrumbs.unshift(current);
    current = current.parentId ? pageMap.get(current.parentId) : undefined;
  }

  return breadcrumbs;
}

export function findPageByPath(
  slugPath: string[],
  pages: FlatPage[]
): FlatPage | null {
  const tree = buildTree(pages);

  let currentLevel = tree;
  let found: TreeNode | null = null;

  for (const slug of slugPath) {
    found = currentLevel.find((n) => n.slug === slug) || null;
    if (!found) return null;
    currentLevel = found.children;
  }

  return found
    ? {
        id: found.id,
        title: found.title,
        slug: found.slug,
        icon: found.icon,
        parentId: found.parentId,
        order: found.order,
        status: found.status,
      }
    : null;
}

export function getLinearPageOrder(tree: TreeNode[]): string[] {
  const result: string[] = [];
  const walk = (nodes: TreeNode[]) => {
    for (const node of nodes) {
      result.push(node.id);
      walk(node.children);
    }
  };
  walk(tree);
  return result;
}
