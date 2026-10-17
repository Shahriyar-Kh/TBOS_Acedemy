import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { adminNoIndexMeta } from "@/lib/seo";
import { useEffect, useState, useCallback } from "react";
import { useAdminAuth } from "@/lib/adminAuthContext";
import { CRM_STATUS_OPTIONS, type CrmStatus, getFollowUpStatus } from "@/lib/adminCrm";
import type {
  AdmissionsRequestRecord,
  AdmissionsActivityRecord,
  AdmissionsDeliveryLogRecord,
} from "@/lib/supabase.server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  LogOut,
  Calendar,
  Clock,
  ExternalLink,
  MessageCircle,
  Mail,
  UserCheck,
  Video,
  FileText,
  AlertTriangle,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  History,
  Info,
  Trash2,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { getSpecializationMonthlyFee } from "@/data/specializations";

export const Route = createFileRoute("/admin/admissions")({
  head: () => ({ meta: adminNoIndexMeta("TBOS Admissions Admin") }),
  component: AdminAdmissionsPage,
});

interface Stats {
  total: number;
  newRequests: number;
  demoRequests: number;
  scheduledDemos: number;
  enrolled: number;
  followUpsDue: number;
}

function AdminAdmissionsPage() {
  const { admin, isLoading: authLoading, logout, getAuthHeader } = useAdminAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !admin) {
      navigate({ to: "/admin/login" });
    }
  }, [admin, authLoading, navigate]);

  // Data states
  const [admissions, setAdmissions] = useState<AdmissionsRequestRecord[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    newRequests: 0,
    demoRequests: 0,
    scheduledDemos: 0,
    enrolled: 0,
    followUpsDue: 0,
  });
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [kindFilter, setKindFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 20;

  // Selected admission for detail drawer
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<AdmissionsRequestRecord | null>(null);
  const [activities, setActivities] = useState<AdmissionsActivityRecord[]>([]);
  const [deliveryLogs, setDeliveryLogs] = useState<AdmissionsDeliveryLogRecord[]>([]);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRetryingDelivery, setIsRetryingDelivery] = useState(false);

  // Editable CRM form fields in detail drawer
  const [editStatus, setEditStatus] = useState<CrmStatus>("new");
  const [editAdminNotes, setEditAdminNotes] = useState("");
  const [editFollowUp, setEditFollowUp] = useState("");
  const [editDemoScheduled, setEditDemoScheduled] = useState("");
  const [editDemoLink, setEditDemoLink] = useState("");
  const [editClosedReason, setEditClosedReason] = useState("");

  // Convert Lead to Student Modal State
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [availableBatches, setAvailableBatches] = useState<any[]>([]);
  const [convertBatchId, setConvertBatchId] = useState("");
  const [convertMonthlyFee, setConvertMonthlyFee] = useState(20000);
  const [convertBillingDay, setConvertBillingDay] = useState(1);
  const [isConverting, setIsConverting] = useState(false);
  const [convertMode, setConvertMode] = useState<"new_student" | "link_existing">("new_student");
  const [existingStudentsList, setExistingStudentsList] = useState<any[]>([]);
  const [selectedExistingStudentId, setSelectedExistingStudentId] = useState("");
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  // Schedule Demo Modal state
  const [showScheduleDemoModal, setShowScheduleDemoModal] = useState(false);
  const [instructorsList, setInstructorsList] = useState<any[]>([]);
  const [demoForm, setDemoForm] = useState({
    instructorId: "",
    instructorName: "",
    sessionDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    startTime: "18:00",
    endTime: "19:00",
    title: "",
    meetingLink: "",
  });
  const [isSchedulingDemo, setIsSchedulingDemo] = useState(false);

  // Demo Outcome Modal state
  const [showOutcomeModal, setShowOutcomeModal] = useState(false);
  const [outcomeForm, setOutcomeForm] = useState({
    outcome: "completed" as "completed" | "no_show" | "cancelled" | "rescheduled",
    notes: "",
  });
  const [isSubmittingOutcome, setIsSubmittingOutcome] = useState(false);

  const fetchBatchesForConvert = async () => {
    try {
      const res = await fetch("/api/admin/batches?limit=100", { headers: getAuthHeader() });
      if (res.ok) {
        const data = await res.json();
        setAvailableBatches(data.batches || []);
        if (data.batches?.length > 0 && !convertBatchId) {
          setConvertBatchId(data.batches[0].id);
        }
      }
    } catch {
      // ignore
    }
  };

  const fetchStudentsForLink = async () => {
    setIsLoadingStudents(true);
    try {
      const res = await fetch("/api/admin/students?limit=100", { headers: getAuthHeader() });
      if (res.ok) {
        const data = await res.json();
        setExistingStudentsList(data.students || []);
        if (data.students?.length > 0 && !selectedExistingStudentId) {
          setSelectedExistingStudentId(data.students[0].id);
        }
      }
    } catch {
      // ignore
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const fetchInstructors = async () => {
    try {
      const res = await fetch("/api/admin/users", { headers: getAuthHeader() });
      if (res.ok) {
        const data = await res.json();
        setInstructorsList(data.users || []);
        if (data.users?.length > 0 && !demoForm.instructorId) {
          setDemoForm((prev) => ({
            ...prev,
            instructorId: data.users[0].id,
            instructorName: data.users[0].full_name || data.users[0].email,
          }));
        }
      }
    } catch {
      // ignore
    }
  };

  const handleOpenScheduleDemoModal = () => {
    if (!detailData) return;
    setDemoForm({
      instructorId: instructorsList[0]?.id || "",
      instructorName: instructorsList[0]?.full_name || instructorsList[0]?.email || "Assigned Faculty",
      sessionDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      startTime: "18:00",
      endTime: "19:00",
      title: `TBOS Demo: ${detailData.student_name} - ${detailData.selected_program_title}`,
      meetingLink: detailData.demo_meeting_link || "",
    });
    fetchInstructors();
    setShowScheduleDemoModal(true);
  };

  const handleScheduleDemo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    setIsSchedulingDemo(true);
    try {
      const res = await fetch(`/api/admin/admissions/${selectedId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({
          action: "schedule-demo",
          instructorId: demoForm.instructorId || null,
          instructorName: demoForm.instructorName || null,
          sessionDate: demoForm.sessionDate,
          startTime: demoForm.startTime,
          endTime: demoForm.endTime,
          title: demoForm.title.trim(),
          meetingLink: demoForm.meetingLink.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && (data.ok || data.success)) {
        toast.success("Demo class session scheduled & reminders queued!");
        setShowScheduleDemoModal(false);
        loadDetail(selectedId);
        fetchAdmissions();
      } else {
        toast.error(data.error || "Failed to schedule demo");
      }
    } catch {
      toast.error("Network error scheduling demo");
    } finally {
      setIsSchedulingDemo(false);
    }
  };

  const handleOpenOutcomeModal = (outcome: "completed" | "no_show" | "cancelled" | "rescheduled") => {
    setOutcomeForm({
      outcome,
      notes: "",
    });
    setShowOutcomeModal(true);
  };

  const handleSaveDemoOutcome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    setIsSubmittingOutcome(true);
    try {
      const res = await fetch(`/api/admin/admissions/${selectedId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({
          action: "update-demo-outcome",
          outcome: outcomeForm.outcome,
          notes: outcomeForm.notes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && (data.ok || data.success)) {
        toast.success(`Demo outcome recorded as ${outcomeForm.outcome}`);
        setShowOutcomeModal(false);
        loadDetail(selectedId);
        fetchAdmissions();
      } else {
        toast.error(data.error || "Failed to record outcome");
      }
    } catch {
      toast.error("Network error saving demo outcome");
    } finally {
      setIsSubmittingOutcome(false);
    }
  };

  const handleConvertToStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    setIsConverting(true);
    try {
      const payload: Record<string, any> = {
        action: "convert-to-student",
        batchId: convertBatchId || undefined,
        billingDay: Number(convertBillingDay),
      };

      if (convertMode === "link_existing") {
        if (!selectedExistingStudentId) {
          toast.error("Please select an existing student record to link.");
          setIsConverting(false);
          return;
        }
        payload.existingStudentId = selectedExistingStudentId;
        payload.agreedFee = Number(convertMonthlyFee);
        payload.programSlug = detailData?.selected_program_slug || "specialization-course";
        payload.programTitle = detailData?.selected_program_title || "Enrolled Program";
        payload.mode = "group";
      } else {
        payload.monthlyFee = Number(convertMonthlyFee);
      }

      const res = await fetch(`/api/admin/admissions/${selectedId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        toast.success(
          convertMode === "link_existing"
            ? `Successfully linked lead to student and enrolled in program!`
            : `Converted to student ${data.student?.student_id || ""}! Initial invoice generated.`
        );
        setShowConvertModal(false);
        setSelectedId(null);
        fetchAdmissions();
      } else {
        toast.error(data.error || "Failed to convert lead to student");
      }
    } catch {
      toast.error("Network error during student conversion");
    } finally {
      setIsConverting(false);
    }
  };

  const fetchAdmissions = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (kindFilter !== "all") params.set("kind", kindFilter);
      if (typeFilter !== "all") params.set("type", typeFilter);
      params.set("page", page.toString());
      params.set("limit", limit.toString());

      const res = await fetch(`/api/admin/admissions?${params.toString()}`, {
        headers: getAuthHeader(),
      });

      if (res.status === 401 || res.status === 403) {
        toast.error("Session expired or unauthorized. Please sign in again.");
        logout();
        navigate({ to: "/admin/login" });
        return;
      }

      const json = await res.json();
      if (json.ok) {
        setAdmissions(json.data || []);
        setTotalCount(json.total || 0);
        if (json.stats) {
          setStats(json.stats);
        }
      } else {
        toast.error(json.error || "Failed to load admissions.");
      }
    } catch (err) {
      console.error("Fetch admissions error:", err);
      toast.error("Network error while loading admissions.");
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, kindFilter, typeFilter, page, getAuthHeader, logout, navigate]);

  useEffect(() => {
    if (admin) {
      fetchAdmissions();
    }
  }, [fetchAdmissions, admin]);

  // Load single admission detail
  const loadDetail = async (id: string) => {
    setSelectedId(id);
    setIsDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/admissions/${id}`, {
        headers: getAuthHeader(),
      });
      const json = await res.json();
      if (json.ok && json.admission) {
        setDetailData(json.admission);
        setActivities(json.activities || []);
        setDeliveryLogs(json.deliveryLogs || []);
        setEditStatus((json.admission.status as CrmStatus) || "new");
        setEditAdminNotes(json.admission.admin_notes || "");
        setEditFollowUp(
          json.admission.next_follow_up_at ? json.admission.next_follow_up_at.slice(0, 16) : "",
        );
        setEditDemoScheduled(
          json.admission.demo_scheduled_at ? json.admission.demo_scheduled_at.slice(0, 16) : "",
        );
        setEditDemoLink(json.admission.demo_meeting_link || "");
        setEditClosedReason(json.admission.closed_reason || "");
      } else {
        toast.error(json.error || "Failed to load record details.");
      }
    } catch {
      toast.error("Network error while loading record details.");
    } finally {
      setIsDetailLoading(false);
    }
  };

  // Save CRM changes
  const handleSaveCrm = async () => {
    if (!selectedId) return;
    setIsSaving(true);
    try {
      const patchPayload = {
        status: editStatus,
        adminNotes: editAdminNotes.trim(),
        nextFollowUpAt: editFollowUp ? new Date(editFollowUp).toISOString() : null,
        demoScheduledAt: editDemoScheduled ? new Date(editDemoScheduled).toISOString() : null,
        demoMeetingLink: editDemoLink.trim() || null,
        closedReason: editStatus === "closed" ? editClosedReason.trim() : null,
      };

      const res = await fetch(`/api/admin/admissions/${selectedId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify(patchPayload),
      });

      const json = await res.json();
      if (json.ok && json.admission) {
        toast.success("Admissions record updated successfully.");
        setDetailData(json.admission);
        // Refresh activity logs
        loadDetail(selectedId);
        // Refresh main list
        fetchAdmissions();
      } else {
        toast.error(json.error || "Failed to update record.");
      }
    } catch {
      toast.error("Network error while saving changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAdmission = async () => {
    if (!selectedId || !detailData?.id) return;
    if (!(admin?.role === "owner" || admin?.role === "admin")) {
      toast.error("Only owner/admin roles can permanently delete admissions records.");
      return;
    }

    const confirmed = window.confirm(
      `Permanently delete ${detailData.student_name}'s record for "${detailData.selected_program_title}"? This cannot be undone.`,
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/admissions/${selectedId}`, {
        method: "DELETE",
        headers: getAuthHeader(),
      });
      const json = await res.json();

      if (json.ok) {
        toast.success("Admissions record permanently deleted.");
        setSelectedId(null);
        setDetailData(null);
        setActivities([]);
        setDeliveryLogs([]);
        await fetchAdmissions();
      } else {
        toast.error(json.error || "Failed to delete admissions record.");
      }
    } catch {
      toast.error("Network error while deleting record.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRetryDeliveries = async () => {
    if (!selectedId || isRetryingDelivery) return;
    setIsRetryingDelivery(true);
    try {
      const res = await fetch(`/api/admin/admissions/${selectedId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({ action: "retry-delivery" }),
      });
      const json = await res.json();
      if (json.ok) {
        toast.success(
          json.retriedChannels && json.retriedChannels.length > 0
            ? `Retried deliveries: ${json.retriedChannels.join(", ")}`
            : "All delivery channels were already sent successfully.",
        );
        await loadDetail(selectedId);
      } else {
        toast.error(json.error || "Delivery retry failed.");
      }
    } catch {
      toast.error("Network error while retrying deliveries.");
    } finally {
      setIsRetryingDelivery(false);
    }
  };

  const handleMarkContacted = async () => {
    if (!selectedId) return;
    setIsSaving(true);
    try {
      const nowIso = new Date().toISOString();
      const patchPayload: Record<string, unknown> = {
        lastContactedAt: nowIso,
      };
      if (editStatus === "new") {
        patchPayload.status = "contacted";
        setEditStatus("contacted");
      }

      const res = await fetch(`/api/admin/admissions/${selectedId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify(patchPayload),
      });

      const json = await res.json();
      if (json.ok) {
        toast.success("Contact timestamp recorded.");
        loadDetail(selectedId);
        fetchAdmissions();
      }
    } catch {
      toast.error("Failed to record contact timestamp.");
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = (statusName?: string) => {
    const found = CRM_STATUS_OPTIONS.find((s) => s.value === statusName);
    if (!found) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
          {statusName || "Unknown"}
        </span>
      );
    }
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${found.color}`}
      >
        {found.label}
      </span>
    );
  };

  const formatCleanPhoneForWhatsApp = (phoneStr: string) => {
    const digits = phoneStr.replace(/[^0-9]/g, "");
    return digits;
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070F2B]">
        <Loader2 className="h-8 w-8 animate-spin text-[#008DDA]" />
      </div>
    );
  }

  return (
    <AdminLayout
      title="Admissions CRM & Inbound Pipeline"
      description="Review admissions inquiries, trial requests, lead progression, and convert leads to enrolled students."
      onRefresh={fetchAdmissions}
      isRefreshing={isLoading}
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchAdmissions()}
          disabled={isLoading}
          className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh Leads
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Real Stats Ribbon */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <div className="rounded-xl border border-blue-100 bg-white p-4 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center justify-between text-xs font-medium text-blue-600">
              <span>New Requests</span>
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">{stats.newRequests}</div>
            <div className="mt-1 text-[11px] text-slate-500">Unreviewed submissions</div>
          </div>

          <div className="rounded-xl border border-purple-100 bg-white p-4 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center justify-between text-xs font-medium text-purple-600">
              <span>Demo Requests</span>
              <Video className="h-4 w-4 text-purple-400" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">{stats.demoRequests}</div>
            <div className="mt-1 text-[11px] text-slate-500">Free demo trial requests</div>
          </div>

          <div className="rounded-xl border border-cyan-100 bg-white p-4 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center justify-between text-xs font-medium text-cyan-700">
              <span>Scheduled Demos</span>
              <Calendar className="h-4 w-4 text-cyan-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">{stats.scheduledDemos}</div>
            <div className="mt-1 text-[11px] text-slate-500">Upcoming trial classes</div>
          </div>

          <div className="rounded-xl border border-emerald-100 bg-white p-4 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center justify-between text-xs font-medium text-emerald-600">
              <span>Enrolled</span>
              <UserCheck className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">{stats.enrolled}</div>
            <div className="mt-1 text-[11px] text-slate-500">Paid cohort & 1-on-1 students</div>
          </div>

          <div className="rounded-xl border border-amber-100 bg-white p-4 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center justify-between text-xs font-medium text-amber-700">
              <span>Follow-ups Due</span>
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">{stats.followUpsDue}</div>
            <div className="mt-1 text-[11px] text-slate-500">Overdue or due today</div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-12 items-center">
            {/* Search Input */}
            <div className="relative md:col-span-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search student, email, phone, or course..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setPage(1);
                    fetchAdmissions();
                  }
                }}
                className="pl-9 h-9 text-xs"
              />
            </div>

            {/* Status Filter */}
            <div className="md:col-span-3">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="all">All Statuses</option>
                {CRM_STATUS_OPTIONS.map((st) => (
                  <option key={st.value} value={st.value}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Submission Kind Filter */}
            <div className="md:col-span-2">
              <select
                value={kindFilter}
                onChange={(e) => {
                  setKindFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="all">All Inquiries</option>
                <option value="application">Applications Only</option>
                <option value="demo">Demo Trials Only</option>
              </select>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 md:col-span-3 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setKindFilter("all");
                  setTypeFilter("all");
                  setPage(1);
                }}
                className="h-9 text-xs text-slate-600"
              >
                Reset
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setPage(1);
                  fetchAdmissions();
                }}
                className="h-9 text-xs bg-[#0B192C] hover:bg-[#1E3E62] text-white"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Admissions Table / List */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-3">
            <span className="text-xs font-semibold text-slate-700">
              Admissions Records ({totalCount} total)
            </span>
            {isLoading && (
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Loading...
              </span>
            )}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Program</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Phone / WhatsApp</th>
                  <th className="py-3 px-4">Follow-up</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {admissions.length === 0 && !isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No admissions requests found matching current filters.
                    </td>
                  </tr>
                ) : (
                  admissions.map((item) => {
                    const followUpInfo = getFollowUpStatus(item.next_follow_up_at);
                    const whatsappNum = formatCleanPhoneForWhatsApp(item.phone);

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                        onClick={() => item.id && loadDetail(item.id)}
                      >
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{item.student_name}</div>
                          <div className="text-[11px] text-slate-500">{item.email}</div>
                          {item.age && (
                            <div className="text-[10px] text-slate-400">
                              Age: {item.age} • {item.country}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4 max-w-xs truncate">
                          <div
                            className="font-medium text-slate-900 truncate"
                            title={item.selected_program_title}
                          >
                            {item.selected_program_title}
                          </div>
                          {item.selected_program_category && (
                            <span className="text-[10px] text-slate-500">
                              {item.selected_program_category}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <Badge variant="outline" className="text-[10px] font-normal">
                            {item.submission_kind === "demo" ? "Free Demo" : "Application"}
                          </Badge>
                        </td>

                        <td className="py-3 px-4">{getStatusBadge(item.status)}</td>

                        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs">{item.phone}</span>
                            {whatsappNum && (
                              <a
                                href={`https://wa.me/${whatsappNum}?text=${encodeURIComponent(
                                  `Hi ${item.student_name}, this is TechBuilt Open School regarding your inquiry for ${item.selected_program_title}.`,
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                                title="Open WhatsApp chat"
                              >
                                <MessageCircle className="h-3.5 w-3.5" />
                              </a>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          {item.next_follow_up_at ? (
                            <div>
                              <span
                                className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold border ${followUpInfo.badgeClass}`}
                              >
                                {followUpInfo.label}
                              </span>
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                {new Date(item.next_follow_up_at).toLocaleDateString()}
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px]">—</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                          {item.created_at ? new Date(item.created_at).toLocaleDateString() : "—"}
                        </td>

                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => item.id && loadDetail(item.id)}
                            className="h-7 text-xs px-2.5 bg-white hover:bg-slate-100 text-slate-700"
                          >
                            Manage
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards List */}
          <div className="divide-y divide-slate-100 md:hidden">
            {admissions.length === 0 && !isLoading ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No admissions records found.
              </div>
            ) : (
              admissions.map((item) => {
                const whatsappNum = formatCleanPhoneForWhatsApp(item.phone);
                return (
                  <div
                    key={item.id}
                    className="p-4 space-y-2 hover:bg-slate-50/50 cursor-pointer"
                    onClick={() => item.id && loadDetail(item.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-slate-900 text-sm">
                          {item.student_name}
                        </div>
                        <div className="text-xs text-slate-500">{item.email}</div>
                      </div>
                      {getStatusBadge(item.status)}
                    </div>

                    <div className="text-xs text-slate-700 font-medium">
                      {item.selected_program_title}
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                      <span className="text-slate-400">
                        {item.country} • {item.submission_kind}
                      </span>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        {whatsappNum && (
                          <a
                            href={`https://wa.me/${whatsappNum}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-emerald-600 font-medium"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            WhatsApp
                          </a>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => item.id && loadDetail(item.id)}
                          className="h-7 text-xs text-blue-600 font-medium px-2"
                        >
                          Manage →
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination bar */}
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 bg-slate-50/50 text-xs">
            <span className="text-slate-500">
              Showing page {page} of {Math.max(1, Math.ceil(totalCount / limit))}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || isLoading}
                className="h-7 px-2 text-xs"
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page * limit >= totalCount || isLoading}
                className="h-7 px-2 text-xs"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Slide-over Detail Drawer / Modal */}
      {selectedId && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white shadow-2xl h-full flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-[#0B192C] text-white px-6 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white">
                    {detailData?.student_name || "Application Details"}
                  </h2>
                  {detailData?.status && getStatusBadge(detailData.status)}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  ID: <span className="font-mono text-slate-300">{selectedId}</span>
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedId(null)}
                className="h-8 w-8 p-0 rounded-full text-slate-300 hover:text-white hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Drawer Body */}
            {isDetailLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#008DDA]" />
              </div>
            ) : detailData ? (
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Quick Contact & Action Ribbon */}
                <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {detailData.phone && (
                    <a
                      href={`https://wa.me/${formatCleanPhoneForWhatsApp(detailData.phone)}?text=${encodeURIComponent(
                        `Hi ${detailData.student_name}, this is TechBuilt Open School regarding your inquiry.`,
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      Chat on WhatsApp
                    </a>
                  )}

                  {detailData.email && (
                    <a
                      href={`mailto:${detailData.email}?subject=Regarding your application at TechBuilt Open School`}
                      className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      Send Email
                    </a>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkContacted}
                    disabled={isSaving}
                    className="h-8 text-xs gap-1 border-slate-300 text-slate-700"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />
                    Mark Contacted
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => {
                      fetchBatchesForConvert();
                      const slug = (detailData.selected_program_slug || detailData.selected_program_title || "")
                        .toLowerCase()
                        .trim()
                        .replace(/\s+/g, "-");
                      const specFee = getSpecializationMonthlyFee(slug);
                      const fee = specFee > 0 ? specFee : 15000;
                      setConvertMonthlyFee(fee);
                      setShowConvertModal(true);
                    }}
                    className="h-8 text-xs gap-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    Convert to Student
                  </Button>

                  {(admin?.role === "owner" || admin?.role === "admin") && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDeleteAdmission}
                      disabled={isDeleting}
                      className="h-8 text-xs gap-1 border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                      title="Permanently delete this admissions record"
                    >
                      {isDeleting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                      Delete
                    </Button>
                  )}

                  {detailData.last_contacted_at && (
                    <span className="text-[11px] text-slate-400 ml-auto">
                      Last contacted: {new Date(detailData.last_contacted_at).toLocaleString()}
                    </span>
                  )}
                </div>

                {/* CRM Controls Panel (Editable) */}
                <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-blue-600" />
                    Admissions Pipeline & Follow-up
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="crm-status" className="text-xs font-medium text-slate-700">
                        Pipeline Status
                      </Label>
                      <select
                        id="crm-status"
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value as CrmStatus)}
                        className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {CRM_STATUS_OPTIONS.map((st) => (
                          <option key={st.value} value={st.value}>
                            {st.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="crm-followup" className="text-xs font-medium text-slate-700">
                        Next Follow-Up Date & Time
                      </Label>
                      <Input
                        id="crm-followup"
                        type="datetime-local"
                        value={editFollowUp}
                        onChange={(e) => setEditFollowUp(e.target.value)}
                        className="h-9 text-xs bg-white border-slate-300"
                      />
                    </div>
                  </div>

                  {/* Demo Scheduling Fields */}
                  <div className="rounded-lg border border-purple-200 bg-purple-50/50 p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-purple-900 flex items-center gap-1.5">
                        <Video className="h-4 w-4 text-purple-600" />
                        Free Demo Trial Management
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleOpenScheduleDemoModal}
                        className="h-7 text-xs bg-purple-600 hover:bg-purple-700 text-white font-medium gap-1 shadow-xs"
                      >
                        <Calendar className="w-3.5 h-3.5" /> Schedule Interactive Demo
                      </Button>
                    </div>

                    {detailData.demo_scheduled_at && (
                      <div className="rounded-md bg-white border border-purple-200 p-2.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-slate-700">Scheduled Session:</span>
                          {detailData.demo_outcome ? (
                            <Badge className="text-[10px] uppercase font-mono bg-purple-100 text-purple-800 border-purple-300">
                              Outcome: {detailData.demo_outcome}
                            </Badge>
                          ) : (
                            <Badge className="text-[10px] uppercase font-mono bg-amber-100 text-amber-800 border-amber-300">
                              Trial Pending
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-slate-800 font-medium">
                          {new Date(detailData.demo_scheduled_at).toLocaleString()}
                        </div>
                        {detailData.demo_meeting_link && (
                          <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                            <a
                              href={detailData.demo_meeting_link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-purple-600 hover:underline flex items-center gap-1 font-medium"
                            >
                              <Video className="w-3.5 h-3.5" /> Join Demo Classroom
                            </a>
                          </div>
                        )}

                        {/* Quick Outcome Recording Buttons */}
                        <div className="pt-2 border-t border-purple-100">
                          <span className="text-[10px] font-semibold text-slate-500 uppercase block mb-1.5">
                            Record Demo Outcome
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenOutcomeModal("completed")}
                              className="h-6 px-2 text-[11px] bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            >
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Completed
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenOutcomeModal("no_show")}
                              className="h-6 px-2 text-[11px] bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                            >
                              <AlertTriangle className="w-3 h-3 mr-1" /> No Show
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={handleOpenScheduleDemoModal}
                              className="h-6 px-2 text-[11px] bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                            >
                              <RefreshCw className="w-3 h-3 mr-1" /> Reschedule
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenOutcomeModal("cancelled")}
                              className="h-6 px-2 text-[11px] bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                            >
                              <X className="w-3 h-3 mr-1" /> Cancelled
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Closed reason if closed */}
                  {editStatus === "closed" && (
                    <div className="space-y-1">
                      <Label htmlFor="crm-closed" className="text-xs font-medium text-slate-700">
                        Reason for Closing
                      </Label>
                      <Input
                        id="crm-closed"
                        placeholder="e.g. Schedule mismatch, unresponsive after 3 attempts, etc."
                        value={editClosedReason}
                        onChange={(e) => setEditClosedReason(e.target.value)}
                        className="h-9 text-xs bg-white border-slate-300"
                      />
                    </div>
                  )}

                  {/* Internal Admin Notes */}
                  <div className="space-y-1">
                    <Label htmlFor="crm-notes" className="text-xs font-medium text-slate-700">
                      Internal Admin Notes (Private to Admissions Team)
                    </Label>
                    <Textarea
                      id="crm-notes"
                      rows={3}
                      placeholder="Add private admissions notes, student prerequisites discussion, tutor assignments..."
                      value={editAdminNotes}
                      onChange={(e) => setEditAdminNotes(e.target.value)}
                      className="text-xs bg-white border-slate-300"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <Button
                      size="sm"
                      onClick={handleSaveCrm}
                      disabled={isSaving}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 px-4 font-semibold shadow-sm"
                    >
                      {isSaving ? (
                        <span className="flex items-center gap-1.5">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Saving...
                        </span>
                      ) : (
                        "Save CRM Updates"
                      )}
                    </Button>
                  </div>
                </div>

                {/* Submitted Student Data (Read Only) */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 border-b border-slate-100 pb-1">
                    <FileText className="h-3.5 w-3.5" />
                    Applicant Submission Details
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Full Name</span>
                      <span className="font-medium text-slate-900">{detailData.student_name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Email</span>
                      <span className="font-medium text-slate-900">{detailData.email}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">
                        Phone / WhatsApp
                      </span>
                      <span className="font-medium text-slate-900">{detailData.phone}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">
                        Country / City
                      </span>
                      <span className="font-medium text-slate-900">
                        {detailData.country}
                        {detailData.city ? ` / ${detailData.city}` : ""}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Age</span>
                      <span className="font-medium text-slate-900">
                        {detailData.age ?? "Not provided"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">
                        Education Level
                      </span>
                      <span className="font-medium text-slate-900">
                        {detailData.education_level}
                      </span>
                    </div>
                    {detailData.institution && (
                      <div className="col-span-2">
                        <span className="text-slate-400 block text-[10px] uppercase">
                          School / College / University
                        </span>
                        <span className="font-medium text-slate-900">{detailData.institution}</span>
                      </div>
                    )}
                    {detailData.skill_level && (
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">
                          Skill Level
                        </span>
                        <span className="font-medium text-slate-900">{detailData.skill_level}</span>
                      </div>
                    )}
                  </div>

                  {/* Program Selection Details */}
                  <div className="rounded-lg bg-slate-50 p-3 space-y-1 text-xs border border-slate-200">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-semibold uppercase text-slate-500">
                        Program Application
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {detailData.submission_kind === "demo"
                          ? "Free Trial Demo"
                          : "Full Application"}
                      </Badge>
                    </div>
                    <div className="font-semibold text-slate-900 text-sm">
                      {detailData.selected_program_title}
                    </div>
                    <div className="text-[11px] text-slate-600">
                      Category: {detailData.selected_program_category || "General"} • Type:{" "}
                      {detailData.application_type}
                    </div>
                  </div>

                  {/* Learning Goals and Preferences */}
                  {(detailData.learning_goal || detailData.learning_preference) && (
                    <div className="space-y-1 text-xs">
                      <span className="text-slate-400 block text-[10px] uppercase">
                        Learning Goal & Mode
                      </span>
                      {detailData.learning_goal && (
                        <p className="text-slate-800 bg-slate-50 p-2.5 rounded border border-slate-100">
                          {detailData.learning_goal}
                        </p>
                      )}
                      {detailData.learning_preference && (
                        <p className="text-slate-500 text-[11px]">
                          Preference:{" "}
                          <span className="font-medium text-slate-700">
                            {detailData.learning_preference}
                          </span>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Schedule Preferences */}
                  {(detailData.preferred_days ||
                    detailData.preferred_time ||
                    detailData.timezone) && (
                    <div className="grid grid-cols-3 gap-2 text-xs bg-slate-50/50 p-2.5 rounded border border-slate-100">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">
                          Preferred Days
                        </span>
                        <span className="font-medium text-slate-700">
                          {detailData.preferred_days || "Flexible"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">
                          Preferred Time
                        </span>
                        <span className="font-medium text-slate-700">
                          {detailData.preferred_time || "Flexible"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Timezone</span>
                        <span className="font-medium text-slate-700">
                          {detailData.timezone || "Local"}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Guardian Info if present */}
                  {detailData.guardian_name && (
                    <div className="rounded-lg bg-amber-50/60 border border-amber-200 p-3 space-y-1 text-xs">
                      <span className="text-[10px] font-bold uppercase text-amber-800">
                        Parent / Guardian Contact (Minor Learner)
                      </span>
                      <div className="grid grid-cols-3 gap-2 pt-1">
                        <div>
                          <span className="text-slate-500 block text-[10px]">Guardian Name</span>
                          <span className="font-medium text-slate-900">
                            {detailData.guardian_name}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Guardian Phone</span>
                          <span className="font-medium text-slate-900">
                            {detailData.guardian_phone || "—"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Guardian Email</span>
                          <span className="font-medium text-slate-900">
                            {detailData.guardian_email || "—"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Original Applicant Notes */}
                  {detailData.notes && (
                    <div className="space-y-1 text-xs">
                      <span className="text-slate-400 block text-[10px] uppercase">
                        Applicant's Message
                      </span>
                      <p className="text-slate-800 bg-slate-50 p-2.5 rounded border border-slate-100 italic">
                        "{detailData.notes}"
                      </p>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="pt-2 text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-100">
                    <span>Source: {detailData.source_page || "Direct Form"}</span>
                    <span>
                      Created:{" "}
                      {detailData.created_at
                        ? new Date(detailData.created_at).toLocaleString()
                        : "—"}
                    </span>
                  </div>
                </div>

                {/* Delivery & Integrations (Phase 7 & Phase 12E) */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" />
                      Delivery &amp; Integrations ({deliveryLogs.length} logged)
                    </h3>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={isRetryingDelivery || isDetailLoading}
                      onClick={handleRetryDeliveries}
                      className="h-7 px-2.5 text-xs gap-1.5 font-medium border-slate-200 hover:bg-slate-50"
                      title="Safely re-attempt failed or unconfigured secondary deliveries"
                    >
                      {isRetryingDelivery ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin text-primary" /> Retrying…
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-3 w-3 text-slate-500" /> Retry Deliveries
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      {
                        channel: "admin_email",
                        label: "Admin Email",
                        desc: "Admissions notification",
                      },
                      {
                        channel: "learner_email",
                        label: "Learner / Guardian Email",
                        desc: "Acknowledgement receipt",
                      },
                      {
                        channel: "google_sheet",
                        label: "Google Sheet Mirror",
                        desc: "Secondary backup sheet",
                      },
                    ].map((item) => {
                      const channelLogs = deliveryLogs.filter((l) => l.channel === item.channel);
                      const latestLog = channelLogs[channelLogs.length - 1];
                      const status = latestLog?.status || "skipped";

                      let badgeText = "Not Configured / Skipped";
                      let badgeClass = "bg-amber-50 text-amber-700 border-amber-200";

                      if (status === "success") {
                        badgeText = "Sent";
                        badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
                      } else if (status === "failed") {
                        badgeText = "Failed";
                        badgeClass = "bg-rose-50 text-rose-700 border-rose-200";
                      }

                      return (
                        <div
                          key={item.channel}
                          className="rounded-lg border border-slate-200 bg-white p-3 space-y-1.5 shadow-xs"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span className="font-semibold text-slate-800 text-xs leading-tight">
                              {item.label}
                            </span>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${badgeClass}`}
                            >
                              {badgeText}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">{item.desc}</p>
                          {latestLog?.created_at && (
                            <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-50 flex items-center justify-between">
                              <span>Last Attempt</span>
                              <span>{new Date(latestLog.created_at).toLocaleString()}</span>
                            </div>
                          )}
                          {channelLogs.length > 1 && (
                            <p className="text-[10px] text-slate-400">
                              Attempts: {channelLogs.length}
                            </p>
                          )}
                          {status === "failed" && latestLog?.error_summary && (
                            <p className="text-[10px] text-rose-600 bg-rose-50/50 p-1.5 rounded border border-rose-100 break-words">
                              Reason: {latestLog.error_summary}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Activity History Audit Trail */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 border-b border-slate-100 pb-1">
                    <History className="h-3.5 w-3.5" />
                    Activity History & Audit Trail ({activities.length})
                  </h3>

                  {activities.length === 0 ? (
                    <p className="text-xs text-slate-400 py-2">No activity logged yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {activities.map((act) => (
                        <div
                          key={act.id}
                          className="rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-700 capitalize">
                              {act.action_type.replace(/_/g, " ")}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(act.created_at).toLocaleString()}
                            </span>
                          </div>
                          {act.note && <p className="text-slate-600 text-[11px]">{act.note}</p>}
                          {act.old_status && act.new_status && (
                            <div className="text-[10px] text-slate-500">
                              <span className="font-medium text-slate-600">{act.old_status}</span> →{" "}
                              <span className="font-semibold text-blue-600">{act.new_status}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Convert to Student Modal */}
      {showConvertModal && detailData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                Convert Lead to Enrolled Student
              </h3>
              <button onClick={() => setShowConvertModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConvertToStudent} className="space-y-4 mt-4 text-xs">
              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 space-y-1">
                <div className="text-slate-400">
                  Candidate: <strong className="text-white">{detailData.student_name}</strong>
                </div>
                <div className="text-slate-400">
                  Email: <span className="text-white">{detailData.email}</span> &bull; Phone:{" "}
                  <span className="text-white">{detailData.phone}</span>
                </div>
                <div className="text-slate-400">
                  Target Program: <span className="text-cyan-400">{detailData.selected_program_title}</span>
                </div>
              </div>

              {/* Conversion Mode Radio Toggle */}
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">Conversion Strategy</Label>
                <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-950 rounded-lg border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setConvertMode("new_student")}
                    className={`py-2 px-3 rounded text-xs font-semibold transition-colors ${
                      convertMode === "new_student"
                        ? "bg-emerald-600 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Create New Student
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConvertMode("link_existing");
                      fetchStudentsForLink();
                    }}
                    className={`py-2 px-3 rounded text-xs font-semibold transition-colors ${
                      convertMode === "link_existing"
                        ? "bg-emerald-600 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Link to Existing Student
                  </button>
                </div>
              </div>

              {convertMode === "link_existing" && (
                <div>
                  <Label className="text-xs text-slate-300">Select Existing Student Record *</Label>
                  {isLoadingStudents ? (
                    <div className="text-xs text-slate-400 py-2">Loading students roster...</div>
                  ) : (
                    <select
                      required
                      value={selectedExistingStudentId}
                      onChange={(e) => setSelectedExistingStudentId(e.target.value)}
                      className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="">Select an enrolled student...</option>
                      {existingStudentsList.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.student_id} — {st.full_name} ({st.email})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              <div>
                <Label className="text-xs text-slate-300">Assign Live Batch / Cohort (Optional for 1-on-1)</Label>
                <select
                  value={convertBatchId}
                  onChange={(e) => setConvertBatchId(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">Select a batch (or leave blank)...</option>
                  {availableBatches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.batch_code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs text-slate-300">Agreed Monthly Fee (PKR) *</Label>
                <Input
                  type="number"
                  required
                  min="0"
                  value={convertMonthlyFee}
                  onChange={(e) => setConvertMonthlyFee(Number(e.target.value))}
                  className="mt-1 bg-slate-950 border-slate-800 text-white"
                />
              </div>

              <div>
                <Label className="text-xs text-slate-300">Monthly Billing Day (1-28)</Label>
                <Input
                  type="number"
                  required
                  min="1"
                  max="28"
                  value={convertBillingDay}
                  onChange={(e) => setConvertBillingDay(Number(e.target.value))}
                  className="mt-1 bg-slate-950 border-slate-800 text-white font-mono"
                />
              </div>

              <div className="p-2.5 bg-emerald-950/30 border border-emerald-900/40 rounded-lg text-emerald-300 text-[11px]">
                {convertMode === "link_existing"
                  ? "This links the applicant directly to the existing student canonical profile, creates a new program enrollment and monthly billing plan without creating a duplicate record."
                  : "Upon conversion, this creates an active student record with sequential ID (TBOS-YYYY-XXXX), enrolls them in the selected batch, generates the initial tuition fee invoice, and updates this lead status to 'enrolled'."}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowConvertModal(false)}
                  className="border-slate-800 text-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isConverting}
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold"
                >
                  {isConverting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {convertMode === "link_existing" ? "Link & Enroll Student" : "Confirm & Enroll Student"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Interactive Demo Modal */}
      {showScheduleDemoModal && detailData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900">Schedule Interactive Demo</h3>
              </div>
              <button onClick={() => setShowScheduleDemoModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleDemo} className="space-y-3.5 mt-4 text-xs">
              <div className="rounded-lg bg-purple-50/70 border border-purple-200 p-3 text-purple-950 space-y-1">
                <div>Lead: <strong className="font-semibold text-slate-900">{detailData.student_name}</strong></div>
                <div className="text-[11px] text-slate-600">Program: {detailData.selected_program_title} &bull; Email: {detailData.email}</div>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Session Topic / Title *</Label>
                <Input
                  required
                  value={demoForm.title}
                  onChange={(e) => setDemoForm({ ...demoForm, title: e.target.value })}
                  className="mt-1 h-9 text-xs bg-white border-slate-300"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Assign Faculty / Instructor</Label>
                <select
                  value={demoForm.instructorId}
                  onChange={(e) => {
                    const inst = instructorsList.find((i) => i.id === e.target.value);
                    setDemoForm({
                      ...demoForm,
                      instructorId: e.target.value,
                      instructorName: inst?.full_name || inst?.email || "Faculty Mentor",
                    });
                  }}
                  className="mt-1 w-full h-9 rounded-md border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select faculty member...</option>
                  {instructorsList.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.full_name ? `${i.full_name} (${i.email})` : i.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <Label className="text-xs font-semibold text-slate-700">Date *</Label>
                  <Input
                    type="date"
                    required
                    value={demoForm.sessionDate}
                    onChange={(e) => setDemoForm({ ...demoForm, sessionDate: e.target.value })}
                    className="mt-1 h-9 text-xs bg-white border-slate-300"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700">Start Time (PKT) *</Label>
                  <Input
                    type="time"
                    required
                    value={demoForm.startTime}
                    onChange={(e) => setDemoForm({ ...demoForm, startTime: e.target.value })}
                    className="mt-1 h-9 text-xs bg-white border-slate-300"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700">End Time (PKT) *</Label>
                  <Input
                    type="time"
                    required
                    value={demoForm.endTime}
                    onChange={(e) => setDemoForm({ ...demoForm, endTime: e.target.value })}
                    className="mt-1 h-9 text-xs bg-white border-slate-300"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Custom Google Meet Link (Optional)</Label>
                <Input
                  type="url"
                  placeholder="Leave empty to auto-generate via Google Calendar API"
                  value={demoForm.meetingLink}
                  onChange={(e) => setDemoForm({ ...demoForm, meetingLink: e.target.value })}
                  className="mt-1 h-9 text-xs bg-white border-slate-300"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Scheduling automatically creates a timetable session and queues 24h, 1h, 15m student reminders and 10m instructor alerts.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowScheduleDemoModal(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSchedulingDemo}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                >
                  {isSchedulingDemo ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Calendar className="w-3.5 h-3.5 mr-1" />}
                  Schedule Demo Session
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Demo Outcome Modal */}
      {showOutcomeModal && detailData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 capitalize">
                Record Demo Outcome: {outcomeForm.outcome.replace(/_/g, " ")}
              </h3>
              <button onClick={() => setShowOutcomeModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDemoOutcome} className="space-y-3.5 mt-4 text-xs">
              <p className="text-slate-600">
                Record trial session outcome for <strong className="text-slate-900">{detailData.student_name}</strong>.
              </p>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Outcome Status</Label>
                <select
                  value={outcomeForm.outcome}
                  onChange={(e) => setOutcomeForm({ ...outcomeForm, outcome: e.target.value as any })}
                  className="mt-1 w-full h-9 rounded-md border border-slate-300 bg-white px-3 text-xs text-slate-900 capitalize focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="completed">Completed (Trial Successful)</option>
                  <option value="no_show">No Show (Learner Absent)</option>
                  <option value="rescheduled">Rescheduled</option>
                  <option value="cancelled">Cancelled (Closed)</option>
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Instructor Notes / Evaluation</Label>
                <Textarea
                  rows={3}
                  value={outcomeForm.notes}
                  onChange={(e) => setOutcomeForm({ ...outcomeForm, notes: e.target.value })}
                  placeholder="Learner feedback, skill assessment, or rescheduling justification..."
                  className="mt-1 text-xs bg-white border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowOutcomeModal(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingOutcome}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                >
                  {isSubmittingOutcome ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <CheckCircle2 className="w-3.5 h-3.5 mr-1" />}
                  Save Demo Outcome
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
