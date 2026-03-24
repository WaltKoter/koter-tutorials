import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { PageEditorClient } from "./page-editor-client";

export default async function PageEditorPage({
  params,
}: {
  params: Promise<{ spaceSlug: string; pageId: string }>;
}) {
  try {
    await requireAuth();
  } catch {
    redirect("/admin/login");
  }

  const { spaceSlug, pageId } = await params;

  const page = await prisma.page.findUnique({
    where: { id: pageId },
    include: { space: { select: { id: true, slug: true, name: true } } },
  });

  if (!page || page.space.slug !== spaceSlug) notFound();

  return (
    <PageEditorClient
      page={{
        id: page.id,
        title: page.title,
        slug: page.slug,
        status: page.status,
        content: page.content as any,
      }}
      space={{
        id: page.space.id,
        slug: page.space.slug,
        name: page.space.name,
      }}
    />
  );
}
