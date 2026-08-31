import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";

export interface ClassicMenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  sort_order?: number;
  created_at: string;
}

export const defaultClassicMenuItems: ClassicMenuItem[] = [
  {
    id: "classic-1",
    name: "LATTE",
    description: "Espresso with Steamed Milk and Light Foam.",
    price: 150,
    sort_order: 1,
    created_at: new Date("2026-01-01").toISOString(),
  },
  {
    id: "classic-2",
    name: "AVOCADO HERB TOAST",
    description: "Creamy Avocado, Feta Cheese, Cherry Tomatoes On Toasted Sourdough.",
    price: 450,
    sort_order: 2,
    created_at: new Date("2026-01-02").toISOString(),
  },
  {
    id: "classic-3",
    name: "HONEY GRANOLA BOWL",
    description: "Greek Yogurt, Homemade Granola, Banana, Honey, Fresh Berries.",
    price: 400,
    sort_order: 3,
    created_at: new Date("2026-01-03").toISOString(),
  },
  {
    id: "classic-4",
    name: "TROPICAL SMOOTHIE BOWL",
    description: "Mango, Banana, Coconut, Chia Seeds, Seasonal Fruits.",
    price: 350,
    sort_order: 4,
    created_at: new Date("2026-01-04").toISOString(),
  },
  {
    id: "classic-5",
    name: "CORN & BACON TOAST",
    description: "Sweet Corn, Crispy Bacon, Arugula, Garlic Aioli.",
    price: 350,
    sort_order: 5,
    created_at: new Date("2026-01-05").toISOString(),
  },
  {
    id: "classic-6",
    name: "VEGGIE BREAKFAST PLATE",
    description: "Eggs, Grilled Vegetables, Mushrooms, Smashed Avocado.",
    price: 250,
    sort_order: 6,
    created_at: new Date("2026-01-06").toISOString(),
  },
  {
    id: "classic-7",
    name: "BANANA BERRY SHAKE",
    description: "Banana, Blueberries, Strawberries, Fresh Milk.",
    price: 550,
    sort_order: 7,
    created_at: new Date("2026-01-07").toISOString(),
  },
  {
    id: "classic-8",
    name: "CITRUS FRUIT SALAD",
    description: "Orange, Kiwi, Grapes, Pineapple, Mint Syrup.",
    price: 600,
    sort_order: 8,
    created_at: new Date("2026-01-08").toISOString(),
  },
  {
    id: "classic-9",
    name: "SPANISH LATTE ICED",
    description: "Double Espresso, Sweet Condensed Milk, Fresh Whole Milk.",
    price: 145,
    sort_order: 9,
    created_at: new Date("2026-01-09").toISOString(),
  },
  {
    id: "classic-10",
    name: "SAN SEBASTIAN CHEESECAKE",
    description: "Baked Basque Cheesecake Served With Warm Belgian Chocolate.",
    price: 170,
    sort_order: 10,
    created_at: new Date("2026-01-10").toISOString(),
  },
  {
    id: "classic-11",
    name: "PISTACHIO CROISSANT",
    description: "Fresh Flaky French Croissant Filled With Pure Pistachio Cream.",
    price: 130,
    sort_order: 11,
    created_at: new Date("2026-01-11").toISOString(),
  },
  {
    id: "classic-12",
    name: "ETHIOPIAN V60 POUROVER",
    description: "Single Origin Yirgacheffe Beans With Floral & Citrus Notes.",
    price: 130,
    sort_order: 12,
    created_at: new Date("2026-01-12").toISOString(),
  },
];

const STORAGE_KEY = "kayan.classic_menu.v2";
const CHANNEL_NAME = "kayan_classic_menu_realtime";

function read(): ClassicMenuItem[] {
  if (typeof window === "undefined") return defaultClassicMenuItems;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultClassicMenuItems;
    const parsed = JSON.parse(raw) as ClassicMenuItem[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultClassicMenuItems;
  } catch {
    return defaultClassicMenuItems;
  }
}

function writeLocal(items: ClassicMenuItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("kayan:classic_menu"));

  try {
    if ("BroadcastChannel" in window) {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channel.postMessage({ type: "CLASSIC_MENU_UPDATED", payload: items });
      channel.close();
    }
  } catch {
    // ignore
  }
}

export function useClassicMenu() {
  const [items, setItems] = useState<ClassicMenuItem[]>(read);

  const fetchSupabase = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("classic_menu")
        .select("*")
        .order("sort_order", { ascending: true });

      if (!error && data && data.length > 0) {
        const mapped: ClassicMenuItem[] = data.map((d) => ({
          id: d.id,
          name: d.name,
          description: d.description || "",
          price: Number(d.price) || 0,
          sort_order: d.sort_order || 0,
          created_at: d.created_at || new Date().toISOString(),
        }));
        setItems(mapped);
        writeLocal(mapped);
      }
    } catch {
      // fallback to local
    }
  }, []);

  useEffect(() => {
    fetchSupabase();

    const localSync = () => setItems(read());
    window.addEventListener("kayan:classic_menu", localSync);
    window.addEventListener("storage", localSync);

    const channel = supabase
      .channel("public:classic_menu")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "classic_menu" },
        () => {
          fetchSupabase();
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener("kayan:classic_menu", localSync);
      window.removeEventListener("storage", localSync);
      supabase.removeChannel(channel);
    };
  }, [fetchSupabase]);

  const upsertItem = useCallback(async (item: ClassicMenuItem) => {
    const current = read();
    const exists = current.some((i) => i.id === item.id);
    const next = exists
      ? current.map((i) => (i.id === item.id ? item : i))
      : [...current, item];

    writeLocal(next);
    setItems(next);

    try {
      await supabase.from("classic_menu").upsert({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        sort_order: item.sort_order || 0,
        updated_at: new Date().toISOString(),
      });
    } catch {
      // ignore
    }
  }, []);

  const removeItem = useCallback(async (id: string) => {
    const current = read();
    const next = current.filter((i) => i.id !== id);
    writeLocal(next);
    setItems(next);

    try {
      await supabase.from("classic_menu").delete().eq("id", id);
    } catch {
      // ignore
    }
  }, []);

  const loadDefaults = useCallback(async () => {
    writeLocal(defaultClassicMenuItems);
    setItems(defaultClassicMenuItems);
  }, []);

  const clearAll = useCallback(async () => {
    writeLocal([]);
    setItems([]);
  }, []);

  return {
    items,
    upsertItem,
    removeItem,
    loadDefaults,
    clearAll,
  };
}
