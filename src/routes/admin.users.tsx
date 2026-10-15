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
  Shield,
  UserPlus,
  Mail,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  UserCheck,
  Crown,
  KeyRound,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: adminNoIndexMeta("TBOS Admin & Staff Users") }),
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const { admin, isLoading: authLoading, getAuthHeader } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !admin) {
      navigate({ to: "/admin/login" });
    }
  }, [admin, authLoading, navigate]);

  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Invite Modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: "",
    fullName: "",
    role: "admin",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/users", { headers: getAuthHeader() });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      } else {
        toast.error("Failed to load staff list");
      }
    } catch {
      toast.error("Network error loading staff");
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeader]);

  useEffect(() => {
    if (admin) {
      fetchUsers();
    }
  }, [fetchUsers, admin]);

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.email.trim() || !inviteForm.fullName.trim()) {
      toast.error("Please fill in email and full name");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({
          action: "invite-user",
          email: inviteForm.email.trim().toLowerCase(),
          fullName: inviteForm.fullName.trim(),
          role: inviteForm.role,
        }),
      });
      const data = await res.json();
      if (res.ok && (data.ok || data.success)) {
        toast.success(`Invitation sent to ${inviteForm.email} with role: ${inviteForm.role}!`);
        setShowInviteModal(false);
        setInviteForm({ email: "", fullName: "", role: "admin" });
        fetchUsers();
      } else {
        toast.error(data.error || "Failed to invite user");
      }
    } catch {
      toast.error("Network error inviting user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({
          action: "update-user",
          userId,
          role: newRole,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("User role updated");
        fetchUsers();
      } else {
        toast.error(data.error || "Failed to update role");
      }
    } catch {
      toast.error("Network error updating role");
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "owner":
        return (
          <Badge className="bg-purple-500/15 text-purple-400 border-purple-500/30 flex items-center gap-1 font-semibold">
            <Crown className="w-3 h-3" /> Owner
          </Badge>
        );
      case "admin":
        return <Badge className="bg-cyan-500/15 text-cyan-400 border-cyan-500/30">Admin</Badge>;
      case "admissions":
        return <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/30">Admissions</Badge>;
      case "instructor":
        return <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30">Instructor</Badge>;
      case "accountant":
        return <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30">Accountant</Badge>;
      default:
        return <Badge className="bg-slate-500/15 text-slate-400">{role}</Badge>;
    }
  };

  return (
    <AdminLayout
      title="Staff & Role-Based Access Control"
      description="Manage authorized administrative operators, instructors, finance accountants, and ownership transitions."
      onRefresh={fetchUsers}
      isRefreshing={isLoading}
      actions={
        <Button
          onClick={() => setShowInviteModal(true)}
          className="bg-sky-600 hover:bg-sky-700 text-white font-medium text-xs shadow-sm"
        >
          <UserPlus className="w-3.5 h-3.5 mr-1.5" />
          Provision Staff User
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Ownership Transition Banner */}
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
          <Crown className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
          <div className="text-xs text-purple-900">
            <span className="font-bold text-purple-950">Owner Account Transition Policy (Section 15):</span>
            <p className="mt-1 text-purple-800">
              TBOS operates a zero-lockout dual-owner protocol. The primary owner{" "}
              <strong className="text-purple-950">shahriyarkhanpk1@gmail.com</strong> and official academy owner{" "}
              <strong className="text-purple-950">techbuiltopenschool@gmail.com</strong> are preserved side-by-side. Existing
              owners are never auto-demoted or deleted.
            </p>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="flex items-center justify-center p-12 text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin text-sky-600 mr-2" />
              Loading staff accounts...
            </div>
          ) : users.length === 0 ? (
            <div className="text-center p-12 text-slate-400">
              <Shield className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <p className="text-base font-semibold text-slate-700">No admin users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[11px] uppercase font-semibold text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Last Login</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{u.full_name || "Staff Member"}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                      </td>
                      <td className="py-3 px-4">{getRoleBadge(u.role)}</td>
                      <td className="py-3 px-4">
                        <Badge
                          className={`font-semibold ${
                            u.is_active !== false
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-slate-100 text-slate-500 border-slate-200"
                          }`}
                        >
                          {u.is_active !== false ? "Active" : "Disabled"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500">
                        {u.last_login_at ? new Date(u.last_login_at).toLocaleString() : "Never"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {admin?.role === "owner" && (
                          <select
                            value={u.role}
                            onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                            disabled={u.email === admin.email && u.role === "owner"}
                            className="bg-white border border-slate-300 text-xs text-slate-800 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-sky-500"
                          >
                            <option value="owner">Owner</option>
                            <option value="admin">Admin</option>
                            <option value="admissions">Admissions</option>
                            <option value="instructor">Instructor</option>
                            <option value="accountant">Accountant</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-sky-600" />
                Provision Staff Account
              </h3>
              <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInviteUser} className="space-y-4 mt-4">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Staff Full Name *</Label>
                <Input
                  required
                  value={inviteForm.fullName}
                  onChange={(e) => setInviteForm({ ...inviteForm, fullName: e.target.value })}
                  placeholder="e.g. Academy Operations Manager"
                  className="mt-1 bg-white border-slate-300 text-slate-900 text-xs"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Email Address *</Label>
                <Input
                  type="email"
                  required
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  placeholder="e.g. techbuiltopenschool@gmail.com"
                  className="mt-1 bg-white border-slate-300 text-slate-900 text-xs"
                />
                {inviteForm.email.toLowerCase().includes("techbuiltopenschool") && (
                  <p className="text-[11px] text-sky-600 mt-1 font-medium">
                    Designated official academy account. Select "Owner" role below to enable co-ownership.
                  </p>
                )}
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Access Role *</Label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-white border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                >
                  <option value="owner">Owner (Full Superuser & System Transition)</option>
                  <option value="admin">Admin (All Modules except Owner Management)</option>
                  <option value="admissions">Admissions (Leads, Enrollments & Students)</option>
                  <option value="instructor">Instructor (Timetable & Attendance only)</option>
                  <option value="accountant">Accountant (Fees, Receipts & Reports only)</option>
                </select>
              </div>

              <div className="bg-sky-50 border border-sky-200 rounded-lg p-3 text-xs text-sky-900 flex items-start gap-2.5">
                <KeyRound className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-sky-950">Secure Token Invitation:</span>
                  <p className="mt-0.5 text-sky-800 text-[11px]">
                    A cryptographic invitation token (valid for 48 hours) will be generated and dispatched. The recipient will securely establish their own administrative password.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowInviteModal(false)}
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  size="sm"
                  className="bg-sky-600 hover:bg-sky-700 text-white font-medium text-xs shadow-sm"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                  Provision User
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

