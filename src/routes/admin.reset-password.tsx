import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { adminNoIndexMeta } from "@/lib/seo";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, ArrowLeft, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/reset-password")({
  head: () => ({ meta: adminNoIndexMeta("TBOS Set New Password") }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();

  // Extract token from query params safely
  const searchParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Invalid or missing password reset token");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/auth/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "confirm-reset",
          token,
          newPassword: password,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsSuccess(true);
        toast.success("Password updated successfully!");
      } else {
        toast.error(data.error || "Failed to reset password. Link may have expired.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Choose New Password</h2>
          <p className="mt-2 text-xs text-slate-400 max-w-xs mx-auto">
            Create a secure password for your TBOS administrative access account.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-slate-900/80 backdrop-blur-md py-8 px-4 shadow-xl border border-slate-800 sm:rounded-2xl sm:px-10">
            {isSuccess ? (
              <div className="text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">Password Updated</h3>
                <p className="text-xs text-slate-400">
                  Your new credentials have been safely committed. You may now sign in to the TBOS Academy CRM.
                </p>
                <div className="pt-4">
                  <Link
                    to="/admin/login"
                    className="inline-flex items-center justify-center w-full px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold rounded-lg text-sm"
                  >
                    Proceed to Staff Login
                  </Link>
                </div>
              </div>
            ) : !token ? (
              <div className="text-center space-y-3">
                <p className="text-xs text-rose-400">
                  No reset token provided. Please request a new password reset link.
                </p>
                <Link
                  to="/admin/forgot-password"
                  className="inline-flex items-center text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                >
                  Request Password Reset
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label className="text-xs font-medium text-slate-300">New Password (min 8 chars) *</Label>
                  <Input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-1 bg-slate-950 border-slate-800 text-white"
                  />
                </div>

                <div>
                  <Label className="text-xs font-medium text-slate-300">Confirm New Password *</Label>
                  <Input
                    type="password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-1 bg-slate-950 border-slate-800 text-white"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold mt-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Save New Password
                </Button>

                <div className="text-center pt-2">
                  <Link
                    to="/admin/login"
                    className="inline-flex items-center text-xs text-slate-400 hover:text-slate-200"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Sign In
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

