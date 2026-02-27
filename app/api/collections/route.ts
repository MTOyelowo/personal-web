import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-middleware";

// GET /api/collections — Public: list collections with optional category filter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");

    const where = categoryId ? { categoryId } : {};

    const collections = await prisma.collection.findMany({
      where,
      orderBy: { order: "asc" },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        _count: { select: { items: true } },
      },
    });

    return NextResponse.json({ success: true, data: collections });
  } catch (error) {
    console.error("GET /api/collections error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch collections" },
      { status: 500 },
    );
  }
}

// POST /api/collections — Admin: create a new collection
export async function POST(request: Request) {
  try {
    await requireAdmin();

    const { title, slug, description, coverUrl, categoryId } =
      await request.json();

    if (!title || !slug || !categoryId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: title, slug, categoryId",
        },
        { status: 400 },
      );
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 },
      );
    }

    const collection = await prisma.collection.create({
      data: {
        title,
        slug: slug.toLowerCase(),
        description: description || null,
        coverUrl: coverUrl || null,
        categoryId,
        order: await prisma.collection.count({ where: { categoryId } }),
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json(
      { success: true, data: collection },
      { status: 201 },
    );
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
    console.error("POST /api/collections error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create collection" },
      { status: 500 },
    );
  }
}
