"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { clsx } from "clsx";
import { useEffect, useRef, useState } from "react";
import { FiArrowLeft, FiArrowRight, FiX } from "react-icons/fi";

import LeadCtaButton from "@/components/LeadCtaButton";
import type { Product } from "@/lib/types";

type ShopExperienceProps = {
  products: Product[];
};

type ProductCardProps = {
  product: Product;
  onOpen: (product: Product) => void;
};

type ProductModalProps = {
  product: Product;
  onClose: () => void;
};

const priceFormatter = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});

function formatPrice(value: number) {
  return priceFormatter.format(value);
}

function getGallery(product: Product) {
  if (product.images.length > 0) {
    return product.images;
  }

  return [
    {
      id: -product.id,
      image: "/site-bg.jpg",
      caption: product.name,
      order: 0,
    },
  ];
}

function ProductPrice({
  product,
  compact = false,
  inverse = false,
}: {
  product: Product;
  compact?: boolean;
  inverse?: boolean;
}) {
  const mutedClass = inverse ? "text-white/45" : "text-slate-400";
  const strongClass = inverse ? "text-white" : "text-slate-950";

  return (
    <div className={clsx("flex flex-col items-end text-right", compact ? "gap-1" : "gap-2")}>
      {product.sale_price != null ? (
        <>
          <span className={clsx(mutedClass, "line-through", compact ? "text-xs" : "text-sm")}>
            {formatPrice(product.price)}
          </span>
          <span className={clsx("font-semibold", strongClass, compact ? "text-base" : "text-2xl")}>
            {formatPrice(product.sale_price)}
          </span>
        </>
      ) : (
        <span className={clsx("font-semibold", strongClass, compact ? "text-base" : "text-2xl")}>
          {formatPrice(product.price)}
        </span>
      )}
    </div>
  );
}

