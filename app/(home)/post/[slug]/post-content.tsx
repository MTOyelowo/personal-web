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

  const breadcrumbs = getBreadcrumbs(
    post,
    from,
    collectionSlug,
    collectionName,
    tagParam,
  );

  return (
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
            thumbnailUrl={post.thumbnailUrl}
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
      <div
        className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-libre prose-headings:text-foreground prose-p:text-foreground/80 prose-a:text-blue-600 dark:prose-a:text-blue-400"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-10 pt-6 border-t border-border">
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
        </div>
      )}
    </article>
  );
}
