"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PlateEditor } from "@/components/editor/plate-editor";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

  const handleSave = useCallback(async (content: any) => {
    const res = await fetch(`/api/spaces/${space.id}/pages/${page.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    if (!res.ok) {
      throw new Error("Failed to save");
    }
  }, [space.id, page.id]);

  const handleToggleStatus = async () => {
    const newStatus = status === "published" ? "draft" : "published";
    setTogglingStatus(true);

    try {
      const res = await fetch(`/api/spaces/${space.id}/pages/${page.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setStatus(newStatus);
      }
    } catch (error) {
      console.error("Failed to toggle status:", error);
    } finally {
      setTogglingStatus(false);
    }
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
            <h1 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {page.title}
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              /{space.slug}/{page.slug}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant={status === "published" ? "default" : "secondary"}
            className="text-xs"
          >
            {status === "published" ? "Publicado" : "Rascunho"}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleStatus}
            disabled={togglingStatus}
          >
            {status === "published" ? "Despublicar" : "Publicar"}
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
