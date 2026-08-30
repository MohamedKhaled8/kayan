import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Coffee,
  Cookie,
  Flame,
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
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { slugify, useProducts } from "@/lib/product-store";
import { useCategories, type CategoryItem } from "@/lib/category-store";
import { formatPrice, type Product } from "@/lib/products";
import {
  uploadMultipleImagesToCloudinary,
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
  icon: "Coffee",
};

const AVAILABLE_ICONS = [
  { name: "Coffee", label: "مشروبات ساخنة وقهوة", icon: Coffee },
  { name: "IceCream", label: "مشروبات باردة ومثلجات", icon: IceCream },
  { name: "Cookie", label: "حلويات ومخبوزات", icon: Cookie },
  { name: "Flame", label: "عصائر وفرابيه", icon: Flame },
  { name: "Sparkles", label: "عروض وسبيشال", icon: Sparkles },
  { name: "Layers", label: "قسم عام", icon: Layers },
];

function AdminDashboard() {
  const { products, upsert, remove, reset } = useProducts();
  const { categories, addCategory, updateCategory, removeCategory, resetCategories } = useCategories();

  // Navigation tab (Only Products & Categories)
  const [activeTab, setActiveTab] = useState<"products" | "categories">("products");

  // Product filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");

  // Modals
  const [productDraft, setProductDraft] = useState<DraftProduct | null>(null);
  const [categoryDraft, setCategoryDraft] = useState<DraftCategory | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number; percent: number } | null>(null);
  const [manualImageUrl, setManualImageUrl] = useState("");

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat =
        selectedCategoryFilter === "All" || p.category === selectedCategoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [products, searchQuery, selectedCategoryFilter]);

  // Handle Product Save
  const saveProduct = () => {
    if (!productDraft) return;
    if (!productDraft.name.trim()) {
      toast.error("يرجى إدخال اسم الصنف");
      return;
    }
    const price = parseFloat(productDraft.price);
    if (isNaN(price) || price < 0) {
      toast.error("يرجى إدخال سعر صحيح للصنف");
      return;
    }
    if (!productDraft.category) {
      toast.error("يرجى اختيار القسم التابع له الصنف");
      return;
    }

    const now = new Date().toISOString();
    const existing = products.find((p) => p.id === productDraft.id);
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

    toast.success(productDraft.id ? "تم تعديل الصنف بنجاح!" : "تمت إضافة الصنف بنجاح!");
    setProductDraft(null);
  };

  // Handle Category Save
  const saveCategory = () => {
    if (!categoryDraft) return;
    if (!categoryDraft.name.trim()) {
      toast.error("يرجى إدخال اسم القسم");
      return;
    }

    if (categoryDraft.id) {
      updateCategory(categoryDraft.id, {
        name: categoryDraft.name.trim(),
        description: categoryDraft.description.trim(),
        icon: categoryDraft.icon,
      });
      toast.success("تم تحديث القسم بنجاح!");
    } else {
      const created = addCategory(
        categoryDraft.name.trim(),
        categoryDraft.description.trim(),
        categoryDraft.icon,
      );
      if (created) {
        toast.success(`تم إنشاء قسم "${created.name}" بنجاح!`);
      }
    }
    setCategoryDraft(null);
  };

  // Handle Image Files Upload
  const handleFilesUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !productDraft) return;
    const fileArray = Array.from(files);

    setIsUploading(true);
    setUploadProgress({ current: 1, total: fileArray.length, percent: 0 });

    try {
      toast.info(`جاري رفع ${fileArray.length} صورة...`);
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

      toast.success(`تم رفع ${uploadedUrls.length} صورة بنجاح!`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "حدث خطأ أثناء رفع الصور");
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

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16 font-sans text-right">
      {/* Header & Tabs */}
      <header className="flex flex-col gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">لوحة الإدارة</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[0.65rem] font-bold text-emerald-700">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              مزامنة فورية Realtime
            </span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-black text-slate-900">
            إدارة المنيو والأقسام
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            إضافة وتعديل الأصناف، الأسعار، الأقسام، والصور لكَيان كافيه.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-slate-200/80 p-1.5">
          <button
            onClick={() => setActiveTab("products")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-200 cursor-pointer",
              activeTab === "products"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900",
            )}
          >
            <Grid className="size-4" />
            الأصناف ({products.length})
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-200 cursor-pointer",
              activeTab === "categories"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900",
            )}
          >
            <Layers className="size-4" />
            الأقسام ({categories.length})
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
                <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث عن صنف..."
                  className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-blue-600"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-blue-600"
              >
                <option value="All">كل الأقسام ({products.length})</option>
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
                  toast.success("تم مسح جميع الأصناف");
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-red-600"
              >
                <RotateCcw className="size-3.5" /> مسح الكل
              </button>
              <button
                onClick={() =>
                  setProductDraft(emptyProductDraft(categories[0]?.name || ""))
                }
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:bg-blue-700 shadow-sm"
              >
                <Plus className="size-4" /> إضافة صنف جديد
              </button>
            </div>
          </div>

          {/* Products Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="bg-slate-100/80 text-slate-600 border-b border-slate-200">
                  <tr className="[&>th]:px-5 [&>th]:py-3.5 [&>th]:text-xs [&>th]:font-bold [&>th]:tracking-wider">
                    <th>الصنف والصور</th>
                    <th>القسم</th>
                    <th>السعر (جنيه)</th>
                    <th className="hidden md:table-cell">آخر تحديث</th>
                    <th className="text-left">التحكم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {filteredProducts.map((p) => (
                    <tr
                      key={p.id}
                      className="transition-colors hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-slate-100 border border-slate-200">
                            <img
                              src={getOptimizedImageUrl(p.images[0] || "", 120)}
                              alt={p.name}
                              loading="lazy"
                              className="size-full object-cover"
                            />
                            {p.images.length > 1 && (
                              <span className="absolute bottom-0.5 right-0.5 rounded bg-slate-900/80 px-1 text-[0.6rem] font-bold text-white">
                                +{p.images.length - 1}
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{p.name}</span>
                            <span className="line-clamp-1 text-xs text-slate-500">
                              {p.description}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-lg bg-blue-50 border border-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                          {p.category}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-900">
                        {formatPrice(p.price)}
                      </td>
                      <td className="hidden px-5 py-4 text-xs text-slate-500 md:table-cell">
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
                                price: p.price.toString(),
                                category: p.category,
                                images: p.images || [],
                              })
                            }
                            className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-600"
                            title="تعديل الصنف"
                          >
                            <Pencil className="size-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingProductId(p.id)}
                            className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
                            title="حذف الصنف"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-12 text-center text-slate-400"
                      >
                        لا توجد أصناف مطابقة للبحث
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ================= CATEGORIES TAB ================= */}
      {activeTab === "categories" && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              إدارة الأقسام التي تظهر في فلتر المنيو الرئيسي.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  resetCategories();
                  toast.success("تمت استعادة الأقسام الافتراضية");
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100"
              >
                <RotateCcw className="size-3.5" /> استعادة الافتراضي
              </button>
              <button
                onClick={() => setCategoryDraft(emptyCategoryDraft)}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:bg-blue-700 shadow-sm"
              >
                <Plus className="size-4" /> إضافة قسم جديد
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => {
              const count = products.filter((p) => p.category === c.name).length;
              return (
                <div
                  key={c.id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-blue-500"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-blue-50 border border-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700">
                        {count} أصناف
                      </span>
                      <span className="font-bold text-base text-slate-900">{c.name}</span>
                    </div>
                    {c.description && (
                      <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                        {c.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                    <button
                      onClick={() =>
                        setCategoryDraft({
                          id: c.id,
                          name: c.name,
                          description: c.description || "",
                          icon: c.icon || "Coffee",
                        })
                      }
                      className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-600"
                      title="تعديل القسم"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingCategoryId(c.id)}
                      className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
                      title="حذف القسم"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ================= PRODUCT MODAL ================= */}
      {productDraft && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setProductDraft(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8 text-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <button
                onClick={() => setProductDraft(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="size-5" />
              </button>
              <h2 className="text-xl font-bold text-slate-900">
                {productDraft.id ? "تعديل الصنف" : "إضافة صنف جديد"}
              </h2>
            </div>

            <div className="mt-6 space-y-4 text-right">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  اسم الصنف *
                </label>
                <input
                  type="text"
                  value={productDraft.name}
                  onChange={(e) =>
                    setProductDraft({ ...productDraft, name: e.target.value })
                  }
                  placeholder="مثال: سبانش لاتيه، كيك تشيز، إلخ..."
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    السعر (EGP) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={productDraft.price}
                    onChange={(e) =>
                      setProductDraft({ ...productDraft, price: e.target.value })
                    }
                    placeholder="مثال: 75"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-600 focus:bg-white text-left font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    القسم التابع له *
                  </label>
                  <select
                    value={productDraft.category}
                    onChange={(e) =>
                      setProductDraft({ ...productDraft, category: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  الوصف والمكونات
                </label>
                <textarea
                  rows={3}
                  value={productDraft.description}
                  onChange={(e) =>
                    setProductDraft({
                      ...productDraft,
                      description: e.target.value,
                    })
                  }
                  placeholder="وصف تفصيلي للصنف والمكونات وطريقة التقديم..."
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-600 focus:bg-white resize-none"
                />
              </div>

              {/* Image Upload Area */}
              <div className="border-t border-slate-100 pt-4">
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  صور الصنف
                </label>

                {/* Upload Button */}
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 transition-colors hover:border-blue-500 hover:bg-blue-50/50">
                  <Upload className="size-6 text-blue-600" />
                  <span className="mt-2 text-xs font-bold text-slate-700">
                    اضغط لاختيار صور من جهازك
                  </span>
                  <span className="text-[0.65rem] text-slate-500">
                    JPG, PNG, WebP (يمكنك اختيار عدة صور معاً)
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFilesUpload(e.target.files)}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>

                {/* Progress bar */}
                {isUploading && (
                  <div className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-blue-50 p-3 text-xs font-bold text-blue-700">
                    <Loader2 className="size-4 animate-spin text-blue-600" />
                    <span>جاري رفع الصور...</span>
                  </div>
                )}

                {/* Manual Link Input */}
                <div className="mt-3 flex gap-2">
                  <input
                    type="url"
                    value={manualImageUrl}
                    onChange={(e) => setManualImageUrl(e.target.value)}
                    placeholder="أو ضع رابط صورة مباشر هنا..."
                    className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-xs text-slate-900 outline-none focus:border-blue-600 text-left"
                  />
                  <button
                    type="button"
                    onClick={addManualImage}
                    className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-900"
                  >
                    إضافة الرابط
                  </button>
                </div>

                {/* Preview Thumbnail Grid */}
                {productDraft.images.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2.5">
                    {productDraft.images.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative size-16 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 group"
                      >
                        <img
                          src={getOptimizedImageUrl(img, 150)}
                          alt=""
                          className="size-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setProductDraft({
                              ...productDraft,
                              images: productDraft.images.filter((_, i) => i !== idx),
                            });
                          }}
                          className="absolute inset-0 flex items-center justify-center bg-red-600/80 text-white opacity-0 transition-opacity group-hover:opacity-100"
                          title="حذف الصورة"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setProductDraft(null)}
                className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={saveProduct}
                disabled={isUploading}
                className="rounded-xl bg-blue-600 px-7 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {productDraft.id ? "حفظ التعديلات" : "إضافة الصنف للمنيو"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= CATEGORY MODAL ================= */}
      {categoryDraft && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setCategoryDraft(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8 text-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <button
                onClick={() => setCategoryDraft(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="size-5" />
              </button>
              <h2 className="text-xl font-bold text-slate-900">
                {categoryDraft.id ? "تعديل القسم" : "إضافة قسم جديد"}
              </h2>
            </div>

            <div className="mt-6 space-y-4 text-right">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  اسم القسم *
                </label>
                <input
                  type="text"
                  value={categoryDraft.name}
                  onChange={(e) =>
                    setCategoryDraft({ ...categoryDraft, name: e.target.value })
                  }
                  placeholder="مثال: قهوة مختصة، حلويات، عصائر..."
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  وصف القسم
                </label>
                <input
                  type="text"
                  value={categoryDraft.description}
                  onChange={(e) =>
                    setCategoryDraft({
                      ...categoryDraft,
                      description: e.target.value,
                    })
                  }
                  placeholder="وصف مختصر للقسم..."
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>
            </div>

            <div className="mt-8 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setCategoryDraft(null)}
                className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={saveCategory}
                className="rounded-xl bg-blue-600 px-7 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700"
              >
                {categoryDraft.id ? "حفظ التعديلات" : "إضافة القسم"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRMATIONS ================= */}
      {deletingProductId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
          onClick={() => setDeletingProductId(null)}
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl text-center text-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <Trash2 className="size-6" />
            </div>
            <h3 className="mt-4 font-bold text-lg text-slate-900">هل أنت متأكد من حذف الصنف؟</h3>
            <p className="mt-1 text-xs text-slate-500">
              سيتم حذف الصنف من المنيو بشكل فوري.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => setDeletingProductId(null)}
                className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  remove(deletingProductId);
                  setDeletingProductId(null);
                  toast.success("تم حذف الصنف بنجاح!");
                }}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-700 shadow-sm"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}

      {deletingCategoryId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
          onClick={() => setDeletingCategoryId(null)}
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl text-center text-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <Trash2 className="size-6" />
            </div>
            <h3 className="mt-4 font-bold text-lg text-slate-900">هل أنت متأكد من حذف القسم؟</h3>
            <p className="mt-1 text-xs text-slate-500">
              سيتم حذف القسم ولن يظهر في المنيو.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => setDeletingCategoryId(null)}
                className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  removeCategory(deletingCategoryId);
                  setDeletingCategoryId(null);
                  toast.success("تم حذف القسم بنجاح!");
                }}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-700 shadow-sm"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
