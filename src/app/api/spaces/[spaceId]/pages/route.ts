import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import slugify from "slugify";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ spaceId: string }> }
) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { spaceId } = await params;

  const pages = await prisma.page.findMany({
    where: { spaceId },
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
  });

  return NextResponse.json(pages);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ spaceId: string }> }
) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { spaceId } = await params;

  try {
    const { title, parentId, icon } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const slug = slugify(title, { lower: true, strict: true });

    // Get the max order among siblings to place new page last
    const lastSibling = await prisma.page.findFirst({
      where: { spaceId, parentId: parentId || null },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const order = lastSibling ? lastSibling.order + 1 : 0;

    const page = await prisma.page.create({
      data: {
        title,
        slug,
        spaceId,
        parentId: parentId || null,
        icon: icon || null,
        order,
      },
    });

    return NextResponse.json(page, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create page" },
      { status: 500 }
    );
  }
}
