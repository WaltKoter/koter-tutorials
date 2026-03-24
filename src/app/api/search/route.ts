import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get("q");
  const spaceId = searchParams.get("spaceId");

  if (!q) {
    return NextResponse.json(
      { error: "Search query is required" },
      { status: 400 }
    );
  }

  const pages = await prisma.page.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        {
          title: {
            contains: q,
            mode: "insensitive",
          },
        },
        {
          searchText: {
            contains: q,
            mode: "insensitive",
          },
        },
      ],
      ...(spaceId ? { spaceId } : {}),
    },
    select: {
      id: true,
      title: true,
      slug: true,
      spaceId: true,
    },
  });

  return NextResponse.json(pages);
}
