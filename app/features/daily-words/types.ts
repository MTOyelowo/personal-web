export interface DailyQuote {
  id: string;
  date: string;
  text: string;
  author?: string | null;
  source?: string | null;
  commentary?: string | null;
}

export interface QuoteBackground {
  id: string;
  src: string;
  alt: string;
  order: number;
}

/**
 * Gradient fallback used when no background images are available.
 */
export interface GradientBackground {
  id: string;
  gradient: string;
  label: string;
}

/** A displayable background — either an image or a gradient. */
export type DisplayBackground =
  | { type: "image"; data: QuoteBackground }
  | { type: "gradient"; data: GradientBackground };

export type TextAlign = "left" | "center" | "right";

export interface ColorOption {
  name: string;
  value: string;
}

/** Shape of the API response for a single daily word. */
export interface DailyWordResponse {
  success: boolean;
  data?: {
    id: string;
    date: string;
    text: string;
    author?: string | null;
    source?: string | null;
    commentary?: string | null;
    backgrounds: QuoteBackground[];
  };
  error?: string;
}

/** Shape of the available-dates API response. */
export interface AvailableDatesResponse {
  success: boolean;
  data?: { dates: string[] };
  error?: string;
}
