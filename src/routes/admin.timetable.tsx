import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { adminNoIndexMeta } from "@/lib/seo";
import { useEffect, useState, useCallback } from "react";
import { useAdminAuth } from "@/lib/adminAuthContext";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  UserCheck,
  AlertTriangle,
  PlusCircle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Loader2,
  X,
  Users,
  Download,
  RefreshCw,
  ShieldAlert,
  Edit3,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { generateIcsCalendar, downloadIcsFile } from "@/lib/icalendar";

export const Route = createFileRoute("/admin/timetable")({
  head: () => ({ meta: adminNoIndexMeta("TBOS Timetable & Classes") }),
  component: AdminTimetablePage,
});

function AdminTimetablePage() {
  const { admin, isLoading: authLoading, getAuthHeader } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !admin) {
      navigate({ to: "/admin/login" });
    }
  }, [admin, authLoading, navigate]);

  const [sessions, setSessions] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [filterBatch, setFilterBatch] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

  // Schedule Modal State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    batchId: "",
    instructorId: "",
    instructorName: "Shahriyar Khan",
    title: "",
    sessionDate: new Date().toISOString().split("T")[0],
    startTime: "19:00",
    endTime: "20:30",
    meetingUrl: "https://meet.google.com/",
    notes: "",
    recurringWeeks: 1,
  });

  // Clash Override State
  const [showClashModal, setShowClashModal] = useState(false);
  const [clashData, setClashData] = useState<{ error: string; conflicts: any[] } | null>(null);
  const [overrideReason, setOverrideReason] = useState("Admin approved schedule adjustment");
  const [isScheduling, setIsScheduling] = useState(false);

  // Attendance Modal State
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [activeSession, setActiveSession] = useState<any | null>(null);
  const [attendanceRoster, setAttendanceRoster] = useState<any[]>([]);
  const [isAttendanceLoading, setIsAttendanceLoading] = useState(false);
  const [isSavingAttendance, setIsSavingAttendance] = useState(false);

  // Reschedule Modal State
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedSessionToReschedule, setSelectedSessionToReschedule] = useState<any | null>(null);
  const [rescheduleForm, setRescheduleForm] = useState({
    sessionDate: "",
    startTime: "",
    endTime: "",
    reason: "",
  });
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleClash, setRescheduleClash] = useState<{ error: string; conflicts: any[] } | null>(null);
  const [rescheduleOverrideReason, setRescheduleOverrideReason] = useState("Approved schedule adjustment");
  const [showRescheduleClashModal, setShowRescheduleClashModal] = useState(false);

  // Cancellation Modal State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedSessionToCancel, setSelectedSessionToCancel] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  // Sync Retry State
  const [retryingSyncSessionId, setRetryingSyncSessionId] = useState<string | null>(null);

  const fetchBatches = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/batches?limit=100", { headers: getAuthHeader() });
      if (res.ok) {
        const data = await res.json();
        setBatches(data.batches || []);
      }
    } catch {
      // ignore
    }
  }, [getAuthHeader]);

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const params = new URLSearchParams();
      if (filterBatch !== "all") params.set("batchId", filterBatch);
      params.set("limit", "100");

      const res = await fetch(`/api/admin/timetable?${params.toString()}`, {
        headers: getAuthHeader(),
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      } else {
        const errJson = await res.json().catch(() => ({}));
        const msg = errJson.error || "Failed to load timetable sessions";
        setFetchError(msg);
        toast.error(msg);
      }
    } catch (err: any) {
      const msg = err?.message || "Network error loading timetable";
      setFetchError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [filterBatch, getAuthHeader]);

  useEffect(() => {
    if (admin) {
      fetchBatches();
      fetchSessions();
    }
  }, [fetchBatches, fetchSessions, admin]);

  const handleCreateSession = async (e?: React.FormEvent, isOverride: boolean = false) => {
    if (e) e.preventDefault();
    setIsScheduling(true);
    try {
      const payload: Record<string, any> = {
        action: "create-session",
        title: scheduleForm.title.trim(),
        sessionDate: scheduleForm.sessionDate,
        startTime: scheduleForm.startTime,
        endTime: scheduleForm.endTime,
        meetingLink: scheduleForm.meetingUrl.trim() || null,
        instructorName: scheduleForm.instructorName.trim() || null,
        notes: scheduleForm.notes.trim() || null,
        repeatWeeks: Number(scheduleForm.recurringWeeks) || 1,
      };

      if (scheduleForm.batchId && scheduleForm.batchId.trim() !== "") {
        payload.batchId = scheduleForm.batchId.trim();
      }

      if (scheduleForm.instructorId && scheduleForm.instructorId.trim() !== "") {
        payload.instructorId = scheduleForm.instructorId.trim();
      }

      if (isOverride) {
        payload.override = true;
        payload.overrideReason = overrideReason.trim() || "Administrative override";
      }

      const res = await fetch("/api/admin/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.status === 409) {
        // Schedule Clash Detected!
        setClashData({
          error: data.error || "Schedule clash detected with existing classes.",
          conflicts: data.conflicts || [],
        });
        setShowClashModal(true);
        return;
      }

      if (res.ok && (data.ok || data.success)) {
        toast.success(
          data.recurringCount > 1
            ? `Successfully scheduled ${data.recurringCount} weekly classes!`
            : "Class session scheduled successfully!"
        );
        setShowScheduleModal(false);
        setShowClashModal(false);
        fetchSessions();
      } else {
        toast.error(data.error || "Failed to schedule session");
      }
    } catch {
      toast.error("Network error scheduling session");
    } finally {
      setIsScheduling(false);
    }
  };

  const handleExportSingleIcs = (sess: any) => {
    const icsContent = generateIcsCalendar({
      id: sess.id,
      title: sess.title,
      sessionDate: sess.session_date,
      startTime: sess.start_time,
      endTime: sess.end_time,
      timezone: sess.timezone || "Asia/Karachi",
      meetingLink: sess.meeting_link || sess.meeting_url,
      instructorName: sess.instructor_name,
      batchOrStudentName: sess.batches?.name || sess.students?.full_name || "TBOS Class",
    });
    const filename = `tbos-class-${sess.session_date}-${sess.title.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}.ics`;
    downloadIcsFile(filename, icsContent);
    toast.success("Calendar invite (.ics) downloaded!");
  };

  const handleExportAllIcs = () => {
    if (sessions.length === 0) {
      toast.error("No sessions available to export");
      return;
    }
    const calendarEvents = sessions.map((s) => ({
      id: s.id,
      title: s.title,
      sessionDate: s.session_date,
      startTime: s.start_time,
      endTime: s.end_time,
      timezone: s.timezone || "Asia/Karachi",
      meetingLink: s.meeting_link || s.meeting_url,
      instructorName: s.instructor_name,
      batchOrStudentName: s.batches?.name || s.students?.full_name || "TBOS Class",
    }));
    const icsContent = generateIcsCalendar(calendarEvents);
    downloadIcsFile("tbos-academy-timetable.ics", icsContent);
    toast.success(`Exported ${sessions.length} sessions to iCalendar!`);
  };

  const openAttendanceModal = async (session: any) => {
    setActiveSession(session);
    setShowAttendanceModal(true);
    setIsAttendanceLoading(true);
    try {
      if (session.batch_id) {
        const res = await fetch(`/api/admin/batches/${session.batch_id}`, {
          headers: getAuthHeader(),
        });
        if (res.ok) {
          const data = await res.json();
          const enrollments = data.batch?.enrollments || [];
          setAttendanceRoster(
            enrollments.map((enr: any) => ({
              studentId: enr.students?.id,
              studentName: enr.students?.full_name,
              studentNumber: enr.students?.student_id,
              status: "present",
              notes: "",
            }))
          );
        }
      } else if (session.student_id) {
        // 1-on-1 Student session
        setAttendanceRoster([
          {
            studentId: session.student_id,
            studentName: session.students?.full_name || "Assigned Student",
            studentNumber: session.students?.student_id || "1-on-1",
            status: "present",
            notes: "",
          },
        ]);
      }
    } catch {
      toast.error("Error loading student roster for attendance");
    } finally {
      setIsAttendanceLoading(false);
    }
  };

  const handleSaveAttendance = async () => {
    if (!activeSession) return;
    setIsSavingAttendance(true);
    try {
      const attendees = attendanceRoster.map((r) => ({
        studentId: r.studentId,
        status: r.status,
        notes: r.notes,
      }));
      const res = await fetch(`/api/admin/timetable/${activeSession.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({
          action: "record-attendance",
          attendees,
          records: attendees,
        }),
      });
      const data = await res.json();
      if (res.ok && (data.ok || data.success)) {
        toast.success(`Attendance saved for ${attendanceRoster.length} students!`);
        setShowAttendanceModal(false);
        fetchSessions();
      } else {
        toast.error(data.error || "Failed to save attendance");
      }
    } catch {
      toast.error("Network error saving attendance");
    } finally {
      setIsSavingAttendance(false);
    }
  };

  const handleRetryCalendarSync = async (sessionId: string) => {
    setRetryingSyncSessionId(sessionId);
    try {
      const res = await fetch(`/api/admin/timetable/${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({ action: "retry-calendar-sync" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Google Calendar & Meet synced successfully!");
        fetchSessions();
      } else {
        toast.error(data.error || "Google Meet sync failed. Check calendar credentials.");
        fetchSessions();
      }
    } catch {
      toast.error("Network error retrying Google Calendar sync");
    } finally {
      setRetryingSyncSessionId(null);
    }
  };

  const handleOpenReschedule = (sess: any) => {
    setSelectedSessionToReschedule(sess);
    setRescheduleForm({
      sessionDate: sess.session_date,
      startTime: sess.start_time,
      endTime: sess.end_time,
      reason: "",
    });
    setRescheduleClash(null);
    setShowRescheduleModal(true);
  };

  const handleConfirmReschedule = async (isOverride: boolean = false) => {
    if (!selectedSessionToReschedule) return;
    setIsRescheduling(true);
    try {
      const payload: Record<string, any> = {
        action: "reschedule",
        newSessionDate: rescheduleForm.sessionDate,
        newStartTime: rescheduleForm.startTime,
        newEndTime: rescheduleForm.endTime,
        reason: rescheduleForm.reason.trim() || "Rescheduled by administration",
      };
      if (isOverride) {
        payload.override = true;
        payload.overrideReason = rescheduleOverrideReason.trim() || "Approved schedule adjustment";
      }

      const res = await fetch(`/api/admin/timetable/${selectedSessionToReschedule.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.status === 409) {
        setRescheduleClash({
          error: data.error || "Schedule clash detected with existing classes.",
          conflicts: data.conflicts || [],
        });
        setShowRescheduleClashModal(true);
        return;
      }

      if (res.ok && (data.ok || data.success)) {
        toast.success("Class session rescheduled successfully!");
        setShowRescheduleModal(false);
        setShowRescheduleClashModal(false);
        fetchSessions();
      } else {
        toast.error(data.error || "Failed to reschedule session");
      }
    } catch {
      toast.error("Network error rescheduling session");
    } finally {
      setIsRescheduling(false);
    }
  };

  const handleOpenCancel = (sess: any) => {
    setSelectedSessionToCancel(sess);
    setCancelReason("");
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedSessionToCancel) return;
    if (!cancelReason.trim()) {
      toast.error("Cancellation reason is mandatory");
      return;
    }
    setIsCancelling(true);
    try {
      const res = await fetch(
        `/api/admin/timetable/${selectedSessionToCancel.id}?reason=${encodeURIComponent(cancelReason.trim())}`,
        {
          method: "DELETE",
          headers: getAuthHeader(),
        }
      );
      const data = await res.json();
      if (res.ok && (data.ok || data.success)) {
        toast.success("Session cancelled and reminders cleaned up.");
        setShowCancelModal(false);
        fetchSessions();
      } else {
        toast.error(data.error || "Failed to cancel session");
      }
    } catch {
      toast.error("Network error cancelling session");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <AdminLayout
      title="Timetable & Class Schedule"
      description="Live schedule of group batch sessions, one-on-one classes, attendance tracking, and Google Calendar export."
      onRefresh={fetchSessions}
      isRefreshing={isLoading}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportAllIcs}
            className="text-xs"
            title="Download iCalendar format (.ics) for Google/Outlook"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-slate-600" />
            Export Timetable (.ics)
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setClashData(null);
              setShowScheduleModal(true);
            }}
            className="bg-[#008DDA] hover:bg-[#0070b8] text-white text-xs font-medium"
          >
            <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
            Schedule Class
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Filter Bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Label className="text-xs font-medium text-slate-700 whitespace-nowrap">Filter Cohort / Batch:</Label>
            <select
              value={filterBatch}
              onChange={(e) => setFilterBatch(e.target.value)}
              className="bg-white border border-slate-200 text-xs text-slate-800 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#008DDA]"
            >
              <option value="all">All Cohorts & Batches</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.batch_code ? `${b.name} (${b.batch_code})` : b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={viewMode === "list" ? "default" : "outline"}
              onClick={() => setViewMode("list")}
              className={`text-xs h-8 ${viewMode === "list" ? "bg-[#008DDA] text-white" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}
            >
              List View
            </Button>
            <Button
              size="sm"
              variant={viewMode === "calendar" ? "default" : "outline"}
              onClick={() => setViewMode("calendar")}
              className={`text-xs h-8 ${viewMode === "calendar" ? "bg-[#008DDA] text-white" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}
            >
              Calendar View
            </Button>
          </div>
        </div>

        {/* Sessions Grid */}
        <div>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-500 bg-white border border-slate-200 rounded-xl">
              <Loader2 className="w-7 h-7 animate-spin text-[#008DDA] mb-2" />
              <span className="text-xs">Loading live schedule...</span>
            </div>
          ) : fetchError ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500 bg-white border border-slate-200 rounded-xl">
              <AlertTriangle className="w-10 h-10 text-rose-500 mb-2 opacity-80" />
              <p className="text-sm font-semibold text-slate-800">Failed to load timetable</p>
              <p className="text-xs text-slate-500 mt-1 max-w-md">{fetchError}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchSessions()}
                className="mt-4 text-xs gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retry
              </Button>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center p-12 bg-white border border-slate-200 rounded-xl text-slate-500">
              <CalendarIcon className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-semibold text-slate-800">No scheduled classes found</p>
              <p className="text-xs text-slate-500 mt-1">Click "Schedule Class" above to set up upcoming lectures.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sessions.map((sess) => {
                const isDemo = sess.session_type === "demo" || sess.title?.toLowerCase().includes("demo");
                const isOneOnOne = !sess.batch_id && sess.student_id;
                const batchOrStudentLabel = isDemo
                  ? `Demo: ${sess.students?.full_name || "Prospect"}`
                  : isOneOnOne
                  ? `1-on-1: ${sess.students?.full_name || "Special Session"}`
                  : sess.batches?.name || "Batch Class";

                return (
                  <div
                    key={sess.id}
                    className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                        <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded truncate max-w-[200px] ${
                          isDemo
                            ? "text-purple-700 bg-purple-50 border border-purple-200"
                            : isOneOnOne
                            ? "text-indigo-700 bg-indigo-50 border border-indigo-200"
                            : "text-[#008DDA] bg-blue-50 border border-blue-200"
                        }`}>
                          {batchOrStudentLabel}
                        </span>
                        <div className="flex items-center gap-1 flex-wrap">
                          {sess.google_calendar_sync_status === "synced" && (
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] gap-1 flex items-center">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              Synced
                            </Badge>
                          )}
                          {sess.google_calendar_sync_status === "failed" && (
                            <button
                              type="button"
                              onClick={() => handleRetryCalendarSync(sess.id)}
                              disabled={retryingSyncSessionId === sess.id}
                              title={sess.google_calendar_error || "Google Meet sync failed. Click to retry."}
                              className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors"
                            >
                              {retryingSyncSessionId === sess.id ? (
                                <Loader2 className="w-2.5 h-2.5 animate-spin" />
                              ) : (
                                <RefreshCw className="w-2.5 h-2.5" />
                              )}
                              Sync Failed &bull; Retry
                            </button>
                          )}
                          {sess.google_calendar_sync_status === "pending" && (
                            <Badge className="bg-slate-100 text-slate-600 border-slate-200 text-[10px]">
                              Syncing...
                            </Badge>
                          )}
                          {sess.is_override && (
                            <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]" title={sess.override_reason || "Clash Override"}>
                              Override
                            </Badge>
                          )}
                          <Badge
                            className={`text-[10px] ${
                              sess.status === "completed"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : sess.status === "cancelled"
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : sess.status === "rescheduled"
                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                            }`}
                          >
                            {sess.status}
                          </Badge>
                        </div>
                      </div>

                      <h3 className="font-semibold text-slate-900 text-sm line-clamp-1">{sess.title}</h3>

                      <div className="space-y-1.5 mt-3 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {new Date(sess.session_date).toLocaleDateString(undefined, {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {sess.start_time} - {sess.end_time} PKT
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>Instructor: {sess.instructor_name || "Assigned Faculty"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        {(sess.meeting_link || sess.meeting_url) ? (
                          <a
                            href={sess.meeting_link || sess.meeting_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-[#008DDA] hover:underline font-medium mr-1"
                          >
                            <Video className="w-3.5 h-3.5" />
                            Join
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400 mr-1">No URL</span>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleExportSingleIcs(sess)}
                          className="h-7 px-1.5 text-xs text-slate-500 hover:text-slate-800"
                          title="Download Calendar .ics"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenReschedule(sess)}
                          className="h-7 px-1.5 text-xs text-slate-500 hover:text-slate-800"
                          title="Reschedule Class Session"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenCancel(sess)}
                          disabled={sess.status === "cancelled"}
                          className="h-7 px-1.5 text-xs text-rose-500 hover:text-rose-700 disabled:opacity-30"
                          title="Cancel Session"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openAttendanceModal(sess)}
                        disabled={sess.status === "cancelled"}
                        className="h-7 text-xs border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                      >
                        <UserCheck className="w-3 h-3 mr-1 text-emerald-600" />
                        Attendance
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Schedule Class Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-[#008DDA]" />
                Schedule Class Session
              </h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => handleCreateSession(e, false)} className="space-y-4 mt-4 text-xs">
              <div>
                <Label className="text-xs text-slate-700 font-medium">Select Cohort / Batch (Optional for 1-on-1)</Label>
                <select
                  value={scheduleForm.batchId}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, batchId: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-md text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#008DDA]"
                >
                  <option value="">Select a batch (or leave blank for 1-on-1)...</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.batch_code ? `${b.name} (${b.batch_code})` : b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs text-slate-700 font-medium">Session Topic / Title *</Label>
                <Input
                  required
                  value={scheduleForm.title}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                  placeholder="e.g. Week 2: Python Object-Oriented Programming"
                  className="mt-1 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-slate-700 font-medium">Instructor Name *</Label>
                  <Input
                    required
                    value={scheduleForm.instructorName}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, instructorName: e.target.value })}
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-700 font-medium">Session Date *</Label>
                  <Input
                    type="date"
                    required
                    value={scheduleForm.sessionDate}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, sessionDate: e.target.value })}
                    className="mt-1 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-slate-700 font-medium">Start Time (PKT) *</Label>
                  <Input
                    type="time"
                    required
                    value={scheduleForm.startTime}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-700 font-medium">End Time (PKT) *</Label>
                  <Input
                    type="time"
                    required
                    value={scheduleForm.endTime}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                    className="mt-1 text-xs"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs text-slate-700 font-medium">Meeting URL (Google Meet / Zoom)</Label>
                <Input
                  type="url"
                  value={scheduleForm.meetingUrl}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, meetingUrl: e.target.value })}
                  placeholder="https://meet.google.com/xyz-abcd-efg"
                  className="mt-1 text-xs"
                />
              </div>

              <div>
                <Label className="text-xs text-slate-700 font-medium">Weekly Recurrence</Label>
                <select
                  value={scheduleForm.recurringWeeks}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, recurringWeeks: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-md text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#008DDA]"
                >
                  <option value={1}>Single Session Only (No recurrence)</option>
                  <option value={4}>Repeat weekly for 4 weeks (1 month)</option>
                  <option value={8}>Repeat weekly for 8 weeks (2 months)</option>
                  <option value={12}>Repeat weekly for 12 weeks (Full trimester)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowScheduleModal(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isScheduling}
                  className="bg-[#008DDA] hover:bg-[#0070b8] text-white text-xs font-medium"
                >
                  {isScheduling ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                  Schedule Session
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clash Detection & Override Confirmation Modal (Section E) */}
      {showClashModal && clashData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border border-amber-300 rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center gap-2 pb-3 border-b border-amber-200 text-amber-700">
              <ShieldAlert className="w-6 h-6 text-amber-600" />
              <h3 className="text-base font-bold">Schedule Clash Detected</h3>
            </div>

            <div className="my-4 space-y-3 text-xs">
              <p className="text-slate-700 font-medium">
                The requested session conflicts with an existing commitment:
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-900 space-y-1">
                <div className="font-semibold">{clashData.error}</div>
                {clashData.conflicts.map((c, i) => (
                  <div key={i} className="text-slate-600 mt-1 pl-2 border-l-2 border-amber-400">
                    &bull; {c.message || c}
                  </div>
                ))}
              </div>

              <div>
                <Label className="text-xs text-slate-700 font-medium">
                  Override Justification / Reason *
                </Label>
                <Input
                  type="text"
                  required
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g. Combined special session approved by Dean"
                  className="mt-1 text-xs"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  This override will be permanently logged in the academy CRM audit ledger.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowClashModal(false)}
                className="text-xs"
              >
                Cancel & Reschedule
              </Button>
              <Button
                type="button"
                disabled={isScheduling || !overrideReason.trim()}
                onClick={() => handleCreateSession(undefined, true)}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold"
              >
                {isScheduling ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                Confirm & Schedule Anyway
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Modal */}
      {showAttendanceModal && activeSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-xl max-w-xl w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-600" />
                  Mark Session Attendance
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeSession.title} &bull; {new Date(activeSession.session_date).toLocaleDateString()}
                </p>
              </div>
              <button onClick={() => setShowAttendanceModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 max-h-80 overflow-y-auto">
              {isAttendanceLoading ? (
                <div className="p-8 text-center text-slate-500">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#008DDA]" />
                  Loading enrolled students...
                </div>
              ) : attendanceRoster.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No active students enrolled in this session yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 text-xs">
                  {attendanceRoster.map((item, idx) => (
                    <div key={item.studentId || idx} className="py-2.5 flex items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold text-slate-900">{item.studentName}</div>
                        <div className="text-[11px] font-mono text-[#008DDA]">{item.studentNumber}</div>
                      </div>

                      <div className="flex items-center gap-1">
                        {["present", "absent", "late", "excused"].map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => {
                              const updated = [...attendanceRoster];
                              updated[idx].status = st;
                              setAttendanceRoster(updated);
                            }}
                            className={`px-2 py-1 rounded text-[11px] font-medium capitalize transition-colors ${
                              item.status === st
                                ? st === "present"
                                  ? "bg-emerald-600 text-white font-bold"
                                  : st === "absent"
                                  ? "bg-rose-600 text-white font-bold"
                                  : "bg-amber-600 text-white font-bold"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAttendanceModal(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={isSavingAttendance || attendanceRoster.length === 0}
                onClick={handleSaveAttendance}
                className="bg-[#008DDA] hover:bg-[#0070b8] text-white text-xs font-medium"
              >
                {isSavingAttendance ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                Save Attendance
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && selectedSessionToReschedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#008DDA]" />
                Reschedule Class Session
              </h3>
              <button onClick={() => setShowRescheduleModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleConfirmReschedule(false);
              }}
              className="space-y-4 mt-4 text-xs"
            >
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <p className="font-semibold text-slate-800">{selectedSessionToReschedule.title}</p>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Currently: {selectedSessionToReschedule.session_date} ({selectedSessionToReschedule.start_time} - {selectedSessionToReschedule.end_time})
                </p>
              </div>

              <div>
                <Label className="text-xs text-slate-700 font-medium">New Session Date *</Label>
                <Input
                  type="date"
                  required
                  value={rescheduleForm.sessionDate}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, sessionDate: e.target.value })}
                  className="mt-1 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-slate-700 font-medium">New Start Time (PKT) *</Label>
                  <Input
                    type="time"
                    required
                    value={rescheduleForm.startTime}
                    onChange={(e) => setRescheduleForm({ ...rescheduleForm, startTime: e.target.value })}
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-700 font-medium">New End Time (PKT) *</Label>
                  <Input
                    type="time"
                    required
                    value={rescheduleForm.endTime}
                    onChange={(e) => setRescheduleForm({ ...rescheduleForm, endTime: e.target.value })}
                    className="mt-1 text-xs"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs text-slate-700 font-medium">Reschedule Reason *</Label>
                <Input
                  required
                  placeholder="e.g. Instructor emergency or student requested slot change"
                  value={rescheduleForm.reason}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, reason: e.target.value })}
                  className="mt-1 text-xs"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Google Calendar event will be updated and reminders will be recalibrated.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowRescheduleModal(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isRescheduling}
                  className="bg-[#008DDA] hover:bg-[#0070b8] text-white text-xs font-medium"
                >
                  {isRescheduling ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                  Confirm Reschedule
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reschedule Clash Modal */}
      {showRescheduleClashModal && rescheduleClash && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border border-amber-300 rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center gap-2 pb-3 border-b border-amber-200 text-amber-700">
              <ShieldAlert className="w-6 h-6 text-amber-600" />
              <h3 className="text-base font-bold">Schedule Clash On Reschedule</h3>
            </div>

            <div className="my-4 space-y-3 text-xs">
              <p className="text-slate-700 font-medium">
                The new slot conflicts with an existing class or instructor commitment:
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-900 space-y-1">
                <div className="font-semibold">{rescheduleClash.error}</div>
                {rescheduleClash.conflicts.map((c: any, i: number) => (
                  <div key={i} className="text-slate-600 mt-1 pl-2 border-l-2 border-amber-400">
                    &bull; {c.message || c}
                  </div>
                ))}
              </div>

              <div>
                <Label className="text-xs text-slate-700 font-medium">
                  Override Justification / Reason *
                </Label>
                <Input
                  type="text"
                  required
                  value={rescheduleOverrideReason}
                  onChange={(e) => setRescheduleOverrideReason(e.target.value)}
                  placeholder="e.g. Approved clash override for special coaching"
                  className="mt-1 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowRescheduleClashModal(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={isRescheduling || !rescheduleOverrideReason.trim()}
                onClick={() => handleConfirmReschedule(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold"
              >
                {isRescheduling ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                Confirm & Override Clash
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Session Confirmation Modal */}
      {showCancelModal && selectedSessionToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border border-rose-200 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-rose-100">
              <h3 className="text-base font-bold text-rose-700 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-rose-600" />
                Cancel Class Session
              </h3>
              <button onClick={() => setShowCancelModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 space-y-3 text-xs">
              <p className="text-slate-700">
                Are you sure you want to cancel{" "}
                <span className="font-semibold text-slate-900">
                  {selectedSessionToCancel.title}
                </span>{" "}
                scheduled for {selectedSessionToCancel.session_date}?
              </p>
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-rose-800 text-[11px] space-y-1">
                <p className="font-semibold">Automated Cleanup Actions:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Marks class session as cancelled</li>
                  <li>Cancels Google Calendar event & Meet meeting</li>
                  <li>Cleans up all pending scheduled automated reminders</li>
                </ul>
              </div>

              <div>
                <Label className="text-xs text-slate-700 font-medium">Cancellation Reason *</Label>
                <Input
                  required
                  placeholder="e.g. Instructor illness, public holiday, or class rescheduled"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="mt-1 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCancelModal(false)}
                className="text-xs"
              >
                Keep Session
              </Button>
              <Button
                type="button"
                disabled={isCancelling || !cancelReason.trim()}
                onClick={handleConfirmCancel}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
              >
                {isCancelling ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                Confirm Cancellation
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
