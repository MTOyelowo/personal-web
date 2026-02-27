"use client";

import { useCategories } from "@/hooks/common/useCategories";
import Link from "next/link";
import Spinner from "@/components/ui/spinner";
import { FiFolder, FiFileText, FiGrid } from "react-icons/fi";

export default function CategoriesPage() {
  const { data: categories, isLoading, error } = useCategories();

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size={28} />
      </div>
    );
  }

  if (error || !categories) {
    return (
      <div className="text-center py-24 text-gray-500">
        Failed to load categories.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 font-space-grotesk">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-primary mb-3">Categories</h1>
        <p className="text-gray-500 text-lg">Browse posts organised by topic</p>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FiFolder size={40} className="mx-auto mb-4 opacity-40" />
          <p>No categories yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 p-6"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                  <FiFolder size={22} className="text-gray-500" />
                </div>
                <span className="text-xs font-medium text-gray-400 bg-gray-50 border border-gray-200 rounded-full px-2.5 py-1">
                  {category._count.posts}{" "}
                  {category._count.posts === 1 ? "post" : "posts"}
                </span>
              </div>

              <h2 className="text-lg font-bold text-gray-900 mt-3 group-hover:text-gray-700 transition-colors">
                {category.name}
              </h2>

              {category.description && (
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                  {category.description}
                </p>
              )}

              {category._count.collections > 0 && (
                <div className="flex items-center gap-1.5 mt-4 text-xs text-gray-400">
                  <FiGrid size={12} />
                  <span>
                    {category._count.collections}{" "}
                    {category._count.collections === 1
                      ? "collection"
                      : "collections"}
                  </span>
                </div>
              )}

              {category._count.collections === 0 && (
                <div className="flex items-center gap-1.5 mt-4 text-xs text-gray-400">
                  <FiFileText size={12} />
                  <span>
                    {category._count.posts}{" "}
                    {category._count.posts === 1 ? "post" : "posts"}
                  </span>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
