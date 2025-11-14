"use client";

import Image, { ImageProps } from "next/image";
import React from "react";

type DebugImageProps = ImageProps & { debugName?: string };

export default function DebugImage({ debugName, onError, onLoad, ...props }: DebugImageProps) {
  const handleError: React.ReactEventHandler<HTMLImageElement> = (e) => {
    try {
      const el = e.target as HTMLImageElement;
      // Log both the original src prop and the computed currentSrc used by the browser/Next loader
      console.error("[media] image load error", {
        name: debugName,
        rawPropSrc: props.src,
        currentSrc: el.currentSrc || el.src,
      });
    } catch {}
    onError?.(e);
  };

  const handleLoad: React.ReactEventHandler<HTMLImageElement> = (e) => {
    if (process.env.NEXT_PUBLIC_DEBUG_MEDIA === "1") {
      try {
        const el = e.target as HTMLImageElement;
        console.log("[media] image loaded", {
          name: debugName,
          rawPropSrc: props.src,
          currentSrc: el.currentSrc || el.src,
        });
      } catch {}
    }
    onLoad?.(e);
  };

  // Use unoptimized images so that any valid browser-supported JPG/PNG from Django
  // loads without going through Next.js' Sharp-based optimizer (which can fail on
  // certain color profiles or very large originals).
  return <Image {...props} onError={handleError} onLoad={handleLoad} unoptimized />;
}
