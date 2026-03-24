import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ spaceId: string; pageId: string }> }
) {
  try { await requireAuth(); } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }

  const { spaceId, pageId } = await params;

  const original = await prisma.page.findUnique({ where: { id: pageId } });
  if (!original || original.spaceId !== spaceId) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  // Find next order
  const maxOrder = await prisma.page.aggregate({
    where: { spaceId, parentId: original.parentId },
    _max: { order: true },
  });

  const duplicate = await prisma.page.create({
    data: {
      title: `Cópia de ${original.title}`,
      slug: `${original.slug}-copia-${Date.now()}`,
      content: original.content as any,
      parentId: original.parentId,
      order: (maxOrder._max.order ?? 0) + 1,
      status: "DRAFT",
      icon: original.icon,
      spaceId,
    },
  });

  return NextResponse.json(duplicate, { status: 201 });
}
