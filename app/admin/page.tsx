"use client";

import { FC, JSX } from "react";
import Link from "next/link";
import {
  FiFileText,
  FiSun,
  FiFolder,
  FiTag,
  FiArrowRight,
} from "react-icons/fi";
import StatCard from "@/components/admin/stat-card";
import { useDashboardStats } from "@/hooks/query/useAdmin";
import Spinner from "@/components/ui/spinner";

const AdminDashboard: FC = (): JSX.Element => {
  const { data, isLoading, error } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size={28} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-24 text-gray-500">
        Failed to load dashboard data.
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Posts"
          value={data.posts}
          icon={<FiFileText size={20} />}
        />
        <StatCard
          label="Daily Words"
          value={data.dailyWords}
          icon={<FiSun size={20} />}
        />
        <StatCard
          label="Collections"
          value={data.collections}
          icon={<FiFolder size={20} />}
        />
        <StatCard
          label="Categories"
          value={data.categories}
          icon={<FiTag size={20} />}
        />
      </div>

      {/* Recent posts */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">
            Recent Posts
          </h2>
          <Link
            href="/admin/posts"
            className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors"
          >
            View all <FiArrowRight size={14} />
          </Link>
        </div>

        {data.recentPosts.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-gray-400">
            No posts yet. Create your first post to get started.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {data.recentPosts.map((post) => (
              <li
                key={post.id}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
              >
                <div className="min-w-0">
                  <Link
                    href={`/admin/posts/${post.slug}/edit`}
                    className="text-sm font-medium text-gray-900 hover:underline truncate block"
                  >
                    {post.title}
                  </Link>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {post.author.name} ·{" "}
                    {new Date(post.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400 shrink-0 ml-4">
                  <span>{post._count.comments} comments</span>
                  <span>{post._count.likes} likes</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <Link
          href="/admin/posts/create"
          className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 transition-colors"
        >
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <FiFileText size={18} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">New Post</p>
            <p className="text-xs text-gray-400">Write a new article</p>
          </div>
        </Link>
        <Link
          href="/admin/daily-words/create"
          className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 transition-colors"
        >
          <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
            <FiSun size={18} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">New Daily Word</p>
            <p className="text-xs text-gray-400">Schedule a quote</p>
          </div>
        </Link>
        <Link
          href="/admin/collections/create"
          className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 transition-colors"
        >
          <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
            <FiFolder size={18} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">New Collection</p>
            <p className="text-xs text-gray-400">Group related works</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
