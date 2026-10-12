import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Clock, Calendar, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { CtaSection } from "@/components/sections/CtaSection";
import { articles } from "@/data/articles";
import { buildMeta, canonicalLink, breadcrumbJsonLd } from "@/lib/seo";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: buildMeta({
      title: "Resources & Learning Guides | TechBuilt Open School",
      description:
        "Free learning guides and roadmaps on Python programming, data analysis, full-stack development, youth coding, and choosing the right tutor or course.",
      path: "/blog",
      keywords: [
        "learning resources",
        "python learning roadmap",
        "data analyst roadmap",
        "full stack developer roadmap",
        "programming for kids",
        "how to learn python",
      ],
    }),
    links: [canonicalLink("/blog")],
    scripts: [
      breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Resources", path: "/blog" },
      ]),
    ],
  }),
  component: BlogIndexPage,
});

function BlogIndexPage() {
  return (
    <>
      <PageHeader
        eyebrow="Resources & Roadmaps"
        title="Helpful Guides for Learners and Parents"
        description="Comprehensive, transparent roadmaps to help you master programming, analyze data, and choose the right educational path with confidence."
        breadcrumb={[{ label: "Resources" }]}
      />

      <section className="mx-auto max-w-7xl container-px py-16 sm:py-20">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Evergreen Curriculum Guides
            </span>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Featured Learning Roadmaps
            </h2>
          </div>
          <p className="max-w-md text-sm text-muted-foreground">
            Practical, curriculum-aligned guides written by our instructional team. No filler, no
            guarantees—just actionable steps.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article, i) => (
            <Reveal key={article.slug} delay={i * 60}>
              <article className="group flex h-full flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-card">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      {article.category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {article.readTime}
                    </span>
                  </div>

                  <h3 className="mt-4 text-xl font-bold leading-snug text-foreground group-hover:text-primary">
                    <Link to={`/blog/${article.slug}` as any} className="focus:outline-none">
                      {article.title}
                    </Link>
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {article.excerpt}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border/60">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Reviewed: {article.updatedAt}
                    </span>
                    <Link
                      to={`/blog/${article.slug}` as any}
                      className="inline-flex items-center gap-1 font-semibold text-primary group-hover:translate-x-0.5 transition-transform"
                    >
                      Read Guide
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Internal Pathway Directory */}
      <section className="bg-muted/30 border-y border-border py-14">
        <div className="mx-auto max-w-7xl container-px">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">
              Explore Academic & Technical Learning Paths
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Direct access to live courses, tutoring support, and specialized learning tracks.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              to="/courses"
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition hover:border-primary/50 hover:shadow-soft"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <BookOpen className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">32 Single Courses</p>
                <p className="text-xs text-muted-foreground">Python, Web, SQL & AI</p>
              </div>
            </Link>

            <Link
              to="/specializations"
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition hover:border-primary/50 hover:shadow-soft"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">10 Specializations</p>
                <p className="text-xs text-muted-foreground">Full-Stack, Data & AI</p>
              </div>
            </Link>

            <Link
              to="/live-batches"
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition hover:border-primary/50 hover:shadow-soft"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <Clock className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">Live Cohorts</p>
                <p className="text-xs text-muted-foreground">4 classes/week with mentor</p>
              </div>
            </Link>

            <Link
              to="/tutoring"
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition hover:border-primary/50 hover:shadow-soft"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <BookOpen className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">1-on-1 Tutoring</p>
                <p className="text-xs text-muted-foreground">School, College & Quran</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
