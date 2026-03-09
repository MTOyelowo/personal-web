import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-middleware";

// GET /api/about/work-experiences — Public: list all work experiences
export async function GET() {
  try {
    const experiences = await prisma.workExperience.findMany({
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ success: true, data: experiences });
  } catch (error) {
    console.error("GET /api/about/work-experiences error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch work experiences" },
      { status: 500 },
    );
  }
}

// POST /api/about/work-experiences — Admin: create a work experience
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { company, position, dateRange, descriptions, order } = body;

    if (!company || !position || !dateRange) {
      return NextResponse.json(
        {
          success: false,
          error: "Company, position, and date range are required",
        },
        { status: 400 },
      );
    }

    const experience = await prisma.workExperience.create({
      data: {
        company,
        position,
        dateRange,
        descriptions: descriptions ?? [],
        order: order ?? 0,
      },
    });

    return NextResponse.json(
      { success: true, data: experience },
      { status: 201 },
    );
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
    console.error("POST /api/about/work-experiences error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create work experience" },
      { status: 500 },
    );
  }
}
