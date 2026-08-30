import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Reveal } from "@/components/Reveal";
import { useProducts } from "@/lib/product-store";
import { formatPrice } from "@/lib/products";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/menu/$productId")({
  head: () => ({
    meta: [
      { title: "تفاصيل الصنف — كَيان" },
      {
        name: "description",
        content: "المكونات، السعر ومعرض الصور لهذا الصنف في كَيان.",
      },
      { property: "og:title", content: "تفاصيل الصنف — كَيان" },
    ],
  }),
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { productId } = Route.useParams();
  const { products } = useProducts();
  const product = products.find((p) => p.id === productId);
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    setIndex(0);
  }, [productId]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setLightbox(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  if (!product) {
    return (
      <div className="page-enter min-h-screen bg-[#241512] text-[#F3E7D6]">
        <SiteHeader />
        <div className="mx-auto max-w-xl px-5 py-32 text-center">
          <h1 className="font-display text-3xl font-bold">لم نتمكن من العثور على هذا الصنف</h1>
          <p className="mt-3 text-[#C9B79C]">قد يكون تم تحديث القائمة أو نقل الصنف.</p>
          <BackLink className="mt-8 inline-flex" />
        </div>
        <SiteFooter />
      </div>
    );
  }

  const images = product.images?.length
    ? product.images
    : ["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80"];

  return (
    <div className="page-enter min-h-screen bg-[#241512] text-[#F3E7D6]">
      <SiteHeader />

      <div className="mx-auto max-w-7xl px-6 pt-28 sm:px-10">
        <BackLink />
      </div>

      <div className="mx-auto max-w-5xl px-6 py-10 sm:px-10">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:gap-14">
          {/* Gallery — constrained, not full-bleed */}
          <div className="w-full md:w-[340px] lg:w-[400px] shrink-0 md:sticky md:top-28">
            <button
              onClick={() => setLightbox(true)}
              className="group relative block w-full overflow-hidden rounded-3xl shadow-lift cursor-zoom-in"
              aria-label="تكبير الصورة"
            >
              {images.map((src, i) => (
                <img
                  key={src + i}
                  src={getOptimizedImageUrl(src, 800)}
                  alt={`${product.name} — صورة ${i + 1}`}
                  loading={i === 0 ? "eager" : "lazy"}
                  className={cn(
                    "aspect-square w-full object-cover transition-opacity duration-500 ease-out",
                    i === index ? "opacity-100" : "absolute inset-0 opacity-0 pointer-events-none",
                  )}
                />
              ))}
              <span className="absolute left-4 bottom-4 flex items-center gap-1.5 rounded-full bg-[#241512]/85 px-3 py-1.5 text-xs text-[#F3E7D6] backdrop-blur border border-[#8C5A32]/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <Expand className="size-3.5 text-[#C08A45]" /> تكبير الصورة
              </span>
            </button>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {images.map((src, i) => (
                  <button
                    key={src + i}
                    onClick={() => setIndex(i)}
                    aria-label={`عرض الصورة ${i + 1}`}
                    className={cn(
                      "size-18 overflow-hidden rounded-2xl border-2 transition-all duration-200",
                      i === index
                        ? "border-[#C08A45] shadow-soft opacity-100 scale-105"
                        : "border-transparent opacity-60 hover:opacity-100",
                    )}
                  >
                    <img
                      src={getOptimizedImageUrl(src, 160)}
                      alt=""
                      loading="lazy"
                      className="size-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details — right side */}
          <Reveal delay={80} className="flex-1 min-w-0 text-right">
          <Reveal delay={120}>
            <span className="eyebrow text-[#C08A45]">{product.category}</span>
            <h1 className="mt-3 font-display text-3xl font-bold leading-tight sm:text-4xl md:text-5xl text-[#F3E7D6]">
              {product.name}
            </h1>
            <p className="mt-4 font-display text-3xl font-bold text-[#C08A45]">
              {formatPrice(product.price)}
            </p>
          </Reveal>

          <Reveal delay={240}>
            <p className="mt-6 text-base leading-relaxed text-[#C9B79C] sm:text-lg">
              {product.description}
            </p>
          </Reveal>

          </Reveal>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#241512]/95 p-4 animate-in fade-in duration-300"
          onClick={() => setLightbox(false)}
        >
          <button
            onClick={() => setLightbox(false)}
            aria-label="إغلاق"
            className="absolute top-6 right-6 flex size-11 items-center justify-center rounded-full border border-[#8C5A32]/40 text-[#F3E7D6] transition-colors hover:bg-[#3A281E]"
          >
            <X className="size-5" />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIndex((i) => (i > 0 ? i - 1 : images.length - 1));
                }}
                className="absolute left-6 top-1/2 -translate-y-1/2 flex size-11 items-center justify-center rounded-full bg-[#3A281E] text-[#F3E7D6] border border-[#8C5A32]/40 hover:bg-[#C08A45] hover:text-[#241512]"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIndex((i) => (i < images.length - 1 ? i + 1 : 0));
                }}
                className="absolute right-6 top-1/2 -translate-y-1/2 flex size-11 items-center justify-center rounded-full bg-[#3A281E] text-[#F3E7D6] border border-[#8C5A32]/40 hover:bg-[#C08A45] hover:text-[#241512]"
              >
                <ChevronRight className="size-5" />
              </button>
            </>
          )}

          <img
            src={images[index]}
            alt={product.name}
            className="max-h-[85vh] max-w-full rounded-2xl object-contain animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <SiteFooter />
    </div>
  );
}

function BackLink({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      className={cn(
        "group inline-flex items-center gap-2 text-sm font-medium text-[#C9B79C] transition-colors hover:text-[#C08A45]",
        className,
      )}
    >
      <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
      العودة إلى المنيو الرئيسي
    </Link>
  );
}
