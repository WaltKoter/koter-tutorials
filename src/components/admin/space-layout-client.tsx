"use client";

import { PagesProvider } from "@/contexts/pages-context";
import { PageTree } from "@/components/admin/page-tree";
import type { FlatPage } from "@/lib/tree";

interface SpaceLayoutClientProps {
  children: React.ReactNode;
  space: {
    id: string;
    name: string;
    slug: string;
  };
  initialPages: FlatPage[];
}

export function SpaceLayoutClient({ children, space, initialPages }: SpaceLayoutClientProps) {
  return (
    <PagesProvider initialPages={initialPages} spaceId={space.id}>
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
              {space.name}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              /{space.slug}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            <PageTree
              spaceSlug={space.slug}
              spaceId={space.id}
            />
          </div>
        </aside>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </PagesProvider>
  );
}
