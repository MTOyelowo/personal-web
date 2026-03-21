import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/comments/[id]/likes - Toggle like on a comment
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 },
      );
    }

    const comment = await prisma.comment.findUnique({
      where: { id },
      include: {
        likes: { where: { id: userId } },
      },
    });

    if (!comment) {
      return NextResponse.json(
        { success: false, error: "Comment not found" },
        { status: 404 },
      );
    }

    const hasLiked = comment.likes.length > 0;

    await prisma.comment.update({
      where: { id },
      data: {
        likes: hasLiked
          ? { disconnect: { id: userId } }
          : { connect: { id: userId } },
      },
    });

    const updated = await prisma.comment.findUnique({
      where: { id },
      select: { _count: { select: { likes: true } } },
    });

    return NextResponse.json({
      success: true,
      data: {
        liked: !hasLiked,
        likesCount: updated?._count.likes || 0,
      },
    });
  } catch (error) {
    console.error("POST /api/comments/[id]/likes error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to toggle comment like" },
      { status: 500 },
    );
  }
}