function ProductCard({ product, onOpen }: ProductCardProps) {
  const gallery = getGallery(product);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isInteractive, setIsInteractive] = useState(false);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [product.id]);

  useEffect(() => {
    if (!isInteractive || gallery.length < 2) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveImageIndex((current) => (current + 1) % gallery.length);
    }, 2200);

    return () => window.clearInterval(intervalId);
  }, [gallery.length, isInteractive]);

  return (
    <button
      type="button"
      onClick={() => onOpen(product)}
      onMouseEnter={() => setIsInteractive(true)}
      onMouseLeave={() => setIsInteractive(false)}
      onFocus={() => setIsInteractive(true)}
      onBlur={() => setIsInteractive(false)}
      className="group text-left"
    >
      <div className="rounded-[32px] bg-white/75 p-3 shadow-[0_28px_80px_-36px_rgba(15,23,42,0.42)] transition duration-500 ease-out group-hover:-translate-y-1 group-hover:scale-[1.02] group-hover:shadow-[0_40px_110px_-42px_rgba(15,23,42,0.48)]">
        <div className="relative aspect-[3/4] overflow-hidden rounded-[24px] bg-[#f1ece5]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${product.id}-${activeImageIndex}`}
              initial={{ opacity: 0, scale: 1.035 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.985 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              <Image
                src={gallery[activeImageIndex].image}
                alt={gallery[activeImageIndex].caption || product.name}
                fill
                className="object-cover"
                sizes="(min-width: 1280px) 27vw, (min-width: 768px) 42vw, 100vw"
              />
            </motion.div>
          </AnimatePresence>

          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/18 to-transparent" />
          {product.sale_price != null && (
            <span className="absolute left-4 top-4 rounded-full bg-white/92 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-900">
              Горящая цена
            </span>
          )}
          {gallery.length > 1 && (
            <div className="absolute bottom-4 left-4 flex items-center gap-2">
              {gallery.map((image, index) => (
                <span
                  key={image.id}
                  className={clsx(
                    "h-1.5 rounded-full bg-white/55 transition-all duration-300",
                    index === activeImageIndex ? "w-8 bg-white" : "w-3",
                  )}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex items-start justify-between gap-4 px-1 pb-1 pt-4">
          <div className="space-y-2">
            <h3 className="font-display text-xl uppercase tracking-[0.08em] text-slate-950 underline-offset-[0.26em] transition group-hover:underline md:text-[1.38rem]">
              {product.name}
            </h3>
            <p className="line-clamp-2 max-w-[24ch] text-sm leading-6 text-slate-500">
              {product.description}
            </p>
          </div>
          <ProductPrice product={product} compact />
        </div>
      </div>
    </button>
  );
}

function ProductModal({ product, onClose }: ProductModalProps) {
  const gallery = getGallery(product);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const imageRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    setActiveImageIndex(0);
    imageRefs.current = [];
  }, [product.id]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  useEffect(() => {
    const root = scrollContainerRef.current;
    if (!root || gallery.length < 2 || typeof IntersectionObserver === "undefined") {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];

        if (!visibleEntry) {
          return;
        }

        const nextIndex = Number((visibleEntry.target as HTMLElement).dataset.index || 0);
        setActiveImageIndex(nextIndex);
      },
      {
        root,
        threshold: [0.4, 0.6, 0.85],
      },
    );

    imageRefs.current.forEach((node) => {
      if (node) {
        observer.observe(node);
      }
    });

    return () => observer.disconnect();
  }, [gallery.length, product.id]);

  const scrollToImage = (index: number) => {
    setActiveImageIndex(index);
    imageRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest",
    });
  };

  const handleStep = (direction: 1 | -1) => {
    const nextIndex = (activeImageIndex + direction + gallery.length) % gallery.length;
    scrollToImage(nextIndex);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[140] bg-slate-950/50 p-3 backdrop-blur-md md:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={product.name}
        initial={{ opacity: 0, y: 24, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.985 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        onClick={(event) => event.stopPropagation()}
        className="relative mx-auto flex h-full w-full max-w-[1480px] overflow-hidden rounded-[34px] bg-[#f7f4ee] shadow-[0_45px_140px_-40px_rgba(15,23,42,0.8)]"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-white/92 text-slate-900 shadow-lg transition hover:scale-105 md:right-6 md:top-6"
          aria-label="Закрыть товар"
        >
          <FiX size={20} />
        </button>

        <div className="grid h-full w-full lg:grid-cols-[minmax(0,1.16fr)_420px]">
          <div className="relative hidden h-full overflow-hidden lg:block">
            <div className="absolute left-4 top-8 z-20 flex flex-col gap-3">
              {gallery.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => scrollToImage(index)}
                  className={clsx(
                    "relative h-16 w-16 overflow-hidden rounded-2xl transition",
                    index === activeImageIndex
                      ? "scale-100 ring-2 ring-slate-900"
                      : "scale-95 opacity-70 hover:scale-100 hover:opacity-100",
                  )}
                  aria-label={`Перейти к фото ${index + 1}`}
                >
                  <Image
                    src={image.image}
                    alt={image.caption || product.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </button>
              ))}
            </div>

            <div
              ref={scrollContainerRef}
              className="h-full overflow-y-auto px-24 py-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <div className="space-y-6 pr-4">
                {gallery.map((image, index) => (
                  <section
                    key={image.id}
                    ref={(node) => {
                      imageRefs.current[index] = node;
                    }}
                    data-index={index}
                    className="relative aspect-[4/5] overflow-hidden rounded-[30px] bg-white"
                  >
                    <Image
                      src={image.image}
                      alt={image.caption || product.name}
                      fill
                      className="object-contain p-6"
                      sizes="(min-width: 1024px) 58vw, 100vw"
                      priority={index === 0}
                    />
                    {image.caption && (
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 to-transparent px-6 pb-6 pt-16 text-sm text-white">
                        {image.caption}
                      </div>
                    )}
                  </section>
                ))}
              </div>
            </div>
          </div>

          <div className="h-full overflow-y-auto bg-white">
            <div className="flex min-h-full flex-col px-5 py-5 md:px-8 md:py-8 lg:px-10">
              <div className="lg:hidden">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-[#f3eee7]">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={`${product.id}-${activeImageIndex}`}
                      initial={{ opacity: 0, scale: 1.02 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.985 }}
                      transition={{ duration: 0.28 }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={gallery[activeImageIndex].image}
                        alt={gallery[activeImageIndex].caption || product.name}
                        fill
                        className="object-contain p-5"
                        sizes="100vw"
                        priority
                      />
                    </motion.div>
                  </AnimatePresence>

                  {gallery.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleStep(-1)}
                        className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-md"
                        aria-label="Предыдущее фото"
                      >
                        <FiArrowLeft size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStep(1)}
                        className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-md"
                        aria-label="Следующее фото"
                      >
                        <FiArrowRight size={18} />
                      </button>
                    </>
                  )}
                </div>

                {gallery.length > 1 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {gallery.map((image, index) => (
                      <button
                        key={image.id}
                        type="button"
                        onClick={() => setActiveImageIndex(index)}
                        className={clsx(
                          "relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl transition",
                          index === activeImageIndex
                            ? "ring-2 ring-slate-900"
                            : "opacity-70 hover:opacity-100",
                        )}
                      >
                        <Image
                          src={image.image}
                          alt={image.caption || product.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 flex-1 space-y-8 lg:mt-0">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700">
                      Gabi Shop
                    </span>
                    {product.sale_price != null && (
                      <span className="rounded-full bg-[#f4ede1] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-900">
                        Special Price
                      </span>
                    )}
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3">
                      <h2 className="font-display text-[2rem] uppercase leading-none tracking-[0.08em] text-slate-950 md:text-[2.4rem]">
                        {product.name}
                      </h2>
                      <p className="max-w-[32ch] text-base leading-7 text-slate-600">
                        {product.description}
                      </p>
                    </div>
                    <ProductPrice product={product} />
                  </div>
                </div>

                {product.sizes.length > 0 && (
                  <section className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                        Размерная сетка
                      </h3>
                      {product.size_chart_note && (
                        <p className="text-sm leading-6 text-slate-500">{product.size_chart_note}</p>
                      )}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {product.sizes.map((size) => (
                        <div
                          key={size.id}
                          className="rounded-[22px] bg-slate-50 px-4 py-4 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.15)]"
                        >
                          <div className="text-base font-semibold text-slate-950">{size.label}</div>
                          {size.details && (
                            <div className="mt-1 text-sm leading-6 text-slate-500">{size.details}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                <section className="grid gap-3 rounded-[28px] bg-[#f7f4ee] p-5 sm:grid-cols-2">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                      Доставка
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Уточним наличие, размер и предложим удобный способ получения в ответ на заявку.
                    </p>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                      Поддержка
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Подскажем по посадке, совместимости со слоями экипировки и сезонности вещи.
                    </p>
                  </div>
                </section>
              </div>

              <div className="mt-8 border-t border-slate-200 pt-6">
                <LeadCtaButton
                  label={product.cta_label}
                  source={`shop-${product.cta_mode}`}
                  className="btn-primary w-full justify-center"
                  initial={{
                    contextTitle: product.name,
                    preferred_direction: `Магазин — ${product.name}`,
                    message:
                      product.cta_mode === "order"
                        ? `Хочу заказать ${product.name}`
                        : `Хочу узнать о наличии ${product.name}`,
                  }}
                />
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Ответим в течение рабочего дня и поможем подобрать размер.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ShopExperience({ products }: ShopExperienceProps) {
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const featuredProduct = products[0] ?? null;
  const featuredGallery = featuredProduct ? getGallery(featuredProduct) : [];

  return (
    <div className="space-y-8 pb-8 md:space-y-10 md:pb-12">
      <header className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-white/85 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-700 shadow-sm">
            Gabi Essentials
          </span>
          <span className="text-xs font-medium uppercase tracking-[0.24em] text-slate-500">
            Minimal gear for training days
          </span>
        </div>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
          <div className="space-y-4">
            <h1 className="font-display text-4xl uppercase leading-none tracking-[0.08em] text-slate-950 md:text-6xl">
              Магазин
            </h1>
            <p className="max-w-3xl text-base leading-7 text-slate-600 md:text-lg">
              Чистая витрина без визуального шума: экипировка, аксессуары и клубные вещи, которые
              хочется рассматривать так же долго, как и носить.
            </p>
          </div>
          <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-[24px] bg-white/75 px-4 py-4 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.28)]">
              Аккуратная витрина с быстрым просмотром товара
            </div>
            <div className="rounded-[24px] bg-white/75 px-4 py-4 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.28)]">
              Фото-карусель в карточках и детальный product view
            </div>
            <div className="rounded-[24px] bg-white/75 px-4 py-4 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.28)]">
              Заявка на заказ или уточнение наличия без отдельного checkout
            </div>
          </div>
        </div>
      </header>

      {featuredProduct && (
        <section className="overflow-hidden rounded-[38px] bg-[#111111] text-white shadow-[0_40px_120px_-50px_rgba(15,23,42,0.9)]">
          <div className="grid gap-8 px-5 py-5 md:px-8 md:py-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-10">
            <div className="flex flex-col justify-between gap-8">
              <div className="space-y-5">
                <span className="inline-flex rounded-full border border-white/15 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/80">
                  Featured Drop
                </span>
                <div className="space-y-4">
                  <h2 className="font-display text-3xl uppercase leading-none tracking-[0.08em] md:text-5xl">
                    {featuredProduct.name}
                  </h2>
                  <p className="max-w-2xl text-sm leading-7 text-white/72 md:text-base">
                    {featuredProduct.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-end justify-between gap-5">
                <div className="space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">
                    Selected for test environment
                  </div>
                  <ProductPrice product={featuredProduct} inverse />
                </div>
                <button
                  type="button"
                  onClick={() => setActiveProduct(featuredProduct)}
                  className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-slate-950 transition hover:scale-[1.02]"
                >
                  Открыть товар
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-2">
              {featuredGallery.slice(0, 3).map((image, index) => (
                <div
                  key={image.id}
                  className={clsx(
                    "relative overflow-hidden rounded-[28px] bg-white/10",
                    index === 0 ? "aspect-[4/5] sm:col-span-2 lg:col-span-1" : "aspect-square",
                  )}
                >
                  <Image
                    src={image.image}
                    alt={image.caption || featuredProduct.name}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 28vw, 100vw"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {products.length > 0 ? (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onOpen={setActiveProduct} />
          ))}
        </section>
      ) : (
        <section className="rounded-[34px] bg-white/80 px-6 py-16 text-center shadow-[0_28px_80px_-36px_rgba(15,23,42,0.28)]">
          <div className="mx-auto max-w-2xl space-y-4">
            <h2 className="font-display text-2xl uppercase tracking-[0.08em] text-slate-950 md:text-4xl">
              Витрина почти готова
            </h2>
            <p className="text-base leading-7 text-slate-600">
              Добавьте первые товары в админке раздела «Магазин», и они сразу появятся здесь в
              заданном порядке.
            </p>
          </div>
        </section>
      )}

      <AnimatePresence>
        {activeProduct && <ProductModal product={activeProduct} onClose={() => setActiveProduct(null)} />}
      </AnimatePresence>
    </div>
  );
}
