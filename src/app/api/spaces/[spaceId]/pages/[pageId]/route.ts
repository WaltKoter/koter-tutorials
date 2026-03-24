import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ spaceId: string; pageId: string }> }
) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { spaceId, pageId } = await params;

  const page = await prisma.page.findFirst({
    where: { id: pageId, spaceId },
  });

  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  return NextResponse.json(page);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ spaceId: string; pageId: string }> }
) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { spaceId, pageId } = await params;

  try {
    const data = await request.json();

    const allowedFields = [
      "title",
      "slug",
      "content",
      "status",
      "icon",
      "parentId",
      "order",
    ];
    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in data) {
        updateData[field] = data[field];
      }
    }

    // Extract searchText from content when content is updated
    if ("content" in data && Array.isArray(data.content)) {
      function extractText(nodes: any[]): string {
        return nodes.map((node: any) => {
          if (node.text) return node.text;
          if (node.children) return extractText(node.children);
          return "";
        }).join(" ").trim();
      }
      updateData.searchText = extractText(data.content);
    }

    const page = await prisma.page.update({
      where: { id: pageId, spaceId },
      data: updateData,
    });

    return NextResponse.json(page);
  } catch {
    return NextResponse.json(
      { error: "Failed to update page" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ spaceId: string; pageId: string }> }
) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { spaceId, pageId } = await params;

  try {
    await prisma.page.delete({
      where: { id: pageId, spaceId },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete page" },
      { status: 500 }
    );
  }
}
