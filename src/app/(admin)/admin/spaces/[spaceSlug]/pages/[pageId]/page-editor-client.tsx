"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PlateEditor } from "@/components/editor/plate-editor";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePages } from "@/contexts/pages-context";

interface PageEditorClientProps {
  page: {
    id: string;
    title: string;
    slug: string;
    status: string;
    content: any;
  };
  space: {
    id: string;
    slug: string;
    name: string;
  };
}

export function PageEditorClient({ page, space }: PageEditorClientProps) {
  const [status, setStatus] = useState(page.status);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [title, setTitle] = useState(page.title);
  const [editingTitle, setEditingTitle] = useState(false);
  const { updatePage } = usePages();

  const handleSave = useCallback(async (content: any) => {
    const res = await fetch(`/api/spaces/${space.id}/pages/${page.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    if (!res.ok) {
      throw new Error("Falha ao salvar");
    }
  }, [space.id, page.id]);

  const handleToggleStatus = async () => {
    const newStatus = status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    setTogglingStatus(true);

    try {
      const res = await fetch(`/api/spaces/${space.id}/pages/${page.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setStatus(newStatus);
        updatePage(page.id, { status: newStatus as "DRAFT" | "PUBLISHED" });
      }
    } catch (error) {
      console.error("Falha ao alternar status:", error);
    } finally {
      setTogglingStatus(false);
    }
  };

  const handleTitleSave = async () => {
    if (!title.trim() || title === page.title) {
      setTitle(page.title);
      setEditingTitle(false);
      return;
    }

    try {
      const res = await fetch(`/api/spaces/${space.id}/pages/${page.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() }),
      });

      if (res.ok) {
        updatePage(page.id, { title: title.trim() });
      } else {
        setTitle(page.title);
      }
    } catch {
      setTitle(page.title);
    }
    setEditingTitle(false);
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/spaces/${space.slug}`}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            {editingTitle ? (
              <input
                className="text-sm font-medium text-zinc-900 dark:text-zinc-100 bg-transparent border-b border-zinc-300 dark:border-zinc-600 outline-none px-0 py-0"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleTitleSave();
                  if (e.key === "Escape") {
                    setTitle(page.title);
                    setEditingTitle(false);
                  }
                }}
                autoFocus
              />
            ) : (
              <h1
                className="text-sm font-medium text-zinc-900 dark:text-zinc-100 cursor-pointer hover:text-zinc-600 dark:hover:text-zinc-300"
                onClick={() => setEditingTitle(true)}
              >
                {title}
              </h1>
            )}
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              /{space.slug}/{page.slug}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant={status === "PUBLISHED" ? "default" : "secondary"}
            className="text-xs"
          >
            {status === "PUBLISHED" ? "Publicado" : "Rascunho"}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleStatus}
            disabled={togglingStatus}
          >
            {status === "PUBLISHED" ? "Despublicar" : "Publicar"}
          </Button>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-zinc-950">
        <div className="max-w-4xl mx-auto">
          <PlateEditor
            initialContent={page.content}
            onSave={handleSave}
          />
        </div>
      </div>
    </div>
  );
}
