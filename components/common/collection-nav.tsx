"use client";

import Link from "next/link";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import type { CollectionPost } from "@/components/common/collection-types";

interface Props {
  collectionTitle: string;
  collectionSlug: string;
  prevPost: CollectionPost | null;
  nextPost: CollectionPost | null;
  currentIndex: number;
  totalPosts: number;
}

export default function CollectionNav({
  collectionTitle,
  collectionSlug,
  prevPost,
  nextPost,
  currentIndex,
  totalPosts,
}: Props) {
  const linkParams = `?from=collection&collectionSlug=${encodeURIComponent(collectionSlug)}&collectionName=${encodeURIComponent(collectionTitle)}`;

  return (
    <div className="mt-12 pt-8 border-t border-border">
      {/* Collection label + progress */}
      <div className="flex items-center justify-between mb-5">
        <Link
          href={`/collections/${collectionSlug}`}
          className="text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          {collectionTitle}
        </Link>
        <span className="text-xs text-muted-foreground">
          {currentIndex + 1} of {totalPosts}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 bg-muted rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-foreground/60 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / totalPosts) * 100}%` }}
        />
      </div>

      {/* Prev / Next */}
      <div className="grid grid-cols-2 gap-4">
        {prevPost ? (
          <Link
            href={`/post/${prevPost.slug}${linkParams}`}
            className="group flex items-start gap-3 p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors"
          >
            <FiChevronLeft
              size={18}
              className="mt-0.5 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors"
            />
            <div className="min-w-0">
              <span className="text-xs text-muted-foreground block mb-1">
                Previous
              </span>
              <span className="text-sm font-medium text-foreground line-clamp-2 leading-snug">
                {prevPost.title}
              </span>
            </div>
          </Link>
        ) : (
          <div />
        )}

        {nextPost ? (
          <Link
            href={`/post/${nextPost.slug}${linkParams}`}
            className="group flex items-start gap-3 p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors text-right justify-end"
          >
            <div className="min-w-0">
              <span className="text-xs text-muted-foreground block mb-1">
                Next
              </span>
              <span className="text-sm font-medium text-foreground line-clamp-2 leading-snug">
                {nextPost.title}
              </span>
            </div>
            <FiChevronRight
              size={18}
              className="mt-0.5 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors"
            />
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
