import { SignUpButton } from "@clerk/nextjs";
import { ScrollReveal } from "@/components/scroll-reveal";

export function CtaBanner() {
  return (
    <section className="bg-[var(--paper)] pb-16 sm:pb-24">
      <div className="container-shell">
        <ScrollReveal>
          <div className="relative overflow-hidden rounded-[var(--radius-xl)] bg-[linear-gradient(115deg,var(--brand-700),var(--brand-600)_55%,var(--brand-500))] px-7 py-10 sm:px-12 sm:py-12">
            {/* Two soft blooms so the gradient is not a flat wash. */}
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-24 size-64 rounded-full bg-white/12 blur-2xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-24 left-10 size-56 rounded-full bg-black/10 blur-2xl"
            />

            <div className="relative flex flex-col items-start justify-between gap-7 sm:flex-row sm:items-center">
              <div>
                <h2 className="display-title text-[clamp(24px,3.4vw,34px)] text-white">
                  Start Rewarding Today
                </h2>
                <p className="mt-2 max-w-[46ch] text-[14px] leading-relaxed text-white/85">
                  Create a campaign, fund it, and pay your first referrer before the day is out.
                </p>
              </div>

              <SignUpButton mode="modal">
                <button className="group inline-flex h-12 shrink-0 select-none items-center gap-2 rounded-full bg-white pl-6 pr-2 text-[15px] font-semibold text-[var(--ink)] shadow-[0_14px_36px_-14px_rgb(0_0_0/45%)] transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-0.5">
                  Get started
                  <span className="grid size-7 place-items-center rounded-full bg-[var(--brand-500)] text-white transition-transform duration-300 group-hover:rotate-45">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M7 17 17 7M9 7h8v8" />
                    </svg>
                  </span>
                </button>
              </SignUpButton>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
