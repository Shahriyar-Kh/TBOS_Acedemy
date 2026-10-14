import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { adminNoIndexMeta } from "@/lib/seo";
import { useEffect, useState, useCallback } from "react";
import { useAdminAuth } from "@/lib/adminAuthContext";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Download,
  Users,
  CreditCard,
  UserCheck,
  TrendingUp,
  FileSpreadsheet,
  Loader2,
  Calendar,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({ meta: adminNoIndexMeta("TBOS Academy Reports & Analytics") }),
  component: AdminReportsPage,
});

function AdminReportsPage() {
  const { admin, isLoading: authLoading, getAuthHeader } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !admin) {
      navigate({ to: "/admin/login" });
    }
  }, [admin, authLoading, navigate]);

  const [metrics, setMetrics] = useState({
    totalStudents: 0,
    activeStudents: 0,
    totalLeads: 0,
    conversionRate: 0,
    totalInvoiced: 0,
    totalCollected: 0,
    collectionRate: 0,
    totalSessions: 0,
    attendanceRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingExport, setDownloadingExport] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/reports?type=summary", { headers: getAuthHeader() });
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics || {});
      }
    } catch {
      toast.error("Failed to load analytics summary");
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeader]);

  useEffect(() => {
    if (admin) {
      fetchSummary();
    }
  }, [fetchSummary, admin]);

  const handleDownloadCsv = async (exportType: "students" | "fees" | "admissions" | "attendance") => {
    setDownloadingExport(exportType);
    try {
      const res = await fetch(`/api/admin/reports?type=${exportType}`, { headers: getAuthHeader() });
      if (res.ok) {
        const data = await res.json();
        const rows = data.exportData || [];
        if (rows.length === 0) {
          toast.info("No records found for this export");
          return;
        }

        // Build CSV string
        const headers = Object.keys(rows[0]);
        const csvContent =
          "data:text/csv;charset=utf-8," +
          [
            headers.join(","),
            ...rows.map((r: any) =>
              headers
                .map((h) => {
                  const val = r[h] === null || r[h] === undefined ? "" : String(r[h]).replace(/"/g, '""');
                  return `"${val}"`;
                })
                .join(",")
            ),
          ].join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${exportType}-${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`Exported ${exportType} CSV successfully!`);
      } else {
        toast.error("Failed to generate report export");
      }
    } catch {
      toast.error("Error downloading CSV report");
    } finally {
      setDownloadingExport(null);
    }
  };

  return (
    <AdminLayout
      title="Academy Reports & Intelligence"
      description="Real-time conversion metrics, tuition cash flow, attendance statistics, and verified CSV exports."
      onRefresh={fetchSummary}
      isRefreshing={isLoading}
    >
      <div className="space-y-6">
        {/* Analytics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Lead Conversion</span>
              <TrendingUp className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">{metrics.conversionRate}%</div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-sky-600 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, metrics.conversionRate)}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {metrics.totalStudents} enrolled from {metrics.totalLeads} total admissions leads
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tuition Collection</span>
              <CreditCard className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-700 mt-2">{metrics.collectionRate}%</div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, metrics.collectionRate)}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              PKR {metrics.totalCollected.toLocaleString()} of PKR {metrics.totalInvoiced.toLocaleString()} collected
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Attendance Rate</span>
              <UserCheck className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">{metrics.attendanceRate}%</div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, metrics.attendanceRate)}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">Across {metrics.totalSessions} live batch class sessions</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Enrollment</span>
              <Users className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">{metrics.activeStudents}</div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all"
                style={{
                  width: `${metrics.totalStudents > 0 ? (metrics.activeStudents / metrics.totalStudents) * 100 : 0}%`,
                }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">Currently participating in ongoing live cohorts</p>
          </div>
        </div>

        {/* Export Center */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <FileSpreadsheet className="w-5 h-5 text-sky-600" />
            <h2 className="text-base font-bold text-slate-900">One-Click CSV Data Exports</h2>
          </div>
          <p className="text-xs text-slate-500 mb-6">
            Export production datasets for official academy compliance, accounting reconciliation, and student roster records.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">Full Student Roster</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Complete database of all registered students with contact info, enrolled batches, and status.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownloadCsv("students")}
                disabled={downloadingExport === "students"}
                className="mt-4 border-slate-300 hover:bg-slate-100 text-slate-700 text-xs"
              >
                {downloadingExport === "students" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                ) : (
                  <Download className="w-3.5 h-3.5 mr-1.5 text-sky-600" />
                )}
                Export Roster CSV
              </Button>
            </div>

            <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">Tuition & Fee Ledger</h3>
                <p className="text-xs text-slate-500 mt-1">
                  All billable invoices, recorded payments, remaining balances, and due dates in PKR.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownloadCsv("fees")}
                disabled={downloadingExport === "fees"}
                className="mt-4 border-slate-300 hover:bg-slate-100 text-slate-700 text-xs"
              >
                {downloadingExport === "fees" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                ) : (
                  <Download className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                )}
                Export Fee Ledger CSV
              </Button>
            </div>

            <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">Admissions Funnel</h3>
                <p className="text-xs text-slate-500 mt-1">
                  All inbound admission inquiries, lead scores, marketing UTM sources, and pipeline status.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownloadCsv("admissions")}
                disabled={downloadingExport === "admissions"}
                className="mt-4 border-slate-300 hover:bg-slate-100 text-slate-700 text-xs"
              >
                {downloadingExport === "admissions" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                ) : (
                  <Download className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                )}
                Export Leads CSV
              </Button>
            </div>

            <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">Class Attendance Log</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Session-by-session student presence, absence, and punctuality records across all batches.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownloadCsv("attendance")}
                disabled={downloadingExport === "attendance"}
                className="mt-4 border-slate-300 hover:bg-slate-100 text-slate-700 text-xs"
              >
                {downloadingExport === "attendance" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                ) : (
                  <Download className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                )}
                Export Attendance CSV
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

