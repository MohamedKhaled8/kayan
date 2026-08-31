import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Coffee,
  Grid,
  IceCream,
  Layers,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  Upload,
  X,
  Cookie,
  Flame,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { useProducts } from "@/lib/product-store";
import { useCategories } from "@/lib/category-store";
import { useClassicMenu, type ClassicMenuItem } from "@/lib/classic-menu-store";
import { formatPrice, type Product } from "@/lib/products";
import { getOptimizedImageUrl, uploadImageToCloudinary } from "@/lib/cloudinary";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "لوحة الإدارة — KAYAN CAFÉ" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminDashboard,
});

type DraftProduct = {
  id: string | null;
  name: string;
  price: string;
  category: string;
  description: string;
  preparation_time: string;
  calories: string;
  featured: boolean;
  images: string[];
};

const emptyProductDraft = (defaultCategory: string): DraftProduct => ({
  id: null,
  name: "",
  price: "",
  category: defaultCategory || "قهوة مختصة وساخنة",
  description: "",
  preparation_time: "",
  calories: "",
  featured: false,
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

type DraftClassicItem = {
  id: string | null;
  name: string;
  description: string;
  price: string;
  sort_order: string;
};

const emptyClassicDraft: DraftClassicItem = {
  id: null,
  name: "",
  description: "",
  price: "",
  sort_order: "0",
};

function AdminDashboard() {
  const { products, upsert, remove, reset, loadDemoData, clearAllProducts } = useProducts();
  const { categories, addCategory, updateCategory, removeCategory, resetCategories, loadDemoCategories, clearAllCategories } = useCategories();
  const { items: classicItems, upsertItem: saveClassicItem, removeItem: removeClassicItem, loadDefaults: loadClassicDefaults, clearAll: clearAllClassic } = useClassicMenu();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<"products" | "categories" | "classic">("products");

  // Product filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");

  // Modals
  const [productDraft, setProductDraft] = useState<DraftProduct | null>(null);
  const [categoryDraft, setCategoryDraft] = useState<DraftCategory | null>(null);
  const [classicDraft, setClassicDraft] = useState<DraftClassicItem | null>(null);

  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
  const [deletingClassicId, setDeletingClassicId] = useState<string | null>(null);

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
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

    const now = new Date().toISOString();
    const productData: Product = {
      id:
        productDraft.id ||
        `prod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: productDraft.name.trim(),
      price,
      category: productDraft.category,
      description: productDraft.description.trim(),
      preparation_time: productDraft.preparation_time.trim(),
      calories: productDraft.calories ? parseInt(productDraft.calories, 10) : undefined,
      featured: productDraft.featured,
      images: productDraft.images,
      created_at: now,
      updated_at: now,
    };

    upsert(productData);
    toast.success(
      productDraft.id ? "تم تحديث الصنف بنجاح" : "تمت إضافة الصنف بنجاح"
    );
    setProductDraft(null);
  };

  // Handle Category Save
  const saveCategory = async () => {
    if (!categoryDraft) return;
    if (!categoryDraft.name.trim()) {
      toast.error("يرجى إدخال اسم القسم");
      return;
    }

    if (categoryDraft.id) {
      await updateCategory(categoryDraft.id, {
        name: categoryDraft.name.trim(),
        description: categoryDraft.description.trim(),
        icon: categoryDraft.icon,
      });
      toast.success("تم تحديث القسم بنجاح");
    } else {
      await addCategory(
        categoryDraft.name.trim(),
        categoryDraft.description.trim(),
        categoryDraft.icon
      );
      toast.success("تمت إضافة القسم بنجاح");
    }

    setCategoryDraft(null);
  };

  // Handle Classic Menu Save
  const handleSaveClassic = async () => {
    if (!classicDraft) return;
    if (!classicDraft.name.trim()) {
      toast.error("يرجى إدخال اسم الصنف الكلاسيكي");
      return;
    }
    const price = parseFloat(classicDraft.price);
    if (isNaN(price) || price < 0) {
      toast.error("يرجى إدخال سعر صحيح");
      return;
    }

    const item: ClassicMenuItem = {
      id: classicDraft.id || `classic-${Date.now()}`,
      name: classicDraft.name.trim(),
      description: classicDraft.description.trim(),
      price,
      sort_order: parseInt(classicDraft.sort_order, 10) || 0,
      created_at: new Date().toISOString(),
    };

    await saveClassicItem(item);
    toast.success(classicDraft.id ? "تم تحديث صنف المنيو الكلاسيكي" : "تمت إضافة الصنف للمنيو الكلاسيكي");
    setClassicDraft(null);
  };

  // Handle Files Upload
  const handleFilesUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !productDraft) return;
    setIsUploading(true);

    try {
      const fileArray = Array.from(files);
      const uploadedUrls: string[] = [];
      for (const file of fileArray) {
        const url = await uploadImageToCloudinary(file);
        uploadedUrls.push(url);
      }

      if (uploadedUrls.length > 0) {
        setProductDraft((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            images: [...prev.images, ...uploadedUrls],
          };
        });
        toast.success(`تم رفع ${uploadedUrls.length} صورة بنجاح`);
      }
    } catch {
      toast.error("فشل في رفع بعض الصور، يرجى المحاولة مرة أخرى");
    } finally {
      setIsUploading(false);
    }
  };

  // Add Manual Image Link
  const addManualImage = () => {
    if (!manualImageUrl.trim() || !productDraft) return;
    setProductDraft((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        images: [...prev.images, manualImageUrl.trim()],
      };
    });
    setManualImageUrl("");
    toast.success("تمت إضافة رابط الصورة");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 font-sans text-right">
      {/* Header & Tabs */}
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">لوحة الإدارة</span>
          <h1 className="mt-1 text-2xl sm:text-3xl font-black text-slate-900">
            إدارة المنيو والأقسام
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            إضافة وتعديل الأصناف، الأسعار، الأقسام، والمنيو الكلاسيكي لكَيان كافيه.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-slate-200/80 p-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("products")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer",
              activeTab === "products"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900",
            )}
          >
            <Grid className="size-4" />
            الأصناف ({products.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("categories")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer",
              activeTab === "categories"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900",
            )}
          >
            <Layers className="size-4" />
            الأقسام ({categories.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("classic")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer",
              activeTab === "classic"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900",
            )}
          >
            <BookOpen className="size-4" />
            المنيو الكلاسيكي ({classicItems.length})
          </button>
        </div>
      </header>

      {/* ================= PRODUCTS TAB ================= */}
      {activeTab === "products" && (
        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Search & Category Filter */}
            <div className="flex flex-1 flex-wrap items-center gap-2.5">
              <div className="relative min-w-[200px] max-w-sm flex-1">
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
                    type="button"
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
                className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-blue-600"
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
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={async () => {
                  await loadDemoData(true);
                  toast.success("تم توليد الأصناف التجريبية بنجاح");
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100 cursor-pointer"
              >
                <span>توليد أصناف تجريبية</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  if (confirm("هل أنت متأكد من مسح جميع الأصناف والبدء من الصفر؟")) {
                    await clearAllProducts(true);
                    toast.success("تم مسح جميع الأصناف");
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600 hover:border-red-200 cursor-pointer"
              >
                <RotateCcw className="size-3.5" /> مسح الكل
              </button>

              <button
                type="button"
                onClick={() =>
                  setProductDraft(emptyProductDraft(categories[0]?.name || ""))
                }
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs sm:text-sm font-bold text-white transition-all hover:bg-blue-700 shadow-sm cursor-pointer"
              >
                <Plus className="size-4" /> إضافة صنف جديد
              </button>
            </div>
          </div>

          {/* Products Table (Responsive with min-width and horizontal scroll) */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[560px] text-right text-sm">
                <thead className="border-b border-slate-100 bg-slate-50/75 text-xs font-bold text-slate-500">
                  <tr>
                    <th className="px-5 py-3.5 text-right">الصنف والصور</th>
                    <th className="px-4 py-3.5 text-right">القسم</th>
                    <th className="px-4 py-3.5 text-right">السعر (جنيه)</th>
                    <th className="px-4 py-3.5 text-center">التحكم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((p) => {
                      const cover = p.images?.[0];
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-slate-100 border border-slate-200">
                                {cover ? (
                                  <img
                                    src={getOptimizedImageUrl(cover, 120)}
                                    alt={p.name}
                                    className="size-full object-cover"
                                  />
                                ) : (
                                  <div className="flex size-full items-center justify-center text-slate-400">
                                    <Coffee className="size-5" />
                                  </div>
                                )}
                                {p.images && p.images.length > 1 && (
                                  <span className="absolute bottom-0 right-0 rounded-tl-md bg-slate-900/80 px-1 text-[0.6rem] font-bold text-white">
                                    +{p.images.length - 1}
                                  </span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 line-clamp-1">{p.name}</p>
                                {p.description && (
                                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                                    {p.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <span className="inline-block rounded-full bg-blue-50 border border-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                              {p.category}
                            </span>
                          </td>

                          <td className="px-4 py-3.5 font-bold text-slate-900">
                            {formatPrice(p.price)}
                          </td>

                          <td className="px-4 py-3.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  setProductDraft({
                                    id: p.id,
                                    name: p.name,
                                    price: p.price.toString(),
                                    category: p.category,
                                    description: p.description,
                                    preparation_time: p.preparation_time || "",
                                    calories: p.calories ? p.calories.toString() : "",
                                    featured: Boolean(p.featured),
                                    images: p.images || [],
                                  })
                                }
                                className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
                                title="تعديل الصنف"
                              >
                                <Pencil className="size-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingProductId(p.id)}
                                className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600 cursor-pointer"
                                title="حذف الصنف"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-400">
                        لا توجد أصناف تطابق البحث حالياً.
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
        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              إدارة الأقسام التي تظهر في شريط المنيو الرئيسي.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={async () => {
                  await loadDemoCategories(true);
                  toast.success("تم توليد الأقسام التجريبية بنجاح");
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100 cursor-pointer"
              >
                <span>توليد أقسام تجريبية</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  if (confirm("هل تريد مسح جميع الأقسام والبدء من الصفر؟")) {
                    await clearAllCategories(true);
                    toast.success("تم مسح جميع الأقسام");
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600 hover:border-red-200 cursor-pointer"
              >
                <RotateCcw className="size-3.5" /> مسح الكل
              </button>

              <button
                type="button"
                onClick={() => setCategoryDraft(emptyCategoryDraft)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs sm:text-sm font-bold text-white transition-all hover:bg-blue-700 shadow-sm cursor-pointer"
              >
                <Plus className="size-4" /> إضافة قسم جديد
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => {
              const count = products.filter((p) => p.category === c.name).length;
              return (
                <div
                  key={c.id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-blue-500"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-blue-50 border border-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700">
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
                      type="button"
                      onClick={() =>
                        setCategoryDraft({
                          id: c.id,
                          name: c.name,
                          description: c.description || "",
                          icon: c.icon || "Coffee",
                        })
                      }
                      className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
                      title="تعديل القسم"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingCategoryId(c.id)}
                      className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600 cursor-pointer"
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

      {/* ================= CLASSIC MENU TAB ================= */}
      {activeTab === "classic" && (
        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              إدارة أصناف ورقة المنيو الكلاسيكي (Classic Menu) المعروضة في صفحة /menu.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={async () => {
                  await loadClassicDefaults();
                  toast.success("تمت استعادة أصناف المنيو الكلاسيكي الافتراضية");
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100 cursor-pointer"
              >
                <span>استعادة الافتراضي</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  if (confirm("هل تريد مسح جميع أصناف المنيو الكلاسيكي؟")) {
                    await clearAllClassic();
                    toast.success("تم مسح أصناف المنيو الكلاسيكي");
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600 hover:border-red-200 cursor-pointer"
              >
                <RotateCcw className="size-3.5" /> مسح الكل
              </button>

              <button
                type="button"
                onClick={() => setClassicDraft(emptyClassicDraft)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs sm:text-sm font-bold text-white transition-all hover:bg-blue-700 shadow-sm cursor-pointer"
              >
                <Plus className="size-4" /> إضافة صنف كلاسيكي
              </button>
            </div>
          </div>

          {/* Classic Menu Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[560px] text-right text-sm">
                <thead className="border-b border-slate-100 bg-slate-50/75 text-xs font-bold text-slate-500">
                  <tr>
                    <th className="px-4 py-3.5 text-center w-16">#</th>
                    <th className="px-5 py-3.5 text-right">اسم الصنف والوصف</th>
                    <th className="px-4 py-3.5 text-right">السعر (جنيه)</th>
                    <th className="px-4 py-3.5 text-center">التحكم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {classicItems.length > 0 ? (
                    classicItems.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3.5 text-center font-mono font-bold text-slate-400">
                          {String(idx + 1).padStart(2, "0")}
                        </td>

                        <td className="px-5 py-3.5">
                          <p className="font-bold text-slate-900 uppercase font-mono">{item.name}</p>
                          {item.description && (
                            <p className="text-xs text-slate-500 italic mt-0.5">
                              {item.description}
                            </p>
                          )}
                        </td>

                        <td className="px-4 py-3.5 font-bold text-slate-900 font-mono">
                          {Number(item.price).toLocaleString("en-US")}
                        </td>

                        <td className="px-4 py-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                setClassicDraft({
                                  id: item.id,
                                  name: item.name,
                                  description: item.description,
                                  price: item.price.toString(),
                                  sort_order: (item.sort_order || idx + 1).toString(),
                                })
                              }
                              className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
                              title="تعديل"
                            >
                              <Pencil className="size-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingClassicId(item.id)}
                              className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600 cursor-pointer"
                              title="حذف"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-400">
                        لا توجد أصناف في المنيو الكلاسيكي حالياً. اضغط "إضافة صنف كلاسيكي" أو "استعادة الافتراضي".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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
                type="button"
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
                              images: productDraft.images.filter(
                                (_, i) => i !== idx
                              ),
                            });
                          }}
                          className="absolute inset-0 flex items-center justify-center bg-red-600/80 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => setProductDraft(null)}
                  className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={saveProduct}
                  className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700 shadow-sm"
                >
                  {productDraft.id ? "حفظ التعديلات" : "إضافة الصنف"}
                </button>
              </div>
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
            className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl text-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <button
                type="button"
                onClick={() => setCategoryDraft(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="size-5" />
              </button>
              <h2 className="text-xl font-bold text-slate-900">
                {categoryDraft.id ? "تعديل القسم" : "إضافة قسم جديد"}
              </h2>
            </div>

            <div className="mt-5 space-y-4 text-right">
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
                  placeholder="مثال: مشروبات ساخنة، عصائر، مخبوزات..."
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  وصف القسم
                </label>
                <textarea
                  rows={2}
                  value={categoryDraft.description}
                  onChange={(e) =>
                    setCategoryDraft({
                      ...categoryDraft,
                      description: e.target.value,
                    })
                  }
                  placeholder="وصف مختصر لمحتويات هذا القسم..."
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-600 focus:bg-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setCategoryDraft(null)}
                  className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={saveCategory}
                  className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700 shadow-sm"
                >
                  {categoryDraft.id ? "حفظ التعديلات" : "إضافة القسم"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= CLASSIC MENU MODAL ================= */}
      {classicDraft && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setClassicDraft(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl text-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <button
                type="button"
                onClick={() => setClassicDraft(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="size-5" />
              </button>
              <h2 className="text-xl font-bold text-slate-900">
                {classicDraft.id ? "تعديل الصنف الكلاسيكي" : "إضافة صنف للمنيو الكلاسيكي"}
              </h2>
            </div>

            <div className="mt-5 space-y-4 text-right">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  اسم الصنف (بالإنجليزية أو العربية) *
                </label>
                <input
                  type="text"
                  value={classicDraft.name}
                  onChange={(e) =>
                    setClassicDraft({ ...classicDraft, name: e.target.value })
                  }
                  placeholder="مثال: LATTE أو AVOCADO HERB TOAST"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-600 focus:bg-white uppercase font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  السعر (جنيه) *
                </label>
                <input
                  type="number"
                  value={classicDraft.price}
                  onChange={(e) =>
                    setClassicDraft({ ...classicDraft, price: e.target.value })
                  }
                  placeholder="مثال: 150"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-600 focus:bg-white text-left font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  الوصف والمكونات
                </label>
                <textarea
                  rows={3}
                  value={classicDraft.description}
                  onChange={(e) =>
                    setClassicDraft({
                      ...classicDraft,
                      description: e.target.value,
                    })
                  }
                  placeholder="مثال: Espresso with Steamed Milk and Light Foam."
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-600 focus:bg-white resize-none font-serif italic"
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setClassicDraft(null)}
                  className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleSaveClassic}
                  className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700 shadow-sm"
                >
                  {classicDraft.id ? "حفظ التعديل" : "إضافة للمنيو"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Product Confirmation */}
      {deletingProductId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setDeletingProductId(null)}
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <Trash2 className="size-6" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900">
              تأكيد حذف الصنف
            </h3>
            <p className="mt-2 text-xs text-slate-500">
              هل أنت متأكد من حذف هذا الصنف نهائياً من المنيو؟
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingProductId(null)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  remove(deletingProductId);
                  toast.success("تم حذف الصنف بنجاح");
                  setDeletingProductId(null);
                }}
                className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-700 shadow-sm"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Category Confirmation */}
      {deletingCategoryId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setDeletingCategoryId(null)}
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <Trash2 className="size-6" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900">
              تأكيد حذف القسم
            </h3>
            <p className="mt-2 text-xs text-slate-500">
              هل أنت متأكد من حذف هذا القسم؟
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingCategoryId(null)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  removeCategory(deletingCategoryId);
                  toast.success("تم حذف القسم بنجاح");
                  setDeletingCategoryId(null);
                }}
                className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-700 shadow-sm"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Classic Item Confirmation */}
      {deletingClassicId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setDeletingClassicId(null)}
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <Trash2 className="size-6" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900">
              تأكيد حذف الصنف الكلاسيكي
            </h3>
            <p className="mt-2 text-xs text-slate-500">
              هل أنت متأكد من حذف هذا الصنف من المنيو الكلاسيكي؟
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingClassicId(null)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  removeClassicItem(deletingClassicId);
                  toast.success("تم حذف الصنف من المنيو الكلاسيكي");
                  setDeletingClassicId(null);
                }}
                className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-700 shadow-sm"
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
