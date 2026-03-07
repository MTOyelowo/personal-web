import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/tags — Get all tags with post counts
export async function GET() {
  try {
    // Fetch all posts' tags
    const posts = await prisma.post.findMany({
      select: { tags: true },
    });

    // Count occurrences of each tag
    const tagMap = new Map<string, number>();
    for (const post of posts) {
      for (const tag of post.tags) {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
      }
    }

    // Sort by count descending, then alphabetically
    const tags = Array.from(tagMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

    return NextResponse.json({ success: true, data: tags });
  } catch (error) {
    console.error("GET /api/tags error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch tags" },
      { status: 500 },
    );
  }
}
