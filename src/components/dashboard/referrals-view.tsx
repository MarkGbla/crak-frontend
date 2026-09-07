"use client";

import { useAuth } from "@clerk/nextjs";
import { AlertTriangle, ArrowLeftRight, Plus, SlidersHorizontal, UsersRound } from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { crakApi, type Referral, type ReferralStatus, type RewardRules } from "@/lib/crak-api";
import { Button } from "@/components/ui/button";
import {
  Alert,
  Badge,
  EmptyState,
  Field,
  Input,
  Money,
  Panel,
  Row,
  RowSkeleton,
  Select,
  StatusBadge,
} from "@/components/ui/dashboard";
import { Cluster, Page, PageHeader } from "@/components/ui/layout";
import { useDashboardData } from "./dashboard-data-provider";
import { Dialog, DialogActions } from "./dialog";
import { RulesDialog } from "./rules-dialog";
import { messageFrom } from "./view-utils";

const ruleCount = (rules: RewardRules | undefined) => Object.keys(rules ?? {}).length;

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
    <Page width="wide">
      <PageHeader
        eyebrow="Live campaigns"
        title="Referrals"
        subtitle="Each campaign holds its own budget and decides what it pays for."
        actions={
          <Button size="sm" onClick={() => setCreateOpen(true)} disabled={!canWrite}>
            <Plus size={15} /> New campaign
          </Button>
        }
      />

      {error && <Alert>{error}</Alert>}

      <Panel title="Campaigns" description={`${items.length} total`}>
        {loading ? (
          <RowSkeleton rows={4} />
        ) : items.length ? (
          items.map((item) => (
            <Row
              key={item.id}
              avatar={
                <span className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-[var(--brand-50)] text-[var(--brand-700)]">
                  <UsersRound size={18} />
                </span>
              }
              title={
                <span className="flex flex-wrap items-center gap-2">
                  {item.name}
                  {!ruleCount(item.reward_rules) && (
                    <Badge tone="warn">
                      <AlertTriangle size={11} /> Pays nothing
                    </Badge>
                  )}
                </span>
              }
              meta={
                <>
                  <span className="font-mono">{item.code}</span>
                  <span className="mx-1.5 opacity-40">·</span>
                  {ruleCount(item.reward_rules)} rule
                  {ruleCount(item.reward_rules) === 1 ? "" : "s"}
                  {item.auto_reward === false && (
                    <>
                      <span className="mx-1.5 opacity-40">·</span>needs approval
                    </>
                  )}
                  {item.description && (
                    <span className="block truncate">{item.description}</span>
                  )}
                </>
              }
              right={
                <>
                  <div className="hidden text-right sm:block">
                    <Money size="sm">{item.balance.display}</Money>
                    <p className="mt-0.5 text-[11px] text-[var(--muted-2)]">allocated</p>
                  </div>
                  <Cluster>
                    {/* The status control is the badge: it shows state and changes it. */}
                    <label className="relative">
                      <span className="sr-only">Status for {item.name}</span>
                      <StatusBadge status={item.status} />
                      <select
                        value={item.status}
                        onChange={(event) =>
                          void updateStatus(item, event.target.value as ReferralStatus)
                        }
                        disabled={!canWrite}
                        className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
                      >
                        <option value="draft">Draft</option>
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                        <option value="closed">Closed</option>
                      </select>
                    </label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRulesReferral(item)}
                      disabled={business?.role !== "admin" && business?.role !== "owner"}
                      title="Set what this campaign pays for"
                    >
                      <SlidersHorizontal size={14} /> Rules
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFundsReferral(item)}
                      disabled={!canWrite}
                    >
                      <ArrowLeftRight size={14} /> Funds
                    </Button>
                  </Cluster>
                </>
              }
            />
          ))
        ) : (
          <EmptyState
            icon={<UsersRound size={20} />}
            title="No campaigns yet"
            body="A campaign is where you set a budget and decide what a referrer gets paid for."
            action={
              <Button size="sm" onClick={() => setCreateOpen(true)} disabled={!canWrite} withArrow>
                Create your first campaign
              </Button>
            }
          />
        )}
      </Panel>

      {createOpen && (
        <Dialog
          title="New campaign"
          description="Creates an active campaign you can fund and price straight away."
          onClose={() => setCreateOpen(false)}
        >
          <form onSubmit={create} className="flex flex-col gap-4">
            <Field label="Name">
              <Input required name="name" maxLength={160} placeholder="e.g. Summer referrals" />
            </Field>
            <Field label="Code" hint="Referrers share this code. It is stored uppercase.">
              <Input required name="code" minLength={2} maxLength={64} placeholder="SUMMER25" />
            </Field>
            <Field label="Description" hint="Optional.">
              <Input name="description" maxLength={500} />
            </Field>
            <Field label={`Default reward (${business?.currency})`}>
              <Input required min="0.01" step="0.01" name="reward" type="number" />
            </Field>
            <DialogActions>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating…" : "Create campaign"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      )}

      {fundsReferral && (
        <Dialog
          title="Move funds"
          description={`Campaign balance: ${fundsReferral.balance.display}`}
          onClose={() => setFundsReferral(null)}
        >
          <form onSubmit={moveFunds} className="flex flex-col gap-4">
            <Field label="Action">
              <Select name="direction">
                <option value="allocate">Allocate from wallet</option>
                <option value="release">Release to wallet</option>
              </Select>
            </Field>
            <Field label={`Amount (${business?.currency})`}>
              <Input required name="amount" min="0.01" step="0.01" type="number" />
            </Field>
            <Field label="Note" hint="Optional.">
              <Input name="note" maxLength={300} />
            </Field>
            <DialogActions>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving…" : "Move funds"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setFundsReferral(null)}>
                Cancel
              </Button>
            </DialogActions>
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
    </Page>
  );
}
