import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PageTree } from "@/components/admin/page-tree";
import { AdminHeader } from "@/components/admin/admin-header";

export default async function SpaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ spaceSlug: string }>;
}) {
  try {
    await requireAuth();
  } catch {
    redirect("/admin/login");
  }

  const { spaceSlug } = await params;

  const space = await prisma.space.findUnique({
    where: { slug: spaceSlug },
    include: {
      pages: {
        select: {
          id: true,
          title: true,
          slug: true,
          parentId: true,
          order: true,
          status: true,
          icon: true,
        },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!space) notFound();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      <AdminHeader />
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
              {space.name}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              /{space.slug}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            <PageTree
              pages={space.pages}
              spaceSlug={space.slug}
              spaceId={space.id}
            />
          </div>
        </aside>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
