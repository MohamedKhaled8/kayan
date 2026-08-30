import { useCallback, useEffect, useState } from "react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type OrderItem = {
  productId: string;
  productName: string;
  productImage: string;
  unitPrice: number;
  quantity: number;
};

export type OrderStatus = "pending" | "preparing" | "done";

export type Order = {
  id: string;
  tableNumber: number;
  items: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
};

// ─────────────────────────────────────────────
// Storage helpers
// ─────────────────────────────────────────────

const STORAGE_KEY = "kayan.orders.v1";
const CHANNEL = "kayan_orders_realtime";

function readOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Order[]) : [];
  } catch {
    return [];
  }
}

function writeOrders(orders: Order[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  window.dispatchEvent(new Event("kayan:orders"));
  try {
    if ("BroadcastChannel" in window) {
      const ch = new BroadcastChannel(CHANNEL);
      ch.postMessage({ type: "ORDERS_UPDATED", payload: orders });
      ch.close();
    }
  } catch {
    // silently ignore
  }
}

// ─────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>(readOrders);

  useEffect(() => {
    const sync = () => setOrders(readOrders());
    window.addEventListener("kayan:orders", sync);
    window.addEventListener("storage", sync);

    let ch: BroadcastChannel | null = null;
    try {
      if ("BroadcastChannel" in window) {
        ch = new BroadcastChannel(CHANNEL);
        ch.onmessage = (e) => {
          if (e.data?.type === "ORDERS_UPDATED") setOrders(e.data.payload);
        };
      }
    } catch {
      // ignore
    }

    return () => {
      window.removeEventListener("kayan:orders", sync);
      window.removeEventListener("storage", sync);
      ch?.close();
    };
  }, []);

  const placeOrder = useCallback(
    (tableNumber: number, items: OrderItem[]): Order => {
      const total = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
      const order: Order = {
        id: `order-${Date.now()}`,
        tableNumber,
        items,
        totalPrice: total,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      const updated = [order, ...readOrders()];
      writeOrders(updated);
      setOrders(updated);
      return order;
    },
    [],
  );

  const updateStatus = useCallback((id: string, status: OrderStatus) => {
    const updated = readOrders().map((o) =>
      o.id === id ? { ...o, status } : o,
    );
    writeOrders(updated);
    setOrders(updated);
  }, []);

  const removeOrder = useCallback((id: string) => {
    const updated = readOrders().filter((o) => o.id !== id);
    writeOrders(updated);
    setOrders(updated);
  }, []);

  const clearAll = useCallback(() => {
    writeOrders([]);
    setOrders([]);
  }, []);

  return { orders, placeOrder, updateStatus, removeOrder, clearAll };
}
