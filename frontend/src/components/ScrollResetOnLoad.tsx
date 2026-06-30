"use client";

import { useLayoutEffect } from "react";

export default function ScrollResetOnLoad() {
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    const restoreValue =
      "scrollRestoration" in window.history ? window.history.scrollRestoration : null;

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const scrollToTop = () => window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    const frameId = window.requestAnimationFrame(scrollToTop);
    const timeoutId = window.setTimeout(() => {
      scrollToTop();
      if (restoreValue && "scrollRestoration" in window.history) {
        window.history.scrollRestoration = restoreValue;
      }
    }, 0);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timeoutId);
      if (restoreValue && "scrollRestoration" in window.history) {
        window.history.scrollRestoration = restoreValue;
      }
    };
  }, []);

  return null;
}
