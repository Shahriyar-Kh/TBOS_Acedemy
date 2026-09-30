import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAdminAuth } from "@/lib/adminAuthContext";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminIndexPage,
});

function AdminIndexPage() {
  const { admin, isLoading } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (admin) {
        navigate({ to: "/admin/admissions" });
      } else {
        navigate({ to: "/admin/login" });
      }
    }
  }, [admin, isLoading, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#070F2B]">
      <Loader2 className="h-8 w-8 animate-spin text-[#008DDA]" />
    </div>
  );
}
