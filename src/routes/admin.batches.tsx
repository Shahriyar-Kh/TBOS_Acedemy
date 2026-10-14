import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { adminNoIndexMeta } from "@/lib/seo";
import { useEffect, useState, useCallback } from "react";
import { useAdminAuth } from "@/lib/adminAuthContext";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Layers,
  Plus,
  Calendar,
  Clock,
  Video,
  Users,
  Search,
  X,
  ExternalLink,
  Loader2,
  CheckCircle2,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { liveOffers } from "@/data/liveOffers";
import { specializations } from "@/data/specializations";

export const Route = createFileRoute("/admin/batches")({
  head: () => ({ meta: adminNoIndexMeta("TBOS Batches & Cohorts") }),
  component: AdminBatchesPage,
});

function AdminBatchesPage() {
  const { admin, isLoading: authLoading, getAuthHeader } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !admin) {
      navigate({ to: "/admin/login" });
    }
  }, [admin, authLoading, navigate]);

  const [batches, setBatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [batchDetail, setBatchDetail] = useState<any | null>(null);

  // Form State
  const [form, setForm] = useState({
    name: "",
    programSlug: "100-days-complete-python",
    programTitle: "100 Days Complete Python",
    programType: "live_batch",
    mode: "group",
    instructorName: "Lead Instructor",
    startDate: new Date().toISOString().split("T")[0],
    expectedEndDate: "",
    daysOfWeek: ["Mon", "Tue", "Wed", "Thu"],
    startTime: "19:00",
    endTime: "20:30",
    timezone: "Asia/Karachi",
    maxCapacity: 20,
    meetingLink: "",
    status: "active",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBatches = useCallback(async () => {
    setIsLoading(true);
    try {
      const url = statusFilter !== "all" ? `/api/admin/batches?status=${statusFilter}` : "/api/admin/batches";
      const res = await fetch(url, { headers: getAuthHeader() });
      if (res.ok) {
        const data = await res.json();
        setBatches(data.batches || []);
      }
    } catch {
      toast.error("Failed to load batches");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, getAuthHeader]);

  useEffect(() => {
    if (admin) fetchBatches();
  }, [admin, fetchBatches]);

  const loadBatchDetail = async (id: string) => {
    setSelectedBatchId(id);
    try {
      const res = await fetch(`/api/admin/batches/${id}`, {
        headers: getAuthHeader(),
      });
      if (res.ok) {
        const data = await res.json();
        setBatchDetail(data.batch);
      }
    } catch {
      toast.error("Failed to load cohort details");
    }
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.ok) {
        toast.success(`Batch "${data.batch?.name}" created successfully!`);
        setShowCreateModal(false);
        fetchBatches();
      } else {
        toast.error(data.error || "Failed to create batch");
      }
    } catch {
      toast.error("Network error while creating batch");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProgramSelect = (slug: string) => {
    const offer = liveOffers.find((o) => o.slug === slug);
    if (offer) {
      setForm((prev) => ({
        ...prev,
        programSlug: offer.slug,
        programTitle: offer.title,
        programType: "live_batch",
        name: `${offer.title} - ${new Date().toLocaleString("default", { month: "short", year: "numeric" })} Cohort`,
      }));
      return;
    }

    const spec = specializations.find((s) => s.slug === slug);
    if (spec) {
      setForm((prev) => ({
        ...prev,
        programSlug: spec.slug,
        programTitle: spec.title,
        programType: "specialization",
        name: `${spec.title} - Cohort`,
      }));
    }
  };

  return (
    <AdminLayout
      title="Batches & Cohort Management"
      description="Manage live student batches, track maximum student capacity, timing, and meeting links."
      onRefresh={fetchBatches}
      isRefreshing={isLoading}
      actions={
        <Button
          size="sm"
          onClick={() => setShowCreateModal(true)}
          className="bg-[#008DDA] hover:bg-[#0070b8] text-white gap-1.5 text-xs"
        >
          <Plus className="h-3.5 w-3.5" /> Create Cohort / Batch
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Batches Grid */}
        {isLoading ? (
          <div className="py-16 text-center text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#008DDA] mb-2" />
            Loading live cohorts...
          </div>
        ) : batches.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center bg-white">
            <Layers className="h-10 w-10 text-slate-400 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-sm">No Batches Configured Yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Create your first student cohort to organize schedules, track capacity, and manage class sessions.
            </p>
            <Button
              size="sm"
              onClick={() => setShowCreateModal(true)}
              className="mt-4 bg-[#008DDA] text-white text-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Create First Batch
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {batches.map((batch) => {
              const enrolledCount = batch.enrollments?.length || batch.active_student_count || 0;
              const maxCap = batch.max_capacity || 20;
              const percent = Math.min(100, Math.round((enrolledCount / maxCap) * 100));

              return (
                <div
                  key={batch.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Badge
                        variant={batch.status === "active" ? "default" : "secondary"}
                        className={`text-[10px] uppercase font-mono ${
                          batch.status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : ""
                        }`}
                      >
                        {batch.status}
                      </Badge>
                      <span className="text-[11px] font-mono text-slate-500">{batch.mode?.toUpperCase()}</span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 leading-snug">{batch.name}</h3>
                    <div className="text-xs text-[#008DDA] font-medium mt-0.5">{batch.program_title}</div>

                    {/* Schedule info */}
                    <div className="mt-4 text-xs text-slate-600 space-y-1.5 border-t border-slate-100 pt-3">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>
                          {batch.start_time || "TBD"} - {batch.end_time || "TBD"} ({batch.timezone})
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{batch.days_of_week?.join(", ") || "Flexible"}</span>
                      </div>
                      {batch.instructor_name && (
                        <div className="text-[11px] text-slate-500">Instructor: {batch.instructor_name}</div>
                      )}
                    </div>

                    {/* Capacity Indicator */}
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-slate-500">Capacity:</span>
                        <span className="font-bold text-slate-900 font-mono">
                          {enrolledCount} / {maxCap} students ({percent}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            percent >= 90 ? "bg-rose-500" : percent >= 60 ? "bg-amber-500" : "bg-[#008DDA]"
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    {batch.meeting_link ? (
                      <Button asChild variant="outline" size="sm" className="text-[11px] h-7 gap-1">
                        <a href={batch.meeting_link} target="_blank" rel="noreferrer">
                          <Video className="h-3.5 w-3.5 text-blue-600" /> Meeting Link
                        </a>
                      </Button>
                    ) : (
                      <span className="text-[11px] text-slate-400">No link set</span>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => loadBatchDetail(batch.id)}
                      className="text-[11px] h-7 text-[#008DDA]"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" /> View Cohort
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Batch Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Create New Cohort / Batch</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="mt-4 space-y-3.5 text-xs">
              <div>
                <Label className="text-xs font-semibold">Related Program</Label>
                <select
                  value={form.programSlug}
                  onChange={(e) => handleProgramSelect(e.target.value)}
                  className="mt-1 w-full h-9 rounded-md border border-slate-200 px-3 text-xs"
                >
                  <optgroup label="Live Batches">
                    {liveOffers.map((o) => (
                      <option key={o.slug} value={o.slug}>
                        {o.title}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Specializations">
                    {specializations.map((s) => (
                      <option key={s.slug} value={s.slug}>
                        {s.title}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold">Cohort / Batch Name *</Label>
                <Input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. 100 Days Python - Morning Cohort"
                  className="mt-1 h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold">Instructor Name</Label>
                  <Input
                    value={form.instructorName}
                    onChange={(e) => setForm({ ...form, instructorName: e.target.value })}
                    className="mt-1 h-9 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Max Capacity (Students)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={form.maxCapacity}
                    onChange={(e) => setForm({ ...form, maxCapacity: Number(e.target.value) })}
                    className="mt-1 h-9 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold">Class Start Time (HH:mm)</Label>
                  <Input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="mt-1 h-9 text-xs font-mono"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Class End Time (HH:mm)</Label>
                  <Input
                    type="time"
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className="mt-1 h-9 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold">Meeting Link (Google Meet / Zoom)</Label>
                <Input
                  value={form.meetingLink}
                  onChange={(e) => setForm({ ...form, meetingLink: e.target.value })}
                  placeholder="https://meet.google.com/..."
                  className="mt-1 h-9 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} size="sm" className="bg-[#008DDA] text-white">
                  {isSubmitting ? "Creating..." : "Save Cohort"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cohort Detail Modal */}
      {selectedBatchId && batchDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">{batchDetail.name}</h3>
                <span className="text-xs text-[#008DDA]">{batchDetail.program_title}</span>
              </div>
              <button onClick={() => setSelectedBatchId(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="rounded-lg bg-slate-50 p-3 border border-slate-200 grid grid-cols-2 gap-2 text-slate-700">
                <div>Instructor: <strong>{batchDetail.instructor_name || "Assigned"}</strong></div>
                <div>Enrolled: <strong>{batchDetail.enrollments?.length || 0} students</strong></div>
                <div>Timing: <strong>{batchDetail.start_time} - {batchDetail.end_time}</strong></div>
                <div>Days: <strong>{batchDetail.days_of_week?.join(", ")}</strong></div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-2">Enrolled Students in this Cohort</h4>
                {batchDetail.enrollments?.length === 0 ? (
                  <div className="text-slate-400 text-center py-4">No students enrolled in this batch yet.</div>
                ) : (
                  <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                    {batchDetail.enrollments.map((enr: any) => (
                      <div key={enr.id} className="p-2.5 flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-slate-900">{enr.students?.full_name}</span>
                          <span className="text-[11px] text-slate-400 ml-2 font-mono">({enr.students?.student_id})</span>
                        </div>
                        <Badge variant="outline" className="text-[10px] uppercase font-mono">
                          {enr.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedBatchId(null)}>
                  Close
                </Button>
                <Button asChild size="sm" className="bg-[#008DDA] text-white">
                  <Link to="/admin/timetable">Schedule Class for Batch</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

