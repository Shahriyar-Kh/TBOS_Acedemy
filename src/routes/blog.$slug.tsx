import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  HelpCircle,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getArticleBySlug, articles } from "@/data/articles";
import { site, whatsappLink } from "@/data/site";
import { buildMeta, canonicalLink, articleJsonLd, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";

function formatArticleDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function renderInlineCode(value: string) {
  return value.split(/(`[^`]+`)/g).map((part, index) =>
    part.startsWith("`") && part.endsWith("`") ? (
      <code
        key={`${part}-${index}`}
        className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em] text-foreground"
      >
        {part.slice(1, -1)}
      </code>
    ) : (
      part
    ),
  );
}

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const article = getArticleBySlug(params.slug);
    if (!article) throw notFound();
    return { article };
  },
  head: ({ loaderData }) => {
    const article = loaderData?.article;
    if (!article) {
      return {
        meta: buildMeta({
          title: "Resource Article | TechBuilt Open School",
          description: "Educational guide.",
        }),
      };
    }

    const path = `/blog/${article.slug}`;
    const articleUrl = new URL(path, site.url).toString();

    return {
      meta: buildMeta({
        title: article.metaTitle,
        description: article.metaDescription,
        path,
        type: "article",
        keywords: article.keywords,
      }),
      links: [canonicalLink(path)],
      scripts: [
        articleJsonLd({
          title: article.title,
          description: article.metaDescription,
          url: articleUrl,
          publishedAt: article.publishedAt,
          updatedAt: article.updatedAt,
          authorName: article.author.name,
        }),
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Resources", path: "/blog" },
          { name: article.title, path },
        ]),
        faqJsonLd(article.faqs),
      ],
    };
  },
  component: ArticleDetailPage,
});

function ArticleDetailPage() {
  const { article } = Route.useLoaderData();

  return (
    <>
      {/* Article Header */}
      <section className="bg-gradient-to-b from-card to-background border-b border-border py-12 sm:py-16">
        <div className="mx-auto max-w-4xl container-px">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"
          >
            <Link to="/" className="hover:text-foreground">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
            <Link to="/blog" className="hover:text-foreground">
              Resources
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
            <span className="text-foreground font-medium truncate max-w-xs sm:max-w-md">
              {article.title}
            </span>
          </nav>

          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            {article.eyebrow}
          </span>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl leading-tight">
            {article.h1}
          </h1>

          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{article.excerpt}</p>

          <div className="mt-8 flex flex-wrap items-center gap-6 border-t border-border pt-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-primary">
                <User className="h-4 w-4" />
              </span>
              <div>
                <p className="font-semibold text-foreground">{article.author.name}</p>
                <p className="text-[11px] text-muted-foreground">{article.author.role}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-primary" />
              <span>
                Reviewed:{" "}
                <time dateTime={article.updatedAt}>{formatArticleDate(article.updatedAt)}</time>
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-primary" />
              <span>{article.readTime}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Article Content & Sidebar */}
      <section className="mx-auto max-w-7xl container-px py-12 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Main Content Column */}
          <div className="lg:col-span-8">
            {/* Table of Contents for Mobile / Inline */}
            <div className="mb-10 rounded-2xl border border-border bg-card p-6 shadow-soft lg:hidden">
              <h2 className="text-base font-bold text-foreground">Table of Contents</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {article.tableOfContents.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="text-primary hover:underline hover:text-primary/80 transition-colors"
                    >
                      {item.title}
                    </a>
                  </li>
                ))}
                <li>
                  <a href="#frequently-asked-questions" className="text-primary hover:underline">
                    Frequently Asked Questions
                  </a>
                </li>
              </ul>
            </div>

            {/* Article Sections */}
            <div className="space-y-12">
              {article.sections.map((section) => (
                <section key={section.id} id={section.id} className="scroll-mt-24">
                  <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {section.heading}
                  </h2>

                  <div className="mt-4 space-y-4 text-base leading-relaxed text-muted-foreground">
                    {section.paragraphs.map((p, pIndex) => (
                      <p key={pIndex} className="whitespace-pre-line">
                        {renderInlineCode(p)}
                      </p>
                    ))}
                  </div>

                  {section.keyTakeaways && section.keyTakeaways.length > 0 && (
                    <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-5">
                      <p className="font-semibold text-foreground text-sm uppercase tracking-wide text-primary">
                        Key Takeaways
                      </p>
                      <ul className="mt-3 space-y-2 text-sm text-foreground">
                        {section.keyTakeaways.map((point, kIndex) => (
                          <li key={kIndex} className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                            <span>{renderInlineCode(point)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {section.listItems && section.listItems.length > 0 && (
                    <div className="mt-5 rounded-xl border border-border bg-muted/30 p-5">
                      <ul className="space-y-2.5 text-sm text-muted-foreground">
                        {section.listItems.map((item, lIndex) => (
                          <li key={lIndex} className="flex items-start gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                            <span className="text-foreground">{renderInlineCode(item)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </section>
              ))}

              {/* Visibly Rendered FAQs (Matches FAQPage Schema strictly) */}
              <section
                id="frequently-asked-questions"
                className="scroll-mt-24 pt-8 border-t border-border"
              >
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold tracking-tight text-foreground">
                    Frequently Asked Questions
                  </h2>
                </div>
                <div className="mt-6 space-y-4">
                  {article.faqs.map((faq, fIndex) => (
                    <div
                      key={fIndex}
                      className="rounded-xl border border-border bg-card p-5 shadow-soft"
                    >
                      <h3 className="text-base font-semibold text-foreground">{faq.question}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Contextual In-Article Call to Action */}
              <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-card to-primary/5 p-8 shadow-card">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {article.cta.eyebrow}
                </span>
                <h2 className="mt-2 text-2xl font-bold text-foreground">{article.cta.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground max-w-xl">
                  {article.cta.description}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button asChild size="default">
                    <Link to={article.cta.primaryBtn.to as any}>
                      {article.cta.primaryBtn.text}
                      <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Link>
                  </Button>
                  {article.cta.secondaryBtnText && article.cta.secondaryBtnTo && (
                    <Button asChild variant="outline">
                      <Link to={article.cta.secondaryBtnTo as any}>
                        {article.cta.secondaryBtnText}
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Sidebar */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              {/* Desktop Table of Contents */}
              <div className="hidden lg:block rounded-2xl border border-border bg-card p-6 shadow-soft">
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Contents
                </h2>
                <nav aria-label="Table of Contents" className="mt-4">
                  <ul className="space-y-2 text-xs leading-relaxed">
                    {article.tableOfContents.map((item) => (
                      <li key={item.id}>
                        <a
                          href={`#${item.id}`}
                          className="block text-muted-foreground hover:text-primary transition-colors py-1"
                        >
                          {item.title}
                        </a>
                      </li>
                    ))}
                    <li>
                      <a
                        href="#frequently-asked-questions"
                        className="block text-muted-foreground hover:text-primary transition-colors py-1"
                      >
                        Frequently Asked Questions
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>

              {/* Related Programs Box */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Relevant Programs
                </h2>
                <div className="mt-4 space-y-3">
                  {article.relatedPrograms.map((prog, pIndex) => (
                    <Link
                      key={pIndex}
                      to={prog.to as any}
                      className="group block rounded-xl border border-border p-3.5 transition hover:border-primary/50 hover:bg-muted/30"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                          {prog.badge}
                        </span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
                      </div>
                      <p className="mt-1 text-sm font-bold text-foreground group-hover:text-primary">
                        {prog.title}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                        {prog.description}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Fast Advisory Contact */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-soft text-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Admissions Support
                </p>
                <h3 className="mt-2 text-base font-bold text-foreground">
                  Have Questions About Programs?
                </h3>
                <p className="mt-2 text-xs text-muted-foreground">
                  Our team reviews student levels and schedules before enrollment.
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  <Button asChild size="sm" variant="default" className="w-full">
                    <Link to="/free-demo">Request a Free Demo</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="w-full">
                    <a
                      href={whatsappLink(
                        `Hi, I am reading the ${article.title} guide and would like program advice.`,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      WhatsApp Admissions
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Other Resource Guides Carousel/List */}
      <section className="bg-muted/20 border-t border-border py-14">
        <div className="mx-auto max-w-7xl container-px">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">
              More Educational Guides
            </h2>
            <Link
              to="/blog"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              View all resources
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles
              .filter((a) => a.slug !== article.slug)
              .slice(0, 3)
              .map((other) => (
                <article
                  key={other.slug}
                  className="rounded-xl border border-border bg-card p-5 shadow-soft flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                      {other.category}
                    </span>
                    <h3 className="mt-2 text-base font-bold text-foreground line-clamp-2">
                      <Link to={`/blog/${other.slug}` as any} className="hover:text-primary">
                        {other.title}
                      </Link>
                    </h3>
                    <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                      {other.excerpt}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{other.readTime}</span>
                    <Link
                      to={`/blog/${other.slug}` as any}
                      className="font-semibold text-primary hover:underline"
                    >
                      Read Guide &rarr;
                    </Link>
                  </div>
                </article>
              ))}
          </div>
        </div>
      </section>
    </>
  );
}
