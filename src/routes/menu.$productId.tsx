import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Expand,
  Minus,
  Plus,
  ShoppingBag,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Reveal } from "@/components/Reveal";
import { useProducts } from "@/lib/product-store";
import { formatPrice, type Product } from "@/lib/products";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import { useOrders } from "@/lib/order-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/menu/$productId")({
  head: () => ({
    meta: [
      { title: "تفاصيل الصنف — KAYAN CAFÉ" },
      {
        name: "description",
        content: "المكونات، السعر ومعرض الصور لهذا الصنف في كَيان.",
      },
      { property: "og:title", content: "تفاصيل الصنف — KAYAN CAFÉ" },
    ],
  }),
  component: ProductDetailPage,
});

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────
function ProductDetailPage() {
  const { productId } = Route.useParams();
  const { products } = useProducts();
  const product = products.find((p) => p.id === productId);

  const [imgIndex, setImgIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  // Order state
  const [quantity, setQuantity] = useState(1);
  const [tableNumber, setTableNumber] = useState<number | "">("");
  const [tableError, setTableError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);

  const { placeOrder } = useOrders();

  useEffect(() => {
    setImgIndex(0);
    setQuantity(1);
    setTableNumber("");
    setTableError("");
    setOrderSuccess(false);
  }, [productId]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setLightbox(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  // ──── Not found ────
  if (!product) {
    return (
      <div className="page-enter min-h-screen bg-[#0B0705] text-[#F5EFE6]">
        <SiteHeader />
        <div className="mx-auto max-w-xl px-5 py-32 text-center">
          <h1 className="font-display text-3xl font-normal text-[#F5EFE6]">
            لم نتمكن من العثور على هذا الصنف
          </h1>
          <p className="mt-3 text-[#BFB096]">قد يكون تم تحديث القائمة أو نقل الصنف.</p>
          <BackLink className="mt-8 inline-flex" />
        </div>
        <SiteFooter />
      </div>
    );
  }

  const images = product.images?.length
    ? product.images
    : ["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80"];

  const totalPrice = product.price * (quantity || 1);

  // ──── Submit order ────
  const handleOrder = async () => {
    if (!tableNumber || Number(tableNumber) < 1) {
      setTableError("يرجى إدخال رقم الطرابيزة");
      return;
    }
    setTableError("");
    setIsOrdering(true);

    await new Promise((r) => setTimeout(r, 800));

    placeOrder(Number(tableNumber), [
      {
        productId: product.id,
        productName: product.name,
        productImage: images[0] ?? "",
        unitPrice: product.price,
        quantity,
      },
    ]);

    setIsOrdering(false);
    setOrderSuccess(true);
  };

  // ──── Success screen ────
  if (orderSuccess) {
    return (
      <OrderSuccessScreen
        product={product}
        quantity={quantity}
        tableNumber={Number(tableNumber)}
        totalPrice={totalPrice}
        onBack={() => setOrderSuccess(false)}
      />
    );
  }

  return (
    <div className="page-enter min-h-screen bg-[#0B0705] text-[#F5EFE6]">
      <SiteHeader />

      <div className="mx-auto max-w-5xl px-6 pt-28 sm:px-10">
        <BackLink />
      </div>

      <div className="mx-auto max-w-5xl px-6 py-10 sm:px-10">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:gap-14">
          {/* ── Gallery ── */}
          <div className="w-full md:w-[360px] lg:w-[420px] shrink-0 md:sticky md:top-28">
            <button
              onClick={() => setLightbox(true)}
              className="group relative block w-full overflow-hidden rounded-3xl border border-[#DFBA73]/30 bg-[#170F0A] shadow-soft cursor-zoom-in"
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
                    i === imgIndex
                      ? "opacity-100"
                      : "absolute inset-0 opacity-0 pointer-events-none",
                  )}
                />
              ))}
              <span className="absolute left-4 bottom-4 flex items-center gap-1.5 rounded-full bg-[#0B0705]/90 px-3.5 py-1.5 text-xs text-[#F5EFE6] backdrop-blur border border-[#DFBA73]/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100 shadow-sm">
                <Expand className="size-3.5 text-[#DFBA73]" /> تكبير الصورة
              </span>
            </button>

            {images.length > 1 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {images.map((src, i) => (
                  <button
                    key={src + i}
                    onClick={() => setImgIndex(i)}
                    aria-label={`عرض الصورة ${i + 1}`}
                    className={cn(
                      "size-18 overflow-hidden rounded-2xl border-2 transition-all duration-200",
                      i === imgIndex
                        ? "border-[#DFBA73] shadow-soft opacity-100 scale-105"
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

          {/* ── Details + Order Panel ── */}
          <Reveal delay={80} className="flex-1 min-w-0 text-right">
            <span className="eyebrow text-[#DFBA73]">{product.category}</span>
            <h1 className="mt-3 font-display text-3xl font-normal leading-tight sm:text-4xl md:text-5xl text-[#F5EFE6]">
              {product.name}
            </h1>

            {/* Price */}
            <div className="mt-5 inline-flex items-baseline gap-2">
              <span className="font-display text-4xl font-bold text-[#DFBA73]">
                {formatPrice(product.price)}
              </span>
              <span className="text-sm text-[#BFB096] font-light">للوحدة</span>
            </div>

            <p className="mt-4 text-base leading-relaxed text-[#BFB096] sm:text-lg font-light">
              {product.description}
            </p>

            {/* ── Order Controls ── */}
            <div className="mt-8 space-y-0">

              {/* Row: Quantity + Table */}
              <div className="flex items-end gap-3">

                {/* Quantity */}
                <div className="flex-1">
                  <p className="mb-2 text-[0.6rem] font-black tracking-[0.2em] text-[#DFBA73]/60 uppercase">الكمية</p>
                  <div className="flex items-center rounded-xl border border-[#DFBA73]/18 bg-[#140D09] h-11 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="flex h-full w-11 shrink-0 items-center justify-center text-[#BFB096] hover:text-[#DFBA73] active:scale-90 transition-all"
                      aria-label="تقليل"
                    >
                      <Minus className="size-3.5" strokeWidth={2.5} />
                    </button>
                    <span className="flex-1 text-center font-display text-base font-bold text-[#F5EFE6] tabular-nums select-none">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="flex h-full w-11 shrink-0 items-center justify-center text-[#BFB096] hover:text-[#DFBA73] active:scale-90 transition-all"
                      aria-label="زيادة"
                    >
                      <Plus className="size-3.5" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>

                {/* Table number */}
                <div className="flex-1">
                  <label htmlFor="table-input" className="mb-2 block text-[0.6rem] font-black tracking-[0.2em] text-[#DFBA73]/60 uppercase">
                    رقم الطرابيزة
                  </label>
                  <input
                    id="table-input"
                    type="number"
                    min={1}
                    max={99}
                    value={tableNumber}
                    onChange={(e) => {
                      setTableNumber(e.target.value === "" ? "" : Number(e.target.value));
                      setTableError("");
                    }}
                    placeholder="—"
                    className={cn(
                      "h-11 w-full rounded-xl border bg-[#140D09] px-3 text-center font-display text-base font-bold text-[#F5EFE6] outline-none transition-all placeholder:text-[#BFB096]/20",
                      tableError ? "border-red-500" : "border-[#DFBA73]/18 focus:border-[#DFBA73]/50",
                    )}
                    dir="ltr"
                  />
                </div>
              </div>

              {tableError && (
                <p className="pt-1.5 text-xs text-red-400 font-semibold animate-in fade-in">
                  {tableError}
                </p>
              )}

              {/* Total + CTA */}
              <div className="pt-6">
                <div className="mb-3.5 flex items-center justify-between">
                  <span className="font-display text-2xl font-bold text-[#F5EFE6] tabular-nums transition-all duration-300">
                    {formatPrice(totalPrice)}
                  </span>
                  <span className="text-xs text-[#BFB096]/70">
                    {quantity > 1 ? `${quantity} × ${formatPrice(product.price)}` : "الإجمالي"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleOrder}
                  disabled={isOrdering}
                  className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-[#DFBA73] px-6 py-3.5 text-sm font-black tracking-widest text-[#0B0705] uppercase transition-all duration-300 hover:bg-[#F0E2BB] hover:scale-[1.015] active:scale-[0.985] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isOrdering ? (
                    <>
                      <span className="size-4 rounded-full border-2 border-[#0B0705] border-t-transparent animate-spin" />
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="size-5" />
                      أطلب الآن
                    </>
                  )}
                </button>
              </div>

            </div>
          </Reveal>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0705]/95 p-4 animate-in fade-in duration-300"
          onClick={() => setLightbox(false)}
        >
          <button
            onClick={() => setLightbox(false)}
            aria-label="إغلاق"
            className="absolute top-6 right-6 flex size-11 items-center justify-center rounded-full border border-white/20 text-[#F5EFE6] transition-colors hover:bg-white/10"
          >
            <X className="size-5" />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setImgIndex((i) => (i > 0 ? i - 1 : images.length - 1));
                }}
                className="absolute left-6 top-1/2 -translate-y-1/2 flex size-11 items-center justify-center rounded-full bg-[#170F0A] text-[#F5EFE6] border border-[#DFBA73]/30 hover:bg-[#DFBA73] hover:text-[#0B0705]"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setImgIndex((i) => (i < images.length - 1 ? i + 1 : 0));
                }}
                className="absolute right-6 top-1/2 -translate-y-1/2 flex size-11 items-center justify-center rounded-full bg-[#170F0A] text-[#F5EFE6] border border-[#DFBA73]/30 hover:bg-[#DFBA73] hover:text-[#0B0705]"
              >
                <ChevronRight className="size-5" />
              </button>
            </>
          )}

          <img
            src={images[imgIndex]}
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

