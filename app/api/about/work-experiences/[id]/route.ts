import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-middleware";

// PATCH /api/about/work-experiences/[id] — Admin: update a work experience
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await request.json();
    const { company, position, dateRange, descriptions, order } = body;

    const experience = await prisma.workExperience.update({
      where: { id },
      data: {
        ...(company !== undefined && { company }),
        ...(position !== undefined && { position }),
        ...(dateRange !== undefined && { dateRange }),
        ...(descriptions !== undefined && { descriptions }),
        ...(order !== undefined && { order }),
      },
    });

    return NextResponse.json({ success: true, data: experience });
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
    console.error("PATCH /api/about/work-experiences/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update work experience" },
      { status: 500 },
    );
  }
}

// DELETE /api/about/work-experiences/[id] — Admin: delete a work experience
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();

    const { id } = await params;
    await prisma.workExperience.delete({ where: { id } });

    return NextResponse.json({ success: true, data: null });
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
    console.error("DELETE /api/about/work-experiences/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete work experience" },
      { status: 500 },
    );
  }
}
