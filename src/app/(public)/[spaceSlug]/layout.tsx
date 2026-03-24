import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { DocsSidebar } from "@/components/docs/docs-sidebar";
import { DocsSearch } from "@/components/docs/docs-search";
import type { FlatPage } from "@/lib/tree";

export default async function SpaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ spaceSlug: string }>;
}) {
  const { spaceSlug } = await params;

  const space = await prisma.space.findUnique({
    where: { slug: spaceSlug, published: true },
  });

  if (!space) {
    notFound();
  }

  const pages = await prisma.page.findMany({
    where: { spaceId: space.id, status: "PUBLISHED" },
    select: {
      id: true,
      title: true,
      slug: true,
      icon: true,
      parentId: true,
      order: true,
      status: true,
    },
    orderBy: { order: "asc" },
  });

  const flatPages: FlatPage[] = pages.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    icon: p.icon,
    parentId: p.parentId,
    order: p.order,
    status: p.status as "DRAFT" | "PUBLISHED",
  }));

  return (
    <div className="flex min-h-screen">
      <DocsSidebar
        space={{
          name: space.name,
          slug: space.slug,
          logoUrl: space.logoUrl,
          accentColor: space.accentColor,
        }}
        pages={flatPages}
      />
      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/60 lg:px-6">
          <DocsSidebar.MobileToggle />
          <div className="flex-1" />
          <DocsSearch spaceId={space.id} spaceSlug={space.slug} />
        </header>
        <main className="flex flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
