import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-middleware";

// PATCH /api/about/info-items/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await request.json();
    const { label, value, href, iconKey, order } = body;

    const item = await prisma.aboutInfoItem.update({
      where: { id },
      data: {
        ...(label !== undefined && { label }),
        ...(value !== undefined && { value }),
        ...(href !== undefined && { href }),
        ...(iconKey !== undefined && { iconKey }),
        ...(order !== undefined && { order }),
      },
    });

    return NextResponse.json({ success: true, data: item });
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
    console.error("PATCH /api/about/info-items/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update info item" },
      { status: 500 },
    );
  }
}

// DELETE /api/about/info-items/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();

    const { id } = await params;
    await prisma.aboutInfoItem.delete({ where: { id } });

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
    console.error("DELETE /api/about/info-items/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete info item" },
      { status: 500 },
    );
  }
}
