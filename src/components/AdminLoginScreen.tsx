import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { signIn } from "@/lib/admin-auth";
import logoSymbol from "@/assets/logo-symbol.png";

// Real barista pouring latte art photo (moody, warm, high-resolution)
const BARISTA_PHOTO =
  "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=1600&q=85";

interface LoginFormState {
  email: string;
  password: string;
  showPassword: boolean;
  rememberMe: boolean;
  loading: boolean;
  error: string | null;
}

export function AdminLoginScreen({ onSuccess }: { onSuccess?: () => void }) {
  const navigate = useNavigate();

  const [form, setForm] = useState<LoginFormState>({
    email: "",
    password: "",
    showPassword: false,
    rememberMe: true,
    loading: false,
    error: null,
  });

  const set = (partial: Partial<LoginFormState>) =>
    setForm((prev) => ({ ...prev, ...partial }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    set({ error: null, loading: true });

    try {
      const res = await signIn(form.email, form.password);
      if (res.success) {
        if (onSuccess) {
          onSuccess();
        } else {
          navigate({ to: "/admin" });
        }
      } else {
        set({ error: res.error ?? "Invalid credentials. Please try again." });
      }
    } catch {
      set({ error: "An unexpected error occurred. Please try again." });
    } finally {
      set({ loading: false });
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#FAF8F5] text-[#1C140E] font-sans antialiased selection:bg-[#DFBA73]/30">
      {/* ── LEFT PANEL (Photo side) — ~40% width on desktop ── */}
      <div className="relative w-full md:w-[42%] lg:w-[40%] h-[240px] sm:h-[300px] md:h-auto md:min-h-screen overflow-hidden shrink-0">
        {/* Full-bleed real barista photograph */}
        <img
          src={BARISTA_PHOTO}
          alt="Kayan Barista Craft"
          className="absolute inset-0 h-full w-full object-cover object-center"
          loading="eager"
        />

        {/* Cinematic gradient overlay for crisp text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/15 md:bg-gradient-to-t md:from-black/90 md:via-black/40 md:to-black/10" />

        {/* Text overlay at bottom-left */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-end">
          <blockquote className="text-lg sm:text-xl md:text-2xl lg:text-[1.65rem] font-medium text-white italic leading-snug tracking-normal drop-shadow-sm font-serif">
            &ldquo;Not just great coffee, but an authentic experience.&rdquo;
          </blockquote>

          <div className="mt-3 sm:mt-4 space-y-0.5">
            <p className="text-sm sm:text-base font-bold text-white tracking-wide">
              Kayan Specialty Coffee
            </p>
            <p className="text-xs sm:text-sm text-white/70 font-normal">
              Handcrafted with Passion &amp; Precision
            </p>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL (Form side) — ~60% width on desktop ── */}
      <div className="flex-1 flex items-center justify-center bg-[#FAF8F5] px-6 py-10 sm:px-10 lg:px-16 min-h-[calc(100vh-240px)] md:min-h-screen">
        <div className="w-full max-w-[400px] flex flex-col items-center">
          {/* Top: Kayan's own logo & wordmark */}
          <div className="flex items-center gap-2.5 mb-5">
            <img
              src={logoSymbol}
              alt="Kayan Logo"
              className="h-9 w-auto object-contain"
            />
            <span className="text-xl font-bold tracking-[0.08em] text-[#1C140E] uppercase font-serif">
              KAYAN CAFÉ
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-[1.75rem] font-bold text-[#1C140E] text-center tracking-tight leading-tight">
            Hello, welcome back!
          </h1>

          {/* Subtitle */}
          <p className="mt-1.5 text-xs sm:text-sm text-[#736357] text-center">
            Start your day with the perfect brew
          </p>

          {/* Error Message */}
          {form.error && (
            <div className="w-full mt-4 rounded-xl border border-red-200 bg-red-50/90 px-4 py-2.5 text-xs text-red-700 text-center font-medium">
              {form.error}
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="w-full mt-7 space-y-4"
            noValidate
          >
            {/* Email Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold text-[#3D2E24] tracking-wide"
              >
                Email
              </label>
              <input
                id="login-email"
                type="text"
                value={form.email}
                onChange={(e) => set({ email: e.target.value })}
                placeholder="admin@kayan.cafe"
                required
                autoComplete="username email"
                className="w-full rounded-xl border border-[#D9D1C7] bg-white px-4 py-3 text-sm text-[#1C140E] placeholder-[#A09386] outline-none transition-all duration-200 focus:border-[#1B4332] focus:ring-2 focus:ring-[#1B4332]/15 hover:border-[#BFB4A7]"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold text-[#3D2E24] tracking-wide"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={form.showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => set({ password: e.target.value })}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-[#D9D1C7] bg-white px-4 py-3 pr-11 text-sm text-[#1C140E] placeholder-[#A09386] outline-none transition-all duration-200 focus:border-[#1B4332] focus:ring-2 focus:ring-[#1B4332]/15 hover:border-[#BFB4A7]"
                />
                <button
                  type="button"
                  onClick={() => set({ showPassword: !form.showPassword })}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C7D70] hover:text-[#1B4332] transition-colors focus:outline-none cursor-pointer"
                  aria-label={form.showPassword ? "Hide password" : "Show password"}
                >
                  {form.showPassword ? (
                    <EyeOff className="size-[18px]" />
                  ) : (
                    <Eye className="size-[18px]" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember me (Left only, no forgot password link) */}
            <div className="flex items-center gap-2 pt-0.5">
              <input
                id="login-remember"
                type="checkbox"
                checked={form.rememberMe}
                onChange={(e) => set({ rememberMe: e.target.checked })}
                className="h-4 w-4 rounded border-[#D9D1C7] accent-[#1B4332] text-[#1B4332] cursor-pointer"
              />
              <label
                htmlFor="login-remember"
                className="text-xs text-[#615247] cursor-pointer select-none font-medium"
              >
                Remember me
              </label>
            </div>

            {/* Submit Button in Kayan Forest Green */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={form.loading}
                className="w-full rounded-xl bg-[#1B4332] py-3.5 text-sm font-bold text-white tracking-wide transition-all duration-200 hover:bg-[#245C44] active:scale-[0.99] disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2 shadow-sm hover:shadow"
              >
                {form.loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Let's brew!"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
