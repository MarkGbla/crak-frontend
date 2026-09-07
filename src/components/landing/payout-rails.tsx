import { Building2, Smartphone, Wallet } from "lucide-react";
import { ScrollReveal } from "@/components/scroll-reveal";
import { IconBadge, SectionHeading } from "@/components/ui/section";

const RAILS = [
  {
    icon: Smartphone,
    title: "Orange Money",
    body: "The rail most of Salone already uses. Rewards land on the phone in the referrer's pocket.",
  },
  {
    icon: Wallet,
    title: "Africell Money",
    body: "Same flow, same speed. Pick the provider each referrer prefers when you register them.",
  },
  {
    icon: Building2,
    title: "Bank transfer",
    body: "For larger rewards, pay straight into an account at any supported Sierra Leonean bank.",
  },
];

export function PayoutRails() {
  return (
    <section id="rails" className="bg-[var(--paper)] py-16 sm:py-24">
      <div className="container-shell">
        <SectionHeading
          title="Pay Rewards With"
          subtitle="However your referrers want the money, CRAK sends it there."
        />

        <div className="mt-12 grid gap-10 sm:grid-cols-3">
          {RAILS.map((rail, index) => (
            <ScrollReveal key={rail.title} delay={index * 100}>
              <div className="group flex flex-col items-center text-center">
                <IconBadge className="size-12 rounded-[14px]">
                  <rail.icon size={21} />
                </IconBadge>
                <h3 className="mt-4 text-[16px] font-semibold tracking-[-0.02em]">{rail.title}</h3>
                <p className="section-sub mt-2 max-w-[280px] text-[14px]">{rail.body}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
