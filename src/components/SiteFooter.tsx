import { MapPin, Phone } from "lucide-react";
import logoSymbol from "@/assets/logo-symbol.png";

export function SiteFooter() {
  return (
    <footer id="visit" className="border-t border-[#DFBA73]/15 bg-[#070403] text-[#F5EFE6]">
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-10">
        
        {/* Main Content Row */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 pb-10 border-b border-white/5">
          
          {/* Brand & Location / Contact Info */}
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-right">
            <img 
              src={logoSymbol} 
              alt="Kayan Logo" 
              className="h-12 w-auto object-contain filter drop-shadow-[0_2px_10px_rgba(223,186,115,0.2)]" 
            />
            <div className="space-y-1.5">
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <span className="font-display text-xl sm:text-2xl font-bold tracking-[0.18em] text-[#DFBA73] uppercase">
                  KAYAN CAFÉ
                </span>
                <span className="text-xs text-[#BFB096]/50">|</span>
                <a
                  href="tel:01023106321"
                  dir="ltr"
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#DFBA73] hover:underline"
                >
                  <Phone className="size-3.5" />
                  <span>01023106321</span>
                </a>
              </div>
              <p className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-[#BFB096]/80">
                <MapPin className="size-3.5 text-[#DFBA73] shrink-0" />
                <span>المنوفية — مدينة السادات · سوق المنطقة السابعة التجاري</span>
              </p>
            </div>
          </div>

          {/* Developer Section: Powered by Eng. Mohamed Khaled */}
          <div className="flex flex-col items-center lg:items-end gap-2.5">
            <p className="text-xs font-medium tracking-wider text-[#BFB096]/70 uppercase">
              Powered By <span className="text-[#DFBA73] font-semibold">Eng. Mohamed Khaled</span>
            </p>
            
            {/* Social & Contact Buttons matching user's design */}
            <div className="flex items-center gap-2.5" dir="ltr">
              <a
                href="tel:01026331866"
                title="Phone"
                aria-label="Phone"
                className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-[#120B08] text-[#F5EFE6] transition-all hover:border-[#DFBA73] hover:bg-[#DFBA73] hover:text-[#0B0705] hover:scale-105"
              >
                <Phone className="size-4" />
              </a>

              <a
                href="https://github.com/MohamedKhaled8"
                target="_blank"
                rel="noopener noreferrer"
                title="GitHub"
                aria-label="GitHub"
                className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-[#120B08] text-[#F5EFE6] transition-all hover:border-[#DFBA73] hover:bg-[#DFBA73] hover:text-[#0B0705] hover:scale-105 font-mono font-bold text-sm"
              >
                &lt;/&gt;
              </a>

              <a
                href="https://www.linkedin.com/in/mohamed-khaled-0341a2224"
                target="_blank"
                rel="noopener noreferrer"
                title="LinkedIn"
                aria-label="LinkedIn"
                className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-[#120B08] text-[#F5EFE6] transition-all hover:border-[#DFBA73] hover:bg-[#DFBA73] hover:text-[#0B0705] hover:scale-105 font-bold text-xs"
              >
                in
              </a>

              <a
                href="https://www.facebook.com/mohamedkhaled.khalil.5/"
                target="_blank"
                rel="noopener noreferrer"
                title="Facebook"
                aria-label="Facebook"
                className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-[#120B08] text-[#F5EFE6] transition-all hover:border-[#DFBA73] hover:bg-[#DFBA73] hover:text-[#0B0705] hover:scale-105 font-bold text-sm"
              >
                f
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="pt-6 text-center text-[0.7rem] text-[#BFB096]/40 tracking-widest uppercase">
          © {new Date().getFullYear()} KAYAN CAFÉ · ALL RIGHTS RESERVED.
        </div>

      </div>
    </footer>
  );
}
