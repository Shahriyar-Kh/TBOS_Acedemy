import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { adminNoIndexMeta } from "@/lib/seo";
import { useEffect, useState, useCallback } from "react";
import { useAdminAuth } from "@/lib/adminAuthContext";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Search,
  Filter,
  Clock,
  ShieldAlert,
  Loader2,
  Eye,
  X,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/audit")({
  head: () => ({ meta: adminNoIndexMeta("TBOS System Audit Logs") }),
  component: AdminAuditPage,
});

function AdminAuditPage() {
  const { admin, isLoading: authLoading, getAuthHeader } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !admin) {
      navigate({ to: "/admin/login" });
    }
  }, [admin, authLoading, navigate]);

  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterEntity, setFilterEntity] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterEntity !== "all") params.set("entity_type", filterEntity);
      params.set("limit", "100");

      const res = await fetch(`/api/admin/audit?${params.toString()}`, {
        headers: getAuthHeader(),
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      } else {
        toast.error("Failed to load audit logs");
      }
    } catch {
      toast.error("Network error loading audit logs");
    } finally {
      setIsLoading(false);
    }
  }, [filterEntity, getAuthHeader]);

  useEffect(() => {
    if (admin) {
      fetchLogs();
    }
  }, [fetchLogs, admin]);

  const filteredLogs = logs.filter((log) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const actor = log.actor_email?.toLowerCase() || "";
    const act = log.action?.toLowerCase() || "";
    const eid = log.entity_id?.toLowerCase() || "";
    return actor.includes(q) || act.includes(q) || eid.includes(q);
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-cyan-400" />
            Security & System Audit Trail
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Immutable log of all administrative actions, student enrollments, fee adjustments, and security events.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by actor, action, or ID..."
              className="pl-9 bg-slate-950 border-slate-800 text-white placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-400">Entity:</span>
            <select
              value={filterEntity}
              onChange={(e) => setFilterEntity(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-white rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="all">All Entities</option>
              <option value="student">Student</option>
              <option value="enrollment">Enrollment</option>
              <option value="batch">Cohort / Batch</option>
              <option value="invoice">Fee Invoice</option>
              <option value="payment">Fee Payment</option>
              <option value="timetable_session">Class Session</option>
              <option value="lead">Admissions Lead</option>
              <option value="admin_user">Staff User</option>
            </select>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="flex items-center justify-center p-12 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Loading audit logs...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center p-12 text-slate-400">
              <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-base font-medium text-slate-300">No audit records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/60 text-xs uppercase font-medium text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Entity</th>
                    <th className="py-3 px-4">Entity ID</th>
                    <th className="py-3 px-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 text-xs font-mono text-slate-400 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-medium text-white">{log.actor_email || "System"}</td>
                      <td className="py-3 px-4">
                        <Badge className="bg-slate-800 text-slate-300 border-slate-700 font-mono text-[11px]">
                          {log.action}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 capitalize text-slate-300">{log.entity_type}</td>
                      <td className="py-3 px-4 text-xs font-mono text-cyan-400">{log.entity_id || "—"}</td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedLog(log)}
                          className="h-7 text-xs text-slate-400 hover:text-white"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                Audit Record Details
              </h3>
              <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                <div>
                  <span className="text-slate-400 block">Actor:</span>
                  <span className="text-white font-medium">{selectedLog.actor_email || "System"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Action:</span>
                  <span className="text-cyan-400 font-mono">{selectedLog.action}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Entity Type:</span>
                  <span className="text-white capitalize">{selectedLog.entity_type}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Timestamp:</span>
                  <span className="text-slate-300">{new Date(selectedLog.created_at).toLocaleString()}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">State Mutation Payload:</span>
                <pre className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono text-cyan-300 max-h-60 overflow-y-auto">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-4 mt-4 border-t border-slate-800">
              <Button
                variant="outline"
                onClick={() => setSelectedLog(null)}
                className="border-slate-800 text-slate-300"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

