import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Search, X, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { CourseCard } from "@/components/CourseCard";
import { CtaSection } from "@/components/sections/CtaSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { courses, type CourseCategory } from "@/data/courses";
import { buildMeta } from "@/lib/seo";

export const Route = createFileRoute("/courses/")({
  head: () => ({
    meta: buildMeta({
      title: "Programming & Technology Courses Catalog | TechBuilt Open School",
      description:
        "Explore 30+ live instructor-led technical courses in Web Development, Python, C++, Java, Databases, and AI/ML. One-to-one and small group batches available.",
      keywords: [
        "programming courses catalog",
        "python course online",
        "web development courses",
        "database courses sql",
        "data science courses",
        "ai ml courses",
      ],
    }),
    links: [{ rel: "canonical", href: "/courses" }],
  }),
  component: CoursesPage,
});

const CATEGORIES: Array<"All" | CourseCategory> = [
  "All",
  "Web Development",
  "Programming",
  "Computer Science",
  "Database",
  "Data & AI",
];

function CoursesPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"All" | CourseCategory>("All");

  const filteredCourses = useMemo(() => {
    const q = search.trim().toLowerCase();
    return courses.filter((c) => {
      const matchesCategory = selectedCategory === "All" || c.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!q) return true;
      const titleMatch = c.title.toLowerCase().includes(q);
      const categoryMatch = c.category.toLowerCase().includes(q);
      const summaryMatch = c.summary.toLowerCase().includes(q);
      const keywordsMatch = c.keywords.some((k) => k.toLowerCase().includes(q));

      return titleMatch || categoryMatch || summaryMatch || keywordsMatch;
    });
  }, [search, selectedCategory]);

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("All");
  };

  return (
    <>
      <PageHeader
        eyebrow="Technology Catalog"
        title="Programming & Technology Courses"
        description="Comprehensive, instructor-led technical courses designed around practical projects, clean architecture, and modern industry tools."
        breadcrumb={[{ label: "Courses" }]}
      />

      <section className="mx-auto max-w-7xl container-px py-12 sm:py-16">
        {/* Controls: Search and Category Pills */}
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-md flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search courses (e.g. Python, React, SQL, DSA)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-9"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="text-sm font-medium text-muted-foreground">
              Showing <span className="font-bold text-foreground">{filteredCourses.length}</span>{" "}
              {filteredCourses.length === 1 ? "course" : "courses"}
              {selectedCategory !== "All" && ` in ${selectedCategory}`}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "border border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              );
            })}

            {(search || selectedCategory !== "All") && (
              <button
                type="button"
                onClick={clearFilters}
                className="ml-auto text-xs font-semibold text-primary underline-offset-4 hover:underline"
              >
                Reset all filters
              </button>
            )}
          </div>
        </div>

        {/* Course Grid / Empty State */}
        {filteredCourses.length > 0 ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((c) => (
              <Reveal key={c.slug}>
                <CourseCard course={c} />
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="mt-12 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-accent text-primary">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-foreground">No courses found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              No technical courses match your current search or category filter.
            </p>
            <Button onClick={clearFilters} variant="outline" className="mt-6">
              Clear filters and view all courses
            </Button>
          </div>
        )}

        {/* Academic & Islamic Tutoring Banner */}
        <Reveal className="mt-16 rounded-2xl border border-border bg-muted/40 p-8 text-center sm:p-10">
          <div className="mx-auto max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary">
              <BookOpen className="h-3.5 w-3.5" /> Academic & Islamic Tutoring
            </span>
            <h3 className="mt-3 text-xl font-bold text-foreground sm:text-2xl">
              Looking for School Subjects or Quran Tutoring?
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              We provide dedicated 1-on-1 and small group academic tutoring in Mathematics, Physics, Chemistry, Biology, Computer Science, and Quran & Islamic Studies under our separate Tutoring service.
            </p>
            <Button asChild variant="outline" className="mt-5">
              <Link to="/tutoring">
                Explore Tutoring Services <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Reveal>
      </section>

      <CtaSection />
    </>
  );
}
