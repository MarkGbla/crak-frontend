import { SignUpButton } from "@clerk/nextjs";
import { TrendingUp, Users } from "lucide-react";
import { AppPreview } from "./app-preview";
import { ButtonLink } from "@/components/ui/button";

/**
 * The hero: green ground dissolving into the page, with the product shot
 * straddling the boundary and two live stats floating either side of it.
 */
export function Hero() {
  return (
    <section id="top" className="brand-fade relative -mt-[72px] overflow-hidden pt-[72px]">
      {/* A very soft radial so the flat green has some depth behind the type. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px]
          bg-[radial-gradient(60%_70%_at_50%_0%,rgb(255_255_255/22%),transparent_70%)]"
      />

      <div className="container-shell relative pt-14 sm:pt-20">
        <h1
          className="display-title anim-rise mx-auto max-w-[760px] text-center text-[clamp(34px,6.2vw,58px)] text-white"
          style={{ "--i": 0 } as React.CSSProperties}
        >
          Your Customers Have Value Reward Them For It
        </h1>

        <p
          className="anim-rise mx-auto mt-5 max-w-[520px] text-center text-[15px] leading-relaxed text-white/85"
          style={{ "--i": 1 } as React.CSSProperties}
        >
          Launch referral campaigns, set what each conversion pays, and send rewards straight
          to mobile money. Thousands of Leones moving safely, every day.
        </p>

        <div
          className="anim-rise mt-8 flex flex-wrap items-center justify-center gap-3"
          style={{ "--i": 2 } as React.CSSProperties}
        >
          <SignUpButton mode="modal">
            <button
              className="group inline-flex h-12 select-none items-center gap-2 rounded-full bg-white pl-6 pr-2
                text-[15px] font-semibold text-[var(--ink)] shadow-[0_14px_36px_-14px_rgb(0_0_0/45%)]
                transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-0.5"
            >
              Start rewarding
              <span className="grid size-7 place-items-center rounded-full bg-[var(--brand-500)] text-white transition-transform duration-300 group-hover:rotate-45">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M7 17 17 7M9 7h8v8" />
                </svg>
              </span>
            </button>
          </SignUpButton>

          <ButtonLink href="#how" variant="onBrand" size="lg" className="bg-white/95">
            Learn more
          </ButtonLink>
        </div>

        {/* --------------------------------------------------- product shot */}
        <div
          className="anim-rise relative mx-auto mt-14 max-w-[880px] pb-16 sm:pb-24"
          style={{ "--i": 3 } as React.CSSProperties}
        >
          <AppPreview />

          {/* Floating stats, mirroring the reference's two callouts. */}
          <div className="anim-float absolute -left-3 top-[42%] hidden rounded-[14px] border border-[var(--line)] bg-white p-3 shadow-[var(--shadow-float)] sm:block lg:-left-12">
            <div className="flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-[10px] bg-[var(--brand-50)] text-[var(--brand-700)]">
                <Users size={15} />
              </span>
              <div>
                <p className="text-[17px] font-bold leading-none tabular-nums">248</p>
                <p className="mt-1 text-[10px] font-medium text-[var(--muted-2)]">Active referrers</p>
              </div>
            </div>
          </div>

          <div className="anim-float-slow absolute -right-3 top-[26%] hidden rounded-[14px] border border-[var(--line)] bg-white p-3 shadow-[var(--shadow-float)] sm:block lg:-right-12">
            <div className="flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-[10px] bg-[var(--brand-700)] text-white">
                <TrendingUp size={15} />
              </span>
              <div>
                <p className="text-[17px] font-bold leading-none tabular-nums">SLE 3,420</p>
                <p className="mt-1 text-[10px] font-medium text-[var(--muted-2)]">Paid this month</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
