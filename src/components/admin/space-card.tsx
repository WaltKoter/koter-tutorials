"use client";

import { useRouter } from "next/navigation";
import { FileText, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { SpaceWithCount } from "@/types";

interface SpaceCardProps {
  space: SpaceWithCount;
  onDelete: () => void;
}

export function SpaceCard({ space, onDelete }: SpaceCardProps) {
  const router = useRouter();

  return (
    <Card
      className="group cursor-pointer transition-shadow hover:shadow-md border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
      onClick={() => router.push(`/admin/spaces/${space.slug}`)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-medium truncate text-zinc-900 dark:text-zinc-100">
              {space.name}
            </CardTitle>
            <CardDescription className="mt-1 line-clamp-2 text-sm">
              {space.description || "Sem descrição"}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center justify-center rounded-md hover:bg-muted"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/admin/spaces/${space.slug}/settings`);
                }}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
            <FileText className="h-3.5 w-3.5" />
            <span>
              {space._count.pages} {space._count.pages === 1 ? "página" : "páginas"}
            </span>
          </div>
          <Badge
            variant={space.published ? "default" : "secondary"}
            className={
              space.published
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-100"
                : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-100"
            }
          >
            {space.published ? "Publicado" : "Rascunho"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
