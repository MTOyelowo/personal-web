import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-middleware";
import cloudinary from "@/lib/cloudinary";

const CLOUDINARY_FOLDER = "tripte";

// GET /api/images — List all uploaded images from Cloudinary
export async function GET() {
  try {
    await requireAdmin();

    const { resources } = await cloudinary.api.resources({
      resource_type: "image",
      type: "upload",
      prefix: CLOUDINARY_FOLDER,
      max_results: 100,
    });

    const images = resources.map(
      ({
        secure_url,
        public_id,
      }: {
        secure_url: string;
        public_id: string;
      }) => ({
        src: secure_url,
        publicId: public_id,
      }),
    );

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

// POST /api/images — Upload an image to Cloudinary
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

    // Convert file to buffer then base64 data URI for cloudinary upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64, {
      folder: CLOUDINARY_FOLDER,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          src: result.secure_url,
          publicId: result.public_id,
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
