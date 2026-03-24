export interface SpaceWithCount {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  primaryColor: string;
  accentColor: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count: { pages: number };
}

export interface PageData {
  id: string;
  title: string;
  slug: string;
  content: unknown;
  parentId: string | null;
  order: number;
  status: "DRAFT" | "PUBLISHED";
  icon: string | null;
  spaceId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PageTreeItem {
  id: string;
  title: string;
  slug: string;
  parentId: string | null;
  order: number;
  status: "DRAFT" | "PUBLISHED";
  icon: string | null;
}
