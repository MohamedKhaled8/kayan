export type Category = string;

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  images: string[];
  featured?: boolean;
  preparation_time?: string;
  calories?: number;
  created_at: string;
  updated_at: string;
};

export const heroCafeImage =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1920&q=85";
export const cafeInteriorImage =
  "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1400&q=85";
export const cafeAtmosphereImage =
  "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1400&q=85";

// Empty by default until products are added by the admin/database
export const seedProducts: Product[] = [];

/**
 * Formats price in Egyptian Pound (EGP / ج.م)
 */
export const formatPrice = (value: number) => {
  const formatted = Number(value).toLocaleString("ar-EG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return `${formatted} ج.م`;
};

export const formatPriceEn = (value: number) => {
  return `${Number(value).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} EGP`;
};
