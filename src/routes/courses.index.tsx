import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Search, Sparkles } from "lucide-react";
import { CatalogHero } from "@/components/catalog/CatalogHero";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { CourseCatalogCard } from "@/components/catalog/CourseCatalogCard";
import { Reveal } from "@/components/Reveal";
import { CtaSection } from "@/components/sections/CtaSection";
import { Button } from "@/components/ui/button";
import { courses, type CourseCategory } from "@/data/courses";
import { getCmsCoursesFn } from "@/lib/cmsFunctions";
import { buildMeta, canonicalLink } from "@/lib/seo";

export const Route = createFileRoute("/courses/")({
  loader: async () => {
    try {
      const data = await getCmsCoursesFn();
      if (data && data.length > 0) return { courses: data };
    } catch {
      // Fallback handled below
    }
    return { courses };
  },
  head: () => ({
    meta: buildMeta({
      title: "Programming & Technology Courses Catalog | TechBuilt Open School",
      description:
        "Explore 32 live instructor-led technical courses in Web Development, Python, C++, Java, Databases, and AI/ML foundations. 1-on-1 instruction and small group cohorts.",
      path: "/courses",
      keywords: [
        "programming courses catalog",
        "python course online",
        "web development courses",
        "database courses sql",
        "data science courses",
        "ai ml courses",
        "computer science courses",
      ],
    }),
    links: [canonicalLink("/courses")],
  }),
  component: CoursesPage,
});

function CoursesPage() {
  const { courses: loadedCourses } = Route.useLoaderData();
  const allCourses = loadedCourses && loadedCourses.length > 0 ? loadedCourses : courses;
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"All" | CourseCategory>("All");

  const filteredCourses = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allCourses.filter((c) => {
      const matchesCategory = selectedCategory === "All" || c.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!q) return true;
      const titleMatch = c.title.toLowerCase().includes(q);
      const categoryMatch = c.category.toLowerCase().includes(q);
      const summaryMatch = c.summary.toLowerCase().includes(q);
      const keywordsMatch = c.keywords.some((k) => k.toLowerCase().includes(q));

      return titleMatch || categoryMatch || summaryMatch || keywordsMatch;
    });
  }, [allCourses, search, selectedCategory]);

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("All");
  };

  return (
    <>
      {/* A1. Premium Catalog Hero */}
      <CatalogHero
        eyebrow="TECHNICAL COURSE LIBRARY"
        title="Build Skills One Technology at a Time"
        description="Instructor-led technical courses across programming, web development, databases, computer science, data analytics and AI foundations."
        breadcrumb={[{ label: "Courses" }]}
        chips={[
          `${allCourses.length} technical courses`,
          "Live online",
          "1-on-1 available",
          "Project-driven",
        ]}
      />

      {/* A2. Anchored / Sticky Filter Bar */}
      <CatalogFilters
        search={search}
        onSearchChange={setSearch}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        totalCount={allCourses.length}
        filteredCount={filteredCourses.length}
        onClearFilters={clearFilters}
      />

      <section className="mx-auto max-w-7xl container-px py-12 sm:py-16">
        {/* A3. Course Card Grid / Empty State */}
        {filteredCourses.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((c, i) => (
              <Reveal key={c.slug} delay={Math.min((i % 6) * 60, 300)} className="h-full">
                <CourseCatalogCard course={c} />
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center shadow-soft">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-accent text-primary">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-display text-xl font-bold text-foreground">
              No courses match your query
            </h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
              We couldn&apos;t find any technical courses matching &ldquo;{search}&rdquo;
              {selectedCategory !== "All" && ` in ${selectedCategory}`}.
            </p>
            <Button onClick={clearFilters} variant="outline" className="mt-6">
              Clear filters and view all courses
            </Button>
          </div>
        )}

        {/* Scheduled Group Batches Callout */}
        <Reveal className="mt-16 rounded-3xl border border-primary/25 bg-gradient-soft p-6 sm:p-8 shadow-soft">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-mono text-xs font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5 text-gold-foreground" /> Scheduled Group Programs
              </span>
              <h3 className="mt-3 font-display text-xl font-bold text-foreground sm:text-2xl">
                Looking for scheduled group cohorts with special cohort pricing?
              </h3>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                While every catalog course is available for 1-on-1 personalized instruction, our
                active cohort programs feature live group learning, structured roadmaps, and Free
                Demo trial sessions.
              </p>
            </div>
            <Button asChild variant="hero" size="lg" className="shrink-0 font-semibold">
              <Link to="/live-batches">
                View Active Live Batches <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Reveal>

        {/* Academic & Islamic Tutoring Banner */}
        <Reveal className="mt-14 rounded-3xl border border-border/80 bg-muted/40 p-8 text-center sm:p-10 shadow-soft">
          <div className="mx-auto max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 font-mono text-xs font-semibold text-primary">
              <BookOpen className="h-3.5 w-3.5" /> Academic & Islamic Tutoring
            </span>
            <h3 className="mt-4 font-display text-2xl font-bold text-foreground sm:text-3xl">
              Looking for School Subjects or Quran Tutoring?
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              We provide dedicated 1-on-1 and small group academic tutoring in Mathematics, Physics,
              Chemistry, Biology, Computer Science, and Quran & Islamic Studies under our separate
              Tutoring service.
            </p>
            <Button asChild variant="outline" size="lg" className="mt-6 font-semibold">
              <Link to="/tutoring">
                Explore Tutoring Services <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Reveal>
      </section>

      <CtaSection />
    </>
  );
}
