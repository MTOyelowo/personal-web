import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-middleware";
import { del } from "@vercel/blob";

// PATCH /api/about/projects/[id] — Admin: update a project
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await request.json();
    const {
      title,
      description,
      liveUrl,
      githubLinks,
      techStack,
      contributor,
      order,
    } = body;

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(liveUrl !== undefined && { liveUrl }),
        ...(githubLinks !== undefined && { githubLinks }),
        ...(techStack !== undefined && { techStack }),
        ...(contributor !== undefined && { contributor }),
        ...(order !== undefined && { order }),
      },
      include: { images: { orderBy: { order: "asc" } } },
    });

    return NextResponse.json({ success: true, data: project });
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
    console.error("PATCH /api/about/projects/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update project" },
      { status: 500 },
    );
  }
}

// DELETE /api/about/projects/[id] — Admin: delete a project
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();

    const { id } = await params;

    // Delete associated blob images first
    const images = await prisma.projectImage.findMany({
      where: { projectId: id },
    });
    await Promise.all(images.map((img) => del(img.url).catch(() => {})));

    await prisma.project.delete({ where: { id } });

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
    console.error("DELETE /api/about/projects/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete project" },
      { status: 500 },
    );
  }
}
