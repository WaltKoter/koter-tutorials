import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

interface ReorderItem {
  id: string;
  parentId: string | null;
  order: number;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ spaceId: string }> }
) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Access params to validate the route, even though spaceId isn't
  // directly used in the update query (pages are identified by id)
  await params;

  try {
    const items: ReorderItem[] = await request.json();

    await prisma.$transaction(
      items.map((item) =>
        prisma.page.update({
          where: { id: item.id },
          data: {
            parentId: item.parentId,
            order: item.order,
          },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to reorder pages" },
      { status: 500 }
    );
  }
}
