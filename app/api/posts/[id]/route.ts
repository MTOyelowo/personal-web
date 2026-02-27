import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@/prisma/generated/prisma/client";
import { requireAdmin } from "@/lib/auth-middleware";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// UUID v4 pattern for safe querying against @db.Uuid columns
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET /api/posts/[id] - Get a single post by ID or slug
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Only include id in query if it looks like a valid UUID
    const isUuid = UUID_REGEX.test(id);
    const post = await prisma.post.findFirst({
      where: isUuid ? { OR: [{ id }, { slug: id }] } : { slug: id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            bio: true,
          },
        },
        category: {
          select: { id: true, name: true, slug: true },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
        collectionItems: {
          select: {
            id: true,
            collectionId: true,
            collection: {
              select: { id: true, title: true, slug: true },
            },
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    console.error("GET /api/posts/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch post" },
      { status: 500 },
    );
  }
}

// PATCH /api/posts/[id] - Update a post (requires admin)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    const {
      title,
      slug,
      meta,
      content,
      categoryId,
      tags,
      thumbnail,
      featured,
      editorPick,
    } = body;

    // Check if post exists
    const existingPost = await prisma.post.findUnique({
      where: { id },
    });

    if (!existingPost) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 },
      );
    }

    // Check if slug already exists (excluding current post)
    if (slug && slug !== existingPost.slug) {
      const slugExists = await prisma.post.findFirst({
        where: {
          slug,
          NOT: { id },
        },
      });

      if (slugExists) {
        return NextResponse.json(
          { success: false, error: "Post with this slug already exists" },
          { status: 409 },
        );
      }
    }

    // Build update data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = {};
    if (title) updateData.title = title;
    if (slug) updateData.slug = slug;
    if (meta) updateData.meta = meta;
    if (content) updateData.content = content;
    if (categoryId) updateData.category = { connect: { id: categoryId } };
    if (tags) updateData.tags = tags;
    if (thumbnail) {
      updateData.thumbnailUrl = thumbnail.url;
      updateData.thumbnailPublicId = thumbnail.publicId;
    }
    if (typeof featured === "boolean") updateData.featured = featured;
    if (typeof editorPick === "boolean") updateData.editorPick = editorPick;

    const post = await prisma.post.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json({ success: true, data: post });
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
    console.error("PATCH /api/posts/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update post" },
      { status: 500 },
    );
  }
}

// DELETE /api/posts/[id] - Delete a post (requires admin)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;

    await prisma.post.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/posts/[id] error:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to delete post" },
      { status: 500 },
    );
  }
}
