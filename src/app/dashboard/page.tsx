import { ArrowDownLeft, ArrowRight, ArrowUpRight, Banknote, Gift, Plus, TrendingUp, UsersRound, WalletCards } from "lucide-react";

const bars = [42, 58, 47, 72, 65, 83, 76, 93, 69, 88, 96, 84];
const activity = [
  { person: "Mariama Kamara", initials: "MK", action: "completed a referral", campaign: "Weekend Coffee Boost", value: "+Le 75", time: "12 min ago", tone: "bg-[#e8f6ed] text-[#087a4f]" },
  { person: "Abdul Sesay", initials: "AS", action: "received a reward", campaign: "Bring a Friend", value: "Le 120", time: "48 min ago", tone: "bg-[#fff0e3] text-[#a35e26]" },
  { person: "Zainab Conteh", initials: "ZC", action: "joined your campaign", campaign: "Weekend Coffee Boost", value: "Active", time: "2 hr ago", tone: "bg-[#f1ecff] text-[#6954a4]" },
  { person: "Ibrahim Koroma", initials: "IK", action: "completed a referral", campaign: "First Cup Free", value: "+Le 50", time: "Yesterday", tone: "bg-[#eaf2ff] text-[#3d679d]" },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-[1320px]">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#849087]">Thursday, 3 September</p><h1 className="mt-2 text-[30px] font-semibold tracking-[-0.045em] sm:text-4xl">Good morning, Mohamed.</h1><p className="mt-2 text-sm text-[#6d7971]">Here is what your referral engine is doing today.</p></div>
        <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#087a4f] px-4 text-sm font-bold text-white shadow-[0_8px_20px_rgba(8,122,79,.15)] transition hover:bg-[#075f40]" type="button"><Plus size={17} /> New campaign</button>
      </div>

      <section className="mt-7 grid gap-4 xl:grid-cols-[1.35fr_.65fr]">
        <div data-tour="wallet" className="relative overflow-hidden rounded-2xl bg-[#0b6847] p-6 text-white sm:p-7">
          <div className="dot-grid absolute inset-y-0 right-0 w-1/2 opacity-15" />
          <div className="relative flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            <div><span className="inline-flex items-center gap-2 text-xs font-semibold text-white/68"><WalletCards size={16} /> Available reward balance</span><p className="mt-5 text-[38px] font-semibold tracking-[-0.05em] sm:text-[46px]">Le 24,580.00</p><p className="mt-2 text-xs text-white/62">≈ USD 1,063.80 · Updated just now</p></div>
            <div className="flex gap-2"><button className="inline-flex h-10 items-center gap-2 rounded-lg bg-white px-4 text-xs font-bold text-[#075f40]" type="button"><ArrowDownLeft size={15} /> Fund wallet</button><button className="grid size-10 place-items-center rounded-lg border border-white/20 bg-white/10" aria-label="View wallet"><ArrowUpRight size={16} /></button></div>
          </div>
        </div>
        <div data-tour="campaigns" className="rounded-2xl border border-[#dfe5df] bg-white p-6">
          <div className="flex items-center justify-between"><span className="grid size-10 place-items-center rounded-xl bg-[#fff0e3] text-[#a85f24]"><TrendingUp size={19} /></span><span className="rounded-full bg-[#e9f6ed] px-2.5 py-1 text-[10px] font-bold text-[#087a4f]">+18.4%</span></div>
          <p className="mt-6 text-3xl font-semibold tracking-[-0.04em]">3 active</p><p className="mt-1 text-sm text-[#738078]">Referral campaigns</p>
          <button className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-[#087a4f]" type="button">Manage campaigns <ArrowRight size={14} /></button>
        </div>
      </section>

      <section className="mt-4 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total referrals", value: "246", delta: "+32 this month", icon: UsersRound, color: "bg-[#eaf6ee] text-[#087a4f]" },
          { label: "Rewards sent", value: "Le 8,940", delta: "91 successful", icon: Gift, color: "bg-[#f1ecff] text-[#6954a4]" },
          { label: "Pending rewards", value: "Le 1,250", delta: "12 need review", icon: Banknote, color: "bg-[#fff0e3] text-[#a85f24]" },
        ].map(({ label, value, delta, icon: Icon, color }) => (
          <article key={label} className="rounded-2xl border border-[#dfe5df] bg-white p-5"><span className={`grid size-9 place-items-center rounded-xl ${color}`}><Icon size={17} /></span><p className="mt-5 text-2xl font-semibold tracking-[-0.04em]">{value}</p><div className="mt-1 flex items-center justify-between gap-2"><p className="text-xs text-[#758179]">{label}</p><p className="text-[10px] font-semibold text-[#087a4f]">{delta}</p></div></article>
        ))}
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.05fr_.95fr]">
        <article className="rounded-2xl border border-[#dfe5df] bg-white p-5 sm:p-6">
          <div className="flex items-start justify-between"><div><h2 className="text-base font-bold">Referral performance</h2><p className="mt-1 text-xs text-[#7a867e]">Completed referrals over the last 12 weeks</p></div><select className="rounded-lg border border-[#dce3dd] bg-white px-3 py-2 text-xs font-semibold text-[#5e6b63]" defaultValue="12w"><option value="12w">12 weeks</option><option value="30d">30 days</option></select></div>
          <div className="mt-8 flex h-[190px] items-end gap-2 border-b border-[#e8ece8] px-1 sm:gap-3">
            {bars.map((height, index) => <div key={index} className="group relative flex h-full flex-1 items-end"><div className={`w-full rounded-t-[5px] transition group-hover:bg-[#075f40] ${index === 11 ? "bg-[#087a4f]" : "bg-[#c7e5d2]"}`} style={{ height: `${height}%` }} /></div>)}
          </div>
          <div className="mt-3 flex justify-between text-[9px] font-medium text-[#929d96]"><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span></div>
        </article>

        <article className="rounded-2xl border border-[#dfe5df] bg-white p-5 sm:p-6">
          <div className="flex items-start justify-between"><div><h2 className="text-base font-bold">Campaign health</h2><p className="mt-1 text-xs text-[#7a867e]">How your live campaigns compare</p></div><button className="text-xs font-bold text-[#087a4f]" type="button">View all</button></div>
          <div className="mt-6 space-y-5">
            {[
              ["Weekend Coffee Boost", "128 referrals", 88, "bg-[#087a4f]"],
              ["Bring a Friend", "74 referrals", 61, "bg-[#b9d86b]"],
              ["First Cup Free", "44 referrals", 39, "bg-[#bdb1e7]"],
            ].map(([name, meta, width, color]) => (
              <div key={name as string}><div className="mb-2 flex items-center justify-between"><div><p className="text-xs font-bold">{name}</p><p className="mt-0.5 text-[10px] text-[#869189]">{meta}</p></div><span className="text-xs font-bold">{width}%</span></div><div className="h-2 overflow-hidden rounded-full bg-[#eef2ee]"><div className={`h-full rounded-full ${color}`} style={{ width: `${width}%` }} /></div></div>
            ))}
          </div>
        </article>
      </section>

      <section data-tour="activity" className="mt-4 overflow-hidden rounded-2xl border border-[#dfe5df] bg-white">
        <div className="flex items-center justify-between border-b border-[#e5eae6] px-5 py-4 sm:px-6"><div><h2 className="text-base font-bold">Recent activity</h2><p className="mt-1 text-xs text-[#7a867e]">Your latest referrals and reward events</p></div><button className="inline-flex items-center gap-2 text-xs font-bold text-[#087a4f]" type="button">View all <ArrowRight size={14} /></button></div>
        <div className="divide-y divide-[#edf0ed]">
          {activity.map((item) => (
            <div key={`${item.person}-${item.action}`} className="flex items-center gap-3 px-5 py-4 sm:gap-4 sm:px-6">
              <span className={`grid size-9 shrink-0 place-items-center rounded-full text-[10px] font-bold ${item.tone}`}>{item.initials}</span>
              <div className="min-w-0 flex-1"><p className="truncate text-xs"><strong>{item.person}</strong> <span className="text-[#6f7b73]">{item.action}</span></p><p className="mt-1 truncate text-[10px] text-[#929c95]">{item.campaign} · {item.time}</p></div>
              <span className="shrink-0 rounded-full bg-[#f4f7f4] px-2.5 py-1 text-[10px] font-bold text-[#526057]">{item.value}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
