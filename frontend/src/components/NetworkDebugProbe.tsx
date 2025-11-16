"use client";

import { useEffect } from "react";

/**
 * Lightweight client-side logger to help trace network issues on specific providers.
 * Enabled only when NEXT_PUBLIC_DEBUG_NETWORK=1 is set.
 */
export default function NetworkDebugProbe() {
  useEffect(() => {
    const nav = typeof performance !== "undefined" ? performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined : undefined;
    const conn = (typeof navigator !== "undefined" && "connection" in navigator) ? (navigator as any).connection : undefined;
    console.info("[netdebug] page init", {
      href: typeof location !== "undefined" ? location.href : undefined,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      conn: conn
        ? {
            effectiveType: conn.effectiveType,
            downlink: conn.downlink,
            rtt: conn.rtt,
            saveData: conn.saveData,
          }
        : null,
      navTiming: nav
        ? {
            type: nav.type,
            startTime: nav.startTime,
            responseStart: nav.responseStart,
            responseEnd: nav.responseEnd,
            domContentLoadedEventEnd: nav.domContentLoadedEventEnd,
          }
        : null,
    });

    const handleError = (event: ErrorEvent) => {
      console.warn("[netdebug] window error", {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    };
    const handleRejection = (event: PromiseRejectionEvent) => {
      console.warn("[netdebug] unhandled rejection", { reason: event.reason });
    };
    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);
    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  return null;
}
