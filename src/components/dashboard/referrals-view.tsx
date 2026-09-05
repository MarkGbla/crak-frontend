"use client";

import { useAuth } from "@clerk/nextjs";
import { AlertTriangle, ArrowLeftRight, Plus, SlidersHorizontal, UsersRound, X } from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { crakApi, type Referral, type ReferralStatus, type RewardRules } from "@/lib/crak-api";
import { useDashboardData } from "./dashboard-data-provider";
import {
  emptyRow,
  NoRulesNotice,
  parseRulesJson,
  RulesEditor,
  RuleWarnings,
  rowsToRules,
  rulesPlaceholder,
  rulesToRows,
  type RuleRow,
} from "./rules-editor";

const ruleCount = (rules: RewardRules | undefined) => Object.keys(rules ?? {}).length;

const fieldClass = "mt-2 h-11 w-full rounded-lg border border-[#d9e1da] bg-white px-3 text-sm outline-none focus:border-[#087a4f]";

function messageFrom(cause: unknown, fallback: string) {
  return cause instanceof Error ? cause.message : fallback;
}

export function ReferralsView() {
  const { business } = useDashboardData();
  const { getToken } = useAuth();
  const [items, setItems] = useState<Referral[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [fundsReferral, setFundsReferral] = useState<Referral | null>(null);
  const [rulesReferral, setRulesReferral] = useState<Referral | null>(null);
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
      setItems((await crakApi.referrals(token, business.id)).items);
    } catch (cause) {
      setError(messageFrom(cause, "Unable to load referral campaigns."));
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
    setSubmitting(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Your session could not provide an API token.");
      await crakApi.createReferral(token, business.id, {
        name: String(form.get("name")),
        code: String(form.get("code")).trim().toUpperCase(),
        description: String(form.get("description") || "") || undefined,
        default_reward_amount: Math.round(Number(form.get("reward")) * 100),
        activate: true,
      });
      setCreateOpen(false);
      await load();
    } catch (cause) {
      setError(messageFrom(cause, "Unable to create the campaign."));
    } finally {
      setSubmitting(false);
    }
  }

  async function updateStatus(item: Referral, status: ReferralStatus) {
    if (!business || item.status === status) return;
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Your session could not provide an API token.");
      const updated = await crakApi.updateReferralStatus(token, business.id, item.id, status);
      setItems((current) => current.map((entry) => entry.id === item.id ? updated : entry));
    } catch (cause) {
      setError(messageFrom(cause, "Unable to update campaign status."));
    }
  }

  async function moveFunds(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!business || !fundsReferral) return;
    const form = new FormData(event.currentTarget);
    const direction = form.get("direction") === "release" ? "release" : "allocate";
    const payload = {
      amount: Math.round(Number(form.get("amount")) * 100),
      reference: `${direction}_${crypto.randomUUID()}`,
      note: String(form.get("note") || "") || undefined,
    };
    setSubmitting(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Your session could not provide an API token.");
      const idempotencyKey = crypto.randomUUID();
      if (direction === "release") await crakApi.release(token, business.id, fundsReferral.id, payload, idempotencyKey);
      else await crakApi.allocate(token, business.id, fundsReferral.id, payload, idempotencyKey);
      setFundsReferral(null);
      await load();
    } catch (cause) {
      setError(messageFrom(cause, `Unable to ${direction} campaign funds.`));
    } finally {
      setSubmitting(false);
    }
  }

  async function saveRules(referral: Referral, rules: RewardRules, autoReward: boolean) {
    if (!business) throw new Error("No business selected.");
    const token = await getToken();
    if (!token) throw new Error("Your session could not provide an API token.");
    const result = await crakApi.setRules(token, business.id, referral.id, {
      reward_rules: rules,
      auto_reward: autoReward,
    });
    setItems((current) =>
      current.map((entry) =>
        entry.id === referral.id
          ? { ...entry, reward_rules: result.reward_rules, auto_reward: result.auto_reward }
          : entry,
      ),
    );
    return result.warnings;
  }

  return (
    <div className="mx-auto max-w-[1320px]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-xs font-bold uppercase tracking-[.12em] text-[#849087]">Live campaigns</p><h1 className="mt-2 text-3xl font-semibold tracking-[-.05em]">Referrals</h1></div>
        <button type="button" onClick={() => setCreateOpen(true)} className="btn-primary" disabled={!canWrite}><Plus size={16} /> New campaign</button>
      </div>

      {error && <p role="alert" className="mt-4 rounded-xl bg-[#fff0ed] px-4 py-3 text-sm font-semibold text-[#a53c2c]">{error}</p>}

      <section className="mt-7 overflow-hidden rounded-2xl border border-[#dfe5df] bg-white">
        {items.length ? items.map((item) => (
          <div key={item.id} className="flex flex-col gap-4 border-b border-[#edf0ed] px-5 py-5 last:border-0 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex min-w-0 gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#eaf6ee] text-[#087a4f]"><UsersRound size={18} /></span>
              <div className="min-w-0">
                <p className="flex items-center gap-2 truncate font-bold">{item.name}
                  {!ruleCount(item.reward_rules) && <span className="inline-flex items-center gap-1 rounded-full bg-[#fdf0dc] px-2 py-0.5 text-[10px] font-bold text-[#8a5b16]" title="No rules, so this campaign cannot pay anyone"><AlertTriangle size={11} /> Pays nothing</span>}
                </p>
                <p className="mt-1 text-xs text-[#78847c]">{item.code} · {item.balance.display} allocated · {ruleCount(item.reward_rules)} rule{ruleCount(item.reward_rules) === 1 ? "" : "s"}{item.auto_reward === false && " · needs approval"}</p>
                {item.description && <p className="mt-1 truncate text-xs text-[#929b95]">{item.description}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select value={item.status} onChange={(event) => void updateStatus(item, event.target.value as ReferralStatus)} disabled={!canWrite} aria-label={`Status for ${item.name}`} className="h-9 rounded-lg border border-[#d9e1da] bg-white px-2 text-xs font-bold capitalize disabled:opacity-60">
                <option value="draft">Draft</option><option value="active">Active</option><option value="paused">Paused</option><option value="closed">Closed</option>
              </select>
              <button type="button" onClick={() => setRulesReferral(item)} disabled={business?.role !== "admin" && business?.role !== "owner"} title="Set what this campaign pays for" className="btn-secondary h-9 px-3 text-xs"><SlidersHorizontal size={14} /> Rules</button>
              <button type="button" onClick={() => setFundsReferral(item)} disabled={!canWrite} className="btn-secondary h-9 px-3 text-xs"><ArrowLeftRight size={14} /> Funds</button>
            </div>
          </div>
        )) : <p className="px-6 py-12 text-center text-sm text-[#758179]">{loading ? "Loading campaigns…" : "No campaigns yet."}</p>}
      </section>

      {createOpen && (
        <Dialog title="New campaign" onClose={() => setCreateOpen(false)}>
          <form onSubmit={create}>
            <label className="mt-5 block text-xs font-bold">Name<input required name="name" maxLength={160} className={fieldClass} /></label>
            <label className="mt-4 block text-xs font-bold">Code<input required name="code" minLength={2} maxLength={64} className={fieldClass} /></label>
            <label className="mt-4 block text-xs font-bold">Description (optional)<input name="description" maxLength={500} className={fieldClass} /></label>
            <label className="mt-4 block text-xs font-bold">Default reward ({business?.currency})<input required min="0.01" step="0.01" name="reward" type="number" className={fieldClass} /></label>
            <div className="mt-6 flex gap-3"><button className="btn-primary" disabled={submitting}>{submitting ? "Creating…" : "Create campaign"}</button><button className="btn-secondary" type="button" onClick={() => setCreateOpen(false)}>Cancel</button></div>
          </form>
        </Dialog>
      )}

      {fundsReferral && (
        <Dialog title={`Manage ${fundsReferral.name} funds`} onClose={() => setFundsReferral(null)}>
          <p className="mt-3 text-sm text-[#758179]">Campaign balance: <b className="text-[#17221b]">{fundsReferral.balance.display}</b></p>
          <form onSubmit={moveFunds}>
            <label className="mt-5 block text-xs font-bold">Action<select name="direction" className={fieldClass}><option value="allocate">Allocate from wallet</option><option value="release">Release to wallet</option></select></label>
            <label className="mt-4 block text-xs font-bold">Amount ({business?.currency})<input required name="amount" min="0.01" step="0.01" type="number" className={fieldClass} /></label>
            <label className="mt-4 block text-xs font-bold">Note (optional)<input name="note" maxLength={300} className={fieldClass} /></label>
            <div className="mt-6 flex gap-3"><button className="btn-primary" disabled={submitting}>{submitting ? "Saving…" : "Move funds"}</button><button type="button" onClick={() => setFundsReferral(null)} className="btn-secondary">Cancel</button></div>
          </form>
        </Dialog>
      )}
      {rulesReferral && (
        <RulesDialog
          referral={rulesReferral}
          currency={business?.currency ?? "SLE"}
          onClose={() => setRulesReferral(null)}
          onSave={(rules, autoReward) => saveRules(rulesReferral, rules, autoReward)}
        />
      )}
    </div>
  );
}

