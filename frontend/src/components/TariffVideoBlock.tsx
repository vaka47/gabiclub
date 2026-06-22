type TariffVideoBlockProps = {
  title: string;
  videoFile?: string | null;
  videoVkEmbedUrl?: string | null;
  poster?: string | null;
};

export default function TariffVideoBlock({
  title,
  videoFile,
  videoVkEmbedUrl,
  poster,
}: TariffVideoBlockProps) {
  if (!videoVkEmbedUrl && !videoFile) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-slate-950 shadow-[0_28px_90px_-45px_rgba(15,23,42,0.55)]">
      <div className="aspect-video w-full">
        {videoVkEmbedUrl ? (
          <iframe
            src={videoVkEmbedUrl}
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
            playsInline
            preload="none"
            poster={poster ?? undefined}
          >
            <source src={videoFile ?? undefined} />
            Ваш браузер не поддерживает встроенное видео.
          </video>
        )}
      </div>
    </div>
  );
}
