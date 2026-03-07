import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/collections/[id]/posts — Get ordered posts in a collection
// Accepts collection ID (UUID) or slug
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const UUID_REGEX =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isUuid = UUID_REGEX.test(id);

    const collection = await prisma.collection.findFirst({
      where: isUuid ? { OR: [{ id }, { slug: id }] } : { slug: id },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        items: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            order: true,
            post: {
              select: {
                id: true,
                title: true,
                slug: true,
                meta: true,
                thumbnailUrl: true,
                createdAt: true,
                author: {
                  select: { id: true, name: true },
                },
                category: {
                  select: { id: true, name: true, slug: true },
                },
              },
            },
          },
        },
      },
    });

    if (!collection) {
      return NextResponse.json(
        { success: false, error: "Collection not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: collection });
  } catch (error) {
    console.error("GET /api/collections/[id]/posts error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch collection posts" },
      { status: 500 },
    );
  }
}
