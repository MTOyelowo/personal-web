import Image from "next/image";
import type { DailyQuote, TextAlign, QuoteBackground } from "../types";
import type { FC, JSX } from "react";

interface Props {
  quote: DailyQuote;
  background?: QuoteBackground;
  gradient?: string;
  textAlign: TextAlign;
  quoteColor: string;
  authorColor: string;
}

const alignClass: Record<TextAlign, string> = {
  left: "text-left items-start",
  center: "text-center items-center",
  right: "text-right items-end",
};

const QuoteDisplay: FC<Props> = ({
  quote,
  background,
  gradient,
  textAlign,
  quoteColor,
  authorColor,
}): JSX.Element => {
  return (
    <div className="relative aspect-square w-full max-w-[420px] rounded-2xl overflow-hidden shadow-2xl">
      {/* Background: image or gradient fallback */}
      {background ? (
        <Image
          key={background.id}
          src={background.src}
          alt={background.alt}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 420px"
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0" style={{ background: gradient }} />
      )}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/45" />

      {/* Quote content */}
      <div
        className={`
          relative z-10 flex flex-col justify-center h-full
          px-6 sm:px-8 lg:px-10 py-8
          ${alignClass[textAlign]}
        `}
      >
        <blockquote
          className="max-w-[340px] text-lg sm:text-xl md:text-2xl leading-relaxed font-space-grotesk font-medium"
          style={{ color: quoteColor }}
        >
          &ldquo;{quote.text}&rdquo;
        </blockquote>

        {quote.author && (
          <p
            className="mt-4 text-sm sm:text-base font-space-grotesk tracking-wide"
            style={{ color: authorColor }}
          >
            &mdash; {quote.author}
          </p>
        )}

        {quote.source && (
          <p
            className="mt-1 text-xs sm:text-sm font-space-grotesk tracking-wide opacity-70"
            style={{ color: authorColor }}
          >
            {quote.source}
          </p>
        )}
      </div>
    </div>
  );
};

export default QuoteDisplay;
