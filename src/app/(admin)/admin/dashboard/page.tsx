"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminHeader } from "@/components/admin/admin-header";
import { SpaceCard } from "@/components/admin/space-card";
import { CreateSpaceDialog } from "@/components/admin/create-space-dialog";
import type { SpaceWithCount } from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  const [spaces, setSpaces] = useState<SpaceWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  async function fetchSpaces() {
    try {
      const res = await fetch("/api/spaces");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      if (!res.ok) throw new Error("Falha ao carregar espaços");
      const data = await res.json();
      setSpaces(data);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Falha ao carregar espaços"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSpaces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/spaces/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Falha ao excluir espaço");
      toast.success("Espaço excluído");
      fetchSpaces();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Falha ao excluir espaço"
      );
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <AdminHeader />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Espaços
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Gerencie seus espaços de tutoriais
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-1.5" />
            Criar Espaço
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-40 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 animate-pulse"
              />
            ))}
          </div>
        ) : spaces.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-zinc-500 dark:text-zinc-400 mb-4">
              Nenhum espaço ainda. Crie o primeiro para começar.
            </p>
            <Button onClick={() => setCreateOpen(true)} variant="outline">
              <Plus className="h-4 w-4 mr-1.5" />
              Criar Espaço
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {spaces.map((space) => (
              <SpaceCard
                key={space.id}
                space={space}
                onDelete={() => handleDelete(space.id)}
              />
            ))}
          </div>
        )}

        <CreateSpaceDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          onCreated={fetchSpaces}
        />
      </main>
    </div>
  );
}
