"use client";

import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";
import { ScrollReveal } from "@/components/scroll-reveal";
import { SectionHeading } from "@/components/ui/section";

const ITEMS = [
  {
    q: "How do referrers get paid?",
    a: "Straight to mobile money. You register a referrer once with their Orange Money or Africell number, and every reward they earn is sent there automatically — usually within seconds of the conversion being reported.",
  },
  {
    q: "Who decides how much a referral is worth?",
    a: "You do, from the dashboard. Set a flat amount for a signup, a percentage of an order, or both — with optional minimums and per-referrer caps. Your app never sends an amount, so a bug in your code can never overpay.",
  },
  {
    q: "Do I need a developer to set this up?",
    a: "Not if you are on Shopify, WooCommerce or Stripe. Paste one webhook URL into your store settings and conversions start flowing. For anything custom, there is a small REST API and guides for JavaScript, PHP and Go.",
  },
  {
    q: "What stops a mistake from draining my budget?",
    a: "Three things. A campaign can only ever spend what you allocated to it, per-referrer caps limit any one person's earnings in a window, and reporting the same conversion twice pays once by design.",
  },
  {
    q: "What happens if a payout fails?",
    a: "The money returns to the campaign automatically and the reward is marked failed with the reason. Nothing is stranded, and nothing is quietly lost.",
  },
  {
    q: "How do I put money into CRAK?",
    a: "Fund your wallet by dialling a USSD code from your mobile money line, or by sharing a payment link. The balance appears the moment the payment is confirmed.",
  },
];

function Item({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(index === 0);
  const id = useId();

  return (
    <div className="border-b border-[var(--line)]">
      <h3>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={id}
          className="flex w-full items-center justify-between gap-6 py-5 text-left transition-colors duration-200 hover:text-[var(--brand-700)]"
        >
          <span className="text-[15px] font-medium">{q}</span>
          <span
            className={`grid size-8 shrink-0 place-items-center rounded-full border transition-all duration-300
              ease-[cubic-bezier(.22,1,.36,1)] ${
                open
                  ? "rotate-180 border-transparent bg-[var(--brand-600)] text-white"
                  : "border-[var(--line)] text-[var(--muted)]"
              }`}
          >
            <ChevronDown size={15} />
          </span>
        </button>
      </h3>
      {/* Grid-rows trick: animates to the content's real height without JS. */}
      <div
        id={id}
        className={`grid transition-all duration-400 ease-[cubic-bezier(.22,1,.36,1)] ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="section-sub max-w-[62ch] pb-5 pr-12 text-[14px]">{a}</p>
        </div>
      </div>
    </div>
  );
}

export function Faq() {
  return (
    <section id="faq" className="bg-[var(--paper)] py-16 sm:py-24">
      <div className="container-shell">
        <SectionHeading
          title="Frequently Asked Questions"
          subtitle="Got questions? We've got answers."
        />
        <ScrollReveal className="mx-auto mt-12 max-w-[760px]">
          {ITEMS.map((item, index) => (
            <Item key={item.q} q={item.q} a={item.a} index={index} />
          ))}
        </ScrollReveal>
      </div>
    </section>
  );
}