function RulesDialog({
  referral,
  currency,
  onClose,
  onSave,
}: {
  referral: Referral;
  currency: string;
  onClose: () => void;
  onSave: (rules: RewardRules, autoReward: boolean) => Promise<string[]>;
}) {
  const initial = rulesToRows(referral.reward_rules ?? {});
  const [rows, setRows] = useState<RuleRow[]>(initial.rows.length ? initial.rows : [emptyRow()]);
  // A rule these controls cannot represent opens in JSON rather than being
  // silently simplified into something that pays a different amount.
  const [jsonMode, setJsonMode] = useState(!initial.supported);
  const [json, setJson] = useState(JSON.stringify(referral.reward_rules ?? {}, null, 2));
  const [autoReward, setAutoReward] = useState(referral.auto_reward !== false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[] | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setWarnings(null);
    try {
      const rules = jsonMode ? parseRulesJson(json) : rowsToRules(rows);
      const result = await onSave(rules, autoReward);
      setWarnings(result);
      if (!result.length) onClose();
    } catch (cause) {
      setError(messageFrom(cause, "Unable to save these rules."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog title={`Rules for ${referral.name}`} onClose={onClose} wide>
      <p className="mt-3 text-sm leading-6 text-[#758179]">
        A price list for this campaign. Your app tells CRAK <b>what happened</b>; these
        rules decide <b>what it pays</b>. Change them any time — no code changes needed.
      </p>

      {!Object.keys(referral.reward_rules ?? {}).length && <NoRulesNotice />}

      <form onSubmit={submit}>
        {jsonMode ? (
          <>
            <label className="mt-5 block text-xs font-bold">
              Rules (JSON)
              <textarea
                value={json}
                onChange={(event) => setJson(event.target.value)}
                spellCheck={false}
                rows={14}
                className="mt-2 w-full rounded-lg border border-[#d9e1da] bg-white p-3 font-mono text-xs outline-none focus:border-[#087a4f]"
                placeholder={rulesPlaceholder}
              />
            </label>
            {!initial.supported && (
              <p className="mt-2 text-[11px] text-[#8a5b16]">
                These rules use a condition the simple editor cannot show, so they are
                shown as JSON to avoid changing what they pay.
              </p>
            )}
          </>
        ) : (
          <RulesEditor rows={rows} onChange={setRows} currency={currency} disabled={saving} />
        )}

        <label className="mt-5 flex items-start gap-3 rounded-xl bg-[#f7faf8] p-4 text-xs leading-5">
          <input
            type="checkbox"
            checked={!autoReward}
            onChange={(event) => setAutoReward(!event.target.checked)}
            className="mt-0.5 size-4"
          />
          <span>
            <b>Review each reward before paying.</b>
            <span className="mt-1 block text-[#758179]">
              Conversions wait for your approval instead of paying straight away. Useful
              for a new campaign, or after a run of suspicious activity.
            </span>
          </span>
        </label>

        {error && <p role="alert" className="mt-4 rounded-xl bg-[#fff0ed] px-4 py-3 text-sm font-semibold text-[#a53c2c]">{error}</p>}
        {warnings && <RuleWarnings warnings={warnings} />}

        <div className="mt-6 flex flex-wrap gap-3">
          <button className="btn-primary" disabled={saving}>{saving ? "Saving…" : "Save rules"}</button>
          <button type="button" onClick={onClose} className="btn-secondary">{warnings?.length ? "Done" : "Cancel"}</button>
          <button
            type="button"
            onClick={() => {
              // Keep whatever is on screen when switching views.
              if (jsonMode) {
                try {
                  const parsed = rulesToRows(parseRulesJson(json));
                  setRows(parsed.rows.length ? parsed.rows : [emptyRow()]);
                  if (!parsed.supported) { setError("Those rules are too detailed for the simple editor."); return; }
                  setError(null);
                  setJsonMode(false);
                } catch (cause) { setError(messageFrom(cause, "Fix the JSON first.")); }
              } else {
                try {
                  setJson(JSON.stringify(rowsToRules(rows), null, 2));
                  setError(null);
                  setJsonMode(true);
                } catch (cause) { setError(messageFrom(cause, "Fix the rules first.")); }
              }
            }}
            className="btn-secondary ml-auto text-xs"
          >
            {jsonMode ? "Simple editor" : "Advanced (JSON)"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

function Dialog({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#102219]/45 p-4 backdrop-blur-sm" onMouseDown={onClose}>
      <div role="dialog" aria-modal="true" className={`max-h-[calc(100vh-2rem)] w-full ${wide ? "max-w-2xl" : "max-w-md"} overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl`} onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4"><h2 className="text-xl font-bold">{title}</h2><button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-lg bg-[#f1f4f1]" aria-label="Close dialog"><X size={17} /></button></div>
        {children}
      </div>
    </div>
  );
}
