import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/daily-words/available-dates?from=2026-01-01&to=2026-02-28
// Returns a list of dates that have daily words (for the date picker UI).
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Default: last 90 days
    const to = toParam ? new Date(toParam + "T00:00:00Z") : today;
    const from = fromParam
      ? new Date(fromParam + "T00:00:00Z")
      : new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);

    // Only reveal dates up to today
    const effectiveTo = to > today ? today : to;

    const dailyWords = await prisma.dailyWord.findMany({
      where: {
        date: {
          gte: from,
          lte: effectiveTo,
        },
      },
      select: { date: true },
      orderBy: { date: "desc" },
    });

    const dates = dailyWords.map(
      (dw: { date: Date }) => dw.date.toISOString().split("T")[0],
    );

    return NextResponse.json({
      success: true,
      data: { dates },
    });
  } catch (error) {
    console.error("GET /api/daily-words/available-dates error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch available dates" },
      { status: 500 },
    );
  }
}
