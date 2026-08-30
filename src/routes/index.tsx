import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronDown, UtensilsCrossed, ArrowRight, Coffee } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { useProducts } from "@/lib/product-store";
import { useCategories } from "@/lib/category-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KAYAN — Crafted For Your Daily Ritual" },
      {
        name: "description",
        content: "Artisan specialty coffee, refreshing iced beverages, and fresh bakery at Kayan.",
      },
      { property: "og:title", content: "KAYAN — Crafted For Your Daily Ritual" },
    ],
  }),
  component: HomePage,
});

export const hotCoffeeCupImg =
  "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=85";
export const coldDrinkCupImg =
  "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=800&q=85";
export const cafeHeroAtmosphere =
  "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1920&q=80";

function HomePage() {
  const { products } = useProducts();
  const { categories } = useCategories();
  const [active, setActive] = useState<string>("All");

  const categoryNames = useMemo(() => {
    return categories.map((c) => c.name);
  }, [categories]);

  const filtered = useMemo(() => {
    if (active === "All") return products;
    return products.filter((p) => p.category === active);
  }, [products, active]);

  return (
    <div className="page-enter min-h-screen bg-[#241512] text-[#F3E7D6] selection:bg-[#C08A45] selection:text-[#241512]">
      <SiteHeader />

      {/* Hero Section with Rich Grounded Coffee Atmosphere */}
      <section className="relative flex min-h-[88vh] min-h-[640px] w-full flex-col justify-center overflow-hidden pt-28 pb-16">
        
        {/* Rich Coffee Background Texture & Vignette */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src={cafeHeroAtmosphere}
            alt="Warm coffee house atmosphere"
            className="size-full object-cover opacity-18 scale-105 filter blur-[2px]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#241512] via-[#241512]/92 to-[#241512]/80" />
          <div className="absolute inset-0 bg-radial-[circle_at_70%_40%] from-transparent via-[#241512]/60 to-[#241512]" />
        </div>

        <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 px-6 sm:px-10 lg:grid-cols-12 lg:gap-12">
          
          {/* Left Column: Ritual-Focused English Headline, Subtitle, and Textured CTA */}
          <div className="flex flex-col text-left lg:col-span-6" dir="ltr">
            
            <Reveal delay={100}>
              <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold leading-[1.12] tracking-tight text-[#F3E7D6]">
                Crafted For Your<br />
                <span className="text-[#C08A45] underline decoration-[#8C5A32]/40 decoration-wavy decoration-1 underline-offset-8">
                  Daily Ritual.
                </span>
              </h1>
            </Reveal>

            {/* Specialty Coffee Subtitle Badge */}
            <Reveal delay={200}>
              <div className="mt-5 inline-flex items-center gap-3">
                <span className="h-0.5 w-6 bg-[#C08A45]" />
                <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#C08A45] uppercase">
                  Brewed For You · Specialty Roast
                </span>
              </div>
            </Reveal>

            <Reveal delay={300}>
              <p className="mt-5 max-w-lg text-base sm:text-lg leading-relaxed text-[#C9B79C] font-normal">
                Every bean is ethically sourced, roasted in small batches, and pulled with precision. Make your daily coffee break the best part of your day.
              </p>
            </Reveal>

            {/* Tactile Textured Gold CTA Button */}
            <Reveal delay={400}>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="#menu"
                  className="group relative inline-flex items-center gap-3 rounded-full bg-gradient-to-b from-[#D49B52] via-[#C08A45] to-[#A36C2C] px-8 py-4 text-sm font-bold text-[#241512] shadow-lift border-t border-[#F3E7D6]/35 transition-all duration-300 hover:brightness-110 hover:shadow-2xl hover:scale-105 active:scale-95"
                >
                  {/* Subtle Embossed Cup Icon */}
                  <span className="flex size-6 items-center justify-center rounded-full bg-[#241512]/15 text-[#241512]">
                    <Coffee className="size-3.5" />
                  </span>
                  <span>Explore Menu & Coffee</span>
                  <span className="flex size-7 items-center justify-center rounded-full bg-[#241512]/15 text-[#241512] transition-transform duration-300 group-hover:translate-x-1">
                    <ArrowRight className="size-4" />
                  </span>
                </a>
              </div>
            </Reveal>
          </div>

          {/* Right Column: Grounded Composition Showing BOTH Coffee Cup & Cold Drink Cup */}
          <div className="relative flex justify-center items-center lg:col-span-6 min-h-[460px] sm:min-h-[500px]">
            
            <div className="relative w-full max-w-[480px] h-[440px] flex items-center justify-center select-none">
              
              {/* Back Card: Cold Chilled Soda / Refresher Cup (Clearly Visible) */}
              <div className="absolute -left-2 sm:left-2 top-4 z-10 w-56 sm:w-64 -rotate-6 rounded-[28px] border border-[#8C5A32]/40 bg-[#3A281E] p-2.5 shadow-lift transition-transform duration-500 hover:rotate-0 hover:z-30">
                <div className="relative aspect-4/5 w-full overflow-hidden rounded-[22px]">
                  <img
                    src={coldDrinkCupImg}
                    alt="Iced Refresher Cold Beverage"
                    className="size-full object-cover"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#241512]/90 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-center">
                    <span className="block font-display text-xs sm:text-sm font-bold text-[#F3E7D6]">
                      Iced Refresher
                    </span>
                    <span className="text-[0.6rem] text-[#C08A45] font-semibold tracking-widest uppercase">
                      Cold Chilled Beverage
                    </span>
                  </div>
                </div>
              </div>

              {/* Front Card: Artisan Hot Coffee Cup with GENTLE STEAM MOTION */}
              <div className="absolute right-0 sm:right-4 bottom-2 z-20 w-60 sm:w-68 rotate-3 rounded-[32px] border-2 border-[#C08A45]/50 bg-[#3A281E] p-3 shadow-lift transition-transform duration-500 hover:rotate-0">
                
                {/* Subtle Steam Wisps Rising from the Coffee Cup - Exactly One Gentle Animation */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-16 h-12 pointer-events-none overflow-visible flex justify-center">
                  <div className="w-2 h-8 rounded-full bg-gradient-to-t from-white/30 to-transparent blur-[3px] animate-steam-1" />
                  <div className="w-2.5 h-10 rounded-full bg-gradient-to-t from-white/35 to-transparent blur-[3px] animate-steam-2 -ml-1" />
                  <div className="w-2 h-7 rounded-full bg-gradient-to-t from-white/25 to-transparent blur-[3px] animate-steam-3 ml-1" />
                </div>

                <div className="relative aspect-4/5 w-full overflow-hidden rounded-[24px]">
                  <img
                    src={hotCoffeeCupImg}
                    alt="Artisan Hot Specialty Coffee"
                    className="size-full object-cover"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#241512]/90 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-center">
                    <span className="block font-display text-sm sm:text-base font-bold text-[#F3E7D6]">
                      Signature Roast
                    </span>
                    <span className="text-[0.65rem] text-[#C08A45] font-semibold tracking-widest uppercase">
                      Hot Specialty Coffee
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Scroll Indicator */}
        <div className="mt-8 flex justify-center">
          <a
            href="#menu"
            className="flex size-10 items-center justify-center rounded-full border border-[#8C5A32]/40 bg-[#3A281E]/60 text-[#C08A45] transition-all hover:bg-[#C08A45] hover:text-[#241512]"
            aria-label="Scroll to menu"
          >
            <ChevronDown className="size-5" />
          </a>
        </div>
      </section>

      {/* Main Menu Section */}
      <section id="menu" className="mx-auto max-w-7xl px-6 py-20 sm:px-10">
        <Reveal className="text-center">
          <span className="eyebrow inline-flex items-center gap-1.5 rounded-full bg-[#3A281E] border border-[#8C5A32]/40 px-4 py-1.5 text-[#C08A45]">
            <UtensilsCrossed className="size-3.5" /> OUR POPULAR MENU
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl md:text-5xl text-[#F3E7D6]">
            قائمة منيو كَيان
          </h2>
        </Reveal>

        {/* Dynamic Category Filter Pills */}
        {categories.length > 0 && (
          <Reveal delay={100}>
            <div className="mt-10 flex flex-wrap justify-center gap-2.5">
              <button
                onClick={() => setActive("All")}
                className={cn(
                  "rounded-full border px-6 py-3 text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer",
                  active === "All"
                    ? "border-[#C08A45] bg-[#C08A45] text-[#241512] shadow-lift scale-105"
                    : "border-[#8C5A32]/40 bg-[#3A281E] text-[#C9B79C] hover:border-[#C08A45]/60 hover:text-[#F3E7D6]",
                )}
              >
                الكل ({products.length})
              </button>

              {categoryNames.map((cat) => {
                const count = products.filter((p) => p.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setActive(cat)}
                    className={cn(
                      "rounded-full border px-6 py-3 text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer",
                      active === cat
                        ? "border-[#C08A45] bg-[#C08A45] text-[#241512] shadow-lift scale-105"
                        : "border-[#8C5A32]/40 bg-[#3A281E] text-[#C9B79C] hover:border-[#C08A45]/60 hover:text-[#F3E7D6]",
                    )}
                  >
                    {cat} {count > 0 && <span className="opacity-80 text-xs">({count})</span>}
                  </button>
                );
              })}
            </div>
          </Reveal>
        )}

        {/* Products Grid */}
        {filtered.length > 0 ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((product, i) => (
              <ProductCard key={product.id} product={product} delay={i * 50} />
            ))}
          </div>
        ) : (
          <div className="mt-12 rounded-3xl border border-dashed border-[#8C5A32]/40 bg-[#3A281E]/40 px-6 py-16 text-center text-[#C9B79C] shadow-soft">
            <UtensilsCrossed className="mx-auto size-12 text-[#C08A45]/70" />
            <h3 className="mt-4 font-display text-xl font-bold text-[#F3E7D6]">
              {products.length === 0
                ? "المنيو جاهز لإضافة الأصناف"
                : "لا توجد أصناف في هذا السيكشن حالياً"}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#C9B79C]">
              يمكنك إضافة الأصناف والأسعار وتحديث الصور من لوحة الإدارة بسهولة.
            </p>
            <div className="mt-6">
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-[#D49B52] via-[#C08A45] to-[#A36C2C] px-7 py-3 text-xs font-bold text-[#241512] shadow-lift transition-all hover:brightness-110 hover:scale-105"
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
