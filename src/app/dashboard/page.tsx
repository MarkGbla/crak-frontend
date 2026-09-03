"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Gift, WalletCards } from "lucide-react";
import { crakApi } from "@/lib/crak-api";
import type { Reward, Wallet } from "@/lib/crak-api";
import { useDashboardData } from "@/components/dashboard/dashboard-data-provider";

export default function DashboardPage() {
  const { business, me } = useDashboardData();
  const { getToken } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  useEffect(() => { if (!business) return; let active = true; void (async () => { const token = await getToken(); if (!token) return; const [nextWallet, nextRewards] = await Promise.all([crakApi.wallet(token, business.id), crakApi.rewards(token, business.id)]); if (active) { setWallet(nextWallet); setRewards(nextRewards.items); } })(); return () => { active = false; }; }, [business, getToken]);
  return <div className="mx-auto max-w-[1320px]"><p className="text-xs font-bold uppercase tracking-[.12em] text-[#849087]">Live workspace</p><h1 className="mt-2 text-3xl font-semibold tracking-[-.05em]">Welcome, {me?.user.email?.split("@")[0] ?? "there"}.</h1><p className="mt-2 text-sm text-[#6d7971]">Your real CRAK wallet and payout data.</p><section className="mt-7 grid gap-4 sm:grid-cols-2"><article className="rounded-2xl bg-[#0b6847] p-7 text-white"><WalletCards size={19} className="text-white/70" /><p className="mt-6 text-xs text-white/65">Available balance</p><p className="mt-2 text-4xl font-semibold">{wallet?.available.display ?? "Loading…"}</p><Link className="mt-6 inline-block text-xs font-bold text-[#dafa7b]" href="/dashboard/wallet">Open wallet →</Link></article><article className="rounded-2xl border border-[#dfe5df] bg-white p-7"><Gift size={19} className="text-[#087a4f]" /><p className="mt-6 text-xs text-[#758179]">Rewards recorded</p><p className="mt-2 text-4xl font-semibold">{rewards.length}</p><Link className="mt-6 inline-block text-xs font-bold text-[#087a4f]" href="/dashboard/rewards">View rewards →</Link></article></section><section className="mt-4 overflow-hidden rounded-2xl border border-[#dfe5df] bg-white"><div className="border-b border-[#e5eae6] px-6 py-4"><h2 className="font-bold">Recent rewards</h2></div>{rewards.length ? rewards.slice(0, 5).map((reward) => <div key={reward.id} className="flex justify-between border-b border-[#edf0ed] px-6 py-4 text-sm last:border-0"><span>{reward.recipient_name ?? reward.reference}</span><span className="font-bold">{reward.amount.display}</span></div>) : <p className="px-6 py-10 text-sm text-[#758179]">No rewards have been created yet.</p>}</section></div>;
}
