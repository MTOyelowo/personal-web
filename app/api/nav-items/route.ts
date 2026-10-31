import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export interface NavItem {
  label: string;
  href: string;
  type: "tag" | "post" | "category" | "collection";
}

/**
 * How many items the scrolling nav shows. With every tag included it held
 * over 700 links, rendered twice for the loop: three quarters of every
 * page's elements, and a drag on phones. At 30px a second nobody sees more
 * than the first few dozen anyway, and each request draws a fresh mix.
 */
const MAX_ITEMS = 40;
const MAX_POSTS = 10;

function shuffle<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

// GET /api/nav-items — Get a shuffled mix of tags, posts, categories, and collections for the scrolling secondary nav
export async function GET() {
  try {
    const [posts, categories, collections, allPosts] = await Promise.all([
      prisma.post.findMany({
        select: { title: true, slug: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.category.findMany({
        select: { name: true, slug: true },
        orderBy: { order: "asc" },
      }),
      prisma.collection.findMany({
        select: { title: true, slug: true },
        orderBy: { order: "asc" },
      }),
      prisma.post.findMany({
        select: { tags: true },
      }),
    ]);

    // Collect unique tags
    const tagSet = new Set<string>();
    for (const post of allPosts) {
      for (const tag of post.tags) {
        tagSet.add(tag);
      }
    }

    // Every category and collection, a few recent posts, then tags to fill
    const items: NavItem[] = [
      ...categories.map((cat) => ({
        label: cat.name,
        href: `/categories/${cat.slug}`,
        type: "category" as const,
      })),
      ...collections.map((col) => ({
        label: col.title,
        href: `/collections/${col.slug}`,
        type: "collection" as const,
      })),
      ...shuffle(posts).slice(0, MAX_POSTS).map((post) => ({
        label: post.title,
        href: `/post/${post.slug}`,
        type: "post" as const,
      })),
    ].slice(0, MAX_ITEMS);

    for (const tag of shuffle([...tagSet]).slice(0, MAX_ITEMS - items.length)) {
      items.push({
        label: `#${tag}`,
        href: `/tags/${encodeURIComponent(tag)}`,
        type: "tag",
      });
    }

    return NextResponse.json({ success: true, data: shuffle(items) });
  } catch (error) {
    console.error("GET /api/nav-items error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch nav items" },
      { status: 500 },
    );
  }
}
