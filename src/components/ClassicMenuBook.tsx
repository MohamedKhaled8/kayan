import { useMemo } from "react";
import { useClassicMenu, type ClassicMenuItem } from "@/lib/classic-menu-store";

export function ClassicMenuBook() {
  const { items } = useClassicMenu();

  // Split items into 2 balanced columns (Left & Right) matching the book spread
  const { leftColumn, rightColumn } = useMemo(() => {
    const total = items.length;
    const mid = Math.ceil(total / 2);
    return {
      leftColumn: items.slice(0, mid),
      rightColumn: items.slice(mid),
    };
  }, [items]);

  return (
    <div className="w-full bg-[#FCFBF7] text-[#000000] font-serif py-12 sm:py-16 px-6 sm:px-10 md:px-16 lg:px-20 select-none min-h-[90vh] flex flex-col justify-between" dir="ltr">
      <div className="mx-auto max-w-5xl w-full">
        
        {/* Header: Pure, elegant, high-contrast Didone/Serif Menu title */}
        <header className="mb-12 sm:mb-14 text-center">
          <h1
            className="text-5xl sm:text-6xl md:text-7xl font-medium text-black tracking-tight leading-none"
            style={{ fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif" }}
          >
            Menu
          </h1>
        </header>

        {/* 2-Column Menu Sheet Layout */}
        <div className="grid grid-cols-1 gap-x-12 gap-y-7 md:grid-cols-2 md:gap-x-16 lg:gap-x-20">
          
          {/* Left Column Spread */}
          <div className="space-y-6 sm:space-y-7">
            {leftColumn.map((item, idx) => (
              <MenuItemRow
                key={item.id || idx}
                item={item}
                indexNumber={String(idx + 1).padStart(2, "0")}
              />
            ))}
          </div>

          {/* Right Column Spread */}
          <div className="space-y-6 sm:space-y-7">
            {rightColumn.map((item, idx) => (
              <MenuItemRow
                key={item.id || idx}
                item={item}
                indexNumber={String(leftColumn.length + idx + 1).padStart(2, "0")}
              />
            ))}
          </div>

        </div>

      </div>

      {/* Elegant, discreet, minimal paper footnote instead of bulky dark footer */}
      <footer className="mt-16 sm:mt-20 border-t border-stone-300 pt-6 text-center text-[0.7rem] sm:text-xs font-sans tracking-[0.25em] text-stone-500 uppercase">
        <p>KAYAN CAFÉ &amp; ROASTERY · ALL PRICES ARE INCLUSIVE OF VAT</p>
      </footer>
    </div>
  );
}

interface MenuItemRowProps {
  item: ClassicMenuItem;
  indexNumber: string;
}

function MenuItemRow({ item, indexNumber }: MenuItemRowProps) {
  const priceFormatted = Number(item.price).toLocaleString("en-US");

  return (
    <div className="flex flex-col group">
      
      {/* Top Line: 01 . + NAME + DOTTED LEADER + PRICE */}
      <div className="flex items-baseline justify-between w-full">
        
        {/* Left: Number + Uppercase Name (Deep High-Contrast Black & Crisp Typography) */}
        <div className="flex items-baseline shrink-0 max-w-[74%]">
          <span
            className="font-serif text-sm sm:text-base font-bold tracking-tight shrink-0 mr-2.5 text-black"
            style={{ fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif" }}
          >
            {indexNumber} .
          </span>

          <h3
            className="font-serif text-sm sm:text-[0.95rem] font-bold uppercase tracking-[0.05em] text-black leading-snug break-words"
            style={{ fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif" }}
          >
            {item.name}
          </h3>
        </div>

        {/* Crisp Dotted Leader Line */}
        <div className="flex-1 mx-2 sm:mx-3 border-b-[1.5px] border-dotted border-stone-500 opacity-70 mb-0.5 shrink" />

        {/* Price (Deep Crisp Bold Black) */}
        <div className="shrink-0 text-right">
          <span
            className="font-serif text-sm sm:text-[0.95rem] font-bold text-black tracking-tight"
            style={{ fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif" }}
          >
            {priceFormatted}
          </span>
        </div>

      </div>

      {/* Description underneath: Sharp, legible, italicized dark charcoal */}
      {item.description && (
        <p
          className="mt-1 pl-7 sm:pl-8 text-xs sm:text-[0.85rem] italic font-serif text-[#2B2928] leading-relaxed text-left font-normal"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          {item.description}
        </p>
      )}

    </div>
  );
}
