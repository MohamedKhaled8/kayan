import { Link } from "@tanstack/react-router";
import { ArrowUpLeft, Images, Clock, Heart } from "lucide-react";
import { useState } from "react";
import { formatPrice, type Product } from "@/lib/products";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import { Reveal } from "./Reveal";
import { cn } from "@/lib/utils";

export function ProductCard({ product, delay = 0 }: { product: Product; delay?: number }) {
  const [isLiked, setIsLiked] = useState(false);
  const coverImage =
    product.images?.[0] ||
    "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80";

  return (
    <Reveal delay={delay}>
      <Link
        to="/menu/$productId"
        params={{ productId: product.id }}
        className="card-lift group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-[#DFBA73]/25 bg-[#170F0A] shadow-soft transition-all duration-500 hover:border-[#DFBA73]/60 hover:shadow-lift"
      >
        <div className="relative aspect-4/3 overflow-hidden bg-[#0B0705]">
          <img
            src={getOptimizedImageUrl(coverImage, 700)}
            alt={product.name}
            loading="lazy"
            className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0705]/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Category Tag */}
          <span className="absolute top-3.5 right-3.5 rounded-full bg-[#0B0705]/90 px-3.5 py-1 text-[0.7rem] font-bold text-[#DFBA73] backdrop-blur-md border border-[#DFBA73]/30 shadow-sm">
            {product.category}
          </span>

          {/* Favorite Heart Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsLiked((prev) => !prev);
            }}
            aria-label="حفظ في المفضلة"
            className={cn(
              "absolute top-3.5 left-3.5 flex size-8 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 shadow-sm border",
              isLiked
                ? "bg-[#DFBA73] border-[#DFBA73] text-[#0B0705] scale-110"
                : "bg-[#0B0705]/50 border-white/20 text-[#F5EFE6] hover:bg-[#DFBA73] hover:text-[#0B0705] hover:scale-105"
            )}
          >
            <Heart className={cn("size-4 transition-transform", isLiked && "fill-current")} />
          </button>

          {/* Photo Count */}
          {product.images?.length > 1 && (
            <span className="absolute left-3.5 bottom-3.5 flex items-center gap-1.5 rounded-full bg-[#0B0705]/90 px-2.5 py-1 text-[0.65rem] font-semibold text-[#BFB096] backdrop-blur-md border border-white/10">
              <Images className="size-3 text-[#DFBA73]" />
              {product.images.length} صور
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col justify-between p-6 text-right">
          <div>
            <h3 className="font-display text-lg sm:text-xl font-normal leading-snug text-[#F5EFE6] group-hover:text-[#DFBA73] transition-colors">
              {product.name}
            </h3>
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#BFB096]">
              {product.description}
            </p>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-[#DFBA73]/15 pt-4">
            <div className="flex items-center gap-2">
              <span className="font-display text-xl font-normal text-[#DFBA73]">
                {formatPrice(product.price)}
              </span>
              {product.preparation_time && (
                <span className="flex items-center gap-1 text-[0.65rem] text-[#BFB096]">
                  <Clock className="size-3 text-[#DFBA73]/70" />
                  {product.preparation_time}
                </span>
              )}
            </div>
            <span className="flex size-9 items-center justify-center rounded-full bg-[#0B0705] border border-[#DFBA73]/30 text-[#DFBA73] transition-all duration-300 group-hover:bg-[#DFBA73] group-hover:text-[#0B0705] shadow-sm">
              <ArrowUpLeft className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}
