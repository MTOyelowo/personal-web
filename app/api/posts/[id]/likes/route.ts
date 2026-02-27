import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// POST /api/posts/[id]/likes - Toggle like on a post
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

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        likes: {
          where: { id: userId },
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 },
      );
    }

    const hasLiked = post.likes.length > 0;

    if (hasLiked) {
      // Unlike
      await prisma.post.update({
        where: { id },
        data: {
          likes: {
            disconnect: { id: userId },
          },
        },
      });
    } else {
      // Like
      await prisma.post.update({
        where: { id },
        data: {
          likes: {
            connect: { id: userId },
          },
        },
      });
    }

    const likesCount = await prisma.post.findUnique({
      where: { id },
      select: {
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        liked: !hasLiked,
        likesCount: likesCount?._count.likes || 0,
      },
    });
  } catch (error) {
    console.error("POST /api/posts/[id]/likes error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to toggle like" },
      { status: 500 },
    );
  }
}

// GET /api/posts/[id]/likes - Get like status for a post
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        likes: userId
          ? {
              where: { id: userId },
            }
          : false,
        _count: {
          select: {
            likes: true,
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

    const liked =
      userId && Array.isArray(post.likes) ? post.likes.length > 0 : false;

    return NextResponse.json({
      success: true,
      data: {
        liked,
        likesCount: post._count.likes,
      },
    });
  } catch (error) {
    console.error("GET /api/posts/[id]/likes error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch like status" },
      { status: 500 },
    );
  }
}
