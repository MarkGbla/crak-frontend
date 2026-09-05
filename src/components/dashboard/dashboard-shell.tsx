"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { Gift, Home, KeyRound, Menu, Settings, UsersRound, WalletCards, X } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { ProductTour } from "./product-tour";
import { useDashboardData } from "./dashboard-data-provider";

const navigation = [
  { label: "Overview", href: "/dashboard", icon: Home },
  { label: "Referrals", href: "/dashboard/referrals", icon: UsersRound },
  { label: "Rewards", href: "/dashboard/rewards", icon: Gift },
  { label: "Wallet", href: "/dashboard/wallet", icon: WalletCards },
] as const;

const secondary = [
  { label: "API keys", href: "/dashboard/api-keys", icon: KeyRound },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
] as const;

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { business, me, selectBusiness } = useDashboardData();
  const isActive = (href: string) => href === "/dashboard" ? pathname === href : pathname.startsWith(href);
  const initials = (business?.name ?? "CRAK").split(" ").map((word) => word[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-[#f6f8f5] text-[#17221b]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[244px] flex-col border-r border-[#dde4de] bg-white px-4 pb-5 pt-6 lg:flex">
        <div className="px-2"><BrandLogo /></div>
        <div data-tour="workspace" className="mt-7 flex items-center gap-3 rounded-xl border border-[#dfe6e0] p-3 text-left">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#e6f5eb] text-xs font-extrabold text-[#087a4f]">{initials}</span>
          <label className="min-w-0 flex-1"><span className="sr-only">Selected workspace</span><select value={business?.id ?? ""} onChange={(event) => selectBusiness(event.target.value)} className="block w-full truncate bg-transparent text-xs font-bold outline-none">{me?.businesses.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><span className="mt-0.5 block text-[10px] text-[#7b877f]">{business?.status ?? "Sign in to continue"}</span></label>
        </div>
        <nav className="mt-6 flex-1 space-y-1" aria-label="Dashboard navigation">
          {navigation.map(({ label, href, icon: Icon }) => (
            <Link key={href} href={href} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${isActive(href) ? "bg-[#eaf6ee] text-[#087a4f]" : "text-[#5e6a62] hover:bg-[#f4f7f4] hover:text-[#233229]"}`}>
              <Icon size={18} strokeWidth={2} /> {label}
            </Link>
          ))}
          <p className="px-3 pb-2 pt-7 text-[10px] font-bold uppercase tracking-[0.13em] text-[#9aa49d]">Workspace</p>
          {secondary.map(({ label, href, icon: Icon }) => (
            <Link key={href} href={href} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${isActive(href) ? "bg-[#eaf6ee] text-[#087a4f]" : "text-[#5e6a62] hover:bg-[#f4f7f4] hover:text-[#233229]"}`}>
              <Icon size={18} strokeWidth={2} /> {label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-[244px]">
        <header className="sticky top-0 z-20 flex h-[68px] items-center justify-between border-b border-[#dde4de] bg-white/92 px-4 backdrop-blur-xl sm:px-7 lg:px-9">
          <div className="flex items-center gap-3 lg:hidden"><button onClick={() => setMobileOpen(true)} className="grid size-10 place-items-center rounded-lg border border-[#dce3dd]" aria-label="Open dashboard navigation"><Menu size={19} /></button><BrandLogo /></div>
          <p className="hidden text-xs font-semibold text-[#78837c] lg:block">Business dashboard</p>
          <div className="flex items-center gap-2 sm:gap-3">
            <ProductTour />
            {me && <UserButton appearance={{ elements: { avatarBox: "size-10" } }} />}
          </div>
        </header>
        <main className="px-4 pb-24 pt-7 sm:px-7 lg:px-9 lg:pb-10">{children}</main>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-[#102219]/45 backdrop-blur-sm lg:hidden" onMouseDown={() => setMobileOpen(false)}>
          <aside className="flex h-full w-[284px] flex-col bg-white px-4 pb-5 pt-5 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between px-2"><BrandLogo /><button onClick={() => setMobileOpen(false)} className="grid size-9 place-items-center rounded-lg bg-[#f1f4f1]" aria-label="Close navigation"><X size={17} /></button></div>
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-[#dfe6e0] p-3"><span className="grid size-9 place-items-center rounded-lg bg-[#e6f5eb] text-xs font-extrabold text-[#087a4f]">{initials}</span><label className="min-w-0 flex-1"><span className="sr-only">Selected workspace</span><select value={business?.id ?? ""} onChange={(event) => selectBusiness(event.target.value)} className="w-full bg-transparent text-xs font-bold outline-none">{me?.businesses.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><span className="mt-0.5 block text-[10px] text-[#7b877f]">{business?.status ?? "Sign in to continue"}</span></label></div>
            <nav className="mt-5 flex-1 space-y-1" aria-label="Mobile menu">
              {[...navigation, ...secondary].map(({ label, href, icon: Icon }) => <Link key={href} href={href} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold ${isActive(href) ? "bg-[#eaf6ee] text-[#087a4f]" : "text-[#5e6a62]"}`}><Icon size={18} />{label}</Link>)}
            </nav>
          </aside>
        </div>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-[#dfe5e0] bg-white px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 lg:hidden" aria-label="Mobile dashboard navigation">
        {navigation.map(({ label, href, icon: Icon }) => (
          <Link key={href} href={href} className={`flex flex-col items-center gap-1 rounded-lg py-1 text-[10px] font-semibold ${isActive(href) ? "text-[#087a4f]" : "text-[#78847c]"}`}><Icon size={19} />{label}</Link>
        ))}
      </nav>
    </div>
  );
}
