import { Check } from "lucide-react";
import { ScrollReveal } from "@/components/scroll-reveal";
import { SectionHeading } from "@/components/ui/section";

/**
 * Three steps with the big ghost numerals behind them and a dashed line
 * connecting the cards, as in the reference. The numerals are real content
 * here - this is a genuine sequence, so numbering carries meaning.
 */

function Connector({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 140 60"
      className={`hidden h-14 w-full lg:block ${flip ? "-scale-y-100" : ""}`}
      preserveAspectRatio="none"
    >
      <path
        d="M2 46 C 40 46, 44 12, 78 12 S 116 40, 138 22"
        fill="none"
        stroke="var(--brand-300)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="5 7"
      />
    </svg>
  );
}

function StepOne() {
  return (
    <div className="w-full rounded-[var(--radius)] border border-[var(--line)] bg-white p-3.5 shadow-[var(--shadow-sm)]">
      <p className="text-[11px] font-semibold">Create a campaign</p>
      <div className="mt-2.5 h-7 rounded-lg border border-[var(--line)] bg-[var(--surface-2)]" />
      <div className="mt-2 h-7 w-2/3 rounded-lg border border-[var(--line)] bg-[var(--surface-2)]" />
      <div className="mt-3 h-7 rounded-full bg-[var(--brand-600)]" />
    </div>
  );
}

function StepTwo() {
  return (
    <div className="w-full rounded-[var(--radius)] border border-[var(--line)] bg-white p-3.5 shadow-[var(--shadow-sm)]">
      <p className="text-[11px] font-semibold">Set the rules</p>
      <div className="mt-2.5 flex flex-col gap-2">
        {["signup — SLE 50", "first_order — 5%"].map((rule) => (
          <div key={rule} className="flex items-center gap-2">
            <span className="grid size-4 shrink-0 place-items-center rounded-full bg-[var(--brand-600)] text-white">
              <Check size={9} strokeWidth={3.5} />
            </span>
            <span className="h-2 flex-1 rounded-full bg-[var(--brand-100)]" />
          </div>
        ))}
        <div className="flex items-center gap-2 opacity-45">
          <span className="size-4 shrink-0 rounded-full border-2 border-[var(--line)]" />
          <span className="h-2 flex-1 rounded-full bg-[var(--line)]" />
        </div>
      </div>
    </div>
  );
}

function StepThree() {
  return (
    <div className="w-full rounded-[var(--radius)] border border-[var(--line)] bg-white p-3.5 shadow-[var(--shadow-sm)]">
      <p className="text-[10px] font-medium text-[var(--muted-2)]">Aminata received</p>
      <p className="mt-1.5 flex items-center gap-1.5 text-[19px] font-bold tracking-[-0.03em] tabular-nums">
        SLE 200
        <span className="size-2.5 rounded-full bg-[var(--accent-amber)]" />
      </p>
      <p className="mt-0.5 text-[10px] text-[var(--muted-2)]">Orange Money · 078 000 111</p>
      <div className="mt-2.5 inline-flex items-center gap-1 rounded-full bg-[var(--brand-50)] px-2 py-1 text-[9.5px] font-semibold text-[var(--brand-700)]">
        <Check size={10} strokeWidth={3} /> Paid
      </div>
    </div>
  );
}

const STEPS = [
  {
    n: "01",
    title: "Create a campaign",
    body: "Name it, fund it from your wallet, and decide how much budget it can ever spend.",
    art: <StepOne />,
  },
  {
    n: "02",
    title: "Set the rules",
    body: "Say what a signup or an order is worth. Change it any time — no code, no deploy.",
    art: <StepTwo />,
  },
  {
    n: "03",
    title: "Rewards pay out",
    body: "Your app reports a conversion and CRAK sends the reward straight to mobile money.",
    art: <StepThree />,
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="bg-[var(--paper)] py-16 sm:py-24">
      <div className="container-shell">
        <SectionHeading
          title="How It Works"
          subtitle="Live in an afternoon. No integration required to start."
        />

        <div className="mt-14 grid items-start gap-10 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:gap-3">
          {STEPS.map((step, index) => (
            <div key={step.n} className="contents">
              <ScrollReveal delay={index * 130} className="relative">
                {/* The ghost numeral sits behind the card, as in the reference. */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 select-none text-[76px]
                    font-bold leading-none tracking-[-0.05em] text-[var(--brand-100)] lg:-left-2 lg:translate-x-0"
                >
                  {step.n}
                </span>
                <div className="relative flex flex-col items-center">
                  {step.art}
                  <h3 className="mt-6 text-[17px] font-semibold tracking-[-0.02em]">{step.title}</h3>
                  <p className="section-sub mt-2 max-w-[280px] text-center text-[14px]">{step.body}</p>
                </div>
              </ScrollReveal>

              {index < STEPS.length - 1 && (
                <ScrollReveal delay={index * 130 + 90} className="self-start pt-16">
                  <Connector flip={index === 1} />
                </ScrollReveal>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
