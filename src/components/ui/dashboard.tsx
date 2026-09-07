import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

/**
 * The dashboard kit.
 *
 * A dashboard is scanned and operated, not read, so the craft here is
 * information design rather than typography: state is encoded in shape and
 * colour as well as in words, the summary is always above the detail, and
 * money is always tabular so columns of figures line up.
 *
 * Everything reads from the tokens in globals.css. No component here hard-codes
 * a hex, which is what keeps the dashboard and the marketing site looking like
 * one product.
 */

/* ------------------------------------------------------------------- panel */
export function Panel({
  title,
  description,
  actions,
  children,
  className = "",
  bodyClassName = "",
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section
      className={`overflow-hidden rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)] ${className}`}
    >
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] px-5 py-4">
          <div className="min-w-0">
            {title && <h2 className="text-[15px] font-semibold tracking-[-0.02em]">{title}</h2>}
            {description && <p className="mt-0.5 text-[12.5px] text-[var(--muted)]">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

/** The standard way out of a panel that shows only the first few rows. */
export function PanelLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-[var(--brand-700)]
        no-underline transition-colors hover:text-[var(--brand-800)]"
    >
      {children} <ArrowRight size={13} />
    </Link>
  );
}

/* ---------------------------------------------------------------- stat card */
export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "plain",
  loading = false,
}: {
  label: string;
  value: string;
  hint?: ReactNode;
  icon?: ReactNode;
  /** `brand` marks the one figure that matters most on the page. */
  tone?: "plain" | "brand";
  loading?: boolean;
}) {
  const brand = tone === "brand";
  return (
    <div
      className={`rounded-[var(--radius)] border p-5 transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)]
        ${
          brand
            ? "border-transparent bg-[linear-gradient(140deg,var(--brand-700),var(--brand-600))] text-white shadow-[var(--shadow)]"
            : "border-[var(--line)] bg-[var(--surface)] hover:border-[var(--brand-200)] hover:shadow-[var(--shadow)]"
        }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p
          className={`text-[11px] font-semibold uppercase tracking-[0.1em] ${
            brand ? "text-white/70" : "text-[var(--muted-2)]"
          }`}
        >
          {label}
        </p>
        {icon && (
          <span className={brand ? "text-white/70" : "text-[var(--brand-600)]"}>{icon}</span>
        )}
      </div>

      {loading ? (
        <Skeleton className="mt-3 h-8 w-32" />
      ) : (
        <p className="mt-2.5 text-[26px] font-semibold tracking-[-0.04em] tabular-nums">{value}</p>
      )}

      {hint && (
        <p className={`mt-1.5 text-[12px] ${brand ? "text-white/75" : "text-[var(--muted)]"}`}>
          {hint}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------- badge */
export type BadgeTone = "neutral" | "brand" | "ok" | "warn" | "danger" | "info";

const badgeTones: Record<BadgeTone, string> = {
  neutral: "bg-[var(--surface-2)] text-[var(--muted)] ring-[var(--line)]",
  brand: "bg-[var(--brand-50)] text-[var(--brand-800)] ring-[var(--brand-100)]",
  ok: "bg-[var(--ok-soft)] text-[var(--ok)] ring-[var(--brand-100)]",
  warn: "bg-[var(--warn-soft)] text-[var(--warn)] ring-[var(--warn-line)]",
  danger: "bg-[var(--danger-soft)] text-[var(--danger)] ring-[var(--danger-line)]",
  info: "bg-[var(--info-soft)] text-[var(--info)] ring-[var(--line)]",
};

export function Badge({
  children,
  tone = "neutral",
  dot = false,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  /** A leading dot, so status reads at a glance without reading the word. */
  dot?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px]
        font-semibold ring-1 ring-inset ${badgeTones[tone]}`}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

/** Every status string the API can return, mapped to a tone in one place. */
export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, BadgeTone> = {
    active: "ok",
    paid: "ok",
    completed: "ok",
    rewarded: "ok",
    awaiting_payment: "info",
    processing: "info",
    paying: "info",
    reserved: "info",
    pending: "warn",
    pending_review: "warn",
    pending_funds: "warn",
    provisioning: "warn",
    draft: "neutral",
    paused: "neutral",
    closed: "neutral",
    cancelled: "neutral",
    expired: "neutral",
    failed: "danger",
    rejected: "danger",
    reversed: "danger",
    provision_failed: "danger",
    suspended: "danger",
  };
  const tone: BadgeTone = map[status] ?? "neutral";

  return (
    <Badge tone={tone} dot>
      {status.replace(/_/g, " ")}
    </Badge>
  );
}

/* -------------------------------------------------------------- empty state */
export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon?: ReactNode;
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      {icon && (
        <span className="grid size-12 place-items-center rounded-[14px] bg-[var(--brand-50)] text-[var(--brand-600)]">
          {icon}
        </span>
      )}
      <p className="mt-4 text-[15px] font-semibold">{title}</p>
      {body && <p className="mt-1.5 max-w-[46ch] text-[13.5px] leading-relaxed text-[var(--muted)]">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* --------------------------------------------------------------- skeletons */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`block animate-pulse rounded-md bg-[var(--surface-2)] ${className}`}
    />
  );
}

