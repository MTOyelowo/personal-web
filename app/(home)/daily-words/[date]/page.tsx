"use client";

import { use } from "react";
import { useDailyWord } from "@/hooks/query/useDailyWords";
import { FALLBACK_GRADIENTS } from "@/app/features/daily-words/data";
import { FiArrowLeft } from "react-icons/fi";
import Image from "next/image";
import Link from "next/link";
import type { FC, JSX } from "react";

interface Props {
  params: Promise<{ date: string }>;
}

const CommentaryPage: FC<Props> = ({ params }): JSX.Element => {
  const { date } = use(params);
  const { data: wordData, isLoading, isError } = useDailyWord(date);
  const quote = wordData?.data;

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 font-space-grotesk">
        <div className="space-y-4">
          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
          <div className="h-8 w-3/4 bg-muted rounded animate-pulse" />
          <div className="h-4 w-1/3 bg-muted rounded animate-pulse" />
          <div className="mt-8 space-y-3">
            <div className="h-4 w-full bg-muted rounded animate-pulse" />
            <div className="h-4 w-full bg-muted rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !quote) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 font-space-grotesk">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <FiArrowLeft size={14} />
          Back to home
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Not Found</h1>
        <p className="mt-2 text-muted-foreground">
          No daily word available for this date.
        </p>
      </div>
    );
  }

  const formattedDate = new Date(quote.date + "T00:00:00").toLocaleDateString(
    "en-US",
    { weekday: "long", year: "numeric", month: "long", day: "numeric" },
  );

  const gradient =
    quote.backgrounds.length > 0 ? undefined : FALLBACK_GRADIENTS[0].gradient;

  return (
    <article className="max-w-2xl mx-auto px-6 py-10 font-space-grotesk">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <FiArrowLeft size={14} />
        Back to home
      </Link>

      {/* Header */}
      <header className="mb-10">
        <time className="text-xs text-muted-foreground uppercase tracking-widest">
          {formattedDate}
        </time>

        {/* Quote card */}
        <div
          className="relative mt-4 rounded-xl overflow-hidden p-8 sm:p-10"
          style={{
            background: gradient ?? undefined,
          }}
        >
          {quote.backgrounds.length > 0 && (
            <>
              <Image
                src={quote.backgrounds[0].src}
                alt={quote.backgrounds[0].alt}
                fill
                sizes="(max-width: 768px) 100vw, 672px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/50" />
            </>
          )}
          {!quote.backgrounds.length && (
            <div className="absolute inset-0 bg-black/30" />
          )}

          <div className="relative z-10">
            <blockquote className="text-xl sm:text-2xl text-white font-medium leading-relaxed">
              &ldquo;{quote.text}&rdquo;
            </blockquote>
            <p className="mt-4 text-white/70 text-sm tracking-wide">
              &mdash; {quote.author}
            </p>
          </div>
        </div>
      </header>

      {/* Commentary content */}
      {quote.commentary ? (
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Commentary
          </h2>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {quote.commentary}
          </p>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-sm">
            No commentary available for this day.
          </p>
        </div>
      )}
    </article>
  );
};

export default CommentaryPage;
