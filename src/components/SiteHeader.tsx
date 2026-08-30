import { Link } from "@tanstack/react-router";
import { Coffee, ShieldCheck, ShoppingBag } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="absolute top-0 right-0 left-0 z-40 bg-transparent transition-all duration-300">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 sm:px-10">
        {/* Brand Logo */}
        <Link to="/" className="group flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-[#3A281E] text-[#C08A45] border border-[#8C5A32]/40 transition-transform duration-500 group-hover:rotate-12">
            <Coffee className="size-5" />
          </span>
          <div className="flex flex-col text-right">
            <span className="font-display text-2xl font-black tracking-wider text-[#F3E7D6]">
              KAYAN
            </span>
          </div>
        </Link>

        {/* Center Nav Links - Clean & Minimal */}
        <nav className="flex items-center gap-8 text-sm font-medium text-[#C9B79C]">
          <a
            href="#"
            className="text-[#C08A45] font-semibold relative after:absolute after:-bottom-1 after:right-0 after:h-0.5 after:w-full after:bg-[#C08A45] after:rounded-full"
          >
            الرئيسية
          </a>
          <a href="#menu" className="transition-colors hover:text-[#F3E7D6]">
            المنيو
          </a>
        </nav>

        {/* Right Action */}
        <div className="flex items-center gap-3">
          <a
            href="#menu"
            className="flex size-10 items-center justify-center rounded-full bg-[#3A281E] border border-[#8C5A32]/40 text-[#C9B79C] transition-all hover:bg-[#8C5A32]/30 hover:text-[#F3E7D6]"
            aria-label="سلة الطلبات"
          >
            <ShoppingBag className="size-4" />
          </a>

          <Link
            to="/admin"
            className="inline-flex items-center gap-2 rounded-full bg-[#C08A45] px-6 py-2.5 text-xs font-bold text-[#241512] shadow-lift transition-all duration-300 hover:bg-[#d49b52] hover:scale-105"
          >
            <ShieldCheck className="size-4 text-[#241512]" />
            لوحة الإدارة
          </Link>
        </div>
      </div>
    </header>
  );
}
