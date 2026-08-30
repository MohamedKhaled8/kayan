import { Link } from "@tanstack/react-router";
import { ArrowUpLeft, Images, Clock } from "lucide-react";
import { formatPrice, type Product } from "@/lib/products";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import { Reveal } from "./Reveal";

export function ProductCard({ product, delay = 0 }: { product: Product; delay?: number }) {
  const coverImage =
    product.images?.[0] ||
    "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80";

  return (
    <Reveal delay={delay}>
      <Link
        to="/menu/$productId"
        params={{ productId: product.id }}
        className="card-lift group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-[#8C5A32]/35 bg-[#3A281E] shadow-soft transition-all duration-500 hover:border-[#C08A45]/60 hover:shadow-lift"
      >
        <div className="relative aspect-4/3 overflow-hidden bg-[#241512]">
          <img
            src={getOptimizedImageUrl(coverImage, 700)}
            alt={product.name}
            loading="lazy"
            className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#241512]/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Category Tag */}
          <span className="absolute top-3.5 right-3.5 rounded-full bg-[#241512]/80 px-3 py-1 text-[0.7rem] font-bold text-[#F3E7D6] backdrop-blur-md border border-[#8C5A32]/40 shadow-sm">
            {product.category}
          </span>

          {/* Photo Count */}
          {product.images?.length > 1 && (
            <span className="absolute left-3.5 bottom-3.5 flex items-center gap-1.5 rounded-full bg-[#241512]/80 px-2.5 py-1 text-[0.65rem] font-medium text-[#C9B79C] backdrop-blur-md border border-[#8C5A32]/30">
              <Images className="size-3 text-[#C08A45]" />
              {product.images.length} صور
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col justify-between p-5 text-right">
          <div>
            <h3 className="font-display text-base sm:text-lg font-bold leading-snug text-[#F3E7D6] group-hover:text-[#C08A45] transition-colors">
              {product.name}
            </h3>
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#C9B79C]">
              {product.description}
            </p>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-[#8C5A32]/30 pt-3">
            <div className="flex items-center gap-2">
              <span className="font-display text-lg font-bold text-[#C08A45]">
                {formatPrice(product.price)}
              </span>
              {product.preparation_time && (
                <span className="flex items-center gap-1 text-[0.65rem] text-[#C9B79C]">
                  <Clock className="size-3 text-[#C08A45]/70" />
                  {product.preparation_time}
                </span>
              )}
            </div>
            <span className="flex size-8 items-center justify-center rounded-full bg-[#241512] text-[#F3E7D6] transition-all duration-300 group-hover:bg-[#C08A45] group-hover:text-[#241512]">
              <ArrowUpLeft className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}
