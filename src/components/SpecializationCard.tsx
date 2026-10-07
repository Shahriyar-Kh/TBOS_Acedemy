import { SpecializationCatalogCard } from "@/components/catalog/SpecializationCatalogCard";
import type { Specialization } from "@/data/specializations";

export function SpecializationCard({
  spec,
  className,
}: {
  spec: Specialization;
  className?: string;
}) {
  return <SpecializationCatalogCard spec={spec} className={className} />;
}
