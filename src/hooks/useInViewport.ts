"use client";

import { useEffect, useState, type RefObject } from "react";

interface UseInViewportOptions {
  /** Grows the viewport check so mounting starts slightly before the element is actually on screen, avoiding visible pop-in. */
  rootMargin?: string;
  threshold?: number | number[];
}

/** Whether `ref`'s element is within (or near, via `rootMargin`) the viewport. */
export function useInViewport<T extends Element>(
  ref: RefObject<T | null>,
  { rootMargin = "200px 0px", threshold = 0 }: UseInViewportOptions = {},
) {
  const [inViewport, setInViewport] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setInViewport(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setInViewport(entry.isIntersecting),
      { rootMargin, threshold },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, rootMargin, threshold]);

  return inViewport;
}
