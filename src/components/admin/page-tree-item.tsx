"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import {
  FileText,
  ChevronRight,
  ChevronDown,
  Plus,
  MoreHorizontal,
  Trash2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TreeNode } from "@/lib/tree";
import { usePages } from "@/contexts/pages-context";

interface PageTreeItemProps {
  node: TreeNode;
  spaceSlug: string;
  spaceId: string;
  depth: number;
  onCreateChild: (parentId: string | null) => void;
}

export function PageTreeItem({
  node,
  spaceSlug,
  spaceId,
  depth,
  onCreateChild,
}: PageTreeItemProps) {
  const router = useRouter();
  const params = useParams<{ pageId?: string }>();
  const [expanded, setExpanded] = useState(true);
  const { pages, updatePage, removePage, refreshPages, addPage } = usePages();

  const isActive = params.pageId === node.id;
  const hasChildren = node.children.length > 0;

  async function handleDelete() {
    if (!confirm(`Excluir "${node.title}"? Isso também excluirá todas as subpáginas.`))
      return;

    try {
      const res = await fetch(
        `/api/spaces/${spaceId}/pages/${node.id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Falha ao excluir página");
      toast.success("Página excluída");
      removePage(node.id);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Falha ao excluir página"
      );
    }
  }

  async function handleToggleStatus() {
    const newStatus = node.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      const res = await fetch(
        `/api/spaces/${spaceId}/pages/${node.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (!res.ok) throw new Error("Falha ao atualizar status");
      toast.success(`Página definida como ${newStatus === "DRAFT" ? "rascunho" : "publicada"}`);
      updatePage(node.id, { status: newStatus });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Falha ao atualizar status"
      );
    }
  }

  async function handleMove(direction: "up" | "down") {
    const siblings = pages.filter((p) => p.parentId === node.parentId);
    siblings.sort((a, b) => a.order - b.order);
    const currentIndex = siblings.findIndex((p) => p.id === node.id);

    const swapIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (swapIndex < 0 || swapIndex >= siblings.length) return;

    const swapPage = siblings[swapIndex];

    try {
      await fetch(`/api/spaces/${spaceId}/pages/${node.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: swapPage.order }),
      });
      await fetch(`/api/spaces/${spaceId}/pages/${swapPage.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: node.order }),
      });
      await refreshPages(spaceId);
    } catch {
      toast.error("Falha ao reordenar");
    }
  }

  async function handleDuplicate() {
    try {
      const res = await fetch(
        `/api/spaces/${spaceId}/pages/${node.id}/duplicate`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error("Falha ao duplicar página");
      const duplicated = await res.json();
      toast.success("Página duplicada");
      addPage({
        id: duplicated.id,
        title: duplicated.title,
        slug: duplicated.slug,
        icon: duplicated.icon,
        parentId: duplicated.parentId,
        order: duplicated.order,
        status: duplicated.status,
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Falha ao duplicar página"
      );
    }
  }

  return (
    <div>
      <div
        className={`group flex items-center gap-1 px-2 py-1 mx-1 rounded-md cursor-pointer transition-colors text-sm ${
          isActive
            ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="flex-shrink-0 p-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700"
          >
            {expanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>
        ) : (
          <span className="w-4.5 flex-shrink-0" />
        )}

        <div
          className="flex items-center gap-1.5 flex-1 min-w-0"
          onClick={() =>
            router.push(
              `/admin/spaces/${spaceSlug}/pages/${node.id}`
            )
          }
        >
          <FileText className="h-3.5 w-3.5 flex-shrink-0 text-zinc-400" />
          <span className="truncate text-sm">{node.title}</span>
          {node.status === "DRAFT" && (
            <span className="text-[10px] text-amber-500 flex-shrink-0">
              Rascunho
            </span>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 inline-flex items-center justify-center rounded-md hover:bg-muted"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onCreateChild(node.id)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar subpágina
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleToggleStatus}>
              {node.status === "PUBLISHED" ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Marcar como rascunho
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Publicar
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDuplicate}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleMove("up")}>
              <ArrowUp className="h-4 w-4 mr-2" />
              Mover para cima
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleMove("down")}>
              <ArrowDown className="h-4 w-4 mr-2" />
              Mover para baixo
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {hasChildren && expanded && (
        <div>
          {node.children.map((child) => (
            <PageTreeItem
              key={child.id}
              node={child}
              spaceSlug={spaceSlug}
              spaceId={spaceId}
              depth={depth + 1}
              onCreateChild={onCreateChild}
            />
          ))}
        </div>
      )}
    </div>
  );
}
