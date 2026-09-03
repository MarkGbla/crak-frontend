"use client";

import { FormEvent, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Check, Copy, CreditCard, Landmark, Phone, Plus, X } from "lucide-react";
import { AnimatedAmount } from "@/components/animated-amount";

const transactions = [
  { title: "Wallet top-up", ref: "FUND-00941", date: "Today, 9:42 AM", amount: "+Le 5,000", direction: "in" },
  { title: "Weekend Coffee Boost", ref: "ALLOC-00218", date: "Yesterday, 4:18 PM", amount: "−Le 1,500", direction: "out" },
  { title: "Reward reversal", ref: "REWARD-8812", date: "1 Sep, 2:06 PM", amount: "+Le 75", direction: "in" },
  { title: "Bring a Friend", ref: "ALLOC-00211", date: "31 Aug, 11:29 AM", amount: "−Le 2,400", direction: "out" },
];

export function WalletView() {
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<"ussd" | "payment_link">("ussd");
  const [code, setCode] = useState<string | null>(null);

  function createFunding(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOpen(false);
    setCode(method === "ussd" ? "*889*4*24580#" : "https://pay.crak.app/f/fc-29481");
  }

  return (
    <div className="mx-auto max-w-[1320px]">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#849087]">Money</p><h1 className="mt-2 text-[30px] font-semibold tracking-[-0.045em] sm:text-4xl">Wallet</h1><p className="mt-2 text-sm text-[#6d7971]">Fund rewards and follow every movement in your business wallet.</p></div><button onClick={() => setOpen(true)} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#087a4f] px-4 text-sm font-bold text-white" type="button"><Plus size={17} /> Fund wallet</button></div>

      {code && <div className="mt-6 flex flex-col gap-3 rounded-xl border border-[#bcd9c6] bg-[#eaf6ee] p-4 text-sm text-[#075f40] sm:flex-row sm:items-center"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#087a4f] text-white"><Check size={15} /></span><div><strong>Funding request created.</strong><p className="mt-0.5 text-xs">{method === "ussd" ? "Dial this code before it expires:" : "Share or open this secure payment link:"}</p></div><code className="rounded-lg bg-white px-3 py-2 text-xs font-bold sm:ml-auto">{code}</code><button aria-label="Copy funding instruction"><Copy size={16} /></button><button onClick={() => setCode(null)} aria-label="Dismiss"><X size={16} /></button></div>}

      <section className="mt-7 grid gap-4 xl:grid-cols-[1.1fr_.9fr]">
        <div className="relative min-h-[260px] overflow-hidden rounded-2xl bg-[#0b6847] p-6 text-white sm:p-8"><div className="dot-grid absolute inset-y-0 right-0 w-1/2 opacity-15" /><div className="relative"><div className="flex items-center justify-between"><p className="text-sm font-semibold text-white/72">Available balance</p><span className="rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-bold">SLE wallet</span></div><p className="mt-7 text-4xl font-semibold tracking-[-.05em] sm:text-5xl"><AnimatedAmount value={24580} fractionDigits={2} /></p><p className="mt-2 text-xs text-white/60">Ready for campaign allocations and customer rewards</p><div className="mt-8 flex gap-6 text-xs"><div><p className="text-white/55">Allocated</p><p className="mt-1.5 font-bold">Le 12,300</p></div><div><p className="text-white/55">In flight</p><p className="mt-1.5 font-bold">Le 1,250</p></div><div><p className="text-white/55">Total</p><p className="mt-1.5 font-bold">Le 38,130</p></div></div></div></div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1"><article className="rounded-2xl border border-[#dfe5df] bg-white p-5"><span className="grid size-10 place-items-center rounded-xl bg-[#eaf6ee] text-[#087a4f]"><ArrowDownLeft size={18} /></span><p className="mt-6 text-2xl font-semibold tracking-[-.04em]">Le 18,500</p><p className="mt-1 text-xs text-[#758179]">Funded this month</p></article><article className="rounded-2xl border border-[#dfe5df] bg-white p-5"><span className="grid size-10 place-items-center rounded-xl bg-[#fff0e3] text-[#a65f27]"><ArrowUpRight size={18} /></span><p className="mt-6 text-2xl font-semibold tracking-[-.04em]">Le 9,840</p><p className="mt-1 text-xs text-[#758179]">Allocated this month</p></article></div>
      </section>

      <section className="mt-4 overflow-hidden rounded-2xl border border-[#dfe5df] bg-white"><div className="flex items-center justify-between border-b border-[#e5eae6] px-5 py-4 sm:px-6"><div><h2 className="text-base font-bold">Wallet statement</h2><p className="mt-1 text-xs text-[#7a867e]">Newest entries first</p></div><select className="rounded-lg border border-[#dce3dd] bg-white px-3 py-2 text-xs font-semibold"><option>All activity</option><option>Money in</option><option>Money out</option></select></div><div className="divide-y divide-[#edf0ed]">{transactions.map((item) => <div key={item.ref} className="flex items-center gap-3 px-5 py-4 sm:gap-4 sm:px-6"><span className={`grid size-9 shrink-0 place-items-center rounded-full ${item.direction === "in" ? "bg-[#eaf6ee] text-[#087a4f]" : "bg-[#fff0e3] text-[#a65f27]"}`}>{item.direction === "in" ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}</span><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold">{item.title}</p><p className="mt-1 truncate text-[10px] text-[#8b958e]">{item.ref} · {item.date}</p></div><p className={`text-xs font-bold ${item.direction === "in" ? "text-[#087a4f]" : "text-[#28362d]"}`}>{item.amount}</p></div>)}</div></section>

      {open && <div className="fixed inset-0 z-50 grid place-items-center bg-[#102219]/45 p-4 backdrop-blur-sm" onMouseDown={() => setOpen(false)}><div role="dialog" aria-modal="true" className="w-full max-w-md rounded-[22px] bg-white p-6 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}><div className="flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#087a4f]">Add money</p><h2 className="mt-2 text-2xl font-semibold tracking-[-.04em]">Fund your reward wallet</h2></div><button onClick={() => setOpen(false)} className="grid size-9 place-items-center rounded-lg bg-[#f2f5f2]" aria-label="Close"><X size={17} /></button></div><form onSubmit={createFunding} className="mt-6"><label className="block text-xs font-bold">Amount (SLE)<div className="mt-2 flex h-12 items-center rounded-lg border border-[#d9e1da] px-3"><span className="text-sm font-bold text-[#7b877f]">Le</span><input required type="number" min="1" placeholder="5,000.00" className="min-w-0 flex-1 px-2 text-sm outline-none" /></div></label><p className="mt-5 text-xs font-bold">How would you like to pay?</p><div className="mt-2 grid grid-cols-2 gap-3"><button type="button" onClick={() => setMethod("ussd")} className={`rounded-xl border p-4 text-left ${method === "ussd" ? "border-[#087a4f] bg-[#eaf6ee]" : "border-[#dce3dd]"}`}><Phone size={19} /><span className="mt-4 block text-xs font-bold">USSD code</span><span className="mt-1 block text-[10px] text-[#748078]">Pay from your phone</span></button><button type="button" onClick={() => setMethod("payment_link")} className={`rounded-xl border p-4 text-left ${method === "payment_link" ? "border-[#087a4f] bg-[#eaf6ee]" : "border-[#dce3dd]"}`}><CreditCard size={19} /><span className="mt-4 block text-xs font-bold">Payment link</span><span className="mt-1 block text-[10px] text-[#748078]">Open secure checkout</span></button></div><div className="mt-5 rounded-xl bg-[#f4f7f4] p-3 text-[11px] leading-5 text-[#657168]"><Landmark size={15} className="mb-1" />Funds appear after the payment provider confirms settlement.</div><button className="btn-primary mt-5 w-full" type="submit">Create funding request</button></form></div></div>}
    </div>
  );
}
