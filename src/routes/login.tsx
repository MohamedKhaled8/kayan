import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AdminLoginScreen } from "@/components/AdminLoginScreen";
import { useAdminSession } from "@/lib/admin-auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "تسجيل الدخول — كَيان (KAYAN)" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { ready, email } = useAdminSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && email) {
      navigate({ to: "/admin" });
    }
  }, [ready, email, navigate]);

  return <AdminLoginScreen onSuccess={() => navigate({ to: "/admin" })} />;
}
