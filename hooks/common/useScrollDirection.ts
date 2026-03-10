"use client";

import { useEffect, useState, useRef, useCallback } from "react";

interface UseScrollDirectionOptions {
  /** Minimum scroll distance before direction change is registered (default: 10) */
  threshold?: number;
  /** Time in ms before auto-hiding when idle (default: 3000, set to 0 to disable) */
  hideDelay?: number;
}

interface ScrollDirectionState {
  /** Current scroll direction */
  direction: "up" | "down" | null;
  /** Whether the navbar should be visible */
  isVisible: boolean;
  /** Whether user is at the very top of the page */
  isAtTop: boolean;
  /** Current scroll Y position */
  scrollY: number;
}

/**
 * Hook to track scroll direction for auto-hide/show navbar behavior.
 * - Shows navbar when scrolling up
 * - Hides navbar when scrolling down (after threshold)
 * - Always shows navbar when at top of page
 * - Auto-hides after delay when idle (if not at top)
 */
export function useScrollDirection(
  options: UseScrollDirectionOptions = {},
): ScrollDirectionState {
  const { threshold = 10, hideDelay = 3000 } = options;

  const [state, setState] = useState<ScrollDirectionState>(() => {
    // Initialize with actual scroll position (handles SSR by defaulting to top)
    const scrollY = typeof window !== "undefined" ? window.scrollY : 0;
    return {
      direction: null,
      isVisible: true,
      isAtTop: scrollY < 5,
      scrollY,
    };
  });

  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearHideTimeout = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const startHideTimeout = useCallback(() => {
    clearHideTimeout();
    if (hideDelay > 0) {
      hideTimeoutRef.current = setTimeout(() => {
        setState((prev) => {
          // Only hide if not at top
          if (!prev.isAtTop) {
            return { ...prev, isVisible: false };
          }
          return prev;
        });
      }, hideDelay);
    }
  }, [hideDelay, clearHideTimeout]);

  useEffect(() => {
    const updateScrollDirection = () => {
      const currentScrollY = window.scrollY;
      const isAtTop = currentScrollY < 5;

      // Always show at top
      if (isAtTop) {
        clearHideTimeout();
        setState({
          direction: null,
          isVisible: true,
          isAtTop: true,
          scrollY: currentScrollY,
        });
        lastScrollY.current = currentScrollY;
        ticking.current = false;
        return;
      }

      const diff = currentScrollY - lastScrollY.current;

      // Only register direction change if threshold is exceeded
      if (Math.abs(diff) < threshold) {
        ticking.current = false;
        return;
      }

      const direction = diff > 0 ? "down" : "up";
      const isVisible = direction === "up";

      setState({
        direction,
        isVisible,
        isAtTop: false,
        scrollY: currentScrollY,
      });

      // Reset hide timeout when scrolling up (navbar becomes visible)
      if (isVisible) {
        startHideTimeout();
      } else {
        clearHideTimeout();
      }

      lastScrollY.current = currentScrollY;
      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(updateScrollDirection);
        ticking.current = true;
      }
    };

    // Initialize lastScrollY ref
    lastScrollY.current = window.scrollY;

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      clearHideTimeout();
    };
  }, [threshold, startHideTimeout, clearHideTimeout]);

  return state;
}
