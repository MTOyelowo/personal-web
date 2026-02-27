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

export default function PostPage() {
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
        <p className="text-gray-500 mb-4">Post not found.</p>
        <Link href="/" className="text-sm text-gray-900 underline">
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
        className="flex flex-wrap items-center gap-1 text-sm text-gray-500 mb-8"
      >
        {breadcrumbs.map((crumb, i) => {
          const isLast = i === breadcrumbs.length - 1;
          return (
            <span key={i} className="inline-flex items-center gap-1">
              {i > 0 && (
                <FiChevronRight size={13} className="text-gray-400 shrink-0" />
              )}
              {crumb.href && !isLast ? (
                <Link
                  href={crumb.href}
                  className="hover:text-gray-900 transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className={isLast ? "text-gray-900 font-medium" : ""}>
                  {crumb.label}
                </span>
              )}
            </span>
          );
        })}
      </nav>

      {/* Title */}
      <h1 className="text-3xl lg:text-5xl font-bold text-primary mt-2 mb-4 font-libre leading-tight">
        {post.title}
      </h1>

      {/* Meta info */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-8">
        <span className="inline-flex items-center gap-1.5">
          <FiUser size={14} />
          {post.author.name}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <FiCalendar size={14} />
          {formatDate(post.createdAt)}
        </span>
        <span>{getReadTime(post.content)} min read</span>
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
        className="prose prose-lg max-w-none prose-headings:font-libre prose-headings:text-primary prose-p:text-gray-700 prose-a:text-blue-600"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-10 pt-6 border-t border-gray-200">
          <FiTag size={14} className="text-gray-400" />
          {post.tags.map((tag) => (
            <Link
              key={tag}
              href={`/tags/${encodeURIComponent(tag)}`}
              className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
            >
              {tag}
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}
