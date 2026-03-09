import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-middleware";
import { put } from "@vercel/blob";

// POST /api/about/cv — Upload CV file
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const formData = await request.formData();
    const file = formData.get("cv") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No CV file provided" },
        { status: 400 },
      );
    }

    // Upload to Vercel Blob
    const blob = await put(`tripte/cv/${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
    });

    // Update the about content with the new CV URL
    const existing = await prisma.aboutContent.findFirst();

    if (existing) {
      await prisma.aboutContent.update({
        where: { id: existing.id },
        data: {
          cvUrl: blob.url,
          cvBlobPath: blob.pathname,
        },
      });
    } else {
      await prisma.aboutContent.create({
        data: {
          firstName: "",
          lastName: "",
          subtitle: "",
          bio: "",
          poemLines: [],
          cvUrl: blob.url,
          cvBlobPath: blob.pathname,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          cvUrl: blob.url,
          cvBlobPath: blob.pathname,
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
    console.error("POST /api/about/cv error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload CV" },
      { status: 500 },
    );
  }
}
