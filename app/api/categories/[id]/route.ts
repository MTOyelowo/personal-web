import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-middleware";
import { Prisma } from "@/prisma/generated/prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/categories/[id] — Public: get a single category with its posts and collections
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        posts: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            slug: true,
            meta: true,
            thumbnailUrl: true,
            createdAt: true,
          },
        },
        collections: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            coverUrl: true,
            _count: { select: { items: true } },
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.error("GET /api/categories/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch category" },
      { status: 500 },
    );
  }
}

// PATCH /api/categories/[id] — Admin: update category
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;
    const { name, slug, description, order } = await request.json();

    const updateData: Prisma.CategoryUpdateInput = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug.toLowerCase();
    if (description !== undefined) updateData.description = description;
    if (order !== undefined) updateData.order = order;

    const category = await prisma.category.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: category });
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
        { success: false, error: "Category not found" },
        { status: 404 },
      );
    }
    console.error("PATCH /api/categories/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update category" },
      { status: 500 },
    );
  }
}

// DELETE /api/categories/[id] — Admin: delete category
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;

    // Check if category has posts or collections
    const category = await prisma.category.findUnique({
      where: { id },
      select: {
        _count: { select: { posts: true, collections: true } },
      },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 },
      );
    }

    if (category._count.posts > 0 || category._count.collections > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete: category has ${category._count.posts} posts and ${category._count.collections} collections`,
        },
        { status: 409 },
      );
    }

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
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
    console.error("DELETE /api/categories/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete category" },
      { status: 500 },
    );
  }
}
