import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { adminNoIndexMeta } from "@/lib/seo";
import { useState, useEffect } from "react";
import { useAdminAuth } from "@/lib/adminAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Lock, Mail, AlertCircle, Info, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: adminNoIndexMeta("TBOS Admin Login") }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const { admin, isLoading, isConfigured, login } = useAdminAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already authenticated as an admin, redirect to admissions dashboard
  useEffect(() => {
    if (!isLoading && admin) {
      navigate({ to: "/admin/admissions" });
    }
  }, [admin, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await login(email.trim(), password);
    setIsSubmitting(false);

    if (result.ok) {
      navigate({ to: "/admin/admissions" });
    } else {
      setErrorMessage(result.error || "Failed to sign in. Please verify your credentials.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070F2B] text-white">
        <Loader2 className="h-8 w-8 animate-spin text-[#008DDA]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#070F2B] px-4 py-12">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent pointer-events-none" />

      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0B192C]/90 p-8 shadow-2xl backdrop-blur-xl">
        {/* Header Branding */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#008DDA] to-[#41B3A2] text-white shadow-lg shadow-cyan-500/20">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">TBOS Administrator</h1>
          <p className="mt-1 text-sm text-slate-400">Secure Admissions & Demo Management Portal</p>
        </div>

        {/* Configuration Notice if public variables are absent */}
        {!isConfigured && (
          <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-300">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <p className="font-semibold">Client Auth Setup Required</p>
                <p className="mt-1 text-amber-300/80">
                  Please set <code className="bg-black/30 px-1 py-0.5 rounded font-mono">VITE_SUPABASE_URL</code> and{" "}
                  <code className="bg-black/30 px-1 py-0.5 rounded font-mono">VITE_SUPABASE_PUBLISHABLE_KEY</code> in{" "}
                  <code className="bg-black/30 px-1 py-0.5 rounded font-mono">.env.local</code> to enable browser authentication.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-3.5 text-sm text-red-300 flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Admin Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="email"
                type="email"
                placeholder="admin@techbuilt.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting || !isConfigured}
                className="h-11 border-white/10 bg-black/40 pl-10 text-white placeholder:text-slate-500 focus:border-[#008DDA] focus:ring-[#008DDA]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting || !isConfigured}
                className="h-11 border-white/10 bg-black/40 pl-10 text-white placeholder:text-slate-500 focus:border-[#008DDA] focus:ring-[#008DDA]"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !isConfigured}
            className="w-full h-11 bg-gradient-to-r from-[#008DDA] to-[#41B3A2] font-semibold text-white transition-all hover:opacity-95 hover:shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Authenticating...
              </span>
            ) : (
              "Sign In to Admin Portal"
            )}
          </Button>
        </form>

        {/* Security Notice */}
        <div className="mt-8 border-t border-white/5 pt-4 text-center">
          <p className="text-xs text-slate-500">
            Internal access only. Unauthorized attempts are logged. Admin accounts are provisioned by invitation.
          </p>
        </div>
      </div>
    </div>
  );
}
