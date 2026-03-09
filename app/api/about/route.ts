import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-middleware";

// GET /api/about — Public: get the about content (singleton)
export async function GET() {
  try {
    let about = await prisma.aboutContent.findFirst({
      include: { skills: { orderBy: { order: "asc" } } },
    });

    // If nothing exists yet, return an empty shell
    if (!about) {
      about = await prisma.aboutContent.create({
        data: {
          firstName: "",
          lastName: "",
          subtitle: "",
          bio: "",
          poemLines: [],
        },
        include: { skills: { orderBy: { order: "asc" } } },
      });
    }

    return NextResponse.json({ success: true, data: about });
  } catch (error) {
    console.error("GET /api/about error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch about content" },
      { status: 500 },
    );
  }
}

// PUT /api/about — Admin: update the about content (upsert singleton)
export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const {
      firstName,
      lastName,
      subtitle,
      bio,
      poemLines,
      cvUrl,
      cvBlobPath,
      skills,
    } = body;

    // Find or create
    let existing = await prisma.aboutContent.findFirst();

    if (existing) {
      // Update main record
      existing = await prisma.aboutContent.update({
        where: { id: existing.id },
        data: {
          ...(firstName !== undefined && { firstName }),
          ...(lastName !== undefined && { lastName }),
          ...(subtitle !== undefined && { subtitle }),
          ...(bio !== undefined && { bio }),
          ...(poemLines !== undefined && { poemLines }),
          ...(cvUrl !== undefined && { cvUrl }),
          ...(cvBlobPath !== undefined && { cvBlobPath }),
        },
      });
    } else {
      existing = await prisma.aboutContent.create({
        data: {
          firstName: firstName ?? "",
          lastName: lastName ?? "",
          subtitle: subtitle ?? "",
          bio: bio ?? "",
          poemLines: poemLines ?? [],
          cvUrl: cvUrl ?? null,
          cvBlobPath: cvBlobPath ?? null,
        },
      });
    }

    // Sync skills if provided
    if (Array.isArray(skills)) {
      // Delete old skills
      await prisma.skill.deleteMany({
        where: { aboutContentId: existing.id },
      });
      // Create new ones
      if (skills.length > 0) {
        await prisma.skill.createMany({
          data: skills.map(
            (s: { label: string; items: string[] }, i: number) => ({
              label: s.label,
              items: s.items,
              order: i,
              aboutContentId: existing!.id,
            }),
          ),
        });
      }
    }

    const updated = await prisma.aboutContent.findFirst({
      include: { skills: { orderBy: { order: "asc" } } },
    });

    return NextResponse.json({ success: true, data: updated });
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
    console.error("PUT /api/about error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update about content" },
      { status: 500 },
    );
  }
}
