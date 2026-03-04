import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-middleware";
import { put, list, del } from "@vercel/blob";

// GET /api/images — List all uploaded images from Vercel Blob
export async function GET() {
  try {
    await requireAdmin();

    const { blobs } = await list({ prefix: "tripte/" });

    const images = blobs.map((blob) => ({
      src: blob.url,
      blobPath: blob.pathname,
    }));

    return NextResponse.json({ success: true, data: images });
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
    console.error("GET /api/images error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch images" },
      { status: 500 },
    );
  }
}

// POST /api/images — Upload an image to Vercel Blob
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No image provided" },
        { status: 400 },
      );
    }

    const blob = await put(`tripte/${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          src: blob.url,
          blobPath: blob.pathname,
        },
      },
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
    console.error("POST /api/images error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload image" },
      { status: 500 },
    );
  }
}

// DELETE /api/images — Delete an image from Vercel Blob
export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();

    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { success: false, error: "No blob URL provided" },
        { status: 400 },
      );
    }

    await del(url);

    return NextResponse.json({ success: true });
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
    console.error("DELETE /api/images error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete image" },
      { status: 500 },
    );
  }
}
