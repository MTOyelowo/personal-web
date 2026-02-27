"use client";

import { useCollections } from "@/hooks/common/useCollections";
import Link from "next/link";
import Image from "next/image";
import Spinner from "@/components/ui/spinner";
import { FiGrid, FiFileText } from "react-icons/fi";

export default function CollectionsPage() {
  const { data: collections, isLoading, error } = useCollections();

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size={28} />
      </div>
    );
  }

  if (error || !collections) {
    return (
      <div className="text-center py-24 text-gray-500">
        Failed to load collections.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 font-space-grotesk">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-primary mb-3">Collections</h1>
        <p className="text-gray-500 text-lg">
          Curated groups of posts organized by topic
        </p>
      </div>

      {collections.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FiGrid size={40} className="mx-auto mb-4 opacity-40" />
          <p>No collections yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/collections/${collection.slug}`}
              className="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              {collection.coverUrl ? (
                <div className="relative h-44 bg-gray-100">
                  <Image
                    src={collection.coverUrl}
                    alt={collection.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="h-44 bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <FiGrid size={32} className="text-gray-300" />
                </div>
              )}
              <div className="p-5">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {collection.category.name}
                </span>
                <h2 className="text-lg font-bold text-gray-900 mt-1 group-hover:text-gray-700 transition-colors">
                  {collection.title}
                </h2>
                {collection.description && (
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                    {collection.description}
                  </p>
                )}
                <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-400">
                  <FiFileText size={12} />
                  <span>
                    {collection._count.items}{" "}
                    {collection._count.items === 1 ? "post" : "posts"}
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
