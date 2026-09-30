import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Clock, BarChart3, Monitor, Users, MessageCircle, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CourseCard } from "@/components/CourseCard";
import { CtaSection } from "@/components/sections/CtaSection";
import { getCourse, courses } from "@/data/courses";
import { buildMeta, courseJsonLd } from "@/lib/seo";
import { whatsappLink } from "@/data/site";

export const Route = createFileRoute("/courses/$slug")({
  loader: ({ params }) => {
    const course = getCourse(params.slug);
    if (!course) throw notFound();
    return { course };
  },
  head: ({ loaderData }) => {
    const course = loaderData?.course;
    if (!course) return { meta: buildMeta({ title: "Course", description: "Course details." }) };
    return {
      meta: buildMeta({
        title: `${course.title} Course Online | TechBuilt Open School`,
        description: `${course.summary} ${course.priceNote}.`,
        keywords: course.keywords,
        type: "article",
      }),
      links: [{ rel: "canonical", href: `/courses/${course.slug}` }],
      scripts: [courseJsonLd(course.title, course.summary)],
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl container-px py-28 text-center">
      <h1 className="text-3xl font-bold text-foreground">Course not found</h1>
      <p className="mt-3 text-muted-foreground">The course you're looking for doesn't exist.</p>
      <Button asChild className="mt-6">
        <Link to="/courses">Browse all courses</Link>
      </Button>
    </div>
  ),
  component: CourseDetail,
});

function CourseDetail() {
  const { course } = Route.useLoaderData();
  const related = courses.filter((c) => c.slug !== course.slug && c.category === course.category).slice(0, 3);
  const relatedList = related.length ? related : courses.filter((c) => c.slug !== course.slug).slice(0, 3);

  return (
    <>
      <PageHeader
        eyebrow={`${course.category} course`}
        title={course.title}
        description={course.tagline}
        breadcrumb={[{ label: "Courses", to: "/courses" }, { label: course.title }]}
      />

      <section className="mx-auto max-w-7xl container-px py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <Reveal>
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-hero text-primary-foreground shadow-soft">
                <Icon name={course.icon} className="h-7 w-7" />
              </span>
              <div className="mt-5 flex flex-wrap gap-2">
                <Badge variant="secondary">{course.category}</Badge>
                <Badge variant="outline">{course.level}</Badge>
              </div>
              <h2 className="mt-5 text-2xl font-bold text-foreground">Course overview</h2>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                {course.description}
              </p>
            </Reveal>

            {course.prerequisites && course.prerequisites.length > 0 && (
              <Reveal className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-soft">
                <h3 className="text-lg font-bold text-foreground">Prerequisites</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {course.prerequisites.map((p: string) => (
                    <Badge key={p} variant="outline" className="px-3 py-1 text-sm font-medium">
                      {p}
                    </Badge>
                  ))}
                </div>
              </Reveal>
            )}

            <Reveal className="mt-10">
              <h2 className="text-2xl font-bold text-foreground">What you'll achieve</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {course.outcomes.map((o: string) => (
                  <li key={o} className="flex items-start gap-2.5 rounded-xl border border-border bg-card p-4 text-sm text-foreground/90 shadow-soft">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal className="mt-10">
              <h2 className="text-2xl font-bold text-foreground">Curriculum</h2>
              <ol className="mt-4 space-y-3">
                {course.curriculum.map((step: string, i: number) => (
                  <li key={step} className="flex items-start gap-4 rounded-xl border border-border bg-card p-4 shadow-soft">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent text-sm font-bold text-primary">
                      {i + 1}
                    </span>
                    <span className="pt-1 text-sm font-medium text-foreground">{step}</span>
                  </li>
                ))}
              </ol>
            </Reveal>

            <Reveal className="mt-10 rounded-2xl bg-muted/60 p-6">
              <h3 className="text-lg font-bold text-foreground">Who is this for?</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{course.audience}</p>
            </Reveal>
          </div>

          {/* Sidebar */}
          <Reveal delay={120} className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <p className="text-sm font-semibold text-gold-foreground">{course.priceNote}</p>
              <h3 className="mt-1 text-xl font-bold text-foreground">Enrol in {course.title}</h3>
              <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2.5">
                  <Clock className="h-4 w-4 text-primary" /> {course.duration}
                </li>
                <li className="flex items-center gap-2.5">
                  <BarChart3 className="h-4 w-4 text-primary" /> {course.level}
                </li>
                <li className="flex items-center gap-2.5">
                  <Monitor className="h-4 w-4 text-primary" /> {course.mode}
                </li>
                <li className="flex items-center gap-2.5">
                  <Users className="h-4 w-4 text-primary" /> {course.availability}
                </li>
              </ul>
              <Button asChild variant="hero" size="lg" className="mt-6 w-full">
                <Link
                  to="/apply"
                  search={{
                    type: "Single Course",
                    selected: course.title,
                  }}
                >
                  Apply for this course <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="mt-3 w-full">
                <Link
                  to="/free-demo"
                  search={{
                    type: "Single Course",
                    selected: course.title,
                  }}
                >
                  <Sparkles className="h-4 w-4 text-gold-foreground" /> Request Free Demo
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="mt-1 w-full text-muted-foreground hover:text-foreground">
                <a
                  href={whatsappLink(`Hello TechBuilt Open School, I have a question about the ${course.title} course.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-3.5 w-3.5" /> Have questions? Ask on WhatsApp
                </a>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-muted/50">
        <div className="mx-auto max-w-7xl container-px py-16 sm:py-20">
          <h2 className="text-2xl font-bold text-foreground">Related courses</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedList.map((c) => (
              <CourseCard key={c.slug} course={c} />
            ))}
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
