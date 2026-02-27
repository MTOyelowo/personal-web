"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type {
  DailyWordResponse,
  AvailableDatesResponse,
} from "@/app/features/daily-words/types";

/**
 * Fetches the daily word for a specific date.
 * Falls back to the most recent past date on the server if none exists.
 */
const fetchDailyWord = async (date?: string) => {
  const params = date ? `?date=${date}` : "";
  const response = await axios.get<DailyWordResponse>(
    `/api/daily-words${params}`,
  );
  return response.data;
};

/**
 * Hook to get the daily word for a given date.
 * If no date is provided, returns today's quote (or the most recent one).
 */
export const useDailyWord = (date?: string) => {
  return useQuery({
    queryKey: ["daily-word", date ?? "today"],
    queryFn: () => fetchDailyWord(date),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Fetches dates that have daily words.
 */
const fetchAvailableDates = async (from?: string, to?: string) => {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const qs = params.toString();

  const response = await axios.get<AvailableDatesResponse>(
    `/api/daily-words/available-dates${qs ? `?${qs}` : ""}`,
  );
  return response.data;
};

/**
 * Hook to get the list of dates that have daily words available.
 */
export const useAvailableDates = (from?: string, to?: string) => {
  return useQuery({
    queryKey: ["daily-words-dates", from, to],
    queryFn: () => fetchAvailableDates(from, to),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};
