import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, Clock3, Gift, RotateCcw, Search, Send } from "lucide-react";

export const metadata: Metadata = { title: "Rewards" };

const rewards = [
  { recipient: "Mariama Kamara", destination: "+232 76 ••• 184", campaign: "Weekend Coffee Boost", amount: "Le 75", status: "Paid", time: "Today, 9:12 AM" },
  { recipient: "Abdul Sesay", destination: "+232 79 ••• 301", campaign: "Bring a Friend", amount: "Le 120", status: "Paying", time: "Today, 8:44 AM" },
  { recipient: "Ibrahim Koroma", destination: "+232 77 ••• 908", campaign: "First Cup Free", amount: "Le 50", status: "Paid", time: "Yesterday" },
  { recipient: "Zainab Conteh", destination: "SLB ••• 0912", campaign: "Weekend Coffee Boost", amount: "Le 75", status: "Reversed", time: "31 Aug" },
  { recipient: "Hawa Bangura", destination: "+232 78 ••• 422", campaign: "Bring a Friend", amount: "Le 120", status: "Reserved", time: "30 Aug" },
];

const statusStyle: Record<string, string> = { Paid: "bg-[#eaf6ee] text-[#087a4f]", Paying: "bg-[#eaf2ff] text-[#3e679b]", Reversed: "bg-[#fff0e3] text-[#a65f27]", Reserved: "bg-[#f1ecff] text-[#6954a4]" };

export default function RewardsPage() {
  return (
    <div className="mx-auto max-w-[1320px]">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#849087]">Payouts</p><h1 className="mt-2 text-[30px] font-semibold tracking-[-0.045em] sm:text-4xl">Rewards</h1><p className="mt-2 text-sm text-[#6d7971]">See every reward from reservation through settlement.</p></div><button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#087a4f] px-4 text-sm font-bold text-white" type="button"><Send size={16} /> Send reward</button></div>

      <section className="mt-7 grid gap-4 sm:grid-cols-3">
        {[{ label: "Paid this month", value: "Le 8,940", meta: "91 rewards", icon: CheckCircle2, color: "bg-[#eaf6ee] text-[#087a4f]" }, { label: "Processing", value: "Le 780", meta: "7 rewards", icon: Clock3, color: "bg-[#eaf2ff] text-[#3e679b]" }, { label: "Reversed", value: "Le 225", meta: "3 rewards", icon: RotateCcw, color: "bg-[#fff0e3] text-[#a65f27]" }].map(({ label, value, meta, icon: Icon, color }) => <article key={label} className="rounded-2xl border border-[#dfe5df] bg-white p-5"><div className="flex items-start justify-between"><span className={`grid size-10 place-items-center rounded-xl ${color}`}><Icon size={18} /></span><span className="text-[10px] font-semibold text-[#8a958e]">{meta}</span></div><p className="mt-6 text-2xl font-semibold tracking-[-.04em]">{value}</p><p className="mt-1 text-xs text-[#758179]">{label}</p></article>)}
      </section>

      <section className="mt-4 overflow-hidden rounded-2xl border border-[#dfe5df] bg-white"><div className="flex flex-col gap-4 border-b border-[#e5eae6] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div><h2 className="text-base font-bold">Reward history</h2><p className="mt-1 text-xs text-[#7a867e]">All customer payouts</p></div><div className="flex gap-2"><label className="flex h-10 flex-1 items-center gap-2 rounded-lg border border-[#dbe2dc] bg-[#fbfcfb] px-3 sm:w-56"><Search size={15} className="text-[#849087]" /><input placeholder="Search recipient" className="min-w-0 flex-1 bg-transparent text-xs outline-none" /></label><select className="rounded-lg border border-[#dce3dd] bg-white px-3 text-xs font-semibold"><option>All statuses</option><option>Paid</option><option>Paying</option><option>Reserved</option></select></div></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] border-collapse text-left"><thead><tr className="border-b border-[#edf0ed] text-[10px] uppercase tracking-[.09em] text-[#8b958e]"><th className="px-6 py-3 font-bold">Recipient</th><th className="px-4 py-3 font-bold">Campaign</th><th className="px-4 py-3 font-bold">Amount</th><th className="px-4 py-3 font-bold">Status</th><th className="px-4 py-3 font-bold">Created</th><th className="px-6 py-3" /></tr></thead><tbody>{rewards.map((reward) => <tr key={`${reward.recipient}-${reward.time}`} className="border-b border-[#edf0ed] last:border-0 hover:bg-[#fbfcfb]"><td className="px-6 py-4"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-[#f0f4f0] text-[10px] font-bold">{reward.recipient.split(" ").map((word) => word[0]).join("")}</span><div><p className="text-xs font-bold">{reward.recipient}</p><p className="mt-1 text-[10px] text-[#89938c]">{reward.destination}</p></div></div></td><td className="px-4 py-4 text-xs font-medium">{reward.campaign}</td><td className="px-4 py-4 text-xs font-bold">{reward.amount}</td><td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${statusStyle[reward.status]}`}>{reward.status}</span></td><td className="px-4 py-4 text-[10px] text-[#7d8981]">{reward.time}</td><td className="px-6 py-4"><button className="grid size-8 place-items-center rounded-lg border border-[#dce3dd]" aria-label={`View reward for ${reward.recipient}`}><ArrowRight size={14} /></button></td></tr>)}</tbody></table></div></section>

      <div className="mt-4 flex items-start gap-3 rounded-xl border border-[#dfe5df] bg-white p-4 text-xs leading-5 text-[#657169]"><span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#f1ecff] text-[#6954a4]"><Gift size={16} /></span><p><strong className="text-[#27352c]">Reward statuses come from the CRAK ledger.</strong><br />Reserved and paying rewards should be treated as in-flight until the payment provider confirms the final state.</p></div>
    </div>
  );
}
