"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import Spinner from "@/components/ui/spinner";
import { FiCalendar, FiUser, FiTag, FiChevronRight } from "react-icons/fi";
import { PostSummary, formatDate, getReadTime } from "@/lib/transformPosts";
import { truncateText } from "@/lib/truncateText";
import PostShareButton from "@/components/common/post-share-button";
import CollectionNav from "@/components/common/collection-nav";
import CollectionTray from "@/components/common/collection-tray";
import RelatedPosts from "@/components/common/related-posts";
import LikeButton from "@/components/common/like-button";
import CommentSection from "@/components/common/comment-section";
import type { CollectionData } from "@/components/common/collection-types";
import dynamic from "next/dynamic";

const RichTextViewer = dynamic(
  () => import("@/components/editor/rich-text-viewer"),
  { ssr: false },
);

type BreadcrumbItem = { label: string; href?: string };

function getBreadcrumbs(
  post: PostSummary,
  from: string | null,
  collectionSlug: string | null,
  collectionName: string | null,
  tagParam: string | null,
): BreadcrumbItem[] {
  const title = truncateText(post.title, 40);
  const base: BreadcrumbItem = { label: "Home", href: "/" };

  if (from === "collection" && collectionSlug && collectionName) {
    return [
      base,
      { label: "Collections", href: "/collections" },
      { label: collectionName, href: `/collections/${collectionSlug}` },
      { label: title },
    ];
  }
  if (from === "collections") {
    return [
      base,
      { label: "Collections", href: "/collections" },
      { label: title },
    ];
  }
  if (from === "category") {
    return [
      base,
      { label: post.category.name, href: `/categories/${post.category.slug}` },
      { label: title },
    ];
  }
  if (from === "tag" && tagParam) {
    return [
      base,
      { label: `#${tagParam}`, href: `/tags/${encodeURIComponent(tagParam)}` },
      { label: title },
    ];
  }
  // default: from home
  return [base, { label: title }];
}

export default function PostContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const from = searchParams.get("from");
  const collectionSlug = searchParams.get("collectionSlug");
  const collectionName = searchParams.get("collectionName");
  const tagParam = searchParams.get("tag");

  const {
    data: post,
    isLoading,
    error,
  } = useQuery<PostSummary>({
    queryKey: ["post", slug],
    queryFn: async () => {
      const res = await axios.get(`/api/posts/${slug}`);
      return res.data.data;
    },
    enabled: !!slug,
  });

  // Determine if this post belongs to a collection
  const firstCollection = post?.collectionItems?.[0]?.collection ?? null;

  // Fetch collection data (ordered posts) when the post is in a collection
  const { data: collectionData } = useQuery<CollectionData>({
    queryKey: ["collection-posts", firstCollection?.id],
    queryFn: async () => {
      const res = await axios.get(
        `/api/collections/${firstCollection!.id}/posts`,
      );
      return res.data.data;
    },
    enabled: !!firstCollection?.id,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size={28} />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="text-center py-24">
        <p className="text-muted-foreground mb-4">Post not found.</p>
        <Link href="/" className="text-sm text-foreground underline">
          Back to Home
        </Link>
      </div>
    );
  }

  // Collection navigation helpers
  const isInCollection = !!collectionData;
  let currentIndex = -1;
  let prevPost = null;
  let nextPost = null;

  if (collectionData) {
    currentIndex = collectionData.items.findIndex(
      (item) => item.post.id === post.id,
    );
    if (currentIndex > 0) {
      prevPost = collectionData.items[currentIndex - 1].post;
    }
    if (currentIndex < collectionData.items.length - 1) {
      nextPost = collectionData.items[currentIndex + 1].post;
    }
  }

  const breadcrumbs = getBreadcrumbs(
    post,
    from,
    collectionSlug ?? collectionData?.slug ?? null,
    collectionName ?? collectionData?.title ?? null,
    tagParam,
  );

  return (
    <>
      <article className="max-w-3xl mx-auto px-6 py-12 font-space-grotesk">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground mb-8"
        >
          {breadcrumbs.map((crumb, i) => {
            const isLast = i === breadcrumbs.length - 1;
            return (
              <span key={i} className="inline-flex items-center gap-1">
                {i > 0 && (
                  <FiChevronRight
                    size={13}
                    className="text-muted-foreground shrink-0"
                  />
                )}
                {crumb.href && !isLast ? (
                  <Link
                    href={crumb.href}
                    className="hover:text-foreground transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={isLast ? "text-foreground font-medium" : ""}>
                    {crumb.label}
                  </span>
                )}
              </span>
            );
          })}
        </nav>

        {/* Title */}
        <h1 className="text-3xl lg:text-5xl font-bold text-foreground mt-2 mb-4 font-libre leading-tight">
          {post.title}
        </h1>

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8">
          <span className="inline-flex items-center gap-1.5">
            <FiUser size={14} />
            {post.author.name}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <FiCalendar size={14} />
            {formatDate(post.createdAt)}
          </span>
          <span>{getReadTime(post.content)} min read</span>
          <span className="ml-auto">
            <PostShareButton
              title={post.title}
              slug={post.slug}
              meta={post.meta}
            />
          </span>
        </div>

        {/* Thumbnail */}
        {post.thumbnailUrl && (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-10">
            <Image
              src={post.thumbnailUrl}
              alt={post.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Content */}
        <RichTextViewer
          content={post.content}
          className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-libre prose-headings:text-foreground prose-p:text-foreground/80 prose-a:text-blue-600 dark:prose-a:text-blue-400"
        />

        {/* Like */}
        <span className="ml-auto pt-10">
          <LikeButton postId={post.id} />
        </span>

        {/* Comments */}
        <CommentSection postId={post.id} />

        {/* Tags & Like */}
        <div className="flex flex-wrap items-center gap-2 mt-10 pt-6 border-t border-border">
          {post.tags.length > 0 && (
            <>
              <FiTag size={14} className="text-muted-foreground" />
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/tags/${encodeURIComponent(tag)}`}
                  className="px-3 py-1 text-xs font-medium bg-muted text-muted-foreground rounded-full hover:bg-muted/80 transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </>
          )}
        </div>

        {/* Collection: Previous / Next navigation */}
        {isInCollection && collectionData && (
          <CollectionNav
            collectionTitle={collectionData.title}
            collectionSlug={collectionData.slug}
            prevPost={prevPost}
            nextPost={nextPost}
            currentIndex={currentIndex}
            totalPosts={collectionData.items.length}
          />
        )}

        {/* Non-collection: Related Posts */}
        {!isInCollection && <RelatedPosts postSlug={slug} />}
      </article>

      {/* Collection: Floating tray button */}
      {isInCollection && collectionData && (
        <CollectionTray collection={collectionData} currentPostId={post.id} />
      )}
    </>
  );
}
