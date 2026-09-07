import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

/**
 * The one button on the marketing site.
 *
 * The reference design leans on a pill with a small circular arrow badge on the
 * right, so that badge is a prop rather than something each caller hand-rolls -
 * otherwise the spacing and the badge colour drift between sections.
 */

export type ButtonVariant = "primary" | "onBrand" | "outline" | "ghost" | "dark";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "group relative inline-flex select-none items-center justify-center gap-2 rounded-full font-semibold " +
  "no-underline transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)] " +
  "hover:-translate-y-0.5 active:translate-y-0 disabled:pointer-events-none disabled:opacity-60";

const variants: Record<ButtonVariant, string> = {
  // Green on white — the default on light sections.
  primary:
    "bg-[var(--brand-700)] text-white shadow-[var(--shadow)] hover:bg-[var(--brand-800)] " +
    "hover:shadow-[var(--shadow-lg)]",
  // White on the green hero/CTA, where a green button would disappear.
  onBrand:
    "bg-white text-[var(--ink)] shadow-[0_10px_30px_-12px_rgb(0_0_0/35%)] hover:bg-[var(--brand-50)]",
  outline:
    "border border-[var(--line)] bg-white text-[var(--ink)] hover:border-[var(--brand-300)] " +
    "hover:bg-[var(--surface-2)]",
  ghost: "text-[var(--ink)] hover:bg-[var(--surface-2)]",
  dark: "bg-[var(--brand-900)] text-white hover:bg-[var(--ink)]",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-[15px]",
};

const badgeTone: Record<ButtonVariant, string> = {
  primary: "bg-white/20 text-white",
  onBrand: "bg-[var(--brand-500)] text-white",
  outline: "bg-[var(--brand-500)] text-white",
  ghost: "bg-[var(--brand-100)] text-[var(--brand-800)]",
  dark: "bg-white/20 text-white",
};

type Shared = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** The small circular arrow the reference design puts inside the pill. */
  withArrow?: boolean;
  className?: string;
  children: ReactNode;
};

function inner(children: ReactNode, variant: ButtonVariant, withArrow: boolean, size: ButtonSize) {
  return (
    <>
      <span>{children}</span>
      {withArrow && (
        <span
          aria-hidden
          className={`grid shrink-0 place-items-center rounded-full transition-transform duration-300
            ease-[cubic-bezier(.22,1,.36,1)] group-hover:rotate-45 ${badgeTone[variant]} ${
              size === "sm" ? "size-5" : "size-6"
            }`}
        >
          <ArrowUpRight size={size === "sm" ? 11 : 13} strokeWidth={2.6} />
        </span>
      )}
    </>
  );
}

export function Button({
  variant = "primary",
  size = "md",
  withArrow = false,
  className = "",
  children,
  ...rest
}: Shared & Omit<ComponentProps<"button">, "className" | "children">) {
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${withArrow ? "pr-2" : ""} ${className}`}
      {...rest}
    >
      {inner(children, variant, withArrow, size)}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  withArrow = false,
  className = "",
  children,
  ...rest
}: Shared & { href: string } & Omit<ComponentProps<typeof Link>, "href" | "className" | "children">) {
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${withArrow ? "pr-2" : ""} ${className}`;
  const content = inner(children, variant, withArrow, size);

  // Next's Link does not handle hashes or external URLs any better than an
  // anchor, and an anchor keeps in-page nav from triggering a route change.
  if (href.startsWith("#") || href.startsWith("http")) {
    return (
      <a href={href} className={classes}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={classes} {...rest}>
      {content}
    </Link>
  );
}
