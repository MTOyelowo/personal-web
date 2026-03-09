import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-middleware";
import { put, del } from "@vercel/blob";

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/about/projects/[id]/images — list images for a project
export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const images = await prisma.projectImage.findMany({
      where: { projectId: id },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ success: true, data: images });
  } catch (error) {
    console.error("GET /api/about/projects/[id]/images error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch project images" },
      { status: 500 },
    );
  }
}

// POST /api/about/projects/[id]/images — upload an image
export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await params;

    const formData = await request.formData();
    const file = formData.get("image") as File | null;
    const alt = (formData.get("alt") as string) || "";
    const order = parseInt((formData.get("order") as string) || "0", 10);

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No image file provided" },
        { status: 400 },
      );
    }

    // Verify project exists
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 },
      );
    }

    // Upload to Vercel Blob
    const blob = await put(`tripte/projects/${id}/${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
    });

    const image = await prisma.projectImage.create({
      data: {
        projectId: id,
        url: blob.url,
        blobPath: blob.pathname,
        alt,
        order,
      },
    });

    return NextResponse.json({ success: true, data: image }, { status: 201 });
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
    console.error("POST /api/about/projects/[id]/images error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload project image" },
      { status: 500 },
    );
  }
}

// DELETE /api/about/projects/[id]/images — delete an image by imageId in body
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await params;
    const { imageId } = await request.json();

    if (!imageId) {
      return NextResponse.json(
        { success: false, error: "imageId is required" },
        { status: 400 },
      );
    }

    const image = await prisma.projectImage.findFirst({
      where: { id: imageId, projectId: id },
    });

    if (!image) {
      return NextResponse.json(
        { success: false, error: "Image not found" },
        { status: 404 },
      );
    }

    // Delete from Vercel Blob
    try {
      await del(image.url);
    } catch (e) {
      console.warn("Failed to delete blob, continuing:", e);
    }

    // Delete from DB
    await prisma.projectImage.delete({ where: { id: imageId } });

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
    console.error("DELETE /api/about/projects/[id]/images error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete project image" },
      { status: 500 },
    );
  }
}

// PATCH /api/about/projects/[id]/images — reorder images
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await params;
    const { images } = (await request.json()) as {
      images: { id: string; order: number; alt?: string }[];
    };

    if (!images || !Array.isArray(images)) {
      return NextResponse.json(
        { success: false, error: "images array is required" },
        { status: 400 },
      );
    }

    await Promise.all(
      images.map((img) =>
        prisma.projectImage.update({
          where: { id: img.id, projectId: id },
          data: {
            order: img.order,
            ...(img.alt !== undefined && { alt: img.alt }),
          },
        }),
      ),
    );

    const updated = await prisma.projectImage.findMany({
      where: { projectId: id },
      orderBy: { order: "asc" },
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
    console.error("PATCH /api/about/projects/[id]/images error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update project images" },
      { status: 500 },
    );
  }
}
