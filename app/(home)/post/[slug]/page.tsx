import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FiCalendar, FiUser, FiTag, FiChevronRight } from "react-icons/fi";
import { getPostBySlug, getCollectionData } from "@/lib/posts";
import { renderPostContent } from "@/lib/render-post-content";
import { formatDate, getReadTime } from "@/lib/transformPosts";
import { truncateText } from "@/lib/truncateText";
import PostShareButton from "@/components/common/post-share-button";
import CollectionNav from "@/components/common/collection-nav";
import CollectionTray from "@/components/common/collection-tray";
import RelatedPosts from "@/components/common/related-posts";
import LikeButton from "@/components/common/like-button";
import CommentSection from "@/components/common/comment-section";

type SearchParams = Record<string, string | string[] | undefined>;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}

type BreadcrumbItem = { label: string; href?: string };

function getParam(searchParams: SearchParams, key: string): string | null {
  const value = searchParams[key];
  return (Array.isArray(value) ? value[0] : value) ?? null;
}

function getBreadcrumbs(
  post: { title: string; category: { name: string; slug: string } },
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

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

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

export default async function PostPage({ params, searchParams }: PageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  // Determine if this post belongs to a collection
  const firstCollectionId = post.collectionItems[0]?.collection.id ?? null;
  const collectionData = firstCollectionId
    ? await getCollectionData(firstCollectionId)
    : null;

  // Collection navigation helpers
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
    getParam(query, "from"),
    getParam(query, "collectionSlug") ?? collectionData?.slug ?? null,
    getParam(query, "collectionName") ?? collectionData?.title ?? null,
    getParam(query, "tag"),
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
            <time dateTime={post.createdAt.toISOString()}>
              {formatDate(post.createdAt.toISOString())}
            </time>
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
              priority
              className="object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-libre prose-headings:text-foreground prose-p:text-foreground/80 prose-a:text-blue-600 dark:prose-a:text-blue-400">
          {renderPostContent(post.content)}
        </div>

        {/* Like */}
        <div className="ml-auto pt-10">
          <LikeButton postId={post.id} />
        </div>

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
        {collectionData && (
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
        {!collectionData && <RelatedPosts postSlug={slug} />}
      </article>

      {/* Collection: Floating tray button */}
      {collectionData && (
        <CollectionTray collection={collectionData} currentPostId={post.id} />
      )}
    </>
  );
}
