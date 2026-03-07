"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";
import { FiChevronRight, FiTag } from "react-icons/fi";
import Spinner from "@/components/ui/spinner";

interface TagWithCount {
  name: string;
  count: number;
}

export default function TagsPage() {
  const { data: tags, isLoading } = useQuery<TagWithCount[]>({
    queryKey: ["tags"],
    queryFn: async () => {
      const res = await axios.get("/api/tags");
      return res.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size={28} />
      </div>
    );
  }

  const tagList = tags ?? [];

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
        <span className="text-foreground font-medium">Tags</span>
      </nav>

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl lg:text-4xl font-bold text-foreground font-libre">
          Tags
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Browse posts by topic
        </p>
      </div>

      {/* Tags grid */}
      {tagList.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <FiTag size={36} className="mx-auto mb-4 opacity-40" />
          <p>No tags found.</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {tagList.map((tag) => (
            <Link
              key={tag.name}
              href={`/tags/${encodeURIComponent(tag.name)}`}
              className="group inline-flex items-center gap-2 px-4 py-2.5 bg-muted rounded-full border border-transparent hover:border-foreground/20 transition-all"
            >
              <span className="text-sm font-medium text-foreground group-hover:text-foreground/80">
                #{tag.name}
              </span>
              <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full">
                {tag.count}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
