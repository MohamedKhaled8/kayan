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
    id: "hot-coffee",
    name: "قهوة مختصة ومشروبات ساخنة",
    description: "إسبريسو، فلات وايت، كورتادو، كيمكس، ومشروبات ساخنة مميزة",
    icon: "Coffee",
    createdAt: new Date("2026-01-01").toISOString(),
  },
  {
    id: "iced-drinks",
    name: "مشروبات باردة ومثلجة",
    description: "سبانش لاتيه مثلج، كولد برو، آيس تي، ومشروبات صيفية منعشة",
    icon: "IceCream",
    createdAt: new Date("2026-01-02").toISOString(),
  },
  {
    id: "fresh-pastries",
    name: "حلويات ومخبوزات طازجة",
    description: "كيك، تشيز كيك، كرواسون فرنسي، دوناتس، وحلويات فاخرة يومياً",
    icon: "Cookie",
    createdAt: new Date("2026-01-03").toISOString(),
  },
  {
    id: "frappe-juices",
    name: "عصائر طبيعية وفرابيه",
    description: "فرابيه كراميل وشوكولاتة، سموذي فواكه طبيعية، وعصائر طازجة",
    icon: "Flame",
    createdAt: new Date("2026-01-04").toISOString(),
  },
  {
    id: "kayan-specials",
    name: "سبيشال كَيان",
    description: "مشروبات وابتكارات حصرية خاصة بكَيان كافيه",
    icon: "Sparkles",
    createdAt: new Date("2026-01-05").toISOString(),
  },
];

const STORAGE_KEY = "kayan.categories.v4";
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
    // BroadcastChannel fallback
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
      // ignore
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
