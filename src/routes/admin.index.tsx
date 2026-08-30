import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Cloud,
  Coffee,
  Cookie,
  Flame,
  FolderPlus,
  Grid,
  IceCream,
  ImagePlus,
  Layers,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { slugify, useProducts } from "@/lib/product-store";
import { useCategories, type CategoryItem } from "@/lib/category-store";
import { formatPrice, type Product } from "@/lib/products";
import {
  CLOUDINARY_CONFIG,
  uploadMultipleImagesToCloudinary,
  uploadImageToCloudinary,
  getOptimizedImageUrl,
} from "@/lib/cloudinary";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

type DraftProduct = {
  id: string | null;
  name: string;
  description: string;
  price: string;
  category: string;
  images: string[];
};

const emptyProductDraft = (defaultCat = ""): DraftProduct => ({
  id: null,
  name: "",
  description: "",
  price: "",
  category: defaultCat,
  images: [],
});

type DraftCategory = {
  id: string | null;
  name: string;
  description: string;
  icon: string;
};

const emptyCategoryDraft: DraftCategory = {
  id: null,
  name: "",
  description: "",
  icon: "Flame",
};

const AVAILABLE_ICONS = [
  { name: "Flame", label: "أطباق ووجبات", icon: Flame },
  { name: "IceCream", label: "مشروبات باردة ومثلجات", icon: IceCream },
  { name: "Coffee", label: "مشروبات ساخنة وقهوة", icon: Coffee },
  { name: "Cookie", label: "حلويات ومخبوزات", icon: Cookie },
  { name: "Sparkles", label: "عروض وسبيشال", icon: Sparkles },
  { name: "Layers", label: "سيكشن عام", icon: Layers },
];

