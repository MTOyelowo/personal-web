import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-middleware";

// GET /api/admin/daily-words — Admin: paginated list of daily words
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const [dailyWords, total] = await Promise.all([
      prisma.dailyWord.findMany({
        orderBy: { date: "desc" },
        skip,
        take: limit,
        include: {
          backgrounds: {
            orderBy: { order: "asc" },
          },
        },
      }),
      prisma.dailyWord.count(),
    ]);

    return NextResponse.json({
      success: true,
      data: { dailyWords, total },
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
    console.error("GET /api/admin/daily-words error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch daily words" },
      { status: 500 },
    );
  }
}
