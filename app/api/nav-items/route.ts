import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export interface NavItem {
  label: string;
  href: string;
  type: "tag" | "post" | "category" | "collection";
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

    const items: NavItem[] = [];

    // Add tags
    for (const tag of tagSet) {
      items.push({
        label: `#${tag}`,
        href: `/tags/${encodeURIComponent(tag)}`,
        type: "tag",
      });
    }

    // Add post titles
    for (const post of posts) {
      items.push({
        label: post.title,
        href: `/post/${post.slug}`,
        type: "post",
      });
    }

    // Add categories
    for (const cat of categories) {
      items.push({
        label: cat.name,
        href: `/categories/${cat.slug}`,
        type: "category",
      });
    }

    // Add collections
    for (const col of collections) {
      items.push({
        label: col.title,
        href: `/collections/${col.slug}`,
        type: "collection",
      });
    }

    // Shuffle using Fisher-Yates
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }

    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error("GET /api/nav-items error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch nav items" },
      { status: 500 },
    );
  }
}
