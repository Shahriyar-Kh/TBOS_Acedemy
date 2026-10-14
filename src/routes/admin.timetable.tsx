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
  Search,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Loader2,
  X,
  Users,
} from "lucide-react";
import { toast } from "sonner";

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
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);
  const [isCheckingConflict, setIsCheckingConflict] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);

  // Attendance Modal State
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [activeSession, setActiveSession] = useState<any | null>(null);
  const [attendanceRoster, setAttendanceRoster] = useState<any[]>([]);
  const [isAttendanceLoading, setIsAttendanceLoading] = useState(false);
  const [isSavingAttendance, setIsSavingAttendance] = useState(false);

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
    try {
      const params = new URLSearchParams();
      if (filterBatch !== "all") params.set("batch_id", filterBatch);
      params.set("limit", "100");

      const res = await fetch(`/api/admin/timetable?${params.toString()}`, {
        headers: getAuthHeader(),
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      } else {
        toast.error("Failed to load timetable sessions");
      }
    } catch {
      toast.error("Network error loading timetable");
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

  // Check Schedule Conflicts
  const checkConflicts = async () => {
    if (!scheduleForm.batchId || !scheduleForm.sessionDate || !scheduleForm.startTime || !scheduleForm.endTime) {
      return;
    }
    setIsCheckingConflict(true);
    setConflictWarning(null);
    try {
      const res = await fetch("/api/admin/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({
          action: "check-conflicts",
          batchId: scheduleForm.batchId,
          instructorId: scheduleForm.instructorId || scheduleForm.instructorName,
          sessionDate: scheduleForm.sessionDate,
          startTime: scheduleForm.startTime,
          endTime: scheduleForm.endTime,
        }),
      });
      const data = await res.json();
      if (data.hasConflict) {
        setConflictWarning(data.conflicts[0] || "Schedule conflict detected with another class!");
      }
    } catch {
      // ignore
    } finally {
      setIsCheckingConflict(false);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsScheduling(true);
    try {
      const res = await fetch("/api/admin/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({
          action: "create-session",
          batchId: scheduleForm.batchId,
          instructorId: scheduleForm.instructorId || scheduleForm.instructorName,
          instructorName: scheduleForm.instructorName,
          title: scheduleForm.title,
          sessionDate: scheduleForm.sessionDate,
          startTime: scheduleForm.startTime,
          endTime: scheduleForm.endTime,
          meetingUrl: scheduleForm.meetingUrl,
          notes: scheduleForm.notes,
          recurringWeeks: Number(scheduleForm.recurringWeeks) || 1,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(
          data.recurringCount > 1
            ? `Successfully scheduled ${data.recurringCount} weekly classes!`
            : "Class session scheduled successfully!"
        );
        setShowScheduleModal(false);
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

  const openAttendanceModal = async (session: any) => {
    setActiveSession(session);
    setShowAttendanceModal(true);
    setIsAttendanceLoading(true);
    try {
      // Fetch batch enrollments to populate student list
      const res = await fetch(`/api/admin/batches/${session.batch_id}`, {
        headers: getAuthHeader(),
      });
      if (res.ok) {
        const data = await res.json();
        const enrollments = data.batch?.enrollments || [];
        // Map students with default 'present'
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
      const res = await fetch(`/api/admin/timetable/${activeSession.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({
          action: "record-attendance",
          records: attendanceRoster.map((r) => ({
            studentId: r.studentId,
            status: r.status,
            notes: r.notes,
          })),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <CalendarIcon className="w-6 h-6 text-cyan-400" />
              Timetable & Class Schedule
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Manage live sessions, automated recurrence, Google Meet / Zoom links, and student attendance.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setConflictWarning(null);
                setShowScheduleModal(true);
              }}
              className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-medium"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Schedule Class
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Label className="text-xs text-slate-400 whitespace-nowrap">Filter Cohort:</Label>
            <select
              value={filterBatch}
              onChange={(e) => setFilterBatch(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-sm text-white rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="all">All Live Batches</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.batch_code})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={viewMode === "list" ? "default" : "outline"}
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "bg-cyan-500 text-slate-950 font-medium" : "border-slate-800 text-slate-300"}
            >
              List View
            </Button>
            <Button
              size="sm"
              variant={viewMode === "calendar" ? "default" : "outline"}
              onClick={() => setViewMode("calendar")}
              className={viewMode === "calendar" ? "bg-cyan-500 text-slate-950 font-medium" : "border-slate-800 text-slate-300"}
            >
              Calendar View
            </Button>
          </div>
        </div>

        {/* Sessions List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center p-12 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Loading schedule...
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center p-12 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-400">
              <CalendarIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-base font-medium text-slate-300">No scheduled classes found</p>
              <p className="text-xs text-slate-400 mt-1">Click "Schedule Class" above to set up upcoming lectures.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sessions.map((sess) => (
                <div
                  key={sess.id}
                  className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-xs font-mono font-medium text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded">
                        {sess.batches?.name || "Batch Session"}
                      </span>
                      <Badge
                        className={
                          sess.status === "completed"
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                            : sess.status === "cancelled"
                            ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                            : "bg-blue-500/15 text-blue-400 border-blue-500/30"
                        }
                      >
                        {sess.status}
                      </Badge>
                    </div>

                    <h3 className="font-semibold text-white text-base line-clamp-1">{sess.title}</h3>

                    <div className="space-y-1.5 mt-3 text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(sess.session_date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</span>
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

                  <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                    {sess.meeting_url ? (
                      <a
                        href={sess.meeting_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                      >
                        <Video className="w-3.5 h-3.5" />
                        Join Class
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">No meeting URL</span>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openAttendanceModal(sess)}
                      className="h-7 text-xs border-slate-700 text-slate-200 hover:bg-slate-800"
                    >
                      <UserCheck className="w-3 h-3 mr-1 text-emerald-400" />
                      Attendance
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Schedule Class Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-cyan-400" />
                Schedule Class Session
              </h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-4 mt-4">
              <div>
                <Label className="text-xs text-slate-300">Select Cohort / Batch *</Label>
                <select
                  required
                  value={scheduleForm.batchId}
                  onChange={(e) => {
                    setScheduleForm({ ...scheduleForm, batchId: e.target.value });
                    checkConflicts();
                  }}
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="">Select a batch...</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.batch_code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs text-slate-300">Session Topic / Title *</Label>
                <Input
                  required
                  value={scheduleForm.title}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                  placeholder="e.g. Week 2: Python Object-Oriented Programming"
                  className="mt-1 bg-slate-950 border-slate-800 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-slate-300">Instructor Name *</Label>
                  <Input
                    required
                    value={scheduleForm.instructorName}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, instructorName: e.target.value })}
                    className="mt-1 bg-slate-950 border-slate-800 text-white"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-300">Session Date *</Label>
                  <Input
                    type="date"
                    required
                    value={scheduleForm.sessionDate}
                    onChange={(e) => {
                      setScheduleForm({ ...scheduleForm, sessionDate: e.target.value });
                      checkConflicts();
                    }}
                    className="mt-1 bg-slate-950 border-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-slate-300">Start Time (PKT) *</Label>
                  <Input
                    type="time"
                    required
                    value={scheduleForm.startTime}
                    onChange={(e) => {
                      setScheduleForm({ ...scheduleForm, startTime: e.target.value });
                      checkConflicts();
                    }}
                    className="mt-1 bg-slate-950 border-slate-800 text-white"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-300">End Time (PKT) *</Label>
                  <Input
                    type="time"
                    required
                    value={scheduleForm.endTime}
                    onChange={(e) => {
                      setScheduleForm({ ...scheduleForm, endTime: e.target.value });
                      checkConflicts();
                    }}
                    className="mt-1 bg-slate-950 border-slate-800 text-white"
                  />
                </div>
              </div>

              {/* Conflict warning banner */}
              {conflictWarning && (
                <div className="p-3 bg-amber-500/15 border border-amber-500/40 rounded-lg flex items-start gap-2 text-xs text-amber-300">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Schedule Clash Warning:</span> {conflictWarning}
                  </div>
                </div>
              )}

              <div>
                <Label className="text-xs text-slate-300">Meeting URL (Google Meet / Zoom)</Label>
                <Input
                  type="url"
                  value={scheduleForm.meetingUrl}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, meetingUrl: e.target.value })}
                  placeholder="https://meet.google.com/xyz-abcd-efg"
                  className="mt-1 bg-slate-950 border-slate-800 text-white"
                />
              </div>

              <div>
                <Label className="text-xs text-slate-300">Weekly Recurrence</Label>
                <select
                  value={scheduleForm.recurringWeeks}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, recurringWeeks: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  <option value={1}>Single Session Only (No recurrence)</option>
                  <option value={4}>Repeat weekly for 4 weeks (1 month)</option>
                  <option value={8}>Repeat weekly for 8 weeks (2 months)</option>
                  <option value={12}>Repeat weekly for 12 weeks (Full trimester)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowScheduleModal(false)}
                  className="border-slate-800 text-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isScheduling}
                  className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-medium"
                >
                  {isScheduling ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Schedule Session
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attendance Modal */}
      {showAttendanceModal && activeSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-400" />
                  Mark Attendance
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {activeSession.title} &bull; {new Date(activeSession.session_date).toLocaleDateString()}
                </p>
              </div>
              <button onClick={() => setShowAttendanceModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 max-h-96 overflow-y-auto">
              {isAttendanceLoading ? (
                <div className="p-8 text-center text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                  Loading enrolled students...
                </div>
              ) : attendanceRoster.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  No active students enrolled in this batch yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-800/60">
                  {attendanceRoster.map((item, idx) => (
                    <div key={item.studentId || idx} className="py-3 flex items-center justify-between gap-3">
                      <div>
                        <div className="font-medium text-white text-sm">{item.studentName}</div>
                        <div className="text-xs font-mono text-cyan-400">{item.studentNumber}</div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {["present", "absent", "late", "excused"].map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => {
                              const updated = [...attendanceRoster];
                              updated[idx].status = st;
                              setAttendanceRoster(updated);
                            }}
                            className={`px-2.5 py-1 text-xs rounded font-medium capitalize transition-colors ${
                              item.status === st
                                ? st === "present"
                                  ? "bg-emerald-500 text-slate-950 font-bold"
                                  : st === "absent"
                                  ? "bg-rose-500 text-white font-bold"
                                  : st === "late"
                                  ? "bg-amber-500 text-slate-950 font-bold"
                                  : "bg-blue-500 text-white font-bold"
                                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
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

            <div className="flex justify-between items-center pt-3 border-t border-slate-800">
              <span className="text-xs text-slate-400">{attendanceRoster.length} students on roster</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAttendanceModal(false)}
                  className="border-slate-800 text-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveAttendance}
                  disabled={isSavingAttendance || attendanceRoster.length === 0}
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-medium"
                >
                  {isSavingAttendance ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Save Attendance
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

