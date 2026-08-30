import { Clock, Instagram, MapPin, Music2, Phone } from "lucide-react";
import { Reveal } from "./Reveal";

const hours = [
  ["السبت – الأربعاء", "7:00 ص — 12:00 م"],
  ["الخميس", "7:00 ص — 1:00 ص"],
  ["الجمعة", "1:00 م — 1:00 ص"],
];

export function SiteFooter() {
  return (
    <footer id="visit" className="bg-[#1C100D] border-t border-[#8C5A32]/30 text-[#F3E7D6]">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 sm:px-10 md:grid-cols-3 md:py-20 text-right">
        <Reveal>
          <h2 className="font-display text-3xl font-bold text-[#F3E7D6]">KAYAN · كَيان</h2>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#C9B79C]">
            أهلاً بكم في كَيان — تجربة مذاق استثنائية وأجواء تليق باختياراتكم.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            {[Instagram, Music2].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="Social link"
                className="flex size-10 items-center justify-center rounded-full border border-[#8C5A32]/40 text-[#C9B79C] transition-all duration-300 hover:border-[#C08A45] hover:bg-[#C08A45] hover:text-[#241512]"
              >
                <Icon className="size-4" strokeWidth={1.5} />
              </a>
            ))}
          </div>
        </Reveal>

        <Reveal delay={120}>
          <p className="eyebrow flex items-center justify-end gap-2 text-[#C08A45]">
            مواعيد العمل <Clock className="size-3.5" />
          </p>
          <dl className="mt-4 space-y-3 text-sm">
            {hours.map(([day, time]) => (
              <div
                key={day}
                className="flex justify-between gap-4 border-b border-[#8C5A32]/20 pb-2"
              >
                <dt className="text-[#C9B79C]">{day}</dt>
                <dd className="tabular-nums font-semibold text-[#C08A45]">{time}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal delay={240}>
          <p className="eyebrow flex items-center justify-end gap-2 text-[#C08A45]">
            العنوان والتواصل <MapPin className="size-3.5" />
          </p>
          <address className="mt-4 space-y-2 text-sm not-italic text-[#C9B79C]">
            <p className="font-semibold text-[#F3E7D6]">القاهرة — مصر</p>
            <p>شارع التسعين الشمالي، التجمع الخامس</p>
            <p className="flex items-center justify-end gap-2 pt-2 text-[#C08A45] font-mono text-sm">
              <span>+20 100 000 0000</span>
              <Phone className="size-3.5" />
            </p>
          </address>
        </Reveal>
      </div>
      <div className="border-t border-[#8C5A32]/20 py-6 text-center text-xs text-[#C9B79C]/60">
        © {new Date().getFullYear()} KAYAN · جميع الحقوق محفوظة.
      </div>
    </footer>
  );
}
