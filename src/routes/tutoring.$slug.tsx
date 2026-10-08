import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock4,
  Globe2,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";
import { Icon } from "@/components/Icon";
import { Reveal } from "@/components/Reveal";
import { TutoringCatalogCard } from "@/components/catalog/TutoringCatalogCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getTutoringBySlug, tutoringSubjects } from "@/data/tutoring";
import { site, whatsappLink } from "@/data/site";
import { getCmsTutoringBySlugFn } from "@/lib/cmsFunctions";
import { buildMeta } from "@/lib/seo";

export const Route = createFileRoute("/tutoring/$slug")({
  loader: async ({ params }) => {
    let subject = null;
    try {
      subject = await getCmsTutoringBySlugFn({ data: params.slug });
    } catch {
      subject = getTutoringBySlug(params.slug);
    }

    if (!subject) throw notFound();
    return { subject };
  },
  head: ({ loaderData }) => {
    const subject = loaderData?.subject;
    if (!subject) {
      return {
        meta: buildMeta({
          title: "Tutoring | TechBuilt Open School",
          description: "Online tutoring details.",
        }),
      };
    }

    return {
      meta: buildMeta({
        title:
          subject.seoTitle ||
          `${subject.title} Online Tutoring | TechBuilt Open School`,
        description:
          subject.seoDescription ||
          `${subject.summary} Live online tutoring with one-to-one and small-group options, subject to tutor availability.`,
        keywords: subject.keywords,
        path: `/tutoring/${subject.slug}`,
      }),
      links: [{ rel: "canonical", href: `${site.url}/tutoring/${subject.slug}` }],
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl container-px py-28 text-center">
      <h1 className="text-3xl font-bold text-foreground">Tutoring subject not found</h1>
      <p className="mt-3 text-muted-foreground">
        The tutoring option you&apos;re looking for is not currently available.
      </p>
      <Button asChild className="mt-6">
        <Link to="/tutoring">Browse tutoring options</Link>
      </Button>
    </div>
  ),
  component: TutoringDetailPage,
});

function TutoringDetailPage() {
  const { subject } = Route.useLoaderData();
  const type =
    subject.category === "Quran & Islamic Studies" ? "Quran & Islamic Studies" : "Academic Tutoring";

  const related = tutoringSubjects
    .filter((item) => item.slug !== subject.slug && item.category === subject.category)
    .slice(0, 3);

  const fallbackRelated =
    related.length === 3
      ? related
      : [
          ...related,
          ...tutoringSubjects
            .filter(
              (item) =>
                item.slug !== subject.slug &&
                !related.some((relatedItem) => relatedItem.slug === item.slug),
            )
            .slice(0, 3 - related.length),
        ];

  return (
    <>
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
          <nav
            aria-label="Breadcrumb"
            className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-primary-foreground/75"
          >
            <Link to="/" className="transition-colors hover:text-cyan">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5 opacity-60" />
            <Link to="/tutoring" className="transition-colors hover:text-cyan">
              Tutoring
            </Link>
            <ChevronRight className="h-3.5 w-3.5 opacity-60" />
            <span className="font-medium text-primary-foreground/95">{subject.title}</span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <Reveal>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan/30 bg-cyan/10 px-3 py-1 font-mono text-xs font-semibold uppercase tracking-wider text-cyan">
                    {subject.category}
                  </span>
                  <Badge
                    variant="outline"
                    className="border-primary-foreground/20 text-primary-foreground/90"
                  >
                    {subject.level}
                  </Badge>
                </div>

                <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-primary-foreground sm:text-4xl lg:text-5xl">
                  {subject.title}
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-primary-foreground/80 sm:text-base">
                  {subject.summary}
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Button asChild variant="hero" size="lg" className="font-semibold shadow-soft">
                    <Link to="/apply" search={{ type, selected: subject.title }}>
                      Request this tutor <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="glass border-primary-foreground/25 font-semibold text-primary-foreground hover:bg-white/10"
                  >
                    <Link to="/free-demo" search={{ type, selected: subject.title }}>
                      <Sparkles className="mr-1.5 h-4 w-4 text-gold" />
                      Request Free Demo
                    </Link>
                  </Button>
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-5">
              <Reveal delay={100}>
                <div className="relative overflow-hidden rounded-3xl border border-primary-foreground/20 bg-white/10 p-8 shadow-2xl backdrop-blur-sm">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-gold/15 blur-3xl"
                  />
                  <span className="relative grid h-20 w-20 place-items-center rounded-3xl border border-primary-foreground/20 bg-white/10 text-cyan">
                    <Icon name={subject.icon} className="h-10 w-10" />
                  </span>
                  <p className="relative mt-8 font-mono text-xs font-semibold uppercase tracking-wider text-gold">
                    Personalized tutoring pathway
                  </p>
                  <p className="relative mt-2 text-sm leading-relaxed text-primary-foreground/80">
                    Admissions confirms tutor availability, schedule, class format, and applicable
                    fees before enrollment.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border/80 bg-card">
        <div className="mx-auto grid max-w-7xl gap-4 container-px py-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: UserRound,
              label: "Format",
              value: "1-on-1 available",
            },
            {
              icon: Users,
              label: "Group option",
              value: "Small groups when scheduled",
            },
            {
              icon: Globe2,
              label: "Delivery",
              value: "Live online",
            },
            {
              icon: Clock4,
              label: "Schedule",
              value: "Confirmed by admissions",
            },
          ].map((fact) => (
            <div
              key={fact.label}
              className="flex items-center gap-3 rounded-2xl border border-border/70 bg-muted/30 p-4"
            >
              <fact.icon className="h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {fact.label}
                </p>
                <p className="mt-0.5 text-sm font-semibold text-foreground">{fact.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl container-px py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-12">
            <Reveal>
              <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-soft sm:p-8">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-primary">
                  Learner fit
                </span>
                <h2 className="mt-1 font-display text-2xl font-bold text-foreground">
                  Who this tutoring option is for
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {subject.audience}
                </p>
              </div>
            </Reveal>

            <Reveal>
              <div>
                <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-primary">
                  Subject coverage
                </span>
                <h2 className="mt-1 font-display text-2xl font-bold text-foreground">
                  Topics that can be covered
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Exact lesson order is adapted to the learner&apos;s current syllabus, goals, and
                  starting level after admissions review.
                </p>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {subject.topics.map((topic) => (
                    <li
                      key={topic}
                      className="flex items-start gap-3 rounded-2xl border border-border/80 bg-card p-4 text-sm font-medium text-foreground shadow-soft"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal>
              <div className="rounded-3xl border border-border/80 bg-muted/40 p-6 shadow-soft sm:p-8">
                <h2 className="font-display text-2xl font-bold text-foreground">
                  How the tutoring setup works
                </h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  {[
                    {
                      step: "01",
                      title: "Share your level",
                      desc: "Submit the learner's current grade, syllabus, goals, and preferred timing.",
                    },
                    {
                      step: "02",
                      title: "Confirm the match",
                      desc: "Admissions reviews tutor availability and confirms the proposed format, schedule, and fee.",
                    },
                    {
                      step: "03",
                      title: "Start with a trial",
                      desc: "Where available, use the one-session Free Demo to assess teaching fit before paid continuation.",
                    },
                  ].map((item) => (
                    <div key={item.step} className="rounded-2xl border border-border/70 bg-card p-5">
                      <span className="font-mono text-xs font-bold text-primary">{item.step}</span>
                      <h3 className="mt-2 text-sm font-bold text-foreground">{item.title}</h3>
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal>
              <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-soft sm:p-8">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <h2 className="font-display text-xl font-bold text-foreground">
                      Clear expectations before enrollment
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      Tutor assignment, recurring timetable, class size, and pricing are confirmed
                      with admissions before paid classes begin. A Free Demo is one trial session
                      only and does not represent the full tutoring program.
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Reveal delay={100}>
              <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-card sm:p-7">
                <p className="font-mono text-xs font-semibold uppercase tracking-wider text-gold-foreground">
                  {subject.level}
                </p>
                <h2 className="mt-1 font-display text-2xl font-bold text-foreground">
                  Ask about {subject.title}
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Admissions will confirm availability and the most suitable next step for your
                  learning requirements.
                </p>

                <ul className="mt-6 space-y-3 border-t border-border/80 pt-5 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2.5">
                    <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-cyan" />
                    <span>Subject: <strong className="text-foreground">{subject.title}</strong></span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-cyan" />
                    <span>Level: <strong className="text-foreground">{subject.level}</strong></span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Clock4 className="mt-0.5 h-4 w-4 shrink-0 text-cyan" />
                    <span>Timing: <strong className="text-foreground">Confirmed after review</strong></span>
                  </li>
                </ul>

                <Button asChild variant="hero" size="lg" className="mt-6 w-full font-semibold">
                  <Link to="/apply" search={{ type, selected: subject.title }}>
                    Request this tutor <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>

                <Button asChild variant="outline" size="lg" className="mt-3 w-full font-semibold">
                  <Link to="/free-demo" search={{ type, selected: subject.title }}>
                    <Sparkles className="mr-1.5 h-4 w-4 text-gold-foreground" />
                    Request Free Demo
                  </Link>
                </Button>
                <p className="mt-2 text-center font-mono text-[10px] text-muted-foreground">
                  Free Demo = one trial session, subject to scheduling.
                </p>

                <Button asChild variant="ghost" size="sm" className="mt-4 w-full text-xs">
                  <a
                    href={whatsappLink(
                      `Hello TechBuilt Open School, I would like information about ${subject.title} tutoring.`,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
                    Ask on WhatsApp
                  </a>
                </Button>
              </div>
            </Reveal>
          </aside>
        </div>
      </section>

      <section className="border-t border-border/80 bg-muted/40 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl container-px">
          <div className="flex items-end justify-between gap-4">
            <div>
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-primary">
                Explore more
              </span>
              <h2 className="mt-1 font-display text-2xl font-bold text-foreground sm:text-3xl">
                Related tutoring options
              </h2>
            </div>
            <Link
              to="/tutoring"
              className="hidden items-center gap-1 text-xs font-semibold text-primary hover:underline sm:inline-flex"
            >
              Browse all tutoring <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {fallbackRelated.map((item) => (
              <TutoringCatalogCard key={item.slug} subject={item} compact />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
