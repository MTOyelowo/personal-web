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
      <div className="text-center py-24 text-gray-500">
        Collection not found.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 font-space-grotesk">
      <Link
        href="/collections"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-8"
      >
        <FiArrowLeft size={14} />
        All Collections
      </Link>

      {/* Collection Header */}
      <div className="mb-10">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          {collection.category.name}
        </span>
        <h1 className="text-3xl lg:text-4xl font-bold text-primary mt-1">
          {collection.title}
        </h1>
        {collection.description && (
          <p className="text-gray-500 mt-3 text-lg leading-relaxed">
            {collection.description}
          </p>
        )}
      </div>

      {/* Posts List */}
      {collection.items.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p>This collection has no posts yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {collection.items.map((item, index) => (
            <Link
              key={item.id}
              href={`/post/${item.post.slug}?from=collection&collectionSlug=${slug}&collectionName=${encodeURIComponent(collection.title)}`}
              className="group flex flex-col sm:flex-row gap-5 p-5 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200"
            >
              {/* Number */}
              <div className="shrink-0 flex items-start">
                <span className="text-3xl font-bold text-gray-200 group-hover:text-gray-400 transition-colors w-10 text-right">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              {/* Thumbnail */}
              {item.post.thumbnailUrl && (
                <div className="relative w-full sm:w-40 h-28 shrink-0 rounded-lg overflow-hidden bg-gray-100">
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
                <h2 className="text-lg font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
                  {item.post.title}
                </h2>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {item.post.meta}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
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
