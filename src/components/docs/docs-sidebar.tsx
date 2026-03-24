"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { buildTree, type FlatPage, type TreeNode } from "@/lib/tree";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/docs/theme-toggle";
import {
  FileText,
  ChevronRight,
  ChevronDown,
  Menu,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface DocsSidebarProps {
  space: {
    name: string;
    slug: string;
    logoUrl: string | null;
    accentColor: string;
  };
  pages: FlatPage[];
}

const SidebarContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
}>({ open: false, setOpen: () => {} });

export function DocsSidebar({ space, pages }: DocsSidebarProps) {
  const [open, setOpen] = React.useState(false);
  const isMobile = useIsMobile();
  const tree = buildTree(pages);

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        {space.logoUrl ? (
          <img
            src={space.logoUrl}
            alt={space.name}
            className="size-6 rounded"
          />
        ) : (
          <div
            className="flex size-6 items-center justify-center rounded text-white text-xs font-bold"
            style={{ backgroundColor: space.accentColor }}
          >
            {space.name.charAt(0).toUpperCase()}
          </div>
        )}
        <Link
          href={`/${space.slug}`}
          className="font-semibold text-sm truncate hover:text-foreground/80 transition-colors"
        >
          {space.name}
        </Link>
      </div>

      <ScrollArea className="flex-1 px-2 py-2">
        <nav className="flex flex-col gap-0.5">
          {tree.map((node) => (
            <SidebarNode
              key={node.id}
              node={node}
              spaceSlug={space.slug}
              pages={pages}
              depth={0}
            />
          ))}
        </nav>
      </ScrollArea>

      <div className="flex items-center justify-between border-t px-4 py-2">
        <span className="text-xs text-muted-foreground">
          Koter Tutorials
        </span>
        <ThemeToggle />
      </div>
    </div>
  );

  return (
    <SidebarContext.Provider value={{ open, setOpen }}>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r bg-card">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar */}
      {isMobile && (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="left" className="w-72 p-0">
            <SheetTitle className="sr-only">Navegacao</SheetTitle>
            {sidebarContent}
          </SheetContent>
        </Sheet>
      )}
    </SidebarContext.Provider>
  );
}

DocsSidebar.MobileToggle = function MobileToggle() {
  const { setOpen } = React.useContext(SidebarContext);

  return (
    <Button
      variant="ghost"
      size="icon"
      className="lg:hidden"
      onClick={() => setOpen(true)}
      aria-label="Abrir menu"
    >
      <Menu className="size-5" />
    </Button>
  );
};

function getNodePath(
  nodeId: string,
  pages: FlatPage[]
): string {
  const path: string[] = [];
  const map = new Map(pages.map((p) => [p.id, p]));
  let current = map.get(nodeId);

  while (current) {
    path.unshift(current.slug);
    current = current.parentId ? map.get(current.parentId) : undefined;
  }

  return path.join("/");
}

function SidebarNode({
  node,
  spaceSlug,
  pages,
  depth,
}: {
  node: TreeNode;
  spaceSlug: string;
  pages: FlatPage[];
  depth: number;
}) {
  const pathname = usePathname();
  const { setOpen } = React.useContext(SidebarContext);
  const nodePath = getNodePath(node.id, pages);
  const href = `/${spaceSlug}/${nodePath}`;
  const isActive = pathname === href;
  const hasChildren = node.children.length > 0;
  const isParentOfActive = hasChildren && pathname.startsWith(href + "/");
  const [expanded, setExpanded] = React.useState(isActive || isParentOfActive);

  React.useEffect(() => {
    if (isActive || isParentOfActive) {
      setExpanded(true);
    }
  }, [isActive, isParentOfActive]);

  return (
    <div>
      <div
        className={cn(
          "group flex items-center gap-1 rounded-md text-sm transition-colors",
          isActive
            ? "bg-accent text-accent-foreground font-medium"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.preventDefault();
              setExpanded(!expanded);
            }}
            className="flex size-5 items-center justify-center rounded hover:bg-muted-foreground/10"
            aria-label={expanded ? "Recolher" : "Expandir"}
          >
            {expanded ? (
              <ChevronDown className="size-3.5" />
            ) : (
              <ChevronRight className="size-3.5" />
            )}
          </button>
        )}
        <Link
          href={href}
          onClick={() => setOpen(false)}
          className={cn(
            "flex flex-1 items-center gap-2 py-1.5 pr-2",
            !hasChildren && "pl-1"
          )}
        >
          {node.icon ? (
            <span className="text-sm">{node.icon}</span>
          ) : (
            <FileText className="size-3.5 shrink-0 opacity-60" />
          )}
          <span className="truncate">{node.title}</span>
        </Link>
      </div>

      {hasChildren && expanded && (
        <div className="mt-0.5">
          {node.children.map((child) => (
            <SidebarNode
              key={child.id}
              node={child}
              spaceSlug={spaceSlug}
              pages={pages}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
