"use client";

import { FC, JSX } from "react";
import { FiX, FiCalendar, FiUser, FiTag } from "react-icons/fi";

interface Props {
  open: boolean;
  title: string;
  meta: string;
  content: string;
  category: string;
  tags: string;
  thumbnailUrl?: string;
  onClose: () => void;
}

const PostPreview: FC<Props> = ({
  open,
  title,
  meta,
  content,
  category,
  tags,
  thumbnailUrl,
  onClose,
}): JSX.Element | null => {
  if (!open) return null;

  const tagList = tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm overflow-y-auto px-4 pb-4">
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl">
        {/* Header bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 rounded-t-2xl">
          <span className="text-sm font-medium text-gray-500">
            Post Preview
          </span>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Preview content */}
        <div className="px-8 py-8">
          {/* Category */}
          {category && (
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              {category}
            </span>
          )}

          {/* Title */}
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-2 mb-3 leading-tight">
            {title || "Untitled Post"}
          </h1>

          {/* Meta description */}
          {meta && <p className="text-gray-500 mb-4 italic">{meta}</p>}

          {/* Date line */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-8">
            <span className="inline-flex items-center gap-1.5">
              <FiUser size={14} />
              You
            </span>
            <span className="inline-flex items-center gap-1.5">
              <FiCalendar size={14} />
              {today}
            </span>
          </div>

          {/* Thumbnail */}
          {thumbnailUrl && (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-8 bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumbnailUrl}
                alt="Thumbnail preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content */}
          {content ? (
            <div
              className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            <p className="text-gray-300 italic">No content yet...</p>
          )}

          {/* Tags */}
          {tagList.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-8 pt-6 border-t border-gray-200">
              <FiTag size={14} className="text-gray-400" />
              {tagList.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostPreview;
