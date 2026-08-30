import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  ChefHat,
  ChevronDown,
  ClipboardList,
  Clock3,
  Receipt,
  RotateCcw,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import { useOrders, type Order, type OrderStatus } from "@/lib/order-store";
import { formatPrice } from "@/lib/products";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

// ─────────────────────────────────────────────────────────────────────────────
// Status config
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bg: string; border: string; icon: typeof Clock3 }
> = {
  pending: {
    label: "قيد الانتظار",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: Clock3,
  },
  preparing: {
    label: "جاري التحضير",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: ChefHat,
  },
  done: {
    label: "تم التسليم",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: CheckCircle2,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
function AdminOrders() {
  const { orders, updateStatus, removeOrder, clearAll } = useOrders();
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === "all") return orders;
    return orders.filter((o) => o.status === filter);
  }, [orders, filter]);

  const stats = useMemo(
    () => ({
      all: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      preparing: orders.filter((o) => o.status === "preparing").length,
      done: orders.filter((o) => o.status === "done").length,
    }),
    [orders],
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16 font-sans text-slate-900">
      {/* ── Header ── */}
      <header className="border-b border-slate-200 pb-5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              إدارة الطلبات
            </span>
            <h1 className="mt-1 text-2xl sm:text-3xl font-black text-slate-900">
              طلبات الطاولات
            </h1>
          </div>
          {orders.length > 0 && (
            <button
              onClick={() => {
                clearAll();
                toast.success("تم مسح جميع الطلبات");
              }}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-colors shadow-2xs"
            >
              <RotateCcw className="size-3.5" />
              مسح الكل
            </button>
          )}
        </div>

        {/* Stats Filter Buttons */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {(["all", "pending", "preparing", "done"] as const).map((s) => {
            const cfg =
              s === "all"
                ? {
                    label: "كل الطلبات",
                    color: "text-slate-700",
                    bg: "bg-white",
                    border: "border-slate-200",
                  }
                : STATUS_CONFIG[s];
            const count = stats[s];
            const isActive = filter === s;
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={cn(
                  "flex items-center justify-between rounded-xl border p-3 text-right transition-all cursor-pointer shadow-2xs",
                  isActive
                    ? "border-blue-600 bg-blue-600 text-white"
                    : `${cfg.bg} ${cfg.border} hover:border-blue-400`,
                )}
              >
                <span
                  className={cn(
                    "text-lg font-black tabular-nums",
                    isActive ? "text-white" : "text-slate-900",
                  )}
                >
                  {count}
                </span>
                <span
                  className={cn(
                    "text-xs font-bold",
                    isActive ? "text-blue-50" : cfg.color,
                  )}
                >
                  {cfg.label}
                </span>
              </button>
            );
          })}
        </div>
      </header>

      {/* ── Order Cards ── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-16 text-center">
          <ClipboardList className="size-10 text-slate-300 mb-2" />
          <p className="font-bold text-slate-600 text-sm">لا توجد طلبات في هذا القسم</p>
          <p className="text-xs text-slate-400 mt-0.5">ستظهر طلبات الزبائن هنا فور إرسالها.</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filtered.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              isExpanded={expandedId === order.id}
              onToggle={() =>
                setExpandedId((prev) => (prev === order.id ? null : order.id))
              }
              onStatusChange={(status) => {
                updateStatus(order.id, status);
                toast.success(`تم التحديث: ${STATUS_CONFIG[status].label}`);
              }}
              onDelete={() => setDeletingId(order.id)}
            />
          ))}
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deletingId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
          onClick={() => setDeletingId(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl text-center text-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-red-50 text-red-600">
              <Trash2 className="size-5" />
            </div>
            <h3 className="mt-3 font-bold text-base">هل تريد حذف هذا الطلب؟</h3>
            <p className="mt-1 text-xs text-slate-500">لا يمكن التراجع عن هذا الإجراء.</p>
            <div className="mt-5 flex justify-center gap-2.5">
              <button
                onClick={() => setDeletingId(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  removeOrder(deletingId);
                  setDeletingId(null);
                  toast.success("تم حذف الطلب");
                }}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
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

// ─────────────────────────────────────────────────────────────────────────────
// Single Order Card
// ─────────────────────────────────────────────────────────────────────────────
function OrderCard({
  order,
  isExpanded,
  onToggle,
  onStatusChange,
  onDelete,
}: {
  order: Order;
  isExpanded: boolean;
  onToggle: () => void;
  onStatusChange: (s: OrderStatus) => void;
  onDelete: () => void;
}) {
  const cfg = STATUS_CONFIG[order.status];
  const StatusIcon = cfg.icon;
  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);

  const timeStr = new Date(order.createdAt).toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const dateStr = new Date(order.createdAt).toLocaleDateString("ar-EG", {
    month: "short",
    day: "numeric",
  });

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border bg-white shadow-2xs transition-all duration-200",
        order.status === "pending" && "border-amber-200/90",
        order.status === "preparing" && "border-blue-200/90",
        order.status === "done" && "border-slate-200 opacity-80",
      )}
    >
      {/* ── Card Header (Clickable) ── */}
      <div
        onClick={onToggle}
        className="flex cursor-pointer flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 hover:bg-slate-50/50 transition-colors"
      >
        {/* Right side: Table badge + info */}
        <div className="flex items-center gap-3.5">
          <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-xl bg-slate-900 text-white shadow-2xs">
            <span className="text-[0.6rem] font-bold text-slate-400 leading-none">طاولة</span>
            <span className="text-lg font-black leading-tight">{order.tableNumber}</span>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-base">
                طاولة #{order.tableNumber}
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[0.7rem] font-bold",
                  cfg.bg,
                  cfg.color,
                  cfg.border,
                )}
              >
                <StatusIcon className="size-3" />
                {cfg.label}
              </span>
            </div>

            <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
              <span className="flex items-center gap-1 font-medium">
                <Clock3 className="size-3 text-slate-400" />
                {timeStr}
              </span>
              <span>•</span>
              <span className="font-medium">
                {itemCount} {itemCount === 1 ? "صنف" : "أصناف"}
              </span>
            </div>
          </div>
        </div>

        {/* Left side: Price + Expand Chevron */}
        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <span className="text-base font-black text-slate-900 tabular-nums">
            {formatPrice(order.totalPrice)}
          </span>

          <div className="flex size-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors group-hover:bg-slate-200">
            <ChevronDown
              className={cn(
                "size-4 transition-transform duration-200",
                isExpanded && "rotate-180",
              )}
            />
          </div>
        </div>
      </div>

      {/* ── Expanded Content ── */}
      {isExpanded && (
        <div className="border-t border-slate-100 bg-slate-50/40 p-4 sm:p-5 animate-in slide-in-from-top-1 duration-150 space-y-4">
          
          {/* Items List */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-500 text-right">أصناف الطلب:</p>
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-3 shadow-2xs"
              >
                {/* Price calculation */}
                <div className="text-left">
                  <span className="font-bold text-sm text-slate-900 tabular-nums">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </span>
                  <p className="text-[0.7rem] text-slate-400 font-medium">
                    {item.quantity} × {formatPrice(item.unitPrice)}
                  </p>
                </div>

                {/* Product info */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-bold text-sm text-slate-900">{item.productName}</p>
                    <span className="inline-block text-xs font-bold text-blue-600">
                      الكمية: {item.quantity}
                    </span>
                  </div>
                  <div className="size-12 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                    <img
                      src={getOptimizedImageUrl(item.productImage, 100)}
                      alt={item.productName}
                      loading="lazy"
                      className="size-full object-cover"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Invoice Summary Box (Clean & Modern) */}
          <div className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-right">
            <div className="flex items-center gap-2 text-blue-900 font-black text-lg">
              <Receipt className="size-4 text-blue-600" />
              <span>إجمالي الحساب:</span>
            </div>
            <span className="font-black text-xl text-blue-600 tabular-nums">
              {formatPrice(order.totalPrice)}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              {order.status !== "preparing" && order.status !== "done" && (
                <button
                  onClick={() => onStatusChange("preparing")}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-2xs cursor-pointer"
                >
                  <ChefHat className="size-3.5" />
                  بدء التحضير
                </button>
              )}
              {order.status !== "done" && (
                <button
                  onClick={() => onStatusChange("done")}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                >
                  <UtensilsCrossed className="size-3.5" />
                  تم التسليم
                </button>
              )}
              {order.status === "done" && (
                <button
                  onClick={() => onStatusChange("pending")}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <RotateCcw className="size-3.5" />
                  إعادة قيد الانتظار
                </button>
              )}
            </div>

            <button
              onClick={onDelete}
              className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <Trash2 className="size-3.5" />
              حذف الطلب
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
