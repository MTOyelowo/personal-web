import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-middleware";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/collections/[id]/items — Admin: add a post to the collection
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id: collectionId } = await params;
    const { postId } = await request.json();

    if (!postId) {
      return NextResponse.json(
        { success: false, error: "Missing required field: postId" },
        { status: 400 },
      );
    }

    // Get next order value
    const maxOrder = await prisma.collectionItem.aggregate({
      where: { collectionId },
      _max: { order: true },
    });

    const item = await prisma.collectionItem.create({
      data: {
        collectionId,
        postId,
        order: (maxOrder._max.order ?? -1) + 1,
      },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            slug: true,
            meta: true,
            thumbnailUrl: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: item }, { status: 201 });
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
    console.error("POST /api/collections/[id]/items error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add item to collection" },
      { status: 500 },
    );
  }
}

// PATCH /api/collections/[id]/items — Admin: reorder items
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id: collectionId } = await params;
    const { items } = await request.json();

    // items = [{ id: string, order: number }]
    if (!Array.isArray(items)) {
      return NextResponse.json(
        { success: false, error: "Expected items array with { id, order }" },
        { status: 400 },
      );
    }

    await prisma.$transaction(
      items.map((item: { id: string; order: number }) =>
        prisma.collectionItem.update({
          where: { id: item.id, collectionId },
          data: { order: item.order },
        }),
      ),
    );

    return NextResponse.json({
      success: true,
      message: "Items reordered successfully",
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
    console.error("PATCH /api/collections/[id]/items error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reorder items" },
      { status: 500 },
    );
  }
}

// DELETE /api/collections/[id]/items — Admin: remove a post from the collection
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id: collectionId } = await params;
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: "Missing required query param: itemId" },
        { status: 400 },
      );
    }

    await prisma.collectionItem.delete({
      where: { id: itemId, collectionId },
    });

    return NextResponse.json({
      success: true,
      message: "Item removed from collection",
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
    console.error("DELETE /api/collections/[id]/items error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove item from collection" },
      { status: 500 },
    );
  }
}
