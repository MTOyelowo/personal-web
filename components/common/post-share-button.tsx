"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { FiShare2, FiCopy, FiCheck } from "react-icons/fi";
import {
  FaWhatsapp,
  FaXTwitter,
  FaFacebookF,
  FaLinkedinIn,
} from "react-icons/fa6";
import {
  READ_PARAM,
  type ReadMode,
  describeReadMode,
  parseReadMode,
} from "@/lib/reader/read-mode";

interface PostShareButtonProps {
  title: string;
  slug: string;
  meta?: string;
}

const SITE_URL = "https://tmoyelowo.com";

/** The current reading mode from the address bar, if the reader set one. */
function currentReadMode(): ReadMode | null {
  if (typeof window === "undefined") return null;
  return parseReadMode(new URLSearchParams(window.location.search).get(READ_PARAM));
}

export default function PostShareButton({
  title,
  slug,
  meta,
}: PostShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [readMode, setReadMode] = useState<ReadMode | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const baseUrl = `${SITE_URL}/post/${slug}`;
  // Shared links open the post the way it is being read now
  const postUrl = readMode ? `${baseUrl}?${READ_PARAM}=${readMode}` : baseUrl;
  const shareText = meta || title;

  // Close on outside tap or click
  useEffect(() => {
    function handleClickOutside(e: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("pointerdown", handleClickOutside);
    }
    return () => document.removeEventListener("pointerdown", handleClickOutside);
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

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const textarea = document.createElement("textarea");
      textarea.value = postUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [postUrl]);

  /**
   * Opens the system share sheet straight from the tap. Phones only allow
   * it right after a tap, so nothing may be awaited first; fetching the
   * cover image here used to make the sheet fail, and attaching an image
   * made apps like WhatsApp drop the link. Link previews still show the
   * cover, from the page's metadata.
   */
  const handleNativeShare = useCallback(
    (url: string) => {
      const shareData: ShareData = { title, text: shareText, url };
      if (navigator.canShare && !navigator.canShare(shareData)) {
        setIsOpen(true);
        return;
      }
      navigator.share(shareData).catch((error: unknown) => {
        // Closing the sheet is a choice, not a failure
        if (error instanceof DOMException && error.name === "AbortError") return;
        setIsOpen(true);
      });
    },
    [title, shareText],
  );

  const handleToggle = useCallback(() => {
    const mode = currentReadMode();
    setReadMode(mode);
    if (
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function"
    ) {
      handleNativeShare(mode ? `${baseUrl}?${READ_PARAM}=${mode}` : baseUrl);
    } else {
      setIsOpen((prev) => !prev);
    }
  }, [handleNativeShare, baseUrl]);

  const shareTargets = [
    {
      name: "Copy link",
      icon: copied ? FiCheck : FiCopy,
      onClick: handleCopyLink,
      className: copied
        ? "text-green-500"
        : "text-muted-foreground hover:text-foreground",
    },
    {
      name: "X",
      icon: FaXTwitter,
      onClick: () =>
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(postUrl)}`,
          "_blank",
          "noopener,noreferrer",
        ),
      className: "text-muted-foreground hover:text-foreground",
    },
    {
      name: "Facebook",
      icon: FaFacebookF,
      onClick: () =>
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`,
          "_blank",
          "noopener,noreferrer",
        ),
      className: "text-muted-foreground hover:text-[#1877F2]",
    },
    {
      name: "WhatsApp",
      icon: FaWhatsapp,
      onClick: () =>
        window.open(
          `https://wa.me/?text=${encodeURIComponent(`${shareText} ${postUrl}`)}`,
          "_blank",
          "noopener,noreferrer",
        ),
      className: "text-muted-foreground hover:text-[#25D366]",
    },
    {
      name: "LinkedIn",
      icon: FaLinkedinIn,
      onClick: () =>
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`,
          "_blank",
          "noopener,noreferrer",
        ),
      className: "text-muted-foreground hover:text-[#0A66C2]",
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={handleToggle}
        aria-label="Share this post"
        className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <FiShare2 size={14} />
        <span className="text-sm">Share</span>
      </button>

      {isOpen && (
        <div
          className="
            absolute top-full mt-2 right-0 z-50
            min-w-[180px] py-2 rounded-xl
            bg-background border border-border shadow-lg
            animate-in fade-in slide-in-from-top-1 duration-150
          "
          role="menu"
        >
          {readMode && (
            <p className="px-4 pb-2 mb-1 text-xs text-muted-foreground border-b border-border">
              Opens {describeReadMode(readMode)}
            </p>
          )}
          {shareTargets.map(({ name, icon: Icon, onClick, className }) => (
            <button
              key={name}
              onClick={onClick}
              role="menuitem"
              className={`
                w-full flex items-center gap-3 px-4 py-2.5 text-sm
                transition-colors cursor-pointer
                hover:bg-muted/60
                ${className}
              `}
            >
              <Icon size={15} className="shrink-0" />
              <span>{name === "Copy link" && copied ? "Copied!" : name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
