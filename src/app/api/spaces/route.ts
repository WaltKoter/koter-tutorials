import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import slugify from "slugify";

export async function GET() {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const spaces = await prisma.space.findMany({
    include: {
      _count: {
        select: { pages: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(spaces);
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, description } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const slug = slugify(name, { lower: true, strict: true });

    const space = await prisma.space.create({
      data: {
        name,
        slug,
        description: description || null,
      },
    });

    return NextResponse.json(space, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create space" },
      { status: 500 }
    );
  }
}
