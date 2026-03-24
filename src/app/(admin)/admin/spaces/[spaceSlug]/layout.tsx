import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-header";
import { SpaceLayoutClient } from "@/components/admin/space-layout-client";

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
      <SpaceLayoutClient
        space={{ id: space.id, name: space.name, slug: space.slug }}
        initialPages={space.pages}
      >
        {children}
      </SpaceLayoutClient>
    </div>
  );
}
