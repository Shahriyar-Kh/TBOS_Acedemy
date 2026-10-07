import { Search, X, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { CourseCategory } from "@/data/courses";
import { cn } from "@/lib/utils";

export const COURSE_CATEGORIES: Array<"All" | CourseCategory> = [
  "All",
  "Web Development",
  "Programming",
  "Computer Science",
  "Database",
  "Data & AI",
];

export function CatalogFilters({
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  totalCount,
  filteredCount,
  onClearFilters,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  selectedCategory: "All" | CourseCategory;
  onCategoryChange: (cat: "All" | CourseCategory) => void;
  totalCount: number;
  filteredCount: number;
  onClearFilters: () => void;
}) {
  const isFiltered = search.trim().length > 0 || selectedCategory !== "All";

  return (
    <div className="sticky top-16 z-20 border-b border-border/80 bg-background/95 backdrop-blur-md py-4 sm:py-5 shadow-xs transition-all">
      <div className="mx-auto max-w-7xl container-px space-y-4">
        {/* Top bar: Search input + Live result counter */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="text"
              role="searchbox"
              aria-label="Search courses"
              placeholder="Search by technology, topic, or keyword (e.g. Python, React, SQL)..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-10 pl-10 pr-9 text-xs sm:text-sm bg-card/80 border-border/80 focus-visible:ring-cyan"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                aria-label="Clear search text"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 text-xs font-medium text-muted-foreground">
            <span>
              Showing <strong className="font-bold text-foreground">{filteredCount}</strong> of{" "}
              {totalCount} courses
              {selectedCategory !== "All" && (
                <span className="hidden md:inline"> in {selectedCategory}</span>
              )}
            </span>

            {isFiltered && (
              <button
                type="button"
                onClick={onClearFilters}
                className="inline-flex items-center gap-1 font-semibold text-primary underline-offset-4 hover:underline"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Pills Navigation */}
        <nav
          aria-label="Filter courses by category"
          className="flex flex-wrap items-center gap-2 pt-1"
        >
          {COURSE_CATEGORIES.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onCategoryChange(cat)}
                aria-pressed={active}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/40"
                    : "border border-border/80 bg-card text-muted-foreground hover:border-cyan/50 hover:text-foreground",
                )}
              >
                {cat}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
