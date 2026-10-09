import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  BarChart3,
  Monitor,
  Users,
  MessageCircle,
  Sparkles,
  ChevronRight,
  HelpCircle,
  Laptop,
} from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { CourseVisual } from "@/components/catalog/CourseVisual";
import { QuickFacts } from "@/components/catalog/QuickFacts";
import { LearningPathTimeline } from "@/components/catalog/LearningPathTimeline";
import { CourseCatalogCard } from "@/components/catalog/CourseCatalogCard";
import { CtaSection } from "@/components/sections/CtaSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCourse, courses } from "@/data/courses";
import { getCourseCatalogVisual } from "@/data/catalogVisuals";
import { getCmsCourseBySlugFn } from "@/lib/cmsFunctions";
import { buildMeta, courseJsonLd } from "@/lib/seo";
import { site, whatsappLink } from "@/data/site";

export const Route = createFileRoute("/courses/$slug")({
  loader: async ({ params }) => {
    let course = null;
    try {
      course = await getCmsCourseBySlugFn({ data: params.slug });
    } catch {
      course = getCourse(params.slug);
    }
    if (!course) throw notFound();
    return { course };
  },
  head: ({ loaderData }) => {
    const course = loaderData?.course;
    if (!course) return { meta: buildMeta({ title: "Course", description: "Course details." }) };
    const title = course.seoTitle || `${course.title} Course Online | TechBuilt Open School`;
    const description = course.seoDescription || `${course.summary} ${course.priceNote}.`;
    return {
      meta: buildMeta({
        title,
        description,
        keywords: course.keywords,\n        path: `/courses/${course.slug}`,
        type: "article",
      }),
      links: [{ rel: "canonical", href: `${site.url}/courses/${course.slug}` }],
      scripts: [courseJsonLd(course.title, course.summary)],
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl container-px py-28 text-center">
      <h1 className="text-3xl font-bold text-foreground">Course not found</h1>
      <p className="mt-3 text-muted-foreground">
        The course you&apos;re looking for doesn&apos;t exist.
      </p>
      <Button asChild className="mt-6">
        <Link to="/courses">Browse all courses</Link>
      </Button>
    </div>
  ),
  component: CourseDetail,
});

function CourseDetail() {
  const { course } = Route.useLoaderData();
  const visual = getCourseCatalogVisual(course.slug);

  const related = courses
    .filter((c) => c.slug !== course.slug && c.category === course.category)
    .slice(0, 3);
  const relatedList =
    related.length === 3
      ? related
      : [
          ...related,
          ...courses
            .filter((c) => c.slug !== course.slug && !related.some((r) => r.slug === c.slug))
            .slice(0, 3 - related.length),
        ];

  // Parse prerequisites safely
  const rawPrereq = course.prerequisites;
  const prereqList: string[] = Array.isArray(rawPrereq)
    ? (rawPrereq as string[])
    : typeof rawPrereq === "string" && rawPrereq.trim().length > 0
      ? rawPrereq
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean)
      : [];

  return (
    <>
      {/* 1. Course Hero: 2-Column Responsive Layout */}
      <section className="relative overflow-hidden bg-gradient-hero py-12 sm:py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-dots opacity-20"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 rounded-full bg-cyan/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-gold/15 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl container-px">
          {/* Breadcrumbs */}
          <nav
            aria-label="Breadcrumb"
            className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-primary-foreground/75"
          >
            <Link to="/" className="hover:text-cyan transition-colors">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5 opacity-60" />
            <Link to="/courses" className="hover:text-cyan transition-colors">
              Courses
            </Link>
            <ChevronRight className="h-3.5 w-3.5 opacity-60" />
            <span className="text-primary-foreground/95 font-medium">{course.title}</span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            {/* Left Column: Heading, Tagline, Badges & Quick CTAs */}
            <div className="lg:col-span-7">
              <Reveal>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan/30 bg-cyan/10 px-3 py-1 font-mono text-xs font-semibold uppercase tracking-wider text-cyan">
                    {course.category}
                  </span>
                  <Badge
                    variant="outline"
                    className="border-primary-foreground/20 text-primary-foreground/90"
                  >
                    {course.level}
                  </Badge>
                  <span className="glass inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
                    <Clock className="h-3 w-3 text-cyan" /> {course.duration}
                  </span>
                </div>

                <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-primary-foreground sm:text-4xl lg:text-5xl">
                  {course.title}
                </h1>
                <p className="mt-2 text-base font-semibold text-gold sm:text-lg">
                  {course.tagline}
                </p>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-primary-foreground/80 sm:text-base">
                  {course.summary}
                </p>

                {/* Primary Hero CTAs */}
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Button asChild variant="hero" size="lg" className="font-semibold shadow-soft">
                    <Link
                      to="/apply"
                      search={{
                        type: "Single Course",
                        selected: course.title,
                      }}
                    >
                      Apply for this course <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="glass border-primary-foreground/25 font-semibold text-primary-foreground hover:bg-white/10"
                  >
                    <Link
                      to="/free-demo"
                      search={{
                        type: "Single Course",
                        selected: course.title,
                      }}
                    >
                      <Sparkles className="mr-1.5 h-4 w-4 text-gold" /> Request Free Demo
                    </Link>
                  </Button>
                </div>
              </Reveal>
            </div>

            {/* Right Column: Course Visual Hero Composition */}
            <div className="lg:col-span-5">
              <Reveal delay={100}>
                <div className="overflow-hidden rounded-3xl border border-primary-foreground/20 bg-card/10 p-3 shadow-2xl backdrop-blur-xs">
                  <CourseVisual
                    visual={visual}
                    iconName={course.icon}
                    className="aspect-[16/10] sm:aspect-[16/9]"
                  />
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="mx-auto max-w-7xl container-px py-12 sm:py-16">
        {/* 2. Quick Facts Row */}
        <Reveal>
          <QuickFacts
            duration={course.duration}
            level={course.level}
            mode={course.mode}
            format="1-on-1 & small cohorts"
          />
        </Reveal>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          {/* Main Column */}
          <div className="space-y-12">
            {/* 3. Course Overview */}
            <Reveal>
              <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-soft">
                <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
                  Course overview
                </h2>
                <p className="mt-4 text-sm sm:text-base leading-relaxed text-muted-foreground whitespace-pre-line">
                  {course.description}
                </p>
              </div>
            </Reveal>

            {/* 4. What you'll achieve / Outcomes */}
            <Reveal>
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
                  What you&apos;ll achieve
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Core competencies developed through practical implementation and project work.
                </p>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {course.outcomes.map((outcome: string) => (
                    <li
                      key={outcome}
                      className="flex items-start gap-3 rounded-2xl border border-border/80 bg-card p-4 text-xs sm:text-sm font-medium text-foreground shadow-soft transition-colors hover:border-border-strong"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            {/* 5. Progressive Curriculum Roadmap */}
            <Reveal>
              <LearningPathTimeline
                items={course.curriculum}
                title="Curriculum & Syllabus"
                subtitle="Progressive modules designed around real programming assignments, clean code, and feedback."
              />
            </Reveal>

            {/* 6. Prerequisites (if any) */}
            {prereqList.length > 0 && (
              <Reveal>
                <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-soft">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-primary" />
                    <h3 className="font-display text-lg font-bold text-foreground">
                      Prerequisites & Prior Knowledge
                    </h3>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Recommended background before starting this course. Mentors adapt pacing to your
                    current level.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {prereqList.map((prereq: string) => (
                      <Badge
                        key={prereq}
                        variant="outline"
                        className="rounded-lg px-3 py-1 font-mono text-xs font-medium"
                      >
                        {prereq}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Reveal>
            )}

            {/* 7. Who is this for & Learning format */}
            <div className="grid gap-6 sm:grid-cols-2">
              <Reveal>
                <div className="h-full rounded-3xl border border-border/80 bg-muted/40 p-6 shadow-soft">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-primary font-semibold">
                    Target Audience
                  </span>
                  <h3 className="mt-1 font-display text-lg font-bold text-foreground">
                    Who is this course for?
                  </h3>
                  <p className="mt-3 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                    {course.audience}
                  </p>
                </div>
              </Reveal>

              <Reveal delay={60}>
                <div className="h-full rounded-3xl border border-border/80 bg-muted/40 p-6 shadow-soft">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-cyan font-semibold">
                    Delivery & Mentoring
                  </span>
                  <h3 className="mt-1 font-display text-lg font-bold text-foreground">
                    Hands-on Learning Format
                  </h3>
                  <ul className="mt-3 space-y-2 text-xs sm:text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Laptop className="h-3.5 w-3.5 text-primary shrink-0" /> Live interactive
                      screen-sharing
                    </li>
                    <li className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-primary shrink-0" /> 1-on-1 personalized
                      instruction
                    </li>
                    <li className="flex items-center gap-2">
                      <Monitor className="h-3.5 w-3.5 text-primary shrink-0" /> Practical,
                      portfolio-ready code
                    </li>
                  </ul>
                </div>
              </Reveal>
            </div>
          </div>

          {/* 10. Sticky Enrollment Panel */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Reveal delay={120}>
              <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-card">
                <p className="font-mono text-xs font-semibold uppercase tracking-wider text-gold-foreground">
                  {course.priceNote}
                </p>
                <h3 className="mt-1 font-display text-2xl font-bold text-foreground">
                  Enrol in {course.title}
                </h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  Start with a 1-on-1 trial session to discuss your technical goals with an
                  instructor.
                </p>

                <ul className="mt-6 space-y-3.5 border-t border-border/80 pt-5 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2.5">
                    <Clock className="h-4 w-4 text-cyan" />
                    <span>
                      Duration: <strong className="text-foreground">{course.duration}</strong>
                    </span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <BarChart3 className="h-4 w-4 text-cyan" />
                    <span>
                      Level: <strong className="text-foreground">{course.level}</strong>
                    </span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Monitor className="h-4 w-4 text-cyan" />
                    <span>
                      Delivery: <strong className="text-foreground">{course.mode}</strong>
                    </span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Users className="h-4 w-4 text-cyan" />
                    <span>
                      Format: <strong className="text-foreground">1-on-1 & small cohorts</strong>
                    </span>
                  </li>
                </ul>

                {/* Primary Apply Button */}
                <Button
                  asChild
                  variant="hero"
                  size="lg"
                  className="mt-6 w-full font-semibold shadow-soft"
                >
                  <Link
                    to="/apply"
                    search={{
                      type: "Single Course",
                      selected: course.title,
                    }}
                  >
                    Apply for this course <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>

                {/* Free Demo Trial CTA (preserves selection context & trial session note) */}
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="mt-3 w-full font-semibold border-primary/25 hover:border-primary/50"
                >
                  <Link
                    to="/free-demo"
                    search={{
                      type: "Single Course",
                      selected: course.title,
                    }}
                  >
                    <Sparkles className="mr-1.5 h-4 w-4 text-gold-foreground" /> Request Free Demo
                    Trial
                  </Link>
                </Button>
                <p className="mt-1 text-center font-mono text-[10px] text-muted-foreground">
                  * Free Demo is a 1-on-1 trial session, not the complete course.
                </p>

                {/* WhatsApp Chat Inquiry */}
                <div className="mt-4 border-t border-border/80 pt-3">
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs text-muted-foreground hover:text-foreground"
                  >
                    <a
                      href={whatsappLink(
                        `Hello TechBuilt Open School, I have a question about the ${course.title} course.`,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="mr-1.5 h-3.5 w-3.5 text-emerald-500" /> Have
                      questions? Ask on WhatsApp
                    </a>
                  </Button>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 9. Related Courses */}
      <section className="border-t border-border/80 bg-muted/40 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl container-px">
          <div className="flex items-end justify-between">
            <div>
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-primary">
                Explore More
              </span>
              <h2 className="mt-1 font-display text-2xl font-bold text-foreground sm:text-3xl">
                Related Technical Courses
              </h2>
            </div>
            <Link
              to="/courses"
              className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              Browse all 32 courses <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedList.map((c) => (
              <CourseCatalogCard key={c.slug} course={c} />
            ))}
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
