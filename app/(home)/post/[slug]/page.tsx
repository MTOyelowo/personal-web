import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import PostContent from "./post-content";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const post = await prisma.post.findFirst({
    where: { slug },
    select: {
      title: true,
      meta: true,
      thumbnailUrl: true,
      author: { select: { name: true } },
      tags: true,
      createdAt: true,
    },
  });

  if (!post) {
    return { title: "Post Not Found" };
  }

  const description =
    post.meta || `Read "${post.title}" by ${post.author?.name ?? "TMOyelowo"}`;

  return {
    title: post.title,
    description,
    keywords: post.tags,
    authors: post.author?.name ? [{ name: post.author.name }] : undefined,
    openGraph: {
      type: "article",
      title: post.title,
      description,
      url: `https://tmoyelowo.com/post/${slug}`,
      publishedTime: post.createdAt.toISOString(),
      authors: post.author?.name ? [post.author.name] : undefined,
      tags: post.tags,
      ...(post.thumbnailUrl && {
        images: [
          {
            url: post.thumbnailUrl,
            alt: post.title,
            width: 1200,
            height: 630,
            type: "image/jpeg",
          },
        ],
      }),
    },
    twitter: {
      card: post.thumbnailUrl ? "summary_large_image" : "summary",
      title: post.title,
      description,
      ...(post.thumbnailUrl && {
        images: [
          {
            url: post.thumbnailUrl,
            alt: post.title,
            width: 1200,
            height: 630,
          },
        ],
      }),
    },
    alternates: {
      canonical: `/post/${slug}`,
    },
  };
}

export default function PostPage() {
  return <PostContent />;
}
