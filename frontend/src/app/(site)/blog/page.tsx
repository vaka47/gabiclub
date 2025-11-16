import Link from "next/link";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

import { getArticles, getTags, resolveMediaUrl } from "@/lib/api";
import DebugImage from "@/components/DebugImage";

function formatDate(date: string) {
  return format(new Date(date), "d MMMM yyyy", { locale: ru });
}

type BlogSearchParams = { tag?: string } | undefined;

export default async function BlogPage({ searchParams }: { searchParams?: Promise<BlogSearchParams> }) {
  const resolved = (await searchParams) ?? {};
  const activeTag = resolved.tag ?? "";
  const [articles, tags] = await Promise.all([getArticles(activeTag), getTags()]);

  return (
    <div className="space-y-12 pb-12">
      <header className="space-y-4">
        <h1 className="section-title">Блог Gabi Club</h1>
        <p className="section-subtitle">
          Заметки клуба и советы по подготовке, экипировке и восстановлению. Читайте нащих тренеров и спортсменов.
        </p>
      </header>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/blog"
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            activeTag === "" ? "bg-gabi-blue text-white shadow-glow" : "bg-white text-slate-600 shadow hover:bg-slate-100"
          }`}
        >
          Все темы
        </Link>
        {tags.map((tag) => (
          <Link
            key={tag.slug}
            href={`/blog?tag=${tag.slug}`}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeTag === tag.slug
                ? "bg-gabi-blue text-white shadow-glow"
                : "bg-white text-slate-600 shadow hover:bg-slate-100"
            }`}
          >
            #{tag.title}
          </Link>
        ))}
      </div>

      <section className="grid gap-8 md:grid-cols-2">
        {articles.map((article) => (
          <article key={article.slug} className="card-surface flex h-full flex-col overflow-hidden">
            <Link href={`/blog/${article.slug}`} className="relative h-52 w-full overflow-hidden rounded-3xl" aria-label={`Читать: ${article.title}`}>
              {(article.header_image || article.cover_image) ? (
                <DebugImage
                  debugName={`blog-card:${article.slug}`}
                  src={(resolveMediaUrl(article.header_image || article.cover_image!) ?? (article.header_image || article.cover_image!))}
                  alt={article.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gabi-blue/10 text-lg font-semibold text-gabi-blue">
                  {article.title}
                </div>
              )}
            </Link>
            <div className="mt-6 flex flex-col gap-4">
              <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-slate-400">
                <span>{formatDate(article.published_at)}</span>
                {article.reading_time && <span>{article.reading_time} мин</span>}
              </div>
              <h2 className="text-xl font-semibold text-gabi-dark">{article.title}</h2>
              <p className="text-sm text-slate-500">{article.excerpt}</p>
              <Link href={`/blog/${article.slug}`} className="btn-secondary w-fit">
                Читать
              </Link>
            </div>
          </article>
        ))}
        {articles.length === 0 && (
          <p className="text-sm text-slate-500">В этой категории пока нет статей. Посмотрите другие темы.</p>
        )}
      </section>
    </div>
  );
}
