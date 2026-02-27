import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth-middleware";

// GET /api/posts - Get all posts with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const categoryId = searchParams.get("categoryId");
    const tag = searchParams.get("tag");
    const search = searchParams.get("search");
    const featured = searchParams.get("featured");
    const editorPick = searchParams.get("editorPick");

    const skip = (page - 1) * limit;

    // Build query
    const where: Prisma.PostWhereInput = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (tag) {
      where.tags = {
        has: tag,
      };
    }

    if (featured === "true") {
      where.featured = true;
    }

    if (editorPick === "true") {
      where.editorPick = true;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { meta: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        posts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("GET /api/posts error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch posts" },
      { status: 500 },
    );
  }
}

// POST /api/posts - Create a new post (requires admin)
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const { title, slug, meta, content, categoryId, tags, thumbnail } = body;

    // Validate required fields
    if (!title || !slug || !meta || !content || !categoryId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if slug already exists
    const existingPost = await prisma.post.findUnique({
      where: { slug },
    });

    if (existingPost) {
      return NextResponse.json(
        { success: false, error: "Post with this slug already exists" },
        { status: 409 },
      );
    }

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        meta,
        content,
        categoryId,
        tags: tags || [],
        thumbnailUrl: thumbnail?.url,
        thumbnailPublicId: thumbnail?.publicId,
        authorId: admin.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: post }, { status: 201 });
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
    console.error("POST /api/posts error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create post" },
      { status: 500 },
    );
  }
}
