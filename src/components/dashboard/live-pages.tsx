"use client";

import { useAuth } from "@clerk/nextjs";
import {
  Check,
  Clipboard,
  ExternalLink,
  Gift,
  KeyRound,
  Plus,
  RefreshCw,
  Trash2,
  UserPlus,
  WalletCards as WalletIcon,
  X,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  crakApi,
  type ApiKey,
  type BusinessRole,
  type FundingIntent,
  type LedgerEntry,
  type Referral,
  type Reward,
  type Wallet,
} from "@/lib/crak-api";
import { useDashboardData } from "./dashboard-data-provider";

const inputClass =
  "mt-2 h-11 w-full rounded-lg border border-[#d9e1da] bg-white px-3 text-sm outline-none transition focus:border-[#087a4f] focus:ring-2 focus:ring-[#087a4f]/10";

function messageFrom(cause: unknown, fallback: string) {
  return cause instanceof Error ? cause.message : fallback;
}

function reference(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

function formatMinor(amount: number, currency: string) {
  return new Intl.NumberFormat("en-SL", {
    style: "currency",
    currency,
    currencyDisplay: "code",
  }).format(amount / 100);
}

function shortDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return <p className="px-6 py-10 text-center text-sm text-[#758179]">{children}</p>;
}

function InlineError({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="mt-4 rounded-xl bg-[#fff0ed] px-4 py-3 text-sm font-semibold text-[#a53c2c]">
      {children}
    </p>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#102219]/45 p-4 backdrop-blur-sm" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dashboard-modal-title"
        className="max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-5">
          <h2 id="dashboard-modal-title" className="text-xl font-bold">{title}</h2>
          <button type="button" onClick={onClose} className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#f1f4f1]" aria-label="Close dialog">
            <X size={17} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function WalletLiveView() {
  const { business } = useDashboardData();
  const { getToken } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [funding, setFunding] = useState<FundingIntent[]>([]);
  const [result, setResult] = useState<FundingIntent | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canWrite = business?.role !== "viewer";
  const load = useCallback(async () => {
    if (!business) return;
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Your session could not provide an API token.");
      const [nextWallet, statement, intents] = await Promise.all([
        crakApi.wallet(token, business.id),
        crakApi.walletStatement(token, business.id),
        crakApi.fundingIntents(token, business.id),
      ]);
      setWallet(nextWallet);
      setEntries(statement.items);
      setFunding(intents.items);
    } catch (cause) {
      setError(messageFrom(cause, "Unable to load wallet data."));
    } finally {
      setLoading(false);
    }
  }, [business, getToken]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    if (!business || !result || !["pending", "processing"].includes(result.status)) return;
    const timer = window.setTimeout(async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const updated = await crakApi.fundingIntent(token, business.id, result.id);
        setResult(updated);
        setFunding((current) => [updated, ...current.filter((item) => item.id !== updated.id)]);
        if (!["pending", "processing"].includes(updated.status)) await load();
      } catch {
        // The regular refresh action remains available if polling is interrupted.
      }
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [business, getToken, load, result]);

  async function fund(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!business) return;
    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Your session could not provide an API token.");
      const created = await crakApi.fundWallet(
        token,
        business.id,
        {
          amount: Math.round(Number(form.get("amount")) * 100),
          method: form.get("method") === "payment_link" ? "payment_link" : "ussd",
          reference: reference("fund"),
          customer_name: String(form.get("customerName") || "") || undefined,
        },
        crypto.randomUUID(),
      );
      setResult(created);
      setOpen(false);
      await load();
    } catch (cause) {
      setError(messageFrom(cause, "Unable to create the funding request."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-xs font-bold uppercase tracking-[.12em] text-[#849087]">Live wallet</p><h1 className="mt-2 text-3xl font-semibold">Wallet</h1></div>
        <div className="flex gap-2">
          <button type="button" onClick={() => void load()} className="btn-secondary" disabled={loading}><RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh</button>
          <button type="button" onClick={() => setOpen(true)} className="btn-primary" disabled={!canWrite || !wallet?.wallet_ready}><Plus size={16} /> Fund wallet</button>
        </div>
      </div>

      {error && <InlineError>{error}</InlineError>}
      {!wallet?.wallet_ready && !loading && <p className="mt-4 rounded-xl bg-[#fff8df] px-4 py-3 text-sm text-[#765e10]">The backend is still provisioning this wallet. Funding becomes available when its status is ready.</p>}

      <section className="mt-7 rounded-2xl bg-[#0b6847] p-6 text-white sm:p-7">
        <span className="grid size-11 place-items-center rounded-xl bg-white/12"><WalletIcon size={21} /></span>
        <p className="mt-5 text-xs text-white/65">Available balance</p>
        <p className="mt-2 text-4xl font-semibold">{wallet?.available.display ?? "—"}</p>
        <div className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
          <p>Allocated: <b>{wallet?.allocated.display ?? "—"}</b></p>
          <p>In flight: <b>{wallet?.in_flight.display ?? "—"}</b></p>
          <p>Total: <b>{wallet?.total.display ?? "—"}</b></p>
        </div>
      </section>

      {result && (
        <div className="mt-4 rounded-xl bg-[#eaf6ee] p-4 text-sm text-[#075f40]">
          <p className="font-bold">Funding request: {result.status.replaceAll("_", " ")}</p>
          {result.ussd_code && <p className="mt-1">Dial <b>{result.ussd_code}</b> to continue.</p>}
          {result.payment_url && <a href={result.payment_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 font-bold underline">Open secure payment <ExternalLink size={13} /></a>}
          {!result.ussd_code && !result.payment_url && <p className="mt-1">The backend is preparing payment details. This card updates automatically.</p>}
        </div>
      )}

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.35fr_.65fr]">
        <section className="overflow-hidden rounded-2xl border border-[#dfe5df] bg-white">
          <div className="border-b px-6 py-4 font-bold">Wallet statement</div>
          {entries.length ? entries.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between gap-5 border-b px-6 py-4 text-sm last:border-0">
              <div className="min-w-0"><p className="truncate font-semibold">{entry.transaction_id}</p><time className="mt-1 block text-xs text-[#758179]">{shortDate(entry.created_at)}</time></div>
              <span className="shrink-0 font-bold">{formatMinor(entry.amount, entry.currency)}</span>
            </div>
          )) : <EmptyState>{loading ? "Loading wallet activity…" : "No wallet activity yet."}</EmptyState>}
        </section>

        <section className="overflow-hidden rounded-2xl border border-[#dfe5df] bg-white">
          <div className="border-b px-6 py-4 font-bold">Funding requests</div>
          {funding.length ? funding.map((item) => (
            <div key={item.id} className="border-b px-6 py-4 text-sm last:border-0">
              <div className="flex justify-between gap-3"><b>{item.amount.display}</b><span className="text-xs font-bold text-[#68746d]">{item.status.replaceAll("_", " ")}</span></div>
              <time className="mt-1 block text-xs text-[#879189]">{shortDate(item.created_at)}</time>
            </div>
          )) : <EmptyState>{loading ? "Loading funding requests…" : "No funding requests yet."}</EmptyState>}
        </section>
      </div>

      {open && (
        <Modal title="Fund wallet" onClose={() => setOpen(false)}>
          <form onSubmit={fund}>
            <label className="mt-5 block text-xs font-bold">Amount ({business?.currency})<input required name="amount" min="0.01" step="0.01" type="number" className={inputClass} /></label>
            <label className="mt-4 block text-xs font-bold">Customer name (optional)<input name="customerName" maxLength={100} className={inputClass} /></label>
            <label className="mt-4 block text-xs font-bold">Payment method<select name="method" className={inputClass}><option value="ussd">USSD</option><option value="payment_link">Payment link</option></select></label>
            <div className="mt-6 flex gap-3"><button className="btn-primary" disabled={submitting}>{submitting ? "Creating…" : "Create request"}</button><button type="button" onClick={() => setOpen(false)} className="btn-secondary">Cancel</button></div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export function RewardsLiveView() {
  const { business } = useDashboardData();
  const { getToken } = useAuth();
  const [items, setItems] = useState<Reward[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [open, setOpen] = useState(false);
  const [destinationType, setDestinationType] = useState<"momo" | "bank">("momo");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeReferrals = referrals.filter((item) => item.status === "active");
  const canWrite = business?.role !== "viewer";

  const load = useCallback(async () => {
    if (!business) return;
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Your session could not provide an API token.");
      const [rewardsPage, referralsPage] = await Promise.all([
        crakApi.rewards(token, business.id),
        crakApi.referrals(token, business.id),
      ]);
      setItems(rewardsPage.items);
      setReferrals(referralsPage.items);
    } catch (cause) {
      setError(messageFrom(cause, "Unable to load rewards."));
    } finally {
      setLoading(false);
    }
  }, [business, getToken]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!business) return;
    const form = new FormData(event.currentTarget);
    const amount = String(form.get("amount") || "").trim();
    setSubmitting(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Your session could not provide an API token.");
      await crakApi.createReward(
        token,
        business.id,
        String(form.get("referralId")),
        {
          reference: reference("reward"),
          destination_type: destinationType,
          destination_provider_id: String(form.get("providerId")),
          destination_account: String(form.get("account")),
          recipient_name: String(form.get("recipientName") || "") || undefined,
          amount: amount ? Math.round(Number(amount) * 100) : undefined,
        },
        crypto.randomUUID(),
      );
      setOpen(false);
      await load();
    } catch (cause) {
      setError(messageFrom(cause, "Unable to create the reward."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-xs font-bold uppercase tracking-[.12em] text-[#849087]">Live payouts</p><h1 className="mt-2 text-3xl font-semibold">Rewards</h1></div>
        <button type="button" onClick={() => setOpen(true)} className="btn-primary" disabled={!canWrite || activeReferrals.length === 0}><Gift size={16} /> Create reward</button>
      </div>
      {error && <InlineError>{error}</InlineError>}
      {!loading && activeReferrals.length === 0 && <p className="mt-4 rounded-xl bg-[#fff8df] px-4 py-3 text-sm text-[#765e10]">Create or activate a referral campaign before issuing a reward.</p>}
      <section className="mt-7 overflow-hidden rounded-2xl border border-[#dfe5df] bg-white">
        {items.length ? items.map((item) => (
          <div key={item.id} className="flex flex-col gap-3 border-b px-6 py-4 text-sm last:border-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0"><p className="font-bold">{item.recipient_name ?? item.reference}</p><p className="mt-1 truncate text-xs text-[#758179]">{item.destination_account} · {item.destination_provider_id} · {shortDate(item.created_at)}</p></div>
            <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end"><b>{item.amount.display}</b><span className="rounded-full bg-[#f1f4f1] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide">{item.status}</span></div>
          </div>
        )) : <EmptyState>{loading ? "Loading rewards…" : "No rewards created yet."}</EmptyState>}
      </section>

      {open && (
        <Modal title="Create reward" onClose={() => setOpen(false)}>
          <form onSubmit={create}>
            <label className="mt-5 block text-xs font-bold">Campaign<select name="referralId" required className={inputClass}>{activeReferrals.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.balance.display}</option>)}</select></label>
            <label className="mt-4 block text-xs font-bold">Recipient name<input name="recipientName" maxLength={120} className={inputClass} /></label>
            <label className="mt-4 block text-xs font-bold">Destination type<select value={destinationType} onChange={(event) => setDestinationType(event.target.value as "momo" | "bank")} className={inputClass}><option value="momo">Mobile money</option><option value="bank">Bank account</option></select></label>
            <label className="mt-4 block text-xs font-bold">Provider<select name="providerId" className={inputClass}>{destinationType === "momo" ? <><option value="m17">Orange Money</option><option value="m18">Afrimoney</option></> : <><option value="slb001">Sierra Leone Commercial Bank</option><option value="slb004">Rokel Commercial Bank</option><option value="slb007">United Bank for Africa</option></>}</select></label>
            <label className="mt-4 block text-xs font-bold">{destinationType === "momo" ? "Phone number" : "Account number"}<input name="account" required minLength={3} maxLength={64} className={inputClass} /></label>
            <label className="mt-4 block text-xs font-bold">Amount ({business?.currency}, optional)<input name="amount" min="0.01" step="0.01" type="number" className={inputClass} /><span className="mt-1 block font-normal text-[#7b877f]">Leave blank to use the campaign default.</span></label>
            <div className="mt-6 flex gap-3"><button className="btn-primary" disabled={submitting}>{submitting ? "Creating…" : "Create reward"}</button><button type="button" onClick={() => setOpen(false)} className="btn-secondary">Cancel</button></div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export function ApiKeysLiveView() {
  const { business } = useDashboardData();
  const { getToken } = useAuth();
  const [items, setItems] = useState<ApiKey[]>([]);
  const [name, setName] = useState("");
  const [role, setRole] = useState<BusinessRole>("member");
  const [created, setCreated] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isAdmin = business?.role === "owner" || business?.role === "admin";

  const load = useCallback(async () => {
    if (!business || !isAdmin) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Your session could not provide an API token.");
      setItems(await crakApi.apiKeys(token, business.id));
    } catch (cause) {
      setError(messageFrom(cause, "Unable to load API keys."));
    } finally {
      setLoading(false);
    }
  }, [business, getToken, isAdmin]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!business || !name.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Your session could not provide an API token.");
      const key = await crakApi.createApiKey(token, business.id, { name: name.trim(), role });
      setCreated(key.key);
      setCopied(false);
      setName("");
      await load();
    } catch (cause) {
      setError(messageFrom(cause, "Unable to create the API key."));
    } finally {
      setSubmitting(false);
    }
  }

  async function revoke(apiKeyId: string) {
    if (!business) return;
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Your session could not provide an API token.");
      await crakApi.revokeApiKey(token, business.id, apiKeyId);
      await load();
    } catch (cause) {
      setError(messageFrom(cause, "Unable to revoke the API key."));
    }
  }

  async function copyCreatedKey() {
    if (!created) return;
    await navigator.clipboard.writeText(created);
    setCopied(true);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <p className="text-xs font-bold uppercase tracking-[.12em] text-[#849087]">Developers</p>
      <h1 className="mt-2 text-3xl font-semibold">API keys</h1>
      {!isAdmin ? (
        <p className="mt-7 rounded-xl bg-[#fff8df] px-4 py-3 text-sm text-[#765e10]">Only workspace owners and admins can manage API keys.</p>
      ) : (
        <>
          <form onSubmit={create} className="mt-7 grid gap-3 sm:grid-cols-[1fr_150px_auto]">
            <input value={name} onChange={(event) => setName(event.target.value)} required maxLength={120} placeholder="Key name" aria-label="API key name" className="h-11 rounded-lg border border-[#d9e1da] px-3 text-sm outline-none focus:border-[#087a4f]" />
            <select value={role} onChange={(event) => setRole(event.target.value as BusinessRole)} aria-label="API key role" className="h-11 rounded-lg border border-[#d9e1da] bg-white px-3 text-sm"><option value="viewer">Viewer</option><option value="member">Member</option><option value="admin">Admin</option></select>
            <button className="btn-primary" disabled={submitting}><Plus size={16} /> {submitting ? "Creating…" : "Create key"}</button>
          </form>
          {error && <InlineError>{error}</InlineError>}
          {created && (
            <div className="mt-4 rounded-xl bg-[#fff0e3] p-4 text-sm">
              <p className="font-bold">Copy this key now—it will not be shown again.</p>
              <div className="mt-3 flex items-center gap-2"><code className="min-w-0 flex-1 overflow-x-auto rounded-lg bg-white px-3 py-2 text-xs">{created}</code><button type="button" onClick={() => void copyCreatedKey()} className="btn-secondary">{copied ? <Check size={15} /> : <Clipboard size={15} />} {copied ? "Copied" : "Copy"}</button></div>
            </div>
          )}
          <section className="mt-4 overflow-hidden rounded-2xl border border-[#dfe5df] bg-white">
            {items.length ? items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 border-b px-5 py-4 text-sm last:border-0 sm:px-6">
                <KeyRound size={16} className="shrink-0 text-[#087a4f]" />
                <div className="min-w-0"><p className="truncate font-bold">{item.name}</p><p className="mt-1 font-mono text-xs text-[#758179]">{item.key_hint}</p></div>
                <span className="ml-auto hidden capitalize sm:block">{item.role}</span>
                <button type="button" onClick={() => void revoke(item.id)} disabled={Boolean(item.revoked_at)} className="grid size-9 shrink-0 place-items-center rounded-lg border border-[#e6d6d2] text-[#a53c2c] disabled:cursor-not-allowed disabled:opacity-35" aria-label={`Revoke ${item.name}`}><Trash2 size={15} /></button>
              </div>
            )) : <EmptyState>{loading ? "Loading API keys…" : "No API keys yet."}</EmptyState>}
          </section>
        </>
      )}
    </div>
  );
}

export function SettingsLiveView() {
  const { business, me } = useDashboardData();
  const { getToken } = useAuth();
  const [clerkUserId, setClerkUserId] = useState("");
  const [role, setRole] = useState<BusinessRole>("member");
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isAdmin = business?.role === "owner" || business?.role === "admin";

  async function addMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!business || !clerkUserId.trim()) return;
    setSubmitting(true);
    setError(null);
    setNotice(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Your session could not provide an API token.");
      await crakApi.addMember(token, business.id, { clerk_user_id: clerkUserId.trim(), role });
      setNotice("Member access was added successfully.");
      setClerkUserId("");
    } catch (cause) {
      setError(messageFrom(cause, "Unable to add this member."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <p className="text-xs font-bold uppercase tracking-[.12em] text-[#849087]">Workspace</p>
      <h1 className="mt-2 text-3xl font-semibold">Settings</h1>
      <section className="mt-7 rounded-2xl border border-[#dfe5df] bg-white p-6">
        <h2 className="font-bold">Business profile</h2>
        <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
          <div><dt className="text-[#758179]">Business</dt><dd className="mt-1 font-bold">{business?.name}</dd></div>
          <div><dt className="text-[#758179]">Workspace slug</dt><dd className="mt-1 font-bold">{business?.slug}</dd></div>
          <div><dt className="text-[#758179]">Currency</dt><dd className="mt-1 font-bold">{business?.currency}</dd></div>
          <div><dt className="text-[#758179]">Your role</dt><dd className="mt-1 font-bold capitalize">{business?.role}</dd></div>
          <div className="sm:col-span-2"><dt className="text-[#758179]">Signed-in account</dt><dd className="mt-1 font-bold">{me?.user.email ?? "No email supplied by Clerk"}</dd></div>
        </dl>
        <p className="mt-6 text-xs text-[#758179]">The current API exposes this profile as read-only, so the frontend does not offer unsupported editing controls.</p>
      </section>

      <section className="mt-4 rounded-2xl border border-[#dfe5df] bg-white p-6">
        <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-lg bg-[#eaf6ee] text-[#087a4f]"><UserPlus size={17} /></span><div><h2 className="font-bold">Add a team member</h2><p className="mt-0.5 text-xs text-[#758179]">They must sign in to CRAK once before being added.</p></div></div>
        {!isAdmin ? <p className="mt-5 text-sm text-[#765e10]">Only workspace owners and admins can add members.</p> : (
          <form onSubmit={addMember} className="mt-5 grid gap-3 sm:grid-cols-[1fr_150px_auto]">
            <input value={clerkUserId} onChange={(event) => setClerkUserId(event.target.value)} required minLength={3} maxLength={64} placeholder="Clerk user ID" aria-label="Clerk user ID" className="h-11 rounded-lg border border-[#d9e1da] px-3 text-sm outline-none focus:border-[#087a4f]" />
            <select value={role} onChange={(event) => setRole(event.target.value as BusinessRole)} aria-label="Member role" className="h-11 rounded-lg border border-[#d9e1da] bg-white px-3 text-sm"><option value="viewer">Viewer</option><option value="member">Member</option><option value="admin">Admin</option></select>
            <button className="btn-primary" disabled={submitting}>{submitting ? "Adding…" : "Add member"}</button>
          </form>
        )}
        {notice && <p className="mt-4 rounded-xl bg-[#eaf6ee] px-4 py-3 text-sm font-semibold text-[#075f40]">{notice}</p>}
        {error && <InlineError>{error}</InlineError>}
        <p className="mt-5 text-xs text-[#758179]">The backend can add members but does not currently expose a member-list or removal endpoint.</p>
      </section>
    </div>
  );
}
