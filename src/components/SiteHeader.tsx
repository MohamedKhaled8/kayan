import { Link, useNavigate } from "@tanstack/react-router";
import { Lock, Menu, X } from "lucide-react";
import { useState } from "react";
import logoSymbol from "@/assets/logo-symbol.png";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (typeof window !== "undefined") {
      if (window.location.pathname === "/") {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        navigate({ to: "/" }).then(() => {
          setTimeout(() => {
            const element = document.getElementById(sectionId);
            if (element) {
              element.scrollIntoView({ behavior: "smooth" });
            }
          }, 120);
        });
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#DFBA73]/20 bg-[#0B0705]/95 backdrop-blur-md" dir="ltr">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-8">
        
        {/* Left: Brand Logo (Always visible & crisp) */}
        <div className="flex items-center justify-start shrink-0">
          <Link to="/" className="group flex items-center gap-2.5 sm:gap-3 shrink-0">
            <img 
              src={logoSymbol} 
              alt="Kayan Logo" 
              className="h-7 sm:h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-105" 
            />
            <span className="font-display text-base sm:text-lg md:text-xl font-bold tracking-[0.18em] text-[#DFBA73] uppercase transition-colors group-hover:text-white whitespace-nowrap">
              KAYAN CAFÉ
            </span>
          </Link>
        </div>

        {/* Center: Desktop Nav Links (Hidden on mobile < md to prevent any overlap) */}
        <nav className="hidden md:flex items-center justify-center gap-6 lg:gap-9 text-xs font-bold tracking-[0.18em] text-[#BFB096] uppercase shrink-0">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            activeProps={{ className: "text-[#DFBA73] after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:w-full after:bg-[#DFBA73]" }}
            onClick={() => {
              if (typeof window !== "undefined" && window.location.pathname === "/") {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className="relative py-1 transition-colors hover:text-[#DFBA73]"
          >
            HOME
          </Link>

          <button
            type="button"
            onClick={() => handleNavClick("menu")}
            className="relative py-1 transition-colors hover:text-[#DFBA73] cursor-pointer"
          >
            MENU
          </button>

          <Link
            to="/menu"
            activeOptions={{ exact: true }}
            activeProps={{ className: "text-[#DFBA73] after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:w-full after:bg-[#DFBA73]" }}
            className="relative py-1 transition-colors hover:text-[#DFBA73]"
          >
            CLASSIC MENU
          </Link>

          <button
            type="button"
            onClick={() => handleNavClick("visit")}
            className="relative py-1 transition-colors hover:text-[#DFBA73] cursor-pointer"
          >
            LOCATIONS
          </button>
        </nav>

        {/* Right Side: Admin Lock + Mobile Hamburger Toggle */}
        <div className="flex items-center justify-end gap-2 shrink-0">
          <Link
            to="/admin"
            title="لوحة الإدارة"
            aria-label="لوحة الإدارة"
            className="flex size-8 items-center justify-center rounded-full text-[#BFB096]/40 transition-all duration-300 hover:text-[#DFBA73] hover:bg-white/5 hover:scale-105"
          >
            <Lock className="size-3.5" />
          </Link>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
            className="flex md:hidden size-9 items-center justify-center rounded-xl border border-[#DFBA73]/30 bg-[#170F0A] text-[#DFBA73] transition-all hover:bg-[#DFBA73] hover:text-[#0B0705] cursor-pointer"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Slide-down Navigation Sheet */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#DFBA73]/20 bg-[#0B0705]/98 px-6 py-5 backdrop-blur-xl animate-in slide-in-from-top-3 duration-200">
          <nav className="flex flex-col gap-4 text-sm font-bold tracking-[0.2em] text-[#BFB096] uppercase text-center">
            <Link
              to="/"
              activeOptions={{ exact: true }}
              activeProps={{ className: "text-[#DFBA73] font-black" }}
              onClick={() => {
                setMobileMenuOpen(false);
                if (typeof window !== "undefined" && window.location.pathname === "/") {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              className="py-2.5 rounded-xl border border-transparent hover:border-[#DFBA73]/20 hover:bg-[#170F0A] transition-colors"
            >
              HOME
            </Link>

            <button
              type="button"
              onClick={() => handleNavClick("menu")}
              className="py-2.5 rounded-xl border border-transparent hover:border-[#DFBA73]/20 hover:bg-[#170F0A] transition-colors cursor-pointer"
            >
              MENU
            </button>

            <Link
              to="/menu"
              activeOptions={{ exact: true }}
              activeProps={{ className: "text-[#DFBA73] font-black" }}
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 rounded-xl border border-transparent hover:border-[#DFBA73]/20 hover:bg-[#170F0A] transition-colors"
            >
              CLASSIC MENU
            </Link>

            <button
              type="button"
              onClick={() => handleNavClick("visit")}
              className="py-2.5 rounded-xl border border-transparent hover:border-[#DFBA73]/20 hover:bg-[#170F0A] transition-colors cursor-pointer"
            >
              LOCATIONS
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
