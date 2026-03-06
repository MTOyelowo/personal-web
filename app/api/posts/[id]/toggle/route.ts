import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-middleware";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/posts/[id]/toggle — Toggle featured or editorPick
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const { field } = body as { field: "featured" | "editorPick" };

    if (field !== "featured" && field !== "editorPick") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid field. Use 'featured' or 'editorPick'",
        },
        { status: 400 },
      );
    }

    const MAX_FEATURED = 2;
    const MAX_EDITOR_PICKS = 4;

    // Get current value
    const post = await prisma.post.findUnique({
      where: { id },
      select: { featured: true, editorPick: true },
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 },
      );
    }

    const turningOn = !post[field];

    // Enforce limits when enabling
    if (turningOn) {
      const currentCount = await prisma.post.count({
        where: { [field]: true },
      });
      const max = field === "featured" ? MAX_FEATURED : MAX_EDITOR_PICKS;
      if (currentCount >= max) {
        const label =
          field === "featured" ? "featured posts" : "editor's picks";
        return NextResponse.json(
          {
            success: false,
            error: `Maximum of ${max} ${label} reached. Remove one before adding another.`,
          },
          { status: 409 },
        );
      }
    }

    const updated = await prisma.post.update({
      where: { id },
      data: { [field]: turningOn },
      select: {
        id: true,
        featured: true,
        editorPick: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
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
    console.error("PATCH /api/posts/[id]/toggle error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to toggle post field" },
      { status: 500 },
    );
  }
}
