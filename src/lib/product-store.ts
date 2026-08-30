import { useCallback, useEffect, useState } from "react";
import { seedProducts, type Product } from "./products";

const STORAGE_KEY = "kayan.products.v3";
const CHANNEL_NAME = "kayan_products_realtime";

function read(): Product[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Product[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(products: Product[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  window.dispatchEvent(new Event("kayan:products"));

  try {
    if ("BroadcastChannel" in window) {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channel.postMessage({ type: "PRODUCTS_UPDATED", payload: products });
      channel.close();
    }
  } catch (e) {
    // ignore
  }
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(read);

  useEffect(() => {
    const sync = () => setProducts(read());
    sync();

    window.addEventListener("kayan:products", sync);
    window.addEventListener("storage", sync);

    let channel: BroadcastChannel | null = null;
    try {
      if ("BroadcastChannel" in window) {
        channel = new BroadcastChannel(CHANNEL_NAME);
        channel.onmessage = (event) => {
          if (event.data?.type === "PRODUCTS_UPDATED") {
            setProducts(event.data.payload);
          }
        };
      }
    } catch (e) {
      // ignore
    }

    return () => {
      window.removeEventListener("kayan:products", sync);
      window.removeEventListener("storage", sync);
      if (channel) channel.close();
    };
  }, []);

  const save = useCallback((next: Product[]) => {
    write(next);
    setProducts(next);
  }, []);

  const upsert = useCallback(
    (product: Product) => {
      const current = read();
      const exists = current.some((p) => p.id === product.id);
      save(
        exists
          ? current.map((p) => (p.id === product.id ? product : p))
          : [{ ...product }, ...current],
      );
    },
    [save],
  );

  const remove = useCallback(
    (id: string) => {
      save(read().filter((p) => p.id !== id));
    },
    [save],
  );

  const reset = useCallback(() => save([]), [save]);

  return { products, upsert, remove, reset };
}

export function slugify(name: string) {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^\w\u0621-\u064A0-9]+/g, "-")
      .replace(/^-|-$/g, "") || `product-${Date.now()}`
  );
}
