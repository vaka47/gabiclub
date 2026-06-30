"use client";

import { useMemo, useState } from "react";
import { FiPlay } from "react-icons/fi";

type TariffVideoBlockProps = {
  title: string;
  videoFile?: string | null;
  videoVkEmbedUrl?: string | null;
  poster?: string | null;
};

const VIDEO_ID_PATTERN = /video(-?\d+)_(-?\d+)/i;

function buildVkEmbedUrl(rawUrl?: string | null, autoplay = false) {
  if (!rawUrl) return null;

  const normalized = rawUrl.trim();
  if (!normalized) return null;

  try {
    const url = new URL(normalized);
    const match =
      VIDEO_ID_PATTERN.exec(url.pathname) ??
      VIDEO_ID_PATTERN.exec(url.searchParams.get("z") ?? "") ??
      VIDEO_ID_PATTERN.exec(url.searchParams.get("w") ?? "");

    if (url.pathname.includes("video_ext.php")) {
      if (!url.searchParams.get("hd")) {
        url.searchParams.set("hd", "2");
      }
      if (autoplay) {
        url.searchParams.set("autoplay", "1");
      }
      return url.toString();
    }

    if (!match) {
      return normalized;
    }

    const [, oid, id] = match;
    const embedUrl = new URL("https://vkvideo.ru/video_ext.php");
    embedUrl.searchParams.set("oid", oid);
    embedUrl.searchParams.set("id", id);
    embedUrl.searchParams.set("hd", "2");
    if (autoplay) {
      embedUrl.searchParams.set("autoplay", "1");
    }
    return embedUrl.toString();
  } catch {
    const match = VIDEO_ID_PATTERN.exec(normalized);
    if (!match) {
      return normalized;
    }

    const [, oid, id] = match;
    const embedUrl = new URL("https://vkvideo.ru/video_ext.php");
    embedUrl.searchParams.set("oid", oid);
    embedUrl.searchParams.set("id", id);
    embedUrl.searchParams.set("hd", "2");
    if (autoplay) {
      embedUrl.searchParams.set("autoplay", "1");
    }
    return embedUrl.toString();
  }
}

export default function TariffVideoBlock({
  title,
  videoFile,
  videoVkEmbedUrl,
  poster,
}: TariffVideoBlockProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const vkEmbedUrl = useMemo(
    () => buildVkEmbedUrl(videoVkEmbedUrl, isPlaying),
    [isPlaying, videoVkEmbedUrl],
  );

  if (!videoVkEmbedUrl && !videoFile) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-slate-950 shadow-[0_28px_90px_-45px_rgba(15,23,42,0.55)]">
      <div className="aspect-video w-full">
        {isPlaying ? (
          videoVkEmbedUrl ? (
            <iframe
              src={vkEmbedUrl ?? videoVkEmbedUrl}
              title={`Видео тарифа ${title}`}
              className="h-full w-full"
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : (
            <video
              className="h-full w-full object-cover"
              controls
              autoPlay
              playsInline
              preload="metadata"
              poster={poster ?? undefined}
            >
              <source src={videoFile ?? undefined} />
              Ваш браузер не поддерживает встроенное видео.
            </video>
          )
        ) : (
          <button
            type="button"
            onClick={() => setIsPlaying(true)}
            className="group relative flex h-full w-full items-center justify-center overflow-hidden"
            aria-label={`Воспроизвести видео: ${title}`}
          >
            {poster ? (
              <>
                <img
                  src={poster}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.52),rgba(2,6,23,0.26)_42%,rgba(2,6,23,0.68))]" />
              </>
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(31,111,235,0.35),_transparent_36%),linear-gradient(135deg,_rgba(15,23,42,0.92),_rgba(2,6,23,1))]" />
            )}

            <div className="relative z-10 flex flex-col items-center gap-4 rounded-[28px] bg-black/24 px-7 py-6 text-center shadow-[0_24px_70px_-30px_rgba(15,23,42,0.88)] backdrop-blur-[2px]">
              <span className="flex h-24 w-24 items-center justify-center rounded-full border border-white/30 bg-white/95 text-gabi-blue shadow-[0_18px_48px_-20px_rgba(15,23,42,0.9)] transition duration-200 group-hover:scale-105">
                <FiPlay size={34} className="translate-x-[2px]" />
              </span>
              <div className="space-y-2 text-white drop-shadow-[0_6px_14px_rgba(0,0,0,0.52)]">
                <p className="text-base font-semibold uppercase tracking-[0.22em] text-white sm:text-lg">
                  Смотреть видео
                </p>
                {!poster ? <p className="text-lg font-medium text-white/92">{title}</p> : null}
              </div>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
