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
        className="card-lift group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#DFBA73]/20 bg-[#170F0A] shadow-soft transition-all duration-300 hover:border-[#DFBA73]/50 hover:shadow-lift"
      >
        {/* Compact Image Container */}
        <div className="relative aspect-16/10 overflow-hidden bg-[#0B0705]">
          <img
            src={getOptimizedImageUrl(coverImage, 600)}
            alt={product.name}
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0705]/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Category Tag */}
          <span className="absolute top-2.5 right-2.5 rounded-full bg-[#0B0705]/85 px-2.5 py-0.5 text-[0.62rem] font-bold text-[#DFBA73] backdrop-blur-md border border-[#DFBA73]/25 shadow-sm">
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
              "absolute top-2.5 left-2.5 flex size-7 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 shadow-sm border",
              isLiked
                ? "bg-[#DFBA73] border-[#DFBA73] text-[#0B0705] scale-110"
                : "bg-[#0B0705]/50 border-white/15 text-[#F5EFE6] hover:bg-[#DFBA73] hover:text-[#0B0705]"
            )}
          >
            <Heart className={cn("size-3.5 transition-transform", isLiked && "fill-current")} />
          </button>

          {/* Photo Count */}
          {product.images && product.images.length > 1 && (
            <span className="absolute left-2.5 bottom-2.5 flex items-center gap-1 rounded-full bg-[#0B0705]/85 px-2 py-0.5 text-[0.6rem] font-medium text-[#BFB096] backdrop-blur-md border border-white/10">
              <Images className="size-2.5 text-[#DFBA73]" />
              {product.images.length}
            </span>
          )}
        </div>

        {/* Compact Card Content */}
        <div className="flex flex-1 flex-col justify-between p-3.5 sm:p-4 text-right">
          <div>
            <h3 className="font-display text-sm sm:text-[0.95rem] font-medium leading-snug text-[#F5EFE6] group-hover:text-[#DFBA73] transition-colors line-clamp-1">
              {product.name}
            </h3>
            {product.description && (
              <p className="mt-1 line-clamp-2 text-[0.72rem] sm:text-[0.76rem] leading-relaxed text-[#BFB096]/90">
                {product.description}
              </p>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-[#DFBA73]/10 pt-2.5">
            <div className="flex items-center gap-2">
              <span className="font-display text-base sm:text-lg font-normal text-[#DFBA73]">
                {formatPrice(product.price)}
              </span>
              {product.preparation_time && (
                <span className="flex items-center gap-0.5 text-[0.6rem] text-[#BFB096]/80">
                  <Clock className="size-2.5 text-[#DFBA73]/70" />
                  {product.preparation_time}
                </span>
              )}
            </div>
            <span className="flex size-7 sm:size-7.5 items-center justify-center rounded-full bg-[#0B0705] border border-[#DFBA73]/30 text-[#DFBA73] transition-all duration-300 group-hover:bg-[#DFBA73] group-hover:text-[#0B0705] shadow-sm">
              <ArrowUpLeft className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}
