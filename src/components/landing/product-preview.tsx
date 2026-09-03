import { ArrowUpRight, Banknote, Check, Gift, UsersRound } from "lucide-react";

const activity = [
  { name: "Mariama K.", detail: "Referred a new customer", value: "+Le 75", tone: "bg-[#e8f6ed]" },
  { name: "Abdul S.", detail: "Reward paid", value: "Le 120", tone: "bg-[#fff0e3]" },
  { name: "Fatmata J.", detail: "Joined Weekend Boost", value: "Active", tone: "bg-[#f1ecff]" },
];

export function ProductPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[560px]" aria-label="CRAK dashboard preview">
      <div className="absolute -inset-8 -z-10 rounded-full bg-[#dff4e5] blur-3xl" />
      <div className="overflow-hidden rounded-[22px] border border-[#d5dfd7] bg-white shadow-[0_30px_80px_rgba(28,68,46,0.16)]">
        <div className="flex items-center justify-between border-b border-[#e5ebe6] px-5 py-4">
          <div><p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#7b8980]">Good morning</p><p className="mt-1 text-sm font-bold">Freetown Coffee Co.</p></div>
          <span className="grid size-9 place-items-center rounded-full bg-[#e8f6ed] text-xs font-bold text-[#087a4f]">FC</span>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-[1.1fr_.9fr]">
          <div className="rounded-2xl bg-[#0b6b48] p-5 text-white">
            <div className="flex items-center justify-between text-xs text-white/70"><span>Reward wallet</span><Banknote size={17} /></div>
            <p className="mt-7 text-[28px] font-bold tracking-[-0.04em]">Le 24,580</p>
            <p className="mt-1 text-xs text-white/65">Available to reward customers</p>
            <button className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-bold text-[#075f40]">Fund wallet <ArrowUpRight size={14} /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-[#fff0e3] p-4"><UsersRound size={18} className="text-[#a85818]" /><p className="mt-5 text-xl font-bold">246</p><p className="text-[11px] text-[#715d4e]">Referrers</p></div>
            <div className="rounded-2xl bg-[#f1ecff] p-4"><Gift size={18} className="text-[#6850ad]" /><p className="mt-5 text-xl font-bold">91</p><p className="text-[11px] text-[#665d7f]">Rewards</p></div>
          </div>
        </div>
        <div className="px-5 pb-5">
          <div className="flex items-center justify-between"><p className="text-sm font-bold">Latest activity</p><span className="text-[11px] font-semibold text-[#087a4f]">View all</span></div>
          <div className="mt-3 divide-y divide-[#edf1ed] rounded-xl border border-[#e5ebe6] px-3">
            {activity.map((item) => (
              <div key={item.name} className="flex items-center gap-3 py-3">
                <span className={`grid size-8 shrink-0 place-items-center rounded-full ${item.tone}`}><Check size={14} /></span>
                <div className="min-w-0 flex-1"><p className="truncate text-xs font-bold">{item.name}</p><p className="truncate text-[10px] text-[#78847d]">{item.detail}</p></div>
                <span className="text-[11px] font-bold text-[#42604d]">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="absolute -bottom-7 -left-3 hidden rounded-2xl border border-[#dce4dd] bg-white p-3 shadow-xl sm:flex sm:items-center sm:gap-3">
        <span className="grid size-9 place-items-center rounded-full bg-[#dafa7b] text-[#075f40]"><Gift size={17} /></span>
        <div><p className="text-[10px] text-[#77827b]">Reward delivered</p><p className="text-xs font-bold">In under 10 seconds</p></div>
      </div>
    </div>
  );
}
