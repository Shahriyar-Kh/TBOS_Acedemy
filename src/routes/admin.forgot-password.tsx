import { createFileRoute, Link } from "@tanstack/react-router";
import { adminNoIndexMeta } from "@/lib/seo";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, Mail, ArrowLeft, CheckCircle2, Loader2, Shield } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/forgot-password")({
  head: () => ({ meta: adminNoIndexMeta("TBOS Admin Password Recovery") }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your registered staff email");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/auth/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "request-reset", email: email.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
      } else {
        toast.error(data.error || "Unable to process request");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-4">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Reset Staff Password</h2>
          <p className="mt-2 text-xs text-slate-400 max-w-xs mx-auto">
            Enter your authorized TBOS staff email address and we will dispatch a secure 30-minute password reset link.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-slate-900/80 backdrop-blur-md py-8 px-4 shadow-xl border border-slate-800 sm:rounded-2xl sm:px-10">
            {submitted ? (
              <div className="text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">Check Your Inbox</h3>
                <p className="text-xs text-slate-400">
                  If <strong className="text-white">{email}</strong> is registered in the system, an authenticated
                  single-use password reset link has been dispatched via SMTP.
                </p>
                <div className="pt-4">
                  <Link
                    to="/admin/login"
                    className="inline-flex items-center text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Staff Login
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label className="text-xs font-medium text-slate-300">Staff Email Address</Label>
                  <div className="mt-1 relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <Input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@techbuiltos.online"
                      className="pl-9 bg-slate-950 border-slate-800 text-white placeholder:text-slate-600"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Send Recovery Link
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

