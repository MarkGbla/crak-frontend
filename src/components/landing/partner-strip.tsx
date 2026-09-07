import Image from "next/image";
import { ScrollReveal } from "@/components/scroll-reveal";

/**
 * The rails and partners money actually moves over.
 *
 * A static grid rather than a marquee: there are only six, they all fit at
 * once, and a logo that slides out of view before it can be read is doing the
 * opposite of what a trust strip is for.
 *
 * Every file in public/logos sits on the same 380x170 canvas. Square marks are
 * sized by height and wordmarks by width — fitting them all to a single
 * bounding box makes the wide ones shout over the square ones.
 */

const PARTNERS = [
  { src: "/logos/orange.png", alt: "Orange Money" },
  { src: "/logos/africell.png", alt: "Africell" },
  { src: "/logos/qcell.png", alt: "QCell" },
  { src: "/logos/monime.png", alt: "Monime" },
  { src: "/logos/vult.png", alt: "Vult" },
  { src: "/logos/flot.png", alt: "Flot" },
];

export function PartnerStrip() {
  return (
    <section className="bg-[var(--paper)] pb-10 pt-6 sm:pb-14">
      <div className="container-shell">
        <ScrollReveal>
          <ul className="grid list-none grid-cols-2 gap-x-6 gap-y-8 p-0 sm:grid-cols-3 lg:grid-cols-6 lg:gap-x-4">
            {PARTNERS.map((partner, index) => (
              <li key={partner.alt} className="flex items-center justify-center">
                <Image
                  src={partner.src}
                  alt={partner.alt}
                  width={380}
                  height={170}
                  priority={index < 3}
                  className="h-[58px] w-auto max-w-full object-contain
                    transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)]
                    hover:scale-[1.05] sm:h-[62px]"
                />
              </li>
            ))}
          </ul>
        </ScrollReveal>
      </div>
    </section>
  );
}
