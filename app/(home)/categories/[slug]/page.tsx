"use client";

import { useParams } from "next/navigation";
import { useCategory } from "@/hooks/common/useCategories";
import { usePostsByCategory } from "@/hooks/common/usePosts";
import Link from "next/link";
import Image from "next/image";
import Spinner from "@/components/ui/spinner";
import { FiChevronRight, FiCalendar, FiUser, FiFileText } from "react-icons/fi";
import { formatDate, getReadTime } from "@/lib/transformPosts";

export default function CategoryDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const {
    data: category,
    isLoading: catLoading,
    error: catError,
  } = useCategory(slug);
  const {
    data: posts,
    isLoading: postsLoading,
    error: postsError,
  } = usePostsByCategory(category?.id ?? "");

  const isLoading = catLoading || (!!category && postsLoading);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size={28} />
      </div>
    );
  }

  if (catError || !category) {
    return (
      <div className="text-center py-24 text-muted-foreground">
        Category not found.
      </div>
    );
  }

  const postList = posts ?? [];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 font-space-grotesk">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1 text-sm text-muted-foreground mb-8"
      >
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <FiChevronRight size={13} className="text-muted-foreground shrink-0" />
        <Link
          href="/categories"
          className="hover:text-foreground transition-colors"
        >
          Categories
        </Link>
        <FiChevronRight size={13} className="text-muted-foreground shrink-0" />
        <span className="text-foreground font-medium">{category.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
          {category.name}
        </h1>
        {category.description && (
          <p className="text-muted-foreground mt-3 text-lg leading-relaxed">
            {category.description}
          </p>
        )}
        <p className="text-sm text-muted-foreground mt-2">
          {postList.length} {postList.length === 1 ? "post" : "posts"}
        </p>
      </div>

      {/* Posts */}
      {postsError ? (
        <div className="text-center py-16 text-muted-foreground">
          Failed to load posts.
        </div>
      ) : postList.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <FiFileText size={36} className="mx-auto mb-4 opacity-40" />
          <p>No posts in this category yet.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {postList.map((post) => (
            <Link
              key={post.id}
              href={`/post/${post.slug}?from=category&categorySlug=${slug}&categoryName=${encodeURIComponent(category.name)}`}
              className="group flex flex-col sm:flex-row gap-5 p-5 bg-card rounded-xl border border-border hover:shadow-md dark:hover:shadow-gray-900/30 transition-all duration-200"
            >
              {/* Thumbnail */}
              {post.thumbnailUrl ? (
                <div className="relative w-full sm:w-40 h-28 shrink-0 rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={post.thumbnailUrl}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="hidden sm:block w-40 h-28 shrink-0 rounded-lg bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700" />
              )}

              {/* Content */}
              <div className="flex flex-col justify-center min-w-0">
                <h2 className="text-lg font-bold text-foreground group-hover:text-foreground/80 transition-colors">
                  {post.title}
                </h2>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {post.meta}
                </p>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <FiUser size={11} />
                    {post.author.name}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <FiCalendar size={11} />
                    {formatDate(post.createdAt)}
                  </span>
                  <span>{getReadTime(post.content)} min read</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
