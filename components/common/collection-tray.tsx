"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { FiBookOpen, FiX, FiCheck } from "react-icons/fi";
import type { CollectionData } from "./collection-types";

interface Props {
  collection: CollectionData;
  currentPostId: string;
}

export default function CollectionTray({ collection, currentPostId }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const trayRef = useRef<HTMLDivElement>(null);
  const currentItemRef = useRef<HTMLAnchorElement>(null);

  const linkParams = `?from=collection&collectionSlug=${encodeURIComponent(collection.slug)}&collectionName=${encodeURIComponent(collection.title)}`;

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (trayRef.current && !trayRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  // Scroll current post into view when tray opens
  useEffect(() => {
    if (isOpen && currentItemRef.current) {
      currentItemRef.current.scrollIntoView({
        block: "center",
        behavior: "smooth",
      });
    }
  }, [isOpen]);

  // Find current post index
  const currentIndex = collection.items.findIndex(
    (item) => item.post.id === currentPostId,
  );

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open collection table of contents"
        className="
          fixed bottom-6 right-6 z-40
          w-12 h-12 rounded-full
          bg-foreground text-background
          shadow-lg hover:shadow-xl
          flex items-center justify-center
          transition-all duration-200
          hover:scale-105 active:scale-95
          cursor-pointer
        "
      >
        <FiBookOpen size={20} />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-200"
          aria-hidden="true"
        />
      )}

      {/* Slide-out tray */}
      <div
        ref={trayRef}
        className={`
          fixed top-0 right-0 z-50
          h-full w-full max-w-sm
          bg-background border-l border-border shadow-2xl
          transform transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
        role="dialog"
        aria-label="Collection contents"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="min-w-0 pr-4">
            <span className="text-xs uppercase tracking-wider text-muted-foreground block mb-1">
              Collection
            </span>
            <h2 className="text-base font-bold text-foreground font-libre truncate">
              {collection.title}
            </h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close collection tray"
            className="p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer shrink-0"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Progress */}
        <div className="px-5 pt-4 pb-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Progress</span>
            <span>
              {currentIndex + 1} / {collection.items.length} chapters
            </span>
          </div>
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-foreground/60 rounded-full transition-all duration-300"
              style={{
                width: `${((currentIndex + 1) / collection.items.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Post list */}
        <nav
          className="flex-1 overflow-y-auto px-3 py-3"
          style={{ maxHeight: "calc(100vh - 160px)" }}
        >
          <ul className="space-y-1">
            {collection.items.map((item, index) => {
              const isCurrent = item.post.id === currentPostId;
              const isPast = index < currentIndex;

              return (
                <li key={item.id}>
                  <Link
                    ref={isCurrent ? currentItemRef : undefined}
                    href={
                      isCurrent ? "#" : `/post/${item.post.slug}${linkParams}`
                    }
                    onClick={() => {
                      if (!isCurrent) setIsOpen(false);
                    }}
                    className={`
                      flex items-start gap-3 px-3 py-3 rounded-lg
                      transition-colors text-sm
                      ${
                        isCurrent
                          ? "bg-foreground/10 text-foreground font-medium cursor-default"
                          : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                      }
                    `}
                  >
                    {/* Chapter number / check */}
                    <span
                      className={`
                        shrink-0 mt-0.5 w-6 h-6 rounded-full
                        flex items-center justify-center text-xs font-medium
                        ${
                          isCurrent
                            ? "bg-foreground text-background"
                            : isPast
                              ? "bg-foreground/20 text-foreground"
                              : "bg-muted text-muted-foreground"
                        }
                      `}
                    >
                      {isPast ? <FiCheck size={12} /> : index + 1}
                    </span>

                    <span className="line-clamp-2 leading-snug pt-0.5">
                      {item.post.title}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
}
