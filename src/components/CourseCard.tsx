import { CourseCatalogCard } from "@/components/catalog/CourseCatalogCard";
import type { Course } from "@/data/courses";

export function CourseCard({ course, className }: { course: Course; className?: string }) {
  return <CourseCatalogCard course={course} className={className} />;
}
