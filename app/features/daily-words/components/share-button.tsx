"use client";

import { useState, useCallback } from "react";
import { FiShare2, FiX, FiDownload } from "react-icons/fi";
import {
  FaWhatsapp,
  FaXTwitter,
  FaFacebookF,
  FaInstagram,
} from "react-icons/fa6";
import type { DailyQuote, TextAlign, QuoteBackground } from "../types";
import { renderQuoteImage } from "../render-quote-image";
import type { FC, JSX } from "react";

interface Props {
  quote: DailyQuote;
  background?: QuoteBackground;
  gradient?: string;
  textAlign: TextAlign;
  quoteColor: string;
  authorColor: string;
}

interface ShareTarget {
  name: string;
  icon: typeof FaWhatsapp;
  color: string;
  action: (blob: Blob, text: string) => void | Promise<void>;
}

const ShareButton: FC<Props> = ({
  quote,
  background,
  gradient,
  textAlign,
  quoteColor,
  authorColor,
}): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const quoteText = quote.author
    ? `"${quote.text}" — ${quote.author}`
    : `"${quote.text}"`;

  const generateImage = useCallback(async (): Promise<Blob> => {
    return renderQuoteImage({
      quote,
      background,
      gradient,
      textAlign,
      quoteColor,
      authorColor,
    });
  }, [quote, background, gradient, textAlign, quoteColor, authorColor]);

  const downloadImage = useCallback(
    async (blob: Blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `daily-words-${quote.id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    [quote.id],
  );

  const tryNativeShare = useCallback(async (blob: Blob, text: string) => {
    const file = new File([blob], "daily-words.png", { type: "image/png" });

    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ text, files: [file] });
      return true;
    }
    return false;
  }, []);

  const handleShare = useCallback(
    async (target: ShareTarget) => {
      setIsGenerating(true);
      try {
        const blob = await generateImage();
        await target.action(blob, quoteText);
      } catch (err) {
        console.error("Share failed:", err);
      } finally {
        setIsGenerating(false);
        setIsOpen(false);
      }
    },
    [generateImage, quoteText],
  );

  const shareTargets: ShareTarget[] = [
    {
      name: "WhatsApp",
      icon: FaWhatsapp,
      color: "#25D366",
      action: async (blob, text) => {
        const shared = await tryNativeShare(blob, text);
        if (!shared) {
          window.open(
            `https://wa.me/?text=${encodeURIComponent(text)}`,
            "_blank",
          );
        }
      },
    },
    {
      name: "X",
      icon: FaXTwitter,
      color: "#ffffff",
      action: async (blob, text) => {
        const shared = await tryNativeShare(blob, text);
        if (!shared) {
          window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
            "_blank",
          );
        }
      },
    },
    {
      name: "Facebook",
      icon: FaFacebookF,
      color: "#1877F2",
      action: async (blob, text) => {
        const shared = await tryNativeShare(blob, text);
        if (!shared) {
          window.open(
            `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(text)}`,
            "_blank",
          );
        }
      },
    },
    {
      name: "Instagram",
      icon: FaInstagram,
      color: "#E4405F",
      action: async (blob) => {
        // Instagram has no web share URL — download the image instead
        const shared = await tryNativeShare(blob, quoteText);
        if (!shared) {
          await downloadImage(blob);
        }
      },
    },
    {
      name: "Download",
      icon: FiDownload,
      color: "#ffffff",
      action: async (blob) => {
        await downloadImage(blob);
      },
    },
  ];

  return (
    <div className="relative">
      {/* Share toggle */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close share menu" : "Share quote"}
        className="
          flex items-center gap-2 px-3 py-2 rounded-full
          bg-white/10 backdrop-blur-md text-white/80
          hover:bg-white/20 hover:text-white
          transition-all duration-200 cursor-pointer text-xs font-space-grotesk
        "
      >
        {isOpen ? (
          <FiX className="w-3.5 h-3.5" />
        ) : (
          <FiShare2 className="w-3.5 h-3.5" />
        )}
        {isOpen ? "Close" : "Share"}
      </button>

      {/* Share options dropdown */}
      {isOpen && (
        <div
          className="
            absolute bottom-full mb-3 left-0
            p-3 rounded-xl
            bg-black/70 backdrop-blur-xl border border-white/10
            flex items-center gap-3 shadow-2xl z-30
          "
        >
          {isGenerating && (
            <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center z-40">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          )}

          {shareTargets.map(({ name, icon: Icon, color, action }) => (
            <button
              key={name}
              onClick={() => handleShare({ name, icon: Icon, color, action })}
              aria-label={`Share on ${name}`}
              title={name}
              disabled={isGenerating}
              className="
                w-9 h-9 rounded-full flex items-center justify-center
                bg-white/10 hover:bg-white/20
                transition-all duration-200 cursor-pointer
                disabled:opacity-50 disabled:cursor-wait
              "
            >
              <Icon className="w-4 h-4" style={{ color }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShareButton;
