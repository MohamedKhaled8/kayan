import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertCircle,
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Crown,
  Flame,
  Layers,
  PackageCheck,
  RotateCcw,
  Search,
  ShoppingBag,
  TrendingUp,
  X,
} from "lucide-react";
import { useProducts } from "@/lib/product-store";
import { useCategories } from "@/lib/category-store";
import { useOrders } from "@/lib/order-store";
import { formatPrice } from "@/lib/products";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import { Reveal } from "@/components/Reveal";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/reports")({
  component: AdminReports,
});

function AdminReports() {
  const { products } = useProducts();
  const { categories } = useCategories();
  const { orders } = useOrders();

  const [searchTerm, setSearchTerm] = useState("");
  // Selected date in YYYY-MM-DD
  const [selectedDate, setSelectedDate] = useState<string>("");
  // Calendar Modal State
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarYear, setCalendarYear] = useState(() => new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(() => new Date().getMonth()); // 0-indexed

  // Helper to format Date to YYYY-MM-DD
  const toDateKey = (date: Date | string) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Set of dates that have orders
  const datesWithOrders = useMemo(() => {
    const set = new Set<string>();
    orders.forEach((o) => set.add(toDateKey(o.createdAt)));
    return set;
  }, [orders]);

  // Orders filtered by selected date
  const effectiveOrders = useMemo(() => {
    if (!selectedDate) return orders;
    return orders.filter((o) => toDateKey(o.createdAt) === selectedDate);
  }, [orders, selectedDate]);

  // Selected date formatted in Arabic
  const selectedDateArabic = useMemo(() => {
    if (!selectedDate) return null;
    const parts = selectedDate.split("-");
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return d.toLocaleDateString("ar-EG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [selectedDate]);

  // ─────────────────────────────────────────────
  // Sales & Orders Calculations
  // ─────────────────────────────────────────────

  // Total Revenue for current view
  const currentRevenue = useMemo(() => {
    return effectiveOrders.reduce((sum, order) => sum + order.totalPrice, 0);
  }, [effectiveOrders]);

  // Today's Sales
  const todayKey = toDateKey(new Date());
  const todayRevenue = useMemo(() => {
    return orders
      .filter((o) => toDateKey(o.createdAt) === todayKey)
      .reduce((sum, order) => sum + order.totalPrice, 0);
  }, [orders, todayKey]);

  const todayOrdersCount = useMemo(() => {
    return orders.filter((o) => toDateKey(o.createdAt) === todayKey).length;
  }, [orders, todayKey]);

  // Daily Sales Grouping (Last 7 Days)
  const dailySalesData = useMemo(() => {
    const map = new Map<
      string,
      { dateKey: string; label: string; total: number; count: number; isSelected: boolean }
    >();

    // Generate last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = toDateKey(d);
      const label = d.toLocaleDateString("ar-EG", { weekday: "short", day: "numeric", month: "numeric" });
      map.set(key, { dateKey: key, label, total: 0, count: 0, isSelected: key === selectedDate });
    }

    if (selectedDate && !map.has(selectedDate)) {
      const d = new Date(selectedDate);
      const label = d.toLocaleDateString("ar-EG", { weekday: "short", day: "numeric", month: "numeric" });
      map.set(selectedDate, { dateKey: selectedDate, label, total: 0, count: 0, isSelected: true });
    }

    orders.forEach((o) => {
      const key = toDateKey(o.createdAt);
      const entry = map.get(key);
      if (entry) {
        entry.total += o.totalPrice;
        entry.count += 1;
      }
    });

    return Array.from(map.values());
  }, [orders, selectedDate]);

  // ─────────────────────────────────────────────
  // Product Sales Stats (Based on effectiveOrders)
  // ─────────────────────────────────────────────
  const productStats = useMemo(() => {
    const statsMap = new Map<
      string,
      { orderTimes: number; totalQuantity: number; totalRevenue: number }
    >();

    effectiveOrders.forEach((order) => {
      order.items.forEach((item) => {
        const prev = statsMap.get(item.productId) || {
          orderTimes: 0,
          totalQuantity: 0,
          totalRevenue: 0,
        };
        statsMap.set(item.productId, {
          orderTimes: prev.orderTimes + 1,
          totalQuantity: prev.totalQuantity + item.quantity,
          totalRevenue: prev.totalRevenue + item.unitPrice * item.quantity,
        });
      });
    });

    return products.map((p) => {
      const st = statsMap.get(p.id) || { orderTimes: 0, totalQuantity: 0, totalRevenue: 0 };
      return {
        ...p,
        orderTimes: st.orderTimes,
        totalQuantity: st.totalQuantity,
        totalRevenue: st.totalRevenue,
      };
    });
  }, [products, effectiveOrders]);

  // Top Selling Items (Sorted by quantity sold)
  const topSelling = useMemo(() => {
    return [...productStats]
      .filter((p) => p.totalQuantity > 0)
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 5);
  }, [productStats]);

  const mostOrderedProduct = topSelling[0] || null;

  // Filtered list for the all-products table
  const filteredProducts = useMemo(() => {
    return productStats
      .filter((p) =>
        searchTerm
          ? p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category.toLowerCase().includes(searchTerm.toLowerCase())
          : true,
      )
      .sort((a, b) => b.totalQuantity - a.totalQuantity);
  }, [productStats, searchTerm]);

  // Category distribution
  const byCategory = useMemo(
    () =>
      categories.map((c) => ({
        name: c.name,
        count: products.filter((p) => p.category === c.name).length,
      })),
    [products, categories],
  );

  // ─────────────────────────────────────────────
  // Calendar Generation Helpers
  // ─────────────────────────────────────────────
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(calendarYear, calendarMonth, 1).getDay(); // 0 = Sun, 6 = Sat
    const totalDays = new Date(calendarYear, calendarMonth + 1, 0).getDate();

    const days: Array<{ day: number; dateKey: string; hasOrders: boolean } | null> = [];

    // Empty padding slots
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }

    // Days of month
    for (let d = 1; d <= totalDays; d++) {
      const m = String(calendarMonth + 1).padStart(2, "0");
      const dayStr = String(d).padStart(2, "0");
      const dateKey = `${calendarYear}-${m}-${dayStr}`;
      days.push({
        day: d,
        dateKey,
        hasOrders: datesWithOrders.has(dateKey),
      });
    }

    return days;
  }, [calendarYear, calendarMonth, datesWithOrders]);

  const monthName = new Date(calendarYear, calendarMonth, 1).toLocaleDateString("ar-EG", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-5xl space-y-8 text-right font-sans text-slate-900 pb-16">
      {/* ── Header with Date Filter Trigger ── */}
      <header className="border-b border-slate-200 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              إحصائيات المبيعات والأداء
            </span>
            <h1 className="mt-1 text-2xl sm:text-3xl font-black text-slate-900">
              تقارير المنيو والطلبات
            </h1>
          </div>

          {/* Interactive Date Trigger Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCalendarOpen(true)}
              className={cn(
                "flex items-center gap-2.5 rounded-xl border px-4 py-2.5 text-xs font-bold transition-all cursor-pointer shadow-2xs",
                selectedDate
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-slate-300 bg-white text-slate-700 hover:border-blue-500 hover:text-blue-600",
              )}
            >
              <CalendarDays className="size-4 text-blue-600 shrink-0" />
              <span>{selectedDate ? selectedDateArabic : "اضغط لاختيار تاريخ"}</span>
            </button>

            {selectedDate && (
              <button
                onClick={() => setSelectedDate("")}
                className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer"
                title="إلغاء تحديد التاريخ وعرض كل الوقت"
              >
                <X className="size-3.5" />
                عرض الكل
              </button>
            )}
          </div>
        </div>

        {/* Selected Date Notification Banner */}
        {selectedDate && (
          <div className="mt-4 flex items-center justify-between rounded-xl bg-blue-50 border border-blue-200 px-4 py-2.5 text-xs text-blue-900 font-medium animate-in fade-in">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 text-blue-600" />
              <span>
                أنت تشاهد حالياً تقرير يوم: <strong>{selectedDateArabic}</strong>
              </span>
            </div>
            <button
              onClick={() => setSelectedDate("")}
              className="text-xs font-bold text-blue-700 underline hover:text-blue-900 cursor-pointer"
            >
              الرجوع لتقرير كل الوقت
            </button>
          </div>
        )}
      </header>

      {/* ── Empty State if Date has NO Orders ── */}
      {selectedDate && effectiveOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 mb-4">
            <AlertCircle className="size-8" />
          </div>
          <h3 className="text-lg font-black text-slate-900">
            لا توجد مبيعات أو طلبات مسجلة في هذا اليوم
          </h3>
          <p className="mt-1.5 text-sm text-slate-500 max-w-md">
            لم يتم تسجيل أي طلبات في تاريخ {selectedDateArabic}.
          </p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setCalendarOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors cursor-pointer shadow-2xs"
            >
              <Calendar className="size-4" />
              اختيار تاريخ آخر
            </button>
            <button
              onClick={() => setSelectedDate("")}
              className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              عرض التقرير الشامل
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* ── 4 Main KPI Cards ── */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total / Filtered Revenue */}
            <Reveal delay={0}>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <CircleDollarSign className="size-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-500">
                    {selectedDate ? "مبيعات هذا اليوم" : "إجمالي المبيعات"}
                  </span>
                </div>
                <p className="mt-4 text-2xl font-black text-slate-900 tabular-nums">
                  {formatPrice(currentRevenue)}
                </p>
                <p className="mt-1 text-[0.7rem] text-slate-400">
                  {selectedDate ? `في ${selectedDateArabic}` : "إجمالي مبيعات كل الطلبات"}
                </p>
              </div>
            </Reveal>

            {/* Today's Sales */}
            <Reveal delay={70}>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <TrendingUp className="size-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-500">مبيعات اليوم</span>
                </div>
                <p className="mt-4 text-2xl font-black text-emerald-600 tabular-nums">
                  {formatPrice(todayRevenue)}
                </p>
                <p className="mt-1 text-[0.7rem] text-slate-400">
                  {todayOrdersCount} {todayOrdersCount === 1 ? "طلب اليوم" : "طلبات اليوم"}
                </p>
              </div>
            </Reveal>

            {/* Total Orders Count */}
            <Reveal delay={140}>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                    <ShoppingBag className="size-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-500">
                    {selectedDate ? "طلبات هذا اليوم" : "عدد الطلبات الكلي"}
                  </span>
                </div>
                <p className="mt-4 text-2xl font-black text-slate-900 tabular-nums">
                  {effectiveOrders.length}{" "}
                  <span className="text-sm font-medium text-slate-500">طلب</span>
                </p>
                <p className="mt-1 text-[0.7rem] text-slate-400">
                  {selectedDate ? "مسجل في هذا التاريخ" : "مسجل في النظام"}
                </p>
              </div>
            </Reveal>

            {/* Most Ordered Product */}
            <Reveal delay={210}>
              <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/70 to-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                    <Crown className="size-5" />
                  </div>
                  <span className="text-xs font-bold text-amber-700">الأكثر طلباً</span>
                </div>
                <p className="mt-3 font-bold text-base text-slate-900 truncate">
                  {mostOrderedProduct ? mostOrderedProduct.name : "لا توجد طلبات"}
                </p>
                <p className="mt-1 text-xs font-semibold text-amber-800">
                  {mostOrderedProduct
                    ? `طُلب ${mostOrderedProduct.totalQuantity} مرة (${formatPrice(mostOrderedProduct.totalRevenue)})`
                    : "—"}
                </p>
              </div>
            </Reveal>
          </div>

          {/* ── Daily Sales Chart ── */}
          <Reveal>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 mb-4 gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCalendarOpen(true)}
                    className="text-xs font-bold text-blue-600 flex items-center gap-1.5 cursor-pointer rounded-lg border border-blue-100 bg-blue-50/60 px-2.5 py-1 hover:bg-blue-100 transition-colors"
                  >
                    <CalendarDays className="size-3.5" />
                    <span>{selectedDate ? `يوم: ${selectedDate}` : "اضغط لاختيار تاريخ"}</span>
                  </button>

                  {selectedDate && (
                    <button
                      onClick={() => setSelectedDate("")}
                      className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="size-3" />
                      إلغاء الفلتر
                    </button>
                  )}
                </div>

                <h2 className="text-base font-black text-slate-900">
                  حجم المبيعات اليومية (ج.م)
                </h2>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailySalesData}>
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      fontSize={11}
                      stroke="#64748B"
                    />
                    <YAxis
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                      fontSize={11}
                      stroke="#64748B"
                      tickFormatter={(v) => `${v}`}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        const d = payload?.[0]?.payload as
                          | { dateKey: string; label: string; total: number; count: number }
                          | undefined;
                        if (active && d) {
                          return (
                            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg text-right text-xs">
                              <p className="font-bold text-slate-900">{d.label}</p>
                              <p className="mt-1 text-blue-600 font-bold text-sm">
                                {formatPrice(d.total)}
                              </p>
                              <p className="text-slate-500 mt-0.5">
                                {d.count} {d.count === 1 ? "طلب" : "طلبات"}
                              </p>
                              <p className="mt-2 text-[0.65rem] text-blue-500 font-bold">
                                انقر لاختيار هذا اليوم
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="total"
                      radius={[8, 8, 0, 0]}
                      fill="#2563EB"
                      className="cursor-pointer"
                      onClick={(entry) => {
                        if (entry && entry.dateKey) {
                          setSelectedDate(entry.dateKey);
                        }
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Reveal>

          {/* ── Top Selling Leaderboard ── */}
          <Reveal>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                  <Flame className="size-4" />
                  {selectedDate ? `الأكثر طلباً يوم ${selectedDate}` : "الأكثر طلباً كلياً"}
                </span>
                <h2 className="text-base font-black text-slate-900">الأصناف الأكثر طلباً ومبيعاً</h2>
              </div>

              {topSelling.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-400">
                  <PackageCheck className="mx-auto size-10 text-slate-300 mb-2" />
                  لم يتم تسجيل طلبات كافية بعد لإظهار قائمة الأكثر طلباً.
                </div>
              ) : (
                <div className="space-y-4">
                  {topSelling.map((p, idx) => {
                    const maxSold = topSelling[0]?.totalQuantity || 1;
                    const percentage = Math.round((p.totalQuantity / maxSold) * 100);

                    return (
                      <div
                        key={p.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 transition-colors hover:bg-slate-50"
                      >
                        {/* Rank + Image + Name */}
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-black shadow-2xs",
                              idx === 0 && "bg-amber-400 text-amber-950 font-bold",
                              idx === 1 && "bg-slate-300 text-slate-800",
                              idx === 2 && "bg-amber-700/80 text-white",
                              idx > 2 && "bg-slate-200 text-slate-600",
                            )}
                          >
                            #{idx + 1}
                          </span>

                          <img
                            src={getOptimizedImageUrl(p.images?.[0] ?? "", 100)}
                            alt={p.name}
                            className="size-12 rounded-xl object-cover border border-slate-200 shrink-0"
                          />

                          <div className="text-right">
                            <p className="font-bold text-sm text-slate-900">{p.name}</p>
                            <span className="text-xs text-slate-500">{p.category}</span>
                          </div>
                        </div>

                        {/* Stats & Progress */}
                        <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
                          <div className="hidden md:block w-32">
                            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                              <div
                                className="h-full rounded-full bg-amber-500 transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>

                          {/* Quantity sold */}
                          <div className="text-center">
                            <span className="text-base font-black text-slate-900 tabular-nums">
                              {p.totalQuantity}
                            </span>
                            <p className="text-[0.65rem] font-bold text-slate-400">قطعة مباعة</p>
                          </div>

                          {/* Orders count */}
                          <div className="text-center">
                            <span className="text-base font-black text-slate-700 tabular-nums">
                              {p.orderTimes}
                            </span>
                            <p className="text-[0.65rem] font-bold text-slate-400">مرات الطلب</p>
                          </div>

                          {/* Total revenue */}
                          <div className="text-left min-w-[90px]">
                            <span className="text-sm font-black text-blue-600 tabular-nums">
                              {formatPrice(p.totalRevenue)}
                            </span>
                            <p className="text-[0.65rem] font-bold text-slate-400">إجمالي الدخل</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Reveal>

          {/* ── All Products Detailed Table ── */}
          <Reveal>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-5">
                {/* Search Input */}
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="بحث في الأصناف..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 pr-9 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                  />
                  <Search className="absolute right-3 top-2.5 size-4 text-slate-400" />
                </div>

                <div className="text-right">
                  <h2 className="text-base font-black text-slate-900">
                    إحصائيات كل صنف في المنيو
                  </h2>
                  <p className="text-xs text-slate-500">
                    {selectedDate
                      ? `أداء الأصناف ليوم ${selectedDateArabic}`
                      : "عدد مرات طلب كل منتج والكميات المباعة والعائد المحقق."}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold">
                      <th className="pb-3 text-right">الصنف</th>
                      <th className="pb-3 text-center">القسم</th>
                      <th className="pb-3 text-center">سعر الوحدة</th>
                      <th className="pb-3 text-center">مرات الطلب</th>
                      <th className="pb-3 text-center">إجمالي القطع المباعة</th>
                      <th className="pb-3 text-left">إجمالي المبيعات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={getOptimizedImageUrl(p.images?.[0] ?? "", 80)}
                              alt=""
                              className="size-9 rounded-lg object-cover border border-slate-200"
                            />
                            <span className="font-bold text-slate-900 text-xs sm:text-sm">
                              {p.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 text-center text-slate-500">{p.category}</td>
                        <td className="py-3 text-center font-bold text-slate-700">
                          {formatPrice(p.price)}
                        </td>
                        <td className="py-3 text-center">
                          <span
                            className={cn(
                              "inline-block rounded-md px-2 py-0.5 font-bold tabular-nums",
                              p.orderTimes > 0
                                ? "bg-blue-50 text-blue-700"
                                : "bg-slate-100 text-slate-400",
                            )}
                          >
                            {p.orderTimes}
                          </span>
                        </td>
                        <td className="py-3 text-center font-bold text-slate-900 tabular-nums">
                          {p.totalQuantity}
                        </td>
                        <td className="py-3 text-left font-black text-blue-600 tabular-nums">
                          {formatPrice(p.totalRevenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredProducts.length === 0 && (
                  <p className="py-8 text-center text-slate-400">لا توجد نتائج مطابقة للبحث.</p>
                )}
              </div>
            </div>
          </Reveal>

          {/* ── Category Breakdown ── */}
          <Reveal>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <span className="text-xs font-bold text-blue-600 flex items-center gap-1.5">
                  <Layers className="size-4" />
                  {categories.length} أقسام
                </span>
                <h2 className="text-base font-black text-slate-900">توزيع الأصناف حسب القسم</h2>
              </div>

              <div className="space-y-3.5">
                {byCategory.map((cat) => {
                  const maxCount = Math.max(...byCategory.map((c) => c.count), 1);
                  const percent = Math.round((cat.count / maxCount) * 100);
                  return (
                    <div key={cat.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-500 tabular-nums">
                          {cat.count} {cat.count === 1 ? "صنف" : "أصناف"}
                        </span>
                        <span className="text-slate-800 font-bold">{cat.name}</span>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-blue-600 transition-all duration-500"
                          style={{ width: `${cat.count > 0 ? Math.max(percent, 8) : 0}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Reveal>
        </>
      )}

      {/* ── Interactive Calendar Modal ── */}
      {calendarOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setCalendarOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl text-right text-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <button
                onClick={() => setCalendarOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <X className="size-5" />
              </button>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">جدول التواريخ</span>
                <Calendar className="size-4 text-blue-600" />
              </div>
            </div>

            {/* Month Navigator */}
            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={() => {
                  if (calendarMonth === 0) {
                    setCalendarMonth(11);
                    setCalendarYear((y) => y - 1);
                  } else {
                    setCalendarMonth((m) => m - 1);
                  }
                }}
                className="flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                aria-label="الشهر السابق"
              >
                <ChevronRight className="size-4" />
              </button>
              <span className="font-bold text-sm text-slate-800">{monthName}</span>
              <button
                onClick={() => {
                  if (calendarMonth === 11) {
                    setCalendarMonth(0);
                    setCalendarYear((y) => y + 1);
                  } else {
                    setCalendarMonth((m) => m + 1);
                  }
                }}
                className="flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                aria-label="الشهر القادم"
              >
                <ChevronLeft className="size-4" />
              </button>
            </div>

            {/* Weekdays */}
            <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[0.7rem] font-bold text-slate-400">
              <span>أحد</span>
              <span>إثنين</span>
              <span>ثلاثاء</span>
              <span>أربعاء</span>
              <span>خميس</span>
              <span>جمعة</span>
              <span>سبت</span>
            </div>

            {/* Calendar Days Grid */}
            <div className="mt-2 grid grid-cols-7 gap-1">
              {calendarDays.map((item, index) => {
                if (!item) {
                  return <div key={`empty-${index}`} className="size-9" />;
                }

                const isSelected = selectedDate === item.dateKey;
                const isToday = item.dateKey === todayKey;

                return (
                  <button
                    key={item.dateKey}
                    onClick={() => {
                      setSelectedDate(item.dateKey);
                      setCalendarOpen(false);
                    }}
                    className={cn(
                      "relative flex size-9 items-center justify-center rounded-xl text-xs font-bold transition-all cursor-pointer",
                      isSelected
                        ? "bg-blue-600 text-white font-black shadow-sm scale-105"
                        : item.hasOrders
                          ? "bg-blue-50 text-blue-800 hover:bg-blue-100 hover:scale-105 font-black border border-blue-200"
                          : "text-slate-700 hover:bg-slate-100",
                      isToday && !isSelected && "border-2 border-blue-500",
                    )}
                  >
                    {item.day}
                    {/* Small dot for days with orders */}
                    {item.hasOrders && !isSelected && (
                      <span className="absolute bottom-1 size-1 rounded-full bg-blue-600" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend & Action */}
            <div className="mt-5 border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-blue-600" />
                <span>أيام بها طلبات</span>
              </div>
              <button
                onClick={() => {
                  setSelectedDate("");
                  setCalendarOpen(false);
                }}
                className="font-bold text-blue-600 hover:underline"
              >
                عرض كل الأيام
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
