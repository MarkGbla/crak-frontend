import {
  Activity,
  BadgeCheck,
  Layers,
  Link2,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Card, IconBadge, SectionHeading } from "@/components/ui/section";

const FEATURES = [
  {
    icon: Layers,
    title: "Double-entry ledger",
    body: "Every Leone is accounted for on both sides. Balances can never drift.",
  },
  {
    icon: Zap,
    title: "Instant payouts",
    body: "Rewards reach Orange Money or Africell in seconds, not at month end.",
  },
  {
    icon: ShieldCheck,
    title: "Spending caps",
    body: "Limit what any referrer can earn per day, week or month. A bad integration costs one reward.",
  },
  {
    icon: BadgeCheck,
    title: "Rules without code",
    body: "Change what a conversion pays from the dashboard. Your app never redeploys.",
  },
  {
    icon: Link2,
    title: "Paste-a-URL setup",
    body: "Already on Shopify or WooCommerce? Paste one webhook URL and you are live.",
  },
  {
    icon: Activity,
    title: "Live reconciliation",
    body: "Your books are checked against the payment provider continuously, not quarterly.",
  },
];

export function Features() {
  return (
    <section id="features" className="bg-[var(--paper)] py-16 sm:py-24">
      <div className="container-shell">
        <SectionHeading
          title="Why Choose CRAK"
          subtitle="Built for money movement, not just tracking."
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <ScrollReveal key={feature.title} delay={index * 70}>
              <Card className="group h-full">
                <IconBadge>
                  <feature.icon size={18} />
                </IconBadge>
                <h3 className="mt-4 text-[16px] font-semibold tracking-[-0.02em]">{feature.title}</h3>
                <p className="section-sub mt-2 text-[14px]">{feature.body}</p>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
