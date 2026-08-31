import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect, useRef } from "react";
import { 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  UtensilsCrossed 
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { useProducts } from "@/lib/product-store";
import { useCategories } from "@/lib/category-store";
import { cn } from "@/lib/utils";
import logoSymbol from "@/assets/logo-symbol.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kayan Café — Specialty Coffee & Handcrafted Desserts" },
      {
        name: "description",
        content:
          "Where specialty coffee meets signature drinks and handcrafted desserts. Experience rich aromas and sweet moments at Kayan Café.",
      },
      { property: "og:title", content: "Kayan Café" },
    ],
  }),
  component: HomePage,
});

// Atmospheric hero background
export const novaHeroBackground =
  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=2000&q=90";

function HomePage() {
  const { products } = useProducts();
  const { categories } = useCategories();
  const [active, setActive] = useState<string>("All");
  const categoryTrackRef = useRef<HTMLDivElement>(null);

  const categoryNames = useMemo(() => {
    return categories.map((c) => c.name);
  }, [categories]);

  const allCategoryPills = useMemo(() => {
    return ["All", ...categoryNames];
  }, [categoryNames]);

  const filtered = useMemo(() => {
    if (active === "All") return products;
    return products.filter((p) => p.category === active);
  }, [products, active]);

  return (
    <div className="page-enter min-h-screen bg-[#0B0705] text-[#F5EFE6] selection:bg-[#DFBA73] selection:text-[#0B0705]">
      {/* Top Navbar with HOME, MENU, LOCATIONS */}
      <SiteHeader />

      {/* Nova Café Style Hero Section */}
      <section className="relative flex min-h-[92vh] min-h-[700px] w-full flex-col items-center justify-center overflow-hidden text-center px-6">
        
        {/* Background Image */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src={novaHeroBackground}
            alt="Kayan Cafe Artisanal Coffee Table"
            className="size-full object-cover brightness-[0.42] contrast-[1.12] filter"
            loading="eager"
          />
          {/* Warm vignette for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0705] via-transparent to-[#0B0705]/70" />
          <div className="absolute inset-0 bg-radial-[circle_at_center] from-transparent via-[#0B0705]/40 to-[#0B0705]/90" />
        </div>

        {/* Hero Center Content */}
        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center justify-center py-16">
          
          {/* Brand Logo Symbol */}
          <Reveal delay={50}>
            <img 
              src={logoSymbol} 
              alt="Kayan Logo" 
              className="h-24 sm:h-28 w-auto object-contain mb-6 filter drop-shadow-[0_4px_16px_rgba(223,186,115,0.25)] animate-pulse-slow" 
            />
          </Reveal>

          {/* Tag */}
          <Reveal delay={150}>
            <span className="font-serif text-xs sm:text-sm font-semibold tracking-[0.45em] text-[#DFBA73] uppercase mb-4 block">
              ✦ &nbsp; S P E C I A L T Y &nbsp; C O F F E E &nbsp; &amp; &nbsp; S W E E T S &nbsp; ✦
            </span>
          </Reveal>

          {/* Main Title: Kayan Café */}
          <Reveal delay={250}>
            <h1 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-normal leading-[1] text-[#F5EFE6] tracking-tight">
              Kayan <span className="font-serif italic font-normal text-[#DFBA73]">Café</span>
            </h1>
          </Reveal>

          {/* Authentic Café Subtitle */}
          <Reveal delay={350}>
            <div className="mt-6 max-w-2xl space-y-2 text-sm sm:text-base md:text-lg font-light leading-relaxed text-[#BFB096]">
              <p>Where specialty coffee meets signature drinks &amp; handcrafted desserts.</p>
              <p>Experience rich aromas, refreshing beverages, and sweet moments in every cup.</p>
            </div>
          </Reveal>

          {/* Gold Outline Pill Button: EXPLORE MENU */}
          <Reveal delay={450}>
            <div className="mt-9">
              <a
                href="#menu"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="group inline-flex items-center justify-center rounded-full border border-[#DFBA73] bg-[#0B0705]/40 px-10 py-3.5 text-xs sm:text-sm font-bold tracking-[0.25em] text-[#DFBA73] uppercase backdrop-blur-md transition-all duration-300 hover:bg-[#DFBA73] hover:text-[#0B0705] hover:shadow-glow hover:scale-105"
              >
                EXPLORE MENU
              </a>
            </div>
          </Reveal>

          {/* Bottom SCROLL Indicator */}
          <Reveal delay={550}>
            <div className="mt-14 flex flex-col items-center gap-2 text-center">
              <a
                href="#menu"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-[0.65rem] font-bold tracking-[0.35em] text-[#BFB096]/70 uppercase transition-colors hover:text-[#DFBA73]"
              >
                SCROLL
              </a>
              <ChevronDown className="size-4 text-[#DFBA73] animate-bounce" />
            </div>
          </Reveal>

        </div>

      </section>

      {/* Main Menu Section */}
      <section id="menu" className="mx-auto max-w-7xl px-4 pt-2 pb-12 sm:pt-4 sm:pb-16 sm:px-8">
        <Reveal className="text-center">
          <span className="eyebrow inline-flex items-center gap-2 rounded-full border border-[#DFBA73]/30 bg-[#170F0A] px-3.5 py-0.5 text-[0.68rem] text-[#DFBA73] tracking-[0.25em]">
            <UtensilsCrossed className="size-2.5 text-[#DFBA73]" /> CURATED SELECTION
          </span>
          <h2
            className="mt-2 font-serif text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-[#F5EFE6]"
            style={{ fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif" }}
          >
            Kayan <span className="font-serif italic text-[#DFBA73]">Menu</span>
          </h2>
        </Reveal>

        {/* Clean, Premium, Single-Row Category Strip with Smooth Arrows & Touch Swipe */}
        {categories.length > 0 && (
          <Reveal delay={100}>
            <div className="mt-6 relative flex items-center justify-center max-w-5xl mx-auto px-1 sm:px-4">
              
              {/* Right Arrow (Scrolls Right / Next in RTL) */}
              <button
                type="button"
                onClick={() => {
                  if (categoryTrackRef.current) {
                    categoryTrackRef.current.scrollBy({ left: 240, behavior: "smooth" });
                  }
                }}
                aria-label="التمرير لليمين"
                className="shrink-0 mr-1 sm:mr-2 flex size-8 sm:size-9 items-center justify-center rounded-full border border-[#DFBA73]/30 bg-[#170F0A]/90 text-[#DFBA73] backdrop-blur-md transition-all hover:bg-[#DFBA73] hover:text-[#0B0705] hover:scale-105 active:scale-95 shadow-md cursor-pointer z-10"
              >
                <ChevronRight className="size-4" />
              </button>

              {/* Smooth Scrollable Horizontal Pills Track */}
              <div
                ref={categoryTrackRef}
                className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-2 px-2 flex-nowrap"
              >
                {allCategoryPills.map((cat) => {
                  const isAll = cat === "All";
                  const count = isAll
                    ? products.length
                    : products.filter((p) => p.category === cat).length;
                  const label = isAll ? `الكل (${count})` : `${cat} (${count})`;
                  const isSelected = active === cat;

                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={(e) => {
                        setActive((prev) => (prev === cat ? "All" : cat));
                        e.currentTarget.scrollIntoView({
                          behavior: "smooth",
                          inline: "center",
                          block: "nearest",
                        });
                      }}
                      className={cn(
                        "shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer whitespace-nowrap select-none",
                        isSelected
                          ? "border-[#DFBA73] bg-[#DFBA73] text-[#0B0705] font-bold shadow-sm scale-105"
                          : "border-[#DFBA73]/25 bg-[#170F0A] text-[#BFB096] hover:border-[#DFBA73] hover:text-[#F5EFE6]"
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Left Arrow (Scrolls Left / Previous in RTL) */}
              <button
                type="button"
                onClick={() => {
                  if (categoryTrackRef.current) {
                    categoryTrackRef.current.scrollBy({ left: -240, behavior: "smooth" });
                  }
                }}
                aria-label="التمرير لليسار"
                className="shrink-0 ml-1 sm:ml-2 flex size-8 sm:size-9 items-center justify-center rounded-full border border-[#DFBA73]/30 bg-[#170F0A]/90 text-[#DFBA73] backdrop-blur-md transition-all hover:bg-[#DFBA73] hover:text-[#0B0705] hover:scale-105 active:scale-95 shadow-md cursor-pointer z-10"
              >
                <ChevronLeft className="size-4" />
              </button>

            </div>
          </Reveal>
        )}

        {/* Products Grid - Compact 4 columns */}
        {filtered.length > 0 ? (
          <div className="mt-8 grid gap-4 sm:gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((product, i) => (
              <ProductCard key={product.id} product={product} delay={i * 30} />
            ))}
          </div>
        ) : (
          <div className="mt-12 rounded-3xl border border-dashed border-[#DFBA73]/30 bg-[#170F0A]/60 px-6 py-16 text-center text-[#BFB096] shadow-soft">
            <h3 className="font-display text-2xl font-normal text-[#F5EFE6]">
              {products.length === 0
                ? "المنيو جاهز لإضافة الأصناف"
                : "لا توجد أصناف في هذا القسم حالياً"}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#BFB096]">
              يمكنك إضافة الأصناف والأسعار وتحديث الصور من لوحة الإدارة بسهولة.
            </p>
            <div className="mt-6">
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 rounded-full border border-[#DFBA73] bg-[#DFBA73] px-8 py-3 text-xs font-bold tracking-widest text-[#0B0705] uppercase shadow-lift transition-all hover:bg-[#F5EFE6] hover:scale-105"
              >
                الانتقال للوحة الإدارة لإضافة الأصناف
              </Link>
            </div>
          </div>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}
