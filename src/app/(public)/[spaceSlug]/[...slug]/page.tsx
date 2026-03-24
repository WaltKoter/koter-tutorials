import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  findPageByPath,
  getPageBreadcrumbs,
  getPagePath,
  buildTree,
  flattenTree,
  getLinearPageOrder,
} from "@/lib/tree";
import type { FlatPage } from "@/lib/tree";
import { DocsBreadcrumbs } from "@/components/docs/docs-breadcrumbs";
import { DocsPagination } from "@/components/docs/docs-pagination";
import { DocsToc } from "@/components/docs/docs-toc";
import { PlateViewer } from "@/components/editor/plate-viewer";

export const revalidate = 60;

export default async function DocsPage({
  params,
}: {
  params: Promise<{ spaceSlug: string; slug: string[] }>;
}) {
  const { spaceSlug, slug } = await params;

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

  const currentPage = findPageByPath(slug, flatPages);

  if (!currentPage) {
    notFound();
  }

  const fullPage = await prisma.page.findUnique({
    where: { id: currentPage.id },
  });

  if (!fullPage) {
    notFound();
  }

  const breadcrumbs = getPageBreadcrumbs(currentPage.id, flatPages);
  const tree = buildTree(flatPages);
  const linearOrder = getLinearPageOrder(tree);
  const currentIndex = linearOrder.indexOf(currentPage.id);

  let prevPage: { title: string; path: string } | null = null;
  let nextPage: { title: string; path: string } | null = null;

  if (currentIndex > 0) {
    const prevId = linearOrder[currentIndex - 1];
    const prev = flatPages.find((p) => p.id === prevId);
    if (prev) {
      const prevPath = getPagePath(prev.id, flatPages);
      prevPage = {
        title: prev.title,
        path: `/${spaceSlug}/${prevPath.join("/")}`,
      };
    }
  }

  if (currentIndex < linearOrder.length - 1) {
    const nextId = linearOrder[currentIndex + 1];
    const next = flatPages.find((p) => p.id === nextId);
    if (next) {
      const nextPath = getPagePath(next.id, flatPages);
      nextPage = {
        title: next.title,
        path: `/${spaceSlug}/${nextPath.join("/")}`,
      };
    }
  }

  const content = fullPage.content as unknown[];

  return (
    <div className="flex flex-1 gap-0">
      <div className="flex-1 min-w-0 px-4 py-6 lg:px-8 lg:py-8 max-w-3xl mx-auto w-full">
        <DocsBreadcrumbs
          spaceName={space.name}
          spaceSlug={spaceSlug}
          breadcrumbs={breadcrumbs}
        />

        <h1 className="mt-4 text-3xl font-bold tracking-tight lg:text-4xl">
          {fullPage.title}
        </h1>

        <div className="mt-6">
          <PlateViewer content={content} />
        </div>

        <DocsPagination prevPage={prevPage} nextPage={nextPage} />
      </div>

      <div className="hidden xl:block w-56 shrink-0">
        <div className="sticky top-14 py-8 pr-4">
          <DocsToc content={content} />
        </div>
      </div>
    </div>
  );
}
