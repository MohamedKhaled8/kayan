import { MapPin, Phone } from "lucide-react";
import { Reveal } from "./Reveal";

export function SiteFooter() {
  return (
    <footer id="visit" className="bg-[#070403] border-t border-[#DFBA73]/20 text-[#F5EFE6]">
      <div className="mx-auto max-w-5xl px-6 py-16 sm:px-10 md:py-20 text-center">
        <Reveal>
          <span className="font-display text-3xl sm:text-4xl font-normal tracking-[0.15em] text-[#DFBA73] block uppercase">
            KAYAN CAFÉ
          </span>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[#BFB096]">
            Where specialty coffee meets signature drinks &amp; handcrafted desserts. أهلاً بكم في كَيان.
          </p>
        </Reveal>

        <Reveal delay={120}>
          <div className="mx-auto mt-10 max-w-md rounded-3xl border border-[#DFBA73]/20 bg-[#170F0A]/80 p-6 sm:p-8 shadow-soft">
            <p className="eyebrow flex items-center justify-center gap-2 text-[#DFBA73]">
              <MapPin className="size-4 text-[#DFBA73]" /> الموقع والتواصل
            </p>
            <address className="mt-4 space-y-3 text-sm not-italic text-[#BFB096]">
              <p className="font-semibold text-base text-[#F5EFE6]">المنوفية — مدينة السادات</p>
              <p className="leading-relaxed text-sm">سوق المنطقة السابعة التجاري، أول شارع كلية تربية عام</p>
              <div className="pt-2">
                <a
                  href="tel:01023106321"
                  dir="ltr"
                  className="inline-flex items-center gap-2 rounded-full border border-[#DFBA73]/40 bg-[#DFBA73]/10 px-6 py-2.5 text-[#DFBA73] font-mono text-base font-bold transition-all hover:bg-[#DFBA73] hover:text-[#0B0705] hover:shadow-glow"
                >
                  <Phone className="size-4" />
                  <span>01023106321</span>
                </a>
              </div>
            </address>
          </div>
        </Reveal>

        <div className="mt-12 border-t border-[#DFBA73]/10 pt-8 text-center text-xs text-[#BFB096]/60 tracking-widest uppercase">
          © {new Date().getFullYear()} KAYAN CAFÉ · ALL RIGHTS RESERVED.
        </div>
      </div>
    </footer>
  );
}
