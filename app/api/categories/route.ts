import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-middleware";

// GET /api/categories — Public: list all categories
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        order: true,
        _count: { select: { posts: true, collections: true } },
      },
    });

    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error("GET /api/categories error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 },
    );
  }
}

// POST /api/categories — Admin: create a new category
export async function POST(request: Request) {
  try {
    await requireAdmin();

    const { name, slug, description } = await request.json();

    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: name, slug" },
        { status: 400 },
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug: slug.toLowerCase(),
        description: description || null,
        order: await prisma.category.count(),
      },
    });

    return NextResponse.json(
      { success: true, data: category },
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
    console.error("POST /api/categories error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create category" },
      { status: 500 },
    );
  }
}
