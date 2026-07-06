export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { notFound } from "next/navigation";

import CampGallery from "@/components/CampGallery";
import LeadCtaButton from "@/components/LeadCtaButton";
import SessionTariffCarousel from "@/components/SessionTariffCarousel";
import { getSessionTariffBySlug, getSessionTariffs } from "@/lib/api";

type SessionTariffDetailPageProps = {
  params: Promise<{ slug: string }>;
};

type DetailContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

const formatPrice = (value: number) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "По запросу";
  if (value <= 0) return "0 ₽";
  return `${value.toLocaleString("ru-RU")} ₽`;
};

const buildTariffLabel = (title: string) =>
  `ТАРИФ "${title.toLocaleUpperCase("ru-RU")}"`;
const normalizeDescription = (value?: string | null) =>
  value?.replace(/\s*\r?\n+\s*/g, " ").trim() ||
  "Описание этого тарифа занятий скоро появится.";
const listItemPattern = /^\s*-\s+(.+)\s*$/;

const parseDetailContent = (value?: string | null): DetailContentBlock[] => {
  if (!value) return [];

  const blocks: DetailContentBlock[] = [];
  const lines = value.replace(/\r\n/g, "\n").split("\n");
  let paragraphLines: string[] = [];
  let listItems: string[] = [];

  const flushParagraph = () => {
    const text = paragraphLines.join("\n").trim();
    if (text) {
      blocks.push({ type: "paragraph", text });
    }
    paragraphLines = [];
  };

  const flushList = () => {
    if (listItems.length > 0) {
      blocks.push({ type: "list", items: listItems });
    }
    listItems = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();
    const listMatch = line.match(listItemPattern);

    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    if (listMatch) {
      flushParagraph();
      listItems.push(listMatch[1].trim());
      continue;
    }

    flushList();
    paragraphLines.push(trimmed);
  }

  flushParagraph();
  flushList();

  return blocks;
};

const shouldSplitListIntoColumns = (items: string[]) => {
  if (items.length < 4) return false;

  const maxLength = items.reduce(
    (currentMax, item) => Math.max(currentMax, item.length),
    0,
  );
  const averageLength =
    items.reduce((sum, item) => sum + item.length, 0) / items.length;

  return maxLength <= 72 || averageLength <= 54 || items.length >= 6;
};

const splitListIntoColumns = (items: string[]) => {
  const pivot = Math.ceil(items.length / 2);
  return [items.slice(0, pivot), items.slice(pivot)];
};