// ─────────────────────────────────────────────────────────────────────────────
// Order Success Screen
// ─────────────────────────────────────────────────────────────────────────────
function OrderSuccessScreen({
  product,
  quantity,
  tableNumber,
  totalPrice,
  onBack,
}: {
  product: Product;
  quantity: number;
  tableNumber: number;
  totalPrice: number;
  onBack: () => void;
}) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 400);
    const t2 = setTimeout(() => setStep(2), 900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0705] flex flex-col items-center justify-center px-6 py-16 text-center">
      {/* Animated checkmark ring */}
      <div
        className={cn(
          "relative flex size-28 items-center justify-center rounded-full border-2 transition-all duration-700",
          step >= 1
            ? "border-[#DFBA73] scale-100 opacity-100"
            : "border-[#DFBA73]/20 scale-75 opacity-0",
        )}
      >
        <div className="absolute inset-0 rounded-full bg-[#DFBA73]/10 animate-ping" />
        <CheckCircle2
          className={cn(
            "size-14 text-[#DFBA73] transition-all duration-500",
            step >= 1 ? "scale-100 opacity-100" : "scale-50 opacity-0",
          )}
          strokeWidth={1.5}
        />
      </div>

      {/* Message */}
      <div
        className={cn(
          "mt-8 transition-all duration-500",
          step >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        )}
      >
        <p className="font-serif text-sm font-semibold tracking-[0.4em] text-[#DFBA73] uppercase">
          ✦ تم استلام طلبك ✦
        </p>
        <h1 className="mt-3 font-display text-4xl sm:text-5xl font-normal text-[#F5EFE6]">
          جاري التحضير!
        </h1>
        <p className="mt-3 text-base text-[#BFB096] max-w-sm mx-auto">
          طلبك في طريقه إليك. اجلس مرتاحاً وسنصلك بأسرع وقت.
        </p>

        {/* Order Summary Card */}
        <div className="mx-auto mt-8 max-w-sm rounded-3xl border border-[#DFBA73]/25 bg-[#170F0A] p-6 text-right shadow-soft space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#BFB096]">رقم الطرابيزة</span>
            <span className="font-bold text-[#DFBA73] text-lg font-display">#{tableNumber}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#BFB096]">الصنف</span>
            <span className="font-semibold text-[#F5EFE6]">{product.name}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#BFB096]">الكمية</span>
            <span className="font-bold text-[#F5EFE6]">{quantity}</span>
          </div>
          <div className="flex items-center justify-between border-t border-[#DFBA73]/15 pt-3">
            <span className="text-[#BFB096]">الإجمالي</span>
            <span className="font-display text-xl font-bold text-[#DFBA73]">
              {formatPrice(totalPrice)}
            </span>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
          <button
            onClick={onBack}
            className="rounded-2xl border border-[#DFBA73]/40 bg-[#170F0A] px-8 py-3 text-xs font-bold tracking-widest text-[#BFB096] uppercase transition-all hover:text-[#DFBA73] hover:border-[#DFBA73]"
          >
            إضافة طلب آخر
          </button>
          <Link
            to="/"
            className="rounded-2xl bg-[#DFBA73] px-8 py-3 text-xs font-black tracking-widest text-[#0B0705] uppercase shadow-lift transition-all hover:bg-[#F5EFE6] hover:scale-105"
          >
            العودة للمنيو
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BackLink helper
// ─────────────────────────────────────────────────────────────────────────────
function BackLink({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      className={cn(
        "group inline-flex items-center gap-2 text-sm font-medium text-[#BFB096] transition-colors hover:text-[#DFBA73]",
        className,
      )}
    >
      <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
      العودة إلى المنيو الرئيسي
    </Link>
  );
}
