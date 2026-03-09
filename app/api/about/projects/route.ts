import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-middleware";

// GET /api/about/projects — Public: list all projects
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ success: true, data: projects });
  } catch (error) {
    console.error("GET /api/about/projects error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch projects" },
      { status: 500 },
    );
  }
}

// POST /api/about/projects — Admin: create a project
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const {
      title,
      description,
      image,
      imageBlobPath,
      liveUrl,
      githubLinks,
      techStack,
      contributor,
      order,
    } = body;

    if (!title || !description) {
      return NextResponse.json(
        { success: false, error: "Title and description are required" },
        { status: 400 },
      );
    }

    const project = await prisma.project.create({
      data: {
        title,
        description,
        image: image ?? null,
        imageBlobPath: imageBlobPath ?? null,
        liveUrl: liveUrl ?? "",
        githubLinks: githubLinks ?? [],
        techStack: techStack ?? [],
        contributor: contributor ?? false,
        order: order ?? 0,
      },
    });

    return NextResponse.json({ success: true, data: project }, { status: 201 });
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
    console.error("POST /api/about/projects error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create project" },
      { status: 500 },
    );
  }
}
