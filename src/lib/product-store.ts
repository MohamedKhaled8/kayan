import { useCallback, useEffect, useState } from "react";
import { type Product } from "./products";
import { supabase } from "./supabase";
import { demoProducts } from "./demo-data";

const STORAGE_KEY = "kayan.products.v4";
const CHANNEL_NAME = "kayan_products_realtime";
const DEMO_OVERRIDE_KEY = "kayan.demo_override";

function isDemoDisabled(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(DEMO_OVERRIDE_KEY) === "hidden";
}

function read(): Product[] {
  if (typeof window === "undefined") return demoProducts;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return isDemoDisabled() ? [] : demoProducts;
    }
    const parsed = JSON.parse(raw) as Product[];
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return isDemoDisabled() ? [] : demoProducts;
  } catch {
    return isDemoDisabled() ? [] : demoProducts;
  }
}

function writeLocal(products: Product[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  window.dispatchEvent(new Event("kayan:products"));

  try {
    if ("BroadcastChannel" in window) {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channel.postMessage({ type: "PRODUCTS_UPDATED", payload: products });
      channel.close();
    }
  } catch {
    // ignore
  }
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(read);

  // 1. Fetch products from Supabase
  const fetchSupabaseProducts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped: Product[] = data.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description || "",
          price: Number(item.price) || 0,
          category: item.category || "Hot Drinks",
          images: Array.isArray(item.images) ? item.images : [],
          featured: Boolean(item.featured),
          preparation_time: item.preparation_time || "",
          calories: item.calories ? Number(item.calories) : undefined,
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.updated_at || new Date().toISOString(),
        }));

        setProducts(mapped);
        writeLocal(mapped);
      } else if (!error && (!data || data.length === 0)) {
        if (!isDemoDisabled()) {
          setProducts(demoProducts);
          writeLocal(demoProducts);
        }
      }
    } catch {
      // fallback to local
    }
  }, []);

  // 2. Setup Realtime subscription via Supabase
  useEffect(() => {
    fetchSupabaseProducts();

    const localSync = () => setProducts(read());
    window.addEventListener("kayan:products", localSync);
    window.addEventListener("storage", localSync);

    // Supabase Realtime channel
    const channel = supabase
      .channel("public:products")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => {
          fetchSupabaseProducts();
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener("kayan:products", localSync);
      window.removeEventListener("storage", localSync);
      supabase.removeChannel(channel);
    };
  }, [fetchSupabaseProducts]);

  // 3. Upsert product (Supabase + Local Optimistic)
  const upsert = useCallback(
    async (product: Product) => {
      const current = read();
      const exists = current.some((p) => p.id === product.id);
      const nextProducts = exists
        ? current.map((p) => (p.id === product.id ? product : p))
        : [{ ...product }, ...current];

      // Optimistic update
      writeLocal(nextProducts);
      setProducts(nextProducts);

      // Async save to Supabase
      try {
        await supabase.from("products").upsert({
          id: product.id,
          name: product.name,
          description: product.description || "",
          price: Number(product.price) || 0,
          category: product.category,
          images: product.images || [],
          featured: Boolean(product.featured),
          preparation_time: product.preparation_time || "",
          calories: product.calories || 0,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn("Supabase product upsert warning:", err);
      }
    },
    []
  );

  // 4. Remove product (Supabase + Local Optimistic)
  const remove = useCallback(
    async (id: string) => {
      const current = read();
      const nextProducts = current.filter((p) => p.id !== id);
      writeLocal(nextProducts);
      setProducts(nextProducts);

      try {
        await supabase.from("products").delete().eq("id", id);
      } catch (err) {
        console.warn("Supabase product delete warning:", err);
      }
    },
    []
  );

  // 5. Load Demo Data
  const loadDemoData = useCallback(async (pushToSupabase = false) => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(DEMO_OVERRIDE_KEY);
    }
    writeLocal(demoProducts);
    setProducts(demoProducts);

    if (pushToSupabase) {
      for (const item of demoProducts) {
        try {
          await supabase.from("products").upsert({
            id: item.id,
            name: item.name,
            description: item.description || "",
            price: Number(item.price) || 0,
            category: item.category,
            images: item.images || [],
            featured: Boolean(item.featured),
            preparation_time: item.preparation_time || "",
            calories: item.calories || 0,
            updated_at: new Date().toISOString(),
          });
        } catch {
          // ignore
        }
      }
    }
  }, []);

  // 6. Clear All Products
  const clearAllProducts = useCallback(async (removeFromSupabase = false) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(DEMO_OVERRIDE_KEY, "hidden");
    }
    writeLocal([]);
    setProducts([]);

    if (removeFromSupabase) {
      try {
        await supabase.from("products").delete().neq("id", "none");
      } catch {
        // ignore
      }
    }
  }, []);

  const reset = useCallback(async () => {
    writeLocal([]);
    setProducts([]);
  }, []);

  return { 
    products, 
    upsert, 
    remove, 
    reset,
    loadDemoData,
    clearAllProducts
  };
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
