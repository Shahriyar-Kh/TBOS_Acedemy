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
} from "lucide-react";
import { toast } from "sonner";

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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans">
      {/* Top Admin Navbar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-[#0B192C] text-white shadow-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-[#008DDA] to-[#41B3A2] text-white shadow-sm">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <span className="font-bold tracking-tight text-base text-white">TBOS Academy</span>
                <span className="ml-2 text-xs font-semibold text-[#41B3A2] uppercase tracking-wider">
                  Admissions CRM
                </span>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/admin/admissions"
                className="rounded-md bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition-colors"
              >
                All Admissions
              </Link>
              <Link
                to="/admin/demos"
                className="rounded-md px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                Demo Pipeline
              </Link>
              <Link
                to="/admin/content"
                className="rounded-md px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                Content CMS
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-medium text-white">{admin?.email}</span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">
                Role: {admin?.role}
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchAdmissions()}
              disabled={isLoading}
              className="text-slate-300 hover:text-white hover:bg-white/10 h-8 px-2.5"
              title="Refresh Records"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await logout();
                navigate({ to: "/admin/login" });
              }}
              className="border-white/10 bg-white/5 text-slate-200 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30 h-8 text-xs font-medium gap-1.5"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 space-y-6">
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
      </main>

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
                  <div className="rounded-lg border border-purple-200 bg-purple-50/50 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-purple-900 flex items-center gap-1">
                        <Video className="h-3.5 w-3.5 text-purple-600" />
                        Free Demo Trial Management
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditStatus("demo_scheduled");
                        }}
                        className="h-6 text-[11px] text-purple-700 hover:bg-purple-100"
                      >
                        Quick Set "Demo Scheduled"
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="crm-demo-time" className="text-[11px] text-slate-600">
                          Demo Scheduled Time
                        </Label>
                        <Input
                          id="crm-demo-time"
                          type="datetime-local"
                          value={editDemoScheduled}
                          onChange={(e) => setEditDemoScheduled(e.target.value)}
                          className="h-8 text-xs bg-white border-slate-300"
                        />
                      </div>
                      <div>
                        <Label htmlFor="crm-demo-link" className="text-[11px] text-slate-600">
                          Demo Meeting Link (Google Meet / Zoom)
                        </Label>
                        <div className="relative">
                          <Input
                            id="crm-demo-link"
                            type="url"
                            placeholder="https://meet.google.com/..."
                            value={editDemoLink}
                            onChange={(e) => setEditDemoLink(e.target.value)}
                            className="h-8 text-xs bg-white border-slate-300 pr-8"
                          />
                          {editDemoLink && (
                            <a
                              href={editDemoLink}
                              target="_blank"
                              rel="noreferrer"
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-purple-600 hover:text-purple-800"
                              title="Test meeting link"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
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
    </div>
  );
}
