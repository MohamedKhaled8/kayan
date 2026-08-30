import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { ChevronDown, UtensilsCrossed, ArrowRight } from "lucide-react";
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
      { title: "KAYAN — Unlock a Superior Taste in Every Sip" },
      {
        name: "description",
        content: "Discover our artisan coffee, signature beverages, and curated cuisine at Kayan.",
      },
      { property: "og:title", content: "KAYAN — Premium Coffee & Dining" },
    ],
  }),
  component: HomePage,
});

export const hotCoffeeCupImg =
  "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=85";
export const coldDrinkCupImg =
  "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=800&q=85";

function HomePage() {
  const { products } = useProducts();
  const { categories } = useCategories();
  const [active, setActive] = useState<string>("All");

  // Smooth 3D depth swap state for the two cups
  const [isSwapped, setIsSwapped] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsSwapped((prev) => !prev);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

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

      {/* Hero Section */}
      <section className="relative flex min-h-[90vh] min-h-[660px] w-full flex-col justify-center overflow-hidden bg-coffee-texture pt-24 pb-16">
        
        <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 px-6 sm:px-10 lg:grid-cols-12 lg:gap-10">
          
          {/* Left Column: English Headline, Subtitle, and CTA */}
          <div className="flex flex-col text-left lg:col-span-6" dir="ltr">
            
            <Reveal delay={100}>
              <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold leading-[1.1] tracking-tight text-[#F3E7D6]">
                Unlock a<br />
                <span className="text-[#C08A45] font-serif italic">Superior Taste</span><br />
                in Every Sip!
              </h1>
            </Reveal>

            {/* Distinctively styled subtitle */}
            <Reveal delay={200}>
              <div className="mt-4 inline-flex items-center gap-3">
                <span className="h-[1.5px] w-8 bg-[#8C5A32]" />
                <span className="font-serif italic font-semibold text-lg sm:text-xl text-[#C08A45] tracking-wider">
                  Brewed For You
                </span>
              </div>
            </Reveal>

            <Reveal delay={300}>
              <p className="mt-5 max-w-lg text-base sm:text-lg leading-relaxed text-[#C9B79C] font-normal">
                Coffee is not just a drink, it's an art. We invite you on a unique coffee and culinary journey, where every sip and plate is crafted with pure passion.
              </p>
            </Reveal>

            <Reveal delay={400}>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="#menu"
                  className="group inline-flex items-center gap-3 rounded-full bg-[#C08A45] px-8 py-4 text-sm font-bold text-[#241512] shadow-lift transition-all duration-300 hover:bg-[#d49b52] hover:scale-105"
                >
                  <span>Explore Our Coffee & Menu</span>
                  <span className="flex size-7 items-center justify-center rounded-full bg-[#241512]/15 text-[#241512] transition-transform duration-300 group-hover:translate-x-1">
                    <ArrowRight className="size-4" />
                  </span>
                </a>
              </div>
            </Reveal>
          </div>

          {/* Right Column: Real Coffee Cup & Cold Drink Cup with Smooth 3D Depth Swap */}
          <div className="relative flex justify-center items-center lg:col-span-6 min-h-[440px] sm:min-h-[520px]">
            
            <div
              onClick={() => setIsSwapped((prev) => !prev)}
              className="relative size-full max-w-[500px] h-[460px] flex items-center justify-center cursor-pointer select-none"
              title="Click to swap cups (3D Depth View)"
            >
              
              {/* Cup 1: Real Hot Artisan Coffee Cup */}
              <div
                className={cn(
                  "absolute transition-all duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1)",
                  !isSwapped
                    ? "z-20 scale-100 translate-x-10 translate-y-0 opacity-100 drop-shadow-[0_20px_40px_rgba(0,0,0,0.85)] animate-cup-front"
                    : "z-10 scale-[0.82] -translate-x-16 translate-y-8 opacity-65 brightness-75 drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)] animate-cup-back"
                )}
              >
                <div className="relative w-64 sm:w-72 overflow-hidden rounded-[36px] border border-[#8C5A32]/40 bg-[#3A281E] p-3 shadow-lift">
                  <div className="relative aspect-4/5 w-full overflow-hidden rounded-[28px]">
                    <img
                      src={hotCoffeeCupImg}
                      alt="Artisan Hot Specialty Coffee"
                      className="size-full object-cover"
                      loading="eager"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#241512]/90 via-transparent to-transparent" />
                    
                    {/* Minimal Brand Badge */}
                    <div className="absolute bottom-4 left-4 right-4 text-center">
                      <span className="block font-display text-sm font-bold text-[#F3E7D6] tracking-wide">
                        Signature Roast
                      </span>
                      <span className="text-[0.65rem] text-[#C08A45] font-semibold tracking-widest uppercase">
                        Hot Specialty Coffee
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cup 2: Real Cold Chilled Drink / Pepsi Cup */}
              <div
                className={cn(
                  "absolute transition-all duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1)",
                  isSwapped
                    ? "z-20 scale-100 translate-x-10 translate-y-0 opacity-100 drop-shadow-[0_20px_40px_rgba(0,0,0,0.85)] animate-cup-front"
                    : "z-10 scale-[0.82] -translate-x-16 translate-y-8 opacity-65 brightness-75 drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)] animate-cup-back"
                )}
              >
                <div className="relative w-64 sm:w-72 overflow-hidden rounded-[36px] border border-[#8C5A32]/40 bg-[#3A281E] p-3 shadow-lift">
                  <div className="relative aspect-4/5 w-full overflow-hidden rounded-[28px]">
                    <img
                      src={coldDrinkCupImg}
                      alt="Iced Refreshing Beverage"
                      className="size-full object-cover"
                      loading="eager"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#241512]/90 via-transparent to-transparent" />
                    
                    {/* Minimal Brand Badge */}
                    <div className="absolute bottom-4 left-4 right-4 text-center">
                      <span className="block font-display text-sm font-bold text-[#F3E7D6] tracking-wide">
                        Iced Refresher
                      </span>
                      <span className="text-[0.65rem] text-[#C08A45] font-semibold tracking-widest uppercase">
                        Cold Chilled Beverage
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Scroll Indicator */}
        <div className="mt-6 flex justify-center">
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
                className="inline-flex items-center gap-2 rounded-full bg-[#C08A45] px-7 py-3 text-xs font-bold text-[#241512] shadow-lift transition-all hover:bg-[#d49b52] hover:scale-105"
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
