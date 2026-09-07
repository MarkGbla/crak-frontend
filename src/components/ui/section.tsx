import type { ReactNode } from "react";
import { ScrollReveal } from "@/components/scroll-reveal";

/**
 * Section shell and card surface.
 *
 * Every band on the landing page uses the same vertical rhythm and the same
 * centred heading block, so spacing cannot drift section to section.
 */

export function Section({
  id,
  children,
  className = "",
  tone = "paper",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  tone?: "paper" | "soft";
}) {
  return (
    <section
      id={id}
      className={`${tone === "soft" ? "bg-[var(--surface-2)]" : "bg-[var(--paper)]"} py-16 sm:py-24 ${className}`}
    >
      <div className="container-shell">{children}</div>
    </section>
  );
}

export function SectionHeading({
  title,
  subtitle,
  className = "",
}: {
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <ScrollReveal className={`mx-auto max-w-2xl text-center ${className}`}>
      <h2 className="section-title">{title}</h2>
      {subtitle && <p className="section-sub mt-3">{subtitle}</p>}
    </ScrollReveal>
  );
}

export function Card({
  children,
  className = "",
  interactive = true,
}: {
  children: ReactNode;
  className?: string;
  /** Lift on hover. Off for cards that are purely decorative. */
  interactive?: boolean;
}) {
  return (
    <div
      className={`rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)] p-6
        transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)]
        ${interactive ? "hover:-translate-y-1 hover:border-[var(--brand-200)] hover:shadow-[var(--shadow-lg)]" : ""}
        ${className}`}
    >
      {children}
    </div>
  );
}

/** The tinted square that holds a feature icon. */
export function IconBadge({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`grid size-10 place-items-center rounded-[12px] bg-[var(--brand-50)]
        text-[var(--brand-700)] transition-colors duration-300
        group-hover:bg-[var(--brand-100)] ${className}`}
    >
      {children}
    </span>
  );
}
