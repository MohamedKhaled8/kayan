import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { BarChart3, ClipboardList, Coffee, LayoutGrid, LogOut, Menu, ShieldCheck, X } from "lucide-react";
import { useOrders } from "@/lib/order-store";
import { DEMO_EMAIL, DEMO_PASSWORD, signIn, signOut, useAdminSession } from "@/lib/admin-auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "لوحة التحكم — كَيان (KAYAN)" },
      {
        name: "description",
        content: "لوحة التحكم الخاصة بإدارة أصناف وسيكشنات كَيان كافيه.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "لوحة تحكم كَيان" },
    ],
  }),
  component: AdminLayout,
});

const NAV_ITEMS = [
  { to: "/admin", label: "المنيو والأقسام", icon: LayoutGrid, exact: true },
  { to: "/admin/orders", label: "الطلبات", icon: ClipboardList, exact: false },
  { to: "/admin/reports", label: "التقارير والإحصائيات", icon: BarChart3, exact: false },
] as const;

function AdminLayout() {
  const { ready, email } = useAdminSession();
  const { orders } = useOrders();
  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (!ready) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  if (!email) return <LoginScreen />;

  return (
    <div className="page-enter flex min-h-screen flex-col bg-slate-50 text-slate-900 md:flex-row font-sans">
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-5 py-4 text-white md:hidden">
        <span className="font-bold tracking-wide">كَيان · Admin Dashboard</span>
        <button onClick={() => setOpen((v) => !v)} aria-label="تبديل القائمة">
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Sidebar - Clean Slate/Dark SaaS Theme */}
      <aside
        className={cn(
          "flex-col justify-between bg-slate-900 px-5 py-6 text-slate-300 md:flex md:w-64 md:shrink-0 text-right shadow-md",
          open ? "flex" : "hidden",
        )}
      >
        <div>
          <Link to="/" className="hidden items-center justify-end gap-3 md:flex group">
            <div className="text-right">
              <span className="block font-bold text-base text-white">كَيان كافيه</span>
              <span className="block text-[0.65rem] text-slate-400">لوحة الإدارة والمخزون</span>
            </div>
            <span className="flex size-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <Coffee className="size-4" />
            </span>
          </Link>

          <nav className="mt-8 space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
              const isOrders = item.to === "/admin/orders";
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center justify-end gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200",
                    active
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white",
                  )}
                >
                  {isOrders && pendingCount > 0 && (
                    <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-red-500 text-[0.65rem] font-black text-white">
                      {pendingCount}
                    </span>
                  )}
                  <span>{item.label}</span>
                  <item.icon className="size-4" />
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-10 space-y-3 border-t border-slate-800 pt-5 text-xs">
          <p className="text-slate-400">مسجل كـ</p>
          <p className="truncate font-semibold text-white">{email}</p>
          <button
            onClick={signOut}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-800/60 px-4 py-2.5 text-slate-300 transition-colors hover:bg-red-600 hover:text-white"
          >
            <LogOut className="size-3.5" /> تسجيل الخروج
          </button>
          <Link
            to="/"
            className="block text-center text-slate-400 hover:text-white transition-colors pt-2"
          >
            ← العودة للموقع العام
          </Link>
        </div>
      </aside>

      {/* Main Content Area - Crisp White & Slate */}
      <main className="min-w-0 flex-1 bg-slate-50 px-5 py-8 sm:px-8 md:py-10 text-slate-900">
        <Outlet />
      </main>
    </div>
  );
}

function LoginScreen() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="page-enter flex min-h-screen items-center justify-center bg-slate-100 px-5 py-16 text-right font-sans">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl border border-slate-200 sm:p-10 text-slate-900">
        <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shadow-sm">
          <ShieldCheck className="size-6 text-blue-600" />
        </span>
        <h1 className="mt-6 text-2xl sm:text-3xl font-black text-center text-slate-900">
          لوحة تحكم كَيان
        </h1>
        <p className="mt-2 text-xs text-center text-slate-500">
          إدارة الأصناف، الأقسام، والصور لكَيان كافيه.
        </p>

        <form
          className="mt-8 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const res = signIn(form.email, form.password);
            setError(res.error);
          }}
        >
          <label className="block">
            <span className="text-xs font-bold text-slate-700 block mb-1">البريد الإلكتروني</span>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-blue-600 focus:bg-white text-left"
              placeholder={DEMO_EMAIL}
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-slate-700 block mb-1">كلمة المرور</span>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-blue-600 focus:bg-white text-left"
              placeholder="••••••••"
            />
          </label>

          {error && <p className="text-xs font-semibold text-red-600">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white transition-all duration-300 hover:bg-blue-700 shadow-md hover:shadow-lg"
          >
            تسجيل الدخول
          </button>
        </form>

        <div className="mt-6 rounded-2xl bg-blue-50/80 border border-blue-100 p-4 text-[0.75rem] leading-relaxed text-slate-600 text-center">
          بيانات الدخول التجريبية الجاهزة:{" "}
          <strong className="text-blue-950 font-mono block mt-1">{DEMO_EMAIL} / {DEMO_PASSWORD}</strong>
        </div>

        <Link
          to="/"
          className="mt-6 block text-center text-xs font-semibold text-slate-500 hover:text-blue-600"
        >
          ← الرجوع إلى الموقع الرئيسي
        </Link>
      </div>
    </div>
  );
}
