"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

/**
 * The one modal shell. Clicking the backdrop closes it; clicks inside do not.
 *
 * Layout is fixed here rather than per-dialog: the header stays put and only
 * the body scrolls, so a long form never pushes its own title off the screen.
 */
export function Dialog({
  title,
  description,
  onClose,
  children,
  wide,
}: {
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="anim-fade fixed inset-0 z-50 grid place-items-center bg-[var(--ink)]/45 p-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="crak-dialog-title"
        className={`flex max-h-[calc(100vh-2rem)] w-full flex-col overflow-hidden rounded-[var(--radius-lg)]
          bg-[var(--surface)] shadow-[var(--shadow-lg)] ${wide ? "max-w-2xl" : "max-w-md"}`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-[var(--line)] px-6 py-5">
          <div className="min-w-0">
            <h2 id="crak-dialog-title" className="text-[18px] font-semibold tracking-[-0.03em]">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-[13px] leading-relaxed text-[var(--muted)]">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-[var(--surface-2)]
              text-[var(--muted)] transition-colors hover:bg-[var(--line)] hover:text-[var(--ink)]"
            aria-label="Close dialog"
          >
            <X size={17} />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

/** Actions sit on a divider at the end of a dialog body, primary action first. */
export function DialogActions({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-6 flex flex-wrap gap-2 border-t border-[var(--line)] pt-5">{children}</div>
  );
}
