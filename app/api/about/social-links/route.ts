import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-middleware";

// GET /api/about/social-links — Public: list all social links
export async function GET() {
  try {
    const links = await prisma.socialLink.findMany({
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ success: true, data: links });
  } catch (error) {
    console.error("GET /api/about/social-links error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch social links" },
      { status: 500 },
    );
  }
}

// POST /api/about/social-links — Admin: create a social link
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { platform, href, iconKey, order } = body;

    if (!platform || !href) {
      return NextResponse.json(
        { success: false, error: "Platform and URL are required" },
        { status: 400 },
      );
    }

    const link = await prisma.socialLink.create({
      data: {
        platform,
        href,
        iconKey: iconKey ?? "github",
        order: order ?? 0,
      },
    });

    return NextResponse.json({ success: true, data: link }, { status: 201 });
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
    console.error("POST /api/about/social-links error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create social link" },
      { status: 500 },
    );
  }
}
