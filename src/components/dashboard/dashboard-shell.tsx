"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { UserButton } from "@clerk/nextjs";
import {
  ChevronsUpDown,
  Gift,
  Home,
  KeyRound,
  Menu,
  Settings,
  UsersRound,
  WalletCards,
  X,
} from "lucide-react";
import { Cluster } from "@/components/ui/layout";
import { ProductTour } from "./product-tour";
import { useDashboardData } from "./dashboard-data-provider";

const PRIMARY = [
  { label: "Overview", href: "/dashboard", icon: Home },
  { label: "Referrals", href: "/dashboard/referrals", icon: UsersRound },
  { label: "Rewards", href: "/dashboard/rewards", icon: Gift },
  { label: "Wallet", href: "/dashboard/wallet", icon: WalletCards },
] as const;

const SECONDARY = [
  { label: "API keys", href: "/dashboard/api-keys", icon: KeyRound },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
] as const;

function Mark() {
  return (
    <Link href="/" aria-label="CRAK home" className="flex items-center gap-2.5 no-underline">
      <span className="grid size-8 place-items-center rounded-[10px] bg-[var(--brand-700)]">
        <span className="block size-3 rotate-45 rounded-[2px] border-[2.5px] border-white" />
      </span>
      <span className="text-[19px] font-bold tracking-[-0.05em] text-[var(--ink)]">CRAK</span>
    </Link>
  );
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  onClick,
}: {
  href: string;
  label: string;
  icon: typeof Home;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`relative flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13.5px]
        font-medium no-underline transition-all duration-200 ease-[cubic-bezier(.22,1,.36,1)]
        ${
          active
            ? "bg-[var(--brand-50)] text-[var(--brand-800)]"
            : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
        }`}
    >
      {/* The active rail reads before the label does. */}
      <span
        aria-hidden
        className={`absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[var(--brand-600)]
          transition-opacity duration-200 ${active ? "opacity-100" : "opacity-0"}`}
      />
      <Icon size={17} strokeWidth={2} className={active ? "text-[var(--brand-700)]" : ""} />
      {label}
    </Link>
  );
}

function WorkspacePicker() {
  const { business, me, selectBusiness } = useDashboardData();
  const initials = (business?.name ?? "CRAK")
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      data-tour="workspace"
      className="flex items-center gap-3 rounded-[12px] border border-[var(--line)] bg-[var(--surface)]
        p-2.5 transition-colors duration-200 hover:border-[var(--brand-200)]"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-[var(--brand-100)] text-[11px] font-bold text-[var(--brand-800)]">
        {initials}
      </span>
      <label className="min-w-0 flex-1">
        <span className="sr-only">Selected workspace</span>
        <select
          value={business?.id ?? ""}
          onChange={(event) => selectBusiness(event.target.value)}
          className="block w-full cursor-pointer truncate bg-transparent text-[13px] font-semibold outline-none"
        >
          {me?.businesses.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <span className="mt-0.5 block truncate text-[11px] capitalize text-[var(--muted-2)]">
          {business?.status ?? "Sign in to continue"}
        </span>
      </label>
      <ChevronsUpDown size={14} className="shrink-0 text-[var(--muted-2)]" />
    </div>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // The drawer belongs to the route it was opened on: when the path changes it
  // is closed by derivation, with no effect reaching back in to set state.
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const mobileOpen = openedOn === pathname;
  const closeDrawer = () => setOpenedOn(null);
  const { me } = useDashboardData();

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  // Stop the page scrolling behind the open drawer.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const nav = (onClick?: () => void) => (
    <>
      {PRIMARY.map((item) => (
        <NavLink key={item.href} {...item} active={isActive(item.href)} onClick={onClick} />
      ))}
      <p className="px-3 pb-1.5 pt-6 text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--muted-2)]">
        Workspace
      </p>
      {SECONDARY.map((item) => (
        <NavLink key={item.href} {...item} active={isActive(item.href)} onClick={onClick} />
      ))}
    </>
  );

  return (
    /* The frame is a two-track grid, not a fixed rail plus a matching page
       inset. The old form stated the rail width twice — once as a width and
       once as padding — which is a class of bug waiting to happen, and it gave
       the rail no scroll region of its own. Here the rail is a real track that
       sticks for the height of the viewport and scrolls its own nav. */
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--ink)] lg:grid lg:grid-cols-[var(--rail)_minmax(0,1fr)]">
      <aside className="sticky top-0 z-30 hidden h-screen flex-col border-r border-[var(--line)] bg-[var(--sidebar)] lg:flex">
        <div className="shrink-0 px-5 pt-6">
          <Mark />
          <div className="mt-6">
            <WorkspacePicker />
          </div>
        </div>
        {/* Only the nav scrolls, so the workspace picker and the help card stay
            put however long the nav grows. */}
        <nav className="flex-1 overflow-y-auto px-4 py-6" aria-label="Dashboard">
          <div className="flex flex-col gap-0.5">{nav()}</div>
        </nav>
        <div className="shrink-0 px-4 pb-5">
          <div className="rounded-[12px] bg-[var(--brand-50)] p-3.5">
            <p className="text-[12px] font-semibold text-[var(--brand-800)]">Need a hand?</p>
            <p className="mt-1 text-[11.5px] leading-snug text-[var(--muted)]">
              The integration guides cover JavaScript, PHP and Go.
            </p>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-20 flex h-[var(--topbar)] shrink-0 items-center justify-between gap-3 border-b border-[var(--line)] bg-[var(--surface)]/88 px-[var(--page-x)] backdrop-blur-xl">
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setOpenedOn(pathname)}
              className="grid size-10 place-items-center rounded-[10px] border border-[var(--line)] transition-colors hover:bg-[var(--surface-2)]"
              aria-label="Open navigation"
            >
              <Menu size={18} />
            </button>
            <Mark />
          </div>
          <p className="hidden text-[12.5px] font-medium text-[var(--muted)] lg:block">
            Business dashboard
          </p>
          <Cluster className="shrink-0">
            <ProductTour />
            {me && <UserButton appearance={{ elements: { avatarBox: "size-9" } }} />}
          </Cluster>
        </header>

        {/* pb accounts for the mobile bottom nav, which floats over the page. */}
        <main className="flex-1 px-[var(--page-x)] pb-28 pt-[var(--stack)] lg:pb-14">
          {children}
        </main>
      </div>

      {mobileOpen && (
        <div
          className="anim-fade fixed inset-0 z-50 bg-[var(--ink)]/45 backdrop-blur-sm lg:hidden"
          onMouseDown={closeDrawer}
        >
          <aside
            className="flex h-full w-[288px] flex-col bg-[var(--sidebar)] px-4 pb-5 pt-5 shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between px-1">
              <Mark />
              <button
                onClick={closeDrawer}
                className="grid size-9 place-items-center rounded-[10px] bg-[var(--surface-2)]"
                aria-label="Close navigation"
              >
                <X size={16} />
              </button>
            </div>
            <div className="mt-5">
              <WorkspacePicker />
            </div>
            <nav className="mt-5 flex flex-1 flex-col gap-0.5 overflow-y-auto" aria-label="Menu">
              {nav(closeDrawer)}
            </nav>
          </aside>
        </div>
      )}

      <nav
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-[var(--line)]
          bg-[var(--surface)] px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 lg:hidden"
        aria-label="Dashboard"
      >
        {PRIMARY.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center gap-1 rounded-[10px] py-1.5 text-[10px] font-semibold
                no-underline transition-colors duration-200 ${
                  active ? "text-[var(--brand-700)]" : "text-[var(--muted-2)]"
                }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
