"use client";

import { useCollection } from "@/hooks/common/useCollections";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Spinner from "@/components/ui/spinner";
import { FiArrowLeft, FiCalendar, FiUser } from "react-icons/fi";

export default function CollectionDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: collection, isLoading, error } = useCollection(slug);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size={28} />
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="text-center py-24 text-muted-foreground">
        Collection not found.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 font-space-grotesk">
      <Link
        href="/collections"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <FiArrowLeft size={14} />
        All Collections
      </Link>

      {/* Collection Header */}
      <div className="mb-10">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {collection.category.name}
        </span>
        <h1 className="text-3xl lg:text-4xl font-bold text-foreground mt-1">
          {collection.title}
        </h1>
        {collection.description && (
          <p className="text-muted-foreground mt-3 text-lg leading-relaxed">
            {collection.description}
          </p>
        )}
      </div>

      {/* Posts List */}
      {collection.items.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p>This collection has no posts yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {collection.items.map((item, index) => (
            <Link
              key={item.id}
              href={`/post/${item.post.slug}?from=collection&collectionSlug=${slug}&collectionName=${encodeURIComponent(collection.title)}`}
              className="group flex flex-col sm:flex-row gap-5 p-5 bg-card rounded-xl border border-border hover:shadow-md dark:hover:shadow-gray-900/30 transition-all duration-200"
            >
              {/* Number */}
              <div className="shrink-0 flex items-start">
                <span className="text-3xl font-bold text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors w-10 text-right">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              {/* Thumbnail */}
              {item.post.thumbnailUrl && (
                <div className="relative w-full sm:w-40 h-28 shrink-0 rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={item.post.thumbnailUrl}
                    alt={item.post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              {/* Content */}
              <div className="flex flex-col justify-center min-w-0">
                <h2 className="text-lg font-bold text-foreground group-hover:text-foreground/80 transition-colors">
                  {item.post.title}
                </h2>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {item.post.meta}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <FiUser size={11} />
                    {item.post.author.name}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <FiCalendar size={11} />
                    {new Date(item.post.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
