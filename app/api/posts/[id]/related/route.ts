import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/posts/[id]/related — Get related posts by same category and overlapping tags
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const UUID_REGEX =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isUuid = UUID_REGEX.test(id);

    // Find the current post
    const currentPost = await prisma.post.findFirst({
      where: isUuid ? { OR: [{ id }, { slug: id }] } : { slug: id },
      select: { id: true, categoryId: true, tags: true },
    });

    if (!currentPost) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 },
      );
    }

    // Find posts in the same category, excluding the current post
    const relatedPosts = await prisma.post.findMany({
      where: {
        id: { not: currentPost.id },
        categoryId: currentPost.categoryId,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        meta: true,
        thumbnailUrl: true,
        tags: true,
        createdAt: true,
        author: {
          select: { id: true, name: true },
        },
        category: {
          select: { id: true, name: true, slug: true },
        },
        _count: {
          select: { likes: true, comments: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20, // fetch more than needed so we can sort by tag overlap
    });

    // Score by number of overlapping tags, then sort
    const scored = relatedPosts.map((post) => {
      const overlap = post.tags.filter((t) =>
        currentPost.tags.includes(t),
      ).length;
      return { ...post, _tagOverlap: overlap };
    });

    scored.sort((a, b) => b._tagOverlap - a._tagOverlap);

    // Return top 5, strip the score field
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const top = scored.slice(0, 5).map(({ _tagOverlap, ...rest }) => rest);

    return NextResponse.json({ success: true, data: top });
  } catch (error) {
    console.error("GET /api/posts/[id]/related error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch related posts" },
      { status: 500 },
    );
  }
}
