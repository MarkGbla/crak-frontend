"use client";

import { FormEvent, useMemo, useState } from "react";
import { ArrowUpRight, Check, Copy, MoreHorizontal, Plus, Search, UsersRound, X } from "lucide-react";

const seedCampaigns = [
  { name: "Weekend Coffee Boost", code: "WEEKEND25", status: "Active", referrals: 128, reward: "Le 75", budget: "Le 9,600", color: "bg-[#e7f5eb]" },
  { name: "Bring a Friend", code: "FRIEND120", status: "Active", referrals: 74, reward: "Le 120", budget: "Le 8,880", color: "bg-[#fff0e3]" },
  { name: "First Cup Free", code: "FIRSTCUP", status: "Paused", referrals: 44, reward: "Le 50", budget: "Le 2,200", color: "bg-[#f1ecff]" },
  { name: "Holiday Circle", code: "HOLIDAY", status: "Draft", referrals: 0, reward: "Le 100", budget: "Le 0", color: "bg-[#eaf2ff]" },
] as const;

export function ReferralsView() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [open, setOpen] = useState(false);
  const [created, setCreated] = useState<string | null>(null);
  const campaigns = useMemo(() => seedCampaigns.filter((item) => (filter === "All" || item.status === filter) && item.name.toLowerCase().includes(query.toLowerCase())), [filter, query]);

  function createCampaign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    setCreated(String(values.get("name")));
    setOpen(false);
  }

  return (
    <div className="mx-auto max-w-[1320px]">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#849087]">Campaigns</p><h1 className="mt-2 text-[30px] font-semibold tracking-[-0.045em] sm:text-4xl">Referrals</h1><p className="mt-2 text-sm text-[#6d7971]">Create and manage the offers your customers share.</p></div><button onClick={() => setOpen(true)} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#087a4f] px-4 text-sm font-bold text-white" type="button"><Plus size={17} /> New campaign</button></div>

      {created && <div className="mt-6 flex items-center gap-3 rounded-xl border border-[#bcd9c6] bg-[#eaf6ee] p-4 text-sm text-[#075f40]"><span className="grid size-7 place-items-center rounded-full bg-[#087a4f] text-white"><Check size={15} /></span><span><strong>{created}</strong> was created in this preview.</span><button className="ml-auto" onClick={() => setCreated(null)} aria-label="Dismiss"><X size={16} /></button></div>}

      <section className="mt-7 overflow-hidden rounded-2xl border border-[#dfe5df] bg-white">
        <div className="flex flex-col gap-4 border-b border-[#e5eae6] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex gap-1 overflow-x-auto">{["All", "Active", "Paused", "Draft"].map((item) => <button key={item} onClick={() => setFilter(item)} className={`rounded-lg px-3 py-2 text-xs font-bold ${filter === item ? "bg-[#eaf6ee] text-[#087a4f]" : "text-[#6f7b73] hover:bg-[#f5f7f5]"}`} type="button">{item}</button>)}</div>
          <label className="flex h-10 items-center gap-2 rounded-lg border border-[#dbe2dc] bg-[#fbfcfb] px-3 sm:w-64"><Search size={15} className="text-[#849087]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search campaigns" className="min-w-0 flex-1 bg-transparent text-xs outline-none" /></label>
        </div>
        <div className="divide-y divide-[#edf0ed]">
          {campaigns.map((item) => (
            <div key={item.code} className="grid gap-4 px-4 py-5 transition hover:bg-[#fbfcfb] sm:grid-cols-[1.4fr_.65fr_.65fr_.65fr_auto] sm:items-center sm:px-6">
              <div className="flex items-center gap-3"><span className={`grid size-10 shrink-0 place-items-center rounded-xl ${item.color}`}><UsersRound size={18} /></span><div><p className="text-sm font-bold">{item.name}</p><button className="mt-1 inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#7b877f]" type="button">{item.code} <Copy size={11} /></button></div></div>
              <div><p className="text-[10px] uppercase tracking-[.08em] text-[#8b958e] sm:hidden">Referrals</p><p className="text-sm font-bold">{item.referrals}</p><p className="text-[10px] text-[#8b958e]">referrals</p></div>
              <div><p className="text-sm font-bold">{item.reward}</p><p className="text-[10px] text-[#8b958e]">per reward</p></div>
              <div><span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${item.status === "Active" ? "bg-[#eaf6ee] text-[#087a4f]" : item.status === "Paused" ? "bg-[#fff0e3] text-[#a65f27]" : "bg-[#eef1ee] text-[#69766e]"}`}>{item.status}</span><p className="mt-1 text-[10px] text-[#8b958e]">{item.budget} used</p></div>
              <button className="grid size-9 place-items-center rounded-lg border border-[#dce3dd] text-[#6e7b72]" aria-label={`Actions for ${item.name}`}><MoreHorizontal size={17} /></button>
            </div>
          ))}
          {campaigns.length === 0 && <div className="px-6 py-16 text-center"><Search className="mx-auto text-[#9aa49d]" /><p className="mt-3 text-sm font-bold">No campaigns found</p><p className="mt-1 text-xs text-[#7a867e]">Try another search or filter.</p></div>}
        </div>
      </section>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#102219]/45 p-4 backdrop-blur-sm" role="presentation" onMouseDown={() => setOpen(false)}>
          <div role="dialog" aria-modal="true" aria-labelledby="campaign-dialog-title" className="w-full max-w-lg rounded-[22px] bg-white p-6 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#087a4f]">New referral campaign</p><h2 id="campaign-dialog-title" className="mt-2 text-2xl font-semibold tracking-[-.04em]">Create something worth sharing</h2></div><button onClick={() => setOpen(false)} className="grid size-9 place-items-center rounded-lg bg-[#f2f5f2]" aria-label="Close"><X size={17} /></button></div>
            <form className="mt-6 space-y-4" onSubmit={createCampaign}>
              <label className="block text-xs font-bold">Campaign name<input name="name" required placeholder="e.g. September Coffee Circle" className="mt-2 h-11 w-full rounded-lg border border-[#d9e1da] px-3 text-sm font-normal outline-none focus:border-[#087a4f]" /></label>
              <div className="grid gap-4 sm:grid-cols-2"><label className="block text-xs font-bold">Campaign code<input name="code" required placeholder="SEPTEMBER" className="mt-2 h-11 w-full rounded-lg border border-[#d9e1da] px-3 text-sm font-normal uppercase outline-none focus:border-[#087a4f]" /></label><label className="block text-xs font-bold">Reward amount<input name="reward" required type="number" placeholder="75.00" className="mt-2 h-11 w-full rounded-lg border border-[#d9e1da] px-3 text-sm font-normal outline-none focus:border-[#087a4f]" /></label></div>
              <label className="block text-xs font-bold">Description<textarea name="description" rows={3} placeholder="Tell your team what this campaign is for" className="mt-2 w-full resize-none rounded-lg border border-[#d9e1da] p-3 text-sm font-normal outline-none focus:border-[#087a4f]" /></label>
              <div className="flex gap-3 pt-2"><button type="button" onClick={() => setOpen(false)} className="btn-secondary flex-1">Cancel</button><button type="submit" className="btn-primary flex-1">Create campaign <ArrowUpRight size={16} /></button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
