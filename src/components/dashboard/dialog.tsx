"use client";

import { X } from "lucide-react";

/** Shared modal shell. Clicking the backdrop closes it; clicks inside do not. */
export function Dialog({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#102219]/45 p-4 backdrop-blur-sm" onMouseDown={onClose}>
      <div role="dialog" aria-modal="true" className={`max-h-[calc(100vh-2rem)] w-full ${wide ? "max-w-2xl" : "max-w-md"} overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl`} onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4"><h2 className="text-xl font-bold">{title}</h2><button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-lg bg-[#f1f4f1]" aria-label="Close dialog"><X size={17} /></button></div>
        {children}
      </div>
    </div>
  );
}
