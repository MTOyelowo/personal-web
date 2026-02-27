import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-middleware";
import { Prisma } from "@/prisma/generated/prisma/client";

// UUID v4 pattern for safe querying against @db.Uuid columns
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/collections/[id] — Public: get a collection by ID or slug (with items)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const isUuid = UUID_REGEX.test(id);

    const collection = await prisma.collection.findFirst({
      where: isUuid ? { OR: [{ id }, { slug: id }] } : { slug: id },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        items: {
          orderBy: { order: "asc" },
          include: {
            post: {
              select: {
                id: true,
                title: true,
                slug: true,
                meta: true,
                thumbnailUrl: true,
                createdAt: true,
                author: { select: { id: true, name: true } },
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
    console.error("GET /api/collections/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch collection" },
      { status: 500 },
    );
  }
}

// PATCH /api/collections/[id] — Admin: update collection metadata
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;
    const { title, slug, description, coverUrl, categoryId, order } =
      await request.json();

    const updateData: Prisma.CollectionUpdateInput = {};
    if (title !== undefined) updateData.title = title;
    if (slug !== undefined) updateData.slug = slug.toLowerCase();
    if (description !== undefined) updateData.description = description;
    if (coverUrl !== undefined) updateData.coverUrl = coverUrl;
    if (categoryId !== undefined) {
      updateData.category = { connect: { id: categoryId } };
    }
    if (order !== undefined) updateData.order = order;

    const collection = await prisma.collection.update({
      where: { id },
      data: updateData,
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json({ success: true, data: collection });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }
    if (error instanceof Error && error.message.includes("Forbidden")) {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 },
      );
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { success: false, error: "Collection not found" },
        { status: 404 },
      );
    }
    console.error("PATCH /api/collections/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update collection" },
      { status: 500 },
    );
  }
}

// DELETE /api/collections/[id] — Admin: delete collection (items are cascade-deleted)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;

    await prisma.collection.delete({ where: { id } });
    return NextResponse.json({
      success: true,
      message: "Collection deleted successfully",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }
    if (error instanceof Error && error.message.includes("Forbidden")) {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 },
      );
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { success: false, error: "Collection not found" },
        { status: 404 },
      );
    }
    console.error("DELETE /api/collections/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete collection" },
      { status: 500 },
    );
  }
}
