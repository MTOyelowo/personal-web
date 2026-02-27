"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useMemo } from "react";
import type { FC, JSX } from "react";
import type { TextAlign, QuoteBackground } from "./types";

import { FALLBACK_GRADIENTS, quoteColors, authorColors } from "./data";
import { useDailyWord, useAvailableDates } from "@/hooks/query/useDailyWords";

import QuoteDisplay from "./components/quote-display";
import BackgroundPicker from "./components/background-picker";
import CustomizePanel from "./components/customize-panel";
import ShareButton from "./components/share-button";
import DatePicker from "./components/date-picker";

const DailyWords: FC = (): JSX.Element => {
  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  const [activeBgId, setActiveBgId] = useState<string | null>(null);
  const [textAlign, setTextAlign] = useState<TextAlign>("center");
  const [quoteColor, setQuoteColor] = useState(quoteColors[0].value);
  const [authorColor, setAuthorColor] = useState(authorColors[0].value);

  const { data: wordData, isLoading, isError } = useDailyWord(selectedDate);
  const { data: datesData } = useAvailableDates();

  const quote = wordData?.data;
  const backgrounds: QuoteBackground[] = useMemo(
    () => quote?.backgrounds ?? [],
    [quote?.backgrounds],
  );
  const availableDates = datesData?.data?.dates ?? [];

  // Auto-select the first background when the quote changes
  const effectiveBgId = useMemo(() => {
    if (
      activeBgId &&
      [
        ...backgrounds.map((b) => b.id),
        ...FALLBACK_GRADIENTS.map((g) => g.id),
      ].includes(activeBgId)
    ) {
      return activeBgId;
    }
    return backgrounds.length > 0
      ? backgrounds[0].id
      : FALLBACK_GRADIENTS[0].id;
  }, [activeBgId, backgrounds]);

  // Resolve current background (image or gradient)
  const activeImageBg = backgrounds.find((bg) => bg.id === effectiveBgId);
  const activeGradient = FALLBACK_GRADIENTS.find((g) => g.id === effectiveBgId);
  const gradientValue =
    activeGradient?.gradient ?? FALLBACK_GRADIENTS[0].gradient;

  // --- Loading skeleton ---
  if (isLoading) {
    return (
      <section className="w-full font-space-grotesk">
        <div className="relative w-full min-h-80 sm:min-h-[360px] lg:min-h-[420px] overflow-hidden rounded-2xl">
          <div
            className="absolute inset-0"
            style={{ background: FALLBACK_GRADIENTS[0].gradient }}
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 flex flex-col h-full min-h-80 sm:min-h-[360px] lg:min-h-[420px] p-4 sm:p-6 lg:p-10">
            <p className="text-white/50 text-[11px] sm:text-xs uppercase tracking-[0.2em] mb-4 sm:mb-6">
              Daily Words
            </p>
            <div className="flex-1 flex items-center justify-center">
              <div className="w-12 h-12 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // --- Error / empty state ---
  if (isError || !quote) {
    return (
      <section className="w-full font-space-grotesk">
        <div className="relative w-full min-h-80 sm:min-h-[360px] lg:min-h-[420px] overflow-hidden rounded-2xl">
          <div
            className="absolute inset-0"
            style={{ background: FALLBACK_GRADIENTS[2].gradient }}
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 flex flex-col h-full min-h-80 sm:min-h-[360px] lg:min-h-[420px] p-4 sm:p-6 lg:p-10">
            <p className="text-white/50 text-[11px] sm:text-xs uppercase tracking-[0.2em] mb-4 sm:mb-6">
              Daily Words
            </p>
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <p className="text-white/70 text-lg font-medium">
                No words for today yet
              </p>
              <p className="text-white/40 text-sm">Check back soon.</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full font-space-grotesk">
      {/* Full-width hero with big background */}
      <div className="relative w-full min-h-80 sm:min-h-[360px] lg:min-h-[420px] overflow-hidden rounded-2xl">
        {/* Big background: image or gradient */}
        {activeImageBg ? (
          <Image
            key={activeImageBg.id}
            src={activeImageBg.src}
            alt={activeImageBg.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover transition-opacity duration-700"
          />
        ) : (
          <div
            className="absolute inset-0 transition-all duration-700"
            style={{ background: gradientValue }}
          />
        )}

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Content layer */}
        <div className="relative z-10 flex flex-col h-full min-h-80 sm:min-h-[360px] lg:min-h-[420px] p-4 sm:p-6 lg:p-10">
          {/* Top bar: label + date picker */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <p className="text-white/50 text-[11px] sm:text-xs uppercase tracking-[0.2em]">
              Daily Words
            </p>

            {availableDates.length > 0 && (
              <DatePicker
                currentDate={quote.date}
                availableDates={availableDates}
                onDateChange={(date) => {
                  setSelectedDate(date);
                  setActiveBgId(null); // reset background when date changes
                }}
              />
            )}
          </div>

          {/* Main content: quote card left, bg picker right */}
          <div className="flex-1 flex flex-col sm:flex-row gap-5 sm:gap-6 lg:gap-10 items-center sm:items-stretch justify-center">
            {/* Left — square quote card */}
            <div className="w-full max-w-[320px] sm:max-w-none sm:flex-1 lg:max-w-[420px]">
              <QuoteDisplay
                quote={quote}
                background={activeImageBg}
                gradient={gradientValue}
                textAlign={textAlign}
                quoteColor={quoteColor}
                authorColor={authorColor}
              />
            </div>

            {/* Right — background selector */}
            <div className="w-full sm:w-[180px] lg:w-[220px] shrink-0 flex flex-col gap-3">
              <span className="text-white/40 text-[11px] uppercase tracking-widest hidden sm:block">
                Backgrounds
              </span>
              <BackgroundPicker
                backgrounds={backgrounds}
                gradients={FALLBACK_GRADIENTS}
                activeId={effectiveBgId}
                onSelect={setActiveBgId}
              />
            </div>
          </div>

          {/* Bottom bar — share + commentary link + customize buttons */}
          <div className="mt-4 sm:mt-6 flex justify-between items-end">
            <div className="flex items-center gap-3">
              <ShareButton
                quote={quote}
                background={activeImageBg}
                gradient={gradientValue}
                textAlign={textAlign}
                quoteColor={quoteColor}
                authorColor={authorColor}
              />

              {quote.commentary && (
                <Link
                  href={`/daily-words/${quote.date}`}
                  className="
                    flex items-center gap-1.5 px-3 py-2 rounded-full
                    bg-white/10 backdrop-blur-md text-white/80
                    hover:bg-white/20 hover:text-white
                    transition-all duration-200 text-xs font-space-grotesk
                  "
                >
                  Read more
                </Link>
              )}
            </div>

            <CustomizePanel
              textAlign={textAlign}
              onTextAlignChange={setTextAlign}
              quoteColor={quoteColor}
              onQuoteColorChange={setQuoteColor}
              authorColor={authorColor}
              onAuthorColorChange={setAuthorColor}
              quoteColors={quoteColors}
              authorColors={authorColors}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default DailyWords;
