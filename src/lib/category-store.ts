import { useCallback, useEffect, useState } from "react";

export interface CategoryItem {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  createdAt: string;
}

export const defaultCategories: CategoryItem[] = [
  {
    id: "main-dishes",
    name: "وجبات وأطباق رئيسية",
    description: "أشهى الأطباق والبرجر والباستا المحضرة طازجة بأجود المكونات",
    icon: "Utensils",
    createdAt: new Date("2026-01-01").toISOString(),
  },
  {
    id: "hot-drinks",
    name: "قهوة مختصة ومشروبات ساخنة",
    description: "محاصيل فاخرة، فلات وايت، كيمكس، وإسبريسو ومشروبات دافئة",
    icon: "Coffee",
    createdAt: new Date("2026-01-02").toISOString(),
  },
  {
    id: "cold-drinks",
    name: "مشروبات باردة ومثلجة",
    description: "سبانش لاتيه مثلج، كولد برو، عصائر وموخيتو منعش",
    icon: "GlassWater",
    createdAt: new Date("2026-01-03").toISOString(),
  },
  {
    id: "pastries",
    name: "حلويات ومخبوزات طازجة",
    description: "كرواسون فرنسي، كيك، ومخبوزات وحلويات فاخرة يومياً",
    icon: "Cake",
    createdAt: new Date("2026-01-04").toISOString(),
  },
  {
    id: "specials",
    name: "عروض وسبيشال كَيان",
    description: "ابتكارات وتجارب خاصة حصرية لرواد كَيان",
    icon: "Sparkles",
    createdAt: new Date("2026-01-05").toISOString(),
  },
];

const STORAGE_KEY = "kayan.categories.v3";
const CHANNEL_NAME = "kayan_categories_realtime";

function readCategories(): CategoryItem[] {
  if (typeof window === "undefined") return defaultCategories;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultCategories));
      return defaultCategories;
    }
    const parsed = JSON.parse(raw) as CategoryItem[];
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultCategories));
    return defaultCategories;
  } catch {
    return defaultCategories;
  }
}

function writeCategories(categories: CategoryItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  window.dispatchEvent(new Event("kayan:categories"));

  try {
    if ("BroadcastChannel" in window) {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channel.postMessage({ type: "CATEGORIES_UPDATED", payload: categories });
      channel.close();
    }
  } catch (e) {
    // BroadcastChannel fallback silently handled
  }
}

export function useCategories() {
  const [categories, setCategories] = useState<CategoryItem[]>(readCategories);

  useEffect(() => {
    const sync = () => setCategories(readCategories());
    sync();

    window.addEventListener("kayan:categories", sync);
    window.addEventListener("storage", sync);

    let channel: BroadcastChannel | null = null;
    try {
      if ("BroadcastChannel" in window) {
        channel = new BroadcastChannel(CHANNEL_NAME);
        channel.onmessage = (event) => {
          if (event.data?.type === "CATEGORIES_UPDATED") {
            setCategories(event.data.payload);
          }
        };
      }
    } catch (e) {
      // BroadcastChannel ignore if not available
    }

    return () => {
      window.removeEventListener("kayan:categories", sync);
      window.removeEventListener("storage", sync);
      if (channel) channel.close();
    };
  }, []);

  const save = useCallback((next: CategoryItem[]) => {
    writeCategories(next);
    setCategories(next);
  }, []);

  const addCategory = useCallback(
    (name: string, description = "", icon = "Coffee") => {
      const trimmed = name.trim();
      if (!trimmed) return null;
      const current = readCategories();
      const id =
        trimmed
          .toLowerCase()
          .replace(/[^\w\u0621-\u064A0-9]+/g, "-")
          .replace(/^-|-$/g, "") || `category-${Date.now()}`;

      // Avoid duplicate IDs
      const uniqueId = current.some((c) => c.id === id) ? `${id}-${Date.now().toString().slice(-4)}` : id;

      const newCategory: CategoryItem = {
        id: uniqueId,
        name: trimmed,
        description: description.trim(),
        icon,
        createdAt: new Date().toISOString(),
      };

      const updated = [...current, newCategory];
      save(updated);
      return newCategory;
    },
    [save],
  );

  const updateCategory = useCallback(
    (id: string, updates: Partial<Omit<CategoryItem, "id" | "createdAt">>) => {
      const current = readCategories();
      const updated = current.map((c) => (c.id === id ? { ...c, ...updates } : c));
      save(updated);
    },
    [save],
  );

  const removeCategory = useCallback(
    (id: string) => {
      const current = readCategories();
      const updated = current.filter((c) => c.id !== id);
      save(updated);
    },
    [save],
  );

  const resetCategories = useCallback(() => {
    save(defaultCategories);
  }, [save]);

  return {
    categories,
    addCategory,
    updateCategory,
    removeCategory,
    resetCategories,
  };
}
