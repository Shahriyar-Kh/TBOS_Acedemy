import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { adminNoIndexMeta } from "@/lib/seo";
import { useEffect, useState, useCallback } from "react";
import { useAdminAuth } from "@/lib/adminAuthContext";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  UserPlus,
  Video,
  Users,
  Layers,
  Calendar,
  CreditCard,
  AlertCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  ExternalLink,
  Loader2,
  DollarSign,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({ meta: adminNoIndexMeta("TBOS Admin Dashboard") }),
  component: AdminDashboardPage,
});

interface DashboardStats {
  newLeads: number;
  demoRequests: number;
  scheduledDemos: number;
  activeStudents: number;
  activeBatches: number;
  todayClasses: number;
  feesDue: number;
  overduePayments: number;
  followUpsDue: number;
}

function AdminDashboardPage() {
  const { admin, isLoading: authLoading, getAuthHeader } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !admin) {
      navigate({ to: "/admin/login" });
    }
  }, [admin, authLoading, navigate]);

  const [stats, setStats] = useState<DashboardStats>({
    newLeads: 0,
    demoRequests: 0,
    scheduledDemos: 0,
    activeStudents: 0,
    activeBatches: 0,
    todayClasses: 0,
    feesDue: 0,
    overduePayments: 0,
    followUpsDue: 0,
  });

  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [todayClasses, setTodayClasses] = useState<any[]>([]);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [pendingTasks, setPendingTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [leadsRes, studentsRes, batchesRes, feesRes, timetableRes, tasksRes] =
        await Promise.all([
          fetch("/api/admin/admissions?limit=6", { headers: getAuthHeader() }),
          fetch("/api/admin/students?limit=1", { headers: getAuthHeader() }),
          fetch("/api/admin/batches?status=active", { headers: getAuthHeader() }),
          fetch("/api/admin/fees", { headers: getAuthHeader() }),
          fetch("/api/admin/timetable", { headers: getAuthHeader() }),
          fetch("/api/admin/tasks?status=pending", { headers: getAuthHeader() }),
        ]);

      if (leadsRes.ok) {
        const data = await leadsRes.json();
        setRecentLeads(data.admissions || []);
        setStats((prev) => ({
          ...prev,
          newLeads: data.stats?.newRequests || 0,
          demoRequests: data.stats?.demoRequests || 0,
          scheduledDemos: data.stats?.scheduledDemos || 0,
          followUpsDue: data.stats?.followUpsDue || 0,
        }));
      }

      if (studentsRes.ok) {
        const data = await studentsRes.json();
        setStats((prev) => ({
          ...prev,
          activeStudents: data.stats?.active || 0,
        }));
      }

      if (batchesRes.ok) {
        const data = await batchesRes.json();
        setStats((prev) => ({
          ...prev,
          activeBatches: (data.batches || []).length,
        }));
      }

      if (feesRes.ok) {
        const data = await feesRes.json();
        setRecentPayments(data.payments?.slice(0, 5) || []);
        setStats((prev) => ({
          ...prev,
          feesDue: data.stats?.totalInvoiced ?? data.stats?.expectedRevenue ?? 0,
          overduePayments: data.stats?.overdueCount || 0,
        }));
      }

      if (timetableRes.ok) {
        const data = await timetableRes.json();
        setTodayClasses(data.todaySessions || []);
        setStats((prev) => ({
          ...prev,
          todayClasses: (data.todaySessions || []).length,
        }));
      }

      if (tasksRes.ok) {
        const data = await tasksRes.json();
        setPendingTasks((data.tasks || []).slice(0, 5));
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      toast.error("Failed to refresh dashboard data");
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeader]);

  useEffect(() => {
    if (admin) {
      loadDashboardData();
    }
  }, [admin, loadDashboardData]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070F2B]">
        <Loader2 className="h-8 w-8 animate-spin text-[#008DDA]" />
      </div>
    );
  }

  return (
    <AdminLayout
      title="Operations Dashboard"
      description={`Welcome back, ${admin?.email}. Live overview of TBOS Academy admissions, students, and timetable.`}
      onRefresh={loadDashboardData}
      isRefreshing={isLoading}
      actions={
        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="bg-sky-600 hover:bg-sky-700 text-white gap-1.5 text-xs font-medium shadow-sm">
            <Link to="/admin/students">
              <UserPlus className="h-3.5 w-3.5" /> Add Student
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50 gap-1.5 text-xs font-medium">
            <Link to="/admin/timetable">
              <Calendar className="h-3.5 w-3.5" /> Schedule Class
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50 gap-1.5 text-xs font-medium">
            <Link to="/admin/fees">
              <CreditCard className="h-3.5 w-3.5" /> Record Payment
            </Link>
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8">
          <div className="rounded-xl border border-blue-100 bg-white p-3.5 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center justify-between text-xs font-semibold text-blue-600">
              <span>New Leads</span>
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">{stats.newLeads}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Awaiting review</div>
          </div>

          <div className="rounded-xl border border-purple-100 bg-white p-3.5 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center justify-between text-xs font-semibold text-purple-600">
              <span>Demo Requests</span>
              <Video className="h-4 w-4 text-purple-400" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">{stats.demoRequests}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Pipeline total</div>
          </div>

          <div className="rounded-xl border border-cyan-100 bg-white p-3.5 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center justify-between text-xs font-semibold text-cyan-600">
              <span>Demos Booked</span>
              <Calendar className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">{stats.scheduledDemos}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Upcoming trials</div>
          </div>

          <div className="rounded-xl border border-emerald-100 bg-white p-3.5 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-600">
              <span>Active Students</span>
              <Users className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">{stats.activeStudents}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Currently enrolled</div>
          </div>

          <div className="rounded-xl border border-indigo-100 bg-white p-3.5 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center justify-between text-xs font-semibold text-indigo-600">
              <span>Active Batches</span>
              <Layers className="h-4 w-4 text-indigo-400" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">{stats.activeBatches}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Live cohorts</div>
          </div>

          <div className="rounded-xl border border-amber-100 bg-white p-3.5 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center justify-between text-xs font-semibold text-amber-600">
              <span>Today's Classes</span>
              <Clock className="h-4 w-4 text-amber-400" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">{stats.todayClasses}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">On timetable</div>
          </div>

          <div className="rounded-xl border border-teal-100 bg-white p-3.5 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center justify-between text-xs font-semibold text-teal-600">
              <span>Fees Due</span>
              <DollarSign className="h-4 w-4 text-teal-400" />
            </div>
            <div className="mt-2 text-xl font-bold text-slate-900 truncate">
              PKR {stats.feesDue.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">This month</div>
          </div>

          <div className="rounded-xl border border-rose-100 bg-white p-3.5 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center justify-between text-xs font-semibold text-rose-600">
              <span>Overdue Fees</span>
              <AlertCircle className="h-4 w-4 text-rose-400" />
            </div>
            <div className="mt-2 text-2xl font-bold text-rose-600">{stats.overduePayments}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Unpaid invoices</div>
          </div>
        </div>

        {/* 2-Column Operational Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Today's Classes & Pending Tasks */}
          <div className="space-y-6">
            {/* Today's Timetable */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 grid place-items-center">
                    <Clock className="h-4 w-4" />
                  </div>
                  <h2 className="font-bold text-sm text-slate-900">Today's Class Schedule</h2>
                </div>
                <Link to="/admin/timetable" className="text-xs text-sky-600 hover:underline flex items-center gap-1 font-medium">
                  Full timetable <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              {todayClasses.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No classes scheduled for today.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {todayClasses.map((cls) => (
                    <div key={cls.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-semibold text-xs text-slate-900 truncate">{cls.title}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {cls.start_time} - {cls.end_time} · {cls.instructor_name || "TBOS Mentor"}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {cls.meeting_link && (
                          <Button asChild size="sm" variant="outline" className="h-7 px-2.5 text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50">
                            <a href={cls.meeting_link} target="_blank" rel="noreferrer">
                              <Video className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Join Meet
                            </a>
                          </Button>
                        )}
                        <Badge variant="outline" className="text-[10px] uppercase font-mono">
                          {cls.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Admin Follow-ups & Tasks */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-orange-50 text-orange-600 grid place-items-center">
                    <AlertCircle className="h-4 w-4" />
                  </div>
                  <h2 className="font-bold text-sm text-slate-900">Pending Tasks & Follow-ups</h2>
                </div>
                <Link to="/admin/tasks" className="text-xs text-[#008DDA] hover:underline flex items-center gap-1 font-medium">
                  Manage tasks <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              {pendingTasks.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  All tasks are up to date. Excellent work!
                </div>
              ) : (
                <div className="space-y-2">
                  {pendingTasks.map((t) => (
                    <div key={t.id} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-slate-900">{t.title}</span>
                        {t.description && <p className="text-[11px] text-slate-500 truncate max-w-xs">{t.description}</p>}
                      </div>
                      <Badge
                        variant={t.priority === "urgent" || t.priority === "high" ? "destructive" : "secondary"}
                        className="text-[10px] uppercase"
                      >
                        {t.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Recent Admissions & Fee Collection */}
          <div className="space-y-6">
            {/* Recent Admissions Leads */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-cyan-50 text-cyan-600 grid place-items-center">
                    <UserPlus className="h-4 w-4" />
                  </div>
                  <h2 className="font-bold text-sm text-slate-900">Recent Applications & Leads</h2>
                </div>
                <Link to="/admin/admissions" className="text-xs text-[#008DDA] hover:underline flex items-center gap-1 font-medium">
                  All admissions <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              {recentLeads.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No admission records found.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentLeads.map((lead) => (
                    <div key={lead.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="truncate mr-3">
                        <div className="font-semibold text-slate-900 truncate">{lead.student_name}</div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {lead.selected_program_title} · {lead.phone}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] uppercase font-mono shrink-0">
                        {lead.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Payments Recorded */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 grid place-items-center">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <h2 className="font-bold text-sm text-slate-900">Recent Fee Payments</h2>
                </div>
                <Link to="/admin/fees" className="text-xs text-[#008DDA] hover:underline flex items-center gap-1 font-medium">
                  Ledger <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              {recentPayments.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No recent payment records.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentPayments.map((pay) => (
                    <div key={pay.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-slate-900">{pay.students?.full_name || "Student"}</div>
                        <div className="text-[11px] text-slate-500">
                          {pay.payment_date} · {pay.payment_method?.replace("_", " ").toUpperCase()}
                        </div>
                      </div>
                      <span className="font-bold text-emerald-600 font-mono">
                        +PKR {Number(pay.amount).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

