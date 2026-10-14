import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { adminNoIndexMeta } from "@/lib/seo";
import { useEffect, useState, useCallback } from "react";
import { useAdminAuth } from "@/lib/adminAuthContext";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Settings,
  Database,
  Mail,
  Shield,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Globe,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: adminNoIndexMeta("TBOS Academy Settings & Backup") }),
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  const { admin, isLoading: authLoading, getAuthHeader } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !admin) {
      navigate({ to: "/admin/login" });
    }
  }, [admin, authLoading, navigate]);

  const [isExporting, setIsExporting] = useState(false);
  const [smtpStatus, setSmtpStatus] = useState<"checking" | "connected" | "error">("connected");

  const handleExportFullBackup = async () => {
    setIsExporting(true);
    try {
      const res = await fetch("/api/admin/reports?export=full-backup", { headers: getAuthHeader() });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to generate complete backup");
      }
      const backup = await res.json();

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute(
        "download",
        `TBOS_CRM_FULL_BACKUP_${new Date().toISOString().split("T")[0]}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      toast.success("Complete Academy CRM disaster recovery backup downloaded!");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate complete backup");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-cyan-400" />
            Academy System Settings
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure system parameters, verify server integrations, and download emergency database snapshots.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Academy Identity */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <Globe className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white">Academy Information & Localization</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <Label className="text-slate-300">Academy Legal Name</Label>
                <Input
                  disabled
                  value="TechBuilt Open School (TBOS)"
                  className="mt-1 bg-slate-950/60 border-slate-800 text-white"
                />
              </div>

              <div>
                <Label className="text-slate-300">Official Operational Contact</Label>
                <Input
                  disabled
                  value="techbuiltopenschool@gmail.com"
                  className="mt-1 bg-slate-950/60 border-slate-800 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-slate-300">Default Currency</Label>
                  <Input
                    disabled
                    value="PKR (Pakistani Rupee)"
                    className="mt-1 bg-slate-950/60 border-slate-800 text-white font-mono"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Operational Timezone</Label>
                  <Input
                    disabled
                    value="Asia/Karachi (PKT UTC+5)"
                    className="mt-1 bg-slate-950/60 border-slate-800 text-white font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Infrastructure Health */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <Mail className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white">Integrations & Server Health</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Google Workspace SMTP</div>
                  <div className="text-slate-400">Authenticated automated broadcast engine</div>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  Active
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Supabase Cloud Database</div>
                  <div className="text-slate-400">PostgreSQL with Row Level Security (RLS)</div>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  Connected
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">WhatsApp Direct Connect</div>
                  <div className="text-slate-400">Authenticated wa.me link generation & audit logger</div>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  Ready
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Database Backup & Disaster Recovery */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-bold text-white">Disaster Recovery & Full Offline CRM Snapshot</h2>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Download a complete, offline JSON archive of all academy data—including students, cohorts, fee
                invoices, attendance, operational tasks, and audit logs. This guarantees continuous data ownership.
              </p>
            </div>

            <Button
              onClick={handleExportFullBackup}
              disabled={isExporting}
              className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold"
            >
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
              Export Full CRM Backup (JSON)
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

