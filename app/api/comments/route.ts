import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@/prisma/generated/prisma/client";

// GET /api/comments - Get all comments with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");
    const parentId = searchParams.get("parentId");

    const where: Prisma.CommentWhereInput = {};

    if (postId) {
      where.postId = postId;
    }

    if (parentId) {
      where.parentCommentId = parentId;
    } else if (postId) {
      // If no parentId specified but postId is provided, only get top-level comments
      where.parentCommentId = null;
    }

    const comments = await prisma.comment.findMany({
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
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: comments,
    });
  } catch (error) {
    console.error("GET /api/comments error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch comments" },
      { status: 500 },
    );
  }
}

// POST /api/comments - Create a new comment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, postId, authorId, parentCommentId } = body;

    // Validate required fields
    if (!content || !postId || !authorId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        authorId,
        parentCommentId,
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
      },
    });

    return NextResponse.json({ success: true, data: comment }, { status: 201 });
  } catch (error) {
    console.error("POST /api/comments error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create comment" },
      { status: 500 },
    );
  }
}
