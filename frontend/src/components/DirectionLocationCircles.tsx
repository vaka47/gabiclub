import type { DirectionLocation } from "@/lib/types";

type DirectionLocationCirclesProps = {
  locations: DirectionLocation[];
};

const buildMapHref = (location: DirectionLocation) => {
  if (location.latitude != null && location.longitude != null) {
    return `https://yandex.ru/maps/?ll=${location.longitude},${location.latitude}&pt=${location.longitude},${location.latitude}&z=16&l=map`;
  }

  const query = location.address || location.title;
  return `https://yandex.ru/maps/?text=${encodeURIComponent(query)}`;
};

const buildStaticMapSrc = (location: DirectionLocation) => {
  if (location.latitude == null || location.longitude == null) {
    return null;
  }

  const lon = location.longitude;
  const lat = location.latitude;
  return `https://static-maps.yandex.ru/1.x/?lang=ru_RU&ll=${lon},${lat}&z=15&size=450,450&l=map&pt=${lon},${lat},pm2rdm`;
};

export default function DirectionLocationCircles({
  locations,
}: DirectionLocationCirclesProps) {
  if (locations.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {locations.map((location) => {
        const mapHref = buildMapHref(location);
        const staticMapSrc = buildStaticMapSrc(location);
        const mapLabel = location.title;

        return (
          <a
            key={location.id}
            href={mapHref}
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-5 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_64px_-30px_rgba(15,23,42,0.45)]"
          >
            <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
              {staticMapSrc ? (
                <img
                  src={staticMapSrc}
                  alt={mapLabel}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="relative h-full w-full overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(31,111,235,0.22),_transparent_38%),linear-gradient(135deg,_rgba(255,255,255,1),_rgba(241,245,249,0.92))]">
                  <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(148,163,184,0.22)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.22)_1px,transparent_1px)] [background-size:16px_16px]" />
                  <div className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-[60%] rounded-full bg-gabi-blue shadow-[0_10px_22px_-8px_rgba(31,111,235,0.85)]" />
                  <div className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-[15%] rotate-45 rounded-[0_0_999px_999px] bg-gabi-blue" />
                  <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-[58%] rounded-full bg-white" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="text-lg font-semibold text-gabi-dark">{location.title}</div>
              <div className="text-sm font-semibold text-gabi-blue">Открыть на Яндекс Картах →</div>
            </div>
          </a>
        );
      })}
    </div>
  );
}
