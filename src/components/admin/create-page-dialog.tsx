"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePages } from "@/contexts/pages-context";

interface CreatePageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spaceId: string;
  spaceSlug: string;
  parentId: string | null;
}

export function CreatePageDialog({
  open,
  onOpenChange,
  spaceId,
  spaceSlug,
  parentId,
}: CreatePageDialogProps) {
  const router = useRouter();
  const { pages, addPage } = usePages();
  const [title, setTitle] = useState("");
  const [selectedParentId, setSelectedParentId] = useState<string>(
    parentId || "__none__"
  );
  const [loading, setLoading] = useState(false);

  // Sync parentId prop when dialog opens
  function handleOpenChange(isOpen: boolean) {
    if (isOpen) {
      setSelectedParentId(parentId || "__none__");
      setTitle("");
    }
    onOpenChange(isOpen);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/spaces/${spaceId}/pages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          parentId:
            selectedParentId === "__none__" ? null : selectedParentId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Falha ao criar página");
      }

      const page = await res.json();
      toast.success("Página criada");
      addPage({
        id: page.id,
        title: page.title,
        slug: page.slug,
        icon: page.icon,
        parentId: page.parentId,
        order: page.order,
        status: page.status,
      });
      setTitle("");
      onOpenChange(false);
      router.push(`/admin/spaces/${spaceSlug}/pages/${page.id}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Falha ao criar página"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Página</DialogTitle>
          <DialogDescription>
            Crie uma nova página neste espaço.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="page-title">Título</Label>
            <Input
              id="page-title"
              placeholder="Introdução"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="page-parent">Página Pai</Label>
            <Select
              value={selectedParentId}
              onValueChange={(v) => setSelectedParentId(v ?? "")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sem página pai (nível raiz)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">
                  Sem página pai (nível raiz)
                </SelectItem>
                {pages.map((page) => (
                  <SelectItem key={page.id} value={page.id}>
                    {page.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !title.trim()}>
              {loading ? "Criando..." : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
