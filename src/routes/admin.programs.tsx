import { createFileRoute, Link } from "@tanstack/react-router";
import { adminNoIndexMeta } from "@/lib/seo";
import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { liveOffers } from "@/data/liveOffers";
import { specializations, getSpecializationMonthlyFee } from "@/data/specializations";
import { courses } from "@/data/courses";
import { tutoringSubjects } from "@/data/tutoring";
import {
  GraduationCap,
  Layers,
  Clock,
  DollarSign,
  Plus,
  ExternalLink,
} from "lucide-react";

export const Route = createFileRoute("/admin/programs")({
  head: () => ({ meta: adminNoIndexMeta("TBOS Academy Programs") }),
  component: AdminProgramsPage,
});

function AdminProgramsPage() {
  const [activeTab, setActiveTab] = useState<"live" | "specializations" | "courses" | "tutoring">("live");

  return (
    <AdminLayout
      title="Academic Programs Catalog"
      description="Canonical programs, live cohorts, specialization tracks, single courses, and private tutoring."
      actions={
        <Button asChild size="sm" className="bg-[#008DDA] hover:bg-[#0070b8] text-white gap-1.5 text-xs">
          <Link to="/admin/batches">
            <Plus className="h-3.5 w-3.5" /> Create Cohort / Batch
          </Link>
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Category Tabs */}
        <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("live")}
            className={`py-3.5 px-4 border-b-2 transition-colors ${
              activeTab === "live" ? "border-[#008DDA] text-[#008DDA]" : "border-transparent text-slate-500"
            }`}
          >
            Live Batches ({liveOffers.length})
          </button>
          <button
            onClick={() => setActiveTab("specializations")}
            className={`py-3.5 px-4 border-b-2 transition-colors ${
              activeTab === "specializations" ? "border-[#008DDA] text-[#008DDA]" : "border-transparent text-slate-500"
            }`}
          >
            Specializations ({specializations.length})
          </button>
          <button
            onClick={() => setActiveTab("courses")}
            className={`py-3.5 px-4 border-b-2 transition-colors ${
              activeTab === "courses" ? "border-[#008DDA] text-[#008DDA]" : "border-transparent text-slate-500"
            }`}
          >
            Single Courses ({courses.length})
          </button>
          <button
            onClick={() => setActiveTab("tutoring")}
            className={`py-3.5 px-4 border-b-2 transition-colors ${
              activeTab === "tutoring" ? "border-[#008DDA] text-[#008DDA]" : "border-transparent text-slate-500"
            }`}
          >
            1-to-1 Tutoring ({tutoringSubjects.length})
          </button>
        </div>

        {/* Live Cohorts Tab */}
        {activeTab === "live" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveOffers.map((offer) => (
              <div key={offer.slug} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow transition-shadow flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-[10px] uppercase font-mono bg-blue-50 text-blue-700">
                      Live Cohort
                    </Badge>
                    <span className="text-xs font-bold font-mono text-emerald-600">
                      PKR {typeof offer.offerFee === "number" ? offer.offerFee.toLocaleString() : offer.offerFee}/month
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">{offer.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{offer.shortTitle || offer.audience}</p>
                  <div className="mt-4 text-[11px] text-slate-600 space-y-1">
                    <div>Duration: {offer.duration}</div>
                    <div>Schedule: {offer.classesPerWeek || "4 classes/week"}</div>
                  </div>
                </div>
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <Button asChild variant="outline" size="sm" className="text-[11px] h-7">
                    <a href={`/live-batches/${offer.slug}`} target="_blank" rel="noreferrer" className="flex items-center gap-1">
                      View Page <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                  <Button asChild size="sm" className="bg-[#008DDA] text-white text-[11px] h-7">
                    <Link to="/admin/batches">Create Batch</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Specializations Tab */}
        {activeTab === "specializations" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {specializations.map((spec) => {
              const specFee = getSpecializationMonthlyFee(spec.slug).toLocaleString();
              return (
                <div key={spec.slug} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow transition-shadow flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-[10px] uppercase font-mono bg-purple-50 text-purple-700">
                        Specialization
                      </Badge>
                      <span className="text-xs font-bold font-mono text-emerald-600">
                        PKR {specFee}/month
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900">{spec.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{spec.description}</p>
                    <div className="mt-4 text-[11px] text-slate-600 space-y-1">
                      <div>Duration: {spec.duration}</div>
                      <div>Modules included: {spec.modules?.length || 0}</div>
                    </div>
                  </div>
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <Button asChild variant="outline" size="sm" className="text-[11px] h-7">
                      <a href={`/specializations/${spec.slug}`} target="_blank" rel="noreferrer" className="flex items-center gap-1">
                        View Page <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                    <Button asChild size="sm" className="bg-[#008DDA] text-white text-[11px] h-7">
                      <Link to="/admin/batches">Create Batch</Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Single Courses Tab */}
        {activeTab === "courses" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {courses.map((course) => (
              <div key={course.slug} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow transition-shadow flex flex-col justify-between">
                <div>
                  <Badge variant="outline" className="text-[10px] uppercase font-mono bg-cyan-50 text-cyan-700 mb-2">
                    Course
                  </Badge>
                  <h3 className="font-bold text-xs text-slate-900">{course.title}</h3>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{course.description}</p>
                  <div className="mt-3 text-[10px] text-slate-400 font-mono">
                    {course.duration || "Self-paced + Live"}
                  </div>
                </div>
                <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <Button asChild variant="ghost" size="sm" className="text-[10px] h-6 px-1.5">
                    <a href={`/courses/${course.slug}`} target="_blank" rel="noreferrer">
                      View Course
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tutoring Tab */}
        {activeTab === "tutoring" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tutoringSubjects.map((sub) => (
              <div key={sub.slug} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow transition-shadow flex flex-col justify-between">
                <div>
                  <Badge variant="outline" className="text-[10px] uppercase font-mono bg-emerald-50 text-emerald-700 mb-2">
                    1-to-1 Tutoring
                  </Badge>
                  <h3 className="font-bold text-xs text-slate-900">{sub.title}</h3>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{sub.summary}</p>
                </div>
                <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <Button asChild variant="outline" size="sm" className="text-[11px] h-7">
                    <a href={`/tutoring/${sub.slug}`} target="_blank" rel="noreferrer">
                      Public Page
                    </a>
                  </Button>
                  <Button asChild size="sm" className="bg-[#008DDA] text-white text-[11px] h-7">
                    <Link to="/admin/batches">Assign Tutor</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