export default async function SessionTariffDetailPage({
  params,
}: SessionTariffDetailPageProps) {
  const { slug } = await params;
  const [tariff, tariffs] = await Promise.all([
    getSessionTariffBySlug(slug),
    getSessionTariffs(),
  ]);

  if (!tariff) {
    notFound();
  }

  const photos = [...(tariff.photos ?? [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );
  const detailItems = [...(tariff.detail_items ?? [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );
  const benefits = [...(tariff.benefits ?? [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );
  const priceOptions = [...(tariff.prices ?? [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );
  const primaryPrice = priceOptions[0];
  const otherTariffs = tariffs.filter((item) => item.id !== tariff.id);
  const accentPrice = primaryPrice
    ? `${priceOptions.length > 1 ? "от " : ""}${formatPrice(primaryPrice.price)}`
    : "По запросу";
  const description = normalizeDescription(tariff.description);

  return (
    <div className="space-y-16 pb-16">
      <section>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-5">
            <h1 className="section-title max-w-4xl text-left">
              {buildTariffLabel(tariff.title)}
            </h1>
            <div className="space-y-2">
              <div className="flex flex-wrap items-end gap-3">
                <span className="font-display text-4xl font-semibold tracking-[0.08em] text-gabi-blue sm:text-5xl">
                  {accentPrice}
                </span>
              </div>
            </div>
          </div>

          <LeadCtaButton
            className="btn-primary w-full justify-center px-8 lg:w-auto"
            label="Узнать подробнее"
            source={`session-tariff-${tariff.slug ?? tariff.id}`}
            initial={{
              preferred_direction: tariff.title,
              message: `Хочу узнать подробнее о тарифе занятий "${tariff.title}"`,
            }}
          />
        </div>
      </section>

      <section className="space-y-5">
        <p className="w-full text-base leading-8 text-slate-600 whitespace-normal sm:text-[1.05rem]">
          {description}
        </p>

        {detailItems.length > 0 && (
          <div className="space-y-8 md:space-y-9">
            {detailItems.map((item) => {
              const contentBlocks = parseDetailContent(item.description);

              return (
                <article key={item.id} className="space-y-3">
                  <h3 className="text-[0.95rem] font-extrabold uppercase tracking-[0.18em] text-gabi-dark sm:text-base">
                    {item.subtitle}
                  </h3>
                  {contentBlocks.length > 0 && (
                    <div className="space-y-3">
                      {contentBlocks.map((block, index) => {
                        if (block.type === "paragraph") {
                          return (
                            <p
                              key={`${item.id}-paragraph-${index}`}
                              className="w-full whitespace-pre-line text-base leading-8 text-slate-600 sm:text-[1.05rem]"
                            >
                              {block.text}
                            </p>
                          );
                        }

                        const useTwoColumns = shouldSplitListIntoColumns(
                          block.items,
                        );
                        const listColumns = useTwoColumns
                          ? splitListIntoColumns(block.items)
                          : [block.items];

                        return (
                          <div
                            key={`${item.id}-list-${index}`}
                            className="rounded-[26px] border border-slate-200/80 bg-[linear-gradient(135deg,rgba(248,250,255,0.98),rgba(255,255,255,0.96))] px-5 py-5 shadow-[0_26px_70px_-56px_rgba(15,23,42,0.3)] sm:px-6"
                          >
                            <div
                              className={
                                useTwoColumns
                                  ? "grid gap-4 md:grid-cols-2 md:gap-x-8"
                                  : "grid gap-3"
                              }
                            >
                              {listColumns.map((columnItems, columnIndex) => (
                                <ul
                                  key={`${item.id}-list-${index}-column-${columnIndex}`}
                                  className="space-y-3"
                                >
                                  {columnItems.map((listItem, listItemIndex) => (
                                    <li
                                      key={`${item.id}-list-${index}-item-${columnIndex}-${listItemIndex}`}
                                      className="flex items-start gap-3 text-base leading-8 text-slate-600 sm:text-[1.05rem]"
                                    >
                                      <span
                                        aria-hidden
                                        className="mt-[0.9rem] h-2 w-2 shrink-0 rounded-full bg-slate-500"
                                      />
                                      <span>{listItem}</span>
                                    </li>
                                  ))}
                                </ul>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      {photos.length > 0 && (
        <section className="space-y-8">
          <div className="h-px w-full bg-[linear-gradient(90deg,rgba(31,111,235,0),rgba(31,111,235,0.7),rgba(255,164,87,0.55),rgba(31,111,235,0))]" />
          <CampGallery
            slug={tariff.slug ?? String(tariff.id)}
            title={tariff.title}
            photos={photos}
            layout="carousel"
          />
        </section>
      )}

      {benefits.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gabi-dark">
            Преимущества тарифа
          </h2>
          <ul className="grid list-none gap-3 pl-0 text-sm text-slate-600 sm:text-base">
            {benefits.map((benefit) => (
              <li key={benefit.id} className="flex items-start gap-4">
                <span
                  className="mt-[0.7rem] h-2 w-2 shrink-0 rounded-full bg-gabi-blue"
                  aria-hidden
                />
                <span>{benefit.text}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-5">
        <div className="rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(243,247,255,0.96))] px-6 py-6 shadow-[0_28px_90px_-50px_rgba(15,23,42,0.3)] sm:px-8 lg:rounded-none lg:border-0 lg:bg-none lg:bg-transparent lg:px-0 lg:py-0 lg:shadow-none">
          <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-8">
            {priceOptions.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {priceOptions.map((option) => (
                  <div
                    key={option.id}
                    className="rounded-[24px] border border-slate-200/80 bg-white/95 px-5 py-4 shadow-[0_20px_55px_-42px_rgba(15,23,42,0.28)]"
                  >
                    <p className="text-sm leading-6 text-slate-500">
                      {option.label}
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-gabi-blue sm:text-[1.8rem]">
                      {formatPrice(option.price)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-7 text-slate-600">
                Стоимость уточняйте у администратора клуба.
              </p>
            )}

            <LeadCtaButton
              className="btn-primary w-full justify-center px-8 lg:w-auto"
              label="Узнать подробнее"
              source={`session-tariff-side-${tariff.slug ?? tariff.id}`}
              initial={{
                preferred_direction: tariff.title,
                message: `Хочу узнать подробнее о тарифе занятий "${tariff.title}"`,
              }}
            />
          </div>
        </div>

        <p className="text-sm leading-7 text-slate-600 sm:text-base">
          Оставьте контакты, и мы подскажем, какой тариф лучше взять под ваш
          формат занятий, количество посещений и тренера.
        </p>
      </section>

      {otherTariffs.length > 0 && (
        <SessionTariffCarousel
          tariffs={otherTariffs}
          title="Другие тарифы занятий"
          subtitle="Можно быстро сравнить соседние форматы и открыть полную страницу каждого тарифа."
        />
      )}

      <div className="flex justify-center pt-2">
        <Link
          href="/pricing"
          className="inline-flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.18em] text-gabi-blue transition hover:text-gabi-dark"
        >
          <span aria-hidden>←</span>
          <span>Вернуться на страницу тарифов</span>
        </Link>
      </div>
    </div>
  );
}
