import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import Image from "next/image";
import Link from "next/link";

import LeadCtaButton from "@/components/LeadCtaButton";
import CampGallery from "@/components/CampGallery";
import { getArticleBySlug, getArticles, resolveMediaUrl } from "@/lib/api";

function formatDate(date: string) {
  return format(new Date(date), "d MMMM yyyy", { locale: ru });
}

export async function generateStaticParams() {
  if (process.env.SKIP_API_AT_BUILD === '1') return [];
  const articles = await getArticles();
  return articles.map((article) => ({ slug: article.slug }));
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) {
    notFound();
  }

  const isLikelyHtml = /<\/?[a-z][\s\S]*>/i.test(article.content);

  return (
    <article className="space-y-10 pb-12">
      <header className="space-y-4">
        <p className="text-xs uppercase tracking-[0.4em] text-gabi-blue">Gabi Journal</p>
        <h1 className="text-3xl font-semibold text-gabi-dark md:text-4xl">{article.title}</h1>
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <span>{formatDate(article.published_at)}</span>
          {article.reading_time && <span>{article.reading_time} мин на чтение</span>}
        </div>
        {article.cover_image && (
          <div className="relative h-[320px] overflow-hidden rounded-[32px]">
            <Image src={resolveMediaUrl(article.cover_image) ?? article.cover_image} alt={article.title} fill className="object-cover" />
          </div>
        )}
      </header>

      {isLikelyHtml ? (
        <div className="prose prose-lg max-w-none text-slate-700 prose-headings:text-gabi-dark prose-a:text-gabi-blue">
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        </div>
      ) : (
        <div className="prose prose-lg max-w-none whitespace-pre-line text-slate-700 prose-headings:text-gabi-dark prose-a:text-gabi-blue">
          {article.content}
        </div>
      )}

      {Array.isArray(article.gallery) && article.gallery.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gabi-dark">Галерея</h2>
          <CampGallery slug={article.slug} title={article.title} photos={article.gallery} />
        </section>
      )}

      {article.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 text-xs uppercase tracking-wide text-gabi-blue">
          {article.tags.map((tag) => (
            <Link key={tag.slug} href={`/blog?tag=${tag.slug}`} className="rounded-full bg-gabi-blue/10 px-3 py-1 hover:bg-gabi-blue/20">
              #{tag.title}
            </Link>
          ))}
        </div>
      )}

      <div className="rounded-[28px] border border-gabi-blue/20 bg-white/80 p-8 shadow-glow">
        <h2 className="text-2xl font-semibold text-gabi-dark">Готовы применить советы на практике?</h2>
        <p className="mt-2 text-sm text-slate-500">
          Запишитесь на тренировку или кэмп — и тренеры помогут перевести теорию в результат.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <LeadCtaButton label="Записаться на тренировку" className="btn-primary" source={`blog-${article.slug}`} />
          <Link href="/camps" className="btn-secondary">
            Посмотреть кэмпы
          </Link>
        </div>
      </div>
    </article>
  );
}
