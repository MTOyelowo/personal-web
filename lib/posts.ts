import { cache } from "react";
import { prisma } from "@/lib/db";
import type { CollectionData } from "@/components/common/collection-types";

/**
 * Post for the public post page. Wrapped in React cache so generateMetadata
 * and the page share one query per request.
 */
export const getPostBySlug = cache(async (slug: string) => {
  return prisma.post.findFirst({
    where: { slug },
    include: {
      author: { select: { id: true, name: true } },
      category: { select: { id: true, name: true, slug: true } },
      collectionItems: {
        select: {
          collection: { select: { id: true } },
        },
      },
    },
  });
});

/** Ordered posts in a collection, shaped like GET /api/collections/[id]/posts. */
export const getCollectionData = cache(
  async (collectionId: string): Promise<CollectionData | null> => {
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        items: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            order: true,
            post: {
              select: {
                id: true,
                title: true,
                slug: true,
                meta: true,
                thumbnailUrl: true,
                createdAt: true,
                author: { select: { id: true, name: true } },
                category: { select: { id: true, name: true, slug: true } },
              },
            },
          },
        },
      },
    });

    if (!collection) return null;

    return {
      ...collection,
      items: collection.items.map((item) => ({
        ...item,
        post: { ...item.post, createdAt: item.post.createdAt.toISOString() },
      })),
    };
  },
);
