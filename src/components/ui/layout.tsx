import type { ReactNode } from "react";

/**
 * The dashboard layout system.
 *
 * Every page is assembled from these primitives, and none of them may set its
 * own width, gutter or rhythm. That is the whole point: before this, six pages
 * carried five different content measures and stacked their sections with
 * hand-picked `mt-*` values, so the column jumped and the rhythm drifted every
 * time you navigated. Widths and spacing now live in globals.css and are read
 * from there.
 *
 * The vocabulary is deliberately small:
 *
 *   Page      the content measure and the vertical rhythm
 *   PageHeader the title block every page opens with
 *   CardGrid  equal cards that reflow on their own, without breakpoints
 *   Split     a main column with a supporting aside
 *   Toolbar   a row of controls that becomes a stack on narrow screens
 *   Cluster   a small group of inline things (buttons, chips)
 *   Stack     vertical rhythm inside a panel
 */

/* ------------------------------------------------------------------- page */
const measures = {
  /** Tables and dense overviews. */
  wide: "max-w-[var(--measure-wide)]",
  /** The default: reading and working width. */
  default: "max-w-[var(--measure)]",
  /** Forms and single-column settings, kept short enough to scan. */
  narrow: "max-w-[var(--measure-narrow)]",
};

export function Page({
  width = "default",
  children,
}: {
  width?: keyof typeof measures;
  children: ReactNode;
}) {
  return (
    <div className={`mx-auto flex w-full flex-col gap-[var(--stack)] ${measures[width]}`}>
      {children}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-[var(--muted-2)]">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1.5 text-[clamp(24px,3.4vw,30px)] font-semibold tracking-[-0.04em]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1.5 max-w-[62ch] text-[14px] leading-relaxed text-[var(--muted)]">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <Cluster className="shrink-0">{actions}</Cluster>}
    </header>
  );
}

/* -------------------------------------------------------------- card grid */
/**
 * Cards size themselves: `auto-fit` plus a minimum column means four stat
 * cards become two, then one, with no breakpoint list to keep in sync. The
 * inner `min()` stops the minimum from overflowing a narrow phone.
 */
export function CardGrid({
  min = 232,
  children,
}: {
  min?: number;
  children: ReactNode;
}) {
  return (
    <div
      className="grid gap-[var(--gutter)]"
      style={{ gridTemplateColumns: `repeat(auto-fit, minmax(min(${min}px, 100%), 1fr))` }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ split */
/**
 * One ratio, one breakpoint, used by every page that has a supporting column.
 * `minmax(0,…)` on both tracks is what keeps a long unbroken string (an id, a
 * key hint) from widening the column instead of truncating.
 */
export function Split({
  aside,
  children,
}: {
  aside: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-[var(--gutter)] lg:grid-cols-[minmax(0,1.62fr)_minmax(0,1fr)]">
      <div className="flex min-w-0 flex-col gap-[var(--gutter)]">{children}</div>
      <div className="flex min-w-0 flex-col gap-[var(--gutter)]">{aside}</div>
    </div>
  );
}

/* ---------------------------------------------------------------- toolbar */
/** A row of form controls. Full-width stack on phones, aligned row above. */
export function Toolbar({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">{children}</div>
  );
}

/* ---------------------------------------------------------------- cluster */
export function Cluster({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`flex flex-wrap items-center gap-2 ${className}`}>{children}</div>;
}

/* ------------------------------------------------------------------ stack */
const gaps = { sm: "gap-2", md: "gap-4", lg: "gap-[var(--gutter)]" };

export function Stack({
  gap = "md",
  children,
  className = "",
}: {
  gap?: keyof typeof gaps;
  children: ReactNode;
  className?: string;
}) {
  return <div className={`flex flex-col ${gaps[gap]} ${className}`}>{children}</div>;
}
