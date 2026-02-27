import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-middleware";

// GET /api/admin/stats — Admin: dashboard overview
export async function GET() {
  try {
    await requireAdmin();

    const [posts, dailyWords, collections, categories, recentPosts] =
      await Promise.all([
        prisma.post.count(),
        prisma.dailyWord.count(),
        prisma.collection.count(),
        prisma.category.count(),
        prisma.post.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            slug: true,
            createdAt: true,
            author: { select: { name: true } },
            _count: { select: { comments: true, likes: true } },
          },
        }),
      ]);

    return NextResponse.json({
      success: true,
      data: { posts, dailyWords, collections, categories, recentPosts },
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
    console.error("GET /api/admin/stats error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch stats" },
      { status: 500 },
    );
  }
}
