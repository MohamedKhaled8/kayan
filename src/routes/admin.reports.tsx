import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CircleDollarSign, Clock3, Layers, Package } from "lucide-react";
import { useProducts } from "@/lib/product-store";
import { useCategories } from "@/lib/category-store";
import { formatPrice } from "@/lib/products";
import { Reveal } from "@/components/Reveal";

export const Route = createFileRoute("/admin/reports")({
  component: AdminReports,
});

const chartColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function AdminReports() {
  const { products } = useProducts();
  const { categories } = useCategories();

  const byCategory = useMemo(
    () =>
      categories.map((c) => ({
        name: c.name,
        count: products.filter((p) => p.category === c.name).length,
      })),
    [products, categories],
  );

  const avgPrice = products.length
    ? products.reduce((sum, p) => sum + p.price, 0) / products.length
    : 0;

  const recent = useMemo(
    () =>
      [...products]
        .sort((a, b) => +new Date(b.updated_at) - +new Date(a.updated_at))
        .slice(0, 6),
    [products],
  );

  const stats = [
    { label: "إجمالي المنتجات", value: String(products.length), icon: Package },
    {
      label: "السيكشنات النشطة",
      value: String(byCategory.filter((c) => c.count > 0).length),
      icon: Layers,
    },
    { label: "متوسط السعر", value: formatPrice(avgPrice), icon: CircleDollarSign },
    {
      label: "الصور المخزنة سحابياً",
      value: String(products.reduce((n, p) => n + (p.images?.length || 0), 0)),
      icon: Clock3,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8 text-right">
      <header className="border-b border-border/60 pb-5">
        <p className="eyebrow">نظرة عامة وإحصائيات</p>
        <h1 className="mt-2 font-display text-3xl md:text-4xl text-foreground">
          تقارير المنيو والمبيعات
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          ملخص إحصائي شامل لعدد الأصناف، السيكشنات، وتوزيع الأسعار بالجنيه المصري.
        </p>
      </header>

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 70}>
            <div className="card-lift rounded-3xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <s.icon className="size-5 text-copper" strokeWidth={1.6} />
                <span className="text-xs font-semibold tracking-wider text-muted-foreground">
                  {s.label}
                </span>
              </div>
              <p className="mt-4 font-display text-2xl font-bold text-foreground">{s.value}</p>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal>
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <h2 className="font-display text-lg font-bold">توزيع المنتجات حسب السيكشن</h2>
            <div className="mt-6 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byCategory}>
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    stroke="var(--muted-foreground)"
                    interval={0}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    stroke="var(--muted-foreground)"
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      background: "var(--card)",
                      fontSize: 12,
                      textAlign: "right",
                    }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} fill="var(--chart-1)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <h2 className="font-display text-lg font-bold">نسبة الأصناف لكل قسم</h2>
            <div className="mt-6 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byCategory.filter((c) => c.count > 0)}
                    dataKey="count"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={88}
                    paddingAngle={3}
                  >
                    {byCategory
                      .filter((c) => c.count > 0)
                      .map((c, i) => (
                        <Cell key={c.name} fill={chartColors[i % chartColors.length]} />
                      ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      background: "var(--card)",
                      fontSize: 12,
                      textAlign: "right",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              {byCategory
                .filter((c) => c.count > 0)
                .map((c, i) => (
                  <span key={c.name} className="flex items-center gap-2">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ background: chartColors[i % chartColors.length] }}
                    />
                    {c.name} ({c.count})
                  </span>
                ))}
            </div>
          </div>
        </Reveal>
      </div>

      {/* Recent Activity */}
      <Reveal delay={80}>
        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <h2 className="font-display text-lg font-bold">آخر المنتجات المحدثة</h2>
          <ul className="mt-5 divide-y divide-border/60">
            {recent.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-3.5">
                <div className="flex items-center gap-3">
                  <img
                    src={p.images[0]}
                    alt=""
                    loading="lazy"
                    className="size-11 rounded-xl object-cover"
                  />
                  <div className="text-right">
                    <p className="font-medium text-sm text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.category}</p>
                  </div>
                </div>
                <div className="text-left">
                  <span className="font-display text-sm font-bold text-copper">
                    {formatPrice(p.price)}
                  </span>
                  <p className="text-[0.7rem] text-muted-foreground">
                    {new Date(p.updated_at).toLocaleDateString("ar-EG")}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          {recent.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">لا توجد بيانات حالياً.</p>
          )}
        </div>
      </Reveal>
    </div>
  );
}
