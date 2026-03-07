"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/transformPosts";

interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  meta: string;
  thumbnailUrl: string | null;
  tags: string[];
  createdAt: string;
  author: { id: string; name: string };
  category: { id: string; name: string; slug: string };
  _count: { likes: number; comments: number };
}

interface Props {
  postSlug: string;
}

export default function RelatedPosts({ postSlug }: Props) {
  const { data: posts } = useQuery<RelatedPost[]>({
    queryKey: ["related-posts", postSlug],
    queryFn: async () => {
      const res = await axios.get(`/api/posts/${postSlug}/related`);
      return res.data.data;
    },
    enabled: !!postSlug,
  });

  if (!posts || posts.length === 0) return null;

  return (
    <div className="mt-14 pt-8 border-t border-border">
      <h2 className="text-xl font-bold text-foreground font-libre mb-6">
        Related Posts
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/post/${post.slug}`}
            className="group flex flex-col rounded-xl border border-border overflow-hidden hover:border-foreground/20 transition-colors"
          >
            {/* Thumbnail */}
            {post.thumbnailUrl && (
              <div className="relative w-full aspect-video overflow-hidden bg-muted">
                <Image
                  src={post.thumbnailUrl}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}

            {/* Info */}
            <div className="p-4 flex flex-col gap-1.5">
              <span className="text-xs text-muted-foreground uppercase">
                {post.category.name}
              </span>
              <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2 group-hover:underline underline-offset-2">
                {post.title}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {post.meta}
              </p>
              <span className="text-xs text-muted-foreground mt-1">
                {formatDate(post.createdAt)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
