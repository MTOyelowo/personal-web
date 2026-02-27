import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@/prisma/generated/prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/daily-words/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const dailyWord = await prisma.dailyWord.findUnique({
      where: { id },
      include: {
        backgrounds: { orderBy: { order: "asc" } },
      },
    });

    if (!dailyWord) {
      return NextResponse.json(
        { success: false, error: "Daily word not found" },
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
    console.error("GET /api/daily-words/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch daily word" },
      { status: 500 },
    );
  }
}

// PATCH /api/daily-words/[id] — Admin: update a daily word
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { date, text, author, source, commentary, backgrounds } = body;

    const existing = await prisma.dailyWord.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Daily word not found" },
        { status: 404 },
      );
    }

    const updateData: Prisma.DailyWordUpdateInput = {};
    if (date !== undefined) {
      const parsedDate = new Date(date);
      parsedDate.setUTCHours(0, 0, 0, 0);
      updateData.date = parsedDate;
    }
    if (text !== undefined) updateData.text = text;
    if (author !== undefined) updateData.author = author || null;
    if (source !== undefined) updateData.source = source || null;
    if (commentary !== undefined) updateData.commentary = commentary;

    // If backgrounds are provided, replace all existing ones atomically
    if (backgrounds !== undefined) {
      updateData.backgrounds = {
        deleteMany: {},
        create: backgrounds.map(
          (bg: { src: string; alt?: string }, index: number) => ({
            src: bg.src,
            alt: bg.alt || "",
            order: index,
          }),
        ),
      };
    }

    const dailyWord = await prisma.dailyWord.update({
      where: { id },
      data: updateData,
      include: {
        backgrounds: { orderBy: { order: "asc" } },
      },
    });

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
    console.error("PATCH /api/daily-words/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update daily word" },
      { status: 500 },
    );
  }
}

// DELETE /api/daily-words/[id] — Admin: delete a daily word
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await prisma.dailyWord.delete({ where: { id } });
    return NextResponse.json({
      success: true,
      message: "Daily word deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/daily-words/[id] error:", error);
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { success: false, error: "Daily word not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to delete daily word" },
      { status: 500 },
    );
  }
}
