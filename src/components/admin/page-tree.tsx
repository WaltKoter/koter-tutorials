"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageTreeItem } from "@/components/admin/page-tree-item";
import { CreatePageDialog } from "@/components/admin/create-page-dialog";
import { buildTree, type FlatPage } from "@/lib/tree";

interface PageTreeProps {
  pages: FlatPage[];
  spaceSlug: string;
  spaceId: string;
}

export function PageTree({ pages, spaceSlug, spaceId }: PageTreeProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [parentId, setParentId] = useState<string | null>(null);

  const tree = buildTree(pages);

  function handleCreateChild(pid: string | null) {
    setParentId(pid);
    setCreateOpen(true);
  }

  return (
    <div className="py-2">
      <div className="px-3 mb-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          onClick={() => handleCreateChild(null)}
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          New Page
        </Button>
      </div>

      <div className="space-y-0.5">
        {tree.map((node) => (
          <PageTreeItem
            key={node.id}
            node={node}
            spaceSlug={spaceSlug}
            spaceId={spaceId}
            depth={0}
            onCreateChild={handleCreateChild}
            allPages={pages}
          />
        ))}
      </div>

      {tree.length === 0 && (
        <p className="px-4 py-6 text-xs text-center text-zinc-400 dark:text-zinc-500">
          No pages yet
        </p>
      )}

      <CreatePageDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        spaceId={spaceId}
        spaceSlug={spaceSlug}
        parentId={parentId}
        pages={pages}
      />
    </div>
  );
}
