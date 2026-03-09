import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-middleware";

// GET /api/about/info-items — Public: list all about info items
export async function GET() {
  try {
    const items = await prisma.aboutInfoItem.findMany({
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error("GET /api/about/info-items error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch info items" },
      { status: 500 },
    );
  }
}

// POST /api/about/info-items — Admin: create an info item
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { label, value, href, iconKey, order } = body;

    if (!label || !value) {
      return NextResponse.json(
        { success: false, error: "Label and value are required" },
        { status: 400 },
      );
    }

    const item = await prisma.aboutInfoItem.create({
      data: {
        label,
        value,
        href: href ?? null,
        iconKey: iconKey ?? "mail",
        order: order ?? 0,
      },
    });

    return NextResponse.json({ success: true, data: item }, { status: 201 });
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
    console.error("POST /api/about/info-items error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create info item" },
      { status: 500 },
    );
  }
}