function AdminDashboard() {
  const { products, upsert, remove, reset } = useProducts();
  const { categories, addCategory, updateCategory, removeCategory, resetCategories } = useCategories();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<"products" | "categories" | "cloudinary">("products");

  // Product filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");

  // Modals
  const [productDraft, setProductDraft] = useState<DraftProduct | null>(null);
  const [categoryDraft, setCategoryDraft] = useState<DraftCategory | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);

  // Cloudinary Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number; percent: number } | null>(null);
  const [manualImageUrl, setManualImageUrl] = useState("");

  // Test Cloudinary upload
  const [testUploadLoading, setTestUploadLoading] = useState(false);
  const [testUploadResult, setTestUploadResult] = useState<string | null>(null);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat =
        selectedCategoryFilter === "All" || p.category === selectedCategoryFilter;
      const matchSearch =
        !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, selectedCategoryFilter, searchQuery]);

  // Handle Product Save
  const saveProduct = () => {
    if (!productDraft) return;
    if (!productDraft.name.trim()) {
      toast.error("يرجى كتابة اسم المنتج");
      return;
    }
    const price = Number(productDraft.price);
    if (!Number.isFinite(price) || price < 0) {
      toast.error("يرجى إدخال سعر صحيح بالجنيه المصري");
      return;
    }
    if (!productDraft.category) {
      toast.error("يرجى اختيار قسم للمنتج");
      return;
    }

    const now = new Date().toISOString();
    const existing = productDraft.id ? products.find((p) => p.id === productDraft.id) : undefined;
    const finalImages = productDraft.images.length
      ? productDraft.images
      : ["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80"];

    upsert({
      id: productDraft.id ?? slugify(productDraft.name),
      name: productDraft.name.trim(),
      description: productDraft.description.trim(),
      price,
      category: productDraft.category,
      images: finalImages,
      created_at: existing?.created_at ?? now,
      updated_at: now,
    });

    toast.success(productDraft.id ? "تم تعديل المنتج بنجاح! ✨" : "تمت إضافة المنتج بنجاح! 🎉");
    setProductDraft(null);
  };

  // Handle Category Save
  const saveCategory = () => {
    if (!categoryDraft) return;
    if (!categoryDraft.name.trim()) {
      toast.error("يرجى إدخال اسم السيكشن / القسم");
      return;
    }

    if (categoryDraft.id) {
      updateCategory(categoryDraft.id, {
        name: categoryDraft.name.trim(),
        description: categoryDraft.description.trim(),
        icon: categoryDraft.icon,
      });
      toast.success("تم تحديث السيكشن بنجاح! ✨");
    } else {
      const created = addCategory(
        categoryDraft.name.trim(),
        categoryDraft.description.trim(),
        categoryDraft.icon,
      );
      if (created) {
        toast.success(`تم إنشاء سيكشن "${created.name}" بنجاح! وظهر فوراً في المنيو 🎉`);
      }
    }
    setCategoryDraft(null);
  };

  // Handle Multi-Image Upload to Cloudinary
  const handleCloudinaryFiles = async (files: FileList | null) => {
    if (!files || files.length === 0 || !productDraft) return;
    const fileArray = Array.from(files);

    setIsUploading(true);
    setUploadProgress({ current: 1, total: fileArray.length, percent: 0 });

    try {
      toast.info(`جاري رفع ${fileArray.length} صورة إلى Cloudinary...`);
      const uploadedUrls = await uploadMultipleImagesToCloudinary(
        fileArray,
        (current, total, percent) => {
          setUploadProgress({ current: current + 1, total, percent });
        },
      );

      setProductDraft((prev) =>
        prev
          ? {
              ...prev,
              images: [...prev.images, ...uploadedUrls],
            }
          : prev,
      );

      toast.success(`تم رفع ${uploadedUrls.length} صورة بنجاح إلى Cloudinary! ☁️`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "حدث خطأ أثناء رفع الصور إلى Cloudinary");
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  // Add Manual Image URL
  const addManualImage = () => {
    if (!manualImageUrl.trim() || !productDraft) return;
    setProductDraft({
      ...productDraft,
      images: [...productDraft.images, manualImageUrl.trim()],
    });
    setManualImageUrl("");
    toast.success("تمت إضافة رابط الصورة");
  };

  // Run a test upload to Cloudinary to verify integration
  const runCloudinaryTest = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setTestUploadLoading(true);
    setTestUploadResult(null);

    try {
      const url = await uploadImageToCloudinary(file);
      setTestUploadResult(url);
      toast.success("تم اختبار الرفع بنجاح! Cloudinary متصل ويعمل 100%");
    } catch (err: any) {
      toast.error(`فشل الاختبار: ${err.message}`);
    } finally {
      setTestUploadLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16">
      {/* Header & Tabs */}
      <header className="flex flex-col gap-5 border-b border-border/70 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="eyebrow">لوحة التحكم الإدارية</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[0.65rem] font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              تحديث فوري Realtime
            </span>
          </div>
          <h1 className="mt-1 font-display text-3xl md:text-4xl text-foreground">
            إدارة المنيو والسيكشنات
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            تحكم كامل في إضافة المنتجات، السيكشنات، والصور عبر Cloudinary بالجنيه المصري (EGP).
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-secondary/80 p-1.5">
          <button
            onClick={() => setActiveTab("products")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200",
              activeTab === "products"
                ? "bg-card text-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Grid className="size-4 text-copper" />
            المنتجات ({products.length})
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200",
              activeTab === "categories"
                ? "bg-card text-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Layers className="size-4 text-copper" />
            السيكشنات والأقسام ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab("cloudinary")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200",
              activeTab === "cloudinary"
                ? "bg-card text-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Cloud className="size-4 text-copper" />
            Cloudinary
          </button>
        </div>
      </header>

      {/* ================= PRODUCTS TAB ================= */}
      {activeTab === "products" && (
        <section className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Search & Category Filter */}
            <div className="flex flex-1 flex-wrap items-center gap-3">
              <div className="relative min-w-[220px] max-w-sm flex-1">
                <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث عن منتج..."
                  className="w-full rounded-xl border border-input bg-card pl-10 pr-4 py-2 text-sm outline-none transition-colors focus:border-copper"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="rounded-xl border border-input bg-card px-4 py-2 text-sm outline-none transition-colors focus:border-copper"
              >
                <option value="All">كل السيكشنات ({products.length})</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({products.filter((p) => p.category === c.name).length})
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  reset();
                  toast.success("تم مسح جميع المنتجات");
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <RotateCcw className="size-3.5" /> مسح الكل
              </button>
              <button
                onClick={() =>
                  setProductDraft(emptyProductDraft(categories[0]?.name || ""))
                }
                className="inline-flex items-center gap-2 rounded-xl bg-copper px-4 py-2 text-sm font-semibold text-copper-foreground transition-all duration-300 hover:shadow-lift"
              >
                <Plus className="size-4" /> إضافة منتج جديد
              </button>
            </div>
          </div>

          {/* Products Table */}
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/70 text-right">
                  <tr className="[&>th]:px-5 [&>th]:py-3.5 [&>th]:text-xs [&>th]:font-semibold [&>th]:tracking-[0.1em] [&>th]:text-muted-foreground">
                    <th className="text-right">المنتج والصور</th>
                    <th className="text-right">السيكشن / القسم</th>
                    <th className="text-right">السعر (EGP)</th>
                    <th className="hidden text-right md:table-cell">آخر تحديث</th>
                    <th className="text-left">التحكم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredProducts.map((p) => (
                    <tr
                      key={p.id}
                      className="transition-colors hover:bg-secondary/30"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-muted">
                            <img
                              src={getOptimizedImageUrl(p.images[0] || "", 120)}
                              alt={p.name}
                              loading="lazy"
                              className="size-full object-cover"
                            />
                            {p.images.length > 1 && (
                              <span className="absolute bottom-1 right-1 rounded-full bg-espresso/85 px-1.5 py-0.5 text-[0.6rem] font-bold text-espresso-foreground">
                                +{p.images.length}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-foreground">{p.name}</p>
                            <p className="line-clamp-1 text-xs text-muted-foreground">
                              {p.description || "لا يوجد وصف"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-medium text-foreground">
                          {p.category}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-display text-base font-semibold text-copper">
                        {formatPrice(p.price)}
                      </td>
                      <td className="hidden px-5 py-4 text-xs text-muted-foreground md:table-cell">
                        {new Date(p.updated_at).toLocaleDateString("ar-EG")}
                      </td>
                      <td className="px-5 py-4 text-left">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() =>
                              setProductDraft({
                                id: p.id,
                                name: p.name,
                                description: p.description,
                                price: String(p.price),
                                category: p.category,
                                images: p.images,
                              })
                            }
                            aria-label={`تعديل ${p.name}`}
                            className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            onClick={() => setDeletingProductId(p.id)}
                            aria-label={`حذف ${p.name}`}
                            className="rounded-lg border border-border p-2 text-destructive transition-colors hover:bg-destructive/10"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredProducts.length === 0 && (
              <div className="px-5 py-16 text-center text-muted-foreground">
                <p className="text-base font-medium">لا توجد منتجات مطابقة للبحث</p>
                <p className="mt-1 text-xs">اضغط على زر "إضافة منتج جديد" لإضافة صنف للمنيو</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ================= CATEGORIES TAB ================= */}
      {activeTab === "categories" && (
        <section className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-xl">إدارة السيكشنات والأقسام</h2>
              <p className="text-xs text-muted-foreground">
                أي سيكشن تضيفه هنا (مثل: وجبات، مشروبات، حلويات...) يظهر للمستخدم في المنيو فوراً ويمكنك ربط المنتجات به.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  resetCategories();
                  toast.success("تمت استعادة السيكشنات الافتراضية");
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <RotateCcw className="size-3.5" /> استعادة الافتراضي
              </button>
              <button
                onClick={() => setCategoryDraft(emptyCategoryDraft)}
                className="inline-flex items-center gap-2 rounded-xl bg-copper px-4 py-2 text-sm font-semibold text-copper-foreground transition-all duration-300 hover:shadow-lift"
              >
                <FolderPlus className="size-4" /> إضافة سيكشن جديد
              </button>
            </div>
          </div>

          {/* Categories Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => {
              const productCount = products.filter((p) => p.category === cat.name).length;
              return (
                <div
                  key={cat.id}
                  className="card-lift flex flex-col justify-between rounded-3xl border border-border bg-card p-5 shadow-soft"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="flex size-10 items-center justify-center rounded-2xl bg-secondary text-copper">
                        <Coffee className="size-5" />
                      </span>
                      <span className="rounded-full bg-copper/10 px-2.5 py-1 text-xs font-semibold text-copper">
                        {productCount} منتج
                      </span>
                    </div>
                    <h3 className="mt-4 font-display text-lg font-bold text-foreground">
                      {cat.name}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {cat.description || "سيكشن نشط في القائمة الرئيسية"}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-end gap-2 border-t border-border/60 pt-4">
                    <button
                      onClick={() =>
                        setCategoryDraft({
                          id: cat.id,
                          name: cat.name,
                          description: cat.description || "",
                          icon: cat.icon || "Coffee",
                        })
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <Pencil className="size-3.5" /> تعديل
                    </button>
                    <button
                      onClick={() => setDeletingCategoryId(cat.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
                    >
                      <Trash2 className="size-3.5" /> حذف
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ================= CLOUDINARY TAB ================= */}
      {activeTab === "cloudinary" && (
        <section className="space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft md:p-8">
            <div className="flex items-start gap-4">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-copper/10 text-copper">
                <Cloud className="size-6" />
              </div>
              <div className="space-y-1">
                <h2 className="font-display text-2xl font-bold">اتصال Cloudinary للتخزين السحابي</h2>
                <p className="text-sm text-muted-foreground">
                  تم ربط حساب Cloudinary بالكامل لرفع صور المنتجات مباشرة والحصول على روابط سريعة ومحسنة تلقائياً.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-secondary/60 p-4">
                <p className="eyebrow">Cloud Name</p>
                <p className="mt-1 font-mono text-sm font-bold text-foreground">
                  {CLOUDINARY_CONFIG.cloudName}
                </p>
              </div>
              <div className="rounded-2xl bg-secondary/60 p-4">
                <p className="eyebrow">API Key</p>
                <p className="mt-1 font-mono text-sm font-bold text-foreground">
                  {CLOUDINARY_CONFIG.apiKey}
                </p>
              </div>
              <div className="rounded-2xl bg-secondary/60 p-4">
                <p className="eyebrow">حالة الاتصال</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-4" /> متصل وجاهز للرفع
                </p>
              </div>
            </div>

            {/* Test Upload Button */}
            <div className="mt-8 rounded-2xl border border-dashed border-border p-6 text-center">
              <h3 className="text-base font-semibold">اختبار رفع صورة سريعة</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                يمكنك تجربة رفع صورة لاختبار الاستجابة اللحظية من Cloudinary
              </p>

              <div className="mt-4 flex flex-col items-center justify-center gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-secondary px-5 py-2.5 text-sm font-medium transition-colors hover:bg-secondary/80">
                  {testUploadLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin text-copper" />
                      جاري الرفع...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="size-4 text-copper" />
                      اختر ملف للاختبار
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={testUploadLoading}
                    onChange={runCloudinaryTest}
                    className="hidden"
                  />
                </label>

                {testUploadResult && (
                  <div className="mt-4 flex items-center gap-4 rounded-2xl border border-border bg-card p-3">
                    <img
                      src={testUploadResult}
                      alt="Uploaded result"
                      className="size-16 rounded-xl object-cover"
                    />
                    <div className="text-right">
                      <p className="text-xs font-semibold text-emerald-600">تم الرفع بنجاح!</p>
                      <a
                        href={testUploadResult}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-copper underline break-all"
                      >
                        {testUploadResult}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ================= PRODUCT MODAL (ADD / EDIT) ================= */}
      {productDraft && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-espresso/70 p-4 py-8 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-3xl bg-card p-6 shadow-lift animate-in zoom-in-95 duration-300 sm:p-8">
            <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-4">
              <div>
                <p className="eyebrow">{productDraft.id ? "تعديل بيانات المنتج" : "منتج جديد"}</p>
                <h2 className="mt-1 font-display text-2xl font-bold">
                  {productDraft.id ? productDraft.name : "إضافة منتج إلى المنيو"}
                </h2>
              </div>
              <button
                onClick={() => setProductDraft(null)}
                aria-label="إغلاق"
                className="rounded-lg border border-border p-2 transition-colors hover:bg-secondary"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-6 space-y-5">
              {/* Product Name */}
              <Field label="اسم المنتج (عربي / إنجليزي)">
                <input
                  type="text"
                  value={productDraft.name}
                  onChange={(e) => setProductDraft({ ...productDraft, name: e.target.value })}
                  className={inputCls}
                  placeholder="مثال: فلات وايت كَيان (Signature Flat White)"
                />
              </Field>

              {/* Product Description */}
              <Field label="الوصف والمكونات">
                <textarea
                  rows={3}
                  value={productDraft.description}
                  onChange={(e) =>
                    setProductDraft({ ...productDraft, description: e.target.value })
                  }
                  className={cn(inputCls, "resize-none")}
                  placeholder="تفاصيل المذاق، نوع الحبوب، المكونات، وطريقة التقديم..."
                />
              </Field>

              {/* Price & Category */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="السعر بالجنيه المصري (EGP)">
                  <div className="relative mt-2">
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={productDraft.price}
                      onChange={(e) =>
                        setProductDraft({ ...productDraft, price: e.target.value })
                      }
                      className={inputCls}
                      placeholder="85"
                    />
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                      ج.م
                    </span>
                  </div>
                </Field>

                <Field label="السيكشن / القسم التابع له">
                  <div className="mt-2 flex gap-2">
                    <select
                      value={productDraft.category}
                      onChange={(e) =>
                        setProductDraft({ ...productDraft, category: e.target.value })
                      }
                      className={cn(inputCls, "mt-0 flex-1")}
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </Field>
              </div>

              {/* Multi-Image Cloudinary Uploader */}
              <Field label="صور المنتج (رفع مباشر على Cloudinary مع دعم صور متعددة)">
                {/* Upload Progress Indicator */}
                {isUploading && uploadProgress && (
                  <div className="my-3 rounded-2xl bg-secondary/80 p-4">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="flex items-center gap-2 text-copper">
                        <Loader2 className="size-4 animate-spin" />
                        جاري رفع الصورة {uploadProgress.current} من {uploadProgress.total}...
                      </span>
                      <span>{uploadProgress.percent}%</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-border">
                      <div
                        className="h-full bg-copper transition-all duration-300"
                        style={{ width: `${uploadProgress.percent}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Images Grid */}
                <div className="mt-3 flex flex-wrap gap-3">
                  {productDraft.images.map((src, i) => (
                    <div key={src + i} className="group relative size-24 overflow-hidden rounded-2xl border border-border shadow-soft">
                      <img
                        src={getOptimizedImageUrl(src, 200)}
                        alt={`صورة ${i + 1}`}
                        className="size-full object-cover"
                      />
                      {i === 0 && (
                        <span className="absolute bottom-1 right-1 rounded-md bg-espresso/90 px-1.5 py-0.5 text-[0.6rem] font-bold text-copper">
                          الرئيسية
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setProductDraft({
                            ...productDraft,
                            images: productDraft.images.filter((_, j) => j !== i),
                          })
                        }
                        aria-label="حذف الصورة"
                        className="absolute -top-1.5 -right-1.5 flex size-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-soft transition-transform hover:scale-110"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  ))}

                  {/* Cloudinary Dropzone / File Picker */}
                  <label className="flex size-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-border bg-secondary/40 text-[0.7rem] text-muted-foreground transition-all hover:border-copper hover:bg-copper/5 hover:text-copper">
                    <ImagePlus className="size-5" />
                    <span className="font-semibold">رفع صور</span>
                    <span className="text-[0.6rem] opacity-75">Cloudinary</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={isUploading}
                      className="hidden"
                      onChange={(e) => handleCloudinaryFiles(e.target.files)}
                    />
                  </label>
                </div>

                {/* Direct URL input fallback */}
                <div className="mt-3 flex gap-2">
                  <input
                    type="url"
                    value={manualImageUrl}
                    onChange={(e) => setManualImageUrl(e.target.value)}
                    placeholder="أو ألصق رابط صورة خارجي مباشر..."
                    className="flex-1 rounded-xl border border-input bg-background px-3 py-1.5 text-xs outline-none focus:border-copper"
                  />
                  <button
                    type="button"
                    onClick={addManualImage}
                    className="rounded-xl border border-border bg-secondary px-3 py-1.5 text-xs font-semibold hover:bg-secondary/80"
                  >
                    إضافة الرابط
                  </button>
                </div>
              </Field>
            </div>

            {/* Modal Actions */}
            <div className="mt-8 flex items-center justify-end gap-3 border-t border-border/60 pt-4">
              <button
                type="button"
                onClick={() => setProductDraft(null)}
                className="rounded-xl border border-border px-5 py-2.5 text-sm transition-colors hover:bg-secondary"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={saveProduct}
                disabled={isUploading}
                className="rounded-xl bg-copper px-6 py-2.5 text-sm font-semibold text-copper-foreground transition-all duration-300 hover:shadow-lift disabled:opacity-60"
              >
                {productDraft.id ? "حفظ التعديلات" : "إضافة المنتج للمنيو"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= CATEGORY MODAL (ADD / EDIT) ================= */}
      {categoryDraft && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-espresso/70 p-4 py-10 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-card p-6 shadow-lift animate-in zoom-in-95 duration-300 sm:p-8">
            <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-4">
              <div>
                <p className="eyebrow">{categoryDraft.id ? "تعديل السيكشن" : "سيكشن جديد"}</p>
                <h2 className="mt-1 font-display text-2xl font-bold">
                  {categoryDraft.id ? `تعديل سيكشن ${categoryDraft.name}` : "إضافة سيكشن جديد للمنيو"}
                </h2>
              </div>
              <button
                onClick={() => setCategoryDraft(null)}
                aria-label="إغلاق"
                className="rounded-lg border border-border p-2 transition-colors hover:bg-secondary"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <Field label="اسم السيكشن / القسم">
                <input
                  type="text"
                  value={categoryDraft.name}
                  onChange={(e) => setCategoryDraft({ ...categoryDraft, name: e.target.value })}
                  className={inputCls}
                  placeholder="مثال: وجبات رئيسية، ساندوتشات، مشروبات باردة، حلويات..."
                />
              </Field>

              <Field label="وصف السيكشن (اختياري)">
                <textarea
                  rows={2}
                  value={categoryDraft.description}
                  onChange={(e) =>
                    setCategoryDraft({ ...categoryDraft, description: e.target.value })
                  }
                  className={cn(inputCls, "resize-none")}
                  placeholder="نبذة سريعة تظهر للزبائن عن هذا القسم..."
                />
              </Field>

              <Field label="أيقونة السيكشن">
                <div className="mt-2 flex flex-wrap gap-2">
                  {AVAILABLE_ICONS.map((item) => {
                    const IconComp = item.icon;
                    const isSelected = categoryDraft.icon === item.name;
                    return (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => setCategoryDraft({ ...categoryDraft, icon: item.name })}
                        className={cn(
                          "flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium transition-all",
                          isSelected
                            ? "border-copper bg-copper text-copper-foreground shadow-soft"
                            : "border-border bg-secondary/50 text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <IconComp className="size-4" />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </Field>
            </div>

            <div className="mt-8 flex items-center justify-end gap-3 border-t border-border/60 pt-4">
              <button
                type="button"
                onClick={() => setCategoryDraft(null)}
                className="rounded-xl border border-border px-5 py-2.5 text-sm transition-colors hover:bg-secondary"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={saveCategory}
                className="rounded-xl bg-copper px-6 py-2.5 text-sm font-semibold text-copper-foreground transition-all duration-300 hover:shadow-lift"
              >
                {categoryDraft.id ? "حفظ التعديلات" : "إنشاء السيكشن"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= DELETE PRODUCT CONFIRMATION ================= */}
      {deletingProductId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-espresso/70 p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-card p-6 shadow-lift text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <AlertCircle className="size-6" />
            </div>
            <h3 className="mt-4 font-display text-xl font-bold">تأكيد حذف المنتج</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              هل أنت متأكد من رغبتك في حذف هذا المنتج من المنيو؟ لن يتمكن الزبائن من رؤيته.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setDeletingProductId(null)}
                className="rounded-xl border border-border px-5 py-2.5 text-sm hover:bg-secondary"
              >
                تراجع
              </button>
              <button
                onClick={() => {
                  remove(deletingProductId);
                  setDeletingProductId(null);
                  toast.success("تم حذف المنتج بنجاح");
                }}
                className="rounded-xl bg-destructive px-5 py-2.5 text-sm font-semibold text-destructive-foreground hover:opacity-90"
              >
                نعم، احذف المنتج
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= DELETE CATEGORY CONFIRMATION ================= */}
      {deletingCategoryId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-espresso/70 p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-card p-6 shadow-lift text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <AlertCircle className="size-6" />
            </div>
            <h3 className="mt-4 font-display text-xl font-bold">تأكيد حذف السيكشن</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              هل أنت متأكد من حذف هذا السيكشن؟ سيتم إزالته فوراً من فلتر القائمة الرئيسية.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setDeletingCategoryId(null)}
                className="rounded-xl border border-border px-5 py-2.5 text-sm hover:bg-secondary"
              >
                تراجع
              </button>
              <button
                onClick={() => {
                  removeCategory(deletingCategoryId);
                  setDeletingCategoryId(null);
                  toast.success("تم حذف السيكشن بنجاح");
                }}
                className="rounded-xl bg-destructive px-5 py-2.5 text-sm font-semibold text-destructive-foreground hover:opacity-90"
              >
                نعم، احذف السيكشن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-copper";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-right">
      <span className="eyebrow">{label}</span>
      {children}
    </label>
  );
}