export function RowSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex flex-col">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 border-b border-[var(--line)] px-5 py-4 last:border-0">
          <Skeleton className="size-9 shrink-0 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="mt-2 h-2.5 w-24" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------- rows */
export function Row({
  avatar,
  title,
  meta,
  right,
  className = "",
}: {
  avatar?: ReactNode;
  title: ReactNode;
  meta?: ReactNode;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center gap-3 border-b border-[var(--line)] px-5 py-3.5 transition-colors
        duration-200 last:border-0 hover:bg-[var(--surface-2)] ${className}`}
    >
      {avatar}
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14px] font-medium">{title}</div>
        {meta && <div className="mt-0.5 text-[12px] text-[var(--muted-2)]">{meta}</div>}
      </div>
      {right && <div className="flex shrink-0 items-center gap-3">{right}</div>}
    </div>
  );
}

export function Initials({ name }: { name: string }) {
  const letters = name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--brand-100)] text-[11px] font-bold text-[var(--brand-800)]">
      {letters || "?"}
    </span>
  );
}

/* ------------------------------------------------------------------ money */
export function Money({
  children,
  tone = "plain",
  size = "md",
}: {
  children: ReactNode;
  tone?: "plain" | "credit" | "debit";
  size?: "sm" | "md" | "lg";
}) {
  const tones = {
    plain: "text-[var(--ink)]",
    credit: "text-[var(--ok)]",
    debit: "text-[var(--danger)]",
  };
  const sizes = { sm: "text-[12.5px]", md: "text-[14px]", lg: "text-[22px]" };
  return (
    <span className={`font-semibold tabular-nums ${tones[tone]} ${sizes[size]}`}>{children}</span>
  );
}

/* ------------------------------------------------------------------ forms */
export function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-[12px] font-semibold text-[var(--ink-2)]">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-[11.5px] text-[var(--muted-2)]">{hint}</span>}
    </label>
  );
}

const controlClass =
  "mt-2 h-11 w-full rounded-[var(--radius-sm)] border border-[var(--line)] bg-white px-3 text-[14px] " +
  "outline-none transition-colors duration-200 placeholder:text-[var(--muted-2)] " +
  "focus:border-[var(--brand-500)] focus:ring-2 focus:ring-[var(--brand-100)] disabled:opacity-60";

export function Input(props: ComponentProps<"input">) {
  return <input {...props} className={`${controlClass} ${props.className ?? ""}`} />;
}

export function Select(props: ComponentProps<"select">) {
  return <select {...props} className={`${controlClass} ${props.className ?? ""}`} />;
}

/* ------------------------------------------------------------------ alerts */
export function Alert({
  tone = "danger",
  children,
}: {
  tone?: "danger" | "warn" | "info" | "ok";
  children: ReactNode;
}) {
  const tones = {
    danger: "bg-[var(--danger-soft)] text-[var(--danger)] border-[var(--danger-line)]",
    warn: "bg-[var(--warn-soft)] text-[var(--warn)] border-[var(--warn-line)]",
    info: "bg-[var(--info-soft)] text-[var(--info)] border-[var(--line)]",
    ok: "bg-[var(--ok-soft)] text-[var(--ok)] border-[var(--brand-100)]",
  };
  return (
    <p
      role={tone === "danger" ? "alert" : undefined}
      className={`rounded-[var(--radius-sm)] border px-4 py-3 text-[13.5px] font-medium ${tones[tone]}`}
    >
      {children}
    </p>
  );
}
