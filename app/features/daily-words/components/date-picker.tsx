"use client";

import { useState } from "react";
import { FiChevronLeft, FiChevronRight, FiCalendar } from "react-icons/fi";
import type { FC, JSX } from "react";

interface Props {
  /** Currently displayed date in YYYY-MM-DD format */
  currentDate: string;
  /** Dates that have content, in YYYY-MM-DD format */
  availableDates: string[];
  /** Called when the user selects a new date */
  onDateChange: (date: string) => void;
}

/**
 * Compact date picker that lets users navigate between days
 * that have daily words. Shows left/right arrows + formatted date.
 */
const DatePicker: FC<Props> = ({
  currentDate,
  availableDates,
  onDateChange,
}): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);

  const sortedDates = [...availableDates].sort();
  const currentIndex = sortedDates.indexOf(currentDate);

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < sortedDates.length - 1;

  const goToPrev = () => {
    if (hasPrev) onDateChange(sortedDates[currentIndex - 1]);
  };

  const goToNext = () => {
    if (hasNext) onDateChange(sortedDates[currentIndex + 1]);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffMs = today.getTime() - date.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    });
  };

  return (
    <div className="relative">
      {/* Inline nav */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={goToPrev}
          disabled={!hasPrev}
          aria-label="Previous day"
          className="p-1.5 rounded-md text-white/60 hover:text-white hover:bg-white/10
                     disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <FiChevronLeft size={16} />
        </button>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-white/80
                     hover:text-white hover:bg-white/10 transition-colors text-sm cursor-pointer"
        >
          <FiCalendar size={13} />
          <span className="font-medium">{formatDate(currentDate)}</span>
        </button>

        <button
          onClick={goToNext}
          disabled={!hasNext}
          aria-label="Next day"
          className="p-1.5 rounded-md text-white/60 hover:text-white hover:bg-white/10
                     disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <FiChevronRight size={16} />
        </button>
      </div>

      {/* Dropdown calendar list */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div
            className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50
                        w-48 max-h-64 overflow-y-auto
                        bg-black/80 backdrop-blur-xl rounded-xl border border-white/10
                        shadow-2xl py-1"
          >
            {sortedDates
              .slice()
              .reverse()
              .map((dateStr) => {
                const isActive = dateStr === currentDate;
                return (
                  <button
                    key={dateStr}
                    onClick={() => {
                      onDateChange(dateStr);
                      setIsOpen(false);
                    }}
                    className={`
                      w-full px-3 py-2 text-left text-sm transition-colors cursor-pointer
                      ${
                        isActive
                          ? "bg-white/15 text-white font-medium"
                          : "text-white/60 hover:text-white hover:bg-white/10"
                      }
                    `}
                  >
                    {formatDate(dateStr)}
                    <span className="ml-2 text-[11px] text-white/30">
                      {dateStr}
                    </span>
                  </button>
                );
              })}
          </div>
        </>
      )}
    </div>
  );
};

export default DatePicker;
