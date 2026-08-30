import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { BarChart3, Coffee, LayoutGrid, LogOut, Menu, ShieldCheck, X } from "lucide-react";
import { DEMO_EMAIL, DEMO_PASSWORD, signIn, signOut, useAdminSession } from "@/lib/admin-auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "لوحة التحكم — كَيان كافيه (KAYAN)" },
      {
        name: "description",
        content: "لوحة التحكم الخاصة بإدارة أصناف وسيكشنات كَيان كافيه ورفع الصور على Cloudinary.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "لوحة تحكم كَيان كافيه" },
    ],
  }),
  component: AdminLayout,
});

const nav = [
  { to: "/admin", label: "المنيو والسيكشنات", icon: LayoutGrid, exact: true },
  { to: "/admin/reports", label: "التقارير والإحصائيات", icon: BarChart3, exact: false },
] as const;

function AdminLayout() {
  const { ready, email } = useAdminSession();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (!ready) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!email) return <LoginScreen />;

  return (
    <div className="page-enter flex min-h-screen flex-col bg-background md:flex-row">
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-border bg-sidebar px-5 py-4 text-sidebar-foreground md:hidden">
        <span className="font-display text-lg font-bold">كَيان · KAYAN Admin</span>
        <button onClick={() => setOpen((v) => !v)} aria-label="تبديل القائمة">
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "flex-col justify-between bg-sidebar px-5 py-6 text-sidebar-foreground md:flex md:w-64 md:shrink-0 text-right",
          open ? "flex" : "hidden",
        )}
      >
        <div>
          <Link to="/" className="hidden items-center justify-end gap-3 md:flex">
            <div className="text-right">
              <span className="block font-display text-base font-bold">كَيان كافيه</span>
              <span className="block text-[0.65rem] text-sidebar-foreground/60">لوحة الإدارة السحابية</span>
            </div>
            <span className="flex size-9 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
              <Coffee className="size-4" strokeWidth={1.5} />
            </span>
          </Link>

          <nav className="mt-8 space-y-1.5">
            {nav.map((item) => {
              const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center justify-end gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-soft"
                      : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <span>{item.label}</span>
                  <item.icon className="size-4" strokeWidth={1.6} />
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-10 space-y-3 border-t border-sidebar-border pt-5 text-xs">
          <p className="text-sidebar-foreground/60">مسجل كـ</p>
          <p className="truncate font-medium">{email}</p>
          <button
            onClick={signOut}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-sidebar-border px-4 py-2.5 text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <LogOut className="size-3.5" /> تسجيل الخروج
          </button>
          <Link
            to="/"
            className="block text-center text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
          >
            ← العودة للموقع العام
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 md:py-10">
        <Outlet />
      </main>
    </div>
  );
}

function LoginScreen() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="page-enter flex min-h-screen items-center justify-center bg-espresso px-5 py-16 text-right">
      <div className="w-full max-w-md rounded-3xl bg-card p-8 shadow-lift sm:p-10">
        <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-espresso text-espresso-foreground">
          <ShieldCheck className="size-6 text-copper" strokeWidth={1.5} />
        </span>
        <h1 className="mt-6 font-display text-2xl sm:text-3xl font-bold text-center">
          تسجيل دخول لوحة التحكم
        </h1>
        <p className="mt-2 text-xs text-center text-muted-foreground">
          لوحة إدارة المنيو، السيكشنات، والصور السحابية لكَيان كافيه.
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
            <span className="eyebrow">البريد الإلكتروني</span>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-copper text-left"
              placeholder={DEMO_EMAIL}
            />
          </label>
          <label className="block">
            <span className="eyebrow">كلمة المرور</span>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-copper text-left"
              placeholder="••••••••"
            />
          </label>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-xl bg-copper px-4 py-3.5 text-sm font-semibold text-copper-foreground transition-all duration-300 hover:shadow-lift"
          >
            تسجيل الدخول
          </button>
        </form>

        <p className="mt-6 rounded-2xl bg-secondary p-4 text-[0.75rem] leading-relaxed text-muted-foreground text-center">
          بيانات الدخول التجريبية الجاهزة:{" "}
          <strong className="text-foreground font-mono">{DEMO_EMAIL}</strong> /{" "}
          <strong className="text-foreground font-mono">{DEMO_PASSWORD}</strong>
        </p>

        <Link
          to="/"
          className="mt-6 block text-center text-xs text-muted-foreground hover:text-copper"
        >
          ← الرجوع إلى المنيو الرئيسي
        </Link>
      </div>
    </div>
  );
}
