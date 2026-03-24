import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DocsPaginationProps {
  prevPage: { title: string; path: string } | null;
  nextPage: { title: string; path: string } | null;
}

export function DocsPagination({ prevPage, nextPage }: DocsPaginationProps) {
  if (!prevPage && !nextPage) return null;

  return (
    <div className="mt-12 grid grid-cols-2 gap-4 border-t pt-6">
      {prevPage ? (
        <Link
          href={prevPage.path}
          className="group flex flex-col gap-1 rounded-lg border p-4 transition-colors hover:border-foreground/20 hover:bg-muted/50"
        >
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <ChevronLeft className="size-3" />
            Anterior
          </span>
          <span className="text-sm font-medium group-hover:text-foreground transition-colors">
            {prevPage.title}
          </span>
        </Link>
      ) : (
        <div />
      )}

      {nextPage ? (
        <Link
          href={nextPage.path}
          className="group flex flex-col items-end gap-1 rounded-lg border p-4 transition-colors hover:border-foreground/20 hover:bg-muted/50"
        >
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            Proximo
            <ChevronRight className="size-3" />
          </span>
          <span className="text-sm font-medium group-hover:text-foreground transition-colors">
            {nextPage.title}
          </span>
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}
