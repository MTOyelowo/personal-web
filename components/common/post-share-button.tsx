"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { FiShare2, FiCopy, FiCheck } from "react-icons/fi";
import {
  FaWhatsapp,
  FaXTwitter,
  FaFacebookF,
  FaLinkedinIn,
} from "react-icons/fa6";

interface PostShareButtonProps {
  title: string;
  slug: string;
  meta?: string;
}

const SITE_URL = "https://tmoyelowo.com";

export default function PostShareButton({
  title,
  slug,
  meta,
}: PostShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const postUrl = `${SITE_URL}/post/${slug}`;
  const shareText = meta || title;

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
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

  const handleNativeShare = useCallback(async () => {
    try {
      await navigator.share({ title, text: shareText, url: postUrl });
    } catch {
      // User cancelled or share failed — just open the menu instead
      setIsOpen(true);
    }
  }, [title, shareText, postUrl]);

  const handleToggle = useCallback(() => {
    if (
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function"
    ) {
      handleNativeShare();
    } else {
      setIsOpen((prev) => !prev);
    }
  }, [handleNativeShare]);

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
