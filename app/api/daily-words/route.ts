import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/daily-words?date=2026-02-16
// Returns the daily word for the given date.
// Falls back to the most recent past date if no quote exists for that day.
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");

    // Default to today
    const targetDate = dateParam ? new Date(dateParam) : new Date();
    targetDate.setUTCHours(0, 0, 0, 0);

    // Only allow dates up to today (no peeking at future quotes)
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const effectiveDate = targetDate > today ? today : targetDate;

    // Try exact date first, then fall back to most recent past date
    let dailyWord = await prisma.dailyWord.findUnique({
      where: { date: effectiveDate },
      include: {
        backgrounds: { orderBy: { order: "asc" } },
      },
    });

    if (!dailyWord) {
      dailyWord = await prisma.dailyWord.findFirst({
        where: { date: { lte: effectiveDate } },
        orderBy: { date: "desc" },
        include: {
          backgrounds: { orderBy: { order: "asc" } },
        },
      });
    }

    if (!dailyWord) {
      return NextResponse.json(
        { success: false, error: "No daily words available" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: dailyWord.id,
        date: dailyWord.date.toISOString().split("T")[0],
        text: dailyWord.text,
        author: dailyWord.author,
        source: dailyWord.source,
        commentary: dailyWord.commentary,
        backgrounds: dailyWord.backgrounds.map(
          (bg: { id: string; src: string; alt: string; order: number }) => ({
            id: bg.id,
            src: bg.src,
            alt: bg.alt,
            order: bg.order,
          }),
        ),
      },
    });
  } catch (error) {
    console.error("GET /api/daily-words error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch daily word" },
      { status: 500 },
    );
  }
}

// POST /api/daily-words — Admin: create a new daily word
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, text, author, source, commentary, backgrounds } = body;

    if (!date || !text) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: date, text",
        },
        { status: 400 },
      );
    }

    const parsedDate = new Date(date);
    parsedDate.setUTCHours(0, 0, 0, 0);

    // Check if a quote already exists for this date
    const existing = await prisma.dailyWord.findUnique({
      where: { date: parsedDate },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "A daily word already exists for this date" },
        { status: 409 },
      );
    }

    const dailyWord = await prisma.dailyWord.create({
      data: {
        date: parsedDate,
        text,
        author: author || null,
        source: source || null,
        commentary: commentary || null,
        backgrounds: {
          create: (backgrounds || []).map(
            (bg: { src: string; alt?: string }, index: number) => ({
              src: bg.src,
              alt: bg.alt || "",
              order: index,
            }),
          ),
        },
      },
      include: {
        backgrounds: { orderBy: { order: "asc" } },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: dailyWord.id,
          date: dailyWord.date.toISOString().split("T")[0],
          text: dailyWord.text,
          author: dailyWord.author,
          source: dailyWord.source,
          commentary: dailyWord.commentary,
          backgrounds: dailyWord.backgrounds.map(
            (bg: { id: string; src: string; alt: string; order: number }) => ({
              id: bg.id,
              src: bg.src,
              alt: bg.alt,
              order: bg.order,
            }),
          ),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/daily-words error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create daily word" },
      { status: 500 },
    );
  }
}
