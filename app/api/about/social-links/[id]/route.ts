import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-middleware";

// PATCH /api/about/social-links/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await request.json();
    const { platform, href, iconKey, order } = body;

    const link = await prisma.socialLink.update({
      where: { id },
      data: {
        ...(platform !== undefined && { platform }),
        ...(href !== undefined && { href }),
        ...(iconKey !== undefined && { iconKey }),
        ...(order !== undefined && { order }),
      },
    });

    return NextResponse.json({ success: true, data: link });
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
    console.error("PATCH /api/about/social-links/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update social link" },
      { status: 500 },
    );
  }
}

// DELETE /api/about/social-links/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();

    const { id } = await params;
    await prisma.socialLink.delete({ where: { id } });

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
    console.error("DELETE /api/about/social-links/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete social link" },
      { status: 500 },
    );
  }
}
