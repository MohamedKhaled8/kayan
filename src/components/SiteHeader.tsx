import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";

export function SiteHeader() {
  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#DFBA73]/20 bg-[#0B0705]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-10">
        
        {/* Brand Logo */}
        <Link to="/" className="group flex items-center gap-3 shrink-0">
          <span className="font-display text-xl sm:text-2xl font-bold tracking-[0.2em] text-[#DFBA73] uppercase transition-colors group-hover:text-white">
            KAYAN CAFÉ
          </span>
        </Link>

        {/* Center Nav Links - Exactly HOME, MENU, LOCATIONS with smooth scroll */}
        <nav className="flex items-center gap-8 md:gap-12 text-xs font-bold tracking-[0.2em] text-[#BFB096] uppercase" dir="ltr">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="text-[#DFBA73] relative py-1 after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:w-full after:bg-[#DFBA73]"
          >
            HOME
          </a>
          <button
            type="button"
            onClick={() => scrollTo("menu")}
            className="transition-colors hover:text-[#DFBA73] cursor-pointer py-1"
          >
            MENU
          </button>
          <button
            type="button"
            onClick={() => scrollTo("visit")}
            className="transition-colors hover:text-[#DFBA73] cursor-pointer py-1"
          >
            LOCATIONS
          </button>
        </nav>

        {/* Right Action: Discreet Minimal Admin Lock Icon */}
        <div className="flex items-center">
          <Link
            to="/admin"
            title="لوحة الإدارة"
            aria-label="لوحة الإدارة"
            className="flex size-8 items-center justify-center rounded-full text-[#BFB096]/35 transition-all duration-300 hover:text-[#DFBA73] hover:bg-white/5 hover:scale-110"
          >
            <Lock className="size-3.5" />
          </Link>
        </div>

      </div>
    </header>
  );
}
