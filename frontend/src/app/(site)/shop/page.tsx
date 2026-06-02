export default function ShopPage() {
  return (
    <div className="space-y-12 pb-12">
      <header className="space-y-4">
        <h1 className="section-title">Магазин</h1>
        <p className="section-subtitle">Скоро тут появятся наши фирменные товары.</p>
      </header>

      <section className="card-surface flex min-h-[280px] items-center justify-center rounded-[32px] text-center">
        <p className="max-w-2xl text-2xl font-semibold text-gabi-dark sm:text-3xl">
          Скоро тут появятся наши фирменные товары
        </p>
      </section>
    </div>
  );
}
