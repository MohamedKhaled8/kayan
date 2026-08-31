import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";
import { demoCategories } from "./demo-data";

export interface CategoryItem {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  sort_order?: number;
  createdAt: string;
}

export const defaultCategories: CategoryItem[] = demoCategories;

const STORAGE_KEY = "kayan.categories.v4";
const CHANNEL_NAME = "kayan_categories_realtime";
const DEMO_OVERRIDE_KEY = "kayan.demo_override";

function isDemoDisabled(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(DEMO_OVERRIDE_KEY) === "hidden";
}

function readCategories(): CategoryItem[] {
  if (typeof window === "undefined") return demoCategories;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return isDemoDisabled() ? [] : demoCategories;
    const parsed = JSON.parse(raw) as CategoryItem[];
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return isDemoDisabled() ? [] : demoCategories;
  } catch {
    return isDemoDisabled() ? [] : demoCategories;
  }
}

function writeLocal(categories: CategoryItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  window.dispatchEvent(new Event("kayan:categories"));

  try {
    if ("BroadcastChannel" in window) {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channel.postMessage({ type: "CATEGORIES_UPDATED", payload: categories });
      channel.close();
    }
  } catch {
    // ignore
  }
}

export function useCategories() {
  const [categories, setCategories] = useState<CategoryItem[]>(readCategories);

  // 1. Fetch initial categories from Supabase
  const fetchSupabaseCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("created_at", { ascending: true });

      if (!error && data && data.length > 0) {
        const mapped: CategoryItem[] = data.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description || "",
          icon: item.icon || "Coffee",
          sort_order: item.sort_order || 0,
          createdAt: item.created_at || new Date().toISOString(),
        }));
        setCategories(mapped);
        writeLocal(mapped);
      } else if (!error && (!data || data.length === 0)) {
        if (!isDemoDisabled()) {
          setCategories(demoCategories);
          writeLocal(demoCategories);
        }
      }
    } catch {
      // fallback to local cache
    }
  }, []);

  // 2. Realtime subscription via Supabase + local events
  useEffect(() => {
    fetchSupabaseCategories();

    const localSync = () => setCategories(readCategories());
    window.addEventListener("kayan:categories", localSync);
    window.addEventListener("storage", localSync);

    // Supabase Realtime channel
    const channel = supabase
      .channel("public:categories")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "categories" },
        () => {
          fetchSupabaseCategories();
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener("kayan:categories", localSync);
      window.removeEventListener("storage", localSync);
      supabase.removeChannel(channel);
    };
  }, [fetchSupabaseCategories]);

  // 3. Add Category (Supabase + Local)
  const addCategory = useCallback(
    async (name: string, description = "", icon = "Coffee") => {
      const trimmed = name.trim();
      if (!trimmed) return null;

      const current = readCategories();
      const id =
        trimmed
          .toLowerCase()
          .replace(/[^\w\u0621-\u064A0-9]+/g, "-")
          .replace(/^-|-$/g, "") || `cat-${Date.now()}`;

      const uniqueId = current.some((c) => c.id === id)
        ? `${id}-${Date.now().toString().slice(-4)}`
        : id;

      const newCategory: CategoryItem = {
        id: uniqueId,
        name: trimmed,
        description: description.trim(),
        icon,
        createdAt: new Date().toISOString(),
      };

      // Optimistic update
      const updated = [...current, newCategory];
      writeLocal(updated);
      setCategories(updated);

      // Async write to Supabase
      try {
        await supabase.from("categories").insert({
          id: uniqueId,
          name: trimmed,
          description: description.trim(),
          icon,
          created_at: newCategory.createdAt,
          updated_at: newCategory.createdAt,
        });
      } catch (err) {
        console.warn("Supabase insert category warning:", err);
      }

      return newCategory;
    },
    []
  );

  // 4. Update Category
  const updateCategory = useCallback(
    async (id: string, updates: Partial<Omit<CategoryItem, "id" | "createdAt">>) => {
      const current = readCategories();
      const updated = current.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      );
      writeLocal(updated);
      setCategories(updated);

      try {
        await supabase.from("categories").update({
          name: updates.name,
          description: updates.description,
          icon: updates.icon,
          updated_at: new Date().toISOString(),
        }).eq("id", id);
      } catch (err) {
        console.warn("Supabase update category warning:", err);
      }
    },
    []
  );

  // 5. Remove Category
  const removeCategory = useCallback(
    async (id: string) => {
      const current = readCategories();
      const updated = current.filter((c) => c.id !== id);
      writeLocal(updated);
      setCategories(updated);

      try {
        await supabase.from("categories").delete().eq("id", id);
      } catch (err) {
        console.warn("Supabase delete category warning:", err);
      }
    },
    []
  );

  // 6. Load Demo Categories
  const loadDemoCategories = useCallback(async (pushToSupabase = true) => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(DEMO_OVERRIDE_KEY);
    }
    writeLocal(demoCategories);
    setCategories(demoCategories);

    if (pushToSupabase) {
      for (const cat of demoCategories) {
        try {
          await supabase.from("categories").upsert({
            id: cat.id,
            name: cat.name,
            description: cat.description || "",
            icon: cat.icon || "Coffee",
            created_at: cat.createdAt,
            updated_at: cat.createdAt,
          });
        } catch {
          // ignore
        }
      }
    }
  }, []);

  // 7. Clear All Categories
  const clearAllCategories = useCallback(async (removeFromSupabase = false) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(DEMO_OVERRIDE_KEY, "hidden");
    }
    writeLocal([]);
    setCategories([]);

    if (removeFromSupabase) {
      try {
        await supabase.from("categories").delete().neq("id", "none");
      } catch {
        // ignore
      }
    }
  }, []);

  const resetCategories = useCallback(async () => {
    writeLocal(demoCategories);
    setCategories(demoCategories);
  }, []);

  return {
    categories,
    addCategory,
    updateCategory,
    removeCategory,
    resetCategories,
    loadDemoCategories,
    clearAllCategories,
  };
}
