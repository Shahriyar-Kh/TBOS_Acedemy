import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { useAdminAuth } from "@/lib/adminAuthContext";
import { CRM_STATUS_OPTIONS, type CrmStatus } from "@/lib/adminCrm";
import type { AdmissionsRequestRecord } from "@/lib/supabase.server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  Search,
  RefreshCw,
  LogOut,
  Calendar,
  ExternalLink,
  MessageCircle,
  Video,
  X,
  Loader2,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/demos")({
  component: AdminDemosPage,
});

function AdminDemosPage() {
  const { admin, isLoading: authLoading, logout, getAuthHeader } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !admin) {
      navigate({ to: "/admin/login" });
    }
  }, [admin, authLoading, navigate]);

  const [demos, setDemos] = useState<AdmissionsRequestRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Scheduling modal
  const [selectedDemo, setSelectedDemo] = useState<AdmissionsRequestRecord | null>(null);
  const [scheduleTime, setScheduleTime] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchDemos = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      } else {
        // default to demo kind
        params.set("kind", "demo");
      }
      params.set("limit", "50");

      const res = await fetch(`/api/admin/admissions?${params.toString()}`, {
        headers: getAuthHeader(),
      });

      if (res.status === 401 || res.status === 403) {
        logout();
        navigate({ to: "/admin/login" });
        return;
      }

      const json = await res.json();
      if (json.ok) {
        setDemos(json.data || []);
      }
    } catch {
      toast.error("Failed to load demo requests.");
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, getAuthHeader, logout, navigate]);

  useEffect(() => {
    if (admin) {
      fetchDemos();
    }
  }, [fetchDemos, admin]);

  const handleSaveSchedule = async () => {
    if (!selectedDemo?.id) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/admissions/${selectedDemo.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          demoScheduledAt: scheduleTime ? new Date(scheduleTime).toISOString() : null,
          demoMeetingLink: meetingLink.trim() || null,
          status: "demo_scheduled",
        }),
      });

      const json = await res.json();
      if (json.ok) {
        toast.success("Demo scheduled and meeting link saved.");
        setSelectedDemo(null);
        fetchDemos();
      } else {
        toast.error(json.error || "Failed to save schedule.");
      }
    } catch {
      toast.error("Network error while saving schedule.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarkCompleted = async (demo: AdmissionsRequestRecord) => {
    if (!demo.id) return;
    try {
      const res = await fetch(`/api/admin/admissions/${demo.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          status: "demo_completed",
        }),
      });

      const json = await res.json();
      if (json.ok) {
        toast.success("Demo marked as completed.");
        fetchDemos();
      }
    } catch {
      toast.error("Failed to update status.");
    }
  };

  const getStatusBadge = (statusName?: string) => {
    const found = CRM_STATUS_OPTIONS.find((s) => s.value === statusName);
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${found?.color || "bg-slate-100 text-slate-700"}`}>
        {found?.label || statusName || "Pending"}
      </span>
    );
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
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-[#0B192C] text-white shadow-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-[#008DDA] to-[#41B3A2] text-white shadow-sm">
                <Video className="h-5 w-5" />
              </div>
              <div>
                <span className="font-bold tracking-tight text-base text-white">TBOS Academy</span>
                <span className="ml-2 text-xs font-semibold text-purple-300 uppercase tracking-wider">Demo Pipeline</span>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/admin/admissions"
                className="rounded-md px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                All Admissions
              </Link>
              <Link
                to="/admin/demos"
                className="rounded-md bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition-colors"
              >
                Demo Pipeline
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchDemos()}
              disabled={isLoading}
              className="text-slate-300 hover:text-white hover:bg-white/10 h-8 px-2.5"
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
              className="border-white/10 bg-white/5 text-slate-200 hover:bg-red-500/20 hover:text-red-300 h-8 text-xs font-medium gap-1.5"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Free Trial Demo Requests</h1>
            <p className="text-xs text-slate-500">Manage 1-on-1 trial bookings, schedule times, and share meeting links.</p>
          </div>

          {/* Quick status filter */}
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-md border border-slate-300 bg-white px-3 text-xs focus:outline-none"
            >
              <option value="all">All Demo Inquiries</option>
              <option value="demo_requested">Pending Scheduling (demo_requested)</option>
              <option value="demo_scheduled">Scheduled & Upcoming (demo_scheduled)</option>
              <option value="demo_completed">Completed (demo_completed)</option>
            </select>
          </div>
        </div>

        {/* Demo Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {demos.length === 0 && !isLoading ? (
            <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
              No demo requests found matching the current filter.
            </div>
          ) : (
            demos.map((demo) => {
              const cleanPhone = demo.phone.replace(/[^0-9]/g, "");
              const isScheduled = Boolean(demo.demo_scheduled_at);

              return (
                <div
                  key={demo.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{demo.student_name}</h3>
                        <p className="text-xs text-slate-500">{demo.email}</p>
                      </div>
                      {getStatusBadge(demo.status)}
                    </div>

                    <div className="rounded-lg bg-slate-50 p-2.5 text-xs space-y-1 border border-slate-100">
                      <div className="font-semibold text-slate-800">{demo.selected_program_title}</div>
                      <div className="text-[11px] text-slate-500">
                        {demo.country} • {demo.education_level} {demo.age ? `(Age ${demo.age})` : ""}
                      </div>
                    </div>

                    {/* Schedule info banner */}
                    {isScheduled ? (
                      <div className="rounded-lg bg-cyan-50 border border-cyan-200 p-2.5 text-xs space-y-1">
                        <div className="flex items-center gap-1.5 font-semibold text-cyan-900">
                          <Calendar className="h-3.5 w-3.5 text-cyan-600" />
                          <span>{new Date(demo.demo_scheduled_at!).toLocaleString()}</span>
                        </div>
                        {demo.demo_meeting_link && (
                          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-cyan-100">
                            <span className="text-cyan-800 truncate mr-2">Link ready</span>
                            <a
                              href={demo.demo_meeting_link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-cyan-700 hover:text-cyan-900 font-semibold flex items-center gap-0.5 shrink-0"
                            >
                              Join / Test <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-lg bg-purple-50/70 border border-purple-200 p-2 text-xs text-purple-800 flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                        <span>Schedule time pending</span>
                      </div>
                    )}

                    {/* Preferences */}
                    {(demo.preferred_days || demo.preferred_time) && (
                      <div className="text-[11px] text-slate-500">
                        Prefers: <span className="font-medium text-slate-700">{demo.preferred_days || "Any day"} ({demo.preferred_time || "Flexible"})</span>
                      </div>
                    )}
                  </div>

                  {/* Actions footer */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    {cleanPhone && (
                      <a
                        href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                          `Hi ${demo.student_name}, this is TechBuilt Open School regarding your trial demo session for ${demo.selected_program_title}.`,
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        WhatsApp
                      </a>
                    )}

                    <div className="flex items-center gap-1.5">
                      {demo.status === "demo_scheduled" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkCompleted(demo)}
                          className="h-8 text-xs text-teal-700 hover:bg-teal-50 px-2"
                          title="Mark trial session completed"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                          Done
                        </Button>
                      )}

                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedDemo(demo);
                          setScheduleTime(demo.demo_scheduled_at ? demo.demo_scheduled_at.slice(0, 16) : "");
                          setMeetingLink(demo.demo_meeting_link || "");
                        }}
                        className="h-8 text-xs bg-[#0B192C] hover:bg-[#1E3E62] text-white px-3"
                      >
                        {isScheduled ? "Edit Schedule" : "Schedule Demo"}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Schedule Modal */}
      {selectedDemo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Schedule Demo Session</h3>
                <p className="text-xs text-slate-500">{selectedDemo.student_name} • {selectedDemo.selected_program_title}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDemo(null)}
                className="h-8 w-8 p-0 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="demo-time" className="text-xs font-medium text-slate-700">
                  Demo Meeting Date & Time
                </Label>
                <Input
                  id="demo-time"
                  type="datetime-local"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="demo-link" className="text-xs font-medium text-slate-700">
                  Meeting Link (Google Meet / Zoom URL)
                </Label>
                <Input
                  id="demo-link"
                  type="url"
                  placeholder="https://meet.google.com/abc-defg-hij"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDemo(null)}
                className="h-9 text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveSchedule}
                disabled={isSaving}
                className="h-9 text-xs bg-purple-700 hover:bg-purple-800 text-white font-semibold"
              >
                {isSaving ? "Saving..." : "Confirm Schedule"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
